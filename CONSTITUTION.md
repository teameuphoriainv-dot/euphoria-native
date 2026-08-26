# CONSTITUTION

**Every line here came from an answer the owner gave.** Nothing is inferred, nothing is carried
over from another document unless he affirmed it again. Where a rule can become a check in
`npm run check`, it is one, and that check has been watched failing. Written rules get ignored.
Failing builds do not.

Sources are marked: **[25 Aug]** is an answer given in the session of 25 August 2026.
**[carryover]** is an answer recorded in `refs/CARRYOVER_20260825.md`, itself written from a run of
forty answered questions.

---

## 1. Verification

### 1.1 Never report a defect you have not reproduced. No exceptions. **[carryover]**

**Do not tell him something is broken until you have made it break in front of you.** No hedged
maybes. No "this might be". No "I noticed something that could be". A thing is a defect when it has
been reproduced and confirmed, and until then it does not get mentioned at all.

Development artifacts are not defects and reporting one as a defect is a failure. The red LogBox
screens about RevenueCat offerings come from `src/lib/purchases.ts` inside an `if (__DEV__)` guard
that never runs in a release build, and the SDK cannot fetch products in a simulator with no
StoreKit configuration. The floating gear labelled **Tools** is the expo-dev-client launcher; the
string appears nowhere in `src`. Neither has ever been a bug in this app.

Wasting his attention on a phantom is worse than staying silent, because he then has to disprove
it himself. That is the whole reason this rule is worded like this.

### 1.2 Visual proof, twice, before proceeding to anything else. **[25 Aug]**

Every single thing you fix or add is visually verified **two** times before you move on to
anything else. Not once. Two independent confirmations, then continue.

### 1.3 Verify on the simulator, not in the diff. **[25 Aug]**

Connect to the simulator and see it working on a screen. Reading the code back is necessary and is
not sufficient. "The code now says" is not verification. A picture of the actual screen is.

### 1.4 His bar is higher than yours. **[carryover]**

Your screenshot is evidence. His confirmation on a real TestFlight build on his own phone is proof.
Never describe anything as confirmed on his behalf.

### 1.5 A pin must be able to fail, and you must have watched it fail. **[carryover]**

Every check added is deliberately broken first, watched to exit non-zero, then restored. This is
not optional and it is not a formality. `reduced_motion_audit.py` shipped printing `[DEFECT]` and
exiting 0, so it had never once failed in its life and nobody knew.

---

## 2. How Claude works and reports

### 2.1 Ask as many questions as possible. **[25 Aug]**

He does not mind answering. Quality output requires knowing exactly what he wants, and the way to
get there is questions, not assumptions. Ask in batches. Never guess where a question would do.
A question costs him a moment; a wrong assumption costs a build.

### 2.2 Disagree once, then execute. **[25 Aug]**

State the concern in a sentence or two with the evidence, then do what he asked. No repeating it.
No quiet non-compliance. No shipping a watered-down version and calling it done. He has heard it
and the decision is his.

### 2.3 Report failures immediately, plainly, with the fix. **[25 Aug]**

Say what broke, say you caused it if you did, say what you are doing about it. Never bury a failure
in a status update and never soften it. A flat correction, not an apology, and then move on.

Worked example from 25 Aug: Claude asserted that git was reporting wrongly and that the `rtk`
proxy might be serving stale reads. Git had been consistent the whole time; HEAD had moved under
the session because another session was writing to the repo. The correct report is one sentence
saying exactly that, with no self-flagellation and no re-litigating.

### 2.4 Preparing is free. Sending anything outward stops and asks. **[carryover]**

Build, stage, write, verify, refactor without asking. Stop and ask before anything a tester, a
reviewer or a payment system sees: submitting to Apple, publishing an OTA, pushing metadata,
promoting a TestFlight group.

Commit and push freely to `main` once checks are green.

### 2.5 Something serious found mid-flight gets fixed, not queued. **[carryover]**

Fix it and keep going, unless it is outward facing, in which case stop and ask.

### 2.6 Cost is not a constraint. **[25 Aug]**

The standing cost rule in `~/.claude/CLAUDE.md` is suspended and stays suspended. Spend what
correctness needs. A cheaper sweep on 25 Aug would have missed the duplicate origin resolver in
`atlas-chat.ts` entirely.

### 2.7 Assume you are not alone in the repository. **[25 Aug]**

Another session may be writing concurrently. On 25 Aug one branched to `feat/ugc-attribution` and
swept an uncommitted fix into its own commit under an unrelated message. Re-verify branch and HEAD
immediately before every commit. Never rewrite a branch you did not create.

