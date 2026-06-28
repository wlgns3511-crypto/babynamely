import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ARCHETYPES, ARCHETYPE_LIST, getNamesByArchetype, countNamesByArchetype, type ArchetypeSlug } from '@/lib/archetype';
import { breadcrumbSchema, trajectoryDatasetSchema } from '@/lib/schema';
import { ANALYSIS_VINTAGE } from '@/lib/authorship';
import { AuthorBox } from '@/components/AuthorBox';

interface Props { params: Promise<{ archetype: string }> }

export const dynamicParams = false;
export const revalidate = 86400;

export async function generateStaticParams() {
  return ARCHETYPE_LIST.map((a) => ({ archetype: a }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { archetype } = await params;
  const meta = ARCHETYPES[archetype as ArchetypeSlug];
  if (!meta) return {};
  const total = countNamesByArchetype(meta.slug);
  const title = `${meta.label} baby names: ${total.toLocaleString()} names that fit the pattern`;
  const description = `${meta.short} ${total.toLocaleString()} names classified from the SSA 1880-2024 popularity series. Includes ${meta.example}.`;
  return {
    title,
    description,
    alternates: { canonical: `/trajectory/${meta.slug}/` },
    openGraph: { title, description, url: `/trajectory/${meta.slug}/` },
  };
}

const TONE_HEADER: Record<string, string> = {
  indigo: 'bg-indigo-50 border-indigo-300 text-indigo-900',
  amber: 'bg-amber-50 border-amber-300 text-amber-900',
  emerald: 'bg-emerald-50 border-emerald-300 text-emerald-900',
  rose: 'bg-rose-50 border-rose-300 text-rose-900',
  slate: 'bg-slate-50 border-slate-300 text-slate-900',
  sky: 'bg-sky-50 border-sky-300 text-sky-900',
  purple: 'bg-purple-50 border-purple-300 text-purple-900',
  teal: 'bg-teal-50 border-teal-300 text-teal-900',
};

export default async function TrajectoryPage({ params }: Props) {
  const { archetype } = await params;
  const meta = ARCHETYPES[archetype as ArchetypeSlug];
  if (!meta) notFound();

  const total = countNamesByArchetype(meta.slug);
  const names = getNamesByArchetype(meta.slug, 240);
  const boys = names.filter((n) => n.gender === 'boy');
  const girls = names.filter((n) => n.gender === 'girl');

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Trajectory', url: '/trajectory/' },
    { name: meta.label, url: `/trajectory/${meta.slug}/` },
  ];

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:underline">Home</a>
        {' / '}
        <a href="/trajectory/" className="hover:underline">Trajectory</a>
        {' / '}
        <span className="text-slate-800">{meta.label}</span>
      </nav>

      <header className={`rounded-xl border-2 p-6 mb-8 ${TONE_HEADER[meta.tone]}`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">{meta.emoji}</span>
          <span className="text-xs font-bold uppercase tracking-wider opacity-70">
            Trajectory archetype
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">{meta.label} baby names</h1>
        <p className="text-base leading-relaxed mb-4">{meta.long}</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <div className="opacity-70 text-xs uppercase tracking-wide">Names in this archetype</div>
            <div className="text-2xl font-bold">{total.toLocaleString()}</div>
          </div>
          <div>
            <div className="opacity-70 text-xs uppercase tracking-wide">Examples</div>
            <div className="text-base font-medium">{meta.example}</div>
          </div>
        </div>
      </header>

      <section
        data-upgrade="trajectory-interpretation"
        aria-label={`How to read the ${meta.label} archetype`}
        className="mb-8 rounded-xl border border-slate-200 bg-white p-5"
      >
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
          How to read this archetype
        </div>
        <div className="space-y-4 text-sm leading-relaxed text-slate-700">
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">What &ldquo;{meta.label}&rdquo; actually means here</h3>
            <p>
              This page lists names whose annual share-of-births curve matches the {meta.label} pattern after applying our 8-rule classifier. Curve features are derived from real SSA data ({total.toLocaleString()} names total in this archetype). The label is descriptive of the curve shape, not prescriptive of the parents who chose the name — many factors drive a name into this archetype, including media triggers, cohort taste, and migration.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">Common misreadings</h3>
            <p>
              The most common misreading is treating archetype membership as a forecast. A {meta.label}-class name today does not necessarily stay in this class next year — names migrate between archetypes as their curves evolve. The classification reflects the curve as of the {`${ANALYSIS_VINTAGE}`} vintage; check the timeline on each per-name page for the latest trajectory.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">What this view does <em>not</em> capture</h3>
            <p>
              We compute archetypes from the national SSA series only. Names with strong regional concentration may show a different curve in their primary state than nationally; the archetype here reflects the national aggregate. We also do not split spelling variants — &ldquo;Sara&rdquo; and &ldquo;Sarah&rdquo; are separate rows in our archive and may land in different archetypes.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">Practical example</h3>
            <p>
              If you arrived here researching a name candidate, the most useful follow-up is to click through to the per-name page and check (a) where the curve sits relative to peers in this archetype, and (b) the Cross-Generation Cohort Index — two names in the same archetype can have very different cohort distributions, which matters for &ldquo;sounds like grandparent vs sounds like peer&rdquo; perception.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold mb-3">How we classify the {meta.label} archetype</h2>
        <div className="prose prose-sm text-slate-700 max-w-none space-y-2">
          <p>
            We compute a yearly popularity series for every name in the SSA 1880–2024 file
            (share of US births given that name in each year). For each name we then derive
            <strong> first year, peak year, peak share, mid-century minimum, recent 5-year average,
            sustained year count</strong>, and apply 8 priority-ordered rules. Each name lands in
            exactly one archetype.
          </p>
          <p>
            <strong>{meta.label}</strong>: {meta.short}
          </p>
          <p>
            All eight archetypes:{' '}
            {ARCHETYPE_LIST.map((a, i) => (
              <span key={a}>
                {i > 0 && ' · '}
                {a === meta.slug ? (
                  <strong>{ARCHETYPES[a].label}</strong>
                ) : (
                  <a className="text-blue-700 hover:underline" href={`/trajectory/${a}/`}>
                    {ARCHETYPES[a].label}
                  </a>
                )}
              </span>
            ))}
          </p>
        </div>
      </section>

      {boys.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3 text-blue-900">Boy names ({boys.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {boys.map((n) => (
              <a
                key={n.slug}
                href={`/name/${n.slug}/`}
                className="block p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition"
              >
                <div className="font-bold text-slate-900">{n.name}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {n.peak_year ? `Peak ${n.peak_year}` : 'No peak data'}
                  {n.peak_pct ? ` · ${(n.peak_pct * 100).toFixed(2)}%` : ''}
                </div>
                {n.origin && <div className="text-xs text-slate-400 mt-0.5">{n.origin}</div>}
              </a>
            ))}
          </div>
        </section>
      )}

      {girls.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3 text-pink-900">Girl names ({girls.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {girls.map((n) => (
              <a
                key={n.slug}
                href={`/name/${n.slug}/`}
                className="block p-3 rounded-lg border border-slate-200 hover:border-pink-400 hover:bg-pink-50 transition"
              >
                <div className="font-bold text-slate-900">{n.name}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {n.peak_year ? `Peak ${n.peak_year}` : 'No peak data'}
                  {n.peak_pct ? ` · ${(n.peak_pct * 100).toFixed(2)}%` : ''}
                </div>
                {n.origin && <div className="text-xs text-slate-400 mt-0.5">{n.origin}</div>}
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8 rounded-lg bg-slate-50 border border-slate-200 p-4">
        <div className="text-sm font-semibold text-slate-700 mb-2">Browse other trajectory archetypes</div>
        <div className="flex flex-wrap gap-2">
          {ARCHETYPE_LIST.filter((a) => a !== meta.slug).map((a) => (
            <a
              key={a}
              href={`/trajectory/${a}/`}
              className="text-sm px-3 py-1.5 bg-white hover:bg-purple-50 text-purple-700 rounded-full border border-slate-200"
            >
              {ARCHETYPES[a].emoji} {ARCHETYPES[a].label}
            </a>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            ...breadcrumbSchema(breadcrumbs),
            author: { '@type': 'Organization', name: 'NameBlooms' },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            trajectoryDatasetSchema({
              archetype: meta.slug,
              archetypeLabel: meta.label,
              backedRowCount: total,
            }),
          ),
        }}
      />

      <AuthorBox source={`U.S. SSA national series (1880–2024) classified by curve-shape archetype · ${meta.label}`} />
    </div>
  );
}
