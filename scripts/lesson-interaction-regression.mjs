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
requires(
  lesson,
  /contentContainerStyle=\{styles\.choiceContent\}/,
  'quiz content must keep one stable scroll layout before and after grading',
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
requires(
  lesson,
  /checked && !hasExplanationScreen\(gradedChoice\) \? \([\s\S]*?styles\.inlineFeedback[\s\S]*?<SlabButton/,
  'a right answer with nothing to explain must keep its next action inline and fast',
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
  /function leave\(\) \{[\s\S]*?else exitLesson\(\);/,
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
