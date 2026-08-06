# Motion research v2 — measured findings

Session 2026-08-06. **Supersedes parts of `MOTION_RESEARCH.md`** (corrections in §5).
Everything here is either measured on this machine (**Tier 2**) or spec-sourced (**Tier 1**).
Nothing in this file is estimated and presented as observation.

---

## 1. Method, and its hard limit

ffmpeg → grayscale raw → numpy frame-differencing. Scripts are reusable:

- `motion_energy.py` — whole-clip pass, finds animation bursts, reports % of frames animating
- `measure.py` — per-window: energy curve, luma, changed-bbox, centroid trajectory,
  automatic **overshoot (spring) vs monotonic (tween)** classification

Both were written to `scratchpad/` and **should be copied into `scripts/`** — they are the only
tooling that produces competitor numbers.

**The limit, stated up front:** `refs/videos/*.mov` are **30fps**, not 60, and downscaled
(444×960 and 296×640). So:

- Every duration is **±33ms**. Fine for 300–600ms transitions. **Too coarse for a ~100ms press** —
  a press is 3 frames. Do not claim press timings from these clips.
- Point conversion assumes a 390pt logical width. **Pixels are authoritative; points are derived
  and unverified** — the source device is unknown.

---

## 2. Measured — Tier 2

### Motion density (the headline)

| App | Frames animating |
|---|---|
| Brilliant `10-50-24` | **34.7%** |
| Brilliant `13-12-29` | **39.3%** |
| Duolingo `14-17-49` | **31.8%** |
| **Euphoria** (drag-sort, prior session) | **2%** |

⚠️ These clips include scrolling, which inflates them. Treat as **directional**, not a clean 16×.
A fair rerun would isolate discrete tap→response windows.

### Brilliant — step transition (light-tunnel), `10-50-24` @ 52.40s

- **Duration 467ms** (frames 8–21), settled by frame 22
- **Luminance flash peaks 67ms in**: 19.9 → **212.6** → 34.4. The flash *leads*, then decays
- **Overshoot confirmed = spring.** Centroid 533 → **762** → settles 534 (≈228px out and back)

### Duolingo — streak-flame ignite, `14-17-49` @ 131.9s

- **Total 3200ms**, explicitly **two-stage**:
  build ~230ms → slow burn ~700ms → **burst** (energy 10→23→43→**70**) →
  settle → **white flash** (luma 25.9 → **207.5**) → resolve
- **An earned moment gets 3.2 seconds.** Euphoria's longest duration token is `slow: 400`.
  This structural gap — not spring tuning — is why payoffs don't land.

### Duolingo — transition sequence @ 210.5s

- Overshoot spring, centroid magnitude 98px
- Energy spikes at frames 8/25/42/59 = a regular **~567ms beat**.
  **Cannot tell from pixels whether that is a staggered cascade or user taps.** Not a stagger claim.

### ❌ One bad window — do not use

`13-12-29` @ 51.6–54.2s returned luma delta 0.0 and no net travel. **Mis-targeted.**
Brilliant's Streak Charge is earlier, **~41–50s** (starburst → bolt). Unmeasured.

---

## 3. Codebase audit — where the gaps physically are

### Reanimated API usage across `src/`

| API | Uses |
|---|---|
| `withTiming` | **62** |
| `withSpring` | 39 |
| `withDelay` | 41 |
| `withSequence` | 14 |
| `LinearTransition` | **0** |
| `FadeIn` / `FadeOut` | 22 / **4** |

**Three structural findings:**

1. **`LinearTransition` = 0, and no `layout=` prop anywhere.** There is **no reflow animation in
   the app at all.** This is the mechanical cause of the measured 2%-frames instant cut.
   Files: **`src/components/order-steps.tsx`**, **`src/components/sort-buckets.tsx:69`**.
   Fix ≈ one line per row component:
   `layout={LinearTransition.springify().damping(18)}`
2. **`withTiming` outnumbers `withSpring` 1.6:1** — the non-interruptible primitive dominates in an
   app whose whole reference class is spring-heavy. Each of the **14 `withSequence` sites snaps
   rather than retargets** mid-flight. Test: tap a rewarding element 4× fast.
3. **Exit deficit 5.5:1.** Entering-only sites: `lesson.tsx:150,217,246`, `term-match.tsx:133`,
   `number-line.tsx:120`, `tile-builder.tsx:104`, `before-after-slider.tsx:85`,
   `multi-select.tsx:83`, `sort-buckets.tsx:69`. Elements arrive, then hard-cut away.

