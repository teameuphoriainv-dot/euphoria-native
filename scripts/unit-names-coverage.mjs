#!/usr/bin/env node
// ============================================================================
// Unit names — pins the Learn path's unit headers.
//
//   node scripts/unit-names-coverage.mjs
//
// WHY. `src/lib/course-units.ts` is a STATIC map from course id to five unit
// names, because PathwayLesson has no unit field and courses/*.ts is auto-synced
// from the web repo. A static map keyed by id has exactly one failure mode: the
// ids drift and the headers silently stop rendering. `unitNameFor` returns null
// for an unknown course, which is the right runtime behaviour — the list renders
// as it did before — and is also completely invisible. tsc cannot catch it: the
// map is Record<string, ...>, so a typo is a valid key.
//
// This asserts every id in the map exists in the real catalogue, and that every
// course in the catalogue has names. Both directions, because either gap is
// silent.
// ============================================================================

import { readFileSync } from 'node:fs';

const UNITS_SRC = readFileSync('src/lib/course-units.ts', 'utf8');
const INDEX_SRC = readFileSync('src/lib/curriculum/courseIndex.ts', 'utf8');

const EXPECTED_UNITS = 5;

const mapped = [...UNITS_SRC.matchAll(/^  '([a-z-]+)':\s*\[/gm)].map((m) => m[1]);
const real = [...INDEX_SRC.matchAll(/id:\s*'([a-z-]+)'/g)].map((m) => m[1]);

// Count names per course by slicing between one key and the next.
const counts = {};
mapped.forEach((id, i) => {
  const from = UNITS_SRC.indexOf(`  '${id}': [`);
  const to = i + 1 < mapped.length ? UNITS_SRC.indexOf(`  '${mapped[i + 1]}': [`) : UNITS_SRC.indexOf('} as const;');
  counts[id] = [...UNITS_SRC.slice(from, to).matchAll(/^    ['"]/gm)].length;
});

const fail = [];
console.log(`\nUnit names — ${mapped.length} courses mapped, ${real.length} in the catalogue\n`);

for (const id of mapped) {
  const known = real.includes(id);
  const n = counts[id];
  const ok = known && n === EXPECTED_UNITS;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${id.padEnd(24)} ${n} names${known ? '' : '   <- NOT a real course id'}`);
  if (!known) fail.push(`${id} is not in courseIndex — its headers never render`);
  else if (n !== EXPECTED_UNITS) fail.push(`${id} has ${n} unit names, expected ${EXPECTED_UNITS}`);
}

for (const id of real) {
  if (!mapped.includes(id)) {
    console.log(`  FAIL  ${id.padEnd(24)} no unit names`);
    fail.push(`${id} is a real course with no unit names — its list stays flat`);
  }
}

// Names are user-facing copy; a duplicate across courses is almost certainly a paste error.
const names = [...UNITS_SRC.matchAll(/^    ['"](.+?)['"],$/gm)].map((m) => m[1]);
const dupes = names.filter((n, i) => names.indexOf(n) !== i);
if (dupes.length > 0) {
  console.log(`\n  FAIL  duplicate unit names: ${[...new Set(dupes)].join(', ')}`);
  fail.push(`${new Set(dupes).size} duplicate unit name(s)`);
}

if (fail.length > 0) {
  console.log('\nFAILED\n');
  for (const f of fail) console.log(`  ${f}`);
  console.log('\nFix src/lib/course-units.ts, or update it for a renamed course.\n');
  process.exit(1);
}

console.log(`\nPASS — ${names.length} unit names across ${mapped.length} courses, all ids real.\n`);
