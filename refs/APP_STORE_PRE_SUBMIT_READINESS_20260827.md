# App Store Pre-Submit Readiness

Research date: 2026-08-27

Scope: Euphoria iOS, Expo SDK 57, Supabase auth, RevenueCat subscriptions, simulated investing education.

This is a pre-submit gate, not a launch plan. Anything that sends outward, including App Review submission, OTA publish, external TestFlight distribution, or App Store metadata pushes, still stops for explicit approval.

## Verdict

Do not submit from the current local build alone. The code and simulator gates are green, but the
RevenueCat products are still unavailable from StoreKit and the public privacy policy does not yet
describe all production processors. Submit only after those blockers are cleared, build 20 is cut
from a green commit, and that exact build is smoke-tested without the dev-client overlay.

No App Review submission, OTA publish, metadata push, or external TestFlight distribution was
performed during this audit.

## Fixed In Repo

1. Native Supabase session persistence is pinned.
   - Status: fixed and pinned.
   - Evidence: `src/lib/auth.ts` passes `storage: AsyncStorage` into Supabase auth config, and `scripts/auth-session-storage-pin.mjs` fails if that adapter disappears.
   - Why it matters: without a React Native storage adapter, a successful sign-in disappears after force-quit.
   - Sources: Supabase React Native auth quickstart, Supabase client initialization.

2. Logout ends the server session.
   - Status: fixed.
   - Evidence: the shared store `signOut` calls `signOutServer()` before clearing local signed-in state.
   - Why it matters: once sessions persist, local-only logout leaves a valid Supabase session behind.
   - Sources: OWASP Mobile Application Security, Supabase auth sessions.

3. Settings legal links use the live Euphoria domain.
   - Status: fixed and pinned.
   - Evidence: `src/app/settings/[section].tsx` now links to `https://euphoriainv.com/privacy` and `https://euphoriainv.com/terms`; `scripts/legal-links-pin.mjs` fails on `euphoria.app`, `example.com`, or `localhost` URLs.
   - Why it matters: Apple requires reachable privacy and legal links, especially around subscriptions.
   - Sources: Apple App Privacy Details, Apple auto-renewable subscription guidance.

4. Dead-looking game cards are now honest.
   - Status: fixed and pinned.
   - Evidence: route-less playable-looking cards are marked `comingSoon: true`, visibly show `Soon`, and are disabled; `scripts/game-card-readiness-pin.mjs` fails if a card has no route, no Pro state, and no Coming Soon state.
   - Why it matters: App Review treats unfinished or broken controls as completeness problems.
   - Source: Apple App Review Guidelines 2.1 and 2.3.

5. Stale local-balance copy is no longer false.
   - Status: fixed.
   - Evidence: Shop copy now says balance lives on this device and does not follow to the web app yet.
   - Why it matters: accounts exist, but local coin/progress sync does not.
   - Source: Apple metadata accuracy requirements.

6. Start flow copy matches the actual action.
   - Status: fixed.
   - Evidence: Atlas now says the user is starting the first lesson, which matches the primary button path.
   - Why it matters: copy cannot promise a guide when the app opens a lesson.
   - Source: Apple App Review Guidelines 2.3.

7. Practice-profile social copy is safer.
   - Status: fixed.
   - Evidence: the League friends empty state says practice profiles and real accounts separately.
   - Why it matters: fabricated people must not be described as real social users.
   - Sources: Apple App Review Guidelines 1.2 and 2.3.

8. Screenshot route coverage is broader.
   - Status: fixed.
   - Evidence: `scripts/routes.sh` now includes avatar, achievements, shop, notification settings, preference settings, and the playable game routes.
   - Why it matters: a visual pass that skips reachable screens is not a release gate.
   - Source: Apple final testing guidance.

9. ASO subtitle documentation no longer contradicts the subtitle.
   - Status: fixed.
   - Evidence: `refs/ASO_LISTING_DRAFT.md` explains the actual subtitle keywords.
    - Why it matters: listing copy and internal notes should not disagree during submission.
    - Source: Apple metadata character and accuracy requirements.

## Verified 2026-08-28

1. Full source gate passed with 0 errors and the existing 62 warnings.
   - `npm run check`: pass.
   - `npx tsc --noEmit`: pass.
   - `python3 scripts/certify.py`: all 18 static route checks pass.
   - `npx expo install --check`: dependencies aligned using Expo's local SDK map.
   - `npm audit --omit=dev`: 0 critical vulnerabilities; 10 high and 14 moderate advisories remain
     in Expo/Metro/Xcode build-tool dependency chains. npm's proposed fixes are either unavailable
     or require an unsafe dependency change, so these remain a ship-with-caution maintenance item.

