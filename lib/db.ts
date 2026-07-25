import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'names.db');
let _db: Database.Database | null = null;
let _nameKeepSet: Set<string> | null = null;
let _keptNames: BabyName[] | null = null;

function getNameKeepSet(): Set<string> {
  if (!_nameKeepSet) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    _nameKeepSet = new Set(require('./generated/name-keep.json') as string[]);
  }
  return _nameKeepSet;
}

function getKeptNames(): BabyName[] {
  if (!_keptNames) {
    _keptNames = [...getNameKeepSet()]
      .map((slug) => getNameBySlug(slug))
      .filter((name): name is BabyName => name != null);
  }
  return _keptNames;
}

function byPeakPctDesc(a: BabyName, b: BabyName): number {
  return (b.peak_pct ?? 0) - (a.peak_pct ?? 0);
}

function getDb(): Database.Database {
  if (_db) {
    try {
      // 연결이 살아있는지 확인
      _db.prepare('SELECT 1').get();
      return _db;
    } catch {
      _db = null;
    }
  }
  _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  return _db;
}

export interface BabyName {
  slug: string;
  name: string;
  gender: string;
  origin: string | null;
  meaning: string | null;
  peak_year: number | null;
  peak_pct: number | null;
  total_records: number;
}

export interface PopularityRow {
  slug: string;
  year: number;
  pct: number;
}

export interface ComparisonPair {
  slugA: string;
  slugB: string;
  nameA: string;
  nameB: string;
}

export const COMPARISON_PRERENDER_LIMIT = 100;

// --- Name queries ---

export function getNameBySlug(slug: string): BabyName | undefined {
  return getDb().prepare('SELECT * FROM names WHERE slug = ?').get(slug) as BabyName | undefined;
}

export function getAllNames(): BabyName[] {
  return [...getKeptNames()].sort((a, b) => a.name.localeCompare(b.name));
}

export function getPopularNames(gender: string, limit = 50): BabyName[] {
  return getKeptNames().filter((name) => name.gender === gender).sort(byPeakPctDesc).slice(0, limit);
}

export function getNamesByLetter(letter: string): BabyName[] {
  return getKeptNames()
    .filter((name) => name.slug.startsWith(letter.toLowerCase()))
    .sort(byPeakPctDesc);
}

export function getNamesByOrigin(origin: string): BabyName[] {
  return getKeptNames().filter((name) => name.origin === origin).sort(byPeakPctDesc);
}

export function getAllOrigins(): string[] {
  const rows = getDb().prepare(`
    SELECT DISTINCT origin FROM names WHERE origin IS NOT NULL ORDER BY origin
  `).all() as { origin: string }[];
  return rows.map(r => r.origin);
}

// --- Popularity ---

export function getPopularity(slug: string): PopularityRow[] {
  return getDb().prepare(`
    SELECT * FROM popularity WHERE slug = ? ORDER BY year
  `).all(slug) as PopularityRow[];
}

// getTopNamesForYear() / getAvailableYears() 삭제 2026-07-26.
// 연도 페이지는 lib/roster.ts 의 getYearRoster()/getRosterYears() 를 쓴다.
// 전자는 keep-set 교집합 후 top-N 절단이라, 그 해 순위가 붙은 이름의 대부분을
// 페이지에서 지우고 있었다(2024년 5,925 → 50). 되살려 쓰지 말 것.

// --- Similar names ---

export function getSimilarNames(slug: string, gender: string, limit = 10): BabyName[] {
  // Names with similar starting letters and same gender
  const prefix = slug.substring(0, 3);
  return getKeptNames()
    .filter((name) => name.gender === gender && name.slug !== slug && name.slug.startsWith(prefix))
    .sort(byPeakPctDesc)
    .slice(0, limit);
}

// --- Comparisons ---

function hasComparisonsTable(): boolean {
  const row = getDb().prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='comparisons'"
  ).get();
  return !!row;
}

export function getTopComparisons(limit = 2000): ComparisonPair[] {
  if (hasComparisonsTable()) {
    return getDb().prepare(`
      SELECT slugA, slugB, nameA, nameB FROM comparisons
      ORDER BY popularity_score DESC
      LIMIT ?
    `).all(limit) as ComparisonPair[];
  }

  // Fallback: generate pairs from top names (legacy)
  const topNames = getDb().prepare(`
    SELECT slug, name FROM names ORDER BY peak_pct DESC LIMIT 200
  `).all() as { slug: string; name: string }[];

  const pairs: ComparisonPair[] = [];
  for (let i = 0; i < topNames.length && pairs.length < limit; i++) {
    for (let j = i + 1; j < topNames.length && pairs.length < limit; j++) {
      if (topNames[i].slug < topNames[j].slug) {
        pairs.push({ slugA: topNames[i].slug, slugB: topNames[j].slug, nameA: topNames[i].name, nameB: topNames[j].name });
      } else {
        pairs.push({ slugA: topNames[j].slug, slugB: topNames[i].slug, nameA: topNames[j].name, nameB: topNames[i].name });
      }
    }
  }
  return pairs;
}

