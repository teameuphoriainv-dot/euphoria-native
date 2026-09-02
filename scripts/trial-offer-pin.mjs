/**
 * The paywall may only offer a FREE TRIAL to someone who has not started one.
 *
 * This screen has now got this wrong twice. The first time it offered a trial to an EXPIRED user;
 * that was fixed by branching on `spent`. On 2026-08-22 two cofounders independently reported the
 * same shape again from two different entry points (the post-lesson reward sheet and the Home trial
 * banner), because `spent` only means 'expired' — `tier()` answers 'trial' for activeDays 0 THROUGH
 * TRIAL_DAYS, so a person on day 2 of 3 was indistinguishable from a fresh install. A paying `pro`
 * user fell through the same gap.
 *
 * A bug that has recurred once under a different guise will recur again. This pins the SHAPE: the
 * trial-specific copy and the trial CTA must be gated on `offersTrial`, never on `!spent`.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../src/app/onboarding.tsx', import.meta.url), 'utf8');
const ent = readFileSync(new URL('../src/lib/entitlement.ts', import.meta.url), 'utf8');

// 1. the discriminator exists and is defined off real USE, not off tier()
assert.match(ent, /export const trialStarted = \(s: AppState\) => s\.activeDays\.length > 0;/,
  'entitlement.trialStarted is gone or no longer reads activeDays — tier() alone CANNOT tell a '
  + 'fresh install from a user on day 2, which is the whole bug');

// 2. the paywall computes it, and requires BOTH not-pro and not-started
assert.match(src, /const offersTrial = tierNow === 'trial' && !trialRunning;/,
  'offersTrial must require tier==="trial" AND an unstarted clock; anything looser re-opens the bug');

// 3. every trial-specific surface is gated on offersTrial, and none on a bare !spent
const mustGate = [
  [/offersTrial\s*\?\s*`\$\{TRIAL_DAYS\} DAYS FREE/, 'the "N DAYS FREE" plan badge'],
  [/step === PAYWALL_INDEX && offersTrial && \(/, 'the "No payment due now" reassurance'],
  [/offersTrial\s*\n?\s*\?\s*`Start my \$\{TRIAL_DAYS\}-day free trial`/, 'the trial CTA label'],
  [/offersTrial\s*\?\s*`\$\{TRIAL_DAYS\} days free, then `\s*:\s*''/, 'the renewal fine print'],
];
for (const [re, what] of mustGate) {
  assert.match(src, re, `${what} is no longer gated on offersTrial — it can reach a user mid-trial`);
}

// 4. the CTA must not be `next` for anyone who already has a running trial: that was the dead
//    control the reports actually hit — a button that says "start my free trial" and only paginates.
assert.match(src, /\?\s*next\s*\n?\s*:\s*buyPro/,
  'the paywall CTA no longer routes non-trial users to buyPro');

// 5. a paying subscriber must never be offered anything here
assert.match(src, /const isProNow = tierNow === 'pro';/, 'the pro case is not distinguished');
assert.match(src, /isProNow\s*\n?\s*\?\s*"You're on Euphoria Pro"/,
  'a pro user must not be shown a trial or purchase heading — this is the "I already paid" refund bug');

// 6. Completing the loader stamps profile.completedAt before the paywall. The final routing
// decision must therefore use a value frozen on entry, not the now-mutated live profile. Otherwise
// returning upsell visitors are treated as first-timers and pushed forward instead of back.
assert.match(src, /const \[enteredWithCompletedOnboarding\] = useState\(\(\) => Boolean\(useApp\.getState\(\)\.profile\.completedAt\)\);/,
  'onboarding must freeze whether completion existed on entry; the loader mutates the live value');

// 6b. THE ACCOUNT WALL SITS BEFORE THE PAYWALL.
//
// This pin used to assert the opposite: that the step AFTER the paywall routed to /auth. That
// ordering made sign-up the last thing in the flow and therefore the easiest to abandon, and
// nothing downstream required it — finishing onboarding and quitting on the auth screen left a
// user in the app with no account. The wall moved to the reveal step, so what must be pinned is
// that it is still there and still ahead of the purchase.
assert.match(src, /if \(!hasAccount\(profile\)\) \{\s*router\.replace\('\/auth\?next=paywall' as never\);/,
  'the reveal step must send an account-less user to /auth BEFORE the paywall');
assert.doesNotMatch(src, /else router\.replace\('\/auth'\);/,
  'no step after the paywall may route to /auth — the account is collected before it, not after');
assert.match(src, /const dismissPaywall = \(\) => \{[\s\S]*?router\.replace\(profile\.firstRunDoneAt \? '\/\(tabs\)\/home' : \('\/start' as never\)\);\s*\};/,
  'Maybe later must hand off to the app, not ask an already-signed-up user to sign in again');
assert.match(src, /accessibilityLabel="Maybe later">/,
  'the dismiss control must remain reachable to App Review and assistive technology');

console.log('PASS — a free trial is offered only to a non-pro user whose trial clock has not '
  + 'started; mid-trial, expired and pro users each get their own copy and CTA; the account wall '
  + 'sits before the paywall and first-run dismissal '
  + 'hands off to the app rather than asking for a second sign-in.');
