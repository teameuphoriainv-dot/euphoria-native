#!/usr/bin/env node
// ============================================================================
// lessonPreview() coverage — pins the lesson-start "YOU'LL LEARN" line.
//
//   node scripts/lesson-preview-coverage.mjs
//
// WHY THIS EXISTS. `lessonKeyTerms()` (src/lib/curriculum/index.ts) renders the
// intro screen's "YOU'LL LEARN" line entirely from a lesson's own keyTermsCards
// step. It invents nothing, which keeps it clear of §0.7 — and which also means
// the line SILENTLY DISAPPEARS if a re-sync from the web repo drops that step.
// Nothing else would fail: tsc stays green, lint stays green, the route still
// renders. Only this check notices.
//
// It reads the course FILES rather than importing them, for the same reason the
// portfolio and billing regressions re-implement their rule: the source is
// TypeScript in an Expo app with no test runner. Same honest limitation — it
// pins the DATA, not the function.
//
// COUNTING LESSONS: TWO FORMS, AND §22 C17 SAYS SO.
// Most lessons are written `L(n,'title',xp,[...])`. corporateFinance declares its
// first FIVE as `{ num: n, ... }` objects. A script matching only the L( form
// reports 295 and looks like a courseIndex bug; C17 recorded that as an error
// already made once. This script matches BOTH and asserts 25 per course.
//
// The naive cross-check is worse than useless here: `grep -c "L("` returns 300
// by COINCIDENCE — 295 real calls plus five matches inside strings in
// quantitativeAnalysis, where the maths reads dL(t,T), L(t,3M) and L(data|θ).
// Two errors cancelling to the right answer. Anchor on 25-per-course instead.
// ============================================================================

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'src/lib/curriculum/courses';

// Measured 2026-08-10 across all 12 course files. These are floors, not equalities:
// content getting BETTER should never fail a test.
const BASELINE = { lessons: 300, keyTermsCards: 186 };

const files = readdirSync(DIR).filter((f) => f.endsWith('.ts'));
let lessons = 0;
let terms = 0;
const withNeither = [];
const wrongCount = [];

for (const file of files) {
  const src = readFileSync(join(DIR, file), 'utf8');

  // BOTH forms, merged in source order (C17). Anchored to line start so the
  // maths inside quantitativeAnalysis's prose — dL(t,T), L(data|θ) — cannot match.
  const starts = [
    ...[...src.matchAll(/^\s*L\(\s*(\d+)\s*,/gm)].map((m) => ({ at: m.index, num: m[1] })),
    ...[...src.matchAll(/^\s*num:\s*(\d+)\s*,\s*$/gm)].map((m) => ({ at: m.index, num: m[1] })),
  ].sort((a, b) => a.at - b.at);

  lessons += starts.length;
  if (starts.length !== 25) wrongCount.push(`${file}  ${starts.length} lessons, expected 25`);

  starts.forEach((s, i) => {
    const to = i + 1 < starts.length ? starts[i + 1].at : src.length;
    const body = src.slice(s.at, to);
    // BOTH AUTHORING FORMS. Most steps are helper calls, `hookOpener(...)`. The five
    // object-form lessons write steps as raw literals, `{ type: 'hookOpener', ... }`.
    // lessonPreview() switches on step.type at RUNTIME so it never saw a difference;
    // an earlier version of THIS script grepped only the helper call and under-reported
    // those five as having no preview at all. Caught by reading the device screen.
    const hasTerms = body.includes('keyTermsCards(') || body.includes("type: 'keyTermsCards'");
    if (hasTerms) terms += 1;
    else withNeither.push(`${file}  lesson ${s.num}`);
  });
}

const fail = [];
const check = (label, actual, floor) => {
  const ok = actual >= floor;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label.padEnd(16)} ${String(actual).padStart(3)}  (floor ${floor})`);
  if (!ok) fail.push(`${label}: ${actual} < ${floor}`);
};

console.log(`\nlessonPreview() coverage — ${files.length} course files\n`);
check('lessons', lessons, BASELINE.lessons);
if (wrongCount.length > 0) {
  console.log('\n  Course files not carrying 25 lessons — the C17 both-forms trap, or real data loss:');
  for (const w of wrongCount) console.log(`    ${w}`);
  fail.push(`${wrongCount.length} course file(s) not at 25 lessons`);
}
check('keyTermsCards', terms, BASELINE.keyTermsCards);
console.log(`\n  ${withNeither.length} lessons render no preview, by design — the pre-audit screen.`);

if (fail.length > 0) {
  console.log('\nFAILED — a curriculum re-sync has emptied the lesson-start preview.\n');
  for (const f of fail) console.log(`  ${f}`);
  console.log('\nEither the web repo dropped hookOpener/keyTermsCards, or sync-curriculum.sh');
  console.log('changed the helper names. Fix the data or update lessonPreview().\n');
  process.exit(1);
}

console.log(`\nPASS — ${terms} of ${lessons} lessons show a preview.\n`);
