import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import compareKeepList from './lib/generated/compare-keep.json';
import nameKeepList from './lib/generated/name-keep.json';
import middleNameKeepList from './lib/generated/middle-names-keep.json';

// Prebuilt O(1) lookup sets — dumped at build time by scripts/build-keep-sets.ts
// so Edge Runtime middleware never touches SQLite. Compare slugs are canonical
// (halves sorted a < b, single-dash `-vs-` join); name slugs are plain.
const COMPARE_KEEP_SET: Set<string> = new Set(compareKeepList as string[]);
const NAME_KEEP_SET: Set<string> = new Set(nameKeepList as string[]);
const MIDDLE_NAME_KEEP_SET: Set<string> = new Set(middleNameKeepList as string[]);

/**
 * HCU 2026-04-24 cleanup — 410 Gone for pruned /compare/ URLs.
 *
 * Pre-prune: /compare/ had 124,750 comparison pairs prerendered pre-2026-04-22.
 * We now keep top-100 by popularity_score DESC + 4 GSC evidence URLs earning
 * ≥1 click in 28d window. Remaining ~124,650 pairs still crawled from sitemap
 * cache for months. 410 instead of notFound()'s 404 signals intentional
 * deletion → faster deindex.
 *
 * /middle-names/ killed 2026-07-24 — see the 410 clause below.
 *
 * /name/ pruned 2026-06-28 to top-1500 by peak_pct (HCU defense) — but that
 * commit shipped without tombstones, so 6,267 dropped names served 404 until
 * 2026-07-03, when NAME_KEEP_SET (top-1500 ∪ Bing evidence) + the 410 clause
 * below landed. Covers /name/<slug>/ and /name/<slug>/by-decade/ (by-decade
 * prerenders top-100 ⊂ keep-set, so the slug check alone is sufficient).
 *
 * Name slugs are single-word (no internal dashes) so the first -vs- split is
 * the canonical separator, but we still iterate all positions for robustness
 * against future multi-word slugs.
 */
function isComparePathKept(slugs: string): boolean {
  if (COMPARE_KEEP_SET.has(slugs)) return true;
  const marker = '-vs-';
  let idx = slugs.indexOf(marker);
  while (idx !== -1) {
    const a = slugs.slice(0, idx);
    const b = slugs.slice(idx + marker.length);
    if (COMPARE_KEEP_SET.has([a, b].sort().join(marker))) return true;
    idx = slugs.indexOf(marker, idx + 1);
  }
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const legacySpanishName = pathname.match(/^\/es\/name\/([^/]+)\/?$/);
  if (legacySpanishName && NAME_KEEP_SET.has(legacySpanishName[1])) {
    const url = request.nextUrl.clone();
    url.pathname = `/name/${legacySpanishName[1]}/`;
    return NextResponse.redirect(url, 301);
  }

  // /es/* — 410 Gone (route prerender removed 2026-05-10; sitemap-clean for
  // weeks; route directory deleted in same commit). Stale cache hits return
  // 410 for fast deindex. Matches portfolio-wide /es/ kill pattern.
  if (pathname === '/es' || pathname === '/es/' || pathname.startsWith('/es/')) {
    return new NextResponse('Gone', { status: 410 });
  }

  // /middle-names/<slug>/ — 2026-07-24 재건. 옛 1,513 페이지는 성별당 SSA top-20 을
  // 그대로 붙여 리스트가 first name 무관하게 동일한 도어웨이였다(애드센스 scaled-content
  // 판정 옳았음). 이제 first name 의 음절·끝소리·연대로 점수를 매겨 리스트가 실제로 달라진
  // 페이지를, 수요(Bing)∩keep 상위 100(MIDDLE_NAME_KEEP_SET)만 200 으로 서빙한다. 나머지
  // 죽은 슬러그는 계속 410(/name/ 절과 같은 keep-set 경계 패턴). 근거·수요 스냅샷은
  // ops/middle-names-410-snapshot.json.
  if (pathname === '/middle-names' || pathname.startsWith('/middle-names/')) {
    const slug = pathname.replace(/^\/middle-names\/?/, '').replace(/\/$/, '').split('/')[0];
    if (!slug || !MIDDLE_NAME_KEEP_SET.has(slug)) {
      return new NextResponse('Gone', { status: 410 });
    }
  }

  // /name/<slug>/ and /name/<slug>/by-decade/ — 410 if slug not in keep-set
  if (pathname.startsWith('/name/')) {
    const slug = pathname.slice(6).replace(/\/$/, '').split('/')[0];
    if (slug && !NAME_KEEP_SET.has(slug)) {
      return new NextResponse('Gone', { status: 410 });
    }
  }

  // /compare/<slugs>/ — 410 if not in keep-set (either ordering)
  if (pathname.startsWith('/compare/')) {
    const raw = pathname.slice(9).replace(/\/$/, '');
    if (raw && !raw.includes('/') && raw.includes('-vs-')) {
      if (!isComparePathKept(raw)) {
        return new NextResponse('Gone', { status: 410 });
      }
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  const lookupMatch = pathname.match(/^\/lookup\/([^/]+)\/?$/);
  if (lookupMatch) {
    const slug = lookupMatch[1];
    if (NAME_KEEP_SET.has(slug)) {
      const url = request.nextUrl.clone();
      url.pathname = `/name/${slug}/`;
      return NextResponse.redirect(url, 308);
    }
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return response;
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|robots.txt|sitemap.xml|api).*)'],
};
