# CARRYOVER — paste this whole file into a fresh session

Written 2026-08-11, replacing the 2026-08-10 file. Everything here was VERIFIED in this repo, on the
simulator, or in a live dashboard on the date given. **Where this contradicts anything older,
including §22 entries written before today, this wins.**

Continue work on **`~/euphoria-native`** — Euphoria, Expo SDK 57 / expo-router / RN finance education
for 18-25s, mascot **Atlas**. Content source of truth is `~/euphoriaweb-current`.

**Read `refs/MASTER_PLAN.md` §22 C113 before touching code.** It is the most useful thing in the log.

---

## THE THREE FACTS THAT KEEP GETTING RE-DERIVED WRONG. Do not re-litigate.

1. **`~/euphoria-native` IS THE PRODUCT.** `~/euphoriamobile` is a Capacitor app, submitted
   2026-04-08, rejected 04-09, abandoned.
2. **Bundle id is `com.euphoriainv.euphoria`** (C94). `android.package` deliberately stays
   `com.euphoria.native` — Google Play is a separate listing nobody has checked.
3. **App Group is `group.com.euphoriainv.euphoria`** in `app.json`, `src/lib/widget.ts` and
   `targets/widget/index.swift`.

---

## WHAT THE PREVIOUS CARRYOVER GOT WRONG

Corrected 2026-08-11, by reading the artefacts rather than the summary:

| It said | Reality |
|---|---|
| "Read §22 CORRECTIONS LOG C95 → C111" | The log ENDED at C106. C100-C105 and C107-C111 were never written. |
| "12 commits are unpushed" | 0. `origin/main` matched HEAD exactly. |
| `.env.local`: "this is a Test Store key (`test_...`)" | The value starts `appl_`. Stale since C106 swapped it. |

§22 was restored in `315ffa2` from the eleven commit bodies. **A provenance header says the COMMIT
BODY wins where it and the reconstruction disagree.** §22 now holds C1→C114.

---

## §22 C113 — THE LESSON THAT MATTERS MOST

> **A green gate means the things it checks are fine. It does not mean the number on the screen is
> true.**

Four review passes (security, CodeRabbit, ECC checklist, deep code review) over one day's work found
**six real defects**, several in code written that same day to fix that exact class of bug. `tsc`,
lint at the C66 baseline, `certify.py` and six regressions all ran green FOUR TIMES over a Trade tab
that would have rendered `avg $296.00, +300.0%` on a position that had not moved.

C109 said LOOK AT THE SCREEN, and that catches what renders. C113 adds: **for anything computing a
number a user reads as their own money, get a second reader.** Every finding was invisible to both a
green gate and a screenshot, because the screen rendered the number perfectly and the number was
wrong.

---

## OPERATIONAL TRAPS — each of these cost real time today

- **`gh auth` REVERTS between pushes.** The active account returns to `s-k-28`, which cannot see the
  repo and fails with a bare "Repository not found". Run
  `gh auth switch --user teameuphoriainv-dot` **before every push**.
- **`npm run check` now exists** and runs all six pinning scripts. Before today they were reachable
  only by remembering an exact `node scripts/...` path, so the re-syncs they guard would have landed
  green.
- **`priceOf()` IS THE SINGLE CANONICAL MARK.** Execution, `portfolioValue()`, `snapshot()` and the
  Trade row all use it. **If you make valuation live, make EXECUTION live in the same commit** or
  every position percentage silently becomes fiction. This was an armed defect until `1d4385b`.
- **`src/lib/cost-basis.ts` is the ONE copy** of the holdings math; `cost-basis-regression.mjs`
  imports it (Node 24 strips types). **Keep that file erasable-syntax-only** — an enum or namespace
  breaks the script's import.
- **`eas env:create` is DEPRECATED** on eas-cli 21.7.1. Use `eas env:set`.
- **Polygon is now `massive.com`.** `polygon.io` redirects to a signup page.
- **The Gemini key ALREADY EXISTS.** `team.euphoriainv@gmail.com` → project **Euphoria**
  (`gen-lang-client-0444883331`) → **"Euphoria Backend Key"**. Do not mint a new one; four Google
  accounts are signed into that Chrome profile and only that one is right.
