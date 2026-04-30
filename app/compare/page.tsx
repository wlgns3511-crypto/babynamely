import type { Metadata } from "next";
import Link from "next/link";
import { getStaticComparisons } from "@/lib/db";

export const metadata: Metadata = {
  title: "Compare Baby Names — Side-by-Side Popularity, Origin & Trends",
  description:
    "104 curated baby-name comparisons drawn from search-traffic evidence and the SSA top-100 by peak popularity. See how each pair has shifted across decades.",
  alternates: { canonical: "https://nameblooms.com/compare/" },
  openGraph: {
    title: "Compare Baby Names",
    description:
      "104 curated baby-name comparisons drawn from search-traffic evidence and the SSA top-100 by peak popularity.",
    url: "https://nameblooms.com/compare/",
  },
};

export default function ComparePage() {
  const pairs = getStaticComparisons(48);
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
          Side-by-side comparisons covering meanings, origins, peak popularity, decade-by-decade
          trajectory, and sibling-pair workability. Every pairing is backed by Social Security
          Administration data — no fabricated trends, no ranked listicles, no editorial fluff.
        </p>
      </header>

      <section className="mb-8 rounded-xl border border-slate-200 bg-slate-50/60 p-5">
        <h2 className="text-base font-bold text-slate-900 mb-2">How these pairs were chosen</h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          We deliberately ship a small curated set rather than every possible name combination
          (~22 million theoretical pairs across 6,782 SSA names). The included pairs come from two
          sources joined as a union:
        </p>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
            <span>
              <strong>Top-100 by peak popularity</strong> — names whose all-time best year captured
              the largest share of US births. These are the comparisons people actually run when
              triangulating mainstream choices.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
            <span>
              <strong>Search-traffic evidence</strong> — pairs where Google Search Console shows
              real-world clicks, ensuring we keep the comparisons people actually look for, not
              just the ones that are statistically plausible.
            </span>
          </li>
        </ul>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          The intentionally small footprint avoids the scaled thin-content pattern that hurts both
          users (low-signal pages) and search engines (algorithmic dilution). Comparisons outside
          this curated set may still be requested but are not announced as canonical.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Curated comparisons</h2>
        <p className="text-sm text-slate-600 mb-4">
          {pairs.length} pairings shown below, sorted by combined search interest. Each links to a
          full comparison page with popularity timeline, peer names by decade, and sibling-pair
          analysis.
        </p>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          {pairs.map((pair, i) => (
            <a
              key={`${pair.slugA}-${pair.slugB}`}
              href={`/compare/${pair.slugA}-vs-${pair.slugB}/`}
              className={`p-3 border border-slate-200 rounded-lg text-purple-700 transition hover:border-purple-300 ${
                i % 2 === 0 ? "hover:bg-purple-50" : "hover:bg-blue-50"
              }`}
            >
              {pair.nameA} vs {pair.nameB}
            </a>
          ))}
        </div>
      </section>

      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-bold text-slate-900 mb-3">What you'll see on each comparison</h2>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>
              <strong>Side-by-side basics</strong> — gender, origin, meaning, peak year and peak
              share for both names.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>
              <strong>Popularity table by decade</strong> — both names' SSA share at decade
              intervals, with the leader highlighted per row.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>
              <strong>Comparison bars</strong> — peak popularity and total SSA records visualized
              for quick at-a-glance reading.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>
              <strong>Similar-name suggestions</strong> — alternative pairings drawn from the same
              gender, origin, or peak decade so you can keep exploring.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>
              <strong>Sibling-pair guidance</strong> — whether the two names share an origin
              (cohesive feel) or come from different traditions (diverse feel).
            </span>
          </li>
        </ul>
      </section>

      <section className="rounded-xl border border-purple-100 bg-purple-50/40 p-5 text-sm text-slate-700 leading-relaxed">
        <h2 className="text-base font-bold text-slate-900 mb-2">About the underlying data</h2>
        <p>
          Popularity figures come from the SSA's national baby-name database, which records every
          name given to at least 5 babies per gender per year since 1880. We do not predict future
          popularity, score names by aesthetics, or sell comparison placement. For the full data
          methodology see{" "}
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
