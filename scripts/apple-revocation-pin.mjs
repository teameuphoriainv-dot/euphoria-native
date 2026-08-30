#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const social = readFileSync('src/lib/social-auth.ts', 'utf8');
const auth = readFileSync('src/lib/auth.ts', 'utf8');
const screen = readFileSync('src/app/auth.tsx', 'utf8');
const settings = readFileSync('src/app/settings/[section].tsx', 'utf8');
const fail = [];

if (!/authorizationCode:\s*credential\.authorizationCode\s*\?\?\s*null/.test(social))
  fail.push('Apple authorizationCode is not captured from the native credential.');
if (!/functions\.invoke\(['"]apple-auth-token['"][\s\S]*?action:\s*['"]exchange['"]/.test(auth))
  fail.push('Apple authorization code is not exchanged by the authenticated Edge Function.');
if (!/await registerAppleAuthorizationCode\(identity\.authorizationCode\)/.test(screen))
  fail.push('The short-lived Apple code is not handed to the server before navigation.');
if (!/functions\.invoke\(['"]apple-auth-token['"][\s\S]*?action:\s*['"]revoke['"]/.test(auth))
  fail.push('Account deletion does not request automatic Apple token revocation.');
if (!/deleteServerAccount\(\{\s*revokeApple:\s*usedApple\s*\}\)/.test(settings))
  fail.push('The deletion UI does not identify Apple accounts for revocation.');
if (!/usedApple\s*&&\s*server\.appleRevoked\s*!==\s*true/.test(settings))
  fail.push('Manual Apple guidance must remain when automatic revocation is unavailable.');

if (fail.length) {
  console.error('[apple-revocation-pin] failed');
  fail.forEach((message) => console.error(`  ${message}`));
  process.exit(1);
}
console.log('[apple-revocation-pin] ok');
