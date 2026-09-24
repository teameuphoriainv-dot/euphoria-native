#!/usr/bin/env node
// ============================================================================
// ONBOARDING TRY-IT PIN: the "Double it" screen's math, copy, motion and place in the flow.
//
//   node --import ./scripts/ts-resolve-hooks.mjs scripts/onboarding-try-it-pin.mjs
//   node --import ./scripts/ts-resolve-hooks.mjs scripts/onboarding-try-it-pin.mjs --integrated
//
// WHY THIS EXISTS. The try-it screen (src/lib/onboarding/double-it.ts, drawn by
// src/components/onboarding/double-it-step.tsx) grades a year and then tells the learner "72 / r".
// If those two ever disagree the screen contradicts itself in front of someone who has not signed
// up yet: at 8% the coins are still one short of the $2,000 outline (1.08^9 = 1.999) in the year the
// rule names. That is the failure this pin exists for, and it is quiet, because every string still
// renders. So this asserts:
//
//   1. For every chip, the compounded doubling year equals 72 / r, the year before is under $2,000,
//      the doubling year is at or over it, and the coin count (floor) crosses the 20-cell outline in
//      exactly that year. Readouts match design.md 1.2's table byte for byte.
//   2. The grid never outgrows five rows of ten (the 667pt SE layout budget).
//   3. The grading reducer: Check needs a moved stepper; first miss is amber with Try again; the
//      second miss snaps to the answer; ONLY the first Check counts as first try (owner decision 4);
//      other rates stay locked until solved.
//   4. Copy: "not a promise" on every rate, no em dash or prose en dash, no "See answer" anywhere.
//   5. The component: every animation line reads `reduced` (Reduce Motion gets an end state), never withSpring (coin geometry is data: monotonic
//      easing only, AGENTS.md), no hardcoded hex (CONSTITUTION 5.8), 44pt+ targets, an Atlas slot.
//   6. The course still teaches the rule the screen teaches, read through the WRAPPED loader
//      (src/lib/curriculum/index.ts), so onboarding never promises a lesson that is not there.
//   7. The screen sits before REVEAL_INDEX, i.e. before the account wall, and the existing chart and
//      proof statements are still in STEPS (owner decision 1: added, nothing removed). Until the
//      integrator adds a `kind: 'try'` entry this prints PENDING and does not fail; `--integrated`
//      makes it required.
//
// Break test, 2026-09-22: CHIPS = [6, 4, 3, 8] in double-it.ts -> this pin exits 1 on check 1.
// Break test, 2026-09-22 (F2): a copy of onboarding.tsx without the reset effect, and one without
// the scrollToEnd, each passed with --onboarding -> exits 1 on check 8, naming the missing piece.
// Break test, 2026-09-22 (review): dropping the `reduced` guard from the stepper border, the coin
// FadeIn or the bar slide -> exits 1 on check 5, naming the unguarded line.
// ============================================================================
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const imported = (path) => import(pathToFileURL(join(ROOT, path)).href);
const read = (path) => readFileSync(join(ROOT, path), 'utf8');
const INTEGRATED = process.argv.includes('--integrated');

const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); };

const lib = await imported('src/lib/onboarding/double-it.ts');
const {
  CHIPS, START, TARGET, COIN_VALUE, GRID_COLUMNS, GHOST_CELLS,
  value, doublingYear, ruleOf72, maxYears, coinsAt, maxCoins, readout, subLine,
  correctLine, revealLine, exploreLine, barLine, initialState, reduce, ATLAS_BEATS,
} = lib;

