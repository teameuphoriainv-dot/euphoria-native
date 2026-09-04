#!/usr/bin/env node
/**
 * Proves a product can actually be FETCHED on a device, which is the one thing asc-preflight.mjs
 * cannot see.
 *
 * WHY THIS EXISTS. On 2026-09-04 build 24 was rejected under Guideline 2.1(b), "we are unable to
 * purchase item". asc-preflight passed 28/28 on that submission and RevenueCat's server returned
 * the current offering with BOTH packages attached -- every remote surface said healthy. The
 * failure was only ever visible on the device: with the Paid Apps Agreement inactive, StoreKit
 * returns no products, RevenueCat drops every package whose product it cannot resolve, and the
 * app logs the marker below while the paywall still renders with fallback prices. A paywall that
 * LOOKS right is exactly how this reached a reviewer.
 *
 * The app's own log line is the ground truth, so that is what this asserts on. Do not replace it
 * with a screenshot or a price assertion: PRICING constants render fine with zero packages, which
 * is how the broken build looked correct in the simulator on 2026-09-04.
 *
 * Usage: node scripts/iap-device-pin.mjs
 * Exit:  0 packages resolved · 1 offering empty on device · 2 could not run
 */
import { execFileSync } from 'node:child_process';

const BUNDLE = 'com.euphoriainv.euphoria';

/* THIS CHECK MUST NOT PASS ON THE ABSENCE OF A FAILURE STRING. An earlier draft passed whenever
 * the empty-offering marker was missing, which also "passes" when the app fails to boot, when the
 * log predicate stops matching, or when that copy is ever reworded -- a green check reporting
 * nothing at all. purchases.ts:342 logs a POSITIVE marker on success, so that is the pass
 * condition, and every other outcome blocks. */
const RESOLVED = /\[iap\] (\d+) package\(s\): (.+)/;          // purchases.ts:342 — success
const EMPTY = 'the current offering has NO packages';          // purchases.ts:337 — the 2.1(b) bug
const KEYLESS = 'EXPO_PUBLIC_REVENUECAT_IOS_KEY absent';       // purchases.ts:331 — build misconfigured

// stderr is ignored on purpose: simctl spawn emits a getpwuid_r warning on every call.
const sh = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });

const booted = sh('xcrun', ['simctl', 'list', 'devices', 'booted']).match(/\(([0-9A-F-]{36})\) \(Booted\)/);
if (!booted) { console.error('no booted simulator. boot one and install the app first.'); process.exit(2); }
const dev = booted[1];

try { sh('xcrun', ['simctl', 'terminate', dev, BUNDLE]); } catch { /* not running is fine */ }
try { sh('xcrun', ['simctl', 'launch', dev, BUNDLE]); }
catch { console.error(`${BUNDLE} is not installed on ${dev}.`); process.exit(2); }

/* RevenueCat resolves offerings a few seconds after launch, so poll for a VERDICT rather than
 * sleeping a flat interval and reading whatever happens to be there. */
const deadline = Date.now() + 60000;
let log = '';
let hit = null;
while (Date.now() < deadline && !hit) {
  log = sh('xcrun', ['simctl', 'spawn', dev, 'log', 'show', '--predicate', 'process == "euphorianative"', '--last', '3m', '--style', 'compact']);
  if (RESOLVED.test(log)) hit = 'resolved';
  else if (log.includes(EMPTY)) hit = 'empty';
  else if (log.includes(KEYLESS)) hit = 'keyless';
}

if (hit === 'resolved') {
  const [, count, ids] = log.match(RESOLVED);
  if (Number(count) > 0) {
    console.log(`PASS  2.1(b)  device resolved IAP packages  — ${count} package(s): ${ids.trim()}`);
    process.exit(0);
  }
  hit = 'empty'; // "[iap] 0 package(s)" is the bug wearing the success marker.
}

if (hit === null) {
  console.error('FAIL  2.1(b)  device resolved IAP packages  — no [iap] marker in 60s; the app never reached IAP init');
  console.error('        this is NOT a pass. The app may have failed to launch, or purchases.ts logging changed.');
  process.exit(2);
}

const why = hit === 'keyless'
  ? 'EXPO_PUBLIC_REVENUECAT_IOS_KEY absent from this build'
  : 'offering is EMPTY on device';
console.log(`FAIL  2.1(b)  device resolved IAP packages  — ${why}`);
console.log('\nDO NOT SUBMIT. The paywall renders but nothing can be bought.');
if (hit === 'empty') {
  console.log('  Most likely: Paid Apps Agreement is not Active (bank account / tax forms outstanding).');
  console.log('  Check https://appstoreconnect.apple.com/business — STATUS column, not the date range.');
}
process.exit(1);
