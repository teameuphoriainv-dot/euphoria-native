# Euphoria animation audit — what was wrong, what was fixed, what was retracted

One page for the whole audit. Detail lives in `ANIMATION_FINDINGS.md` (numbered findings),
`MOTION_RUBRIC.md` (the measured standard), `ANIMATION_TASKS.md` (queue) and `LOOP_LEDGER.md`
(113 rows, one per unit of work).

## Why this existed

> *"Every single time I give you a prompt for fixing the animation, it either just stays the same
> or gets worse. I need you to understand how the level of animations is right now."*

Two specific defects were reported: **tapping something makes it grow then shrink**, and
**dragging feels like it moves all over the place**. Both were found in source, fixed, and one
was measured on device.

## The two reported defects

| | cause | fix | evidence |
|---|---|---|---|
| **click-pop** | `onboarding-parts.tsx` ran `withSequence(withSpring(1.035, Spring.bouncy), …)` on select. 1.035 plus bouncy's ζ=0.72 overshoot reached **~1.076**, then shrank. Redundant — `fill` and border already signalled selection. | removed | **measured on device: 355.7pt peak vs 354pt resting.** The old pop would have hit ~381pt |
| **drag** | `slider-predict.tsx` called `runOnJS` **twice per frame** — ~120 JS round-trips/sec, each re-rendering. The geometry was always correct; the *readout* saturated the JS thread | `onTouched` once in `onBegin`; `setGuess` gated on `EMIT_STEP` | source |

**The drag had three more instances the first sweep missed** — `before-after-slider.tsx` and
`graph-point-drag.tsx` use the OLDER responder API, so a `Gesture.Pan` search never matched them.
Both fired `Haptics.selectionAsync()` on **every `onResponderMove`** — roughly **60 native haptic
calls per second** — and both re-rendered per move to move a thumb. All now quantised to 24
detents with geometry on the UI thread.

> ### ⚠️ CORRECTION — the drag fixes are to code the app never renders
>
> Established later (§19, §19b): **`SliderPredict`, `BeforeAfterSlider`, `GraphPointDrag` and
> `SortBuckets` are rendered nowhere.** No imports, no JSX, no registry — verified across every
> `.ts`/`.tsx` in `src`.
>
> They are the **earlier drag-based versions** of interactions the app reimplemented as TAPS:
> `dragSort` (231 steps) renders as `OrderSteps`, whose hint is *"Tap two rows to swap them"*,
> and `slider` (198 steps) renders as the tap-stepped `NumberLine`.
>
> **So there is no drag gesture anywhere in the shipping app**, and every drag fix above — while
> correct — is to dormant code. **The owner's reported drag defect therefore has no identified
> source.** The only drag-like interaction a user can actually perform is **scrolling**, which
> makes it the most likely referent. This audit could not test that: the capture path is
> bandwidth-limited and reports the recorder's frame rate during a full-screen scroll, not the
> app's. **The RN Perf Monitor settles it in ten seconds.**
>
> Stated here rather than left implied by a list of drag fixes.

## Everything fixed

1. **click-pop** removed (`onboarding-parts`) — verified on device
2. **drag stutter** (`slider-predict`) — per-frame `runOnJS` gated
3. **drag haptics** ×2 (`before-after-slider`, `graph-point-drag`) — 60/sec → 24 detents
4. **reward overshoot** (`reward-pop`) — ζ=0.40 magic numbers → `Spring.reward` (ζ=0.55)
5. **two permanently frozen mascots** (`start.tsx` 92pt hero, `term-match` 96pt) — `idle` was
   never passed, and `atlas.tsx:316` zeroes breath/sway/rock without it. Resting motion was zero
   **by construction**
6. **article logo hard cut** (`ticker-logo`, `news-gallery`) — `opacity: loaded ? 1 : 0` on a
   plain style, zero animation in the file. **Measured after: 286ms vs 280ms intended**
7. **sheet backdrops slid instead of fading** ×4 — `<Modal animationType="slide">` animates the
   native host, so `absoluteFill` blur and scrim travelled with the sheet. Now a shared
   `useSheetEntrance` hook: backdrop fades, sheet springs
8. **matching-pairs had no animation at all** — tick and border changed on one frame
9. **graph-point-drag** — SVG polyline and history dots rebuilt ~60×/sec for output that never
   changes; solve colour cut on one frame
