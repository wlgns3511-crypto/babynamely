#!/usr/bin/env tsx
/* Smoke test for lib/name-commentary.ts */
import { getNameFacts } from '../lib/name-facts';
import { generateCommentary } from '../lib/name-commentary';
import Database from 'better-sqlite3';
import path from 'path';

const conn = new Database(path.join(process.cwd(), 'data', 'names.db'), { readonly: true });
const samples = ['liam', 'olivia', 'emma', 'mary', 'noah', 'mateo', 'thiago', 'jennifer', 'arya', 'jacob', 'henry', 'aurora', 'luna', 'mason', 'aiden'];
for (const slug of samples) {
  const meta = conn.prepare('SELECT name FROM names WHERE slug = ?').get(slug) as
    | { name: string }
    | undefined;
  if (!meta) {
    console.log(`${slug}: NOT FOUND`);
    continue;
  }
  const facts = getNameFacts(slug);
  if (!facts) continue;
  const c = generateCommentary(meta.name, facts);
  console.log(`\n━━━━━━ ${meta.name} (${facts.gender}, status=${c.trendStatus}) ━━━━━━`);
  console.log(`▸ ${c.headline}`);
  console.log(`▸ ${c.trend}`);
  console.log(`▸ ${c.history}`);
  if (c.context) console.log(`▸ ${c.context}`);
}
conn.close();
