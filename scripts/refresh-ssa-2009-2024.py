#!/usr/bin/env python3
"""Refresh SSA popularity data for 2009-2024.

Existing data covers 1880-2008 (244K rows). This script appends 16 more years
from official SSA national-level archive (yob{year}.txt format: name,sex,count).

Source: SSA names.zip (recovered from Wayback Machine 2026-01-01 capture
because Akamai blocks direct ssa.gov downloads from non-US IPs).

Logic mirrors original build-db.py exactly:
  - For each (slug, year): take max(boy_pct, girl_pct) into popularity table
  - For new slugs: gender = primary (whichever sex had higher pct on first appearance)
  - pct = count / total_births_for_that_sex_for_that_year (decimal, e.g. 0.0091)

After import, recomputes peak_year/peak_pct/total_records on the names table
for ALL names (existing aggregates are stale because they only saw ≤2008 data).

Usage:
    python3 scripts/refresh-ssa-2009-2024.py [--source-dir /tmp/ssa_names]
"""
import argparse
import csv
import os
import shutil
import sqlite3
import sys
import time
from collections import defaultdict
from datetime import datetime
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent
DB_PATH = PROJECT / "data" / "names.db"
DEFAULT_SOURCE = Path("/tmp/ssa_names")
START_YEAR = 2009
END_YEAR = 2024  # 2025 data drops mid-May 2026

# Quality filter for NEW slugs (those not already in the 6,782 existing names).
# SSA includes every name with ≥5 occurrences/year — that pulls in tens of
# thousands of one-shot rare names that would all be soft-404 / scaled-content
# pages. Existing names get fresh data unconditionally; new names must clear
# BOTH bars (sustained AND non-trivial) to be admitted.
#
# Profiling 2009-2024 of slugs not already in the existing 6,782:
#   peak ≥0.5% (top ~50)         0 new — all big names already in DB
#   peak ≥0.1% (top ~700)        18  (Thiago, Everly, Arya, Juniper, Freya, …)
#   peak ≥0.05% (top ~1500)      81
#   peak ≥0.01% (top ~5000)      897
#   peak <0.01% (long tail)      56,554  ← these are the soft-404 risk
# Adding (peak ≥0.01% AND ≥8 years) admits ~886 sustained genuine names.
# Total: 6,782 → ~7,668. Still small enough to ship as static pages, plus all
# admits are real names you'd find in a baby-name encyclopedia.
NEW_NAME_MIN_YEARS = 8        # appears in ≥half (8/16) of the new years, AND
NEW_NAME_MIN_PEAK_PCT = 1e-4  # peak ≥0.01% of births (~170/yr)


def slugify(name: str) -> str:
    return name.lower().strip()