10. **a dead animation** — `atlas.tsx` set a `rotation` shared value every tap that **nothing
    ever read**

## What was measured, and how closely

| animation | predicted | measured | error |
|---|---|---|---|
| wrong-answer shake | ±3.36pt, 5 steps, 280ms | **3.33pt, 5 steps, 271ms** | **1%** |
| celebrate, before | — | 3.16pt | — |
| celebrate, after `gain` 0.5 | 1.56× | **4.57pt (1.45×)** | 7% |
| logo cross-fade | 280ms | **286ms** | 2% |
| click-pop gone | ≤354pt | **355.7pt** | noise |

**Predictions were committed BEFORE each capture** (`f32e894`, `b4c95f7`) so results could be
judged rather than retrofitted.

## The standard

`MOTION_RUBRIC.md`, derived from 3 reference recordings → **14,974 frames → 330 windows → 307
discrete transitions**.

- **R1 duration** — median 0.40s, IQR 0.27–0.67s
- **R2 settle** — 73% of sub-0.35s transitions are single-peak. **Bounce is a deliberate
  per-element choice, never a library default**
- **R3** — long multi-peak windows are *stagger*, not oscillation
- **R4 scale origin** — **CLOSED.** Elements enter by MOVING, not growing. Euphoria's headline
  holds a width ratio of **0.99 across three captures**
- **R5 exit** — shape established (a fade, not a cut) but not its duration: two clean captures
  gave 135ms and 62ms against a 150ms constant. **Quote the shape, not the milliseconds**
- **R6 easing** — **OPEN after six documented failures.** Needs app instrumentation
- **R7 idle mascot** — Duolingo reference: 81% of frames

## Guardrails, so this cannot silently regress

`npm run check` ran **16 regression scripts and none looked at motion**. Now it also runs
`motion-invariants.mjs` (7 rules, 174 files) and `reduced_motion_audit.py`. The invariants encode
the defects actually found — including *"no scale-pop on ordinary interaction"*, which is the
rule that protects the owner's first report.

## 17 retractions

Every one is recorded with its reason. The largest: **"Atlas is under-animated"** was measured on
a **guessed rectangle sitting above the mascot**. Re-measured on its real accessibility frame,
Atlas moves in **99% of frames vs Duolingo's 81%** — *more* animated than the reference. It
survived four analyses because all four inherited the same bad input.

Two were regressions **I introduced and caught before the owner saw them**. One — *"idle head
rock is confirmed running"* — was withdrawn within an hour when source showed the eyes sit
**outside** the rotated group, so the swing I measured was saccade and blink.

**The pattern worth keeping:** in this codebase, a failed measurement does not error. It returns a
clean, plausible, quotable number. Deep links no-op silently, stale screens report success, h264
ghosting looks exactly like jank, and a guessed region yields internally consistent nonsense.
Every finding here was confound-tested because of that.

## Still open

- **The reported drag defect is UNEXPLAINED.** See the correction above. Most likely scrolling;
  needs the RN Perf Monitor, which this capture path cannot substitute for
- **~460 lines of superseded drag components** are unreachable but maintained. Safe to delete —
  nothing imports them — but whether the drag variants return is a product decision
- **290 `interactiveGraph` steps render as prose** (5.4% of 5,341). Deliberate and commented
  — *"the chart itself is a later cycle"* — but it is the one authored-interactive type that
  currently shows as text

- **RevenueCat's current offering has no packages** — `IAP_OFFERING_REPORT.md`. Dashboard fix, no
  code change available. **Commercially the most serious thing found: the app cannot sell
  anything**
- **R6 easing** — needs `__DEV__` instrumentation rather than more pixel measurement
- **`EXPRESSION_TILT` unverified** — three measurement routes closed; `headProps` rotates only the
  body rings, and the file's header says *"eyes stay upright"*, so whether the resting tilt should
  be exempt is an owner decision
- **Four sheets shipped unverified** — all mount only on entitlement state, and the simulator
  account is on an active free trial
- **Two draggables still re-render per move** — the correct fix is a Reanimated conversion, not
  attempted because a Pan inside a scrolling container can steal the scroll and it cannot be
  verified from here