2. All 34 visual audit routes rendered on iPhone 17 Pro, iOS 26.5.
   - Evidence directory: `/private/tmp/euphoria-deep-audit-20260827`.
   - Priority screens inspected individually: home, start, games and playable games, league,
     friends, shop, auth, onboarding/paywall, settings, trade, news, and account deletion.
   - No blank route or crash was observed.

3. The paywall fits one 874-point viewport without scrolling.
   - Annual and monthly plans, CTA, renewal terms, Maybe later, Terms, Privacy, and Restore are all
     visible at once.
   - The footer dead space was removed and required controls have explicit accessibility roles and
     at least 44-point effective targets.
   - Monthly selection updates the CTA and renewal sentence; Restore returns an honest empty state.

4. Native login providers reach their real system surfaces.
   - Sign in with Apple reached Apple's framework sheet; the simulator then required an Apple ID in
     Settings, so credential completion remains a real-device/reviewer-account gate.
   - Google sign-in reached the native consent sheet for `accounts.google.com` and was cancelled
     without error.
   - Auth mode and password-reset controls expose 44-point accessibility frames.

5. Notification permission is requested only after the user enables the setting.
   - The real iOS prompt was accepted, the enabled state read back correctly, and disabling the
     setting cancelled the fixed schedule. Final simulator state is off.

6. AI data sharing now requires explicit pre-send consent.
   - Cancelling sends nothing and does not consume the allowance.
   - Continuing sends the prompt to Gemini and the disclosure remains visible in the chat surface.
   - `scripts/ai-consent-pin.mjs` protects the consent gate and disclosure.

7. Analytics is default-off, consent-gated, and revocable.
   - PostHog is not constructed or called until the user enables analytics.
   - Both enable and disable paths were exercised after a full Expo reload; final state is off.
   - No `identify()` call, session replay, ad SDK, or PII event property was found.

8. Supabase session and account boundaries are pinned.
   - AsyncStorage persists native sessions, native foreground state starts token refresh, and
     background state stops it.
   - Ordinary sign-out calls Supabase server sign-out.
   - Account deletion calls the user-scoped `delete_own_account` RPC and clears the persisted local
     session whether the RPC succeeds or fails.
   - No tracked service-role key, private key, or `.env` secret was found.

9. RevenueCat now shares the authenticated identity used by server entitlement checks.
   - On Supabase sign-in, the SDK calls `Purchases.logIn(userId)`; on sign-out it calls
     `Purchases.logOut()`.
   - `scripts/billing-identity-pin.mjs` prevents the client/server subscriber IDs from drifting.
   - Purchase History is consequently declared linked to the account in the privacy manifest.

10. A clean native simulator build/install and production-style iOS JavaScript export succeeded.
    - The app built and installed on iPhone 17 Pro, iOS 26.5, with 0 build errors and 2 warnings.
    - 2,498 modules bundled; Hermes output is approximately 18 MB.
    - This proves native compilation and bundling, not signing, archive processing, or release
      runtime behavior.

11. Privacy configuration survives a clean native generation.
    - A throwaway `expo prebuild --clean` generated `PrivacyInfo.xcprivacy`, added it to the Xcode
      Resources phase, and passed `plutil -lint`.
    - Required-reason categories: File Timestamp, User Defaults, System Boot Time, and Disk Space.
    - Declared data: Email Address, User ID, Device ID, Purchase History, Product Interaction, and
      Other User Content; tracking is false and tracking domains are empty.

## Blocking Before Build 20

1. RevenueCat/App Store products are not currently fetchable.
   - The SDK is configured, but the current offering returns no available StoreKit packages and
     purchase attempts report that the plan is unavailable.
   - Resolve the App Store Connect product/agreement/credential state, then test purchase, unlock,
     restore, sign-out/sign-in identity transfer, expiration, billing retry, and cancellation in
     Sandbox or TestFlight.

2. The public privacy policy is incomplete for the shipping app.
   - It must accurately name and describe Supabase, RevenueCat, PostHog, Gemini, Apple/Google
     sign-in, and local notifications, including purpose, sharing, retention, deletion, consent,
     and contact details.
   - Remove or substantiate unsupported security/compliance claims. Do not publish the website
     change without explicit approval.

3. Sign in with Apple deletion does not automatically revoke Apple's token.
   - Current deletion removes the Supabase account and gives manual iOS Settings revocation steps.
   - Before claiming automatic revocation, persist the Apple authorization code/refresh token on a
     trusted server and implement Apple's token revocation flow from TN3194.

4. Live Supabase RLS cannot be proven from this repository.
   - The mobile app does not write synced application tables, but the production project policies
     and `delete_own_account` function grants must be exported or inspected before submission.

