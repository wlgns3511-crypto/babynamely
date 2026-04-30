/**
 * Layer 2 commentary for cluster pages — year, letter, origin, gender hubs.
 *
 * Pattern: FACT → INTERPRETATION → IMPLICATION, mirroring lib/name-commentary.ts
 * but keyed off cluster identity (year, letter, origin, gender) rather than slug.
 *
 * Variants are picked deterministically from a page-key hash so two adjacent
 * cluster pages don't read identical, while every page stays cache-friendly
 * and stable across rebuilds.
 *
 * Built for the AdSense low-value-content remediation 2026-04-28 — second pass
 * after /name/[slug]/ Layer 2 v2 (lib/name-commentary.ts).
 */
import path from 'path';
import Database from 'better-sqlite3';

const DB_PATH = path.join(process.cwd(), 'data', 'names.db');
let _db: Database.Database | null = null;
function db(): Database.Database {
  if (_db) {
    try { _db.prepare('SELECT 1').get(); return _db; } catch { _db = null; }
  }
  _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  return _db;
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
function pickVariant<T>(key: string, options: T[], salt = 0): T {
  let h = salt;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return options[Math.abs(h) % options.length];
}

function fmtPct(p: number, digits = 2): string {
  return `${(p * 100).toFixed(digits)}%`;
}

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1_000).toLocaleString()}K`;
  return n.toLocaleString();
}

function oneInEveryN(pct: number): string {
  if (!pct || pct <= 0) return 'fewer than 1 in 200,000';
  const oneIn = Math.round(1 / pct);
  if (oneIn <= 200) return `roughly 1 in every ${oneIn}`;
  if (oneIn <= 2_000) return `roughly 1 in every ${Math.round(oneIn / 10) * 10}`;
  if (oneIn <= 20_000) return `roughly 1 in every ${Math.round(oneIn / 100) * 100}`;
  return `roughly 1 in every ${Math.round(oneIn / 1_000) * 1_000}`;
}

// ──────────────────────────────────────────────────────────────
// /names/year/[year]/
// ──────────────────────────────────────────────────────────────
export interface YearInsight {
  year: number;
  topBoy: { name: string; slug: string; pct: number } | null;
  topGirl: { name: string; slug: string; pct: number } | null;
  top10ShareBoy: number;
  top10ShareGirl: number;
  biggestRiser: { name: string; slug: string; gender: string; rankChange: number } | null;
  debutCount: number;
  narrative: string[];
}

export function getYearInsight(year: number): YearInsight {
  const conn = db();

  const topRows = conn
    .prepare(
      `SELECT n.slug, n.name, n.gender, p.pct
         FROM popularity p
         JOIN names n ON n.slug = p.slug
        WHERE p.year = ?
        ORDER BY p.pct DESC`,
    )
    .all(year) as { slug: string; name: string; gender: string; pct: number }[];

  const topBoyRow = topRows.find((r) => r.gender === 'boy') ?? null;
  const topGirlRow = topRows.find((r) => r.gender === 'girl') ?? null;
  const top10Boys = topRows.filter((r) => r.gender === 'boy').slice(0, 10);
  const top10Girls = topRows.filter((r) => r.gender === 'girl').slice(0, 10);
  const top10ShareBoy = top10Boys.reduce((s, r) => s + r.pct, 0);
  const top10ShareGirl = top10Girls.reduce((s, r) => s + r.pct, 0);

  // Biggest rank riser vs prior year (requires name_year_rank auxiliary table)
  let biggestRiser: YearInsight['biggestRiser'] = null;
  try {
    const riserRow = conn
      .prepare(
        `SELECT n.name, n.slug, n.gender, prev.rank - cur.rank AS rank_change
           FROM name_year_rank cur
           JOIN name_year_rank prev ON prev.slug = cur.slug AND prev.year = cur.year - 1
           JOIN names n ON n.slug = cur.slug
          WHERE cur.year = ? AND cur.rank <= 200 AND prev.rank <= 500
          ORDER BY rank_change DESC
          LIMIT 1`,
      )
      .get(year) as { name: string; slug: string; gender: string; rank_change: number } | undefined;
    if (riserRow && riserRow.rank_change > 0) {
      biggestRiser = {
        name: riserRow.name,
        slug: riserRow.slug,
        gender: riserRow.gender,
        rankChange: riserRow.rank_change,
      };
    }
  } catch {
    // name_year_rank not present — skip riser fragment
  }

  // Debut count: names whose first appearance in popularity = this year
  const debutRow = conn
    .prepare(
      `SELECT COUNT(*) AS c FROM (
         SELECT slug, MIN(year) AS first_year
           FROM popularity
          GROUP BY slug
       ) WHERE first_year = ?`,
    )
    .get(year) as { c: number };
  const debutCount = debutRow?.c ?? 0;

  const key = `year-${year}`;
  const narrative: string[] = [];

  if (topBoyRow && topGirlRow) {
    narrative.push(
      `In ${year}, ${topBoyRow.name} led the boys' chart at ${fmtPct(topBoyRow.pct, 2)} of male births and ${topGirlRow.name} led the girls' at ${fmtPct(topGirlRow.pct, 2)} — meaning ${oneInEveryN(topBoyRow.pct)} boys and ${oneInEveryN(topGirlRow.pct)} girls born that year carried these names.`,
    );
  }

  // Top-10 concentration interpretation
  const concentration = (top10ShareBoy + top10ShareGirl) / 2;
  let concentrationFrag: string;
  if (concentration > 0.30) {
    concentrationFrag = ` — a high-concentration era where parents converged on a small pool of choices, characteristic of mid-twentieth-century or earlier naming culture.`;
  } else if (concentration > 0.15) {
    concentrationFrag = ` — moderate concentration, with the top tier still recognizable but the chart's shoulders filling out as parents reach further into the pool.`;
  } else {
    concentrationFrag = ` — low concentration, characteristic of the modern long-tail era where the same #1 name reaches a much smaller share than it would have a generation ago.`;
  }
  const concentrationOpenings = [
    `The ${year} top-10 captures`,
    `Top-10 share for ${year} reaches`,
    `Together, the ten most popular ${year} names account for`,
  ];
  narrative.push(
    `${pickVariant(key, concentrationOpenings)} ${fmtPct(top10ShareBoy, 1)} of boys and ${fmtPct(top10ShareGirl, 1)} of girls${concentrationFrag}`,
  );

  if (biggestRiser) {
    const riserPhrases = [
      `${biggestRiser.name} climbed ${biggestRiser.rankChange} spots from ${year - 1} to ${year}, the year's largest jumper among top-200 names — the kind of move that often signals a cultural trigger (a show, a song, a celebrity baby) rather than slow drift.`,
      `The biggest mover that year was ${biggestRiser.name}, up ${biggestRiser.rankChange} positions versus ${year - 1}. Single-year jumps of this size rarely come from organic taste shifts alone; usually some external event nudges the curve.`,
      `${biggestRiser.name} stands out as the steepest riser of ${year}, gaining ${biggestRiser.rankChange} ranks in a single year — a movement worth flagging because most names move single-digit ranks year-over-year, not double-digit.`,
    ];
    narrative.push(pickVariant(key, riserPhrases, 7));
  }

  if (debutCount > 0) {
    const debutPhrases = [
      `Roughly ${fmtCount(debutCount)} names appeared on the SSA list for the first time in ${year} — names that crossed the agency's annual 5-baby reporting threshold for the first time, meaning they went from "private" to "publicly counted" that year.`,
      `${fmtCount(debutCount)} names debuted in the SSA record in ${year}: each one cleared the 5-baby threshold for the very first time, a useful proxy for how much new naming territory parents are exploring.`,
    ];
    narrative.push(pickVariant(key, debutPhrases, 13));
  }

  return {
    year,
    topBoy: topBoyRow ? { name: topBoyRow.name, slug: topBoyRow.slug, pct: topBoyRow.pct } : null,
    topGirl: topGirlRow ? { name: topGirlRow.name, slug: topGirlRow.slug, pct: topGirlRow.pct } : null,
    top10ShareBoy,
    top10ShareGirl,
    biggestRiser,
    debutCount,
    narrative,
  };
}

