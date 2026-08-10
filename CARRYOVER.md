# CARRYOVER — paste this whole file into a fresh session

Written 2026-08-10. Everything below was VERIFIED today in this repo, on the simulator, or in a live
dashboard. Where it contradicts anything older, **this file wins.**

Continue work on **`~/euphoria-native`** — Euphoria, Expo SDK 57 / expo-router / RN finance education
for 18-25s, mascot **Atlas**. Content source of truth is `~/euphoriaweb-current`.

**Read `refs/MASTER_PLAN.md` §22 CORRECTIONS LOG C95 → C111 before anything else.**

---

## THE THREE FACTS THAT KEEP GETTING RE-DERIVED WRONG. Do not re-litigate.

1. **`~/euphoria-native` IS THE PRODUCT.** `~/euphoriamobile` is a Capacitor app, submitted
   2026-04-08, rejected 04-09, abandoned. Its local commits dated Aug 8 were written by an assistant
   verifying C91 and were never pushed.
2. **Bundle id is `com.euphoriainv.euphoria`** (C94). `android.package` deliberately stays
   `com.euphoria.native` — Google Play is a separate listing nobody has checked.
3. **App Group is `group.com.euphoriainv.euphoria`** in all three places: `app.json`,
   `src/lib/widget.ts`, `targets/widget/index.swift`.

---

## WHAT CHANGED TODAY

**Unit 17 is 6 of 8 sections done** — 17a research (was already done), **17b** telemetry, **17d**
dismissal offer, **17e** involuntary churn, **17f** activation, **17h** partial. Open: **17c** (needs
a discounted product) and **17g** (pricing decisions, yours not mine).

Plus, outside Unit 17:

- **App icon was EXPO'S LOGO** (C95). `CFBundleIconName` was literally `expo`. Now a real iOS 26
  layered icon, rebuildable via `scripts/make-icon.mjs`.
- **Google sign-in is real** (C96) — iOS OAuth client created, button renders, verified on screen.
- **Vendor buttons** (C97) — Apple's and Google's own components, not lookalikes.
- **Portfolio chart bug** (C100) — `snapshot()` omitted option premium while `portfolioValue()`
  counted it, so anyone who opened a contract carried a permanent phantom loss. Store shot 3 was a
  screenshot of that defect.
- **Accessibility** (C101) — 8 controls were silent to VoiceOver; icon-only unlabelled count 6 → 0.
- **API routes DEPLOYED** (C108) — `https://euphoria-native.expo.app`.

---

## STATE OF THE OUTSIDE WORLD, verified today

| | |
|---|---|
| **PLA** | ✅ **SIGNED** (Free Apps Agreement active, effective Aug 9). This unblocked everything. |
| **Sign In with Apple** | ✅ Enabled on App ID `com.euphoriainv.euphoria` (`G8VX7UFD2L`), confirmed visually |
| **Paid Applications Agreement** | ❌ status `New` = unsigned. Gated behind "update your legal entity information". **No IAP can transact until this is done.** |
| **EU trader status** | ❌ Not provided. DSA — apps get removed from the EU store |
| **Age-rating social questions** | ❌ Pending in App Information |
| **App Privacy** | ⚠️ **NOW INACCURATE** — analytics was added today and must be declared |
| **Resubmit button** | Still greyed out even with the PLA signed |
| **Reply to App Review** | ✅ Works. `refs/APPLE_2.1b_REPLY_DRAFT.md` awaits approval — **nothing sends without it** |

**Account Holder is RAMYA SMITHA CHILAMANTULA, team `9SS423KXF5`.** Only she can clear the four
above. **Never accept an agreement on her behalf.**

---

## CREDENTIALS AND THEIR TRAPS

- **RevenueCat key is REAL and IN** (C106) — project `320845df`, app `appbf28770359`. `IAP_ENABLED`
  is now true. **It lives only in gitignored `.env.local`, so C106 is its only record.**
- **The `.p8` is the WRONG TYPE for the empty slot.** RevenueCat's App Store Connect API slot wants
  `AuthKey_XXXXXXXXXX.p8`; `.secrets/` holds `SubscriptionKey_QP24DLK3HJ.p8`, an in-app-purchase
  key. Different things. Do not upload it there.
- **The IAP slot already holds `V2D263NV4V.p8` and RevenueCat reports "Valid credentials"** —
  contradicting the old note that the April key is dead. **Resolve which is true before touching a
  working credential.**
- **EAS: there is NO team Expo account.** Signing in with the team GitHub lands on
  `signup?reason=onboarding-required` — it would CREATE a third empty account. Expo accounts are
  separate from GitHub orgs. Project is `@s-k-28/euphoria-native`; Expo supports transfer later.
- **PostHog has no account yet.** `ANALYTICS_ENABLED` shape-checks `phc_`, so every event in 17b,
  17d and 17f is currently a no-op. **Five phases of instrumentation are recording nothing.**

---

