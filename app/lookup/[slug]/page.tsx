import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getNameBySlug } from "@/lib/db";
import { isIndexableNameSlug } from "@/lib/index-status";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = getNameBySlug(slug);
  if (!name) notFound();
  return {
    title: `${name.name} — Baby name reference`,
    description: name.meaning || `${name.name} name origin and popularity reference.`,
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false, noimageindex: true },
    },
    ...(isIndexableNameSlug(slug)
      ? { alternates: { canonical: `/name/${slug}/` } }
      : {}),
  };
}

export default async function NameLookupPage({ params }: Props) {
  const { slug } = await params;
  if (isIndexableNameSlug(slug)) redirect(`/name/${slug}/`);
  const name = getNameBySlug(slug);
  if (!name) notFound();

  return (
    <article className="mx-auto max-w-3xl">
      <nav className="mb-5 text-sm text-slate-500">
        <a href="/search/" className="hover:text-pink-600">Baby name search</a>
        <span className="mx-2">/</span>
        <span>{name.name}</span>
      </nav>
      <header className="mb-8">
        <h1 className="text-4xl font-bold">{name.name}</h1>
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          This name remains available as a database reference. Expanded trend
          and fit analysis is reserved for the reviewed name set.
        </p>
      </header>
      <dl className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <div><dt className="text-xs font-semibold uppercase text-slate-500">Gender</dt><dd className="mt-1 text-slate-800">{name.gender}</dd></div>
        <div><dt className="text-xs font-semibold uppercase text-slate-500">Origin</dt><dd className="mt-1 text-slate-800">{name.origin || "Not recorded"}</dd></div>
        <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase text-slate-500">Meaning</dt><dd className="mt-1 text-slate-800">{name.meaning || "Meaning not recorded in the source data."}</dd></div>
        {name.peak_year && <div><dt className="text-xs font-semibold uppercase text-slate-500">Peak year</dt><dd className="mt-1 text-slate-800">{name.peak_year}</dd></div>}
      </dl>
      <form action="/search/" className="mt-10 flex gap-2 rounded-xl bg-pink-50 p-6">
        <input name="q" required maxLength={80} placeholder="Search another name" className="min-w-0 flex-1 rounded-lg border border-pink-200 bg-white px-4 py-3" />
        <button className="rounded-lg bg-pink-600 px-5 py-3 font-semibold text-white">Search</button>
      </form>
    </article>
  );
}
