# September 9 App Review verification

## Rejection confirmed live

- App: Euphoria: Learn to Invest, App Store Connect `6761808087`.
- Submission: `316422e8-d19d-4edf-8c85-1ef396e7709d`.
- Apple reviewed version 1.0 (24) on September 8, 2026.
- Guideline 2.1(b): neither Annual nor Monthly responded when the reviewer tapped the trial purchase button.
- Review device: iPhone 17 Pro Max, iOS 26.6.

## Cause and existing fix independently checked

The rejected build's source commit was `79b3490b9c388a323272e01f312677cd7d90322d` (verified against EAS build metadata). Its trial CTA selected `next`, a navigation handler, instead of `buyPro`. That bypassed RevenueCat/StoreKit completely for trial-eligible users.

Claude's fix commit `27d4115449102f9219aa0eb9071bd6462c0f2574` routes every non-Pro paywall CTA to `buyPro`. Other onboarding steps retain `next`; already-Pro users return to Home.

Flow: paywall SlabButton → buyPro → getPackages → findPackage(selected annual/monthly plan) → purchase → Purchases.purchasePackage → adoptCustomerInfo → Pro entitlement → Home.

No additional runtime code changes were necessary to correct this particular dead-button defect during this verification.

## Fresh verification

- `npx tsc --noEmit`: exit 0.
- `npm run check`: exit 0; ESLint reports 43 existing warnings and zero errors.
- `node scripts/paywall-cta-behavior-regression.mjs`: 8 routing cases pass. The test extracts and executes the actual JSX handler expression with instrumented callbacks. Rejected build 24 is a negative control and demonstrably navigates instead of purchasing.
- ESLint on the new regression script: zero warnings/errors.
- Simulator Monthly trial CTA: Apple Account purchase sign-in dialog appeared.
- Simulator Annual trial CTA: Apple Account purchase sign-in dialog appeared.
- Canceling each purchase sign-in returned to the usable paywall without granting Pro.
- Restore Purchases returned a native “Nothing to restore” result.
- “Maybe later” returned to Home.
- Live Paid Apps Agreement status: Active.
- `node scripts/asc-preflight.mjs --agreement-verified`: 32/32 pass, including both products in RevenueCat's current offering and functional EULA/privacy/support links. The attached build was still 24 at the time of this check; metadata passing is NOT proof that the fixed binary is attached.

## Limits — do not overclaim

The available simulator is iPhone 17 Pro Max on **iOS 26.5**, not 26.6. Claude's commit message's claim of an exact iOS 26.6 device match was not corroborated. This is a development build served by the local Expo server.

At the simulator stage, opening the Apple Account dialog proved only that the button reached StoreKit. The later physical-device TestFlight test below completed a no-charge Monthly sandbox purchase and verified Pro activation, cold-launch persistence, and restore. No real-money purchase was made.

## Replacement binary

- New production build: **25**.
- EAS build ID: `3df378d1-5e4b-400f-bcb8-4622fb840d17`.
- Build source commit: `27d4115449102f9219aa0eb9071bd6462c0f2574`.
- Build URL: https://expo.dev/accounts/s-k-28/projects/euphoria-native/builds/3df378d1-5e4b-400f-bcb8-4622fb840d17
- Apple archive validation: `VERIFY SUCCEEDED with no errors`.
- App Store Connect processing: `VALID`, `APP_STORE_ELIGIBLE`, unexpired, and visible as build 25.
- Delivery UUID / App Store Connect build ID: `6b86d0e6-9731-46ce-aba0-884f81075d11`.
- The queued EAS submission `7e65cdee-ca5a-4ce9-aadb-4f5dbdc3feb7` was canceled before the direct upload, preventing a duplicate delivery.
- Build 25 is attached to App Store version 1.0. The exact-build preflight passes 33/33.
- The original review submission `316422e8-d19d-4edf-8c85-1ef396e7709d` was resubmitted on September 9, 2026 at `19:26:19Z`. Live API state after submission: `WAITING_FOR_REVIEW`.
- Its four review items are present and `READY_FOR_REVIEW`: app version, subscription group, Monthly subscription, and Annual subscription.

## Physical-device TestFlight verification — September 9, 15:15–15:25 CDT

