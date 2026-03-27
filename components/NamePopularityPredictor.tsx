"use client";

import { useState } from "react";

interface PredictResult {
  found: boolean;
  name: string;
  gender?: string;
  origin?: string | null;
  meaning?: string | null;
  peakYear?: number | null;
  peakPct?: number | null;
  currentPct?: number | null;
  currentYear?: number | null;
  trend?: "rising" | "falling" | "steady";
  trendPct?: number;
  message?: string;
  similar: { name: string; slug: string; meaning: string | null }[];
}

const trendConfig = {
  rising: { icon: "\u{1F4C8}", label: "Rising", color: "text-green-600", bg: "bg-green-50 border-green-200" },
  falling: { icon: "\u{1F4C9}", label: "Falling", color: "text-red-500", bg: "bg-red-50 border-red-200" },
  steady: { icon: "\u27A1\uFE0F", label: "Steady", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
};

export function NamePopularityPredictor() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<PredictResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/name-predict?name=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function formatPct(pct: number | null | undefined): string {
    if (!pct) return "N/A";
    return `${(pct * 100).toFixed(3)}%`;
  }

  return (
    <section className="my-8 p-6 bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-2xl">
      <h2 className="text-2xl font-bold text-pink-900 mb-2">Name Popularity Predictor</h2>
      <p className="text-sm text-pink-700 mb-5">
        Enter any name to discover its popularity trend, peak year, and similar name suggestions.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a baby name..."
          className="flex-1 px-4 py-3 border border-pink-300 rounded-xl text-sm focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 bg-white"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-3 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Searching..." : "Check"}
        </button>
      </form>

      {result && (
        <div className="space-y-4">
          {!result.found ? (
            <div className="p-5 bg-white border border-pink-200 rounded-xl">
              <p className="text-lg font-semibold text-pink-800 mb-1">{result.name}</p>
              <p className="text-sm text-slate-600">{result.message}</p>
              <p className="text-xs text-pink-500 mt-2">
                Unique names are special — your child will stand out!
              </p>
            </div>
          ) : (
            <>
              {/* Name info card */}
              <div className="p-5 bg-white border border-pink-200 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-2xl font-bold text-pink-900">{result.name}</h3>
                  {result.gender && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      result.gender === "boy" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
                    }`}>
                      {result.gender === "boy" ? "Boy" : "Girl"}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  {result.origin && (
                    <div>
                      <span className="text-slate-400 text-xs">Origin</span>
                      <p className="font-medium text-slate-800">{result.origin}</p>
                    </div>
                  )}
                  {result.meaning && (
                    <div>
                      <span className="text-slate-400 text-xs">Meaning</span>
                      <p className="font-medium text-slate-800">{result.meaning}</p>
                    </div>
                  )}
                  {result.peakYear && (
                    <div>
                      <span className="text-slate-400 text-xs">Peak Year</span>
                      <p className="font-medium text-slate-800">{result.peakYear}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Trend card */}
              {result.trend && (
                <div className={`p-4 border rounded-xl ${trendConfig[result.trend].bg}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{trendConfig[result.trend].icon}</span>
                    <span className={`font-semibold ${trendConfig[result.trend].color}`}>
                      {trendConfig[result.trend].label}
                    </span>
                    {result.trendPct !== undefined && result.trendPct !== 0 && (
                      <span className="text-xs text-slate-500">
                        ({result.trendPct > 0 ? "+" : ""}{result.trendPct}% over last 30 years)
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-600">
                    {result.currentPct ? (
                      <span>
                        As of {result.currentYear}, {formatPct(result.currentPct)} of babies are named {result.name}.
                        {result.peakPct && ` Peak was ${formatPct(result.peakPct)} in ${result.peakYear}.`}
                      </span>
                    ) : (
                      <span>Peak popularity was {formatPct(result.peakPct)} in {result.peakYear}.</span>
                    )}
                  </div>
                </div>
              )}

              {/* Similar names */}
              {result.similar.length > 0 && (
                <div className="p-4 bg-white border border-pink-200 rounded-xl">
                  <h4 className="text-sm font-semibold text-pink-800 mb-3">
                    Names similar to {result.name}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {result.similar.map((s) => (
                      <a
                        key={s.slug}
                        href={`/name/${s.slug}`}
                        className="p-2 rounded-lg border border-pink-100 hover:bg-pink-50 hover:border-pink-300 text-center transition-colors"
                      >
                        <span className="font-medium text-sm text-slate-800">{s.name}</span>
                        {s.meaning && (
                          <span className="block text-xs text-slate-400 mt-0.5 truncate">{s.meaning}</span>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* High-CPC footer */}
      <div className="mt-6 pt-5 border-t border-pink-200">
        <h3 className="text-sm font-semibold text-pink-900 mb-2">Preparing for Your Little One?</h3>
        <p className="text-xs text-pink-700 leading-relaxed">
          Discover personalized baby gifts, build the perfect baby registry checklist, and find the best nursery furniture deals for your growing family.
        </p>
      </div>
    </section>
  );
}