// ──────────────────────────────────────────────────────────────
// /names/letter/[letter]/
// ──────────────────────────────────────────────────────────────
export interface LetterInsight {
  letter: string;
  count: number;
  countBoy: number;
  countGirl: number;
  topOrigin: { origin: string; count: number; share: number } | null;
  topNames: { name: string; slug: string; gender: string; peakPct: number; peakYear: number | null }[];
  modalPeakDecade: number | null;
  narrative: string[];
}

export function getLetterInsight(letter: string): LetterInsight {
  const L = letter.toLowerCase();
  const conn = db();

  const counts = conn
    .prepare(
      `SELECT
         COUNT(*)                                   AS total,
         SUM(CASE WHEN gender='boy'  THEN 1 ELSE 0 END) AS boys,
         SUM(CASE WHEN gender='girl' THEN 1 ELSE 0 END) AS girls
         FROM names WHERE slug LIKE ?`,
    )
    .get(L + '%') as { total: number; boys: number; girls: number };

  const originRow = conn
    .prepare(
      `SELECT origin, COUNT(*) AS c
         FROM names
        WHERE slug LIKE ? AND origin IS NOT NULL
        GROUP BY origin
        ORDER BY c DESC LIMIT 1`,
    )
    .get(L + '%') as { origin: string; c: number } | undefined;

  const topNamesRows = conn
    .prepare(
      `SELECT name, slug, gender, peak_pct, peak_year
         FROM names WHERE slug LIKE ?
        ORDER BY peak_pct DESC LIMIT 5`,
    )
    .all(L + '%') as { name: string; slug: string; gender: string; peak_pct: number; peak_year: number | null }[];

  const decadeRow = conn
    .prepare(
      `SELECT (peak_year/10)*10 AS dec, COUNT(*) AS c
         FROM names WHERE slug LIKE ? AND peak_year IS NOT NULL
        GROUP BY dec
        ORDER BY c DESC LIMIT 1`,
    )
    .get(L + '%') as { dec: number; c: number } | undefined;

  const key = `letter-${L}`;
  const narrative: string[] = [];
  const total = counts?.total ?? 0;
  const boys = counts?.boys ?? 0;
  const girls = counts?.girls ?? 0;

  // Balance fragment
  const balance = total > 0 ? boys / total : 0;
  let balanceFrag: string;
  if (balance > 0.6) balanceFrag = `, leaning notably masculine (${boys.toLocaleString()} boys' names vs ${girls.toLocaleString()} girls')`;
  else if (balance < 0.4) balanceFrag = `, leaning notably feminine (${girls.toLocaleString()} girls' names vs ${boys.toLocaleString()} boys')`;
  else balanceFrag = `, split fairly evenly between boys and girls`;

  const factOpenings = [
    `The letter ${L.toUpperCase()} appears as the first letter of ${total.toLocaleString()} distinct names in the SSA record`,
    `${total.toLocaleString()} names in the SSA record begin with ${L.toUpperCase()}`,
    `Across the full SSA dataset, ${total.toLocaleString()} names start with ${L.toUpperCase()}`,
  ];
  let poolFrag: string;
  if (total >= 200) {
    poolFrag = ` — meaning if you're shortlisting ${L.toUpperCase()}-names, you're choosing from a pool the size of a small town's worth of options, not a corner shelf.`;
  } else if (total >= 50) {
    poolFrag = ` — a moderate pool, generous enough to support taste exploration without overwhelming choice paralysis.`;
  } else if (total >= 15) {
    poolFrag = ` — a narrow pool, easy to shortlist exhaustively but harder to find rare-yet-rooted choices in.`;
  } else {
    poolFrag = ` — a very narrow pool, characteristic of letters that historically appeared in only a handful of naming traditions.`;
  }
  narrative.push(`${pickVariant(key, factOpenings)}${balanceFrag}${poolFrag}`);

  if (originRow && total > 0) {
    const originShare = originRow.c / total;
    const originPhrases = [
      `${originRow.origin} origin dominates the ${L.toUpperCase()} pool, accounting for about ${fmtPct(originShare, 0)} of the names whose root we know — useful context if you care about etymological consistency.`,
      `${fmtPct(originShare, 0)} of ${L.toUpperCase()}-names with documented origins trace back to ${originRow.origin} roots, the single most common source for this initial.`,
      `Sort the ${L.toUpperCase()} pool by origin and ${originRow.origin} comes out on top, accounting for roughly ${fmtPct(originShare, 0)} of documented entries.`,
    ];
    narrative.push(pickVariant(key, originPhrases, 5));
  }

  if (decadeRow) {
    const decadePhrases = [
      `Most ${L.toUpperCase()}-names hit their popularity peak in the ${decadeRow.dec}s, suggesting that decade's naming taste especially favored this initial.`,
      `The ${decadeRow.dec}s is the modal peak decade for ${L.toUpperCase()}-names — the decade that produced the most "personal-best" years for this initial.`,
      `Bucket ${L.toUpperCase()}-names by their peak year and the ${decadeRow.dec}s wins out, hinting at when this initial felt freshest to American parents.`,
    ];
    narrative.push(pickVariant(key, decadePhrases, 11));
  }

  return {
    letter: L,
    count: total,
    countBoy: boys,
    countGirl: girls,
    topOrigin: originRow ? { origin: originRow.origin, count: originRow.c, share: originRow.c / total } : null,
    topNames: topNamesRows.map((r) => ({ name: r.name, slug: r.slug, gender: r.gender, peakPct: r.peak_pct, peakYear: r.peak_year })),
    modalPeakDecade: decadeRow?.dec ?? null,
    narrative,
  };
}

