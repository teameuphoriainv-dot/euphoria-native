#!/usr/bin/env node
// ============================================================================
// CHECK BAR PIN: grading keeps the question on screen, a first miss is amber, and only the first
// try earns XP.
//
//   node --import ./scripts/ts-resolve-hooks.mjs scripts/check-bar-pin.mjs
//   node --import ./scripts/ts-resolve-hooks.mjs scripts/check-bar-pin.mjs --unit-only
//
// WHY THIS EXISTS. Design M5 (research2/design.md) moves every choice step from "grade, then swap
// the question for an explanation page" to Brilliant's slide-up verdict bar. Each check below is a
// way that change quietly goes wrong:
//
//   1. LAYOUT, on the WRAPPED loader (src/lib/curriculum/index.ts, what the app renders; the raw
//      loader's options are longer and would pick the wrong layout). The Rule of 72 fillBlank
//      ('9','6','12','15', investingFundamentals.ts:855) is a 2x2 grid; the $10,000-at-10%
//      microCheck (:800) keeps the stack; the 4% rule progressiveCalc prompts
//      (personalFinance.ts:2663-2666) are grids; the accessibility text sizes fall back to stack.
//   2. COLOUR. A first miss never paints `destructive`. Checked in the tone table AND in the
//      component source, so a hardcoded LessonColors.destructive in the bar is caught too.
//   3. MOTION. The bar has no spring (it is UI, not a character or a reward; AGENTS.md), slides with
//      withTiming + Ease.out, and has a Reduce Motion branch for both the bar and the XP chip.
//   4. FLOW. Try again puts the missed option into `eliminated` and re-arms Check; the second miss
//      shows the answer; a double tap on Check is not a second attempt.
//   5. SCORING. firstTryCounts: only a correct FIRST attempt earns XP or mastery.
//   6. INTEGRATION (lesson.tsx). The bar is mounted and the question view is no longer unmounted
//      when `checked` is true. This fails until the integrator wires lesson.tsx; that is intended,
//      and `--unit-only` skips only this block so 1-5 can run before then.
// ============================================================================
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
const imported = (path) => import(pathToFileURL(join(ROOT, path)).href);
const source = (path) => readFileSync(join(ROOT, path), 'utf8');
// Comments are stripped before any source scan: this file's own subject ("never destructive",
// "no spring") is written in the component's comments, and must not satisfy or trip the scan.
const strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/[^\n]*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

const UNIT_ONLY = process.argv.includes('--unit-only');
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); };

const L = await imported('src/lib/answer-layout.ts');
const { loadCourseLessons } = await imported('src/lib/curriculum/index.ts');
const { normalizeStep } = await imported('src/lib/lesson-steps.ts');

// ---- 1. layout fixtures, on the wrapped loader -----------------------------------------------------
/** Every choice the app would render, with where it came from. Decks are left out: they do not use
 *  the lesson.tsx choice UI this layout is for. */
async function choicesIn(courseId) {
  const out = [];
  for (const lesson of await loadCourseLessons(courseId)) {
    lesson.steps.forEach((step, i) => {
      if (step.type === 'mobileDeck') return;
      let norm;
      try { norm = normalizeStep(step); } catch { return; }
      if (norm.kind === 'choice') out.push({ at: `${courseId}:${lesson.num}:${i}`, prompt: norm.prompt, options: norm.options });
      if (norm.kind === 'progressiveCalc') {
        for (const c of norm.spec?.calcSteps ?? []) out.push({ at: `${courseId}:${lesson.num}:${i}`, prompt: c.prompt, options: c.options });
      }
    });
  }
  return out;
}
const inv = await choicesIn('investing-fundamentals');
const pf = await choicesIn('personal-finance');
const find = (list, re) => list.find((c) => re.test(c.prompt));

