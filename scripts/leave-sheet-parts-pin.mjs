#!/usr/bin/env node
// ============================================================================
// P6 — THE INTEGRATOR'S SEAM: the leave sheet and the payout label (design section 8, items 2
// and 3). Not one of P1 to P5: those five each sit inside one worker's files, and nothing at all
// covered the wiring BETWEEN them, which is where this batch's two remaining defects lived.
//
//   node scripts/leave-sheet-parts-pin.mjs             the real files
//   node scripts/leave-sheet-parts-pin.mjs --selftest   prove every check can go red
//
// WHAT EACH CHECK IS HOLDING, and how it goes wrong silently:
//
//   1. THE X DOES NOT ASK ON A PART CARD. The card already offers "Keep going" and "Done for
//      now", and the part behind it was credited when the card was raised. A confirm sheet on
//      top asks a learner to confirm a choice the screen is already offering, and its own copy
//      ("your progress is saved") is then answering a question nobody asked.
//   2. THE SHEET IS TOLD WHICH PARTS ARE BEHIND THEM. Without the prop the sheet falls back to
//      the pre-parts sentence, which for a learner two parts into a fourteen step lesson reads
//      as the old one-pointer promise and understates what they keep.
//   3. THE NAMES ARE FILTERED THROUGH THIS RUN'S SEGMENTS. The record is keyed by kind so it
//      survives a curriculum sync; the cost is that a sync removing a lesson's keyTermsCards
//      leaves a 'vocab' in `done` for a lesson that no longer has one. Read raw, the sheet names
//      a part the next open cannot deliver. Same shape W5 fixed on the path ring.
//   4. THE SHEET OWNS NO PART NAMES. A hardcoded "Learn" in the sheet is a second authority on
//      the split, and the two drift the first time a part is renamed (CONSTITUTION 6.3).
//   5. ONE SENTENCE, NOT TWO THAT SAY THE SAME THING. "Your progress is saved" and "you already
//      finished Learn" are the same promise; stacking them is CONSTITUTION 5.1.
//   6. THE PLACE LINE SURVIVES. "Step 4 of 9" is the fact that actually settles the question,
//      and it is still true under parts because `segmentEntry` hands back the pointer whenever
//      it sits inside the first unfinished part.
//   7. THE COLLECT LABEL SURVIVES ITS OWN PAYOUT. `completeLesson` deletes the part record in
//      the SAME write that marks the lesson done, so a `segmentRecord` bound straight to the
//      subscription drops to undefined the instant Collect is pressed and `lessonXpRemainder`
//      answers the FULL lesson XP again. Measured on a 50 XP three part lesson: "Collect +25 XP"
//      pays 25 and then relabels itself "Collect +50 XP", for XP nothing will pay
//      (CONSTITUTION 3.1). On the first lesson ever finished the 17c sheet opens over this
//      screen instead of leaving, so the wrong figure sits there until it is dismissed.
// ============================================================================
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LESSON = 'src/app/lesson.tsx';
const SHEET = 'src/components/leave-lesson-sheet.tsx';

const read = (p) => readFileSync(join(ROOT, p), 'utf8');

/**
 * Comments out, always, before any scan.
 *
 * Both files explain themselves by quoting the code they are about: the sheet's own comment says
 * `adoptLegacySegments` and `xpPaid: 0`, and lesson.tsx's says `lessonSegments:
 * withoutSegmentRecord(...)`. A scan that reads comments passes on the prose and fails on
 * nothing, which is the shape of a check that has never once been able to go red
 * (CONSTITUTION 1.5, and the reduced_motion_audit.py incident behind it).
 */
