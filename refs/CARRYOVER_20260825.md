# Carryover, 25 August 2026

**This document supersedes `refs/HANDOFF_20260825.md` and every earlier CARRYOVER.** Where they
disagree with this file, this file wins. `HANDOFF_20260825.md` §1 in particular tells you to read the
old App Store rejection first, and the owner has explicitly overruled that.

Written for the next Claude session, not for a human. Every instruction below came from the owner
answering a direct question, in a run of forty questions on 25 August. Where something is my
inference rather than his answer, it says so.

---

## 0. Your first action

**Read this document and come back with a proposed plan. Do not start work.** That is his answer,
verbatim in intent. He wants to see the order you intend to work in before you touch anything.

---

## 1. Standing rules. These are his answers, not my suggestions.

### Authority

| Area | Rule |
|---|---|
| Preparing anything | Free. Build, stage, write, verify, refactor without asking. |
| **Sending anything outward** | **Stop and ask.** Submitting to Apple, publishing an OTA, pushing metadata, promoting a TestFlight group, anything a tester or reviewer or payment system sees. |
| Git | **Commit and push freely** once checks are green. Remote is `github.com/teameuphoriainv-dot/euphoria-native`, branch `main`. |
| Cost | **Ignore cost for this push.** His standing "do not burn credits" instruction in CLAUDE.md is suspended until the app is on the App Store. Spend what correctness needs. |
| Something serious found mid-flight | Fix it and keep going, **unless it is outward facing**, in which case stop and ask. |

### Verification. Two tiers, and they are different.

- **Your bar: a screenshot.** Nothing is called fixed without an image showing the fixed state. Not
  "the code now says", not "checks pass". A picture of the actual screen.
- **His bar: a real TestFlight build on his own phone.** Your screenshot is evidence, not proof. He
  confirms on hardware. Do not describe anything as confirmed on his behalf.

### Reporting defects. He was emphatic about this one.

**Verify a thing is real before telling him. No exceptions.** He said this after I showed him
simulator-only console noise as though it were an app defect. If it is not reproduced and confirmed,
it is not mentioned. No hedged maybes, no "this might be", no development artifacts. He also asked
for this to go into CONSTITUTION.md **harshly worded**.

Concretely, things that are NOT defects and must never be reported as such:

- The red LogBox screens about RevenueCat offerings. `src/lib/purchases.ts:255` is inside
  `if (__DEV__)` and never runs in a release build. The RevenueCat SDK cannot fetch products in a
  simulator with no StoreKit configuration. Confirmed by reading the guard, 25 Aug.
- The floating gear labelled **Tools**. The string "Tools" appears nowhere in `src`. It is the
  expo-dev-client launcher and is absent from production builds. Confirmed by grep, 25 Aug.

### Definition of done for this launch

**Every screen walked and confirmed right.** Not "nothing obviously broken". He wants the app gone
through screen by screen on a real build, compared against intent, with anything wrong listed before
submission.

---

## 2. Where things actually stand

### Committed today, all green on `npm run check` (42 steps), tsc and eslint

| Commit | What |
|---|---|
| `5253c0c` | Gated Options header got the one line it was missing |
| `c8c1959` | API origin compiled in, so an OTA cannot ship without one |
| `475e3dd` | Onboarding asks for a name, so Home can greet by it |
| `66d3f6f` | Streak nudge line removed from Home |
| `b87e533` | (superseded handoff doc) |
| `8d79f1c` | Design rules written down, three pinned |
| `2628fd4` | Two-Atlas header fixed: avatar far right, Atlas beside it |

### The four UI items he asked me to verify visually, checked 25 Aug on device

| Item | Verdict |
|---|---|
| Learn: three restated labels and the dead space | **Correct.** No `0% complete · 25 lessons`, no `0/25` pill, no `UNIT n · m LESSONS`. Section headers read as plain names. No slack under the pills. Node is `DOT 28` at `borderRadius 3` with a `borderRadius 0` wire, so it reads squared off. Checked at two scroll positions plus the source. |
| Paywall: web gradient and no scrolling | **Correct.** SAVE badge, CTA and the three benefit dots all walk purple to pink to orange. Everything fits on one screen. Scroll-tested: swiping produced a pixel-identical layout, so the page genuinely does not scroll. One renewal-terms row, not two. No slab under the CTA. |
| Options header needed a line under it | **Was genuinely missing. Fixed in `5253c0c` and verified.** `options.tsx` renders the title twice and only the Pro path had a subtitle, so everyone without Pro saw a bare title. Now reads "Options / Where investing gets interesting." |
| Two Atlas and the missing avatar | **Correct.** Zoomed the header cluster: coins, streak, one Atlas, then the pixel-person avatar in the far-right circle. Exactly his spec. |

