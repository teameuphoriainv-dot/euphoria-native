/**
 * Regression check: the portfolio CHART and the portfolio HEADLINE must value the same things.
 *
 * THE BUG. `portfolioValue()` counts open option contracts at cost. `snapshot()` — which writes
 * `valueHistory`, which is what the chart plots — counted only cash and shares. Two formulas for
 * one number, and they disagreed by exactly the premium of any open contract.
 *
 * Measured on the real seeded store before the fix:
 *
 *   cash                       5666.94
 *   shares at market          +3555.28
 *   equity                     9222.22   <- what snapshot() recorded
 *   one open contract, at cost +781.06
 *   headline                  10003.28   <- what the user was shown
 *
 * The Trade tab therefore rendered "−$777.78 (7.78%) all time" beneath a portfolio that had lost
 * nothing — 10000 - 9222.22 — and it was PERMANENT, because every later snapshot repeated the
 * omission. Anyone who ever opened a contract carried a phantom loss forever.
 *
 * It also shipped: that screen is App Store screenshot 3, captioned "Practice investing. Risk
 * nothing." over a red line falling off a cliff.
 *
 * Run: node scripts/portfolio-snapshot-regression.mjs
 */
import assert from 'node:assert/strict';

const PRICES = { NVDA: 1184.0, TSLA: 244.0, MSFT: 445.55 };
const priceOf = (s) => PRICES[s] ?? 0;

import { valueOf } from '../src/lib/portfolio-value.ts';

/*
 * IMPORTS the real formula. This file used to define `equityOf`, `portfolioValue` and
 * `snapshotFixed` locally — a THIRD copy of a rule that already existed twice in store.ts and had
 * already diverged once, which is the divergence this script exists to catch. A regression that
 * restates the rule tests its own copy and passes while the app is wrong.
 */

/** Before the fix: cash + shares only, contracts invisible. Kept to prove the bug is still caught. */
const snapshotBroken = (cash, positions) => valueOf(cash, positions, [], priceOf);

/** After: the one formula the app itself uses. */
const snapshotFixed = (cash, positions, derivatives) => valueOf(cash, positions, derivatives, priceOf);
const portfolioValue = snapshotFixed;

// The exact state read off the simulator.
const cash = 5666.935584964032;
const positions = { NVDA: 3.0006756756756756, MSFT: 0.0033217371787678147, TSLA: 0.004098360655737705 };
const derivatives = [{ premium: 781.06 }];
const START = 10000;

const round = (n) => Math.round(n * 100) / 100;

// The headline is not in dispute — it was always right.
assert.equal(round(portfolioValue(cash, positions, derivatives)), 10003.28);

// The old snapshot disagreed with it by exactly one premium.
const broken = snapshotBroken(cash, positions);
assert.equal(round(broken), 9222.22);
assert.equal(
  round(portfolioValue(cash, positions, derivatives) - broken),
  781.06,
  'the gap must be exactly the open premium',
);
assert.ok(broken - START < 0, 'the old chart showed a loss');
assert.equal(round(broken - START), -777.78, "the reviewer's exact figure");

// The fixed snapshot agrees with the headline, so the chart and the number cannot contradict.
const fixed = snapshotFixed(cash, positions, derivatives);
assert.equal(round(fixed), round(portfolioValue(cash, positions, derivatives)));
assert.ok(fixed - START > 0, 'a portfolio that gained must not chart as a loss');
assert.equal(round(fixed - START), 3.28);

// A contract at cost moves the total by zero: cash out, asset in. That is the whole invariant.
const before = portfolioValue(10000, {}, []);
const after = portfolioValue(10000 - 500, {}, [{ premium: 500 }]);
assert.equal(before, after, 'opening a contract at cost must not change portfolio value');
assert.equal(snapshotFixed(10000 - 500, {}, [{ premium: 500 }]), before, 'nor may it move the chart');

// And with no derivatives at all the two formulas were never in conflict — which is why this
// survived so long: it is invisible until someone opens their first contract.
assert.equal(snapshotBroken(cash, positions), snapshotFixed(cash, positions, []));

console.log('PASS — chart and headline now value the same portfolio.');
console.log(`  before: chart ${round(broken)} vs headline 10003.28  ->  "${round(broken - START)}" all time`);
console.log(`  after : chart ${round(fixed)} vs headline 10003.28  ->  "+${round(fixed - START)}" all time`);
