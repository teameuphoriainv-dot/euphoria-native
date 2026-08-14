#!/usr/bin/env node
// ============================================================================
// Pins the Atlas chat route: the advice guard, and the request config.
//
//   node scripts/advice-guard-regression.mjs
//
// WHY BOTH DIRECTIONS MATTER EQUALLY HERE.
//
// A guard that is too loose ships individualised investment advice to an 18-25
// year old from inside a finance app. A guard that is too tight breaks the
// curriculum — the entire product is about buying things, and Atlas explaining
// "when you buy a share of Apple you own a slice of the company" is the product
// WORKING. A filter that killed that sentence would be turned off within a week,
// which is strictly worse than not having one.
//
// So the ALLOW cases below are not padding. They are the reason the guard keys on
// a directive plus a named security rather than on the word "buy".
// ============================================================================

import { isAdvice } from '../src/app/api/_advice.ts';

const BLOCK = [
  'You should buy NVDA.',
  "I'd buy AAPL right now, it's cheap.",
  'You should definitely sell TSLA before earnings.',
  'I recommend you get into $PLTR.',
  'My advice is to load up on MSFT.',
  'You need to short GME.',
  'Honestly, you should just dump AMD and move on.',
  'I would pick up some $NVDA on this dip.',
  // Advice hiding after legitimate teaching in the same reply.
  'Diversification spreads risk across holdings. You should buy NVDA today.',
  // ── found 2026-08-14 by probing the guard directly, all three previously ALLOWED ──────────
  // The guard runs on ATLAS'S OUTPUT, so these are replies, not questions.
  // Prose says "Tesla", not "TSLA" — the security check only ever looked for uppercase tickers.
  'I recommend selling your Tesla shares.',
  // "put ... into" was not an act. Matched with a short gap so "a put gives you the right to
  // sell" — an options term this app teaches — still passes.
  'You ought to put that $5,000 into AAPL.',
  // An order has no subject, so DIRECTIVE ("you should") could never match one.
  'Buy NVDA.',
  'Sell your Apple position.',
];

const ALLOW = [
  // Guards against the widening above over-reaching. Each of these contains an act word and, in
  // two cases, a company name — and none of them is a recommendation.
  'A put gives you the right to sell at the strike price.',
  'Buy low, sell high is the oldest advice there is.',
  'You should buy an ETF rather than one stock.',
  'Apple is a good example of a company with a services engine.',
  // The curriculum. Every one of these is the product working.
  'When you buy a share of Apple, you own a small slice of the company.',
  'Buying NVDA and selling it a day later is trading, not investing.',
  'A share of AAPL represents a claim on future earnings.',
  'People often buy an ETF instead of picking single stocks.',
  'You should understand what you own before you own it.',
  'You should diversify rather than concentrating in one name.',
  'Investors often rebalance once a year.',
  'One should read the prospectus first.',
  'The price of TSLA moved 4% yesterday.',
  'If you buy at $100 and it falls to $90, you are down 10%.',
  // A directive and a ticker in DIFFERENT sentences is not a recommendation.
  'You should learn how earnings work. AAPL reports next week.',
  // Generic acronyms that look like tickers.
  'You should buy an ETF rather than a single stock.',
  'You should open an IRA if your employer offers no match.',
  'I would say the US market is unusually concentrated right now.',
];

const fail = [];
console.log('\nAdvice guard — refuses recommendations, keeps the curriculum\n');

console.log(' MUST BLOCK (individualised advice)');
for (const t of BLOCK) {
  const ok = isAdvice(t);
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${t.slice(0, 62)}`);
  if (!ok) fail.push(`NOT blocked but should be: ${t}`);
}

console.log('\n MUST ALLOW (education — a false positive here breaks the product)');
for (const t of ALLOW) {
  const ok = !isAdvice(t);
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${t.slice(0, 62)}`);
  if (!ok) fail.push(`BLOCKED but is teaching: ${t}`);
}

/*
 * REQUEST CONFIG. Not about advice — about the two settings whose absence is INVISIBLE.
 *
 * Gemini 3.x counts thinking tokens against maxOutputTokens. Measured: 346 of 386 tokens were
 * thought, so the answer was cut mid-sentence while finishReason said "STOP" and the body looked
 * fine. Nothing short of reading usageMetadata reveals it, and it costs ~17x per message on the one
 * feature with a real per-message cost.
 */
import { readFileSync } from 'node:fs';

// Comments stripped first — the same trap privacy-claim-pin hit. chat+api.ts NAMES `thinkingLevel`
// in the comment explaining why it is insufficient, so a naive scan fails on the prose warning
// against the thing it is checking for.
const route = readFileSync('src/app/api/chat+api.ts', 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');
console.log('\n REQUEST CONFIG (silent failures)');
const cfg = [
  ['thinking is OFF (thinkingBudget: 0)', /thinkingConfig:\s*\{\s*thinkingBudget:\s*0\s*\}/],
  ['thinkingLevel is NOT used — measured insufficient, still burned 318', /thinkingLevel/, true],
  ['output is bounded (maxOutputTokens)', /maxOutputTokens:\s*\d+/],
  ['reads the first part WITH text, not parts[0].text', /parts\.find\(/],
];
for (const [name, re, mustBeAbsent] of cfg) {
  const present = re.test(route);
  const ok = mustBeAbsent ? !present : present;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}`);
  if (!ok) fail.push(mustBeAbsent ? `${name}: found it, and it does not work` : `${name}: missing from chat+api.ts`);
}

if (fail.length > 0) {
  console.log('\nFAILED\n');
  for (const f of fail) console.log(`  ${f}`);
  console.log('\nFix src/app/api/_advice.ts. If an ALLOW case fails, the guard is eating the');
  console.log('curriculum — that is the more damaging direction, not the safer one.\n');
  process.exit(1);
}

console.log(`\nPASS — ${BLOCK.length} refused, ${ALLOW.length} taught, config pinned.\n`);
