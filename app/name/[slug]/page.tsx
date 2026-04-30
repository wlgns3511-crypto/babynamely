import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Database from "better-sqlite3";
import path from "path";
import { getNameBySlug, getAllNames, getPopularity, getSimilarNames, getPopularNamesByGender, getNamesBySameOrigin, getStaticComparisonHref, getStaticComparisonsForSlug, getNameStats, getNameRank, getLatestPopularity, getNamePeers } from "@/lib/db";
import { formatPct, genderColor, genderBg } from "@/lib/format";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { analyzeName } from "@/lib/name-analysis";
import { getNameFacts } from "@/lib/name-facts";
import { generateCommentary } from "@/lib/name-commentary";
import { LiveStats } from "@/components/upgrades/LiveStats";
import { generateAutoFAQs } from "@/lib/auto-faqs";
import { AdSlot } from "@/components/AdSlot";
import { DataFeedback } from "@/components/DataFeedback";
import { EmbedButton } from "@/components/EmbedButton";
import { FreshnessTag } from "@/components/FreshnessTag";
import { NamePopularityPredictor } from "@/components/NamePopularityPredictor";
import { PopularityTimeline } from "@/components/tools/PopularityTimeline";
import { AuthorBox } from "@/components/AuthorBox";
import { EditorNote } from "@/components/EditorNote";
import { DidYouKnow } from "@/components/DidYouKnow";
import { DataSourceBadge } from "@/components/DataSourceBadge";
import { CrossSiteLinks } from "@/components/CrossSiteLinks";
import { FeedbackButton } from "@/components/FeedbackButton";
import { InsightCards } from "@/components/InsightCards";
import { AnswerHero } from "@/components/upgrades/AnswerHero";
import { TrustBlock } from "@/components/upgrades/TrustBlock";
import { DecisionNext } from "@/components/upgrades/DecisionNext";
import { RelatedEntities } from '@/components/upgrades/RelatedEntities';
import { TableOfContents } from '@/components/upgrades/TableOfContents';
import { getAllGuides } from "@/lib/guides";

interface Props { params: Promise<{ slug: string }> }

// Cache top-100 by-decade name slugs once per build (Tier S HCU expansion 2026-04-21).
let _top100ByDecadeSlugs: Set<string> | null = null;
function isTop100ByDecade(slug: string): boolean {
  if (!_top100ByDecadeSlugs) {
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
    _top100ByDecadeSlugs = new Set(rows.map((r) => r.slug));
  }
  return _top100ByDecadeSlugs.has(slug);
}

const trendIcons: Record<string, string> = {
  rising: "📈", falling: "📉", stable: "➡️", classic: "👑", vintage_revival: "🔄", new: "✨",
};
const trendLabels: Record<string, string> = {
  rising: "Trending Up", falling: "Less Common Now", stable: "Steady", classic: "Timeless Classic", vintage_revival: "Vintage Revival", new: "Rare & Unique",
};

