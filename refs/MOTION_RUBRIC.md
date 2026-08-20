# Motion rubric — measured, not asserted

The standard every FIX / IMPROVE / KEEP verdict in the animation audit cites. Derived from the
reference recordings on 2026-08-19, not from taste and not from my preference.

**Provenance.** `refs/videos/*.mov` — three screen recordings, 108s + 122s + 268s, all 30fps.
Extracted to **14,974 frames**, segmented into **330 motion windows**, of which **307** are
discrete transitions (≤2.0s). The remaining 23 are scrolls and continuous/video content.

**Method.** Two passes, both in `scripts/anim/`:
1. `segment.py` — per-consecutive-frame changed-pixel count at ¼ scale; contiguous runs above
   0.4% of the frame become a motion window. **Per-channel max, never `.convert('L')`** —
   luminance weighting scores a blue-only shift of +20 as 2, and these palettes are dark with
   saturated accents. Self-checked with a blue-only fixture that a luminance pass would miss.
2. `oscillate.py` — counts significant local maxima inside each window. A spring that overshoots
   crosses its target and returns, so its diff curve rises, falls and rises again; a
   critically-damped move produces one decaying peak. Self-checked against synthetic
   single-decay and bounce series.

---

## R1 — Duration

n = 307 discrete transitions.

| min | p10 | p25 | **median** | p75 | p90 | max |
|---|---|---|---|---|---|---|
| 0.10s | 0.13s | 0.27s | **0.40s** | 0.67s | 1.20s | 1.97s |

**Rule.** A discrete UI transition belongs in **0.27s–0.67s** (the reference's interquartile
range). Below 0.13s or above 1.20s falls outside the reference's 10th–90th percentile and needs
a stated reason.

Euphoria's own step choreography — `step-transition.ts`: EXIT 150 + GAP 90 + HEADLINE 280 +
ATLAS_LEAD 150 ≈ 670ms — lands exactly at p75. **KEEP.** It was measured off these same
recordings originally and the measurement holds.

## R2 — Settle

Single-peak rate (one clean settle, no secondary motion) by duration band:

| band | n | single-peak |
|---|---|---|
| <0.25s | 74 | **87.8%** |
| 0.25–0.40s | 73 | 50.7% |
| 0.40–0.60s | 62 | 50.0% |
| 0.60–1.00s | 61 | 21.3% |
| 1.00–2.00s | 37 | 10.8% |

**Rule.** A short, single-element transition settles in **one pass**. Of the 124 transitions
under 0.35s, **73% are single-peak**. Bounce is the deliberate exception in the reference, not
the default — so an overshoot must be a choice someone made for a specific element, and must be
justified per element rather than inherited from a library default.

## R3 — Long windows are choreography, not bounce

Peak count tracks duration almost perfectly (1-peak median 0.30s → 8-peak median 1.37s). The
multi-peak windows are **staggered multi-element sequences**, not one element oscillating eight
times. This validates Euphoria's existing `childDelay()` / `STAGGER_GAP` model in
`shared/motion/step-transition.ts`: the reference does the same thing.

**Rule.** Do not "fix" a multi-peak long window. Check whether it is stagger (correct) before
treating it as overshoot (defect).

---

## R7 — Idle mascot liveness (reference-anchored)

Measured on **ref3 (Duolingo)**, frames 400–900 — 16.7s of the mascot at rest, after its
entrance has settled. Changed-region bounding box inside the mascot's own footprint, threshold 8:

| metric | Duolingo |
|---|---|
| frames showing motion in the mascot box | **81%** |
| mean changed region | **54% × 48% of the mascot's own box** |
| max changed region | 90×97px of a 90×107px box (i.e. the whole mascot) |

**Rule.** A resting mascot should be moving most of the time, and when it moves it should change
a substantial fraction of itself — not a stroke's control point. Duo changes roughly half its own
area on a typical frame.