Installed **1.0.0 (25) directly through TestFlight** on the user's physical **iPhone 15 Pro, iOS 26.6**. TestFlight displayed build 25 with Open after installation, and CoreDevice independently reported installed build 25. This is the same App Store Connect binary attached to the waiting review submission, not the Expo development build.

Build 25 was enabled for the user's tester account in the dedicated internal group `Siddartha Device Verification`; other testers were not added to that group.

| Check | Observed result | Evidence |
| --- | --- | --- |
| Correct installed binary | TestFlight 1.0.0 (25), Open | [Build identity](testflight-2026-09-09/01-testflight-build25.png) |
| Annual purchase button | Native TestFlight sheet: Euphoria Pro Yearly, 3-day free trial, $79.99/year; testing-only/no-charge notice | [Annual sheet](testflight-2026-09-09/02-annual-apple-purchase-sheet.png) |
| Annual cancellation | Sheet dismissed; app became usable and allowed Monthly selection without granting Pro | [Recovered paywall](testflight-2026-09-09/03-annual-cancel-monthly-selected.png) |
| Monthly purchase button | Native TestFlight sheet: Euphoria Pro Monthly, 3-day free trial, $9.99/month; testing-only/no-charge notice | [Monthly sheet](testflight-2026-09-09/04-monthly-apple-purchase-sheet.png) |
| Monthly cancellation | Sheet dismissed; spinner cleared and same non-Pro purchase button returned | [Recovered paywall](testflight-2026-09-09/05-monthly-cancel-recovered.png) |
| Retry after cancellation | Monthly sheet opened again; Subscribe advanced to Apple Account authorization | Observed on device; password entry left to the user |
| Monthly purchase completion | After the user authorized on the phone, Apple displayed “Your purchase was successful” and app displayed Pro | [Successful purchase](testflight-2026-09-09/06-monthly-purchase-success.png) |
| Pro activation | Profile showed PRO, Euphoria Pro, all lessons open and unlimited Atlas | [Unlocked profile](testflight-2026-09-09/07-pro-unlocked-profile.png) |
| Cold-launch persistence | Terminated and relaunched Euphoria; Profile still showed Euphoria Pro | [After cold launch](testflight-2026-09-09/08-pro-after-cold-launch.png) |
| Restore after purchase | Profile > Account > Restore purchases returned “Welcome back — Your Euphoria Pro subscription is active again” | [Restore success](testflight-2026-09-09/09-restore-success.png) |

The user entered Apple Account authorization directly on the iPhone. No password was collected or entered by automation. The Monthly no-charge sandbox transaction completed successfully. Annual was opened and canceled, not purchased. Restore was verified on the existing account after purchase, not following a reinstall or on a second device. Renewal, expiry, refunds, and billing retry were not exercised in this run.

The existing account is on local trial day 3 of 3, so its app CTA reads `Get Euphoria Pro`, not the fresh-onboarding trial CTA. Both plans exercise the fixed shared purchase handler, but this is not a claim that a fresh-user onboarding run was performed on this phone. Fresh-trial routing remains covered by the earlier source regression and simulator tests. No account data was wiped.

Live review-submission API recheck during testing still returned `WAITING_FOR_REVIEW`, submitted `2026-09-09T19:26:19.307Z`. Refreshing the existing browser tab confirmed its submitted app item links to **1.0.0 (25)**; the tab had initially displayed stale build-24 information before reload.

Uploaded the nine screenshots and a test-scope README as `Euphoria-build25-TestFlight-evidence.zip` to the version's App Review attachments, ID `15a0afbb-c378-4cda-94ef-16309911360f`. Review notes were updated with the actual results and a clarification distinguishing the local promotional trial from Apple's subscription introductory trial. Existing review credentials and other review instructions were preserved. This did not cancel or resubmit the waiting submission.

## Remaining verification

The rejected dead-button flow now has physical-device TestFlight evidence for both plans reaching StoreKit, plus Monthly purchase completion, Pro activation, cold-launch persistence, and restore. The scope limits above remain; these results do not guarantee App Review approval or constitute an exhaustive whole-app audit.

Atlas also returned a controlled `503 busy` response after about 52 seconds during the broader audit. That is separate from the rejected purchase flow and should be investigated before a later update; it did not alter build 25 after Apple validated it.
