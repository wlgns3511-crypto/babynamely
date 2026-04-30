import { getNameFacts } from '../lib/name-facts';
import { generateCommentary } from '../lib/name-commentary';
import Database from 'better-sqlite3';
import path from 'path';

const conn = new Database(path.join(process.cwd(), 'data', 'names.db'), { readonly: true });
const samples = ['gertrude', 'theodore', 'eleanor', 'clara', 'matilda', 'zoey', 'wyatt', 'maverick', 'sophia', 'isabella', 'ava', 'amelia', 'harper', 'evelyn', 'james', 'william', 'elizabeth', 'charles', 'george', 'edward'];
for (const slug of samples) {
  const meta = conn.prepare('SELECT name FROM names WHERE slug = ?').get(slug) as { name: string } | undefined;
  if (!meta) { console.log(`${slug}: NOT FOUND`); continue; }
  const facts = getNameFacts(slug);
  if (!facts) continue;
  const c = generateCommentary(meta.name, facts);
  console.log(`\n━━━ ${meta.name} (${facts.gender}, ${c.trendStatus}, rank ${facts.current?.rank ?? '—'}) ━━━`);
  console.log(`▸ ${c.headline}`);
  console.log(`▸ ${c.trend}`);
  console.log(`▸ ${c.history}`);
  if (c.context) console.log(`▸ ${c.context}`);
}
conn.close();
