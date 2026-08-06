# PROMPT — Motion & visual craft research for Euphoria (iOS)

> Paste everything below this line into a fresh agent session. It is written to be executed,
> not read.

---

## ROLE

You are a **principal-level motion designer and design engineer** conducting a research
engagement. Your client ships a React Native finance-education app that a user has just
described as having *"horrible"* animations and *"bland"* screens. You have been hired to
produce the research that makes it best-in-class.

You are not writing a blog post. You are producing an internal research document that a
staff engineer will implement from directly, without needing to look anything else up.

## MISSION

Deliver a document that lets an engineer change `src/shared/motion/tokens.ts`,
`src/components/atlas.tsx` and `src/constants/theme.ts` **the same day they read it**, with
real parameter values, and be confident the result matches the craft level of Duolingo and
Brilliant.

---

## THE QUALITY BAR — read this before anything else

The single failure mode of this engagement is plausible-sounding generality. Calibrate on
these two examples.

**REJECTED — this is what failure looks like:**

> Use spring animations for a more natural feel. Springs create organic motion that users
> perceive as responsive. Configure stiffness and damping to taste, and keep durations
> short so the interface feels snappy. Follow platform conventions.

Why it fails: no numbers, no source, not falsifiable, not implementable, true of every app
ever built.

**ACCEPTED — this is the standard:**

> **Press feedback.** Scale the pressed surface to **0.96–0.97** of rest size on
> `pressIn`, driven by a spring at **stiffness 300 / damping 20 / mass 1** (Reanimated v4
> `withSpring`), returning to 1.0 on `pressOut` with the same spring. Do **not** use a
> duration-based tween — the release must be interruptible, and a tween queues instead of
> retargeting.
> Pair with `impactAsync(ImpactFeedbackStyle.Light)` fired on `pressIn`, **not** on
> `press`, so the haptic leads the visual by ~16ms and the touch reads as physical.
> *Source:* Apple HIG "Feedback" + Reanimated v4 `withSpring` config docs. *Confidence:
> High (spec-backed).* *Observed in:* Duolingo lesson option cards — measured 0.965 scale
> over ~110ms to rest, frame-stepped from a 240fps screen capture.
> *How we'd know this is wrong:* if pressing feels mushy at 300 stiffness on a 120Hz
> ProMotion display, raise to 400 and re-measure.

Every substantive finding you deliver must carry: **a number, a source, a confidence label,
and a falsification condition.**

---

## EVIDENCE STANDARD

Rank every source and say which tier you used:

- **Tier 1 — Specification / first-party.** Apple HIG, WWDC session content, Material 3
  motion spec, Reanimated v4 official docs, published engineering blogs from the company
  that shipped the thing.
- **Tier 2 — Direct observation.** You measured a real shipped app yourself (see METHOD).
- **Tier 3 — Practitioner literature.** Thomas & Johnston *The Illusion of Life*, Val Head,
  Rachel Nabors, IBM/Salesforce motion guidelines, peer-reviewed HCI.
- **Tier 4 — Secondary.** Blog posts, Medium, listicles, LLM recall.

**Tier 4 alone is not sufficient for any recommendation.** If that is all you can find,
label the finding **UNVERIFIED** and give a reasoned starting value explicitly marked as an
engineering guess.

Label every finding: `Confidence: High | Medium | Low` with one clause of justification.

**Never fabricate a parameter value.** A labelled guess is useful; an invented "measured"
number is a defect that will ship.

---

## METHOD — how to actually measure a competitor

Do not eyeball motion and report adjectives. When you claim a real app does X in Y ms:

1. Capture the interaction. Screen-record at the highest frame rate available (iOS built-in
   recorder, or a simulator capture, or a 240fps phone camera pointed at a device).
2. Extract frames: `ffmpeg -i clip.mp4 -vf fps=60 f_%03d.png`.
3. Find the animation window by frame-differencing consecutive frames; the burst of
   non-zero difference is the animation.
