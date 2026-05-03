#!/usr/bin/env python3
"""Compute cohort + first-appearance facts per name.

Pure derivation from popularity × year_totals — no synthetic data.

Adds to names table:
  first_real_year     INTEGER  -- first year with >= 100 absolute births
  dominant_cohort     TEXT     -- which generation gave this name most births
  dominant_cohort_count INTEGER  -- absolute count given by dominant cohort
  total_births        INTEGER  -- sum across all years 1880-2024

Generation cohort year ranges (US convention):
  greatest    1901–1927
  silent      1928–1945
  boomer      1946–1964
  genx        1965–1980
  millennial  1981–1996
  genz        1997–2012
  alpha       2013–2024
"""
import sqlite3
import sys
from collections import defaultdict
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent
DB_PATH = PROJECT / "data" / "names.db"

COHORTS = [
    ("greatest", 1901, 1927),
    ("silent", 1928, 1945),
    ("boomer", 1946, 1964),
    ("genx", 1965, 1980),
    ("millennial", 1981, 1996),
    ("genz", 1997, 2012),
    ("alpha", 2013, 2024),
]


def cohort_for_year(year: int) -> str | None:
    for slug, start, end in COHORTS:
        if start <= year <= end:
            return slug
    return None


def main() -> int:
    conn = sqlite3.connect(str(DB_PATH))
    c = conn.cursor()

    cols = {row[1] for row in c.execute("PRAGMA table_info(names)").fetchall()}
    if "first_real_year" not in cols:
        c.execute("ALTER TABLE names ADD COLUMN first_real_year INTEGER")
    if "dominant_cohort" not in cols:
        c.execute("ALTER TABLE names ADD COLUMN dominant_cohort TEXT")
    if "dominant_cohort_count" not in cols:
        c.execute("ALTER TABLE names ADD COLUMN dominant_cohort_count INTEGER")
    if "total_births" not in cols:
        c.execute("ALTER TABLE names ADD COLUMN total_births INTEGER")

    # Year-total lookup: (year, gender) → births
    year_total: dict[tuple[int, str], int] = {}
    for year, gender, total in c.execute("SELECT year, gender, total FROM year_totals"):
        year_total[(year, gender)] = total

    # Each name's series + gender
    name_gender: dict[str, str] = dict(c.execute("SELECT slug, gender FROM names").fetchall())

    pop_rows = c.execute("SELECT slug, year, pct FROM popularity").fetchall()
    series: dict[str, list[tuple[int, float]]] = defaultdict(list)
    for slug, year, pct in pop_rows:
        series[slug].append((year, pct))

    print(f"Computing cohort + first-real-year for {len(series):,} names...")

    updates = []
    cohort_counts: dict[str, int] = defaultdict(int)

    for slug, points in series.items():
        gender = name_gender.get(slug)
        if not gender:
            continue
        # Convert pct → absolute count for each year
        cohort_births: dict[str, int] = defaultdict(int)
        first_real_year: int | None = None
        total_births = 0
        points.sort(key=lambda x: x[0])
        for year, pct in points:
            total = year_total.get((year, gender))
            if not total:
                continue
            count = int(round(pct * total))
            total_births += count
            cohort = cohort_for_year(year)
            if cohort:
                cohort_births[cohort] += count
            if first_real_year is None and count >= 100:
                first_real_year = year

        if not cohort_births:
            continue
        dominant = max(cohort_births.items(), key=lambda kv: kv[1])
        updates.append((first_real_year, dominant[0], dominant[1], total_births, slug))
        cohort_counts[dominant[0]] += 1

    print("Dominant cohort distribution:")
    for slug, *_ in COHORTS:
        print(f"  {slug:11s}  {cohort_counts[slug]:>5} names")
    print(f"  total       {sum(cohort_counts.values()):>5} names with cohort")

    c.executemany(
        "UPDATE names SET first_real_year = ?, dominant_cohort = ?, dominant_cohort_count = ?, total_births = ? WHERE slug = ?",
        updates,
    )
    conn.commit()
    conn.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
