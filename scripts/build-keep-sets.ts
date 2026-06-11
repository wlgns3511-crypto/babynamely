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
 * /middle-names/ left ALONE (MIDDLE_NAME_PRERENDER_LIMIT=999999 → all 6,782
 * names prerender; that's ~50% of 28d clicks, must stay).
 * /name/ left ALONE (all 6,782 names prerender, top earner category).
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
import { getTopComparisons, getNameBySlug } from '../lib/db';

const COMPARE_CAP = 100;

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
