import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'names.db');
let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) {
    try {
      // 연결이 살아있는지 확인
      _db.prepare('SELECT 1').get();
      return _db;
    } catch {
      _db = null;
    }
  }
  _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  return _db;
}

export interface BabyName {
  slug: string;
  name: string;
  gender: string;
  origin: string | null;
  meaning: string | null;
  peak_year: number | null;
  peak_pct: number | null;
  total_records: number;
}

export interface PopularityRow {
  slug: string;
  year: number;
  pct: number;
}

export interface ComparisonPair {
  slugA: string;
  slugB: string;
  nameA: string;
  nameB: string;
}

export const COMPARISON_PRERENDER_LIMIT = 100;
export const MIDDLE_NAME_PRERENDER_LIMIT = 999999;

// --- Name queries ---

export function getNameBySlug(slug: string): BabyName | undefined {
  return getDb().prepare('SELECT * FROM names WHERE slug = ?').get(slug) as BabyName | undefined;
}

export function getAllNames(): BabyName[] {
  return getDb().prepare('SELECT * FROM names ORDER BY name').all() as BabyName[];
}

export function getPopularNames(gender: string, limit = 50): BabyName[] {
  return getDb().prepare(`
    SELECT * FROM names WHERE gender = ? ORDER BY peak_pct DESC LIMIT ?
  `).all(gender, limit) as BabyName[];
}

export function getNamesByLetter(letter: string): BabyName[] {
  return getDb().prepare(`
    SELECT * FROM names WHERE slug LIKE ? ORDER BY peak_pct DESC
  `).all(letter.toLowerCase() + '%') as BabyName[];
}

export function getNamesByOrigin(origin: string): BabyName[] {
  return getDb().prepare(`
    SELECT * FROM names WHERE origin = ? ORDER BY peak_pct DESC
  `).all(origin) as BabyName[];
}

export function getAllOrigins(): string[] {
  const rows = getDb().prepare(`
    SELECT DISTINCT origin FROM names WHERE origin IS NOT NULL ORDER BY origin
  `).all() as { origin: string }[];
  return rows.map(r => r.origin);
}

// --- Popularity ---

export function getPopularity(slug: string): PopularityRow[] {
  return getDb().prepare(`
    SELECT * FROM popularity WHERE slug = ? ORDER BY year
  `).all(slug) as PopularityRow[];
}

export function getTopNamesForYear(year: number, limit = 20): (BabyName & { year_pct: number })[] {
  return getDb().prepare(`
    SELECT n.*, p.pct as year_pct FROM names n
    JOIN popularity p ON n.slug = p.slug
    WHERE p.year = ?
    ORDER BY p.pct DESC LIMIT ?
  `).all(year, limit) as (BabyName & { year_pct: number })[];
}

export function getAvailableYears(): number[] {
  const rows = getDb().prepare(`
    SELECT DISTINCT year FROM popularity ORDER BY year
  `).all() as { year: number }[];
  return rows.map(r => r.year);
}

// --- Similar names ---

export function getSimilarNames(slug: string, gender: string, limit = 10): BabyName[] {
  // Names with similar starting letters and same gender
  const prefix = slug.substring(0, 3);
  return getDb().prepare(`
    SELECT * FROM names
    WHERE gender = ? AND slug != ? AND slug LIKE ?
    ORDER BY peak_pct DESC LIMIT ?
  `).all(gender, slug, prefix + '%', limit) as BabyName[];
}

// --- Comparisons ---

function hasComparisonsTable(): boolean {
  const row = getDb().prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='comparisons'"
  ).get();
  return !!row;
}

export function getTopComparisons(limit = 2000): ComparisonPair[] {
  if (hasComparisonsTable()) {
    return getDb().prepare(`
      SELECT slugA, slugB, nameA, nameB FROM comparisons
      ORDER BY popularity_score DESC
      LIMIT ?
    `).all(limit) as ComparisonPair[];
  }

  // Fallback: generate pairs from top names (legacy)
  const topNames = getDb().prepare(`
    SELECT slug, name FROM names ORDER BY peak_pct DESC LIMIT 200
  `).all() as { slug: string; name: string }[];

  const pairs: ComparisonPair[] = [];
  for (let i = 0; i < topNames.length && pairs.length < limit; i++) {
    for (let j = i + 1; j < topNames.length && pairs.length < limit; j++) {
      if (topNames[i].slug < topNames[j].slug) {
        pairs.push({ slugA: topNames[i].slug, slugB: topNames[j].slug, nameA: topNames[i].name, nameB: topNames[j].name });
      } else {
        pairs.push({ slugA: topNames[j].slug, slugB: topNames[i].slug, nameA: topNames[j].name, nameB: topNames[i].name });
      }
    }
  }
  return pairs;
}

