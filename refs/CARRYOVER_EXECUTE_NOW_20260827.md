EUPHORIA iOS APP CARRYOVER - EXECUTE NOW, VERIFY, AND FINISH

Repo: /Users/siddarthakodithyala/euphoria-native
Branch: main
Remote: github.com/teameuphoriainv-dot/euphoria-native
Date: 2026-08-27

LATEST VERIFIED UPDATE - 9:20 PM

- The paywall gap root cause in source was `paywallBody.flexGrow: 1`. It has been removed.
- `scripts/paywall-layout-pin.mjs` now fails if flexible layout is reintroduced between Monthly and
  the CTA, and it is included in `npm run check`.
- `Configuration.storekit` already contained the correct products and prices, but the generated
  Xcode scheme did not select it. `plugins/with-storekit-config.js` now copies the file into `ios/`
  and adds a `StoreKitConfigurationFileReference` to the generated app scheme's `LaunchAction`.
- `app.json` includes that config plugin. `scripts/pricing-pin.mjs` now verifies the StoreKit product
  IDs and `$9.99` / `$79.99` prices against the paywall.
- A clean `EXPO_OFFLINE=1 npx expo prebuild --platform ios --no-install` succeeded. The generated
  StoreKit file matched byte-for-byte and the generated scheme passed `xmllint`.
- `npm run check` passed with 0 errors and the existing 62 warnings after these changes.
- The installed simulator binary predates the StoreKit scheme wiring and must be rebuilt before
  local RevenueCat products can load. The simulator's exact RevenueCat message was that none of the
  dashboard products could be fetched from ASC or a StoreKit configuration.
- The previous live audit in `refs/PAYWALL_STATUS.md` remains strong evidence: on 2026-08-23 both ASC
  subscriptions were `READY_TO_SUBMIT`, had 175 prices and 175 three-day offers, annual was `$79.99`,
  and RevenueCat mapped `$rc_monthly` / `$rc_annual` correctly. A fresh 2026-08-27 read-only API
  query is still required.
- Current Codex shell networking cannot resolve ASC. Browser access to
  `https://api.appstoreconnect.apple.com` was denied. Obtain explicit user authorization for that
  domain before retrying; do not route around the denied permission.
- The host macOS clipboard is NOT yet populated. Browser clipboard readback was isolated, and
  TextEdit/Notes/Finder desktop control was denied. Obtain explicit user authorization for a local
  editor or direct desktop clipboard action, then copy this entire file and verify it there.

OPERATING MODE

This is an execution session, not a planning or status session. Start work immediately. Keep working
through implementation, simulator verification, checks, cleanup, commit, and push unless a genuine
external blocker makes progress impossible. Do not stop after explaining a fix. Do not leave a bug
with a proposed solution. Do not wait idly between commands; poll active processes and work on
independent checks concurrently.

Ruflo MCP v3.38.19 is installed and enabled for Codex at:
  /Users/siddarthakodithyala/.local/bin/ruflo mcp start

Use Ruflo immediately if its tools are available after restart. You may create up to 10 parallel
read-only workstreams for independent audits, screenshots, static checks, App Store mapping, security,
accessibility, subscriptions, auth, privacy, and release verification. Assign only ONE implementation
owner to src/app/onboarding.tsx so agents do not overwrite each other. The primary agent owns final
integration, simulator proof, tests, and source control. If Ruflo tools are not exposed, continue with
parallel shell/tool calls instead of stopping to troubleshoot orchestration.

NON-NEGOTIABLE RELEASE RULES

- Do not submit to Apple.
- Do not publish an OTA update.
- Do not push App Store metadata.
- Do not externally distribute TestFlight.
- Do not cut build 20 without explicit approval.
- Fixing, testing, staging, committing, and pushing code is allowed only when checks are green.
- Never lose or revert existing user changes.
- Do not modify or publish the website repo without explicit approval.

FIRST BLOCKER: FIX THE PAYWALL VISIBLE IN THE 8:18 PM SCREENSHOT

The current iPhone 17 Pro paywall still has a large dead vertical band between the bottom of the
Monthly plan card and the "Get Euphoria Pro" CTA. This is the bug to close first.

Required visual result:

- Monthly card bottom to CTA top is a normal section gap, target 8-24 points, never a large blank band.
- CTA, renewal sentence, Maybe later, Terms, Privacy, and Restore remain visible on first render.
- No scrolling is required on iPhone 17 Pro at the default text size.
- No blank band is moved below the legal links.
- No clipping, overlap, horizontal truncation, animation corruption, or hidden controls.
- Annual and Monthly cards remain fully visible and tappable.
- Selecting Monthly updates CTA and renewal copy correctly.
- Terms, Privacy, Restore, and Maybe later retain explicit accessibility roles and effective 44-point
  targets.
