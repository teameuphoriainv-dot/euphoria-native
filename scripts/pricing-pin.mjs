/**
 * The paywall's price arithmetic must stay self-consistent.
 *
 * onboarding.tsx's PRICING block says the arithmetic is written out "so a later edit
 * cannot quietly break the badge" -- but nothing enforced that. On 2026-08-20 the app
 * was found displaying $79.99/yr while App Store Connect had euphoria_pro_yearly at
 * $59.99 (see refs/PRICE_DESYNC.md). A store/app mismatch is not something a local
 * test can see, but the DERIVED numbers are, and they are where a half-finished price
 * change shows up first: change `annual` alone and the "SAVE 33%" badge and the
 * "$6.67 a month" line silently become lies.
 *
 * Misstating a subscription price on the purchase screen is an App Review problem, and
 * this app already carries an open guideline 2.1(a) rejection.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../src/app/onboarding.tsx', import.meta.url), 'utf8');

const block = src.match(/const PRICING = \{([\s\S]*?)\} as const;/);
assert.ok(block, 'PRICING block not found in onboarding.tsx — was it renamed or moved?');
const get = (k) => {
  const m = block[1].match(new RegExp(`${k}:\\s*'?\\$?([\\d.]+)'?`));
  assert.ok(m, `PRICING.${k} missing`);
  return Number(m[1]);
};

const monthly = get('monthly');
const annual = get('annual');
const perMonth = get('annualPerMonth');
const savingPct = get('savingPct');

// the badge and the per-month line must both follow from monthly + annual
const expectedPerMonth = Math.round((annual / 12) * 100) / 100;
assert.equal(perMonth, expectedPerMonth,
  `annualPerMonth is $${perMonth} but ${annual}/12 rounds to $${expectedPerMonth}`);

const expectedSaving = Math.round((1 - annual / (monthly * 12)) * 100);
assert.equal(savingPct, expectedSaving,
  `savingPct is ${savingPct}% but 1 - ${annual}/(${monthly}*12) rounds to ${expectedSaving}%`);

// an annual that costs more than twelve months is not a saving
assert.ok(annual < monthly * 12, 'the annual plan must cost less than 12 monthly payments');
assert.ok(savingPct > 0 && savingPct < 100, `savingPct ${savingPct} is not a plausible discount`);

// Strip comments and the PRICING block, then no bare price literal may remain: every
// user-visible price has to come through PRICING or the badge can drift again.
const stripped = src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '')
  .replace(/const PRICING = \{[\s\S]*?\} as const;/, '');
const stray = stripped.match(/\$\d+\.\d{2}/g);
assert.equal(stray, null,
  `onboarding.tsx hardcodes ${JSON.stringify(stray)} outside PRICING — route it through PRICING`);

// The two sheets deliberately show no price at all (C31 / §0.4). Keep it that way.
for (const f of ['dismissal-offer-sheet', 'trial-reward-sheet']) {
  const s = readFileSync(new URL(`../src/components/${f}.tsx`, import.meta.url), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const found = s.match(/\$\d+\.\d{2}/g);
  assert.equal(found, null, `${f}.tsx shows a price ${JSON.stringify(found)}; §0.4 says it must not`);
}

// The trial length must never be typed as a literal in paywall copy. It already drifted
// once -- the screen promised "7 days free" while the engine granted three.
assert.ok(/TRIAL_DAYS/.test(src), 'onboarding.tsx must interpolate TRIAL_DAYS, not a literal');
const store = readFileSync(new URL('../src/lib/store.ts', import.meta.url), 'utf8');
assert.ok(/export const TRIAL_DAYS = \d+;/.test(store), 'TRIAL_DAYS must stay a single exported const');
assert.ok(!/\b\d+ days? free/i.test(stripped),
  'onboarding.tsx writes a literal trial length in copy; interpolate TRIAL_DAYS instead');

console.log(`PASS — paywall pricing is self-consistent: $${monthly}/mo, $${annual}/yr `
  + `= $${perMonth}/mo equivalent, ${savingPct}% off, and no price is hardcoded outside PRICING.`);
