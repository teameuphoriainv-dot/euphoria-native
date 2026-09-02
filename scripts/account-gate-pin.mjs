/**
 * NO ACCOUNT, NO APP — and no Continue button that does nothing.
 *
 * Two rules, both asked for directly on 2026-09-01, both of a shape that reads as fine in a diff
 * and fails only in someone's hand.
 *
 * ── 1. The account wall ──────────────────────────────────────────────────────────────────────
 * Account creation used to be the screen AFTER the paywall, and nothing downstream required it:
 * `index.tsx` redirected on `completedAt` alone, so a user could answer every question, quit on
 * the auth screen, relaunch, and land in Home having never made an account. The answers persisted,
 * so the app never asked again.
 *
 * The fix is not one redirect. A single guard on the entry route is exactly what was there before
 * and it is not enough, because the entry route is one door into a room with several: a purchase
 * calls `router.replace('/home')` directly, `/start` hands off, deep links and notification taps
 * arrive from outside. The gate therefore lives on the TAB LAYOUT, which every one of those
 * converges on, and this file pins it there.
 *
 * ── 2. Continue that does nothing ────────────────────────────────────────────────────────────
 * Single-select steps commit on the card tap (advanceAfterPick). The Continue button under them
 * was therefore never the control that advanced the screen — you tapped an option, the screen
 * moved, and a button sat below having been decorative the whole time. Reported as "every time I
 * click the option, it also automatically continues".
 *
 * The button must be derived from the SAME condition as the auto-advance, so the two can never
 * drift into disagreeing about which steps commit on tap. A hand-maintained second list is
 * exactly how notifyOptIn — the one single-select that does NOT auto-advance — would silently
 * lose its only way forward.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const path = read('../src/lib/onboarding-path.ts');
const onboarding = read('../src/app/onboarding.tsx');
const tabs = read('../src/app/(tabs)/_layout.tsx');
const index = read('../src/app/index.tsx');
const auth = read('../src/app/auth.tsx');

// ── 1. ONE definition of "has an account" ────────────────────────────────────────────────────
assert.match(path, /export function hasAccount\(p: Profile\): boolean \{/,
  'hasAccount() is gone — the three gates would each have to invent their own truth test');
assert.match(path, /return Boolean\(p\.authProvider \?\? p\.email\?\.trim\(\)\);/,
  'hasAccount must accept a verified provider OR an email, and nothing else');

// The name is collected in onboarding step 0, long before anyone is asked to sign up. If it ever
// counts as an account then every user walks through the gate on their first tap and the whole
// feature is silently a no-op — the failure this file exists to catch.
assert.doesNotMatch(path, /return Boolean\([^)]*p\.name/,
  'a name must NEVER count as an account — it is collected in onboarding step 0, before sign-up');

// ── 2. The gate is on the tab layout, not only the entry route ───────────────────────────────
assert.match(tabs, /import \{ hasAccount \} from '@\/lib\/onboarding-path';/,
  'the tab layout no longer imports hasAccount — the gate has been removed');
assert.match(tabs, /if \(!hasAccount\(profile\)\) return <Redirect href=\{'\/auth' as never\} \/>;/,
  'the tab layout must refuse entry without an account; this is THE enforcement, not index.tsx');
// Without the hydration wait the gate throws every signed-up user back to /auth whenever the first
// render beats AsyncStorage — intermittent, so it passes a casual test and fails on a real device.
assert.match(tabs, /if \(!hasHydrated\) return null;[\s\S]{0,200}?if \(!hasAccount\(profile\)\)/,
  'the tab gate must wait for hydration BEFORE testing the profile, or it bounces real accounts');

// ── 3. The entry route agrees with it ────────────────────────────────────────────────────────
assert.match(index, /if \(!hasAccount\(profile\)\) return <Redirect href=\{'\/auth' as never\} \/>;/,
  'index.tsx must send a completed-but-accountless user to /auth, not to Home');
assert.doesNotMatch(index, /href=\{completedAt \? '\/\(tabs\)\/home' : '\/welcome'\}/,
  'the old completedAt-only redirect is back — that single test WAS the escape hatch');

// ── 4. The wall is before the paywall, and auth comes back to it ─────────────────────────────
assert.match(onboarding, /router\.replace\('\/auth\?next=paywall' as never\)/,
  'the reveal step must send an account-less user to /auth before the paywall');
assert.match(auth, /const backToPaywall = params\.next === 'paywall';/,
  'auth must read ?next=paywall, or the user is dropped in the app and never sees the offer');
assert.match(auth, /backToPaywall \? '\/onboarding\?step=paywall'/,
  'auth must return to the paywall step it was called from');

// ── 5. The local path cannot create an empty account ─────────────────────────────────────────
// With Supabase off, enter() used to call land() unconditionally. Under the new gate a blank
// submission writes no email, leaves hasAccount() false, and bounces the user straight back here
// — a loop with no exit but deleting the app.
assert.match(auth, /if \(!email\.trim\(\)\) \{\s*setAuthError\('Enter an email address to create your account\.'\);/,
  'the AUTH_ENABLED=false path must require an email, or the account gate becomes an infinite loop');

// ── 5b. "Signed out? Sign back in" is NOT the sign-up button ─────────────────────────────────
// The control shared `enter` with Sign up, which was harmless until Sign up started requiring an
// email. Then a signed-out user with a saved profile and an empty form was told to "create your
// account" and could not get back in -- reported from a device with a screenshot. signOut only
// flips `signedIn` (store.ts) and leaves the profile intact, so signing back in is a state flip
// and must never be validated as a submission.
assert.match(auth, /onPress=\{resume\}/,
  'Sign back in must use its own handler; sharing `enter` re-breaks it the next time sign-up validation changes');
assert.match(auth, /const resume = \(\) => \{\s*if \(!hasAccount\(useApp\.getState\(\)\.profile\)\) \{\s*enter\(\);/,
  'resume must fall through to enter when the device has NO account, or it becomes a way around the gate');

// ── 6. No Continue button on steps that commit on tap ────────────────────────────────────────
assert.match(onboarding, /const autoAdvances = liveDef\?\.kind === 'single' && liveDef\.field !== 'notifyOptIn';/,
  'the auto-advance condition is gone or changed shape');
assert.match(onboarding, /const showAction = !autoAdvances;/,
  'the button must be derived from the auto-advance condition, never from a second hand-kept list');
assert.match(onboarding, /\{showAction && <SlabButton/,
  'the footer button is no longer conditional — the redundant Continue is back');

// notifyOptIn opens the iOS permission dialog and is deliberately excluded from the auto-advance,
// so it is the ONE single-select where the button is the only way forward. If this exclusion is
// ever dropped from either side, that step becomes a dead end.
assert.match(onboarding, /if \(def\.field !== 'notifyOptIn'\) advanceAfterPick\(\);/,
  'notifyOptIn must stay excluded from auto-advance; it is why showAction keeps a button there');

console.log('PASS — hasAccount is the single definition and a name alone never satisfies it; the '
  + 'tab layout refuses entry without an account and waits for hydration first; the wall sits '
  + 'before the paywall and auth returns to it; the local path cannot mint an empty account; and '
  + 'Continue is drawn only on steps a tap cannot finish.');
