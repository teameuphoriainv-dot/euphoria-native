# NEXT SESSION — THE COFOUNDER FEEDBACK DEBUG SESSION

**Read this whole file before you touch anything. It is the contract for the session.**

Written 2026-08-21 at the end of a long shipping session, by the model that did that work, for the
model that will do the next one. Everything in here is either a decision the owner made explicitly,
or a fact that was *measured* rather than assumed. Where something is unverified it says so in
those words. Treat unlabelled claims as verified and labelled ones as open.

---

## 0. THE ONE-PARAGRAPH BRIEF

Two or three cofounders are going through Euphoria on TestFlight and writing down everything wrong
with it, in detail, as raw human prose. The owner will paste that document into chat as a single
dump. Your job for the entire session is to turn that document into a visible task list and then
drive every item to a fix that a human has confirmed on a real phone. This is a debugging session
from start to end. It is not a feature session, not a refactor session, and not an exploration
session. The measure of success is that the owner and his cofounders cannot find, on a TestFlight
build, any of the problems they wrote down.

---

## 1. BINDING DECISIONS — THE OWNER ANSWERED THESE, DO NOT RE-ASK

These were settled by explicit question and answer at the end of the previous session. They are not
suggestions and they are not defaults you may reinterpret. If you find yourself wanting to deviate,
that is a signal to re-read this section, not to improvise.

**1.1 — Feedback arrives as one pasted dump in chat.** Not a file, not drip-fed. The owner will
paste a large block of prose. Your very first action on receiving it is to parse it into a numbered,
deduplicated task list. Do that before you fix anything, because the shape of the list determines
the batching, and because a list is the only way the owner can see progress.

**1.2 — Triage and rank, but fix everything.** The owner's words: *"you actually fix everything.
There's no reason to defer anything without an actual proper reason."* You may and should order the
work by severity so that crashes and broken flows land before cosmetic nits. You may **not** quietly
drop an item. If something genuinely cannot be fixed this session, it needs an explicit written
reason in the log, surfaced to the owner, not buried. "Low priority" is not a reason. "This requires
an Apple review cycle that takes 24h" is a reason. "This needs a design decision only you can make"
is a reason. "I ran out of enthusiasm" is not.

**1.3 — Verification means the OWNER confirms on his phone.** This is the strictest option available
and he chose it deliberately. Your simulator screenshot is *evidence that a fix is ready to ship*,
not proof that it works. Nothing is closed until it is in a TestFlight build and a human has looked
at it on a physical device and said so. Plan the session around this: it means batching, it means
builds, and it means you must never write "fixed" in the log for something the owner has not seen.
Write "ready for verification" and move it to "fixed" only on his word.

**1.4 — Batch builds, work on `main`.** No feature branches, no PRs. Push every verified unit
directly to `main` as you go. Cut a TestFlight build when a batch of fixes is ready or when the owner
asks. A build is roughly 20 minutes plus about a minute of Apple processing, so batching is what
makes the cadence tolerable; building per-item would waste hours.

**1.5 — Reviews: specialist agents per batch, and the owner runs `/code-review ultra` at the very
end.** His words: *"#4 at the complete end though."* So: run `ecc:code-reviewer`,
`ecc:security-reviewer` and `ecc:react-reviewer` over each batch's diff before that batch ships, and
tell the owner when the whole session's work is ready for his own deep multi-agent pass. **This
selection is your standing authorisation to launch those agents** — the global `CLAUDE.md` normally
forbids launching agents unless explicitly asked, and this is that explicit ask, valid for the whole
session. You cannot trigger `/code-review ultra` yourself; it is user-triggered and billed. Tell him
when to run it; do not attempt it.

**1.6 — Trust the tester, always.** The owner chose this over "push back with evidence." If a human
found something confusing, **that is the bug**, even when the code is technically correct and even
when you can prove the current behaviour is intentional. Do not argue with a tester's report. If the
logic is right but a person misread it, the defect is in the clarity — change the copy, the
affordance, the timing, the layout, whatever made a real human wrong. The only thing you may not do
is silently decide they were mistaken and move on. If two cofounders contradict each other, satisfy
both where possible; where genuinely impossible, present both and ask.

**1.7 — Ignore cost. Do not interrupt.** This session explicitly overrides the cost rule in the
global `CLAUDE.md`. Do not batch calls to save credits, do not skip an investigation because it is
expensive, do not prefer asking over verifying. Proceed on stated assumptions and record them in the
log rather than stopping to check. Stop only for things that are genuinely the owner's to decide:
money, account access, irreversible actions, and design calls where two reasonable answers exist.
If a real cost warning appears in the harness, report it and stop that turn — never push through
one silently.

