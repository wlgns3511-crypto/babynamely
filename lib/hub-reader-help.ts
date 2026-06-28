/**
 * Hub-level 4-paragraph reader-help generators for NameBlooms guide surfaces.
 *
 * Each generator returns deterministic paragraphs tied to SSA / Census-backed
 * name data. The functions do not invent cultural claims; they explain how to
 * read the already-visible fields on /name/ and /guide/ pages.
 */

import type { CohortIndex } from './cohort-index';
import type { InterpretationCategory } from './name-classifier';
import type { NameFitBucket } from './name-fit';

export interface NameReaderHelpInput {
  name: string;
  gender: string;
  rank: number | null;
  totalNames: number;
  peakYear: number | null;
  peakPct: number | null;
  origin: string | null;
  meaning: string | null;
  cohortIndex: CohortIndex | null;
  interpretationCategory: InterpretationCategory | null;
  fitBucket: NameFitBucket | null;
}

export interface NameReaderHelp {
  intro: string;
  whatItMeans: string;
  howToUse: string;
  caveats: string;
}

function genderLabel(gender: string): string {
  return gender === 'boy' ? 'boy names' : gender === 'girl' ? 'girl names' : 'names';
}

function rankText(input: NameReaderHelpInput): string {
  return input.rank && input.totalNames > 0
    ? `#${input.rank.toLocaleString()} of ${input.totalNames.toLocaleString()} tracked ${genderLabel(input.gender)}`
    : 'outside the ranked slice shown for this page';
}

function peakText(input: NameReaderHelpInput): string {
  if (!input.peakYear || input.peakPct == null) return 'without a single clear peak year in the visible SSA row';
  return `peaking in ${input.peakYear} at ${(input.peakPct * 100).toFixed(3)}% of same-gender births`;
}

export function generateSsaBabyNameDataReaderHelp(input: NameReaderHelpInput): NameReaderHelp {
  return {
    intro: `${input.name} is read here through the SSA baby-name series, the national registry that starts in 1880 and reports annual first-name counts once a name clears the privacy threshold.`,
    whatItMeans: `On this page, ${input.name} is ${rankText(input)} by peak popularity, ${peakText(input)}. Rank is a sorting convenience; the underlying signal is share of births in each year, which lets older and newer names be compared on the same scale.`,
    howToUse: `Use the SSA row to separate long-run popularity from current visibility. A name can have a high all-time peak but low recent use, or a modest all-time peak but a sharp recent climb. The cohort chart and interpretation category below explain which case applies.`,
    caveats: `SSA data counts US registered first names only. It does not include middle-name usage, nicknames, regional pockets, spelling-family aggregates, or private cultural associations families attach to the name.`,
  };
}

export function generateNamePopularityCyclesReaderHelp(input: NameReaderHelpInput): NameReaderHelp {
  const cohort = input.cohortIndex?.bucketLabel ?? 'unclassified cohort shape';
  return {
    intro: `${input.name}'s popularity cycle is best read as a cohort pattern, not a single-year rank. The Cross-Generation Cohort Index labels this page as ${cohort}.`,
    whatItMeans: `The cycle label shows whether the name belongs to one parent generation, several adjacent cohorts, or a broad multi-generation span. ${input.name} ${peakText(input)}, but the peak is only one point in that cycle.`,
    howToUse: `Read the current page from left to right: peak year first, cohort spread second, and similar-name peers third. If those three signals agree, the name's cycle is stable; if they conflict, the name is likely in transition.`,
    caveats: `Cycle labels are derived from national SSA counts. They cannot identify the cause of a revival, whether a media event changed the slope, or whether a local community is ahead of the national curve.`,
  };
}

