import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getNamesByLetter } from "@/lib/db";
import { getLetterInsight } from "@/lib/cluster-insights";
import { AuthorBox } from "@/components/AuthorBox";

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

      <section
        data-upgrade="letter-explainer"
        aria-label={`How to read the letter-${L} list`}
        className="my-8 rounded-xl border border-slate-200 bg-white p-5"
      >
        <h2 className="text-lg font-bold text-slate-900 mb-3">How to read the letter-{L} list</h2>
        <div className="space-y-3 text-sm leading-relaxed text-slate-700">
          <p>
            We list every name in our SSA-derived archive that begins with {L} ({insight.count.toLocaleString()} names: {insight.countBoy.toLocaleString()} boy + {insight.countGirl.toLocaleString()} girl). Letter is a low-information slicer — it groups names by initial, not by sound, etymology, or popularity era. This is most useful for &ldquo;same-initial sibling sets&rdquo; or for parents constrained by a family-tradition initial.
          </p>
          <p>
            <strong>What the &ldquo;modal peak decade&rdquo; tells you:</strong> {insight.modalPeakDecade ? `The most common decade for letter-${L} names to peak is the ${insight.modalPeakDecade}s.` : 'No clear modal decade.'} If a single decade dominates, the letter has a generational tilt — names starting with K skew Millennial, J skews multi-gen, and so on. Use this to anticipate &ldquo;sounds-modern&rdquo; vs &ldquo;sounds-vintage&rdquo; perception when scanning the list.
          </p>
          <p>
            <strong>What this view does <em>not</em> capture:</strong> sound similarity (&ldquo;Catherine&rdquo; / &ldquo;Kate&rdquo; live under C and K), spelling variants (&ldquo;Caitlin&rdquo; / &ldquo;Kaitlyn&rdquo; / &ldquo;Caitlyn&rdquo;), and names with non-Latin scripts romanized differently. We also do not capture diminutives unless they appear in the SSA file as their own name — &ldquo;Maddie&rdquo; under M is not the same record as &ldquo;Madeline.&rdquo;
          </p>
          <p>
            <strong>Practical use:</strong> if you&rsquo;re screening for a sibling-name match, scan all-time top {L}-names first (above), then click into 5–10 candidates and check the Cross-Generation Cohort Index on each — sibling sets that share a letter and a cohort feel coherent; sharing a letter but spanning Boomer-to-Alpha cohorts feels mismatched.
          </p>
        </div>
      </section>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
        {names.map((n) => (
          <a key={n.slug} href={`/name/${n.slug}/`} className="p-2 hover:bg-slate-50 rounded border border-slate-100">
            <span className="font-medium">{n.name}</span>
            <span className={`ml-2 text-xs ${n.gender === 'boy' ? 'text-blue-400' : 'text-pink-400'}`}>{n.gender}</span>
          </a>
        ))}
      </div>

      <AuthorBox source={`U.S. SSA national series (1880–2024) · names beginning with ${L}`} />
    </div>
  );
}