**1.8 — Scope is: the feedback list first, plus the idle-render lag, plus the paywall gaps.** The
feedback document is the priority and is worked top-down. The two known-open engineering problems in
§4 are also in scope. Transferable lessons go into the **global `~/.claude/CLAUDE.md`**, not just
this repo's `AGENTS.md`, so future projects on this account inherit them.

**1.9 — Model and effort: Opus 5, maximum effort, one session only.** No other session is working
this repo concurrently. The previous session had a hard constraint against editing
`src/components/atlas.tsx`, `src/app/lesson.tsx`, `scripts/anim/*`, `refs/ANIMATION_*.md`,
`refs/CARRYOVER.md` and `refs/LOOP_LEDGER.md` because a second session owned them. **That constraint
is lifted.** The owner confirmed: *"No other session is currently working, debug in this session."*
Every file is yours. You should still `git pull --rebase` before pushing, out of ordinary hygiene.

---

## 2. HOW TO ACTUALLY RUN THIS SESSION

### 2.1 The opening move

When the feedback dump arrives, do not start fixing. Do this instead, in order:

1. **Parse it into a numbered list.** One row per distinct defect. Prose from a human talking while
   using an app contains multiple defects per sentence and the same defect restated three times
   twenty minutes apart. Split the former and merge the latter.
2. **Deduplicate across cofounders.** If two people hit the same thing, that is one item with a
   count of two, and the count is signal — it raises priority.
3. **Classify each item** as: `crash` / `broken-flow` / `wrong-data` / `visual` / `copy` /
   `performance` / `confusion`. The classification determines the verification method, not just the
   priority. A `visual` item needs a screenshot; a `performance` item needs a measurement; a
   `confusion` item needs a rewritten affordance.
4. **Write the list to `refs/FEEDBACK_LOG.md`** and commit it before fixing anything. This is the
   session's spine. It must survive context compaction, and it will — a 300-item conversation will
   not fit in context but a file will.
5. **Create a TodoWrite list** mirroring the batches, so the owner sees live progress in his
   terminal.
6. **Show the owner the parsed list** and start work. Do not wait for approval of the list — he
   asked you not to interrupt. Flag anything ambiguous inline as you reach it.

### 2.2 The log format

`refs/FEEDBACK_LOG.md` is the single source of truth. Every row carries:

| # | reporter | verbatim quote | classification | severity | status | fix commit | verified |
|---|----------|----------------|----------------|----------|--------|------------|----------|

Keep the **verbatim quote**. Not your paraphrase. When you fix something three hours later you will
have drifted from what they actually said, and the quote is the only thing that keeps you honest
about whether you fixed *their* problem or a nearby one you found more interesting.

`status` is one of: `open` → `fixing` → `ready-for-verification` → `verified` → `wontfix (reason)`.
Only the owner moves anything to `verified`. Only an explicit written reason moves anything to
`wontfix`, and per §1.2 that reason must be real.

### 2.3 Batching

Batch by **screen or subsystem**, not by severity. Fixing six things on the lesson screen in one pass
means one context load of that file, one build, one verification sweep by the owner on one screen.
Fixing six unrelated things across six screens means six context loads and a scattered verification
pass that a human will get wrong.

A good batch is 5–15 items on one surface. After each batch: `tsc --noEmit`, `npm run check`,
specialist review agents, commit, push. After every two or three batches, or when the owner asks:
build and submit.

### 2.4 Reporting to the owner

He is a founder shipping under pressure and he reads fast. Every report should let him answer "what
can I test now?" in five seconds.

- Lead with what changed and what he should look at on his phone.
- Use tables for status. He has responded well to them all night.
- State what you did **not** fix and why, in the same message. Never let a gap be discovered later.
- When you were wrong about something, say so plainly in one sentence and move on. Do not
  self-flagellate and do not bury it.
- Never write "should work." Either you verified it or you did not, and if you did not, say which.

---

## 3. THE HARD-WON RULES OF THIS CODEBASE

This section is the most valuable thing in this document. Every rule here was bought with a mistake,
usually an expensive one, usually one that produced *confident wrong output* rather than an error.
The dominant failure mode of this project is not crashing — it is looking fine while being wrong.

### 3.1 Every failure mode here produces plausible output, not an error

Deep links silently no-op and leave you on the previous screen while your script reports success. A
guessed screen rectangle yields a perfectly quotable wrong number. H.264 compression ghosting looks
exactly like animation jank. A profiler that failed to attach reports zero commits, which reads as
"no problem found." A paywall renders correct-looking prices from hardcoded constants while the
store behind it has nothing to sell. **Assume any clean result is wrong until you have a second,
independent signal.**

### 3.2 Verify navigation before trusting any capture

Three separate findings in the previous sessions were fabrications caused by capturing a screen the
app was never on. 249 frames were scored as the digest screen; they were the home screen. A stock
screen was reported as showing no prices; the deep link had silently failed. Two "multi-peak bounce"
animation defects were reported; neither screen had been reached.