### Production right now

Production is on the **rolled-back OTA bundle**, which is worse than what is committed. None of
today's fixes are on any device. The OTA is the first outward-facing action and needs his yes.

---

## 3. Corrections. Things I told him that were wrong.

He asked for these to be recorded explicitly so you do not inherit a wrong model.

1. **"The greeting is fixed."** It was not. I changed the string to `Hey there, {name}` and never
   added anything that sets `profile.name`. Onboarding never asked for a name, so the value was
   always empty and the screen kept saying a bare "Hey there". Fixed properly in `475e3dd` by adding
   a name step. **The lesson: changing the consumer of a value is not the same as providing it.**

2. **"The stock prices are the seed table showing through because the local env var is missing."**
   That was the simulator symptom, not his cause. His cause was `eas update` publishing without
   `--environment`. The local fix would never have reached TestFlight. See §4.

3. **"The submit failed."** It had not. My own `timeout 560` killed `eas submit` mid-flight and ate
   the log. Build 18 was at Apple the whole time. **Do not wrap long EAS commands in `timeout`. Run
   them in the background and wait once.**

4. **"The gradient edit did not apply."** It had. Fast Refresh had silently missed it and the file
   was already correct. **Read the file before concluding an edit failed.**

5. **I over-called an IAP key severity** and had to correct it in `e18d115`.

---

## 4. The bug that matters most, because its whole class is invisible

The Trade tab showed NVDA at $1,184.00 against a real $208.48 and rendered no logos.

**Nothing was wrong with the price code.** `getMarks()` is the single entry point,
`/api/market?action=marks` is healthy and returns 12,526 tickers, and with the origin present every
number on screen matches the provider to the cent.

`EXPO_PUBLIC_API_URL` is inlined at **bundle** time, and this app builds bundles two ways:

- `eas build` reads the `env` block in `eas.json`. A build has always had the origin.
- `eas update` **does not read that block at all.** It takes variables from `--environment`, which
  Expo SDK 55 and above require. Publish without it and the OTA has no origin.

An OTA bundle overrides the one inside the app, so a correctly configured build still lost its
market data. `apiBase()` returned `''`, every call threw `no_api_origin` before its fetch, `safe()`
in `lib/market.ts` turned each into `null`, and `priceOf` fell back to the static table in
`stocks.ts`. Atlas and the options chain died at the same instant for the same reason.

**Nothing in the app said a word,** because falling back to that table is the designed behaviour when
a price is unavailable. A misconfiguration rendered as a working screen full of wrong numbers.

### What now stops it

- `src/lib/api.ts` compiles the origin in as `DEFAULT_API_ORIGIN`. The environment still wins when
  set; only the case that used to be `''` moved.
- `scripts/api-origin-pin.mjs` fails `check` if that constant and `eas.json` disagree. Break-tested
  four ways: drift, trailing slash, cleartext http, reverted `apiBase()`.
- `npm run ota` always passes `--environment production`. **Use it. Never call `eas update` raw.**
- `refs/DEPLOY.md` now documents the OTA path, which it never mentioned.

### Proof, so you do not have to redo it

Exported an iOS bundle with `.env.local` moved aside, so no `EXPO_PUBLIC_API_URL` existed anywhere.
The origin is still present in the `.hbc`. The literal appears in exactly one place in `src` and
nowhere in `app.json`, so that is the constant and not a stray copy.

### He wants the whole class hunted, before submitting

Find every other place where **missing configuration degrades into plausible output instead of an
error**. That is his instruction, and it is the highest-value work in this document.

---

## 5. The App Store path

| Question | His answer |
|---|---|
| The old rejection | **Do not chase it.** Submit fresh and react to what Apple actually says this time. |
| Review notes | **Show him the exact text again before anything is sent.** He has approved the direction, not the wording. The rewrite removes "We are currently in beta" and "Community features are coming", both Guideline 2.2 triggers, and adds an explicit no-brokerage, no-deposits line. |
| Store listing: screenshots, description, keywords, age rating | **Audit all of it before submitting.** It may predate several of these changes. |
| Reviewer access | **Confirm the demo account actually works on a real build first.** A reviewer who cannot get in is an automatic rejection. Note: `AUTH_ENABLED` is false without the Supabase variables and those are set in no environment, so sign-in may be switched off entirely and the app may need no credentials at all. Establish which before writing notes that promise an account. |
| Cofounders' external TestFlight group, still on build 15 | **Bring them up to date too.** Two routes, and the cheap one is not obvious: an **OTA to the production channel updates build 15 in place with no Beta App Review**, whereas promoting a new build to an external group triggers it. Check which channel build 15 is on before assuming. Either way it is outward facing, so ask first. |

