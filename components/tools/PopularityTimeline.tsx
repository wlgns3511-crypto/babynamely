"use client";
import { useState, useMemo } from "react";

interface YearData {
  year: number;
  pct: number;
}

interface Props {
  name: string;
  gender: string;
  peakYear: number | null;
  peakPct: number | null;
  trend: string;
  popularity: YearData[];
}

function formatPct(pct: number): string {
  return `${(pct * 100).toFixed(3)}%`;
}

export function PopularityTimeline({ name, gender, peakYear, peakPct, trend, popularity }: Props) {
  const minYear = 1950;
  const maxYear = 2025;
  const [selectedYear, setSelectedYear] = useState(peakYear && peakYear >= minYear ? peakYear : 2000);

  const yearMap = useMemo(() => {
    const m = new Map<number, number>();
    for (const p of popularity) {
      m.set(p.year, p.pct);
    }
    return m;
  }, [popularity]);

  const selectedData = useMemo(() => {
    // Exact match first
    if (yearMap.has(selectedYear)) {
      return { year: selectedYear, pct: yearMap.get(selectedYear)!, exact: true };
    }
    // Find nearest
    let closest: YearData | null = null;
    let minDist = Infinity;
    for (const p of popularity) {
      const dist = Math.abs(p.year - selectedYear);
      if (dist < minDist) {
        minDist = dist;
        closest = p;
      }
    }
    if (closest) {
      return { year: closest.year, pct: closest.pct, exact: false };
    }
    return null;
  }, [selectedYear, yearMap, popularity]);

  // Build sparkline data (every 5 years from 1950-2025)
  const sparklinePoints = useMemo(() => {
    const points: { year: number; pct: number }[] = [];
    for (let y = minYear; y <= maxYear; y += 5) {
      if (yearMap.has(y)) {
        points.push({ year: y, pct: yearMap.get(y)! });
      } else {
        // Interpolate from nearest
        let closest: YearData | null = null;
        let minDist = Infinity;
        for (const p of popularity) {
          const dist = Math.abs(p.year - y);
          if (dist < minDist && dist <= 5) {
            minDist = dist;
            closest = p;
          }
        }
        points.push({ year: y, pct: closest?.pct ?? 0 });
      }
    }
    return points;
  }, [yearMap, popularity]);

  const maxPct = useMemo(() => Math.max(...sparklinePoints.map(p => p.pct), 0.00001), [sparklinePoints]);

  const trendLabel = trend === "rising" ? "Trending Up"
    : trend === "falling" ? "Declining"
    : trend === "classic" ? "Timeless Classic"
    : trend === "vintage_revival" ? "Vintage Revival"
    : trend === "new" ? "Rare & Unique"
    : "Steady";

  const trendIcon = trend === "rising" ? "^" : trend === "falling" ? "v" : "-";

  const isBoy = gender === "boy";
  const accentBg = isBoy ? "bg-blue-50" : "bg-pink-50";
  const accentBorder = isBoy ? "border-blue-200" : "border-pink-200";
  const accentText = isBoy ? "text-blue-900" : "text-pink-900";
  const accentSub = isBoy ? "text-blue-600" : "text-pink-600";
  const barColor = isBoy ? "bg-blue-400" : "bg-pink-400";
  const barHighlight = isBoy ? "bg-blue-600" : "bg-pink-600";

  return (
    <section className={`my-8 border ${accentBorder} rounded-xl overflow-hidden`}>
      <div className={`${accentBg} px-5 py-4 border-b ${accentBorder}`}>
        <h2 className={`text-lg font-bold ${accentText}`}>Name Popularity Timeline</h2>
        <p className={`text-xs ${accentSub}`}>Explore how {name} ranked over the decades</p>
      </div>

      <div className="p-5 space-y-5">
        {/* Year slider */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select a birth year: <span className="font-bold text-lg">{selectedYear}</span>
          </label>
          <input
            type="range"
            min={minYear}
            max={maxYear}
            step={1}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className={`w-full ${isBoy ? "accent-blue-600" : "accent-pink-600"}`}
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>{minYear}</span><span>{maxYear}</span>
          </div>
        </div>

        {/* Result for selected year */}
        <div className={`${accentBg} border ${accentBorder} rounded-lg p-4`}>
          {selectedData ? (
            <p className={`text-sm ${accentText} leading-relaxed`}>
              In <strong>{selectedData.year}</strong>
              {!selectedData.exact && ` (nearest data to ${selectedYear})`},{" "}
              <strong>{name}</strong> was at <strong>{formatPct(selectedData.pct)}</strong> of US babies
              {peakYear && peakPct ? (
                <> — it peaked at <strong>{formatPct(peakPct)}</strong> in <strong>{peakYear}</strong></>
              ) : null}.{" "}
              Trend: <strong>{trendLabel}</strong>.
            </p>
          ) : (
            <p className="text-sm text-slate-600">
              No data available for {name} around {selectedYear}. This name may not have been in the SSA registry at that time.
            </p>
          )}
        </div>

        {/* Peak info card */}
        {peakYear && peakPct && (
          <div className="grid grid-cols-3 gap-2">
            <div className="border rounded-lg p-3 text-center">
              <div className="text-xs text-slate-500 uppercase">Peak Year</div>
              <div className={`text-xl font-bold ${accentText}`}>{peakYear}</div>
            </div>
            <div className="border rounded-lg p-3 text-center">
              <div className="text-xs text-slate-500 uppercase">Peak Share</div>
              <div className={`text-xl font-bold ${accentText}`}>{formatPct(peakPct)}</div>
            </div>
            <div className="border rounded-lg p-3 text-center">
              <div className="text-xs text-slate-500 uppercase">Trend</div>
              <div className={`text-xl font-bold ${accentText}`}>{trendLabel}</div>
            </div>
          </div>
        )}

        {/* Sparkline timeline */}
        {sparklinePoints.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">Popularity Over Time</p>
            <div className="flex items-end gap-[2px] h-20">
              {sparklinePoints.map((p) => {
                const height = maxPct > 0 ? (p.pct / maxPct) * 100 : 0;
                const isSelected = Math.abs(p.year - selectedYear) <= 2;
                const isPeak = peakYear && Math.abs(p.year - peakYear) <= 2;
                return (
                  <div
                    key={p.year}
                    className="flex-1 relative group cursor-pointer"
                    onClick={() => setSelectedYear(p.year)}
                  >
                    <div
                      className={`w-full rounded-t-sm transition-all ${
                        isSelected ? barHighlight : isPeak ? "bg-amber-400" : barColor
                      } ${isSelected ? "opacity-100" : "opacity-70 hover:opacity-100"}`}
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                    {(p.year % 20 === 0 || isSelected) && (
                      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-slate-400">
                        {p.year}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-5">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <span className={`w-3 h-3 ${barHighlight} rounded-sm inline-block`} /> Selected
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <span className="w-3 h-3 bg-amber-400 rounded-sm inline-block" /> Peak
              </span>
            </div>
          </div>
        )}
      </div>

      <div className={`px-5 py-3 bg-slate-50 border-t border-slate-200`}>
        <p className="text-xs text-slate-400">
          Data from Social Security Administration baby name records (1880-2023).
          Percentages represent share of all {gender} births in a given year.
        </p>
      </div>
    </section>
  );
}
