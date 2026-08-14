#!/usr/bin/env node
// ============================================================================
// Cost basis — pins the average-cost rule behind the Trade tab's percentage.
//
//   node scripts/cost-basis-regression.mjs
//
// WHAT THIS DEFENDS. Before cost basis existed, trade.tsx rendered
// `STOCKS[sym].chg` beside every position — a HARDCODED field on the stock,
// the same for every user regardless of what they paid. NVDA announced "+3.1%"
// to somebody who had just bought it at the price it still trades at, whose real
// return was 0.0%. §22 C100 all over again: a number the user reads as theirs,
// computed from something else.
//
// The rule that replaced it has one subtle part — a PARTIAL SELL must retire the
// same FRACTION of the basis as of the shares, so the average per share does not
// move. Get that wrong and every partial sale looks like a windfall or a loss
// that never happened. That is the case worth a test.
//
// IT IMPORTS THE REAL CODE. It used to re-implement these reducers, because the
// source is TypeScript and this is plain node — and §22 C113 records what that
// cost: the partial-basis fix had to be written TWICE, once in store.ts and again
// in this file's copy, which is the exact drift this script exists to catch,
// happening inside the change that added it. A test asserting a rule the app does
// not run is worse than no test, because it is green.
//
// Node 24 strips types natively, so `src/lib/cost-basis.ts` loads directly and
// there is no second copy. If this import ever breaks, the cause is almost
// certainly non-erasable syntax (an enum, a namespace) added to that module.
// ============================================================================