Submission facts: bundle `com.euphoriainv.euphoria`, team `9SS423KXF5`, ASC app `6761808087`,
`APP_IPHONE_67` is the 6.9-inch screenshot slot and **there is no `APP_IPHONE_69`**.

---

## 6. Open work, in his priority order

1. **Read this and propose a plan.** Do not skip.
2. **Sweep for the missing-config-degrades-silently class.** Before submitting.
3. **Walk every screen on a real build** and list anything wrong. This is the definition of done.
4. **Investigate the TestFlight lag properly.** He treats it as a submission blocker. Do not guess:
   `components/perf-hud.tsx` exists precisely because there is no profiler on device, it is behind a
   settings toggle, and it measures JS-thread frame gaps. Suspects, unproven: React Compiler is on,
   Reanimated animates SVG attributes through the JS thread, and the grouped marks response is 300KB
   for 12,548 tickers landing on the Trade tab.
5. **Backend: do all of it.** Record what is known, measure it properly, lay out what moving off EAS
   Hosting would involve, and only then conclude. Current state: EAS Hosting serving routes from
   `src/app/api`, with Polygon, Alpha Vantage, Tradier and Gemini behind it. The market endpoint
   answers in normal time and is **not** the source of the lag. That is a measurement, not a verdict
   on the backend as a whole.
6. **Money path.** The entitlement id was wrong, `Euphoria Pro` not `pro`, and would have broken
   every purchase. Fixed at `src/lib/billing-retry.ts:29`, pinned by `entitlement-id-pin.mjs` against
   RevenueCat project `320845df`, entitlement `entl79bcb589c6`. **A real sandbox purchase must be
   completed end to end before submission.** It cannot be validated in a simulator, which is why the
   offerings errors appear there.
7. **PostHog: confirm events actually arrive** in the dashboard. `analytics.ts` drops events silently
   when the key is missing or not `phc_`-shaped, which is the same silent-degradation class as §4.
8. **CONSTITUTION.md.** See §7.
9. **OTA with today's fixes.** Gated on his yes.

---

## 7. CONSTITUTION.md, and exactly how he wants it built

**Every line must come from an answer he gave.** Nothing invented, nothing inferred, nothing carried
over from DESIGN_RULES.md unless he says it again.

- **Method: one long run of questions upfront**, then write the whole document at once. Not
  incrementally, not as you go.
- **Scope: all four areas.** How you work and report to him. How the app looks. How the code is
  written. What the product will and will not do.
- **Enforcement: wherever it can be.** Every rule that can become a check in `npm run check` becomes
  one, and it is break-tested. His reasoning, which is correct: written rules get ignored, failing
  builds do not.
- **The "verify before telling me" rule goes in worded harshly, with no exceptions.**

---

## 8. The check suite, all 42 steps

`npm run check`. Green as of `5253c0c`.

**The rule that matters more than the list: a pin must be able to fail, and you must have watched it
fail.** This session found `reduced_motion_audit.py` printing `[DEFECT]` and exiting 0, so it had
never once failed in its life. Every pin added since has been deliberately broken to prove it fires.
Do the same, every time, without exception.