5. Reviewer access, App Privacy answers, age rating, export-compliance answer, and release
   monitoring are App Store Connect/operations tasks and remain unverified.

## Reviewer Notes Draft

> Euphoria is a financial education app. All cash, portfolios, trades, options examples, rewards,
> and leaderboards are simulated. The app accepts no deposits, permits no withdrawals, executes no
> securities transactions, and is not a brokerage. Atlas provides general educational explanations
> and is guarded against personalized buy/sell recommendations; it is not financial advice.
>
> Use the supplied demo account to review account-based features. The first lesson is available from
> Home. Simulated trading is under Trade. Subscription plans unlock additional educational courses,
> Atlas usage, simulations, and unlimited paper trading through Apple in-app purchase. Restore is
> visible on the paywall. Account deletion is in Profile > Settings > Account and removes the
> authenticated Supabase account plus local device data.
>
> No external payment method is offered in the app. News links open third-party educational source
> articles. Notifications are local reminders and are requested only after the user opts in.

Replace `supplied demo account` with active, non-expiring credentials and include exact navigation
steps before pasting this into App Store Connect.

## App Privacy Working Draft

Confirm these against the release archive and each vendor's current behavior before saving them in
App Store Connect:

| Data type | Linked | Tracking | Purpose |
|---|---:|---:|---|
| Email Address | Yes | No | App Functionality |
| User ID | Yes | No | App Functionality |
| Device ID | Yes | No | App Functionality, Analytics |
| Purchase History | Yes | No | App Functionality, Analytics |
| Product Interaction | Yes | No | Analytics |
| Other User Content (Atlas prompt) | No | No | App Functionality |

PostHog analytics is optional and defaults off. Gemini prompt handling must match the actual paid
project's data-retention configuration; do not claim zero retention unless that setting is proven.

## Must Verify Before Submit

10. Build 20 must be a release candidate, not a dev-client screenshot pass.
    - Status: not proven in repo.
    - Required action: cut the candidate from a green commit, install it as TestFlight or a production release build, then smoke-test it.
    - Euphoria note: Build 19 predates password auth; build 20 should not be cut until local checks are green.
    - Sources: Apple App Review Guidelines, Apple TestFlight overview, Expo TestFlight docs.

11. Reviewer access must be complete.
    - Status: App Store Connect task.
    - Required action: provide non-expiring demo credentials or a full demo mode, plus steps for lessons, simulated trading, paywall, restore purchases, sign-out, and account deletion.
    - Euphoria note: review notes must explicitly say simulated wallet, no real money, no securities transactions, and no personalized financial advice.
    - Source: Apple App Review Guidelines 2.1.

12. Sign in with Apple must be verified beside Google sign-in.
    - Status: both native sheets reached in the simulator; credential completion on the release candidate is still needed.
    - Required action: test Apple sign-in and Google sign-in on a real device or TestFlight build.
    - Euphoria note: because Google sign-in exists, Apple sign-in must work unless an Apple exception applies.
    - Source: Apple App Review Guideline 4.8.

13. Account deletion must be tested end to end on the candidate.
    - Status: server RPC has been proven before; candidate-flow verification still needed.
    - Required action: create a test account, delete it in-app, confirm Supabase auth user is gone, local session clears, and any Apple user token handling is correct.
    - Euphoria note: if Sign in with Apple accounts are deleted, Apple token revocation needs confirmation.
    - Sources: Apple account deletion guidance, Apple TN3194, Supabase admin delete user docs.

14. RevenueCat and StoreKit must pass sandbox testing.
    - Status: local simulator configuration fixed on 2026-08-27; end-to-end purchase remains blocked on a new native build and sandbox run.
    - Evidence: `Configuration.storekit` contains the monthly and annual products at `$9.99` and `$79.99`; `plugins/with-storekit-config.js` now copies it into the generated iOS project and selects it in the Xcode `LaunchAction`. A clean `expo prebuild` produced valid scheme XML with the StoreKit reference. `scripts/pricing-pin.mjs` prevents the local StoreKit prices from drifting from the paywall.
    - Live configuration evidence: `refs/PAYWALL_STATUS.md` records a successful 2026-08-23 ASC API check with both products `READY_TO_SUBMIT`, 175 price points, 175 three-day introductory offers, and the annual product raised to `$79.99`. RevenueCat's live offerings endpoint returned `$rc_monthly` and `$rc_annual` mapped to the correct Apple product IDs.
    - Current limitation: a new native simulator build containing the scheme wiring still requested
      `euphoria_pro_monthly` and `euphoria_pro_yearly`, but StoreKit returned no products and the
      current RevenueCat offering contained no purchasable packages. The 2026-08-27 ASC API re-query
      also could not be completed because shell DNS was sandboxed and browser permission for
      `api.appstoreconnect.apple.com` was denied. Do not treat the Aug 23 result as a substitute for
      the final live check.
    - Required action: resolve App Store Connect product/agreement/credential state. Then, on
      TestFlight or a physical sandbox device, verify purchase, entitlement unlock, restore
      purchases, sign-out/sign-in entitlement behavior, expiration, billing retry, cancellation,
      and paywall legal links.
    - Euphoria note: any digital premium feature must use Apple IAP, not external payment.
    - Sources: Apple Guideline 3.1.1, Apple auto-renewable subscriptions, RevenueCat launch checklist.

