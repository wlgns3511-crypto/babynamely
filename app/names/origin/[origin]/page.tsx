import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getNamesByOrigin, getAllOrigins } from "@/lib/db";
import { getOriginInsight } from "@/lib/cluster-insights";
import { AuthorBox } from "@/components/AuthorBox";

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

      <section
        data-upgrade="origin-explainer"
        aria-label={`How to read the ${cap} origin list`}
        className="my-8 rounded-xl border border-slate-200 bg-white p-5"
      >
        <h2 className="text-lg font-bold text-slate-900 mb-3">How to read the {cap} origin list</h2>
        <div className="space-y-3 text-sm leading-relaxed text-slate-700">
          <p>
            Origin classification reflects the <em>etymological root</em> of each name, not the language a child&rsquo;s family currently speaks. A name of {cap} origin can appear in any cultural community — origin tells you where the word came from, not who&rsquo;s using it now. Our {cap} pool contains {insight.count.toLocaleString()} distinct names sourced from etymology references and the SSA file&rsquo;s metadata.
          </p>
          <p>
            <strong>What &ldquo;trending up 2020s&rdquo; flag tells you:</strong> we compute the share of {cap}-origin names appearing in the recent SSA top-1,000 vs the historical baseline. {insight.isCurrentlyTrending ? `${cap}-origin names are gaining share among current parents — meaning the etymology category as a whole is in fashion right now.` : `${cap}-origin names are stable or cooling among current parents — the category as a whole is not in active fashion movement.`} This is a category-level signal; individual names within the category can move opposite to the category trend.
          </p>
          <p>
            <strong>What this view does <em>not</em> capture:</strong> origin is often disputed (some names have multiple plausible etymologies), and our classification picks the most-cited root rather than enumerating all possibilities. Migration history also matters — a name of {cap} origin may have entered American naming culture via a third country&rsquo;s diaspora rather than directly. We do not capture diaspora pathways.
          </p>
          <p>
            <strong>Practical use:</strong> if you&rsquo;re researching {cap}-origin names for heritage reasons, treat this list as a discovery surface rather than a definitive cultural authority. Cross-reference with community-specific naming references for nuance — etymology and community tradition do not always overlap. Click into individual names to see Cross-Generation Cohort Index, which shows whether each name resonates with current parents or only with older cohorts.
          </p>
        </div>
      </section>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
        {names.map((n) => (
          <a key={n.slug} href={`/name/${n.slug}/`} className="p-3 border border-slate-100 rounded-lg hover:bg-purple-50">
            <div className="font-medium">{n.name}</div>
            {n.meaning && <div className="text-xs text-slate-400 mt-1">{n.meaning}</div>}
            <span className={`text-xs ${n.gender === 'boy' ? 'text-blue-400' : 'text-pink-400'}`}>{n.gender}</span>
          </a>
        ))}
      </div>

      <AuthorBox source={`Etymological references cross-referenced with U.S. SSA national series (1880–2024) · ${cap} origin`} />
    </div>
  );
}
