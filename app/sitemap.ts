import type { MetadataRoute } from "next";
import { getAllNames, getTopComparisons, getTopNamesForMiddleNames } from "@/lib/db";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nameblooms.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const names = getAllNames();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1.0 },
    { url: `${SITE_URL}/compare`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/names/gender/boy`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/names/gender/girl`, changeFrequency: "monthly", priority: 0.9 },
  ];

  // Letter pages
  const letters = "abcdefghijklmnopqrstuvwxyz".split("").map((l) => ({
    url: `${SITE_URL}/names/letter/${l}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Name pages
  const namePages: MetadataRoute.Sitemap = names.map((n) => ({
    url: `${SITE_URL}/name/${n.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Comparison pages
  const comparisons = getTopComparisons(5000);
  const comparePages: MetadataRoute.Sitemap = comparisons.map((p) => {
    const [a, b] = [p.slugA, p.slugB].sort();
    return { url: `${SITE_URL}/compare/${a}-vs-${b}`, changeFrequency: "monthly" as const, priority: 0.5 };
  });

  // Middle name pages
  const middleNames = getTopNamesForMiddleNames(10000);
  const middlePages: MetadataRoute.Sitemap = middleNames.map((n) => ({
    url: `${SITE_URL}/middle-names/${n.slug}/`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...letters, ...namePages, ...comparePages, ...middlePages];
}
