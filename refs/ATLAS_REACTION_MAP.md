# Atlas reaction map

Session 2026-08-06. Companion to `MOTION_RESEARCH_V2.md`. Every row carries a tier:

- **T1** — spec (Apple HIG, Material 3)
- **T2** — measured on this machine (frame-differencing, or read directly out of `atlas.tsx`)
- **GUESS** — engineering judgement, anchored to a T1/T2 value, explicitly not observed

Displacement is given in **points**. Screen pixels ÷ 3 on this device (iPhone 17 Pro @3x);
that scale factor is verified for *our own* captures, unlike the competitor clips where V2 §1
flags the device as unknown.

---

## 0. The governing rule — resolves "problem 4"

`AtlasStage` translates the mascot vertically by `ATLAS_RISE = 28pt` on **every** step change
(`onboarding-parts.tsx:65`). The celebrate hop *also* translates vertically. So the app's most
meaningful motion and its most routine motion are the same gesture, and the routine one happens
20× more often. That is why the hop stopped reading as a reward.

> **Vertical translation is reserved for EARNED moments. Everything else deforms, rotates or fades.**

This is already half-true and measured: the nod I shipped drifts **2px (0.7pt)** while its volume
swings 499px — deformation, not travel — and the reveal hop travels **dip 426 → launch 406 →
land 412 screen px** (T2, this session). The rule finishes the job.

**Action:** drop `translateY` from `AtlasStage`'s step transition and carry it on
`opacity` + `scale` alone (the stage already animates `scale: 0.88 → 1.0`). Vertical travel then
means exactly one thing in the entire app.

---

## 1. The map

| # | Trigger | Beat | Duration | Displacement | Spring / easing | Deform or translate | Tier |
|---|---|---|---|---|---|---|---|
| 1 | **Idle** — nothing happening | Anchored breath + weight shift + head rock, three clocks deliberately out of phase | breath **3200ms** full cycle (1600 half), sway **10400ms**, rock **7800ms**; sway delayed 400ms, rock 900ms | scale ±**3.8%** (`IDLE_SQUASH`), sway **±1.6°**, rock **±3.4°** | `Easing.inOut(sin)`, `withRepeat(-1, true)` | **Deform** — top edge pinned, zero travel | T2 `atlas.tsx:40-56` |
| 2 | **Press** — finger down on any tappable | Scale down, hold, release on lift | ~**100ms** each way | scale to **0.97** (`scaleTo`) | `Spring.press` 632/50/1 — critically damped; ζ<1 wobble on a 100ms beat reads as lag | **Deform** | T1 Apple response 0.25/ζ1.0. ⚠️ **Not measured** — a press is ~3 frames at 30fps, below the clips' resolution (V2 §1) |
| 3 | **Acknowledge** — an option tap registers | Head dip + micro-squash, no travel | head **120ms** out, spring back; squash **100ms** out, spring back | head **−7°**, squash **0.30** | out: `Easing.out(quad)`; back: 150/9 and 210/14 | **Deform** — measured **2px** drift | T2 shipped + measured this session |
| 4 | **Correct** — answer verified right | Acknowledge, then a *small* upward pop + `happy` face; the payoff is the streak/complete beat, not this | **≈420ms** total | jump **−4pt** (`size × 0.12 × gain 0.32` at size 96 ≈ 3.7pt) | `Spring.reward` 322/20 | **Translate**, small — a correct answer IS earned, just cheaply | GUESS anchored to the existing `CELEBRATE_GAIN 0.32` and Apple 0.35/ζ0.55 |
| 5 | **Incorrect** — answer verified wrong | Horizontal shake + `oops` face. Never vertical: down-motion reads as punishment | **330ms** (6 steps: 60/60/55/55/50 + settle) | **±5.8pt** at size 96 (`size × 0.06`), decaying | settle `withSpring` 300/20 | **Translate horizontally** — deliberately a different axis from reward | T2 `atlas.tsx` shake effect |
| 6 | **Lesson complete** | Full cartoon hop: anticipation dip → launch → land → head follow-through 70ms late | **≈700ms** | dip **+2.1pt**, launch **−11.5pt** (`size × 0.12 × gain 1.0`), land 0 | dip 110ms `out(quad)`; launch 260/13; land 210/15 | **Translate** — the earned axis | T2 `atlas.tsx` celebrate; measured in-app as 426→406→412 px |
| 7 | **Streak extended** | **Two-stage earned beat** — build → burn → burst → white flash → resolve. Atlas anticipates during build, bursts with the flame, settles after the flash | **3200ms** (`Duration.earned`) | burst launch **−16pt** (1.4× the lesson hop), settle 0 | build `Ease.enter`; burst `Spring.reward`; resolve `Spring.gentle` | **Translate** + full-screen luma flash | T2 **measured**: Duolingo streak ignite 3200ms two-stage, luma 25.9 → **207.5** (V2 §2) |
| 8 | **Level up** | Same two-stage skeleton as #7 but the flash is **brand violet**, not white, and rings cascade outward | **3200ms** | burst **−16pt**; ring cascade `RING_LAG_MS 55` per ring, 4 rings = 220ms tail | `Spring.reward`; cascade reuses the existing spin lag | **Translate** + ring cascade | GUESS — reuses #7's measured structure and the ring-lag already in `atlas.tsx:60` |
| 9 | **Streak lost** | Slow deflate: squash down, hold, no bounce back. `sad` face. Silence where the reward would be | **900ms** | scale to **0.94**, no travel | `Ease.exitCurve` (M3 emphasized-accelerate), **no spring** — a bounce here would read as playful | **Deform only** | GUESS anchored to M3 exit curve; the absence of a spring is the point |
| 10 | **Lean-in** — a question appears | Head tilts toward the prompt and holds while unanswered | **240ms** in, holds | head **+4°**, no travel | `Spring.gentle` | **Rotate** | GUESS — the missing "attention" beat; V2 notes it does not exist today |

