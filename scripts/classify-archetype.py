#!/usr/bin/env python3
"""Classify each name into one of 7 trajectory archetypes from the popularity
table. Pure derivation — no synthetic data, no hashing/seeding.

Adds:
  ALTER TABLE names ADD COLUMN archetype TEXT
  ALTER TABLE names ADD COLUMN archetype_score REAL

Archetypes (priority order; first match wins):
  modern        first_year >= 2000 AND peak_year >= 2010
  vintage       peak_year < 1965 AND recent_5y_avg / mid_century_min >= 2
  classic       count of years with pct >= 0.001 >= 80 (sustained)
  burst         peak_pct >= 0.005 AND last_pct <= peak_pct * 0.2 AND
                (peak_year - first_year) <= 30
  climber       last_5y_avg / first_5y_avg >= 1.5 AND not already matched
  ancient       peak_year < 1950 AND last_pct <= peak_pct * 0.1
  fading        peak_year >= 1965 AND last_pct <= peak_pct * 0.3
  steady        catch-all (still has signal but doesn't fit above)
"""
import sqlite3
import sys
from collections import defaultdict
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent
DB_PATH = PROJECT / "data" / "names.db"

ARCHETYPES = [
    "modern",
    "vintage",
    "classic",
    "burst",
    "climber",
    "ancient",
    "fading",
    "steady",
]


def classify(years: list[int], pcts: list[float]) -> tuple[str, float]:
    """years/pcts are sorted ascending by year."""
    if not years:
        return "steady", 0.0

    first_year = years[0]
    last_year = years[-1]
    last_pct = pcts[-1]
    peak_idx = max(range(len(pcts)), key=lambda i: pcts[i])
    peak_year = years[peak_idx]
    peak_pct = pcts[peak_idx]

    recent = [p for y, p in zip(years, pcts) if y >= 2020]
    recent_5y_avg = sum(recent) / len(recent) if recent else 0.0
    first5 = [p for y, p in zip(years, pcts) if y < first_year + 5]
    first_5y_avg = sum(first5) / len(first5) if first5 else 0.0
    last5 = [p for y, p in zip(years, pcts) if y >= last_year - 4]
    last_5y_avg = sum(last5) / len(last5) if last5 else 0.0
    mid = [p for y, p in zip(years, pcts) if 1950 <= y <= 1990]
    mid_min = min(mid) if mid else float("inf")

    sustained_yrs = sum(1 for p in pcts if p >= 0.001)

    # Modern: only appears recently
    if first_year >= 2000 and peak_year >= 2010:
        score = (last_pct / peak_pct) if peak_pct else 0
        return "modern", score

    # Vintage revival: old peak + comeback
    if peak_year < 1965 and mid_min > 0 and recent_5y_avg / mid_min >= 2:
        score = recent_5y_avg / mid_min
        return "vintage", score

    # Classic: long sustained presence
    if sustained_yrs >= 80:
        return "classic", float(sustained_yrs)

    # Quick burst: high peak then fast collapse, narrow window
    if peak_pct >= 0.005 and peak_pct > 0 and last_pct <= peak_pct * 0.2 and (peak_year - first_year) <= 30:
        score = peak_pct / max(last_pct, 1e-9)
        return "burst", score

    # Climber: rising recent vs early period
    if first_5y_avg > 0 and last_5y_avg / first_5y_avg >= 1.5:
        return "climber", last_5y_avg / first_5y_avg

    # Ancient decline: old peak, never recovered
    if peak_year < 1950 and peak_pct > 0 and last_pct <= peak_pct * 0.1:
        return "ancient", peak_pct / max(last_pct, 1e-9)

    # Fading: post-1965 peak now well below
    if peak_year >= 1965 and peak_pct > 0 and last_pct <= peak_pct * 0.3:
        return "fading", peak_pct / max(last_pct, 1e-9)

    # Steady fallback
    return "steady", 1.0


def main() -> int:
    conn = sqlite3.connect(str(DB_PATH))
    c = conn.cursor()

    cols = {row[1] for row in c.execute("PRAGMA table_info(names)").fetchall()}
    if "archetype" not in cols:
        c.execute("ALTER TABLE names ADD COLUMN archetype TEXT")
    if "archetype_score" not in cols:
        c.execute("ALTER TABLE names ADD COLUMN archetype_score REAL")

    pop_rows = c.execute("SELECT slug, year, pct FROM popularity ORDER BY slug, year").fetchall()
    by_slug: dict[str, list[tuple[int, float]]] = defaultdict(list)
    for slug, year, pct in pop_rows:
        by_slug[slug].append((year, pct))

    counts: dict[str, int] = defaultdict(int)
    updates = []
    for slug, series in by_slug.items():
        series.sort(key=lambda x: x[0])
        years = [y for y, _ in series]
        pcts = [p for _, p in series]
        archetype, score = classify(years, pcts)
        counts[archetype] += 1
        updates.append((archetype, score, slug))

    c.executemany("UPDATE names SET archetype = ?, archetype_score = ? WHERE slug = ?", updates)
    conn.commit()

    print("Archetype distribution:")
    for a in ARCHETYPES:
        print(f"  {a:10s}  {counts[a]:>5} names")
    total_classified = sum(counts.values())
    total_in_db = c.execute("SELECT COUNT(*) FROM names").fetchone()[0]
    print(f"  total      {total_classified:>5} / {total_in_db} names classified")

    conn.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