// 2026-04-24 — MUST stay `false`. Next.js 16 App Router bug: with
// `dynamicParams = true` + `notFound()` + SSG, the not-found response is
// cached as a 200 prerender (x-nextjs-prerender: 1, x-nextjs-cache: HIT),
// producing a soft-404 (HTTP 200 + "Not Found" body). Soft-404 = HCU killer.
// `false` returns proper 404 status. Tradeoff: each invalid slug logs a
// `NoFallbackError` (3 stderr lines). Mitigated by pm2-logrotate, not by
// this flag. Verified 2026-04-24 with burst tests showing 200/prerender on
// unseen slugs. DO NOT flip back without a middleware-level pre-filter.
export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllNames().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const n = getNameBySlug(slug);
  if (!n) return {};
  // RANKING pattern: lead with popularity rank (by peak_pct) vs total names.
  const stats = getNameStats();
  const rank = getNameRank(slug);
  const total = stats.totalNames;
  const genderLabel = n.gender === 'boy' ? 'boy names' : n.gender === 'girl' ? 'girl names' : 'names';
  let title: string;
  let description: string;
  if (rank && n.peak_pct) {
    const peers = getNamePeers(n.peak_pct, n.gender, slug);
    const peerBits: string[] = [];
    if (peers.above) {
      const r = getNameRank(peers.above.slug);
      if (r) peerBits.push(`${peers.above.name} (#${r})`);
    }
    if (peers.below) {
      const r = getNameRank(peers.below.slug);
      if (r) peerBits.push(`${peers.below.name} (#${r})`);
    }
    const peerStr = peerBits.length ? ` Compare with ${peerBits.join(' and ')}.` : '';
    const originBit = n.origin ? `${n.origin} origin` : '';
    const meaningBit = n.meaning ? `means "${n.meaning.slice(0, 40)}"` : '';
    const fact = [originBit, meaningBit].filter(Boolean).join(', ');
    title = `${n.name}: #${rank} of ${total} ${n.gender === 'boy' ? 'Boy' : n.gender === 'girl' ? 'Girl' : ''} Names · Peak ${n.peak_year ?? ''}`.trim();
    description = `${n.name} ranks #${rank} of ${total} ${genderLabel} by peak popularity (${(n.peak_pct * 100).toFixed(2)}% in ${n.peak_year ?? 'peak year'}). ${fact}.${peerStr} SSA data through 2023.`;
  } else {
    title = `${n.name}: Meaning, Origin & Popularity`;
    description = `${n.name} is a ${n.gender} name${n.origin ? ` of ${n.origin} origin` : ''}${n.meaning ? ` meaning "${n.meaning}"` : ''}. Popularity trends since 1880, cultural context, similar names. SSA data through 2023.`;
  }
  return {
    title,
    description,
    alternates: { canonical: `/name/${slug}/` },
    openGraph: { url: `/name/${slug}/` },
  };
}

