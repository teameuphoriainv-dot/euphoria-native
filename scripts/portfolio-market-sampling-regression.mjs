#!/usr/bin/env node
/** Market marks, not only order events, must be able to move the portfolio curve. */
import assert from 'node:assert/strict';
import { appendMarketPortfolioSnapshot, appendPortfolioSnapshot } from '../src/lib/portfolio-history.ts';

const positions = { NVDA: 2 };
const derivatives = [];
const starting = appendPortfolioSnapshot([], {
  at: 1_000,
  cash: 9_800,
  positions,
  derivatives,
  priceOf: () => 100,
});
const marked = appendMarketPortfolioSnapshot(starting, {
  at: 2_000,
  cash: 9_800,
  positions,
  derivatives,
  priceOf: () => 115,
});

assert.deepEqual(marked, [
  { t: 1_000, v: 10_000 },
  { t: 2_000, v: 10_030 },
]);
assert.equal(marked.at(-1).v - marked[0].v, 30, 'the chart must reflect mark-to-market movement');
assert.deepEqual(
  appendMarketPortfolioSnapshot([], {
    at: 2_000,
    cash: 10_000,
    positions: {},
    derivatives,
    priceOf: () => 115,
  }),
  [],
  'opening Trade before the first position must not create a fake chart history',
);

let capped = [];
for (let n = 0; n < 505; n += 1) {
  capped = appendPortfolioSnapshot(capped, {
    at: n,
    cash: n,
    positions: {},
    derivatives: [],
    priceOf: () => 0,
  });
}
assert.equal(capped.length, 500);
assert.equal(capped[0].t, 5);
assert.equal(capped.at(-1).t, 504);

console.log('portfolio sampling ok — mark movement reaches history and history remains capped');
