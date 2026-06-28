import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllInsightArticles } from '@/lib/insight-articles';
import { AuthorBox } from '@/components/AuthorBox';

const SITE_URL = 'https://nameblooms.com';

export const metadata: Metadata = {
  title: 'Baby Name Insights — Data-Driven Naming Trends',
  description: 'Expert analysis of baby name trends, regional preferences, and comeback cycles. Based on SSA data tracking 6,000+ names since 1880.',
  alternates: { canonical: '/insights/' },
  openGraph: { title: 'Baby Name Insights', description: 'Data-driven baby name trend analysis from SSA data.', url: '/insights/' },
};

export default function InsightsIndex() {
  const articles = getAllInsightArticles();

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'NameBlooms Insights',
            url: `${SITE_URL}/insights/`,
            numberOfItems: articles.length,
            itemListElement: articles.map((a, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: a.title,
              url: `${SITE_URL}/insights/${a.slug}/`,
            })),
          }),
        }}
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Baby Name Insights</h1>
        <p className="text-slate-600 max-w-3xl">
          Data-driven analysis of baby naming trends in America. Each article uses
          SSA data spanning 1880 to present to reveal patterns in popularity, regional
          preferences, and generational cycles.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/insights/${a.slug}/`}
            className="block rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50 p-5 transition-colors"
          >
            <div className="text-xs text-slate-400 mb-1">
              <time dateTime={a.date}>{a.date}</time>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">{a.title}</h2>
            <p className="text-sm text-slate-600">{a.summary}</p>
          </Link>
        ))}
      </div>

      <section className="mt-12 p-6 rounded-xl bg-slate-50 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Explore the data yourself</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/search/" className="text-purple-700 hover:underline font-medium">Search names</Link>
            <span className="text-slate-500"> — meanings, origins, and popularity history</span>
          </li>
          <li>
            <Link href="/state/" className="text-purple-700 hover:underline font-medium">Names by state</Link>
            <span className="text-slate-500"> — see regional naming preferences</span>
          </li>
          <li>
            <Link href="/compare/" className="text-purple-700 hover:underline font-medium">Compare names</Link>
            <span className="text-slate-500"> — side-by-side popularity trends</span>
          </li>
        </ul>
      </section>

      <AuthorBox />
    </div>
  );
}
