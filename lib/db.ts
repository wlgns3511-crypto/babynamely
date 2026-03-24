import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'names.db');
let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  }
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

export function getTopComparisons(limit = 2000): { slugA: string; slugB: string }[] {
  // Top names by popularity, generate pairs
  const topNames = getDb().prepare(`
    SELECT slug FROM names ORDER BY peak_pct DESC LIMIT 200
  `).all() as { slug: string }[];

  const pairs: { slugA: string; slugB: string }[] = [];
  for (let i = 0; i < topNames.length && pairs.length < limit; i++) {
    for (let j = i + 1; j < topNames.length && pairs.length < limit; j++) {
      const [a, b] = [topNames[i].slug, topNames[j].slug].sort();
      pairs.push({ slugA: a, slugB: b });
    }
  }
  return pairs;
}

// --- Counts ---

export function countNames(): number {
  return (getDb().prepare('SELECT COUNT(*) as c FROM names').get() as { c: number }).c;
}