The fix is enforced in code: `scripts/anim/capture.py` has `record_transition(path, seconds,
trigger, *, reset=..., expect_change=20, settle=3.0)` which **refuses to film unless the trigger
provably changed the accessibility label set**. Use it. Do not hand-roll a capture. And note the
second bug that helper itself had: it originally ran the trigger twice, so for an idempotent action
like a tab switch, the second invocation was a no-op and it filmed a resting screen. `reset` is
required for that reason.

For anything with metro-mcp, call `get_current_route` and confirm the route name **before** you
trust a screenshot or a profile.

### 3.3 A test that cannot fail proves nothing

The `npm ci` clean-clone test that "proved" the lockfile was fine ran the **same npm 11** that
generated the lockfile. It was structurally incapable of reproducing the failure, which happened
under EAS's npm 10.9. It passed, it looked like rigorous verification, and it sent the investigation
in the wrong direction for four builds. Before you run a check, ask what result would falsify your
hypothesis. If nothing would, the check is theatre.

### 3.4 When a change measures as no-change, "stale build" and "second code path" look identical

This cost three rounds on the NativeWind investigation. Two attempts changed one thing, measured no
difference, and concluded the bundle was stale. The bundle was fine. NativeWind wires itself into the
app in **three** independent places and any one surviving hook re-wrapped every component, so a
single-hook change was genuinely indistinguishable from a no-op. Running `expo start --clear`
properly and *still* seeing no movement is what finally ruled out staleness. Prove which one you are
looking at before acting.

### 3.5 Pagination is not a detail

A confident "created 50/50 — success" was reported for the App Store trial rollout. It had covered
only the alphabetically first page of territories, `ARE` through `FIN`, and **left the USA, UK, India
and Canada without a free trial** — on a paywall that promises "No payment due now." Users would have
been charged $79.99 immediately. The API returned 50 because the default page size is 50, not because
there were 50. There were 175. Always page to exhaustion, and always spot-check for a specific
expected member (`USA`) rather than trusting a count.

### 3.6 Never infer absence from a paginated pull

Documented in `AGENTS.md` for ScreensDesign and it generalises: `app_screens` with an offset returned
positions 12, 14, 15, 18, skipping 13. That gap was read as "the screen does not exist" and correct
work was reverted on the strength of it. A missing item in a paginated response is pagination, not
evidence.

### 3.7 Check `Content-Encoding` before decoding anything

EAS build logs are served **brotli-encoded** (`content-encoding: br`). `curl` + `gunzip` produces
binary garbage that looks like a corrupt file, and chasing that cost hours across four failed builds
while the actual error sat in plain text one header-check away. Node's `fetch()` decodes brotli
natively. See §6.2 for the working recipe.

### 3.8 Profiler `actualDuration` is cumulative and is not reliably zeroed

When attributing render cost by walking the fiber tree: `actualDuration` on a parent **includes all
children**, so any deep re-render lights up every ancestor and makes the root look guilty. Worse,
React does not reliably reset `actualDuration` on fibers that bail out, so a naive self-time
calculation reports stale values and can tell you that every component in the app re-renders on every
commit — which is not plausible and is an artifact, not a finding. The previous session hit exactly
this and stopped rather than shipping a third fix built on a broken instrument. If you resume the lag
hunt (§4.1), find a sounder instrument first.

### 3.9 Ship on verified-safe; never claim verified-faster without the measurement

A NativeWind babel change was committed as a performance win **before being measured**. It turned out
to be worthless *and* actively unsafe — `nativewind/doctor.js` throws when `jsxImportSource` is
missing, and Metro died with exit code 7 during static web rendering while it was applied. It had to
be reverted. Two other fixes this session (`blink` off React state, `ringProps` memoisation) were
real defects that measurably changed **nothing** in aggregate, and their commit message says so
explicitly. Copy that discipline: a commit may say "verified safe" on a `tsc` and `check` pass, but it
may only say "faster" if you have the before and after numbers in the message.

### 3.10 Restart Metro with `--clear` after any babel or metro config change

Metro caches transforms keyed on the babel config. A config change appears to do nothing because the
old bundle is still being served. The tell is the **ratio**, not the count: 8,976 wrapped views over
66 commits is 136 per commit; 6,987 over 51 is 137. Unchanged ratio means the old bundle. Also verify
directly — `curl "http://localhost:8081/src/components/<file>.bundle?platform=ios&dev=true" | grep -c
"<a marker string you just added>"` will tell you in one call whether your edit is actually being
served.

### 3.11 The simulator is the owner's screen

Restore anything you change — route, app state, settings — and verify the restore in the same call.
If you kill Metro, bring it back. If you deep-link somewhere, navigate back. He is working on that
machine.

