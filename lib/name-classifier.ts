/**
 * Interpretation Strip classifier — site-specific lever for /name/.
 *
 * Bins a name into one of 6 categories based on its rank-trajectory shape and
 * cohort-portfolio. The interpretation strip on /name/[slug]/ then renders a
 * category-specific 4-section explainer:
 *   1. how-to-read-the-rank — what does "#147" actually mean for this name?
 *   2. common-mistakes — what readers wrongly conclude from this rank
 *   3. what-NOT-included — limits of the SSA dataset for this category
 *   4. practical-example — a concrete illustration from peer names
 *
 * The 6 categories are *interpretation-relevant*, not data-relevant — two
 * names with very different cohort indices may share an interpretation
 * category (e.g., a fading classic and a single-gen spike both call for the
 * "rank flatters" warning), and a name with the same cohort index may shift
 * categories if its peak rank is high vs low.
 *
 * Categories:
 *   • legendary-classic — top-100 in 4+ cohorts → rank means "still in fashion"
 *   • vintage-revival — peaked pre-1970 + GenZ/Alpha share rising → revival warning
 *   • modern-mainstream — peak after 1990, rank stable → modern parents' shortlist
 *   • niche-pick — sub-0.1% all-time → rank flatters; small denominators
 *   • fading — ever ranked top-50, now outside top-500 → rank conceals decline
 *   • recent-burst — emergent + climbing 5y → rank lags reality
 */
import type { CohortIndex } from './cohort-index';
import type { NameFitBucket } from './name-fit';

export type InterpretationCategory =
  | 'legendary-classic'
  | 'vintage-revival'
  | 'modern-mainstream'
  | 'niche-pick'
  | 'fading'
  | 'recent-burst';

export interface InterpretationContext {
  category: InterpretationCategory;
  categoryLabel: string;
  rankReading: string;
  commonMistakes: string;
  notIncluded: string;
  practicalExample: string;
}

export interface ClassifierBranchingContext {
  tier: InterpretationCategory;
  tierLabel: string;
  fitBuckets: NameFitBucket[];
  paragraphs: [string, string, string, string];
}

const CATEGORY_LABELS: Record<InterpretationCategory, string> = {
  'legendary-classic': 'Legendary Classic',
  'vintage-revival': 'Vintage Revival',
  'modern-mainstream': 'Modern Mainstream',
  'niche-pick': 'Niche Pick',
  fading: 'Fading',
  'recent-burst': 'Recent Burst',
};

interface ClassifyInput {
  name: string;
  gender: string;
  peakYear: number | null;
  peakPct: number | null;
  cohortIndex: CohortIndex | null;
  recentTrendPct: number | null; // last-5y avg pct
  totalNamesInGender: number;
  rank: number | null;
}

