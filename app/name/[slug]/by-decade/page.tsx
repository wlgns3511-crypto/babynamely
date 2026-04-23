import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Database from "better-sqlite3";
import path from "path";
import { getNameBySlug, getPopularity, getNameRank, getNameStats } from "@/lib/db";
import { formatPct } from "@/lib/format";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { EditorNote } from "@/components/EditorNote";
import { DataSourceBadge } from "@/components/DataSourceBadge";
import { AuthorBox } from "@/components/AuthorBox";
import { AdSlot } from "@/components/AdSlot";
import { FreshnessTag } from "@/components/FreshnessTag";
import { CrossSiteLinks } from "@/components/CrossSiteLinks";
import { FeedbackButton } from "@/components/FeedbackButton";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;
export const revalidate = false;

// Cover 1880s–2000s (13 decades) — SSA data 1880–2008.
const DECADES: { start: number; label: string; era: string }[] = [
  { start: 1880, label: "1880s", era: "Gilded Age" },
  { start: 1890, label: "1890s", era: "Late Victorian" },
  { start: 1900, label: "1900s", era: "Progressive Era" },
  { start: 1910, label: "1910s", era: "WWI era" },
  { start: 1920, label: "1920s", era: "Jazz Age" },
  { start: 1930, label: "1930s", era: "Great Depression" },
  { start: 1940, label: "1940s", era: "WWII / postwar" },
  { start: 1950, label: "1950s", era: "Baby Boom" },
  { start: 1960, label: "1960s", era: "Civil Rights era" },
  { start: 1970, label: "1970s", era: "Disco / New Wave" },
  { start: 1980, label: "1980s", era: "Gen X mid" },
  { start: 1990, label: "1990s", era: "Millennial birth years" },
  { start: 2000, label: "2000s", era: "Gen Z early" },
];

// Inline DB helper — top-100 names by peak_pct DESC (canonical popularity axis).
function getTop100NameSlugs(): string[] {
  const db = new Database(path.join(process.cwd(), "data", "names.db"), {
    readonly: true,
    fileMustExist: true,
  });
  const rows = db
    .prepare(
      "SELECT slug FROM names WHERE peak_pct IS NOT NULL ORDER BY peak_pct DESC LIMIT 100"
    )
    .all() as { slug: string }[];
  db.close();
  return rows.map((r) => r.slug);
}

// Inline DB helper — peer names that peaked in the same decade (up to 6, same gender).
function getSameDecadePeers(
  peakYear: number,
  gender: string,
  excludeSlug: string,
  limit = 6
): { slug: string; name: string; peak_year: number; peak_pct: number }[] {
  const decadeStart = Math.floor(peakYear / 10) * 10;
  const db = new Database(path.join(process.cwd(), "data", "names.db"), {
    readonly: true,
    fileMustExist: true,
  });
  const rows = db
    .prepare(
      `SELECT slug, name, peak_year, peak_pct
       FROM names
       WHERE peak_year >= ? AND peak_year < ?
         AND gender = ?
         AND slug != ?
         AND peak_pct IS NOT NULL
       ORDER BY peak_pct DESC
       LIMIT ?`
    )
    .all(decadeStart, decadeStart + 10, gender, excludeSlug, limit) as {
    slug: string;
    name: string;
    peak_year: number;
    peak_pct: number;
  }[];
  db.close();
  return rows;
}

export async function generateStaticParams() {
  return getTop100NameSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const n = getNameBySlug(slug);
  if (!n) return {};
  const peakDecade = n.peak_year
    ? `${Math.floor(n.peak_year / 10) * 10}s`
    : "unknown decade";
  const title = `${n.name} Popularity by Decade — 1880s to 2000s Trajectory`;
  const description = `${n.name}&rsquo;s full decade-by-decade popularity arc: 1880s through 2000s (13 decades) using SSA data. Peak decade: ${peakDecade}${n.peak_pct ? ` at ${(n.peak_pct * 100).toFixed(2)}%` : ""}. Decade shares, peer names that peaked together, and cultural era context.`;
  return {
    title,
    description,
    alternates: { canonical: `/name/${slug}/by-decade/` },
    openGraph: { url: `/name/${slug}/by-decade/` },
  };
}