- **The EAS CLI is authenticated as `s-k-28` / `siddarthakodithyala28@gmail.com`** — a different
  identity again. C108 has the ownership question.
- **The simulator shuts itself down repeatedly.** Run `xcrun simctl list devices` before theorising
  about a crash. It happened four times today.

---

## STATE OF THE OUTSIDE WORLD

| | |
|---|---|
| **PLA** | ✅ SIGNED (Free Apps Agreement, effective Aug 9) |
| **Sign In with Apple** | ✅ Enabled on App ID `com.euphoriainv.euphoria` (`G8VX7UFD2L`) |
| **Paid Applications Agreement** | ❌ status `New` = unsigned. **No IAP can transact.** |
| **EU trader status** | ❌ Not provided — DSA, apps get removed from the EU store |
| **Age-rating social questions** | ❌ Pending in App Information |
| **App Privacy** | ⚠️ INACCURATE — analytics was added and must be declared |
| **Reply to App Review** | `refs/APPLE_2.1b_REPLY_DRAFT.md` awaits approval. **Nothing sends without it.** |

**Account Holder is RAMYA SMITHA CHILAMANTULA, team `9SS423KXF5`.** Only she can clear those four.
**Never accept an agreement on her behalf.**

---

## CREDENTIALS AND THEIR TRAPS

- **RevenueCat key is REAL and IN** (C106) — project `320845df`, app `appbf28770359`. It lives only
  in gitignored `.env.local`, so C106 is its only record.
- **The `.p8` is the WRONG TYPE for the empty slot.** RevenueCat's App Store Connect API slot wants
  `AuthKey_XXXXXXXXXX.p8`; `.secrets/` holds `SubscriptionKey_QP24DLK3HJ.p8`, an in-app-purchase key.
- **The IAP slot already holds `V2D263NV4V.p8` and reports "Valid credentials"** — contradicting the
  old note that the April key is dead. Resolve before touching a working credential.
- **PostHog has no account.** `ANALYTICS_ENABLED` shape-checks `phc_`, so every event in 17b, 17d and
  17f is a no-op. Five phases of instrumentation are recording nothing.
- **`assets/images/google-g.png`** was fetched 2026-08-11 from Google's documented branding URL
  (`developers.google.com/identity/images/g-logo.png`), SHA-256 `d1ce9c2a…`. The security review
  cleared it. Provider buttons are now **custom-but-compliant**, which reverses C97 deliberately and
  at the user's direction — see `src/components/provider-button.tsx` for both disclosed deviations.

---

## THE FOUR API KEYS — still the biggest single blocker

`GEMINI_API_KEY` · `POLYGON_API_KEY` · `ALPHAVANTAGE_API_KEY` · `TRADIER_TOKEN` exist nowhere.

```
GET https://euphoria-native.expo.app/api/market?syms=NVDA  ->  503 {"error":"not_configured"}
```

**Atlas, market data and options are reachable but dead in any real build.** Set with
`eas env:set production --name X --value Y --visibility secret --non-interactive`, then redeploy.
Massive and Tradier need accounts/logins the assistant cannot create; AlphaVantage needs an email
submitted to a third party.

---

## ENVIRONMENT AND THE GATE

```bash
export EUPHORIA_UDID=61F7E882-C226-4E97-9918-9BFF536B9A90   # "Euphoria QA" — every shell
```

Metro on 8081. Screen 402 x 874 pt.

```bash
npx tsc --noEmit                       # clean
npx expo lint 2>&1 | grep problems     # 48 problems (3 errors, 45 warnings) — C66 baseline
python3 scripts/certify.py | tail -2   # ALL ROUTES PASS 3a
npm run check                          # all six pinning scripts
node scripts/a11y-audit.mjs            # 1 unlabelled = SpringPressable docstring, a known false positive
./scripts/sim.sh screen                # READ THE REAL SCREEN
```

