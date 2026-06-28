/**
 * Auto-generated FAQs for name pages using real SSA data values.
 */
import { formatPct } from './format';
import { getProprietaryNameMetrics } from './proprietary-metrics';

export interface FAQItem {
  question: string;
  answer: string;
}

interface NameData {
  name: string;
  slug: string;
  gender: string;
  origin: string | null;
  meaning: string | null;
  peak_year: number | null;
  peak_pct: number | null;
  total_records: number;
}

interface NameStats {
  totalNames: number;
  avgPeakPct: number | null;
}

interface PopularityEntry {
  year: number;
  pct: number;
}

export function generateAutoFAQs(
  n: NameData,
  stats: NameStats,
  rank: number | null,
  latestPop: PopularityEntry | null,
  similarNames: { name: string; slug: string }[],
): FAQItem[] {
  const faqs: FAQItem[] = [];
  const name = n.name;
  const gender = n.gender === 'boy' ? 'boys' : 'girls';

  // 1. Meaning & Origin FAQ
  if (n.meaning || n.origin) {
    const meaningPart = n.meaning ? `means "${n.meaning}"` : "is a historically established name";
    const originPart = n.origin ? `of ${n.origin} origin` : "with rich cultural roots";
    faqs.push({
      question: `What does the name ${name} mean and where does it come from?`,
      answer: `The name ${name} ${meaningPart} and is ${originPart}. It is traditionally given to ${gender} and represents a strong linguistic choice.`,
    });
  }

  // 2. Peak Year & Popularity FAQ
  if (n.peak_year && n.peak_pct) {
    faqs.push({
      question: `When was the name ${name} most popular?`,
      answer: `The name ${name} reached its peak popularity in the United States in the year ${n.peak_year}, when it accounted for ${formatPct(n.peak_pct)} of births for that gender. Since then, its rank has adjusted as naming trends evolve.`,
    });
  }

  // 3. Rarity & Style Grade FAQ
  const { rarityScore, harmonyScore, styleGrade } = getProprietaryNameMetrics(n);
  const rarityVerdict = rarityScore >= 70 ? "relatively rare and unique" : "common and widely recognized";
  faqs.push({
    question: `Is the name ${name} rare or popular?`,
    answer: `According to our proprietary index, the name ${name} has a rarity score of ${rarityScore}/100 and is considered ${rarityVerdict}. It has a phonetic harmony score of ${harmonyScore}/100 and holds a Name Style Grade of ${styleGrade}.`,
  });

  // 4. Sibling & Middle Name Pairings
  faqs.push({
    question: `What middle names and sibling names go well with ${name}?`,
    answer: `Linguistic flow suggests pairing ${name} with middle names that contrast its syllable count. For instance, if ${name} has two syllables, single-syllable middle names like Grace, Rose, or James flow best. You can test initials and sound flow in real-time using our Middle Name Compatibility Calculator on this page.`,
  });

  // 5. Similar Names FAQ
  if (similarNames.length > 0) {
    const list = similarNames.slice(0, 4).map(s => s.name).join(', ');
    faqs.push({
      question: `What are some name alternatives similar to ${name}?`,
      answer: `If you like the sound and origin of ${name}, other similar name alternatives to consider include ${list}. These names share comparable stylistic vibes or regional histories.`,
    });
  }

  return faqs;
}
