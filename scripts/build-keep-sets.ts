#!/usr/bin/env tsx
/**
 * build-keep-sets.ts — HCU 2026-04-24 (nameblooms)
 *
 * Emits lib/generated/compare-keep.json consumed by BOTH
 *   - middleware.ts           (Edge runtime — cannot import better-sqlite3)
 *   - lib/db.ts::getStaticComparisons()  (page runtime, generateStaticParams)
 *
 * Cut: /compare/ 124,750 → top-100 by popularity_score + GSC evidence.
 *
 * /middle-names/ 재건 2026-07-24: 6,782 도어웨이 → 수요(Bing)∩keep 상위 100 만.
 * 아래에서 middle-names-keep.json 도 emit (page generateStaticParams + 미들웨어 410).
 *
 * 2026-07-03: also emits name-keep.json — /name/ pruned to top-1500 by
 * peak_pct (2026-06-28 HCU defense) ∪ Bing-evidence names. Consumed by
 * middleware.ts (410 outside set), lib/db.ts::getStaticNameSlugs()
 * (generateStaticParams), and scripts/build-sitemap.ts.
 *
 * GSC evidence override (2026-03-24 ~ 2026-04-21):
 *   Verified via DB popularity_score query:
 *     charles-michael  0.0917  ← in top-100 ✓
 *     lucas-william    0.0848  ← in top-100 ✓
 *     donald-kevin     0.0435  ← below top-100 cut (rank-100 threshold 0.102)
 *     bertha-karen     0.0334  ← below top-100 cut
 *   2 of 4 GSC compare earners killed without this union — same pattern that
 *   killed 100% of earners on degreewize/zippeek/guidebycity last cleanup.
 */
import * as fs from 'fs';
import * as path from 'path';
import { getTopComparisons, getNameBySlug, getNameSlugsPage } from '../lib/db';

/**
 * 2026-07-26 — 100 → 0. `/compare/<a>-vs-<b>/` 100장은 유령이었다:
 *   라이브 200 · sitemap 0(한 번도 announce 안 됨) · Bing 페이지 0/노출 0/클릭 0 ·
 *   GSC 06-19~07-17 노출 9회는 전부 *이미 410 된* 쌍(dorothy-vs-sallie 등).
 * 게다가 comparisons 는 원자료가 아니라 상위 500 이름의 크로스조인이어서
 * `amanda-vs-john` 같은 이성 쌍이 섞인다. 100장이 보여주던 숫자는 /compare/ 허브
 * 한 장의 로스터(getComparisonRoster, 500 이름 전량)로 옮겼다 — URL 순증 0.
 * 아래 GSC_EVIDENCE_COMPARES 4쌍은 실제 클릭이 측정된 쌍이라 union 으로 남긴다
 * (교집합으로 자르면 earner 를 죽인다 — /middle-names/ 에서 클릭 87회를 그렇게 잃었다).
 */
const COMPARE_CAP = 0;

// GSC evidence — /compare/ URLs earning ≥1 click in 28d window.
const GSC_EVIDENCE_COMPARES: [string, string][] = [
  ['charles', 'michael'],
  ['bertha', 'karen'],
  ['donald', 'kevin'],
  ['lucas', 'william'],
];

const OUT_DIR = path.resolve(__dirname, '..', 'lib', 'generated');
fs.mkdirSync(OUT_DIR, { recursive: true });

// HCU 2026-05-04 — Bing impressions auto-union (separate index from Google).
const BING_JSON_DIR = path.resolve(__dirname, '..', '..', '_shared', 'data', 'bing_analyze');
const BING_DOMAIN = 'nameblooms.com';
const BING_MIN_IMP = 1;

