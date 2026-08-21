# App Review rejection — iOS 1.0 (unresolved since April 2026)

Read from App Store Connect on 2026-08-20. Verbatim where quoted.

| Field | Value |
|---|---|
| Submission ID | `4a0a0bdf-0f8e-48d4-ad1f-7a5bb925a171` |
| Submitted | Apr 8, 2026 3:33 AM, by Ramya Chilamantula |
| Apple replied | Apr 9, 2026 2:14 AM |
| Version reviewed | 1.0, build `1.0.0 (6)` |
| Review device | iPhone 17 Pro Max, iOS 26.4, active internet |
| Status | **Unresolved Issues** — open for ~4 months |
| Attachments | `Screenshot-0409-151113.png`, `Screenshot-0409-151139.png` (not downloaded) |

## Guideline 2.1(a) — Performance: App Completeness  (REJECTION)

> "The app exhibited one or more bugs that would negatively impact users."

Two bugs, verbatim:

1. **"The app became unresponsive during onboarding process."**
2. **"We were unable to complete signing up with Apple due to an error."**

Notes:
- (1) lands squarely in the onboarding flow this audit has been driving
  (`src/app/onboarding.tsx`). "Unresponsive" is a hang, not a visual glitch.
- (2) Sign in with Apple **is** implemented — `src/lib/social-auth.ts:86`
  (`signInWithApple`), called from `src/app/auth.tsx:107`; the button lives in
  `src/components/provider-button.tsx`. `expo-apple-authentication ~57.0.1` is
  in `package.json` and registered as a plugin in `app.json:51`.
  So this is a **runtime failure**, not a missing feature. Untriaged.

## Guideline 2.1(b) — Information Needed  (NOT a rejection — needs a written reply)

Apple wants the business model explained before finishing review. Four questions,
verbatim:

1. Who are the users that will use the paid subscriptions in the app?
2. Where can users purchase the subscriptions that can be accessed in the app?
3. What specific types of previously purchased subscriptions can a user access in the app?
4. What paid content, subscriptions, or features are unlocked within the app that
   do not use In-App Purchase?

This one costs nothing but a reply in the Resolution Center. Question 4 is the
one that matters — the honest answer is "none; everything paid goes through IAP."

## Relationship to the IAP blockers

Independent problems, but they interact: the Paid Apps Agreement being
"Pending User Info" and the subscriptions having no price mean that even a
resubmitted, bug-free build could not sell anything. Fix order is therefore
agreement -> prices -> the two 2.1(a) bugs -> reply to 2.1(b) -> resubmit.