| # | Step |
|---|---|
| 1 | `step-clamp-regression.mjs` |
| 2 | `order-derangement-pin.mjs` |
| 3 | `trial-offer-pin.mjs` |
| 4 | `goal-minutes-pin.mjs` |
| 5 | `streak-freeze-regression.mjs` |
| 6 | `em-dash-prose-pin.mjs` (no em dashes in user-facing prose) |
| 7 | `no-glow-pin.mjs` |
| 8 | `age-floor-pin.mjs` |
| 9 | `league-week-pin.mjs` |
| 10 | `shop-catalogue-pin.mjs` |
| 11 | `theme-alpha-pin.mjs` (alpha-append only on hex, see design rule 8) |
| 12 | `course-mark-pin.mjs` |
| 13 | `lesson-art-pin.mjs` |
| 14 | `lesson-question-pin.mjs` |
| 15 | `digest-extra-pin.mjs` |
| 16 | `avatar-pin.mjs` |
| 17 | `pricing-pin.mjs` |
| 18 | `press-feedback-pin.mjs` |
| 19 | `day-keys-regression.mjs` |
| 20 | `marks-regression.mjs` |
| 21 | `cost-basis-regression.mjs` |
| 22 | `portfolio-snapshot-regression.mjs` |
| 23 | `billing-retry-regression.mjs` |
| 24 | `lesson-preview-coverage.mjs` |
| 25 | `unit-names-coverage.mjs` |
| 26 | `check-digest-lessons.mjs` |
| 27 | `trial-reward-regression.mjs` |
| 28 | `options-mapping-regression.mjs` |
| 29 | `api-validation-regression.mjs` |
| 30 | `dismissal-offer-regression.mjs` |
| 31 | `identity-regression.mjs` |
| 32 | `entitlement-regression.mjs` |
| 33 | `advice-guard-regression.mjs` |
| 34 | `privacy-claim-pin.mjs` |
| 35 | `reduced_motion_audit.py` (python3; was the gate that could not fail) |
| 36 | `market-marks-regression.mjs` |
| 37 | `motion-invariants.mjs` |
| 38 | `entitlement-id-pin.mjs` (new this session) |
| 39 | `budget-balancer-pin.mjs` |
| 40 | `design-rules-pin.mjs` (new this session) |
| 41 | `api-origin-pin.mjs` (new this session) |
| 42 | `npx eslint src scripts --max-warnings 62` |

`entitlement-regression.mjs` prints a stack trace about `not json` on the way past. That is a
fixture deliberately exercising a bad-JSON path, not a failure. **Read the exit code, not the
stderr.**

---

## 9. The design rules, restated in full

He asked for these restated here rather than pointed at, so the carryover stands alone. Source of
truth remains `refs/DESIGN_RULES.md`. Rules marked PINNED fail `check`.

1. **Say a thing once.** Never state the same number or sentence twice on one screen. The Learn
   header carried `0/25`, `0% complete · 25 lessons` and a progress bar, all saying one thing. The
   paywall said "Cancel anytime in the App Store" twice, 30pt apart. Before adding a label, find what
   already says it. Usually something does.
2. **No dead space, and no half-finished rows.** If a screen already fits, grow the components rather
   than leave slack. The paywall uses `space-between`, so slack spreads between blocks and reads as
   gaps someone forgot to close. And if sibling rows have a subtitle, all of them do.
3. **Screens that ask for money do not scroll.** Headline, benefits, both plans, CTA, renewal terms
   and legal row all visible at once. App Store Review 3.1.2 wants price and renewal terms on the
   purchase screen. Verify at the largest Dynamic Type size the screen supports.
4. **The call to action is never the quietest thing on the screen.** "5 min to keep your streak" was
   13px at the lowest contrast on Home, under a 22px title. Weight and colour go to what you want
   tapped, reusing a colour already present.
5. **Pixel art is the system, not a decoration.** Round shapes beside pixel sprites read as a
   different product. `PixelSpriteView` takes `sprite / size / scale / play / playKey / frameMs /
   canvas` and has **no colour prop**, so anything that must carry a course accent cannot be a
   sprite. Reuse the 84-sprite catalogue first. New art goes in `sprites-additions.ts`, **never** in
   the web-synced files (`types / palette / compile / sprites / catalogue`), which are byte-for-byte
   copies and get re-copied.
6. **One mascot per screen. PINNED.** Atlas is Atlas, the avatar is the user, never the same glyph on
   the same screen. On Home the right cluster reads: coins, streak, **Atlas, avatar**, avatar
   furthest right.
7. **Paid surfaces carry the web's ramp.** euphoriainv.com runs purple to pink to orange across every
   upgrade surface. Stops already in the palette: `gradientFrom`, `premiumFrom` `#E0409B`,
   `premiumTo` `#F5842B`. No new colour. Do not paint the ramp on anything that is not selling.
8. **Colour comes from the theme. PINNED as a ratchet.** Hardcoded hex outside the art files is
   capped at its current count. Exceptions are decoration that must look identical in both themes,
   and diagnostic overlays. **Alpha-append (`theme.x + '30'`) works only on HEX**; appending to an
   `hsl()` string renders at full opacity, silently, with no error.
9. **Contrast is computed, never eyeballed.** 4.5:1 minimum for body text, compositing counted. Put
   the measured ratio in the comment.
10. **Touch targets and motion.** 44pt minimum. **A one-finger swipe is VoiceOver's navigation
    gesture**, so any gesture mechanic needs a button alternative designed in the same pass. Money
    2048 shipped unplayable for VoiceOver. Vestibular motion must be guarded by `useReducedMotion`.
