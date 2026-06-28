/**
 * Phase 7 atomic-bundle crosswalk (§3.3) — name-popularity verdict.
 *
 * Wraps the existing 8-archetype PSU classifier + annual-rank time series into
 * a 4-band CrosswalkNameResult. The verdict (A/B/C/D) answers a question that
 * cannot be inlined by an LLM without running the SSA rank join + archetype
 * classifier: "where does this name sit on the popularity × vintage matrix?"
 *
 * Band design (Trap #111 honest distribution, measured over 7,767-name keep set):
 *   A = Top Pick      — rank ≤ 500 in 2010-2024 (currently/recently top-tier)
 *   B = Familiar      — rank 501-2000 in 2010-2024 (mid-tier mainstream)
 *   C = Heritage      — rank 2001-5000, OR vintage/classic archetype at any
 *                       rank (heritage names retain notability even at low rank)
 *   D = Rare Pick     — no rank in 2010-2024, or rank > 5000, and not heritage
 *
 * Vintage/classic-overrides-into-C is the semantic hinge: a classic-archetype
 * name like "Margaret" rank 250 still routes to A (Top Pick has primacy),
 * but a vintage-archetype name like "Cordelia" rank 1800 routes to C
 * (heritage feel overrides Familiar tier). Same precedence pattern as
 * vocabwize "AWL pre-empts CEFR" — band-priority A > C > B > D.
 */
import Database from 'better-sqlite3';
import path from 'path';
import { getArchetypeForSlug, ARCHETYPES, type ArchetypeSlug } from './archetype';

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

export type NameVerdictKey = 'A' | 'B' | 'C' | 'D';
export type NameVerdict = 'Top Pick' | 'Familiar' | 'Heritage' | 'Rare Pick';

export interface CrosswalkNameResult {
  slug: string;
  name: string;
  verdict: NameVerdict;
  verdictKey: NameVerdictKey;
  archetype: ArchetypeSlug | null;
  archetypeLabel: string;
  bestRecentRank: number | null;
  // Body chip + title tier tag. For verdict A/B/D this is the archetype label
  // (Modern/Climber/Steady/etc); for C it's "Vintage" or "Classic" (the
  // heritage override) when that's what triggered the band, else "Heritage".
  tierTag: string;
  reason: string;
}

const ARCHETYPE_SHORT: Record<ArchetypeSlug, string> = {
  modern: 'Modern',
  vintage: 'Vintage',
  classic: 'Classic',
  burst: 'Burst',
  climber: 'Climber',
  ancient: 'Ancient',
  fading: 'Fading',
  steady: 'Steady',
};

function getBestRecentRank(slug: string): number | null {
  const row = getDb()
    .prepare(
      'SELECT MIN(rank) AS r FROM name_year_rank WHERE slug = ? AND year >= 2010'
    )
    .get(slug) as { r: number | null } | undefined;
  return row?.r ?? null;
}

function classifyVerdict(
  bestRank: number | null,
  archetype: ArchetypeSlug | null
): { key: NameVerdictKey; verdict: NameVerdict; tierTag: string; reason: string } {
  const isHeritage = archetype === 'vintage' || archetype === 'classic';
  if (bestRank !== null && bestRank <= 500) {
    return {
      key: 'A',
      verdict: 'Top Pick',
      tierTag: archetype ? ARCHETYPE_SHORT[archetype] : 'Top',
      reason: `Best annual rank ${bestRank} in 2010–2024 (top 500).`,
    };
  }
  if (isHeritage) {
    return {
      key: 'C',
      verdict: 'Heritage',
      tierTag: archetype === 'classic' ? 'Classic' : 'Vintage',
      reason:
        archetype === 'classic'
          ? 'Classic archetype: ≥80 yrs of ≥0.1% share — heritage feel overrides mid-tier rank.'
          : 'Vintage archetype: peaked before 1965 with a fresh comeback — heritage feel overrides mid-tier rank.',
    };
  }
  if (bestRank !== null && bestRank <= 2000) {
    return {
      key: 'B',
      verdict: 'Familiar',
      tierTag: archetype ? ARCHETYPE_SHORT[archetype] : 'Familiar',
      reason: `Best annual rank ${bestRank} in 2010–2024 (501–2000 — mid-tier).`,
    };
  }
  if (bestRank !== null && bestRank <= 5000) {
    return {
      key: 'C',
      verdict: 'Heritage',
      tierTag: archetype ? ARCHETYPE_SHORT[archetype] : 'Heritage',
      reason: `Best annual rank ${bestRank} in 2010–2024 (2001–5000 — long-tail recognized).`,
    };
  }
  return {
    key: 'D',
    verdict: 'Rare Pick',
    tierTag: archetype ? ARCHETYPE_SHORT[archetype] : 'Rare',
    reason:
      bestRank === null
        ? 'Not in SSA top-1000 since 2010 — uncommon contemporary choice.'
        : `Best annual rank ${bestRank} in 2010–2024 (>5000 — rare contemporary choice).`,
  };
}

export function classifyCrosswalkName(
  slug: string,
  name: string
): CrosswalkNameResult | null {
  if (!slug || !name) return null;
  const { archetype } = getArchetypeForSlug(slug);
  const bestRecentRank = getBestRecentRank(slug);
  const v = classifyVerdict(bestRecentRank, archetype);
  return {
    slug,
    name,
    verdict: v.verdict,
    verdictKey: v.key,
    archetype,
    archetypeLabel: archetype ? ARCHETYPES[archetype].label : 'Unclassified',
    bestRecentRank,
    tierTag: v.tierTag,
    reason: v.reason,
  };
}

/**
 * Title-side composite tag — used by generateMetadata title.absolute.
 * Pattern: `{Name} — {Verdict} ({TierTag})`.
 * Worst case 33c (11c name + 3 + 9 + 2 + 7 + 1) under 60c length guard.
 */
export function nameCrosswalkTitleTag(c: CrosswalkNameResult): string {
  return `${c.verdict} (${c.tierTag})`;
}

/**
 * Schema.org PropertyValue rows surfaced under Dataset.variableMeasured.
 * Adds 3 verdict-bearing rows (NamePopularityVerdict + NameArchetype +
 * BestRecentRank) to whatever fixed columns the page already emits.
 */
export function nameVariableMeasured(
  c: CrosswalkNameResult
): Array<Record<string, unknown>> {
  const out: Array<Record<string, unknown>> = [
    {
      '@type': 'PropertyValue',
      name: 'NamePopularityVerdict',
      value: c.verdict,
      description:
        '4-band verdict (Top Pick / Familiar / Heritage / Rare Pick) derived from best SSA annual rank 2010-2024 with vintage/classic archetype overriding into Heritage.',
    },
    {
      '@type': 'PropertyValue',
      name: 'NameArchetype',
      value: c.archetypeLabel,
      description:
        'Trajectory archetype (Modern Phenomenon / Vintage Revival / Timeless Classic / Quick Burst / Steady Climber / Ancient Decline / Fading / Steady) computed from 1880-2024 share-of-births curve shape.',
    },
  ];
  if (c.bestRecentRank !== null) {
    out.push({
      '@type': 'PropertyValue',
      name: 'BestRecentRank',
      value: c.bestRecentRank,
      description:
        'Best (lowest-numbered) SSA annual rank attained by this name in years 2010-2024.',
    });
  }
  return out;
}
