# CARRYOVER — paste this whole file into a fresh session

Written 2026-08-09. **This supersedes `refs/CARRYOVER_20260808_v2.md`, whose headline finding was
WRONG.** Everything below was verified against the repos and git log today.

---

## READ THIS FIRST: THERE ARE TWO REPOS, AND THE PREVIOUS SESSION CONFUSED THEM

| repo | bundle id | role |
|---|---|---|
| **`~/euphoriamobile`** | (owns `com.euphoriainv.euphoria`) | **THE SHIPPING APP.** ASC app `6761808087` "Euphoria: Learn to Invest" is THIS repo's listing. It is where the rejection lives and where the fixes are landing |
| **`~/euphoria-native`** | `com.euphoria.native` (iOS + Android) | The repo this plan describes. **Legitimately a different bundle id.** Not the submitted app |

**The mistake to not repeat.** A previous session found ASC's bundle id (`com.euphoriainv.euphoria`)
differed from `euphoria-native`'s `app.json` (`com.euphoria.native`) and concluded **the repo was
wrong**. It never tested the other reading — that the listing belongs to a different codebase. It
does. **C90 reverted the change; C82/C83 are void.** iOS bundle, Android package and App Group are
all back to `com.euphoria.native`.

That session also ran a `prebuild --clean` on the wrong premise, which **wiped the simulator's data
container**. The seeded state is preserved in `refs/BASELINE_STORE_20260808_pre_unit13.json`, and
**C70 records the restore that actually works** (terminate → write BOTH the manifest inline value
and the spill file → launch).

---

## THE REJECTION IS `euphoriamobile`'s, AND IT IS BEING HANDLED THERE

**C91: both 2.1(a) bugs verified already fixed in `euphoriamobile`.** Its recent log:

```
20aec92 test(onboarding): regression check for the App Review onboarding freeze
e5d33c3 Fail builds on placeholder Supabase env; document test credentials
771f54a Gate Trade tab behind "Market Data Coming Soon" state
```

Apple's original text (accurate, from ASC — still useful context):
> (1) The app became unresponsive during onboarding process.
> (2) We were unable to complete signing up with Apple due to an error.

Plus **Guideline 2.1(b)**, a business-model questionnaire that must be answered in writing before
review continues. Question 4 asks what is unlocked WITHOUT In-App Purchase. **Agreed: the assistant
drafts it, the user approves, nothing sends without that.** Not yet done.

> **Two reviewer screenshots are attached to submission `4a0a0bdf-0f8e-48d4-ad1f-7a5bb925a171` and
> have still never been opened.**

---

## ⚠️ THE CORRECTIONS LOG HAS A HOLE: C85 → C91

`refs/MASTER_PLAN.md` contains **C80–C85 and C91**. **C86, C87, C88, C89 and C90 were never written
into it**, yet C91 cites C86/C87 as account-side blockers. Whatever those were is not recoverable
from the plan. **Reconstruct or renumber them before adding anything new** — an unexplained gap in
the log is exactly how the bundle-id error propagated unchallenged.

---

## WHAT IS STILL TRUE FROM THE 2026-08-08 SESSION (all committed, gate green)

Units **15** (widgets + notifications, 15a–15e), **10** (trade news gallery), **12** (quest marks),
**13** (full revamp sweep) are CLOSED in `euphoria-native`. **League was redesigned** (C75). Unit
**16** has 7 App Store screenshots via `scripts/store-shots.mjs` (reproducible; Nunito through a
scoped fontconfig).

**Real defects found in `euphoria-native` that still stand:**
- **C76** — `IAP_ENABLED` was `KEY.length > 0`, TRUE for a `test_…` placeholder, so the app believed
  purchases were live and shipped a Buy button that could only fail. Now validates the `appl_` prefix.
  **`.env.local` still holds the placeholder.**
- **C84** — `auth.tsx:80-81`: "Continue with Apple" and "Continue with Google" both call `enter`,
  the same local function the email form uses. No `expo-apple-authentication`, no plugin,
  `applesignin` entitlement count **0**. **Verify whether this is also true in `euphoriamobile`** —
  that is the repo Apple reviewed.