- Preserve the compact mascot and the benefits comparison.

Do not solve this with fixed negative transforms, compensated margins, or absolute positioning. Those
were attempted and were absorbed by the footer/flex layout or caused clipping. Fix the ownership of
vertical space structurally. The likely direction is one compact paywall stack with controlled gaps,
where plans and purchase controls participate in the same layout. Use responsive flex constraints and
allow scrolling only as a fallback for smaller devices or larger accessibility text.

Current src/app/onboarding.tsx state:

- PAYWALL_ATLAS is 52.
- SafeAreaView uses top-only edges on the paywall.
- `actionFooter` was extracted.
- Paywall `actionFooter` is currently rendered inside the ScrollView.
- The paywall was removed from `fillsViewport`.
- `paywallBody` is top-packed.
- `paywallContent` has zero top/bottom padding.
- This latest structural refactor has NOT received a completed TypeScript/full-check/simulator pass.
- Inspect the current diff before editing. Keep the accessibility improvements.
- Remove stale comments that still describe a pinned footer after the final layout is chosen.

MEASURABLE PAYWALL VERIFICATION

1. Capture a settled screenshot after animations finish; use polling/readiness, not an arbitrary long
   idle wait.
2. Capture the accessibility tree and record frames for Monthly, CTA, renewal copy, Maybe later,
   Terms, Privacy, and Restore.
3. Measure Monthly-bottom to CTA-top from those frames or screenshot pixels converted to points.
4. Prove all required controls are inside the initial viewport.
5. Tap Monthly and capture the updated CTA/copy.
6. Tap Restore and verify the honest no-purchase state.
7. Return to Annual and leave the final screenshot in:
   /private/tmp/euphoria-deep-audit-20260827/paywall-final.png
8. Do not call the paywall fixed until the screenshot itself visibly satisfies the criteria.

SIMULATOR AND FAST CONTROL

Target simulator:
  iPhone 17 Pro
  UDID 755B55D9-8E4B-431C-9D1D-A635F38CFF5F
  iOS 26.5
  bundle com.euphoriainv.euphoria

The user-visible Simulator is open, but the sandbox's latest direct `xcrun simctl list devices` call
failed because CoreSimulatorService disconnected. Do not spend repeated cycles on the same dead call.

Try in this order:

1. Use the existing IDB bridge files in the repo if the host bridge is alive:
   .sim-host-bridge.sh
   .sim-host-request
   .sim-host-response
   companion 127.0.0.1:10882

2. Send bridge operations `status`, `launch`, `open`, `tap`, `tree`, and `screenshot` and poll the
   response id. The bridge screenshot target is:
   /private/tmp/euphoria-simulator-live.png

3. If the bridge is dead, restart only the minimum simulator stack once:
   killall Simulator 2>/dev/null || true
   killall -9 com.apple.CoreSimulator.CoreSimulatorService 2>/dev/null || true
   open -a Simulator
   xcrun simctl boot 755B55D9-8E4B-431C-9D1D-A635F38CFF5F
   xcrun simctl bootstatus 755B55D9-8E4B-431C-9D1D-A635F38CFF5F -b
   open -a Simulator --args -CurrentDeviceUDID 755B55D9-8E4B-431C-9D1D-A635F38CFF5F

4. Start/reuse IDB companion and bridge only if required. Prefer IDB for taps, trees, screenshots, and
   deep links because it is faster than visual computer control.

5. If sandbox access fails but the Simulator remains visibly live, keep static checks running and give
   the user ONE exact host command to restore the bridge. Do not retry the same failing operation for
   hours.

WORKING TREE: DO NOT LOSE THESE CHANGES

Modified:
  app.json
  package.json
  refs/ASO_LISTING_DRAFT.md
  scripts/auth-session-storage-pin.mjs
  scripts/capture-screens.sh
  scripts/certify.py
  scripts/privacy-claim-pin.mjs
  scripts/routes.sh
  src/app/(tabs)/games.tsx
  src/app/(tabs)/trade.tsx
  src/app/auth.tsx
  src/app/avatar.tsx
  src/app/chat.tsx
  src/app/friends.tsx
  src/app/league.tsx
  src/app/news.tsx
  src/app/onboarding.tsx
  src/app/settings/[section].tsx
  src/app/shop.tsx
  src/app/start.tsx
  src/lib/analytics.ts
  src/lib/auth.ts
  src/lib/onboarding-path.ts
  src/lib/purchases.ts

New intended files:
  refs/APP_STORE_PRE_SUBMIT_READINESS_20260827.md
  refs/CARRYOVER_EXECUTE_NOW_20260827.md
  scripts/ai-consent-pin.mjs
  scripts/billing-identity-pin.mjs
  scripts/game-card-readiness-pin.mjs
  scripts/legal-links-pin.mjs
  scripts/privacy-manifest-pin.mjs

