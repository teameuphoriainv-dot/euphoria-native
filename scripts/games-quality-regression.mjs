#!/usr/bin/env node

/**
 * Focused regressions for the native Games surface.
 *
 * Run with:
 *   node --experimental-strip-types scripts/games-quality-regression.mjs
 *
 * Pure engines are imported directly; screen-only contracts are checked statically so this stays
 * fast and does not need a simulator or a second test framework.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

globalThis.__DEV__ = false;

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const load = (path) => import(pathToFileURL(new URL(path, root).pathname).href);

const [games, termScreen, termBank, trendScreen, moneyScreen, budgetScreen] = await Promise.all([
  read('src/app/(tabs)/games.tsx'),
  read('src/app/games/term-match.tsx'),
  read('src/lib/term-bank.ts'),
  read('src/app/games/trend-master.tsx'),
  read('src/app/games/money-2048.tsx'),
  read('src/app/games/budget-balancer.tsx'),
]);

// A “Soon” badge must explain itself when tapped; disabled cards silently swallow the action.
assert.match(games, /Alert\.alert\(/, 'coming-soon games must provide visible tap feedback');
assert.doesNotMatch(
  games,
  /disabled=\{!!g\.pro \|\| !!g\.comingSoon\}/,
  'coming-soon cards must not be disabled dead taps',
);

// Every playable game gets the same one-sentence orientation and its catalogue sprite before play.
for (const [name, source, sprite] of [
  ['Term Match', termScreen, 'lightbulb'],
  ['Trend Master', trendScreen, 'chartUp'],
  ['Money 2048', moneyScreen, 'stackCash'],
  ['Budget Balancer', budgetScreen, 'scales'],
]) {
  assert.match(source, new RegExp(`PixelSpriteView[\\s\\S]*sprite=\\{${sprite}\\}`), `${name} intro must show its icon`);
  assert.match(source, /accessibilityLabel="Start/, `${name} must have an explicit start tutorial action`);
  assert.match(source, /<ScrollView\b/, `${name} intro must remain scrollable at maximum Dynamic Type`);
  assert.match(source, /maxFontSizeMultiplier=\{1\.6\}/, `${name} intro must use the established readable scaling cap`);
}

// Match definitions should read like glossary definitions, not metaphors or second-person advice.
const defs = [...termBank.matchAll(/\bdef: '([^']+)'/g)].map((m) => m[1]);
assert.equal(defs.length, 60, 'Term Match must keep all 60 definitions');
assert.deepEqual(
  defs.filter((def) => def.length > 52),
  [],
  'Term Match definitions must fit the tile limit enforced at runtime',
);
const figurative = /\b(stretch|basket|sink you|things|sitting far|sway you|cannot touch|disaster|before it matters|put you first)\b/i;
assert.deepEqual(defs.filter((def) => figurative.test(def)), [], 'Term Match definitions must be literal and concrete');

const trend = await load('src/lib/trend-game.ts');
const candles = trend.candlesOf([10, 12, 11, 14]);
assert.equal(candles.length, 4, 'one close must produce one candle');
for (const candle of candles) {
  assert.ok(candle.low <= Math.min(candle.open, candle.close), 'candle low must contain its body');
  assert.ok(candle.high >= Math.max(candle.open, candle.close), 'candle high must contain its body');
}
let readable = 0;
let calls = 0;
for (let seed = 1; seed <= 200; seed++) {
  const series = trend.makeSeries(seed, 0);
  for (let cursor = 0; cursor + trend.WINDOW < series.length; cursor++) {
    const round = { series, cursor };
    const signal = trend.trendIndicator(trend.windowOf(round)).direction;
    const actual = trend.nextValue(round) >= trend.lastValue(round) ? 'up' : 'down';
    readable += signal === actual ? 1 : 0;
    calls++;
  }
}
assert.ok(readable / calls >= 0.7, 'the visible trend indicator must beat a coin flip materially');
assert.match(trendScreen, /<Line\b/, 'Trend Master must render candlestick wicks');
assert.match(trendScreen, /trendIndicator\(/, 'Trend Master must expose an interpretable indicator');

const money = await load('src/lib/money-2048.ts');
for (let tile = 2; tile <= money.GOAL; tile++) {
  const fact = money.milestoneFact(tile);
  assert.ok(fact && fact.includes(`$${String(money.LADDER[tile])}`), `missing finance fact for tile ${String(tile)}`);
}
assert.match(moneyScreen, /milestoneFact\(/, 'Money 2048 must surface facts when a denomination milestone is reached');

const budget = await load('src/lib/budget-balancer.ts');
for (let phase = 0; phase <= 3; phase++) {
  const game = budget.createGame(phase + 1, phase);
  assert.equal(game.phase, phase, 'Budget Balancer must retain its learner phase after creation');
  assert.equal(budget.tuning(phase).startFixed, 1, 'every learner must get a one-cost readable start');
}
let advancedSurvivors = 0;
for (let seed = 1; seed <= 200; seed++) {
  let game = budget.createGame(seed, 3);
  // An ideal controller isolates tuning from touch skill: if even exact balance usually loses,
  // phase pressure is deciding the run before the player can.
  for (let frame = 0; frame < 3750 && !game.over; frame++) {
    game = budget.step(game, 16, Math.min(1, budget.balancePoint(game.costs)));
  }
  advancedSurvivors += game.over ? 0 : 1;
}
assert.ok(advancedSurvivors / 200 >= 0.7, 'advanced tuning must not overwhelm a correctly balanced run');
assert.match(budgetScreen, /const NUDGE = 0\.12;/, 'button nudges must create a clearly visible movement');
assert.doesNotMatch(
  await read('src/lib/budget-balancer.ts'),
  /const t = tuning\(0\)/,
  'spawn tuning must not silently revert to phase zero',
);

console.log(`games quality regression: PASS (${String(calls)} trend calls, ${(readable / calls * 100).toFixed(1)}% indicator accuracy)`);
