#!/usr/bin/env node
// ============================================================================
// Pins server-side identity verification.
//
//   node scripts/identity-regression.mjs
//
// WHY. This module decides who a caller IS. Everything downstream — whose rate
// limit is spent, whose budget is full — trusts its answer. The failure mode is
// not an error: it is a request being believed. `alg: "none"` and algorithm
// confusion are the two oldest JWT attacks in existence and both work against
// code that reads `alg` out of the token and does what it says.
//
// So the negative cases below are the point of the file. A verifier that only
// ever gets shown valid tokens has not been tested.
// ============================================================================

import { Buffer } from 'node:buffer';
import { bearer, verifiedSubject } from '../src/app/api/_identity.ts';

const SECRET = 'test-secret-do-not-use-anywhere-real';
const enc = new TextEncoder();
const b64 = (buf) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function sign(header, payload, secret = SECRET) {
  const h = b64(enc.encode(JSON.stringify(header)));
  const p = b64(enc.encode(JSON.stringify(payload)));
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${h}.${p}`));
  return `${h}.${p}.${b64(new Uint8Array(sig))}`;
}

const NOW = 1_786_000_000_000; // fixed clock; Date.now() would make this flaky at a boundary
const secs = Math.floor(NOW / 1000);
const fail = [];
const check = async (name, tokenPromise, want, secret = SECRET) => {
  const got = await verifiedSubject(await tokenPromise, secret, NOW);
  const ok = got === want;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}`);
  if (!ok) fail.push(`${name}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`);
};

console.log('\nServer-side identity verification\n');
const H = { alg: 'HS256', typ: 'JWT' };

console.log(' ACCEPTS a genuine token');
await check('valid HS256 with sub and exp', sign(H, { sub: 'user-123', exp: secs + 3600 }), 'user-123');
await check('nbf already passed', sign(H, { sub: 'u2', exp: secs + 60, nbf: secs - 60 }), 'u2');

console.log('\n REFUSES forged and malformed tokens');
await check('WRONG SECRET', sign(H, { sub: 'u', exp: secs + 60 }, 'attacker-secret'), null);

// ── audience, pinned 2026-08-14 before this goes live with a real secret ────────────────────
// A valid signature proves the token was signed with the project's JWT secret. It does NOT prove
// the token was minted for THIS purpose — Supabase signs several kinds with the same secret.
await check('aud "authenticated" is accepted', sign(H, { sub: 'u3', exp: secs + 60, aud: 'authenticated' }), 'u3');
await check('a token minted for another audience is REFUSED', sign(H, { sub: 'u4', exp: secs + 60, aud: 'admin-api' }), null);
await check('an absent aud still works (self-issued sessions)', sign(H, { sub: 'u5', exp: secs + 60 }), 'u5');
await check('alg: none', sign({ alg: 'none', typ: 'JWT' }, { sub: 'u', exp: secs + 60 }), null);
await check('alg confusion (RS256 claimed)', sign({ alg: 'RS256' }, { sub: 'u', exp: secs + 60 }), null);
await check('alg: hs256 lowercase', sign({ alg: 'hs256' }, { sub: 'u', exp: secs + 60 }), null);
await check('EXPIRED', sign(H, { sub: 'u', exp: secs - 1 }), null);
await check('exp exactly now (not in the future)', sign(H, { sub: 'u', exp: secs }), null);
await check('NO exp — a permanent credential is not a session', sign(H, { sub: 'u' }), null);
await check('nbf in the future', sign(H, { sub: 'u', exp: secs + 600, nbf: secs + 300 }), null);
await check('no sub', sign(H, { exp: secs + 60 }), null);
await check('empty sub', sign(H, { sub: '', exp: secs + 60 }), null);
await check('non-string sub', sign(H, { sub: 42, exp: secs + 60 }), null);
await check('over-length sub (map-key amplifier)', sign(H, { sub: 'x'.repeat(65), exp: secs + 60 }), null);
await check('tampered payload keeps old signature', (async () => {
  const t = await sign(H, { sub: 'nobody', exp: secs + 60 });
  const [h, , s] = t.split('.');
  const evil = b64(enc.encode(JSON.stringify({ sub: 'admin', exp: secs + 60 })));
  return `${h}.${evil}.${s}`;
})(), null);
await check('not a JWT', Promise.resolve('garbage'), null);
await check('two segments', Promise.resolve('a.b'), null);
await check('empty string', Promise.resolve(''), null);

console.log('\n FAILS CLOSED with no secret configured');
await check('no secret => nobody is anybody', sign(H, { sub: 'u', exp: secs + 60 }), null, '');

console.log('\n bearer() header parsing');
const hdr = (v) => bearer(new Request('https://x.test', { headers: v ? { Authorization: v } : {} }));
const bcheck = (name, got, want) => {
  const ok = got === want;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}`);
  if (!ok) fail.push(`${name}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`);
};
bcheck('Bearer abc', hdr('Bearer abc'), 'abc');
bcheck('case-insensitive scheme', hdr('bearer abc'), 'abc');
bcheck('extra whitespace trimmed', hdr('Bearer   abc  '), 'abc');
bcheck('wrong scheme refused', hdr('Basic abc'), null);
bcheck('absent header', hdr(null), null);

if (fail.length > 0) {
  console.log('\nFAILED\n');
  for (const f of fail) console.log(`  ${f}`);
  console.log('\nFix src/app/api/_identity.ts. Every case here is a request being BELIEVED —');
  console.log('there is no safe direction to relax one.\n');
  process.exit(1);
}

console.log('\nPASS — only a correctly signed, unexpired, subject-bearing token becomes an identity.\n');
