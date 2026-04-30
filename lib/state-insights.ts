/**
 * Layer 2 commentary for /state/[slug]/ pages.
 *
 * Turns the editorial top-10 lists in lib/states-data.ts into data-derived
 * commentary by cross-checking against the SSA national 2024 rankings:
 *
 *   1. Overlap — how many of the state's top-10 also rank national top-10?
 *   2. Distinctive — names in the state's top-10 missing from the national top-50.
 *   3. Vintage lean — average peak_year of the state's top-20 names.
 *
 * Pattern: FACT → INTERPRETATION → IMPLICATION. State slug keys variants
 * deterministically so neighboring state pages don't read identical.
 *
 * Built for the AdSense low-value-content remediation 2026-04-28, chunk 2
 * of the post-/name/[slug]/ Layer 2 v2 rollout.
 */
import path from 'path';
import Database from 'better-sqlite3';
import { getStateBySlug } from './states-data';

const DB_PATH = path.join(process.cwd(), 'data', 'names.db');
let _db: Database.Database | null = null;
function db(): Database.Database {
  if (_db) {
    try { _db.prepare('SELECT 1').get(); return _db; } catch { _db = null; }
  }
  _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  return _db;
}

function pickVariant<T>(key: string, options: T[], salt = 0): T {
  let h = salt;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return options[Math.abs(h) % options.length];
}

const LATEST_YEAR = 2024;

export interface StateNameRef {
  name: string;
  slug: string | null;
  nationalRank: number | null;
}

export interface StateInsight {
  slug: string;
  name: string;
  code: string;

  topBoyOverlap: number;       // state top-10 ∩ national top-10
  topGirlOverlap: number;

  matchedBoys: StateNameRef[]; // state top-10 with national rank ≤ 50
  matchedGirls: StateNameRef[];
  distinctiveBoys: StateNameRef[]; // state top-10 not in national top-50
  distinctiveGirls: StateNameRef[];

  averagePeakYear: number | null;
  vintageLean: 'modern' | 'balanced' | 'vintage_lean';

  narrative: string[];
}

function lookupNational(rows: { name: string; rank: number; slug: string }[], target: string): { rank: number; slug: string } | null {
  const lower = target.toLowerCase();
  for (const r of rows) {
    if (r.name.toLowerCase() === lower) return { rank: r.rank, slug: r.slug };
  }
  return null;
}