let failures = 0;
const near = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;
function check(label, actual, expected) {
  const ok = expected === null ? actual === null : actual !== null && near(actual, expected);
  const show = (v) => (v === null ? 'null' : typeof v === 'number' ? v.toFixed(4) : String(v));
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label.padEnd(52)} ${show(actual)}${ok ? '' : `  expected ${show(expected)}`}`);
  if (!ok) failures += 1;
}

// ── the rule, imported from the app ─────────────────────────────────────────
import { applyBuy, applySell, applyGrant, avgCostOf as avgOf, gainPct as gainOf, clearStaticPricing } from '../src/lib/cost-basis.ts';

const mk = () => ({ positions: {}, costBasis: {}, cash: 10000 });

// Thin wrappers: cash is the store's business, the BASIS RULE is the imported one.
function buy(s, sym, shares, price) {
  const cost = shares * price;
  if (shares <= 0 || cost > s.cash) return s;
  return { ...applyBuy(s, sym, shares, cost), cash: s.cash - cost };
}
function sell(s, sym, shares, price) {
  const { positions, costBasis, sold } = applySell(s, sym, shares);
  if (sold <= 0) return s;
  return { positions, costBasis, cash: s.cash + sold * price };
}
function grant(s, sym, dollars, price) {
  return { ...applyGrant(s, sym, dollars / price, dollars), cash: s.cash };
}

const avgCost = (s, sym) => avgOf(s, sym);
const gainPct = (s, sym, mark) => gainOf(s, sym, mark);

console.log('\ncost basis — average-cost method\n');

// ── 1. one buy ──────────────────────────────────────────────────────────────
let s = buy(mk(), 'NVDA', 3, 1000);
check('one buy: avg is the price paid', avgCost(s, 'NVDA'), 1000);
check('one buy: gain at the same mark is ZERO, not the stock chg', gainPct(s, 'NVDA', 1000), 0);
check('one buy: gain at 1184 is the real return', gainPct(s, 'NVDA', 1184), 18.4);

// ── 2. a second buy at a different price moves the average ──────────────────
s = buy(s, 'NVDA', 2, 1200);
check('second buy: basis accumulates', s.costBasis.NVDA, 5400);
check('second buy: avg is weighted, not the latest price', avgCost(s, 'NVDA'), 1080);

// ── 3. THE CASE THIS FILE EXISTS FOR ────────────────────────────────────────
const beforeAvg = avgCost(s, 'NVDA');
s = sell(s, 'NVDA', 2, 1300);
check('partial sell: shares drop', s.positions.NVDA, 3);
check('partial sell: basis retires the SAME fraction', s.costBasis.NVDA, 3240);
check('partial sell: AVERAGE PER SHARE IS UNCHANGED', avgCost(s, 'NVDA'), beforeAvg);
check('partial sell: gain unchanged by the sale itself', gainPct(s, 'NVDA', 1080), 0);

// ── 4. selling out clears both ──────────────────────────────────────────────
s = sell(s, 'NVDA', 999, 1300);
check('sell all: position gone', s.positions.NVDA === undefined ? null : 1, null);
check('sell all: basis gone too, no orphan', s.costBasis.NVDA === undefined ? null : 1, null);
check('sell all: avg is null, so the UI shows no percentage', avgCost(s, 'NVDA'), null);

// ── 5. free stock is NOT an infinite return ─────────────────────────────────
s = grant(mk(), 'AAPL', 1.0, 228.5);
check('reward grant: booked at grant value', s.costBasis.AAPL, 1.0);
check('reward grant: starts at 0%, not infinity', gainPct(s, 'AAPL', 228.5), 0);
if (!Number.isFinite(gainPct(s, 'AAPL', 228.5))) {
  console.log('  FAIL  reward gain is not finite — a $0 basis leaked back in');
  failures += 1;
}

// ── 6. legacy positions fail CLOSED, showing nothing ────────────────────────
const legacy = { positions: { TSLA: 5 }, costBasis: {}, cash: 0 };
check('legacy position: avg is null', avgCost(legacy, 'TSLA'), null);
check('legacy position: gain is null, never 0 and never guessed', gainPct(legacy, 'TSLA', 244), null);

// ── 7. an unaffordable buy records no basis ─────────────────────────────────
const poor = buy({ positions: {}, costBasis: {}, cash: 10 }, 'NVDA', 3, 1000);
check('unaffordable buy: no position', poor.positions.NVDA === undefined ? null : 1, null);
check('unaffordable buy: no basis, no phantom cost', poor.costBasis.NVDA === undefined ? null : 1, null);

// ── 8. THE PARTIAL-BASIS BUG, found by CodeRabbit review 2026-08-11 ─────────
// Every user who predates cost-basis tracking holds shares with no basis. Adding to one of those
// positions used to record ONLY the new cost while `positions` counted ALL the shares, so
// `paid / held` divided one share's cost across four. Measured before the fix:
//   3 legacy NVDA + 1 bought at $1,184  ->  basis 1184 / 4 shares = "avg $296.00, +300.0%"
// A fabricated number on the money screen: §22 C100's defect, reintroduced by C100's own successor.
const legacyHeld = { positions: { NVDA: 3 }, costBasis: {}, cash: 10000 };

let mixed = buy(legacyHeld, 'NVDA', 1, 1184);
check('legacy + buy: shares still accumulate', mixed.positions.NVDA, 4);
check('legacy + buy: basis stays ABSENT, not partial', mixed.costBasis.NVDA === undefined ? null : 1, null);
check('legacy + buy: no invented average', avgCost(mixed, 'NVDA'), null);
check('legacy + buy: no invented gain (was +300.0%)', gainPct(mixed, 'NVDA', 1184), null);

let granted = grant(legacyHeld, 'NVDA', 1.0, 1184);
check('legacy + reward grant: basis stays ABSENT', granted.costBasis.NVDA === undefined ? null : 1, null);
check('legacy + reward grant: no invented average', avgCost(granted, 'NVDA'), null);

// Closing the position clears it, and the NEXT buy starts clean and knowable.
let reopened = sell(mixed, 'NVDA', 999, 1200);
check('legacy closed out: position gone', reopened.positions.NVDA === undefined ? null : 1, null);
reopened = buy({ ...reopened, cash: 10000 }, 'NVDA', 2, 1000);
check('reopened: basis is knowable again', avgCost(reopened, 'NVDA'), 1000);
check('reopened: gain is real again', gainPct(reopened, 'NVDA', 1100), 10);

// Phase 16 storage migration. A basis paid in static dollars must not be valued against a live
// mark — that is an ~81% loss on a position that never moved, which is the C113 shape arriving
// through the fix for the C113 shape.
const legacyState = {
  positions: { NVDA: 3 },
  costBasis: { NVDA: 3552 },
  valueHistory: [{ d: '2026-08-12', v: 10003 }],
  cash: 5000,
};
const migrated = clearStaticPricing(legacyState, 0);
check('v0 → v1: the static-dollar basis is withdrawn', Object.keys(migrated.costBasis).length, 0);
// valueHistory was the FIRST DRAFT'S MISS. Those snapshots are portfolio totals computed with the
// static table; leaving them draws a cliff on the chart the moment a live-priced snapshot lands.
check('v0 → v1: the static-dollar value history goes too', migrated.valueHistory.length, 0);
check('v0 → v1: shares are NOT touched', migrated.positions.NVDA, 3);
check('v0 → v1: cash is NOT touched', migrated.cash, 5000);
// Absent, not rescaled — so the Trade row shows no percentage rather than an invented one.
check('migrated position has no average to show', avgCost(migrated, 'NVDA'), null);
const already = clearStaticPricing(
  { positions: { NVDA: 3 }, costBasis: { NVDA: 676 }, valueHistory: [{ d: '2026-08-13', v: 7126 }], cash: 5000 },
  1,
);
check('v1 → v2: a live-dollar basis is left alone', already.costBasis.NVDA, 676);
check('v1 → v2: live-dollar history is left alone', already.valueHistory.length, 1);

// v2 — static-strike contracts are UNWOUND, not repriced. A $1,302 strike against a $225 spot is
// unsalvageable, unlike a share count, which survives any change of denomination.
const withDerivs = {
  positions: {}, costBasis: {}, valueHistory: [],
  derivatives: [{ sym: 'NVDA', kind: 'call', strike: 1302, premium: 781.06 }],
  derivativeTrades: 1, cash: 5666.94,
};
const unwound = clearStaticPricing(withDerivs, 1);
check('v2: the static-strike contract is gone', unwound.derivatives.length, 0);
// NET-NEUTRAL, not a grant: cash was always real dollars, only prices were fictional.
check('v2: the premium is refunded to cash', unwound.cash, 6448.0);
// Clearing contracts without this would silently consume part of a lifetime allowance of 3.
check('v2: the preview allowance is restored', unwound.derivativeTrades, 0);
// v1 install: basis was already withdrawn, so v2 must not re-clear a live-dollar basis.
const v1Install = { costBasis: { NVDA: 676 }, valueHistory: [1], derivatives: [], derivativeTrades: 0, cash: 100 };
const bumped = clearStaticPricing(v1Install, 1);
check('v1 → v2: nothing else is disturbed', bumped.costBasis.NVDA, 676);
check('v1 → v2: cash unchanged with no contracts', bumped.cash, 100);
// Already current: a no-op in both directions.
const current = clearStaticPricing({ ...withDerivs }, 2);
check('v2 → v2: contracts survive', current.derivatives.length, 1);
check('v2 → v2: cash is not refunded twice', current.cash, 5666.94);

if (failures > 0) {
  console.log(`\nFAILED — ${failures} check(s). The Trade tab's percentage is wrong again.\n`);
  process.exit(1);
}
console.log('\nPASS — average cost survives partial sells, grants and legacy state.\n');
