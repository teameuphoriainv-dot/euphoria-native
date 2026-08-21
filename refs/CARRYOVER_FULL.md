# EUPHORIA ANIMATION AUDIT — FULL CARRYOVER

**Paste this entire file as the opening prompt of a fresh session.** It is written to be
self-sufficient. Nothing in it should need re-deriving, and several of its lessons cost hours to
learn. Repo: `~/euphoria-native`. React Native 0.86.2 / React 19.2.3 / Expo ~57.0.13 /
react-native-reanimated 4.5.1 / react-native-worklets 0.10.1 / react-native-svg.

---

# PART 0 — WHY THIS AUDIT EXISTS

The owner's words, verbatim:

> *"Every single time I give you a prompt for fixing the animation, it either just stays the same
> or gets worse. I need you to understand how the level of animations is right now. That's why
> I'm making you do an entire audit."*

> *"Make sure the animation bugs are fixed, especially whenever I drag something, it doesn't move
> all over the place and stuff like that. Whenever I click on something, it doesn't become huge
> and become small. Don't make those animations. You need to fix all of that stuff. Understand
> everything from the recording. Do a deep end review, and then start fixing everything one by
> one."*

> *"I do not care about how long it takes. I do not care about the session cost or the session
> context."*

> *"Before sending, verify 3 times before sending anything and make sure everything you are
> sending is factual information only."*

**Two defects were reported. Their outcomes differ, and that difference is the most important
thing in this document:**

| reported defect | outcome |
|---|---|
| **"click something and it becomes huge then small"** | **SOLVED and measured on device** |
| **"drag something and it moves all over the place"** | **five fixes shipped to code the app never renders**, then a much better candidate found |

## THE ONE PATTERN THAT GOVERNS EVERYTHING HERE

**In this codebase, a failed measurement does not error. It returns a clean, plausible, quotable
number.**

Deep links silently no-op. Stale screens report success. A driver keyed on the wrong role drives
zero steps and reports success. h264 compression looks exactly like jank. A guessed region yields
internally consistent nonsense. A metric that divides by an interval passes perfectly when the
displacement is zero.

**Seventeen claims in this audit were retracted after being written up. Two were regressions the
audit itself introduced.** That is not the audit failing — it is the audit working. Retract in
writing, with the reason, and keep the retraction.

**Every finding must be confound-tested before it is reported.** Not after.

---

# PART 1 — BINDING LESSONS (do not relearn these)

## 1.1 Measurement regions

**Take every measurement region from the ACCESSIBILITY TREE, then DRAW THE BOX ON A SCREENSHOT
AND LOOK AT IT.** A label match is a *hypothesis* about which element you have, not a fact.

Three times this audit produced a plausible-but-wrong region, and every one was caught only by
rendering the rectangle:

1. **A guessed rectangle** ~200pt above Atlas produced the audit's single biggest false finding
   ("Atlas is under-animated"). It survived **four analyses** because all four inherited the same
   bad input. **Agreement between analyses that share an input is not corroboration.**
2. **A centre-anchored box.** Derived correctly from the prompt's a11y frame, then centred on it —
   but the prompt is a four-line 128pt block and Atlas is top-aligned to its first line, so the
   box sat ~30pt low over empty space.
3. **A label matching the wrong node.** Searching `'incorrect'` for the lesson feedback sheet
   matched an OPTION ROW whose own label is `"25. Incorrect."` — 290pt from the sheet.

**Corollaries:** prefer the element's own copy over a generic word other nodes may share;
disambiguate by position when several match; anchor on the edge that actually aligns, not a centre.

## 1.2 Capture

- **`idb video-stream --fps 60`** measures ~48fps real. **NEVER `simctl io recordVideo`** — it is
  fixed **15 fps**, giving ~4 samples across a 280ms spring, which cannot separate a clean settle
  from an overshoot. Extracting a 15fps file at 30fps duplicates frames; that duplication was once
  misread as *the app rendering at 15fps*. **Check the container before blaming the app.**
- **Gotcha:** adding `--scale-factor` makes `video-stream` write a **zero-byte file and exit 0**.
- **`--compression-quality 1.0`** for per-element pixel work. At default quality, inter-frame
  reconstruction drops a region for runs of ~3 frames — measured 8 such runs in 132 frames — and
  an element's pixel overlap collapses to 0.08 and recovers, indistinguishable from it leaving and
  returning. Raised quality costs frames, because the stream is **bandwidth-limited near 100 KB/s**
  (measured: 90–113 KB/s across three takes while bytes-per-frame varied 1.6–11.5).
- **`capture.record(path, secs, quality=, during=)`** — `during` fires AFTER the stream is warm.
  `record()` spends its first **1.2s** warming up. A tap fired on a separate thread at 0.5s landed
  *during* warmup, so the transition finished before frame 0 and the overlap compared the NEXT
  element against itself — a flat 1.00 reported as "persists". **Use `during=`.**
- **Always call `real_rate()`. Never assume fps.**

## 1.3 What the capture path CANNOT do

- **Scroll frame rate.** Bytes/second is constant while bytes/frame varies 6×, so during a
  full-screen scroll the stream delivers ~9fps and reports the RECORDER's rate, not the app's.
  Confirmed independently: `courses` scrolled at 35.8fps not because it is lighter but because its
  short list stops moving after ~10 frames, while `digest` sustains 40–64% changed pixels
  throughout. **Frame rate tracks the DURATION of full-screen motion, not content weight.**
- **Visual-quality judgements without a lossless capture.** h264 ghosting looks exactly like jank.
  The tell: in a compressed frame the tab bar and status bar stay perfectly sharp while only the
  changing region is blocky with hard macroblock edges. A real rendering fault would not respect
  that boundary.
- **Scroll POSITION from the accessibility tree.** a11y frames are **content-space**: home's course
  cards read x = 16, 160, 304 … 1600, past the 402pt screen width, and are identical before and
  after a flick.

