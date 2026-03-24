import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getNamesByLetter } from "@/lib/db";

interface Props { params: Promise<{ letter: string }> }

export function generateStaticParams() {
  return "abcdefghijklmnopqrstuvwxyz".split("").map((l) => ({ letter: l }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { letter } = await params;
  const L = letter.toUpperCase();
  return { title: `Baby Names Starting With ${L}`, description: `Browse baby names that start with the letter ${L}. See meanings, origins, and popularity.` };
}

export default async function LetterPage({ params }: Props) {
  const { letter } = await params;
  if (!/^[a-z]$/.test(letter)) notFound();
  const names = getNamesByLetter(letter);
  const L = letter.toUpperCase();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Baby Names Starting With {L}</h1>
      <p className="text-slate-600 mb-6">{names.length} names found</p>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
        {names.map((n) => (
          <a key={n.slug} href={`/name/${n.slug}`} className="p-2 hover:bg-slate-50 rounded border border-slate-100">
            <span className="font-medium">{n.name}</span>
            <span className={`ml-2 text-xs ${n.gender === 'boy' ? 'text-blue-400' : 'text-pink-400'}`}>{n.gender}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
