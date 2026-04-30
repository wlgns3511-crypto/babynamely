#!/usr/bin/env tsx
/* Smoke test for lib/cluster-insights.ts */
import {
  getYearInsight,
  getLetterInsight,
  getOriginInsight,
  getGenderInsight,
} from '../lib/cluster-insights';

console.log('━━━ YEAR ━━━');
for (const y of [1900, 1950, 2000, 2024]) {
  const i = getYearInsight(y);
  console.log(`\n[${y}] topBoy=${i.topBoy?.name} topGirl=${i.topGirl?.name} top10Boy=${(i.top10ShareBoy * 100).toFixed(1)}% top10Girl=${(i.top10ShareGirl * 100).toFixed(1)}% riser=${i.biggestRiser?.name ?? 'n/a'}+${i.biggestRiser?.rankChange ?? '-'} debuts=${i.debutCount}`);
  i.narrative.forEach((p) => console.log(`  ▸ ${p}`));
}

console.log('\n━━━ LETTER ━━━');
for (const l of ['a', 'j', 'q', 'x']) {
  const i = getLetterInsight(l);
  console.log(`\n[${l.toUpperCase()}] count=${i.count} (boys=${i.countBoy}, girls=${i.countGirl}) topOrigin=${i.topOrigin?.origin ?? 'n/a'}(${((i.topOrigin?.share ?? 0) * 100).toFixed(0)}%) modalDecade=${i.modalPeakDecade}s`);
  i.narrative.forEach((p) => console.log(`  ▸ ${p}`));
}

console.log('\n━━━ ORIGIN ━━━');
for (const o of ['Latin', 'Hebrew', 'Arabic', 'Greek']) {
  const i = getOriginInsight(o);
  console.log(`\n[${o}] count=${i.count} firstDecade=${i.firstAppearedDecade}s modalDecade=${i.modalPeakDecade}s trending=${i.isCurrentlyTrending}`);
  i.narrative.forEach((p) => console.log(`  ▸ ${p}`));
}

console.log('\n━━━ GENDER ━━━');
for (const g of ['boy', 'girl'] as const) {
  const i = getGenderInsight(g);
  console.log(`\n[${g}] total=${i.totalNames} top10=${(i.top10Share2024 * 100).toFixed(1)}% top100=${(i.top100Share2024 * 100).toFixed(1)}% longTail=${(i.longTailShare2024 * 100).toFixed(1)}% arc=${i.decadeArc.length}`);
  i.narrative.forEach((p) => console.log(`  ▸ ${p}`));
}
