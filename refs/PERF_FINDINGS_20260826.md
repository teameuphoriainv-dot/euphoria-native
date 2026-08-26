# TestFlight lag: what is measured, what is not

Written 26 August 2026, against build 19 (`b3256d8`). The owner treats the lag as a
submission blocker and the carryover named three suspects, all unproven. This file
separates what has now been MEASURED from what is still a hypothesis, because the
previous document's mistake was letting the two blur.

**Nothing here has been confirmed as the cause.** Everything below is either a
measurement or a candidate. The measurement plan at the end is how to tell them apart.

---

## Measured facts

| Fact | Value | How |
|---|---|---|
| Shipped JS bundle | **18.2 MB** Hermes bytecode v98 | unzipped build 19's IPA |
| Curriculum source | **10.8 MB** across 12 course files | `wc` on `src/lib/curriculum/courses/*.ts` |
| Curriculum share of bundle | **roughly 59%** | ratio of the two above |
| Lesson titles in the shipped bundle | **295/295** | byte search of `main.jsbundle` |
| Course chunks shipped separately | **none** | no chunk files in the `.app` |
| `/api/market?action=marks` | **305,713 bytes, 12,538 entries, 1.13 s** | live curl against production |
| `AmbientBackground` mount sites | **35 files** | grep across `src/app` and `src/components` |
| Its animation | `withRepeat(withTiming(...), -1, true)` at line 41 | read the source |
| React Compiler | **on** (`app.json:62`) | read the config |

## Candidates, ranked by how much evidence points at them

> Ranking revised the same day. Candidate 1 was written from a grep and demoted after
> reading the component, which already documents its own mechanism and already carries
> the mitigation. Recorded rather than silently reordered, because the reason a rank
> changed is worth more than the rank.

### 1. AmbientBackground, ALREADY LARGELY MITIGATED
Demoted after reading the component rather than only grepping for it. This entry first
said the decisive unknown was whether react-native-svg animates natively. It is not
unknown: `ambient-background.tsx:82` states the mechanism outright, and someone already
fixed the expensive half.

CONFIRMED, from the source: `t0/t1/t2/glowPulse` feed `useAnimatedProps` on `<G>` and
`<Rect>`, and RNSVG cannot natively animate most SVG attributes, so every frame of those
crosses into JS and costs a React commit. The same mechanism was measured in `atlas.tsx`
and taking it out moved Home's idle commits from 3.04/s to about 1.1/s.

ALREADY MITIGATED, two ways:
  - A FOCUS GATE. `if (reduced || !focused)` settles every twinkle to its resting value.
    React Navigation keeps unfocused tabs mounted, so before this every tab you had ever
    visited was twinkling behind the one you were reading. It no longer is.
  - THREE GROUPS, NOT PER-STAR. 22 to 45 stars share three desynced `<G>` opacities, so
    the cost is four animated props, not one per star.

So the honest reading is four JS-crossing props on the ONE visible screen, plus a drift
transform the UI thread owns end to end. That is much smaller than "35 screens animating
forever", which is what the first version of this file implied. Still worth measuring,
no longer the leading candidate.

It is guarded by `useReducedMotion`, which is correct and rules out an accessibility
defect here.

### 2. An 18.2 MB bundle, 59% of it lessons
Every one of the 300 lessons is compiled into the launch bundle. In development they
load as separate `.bundle` chunks (see `curriculum/index.ts`, which records
`personalFinance.bundle` being fetched twenty times at 664.7 KB each); in production
they are inlined, which is why the `--no-dev` chunk error is a dev-server artifact and
not a shipping defect.

Hermes memory-maps its bytecode and evaluates lazily, so 18.2 MB is not automatically a
startup cost. But it is large, and it is the one number here that would shrink
dramatically if lessons were loaded per course rather than all at once.

### 3. The marks payload on the Trade tab
305 KB and 1.13 s for 12,538 tickers, parsed into a Map on arrival. Real, measured, and
lands on one specific tab. This cannot explain lag on screens that never call it.

### 4. React Compiler
On. Listed for completeness because the carryover named it, but the compiler exists to
ADD memoization. Treat as a red herring unless something else rules it in.

---

## How to actually tell

`components/perf-hud.tsx` exists precisely because there is no profiler on device. It
measures JS-thread frame gaps and sits behind a settings toggle.

1. Turn on the HUD and open a screen with NO ambient background, if one exists, then one
   with it. A difference in JS-thread frame gaps between the two isolates candidate 1
   from everything else in one comparison.
2. Watch the HUD during a cold start to separate launch cost (candidate 2) from
   steady-state cost (candidate 1).
3. Open the Trade tab with the HUD running to see whether the 305 KB parse produces a
   visible spike (candidate 3), and whether it is a one-off or repeats.

Report the numbers. Do not report a cause without them.
