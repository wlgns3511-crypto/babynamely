/**
 * Cross-Generation Cohort Index (CGCI) — site-specific lever for /name/.
 *
 * Bucketizes a name into one of 5 generation-portfolio classes based on which
 * SSA-defined cohorts (Greatest, Silent, Boomer, GenX, Millennial, GenZ, Alpha)
 * carry meaningful share of the name's all-time births.
 *
 * Threshold: a cohort "carries share" if its share of the name's total births
 * is ≥ 12% (one out of seven cohorts uniformly = 14.3%, so 12% is roughly
 * "above-average for this name within that cohort vs uniform spread").
 *
 * Why this is a lever, not just a stat:
 *   • A name with 4 cohorts above threshold is qualitatively different from a
 *     name with 1 — multi-generation staples (Sarah, John) have very different
 *     parent-perception than single-generation spikes (Khaleesi, Brittany).
 *   • Existing fields surface raw data (peak_year, peak_pct, dominant_cohort);
 *     CGCI surfaces *cross-cohort distribution shape* in one classifier.
 *   • Maps directly to the interpretation strip's "what does the rank tell
 *     you?" question — readers parse "this is a multi-gen staple" faster than
 *     a 7-bar histogram.
 *
 * NOT a substitute for the trajectory archetype — archetype classifies by
 * curve shape (vintage / modern / climber / fading / etc.), CGCI classifies
 * by cohort-presence portfolio. Two orthogonal axes.
 */
import { COHORTS, COHORT_LIST, type CohortSlug } from './cohort';
import type { PopularityRow } from './db';

const COHORT_SHARE_THRESHOLD = 0.12;

export type CohortIndexBucket =
  | 'multi-gen-staple'
  | 'cross-era-classic'
  | 'single-gen-spike'
  | 'fading-classic'
  | 'emergent';

export interface CohortIndex {
  bucket: CohortIndexBucket;
  bucketLabel: string;
  cohortShares: Record<CohortSlug, number>;
  carryingCohorts: CohortSlug[];
  carryingCount: number;
  dominantCohort: CohortSlug | null;
  dominantShare: number;
  oneSentence: string;
}

const BUCKET_LABELS: Record<CohortIndexBucket, string> = {
  'multi-gen-staple': 'Multi-Generation Staple',
  'cross-era-classic': 'Cross-Era Classic',
  'single-gen-spike': 'Single-Generation Spike',
  'fading-classic': 'Fading Classic',
  emergent: 'Emergent (post-2000)',
};

function isAdjacent(a: CohortSlug, b: CohortSlug): boolean {
  const ai = COHORT_LIST.indexOf(a);
  const bi = COHORT_LIST.indexOf(b);
  return Math.abs(ai - bi) === 1;
}

function hasNonAdjacentPair(cohorts: CohortSlug[]): boolean {
  for (let i = 0; i < cohorts.length; i++) {
    for (let j = i + 1; j < cohorts.length; j++) {
      if (!isAdjacent(cohorts[i], cohorts[j])) return true;
    }
  }
  return false;
}

export function classifyCohortIndex(name: string, popularity: PopularityRow[]): CohortIndex | null {
  if (popularity.length === 0) return null;

  // Sum births per cohort. SSA pct is share-of-births of that gender that year,
  // not absolute count, but for relative cohort-portfolio classification the
  // sum is monotonically proportional to absolute births.
  const cohortShares: Record<CohortSlug, number> = {
    greatest: 0,
    silent: 0,
    boomer: 0,
    genx: 0,
    millennial: 0,
    genz: 0,
    alpha: 0,
  };
  let total = 0;
  for (const row of popularity) {
    for (const cohort of COHORT_LIST) {
      const meta = COHORTS[cohort];
      if (row.year >= meta.start && row.year <= meta.end) {
        cohortShares[cohort] += row.pct;
        total += row.pct;
        break;
      }
    }
  }
  if (total === 0) return null;
  for (const cohort of COHORT_LIST) cohortShares[cohort] /= total;

  const carryingCohorts = COHORT_LIST.filter((c) => cohortShares[c] >= COHORT_SHARE_THRESHOLD);
  const dominantCohort = COHORT_LIST.reduce((acc, c) => (cohortShares[c] > cohortShares[acc] ? c : acc), 'greatest' as CohortSlug);
  const dominantShare = cohortShares[dominantCohort];

  let bucket: CohortIndexBucket;
  const carryingCount = carryingCohorts.length;
  const olderOnly = carryingCohorts.every((c) => COHORT_LIST.indexOf(c) <= COHORT_LIST.indexOf('genx'));
  const newerOnly = carryingCohorts.every((c) => COHORT_LIST.indexOf(c) >= COHORT_LIST.indexOf('millennial'));

  if (carryingCount >= 4) {
    bucket = 'multi-gen-staple';
  } else if (carryingCount >= 2 && hasNonAdjacentPair(carryingCohorts)) {
    bucket = 'cross-era-classic';
  } else if (carryingCount <= 2 && newerOnly) {
    bucket = 'emergent';
  } else if (carryingCount <= 2 && olderOnly && cohortShares.alpha < 0.05 && cohortShares.genz < 0.05) {
    bucket = 'fading-classic';
  } else {
    bucket = 'single-gen-spike';
  }

  const dominantLabel = COHORTS[dominantCohort].label;
  const oneSentence = (() => {
    switch (bucket) {
      case 'multi-gen-staple':
        return `${name} carries meaningful share across ${carryingCount} cohorts (Greatest through Alpha) — this name is a true multi-generation staple, found in family trees from great-grandparents through children born today.`;
      case 'cross-era-classic':
        return `${name} appears in non-adjacent cohorts (${carryingCohorts.map((c) => COHORTS[c].label).join(' + ')}), making it a cross-era classic that has cycled in and out of fashion across generations.`;
      case 'single-gen-spike':
        return `${name} concentrates ${(dominantShare * 100).toFixed(0)}% of all-time use in the ${dominantLabel} cohort, making it a single-generation spike — a name strongly bound to one era's parents.`;
      case 'fading-classic':
        return `${name} was popular among older cohorts (${carryingCohorts.map((c) => COHORTS[c].label).join(', ')}) but draws under 5% share from GenZ or Alpha, making it a fading classic with limited use among today's parents.`;
      case 'emergent':
        return `${name} concentrates in Millennial+ cohorts with little to no presence pre-1980, making it an emergent name — likely unfamiliar to grandparent generations.`;
    }
  })();

  return {
    bucket,
    bucketLabel: BUCKET_LABELS[bucket],
    cohortShares,
    carryingCohorts,
    carryingCount,
    dominantCohort,
    dominantShare,
    oneSentence,
  };
}
