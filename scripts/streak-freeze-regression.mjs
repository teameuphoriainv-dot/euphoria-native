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
import { resolveStreak, resolveDay, REPAIR_WINDOW_MS } from '../src/lib/streak-freeze.ts';
import { applyStreakSafety } from '../src/lib/streak-safety-migration.ts';

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
// resolveDay returns the balance AFTER the spend (and any milestone freeze); the store writes it.
assert.match(store, /streakFreezes: resolved\.freezes,/,
  'completeLesson must write the balance resolveDay returns, or a spent freeze would be infinite');

/* STREAK SAFETY NET (resolveDay). */
const NOW = 1_000_000;
const day = (o) => resolveDay({ streak: 5, lastActiveDay: D.yesterday, ...D, freezes: 0, repair: null, milestoneRun: 0, now: NOW, isLesson: true, ...o });
assert.equal(day({ lastActiveDay: D.dayBefore, freezes: 1 }).freezes, 0, 'a spent freeze is decremented');
assert.equal(day({ lastActiveDay: D.dayBefore, freezes: 1 }).repair, null, 'a freeze that saves the day opens no repair');
const broke = day({ streak: 12, lastActiveDay: '2026-08-20', freezes: 0 });
assert.equal(broke.streak, 1, 'a break restarts at day 1');
assert.deepEqual(broke.repair, { lost: 12, need: 2, done: 1, deadline: NOW + REPAIR_WINDOW_MS }, 'a break opens a 48h repair and the comeback lesson counts as 1');
const fixed = day({ streak: 1, lastActiveDay: D.today, repair: broke.repair });
assert.equal(fixed.streak, 13, 'the Nth lesson restores lost + current run');
assert.equal(fixed.restored, 12);
assert.equal(fixed.repair, null);
assert.equal(day({ streak: 1, lastActiveDay: D.today, repair: { ...broke.repair, deadline: NOW - 1 } }).streak, 1, 'an expired repair restores nothing');
assert.equal(day({ streak: 1, lastActiveDay: D.today, repair: broke.repair, isLesson: false }).repair.done, 1, 'a guide or part never counts toward a repair');
assert.equal(day({ streak: 12, lastActiveDay: '2026-08-19' }).repair, null, 'more than 2 missed days is a fresh start, not a repair');
assert.equal(day({ streak: 2, lastActiveDay: '2026-08-20' }).repair, null, 'a streak under 3 just restarts');
assert.equal(day({ streak: 40, lastActiveDay: '2026-08-20' }).repair.need, 3, '30+ day streaks need 3 lessons');
const seven = day({ streak: 6 });
assert.equal(seven.streak, 7);
assert.ok(seven.freezeEarned && seven.freezes === 1 && seven.milestoneRun === 7, 'day 7 pays one freeze');
assert.equal(day({ streak: 7, lastActiveDay: D.today, milestoneRun: 7 }).freezeEarned, false, 'a milestone pays once per run');
assert.equal(day({ streak: 6, freezes: 2 }).freezeEarned, false, 'earned freezes stop at 2 held');
assert.equal(day({ streak: 1, lastActiveDay: D.today, repair: { lost: 12, need: 2, done: 1, deadline: NOW + 1 }, milestoneRun: 0 }).freezeEarned, false, 'a restored run is not paid the milestones it already passed');

/* v7 migration. */
assert.deepEqual(applyStreakSafety({ streak: 12, streakFreezes: 0 }, 6), { streak: 12, streakFreezes: 1, freezeMilestoneRun: 7, streakRepair: null }, 'v7 grants the starter freeze and marks passed milestones');
assert.equal(applyStreakSafety({ streak: 0, streakFreezes: 2 }, 6).streakFreezes, 2, 'no grant when 2+ are held');
assert.equal(applyStreakSafety({ streak: 3, streakFreezes: 0 }, 7).streakFreezes, 0, 'v7 runs once');
assert.match(store, /streak: streakNext/,
  'the streak write recomputes instead of using the resolved value, so it ignores the freeze');

if (fail.length) { console.error('\n' + fail.join('\n')); process.exit(1); }
console.log('\nPASS — a freeze bridges exactly one missed day, is never spent on a day it cannot save, and is decremented in the same write.\n');
