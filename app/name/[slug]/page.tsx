import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getNameBySlug, getAllNames, getPopularity, getSimilarNames } from "@/lib/db";
import { formatPct, genderColor, genderBg } from "@/lib/format";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { analyzeName } from "@/lib/name-analysis";
import { DataFeedback } from "@/components/DataFeedback";

interface Props { params: Promise<{ slug: string }> }

const trendIcons: Record<string, string> = {
  rising: "📈", falling: "📉", stable: "➡️", classic: "👑", vintage_revival: "🔄", new: "✨",
};
const trendLabels: Record<string, string> = {
  rising: "Trending Up", falling: "Less Common Now", stable: "Steady", classic: "Timeless Classic", vintage_revival: "Vintage Revival", new: "Rare & Unique",
};

export async function generateStaticParams() {
  return getAllNames().slice(0, 3000).map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const n = getNameBySlug(slug);
  if (!n) return {};
  return {
    title: `${n.name} — Meaning, Origin, Popularity & Trends`,
    description: `${n.name} is a ${n.gender} name${n.origin ? ` of ${n.origin} origin` : ''}${n.meaning ? ` meaning "${n.meaning}"` : ''}. See popularity trends since 1880, cultural context, naming tips, and similar names.`,
    alternates: { canonical: `/name/${slug}` },
  };
}

