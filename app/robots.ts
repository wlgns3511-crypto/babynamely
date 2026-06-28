import type { MetadataRoute } from "next";

// NOTE: public/robots.txt overrides this dynamic route in production
// (Next.js precedence: static public file wins). Keep both in sync in case
// the static file is ever removed. Source of truth: public/robots.txt.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 2026-04-28 — scaled-content tree exclusions (AdSense remediation).
      // See public/robots.txt header comment for the full rationale.
      { userAgent: "*", allow: "/", disallow: ["/api/", "/_next/", "/middle-names/"] },
      { userAgent: "Mediapartners-Google", disallow: ["/middle-names/"] },
      { userAgent: "AdsBot-Google", disallow: ["/middle-names/"] },
      { userAgent: "AhrefsBot", disallow: ["/"] },
      { userAgent: "SemrushBot", disallow: ["/"] },
      { userAgent: "MJ12bot", disallow: ["/"] },
      { userAgent: "DotBot", disallow: ["/"] },
      { userAgent: "PetalBot", disallow: ["/"] },
      { userAgent: "BLEXBot", disallow: ["/"] },
      { userAgent: "DataForSeoBot", disallow: ["/"] },
      { userAgent: "GPTBot", disallow: ["/"] },
      { userAgent: "CCBot", disallow: ["/"] },
    ],
    sitemap: "https://nameblooms.com/sitemap.xml",
  };
}
