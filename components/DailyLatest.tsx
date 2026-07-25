import Link from "next/link";
import { generateDailyEntry, listDailyDates } from "@/lib/daily-engine";

// The visible heartbeat on every page: latest daily notes, one dated line
// each. Old pages keep changing for real at every recrawl — the structure
// that keeps long-lived forum pages alive in search.
export async function DailyLatest() {
  const entries: { date: string; title: string }[] = [];
  for (const date of listDailyDates().slice(0, 5)) {
    try {
      const { title } = await generateDailyEntry(date);
      entries.push({ date, title });
    } catch {
      // a corrupt snapshot must not take down every page's footer
    }
  }
  if (entries.length === 0) return null;
  return (
    <section aria-label="Latest daily notes" className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-5 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-semibold text-slate-900">Latest daily notes</h2>
          <Link href="/daily/" className="shrink-0 text-xs text-slate-500 hover:underline">
            All daily notes →
          </Link>
        </div>
        <ul className="mt-2 space-y-1.5">
          {entries.map((entry) => (
            <li key={entry.date} className="flex gap-2 text-slate-600">
              <time dateTime={entry.date} className="shrink-0 tabular-nums text-slate-400">
                {entry.date}
              </time>
              <Link href={`/daily/${entry.date}/`} className="hover:underline">
                {entry.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
