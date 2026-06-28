import {
  PUBLISHER,
  EDITORIAL_TEAM,
  SOURCE_AUTHORITIES,
  ANALYSIS_VINTAGE,
  DATA_TEMPORAL_COVERAGE_ISO,
  DATA_TEMPORAL_COVERAGE_END,
  SITE_PUBLISHED,
} from './authorship';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nameblooms.com';

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function itemListSchema(name: string, url: string, items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url: `${SITE_URL}${url}`,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: `${SITE_URL}${item.url}`,
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

const SITE_NAME = 'NameBlooms';

export function articleSchema(post: { title: string; description: string; slug: string; urlPath?: string; publishedAt: string; updatedAt?: string; category?: string }) {
  const articlePath = post.urlPath ?? (post.slug.includes('/') ? `/${post.slug.replace(/^\/+|\/+$/g, '')}/` : `/blog/${post.slug}/`);
  const url = `${SITE_URL}${articlePath}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    url,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { '@type': 'Organization', name: EDITORIAL_TEAM.name, url: EDITORIAL_TEAM.url },
    publisher: { '@type': 'Organization', name: PUBLISHER.name, url: PUBLISHER.url },
    mainEntityOfPage: url,
    ...(post.category && { articleSection: post.category }),
  };
}

/**
 * Dataset schema for an SSA name entity page.
 *
 * Modeled as schema.org/Dataset (not Article) because every per-name page is
 * fundamentally a published view of US Social Security Administration data —
 * `creator` is the SSA, `publisher` is DataPeek, `temporalCoverage` is
 * 1880-2024, and the variables measured (annual_count, share_of_births, rank)
 * are real columns in our DB.
 *
 * `dateModified` uses ANALYSIS_VINTAGE (last analytical-table refresh =
 * archetype / cohort / state heatmap recomputation), not build date.
 */
export function nameDatasetSchema(opts: {
  name: string;
  slug: string;
  gender: string;
  peakYear?: number | null;
  peakPct?: number | null;
  backedRowCount?: number;
  /**
   * Phase 7 §3.3 — extra PropertyValue rows surfaced under variableMeasured
   * (NamePopularityVerdict + NameArchetype + BestRecentRank).
   */
  extraVariableMeasured?: ReadonlyArray<Record<string, unknown>>;
}) {
  const url = `${SITE_URL}/name/${opts.slug}/`;
  const peakBit =
    opts.peakYear && opts.peakPct
      ? ` Peaked in ${opts.peakYear} at ${(opts.peakPct * 100).toFixed(2)}% of US ${opts.gender === 'boy' ? 'boy' : opts.gender === 'girl' ? 'girl' : 'baby'} births that year.`
      : '';
  const baseVariableMeasured: ReadonlyArray<Record<string, unknown>> = [
    { '@type': 'PropertyValue', name: 'annual_count', description: 'Number of US babies given this name in a given year.' },
    { '@type': 'PropertyValue', name: 'share_of_births', description: 'Percentage of US births of that gender given this name.' },
    { '@type': 'PropertyValue', name: 'rank', description: 'Annual rank among names of the same gender in the SSA file.' },
  ];
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${opts.name} — US Baby Name Popularity (1880–2024)`,
    description: `Annual count, share of births, and rank of the name ${opts.name} in US Social Security Administration baby-name records, ${DATA_TEMPORAL_COVERAGE_ISO.replace('/', ' through ')}.${peakBit}`,
    url,
    isAccessibleForFree: true,
    // Phase 7 P4 (Trap #110): multi-creator widened from singleton SSA to the
    // 4 authorities the page actually cross-references in TrustBlock. Distinct
    // host TLDs: ssa.gov / census.gov / behindthename.com / wikipedia.org.
    creator: SOURCE_AUTHORITIES,
    publisher: {
      '@type': 'Organization',
      name: PUBLISHER.name,
      url: PUBLISHER.url,
    },
    license: 'https://www.ssa.gov/website-policies/',
    temporalCoverage: DATA_TEMPORAL_COVERAGE_ISO,
    spatialCoverage: 'United States',
    variableMeasured: opts.extraVariableMeasured
      ? [...baseVariableMeasured, ...opts.extraVariableMeasured]
      : baseVariableMeasured,
    citation: SOURCE_AUTHORITIES.map((s) => `${s.name} — ${s.url}`).join('; '),
    datePublished: SITE_PUBLISHED,
    dateModified: ANALYSIS_VINTAGE,
    sameAs: 'https://www.ssa.gov/cgi-bin/popularnames.cgi',
    ...(typeof opts.backedRowCount === 'number' && {
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'backedRowCount',
          value: opts.backedRowCount,
          description: 'Number of (year, count) rows in the SSA national series backing this name page.',
        },
      ],
    }),
  };
}

/**
 * Dataset schema for /state/[slug]/ — per-state SSA name slice.
 *
 * SSA publishes state-level baby-name files (1910–latest) as a separate
 * data product from the national file. backedRowCount surfaces the real
 * row count from state_name_total so reviewers can verify the page is
 * data-backed rather than templated boilerplate.
 */
