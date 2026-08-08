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

/** The RevenueCat ENTITLEMENT identifier — not a product id. One entitlement ("pro") is unlocked by
 *  either product, so the app never has to ask which SKU someone bought. Must match the dashboard
 *  exactly; a typo here reads as "the purchase succeeded but nothing unlocked". */
export const ENTITLEMENT_ID = 'pro';

const KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';

/**
 * EXPO_PUBLIC_ is correct here and is not an oversight. A RevenueCat SDK key is a PUBLIC client
 * key, like the Supabase anon key and unlike GEMINI_API_KEY — it identifies the app, it does not
 * authorise anything a receipt would not already prove.
 */
export const IAP_ENABLED = KEY.length > 0;

/** Why a purchase surface cannot sell right now. Rendered verbatim on the paywall, so it must read
 *  as an explanation to a person and not as a developer note. */
export const IAP_DISABLED_REASON = 'Purchases aren’t switched on in this build yet.';

export type PurchaseResult =
  | { ok: true; isPro: boolean }
  | { ok: false; kind: 'cancelled' }
  | { ok: false; kind: 'not-configured' }
  | { ok: false; kind: 'error'; message: string };

let configured = false;

/** Idempotent. Safe to call from several screens; only the first call reaches the SDK. */
export function configurePurchases(): boolean {
  if (!IAP_ENABLED || configured) return configured;
  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
  Purchases.configure({ apiKey: KEY });
  configured = true;
  // Anonymous app-user-id by default, which is §9.9's upgrade step 1: the entitlement survives a
  // reinstall on the same Apple ID, where `activeDays` in AsyncStorage does not.
  Purchases.addCustomerInfoUpdateListener(adoptCustomerInfo);
  return true;
}

/** True when RevenueCat says the "pro" entitlement is active. The one place that reads it. */
function isProFrom(info: CustomerInfo): boolean {
  return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
}

/**
 * Write RevenueCat's answer into the store. Called from the update listener and after any purchase
 * or restore — never from an error path, per the offline rule in the docblock.
 */
function adoptCustomerInfo(info: CustomerInfo): boolean {
  const pro = isProFrom(info);
  const s = useApp.getState();
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
    const err = e as { userCancelled?: boolean; message?: string };
    if (err.userCancelled) return { ok: false, kind: 'cancelled' };
    return { ok: false, kind: 'error', message: err.message ?? 'Purchase failed' };
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
    return { ok: false, kind: 'error', message: (e as { message?: string }).message ?? 'Restore failed' };
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