11. **Structure.** Five tabs maximum, settled, do not re-litigate. No em dashes in user-facing prose.
    A screen nothing links to is not shipped: `/avatar` was reachable only from two links both on
    Profile, so effectively nobody found it.

---

## 10. Do not do these

Specific traps, all of which nearly happened or did happen.

- **Never point the app at RevenueCat project `875fc097`.** It has an entitlement literally named
  `pro`, which is what the code used to say. If the app had pointed there, the entitlement "fix"
  would have broken a working setup. Settled by elimination: that project has Test Store only and no
  App Store app, so it cannot have issued the `appl_` key. The app talks to `320845df`.
- **Never run `eas update` without `--environment production`.** Use `npm run ota`. This is the §4
  bug.
- **Never wrap `eas submit` or `eas build` in `timeout`.** It kills the command mid-flight and eats
  the log. Run in the background and wait once.
- **Never enter his Apple ID credentials** into App Store Connect or anywhere else. I declined this
  and he did not press it.
- **Never upload the private `.p8` signing key** to RevenueCat or any third-party dashboard.
- **Never report a defect you have not reproduced.** See §1.
- **Never claim a fix without a screenshot of the fixed state.** See the greeting in §3.
- **Never add a pin without watching it fail.** See §8.
- **Do not restate a fact a screen already shows.** See design rule 1. This is why the new Options
  subtitle deliberately does not summarise the card beneath it.

---

## 11. Environment and secrets

**Values are never written into this document.** He initially asked for them inline, I pointed out
this file is committed to git and that you have the same access I do, and he changed his answer.
Fetch them.

| Variable | Where it lives | How to read it |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | `eas.json` under `preview.env` and `production.env`, plus all three EAS environments, plus `DEFAULT_API_ORIGIN` in `src/lib/api.ts` | `npx eas env:list production` |
| `EXPO_PUBLIC_POSTHOG_KEY` | EAS environments only | `npx eas env:list production --format long` |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | EAS environments only | same |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | EAS environments only | same |
| `EXPO_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | **set nowhere** | see below |
| `GEMINI_API_KEY`, `POLYGON_API_KEY`, `ALPHAVANTAGE_API_KEY`, `TRADIER_TOKEN` | server-side on the deployment, **not** `EXPO_PUBLIC_` and must never be bundled | `npx eas env:list production` |
| ASC API key | `./.secrets/AuthKey_NJ4H5Q7248.p8`, key id `NJ4H5Q7248`, issuer `86cf89c1-ed5f-441d-9ae4-575aa7433937` | on disk, do not move or upload it |

**The Supabase variables being unset is deliberate, not a defect.** `src/lib/auth.ts:21` reads them
and `AUTH_ENABLED` is false without them, so sign-in is simply switched off. Verified 25 Aug.

**`.env.local` exists, is gitignored, and stays.** I added `EXPO_PUBLIC_API_URL` to it so local
development matches production. **It is not what fixed production** and must not be mistaken for the
fix, which is `DEFAULT_API_ORIGIN`. It contains no other `EXPO_PUBLIC_` variables.

---

## 12. Voice and feel. Inferred, not stated by him.

He was asked and chose to have what is already evident recorded, marked as inference. **Do not treat
this as his answer. Ask him properly during the constitution round.**

Observable from the code and copy: a teenage audience, plain language with no jargon, short
benefit-led lines rather than feature lists ("Build a real portfolio. Risk nothing."), section names
with some personality ("What Quietly Eats Returns", "The Ideas Everything Rests On"), a pixel-art
identity throughout, and an absolute refusal to put a fabricated number on screen, which is stated
outright at the top of `lib/market.ts` and is the reason the $1,184 price was treated as serious.

---

## 13. Other context

- **The Business Model Canvas assignment is done.** Written onto slide one of the Google Slides deck,
  no slides added. He said he will almost certainly reformat it himself. Nothing outstanding.
- **Two traps from that work, if you ever touch Google Slides:** the toolbar overflow button moves
  position depending on what panel is open, and clicking it blind created blank slides twice, both
  recovered with `cmd+z`. And slide one is the canvas, slide two is the instruction key.
- **`idb` coordinates are logical points, and this simulator is 402x874, not 414x896.** Screenshots
  come out at 1206x2622. Getting this wrong made taps miss the LogBox Dismiss button by about 25
  points for several attempts.
- The RevenueCat offerings errors reopen LogBox faster than you can dismiss them. Relaunching the app
  with `xcrun simctl terminate` and `launch` gives a clean window.
