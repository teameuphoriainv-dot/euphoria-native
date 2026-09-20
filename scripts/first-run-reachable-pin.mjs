/**
 * FIRST RUN REACHABLE PIN — /start must be reachable by the people it exists for.
 *
 *   node scripts/first-run-reachable-pin.mjs
 *   node scripts/first-run-reachable-pin.mjs --selftest
 *
 * WHY. src/app/start.tsx is the guided first action, and its own header says it exists because
 * ending onboarding on Home drops someone who has just answered fourteen questions onto a zero
 * streak, zero XP and an empty week strip with nothing telling them what to do. It was unreachable
 * for every new user, and nothing noticed, because each individual screen worked.
 *
 * THE TRACE.
 *   completeOnboarding() stamps profile.completedAt at the LOADER, two steps before the end.
 *   The reveal sends a user with no account to /auth?next=paywall by REPLACE.
 *   /auth returns them to /onboarding?step=paywall, so onboarding REMOUNTS.
 *   enteredWithCompletedOnboarding is frozen at mount from completedAt — which the flow itself set
 *   three steps ago — so it reads TRUE for a brand-new user, and every paywall exit takes the
 *   "returning visitor" branch to Home.
 *
 * THE SECOND FAILURE, which is the one that bites existing users. profile.firstRunDoneAt is written
 * in exactly one place, start.tsx. If /start never runs it stays null forever, so a long-time user
 * who signs out and back in hits auth's `firstRunDoneAt ? home : start` branch and is shown the
 * first-run screen — which the comment on that very function says must never happen.
 *
 * WHAT IT ASSERTS. The three things that together make /start reachable, plus the absence of the
 * unconditional '/home' exits that bypassed it even when the flag was right.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

const SELFTEST = process.argv.includes('--selftest');
const auth = read('src/app/auth.tsx');
const onboarding = read('src/app/onboarding.tsx');

/** Every check as a predicate over the two sources, so the selftest can run them on mutated copies. */
function problems(authSrc, onbSrc) {
  const fail = [];

  // 1. /start still has to be the destination for someone who has not done the first run.
  if (!/firstRunDoneAt \? '\/\(tabs\)\/home' : '\/start'/.test(authSrc))
    fail.push('auth no longer sends a user with no first run to /start.');

  // 2. The paywall return has to carry the marker, or onboarding cannot tell the two cases apart.
  if (!/backToPaywall \? '\/onboarding\?step=paywall&firstRun=1'/.test(authSrc))
    fail.push('auth returns to the paywall without firstRun=1, so onboarding reads a new user as returning.');

  // 3. Onboarding has to actually read it, and let it veto the frozen completedAt flag.
  if (!/const resumingFirstRun = params\.firstRun === '1';/.test(onbSrc))
    fail.push('onboarding no longer reads the firstRun marker.');
  if (!/!resumingFirstRun && Boolean\(useApp\.getState\(\)\.profile\.completedAt\)/.test(onbSrc))
    fail.push('enteredWithCompletedOnboarding ignores firstRun again — completedAt alone decides.');

  // 4. And the exits must route through the shared helper rather than hard-coding Home.
  if (!/const leaveOnboarding = \(\) => \{/.test(onbSrc))
    fail.push('leaveOnboarding is gone; the exits have diverged again.');
  if (!/leaveOnboarding\(\)\.?/.test(onbSrc))
    fail.push('nothing calls leaveOnboarding.');
  /*
   * The specific regression: a completed purchase used to go to '/home' unconditionally, so even a
   * PAYING new user skipped the guided first action. Any `r.isPro` branch that routes straight to
   * Home with no first-run test is that bug returning.
   */
  if (/if \(r\.ok && r\.isPro\) router\.replace\('\/home'\);/.test(onbSrc))
    fail.push('a completed purchase routes straight to /home, skipping the guided first action.');

  return fail;
}

const fail = problems(auth, onboarding);
if (fail.length) {
  console.error('first-run-reachable-pin: /start is not reachable.');
  fail.forEach((f) => console.error(`  ${f}`));
  console.error('\n  start.tsx writes profile.firstRunDoneAt and nothing else does. If it never');
  console.error('  runs, that flag stays null forever and a returning user signing back in is');
  console.error('  shown the first-run screen.\n');
  process.exit(1);
}

/**
 * THE NEGATIVE CONTROL. Reproduce each half of the bug and require the pin to see it.
 */
if (SELFTEST) {
  const assert = await import('node:assert/strict').then((m) => m.default);

  // (a) auth stops passing the marker — the original shape.
  const authNoMarker = auth.replace("'/onboarding?step=paywall&firstRun=1'", "'/onboarding?step=paywall'");
  assert.ok(problems(authNoMarker, onboarding).length > 0,
    'the pin cannot see auth dropping the firstRun marker');

  // (b) onboarding goes back to trusting completedAt alone.
  const onbOldFlag = onboarding.replace(
    '!resumingFirstRun && Boolean(useApp.getState().profile.completedAt)',
    'Boolean(useApp.getState().profile.completedAt)',
  );
  assert.ok(problems(auth, onbOldFlag).length > 0,
    'the pin cannot see enteredWithCompletedOnboarding ignoring firstRun');

  // (c) the purchase exit goes back to an unconditional Home.
  const onbOldBuy = onboarding.replace(
    /\/\/ Paying is not a reason[\s\S]{0,140}?\n/,
    "if (r.ok && r.isPro) router.replace('/home');\n",
  );
  assert.ok(problems(auth, onbOldBuy).length > 0,
    'the pin cannot see a purchase skipping the guided first action');

  console.log('[first-run-reachable-pin] selftest ok — all three regressions are detectable');
}

console.log('first-run-reachable-pin: OK — a new user reaches /start, and a returning one does not.');
