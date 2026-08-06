# Euphoria motion & visual craft — execution plan for the next session

You are a principal-level motion designer and design engineer picking up a partially-complete
engagement. **~40% is done and measured. Do not redo it.** This document is the plan.

**Product:** Euphoria — dark-theme finance-education iOS app. Duolingo's habit loop, Brilliant's
lesson craft, applied to investing. Mascot "Atlas" = four interlocking violet rings + large eyes.
**Stack:** Expo SDK 57, RN 0.86, **Reanimated 4.5.0**, react-native-svg 15.15.4, expo-router,
expo-haptics. Dark theme only, near-black background.

---

## STEP 0 — Read in this order, then stop reading

1. **`refs/MOTION_RESEARCH_V2.md`** — the ground truth. Measured findings, codebase audit,
   paste-ready `tokens.ts`, five corrections, the open-source tooling answer.
2. `refs/MOTION_RESEARCH.md` — **only** for the Apple spring conversion table and the
   Material 3 timing values. Its haptics and stagger claims are wrong; V2 §5 lists the corrections.
3. `src/shared/motion/tokens.ts` (28 ln) and `src/constants/theme.ts` (128 ln).

Do **not** re-read `BRILLIANT_REFERENCE.md`, `BRILLIANT_VISUAL_ANALYSIS.md` or `README.md` unless a
specific question needs them — they contain stale claims and will cost you context.

**Install first (free, one-time):**
```
/plugin marketplace add software-mansion-labs/skills
/plugin install skills@swmansion
```
First-party Reanimated 4 / layout-animations / 120fps / Skia skills from the library's authors.
The four `ecc:motion-*` skills are Framer Motion (web) and **do not apply** — ignore them.

---

## SETTLED — do not re-derive, do not re-measure

| Finding | Value |
|---|---|
| Motion density | Brilliant 34.7% / 39.3%, Duolingo 31.8%, Euphoria **2%** (scroll-inflated, directional) |
| Brilliant step transition | **467ms**, luma flash peaks 67ms in, overshoot = spring |
| Duolingo streak ignite | **3200ms, two-stage**: build → burn → burst → white flash → resolve |
| `LinearTransition` uses | **0**. No `layout=` prop anywhere in `src/` |
| `withTiming` vs `withSpring` | **62 vs 39**; 14 `withSequence` retarget-snap sites |
| `FadeIn` vs `FadeOut` | **22 vs 4** — exits missing app-wide |
| `theme.ts` surface ramp | **ALREADY FIXED** — 4 tiers (4/9/14/19/22%). Brief's "problem 3" is stale |
| Haptics | **Already wired app-wide.** "No haptics" claim is FALSE. Only *timing* is open |
| `STAGGER_GAP` | Already `60`, correctly in range. "30ms" claim is stale |
| Video 3 | Is **Duolingo**, not Brilliant. `README.md` mislabels it |
| Rive | **Paid.** Export for production needs Cadet $9/mo annual. Plus the $250 animator |

---

## PHASE 1 — Ship the three measured defects (do this first)

These are located, diagnosed, and small. Shipping them changes what the app feels like today.

### 1.1 — Fix the instant-cut reorder · **S**
**Files:** `src/components/order-steps.tsx`, `src/components/sort-buckets.tsx`
**Why:** `LinearTransition` has zero uses; no reflow animation exists anywhere. This is the
mechanical cause of the measured 2%-of-frames drag-sort cut.
**Change:** add to the row/item component —
```tsx
layout={LinearTransition.springify().damping(18)}
```
`damping(18)` matches both `Spring.bouncy` and Brilliant's measured 12–18 overshoot band.
**Acceptance:** re-run `motion_energy.py` on a fresh 6s capture of the drag-sort step.
**Frames-animating must exceed 15%**, up from 2%. Rows must visibly travel, not teleport.

### 1.2 — Land the new `tokens.ts` · **S**
**File:** `src/shared/motion/tokens.ts` — the full replacement block is in `MOTION_RESEARCH_V2.md` §4.
Adds `Duration.exit: 180`, `Duration.screen: 460` (measured), `Duration.earned: 3200` (measured),
`Spring.press/reward`, and M3 `Ease.enter`/`Ease.exit` curves.
**Acceptance:** `npx tsc --noEmit` clean; every existing import still resolves.

### 1.3 — Add exits · **M**
**Files:** `lesson.tsx:150,217,246`, `term-match.tsx:133`, `number-line.tsx:120`,
`tile-builder.tsx:104`, `before-after-slider.tsx:85`, `multi-select.tsx:83`, `sort-buckets.tsx:69`
**Change:** every `entering={...}` gets a matching `exiting={...}` at `Duration.exit` (180ms),
per M3's exit ≈ 0.6–0.7× enter.
**Acceptance:** navigating backwards out of any lesson step shows motion, not a cut.

---

## PHASE 2 — The Atlas reaction map (the brief's highest-value deliverable)

**Read:** `src/components/atlas.tsx` (500 ln) and `src/components/onboarding-parts.tsx` (637 ln).
Budget ~40k context for both; read them *after* Phase 1 ships so a compaction can't cost you the fixes.