---

## 2. What is missing today, in priority order

1. **Nothing exceeds 400ms.** `Duration.slow` was the ceiling until `Duration.earned: 3200` landed
   this session. Rows 7 and 8 cannot exist until something is built at that scale. This is the
   structural gap V2 §2 identifies as the reason payoffs do not land — **not** spring tuning.
2. **No distinct success vs error beat.** Row 4 and row 5 differ by *axis* (vertical vs
   horizontal), which is the cheapest way to make them unmistakable without new assets.
3. **No lean-in (row 10).** Atlas never anticipates; he only responds.
4. **The stage competes with the mascot** — §0.

---

## 3. Reduce-motion policy (agenda E3)

`useReducedMotion()` is already honoured throughout `atlas.tsx`. Per-row intent:

| Row | Under Reduce Motion |
|---|---|
| 1 idle | **Off entirely** — already is (`atlas.tsx` early-returns to breath 0) |
| 2 press | **Keep.** Apple treats press feedback as interaction, not decoration |
| 3 acknowledge | Keep the face change, drop the head/squash |
| 4–6 | Replace travel with an **opacity/scale cross-fade** at `Duration.base` |
| 7–8 earned | **Keep the moment, drop the motion**: hold the end state 800ms with a fade. Removing it entirely would delete the reward |
| 9 streak lost | Already motionless enough — keep |

Apple's guidance is to substitute cross-fades for movement, **not** to remove feedback. T1.

---

## 4. Explicitly unverified

1. **Press timing (row 2)** — cannot be measured from 30fps clips; a press is ~3 frames. Taken
   from Apple's spec, not observed.
2. **Rows 4, 8, 9, 10 are engineering guesses.** Each is anchored to a measured or spec value, and
   each is labelled above. None was observed in a shipping app.
3. **Competitor point conversions.** Our own captures are @3x-verified; the `refs/videos/` clips
   have an unknown source device, so their pt figures stay derived (V2 §1).
4. **Whether ring-cascade reads as "level up"** (row 8) is untested — it reuses a spin gesture that
   currently means "the user poked the mascot".

---

## 5. §0 shipped and verified — 2026-08-06

`translateY` removed from `AtlasStage`; the step transition now carries on opacity + scale
(0.86 → 1.0) alone.

**Measured on a live step transition**, 169 frames re-encoded to constant 30fps:

| | Atlas vertical travel |
|---|---|
| Before (`ATLAS_RISE`) | **28pt** (84px) |
| After | **2.0pt** (6px) |

Method note: a naive measurement returned 169px, which is **wrong**. The stage fades opacity
0→1, and as it fades a fixed violet threshold loses the faint pixels, dragging the detected top
edge down. Restricting to frames where the mascot's area is ≥90% of peak — i.e. fully opaque —
isolates geometry from fade. **Do not measure position across an opacity ramp without that
filter.**

The residual 2pt is scale-about-centre, which is deformation, and it matches the acknowledge
nod's measured 2px. `ATLAS_RISE` is retained for the stage's *height* reservation so the
15-step onboarding layout does not shift.
