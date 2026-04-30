import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllStates, getStateBySlug } from '@/lib/states-data';
import { getStateInsight } from '@/lib/state-insights';
import { breadcrumbSchema } from '@/lib/schema';
import { StateRich } from '@/components/state/StateRich';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;
export const revalidate = 86400;

const SITE_URL = 'https://nameblooms.com';

export function generateStaticParams() {
  return getAllStates().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) return {};
  const title = `Popular Baby Names in ${state.name} — Trends & Cultural Influences`;
  const description = `Discover the most popular baby names in ${state.name}. See top boy and girl names, naming trends, and cultural influences shaping how ${state.code} parents choose names.`;
  return {
    title,
    description,
    alternates: { canonical: `/state/${slug}/` },
    openGraph: {
      title,
      description,
      url: `/state/${slug}/`,
      type: 'article',
    },
  };
}

export default async function StatePage({ params }: Props) {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) notFound();

  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'By State', url: '/state/' },
    { name: state.name, url: `/state/${slug}/` },
  ];

  const others = getAllStates().filter((s) => s.slug !== slug).slice(0, 6);
  const insight = getStateInsight(slug);
  const leanLabel: Record<NonNullable<ReturnType<typeof getStateInsight>>['vintageLean'], string> = {
    vintage_lean: 'Vintage-leaning',
    balanced: 'Balanced era mix',
    modern: 'Modern-leaning',
  };

  return (
    <article className="max-w-4xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />

      <nav className="text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-pink-700">Home</Link>
        <span className="mx-2">&rsaquo;</span>
        <Link href="/state/" className="hover:text-pink-700">By State</Link>
        <span className="mx-2">&rsaquo;</span>
        <span className="text-slate-700">{state.name}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Popular Baby Names in {state.name}</h1>
        <p className="text-slate-600">
          The most popular boy and girl baby names in {state.name} ({state.code}), along with local naming trends and the cultural influences that shape how parents in {state.name} choose names.
        </p>
      </header>

      {/* Cross-link to top-names-by-decade deep-dive (HCU Tier S expansion 2026-04-21) */}
      <Link
        href={`/state/${slug}/top-names-by-decade/`}
        className="mb-10 block rounded-xl border border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 p-5 transition hover:border-pink-400 hover:shadow-md"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 rounded-lg bg-pink-100 p-3 text-2xl" aria-hidden>📜</div>
          <div className="flex-1">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-pink-700">Historical view</div>
            <h2 className="mb-1 text-xl font-semibold text-slate-900">{state.name} top names by decade</h2>
            <p className="text-sm leading-relaxed text-slate-700">Every decade 1920s–2000s with national SSA top-10 for boys &amp; girls, plus which names still rank in {state.name}&rsquo;s current top-20.</p>
            <div className="mt-2 text-sm font-medium text-pink-700">See decades →</div>
          </div>
        </div>
      </Link>

      {insight && insight.narrative.length > 0 && (
        <section
          data-upgrade="state-insight"
          aria-label={`Snapshot for ${state.name}`}
          className="mb-10 rounded-xl border border-slate-200 bg-white"
        >
          <header className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Snapshot · {state.name}</h2>
            <span className="text-xs uppercase tracking-wide text-slate-500">
              {leanLabel[insight.vintageLean]}
            </span>
          </header>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
            <div className="px-5 py-3">
              <div className="text-xs text-slate-500">National top-10 overlap</div>
              <div className="text-base font-bold text-slate-900 mt-1">
                B {insight.topBoyOverlap}/10 · G {insight.topGirlOverlap}/10
              </div>
              <div className="text-xs text-slate-500 mt-1">vs SSA 2024 top-10</div>
            </div>
            <div className="px-5 py-3">
              <div className="text-xs text-slate-500">Distinctive picks</div>
              <div className="text-base font-bold text-slate-900 mt-1">
                {insight.distinctiveBoys.length + insight.distinctiveGirls.length}
              </div>
              <div className="text-xs text-slate-500 mt-1">outside national top-50</div>
            </div>
            <div className="px-5 py-3">
              <div className="text-xs text-slate-500">Avg peak year</div>
              <div className="text-base font-bold text-slate-900 mt-1">
                {insight.averagePeakYear ?? '—'}
              </div>
              <div className="text-xs text-slate-500 mt-1">of state top-20</div>
            </div>
            <div className="px-5 py-3">
              <div className="text-xs text-slate-500">Era profile</div>
              <div className="text-base font-bold text-slate-900 mt-1">
                {leanLabel[insight.vintageLean]}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {insight.vintageLean === 'vintage_lean'
                  ? 'pre-1990 average'
                  : insight.vintageLean === 'balanced'
                    ? '1990–2014 average'
                    : '2015+ average'}
              </div>
            </div>
          </div>
          <div className="px-5 py-4 space-y-3 text-sm leading-relaxed text-slate-700">
            {insight.narrative.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          {(insight.distinctiveBoys.length + insight.distinctiveGirls.length) > 0 && (
            <div className="border-t border-slate-100 px-5 py-3">
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                Distinctive picks · outside national top-50
              </div>
              <div className="flex flex-wrap gap-2">
                {[...insight.distinctiveBoys, ...insight.distinctiveGirls].map((r) => (
                  r.slug ? (
                    <a
                      key={`${r.name}-${r.slug}`}
                      href={`/name/${r.slug}/`}
                      className="text-xs px-2.5 py-1 rounded-full border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition"
                    >
                      <span className="font-medium text-slate-800">{r.name}</span>
                    </a>
                  ) : (
                    <span
                      key={r.name}
                      className="text-xs px-2.5 py-1 rounded-full border border-slate-200 text-slate-700"
                    >
                      {r.name}
                    </span>
                  )
                ))}
              </div>
            </div>
          )}
          {(insight.matchedBoys.some((r) => r.nationalRank !== null) || insight.matchedGirls.some((r) => r.nationalRank !== null)) && (
            <div className="border-t border-slate-100 px-5 py-3">
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                Matched against SSA 2024 national rank
              </div>
              <div className="flex flex-wrap gap-2">
                {[...insight.matchedBoys, ...insight.matchedGirls]
                  .filter((r) => r.nationalRank !== null)
                  .sort((a, b) => (a.nationalRank ?? 999) - (b.nationalRank ?? 999))
                  .slice(0, 12)
                  .map((r) => (
                    r.slug ? (
                      <a
                        key={`${r.name}-${r.slug}`}
                        href={`/name/${r.slug}/`}
                        className="text-xs px-2.5 py-1 rounded-full border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition"
                      >
                        <span className="font-medium text-slate-800">{r.name}</span>
                        <span className="text-slate-500 ml-1">#{r.nationalRank}</span>
                      </a>
                    ) : null
                  ))}
              </div>
            </div>
          )}
        </section>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <section>
          <h2 className="text-xl font-bold text-blue-700 mb-3">Top 10 Boy Names in {state.name}</h2>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            {state.popularBoys.map((name, i) => (
              <a
                key={name}
                href={`/name/${name.toLowerCase()}/`}
                className="flex items-center p-3 hover:bg-blue-50 border-b border-slate-100 last:border-b-0"
              >
                <span className="text-slate-400 w-8 text-sm">{i + 1}.</span>
                <span className="text-sm font-medium">{name}</span>
              </a>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-pink-700 mb-3">Top 10 Girl Names in {state.name}</h2>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            {state.popularGirls.map((name, i) => (
              <a
                key={name}
                href={`/name/${name.toLowerCase()}/`}
                className="flex items-center p-3 hover:bg-pink-50 border-b border-slate-100 last:border-b-0"
              >
                <span className="text-slate-400 w-8 text-sm">{i + 1}.</span>
                <span className="text-sm font-medium">{name}</span>
              </a>
            ))}
          </div>
        </section>
      </div>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Naming Trends in {state.name}</h2>
        <ul className="space-y-2">
          {state.namingTrends.map((trend, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-purple-500 shrink-0" />
              <span className="text-slate-700">{trend}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Cultural Influences on {state.name} Baby Names</h2>
        <div className="space-y-3">
          {state.culturalInfluences.map((influence, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-slate-700 text-sm">{influence}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10 rounded-xl border border-purple-100 bg-purple-50/40 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-2">About {state.name} Baby Name Data</h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          Baby name popularity in {state.name} is based on Social Security Administration (SSA) birth certificate data.
          The SSA publishes state-level name frequency data annually. Names given to fewer than 5 babies in a state
          are excluded for privacy. Rankings reflect the most recent available data and may shift year to year as
          cultural trends, migration patterns, and demographic changes influence naming choices in {state.code}.
        </p>
        <p className="text-sm text-slate-500 mt-2">
          <a href="/guide/ssa-baby-name-data/" className="text-purple-700 hover:underline">Learn more about how SSA baby name data works</a>
        </p>
      </section>

      {others.length > 0 && (
        <nav className="pt-6 border-t border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Explore Other States</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {others.map((s) => (
              <Link
                key={s.slug}
                href={`/state/${s.slug}/`}
                className="block rounded-lg border border-slate-200 hover:border-pink-400 hover:bg-pink-50 p-3 transition-colors"
              >
                <div className="text-xs text-slate-500 font-semibold mb-0.5">{s.code}</div>
                <div className="text-sm font-bold text-slate-900">{s.name}</div>
              </Link>
            ))}
          </div>
          <p className="mt-3 text-sm">
            <Link href="/state/" className="text-purple-700 hover:underline">View all states &rarr;</Link>
          </p>
        </nav>
      )}

      <StateRich slug={slug} state={state} />
    </article>
  );
}