export default async function NamePage({ params }: Props) {
  const { slug } = await params;
  const n = getNameBySlug(slug);
  if (!n) notFound();

  const popularity = getPopularity(slug);
  const similar = getSimilarNames(slug, n.gender, 12);
  const analysis = analyzeName(n.name, n.gender, n.origin, n.meaning, n.peak_year, n.peak_pct, popularity);

  const faqs: { question: string; answer: string }[] = [
    ...(n.meaning ? [{ question: `What does ${n.name} mean?`, answer: `${n.name} means "${n.meaning}"${n.origin ? ` and comes from ${n.origin} origin` : ''}. ${analysis.culturalContext.split('.').slice(0, 2).join('.')}.` }] : []),
    ...(n.peak_year ? [{ question: `When was ${n.name} most popular?`, answer: `${n.name} was most popular in ${n.peak_year} when ${formatPct(n.peak_pct!)} of babies were given this name. ${analysis.trendDescription}` }] : []),
    { question: `Is ${n.name} a boy or girl name?`, answer: `${n.name} is primarily used as a ${n.gender} name. ${analysis.namingTips[0]}` },
    { question: `Is ${n.name} a popular name right now?`, answer: analysis.trendDescription },
    ...(n.origin ? [{ question: `What is the cultural significance of ${n.name}?`, answer: analysis.culturalContext.substring(0, 300) }] : []),
    { question: `What middle names go well with ${n.name}?`, answer: `${analysis.namingTips.find(t => t.includes("syllable")) || ""} Check our middle names page for specific suggestions that complement ${n.name}.` },
  ];

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: n.gender === "boy" ? "Boy Names" : "Girl Names", url: `/names/gender/${n.gender}` },
    { name: n.name, url: `/name/${slug}` },
  ];

  const decades = popularity.filter(p => p.year % 10 === 0);

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        {breadcrumbs.map((b, i) => (
          <span key={i}>{i > 0 && " / "}{b.url !== `/name/${slug}` ? <a href={b.url} className="hover:underline">{b.name}</a> : <span className="text-slate-800">{b.name}</span>}</span>
        ))}
      </nav>

      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-4xl font-bold">{n.name}</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${n.gender === 'boy' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
          {n.gender === 'boy' ? 'Boy' : 'Girl'}
        </span>
        {n.origin && <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm">{n.origin}</span>}
      </div>

      {/* Trend badge */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-lg">{trendIcons[analysis.trendStatus]}</span>
        <span className="text-sm text-slate-600">{trendLabels[analysis.trendStatus]}</span>
        <span className="text-xs text-slate-400">• {analysis.syllableCount} syllable{analysis.syllableCount > 1 ? "s" : ""} • {n.name.length} letters</span>
      </div>

      {/* Info card */}
      <div className={`rounded-lg p-6 mb-6 ${genderBg(n.gender)}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {n.meaning && (
            <div>
              <div className="text-sm text-slate-500">Meaning</div>
              <div className="text-lg font-semibold">{n.meaning}</div>
            </div>
          )}
          {n.origin && (
            <div>
              <div className="text-sm text-slate-500">Origin</div>
              <div className="text-lg font-semibold">{n.origin}</div>
            </div>
          )}
          {n.peak_year && (
            <div>
              <div className="text-sm text-slate-500">Peak Year</div>
              <div className="text-lg font-semibold">{n.peak_year}</div>
            </div>
          )}
          {n.peak_pct && (
            <div>
              <div className="text-sm text-slate-500">Peak Popularity</div>
              <div className="text-lg font-semibold">{formatPct(n.peak_pct)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Trend Analysis */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">Popularity Trend</h2>
        <div className="bg-slate-50 border-l-4 border-slate-300 p-4 rounded-r-lg mb-4">
          <p className="text-slate-700 text-sm">{analysis.trendDescription}</p>
        </div>
        {decades.length > 0 && (
          <div className="space-y-1">
            {decades.map((d) => {
              const maxPct = Math.max(...decades.map(x => x.pct));
              const width = maxPct > 0 ? (d.pct / maxPct) * 100 : 0;
              return (
                <div key={d.year} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-12">{d.year}</span>
                  <div className="flex-1 h-5 bg-slate-100 rounded overflow-hidden">
                    <div className={`h-full rounded ${n.gender === 'boy' ? 'bg-blue-400' : 'bg-pink-400'}`} style={{ width: `${width}%` }} />
                  </div>
                  <span className="text-xs text-slate-500 w-16 text-right">{formatPct(d.pct)}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Cultural Context */}
      {analysis.culturalContext && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Cultural Background</h2>
          <div className="bg-purple-50 border-l-4 border-purple-300 p-4 rounded-r-lg">
            <p className="text-slate-700 text-sm">{analysis.culturalContext}</p>
          </div>
        </section>
      )}

      {/* Naming Tips */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">Naming Tips for {n.name}</h2>
        <div className="space-y-2">
          {analysis.namingTips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
              <span className="text-amber-500 text-sm mt-0.5">💡</span>
              <p className="text-slate-700 text-sm">{tip}</p>
            </div>
          ))}
        </div>
        <a href={`/middle-names/${slug}`} className="inline-block mt-3 px-4 py-2 rounded-lg border border-purple-200 text-purple-600 hover:bg-purple-50 text-sm">
          Find middle names for {n.name} →
        </a>
      </section>

      {/* Similar Names */}
      {similar.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Similar Names</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {similar.map((s) => (
              <a key={s.slug} href={`/name/${s.slug}`}
                className="p-3 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-center">
                <div className="font-medium">{s.name}</div>
                {s.meaning && <div className="text-xs text-slate-400 mt-1">{s.meaning}</div>}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="border border-slate-200 rounded-lg" open={i === 0}>
                <summary className="p-4 cursor-pointer font-medium hover:bg-slate-50">{faq.question}</summary>
                <div className="px-4 pb-4 text-slate-600">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>
      )}

      <DataFeedback />

          <section className="mt-8 p-6 bg-pink-50 rounded-xl border border-pink-100">
        <h3 className="text-lg font-semibold text-pink-900 mb-3">Preparing for Your Little One?</h3>
        <p className="text-pink-800 text-sm leading-relaxed">
          Shop personalized baby gifts, compare baby registry services, and find the best deals on nursery essentials.
          Planning a family budget? Check <a href="https://costbycity.com" className="underline font-medium">cost of living data</a> for your area.
        </p>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }} />
      {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />}
    </div>
  );
}
