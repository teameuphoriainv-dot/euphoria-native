# Animation audit — task list

Live worklist. Ordered. **Nothing here starts until the 60-lesson sweep finishes** (owner's
instruction, 2026-08-19).

Status: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked · `[-]` dropped, with reason

---

## RUNNING NOW

- [~] **60-lesson recorded sweep** — 12 pathways × 5 lessons, each recorded at ~48fps, driven to
      completion, segmented and scored against `MOTION_RUBRIC.md`, with filmstrips for every
      flagged transition. ~3.1h. Checkpoints to `sweep.json` after every lesson.

---

## THE HEADLINE FINDING — this is what the queue below exists to fix

**Atlas's idle motion is 1–3% amplitude: correctly built, correctly guarded, and too small to
see.** From `atlas.tsx`:

| constant | value | travel @132pt | @46pt |
|---|---|---|---|
| `SACCADE_UNITS` | 1.1 / 100 | 1.5pt | **0.5pt** |
| `ARC_FLEX_UNITS` | 1.6 / 100 | 2.1pt | 0.7pt |
| `SWAY_DEG` | 1.6° | — | — |
| `ROCK_DEG` | 3.4° | — | — |

Measured motion density over 15,329 frames:

- **welcome** (`happy`, 132pt) — **38%** of frames change, while the starfield behind it changes
  **69%**. The mascot is the least animated thing on the app's hero screen.
- **chat** (`watching`, 110pt) — **93%**.

Not a size difference — welcome's Atlas is *larger*. `watching` uses round pupils (dark disc on
white sclera; a 1.5pt shift is visible); `happy` uses arc eyes, where the same shift moves a thin
stroke's control point and reads as nothing. `happy` is also **excluded from blinking** by design,
and it is the most-used expression in the app.

**Why previous animation fixes never landed:** tuning a spring's damping does nothing when the
amplitude is 1pt. The easing was never the problem.

---

## QUEUE — after the sweep, in this order (owner-confirmed 2026-08-19)

- [x] **0. Driver 0-steps stall — FIXED.** `button()` required role AXButton; the lesson-intro Continue renders as AXGenericElement, so nothing matched. Now excludes prose instead. Driver went 0 -> 38 steps.
- [-] **0-old. Fix the driver's 0-steps stall.**
      The sweep navigates and records correctly but drove 0 steps on lesson 1 — it is filming
      static intros rather than interaction. Owner accepted recording-only for THIS run and asked
      for the fix afterwards, so the next sweep captures interaction animation too.

- [-] **1. Idle liveness — DROPPED. The finding was measurement error.**
      Atlas was measured on a GUESSED rectangle sitting above the mascot. On its real a11y box
      (x=135 y=276 w=132 h=137, verified by drawing it on a screenshot) Atlas shows motion in
      **99% of frames**, changing **87% × 88%** of its own box — against Duolingo's 81% and
      54% × 48%. `mascot_density.py`: **mascot 97.1% vs control 88.4%, lift +8.7**.
      Atlas is *more* animated than the reference. Raising `IDLE_SQUASH` or shortening the
      saccade gate would have made an already-lively mascot frantic.

- [-] **1c. Transition duration — DROPPED as a defect.** The "~3× faster" reading did not
      survive its own confound check: applying the same duration floor to both sides brings the
      median ratio from 3.67× down to **1.24×** at R1's p25. Euphoria's transitions are only
      modestly faster than the reference. What is real is **2.2× more motion events per second**
      (1.47/s vs 0.66/s) — more small events, not shorter transitions. Not actionable as "slow
      the animations down".

- [-] **1d. R2 failures — NOT app defects.** Read frame by frame: on interactive steps the multi-peak is the DRIVER tapping; on content steps it is h264 ghosting on static text. `peaks()` cannot tell two taps from one overshoot. The 16% figure is not quotable as a defect count.
- [-] **1d-old. The R2 failures ARE real.** 228 of 1,458 sweep transitions (16%) are short *and*
      multi-peaked, clustered at 0.20–0.35s, mostly 2-peak. Short-plus-bouncing is what reads as
      "abrupt". Worth tracing to the components that produce them once the sweep completes.

- [-] **1e. Cross-fade overlap — DROPPED, not a defect.** Re-captured at compression-quality 1.0:
      the incoming screen enters from the RIGHT EDGE while the outgoing one is still visible.
      That is `slide_from_right`, the iOS Stack default, and `_layout.tsx` sets no `animation`
      option so it inherits it. Two screens visible during a push is how a push works. The
      original observation was slide overlap plus h264 ghosting.

- [ ] **2. Give content its own resting motion.**
      The structural finding. `courses` (35%) and `digest` (49%) mount `AmbientBackground` but
      are dense grids of opaque cards that **occlude** it, so they go still. The app currently
      feels alive in inverse proportion to how much content is on screen. Content that breathes
      at rest fixes that regardless of layout density.

