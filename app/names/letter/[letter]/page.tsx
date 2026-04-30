import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getNamesByLetter } from "@/lib/db";
import { getLetterInsight } from "@/lib/cluster-insights";

interface Props { params: Promise<{ letter: string }> }

export const dynamicParams = false;

export function generateStaticParams() {
  return "abcdefghijklmnopqrstuvwxyz".split("").map((l) => ({ letter: l }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { letter } = await params;
  const L = letter.toUpperCase();
  return {
    title: `Baby Names Starting With ${L}`,
    description: `Browse baby names that start with the letter ${L}. See meanings, origins, and popularity.`,
    alternates: { canonical: `/names/letter/${letter}/` },
    openGraph: { url: `/names/letter/${letter}/` },
  };
}

export default async function LetterPage({ params }: Props) {
  const { letter } = await params;
  if (!/^[a-z]$/.test(letter)) notFound();
  const names = getNamesByLetter(letter);
  const L = letter.toUpperCase();
  const insight = getLetterInsight(letter);

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:underline">Home</a> /{' '}
        <a href="/names/letter/a/" className="hover:underline">Names by Letter</a> /{' '}
        <span className="text-slate-800">{L}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">Baby Names Starting With {L}</h1>
      <p className="text-slate-600 mb-6">{names.length} names found</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {"abcdefghijklmnopqrstuvwxyz".split("").map((l) => (
          <a key={l} href={`/names/letter/${l}/`}
            className={`px-3 py-1 rounded-full text-sm border ${l === letter ? 'bg-purple-600 text-white border-purple-600' : 'border-slate-200 hover:bg-purple-50'}`}>
            {l.toUpperCase()}
          </a>
        ))}
      </div>

      {insight.narrative.length > 0 && (
        <section
          data-upgrade="letter-insight"
          aria-label={`Snapshot for letter ${L}`}
          className="my-6 rounded-xl border border-slate-200 bg-white"
        >
          <header className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Snapshot · letter {L}</h2>
            <span className="text-xs uppercase tracking-wide text-slate-500">SSA national data</span>
          </header>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
            <div className="px-5 py-3">
              <div className="text-xs text-slate-500">Total names</div>
              <div className="text-base font-bold text-slate-900 mt-1">{insight.count.toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-1">{insight.countBoy.toLocaleString()} boy · {insight.countGirl.toLocaleString()} girl</div>
            </div>
            <div className="px-5 py-3">
              <div className="text-xs text-slate-500">Top origin</div>
              <div className="text-base font-bold text-slate-900 mt-1">{insight.topOrigin?.origin ?? '—'}</div>
              {insight.topOrigin && (
                <div className="text-xs text-slate-500 mt-1">{(insight.topOrigin.share * 100).toFixed(0)}% of pool</div>
              )}
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
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">All-time top {L}-names</div>
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
          <a key={n.slug} href={`/name/${n.slug}/`} className="p-2 hover:bg-slate-50 rounded border border-slate-100">
            <span className="font-medium">{n.name}</span>
            <span className={`ml-2 text-xs ${n.gender === 'boy' ? 'text-blue-400' : 'text-pink-400'}`}>{n.gender}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