Temporary simulator bridge files are untracked and must NOT be committed:
  .sim-audit-runner.sh
  .sim-host-bridge.sh
  .sim-host-request
  .sim-host-response

ALREADY COMPLETED AND VERIFIED BEFORE THE LATEST PAYWALL REFACTOR

- 34 routes rendered on iPhone 17 Pro with no blank route or crash.
- App Store legal links corrected to euphoriainv.com and pinned.
- Route-less games Credit Climb and Market Reaction marked Coming Soon and pinned.
- Avatar banner selector redesigned.
- Shop "How to earn Euphorium" section removed.
- Practice-only financial copy clarified.
- AI/Gemini explicit pre-send consent verified: cancel sends nothing; continue sends.
- PostHog analytics defaults off, is consent-gated, and is revocable; final simulator state off.
- Apple native sign-in sheet reached; simulator required Apple ID in Settings.
- Google native sign-in consent sheet reached and safely cancelled.
- Auth mode/reset controls expose 44-point frames.
- Local notification permission, enable, readback, disable, and schedule cancellation verified; final off.
- Account deletion confirmation/cancel verified without destructively deleting the test profile.
- Supabase AsyncStorage persistence, foreground refresh, server sign-out, and account-deletion local
  session cleanup are implemented and pinned.
- RevenueCat now logs into the verified Supabase user id and logs out with account lifecycle, matching
  server entitlement lookup; pinned by billing-identity-pin.
- Tracked Expo privacy manifest survives clean prebuild and is in the Xcode Resources phase.
- Clean iOS Expo export passed: 2,493 modules, approximately 18 MB Hermes bundle.
- `npm audit --omit=dev --offline` reported 0 known vulnerabilities in the local advisory cache.
- Full `npm run check` passed before the latest paywall structural refactor with 0 errors and the
  existing 62 warnings.
- `python3 scripts/certify.py` passed all 18 static route checks.
- `npx tsc --noEmit` passed before the latest paywall structural refactor.

REQUIRED AFTER PAYWALL FIX

Run these, fix every error, and rerun after any correction:

  git diff --check
  npx tsc --noEmit
  npx eslint src/app/onboarding.tsx --max-warnings 5
  node scripts/pricing-pin.mjs
  npm run check
  python3 scripts/certify.py
  npx expo install --check
  npx expo export --platform ios --output-dir /private/tmp/euphoria-export-final-20260827 --clear

Use a new unique export directory if that path already exists. Do not delete unrelated files.

Then:

1. Inspect `git diff` and `git diff --stat` for accidental churn.
2. Stop the host bridge cleanly if it is running.
3. Remove only the four temporary `.sim-*` files listed above.
4. Confirm `git status --short` contains only intended source/docs/scripts.
5. Stage intended changes only.
6. Inspect the staged diff.
7. Commit with a concise App Store readiness message.
8. Push `main` only if every required check is green.
9. Report the commit hash, push result, simulator evidence, and external blockers.
10. Do not ask to cut build 20 unless the external blockers below are resolved.

EXTERNAL BLOCKERS: DO NOT MISREPRESENT THESE AS FIXED

1. RevenueCat/App Store products are still unavailable from StoreKit. The current offering returns no
   purchasable App Store packages in the simulator. Resolve App Store Connect product/agreement/
   credential state, then test purchase, unlock, restore, sign-out/sign-in, expiration, billing retry,
   and cancellation through Sandbox/TestFlight.

2. The public privacy policy at euphoriainv.com is incomplete for Supabase, RevenueCat, PostHog,
   Gemini, Apple/Google sign-in, and notifications. Do not publish website changes without approval.

3. Sign in with Apple account deletion currently provides manual revocation guidance; automatic Apple
   token revocation is not implemented because no server-side Apple authorization code/refresh token
   lifecycle exists.

4. Live Supabase RLS policies are not fully represented in this repo and require production-project
   inspection/export.

5. App Store Connect privacy answers, reviewer credentials, age rating, export compliance, final merged
   archive privacy report, release-device accessibility walk, monitoring, and rollback remain manual.

APP STORE REVIEW POSITIONING

Reviewer notes must state:

- Simulated wallet only.
- No deposits or withdrawals.
- No brokerage or securities transactions.
- No real-money gaming or prizes.
- No personalized financial advice.
- Atlas provides general educational explanations and has a buy/sell advice guard.
- Premium digital functionality uses Apple in-app purchase only.
- Account deletion is available in-app.

FINAL BEHAVIOR RULE

Do not give a progress-only final response. Continue until the paywall screenshot is visibly correct,
checks are green, temporary files are cleaned, and code is committed/pushed, or until a single clearly
identified external blocker prevents the next concrete action. If blocked, report the exact failed
command, exact error, work already completed, and the shortest user action that unblocks execution.