const rule72 = find(inv, /Rule of 72 says that at 8% annual return/);
check(rule72, 'the Rule of 72 fillBlank (investingFundamentals.ts:855) is missing from the wrapped loader; this pin has drifted');
if (rule72) {
  check([...rule72.options].sort().join(',') === '12,15,6,9', `Rule of 72 options changed: ${JSON.stringify(rule72.options)}`);
  check(L.pickAnswerLayout(rule72.options) === 'grid', `Rule of 72 (${rule72.at}) must be a 2x2 grid, got ${L.pickAnswerLayout(rule72.options)}`);
  check(L.pickAnswerLayout(rule72.options, 2) === 'stack', 'Rule of 72 at an accessibility text size must fall back to the stack');
}

const doubled = find(inv, /After 7 years, your money has doubled to \$20,000/);
check(doubled, 'the $10,000-at-10% microCheck (investingFundamentals.ts:800) is missing from the wrapped loader; this pin has drifted');
if (doubled) check(L.pickAnswerLayout(doubled.options) === 'stack', `${doubled.at} has long options and must stay stacked, got ${L.pickAnswerLayout(doubled.options)}`);

const fourPct = find(pf, /4% rule, a \$1\.2M portfolio/);
check(fourPct, 'the 4% rule progressiveCalc prompt (personalFinance.ts:2663-2666) is missing from the wrapped loader; this pin has drifted');
if (fourPct) {
  check(L.pickAnswerLayout(fourPct.options) === 'grid', `4% rule (${fourPct.at}) ${JSON.stringify(fourPct.options)} must be a 2x2 grid, got ${L.pickAnswerLayout(fourPct.options)}`);
}

check(L.pickAnswerLayout(['True', 'False']) === 'row', 'two short options must be a row');
check(L.pickAnswerLayout(['Stocks', 'Bonds', 'Cash']) === 'row', 'three short options must be a row');
check(L.pickAnswerLayout(['a', 'b', 'c', 'd', 'e']) === 'stack', 'five options must stack');
check(L.pickAnswerLayout(['$1,200,000 in total', 'b', 'c', 'd']) === 'stack', 'a 19-character option must push a 4-option set to the stack');
check(L.pickAnswerLayout(['9', '', '12', '15']) === 'stack', 'an empty option must never become a blank tile');

// Corpus totals, measured here so the report is a number and not a guess.
const all = [...inv, ...pf];
const tally = { row: 0, grid: 0, stack: 0 };
for (const c of all) tally[L.pickAnswerLayout(c.options)] += 1;

