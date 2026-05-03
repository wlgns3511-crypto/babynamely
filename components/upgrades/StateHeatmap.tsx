import type { StateHeatmapData, StateShare } from '@/lib/state-heatmap';
import { stateName } from '@/lib/state-heatmap';

const ALL_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL',
  'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
  'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
  'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
  'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

interface Props {
  name: string;
  gender: 'boy' | 'girl' | string;
  data: StateHeatmapData;
}

function formatShare(s: number): string {
  if (s >= 100) return s.toFixed(0);
  if (s >= 10) return s.toFixed(1);
  return s.toFixed(2);
}

function intensityClass(share: number, max: number): string {
  if (share <= 0 || max <= 0) return 'bg-slate-50 text-slate-300';
  const ratio = share / max;
  if (ratio >= 0.75) return 'bg-purple-700 text-white';
  if (ratio >= 0.5) return 'bg-purple-500 text-white';
  if (ratio >= 0.25) return 'bg-purple-300 text-purple-900';
  if (ratio >= 0.1) return 'bg-purple-100 text-purple-900';
  return 'bg-slate-100 text-slate-500';
}

function spreadCopy(name: string, spread: StateHeatmapData['concentration']['spread'], top: StateShare | undefined): string {
  if (!top) return `${name} appears across the United States with no single state dominating.`;
  const topState = stateName(top.state);
  if (spread === 'concentrated')
    return `${name} is heavily concentrated in ${topState} — that one state accounts for the largest chunk of recent ${name} births in the SSA file.`;
  if (spread === 'regional')
    return `${name} has a regional footprint in 2020-2024: ${topState} leads, and the top five states together carry the majority of recent births.`;
  return `${name} is distributed nationally — recent births are spread across many states with no dominant single state.`;
}

export function StateHeatmap({ name, gender, data }: Props) {
  const accent = gender === 'boy' ? 'blue' : 'pink';
  const bg = gender === 'boy' ? 'bg-blue-50/40 border-blue-100' : 'bg-pink-50/40 border-pink-100';
  const heading = gender === 'boy' ? 'text-blue-900' : 'text-pink-900';
  const maxShare = Math.max(...Object.values(data.fullHeatmap), 0);

  return (
    <section className={`my-8 rounded-xl border p-5 ${bg}`}>
      <div className="mb-4">
        <div className={`text-xs uppercase tracking-wider font-semibold ${gender === 'boy' ? 'text-blue-700' : 'text-pink-700'}`}>
          State popularity · SSA per-state file
        </div>
        <h2 className={`text-xl font-bold ${heading}`}>Where {name} is most common</h2>
        <p className="mt-2 text-sm text-slate-700 leading-relaxed">{spreadCopy(name, data.concentration.spread, data.topAbsoluteRecent[0])}</p>
      </div>

      {(() => {
        const useRecent = data.topAbsoluteRecent.length > 0;
        const absList = useRecent ? data.topAbsoluteRecent : data.topAbsoluteAllTime;
        const shareList = useRecent ? data.topShareRecent : data.topShareAllTime;
        const periodLabel = useRecent ? '2020–2024' : 'all-time';
        if (absList.length === 0 && shareList.length === 0) return null;
        return (
          <div className="grid md:grid-cols-2 gap-4">
            {absList.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Top 5 states · {periodLabel} (count)</div>
                <ol className="space-y-1.5">
                  {absList.map((s, i) => (
                    <li key={s.state} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">
                        <span className="text-slate-400 mr-2">{i + 1}.</span>{stateName(s.state)}
                      </span>
                      <span className="font-semibold text-slate-900">{s.count.toLocaleString()}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-3 text-xs text-slate-400">Births of {name} ({gender}) recorded in each state, {periodLabel}.</div>
              </div>
            )}
            {shareList.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Top 5 states · {periodLabel} (per 10,000)</div>
                <ol className="space-y-1.5">
                  {shareList.map((s, i) => (
                    <li key={s.state} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">
                        <span className="text-slate-400 mr-2">{i + 1}.</span>{stateName(s.state)}
                      </span>
                      <span className={`font-semibold text-${accent}-700`}>{formatShare(s.share_per_10k)} / 10k</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-3 text-xs text-slate-400">Per 10,000 same-gender births in each state — controls for state size.</div>
              </div>
            )}
          </div>
        );
      })()}

      <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">All 51 states · share per 10,000 (2020–2024)</div>
        <div className="grid grid-cols-7 sm:grid-cols-12 gap-1">
          {ALL_STATES.map((code) => {
            const share = data.fullHeatmap[code] ?? 0;
            return (
              <div
                key={code}
                title={`${stateName(code)} — ${formatShare(share)} per 10,000`}
                className={`text-[10px] py-1.5 rounded text-center font-mono leading-none ${intensityClass(share, maxShare)}`}
              >
                <div className="font-bold">{code}</div>
                <div className="opacity-75 mt-0.5">{share > 0 ? formatShare(share) : '—'}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <span>Less common</span>
          <div className="flex gap-0.5">
            <div className="h-3 w-4 bg-slate-100 rounded-sm" />
            <div className="h-3 w-4 bg-purple-100 rounded-sm" />
            <div className="h-3 w-4 bg-purple-300 rounded-sm" />
            <div className="h-3 w-4 bg-purple-500 rounded-sm" />
            <div className="h-3 w-4 bg-purple-700 rounded-sm" />
          </div>
          <span>More common</span>
          <span className="ml-auto">Source: SSA per-state file (2020–2024)</span>
        </div>
      </div>

      {data.topShareAllTime.length > 0 && data.topShareRecent.length > 0 && data.topShareRecent[0].state !== data.topShareAllTime[0].state && (
        <p className="mt-4 text-sm text-slate-700">
          <strong>All-time anchor</strong>: historically {name} has its highest per-capita share in {stateName(data.topShareAllTime[0].state)} ({formatShare(data.topShareAllTime[0].share_per_10k)} per 10,000 same-gender births since 1910). The recent leader is {stateName(data.topShareRecent[0].state)} — a shift worth noting.
        </p>
      )}
      {data.topShareAllTime.length > 0 && data.topShareRecent.length === 0 && (
        <p className="mt-4 text-sm text-slate-700">
          <strong>Historical anchor only</strong>: {name} has no significant 2020–2024 SSA data — historically the highest per-capita share was in {stateName(data.topShareAllTime[0].state)} ({formatShare(data.topShareAllTime[0].share_per_10k)} per 10,000 same-gender births).
        </p>
      )}
    </section>
  );
}
