import type { Metadata } from "next";
import { searchNames, getPopularBoyNames, getPopularGirlNames } from "@/lib/db";

export const metadata: Metadata = {
  title: "Search Baby Names — Meanings, Origins & Popularity",
  description: "Search thousands of baby names. Find meanings, origins, and historical popularity trends for any name.",
  alternates: { canonical: "/search" },
  openGraph: { url: "/search/" },
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? searchNames(query, 40) : [];
  const popularBoy = !query ? getPopularBoyNames(10) : [];
  const popularGirl = !query ? getPopularGirlNames(10) : [];

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Search Baby Names</h1>
      <p className="text-slate-500 mb-6">Find meanings, origins, and popularity trends for any name</p>

      <form method="get" action="/search" className="mb-8">
        <div className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search names (e.g. Emma, Liam, Sophia...)"
            className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400"
            autoFocus
          />
          <button
            type="submit"
            className="px-6 py-3 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {query && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-slate-700">
            {results.length > 0
              ? `${results.length} result${results.length === 1 ? "" : "s"} for "${query}"`
              : `No results found for "${query}"`}
          </h2>
          {results.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {results.map((n) => (
                <a
                  key={n.slug}
                  href={`/name/${n.slug}`}
                  className="block p-4 border border-slate-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-all"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900">{n.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${n.gender === "boy" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
                      {n.gender === "boy" ? "Boy" : "Girl"}
                    </span>
                    {n.origin && (
                      <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">{n.origin}</span>
                    )}
                  </div>
                  {n.meaning && (
                    <p className="text-sm text-slate-500 truncate">{n.meaning}</p>
                  )}
                  {n.peak_year && (
                    <p className="text-xs text-slate-400 mt-1">Peak popularity: {n.peak_year}</p>
                  )}
                </a>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-slate-50 rounded-lg text-center text-slate-500">
              <p>Try a different spelling or browse popular names below.</p>
            </div>
          )}
        </div>
      )}

      {!query && (
        <div>
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-slate-700">Popular Boy Names</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {popularBoy.map((n) => (
                <a key={n.slug} href={`/name/${n.slug}`} className="p-3 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center gap-2">
                  <span className="font-medium text-slate-900">{n.name}</span>
                  {n.meaning && <span className="text-xs text-slate-400 truncate">{n.meaning}</span>}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3 text-slate-700">Popular Girl Names</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {popularGirl.map((n) => (
                <a key={n.slug} href={`/name/${n.slug}`} className="p-3 border border-slate-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-all flex items-center gap-2">
                  <span className="font-medium text-slate-900">{n.name}</span>
                  {n.meaning && <span className="text-xs text-slate-400 truncate">{n.meaning}</span>}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
