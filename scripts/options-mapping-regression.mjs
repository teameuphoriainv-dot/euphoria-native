#!/usr/bin/env node
// ============================================================================
// Pins the marketdata.app → Contract transpose.
//
//   node scripts/options-mapping-regression.mjs
//
// WHY. marketdata.app answers COLUMNAR — parallel arrays keyed by name, not a
// list of objects. Every field is looked up by string. If the provider renames a
// column, or returns one short, the mapping does not throw: it produces ZEROS.
//
// A chain of contracts with bid 0, ask 0 and delta 0 renders perfectly. It looks
// like a quiet strike rather than a broken integration, and it is a number the
// user reads as a price. That is C113 exactly, which is why this exists and why
// it asserts real values rather than merely "not undefined".
// ============================================================================

import {
  chainPath,
  expiriesFromCboe,
  finiteNonNegative,
  fromCboe,
  plausibleDelta,
  fromMarketdata,
  parseOcc,
  plausibleIv,
  spotFromCboe,
  STRIKE_WINDOW,
} from '../src/app/api/_chain.ts';

// Shape copied from a live response, 2026-08-13.
const live = {
  s: 'ok',
  optionSymbol: ['AAPL260918C00050000', 'AAPL260918P00200000'],
  side: ['call', 'put'],
  strike: [50, 200],
  bid: [250.45, 1.2],
  ask: [253.7, 1.35],
  mid: [252.075, 1.275],
  iv: [0.0001, 0.2841],
  delta: [0.9997, -0.31],
  openInterest: [5, 4210],
  volume: [0, 812],
};