Produce a table with **no empty cells**:

`trigger → beat → duration(ms) → displacement(px/pt) → spring preset → deform-or-translate`

Minimum rows: **idle, press, acknowledge, correct, incorrect, lesson complete, streak extended,
level up, streak lost.**

Anchor it to what is measured, not invented:
- An **earned moment is ~3200ms and two-stage** (Duolingo). Today nothing in the app exceeds 400ms.
  `Duration.earned` exists now — build the anticipation → burst → flash → resolve structure.
- **Acknowledge ≠ celebrate.** Taps currently nod (2px drift); the reveal hops (426→406→412 px).
  Add the missing beats: lean-in, press anticipation, and **distinct success vs error**.
- Resolve **problem 4**: `AtlasStage` translates the mascot vertically by `ATLAS_RISE` on every step
  change, competing with its own reactions. Decide whether the stage moves *or* the mascot reacts —
  not both simultaneously.

**Acceptance:** every row cites either a measurement, a spec, or is labelled an engineering guess.
No row may be true of every app ever built.

---

## PHASE 3 — Remaining research agenda

Group and answer, each with **number + source + tier + confidence + falsification condition**:

- **A2–A5** — 12 principles filtered for a 6" screen at 60fps; follow-through lag in ms;
  reaction budgeting / escalation tiers; motion tied to narrative state.
- **B1** ⚠️ press timing **cannot** be measured from the 30fps clips (a press is ~3 frames).
  Use Tier 1 (Apple HIG) + the `Spring.press` preset, and say it is not measured.
- **B2** selection treatment · **B4** funnel transitions · **B5** correct/incorrect full beat.
- **C3** perceptual thresholds (Doherty, Nielsen) · **C4** 120Hz ProMotion — the Software Mansion
  120fps skill covers this.
- **D2** brand-colour-for-system-signals rule · **D3** type/spacing/radius · **D4** bland-vs-sparse.
  **Skip D1** — the surface ramp is already fixed.
- **E1 answered already** (open-source Lottie→Skia pipeline, V2 §6) · **E2** auditing tools ·
  **E3** reduce-motion per-beat policy.

Then produce the **ranked implementation backlog** (effort S/M/L, files, acceptance test) and the
**tiered source list** including everything unverifiable.

---

## METHOD — reuse, never rebuild

Scripts live in the session scratchpad. **Copy them into `scripts/` before anything else:**
```bash
cp /private/tmp/claude-501/-Users-siddarthakodithyala/*/scratchpad/{motion_energy,measure}.py scripts/
```
- `motion_energy.py <clip...>` — whole-clip burst finder, % frames animating
- `measure.py "path|start|end|label"` — per-window energy, luma, centroid, **automatic
  overshoot(spring)-vs-monotonic(tween) classification**

**Hard limits — violating these produces defects:**
- `refs/videos/*.mov` are **30fps**, downscaled (444×960 / 296×640). Every duration is **±33ms**.
- **Never claim a press timing from these clips.**
- **Pixels are authoritative.** Point conversion assumes 390pt logical width and is **unverified**.
- Never present an estimate as an observation. A labelled guess is fine; a fake measurement is a defect.

**Still unmeasured, worth doing:** Brilliant's Streak Charge at **~41–50s** in `13-12-29`
(starburst → bolt). A prior attempt at 51.6–54.2s was mis-targeted and returned nothing.

---

## CONSTRAINTS

- **Reanimated v4 API names only.** A v3 answer will not compile — that is a defect. Use the
  Software Mansion skills or Context7 to verify.
- **Zero budget.** Rive, Polymation, EAS and the $250 animator are all out. For Atlas the order is:
  (1) Claude-generated Lottie → `<Skottie/>` in `@shopify/react-native-skia`, (2) extend the
  existing hand-coded `atlas.tsx`, (3) Rive only if funded.
- **Design craft is open-source only:** Blender + Poly Haven for semi-3D hero art, Radix Colors to
  audit the dark ramp, Iconify (already wired via `ecc:ios-icon-gen`), one icon set only.
- Judge motion in a **release build** — debug over Metro is not representative.

---

## DISCIPLINE

The prior session cost **~$27** and exhausted its context. What burned it: web search. What was
cheap and produced every real number: local ffmpeg + grep.

- Batch tool calls — one call doing five things.
- Prefer local measurement over web research.
- **Write findings to disk as you go.** Everything in this plan survived only because it was
  persisted before compaction.
- Ship Phase 1 before reading the two large files in Phase 2.

## DONE MEANS

- [ ] Phases 1.1–1.3 shipped, `npx tsc --noEmit` clean, drag-sort re-measured above 15%
- [ ] Atlas reaction map complete, nine rows minimum, no empty cells
- [ ] Every recommendation carries a number
- [ ] Every number carries a source + tier, or is labelled UNVERIFIED / engineering guess
- [ ] Every Reanimated API named is v4-correct
- [ ] At least three things explicitly stated as unverified