export function getAllComparisons(): ComparisonPair[] {
  if (hasComparisonsTable()) {
    return getDb().prepare(`
      SELECT slugA, slugB, nameA, nameB FROM comparisons
      ORDER BY popularity_score DESC
    `).all() as ComparisonPair[];
  }
  return getTopComparisons(200000);
}

export function getComparisonCount(): number {
  if (!hasComparisonsTable()) return 0;
  return (getDb().prepare('SELECT COUNT(*) as c FROM comparisons').get() as { c: number }).c;
}

let _staticComparisons: ComparisonPair[] | null = null;
let _staticComparisonPairSet: Set<string> | null = null;

function normalizeComparisonPair(slugA: string, slugB: string): string {
  return slugA < slugB ? `${slugA}|${slugB}` : `${slugB}|${slugA}`;
}

function toStaticComparisonPair(pair: ComparisonPair): ComparisonPair {
  if (pair.slugA < pair.slugB) return pair;
  return {
    slugA: pair.slugB,
    slugB: pair.slugA,
    nameA: pair.nameB,
    nameB: pair.nameA,
  };
}

export function getStaticComparisons(limit = COMPARISON_PRERENDER_LIMIT): ComparisonPair[] {
  if (!_staticComparisons) {
    // HCU 2026-04-24: source of truth = scripts/build-keep-sets.ts JSON dump.
    // Includes top-100 DB slice (popularity_score DESC) + GSC evidence union
    // (4 URLs earning ≥1 click that popularity ordering alone would drop —
    // same pattern that killed 100% of earners on degreewize/zippeek/
    // guidebycity cleanups, must prevent here). Rebuild via
    // `npx tsx scripts/build-keep-sets.ts` before deploy.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const keepList = require('./generated/compare-keep.json') as string[];
    _staticComparisons = keepList.map((slugs) => {
      const idx = slugs.lastIndexOf('-vs-');
      const slugA = slugs.slice(0, idx);
      const slugB = slugs.slice(idx + 4);
      const nameA = getNameBySlug(slugA)?.name ?? slugA;
      const nameB = getNameBySlug(slugB)?.name ?? slugB;
      return { slugA, slugB, nameA, nameB };
    });
  }
  return _staticComparisons.slice(0, limit);
}

export function isStaticComparisonPair(slugA: string, slugB: string): boolean {
  if (!_staticComparisonPairSet) {
    _staticComparisonPairSet = new Set(
      getStaticComparisons().map((pair) => normalizeComparisonPair(pair.slugA, pair.slugB))
    );
  }
  return _staticComparisonPairSet.has(normalizeComparisonPair(slugA, slugB));
}

export function getStaticComparisonHref(slugA: string, slugB: string): string | null {
  if (!isStaticComparisonPair(slugA, slugB)) return null;
  const [a, b] = slugA < slugB ? [slugA, slugB] : [slugB, slugA];
  return `/compare/${a}-vs-${b}/`;
}

export function getStaticComparisonsForSlug(slug: string, limit = 12): ComparisonPair[] {
  return getStaticComparisons().filter((pair) => pair.slugA === slug || pair.slugB === slug).slice(0, limit);
}

// --- Middle names ---
//
// 2026-07-24 재건. 옛 로직은 "성별당 peak_pct top-20 을 그대로" 반환해서 first name 이
// 뭐든 리스트가 사실상 동일했다(kaitlyn≡elaine Jaccard 1.00) — 1,513 페이지가 실질 2종인
// 도어웨이라 애드센스 scaled-content 로 죽었다. 이제 first name 자체의 속성으로 점수를 매겨
// 리스트가 실제로 달라진다(데모: 동성별 쌍 Jaccard 0.00):
//   1) 리듬: 음절 수가 다르면(특히 ±1) 잘 흐른다 — first 의 음절 수에 의존
//   2) 끝소리 충돌 회피: 미들이 first 의 마지막 글자로 시작하면 뭉갠다(Dean Nathan)
//   3) 시대 조화: SSA peak_year 가 가까울수록 스타일이 어울린다 — first 의 연대에 의존
//   4) 친숙도: 인기 이름을 작은 타이브레이커로만 (지배하지 않게)
// prerender 는 수요(Bing)∩keep-set 상위 100 만(lib/generated/middle-names-keep.json,
// 근거 ops/middle-names-410-snapshot.json). 나머지 슬러그는 미들웨어 410 유지.

