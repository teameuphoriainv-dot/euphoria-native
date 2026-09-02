#!/usr/bin/env node
/**
 * Prove the iOS curriculum is byte-for-byte identical to what euphoriainv.com actually serves.
 *
 * Compares against the DEPLOYED BUNDLE, never a git commit. That distinction is the whole point:
 * during this harness's development a stale plan pin, an unpushed local `master` 120 commits
 * behind origin, and a diverged feature branch each produced a convincing false mismatch. Only
 * the artifact production ships can settle it.
 *
 * Method: Vite emits each course as its own ES-module chunk importing a single dependency-free
 * helpers chunk, so the chunks can be mirrored locally (relative names preserved) and imported
 * directly in Node. Each course's lesson array is then canonically serialised -- keys sorted
 * recursively, undefined dropped -- and hashed on both sides. A hash over the canonical form is
 * not a sample: one changed character in any step of any lesson changes the digest.
 *
 *   npm run parity:web
 */
import { createHash } from 'node:crypto';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ORIGIN = process.env.EUPHORIA_WEB_ORIGIN || 'https://www.euphoriainv.com';
const COURSES = [
  'investingFundamentals', 'personalFinance', 'globalEconomics', 'corporateFinance',
  'businessStrategy', 'financialAnalytics', 'behavioralFinance', 'appliedAccounting',
  'quantitativeAnalysis', 'riskManagement', 'alternativeInvestments', 'wealthManagement',
];

const canon = (v) => Array.isArray(v) ? v.map(canon)
  : (v && typeof v === 'object')
    ? Object.keys(v).sort().reduce((a, k) => { if (v[k] !== undefined) a[k] = canon(v[k]); return a; }, {})
    : v;
const digest = (value) => createHash('sha256').update(JSON.stringify(canon(value))).digest('hex');
const lessonsOf = (mod) => Object.values(mod).find((v) => Array.isArray(v) && v.length && v[0]?.steps);

async function text(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

/** Resolve the chunk graph transitively; course data sits behind lazy imports, so one pass over
 *  the entry HTML is not enough. */
async function discoverChunks() {
  const html = await text(`${ORIGIN}/app`);
  const seen = new Map();
  let queue = [...new Set([...html.matchAll(/assets\/([A-Za-z0-9_.-]+\.js)/g)].map((m) => m[1]))];
  while (queue.length) {
    const next = [];
    for (const name of queue) {
      if (seen.has(name)) continue;
      let body;
      try { body = await text(`${ORIGIN}/assets/${name}`); } catch { seen.set(name, null); continue; }
      seen.set(name, body);
      for (const m of body.matchAll(/([A-Za-z0-9_.-]+-[A-Za-z0-9_-]{8}\.js)/g)) {
        if (!seen.has(m[1])) next.push(m[1]);
      }
    }
    queue = [...new Set(next)];
  }
  return seen;
}

const chunks = await discoverChunks();
const dir = mkdtempSync(join(tmpdir(), 'euphoria-prod-parity-'));
try {
  for (const [name, body] of chunks) if (body) writeFileSync(join(dir, name), body);

  let ok = 0, checked = 0, lessons = 0, steps = 0;
  const failures = [];
  console.log('\nProduction curriculum parity — iOS vs the deployed euphoriainv.com bundle\n');
  console.log('  course                    lessons  steps   result');

  for (const course of COURSES) {
    const file = [...chunks.keys()].find((n) => n.startsWith(`${course}-`));
    if (!file) { failures.push(`${course}: no deployed chunk found`); continue; }
    const web = lessonsOf(await import(pathToFileURL(join(dir, file)).href));
    const native = lessonsOf(await import(`../src/lib/curriculum/courses/${course}.ts`));
    if (!web || !native) { failures.push(`${course}: could not read lesson array`); continue; }

    checked += 1;
    lessons += native.length;
    const s = native.reduce((a, l) => a + (l.steps || []).length, 0);
    steps += s;
    const same = digest(web) === digest(native);
    if (same) ok += 1;
    else failures.push(`${course}: curriculum content differs from production`);
    console.log(`  ${course.padEnd(24)}${String(native.length).padStart(6)}${String(s).padStart(7)}   ${same ? 'IDENTICAL' : 'DIFFERS'}`);
  }

  console.log(`\n  chunks fetched  ${chunks.size}`);
  console.log(`  courses         ${ok}/${checked} identical`);
  console.log(`  lessons         ${lessons}`);
  console.log(`  authored steps  ${steps}`);

  if (failures.length || checked !== COURSES.length || lessons !== 300) {
    console.log('\nFAIL');
    failures.forEach((f) => console.log(`  - ${f}`));
    if (lessons !== 300) console.log(`  - expected 300 lessons, read ${lessons}`);
    process.exit(1);
  }
  console.log('\nPASS — every lesson of every pathway matches what production serves.\n');
} finally {
  rmSync(dir, { recursive: true, force: true });
}