- [x] **3. Entry choreography — DONE.** Source audit (which screens import RiseIn) found exactly four with no entrance: search, friends, why-not-free (all now staggered and measured) and index (a redirect, correctly none). search 0.11s/1pk -> 1.08s/13pk; friends 1pk -> 7pk.
- [-] **3-old. Standardise entry choreography.**
      ~3000× spread across routes that verifiably navigated: welcome 245,582 peak px → search 84.
      That is not a design decision.

- [x] **4. Whole-app route audit — DONE.** `scripts/anim/route_audit.py` verifies navigation per
      route. **24 of 25 routes navigated** (against 9 of 23 in the retracted first pass). Table in
      `ANIMATION_FINDINGS.md` §2g. Found and fixed a harness bug where the audit parked on home,
      so home could never be tested. `search` (0.0%) and `explore-compound` (1.0%) are the only
      zero-motion screens — recorded as an observation, NOT a defect: `starCount` does not explain
      it (`news` runs 24 stars with glow off and reaches 17.2% against search's 22 at 0.0%), so it
      is content, not configuration.
- [-] **4-old. Re-run the whole-app route audit** with `goto_lesson`-style verification per route and
      a longer recording budget. The first pass is retracted: only 9 of 23 routes navigated.

- [x] **5. Digest pass — DONE.** 18 of 35 articles opened in sequence, all 18 rendered correctly (title + read-time, no 404). Masthead staggered: 0.07s/147k px slam -> 0.26s, moving it from below R1's p10 into the reference band. Also fixed routes.sh, which pointed at a slug that does not exist.
- [-] **5-old. Digest pass — 15–20 articles.** Owner is happy with Digest structurally; the ask is the
      **article hero/logo animations**.

- [x] **6. Owner's two reported bugs — FIXED.** "Click something and it becomes huge then small"
      was `onboarding-parts.tsx` running `withSequence(withSpring(1.035, Spring.bouncy), ...)` on
      select — 1.035 plus bouncy's ζ=0.72 overshoot reached ~1.076. Removed; it was redundant with
      `fill`/border. **Verified on device: 355.7pt peak vs 354pt resting**, where the old pop
      would have hit ~381pt. "Drag moves all over the place" was `slider-predict.tsx` calling
      `runOnJS` TWICE per frame (~120 JS round-trips/sec, each re-rendering) — the geometry was
      always correct, the READOUT saturated the JS thread. Now gated on `EMIT_STEP`.

- [x] **7. Both bug CLASSES swept, not just the instances.** Regex sweep across all `src/**/*.ts(x)`:
      scale-pop `withSequence`→>1 = 1 hit (the comment documenting the removal); `runOnJS` inside
      `onUpdate`/`onChange` = 2 hits in slider-predict (one `EMIT_STEP`-gated, one in `onEnd` which
      fires once); `ZoomIn`/scale-from-0 = 1 hit (the comment in tap-reveal). **Both classes clean
      in live code.** 18 inline springs remain, but 12 are `atlas.tsx` squash-and-stretch at
      ζ 0.37–0.58 which the plan explicitly protects, and `lesson-feedback`'s ζ=0.61 is a
      documented per-element choice on a translateY — which R2 requires rather than forbids.

## OPEN, NOT BLOCKING

- [~] **Atlas head tilt / shake / celebrate — capture UNBLOCKED, running.** Three driver bugs
      stood in the way and are now fixed: `goto_lesson` returned True on the screen reading "That
      lesson isn't available." (its check was `'lesson' in labs`, and that failure sentence
      contains the word "lesson"); route ids are kebab-case while the answers JSON is camelCase;
      and `advance()` could not pass a tap-reveal step, whose cards read "…Not revealed yet." and
      keep Continue inert until all are flipped. Route to the reaction: `personalFinance` lesson 1,
      `fillBlank`, options `['56','25','10','80']`, correct `0` — tap a wrong one, then Check.
      **Predictions on record BEFORE measuring** (`CARRYOVER.md` Appendix E): at the quiz-head
      size of 56pt, shake = ±3.36pt (6.7pt peak-to-peak) over 280ms + a ζ=0.58 settle; `oops`
      tilt = −3° ≈ 2.9pt of edge travel.

- [~] **Atlas head tilt — partially settled, one retraction.** A predicted bug that every
      `idle={false}` Atlas sits permanently at −3.4° (because `rock` initialises to 0 while the
      rotation maps `(rock*2-1)*ROCK_DEG`, whose neutral input is 0.5) was **measured at −0.61°
      and retracted** — eye-line angle by PCA on the sclera cloud, self-checked against synthetic
      disc pairs to ±0.65°. The `oops` / `thinking` `EXPRESSION_TILT` values remain unmeasured;
      the method now exists and needs one still with a tilted expression on screen.

- [-] **Atlas head tilt is unverified — superseded by the entry above.** Implemented in `edb036e`; every deep-linkable screen
      renders an expression whose tilt is 0. Reaching `oops`/`thinking` needs a wrong answer
      mid-lesson — now trivial, since the extractor knows which answer is wrong.
