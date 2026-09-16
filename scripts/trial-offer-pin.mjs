/**
 * The paywall may only offer a FREE TRIAL that Apple will actually grant, and its CTA must BUY.
 *
 * ── 2026-09-08, App Store rejection 2.1(b) on build 24 ──────────────────────────────────────
 * "There was no response when we chose Annual or Monthly and tapped Start my 3-day free trial."
 * They were right, and this file had pinned the cause. The CTA read
 * `offersTrial ? next : buyPro`, so the one user who is always offered a trial — a fresh install,
 * which is every reviewer — got a button wired to pagination instead of to StoreKit. Selecting a
 * plan changed nothing, no purchase sheet could open, and `next` at the last step fell through to
 * a `router.back()` that is a no-op after /auth replaces the stack.
 *
 * The trial it promised was a device-local `activeDays` counter that Apple has never heard of.
 * It is now an INTRODUCTORY OFFER on both products, so the sheet grants it and `offersTrial` is
 * read from the store rather than from our own tier. What this file pins first is therefore no
 * longer "who may be offered a trial" but "the purchase surface purchases".
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

// 2. THE TRIAL IS APPLE'S ANSWER, NOT OURS. `offersTrial` must be derived from the introductory
//    offer on the selected package, so this screen is structurally incapable of promising a trial
//    the purchase sheet will not honour. A pro user is still excluded before the read is consulted.
assert.match(src, /const storeTrialDays = isProNow \? null : \(selectedOffer\?\.freeTrialDays \?\? null\);/,
  'the trial length must be read from the selected package\'s Apple introductory offer');
assert.match(src, /const offersTrial = storeTrialDays !== null;/,
  'offersTrial must be decided by StoreKit; deriving it from tier() is what shipped a trial Apple '
  + 'had never agreed to grant');
assert.match(src, /readPlanOffer\(pkgs, 'annual'\), monthly: readPlanOffer\(pkgs, 'monthly'\)/,
  'both plans must be read from the live offering');

// 3. every trial-specific surface is gated on offersTrial, and none on a bare !spent
const mustGate = [
  [/annualOffer\?\.freeTrialDays \? `\$\{annualOffer\.freeTrialDays\} DAYS FREE/, 'the "N DAYS FREE" plan badge'],
  [/step === PAYWALL_INDEX && offersTrial && \(/, 'the "No payment due now" reassurance'],
  [/offersTrial\s*\n?\s*\?\s*`Start my \$\{trialLen\}-day free trial`/, 'the trial CTA label'],
  [/offersTrial\s*\?\s*`\$\{trialLen\} days free, then `\s*:\s*''/, 'the renewal fine print'],
];
for (const [re, what] of mustGate) {
  assert.match(src, re, `${what} is no longer gated on offersTrial — it can reach a user mid-trial`);
}

// 4. THE REJECTION PIN. The paywall CTA buys, for everyone, always. There must be no branch that
//    hands a non-pro user anything other than `buyPro`, and in particular not `next`.
assert.match(src, /step === PAYWALL_INDEX\s*\n\s*\?\s*isProNow\s*\n\s*\?\s*\(\) => router\.replace\('\/home'\)\s*\n\s*:\s*buyPro\s*\n\s*:\s*next/,
  'the paywall CTA must call buyPro for every non-pro user — routing it to `next` is exactly what '
  + 'App Review rejected build 24 for (2.1(b), "no response when we tapped Start my free trial")');
assert.doesNotMatch(src, /offersTrial\s*\n?\s*\?\s*next/,
  'a trial CTA that paginates instead of purchasing is the rejected control; the trial is an Apple '
  + 'introductory offer now and is granted by the purchase sheet');

// 4b. A BUY BUTTON MAY NEVER BE LIVE-LOOKING AND INERT. Until a real package is in hand it is
//     either loading or disabled with its reason on screen — never tappable and silent.
assert.match(src, /const canBuy = IAP_ENABLED && selectedOffer !== null;/,
  'the screen must know whether it can actually transact');
assert.match(src, /disabled=\{!canContinue \|\| busy \|\| \(step === PAYWALL_INDEX && !isProNow && !canBuy\)\}/,
  'the CTA must be disabled while there is no package to buy');
assert.match(src, /step === PAYWALL_INDEX && !isProNow && !canBuy && !offersLoading && \(/,
  'a paywall that cannot sell must say why, in place of the fine print');

// 4c. EVERY PRICE COMES FROM StoreKit. A hardcoded USD pair is a price Apple will not charge in
//     any other storefront, and it is what made the dead button look like a working one.
for (const [re, what] of [
  [/const annualPrice = annualOffer\?\.priceString \?\? PRICING\.annual;/, 'the annual price'],
  [/const monthlyPrice = monthlyOffer\?\.priceString \?\? PRICING\.monthly;/, 'the monthly price'],
  [/const annualPerMonth = annualOffer\?\.perMonthString \?\? PRICING\.annualPerMonth;/, 'the monthly equivalent'],
]) {
  assert.match(src, re, `${what} must be read from the store, with PRICING only as the pre-load placeholder`);
}

// 4d. THE LAST STEP MUST NEVER BE A DEAD END. `router.back()` is a silent no-op when /auth reached
//     this screen by replace, which is the ordinary first-run path.
assert.match(src, /else if \(enteredWithCompletedOnboarding && router\.canGoBack\(\)\) router\.back\(\);/,
  'the paywall exit must be canGoBack-guarded; a bare router.back() strands the user silently');

// 5. a paying subscriber must never be offered anything here
assert.match(src, /const isProNow = tierNow === 'pro';/, 'the pro case is not distinguished');
assert.match(src, /isProNow\s*\n?\s*\?\s*"You're on Euphoria Pro"/,
  'a pro user must not be shown a trial or purchase heading — this is the "I already paid" refund bug');

// 6. Completing the loader stamps profile.completedAt before the paywall. The final routing
// decision must therefore use a value frozen on entry, not the now-mutated live profile. Otherwise
// returning upsell visitors are treated as first-timers and pushed forward instead of back.
//
// FROZEN IS NECESSARY AND WAS NOT SUFFICIENT, and this assertion used to pin the insufficient
// version verbatim. Freezing on entry does nothing about a REMOUNT: /auth replaces onboarding and
// returns the user to ?step=paywall, so the second mount froze a completedAt that the flow itself
// had set three steps earlier and read a brand-new user as a returning visitor. Every paywall exit
// then took the returning branch, and /start — the guided first action — became unreachable for
// everyone. See scripts/first-run-reachable-pin.mjs.
//
// So this now pins the PROPERTY (frozen at mount, from completedAt) rather than one spelling of
// it, and the firstRun veto is required alongside.
assert.match(src, /const \[enteredWithCompletedOnboarding\] = useState\(\s*\(\) =>[^;]*Boolean\(useApp\.getState\(\)\.profile\.completedAt\)[^;]*\);/,
  'onboarding must freeze whether completion existed on entry; the loader mutates the live value');
assert.match(src, /!resumingFirstRun && Boolean\(useApp\.getState\(\)\.profile\.completedAt\)/,
  'the frozen flag must let firstRun=1 veto it, or the remount after /auth reads a new user as returning');

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
/*
 * "Maybe later" hands off through leaveOnboarding(), which is the ONE place the first-run decision
 * is made. It used to be inlined here and in next(), while the purchase-success path went straight
 * to '/home' — three exits, two of which skipped the guided first action even when the flag above
 * was right. Pinning the helper and its body keeps the decision in one place rather than pinning
 * one copy of it.
 */
assert.match(src, /const dismissPaywall = \(\) => \{[\s\S]*?leaveOnboarding\(\);\s*\};/,
  'Maybe later must hand off to the app, not ask an already-signed-up user to sign in again');
assert.match(src, /const leaveOnboarding = \(\) => \{\s*router\.replace\(useApp\.getState\(\)\.profile\.firstRunDoneAt \? '\/\(tabs\)\/home' : \('\/start' as never\)\);\s*\};/,
  'the shared exit must still send a user who has not done the first run to /start');
assert.doesNotMatch(src, /if \(r\.ok && r\.isPro\) router\.replace\('\/home'\);/,
  'a completed purchase must not skip the guided first action');
assert.match(src, /accessibilityLabel="Maybe later">/,
  'the dismiss control must remain reachable to App Review and assistive technology');

console.log('PASS — the paywall CTA always opens the App Store purchase sheet, the free trial is '
  + 'whatever Apple\'s introductory offer grants and never our own counter, every price is read '
  + 'from StoreKit, a button that cannot buy is disabled with its reason on screen, the last step '
  + 'cannot dead-end, and the account wall still sits before the paywall.');