### 3.12 Correct the record when you are wrong, in one sentence

Several claims in the previous sessions had to be retracted: that TSLA was a genuine coverage gap
(it was a rate limit mislabelled as a 404); that ASC API access would take days of Apple review (it
was instant); that an App Manager key could not manage users (it could); that a byte cache was
delivering a win (the route module re-evaluates per request, so it was a no-op). Each was corrected
plainly and the work moved on. Do that. Do not hide a retraction and do not write three paragraphs
about it.

---

## 4. WHAT IS ALREADY KNOWN BROKEN — IN SCOPE, NOT YET FIXED

### 4.1 The idle re-render lag — THE BIG ONE, CAUSE UNKNOWN

**This is very likely the single root cause behind a large fraction of the feedback you are about to
receive.** Anything a cofounder describes as laggy, sluggish, slow to appear, stuttery, or
janky is a candidate symptom of this one problem. Expect it to be reported many times in many
disguises.

**What is measured and certain:**

- The app performs **~4–5 React commits per second while completely idle**, on every screen, with
  zero user interaction. Measured repeatedly: 32, 33, 35, 41 commits per 8-second window.
- The tree is **7,025 fibers**. Every commit walks it.
- On the lesson screen there are **5 `Atlas` instances**, **6 `AmbientBackgroundInner` instances**,
  and the lesson screen itself is mounted **twice** (`Lesson(./lesson.tsx): 2`, `Route(lesson): 2`).
  That duplicate mount is itself suspicious and was never explained.
- In 6 idle seconds there were **260–320 `setTimeout` calls**. Breakdown by delay: 39× at 300ms
  (Atlas arc-flex), 30× at 130ms (Atlas blink), 15× at 260ms (Atlas saccade double-dart).
- The owner's specific complaint: **Atlas takes about 1.5 seconds to appear** on the lesson intro.

**What the maths says, and it matters:** the entrance animation is *not* slow. `Spring.smooth` with
`damping: 24` is stiffness 158, mass 1, giving ζ = 24/(2√158) ≈ **0.955** — near-critically damped,
settling in roughly **420ms**, with a 150ms opacity fade. The animation is fine. It is being
**starved of frames** by the idle commit churn. Fixing the churn is what fixes the perceived lag;
retuning the spring would be treating the symptom.

**Two hypotheses tested, both fixed, neither moved the number:**

1. `blink` was React state — `setBlink(true)` then `setBlink(false)`, two commits per blink, 30
   blinks per 6 idle seconds across 5 Atlas instances. Now a shared value crossfaded on the UI
   thread. Commits went 97 → 88. Within noise.
2. `ringProps` was rebuilt as a **new array every render** and passed to the `memo`-wrapped
   `AtlasMarkBody`, so its shallow compare never once hit and the entire mark — four
   `LinearGradient`s, a `ClipPath`, `Defs`, eight `Circle`s — re-rendered on every commit. Now
   memoised with stable shared values. Commits stayed ~32/8s. Also within noise.

Both fixes are correct and are committed with messages that state plainly that they changed nothing
measurable. Keep them.

**Where to go next.** The previous session's last instrument reported that every component,
including memo-wrapped ones, re-rendered on every commit — which per §3.8 is an artifact of
`actualDuration`, not a finding. Do not build on it. Better next moves, roughly in order of expected
value:

- **Profile a release build.** `reactCompiler: true` is on and this was all measured on a *dev*
  bundle with Fast Refresh. If idle commits drop to zero in release, this costs users nothing and the
  lag is a dev-only phantom. This is the cheapest possible falsification and it has never been run.
  **Do this first.**
- Bisect the four `useEffect`s and the `ThemeProvider` in `src/app/_layout.tsx` — it has no
  `useState`, so the root itself is not the setter, but something beneath it is.
- Investigate the **duplicate lesson mount**. Two live copies of a heavy screen doubles every timer
  and every subscription in it.
- Check whether Reanimated's `useAnimatedProps` on `react-native-svg` elements is falling back to JS
  re-renders. `AnimatedComponent(G)` and `AnimatedComponent(View)` appeared prominently in every
  self-time profile, and `breath`, `sway` and `rock` are all `withRepeat(..., -1, true)` — infinite,
  continuous, and never idle.
- Consider whether 5 Atlas and 6 AmbientBackground instances should exist simultaneously at all.

### 4.2 The paywall — App Store side fixed, app side untested

**Fixed in the previous session, verified via the ASC API:**

- Both products moved `MISSING_METADATA` → **`READY_TO_SUBMIT`**. They were unfetchable by StoreKit,
  which is why RevenueCat reported "no packages" and the paywall was functionally dead.
- Subscription group localization created (it had none, which blocks every product in the group).
- `euphoria_pro_yearly` localization created (it had none). Note Apple caps the description at **55
  characters** — a longer one 409s.
