import { getPopularNames } from "@/lib/db";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Compare Baby Names",
  description: "Compare baby names side by side — popularity trends, origins, and meanings.",
  alternates: { canonical: "https://nameblooms.com/compare/" },
  openGraph: { title: "Compare Baby Names", description: "Compare baby names side by side — popularity trends, origins, and meanings.", url: "https://nameblooms.com/compare/" },
};
export default function ComparePage() {
  const boys = getPopularNames("boy", 15);
  const girls = getPopularNames("girl", 15);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Compare Baby Names</h1>
      <h2 className="text-xl font-bold mb-3">Popular Comparisons</h2>
      <div className="grid sm:grid-cols-2 gap-2 text-sm">
        {boys.slice(0, 10).map((b, i) => {
          const g = girls[i];
          if (!g) return null;
          const [a, z] = [b.slug, g.slug].sort();
          return (<a key={i} href={`/compare/${a}-vs-${z}`} className="p-3 border border-slate-200 rounded-lg hover:bg-purple-50 text-purple-600">{b.name} vs {g.name}</a>);
        })}
        {boys.slice(0, 5).map((b, i) => {
          const b2 = boys[i + 5];
          if (!b2) return null;
          const [a, z] = [b.slug, b2.slug].sort();
          return (<a key={`b${i}`} href={`/compare/${a}-vs-${z}`} className="p-3 border border-slate-200 rounded-lg hover:bg-blue-50 text-blue-600">{b.name} vs {b2.name}</a>);
        })}
      </div>
    </div>
  );
}
