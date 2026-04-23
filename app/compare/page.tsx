import { getStaticComparisons } from "@/lib/db";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Compare Baby Names",
  description: "Compare baby names side by side — popularity trends, origins, and meanings.",
  alternates: { canonical: "https://nameblooms.com/compare/" },
  openGraph: { title: "Compare Baby Names", description: "Compare baby names side by side — popularity trends, origins, and meanings.", url: "https://nameblooms.com/compare/" },
};
export default function ComparePage() {
  const pairs = getStaticComparisons(24);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Compare Baby Names</h1>
      <h2 className="text-xl font-bold mb-3">Popular Comparisons</h2>
      <div className="grid sm:grid-cols-2 gap-2 text-sm">
        {pairs.map((pair, i) => (
          <a
            key={`${pair.slugA}-${pair.slugB}`}
            href={`/compare/${pair.slugA}-vs-${pair.slugB}/`}
            className={`p-3 border border-slate-200 rounded-lg text-purple-600 ${i % 2 === 0 ? "hover:bg-purple-50" : "hover:bg-blue-50"}`}
          >
            {pair.nameA} vs {pair.nameB}
          </a>
        ))}
      </div>
    </div>
  );
}
