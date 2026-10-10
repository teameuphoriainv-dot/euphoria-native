#!/usr/bin/env node
// ============================================================================
// P3 — THE LESSON RUNNER'S PART LAYER (design section 4).
//
//   node scripts/lesson-segment-runner-pin.mjs             the real files
//   node scripts/lesson-segment-runner-pin.mjs --selftest   prove every check can go red
//
// WHY THIS EXISTS. A lesson now splits into Learn / Vocab / Practice (owner decision,
// 2026-09-22). Every check below is a way that split quietly regresses into either paying a
// learner twice or losing a part card, and NOT ONE of them shows up as a crash, a type error or
// a red screen. They show up as a number.
//
//   1. ORDER. The part hook must sit above `if (idx === total && hasChallenge)`. 16 lessons in
//      the corpus end their vocab on the last screen and carry the mastery challenge as their
//      whole Practice, so for those two the boundary and the challenge intercept are the SAME
//      screen; below it, their last part card never appears and the lesson pays the part's XP
//      at the end instead. Nothing throws.
//   2. D1, DOUBLE-COUNTED MINUTES. `openedAt` is set once per load. Without the reset in Keep
//      going, part 2 re-counts part 1's minutes and part 3 re-counts both, which crosses the
//      daily goal early and pays the +50 bonus for work already counted.
//   3. THE CARD'S HANDLERS pay nothing and route nowhere terminal. `completeLesson(` in Keep
//      going would pay the whole lesson at part 1; `openLessonScreen(DONE)` would break
//      mastery-challenge-parity-regression's rule that the challenge's onPass is the only route
//      into the completion screen.
//   4. THE WHOLE-LESSON REWARDS STAY WHOLE-LESSON. first_lesson_completed, the notification ask,
//      the 17c trial sheet and the full trail celebration all mean "a lesson is finished". Any
//      of them reachable from a part fires three times per lesson, and the 17c copy ("That's
//      your first lesson done") becomes false.
//   5. NOTHING WALKS PAST A RAISED CARD. `advance` refuses, the check bar comes down and the
//      floating Ask Atlas hides; otherwise a live Continue sits under the overlay and skips the
//      choice the card exists to offer.
//   6. THE LAST SCREEN OFFERS THE REMAINDER. `Collect +${xp} XP` after two parts have been paid
//      is a number the ledger will not pay (CONSTITUTION 3.1).
//   7. drive.py. Its generic control scan ends with 'done', which substring-matches the card's
//      "Done for now", and its done-heuristic looks for '+30 xp', which a 15 XP share renders
//      exactly under the Double XP item. Both would report a lesson as passed at part 1.
//   8. THE STORE KEEPS THE RECORD. `lessonSegments` missing from partialize loses every paid
//      part on restart and the final part then pays the lesson twice; left in reset() or
//      deleteProfile() it survives a wipe.
// ============================================================================
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LESSON = 'src/app/lesson.tsx';
const STORE = 'src/lib/store.ts';
const DRIVER = 'scripts/anim/drive.py';

const read = (p) => readFileSync(join(ROOT, p), 'utf8');

/**
 * Comments out, always, before any scan.
 *
 * Every comment in lesson.tsx's part layer NAMES the thing it prevents: "never
 * `openLessonScreen(DONE)`", "would call `completeLesson(`". A scan that reads comments passes on
 * the prose that explains the defect and fails on nothing, which is the shape of a pin that has
 * never once been able to go red.
 */
