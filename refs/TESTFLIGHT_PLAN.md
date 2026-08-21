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