## 1.4 Sampling

- **Any mean across a repeating animation needs at least TWO FULL CYCLES.** `ROCK_MS = 3900` with
  `withRepeat(..., -1, true)` is a **7.8s** cycle; a 5s capture covered 64% of one and its mean
  carried a **~+4.7° un-averaged offset**, which read as a tilt mismatch when it was a
  window-length error.
- **Any "on-grid" or ratio test must first assert that something MOVED.** A displacement of zero
  divided by any interval passes perfectly. That printed `VERDICT: SNAPPED` on a rail that had not
  scrolled at all.
- **A state change needs a SUSTAINED run.** Requiring 3 consecutive frames is what separates a
  transition from a compression artifact — and note that the artifact runs were themselves ~3
  frames, so 3 was the minimum that worked and is not generous.

## 1.5 The accessibility tree

- **`idb ui describe-all` emits `"AXLabel":"` with no space after the colon.** Parse the JSON;
  string-splitting produced a false "0 labels" reading.
- **ROLE IS UNSTABLE.** The same control reports `AXButton`, `AXGenericElement` and `AXImage`
  across runs. **Key on content or `AXValue`, never role.** A driver keyed on `AXButton` drove
  **0 steps**, filmed static intros, and reported success.
- Checkbox state arrives as **`AXValue: 'checkbox, checked'`**, not as a role.
- **Atlas has NO a11y label when `interactive={false}`** — the label lives only on the Pressable
  branch. That is correct product behaviour (a decorative mascot should not be announced), so
  derive its region from a labelled SIBLING instead of "fixing" the app to suit the tooling.

## 1.6 Navigation

- **Deep links silently no-op on pushed screens.** `openurl` returns success and nothing changes.
  A whole route audit was retracted because only **9 of 23** routes actually navigated while all 23
  were scored.
- **VERIFY BY CONTENT, NOT BY CHANGE.** A "did the labels differ" test reports failure precisely
  when navigation was unnecessary — the app already launches on home. Assert the expected content
  is PRESENT.
- **`goto_lesson` once returned True on the failure screen.** Its check was
  `if 'lesson' in labs` — and the failure text is *"That lesson isn't available."*, which contains
  the word "lesson". **Check the negative before the positive.**
- **Route ids are kebab-case** (`personal-finance`); the answers JSON is **camelCase**
  (`personalFinance`). Conversion now lives inside `goto_lesson` so no caller can bypass it.
- **An edit can drop the app to the Expo dev-client launcher**, which reads as a valid screen with
  a handful of labels (`DEVELOPMENT SERVERS`, `Development Build`). Check `drive.at_launcher()`
  after navigating, not only at startup.

## 1.7 Cross-session hazards

- **Expo Fast Refresh corrupts captures.** Another process editing a watched file reloads the app
  mid-take behind a full-screen blue overlay; the mascot vanishes and a centroid series reads as a
  violent oscillation. Detect it: fraction of pixels with `b>150 and r<120 and b>g+40`, void above
  15%. **The red bound matters** — Euphoria's violet is `r=184`, and without it a clean take reads
  as 8.4% contaminated.
- **A shared working directory breaks `npm run check` on main.** A stale `package.json` from
  another session reinstated a call to a deleted script. **A green local tree says nothing about
  main.** Verify with `git show origin/main:package.json` and confirm every referenced script
  exists — that costs nothing and disturbs no one.

## 1.8 Image differencing

**Per-channel max. NEVER `.convert('L')`.** Luminance weights blue at 0.114, so a blue-only shift
of +20 scores as 2 on this violet-on-near-black palette and vanishes. Every diff script here has a
blue-only fixture in its self-check.

## 1.9 The simulator is the OWNER'S SCREEN

Restore any setting you change **in the same bash call**, and verify the restore. **Known-dead
lane:** writing `ReduceMotionEnabled` to the sim plist does NOT reach the app process — verified
across a full reboot with the app instrumented. Use `scripts/reduced_motion_audit.py` instead.

**Do not change entitlement state.** The account is on an active free trial; ending it would make
the four sheets reachable but is not safely restorable.

---

# PART 2 — THE MEASURED STANDARD

`refs/MOTION_RUBRIC.md`. Derived from `refs/videos/*.mov` — three recordings (108s + 122s + 268s,
all genuinely 30fps) → **14,974 frames → 330 motion windows → 307 discrete transitions**.

**Provenance correction:** an early note claimed "no Duolingo video exists on this machine." Wrong.
`ScreenRecording_07-21-2026 14-17-49_1.mov` (ref3, 268s, 8,047 frames — the largest, and 198 of the
330 windows) **is** Duolingo. The error came from judging a file by its generic name instead of
opening it. **Look at the artifact; do not infer from its name.**

## R1 — Duration (n = 307)

| min | p10 | p25 | **median** | p75 | p90 | max |
|---|---|---|---|---|---|---|
| 0.10s | 0.13s | 0.27s | **0.40s** | 0.67s | 1.20s | 1.97s |

**Rule:** a discrete transition belongs in **0.27–0.67s**. Outside 0.13–1.20s needs a stated reason.

Euphoria's own `step-transition.ts` — EXIT 150 + GAP 90 + HEADLINE 280 + ATLAS_LEAD 150 ≈ **670ms**
— lands exactly at p75. **KEEP.**

## R2 — Settle

Single-peak rate by band: **<0.25s 87.8%** · 0.25–0.40s 50.7% · 0.40–0.60s 50.0% · 0.60–1.00s
21.3% · 1.00–2.00s 10.8%. Of 124 transitions under 0.35s, **73% are single-peak**.

**Rule:** **bounce is a deliberate per-element choice, never a library default.** An overshoot
inherited from `springify()` FAILS R2; the same overshoot chosen and commented for one element
PASSES. This distinction decides most verdicts in this audit.

## R3 — Long multi-peak windows are STAGGER, not bounce