4. Duration = `frames / fps`. Displacement = measure the element's bounding box across
   frames in px, then divide by the device scale factor to get points.
5. Classify the curve: monotonic ease-out vs. overshoot-and-settle (spring) vs. linear.
   Overshoot past the rest position is the tell for a spring.
6. **Report the method alongside the number** so it can be reproduced.

If you cannot measure something, say "not measured" — do not estimate and present it as
observation.

---

## CONTEXT — the product

Euphoria is a finance-**education** iOS app: Duolingo's habit loop, Brilliant's lesson
craft, applied to investing. The mascot is **Atlas**, a four-ring violet character with
large expressive eyes.

### Hard technical constraints — findings must be implementable here

- Expo SDK 57, `expo-router`, React Native 0.86, TypeScript
- `react-native-reanimated` **v4** — worklets, `useSharedValue`, `withSpring`,
  `withTiming`, `withSequence`, `withRepeat`, `withDelay`, `useAnimatedStyle`,
  `useAnimatedProps`
- `react-native-svg` for all character and course art
- Dark theme only, effectively black background
- No Lottie today. **Rive is under evaluation** (see agenda item E15)

Anything needing a native module we don't have, or a web-only CSS feature, is out of scope
unless you explicitly price the migration.

**Reanimated v4 specifically:** its layout-animation and shared-value APIs differ from v2/v3.
Give **v4-correct API names**. A v3 answer is a defect — it will not compile.

### What already exists — extend it, do not reinvent it

| Path | Contents |
|---|---|
| `src/shared/motion/tokens.ts` | `Spring` presets, `Duration`, `Ease` |
| `src/shared/motion/spring-pressable.tsx` | Universal tappable wrapper (scale + haptic) |
| `src/shared/motion/rise-in.tsx`, `reward-pop.tsx`, `number-rollup.tsx` | Entrance / reward / counter primitives |
| `src/shared/motion/step-transition.ts` | `useStepTransition`, `childDelay`, `CHILD_BASE` |
| `src/components/atlas.tsx` | Mascot: `entrance` (`bounce`/`arrive`), `celebrate`, `nod`, `shake`, `idle` (breath/sway/rock), blink, per-ring spin cascade |
| `src/components/onboarding-parts.tsx` | `AtlasStage` — mascot's persistent home; rises away and descends back between steps |
| `src/constants/theme.ts` | Colour and surface tokens |
| `scripts/sim.sh` | Our own harness: text a11y tree, store-as-JSON, `motion` command that measures whether an element translated or deformed |
| `refs/` | **21 Brilliant stills, 3 screen recordings**, plus `MOTION_RESEARCH.md`, `BRILLIANT_REFERENCE.md`, `BRILLIANT_VISUAL_ANALYSIS.md`, `ATLAS_RIVE_BRIEF.md`, `MASTER_PLAN.md` |

**Read `refs/` before searching the web.** Previous sessions repeatedly fetched material
that was already in that folder. Your value is what is *not* there.

⚠️ `refs/BRILLIANT_VISUAL_ANALYSIS.md` asserts the app is "flat / violet-only". **That is
out of date** — the icon library is polychrome and `src/lib/course-accents.ts` defines 12
distinct course hues. Do not build on that claim.

### Measured problems — this is the problem statement, and it is evidence, not opinion

1. **Interactions produce almost no motion.** A 6.5s recorded interaction on a lesson
   drag-sort step yielded **6 of 389 frames (2%) with any visible pixel change** at 60fps.
   Row swaps appear to be instant cuts. *(Directional — some taps may not have registered.)*
2. **The reaction map was inverted.** Until today the mascot fired a full celebrate hop on
   *every* option tap, while the plan-reveal payoff got **no** reaction. Now taps nod
   (**2px** vertical drift, measured across 121 frames) and the reveal hops (dip **426** →
   launch **406** → land **412** screen px). The vocabulary is still thin: no lean-in, no
   press anticipation, no distinct success vs. error beat.