export function countSyllables(word: string): number {
  word = word.toLowerCase().trim();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|[^laeiouy]ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function middleNamePairScore(first: BabyName, cand: BabyName): number {
  const fs = countSyllables(first.name);
  const cs = countSyllables(cand.name);
  const rhythm = fs === cs ? -20 : Math.abs(fs - cs) === 1 ? 25 : 12;
  const era =
    first.peak_year && cand.peak_year
      ? Math.max(0, 40 - Math.abs(first.peak_year - cand.peak_year) / 4)
      : 0;
  const familiar = (cand.peak_pct ?? 0) * 60; // peak_pct ≤~0.08 → ≤5, 순위 지배 못 하는 타이브레이커
  return rhythm + era + familiar;
}

export function getMiddleNameSuggestions(firstName: BabyName, limit = 20): BabyName[] {
  const firstLetter = firstName.slug.charAt(0);
  const lastLetter = firstName.name.charAt(firstName.name.length - 1).toLowerCase();
  return getKeptNames()
    .filter(
      (name) =>
        name.gender === firstName.gender &&
        name.slug !== firstName.slug &&
        !name.slug.startsWith(firstLetter) && // 두운(같은 첫 글자) 회피
        name.name.charAt(0).toLowerCase() !== lastLetter, // 끝소리 충돌 회피
    )
    .sort((a, b) => middleNamePairScore(firstName, b) - middleNamePairScore(firstName, a))
    .slice(0, limit);
}

let _middleNameKeepSet: Set<string> | null = null;
function getMiddleNameKeepSet(): Set<string> {
  if (!_middleNameKeepSet) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    _middleNameKeepSet = new Set(require('./generated/middle-names-keep.json') as string[]);
  }
  return _middleNameKeepSet;
}

/** prerender 대상(수요∩keep 상위 100) — page generateStaticParams + 미들웨어 410 경계와 동일 세트 */
export function getStaticMiddleNameSlugs(): { slug: string }[] {
  return [...getMiddleNameKeepSet()].map((slug) => ({ slug }));
}

/** 재건된 미들네임 페이지끼리만 상호 링크(죽은 링크 방지 — 살아있는 100개 안에서만). */
export function getRelatedMiddleNames(slug: string, gender: string, limit = 6): BabyName[] {
  const set = getMiddleNameKeepSet();
  return getKeptNames()
    .filter((name) => set.has(name.slug) && name.gender === gender && name.slug !== slug)
    .sort(byPeakPctDesc)
    .slice(0, limit);
}

// --- Counts ---

export function countNames(): number {
  return (getDb().prepare('SELECT COUNT(*) as c FROM names').get() as { c: number }).c;
}

export function getNameSlugsPage(offset: number, limit: number): { slug: string }[] {
  return getDb().prepare('SELECT slug FROM names ORDER BY peak_pct DESC, name ASC LIMIT ? OFFSET ?').all(limit, offset) as { slug: string }[];
}

let _staticNameSlugs: { slug: string }[] | null = null;

// HCU 2026-07-03: source of truth = scripts/build-keep-sets.ts JSON dump
// (top-1500 by peak_pct ∪ Bing-evidence union), shared with middleware.ts
// (410 outside set) and scripts/build-sitemap.ts — same three-consumer
// pattern as compare-keep.json above. Rebuild via
// `npx tsx scripts/build-keep-sets.ts` before deploy.
export function getStaticNameSlugs(): { slug: string }[] {
  if (!_staticNameSlugs) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const keepList = require('./generated/name-keep.json') as string[];
    _staticNameSlugs = keepList.map((slug) => ({ slug }));
  }
  return _staticNameSlugs;
}

export function getPopularBoyNames(limit = 10): BabyName[] {
  return getKeptNames().filter((name) => name.gender === 'boy').sort(byPeakPctDesc).slice(0, limit);
}

export function getPopularGirlNames(limit = 10): BabyName[] {
  return getKeptNames().filter((name) => name.gender === 'girl').sort(byPeakPctDesc).slice(0, limit);
}

export function getNamesBySameOrigin(slug: string, origin: string | null, gender: string, limit = 6): BabyName[] {
  if (!origin) return [];
  return getKeptNames()
    .filter((name) => name.origin === origin && name.gender === gender && name.slug !== slug)
    .sort(byPeakPctDesc)
    .slice(0, limit);
}

