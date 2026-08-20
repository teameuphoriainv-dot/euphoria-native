# CARRYOVER — Euphoria animation audit

**Paste this whole file as the opening prompt of a fresh session.** It is written to be
self-sufficient: mission, the lessons that cost real money to learn, the tooling, what is
already settled, what is still open, and the rules for reporting. Nothing here should need
re-derivation.

Owner: Siddartha. Repo: `~/euphoria-native`. React Native 0.86.2 / React 19.2.3 / Expo ~57.0.13
/ react-native-reanimated 4.5.1 / react-native-worklets 0.10.1 / react-native-svg.

---

## 0. WHY THIS AUDIT EXISTS — read this before touching anything

The owner's words:

> "every single time I give you a prompt for fixing the animation, it either just stays the same
> or gets worse, I need you to understand how the level of animations is right now. That's why
> I'm making you do an entire audit."

That is the whole brief. Previous attempts failed **because they tuned parameters without
measuring anything**, and the single most important finding of this audit explains why:

> **Tuning a spring's damping does nothing when the amplitude is 1pt.** The easing was never the
> problem. Verify the AMPLITUDE before touching the CURVE.

And the second most important:

> **Every failure mode in this codebase produces confident, plausible output instead of an
> error.** Deep links silently no-op. Stale screens report "done" in zero steps. A blocking modal
> eats taps. A driver thread races its successor. h264 compression looks exactly like jank. A
> guessed measurement rectangle yields a clean, quotable, completely wrong number. **Nothing will
> tell you that you are wrong.** You must test the confound yourself, every single time.

Eleven claims in this audit were retracted after being written up. That is not a failure of the
audit; it is the audit working. Retract in writing, with the reason, and keep the retraction.

---

## 1. BINDING LESSONS — do not relearn these, they each cost hours

1. **Take every measurement region from the ACCESSIBILITY TREE, then draw the box on a
   screenshot and look at it.** A guessed rectangle produced this audit's single biggest false
   finding: "Atlas is under-animated" was measured on a box sitting ABOVE Atlas (~y=79–245; the
   real frame is x=135 y=276 w=132 h=137). Re-measured correctly, Atlas moves in **99% of frames
   changing 87%×88% of its box**, versus Duolingo's **81% / 54%×48%** — Atlas is MORE animated
   than the reference. Four separate analyses inherited that bad input and all four agreed with
   each other. **Agreement between analyses that share an input is not corroboration.**

2. **Capture with `idb video-stream --fps 60` (~47.7fps real). NEVER `simctl io recordVideo`** —
   it is fixed **15fps**, which gives ~4 samples across a 280ms spring and cannot separate a
   clean settle from an overshoot. Extracting a 15fps file at 30fps duplicates frames; that
   duplication was briefly misread as *Atlas rendering at 15fps*. **Check the container before
   blaming the app.** Gotcha: adding `--scale-factor` makes `video-stream` write a **zero-byte
   file and exit 0**. Do not "optimise" the capture.

3. **h264 ghosting looks exactly like jank.** Never call a transition janky, torn or smeared
   without a lossless capture. The tell: in a compressed frame the tab bar and status bar stay
   perfectly sharp while only the changing region is blocky with hard macroblock edges. A real
   rendering fault would not respect that boundary. This was nearly filed as an app defect off
   one frame of the `learn` entry transition.

4. **Deep links silently no-op on pushed screens.** `openurl` returns success and nothing
   changes. **Verify navigation by comparing label sets before/after**, and treat any capture
   taken without that check as worthless. A whole route-audit pass was retracted because only
   9 of 23 routes actually navigated; the other 14 described the wrong screen in confident detail.

5. **Accessibility ROLE is unstable.** The same control reports `AXButton`, `AXGenericElement`
   and `AXImage` across runs. Key on **content or `AXValue`**, never role. Checkbox state arrives
   as `AXValue: 'checkbox, checked'`, not as a role. A driver keyed on `AXButton` drove **0 steps**
   and filmed static intros while reporting success.

6. **`idb ui describe-all` emits `"AXLabel":"` with no space after the colon.** Parse the JSON;
   string-splitting produced a false "0 labels" reading.