---

## 3. What Euphoria will never do

These are hard lines. They outrank any future feature request. **[25 Aug]**

### 3.1 Never show a fabricated number.

A price, a return, a portfolio value: real, or absent, and never invented to fill a screen. This is
already stated at the top of `src/lib/market.ts` and it is why NVDA rendering at $1,184.00 against
a real $208.48 was treated as a serious incident rather than a cosmetic one.

The corollary, learned the same day: **a fallback that produces plausible output is worse than an
error.** A misconfiguration that renders as a working screen full of wrong numbers is the single
most dangerous failure shape this codebase has. Missing configuration must produce a refusal, not
a plausible answer. See §6.3.

### 3.2 Never handle real money or securities.

No brokerage. No deposits. No real trades. Simulated portfolios only.

### 3.3 Never give personalised financial advice.

Teach the mechanism. Never say "you should buy this". Partially enforced by
`scripts/advice-guard-regression.mjs`.

### 3.4 Never sell or share user data.

No PII to analytics, no data brokers. `src/lib/analytics.ts` holds this line today by identifying
users with a pseudonymous `installId` and never a name, handle or email. If that is ever relaxed,
the copy in `why-not-free.tsx` must change in the same commit.

---

## 4. Voice

**[25 Aug]** Written for a teenager. Plain language. No jargon without explaining it. Benefit before
feature. Short lines rather than feature lists. Section names are allowed personality, in the vein
of "What Quietly Eats Returns" and "The Ideas Everything Rests On". Never corporate. Never
condescending.

No em dashes in user-facing prose. Enforced by `scripts/em-dash-prose-pin.mjs`. **[carryover]**

---

## 5. How the app looks

**[25 Aug]** All eleven rules from `refs/DESIGN_RULES.md` are affirmed and carried in whole, and
every one that can become a check becomes one. Rules marked PINNED fail `npm run check` today.

1. **Say a thing once.** Never state the same number or sentence twice on one screen. Before adding
   a label, find what already says it. Usually something does.
2. **No dead space, and no half-finished rows.** If a screen already fits, grow the components
   rather than leave slack. If sibling rows have a subtitle, all of them do.
3. **Screens that ask for money do not scroll.** Headline, benefits, both plans, CTA, renewal terms
   and legal row all visible at once. App Store Review 3.1.2 wants price and renewal terms on the
   purchase screen. Verify at the largest Dynamic Type size the screen supports.
4. **The call to action is never the quietest thing on the screen.** Weight and colour go to what
   you want tapped, reusing a colour already present.
5. **Pixel art is the system, not a decoration.** Round shapes beside pixel sprites read as a
   different product. `PixelSpriteView` has no colour prop, so anything carrying a course accent
   cannot be a sprite. Reuse the 84-sprite catalogue first. New art goes in `sprites-additions.ts`,
   never in the web-synced files, which are byte-for-byte copies and get re-copied.
6. **One mascot per screen. PINNED.** Atlas is Atlas, the avatar is the user, never the same glyph
   on one screen. On Home the right cluster reads coins, streak, Atlas, avatar, avatar furthest right.
7. **Paid surfaces carry the web's ramp.** Purple to pink to orange, using stops already in the
   palette (`gradientFrom`, `premiumFrom` `#E0409B`, `premiumTo` `#F5842B`). No new colour. Do not
   paint the ramp on anything that is not selling.
8. **Colour comes from the theme. PINNED as a ratchet.** Hardcoded hex outside the art files is
   capped at its current count. Alpha-append (`theme.x + '30'`) works only on HEX; appending to an
   `hsl()` string renders at full opacity, silently, with no error.
9. **Contrast is computed, never eyeballed.** 4.5:1 minimum for body text, compositing counted. Put
   the measured ratio in the comment.
10. **Touch targets and motion.** 44pt minimum. A one-finger swipe is VoiceOver's navigation
    gesture, so any gesture mechanic needs a button alternative designed in the same pass. Money
    2048 shipped unplayable for VoiceOver. Vestibular motion must be guarded by `useReducedMotion`.
11. **Structure.** Five tabs maximum, settled, do not re-litigate. A screen nothing links to is not
    shipped.

---

## 6. How code is written

### 6.1 Comments explain the defect they prevent. **[25 Aug]**

Every non-obvious decision carries a comment naming the failure it prevents, with the evidence:
the file, the measurement, the date, the incident. This is a rule, not a stylistic accident.

