/**
 * RevenueCat — the ONLY thing in this app that may set `isPro` to true on the strength of money.
 *
 * WHY REVENUECAT AND NOT RAW STOREKIT: receipt validation, cross-platform entitlements, restore, and
 * subscription state changes. Those four are precisely where a hand-rolled StoreKit integration
 * leaks revenue and generates support load, and none of them is a place to be clever.
 *
 * ── THE DIVISION OF AUTHORITY, and it matters ─────────────────────────────────────────────────
 * `store.isPro` stays the value the whole app reads (`tier()` in lib/entitlement.ts asks it and
 * nothing else). This module is the only writer. So the entitlement engine did not have to change
 * shape to accept real money — which was the entire point of building it as one authority in Unit 3.
 *
 * ── THE OFFLINE RULE, which is a correctness rule not a nicety ────────────────────────────────
 * `isPro` is only ever written from a SUCCESSFUL customerInfo read. A network failure must never
 * flip it false: doing so revokes a paying member's access the moment their train enters a tunnel,
 * and it is indistinguishable from a real lapse in the logs. Persisted `isPro` is the cached read,
 * exactly as §9.8 specifies, and a failure leaves the cache alone.
 *
 * ── THE HONEST CEILING ────────────────────────────────────────────────────────────────────────
 * Without EXPO_PUBLIC_REVENUECAT_IOS_KEY this module configures nothing and every function returns
 * a "not configured" result. The paywall then renders its purchase control DISABLED WITH ITS REASON
 * ON SCREEN, the same pattern the options preview cap uses (§0.5) — a control that explains itself
 * is not a dead control.
 *
 * StoreKit ALSO does not transact in the iOS Simulator without a local Configuration.storekit file,
 * and even with one that validates the UI FLOW ONLY, never real billing. Say that plainly; never
 * imply a simulator run proves purchasing works.
 */
