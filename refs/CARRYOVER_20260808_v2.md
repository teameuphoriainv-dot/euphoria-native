# CARRYOVER — paste this whole file into a fresh session

Written 2026-08-08 at the end of a long session. Everything below was VERIFIED in this repo or in
App Store Connect today, not remembered. Where it contradicts anything older, **this file wins.**

Continue work on **`~/euphoria-native`** — Euphoria, an Expo SDK 57 / expo-router / RN finance
education app for 18-25s, mascot **Atlas**. Content source of truth is **`~/euphoriaweb-current`**.

**Read `refs/MASTER_PLAN.md` §22 CORRECTIONS LOG from C76 to C85 before anything else.** That range
contains four findings that invalidate large parts of the older plan.

---

## THE FOUR THINGS THAT CHANGE EVERYTHING

### 1. THE APP IS REJECTED. Since April 9. (C77)

App Store Connect app **`6761808087`** "Euphoria: Learn to Invest" — **iOS 1.0 REJECTED**, submitted
Apr 8, rejected Apr 9, untouched for four months. Resolution Center thread still open.

**Guideline 2.1(a)**, Apple's words:
> (1) The app became unresponsive during onboarding process.
> (2) We were unable to complete signing up with Apple due to an error.

Reviewed on iPhone 17 Pro Max, iOS 26.4, active connection.

**Guideline 2.1(b)** — a business-model questionnaire that must be answered in writing before review
continues. Four questions; #4 asks what is unlocked WITHOUT In-App Purchase. **User agreed: the
assistant drafts it, the user approves, nothing sends without that.**

**Two reviewer screenshots are attached to the submission and have NEVER been opened.** They show
the screen where onboarding froze. That is the fastest route to bug 1.

### 2. THE BUNDLE ID WAS WRONG. Now fixed and verified. (C82, C83)

`app.json` built `com.euphoria.native`. Apple binds the listing to **`com.euphoriainv.euphoria`**.
No build from this repo could ever have been uploaded to that listing.

**Fixed and verified end to end today:** bundle id, App Group (`group.com.euphoriainv.euphoria`) on
both sides, and **`scripts/sim.sh` + `seed-trial.sh`**, which hardcoded the old bundle and would have
silently driven a dead app. Widget target survived `prebuild --clean`; appex embedded; App Group
container confirmed on disk.

> **`android.package` is STILL `com.euphoria.native`.** iOS and Android now diverge. Nobody has
> checked whether Google Play has a listing under it. Unresolved.

> **A new bundle id means a NEW data container.** The seeded test state (streak 3, xp 210,
> cash 5666.94) lives in the old one. It is preserved in
> `refs/BASELINE_STORE_20260808_pre_unit13.json`; **C70 has the restore that actually works.**

### 3. SIGN-IN IS A DEAD CONTROL, and it is what got you rejected. (C84, C85)

`src/app/auth.tsx:80-81` — "Continue with Apple" and "Continue with Google" both call `enter`, the
same local function the email form uses. **No `expo-apple-authentication`, no plugin, `applesignin`
entitlement count in the built app = 0.**

**The irony to learn from:** Unit 13's audit checked 177 `onPress` sites and found zero dead
controls, because it asked whether each handler *does something*. `enter` does. **What it does not
do is what its label promises.** A control can be live and still be a lie.

**DECISION (C85): implement Apple AND Google properly.** Full step-by-step plan is in C85. Read it.
Two traps in there: Apple returns name/email **exactly once** on first authorisation, and
`ERR_REQUEST_CANCELED` is a **cancel, not an error**. If time runs short the correct fallback is to
remove both buttons and ship email-only — **never a half-wired provider**, because offering Google
makes a working Sign in with Apple mandatory under Guideline 4.8.

### 4. IAP CREDENTIALS ARE IN HAND. (C76, C79, C80, C81)

| | |
|---|---|
| Issuer ID | `86cf89c1-ed5f-441d-9ae4-575aa7433937` |
| **IAP Key ID** | **`QP24DLK3HJ`** ("Euphoria IAP 2026-08") |
| `.p8` | `.secrets/SubscriptionKey_QP24DLK3HJ.p8` — gitignored, `chmod 600`. **Never print it** |
| dead April key | `V2D263NV4V` — `.p8` unrecoverable. Leave it, never reuse |
| **RevenueCat project** | **`320845df`** — its `com.euphoriainv.euphoria` matches Apple. **This is the right one** |

