/**
 * Regression check for 17e: a member in billing retry must NOT be hard-walled.
 *
 * 17h asks for this explicitly — "a user in billing-retry is verifiably not hard-walled (seed the
 * state, assert the gate)". It cannot be asserted on device: the state comes from RevenueCat's
 * `billingIssueDetectedAt`, which is not seedable from the app side. So the rule is pinned here,
 * against the same logic `proStateFrom` implements.
 *
 * HONEST LIMITATION, the same one scripts/portfolio-snapshot-regression.mjs carries: this
 * imports the real rule from src/lib/billing-retry.ts — see the note below. It used to be an Expo
 * app and there is no test runner configured. It pins the BEHAVIOUR and the numbers. If
 * `proStateFrom` changes, this will not automatically notice — the docblock in lib/purchases.ts
 * points here, which is the only coupling available without adding a framework.
 *
 * WHY IT MATTERS: somewhere between a fifth and two fifths of subscription churn is a failed
 * payment rather than a decision to leave. The naive check — `entitlements.active` only — evicts
 * those members mid-retry, and being locked out is exactly what stops someone bothering to fix
 * their card. The naive check manufactures churn.
 *
 * Run: node scripts/billing-retry-regression.mjs
 */
import assert from 'node:assert/strict';

import { readFileSync } from 'node:fs';

import { BILLING_RETRY_GRACE_DAYS, ENTITLEMENT_ID as ID, proStateFrom, withinRetryGrace } from '../src/lib/billing-retry.ts';

const DAY = 86_400_000;

/*
 * IMPORTS the rule now, rather than mirroring it.
 *
 * This script used to open by admitting it "re-implements the rule rather than importing it,
 * because the source is TypeScript inside an Expo app" — so the regression guarding the rule was
 * testing a second copy of it. The two agreed on the day they were written, which is not the
 * property anyone wanted; the property wanted is that they cannot disagree later. The rule moved to
 * `src/lib/billing-retry.ts`, which is erasable-syntax-only and imports nothing, so Node loads it
 * directly. Same trick as `cost-basis.ts`, extracted after ITS copy drifted and the same fix had to
 * be applied twice.
 */

const NOW = Date.parse('2026-08-10T12:00:00Z');
const iso = (ms) => new Date(ms).toISOString();
/*
 * FIXTURE KEYS USE [ID], NOT A LITERAL. These objects stand in for RevenueCat's payload, so the
 * key must be the entitlement identifier the app actually looks up. Hardcoding 'pro' here made
 * this regression pass while the real dashboard identifier was 'Euphoria Pro' -- the test proved
 * the rule against a key production never sees. The `pro:` inside the EXPECTED objects below is a
 * different thing entirely: it is proStateFrom's own result field, and it stays spelled 'pro'.
 */
const ent = (o) => ({ entitlements: { active: o.active ?? {}, all: o.all ?? {} } });

// ── An ordinary paying member ────────────────────────────────────────────────────────────────
assert.deepEqual(
  proStateFrom(ent({ active: { [ID]: { billingIssueDetectedAt: null } } }), NOW),
  { pro: true, billingIssue: false },
);

// Active but flagged: Apple has a grace period configured, so RevenueCat still reports active.
// Access continues AND the banner must show — the card still needs fixing.
assert.deepEqual(
  proStateFrom(ent({ active: { [ID]: { billingIssueDetectedAt: iso(NOW - DAY) } } }), NOW),
  { pro: true, billingIssue: true },
);

// ── THE CASE THIS EXISTS FOR: retry with NO grace period ─────────────────────────────────────
// No active entitlement, a billing issue, expired 3 days ago. The naive check locks them out.
const inRetry = ent({
  all: { [ID]: { billingIssueDetectedAt: iso(NOW - 3 * DAY), expirationDate: iso(NOW - 3 * DAY) } },
});
assert.equal(proStateFrom(inRetry, NOW).pro, true, 'a member mid-retry must KEEP access');
assert.equal(proStateFrom(inRetry, NOW).billingIssue, true, 'and must be TOLD, or nothing gets fixed');

// The naive rule, for contrast — this is what the code did before C105.
const naive = (info) => info.entitlements.active[ID] !== undefined;
assert.equal(naive(inRetry), false, 'the old check evicted them, which is the bug');

