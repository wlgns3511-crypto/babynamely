import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getNameBySlug, getAllNames, getPopularity, getSimilarNames } from "@/lib/db";
import { formatPct, genderBg } from "@/lib/format";

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = false;
export const revalidate = false;

export function generateStaticParams() {
  return getAllNames().slice(0, 300).map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const n = getNameBySlug(slug);
  if (!n) return {};
  return {
    title: `${n.name} — Significado, Origen y Popularidad`,
    description: `${n.name} es un nombre de ${n.gender === 'boy' ? 'niño' : 'niña'}${n.origin ? ` de origen ${n.origin}` : ''}${n.meaning ? ` que significa "${n.meaning}"` : ''}. Tendencias de popularidad y nombres similares.`,
    alternates: {
      canonical: `/es/name/${slug}`,
      languages: { en: `/name/${slug}`, es: `/es/name/${slug}`, "x-default": `/name/${slug}` },
    },
    openGraph: { url: `/es/name/${slug}` },
  };
}

export default async function NamePageEs({ params }: Props) {
  const { slug } = await params;
  const n = getNameBySlug(slug);
  if (!n) notFound();

  const popularity = getPopularity(slug);
  const similar = getSimilarNames(slug, n.gender, 8);
  const decades = popularity.filter(p => p.year % 10 === 0);

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/es/" className="hover:underline">Inicio</a> / <a href={`/es/names/gender/${n.gender}`} className="hover:underline">{n.gender === 'boy' ? 'Nombres de Niño' : 'Nombres de Niña'}</a> / <span className="text-slate-800">{n.name}</span>
      </nav>

      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-4xl font-bold">{n.name}</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${n.gender === 'boy' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
          {n.gender === 'boy' ? 'Niño' : 'Niña'}
        </span>
        {n.origin && <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm">{n.origin}</span>}
      </div>
      <p className="text-xs text-slate-400 mb-6">
        <a href={`/name/${slug}`} className="text-purple-500 hover:underline">English version</a>
      </p>

      {/* Tarjeta de información */}
      <div className={`rounded-lg p-6 mb-6 ${genderBg(n.gender)}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {n.meaning && (
            <div>
              <div className="text-sm text-slate-500">Significado</div>
              <div className="text-lg font-semibold">{n.meaning}</div>
            </div>
          )}
          {n.origin && (
            <div>
              <div className="text-sm text-slate-500">Origen</div>
              <div className="text-lg font-semibold">{n.origin}</div>
            </div>
          )}
          {n.peak_year && (
            <div>
              <div className="text-sm text-slate-500">Año Pico</div>
              <div className="text-lg font-semibold">{n.peak_year}</div>
            </div>
          )}
          {n.peak_pct && (
            <div>
              <div className="text-sm text-slate-500">Popularidad Máxima</div>
              <div className="text-lg font-semibold">{formatPct(n.peak_pct)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Tendencia de popularidad */}
      {decades.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Tendencia de Popularidad</h2>
          <div className="space-y-1">
            {decades.map((d) => {
              const maxPct = Math.max(...decades.map(x => x.pct));
              const width = maxPct > 0 ? (d.pct / maxPct) * 100 : 0;
              return (
                <div key={d.year} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-12">{d.year}</span>
                  <div className="flex-1 h-5 bg-slate-100 rounded overflow-hidden">
                    <div className={`h-full rounded ${n.gender === 'boy' ? 'bg-blue-400' : 'bg-pink-400'}`} style={{ width: `${width}%` }} />
                  </div>
                  <span className="text-xs text-slate-500 w-16 text-right">{formatPct(d.pct)}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Nombres similares */}
      {similar.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Nombres Similares</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {similar.map((s) => (
              <div key={s.slug} className="p-3 rounded-lg border border-slate-200 hover:border-purple-300 text-center">
                <a href={`/es/name/${s.slug}`} className="font-medium hover:underline">{s.name}</a>
                {s.meaning && <div className="text-xs text-slate-400 mt-1">{s.meaning}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="text-xs text-slate-400 mt-8">Fuente: Administración del Seguro Social de EE.UU.</p>
    </div>
  );
}