Peak count tracks duration almost perfectly (1-peak median 0.30s → 8-peak median 1.37s). **Check
whether a multi-peak window is stagger (correct) before treating it as overshoot (defect).**

## R4 — Scale origin: **CLOSED**

Measured on both sides.

- **Reference** (ref3, Duo entering, frames 381–394): box width holds **63–83px** across every
  frame of motion while x sweeps **102 → 21**. It TRANSLATES at constant size.
- **Euphoria** (onboarding headline, per-element instrument): width **272.3–275.4pt**,
  ratio **0.99**, reproduced across **three** captures.

**Rule:** an element enters by MOVING, not growing. A width ratio below ~0.85 across a transition
means something is scaling up and needs a stated per-element reason. `ZoomIn`-from-scale-0 has no
counterpart in the reference footage. **This is what condemned `tap-reveal`'s original `ZoomIn`**
(scale 0 → 1, text rasterised near zero and resampled up — the owner's reported "pixel mess").

Robustness note: use **p10..p90 of widths, not min/max**. One dropped frame reported 69pt on a
279pt element and turned a stationary headline into "GROWS from small".

## R5 — Exit behaviour: shape established, duration NOT

The onboarding headline holds a 0.93–1.00 overlap plateau, then goes sustainedly absent. **A fade,
not a hard cut.** But two clean captures gave **135ms and 62ms** against `step-transition.ts`'s
150ms `EXIT`. **Quote the shape, not the milliseconds.**

Stays OPEN as a reference-derived rule: a video has no accessibility tree, so the reference side
cannot be measured this way. What is closed is Euphoria's conformance to its own constant.

## R6 — Easing shape: **OPEN after seven documented failures**

Every approach and why it failed, so none is repeated:

| # | approach | cause of failure |
|---|---|---|
| 1 | thresholded pixel overlap | **wrong by construction** — gating at brightness 200 means text registers only past ~78% opacity, so every ramp reads ease-in |
| 2 | mean luminance of the element box | correct in principle; region never nears its floor with `AmbientBackground` behind and outgoing text overlapping |
| 3 | position, crop padded 140pt above | swept in option rows, which **recolour on Check** |
| 4 | position, element by label `'incorrect'` | matched an **option row**, 290pt from the sheet |
| 5 | position, changed-region top edge | a frame diff during a slide covers **both** old and new positions |
| 6 | position, colour segmentation | caught the violet **footer button** at y=760; raising the corridor then caught option borders |
| 7 | **instrument the app** — `useFrameCallback` sampling the driving shared value into a preallocated buffer on the UI-runtime `globalThis`, flushed once | **the sampler itself runs at ~13fps.** Not photography this time, and not the O(n²) first draft either: after replacing a per-frame array spread with an O(1) indexed write, the rate did not change. The control settles it — hold the window open for 2.5s and compare intervals during the mount against after it settles: **11fps then 13fps, coarse THROUGHOUT.** A sampler that coarse feeds the spring integrator ~78ms steps, and it reported a curve rising to 1.368 and falling back through 1.0 to 0.879, which ζ=0.607 cannot do at all |

**Structural cause:** the lesson screen is violet nearly everywhere, and the feedback panel's
corridor is bounded by options above and the button below. **No region heuristic isolates it.**

**What the source says the answer is:** `lesson-feedback.tsx:104` runs
`withSpring(1, { stiffness: 220, damping: 18 })` on `translateY: (1 - t) * 190`. ζ = **0.607**,
overshoot **9.1%** (17.3pt of 190), peak at **266ms**, 2% settle at **460ms**. The author's own
comment states the intent: *"slightly underdamped so the bar overshoots a few pixels and settles:
it should feel thrown into place, not slid."*

**RETRACTED (#20): the "36.8% overshoot, peak 417ms, settle 911ms" that attempt 7 produced.**
Every one of those numbers is an artifact of a 13fps sampler, reproduced across three device runs
(36.8% / 36.4% / 36.8%) which is what made it look trustworthy. **Reproducibility is not validity —
a stable bias repeats perfectly.** It is arithmetically impossible besides: ζ=0.607 caps overshoot
at 9.1%, so t could never reach 1.368. The instrument was reverted rather than left in the tree;
`__DEV__`-gated or not, it dragged the banner to 13fps in development.

**What attempt 7 still bought:** the failure is now *diagnosed* rather than merely observed, which
none of the six before it managed. The bottleneck is the per-frame sampler, not the strategy —
reading the driving value is still the right idea. **Next attempt should not sample per frame at
all.** Either drive the spring with a known input and record only the values Reanimated itself
reports at its own callback boundaries, or step it offline against the same `withSpring` maths and
verify only the endpoints on device. The control that proved this — hold the sampling window past
the animation and compare early intervals against late ones — is cheap and should run FIRST in any
future attempt, before a single number is quoted. `scripts/anim/r6_probe.py` keeps it.

## R7 — Idle mascot liveness

Duolingo ref3, frames 400–900: **81% of frames** show motion in the mascot box; mean changed region
**54% × 48%** of its own box.

Euphoria's Atlas, re-measured like-for-like on its **real** a11y frame: **99% of frames, 87% × 88%**.
**Atlas is MORE animated than the reference.** (See retraction #1 — the opposite was reported first,
from a guessed rectangle.)

## Motion tokens — every fix lands on one, never a fresh magic number

`src/shared/motion/tokens.ts`:

| token | ζ | overshoot |
|---|---|---|
| `Spring.press` | 0.99 | 0% — **and it is used 0 times**; `SpringPressable` uses `snappy` |
| `Spring.snappy` | 0.84 | 0.8% |
| `Spring.smooth` | 0.99 | 0% |
| `Spring.gentle` | 0.97 | 0% |
| `Spring.bouncy` | 0.72 | **4.0%** |
| `Spring.reward` | 0.56 | **12.1%** |

`Duration`: instant 100 · fast 150 · base 280 · exit · slow 400 · screen 460 · count · earned 3200.
`Ease.out = bezier(0.16, 1, 0.3, 1)` (midpoint progress **0.972**) · `Ease.enter`, `exitCurve`,
`inOut`, `outCubic`. `STAGGER_GAP = 60`, `STAGGER_CAP = 360`.

---

# PART 3 — WHAT WAS FIXED (and what each fix is actually worth)

## 3.1 The click-pop — SOLVED, measured

`onboarding-parts.tsx` ran, on option select:

```js
pop.set(withSequence(withSpring(1.035, Spring.bouncy), withSpring(1, Spring.smooth)));
```

1.035 plus `bouncy`'s ζ=0.72 overshoot reached **~1.076**, then shrank. It was also **redundant** —
`fill` and the border already animate to show selection — so it carried no information.

**Removed. Verified on device from the a11y box with 18pt padding so growth would be visible:
peak 355.7pt against a resting 354pt.** The old pop would have reached ~381pt.

Press feedback still works: `SpringPressable` scales **0.97 INWARD** under the finger, the opposite
gesture.

**Every other click-pop candidate was checked and cleared:**
- `SpringPressable` (on every button and card) uses `Spring.snappy` for press AND release; its 0.8%
  overshoot applies to a 0.03 delta, peaking at scale **1.0002**. Invisible.
- `Spring.bouncy` has **one live use left**: `onboarding-parts:242`, driving `r: 5.5 * fill` on the
  selection dot. ζ=0.72 → the dot reaches 5.72pt before settling at 5.5 — a **0.22pt** overshoot.
  **Deliberately left alone:** this audit's own headline established 1–3% amplitudes sit below the
  visibility floor, and removing it would flatten character for no perceptual gain.

## 3.2 The drag — five correct fixes to DORMANT code, then a better candidate

**All five drag fixes are to components the app never renders.** State this plainly; do not let a
list of fixes imply the defect was found.

| fix | what it was |
|---|---|
| `slider-predict` | `runOnJS` **twice per frame** — ~120 JS round-trips/sec, each re-rendering. Geometry was always correct; the READOUT saturated the thread |
| `before-after-slider` | `Haptics.selectionAsync()` on **every `onResponderMove`** — ~60 native haptic calls/sec |
| `graph-point-drag` | same 60Hz haptic misuse |
| `before-after-slider` | full re-render per move event to move a thumb |
| `graph-point-drag` | full re-render per move + SVG polyline and N `<Circle>`s rebuilt ~60×/sec for output that never changes |

The haptic one is an **API misuse**, not just volume: `selectionAsync` is Apple's
selection-*changed* feedback, built to tick once per detent like a picker wheel. Quantised to 24
detents.

The re-render fix is worth understanding: **a shared value can be WRITTEN FROM THE JS THREAD**, so
the thumb moves on the UI thread with the **gesture system completely unchanged**. Converting to
`Gesture.Pan` is the textbook fix but a Pan inside a scrolling container can steal the scroll —
this gets the same result with none of that risk. React still receives the value, throttled to 1%,
with `onResponderRelease` committing the exact final position.

### THE ACTUAL FINDING: the draggable components are dead code

| component | rendered |
|---|---|
| `SliderPredict`, `BeforeAfterSlider`, `GraphPointDrag`, `SortBuckets` | **nowhere** |
| `MatchingPairs`, `NumberLine`, `TileBuilder`, `OrderSteps`, `MultiSelect`, `TapReveal` | `lesson.tsx` |

**Verified two independent ways.** JSX scan finds no `<SliderPredict`; import scan finds **no
importers at all**, not even type imports — while every live component has exactly two (component
→ `lesson.tsx`, spec type → `lesson-steps.ts`). That missing spec-type import is itself
corroboration: the normalizer never produces `SliderSpec`.

**They are not an oversight — they are SUPERSEDED.** Every drag concept was reimplemented as a tap:

| curriculum type | steps | renders as |
|---|---|---|
| `dragSort` / `sorting` | 231 | `OrderSteps` — hint: *"Tap two rows to swap them."* |
| `slider` | 198 | `NumberLine` — tap-stepped |
| `interactiveGraph` | 290 | **prose** — *"the chart itself is a later cycle"* |

**2,509 steps render interactively; only 290 (5.4% of 5,341) are authored interactive and shown as
text.** So **there is no drag gesture anywhere in the shipping app.**

### The better candidate: every horizontal carousel free-scrolled

All **six** horizontal `ScrollView`s had no `pagingEnabled`, no `snapToInterval`, and the default
`decelerationRate`. A rail with no snapping comes to rest **wherever momentum happens to die**,
leaving cards halfway off the edge at arbitrary offsets. **A horizontal card rail is the one thing
in this app a user would call "dragging something".**

**Fixed two, deliberately:**
- `news-gallery.tsx` — `CARD_W 236` + `Spacing.two 8` = **244**
- `home.tsx` course rail — `RAIL_CARD_WIDTH 132` + `Spacing.two + 4` = **144**, imported rather than
  written as a literal so the interval cannot drift from the card width

**Left four alone:** `digest:313`, `learn:234`, `courses:88`, `options:495` are all chip rails
(verified: `styles.chipRow`/`chipScroll`, variable-width text chips). Snapping variable-width chips
would feel worse.

**NOT VERIFIED.** The a11y tree reports content-space coordinates so it cannot measure scroll
offset, and the capture path cannot measure scroll. **This is the single highest-value thing for
the next session to confirm** — a screenshot pair around a flick, comparing a card edge's pixel
offset, or ten seconds of the owner's thumb.

## 3.3 Everything else fixed

| # | fix |
|---|---|
| 1 | **`reward-pop`** — `{stiffness:500, damping:18}` (ζ=0.40, ~25% overshoot) → `Spring.reward` (ζ=0.55). Bounce KEPT: a reward chip should pop; R2 only requires it be deliberate |
| 2 | **Two permanently frozen mascots** — `start.tsx` (92pt hero) and `term-match` (96pt) never passed `idle`, and `atlas.tsx:316` zeroes breath/sway/rock without it. Resting motion was zero **by construction**; no measurement needed |
| 3 | **Article logo hard cut** — `ticker-logo` had `opacity: loaded ? 1 : 0` on a PLAIN style and zero animation in the whole file; `news-gallery`'s `<Image>` had no `onLoad` at all. Both now cross-fade over `Duration.base`. **Measured: 286ms against 280ms intended.** Since each logo decodes whenever the network returns it, a row of tickers previously popped in at unrelated moments |
| 4 | **Sheet backdrops slid instead of fading** ×4 — `<Modal animationType="slide">` animates the NATIVE host (`Modal.js:333` passes it to `RCTModalHostView` with children inside), so `absoluteFill` blur and scrim travelled with the sheet, sweeping the dimming upward like a curtain. Shared `useSheetEntrance` hook: backdrop fades on a timing curve, sheet springs. **Plain shared values, not `entering={}`** — Reanimated layout animations are unreliable inside a native Modal host, and a fix that silently produced NO animation would be worse than the wrong one |
| 5 | **`matching-pairs` had zero animation** — 132 lines, no `Animated`, no `layout`, no `entering`, while sibling step kinds animate. The tick appeared on ONE frame. Now the check icon fades over `Duration.fast` and a `MatchCell` animates the border across 3 stages |
| 6 | **`graph-point-drag` solve was a cut** — `fill={solved ? success : primary}` flipped on one frame. Now `useAnimatedProps` + `interpolateColor` over `Duration.base`, following the pattern `atlas.tsx` already uses six times for SVG |
| 7 | **A dead animation** — `atlas.tsx` set a `rotation` shared value on every tap that **nothing ever read**; `ringSpin` is what turns the rings. Removed |
| 8 | **Entry choreography** — `search`, `friends`, `why-not-free` had NO entrance at all. Added `RiseIn` stagger. search 0.11s/1pk → 1.08s/13pk |
| 9 | **Digest masthead** — one `RiseIn` split into four staggered siblings. 0.07s/147k-px slam → 0.26s |
| 10 | **`tap-reveal`** — was `ZoomIn.springify().damping(16)`: ζ=0.8 inherited, scale-from-0, hard-cut exit. Now cross-fades both mounted faces, whichever shows sits in flow |

## 3.4 The regression floor

`npm run check` ran **16 regression scripts and not one looked at motion.** Now it also runs:

- **`scripts/motion-invariants.mjs`** — 7 rules across 174 files. Selftest seeds **7 regressions and
  7 harmless edits**. Rules: no scale-pop on ordinary interaction · no per-frame `runOnJS` in a
  gesture · nothing enters by growing from zero · index-multiplied delays are capped · springs set
  their own stiffness · inline springs are justified in a comment · infinite repeats are
  reduced-motion guarded.
- **`scripts/reduced_motion_audit.py`** — 32 files, `--selftest` asserts 4 defect shapes caught and
  3 static shapes ignored, so its **0 is a proven zero**. VESTIBULAR patterns need `\s*` INSIDE the
  negative lookahead; outside, the engine backtracks and static transforms false-positive.

**Rule 1 — "no scale-pop on ordinary interaction" — is the rule that protects the owner's first
report.** It rejected a scale on `matching-pairs` mid-audit, which is the floor doing its job.

---

# PART 4 — THE TOOLING

## 4.1 Device facts

- UDID `755B55D9-8E4B-431C-9D1D-A635F38CFF5F` (iPhone 17 Pro, iOS 26.5)
- Bundle `com.euphoriainv.euphoria`, scheme `euphorianative`
- Screen 402pt wide; screenshots are 1206px → **scale factor `sx = im.width / 402.0`**
- Deep link `euphorianative://lesson?course=<kebab-id>&num=<n>`, plus the routes in `routes.sh`
- **The account is on an ACTIVE FREE TRIAL**, which grants Pro. Consequence: no gate fires, so
  `GateSheet`, `DismissalOfferSheet` and `TrialRewardSheet` are all unreachable

## 4.2 `scripts/anim/` — every module carries `assert` self-checks

| module | what it does |
|---|---|
| `capture.py` | `record(path, secs, fps=60, during=None, quality=None)` and `real_rate(path, wall_secs)`. **Always use `during=`; always call `real_rate`** |
| `drive.py` | `tree/nodes/labels/find/button/at_launcher/reconnect/tap/dismiss_logbox/dismiss_sheet/goto_lesson/advance/run_lesson`. **`advance()` returns a TUPLE** — `if not advance():` is always False because a non-empty tuple is truthy; that hid a stall for 8 steps |
| `solve.py` | `load/norm/find_match/find_truefalse/find_slider/find_step/tap/answer` plus `plan_order_swaps/order_rows/solve_order` |
| `element_curve.py` | the per-element instrument. Region from a11y, box drawn, **overlap against frame 0**, `_sustained()` runs, p10..p90 widths. 14 assertions |
| `segment.py` / `oscillate.py` / `filmstrip.py` | whole-frame windows, peak counting, contact strips |
| `route_audit.py` | per-route navigation verification; marks non-navigating routes SKIPPED |
| `mascot_density.py` | like-for-like mascot vs control-region density |

## 4.3 Driver gotchas — every one produced a confident wrong result

| bug | symptom |
|---|---|
| `goto_lesson` matched the failure screen | returned True on *"That lesson isn't available."* because that sentence contains "lesson" |
| kebab vs camelCase course ids | routes are `personal-finance`, JSON is `personalFinance` |
| `advance()` returns a tuple | `if not advance():` always False |
| tap-reveal gate | Continue is inert until EVERY card is flipped; the gate now **scrolls** for cards below the fold, bounded to 6 rounds |
| order steps unsolvable | now solved by `plan_order_swaps` — selection sort, at most n−1 swaps, never touches a correct row. **Proven on device: "solved an order step in 3 swaps"** |
| `find_step` precedence | `a and b in k or k in b` grouped so any SHORT screen label inside a long option matched |
| `find_step` length floor | `len(n) >= 4` made numeric options (`"56"`, `"25"`) invisible, so `fillBlank` never matched |
| role-keyed button lookup | drove **0 steps**, filmed static intros, reported success |
| slider first tap swallowed | bailing on one no-op aborted a working control |
| `t.join(timeout)` | does not stop a thread; the driver raced its successor. Use `threading.Event` |
| LogBox banner | the RevenueCat warning at y≈800–822 overlaps Continue at y=760–816 and **eats taps**. Dismiss immediately before tapping, not only at launch |
| pair data shape | a curriculum pair is a **LIST** `[left, right]`, not `{left, right}` |

## 4.4 The measurement recipe

```python
# 1. REGION FROM THE ACCESSIBILITY TREE, never guessed
node = next(n for n in drive.nodes() if 'Atlas' in n[4])      # (x, y, w, h, label)

# 2. DRAW IT AND LOOK. This is what catches the error that cost this audit most.
im = Image.open(shot); sx = im.width / 402.0
ImageDraw.Draw(im).rectangle([node[0]*sx, node[1]*sx,
                              (node[0]+node[2])*sx, (node[1]+node[3])*sx],
                             outline=(255,0,0), width=6)

# 3. CAPTURE, firing the action AFTER warmup, and ASK the file its real rate
record(h, 2.4, quality=1.0, during=do_the_tap)
n, rate = real_rate(h, 2.4)

# 4. VOID THE TAKE if another process hot-reloaded the app mid-capture
#    (low-RED blue only — Euphoria's own violet is r=184)
if any(frac(b>150 and r<120 and b>g+40) > 0.15): discard

# 5. PER-CHANNEL MAX. .convert('L') hides blue shifts on this palette.
d = ImageChops.difference(cur, prev); r,g,b = d.split()
mask = ImageChops.lighter(ImageChops.lighter(r,g), b).point(lambda v: 255 if v>10 else 0)

# 6. PAD the crop, or growth beyond the resting box is invisible and a pop reads as "no change"
# 7. SUSTAINED runs only — 3 consecutive frames — or compression reads as a state change
# 8. ASSERT SOMETHING MOVED before computing any ratio or on-grid test
```

## 4.5 Pre-registration

**Commit predictions BEFORE the capture.** This is what made the shake result trustworthy:
predicted ±3.36pt over 280ms, measured **3.33pt over 271ms — 1% error**, with the prediction
already in git (`f32e894`, `b4c95f7`). It also means a wrong prediction stays visible instead of
being quietly retrofitted.

---

# PART 5 — WHAT WAS MEASURED

| animation | predicted | measured | error |
|---|---|---|---|
| wrong-answer shake | ±3.36pt, 5 steps, 280ms | **3.33pt, 5 steps, 271ms** | **1%** |
| celebrate, before | — | 3.16pt | — |
| celebrate, after `gain` 0.5 | 1.56× | **4.57pt (1.45×)** | 7% |
| logo cross-fade | 280ms | **286ms** | 2% |
| click-pop removed | ≤354pt | **355.7pt** | noise |
| headline width ratio (R4) | ~1.0 | **0.99** ×3 captures | — |

**The shake verdict — KEEP.** Five alternating decaying steps over 271ms matches
`atlas.tsx:331-338`'s five `withTiming` steps totalling 280ms. R1: 271ms sits at p25, right for a
corrective jolt. R2: multi-peak under 0.35s is the deliberate exception, and this qualifies —
hand-written per element and commented *"V1 balance-scale reference"*. **This animation was never
the problem.**

**Celebrate.** `CELEBRATE_GAIN = 0.32` gave a hop the same size as the error shake — getting it
right and getting it wrong moved the mascot equally. Owner chose to make correct read louder;
`celebrateGain={0.5}` at the quiz head only (the 0.32 default is right for onboarding taps).
Lesson-complete stays at `celebrateGain={1}`, three times louder, so the payoff keeps its contrast.

---

# PART 6 — THE RETRACTION LOG (20)

Keep these visible. They are the audit's error record and several would otherwise be re-derived.

1. **"Atlas is under-animated (38%/46%)"** — measured on a **guessed rectangle above the mascot**.
   Real: **99% of frames, 87%×88%**, better than the reference. Survived four analyses.
2. "No Duolingo footage exists" — it was ref3, the largest recording.
3. "Device captures are 30fps" — `simctl recordVideo` is fixed **15fps**.
4. "The app renders at 15fps" — that was ffmpeg duplicating frames from a 15fps container.
5. "3 reduced-motion defects" — all static transforms; regex backtracking.
6. "Lesson art ships 2 shapes" — **40 distinct designs across 295 titles**, longest run 2.
7. "Transitions are 3× too fast" — **1.24×** at a like-for-like floor.
8. "16% of transitions bounce" — driver double-taps plus h264 ghosting.
9. "Cross-fade overlaps two screens" — standard iOS `slide_from_right`.
10. "9 of 23 routes audited" — only 9 **navigated**; the table was retracted and replaced with a
    verified 24-of-25.
11. "30 commits" — actual 42. **Count, do not estimate.**
12. "Saver is a bare shield" — it renders three stacked ellipses (coins edge-on); what it lacks is
    ORNAMENTS, which by design start at rank 2.
13. **"Every static Atlas sits at −3.4°"** — arithmetic said so; **measured −0.61°**.
14. `anim_guard.py` — my own motion guard, **deleted** because the other lane's
    `motion-invariants.mjs` is a strict superset.
15. **A regression I shipped:** the sheet fix used a mount-only effect, so two always-mounted
    sheets got **no entrance at all** — the exact failure its own commit message warned about.
16. **A second regression I shipped:** moving the graph point to the UI thread left the polyline's
    last vertex on throttled React state, so the line detached from the point by up to 2.4pt.
17. **"Idle head rock is confirmed running"** — withdrawn within the hour. The eyes sit OUTSIDE the
    rotated group, so `rock` cannot move them; that swing was saccade and blink.

18. **"the flick moved the rail 878px = 292.7pt = 2.03 × 144"** — not a measurement at all, but the
    argmax of a search window that stopped at ~806px and never contained the true value. The frames
    prove it: not one card is common to the before and after, so the true shift is ≥432pt against a
    402pt frame. Cross-correlation is structurally incapable here and is retired.
19. **A counterfactual arm measured against itself.** Arm B of the first snap A/B scattered
    convincingly (37.0pt, 110.0pt) — but Metro was down, so the patch could never have reached the
    device and arm B may have been running the shipping build throughout. Withdrawn. Now impossible
    to repeat: the probe refuses to start unless `localhost:8081` answers.
20. **"the feedback bar overshoots 36.8%, peaks at 417ms, settles at 911ms."** All artifacts of a
    13fps sampler, and reproduced three times, which is exactly what made them persuasive. ζ=0.607
    caps overshoot at 9.1%, so the value could not have reached 1.368 under any circumstances.

**Plus one caught before publishing:** `VERDICT: SNAPPED` on a rail that had not moved.

---

# PART 7 — WHAT IS STILL OPEN

## 7.1 CAROUSEL SNAP — **CLOSED, CONFIRMED ON DEVICE**

**`home.tsx` course rail (interval 144pt) is verified snapped.** Measured by A/B against the app
itself with `scripts/anim/snap_rest.py AB`. Among rests trustworthy on the pre-registered
correlation floor (>= 0.60):

| arm | what it is | rests | worst offset from the 144pt grid |
|---|---|---|---|
| **A** | the shipping build | **3/3 at phase 16.0pt** (all five flicks read 16.0pt) | **0.0pt** |
| **B** | `snapToInterval`/`snapToAlignment`/`decelerationRate` stripped via Fast Refresh | 3/3 scattered | **63.7pt** (also 50.0, 8.0) |

Clean separation, so the instrument discriminates and arm A is not measuring a tautology.
**Confirmed by eye too, and this is the owner-facing part:** arm B's final rest shows a card sliced
off the left edge and another sliced off the right; arm A's shows three whole cards with the first
flush at the 16pt inset. That sliced frame **is** the owner's *"whenever I drag something, it moves
all over the place"* — and it was never in the animation code. It was six horizontal `ScrollView`s
with no snapping.

**The instrument.** Total displacement is NOT the claim and cannot be measured here (see the
retirement note below). `snapToAlignment="start"` means every rest puts a card edge on the content
inset — one number per flick. `snap_rest.py` phase-matches a 144pt/132pt square wave against the
rail band's column profile, built from **per-channel max, never `.convert('L')`**.

**Two traps this hit, both now guarded in the script:**

1. **The movement guard was blind to the exact case it protects.** It first compared the same
   card-BODY rows the phase is measured on — and those rows are uniform fill on every card, so a
   shift of one whole card leaves the profile IDENTICAL when the rail rests on an exact multiple of
   144pt. It reported "did not move" on all five flicks *because the snap was working perfectly*.
   The tell was the template correlation alternating 0.936/0.337 as the selected violet card entered
   and left the band. **Movement is now detected on the ICON rows (10–30% of the band), which are
   differently coloured per course, while the phase stays on body rows (34–42%, between icon and
   title, so glyph strokes cannot forge an edge).**
2. **Metro must be up.** With the dev server down the arm-B patch never reaches the device and arm B
   silently measures the shipping build. `at_launcher()` returns **False** on the connect-error
   screen so the existing check misses it, and `reconnect()` cannot repair it. The probe now refuses
   to start unless `localhost:8081` answers. Start it with `npm start`.

**RETIRED — do not spend a run on cross-correlation.** *(Retraction #18.)* The recorded
"878px = 292.7pt = 2.03 × 144" is not a measurement; it is the argmax of a search window that
stopped at ~806px and never contained the true value. The frames prove it: before a flick the rail
shows *Investing Fundamentals / Personal Finance / Global Economics*, after it shows *Business
Strategy / Financial Analytics / Behavioral Finance* — **not one card in common**, so the true shift
is ≥432pt against a 402pt frame. No correlation between two 402pt frames can express that. The
recorded "flick shorter" fix would have hidden the problem, not solved it. The retired probe is kept
at `scripts/anim/snap_probe.py`.

**The `news-gallery` market-news rail (interval 244pt) is ALSO CONFIRMED.** Same instrument, same
A/B — `python3 scripts/anim/snap_rest.py news AB`:

| arm | rests | worst offset from the 244pt grid |
|---|---|---|
| **A** | **5/5 flicks at phase 16.0pt**, 3 scored | **0.0pt** |
| **B** | 5/5 scored, scattered (150.0, 227.0, 167.7, 16.0, 188.3pt) | **110.0pt** |

**One thing it needed that the course rail did not:** the top ~54% of a news card is the article
**photograph** — bright and arbitrary — so a template of uniform cards cannot match there. The first
run returned correlations of 0.15–0.36 against the 0.60 floor and scored nothing, *even though arm A
sat at 16.0pt on all five flicks*. Moving the phase rows to the uniform strip between the image and
the publisher line (56–63% of the band) took arm A to 0.90/0.77 and arm B to 0.91. **The phase rows
are per-rail** and live in the `RAILS` config; arm B kept the rest of the machinery unchanged.

**Both fixed rails are now verified. The carousel work is closed.**

## 7.2 Owner-blocked

- **RevenueCat's current offering has NO PACKAGES** (`refs/IAP_OFFERING_REPORT.md`).
  `EXPO_PUBLIC_REVENUECAT_IOS_KEY` **is** set, so this is not a missing key — `getOfferings()`
  resolves with an empty offering. **The app cannot sell anything.** Commercially the most serious
  thing this audit found, and not an animation issue. Dashboard fix. Note the warning text sends
  you to check PRODUCT ids while `findPackage` resolves on **PACKAGE** ids.
- **`EXPRESSION_TILT`** — a design decision. `headProps` carries
  `(rock*2-1)*ROCK_DEG + headLag + EXPRESSION_TILT` but wraps **only `<AtlasMarkBody>`**; the
  sclera, pupils and brows are SIBLINGS outside it. So all three rotation channels turn the body
  rings beneath a face that does not move. The file header states the intent — *"Body spins on tap
  (eyes stay upright)"* — so the architecture is deliberate. **The open question is only whether
  the resting TILT, a different channel from the spin, should be exempt.**
  Three measurement routes are closed: absolute angle defeated by saccade + blink; differential
  defeated by brow occlusion (`default` draws NO brows, `oops` draws two that overlap the sclera
  tops and slope OPPOSITELY, so they erase white asymmetrically — the sclera count fell 1692 → 1377,
  a 19% loss, which is what exposed it).
- **Four sheets shipped unverified** — all mount only on entitlement state.
- ~~**~460 lines of superseded drag components**~~ — **DELETED** (actually 567 lines: slider-predict
  133, before-after-slider 163, graph-point-drag 184, sort-buckets 87). Re-verified first, because
  the initial check returned a *false zero* when zsh ate an unquoted `--include` glob — the same
  confident-empty-result shape as two earlier wrong claims. Every surviving mention is a comment,
  and those were repaired rather than left pointing at files that no longer exist.
- **290 `interactiveGraph` steps render as prose** — deliberate and commented, but it is the one
  authored-interactive type currently shown as text.

## 7.3 Recorded as observations, NOT defects

- **`search` (0.0%) and `explore-compound` (1.0%) are the only zero-motion screens.** NOT filed:
  `starCount` does not explain it — `news` runs 24 stars with glow off and reaches 17.2% against
  search's 22 at 0.0%. It is content, not configuration. A search box with no query has nothing
  that ought to move.
- **Content resting motion** — `courses` (35%) and `digest` (49%) mount `AmbientBackground` but are
  dense grids of opaque cards that OCCLUDE it. No reference anchor exists for resting motion on a
  reading screen.
- **`Spring.press` is used 0 times** while `SpringPressable` — the component it is named for —
  uses `Spring.snappy`.

## 7.4 Verified clean — do not re-sweep

Nine bug classes, five no-op shapes, all six scroll-jank causes, every `Haptics` call (27), every
gesture handler, every animated style/props, every lesson step component. **`AmbientBackground` is
well built**: 70 stars driven by **5 shared values total** — one `translateY`, three shared twinkle
phases, one glow opacity — not 70 individual animations.

---

# PART 8 — HOW TO WORK

**Per verified unit:** fix → re-run the IDENTICAL measurement → publish before/after →
`npx tsc --noEmit` exits 0 → `npm run check` exits 0 → selftests pass → commit and push to main
with a `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` trailer → append one row to
`refs/LOOP_LEDGER.md`. **A fix without its re-measurement is not done.**

**Every fix lands on a `tokens.ts` value, never a fresh magic number.**

**Reporting rules the owner set:**

> *"Before sending, verify 3 times… make sure everything you are sending is factual information
> only… and not bs formatting."*

Cite `file:line`. Quote measured numbers with units and sample size. Say *"I have not verified X"*
rather than implying you did. Distinguish an observation from a defect. **Never claim a screen was
tested if navigation was not content-verified.** Report cost warnings; never push through one
silently.

**Do not launch agents, workflows or background tasks unless explicitly asked** (CLAUDE.md).

**When a measurement disagrees with source, suspect the measurement first.** Reading source has
repeatedly beaten running captures here: three device runs failed to settle the tilt question and
two source reads answered it, found a dead animation, and corrected an overstated finding.

---

# PART 9 — RESUMING THIS SESSION'S FULL TRANSCRIPT

The complete conversation (~13,000 messages) is on disk. To continue with full context rather than
from this document alone:

```bash
# find it
ls -la ~/.claude/projects/-Users-siddarthakodithyala/*.jsonl

# resume in place
cd ~/euphoria-native && claude --resume        # pick the session from the list
```

**If moving to a different account** (`CLAUDE_CONFIG_DIR` swaps the WHOLE config dir — auth,
settings AND transcripts, so a fresh dir sees no history):

```bash
SRC=~/.claude/projects/-Users-siddarthakodithyala/<session-id>.jsonl
A2=~/.claude-account2
cp "$SRC" "$A2/projects/-Users-siddarthakodithyala-euphoria-native/"
cp "$SRC" "$A2/projects/-Users-siddarthakodithyala/"        # both, so --resume finds it either way
cp "$A2/settings.json" "$A2/settings.json.bak"              # back up first
cp ~/.claude/settings.json "$A2/settings.json"              # hooks, MCP servers, skills
shasum -a 256 "$SRC" "$A2/projects/"*/"$(basename $SRC)"    # VERIFY identical

export CLAUDE_CONFIG_DIR=~/.claude-account2
cd ~/euphoria-native && claude --permission-mode auto --resume
```

Auth lives in the macOS Keychain, not a file, so expect a login prompt on first launch there.

---

# PART 10 — THE ONE-LINE VERSION

Measure the amplitude before the curve. Take the region from the a11y tree **and draw it**. Capture
at 48fps, lossless for per-element work, firing the action after warmup. Verify navigation by
CONTENT. Assert something moved before computing a ratio. Average across two full cycles. Suspect
your instrument before the app. **And retract in writing when you are wrong — seventeen times so
far, two of them regressions this audit introduced itself.**
