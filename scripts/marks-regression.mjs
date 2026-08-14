#!/usr/bin/env node
// ============================================================================
// Phase 16 — the live mark behind `priceOf`.
//
//   node scripts/marks-regression.mjs
//
// WHY. `priceOf` is the app's canonical mark for BOTH executing a trade and
// valuing the resulting position. `stock/[sym].tsx` carries the history: it
// once executed at `live?.price` while `portfolioValue()`, `snapshot()` and the
// Trade row valued with the static table, so a cost basis was booked in one
// currency and the gain computed against another. That was invisible only
// because /api/market 503'd without the API keys.
//
// The keys are set now. Every failure mode below is therefore ARMED, and each
// one is silent — a wrong mark does not throw, it renders a plausible number on
// a screen about somebody's money.
// ============================================================================

// `stocks.ts` is deliberately NOT imported: it now has a dependency, and Node cannot resolve this
// codebase's extensionless imports. `priceOf` is one call to `markOr`, which is the rule, so this
// imports the rule rather than restating it — the same reason cost-basis, portfolio-value, day-keys
// and api/_entitlement are all dependency-free.
import { allMarks, clearMarks, hydrateMarks, markOf, markOr, setMark } from '../src/lib/marks.ts';

// What `priceOf('NVDA')` passes as its fallback: the static table's price, parsed.
const STATIC_NVDA = 1184;
const priceOf = (sym) => markOr(sym, sym === 'NVDA' ? STATIC_NVDA : 0);

const fail = [];
const check = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}`);
  if (!ok) fail.push(`${name}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`);
};

console.log('\nPhase 16 — one mark for trading and valuing\n');

console.log(' setMark — a bad value must never become a price');
clearMarks();
// Each of these would reprice a holding to nothing while every screen rendered
// perfectly. `api/_chain.ts` already proved this codebase can receive a provider
// shape that yields zeros rather than an error.
setMark('NVDA', 0);
check('zero is refused', markOf('NVDA'), 0);
setMark('NVDA', -12);
check('negative is refused', markOf('NVDA'), 0);
setMark('NVDA', Number.NaN);
check('NaN is refused', markOf('NVDA'), 0);
setMark('NVDA', Number.POSITIVE_INFINITY);
check('Infinity is refused', markOf('NVDA'), 0);
setMark('NVDA', 225.3);
check('a real quote is kept', markOf('NVDA'), 225.3);
setMark('nvda', 226.1);
check('symbols are case-insensitive', markOf('NVDA'), 226.1);

console.log('\n priceOf — live mark, then the static table, then 0');
clearMarks();
check('cold cache falls back to the static table', priceOf('NVDA'), STATIC_NVDA);
setMark('NVDA', 225.3);
check('a live mark supersedes the table', priceOf('NVDA'), 225.3);
clearMarks();
check('clearing restores the table, never zero', priceOf('NVDA'), STATIC_NVDA);
check('an unknown ticker is still 0', priceOf('ZZZZ'), 0);
// The bug this whole phase exists to close: the mark used to VALUE a position and the mark used to
// EXECUTE the trade were different numbers. They are now one call.
setMark('NVDA', 225.3);
check('execution and valuation read the same mark', priceOf('NVDA') === markOr('NVDA', STATIC_NVDA), true);

console.log('\n a refused quote leaves the PREVIOUS mark standing');
clearMarks();
setMark('NVDA', 225.3);
setMark('NVDA', 0); // what a malformed body looks like after `safe()` returns a parsed null price
check('the stale-but-real mark survives', priceOf('NVDA'), 225.3);

console.log('\n hydrateMarks — storage is not trusted either');
clearMarks();
hydrateMarks({ NVDA: 225.3, AAPL: 0, TSLA: -1, MSFT: 'oops' });
check('good entries restore', markOf('NVDA'), 225.3);
check('a zero in storage is refused', markOf('AAPL'), 0);
check('a negative in storage is refused', markOf('TSLA'), 0);
check('a string in storage is refused', markOf('MSFT'), 0);
hydrateMarks(undefined);
check('undefined storage is a no-op, not a crash', markOf('NVDA'), 225.3);

console.log('\n allMarks — what actually gets persisted');
clearMarks();
setMark('NVDA', 225.3);
setMark('AAPL', 0);
check('only accepted marks are saved', allMarks(), { NVDA: 225.3 });

// Leave the cache empty so importing this file cannot affect anything else.
clearMarks();

if (fail.length > 0) {
  console.log('\nFAILED\n');
  for (const f of fail) console.log(`  ${f}`);
  console.log('\nFix src/lib/marks.ts. A wrong mark here is somebody\'s portfolio.\n');
  process.exit(1);
}

console.log('\nPASS — execution and valuation read the same number, and a bad quote changes nothing.\n');