Euphoria's welcome mascot measured **38%** of frames by a different method (larger region,
threshold 30), so the two are **not directly comparable and must be re-measured like-for-like**
before the gap is quoted as a figure. `scripts/anim/mascot_density.py` exists for exactly that.
The direction is not in doubt: Euphoria's idle amplitudes are 1–3% of a 100-unit viewBox
(0.5–2pt at shipping sizes), which cannot produce a change of half the mascot's area.

## CAPTURE RATE — a correction that affects every device measurement

> **`simctl io recordVideo` records at a fixed 15 fps.** Measured 2026-08-19:
> `r_frame_rate=15/1`, 138 frames across 9.223s. Earlier notes in this audit described device
> captures as "30fps". **They were not.** A 280ms transition gets ~4 samples at 15fps, which
> cannot separate a clean settle from an overshoot.
>
> Extracting such a file at `fps=30` recovers nothing — ffmpeg duplicates every frame. The
> resulting "50% of frames are identical" was briefly misread here as *the app rendering at
> 15fps*, when it was the recorder's rate all along. Check the container before blaming the app.
>
> **Use `idb video-stream --fps 60` instead:** measured 481 frames in 10.1s = **47.7 fps**,
> 3.2× the resolution, ~13 real samples across a 280ms curve. Wrapped in `scripts/anim/capture.py`.
>
> **Gotcha:** adding `--scale-factor` makes `video-stream` write a **zero-byte file and exit
> without an error**. Do not "optimise" the capture with it.
>
> The three REFERENCE recordings in `refs/videos/` are genuinely 30fps (verified by ffprobe on
> their containers), so **R1–R4 are unaffected**. Only device-side capture was degraded.

## CAPTURE FIDELITY — what these recordings can and cannot judge

> **Timing: trustworthy. Visual quality of a fast transition: NOT.**
>
> `idb video-stream` encodes h264 at a default compression quality, and frames are extracted at
> 1/3 scale. During a full-screen change the encoder cannot keep up, and a single mid-transition
> frame shows torn, duplicated, blocky content that looks exactly like a janky animation.
>
> It is not. The tell: in the same frame the **tab bar and status bar are perfectly sharp** while
> only the changing region is blocky, with hard rectangular macroblock edges. Static regions are
> preserved by inter-frame compression; changing ones are not. A real rendering fault would not
> respect that boundary.
>
> This was nearly written up as an app defect off one frame of the `learn` entry transition.
>
> **So:** segmentation, duration, peak counting and motion density are all valid — they depend on
> *whether* pixels changed, not on their fidelity. Any claim of the form "this transition looks
> torn / smeared / janky" needs a lossless capture (`--compression-quality 1.0`, or a screenshot
> burst) before it can be made.

## Limits of this pass — stated so nobody over-reads it

Whole-frame differencing answers *when* and *how many*, never *which element* or *by how much*.
Specifically **NOT** established here:

- **Overshoot magnitude** (peak scale vs rest scale) per element.
- **Scale origin** — whether a reveal starts at 0 or near-1.
- **Exit behaviour** — whether outgoing content animates out or is hard-cut.

These need per-element bounding-box curves. For **Euphoria** that is straightforward: the
accessibility tree supplies each element's frame, so a bbox curve can be measured directly. For
the **reference recordings it is not possible** — a video has no accessibility tree. Those three
rules must therefore come from manual filmstrip inspection of specific reference transitions,
which is the next pass and is **not yet done**. Until it is, R4/R5/R6 below are open, and no
verdict may cite them.

- **R4 — scale origin:** OPEN
- **R5 — exit behaviour:** OPEN
- **R6 — easing shape:** OPEN

## Corpus

Three recordings, plus 21 Finch onboarding stills in
`~/Downloads/Code Projects/Finch iOS Onboarding/`. An exhaustive sweep (all volumes, iCloud
Drive, the full Photos library, every `.mov`/`.mp4` over 1MB under `~`) found no others.

