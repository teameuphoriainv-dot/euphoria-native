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

import { fromMarketdata } from '../src/app/api/_chain.ts';

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

if (fail.length > 0) {
  console.log('\nFAILED\n');
  for (const f of fail) console.log(`  ${f}`);
  console.log('\nFix the transpose in src/app/api/options+api.ts.\n');
  process.exit(1);
}
console.log('\nPASS — columns map to prices, and a missing one degrades to 0 rather than NaN.\n');
