/**
 * entitlement-id-pin — the RevenueCat entitlement identifier must match the dashboard exactly.
 *
 * MEASURED 2026-08-24, RevenueCat project 320845df, entitlement entl79bcb589c6:
 *
 *     Identifier      Euphoria Pro
 *     Display Name    Euphoria Pro
 *     Products        euphoria_pro_monthly, euphoria_pro_yearly (App Store) + monthly, yearly (Test Store)
 *
 * The constant said 'pro' for four months. Client and server both index
 * `entitlements.active[ENTITLEMENT_ID]`, so the lookup was permanently undefined and a completed
 * purchase would have unlocked nothing. Nobody had bought yet, which is the only reason it cost
 * nothing. THIS IS THE THIRD MONEY-PATH BUG OF THIS EXACT SHAPE IN THIS APP: one value, two
 * places, drifted.
 *
 * A pin cannot call RevenueCat, so it pins the value a human READ off the dashboard. If you change
 * either side, change both and update the date above.
 */
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

/** Verbatim from the dashboard on the date above. */
const DASHBOARD_IDENTIFIER = 'Euphoria Pro';

const src = readFileSync(new URL('../src/lib/billing-retry.ts', import.meta.url), 'utf8')
  // Strip comments first: this file DOCUMENTS the old value, and a naive match would read its own
  // changelog and pass. reduced_motion_audit.py shipped exactly that bug.
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[^\n]*\/\/[^\n]*$/gm, '');

const m = src.match(/export const ENTITLEMENT_ID = '([^']*)';/);
assert.ok(m, 'ENTITLEMENT_ID is not declared as a single-quoted string literal in billing-retry.ts');
assert.strictEqual(
  m[1],
  DASHBOARD_IDENTIFIER,
  `ENTITLEMENT_ID is '${m[1]}' but the RevenueCat dashboard says '${DASHBOARD_IDENTIFIER}'. ` +
    'A mismatch means every purchase completes and unlocks nothing.',
);

// It must be re-exported, never re-declared: a second literal is how it drifted the first time.
const server = readFileSync(new URL('../src/lib/server/entitlement.ts', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[^\n]*\/\/[^\n]*$/gm, '');
assert.ok(
  !/const ENTITLEMENT_ID\s*=/.test(server),
  '_entitlement.ts re-declares ENTITLEMENT_ID instead of importing the shared one',
);
assert.match(server, /ENTITLEMENT_ID/, '_entitlement.ts no longer references the shared constant');

console.log(`entitlement-id-pin ok — ENTITLEMENT_ID is '${DASHBOARD_IDENTIFIER}', matching the dashboard, and stated once`);
