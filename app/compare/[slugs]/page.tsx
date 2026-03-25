import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getNameBySlug, getPopularity, getTopComparisons } from "@/lib/db";
import { formatPct, genderBg } from "@/lib/format";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";

interface Props { params: Promise<{ slugs: string }> }

function parseSlugs(s: string): [string, string] | null {
  const m = s.match(/^(.+)-vs-(.+)$/);
  return m ? [m[1], m[2]] : null;
}

export async function generateStaticParams() {
  return getTopComparisons(500).map((p) => {
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
    title: `${a.name} vs ${b.name} - Baby Name Comparison`,
    description: `Compare baby names ${a.name} and ${b.name}. See meanings, origins, and popularity trends side by side.`,
    alternates: { canonical: `/compare/${slugs}` },
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

  const faqs = [
    { question: `Is ${a.name} or ${b.name} more popular?`, answer: `${(a.peak_pct || 0) > (b.peak_pct || 0) ? a.name : b.name} has historically been more popular. ${a.name} peaked in ${a.peak_year || 'N/A'} while ${b.name} peaked in ${b.peak_year || 'N/A'}.` },
  ];
  if (a.meaning && b.meaning) {
    faqs.push({ question: `What do ${a.name} and ${b.name} mean?`, answer: `${a.name} means "${a.meaning}" while ${b.name} means "${b.meaning}".` });
  }

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

      <h1 className="text-3xl font-bold mb-6">{a.name} vs {b.name}</h1>

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

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-4">FAQ</h2>
        {faqs.map((faq, i) => (
          <details key={i} className="border border-slate-200 rounded-lg mb-2" open={i === 0}>
            <summary className="p-4 cursor-pointer font-medium">{faq.question}</summary>
            <div className="px-4 pb-4 text-slate-600">{faq.answer}</div>
          </details>
        ))}
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
    </div>
  );
}
