import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import compareKeepList from './lib/generated/compare-keep.json';
import nameKeepList from './lib/generated/name-keep.json';

// Prebuilt O(1) lookup sets — dumped at build time by scripts/build-keep-sets.ts
// so Edge Runtime middleware never touches SQLite. Compare slugs are canonical
// (halves sorted a < b, single-dash `-vs-` join); name slugs are plain.
const COMPARE_KEEP_SET: Set<string> = new Set(compareKeepList as string[]);
const NAME_KEEP_SET: Set<string> = new Set(nameKeepList as string[]);

/**
 * HCU 2026-04-24 cleanup — 410 Gone for pruned /compare/ URLs.
 *
 * Pre-prune: /compare/ had 124,750 comparison pairs prerendered pre-2026-04-22.
 * We now keep top-100 by popularity_score DESC + 4 GSC evidence URLs earning
 * ≥1 click in 28d window. Remaining ~124,650 pairs still crawled from sitemap
 * cache for months. 410 instead of notFound()'s 404 signals intentional
 * deletion → faster deindex.
 *
 * /middle-names/ INTENTIONALLY untouched — prerenders all names
 * (MIDDLE_NAME_PRERENDER_LIMIT=999999, ~50% of 28d clicks).
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

  // /es/* — 410 Gone (route prerender removed 2026-05-10; sitemap-clean for
  // weeks; route directory deleted in same commit). Stale cache hits return
  // 410 for fast deindex. Matches portfolio-wide /es/ kill pattern.
  if (pathname === '/es' || pathname === '/es/' || pathname.startsWith('/es/')) {
    return new NextResponse('Gone', { status: 410 });
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

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|robots.txt|sitemap.xml|api).*)'],
};