export function generateCulturalNameTrendsReaderHelp(input: NameReaderHelpInput): NameReaderHelp {
  const origin = input.origin ? `${input.origin} origin` : 'an origin field that is not specific enough to anchor a single culture';
  return {
    intro: `${input.name} is shown with ${origin}. The site treats origin as context for reading a name record, not as proof of a family's identity or heritage.`,
    whatItMeans: `Origin and meaning help explain why a name may carry across communities, but the SSA popularity line still measures US registration behavior. For ${input.name}, the measurable record is the national first-name series, not a complete cultural history.`,
    howToUse: `Use origin as a cross-check against sound, spelling, and cohort fit. A short vowel-forward name may travel easily across languages; a formal multi-syllable name may read more traditional in US records even when it has international roots.`,
    caveats: `The page does not infer ethnicity, religion, race, or family background from a name. Census name resources and public etymology references are context sources; the SSA row is the quantitative source.`,
  };
}

export function generateUniqueVsCommonNameImpactReaderHelp(input: NameReaderHelpInput): NameReaderHelp {
  return {
    intro: `${input.name}'s uniqueness is not a yes-or-no field. It depends on where the name sits in the SSA distribution, how concentrated it is by cohort, and whether similar spellings split the same sound family.`,
    whatItMeans: `A rank of ${rankText(input)} means the name's peak share sits at that point among tracked ${genderLabel(input.gender)}. High rank can still feel uncommon in a specific classroom, while a lower rank can feel familiar if several spellings sound alike.`,
    howToUse: `Compare ${input.name} with nearby names and same-origin peers before treating the rank as a uniqueness decision. The best practical read is relative: how often this exact spelling appears, and how often the sound family appears around it.`,
    caveats: `SSA ranks exact spellings separately. The page does not merge alternate spellings, nicknames, hyphenated forms, or middle-name use, so real-world familiarity can be higher than the exact-spelling rank implies.`,
  };
}

export function generateCgciExplainerReaderHelp(input: NameReaderHelpInput): NameReaderHelp {
  const ci = input.cohortIndex;
  if (!ci) {
    return {
      intro: `${input.name} has limited cohort data in the visible SSA series, so the Cross-Generation Cohort Index is not shown as a strong signal.`,
      whatItMeans: `Without a reliable cohort spread, this page leans more heavily on peak year, peak share, and similar-name peers.`,
      howToUse: `Use the trend chart and rank fields first, then compare the name against alternatives with fuller cohort records.`,
      caveats: `A missing cohort index is a data-shape limitation, not a judgment about the name.`,
    };
  }
  return {
    intro: `${input.name}'s Cross-Generation Cohort Index is ${ci.bucketLabel}. The index groups SSA birth-year shares into seven generational cohorts and counts which cohorts carry meaningful share.`,
    whatItMeans: `${ci.carryingCount} of 7 cohorts carry at least 12% share for ${input.name}. Dominant cohort share is ${(ci.dominantShare * 100).toFixed(0)}%, which shows whether the name is broad-based or concentrated in one generation.`,
    howToUse: `Use CGCI as the quick read before the annual chart. Multi-generation names tolerate rank changes better; single-generation or emergent names need closer reading of the most recent slope.`,
    caveats: `CGCI is a descriptive classifier built from SSA percentages. It does not forecast future rank, and it does not include state-level or family-level naming preferences.`,
  };
}

export function generateInterpretationStripCategoriesReaderHelp(input: NameReaderHelpInput): NameReaderHelp {
  const category = input.interpretationCategory?.replace(/-/g, ' ') ?? 'unclassified';
  return {
    intro: `${input.name}'s interpretation category is ${category}. This category decides which reading warnings appear on the page, so a classic, a revival, and a niche pick do not receive the same explanation.`,
    whatItMeans: `The category translates rank, peak year, peak share, and cohort footprint into a practical reading frame. For ${input.name}, the goal is to explain what the rank can and cannot tell a parent reviewing the SSA row.`,
    howToUse: `Read the four paragraphs as a checklist: rank meaning, common misreading, missing data, and practical example. That sequence keeps the page anchored in data instead of repeating generic name advice.`,
    caveats: `The category is deterministic but still a summary. Borderline names can share more than one signal, so the interpretation should be read alongside the NameFit bucket and the visible popularity chart.`,
  };
}
