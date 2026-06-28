/**
 * Per-name context derived from existing SQL tables. All three queries are
 * deterministic on (slug, gender, archetype, dominant_cohort, peak_pct) —
 * no fabrication, just facts already in data/names.db.
 *
 * Used to escape thin-page status: every name page renders distinct
 * archetype peers, cohort rank, and letter-initial rank text.
 */
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'names.db');
let _db: Database.Database | null = null;
function db(): Database.Database {
  if (_db) {
    try {
      _db.prepare('SELECT 1').get();
      return _db;
    } catch {
      _db = null;
    }
  }
  _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  return _db;
}

export interface ArchetypePeer {
  slug: string;
  name: string;
  peak_year: number | null;
  peak_pct: number | null;
}

/** 5 nearest names sharing the archetype + gender, ordered by peak-year proximity then peak share. */
export function getSameArchetypePeers(
  slug: string,
  gender: string,
  archetype: string,
  peakYear: number | null,
): ArchetypePeer[] {
  if (peakYear == null) {
    return db()
      .prepare(
        `SELECT slug, name, peak_year, peak_pct FROM names
         WHERE archetype = ? AND gender = ? AND slug != ?
         ORDER BY peak_pct DESC LIMIT 5`,
      )
      .all(archetype, gender, slug) as ArchetypePeer[];
  }
  return db()
    .prepare(
      `SELECT slug, name, peak_year, peak_pct FROM names
       WHERE archetype = ? AND gender = ? AND slug != ? AND peak_year IS NOT NULL
       ORDER BY ABS(peak_year - ?) ASC, peak_pct DESC LIMIT 5`,
    )
    .all(archetype, gender, slug, peakYear) as ArchetypePeer[];
}

export interface CohortRank {
  rankInCohort: number;
  totalInCohort: number;
}

/** Rank of this name among same-gender names whose dominant generation cohort matches, by total_births. */
export function getCohortRank(
  gender: string,
  dominantCohort: string,
  totalBirths: number | null,
): CohortRank | null {
  if (totalBirths == null) return null;
  const total = db()
    .prepare(`SELECT COUNT(*) AS c FROM names WHERE dominant_cohort = ? AND gender = ?`)
    .get(dominantCohort, gender) as { c: number };
  if (total.c === 0) return null;
  const ahead = db()
    .prepare(
      `SELECT COUNT(*) AS c FROM names
       WHERE dominant_cohort = ? AND gender = ? AND total_births > ?`,
    )
    .get(dominantCohort, gender, totalBirths) as { c: number };
  return { rankInCohort: ahead.c + 1, totalInCohort: total.c };
}

export interface LetterRank {
  rank: number;
  total: number;
  topPeers: { slug: string; name: string; peak_pct: number | null }[];
  letter: string;
}

/** Rank of this name among same-gender names sharing the first letter, by peak_pct. */
export function getLetterRank(
  slug: string,
  name: string,
  gender: string,
  peakPct: number | null,
): LetterRank | null {
  const letter = name.charAt(0).toUpperCase();
  if (!/^[A-Z]$/.test(letter)) return null;
  const total = db()
    .prepare(
      `SELECT COUNT(*) AS c FROM names
       WHERE substr(upper(name), 1, 1) = ? AND gender = ? AND peak_pct IS NOT NULL`,
    )
    .get(letter, gender) as { c: number };
  if (total.c === 0) return null;
  let rank = total.c;
  if (peakPct != null) {
    const ahead = db()
      .prepare(
        `SELECT COUNT(*) AS c FROM names
         WHERE substr(upper(name), 1, 1) = ? AND gender = ? AND peak_pct > ?`,
      )
      .get(letter, gender, peakPct) as { c: number };
    rank = ahead.c + 1;
  }
  const topPeers = db()
    .prepare(
      `SELECT slug, name, peak_pct FROM names
       WHERE substr(upper(name), 1, 1) = ? AND gender = ? AND slug != ? AND peak_pct IS NOT NULL
       ORDER BY peak_pct DESC LIMIT 3`,
    )
    .all(letter, gender, slug) as { slug: string; name: string; peak_pct: number | null }[];
  return { rank, total: total.c, topPeers, letter };
}
