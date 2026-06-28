/**
 * NameFit lens (PSU 5-bucket classifier).
 *
 * Deterministic, SSA-backed interpretation layer for /name/[slug]/ pages.
 * Inputs are already-derived name facts: Cross-Generation Cohort Index bucket,
 * name length, simple phonetic pattern, and a boolean cross-cultural usage
 * flag. No random fill, no invented etymology, and no recommendation claim.
 */

import type { CohortIndexBucket } from './cohort-index';

export type NameFitBucket =
  | 'traditional-formal'
  | 'unique-standout'
  | 'international-fluid'
  | 'nature-inspired'
  | 'neutral-safe';

export const NAME_FIT_LABEL: Record<NameFitBucket, string> = {
  'traditional-formal': 'Traditional formal',
  'unique-standout': 'Unique standout',
  'international-fluid': 'International fluid',
  'nature-inspired': 'Nature-inspired',
  'neutral-safe': 'Neutral safe',
};

export const NAME_FIT_TONE: Record<NameFitBucket, string> = {
  'traditional-formal': 'indigo',
  'unique-standout': 'rose',
  'international-fluid': 'emerald',
  'nature-inspired': 'teal',
  'neutral-safe': 'slate',
};

export interface NameFitInput {
  name: string;
  cgciCohort: CohortIndexBucket | null;
  length: number;
  phoneticPattern: string;
  crossCulturalUsage: boolean;
}

export interface NameFitResult {
  primaryBucket: NameFitBucket;
  secondaryBucket: NameFitBucket | null;
  bestFitParents: string;
  considerationsFor: string;
  notIdealIf: string;
  dataNote: string;
}

const NATURE_NAME_ROOTS = [
  'ash', 'aspen', 'bay', 'briar', 'brooke', 'brook', 'cedar', 'clay', 'daisy',
  'dawn', 'fern', 'flora', 'forest', 'hazel', 'iris', 'ivy', 'jade', 'jasmine',
  'juniper', 'lake', 'laurel', 'lily', 'luna', 'maple', 'meadow', 'olive',
  'opal', 'pearl', 'rain', 'raven', 'river', 'rose', 'sage', 'sky', 'stone',
  'summer', 'willow', 'wren',
];

const FORMAL_SUFFIXES = ['beth', 'bert', 'dora', 'dore', 'drick', 'fred', 'line', 'lizabeth', 'margaret', 'thew'];
const SOFT_INTERNATIONAL_ENDINGS = ['a', 'i', 'ia', 'io', 'is', 'o'];

function normalized(name: string): string {
  return name.toLowerCase().replace(/[^a-z]/g, '');
}

function hasNatureRoot(name: string): boolean {
  const n = normalized(name);
  return NATURE_NAME_ROOTS.some((root) => n === root || n.includes(root));
}

function hasFormalShape(name: string): boolean {
  const n = normalized(name);
  return n.length >= 7 || FORMAL_SUFFIXES.some((suffix) => n.endsWith(suffix));
}

function hasInternationalShape(name: string): boolean {
  const n = normalized(name);
  return n.length >= 3 && n.length <= 6 && SOFT_INTERNATIONAL_ENDINGS.some((ending) => n.endsWith(ending));
}

function isDistinctivePattern(input: NameFitInput): boolean {
  const n = normalized(input.name);
  const rareLetters = /[qxz]/.test(n);
  const compact = input.length <= 4 && input.phoneticPattern.includes('V');
  return rareLetters || compact || input.cgciCohort === 'emergent' || input.cgciCohort === 'single-gen-spike';
}

function pickPrimary(input: NameFitInput): NameFitBucket {
  if (hasNatureRoot(input.name)) return 'nature-inspired';
  if (input.crossCulturalUsage || hasInternationalShape(input.name)) return 'international-fluid';
  if (input.cgciCohort === 'multi-gen-staple' || input.cgciCohort === 'cross-era-classic' || hasFormalShape(input.name)) {
    return 'traditional-formal';
  }
  if (isDistinctivePattern(input)) return 'unique-standout';
  return 'neutral-safe';
}

