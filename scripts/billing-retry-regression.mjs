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

import { BILLING_RETRY_GRACE_DAYS, ENTITLEMENT_ID as ID, proStateFrom } from '../src/lib/billing-retry.ts';

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
const ent = (o) => ({ entitlements: { active: o.active ?? {}, all: o.all ?? {} } });

// ── An ordinary paying member ────────────────────────────────────────────────────────────────
assert.deepEqual(
  proStateFrom(ent({ active: { pro: { billingIssueDetectedAt: null } } }), NOW),
  { pro: true, billingIssue: false },
);

// Active but flagged: Apple has a grace period configured, so RevenueCat still reports active.
// Access continues AND the banner must show — the card still needs fixing.
assert.deepEqual(
  proStateFrom(ent({ active: { pro: { billingIssueDetectedAt: iso(NOW - DAY) } } }), NOW),
  { pro: true, billingIssue: true },
);

// ── THE CASE THIS EXISTS FOR: retry with NO grace period ─────────────────────────────────────
// No active entitlement, a billing issue, expired 3 days ago. The naive check locks them out.
const inRetry = ent({
  all: { pro: { billingIssueDetectedAt: iso(NOW - 3 * DAY), expirationDate: iso(NOW - 3 * DAY) } },
});
assert.equal(proStateFrom(inRetry, NOW).pro, true, 'a member mid-retry must KEEP access');
assert.equal(proStateFrom(inRetry, NOW).billingIssue, true, 'and must be TOLD, or nothing gets fixed');

// The naive rule, for contrast — this is what the code did before C105.
const naive = (info) => info.entitlements.active[ID] !== undefined;
assert.equal(naive(inRetry), false, 'the old check evicted them, which is the bug');

// ── The window has an end ────────────────────────────────────────────────────────────────────
const justInside = ent({
  all: { pro: { billingIssueDetectedAt: iso(NOW), expirationDate: iso(NOW - 15 * DAY) } },
});
const justOutside = ent({
  all: { pro: { billingIssueDetectedAt: iso(NOW), expirationDate: iso(NOW - 17 * DAY) } },
});
assert.equal(proStateFrom(justInside, NOW).pro, true, 'day 15 still covered');
assert.equal(proStateFrom(justOutside, NOW).pro, false, 'day 17 is not — this is not free access');

// ── An ordinary lapse is NOT rescued ─────────────────────────────────────────────────────────
// Someone who cancelled has no billing issue. Extending access to them would be giving the
// product away, and it is the failure mode a careless version of this fix would introduce.
const cancelled = ent({
  all: { pro: { billingIssueDetectedAt: null, expirationDate: iso(NOW - DAY) } },
});
assert.deepEqual(proStateFrom(cancelled, NOW), { pro: false, billingIssue: false });

// Never subscribed at all.
assert.deepEqual(proStateFrom(ent({}), NOW), { pro: false, billingIssue: false });

// A malformed expiry must fail CLOSED on access but still report the issue — guessing a date here
// would be inventing an entitlement out of bad data.
const noDate = ent({ all: { pro: { billingIssueDetectedAt: iso(NOW), expirationDate: null } } });
assert.deepEqual(proStateFrom(noDate, NOW), { pro: false, billingIssue: true });

console.log('PASS — billing retry keeps access, cancellation does not, and the window ends.');
console.log(`  mid-retry (3d)   -> pro=${proStateFrom(inRetry, NOW).pro}   (old check: ${naive(inRetry)})`);
console.log(`  day 15 / day 17  -> ${proStateFrom(justInside, NOW).pro} / ${proStateFrom(justOutside, NOW).pro}`);
console.log(`  cancelled        -> pro=${proStateFrom(cancelled, NOW).pro}`);
