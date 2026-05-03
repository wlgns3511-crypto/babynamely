import type { ArchetypeMeta } from '@/lib/archetype';

interface Props {
  name: string;
  meta: ArchetypeMeta;
  cohortHint?: string;
  totalInArchetype?: number;
}

const TONE_BG: Record<ArchetypeMeta['tone'], string> = {
  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
  amber: 'bg-amber-50 border-amber-200 text-amber-900',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  rose: 'bg-rose-50 border-rose-200 text-rose-900',
  slate: 'bg-slate-50 border-slate-300 text-slate-900',
  sky: 'bg-sky-50 border-sky-200 text-sky-900',
  purple: 'bg-purple-50 border-purple-200 text-purple-900',
  teal: 'bg-teal-50 border-teal-200 text-teal-900',
};

const TONE_TAG: Record<ArchetypeMeta['tone'], string> = {
  indigo: 'bg-indigo-600 text-white',
  amber: 'bg-amber-500 text-white',
  emerald: 'bg-emerald-600 text-white',
  rose: 'bg-rose-500 text-white',
  slate: 'bg-slate-600 text-white',
  sky: 'bg-sky-600 text-white',
  purple: 'bg-purple-600 text-white',
  teal: 'bg-teal-600 text-white',
};

export function ArchetypeBadge({ name, meta, cohortHint, totalInArchetype }: Props) {
  return (
    <section className={`my-8 rounded-xl border-2 p-5 ${TONE_BG[meta.tone]}`}>
      <div className="flex items-center gap-3 mb-3">
        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${TONE_TAG[meta.tone]}`}>
          Trajectory · {meta.label}
        </span>
        <span className="text-2xl" aria-hidden="true">{meta.emoji}</span>
      </div>
      <h2 className="text-xl font-bold mb-2">
        {name} fits the &ldquo;{meta.label}&rdquo; pattern
      </h2>
      <p className="text-sm leading-relaxed mb-3">{meta.long}</p>
      {cohortHint && (
        <p className="text-sm leading-relaxed mb-3 italic opacity-80">
          {cohortHint}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <a
          href={`/trajectory/${meta.slug}/`}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md ${TONE_TAG[meta.tone]} font-semibold hover:opacity-90`}
        >
          See all {totalInArchetype ? `${totalInArchetype.toLocaleString()} ` : ''}{meta.label.toLowerCase()} names →
        </a>
        <span className="text-xs opacity-70">Examples: {meta.example}</span>
      </div>
    </section>
  );
}
