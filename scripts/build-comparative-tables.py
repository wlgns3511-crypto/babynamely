#!/usr/bin/env python3
"""Build auxiliary tables for Layer 1 comparative facts.

Adds two tables to names.db:
  - year_totals(year, gender, total)        — for "total babies" estimates
  - name_year_rank(slug, year, rank)        — per-year rank within gender

Idempotent: drops + recreates these tables. Run after refresh-ssa-2009-2024.py.

Usage: python3 scripts/build-comparative-tables.py
"""
import sqlite3
import time
from collections import defaultdict
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent
DB_PATH = PROJECT / "data" / "names.db"
SSA_DIR = Path("/tmp/ssa_names")


def main():
    if not DB_PATH.exists():
        raise SystemExit(f"DB not found at {DB_PATH}")
    if not SSA_DIR.exists():
        raise SystemExit(f"SSA archive not found at {SSA_DIR}")

    conn = sqlite3.connect(str(DB_PATH))
    c = conn.cursor()

    # ── year_totals from raw SSA files ──
    print("Computing year_totals from SSA archive…")
    year_totals = defaultdict(lambda: {"M": 0, "F": 0})
    for path in sorted(SSA_DIR.glob("yob*.txt")):
        try:
            year = int(path.stem.replace("yob", ""))
        except ValueError:
            continue
        with open(path) as f:
            for line in f:
                parts = line.strip().split(",")
                if len(parts) != 3:
                    continue
                _, sex, count = parts
                try:
                    year_totals[year][sex] += int(count)
                except ValueError:
                    continue

    c.execute("DROP TABLE IF EXISTS year_totals")
    c.execute("""
        CREATE TABLE year_totals (
            year   INTEGER NOT NULL,
            gender TEXT    NOT NULL,
            total  INTEGER NOT NULL,
            PRIMARY KEY (year, gender)
        )
    """)
    rows = []
    for year, sexes in year_totals.items():
        if sexes["M"]:
            rows.append((year, "boy", sexes["M"]))
        if sexes["F"]:
            rows.append((year, "girl", sexes["F"]))
    c.executemany("INSERT INTO year_totals (year, gender, total) VALUES (?,?,?)", rows)
    print(f"  Inserted {len(rows):,} year_totals rows")

    # ── name_year_rank: per-year rank within gender ──
    # popularity.pct stores max(boy, girl) per (slug, year), so we filter by
    # names.gender to get the dominant-gender rank. Borderline ambiguous names
    # (Casey, Jordan, …) have small inaccuracies but the dominant gender wins
    # for >99% of rows.
    print("\nComputing name_year_rank…")
    c.execute("DROP TABLE IF EXISTS name_year_rank")
    c.execute("""
        CREATE TABLE name_year_rank (
            slug   TEXT    NOT NULL,
            year   INTEGER NOT NULL,
            rank   INTEGER NOT NULL,
            PRIMARY KEY (slug, year)
        )
    """)
    c.execute("CREATE INDEX idx_nyr_year ON name_year_rank(year)")

    # Use window function — group by (year, gender), order by pct DESC
    t0 = time.time()
    c.execute("""
        INSERT INTO name_year_rank (slug, year, rank)
        SELECT slug, year, rk FROM (
            SELECT n.slug AS slug,
                   p.year AS year,
                   ROW_NUMBER() OVER (
                       PARTITION BY p.year, n.gender
                       ORDER BY p.pct DESC, n.slug ASC
                   ) AS rk
            FROM popularity p
            INNER JOIN names n ON n.slug = p.slug
        )
    """)
    n_rank = c.execute("SELECT COUNT(*) FROM name_year_rank").fetchone()[0]
    print(f"  Inserted {n_rank:,} rank rows in {time.time()-t0:.1f}s")

    conn.commit()

    # Spot check
    print("\nSpot check ranks:")
    for slug, year in [("liam", 2024), ("olivia", 2024), ("emma", 2024),
                        ("liam", 2010), ("mary", 1880), ("james", 1880)]:
        row = c.execute(
            "SELECT name, gender, rank FROM names n "
            "JOIN name_year_rank r ON n.slug = r.slug "
            "WHERE n.slug = ? AND r.year = ?",
            (slug, year),
        ).fetchone()
        if row:
            print(f"  {row[0]:<12} {row[1]:<5} rank in {year} = #{row[2]}")

    conn.close()
    print("\n✓ Done")


if __name__ == "__main__":
    main()