function loadBingSlugs(routeRe: RegExp): string[] {
  if (!fs.existsSync(BING_JSON_DIR)) return [];
  const files = fs.readdirSync(BING_JSON_DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort();
  if (!files.length) return [];
  try {
    // 2026-06-11 partial-run shadow fix (kalimawize 2026-05-15 pattern): the
    // absolute-latest snapshot may be a partial run without this domain —
    // scan newest-first and use the first file that actually contains us.
    // Source-side carry-forward also added to analyze_bing_pages.py same day;
    // this is defense-in-depth for historical partial files.
    let site: any;
    for (let i = files.length - 1; i >= 0; i--) {
      const json = JSON.parse(fs.readFileSync(path.join(BING_JSON_DIR, files[i]), 'utf8'));
      if (json[BING_DOMAIN] && Array.isArray(json[BING_DOMAIN].pages)) { site = json[BING_DOMAIN]; break; }
    }
    if (!site || !Array.isArray(site.pages)) return [];
    const out = new Map<string, number>();
    for (const pg of site.pages) {
      const url = String(pg.url || '');
      const pathOnly = url.replace(/^https?:\/\/[^/]+/, '');
      const m = routeRe.exec(pathOnly);
      if (!m) continue;
      const slug = decodeURIComponent(m[1]);
      const imp = Number(pg.impressions) || 0;
      out.set(slug, (out.get(slug) || 0) + imp);
    }
    return [...out.entries()].filter(([, i]) => i >= BING_MIN_IMP).map(([s]) => s);
  } catch {
    return [];
  }
}

const base = getTopComparisons(COMPARE_CAP).map((p) => {
  const [a, b] = [p.slugA, p.slugB].sort();
  return `${a}-vs-${b}`;
});
const slugSet = new Set<string>(base);

let gscAdded = 0;
let gscSkipped = 0;
for (const [a, b] of GSC_EVIDENCE_COMPARES) {
  if (!getNameBySlug(a) || !getNameBySlug(b)) {
    gscSkipped++;
    continue;
  }
  const [sA, sB] = [a, b].sort();
  const canonical = `${sA}-vs-${sB}`;
  if (!slugSet.has(canonical)) gscAdded++;
  slugSet.add(canonical);
}

// Bing-union — names are single tokens, slug form `a-vs-b` (one -vs- delimiter)
const bingRaw = loadBingSlugs(/^\/compare\/([^/]+)\/?$/);
let bingAdded = 0;
let bingSkipped = 0;
for (const raw of bingRaw) {
  const m = raw.match(/^([^-]+)-vs-([^-]+)$/);
  if (!m) { bingSkipped++; continue; }
  const a = m[1], b = m[2];
  if (!getNameBySlug(a) || !getNameBySlug(b)) { bingSkipped++; continue; }
  const [sA, sB] = [a, b].sort();
  const canonical = `${sA}-vs-${sB}`;
  if (!slugSet.has(canonical)) {
    slugSet.add(canonical);
    bingAdded++;
  }
}

const compareKeep = Array.from(slugSet).sort();
fs.writeFileSync(path.join(OUT_DIR, 'compare-keep.json'), JSON.stringify(compareKeep));

console.log(
  `✓ compare-keep.json: ${compareKeep.length} compares (${base.length} base + ${gscAdded} GSC + ${bingAdded} Bing, ${gscSkipped + bingSkipped} skipped)`,
);

// ─── name-keep.json — 2026-07-03 ─────────────────────────────────────────
// The 2026-06-28 HCU prune capped /name/ at getNameSlugsPage(0, 1500) but
// shipped without a keep-set → 6,267 dropped names served 404 (convention
// says 410). Base cohort = the page's exact query (peak_pct DESC LIMIT
// 1500), unioned with Bing-evidence names so the cut never kills an earner
// (same rationale as the compare GSC union above).
const nameBase = getNameSlugsPage(0, 1500).map((n) => n.slug);
const nameSet = new Set<string>(nameBase);

// Locale routes were retired, but this name earned real Bing clicks through
// the old Spanish URL and still has a complete SSA-backed time series.
const historicalDemandNames = ['mareli'];
let nameHistoricalAdded = 0;
for (const slug of historicalDemandNames) {
  if (!getNameBySlug(slug)) continue;
  if (!nameSet.has(slug)) {
    nameSet.add(slug);
    nameHistoricalAdded++;
  }
}

const nameBingRaw = loadBingSlugs(/^\/name\/([^/]+)\/?$/);
let nameBingAdded = 0;
let nameBingSkipped = 0;
for (const slug of nameBingRaw) {
  if (!getNameBySlug(slug)) { nameBingSkipped++; continue; }
  if (!nameSet.has(slug)) {
    nameSet.add(slug);
    nameBingAdded++;
  }
}

const nameKeep = Array.from(nameSet).sort();
fs.writeFileSync(path.join(OUT_DIR, 'name-keep.json'), JSON.stringify(nameKeep));

console.log(
  `✓ name-keep.json: ${nameKeep.length} names (${nameBase.length} base + ${nameHistoricalAdded} historical + ${nameBingAdded} Bing, ${nameBingSkipped} skipped)`,
);

// ─── middle-names-keep.json — 2026-07-24 재건 ─────────────────────────────
// /middle-names/ 는 성별당 top-20 을 그대로 붙인 6,782 도어웨이라 애드센스 scaled-content
// 로 죽었다(2026-04-26). first name 의 음절·끝소리·연대로 점수 매기는 실제 페어링 로직으로
// 재건하되 prerender·색인은 수요(Bing)∩keep 상위 100 만. 근거 스냅샷의 bing_demand 를
// nameSet 로 걸러 imp 내림차순 상위 100 → 나머지는 미들웨어 410. (name-keep 와 같은 run 의
// nameSet 을 재사용해 경계가 일관된다.)
const MIDDLE_DEMAND_SNAPSHOT = path.resolve(__dirname, '..', 'ops', 'middle-names-410-snapshot.json');
let middleKeep: string[] = [];
if (fs.existsSync(MIDDLE_DEMAND_SNAPSHOT)) {
  const snap = JSON.parse(fs.readFileSync(MIDDLE_DEMAND_SNAPSHOT, 'utf8')) as {
    bing_demand?: { slug: string; imp: number; clicks?: number }[];
  };
  const rows = snap.bing_demand ?? [];
  const byImp = (a: { imp: number; clicks?: number; slug: string }, b: { imp: number; clicks?: number; slug: string }) =>
    b.imp - a.imp || (b.clicks ?? 0) - (a.clicks ?? 0) || a.slug.localeCompare(b.slug);
  const demand = rows.filter((d) => nameSet.has(d.slug)).sort(byImp).slice(0, 100).map((d) => d.slug);
  /**
   * 2026-07-26 — earner union. 위 `∩ nameSet` 상위 100 은 스냅샷 509행 중 클릭 113회의
   * **26회만** 살렸다(780 노출 · 87 클릭 손실). /middle-names/ 는 이 사이트에서 클릭이
   * 가장 많이 붙는 축인데, 자르는 기준(peak_pct 상위 1500)이 그 클릭과 무관했다.
   * 그래서 클릭 ≥1 행은 name-keep 밖이어도 전부 살린다 → 179장 / 클릭 113/113.
   * 노출만 있는 나머지 330행(평균 1.9노출)은 계속 410 — 되살리면 scaled-content 로 회귀.
   * 새로 사는 59장은 `/name/<slug>/` 가 410 이므로 페이지가 자기 이름을 링크하지 않는다
   * (app/middle-names/[slug]/page.tsx 의 isIndexableNameSlug 가드).
   */
  const earners = rows.filter((d) => (d.clicks ?? 0) > 0).map((d) => d.slug);
  middleKeep = [...new Set([...demand, ...earners])].sort();
} else {
  console.warn('⚠ middle-names-410-snapshot.json 없음 → middle-names-keep.json 빈 배열');
}
fs.writeFileSync(path.join(OUT_DIR, 'middle-names-keep.json'), JSON.stringify(middleKeep));
console.log(`✓ middle-names-keep.json: ${middleKeep.length} names (수요∩keep 상위 100 ∪ 클릭 earner)`);
