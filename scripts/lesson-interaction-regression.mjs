#!/usr/bin/env node

import { readFileSync } from 'node:fs';

const lesson = readFileSync('src/app/lesson.tsx', 'utf8');
const calc = readFileSync('src/components/calc-blanks.tsx', 'utf8');
const shop = readFileSync('src/app/shop.tsx', 'utf8');
const failures = [];

function requires(source, pattern, message) {
  if (!pattern.test(source)) failures.push(message);
}

console.log('\nLesson keyboard, feedback, and heart-wall interactions\n');

requires(
  lesson,
  /<KeyboardAvoidingView[\s\S]*?behavior=\{Platform\.OS === 'ios' \? 'padding' : undefined\}/,
  'the lesson shell must keep typed answers above the keyboard',
);
requires(
  lesson,
  /norm\.kind === 'calc'[\s\S]*?keyboardDismissMode="interactive"[\s\S]*?keyboardShouldPersistTaps="handled"/,
  'calculation steps must dismiss on drag and accept the first control tap',
);
/*
 * Still ONE layout before and after grading; the only thing that changes is the room reserved at
 * the bottom, which now follows the check bar's measured height (see check-bar-pin 6a) instead of
 * the fixed FOOTER_CLEARANCE that let a tall bar cover the last option.
 */
requires(
  lesson,
  /contentContainerStyle=\{\[styles\.choiceContent, \{ paddingBottom: Math\.max\(FOOTER_CLEARANCE, checkBarH \+ CHECK_BAR_GAP\) \}\]\}/,
  'quiz content must keep one stable scroll layout before and after grading, reserving the bar it is under',
);
/*
 * FEEDBACK NO LONGER MIRRORS THE WEB LESSON, AND THAT IS THE POINT.
 *
 * This used to require the graded feedback, a FeedbackBanner and the next action to sit inline
 * under the question, matching the web reading order. On a phone that does not fit. Measured over
 * the corpus: 7,553 authored explanation strings behind 1,307 questions, median 285 characters,
 * longest 760, and 71% over roughly five lines on a 393pt screen. Stacked under a question and its
 * four options, the Continue button was pushed off the bottom of the display. Sriyan hit it on the
 * compound interest lesson and the fix was to give the explanation its own page.
 *
 * The invariant that still matters is not "inline", it is "the learner is never stranded": every
 * graded state must put a next action on screen. That is what is asserted now, on both paths.
 *   - explanation path: the page renders and the caller passes Continue into it
 *   - fast path (right answer, nothing authored to say): Continue is still inline
 */
requires(
  lesson,
  /<LessonExplanation[\s\S]*?<SlabButton label="Continue" full onPress=\{advance\}[\s\S]*?<\/LessonExplanation>/,
  'the explanation page must carry its own Continue so the learner is never stranded',
);
/*
 * THE FAST PATH MOVED ONTO THE CHECK BAR (owner decision 4, 2026-09-22). Every graded choice now
 * gets the slide-up LessonCheckBar, which carries Continue for 'correct' and 'answer' and Try again
 * for a first miss, so the inline SparkBurst + Continue under the options is gone (it would have
 * been a second next action on one screen). "Never stranded" now means the bar is mounted for
 * choice steps and its Continue is the lesson's own advance.
 */