- **C66** — lint baseline moved to **45 warnings** (`48 problems (3 errors, 45 warnings)`).
- **C63** — the widget springboard render is unverified, blocked by a simulator fault (`chronod`
  metadata empty for ALL apps), not by our code.

**Still open:** Unit 16's icon audit + preview video · Unit 17 (retention, 7 phases, largest
remaining) · Unit 14 (review, last) · §9c's gap audit · Unit 13 item 6's a11y agent pass · store
shot 3 shows a losing portfolio and the user chose to trade the practice account into profit and
reshoot.

---

## IAP CREDENTIALS — in hand, NOT uploaded, and check which app they belong to

| | |
|---|---|
| Issuer ID | `86cf89c1-ed5f-441d-9ae4-575aa7433937` |
| IAP Key ID | `QP24DLK3HJ` ("Euphoria IAP 2026-08") |
| `.p8` | `~/euphoria-native/.secrets/SubscriptionKey_QP24DLK3HJ.p8` — gitignored, `chmod 600`. **Never print it** |
| dead April key | `V2D263NV4V` — `.p8` unrecoverable, never reuse |
| RevenueCat | four near-identical projects: `89ced465`, `320845df`, `875fc097`, `6e8b425d` |

**`320845df` carries `com.euphoriainv.euphoria`** — which means it belongs to **`euphoriamobile`**,
not to this repo. **Do not upload the key until it is settled which app is being monetised.** The
four rival projects are probably the residue of this same confusion.

---

## ENVIRONMENT

```bash
export EUPHORIA_UDID=61F7E882-C226-4E97-9918-9BFF536B9A90   # "Euphoria QA" — every shell
```
- Bundle id **`com.euphoria.native`** (reverted). Metro on **8081**. Screen **402 × 874 pt**, 34pt bottom inset
- The simulator **shut itself down** mid-session once. If tools return unparseable output, run
  `xcrun simctl list devices` before theorising about a crash

**THE GATE — after every unit:**
```bash
npx tsc --noEmit                       # clean
npx expo lint 2>&1 | grep problems     # 48 problems (3 errors, 45 warnings) — see C66
python3 scripts/certify.py | tail -2   # ALL ROUTES PASS 3a
node scripts/check-digest-lessons.mjs
./scripts/sim.sh screen                # read the REAL screen
```

---

## HOW TO WORK

1. **Never mention session cost or context percentage.** `~/.claude/CLAUDE.md`'s COST directive does
   not apply to this project.
2. **LOOK AT THE SCREEN.** The a11y tree lied four separate times in one session — it omitted a
   whole widget-gallery row, hid a picker clipped off the screen edge, flattened a toggle subtitle,
   and showed nothing wrong with ragged news cards. `tsc` green + lint green + certify green has
   coexisted with real visual defects throughout.
3. **ScreensDesign is MANDATORY before design decisions — but it is OUT OF DATA BUDGET**, returning
   "You have flown through your data budget". Per §0.2 rule 7, spec from the app's own language +
   HIG and **label it as such**.
4. **ASK MANY QUESTIONS, IN DETAIL, VIA `AskUserQuestion`.** The user: *"I'd rather read a question
   than write a debrief."* Evidence in the option descriptions, recommend first, ask BEFORE
   building. When a question gets "I'm not sure what this means", rewrite it in plain English with
   no jargon and ask again — that happened twice and both times the plain rewrite worked.
5. **The user is authenticated in App Store Connect and RevenueCat via Claude in Chrome** and has
   authorised their use. **ASC screenshots time out — use `get_page_text`.** Read freely; confirm
   before creating or generating.

---

## THE LESSON, WHICH COST A WHOLE WORKSTREAM

A mismatch between two sources does not tell you **which** one is wrong. The previous session saw
ASC and `app.json` disagree, assumed the repo was at fault, changed the bundle id, the App Group and
the tooling, ran a destructive prebuild, and wrote a carryover leading with a false headline — then
closed that carryover with *"check reality before trusting a plan."*

**When two sources disagree, enumerate the readings before acting on one.** Here the unexamined
reading — *the listing belongs to a different repo* — was the true one, and a single `ls ~/euphoria*`
would have found it.
