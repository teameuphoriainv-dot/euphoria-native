/**
 * 17e — whether a member in billing retry still has access. ONE rule.
 *
 * WHY IT MOVED HERE. `billing-retry-regression.mjs` opened with a confession:
 *
 *   "re-implements the rule rather than importing it, because the source is TypeScript inside an
 *    Expo app"
 *
 * So the script that exists to stop this rule regressing was testing a SECOND COPY of it. The two
 * happened to agree — both said 16 days, checked 2026-08-13 — but agreement today is not the
 * property anyone wanted; the property wanted is that they cannot disagree tomorrow. `cost-basis.ts`
 * was extracted for exactly this reason after its copy drifted and the same fix had to be applied
 * twice.
 *
 * WHAT IS AT STAKE. 20-40% of subscription churn is failed payments, not intent. Slamming the hard
 * wall on somebody mid-retry converts a recoverable card decline into a real, permanent loss —
 * a customer who WANTED to keep paying and was told to go away.
 *
 * KEEP THIS FILE ERASABLE-SYNTAX-ONLY. The regression imports it under Node, which strips types
 * rather than compiling them. `import type` is erased, so the RevenueCat shape below costs nothing
 * at runtime.
 */

/**
 * The RevenueCat ENTITLEMENT identifier — not a product id, and NOT the internal `Tier` union in
 * entitlement.ts, which also has a member spelled 'pro'. One entitlement is unlocked by either
 * product, so the app never has to ask which SKU someone bought.
 *
 * READ FROM THE DASHBOARD, 2026-08-24. Project 320845df, entitlement entl79bcb589c6:
 *   Identifier    Euphoria Pro
 *   Display Name  Euphoria Pro
 *
 * THIS SAID 'pro' AND THE DASHBOARD NEVER DID. Both the client (purchases.ts) and the server
 * (_entitlement.ts) look the entitlement up by this exact string, so `entitlements.active[...]`
 * was permanently undefined: the purchase completes, Apple charges, and nothing unlocks. It never
 * burned a customer only because the dashboard shows zero purchases have ever been made.
 *
 * Change this and the dashboard together, never one alone. entitlement-id-pin.mjs holds the line.
 */
export const ENTITLEMENT_ID = 'Euphoria Pro';

/** The shape this rule needs. Structural, so the regression can hand it a plain object. */
export type EntitlementLike = {
  billingIssueDetectedAt?: string | number | null;
  expirationDate?: string | null;
};

export type CustomerInfoLike = {
  entitlements: {
    active: Record<string, EntitlementLike | undefined>;
    all: Record<string, EntitlementLike | undefined>;
  };
};

export type ProState = { pro: boolean; billingIssue: boolean };

/**
 * Days past expiry we keep access open while Apple is still retrying the card.
 *
 * UNIT 17e. Somewhere between a fifth and two fifths of subscription churn is a FAILED PAYMENT, not
 * a decision to leave — an expired card, a bank decline, a changed billing address. Apple retries
 * for up to 60 days, and RevenueCat reports that state as `billingIssueDetectedAt`.
 *
 * The default behaviour is the damaging one: the entitlement drops out of `active`, this app's wall
 * is HARD, and a member who never chose to leave loses every lesson mid-retry. That reliably
 * converts a recoverable decline into a real cancellation, because the experience of being locked
 * out is what makes someone stop trying to fix it.
 *
 * 16 days rather than Apple's full 60: long enough to cover the common "card expired, new one
 * arrives in the post" case, short enough that a genuinely dead subscription does not read as free
 * access for two months. It is a REVENUE trade and this number is where to argue with it.
 *

 * PINNED BY scripts/billing-retry-regression.mjs. Change this rule and run it.
 *
 * NOTE this is not the same thing as an App Store billing grace period. With grace period enabled
 * in App Store Connect, RevenueCat already reports the user as active and this code never fires.
 * This covers retry WITHOUT grace period, which is the case that silently loses people.
 */
export const BILLING_RETRY_GRACE_DAYS = 16;
const DAY = 86_400_000;

/**
 * Reads `entitlements.all`, NOT just `.active` — a member in billing retry has no active
 * entitlement, which is precisely why the naive check loses them.
 *
 * `now` is injectable so the regression can pin the day-15/day-17 boundary without sleeping.
 */
/**
 * THE ONE GRACE RULE, extracted so the server can share it instead of restating it.
 *
 * `_entitlement.ts` used to carry a comment saying it deliberately did NOT re-implement this, and
 * that "a member mid-retry may therefore be refused by this check while the client still grants
 * them access... the fix is to share one rule, not two". This is that fix. Refusing to duplicate
 * the rule was right; leaving the server without it was the part still outstanding.
 *
 * Takes primitives rather than a CustomerInfo, because the two callers see different shapes: the
 * client has the RevenueCat SDK object, the server has the REST subscriber JSON. The RULE is the
 * same and only the plumbing differs, which is exactly what belongs in a shared function.
 *
 * Returns false for an unparseable expiry: an unreadable date is not a licence.
 */
export function withinRetryGrace(
  expiresAtMs: number,
  hasBillingIssue: boolean,
  now: number = Date.now(),
): boolean {
  if (!hasBillingIssue) return false;
  if (!Number.isFinite(expiresAtMs)) return false;
  return now - expiresAtMs < BILLING_RETRY_GRACE_DAYS * DAY;
}

export function proStateFrom(info: CustomerInfoLike, now: number = Date.now()): ProState {
  const active = info.entitlements.active[ENTITLEMENT_ID];
  if (active) return { pro: true, billingIssue: active.billingIssueDetectedAt != null };

  const known = info.entitlements.all[ENTITLEMENT_ID];
  // No billing issue means an ordinary lapse — cancelled, or never bought. Nothing to rescue, and
  // extending access would just be giving the product away.
  if (!known?.billingIssueDetectedAt) return { pro: false, billingIssue: false };

  const expiredAt = known.expirationDate ? Date.parse(known.expirationDate) : NaN;
  // An unparseable date is not a licence. Flag the issue, withhold access.
  if (!Number.isFinite(expiredAt)) return { pro: false, billingIssue: true };

  return { pro: withinRetryGrace(expiredAt, true, now), billingIssue: true };
}