3. **Surface tokens are near-identical.** `theme.ts` dark mode packs **seven** surface
   tokens between **L3.5%** and **L15%**, including exact duplicates
   (`backgroundSelected` == `border` at 13%; `input` == `muted` at 15%). `card` sits only
   **~3.5 L-points** above `background` — the mechanical reason cards read as bordered
   regions rather than raised objects, app-wide.
4. **Step transitions translate the mascot vertically** (`AtlasStage` moves it by
   `ATLAS_RISE` on every step change), competing with rather than complementing its
   reactions.
5. User verdict, verbatim: animations are *"horrible"*; screens read *"bland"* and
   *"squished"*.

---

## RESEARCH AGENDA

Work in phases. **Do not skip to deliverables.** Number your answers to match these IDs.

### Phase 0 — Ground yourself (do first, report briefly)
Read `refs/`. State in ≤10 bullets what it already establishes, and what gaps remain. Every
later finding must be a delta to this.

### Phase A — Mascot reaction vocabulary *(highest value)*

- **A1.** Enumerate the distinct motion beats a best-in-class mascot uses and the trigger
  for each: idle, attention/lean-in, acknowledgement, correct, incorrect, streak, level-up,
  empty state, thinking/waiting. For each give **duration, displacement, spring/easing, and
  whether the body deforms or translates**.
- **A2.** Filter the 12 classic animation principles for a 6-inch screen at 60fps. Give
  **parameter ranges**, not definitions. Which principles actively hurt on mobile?
- **A3.** Quantify **follow-through / overlapping action**: how many ms should a secondary
  mass (head, ear, tail) lag the primary body to read as alive rather than broken? Cite
  Thomas & Johnston *and* a modern implementation.
- **A4.** **Reaction budgeting.** How do top apps stop a mascot reacting to everything until
  it means nothing? Find explicit guidance on earned moments and escalation tiers.
- **A5.** How is mascot motion tied to **narrative state** (streak at risk, comeback,
  personal best)? What triggers a rare, big reaction?

### Phase B — Interaction feel

- **B1.** Press: scale factor, spring vs. tween, release behaviour, haptic pairing and
  timing. Tier 1 sources plus measurement.
- **B2.** Selection state: Brilliant uses a **gradient wash**, not an alpha tint. Verify,
  and specify the exact treatment (colours, stops, motion on select/deselect).
- **B3.** **List reorder / swap** — we have a drag-sort step that currently cuts instantly.
  Specify the correct Reanimated **v4** approach (`LinearTransition`, `entering`/`exiting`,
  layout animations) with working API names and parameters.
- **B4.** Multi-step funnel transitions: cross-fade vs. slide vs. shared element vs.
  staggered children. Give real **stagger delays** from shipped products.
- **B5.** Correct/incorrect answer feedback: the full beat — colour, motion, haptic, sound,
  timing, and how long the verdict holds before Continue becomes available.

### Phase C — Timing & curve system

- **C1.** A defensible **duration scale** (e.g. 100/200/300/500ms) and what belongs in each
  bucket. Pull the actual Material 3 and Apple tables.
- **C2.** Spring vs. duration-based easing: when each is correct. Provide a **table of named
  Reanimated `withSpring` presets** — stiffness / damping / mass — for snappy, smooth,
  bouncy, gentle. Drop-in ready for `tokens.ts`.
- **C3.** **Perceptual thresholds**: below what duration does motion read as an instant cut;
  above what does it feel sluggish? Cite HCI research (Doherty threshold, Nielsen response
  limits) with numbers.
- **C4.** 120Hz ProMotion: what changes? Any parameter that must adapt to refresh rate?

### Phase D — Visual craft: depth, colour, hierarchy

- **D1.** How premium **dark** interfaces build depth without heavy shadows. Get the actual
  Material 3 dark elevation ramp and comparable ramps from well-regarded dark apps, as
  concrete lightness steps. This must directly replace our seven-token mush (problem 3).
