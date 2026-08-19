# Atlas — animation audit

Phase B of the frame-by-frame audit, scored against `refs/MOTION_RUBRIC.md`. Measured on device
2026-08-19 via `scripts/anim/capture.py` (`idb video-stream --fps 60`, **48.5 fps effective**),
not from reading the code.

> Capture rate matters here. `simctl io recordVideo` is fixed at 15fps, which cannot resolve a
> 235ms gesture. Everything below was captured at ~43–48fps. See MOTION_RUBRIC.md § capture rate.

## Verdicts

| Animation | Measured | Rubric | Verdict |
|---|---|---|---|
| **Idle — breath** | full period **3.30s** (coded 3.20s) | R3 continuous, not a transition | **KEEP** |
| **Idle — sway** | **5.03s** one-way (coded 5.20s) | R3 | **KEEP** |
| **Idle — rock** | not resolved | — | **UNVERIFIED** — see below |
| **Nod (tap ack)** | **0.235s**, single-pass settle | R1 within p10–p25 · R2 PASS | **KEEP** |
| **Celebrate (jump)** | not captured on device | `earned` class, not R1 | **UNVERIFIED** |
| **Shake (wrong answer)** | not captured | — | **UNVERIFIED** |
| **Blink / saccade** | superimposed on idle, not isolated | — | **UNVERIFIED** |

### Idle — KEEP

445 samples over 9.2s inside Atlas's own 96×99pt box (cropped tight, so the ambient starfield
cannot contaminate the signal). **100% of frames show motion** — the loop genuinely runs.

Autocorrelation recovers the coded periods:

| element | coded | measured | r |
|---|---|---|---|
| breath | 3.20s full (`BREATH_MS 1600`, `withRepeat` reverses) | **3.30s** | 0.19 |
| sway | 5.20s one-way (`SWAY_MS`) | **5.03s** | 0.26 |

R3 is explicit that long, multi-peak, continuous windows are choreography and must not be
"fixed". Idle is guarded by `useReducedMotion`, is anchored (the top edge does not translate —
itself a fix from an earlier session, measured off the Brilliant recordings), and behaves as
documented. Nothing to change.

**`ROCK_MS 3900` (7.8s full) is UNVERIFIED**: a 9.2s capture holds barely one cycle, and sway's
10.4s full period does not fit at all. This is a *measurement-window* limit, not a defect. Closing
it needs ≥30s of capture. Do not record it as a pass.

### Nod — KEEP

Tap an onboarding option; Atlas acknowledges. Core burst **frames 36–45 at 42.6fps = 0.235s**,
`peaks()` = **1** (single clean settle, no secondary bounce).

- **R1**: 0.235s sits between the reference's p10 (0.13s) and p25 (0.27s). R1 requires a stated
  reason only below p10 or above p90, so this is inside the acceptable range — brisk, not wrong.
- **R2**: single-pass settle. PASS.

The brevity is deliberate and documented in `atlas.tsx`: *"A hop answers 'something was
achieved'. A tap only means 'I heard you'."* The nod drives head rotation and a micro-squash and
never touches `jumpY`, so it has **no vertical travel** — which is why it reads as acknowledgement
rather than the mascot bouncing on the spot. That is correct design, and the measurement confirms
the code does what its comment claims.

### Celebrate — UNVERIFIED, and why

`atlas.tsx` composes it as anticipation dip (110ms) → launch spring (ζ=0.40) → land spring
(ζ=0.52), with `headLag` following 70ms late on its own clock and ringing down at ζ=0.37.

Computed settle ≈ **1.41s**. That exceeds R1's p90 of 1.20s, **but R1 does not apply**: R1 governs
discrete UI transitions, and `shared/motion/tokens.ts` already defines a separate `earned: 3200`
class citing Duolingo's measured streak-ignite. A celebration is not a UI transition. Judging it
against R1 would be a category error.

The low damping is deliberate follow-through and overlapping action — standard character-animation
practice, and R2 permits a bounce that is *chosen per element*. It plainly is here, with written
reasoning. **Provisional read: KEEP.** But it is not measured, so it stays UNVERIFIED.

## Access problem — recorded so it is not rediscovered

`src/app/dev-gallery.tsx` renders Atlas with `interactive={false}` and **no `idle`, `celebrate` or
`nod`**. It shows nine expressions as *static poses*. **It is not an isolation route for motion**,
contrary to the audit plan's assumption.

Where each animation actually fires:

| Animation | Reachable at |
|---|---|
| idle | `onboarding`, `chat`, `auth`, lesson screens — deep-linkable ✅ |
| nod | tap any onboarding option ✅ |
| celebrate | `lesson.tsx:433` on a CORRECT quiz answer · `lesson.tsx:488` DONE state · `onboarding.tsx:643` at `REVEAL_INDEX` |
| shake | wrong answer |

Driving a lesson to its DONE state requires solving all 9 step kinds, and `Continue` is gated on
`onSolvedChange(true)` — so a driver must answer **correctly**, not merely interact. `drive.py`
currently solves `choice`, `multi`, `reveal` and `order`; `line`, `match`, `build` and `todo`
remain. The correct answers live in `src/lib/curriculum/courses/*.ts`, so the general fix is to
parse them from the data rather than guess (the repo already parses these files by regex in
`scripts/check-digest-lessons.mjs`).

Cheapest route to `celebrate` is a correct quiz answer, which `drive.py` already achieves.
