import Link from "next/link";
import type { DailyEntry } from "@/lib/daily-engine";

const KIND_LABEL: Record<string, string> = {
  comparison: "Head to head",
  ranking: "Where it sits",
  spotlight: "One record, read closely",
  route: "Where to go next",
};

// Snapshots written before the section rewrite only have a flat item list.
function sectionsOf(entry: DailyEntry) {
  if (entry.sections?.length) return entry.sections;
  return [{ kind: entry.kind, heading: entry.title, body: entry.intro, items: entry.items, takeaway: undefined }];
}

export function DailySections({ entry }: { entry: DailyEntry }) {
  return (
    <div className="mt-10 space-y-12">
      {sectionsOf(entry).map((section, index) => (
        <section key={`${section.kind}-${index}`} aria-labelledby={`daily-section-${index}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">{KIND_LABEL[section.kind] || "Reading"}</p>
          <h2 id={`daily-section-${index}`} className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{section.heading}</h2>
          <p className="mt-3 leading-relaxed text-slate-700">{section.body}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {section.items.map((item) => (
              <Link key={`${section.kind}-${item.href}`} href={item.href} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm">
                <h3 className="font-semibold text-slate-900">{item.label}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.value}</p>
                {item.verdict && <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.verdict}</p>}
                <span className="mt-3 block text-sm font-medium text-blue-700">Open record →</span>
              </Link>
            ))}
          </div>
          {section.takeaway && (
            <p className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-relaxed text-slate-700">
              <span className="font-semibold text-blue-800">What this tells you: </span>{section.takeaway}
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