// ──────────────────────────────────────────────────────────────
// /names/origin/[origin]/
// ──────────────────────────────────────────────────────────────
export interface OriginInsight {
  origin: string;
  count: number;
  firstAppearedDecade: number | null;
  modalPeakDecade: number | null;
  topNames: { name: string; slug: string; gender: string; peakPct: number }[];
  isCurrentlyTrending: boolean;
  narrative: string[];
}

export function getOriginInsight(origin: string): OriginInsight {
  const conn = db();

  const countRow = conn
    .prepare(`SELECT COUNT(*) AS c FROM names WHERE origin = ?`)
    .get(origin) as { c: number };

  const firstRow = conn
    .prepare(`SELECT (MIN(peak_year)/10)*10 AS dec FROM names WHERE origin = ? AND peak_year IS NOT NULL`)
    .get(origin) as { dec: number | null };

  const modalRow = conn
    .prepare(
      `SELECT (peak_year/10)*10 AS dec, COUNT(*) AS c
         FROM names WHERE origin = ? AND peak_year IS NOT NULL
        GROUP BY dec
        ORDER BY c DESC LIMIT 1`,
    )
    .get(origin) as { dec: number; c: number } | undefined;

  const topNamesRows = conn
    .prepare(
      `SELECT name, slug, gender, peak_pct
         FROM names WHERE origin = ?
        ORDER BY peak_pct DESC LIMIT 5`,
    )
    .all(origin) as { name: string; slug: string; gender: string; peak_pct: number }[];

  // Trend signal: avg pct of origin names in 2020+ vs 2015-2019
  const trendRow = conn
    .prepare(
      `SELECT
         AVG(CASE WHEN p.year >= 2020 THEN p.pct ELSE NULL END) AS recent,
         AVG(CASE WHEN p.year >= 2015 AND p.year < 2020 THEN p.pct ELSE NULL END) AS prev
         FROM popularity p
         JOIN names n ON n.slug = p.slug
        WHERE n.origin = ?`,
    )
    .get(origin) as { recent: number | null; prev: number | null };
  const recent = trendRow?.recent ?? 0;
  const prev = trendRow?.prev ?? 0;
  const isCurrentlyTrending = recent > prev;

  const key = `origin-${origin.toLowerCase()}`;
  const narrative: string[] = [];
  const total = countRow.c;

  const factOpenings = [
    `The ${origin} naming tradition contributes ${total.toLocaleString()} names to the SSA dataset`,
    `${total.toLocaleString()} names of ${origin} origin appear in the SSA record`,
    `Across the SSA dataset, ${total.toLocaleString()} entries trace their roots to ${origin}`,
  ];
  narrative.push(
    `${pickVariant(key, factOpenings)} — a pool large enough to span multiple eras, registers, and naming styles rather than one archetype.`,
  );

  if (firstRow.dec && modalRow) {
    const span = modalRow.dec - firstRow.dec;
    let arcPhrase: string;
    if (span >= 50) {
      arcPhrase = `The earliest ${origin} names peaked back in the ${firstRow.dec}s, but the bulk hit their high-water mark in the ${modalRow.dec}s — a multi-generational arc spanning roughly ${span} years of evolving taste rather than a single moment.`;
    } else if (span >= 20) {
      arcPhrase = `Origin-${origin} names show a ${span}-year arc, with the earliest peak in the ${firstRow.dec}s and the modal peak decade landing in the ${modalRow.dec}s.`;
    } else {
      arcPhrase = `Most ${origin} names converge on the ${modalRow.dec}s as their peak decade — a relatively concentrated era of popularity rather than a long arc.`;
    }
    narrative.push(arcPhrase);
  } else if (modalRow) {
    narrative.push(`${origin} names cluster around the ${modalRow.dec}s as their modal peak decade.`);
  }

  if (recent > 0 && prev > 0) {
    const ratio = recent / prev;
    if (ratio > 1.10) {
      narrative.push(
        `Across 2020–2024, the average ${origin} name has gained ground (about ${fmtPct(ratio - 1, 0)} more share than 2015–2019) — meaning today's parents are leaning into this tradition more than parents of just five years ago.`,
      );
    } else if (ratio < 0.90) {
      narrative.push(
        `Across 2020–2024, the average ${origin} name has slipped (about ${fmtPct(1 - ratio, 0)} less share than 2015–2019) — the tradition isn't disappearing, but it's lost some shelf space recently.`,
      );
    } else {
      narrative.push(
        `Across 2020–2024, the average ${origin} name holds roughly steady vs the late 2010s — a stable tradition rather than a fashion cycle.`,
      );
    }
  }

  return {
    origin,
    count: total,
    firstAppearedDecade: firstRow?.dec ?? null,
    modalPeakDecade: modalRow?.dec ?? null,
    topNames: topNamesRows.map((r) => ({ name: r.name, slug: r.slug, gender: r.gender, peakPct: r.peak_pct })),
    isCurrentlyTrending,
    narrative,
  };
}

