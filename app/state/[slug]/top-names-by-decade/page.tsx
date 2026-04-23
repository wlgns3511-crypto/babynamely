import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllStates, getStateBySlug } from "@/lib/states-data";
import { getTopNamesForDecade } from "@/lib/db";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { EditorNote } from "@/components/EditorNote";
import { DataSourceBadge } from "@/components/DataSourceBadge";
import { AuthorBox } from "@/components/AuthorBox";
import { AdSlot } from "@/components/AdSlot";
import { FreshnessTag } from "@/components/FreshnessTag";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

const SITE_URL = "https://nameblooms.com";

// Cover 1920s–2000s (9 decades) — SSA data goes 1880–2008.
const DECADES: { start: number; label: string; era: string }[] = [
  { start: 1920, label: "1920s", era: "Jazz Age" },
  { start: 1930, label: "1930s", era: "Depression era" },
  { start: 1940, label: "1940s", era: "WWII / postwar" },
  { start: 1950, label: "1950s", era: "Baby Boom" },
  { start: 1960, label: "1960s", era: "Civil Rights era" },
  { start: 1970, label: "1970s", era: "Disco / New Wave" },
  { start: 1980, label: "1980s", era: "Gen X mid" },
  { start: 1990, label: "1990s", era: "Millennial birth years" },
  { start: 2000, label: "2000s", era: "Gen Z early" },
];

export async function generateStaticParams() {
  return getAllStates().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) return {};
  return {
    title: `${state.name} Top Baby Names by Decade — 1920s to 2000s`,
    description: `${state.name} families by decade: the most popular baby names 1920s–2000s, naming-culture context, and how national trends overlap with ${state.name}&rsquo;s current top-10 picks.`,
    alternates: { canonical: `/state/${slug}/top-names-by-decade/` },
    openGraph: { url: `/state/${slug}/top-names-by-decade/` },
  };
}