15. App Privacy answers must include third-party SDK behavior.
    - Status: App Store Connect task.
    - Required action: audit Supabase, RevenueCat, PostHog, Google Sign-In, Expo Notifications, and any crash/diagnostic collection before filling labels.
    - Euphoria note: local-only progress is different from collected data, but analytics, identifiers, email, diagnostics, product interaction, and purchase data may need disclosure.
    - Sources: Apple App Privacy Details, Apple User Privacy and Data Use.

16. Privacy manifests and required-reason APIs must be checked in the built archive.
    - Status: clean prebuild and Xcode resource inclusion passed; merged candidate archive report remains required.
    - Required action: inspect the generated iOS archive or App Store Connect processing result for `PrivacyInfo.xcprivacy` coverage and required-reason API declarations.
    - Euphoria note: listed SDKs in the dependency tree include packages Apple tracks for privacy manifest/signature requirements.
    - Sources: Apple privacy manifest files, Apple third-party SDK requirements, Apple required-reason APIs.

17. Export compliance must stay consistent.
    - Status: repo config present, App Store Connect must confirm.
    - Evidence: `app.json` sets `ITSAppUsesNonExemptEncryption` to false.
    - Required action: answer export compliance consistently in App Store Connect.
    - Source: Apple export compliance documentation.

18. Age rating must be honest.
    - Status: App Store Connect task.
    - Required action: complete the current age rating questionnaire and avoid Kids Category unless the product is truly for children under Apple rules.
    - Euphoria note: current positioning is primarily ages 13 and up, high school students, financial literacy, no real money.
    - Sources: Apple age rating docs, Apple Kids Category guidance.

19. Accessibility must be walked on the release candidate.
    - Status: not proven in repo.
    - Required action: run VoiceOver, Dynamic Type, contrast, Reduce Motion, Voice Control or Switch Control spot checks on the major flows.
    - Euphoria note: paywall, auth, onboarding, lesson, trade, games, and account deletion are the priority paths.
    - Source: Apple Human Interface Guidelines Accessibility.

20. Launch monitoring and rollback must be ready before release.
    - Status: manual launch readiness.
    - Required action: know who watches crashes, reviews, support email, RevenueCat errors, Supabase auth errors, and EAS update state during the first 24 hours.
    - Euphoria note: do not OTA native auth, IAP SDK, entitlement, or privacy-manifest changes. Use OTA only for JS-safe fixes within the same runtime.
    - Sources: Expo EAS Update docs, Apple phased release docs, Apple crash logs docs.

## Research Sources

- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Apple App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
- Apple account deletion guidance: https://developer.apple.com/support/offering-account-deletion-in-your-app/
- Apple Sign in with Apple account deletion token guidance: https://developer.apple.com/documentation/technotes/tn3194-handling-account-deletions-and-revoking-tokens-for-sign-in-with-apple
- Apple auto-renewable subscriptions: https://developer.apple.com/app-store/subscriptions/
- Apple TestFlight overview: https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview
- Apple privacy manifest files: https://developer.apple.com/documentation/bundleresources/privacy-manifest-files
- Apple required-reason APIs: https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api
- Apple third-party SDK requirements: https://developer.apple.com/support/third-party-SDK-requirements/
- Apple accessibility guidance: https://developer.apple.com/design/human-interface-guidelines/accessibility
- Apple phased release guidance: https://developer.apple.com/help/app-store-connect/update-your-app/release-a-version-update-in-phases
- Expo SDK 57 docs: https://docs.expo.dev/versions/v57.0.0/
- Expo TestFlight docs: https://docs.expo.dev/submit/testflight/
- Expo EAS Update docs: https://docs.expo.dev/eas-update/introduction/
- Supabase React Native auth quickstart: https://supabase.com/docs/guides/auth/quickstarts/react-native
- Supabase auth sessions: https://supabase.com/docs/guides/auth/sessions
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase API keys: https://supabase.com/docs/guides/getting-started/api-keys
- OWASP MASVS: https://mas.owasp.org/MASVS/
- OWASP Mobile Application Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Mobile_Application_Security_Cheat_Sheet.html
