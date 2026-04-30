/**
 * LiveStats — Layer 1+2 unique-data section.
 *
 * Replaces the templated "Trending up" type messaging with concrete numbers
 * specific to this name: 2024 rank, estimated babies, cumulative count,
 * decade-by-decade rank trajectory, peer comparisons.
 *
 * Per-page uniqueness comes from the data: every name has a different rank,
 * count, and decade trajectory. Two pages cannot have identical content.
 *
 * Built for the AdSense low-value-content remediation 2026-04-28.
 */
import type { NameFacts } from '@/lib/name-facts';
import type { NameCommentary } from '@/lib/name-commentary';

interface Props {
  name: string;
  facts: NameFacts;
  commentary: NameCommentary;
}

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1_000).toLocaleString()}K`;
  return n.toLocaleString();
}

const directionEmoji: Record<NameCommentary['trendStatus'], string> = {
  rising: '📈',
  falling: '📉',
  stable_top: '👑',
  stable_mid: '➡️',
  stable_long_tail: '·',
  vintage_peak: '🏛',
  vintage_revival: '🔄',
  modern_classic: '✨',
  fading: '💧',
  comeback: '🔄',
  absent: '·',
};

const directionLabel: Record<NameCommentary['trendStatus'], string> = {
  rising: 'Rising',
  falling: 'Declining',
  stable_top: 'Top-tier classic',
  stable_mid: 'Steadily popular',
  stable_long_tail: 'Uncommon',
  vintage_peak: 'Vintage',
  vintage_revival: 'Revival',
  modern_classic: 'Modern classic',
  fading: 'Fading',
  comeback: 'Comeback',
  absent: 'Below threshold',
};

export function LiveStats({ name, facts, commentary }: Props) {
  const { current, recent, cumulative, decadeRanks, peersInRankBand } = facts;

  return (
    <section
      data-upgrade="live-stats"
      aria-label={`Live data snapshot for ${name}`}
      className="my-10 rounded-xl border border-slate-200 bg-white"
    >
      {/* Header */}
      <header className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span aria-hidden="true">{directionEmoji[commentary.trendStatus]}</span>
          {name} — Live SSA Snapshot
        </h2>
        <span className="text-xs uppercase tracking-wide text-slate-500">
          {directionLabel[commentary.trendStatus]}
        </span>
      </header>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
        <div className="px-5 py-4">
          <div className="text-xs text-slate-500">2024 Rank</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {current?.rank ? `#${current.rank}` : '—'}
          </div>
          {recent.priorRank && current?.rank && recent.rankChange !== null ? (
            <div className="text-xs text-slate-500 mt-1">
              {recent.rankChange > 0
                ? `▲ ${recent.rankChange} from #${recent.priorRank}`
                : recent.rankChange < 0
                  ? `▼ ${Math.abs(recent.rankChange)} from #${recent.priorRank}`
                  : `unchanged from #${recent.priorRank}`}
            </div>
          ) : null}
        </div>
        <div className="px-5 py-4">
          <div className="text-xs text-slate-500">Babies in 2024</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {current?.estimatedBabies ? `~${fmtCount(current.estimatedBabies)}` : '—'}
          </div>
          {current?.pct ? (
            <div className="text-xs text-slate-500 mt-1">
              {(current.pct * 100).toFixed(2)}% of {facts.gender === 'boy' ? 'boys' : 'girls'}
            </div>
          ) : null}
        </div>
        <div className="px-5 py-4">
          <div className="text-xs text-slate-500">Cumulative ({cumulative.firstYear}–2024)</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            ~{fmtCount(cumulative.estimatedTotal)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            across {cumulative.yearsInRecord} years
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="text-xs text-slate-500">All-time best</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            #{cumulative.bestRank}
          </div>
          <div className="text-xs text-slate-500 mt-1">in {cumulative.bestRankYear}</div>
        </div>
      </div>

      {/* Commentary */}
      <div className="px-5 py-4 space-y-3 text-sm leading-relaxed text-slate-700">
        <p>
          <span className="font-semibold text-slate-900">{commentary.headline}</span>
        </p>
        {commentary.trend ? <p>{commentary.trend}</p> : null}
        {commentary.history ? <p>{commentary.history}</p> : null}
        {commentary.context ? <p>{commentary.context}</p> : null}
      </div>

      {/* Decade-by-decade rank trajectory */}
      {decadeRanks.length >= 3 ? (
        <details className="border-t border-slate-100 px-5 py-4 group">
          <summary className="cursor-pointer text-sm font-semibold text-slate-900 flex items-center justify-between">
            <span>Decade-by-decade rank ({decadeRanks[0].decade}s – {decadeRanks[decadeRanks.length - 1].decade}s)</span>
            <span className="text-xs text-slate-500 group-open:hidden">Show table ▾</span>
            <span className="text-xs text-slate-500 hidden group-open:inline">Hide ▴</span>
          </summary>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-4">Decade</th>
                  <th className="py-2 pr-4">Avg rank</th>
                  <th className="py-2 pr-4">Avg share of births</th>
                  <th className="py-2 pr-4">Years counted</th>
                </tr>
              </thead>
              <tbody>
                {decadeRanks.map((d) => (
                  <tr key={d.decade} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-4 font-medium text-slate-900">{d.decade}s</td>
                    <td className="py-2 pr-4">#{d.avgRank}</td>
                    <td className="py-2 pr-4">{(d.avgPct * 100).toFixed(3)}%</td>
                    <td className="py-2 pr-4 text-slate-500">{d.yearsCovered}/10</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ) : null}

      {/* Peers ranked nearby */}
      {peersInRankBand.length > 0 ? (
        <div className="border-t border-slate-100 px-5 py-4">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
            Names ranked nearby in 2024
          </div>
          <div className="flex flex-wrap gap-2">
            {peersInRankBand.map((p) => (
              <a
                key={p.slug}
                href={`/name/${p.slug}/`}
                className="text-xs px-2.5 py-1 rounded-full border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition"
              >
                <span className="text-slate-500">#{p.rank}</span>{' '}
                <span className="font-medium text-slate-800">{p.name}</span>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <footer className="border-t border-slate-100 px-5 py-2 text-[11px] text-slate-500">
        Source: U.S. Social Security Administration national-level baby names data,
        1880–2024. Updated annually each May.
      </footer>
    </section>
  );
}