const strip = (t) => t
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
  .replace(/([^:"'`\\])\/\/.*$/gm, '$1');

/** The body of `function <name>(` by brace matching, so a check cannot match a different scope. */
function bodyOf(src, opener) {
  const at = src.indexOf(opener);
  if (at < 0) return null;
  let i = src.indexOf('{', at);
  if (i < 0) return null;
  let depth = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') {
      depth--;
      if (depth === 0) return src.slice(i, j + 1);
    }
  }
  return null;
}

/** The props passed to `<LeaveLessonSheet …>`, up to its closing `/>`. */
function sheetCall(src) {
  const at = src.indexOf('<LeaveLessonSheet');
  if (at < 0) return null;
  const end = src.indexOf('/>', at);
  return end < 0 ? null : src.slice(at, end);
}

function findings(lessonRaw, sheetRaw) {
  const lesson = strip(lessonRaw);
  const sheet = strip(sheetRaw);
  const f = [];
  const check = (ok, message) => { if (!ok) f.push(message); };

  // ── 1. the X does not ask on a part card ──────────────────────────────────
  const requestExit = bodyOf(lesson, 'function requestExit(');
  check(requestExit !== null, 'lesson.tsx: requestExit is gone, so the header X has no confirm path at all');
  check(requestExit !== null && /segmentBreak === null/.test(requestExit),
    'lesson.tsx: requestExit confirms on a part card too. The part behind the card is already '
    + 'credited and the card itself offers "Done for now", so the sheet asks the learner to '
    + 'confirm a choice the screen is already offering');
  check(requestExit !== null && /idx > 0 && idx < DONE/.test(requestExit),
    'lesson.tsx: requestExit lost the shipped `idx > 0 && idx < DONE` guard, so the sheet is '
    + 'offered on the terminal screens where the lesson is already finished and paid');

  // ── 2 and 3. the sheet is told which parts are behind them, correctly ─────
  const call = sheetCall(lesson);
  check(call !== null, 'lesson.tsx: <LeaveLessonSheet> is not mounted');
  check(call !== null && /donePartNames=\{donePartNames\}/.test(call),
    'lesson.tsx: the leave sheet is not told which parts are finished, so it falls back to the '
    + 'pre-parts sentence and understates what a learner two parts in actually keeps');
  const derived = /const donePartNames = useMemo\(\(\) => \{[\s\S]*?\}, \[/.exec(lesson);
  check(derived !== null, 'lesson.tsx: donePartNames is not derived in a memo next to xpRemaining');
  check(derived !== null && /segments\.filter\(\(s\) => done\.includes\(s\.kind\)\)/.test(derived[0]),
    'lesson.tsx: donePartNames is not filtered through THIS run\'s segments. A curriculum sync '
    + 'that removes a lesson\'s keyTermsCards leaves a "vocab" in the kind-keyed record for a '
    + 'lesson that no longer has one, and the sheet then names a part the next open cannot open');
  check(derived !== null && /if \(!segmented\) return \[\];/.test(derived[0]),
    'lesson.tsx: donePartNames is not empty on a replay. The part layer is off there (owner '
    + 'decision) and nothing is credited, so naming a finished part is a claim about a run that '
    + 'is paying nothing');

  // ── 4, 5 and 6. the sheet's copy ──────────────────────────────────────────
  check(/donePartNames\?: readonly string\[\]/.test(sheet),
    'leave-lesson-sheet.tsx: the donePartNames prop is gone');
  for (const name of ['Learn', 'Vocab', 'Practice']) {
    check(!new RegExp(`['"\`][^'"\`]*\\b${name}\\b`).test(sheet),
      `leave-lesson-sheet.tsx: the sheet spells "${name}" itself. Part names belong to `
      + 'lesson.tsx\'s PART_NAME; a second copy here drifts the first time a part is renamed '
      + '(CONSTITUTION 6.3)');
  }
  check(/You already finished \$\{names\}/.test(sheet),
    'leave-lesson-sheet.tsx: the banked sentence no longer names the finished parts from the prop');
  check(!/XP|xp is yours|earned/.test(sheet.replace(/[A-Za-z]xp/gi, '')),
    'leave-lesson-sheet.tsx: the sheet claims XP for the finished parts. A lesson already in '
    + 'progress when parts shipped adopts them through adoptLegacySegments, which pays nothing, '
    + 'so that claim is false for exactly the learners it would be shown to (CONSTITUTION 3.1)');
  check(/\{banked \?\? 'Your progress on this lesson is saved\.'\} \{place\}/.test(sheet),
    'leave-lesson-sheet.tsx: the banked line stacks on "Your progress on this lesson is saved" '
    + 'instead of replacing it. Both say the same thing and only one of them says which part '
    + '(CONSTITUTION 5.1, say a thing once)');
  check(/We'll bring you back to step \$\{String\(stepNumber\)\} of \$\{String\(stepCount\)\}\./.test(sheet),
    'leave-lesson-sheet.tsx: the place line is gone. It is still true under parts, because '
    + 'segmentEntry hands back the saved pointer whenever it sits inside the first unfinished part');

  // ── 7. the Collect label survives its own payout ──────────────────────────
  check(/const liveSegmentRecord = useApp\(\(s\) => s\.lessonSegments\[/.test(lesson),
    'lesson.tsx: the part record is no longer subscribed, so the Collect figure is a snapshot '
    + 'React has no reason to refresh');
  check(/const segmentRecord = liveSegmentRecord \?\? paidOutRecord;/.test(lesson),
    'lesson.tsx: segmentRecord is bound straight to the live subscription. completeLesson '
    + 'deletes the record in the same write that marks the lesson done, so the moment Collect is '
    + 'pressed lessonXpRemainder answers the FULL lesson XP again and the button relabels itself '
    + '"Collect +50 XP" for XP nothing will pay (CONSTITUTION 3.1)');
  const advance = bodyOf(lesson, 'const advance = (');
  const capture = 'setPaidOutRecord(readSegmentRecord(useApp.getState().lessonSegments[completedId]));';
  const completes = 'useApp.getState().completeLesson(completedId, xp, minutesSpent);';
  check(advance !== null && advance.indexOf(capture) >= 0
    && advance.indexOf(capture) < advance.indexOf(completes),
    'lesson.tsx: the payout record is not captured BEFORE completeLesson runs. Captured after, it '
    + 'reads the record completeLesson has already deleted and holds nothing, which is the same '
    + 'as not holding it at all');
  const load = bodyOf(lesson, 'loadCourseLessons(courseId)');
  check(load !== null && /setPaidOutRecord\(undefined\);/.test(load),
    'lesson.tsx: the held payout record is not cleared when a lesson loads, so a second lesson '
    + 'reached without a remount subtracts the FIRST lesson\'s part shares from its Collect label');

  return f;
}

// ── selftest ───────────────────────────────────────────────────────────────
// Each mutation is a real way this seam regresses, applied to the REAL files.
const MUTATIONS = [
  ['the X asks on a part card', 'lesson',
    (s) => s.replace('if (idx > 0 && idx < DONE && segmentBreak === null) {', 'if (idx > 0 && idx < DONE) {'),
    'confirms on a part card'],
  ['the X asks on the terminal screens', 'lesson',
    (s) => s.replace('if (idx > 0 && idx < DONE && segmentBreak === null) {', 'if (segmentBreak === null) {'),
    'lost the shipped'],
  ['the sheet is not told about the parts', 'lesson',
    (s) => s.replace('        donePartNames={donePartNames}\n', ''),
    'not told which parts are finished'],
  ['the done parts are read raw off the record', 'lesson',
    (s) => s.replace('return segments.filter((s) => done.includes(s.kind)).map((s) => PART_NAME[s.kind]);',
      'return done.map((k) => PART_NAME[k]);'),
    'not filtered through THIS run'],
  ['the replay guard is dropped', 'lesson',
    (s) => s.replace('    if (!segmented) return [];\n', ''),
    'not empty on a replay'],
  ['segmentRecord is bound straight to the subscription', 'lesson',
    (s) => s.replace('const segmentRecord = liveSegmentRecord ?? paidOutRecord;', 'const segmentRecord = liveSegmentRecord;'),
    'bound straight to the live subscription'],
  ['the payout record is captured after the write that destroys it', 'lesson',
    (s) => s.replace(
      '      setPaidOutRecord(readSegmentRecord(useApp.getState().lessonSegments[completedId]));\n      useApp.getState().completeLesson(completedId, xp, minutesSpent);',
      '      useApp.getState().completeLesson(completedId, xp, minutesSpent);\n      setPaidOutRecord(readSegmentRecord(useApp.getState().lessonSegments[completedId]));'),
    'not captured BEFORE completeLesson'],
  ['the held payout record is never cleared for a new lesson', 'lesson',
    (s) => s.replace('        setPaidOutRecord(undefined);\n', ''),
    'not cleared when a lesson loads'],
  ['the sheet spells a part name itself', 'sheet',
    (s) => s.replace('    : donePartNames[0];', "    : donePartNames[0] ?? 'Learn';"),
    'spells "Learn" itself'],
  ['the banked line stacks on the generic one', 'sheet',
    (s) => s.replace("{banked ?? 'Your progress on this lesson is saved.'} {place}",
      'Your progress on this lesson is saved. {banked} {place}'),
    'stacks on'],
  ['the place line is dropped', 'sheet',
    (s) => s.replace("? `We'll bring you back to step ${String(stepNumber)} of ${String(stepCount)}.`",
      "? `We'll bring you back.`"),
    'place line is gone'],
  ['the sheet promises the XP', 'sheet',
    (s) => s.replace('finished ${names}, and ${donePartNames.length > 1', 'finished ${names} and the XP is yours, and ${donePartNames.length > 1'),
    'claims XP'],
  ['the prop is removed', 'sheet',
    (s) => s.replace('donePartNames?: readonly string[];', 'donePartNames?: string[] | undefined | null;'),
    'donePartNames prop is gone'],
];

const files = { lesson: read(LESSON), sheet: read(SHEET) };

if (process.argv.includes('--selftest')) {
  const problems = [];
  const clean = findings(files.lesson, files.sheet);
  if (clean.length > 0) problems.push(`the real files already fail, so no mutation proves anything: ${clean[0]}`);
  for (const [name, which, mutate, expect] of MUTATIONS) {
    const next = { ...files, [which]: mutate(files[which]) };
    if (next[which] === files[which]) {
      problems.push(`${name}: the mutation changed nothing, so this check was never exercised`);
      continue;
    }
    const got = findings(next.lesson, next.sheet);
    if (!got.some((m) => m.includes(expect))) {
      problems.push(`${name}: expected a finding containing ${JSON.stringify(expect)}, got ${JSON.stringify(got)}`);
    }
  }
  if (problems.length > 0) {
    for (const p of problems) console.error(`  ✗ ${p}`);
    process.exit(1);
  }
  console.log(`leave-sheet-parts-pin selftest ok — ${String(MUTATIONS.length)} regressions each go red`);
  process.exit(0);
}

const found = findings(files.lesson, files.sheet);
if (found.length > 0) {
  for (const message of found) console.error(`  ✗ ${message}`);
  process.exit(1);
}
console.log('leave-sheet-parts-pin ok — the X never asks on a part card, the leave sheet names the '
  + 'finished parts from this run\'s own segments without claiming their XP, and the Collect label '
  + 'holds the remainder across its own payout');
