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
requires(
  lesson,
  /checked \? \([\s\S]*?styles\.inlineFeedback[\s\S]*?<FeedbackBanner[\s\S]*?<SlabButton/,
  'feedback and its next action must remain inline in reading order like the web lesson',
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
  /idx > 0[\s\S]*?onPress=\{previousScreen\}[\s\S]*?accessibilityLabel="Previous lesson step"/,
  'every in-progress lesson screen must expose a previous-step control',
);
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
  /if \(heartLimited && isChoice && checked[^\n]+hearts <= 0\)/,
  'the out-of-hearts wall must never trap a Pro member',
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