7. **Test every confound before reporting.** Concrete cases from this audit: "16% of transitions
   bounce" was the DRIVER tapping twice plus compression ghosting. "Transitions are 3× too fast"
   collapsed to **1.24×** once the same duration floor was applied to both sides. "Cross-fade
   overlaps two screens" is `slide_from_right`, the iOS Stack default — two screens visible
   during a push is how a push works. "Lesson art ships 2 shapes" was actually **40 distinct
   designs across 295 titles**, longest identical run 2.

8. **Per-channel max when differencing frames. NEVER `.convert('L')`.** Luminance weights blue at
   0.114, so a blue-only shift of +20 scores as 2 on this violet-on-near-black palette and
   vanishes. Every diff script here has a blue-only fixture in its self-check.

9. **The simulator is the OWNER'S SCREEN.** Restore any setting you change — `content_size`,
   reduce-motion — **in the same bash call**, and verify the restore. Never leave it dirty.

10. **Known-dead lane:** writing `ReduceMotionEnabled` to the sim plist does **not** reach the app
    process. Verified across a full sim reboot with the app instrumented. Do not retry it; use
    `scripts/reduced_motion_audit.py` (static analysis) instead.

11. **A lane that under-reports is worse than one that over-reports.** The reduced-motion lane
    once reported "0 defects" while `tap-reveal` had no guard at all. It now covers 32 files and
    has `--selftest` asserting 4 defect shapes caught and 3 static shapes ignored, so its **0 is
    a proven zero**. Any new lane needs the same treatment before its output is quotable.

12. **Look at the artifact, do not infer from its name.** "No Duolingo video exists on this
    machine" was wrong — `ScreenRecording_07-21-2026 14-17-49_1.mov` (ref3, 268s, 8,047 frames,
    the largest of the three and 198 of the 330 motion windows) IS Duolingo. The Duo owl is
    plainly visible on the first extracted frame. The file was judged by its generic filename.

---

## 2. THE MEASURED STANDARD — `refs/MOTION_RUBRIC.md`

Derived from `refs/videos/*.mov` (3 recordings, 108s + 122s + 268s, all genuinely 30fps) →
**14,974 frames → 330 motion windows → 307 discrete transitions**. Every FIX/IMPROVE/KEEP verdict
must cite a rubric line and a measured number.

**R1 duration** (n=307): min 0.10 · p10 0.13 · p25 0.27 · **median 0.40** · p75 0.67 · p90 1.20 ·
max 1.97. Rule: a discrete transition belongs in **0.27–0.67s**; outside 0.13–1.20s needs a
stated reason. Euphoria's own step choreography (EXIT 150 + GAP 90 + HEADLINE 280 + ATLAS_LEAD
150 ≈ 670ms) lands exactly at p75 — **KEEP**.

**R2 settle**: single-peak rate by band — <0.25s **87.8%** · 0.25–0.40s 50.7% · 0.40–0.60s 50.0%
· 0.60–1.00s 21.3% · 1.00–2.00s 10.8%. Of 124 transitions under 0.35s, **73% are single-peak**.
Rule: **bounce is a deliberate per-element exception, never a library default.** An overshoot
inherited from `springify()` fails R2; the same overshoot chosen and commented for one element
passes.

**R3**: peak count tracks duration almost perfectly (1-peak median 0.30s → 8-peak median 1.37s).
Long multi-peak windows are **stagger, not oscillation**. Rule: check whether a multi-peak window
is stagger (correct) before treating it as overshoot (defect).

**R4 scale origin** (partial, 1 transition): ref3 frames 381–394, the Duo mascot entering — box
width holds 63–83px while x sweeps 102→21. **It TRANSLATES at constant size.** Across 238
transitions the smallest starting footprint is **9.2% of screen width**. Nothing in the reference
enters by growing from zero; `ZoomIn`-from-scale-0 has no counterpart in the footage. Provisional
— needs 3–5 more measured transitions to close.

**R5 exit behaviour**: OPEN. **R6 easing shape**: OPEN. No verdict may cite them.

**R7 idle mascot liveness**: Duolingo ref3 frames 400–900 — **81% of frames**, mean changed region
**54%×48%** of the mascot's own box. Euphoria's Atlas re-measured like-for-like: **99% / 87%×88%**.
Atlas PASSES. Do not raise `IDLE_SQUASH` or shorten the saccade gate; it would make an already-
lively mascot frantic.

**What whole-frame differencing CANNOT answer**: which element moved, or by how much. Overshoot
magnitude, scale origin and exit behaviour per element need bbox curves. Euphoria can do this
(a11y tree gives every element's frame); the reference recordings cannot (a video has no a11y
tree), which is why R4/R5/R6 stay open.