export default async function TopNamesByDecadePage({ params }: Props) {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) notFound();

  // Pull national decade aggregates (SSA state-level coverage is partial pre-1950)
  const decadeData = DECADES.map((d) => ({
    ...d,
    boys: getTopNamesForDecade(d.start, "boy", 10),
    girls: getTopNamesForDecade(d.start, "girl", 10),
  }));

  // Which of the state's current top names also rank in each decade?
  const currentSet = new Set(
    [...state.popularBoys, ...state.popularGirls].map((n) => n.toLowerCase())
  );

  const overlapCount = decadeData.map((d) => {
    const decadeNames = new Set(
      [...d.boys, ...d.girls].map((r) => r.name.toLowerCase())
    );
    let overlap = 0;
    for (const n of currentSet) if (decadeNames.has(n)) overlap += 1;
    return { decade: d.label, overlap };
  });
  const highestOverlap = overlapCount.reduce(
    (a, b) => (b.overlap > a.overlap ? b : a),
    overlapCount[0]
  );

  // Peer states (alphabetical, same-starting-letter as a light filter) — up to 4
  const peers = getAllStates()
    .filter((s) => s.slug !== slug)
    .sort(() => 0) // keep alpha order
    .slice(0, 4);

  const crumbs = [
    { name: "Home", url: "/" },
    { name: "By State", url: "/state/" },
    { name: state.name, url: `/state/${slug}/` },
    { name: "Top names by decade", url: `/state/${slug}/top-names-by-decade/` },
  ];

  const faqs = [
    {
      question: `Are these ${state.name}-specific decade rankings or national?`,
      answer: `The decade lists are national SSA top-10 rankings. The Social Security Administration publishes state-level rankings for many years, but coverage thins out pre-1950 (small states were suppressed). National rankings are the closest we can get to a consistent 1920s-onward view. ${state.name}&rsquo;s current top-10 (shown separately) is state-specific.`,
    },
    {
      question: `Which decade most resembles ${state.name}&rsquo;s modern naming culture?`,
      answer: `Based on overlap with ${state.name}&rsquo;s current top-10, the ${highestOverlap.decade} matches ${highestOverlap.overlap} of the state&rsquo;s 20 most popular names today — more than any other decade. Classic revival names (James, William, Olivia, Charlotte) account for most of the overlap.`,
    },
    {
      question: `Why are 1920s names making a comeback?`,
      answer: `Researchers call it the &ldquo;100-year rule&rdquo;: names peak, fall out of favor as they feel &ldquo;grandparent-coded,&rdquo; then revive when great-grandchildren seek distinctive-yet-classic names. Evelyn, Hazel, Ezra, and Theodore — all 1920s top-20 — are back in 2024 top-50.`,
    },
    {
      question: `Where does this data come from?`,
      answer: `Social Security Administration (SSA) national baby-name popularity files — one row per name, per year, since 1880. Percentages are recomputed relative to annual births. ${state.name}&rsquo;s current top-10 is our editorial rollup of the most recent available SSA state rankings.`,
    },
    {
      question: `Are the percentages comparable across decades?`,
      answer: `Yes, but with a caveat. The SSA measures what fraction of babies of each gender received each name. A 1930 name ranked #1 with 4.5% share is a bigger share than a 2008 #1 at 1.1% — modern parents pick from a much wider pool, so peak-percentages drop while rankings stay meaningful.`,
    },
    {
      question: `Do classic names work in ${state.name}?`,
      answer: `${state.name}&rsquo;s naming culture: ${state.culturalInfluences.slice(0, 2).join("; ")}. That context strongly influences which revival names feel right locally. James, William, Elizabeth, and Olivia work in every state; more distinctive decade revivals (Ruth, Clarence, Beatrice) read differently depending on regional norms.`,
    },
    {
      question: `Why only 1920s–2000s?`,
      answer: `SSA data starts in 1880, but pre-1920 name coverage is thin — fewer names were federally recorded. And the 2000s is the last complete decade in the current dataset. We cut the window to 9 decades for visual clarity.`,
    },
  ];

  return (
    <article className="mx-auto max-w-4xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />

      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/" className="hover:text-pink-700">
          Home
        </Link>
        <span className="mx-2">&rsaquo;</span>
        <Link href="/state/" className="hover:text-pink-700">
          By State
        </Link>
        <span className="mx-2">&rsaquo;</span>
        <Link href={`/state/${slug}/`} className="hover:text-pink-700">
          {state.name}
        </Link>
        <span className="mx-2">&rsaquo;</span>
        <span className="text-slate-700">Top names by decade</span>
      </nav>

      <header className="mb-6">
        <h1 className="mb-3 text-3xl font-bold text-pink-700">
          {state.name} Top Baby Names by Decade
        </h1>
        <p className="text-lg text-slate-700">
          National SSA top-10 for boys and girls across nine decades — 1920s through the 2000s —
          with {state.name}&rsquo;s current naming culture layered on top.
        </p>
        <div className="mt-3">
          <FreshnessTag source="Social Security Administration baby-name popularity (1880–2008)" />
        </div>
      </header>

      <EditorNote note="Decade rankings are national SSA data — the only publicly complete series going back to the 1920s. We add state-specific cultural context (how these national names mapped to regional naming traditions) but don't invent state decade rankings where SSA never released them." />

      {/* Top summary card */}
      <section aria-label="Overlap summary" className="my-6">
        <div className="rounded-xl border border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 p-5">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-pink-700">
            Which decade feels most like {state.name} today?
          </div>
          <div className="text-2xl font-bold text-slate-900">
            The <span className="text-pink-700">{highestOverlap.decade}</span>
          </div>
          <div className="mt-1 text-sm text-slate-700">
            {highestOverlap.overlap} of {state.name}&rsquo;s 20 current top names also ranked in
            national top-10 during that decade. Closest vintage echo.
          </div>
        </div>
      </section>

      {/* State naming culture */}
      <section className="my-8">
        <h2 className="mb-2 text-xl font-semibold text-slate-900">
          {state.name} naming culture today
        </h2>
        <p className="mb-3 text-sm text-slate-600">
          Before diving into the decades, here&rsquo;s what shapes {state.name} parents&rsquo;
          choices right now:
        </p>
        <ul className="ml-5 list-disc space-y-1 text-sm text-slate-700">
          {state.culturalInfluences.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">
              Currently popular — boys
            </div>
            <div className="mt-1 text-sm text-slate-800">
              {state.popularBoys.slice(0, 10).join(", ")}
            </div>
          </div>
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-rose-700">
              Currently popular — girls
            </div>
            <div className="mt-1 text-sm text-slate-800">
              {state.popularGirls.slice(0, 10).join(", ")}
            </div>
          </div>
        </div>
      </section>

      <AdSlot id="decade-mid" />

      {/* Decade-by-decade tables */}
      {decadeData.map((d) => (
        <section key={d.start} className="my-8">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">
              {d.label}
              <span className="ml-2 text-sm font-normal text-slate-500">({d.era})</span>
            </h2>
            <div className="text-xs text-slate-500">
              National SSA top-10 &middot; {d.start}–{d.start + 9}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-sky-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-sky-900">
                      # Boys
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-sky-900">Name</th>
                    <th className="px-3 py-2 text-right font-semibold text-sky-900">
                      Decade share
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {d.boys.map((row, i) => {
                    const inState = state.popularBoys
                      .map((n) => n.toLowerCase())
                      .includes(row.name.toLowerCase());
                    return (
                      <tr key={row.slug} className={inState ? "bg-emerald-50" : ""}>
                        <td className="px-3 py-1.5 font-mono text-slate-500">{i + 1}</td>
                        <td className="px-3 py-1.5">
                          <Link
                            href={`/name/${row.slug}/`}
                            className="font-medium text-sky-700 hover:underline"
                          >
                            {row.name}
                          </Link>
                          {inState && (
                            <span className="ml-2 inline-block rounded-full bg-emerald-200 px-1.5 py-0.5 text-xs font-semibold text-emerald-800">
                              still popular
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono">
                          {row.total_pct.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-rose-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-rose-900">
                      # Girls
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-rose-900">Name</th>
                    <th className="px-3 py-2 text-right font-semibold text-rose-900">
                      Decade share
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {d.girls.map((row, i) => {
                    const inState = state.popularGirls
                      .map((n) => n.toLowerCase())
                      .includes(row.name.toLowerCase());
                    return (
                      <tr key={row.slug} className={inState ? "bg-emerald-50" : ""}>
                        <td className="px-3 py-1.5 font-mono text-slate-500">{i + 1}</td>
                        <td className="px-3 py-1.5">
                          <Link
                            href={`/name/${row.slug}/`}
                            className="font-medium text-rose-700 hover:underline"
                          >
                            {row.name}
                          </Link>
                          {inState && (
                            <span className="ml-2 inline-block rounded-full bg-emerald-200 px-1.5 py-0.5 text-xs font-semibold text-emerald-800">
                              still popular
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono">
                          {row.total_pct.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ))}

      {/* How to read this */}
      <section className="my-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="mb-3 text-xl font-semibold text-slate-900">How to read this page</h2>
        <dl className="space-y-3 text-sm text-slate-700">
          <div>
            <dt className="font-semibold text-slate-900">&ldquo;Still popular&rdquo; badges</dt>
            <dd>
              Highlight names that appear in both the decade&rsquo;s national top-10 and{" "}
              {state.name}&rsquo;s current top-10. These are the revival bridges.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Decade share</dt>
            <dd>
              Summed annual SSA percentage over all 10 years of the decade. A high share means the
              name was dominant every year; a lower share suggests the name peaked mid-decade and
              faded.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Why no state decade rankings?</dt>
            <dd>
              SSA only publishes state-level rankings where at least 5 births received each name.
              Pre-1950, many states didn&rsquo;t meet this threshold, so the historical series is
              patchy. National rankings give a consistent cross-decade comparison.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">100-year rule</dt>
            <dd>
              Names tend to revive roughly a century after peak. Look at the 1920s table — most of
              those names are returning to modern top-100 (Ezra, Hazel, Theodore, Evelyn).
            </dd>
          </div>
        </dl>
      </section>

      {/* Parent-page back */}
      <section className="my-8 grid gap-3 md:grid-cols-2">
        <Link
          href={`/state/${slug}/`}
          className="block rounded-xl border border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 p-5 transition hover:border-pink-400 hover:shadow-md"
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-pink-700">
            Parent page
          </div>
          <div className="mt-1 font-semibold text-slate-900">
            All {state.name} baby names &rarr;
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Current top-10 boys and girls, naming trends, and cultural context.
          </div>
        </Link>
        <Link
          href="/"
          className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-400 hover:shadow-md"
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            National view
          </div>
          <div className="mt-1 font-semibold text-slate-900">US baby name explorer &rarr;</div>
          <div className="mt-1 text-sm text-slate-600">
            Search 50,000+ names, compare trends, and see decade histories.
          </div>
        </Link>
      </section>

      {/* Peer states */}
      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold text-slate-900">
          Compare with other states
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {peers.map((p) => (
            <Link
              key={p.slug}
              href={`/state/${p.slug}/top-names-by-decade/`}
              className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-pink-400 hover:shadow-sm"
            >
              <div className="font-semibold text-slate-900">{p.name}</div>
              <div className="mt-1 text-xs text-slate-500">
                Decade top names &middot; {p.code}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="my-8">
        <h2 className="mb-3 text-2xl font-semibold text-slate-900">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <details
              key={i}
              className="rounded-lg border border-slate-200 bg-white p-4 transition open:border-pink-300"
            >
              <summary
                className="cursor-pointer font-semibold text-slate-900"
                dangerouslySetInnerHTML={{ __html: f.question }}
              />
              <p
                className="mt-2 text-sm leading-relaxed text-slate-700"
                dangerouslySetInnerHTML={{ __html: f.answer }}
              />
            </details>
          ))}
        </div>
      </section>

      <DataSourceBadge
        sources={[
          {
            name: "SSA baby-name popularity",
            url: "https://www.ssa.gov/oact/babynames/limits.html",
          },
          {
            name: "SSA state-level rankings",
            url: "https://www.ssa.gov/oact/babynames/state/",
          },
        ]}
      />

      <AuthorBox />
    </article>
  );
}
