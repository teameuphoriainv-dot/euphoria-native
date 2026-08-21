# TestFlight plan — 2026-08-21

Goal: the app installable on a phone via TestFlight, with RevenueCat, ASC and PostHog verified.

## Status of what is already configured

| item | state |
|---|---|
| EAS account | ✅ logged in as `s-k-28` |
| EAS project id | ✅ `8a6dba4a-e52a-4c04-b359-7244670431b1` |
| build profile `production` | ✅ autoIncrement, `EXPO_PUBLIC_API_URL` set |
| submit profile `production` | ✅ appleId, ascAppId `6761808087`, teamId `9SS423KXF5` |
| bundle id | ✅ `com.euphoriainv.euphoria` |
| PostHog | ✅ key on EAS, wired in `src/lib/analytics.ts` |
| Polygon / AlphaVantage / Gemini / MarketData | ✅ keys on EAS |

## BLOCKER — two keys exist locally but NOT on EAS

A production build reads EAS environment variables, not `.env.local`. Missing:

- **`EXPO_PUBLIC_REVENUECAT_IOS_KEY`** — without it the paywall cannot sell anything
- **`EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`** — without it Google sign-in fails

## The steps

1. **Push the two missing keys to EAS production.** One command each; values never printed.
2. **Verify the RevenueCat offering has packages.** Known issue: `refs/IAP_OFFERING_REPORT.md`
   records an empty offering. On a real device (not the simulator) products come from App Store
   Connect rather than a StoreKit file, so this may behave differently — worth checking on the
   TestFlight build rather than assuming either way.
3. **Confirm ASC app state.** App id `6761808087` exists; needs a version ready to receive a build
   and no blocking agreements.
4. **`eas build --platform ios --profile production`** — roughly 15–25 minutes on EAS servers.
5. **`eas submit --platform ios --profile production`** — a couple of minutes, then Apple
   processing, typically 5–15 more.
6. **Install on the phone** via TestFlight and verify: prices are live, logos render, paywall shows
   real products, PostHog receives events.

## Honest timeline

**Not instant.** Build 15–25 min, submit + Apple processing 10–20 min. Realistically
**35–50 minutes** from starting the build to it appearing in TestFlight, and none of that is
something I can speed up — it is EAS queue time and Apple's processing.

## What I cannot do myself

- Enter credentials or accept App Store agreements — those need you.
- Anything in the ASC or RevenueCat dashboards that changes settings needs your go-ahead per action.

---

## Verified in the browser, 2026-08-21 ~09:15

### RevenueCat ✅ correctly configured — and my first theory was wrong

There are FOUR projects, two named identically "Euphoria", plus "Euphoria App" and "Euphoria Real".
That looked like an obvious key/project mismatch, so I tested it rather than assuming: the console
gave the SDK's anonymous customer id, and searching each project for it found the app talks to
**`320845df` ("Euphoria")** — not found in the other three.

That project is **correctly set up**: `default` offering, Active, **2 packages**. The `$rc_monthly`
package carries BOTH a RevenueCat Test Store product (`monthly`) and the App Store product
(`euphoria_pro_monthly`).

**So the dashboard is not the problem.** The SDK drops packages whose store product it cannot
fetch, which on a simulator it cannot — exactly as its own error says. This supersedes the original
`IAP_OFFERING_REPORT.md` conclusion, and it means **TestFlight on a real device is the correct test**.

### PostHog ✅ working

Project `557266`. Events arriving from `posthog-react-native`, including the app's own custom
instrumentation — `day_return`, `first_action_skipped`, `trial_reward_dismissed`. Most recent event
9 hours old; nothing during the overnight automation, plausibly SDK batching or the dev-launcher
drops observed at the time. Not investigated further.

### App Store Connect ⚠️ not signed in

Redirected to login with `authResult=FAILED`. Entering credentials is not something I do, and
Apple requires 2FA on your device regardless.

### EAS keys ✅ FIXED

`EXPO_PUBLIC_REVENUECAT_IOS_KEY` and `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` pushed to the production
environment. All seven now load — confirmed by the build log itself.

---

## THE BLOCKER — one command, and it needs you

The build ran through everything and stopped at credentials:

> Distribution Certificate is not validated for non-interactive builds.
> Credentials are not set up. Run this command again in interactive mode.

It also surfaced that there are **TWO targets** needing separate provisioning profiles:
`com.euphoriainv.euphoria` and `com.euphoriainv.euphoria.widget`.

**Run this, and sign in to Apple when prompted:**

```
cd ~/euphoria-native && npx eas build --platform ios --profile production
```

Then when it completes:

```
npx eas submit --platform ios --profile production --latest
```

Everything else is ready: profiles configured, submit credentials present (ascAppId 6761808087),
buildNumber already incremented to 2, all seven env vars loading.

**Timeline once you start it:** build 15-25 min, submit plus Apple processing 10-20 min. So
roughly 35-50 minutes to TestFlight, and none of that is something either of us can speed up.
