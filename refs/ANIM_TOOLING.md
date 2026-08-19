# Animation + Verification Tooling Audit

Research session, 2026-08-19. Read-only. No installs performed, no simulator touched, no files
outside this one written.

Every version, date and peer range below came from a live `npm view` call or a fetched page on
2026-08-19. Anything I could not confirm is marked UNVERIFIED.

---

## 0. Stack of record

From `/Users/siddarthakodithyala/euphoria-native/package.json` (read directly).

| Package | Installed | Latest (`npm view <pkg> version time.modified`) | Latest published |
|---|---|---|---|
| `expo` | `~57.0.13` | — | — |
| `react` | `19.2.3` | — | — |
| `react-native` | `0.86.2` | — | — |
| `react-native-reanimated` | `4.5.1` | `4.5.3` | 2026-08-18 |
| `react-native-worklets` | `0.10.1` | `0.11.4` | 2026-08-18 |
| `react-native-svg` | `15.15.4` | `15.15.5` | 2026-05-20 |
| `@shopify/react-native-skia` | `2.6.2` | `2.11.0` | 2026-08-06 |
| `react-native-gesture-handler` | `~2.32.0` | — | — |
| `react-native-safe-area-context` | `~5.7.0` | `5.9.1` | 2026-08-18 |

Animation/testing-relevant devDependencies already present:
`odiff-bin ^4.5.0`, `sharp ^0.35.3`, `rivemcp ^1.8.3`, `svgo ^4.0.2`, `style-dictionary ^5.5.0`.

Facts that change the answers below:

- **No animation runtime is installed.** No `lottie-react-native`, no `rive-react-native`, no
  `@lottiefiles/*` in `package.json`.
- **Skia is installed and completely unused.** `grep -rl "react-native-skia" src/` returns 0 files.
  Reanimated appears in 37 files, `react-native-svg` in 41.
- **No test framework at all.** `grep -c jest package.json` = 0. No Storybook, no testing-library.
- The mascot today is `src/components/atlas.tsx` (27 KB): one `<Svg>` with Reanimated driving body
  spin, and pupils/whites drawn on top as separate animated props. 9 expressions, idle blink,
  spin-on-tap, `useReducedMotion` guard.

---

## 0b. HARD BLOCKER — stale native pin for a package that no longer exists

`ios/Podfile.lock` still contains:

```
- rive-react-native (9.8.5):
    - RiveRuntime (= 6.21.1)
  rive-react-native: 0fad980aaaff989d45befe808c33de7dbec3f135
  RiveRuntime: b762bd437b7de47d34d0f8e670112d0b9143f8d6
```

But `rive-react-native` is **absent from `package.json`, absent from `package-lock.json`, and
absent from `node_modules/`** (verified by grep on all three). The files `refs/ATLAS_RIVE_BRIEF.md`
claims exist — `src/components/atlas-rive.tsx` and `src/app/atlas-test.tsx` — **do not exist**.
Neither does `assets/atlas.riv`. The only survivors are stale build artifacts:
`dist/client/assets/assets/atlas.ee9fb4ed922c9107bf776ec28a2d91ee.riv` and
`dist/server/atlas-test.html`.

Read: Rive was installed, wired up, then reverted from the JS tree, and the native lockfile was
never reconciled. Consequence: the next `pod install` or `expo prebuild` will resolve
`rive-react-native` from a path that does not exist. `refs/ATLAS_RIVE_BRIEF.md` is stale and its
claim "a correct `.riv` drops in with no integration work" is **false as of today** — the
integration was deleted.

This is the other session's tree, so I changed nothing. Flag it before any native rebuild.

---

## 1. LOTTIE — is it the wrong tool here?

### 1a. Package status (all live `npm view`, 2026-08-19)

| Package | Version | Last publish | Peer deps | Verdict vs this stack |
|---|---|---|---|---|
| `lottie-react-native` | `7.4.0` | 2026-08-05 | `react >=19.2`, `react-native >=0.84`, `react-native-windows >=0.63.x`, `@lottiefiles/dotlottie-react ^0.13.5` | Compatible. react 19.2.3 satisfies `>=19.2`; RN 0.86.2 satisfies `>=0.84`. Note it now drags in a **web** package (`@lottiefiles/dotlottie-react`) as a peer. |
| `@lottiefiles/dotlottie-react-native` | `0.12.1` | 2026-08-04 | `react *`, `react-native *` | Compatible (wildcards). Still pre-1.0 after the state-machine launch. |

