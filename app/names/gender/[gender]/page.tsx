import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPopularNames } from "@/lib/db";

interface Props { params: Promise<{ gender: string }> }

export function generateStaticParams() {
  return [{ gender: "boy" }, { gender: "girl" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gender } = await params;
  const label = gender === "boy" ? "Boy" : "Girl";
  return { title: `${label} Baby Names - Complete List`, description: `Browse popular ${label.toLowerCase()} baby names with meanings and origins.` };
}

export default async function GenderPage({ params }: Props) {
  const { gender } = await params;
  if (gender !== "boy" && gender !== "girl") notFound();
  const names = getPopularNames(gender, 500);
  const label = gender === "boy" ? "Boy" : "Girl";
  const color = gender === "boy" ? "text-blue-700" : "text-pink-700";

  return (
    <div>
      <h1 className={`text-3xl font-bold mb-6 ${color}`}>{label} Baby Names</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
        {names.map((n) => (
          <a key={n.slug} href={`/name/${n.slug}`} className="p-2 hover:bg-slate-50 rounded border border-slate-100">
            <span className="font-medium">{n.name}</span>
            {n.meaning && <span className="text-slate-400 ml-2 text-xs">{n.meaning}</span>}
          </a>
        ))}
      </div>
    </div>
  );
}