export default async function NameByDecadePage({ params }: Props) {
  const { slug } = await params;
  const n = getNameBySlug(slug);
  if (!n) notFound();

  const popularity = getPopularity(slug);
  const nameStats = getNameStats();
  const nameRank = getNameRank(slug);

  // Build per-decade summed pct + peak year within decade.
  const decadeRows = DECADES.map((d) => {
    const yearsInDecade = popularity.filter(
      (p) => p.year >= d.start && p.year < d.start + 10
    );
    const totalPct = yearsInDecade.reduce((sum, p) => sum + p.pct, 0);
    const avgPct =
      yearsInDecade.length > 0 ? totalPct / yearsInDecade.length : 0;
    const peakInDecade = yearsInDecade.reduce<{ year: number; pct: number } | null>(
      (best, p) => (!best || p.pct > best.pct ? { year: p.year, pct: p.pct } : best),
      null
    );
    return {
      ...d,
      totalPct,
      avgPct,
      peakInDecade,
      yearsCount: yearsInDecade.length,
    };
  });

  const maxTotal = decadeRows.reduce((m, r) => Math.max(m, r.totalPct), 0);
  const peakDecade = decadeRows.reduce(
    (best, r) => (r.totalPct > best.totalPct ? r : best),
    decadeRows[0]
  );
  const firstDecade = decadeRows.find((r) => r.totalPct > 0);
  const lastDecade = [...decadeRows].reverse().find((r) => r.totalPct > 0);

  // Which decades had meaningful usage (>10% of peak decade)?
  const activeDecades = decadeRows.filter(
    (r) => maxTotal > 0 && r.totalPct / maxTotal > 0.1
  );

  // Trajectory classification: rising into peak, steady, or declining
  let trajectory: "rising" | "falling" | "bell" | "new" | "vintage" = "bell";
  if (peakDecade && firstDecade && lastDecade) {
    const isNew = peakDecade.start >= 1990;
    const isVintage = peakDecade.start <= 1920;
    const isRising =
      lastDecade.start - peakDecade.start <= 10 && peakDecade.start >= 1980;
    const isFalling =
      peakDecade.start <= 1970 && lastDecade.totalPct < peakDecade.totalPct * 0.3;
    if (isNew) trajectory = "new";
    else if (isVintage) trajectory = "vintage";
    else if (isRising) trajectory = "rising";
    else if (isFalling) trajectory = "falling";
    else trajectory = "bell";
  }

  const trajectoryLabel = {
    rising: "Rising — peak is recent, name is climbing toward it.",
    falling: "Declining — peak was mid-century, name has faded since.",
    bell: "Bell curve — classic rise, peak, and fall.",
    new: "Modern — peak is in the most recent decades.",
    vintage: "Vintage — peak was in the early 1900s, prime candidate for revival.",
  }[trajectory];

  // Same-decade-peak peers (up to 6)
  const peers = n.peak_year
    ? getSameDecadePeers(n.peak_year, n.gender, slug, 6)
    : [];

  const peakYearInDecade = peakDecade?.peakInDecade;
  const firstYear = popularity[0]?.year;
  const lastYear = popularity[popularity.length - 1]?.year;

  const crumbs = [
    { name: "Home", url: "/" },
    {
      name: n.gender === "boy" ? "Boy Names" : "Girl Names",
      url: `/names/gender/${n.gender}/`,
    },
    { name: n.name, url: `/name/${slug}/` },
    { name: "By decade", url: `/name/${slug}/by-decade/` },
  ];

  const faqs = [
    {
      question: `In which decade was ${n.name} most popular?`,
      answer: `${n.name} peaked in the ${peakDecade.label} (${peakDecade.start}&ndash;${peakDecade.start + 9}) with a summed decade share of ${peakDecade.totalPct.toFixed(2)}%${peakYearInDecade ? `. The single best year within that decade was ${peakYearInDecade.year} (${formatPct(peakYearInDecade.pct)} of US ${n.gender === "boy" ? "boys" : "girls"})` : ""}. Across the full 1880&ndash;2008 SSA window, ${n.name} was actively recorded in ${activeDecades.length} decade${activeDecades.length === 1 ? "" : "s"} at more than 10% of that peak level.`,
    },
    {
      question: `What does the decade share percentage mean?`,
      answer: `Decade share is the sum of annual SSA popularity percentages across all 10 years of the decade. Each annual percentage is the fraction of US babies (${n.gender === "boy" ? "boys" : "girls"}) of that gender given the name. A decade share of 1.00% means the name averaged 0.1% per year over the decade &mdash; roughly 1 in 1,000 babies. Because many more names compete today, modern decade shares are almost always lower than mid-century ones; use trajectory (rising vs. falling), not raw shares, to read popularity.`,
    },
    {
      question: `Is ${n.name}&rsquo;s trajectory rising, falling, or steady?`,
      answer: `${trajectoryLabel} The name ${firstYear ? `first appeared in SSA records in ${firstYear}` : "has SSA data across multiple decades"} and ${lastYear ? `last appeared in ${lastYear}` : "has varied presence through recent decades"}. From peak decade (${peakDecade.label}) to the most recent available decade, the decade share ${lastDecade && peakDecade.totalPct > 0 ? `is now ${((lastDecade.totalPct / peakDecade.totalPct) * 100).toFixed(0)}% of its peak level` : "has shifted"}.`,
    },
    {
      question: `Which other ${n.gender === "boy" ? "boys' " : "girls' "}names peaked in the same decade as ${n.name}?`,
      answer: `Names that peaked in the ${peakDecade.label} alongside ${n.name}${peers.length > 0 ? ` include ${peers.slice(0, 4).map((p) => p.name).join(", ")}` : ""}. These are ${peakDecade.era.toLowerCase()}-coded names &mdash; they share generational associations (grandparents, great-grandparents, or contemporary classmates depending on the decade). Parents often use same-decade peers to check whether a name feels era-appropriate for their sibling set.`,
    },
    {
      question: `Why does ${n.name}&rsquo;s decade share drop even when the name is still in use?`,
      answer: `The SSA tracks over 100,000 distinct baby names. In 1900, the top-10 names accounted for ~40% of all boys and ~25% of all girls. By 2008, the top-10 accounted for only ~8% of boys and ~8% of girls &mdash; parents pick from a much wider pool today. So a name that now has 0.1% share may still rank in the top-100, while a 1900 name with 0.1% share might rank outside the top-1000. Rank (see parent page) is the fairer cross-decade comparison.`,
    },
    {
      question: `What is the &ldquo;100-year rule&rdquo; and does it apply to ${n.name}?`,
      answer: `Name researchers observe that names tend to revive roughly a century after peak &mdash; parents reject their own parents&rsquo; names as dated, but find great-grandparents&rsquo; names distinctive and appealing. ${peakDecade.start <= 1930 ? `${n.name}&rsquo;s ${peakDecade.label} peak places it squarely in revival territory &mdash; expect it to be a candidate for returning to popularity in the 2020s&ndash;2030s.` : peakDecade.start <= 1950 ? `${n.name}&rsquo;s ${peakDecade.label} peak is approaching revival window &mdash; mid-century names are the next wave of vintage revivals.` : `${n.name}&rsquo;s ${peakDecade.label} peak is still too recent for the 100-year rule; it reads as contemporary or grandparent-coded to today&rsquo;s parents.`}`,
    },
    {
      question: `How does ${n.name} compare to other names by peak popularity?`,
      answer: `${n.name} ranks ${nameRank ? `#${nameRank.toLocaleString()} of ${nameStats.totalNames.toLocaleString()}` : "within the tracked names"} by peak popularity across the full 1880&ndash;2008 SSA series. ${n.peak_pct && nameStats.avgPeakPct ? `Its peak share (${(n.peak_pct * 100).toFixed(2)}%) is ${(n.peak_pct / nameStats.avgPeakPct).toFixed(1)}x the average tracked name.` : ""} Peak-popularity rank is time-neutral &mdash; it captures how dominant the name was at its best moment, regardless of era.`,
    },
  ];

  return (
    <article className="mx-auto max-w-4xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(crumbs)),
        }}
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
        <Link
          href={`/names/gender/${n.gender}/`}
          className="hover:text-pink-700"
        >
          {n.gender === "boy" ? "Boy Names" : "Girl Names"}
        </Link>
        <span className="mx-2">&rsaquo;</span>
        <Link href={`/name/${slug}/`} className="hover:text-pink-700">
          {n.name}
        </Link>
        <span className="mx-2">&rsaquo;</span>
        <span className="text-slate-700">By decade</span>
      </nav>

      <header className="mb-6">
        <h1 className="mb-3 text-3xl font-bold text-slate-900">
          {n.name} Popularity by Decade
          <span
            className={`ml-3 align-middle rounded-full px-3 py-1 text-sm font-semibold ${n.gender === "boy" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"}`}
          >
            {n.gender === "boy" ? "Boy name" : "Girl name"}
          </span>
        </h1>
        <p className="text-lg text-slate-700">
          The full 13-decade arc for <strong>{n.name}</strong>: 1880s through the
          2000s from Social Security Administration records, with peer names
          that peaked in the same generation and historical-era context.
        </p>
        <div className="mt-3">
          <FreshnessTag source="SSA baby-name popularity (1880–2008)" />
        </div>
      </header>

      <EditorNote
        note={`This page shows ${n.name}&rsquo;s per-decade summed SSA share across the entire available historical series. We compute decade totals directly from annual SSA data (no estimation), and show peer names that peaked in the same decade to help parents place ${n.name} in its cultural moment.`}
      />

      {/* Peak decade spotlight */}
      <section aria-label="Peak decade spotlight" className="my-6">
        <div
          className={`rounded-xl border p-5 ${
            trajectory === "rising" || trajectory === "new"
              ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50"
              : trajectory === "falling"
                ? "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50"
                : trajectory === "vintage"
                  ? "border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50"
                  : "border-slate-200 bg-gradient-to-br from-slate-50 to-sky-50"
          }`}
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Peak decade
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {peakDecade.label}
              </div>
              <div className="text-sm text-slate-600">{peakDecade.era}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Decade share at peak
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {peakDecade.totalPct.toFixed(2)}%
              </div>
              <div className="text-sm text-slate-600">
                Summed SSA share across 10 years
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Best single year
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {peakYearInDecade?.year ?? "—"}
              </div>
              <div className="text-sm text-slate-600">
                {peakYearInDecade
                  ? `${formatPct(peakYearInDecade.pct)} of ${n.gender === "boy" ? "boys" : "girls"}`
                  : "Insufficient data"}
              </div>
            </div>
          </div>
          <div className="mt-4 border-t border-slate-200 pt-3 text-sm text-slate-700">
            <strong>Trajectory:</strong> {trajectoryLabel}
          </div>
        </div>
      </section>

      {/* Decade-by-decade bar chart */}
      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold text-slate-900">
          Decade-by-decade share
        </h2>
        <p className="mb-4 text-sm text-slate-600">
          Summed SSA percentage over each decade. A full 10-year decade where{" "}
          {n.name} averaged 1% of babies per year would total 10% here.
        </p>
        <div className="space-y-1.5">
          {decadeRows.map((d) => {
            const width = maxTotal > 0 ? (d.totalPct / maxTotal) * 100 : 0;
            const isPeak = d.start === peakDecade.start && d.totalPct > 0;
            return (
              <div key={d.start} className="flex items-center gap-2">
                <span className="w-14 text-xs text-slate-500">{d.label}</span>
                <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden relative">
                  <div
                    className={`h-full rounded transition-all ${
                      isPeak
                        ? n.gender === "boy"
                          ? "bg-blue-600"
                          : "bg-pink-600"
                        : n.gender === "boy"
                          ? "bg-blue-300"
                          : "bg-pink-300"
                    }`}
                    style={{ width: `${width}%` }}
                  />
                  {isPeak && (
                    <span className="absolute top-0.5 left-2 text-xs font-semibold text-white">
                      PEAK · {d.era}
                    </span>
                  )}
                </div>
                <span className="w-16 text-right text-xs font-mono text-slate-500">
                  {d.totalPct > 0 ? d.totalPct.toFixed(2) + "%" : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <AdSlot id="by-decade-mid" />

      {/* Detailed decade table */}
      <section className="my-8">
        <h2 className="mb-3 text-xl font-semibold text-slate-900">
          Full decade breakdown
        </h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">
                  Decade
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">
                  Era
                </th>
                <th className="px-3 py-2 text-right font-semibold text-slate-700">
                  Decade share
                </th>
                <th className="px-3 py-2 text-right font-semibold text-slate-700">
                  Avg per year
                </th>
                <th className="px-3 py-2 text-right font-semibold text-slate-700">
                  Best year
                </th>
                <th className="px-3 py-2 text-center font-semibold text-slate-700">
                  Active years
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {decadeRows.map((d) => (
                <tr
                  key={d.start}
                  className={
                    d.start === peakDecade.start && d.totalPct > 0
                      ? n.gender === "boy"
                        ? "bg-blue-50"
                        : "bg-pink-50"
                      : ""
                  }
                >
                  <td className="px-3 py-1.5 font-semibold text-slate-900">
                    {d.label}
                  </td>
                  <td className="px-3 py-1.5 text-slate-600">{d.era}</td>
                  <td className="px-3 py-1.5 text-right font-mono">
                    {d.totalPct > 0 ? d.totalPct.toFixed(2) + "%" : "—"}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono text-slate-500">
                    {d.avgPct > 0 ? (d.avgPct * 100).toFixed(3) + "%" : "—"}
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    {d.peakInDecade
                      ? `${d.peakInDecade.year} (${formatPct(d.peakInDecade.pct)})`
                      : "—"}
                  </td>
                  <td className="px-3 py-1.5 text-center text-slate-500">
                    {d.yearsCount}/10
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Historical era context */}
      <section className="my-8 rounded-xl border border-indigo-100 bg-indigo-50/40 p-6">
        <h2 className="mb-3 text-xl font-semibold text-slate-900">
          {peakDecade.label}: the {peakDecade.era}
        </h2>
        <p className="text-sm leading-relaxed text-slate-700">
          {n.name} reached its peak popularity during the {peakDecade.label},
          known historically as the {peakDecade.era}. Names that peaked during
          this era carry cultural associations tied to that generation:{" "}
          {peakDecade.start <= 1920
            ? "formal, Biblical, or Victorian-inheritance names dominated; these are now prime vintage-revival candidates."
            : peakDecade.start <= 1950
              ? "postwar optimism shaped naming tastes toward traditional Anglo-American names and classic middle-names."
              : peakDecade.start <= 1980
                ? "Baby Boomer and early Gen X parents favored contemporary American names; these now read as parent- or grandparent-coded."
                : "late-century names skew millennial/Gen Z contemporary — still current, likely to peak-plateau before a 2050s-era revival cycle."}
        </p>
        {peers.length > 0 && (
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-indigo-700 mb-2">
              Same-decade peer names
            </div>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {peers.map((p) => (
                <Link
                  key={p.slug}
                  href={`/name/${p.slug}/by-decade/`}
                  className="block rounded-lg border border-slate-200 bg-white px-3 py-2 transition hover:border-indigo-400 hover:shadow-sm"
                >
                  <div className="font-medium text-slate-900">{p.name}</div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    Peaked {p.peak_year} · {(p.peak_pct * 100).toFixed(2)}%
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* How to read this */}
      <section className="my-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="mb-3 text-xl font-semibold text-slate-900">
          How to read {n.name}&rsquo;s decade arc
        </h2>
        <dl className="space-y-3 text-sm text-slate-700">
          <div>
            <dt className="font-semibold text-slate-900">Decade share</dt>
            <dd>
              Summed annual SSA percentage over all 10 years of the decade. A
              high share means the name was dominant every year; a lower share
              suggests the name peaked mid-decade and faded quickly.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">Active years</dt>
            <dd>
              How many of the decade&rsquo;s 10 years had at least 5 SSA
              records for {n.name}. The SSA suppresses names with fewer than 5
              per year for privacy, so low active-year counts indicate a name
              barely used.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">
              Why modern decade shares look small
            </dt>
            <dd>
              US parents today choose from over 100,000 distinct names. Even
              top-10 names now capture less than 1% of babies, versus 3&ndash;5%
              in the early 1900s. Use <Link href={`/name/${slug}/`} className="text-blue-600 underline">rank</Link>{" "}
              rather than raw share for cross-decade comparison.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">
              Same-decade peers vs. similar-sounding names
            </dt>
            <dd>
              Peers on this page share a <em>temporal</em> peak window (same
              generation). The{" "}
              <Link
                href={`/name/${slug}/`}
                className="text-blue-600 underline"
              >
                main name page
              </Link>{" "}
              shows similar-sounding or same-origin names instead.
            </dd>
          </div>
        </dl>
      </section>

      {/* Parent-page back + navigation */}
      <section className="my-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href={`/name/${slug}/`}
          className={`block rounded-xl border p-5 transition hover:shadow-md ${
            n.gender === "boy"
              ? "border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 hover:border-blue-400"
              : "border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 hover:border-pink-400"
          }`}
        >
          <div
            className={`text-xs font-semibold uppercase tracking-wide ${n.gender === "boy" ? "text-blue-700" : "text-pink-700"}`}
          >
            Parent page
          </div>
          <div className="mt-1 font-semibold text-slate-900">
            {n.name}: full profile &rarr;
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Meaning, origin, popularity, similar names, naming tips, and more.
          </div>
        </Link>
        <Link
          href={`/middle-names/${slug}/`}
          className="block rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-fuchsia-50 p-5 transition hover:border-purple-400 hover:shadow-md"
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-purple-700">
            Middle names
          </div>
          <div className="mt-1 font-semibold text-slate-900">
            Middle names for {n.name} &rarr;
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Curated pairings that match {n.name}&rsquo;s rhythm and era.
          </div>
        </Link>
        <Link
          href={`/names/gender/${n.gender}/`}
          className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-400 hover:shadow-md"
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            More names
          </div>
          <div className="mt-1 font-semibold text-slate-900">
            All {n.gender === "boy" ? "boy" : "girl"} names &rarr;
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Browse the full catalog and compare.
          </div>
        </Link>
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
              open={i === 0}
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

      <FeedbackButton pageId={`by-decade-${slug}`} />

      <DataSourceBadge
        sources={[
          {
            name: "SSA baby-name popularity (1880–2008)",
            url: "https://www.ssa.gov/oact/babynames/limits.html",
          },
          {
            name: "SSA state-level rankings",
            url: "https://www.ssa.gov/oact/babynames/state/",
          },
          {
            name: "Name trend research",
            url: "https://www.behindthename.com/",
          },
        ]}
      />

      <AuthorBox />

      <CrossSiteLinks current="NameBlooms" />
    </article>
  );
}