import * as Linking from 'expo-linking';
import Purchases, { LOG_LEVEL, type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';

import { Ev, track } from './analytics';
import { onAuthUserChange } from './auth';
import { type CustomerInfoLike, ENTITLEMENT_ID, proStateFrom as proStateFromRule } from './billing-retry';
import { useApp } from './store';

/**
 * The App Store product identifiers, for reference and for the __DEV__ diagnostic. These are what
 * must exist in App Store Connect for real billing.
 *
 * THEY ARE NOT WHAT WE MATCH ON — see `findPackage`. Found by wiring the live dashboard: the
 * RevenueCat project's Test Store products are `monthly` / `yearly` / `lifetime`, so a lookup keyed
 * on the App Store product id found nothing and the paywall correctly said "That plan is not
 * available from the App Store right now." Product ids differ per store; PACKAGE ids do not.
 */
export const PRODUCT_MONTHLY = 'euphoria_pro_monthly';
export const PRODUCT_YEARLY = 'euphoria_pro_yearly';

/**
 * Resolve the package for a plan, store-independently.
 *
 * WHY BY PACKAGE AND NOT BY PRODUCT: a package is RevenueCat's own abstraction over "the monthly
 * one", and it is the same identifier whether the products behind it come from the Test Store, the
 * App Store or Play. Keying on the App Store product id worked only in production and failed
 * silently everywhere else — verified live against the Test Store, where the products are named
 * `monthly` and `yearly`.
 *
 * Still NEVER by array position. RevenueCat returns packages in dashboard order, so `[0]`/`[1]`
 * would silently swap the plans the day someone reorders them — which is a wrong charge, not a
 * cosmetic bug.
 *
 * Accepts RevenueCat's canonical ids (`$rc_monthly`, `$rc_annual`), the plain ones a hand-built
 * offering gets (`monthly`, `yearly`, `annual`), and finally the App Store product id, so this keeps
 * working when a real App Store configuration replaces the Test Store.
 */
export function findPackage(pkgs: PurchasesPackage[], plan: 'monthly' | 'annual'): PurchasesPackage | undefined {
  const wanted = plan === 'annual'
    ? ['$rc_annual', 'annual', 'yearly', PRODUCT_YEARLY]
    : ['$rc_monthly', 'monthly', PRODUCT_MONTHLY];
  const lower = (v: string) => v.toLowerCase();
  return (
    pkgs.find((p) => wanted.map(lower).includes(lower(p.identifier))) ??
    pkgs.find((p) => wanted.map(lower).includes(lower(p.product.identifier)))
  );
}

// Re-exported, not redefined: `lib/billing-retry.ts` owns it so the rule and the id cannot drift
// apart. Existing importers of `ENTITLEMENT_ID` from this module keep working.
export { ENTITLEMENT_ID } from './billing-retry';

/**
 * WHAT THE STORE IS ACTUALLY SELLING, for a plan the user has selected.
 *
 * Every number a paywall shows has to come from StoreKit, and this is the read that gets it. The
 * onboarding paywall used to render a hardcoded `$9.99` / `$79.99` pair and a "3-day free trial"
 * that existed only as a day counter in AsyncStorage. Both were untrue in ways that cost an App
 * Review rejection (2.1(b), build 24): the price was wrong in every storefront but the US, and the
 * trial was not something Apple had ever agreed to grant.
 *
 * `freeTrialDays` is non-null only when Apple will genuinely open the purchase sheet on a free
 * introductory offer, so a caller can key its trial copy on it and be incapable of promising a
 * trial that the sheet then does not honour.
 */
export type PlanOffer = {
  pkg: PurchasesPackage;
  /** The charge, formatted by StoreKit in the viewer's own currency. Never a literal from our source. */
  priceString: string;
  /** Price per month for the same product, so an annual card can show its monthly equivalent honestly. */
  perMonthString: string | null;
  /** The raw amount, for deriving the saving badge from what is really charged. */
  price: number;
  /** Days of FREE introductory offer Apple will grant on this product, or null when it has none. */
  freeTrialDays: number | null;
};

/** Apple states an introductory period as a unit plus a count. Days are the only unit our copy
 *  speaks, so the units are converted once, here, rather than at each call site. */
const DAYS_IN_PERIOD_UNIT: Record<string, number> = { DAY: 1, WEEK: 7, MONTH: 30, YEAR: 365 };

export function readPlanOffer(pkgs: PurchasesPackage[], plan: 'monthly' | 'annual'): PlanOffer | null {
  const pkg = findPackage(pkgs, plan);
  if (!pkg) return null;
  const intro = pkg.product.introPrice;
  const perUnit = DAYS_IN_PERIOD_UNIT[String(intro?.periodUnit ?? '').toUpperCase()];
  /* A free trial is an introductory offer priced at ZERO. A discounted-but-paid intro offer is a
     different product decision and must never be described as free, so it reads as no trial here. */
  const freeTrialDays =
    intro && intro.price === 0 && perUnit
      ? perUnit * intro.periodNumberOfUnits * Math.max(1, intro.cycles)
      : null;
  return {
    pkg,
    priceString: pkg.product.priceString,
    perMonthString: pkg.product.pricePerMonthString,
    price: pkg.product.price,
    freeTrialDays,
  };
}

const KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';

/**
 * EXPO_PUBLIC_ is correct here and is not an oversight. A RevenueCat SDK key is a PUBLIC client
 * key, like the Supabase anon key and unlike GEMINI_API_KEY — it identifies the app, it does not
 * authorise anything a receipt would not already prove.
 */
/**
 * Purchases are live only for a key that is SHAPED like a real one.
 *
 * This was `KEY.length > 0`, and `.env.local` held a 32-character `test_…` placeholder — so the
 * flag read TRUE, `Purchases.configure()` ran with a bogus key, and the paywall rendered a
 * live-looking Buy button whose only possible outcome was failure. A placeholder that satisfies a
 * presence check is worse than an empty string, because an empty string degrades honestly.
 *
 * RevenueCat iOS SDK keys are public and always begin `appl_`. Anything else is not a key we can
 * transact with, and the app should say so rather than pretend.
 */
export const IAP_ENABLED = KEY.startsWith('appl_');

/** Why a purchase surface cannot sell right now. Rendered verbatim on the paywall, so it must read
 *  as an explanation to a person and not as a developer note. */
export const IAP_DISABLED_REASON = 'Purchases aren’t switched on in this build yet.';

export type PurchaseResult =
  | { ok: true; isPro: boolean }
  | { ok: false; kind: 'cancelled' }
  | { ok: false; kind: 'not-configured' }
  | { ok: false; kind: 'error'; code: string };

let configured = false;
let identityBound = false;
let postHogIdentityBound = false;
let revenueCatUserId: string | null = null;
let identitySync: Promise<void> = Promise.resolve();

/**
 * RevenueCat's PostHog integration runs server-to-server, so it cannot read the PostHog client's
 * current distinct id. Give it the same pseudonymous install id explicitly — but only while the
 * person has opted into analytics. Removing the attribute on opt-out is what keeps a dashboard
 * integration from bypassing the consent switch that protects every client-side event.
 *
 * This deliberately does NOT use the Supabase account id. RevenueCat needs that UUID for server
 * entitlement checks; PostHog does not. Purchase events can still join the on-device funnel by the
 * stable install id without turning an analytics profile into an account identity.
 */
function syncRevenueCatPostHogIdentity(): void {
  if (!configured) return;
  const { installId, profile } = useApp.getState();
  void Purchases.setAttributes({
    $posthogUserId: profile.analyticsOptIn ? installId : null,
  }).catch((error: unknown) => {
    if (__DEV__) console.warn('[iap] could not synchronize PostHog analytics identity', error);
  });
}

/**
 * RevenueCat and the server must use the same subscriber key. The API verifies a Supabase token
 * and asks RevenueCat for that UUID, so leaving the SDK anonymous would make every signed-in buyer
 * look unpaid as soon as server enforcement is enabled.
 */
function syncRevenueCatUser(userId: string | null): void {
  if (!configured || userId === revenueCatUserId) return;
  identitySync = identitySync
    .then(async () => {
      if (userId === revenueCatUserId) return;
      if (userId) {
        const { customerInfo } = await Purchases.logIn(userId);
        revenueCatUserId = userId;
        adoptCustomerInfo(customerInfo);
        syncRevenueCatPostHogIdentity();
        return;
      }
      const customerInfo = await Purchases.logOut();
      revenueCatUserId = null;
      adoptCustomerInfo(customerInfo);
      syncRevenueCatPostHogIdentity();
    })
    .catch((error: unknown) => {
      if (__DEV__) console.warn('[iap] could not synchronize account identity', error);
    });
}

/**
 * Idempotent. Safe to call from several screens; only the first call reaches the SDK.
 *
 * IT MUST NOT THROW, and it used to be able to.
 *
 * Every caller invokes this OUTSIDE its own try — `getPackages`, `purchase` and `restore` all open
 * with `if (!configurePurchases())`. So a throw from `Purchases.configure` did not become a caught
 * failure, it rejected the caller's promise. On the paywall that surfaced as the worst possible
 * state: `getPackages()` rejects, neither `offers` nor `offersFailed` is ever set, `offersLoading`
 * stays true, and the CTA is a spinner forever while the line that would explain it is suppressed
 * because it requires `!offersLoading`. A purchase screen whose button does nothing and says
 * nothing is precisely the 2.1(b) finding that got build 24 rejected.
 *
 * Returning false on a throw routes every caller into the path it already has for "cannot sell
 * right now", which is a disabled button WITH a reason rather than a live-looking inert one.
 */
export function configurePurchases(): boolean {
  if (!IAP_ENABLED || configured) return configured;
  try {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
    Purchases.configure({ apiKey: KEY });
  } catch {
    // Leave `configured` false so a later screen can retry rather than inheriting a dead SDK.
    return false;
  }
  configured = true;
  // Anonymous app-user-id by default, which is §9.9's upgrade step 1: the entitlement survives a
  // reinstall on the same Apple ID, where `activeDays` in AsyncStorage does not.
  Purchases.addCustomerInfoUpdateListener(adoptCustomerInfo);
  syncRevenueCatPostHogIdentity();
  if (!postHogIdentityBound) {
    postHogIdentityBound = true;
    let previousConsent = useApp.getState().profile.analyticsOptIn;
    useApp.subscribe((state) => {
      const nextConsent = state.profile.analyticsOptIn;
      if (nextConsent === previousConsent) return;
      previousConsent = nextConsent;
      syncRevenueCatPostHogIdentity();
    });
  }
  if (!identityBound) {
    identityBound = true;
    onAuthUserChange(syncRevenueCatUser);
  }
  return true;
}

/**
 * The 16-day retry window and the rule that uses it now live in `lib/billing-retry.ts`, so the
 * regression can import them instead of restating them — which is what it did, and admitted to in
 * its own header. The reasoning behind the number moved with it.
 */

export type ProState = {
  pro: boolean;
  /** True when Apple is retrying a payment — whether or not access is still open. Drives the copy
   *  that tells the user to fix their card, which is the only thing that actually recovers them. */
  billingIssue: boolean;
};

/**
 * What RevenueCat says, read once. The one place entitlement is interpreted.
 *
 * A thin cast, not a second implementation: `billing-retry.ts` states the rule structurally so a
 * Node regression can hand it a plain object, and this adapts RevenueCat's own `CustomerInfo` to
 * that shape. The rule has one home.
 */
const proStateFrom = (info: CustomerInfo): ProState => proStateFromRule(info as CustomerInfoLike);


/**
 * Write RevenueCat's answer into the store. Called from the update listener and after any purchase
 * or restore — never from an error path, per the offline rule in the docblock.
 */
function adoptCustomerInfo(info: CustomerInfo): boolean {
  const { pro, billingIssue } = proStateFrom(info);
  const s = useApp.getState();
  // 17e: the flag the UI needs to TELL them. Keeping access open silently rescues nothing — the
  // card still has to be fixed, and only the user can do that. Access buys the time; the message
  // is what converts it.
  if (s.billingIssue !== billingIssue) s.setBillingIssue(billingIssue);
  // 17b funnel: the last step. Fires on the FALSE -> TRUE edge only, so a listener that re-delivers
  // the same entitlement (RevenueCat does, on every app foreground) cannot inflate conversions.
  // Losing Pro is not tracked here — that is churn, and RevenueCat's own cohorts measure it far
  // better than a client event can, since the client is usually closed when a renewal fails.
  if (!s.isPro && pro) track(Ev.paid);
  if (s.isPro !== pro) s.setPro(pro);
  return pro;
}

/** The active entitlement's renewal/expiry date, or null. REAL data or nothing — §0.4 forbids
 *  showing a plausible date we do not actually have. */
export async function renewalDate(): Promise<Date | null> {
  if (!IAP_ENABLED) return null;
  try {
    const info = await Purchases.getCustomerInfo();
    const iso = info.entitlements.active[ENTITLEMENT_ID]?.expirationDate;
    return iso ? new Date(iso) : null;
  } catch {
    return null;
  }
}

/** The packages the dashboard is actually offering. Empty means the offering exists but has no
 *  products attached — the silent App Store Connect misconfiguration. */
export async function getPackages(): Promise<PurchasesPackage[]> {
  if (!configurePurchases()) return [];
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages ?? [];
  } catch {
    return [];
  }
}