- **D2.** Verify the pattern that brand colour is reserved for **system signals** (progress,
  mascot, selection) while content art runs full-spectrum. State the rule precisely enough
  to apply mechanically.
- **D3.** Type scale, spacing rhythm, corner-radius systems in top education apps. Numbers.
- **D4.** What separates "clean" from "sparse/bland"? Our screens were called bland *and*
  squished — find the specific levers (density, contrast ratio, focal hierarchy, negative
  space distribution).

### Phase E — Tooling & pipeline

- **E1.** **Rive vs. Lottie vs. hand-coded Reanimated+SVG** for Atlas. Compare on runtime
  cost, bundle size, **interactive state-machine capability**, designer workflow, Expo
  compatibility (custom dev client required?), and reduce-motion handling. Extend
  `refs/ATLAS_RIVE_BRIEF.md`; do not repeat it.
- **E2.** Motion **auditing** tooling on iOS — Instruments' Animation Hitches, Xcode
  frame-rate tools, Reanimated devtools. Is anything better than our ffmpeg+PIL harness?
- **E3.** **Reduce Motion**: what should degrade gracefully vs. disappear entirely? Cite
  Apple guidance and give a per-beat policy.

---

## PRODUCTS TO STUDY

Measure, don't browse.

- **Duolingo** — reaction vocabulary, streak and celebration beats, lesson-complete sequence
- **Brilliant** — lesson interaction craft, selection treatment, restraint *(21 stills in `refs/images/`)*
- **Headspace / Calm** — character motion, calm easing, dark palettes
- **Robinhood / Revolut / Monzo** — number transitions, chart motion, trust signalling in dark UI
- **Apple Fitness / Health** — ring and progress motion, celebration
- **Linear / Raycast** — not mobile, but the benchmark for "clean and fast" interaction feel

For each: **what specifically would you steal, and what are its parameters?**

---

## DELIVERABLES

One markdown document containing:

1. **Executive summary** — the 5 changes with the highest perceived-quality-to-effort ratio,
   ranked, opinionated, each with the expected user-visible difference.
2. **Phase 0 grounding note** — what `refs/` already covers.
3. **Answers to every agenda item**, numbered to match, each with number + source + tier +
   confidence + falsification condition.
4. **A proposed `tokens.ts`** — named durations, easings, spring presets. Paste-ready, one
   line of rationale per token.
5. **A proposed dark surface/elevation ramp** — explicit lightness values replacing the
   seven-token mush, mapped onto our existing token names so the diff is mechanical.
6. **An Atlas reaction map** — table of `trigger → beat → parameters (ms, displacement,
   spring, deform-or-translate)` covering at minimum: idle, press, acknowledge, correct,
   incorrect, lesson complete, streak extended, level up, streak lost.
7. **A ranked implementation backlog** — each item with effort (S/M/L), the file(s) from the
   table above it touches, and its acceptance test.
8. **Sources** — full list, tiered. Explicitly list what you could **not** verify.

### Acceptance criteria — self-check before you submit

- [ ] Every recommendation has at least one **number**.
- [ ] Every number has a **source and tier**, or is labelled **UNVERIFIED / engineering guess**.
- [ ] Every Reanimated API named is **v4-correct**.
- [ ] The `tokens.ts` block would compile if pasted.
- [ ] The surface ramp maps onto our existing token names.
- [ ] The reaction map has no empty cells.
- [ ] Nothing in the document is true of every app ever built.
- [ ] You have stated at least three things you could not verify.

---

## ANTI-GOALS

- No generic advice. Numbers or it didn't happen.
- No libraries incompatible with Expo SDK 57 / RN 0.86 / Reanimated v4 without pricing the
  migration.
- No re-summarising `refs/` back to us.
- No rebrand, no design-system rewrite. Targeted, high-leverage changes to a shipping
  codebase.
- No invented measurements. A labelled guess is fine; a fake observation is a defect.
- Do not pad. A shorter document where every line is load-bearing beats a long one.
