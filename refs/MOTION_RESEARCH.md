# Why our motion doesn't match Brilliant/Duolingo — researched, with sources

Three parallel research passes, 2026-08-04. Findings separated into CONFIRMED (has a source),
LIKELY (reasoned), UNKNOWN (say so rather than guess).

---

## The answer

**Both reference apps author motion in Rive. We author it in code.**

- **Duolingo — CONFIRMED.** Their own engineering blog: the Rive file sizes "plugged in neatly with
  Duolingo's app architecture, and the handoff from animator to engineer was seamless." The state
  machine "allowed us to programmatically control which animation states are called, how they are
  called, and how they transition and blend together."
  https://blog.duolingo.com/world-character-visemes/
- **Brilliant — CONFIRMED.** Rive drives their **streak celebration** and colour-coded learning
  pathways, and it **replaced Lottie, After Effects, native code, and GIFs**. Their engineers:
  "Rive is significantly easier to integrate, handles our use cases, and allows designers to focus
  on making the animation." Reported saving a full day of prep per animation; shipped iOS, Android
  and web simultaneously.
  https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations

**Neither company publishes a motion token system.** No duration tokens, no easing curves, no
spring constants, from either. Their system IS the .riv state machine. Do not go looking for a
spec table to copy — it does not exist.

So the gap is not that our spring values are mistuned. It is that **an engineer typing spring
configs cannot converge on what an animator sees.** That is an authoring-surface problem.

### What Duolingo did about it
Created a role between the two: **Creative Technologist** — not an animator, not an engineer.
Animators build timelines; creative technologists build state-machine logic and the input spec;
engineers fire named inputs. "The design is the final product" — no conversion step.
Review cadence: twice-weekly syncs plus a weekly file drop ("Riv Deliv"). Swapping the .riv does
not break code, so **motion iterates independently of releases**.
https://rive.app/blog/creative-technologists-duolingo-s-solution-to-the-designer-to-developer-handoff

They also acquired two animation studios (Gunner 2022, Hobbes 2024) to build an in-house motion team.

**UNKNOWN:** what specifically drives Duolingo's lesson-complete/streak celebrations (the Rive case
study covers Video Call / Lily, not celebrations). A LottieFiles Duolingo case study exists but
returned 403 and was not read — they may use both. Not verified.

---

## What this means for us, concretely

**We already own the runtime.** `rive-react-native ^9.8.5` is installed, `atlas-rive.tsx` loads a
.riv and fires state-machine inputs, and `atlas-test.tsx` fires `celebrate`. **Only the asset is
wrong** — `assets/atlas.riv` wraps the raster `atlas-logo.png` the app deliberately replaced.

**The contract already exists too:** artboard `Atlas`, state machine `State Machine 1`, trigger
`celebrate`. That is the input list an animator needs. See `refs/ATLAS_RIVE_BRIEF.md`.

**Cost — note the discrepancy.** riveanimator.com publishes **mascot from $250**, custom AI mascot
$650 (verified by fetching the page). A research pass estimated $3–8k for a rig plus 3–4 states
(unsourced inference). Trust the published figure; treat the higher range as the ceiling for a
larger scope.

---

## Meanwhile: fixes that need no animator

### Judge motion in RELEASE, not debug
**Debug builds are laggy at 120fps on device.** Every animation assessed on 2026-08-03 ran in a
dev-client debug build over Metro, which is not representative. Re-judge before concluding anything
feels wrong. (`CADisableMinimumFrameDurationOnPhone` is already `true` in the generated
Info.plist, so we are not capped at 60fps — but note `/ios` is gitignored, so that key comes from
Expo's prebuild template, not our config.)

### Apple spring values → Reanimated (mass 1)
`dampingRatio` in Reanimated IS Apple's `dampingFraction`, so `{ duration, dampingRatio }` skips
the algebra. Note duration-based springs are **perceptual: real settle ≈ 1.5× the stated value**.

| Feel | Apple response / ζ | stiffness | damping |
|---|---|---|---|
| iOS default | 0.55 / 0.825 | 131 | 18.9 |
| Calm settle | 0.50 / 1.00 | 158 | 25.1 |
| Snappy UI | 0.50 / 0.85 | 158 | 21.4 |
| Bouncy playful | 0.50 / 0.70 | 158 | 17.6 |
| Reward pop | 0.35 / 0.55 | 322 | 19.7 |
| Press-in | 0.25 / 1.00 | 632 | 50.3 |

**Our finish beat uses stiffness 82 / damping 11.** The reference for a reward pop is **322** —
roughly 4× stiffer. Ours is floaty, which matches what the filmstrip showed.

### Reanimated capability we are not using — ranked
1. **Layout Animations** (`entering`/`exiting`/`layout`). Buys the two things hand-rolled code never
   does: **exit** animations and **reflow** animations. `RiseIn` is likely a hand-rebuild of
   `FadeInDown` with no exit and no layout counterpart. `LinearTransition.springify()` is the
   correct mechanism for the Digest filter, where we currently force a remount by keying on filter.
2. **Interruptibility.** `withSpring` retargeting preserves position AND velocity; `withTiming`
   restarts from rest; **`withSequence` snaps when retargeted mid-flight** — and our reward pops use
   it heavily. Test: tap a button 4× fast; if taps 2–4 start from rest, we restart instead of retarget.
3. **Haptics at the APEX**, not at animation start, so touch and sight agree. Our reward moments
   fire no haptic at all.
4. **Perf Monitor UI-vs-JS FPS split** is the whole diagnosis in one screen. JS collapses while UI
   holds 60 → per-frame thread hops. UI drops while JS holds → heavy worklets or SVG relayout.
5. **Skip Shared Element Transitions** — experimental behind a build flag in Reanimated 4.

### Timing references (Material 3, CONFIRMED)
Enter ≈ 400–500ms with `emphasized-decelerate` `cubic-bezier(0.05, 0.7, 0.1, 1)`.
Exit ≈ 150–200ms with `emphasized-accelerate` `cubic-bezier(0.3, 0, 0.8, 0.15)`.
**Exit ≈ 0.6–0.7× enter** — the user has already decided; the outgoing element carries no information.
Stagger is **folklore, not spec**: 50–80ms is the "Duolingo-feeling" range, cap the cascade at
~300–400ms. Ours is 30ms, on the tight side.

### Our own filmstrip method — one correction
Frame spacing in a tiled contact sheet IS the velocity curve, which no FPS tool shows, so the method
is sound. But sampling at 8–11fps is too coarse to read it — **capture and tile at `fps=60`**. That
coarse sampling is why the finish beat was misjudged twice.