export function classifyInterpretation(input: ClassifyInput): InterpretationContext {
  const { name, gender, peakYear, peakPct, cohortIndex, recentTrendPct } = input;
  const isHistoric = peakYear !== null && peakYear < 1970;
  const isModern = peakYear !== null && peakYear >= 1990;
  const isNiche = peakPct !== null && peakPct < 0.001;
  const isFading = peakPct !== null && peakPct >= 0.005 && recentTrendPct !== null && recentTrendPct < peakPct * 0.2;
  const isReviving = isHistoric && cohortIndex !== null && (cohortIndex.cohortShares.genz + cohortIndex.cohortShares.alpha) > 0.05;
  const isBursting = cohortIndex?.bucket === 'emergent' && recentTrendPct !== null && peakPct !== null && recentTrendPct > peakPct * 0.6;

  let category: InterpretationCategory;
  if (cohortIndex?.bucket === 'multi-gen-staple') category = 'legendary-classic';
  else if (isReviving) category = 'vintage-revival';
  else if (isBursting) category = 'recent-burst';
  else if (isNiche) category = 'niche-pick';
  else if (isFading) category = 'fading';
  else if (isModern) category = 'modern-mainstream';
  else category = 'fading'; // default fall-through for old-but-not-classifiable

  const genderLabel = gender === 'boy' ? 'boy' : gender === 'girl' ? 'girl' : 'baby';
  const peakRankShare = peakPct ? `${(peakPct * 100).toFixed(2)}%` : 'an unrecorded share';
  const peakYearStr = peakYear ? `${peakYear}` : 'an undated year';

  const out: InterpretationContext = (() => {
    switch (category) {
      case 'legendary-classic':
        return {
          category,
          categoryLabel: CATEGORY_LABELS[category],
          rankReading: `${name} is a multi-generation staple. A current rank of "#X" understates the name's cumulative footprint — the SSA file shows ${name} appearing in the top 1,000 across at least four generational cohorts (Greatest through Alpha). The rank you see here reflects this year's slice, not the name's enduring presence.`,
          commonMistakes: `The most common misreading: assuming a multi-gen staple is "trendy now." Names like ${name} are typically chosen for continuity, not novelty. A modest current rank (50–200) is more characteristic of staples than a top-10 spike.`,
          notIncluded: `What our SSA-derived data does not capture: how ${name} is used as a middle name, family-tradition naming, or non-US ${gender === 'boy' ? 'boys' : gender === 'girl' ? 'girls' : 'babies'}. Multi-gen staples often appear in family trees as middle names long after first-name use fades.`,
          practicalExample: `If you're choosing ${name} expecting a "classic but uncommon" outcome, check the rank trend across the last 30 years — most legendary classics oscillate between #50 and #300, never falling out of the top 1,000.`,
        };
      case 'vintage-revival':
        return {
          category,
          categoryLabel: CATEGORY_LABELS[category],
          rankReading: `${name} peaked decades ago (${peakYearStr}) but is reappearing in GenZ and Alpha cohorts. The current rank includes the early signal of a revival — a #X today may double-rank within 5 years if the trend continues.`,
          commonMistakes: `The most common misreading: treating ${name} as "old-fashioned" because of its peak year. Revival names move *because* they sound vintage to current parents, who associate them with great-grandparents rather than peers.`,
          notIncluded: `What the SSA file does not capture: regional revival patterns (some vintage names revive in coastal cities first), media-driven revivals (a TV character named ${name} can shift a year's count by thousands), or the gap between "considered" and "registered."`,
          practicalExample: `If you want a vintage revival but worry about peer-overlap, check whether the name's recent 5-year trend is steeper than +30% — that's the threshold past which the name is likely to be on multiple birth-year shortlists in the same room.`,
        };
      case 'recent-burst':
        return {
          category,
          categoryLabel: CATEGORY_LABELS[category],
          rankReading: `${name} is on an active climb — last-5-year share is materially higher than its all-time average. The current rank lags reality by 1–2 years, since rank is computed from the most recent year's count and the climb is still accelerating.`,
          commonMistakes: `The most common misreading: assuming a current rank of #X means "${name} has been at #X for years." For names in a recent burst, X may have been #500+ five years ago. Always check the rank trajectory chart, not just the latest number.`,
          notIncluded: `What the SSA file does not capture: the cause of the burst (a celebrity birth, a TV character, a viral name story). The data shows the climb but not the trigger — and the trigger is the best predictor of whether the climb continues.`,
          practicalExample: `If you choose ${name} expecting "uncommon," anchor your expectation to the projected rank in 3 years, not the current rank. A rapid-burst name often doubles in count year-over-year before plateauing.`,
        };
      case 'niche-pick':
        return {
          category,
          categoryLabel: CATEGORY_LABELS[category],
          rankReading: `${name} is a niche pick: peak share was under 0.1% of US ${genderLabel} births in any single year. This means the rank denominator is small — small year-to-year shifts in absolute count produce large rank swings. A move from #1,847 to #2,103 is statistical noise, not a trend.`,
          commonMistakes: `The most common misreading: comparing a niche-pick rank to a top-100 rank as if they share scale. Niche ranks are dominated by counting noise; top-100 ranks reflect real fashion movement.`,
          notIncluded: `What the SSA file does not capture: names below 5 occurrences per year are dropped entirely (privacy threshold). For very niche names, a "no data this year" reading does not mean zero use — it means under 5 babies registered with that name.`,
          practicalExample: `If you choose ${name} for uniqueness, pair it with the cohort-portfolio chart rather than the rank — niche names show their character more clearly in cohort distribution than in the noisy annual rank ladder.`,
        };
      case 'fading':
        return {
          category,
          categoryLabel: CATEGORY_LABELS[category],
          rankReading: `${name} is a fading name. It has historical popularity (peak share around ${peakRankShare} in ${peakYearStr}) but recent-5-year average is under 20% of peak. The current rank, while still inside the file, reflects the tail of decline rather than active fashion.`,
          commonMistakes: `The most common misreading: assuming a fading name will "come back automatically" because of revival cycles. Most names that fade past 80% of peak do not revive — only ~10–15% return to within 50% of historical peak.`,
          notIncluded: `What the SSA file does not capture: regional pockets where the name remains in active use (e.g., an ethnic-community-bound name fading in national counts but stable within community). Always cross-reference local naming context if heritage matters.`,
          practicalExample: `If you choose ${name} for the "vintage but available" feel, verify the cohort-index chart — a fading classic with no GenZ/Alpha presence is less likely to revive than one with even 3–5% share in those cohorts.`,
        };
      case 'modern-mainstream':
      default:
        return {
          category: 'modern-mainstream',
          categoryLabel: CATEGORY_LABELS['modern-mainstream'],
          rankReading: `${name} peaked after 1990 and has stable rank trajectory. The current rank is a fair representation of the name's "right-now" popularity — what you see is approximately what you'll get in your child's classroom in 5 years.`,
          commonMistakes: `The most common misreading: assuming "modern mainstream" means "boring." Modern-mainstream names often sit at the cultural midpoint by design — chosen for low risk on both novelty and dating.`,
          notIncluded: `What the SSA file does not capture: spelling variants (${name} vs alternative spellings) are counted separately, so the *aggregate* presence of a name family may be much higher than the rank of any one spelling.`,
          practicalExample: `If you want to predict your child's classroom share, multiply the current rank's share-of-births by the cohort size for their birth year. Modern-mainstream names produce reliable estimates; classic and burst names do not.`,
        };
    }
  })();

  return out;
}

