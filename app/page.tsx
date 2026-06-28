import { getPopularNames, countNames, getAllOrigins } from "@/lib/db";
import { genderColor } from "@/lib/format";
import { AdSlot } from "@/components/AdSlot";
import { NamePopularityPredictor } from "@/components/NamePopularityPredictor";
import { PopularEntities } from "@/components/upgrades/PopularEntities";
import { TrustBlock } from "@/components/upgrades/TrustBlock";
import { AuthorBox } from "@/components/AuthorBox";
import {
  TRUST_BLOCK_SOURCES,
  ANALYSIS_VINTAGE,
  DATA_TEMPORAL_COVERAGE_START,
  DATA_TEMPORAL_COVERAGE_END,
} from "@/lib/authorship";
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "/" },
  openGraph: { url: "/" },
};


export default function Home() {
  const boyNames = getPopularNames("boy", 20);
  const girlNames = getPopularNames("girl", 20);
  const total = countNames();
  const origins = getAllOrigins();
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const coverageYears = DATA_TEMPORAL_COVERAGE_END - DATA_TEMPORAL_COVERAGE_START + 1;

  // Combine top boy + girl names for trending section
  const trendingItems = [
    ...boyNames.slice(0, 6).map((n, i) => ({
      name: n.name,
      href: `/name/${n.slug}/`,
      stat: `#${i + 1} Boy`,
    })),
    ...girlNames.slice(0, 6).map((n, i) => ({
      name: n.name,
      href: `/name/${n.slug}/`,
      stat: `#${i + 1} Girl`,
    })),
  ];

  return (
    <div>
      {/* Data-sovereignty strip — source attribution + coverage above-the-fold (AdSense gate) */}
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] uppercase tracking-widest text-slate-500">
        <span>Source · U.S. Social Security Administration (OACT) · U.S. Census</span>
        <span className="text-slate-300">|</span>
        <span>Coverage · {DATA_TEMPORAL_COVERAGE_START}–{DATA_TEMPORAL_COVERAGE_END} ({coverageYears} years)</span>
        <span className="text-slate-300">|</span>
        <a href="/methodology/" className="hover:text-purple-600 underline-offset-2 hover:underline">Methodology</a>
      </div>

      <section className="mb-6 text-center">
        <h1 className="text-4xl font-bold mb-3">Find the Perfect Baby Name</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Explore <strong className="tabular-nums">{total.toLocaleString()}</strong>+ baby names with meanings, origins, and popularity trends — drawn from the U.S. <strong>Social Security Administration</strong> baby-name registry ({DATA_TEMPORAL_COVERAGE_START}–{DATA_TEMPORAL_COVERAGE_END}) and cross-referenced against the <strong>U.S. Census Bureau</strong> first-names file.
        </p>
      </section>

      {/* Quick stats — surfaces 4 dimensions above-the-fold */}
      <section aria-label="Baby-name data coverage" className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-700 tabular-nums">{total.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">Names Tracked</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-700 tabular-nums">{coverageYears}</div>
          <div className="text-xs text-slate-500 mt-1">Years of Trends</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-700 tabular-nums">{origins.length}</div>
          <div className="text-xs text-slate-500 mt-1">Origins Covered</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-700 tabular-nums">{TRUST_BLOCK_SOURCES.length}</div>
          <div className="text-xs text-slate-500 mt-1">Upstream Sources</div>
        </div>
      </section>

      <TrustBlock
        sources={[...TRUST_BLOCK_SOURCES]}
        updated={ANALYSIS_VINTAGE}
      />

      <PopularEntities
        heading="Trending Baby Names"
        subheading="Most popular boy and girl names by peak popularity"
        items={trendingItems}
        columns={3}
        viewAllHref="/names/gender/boy/"
        viewAllLabel="Browse all names →"
      />

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-center">Browse by Letter</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {letters.map((l) => (
            <a key={l} href={`/names/letter/${l.toLowerCase()}/`}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-purple-50 hover:border-purple-300 font-semibold text-sm">
              {l}
            </a>
          ))}
        </div>
      </section>

      <AdSlot id="home-after-letters" />

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <section>
          <h2 className="text-xl font-bold mb-4 text-blue-700">Popular Boy Names</h2>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            {boyNames.map((n, i) => (
              <a key={n.slug} href={`/name/${n.slug}/`}
                className="flex justify-between items-center p-3 hover:bg-blue-50 border-b border-slate-100">
                <span className="text-sm"><span className="text-slate-400 mr-2">{i + 1}.</span>{n.name}</span>
                {n.origin && <span className="text-xs text-slate-400">{n.origin}</span>}
              </a>
            ))}
            <a href="/names/gender/boy/" className="block p-3 text-center text-blue-600 hover:underline text-sm">View all boy names</a>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-pink-700">Popular Girl Names</h2>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            {girlNames.map((n, i) => (
              <a key={n.slug} href={`/name/${n.slug}/`}
                className="flex justify-between items-center p-3 hover:bg-pink-50 border-b border-slate-100">
                <span className="text-sm"><span className="text-slate-400 mr-2">{i + 1}.</span>{n.name}</span>
                {n.origin && <span className="text-xs text-slate-400">{n.origin}</span>}
              </a>
            ))}
            <a href="/names/gender/girl/" className="block p-3 text-center text-pink-600 hover:underline text-sm">View all girl names</a>
          </div>
        </section>
      </div>

      <NamePopularityPredictor />

      {origins.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Browse by Origin</h2>
          <div className="flex flex-wrap gap-2">
            {origins.map((o) => (
              <a key={o} href={`/names/origin/${o.toLowerCase()}/`}
                className="px-3 py-1 rounded-full border border-slate-200 text-sm hover:bg-purple-50 hover:border-purple-300">
                {o}
              </a>
            ))}
          </div>
        </section>
      )}

      <AuthorBox />
    </div>
  );
}
