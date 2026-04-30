import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getNamesByOrigin, getAllOrigins } from "@/lib/db";
import { getOriginInsight } from "@/lib/cluster-insights";

interface Props { params: Promise<{ origin: string }> }

// 2026-04-24 — MUST stay `false`. See app/name/[slug]/page.tsx for the
// Next.js 16 soft-404 bug this flag works around.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllOrigins().map((o) => ({ origin: o.toLowerCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { origin } = await params;
  const cap = origin.charAt(0).toUpperCase() + origin.slice(1);
  return {
    title: `${cap} Baby Names - Origins & Meanings`,
    description: `Browse baby names of ${cap} origin. Find beautiful ${cap} names with meanings and popularity data.`,
    alternates: { canonical: `/names/origin/${origin}/` },
    openGraph: { url: `/names/origin/${origin}/` },
  };
}

export default async function OriginPage({ params }: Props) {
  const { origin } = await params;
  const cap = origin.charAt(0).toUpperCase() + origin.slice(1);
  const names = getNamesByOrigin(cap);
  if (names.length === 0) notFound();

  const origins = getAllOrigins();
  const insight = getOriginInsight(cap);

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:underline">Home</a> / <span className="text-slate-800">{cap} Names</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">{cap} Baby Names</h1>
      <p className="text-slate-600 mb-6">{names.length} names of {cap} origin</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {origins.map((o) => (
          <a key={o} href={`/names/origin/${o.toLowerCase()}/`}
            className={`px-3 py-1 rounded-full text-sm border ${o === cap ? 'bg-purple-600 text-white border-purple-600' : 'border-slate-200 hover:bg-purple-50'}`}>
            {o}
          </a>
        ))}
      </div>

      {insight.narrative.length > 0 && (
        <section
          data-upgrade="origin-insight"
          aria-label={`Snapshot for ${cap} origin`}
          className="my-6 rounded-xl border border-slate-200 bg-white"
        >
          <header className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Snapshot · {cap} origin</h2>
            <span className="text-xs uppercase tracking-wide text-slate-500">
              {insight.isCurrentlyTrending ? 'Trending up 2020s' : 'Stable / cooling 2020s'}
            </span>
          </header>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
            <div className="px-5 py-3">
              <div className="text-xs text-slate-500">Pool size</div>
              <div className="text-base font-bold text-slate-900 mt-1">{insight.count.toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-1">distinct names</div>
            </div>
            <div className="px-5 py-3">
              <div className="text-xs text-slate-500">First peak decade</div>
              <div className="text-base font-bold text-slate-900 mt-1">{insight.firstAppearedDecade ? `${insight.firstAppearedDecade}s` : '—'}</div>
            </div>
            <div className="px-5 py-3">
              <div className="text-xs text-slate-500">Modal peak decade</div>
              <div className="text-base font-bold text-slate-900 mt-1">{insight.modalPeakDecade ? `${insight.modalPeakDecade}s` : '—'}</div>
            </div>
            <div className="px-5 py-3">
              <div className="text-xs text-slate-500">All-time top name</div>
              <div className="text-base font-bold text-slate-900 mt-1">
                {insight.topNames[0] ? (
                  <a href={`/name/${insight.topNames[0].slug}/`} className="hover:underline">{insight.topNames[0].name}</a>
                ) : '—'}
              </div>
              {insight.topNames[0] && (
                <div className="text-xs text-slate-500 mt-1">peak {(insight.topNames[0].peakPct * 100).toFixed(2)}%</div>
              )}
            </div>
          </div>
          <div className="px-5 py-4 space-y-3 text-sm leading-relaxed text-slate-700">
            {insight.narrative.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          {insight.topNames.length > 0 && (
            <div className="border-t border-slate-100 px-5 py-3">
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">All-time top {cap} names</div>
              <div className="flex flex-wrap gap-2">
                {insight.topNames.map((n) => (
                  <a key={n.slug} href={`/name/${n.slug}/`}
                    className="text-xs px-2.5 py-1 rounded-full border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition">
                    <span className="font-medium text-slate-800">{n.name}</span>
                    <span className="text-slate-500 ml-1">{(n.peakPct * 100).toFixed(2)}%</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
        {names.map((n) => (
          <a key={n.slug} href={`/name/${n.slug}/`} className="p-3 border border-slate-100 rounded-lg hover:bg-purple-50">
            <div className="font-medium">{n.name}</div>
            {n.meaning && <div className="text-xs text-slate-400 mt-1">{n.meaning}</div>}
            <span className={`text-xs ${n.gender === 'boy' ? 'text-blue-400' : 'text-pink-400'}`}>{n.gender}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
