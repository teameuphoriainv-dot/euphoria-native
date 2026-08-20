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

- [ ] **1d. The R2 failures ARE real.** 228 of 1,458 sweep transitions (16%) are short *and*
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
