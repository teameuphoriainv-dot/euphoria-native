#!/usr/bin/env node
// ============================================================================
// LESSON RENDER AUDIT — every step of every lesson, through the REAL normaliser.
//
//   node scripts/lesson-render-audit.mjs          # summary
//   node scripts/lesson-render-audit.mjs --thin   # also list every thin step
//
// WHY THIS EXISTS. The corpus is byte-identical to the web repo — that was
// proven by diff. What that does NOT prove is that the app can RENDER it. A
// step type with no case in src/lib/lesson-steps.ts falls to `default:`, which
// returns kind 'todo' and pulls only setup/principle/optimalOutcome/formula. If
// a step carries none of those fields, the learner gets a title and an empty
// screen — in a paid app, mid-lesson.
//
// Sampling a few lessons cannot find that. This runs the ACTUAL normaliseStep()
// over all 5,341 steps, so the answer is exhaustive rather than indicative.
//
// It imports the TypeScript directly: every import in lesson-steps.ts is
// `import type`, so Node 24's type stripping erases the lot and the module is
// pure. No build step, no reimplementation of the logic being tested — a
// reimplementation would drift from the thing it is checking, which is the
// failure mode this whole audit keeps running into.
// ============================================================================
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const COURSES = join(ROOT, 'src/lib/curriculum/courses');
const { normalizeStep, gates } = await import(pathToFileURL(join(ROOT, 'src/lib/lesson-steps.ts')).href);

const VERBOSE = process.argv.includes('--thin');

/** Text a prose/todo block actually puts on screen. */
function blockText(b) {
  if (!b || typeof b !== 'object') return '';
  return [b.t, b.text, b.left, b.right, b.leftLabel, b.rightLabel, b.term, b.def, b.q, b.a]
    .filter((v) => typeof v === 'string')
    .join(' ')
    .trim();
}

/** A step is THIN when it reaches the screen with no readable body and no interaction.
 *
 * The first version of this only looked at `n.blocks`, so it flagged all 443 quiz, 312 microCheck,
 * 281 fillBlank and 273 scenario steps -- 1,309 false positives -- because a `choice` step carries
 * its content in `prompt`/`options`, not `blocks`, and `gates()` does not list 'choice'. Checking
 * each kind against the shape it actually has is the whole job here.
 */
function isThin(n) {
  if (!n) return true;
  switch (n.kind) {
    case 'choice':
      return !(n.prompt ?? '').trim() || (n.options ?? []).length < 2;
    case 'reveal': case 'match': case 'order': case 'line': case 'multi': case 'build': {
      const spec = n.spec ?? {};
      const arrays = Object.values(spec).filter(Array.isArray);
      // a spec-driven interactive is thin only if it has nothing to interact with
      return arrays.length > 0 && arrays.every((a) => a.length === 0);
    }
    case 'prose': case 'todo':
    default: {
      const blocks = Array.isArray(n.blocks) ? n.blocks : [];
      return blocks.every((b) => blockText(b).length === 0);
    }
  }
}

const files = readdirSync(COURSES).filter((f) => f.endsWith('.ts')).sort();
let steps = 0, lessons = 0, thin = 0, todo = 0;
const byType = new Map();
const thinByType = new Map();
const thinExamples = [];

for (const f of files) {
  const mod = await import(pathToFileURL(join(COURSES, f)).href);
  const list = mod.default ?? [];
  for (const lesson of list) {
    lessons += 1;
    for (const step of lesson.steps ?? []) {
      steps += 1;
      byType.set(step.type, (byType.get(step.type) ?? 0) + 1);
      let n;
      try {
        n = normalizeStep(step);
      } catch (err) {
        thin += 1;
        thinByType.set(step.type, (thinByType.get(step.type) ?? 0) + 1);
        thinExamples.push(`THREW  ${f} L${lesson.num} ${step.type}: ${err.message}`);
        continue;
      }
      if (n.kind === 'todo') todo += 1;
      if (isThin(n)) {
        thin += 1;
        thinByType.set(step.type, (thinByType.get(step.type) ?? 0) + 1);
        if (thinExamples.length < 4000) {
          thinExamples.push(`${f.replace('.ts', '')} L${lesson.num} step "${(step.title ?? '').slice(0, 46)}" (${step.type})`);
        }
      }
    }
  }
}

console.log(`\ncourses ${files.length}   lessons ${lessons}   steps ${steps}   distinct types ${byType.size}`);
console.log(`fell through to the 'todo' default: ${todo} step(s)`);
console.log(`THIN (reach the screen with no readable body and no interaction): ${thin}\n`);

if (thinByType.size) {
  console.log('thin steps by type:');
  for (const [t, n] of [...thinByType.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${t.padEnd(18)} ${String(n).padStart(4)} of ${byType.get(t)}`);
  }
} else {
  console.log('no thin steps — every step renders readable content or an interaction.');
}

if (VERBOSE && thinExamples.length) {
  console.log(`\nfirst ${Math.min(40, thinExamples.length)} thin steps:`);
  for (const e of thinExamples.slice(0, 40)) console.log(`  ${e}`);
}

// PINNED BASELINE. 44 progressiveCalc steps still render as a bare title: each one is a sequence
// of MCQs (4 in the case measured) and the normaliser emits ONE screen per step, so rendering them
// properly needs a multi-question renderer rather than a normaliser case. Showing one of four
// questions, or revealing the answers as a "walkthrough", would both quietly lose authored
// assessment -- so this records the gap instead of papering over it.
//
// The number is a CEILING, not a target: this exits non-zero the moment a sync or an edit makes
// MORE steps thin, which is the regression nothing else in `npm run check` would notice.
const BASELINE = 44;
if (thin > BASELINE) {
  console.error(`\nREGRESSION: ${thin} thin steps, baseline is ${BASELINE}.`);
  console.error('Re-run with --thin to list them.');
  process.exit(1);
}
if (thin < BASELINE) {
  console.log(`\nthin count is DOWN to ${thin} (baseline ${BASELINE}). Lower the baseline in this file.`);
}
process.exit(0);
