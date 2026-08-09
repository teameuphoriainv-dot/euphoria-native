# Guideline 2.1(b) — draft reply to App Review

**Status: DRAFT. Nothing has been sent.** Paste into the Resolution Center thread on submission
`4a0a0bdf-0f8e-48d4-ad1f-7a5bb925a171` (app `6761808087`) only after you have read it and agree it
is accurate.

> **Rewritten twice on 2026-08-09.** The middle version derived its facts from `~/euphoriamobile`,
> on the reading that App Review tests that app. That is true of the *rejected* build, but
> `euphoriamobile` was abandoned on 2026-07-10 and **`euphoria-native` is the product** (C93). The
> answers below describe what will actually be submitted. Every line reference was read out of
> `~/euphoria-native` today, not inherited from the earlier draft.

## Evidence — all from `~/euphoria-native`

| Claim | Source |
|---|---|
| 3-day trial, counted in **active** days | `src/lib/store.ts:45` (`TRIAL_DAYS = 3`), `:529` (`activeDays.length > TRIAL_DAYS`) |
| 10 free Atlas messages | `src/lib/store.ts:97` (`FREE_ATLAS_MESSAGES = 10`), `:504` (`atlasLeft`) |
| Streak / XP / league never gated | `src/lib/entitlement.ts:58` ("Never gate streak, XP or league") |
| Gated features | `src/lib/entitlement.ts:60` — `lesson`, `guide`, `atlas`, `options`, `trade`, `market` |
| **No external payment path of any kind** | no Stripe, no web checkout, no external processor anywhere in `src/` |
| Apple IAP is the only purchase mechanism | `src/lib/purchases.ts:30` (`react-native-purchases`), `:97` (`IAP_ENABLED`) |

---

## The reply

> Hello, and thank you for the review.
>
> Answering the four questions in order.
>
> **1. Who are the users that will use the paid subscriptions in the app?**
>
> Individual consumers — members of the general public who are learning personal finance and
> investing. Our audience is primarily 18–25 year olds who are new to investing. There is no
> business, enterprise, education, or organisational tier. Anyone who downloads Euphoria from the
> App Store is an eligible user, and every user pays through the same in-app subscription. We do not
> sell to institutions and we have no B2B offering.
>
> **2. Where can users purchase the subscription that can be accessed in the app?**
>
> Only inside the app, and only through Apple In-App Purchase. There is no other way to obtain it.
> We do not sell subscriptions on our website, we do not accept payment through any other processor,
> and we have no external purchase flow, code redemption, or account-upgrade path outside of the
> app. There is nothing a user could have bought elsewhere.
>
> **3. What specific types of previously purchased subscriptions can a user access in the app?**
>
> None. Euphoria has never been released and has no existing customer base. No user has ever
> purchased anything from us through any channel. There is no legacy content, no imported
> entitlement, and no migration of previously purchased material. Every entitlement in the app
> originates from an Apple In-App Purchase made inside the app.
>
> **4. What paid content, subscriptions, or features are unlocked in your app that do not use
> in-app purchase?**
>
> None. Nothing paid is unlocked by any mechanism other than Apple In-App Purchase.
>
> For completeness, here is exactly what a user can access **without paying anything at all**:
>
> - A **3-day free trial** with full access to all learning content. The trial is counted in days of
>   actual use rather than calendar days, so a user who installs the app and returns a week later
>   has not lost any of it.
> - **10 free messages** with Atlas, our in-app learning assistant.
> - The **daily streak, XP, levels and the weekly league** remain free permanently and are never
>   locked, including after the trial ends. A user who never subscribes keeps their streak, their
>   XP, their level, and their league placement indefinitely.
>
> After the 3-day trial ends, the lesson content, written guides, Atlas, the options and derivatives
> lessons, the practice-trading simulator and the market screens require the subscription. All of
> them are unlocked solely by the Apple In-App Purchase.
>
> One clarification about the practice-trading feature, in case it is helpful: it is a simulator
> used for education. It uses fictional practice money only. Users cannot deposit funds, cannot
> withdraw funds, cannot buy or sell real securities, and no real brokerage account or real money is
> involved at any point. Euphoria is an educational product, not a brokerage, and we are not a
> registered broker-dealer or investment adviser.
>
> Please let us know if anything above needs more detail. Thank you for your time.

---

## Before you send — read these three

1. **Confirm the practice-trading paragraph reads true to you.** It is written from the code —
   `cash`, `positions` and `derivativeTrades` are local store state with no brokerage integration —
   and it is exactly the kind of claim App Review tests on a finance app. If any real-money or
   brokerage element exists that is not in this repo, that paragraph must change before sending.

2. **Do not add a paragraph claiming the 2.1(a) bugs are fixed.** Sign in with Apple is now
   implemented in this repo (C85, merged today), but the `applesignin` entitlement cannot be enabled
   on the App ID until the Program License Agreement is accepted (C86), and it cannot be verified on
   a simulator at all because simulator builds are ad-hoc signed (C89). Apple has never received a
   build containing the fix. Claiming a fix in a binary they cannot test is the one way this reply
   could hurt you.

3. **Question 4's answer is currently true but not yet transactable.** There is no Paid Applications
   Agreement on the account (C92), so no in-app purchase can complete today. The answer above
   describes the shipping design and is accurate as a description of the app; it becomes testable
   only once that agreement is signed. If a reviewer attempts a purchase before then it will fail —
   which is a stronger reason than any code issue to settle the agreement before resubmitting.

> **One thing this reply deliberately does not raise:** the next build will be a different codebase
> from the rejected one — a React Native rewrite rather than the Capacitor app reviewed in April.
> Apple does not require that to be disclosed, the app record is the same product, and volunteering
> it invites questions that the answers above already cover. Mentioned here only so the difference
> between this draft and the April build is not mistaken for an error.
