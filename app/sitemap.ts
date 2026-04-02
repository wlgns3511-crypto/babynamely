import type { MetadataRoute } from "next";
import { getAllNames, getTopComparisons, getRotatingComparisons, getTopNamesForMiddleNames } from "@/lib/db";
import { getAllPosts } from "@/lib/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nameblooms.com";

export const revalidate = false;

export default function sitemap(): MetadataRoute.Sitemap {
  const names = getAllNames();
  const posts = getAllPosts();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1.0 },
    { url: `${SITE_URL}/compare/`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/names/gender/boy/`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/names/gender/girl/`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/about/`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy/`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/terms/`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/contact/`, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Letter pages
  const letters = "abcdefghijklmnopqrstuvwxyz".split("").map((l) => ({
    url: `${SITE_URL}/names/letter/${l}/`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Name pages
  const namePages: MetadataRoute.Sitemap = names.map((n) => ({
    url: `${SITE_URL}/name/${n.slug}/`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Comparison pages: 80% stable core + 20% weekly rotation
  const stableComparisons = getTopComparisons(24000);
  const rotatingComps = getRotatingComparisons(6000);
  const compSet = new Set(stableComparisons.map(p => `${p.slugA}|${p.slugB}`));
  const deduped = rotatingComps.filter(p => !compSet.has(`${p.slugA}|${p.slugB}`));
  const allComparisons = [...stableComparisons, ...deduped];
  const comparePages: MetadataRoute.Sitemap = allComparisons.map((p) => {
    const [a, b] = [p.slugA, p.slugB].sort();
    return { url: `${SITE_URL}/compare/${a}-vs-${b}/`, changeFrequency: "monthly" as const, priority: 0.5 };
  });

  // Middle name pages
  const middleNames = getTopNamesForMiddleNames(5000);
  const middlePages: MetadataRoute.Sitemap = middleNames.map((n) => ({
    url: `${SITE_URL}/middle-names/${n.slug}/`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const entries: MetadataRoute.Sitemap = [
    ...staticPages,
    { url: `${SITE_URL}/blog/`, changeFrequency: "weekly" as const, priority: 0.8 },
    ...posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}/`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      lastModified: p.updatedAt ?? p.publishedAt,
    })),
    ...letters,
    ...namePages,
    ...comparePages,
    ...middlePages,
  ];

  // Safety: Google limit is 50,000 URLs per sitemap
  if (entries.length > 50000) {
    return entries.slice(0, 50000);
  }

  return entries;
}