export async function purchase(pkg: PurchasesPackage): Promise<PurchaseResult> {
  if (!configurePurchases()) return { ok: false, kind: 'not-configured' };
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { ok: true, isPro: adoptCustomerInfo(customerInfo) };
  } catch (e) {
    // A user backing out of the Apple sheet is NOT an error and must never surface as one. Treating
    // it as a failure is how apps end up showing "Something went wrong" to someone who simply
    // changed their mind.
    const err = e as { userCancelled?: boolean; code?: string | number; message?: string };
    if (err.userCancelled) return { ok: false, kind: 'cancelled' };
    /*
     * The CODE, never the SDK's message. UNIT 13 item 4 forbids a raw error string reaching a user,
     * and this one did: `Alert.alert('Purchase failed', r.message)` in onboarding printed whatever
     * RevenueCat happened to throw. Store's own text is written for developers reading a console.
     */
    if (__DEV__ && err.message !== undefined) console.log('[purchase] sdk error:', err.message);
    return { ok: false, kind: 'error', code: String(err.code ?? 'unknown') };
  }
}

/**
 * Restore. An App Store review REQUIREMENT for a subscription app, independent of how many
 * competitors ship it (2/5 in the pull that informed this unit, 2/2 on captured price screens).
 *
 * Reports what it FOUND, so the caller can tell "restored your subscription" from "there was
 * nothing to restore" — two very different messages to receive.
 */
