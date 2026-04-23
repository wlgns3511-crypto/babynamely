/**
 * Auto-generated FAQs for name pages using real SSA data values.
 */
import { formatPct } from './format';

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
  return [];
}
