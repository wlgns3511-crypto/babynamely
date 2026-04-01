import type { Metadata } from "next";
import { getAllNames } from "@/lib/db";

export const metadata: Metadata = {
  title: "NameBlooms - Significado de Nombres, Origen y Popularidad",
  description: "Descubre el nombre perfecto para tu bebé. Explora más de 6,000 nombres con significados, orígenes y tendencias de popularidad.",
  alternates: {
    canonical: "/es/",
    languages: { en: "/", es: "/es/", "x-default": "/" },
  },
  openGraph: { url: "/es/" },
};

export default function HomeEs() {
  const names = getAllNames().slice(0, 40);

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900 mb-4">
        Significado de Nombres, Origen y Popularidad
      </h1>
      <p className="text-slate-600 mb-2">
        Descubre el nombre perfecto para tu bebé. Explora más de 6,000 nombres con significados, orígenes y tendencias de popularidad.
      </p>
      <p className="text-xs text-slate-400 mb-8">
        <a href="/" className="text-purple-500 hover:underline">English version</a>
      </p>

      <section>
        <h2 className="text-xl font-bold mb-4">Nombres Populares</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {names.map((n) => (
            <a
              key={n.slug}
              href={`/es/name/${n.slug}`}
              className="p-3 border border-slate-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all text-center"
            >
              <div className="font-medium text-sm">{n.name}</div>
              <div className="text-xs text-slate-500 mt-1">{n.gender === "boy" ? "Niño" : "Niña"}</div>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
