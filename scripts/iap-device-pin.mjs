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
const MARKER = 'the current offering has NO packages';
// stderr is ignored on purpose: simctl spawn emits a getpwuid_r warning on every call.
const sh = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });

const booted = sh('xcrun', ['simctl', 'list', 'devices', 'booted']).match(/\(([0-9A-F-]{36})\) \(Booted\)/);
if (!booted) { console.error('no booted simulator. boot one and install the app first.'); process.exit(2); }
const dev = booted[1];

try { sh('xcrun', ['simctl', 'terminate', dev, BUNDLE]); } catch { /* not running is fine */ }
try { sh('xcrun', ['simctl', 'launch', dev, BUNDLE]); }
catch { console.error(`${BUNDLE} is not installed on ${dev}.`); process.exit(2); }

// RevenueCat resolves offerings a few seconds after launch. Poll rather than sleep a flat 20s.
const deadline = Date.now() + 45000;
let log = '';
while (Date.now() < deadline) {
  log = sh('xcrun', ['simctl', 'spawn', dev, 'log', 'show', '--predicate', `process == "euphorianative"`, '--last', '2m', '--style', 'compact']);
  if (log.includes(MARKER) || /\[iap\][^\n]*packages/.test(log)) break;
  if (/Offerings|offering/i.test(log) && !/Error fetching offerings/.test(log)) break;
}

const broken = log.includes(MARKER);
const sawOfferingError = /Error fetching offerings|issue with your configuration/.test(log);

console.log(`${broken ? 'FAIL' : 'PASS'}  2.1(b)  device resolved IAP packages  — ${broken ? 'offering is EMPTY on device' : 'no empty-offering marker'}`);
if (sawOfferingError) console.log('        note: RevenueCat reported an offerings fetch error in this run');

if (broken) {
  console.log('\nDO NOT SUBMIT. The paywall renders but nothing can be bought.');
  console.log('  Most likely: Paid Apps Agreement is not Active (bank account / tax forms outstanding).');
  console.log('  Check https://appstoreconnect.apple.com/business — STATUS column, not the date range.');
  process.exit(1);
}
