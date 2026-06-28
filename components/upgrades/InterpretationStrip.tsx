/**
 * InterpretationStrip — page-quality lever for /name/[slug]/.
 *
 * Renders two stacked components:
 *   1. CohortIndex card — shows the 5-bucket Cross-Generation Cohort Index +
 *      a horizontal cohort-share bar chart (7 cohorts).
 *   2. 4-section interpretation strip — how-to-read-the-rank, common
 *      mistakes, what's NOT included, practical example. Content is
 *      category-specific (legendary-classic / vintage-revival / etc.).
 *
 * Why this lives on /name/ (and is page-specific, not site-wide):
 *   • The interpretation depends on the name's *individual* trajectory,
 *     not on a static template — a name's category determines which warning
 *     the reader actually needs.
 *   • Without this, /name/ pages risk being "templated rank tables" — with
 *     it, each page becomes a derived analytical view of the underlying
 *     SSA series.
 */
import { COHORTS, COHORT_LIST, type CohortSlug } from '@/lib/cohort';
import type { CohortIndex } from '@/lib/cohort-index';
import type { InterpretationContext } from '@/lib/name-classifier';

interface Props {
  name: string;
  cohortIndex: CohortIndex;
  context: InterpretationContext;
}

const BUCKET_TONES: Record<string, string> = {
  'multi-gen-staple': 'border-emerald-200 from-emerald-50 to-white',
  'cross-era-classic': 'border-indigo-200 from-indigo-50 to-white',
  'single-gen-spike': 'border-amber-200 from-amber-50 to-white',
  'fading-classic': 'border-slate-300 from-slate-50 to-white',
  emergent: 'border-rose-200 from-rose-50 to-white',
};

function CohortBar({ cohortShares }: { cohortShares: Record<CohortSlug, number> }) {
  const max = Math.max(...COHORT_LIST.map((c) => cohortShares[c]));
  return (
    <div className="grid grid-cols-7 gap-1 mt-3">
      {COHORT_LIST.map((c) => {
        const share = cohortShares[c];
        const heightPct = max > 0 ? (share / max) * 100 : 0;
        const meta = COHORTS[c];
        return (
          <div key={c} className="flex flex-col items-center justify-end">
            <div className="text-[10px] text-slate-500 mb-1">{(share * 100).toFixed(0)}%</div>
            <div className="w-full bg-slate-100 rounded-sm relative" style={{ height: '60px' }}>
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-500 to-purple-300 rounded-sm"
                style={{ height: `${heightPct}%` }}
                aria-hidden="true"
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1 text-center leading-tight">
              {meta.label.split(' ')[0]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function InterpretationStrip({ name, cohortIndex, context }: Props) {
  const tone = BUCKET_TONES[cohortIndex.bucket] ?? 'border-slate-200 from-slate-50 to-white';
  return (
    <section
      data-upgrade="interpretation-strip"
      aria-label={`How to read the data for ${name}`}
      className="my-8 space-y-4"
    >
      <div className={`rounded-xl border-2 ${tone} bg-gradient-to-br p-5`}>
        <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Cross-Generation Cohort Index
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{cohortIndex.bucketLabel}</div>
          </div>
          <div className="text-right text-xs text-slate-500 max-w-[14rem]">
            <div>
              {cohortIndex.carryingCount}/7 cohorts ≥12% share
            </div>
            <div>
              Dominant: {COHORTS[cohortIndex.dominantCohort!].label} ({(cohortIndex.dominantShare * 100).toFixed(0)}%)
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">{cohortIndex.oneSentence}</p>
        <CohortBar cohortShares={cohortIndex.cohortShares} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
            How to read this page
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {context.categoryLabel}
          </span>
        </div>
        <div className="space-y-4 text-sm leading-relaxed text-slate-700">
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">What the rank actually tells you</h3>
            <p>{context.rankReading}</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">Common misreadings</h3>
            <p>{context.commonMistakes}</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">What our SSA-derived view does <em>not</em> capture</h3>
            <p>{context.notIncluded}</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">Practical example</h3>
            <p>{context.practicalExample}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