export function getAllComparisons(): ComparisonPair[] {
  if (hasComparisonsTable()) {
    return getDb().prepare(`
      SELECT slugA, slugB, nameA, nameB FROM comparisons
      ORDER BY popularity_score DESC
    `).all() as ComparisonPair[];
  }
  return getTopComparisons(200000);
}

export function getComparisonCount(): number {
  if (!hasComparisonsTable()) return 0;
  return (getDb().prepare('SELECT COUNT(*) as c FROM comparisons').get() as { c: number }).c;
}

let _staticComparisons: ComparisonPair[] | null = null;
let _staticComparisonPairSet: Set<string> | null = null;

function normalizeComparisonPair(slugA: string, slugB: string): string {
  return slugA < slugB ? `${slugA}|${slugB}` : `${slugB}|${slugA}`;
}

function toStaticComparisonPair(pair: ComparisonPair): ComparisonPair {
  if (pair.slugA < pair.slugB) return pair;
  return {
    slugA: pair.slugB,
    slugB: pair.slugA,
    nameA: pair.nameB,
    nameB: pair.nameA,
  };
}

export function getStaticComparisons(limit = COMPARISON_PRERENDER_LIMIT): ComparisonPair[] {
  if (!_staticComparisons) {
    // HCU 2026-04-24: source of truth = scripts/build-keep-sets.ts JSON dump.
    // Includes top-100 DB slice (popularity_score DESC) + GSC evidence union
    // (4 URLs earning ≥1 click that popularity ordering alone would drop —
    // same pattern that killed 100% of earners on degreewize/zippeek/
    // guidebycity cleanups, must prevent here). Rebuild via
    // `npx tsx scripts/build-keep-sets.ts` before deploy.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const keepList = require('./generated/compare-keep.json') as string[];
    _staticComparisons = keepList.map((slugs) => {
      const idx = slugs.lastIndexOf('-vs-');
      const slugA = slugs.slice(0, idx);
      const slugB = slugs.slice(idx + 4);
      const nameA = getNameBySlug(slugA)?.name ?? slugA;
      const nameB = getNameBySlug(slugB)?.name ?? slugB;
      return { slugA, slugB, nameA, nameB };
    });
  }
  return _staticComparisons.slice(0, limit);
}

export function isStaticComparisonPair(slugA: string, slugB: string): boolean {
  if (!_staticComparisonPairSet) {
    _staticComparisonPairSet = new Set(
      getStaticComparisons().map((pair) => normalizeComparisonPair(pair.slugA, pair.slugB))
    );
  }
  return _staticComparisonPairSet.has(normalizeComparisonPair(slugA, slugB));
}

export function getStaticComparisonHref(slugA: string, slugB: string): string | null {
  if (!isStaticComparisonPair(slugA, slugB)) return null;
  const [a, b] = slugA < slugB ? [slugA, slugB] : [slugB, slugA];
  return `/compare/${a}-vs-${b}/`;
}

export function getStaticComparisonsForSlug(slug: string, limit = 12): ComparisonPair[] {
  return getStaticComparisons().filter((pair) => pair.slugA === slug || pair.slugB === slug).slice(0, limit);
}

// --- Middle names ---

export function getMiddleNameSuggestions(firstName: BabyName, limit = 20): BabyName[] {
  // Get popular names of same gender that pair well
  // Avoid names starting with same letter for variety
  const firstLetter = firstName.slug.charAt(0);
  return getDb().prepare(`
    SELECT * FROM names
    WHERE gender = ? AND slug != ? AND slug NOT LIKE ?
    ORDER BY peak_pct DESC LIMIT ?
  `).all(firstName.gender, firstName.slug, firstLetter + '%', limit) as BabyName[];
}

export function getTopNamesForMiddleNames(limit = 3000): { slug: string }[] {
  return getDb().prepare('SELECT slug FROM names ORDER BY peak_pct DESC LIMIT ?').all(limit) as { slug: string }[];
}

// --- Counts ---

export function countNames(): number {
  return (getDb().prepare('SELECT COUNT(*) as c FROM names').get() as { c: number }).c;
}

export function getNameSlugsPage(offset: number, limit: number): { slug: string }[] {
  return getDb().prepare('SELECT slug FROM names ORDER BY peak_pct DESC, name ASC LIMIT ? OFFSET ?').all(limit, offset) as { slug: string }[];
}

export function getPopularBoyNames(limit = 10): BabyName[] {
  return getDb().prepare('SELECT * FROM names WHERE gender = ? ORDER BY peak_pct DESC LIMIT ?').all('boy', limit) as BabyName[];
}

export function getPopularGirlNames(limit = 10): BabyName[] {
  return getDb().prepare('SELECT * FROM names WHERE gender = ? ORDER BY peak_pct DESC LIMIT ?').all('girl', limit) as BabyName[];
}

export function getNamesBySameOrigin(slug: string, origin: string | null, gender: string, limit = 6): BabyName[] {
  if (!origin) return [];
  return getDb().prepare(
    'SELECT * FROM names WHERE origin = ? AND gender = ? AND slug != ? ORDER BY peak_pct DESC LIMIT ?'
  ).all(origin, gender, slug, limit) as BabyName[];
}