// ─── 1. The math agrees with the rule, for every chip ─────────────────────────────────────────
check(START === 1000 && TARGET === 2000, `START/TARGET drifted: ${START}/${TARGET}`);
check(GHOST_CELLS === TARGET / COIN_VALUE, `the outline is ${GHOST_CELLS} cells, not ${TARGET / COIN_VALUE}`);
check(CHIPS[0] === 6, `the graded chip is ${CHIPS[0]}%, design.md 1.2 grades 6%`);
for (const r of CHIPS) {
  const d = doublingYear(r);
  check(d === 72 / r, `${r}%: coins reach $2,000 in year ${d}, but the verdict says 72 / ${r} = ${72 / r}`);
  check(ruleOf72(r) === d, `${r}%: ruleOf72 ${ruleOf72(r)} != doublingYear ${d}`);
  check(value(r, d - 1) < TARGET, `${r}%: already doubled a year early (${value(r, d - 1).toFixed(2)})`);
  check(value(r, d) >= TARGET, `${r}%: not doubled in the graded year (${value(r, d).toFixed(2)})`);
  check(coinsAt(r, d - 1) < GHOST_CELLS && coinsAt(r, d) >= GHOST_CELLS,
    `${r}%: the coins do not fill the outline in exactly year ${d} (${coinsAt(r, d - 1)} -> ${coinsAt(r, d)})`);
  check(correctLine(r).includes(`72 ÷ ${r} = ${d}`), `${r}%: correct line lost its math: "${correctLine(r)}"`);
}
// design.md 1.2's table, as the learner will read it. One correction: the table prints 1.03^23 as
// $1,973, but 1000 x 1.03^23 = 1973.59, which rounds to $1,974. The table truncated; the screen
// rounds like every other dollar figure in the app, so the pin holds the rounded value.
const TABLE = [
  [6, 11, '$1,000 → $1,898 after 11 years'], [6, 12, '$1,000 → $2,012 after 12 years'],
  [4, 17, '$1,000 → $1,948 after 17 years'], [4, 18, '$1,000 → $2,026 after 18 years'],
  [3, 23, '$1,000 → $1,974 after 23 years'], [3, 24, '$1,000 → $2,033 after 24 years'],
];
for (const [r, y, want] of TABLE) {
  if (!CHIPS.includes(r)) continue;
  check(readout(r, y) === want, `readout(${r}, ${y}) = "${readout(r, y)}", want "${want}"`);
}
check(readout(6, 1) === '$1,000 → $1,060 after 1 year', `singular year: "${readout(6, 1)}"`);

// ─── 2. Layout budget ─────────────────────────────────────────────────────────────────────────
for (const r of CHIPS) {
  const rows = Math.ceil(maxCoins(r) / GRID_COLUMNS);
  check(rows <= 5, `${r}%: ${maxCoins(r)} coins at ${maxYears(r)} years is ${rows} rows, over the 5-row SE budget`);
  check(maxYears(r) === 2 * doublingYear(r), `${r}%: maxYears ${maxYears(r)} is not twice the doubling year`);
}

// ─── 3. Grading ───────────────────────────────────────────────────────────────────────────────
const run = (actions, from = initialState()) => actions.reduce((s, a) => reduce(s, a), from);
const d6 = doublingYear(6);
{
  const s = run([{ type: 'check' }]);
  check(s.phase === 'idle', 'Check fired before the years were moved');
}
{
  const s = run([{ type: 'setYears', years: d6 }, { type: 'check' }]);
  check(s.phase === 'correct' && s.firstTry === true, `right first time: ${JSON.stringify(s)}`);
}
{
  const miss = run([{ type: 'setYears', years: 5 }, { type: 'check' }]);
  check(miss.phase === 'miss', `first miss is not amber: ${miss.phase}`);
  check(barLine(miss) === lib.MISS_LINE, 'first miss does not show the amber line');
  check(!/\d/.test(barLine(miss)), `first miss gives the answer away: "${barLine(miss)}"`);
  const locked = reduce(miss, { type: 'setYears', years: d6 });
  check(locked.years === 5, 'the stepper moved while the amber bar was up');
  const retried = run([{ type: 'tryAgain' }, { type: 'check' }], miss);
  check(retried.phase === 'idle', 'Try again then Check with no change graded the same answer twice');
  const right = run([{ type: 'tryAgain' }, { type: 'setYears', years: d6 }, { type: 'check' }], miss);
  check(right.phase === 'correct' && right.firstTry === false,
    `right after a miss counted as first try (owner decision 4): ${JSON.stringify(right)}`);
  const revealed = run([{ type: 'tryAgain' }, { type: 'setYears', years: 3 }, { type: 'check' }], miss);
  check(revealed.phase === 'revealed' && revealed.years === d6 && revealed.firstTry === false,
    `second miss did not snap to the answer: ${JSON.stringify(revealed)}`);
  check(barLine(revealed) === revealLine(6), 'second miss does not say the answer');
}
{
  const early = run([{ type: 'pickRate', rate: 4 }]);
  check(early.rate === 6, 'another rate unlocked before the graded one was solved');
  const solved = run([{ type: 'setYears', years: d6 }, { type: 'check' }, { type: 'pickRate', rate: 4 }]);
  check(solved.rate === 4 && solved.years === 0, `picking 4% after solving: ${JSON.stringify(solved)}`);
  check(barLine(solved) === exploreLine(4), 'the bar did not switch to the 4% math');
  const bogus = reduce(solved, { type: 'pickRate', rate: 8 });
  check(bogus.rate === 4, 'a rate outside CHIPS was accepted');
  const capped = reduce(solved, { type: 'setYears', years: 999 });
  check(capped.years === maxYears(4), `stepper not capped at maxYears: ${capped.years}`);
}

