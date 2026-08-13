#!/usr/bin/env node
// ============================================================================
// 17c — pins WHEN the trial reward offer may fire.
//
//   node scripts/trial-reward-regression.mjs
//
// WHY. This gate stands between a user and a discounted price that RECURS at the
// discounted rate — "forever" is the whole mechanism. Every failure mode is a
// money failure: offering it to somebody who already pays, offering it after the
// trial has expired (when the hard wall, not a reward, is the honest surface), or
// offering it twice so one install mints two discounts.
//
// None of that is visible on screen. The sheet renders identically whether the
// gate was right or wrong, which is C113 exactly: a green gate and a screenshot
// both pass over a number that should never have been offered.
//
// Imports the REAL predicate from src/lib/trial-reward.ts rather than restating
// it. The portfolio and billing-retry scripts each re-implemented their rule and
// drifted from it; cost-basis.ts was extracted precisely so its regression could
// stop doing that. Same trick here (Node strips the types).
// ============================================================================

import { trialRewardAvailable } from '../src/lib/trial-reward.ts';

const TRIAL_DAYS = 3;
const base = {
  iapEnabled: true,
  isPro: false,
  trialRewardSeenAt: null,
  activeDays: 1,
  trialDays: TRIAL_DAYS,
};

const cases = [
  // [name, overrides, expected]
  ['day 1 of the trial, nothing spent', {}, true],
  ['day 3, the last granted day', { activeDays: 3 }, true],
  ['day 0, trial just started', { activeDays: 0 }, true],

  ['ALREADY PRO — never discount what they bought', { isPro: true }, false],
  ['trial EXPIRED (day 4) — the wall is the honest surface', { activeDays: 4 }, false],
  ['ALREADY SEEN — once per install, ever', { trialRewardSeenAt: 1786663702459 }, false],
  ['NO STORE CONFIGURED — "Open it" would open onto nothing', { iapEnabled: false }, false],

  // The combinations, because a real user arrives as more than one flag at once.
  ['pro AND expired', { isPro: true, activeDays: 9 }, false],
  ['seen AND still in trial', { trialRewardSeenAt: 1, activeDays: 2 }, false],
  ['seen at epoch 0 is still SEEN, not unseen', { trialRewardSeenAt: 0 }, false],
];

const fail = [];
console.log('\n17c — when the trial reward offer may fire\n');

for (const [name, over, want] of cases) {
  const got = trialRewardAvailable({ ...base, ...over });
  const ok = got === want;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${want ? 'FIRES    ' : 'suppressed'}  ${name}`);
  if (!ok) fail.push(`${name}: expected ${want}, got ${got}`);
}

// `trialRewardSeenAt: 0` is the trap this pins. A truthiness check (`if (seenAt)`) reads epoch 0 as
// unseen and re-mints the discount. The predicate must compare against null explicitly.
if (trialRewardAvailable({ ...base, trialRewardSeenAt: 0 })) {
  fail.push('epoch-0 timestamp read as unseen — the predicate is using truthiness, not === null');
}

// The boundary, stated as its own assertion because off-by-one here is a whole extra day of
// offers (or a day of missing them) and tier() uses `>` not `>=`.
const atBoundary = trialRewardAvailable({ ...base, activeDays: TRIAL_DAYS });
const pastBoundary = trialRewardAvailable({ ...base, activeDays: TRIAL_DAYS + 1 });
if (!atBoundary || pastBoundary) {
  fail.push(`boundary wrong: day ${TRIAL_DAYS} must fire and day ${TRIAL_DAYS + 1} must not`);
}
console.log(`\n  boundary: day ${TRIAL_DAYS} fires=${atBoundary}, day ${TRIAL_DAYS + 1} fires=${pastBoundary}`);

if (fail.length > 0) {
  console.log('\nFAILED\n');
  for (const f of fail) console.log(`  ${f}`);
  console.log('\nFix src/lib/trial-reward.ts — NOT this script, and NOT the call site in lesson.tsx.\n');
  process.exit(1);
}

console.log(`\nPASS — ${cases.length} cases: the offer fires inside the trial, once, and never to a payer.\n`);
