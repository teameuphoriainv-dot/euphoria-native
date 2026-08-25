# Configuration audit — ASC, RevenueCat, PostHog, backend

Measured 2026-08-24 against the live dashboards and the App Store Connect API. Every line here
was read off a real system, not inferred from a previous doc. Where something is unverified it
says so.

**Headline: PostHog is fine. RevenueCat had two bugs that would have taken money and given
nothing back. The App Store listing describes features that do not exist.**

---

## 1. STATUS BY SYSTEM

| System | State | Detail |
|---|---|---|
| **PostHog** | 🟢 working | Key set and `phc_`-shaped, events arriving (`Application Opened` 6h ago). Project `557266`. |
| **RevenueCat** | 🔴 two critical bugs, one fixed in code | Entitlement id mismatch (FIXED); dead IAP key uploaded (NEEDS YOU). |
| **App Store Connect** | 🔴 rejected, reason not retrievable by API | v1.0 `REJECTED`, review submission `UNRESOLVED_ISSUES` since 2026-04-08. |
| **Backend** | ⚪ not investigated | No Convex in this project. Lag is almost certainly client-side. |

---

## 2. WHAT I FIXED (committed)

| Commit | Fix |
|---|---|
| `8bc5855` | `ENTITLEMENT_ID` was `'pro'`; the dashboard identifier is **`Euphoria Pro`**. Client and server both index `entitlements.active[ENTITLEMENT_ID]`, so it was permanently `undefined`: **a purchase would complete, Apple would charge, and nothing would unlock.** Both regressions had the same bug in their fixtures and stayed green. New `entitlement-id-pin.mjs` pins the constant to the dashboard value. |
| `8ef63a7` | `onboarding.tsx` had **no analytics at all** — the one paid surface in the app reported nothing. Added `paywall_seen`. |

Nothing has ever been purchased (0 subscriptions, $0 MRR, "no live transactions to show"), which
is the only reason the entitlement bug cost nothing. It would have cost the first real customer.

---

## 3. WHAT ONLY YOU CAN DO

### 3.1 🔴 Replace the In-App Purchase key in RevenueCat

`app.revenuecat.com/projects/320845df/apps/appbf28770359` → "In-app purchase key configuration"

Currently holds **`V2D263NV4V.p8`** — the April key your own notes call *"dead, unrecoverable,
never reuse."* The live one is **`QP24DLK3HJ`**, at `.secrets/SubscriptionKey_QP24DLK3HJ.p8`.

RevenueCat's own warning on that page: with Purchases v5+ (StoreKit 2 — you run
`react-native-purchases` 10.7.0) *"transactions will fail to be recorded without this key being
set. This can result in users not accessing the purchases they are entitled to."*

### 3.2 🔴 Upload the App Store Connect API key to RevenueCat

Same page, "App Store Connect API" section — currently empty and marked Required. Without it
RevenueCat cannot verify products: both App Store products currently show status
**"Could not check"**. Use `.secrets/AuthKey_NJ4H5Q7248.p8`.

### 3.3 🟡 Wire Apple server-to-server notifications

Same page — "No notifications received". Without this RevenueCat learns about renewals,
cancellations and refunds late or not at all.

### 3.4 🟡 Set `REVENUECAT_SECRET_KEY` in EAS production

Absent today, so `_entitlement.ts` `decide()` allows everything and `/api/chat` — a billed Gemini
proxy — has no entitlement enforcement at all. **Do not set it before 3.1 and 3.2 are done**, or
you will start enforcing entitlements that RevenueCat cannot yet validate.

### 3.5 🔴 Get the App Review rejection text

Apple does not expose Resolution Center through the API. It is in the ASC web UI or the email
Apple sent. I could not reach it — ASC needs your Apple ID, and I will not enter credentials.

### 3.6 🟡 Clean up the duplicates

- **Four RevenueCat projects**: `89ced465`, `320845df`, `875fc097`, `6e8b425d`. `320845df` is the
  live one (7 of 8 recent customers). The other three are drift waiting to happen.
- **A stray empty App Store subscription group**, `22020910` "Monthly", alongside the real
  `22020937` "Euphoria Pro".

---

## 4. THE APP STORE LISTING DESCRIBES FEATURES THAT DO NOT EXIST

**PUSHED 2026-08-24 via the ASC API (`PATCH 200`), then read back from Apple and confirmed
byte-identical.** Description, promotional text and keywords are now accurate. The classroom pitch
was KEPT but rewritten to state that class management lives on the web — `onboarding.tsx:141`
confirms the web app ships a Classes tab with teacher class codes, so that claim is true as scoped.

Review notes were NOT changed: they still say "We are currently in beta", which is a Guideline 2.2
invitation. That needs a separate decision.

The table below is what WAS wrong, kept as the record of why.

| Claim in the live description | Reality |
|---|---|
| "games like **Budget Balancer** and Trend Master" | Budget Balancer is a **placeholder tile** (`games.tsx:42`). Only `money-2048`, `term-match`, `trend-master` exist. |
| "**Educators can create classes, assign lessons, and track progress**" | No class/roster/cohort concept anywhere in `src`. `onboarding.tsx:140` notes this is a **web app** feature. |
| "**Earn certificates** as you master each topic" | `you.tsx:490` records that the certificate row was **removed**. The remaining hits are a sprite name. |
| "**CFP-certified** content trusted by **2,000+ students**" | "CFP" appears only inside lesson prose. Unsubstantiated. |
| "the **#1** gamified way to learn to invest" | Unsubstantiated superlative ranking claim. |
| Review notes: "**We are currently in beta**" | Guideline 2.2 — Apple rejects apps presented as beta. |

