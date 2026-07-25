import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getYearInsight } from "@/lib/cluster-insights";
import { formatPct } from "@/lib/format";
import { itemListSchema, yearDatasetSchema } from "@/lib/schema";
import { AuthorBox } from "@/components/AuthorBox";
import { getYearRoster, getRosterYears } from "@/lib/roster";
import { NameRoster } from "@/components/NameRoster";
import { isIndexableNameSlug } from "@/lib/index-status";

interface Props { params: Promise<{ year: string }> }

// 2026-04-24 — MUST stay `false`. See app/name/[slug]/page.tsx for the
// Next.js 16 soft-404 bug this flag works around.
export const dynamicParams = false;

// 2026-07-26 — 145년 전량. 이전 필터는 `y % 10 === 0 || y >= 2000` 이어서 37년만
// 나왔고, 나머지 108년의 name_year_rank 행(199,928행 몫)은 어떤 페이지에도 없었다.
// scripts/build-sitemap.ts 가 같은 목록을 발행해야 한다(assertRosterCoverage 게이트).
export function generateStaticParams() {
  return getRosterYears().map((y) => ({ year: y.toString() }));
}

/**
 * keep-set 밖 이름은 /name/<slug>/ 가 410 이라 링크하지 않는다.
 * 실측(2026-07-26): 새로 발행하는 108년 중 1899 pete · 1908 sherman · 1909 kermit
 * 세 해의 biggest riser 가 keep 밖이었다 — 가드 없이 배포하면 410 링크 3개.
 */
function nameRef(ref: { name: string; slug: string } | null) {
  if (!ref) return '—';
  return isIndexableNameSlug(ref.slug)
    ? <a href={`/name/${ref.slug}/`} className="hover:underline">{ref.name}</a>
    : ref.name;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `Most Popular Baby Names in ${year}`,
    description: `Top baby names in ${year}. See the most popular boy and girl names with popularity data.`,
    alternates: { canonical: `/names/year/${year}/` },
    openGraph: { url: `/names/year/${year}/` },
  };
}