- App Store review screenshots uploaded to both products, using a real capture of the app's own
  paywall.
- A **3-day `FREE_TRIAL` introductory offer created in 175/175 territories** on both products.
  Verified `USA`, `GBR`, `IND`, `CAN` explicitly. Before this, the paywall advertised a free trial
  that **did not exist** and would have charged users immediately.

**Still open and in scope:**

- `src/app/onboarding.tsx:73-74` hardcodes `monthly: '$9.99'` and `annual: '$79.99'`. The paywall
  renders those regardless of what the store returns, so **a completely broken purchase path looks
  perfectly healthy**. This is the exact failure class in §3.1 and it is the reason nobody noticed
  the paywall was dead. Decide whether to render real StoreKit prices, or to fail loudly when the
  offering is empty. Do not leave it silently lying.
- RevenueCat's offering → package → product mapping has never been verified end to end against the
  now-valid products.
- **No purchase has ever been completed.** Not in sandbox, not anywhere. Until someone taps buy and
  gets an entitlement, the paywall is unproven.
- There is a stray empty subscription group named **"Monthly"** (id `22020910`) with nothing in it,
  alongside the real group "Euphoria Pro" (`22020937`). Clutter that can confuse product mapping.

### 4.3 There is no account system — expect reports about it

`src/app/auth.tsx` (route `/auth`) has a "Sign up" button and a "Signed out? Sign back in" line. A
comment in that file is explicit:

> "Existing user? Sign in" implied ACCOUNT RECOVERY. There is none — a returning user on a new phone
> signs in and gets an empty account, because there was never an account.

The screen is reached from exactly two places: `onboarding.tsx:372` (`router.replace('/auth')`) at
the end of onboarding, and `you.tsx:430` after sign-out. So it appears **once** and most testers will
never see it again. Expect "I lost my progress," "why did it not remember me," and "I could not find
sign in." Per §1.6 those are real bugs even though the behaviour is intentional.

### 4.4 The App Store submission is REJECTED

Both the app info and version 1.0 are in state **`REJECTED`**, with a review submission from
2026-04-08 in state `UNRESOLVED_ISSUES`. This is *not* a TestFlight blocker and does not affect the
feedback session, but the owner should know before he plans a public launch. The rejection reason was
not retrieved. Review contact on file is Sriyan Bodla, `team.euphoriainv@gmail.com`, 469-937-0299,
with a demo account `Applereview@gmail.com`. Only `APP_IPHONE_65` screenshots exist; modern
submissions generally want 6.9-inch too.

### 4.5 Smaller known-open items

- Build archives upload at ~158MB and only ~15MB of that is tracked files. The remaining ~143MB was
  never explained. `.easignore` exists and excludes `refs/`, `screenshots/`, `scripts/anim/`, the
  native dirs and all credential patterns.
- `npm run lint` exits non-zero on **8 known-benign `react-hooks/set-state-in-effect` errors**. Each
  was read individually and none is a cascading render; the analysis is in `refs/TASK_QUEUE.md`. A
  permanently red gate is one nobody reads — either downgrade the rule to `warn` with the reasoning,
  or add targeted disables. It is a project decision and was deliberately not taken unilaterally.
- ~85MB retained across 50 navigations, roughly 1.4MB per navigation. GC reclaims ~35MB on idle so it
  is not a runaway, but the floor moved from 72.7MB to 142.7MB. Dev-build confound was never closed.

---

## 5. WHAT IS ALREADY FIXED — DO NOT REDO THESE

| area | what changed | evidence |
|---|---|---|
| **NativeWind** | Fully unwired — all three hooks: `withNativeWind` in `metro.config.js`, `jsxImportSource` in babel, the `global.css` import. `babel.config.js` deleted. | `CssInterop.View` 4,672 → **0** commits. App visually identical by screenshot. |
| **Atlas blink** | React state → Reanimated shared value, crossfaded by opacity | correct fix, **no measurable aggregate change** |
| **Atlas `ringProps`** | new-array-per-render → memoised, so `AtlasMarkBody`'s `memo` works | correct fix, **no measurable aggregate change** |
| **AmbientBackground** | memoised | 131 → 0 commits |
| **SVG components** | memoised across the set | −55% commits, −29% duration on Learn |
| **NumberRollup** | stored the string, capped at 24fps | ~70% fewer renders (54 → 13 for XP) |
| **Course loader** | promise cache with rejection eviction | 20 → 2 fetches |
| **News images** | | 831KB → 10.6KB |
| **Logo bundle** | | 3.48MB → 0.79MB |
| **`[store] rehydrate failed`** | log severity only — behaviour was already correct; the error fired on an *expected* static-render rejection and read like a production defect | guarded on `typeof window` |
| **EAS node** | pinned `24.14.1` to match the npm 11 resolver that writes the lockfile | fixed 5 consecutive build failures |
| **`.easignore`** | added; excludes `refs/`, `screenshots/`, `scripts/anim/`, `/ios`, `/android`, all credential patterns | 304MB → 158MB |
| **App icon** | happy Atlas on `#09090D`, composed from the app's own geometry | shipped in build 11 |
| **App Store Connect** | API enabled, team key, widget bundle id, app group, distribution cert, 2 profiles, tester groups, subscription metadata, 3-day trial in 175 territories | all verified via API |