export function getPopularNamesByGender(gender: string, excludeSlug: string, limit = 6): BabyName[] {
  return getDb().prepare(
    'SELECT * FROM names WHERE gender = ? AND slug != ? ORDER BY peak_pct DESC LIMIT ?'
  ).all(gender, excludeSlug, limit) as BabyName[];
}

export function getRandomNames(limit = 20): BabyName[] {
  return getDb().prepare('SELECT * FROM names ORDER BY RANDOM() LIMIT ?').all(limit) as BabyName[];
}

/** Get current ISO week number (1-52) */
export function getCurrentWeek(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.ceil((diff / oneWeek + start.getDay() + 1) / 7);
}

// --- National stats for insight comparisons ---

export function getNameStats(): {
  totalNames: number;
  avgPeakPct: number | null;
} {
  return getDb().prepare(`
    SELECT COUNT(*) as totalNames, AVG(peak_pct) as avgPeakPct FROM names
  `).get() as { totalNames: number; avgPeakPct: number | null };
}

export function getNameRank(slug: string): number | null {
  const row = getDb().prepare(`
    SELECT COUNT(*) + 1 as rank FROM names WHERE peak_pct > (SELECT peak_pct FROM names WHERE slug = ?)
  `).get(slug) as { rank: number } | undefined;
  return row?.rank ?? null;
}

// Peer names by peak_pct (one higher, one lower), same gender. Used for metadata peer comparisons.
export function getNamePeers(peakPct: number, gender: string, excludeSlug: string): { above?: BabyName; below?: BabyName } {
  const above = getDb().prepare(
    'SELECT * FROM names WHERE peak_pct > ? AND gender = ? AND slug != ? ORDER BY peak_pct ASC LIMIT 1'
  ).get(peakPct, gender, excludeSlug) as BabyName | undefined;
  const below = getDb().prepare(
    'SELECT * FROM names WHERE peak_pct < ? AND gender = ? AND slug != ? ORDER BY peak_pct DESC LIMIT 1'
  ).get(peakPct, gender, excludeSlug) as BabyName | undefined;
  return { above, below };
}

export function getLatestPopularity(slug: string): PopularityRow | null {
  return (getDb().prepare(
    'SELECT * FROM popularity WHERE slug = ? ORDER BY year DESC LIMIT 1'
  ).get(slug) as PopularityRow | undefined) ?? null;
}

export function searchNames(query: string, limit = 30): BabyName[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return getDb().prepare(`
    SELECT * FROM names WHERE slug LIKE ? OR LOWER(name) LIKE ? ORDER BY peak_pct DESC LIMIT ?
  `).all(q + '%', q + '%', limit) as BabyName[];
}

// --- Decade top-names (national SSA aggregate) ---

export interface DecadeTopRow {
  slug: string;
  name: string;
  gender: string;
  origin: string | null;
  total_pct: number;
  peak_year: number | null;
}

/**
 * Top N names by summed yearly percentage over a given decade (national).
 * Decade is inclusive-start, exclusive-end: e.g. (1950, 1960) covers 1950–1959.
 * SSA state-level data is only available for 1910+ for many states, so we use
 * national aggregate here; state-specific culture is layered on in the UI.
 */
export function getTopNamesForDecade(
  startYear: number,
  gender: "boy" | "girl",
  limit = 10
): DecadeTopRow[] {
  return getDb()
    .prepare(
      `SELECT n.slug, n.name, n.gender, n.origin, n.peak_year,
              SUM(p.pct) AS total_pct
       FROM popularity p
       JOIN names n ON p.slug = n.slug
       WHERE p.year >= ? AND p.year < ? AND n.gender = ?
       GROUP BY n.slug
       ORDER BY total_pct DESC
       LIMIT ?`
    )
    .all(startYear, startYear + 10, gender, limit) as DecadeTopRow[];
}

export function getRotatingComparisons(limit = 2000): ComparisonPair[] {
  const week = getCurrentWeek();
  const offset = ((week - 1) % 50) * 200;
  const top = getDb().prepare(
    'SELECT slug, name FROM names ORDER BY peak_pct DESC LIMIT 200 OFFSET ?'
  ).all(offset) as { slug: string; name: string }[];

  const pairs: ComparisonPair[] = [];
  for (let i = 0; i < top.length && pairs.length < limit; i++) {
    for (let j = i + 1; j < top.length && pairs.length < limit; j++) {
      if (top[i].slug < top[j].slug) {
        pairs.push({ slugA: top[i].slug, slugB: top[j].slug, nameA: top[i].name, nameB: top[j].name });
      } else {
        pairs.push({ slugA: top[j].slug, slugB: top[i].slug, nameA: top[j].name, nameB: top[i].name });
      }
    }
  }
  return pairs;
}
