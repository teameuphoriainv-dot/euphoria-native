# Guideline 2.1(b) — draft reply to App Review

**Status: DRAFT. Nothing has been sent.** Paste into the Resolution Center thread on submission
`4a0a0bdf-0f8e-48d4-ad1f-7a5bb925a171` (app `6761808087`) only after you have read it and agree it
is accurate.

Every number below was read out of the shipping code, not estimated:

| Claim | Source |
|---|---|
| 3-day trial, counted in **active** days | `src/lib/store.ts:45` (`TRIAL_DAYS = 3`), `src/lib/entitlement.ts` (`trialDaysUsed` = `activeDays.length`) |
| 10 free Atlas messages | `src/lib/store.ts:97` (`FREE_ATLAS_MESSAGES = 10`) |
| Streak / XP / league never gated | `src/lib/entitlement.ts:53-58` ("Never gate streak, XP or league") |
| Gated features | `src/lib/entitlement.ts:60` — `lesson`, `guide`, `atlas`, `options`, `trade`, `market` |

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
> None. Euphoria is a new app with no prior release and no existing customer base. No user has ever
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
> - A **3-day free trial** with full access to all learning content. The trial is counted in days
>   of actual use rather than calendar days, so a user who installs the app and returns a week
>   later has not lost any of it.
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
> We have also addressed the two issues raised under Guideline 2.1(a) in this build. Sign in with
> Apple is now fully implemented natively — the previous build's provider buttons did not invoke
> Apple's authentication framework, which is the error you encountered, and we apologise for it.
>
> Please let us know if anything above needs more detail. Thank you for your time.

---

## Before you send — two things I could not verify

1. **The practice-trading paragraph.** I wrote it from the code (`cash`, `positions`,
   `derivativeTrades` are all local store state with no brokerage integration), and it is the kind
   of thing App Review asks about for a finance app. **Confirm it reads true to you** — if there is
   any real-money or brokerage element I have not seen, that paragraph must change before sending.

2. **The last paragraph claims Sign in with Apple is fixed.** As of right now the code is written
   but **not yet in a build Apple can see**. Either send this reply *without* that paragraph now and
   let it unblock the 2.1(b) question on its own, or hold the whole reply until the build with
   working Apple sign-in is uploaded. Sending a claim about a build they cannot test is the one way
   this reply could hurt you.