export default async function NamePage({ params }: Props) {
  const { slug } = await params;
  const n = getNameBySlug(slug);
  if (!n) notFound();

  const popularity = getPopularity(slug);
  const similar = getSimilarNames(slug, n.gender, 12);
  const analysis = analyzeName(n.name, n.gender, n.origin, n.meaning, n.peak_year, n.peak_pct, popularity);
  // Layer 1+2 (2026-04-28 AdSense low-value-content remediation): per-page
  // unique data + fact-bound commentary. Replaces templated trend strings.
  const facts = getNameFacts(slug);
  const commentary = facts ? generateCommentary(n.name, facts) : null;

  const nameStats = getNameStats();
  const nameRank = getNameRank(slug);
  const latestPop = getLatestPopularity(slug);
  const autoFaqs = generateAutoFAQs(n, nameStats, nameRank, latestPop, similar);
  const faqs: { question: string; answer: string }[] = [
    ...(n.meaning ? [{ question: `What does ${n.name} mean?`, answer: `${n.name} means "${n.meaning}"${n.origin ? ` and comes from ${n.origin} origin` : ''}. ${analysis.culturalContext.split('.').join('.')}.` }] : []),
    ...(n.peak_year ? [{ question: `When was ${n.name} most popular?`, answer: `${n.name} was most popular in ${n.peak_year} when ${formatPct(n.peak_pct!)} of babies were given this name. ${analysis.trendDescription}` }] : []),
    { question: `Is ${n.name} a boy or girl name?`, answer: `${n.name} is primarily used as a ${n.gender} name. ${analysis.namingTips[0]}` },
    { question: `Is ${n.name} a popular name right now?`, answer: analysis.trendDescription },
    ...(n.origin ? [{ question: `What is the cultural significance of ${n.name}?`, answer: analysis.culturalContext.substring(0, 300) }] : []),
    { question: `What middle names go well with ${n.name}?`, answer: `${analysis.namingTips.find(t => t.includes("syllable")) || ""} Check our middle names page for specific suggestions that complement ${n.name}.` },
    ...autoFaqs,
  ];

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: n.gender === "boy" ? "Boy Names" : "Girl Names", url: `/names/gender/${n.gender}/` },
    { name: n.name, url: `/name/${slug}/` },
  ];

  const decades = popularity.filter(p => p.year % 10 === 0);

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        {breadcrumbs.map((b, i) => (
          <span key={i}>{i > 0 && " / "}{b.url !== `/name/${slug}/` ? <a href={b.url} className="hover:underline">{b.name}</a> : <span className="text-slate-800">{b.name}</span>}</span>
        ))}
      </nav>

      <AnswerHero
        title={n.name}
        subtitle={n.gender === 'boy' ? 'Boy name' : 'Girl name'}
        tagline={`${n.meaning ? `Means "${n.meaning}". ` : ''}${n.origin ? `${n.origin} origin. ` : ''}${n.peak_year ? `Peaked in ${n.peak_year}${n.peak_pct ? ` at ${formatPct(n.peak_pct)} of US babies` : ''}. ` : ''}${trendLabels[analysis.trendStatus]}.`}
        badges={[
          { label: n.gender === 'boy' ? 'Boy' : 'Girl', tone: n.gender === 'boy' ? 'indigo' : 'amber' },
          ...(n.origin ? [{ label: n.origin, tone: 'slate' as const }] : []),
          { label: `${analysis.syllableCount} syllable${analysis.syllableCount > 1 ? 's' : ''}`, tone: 'slate' as const },
        ]}
        alternatives={similar.slice(0, 3).map((s) => ({
          label: s.name,
          href: `/name/${s.slug}/`,
          sublabel: s.meaning || undefined,
        }))}
        alternativesLabel="Similar names"
      />

      <TrustBlock
        sources={[
          {
            name: "SSA Baby Names",
            url: "https://www.ssa.gov/oact/babynames/",
          },
          {
            name: "US Census",
            url: "https://www.census.gov/topics/population/genealogy.html",
          },
          {
            name: "Behind the Name",
            url: `https://www.behindthename.com/name/${encodeURIComponent(n.name.toLowerCase())}/`,
          },
          {
            name: "Wikipedia",
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(n.name)}_(given_name)`,
          },
        ]}
        updated="SSA data through 2024"
      />

      <EditorNote note={`${n.name} is ${n.origin ? `a name of ${n.origin} origin` : 'a name'}${n.peak_year ? ` that peaked in popularity around ${n.peak_year}` : ''}. ${n.meaning ? `Its meaning, "${n.meaning}", reflects its cultural roots.` : 'Explore its trends and cultural background below.'}`} />

      <TableOfContents />

      {/* Info card */}
      <div className={`rounded-lg p-6 mb-6 ${genderBg(n.gender)}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {n.meaning && (
            <div>
              <div className="text-sm text-slate-500">Meaning</div>
              <div className="text-lg font-semibold">{n.meaning}</div>
            </div>
          )}
          {n.origin && (
            <div>
              <div className="text-sm text-slate-500">Origin</div>
              <div className="text-lg font-semibold">{n.origin}</div>
            </div>
          )}
          {n.peak_year && (
            <div>
              <div className="text-sm text-slate-500">Peak Year</div>
              <div className="text-lg font-semibold">{n.peak_year}</div>
            </div>
          )}
          {n.peak_pct && (
            <div>
              <div className="text-sm text-slate-500">Peak Popularity</div>
              <div className="text-lg font-semibold">{formatPct(n.peak_pct)}</div>
            </div>
          )}
        </div>
      </div>

      <InsightCards name={n} />

      {/* Layer 1+2 — Live SSA snapshot with fact-bound commentary
          (2026-04-28 AdSense low-value-content remediation). */}
      {facts && commentary ? <LiveStats name={n.name} facts={facts} commentary={commentary} /> : null}

      {/* Data Insights */}
      {(() => {
        const stats = getNameStats();
        const rank = getNameRank(slug);
        const latest = getLatestPopularity(slug);
        const insights: string[] = [];

        if (n.peak_year) {
          const currentYear = new Date().getFullYear();
          const yearsSincePeak = currentYear - n.peak_year;
          let trend = 'steady';
          if (latest && n.peak_pct) {
            if (latest.pct < n.peak_pct * 0.5) trend = 'declining';
            else if (latest.pct > n.peak_pct * 0.8) trend = 'still strong';
            else trend = 'gradually declining';
          }
          insights.push(`${n.name} peaked in popularity in ${n.peak_year} (${yearsSincePeak} years ago) and has been ${trend} since then`);
        }

        if (n.peak_pct != null && stats.avgPeakPct != null) {
          const ratio = n.peak_pct / stats.avgPeakPct;
          if (ratio > 1.5) {
            insights.push(`${n.name} is ${ratio.toFixed(1)}x more common than the average baby name at its peak`);
          } else if (ratio < 0.5) {
            insights.push(`${n.name} is a relatively rare name, reaching only ${(ratio * 100).toFixed(0)}% of the average name's peak popularity`);
          } else {
            insights.push(`${n.name} has about average peak popularity compared to other tracked names`);
          }
        }

        if (rank != null && stats.totalNames > 0) {
          const percentile = ((1 - rank / stats.totalNames) * 100).toFixed(0);
          insights.push(`Ranked #${rank.toLocaleString()} out of ${stats.totalNames.toLocaleString()} names tracked (top ${percentile}% by peak popularity)`);
        }

        if (latest && popularity.length > 1) {
          const earliest = popularity[0];
          if (latest.pct > earliest.pct * 2) {
            insights.push(`Usage has grown significantly since ${earliest.year}, more than doubling in frequency`);
          } else if (latest.pct < earliest.pct * 0.3) {
            insights.push(`Usage has declined significantly since ${earliest.year}, falling to less than a third of its original frequency`);
          }
        }

        if (insights.length === 0) return null;
        return (
          <section className={`mb-8 rounded-xl p-5 border ${n.gender === 'boy' ? 'bg-blue-50 border-blue-100' : 'bg-pink-50 border-pink-100'}`}>
            <h2 className={`text-lg font-bold mb-3 ${n.gender === 'boy' ? 'text-blue-900' : 'text-pink-900'}`}>Name Insights: {n.name}</h2>
            <ul className="space-y-2">
              {insights.map((insight, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className={`mt-0.5 font-bold ${n.gender === 'boy' ? 'text-blue-500' : 'text-pink-500'}`}>&bull;</span>
                  {insight}
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-400 mt-3">Based on {stats.totalNames.toLocaleString()} names from SSA records (1880-present).</p>
          </section>
        );
      })()}

      {/* Trend Analysis */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">Popularity Trend</h2>
        <div className="bg-slate-50 border-l-4 border-slate-300 p-4 rounded-r-lg mb-4">
          <p className="text-slate-700 text-sm">{analysis.trendDescription}</p>
        </div>
        {decades.length > 0 && (
          <div className="space-y-1">
            {decades.map((d) => {
              const maxPct = Math.max(...decades.map(x => x.pct));
              const width = maxPct > 0 ? (d.pct / maxPct) * 100 : 0;
              return (
                <div key={d.year} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-12">{d.year}</span>
                  <div className="flex-1 h-5 bg-slate-100 rounded overflow-hidden">
                    <div className={`h-full rounded ${n.gender === 'boy' ? 'bg-blue-400' : 'bg-pink-400'}`} style={{ width: `${width}%` }} />
                  </div>
                  <span className="text-xs text-slate-500 w-16 text-right">{formatPct(d.pct)}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Interactive Popularity Timeline */}
      <PopularityTimeline
        name={n.name}
        gender={n.gender}
        peakYear={n.peak_year}
        peakPct={n.peak_pct}
        trend={analysis.trendStatus}
        popularity={popularity}
      />

      {/* Decade Deep Dive cross-link (top 100 names only, Tier S HCU expansion 2026-04-21) */}
      {isTop100ByDecade(slug) && (
        <section className="my-6">
          <a
            href={`/name/${slug}/by-decade/`}
            className={`block p-5 rounded-xl border hover:shadow-sm transition ${n.gender === "boy" ? "bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200 hover:border-blue-400" : "bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200 hover:border-pink-400"}`}
          >
            <div className={`text-xs uppercase tracking-wider font-semibold mb-1 ${n.gender === "boy" ? "text-blue-700" : "text-pink-700"}`}>
              Deep Dive · Popularity by Decade
            </div>
            <div className="text-base font-bold text-slate-900 mb-1">
              {n.name} full 13-decade popularity arc →
            </div>
            <div className="text-sm text-slate-700">
              1880s through 2000s decade-by-decade share, peak decade era context,
              and same-decade peer names.
            </div>
          </a>
        </section>
      )}

      {/* Cultural Context */}
      {analysis.culturalContext && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Cultural Background</h2>
          <div className="bg-purple-50 border-l-4 border-purple-300 p-4 rounded-r-lg">
            <p className="text-slate-700 text-sm">{analysis.culturalContext}</p>
          </div>
        </section>
      )}

      {/* Why this name matters — US parents context */}
      <section className="mb-8" data-upgrade="why-it-matters">
        <h2 className="text-xl font-bold mb-3">
          Why &ldquo;{n.name}&rdquo; matters to US parents
        </h2>
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-slate-700 leading-relaxed space-y-3">
          {(() => {
            const rank = getNameRank(slug);
            const stats = getNameStats();
            const latest = getLatestPopularity(slug);
            const currentYear = new Date().getFullYear();
            const peakYearsAgo = n.peak_year ? currentYear - n.peak_year : null;

            // Trend-based primary framing
            const trending = analysis.trendStatus === "rising";
            const classic = analysis.trendStatus === "classic";
            const vintage = analysis.trendStatus === "vintage_revival";
            const rareNew = analysis.trendStatus === "new";
            const falling = analysis.trendStatus === "falling";

            const primary = trending
              ? `${n.name} is on the rise with American parents right now. Names climbing the SSA charts tend to signal a name that feels fresh without being risky \u2014 your child won't be the only ${n.name} in preschool, but they also won't share it with four classmates.`
              : classic
              ? `${n.name} is a timeless American classic. Generations of US parents have chosen this name since the SSA started tracking in 1880, which means it reads as familiar and unflinching in every setting \u2014 from kindergarten roll call to a resume at 40.`
              : vintage
              ? `${n.name} is in the middle of a vintage revival. Names like this were common among grandparents and great-grandparents and are now cycling back with US millennial and Gen Z parents who want something that feels grounded and a little unexpected.`
              : rareNew
              ? `${n.name} is a rare choice in the US. If you value distinctiveness, this name is comfortably outside the top-1000 crowd \u2014 your child will likely be the only one in their grade. The trade-off is that strangers may ask how to spell or pronounce it more often.`
              : falling
              ? `${n.name} was once common in the United States and is now on the decline. For parents, this often makes the name feel mature or generation-specific \u2014 a double-edged sword. It carries real history, but it may read as belonging to an older cohort.`
              : `${n.name} has had a steady presence in the US naming landscape, neither spiking nor disappearing from the SSA record.`;

            const rankNote = rank != null && stats.totalNames > 0
              ? `Ranked #${rank.toLocaleString()} out of ${stats.totalNames.toLocaleString()} names we track, ${n.name} sits in the top ${Math.max(1, Math.round((rank / stats.totalNames) * 100))}% by peak US popularity.`
              : null;

            const peakNote = n.peak_year && peakYearsAgo != null
              ? `The SSA peak was ${n.peak_year} (${peakYearsAgo} years ago). For context, a name that peaked more than 60 years ago is likely associated with grandparents; a name peaking in the last 20 years is likely associated with classmates.`
              : null;

            const meaningNote = n.meaning && n.origin
              ? `The ${n.origin} root meaning ("${n.meaning}") is the kind of detail US parents frequently share in birth announcements and framed nursery art \u2014 it gives the name story beyond its sound.`
              : null;

            const siblingNote = `When choosing a sibling set, US parents often aim for names that match in formality level and era but avoid identical starting letters or sounds. For ${n.name}, this typically means pairing with a ${analysis.trendStatus === "classic" ? "classic" : analysis.trendStatus === "vintage_revival" ? "vintage" : "modern"} name of similar length.`;

            return (
              <>
                <p>{primary}</p>
                {rankNote && <p>{rankNote}</p>}
                {peakNote && <p>{peakNote}</p>}
                {meaningNote && <p>{meaningNote}</p>}
                <p className="text-sm text-slate-500">{siblingNote}</p>
              </>
            );
          })()}
        </div>
      </section>

      {/* Naming Tips */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">Naming Tips for {n.name}</h2>
        <div className="space-y-2">
          {analysis.namingTips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
              <span className="text-amber-500 text-sm mt-0.5">💡</span>
              <p className="text-slate-700 text-sm">{tip}</p>
            </div>
          ))}
        </div>
        {/* 2026-04-28 — removed "Find middle names" CTA. /middle-names/* is
            noindex+follow + sitemap-excluded + robots-disallowed since the
            2026-04-26 AdSense scaled-content violation. The page still exists
            for direct visitors; we just stop linking into the scaled-content
            surface from indexable pages so the AdSense crawler / reviewer
            doesn't traverse there. */}
      </section>

      <DidYouKnow fact={`In the United States, the Social Security Administration has recorded baby names since 1880. ${n.name.length <= 4 ? "Short names (4 letters or fewer) have been trending upward in recent decades." : "Longer names often carry rich etymological histories spanning multiple cultures."} There are over 100,000 unique baby names in the SSA database.`} />

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 my-6 text-sm">
        <p className="text-slate-600">
          <strong>Related:</strong> Explore more data: <a href="https://zippeek.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">ZIP code demographics</a> to find family-friendly neighborhoods.
        </p>
      </div>

      <AdSlot id="name-mid" />

      {/* Similar Names */}
      {similar.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Similar Names</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {similar.map((s) => {
              const [x, y] = [slug, s.slug].sort();
              return (
                <div key={s.slug} className="p-3 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-center">
                  <a href={`/name/${s.slug}/`} className="font-medium hover:underline">{s.name}</a>
                  {s.meaning && <div className="text-xs text-slate-400 mt-1">{s.meaning}</div>}
                  {(() => {
                    const href = getStaticComparisonHref(slug, s.slug);
                    if (!href) return null;
                    return <a href={href} className="text-xs text-purple-500 hover:underline mt-1 block">Compare →</a>;
                  })()}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Compare with popular names */}
      {(() => {
        const popular = getPopularNamesByGender(n.gender, slug, 6);
        const sameOrigin = getNamesBySameOrigin(slug, n.origin, n.gender, 4);
        return (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">Compare {n.name}</h2>
            {sameOrigin.length > 0 && (
              <>
                <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">
                  vs Other {n.origin} Names
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {sameOrigin.map((s) => {
                    const href = getStaticComparisonHref(slug, s.slug);
                    if (!href) return null;
                    return <a key={s.slug} href={href} className="text-sm px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full">vs {s.name}</a>;
                  })}
                </div>
              </>
            )}
            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">
              vs Most Popular {n.gender === 'boy' ? 'Boy' : 'Girl'} Names
            </h3>
            <div className="flex flex-wrap gap-2">
              {popular.map((s) => {
                const href = getStaticComparisonHref(slug, s.slug);
                if (!href) return null;
                return <a key={s.slug} href={href} className="text-sm px-3 py-1.5 bg-slate-100 hover:bg-purple-50 text-purple-700 rounded-full">vs {s.name}</a>;
              })}
            </div>
          </section>
        );
      })()}

      {/* Related Guides — evictionlawpeek HCU revival pattern 2026-04-24.
          4 evergreen long-form guides as canonical internal-link destinations.
          Reinforces topical authority (data-source, trends, science-of-naming)
          adjacent to the name entity — not thin or scaled. */}
      <section className="mt-10 mb-10">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Related Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {getAllGuides().slice(0, 4).map((g) => (
            <a key={g.slug} href={`/guide/${g.slug}/`}
              className="block p-4 rounded-lg border border-slate-200 bg-white hover:bg-purple-50 hover:border-purple-200 transition-colors">
              <div className="text-xs font-semibold text-purple-600 mb-1 uppercase tracking-wide">{g.category}</div>
              <div className="text-sm font-bold text-slate-900 leading-snug mb-1">{g.title}</div>
              <div className="text-xs text-slate-500 line-clamp-2">{g.description}</div>
            </a>
          ))}
        </div>
      </section>

      {/* DecisionNext — 3 opinionated next steps.
          2026-04-28: Removed middle-names card (was first slot). /middle-names/*
          is robots-disallowed for AdSense crawlers, so linking from indexable
          pages would route the reviewer into the scaled-content surface.
          Replaced with by-decade card (only for top-100 names — that's the
          subset with rich SSG'd by-decade pages) so DecisionNext still has
          3 strong cards for the most-trafficked names. */}
      <DecisionNext
        cards={[
          ...(isTop100ByDecade(slug)
            ? [
                {
                  title: `${n.name}'s 15-decade arc`,
                  blurb: `See ${n.name}'s full 1880s–2020s popularity trajectory with peer names that peaked in the same generation.`,
                  href: `/name/${slug}/by-decade/`,
                  cta: `Open decade view`,
                  tone: n.gender === 'boy' ? 'indigo' as const : 'amber' as const,
                },
              ]
            : []),
          ...((() => {
            const compareHref = similar.length > 0 ? getStaticComparisonHref(slug, similar[0].slug) : null;
            return compareHref
              ? [
                  {
                    title: `${n.name} vs ${similar[0].name}`,
                    blurb: `Compare popularity, origin, and trend side-by-side with the closest alternative.`,
                    href: compareHref,
                    cta: `Open comparison`,
                    tone: 'emerald' as const,
                  },
                ]
              : [];
          })()),
          {
            title: `More ${n.gender === 'boy' ? 'boy' : 'girl'} names`,
            blurb: `Browse other ${n.gender === 'boy' ? 'boy' : 'girl'} names in the same trend bracket and pick a shortlist.`,
            href: `/names/gender/${n.gender}/`,
            cta: `Browse ${n.gender === 'boy' ? 'boy' : 'girl'} names`,
            tone: 'indigo' as const,
          },
        ].slice(0, 3)}
      />

      <RelatedEntities
        entityName={n.name}
        heading={`Names similar to ${n.name}`}
        statLabel="Peak year"
        items={similar.slice(0, 8).map(s => ({
          name: s.name,
          href: `/name/${s.slug}/`,
          stat: s.peak_year ? `Peak ${s.peak_year}` : undefined,
        }))}
      />

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="border border-slate-200 rounded-lg" open={i === 0}>
                <summary className="p-4 cursor-pointer font-medium hover:bg-slate-50">{faq.question}</summary>
                <div className="px-4 pb-4 text-slate-600">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Discover More Name Comparisons */}
      {(() => {
        const relatedPairs = getStaticComparisonsForSlug(slug, 12);
        if (relatedPairs.length === 0) return null;
        return (
          <section className="mt-8 mb-8">
            <h2 className="text-xl font-bold mb-4">Discover More Name Comparisons</h2>
            <div className="flex flex-wrap gap-2">
              {relatedPairs.map((pair) => {
                const otherName = pair.slugA === slug ? pair.nameB : pair.nameA;
                return (
                  <a key={`${pair.slugA}-${pair.slugB}`} href={`/compare/${pair.slugA}-vs-${pair.slugB}/`}
                    className="text-sm px-3 py-1.5 bg-slate-100 hover:bg-purple-50 text-purple-700 rounded-full">
                    {n.name} vs {otherName}
                  </a>
                );
              })}
            </div>
          </section>
        );
      })()}

      <NamePopularityPredictor />

      <AuthorBox />

      <FreshnessTag source="Social Security Administration" />

          <EmbedButton url="https://nameblooms.com" title="Data from NameBlooms" site="NameBlooms" siteUrl="https://nameblooms.com" />

          {/* Related Data Resources */}
          <section className="mt-8 p-4 bg-slate-50 rounded-lg">
            <h3 className="text-sm font-semibold text-slate-500 mb-2">Related Data Resources</h3>
            <div className="flex flex-wrap gap-3 text-sm">
              <a href="https://vocabwize.com" className="text-purple-600 hover:underline">VocabWize - Word definitions &rarr;</a>
              <a href="https://degreewize.com" className="text-purple-600 hover:underline">DegreeWize - College data &rarr;</a>
            </div>
          </section>

          <DataFeedback />

          <section className="mt-8 p-6 bg-pink-50 rounded-xl border border-pink-100">
        <h3 className="text-lg font-semibold text-pink-900 mb-3">Preparing for Your Little One?</h3>
        <p className="text-pink-800 text-sm leading-relaxed">
          Shop personalized baby gifts, compare baby registry services, and find the best deals on nursery essentials.
          Planning a family budget? Check <a href="https://costbycity.com" className="underline font-medium">cost of living data</a> for your area.
        </p>
      </section>

      <FeedbackButton pageId={slug} />

      <DataSourceBadge sources={[
        { name: "SSA Baby Names", url: "https://www.ssa.gov/oact/babynames/" },
        { name: "US Census", url: "https://www.census.gov/topics/population/genealogy.html" },
        { name: "Behind the Name", url: `https://www.behindthename.com/name/${encodeURIComponent(n.name.toLowerCase())}/` },
        { name: "Wikipedia", url: `https://en.wikipedia.org/wiki/${encodeURIComponent(n.name)}_(given_name)` },
      ]} />

      <CrossSiteLinks current="NameBlooms" />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        ...breadcrumbSchema(breadcrumbs),
        author: { "@type": "Organization", name: "DataPeek" },
      }) }} />
      {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        ...faqSchema(faqs),
        author: { "@type": "Organization", name: "DataPeek" },
      }) }} />}
    </div>
  );
}
