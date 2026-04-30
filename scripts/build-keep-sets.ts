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

const compareKeep = Array.from(slugSet).sort();
fs.writeFileSync(path.join(OUT_DIR, 'compare-keep.json'), JSON.stringify(compareKeep));

console.log(
  `✓ compare-keep.json: ${compareKeep.length} compares (${base.length} base + ${gscAdded} GSC new, ${gscSkipped} skipped as missing from DB)`,
);