RevenueCat holds **four** near-identical projects (`89ced465`, `320845df`, `875fc097`, `6e8b425d`) —
almost certainly failed attempts to make the mismatched bundle id work. **The key has NOT been
uploaded yet.**

**C76:** `IAP_ENABLED` was `KEY.length > 0`, which was TRUE for a `test_…` placeholder — so the app
believed purchases were live and shipped a Buy button that could only fail. It now validates shape
(`appl_` prefix). `.env.local` still holds the placeholder; replace it with `320845df`'s real key.

---

## ENVIRONMENT — updated, do not use older values

```bash
export EUPHORIA_UDID=61F7E882-C226-4E97-9918-9BFF536B9A90   # "Euphoria QA" — every shell
```

- **Bundle id is now `com.euphoriainv.euphoria`.** Anything still saying `com.euphoria.native` is stale
- Metro on **8081**. Screen is **402 x 874 points**, 34pt bottom inset
- The simulator **shut itself down** mid-session once. If tools return unparseable output, check
  `xcrun simctl list devices` before theorising about a crash

**THE GATE — run after every unit:**
```bash
npx tsc --noEmit                       # clean
npx expo lint 2>&1 | grep problems     # 48 problems (3 errors, 45 warnings) -- BASELINE MOVED, see C66
python3 scripts/certify.py | tail -2   # ALL ROUTES PASS 3a
node scripts/check-digest-lessons.mjs
./scripts/sim.sh screen                # read the REAL screen
```
**45 warnings, not 47** (C66). If it rises, you caused it.

---

## WHAT WAS DONE TODAY (all committed, gate green on each)

Units **15** (widgets + notifications, all of 15a-15e), **10** (trade news gallery), **12** (quest
marks; crests and covers were already done), **13** (full revamp sweep) are CLOSED. Unit **16** has
7 App Store screenshots built by `scripts/store-shots.mjs` (reproducible, Nunito via a scoped
fontconfig). **League was redesigned** (C75).

**Still open:** Unit 16's icon audit + preview video · Unit 17 (retention, 7 phases, biggest
remaining) · Unit 14 (review, last) · §9c's gap audit · Unit 13 item 6's a11y agent pass · the
widget springboard render (C63 — simulator fault, not our code) · store shot 3 shows a losing
portfolio and the user chose to trade the practice account into profit and reshoot.

---

## HOW TO WORK — the four rules that actually matter

1. **Never mention session cost or context percentage.** Stated repeatedly by the user.
   `~/.claude/CLAUDE.md`'s COST directive does NOT apply to this project.
2. **LOOK AT THE SCREEN.** The a11y tree lied **four separate times today** — it omitted a whole
   widget-gallery row, hid a picker clipped off the screen edge, flattened a toggle subtitle, and
   showed nothing wrong with ragged news cards. Every one was caught by reading an image. `tsc`
   green + lint green + certify green has coexisted with real visual defects all session.
3. **ScreensDesign is MANDATORY before design decisions — but it is OUT OF DATA BUDGET.** It now
   returns "You have flown through your data budget". Per §0.2 rule 7, spec from the app's own
   language + HIG and **label it as such**. Do not bend banked research to fit.
4. **ASK MANY QUESTIONS, IN DETAIL, VIA `AskUserQuestion`.** The user has said *"I'd rather read a
   question than write a debrief"*. Put the evidence in the option descriptions — measured numbers,
   what it costs, what it forecloses. Recommend first, mark it `(Recommended)`. **Ask BEFORE
   building.** Twice today a plainly-worded question got "I'm not sure what this means" — when that
   happens, rewrite it in plain English with no jargon and ask again.

**Also true:** the user is authenticated in **App Store Connect and RevenueCat via Claude in Chrome**
and has authorised the assistant to use them. Screenshots of ASC pages time out — use
`get_page_text`, which works. Confirm before creating or generating anything; read freely.

---

## RECOMMENDED ORDER

1. **Open the two reviewer screenshots** on submission `4a0a0bdf-0f8e-48d4-ad1f-7a5bb925a171` →
   reproduce **bug 1**, the onboarding freeze
2. **C85's auth plan** — Apple first, then Google
3. Upload the `.p8` to RevenueCat **`320845df`**, put its `appl_` key in `.env.local`, verify a real
   sandbox purchase
4. **Draft the 2.1(b) reply**, show the user, send nothing without approval
5. Resubmit

**The single most valuable thing done today was opening App Store Connect.** Every unit in the
master plan assumed an unshipped app moving toward a first submission. It had already been submitted
and rejected, and the repo was building an identifier Apple has never seen. **Check reality before
trusting a plan.**