---

## 6. TOOLING — EXACT RECIPES THAT WORK

### 6.1 Shipping to TestFlight

```bash
./scripts/ship-testflight.sh 86cf89c1-ed5f-441d-9ae4-575aa7433937
```

Builds and submits with no prompts. The issuer id is the only argument; the key id is read from the
filename in `.secrets/`.

| thing | value |
|---|---|
| ASC API key | `NJ4H5Q7248`, App Manager, Team Key, at `.secrets/AuthKey_NJ4H5Q7248.p8` (gitignored) |
| Issuer ID | `86cf89c1-ed5f-441d-9ae4-575aa7433937` |
| Apple Team | `9SS423KXF5` — RAMYA SMITHA CHILAMANTULA (Individual) |
| ASC app id | `6761808087` |
| EAS account | `s-k-28` (`app.json` hard-codes `owner`) |
| Bundle ids | `com.euphoriainv.euphoria`, `com.euphoriainv.euphoria.widget` |
| App group | `group.com.euphoriainv.euphoria` |
| Current build | **12** — the first OTA-capable build |

**AFTER EVERY SUCCESSFUL SUBMIT YOU MUST ATTACH THE BUILD TO THE TESTER GROUPS.** A build that is
`VALID` but in no group is installable by **nobody**. This is exactly what left builds 6, 7 and 8
processed and invisible for months, and it is the single easiest way to waste a whole build.

```
POST /v1/betaGroups/{groupId}/relationships/builds   body: {data:[{type:'builds', id: buildId}]}
  "Internal Testers"  b0a6793e-891f-4751-aee1-fb013212116a   (internal, no Apple review)
  "Cofounders"        cd11088f-5f96-495a-a766-38bff3d2fc9e   (external, needs Beta App Review)
```

A watcher that polls until the build is `VALID` then attaches it lives at
`scratchpad/watch-latest.mjs` — **but note its bug**: it attaches the *newest* build, and if an older
build is already `VALID` it fires immediately on the wrong one. Filter by the expected version.

### 6.1b DO NOT REBUILD FOR A JS FIX — SHIP IT OVER THE AIR IN ~2 MINUTES

Set up 2026-08-22. **Read this before you cut a single build.** A full build is ~20-25 minutes;
an over-the-air update is ~1-2. Almost every fix in a feedback-driven debug session is JavaScript.

```bash
npx eas update --branch production --environment production --message "what you fixed"
```

Testers force-quit and reopen; the update is live. `--environment` is REQUIRED in
`--non-interactive` mode or the command errors.

| channel | branch | who is on it |
|---|---|---|
| `production` | `production` | everyone on TestFlight |
| `preview` | `preview` | internal-distribution builds |
| `development` | `development` | dev-client builds |

**What OTA CANNOT ship — these still need a real build:** any native module added or removed,
anything in `app.json` that affects the native project (icon, splash, permissions, entitlements,
plugins, bundle identifiers), and any change to `runtimeVersion`. If you are unsure whether a change
is native, it is safer to build.

**runtimeVersion policy is `appVersion`.** An update only reaches builds whose app version matches.
Bump `version` in `app.json` and every existing install stops receiving updates until it is
replaced. Do not bump it casually mid-session.

**Builds 8-11 can NEVER receive updates.** A binary only listens if it was compiled with a channel,
and `expo-updates` did not exist before build 12. **Build 12 is the first OTA-capable build** and
everyone must install it once.

**A bug that WILL bite you if this ever regresses:** `eas update` publishes iOS and Android in ONE
manifest. An invalid Android config rejects the iOS update too. `android.package` was
`com.euphoria.native` and `native` is a reserved Java keyword, so every update failed with an
Android validation error on an iOS-only app. Fixed to `com.euphoriainv.euphoria`. If an update ever
fails for a reason that makes no sense, check the Android half of the manifest.

**Verify the pipeline before you depend on it.** The above was found by publishing a deliberate
no-op update as a test rather than discovering it on the first real fix.

### 6.1c INSTANT ITERATION WITH THE DEV CLIENT

For anyone with a development build installed:

```bash
npx expo start --tunnel      # public URL: phones do NOT need to be on this Wi-Fi
```

