export interface Insight {
  text: string;
  sentiment?: "positive" | "negative" | "neutral";
}

interface NameData {
  name: string;
  gender: string;
  origin?: string | null;
  meaning?: string | null;
  peak_year?: number | null;
  peak_pct?: number | null;
}

interface PopularityRow {
  year: number;
  pct: number;
}

interface NameStats {
  totalNames: number;
  avgPeakPct: number | null;
}

export function generateInsights(
  n: NameData,
  popularity: PopularityRow[],
  rank: number | null,
  stats: NameStats,
  latestPct: number | null,
): Insight[] {
  const insights: Insight[] = [];
  const currentYear = new Date().getFullYear();

  // 1. Popularity trend
  if (n.peak_year && n.peak_pct != null && latestPct != null) {
    const ratio = latestPct / n.peak_pct;
    const yearsSincePeak = currentYear - n.peak_year;

    if (ratio >= 0.8) {
      insights.push({
        text: `${n.name} is still near peak popularity, retaining ${Math.round(ratio * 100)}% of its ${n.peak_year} high point. This name has staying power with American parents.`,
        sentiment: "positive",
      });
    } else if (ratio >= 0.3) {
      insights.push({
        text: `${n.name} has gradually declined since peaking in ${n.peak_year} (${yearsSincePeak} years ago), now at ${Math.round(ratio * 100)}% of its peak usage. It reads as familiar but not overused.`,
        sentiment: "neutral",
      });
    } else {
      insights.push({
        text: `${n.name} has fallen to ${Math.round(ratio * 100)}% of its ${n.peak_year} peak, making it increasingly rare. Expect your child to be the only ${n.name} in their class.`,
        sentiment: "neutral",
      });
    }
  } else if (n.peak_year) {
    insights.push({
      text: `${n.name} peaked in popularity in ${n.peak_year}. ${currentYear - n.peak_year > 50 ? "Names from this era are cycling back as vintage picks." : "It remains a recognizable choice for parents today."}`,
      sentiment: "neutral",
    });
  }

  // 2. Peak decade context
  if (n.peak_year) {
    const decade = Math.floor(n.peak_year / 10) * 10;
    const decadeLabel = `${decade}s`;
    const association =
      decade <= 1920 ? "great-grandparent generation"
      : decade <= 1950 ? "grandparent generation"
      : decade <= 1980 ? "parent generation"
      : decade <= 2000 ? "millennial generation"
      : "current generation";
    insights.push({
      text: `${n.name} peaked in the ${decadeLabel}, associating it with the ${association}. ${decade < 1970 ? "This makes it a strong candidate for vintage revival." : "It still feels contemporary to most people."}`,
      sentiment: "neutral",
    });
  }

  // 3. Ranking among all tracked names
  if (rank != null && stats.totalNames > 0) {
    const percentile = Math.round((1 - rank / stats.totalNames) * 100);
    if (percentile >= 90) {
      insights.push({
        text: `Ranked #${rank.toLocaleString()} out of ${stats.totalNames.toLocaleString()} names (top ${100 - percentile}%). ${n.name} is one of the most widely used names in American history.`,
        sentiment: "positive",
      });
    } else if (percentile >= 50) {
      insights.push({
        text: `Ranked #${rank.toLocaleString()} of ${stats.totalNames.toLocaleString()} names (top ${100 - percentile}%). ${n.name} has a solid track record without being ubiquitous.`,
        sentiment: "neutral",
      });
    } else {
      insights.push({
        text: `Ranked #${rank.toLocaleString()} of ${stats.totalNames.toLocaleString()} names. ${n.name} is a distinctive choice that stands out from the crowd.`,
        sentiment: "positive",
      });
    }
  }

  // 4. Peak percentage vs average name
  if (n.peak_pct != null && stats.avgPeakPct != null && stats.avgPeakPct > 0) {
    const ratio = n.peak_pct / stats.avgPeakPct;
    if (ratio > 3) {
      insights.push({
        text: `At peak, ${n.name} was used ${ratio.toFixed(1)}x more than the average name. This was a dominant name in its era, comparable to today's top-10 picks.`,
        sentiment: "positive",
      });
    } else if (ratio > 1) {
      insights.push({
        text: `${n.name} reached ${ratio.toFixed(1)}x the average name's peak popularity, making it an above-average pick that most people will recognize.`,
        sentiment: "neutral",
      });
    } else {
      insights.push({
        text: `${n.name} reached only ${Math.round(ratio * 100)}% of the average name's peak popularity, making it inherently uncommon and distinctive.`,
        sentiment: "neutral",
      });
    }
  }

  // 5. Gender and origin context
  const genderLabel = n.gender === "boy" ? "boy" : "girl";
  if (n.origin && n.meaning) {
    insights.push({
      text: `${n.name} is a ${genderLabel} name of ${n.origin} origin meaning "${n.meaning}". Names with clear etymological stories tend to be popular in birth announcements and nursery art.`,
      sentiment: "positive",
    });
  } else if (n.origin) {
    insights.push({
      text: `${n.name} is a ${genderLabel} name with ${n.origin} roots. Its cultural heritage gives it cross-generational appeal.`,
      sentiment: "neutral",
    });
  } else {
    insights.push({
      text: `${n.name} is used primarily as a ${genderLabel} name in the United States, tracked by the SSA since 1880.`,
      sentiment: "neutral",
    });
  }

  return insights.slice(0, 5);
}
