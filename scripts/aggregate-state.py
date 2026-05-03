#!/usr/bin/env python3
"""Aggregate state_name_year → slim state_name_total, then drop the raw table.

Reduces DB from ~577 MB back to ~80 MB while preserving all query needs:
  - Top N states for a name (all-time)
  - Top N states for a name (recent 5y, 2020-2024)
  - Per-capita normalization (count_in_state / state_total)
"""
import sqlite3
import sys
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent
DB_PATH = PROJECT / "data" / "names.db"
RECENT_START = 2020
RECENT_END = 2024


def main() -> int:
    conn = sqlite3.connect(str(DB_PATH))
    c = conn.cursor()

    c.executescript(
        """
        DROP TABLE IF EXISTS state_name_total;
        CREATE TABLE state_name_total (
            state         TEXT NOT NULL,
            slug          TEXT NOT NULL,
            gender        TEXT NOT NULL,
            count_total   INTEGER NOT NULL,
            count_recent  INTEGER NOT NULL,
            PRIMARY KEY (state, slug, gender)
        );
        CREATE INDEX idx_snt_slug ON state_name_total(slug);
        CREATE INDEX idx_snt_state ON state_name_total(state);

        DROP TABLE IF EXISTS state_total;
        CREATE TABLE state_total (
            state         TEXT NOT NULL,
            gender        TEXT NOT NULL,
            total_all     INTEGER NOT NULL,
            total_recent  INTEGER NOT NULL,
            PRIMARY KEY (state, gender)
        );
        """
    )

    print("Aggregating per-name×state totals...")
    c.execute(
        f"""
        INSERT INTO state_name_total (state, slug, gender, count_total, count_recent)
        SELECT
            state,
            slug,
            gender,
            SUM(count) AS count_total,
            SUM(CASE WHEN year BETWEEN {RECENT_START} AND {RECENT_END} THEN count ELSE 0 END) AS count_recent
        FROM state_name_year
        GROUP BY state, slug, gender
        """
    )
    snt_rows = c.execute("SELECT COUNT(*) FROM state_name_total").fetchone()[0]
    print(f"  state_name_total: {snt_rows:,} rows")

    print("Aggregating per-state totals...")
    c.execute(
        f"""
        INSERT INTO state_total (state, gender, total_all, total_recent)
        SELECT
            state,
            gender,
            SUM(total) AS total_all,
            SUM(CASE WHEN year BETWEEN {RECENT_START} AND {RECENT_END} THEN total ELSE 0 END) AS total_recent
        FROM state_year_total
        GROUP BY state, gender
        """
    )
    st_rows = c.execute("SELECT COUNT(*) FROM state_total").fetchone()[0]
    print(f"  state_total: {st_rows:,} rows")

    print("Dropping raw tables...")
    c.executescript(
        """
        DROP TABLE IF EXISTS state_name_year;
        DROP TABLE IF EXISTS state_year_total;
        """
    )

    conn.commit()
    print("VACUUM...")
    conn.execute("VACUUM")
    conn.close()
    print("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
