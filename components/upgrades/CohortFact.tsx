import { COHORTS, type CohortFact as CohortFactType } from '@/lib/cohort';

interface Props {
  name: string;
  fact: CohortFactType;
}

function formatBirths(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

export function CohortFact({ name, fact }: Props) {
  if (!fact.firstRealYear && !fact.dominantCohort) return null;
  const cohort = fact.dominantCohort ? COHORTS[fact.dominantCohort] : null;
  const currentYear = new Date().getFullYear();

  let yearStory = '';
  if (fact.firstRealYear) {
    const yearsAgo = currentYear - fact.firstRealYear;
    if (fact.firstRealYear < 1900) {
      yearStory = `${name} appears in the SSA file from its earliest year — the name was already common when annual record-keeping began.`;
    } else if (yearsAgo > 100) {
      yearStory = `${name} first crossed 100 babies/year in ${fact.firstRealYear} — over a century ago.`;
    } else if (yearsAgo > 50) {
      yearStory = `${name} first crossed 100 babies/year in ${fact.firstRealYear}, ${yearsAgo} years ago — roughly two generations.`;
    } else if (yearsAgo > 25) {
      yearStory = `${name} first crossed 100 babies/year in ${fact.firstRealYear}, just ${yearsAgo} years ago — within one generation.`;
    } else {
      yearStory = `${name} only first crossed 100 babies/year in ${fact.firstRealYear} — a recent name in SSA terms.`;
    }
  }

  let cohortStory = '';
  if (cohort && fact.dominantCohortCount) {
    cohortStory = `Of all the babies named ${name} from 1880 onward, the largest single-cohort share was given during the ${cohort.label} (${cohort.years}). Roughly ${formatBirths(fact.dominantCohortCount)} babies received the name in those years — the era of ${cohort.parentEra}.`;
  }

  return (
    <section className="my-8 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-amber-50/50 p-5">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
        Cohort fact · derived from SSA × generation cohorts
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        {fact.firstRealYear && (
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">First sustained year</div>
            <div className="text-3xl font-bold text-slate-900">{fact.firstRealYear}</div>
            <p className="text-sm text-slate-700 mt-2">{yearStory}</p>
          </div>
        )}
        {cohort && (
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Dominant generation cohort</div>
            <div className="text-2xl font-bold text-slate-900">{cohort.label}</div>
            <div className="text-sm text-slate-500">{cohort.years}</div>
            <p className="text-sm text-slate-700 mt-2">{cohortStory}</p>
          </div>
        )}
      </div>
      {fact.totalBirths && (
        <p className="mt-4 text-xs text-slate-500">
          Total estimated US births named {name} since 1880: <strong>{formatBirths(fact.totalBirths)}</strong>{' '}
          (sum of yearly count across the SSA series).
        </p>
      )}
    </section>
  );
}