// ---- 2. colour -------------------------------------------------------------------------------------
check(L.VERDICT_TONE.retry === 'warning', `a first miss must paint warning (amber), got ${L.VERDICT_TONE.retry}`);
for (const [v, tone] of Object.entries(L.VERDICT_TONE)) check(tone !== 'destructive', `verdict "${v}" paints destructive`);
check(L.VERDICT_TONE.correct === 'success', 'a correct answer must paint success');
const bar = strip(source('src/components/lesson-check-bar.tsx'));
check(!/destructive/.test(bar), 'lesson-check-bar.tsx references destructive; the bar must never paint a miss red');
check(/LessonColors\[VERDICT_TONE\[verdict\]\]/.test(bar), 'the bar no longer takes its colour from VERDICT_TONE');
check(!/#[0-9A-Fa-f]{6}\b/.test(bar), 'lesson-check-bar.tsx has a hardcoded hex colour; use a theme token (design-rules-pin ratchet)');

// ---- 3. motion -------------------------------------------------------------------------------------
check(!/withSpring|springify|\bSpring\b/.test(bar), 'lesson-check-bar.tsx uses a spring; the bar is UI and must not overshoot');
check(/withTiming\(1, \{ duration: BAR_IN_MS, easing: Ease\.out \}\)/.test(bar), 'the bar must slide with withTiming over BAR_IN_MS with Ease.out');
check(/withDelay\(XP_AFTER_MS/.test(bar), 'the XP chip must arrive XP_AFTER_MS after the bar, as its own beat');
check((bar.match(/reduced \? 1 :/g) ?? []).length >= 2, 'both the bar and the XP chip need a Reduce Motion branch that lands on the end state');
// Prevents: the XP chip showing on a revealed answer. The integrator gates `xp` on firstTryCounts,
// but the bar must not draw the chip for any verdict except 'correct' even if xp is passed.
check(/const showXp = verdict === 'correct' &&/.test(bar), "the XP chip must only draw on a 'correct' verdict");
check(/onLayout=\{onLayout\}/.test(bar) && /started\.current/.test(bar),
  'the slide must start from onLayout with the measured height, not a remembered one');
check(L.BAR_IN_MS === 180 && L.XP_AFTER_MS === 450, 'BAR_IN_MS / XP_AFTER_MS drifted from the measured 180 / 450 (brilliant/hi/correct_01.jpg)');

// ---- 4. flow ---------------------------------------------------------------------------------------
const truth = [true, false, false, false];
let s = L.checkReducer(L.initialCheckState, { type: 'pick', index: 2 });
s = L.checkReducer(s, { type: 'check', correctByOption: truth });
check(s.verdict === 'retry', `first miss must be retry, got ${s.verdict}`);
const again = L.checkReducer(s, { type: 'check', correctByOption: truth });
check(again === s, 'a second Check under a showing verdict must be a no-op, not a second attempt');
s = L.checkReducer(s, { type: 'tryAgain' });
check(s.eliminated.includes(2), 'Try again must put the missed option into eliminated');
check(s.verdict === null && s.pick === null, 'Try again must clear the verdict and the pick so Check re-arms');
check(L.checkReducer(s, { type: 'pick', index: 2 }) === s, 'an eliminated option must not be pickable');
const second = L.checkReducer(L.checkReducer(s, { type: 'pick', index: 3 }), { type: 'check', correctByOption: truth });
check(second.verdict === 'answer', `second miss must show the answer, got ${second.verdict}`);
check(L.checkReducer(second, { type: 'tryAgain' }) === second, 'no third try after the answer is shown');
const rightOnRetry = L.checkReducer(L.checkReducer(s, { type: 'pick', index: 0 }), { type: 'check', correctByOption: truth });
check(rightOnRetry.verdict === 'correct', 'a right answer on the retry is still graded correct');
const seen = L.checkReducer(L.checkReducer(L.checkReducer(L.initialCheckState, { type: 'pick', index: 1 }), { type: 'check', correctByOption: truth }), { type: 'seeAnswer' });
check(seen.verdict === 'answer', 'See answer must reveal the answer');

// ---- 5. scoring ------------------------------------------------------------------------------------
check(L.firstTryCounts([true]) === true, 'a correct first try must count');
check(L.firstTryCounts(rightOnRetry.attempts) === false, 'right on the retry must NOT earn XP or mastery');
check(L.firstTryCounts([false]) === false, 'a miss must not count');
check(L.firstTryCounts([]) === false, 'no attempt must not count');

// ---- 6. integration --------------------------------------------------------------------------------
if (!UNIT_ONLY) {
  const lesson = strip(source('src/app/lesson.tsx'));
  check(/from '@\/components\/lesson-check-bar'/.test(lesson), 'lesson.tsx does not mount LessonCheckBar yet (integrator)');
  check(/firstTryCounts/.test(lesson), 'lesson.tsx does not score with firstTryCounts yet (integrator)');
  check(/pickAnswerLayout/.test(lesson), 'lesson.tsx does not use pickAnswerLayout yet (integrator)');
  check(!/!\(checked && hasExplanationScreen\(gradedChoice\)\)/.test(lesson),
    'lesson.tsx still unmounts the question when checked; the question must stay under the bar (integrator)');

  /*
   * 6a. THE QUESTION RESERVES THE BAR'S OWN HEIGHT (S2 review, 2026-09-22).
   *
   * The bar is an absolute overlay and the question under it is a ScrollView whose scrollable area
   * ends at its paddingBottom. That padding was the fixed FOOTER_CLEARANCE (170pt). A taller bar
   * (the 'answer' verdict carries an extra line for the correct answer, and Dynamic Type grows all
   * of it) therefore covered the last stacked option with no scroll left to clear it, on the one
   * screen whose whole job is picking an option. The padding now follows the bar's measured height.
   */
  check(/onHeightChange=\{setCheckBarH\}/.test(lesson), 'lesson.tsx does not take the check bar\'s measured height');
  check(/contentContainerStyle=\{\[styles\.choiceContent, \{ paddingBottom: Math\.max\(FOOTER_CLEARANCE, checkBarH \+ CHECK_BAR_GAP\) \}\]\}/.test(lesson),
    "the question's bottom padding must follow the bar's measured height, never the fixed FOOTER_CLEARANCE alone");
  const barSrc = strip(source('src/components/lesson-check-bar.tsx'));
  check(/onHeightChange\?\.\(e\.nativeEvent\.layout\.height\)/.test(barSrc),
    'the bar never reports its measured height, so the question is padded against a guess');
  check(/onHeightChange\?\.\(0\)/.test(barSrc),
    'the bar never reports 0 when it hides, so a later question keeps reserving room for a bar that is gone');
  const gap = /const CHECK_BAR_GAP = (\d+)/.exec(lesson);
  check(gap && Number(gap[1]) > 0, 'CHECK_BAR_GAP must leave the last option clear of the bar, not flush against it');

  /*
   * 6b. ASK-ATLAS NEVER SITS ON THE CTA (S2 review, 2026-09-22, sim/07-lesson-checkbar-miss-a).
   *
   * The float was pinned at bottom:20 and the footer CTA lands in the same 20..90pt band, so on an
   * unanswered question the mascot covered the right end of Check, which is the learner's only way
   * to submit. Measured on iPhone 17 Pro, personal-finance 15 step 3: CTA y 784..828 under an Atlas
   * at 766..820, and the float draws at zIndex 30 so it took the taps as well. The lift is a
   * MEASURED height (the lesson footer, or the deck's own Back / Got it row) plus a gap, so it
   * holds at every Dynamic Type size and every width instead of at the one it was eyeballed on.
   */
  check(/style=\{\[styles\.atlasFloat, \{ bottom: atlasLift \}\]\}/.test(lesson),
    'the floating Atlas is back on a fixed bottom, so it sits on the footer CTA again');
  check(/onLayout=\{\(e\) => setFooterH\(e\.nativeEvent\.layout\.height\)\}/.test(lesson),
    'the lesson footer does not measure itself, so the Atlas float has nothing to clear');
  check(/onFooterHeight=\{setDeckFooterH\}/.test(lesson), 'the deck does not report its footer height to the lesson');
  check(/const atlasLift = footerShown[\s\S]{0,400}?deckFooterH \|\| FLOOR_LIFT/.test(lesson),
    'atlasLift no longer follows the measured footer of the step that is on screen');
  const floor = /const FLOOR_LIFT = (\d+)/.exec(lesson);
  const atlasGap = /const ATLAS_GAP = (\d+)/.exec(lesson);
  check(floor && Number(floor[1]) >= 44,
    'FLOOR_LIFT is under the 44pt touch minimum (CONSTITUTION 5.10), so the first frame puts the mascot back on the CTA');
  check(atlasGap && Number(atlasGap[1]) > 0, 'ATLAS_GAP must hold the mascot off the CTA, not flush against it');
  const deck = strip(source('src/components/mobile-lesson/card-deck.tsx'));
  check(/<View style=\{styles\.footer\} onLayout=\{onFooterLayout\}>/.test(deck),
    'the deck footer does not measure itself, so the float sits on Got it');
}

if (failures.length) {
  console.error(`check-bar-pin: ${failures.length} failure(s)`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(
  `check-bar-pin: OK. Rule of 72 ${rule72?.at} grid, ${doubled?.at} stack, 4% rule ${fourPct?.at} grid; ` +
    `investing-fundamentals + personal-finance choices: ${tally.row} row, ${tally.grid} grid, ${tally.stack} stack of ${all.length}; ` +
    `first miss amber, no spring, first try only${UNIT_ONLY ? ' (integration skipped)' : '; lesson.tsx integrated'}.`,
);
