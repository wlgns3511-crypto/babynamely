import { getNameRank, getNameStats, getLatestPopularity } from '@/lib/db';
import type { BabyName } from '@/lib/db';

interface Props {
  name: BabyName;
}

export function InsightCards({ name: n }: Props) {
  const stats = getNameStats();
  const rank = getNameRank(n.slug);
  const latest = getLatestPopularity(n.slug);

  // Popularity rank
  const rankLabel = rank != null && stats.totalNames > 0
    ? `Top ${((rank / stats.totalNames) * 100).toFixed(1)}%`
    : null;

  // Peak era
  const peakEra = n.peak_year != null
    ? n.peak_year >= 2010 ? 'Modern'
      : n.peak_year >= 1990 ? '1990s-2000s'
      : n.peak_year >= 1970 ? '1970s-1980s'
      : n.peak_year >= 1950 ? 'Mid-Century'
      : n.peak_year >= 1920 ? 'Early 20th Century'
      : 'Victorian Era'
    : null;

  // Trend: compare latest vs peak
  const trend = latest && n.peak_pct
    ? latest.pct >= n.peak_pct * 0.8 ? 'Rising'
      : latest.pct >= n.peak_pct * 0.4 ? 'Stable'
      : 'Falling'
    : n.peak_year && n.peak_year >= 2010 ? 'Rising'
    : n.peak_year && n.peak_year < 1960 ? 'Falling'
    : 'Stable';

  const trendColor = trend === 'Rising' ? 'text-green-600' : trend === 'Falling' ? 'text-red-600' : 'text-pink-700';

  // Name length category
  const len = n.name.length;
  const lengthLabel = len <= 3 ? 'Ultra-Short' : len <= 5 ? 'Short' : len <= 7 ? 'Medium' : 'Long';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-6">
      {/* Popularity Rank */}
      {rank != null && (
        <div className="rounded-xl border p-4 border-pink-200 bg-pink-50">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Popularity Rank</div>
          <div className="text-2xl font-bold text-pink-700 mb-1">#{rank.toLocaleString()}</div>
          <p className="text-sm text-slate-600 leading-snug">
            {rankLabel} — out of {stats.totalNames.toLocaleString()} names tracked by the SSA.
          </p>
        </div>
      )}

      {/* Peak Era */}
      {peakEra && (
        <div className="rounded-xl border p-4 border-pink-200 bg-pink-50">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Peak Era</div>
          <div className="text-2xl font-bold text-pink-700 mb-1">{peakEra}</div>
          <p className="text-sm text-slate-600 leading-snug">
            {n.name} peaked in popularity around {n.peak_year}. {peakEra === 'Modern' ? 'A contemporary favorite.' : peakEra === 'Mid-Century' ? 'A classic mid-century name.' : `Popular during the ${peakEra.toLowerCase()} period.`}
          </p>
        </div>
      )}

      {/* Trend */}
      <div className="rounded-xl border p-4 border-pink-200 bg-pink-50">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Trend</div>
        <div className={`text-2xl font-bold mb-1 ${trendColor}`}>{trend}</div>
        <p className="text-sm text-slate-600 leading-snug">
          {trend === 'Rising' ? `${n.name} is gaining popularity and trending upward.` : trend === 'Falling' ? `${n.name} has been declining from its peak usage.` : `${n.name} has maintained steady usage over recent years.`}
        </p>
      </div>

      {/* Name Length */}
      <div className="rounded-xl border p-4 border-pink-200 bg-pink-50">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Name Length</div>
        <div className="text-2xl font-bold text-pink-700 mb-1">{len} Letters</div>
        <p className="text-sm text-slate-600 leading-snug">
          {lengthLabel} name. {len <= 5 ? 'Short names are easy to spell and remember.' : 'Longer names offer nickname flexibility.'}
        </p>
      </div>
    </div>
  );
}
