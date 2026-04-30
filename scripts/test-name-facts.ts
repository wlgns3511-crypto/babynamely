#!/usr/bin/env tsx
/* Quick smoke test for lib/name-facts.ts */
import { getNameFacts } from '../lib/name-facts';

const LATEST_YEAR = 2024;
const samples = ['liam', 'olivia', 'emma', 'mary', 'noah', 'mateo', 'thiago', 'jennifer', 'arya'];
for (const slug of samples) {
  const f = getNameFacts(slug);
  if (!f) {
    console.log(`${slug}: NOT FOUND`);
    continue;
  }
  console.log(`\n=== ${slug} (${f.gender}) ===`);
  if (f.current) {
    console.log(
      `  ${f.current.year}: rank #${f.current.rank}, ${(f.current.pct! * 100).toFixed(3)}% ` +
        `(~${f.current.estimatedBabies?.toLocaleString()} babies)`,
    );
  } else {
    console.log(`  ${LATEST_YEAR}: not in record`);
  }
  console.log(
    `  YoY: prior #${f.recent.priorRank ?? '?'} → ${f.recent.direction} ` +
      `(rank Δ ${f.recent.rankChange ?? '?'}, 5y trend ${f.recent.fiveYearTrendPct ?? '?'}%)`,
  );
  console.log(
    `  Cumulative: ~${f.cumulative.estimatedTotal.toLocaleString()} since ${f.cumulative.firstYear}, ` +
      `${f.cumulative.yearsInRecord} years, best rank #${f.cumulative.bestRank} in ${f.cumulative.bestRankYear}`,
  );
  console.log(
    `  Decade table: ${f.decadeRanks.length} rows, ` +
      `e.g. 2020s avg rank #${f.decadeRanks.find((d) => d.decade === 2020)?.avgRank ?? '?'}`,
  );
  console.log(
    `  Peers nearby ${f.current?.year}: ${f.peersInRankBand.map((p) => `${p.name}(#${p.rank})`).join(', ')}`,
  );
  console.log(
    `  Peers same-decade peak: ${f.peersSameDecadePeak.map((p) => `${p.name}(${p.rank})`).join(', ')}`,
  );
}
