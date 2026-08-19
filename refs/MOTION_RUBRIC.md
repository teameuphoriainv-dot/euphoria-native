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