Also: **screenshots exist only at 6.5" (`APP_IPHONE_65`)**. No 6.9". No app preview video.

### 4.1 Rewritten description — every claim verified against the code

> Investing, finally made simple. And actually fun.
>
> Euphoria teaches investing the way it actually sticks: by doing it. Every lesson is
> interactive. You make decisions, see outcomes, and build confidence before you ever risk a
> dollar.
>
> WHAT YOU GET
> • Interactive lessons on compound interest, ROI, P/E ratios, risk and reward, and more
> • A stock market simulator: paper-trade real market data with virtual money and zero risk
> • An AI coach that explains any move, any term, any time
> • Arcade games that teach the maths — Money 2048, Trend Master, Term Match
> • XP, streaks, achievements and leagues to keep you coming back
> • A learning path built around your goals, experience and pace
> • Plain-English guides on saving, credit, taxes, housing and staying safe with money
>
> 100% educational. All trading is simulated with virtual currency. No real money, ever.
>
> Start free. Upgrade to Euphoria Pro anytime for unlimited access.

### 4.2 Rewritten promotional text (161/170)

> Learn investing by doing. Interactive lessons, a market simulator with real data, and an AI
> coach that explains every move. Virtual money, zero risk. Start free.

### 4.3 Keywords — ASO pass (99/100)

Current (97): `money,stock,trading,paper,practice,virtual,budget,portfolio,ai,coach,education,teen,wealth,saving`

Proposed (99): `money,stocks,trading,simulator,paper,practice,budget,portfolio,market,ai,teen,student,literacy,risk`

Reasoning — Apple indexes **name + subtitle + keywords** together, so nothing should repeat
across them. Name gives `euphoria, learn, invest`; subtitle gives `personal, finance, beginners`.

- **Added `simulator`** — the highest-intent term for paper trading, and it was missing entirely.
- **Added `market`, `student`, `literacy`, `risk`** — all describe what the app is and none
  duplicate the name or subtitle.
- **Dropped `education`** — the app is already in the EDUCATION category, and category is a
  ranking signal on its own.
- **Dropped `virtual`, `coach`, `wealth`, `saving`** — `simulator`/`paper` cover the first,
  `ai` covers the second, and the last two are low-intent for this category.
- `stock` → `stocks`: Apple's stemming is inconsistent and the plural has the higher volume.

### 4.4 Review notes — remove the beta language

Drop "We are currently in beta" and "Community features are coming in a future update". Neither
helps you and the first actively invites Guideline 2.2.

---

## 4.5 RUNTIME: THE OFFERING HAS NO PACKAGES

On launch the app logs, in red:

    [iap] configured but the current offering has NO packages. Check that
    euphoria_pro_monthly and euphoria_pro_yearly exist in App Store Connect and are attached
    to the current offering in RevenueCat.

`.env.local` and EAS production carry the SAME RevenueCat key (`appl_OGtY…KGnvkg`), so this is not
a dev-only configuration.

**HONEST CEILING: this does not by itself prove a production bug.** The iOS Simulator cannot load
StoreKit products from App Store Connect without a StoreKit configuration file, so an empty
offering here is partly expected. What IS independently true: both products are `READY_TO_SUBMIT`
and have never been approved, and the ASC API key is not uploaded to RevenueCat (§3.2), so
RevenueCat reports their status as "Could not check". Settle it on a real device with a sandbox
account, after §3.1 and §3.2 are done.

Related and confirmed on screen: the paywall renders a **hardcoded `$79.99`** rather than
`pkg.product.priceString` — `refs/NEXT_SESSION.md` §6.4. An Indian user sees $79.99 and is charged
₹7,900.

---

## 5. THE TESTFLIGHT LAG

You said the app is "still pretty laggy on TestFlight". Two things worth stating before anyone
changes a backend:

1. **There is no Convex in this project.** The three grep hits are curriculum files using
   "convex" in the finance sense. The backend is EAS Hosting (managed Cloudflare Workers) serving
   `src/app/api/*+api.ts`, plus Supabase.
2. **Backend latency and UI lag are different symptoms.** Backend latency shows up as slow *data* —
   a chart that takes two seconds to fill. Lag in scrolling, tapping and animation is the JS
   thread. `refs/NEXT_SESSION.md` §4.1 documents exactly that class of problem, and its numbers
   were all **simulator-measured**. Nobody has profiled a release build on a real device.

**Do that first.** Migrating a backend to fix a render problem would cost weeks and change nothing.

---

## 6. UNVERIFIED — do not treat as established

- ~~`paywall_seen` has not been observed firing.~~ **VERIFIED 2026-08-24.** Launched the dev
  client, tapped the "Free trial · day 3 of 3" row on Home (a real surface, not a deep link),
  the paywall rendered, backgrounded the app to force a flush, and `paywall_seen` appeared in
  PostHog "a few seconds ago" — the first time it has ever fired in project 557266.
- **The app→project mapping is circumstantial.** `320845df` has the right bundle id, matching SDK
  version, and 7 of 8 recent customers — but the SDK key was not fingerprint-matched (revealing it
  was blocked by a permission classifier).
- **`SUPABASE_JWT_SECRET` is unset in production**, so `_identity.ts` returns `null` for every
  request: there are no verified users server-side and the rate limiter's classroom exemption
  never fires. Consequences not traced further.
- **`Ev.install` and `Ev.trialStarted`** are defined in the `Ev` map and called from nowhere in
  `src`. They cannot fire by construction.
