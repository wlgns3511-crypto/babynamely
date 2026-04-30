/**
 * Layer 1 — comparative facts per name.
 *
 * Each /name/[slug]/ page renders unique data-derived content (current rank,
 * cumulative count estimate, decade-by-decade rank trajectory, peers ranked
 * nearby today, peers that peaked in the same decade). This is the raw
 * material that turns templated pages into pages with information.
 *
 * Built on auxiliary tables from scripts/build-comparative-tables.py:
 *   - year_totals(year, gender, total)        — for "estimated babies" math
 *   - name_year_rank(slug, year, rank)        — pre-computed ranks per gender
 *
 * All queries here are pure: pass in a slug, get facts back. No I/O or render.
 */
import path from 'path';
import Database from 'better-sqlite3';

const DB_PATH = path.join(process.cwd(), 'data', 'names.db');
let _factsDb: Database.Database | null = null;
function db(): Database.Database {
  if (_factsDb) {
    try {
      _factsDb.prepare('SELECT 1').get();
      return _factsDb;
    } catch {
      _factsDb = null;
    }
  }
  _factsDb = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  return _factsDb;
}

const LATEST_YEAR = 2024;
const PRIOR_YEAR = 2023;

export interface DecadeRank {
  decade: number;        // 1880, 1890, …, 2020
  avgRank: number;       // average rank during that decade (lower = more popular)
  avgPct: number;        // average share of births that decade
  yearsCovered: number;  // how many years of data within the decade
}

export interface PeerName {
  slug: string;
  name: string;
  rank: number;          // for sameRankBand: 2024 rank; for sameDecadePeak: peak year
  pctOrYear: number;
}

export interface NameFacts {
  slug: string;
  gender: string;
  // ── Current snapshot ───────────────────────────────────────────
  current: {
    year: number;
    rank: number | null;          // null if name didn't appear in latest year
    pct: number | null;           // 0.00912 = 0.912% of births that gender
    estimatedBabies: number | null;
  } | null;
  // ── Recent direction ───────────────────────────────────────────
  recent: {
    priorRank: number | null;
    rankChange: number | null;    // +N = moved UP (e.g., #5 → #2 = +3)
    direction: 'rising' | 'falling' | 'stable' | 'new' | 'returning' | 'absent';
    fiveYearTrendPct: number | null; // % change in pct vs 5 years ago
  };
  // ── Cumulative / all-time ──────────────────────────────────────
  cumulative: {
    estimatedTotal: number;       // approx total babies named X since 1880
    yearsInRecord: number;        // # years where name appeared
    bestRank: number;             // lowest rank ever (most popular)
    bestRankYear: number;
    firstYear: number;
    lastYear: number;
  };
  // ── Decade-by-decade ───────────────────────────────────────────
  decadeRanks: DecadeRank[];
  // ── Peers ──────────────────────────────────────────────────────
  peersInRankBand: PeerName[];    // 5 names ranked near you in 2024
  peersSameDecadePeak: PeerName[]; // 5 names that peaked in same decade
}

/**
 * Compute all facts for one slug. Returns null if the slug doesn't exist.
 * One DB connection, ~5-7 prepared statements, all returns ≤30 rows.
 * Cheap enough to call inside generateStaticParams loops.
 */
