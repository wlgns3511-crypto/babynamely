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

export type ArchetypeSlug =
  | 'modern'
  | 'vintage'
  | 'classic'
  | 'burst'
  | 'climber'
  | 'ancient'
  | 'fading'
  | 'steady';

export interface ArchetypeMeta {
  slug: ArchetypeSlug;
  label: string;
  short: string;
  long: string;
  example: string;
  emoji: string;
  tone: 'indigo' | 'amber' | 'emerald' | 'rose' | 'slate' | 'sky' | 'purple' | 'teal';
}

export const ARCHETYPES: Record<ArchetypeSlug, ArchetypeMeta> = {
  modern: {
    slug: 'modern',
    label: 'Modern Phenomenon',
    short: 'Brand-new in the SSA file — first appeared in 2000+ and peaked in the 2010s.',
    long:
      'Names with first SSA appearance in 2000 or later that peaked in 2010+. These are genuinely modern — the cohort of parents giving these names today is the first generation to use them at scale.',
    example: 'Mateo, Aria, Luna, Ezra',
    emoji: '🌱',
    tone: 'emerald',
  },
  vintage: {
    slug: 'vintage',
    label: 'Vintage Revival',
    short: 'Old name with a fresh comeback — peaked before 1965 and is rising again.',
    long:
      'Names that peaked before 1965, fell to a mid-century low (1950–1990), and have at least doubled their share in 2020–2024. These are grandparent-era names parents are choosing again.',
    example: 'Theodore, Hazel, Eleanor, Henry',
    emoji: '🕰️',
    tone: 'amber',
  },
  classic: {
    slug: 'classic',
    label: 'Timeless Classic',
    short: 'Sustained presence — used at meaningful share for 80+ years.',
    long:
      'Names with at least 80 years where their share of US births was ≥0.1% — present in nearly every cohort from 1880 to today.',
    example: 'James, Elizabeth, William, Mary',
    emoji: '👑',
    tone: 'indigo',
  },
  burst: {
    slug: 'burst',
    label: 'Quick Burst',
    short: 'Fast rise to a high peak, then a steep fall within ~30 years.',
    long:
      'Names that hit ≥0.5% of births at peak but collapsed to ≤20% of that peak — and the entire arc fits inside a 30-year window. Often associated with a single celebrity, character, or cultural moment.',
    example: 'Heather, Aiden (in some windows), Jennifer',
    emoji: '🌠',
    tone: 'rose',
  },
  climber: {
    slug: 'climber',
    label: 'Steady Climber',
    short: 'Last 5 years averaging ≥1.5× the first 5 years — gradual long-term rise.',
    long:
      "Names whose recent 5-year average share is at least 1.5× their earliest 5-year average. Different from Modern Phenomenon — these names started earlier but kept climbing.",
    example: 'Sebastian, Charlotte, Levi, Aurora',
    emoji: '📈',
    tone: 'sky',
  },
  ancient: {
    slug: 'ancient',
    label: 'Ancient Decline',
    short: 'Peaked before 1950 and now sits below 10% of that peak with no revival.',
    long:
      "Names that peaked before 1950 and whose 2024 share is at most 10% of the historical peak. They appear in old census records but rarely on today's playgrounds.",
    example: 'Ethel, Bertha, Mildred, Wilbur',
    emoji: '📜',
    tone: 'slate',
  },
  fading: {
    slug: 'fading',
    label: 'Fading',
    short: 'Recent peak (post-1965) but already down to ≤30% of that peak.',
    long:
      'Names that peaked in 1965 or later but have already dropped to 30% or less of peak share. Often these are parents-and-grandparents-era names that read as dated to a younger cohort.',
    example: 'Jennifer, Brittany, Christopher, Joshua',
    emoji: '🍂',
    tone: 'rose',
  },
  steady: {
    slug: 'steady',
    label: 'Steady',
    short: 'Consistent moderate presence — no spike, no collapse.',
    long:
      "Names that don't fit any of the seven dramatic patterns. Their share of births moves up and down within a narrow band; they're neither classics nor revivals.",
    example: 'Margaret, David, Susan',
    emoji: '➿',
    tone: 'teal',
  },
};

export const ARCHETYPE_LIST: ArchetypeSlug[] = [
  'modern',
  'vintage',
  'classic',
  'burst',
  'climber',
  'ancient',
  'fading',
  'steady',
];

export interface ArchetypeName {
  slug: string;
  name: string;
  gender: string;
  origin: string | null;
  meaning: string | null;
  peak_year: number | null;
  peak_pct: number | null;
  archetype: string | null;
  archetype_score: number | null;
}

export function getArchetypeForSlug(slug: string): { archetype: ArchetypeSlug | null; score: number | null } {
  const row = getDb()
    .prepare('SELECT archetype, archetype_score FROM names WHERE slug = ?')
    .get(slug) as { archetype: string | null; archetype_score: number | null } | undefined;
  if (!row || !row.archetype) return { archetype: null, score: null };
  return { archetype: row.archetype as ArchetypeSlug, score: row.archetype_score };
}

export function getNamesByArchetype(archetype: ArchetypeSlug, limit = 200): ArchetypeName[] {
  return getDb()
    .prepare(
      'SELECT slug, name, gender, origin, meaning, peak_year, peak_pct, archetype, archetype_score FROM names WHERE archetype = ? ORDER BY archetype_score DESC NULLS LAST, peak_pct DESC NULLS LAST LIMIT ?'
    )
    .all(archetype, limit) as ArchetypeName[];
}

export function countNamesByArchetype(archetype: ArchetypeSlug): number {
  const row = getDb()
    .prepare('SELECT COUNT(*) as c FROM names WHERE archetype = ?')
    .get(archetype) as { c: number };
  return row.c;
}
