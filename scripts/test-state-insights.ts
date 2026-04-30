#!/usr/bin/env tsx
/* Smoke test for lib/state-insights.ts */
import { getStateInsight } from '../lib/state-insights';

const samples = [
  'california',     // expect highest overlap (mainstream)
  'texas',          // hispanic-leaning
  'utah',           // expect distinctive (LDS)
  'hawaii',         // expect distinctive (Pan-Polynesian)
  'mississippi',    // expect distinctive (Southern biblical)
  'new-york',
  'wyoming',
  'louisiana',
  'alabama',
  'massachusetts',
];

for (const slug of samples) {
  const i = getStateInsight(slug);
  if (!i) { console.log(`${slug}: NOT FOUND`); continue; }
  console.log(`\n━━━ ${i.name} (${i.code}) ━━━`);
  console.log(`overlap: B=${i.topBoyOverlap}/10 G=${i.topGirlOverlap}/10`);
  console.log(`distinct: B=[${i.distinctiveBoys.map(r=>r.name).join(', ')}] G=[${i.distinctiveGirls.map(r=>r.name).join(', ')}]`);
  console.log(`avg peak year: ${i.averagePeakYear} (lean=${i.vintageLean})`);
  i.narrative.forEach((p) => console.log(`▸ ${p}`));
}