> **CORRECTION, 2026-08-19.** An earlier note in this file claimed "no Duolingo video exists on
> this machine." **That was wrong.** `ScreenRecording_07-21-2026 14-17-49_1.mov` (ref3, 268s,
> 8,047 frames — the largest of the three, and 198 of the 330 motion windows) is **Duolingo**.
> The Duo owl is plainly visible once frames are rendered. The error came from judging the file
> by its generic `ScreenRecording_*` filename instead of opening it. Every number in R1–R3
> already includes this footage, so the measurements stand; only the provenance claim was wrong.
> The lesson is the same one this audit keeps re-learning: **look at the artifact, do not infer
> from its name.**

## R4 — Scale origin: FIRST EVIDENCE (partial)

`scripts/anim/filmstrip.py` tracks the bounding box of the changed region across a window. A
recording has no accessibility tree, but the diff is non-zero only where something moved, so
that box *is* the moving element's footprint.

Measured on ref3 frames 381–394 (0.47s), the Duo mascot entering a screen:

| frame | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|---|
| box w | 83 | 70 | 70 | 74 | 77 | 78 | 78 | 77 | 72 | 63 |
| box x | 102 | 94 | 91 | 80 | 65 | 50 | 34 | 22 | 22 | 21 |

**The mascot TRANSLATES at constant size.** Width holds in a 63–83px band across every frame of
motion while x sweeps 102 → 21. It never scales up from nothing.

**Provisional rule.** The reference introduces an element by moving it, not by growing it from
zero. `ZoomIn`-from-scale-0 has no counterpart in this footage. Marked provisional because it
rests on one measured transition; needs 3–5 more before it closes.

---

## First application — `src/components/tap-reveal.tsx`

The reported defect ("abrupt… messes up the pixels… too large to small… bouncing"), scored:

| Rule | Measured | Verdict |
|---|---|---|
| R1 duration | `ZoomIn.springify().damping(16)`, default stiffness 100, mass 1 → ζ=0.8, ω=10 rad/s, 2% settle ≈ **0.5s** | **PASS** — inside 0.27–0.67s |
| R2 settle | ζ=0.8 is underdamped → overshoots past 1 and returns | **FAIL** — inherited from a library default, not chosen per element |
| R5 exit | front face unmounts with **no exiting animation** — hard cut | **OPEN rule**, but the docstring claims "flip"; code does a swap |
| R4 scale origin | `ZoomIn` starts at **scale 0**; text rasterised near-zero and resampled up | **OPEN rule** — this is the reported pixel shimmer |

**Duration is not this component's problem.** Its settle behaviour and scale origin are. Note
R4/R5 are still OPEN, so the fix must wait on the filmstrip pass rather than being guessed —
except for R2, which is closed and already failed: the spring must move onto a
`shared/motion/tokens.ts` value chosen deliberately, not Reanimated's default stiffness.

The 3D flip is **rejected by owner direction** and is not under consideration.

## FAST REFRESH CORRUPTS DEVICE CAPTURES — found 2026-08-20

> **If anything edits a watched file while you record, Metro reloads the app mid-take.**
>
> Expo's dev client paints a **full-screen blue "Refreshing…" overlay** during a reload. The
> mascot disappears behind it, the measured region fills with overlay blue, and a centroid
> series computed over those frames reads as a violent oscillation — a clean, quotable,
> completely wrong number. It was nearly reported as the wrong-answer shake.
>
> Found by building a contact sheet and **looking at the frames**. No amount of staring at the
> series would have revealed it; the series looked like a damped oscillation, which is exactly
> what a shake looks like.
>
> This happens whenever a second agent, an editor, or your own commit touches `src/` during a
> capture. **A shared working directory makes every device measurement unreliable**, and being
> careful with `git` does not help — Metro watches the filesystem, not the index.
>
> **Mitigation, now in the probe:** sample frames at 6fps, count pixels where
> `b>120 and b>r+40 and b>g+30`, and **void the take if any frame is >15% overlay blue**.
> Fix the cause by giving the other worker its own `git worktree`.