## THE FOUR API KEYS — the last thing blocking working features

`GEMINI_API_KEY` · `POLYGON_API_KEY` · `ALPHAVANTAGE_API_KEY` · `TRADIER_TOKEN` exist **nowhere** in
the repo. The deployment answers honestly and uselessly:

```
GET https://euphoria-native.expo.app/api/market?syms=NVDA  ->  503 {"error":"not_configured"}
```

Set with `eas env:create --environment production --name X --value Y`, then redeploy. Until then
**Atlas, market data and options are reachable but dead in any real build.** See `refs/DEPLOY.md`.

---

## ENVIRONMENT

```bash
export EUPHORIA_UDID=61F7E882-C226-4E97-9918-9BFF536B9A90   # "Euphoria QA" — every shell
```

Metro on 8081. Screen 402 x 874 pt. **The simulator shut itself down twice today** — run
`xcrun simctl list devices` before theorising about a crash.

**THE GATE — after every unit:**
```bash
npx tsc --noEmit                       # clean
npx expo lint 2>&1 | grep problems     # 48 problems (3 errors, 45 warnings) — C66 baseline
python3 scripts/certify.py | tail -2   # ALL ROUTES PASS 3a
node scripts/check-digest-lessons.mjs
./scripts/sim.sh screen                # read the REAL screen
```

**Regression checks added today — run them if you touch the logic:**
```bash
node scripts/portfolio-snapshot-regression.mjs   # chart vs headline (C100)
node scripts/billing-retry-regression.mjs        # 17e grace window (C105)
node scripts/a11y-audit.mjs                      # unlabelled controls (C101)
node scripts/make-icon.mjs                       # rebuild the app icon (C95)
./scripts/capture-screens.sh                     # all 26 route screenshots (C111)
```

---

## HOW TO WORK — the rules that earned their place today

1. **Never mention session cost or context percentage.** `~/.claude/CLAUDE.md`'s COST directive does
   NOT apply to this project.
2. **LOOK AT THE SCREEN.** Today it caught: a hardcoded "LESSON 1" that should have been the real
   number, and it is how 17d was confirmed at all. `tsc` green + lint green has coexisted with real
   visual defects all along.
3. **ScreensDesign is BACK** — the data budget reset. It is MANDATORY for design work. Read the
   SCREEN, never the flow description. Report hit rate across ≥4 apps. State transferability.
4. **ASK VIA `AskUserQuestion`, and always end a turn with one.** Put the evidence in the option
   descriptions. If a question gets confusion, rewrite it in plain English with no jargon.
5. **The user is authenticated in App Store Connect, RevenueCat and Google Cloud via Claude in
   Chrome.** ASC screenshots time out — use `get_page_text`. **Claude in Chrome runs its own Chrome
   profile**: a login the user does elsewhere is NOT visible to it.
6. `gh` has two accounts. **`teameuphoriainv-dot` owns the repos**; `s-k-28` fails with a bare
   "Repository not found". **12 commits are unpushed.**

---

## OPEN WORK

- **17c** — trial→annual reward offer. Blocked on a discounted product (needs Paid Apps Agreement).
- **17g** — pricing. $9.99/mo and $79.99/yr stay (C31). Open: introductory pricing, annual-vs-monthly
  framing, whether 3 days is right. **§16a: none of this framing may appear in an App Store asset.**
- **Screen audit** — 1 of 26 screens done. Harness, comparator set, worked example and per-screen
  method in `refs/audit/20260810/FINDINGS.md`. **The peer group is Education apps, not brokerages —
  only TradingView is Finance in the top ten at $500k/mo+.**
- **17d copy is four lines** where the evidence says the second screen must be drastically simpler.
- **ASO draft** (`refs/ASO_LISTING_DRAFT.md`) — never reviewed by the user.
- **Unit 16** — preview video, icon audit. **The UIcon set has no warning/alert glyph** (C105).
- **Unit 14** — final review, deliberately last.
- **`stocks.ts` is a hardcoded mock table.** Prices never move, so a paper portfolio cannot gain or
  lose from the market. Bounds what the Trade tab can teach. "Wire to live quotes in Phase 16."
- **`lib/people.ts` is fabricated** and says so. The league races invented rivals. Fine today;
  an App Review risk and a §0.4 constraint on any social-proof stat.

---

## THE LESSON THAT COST THE MOST, restated

C82 saw App Store Connect and `app.json` disagree and assumed the repo was wrong. C90 inverted it.
C93 inverted it again. Each step reasoned correctly from what was in front of it and each was missing
one cheap check.

**Today added two more of the same shape.** The `.p8` looked like the key RevenueCat wanted — it is a
different key type, and only the filename hint said so. The team GitHub login looked like a sign-in —
the URL said `signup`. Both were caught by reading the actual artefact instead of the plausible story.

**ENUMERATE THE READINGS BEFORE ACTING ON ONE.** When a fact keeps inverting, stop re-deriving it and
go find the authority.