function pickSecondary(input: NameFitInput, primary: NameFitBucket): NameFitBucket | null {
  const candidates: NameFitBucket[] = [];
  if (hasNatureRoot(input.name)) candidates.push('nature-inspired');
  if (input.crossCulturalUsage || hasInternationalShape(input.name)) candidates.push('international-fluid');
  if (input.cgciCohort === 'multi-gen-staple' || input.cgciCohort === 'cross-era-classic' || hasFormalShape(input.name)) {
    candidates.push('traditional-formal');
  }
  if (isDistinctivePattern(input)) candidates.push('unique-standout');
  candidates.push('neutral-safe');
  return candidates.find((bucket) => bucket !== primary) ?? null;
}

function bucketReason(bucket: NameFitBucket, input: NameFitInput): string {
  const cohort = input.cgciCohort ? input.cgciCohort.replace(/-/g, ' ') : 'limited cohort data';
  switch (bucket) {
    case 'traditional-formal':
      return `the SSA cohort shape reads as ${cohort}, and the spelling has enough formal weight to sit comfortably on official documents, school rosters, and adult professional contexts`;
    case 'unique-standout':
      return `the name has a more distinctive sound pattern or cohort concentration, so it reads as a standout choice rather than a broad-consensus classic`;
    case 'international-fluid':
      return `the short vowel-forward shape and cross-cultural signal make the name easier to carry across US, European, and multilingual family contexts`;
    case 'nature-inspired':
      return `the lexical root overlaps with a recognizable nature term, giving the name an image-led reading beyond the SSA rank table`;
    case 'neutral-safe':
      return `the name avoids the strongest signals in the other buckets and reads as a flexible middle-ground choice`;
  }
}

export function classifyNameFit(input: NameFitInput): NameFitResult {
  const primaryBucket = pickPrimary(input);
  const secondaryBucket = pickSecondary(input, primaryBucket);
  const primaryLabel = NAME_FIT_LABEL[primaryBucket].toLowerCase();
  const secondaryLabel = secondaryBucket ? NAME_FIT_LABEL[secondaryBucket].toLowerCase() : null;
  const primaryReason = bucketReason(primaryBucket, input);

  return {
    primaryBucket,
    secondaryBucket,
    bestFitParents:
      `${input.name} best fits parents looking for a ${primaryLabel} signal: ${primaryReason}. This bucket is descriptive, not prescriptive. It translates the name's SSA cohort footprint, length, and sound pattern into a reader-friendly lens so the page says more than a rank and a meaning row.`,
    considerationsFor:
      secondaryLabel
        ? `A secondary reading is ${secondaryLabel}. That matters because most names carry more than one social signal: a classic can also travel well internationally, and a nature name can still be easy to pronounce. Use the primary bucket as the first read and the secondary bucket as the nuance.`
        : `The page does not surface a strong secondary bucket for ${input.name}. That usually means the name's measurable signals are aligned rather than split across style families, so the SSA rank, cohort chart, and peer-name list should carry more weight than a style label alone.`,
    notIdealIf:
      `${input.name} may be a weaker fit if you want the opposite signal from ${primaryLabel}. For example, a parent seeking a highly formal legacy name may read an emergent standout differently, while a parent seeking maximum distinctiveness may find a multi-generation staple too familiar. The fit bucket is a tradeoff map, not a verdict.`,
    dataNote:
      `NameFit uses the Social Security Administration baby-name series through 2024 plus derived cohort fields already shown on this page. It does not infer personality, future popularity, regional taste, or private family usage; those questions require context outside the SSA national registry.`,
  };
}

export function phoneticPatternForName(name: string): string {
  return normalized(name)
    .split('')
    .map((ch) => ('aeiou'.includes(ch) ? 'V' : 'C'))
    .join('')
    .replace(/(.)\1+/g, '$1');
}
