import type { Metadata } from "next";
import Link from "next/link";
import { getStaticComparisons } from "@/lib/db";
import { getComparisonRoster } from "@/lib/roster";
import { NameRoster } from "@/components/NameRoster";

/**
 * 2026-07-26 — 허브가 자기 축의 원료를 직접 싣는다.
 *
 * 이전: 기계 생성 짝 페이지 104장(상위 500 이름의 크로스조인 상위 100 + GSC 근거 4).
 * 실측 — 라이브 200 · sitemap 0(한 번도 announce 안 됨) · Bing 노출 0 · GSC 노출 9회는
 * 전부 *이미 410 된* 쌍. 즉 색인도 수요도 없는 유령이었다.
 * 지금: 짝 페이지는 클릭이 측정된 4장만, 나머지 100장은 410. 그 100장이 보여주던 숫자
 * (peak year · peak share · total records)는 아래 로스터에 500 이름 전량으로 남는다.
 * 500개 이름 → 500×499/2 = 124,750 짝 = comparisons 테이블 행수와 정확히 일치하므로,
 * 이 표 두 개가 그 테이블 전체의 입력값이다. URL 순증 0(허브는 원래 있었다).
 */
export const metadata: Metadata = {
  title: "Compare Baby Names — The 500-Name Pool Behind Every Pairing",
  description:
    "Peak year, peak share of US births and total SSA records for all 500 names in our comparison pool — the inputs behind any of the 124,750 possible pairings, in one table.",
  alternates: { canonical: "https://nameblooms.com/compare/" },
  openGraph: {
    title: "Compare Baby Names",
    description:
      "Peak year, peak share and total SSA records for all 500 names in the comparison pool — read any pairing off one table.",
    url: "https://nameblooms.com/compare/",
  },
};

export default function ComparePage() {
  const pairs = getStaticComparisons();
  const roster = getComparisonRoster();
  const possiblePairs = (roster.total * (roster.total - 1)) / 2;

  return (
    <article className="max-w-4xl mx-auto">
      <nav className="text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-purple-700">Home</Link>
        <span className="mx-2">&rsaquo;</span>
        <span className="text-slate-700">Compare</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Compare Baby Names</h1>
        <p className="text-slate-600 leading-relaxed">
          Comparing two names comes down to three numbers each: the year the name peaked, the share
          of US births it took in that year, and how many years it has been on the SSA list at all.
          The table below carries those three numbers for every one of the{" "}
          {roster.total.toLocaleString()} names in our comparison pool, so any of the{" "}
          {possiblePairs.toLocaleString()} possible pairings can be read off one page — two rows,
          side by side.
        </p>
      </header>

      <section className="mb-8 rounded-xl border border-slate-200 bg-slate-50/60 p-5">
        <h2 className="text-base font-bold text-slate-900 mb-2">Why a table instead of pair pages</h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          We used to publish one page per pairing for the top 100 pairs. Each of those pages held
          exactly the two rows you can now read here, plus template prose. They earned no search
          impressions in any engine we measure, and they were never listed in our sitemap &mdash; a
          page that says nothing a table cannot say does not deserve its own URL. As of 26 July 2026
          those 100 generated pages return HTTP 410 (permanently gone) and their data lives in the
          roster below.
        </p>
        {pairs.length > 0 && (
          <>
            <p className="mt-3 text-sm text-slate-700 leading-relaxed">
              {pairs.length} pairings stayed as full pages, because search-console data shows real
              clicks on them &mdash; measured demand, not our guess about what is interesting:
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {pairs.map((pair) => (
                <a
                  key={`${pair.slugA}-${pair.slugB}`}
                  href={`/compare/${pair.slugA}-vs-${pair.slugB}/`}
                  className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-purple-700 hover:border-purple-300 hover:bg-purple-50"
                >
                  {pair.nameA} vs {pair.nameB}
                </a>
              ))}
            </div>
          </>
        )}
      </section>

      <section data-upgrade="compare-roster" aria-label="Every name in the comparison pool" className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-1">The full comparison pool</h2>
        <p className="text-sm text-slate-600 mb-4">
          All {roster.total.toLocaleString()} names &mdash; {roster.boys.length.toLocaleString()} boy
          and {roster.girls.length.toLocaleString()} girl entries &mdash; ordered by peak share, the
          same ordering the old pair pages were selected by. <strong>Peak year &middot; share</strong>{" "}
          is the single best year for the name and the percentage of that year&rsquo;s US births it
          took. <strong>Total births</strong> is the cumulative SSA count across all years on file.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <NameRoster
            rows={roster.boys}
            gender="boy"
            columns={["Peak year · share", "Total births"]}
            caption={`${roster.boys.length.toLocaleString()} boy names in the comparison pool`}
          />
          <NameRoster
            rows={roster.girls}
            gender="girl"
            columns={["Peak year · share", "Total births"]}
            caption={`${roster.girls.length.toLocaleString()} girl names in the comparison pool`}
          />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Each name links to its own page, where the full year-by-year timeline, peer names by
          decade, and state-level split live. Two names peaking in the same year with similar shares
          were equally common; a name with a high peak but few total births was a short spike, and
          one with a modest peak and a large total was a long steady staple.
        </p>
      </section>

      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-bold text-slate-900 mb-3">How to compare two names from this table</h2>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>
              <strong>Same era or not</strong> &mdash; peak years within about a decade of each other
              read as one style; twenty years apart and the pair sounds like two generations.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>
              <strong>Which one was bigger</strong> &mdash; compare peak share, not total births:
              totals reward names that stayed on the list for 145 years over names that were briefly
              everywhere.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>
              <strong>Spike or staple</strong> &mdash; a high peak share with a low total is a fad; a
              low peak with a high total never went away. This is the difference the pair pages used
              to spell out in a sentence.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>
              <strong>Sibling feel</strong> &mdash; origin and meaning are not in this table because
              they are not numbers; both sit at the top of each name&rsquo;s own page.
            </span>
          </li>
        </ul>
      </section>

      <section className="rounded-xl border border-purple-100 bg-purple-50/40 p-5 text-sm text-slate-700 leading-relaxed">
        <h2 className="text-base font-bold text-slate-900 mb-2">About the underlying data</h2>
        <p>
          Popularity figures come from the SSA&rsquo;s national baby-name database, which records every
          name given to at least 5 babies per gender per year since 1880. Names given to fewer are
          withheld for privacy, so no figure here is a national total of children &mdash; it is a total
          of the records the SSA publishes. We do not predict future popularity, score names by
          aesthetics, or sell placement. For the full data methodology see{" "}
          <Link href="/methodology/" className="text-purple-700 underline">
            our methodology page
          </Link>
          ; for our editorial standards see{" "}
          <Link href="/editorial-policy/" className="text-purple-700 underline">
            editorial policy
          </Link>
          .
        </p>
      </section>
    </article>
  );
}
