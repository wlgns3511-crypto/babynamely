import type { Metadata } from 'next';
import { ARCHETYPES, ARCHETYPE_LIST, countNamesByArchetype } from '@/lib/archetype';
import { breadcrumbSchema } from '@/lib/schema';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Baby name trajectory archetypes — 8 patterns from the SSA 1880-2024 file',
  description:
    'Every name in the Social Security Administration baby-names file follows one of eight popularity trajectories: Modern Phenomenon, Vintage Revival, Timeless Classic, Quick Burst, Steady Climber, Ancient Decline, Fading, or Steady. We classify all 7,767 tracked names from their year-by-year share.',
  alternates: { canonical: '/trajectory/' },
  openGraph: { url: '/trajectory/' },
};

const TONE_BG: Record<string, string> = {
  indigo: 'bg-indigo-50 border-indigo-200',
  amber: 'bg-amber-50 border-amber-200',
  emerald: 'bg-emerald-50 border-emerald-200',
  rose: 'bg-rose-50 border-rose-200',
  slate: 'bg-slate-50 border-slate-300',
  sky: 'bg-sky-50 border-sky-200',
  purple: 'bg-purple-50 border-purple-200',
  teal: 'bg-teal-50 border-teal-200',
};

export default async function TrajectoryIndex() {
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Trajectory', url: '/trajectory/' },
  ];
  const counts: Record<string, number> = {};
  for (const a of ARCHETYPE_LIST) counts[a] = countNamesByArchetype(a);
  const total = Object.values(counts).reduce((s, c) => s + c, 0);

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:underline">Home</a>
        {' / '}
        <span className="text-slate-800">Trajectory</span>
      </nav>

      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">
          Baby name trajectory archetypes
        </h1>
        <p className="text-base text-slate-700 leading-relaxed mb-2">
          Every name in the SSA file (1880–2024) carves a unique popularity arc. We took all{' '}
          <strong>{total.toLocaleString()} tracked names</strong> and classified each into one of
          eight archetypes by deriving year-of-first-appearance, year-of-peak, peak share, mid-century
          minimum, recent 5-year average, and sustained-year count.
        </p>
        <p className="text-sm text-slate-500">
          Pure derivation from the popularity series — no clustering, no synthetic labels. Same name
          always lands in the same archetype.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {ARCHETYPE_LIST.map((a) => {
          const meta = ARCHETYPES[a];
          return (
            <a
              key={a}
              href={`/trajectory/${a}/`}
              className={`block rounded-xl border-2 p-5 hover:shadow transition ${TONE_BG[meta.tone]}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl" aria-hidden="true">{meta.emoji}</span>
                <div>
                  <div className="text-xs uppercase tracking-wider font-semibold opacity-70">
                    {counts[a].toLocaleString()} names
                  </div>
                  <div className="text-lg font-bold">{meta.label}</div>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-2">{meta.short}</p>
              <div className="text-xs opacity-70">Examples: {meta.example}</div>
            </a>
          );
        })}
      </div>

      <section className="rounded-lg bg-slate-50 border border-slate-200 p-5">
        <h2 className="text-lg font-bold mb-2">How we built the eight archetypes</h2>
        <ol className="text-sm text-slate-700 space-y-2 list-decimal list-inside">
          <li>For each name, build the time series of yearly share (count / total births of that gender that year).</li>
          <li>Derive: first year, peak year, peak share, last-year share, recent 5-year average (2020–2024), early 5-year average, mid-century minimum (1950–1990), sustained-year count (years with ≥0.1% share).</li>
          <li>Apply rules in priority order — first match wins. Modern → Vintage → Classic → Burst → Climber → Ancient → Fading → Steady (catch-all).</li>
          <li>The result is a stable, reproducible label that names a real pattern — not a clustering output.</li>
        </ol>
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
    </div>
  );
}