requires(
  lesson,
  /<LessonCheckBar[\s\S]*?verdict=\{verdict\}[\s\S]*?onContinue=\{advance\}[\s\S]*?onTryAgain=\{tryAgain\}/,
  'a graded answer must put its next action on the check bar (Continue, or Try again on a first miss)',
);
requires(
  lesson,
  /header: \{[^}]*zIndex: 20/,
  'the lesson close control must remain above the out-of-hearts wall',
);
requires(
  lesson,
  /function exitLesson\(\) \{\s*Keyboard\.dismiss\(\);\s*if \(router\.canGoBack\(\)\) router\.back\(\);\s*else router\.replace\('\/\(tabs\)\/learn'\);\s*\}/,
  'every lesson exit must fall back to the pathway when a cold deep link has no back stack',
);
requires(
  lesson,
  // `leave(finished = true)` since 2026-10-01: a finished lesson routes to /up-next (which falls
  // back through router.canGoBack the same way), a mid-lesson leave still ends in exitLesson().
  /function leave\([^)]*\) \{[\s\S]*?exitLesson\(\);/,
  'repeat completion must use the safe lesson exit instead of a bare router.back()',
);
requires(
  lesson,
  /label="Back" full onPress=\{exitLesson\}/,
  'the missing-lesson Back action must work when the route was cold deep linked',
);
requires(
  lesson,
  /onPress=\{exitLesson\}[\s\S]*?accessibilityLabel="Close lesson"/,
  'the lesson header Close action must work when the route was cold deep linked',
);
requires(
  lesson,
  /idx > 0 && idx < DONE && challengeStage === 'none'[\s\S]*?onPress=\{previousScreen\}[\s\S]*?accessibilityLabel="Previous lesson step"/,
  'every in-progress lesson screen must expose a previous-step control, and no terminal screen may',
);
/*
 * `idx < DONE` is load-bearing, not tidiness. Back used to be offered on the completion
 * celebration and the streak screen. On the 295 of 300 lessons that carry a mastery challenge that
 * was a way to LOSE a lesson you had already won: Back lands on the last content screen, Continue
 * from the last content screen re-enters the challenge, and the challenge's onFail is exitLesson,
 * so three missed questions threw the learner out with no XP, no coins, no streak day and no
 * reward cards. completeLesson only runs on Continue from the streak screen, so nothing had been
 * credited yet.
 */
