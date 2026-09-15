#!/usr/bin/env node
// ============================================================================
// ATLAS REACTION WIRED PIN — every reaction Atlas can perform must have a caller.
//
//   node scripts/atlas-reaction-wired-pin.mjs
//   node scripts/atlas-reaction-wired-pin.mjs --selftest
//
// WHY THIS EXISTS. `<Atlas shake>` was built, measured against a reference, documented with its
// own block comment, and wired to NOTHING. A word-boundary search for it across src/app and
// src/components returned five hits, all five inside atlas.tsx itself: the prop declaration, the
// type, a comment and the effect that implements it. Zero consumers.
//
// The cost of that was not cosmetic. Getting an answer wrong is the most emotionally loaded moment
// in a learning app, and it happens on four separate surfaces here (lesson choices, true/false,
// drag-sort, number line). On every one of them the mascot stood perfectly still.
//
// NOTHING IN THE EXISTING TOOLCHAIN COULD SEE IT:
//   - tsc is happy, the prop is optional and correctly typed
//   - eslint has no opinion about an optional prop nobody passes
//   - the four Atlas parity scripts assert the correction BUBBLE renders, and never ask whether
//     the mascot inside it moves
//   - a screenshot of a wrong answer looks completely normal, because a still mascot is still a
//     mascot
//
// So the gap is structural: a capability can be fully implemented and fully unreachable, and every
// signal stays green. This pin closes it by asserting that each reaction has at least one call
// site OUTSIDE the component that defines it.
// ============================================================================
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DEFINITION = 'src/components/atlas.tsx';

/**
 * The props that make Atlas DO something, and the moment each one exists for.
 *
 * `expression` and `interactive` are deliberately absent: they are configuration rather than
 * reactions, they are passed at nearly every site, and pinning them would only ever produce noise.
 */
const REACTIONS = {
  celebrate: 'a right answer, or a lesson finishing',
  nod: 'acknowledging a tap',
  shake: 'a WRONG answer',
  idle: 'a large mascot waiting on a screen the learner is reading',
  entrance: 'Atlas arriving on screen',
};

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx|ts)$/.test(entry)) out.push(p);
  }
  return out;
}

/**
 * Call sites for one prop, excluding the file that defines it.
 *
 * Matches the JSX spellings a caller actually uses: `shake`, `shake={...}`, `shake `. The
 * definition file is excluded because that is exactly where a dead prop still looks alive.
 */
function callSites(prop, files) {
  const re = new RegExp(`(?:<Atlas\\b[^>]*?|\\s)\\b${prop}\\b(?:\\s*=\\s*\\{|\\s|/?>)`, 's');
  return files.filter((f) => {
    if (f.endsWith('atlas.tsx')) return false;
    const src = readFileSync(f, 'utf8');
    if (!src.includes('<Atlas')) return false;
    // Only look inside <Atlas ...> tags, so an unrelated variable named `idle` cannot count.
    const tags = src.match(/<Atlas\b[\s\S]*?\/?>/g) ?? [];
    return tags.some((tag) => new RegExp(`\\b${prop}\\b`).test(tag));
  });
}

// A GREEN RUN MEANS NOTHING UNLESS THE LANE CAN GO RED.
if (process.argv.includes('--selftest')) {
  const ok = (c, m) => { if (!c) { console.error(`selftest FAILED: ${m}`); process.exit(1); } };
  const fake = (body) => {
    const tags = body.match(/<Atlas\b[\s\S]*?\/?>/g) ?? [];
    return (prop) => tags.some((t) => new RegExp(`\\b${prop}\\b`).test(t));
  };
  // The exact shape of the bug: the prop exists in the file but NOT inside an Atlas tag.
  const dead = fake('const shake = true;\n<Atlas expression="oops" size={64} />');
  ok(!dead('shake'), 'a prop mentioned outside the tag must NOT count as wired');
  const live = fake('<Atlas expression="oops" size={64} shake shakeKey={k} />');
  ok(live('shake'), 'a bare boolean prop inside the tag must count as wired');
  ok(fake('<Atlas idle={true} />')('idle'), 'an explicit value must count as wired');
  ok(!fake('<Atlas expression="happy" />')('celebrate'), 'an absent prop must not count');
  console.log('selftest passed');
  process.exit(0);
}

const files = [...walk(join(ROOT, 'src/app')), ...walk(join(ROOT, 'src/components'))];
const definition = readFileSync(join(ROOT, DEFINITION), 'utf8');

const problems = [];
const report = [];

for (const [prop, purpose] of Object.entries(REACTIONS)) {
  const implemented = new RegExp(`\\n\\s+${prop}\\??:`).test(definition);
  if (!implemented) {
    problems.push(`${prop} is pinned here but no longer exists in ${DEFINITION}. Remove it from REACTIONS or restore it.`);
    continue;
  }
  const sites = callSites(prop, files);
  report.push(`  ${prop.padEnd(10)} ${String(sites.length).padStart(2)} call site(s)   ${purpose}`);
  if (sites.length === 0) {
    problems.push(`${prop} is implemented in ${DEFINITION} and NOTHING passes it, so ${purpose} is met by a motionless mascot`);
  }
}

console.log('ATLAS REACTION WIRED PIN');
report.forEach((r) => console.log(r));

if (problems.length) {
  console.error('\nFAIL');
  problems.forEach((p) => console.error(`  - ${p}`));
  console.error('\nAn animation with no caller is invisible to tsc, to eslint, and to a screenshot.');
  process.exit(1);
}
console.log('\nOK: every Atlas reaction has a caller.');