// ─── 4. Copy ──────────────────────────────────────────────────────────────────────────────────
for (const r of CHIPS) check(/not a promise/.test(subLine(r)), `${r}%: sub-line lost "not a promise"`);
const strings = [
  lib.TITLE, lib.MISS_TITLE, lib.MISS_LINE, lib.WHY_LINE, lib.CHECK_LABEL, lib.TRY_AGAIN_LABEL,
  lib.CONTINUE_LABEL, lib.WHY_LABEL, lib.ANOTHER_RATE_LABEL,
  ...CHIPS.flatMap((r) => [subLine(r), correctLine(r), revealLine(r), exploreLine(r), readout(r, doublingYear(r))]),
  ...Object.values(ATLAS_BEATS).map((b) => b.line ?? ''),
];
for (const s of strings) {
  check(!/[—]/.test(s) && !/[A-Za-z]–|–[A-Za-z]/.test(s), `dash in user-facing copy: "${s}"`);
}
const barWords = new Set(CHIPS.flatMap((r) => [correctLine(r), revealLine(r)]).concat(lib.MISS_LINE));
for (const [phase, beat] of Object.entries(ATLAS_BEATS)) {
  check(beat.line === null || !barWords.has(beat.line), `Atlas repeats the bar on ${phase} (CONSTITUTION 5.1)`);
}

