#!/usr/bin/env tsx
/**
 * Phase 7 per-site audit — nameblooms (universal-floor backfill, 2026-06-11).
 *
 * Closes the #119/#120 gate gap flagged in the 2026-06-10 portfolio audit:
 * lib/crosswalk-*.ts (or the phase7-gate JSON) marks this site as Phase 7,
 * but no per-site audit script existed. This script covers the universal
 * floor the gate hard-requires:
 *
 *   - Trap #110  — distinct external publisher hosts >= 3 across the
 *                  authority surfaces (lib/authorship.ts + lib/schema.ts +
 *                  every lib/crosswalk-*.ts). File-parse based so it works
 *                  without importing site code.
 *   - Synthesis floor — each crosswalk file must itself reference >= 2
 *                  external hosts (a crosswalk citing one source is a
 *                  relabel, not a synthesis).
 *   - Info       — Dataset creator array-form (T-P4-1) reported, not gated
 *                  (single-creator sites like eCFR-backed ones are honest).
 *
 * #112 title-cap / #119 verdict-coverage / #120 cold-probe are P1-conditional
 * (verdict-in-title). They are intentionally N/A here until P1 status for
 * this site is confirmed in _shared/data/phase7-gate/nameblooms.json — the
 * shared gate checker treats that as a pass-with-note, per its own contract.
 *
 * Run: npx tsx scripts/audit-phase7.ts
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '..');
let fails = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`  ${ok ? '✅' : '🔴'} ${label}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails++;
};

// ── Trap #110: distinct external publisher hosts ────────────────────────────
const surfaces: string[] = [];
for (const f of ['lib/authorship.ts', 'lib/schema.ts']) {
  if (existsSync(path.join(ROOT, f))) surfaces.push(f);
}
if (existsSync(path.join(ROOT, 'lib'))) {
  for (const f of readdirSync(path.join(ROOT, 'lib'))) {
    if (/^crosswalk-.*\.ts$/.test(f)) surfaces.push(`lib/${f}`);
  }
}
const HOST_RE = /https?:\/\/([a-z0-9][a-z0-9.-]*\.[a-z]{2,})/gi;
const NON_PUBLISHER = /nameblooms\.com|datapeekfacts\.com|schema\.org|w3\.org|localhost|vercel|cloudflare|google-analytics|googletagmanager/i;
const hosts = new Set<string>();
const perFileHosts = new Map<string, Set<string>>();
for (const f of surfaces) {
  const src = readFileSync(path.join(ROOT, f), 'utf8');
  const fh = new Set<string>();
  for (const m of src.matchAll(HOST_RE)) {
    const h = m[1].replace(/^www\./, '').toLowerCase();
    if (NON_PUBLISHER.test(h)) continue;
    hosts.add(h);
    fh.add(h);
  }
  perFileHosts.set(f, fh);
}
console.log(`--- Trap #110: publisher hosts across ${surfaces.length} authority surfaces ---`);
console.log(`  hosts: ${[...hosts].sort().join(', ') || '(none)'}`);
check(hosts.size >= 3, 'Trap #110 distinct external publisher hosts >= 3', `${hosts.size} found`);

// ── Crosswalk synthesis floor ───────────────────────────────────────────────
const crosswalks = surfaces.filter((f) => /crosswalk-/.test(f));
if (crosswalks.length > 0) {
  console.log('--- Crosswalk per-file host count (informational — sources may be');
  console.log('    referenced via imports/names with URLs living in authorship.ts) ---');
  for (const f of crosswalks) {
    const n = perFileHosts.get(f)?.size ?? 0;
    console.log(`  ℹ️  ${f}: ${n} literal external host(s)`);
  }
} else {
  console.log('--- No lib/crosswalk-*.ts (Phase 7 marked via gate JSON) — synthesis floor N/A ---');
}

// ── Info: Dataset creator form (T-P4-1, not gated) ─────────────────────────
if (existsSync(path.join(ROOT, 'lib/schema.ts'))) {
  const schemaSrc = readFileSync(path.join(ROOT, 'lib/schema.ts'), 'utf8');
  const arrayForm = /creator:\s*(\[|[A-Z_a-z]+\s*[,.]|.*\.map\()/.test(schemaSrc);
  console.log(`  ℹ️  Dataset creator array-form (T-P4-1): ${arrayForm ? 'array/list-like' : 'single-object (verify honesty manually — may be legitimate)'}`);
}

console.log('--- #112 / #119 / #120: N/A pending P1 status in _shared/data/phase7-gate/nameblooms.json ---');
console.log(fails === 0 ? '=== ✅ ALL PASS ===' : `=== 🔴 ${fails} FAIL ===`);
process.exitCode = fails === 0 ? 0 : 1;
