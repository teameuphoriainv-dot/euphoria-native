#!/usr/bin/env node
// ============================================================================
// Calendar keys and the streak rule.
//
//   node scripts/day-keys-regression.mjs
//
// WHY. Every function here decides something the user reads as a fact about
// themselves: whether their streak survived the night, whether today counted
// toward the trial, which week their league standing belongs to.
//
// All of them fail SILENTLY, and none of them fail on the day you write them.
// They fail across a midnight, a year boundary, or in a timezone the author does
// not live in — which is exactly the class of bug that cannot be caught by
// looking at the screen, because the screen renders a plausible number.
//
// `store.ts` warned at its own foot that "the XP funnel is exactly where a silent
// drift hides: a wrong weekKey means…" and then defined weekKey inline where
// nothing could test it.
// ============================================================================

import { dayKey, nextStreak, weekKey, withToday } from '../src/lib/day-keys.ts';

const fail = [];
const check = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}`);
  if (!ok) fail.push(`${name}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`);
};

console.log('\nCalendar keys and the streak rule\n');

console.log(' dayKey — LOCAL, not UTC');
check('shape is YYYY-MM-DD', /^\d{4}-\d{2}-\d{2}$/.test(dayKey(new Date())), true);
// The bug this pins: `toISOString().slice(0,10)` on a raw Date gives the UTC day, so anyone west of
// Greenwich late in the evening rolls their daily goal over hours early — or late, going east.
check('23:30 local stays on the local day', dayKey(new Date(2026, 7, 13, 23, 30)), '2026-08-13');
check('00:30 local is the next day', dayKey(new Date(2026, 7, 14, 0, 30)), '2026-08-14');

console.log('\n weekKey — Monday of the local week');
check('a Thursday maps to its Monday', weekKey(new Date(2026, 7, 13, 12)), '2026-08-10');
check('the Monday itself is unchanged', weekKey(new Date(2026, 7, 10, 12)), '2026-08-10');
// Sunday is the END of the week here, not the start. Off by one and every league standing shifts.
check('Sunday maps BACK to Monday', weekKey(new Date(2026, 7, 16, 12)), '2026-08-10');
// The year boundary is the case the comment says was avoided by not using ISO week numbers.
check('Jan 1 2027 (a Friday) maps to Dec 28 2026', weekKey(new Date(2027, 0, 1, 12)), '2026-12-28');
check('all seven days of one week agree', new Set(
  [10, 11, 12, 13, 14, 15, 16].map((d) => weekKey(new Date(2026, 7, d, 12))),
).size, 1);

console.log('\n nextStreak — survives one night, not two');
const today = dayKey();
const yesterday = dayKey(new Date(Date.now() - 86_400_000));
const twoDaysAgo = dayKey(new Date(Date.now() - 2 * 86_400_000));
check('already counted today — unchanged', nextStreak(5, today), 5);
check('last active yesterday — extends', nextStreak(5, yesterday), 6);
check('last active two days ago — restarts at 1', nextStreak(5, twoDaysAgo), 1);
check('never active — starts at 1', nextStreak(0, ''), 1);

console.log('\n withToday — idempotent, and bounded');
check('adds today once', withToday([]), [today]);
check('adding twice is a no-op', withToday([today]), [today]);
check('keeps at most 4 (TRIAL_DAYS + 1)', withToday(['a', 'b', 'c', 'd']).length, 4);
check('keeps the NEWEST when it trims', withToday(['a', 'b', 'c', 'd']).at(-1), today);

if (fail.length > 0) {
  console.log('\nFAILED\n');
  for (const f of fail) console.log(`  ${f}`);
  console.log('\nFix src/lib/day-keys.ts. A wrong key here is a streak somebody lost overnight.\n');
  process.exit(1);
}

console.log('\nPASS — local days, Monday weeks, and a streak that survives exactly one night.\n');
