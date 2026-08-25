#!/usr/bin/env node
// ============================================================================
// F7 — server-side entitlement on the paid routes.
//
//   node scripts/entitlement-regression.mjs
//
// WHY THE *ALLOW* CASES MATTER MORE THAN THE DENY CASES.
//
// A wrong deny locks a paying member out of the thing they just bought. It reads
// as "I paid and it broke", it is indistinguishable from a real lapse in the
// logs, and it is the single worst support ticket this product can generate.
// `purchases.ts` already holds that line client-side — a network failure must
// never revoke access — and this module has to hold the same line on the server.
//
// So every uncertain path must ALLOW: no secret, a 5xx, a timeout, a malformed
// body. The only thing that may DENY is RevenueCat affirmatively saying this
// subscriber has no active entitlement.
//
// Wrong in the open direction costs tokens. Wrong in the closed direction costs
// a customer.
//
// `fetch` is stubbed — a regression must never depend on RevenueCat being up.
// ============================================================================

/*
 * ENTITLEMENT_ID comes from the module under test, never from a literal here. These fixtures stand
 * in for RevenueCat's subscriber payload, so the key has to be the identifier production actually
 * looks up. A hardcoded 'pro' made this regression green while the live dashboard identifier was
 * 'Euphoria Pro' -- it asserted the fail-open rules against a key no real response ever contains.
 */
import { decide, ENTITLEMENT_ID as ID } from '../src/app/api/_entitlement.ts';

const fail = [];
let n = 0;
const realFetch = globalThis.fetch;

/** Each case gets a fresh subject id so the 5-minute memo cannot leak between them. */
const subj = () => `test-subject-${++n}`;

function stub(handler) {
  globalThis.fetch = async (url) => handler(String(url));
}

const ok = (body) => new Response(JSON.stringify(body), { status: 200 });
const status = (s) => new Response('{}', { status: s });
const future = new Date(Date.now() + 86_400_000).toISOString();
const past = new Date(Date.now() - 86_400_000).toISOString();

async function check(name, { secret, requireAuth, subject, fetcher }, wantAllow, wantReason) {
  if (secret === undefined) delete process.env.REVENUECAT_SECRET_KEY;
  else process.env.REVENUECAT_SECRET_KEY = secret;
  if (requireAuth) process.env.ATLAS_REQUIRE_AUTH = '1';
  else delete process.env.ATLAS_REQUIRE_AUTH;
  stub(fetcher ?? (() => status(500)));

  const d = await decide(subject === undefined ? subj() : subject);
  const good = d.allow === wantAllow && (!wantReason || d.reason === wantReason);
  console.log(`  ${good ? 'ok  ' : 'FAIL'}  ${d.allow ? 'ALLOW' : 'DENY '}  ${name}`);
  if (!good) fail.push(`${name}: expected allow=${wantAllow}${wantReason ? `/${wantReason}` : ''}, got allow=${d.allow}/${d.reason}`);
}

console.log('\nF7 — server-side entitlement\n');

console.log(' NOT CONFIGURED — must be a perfect no-op');
await check('no secret, anonymous', { subject: null }, true, 'not-enforced');
await check('no secret, signed in', {}, true, 'not-enforced');

console.log('\n CONFIGURED — RevenueCat answers');
await check('active entitlement', {
  secret: 's', fetcher: () => ok({ subscriber: { entitlements: { [ID]: { expires_date: future } } } }),
}, true, 'entitled');
await check('lifetime (expires_date null)', {
  secret: 's', fetcher: () => ok({ subscriber: { entitlements: { [ID]: { expires_date: null } } } }),
}, true, 'entitled');
await check('EXPIRED entitlement', {
  secret: 's', fetcher: () => ok({ subscriber: { entitlements: { [ID]: { expires_date: past } } } }),
}, false, 'not-entitled');
await check('no pro entitlement at all', {
  secret: 's', fetcher: () => ok({ subscriber: { entitlements: {} } }),
}, false, 'not-entitled');
await check('404 — never seen this subscriber, so never paid', {
  secret: 's', fetcher: () => status(404),
}, false, 'not-entitled');

console.log('\n FAILS OPEN — never lock out a payer for an outage');
await check('RevenueCat 500', { secret: 's', fetcher: () => status(500) }, true, 'lookup-failed');
await check('RevenueCat 429', { secret: 's', fetcher: () => status(429) }, true, 'lookup-failed');
await check('network throws', {
  secret: 's', fetcher: () => { throw new Error('ECONNRESET'); },
}, true, 'lookup-failed');
await check('malformed body', {
  secret: 's', fetcher: () => new Response('not json', { status: 200 }),
}, true, 'lookup-failed');
await check('unparseable expiry date', {
  secret: 's', fetcher: () => ok({ subscriber: { entitlements: { [ID]: { expires_date: 'nonsense' } } } }),
}, false, 'not-entitled');

console.log('\n ANONYMOUS — the rollout switch');
await check('anonymous allowed while sign-in does not exist', { secret: 's', subject: null }, true, 'anonymous-allowed');
await check('ATLAS_REQUIRE_AUTH=1 refuses anonymous', {
  secret: 's', subject: null, requireAuth: true,
}, false, 'auth-required');

globalThis.fetch = realFetch;
delete process.env.REVENUECAT_SECRET_KEY;
delete process.env.ATLAS_REQUIRE_AUTH;

if (fail.length > 0) {
  console.log('\nFAILED\n');
  for (const f of fail) console.log(`  ${f}`);
  console.log('\nFix src/app/api/_entitlement.ts. If a FAILS OPEN case now denies, you have built');
  console.log('a way to lock a paying member out of what they just bought.\n');
  process.exit(1);
}

console.log('\nPASS — pays or is unknown-to-us: allowed. Affirmatively not entitled: refused.\n');
