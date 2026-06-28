import { COHORTS, type CohortSlug } from '@/lib/cohort';
import { ARCHETYPES, type ArchetypeSlug } from '@/lib/archetype';
import type { ArchetypePeer, CohortRank, LetterRank } from '@/lib/name-context';

interface Props {
  name: string;
  gender: string;
  archetype: ArchetypeSlug | null;
  archetypePeers: ArchetypePeer[];
  dominantCohort: CohortSlug | null;
  cohortRank: CohortRank | null;
  letterRank: LetterRank | null;
}

export function NameContextStrip({
  name,
  gender,
  archetype,
  archetypePeers,
  dominantCohort,
  cohortRank,
  letterRank,
}: Props) {
  const cohortMeta = dominantCohort ? COHORTS[dominantCohort] : null;
  const archetypeMeta = archetype ? ARCHETYPES[archetype] : null;
  const genderLabel = gender === 'boy' ? 'boy' : gender === 'girl' ? 'girl' : 'baby';

  const hasArchetype = !!(archetypeMeta && archetypePeers.length > 0);
  const hasCohort = !!(cohortMeta && cohortRank);
  const hasLetter = !!letterRank;

  if (!hasArchetype && !hasCohort && !hasLetter) return null;

  return (
    <section className="mt-8 mb-8 grid grid-cols-1 md:grid-cols-3 gap-3">
      {hasArchetype && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs uppercase tracking-wide font-semibold text-slate-500 mb-1">
            Same archetype
          </div>
          <div className="text-sm text-slate-900 leading-relaxed mb-2">
            {name} is classified <strong>{archetypeMeta!.label}</strong>.
            Closest {genderLabel} peers by peak era:
          </div>
          <ul className="text-sm space-y-1">
            {archetypePeers.map((p) => (
              <li key={p.slug}>
                <a href={`/name/${p.slug}/`} className="text-purple-700 hover:underline">
                  {p.name}
                </a>
                {p.peak_year != null && (
                  <span className="text-slate-500"> · peak {p.peak_year}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasCohort && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs uppercase tracking-wide font-semibold text-slate-500 mb-1">
            Generation cohort
          </div>
          <div className="text-sm text-slate-900 leading-relaxed">
            Among {genderLabel} names whose dominant generation is the{" "}
            <strong>{cohortMeta!.label}</strong> ({cohortMeta!.years}),{" "}
            {name} ranks{" "}
            <strong>#{cohortRank!.rankInCohort.toLocaleString()}</strong> of{" "}
            {cohortRank!.totalInCohort.toLocaleString()} by total US births in
            that cohort.
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Cohort era: {cohortMeta!.parentEra}.
          </div>
        </div>
      )}

      {hasLetter && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs uppercase tracking-wide font-semibold text-slate-500 mb-1">
            Initial letter
          </div>
          <div className="text-sm text-slate-900 leading-relaxed">
            Of <strong>{letterRank!.total.toLocaleString()}</strong> {genderLabel}{" "}
            names starting with &ldquo;{letterRank!.letter}&rdquo; that have a
            peak share on record, {name} ranks{" "}
            <strong>#{letterRank!.rank.toLocaleString()}</strong> by peak
            popularity.
          </div>
          {letterRank!.topPeers.length > 0 && (
            <div className="text-xs text-slate-500 mt-2">
              Top {letterRank!.letter}-names ({genderLabel}):{" "}
              {letterRank!.topPeers.map((p, i) => (
                <span key={p.slug}>
                  {i > 0 && ', '}
                  <a href={`/name/${p.slug}/`} className="text-purple-700 hover:underline">
                    {p.name}
                  </a>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