const fail = [];
const check = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}`);
  if (!ok) fail.push(`${name}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`);
};

console.log('\nmarketdata.app → Contract\n');
const [call, put] = fromMarketdata(live);

console.log(' the transpose');
check('two contracts out of two columns', fromMarketdata(live).length, 2);
check('call side', call.kind, 'call');
check('put side', put.kind, 'put');
check('strike', [call.strike, put.strike], [50, 200]);
check('bid/ask survive', [call.bid, call.ask], [250.45, 253.7]);
check("provider's own mid is preferred", call.mid, 252.075);
check('iv', put.iv, 0.2841);
check('NEGATIVE delta survives (puts)', put.delta, -0.31);
check('open interest', put.openInterest, 4210);
check('volume', put.volume, 812);
check('symbol', call.symbol, 'AAPL260918C00050000');

console.log('\n degradation — a missing column must not take the chain down');
const short = { ...live, delta: [0.9997], volume: undefined };
const s2 = fromMarketdata(short);
check('still two contracts', s2.length, 2);
check('missing delta reads 0, not NaN', s2[1].delta, 0);
check('absent column reads 0, not NaN', s2[0].volume, 0);
check('mid falls back to midpoint when absent', fromMarketdata({ ...live, mid: [] })[1].mid, (1.2 + 1.35) / 2);
check('mid falls back to the one side that exists', fromMarketdata({ ...live, mid: [], bid: [] })[0].mid, 253.7);
check('empty response is an empty chain, not a crash', fromMarketdata({ s: 'ok' }).length, 0);

/*
 * THE ONE THAT MATTERS. A renamed column is the realistic upstream change, and the failure is
 * silent: every price becomes 0 and the chain still renders.
 */
console.log('\n the silent failure this file exists for');
const renamed = { ...live, bid: undefined, bidPrice: [250.45, 1.2] };
const r = fromMarketdata(renamed);
const allZero = r.every((c) => c.bid === 0);
console.log(`  ${allZero ? 'ok  ' : 'FAIL'}  a renamed column zeroes the price — proving it fails SILENTLY`);
if (!allZero) fail.push('expected a renamed column to zero the price; the assumption behind this file is wrong');
console.log('        (so if this ever ships, the chain looks fine and every quote is a lie)');

// ── the strike window is a COST CONTROL, so it gets pinned like one ─────────────────────────
// Measured 2026-08-14 on the live account: a full NVDA chain returned 216 contracts and consumed
// 193 credits of 100,000/day — ~518 options loads per day for the WHOLE userbase. strikeLimit=16
// returned 32 contracts for 32 credits. Dropping the parameter does not throw; it returns a bigger,
// correct-looking, 6x more expensive chain and the app quietly runs out of quota in production.
check('the chain request carries a strike limit', chainPath('NVDA', '2026-08-21').includes('strikeLimit='), true);
check('it carries the budgeted window', chainPath('NVDA', '2026-08-21').includes(`strikeLimit=${STRIKE_WINDOW}`), true);
check('the window is 16 — raising it costs credits linearly', STRIKE_WINDOW, 16);
check('the expiry still reaches the provider', chainPath('NVDA', '2026-08-21').includes('expiration=2026-08-21'), true);
check('the symbol still reaches the provider', chainPath('NVDA', '2026-08-21').startsWith('/chain/NVDA/'), true);

// ── IV that the provider solved out of noise must not render as a fact ──────────────────────
// Real values measured on the live NVDA chain 2026-08-14: a clean smile of 0.30-0.41 from strike
// 210 to 242.50, while the 205 and 207.50 CALLS returned 0.0001 and 0.0026 — and the PUTS at those
// same strikes were fine at 0.4145 and 0.3862. options.tsx renders IV as a percent, so 0.0001
// printed a confident "IV 0%" next to correct rows.
check('a real smile value survives untouched', plausibleIv(0.3025), 0.3025);
check('the healthy tail survives', plausibleIv(0.4145), 0.4145);
check('an ill-conditioned deep-ITM solve is rejected', plausibleIv(0.0001), 0);
check('0.26% is still noise, not a quiet market', plausibleIv(0.0026), 0);
check('617% is rejected as the other tail', plausibleIv(6.17), 0);
// WIDE on purpose: a real earnings-week short-dated IV can exceed 200%, and clipping that would be
// inventing data in the opposite direction.
check('200% is high but REAL, and must survive', plausibleIv(2.0), 2.0);
check('exactly 1% is kept — the band is inclusive', plausibleIv(0.01), 0.01);
check('a negative can never be a volatility', plausibleIv(-0.5), 0);

// ── Cboe, the PRIMARY provider ──────────────────────────────────────────────────────────────
// marketdata.app answers 403 to the deployed Worker while serving the same token from a laptop —
// its egress IP is blocked, so options was dead in production while every local check passed.
// Cboe needs no key, so there is no quota and no per-contract billing.
check('OCC parses expiry, side and strike', parseOcc('NVDA260814C00050000'), { expiry: '2026-08-14', kind: 'call', strike: 50 });
// THE 1000x TRAP: the strike is 8 digits in THOUSANDTHS. Divide wrong and $227.50 becomes $227,500
// — which renders as a plausible row, not an error.
check('strike is thousandths, not units', parseOcc('NVDA260821C00227500').strike, 227.5);
check('puts are read as puts', parseOcc('NVDA260814P00050000').kind, 'put');
check('a multi-letter root still parses', parseOcc('GOOGL260814C00200000').strike, 200);
check('junk is rejected rather than guessed', parseOcc('not-a-symbol'), null);

const cboeFixture = {
  data: {
    current_price: 225.3,
    options: [
      { option: 'NVDA260814C00050000', bid: 170.7, ask: 179.6, iv: 0.0, delta: 1.0, open_interest: 7, volume: 8 },
      { option: 'NVDA260814C00225000', bid: 2.7, ask: 2.86, iv: 0.3025, delta: 0.47, open_interest: 900, volume: 120 },
      { option: 'NVDA260814P00225000', bid: 3.4, ask: 3.6, iv: 0.305, delta: -0.53, open_interest: 800, volume: 90 },
      { option: 'NVDA260814C00227500', bid: 1.7, ask: 1.9, iv: 0.3018, delta: 0.35, open_interest: 700, volume: 60 },
      { option: 'NVDA260821C00225000', bid: 5.0, ask: 5.2, iv: 0.31, delta: 0.5, open_interest: 10, volume: 1 },
    ],
  },
};
check('expiries are deduped and sorted', expiriesFromCboe(cboeFixture), ['2026-08-14', '2026-08-21']);
const near = fromCboe(cboeFixture, '2026-08-14', 2);
// THE $50 BUG: the old chain opened 4.5x away from spot. Strikes are chosen by DISTANCE from spot,
// so the $50 contract must lose to 225 and 227.50 even though it is first in the payload.
check('the window centres on spot, not on payload order', [...new Set(near.map((c) => c.strike))].sort((a, b) => a - b), [225, 227.5]);
check('the far strike is dropped', near.some((c) => c.strike === 50), false);
check('the other expiry is excluded', near.some((c) => c.symbol.includes('260821')), false);
check('bid and ask map through', near.find((c) => c.strike === 225 && c.kind === 'call').ask, 2.86);
// Rounded: (2.7 + 2.86) / 2 is 2.7800000000000002 in binary floating point. The midpoint rule is
// what is under test, not IEEE 754.
check('mid is derived when both sides quote', Number(near.find((c) => c.strike === 225 && c.kind === 'call').mid.toFixed(4)), 2.78);
check('open interest survives the transpose', near.find((c) => c.strike === 225 && c.kind === 'put').openInterest, 800);
// An ill-conditioned deep-ITM iv must be suppressed here too, not only in the marketdata path.
const wide = fromCboe(cboeFixture, '2026-08-14', 99);
check('cboe iv also goes through plausibleIv', wide.find((c) => c.strike === 50).iv, 0);
// No spot means we cannot centre; take the lowest strikes so the failure is deterministic.
const noSpot = fromCboe({ data: { options: cboeFixture.data.options } }, '2026-08-14', 1);
check('missing spot degrades deterministically', noSpot[0].strike, 50);
// The spot travels WITH the chain so the header cannot disagree with the strikes. The screen used
// to read "Apple at $228.50" (static table) above strikes centred on 305.35.
check('spot is reported from the same payload', spotFromCboe(cboeFixture), 225.3);
check('no spot reports 0, not a guess', spotFromCboe({ data: { options: [] } }), 0);
check('a junk spot is not passed through', spotFromCboe({ data: { current_price: 'n/a' } }), 0);

// ── money fields, probed with a HOSTILE payload ─────────────────────────────────────────────
// `Number(x) || 0` catches NaN and null and catches neither of the two that matter: -5 is truthy
// and survives as a negative price, and 1e309 is Infinity, which JSON.stringify emits as null.
// Both reach `cost = ask * CONTRACT_SIZE` on the buy control, where `Infinity > 0` passes the
// positive-cost guard and only `cost <= cash` happens to stop the trade.
check('a negative price is refused', finiteNonNegative(-5), 0);
check('Infinity is refused', finiteNonNegative(1e309), 0);
check('a string is refused', finiteNonNegative('abc'), 0);
check('an object is refused', finiteNonNegative({}), 0);
check('a real price survives', finiteNonNegative(19.5), 19.5);
check('zero is a legitimate bid', finiteNonNegative(0), 0);
// Delta is the one field that is legitimately negative — puts sit in [-1, 0].
check('a put delta survives', plausibleDelta(-0.53), -0.53);
check('a call delta survives', plausibleDelta(0.47), 0.47);
check('delta beyond 1 is noise', plausibleDelta(42), 0);
check('delta below -1 is noise', plausibleDelta(-42), 0);
check('a non-numeric delta is refused', plausibleDelta('abc'), 0);
// End to end: the hostile payload must not produce a renderable contract with junk in it.
const hostile = fromCboe(
  { data: { current_price: 225, options: [{ option: 'NVDA260814C00225000', bid: -5, ask: 1e309, iv: 'NaN', delta: 'abc', open_interest: null, volume: {} }] } },
  '2026-08-14',
  9,
);
check('hostile row: bid clamped', hostile[0].bid, 0);
check('hostile row: ask clamped', hostile[0].ask, 0);
check('hostile row: mid is not Infinity', hostile[0].mid, 0);
check('hostile row: delta clamped', hostile[0].delta, 0);
check('hostile row: open interest clamped', hostile[0].openInterest, 0);

// ── THE FULL GREEK SET, and the entire chain ────────────────────────────────────────────────
// Cboe publishes delta, gamma, theta, vega, rho and a theoretical value for every contract, free.
// The mapper carried delta ALONE and discarded the rest for the whole life of this feature.
const greeky = {
  data: {
    current_price: 225,
    options: [
      { option: 'NVDA260821C00225000', bid: 3.8, ask: 3.9, iv: 0.291, delta: 0.5254, gamma: 0.0435, theta: -0.2683, vega: 0.1244, rho: 0.022, theo: 3.838, open_interest: 46812, volume: 21644 },
      { option: 'NVDA260821C00050000', bid: 175, ask: 176, iv: 0.0, delta: 1, gamma: 0, theta: 0, vega: 0, rho: 0, theo: 175.2, open_interest: 7, volume: 1 },
      { option: 'NVDA260821P00400000', bid: 174, ask: 175, iv: 0.4, delta: -0.98, gamma: 0.001, theta: -0.05, vega: 0.02, rho: -0.31, theo: 174.5, open_interest: 3, volume: 0 },
    ],
  },
};
const atm = fromCboe(greeky, '2026-08-21').find((c) => c.strike === 225);
check('gamma survives the mapper', atm.gamma, 0.0435);
check('theta survives, and stays NEGATIVE', atm.theta, -0.2683);
check('vega survives', atm.vega, 0.1244);
check('rho survives', atm.rho, 0.022);
check('the theoretical value survives', atm.theo, 3.838);
check('open interest is not truncated', atm.openInterest, 46812);
// rho is legitimately negative for puts — clamping greeks to non-negative would have eaten this.
check('a put rho stays negative', fromCboe(greeky, '2026-08-21').find((c) => c.strike === 400).rho, -0.31);
// NO WINDOW MEANS THE WHOLE CHAIN. STRIKE_WINDOW is a marketdata credit budget, and Cboe is free —
// truncating its chain bought nothing and cost the user every strike outside the box.
check('no window returns every strike', [...new Set(fromCboe(greeky, '2026-08-21').map((c) => c.strike))].sort((a, b) => a - b), [50, 225, 400]);
check('a window still narrows, for the paid fallback', [...new Set(fromCboe(greeky, '2026-08-21', 1).map((c) => c.strike))], [225]);

if (fail.length > 0) {
  console.log('\nFAILED\n');
  for (const f of fail) console.log(`  ${f}`);
  console.log('\nFix the transpose in src/app/api/options+api.ts.\n');
  process.exit(1);
}
console.log('\nPASS — columns map to prices, and a missing one degrades to 0 rather than NaN.\n');