function fitBucketLabel(bucket: NameFitBucket): string {
  return bucket.replace(/-/g, ' ');
}

function categoryFrame(category: InterpretationCategory): string {
  switch (category) {
    case 'legendary-classic':
      return 'a broad, durable name record whose rank can move without changing its familiar public reading';
    case 'vintage-revival':
      return 'an older name returning into newer cohorts, so age-of-peak and recent use must be read together';
    case 'modern-mainstream':
      return 'a contemporary shortlist name where current rank is usually a fair guide to peer overlap';
    case 'niche-pick':
      return 'a small-denominator name where exact rank moves are less meaningful than the overall rarity band';
    case 'fading':
      return 'a historically visible name whose current use is the tail of an older popularity wave';
    case 'recent-burst':
      return 'a climbing name where the most recent slope matters more than the all-time peak';
  }
}

export function classifyNameBranching(
  input: ClassifyInput & { fitBuckets?: NameFitBucket[] },
): ClassifierBranchingContext {
  const interpretation = classifyInterpretation(input);
  const rankText = input.rank != null ? `#${input.rank.toLocaleString()}` : 'outside the visible rank';
  const peakText = input.peakYear != null && input.peakPct != null
    ? `peaked in ${input.peakYear} at ${(input.peakPct * 100).toFixed(3)}% of same-gender births`
    : 'has no single clear SSA peak year in this row';
  const fitBuckets = input.fitBuckets ?? [];
  const fitText = fitBuckets.length > 0
    ? fitBuckets.map(fitBucketLabel).join(' + ')
    : 'no separate fit bucket';
  const cohortText = input.cohortIndex
    ? `${input.cohortIndex.bucketLabel} with ${input.cohortIndex.carryingCount} carrying cohorts`
    : 'limited cohort coverage';

  return {
    tier: interpretation.category,
    tierLabel: interpretation.categoryLabel,
    fitBuckets,
    paragraphs: [
      `${input.name} is classified as ${interpretation.categoryLabel}: ${categoryFrame(interpretation.category)}. The page rank is ${rankText}, while the SSA peak record says ${peakText}. Those two facts answer different questions: rank helps compare names, and peak share explains the largest historical footprint.`,
      `The strongest adjacent style lens is ${fitText}. Read that style label after the SSA facts, not before them. A name can be traditional in one cohort and distinctive in another, so the classifier keeps the data order visible: cohort shape, rank, fit bucket, then reader interpretation.`,
      `The main caution for ${input.name} is category-specific. ${interpretation.commonMistakes} This is why the page gives a full branching explanation instead of a single popularity chip; the same rank can mean very different things for a revival, a fading name, and a recent burst.`,
      `Use the branch as a practical checklist: ${cohortText}, ${rankText}, and the ${interpretation.categoryLabel} category. If those signals align, the name's public reading is fairly stable. If they conflict, compare the trend chart and similar-name peers before drawing a conclusion from the rank alone.`,
    ],
  };
}