## WHOLE-FRAME DIFF CANNOT MEASURE A TRANSLATE — use a centroid

> Segmentation answers *when* something moved. It cannot answer *how far*, and for a mascot
> that also breathes, blinks and sways it cannot even isolate *which* motion you are looking at.
>
> The wrong-answer shake is `translateX ±size*0.06`. Against an Atlas that idles at 99% of
> frames, a changed-pixel count is saturated before the shake begins. The right instrument is a
> **per-frame centroid of the element's own pixels** — segment the mascot by colour (saturated
> violet on near-black: `r>70 and b>90 and b>g+25`), take the mean x, and read the excursion.
> A translate shows up as a clean signed deviation from the resting centroid; breath and blink
> barely move it.
>
> **Watch the baseline.** A first pass measured a 701-pixel floor that turned out to be the
> **progress bar**, which is the same violet. Print the segmented bounding box, not just the
> count, and confirm it sits where the element is.

## ATLAS HAS NO ACCESSIBILITY LABEL WHEN `interactive={false}`

> `atlas.tsx` puts `accessibilityLabel="Atlas, the Euphoria mascot"` only on the **Pressable**
> branch. Every caller passing `interactive={false}` — including the lesson quiz head — renders
> through the early return with no label, so **Atlas never appears in `describe-all`** there.
>
> That is defensible product behaviour: a decorative mascot should not be announced when the
> text feedback already carries the meaning. It is NOT a defect and should not be "fixed" to
> make measurement easier.
>
> **So derive the region from a labelled SIBLING.** In the quiz head the row is
> `[Atlas size=56][prompt flex:1]`, so Atlas is the band left of the prompt. **Anchor on the
> prompt's TOP edge, not its centre** — the prompt is a multi-line block up to 128pt tall and
> Atlas is top-aligned to its first line. Centring put the box ~30pt low, catching Atlas's
> bottom third plus empty space. Caught, as always, by drawing the box and looking at it.

## SCROLL PERFORMANCE IS NOT MEASURABLE WITH THIS CAPTURE PATH

> **`idb video-stream` is bandwidth-limited to roughly 100 KB/s.** Measured across three takes
> on the same device and resolution:
>
> | capture | frames | size | KB/frame | **KB/s** |
> |---|---|---|---|---|
> | lesson shake | 144 | 294KB | 2.0 | 113 |
> | lesson celebrate | 186 | 306KB | 1.6 | 90 |
> | **digest scroll** | **22** | 252KB | **11.5** | 105 |
>
> Bytes per second is constant; bytes per FRAME differ sixfold. A scroll changes every pixel, so
> inter-frame compression buys nothing and each frame costs ~6× more — and 6× fewer fit through
> the pipe. The resulting **9.2 fps is the RECORDER's rate, not the app's.**
>
> Confirmed by a second, independent line. Scrolling `courses` returned 35.8fps against digest's
> 9.2 — but courses' changed-pixel fraction collapses to 0–1% after ~10 frames because the short
> list reaches its end, while digest sustains 40–64% for the whole window. **Frame rate tracks how
> long full-screen motion lasts, not how heavy the content is.** If the app were janking under
> list weight, the relationship would be the other way round.
>
> **Therefore: no dropped-frame or smoothness claim may be made from these captures**, in either
> direction. Not "digest scrolls badly", and equally not "scrolling is fine".
>
> **A duplicate-frame metric is also invalid here** for a second reason: after a flick decelerates
> the content genuinely stops, and settled frames are identical. `scroll_probe.py` counted those
> as dropped frames and reported 29.4% on a list that had simply finished scrolling. Any such
> metric must gate on the content still being in motion.
>
> **The right instrument is the React Native Perf Monitor** (dev menu → Show Perf Monitor), which
> reports real UI and JS thread FPS on-device in seconds and costs nothing to run. Use that, or
> `xctrace`, for scroll work. Not this.
