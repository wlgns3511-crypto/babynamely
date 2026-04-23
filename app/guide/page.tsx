import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllGuides } from '@/lib/guides';

const SITE_URL = 'https://nameblooms.com';

export const metadata: Metadata = {
  title: 'Baby Name Guides',
  description: 'Expert guides on choosing baby names, understanding name origins, popularity trends, and naming traditions from around the world.',
  alternates: { canonical: '/guide/' },
  openGraph: { url: '/guide/' },
};

export default function GuidesIndex() {
  const guides = getAllGuides();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Baby Name Guides',
    url: `${SITE_URL}/guide/`,
    numberOfItems: guides.length,
    itemListElement: guides.map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: g.title,
      url: `${SITE_URL}/guide/${g.slug}/`,
    })),
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Baby Name Guides</h1>
        <p className="text-slate-600 max-w-3xl">
          In-depth guides to help you choose the perfect baby name. Explore naming trends,
          understand name origins and meanings, and discover timeless and unique options.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={`/guide/${g.slug}/`}
            className="block rounded-xl border border-slate-200 hover:border-pink-400 hover:bg-pink-50 p-5 transition-colors"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-pink-600 mb-1">{g.category}</div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">{g.title}</h2>
            <p className="text-sm text-slate-600">{g.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