export function getStateInsight(slug: string): StateInsight | null {
  const state = getStateBySlug(slug);
  if (!state) return null;
  const conn = db();

  // National 2024 top-50 by gender (with rank + slug)
  let nationalBoys: { name: string; slug: string; rank: number }[] = [];
  let nationalGirls: { name: string; slug: string; rank: number }[] = [];
  try {
    nationalBoys = conn
      .prepare(
        `SELECT n.name, n.slug, r.rank
           FROM name_year_rank r
           JOIN names n ON n.slug = r.slug
          WHERE r.year = ? AND n.gender = 'boy' AND r.rank <= 50
          ORDER BY r.rank`,
      )
      .all(LATEST_YEAR) as { name: string; slug: string; rank: number }[];

    nationalGirls = conn
      .prepare(
        `SELECT n.name, n.slug, r.rank
           FROM name_year_rank r
           JOIN names n ON n.slug = r.slug
          WHERE r.year = ? AND n.gender = 'girl' AND r.rank <= 50
          ORDER BY r.rank`,
      )
      .all(LATEST_YEAR) as { name: string; slug: string; rank: number }[];
  } catch {
    // name_year_rank not present — fall through with empty arrays
  }

  // Resolve every state top-10 entry against national rank
  const matchedBoys: StateNameRef[] = state.popularBoys.map((n) => {
    const m = lookupNational(nationalBoys, n);
    return { name: n, slug: m?.slug ?? null, nationalRank: m?.rank ?? null };
  });
  const matchedGirls: StateNameRef[] = state.popularGirls.map((n) => {
    const m = lookupNational(nationalGirls, n);
    return { name: n, slug: m?.slug ?? null, nationalRank: m?.rank ?? null };
  });

  const topBoyOverlap = matchedBoys.filter((r) => r.nationalRank !== null && r.nationalRank <= 10).length;
  const topGirlOverlap = matchedGirls.filter((r) => r.nationalRank !== null && r.nationalRank <= 10).length;

  const distinctiveBoys = matchedBoys.filter((r) => r.nationalRank === null).slice(0, 5);
  const distinctiveGirls = matchedGirls.filter((r) => r.nationalRank === null).slice(0, 5);

  // Average peak_year of state's top-20 (top-10 boys + top-10 girls)
  const allTopNames = [...state.popularBoys, ...state.popularGirls];
  let averagePeakYear: number | null = null;
  if (allTopNames.length > 0) {
    const placeholders = allTopNames.map(() => '?').join(',');
    const peakRows = conn
      .prepare(
        `SELECT peak_year FROM names
          WHERE name IN (${placeholders}) AND peak_year IS NOT NULL`,
      )
      .all(...allTopNames) as { peak_year: number }[];
    if (peakRows.length > 0) {
      averagePeakYear = Math.round(
        peakRows.reduce((s, r) => s + r.peak_year, 0) / peakRows.length,
      );
    }
  }

  let vintageLean: StateInsight['vintageLean'] = 'modern';
  if (averagePeakYear !== null) {
    if (averagePeakYear < 1990) vintageLean = 'vintage_lean';
    else if (averagePeakYear < 2015) vintageLean = 'balanced';
    else vintageLean = 'modern';
  }

  // ── Narrative
  const key = `state-${slug}`;
  const narrative: string[] = [];
  const distinctiveCount = distinctiveBoys.length + distinctiveGirls.length;

  // Fragment 1 — overlap framing (varies by distinctiveCount to avoid
  // contradicting Fragment 2 when state's top-10 is fully inside national top-50)
  const totalOverlap = topBoyOverlap + topGirlOverlap;
  let overlapInterp: string;
  if (totalOverlap >= 14) {
    overlapInterp = `tracking the national mainstream tightly — ${state.name}'s parents are largely choosing names that the rest of the country is also choosing, with little local divergence.`;
  } else if (totalOverlap >= 8) {
    overlapInterp = distinctiveCount >= 1
      ? `following national trends without abandoning local taste — about half of the state's top picks match the national top-10, with the rest leaving room for distinctive regional choices covered below.`
      : `following national trends with measured restraint — about half of the state's top picks match the national top-10, while the rest stay inside the broader national top-50 rather than diverging hard.`;
  } else {
    overlapInterp = distinctiveCount >= 1
      ? `clearly distinct from the national mainstream — fewer than half of ${state.name}'s top picks appear in the national top-10, a sign that local naming culture is doing meaningful work here.`
      : `running cooler than the national headline picks — fewer than half of ${state.name}'s top-10 sit in the national top-10, though every state pick still appears somewhere in the national top-50.`;
  }

  const overlapOpenings = [
    `${topBoyOverlap} of ${state.name}'s top-10 boy names and ${topGirlOverlap} of its top-10 girl names also rank in the national 2024 top-10`,
    `Cross-checking ${state.name}'s top-10 against the national 2024 list: ${topBoyOverlap}/10 boy names match and ${topGirlOverlap}/10 girl names match`,
    `${topBoyOverlap}/10 boy and ${topGirlOverlap}/10 girl matches between ${state.name}'s current top-10 and the national 2024 top-10`,
  ];

  narrative.push(
    `${pickVariant(key, overlapOpenings)} — meaning the state is ${overlapInterp}`,
  );

  // Fragment 2 — distinctive names
  if (distinctiveCount >= 1) {
    const distinctiveNames = [...distinctiveBoys, ...distinctiveGirls]
      .slice(0, 5)
      .map((r) => r.name)
      .join(', ');
    const distinctivePhrases = [
      `${state.name}'s most distinctive picks — names that rank in the state's top-10 but fall outside the national top-50 — include ${distinctiveNames}. These are the cultural fingerprints worth flagging if you're trying to read where local taste diverges from the average.`,
      `Names like ${distinctiveNames} appear in ${state.name}'s top-10 but not in the national top-50 — the kind of regional bias that makes state-level data more interesting than national averages alone.`,
      `Pulling out the names that rank locally but not nationally surfaces ${distinctiveNames}. These signals usually trace back to specific demographics, immigration patterns, or cultural traditions that ${state.name} carries more strongly than the country at large.`,
    ];
    narrative.push(pickVariant(key, distinctivePhrases, 7));
  } else {
    narrative.push(
      `Every name in ${state.name}'s top-10 also ranks in the national top-50 — meaning at the very top of the chart, the state is almost indistinguishable from national taste. State-level character shows up further down the list, not in the headline picks.`,
    );
  }

  // Fragment 3 — vintage vs modern era profile
  if (averagePeakYear !== null) {
    let leanPhrase: string;
    if (vintageLean === 'vintage_lean') {
      leanPhrase = `The average peak year of ${state.name}'s top-20 names is ${averagePeakYear} — meaning the bulk of these names had their high-water moment well before the millennium. ${state.name} parents are leaning into vintage-revival territory rather than chasing the freshest 2020s entries.`;
    } else if (vintageLean === 'balanced') {
      leanPhrase = `The average peak year of ${state.name}'s top-20 names is ${averagePeakYear} — a balanced era profile, mixing late-twentieth-century classics with modern revivals rather than concentrating in one cohort.`;
    } else {
      leanPhrase = `The average peak year of ${state.name}'s top-20 names is ${averagePeakYear} — ${state.name} parents lean toward names that peaked recently or are still peaking, a forward-facing era profile rather than a vintage-revival one.`;
    }
    narrative.push(leanPhrase);
  }

  return {
    slug: state.slug,
    name: state.name,
    code: state.code,
    topBoyOverlap,
    topGirlOverlap,
    matchedBoys,
    matchedGirls,
    distinctiveBoys,
    distinctiveGirls,
    averagePeakYear,
    vintageLean,
    narrative,
  };
}
