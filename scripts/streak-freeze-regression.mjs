/**
 * A Streak Freeze must absorb exactly ONE missed day, and must not be spent on a day it cannot save.
 *
 * This guards a PAID item whose failure is silent in both directions: spend a freeze on a day the
 * user did not miss and they are quietly robbed; fail to spend one on the day they did miss and the
 * streak they paid to protect resets anyway. Neither throws, and neither is visible without
 * arranging a two-day gap by hand.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolveStreak } from '../src/lib/streak-freeze.ts';

const D = { today: '2026-08-23', yesterday: '2026-08-22', dayBefore: '2026-08-21' };
const at = (lastActiveDay, freezes, streak = 5) => resolveStreak({ streak, lastActiveDay, ...D, freezes });

const fail = [];
const check = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}`);
  if (!ok) fail.push(`${name}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`);
};

console.log('\nstreak freeze\n');
// Same day: nothing happened, so nothing may be spent.
check('already active today — no change, no spend', at(D.today, 3), { streak: 5, freezeUsed: false });
// The ordinary day. Spending here would burn a paid item on a day nobody missed.
check('yesterday -> today — advances WITHOUT spending', at(D.yesterday, 3), { streak: 6, freezeUsed: false });
// The case the item exists for.
check('ONE missed day with a freeze — saved, one spent', at(D.dayBefore, 1), { streak: 6, freezeUsed: true });
check('ONE missed day, no freeze — resets, none spent', at(D.dayBefore, 0), { streak: 1, freezeUsed: false });
// A freeze bridges one day. It must not be taken for a gap it cannot close.
check('TWO missed days with a freeze — resets, NOT spent', at('2026-08-20', 3), { streak: 1, freezeUsed: false });
check('a week away with freezes — resets, NOT spent', at('2026-08-14', 9), { streak: 1, freezeUsed: false });
// A fresh install has no lastActiveDay at all.
check('never active — starts at 1, nothing spent', at('', 2), { streak: 1, freezeUsed: false });
// It may never spend more than it has.
check('one missed day, zero freezes — cannot go negative', at(D.dayBefore, 0), { streak: 1, freezeUsed: false });

// And the store must actually DECREMENT on the day it reports a spend, in the same write.
const store = readFileSync(new URL('../src/lib/store.ts', import.meta.url), 'utf8');
assert.match(store, /streakFreezes: resolved\.freezeUsed \? s\.streakFreezes - 1 : s\.streakFreezes/,
  'completeLesson reports a freeze spend but never decrements the balance — the item would be infinite');
assert.match(store, /streak: streakNext/,
  'the streak write recomputes instead of using the resolved value, so it ignores the freeze');

if (fail.length) { console.error('\n' + fail.join('\n')); process.exit(1); }
console.log('\nPASS — a freeze bridges exactly one missed day, is never spent on a day it cannot save, and is decremented in the same write.\n');
