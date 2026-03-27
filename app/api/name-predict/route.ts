import { getNameBySlug, getPopularity, getSimilarNames } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name")?.trim();
  if (!name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const slug = name.toLowerCase().replace(/[^a-z]/g, "");
  const record = getNameBySlug(slug);

  if (!record) {
    return Response.json({
      found: false,
      name: name,
      message: `This is a unique name! Less than 0.01% of babies have this name.`,
      similar: [],
    });
  }

  const popularity = getPopularity(slug);
  const similar = getSimilarNames(slug, record.gender, 6);

  // Calculate trend from last 30 years of data
  const recentYears = popularity.filter((p) => p.year >= 1990);
  let trend: "rising" | "falling" | "steady" = "steady";
  let trendPct = 0;

  if (recentYears.length >= 2) {
    const first = recentYears.slice(0, 5);
    const last = recentYears.slice(-5);
    const avgFirst = first.reduce((s, p) => s + p.pct, 0) / first.length;
    const avgLast = last.reduce((s, p) => s + p.pct, 0) / last.length;
    if (avgFirst > 0) {
      trendPct = ((avgLast - avgFirst) / avgFirst) * 100;
    }
    if (trendPct > 15) trend = "rising";
    else if (trendPct < -15) trend = "falling";
  }

  // Current rank approximation from peak_pct
  const latestPop = popularity.length > 0 ? popularity[popularity.length - 1] : null;

  return Response.json({
    found: true,
    name: record.name,
    gender: record.gender,
    origin: record.origin,
    meaning: record.meaning,
    peakYear: record.peak_year,
    peakPct: record.peak_pct,
    currentPct: latestPop?.pct ?? null,
    currentYear: latestPop?.year ?? null,
    trend,
    trendPct: Math.round(trendPct),
    similar: similar.map((s) => ({
      name: s.name,
      slug: s.slug,
      meaning: s.meaning,
    })),
  });
}
