import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getNamesByOrigin, getAllOrigins } from "@/lib/db";

interface Props { params: Promise<{ origin: string }> }

export function generateStaticParams() {
  return getAllOrigins().map((o) => ({ origin: o.toLowerCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { origin } = await params;
  const cap = origin.charAt(0).toUpperCase() + origin.slice(1);
  return {
    title: `${cap} Baby Names - Origins & Meanings`,
    description: `Browse baby names of ${cap} origin. Find beautiful ${cap} names with meanings and popularity data.`,
    alternates: { canonical: `/names/origin/${origin}` },
    openGraph: { url: `/names/origin/${origin}` },
  };
}

export default async function OriginPage({ params }: Props) {
  const { origin } = await params;
  const cap = origin.charAt(0).toUpperCase() + origin.slice(1);
  const names = getNamesByOrigin(cap);
  if (names.length === 0) notFound();

  const origins = getAllOrigins();

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:underline">Home</a> / <span className="text-slate-800">{cap} Names</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">{cap} Baby Names</h1>
      <p className="text-slate-600 mb-6">{names.length} names of {cap} origin</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {origins.map((o) => (
          <a key={o} href={`/names/origin/${o.toLowerCase()}`}
            className={`px-3 py-1 rounded-full text-sm border ${o === cap ? 'bg-purple-600 text-white border-purple-600' : 'border-slate-200 hover:bg-purple-50'}`}>
            {o}
          </a>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
        {names.map((n) => (
          <a key={n.slug} href={`/name/${n.slug}`} className="p-3 border border-slate-100 rounded-lg hover:bg-purple-50">
            <div className="font-medium">{n.name}</div>
            {n.meaning && <div className="text-xs text-slate-400 mt-1">{n.meaning}</div>}
            <span className={`text-xs ${n.gender === 'boy' ? 'text-blue-400' : 'text-pink-400'}`}>{n.gender}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