export async function restore(): Promise<PurchaseResult> {
  if (!configurePurchases()) return { ok: false, kind: 'not-configured' };
  try {
    const info = await Purchases.restorePurchases();
    return { ok: true, isPro: adoptCustomerInfo(info) };
  } catch (e) {
    const err = e as { code?: string | number; message?: string };
    if (__DEV__ && err.message !== undefined) console.log('[restore] sdk error:', err.message);
    return { ok: false, kind: 'error', code: String(err.code ?? 'unknown') };
  }
}

/**
 * Refresh from RevenueCat at launch, so a subscription cancelled or expired on another device is
 * reflected here. Deliberately swallows failure: see the offline rule — a failed refresh leaves the
 * cached `isPro` exactly as it was.
 */
export async function refreshEntitlement(): Promise<void> {
  if (!configurePurchases()) return;
  try {
    adoptCustomerInfo(await Purchases.getCustomerInfo());
  } catch {
    /* keep the cache. */
  }
}

/**
 * Manage subscription — 3/5 convergence (Elevate, Duolingo, Quizlet). Quizlet names the action
 * "Cancel on App Store" and hands off rather than pretending to cancel in-app, which is the only
 * honest option: an app cannot cancel an Apple subscription itself.
 */
export function openManageSubscriptions(): void {
  void Linking.openURL('https://apps.apple.com/account/subscriptions');
}

