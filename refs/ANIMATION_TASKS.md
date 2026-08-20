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

- [ ] **0. Fix the driver's 0-steps stall.**
      The sweep navigates and records correctly but drove 0 steps on lesson 1 — it is filming
      static intros rather than interaction. Owner accepted recording-only for THIS run and asked
      for the fix afterwards, so the next sweep captures interaction animation too.

- [ ] **1. Fix idle liveness — TWO edits, not one.**

      Superseded the earlier "raise amplitude" plan after a like-for-like re-measure. Amplitude
      per event is already fine (Euphoria 60%×50% of its box vs Duolingo 54%×48%); the gap is
      **frequency** plus one genuinely-too-small continuous animation.

      **1a. Breath amplitude.** `IDLE_SQUASH = 0.038` → 5.0pt excursion at 132pt over a 1600ms
      half-cycle = **0.20pt per frame** at 48fps. Continuous and invisible. Raise it.

      **1b. Idle event frequency.** Saccade and arcFlex are both gated behind
      `2100 + random×2600`ms — about one event every 3.4s, so most frames show nothing. Shorten
      the gap.

      **Target (R7):** motion in ~81% of frames. **Baseline: 46%**, and that 46% is inflated by
      starfield — controls on the same frames scored 99% / 55% / 53%.

      **Method:** change one of 1a/1b at a time and re-measure, so it is clear which produced the
      lift. `scripts/anim/mascot_density.py` reports mascot-vs-control lift.

      *Constraints:* `reduced_motion_audit.py --selftest` must still pass; `default` keeps drawing
      no brows so the resting brand mark is unchanged; watch that faster saccades do not read as
      twitchy rather than alive.

- [ ] **1c. Investigate transition DURATION.** (Owner: after the mascot work.)
      Preliminary from the sweep — Euphoria's lesson transitions run ~3× faster than the
      reference at every percentile (median **0.14s** vs **0.40s**), and 16% fail R2 by bouncing
      inside a very short window. Before acting: separate genuine transitions from tap
      press-feedback, since the driver's cadence inflates the short end. Potentially the
      widest-reaching defect found, because it touches every screen rather than one component.

- [ ] **2. Give content its own resting motion.**
      The structural finding. `courses` (35%) and `digest` (49%) mount `AmbientBackground` but
      are dense grids of opaque cards that **occlude** it, so they go still. The app currently
      feels alive in inverse proportion to how much content is on screen. Content that breathes
      at rest fixes that regardless of layout density.

- [ ] **3. Standardise entry choreography.**
      ~3000× spread across routes that verifiably navigated: welcome 245,582 peak px → search 84.
      That is not a design decision.

- [ ] **4. Re-run the whole-app route audit** with `goto_lesson`-style verification per route and
      a longer recording budget. The first pass is retracted: only 9 of 23 routes navigated.

- [ ] **5. Digest pass — 15–20 articles.** Owner is happy with Digest structurally; the ask is the
      **article hero/logo animations**.

## OPEN, NOT BLOCKING

- [ ] **Atlas head tilt is unverified.** Implemented in `edb036e`; every deep-linkable screen
      renders an expression whose tilt is 0. Reaching `oops`/`thinking` needs a wrong answer
      mid-lesson — now trivial, since the extractor knows which answer is wrong.
- [ ] **`celebrate` and `shake` still unmeasured.** The sweep should capture celebrate on every
      lesson completion; check the strips before re-attempting by hand.
- [ ] **Route coverage gap.** The whole-app pass ran out of recording before `stock-sym`,
      `settings-account`, `why-not-free`, `widget-tutorial`. They show 0 windows because they were
      never captured — **not** because they are static. Re-run with a longer budget.
- [!] **RevenueCat offering has no packages** — `refs/IAP_OFFERING_REPORT.md`. Dashboard fix,
      no code change available to me. Its LogBox banner also overlaps `Continue` and eats taps.
- [ ] **Crest ladder** — Saver (rank 0) is still a bare shield; emblems could carry more identity.

---

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
