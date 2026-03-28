import { getPopularNames, countNames, getAllOrigins } from "@/lib/db";
import { genderColor } from "@/lib/format";
import { AdSlot } from "@/components/AdSlot";
import { NamePopularityPredictor } from "@/components/NamePopularityPredictor";

export default function Home() {
  const boyNames = getPopularNames("boy", 20);
  const girlNames = getPopularNames("girl", 20);
  const total = countNames();
  const origins = getAllOrigins();
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div>
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-3">Find the Perfect Baby Name</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Explore {total.toLocaleString()}+ baby names with meanings, origins, and popularity trends since 1880.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-center">Browse by Letter</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {letters.map((l) => (
            <a key={l} href={`/names/letter/${l.toLowerCase()}`}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-purple-50 hover:border-purple-300 font-semibold text-sm">
              {l}
            </a>
          ))}
        </div>
      </section>

      <AdSlot id="home-after-letters" />

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <section>
          <h2 className="text-xl font-bold mb-4 text-blue-700">Popular Boy Names</h2>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            {boyNames.map((n, i) => (
              <a key={n.slug} href={`/name/${n.slug}`}
                className="flex justify-between items-center p-3 hover:bg-blue-50 border-b border-slate-100">
                <span className="text-sm"><span className="text-slate-400 mr-2">{i + 1}.</span>{n.name}</span>
                {n.origin && <span className="text-xs text-slate-400">{n.origin}</span>}
              </a>
            ))}
            <a href="/names/gender/boy" className="block p-3 text-center text-blue-600 hover:underline text-sm">View all boy names</a>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-pink-700">Popular Girl Names</h2>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            {girlNames.map((n, i) => (
              <a key={n.slug} href={`/name/${n.slug}`}
                className="flex justify-between items-center p-3 hover:bg-pink-50 border-b border-slate-100">
                <span className="text-sm"><span className="text-slate-400 mr-2">{i + 1}.</span>{n.name}</span>
                {n.origin && <span className="text-xs text-slate-400">{n.origin}</span>}
              </a>
            ))}
            <a href="/names/gender/girl" className="block p-3 text-center text-pink-600 hover:underline text-sm">View all girl names</a>
          </div>
        </section>
      </div>

      <NamePopularityPredictor />

      {origins.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Browse by Origin</h2>
          <div className="flex flex-wrap gap-2">
            {origins.map((o) => (
              <a key={o} href={`/names/origin/${o.toLowerCase()}`}
                className="px-3 py-1 rounded-full border border-slate-200 text-sm hover:bg-purple-50 hover:border-purple-300">
                {o}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