---

## 3. TOOLING — built, self-checked, do not rebuild

`scripts/anim/` — every module carries `assert` self-checks:

| module | what it does |
|---|---|
| `capture.py` | `record()` via idb video-stream + `real_rate()` — always call `real_rate`, never assume fps |
| `segment.py` | per-frame changed-pixel count at ¼ scale; contiguous runs >0.4% become motion windows |
| `oscillate.py` | counts significant local maxima in a window (bounce vs clean settle) |
| `filmstrip.py` | labelled contact strip + bbox curve for one window |
| `drive.py` | solves the 9 lesson step kinds; `dismiss_logbox()`, `dismiss_sheet()`, `at_launcher()`, `reconnect()`, `nodes()`, `labels()` |
| `solve.py` / `lesson-answers.mjs` | extracts correct AND wrong answers from the curriculum |
| `route_audit.py` | per-route navigation verification; marks non-navigating routes SKIPPED |
| `mascot_density.py` | like-for-like mascot vs control-region motion density |
| `sweep.py`, `audit_app.py`, `entry_probe.py`, `tf_probe.py` | batch drivers |

`scripts/reduced_motion_audit.py` — 32 files, `--selftest` must keep passing. VESTIBULAR patterns
use negative lookaheads with `\s*` **INSIDE** the lookahead (outside, the engine backtracks and
static transforms false-positive — that produced 3 phantom defects).

Device facts: UDID `755B55D9-8E4B-431C-9D1D-A635F38CFF5F` (iPhone 17 Pro, iOS 26.5), bundle
`com.euphoriainv.euphoria`, scheme `euphorianative`. Deep link
`euphorianative://lesson?course=<id>&num=<n>` plus 26 routes in `routes.sh`.

Driver gotchas, all previously fatal: a quiz will not advance until an option is selected (tapping
Check first is a silent no-op); the **slider's first tap is swallowed** (bailing on one no-op
aborts a working control); `find_step` had a precedence bug where a short label matched a longer
option; `t.join(timeout)` does NOT stop a thread — use a `threading.Event`; an edit can drop the
app to the Expo dev-client launcher, which reads as a valid screen with few labels.

---

## 4. WHAT IS ALREADY FIXED — do not redo

| commit area | what changed |
|---|---|
| `onboarding-parts.tsx` | **Owner bug #1.** Removed `withSequence(withSpring(1.035, Spring.bouncy), withSpring(1, Spring.smooth))` on option select — 1.035 plus bouncy's ζ=0.72 overshoot reached ~1.076 then shrank. Redundant: `fill` + border already signal selection. **Verified on device: 355.7pt peak vs 354pt resting** (old pop would hit ~381pt). |
| `slider-predict.tsx` | **Owner bug #2.** Was calling `runOnJS` TWICE per frame (~120 JS round-trips/sec, each re-rendering). Geometry was always correct; the READOUT saturated the JS thread. Now `onTouched` fires once in `onBegin`, `setGuess` gated on `EMIT_STEP` 0.005, `onEnd` emits the exact value. |
| `reward-pop.tsx` | `{stiffness:500, damping:18}` (ζ=0.40, ~25% overshoot) → `Spring.reward` (ζ=0.55, ~12%). Bounce KEPT — a reward chip should pop; R2 only requires it be deliberate. |
| `tap-reveal.tsx` | Rewritten. Was `ZoomIn.springify().damping(16)` (ζ=0.8 inherited, scale-from-0, hard-cut exit). Now `RevealFaces` cross-fades both mounted faces, whichever shows sits in flow and the other is absolute — fixing a regression I introduced where cards grew 118→235pt and the last row fell 68pt off-screen. |
| `search/friends/why-not-free.tsx` | Had NO entrance at all. Added `RiseIn` stagger, `Math.min(i*STAGGER_GAP, STAGGER_CAP)`. search 0.11s/1pk → 1.08s/13pk; friends 1pk → 7pk. |
| `digest/[slug].tsx` | Masthead split from one `RiseIn` into four staggered siblings. 0.07s/147k-px slam → 0.26s, moving it from below R1's p10 into the reference band. |
| `courses.tsx` | All 12 courses grouped by tier; chips jump via `measureLayout` against `innerRef` (cached `onLayout` y was pre-animation and put ADVANCED 227pt off). |
| `api/market+api.ts` | WebP/AVIF → PNG via `sharp`; reads body ONCE before branching (`arrayBuffer()` consumes the stream). |
| `reduced_motion_audit.py` | 32 files, self-tested, **0 defects proven**. |

