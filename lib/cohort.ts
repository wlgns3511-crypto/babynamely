import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'names.db');
let _db: Database.Database | null = null;

function getDb(): Database.Database {
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

export type CohortSlug = 'greatest' | 'silent' | 'boomer' | 'genx' | 'millennial' | 'genz' | 'alpha';

export interface CohortMeta {
  slug: CohortSlug;
  label: string;
  years: string;
  start: number;
  end: number;
  parentEra: string;
}

export const COHORTS: Record<CohortSlug, CohortMeta> = {
  greatest: {
    slug: 'greatest',
    label: 'Greatest Generation',
    years: '1901–1927',
    start: 1901,
    end: 1927,
    parentEra: 'WWI and pre-Depression America',
  },
  silent: {
    slug: 'silent',
    label: 'Silent Generation',
    years: '1928–1945',
    start: 1928,
    end: 1945,
    parentEra: 'Great Depression and WWII',
  },
  boomer: {
    slug: 'boomer',
    label: 'Baby Boomers',
    years: '1946–1964',
    start: 1946,
    end: 1964,
    parentEra: 'post-war boom and Civil Rights era',
  },
  genx: {
    slug: 'genx',
    label: 'Generation X',
    years: '1965–1980',
    start: 1965,
    end: 1980,
    parentEra: 'late Cold War and the latchkey decades',
  },
  millennial: {
    slug: 'millennial',
    label: 'Millennials',
    years: '1981–1996',
    start: 1981,
    end: 1996,
    parentEra: 'the rise of the internet',
  },
  genz: {
    slug: 'genz',
    label: 'Generation Z',
    years: '1997–2012',
    start: 1997,
    end: 2012,
    parentEra: 'post-9/11 and smartphone childhoods',
  },
  alpha: {
    slug: 'alpha',
    label: 'Generation Alpha',
    years: '2013–2024',
    start: 2013,
    end: 2024,
    parentEra: 'pandemic era and AI-augmented childhoods',
  },
};

export const COHORT_LIST: CohortSlug[] = ['greatest', 'silent', 'boomer', 'genx', 'millennial', 'genz', 'alpha'];

export interface CohortFact {
  firstRealYear: number | null;
  dominantCohort: CohortSlug | null;
  dominantCohortCount: number | null;
  totalBirths: number | null;
}

export function getCohortFact(slug: string): CohortFact | null {
  const row = getDb()
    .prepare(
      'SELECT first_real_year, dominant_cohort, dominant_cohort_count, total_births FROM names WHERE slug = ?'
    )
    .get(slug) as
    | { first_real_year: number | null; dominant_cohort: string | null; dominant_cohort_count: number | null; total_births: number | null }
    | undefined;
  if (!row) return null;
  return {
    firstRealYear: row.first_real_year,
    dominantCohort: row.dominant_cohort as CohortSlug | null,
    dominantCohortCount: row.dominant_cohort_count,
    totalBirths: row.total_births,
  };
}