export function getPopularNamesByGender(gender: string, excludeSlug: string, limit = 6): BabyName[] {
  return getKeptNames()
    .filter((name) => name.gender === gender && name.slug !== excludeSlug)
    .sort(byPeakPctDesc)
    .slice(0, limit);
}

export function getRandomNames(limit = 20): BabyName[] {
  return [...getKeptNames()].sort(() => Math.random() - 0.5).slice(0, limit);
}

/** Get current ISO week number (1-52) */
export function getCurrentWeek(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.ceil((diff / oneWeek + start.getDay() + 1) / 7);
}

// --- National stats for insight comparisons ---

export function getNameStats(): {
  totalNames: number;
  avgPeakPct: number | null;
} {
  return getDb().prepare(`
    SELECT COUNT(*) as totalNames, AVG(peak_pct) as avgPeakPct FROM names
  `).get() as { totalNames: number; avgPeakPct: number | null };
}

export function getNameRank(slug: string): number | null {
  const row = getDb().prepare(`
    SELECT COUNT(*) + 1 as rank FROM names WHERE peak_pct > (SELECT peak_pct FROM names WHERE slug = ?)
  `).get(slug) as { rank: number } | undefined;
  return row?.rank ?? null;
}

// Peer names by peak_pct (one higher, one lower), same gender. Used for metadata peer comparisons.
export function getNamePeers(peakPct: number, gender: string, excludeSlug: string): { above?: BabyName; below?: BabyName } {
  const candidates = getKeptNames().filter((name) => name.gender === gender && name.slug !== excludeSlug);
  const above = candidates
    .filter((name) => (name.peak_pct ?? 0) > peakPct)
    .sort((a, b) => (a.peak_pct ?? 0) - (b.peak_pct ?? 0))[0];
  const below = candidates
    .filter((name) => (name.peak_pct ?? 0) < peakPct)
    .sort(byPeakPctDesc)[0];
  return { above, below };
}

export function getLatestPopularity(slug: string): PopularityRow | null {
  return (getDb().prepare(
    'SELECT * FROM popularity WHERE slug = ? ORDER BY year DESC LIMIT 1'
  ).get(slug) as PopularityRow | undefined) ?? null;
}

export function searchNames(query: string, limit = 30): BabyName[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return getDb().prepare(`
    SELECT * FROM names WHERE slug LIKE ? OR LOWER(name) LIKE ? ORDER BY peak_pct DESC LIMIT ?
  `).all(q + '%', q + '%', limit) as BabyName[];
}

// --- Decade top-names (national SSA aggregate) ---

export interface DecadeTopRow {
  slug: string;
  name: string;
  gender: string;
  origin: string | null;
  total_pct: number;
  peak_year: number | null;
}

/**
 * Top N names by summed yearly percentage over a given decade (national).
 * Decade is inclusive-start, exclusive-end: e.g. (1950, 1960) covers 1950–1959.
 * SSA state-level data is only available for 1910+ for many states, so we use
 * national aggregate here; state-specific culture is layered on in the UI.
 */
export function getTopNamesForDecade(
  startYear: number,
  gender: "boy" | "girl",
  limit = 10
): DecadeTopRow[] {
  const rows = getDb()
    .prepare(
      `SELECT n.slug, n.name, n.gender, n.origin, n.peak_year,
              SUM(p.pct) AS total_pct
       FROM popularity p
       JOIN names n ON p.slug = n.slug
       WHERE p.year >= ? AND p.year < ? AND n.gender = ?
       GROUP BY n.slug
       ORDER BY total_pct DESC`
    )
    .all(startYear, startYear + 10, gender) as DecadeTopRow[];
  return rows.filter((name) => getNameKeepSet().has(name.slug)).slice(0, limit);
}

export function getRotatingComparisons(limit = 2000): ComparisonPair[] {
  const week = getCurrentWeek();
  const offset = ((week - 1) % 50) * 200;
  const top = getDb().prepare(
    'SELECT slug, name FROM names ORDER BY peak_pct DESC LIMIT 200 OFFSET ?'
  ).all(offset) as { slug: string; name: string }[];

  const pairs: ComparisonPair[] = [];
  for (let i = 0; i < top.length && pairs.length < limit; i++) {
    for (let j = i + 1; j < top.length && pairs.length < limit; j++) {
      if (top[i].slug < top[j].slug) {
        pairs.push({ slugA: top[i].slug, slugB: top[j].slug, nameA: top[i].name, nameB: top[j].name });
      } else {
        pairs.push({ slugA: top[j].slug, slugB: top[i].slug, nameA: top[j].name, nameB: top[i].name });
      }
    }
  }
  return pairs;
}