requires(
  lesson,
  /visitedScreenState\.current\.set\(idx,[\s\S]*?openLessonScreen\(idx - 1\)/,
  'going back must preserve submitted screen state instead of restarting the lesson',
);
requires(
  lesson,
  /heartWall: \{ position: 'absolute',[^}]*top: 56/,
  'the out-of-hearts wall must begin below the lesson header',
);
requires(
  lesson,
  /pathname: '\/shop', params: \{ returnTo: 'lesson', item: 'heart_refill' \}/,
  'a heart refill detour must tell the shop to return to the paused lesson',
);
requires(
  lesson,
  /const heartWallVisible = outOfHearts && hearts <= 0;/,
  'heart-wall visibility must follow the real balance so failed refills stay blocked and successful refills resume',
);
requires(
  lesson,
  /accessibilityLabel="Leave the lesson"[\s\S]*?setOutOfHearts\(false\); exitLesson\(\);/,
  'the free heart-wall exit must use the cold-deep-link-safe lesson exit',
);
requires(
  lesson,
  /const heartLimited = tier !== 'pro'/,
  'Pro members must not be constrained by a stale persisted heart count',
);
requires(
  lesson,
  /if \(heartLimited && isChoice && justGraded && checked[^\n]+hearts <= 0\)/,
  'the out-of-hearts wall must never trap a Pro member',
);
/*
 * `justGraded` was added to that condition, so this pin is stricter than it was, not looser.
 *
 * The wall used to fire on `checked` alone. `openLessonScreen` RESTORES `checked` when you walk
 * back into a question you already answered, so once the hearts were gone every past mistake
 * became its own wall: get walled on screen 9, tap Previous to reread screen 5, and Continue on
 * screen 5 raised the wall again for a heart spent minutes earlier. The lesson could then not be
 * finished from any screen the learner had ever got wrong. The heart is charged exactly once, by
 * `gradeChoice`, so the gate belongs to the grading and not to the graded state that outlives it.
 *
 * Pinned in both directions: the flag must be set where the heart is spent, and cleared wherever a
 * screen is re-opened, or the fix is half-applied and the wall either never fires or never stops.
 */
/*
 * THE WALL READS THE FIRST TRY, not the last pick (final-gate review, 2026-09-22). With the check
 * bar, a first miss that spends the last heart shows Try again; the old condition tested the pick
 * on screen, so a right answer on the retry turned `!isChoiceCorrect(norm, pick)` false and the
 * learner walked past the wall at zero hearts. The heart was spent by attempt one, so the gate
 * reads attempt one.
 */
requires(
  lesson,
  /if \(heartLimited && isChoice && justGraded && checked && attempts\[0\] === false && hearts <= 0\)/,
  'the out-of-hearts wall must follow the FIRST try, or a right retry walks past it at zero hearts',
);
/*
 * NO HINT AFTER THE FIRST CHECK (final-gate review, 2026-09-22). Try again re-opens the question with
 * `checked` false, so the hint button came back; its elimination picks the FIRST wrong option, which
 * is often the one Try again already ruled out, so a bought hint could remove nothing. It also can no
 * longer save the heart (attempt one already paid it). The hint belongs to the scored try only.
 */
requires(
  lesson,
  /isChoice && !checked && attempts\.length === 0 && hintsLeft > 0 && !hinted/,
  'the hint must only be offered before the first Check, or Try again can spend a hint on nothing',
);
requires(
  lesson,
  /setChecked\(true\);\s*\n\s*setJustGraded\(true\);/,
  'the heart-wall gate must be armed by the grading that spends the heart',
);
requires(
  lesson,
  /setOutOfHearts\(false\);[\s\S]{0,160}?setJustGraded\(false\);/,
  're-opening a screen must disarm the heart-wall gate, or a restored answer re-walls',
);

/*
 * ATLAS IS TOLD THE FIRST TRY, not the pick on screen (S2 review, 2026-09-22).
 *
 * Scoring is attempts[0] everywhere else: firstTryCounts decides XP and mastery, and the heart gate
 * above reads attempts[0] for the same reason. The tutor's context read isChoiceCorrect(norm, pick),
 * which after a Try again is the RETRY's pick, so a learner who missed and then got it right was
 * told by Atlas that they had it right while the lesson had recorded the miss. The tutor must never
 * argue with the score in front of the learner.
 */
requires(
  lesson,
  /const wasCorrect = isChoice && checked && attempts\.length > 0 \? attempts\[0\] : undefined;/,
  "Atlas's lesson context must report the FIRST try, or the tutor contradicts the lesson's own scoring",
);
requires(
  lesson,
  /\}, \[attempts, authoredIdentity\?\.authoredIndex/,
  'the Atlas context must recompute when the attempts change, or it hands Atlas the previous verdict',
);

requires(
  calc,
  /inputAccessoryViewID=\{Platform\.OS === 'ios' \? CALC_KEYBOARD_ACCESSORY_ID : undefined\}/,
  'decimal answer fields must expose a visible iOS keyboard accessory',
);
requires(
  calc,
  /<InputAccessoryView nativeID=\{CALC_KEYBOARD_ACCESSORY_ID\}>[\s\S]*?accessibilityLabel="Done typing"[\s\S]*?Keyboard\.dismiss/,
  'the accessory must include an explicit keyboard-dismiss action',
);
requires(
  calc,
  /onPress=\{\(\) => [\s\S]*?Keyboard\.dismiss\(\);/,
  'checking a calculation must close the keyboard before showing feedback',
);
requires(
  calc,
  /setChecked\(true\)/,
  'checking a calculation must still record completion state',
);
requires(
  shop,
  /const bought = buyItem\(item\.id\);[\s\S]*?if \(!bought\)[\s\S]*?Alert\.alert\([\s\S]*?Not enough Euphorium/,
  'a failed refill purchase must explain why it did not complete',
);
requires(
  shop,
  /params\.returnTo === 'lesson'[\s\S]*?item\.itemType === 'heart_refill'[\s\S]*?router\.back\(\)/,
  'a successful refill must return to the paused lesson automatically',
);

if (failures.length) {
  console.error('FAILED\n');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log('PASS — lesson inputs, feedback, and heart exits remain reachable.\n');