It is why the entire configuration surface of this codebase could be traced on 25 Aug without
asking him a single question, and why that sweep found a real defect in under an hour. It costs
keystrokes and saves sessions.

### 6.2 Changing the consumer of a value is not the same as providing it. **[carryover]**

The greeting was "fixed" by changing the string to `Hey there, {name}` while nothing anywhere set
`profile.name`, so the screen kept rendering a bare "Hey there". Trace the value to its source.

### 6.3 Missing configuration must refuse, never degrade into plausible output. **[carryover, 25 Aug]**

This is the highest-value rule in this document and the class it names has bitten twice.

`EXPO_PUBLIC_API_URL` is inlined at bundle time. `eas build` reads `eas.json`; `eas update` does
not, and takes variables from `--environment`. An OTA published without it had no origin, so
`apiBase()` returned `''`, every call threw before its fetch, and `priceOf` fell back to the static
table. Nothing said a word, because falling back is the designed behaviour.

Rules that follow:
- Validate configuration by **shape**, never by presence. `IAP_ENABLED` was once `KEY.length > 0`,
  which was true for a `test_…` placeholder, so the app shipped a Buy button that could only fail.
  It is now `KEY.startsWith('appl_')`. `ANALYTICS_ENABLED` is `/^phc_[A-Za-z0-9]{20,}/`.
- A refusal must be **specific**. `503 not_configured` is actionable; a generic failure is not.
- Do not cache a refusal, and never cache an empty result that stands in for one.
- Never resolve the same configuration in two places. `atlas-chat.ts` carried a second copy of the
  origin logic and never received the fix that protected the first, producing a partial outage in
  which the half that still worked argued the configuration was fine.
  Pinned by `scripts/api-origin-pin.mjs`.
- **Never run `eas update` without `--environment production`.** Use `npm run ota`.

### 6.4 Grep every caller before changing a shared function. **[25 Aug]**

`getNews` ended `.then((d) => d?.articles ?? [])`, flattening every failure into an empty list, so
the careful `.catch()` in `news.tsx` could never fire. Its comment reads: telling a user there is
no news when the truth is that we could not load it is worse than telling them nothing, because
they would stop looking. That handling was dead code for as long as it existed.

### 6.5 Report what actually happened, not what was requested. **[carryover]**

`applyDailyNudge` and `applyTrialReminder` return what the OS accepted, never what the user tapped.
Storing an intent as though it were an outcome is how an app ends up believing notifications are on
while the OS drops every one.

### 6.6 Read the exit code, not the stderr. **[carryover]**

`entitlement-regression.mjs` prints a stack trace about `not json` on the way past. That is a
fixture exercising a bad-JSON path deliberately, not a failure.

### 6.7 Never wrap long EAS commands in `timeout`. **[carryover]**

It kills the command mid-flight and eats the log. Build 18 was reported as failed when it had been
at Apple the whole time. Run in the background and wait once.

---

## 7. Notifications

**[25 Aug]** The caps are research, not preference, and they must not drift. Pinned by
`scripts/notif-budget-pin.mjs`, break-tested three ways.

- **2 per day, maximum, counting everything.** Duolingo's ceiling. It cut churn from 47% to 28% and
  holds roughly 55% month-over-month DAU retention.
- **App-initiated messages share 2 per rolling week.** Above 6 a week, users are 3.4x more likely
  to uninstall within 30 days, and CTR falls 10-20% per message past five.
- **The streak reminder sits outside that budget** at 1 per day, because a reminder the user
  switched on and chose the hour for is their own alarm clock, not an app-initiated push. That
  distinction is why Duolingo can send one daily without paying the penalty.
- **Nothing is ever delivered outside 09:00-21:00.**
- **Precedence is billing, then win-back, then market.** Billing first because missing it costs the
  user money, which is a refund request and a one-star review.
- **Win-back is day 3, day 7, day 14, and then silence.** Three different framings, because the same
  message three times performs far worse: reminder (recovers 15-25%), value restatement (8-15%),
  win-back (3-8%). There is deliberately no day 21; continuing past day 14 accelerates uninstall.

---

## 8. Definition of done

**[carryover]** Every screen walked and confirmed right on a real build, compared against intent,
with anything wrong listed before submission. Not "nothing obviously broken".

**[25 Aug]** Everything functional. Every button works. Paywalls set up. All text present. No UI
errors. No storage or backend gaps. Onboarding optimised for free-to-trial and trial-to-paid
conversion. Lessons at parity with the web app.