Every save appears on every connected phone in under a second, no command and no build. This is the
fastest possible loop and the right default when working live with the owner.

`eas.json` profiles: `development` is the **physical device** build (`developmentClient: true`,
`distribution: internal`, and it must NOT set `ios.simulator`). `development-simulator` is the
simulator variant. The original profile set `ios.simulator: true`, which builds a simulator-only
binary that can never install on a phone.

**Device registration.** `npx eas device:create` prints a QR and a shareable link; one link
registers the whole team. **UDIDs are baked into the binary at build time** — anyone registering
after a build needs a rebuild with `--refresh-ad-hoc-provisioning-profile`. Expo captures the UDID
at registration and syncs it to Apple during the build, so Apple's device list legitimately lags
Expo's; that is not a fault.

**Ad-hoc credentials cannot be created non-interactively.** `eas build --profile development
--non-interactive` fails with "couldn't find any credentials suitable for internal distribution."
The owner must run it interactively **once**; after that the profile is stored on EAS and every
later dev build is non-interactive. Same shape as the distribution-certificate wall.

**Check env vars per environment.** The first dev build warned "No environment variables found for
the development environment" and would have launched with no RevenueCat key, no PostHog and no
Google client ID — an app broken in ways that look exactly like new bugs. All 7 vars now cover
`production`, `preview` and `development`. Add new ones to all three with
`eas env:update --variable-name X --variable-environment production --environment production
--environment preview --environment development`, which never reads or reprints the secret.

### 6.1d STOP PIPING BUILD OUTPUT THROUGH `tail`

`npx eas build ... | tail -30` reports **exit code 0 even when the build failed**, because `tail`'s
status is what the shell sees. This masked two separate failures in one session and cost real time
both times. Grep for the outcome instead:

```bash
grep -aiE "Build failed|Submitted your app|successfully uploaded|Error:" "$LOGFILE" | tail -8
```

### 6.2 Reading an EAS build log — the recipe that actually works

```js
const b = JSON.parse(execSync(`npx eas build:view ${id} --json`).toString());
const t = await (await fetch(b.logFiles[0])).text();   // node fetch decodes brotli natively
const recs = t.split('\n').filter(l => l.startsWith('{')).map(l => JSON.parse(l));
recs.filter(r => r.phase === 'INSTALL_DEPENDENCIES').forEach(r => console.log(r.msg));
```

`logFiles[0]` is a **short-lived pre-signed URL** served with `content-encoding: br`. Fetch it fresh
each time; it expires. **Do not use `curl` + `gunzip`** — it yields binary garbage and sends you into
a format-archaeology rabbit hole. The log is JSON-lines with `phase` and `msg` fields. A healthy iOS
build walks: `SPIN_UP_BUILDER → INSTALL_CUSTOM_TOOLS → PREPARE_PROJECT → READ_EAS_JSON →
READ_PACKAGE_JSON → INSTALL_DEPENDENCIES → READ_APP_CONFIG → RUN_EXPO_DOCTOR → PREPARE_CREDENTIALS →
PREBUILD → INSTALL_PODS → CONFIGURE_XCODE_PROJECT → EAGER_BUNDLE → RUN_FASTLANE →
UPLOAD_APPLICATION_ARCHIVE`.

**If a build fails, read the log BEFORE changing anything.** Four builds were burned eliminating
candidates because the log was unreadable.

### 6.3 The App Store Connect API helper

`scratchpad/asc.mjs` mints an ES256 JWT and exports `api(path, {method, body})`. Notes learned the
hard way:

- The JWT must be signed with `dsaEncoding: 'ieee-p1363'` — node's default DER is rejected.
- `exp` must be ≤ 20 minutes out. Mint a fresh token per long-running loop iteration.
- Relationship endpoints return **204 with an empty body**; calling `.json()` blindly throws.
- Some relationships forbid `GET_RELATED` (e.g. `builds/{id}/betaGroups`) — query from the other side.
- **App Manager can create bundle ids, certificates, profiles AND manage users.** A previous session
  predicted a 403 on user management and was wrong.

### 6.4 metro-mcp — runtime truth

Always `get_current_route` before trusting a screenshot or profile. `start_profiling` /
`stop_profiling` use the fiber commit hook and work everywhere except lesson navigation, which breaks
them. `evaluate_js` is the sharpest tool available for this codebase — it is how the idle-commit
instrumentation was built. `get_network_requests`, `get_console_logs`, `find_components`,
`get_component_tree` all work.

The console is worth reading unprompted. It is how the dead paywall was discovered — RevenueCat was
logging `None of the products registered ... could be fetched from App Store Connect` on every
launch and nobody had looked.

### 6.5 Project checks

```bash
npx tsc --noEmit            # must exit 0
npm run check               # must pass: motion invariants + market-marks + reduced-motion audit
node scripts/motion-invariants.mjs --selftest    # 11 invariants, asserts 11 caught / 11 ignored
python3 scripts/reduced_motion_audit.py --selftest
```

