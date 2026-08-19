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

## QUEUE — after the sweep, in this order

- [ ] **1. Raise idle amplitudes, then prove the delta.**
      Increase `SACCADE_UNITS`, `ARC_FLEX_UNITS`, `SWAY_DEG`, `ROCK_DEG`. Re-measure motion
      density on welcome / home / chat with the same method and box, and publish before/after.
      A change that cannot be shown to raise density is not a fix.
      *Constraint:* it must still pass `reduced_motion_audit.py --selftest`, and larger sway/rock
      must not push R1 outside its band.

- [ ] **2. Give `happy` a real blink.**
      It cannot blink today because you cannot close an arc — so instead squeeze/flatten the arc
      briefly. Targets exactly the screens measured as dead: welcome, home, you, auth, reward.

- [ ] **3. Read the sweep's filmstrips and fix what they show.**
      Per-lesson verdicts FIX / IMPROVE / KEEP, each citing a rubric rule and a measured number.
      This is the part that must be *looked at*, not machine-judged — it is the whole reason for
      the audit.

- [ ] **4. Digest pass — 15–20 articles.**
      Queued behind the sweep: one simulator means device work is strictly serial, and two passes
      at once would interleave taps and corrupt both recordings. Owner is happy with Digest
      structurally; the ask is the **article hero/logo animations**.

---

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
