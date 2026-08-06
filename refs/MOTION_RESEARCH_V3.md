# Research v3 — Phase 3 findings

Session 2026-08-06 (session 2). Continues `MOTION_RESEARCH_V2.md`. Tiers as before:
**T1** spec · **T2** measured on this machine · **GUESS** labelled judgement.

Discipline followed: every number below came from **local** measurement or a spec already known.
No web research was used — that is what exhausted the previous session's budget.

---

## D2 + D4 — the headline. Brand colour is doing double duty. **T2, measured**

Method: 21 Brilliant stills in `refs/images/`, 4 Euphoria captures. Each screen split into a
**chrome** band (top 14% — status + progress) and a **content** band (22–62% — the illustration
area). Saturated pixels (S>0.35, V>0.25) binned into 36 hue buckets.

| | Brilliant | Euphoria |
|---|---|---|
| Brand hue in **chrome** | **92.3%** (green 120–149°) | **100.0%** (violet 260–289°) |
| Brand hue in **content** | **20.2%** | **70.5%** |
| Distinct hue buckets in content (>3%) | **10** | **5** |
| **Chrome/content concentration** | **4.56×** | **1.42×** |

**The rule, now measured rather than asserted:** brand colour is a *system signal*. Brilliant
concentrates green 4.56× into chrome and lets content run full-spectrum across 10 hue families.
Euphoria's chrome is correct — arguably purer than theirs — but **our content is 3.5× too
brand-coloured and carries half the chromatic range.**

This answers **D4** (bland vs sparse) too. Blandness here is not a spacing or density problem —
it is **chromatic monotony in the content layer**. When the brand hue fills both the chrome and
the artwork, it stops signalling anything, and every screen reads as one colour.

**Target:** content-band brand hue **≤35%**, distinct hue buckets **≥8**. Ratio ≥3×.

⚠️ **Sample limits, stated:** 4 Euphoria screens vs 21 Brilliant, and ours skew to
onboarding/paywall, which are violet by nature. The two path screens *do* include the
multi-hued course art and still measured 70.5%, so the direction holds — but a fair rerun
should sample Learn, Trade, Digest and You.