**Sweep confirming both owner bug CLASSES are now clean** (re-run it; it is 30 lines of regex):
- scale-pop `withSequence` to >1: **1 hit, and it is the comment documenting the removal**
- `runOnJS` inside `onUpdate`/`onChange`: **2 hits in slider-predict — one gated by EMIT_STEP, one in `onEnd` (fires once, correct)**
- `ZoomIn`/scale-from-0: **1 hit, the comment in tap-reveal**

**Deliberate overshoots that must NOT be flattened** (each is a per-element documented choice,
which is exactly what R2 requires):
- `streak-ignite.tsx` 1.5→0.94→1.04→1 over `Duration.earned` 3200ms — the Duolingo-modelled
  two-stage streak ignite (build → burn → burst → white flash → resolve). Fires once per streak.
- `atlas.tsx` entrance `withTiming(0.93, 430ms)` then `withSpring(1, {190,12})` — springs from
  0.93, so ζ=0.44 applies to a 0.07 delta and peaks at ~**1.015**. The undershoot IS the landing.
- `atlas.tsx` 12 inline springs at ζ 0.37–0.58 — deliberate mascot squash-and-stretch. The plan
  says explicitly: *"I will not flatten Atlas into something lifeless."*
- `league-crest.tsx` `withRepeat`/`withSequence` — that is a **glint** (opacity), not a scale.
- `lesson-feedback.tsx` ζ=0.61 on a translateY, commented "thrown into place, not slid".

---

## 5. RETRACTED CLAIMS — each was written up, then disproven

Keep these visible; they are the audit's error log.

1. "Atlas is under-animated (38%/46%)" — measured on a guessed rectangle above the mascot. Real:
   99%/87%×88%, better than the reference. **Tasks 1a/1b cancelled.**
2. "No Duolingo footage exists" — it was ref3, the largest recording.
3. "Device captures are 30fps" — `simctl recordVideo` is fixed 15fps.
4. "The app renders at 15fps" — that was ffmpeg duplicating frames from a 15fps container.
5. "3 reduced-motion defects" — all static transforms; regex backtracking.
6. "Lesson art ships 2 shapes" — 40 distinct designs, longest run 2.
7. "Transitions are 3× too fast" — 1.24× at a like-for-like floor.
8. "16% of transitions bounce" — driver double-taps plus h264 ghosting.
9. "Cross-fade overlaps two screens" — standard iOS `slide_from_right`.
10. "9 of 23 routes audited successfully" — only 9 navigated; the table was retracted and replaced
    with a 24-of-25 verified one.
11. "30 commits" — actual count was 42. **Count, do not estimate.**

---

## 6. OPEN QUEUE

- [ ] **Atlas head tilt unverified.** Implemented in `edb036e`. Every deep-linkable screen renders
      an expression whose tilt is 0; reaching `oops`/`thinking` needs a **deliberately wrong
      answer** mid-lesson. The extractor already knows which answer is wrong. `EXPRESSION_TILT`
      values: `thinking` −7° (largest, "the classic cocked head"), others −3° and under.
      Trigger site: `lesson.tsx:431-434` sets `expression`, `shake` and `celebrate` off
      `checked && pick !== norm.correct`.
- [ ] **`celebrate` and `shake` unmeasured.** Same wrong-answer path. `shake` is `atlas.tsx:328-339`
      (ζ=0.58, "V1 balance-scale reference"); `celebrate` is `:268-286`, hop height `size*0.12*gain`.
      Note `celebrate` is a **latching boolean** — `celebrateKey` must be bumped to re-fire.
- [ ] **Content resting motion.** `courses` (35%) and `digest` (49%) mount `AmbientBackground` but
      are dense grids of opaque cards that OCCLUDE it, so they go still. The app feels alive in
      inverse proportion to how much content is on screen. **Recorded as an observation, not a
      defect** — there is no reference anchor for resting motion on a reading screen.
