import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getNameBySlug, getPopularity, getTopComparisons, getSimilarNames, getNamesBySameOrigin, getRandomNames } from "@/lib/db";
import { formatPct, genderBg } from "@/lib/format";
import { AdSlot } from "@/components/AdSlot";
import { ComparisonBar } from "@/components/ComparisonBar";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";

export const dynamicParams = false;
export const revalidate = false; // 24시간 ISR 캐시

interface Props { params: Promise<{ slugs: string }> }

function parseSlugs(s: string): [string, string] | null {
  const m = s.match(/^(.+)-vs-(.+)$/);
  return m ? [m[1], m[2]] : null;
}

export async function generateStaticParams() {
  return getTopComparisons(1000).map((p) => {
    const [a, b] = [p.slugA, p.slugB].sort();
    return { slugs: `${a}-vs-${b}` };
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slugs } = await params;
  const parsed = parseSlugs(slugs);
  if (!parsed) return {};
  const a = getNameBySlug(parsed[0]), b = getNameBySlug(parsed[1]);
  if (!a || !b) return {};
  return {
    title: `${a.name} vs ${b.name} - Baby Name Comparison | Which Is Better?`,
    description: `Compare baby names ${a.name} and ${b.name} side by side. Meanings, origins, popularity trends, and which name parents prefer in 2025.`,
    alternates: { canonical: `/compare/${slugs}` },
    openGraph: { url: `/compare/${slugs}` },
  };
}

export default async function ComparePage({ params }: Props) {
  const { slugs } = await params;
  const parsed = parseSlugs(slugs);
  if (!parsed) notFound();
  const [slugA, slugB] = parsed;
  const a = getNameBySlug(slugA), b = getNameBySlug(slugB);
  if (!a || !b) notFound();

  const popA = getPopularity(slugA).filter(p => p.year % 10 === 0);
  const popB = getPopularity(slugB).filter(p => p.year % 10 === 0);

  // Get similar names for "Parents who like X also consider" section
  const similarA = getSimilarNames(slugA, a.gender, 5);
  const similarB = getSimilarNames(slugB, b.gender, 5);

  const faqs = [
    { question: `Is ${a.name} or ${b.name} more popular?`, answer: `${(a.peak_pct || 0) > (b.peak_pct || 0) ? a.name : b.name} has historically been more popular. ${a.name} peaked in ${a.peak_year || 'N/A'} while ${b.name} peaked in ${b.peak_year || 'N/A'}.` },
    { question: `What is the meaning of ${a.name}?`, answer: a.meaning ? `${a.name} means "${a.meaning}" and has ${a.origin || 'unknown'} origins.` : `The meaning of ${a.name} is not well documented in our database.` },
    { question: `What is the meaning of ${b.name}?`, answer: b.meaning ? `${b.name} means "${b.meaning}" and has ${b.origin || 'unknown'} origins.` : `The meaning of ${b.name} is not well documented in our database.` },
    { question: `Can ${a.name} and ${b.name} be used as sibling names?`, answer: `${a.name} and ${b.name} can work well as sibling names. They ${a.origin === b.origin && a.origin ? `share ${a.origin} origins` : 'come from different origins'}, giving a ${a.origin === b.origin ? 'cohesive' : 'diverse'} feel.` },
  ];

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Compare", url: "/compare" },
    { name: `${a.name} vs ${b.name}`, url: `/compare/${slugs}` },
  ];

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        {breadcrumbs.map((bc, i) => (
          <span key={i}>{i > 0 && " / "}{i < breadcrumbs.length - 1 ? <a href={bc.url} className="hover:underline">{bc.name}</a> : <span className="text-slate-800">{bc.name}</span>}</span>
        ))}
      </nav>

      <h1 className="text-3xl font-bold mb-2">{a.name} vs {b.name}</h1>
      <p className="text-slate-600 mb-6">Choosing between {a.name} and {b.name}? Compare meanings, origins, and popularity trends to find the perfect baby name.</p>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {[a, b].map((n) => (
          <div key={n.slug} className={`rounded-lg p-6 ${genderBg(n.gender)}`}>
            <a href={`/name/${n.slug}`} className="text-2xl font-bold hover:underline">{n.name}</a>
            <div className="mt-2 space-y-1 text-sm">
              <div><span className="text-slate-500">Gender:</span> {n.gender}</div>
              {n.origin && <div><span className="text-slate-500">Origin:</span> {n.origin}</div>}
              {n.meaning && <div><span className="text-slate-500">Meaning:</span> {n.meaning}</div>}
              {n.peak_year && <div><span className="text-slate-500">Peak:</span> {n.peak_year} ({formatPct(n.peak_pct!)})</div>}
            </div>
          </div>
        ))}
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">Popularity Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="text-left p-3">Year</th>
                <th className="text-right p-3">{a.name}</th>
                <th className="text-right p-3">{b.name}</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(new Set([...popA.map(p => p.year), ...popB.map(p => p.year)])).sort().map((year) => {
                const va = popA.find(p => p.year === year);
                const vb = popB.find(p => p.year === year);
                return (
                  <tr key={year} className="border-b border-slate-200">
                    <td className="p-3">{year}</td>
                    <td className={`p-3 text-right ${va && vb && va.pct > vb.pct ? 'font-bold text-purple-600' : ''}`}>{va ? formatPct(va.pct) : '-'}</td>
                    <td className={`p-3 text-right ${va && vb && vb.pct > va.pct ? 'font-bold text-purple-600' : ''}`}>{vb ? formatPct(vb.pct) : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {(a.peak_pct != null || b.peak_pct != null) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", margin: "24px 0" }}>
          <div>
            <h3 className="text-sm font-medium text-slate-600 mb-2">Peak Popularity</h3>
            <ComparisonBar
              bars={[
                ...(a.peak_pct != null ? [{ label: a.name, value: a.peak_pct }] : []),
                ...(b.peak_pct != null ? [{ label: b.name, value: b.peak_pct }] : []),
              ]}
              format={(v) => formatPct(v)}
            />
          </div>
          {(a.total_records != null || b.total_records != null) && (
            <div>
              <h3 className="text-sm font-medium text-slate-600 mb-2">Total Records</h3>
              <ComparisonBar
                bars={[
                  ...(a.total_records != null ? [{ label: a.name, value: a.total_records }] : []),
                  ...(b.total_records != null ? [{ label: b.name, value: b.total_records }] : []),
                ]}
                format={(v) => v.toLocaleString()}
              />
            </div>
          )}
        </div>
      )}

      <AdSlot id="compare-mid" />

      {(similarA.length > 0 || similarB.length > 0) && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Compare Similar Names</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {similarA.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Similar to {a.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {similarA.map(n => {
                    const [x, y] = [a.slug, n.slug].sort();
                    return (
                      <a key={n.slug} href={`/compare/${x}-vs-${y}`} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm hover:bg-purple-100">
                        {a.name} vs {n.name}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
            {similarB.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Similar to {b.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {similarB.map(n => {
                    const [x, y] = [b.slug, n.slug].sort();
                    return (
                      <a key={n.slug} href={`/compare/${x}-vs-${y}`} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100">
                        {b.name} vs {n.name}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Same origin comparisons */}
      {(() => {
        const originNames = a.origin ? getNamesBySameOrigin(a.slug, a.origin, a.gender, 4)
          .filter(n => n.slug !== b.slug) : [];
        if (originNames.length === 0) return null;
        return (
          <section className="mb-8">
            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">More {a.origin} name comparisons</h3>
            <div className="flex flex-wrap gap-2">
              {originNames.map(n => {
                const [x, y] = [a.slug, n.slug].sort();
                return (
                  <a key={n.slug} href={`/compare/${x}-vs-${y}`}
                    className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm hover:bg-purple-50">
                    {a.name} vs {n.name}
                  </a>
                );
              })}
            </div>
          </section>
        );
      })()}

      <section className="mt-8 mb-8">
        <h2 className="text-xl font-bold mb-4">FAQ</h2>
        {faqs.map((faq, i) => (
          <details key={i} className="border border-slate-200 rounded-lg mb-2" open={i === 0}>
            <summary className="p-4 cursor-pointer font-medium">{faq.question}</summary>
            <div className="px-4 pb-4 text-slate-600">{faq.answer}</div>
          </details>
        ))}
      </section>

      {/* Explore More Comparisons */}
      {(() => {
        const randomPool = getRandomNames(30);
        const pairs: { nameA: string; nameB: string; slug: string }[] = [];
        for (let i = 0; i < randomPool.length - 1 && pairs.length < 15; i++) {
          const r1 = randomPool[i];
          const r2 = randomPool[i + 1];
          if (r1.slug === r2.slug) continue;
          const [x, y] = [r1.slug, r2.slug].sort();
          const pairSlug = `${x}-vs-${y}`;
          if (pairSlug === slugs) continue;
          const [nameX, nameY] = r1.slug === x ? [r1.name, r2.name] : [r2.name, r1.name];
          pairs.push({ nameA: nameX, nameB: nameY, slug: pairSlug });
        }
        if (pairs.length === 0) return null;
        return (
          <section className="mt-8 mb-8">
            <h2 className="text-xl font-bold mb-4">Explore More Comparisons</h2>
            <div className="flex flex-wrap gap-2">
              {pairs.map((p) => (
                <a key={p.slug} href={`/compare/${p.slug}`}
                  className="text-sm px-3 py-1.5 bg-slate-100 hover:bg-purple-50 text-purple-700 rounded-full">
                  {p.nameA} vs {p.nameB}
                </a>
              ))}
            </div>
          </section>
        );
      })()}

      <footer className="mt-12 pt-8 border-t border-slate-200 text-xs text-slate-400 space-y-2">
        <p>Popular baby name comparisons: {a.name} vs {b.name}, best baby names 2025, unique baby names, {a.name} name meaning, {b.name} name meaning, baby name popularity trends, {a.origin || 'classic'} baby names, {b.origin || 'classic'} baby names</p>
        <p>Compare more names: <a href="/compare" className="underline hover:text-slate-600">Baby Name Comparison Tool</a> | <a href="/names/gender/boy" className="underline hover:text-slate-600">Popular Boy Names</a> | <a href="/names/gender/girl" className="underline hover:text-slate-600">Popular Girl Names</a></p>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
    </div>
  );
}