def read_year_file(path: Path):
    """Yield (name, sex, count) from yobYYYY.txt. Format: name,sex,count."""
    with open(path, newline="") as f:
        for row in csv.reader(f):
            if len(row) != 3:
                continue
            name, sex, count = row[0].strip(), row[1].strip(), row[2].strip()
            try:
                yield name, sex, int(count)
            except ValueError:
                continue


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if not DB_PATH.exists():
        print(f"ERROR: DB not found at {DB_PATH}")
        sys.exit(1)
    if not args.source_dir.exists():
        print(f"ERROR: source dir not found at {args.source_dir}")
        sys.exit(1)

    # Backup
    if not args.dry_run:
        backup = DB_PATH.with_suffix(f".db.bak.{int(time.time())}")
        shutil.copy(DB_PATH, backup)
        print(f"Backup: {backup}")

    conn = sqlite3.connect(str(DB_PATH))
    c = conn.cursor()

    # Load existing slug → gender (preserve gender for slugs already in DB)
    existing_gender = dict(c.execute("SELECT slug, gender FROM names").fetchall())
    print(f"Existing names in DB: {len(existing_gender):,}")

    # ── Pass 1: collect ALL (slug, year, pct, gender) into memory ──
    # We need full corpus stats before deciding whether new slugs clear the
    # quality bar.
    candidates = defaultdict(dict)  # slug -> {year: (pct, name, gender)}

    for year in range(START_YEAR, END_YEAR + 1):
        path = args.source_dir / f"yob{year}.txt"
        if not path.exists():
            print(f"  WARN: {path} missing — skipping")
            continue

        total_M = 0
        total_F = 0
        rows_for_year = []
        for name, sex, count in read_year_file(path):
            rows_for_year.append((name, sex, count))
            if sex == "M":
                total_M += count
            elif sex == "F":
                total_F += count

        # Per (slug, year): keep max(pct) across genders, remember which won.
        per_slug_year = {}
        for name, sex, count in rows_for_year:
            slug = slugify(name)
            denom = total_M if sex == "M" else total_F if sex == "F" else 0
            if denom == 0:
                continue
            pct = count / denom
            mapped_gender = "boy" if sex == "M" else "girl"
            cur = per_slug_year.get(slug)
            if cur is None or pct > cur[0]:
                per_slug_year[slug] = (pct, name, mapped_gender)

        for slug, (pct, name, gender) in per_slug_year.items():
            candidates[slug][year] = (pct, name, gender)

        print(f"  {year}: {len(per_slug_year):,} slugs (M_total={total_M:,}, F_total={total_F:,})")

    # ── Pass 2: filter new slugs by quality, then insert ──
    rows_inserted = 0
    new_names_added = 0
    new_names_rejected = 0
    skipped_existing = 0

    for slug, year_map in candidates.items():
        is_new = slug not in existing_gender
        if is_new:
            # Quality bar for new names only
            years_present = len(year_map)
            peak_pct = max(p for p, _, _ in year_map.values())
            # AND rule: must be both sustained AND non-trivial
            if years_present < NEW_NAME_MIN_YEARS or peak_pct < NEW_NAME_MIN_PEAK_PCT:
                new_names_rejected += 1
                continue

            # Determine canonical name + primary gender (gender from year with peak pct)
            peak_year = max(year_map, key=lambda y: year_map[y][0])
            _, canonical_name, primary_gender = year_map[peak_year]

            if not args.dry_run:
                c.execute(
                    "INSERT INTO names (slug, name, gender, origin, meaning, "
                    "peak_year, peak_pct, total_records) VALUES (?,?,?,?,?,?,?,?)",
                    (slug, canonical_name, primary_gender, None, None, None, None, None),
                )
            existing_gender[slug] = primary_gender
            new_names_added += 1

        # Insert popularity rows for this slug across all 2009-2024 entries
        for year, (pct, _, _) in year_map.items():
            existing_pop = c.execute(
                "SELECT 1 FROM popularity WHERE slug = ? AND year = ?",
                (slug, year),
            ).fetchone()
            if existing_pop:
                skipped_existing += 1
                continue
            if not args.dry_run:
                c.execute(
                    "INSERT INTO popularity (slug, year, pct) VALUES (?,?,?)",
                    (slug, year, pct),
                )
            rows_inserted += 1

    if not args.dry_run:
        conn.commit()

    print(f"\nPopularity rows inserted: {rows_inserted:,}")
    print(f"New names added: {new_names_added:,}")
    print(f"New names rejected (quality bar): {new_names_rejected:,}")
    print(f"Skipped (already present): {skipped_existing:,}")

    # Recompute aggregates on names table (now that 2009-2024 data is in).
    # Use window function for deterministic peak selection (highest pct,
    # tiebreak by earliest year). Materialize into temp tables because
    # SQLite UPDATE…SET cannot reference correlated CTE columns reliably.
    print("\nRecomputing peak_year / peak_pct / total_records …")
    if not args.dry_run:
        c.executescript(
            """
            DROP TABLE IF EXISTS _tmp_peaks;
            CREATE TEMP TABLE _tmp_peaks AS
            SELECT slug, year AS peak_year, pct AS peak_pct
            FROM (
                SELECT slug, year, pct,
                       ROW_NUMBER() OVER (
                           PARTITION BY slug
                           ORDER BY pct DESC, year ASC
                       ) AS rn
                FROM popularity
            )
            WHERE rn = 1;

            DROP TABLE IF EXISTS _tmp_agg;
            CREATE TEMP TABLE _tmp_agg AS
            SELECT slug, COUNT(*) AS cnt FROM popularity GROUP BY slug;

            CREATE INDEX _tmp_peaks_slug ON _tmp_peaks(slug);
            CREATE INDEX _tmp_agg_slug ON _tmp_agg(slug);

            UPDATE names
            SET peak_year     = (SELECT peak_year FROM _tmp_peaks WHERE _tmp_peaks.slug = names.slug),
                peak_pct      = (SELECT peak_pct  FROM _tmp_peaks WHERE _tmp_peaks.slug = names.slug),
                total_records = (SELECT cnt       FROM _tmp_agg   WHERE _tmp_agg.slug   = names.slug);
            """
        )
        conn.commit()

    # Summary
    name_count = c.execute("SELECT COUNT(*) FROM names").fetchone()[0]
    pop_count = c.execute("SELECT COUNT(*) FROM popularity").fetchone()[0]
    year_min, year_max = c.execute("SELECT MIN(year), MAX(year) FROM popularity").fetchone()
    print(f"\nDB summary:")
    print(f"  names      : {name_count:,}")
    print(f"  popularity : {pop_count:,}  ({year_min}-{year_max})")

    # Spot check
    print(f"\nSpot check (recent peaks):")
    for slug in ["emma", "olivia", "liam", "noah", "isabella", "sophia"]:
        row = c.execute(
            "SELECT name, gender, peak_year, peak_pct, total_records FROM names WHERE slug = ?",
            (slug,),
        ).fetchone()
        if row:
            print(f"  {row[0]:<12} {row[1]:<5} peak={row[2]} ({row[3]*100:.3f}%)  records={row[4]}")

    conn.close()
    print(f"\n✓ {'(dry-run) ' if args.dry_run else ''}Done at {datetime.now().strftime('%Y-%m-%d %H:%M')}")


if __name__ == "__main__":
    main()
