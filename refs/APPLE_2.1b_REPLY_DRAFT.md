# Guideline 2.1(b) — draft reply to App Review

**Status: DRAFT. Nothing has been sent.** Paste into the Resolution Center thread on submission
`4a0a0bdf-0f8e-48d4-ad1f-7a5bb925a171` (app `6761808087`) only after you have read it and agree it
is accurate.

> **This draft was rewritten on 2026-08-09.** The previous version derived every number from
> `~/euphoria-native`. **App Review tests `~/euphoriamobile`** (C90), and the two apps differ on
> almost every fact the reply asserts. The old draft would have told Apple, in writing, that there
> is a 3-day trial and 10 free assistant messages. Neither exists in the reviewed app. Every claim
> below is now read out of `~/euphoriamobile`.

## Evidence — all from `~/euphoriamobile`, the reviewed binary

| Claim | Source |
|---|---|
| **No free trial of any kind** | no trial constant exists in `src/` |
| 3 lessons/day, 3 games, basic portfolio, no AI Coach, limited analytics | `src/features/payments/constants.ts:31-37` (`FREE_FEATURES`) |
| 3 free AI assistant messages **per day** | `src/shared/components/GlobalAIAssistant.tsx:18` (`FREE_DAILY_LIMIT = 3`) |
| 2 free hints | `src/hooks/useHints.ts:5` (`FREE_HINTS = 2`) |
| Pro is $9.99/mo and $99.99/yr | `src/features/payments/constants.ts:1-19` (`PLANS`) |
| Trade tab shows "Market Data Coming Soon" **to everyone** | `src/pages/Trade.tsx:600,614` |
| Community shows "Community Coming Soon" | `src/pages/Community.tsx:135` |
| iOS purchases route to Apple IAP only | `src/pages/Index.tsx:185-190`, `Profile.tsx:67`, `PaywallGate.tsx:40` |
| No brokerage, no real money | no `alpaca`/`plaid`/brokerage integration anywhere in `src/` |

---

## The reply

> Hello, and thank you for the review.
>
> Answering the four questions in order.
>
> **1. Who are the users that will use the paid subscriptions in the app?**
>
> Individual consumers — members of the general public learning personal finance and investing,
> primarily 18–25 year olds who are new to the subject. There is no business, enterprise, education,
> or organisational tier. Anyone who downloads Euphoria from the App Store is an eligible user and
> every user pays through the same in-app subscription. We do not sell to institutions and we have
> no B2B offering.
>
> **2. Where can users purchase the subscription that can be accessed in the app?**
>
> **In the iOS app, only through Apple In-App Purchase.** There is no other purchase path available
> to any user of the iOS app.
>
> In the interest of being completely transparent: Euphoria also exists as a web application, and on
> the web a subscription is processed by Stripe. Because the iOS app and the website are built from
> one shared codebase, that web payment code is present in the project — so we want to state plainly
> how it is handled, rather than have it look undisclosed.
>
> On iOS that path is unreachable. Every route to it is closed at the platform boundary:
>
> - Any navigation to the upgrade screen is intercepted on native and opens the Apple In-App
>   Purchase sheet instead of the web checkout, before the checkout screen can render.
> - The "Manage subscription" control, which on web opens the Stripe billing portal, is not rendered
>   on iOS at all.
> - The upgrade button inside locked-feature overlays is not rendered on iOS; that overlay instead
>   directs the user to the in-app purchase sheet.
>
> There is no button, link, or navigation path anywhere in the iOS app that leads a user to any
> purchase method other than Apple In-App Purchase, and the app does not mention or advertise one.
> We are happy to point your engineers to the exact lines that enforce this if that would help.
>
> **3. What specific types of previously purchased subscriptions can a user access in the app?**
>
> None. No user has ever purchased a subscription from us through any channel — the app has never
> been released, and the web application has no paying customers. There is no legacy content, no
> imported entitlement, and no migration of previously purchased material.
>
> **4. What paid content, subscriptions, or features are unlocked in your app that do not use
> in-app purchase?**
>
> None on iOS. Nothing paid is unlocked by any mechanism other than Apple In-App Purchase.
>
> For completeness, here is what a user can access **without paying anything at all**. There is no
> free trial; the free tier is permanent:
>
> - **3 lessons per day**, every day, at no cost
> - **3 of the 12 investment games**
> - **3 messages per day** with our AI learning assistant
> - **2 free hints**
> - A basic portfolio view and basic analytics
> - Daily streak, XP and achievements
>
> The Pro subscription ($9.99/month or $99.99/year) removes the daily lesson limit, unlocks the
> remaining games, the full AI market simulation, the AI Coach, advanced portfolio analytics, and
> unlimited XP. All of it is unlocked solely by the Apple In-App Purchase.
>
> Two notes that may save your team time during review:
>
> - The **Trade** tab and the **Community** tab currently display "Coming Soon" screens to every
>   user, free and paid alike. Our live market data is not production-ready and we chose to hold
>   those features rather than ship them incomplete. They are not paywalled and they are not broken.
> - The practice-trading features are an educational simulation using fictional practice money only.
>   Users cannot deposit funds, cannot withdraw funds, and cannot buy or sell real securities. There
>   is no brokerage integration of any kind. Euphoria is an educational product, not a brokerage,
>   and we are not a registered broker-dealer or investment adviser.
>
> Please let us know if anything above needs more detail. Thank you for your time.

---

## Before you send — read these three

1. **Decide how you want to handle the Stripe disclosure.** The reply above discloses it directly.
   That is the safer choice: Apple asked these questions precisely to surface undisclosed purchase
   paths, and a reviewer who finds Stripe code you did not mention will treat it far more harshly
   than one you told first. **The alternative is to remove Stripe from the native bundle entirely**
   so the question cannot arise — a real code change, and the cleanest long-term answer. Do not
   simply delete the paragraph and say nothing; that is the one version of this reply that could
   genuinely hurt you.

2. **Do not add a paragraph claiming the 2.1(a) bugs are fixed until a build with the fixes is
   uploaded.** Both fixes are real and verified in `~/euphoriamobile` (C91) — the onboarding
   step-clamp and the native Sign in with Apple plugin — but Apple has never received a build
   containing either. Claiming a fix in a binary they cannot test invites a second rejection.

3. **There is a price mismatch to resolve first.** `constants.ts` prices the annual plan at
   **$99.99/yr**, but `NativePaywall.tsx:83` falls back to **$59.99/yr** when RevenueCat offerings
   fail to load. An iOS user hitting that fallback sees a price that is not what the App Store will
   charge. The reply above quotes $99.99. **Confirm which is correct and make the App Store product
   price, the RevenueCat offering and both constants agree before sending**, or the reply becomes
   inaccurate the moment a reviewer sees the other number.

> **Account-side, unchanged:** the app cannot be resubmitted until the Program License Agreement is
> accepted, and no in-app purchase can transact at all until the Paid Applications Agreement is
> signed (C92). This reply can be sent to the Resolution Center thread independently of both.