`npm run check` currently reports **11 motion invariants across 172 files**. Keep it green. Both
selftests exist because a previous session's invariant silently stopped matching after someone
changed an anchor string, and two invariants had zero coverage for a while without anyone noticing.

### 6.6 Simulator

Device `755B55D9-8E4B-431C-9D1D-A635F38CFF5F` (iPhone 17 Pro). URL scheme `euphorianative`.

```bash
xcrun simctl openurl <DEV> "euphorianative:///onboarding?step=paywall"
xcrun simctl io <DEV> screenshot out.png
xcrun simctl terminate <DEV> com.euphoriainv.euphoria && xcrun simctl launch <DEV> com.euphoriainv.euphoria
```

Foreground `sleep` is blocked by the harness. Use `end=$((SECONDS+8)); until [ $SECONDS -ge $end ];
do sleep 1; done` or `run_in_background`.

---

## 7. ARCHITECTURE ORIENTATION

React Native 0.86.2, React 19.2.3, Expo ~57.0.13, expo-router, reanimated 4.5.1, react-native-svg,
zustand with `persist` over AsyncStorage. React Compiler enabled via `app.json` experiments.
**NativeWind is installed but fully unwired** — there is no `babel.config.js` and `className` does
nothing. Do not reintroduce it without restoring all three hooks together; fewer than all three is a
broken setup because `nativewind/doctor.js` throws.

| file | why it matters |
|---|---|
| `src/app/_layout.tsx` | root. 4 `useEffect`s, `ThemeProvider`, no state. Prime suspect region for §4.1. |
| `src/app/index.tsx` | the hydration gate. Routes only after `hasHydrated`. |
| `src/lib/store.ts` | the zustand store, `persist`, `partialize`, `migrate`, `onRehydrateStorage`. Read the comments — they encode real incidents. |
| `src/components/atlas.tsx` | the mascot. 9 expressions, blink/saccade/arc-flex/breath/sway/rock. Heavily commented with measured reasoning. |
| `src/components/atlas-mark.tsx` | the four-ring vector mark, geometry fitted to the old PNG at IoU 0.951. |
| `src/app/onboarding.tsx` | onboarding **and** the paywall (`?step=paywall`). Hardcoded prices at lines 73-74. |
| `src/app/auth.tsx` | sign up / sign back in. No real account system. |
| `src/app/lesson.tsx` | the lesson runner. Mounted twice at runtime — unexplained. |
| `src/shared/motion/tokens.ts` | `Spring.press/snappy/smooth/bouncy/reward/gentle`, `Duration.*`. Every spring has a documented damping ratio. |
| `src/constants/theme.ts` | `colors.background` is `#09090D`, the same as the splash and now the app icon. |
| `refs/SHIPPING.md` | the shipping runbook written this session. |
| `refs/TASK_QUEUE.md` | the performance investigation log, including the corrected item 10. |

**The comments in this codebase are unusually load-bearing.** They record incidents, measurements and
decisions with dates. Read them before changing the code they sit on; several of them exist
specifically to stop you making a change that was already tried and reverted.

---

## 8. DEFINITION OF DONE

The session is complete when **all** of the following hold:

1. Every item in `refs/FEEDBACK_LOG.md` is `verified` or `wontfix` with a real written reason.
2. The owner has confirmed each fix on his phone from a TestFlight build.
3. `npx tsc --noEmit` exits 0 and `npm run check` is green.
4. Specialist review agents have passed over every batch's diff.
5. The owner has run `/code-review ultra` at the very end and its findings are addressed.
6. Transferable lessons are written into the global `~/.claude/CLAUDE.md`.
7. A final TestFlight build is live and attached to both tester groups.
8. `refs/NEXT_SESSION.md` — this file — is updated for whatever comes after.

---

## 9. A NOTE ON WORKING AT MAXIMUM EFFORT

Max effort is not "think longer about everything." It is spending disproportionate care at the small
number of points where being wrong is expensive, and moving fast everywhere else.

For this session the expensive points are: **parsing the feedback correctly** (a misparsed item gets
fixed wrong and nobody notices until the owner re-tests), **not introducing regressions** (this
codebase has a documented history of confident wrong fixes), and **not claiming something is fixed
when it is not** (the owner chose phone-verification precisely because he does not trust
screenshot-verification, and he is right not to).

Everything else — file reads, greps, routine edits — should be fast and batched. Do not deliberate
over which grep to run. Run several.

The single highest-leverage habit from the previous sessions: **when a result looks clean, spend one
more call trying to falsify it.** Nearly every serious error in this project came from accepting a
plausible result. Nearly every real finding came from a second look that contradicted the first.
