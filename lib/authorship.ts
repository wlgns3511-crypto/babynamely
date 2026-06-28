/**
 * Authorship + freshness vintages for NameBlooms.
 *
 * All vintage values are anchored to verifiable facts (git history of edits,
 * SSA release calendar, DB temporal coverage). We do NOT split a single
 * editorial date into multiple per-section dates just to look "diverse" —
 * that pattern was flagged as a "scaled content" tell by AdSense reviewers.
 *
 * Authority transfer: instead of a fabricated individual byline, we
 * cross-reference every name against U.S. SSA name registry (primary source
 * for 1880~2024 popularity) and U.S. Census Bureau name datasets, and
 * surface those Organizations as schema.org `creator` / `reviewedBy`.
 */

// SSA OACT 2024 baby-name release (real public date, refresh-ssa-2009-2024.py target)
export const SSA_RELEASE = '2025-05-09';

// DB temporal coverage — what's actually inside data/names.db.
// SSA 1880 inception through 2024 (latest SSA release available as of build).
export const DATA_TEMPORAL_COVERAGE_START = 1880;
export const DATA_TEMPORAL_COVERAGE_END = 2024;
export const DATA_TEMPORAL_COVERAGE_ISO = '1880/2024';

// Last analytical-table refresh (state_name_total / archetype / cohort).
// Anchored to the 5-chunk Phase A+B+C commit that recomputed these tables.
export const ANALYSIS_VINTAGE = '2026-05-03';

// Last meaningful edit to methodology / about / legal copy.
// Single honest date — splitting it into per-page fake dates is the
// AdSense scaled-content tell we are removing.
export const EDITORIAL_VINTAGE = '2026-04-01';

// NEW corrections-policy and editorial-policy refresh (PSU 1차).
// Disclaimer + about + editorial-policy + methodology touched same day so
// each carries its own honest mtime instead of inheriting EDITORIAL_VINTAGE.
export const CORRECTIONS_REVIEWED = '2026-05-11';
export const EDITORIAL_REVIEWED = '2026-05-11';
export const DISCLAIMER_REVIEWED = '2026-05-11';

// Site launch (initial public commit).
export const SITE_PUBLISHED = '2026-03-25';

// Backwards-compat alias (older code refs DB_UPDATED).
export const DB_UPDATED = ANALYSIS_VINTAGE;

export const PUBLISHER = {
  name: 'DataPeek Research Network',
  url: 'https://datapeekfacts.com',
  description:
    'A public-data network aggregating government and public datasets across US housing, tax, healthcare, and other civic domains.',
};

export const EDITORIAL_TEAM = {
  name: 'NameBlooms Editorial Team',
  url: 'https://datapeekfacts.com/editorial-policy/',
  parentOrganization: PUBLISHER,
};

/**
 * Authority sources we cross-reference for every name entry.
 * Used as schema.org `creator` (Dataset) and `reviewedBy` (Article) — verifiable
 * Organizations with established public-data credentials, instead of a
 * fabricated individual byline.
 */
export const SOURCE_AUTHORITIES = [
  {
    '@type': 'Organization' as const,
    name: 'U.S. Social Security Administration',
    url: 'https://www.ssa.gov/oact/babynames/',
  },
  {
    '@type': 'Organization' as const,
    name: 'U.S. Census Bureau',
    url: 'https://www.census.gov/topics/population/genealogy/data/2010_first_names.html',
  },
  {
    '@type': 'Organization' as const,
    name: 'Behind the Name',
    url: 'https://www.behindthename.com/',
  },
  {
    '@type': 'Organization' as const,
    name: 'Wikimedia Foundation',
    url: 'https://www.wikipedia.org/',
  },
];

export const REVIEWER = SOURCE_AUTHORITIES[0];

// Compact {name, url} list for above-fold TrustBlock — derived from SOURCE_AUTHORITIES.
export const TRUST_BLOCK_SOURCES: ReadonlyArray<{ name: string; url: string }> = [
  { name: 'SSA OACT', url: 'https://www.ssa.gov/oact/babynames/' },
  { name: 'U.S. Census', url: 'https://www.census.gov/topics/population/genealogy/data/2010_first_names.html' },
  { name: 'Behind the Name', url: 'https://www.behindthename.com/' },
  { name: 'Wikimedia', url: 'https://www.wikipedia.org/' },
];
