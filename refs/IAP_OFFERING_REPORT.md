# RevenueCat: current offering has no packages

Found 2026-08-19 while driving lessons for the animation audit. **Not fixed** — the fix is in
the RevenueCat and App Store Connect dashboards, which I do not have access to.

## What is happening

Every launch of the dev build logs:

```
[iap] configured but the current offering has NO packages. Check that
euphoria_pro_monthly and euphoria_pro_yearly exist in App Store Connect and are
attached to the current offering in RevenueCat.
```

Emitted by `src/lib/purchases.ts:270`, inside an `if (__DEV__)` block. `getPackages()` returned
an empty array, meaning `Purchases.getOfferings()` resolved but the **current offering has no
packages attached**.

`EXPO_PUBLIC_REVENUECAT_IOS_KEY` **is** set — the `IAP_ENABLED` branch was taken. So this is not
a missing key. The SDK is configured and talking to RevenueCat; the offering it gets back is
empty.

## Why it matters

With no packages, `findPackage` resolves nothing and the paywall correctly falls back to *"That
plan is not available from the App Store right now."* **The app cannot sell anything.** For a
build carrying a 3-day trial and a Pro tier, that is the most commercially serious thing found
today — more so than any animation defect.

The diagnostic itself is good engineering and is doing its job. `purchases.ts:255-262` states
why it exists:

> A misconfigured build does not throw — it just never unlocks anything, which looks identical to
> "nobody has subscribed yet".

Worth keeping exactly as it is.

## Scope — read this before panicking

The warning is inside `if (__DEV__)`, so it **does not appear in production builds**. What is
unknown is whether the *offering* is empty only in the environment this dev build points at, or
in the live project too. The log proves the former; it says nothing about the latter. Checking
production is a dashboard question.

## One thing that is wrong in the message itself

The warning tells you to check that `euphoria_pro_monthly` and `euphoria_pro_yearly` exist. But
`purchases.ts:36-44` documents that those product ids are **not what the code matches on**:

> THEY ARE NOT WHAT WE MATCH ON — see `findPackage`. Found by wiring the live dashboard: the
> RevenueCat project's Test Store products are `monthly` / `yearly` / `lifetime`, so a lookup
> keyed on the App Store product id found nothing […] Product ids differ per store; PACKAGE ids
> do not.

So the message sends you to verify product ids while the resolution path uses **package** ids.
Someone following the advice literally could confirm both products exist, change nothing, and
still have an empty offering. The message should name the packages.

## What to check, in order

1. **RevenueCat → Offerings.** Is there a **current** offering? An offering can exist without
   being marked current, which produces exactly this symptom.
2. **That offering's packages.** Are `monthly` / `yearly` attached? Package identifiers are what
   `findPackage` resolves on.
3. **Each package's product.** Is a store product attached per package, for the store this build
   targets (Test Store vs App Store)?
4. **App Store Connect.** Do `euphoria_pro_monthly` / `euphoria_pro_yearly` exist and are they in
   a state that permits fetching (not "Missing Metadata")?
5. **Key/environment match.** Confirm `EXPO_PUBLIC_REVENUECAT_IOS_KEY` belongs to the same
   RevenueCat project whose offering you just edited.

## Side effect on tooling, already worked around

The LogBox banner this warning raises sits at y≈800–822 and **overlaps the `Continue` button** at
y=760–816, so it swallows taps and lesson steps silently fail to advance. It stalled the audit's
lesson driver twice before being diagnosed. `scripts/anim/drive.py` now dismisses it as a standard
step — but that is a workaround in test tooling for a real product misconfiguration, and it should
not be read as the issue being handled.

---

## CORRECTION, 2026-08-20 — this is probably NOT a dashboard problem

Found via the running app's console (metro-mcp), not by reading source. RevenueCat's own error is
more specific than the summary above:

> None of the products registered in the RevenueCat dashboard could be fetched from App Store
> Connect **(or the StoreKit Configuration file if one is being used)**

That parenthetical matters, because on a **simulator** products resolve from a local StoreKit
configuration file, not from App Store Connect.

**`Configuration.storekit` EXISTS at the project root**, and it contains exactly the two products
the app looks for:

| product | price | type |
|---|---|---|
| `euphoria_pro_monthly` | 9.99 | RecurringSubscription |
| `euphoria_pro_yearly` | 79.99 | RecurringSubscription |

So the products are not missing. **No scheme references that file** —
`ios/euphorianative.xcodeproj/xcshareddata/xcschemes/euphorianative.xcscheme` has a `LaunchAction`
with no `StoreKitConfigurationFileReference`.

### Two things that make this harder than it looks, both worth knowing before anyone tries

1. **`ios/` is gitignored** (`.gitignore:42`) and regenerated by `expo prebuild`. Editing the
   scheme by hand works until the next prebuild and then silently disappears. A durable fix is an
   Expo config plugin that injects the reference at prebuild time.

2. **A scheme's StoreKit configuration is applied by Xcode's Run action.** This dev client is
   launched with `xcrun simctl launch`, which does not go through that path, so the setting may
   not take effect at all on the launch route this audit uses. **UNVERIFIED** — stated as the next
   thing to test, not as a conclusion.

### What this changes

The original report said the fix lives in the RevenueCat and App Store Connect dashboards, which
nobody working in this repo can reach. That may still be true for a real device or TestFlight
build, but it is **not established** for the simulator symptom that was actually observed — and
the local StoreKit file with correct product ids is evidence against it.

**Next step, cheapest first:** launch the app once from Xcode with the StoreKit configuration
selected in the scheme, and read the console again. If offerings populate, this is a local launch
configuration issue and a config plugin closes it. If they stay empty, the dashboard theory
survives and the original report stands.
