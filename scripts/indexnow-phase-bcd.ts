// IndexNow for nameblooms 2026-05-03 Phase A+B+C launch:
//   - 9 trajectory hubs (/trajectory/ + 8 archetypes)
//   - Top 100 names by peak_pct (got state heatmap + archetype + cohort fact)
//
// Reinforces the "real new content" signal so Google sees the substantive
// upgrade quickly — and per-name pages that already had GSC traction get
// re-crawled with the additional unique data.

import Database from 'better-sqlite3';
import path from 'path';

const HOST = 'nameblooms.com';
const KEY = '7747acecd3e24e0db0da5d4d53a9b8a6';

const ARCHETYPES = ['modern', 'vintage', 'classic', 'burst', 'climber', 'ancient', 'fading', 'steady'];

const urls: string[] = [];

urls.push(`https://${HOST}/trajectory/`);
for (const a of ARCHETYPES) urls.push(`https://${HOST}/trajectory/${a}/`);

const db = new Database(path.join(process.cwd(), 'data', 'names.db'), { readonly: true });
const top100 = db
  .prepare('SELECT slug FROM names WHERE peak_pct IS NOT NULL ORDER BY peak_pct DESC LIMIT 100')
  .all() as { slug: string }[];
db.close();

for (const r of top100) urls.push(`https://${HOST}/name/${r.slug}/`);

(async () => {
  console.log(`[INDEXNOW] submitting ${urls.length} URLs (Phase A+B+C launch)…`);
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList: urls,
    }),
  });
  console.log(`status ${res.status}`);
  console.log(await res.text());
})();