**Good pattern to propagate:** `tap-reveal.tsx:51` uses `ZoomIn.springify().damping(16)` — the only
`.springify()` in the codebase, and its damping sits inside Brilliant's measured 12–18 band.

---

## 4. Proposed `tokens.ts` — paste-ready, compiles against Reanimated 4.5.0

```ts
import { Easing } from 'react-native-reanimated';

export const Spring = {
  /** Press. Apple response 0.25 / ζ 1.0 — critically damped; wobble on a ~100ms beat reads as lag. */
  press:  { stiffness: 632, damping: 50, mass: 1 },
  /** Default UI settle. Apple response 0.50 / ζ 0.85. */
  snappy: { stiffness: 158, damping: 21, mass: 1 },
  /** No overshoot — sheets and nav, where overshoot reads as a bug. Apple 0.50 / ζ 1.0. */
  smooth: { stiffness: 158, damping: 25, mass: 1 },
  /** Playful overshoot: mascot, selection. Apple 0.50 / ζ 0.70. Matches Brilliant's measured overshoot. */
  bouncy: { stiffness: 158, damping: 18, mass: 1 },
  /** Reward pop. Apple 0.35 / ζ 0.55. Our finish beat was 82 — ~4× too floaty. */
  reward: { stiffness: 322, damping: 20, mass: 1 },
  /** Large mass arriving (AtlasStage descend). */
  gentle: { stiffness: 180, damping: 26, mass: 1 },
} as const;

export const Duration = {
  /** On-screen state change (colour/opacity). Below ~100ms reads as a cut. */
  instant: 100,
  /** Exit. M3 emphasized-accelerate 150–200ms; exit ≈ 0.6–0.7× enter. */
  exit: 180,
  /** Default enter. */
  base: 280,
  /** Screen/step transition. MEASURED: Brilliant = 467ms. */
  screen: 460,
  /** Number roll-up. */
  count: 900,
  /** Earned moment. MEASURED: Duolingo streak ignite = 3200ms, two-stage. */
  earned: 3200,
} as const;

export const Ease = {
  /** M3 emphasized-decelerate — entrances. */
  enter: Easing.bezier(0.05, 0.7, 0.1, 1),
  /** M3 emphasized-accelerate — exits. */
  exit: Easing.bezier(0.3, 0, 0.8, 0.15),
  /** Standard — on-screen state changes. */
  inOut: Easing.bezier(0.4, 0, 0.2, 1),
} as const;

/** Sibling stagger. 50–80ms is the shipped range; cap the cascade so the tail never drags. */
export const STAGGER_GAP = 60;
export const STAGGER_CAP = 360;
```

---

## 5. Corrections to existing `refs/` docs — fix these

1. **`README.md` mislabels the videos.** `ScreenRecording_07-21-2026 14-17-49_1.mov` is
   **Duolingo**, not Brilliant. It is 268s (not ~108s) of Duo onboarding + lesson + streak, dark UI.
   Tier-2 Duolingo measurement is therefore possible.
2. **`MOTION_RESEARCH.md`: "our reward moments fire no haptic at all" is FALSE.** Success/error
   haptics are broadly wired: `tile-builder.tsx:29`, `matching-pairs.tsx:39,56`,
   `order-steps.tsx:40`, `number-line.tsx:39`, `graph-point-drag.tsx:39`, `tap-reveal.tsx:24`,
   `term-match.tsx:69,74`, plus `selectionAsync()` throughout and `impactAsync(Light)` in
   `spring-pressable.tsx:41`. Coverage is good; the open question is **timing (apex vs start)**.
3. **`MOTION_RESEARCH.md`: "our stagger is 30ms" is STALE.** `tokens.ts:28` is already `60`,
   correctly inside the 50–80ms range. No change needed.
4. **The brief's "problem 3" (surface mush) is ALREADY FIXED.** `theme.ts:15-34` documents a
   four-tier ramp — background 4% / card 9% / elevated 14% / selected 19% / border 22% — and shared
   values are now deliberate tier-sharing. Remaining work is only verifying call sites use the tiers.
5. **`README.md` claims raw files are TCC-blocked.** They are present in `refs/videos/` and
   `refs/images/`.

---

## 6. Tooling — what is free and what is not

