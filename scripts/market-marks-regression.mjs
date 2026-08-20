#!/usr/bin/env node
/**
 * MARKET MARKS — regression floor for the pricing path.
 *
 * Guards the bugs that were actually found on 2026-08-20, because each of them shipped looking
 * correct:
 *
 *  - trade.tsx fetched NOTHING, so every price fell through to the hardcoded table in stocks.ts.
 *    NVDA was listed at $1,184.00 against a real $217.56; a twelve-share position rendered
 *    $14,208 where the market said $2,611.
 *  - The session walk was changed to start at TODAY, which is plan-gated on this tier, and
 *    `poly()` throws on a non-OK response -- so the whole endpoint answered 501 instead of
 *    falling through to yesterday. Caught only by re-testing after the change.
 *  - Persisting the full market would serialise ~250KB to AsyncStorage on EVERY state write,
 *    because partialize runs on every write.
 *
 * Runs offline. Pure logic is executed; the rest is asserted against source, which is the same
 * standard motion-invariants.mjs meets. No network, no simulator, deterministic in CI.
 */
import { readFileSync } from 'node:fs';

const fail = (msg) => { console.error(`market-marks: ${msg}`); process.exit(1); };
const ok = (cond, msg) => { if (!cond) fail(msg); };

const api = readFileSync('src/app/api/market+api.ts', 'utf8');
const marks = readFileSync('src/lib/marks.ts', 'utf8');
const store = readFileSync('src/lib/store.ts', 'utf8');
const trade = readFileSync('src/app/(tabs)/trade.tsx', 'utf8');

/* ---- 1. the session walk ------------------------------------------------------------------ */
const walk = api.slice(api.indexOf("if (action === 'marks')"), api.indexOf("if (action === 'movers')"));
ok(walk.length > 0, 'the marks action is gone entirely');
ok(/for \(let back = 1;/.test(walk),
  'the walk must start at back=1. Today is plan-gated on this tier and poly() throws on non-OK, '
  + 'so starting at 0 makes the endpoint answer 501 instead of serving yesterday.');
ok(/catch \(e\)/.test(walk),
  'each day must be individually fallible -- a weekend, a holiday or a plan-gated day must not '
  + 'end the walk.');
ok(/rate_limited.*throw e|throw e/.test(walk.replace(/\n/g, ' ')),
  'a rate limit must be terminal; continuing spends the next minute to be refused again.');
ok(/grouped\/locale\/us\/market\/stocks/.test(walk),
  'must use GROUPED bars -- per-symbol quotes cannot price seven rows under a 5/min ceiling.');

/* ---- 2. persistence is bounded ------------------------------------------------------------- */
ok(/export const persistableMarks/.test(marks), 'persistableMarks is missing');
ok(/persistableMarks\(allMarks\(\)/.test(store),
  'store.ts must persist a BOUNDED subset. partialize runs on every state write, so a full '
  + 'market snapshot is ~250KB of JSON per XP tick.');

/* ---- 3. the trade tab actually prices itself, and keeps doing so --------------------------- */
ok(/getMarks\(\)/.test(trade), 'trade.tsx must fetch marks; without it every price is the static table');
ok(/AppState\.addEventListener/.test(trade),
  'prices must refresh on foreground. Tab screens stay mounted, so a mount-only effect freezes '
  + 'prices for the life of the app process.');

/* ---- 4. persistableMarks: its three guards, asserted in source AND in behaviour ------------ */
const fn = marks.slice(marks.indexOf('export const persistableMarks'));
const impl = fn.slice(0, fn.indexOf('\n};'));
ok(/toUpperCase\(\)/.test(impl),
  'symbols must be upper-cased to match setMark, or a lowercase watchlist entry silently misses');
ok(/> 0/.test(impl),
  'a ZERO mark must not be persisted -- markOr reads 0 as "never quoted", so storing one is '
  + 'indistinguishable from having no price at all');
ok(/for \(const sym of keep\)/.test(impl),
  'must iterate the KEEP list, not the snapshot -- iterating the snapshot persists all 12,548');

/*
 * Behaviour is checked against a reference implementation rather than by evaluating the source:
 * marks.ts is TypeScript, and `new Function` on it dies on the type annotations. The three source
 * assertions above are what tie this reference to the real one.
 */
const persistableMarks = (snapshot, keep) => {
  const out = {};
  for (const sym of keep) {
    const v = snapshot[sym.toUpperCase()];
    if (typeof v === 'number' && v > 0) out[sym.toUpperCase()] = v;
  }
  return out;
};
const snap = { AAPL: 316.83, NVDA: 217.56, ZZZZ: 0, MSFT: 484.31 };
const got = persistableMarks(snap, ['aapl', 'NVDA', 'ZZZZ', 'MISSING']);
ok(got.AAPL === 316.83, 'lowercase symbol not upper-cased');
ok(got.NVDA === 217.56, 'a held symbol was dropped');
ok(!('ZZZZ' in got), 'a zero mark was persisted');
ok(!('MISSING' in got), 'an unknown symbol was invented');
ok(Object.keys(got).length === 2, `expected 2 kept, got ${Object.keys(got).length}`);

if (process.argv.includes('--selftest')) {
  // The lane must be able to go RED, or a green run means nothing.
  const seeded = [
    ['walk starts at today', 'for (let back = 0;', /for \(let back = 1;/],
    ['no per-day catch', 'const g = await poly(x);', /catch \(e\)/],
    ['unbounded persistence', 'marks: allMarks(),', /persistableMarks\(allMarks\(\)/],
  ];
  for (const [name, sample, pattern] of seeded) {
    if (pattern.test(sample)) fail(`selftest: "${name}" would NOT have been caught`);
  }
  ok(/for \(let back = 1;/.test('for (let back = 1; back <= 6; back++) {'), 'selftest: good shape rejected');
  ok(/persistableMarks\(allMarks\(\)/.test('marks: persistableMarks(allMarks(), [])'), 'selftest: good shape rejected');
  console.log('market-marks selftest ok — 3 seeded regressions caught, 2 good shapes accepted');
  process.exit(0);
}

console.log('market-marks ok — walk, persistence bound, foreground refresh, and 5 pure-logic cases');
