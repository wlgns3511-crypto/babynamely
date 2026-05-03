#!/usr/bin/env python3
"""Import SSA per-state name data into names.db.

Source: SSA SOOC `namesbystate.zip` (51 files: AK.TXT..WY.TXT + DC.TXT)
        downloaded via Wayback Machine because Akamai blocks direct ssa.gov
        downloads from non-US IPs (same constraint as refresh-ssa-2009-2024.py).

Format per row: STATE,SEX,YEAR,NAME,COUNT  (count >= 5 by SSA disclosure rule)

Adds:
  state_name_year(state TEXT, slug TEXT, year INT, gender TEXT, count INT)
  state_year_total(state TEXT, year INT, gender TEXT, total INT)

We only retain rows whose slug exists in the existing names table (7,767),
matching the existing curation. Other rows are dropped (~10% of state file).

Usage:
    python3 scripts/import-ssa-state.py --source-dir /tmp/ssa-state
"""
import argparse
import csv
import shutil
import sqlite3
import sys
import time
from collections import defaultdict
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent
DB_PATH = PROJECT / "data" / "names.db"


def slugify(name: str) -> str:
    return name.lower().strip()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", type=Path, default=Path("/tmp/ssa-state"))
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if not DB_PATH.exists():
        print(f"ERROR: DB not found at {DB_PATH}")
        return 1
    if not args.source_dir.exists():
        print(f"ERROR: source dir not found at {args.source_dir}")
        return 1

    if not args.dry_run:
        backup = DB_PATH.with_suffix(f".db.bak.{int(time.time())}")
        shutil.copy(DB_PATH, backup)
        print(f"Backup: {backup}")

    conn = sqlite3.connect(str(DB_PATH))
    c = conn.cursor()

    existing = {r[0] for r in c.execute("SELECT slug FROM names")}
    print(f"Existing names in DB: {len(existing):,}")

    c.executescript(
        """
        DROP TABLE IF EXISTS state_name_year;
        DROP TABLE IF EXISTS state_year_total;
        CREATE TABLE state_name_year (
            state  TEXT NOT NULL,
            slug   TEXT NOT NULL,
            year   INTEGER NOT NULL,
            gender TEXT NOT NULL,
            count  INTEGER NOT NULL,
            PRIMARY KEY (state, slug, year, gender)
        );
        CREATE INDEX idx_sny_slug ON state_name_year(slug);
        CREATE INDEX idx_sny_state_year ON state_name_year(state, year);
        CREATE TABLE state_year_total (
            state  TEXT NOT NULL,
            year   INTEGER NOT NULL,
            gender TEXT NOT NULL,
            total  INTEGER NOT NULL,
            PRIMARY KEY (state, year, gender)
        );
        """
    )

    files = sorted(args.source_dir.glob("*.TXT"))
    if not files:
        print(f"ERROR: no .TXT files in {args.source_dir}")
        return 1
    print(f"Found {len(files)} state files")

    state_year_totals: dict[tuple[str, int, str], int] = defaultdict(int)
    inserts: list[tuple[str, str, int, str, int]] = []
    kept = 0
    dropped_unknown = 0

    for path in files:
        with open(path, newline="") as f:
            for row in csv.reader(f):
                if len(row) != 5:
                    continue
                state, sex, year_s, name, count_s = (
                    row[0].strip(),
                    row[1].strip(),
                    row[2].strip(),
                    row[3].strip(),
                    row[4].strip(),
                )
                try:
                    year = int(year_s)
                    count = int(count_s)
                except ValueError:
                    continue
                gender = "boy" if sex == "M" else "girl" if sex == "F" else None
                if not gender:
                    continue
                state_year_totals[(state, year, gender)] += count

                slug = slugify(name)
                if slug not in existing:
                    dropped_unknown += 1
                    continue
                inserts.append((state, slug, year, gender, count))
                kept += 1

    print(f"Kept {kept:,} rows (matched names.slug); dropped {dropped_unknown:,} unknown-slug rows")
    print(f"State×year totals computed: {len(state_year_totals):,} buckets")

    if args.dry_run:
        print("DRY RUN — not writing to DB")
        return 0

    c.executemany(
        "INSERT OR REPLACE INTO state_name_year (state, slug, year, gender, count) VALUES (?, ?, ?, ?, ?)",
        inserts,
    )
    c.executemany(
        "INSERT OR REPLACE INTO state_year_total (state, year, gender, total) VALUES (?, ?, ?, ?)",
        [(s, y, g, t) for (s, y, g), t in state_year_totals.items()],
    )

    conn.commit()
    conn.close()
    print("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
