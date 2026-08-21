# Sign in with Apple — triage of Apple's 2.1(a) bug #2

> "We were unable to complete signing up with Apple due to an error."
> — App Review, Apr 9 2026, iPhone 17 Pro Max, iOS 26.4, build 1.0.0(6)

## VERIFIED — these are not the cause

| Check | Result |
|---|---|
| Feature implemented at all | Yes. `src/lib/social-auth.ts:86` `signInWithApple()`, called from `src/app/auth.tsx:107` |
| Package present | `expo-apple-authentication ~57.0.1` in `package.json`, registered as a plugin in `app.json` |
| Entitlement in the built app | **Present.** `ios/euphorianative/euphorianative.entitlements` contains `com.apple.developer.applesignin: [Default]` — added automatically by the config plugin |
| Team id | `9SS423KXF5` in `app.json` matches the portal team (RAMYA SMITHA CHILAMANTULA) |
| Bundle id | `com.euphoriainv.euphoria`, one App ID on the portal, Xcode-managed ("XC com euphoriainv euphoria") |
| Cancel handling | Correct. `ERR_REQUEST_CANCELED` returns `null` rather than throwing (`isAppleCancel`, social-auth.ts:71) |
| Name/email nulls | Correctly handled. Apple returns these once ever; the code joins only present parts and tolerates nulls |

`ios.usesAppleSignIn` is **absent** from `app.json`, which is the documented way
to request this entitlement — but the `expo-apple-authentication` plugin adds it
regardless, and the generated entitlements file proves it landed. Not a defect;
noted only because a future plugin change would silently remove the safety net.

## NOT VERIFIED — the leading remaining hypothesis

**Is "Sign In with Apple" enabled as a capability on the App ID itself?**

An entitlement present in the binary still fails at runtime if the App ID on the
developer portal does not carry the matching capability — `signInAsync` then
throws a generic authorization error, which is exactly what a reviewer would
describe as "an error".

I could not read the capability list. The Identifiers table row for
`com.euphoriainv.euphoria` is not a link and did not navigate on click across two
attempts; I stopped rather than keep hammering it.

**How to check, 30 seconds:** developer.apple.com -> Certificates, Identifiers &
Profiles -> Identifiers -> `com.euphoriainv.euphoria` -> scroll the Capabilities
list -> confirm **Sign In with Apple** is ticked. If it is not, tick it, save,
and rebuild — that is the whole fix.

## Second hypothesis, cheaper to rule out than to prove

The **Apple Developer Program License Agreement is currently unaccepted** (see
`refs/IAP_OFFERING_REPORT.md` — the Paid Apps Agreement is "Pending User Info"
and one of its three outstanding items is the updated PLA). Apple gates account
services on agreement state. It is plausible, though I have found no Apple
documentation stating that an unaccepted PLA breaks Sign in with Apple
specifically, so I am recording this as a hypothesis and not a finding.

Since accepting the PLA is required anyway for the IAP blocker, doing it first
costs nothing and may resolve this for free.

## What I deliberately did NOT conclude

That the bug is fixed, or that it still reproduces. The reviewed build is
1.0.0(6) from four months ago. I have not run Sign in with Apple on a device or
simulator, and the simulator would need an iCloud account signed in to be a
meaningful test.
