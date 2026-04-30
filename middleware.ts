import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import compareKeepList from './lib/generated/compare-keep.json';

// Prebuilt O(1) lookup set — dumped at build time by scripts/build-keep-sets.ts
// so Edge Runtime middleware never touches SQLite. Canonical slugs only
// (halves sorted a < b, single-dash `-vs-` join).
const COMPARE_KEEP_SET: Set<string> = new Set(compareKeepList as string[]);

/**
 * HCU 2026-04-24 cleanup — 410 Gone for pruned /compare/ URLs.
 *
 * Pre-prune: /compare/ had 124,750 comparison pairs prerendered pre-2026-04-22.
 * We now keep top-100 by popularity_score DESC + 4 GSC evidence URLs earning
 * ≥1 click in 28d window. Remaining ~124,650 pairs still crawled from sitemap
 * cache for months. 410 instead of notFound()'s 404 signals intentional
 * deletion → faster deindex.
 *
 * /middle-names/ and /name/ routes INTENTIONALLY untouched — both prerender
 * all 6,782 names (top traffic category at ~80% of 28d clicks).
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
