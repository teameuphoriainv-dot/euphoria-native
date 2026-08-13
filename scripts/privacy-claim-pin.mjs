#!/usr/bin/env node
// ============================================================================
// Privacy claim pin — makes `why-not-free.tsx` mechanically true.
//
//   node scripts/privacy-claim-pin.mjs
//
// WHY. That screen makes four factual claims about this codebase: no ads, no
// data sale, no session replay, and "nothing that identifies you personally".
// Three of them are enforced by configuration and one — autocapture — IS OFF BY
// OMISSION. `lib/analytics.ts` constructs the PostHog client directly and never
// mounts `<PostHogProvider>`, which is the only thing that autocaptures. So a
// reasonable-looking future change (wrapping the app in the Provider to get a
// hook) silently turns autocapture on and makes shipped copy false, with a green
// gate and a screenshot that looks identical.
//
// This app has already shipped a card claiming "no analytics" while 17b added a
// tracking SDK. That is the exact failure this pins shut. C113: a green gate
// means the things it checks are fine — so check this one.
//
// Relaxing any assertion here means `src/app/why-not-free.tsx` changes IN THE
// SAME COMMIT.
// ============================================================================

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ANALYTICS = readFileSync('src/lib/analytics.ts', 'utf8');
const PKG = JSON.parse(readFileSync('package.json', 'utf8'));

/** Property keys that would make "nothing that identifies you personally" false. */
const PII_KEY = /\b(name|email|handle|phone|username|first_name|last_name|address|dob|birthday)\s*:/i;

/** Any of these in the dependency tree contradicts "we do not run ads". */
const AD_SDK = /(admob|google-mobile-ads|applovin|ironsource|unity-ads|facebook-audience|adjust|appsflyer|tenjin)/i;

function tsFiles(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? tsFiles(p) : /\.tsx?$/.test(p) ? [p] : [];
  });
}

const fail = [];
const pass = (label) => console.log(`  ok    ${label}`);
const bad = (label, why) => {
  console.log(`  FAIL  ${label}`);
  fail.push(why);
};

console.log('\nPrivacy claim pin — why-not-free.tsx against the code it describes\n');

// 1. AUTOCAPTURE. The claim that is off by omission, and the only one a normal
//    change can break by accident.
//
//    Comments are stripped first, and that is not a nicety: analytics.ts NAMES
//    `<PostHogProvider autocapture>` in the doc comment warning about this exact
//    trap, so a naive scan fails on the file whose prose is the warning.
const code = (f) =>
  readFileSync(f, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
const providers = tsFiles('src').filter((f) => /<PostHogProvider[\s>]/.test(code(f)));
const unguarded = providers.filter((f) => !/<PostHogProvider[^>]*autocapture=\{false\}/s.test(code(f)));
if (unguarded.length > 0) {
  bad('autocapture off', `<PostHogProvider> mounted without autocapture={false} in ${unguarded.join(', ')}`);
} else {
  pass(`autocapture off${providers.length > 0 ? ' (Provider present, explicitly disabled)' : ' (no Provider mounted)'}`);
}

// 2. SESSION REPLAY. Configured, not omitted — but pin it anyway, because the
//    SDK default has changed before and a default is not a decision.
if (/enableSessionReplay:\s*false/.test(ANALYTICS)) pass('session replay off');
else bad('session replay off', 'analytics.ts no longer sets enableSessionReplay: false');

// 3. IDENTITY. The funnel is pseudonymous or the copy is wrong.
if (/install_id:\s*useApp\.getState\(\)\.installId/.test(ANALYTICS)) pass('identity is installId');
else bad('identity is installId', 'analytics.ts no longer sends install_id as the identity');

if (/\.identify\(/.test(ANALYTICS)) bad('no identify() call', 'analytics.ts calls identify() — that attaches a person to the funnel');
else pass('no identify() call');

// 4. THE SHAPE CHECK (C76, applied a third time). Without it a placeholder key
//    reads as configured and the app ships believing analytics is live.
if (/\^phc_/.test(ANALYTICS)) pass('key is shape-validated (phc_)');
else bad('key is shape-validated (phc_)', 'ANALYTICS_ENABLED no longer shape-checks the phc_ prefix');

// 5. NO PII AT ANY CALL SITE. The client is clean; the properties are where a
//    name gets attached by somebody being helpful.
const callSites = tsFiles('src').flatMap((f) =>
  [...readFileSync(f, 'utf8').matchAll(/track\(Ev\.\w+,\s*\{([\s\S]*?)\}\s*\)/g)].map((m) => ({ f, body: m[1] })),
);
const leaks = callSites.filter((c) => PII_KEY.test(c.body));
if (leaks.length > 0) bad('no PII in event properties', `PII-shaped property at ${leaks.map((l) => l.f).join(', ')}`);
else pass(`no PII in event properties (${callSites.length} call sites with properties)`);

// 6. NO AD SDK. "We do not run ads" is a dependency-tree fact.
const deps = Object.keys({ ...PKG.dependencies, ...PKG.devDependencies });
const ads = deps.filter((d) => AD_SDK.test(d));
if (ads.length > 0) bad('no ad SDK', `ad SDK in dependencies: ${ads.join(', ')}`);
else pass('no ad SDK');

if (fail.length > 0) {
  console.log('\nFAILED\n');
  for (const f of fail) console.log(`  ${f}`);
  console.log('\nEither revert the change, or rewrite src/app/why-not-free.tsx in the SAME commit.\n');
  process.exit(1);
}

console.log('\nPASS — every claim on why-not-free.tsx holds against the code.\n');
