import { JSX } from "react";

interface ProprietaryMetricsBlockProps {
  rarityScore: number;
  harmonyScore: number;
  styleGrade: string;
  commentary: string;
}

function getRarityLevel(score: number): { label: string; color: string; ringColor: string; bg: string } {
  if (score >= 75) {
    return { label: "Rare & Unique", color: "text-purple-700", ringColor: "stroke-purple-500", bg: "bg-purple-50" };
  }
  if (score >= 40) {
    return { label: "Moderate Popularity", color: "text-indigo-700", ringColor: "stroke-indigo-500", bg: "bg-indigo-50" };
  }
  return { label: "Highly Popular Classic", color: "text-blue-700", ringColor: "stroke-blue-500", bg: "bg-blue-50" };
}

function getHarmonyLevel(score: number): { label: string; color: string; ringColor: string; bg: string } {
  if (score >= 85) {
    return { label: "Highly Melodious", color: "text-pink-700", ringColor: "stroke-pink-500", bg: "bg-pink-50" };
  }
  if (score >= 70) {
    return { label: "Good Flow", color: "text-violet-700", ringColor: "stroke-violet-500", bg: "bg-violet-50" };
  }
  return { label: "Structured Rhythm", color: "text-slate-700", ringColor: "stroke-slate-500", bg: "bg-slate-50" };
}

function getGradeStyles(grade: string): { badge: string; border: string; bg: string } {
  const cleanGrade = grade.charAt(0);
  switch (cleanGrade) {
    case "A":
      return { badge: "text-purple-800 bg-purple-100", border: "border-purple-200", bg: "bg-purple-50/30" };
    case "B":
      return { badge: "text-indigo-800 bg-indigo-100", border: "border-indigo-200", bg: "bg-indigo-50/30" };
    case "C":
      return { badge: "text-pink-800 bg-pink-100", border: "border-pink-200", bg: "bg-pink-50/30" };
    case "D":
    case "F":
    default:
      return { badge: "text-slate-800 bg-slate-100", border: "border-slate-200", bg: "bg-slate-50/30" };
  }
}

export function ProprietaryMetricsBlock({
  rarityScore,
  harmonyScore,
  styleGrade,
  commentary,
}: ProprietaryMetricsBlockProps): JSX.Element {
  const rarity = getRarityLevel(rarityScore);
  const harmony = getHarmonyLevel(harmonyScore);
  const gradeStyles = getGradeStyles(styleGrade);

  // SVG Circle parameters for progress gauge
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  
  const rarityOffset = circumference - (rarityScore / 100) * circumference;
  const harmonyOffset = circumference - (harmonyScore / 100) * circumference;

  return (
    <section
      data-upgrade="proprietary-metrics"
      aria-label="NameBlooms Proprietary Name Harmony and Style Analysis"
      className="not-prose my-8 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm"
    >
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
        <svg
          aria-hidden="true"
          className="h-4.5 w-4.5 text-purple-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
          />
        </svg>
        NameBlooms Style & Harmony Analysis
      </h3>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Metric Gauges Row */}
        <div className="flex flex-row items-center justify-around gap-5 w-full lg:w-auto flex-shrink-0">
          {/* Rarity Score Ring */}
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                <circle className="text-slate-100" strokeWidth="8" stroke="currentColor" fill="transparent" r={radius} cx="48" cy="48" />
                <circle className={`${rarity.ringColor} transition-all duration-500`} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={rarityOffset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx="48" cy="48" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-black text-slate-800">{rarityScore}</span>
                <span className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider">Rarity</span>
              </div>
            </div>
            <span className={`text-[11px] font-bold mt-1.5 ${rarity.color}`}>{rarity.label}</span>
          </div>

          {/* Harmony Score Ring */}
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                <circle className="text-slate-100" strokeWidth="8" stroke="currentColor" fill="transparent" r={radius} cx="48" cy="48" />
                <circle className={`${harmony.ringColor} transition-all duration-500`} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={harmonyOffset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx="48" cy="48" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-black text-slate-800">{harmonyScore}</span>
                <span className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider">Harmony</span>
              </div>
            </div>
            <span className={`text-[11px] font-bold mt-1.5 ${harmony.color}`}>{harmony.label}</span>
          </div>

          {/* Style Grade Badge */}
          <div className="flex flex-col items-center">
            <div className={`w-20 h-20 rounded-full border-2 ${gradeStyles.border} ${gradeStyles.bg} flex items-center justify-center`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl shadow-sm ${gradeStyles.badge}`}>
                {styleGrade}
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-700 mt-1.5 font-sans">Style Grade</span>
          </div>
        </div>

        {/* Dynamic Commentary Text */}
        <div className="flex-1 bg-purple-50/40 border border-purple-100 rounded-xl p-4">
          <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Linguistic Analysis</h4>
          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            {commentary}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400">
        <span>* Rarity index models historical birth records from the Social Security Administration (SSA).</span>
        <span>* Phonetic harmony evaluates consonants, vowel glide glissandos, and syllable balance.</span>
      </div>
    </section>
  );
}