export function stateDatasetSchema(opts: {
  stateName: string;
  stateSlug: string;
  backedRowCount: number;
  startYear?: number;
  endYear?: number;
}) {
  const url = `${SITE_URL}/state/${opts.stateSlug}/`;
  const start = opts.startYear ?? 1910;
  const end = opts.endYear ?? DATA_TEMPORAL_COVERAGE_END;
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `Baby Name Popularity in ${opts.stateName} (${start}–${end})`,
    description: `Annual count, share of births, and rank of baby names registered in ${opts.stateName} per US Social Security Administration state-level files, ${start} through ${end}.`,
    url,
    isAccessibleForFree: true,
    creator: SOURCE_AUTHORITIES[0],
    publisher: { '@type': 'Organization', name: PUBLISHER.name, url: PUBLISHER.url },
    license: 'https://www.ssa.gov/website-policies/',
    temporalCoverage: `${start}/${end}`,
    spatialCoverage: opts.stateName,
    variableMeasured: [
      { '@type': 'PropertyValue', name: 'annual_count', description: `Number of births given this name in ${opts.stateName} per year.` },
      { '@type': 'PropertyValue', name: 'share_of_births', description: `Percentage of in-state births of that gender given this name.` },
      { '@type': 'PropertyValue', name: 'rank', description: 'Annual rank among names of the same gender within state.' },
    ],
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'application/zip',
      contentUrl: 'https://www.ssa.gov/oact/babynames/state/namesbystate.zip',
    },
    citation: SOURCE_AUTHORITIES.map((s) => `${s.name} — ${s.url}`).join('; '),
    datePublished: SITE_PUBLISHED,
    dateModified: ANALYSIS_VINTAGE,
    sameAs: 'https://www.ssa.gov/oact/babynames/state/',
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'backedRowCount', value: opts.backedRowCount, description: 'Number of (name, year) rows in the state_name_total table backing this page.' },
    ],
  };
}

/**
 * Dataset schema for /trajectory/[archetype]/ — popularity-curve archetypes.
 *
 * Archetypes (modern, vintage, classic, burst, climber, ancient, fading,
 * steady) are computed from the SSA national time series via the
 * archetype-classifier pass. Not a third-party dataset — derived analytics
 * we publish, with the SSA series as the underlying creator.
 */
export function trajectoryDatasetSchema(opts: {
  archetype: string;
  archetypeLabel: string;
  backedRowCount: number;
}) {
  const url = `${SITE_URL}/trajectory/${opts.archetype}/`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${opts.archetypeLabel} Baby-Name Trajectory Cohort (US, 1880–${DATA_TEMPORAL_COVERAGE_END})`,
    description: `Names whose annual share-of-births trajectory matches the "${opts.archetypeLabel}" pattern, classified from US Social Security Administration baby-name files 1880 through ${DATA_TEMPORAL_COVERAGE_END}.`,
    url,
    isAccessibleForFree: true,
    creator: SOURCE_AUTHORITIES[0],
    publisher: { '@type': 'Organization', name: PUBLISHER.name, url: PUBLISHER.url },
    license: 'https://creativecommons.org/licenses/by/4.0/',
    temporalCoverage: DATA_TEMPORAL_COVERAGE_ISO,
    spatialCoverage: 'United States',
    variableMeasured: [
      { '@type': 'PropertyValue', name: 'archetype', description: `Trajectory class assigned by curve-shape classifier (peakYear, peakPct, decay rate).` },
      { '@type': 'PropertyValue', name: 'peak_year', description: 'Year of maximum share_of_births for this name.' },
      { '@type': 'PropertyValue', name: 'peak_pct', description: 'Maximum share_of_births value (decimal).' },
    ],
    citation: SOURCE_AUTHORITIES.map((s) => `${s.name} — ${s.url}`).join('; '),
    datePublished: SITE_PUBLISHED,
    dateModified: ANALYSIS_VINTAGE,
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'backedRowCount', value: opts.backedRowCount, description: 'Number of names classified into this archetype cohort.' },
    ],
  };
}

/**
 * Dataset schema for /names/year/[year]/ — single-year SSA snapshot.
 *
 * Each year is an independent dataset in the SSA file system (yob{YYYY}.txt).
 */
export function yearDatasetSchema(opts: {
  year: number;
  backedRowCount: number;
}) {
  const url = `${SITE_URL}/names/year/${opts.year}/`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `US Baby Name Popularity — Year ${opts.year}`,
    description: `All baby names with at least 5 occurrences in US Social Security Administration records for year ${opts.year}, with annual count, share of births, and rank.`,
    url,
    isAccessibleForFree: true,
    creator: SOURCE_AUTHORITIES[0],
    publisher: { '@type': 'Organization', name: PUBLISHER.name, url: PUBLISHER.url },
    license: 'https://www.ssa.gov/website-policies/',
    temporalCoverage: `${opts.year}`,
    spatialCoverage: 'United States',
    variableMeasured: [
      { '@type': 'PropertyValue', name: 'annual_count', description: `Births of this name in ${opts.year}.` },
      { '@type': 'PropertyValue', name: 'share_of_births', description: 'Percentage of US births of that gender for this name.' },
      { '@type': 'PropertyValue', name: 'rank', description: `Rank within ${opts.year} for the same gender.` },
    ],
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'text/plain',
      contentUrl: `https://www.ssa.gov/oact/babynames/names.zip`,
    },
    citation: SOURCE_AUTHORITIES.map((s) => `${s.name} — ${s.url}`).join('; '),
    datePublished: SITE_PUBLISHED,
    dateModified: ANALYSIS_VINTAGE,
    sameAs: `https://www.ssa.gov/cgi-bin/popularnames.cgi`,
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'backedRowCount', value: opts.backedRowCount, description: `Number of name rows backing the ${opts.year} dataset.` },
    ],
  };
}