Both are actively maintained — publishes two weeks ago. Neither is abandoned. Nothing here rejects
Lottie on maintenance grounds, and I am not going to pretend otherwise.

New Architecture: `@lottiefiles/dotlottie-react-native` documents support for "both Paper and
Fabric" via a Legacy Interop bridge, is Expo-ready with a config plugin, iOS 15.4+
(https://github.com/LottieFiles/dotlottie-react-native). RN 0.86 is New-Arch-only, so the interop
bridge — not a native Fabric component — is the path. That is a real but not disqualifying caveat.

### 1b. Have state machines actually shipped?

**Yes. The owner's suspicion is wrong on this specific point.** State Machines launched in late 2025
and are natively supported in the dotLottie format and the official dotLottie SDKs on Web, iOS and
Android (https://lottiefiles.com/state-machines, https://www.lottie.community/c/announcements/state-machines-are-here).
`@lottiefiles/dotlottie-react-native` exposes `stateMachineLoad()`, `stateMachineStart()`,
`stateMachineFire()` plus transition/input callbacks. No "beta" or "coming soon" label on that page.

So "state machines aren't real yet" is not a valid reason to reject Lottie in 2026. The valid reason
is the next section.

### 1c. The architectural limit that decides it — additive blending

**Lottie cannot play a face animation independently of and simultaneously with a body animation.**

- Lottie does not support blending modes, luma mattes, or layer effects
  (https://www.elpassion.com/blog/lottie-who-common-mistakes-in-after-effects-animation-for-lottie).
- Independent runtime control of individual layers is a long-standing open request, not a feature
  (airbnb/lottie-web#2372).
- Loading multiple animations into one container fails — the first plays, subsequent ones do
  nothing (airbnb/lottie-web#2307, #2418).
- The workaround is *separate mounted player instances*, and on RN that costs: two Lottie views on
  one screen produced a 3-4 second lag while either alone was fine
  (lottie-react-native#867). That issue is old, but the architecture that caused it is unchanged.

A dotLottie state machine transitions **between** discrete states on one composition. It does not
**mix** two timelines. "Atlas is talking (mouth loop) while spinning (body loop) while blinking
(eye loop)" is three concurrent timelines with independent clocks. That is a modifier stack, and
Lottie has no concept of one.

### 1d. Performance picture on RN iOS

Honest answer: for a single, modestly-sized composition, Lottie on iOS is fine — it renders through
the native Lottie iOS runtime, off the JS thread. The cost is not per-frame math, it is (a) multiple
concurrent player instances, per #867, and (b) JSON/dotLottie parse and asset weight at mount. I
found no 2026 benchmark isolating `lottie-react-native` 7.x on RN 0.86 New Arch — **UNVERIFIED**;
I searched and only found the older multi-instance report.

### 1e. VERDICT ON LOTTIE — REJECT, but not for the stated reason

Reject. Reasons in priority order:

1. **No additive blending / no independent layer control.** Decisive. Atlas's whole design is
   "all acting happens in the pupils" while the body does something else. Lottie structurally
   cannot express that in one asset, and the multi-instance workaround is the exact thing that
   regressed in #867.
2. **It would replace working code with less capable code.** `src/components/atlas.tsx` already
   composes body spin + independent pupil expression + idle blink. Lottie is a downgrade in
   controllability here.
3. **New dependency, native rebuild, and a web peer dep** for zero new capability.

The style argument the owner started from is the weak one — Lottie renders whatever the designer
drew, so "doesn't fit our style" is a brief problem, not a tool problem. The architecture argument
is the one that actually holds. Same conclusion, better reason.

---

## 2. What to use instead

All rows from `npm view <pkg> version time.modified peerDependencies`, 2026-08-19.

| Tool | Version | Last publish | Peer compat vs this stack | Native rebuild? | Licence / cost | Modifier stack + additive layers? |
|---|---|---|---|---|---|---|
| **`react-native-reanimated` (installed)** | `4.5.1` (latest `4.5.3`) | 2026-08-18 | Exact fit. Peer `react-native 0.83 - 0.86` ✓ (0.86.2), `react-native-worklets 0.10.x - 0.11.x` ✓ (0.10.1) | No | MIT, free | Yes, in code. Independent shared values per layer = true concurrent, independently-clocked animation. No authoring tool. |
| **`@shopify/react-native-skia` (installed, unused)** | `2.6.2` (latest `2.11.0`) | 2026-08-06 | Peer `react >=19.0` ✓, `react-native >=0.78` ✓, `react-native-worklets >=0.7.0` ✓ (0.10.1), `react-native-reanimated >=4.0.0` ✓ (4.5.1) | Already built in | MIT, free | Yes, but you write the compositor. Right tool for shaders/particles/procedural, not character rigs. |
| **`rive-react-native`** | `9.8.5` | 2026-07-17 | Peer `react *`, `react-native *` — no constraint, so no conflict, but also no guarantee | **Yes** — RiveRuntime 6.21.1 pod + prebuild | Runtimes MIT (free, commercial OK); editor is subscription: Free / Cadet $9/mo / Voyager $32/mo / Enterprise $120/mo (https://rive.app/pricing) | **Yes — the only one with this natively.** State-machine **layers** mix additively; one layer for body motion, another for facial expression, playing simultaneously. Plus 1D and Direct **Blend States** and Blend Additives (https://help.rive.app/editor/state-machine/layers, https://rive.app/blog/create-rich-interactions-with-animation-mixing) |
| `@rive-app/react-native` (new Nitro runtime) | `0.4.19` | 2026-07-27 | Peer `react-native-nitro-modules >=0.35.10 <0.36` — **not installed**, would be a new native dep | Yes | MIT runtime | Same Rive features, but **pre-1.0**. Do not adopt yet. |
| `react-native-skottie` | `2.1.4` | **2024-05-06** | Peer `@shopify/react-native-skia >=1.0.0` — nominally satisfied by 2.6.2, but Skia's API changed across the v1→v2 boundary | Yes | — | **REJECT — ABANDONED.** Last publish 2024-05-06, i.e. **27 months ago** as of 2026-08-19. It is a Lottie renderer anyway, so it inherits every limit in §1c. |

### Ranking

1. **Stay on `react-native-reanimated` + `react-native-svg`** (both installed, both in heavy use).
   This is already an additive modifier stack: body transform and pupil props are separate animated
   values on separate clocks. Zero new dependencies, zero native rebuild, zero cost. It is the
   correct rung.
2. **`rive-react-native` 9.8.5** — the only option that buys something Reanimated genuinely cannot:
   a designer-authored rig with additive state-machine layers, editable without a code change.
   Adopt **only** if you are commissioning a real animator and want them to own the rig. Requires
   fixing the §0b Podfile blocker first, plus a prebuild, plus an editor subscription for whoever
   authors it. `rivemcp ^1.8.3` is already in devDependencies, so the authoring side is half-wired.
3. **Skia** — keep installed only if something will use it. Today nothing does. It is the right
   answer for procedural/shader effects (confetti, gradients, glow), the wrong answer for a
   character rig. If nothing needs it, it is dead weight in the bundle.
4. Lottie — rejected, §1e.
5. Skottie — abandoned, rejected.

**Top pick: keep Reanimated + SVG.** Rive is the only justified upgrade, and only on a real
animator brief.

---

## 3. Visual / live verification tooling

### 3a. What this repo already has — free, local, zero adoption cost

This is the buried lede. The verification stack largely exists.

| Asset | What it does | Cost |
|---|---|---|
| `scripts/sim.sh` | Drives and **inspects** the iOS simulator as text/numbers instead of images. Commands: `doctor`, `devices`, `screen` (on-screen labels + point coords), `tap`, `tapon "<label>"`, `state [jq]`, `open <deeplink>`, `shot <file>`, and **`motion "<text>" [s]` — taps an element then measures whether the mascot TRANSLATED**. | Free, local |
| `scripts/frame_diff.py` | Frame-differencing over a screenshot burst. Reports changed-pixel **count** per consecutive pair, not a boolean. Per-channel max rather than luminance — deliberately, because violet-on-near-black motion vanishes under an `L` conversion. Has a `--demo` self-check. | Free, local |
| `odiff-bin ^4.5.0` | SIMD pixel-by-pixel image comparison, "fastest image difference tool in the world". Binary present at `node_modules/.bin/odiff`, confirmed `odiff 4.5.0`. | Free, local, installed |
| `sharp ^0.35.3` | Image processing for capture post-processing. | Free, installed |
| `scripts/store-shots.mjs` | Reproducible screenshot compositing from device captures. | Free, local |

`sim.sh motion` is already frame-accurate motion measurement. `frame_diff.py` is already the
dropped-motion detector. `odiff` is already the golden-image differ. What is missing is only the
**golden-frame corpus** and a wiring into `npm run check` — which currently runs 16 regression
scripts and no visual check.

### 3b. Third-party options

| Tool | Version / status | Expo dev client + iOS sim? | Paid? | CI required? | Verdict |
|---|---|---|---|---|---|
| **Xcode Instruments / `xctrace`** (Animation Hitches template) | Ships with Xcode | Yes — attaches to the sim or device | Free | No | **GO.** The only credible source of real iOS hitch / dropped-frame numbers. Local, free, no account. (I did not run it — out of bounds this session.) |
| **Sherlo** (`@sherlo/react-native-storybook`) | `2.0.2`, 2026-08-05. Peers: `@storybook/react-native >=8.0.0`, `react *`, `react-native >=0.74.0`, `react-native-safe-area-context *` | Yes, via Storybook RN | Free plan exists; paid tiers above it | Yes, cloud-run | **CONDITIONAL — see blocker below.** |
| ↳ **`@storybook/react-native` (the dependency Sherlo needs)** | `10.5.4`, 2026-07-27 | — | Free | — | **PEER CONFLICT.** Peers: `react-native-reanimated: '4.5.1'` (exact — project matches ✓), `@gorhom/bottom-sheet >=4` ✓, **`react-native-safe-area-context: '5.8.0'` (exact) vs project `~5.7.0` ✗**. Expo 57 pins 5.7.0, so satisfying Storybook fights `expo install --check`. Resolvable, not free. |
| `react-native-owl` | `1.5.0`, 2026-07-20 | — | Free, OSS | No | **REJECT.** Peer `react: '^17 \|\| ^18'` vs project **react 19.2.3**. Specific conflicting range, hard fail. Maintained but two majors behind on React. |
| `jest-image-snapshot` | `6.5.2`, 2026-03-09. Peer `jest >=20 <31` | Only inside a Jest run | Free | No | **NO-GO for now.** Project has **no Jest at all**. Adopting means standing up a whole test runner to duplicate what `odiff` already does. |
| `reassure` | `1.6.0`, 2026-07-22. No peer deps declared | Node-side, no sim | Free | Optional | Performance *regression* testing for render counts/timing. Useful later, orthogonal to "does the animation look good". |
| `pixelmatch` | `7.2.0`, 2026-04-29 | N/A | Free | No | Redundant — `odiff-bin` is installed and faster. |
| **Flashlight** (bamlab) | npm `flashlight@0.0.2` is a **2022 squat**, not the real tool. `@perf-profiler/flashlight` → **404 Not Found**. | — | — | — | **REJECT.** The real Flashlight is **Android-only**; iOS support is "in the works" (https://github.com/bamlab/flashlight). Useless for an iOS-first app. |
| Maestro | npm `maestro-cli@1.1.10` is a **2022 unrelated package**. Real Maestro installs via curl, not npm. | Likely yes | Free tier | No | **UNVERIFIED** — I did not confirm the real Maestro's current version or Expo 57 compatibility. Would need a fetch of maestro.mobile.dev. |
| Chromatic / Percy / Applitools / Emerge Tools | Not queried individually | Cloud | **All paid** for meaningful volume; all require CI and uploading builds/screenshots to a third party | Yes | **NO-GO at this stage.** Cost and CI overhead for a solo iOS-first app that already owns a local differ. |

---

## 4. Ranked, costed recommendation

| # | Tool | What it buys | Effort | Cost | GO / NO-GO |
|---|---|---|---|---|---|
| 1 | **Keep Reanimated + `react-native-svg`** (installed) | Additive modifier stack already working in `atlas.tsx`; independent body/pupil/blink clocks | Zero | Free | **GO** |
| 2 | **Golden frames via existing `odiff` + `sim.sh shot`** | Real visual regression. Capture N canonical frames, diff on change, wire into `npm run check` | ~1 session | Free (installed) | **GO** |
| 3 | **`scripts/frame_diff.py` on a capture burst** | Objective "did it actually move / did reduced-motion actually stop it". Already written and self-tested | Zero | Free | **GO — already built, just use it** |
| 4 | **Xcode Instruments Animation Hitches** | The only true iOS dropped-frame/hitch numbers | ~half session | Free | **GO** |
| 5 | **Fix `ios/Podfile.lock`** (§0b) | Removes a stale pin to a deleted package before it breaks the next prebuild | ~15 min | Free | **GO — do this first** |
| 6 | `rive-react-native` 9.8.5 | Designer-authored rig, additive state-machine layers, no code change to retune | High: prebuild + native pod + asset commission + reconcile §0b | Runtime MIT free; editor from $9/mo; animator quoted **from $250** in `refs/ATLAS_RIVE_BRIEF.md` | **CONDITIONAL GO** — only with a funded animator brief |
| 7 | Sherlo + Storybook RN | Multi-device/theme screenshot matrix without E2E replay | Medium-high: add Storybook, resolve safe-area-context pin, write stories | Free tier, then paid | **CONDITIONAL** — blocked on `react-native-safe-area-context` 5.7.0 vs required exact `5.8.0` |
| 8 | Skia 2.6.2 (installed, unused) | Procedural/shader effects | — | Free | **HOLD** — either use it or drop it; currently 0 imports |
| 9 | `lottie-react-native` / dotLottie | — | — | — | **NO-GO** — no additive blending (§1c) |
| 10 | `react-native-skottie` | — | — | — | **NO-GO** — abandoned, last publish 2024-05-06 (27 months) |
| 11 | `react-native-owl` | — | — | — | **NO-GO** — peer `react ^17 \|\| ^18` vs react 19.2.3 |
| 12 | Flashlight | — | — | — | **NO-GO** — Android-only; npm names 404 or squatted |
| 13 | `jest-image-snapshot` | — | — | — | **NO-GO** — no Jest in project; duplicates `odiff` |
| 14 | Chromatic / Percy / Applitools / Emerge | — | — | Paid + CI | **NO-GO** at this stage |

---

## Unverified / not checked

- No isolated 2026 benchmark for `lottie-react-native` 7.x on RN 0.86 New Architecture.
- Real Maestro (maestro.mobile.dev) current version and Expo 57 compatibility — npm `maestro-cli` is
  an unrelated 2022 package.
- Emerge Tools, Percy, Applitools, Chromatic: not individually version-checked; excluded on the
  structural grounds of cost + mandatory CI, not on staleness.
- Whether `@storybook/react-native`'s exact `react-native-safe-area-context@5.8.0` peer is a hard
  install failure or an npm warning under this lockfile — not tested (no installs permitted).

---

# ADDENDUM — 2026-08-19, second pass

Resolves two items the first pass left UNVERIFIED, and rejects three more candidates. Every
version and date below is from a live `npm view` on 2026-08-19.

## Moti — REJECT, with a date

| | |
|---|---|
| version | `0.30.0` |
| last publish | **2025-01-29** |
| peer | `react-native-reanimated: '*'` — no constraint, so npm will never warn |

**`react-native-reanimated@4.0.0` shipped 2025-07-23.** Moti's last release predates it by six
months. Moti has therefore never shipped a version that has seen Reanimated 4, which is the
major that extracted worklets into the separate `react-native-worklets` package this project
depends on (`0.10.1`). The wildcard peer means this fails silently rather than loudly.

Every 2026 listicle still recommends Moti as *the* declarative wrapper. The recommendation is
19 months stale. **Do not adopt.**

## @legendapp/motion — REJECT

`2.5.3`, last publish 2025-10-17. Peer requires **`nativewind >= 4.0.0`**, which is not
installed. Adopting it means adopting a whole styling system to get an animation wrapper.

## MotionSpec (MCP) — REJECT

Top hit on mcpmarket.com for "mobile app animations", and it sounds ideal: "verifies and
compiles reduced-motion-safe, on-budget UI animation." It is **web-only**. It compiles to GSAP
and the Web Animations API/CSS, and its audit tool "scans web page HTML and stylesheets."
React Native has no DOM, no CSS and no WAAPI. Mobile-sounding SEO on a web tool.

## Maestro — RESOLVED, and it is ALREADY INSTALLED

First pass marked this UNVERIFIED because npm `maestro-cli@1.1.10` is an unrelated 2022 package.
Confirmed: that npm name is a squat, and the real tool installs via curl.

**The real Maestro is on this machine: `2.6.0` at `~/.maestro/bin/maestro`.**

This matters for the audit's Phase B. Maestro suppresses animations and timers by default and
records video, so it is a stronger lesson driver than a hand-rolled `idb` tap loop — which has
already stalled once this session on a quiz step that will not advance until an option is
selected. Worth evaluating against the 9 lesson step kinds before writing more driver code.

## Standing conclusion, unchanged

`react-native-reanimated` (4.5.1, latest 4.5.3 published 2026-07-22) plus `react-native-svg` is
still the correct stack. The notable finding of this pass is that **the popular alternatives are
all staler than what is already installed** — Reanimated ships actively; its wrappers do not.
