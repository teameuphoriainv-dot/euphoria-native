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
  ['Supabase receives access_token when present', /access_token:\s*accessToken/.test(auth)],
  ['Auth screen forwards the paired provider token', /identity\.idToken,\s*identity\.accessToken/.test(screen)],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [label, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
if (failed.length) process.exit(1);
