#!/usr/bin/env node
/** Keep the client and server on one RevenueCat subscriber identity. */
import { readFileSync } from 'node:fs';

const fail = (message) => {
  console.error(`[billing-identity-pin] ${message}`);
  process.exit(1);
};

const purchases = readFileSync(new URL('../src/lib/purchases.ts', import.meta.url), 'utf8');
const auth = readFileSync(new URL('../src/lib/auth.ts', import.meta.url), 'utf8');
const entitlement = readFileSync(new URL('../src/app/api/_entitlement.ts', import.meta.url), 'utf8');
const app = JSON.parse(readFileSync(new URL('../app.json', import.meta.url), 'utf8'));

if (!/import\s+\{\s*onAuthUserChange\s*\}\s+from\s+['"]\.\/auth['"]/.test(purchases)) {
  fail('purchases.ts must subscribe to verified Supabase user changes.');
}
if (!/onAuthUserChange\(syncRevenueCatUser\)/.test(purchases)) {
  fail('RevenueCat identity synchronization must be bound during configuration.');
}
if (!/Purchases\.logIn\(userId\)/.test(purchases) || !/Purchases\.logOut\(\)/.test(purchases)) {
  fail('RevenueCat must log in and log out with the Supabase account lifecycle.');
}
if (!/\$posthogUserId:\s*profile\.analyticsOptIn\s*\?\s*installId\s*:\s*null/.test(purchases)) {
  fail('RevenueCat/PostHog identity must use the pseudonymous install id and honor analytics consent.');
}
if (!/useApp\.subscribe\(\(state\)/.test(purchases)) {
  fail('RevenueCat/PostHog identity must follow analytics-consent changes after SDK configuration.');
}
if (!/encodeURIComponent\(subject\)/.test(entitlement)) {
  fail('server entitlement lookup must continue using the verified subject.');
}
if (!/AppState\.addEventListener\(['"]change['"]/.test(auth)) {
  fail('native Supabase token refresh must follow foreground/background state.');
}

const collected = app.expo?.ios?.privacyManifests?.NSPrivacyCollectedDataTypes ?? [];
const purchaseHistory = collected.find(
  (item) => item.NSPrivacyCollectedDataType === 'NSPrivacyCollectedDataTypePurchaseHistory',
);
if (purchaseHistory?.NSPrivacyCollectedDataTypeLinked !== true) {
  fail('Purchase History must be declared linked after RevenueCat adopts the account user ID.');
}

console.log('[billing-identity-pin] client/server RevenueCat identity is synchronized.');