- [x] **`celebrate` and `shake` — MEASURED.** Both captured on the lesson quiz head via a
      deliberately wrong / right answer, registration label-verified each time.
      **shake**: five alternating decaying steps over **271ms**, first step **3.33pt** against
      3.36pt predicted (1% error) — matches `atlas.tsx:331-338`'s five `withTiming` steps
      totalling 280ms. **KEEP**: R1 p25, and R2 treats multi-peak-under-0.35s as the deliberate
      exception, which a hand-written commented sequence qualifies as.
      **celebrate**: sustained deviations of 2.66–3.16pt, i.e. the SAME size as the error shake.
      Owner chose to make correct read louder; `celebrateGain` set to 0.5 at the quiz head and
      re-measured at **4.57pt** (1.45x, against 1.56x predicted). Lesson-complete stays at gain 1.
- [x] **Per-element instrument BUILT** — `scripts/anim/element_curve.py`. Tracks one element
      from its a11y rectangle, draws the box for verification, and scores **overlap against
      frame 0** rather than a pixel count, because slide A's white headline and slide B's white
      headline occupy the same box and a count cannot tell them apart. Carries a Fast Refresh
      detector with retries. This is what R4/R5/R6 have been waiting on.

- [ ] **Route coverage gap.** The whole-app pass ran out of recording before `stock-sym`,
      `settings-account`, `why-not-free`, `widget-tutorial`. They show 0 windows because they were
      never captured — **not** because they are static. Re-run with a longer budget.
- [!] **RevenueCat offering has no packages** — `refs/IAP_OFFERING_REPORT.md`. Dashboard fix,
      no code change available to me. Its LogBox banner also overlaps `Continue` and eats taps.
- [-] **Crest ladder — the note was WRONG, dropped.** It claimed "Saver (rank 0) is still a bare
      shield". `league-crest.tsx:113-120` renders Saver as three stacked ellipses (coins seen
      edge-on), with a comment stating it is deliberately the most literal mark in the set because
      "tier 1 is where the metaphor has to be legible without having learned the ladder yet."
      What Saver lacks is ORNAMENTS, which by design start at rank 2 and accumulate: flanges,
      laurels, banner, wings, gem, sunburst. That is a documented Clash-Royale-style structure
      ladder where each rank keeps what the ranks below earned and adds one piece of hardware.
      Rank 1 having no hardware is the FLOOR the ladder is measured from, not a gap in it.
      Retraction #12: the note was written from the ornament code without reading the emblem
      switch twelve lines above it.

---


## RUBRIC RULES — status after the per-element instrument

- [x] **R4 scale origin — CLOSED.** Measured on both sides. Reference (ref3, Duo entering) holds
      a 63–83px width band while x sweeps 102→21. Euphoria's onboarding headline holds
      272–276pt across **three** captures, ratio **0.99**. Elements enter by MOVING, not growing.
      This is the rule that condemned `tap-reveal`'s original `ZoomIn`-from-scale-0.
- [~] **R5 exit behaviour — shape established, duration not.** The headline exits by FADING over
      multiple frames, never a one-frame cut. Two clean captures gave 135ms and 62ms against
      `step-transition.ts`'s 150ms `EXIT`. **Quote the shape, not the milliseconds.** Stays open
      as a reference-derived rule: a video has no accessibility tree, so the reference side
      cannot be measured this way.
- [~] **R6 easing shape — OPEN, two metrics eliminated.** Thresholded overlap is wrong by
      construction (gating at brightness 200 makes every opacity ramp read as ease-in). Mean
      luminance is right in principle but finds no usable rise, because the cross-fade plus
      `AmbientBackground` means the region never nears zero. Now being measured by POSITION on
      `lesson-feedback.tsx` — 190pt of travel, ζ=0.607, predicted 9.1% overshoot peaking at
      266ms. Predictions pre-registered in `CARRYOVER.md` Appendix E3 before the capture.

## SETTLED — do not redo

- [x] `tap-reveal` cross-fade (`c499b09`) — hard cut + ZoomIn-from-0 + ζ=0.8 bounce, all measured
      against 238 reference transitions, all replaced.
- [x] Capture path: `idb video-stream --fps 60` ≈ **47.7fps**. `simctl recordVideo` is fixed at
      **15fps** and cannot resolve a 280ms spring. Never use it for motion work.
- [x] Reduced-motion lane widened to 32 files and given a self-test. **0 defects is now a proven
      zero**; the three it once reported were static transforms (`rotate: '-4deg'`).
- [x] Lesson driver completes lessons: answers extracted from the curriculum, buttons selected by
      role, checkbox state read from `AXValue`.
- [x] **Lesson art needs no work** — 40 distinct designs across 295 titles, worst concentration
      25%, longest identical run 2. An earlier claim that it shipped "two shapes" was wrong.
