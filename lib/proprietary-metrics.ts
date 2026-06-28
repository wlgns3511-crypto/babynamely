import type { BabyName } from "./db";

export interface ProprietaryNameMetrics {
  rarityScore: number;
  harmonyScore: number;
  styleGrade: string;
  commentary: string;
}

/**
 * Helper to check if a letter is a vowel (including 'y' in English naming phonetics)
 */
const isVowel = (char: string): boolean => {
  return "aeiouy".includes(char.toLowerCase());
};

/**
 * Calculates a phonetic harmony rating (50 - 98) based on sound transitions,
 * vowel balance, and syllable flow.
 */
export function calculatePhoneticHarmony(name: string): number {
  let score = 70;
  const lower = name.toLowerCase();

  // Length optimization (4 to 7 letters is highly balanced for English first names)
  if (lower.length >= 4 && lower.length <= 7) {
    score += 8;
  }

  // Alternating consonant-vowel transitions (smoothness of flow)
  let transitions = 0;
  for (let i = 0; i < lower.length - 1; i++) {
    if (isVowel(lower[i]) !== isVowel(lower[i + 1])) {
      transitions++;
    }
  }
  score += Math.min(16, transitions * 3.5);

  // Soft endings (ending in a vowel or soft consonant 'n', 'r', 'l', 's')
  const lastChar = lower.charAt(lower.length - 1);
  if (isVowel(lastChar)) {
    score += 4;
  } else if ("nrls".includes(lastChar)) {
    score += 2;
  }

  // Double vowel glides (e.g. "ia", "io", "ou", "ea") which create pleasant diphthongs
  const glides = ["ia", "io", "ou", "ea", "ee", "ai", "ie", "oa"];
  let hasGlide = false;
  for (const g of glides) {
    if (lower.includes(g)) {
      hasGlide = true;
      break;
    }
  }
  if (hasGlide) score += 4;

  // Penalize consecutive harsh consonants (e.g. "ght", "rch", "ldth", "phth")
  const harshCon = ["rch", "phth", "ldth", "rk", "x", "z"];
  for (const hc of harshCon) {
    if (lower.includes(hc)) {
      score -= 5;
      break;
    }
  }

  // Clamp between 50 and 98 (maximum phonetic harmony score)
  return Math.max(50, Math.min(98, Math.round(score)));
}

/**
 * Calculates the name style grade (A+ to F) from popularity metrics,
 * absolute volume, and phonetic harmony.
 */
export function calculateNameStyleGrade(
  n: BabyName,
  rarityScore: number,
  harmonyScore: number
): string {
  const popularity = 100 - rarityScore;

  // A name is highly rated if it is either:
  // 1. A highly popular, classic name (High Popularity + High Harmony)
  // 2. An elegant, rare name (High Rarity + High Harmony)
  const styleScore = Math.max(popularity, rarityScore) * 0.4 + harmonyScore * 0.6;

  let gradeVal = 0; // 0 = F, 1 = D, 2 = C, 3 = B, 4 = A
  if (styleScore >= 82) gradeVal = 4;
  else if (styleScore >= 70) gradeVal = 3;
  else if (styleScore >= 55) gradeVal = 2;
  else if (styleScore >= 40) gradeVal = 1;
  else gradeVal = 0;

  // Sub-grade offset (0 = minus, 1 = flat, 2 = plus)
  let subGrade = 1;

  if (harmonyScore >= 90) subGrade += 1;
  if (n.peak_pct && n.peak_pct > 0.01 && popularity > 80) subGrade += 1; // popular classic

  if (styleScore < 45) subGrade -= 1;

  let finalGradeVal = gradeVal;
  if (subGrade > 2) {
    finalGradeVal = Math.min(4, gradeVal + 1);
    subGrade = 0;
  } else if (subGrade < 0) {
    finalGradeVal = Math.max(0, gradeVal - 1);
    subGrade = 2;
  }

  const grades = ["F", "D", "C", "B", "A"];
  const baseGrade = grades[finalGradeVal];
  
  if (baseGrade === "F") return "F";
  if (baseGrade === "A" && subGrade === 2) return "A+";

  const subSigns = ["-", "", "+"];
  return `${baseGrade}${subSigns[subGrade]}`;
}

/**
 * Deterministic hash to distribute content templates evenly across all slugs
 */
function getSlugHash(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generates unique, SEO-friendly commentary analyzing name rarity, harmony, and style
 */
export function generateNameCommentary(
  n: BabyName,
  rarity: number,
  harmony: number,
  grade: string
): string {
  const name = n.name;
  const origin = n.origin ? `${n.origin} origin` : "historical roots";
  const gender = n.gender === "boy" ? "boys" : "girls";
  const records = n.total_records.toLocaleString();

  const hash = getSlugHash(n.slug);
  const variant = hash % 4;

  const styleType = rarity >= 70 ? "distinctly rare, artisan" : "popular, time-tested";
  const flowType = harmony >= 85 ? "vocalic resonance and soft syllable endings" : "strong, structured consonant framework";

  switch (variant) {
    case 0:
      return `Our linguistic analysis assigns ${name} a Style Grade of ${grade}, driven by a phonetic harmony score of ${harmony}/100 and a rarity index of ${rarity}/100. This indicates a ${styleType} choice for ${gender}. The name's structure benefits from its ${flowType}, making it pair exceptionally well with single-syllable middle names.`;

    case 1:
      return `Evaluating the spelling and phonetic metrics of ${name} yields a harmony rating of ${harmony}/100 and a style grade of ${grade}. Historically registered with ${records} births, ${name} has a rarity score of ${rarity}/100, which reflects its ${styleType} standing. The glide sounds in ${name} make it roll smoothly off the tongue and feel highly modern.`;

    case 2:
      return `Based on United States naming registries and sound-pattern rules, the name ${name} holds a style grade of ${grade} and an uniqueness score of ${rarity}/100. With its ${origin}, the name offers a balance of phonetic appeal (${harmony}/100 harmony) and cultural history. We recommend choosing a middle name that avoids repeating the ending letter of ${name}.`;

    case 3:
    default:
      return `For parents considering ${name}, this name showcases a Phonetic Harmony score of ${harmony}/100 and a Style Grade of ${grade}. It has registered ${records} times in historical baby databases, placing its rarity score at ${rarity}/100. This represents a ${styleType} choice with ${flowType}, providing a melodious name flow.`;
  }
}

/**
 * Returns all calculated metrics in a single helper
 */
export function getProprietaryNameMetrics(n: BabyName): ProprietaryNameMetrics {
  const total = n.total_records ?? 0;
  // Popularity log-scale out of 100
  const popularityScore = Math.min(100, Math.round(Math.log10(total + 1) / 6.0 * 100));
  const rarityScore = 100 - popularityScore;
  const harmonyScore = calculatePhoneticHarmony(n.name);
  const styleGrade = calculateNameStyleGrade(n, rarityScore, harmonyScore);
  const commentary = generateNameCommentary(n, rarityScore, harmonyScore, styleGrade);

  return { rarityScore, harmonyScore, styleGrade, commentary };
}
