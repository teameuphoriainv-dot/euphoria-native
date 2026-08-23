/**
 * A league week must resolve exactly once, pay strictly by effort, and never depend on the
 * fabricated rivals.
 *
 * Three silent failure modes, none of which throws or logs:
 *
 *   PAYING TWICE. `resolveLeagueWeek` runs on every Home mount. Without the
 *   `lastWeekResolved === weekStart` guard it mints the bonus per app launch — a currency exploit
 *   in an economy whose dearest item costs 1000.
 *
 *   A TARGET OFF BY ONE. The bars are the numbers a user watches; paying "steady" to someone who
 *   hit the strong bar exactly, or "strong" to someone one XP short, is invisible in code review
 *   and infuriating in use.
 *
 *   DRIFTING BACK ONTO THE RIVALS. The payout was originally rank-based, against PEOPLE — a file
 *   that opens "EVERY PERSON IN THIS FILE IS FABRICATED". Paying real currency for beating invented
 *   people makes the reward rest on the fabrication and silently changes meaning the day real
 *   accounts land. This pin makes that regression loud.
 *
 * The real module is imported, not re-implemented: a pin that copies the logic it guards tests only
 * its own copy.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { WEEK_TARGETS, targetFor, outcomeFor, labelFor } from '../src/lib/league-week.ts';

const top = WEEK_TARGETS[0];

// ── the bars, from both sides
for (const t of WEEK_TARGETS) {
  assert.equal(targetFor(t.xp).key, t.key, `landing exactly on the ${t.key} bar must clear it`);
  if (t.xp > 0) {
    assert.notEqual(targetFor(t.xp - 1).key, t.key, `one XP short of ${t.key} must NOT pay ${t.key}`);
  }
}

// ── ordering is load bearing: outcomeFor takes the FIRST bar cleared
for (let i = 1; i < WEEK_TARGETS.length; i++) {
  assert.ok(
    WEEK_TARGETS[i - 1].xp > WEEK_TARGETS[i].xp,
    'WEEK_TARGETS must stay ordered highest-first, or a strong week silently pays the lower bonus',
  );
}
assert.equal(WEEK_TARGETS[WEEK_TARGETS.length - 1].xp, 0, 'the last bar must be 0 so every week resolves');

// ── more effort must never pay less, and the ceiling must hold
let prev = -1;
for (let xp = 0; xp <= 2000; xp += 7) {
  const c = outcomeFor('2026-08-17', xp).coins;
  assert.ok(c >= prev || xp === 0, `payout must be monotonic in XP (broke at ${xp})`);
  assert.ok(c <= top.coins, `payout must never exceed the top tier (xp=${xp})`);
  prev = Math.max(prev, c);
}
assert.equal(outcomeFor('2026-08-17', 1_000_000).coins, top.coins, 'a huge week is still capped');
assert.equal(outcomeFor('2026-08-17', 0).coins, 0, 'a zero week pays nothing');
assert.equal(outcomeFor('2026-08-17', 640).week, '2026-08-17', 'the outcome carries the week it resolves');
WEEK_TARGETS.forEach((t) => assert.ok(labelFor(t.key).length > 0, `${t.key} must have display copy`));

// ── the payout must not depend on the fabricated rivals
const mod = readFileSync('src/lib/league-week.ts', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
assert.ok(
  !/\bPEOPLE\b|from '\.\/people'/.test(mod),
  'league-week.ts references the fabricated rivals again — the payout must be earned against a ' +
  'fixed XP target, not against invented people whose meaning changes when accounts are real',
);

// ── the double-pay guard, asserted where it actually lives
const store = readFileSync('src/lib/store.ts', 'utf8');
assert.ok(
  /if \(!s\.weekStart \|\| s\.weekStart === wk \|\| s\.lastWeekResolved === s\.weekStart\) return s;/.test(store),
  'resolveLeagueWeek lost its guard — it runs on every Home mount and would pay repeatedly',
);
assert.ok(
  /lastWeekResolved: s\.lastWeekResolved/.test(store),
  'lastWeekResolved is not persisted, so every cold start would re-pay the last week',
);

console.log(
  `league-week-pin: OK — ${WEEK_TARGETS.length} bars at ${WEEK_TARGETS.map((t) => t.xp).join('/')} XP, ` +
  'monotonic and capped, rival-independent, double-pay guarded and persisted.',
);