// ── The window has an end ────────────────────────────────────────────────────────────────────
const justInside = ent({
  all: { [ID]: { billingIssueDetectedAt: iso(NOW), expirationDate: iso(NOW - 15 * DAY) } },
});
const justOutside = ent({
  all: { [ID]: { billingIssueDetectedAt: iso(NOW), expirationDate: iso(NOW - 17 * DAY) } },
});
assert.equal(proStateFrom(justInside, NOW).pro, true, 'day 15 still covered');
assert.equal(proStateFrom(justOutside, NOW).pro, false, 'day 17 is not — this is not free access');

// ── An ordinary lapse is NOT rescued ─────────────────────────────────────────────────────────
// Someone who cancelled has no billing issue. Extending access to them would be giving the
// product away, and it is the failure mode a careless version of this fix would introduce.
const cancelled = ent({
  all: { [ID]: { billingIssueDetectedAt: null, expirationDate: iso(NOW - DAY) } },
});
assert.deepEqual(proStateFrom(cancelled, NOW), { pro: false, billingIssue: false });

// Never subscribed at all.
assert.deepEqual(proStateFrom(ent({}), NOW), { pro: false, billingIssue: false });

// A malformed expiry must fail CLOSED on access but still report the issue — guessing a date here
// would be inventing an entitlement out of bad data.
const noDate = ent({ all: { [ID]: { billingIssueDetectedAt: iso(NOW), expirationDate: null } } });
assert.deepEqual(proStateFrom(noDate, NOW), { pro: false, billingIssue: true });

// ── THE SERVER MUST SHARE THIS RULE, NOT RESTATE IT ──────────────────────────────────────────
// `_entitlement.ts` used to carry a comment admitting it did not implement the grace period, and
// that a member mid-retry "may therefore be refused by this check while the client still grants
// them access". Dormant only because REVENUECAT_SECRET_KEY is unset — the day it is set, a paying
// member whose card is being retried gets a 402 while their own banner says "fix your card".
//
// Asserted structurally because the branch itself needs a live RevenueCat response to exercise.
// If someone deletes the import, this fails loudly instead of waiting for a billing incident.
// COMMENTS STRIPPED FIRST. The first version of this check matched the bare identifier anywhere in
// the file, so it passed even with the CALL deleted — the import line and this very explanation
// kept it green. Verified by deleting the call and watching it still pass. A check that a comment
// can satisfy is not a check.
const serverRaw = readFileSync(new URL('../src/lib/server/entitlement.ts', import.meta.url), 'utf8');
const server = serverRaw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
assert.ok(
  /withinRetryGrace\s*\(/.test(server),
  '_entitlement.ts no longer uses withinRetryGrace — the server has stopped honouring the billing-retry grace period, so a paying member mid-retry will be refused',
);
assert.ok(
  !/BILLING_RETRY_GRACE_DAYS\s*\*/.test(server),
  '_entitlement.ts is doing its own grace arithmetic — that is the two-copies-of-one-money-rule shape this pin exists to prevent',
);

// The shared primitive's own boundary, called directly rather than through proStateFrom.
assert.equal(withinRetryGrace(NOW - 15 * DAY, true, NOW), true, 'day 15 is inside the window');
assert.equal(withinRetryGrace(NOW - 17 * DAY, true, NOW), false, 'day 17 is outside the window');
assert.equal(withinRetryGrace(NOW - DAY, false, NOW), false, 'no billing issue is not rescued');
assert.equal(withinRetryGrace(NaN, true, NOW), false, 'an unreadable date is not a licence');

console.log('PASS — billing retry keeps access, cancellation does not, and the window ends.');
console.log('  server shares the rule (withinRetryGrace imported, no second copy of the maths)');
console.log(`  mid-retry (3d)   -> pro=${proStateFrom(inRetry, NOW).pro}   (old check: ${naive(inRetry)})`);
console.log(`  day 15 / day 17  -> ${proStateFrom(justInside, NOW).pro} / ${proStateFrom(justOutside, NOW).pro}`);
console.log(`  cancelled        -> pro=${proStateFrom(cancelled, NOW).pro}`);