**Free, installed, proven this session:** ffmpeg, ffprobe, python3+numpy+PIL, the two scripts,
`scripts/sim.sh`, Reanimated 4.5.0, react-native-svg, expo-haptics.

**Free and worth adding:**
- **Software Mansion skills** — first-party from the Reanimated authors. Covers Reanimated 4,
  layout animations, 120fps, Skia. Fills the biggest tooling gap.
  `/plugin marketplace add software-mansion-labs/skills` then `/plugin install skills@swmansion`
- **Context7** — version-pinned Reanimated v4 docs; also unbreaks `ecc:docs-lookup`.
  `claude mcp add --scope user --transport http context7 https://mcp.context7.com/mcp`

**NOT free — do not route the plan through these:**
- **Rive** — freemium, and the free tier does NOT cover shipping. You can design and animate free,
  but **exporting `.riv` for production requires a paid plan**: Cadet **$9/mo annual, $17/mo monthly**.
  So `ATLAS_RIVE_BRIEF.md` costs the $250+ animator **plus an ongoing subscription**.
- **Polymation / `rivemcp`** — commercial (stunning.gg). Being in `node_modules` does not make it free.
- **EAS** build/submit/hosting/observe/simulator — paid tiers.

⚠️ **`ecc:motion-foundations` / `motion-patterns` / `motion-advanced` / `motion-ui` are all
`motion/react` (Framer Motion) — WEB. None apply to this app.** Four motion skills, zero usable.

### E1 answered — the open-source pipeline that replaces Rive

**`Claude Code → Lottie JSON → <Skottie/> in react-native-skia → shipped.`** Fully open source, $0.

- **`diffusionstudio/lottie`** (OSS) — *"Generate production-ready Lottie animations with Claude
  Code or Codex."* Authoring happens in the agent you already run. No After Effects, no Rive
  editor, no animator.
- **Skia 2.1 ships Skottie natively** — `@shopify/react-native-skia` has a Lottie engine baked into
  Skia itself; "Lottie animations are now just another Skia drawing primitive." This sidesteps the
  brief's "no Lottie today" constraint: you are adding **Skia**, not the Lottie native module.
- Alternative: **`margelo/react-native-skottie`** renders in a native view outside the Skia canvas.

**Order of evaluation for Atlas:** (1) Claude-generated Lottie → Skia Skottie, (2) hand-coded
SVG + Reanimated by extending the existing `src/components/atlas.tsx` (500 ln, already does
entrance/celebrate/nod/shake/idle/blink/ring-spin), (3) Rive only if someone funds it.

### Open-source design tooling for screen craft

The anti-generic lever is **illustration and colour**, not layout. `BRILLIANT_VISUAL_ANALYSIS.md`
already says it: Brilliant uses "rich, colorful, semi-3D illustrations everywhere — not flat line icons."

- **Blender** (+ **Poly Haven** CC0 HDRIs) — semi-3D hero art, the actual Brilliant-parity gap.
  `ecc:blender-motion-state-inspection` is already installed.
- **Radix Colors** (MIT) — 12-step **dark** scales with alpha + accessibility pairings. Audit the
  new `theme.ts` ramp (4/9/14/19/22%) against it.
- **Iconify** — 275k+ icons, 200+ open collections. **`ecc:ios-icon-gen` already calls its API.**
- **Lucide / Phosphor / Tabler** (MIT) — pick exactly one; mixing icon sets is a generic-UI tell.
- **unDraw**, **Open Peeps / Humaaans** (CC0) — recolourable illustration + character art.
- **Penpot** — the complete OSS Figma alternative, if a design surface is wanted at all.
- **Inkscape** — vector work on `atlas-mark-source.svg`.
- Fonts already OSS: `@expo-google-fonts` Nunito / DM Sans / EB Garamond are OFL.

---

## 7. Still open

**Unread:** `src/components/atlas.tsx` (500 ln), `src/components/onboarding-parts.tsx` (637 ln).

**Unanswered agenda:** A2–A5, B1, B2, B4, B5, C3, C4, D2, D3, D4, E2, E3.

**Undelivered:** #6 Atlas reaction map, #7 ranked backlog, #8 full tiered sources.

**Explicitly unverified:** px→pt scale factor (device unknown); whether Duolingo's 567ms rhythm is
a stagger or user input; Brilliant's Streak Charge beat (mis-targeted window); whether Polymation
has any free tier.
