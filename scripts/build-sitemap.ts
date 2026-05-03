#!/usr/bin/env tsx
/**
 * build-sitemap.ts — nameblooms static sitemap generator.
 *
 * PRUNING HISTORY (post-HCU March 2026):
 *   Pre-prune: ~20,676 URLs. Dominated by:
 *     → /name/[slug]        × 6,782 (real SSA-verified name entities — KEEP)
 *     → /es/name/[slug]     × 6,782 (thin Spanish translation — still DROP)
 *     → /middle-names/[slug] × 6,782 (REVIVED 2026-04-24 — see below)
 *
 *   2026-04-22: Option B+ prune (conservative). DROP /es/name/ + /middle-names/.
 *
 *   2026-04-24: REVIVED /middle-names/. GSC data showed "middle names for {X}"
 *              is the top query pattern actually driving traffic — dropping it
 *              was strategic error. Content is not thin (20 curated suggestions
 *              + tips + FAQ schema). All 6,782 now back in sitemap. /es/name/
 *              stays dropped pending separate Spanish market evaluation.
 *
 * USAGE:
 *   npx tsx scripts/build-sitemap.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import Database from 'better-sqlite3';
import {
  countNames,
  getAllOrigins,
  getAvailableYears,
  getNameSlugsPage,
} from '../lib/db';
import { getAllPosts } from '../lib/blog';
import { getAllStates } from '../lib/states-data';
import { getAllInsightArticles } from '../lib/insight-articles';
import { getAllGuides } from '../lib/guides';

const SITE_URL = 'https://nameblooms.com';
const NOW = new Date().toISOString().split('T')[0];
const SHARD_SIZE = 40000;
const OUT_DIR = path.resolve(__dirname, '..', 'public');

interface Entry { url: string; lastmod?: string; priority?: string; changefreq?: string; }
function urlTag(e: Entry): string {
  return `  <url><loc>${e.url}</loc><lastmod>${e.lastmod ?? NOW}</lastmod><changefreq>${e.changefreq ?? 'monthly'}</changefreq><priority>${e.priority ?? '0.6'}</priority></url>`;
}
function writeShard(id: number, entries: Entry[]) {
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + entries.map(urlTag).join('\n') + '\n</urlset>\n';
  fs.writeFileSync(path.join(OUT_DIR, `sitemap-${id}.xml`), xml);
}

const seen = new Set<string>();
const entries: Entry[] = [];
function add(e: Entry) { if (!seen.has(e.url)) { seen.add(e.url); entries.push(e); } }

// Static pages
add({ url: `${SITE_URL}/`, priority: '1.0', changefreq: 'monthly' });
add({ url: `${SITE_URL}/compare/`, priority: '0.9', changefreq: 'monthly' });
add({ url: `${SITE_URL}/names/gender/boy/`, priority: '0.9', changefreq: 'monthly' });
add({ url: `${SITE_URL}/names/gender/girl/`, priority: '0.9', changefreq: 'monthly' });
add({ url: `${SITE_URL}/about/`, priority: '0.5', changefreq: 'monthly' });
add({ url: `${SITE_URL}/privacy/`, priority: '0.3', changefreq: 'monthly' });
add({ url: `${SITE_URL}/terms/`, priority: '0.3', changefreq: 'monthly' });
add({ url: `${SITE_URL}/contact/`, priority: '0.5', changefreq: 'monthly' });
add({ url: `${SITE_URL}/disclaimer/`, priority: '0.3', changefreq: 'monthly' });
add({ url: `${SITE_URL}/methodology/`, priority: '0.5', changefreq: 'monthly' });
add({ url: `${SITE_URL}/editorial-policy/`, priority: '0.5', changefreq: 'monthly' });
// 2026-04-28 /es/ removed — consistency fix. The full /es/name/* subtree is
// noindex+follow (AdSense scaled-content remediation). A dead-end portal that
// links exclusively to noindex pages should not be announced in sitemap.
// Kept as comment for audit trail. Restore alongside Spanish v2 commentary
// when /es/name/ goes back to indexable.
// add({ url: `${SITE_URL}/es/`, priority: '0.6', changefreq: 'monthly' });

// Guide pages
add({ url: `${SITE_URL}/guide/`, priority: '0.8', changefreq: 'weekly' });
for (const g of getAllGuides()) {
  add({ url: `${SITE_URL}/guide/${g.slug}/`, lastmod: g.updatedAt || NOW, priority: '0.7', changefreq: 'monthly' });
}

// Blog pages
add({ url: `${SITE_URL}/blog/`, priority: '0.8', changefreq: 'weekly' });
for (const p of getAllPosts()) {
  add({ url: `${SITE_URL}/blog/${p.slug}/`, lastmod: p.updatedAt ?? p.publishedAt, priority: '0.7', changefreq: 'monthly' });
}

// Alphabet letter pages
for (const l of 'abcdefghijklmnopqrstuvwxyz'.split('')) {
  add({ url: `${SITE_URL}/names/letter/${l}/`, priority: '0.8', changefreq: 'monthly' });
}

// Compare pages excluded from sitemap (2026-04-18)
// HCU doorway-thin content + scaled-content risk. Pages still render via
// generateStaticParams (CAP=100); just not announced in sitemap.

// ─── /middle-names/[slug] × 6,782 RE-DROPPED 2026-04-26 ──────────────────
// 2026-04-22: dropped (thin scaled content concern).
// 2026-04-24: REVIVED based on GSC query data (top queries = "middle names
//             for X"). Strategic reversal — assumed traffic value > thin-
//             content risk.
// 2026-04-26: AdSense policy violation received ("광고 게재가 준비되지
//             않은 사이트 / 가치가 별로 없는 콘텐츠"). The 2026-04-24 reversal
//             was the wrong call — 6,782 derivative pages × ~1,400 words each
//             (20 name-combo grid + 3-Q FAQ template) is exactly the
//             "scaled content abuse" pattern Google now penalizes harder
//             than thin-content historically did.
// Decision: re-drop from sitemap + add noindex meta in page.tsx. Routes still
// render (UX preserved for direct visitors) but Google sees neither sitemap
// announcement nor index allowance. ~6,782 URLs removed from announcement.
// Block intentionally retained as comment for audit trail / future revival
// guard rail.
//
// const nbDbForMiddle = new Database(path.resolve(__dirname, '..', 'data', 'names.db'), { readonly: true, fileMustExist: true });
// const middleNameRows = nbDbForMiddle.prepare('SELECT slug FROM names ORDER BY slug').all() as { slug: string }[];
// nbDbForMiddle.close();
// for (const n of middleNameRows) {
//   add({ url: `${SITE_URL}/middle-names/${n.slug}/`, priority: '0.65', changefreq: 'monthly' });
// }

// Insights
add({ url: `${SITE_URL}/insights/`, priority: '0.8', changefreq: 'weekly' });
for (const a of getAllInsightArticles()) {
  add({ url: `${SITE_URL}/insights/${a.slug}/`, lastmod: a.date, priority: '0.8', changefreq: 'monthly' });
}

// State pages
add({ url: `${SITE_URL}/state/`, priority: '0.8', changefreq: 'monthly' });
for (const s of getAllStates()) {
  add({ url: `${SITE_URL}/state/${s.slug}/`, priority: '0.7', changefreq: 'monthly' });
}

// State top-names-by-decade pages (51 — Tier S HCU expansion 2026-04-21)
for (const s of getAllStates()) {
  add({ url: `${SITE_URL}/state/${s.slug}/top-names-by-decade/`, priority: '0.7', changefreq: 'monthly' });
}

// Origin pages
for (const origin of getAllOrigins()) {
  add({ url: `${SITE_URL}/names/origin/${origin.toLowerCase()}/`, priority: '0.7', changefreq: 'monthly' });
}

// Year pages — mirrors names/year generateStaticParams selection
const selectedYears = getAvailableYears().filter((year) => year % 10 === 0 || year >= 2000);
for (const year of selectedYears) {
  add({ url: `${SITE_URL}/names/year/${year}/`, priority: '0.6', changefreq: 'monthly' });
}

// Name pages (paginated, matches getNameSlugsPage pattern)
// /es/name/ × 6,782 DROPPED 2026-04-22 — thin Spanish translation.
const totalNames = countNames();
const NAME_PAGE = 40000;
for (let offset = 0; offset < totalNames; offset += NAME_PAGE) {
  for (const n of getNameSlugsPage(offset, NAME_PAGE)) {
    add({ url: `${SITE_URL}/name/${n.slug}/`, priority: '0.7', changefreq: 'monthly' });
  }
}

// Name by-decade deep-dive (top 100 by peak_pct — Tier S HCU Batch 9 2026-04-21)
const nbDb = new Database(path.resolve(__dirname, '..', 'data', 'names.db'), { readonly: true, fileMustExist: true });
const top100ByDecade = nbDb.prepare('SELECT slug FROM names WHERE peak_pct IS NOT NULL ORDER BY peak_pct DESC LIMIT 100').all() as { slug: string }[];
nbDb.close();
for (const n of top100ByDecade) {
  add({ url: `${SITE_URL}/name/${n.slug}/by-decade/`, priority: '0.75', changefreq: 'monthly' });
}

// Trajectory archetype hubs — Phase B 2026-05-03 (8 archetypes + 1 index = 9 URLs)
add({ url: `${SITE_URL}/trajectory/`, priority: '0.85', changefreq: 'monthly' });
const ARCHETYPES_FOR_SITEMAP = ['modern', 'vintage', 'classic', 'burst', 'climber', 'ancient', 'fading', 'steady'];
for (const a of ARCHETYPES_FOR_SITEMAP) {
  add({ url: `${SITE_URL}/trajectory/${a}/`, priority: '0.8', changefreq: 'monthly' });
}

// ─── Cardinality guard ────────────────────────────────────────────────────
// 2026-04-24: budget raised 8.5K → 15K after middle-names revival.
// 2026-04-26: budget restored 15K → 8.5K after middle-names re-drop
//             (AdSense policy violation triggered re-evaluation).
// 2026-05-03: +9 trajectory hubs (Phase B). Budget unchanged 8.5K (slack ample).
// /name/ (6,782) + hubs/guides/blog/state/origin/year (~500) + trajectory (9) ≈ 7.3K.
// If this trips, suspect /middle-names/ (6,782) or /es/name/ (6,782) accidentally re-added.
if (entries.length > 8500 && !process.env.SITEMAP_LARGE_OK) {
  throw new Error(
    `nameblooms sitemap has ${entries.length.toLocaleString()} URLs — budget is 8.5K after 2026-04-26 middle-names re-drop.\n` +
      `Did /middle-names/ (6,782) or /es/name/ (6,782) get re-added? Both are scaled-content traps.\n` +
      `Run with SITEMAP_LARGE_OK=1 if you genuinely meant to expand further.`,
  );
}

// Clean old sitemap files
for (const f of fs.readdirSync(OUT_DIR)) {
  if (/^sitemap(-\d+)?\.xml$/.test(f)) fs.unlinkSync(path.join(OUT_DIR, f));
}
const oldDir = path.join(OUT_DIR, 'sitemap');
if (fs.existsSync(oldDir)) fs.rmSync(oldDir, { recursive: true, force: true });

const shardCount = Math.ceil(entries.length / SHARD_SIZE);
if (shardCount <= 1) {
  writeShard(0, entries);
  fs.renameSync(path.join(OUT_DIR, 'sitemap-0.xml'), path.join(OUT_DIR, 'sitemap.xml'));
} else {
  for (let i = 0; i < shardCount; i++) writeShard(i, entries.slice(i * SHARD_SIZE, (i + 1) * SHARD_SIZE));
  const idx = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    Array.from({ length: shardCount }, (_, i) => `  <sitemap><loc>${SITE_URL}/sitemap-${i}.xml</loc><lastmod>${NOW}</lastmod></sitemap>`).join('\n') + '\n</sitemapindex>\n';
  fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), idx);
}
console.log(`✓ ${entries.length} URLs, ${shardCount || 1} shard(s)`);