`./scripts/capture-screens.sh` re-shoots all 31 routes. `./scripts/seed-trial.sh 4 false` = expired
trial. `sim.sh` answers in TEXT so screenshots stay rare — but C113 is about when text is not enough.

---

## WHAT SHIPPED 2026-08-11 (31 commits, all pushed)

- **§22 restored** 100 → 114 corrections, C1→C114 contiguous
- **Screen audit: 9 of 26 done** — home, learn, lesson, trade, auth, onboarding, start, league, you.
  Method and comparator sets in `refs/audit/20260810/FINDINGS.md`
- **Shipped:** lesson-intro key-term previews · 60 approved unit names (`refs/UNIT_NAMES_DRAFT.md`) ·
  streak on Learn · cost basis and true returns · Atlas asks the onboarding questions · one
  `ProviderButton` for both providers · open contracts on Trade · league promotion tinting ·
  best streak · four a11y labels
- **Copy corrected (all user-approved, §0.7):** 17d trimmed to three lines · "Suggested" →
  "More stocks" · **"Save your streak, XP…" → "Your progress stays on this device."**

### Six real defects fixed, none on any list when the day started

| | |
|---|---|
| `STOCKS[sym].chg` shown as the user's return | every user saw +3.1% on NVDA |
| Five false chart range labels | "+$3.28 **today**" for a two-day-old gain |
| $781 missing from a total that counted it | open contracts invisible |
| Partial cost basis | invented **+300%**, then again via a basis of exactly 0 |
| Live-vs-static price | armed by the API keys — disarmed in `1d4385b` |
| VoiceOver read every onboarding question twice | opacity-0 ghost text in the a11y tree |

---

## OPEN WORK

- **17 captured screens unaudited.** Next by priority: `digest`, `chat`, `options`, `stock`.
- **The four API keys** — blocked on the user.
- **17g pricing** — never touched. $9.99/mo and $79.99/yr stay (C31). §16a bars this framing from any
  App Store asset.
- **`lib/people.ts` is FABRICATED and says so.** The league races invented rivals. The LEAGUE audit
  found Duolingo gates its leaderboard behind 7 lessons and shows PLACEHOLDER BARS instead of names —
  three options recorded, all the user's call.
- **The You tiles all count backwards.** Best streak is done; badges need authored names (§0.7).
- **`stocks.ts` is a hardcoded mock table.** Prices never move, so a paper portfolio cannot gain or
  lose from the market. Bounds what Trade can teach. "Wire to live quotes in Phase 16."
- **Auth creates no account.** Real OAuth runs, the identity is written to a local profile,
  `currentUserId()` returns null. Copy is now honest; the friction still buys the user nothing.
- **`store.ts` is 838 lines**, over ECC's 800 threshold. `portfolio-snapshot` and `billing-retry`
  regressions still re-implement their rules — the Node 24 trick used for cost-basis applies.
- **Unit 16** — preview video, icon audit. The UIcon set has no warning/alert glyph (C105).
- **Unit 14** — final review, deliberately last.

---

## HOW TO WORK

1. **Never mention session cost or context percentage.** `~/.claude/CLAUDE.md`'s COST directive does
   NOT apply to this project.
2. **LOOK AT THE SCREEN**, and for anything computing money, **get a second reader** (C113).
3. **ScreensDesign is MANDATORY for design work.** Read the SCREEN, never the flow description.
   Report hit rate across ≥4 apps and say so when the bar is not met. Robinhood, Zogo, Stash and
   Greenlight are NOT in the dataset — say "no strong match" rather than substituting.
4. **ASK VIA `AskUserQuestion`, and end every turn with one.** Put the evidence in the option
   descriptions.
5. **§0.7: never invent product copy.** Draft options and let the user choose — the C103 procedure,
   used four times today.
6. The user is authenticated in App Store Connect, RevenueCat and Google Cloud via Claude in Chrome.
   **ASC screenshots time out — use `get_page_text`.** Chrome runs its own profile; a login elsewhere
   is not visible to it.
