#!/usr/bin/env node

/** Static contract for the native Google -> Supabase token exchange. */
import fs from 'node:fs';

const social = fs.readFileSync(new URL('../src/lib/social-auth.ts', import.meta.url), 'utf8');
const auth = fs.readFileSync(new URL('../src/lib/auth.ts', import.meta.url), 'utf8');
const screen = fs.readFileSync(new URL('../src/app/auth.tsx', import.meta.url), 'utf8');

const checks = [
  ['Google retrieves its paired access token', /GoogleSignin\.getTokens\(\)/.test(social)],
  ['Google identity retains the access token', /accessToken:\s*tokens\.accessToken/.test(social)],
  ['Apple identity explicitly has no Google access token', /accessToken:\s*null/.test(social)],
  ['Supabase exchange accepts an optional access token', /accessToken\?:\s*string\s*\|\s*null/.test(auth)],
  /*
   * ACCESS TOKEN IS APPLE-ONLY. This assertion used to read /access_token:\s*accessToken/, which is
   * a substring of the guarded expression and therefore still matched after the Google path was
   * removed on 2026-09-05 — it passed while the behaviour it named had changed underneath it. The
   * predicate has to name the CONDITION, not a fragment that survives either way.
   */
  ['Google is excluded from the access_token exchange', /provider\s*!==\s*'google'\s*\?\s*\{\s*access_token/.test(auth)],
  ['Apple still sends its access token', /access_token:\s*accessToken/.test(auth)],
  /* Supabase validates the id token's `aud` against webClientId. Without this the SDK mints a token
   * for the iOS client and sign-in fails server-side with an unhelpful verification error. */
  ['Google is configured with the web client id', /webClientId:\s*GOOGLE_WEB_CLIENT_ID/.test(social)],
  ['Auth screen forwards the paired provider token', /identity\.idToken,\s*identity\.accessToken/.test(screen)],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [label, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
if (failed.length) process.exit(1);