export function getNameFacts(slug: string): NameFacts | null {
  const conn = db();
  const meta = conn
    .prepare(
      'SELECT slug, name, gender, peak_year, peak_pct, total_records FROM names WHERE slug = ?',
    )
    .get(slug) as
    | { slug: string; name: string; gender: string; peak_year: number; peak_pct: number; total_records: number }
    | undefined;
  if (!meta) return null;

  // Current snapshot
  const currentRow = conn
    .prepare(
      `SELECT r.rank as rank, p.pct as pct, t.total as gender_total
       FROM popularity p
       LEFT JOIN name_year_rank r ON r.slug = p.slug AND r.year = p.year
       LEFT JOIN year_totals t    ON t.year = p.year AND t.gender = ?
       WHERE p.slug = ? AND p.year = ?`,
    )
    .get(meta.gender, slug, LATEST_YEAR) as
    | { rank: number; pct: number; gender_total: number }
    | undefined;

  const current = currentRow
    ? {
        year: LATEST_YEAR,
        rank: currentRow.rank ?? null,
        pct: currentRow.pct,
        estimatedBabies: currentRow.gender_total
          ? Math.round(currentRow.pct * currentRow.gender_total)
          : null,
      }
    : null;

  // Prior year for YoY comparison
  const priorRow = conn
    .prepare(
      'SELECT r.rank as rank, p.pct as pct FROM popularity p ' +
        'LEFT JOIN name_year_rank r ON r.slug = p.slug AND r.year = p.year ' +
        'WHERE p.slug = ? AND p.year = ?',
    )
    .get(slug, PRIOR_YEAR) as { rank: number; pct: number } | undefined;

  // 5-year-ago for sustained trend
  const fiveYearRow = conn
    .prepare('SELECT pct FROM popularity WHERE slug = ? AND year = ?')
    .get(slug, LATEST_YEAR - 5) as { pct: number } | undefined;

  let direction: NameFacts['recent']['direction'] = 'stable';
  let rankChange: number | null = null;
  if (current && current.rank && priorRow?.rank) {
    rankChange = priorRow.rank - current.rank; // positive = moved up
    if (rankChange >= 5) direction = 'rising';
    else if (rankChange <= -5) direction = 'falling';
    else direction = 'stable';
  } else if (current && current.rank && !priorRow) {
    direction = 'returning'; // present today, missing last year
  } else if (!current && priorRow) {
    direction = 'absent'; // gone today, present last year
  } else if (!current) {
    direction = 'absent';
  }

  const fiveYearTrendPct =
    fiveYearRow && current?.pct
      ? Math.round(((current.pct - fiveYearRow.pct) / fiveYearRow.pct) * 100)
      : null;

  // Cumulative: Σ pct × year_total for matching gender
  const cumRow = conn
    .prepare(
      `SELECT
         SUM(p.pct * t.total) AS estimated_total,
         COUNT(DISTINCT p.year) AS years_in_record,
         MIN(p.year) AS first_year,
         MAX(p.year) AS last_year
       FROM popularity p
       INNER JOIN year_totals t ON t.year = p.year AND t.gender = ?
       WHERE p.slug = ?`,
    )
    .get(meta.gender, slug) as {
    estimated_total: number;
    years_in_record: number;
    first_year: number;
    last_year: number;
  };

  const bestRankRow = conn
    .prepare(
      'SELECT year, rank FROM name_year_rank WHERE slug = ? ORDER BY rank ASC, year ASC LIMIT 1',
    )
    .get(slug) as { year: number; rank: number };

  // Decade buckets — one row per 10-year span the name appeared in
  const decadeRows = conn
    .prepare(
      `SELECT (p.year/10)*10 AS decade,
              ROUND(AVG(r.rank), 0)  AS avg_rank,
              AVG(p.pct)             AS avg_pct,
              COUNT(*)               AS years_covered
       FROM popularity p
       INNER JOIN name_year_rank r ON r.slug = p.slug AND r.year = p.year
       WHERE p.slug = ?
       GROUP BY decade
       ORDER BY decade ASC`,
    )
    .all(slug) as { decade: number; avg_rank: number; avg_pct: number; years_covered: number }[];

  const decadeRanks: DecadeRank[] = decadeRows.map((r) => ({
    decade: r.decade,
    avgRank: r.avg_rank,
    avgPct: r.avg_pct,
    yearsCovered: r.years_covered,
  }));

  // Peers ranked nearby in latest year (5 above + 5 below, then merge to 6)
  const peersInRankBand: PeerName[] = current?.rank
    ? (conn
        .prepare(
          `SELECT n.slug, n.name, r.rank, p.pct
           FROM name_year_rank r
           INNER JOIN names n      ON n.slug = r.slug
           INNER JOIN popularity p ON p.slug = r.slug AND p.year = r.year
           WHERE r.year = ? AND n.gender = ? AND r.slug != ?
                 AND ABS(r.rank - ?) BETWEEN 1 AND 5
           ORDER BY ABS(r.rank - ?) ASC, r.rank ASC
           LIMIT 6`,
        )
        .all(LATEST_YEAR, meta.gender, slug, current.rank, current.rank) as {
        slug: string;
        name: string;
        rank: number;
        pct: number;
      }[]).map((r) => ({ slug: r.slug, name: r.name, rank: r.rank, pctOrYear: r.pct }))
    : [];

  // Peers that peaked in the same decade — different vibe (cohort comparison)
  const peakDecade = Math.floor(meta.peak_year / 10) * 10;
  const peersSameDecadePeak: PeerName[] = conn
    .prepare(
      `SELECT slug, name, peak_year, peak_pct
       FROM names
       WHERE gender = ?
         AND slug != ?
         AND peak_year >= ? AND peak_year < ?
       ORDER BY peak_pct DESC
       LIMIT 6`,
    )
    .all(meta.gender, slug, peakDecade, peakDecade + 10)
    .map((row) => {
      const r = row as { slug: string; name: string; peak_year: number; peak_pct: number };
      return { slug: r.slug, name: r.name, rank: r.peak_year, pctOrYear: r.peak_pct };
    });

  return {
    slug: meta.slug,
    gender: meta.gender,
    current,
    recent: {
      priorRank: priorRow?.rank ?? null,
      rankChange,
      direction,
      fiveYearTrendPct,
    },
    cumulative: {
      estimatedTotal: Math.round(cumRow.estimated_total ?? 0),
      yearsInRecord: cumRow.years_in_record ?? 0,
      bestRank: bestRankRow?.rank ?? 0,
      bestRankYear: bestRankRow?.year ?? 0,
      firstYear: cumRow.first_year ?? 0,
      lastYear: cumRow.last_year ?? 0,
    },
    decadeRanks,
    peersInRankBand,
    peersSameDecadePeak,
  };
}
