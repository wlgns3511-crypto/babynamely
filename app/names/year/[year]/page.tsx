import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTopNamesForYear, getAvailableYears } from "@/lib/db";
import { formatPct } from "@/lib/format";
import { itemListSchema } from "@/lib/schema";

interface Props { params: Promise<{ year: string }> }

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
    alternates: { canonical: `/names/year/${year}` },
    openGraph: { url: `/names/year/${year}` },
  };
}

export default async function YearPage({ params }: Props) {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr);
  if (isNaN(year) || year < 1880 || year > 2010) notFound();

  const topNames = getTopNamesForYear(year, 50);
  const boys = topNames.filter(n => n.gender === 'boy').slice(0, 25);
  const girls = topNames.filter(n => n.gender === 'girl').slice(0, 25);
  const years = getAvailableYears().filter(y => y % 10 === 0 || y >= 2000);

  const allNames = [...boys, ...girls].map(n => ({ name: n.name, url: `/name/${n.slug}` }));

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema(`Most Popular Baby Names in ${year}`, `/names/year/${year}`, allNames)) }} />
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:underline">Home</a> / <span className="text-slate-800">Popular Names in {year}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">Most Popular Baby Names in {year}</h1>
      <p className="text-slate-600 mb-6">Top baby names ranked by percentage of births</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {years.map((y) => (
          <a key={y} href={`/names/year/${y}`}
            className={`px-3 py-1 rounded-full text-sm border ${y === year ? 'bg-purple-600 text-white border-purple-600' : 'border-slate-200 hover:bg-purple-50'}`}>
            {y}
          </a>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-xl font-bold mb-3 text-blue-700">Top Boy Names ({year})</h2>
          <div className="border rounded-lg overflow-hidden">
            {boys.map((n, i) => (
              <a key={n.slug} href={`/name/${n.slug}`} className="flex justify-between p-3 hover:bg-blue-50 border-b border-slate-100 text-sm">
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
              <a key={n.slug} href={`/name/${n.slug}`} className="flex justify-between p-3 hover:bg-pink-50 border-b border-slate-100 text-sm">
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