// ──────────────────────────────────────────────────────────────
// /names/gender/[gender]/
// ──────────────────────────────────────────────────────────────
export interface GenderDecadeArcEntry {
  decade: number;
  topName: string;
  avgPct: number;
}

export interface GenderInsight {
  gender: 'boy' | 'girl';
  totalNames: number;
  top10Share2024: number;
  top100Share2024: number;
  longTailShare2024: number;
  decadeArc: GenderDecadeArcEntry[];
  narrative: string[];
}

export function getGenderInsight(gender: 'boy' | 'girl'): GenderInsight {
  const conn = db();

  const totalRow = conn
    .prepare(`SELECT COUNT(*) AS c FROM names WHERE gender = ?`)
    .get(gender) as { c: number };

  const conc2024 = conn
    .prepare(
      `SELECT p.pct FROM popularity p
         JOIN names n ON n.slug = p.slug
        WHERE n.gender = ? AND p.year = 2024
        ORDER BY p.pct DESC`,
    )
    .all(gender) as { pct: number }[];
  const top10Share2024 = conc2024.slice(0, 10).reduce((s, r) => s + r.pct, 0);
  const top100Share2024 = conc2024.slice(0, 100).reduce((s, r) => s + r.pct, 0);
  const longTailShare2024 = Math.max(0, 1 - top100Share2024);

  // Decade arc — top name per sampled decade (1900, 1920, 1950, 1980, 2000, 2020)
  const decades = [1900, 1920, 1950, 1980, 2000, 2020];
  const decadeArc: GenderDecadeArcEntry[] = [];
  for (const d of decades) {
    const row = conn
      .prepare(
        `SELECT n.name, AVG(p.pct) AS avg_pct
           FROM popularity p
           JOIN names n ON n.slug = p.slug
          WHERE n.gender = ? AND p.year >= ? AND p.year < ?
          GROUP BY n.slug
          ORDER BY avg_pct DESC LIMIT 1`,
      )
      .get(gender, d, d + 10) as { name: string; avg_pct: number } | undefined;
    if (row) decadeArc.push({ decade: d, topName: row.name, avgPct: row.avg_pct });
  }

  const key = `gender-${gender}`;
  const narrative: string[] = [];
  const label = gender === 'boy' ? 'boys' : 'girls';

  narrative.push(
    `The SSA dataset contains ${totalRow.c.toLocaleString()} distinct ${label}' names that have crossed the agency's annual 5-baby threshold at least once since 1880 — meaning when American parents shop for a ${gender}'s name, the realistic short list of "names with documented historical use" runs into the thousands, not the hundreds.`,
  );

  narrative.push(
    `In 2024, the top 10 ${label}' names accounted for ${fmtPct(top10Share2024, 1)} of all births, the top 100 for ${fmtPct(top100Share2024, 1)}, and the remaining "long tail" for ${fmtPct(longTailShare2024, 1)} — a structurally different shape from the mid-twentieth-century data, when the top 10 alone could clear 30%.`,
  );

  if (decadeArc.length >= 3) {
    const arcStr = decadeArc.map((d) => `${d.topName} (${d.decade}s)`).join(' → ');
    const phrases = [
      `Tracking the #1 ${gender}'s name across decades shows how taste rotates: ${arcStr}. Each name owned its era, then yielded — none stays #1 forever.`,
      `Decade-by-decade #1 sequence for ${label}: ${arcStr}. Comparing your shortlist against this arc tells you whether you're picking a name with a recent peak, an in-between cohort feel, or a name still climbing.`,
    ];
    narrative.push(pickVariant(key, phrases, 17));
  }

  return {
    gender,
    totalNames: totalRow.c,
    top10Share2024,
    top100Share2024,
    longTailShare2024,
    decadeArc,
    narrative,
  };
}
