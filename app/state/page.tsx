import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllStates } from '@/lib/states-data';
import { itemListSchema } from '@/lib/schema';

const SITE_URL = 'https://nameblooms.com';

export const metadata: Metadata = {
  title: 'Popular Baby Names by State',
  description: 'Explore the most popular baby names in every US state. See state-specific naming trends, cultural influences, and top boy and girl names for all 50 states and DC.',
  alternates: { canonical: '/state/' },
  openGraph: { url: '/state/' },
};

export default function StatesIndex() {
  const states = getAllStates();

  const jsonLd = itemListSchema(
    'Popular Baby Names by State',
    '/state/',
    states.map((s) => ({ name: s.name, url: `/state/${s.slug}/` })),
  );

  // Group by first letter for visual organization
  const grouped = new Map<string, typeof states>();
  for (const s of states) {
    const letter = s.name[0];
    if (!grouped.has(letter)) grouped.set(letter, []);
    grouped.get(letter)!.push(s);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-pink-700">Home</Link>
        <span className="mx-2">&rsaquo;</span>
        <span className="text-slate-700">By State</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Popular Baby Names by State</h1>
        <p className="text-slate-600 max-w-3xl">
          Baby name popularity varies significantly from state to state. Cultural heritage, regional traditions,
          and demographic composition all shape which names parents choose. Explore every US state to see local
          favorites, naming trends, and cultural influences.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {Array.from(grouped.keys()).map((letter) => (
          <a key={letter} href={`#letter-${letter}`} className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-purple-50 hover:border-purple-300 text-sm font-semibold">
            {letter}
          </a>
        ))}
      </div>

      {Array.from(grouped.entries()).map(([letter, group]) => (
        <section key={letter} id={`letter-${letter}`} className="mb-6">
          <h2 className="text-lg font-bold text-purple-700 mb-2 sticky top-0 bg-white py-1">{letter}</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {group.map((s) => (
              <Link
                key={s.slug}
                href={`/state/${s.slug}/`}
                className="block rounded-xl border border-slate-200 hover:border-pink-400 hover:bg-pink-50 p-4 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-slate-900">{s.name}</span>
                  <span className="text-xs text-slate-400 font-mono">{s.code}</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">
                  Top: {s.popularBoys[0]}, {s.popularGirls[0]}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-10 rounded-xl border border-purple-100 bg-purple-50/40 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-2">About State-Level Baby Name Data</h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          State-level baby name popularity comes from the Social Security Administration (SSA), which publishes name
          frequency data by state of birth. Each state file independently applies the 5-occurrence privacy threshold,
          meaning a name must appear at least 5 times in a single state to be included. Small-population states may
          show less variety in their public data as a result.
        </p>
        <p className="text-sm text-slate-500 mt-2">
          <a href="/guide/ssa-baby-name-data/" className="text-purple-700 hover:underline">Learn more about SSA data methodology</a>
        </p>
      </section>
    </div>
  );
}
