import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTopNamesForYear, getAvailableYears } from "@/lib/db";
import { getYearInsight } from "@/lib/cluster-insights";
import { formatPct } from "@/lib/format";
import { itemListSchema } from "@/lib/schema";

interface Props { params: Promise<{ year: string }> }

// 2026-04-24 — MUST stay `false`. See app/name/[slug]/page.tsx for the
// Next.js 16 soft-404 bug this flag works around.
export const dynamicParams = false;

export function generateStaticParams() {
  const years = getAvailableYears();
  // Generate pages for decades + recent years
  const selected = years.filter(y => y % 10 === 0 || y >= 2000);
  return selected.map((y) => ({ year: y.toString() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `Most Popular Baby Names in ${year}`,
    description: `Top baby names in ${year}. See the most popular boy and girl names with popularity data.`,
    alternates: { canonical: `/names/year/${year}/` },
    openGraph: { url: `/names/year/${year}/` },
  };
}

export default async function YearPage({ params }: Props) {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr);
  if (isNaN(year) || year < 1880 || year > 2024) notFound();

  const topNames = getTopNamesForYear(year, 50);
  const boys = topNames.filter(n => n.gender === 'boy');
  const girls = topNames.filter(n => n.gender === 'girl');
  const years = getAvailableYears().filter(y => y % 10 === 0 || y >= 2000);
  const insight = getYearInsight(year);

  const allNames = [...boys, ...girls].map(n => ({ name: n.name, url: `/name/${n.slug}/` }));

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema(`Most Popular Baby Names in ${year}`, `/names/year/${year}/`, allNames)) }} />
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:underline">Home</a> / <span className="text-slate-800">Popular Names in {year}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">Most Popular Baby Names in {year}</h1>
      <p className="text-slate-600 mb-6">Top baby names ranked by percentage of births</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {years.map((y) => (
          <a key={y} href={`/names/year/${y}/`}
            className={`px-3 py-1 rounded-full text-sm border ${y === year ? 'bg-purple-600 text-white border-purple-600' : 'border-slate-200 hover:bg-purple-50'}`}>
            {y}
          </a>
        ))}
      </div>

      {insight.narrative.length > 0 && (
        <section
          data-upgrade="year-insight"
          aria-label={`Snapshot for ${year}`}
          className="my-8 rounded-xl border border-slate-200 bg-white"
        >
          <header className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Snapshot · {year}</h2>
            <span className="text-xs uppercase tracking-wide text-slate-500">SSA national data</span>
          </header>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
            <div className="px-5 py-3">
              <div className="text-xs text-slate-500">#1 Boy</div>
              <div className="text-base font-bold text-slate-900 mt-1">
                {insight.topBoy ? (
                  <a href={`/name/${insight.topBoy.slug}/`} className="hover:underline">{insight.topBoy.name}</a>
                ) : '—'}
              </div>
              {insight.topBoy && (
                <div className="text-xs text-slate-500 mt-1">{formatPct(insight.topBoy.pct)}</div>
              )}
            </div>
            <div className="px-5 py-3">
              <div className="text-xs text-slate-500">#1 Girl</div>
              <div className="text-base font-bold text-slate-900 mt-1">
                {insight.topGirl ? (
                  <a href={`/name/${insight.topGirl.slug}/`} className="hover:underline">{insight.topGirl.name}</a>
                ) : '—'}
              </div>
              {insight.topGirl && (
                <div className="text-xs text-slate-500 mt-1">{formatPct(insight.topGirl.pct)}</div>
              )}
            </div>
            <div className="px-5 py-3">
              <div className="text-xs text-slate-500">Top-10 share</div>
              <div className="text-base font-bold text-slate-900 mt-1">
                B {(insight.top10ShareBoy * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-slate-500 mt-1">G {(insight.top10ShareGirl * 100).toFixed(1)}%</div>
            </div>
            <div className="px-5 py-3">
              <div className="text-xs text-slate-500">Biggest riser</div>
              <div className="text-base font-bold text-slate-900 mt-1">
                {insight.biggestRiser ? (
                  <a href={`/name/${insight.biggestRiser.slug}/`} className="hover:underline">{insight.biggestRiser.name}</a>
                ) : '—'}
              </div>
              {insight.biggestRiser && (
                <div className="text-xs text-slate-500 mt-1">+{insight.biggestRiser.rankChange} vs {year - 1}</div>
              )}
            </div>
          </div>
          <div className="px-5 py-4 space-y-3 text-sm leading-relaxed text-slate-700">
            {insight.narrative.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </section>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-xl font-bold mb-3 text-blue-700">Top Boy Names ({year})</h2>
          <div className="border rounded-lg overflow-hidden">
            {boys.map((n, i) => (
              <a key={n.slug} href={`/name/${n.slug}/`} className="flex justify-between p-3 hover:bg-blue-50 border-b border-slate-100 text-sm">
                <span><span className="text-slate-400 mr-2">{i + 1}.</span>{n.name}</span>
                <span className="text-blue-600">{formatPct(n.year_pct)}</span>
              </a>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-3 text-pink-700">Top Girl Names ({year})</h2>
          <div className="border rounded-lg overflow-hidden">
            {girls.map((n, i) => (
              <a key={n.slug} href={`/name/${n.slug}/`} className="flex justify-between p-3 hover:bg-pink-50 border-b border-slate-100 text-sm">
                <span><span className="text-slate-400 mr-2">{i + 1}.</span>{n.name}</span>
                <span className="text-pink-600">{formatPct(n.year_pct)}</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