const strip = (t) => t
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/.*$/gm, '')
  .replace(/([^:"'`\\])\/\/.*$/gm, '$1');

/** Python comments only run to end of line, and no `#` in this file sits inside a string. */
const stripPy = (t) => t.replace(/^[ \t]*#.*$/gm, '').replace(/"""[\s\S]*?"""/g, '');

/**
 * The body of `const <name> = () => {` or `function <name>(`, by brace matching.
 *
 * A line-count window would silently shrink to nothing the day someone adds a comment, and the
 * checks inside it would then pass on an empty string. This returns null when the function is
 * gone, so "the handler no longer exists" fails rather than vacuously passing.
 */
function bodyOf(src, opener) {
  const start = src.indexOf(opener);
  if (start < 0) return null;
  let i = src.indexOf('{', start + opener.length - 1);
  if (i < 0) return null;
  let depth = 0;
  for (let j = i; j < src.length; j += 1) {
    if (src[j] === '{') depth += 1;
    else if (src[j] === '}') {
      depth -= 1;
      if (depth === 0) return src.slice(i, j + 1);
    }
  }
  return null;
}

/** Text between two markers, or '' when either is missing (which its own check reports). */
function between(src, from, to) {
  const a = src.indexOf(from);
  if (a < 0) return '';
  const b = src.indexOf(to, a + from.length);
  return src.slice(a, b < 0 ? undefined : b);
}

export function findings(lessonRaw, storeRaw, driverRaw) {
  const src = strip(lessonRaw);
  const store = strip(storeRaw);
  const driver = stripPy(driverRaw);
  const f = [];
  const check = (ok, message) => { if (!ok) f.push(message); };

  // ── 1. the hook, and where it sits ────────────────────────────────────────
  const hookAt = src.indexOf('const endK = replay ? null : segmentEndingAt(segments, idx);');
  const challengeAt = src.indexOf('if (idx === total && hasChallenge) {');
  check(hookAt >= 0, 'lesson.tsx: the part hook (segmentEndingAt) is gone, so no part is ever credited');
  check(challengeAt >= 0, 'lesson.tsx: the mastery challenge intercept is gone; this pin has drifted from the code');
  check(hookAt >= 0 && challengeAt >= 0 && hookAt < challengeAt,
    'lesson.tsx: the part hook sits BELOW the challenge intercept. The 16 lessons whose Practice '
    + 'is the challenge alone end their vocab on the last screen, so their card never fires');
  check(/completeLessonSegment\(lessonKey\(courseId, lessonNum\), seg\.kind, share, \(Date\.now\(\) - openedAt\.current\) \/ 60000\)/.test(src),
    'lesson.tsx: the part credit no longer passes (id, kind, share, elapsed minutes) to the store');
  check(/queueLessonTrailCelebration\(lessonKey\(courseId, lessonNum\), \{ segment: seg\.kind \}\)/.test(src),
    'lesson.tsx: a part credit no longer hands the trail a SEGMENT, so the path would play the '
    + 'whole-lesson bounce and draw a connector to a node that is still locked');

  // ── 2 and 3. the card's two handlers ──────────────────────────────────────
  const keepGoing = bodyOf(src, 'const keepGoing = () => {');
  check(keepGoing !== null, 'lesson.tsx: the Keep going handler is gone');
  if (keepGoing) {
    check(/openedAt\.current = Date\.now\(\);/.test(keepGoing),
      'lesson.tsx: Keep going does not reset openedAt (defect D1): part 2 re-counts part 1\'s '
      + 'minutes, crosses the daily goal early and pays the +50 bonus for time already credited');
    check(!/openLessonScreen\(DONE\)/.test(keepGoing),
      'lesson.tsx: Keep going routes into DONE. The challenge onPass is the only route into the '
      + 'completion screen (mastery-challenge-parity-regression)');
    check(!/completeLesson\(/.test(keepGoing),
      'lesson.tsx: Keep going calls completeLesson, which would pay the whole lesson at part 1');
    check(/setChallengeStage\('intro'\)/.test(keepGoing),
      'lesson.tsx: Keep going cannot open a challenge-only Practice, so 16 lessons dead-end on their card');
  }
  const doneForNow = bodyOf(src, 'const doneForNow = () => {');
  check(doneForNow !== null, 'lesson.tsx: the Done for now handler is gone');
  if (doneForNow) {
    // `leave(false)` since 2026-09-30: a part credit leaves without the Up next beat a FINISHED
    // lesson gets, but still through leave(), so a queued reward is shown, never dropped.
    check(/leave\((?:false)?\);/.test(doneForNow) && !/exitLesson\(\)/.test(doneForNow),
      'lesson.tsx: Done for now exits directly instead of through leave(), so any reward the '
      + 'credit queued is dropped rather than shown');
    check(!/completeLesson\(/.test(doneForNow) && !/completeLessonSegment\(/.test(doneForNow),
      'lesson.tsx: Done for now pays something. The part was already credited when the card rose');
  }

  // ── 4. the whole-lesson rewards stay at the end of the lesson ─────────────
  const endAt = src.indexOf('const completedId = lessonKey(courseId, lessonNum);');
  check(endAt >= 0, 'lesson.tsx: the lesson-end branch is gone; this pin has drifted from the code');
  for (const [needle, why] of [
    ['Ev.firstLesson', 'the activation event would fire on a PART'],
    ['applyDailyNudge(', 'the notification permission ask would be thrown at part 1'],
    ['setTrialReward(true)', 'the 17c sheet would claim "that\'s your first lesson done" after one part'],
    ['queueLessonTrailCelebration(completedId)', 'the path would bounce the node and unlock the next lesson after a part'],
  ]) {
    const first = src.indexOf(needle);
    check(first >= 0, `lesson.tsx: ${needle} has disappeared from the lesson end`);
    check(first < 0 || first > endAt, `lesson.tsx: ${needle} escaped the lesson-end branch, so ${why}`);
    check(first < 0 || src.indexOf(needle, first + 1) < 0,
      `lesson.tsx: ${needle} appears twice, so ${why}`);
  }

  // ── 5. nothing walks past a raised card ───────────────────────────────────
  const advance = bodyOf(src, 'const advance = () => {');
  check(advance !== null, 'lesson.tsx: advance() is gone; this pin has drifted from the code');
  if (advance) {
    const refuse = advance.indexOf('if (segmentBreak !== null) return;');
    check(refuse >= 0,
      'lesson.tsx: advance() does not refuse while a part card is up, so any surviving CTA walks '
      + 'straight past the card into the next screen');
    check(refuse < 0 || refuse < advance.indexOf('if (idx === 0 && atlasIntroNeeded'),
      'lesson.tsx: the part-card refusal is not the FIRST thing advance() does, so an earlier '
      + 'branch can still fire underneath the card');
  }
  check(/challengeStage === 'none' && isChoice && !whyOpen && segmentBreak === null \?/.test(src),
    'lesson.tsx: the check bar stays mounted under the part card, which is two next actions on '
    + 'one screen and the hidden one skips the part choice');
  // The vocab clause was added after this pin: AtlasConversation is Atlas at 96pt, so the float is
  // a second mascot there too (photographed 2026-09-22, personal-finance:9 part 2). Matched loosely
  // between !deckAtlas and segmentBreak so a new exclusion does not read as the part card's guard
  // going missing, but segmentBreak === null itself is still required.
  // Since 2026-09-28 the float stays MOUNTED (its tutor sheet is what an in-content Atlas opens)
  // and the same guard drives `hidden={!(...)}` instead of a ternary; either form satisfies this.
  check(/atlasContext && !deckAtlas &&[^;{}]{0,110}segmentBreak === null(?: \?|\)\})/.test(src),
    'lesson.tsx: the floating Ask Atlas is not hidden by the part card, so two mascots share the '
    + 'screen (CONSTITUTION 5.6) and one of them sits on Keep going');
  check(/<SegmentFinishCard/.test(src) && /onKeepGoing=\{keepGoing\}/.test(src) && /onDoneForNow=\{doneForNow\}/.test(src),
    'lesson.tsx: the part card is not mounted with both handlers');
  const doneBlock = between(src, 'idx === DONE && (', 'idx === STREAK');
  check(!/<SegmentFinishCard/.test(doneBlock),
    'lesson.tsx: the part card is mounted inside the DONE block, where it can only show after '
    + 'the lesson is already over');

  // the practice announcement, WRAPPED and not edited
  check(/shouldAnnouncePractice\(steps\[idx - 1\], steps\[idx\]\)/.test(src),
    'lesson.tsx: the pinned reading-to-practice call is gone (step-mode-transition-regression)');
  check(/shouldAnnouncePractice\(steps\[idx - 1\], steps\[idx\]\)\s*\n?\s*&& !\(segmented && isSegmentBoundary\(segments, idx\)\)/.test(src),
    'lesson.tsx: "Now quiz yourself" is not suppressed at a part boundary, so the transition '
    + 'plays on top of the learner who just chose Keep going (276 lessons share that edge)');

  // ── 6. the last screen offers what the store will actually pay ────────────
  check(/const xpRemaining = lessonXpRemainder\(readSegmentRecord\(segmentRecord\), xp\);/.test(src),
    'lesson.tsx: the remaining XP is no longer computed with the store\'s own arithmetic');
  check(/`Collect \+\$\{xpRemaining\} XP`/.test(src) && !/`Collect \+\$\{xp\} XP`/.test(src),
    'lesson.tsx: Collect offers the whole lesson XP again, which announces the parts a second '
    + 'time and promises more than completeLesson pays (CONSTITUTION 3.1)');
  check(/xp=\{xpRemaining\}/.test(src),
    'lesson.tsx: the completion screen shows the whole lesson XP again rather than the remainder');
  check(/<LessonProgress percent=\{progressPercent\} \/>/.test(src),
    'lesson.tsx: the replay path lost the single progress bar (lesson-design-parity-regression)');
  check(/<LessonSegmentBar fills=\{segmentedProgress\(segments, idx, phase\)\} \/>/.test(src),
    'lesson.tsx: the header no longer draws one track per part');

  // resume and the one-off backfill
  check(/adoptLegacySegments\(resumeKey, legacyDoneKinds\(segs, pointer\)\)/.test(src),
    'lesson.tsx: a lesson started before parts existed is not adopted, so its finished reading '
    + 'is offered again from the warmup');
  check(/const entry = segmentEntry\(segs, useApp\.getState\(\)\.segmentsDoneFor\(resumeKey\), pointer\);/.test(src),
    'lesson.tsx: the lesson no longer opens on the first unfinished PART');
  check(/if \(segmentHasScreens\(target\)\) \{ setIdx\(target\.first\); setChallengeStage\('none'\); \}/.test(src),
    'lesson.tsx: a ?part= link that clamps back to an earlier part leaves the mastery challenge '
    + 'intro up over a content screen. Measured 22 Sep 2026 over the corpus: all 16 challenge-only '
    + 'lessons open screen 1 with the challenge running, and passing it pays the lesson out from '
    + 'the Learn part. ?part= is not __DEV__-gated, so a deep link reaches it in a release build');

  // ── 7. the driver ─────────────────────────────────────────────────────────
  check(/def at_part_card\(/.test(driver), 'drive.py: cannot recognise the part card at all');
  check(/text = '' if at_part_card\(current_labels\) else ' '\.join\(current_labels\)\.lower\(\)/.test(driver),
    "drive.py: the done-heuristic reads the part card's labels. A 15 XP share under Double XP "
    + "renders '+30 XP', so every sweep would report the lesson finished at part 1");
  check(driver.indexOf("text = '' if at_part_card") < driver.indexOf("if any(k in text for k in ("),
    'drive.py: the part-card blanking no longer precedes the done-heuristic it protects');
  const advPy = driver.indexOf("if at_part_card():");
  const genericPy = driver.indexOf("btn = button('start the challenge'");
  check(advPy >= 0, 'drive.py: advance() has no part-card branch, so it falls through to the generic scan');
  check(advPy >= 0 && genericPy >= 0 && advPy < genericPy,
    "drive.py: the part-card branch sits below the generic control scan, whose last term is "
    + "'done' and substring-matches \"Done for now\" - the driver leaves the lesson at part 1");
  check(/n\[4\]\.strip\(\)\.lower\(\) == 'keep going'/.test(driver),
    'drive.py: Keep going is matched loosely; the only control that continues the lesson must be '
    + 'taken by its exact label');

  // ── 8. the store keeps the record ─────────────────────────────────────────
  check(/lessonSegments: s\.lessonSegments/.test(store),
    'store.ts: lessonSegments is missing from partialize, so every paid part dies with the '
    + 'process and the final part pays the whole lesson a second time');
  const reset = bodyOf(store, 'reset: () =>');
  const wipe = bodyOf(store, 'deleteProfile: () =>');
  check(reset !== null && /lessonSegments: \{\}/.test(reset), 'store.ts: reset() leaves part records behind');
  check(wipe !== null && /lessonSegments: \{\}/.test(wipe), 'store.ts: deleteProfile() leaves part records behind');

  return f;
}

// ── selftest ───────────────────────────────────────────────────────────────
// Every mutation below is a real way this layer regresses, applied to the REAL files, and each
// must produce a finding that names it. A check that cannot be made to fire is not a check.
const MUTATIONS = [
  ['hook moved below the challenge intercept', 'lesson', (s) => {
    const hook = s.slice(s.indexOf('    const endK = replay'), s.indexOf('    if (idx === total && hasChallenge) {'));
    return s.replace(hook, '').replace('    if (idx < STREAK) {', `${hook}    if (idx < STREAK) {`);
  }, 'sits BELOW the challenge intercept'],
  ['openedAt reset removed from Keep going (D1)', 'lesson',
    (s) => s.replace('    setSegmentBreak(null);\n    openedAt.current = Date.now();', '    setSegmentBreak(null);'),
    'defect D1'],
  ['Keep going routes into DONE', 'lesson',
    (s) => s.replace('    if (segmentHasScreens(next)) openLessonScreen(next.first);', '    if (segmentHasScreens(next)) openLessonScreen(DONE);'),
    'routes into DONE'],
  ['Done for now exits directly', 'lesson',
    (s) => s.replace('  const doneForNow = () => {\n    setSegmentBreak(null);\n    leave(false);', '  const doneForNow = () => {\n    setSegmentBreak(null);\n    exitLesson();'),
    'exits directly instead of through leave()'],
  ['the trail celebration fires for a part too', 'lesson',
    (s) => s.replace('        queueLessonTrailCelebration(lessonKey(courseId, lessonNum), { segment: seg.kind });', '        queueLessonTrailCelebration(completedId);'),
    'appears twice'],
  ['advance no longer refuses under a card', 'lesson',
    (s) => s.replace('    if (segmentBreak !== null) return;', ''),
    'does not refuse while a part card is up'],
  ['the check bar stays up under the card', 'lesson',
    (s) => s.replace("{challengeStage === 'none' && isChoice && !whyOpen && segmentBreak === null ? (", "{challengeStage === 'none' && isChoice && !whyOpen ? ("),
    'check bar stays mounted'],
  ['Collect offers the whole lesson XP again', 'lesson',
    (s) => s.replace('`Collect +${xpRemaining} XP`', '`Collect +${xp} XP`'),
    'whole lesson XP again'],
  ['the practice announcement is no longer suppressed', 'lesson',
    (s) => s.replace('shouldAnnouncePractice(steps[idx - 1], steps[idx])\n        && !(segmented && isSegmentBoundary(segments, idx))', 'shouldAnnouncePractice(steps[idx - 1], steps[idx])'),
    'not suppressed at a part boundary'],
  ['the driver reads the done-heuristic under the card', 'driver',
    (s) => s.replace("text = '' if at_part_card(current_labels) else ' '.join(current_labels).lower()",
      "text = ' '.join(current_labels).lower()"),
    "done-heuristic reads the part card's labels"],
  ['the driver takes the part card after the generic scan', 'driver', (s) => {
    const branch = s.slice(s.indexOf('    if at_part_card():'), s.indexOf("    # TAP-REVEAL GATE."));
    return s.replace(branch, '').replace('    if not allow_guess:', `${branch}    if not allow_guess:`);
  }, 'below the generic control scan'],
  ['?part= leaves the challenge intro up over an earlier part', 'lesson',
    (s) => s.replace("if (segmentHasScreens(target)) { setIdx(target.first); setChallengeStage('none'); }",
      'if (segmentHasScreens(target)) setIdx(target.first);'),
    'leaves the mastery challenge'],
  ['lessonSegments dropped from partialize', 'store',
    (s) => s.replace('lessonSegments: s.lessonSegments, ', ''),
    'missing from partialize'],
];

const files = { lesson: read(LESSON), store: read(STORE), driver: read(DRIVER) };

if (process.argv.includes('--selftest')) {
  const problems = [];
  const clean = findings(files.lesson, files.store, files.driver);
  if (clean.length > 0) problems.push(`the real files already fail, so no mutation proves anything: ${clean[0]}`);
  for (const [name, which, mutate, expect] of MUTATIONS) {
    const next = { ...files, [which]: mutate(files[which]) };
    if (next[which] === files[which]) {
      problems.push(`${name}: the mutation changed nothing, so this check was never exercised`);
      continue;
    }
    const got = findings(next.lesson, next.store, next.driver);
    if (!got.some((m) => m.includes(expect))) {
      problems.push(`${name}: expected a finding containing ${JSON.stringify(expect)}, got ${JSON.stringify(got)}`);
    }
  }
  if (problems.length > 0) {
    for (const p of problems) console.error(`  ✗ ${p}`);
    process.exit(1);
  }
  console.log(`lesson-segment-runner-pin selftest ok — ${String(MUTATIONS.length)} regressions each go red`);
  process.exit(0);
}

const found = findings(files.lesson, files.store, files.driver);
if (found.length > 0) {
  for (const message of found) console.error(`  ✗ ${message}`);
  process.exit(1);
}
console.log('lesson-segment-runner-pin ok — the part hook is above the challenge intercept, Keep going '
  + 'resets the clock and pays nothing, the lesson-end rewards stay whole-lesson, nothing advances under '
  + 'the card, the last screen offers the remainder, and drive.py takes Keep going before "Done for now"');