// ─── 5. The component ─────────────────────────────────────────────────────────────────────────
const COMPONENT = 'src/components/onboarding/double-it-step.tsx';
// Comments are stripped before the source checks: a comment explaining why there is no "See answer"
// button must not trip the check for one.
const stripComments = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const libSrc = stripComments(read('src/lib/onboarding/double-it.ts'));
check(existsSync(join(ROOT, COMPONENT)), `${COMPONENT} is missing`);
if (existsSync(join(ROOT, COMPONENT))) {
  const src = read(COMPONENT);
  const code = stripComments(src);
  check(/useReducedMotion\(\)/.test(code), 'double-it-step never reads useReducedMotion');
  // Calling useReducedMotion() proves nothing if an animation ignores it: every line that starts
  // motion (withTiming, withDelay, an `entering` preset) must read `reduced` on that same line, so
  // Reduce Motion gets an end state instead of a quieter version of the same slide.
  for (const line of code.split('\n')) {
    if (/withTiming\(|withDelay\(|FadeIn\.|entering=/.test(line)) {
      check(/reduced/.test(line), `double-it-step animates without a Reduce Motion guard: "${line.trim()}"`);
    }
  }
  check(!/withSpring/.test(code),'double-it-step uses withSpring: coin geometry is data, monotonic easing only');
  check(!/#[0-9A-Fa-f]{3,8}\b/.test(code), 'double-it-step hardcodes a hex colour (CONSTITUTION 5.8)');
  check(/atlas\??:\s*React\.ReactNode/.test(code), 'double-it-step has no Atlas slot prop for the integrator');
  check(/accessibilityRole="adjustable"/.test(code), 'the years stepper is not one adjustable VoiceOver element');
  check(/action\.type === 'reset' \? INITIAL/.test(code) && /return \{ state, setYears, check, tryAgain, pickRate, reset \}/.test(code),
    'useDoubleIt has no reset, so the parent-owned state outlives the step (Back then forward shows the old verdict)');
  const targets = [...code.matchAll(/const (\w*TARGET\w*) = (\d+);/g)].map((m) => Number(m[2]));
  check(targets.length > 0 && targets.every((n) => n >= 44), `a touch target under 44pt: ${targets.join(', ')}`);
  for (const [name, text] of [[COMPONENT, code], ['double-it.ts', libSrc]]) {
    check(!/see answer/i.test(text), `${name} offers "See answer" (brilliant-onboarding.md 4)`);
  }
}

// ─── 6. The course teaches the same rule, through the wrapped loader ──────────────────────────
try {
  const curriculum = await imported('src/lib/curriculum/index.ts');
  const lessons = await curriculum.loadCourseLessons('investing-fundamentals');
  const text = JSON.stringify(lessons);
  check(/divide 72 by/i.test(text), 'investing-fundamentals no longer says "divide 72 by" in the wrapped loader');
  check(/at 6% a year/i.test(text), 'investing-fundamentals no longer asks the 6% doubling question');
} catch (e) {
  failures.push(`wrapped loader src/lib/curriculum/index.ts failed to load: ${e?.message ?? e}`);
}

// ─── 7. Place in the flow ─────────────────────────────────────────────────────────────────────
// `--onboarding <path>` reads another copy of the screen. It exists only so the placement checks can
// be break-tested (try step after the reveal, chart statement dropped) without editing the real file.
const obArg = process.argv.indexOf('--onboarding');
const onboarding = obArg > -1 ? readFileSync(process.argv[obArg + 1], 'utf8') : read('src/app/onboarding.tsx');
const stepsBlock = /const STEPS: StepDef\[\] = \[([\s\S]*?)\n\];/.exec(onboarding);
check(stepsBlock, 'STEPS not found in src/app/onboarding.tsx; this pin has drifted from the code');
let pending = false;
if (stepsBlock) {
  const body = stepsBlock[1].replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const kinds = [...body.matchAll(/\{\s*kind:\s*'(\w+)'([^\n]*)/g)].map((m) => ({ kind: m[1], rest: m[2] }));
  const reveal = kinds.findIndex((k) => k.kind === 'reveal');
  const paywall = kinds.findIndex((k) => k.kind === 'paywall');
  check(reveal === kinds.length - 2 && paywall === kinds.length - 1,
    `reveal/paywall are not the last two steps: ${kinds.map((k) => k.kind).join(',')}`);
  check(kinds.some((k) => k.kind === 'statement' && /body:\s*'chart'/.test(k.rest)),
    'the chart statement was removed from STEPS (owner decision 1 keeps every screen)');
  check(kinds.some((k) => k.kind === 'statement' && /body:\s*'proof'/.test(k.rest)),
    'the proof statement was removed from STEPS (owner decision 1 keeps every screen)');
  const tryAt = kinds.findIndex((k) => k.kind === 'try');
  if (tryAt === -1) {
    pending = true;
    check(!INTEGRATED, "--integrated: STEPS has no { kind: 'try' } entry");
  } else {
    check(tryAt < reveal, `the try-it step is at ${tryAt}, not before REVEAL_INDEX ${reveal} (the account wall)`);
    check(kinds.filter((k) => k.kind === 'try').length === 1, 'more than one try-it step');
    check(/from '@\/components\/onboarding\/double-it-step'/.test(onboarding),
      'onboarding.tsx has a try step but never imports double-it-step');
    // 8. Re-entry and clearance (sim wave 2, 2026-09-22). The state lives in onboarding.tsx, so Back
    // and forward again showed the old amber miss bar with the stepper locked; and the rate chips
    // mounted with the verdict bar but nothing scrolled, so they sat clipped flush on the bar.
    const obCode = onboarding.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    check(/const tryLive = liveDef\?\.kind === 'try';[\s\S]{0,200}?useEffect\(\(\) => \{\s*if \(tryLive\) resetTry\(\);/.test(obCode),
      'onboarding.tsx does not reset Double it when the step is entered: Back then forward shows the old verdict');
    check(/tryResolved[\s\S]{0,300}?scrollToEnd\(\{ animated: !reducedMotion \}\)/.test(obCode),
      'onboarding.tsx does not scroll the rate chips clear of the check bar on the verdict (with a Reduce Motion end state)');
  }
}

if (failures.length) {
  console.error(`onboarding-try-it-pin: ${failures.length} failure(s)`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`onboarding-try-it-pin: OK (${CHIPS.length} chips, doubling years ${CHIPS.map(doublingYear).join('/')}; math, grading, copy, component, wrapped loader)`);
if (pending) console.log("onboarding-try-it-pin: PENDING integration: no { kind: 'try' } in STEPS yet; chart and proof statements confirmed present. Run with --integrated once wired.");