- [ ] **`search` 0.0% and `explore-compound` 1.0% idle motion.** The only zero-motion screens.
      NOT filed as a defect: `starCount` does not explain it (`news` runs 24 stars with glow off
      and still reaches 17.2% against search's 22 at 0.0%), so it is content, not configuration.
      Someone should decide this deliberately.
- [ ] **Crest ladder** — Saver (rank 0) is a bare shield; emblems could carry more identity.
- [!] **RevenueCat offering has no packages** — `refs/IAP_OFFERING_REPORT.md`. Dashboard fix, no
      code change available. **Commercially the most serious finding of this audit**: the app
      cannot sell anything. Its LogBox banner (y≈800–822) also overlaps `Continue` (y=760–816) and
      eats taps; `drive.py` dismisses it, but that is test tooling papering over a real
      misconfiguration. The warning text also sends you to check PRODUCT ids while `findPackage`
      resolves on PACKAGE ids.
- [ ] **Regression floor (Phase E).** `npm run check` runs 16 regression scripts and **no visual
      check**. Freeze corrected curves as golden frames, diff with the installed `odiff`. Without
      this the next animation added regresses silently.

**Owner-blocked — report, do not fix:** the nine 1pt type steps between 13 and 22; Corporate
Finance lessons 1–5 missing upstream (use 6–10, and say so); the 6 remaining unpinned non-currency
`toLocaleString` sites; lip sync (Atlas has no mouth). **Rejected by owner: the 3D card flip.**

---

## 7. HOW TO WORK

**Per verified unit:** fix → re-run the IDENTICAL measurement → publish before/after → `npx tsc
--noEmit` exits 0 → `npm run check` exits 0 → `scripts/reduced_motion_audit.py --selftest` passes
→ commit and push to main with a `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` trailer →
append one row to `refs/LOOP_LEDGER.md`. **A fix without its re-measurement is not done.**

**Every fix lands on a `src/shared/motion/tokens.ts` value, never a fresh magic number.** Tokens:
`Spring.press/snappy/smooth/bouncy/reward/gentle`, `Duration.instant/fast/exit/base/slow/screen/
count/earned`, `Ease.enter/exitCurve/inOut/out/outCubic`, `STAGGER_GAP=60`, `STAGGER_CAP=360`.

**Reporting rules the owner set explicitly:**
> "before sending verify 3 times before sending anything and make sure everything you are sending
> is factual information only and make sure everything is well formatted and not bs formatting"

So: cite file:line. Quote measured numbers with their units and sample size. Say "I have not
verified X" rather than implying you did. Distinguish an observation from a defect. Report cost
warnings, never push through them silently. Never claim a screen was tested if navigation was not
label-verified.

**Cost posture:** the owner has said repeatedly *"I do not care about the session cost or the
session context"* and has overridden the CLAUDE.md stop-on-cost-warning rule for this audit. The
warning must still be **surfaced in the response**, every time it fires. Session total reached
~$1,528 by 2026-08-20.

**Do not launch agents, workflows or background tasks unless explicitly asked** (CLAUDE.md).

---

## 8. THE ONE-LINE VERSION

Measure the amplitude before the curve; take the region from the a11y tree and look at it; capture
at 48fps not 15; verify navigation before trusting a frame; assume every failure will look like a
success; and retract in writing when you are wrong.
## Appendix A — animation inventory, all 34 animation-bearing files

Generated by static analysis. `guard` = has a literal `useReducedMotion`; **delegated** means it
animates only through `RiseIn`/`SpringPressable`/Reanimated layout animations, which honour
reduce-motion themselves (`entering`/`exiting` default to `ReduceMotion.System`). Both are
correct; the reduced-motion lane's named exemptions cover the rest. zeta = damping ratio;
below 0.7 overshoots visibly.

| file | guard | gestures | entering | ζ from tokens | ζ inline | durations (ms) | repeat/sequence |
|---|---|---|---|---|---|---|---|
| `app/(tabs)/home.tsx` | yes |  |  |  |  | 1500 | 2/0 |
| `app/chat.tsx` | delegated |  | FadeIn |  |  |  | 0/0 |
| `app/digest/[slug].tsx` | delegated |  | FadeIn |  |  |  | 0/0 |
| `app/games/term-match.tsx` | delegated |  | FadeIn |  |  |  | 0/0 |
| `app/lesson.tsx` | delegated |  | FadeIn,FadeInDown |  |  |  | 0/0 |
| `app/onboarding.tsx` | delegated |  |  |  |  |  | 0/0 |
| `app/reward.tsx` | delegated |  | FadeIn |  |  |  | 0/0 |
| `app/welcome.tsx` | yes |  | FadeIn |  | 1.0 |  | 0/0 |
| `components/ambient-background.tsx` | yes |  |  |  |  | 19000 | 3/0 |
| `components/animated-chart.tsx` | yes |  |  |  |  |  | 0/0 |
| `components/atlas-speech.tsx` | yes |  |  |  | 0.47 |  | 0/0 |
| `components/atlas.tsx` | yes |  |  | 0.99 | 0.37,0.38,0.4,0.42,0.44,0.48,0.52,0.58,0.78,0.83,0.9 | 50,55,60,70,90 | 5/10 |
| `components/before-after-slider.tsx` | delegated |  | FadeIn |  |  |  | 0/0 |
| `components/celebration-burst.tsx` | yes |  |  |  |  | 520,900 | 0/0 |
| `components/confetti.tsx` | yes |  |  |  |  | 850 | 0/0 |
| `components/daily-goal-ring.tsx` | yes |  |  |  |  | 950 | 0/0 |
| `components/league-crest.tsx` | yes |  |  |  |  | 0,620,1900 | 3/2 |
| `components/lesson-feedback.tsx` | yes |  |  |  | 0.61 | 350 | 0/0 |
| `components/multi-select.tsx` | delegated |  | FadeIn |  |  |  | 0/0 |
| `components/number-line.tsx` | delegated |  | FadeIn |  |  |  | 0/0 |
| `components/onboarding-parts.tsx` | yes |  |  | 0.72,0.97,0.99 |  | 700,1000 | 0/2 |
| `components/order-steps.tsx` | delegated |  |  |  |  |  | 0/0 |
| `components/pulse-halo.tsx` | yes |  |  |  |  | 1700 | 2/0 |
| `components/read-reward.tsx` | delegated |  |  |  |  |  | 0/0 |
| `components/skeleton.tsx` | yes |  |  |  |  | 900 | 2/0 |
| `components/slider-predict.tsx` | delegated | 1 |  |  |  |  | 0/0 |
| `components/sort-buckets.tsx` | delegated |  | FadeIn |  |  |  | 0/0 |
| `components/streak-ignite.tsx` | yes |  |  |  |  |  | 0/0 |
| `components/tap-reveal.tsx` | yes |  | ZoomIn |  |  |  | 0/0 |
| `components/tile-builder.tsx` | delegated |  | FadeIn |  |  |  | 0/0 |
| `shared/motion/reward-pop.tsx` | yes |  |  | 0.56 | 0.4 | 200 | 0/0 |
| `shared/motion/rise-in.tsx` | delegated |  | entering | 0.97 |  |  | 0/0 |
| `shared/motion/spring-pressable.tsx` | delegated |  |  | 0.84 |  |  | 0/0 |
| `shared/motion/step-transition.ts` | yes |  |  | 0.99 |  |  | 0/0 |

**Token damping ratios:** `Spring.reward` ζ=0.56 · `Spring.bouncy` ζ=0.72 · `Spring.snappy` ζ=0.84 · `Spring.gentle` ζ=0.97 · `Spring.press` ζ=0.99 · `Spring.smooth` ζ=0.99

---

## Appendix B — the owner's brief, verbatim

Kept as quotations because paraphrase has already cost this audit accuracy once.

> "every single time I give you a prompt for fixing the animation, it either just stays the same
> or gets worse, I need you to understand how the level of animations is right now. That's why
> I'm making you do an entire audit."

> "Make sure the animation bugs are fixed, especially whenever I drag something, it doesn't move
> all over the place and stuff like that. Whenever I click on something, it doesn't become huge
> and become small. Don't make those animations. You need to fix all of that stuff. Understand
> everything from the recording and make sure that you're fixing everything. Do a deep end
> review, and then start fixing everything one by one."

> "Both bugs that I reported are not the only bugs that are there. There are so many more bugs
> like that, so there's a lot of fixing that you need to do."

> "I do not care about how long it takes. I do not care about the session cost or the session
> context."

> "before sending verify 3 times before sending anything and make sure everything you are sending
> is factual infromation only and make sure everything is well formatted and not bs formattign"

> "the card flip question is not like if you do a 3D flip" — **the 3D flip is rejected. Do not
> build it.**

> "I also want you to go through at least 15-20 digest articles." — done, 18 opened in sequence.

> "you have over 30+ videos and over 100 different screenshots of how Duolingo, Brilliant,
> Finch… Just utilize all of those" — **what actually exists on this machine is 3 recordings
> (`refs/videos/*.mov`) and 21 Finch stills.** An exhaustive sweep of all volumes, iCloud Drive
> and the Photos library found no others. Say so rather than implying wider coverage.

Standing constraints still in force:
- The simulator is the OWNER'S SCREEN. Restore anything you change in the SAME bash call.
- Never launch agents, workflows or background tasks unless explicitly asked (CLAUDE.md).
- Report cost warnings; never push through one silently.
- AGENTS.md marks ScreensDesign mandatory for design work; owner answered "Proceed without it".

Owner-blocked — report, never fix: the nine 1pt type steps between 13 and 22; Corporate Finance
lessons 1–5 missing upstream; the 6 unpinned non-currency `toLocaleString` sites; lip sync
(Atlas has no mouth).

## Appendix C — driver bugs found, because they will bite again

Every one of these produced a CONFIDENT WRONG RESULT rather than an error.

| bug | symptom | fix |
|---|---|---|
| `goto_lesson` success check matched the failure screen | Returned True on "That lesson isn't available." because that sentence contains the word "lesson" | Reject the negative before testing the positive |
| route id case mismatch | Routes are kebab-case (`personal-finance`), answers JSON is camelCase (`personalFinance`) | Conversion moved INSIDE `goto_lesson` so no caller can bypass it |
| `advance()` returns a TUPLE | `if not advance():` is always False — a non-empty tuple is truthy. Hid a stall for 8 steps | Unpack it: `moved, how = advance()` |
| tap-reveal gate | Continue is inert until every card is flipped, so the button tap is a silent no-op | Flip all `"…Not revealed yet."` nodes first — the a11y label states the card's own state |
| `find_step` precedence | `a and b in k or k in b` grouped so any SHORT screen label inside a long option matched | One-directional match with a length floor |
| `find_step` length floor | `len(n) >= 4` made numeric options (`"56"`, `"25"`) invisible, so `fillBlank` never matched | Exact match for short options, substring for long |
| role-keyed button lookup | Lesson-intro Continue renders as AXGenericElement — driver drove **0 steps** and filmed static intros while reporting success | Exclude prose instead of requiring a role |
| slider first tap swallowed | Bailing on one no-op aborted a working control | Retry before giving up |
| `t.join(timeout)` | Does not stop a thread; the driver raced its successor | `threading.Event` |
| stale completion screen | Reported `done=True` in 0 steps | Verify labels changed |
| LogBox banner | RevenueCat warning at y≈800–822 overlaps Continue at y=760–816 and eats taps | `dismiss_logbox()` as a standard step |
| route audit parked on home | home→home changed nothing, so home could never be tested | Navigate away first |

## Appendix D — measurement recipe that survives review

```python
# 1. REGION FROM THE ACCESSIBILITY TREE, never guessed
atl = [n for n in drive.nodes() if 'Atlas' in n[4]]
a = atl[0]                       # (x, y, w, h, label)

# 2. DRAW IT AND LOOK. This step is what catches the error that cost this audit most.
im = Image.open(shot); sx = im.width / 402.0
ImageDraw.Draw(im).rectangle([a[0]*sx, a[1]*sx, (a[0]+a[2])*sx, (a[1]+a[3])*sx],
                             outline=(255,0,0), width=6)

# 3. CAPTURE AT ~48fps, and ASK the file its real rate — never assume
record(h, 4.0); n, rate = real_rate(h, 4.0)

# 4. PER-CHANNEL MAX. .convert('L') weights blue at 0.114 and hides shifts on this palette.
d = ImageChops.difference(cur, prev); r, g, b = d.split()
mask = ImageChops.lighter(ImageChops.lighter(r, g), b).point(lambda v: 255 if v > 10 else 0)

# 5. PAD the crop, or growth beyond the resting box is invisible and a pop reads as "no change".
```

## Appendix E — open predictions, written BEFORE measuring

Recorded so they can be judged honestly. **Unverified — do not quote as findings.**

At the lesson quiz-head size of **56pt**:
- `shake` = `±size*0.06` → **±3.36pt, 6.7pt peak-to-peak**, over 60+60+55+55+50ms = 280ms plus a
  ζ=0.58 spring settle. Source `atlas.tsx:328-339`.
- `oops` tilt = **−3°** (`EXPRESSION_TILT`), ≈2.9pt of edge travel on a 56pt box.
- `thinking` tilt = **−7°**, the largest in the set.

**If these measure as predicted, the wrong-answer reaction — the feedback that matters most in a
learning app — is rendered at the SMALLEST Atlas size in the app and sits at the visibility floor
this audit's headline finding identified.** That would be the headline bug class in the place it
hurts most. It is a hypothesis with a number attached, nothing more, until captured.

To reach it: `drive.goto_lesson('personalFinance', 1)` → advance to a step with `options` →
tap a WRONG option → tap Check. `personalFinance` lesson 1 has a `fillBlank` with
`options ['56','25','10','80'], correct 0`.

### Appendix E2 — celebrate + oops tilt, predicted BEFORE measuring (2026-08-20)

Committed before the capture ran, so the result can be judged honestly. The shake round of this
same discipline landed within 1% (3.33pt measured vs 3.36pt predicted).

`lesson.tsx:433-434` passes `celebrate` and `celebrateKey` but **not** `celebrateGain`, so the
default `CELEBRATE_GAIN = 0.32` applies (`atlas.tsx:111`). At the quiz-head `size={56}`:

**H = size × 0.12 × celebrateGain = 56 × 0.12 × 0.32 = 2.15pt**

From `atlas.tsx:269-275`, after a `Duration.fast` = 150ms delay:

| beat | target | spring | ζ |
|---|---|---|---|
| anticipation dip | +0.39pt (down) | timing 110ms | — |
| launch | **−2.15pt (up)** | k=260 c=13 | 0.40 |
| land | 0 | k=210 c=15 | 0.52 |

- **P1 — vertical centroid excursion ≈ 2.5–3.1pt** (dip +0.39 to launch −2.15, plus ~25%
  overshoot from ζ=0.40 on the launch spring).
- **P2 — total duration ≈ 700–900ms** (150 delay + 110 dip + two spring settles).
- **P3 — the celebration moves LESS than the error.** The shake measured ±3.33pt horizontally;
  the hop is predicted at ~2.15pt vertically. If confirmed, getting it right is a physically
  smaller reaction than getting it wrong, on the same mascot at the same size.
- **P4 — `oops` head tilt = −3°** (`EXPRESSION_TILT`), ≈2.9pt of edge travel on a 56pt box.
  To be measured from STILLS (default vs oops) via the angle of the line between eye centres,
  not from video — a rotation barely moves a centroid, so the video method cannot see it.

**P3 is the one that matters.** P1/P2 are conformance checks; P3 is a design question the
numbers can settle.

### Appendix E3 — R6 by position, predicted BEFORE measuring (2026-08-20)

Target chosen on evidence, not preference. The three sheets (`gate-sheet`, `trial-reward-sheet`,
`dismissal-offer-sheet`) contain **zero animation code** — no `withTiming`, no `withSpring`, no
`entering` — so there is nothing in them to measure. `lesson-feedback.tsx` wins on four counts:
190pt of travel, ζ=0.61 (underdamped, so it overshoots), 350ms, and a driver path already proven.

**Position, not pixel value.** Both earlier R6 metrics failed on pixel values: a brightness
threshold makes every opacity ramp read as ease-in, and mean luminance never reaches its floor
with `AmbientBackground` behind. Position has neither problem — which is why R4's width ratio
returned 0.99 on three captures while pixel overlap thrashed between 0.08 and 1.00.

From `lesson-feedback.tsx:98-110`: `withSpring(1, { stiffness: 220, damping: 18 })` driving
`translateY: (1 - t) * 190`.

| quantity | predicted |
|---|---|
| ζ | **0.607** |
| overshoot | **9.1%** → progress peaks near **1.091** |
| distance past target | **17.3pt** on 190pt of travel |
| time to peak | **266ms** |
| 2% settle | **460ms** |

- **P5 — the curve must be NON-MONOTONIC.** No cubic-bezier easing can reverse direction, so a
  measured overshoot proves a spring outright rather than by comparing shapes. This is the
  sharpest discriminator available for R6.
- **P6 — the source comment corroborates it independently:** *"slightly underdamped so the bar
  overshoots a few pixels and settles: it should feel thrown into place, not slid."* If the
  measurement shows no overshoot, either the spring is not running or the instrument is wrong —
  and the comment says which answer the author intended.