if (__DEV__) {
  /*
   * ONE runnable check, on the money path, and it asserts the thing that is silent when wrong.
   *
   * A misconfigured build does not throw — it just never unlocks anything, which looks identical to
   * "nobody has subscribed yet". So report the configuration state out loud rather than letting a
   * missing key look like an empty customer base.
   */
  if (!IAP_ENABLED) {
    console.log('[iap] EXPO_PUBLIC_REVENUECAT_IOS_KEY absent — purchases disabled, reason shown on screen');
  } else {
    void (async () => {
      const pkgs = await getPackages();
      if (pkgs.length === 0) {
        console.error(
          '[iap] configured but the current offering has NO packages. Check that ' +
            `${PRODUCT_MONTHLY} and ${PRODUCT_YEARLY} exist in App Store Connect and are attached ` +
            'to the current offering in RevenueCat.',
        );
      } else {
        console.log(`[iap] ${String(pkgs.length)} package(s): ${pkgs.map((p) => p.identifier).join(', ')}`);
      }
    })();
  }
}

/**
 * Purchase failures, in Euphoria's voice. Deliberately the same shape as `chatErrorMessage` in
 * lib/atlas-chat.ts — §13 item 4 names that as the pattern, and having two ways to phrase a failure
 * is how an app ends up sounding like two apps.
 *
 * The SDK's own message is logged in dev and never shown: it is written for a developer reading a
 * console, and a user who has just tried to pay deserves a sentence about what to do next.
 */
export function purchaseErrorMessage(code: string): string {
  switch (code) {
    case 'NetworkError':
    case '10':
      return 'I could not reach the App Store just then. Check your connection and try again.';
    case 'PaymentPendingError':
    case '17':
      return 'The App Store is still processing that. It may complete on its own shortly.';
    case 'ProductNotAvailableForPurchaseError':
    case '23':
      return 'That plan is not available on this account right now.';
    case 'PurchaseNotAllowedError':
    case '3':
      return 'This device does not allow purchases. Check Screen Time restrictions in Settings.';
    case 'StoreProblemError':
    case '2':
      return 'The App Store had a problem with that. Nothing was charged. Try again in a moment.';
    default:
      return 'That did not go through, and nothing was charged. Try again in a moment.';
  }
}