export default async function YearPage({ params }: Props) {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr);
  if (isNaN(year) || year < 1880 || year > 2024) notFound();

  // 그 해 SSA 순위 전량. 이전에는 keep-set ∩ 상위 50 만 렌더했다.
  const roster = getYearRoster(year);
  const years = getRosterYears();
  const decades = [...new Set(years.map((y) => Math.floor(y / 10) * 10))].sort((a, b) => a - b);
  const insight = getYearInsight(year);

  // ItemList 는 페이지가 있는 이름 중 성별별 상위 50 까지만 — 410 URL 을 스키마에
  // 싣지 않고, 수천 항목짜리 ItemList 도 만들지 않는다.
  const schemaNames = [...roster.boys, ...roster.girls]
    .filter((r) => isIndexableNameSlug(r.slug) && r.rank <= 50)
    .map((r) => ({ name: r.name, url: `/name/${r.slug}/` }));

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema(`Most Popular Baby Names in ${year}`, `/names/year/${year}/`, schemaNames)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(yearDatasetSchema({ year, backedRowCount: roster.total })) }} />
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:underline">Home</a> / <span className="text-slate-800">Popular Names in {year}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">Most Popular Baby Names in {year}</h1>
      <p className="text-slate-600 mb-6">
        All {roster.total.toLocaleString()} names the SSA ranked for {year}, ordered by rank within each gender.
      </p>

      {/* 145년 전량 내비 — 10년 단위로 묶는다. 이전에는 37개 칩만 있었고 나머지
          108년은 페이지 자체가 없었다. */}
      <nav aria-label="Browse another birth year" className="mb-8 space-y-1.5">
        {decades.map((d) => (
          <div key={d} className="flex flex-wrap items-center gap-1.5">
            <span className="w-14 shrink-0 text-xs font-semibold text-slate-400">{d}s</span>
            {years.filter((y) => Math.floor(y / 10) * 10 === d).map((y) => (
              <a key={y} href={`/names/year/${y}/`}
                className={`px-2 py-0.5 rounded text-xs border ${y === year ? 'bg-purple-600 text-white border-purple-600' : 'border-slate-200 hover:bg-purple-50'}`}>
                {y}
              </a>
            ))}
          </div>
        ))}
      </nav>

      {insight.narrative.length > 0 && (
        <section
          data-upgrade="year-insight"
          aria-label={`Snapshot for ${year}`}
          className="my-8 rounded-xl border border-slate-200 bg-white"
        >
          <header className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Snapshot · {year}</h2>
            <span className="text-xs uppercase tracking-wide text-slate-500">SSA national data</span>
          </header>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
            <div className="px-5 py-3">
              <div className="text-xs text-slate-500">#1 Boy</div>
              <div className="text-base font-bold text-slate-900 mt-1">{nameRef(insight.topBoy)}</div>
              {insight.topBoy && (
                <div className="text-xs text-slate-500 mt-1">{formatPct(insight.topBoy.pct)}</div>
              )}
            </div>
            <div className="px-5 py-3">
              <div className="text-xs text-slate-500">#1 Girl</div>
              <div className="text-base font-bold text-slate-900 mt-1">{nameRef(insight.topGirl)}</div>
              {insight.topGirl && (
                <div className="text-xs text-slate-500 mt-1">{formatPct(insight.topGirl.pct)}</div>
              )}
            </div>
            <div className="px-5 py-3">
              <div className="text-xs text-slate-500">Top-10 share</div>
              <div className="text-base font-bold text-slate-900 mt-1">
                B {(insight.top10ShareBoy * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-slate-500 mt-1">G {(insight.top10ShareGirl * 100).toFixed(1)}%</div>
            </div>
            <div className="px-5 py-3">
              <div className="text-xs text-slate-500">Biggest riser</div>
              <div className="text-base font-bold text-slate-900 mt-1">{nameRef(insight.biggestRiser)}</div>
              {insight.biggestRiser && (
                <div className="text-xs text-slate-500 mt-1">+{insight.biggestRiser.rankChange} vs {year - 1}</div>
              )}
            </div>
          </div>
          <div className="px-5 py-4 space-y-3 text-sm leading-relaxed text-slate-700">
            {insight.narrative.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </section>
      )}

      <section
        data-upgrade="year-explainer"
        aria-label={`How to read the ${year} list`}
        className="my-8 rounded-xl border border-slate-200 bg-white p-5"
      >
        <h2 className="text-lg font-bold text-slate-900 mb-3">How to read the {year} list</h2>
        <div className="space-y-3 text-sm leading-relaxed text-slate-700">
          <p>
            The lists below show every name the SSA ranked in {year} — {roster.boys.length.toLocaleString()} boy and {roster.girls.length.toLocaleString()} girl entries, down to the privacy cutoff, not just the headline top 50. The rank is computed from absolute count of US births given the name in that single year, not cumulative over multiple years. This means a name that ranked #1 in {year} may rank dozens of positions higher or lower in {year - 1} or {year + 1}.
          </p>
          <p>
            <strong>What the &ldquo;biggest riser&rdquo; tells you:</strong> the rank-change comparison vs {year - 1} surfaces the year&rsquo;s cultural shift — typically driven by a major media event (a Royal birth, a hit show character, a trending celebrity name). If a riser jumped 50+ ranks, suspect a single-year media trigger; if it climbed 5–15 ranks, it&rsquo;s a slower fashion shift.
          </p>
          <p>
            <strong>What the SSA file does <em>not</em> capture for {year}:</strong> names given to fewer than 5 babies are excluded (privacy threshold). For a year as old as {year < 1950 ? 'this' : 'recent ones'}, the file may be biased toward names common enough to clear the threshold — very local or community-specific names disappear. {year >= 2010 ? 'Recent years also reflect spelling fragmentation: parents pick uncommon spellings of common names, splitting the count.' : 'Earlier years show less spelling fragmentation, so name counts more closely reflect aggregate &ldquo;name family&rdquo; popularity.'}
          </p>
          <p>
            <strong>Practical use:</strong> if you arrived here researching a birth-year-specific question (e.g., &ldquo;what was popular when I was born?&rdquo;), the list above answers it accurately. If you arrived researching a name-choice question (&ldquo;will this name feel dated?&rdquo;), the per-name pages provide a much better view: each name&rsquo;s timeline, archetype, and Cross-Generation Cohort Index together show whether {year} was the name&rsquo;s peak or one slice of a longer trajectory.
          </p>
        </div>
      </section>

      {/* 전량 로스터 — 그 해 순위가 붙은 이름 전부(2024년 5,925 · 1880년 1,884).
          이전에는 상위 50개만, 그것도 keep-set 교집합만 렌더됐다. */}
      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-xl font-bold mb-1 text-blue-700">Boy Names Ranked in {year}</h2>
          <p className="text-xs text-slate-500 mb-3">
            {roster.boys.length.toLocaleString()} names · rank 1&ndash;{roster.boys.length.toLocaleString()}
          </p>
          <NameRoster
            rows={roster.boys}
            gender="boy"
            columns={['Share of births', 'Years on chart']}
            caption={`${roster.boys.length.toLocaleString()} boy names ranked by the SSA in ${year}`}
          />
        </section>
        <section>
          <h2 className="text-xl font-bold mb-1 text-pink-700">Girl Names Ranked in {year}</h2>
          <p className="text-xs text-slate-500 mb-3">
            {roster.girls.length.toLocaleString()} names · rank 1&ndash;{roster.girls.length.toLocaleString()}
          </p>
          <NameRoster
            rows={roster.girls}
            gender="girl"
            columns={['Share of births', 'Years on chart']}
            caption={`${roster.girls.length.toLocaleString()} girl names ranked by the SSA in ${year}`}
          />
        </section>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        <strong>Share of births</strong> is that name&rsquo;s percentage of all {year} births in the SSA file.
        <strong> Years on chart</strong> counts how many of the 145 published years (1880&ndash;2024) the name
        appears in at all — a one-year wonder and a 145-year staple can sit next to each other at the same rank.
        Names shown as plain text have no individual page here.
      </p>

      <AuthorBox source={`U.S. SSA national series · birth year ${year}`} />
    </div>
  );
}