⚠️ **One discarded measurement.** A first pass sampled 140–169° for Brilliant's green and
returned 0.0% on all 21 files. The mass is at **130–139°**. Mis-targeted band, discarded — not
reported as a finding. (Same failure mode as V2's flagged bad video window.)

---

## A3 — follow-through lag. **T2 (ours) + T1 (principle)**

`atlas.tsx` fires the head's reaction **70ms after** the body's (`withDelay(Duration.fast + 70)`
in the celebrate effect), and rings cascade at `RING_LAG_MS = 55` each.

Both sit inside the classical range: secondary masses trail the primary by roughly **2–5 frames
at 24fps ≈ 80–200ms** (Thomas & Johnston, *The Illusion of Life* — overlapping action).
**Confidence: medium.** The principle is T1; the specific 70/55 values are ours and were chosen,
not derived. **Falsifiable:** raise the head lag to 120ms; if the mascot reads as *broken* rather
than *alive*, 70ms was already near the ceiling for a 96pt character.

---

## B1 — press timing. **T1 only. NOT MEASURED — and cannot be**

A press is ~3 frames at 30fps; `refs/videos/*.mov` are 30fps (V2 §1). **Any press number taken
from those clips would be fabricated.**

From spec: Apple response 0.25 / ζ 1.0 → `Spring.press` **632/50/1**, critically damped. Scale
to **0.97**. Haptic on `pressIn`, not `press`, so the physical cue leads the visual.
**Confidence: high (spec), zero observation.**

---

## C3 — perceptual thresholds. **T1**

- **<100ms** reads as instantaneous — below this a transition is perceived as a cut, which is
  why `Duration.instant` is floored there.
- **~1s** is the limit of uninterrupted flow of thought (Nielsen's response-time limits).
- **~400ms** (Doherty threshold, IBM) is where system response stops costing user attention.

Practical consequence: an **earned** moment at `Duration.earned` 3200ms deliberately *exceeds*
these — it is not a response, it is a reward, and it is allowed to take time. Everything that is
a *response* to input must land inside 400ms. **Confidence: high.**

---

## C4 — 120Hz ProMotion. **T1, medium confidence**

Springs are physics-integrated per frame, so they adapt to refresh rate automatically; durations
in ms are refresh-independent. What does *not* adapt: anything hand-stepped in frame counts, and
any `withSequence` whose segments were tuned by eye on a 60Hz device. We have **14 `withSequence`
sites** (V2 §3). **Falsifiable:** capture the same beat on a 60Hz and a 120Hz device and diff the
energy curves — if they differ in shape rather than smoothness, something is frame-coupled.

---

## E2 — motion auditing tooling. **T2, proven this session**

What actually produced every number in v2 and v3, all free and local:

| Tool | Use |
|---|---|
| `scripts/motion_energy.py` | % frames animating, burst detection |
| `scripts/measure.py` | per-window energy, luma, centroid, spring-vs-tween classification |
| `scripts/sim.sh` | text a11y tree, store-as-JSON, semantic tap, motion check |
| `ffmpeg` + `ffprobe` | capture, **CFR re-encode**, frame extraction |
| PIL + numpy | hue segmentation, edge tracking |

**Two traps that produce false numbers — both hit this session:**

1. **`simctl recordVideo` is variable frame rate.** Measured raw it reported 41.1% frames
   animating; re-encoded to CFR 30fps the honest figure is **39.5%**. VFR emits fewer frames
   while nothing moves, which inflates the ratio. **Always `-vf fps=30` first.**
2. **Never track an element's position across an opacity ramp.** A fixed colour threshold loses
   faint pixels as the element fades and drags the detected edge. A stage transition measured
   169px of travel that way; restricted to frames at ≥90% of peak area it is **6px**.

Instruments' Animation Hitches remains **unevaluated** — worth checking, not checked.

---

## Ranked implementation backlog

| # | Change | Effort | Files | Acceptance |
|---|---|---|---|---|
| 1 | **Desaturate the content layer** — course art, illustrations and cards stop defaulting to violet; use the 12 `COURSE_ACCENTS` in content and keep violet for chrome/progress/selection | **L** | `lesson-art.tsx`, `digest-heroes.ts`, `euphoria-icons.ts` | Re-run the segmentation: content brand hue **≤35%**, hue buckets **≥8** |
| 2 | **Build one earned moment at `Duration.earned`** — streak extended, two-stage per reaction-map row 7 | **M** | `streak-ignite.tsx`, `atlas.tsx` | A capture of the streak beat runs **≥3s** and contains a luma flash |
| 3 | **Distinct correct vs incorrect** — vertical pop vs horizontal shake (map rows 4–5) | **S** | `atlas.tsx`, `lesson-feedback.tsx` | The two beats differ in **axis**, verifiable by centroid trajectory |
| 4 | **Lean-in on question arrival** (map row 10) | **S** | `atlas.tsx`, `lesson.tsx` | Head rotates +4° and holds while unanswered |
| 5 | **Convert the 14 `withSequence` sites to retargetable springs** | **M** | 14 sites (V2 §3) | Tap a rewarding element 4× fast — no snap |
| 6 | **Sample the remaining screens** for the D2 rerun | **S** | — | Learn/Trade/Digest/You measured |

Item 1 is the largest lever and is **not a motion change at all** — it is the colour finding
above. Motion polish on a chromatically monotonous screen will not fix "bland".

---

## Sources

**T1** — Apple HIG (feedback, reduce motion, spring response/damping); Material 3 motion
(emphasized-accelerate/decelerate, duration scale); Nielsen response-time limits; Doherty
threshold (IBM); Thomas & Johnston, *The Illusion of Life* (overlapping action).

**T2, this machine** — hue segmentation of 21 Brilliant stills + 4 Euphoria captures; drag-sort
motion energy before/after; AtlasStage travel before/after; all constants read directly from
`atlas.tsx`.

**Explicitly unverified / not done:** A2, A4, A5, B2, B4, B5, D3 remain unanswered — they need
either web sources or frame-by-frame work not yet done. Instruments unevaluated. The Euphoria
colour sample is 4 screens and skewed. Press timing unobservable at 30fps. Brilliant's Streak
Charge (~41–50s in `13-12-29`) still unmeasured, carried over from V2.
