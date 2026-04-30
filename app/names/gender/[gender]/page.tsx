import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPopularNames } from "@/lib/db";
import { getGenderInsight } from "@/lib/cluster-insights";

interface Props { params: Promise<{ gender: string }> }

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ gender: "boy" }, { gender: "girl" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gender } = await params;
  const label = gender === "boy" ? "Boy" : "Girl";
  return {
    title: `${label} Baby Names - Complete List`,
    description: `Browse popular ${label.toLowerCase()} baby names with meanings and origins.`,
    alternates: { canonical: `/names/gender/${gender}/` },
    openGraph: { url: `/names/gender/${gender}/` },
  };
}

export default async function GenderPage({ params }: Props) {
  const { gender } = await params;
  if (gender !== "boy" && gender !== "girl") notFound();
  const names = getPopularNames(gender, 500);
  const label = gender === "boy" ? "Boy" : "Girl";
  const color = gender === "boy" ? "text-blue-700" : "text-pink-700";
  const insight = getGenderInsight(gender);

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:underline">Home</a> /{' '}
        <span className="text-slate-800">{label} Names</span>
      </nav>

      <h1 className={`text-3xl font-bold mb-2 ${color}`}>{label} Baby Names</h1>
      <p className="text-slate-600 mb-6">{insight.totalNames.toLocaleString()} names in the SSA record</p>

      <div className="flex flex-wrap gap-2 mb-8">
        <a href="/names/gender/boy/"
          className={`px-3 py-1 rounded-full text-sm border ${gender === 'boy' ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 hover:bg-blue-50'}`}>
          Boy names
        </a>
        <a href="/names/gender/girl/"
          className={`px-3 py-1 rounded-full text-sm border ${gender === 'girl' ? 'bg-pink-600 text-white border-pink-600' : 'border-slate-200 hover:bg-pink-50'}`}>
          Girl names
        </a>
      </div>

      {insight.narrative.length > 0 && (
        <section
          data-upgrade="gender-insight"
          aria-label={`Snapshot for ${label.toLowerCase()} names`}
          className="my-6 rounded-xl border border-slate-200 bg-white"
        >
          <header className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Snapshot · {label.toLowerCase()} names</h2>
            <span className="text-xs uppercase tracking-wide text-slate-500">SSA national 1880–2024</span>
          </header>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
            <div className="px-5 py-3">
              <div className="text-xs text-slate-500">Distinct names</div>
              <div className="text-base font-bold text-slate-900 mt-1">{insight.totalNames.toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-1">since 1880</div>
            </div>
            <div className="px-5 py-3">
              <div className="text-xs text-slate-500">2024 top-10 share</div>
              <div className="text-base font-bold text-slate-900 mt-1">{(insight.top10Share2024 * 100).toFixed(1)}%</div>
              <div className="text-xs text-slate-500 mt-1">of {label.toLowerCase()} births</div>
            </div>
            <div className="px-5 py-3">
              <div className="text-xs text-slate-500">2024 top-100 share</div>
              <div className="text-base font-bold text-slate-900 mt-1">{(insight.top100Share2024 * 100).toFixed(1)}%</div>
            </div>
            <div className="px-5 py-3">
              <div className="text-xs text-slate-500">2024 long tail</div>
              <div className="text-base font-bold text-slate-900 mt-1">{(insight.longTailShare2024 * 100).toFixed(1)}%</div>
              <div className="text-xs text-slate-500 mt-1">beyond top 100</div>
            </div>
          </div>
          <div className="px-5 py-4 space-y-3 text-sm leading-relaxed text-slate-700">
            {insight.narrative.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          {insight.decadeArc.length > 0 && (
            <div className="border-t border-slate-100 px-5 py-3">
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">#1 by decade</div>
              <div className="flex flex-wrap gap-2">
                {insight.decadeArc.map((d) => (
                  <span key={d.decade} className="text-xs px-2.5 py-1 rounded-full border border-slate-200">
                    <span className="text-slate-500">{d.decade}s</span>{' '}
                    <span className="font-medium text-slate-800">{d.topName}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
        {names.map((n) => (
          <a key={n.slug} href={`/name/${n.slug}/`} className="p-2 hover:bg-slate-50 rounded border border-slate-100">
            <span className="font-medium">{n.name}</span>
            {n.meaning && <span className="text-slate-400 ml-2 text-xs">{n.meaning}</span>}
          </a>
        ))}
      </div>
    </div>
  );
}
