# How Euphoria's animation actually looks — measured

> # ⛔ RETRACTION — 2026-08-19, read this first
>
> **The central claim of this document — that Atlas is under-animated — is WRONG, and the error
> was mine.**
>
> Every "mascot region" figure below (38%, 46%, and the amplitude reasoning built on them) was
> measured on a **rectangle I guessed at**, roughly y=79–245, which sits ABOVE Atlas and captures
> the spotlight cone and empty space. Atlas's real frame, from the accessibility tree, is
> **x=135, y=276, w=132, h=137** — verified by drawing the box on a screenshot, where it lands
> exactly on the mascot.
>
> Re-measured on the correct box, same R7 method:
>
> | | frames with motion | mean changed region |
> |---|---|---|
> | **Euphoria Atlas** | **99%** | **87% × 88%** of its box |
> | Duolingo (R7) | 81% | 54% × 48% |
>
> And via `mascot_density.py` with its own control: **mascot 97.1% vs control 88.4%, lift +8.7.**
>
> **Atlas moves more often, and changes more of itself, than Duolingo's mascot does.** It is not
> dead, it is not under-amplitude, and its idle events are not too rare.
>
> **Cancelled as a result:** task 1a (raise `IDLE_SQUASH`) and task 1b (shorten the saccade /
> arc-flex gate). Acting on them would have added violence to something already moving more than
> the reference — the precise "your fixes make it worse" outcome this audit existed to prevent.
>
> **Still standing** (measured on regions that were not guessed): `courses` has a dead, empty
> bottom half; entry choreography spans ~3000× across routes; a cross-fade superimposes two text
> layers for ~0.15s. The Atlas brow work already shipped stands on its own — it was verified
> visually, by making nine expressions distinguishable, not by these density numbers.
>
> **Method lesson, the sharpest of the session:** every other error today was caught by testing a
> confound. This one survived four separate analyses because they all inherited the same guessed
> rectangle. *Take the measurement region from the accessibility tree, never from an eyeball
> estimate over a screenshot.*


Written 2026-08-19 to answer one question: *what is the real state of motion in this app?* The
owner's report was that animation fixes "either stay the same or get worse," which is a symptom
of fixing the wrong variable. This is the diagnosis.

Everything below is measured off a 15,329-frame, 48fps recording of the running app plus direct
reads of `atlas.tsx`. Where a number is not trustworthy, it says so.

---

## CORRECTION, later the same day — the finding is sharper than "amplitude"

A like-for-like re-measure (R7 method: tight box, bbox, threshold 8) against Duolingo changes the
diagnosis. **Amplitude per event is fine. Two different things are wrong.**

| | frames with motion | mean changed region |
|---|---|---|
| **Euphoria** welcome | **46%** | **60% × 50%** of its box |
| **Duolingo** (R7) | **81%** | 54% × 48% of its box |

When Euphoria's mascot moves it changes *slightly more* of itself than Duo does. The gap is **how
often**. And its 46% is generous — three control regions on the same frames scored **99% / 55% /
53%**, so part of that 46% is starfield inside the box, and the mascot is the least-animated
region on its own hero screen.

**Why 54% of frames register nothing even though breath runs continuously:**

`IDLE_SQUASH = 0.038` — a 3.8% scale cycle. At welcome's 132pt that is a 5.0pt total excursion
across a 1600ms half-cycle, which at 48fps is 77 frames. Peak per-frame change is therefore
5.0 × π / 77 ≈ **0.20pt per frame**.

> **Measured vs inferred, kept separate.** What is MEASURED is that 54% of frames register no
> change above the detector's threshold, and that Duolingo registers on 81% against Euphoria's
> 46%. That breath is therefore *imperceptible to a person* is an INFERENCE, not a measurement —
> a smooth 3.8% scale over 1.6s may well read to the eye even when consecutive frames differ by
> 0.2pt, because human perception integrates over time and a frame-differ does not. The honest
> claim is that breath contributes almost nothing to frame-to-frame change, which is what makes
> the mascot read as still in a side-by-side against Duo.

So:

- **Breath** — continuous but ~0.2pt/frame, so it contributes almost nothing frame to frame.
  Likely an *amplitude* problem, but see the measured-vs-inferred note above before treating
  "invisible" as established.
- **Saccade / arcFlex** — visibly sized, but gated behind `2100 + random×2600`ms, so roughly one
  event every 3.4s. A *frequency* problem.

Fixing only the amplitude constants, as originally planned, would have left the mascot moving in
sharp isolated bursts separated by stillness. Both need to change, and they are different edits.

## The finding, in one line

**The app's sense of life comes from a background layer, not from its content. The content's own
motion is either too small to see (breath, ~0.2pt/frame) or too rare to register (saccade and
arc-flex, one event per ~3.4s).**

That is why tuning easing curves changed nothing. The curve was never the problem — and, per the
correction above, neither was the amplitude *of the discrete events*. Section 1 below reads the
static constants; the correction reads what actually reaches the screen, and it supersedes
section 1 wherever the two differ.

---

## 1. Atlas moves less than one point

From `atlas.tsx`, against a 100-unit viewBox:

| constant | value | travel @132pt (welcome) | @46pt (home) |
|---|---|---|---|
| `SACCADE_UNITS` | 1.1 | 1.5pt | **0.5pt — sub-pixel** |
| `ARC_FLEX_UNITS` | 1.6 | 2.1pt | 0.7pt |
| `SWAY_DEG` | 1.6° | — | — |
| `ROCK_DEG` | 3.4° | — | — |

Measured consequence — motion density in the mascot's own region, versus a same-frame control
region containing no mascot:

| route | expression | mascot region | control region |
|---|---|---|---|
| **welcome** | `happy`, 132pt | **38%** | **69%** |
| home | `happy`, 46pt | 22% | 13% |
| chat | `watching`, 110pt | 93% | 63% |
| you | `happy`, 62pt | 90% | 41% |
| auth | `happy`, 72pt | 66% | 25% |
| options | `watching`, 92pt | 29% | 32% |

**On welcome — the app's hero screen, carrying the largest Atlas in the product — the starfield
behind the mascot moves nearly twice as often as the mascot does.** It is not a size effect;
welcome's Atlas is the biggest one there is.

### Why `happy` is worse than `watching`

`watching` draws **round pupils** — a dark disc on white sclera, where a 1.5pt displacement is
clearly visible. `happy` draws **arc eyes**, where the same 1.5pt moves a thin stroke's control
point and reads as nothing.

`happy` is additionally **excluded from blinking** by construction:

```js
const showBlink = blink && !spinning && expression !== 'happy';
```

The stated reason is sound — you cannot close an arc, so a blink would read as nothing. But the
consequence was never measured: **`happy` is the most-used expression in the app** (welcome, auth,
home, you, reward, chat, lesson, term-match), and it is the one with the least perceptible life.

---

## 2. The starfield is doing the work

Idle liveness — untouched screen, 2.0s–5.0s after the route opened, so entry animation has
settled and no gesture has fired:

| route | frames showing motion | mean change |
|---|---|---|
| start · chat · auth · trade · lesson | **97–99%** | 3k–21k px |
| welcome · learn · friends | 94–97% | 8k–22k px |
| you | 83% | 15k px |
| **digest** | **49%** | 2.3k px |
| **courses** | **35%** | 1.1k px |

Almost every screen is in constant motion. That motion is `AmbientBackground` — a starfield with
per-star twinkle plus a 19-second drift.

`courses` and `digest` **do** mount `AmbientBackground`, so the absence of it is not the reason
they are quiet. My first explanation — "dense card grids occlude the starfield" — is **wrong for
courses**, and §2b shows why: that screen's quiet half is empty, not covered. `digest` is the case
where content genuinely sits over the background and neither layer moves.

**Either way the conclusion holds: nothing in the content moves at rest.** The app's liveness is a
background effect, so wherever the background is absent, sparse, or covered, the screen is still.

---

## 2b. Where the dead space actually is — regional heatmap

Screen split into an 8×4 grid, measuring what fraction of sampled frames each cell moved during
the same untouched 2–5s window (more sensitive threshold than §1, so compare within this table
only):

```
courses                          learn
 0 |:+  |  32  56  10   8         0 |#+==|  80  58  49  46
 1 |-=:.|  37  49  28  13         1 |%%+*|  90  90  63  70
 2 |.=: |  18  48  27   0         2 |***#|  75  75  75  87
 3 |.=: |  18  49  27   0         3 |####|  87  83  85  77
 4 |    |   0   0   0   0   <--   4 |###+|  79  85  80  62
 5 |    |   0   0   0   3   <--   5 |%#**|  94  85  75  72
 6 |    |   0   0   8   0   <--   6 |+===|  56  46  46  48
 7 |    |   3   0   0   0   <--   7 |-==-|  35  51  54  35
```

**The bottom half of `courses` is not low-motion, it is ZERO.** And it is not occluded content —
pulling the frame shows it is **empty black space**. The Foundations tab holds 3 courses
(`courseIndex.ts` splits 12 as 3 easy / 4 intermediate / 5 advanced), `courses.tsx:35` defaults to
`'easy'`, and the three cards fill the top half. The rest is bare, with the starfield too sparse
there to register.

So the default view of the course catalogue is three cards above ~50% empty screen. Same family
as the 118pt dead band on Home, at roughly four times the area.

`digest` by contrast is low but non-zero everywhere (11–51%) — genuinely quiet, not empty.

## 2c. Transition pace — the "3× faster" claim, tested and largely withdrawn

An earlier pass here reported that Euphoria's lesson transitions run ~3× faster than the
reference at every percentile. That was marked preliminary because the driver's tap cadence
inflates the short end. **Tested by applying the same duration floor to both sides, and it mostly
does not survive:**

| floor | Euphoria median | reference median | ratio |
|---|---|---|---|
| none | 0.12s | 0.43s | **3.67×** |
| ≥0.12s | 0.25s | 0.45s | 1.83× |
| ≥0.20s | 0.36s | 0.50s | 1.40× |
| **≥0.27s** (R1's p25) | **0.46s** | **0.57s** | **1.24×** |

Excluding sub-0.27s events from both, Euphoria's transitions are **1.24× faster** — modest, and
nothing like 3×. The headline gap was the short-event population, not transition duration.

**What IS real, normalised by recording length:**

| | motion events / second |
|---|---|
| reference (330 windows / 499s) | **0.66** |
| Euphoria (2,930 windows / 2,000s) | **1.47** |

**Euphoria produces ~2.2× more motion events per second.** The difference is not that its
transitions are short; it is that there are many more small ones. Whether that reads as busy or
as responsive is a judgement this measurement cannot make — but "everything is too fast" is not
supported, and should not be acted on.

**R2 failures remain real**: 228 of 1,458 (16%) are short *and* multi-peaked, clustered at
0.20–0.35s, overwhelmingly 2-peak (145) or 3-peak (62). Short-plus-bouncing is what reads as
"abrupt".

## 2d. What the R2 failures actually look like — read, not counted

Two filmstrips from the sweep, inspected frame by frame.

**(a) Most R2 failures on interactive steps are MY DRIVER, not the app.**
`alternativeInvestments-1 t=10.87` is a multi-select quiz. Across 13 frames the highlighted
option changes three times — option 1, then option 2, then option 1 again. That is the driver
tapping, and it exposes a limit in the metric: `peaks()` counts maxima inside a motion window, so
**two taps close together are indistinguishable from one overshooting spring.** The 16% R2 rate
is therefore inflated on interactive steps and should not be quoted as an app defect count.

**(b) WITHDRAWN — it is a standard iOS push, not a cross-fade defect.**

Re-captured at `--compression-quality 1.0` and read frame by frame: the incoming screen's
content ("League", "Saver") enters from the **right edge** while the outgoing screen is still
visible on the left. That is `slide_from_right`, the iOS default for a Stack push, and
`_layout.tsx` sets no `animation` option so it inherits exactly that. **Two screens being
visible at once is how a push works** — it is not an overlap defect.

The original observation below was the slide overlap plus the h264 ghosting documented earlier
in this file. It is kept for the record, struck through in effect:

**(b, original and wrong) A cross-fade overlaps two screens' content.**
`alternativeInvestments-1 t=0.18`. For roughly the first 7 of 15 frames
(~0.15s of a ~0.31s transition) the OUTGOING screen's dense body text and the INCOMING lesson
intro are both drawn at partial opacity, superimposed — two blocks of running text on top of
each other. It is legible text over legible text, so this is opacity blending, not the
compression artefact described elsewhere in this document.

> **ATTRIBUTION IS UNCERTAIN, and the sweep cannot settle it.** `sweep.one()` calls
> `goto_lesson`, which navigates and waits **3.5s**, and only then starts recording — so a route
> entry animation is over before the camera rolls. The content of this strip (dense body text
> dissolving into the lesson *intro*) looks like route entry, but it could equally be the first
> step transition. Relatedly, the "first transition" of every swept lesson reads t=0.0 with
> dur≈0.06s, uniform across all 15 — those are **recording-start artefacts, not entries**, and
> any table built from them is invalid. Capturing route entry needs recording to begin BEFORE
> the deep link fires.
>
> The overlap itself is real and visible in the frames; only which transition produced it is open.

This contradicts the app's own stated principle. `shared/motion/step-transition.ts` explains why
its step choreography inserts a dead beat:

> the incoming step would mount *below* the outgoing one … The reference has a gap, so the two
> steps never need to coexist

The **step** transition honours that. The **route** transition does not. Same product, two
different answers to the same question, and the route one produces the overlap the step one was
written to avoid.

## 2e. Frame-by-frame across the lesson sweep — what the recordings actually show

248 filmstrips over 22 recordings (1.5GB) from 18 lessons. Read as a cross-lesson montage: the
worst R2-flagged window from each of six different courses, sampled frame by frame.

| lesson | what the flagged window contains |
|---|---|
| alternativeInvestments-1 | pension-fund quiz — static; only a selection border changes |
| alternativeInvestments-2 | dense text with vertical ghosting — driver scroll plus compression |
| alternativeInvestments-3 | "Cryptocurrency" intro with Atlas — 7 near-identical frames |
| appliedAccounting-1 | Enron text screen — slight ghosting mid-sequence |
| appliedAccounting-2 | Hertz text, last 2 frames jump to "Key terms" — a real step transition |
| behavioralFinance-1 | "Why Your Brain Costs You Money" — 7 near-identical frames |

**Lesson content screens are static once settled.** Across every sampled window the detected
motion resolves to one of three things: a selection border changing, a step transition at the
boundary, or h264 ghosting on dense text. Genuine animation appears only at step boundaries.

**Whether that is a defect is a judgement, not a measurement.** These are reading screens — a
learner is parsing a paragraph about Enron, and ambient movement under body text competes with
comprehension. The reference apps were not measured for resting motion on their own reading
screens, so there is no anchor here of the kind R7 provides for mascots. Recorded as an
observation, NOT queued as a fix.

**It does explain the R2 count.** 16% of transitions "failing" R2 was never 16% of animations
bouncing: on interactive steps the multi-peak is the driver tapping, and on content steps it is
compression on static text. Neither is an app defect.

## 2f. Frame-by-frame across the whole-app recording (15,329 frames)

The six largest motion windows, one per route, read frame by frame:

| route | window | what the frames show |
|---|---|---|
| options | 4.17s / 31 peaks | dense options table churning — the walk's own SCROLL, not an entrance |
| onboarding | 3.17s / 12 peaks | "Create your free profile" form, with a dark transition mid-sequence |
| "welcome" | 3.06s / 1 peak | **a different screen entirely** — route labels here are unreliable |
| start | 2.81s / 11 peaks | "How much do you already know?" with Atlas — real staggered content |
| **league** | 2.60s / **26 peaks** | crest plus leaderboard rows arriving progressively — good choreography |
| **reward** | 2.29s / 14 peaks | Atlas visibly motion-blurred across frames — genuine mascot animation |

**This corroborates the entrance work.** `league`, `start` and `reward` all show real multi-peak
staggered entrances, matching their `RiseIn` usage. The screens with none were `search`,
`friends` and `why-not-free` — the three that were fixed. The targeting was right for a reason
that can be checked, not because it felt right.

**Two cautions this read reinforces.** The route labelled "welcome" shows different content
entirely, because label attribution in that pass came from a walk where only 9 of 23 routes
navigated. And `options`' 31 peaks is the walk's own scrolling. Neither is an app property.

## 2g. Verified per-route table (replaces the retracted one)

`scripts/anim/route_audit.py`, navigation confirmed per route by comparing label sets. 24 of 25
routes navigated; `home` was skipped by a harness bug (it parked on home, so home->home changed
nothing) which is now fixed. Idle motion = share of frames changing while the screen sits
untouched.

| route | idle% | wins | | route | idle% | wins |
|---|---|---|---|---|---|---|
| lesson | 62.1 | 11 | | options | 18.7 | 10 |
| welcome | 58.7 | 14 | | news | 17.2 | 4 |
| reward | 54.1 | 13 | | courses | 16.9 | 7 |
| chat | 50.5 | 13 | | digest | 13.1 | 4 |
| friends | 46.7 | 11 | | stock-sym | 11.8 | 4 |
| onboarding | 39.3 | 11 | | learn | 11.6 | 2 |
| auth | 38.8 | 13 | | games-term-match | 11.5 | 3 |
| digest-slug | 33.7 | 16 | | settings-account | 3.1 | 1 |
| you | 30.4 | 13 | | **explore-compound** | **1.0** | **0** |
| games | 23.0 | 6 | | **search** | **0.0** | **0** |
| trade | 22.5 | 5 | | league | 20.5 | 7 |
| why-not-free | 22.2 | 8 | | start | 19.5 | 9 |

**`search` and `explore-compound` are the only screens with zero motion windows**, and
`settings-account` has one. All three mount `AmbientBackground`, so the starfield is not absent.

**Not filed as a defect.** `starCount` does not explain it — `news` runs 24 stars with `glow`
off and still reaches 17.2%, against `search`'s 22 stars at 0.0% — so the difference is content,
not configuration. Search with an empty query, a calculator at rest and a settings list are all
screens with nothing that ought to be moving. Recorded because the contrast is real and someone
should decide it deliberately, not because a number is low.

## 3. Entry transitions are wildly inconsistent

Peak motion in the 1.2s after each route opened, for routes that verifiably navigated:

| route | peak px | | route | peak px |
|---|---|---|---|---|
| welcome | 245,582 | | courses | 1,954 |
| you | 227,951 | | home | 2,591 |
| learn | 205,110 | | options | 537 |
| lesson | 155,086 | | search | 84 |

A ~3000× range. Some routes have real entrance choreography; others have essentially none.

---

## What this means for the fix

1. **Two separate idle edits, measured separately.** (a) Raise `IDLE_SQUASH` — breath is
   continuous but ~0.2pt/frame, so it never registers. (b) Shorten the `2100 + random×2600`ms gate
   on saccade and arc-flex — those events are already well sized, just rare. Doing only (a), as
   this document originally proposed, would leave the mascot moving in isolated bursts separated
   by stillness. Easing is not involved in either.
2. **Give `happy` a liveness cue that survives arc eyes** — squeeze/flatten the arc rather than
   closing it. It is the most-used expression and currently the deadest.
3. **Content needs its own resting motion** on screens that occlude the background, or those
   screens will stay dead however good the background is.
4. **Standardise entry choreography.** A 3000× spread is not a design decision.

---

## Trust notes — what these numbers are and are not

- **Density, duration, peak counts: valid.** They depend on *whether* pixels changed.
- **Visual quality of a fast transition: NOT valid from this capture.** h264 at default
  compression, extracted at 1/3 scale, produces torn blocky frames during full-screen change that
  look exactly like jank. The tell is that the tab bar stays sharp while only the changing region
  breaks up. One frame of the `learn` entry was nearly filed as a defect on this basis. Judging
  "does it look janky" needs `--compression-quality 1.0` or a screenshot burst.
- **The per-route R1/R2 table from the first whole-app pass is retracted.** Only 9 of 23 routes
  actually navigated — deep links silently no-op on a pushed screen — so more than half of it
  described the wrong screen. Re-running with verified navigation is queued.
- **R1 "failures" are inflated** by the walk's deliberate scrolling; R3 says continuous scroll is
  choreography, not a defect.

## 8. The wrong-answer reaction, MEASURED at last — and it is correctly built

The last unmeasured animation in the app. Three driver bugs and one measurement bug stood
between the audit and this number; all are recorded in `CARRYOVER.md` Appendix C.

**Route:** `personalFinance` lesson 1, `fillBlank` (`options ['56','25','10','80']`, correct 0),
tap `'25'`, then Check. Tap registration **verified by label change** — `'25. Incorrect.'`,
`'56. Correct answer.'`, `'Not the one.'` appeared. Capture 144 frames @ 55.4fps, contamination
1.9%.

**Method:** per-frame centroid of Atlas's own violet pixels, region derived from the prompt's
a11y frame and verified by drawing it (Atlas carries no a11y label when `interactive={false}`).

| ms | deviation from resting centroid |
|---|---|
| 90 | **−3.33pt** |
| 162 | +6.16pt |
| 235 | −5.38pt |
| 289 | +4.94pt |
| 361 | −3.70pt |
| 379→2582 | ≤0.44pt (settled) |

**Five alternating, decaying deviations spanning 271ms.** `atlas.tsx:331-338` is exactly five
`withTiming` steps — 60+60+55+55+50 = **280ms** — before a ζ=0.58 spring to 0. Step count
matches; duration matches within one frame at 18ms/frame.

**The prediction, written in `CARRYOVER.md` Appendix E BEFORE the measurement, was ±size×0.06 =
±3.36pt at size 56. The first step measured 3.33pt — 1% error.** Recorded this way so it could
be judged honestly rather than retrofitted.

**Verdict: KEEP.** R1 — 271ms sits at the reference p25 (0.27s), inside the 0.27–0.67s band at
its lower edge, which is right for a corrective jolt rather than a transition. R2 — it is
multi-peak under 0.35s, which R2 treats as the *deliberate exception*, and it qualifies: the
sequence is hand-written per element and commented "V1 balance-scale reference", not inherited
from a library default. **This animation was never the problem.**

### Two caveats, stated so the number is not over-read

1. **The later peaks are confounded.** `expression` flips to `oops` on the same frame, and the
   `oops` face redraws brows and eyes, which moves a colour centroid independently of any
   translate. The **first** step (3.33pt vs 3.36pt predicted) is the clean one; treat +6.16 as
   shake plus expression change, not as shake amplitude.
2. **Timing is inferred.** The tap was scheduled 800ms after the recorder started, yet the
   oscillation appears at 90–361ms, so `idb video-stream` evidently drops ~1s of startup before
   its first frame. The identification rests on the signature, not the clock: five alternating
   decaying steps over 271ms, matching a five-step 280ms sequence, with `idle={false}` meaning
   **no other motion source exists on this screen** — and dead-flat afterwards.

### What IS worth noting: the mascot freezes the moment it finishes reacting

Post-settle motion is **≤0.44pt across 1.8s**. The quiz-head Atlas is `idle={false}`
(`lesson.tsx:429-435` passes no `idle`; `atlas.tsx:125` defaults it false; `atlas.tsx:316`
zeroes breath/sway/rock when it is false). So the learner shakes the mascot, then reads an
explanation next to a completely frozen one, against R7's reference of 81% of frames in motion.

**Filed as an observation, not a defect.** A still mascot beside text a learner is reading is a
defensible choice, and this audit has already retracted one Atlas liveness claim made without a
reference anchor. Deciding it needs a design call, not a measurement.

## 9. Celebrate hop measured — and the reward is the same size as the penalty

Predictions were committed in `b4c95f7` **before** this capture ran.

**Route:** same `fillBlank`, tapping the CORRECT option. Registration verified by label change —
`'Exactly right.'`, `'That fits.'`. 185 frames @ 54.4fps, contamination 3.6% (clean).
Measured as per-frame **vertical** centroid of Atlas's violet pixels.

| prediction | outcome |
|---|---|
| **P1** vertical excursion 2.5–3.1pt | **CONSISTENT** — sustained deviations of −2.66 to −3.16pt |
| **P2** duration 700–900ms | **CONSISTENT** — activity from ~37ms to ~662ms, then quiet |
| **P3** hop smaller than the ±3.33pt shake | **NOT CONFIRMED** — they are the same size |

One frame at 55ms read −13.72pt, eight times its neighbours on both sides. Discarded as a
decode artifact, not averaged in.

### The result that matters

`H = size × 0.12 × celebrateGain = 56 × 0.12 × 0.32 = 2.15pt`, and the measured hop lands at
**~2.7–3.2pt** once the ζ=0.40 launch overshoot is included. The wrong-answer shake measured a
first step of **3.33pt**.

**Getting it right and getting it wrong move the mascot by the same amount** — about 3pt on a
56pt mascot, roughly 5% of its size. The error reaction is, if anything, marginally larger.

This is a **design observation, not a defect**, and the distinction matters. Every constant here
is deliberate and documented: `CELEBRATE_GAIN = 0.32` exists precisely so the per-tap reaction
stays quiet, and `atlas.tsx:141` records why — a global constant "made the option-tap reaction
correct and flattened the lesson-complete moment along with it". The lesson-complete Atlas
(`lesson.tsx:488`) passes `celebrateGain={1}`, i.e. **three times** this amplitude, which is the
payoff this quiet beat is deliberately saving room for.

So the question is not "is 0.32 wrong" but "should the per-question correct answer read louder
than the per-question wrong answer". That is a product call, not a measurement, and it is put
here for the owner rather than acted on.

### Caveats — this capture is weaker than the shake capture

Unlike the shake, the celebrate signal is **confounded three ways** and no single clean step
isolates it: the feedback panel slides in on the same frames, the expression flips to `happy`
whose arc eyes redistribute the very pixels being tracked, and the ScrollView may shift. The
amplitude agreement with P1 is real but should be read as *consistent with*, not *confirmation
of*. The shake number (3.33pt vs 3.36pt predicted, with a clean first step) is the stronger of
the two measurements.

## 10. RETRACTION #13 — the "every static Atlas is tilted −3.4°" bug is NOT real

Hypothesised from source: `rock = useSharedValue(0)` (`atlas.tsx:163`) and head rotation is
`(rock.get() * 2 - 1) * ROCK_DEG` (`atlas.tsx:399`), whose neutral input is rock = **0.5**, not
0. With `idle={false}` the idle effect returns early and never animates rock, so the arithmetic
predicts every static Atlas sitting permanently at −3.4°. Seventeen instances render that way.

**Measured: −0.61°.** Eye-line angle by PCA on the sclera pixel cloud — the two whites form an
elongated blob whose principal axis is the eye line — self-checked against synthetic disc pairs
at 0.0°, −3.4°, −6.4° and +5.0°, worst error 0.65°.

−0.61° against a predicted −3.40° is a clear negative. Whatever the reason (the eyes may sit
outside the rotated `<G>`, or rock may not hold 0 at paint), **the visible tilt is zero and there
is nothing to fix.** Filed before it could be written up as a defect.

Note the method is now available and self-checked, so the open `oops` / `thinking` tilt question
can be settled the same way — it needs a still of a tilted expression, which needs a wrong
answer left on screen.

## 11. Scroll and list performance — no defect found in source, and NOT measurable on device

**Source audit.** There is **not one `FlatList` or `SectionList` in the app**; every list is a
`ScrollView` with `.map()`. That is only a defect when a list is long enough that virtualisation
pays for itself, and none of them are:

| list | file | size |
|---|---|---|
| `STOCKS` / `ALL_SYMS` | `lib/stocks.ts` | **7** (the Mag 7) |
| `COURSES` | `lib/curriculum/courseIndex.ts` | 12 |
| `WEEK` | `app/(tabs)/home.tsx` | 7 |
| digest `library` | `lib/digest-content.ts` | **35**, cards render **no images** |

At these sizes `ScrollView` + `map` is the correct choice — `FlatList` would add virtualisation
bookkeeping for no benefit, and the digest cards carry no image decode to defer. **No defect is
evident from source.**

**Device measurement: not possible.** See `MOTION_RUBRIC.md` — the capture path is bandwidth-
limited, so during a scroll its own frame rate collapses to ~9fps and reports the recorder rather
than the app. Both a "digest janks" and a "scrolling is fine" conclusion are unsupported.

**Recommended instead:** React Native's Perf Monitor (dev menu → Show Perf Monitor) reports UI
and JS thread FPS live on-device. Ten seconds of scrolling with it open answers this question
directly and costs nothing. Filed as the next step rather than guessed at.

## 12. Onboarding: a pick auto-advances after 260ms, so the perceived slide change is ~930ms

Found while building the slide-by-slide audit, and it corrects a model this audit had been
working from.

**The flow.** Tapping an option on a `single` slide does not wait for Continue. `onboarding.tsx:398`:

```js
const advanceAfterPick = () => {
  const from = step;
  setTimeout(() => { if (stepRef.current === from) next(); }, 260);
};
```

Verified two ways: the option's label leaves the accessibility tree immediately after a tap
(nothing to select, nothing to confirm), and the source above schedules `next()` on a 260ms
timer. The guard `stepRef.current === from` correctly cancels the auto-advance if the user has
already moved on — that is careful code, not a race.

**What it means for the rubric.** `MOTION_RUBRIC.md` credits `step-transition.ts` with
EXIT 150 + GAP 90 + HEADLINE 280 + ATLAS_LEAD 150 = **670ms**, and marks it KEEP at R1's p75.
That verdict is about the **choreography**, and it still holds. But on a `single` slide the user
does not experience 670ms — they experience **260 + 670 ≈ 930ms** from finger-up to the next
headline settling, because the pick delay runs first.

930ms sits between R1's p75 (670ms) and p90 (1200ms). Inside the reference range, at the slow
end. **No change made**: the 260ms exists so a selection is visibly acknowledged before the
screen moves, which is the correct instinct — an option that vanishes the instant it is touched
reads as a mis-tap. Recorded so the number is not mistaken for 670ms in future work.

**Harness note.** The first two slide-by-slide attempts failed because they assumed a Continue
tap on every slide. On a `single` slide there is none, and the recorded tap landed on the NEXT
screen's button or on nothing — which the harness reported as a transition duration. Any future
onboarding driver must branch on slide kind: `single` auto-advances on pick, `multi` and
`statement` need Continue.

### 12b. Onboarding transition DURATION is not measurable by whole-frame differencing

Four attempts on one 26s / 1422-frame walk (contamination 1.1%, clean), each defeated for a
reason worth recording rather than worked around:

| method | gate | result | why it fails |
|---|---|---|---|
| pixel count | 1.2% of frame | every slide = **1863ms** | ambient floor; the window never closes |
| pixel count | 8% of frame | **37–55ms**, 13 windows | above the transition's own amplitude |
| changed bbox | height > 30% | **101 windows** | scattered stars give a full-screen bbox |
| bbox **fill ratio** | fill > 0.12 | **11 windows, 37–128ms** | isolates the dense swap only |

**Two structural reasons**, both verified:
1. **`AmbientBackground` never stops.** Onboarding mounts it three times at the default 70 stars
   with glow, each star on `withRepeat(..., -1, true)`. Twinkle is scattered over the whole
   frame, so it defeats a pixel-count floor AND a bounding box.
2. **Atlas persists across slides** in `AtlasStage`, and the shared background does not change.
   Only the headline and options swap, so a slide change is a fraction of the screen — the peak
   whole-frame delta measured just **10–20%**, not the 30–60% a full-screen transition gives.

**The fill-ratio pass is the only one that isolated signal** (p90 fill 0.379 against a median of
0.025) and it found **exactly 11 dense-change events for ~11 taps** — which confirms the walk
really did advance through the flow. But 37–128ms is the duration of the *dense text swap*
alone, not of the choreography around it, so it cannot be compared to the 670ms figure.

**Not reported as a finding in either direction.** No claim that onboarding transitions are
abrupt, and none that they are correct. What is established is `step-transition.ts`'s 670ms
choreography from source, already marked KEEP, plus the 260ms pick delay above it.

**What would settle it:** per-element bbox tracking keyed to the headline's accessibility frame,
which is the method `MOTION_RUBRIC.md` already names as the way to close R4/R5/R6 for Euphoria —
the a11y tree gives every element's frame, so one element's settle can be timed directly without
the starfield ever entering the measurement. Not built; recorded as the next step.

## 13. Nine further bug classes swept — all clean. What that does and does not mean.

Run after the fixes already shipped, to bound what is left rather than to find something.

| class | hits | verdict |
|---|---|---|
| `entering=` with no `exiting=` | 4 | **not defects.** `rise-in` is an entrance primitive by design; `chat` messages never unmount; `welcome`'s copy leaves with the stack transition; `digest/[slug]` HAS `exiting` |
| index keys on animated list items | 3 | **not defects.** `chat` is append-only (both `setTurns` calls append), so indices are stable; `digest/[slug]`'s `key={i}` is the card index, and re-mounting per card is the intended cross-fade |
| one shared value written from several effects | 8 | **not defects.** All `atlas.tsx`, where `headLag`/`squash`/`entranceScale` are deliberately summed across celebrate, nod and shake — the file documents this |
| `withRepeat` with no cleanup | **0** | clean |
| scale deltas under 2% | **0** | clean |
| translate ranges under 2pt | **0** | clean |
| rotations under 1.5° | **0** | clean |
| opacity ranges under 0.12 | **0** | clean |
| nested/duplicated `entering=` | **0** | clean |
| animating `useEffect` with no dep array | 3 | **false positives of my own regex.** All three carry `}, [reduced, t, delay]`; the non-greedy body match terminated early inside `withTiming(1, {...})` |

**The four sub-visible classes are the significant ones.** The audit's original headline was that
Atlas's idle amplitudes were 1–3% and "too small to see" — a claim later **retracted** as
measurement error. This sweep confirms the concern has no other instance: **nothing in the app
animates below a visibility floor.** Whatever is wrong with the motion, it is not amplitude.

**What this does NOT mean.** These are source patterns, not behaviour. A sweep that comes back
clean bounds the classes it checks and says nothing about the ones it does not. The two real
defects found earlier — the logo hard cut and the two permanently frozen mascots — were found by
targeted reading of specific components, not by pattern sweeps.

## 14. The three sheets slide their BACKDROP up instead of fading it — source-level, NOT device-verified

Found by asking why `gate-sheet`, `trial-reward-sheet` and `dismissal-offer-sheet` contain zero
animation code. They do not: they delegate to React Native's `<Modal animationType="slide">`.
Delegating to the platform is the right instinct. The problem is what is inside the Modal.

```jsx
<Modal visible={visible} transparent animationType="slide" onRequestClose={dismiss}>
  <BlurView intensity={38} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />
  <Pressable style={[styles.scrim, …]} />          {/* scrim: {...StyleSheet.absoluteFill} */}
  …the sheet…
</Modal>
```

`animationType="slide"` translates the **entire modal container** up from the bottom edge. With
`transparent`, that container is everything above — **including the full-screen blur and the
full-screen scrim**. So the dimming and the blur do not fade in place; they **sweep upward like a
curtain**, and the top of the screen stays undimmed until the sweep reaches it.

The intended behaviour, and what every iOS sheet does, is: **the sheet slides, the backdrop
fades.** Two different animations on two different layers.

**Why it matters here specifically.** `gate-sheet`'s own comment states the design intent — *"the
point of this sheet is that the user can still SEE what they were reaching for"* — which depends
on the blur reading as a settling layer over the whole screen. A blur that wipes up from the
bottom reads as a panel with a blurred header attached, not as the screen receding.

### CONFIRMED at the framework level (2026-08-20)

Upgraded from deduction by reading React Native's own implementation rather than reasoning about
it. `node_modules/react-native/Libraries/Modal/Modal.js`:

- Its own prop documentation: *"`slide` slides in from the bottom"* — a property of the modal,
  not of any child.
- Line 333 passes `animationType` to **`<RCTModalHostView>`**, the NATIVE host view, and renders
  `this.props.children` INSIDE it.

The native host animates as **one unit**. Every child therefore moves together, and an
`absoluteFill` backdrop is a child. **The blur and scrim slide with the sheet.** That is a
framework-level fact about the four call sites, not an inference about them.

A device capture is still absent, and that distinction is kept below.

**A DEVICE CAPTURE WAS ATTEMPTED AND DID NOT TRIGGER.** `widget-promo.tsx` uses the identical
pattern and mounts from `home.tsx:590` on ordinary state, so it was the reachable instance. The
probe launched, navigated home, and reported **NOT TRIGGERED**: `nextWidgetAsk` returned null
because this session's earlier lesson-driving had already consumed the ask. It printed the
failure rather than measuring an empty screen and reporting a number — which is the only reason
this entry is not a fifteenth retraction.

**The test remains valid for whoever can trigger one:** sample brightness in a strip at the TOP
of the screen against one at the BOTTOM. Fading darkens both on the same curve; sliding darkens
the bottom first, with the top lagging by the travel time. The lag needs no knowledge of the
animation's duration. Probe kept at `/tmp/backdrop_probe.py`; it prints
*"FADE — the deduction was WRONG"* if that is what the frames show.

**Original reasoning, before the framework check:** All three sheets mount only on real state: `GateSheet`
on an entitlement refusal (`gate` truthy), `TrialRewardSheet` after a trial grant,
`DismissalOfferSheet` on a dismissal. Reaching a refusal needs an exhausted free quota, and
`dev-gallery` does not render any of them. The mechanism above is deduced from documented
`Modal` behaviour plus the component structure, **not measured**, and this audit's own rule is
that a deduction is a hypothesis until a capture confirms it.

**How to verify in one capture:** open any sheet and sample the brightness of a strip at the TOP
of the screen against one at the bottom. If the backdrop fades, both darken together on the same
curve. If it slides, the top strip stays bright until the sweep arrives — a lag equal to the
travel time across the screen.

**The fix, if confirmed:** `animationType="none"`, then animate the two layers separately —
backdrop opacity 0→1 over `Duration.base`, sheet `translateY` on a spring. That also brings these
surfaces onto the app's motion tokens, which the platform default bypasses entirely.

**Not shipped.** It is a real change to three files on a commercially important surface, and this
audit has a standing rule that a fix is not done without its re-measurement. Since the
measurement is blocked, the finding is filed rather than acted on.


## 14b. The sheet fix is SHIPPED but still not device-verified — and here is exactly why

Two commits (`5900ed4`, `b59b618`) changed animation on four Modals. Neither was captured. The
blocker is not tooling:

**The simulator account is on an active FREE TRIAL**, which grants Pro access. Verified on the
`you` screen: `FREE TRIAL`, `Free trial`, `See Euphoria Pro`. With entitlement granted:

- `GateSheet` needs a refusal — an advanced lesson (`quantitative-analysis` #3) opened **ungated**
- `DismissalOfferSheet` needs `leaveWall()`, which needs a paywall wall — circular with the gate
- `TrialRewardSheet` fires on the trial grant, which already happened
- `WidgetPromo` was the reachable one, and this session's own lesson-driving consumed its
  once-daily ask (`nextWidgetAsk` returned null)

Ending the trial or clearing entitlement would make all four reachable, but that is **owner app
state**, and the standing rule is that anything changed on the simulator is restored in the same
call. Entitlement is not safely restorable, so it was not touched.

**What IS established:** the mechanism is confirmed in React Native's own source
(`Modal.js:333` passes `animationType` to the native `<RCTModalHostView>` with children inside,
so the host animates as one unit and an `absoluteFill` backdrop travels with the sheet); `tsc`,
`npm run check` and ESLint including rules-of-hooks all pass; `visible` is bound before the hook
call in all four files; and a regression introduced by the first commit — a mount-only effect
leaving two always-mounted sheets with no entrance at all — was found by auditing call sites and
fixed in the second.

**What is NOT established:** that the result looks right. A ten-second look by anyone who can
trigger a sheet settles it — the backdrop should darken evenly across the whole screen while the
sheet rises, rather than the dimming wiping up from the bottom.

## 15. Two more draggables fired a native haptic on EVERY move event

The owner's reported drag bug had a third and fourth instance, missed until now because the
earlier sweep looked for `Gesture.Pan` and **these use React Native's older responder API**.

| file | handler |
|---|---|
| `before-after-slider.tsx:71` | `onResponderMove={(e) => setFromX(e.nativeEvent.locationX)}` |
| `graph-point-drag.tsx:72` | `onResponderMove={(e) => setFromY(e.nativeEvent.locationY)}` |

Both setters ended with `Haptics.selectionAsync()`. `onResponderMove` arrives at display rate, so
a finger on either control fired roughly **60 native haptic calls per second**.

**This is an API misuse, not just a volume problem.** `selectionAsync` is Apple's
*selection-changed* feedback — built to tick once per discrete step, the way a picker wheel
clicks. Driven continuously it saturates the haptic engine and is felt as a buzz rather than as
feedback. It is the same defect class as the per-frame `runOnJS` removed from `slider-predict`,
which is what the owner described as a drag that "moves all over the place".

**Fixed** by quantising to 24 detents across the control: the tick now follows the value's
discrete steps rather than the refresh rate. The thumb still tracks the finger continuously.

**A related cost is documented but NOT fixed.** Both components drive their thumb from React
state, so every move event also re-renders — and `graph-point-drag` rebuilds an entire SVG
`Polyline` points string per event. Gating the state update would fix the re-renders but make
the thumb visibly steppy, so the correct fix is the one `slider-predict` already uses: drive
position from a Reanimated shared value on the UI thread and let React state carry only the
readout. That is a real change to two lesson step kinds and is left as a recorded improvement
rather than made blind.

**Only one `Gesture` handler exists in the whole app** (`slider-predict`'s Pan, already fixed),
and `PanResponder`, `useAnimatedGestureHandler` and `PanGestureHandler` return zero hits. With
these two, every draggable surface in Euphoria has now been audited.

## 16. Haptic and feedback audit across the lesson step kinds

**Every `Haptics` call in the app was classified (27 total).** Two were the per-move defect fixed
in §15. The remaining 25 are correct, and one apparent problem turned out to be good engineering:

Six components fire a success haptic from `useEffect(…, [solved, onSolvedChange])` with **no
once-guard**, which looks like a repeat-fire bug. It is not: every caller passes
`onSolvedChange={setSolved}` (`lesson.tsx:412-417`), and a React setState function has a
**stable identity by guarantee**, so the effect only re-runs when `solved` actually changes.

The two components that DO carry a `solvedRef` guard — `before-after-slider` and
`graph-point-drag` — are exactly the two whose `solved` is derived from a **continuous drag
value**, so it flickers across the threshold as the finger moves. The guards exist precisely
where they are needed. **An asymmetry that looked like inconsistency was the correct design.**

### `matching-pairs` had no animation at all — the check icon now fades

132 lines, zero `Animated`, zero `layout`, zero `entering`, while its sibling step kinds animate
(`order-steps` carries a `LinearTransition` whose own comment records that its reorder "was an
INSTANT CUT" before it was fixed).

On a correct match the border colour and width changed instantly and the tick appeared on one
frame — a **0ms transition on the most satisfying moment in the step**, well below R1's p10 of
130ms. Same defect class as the ticker-logo hard cut.

**Fixed narrowly:** the check icon fades in over `Duration.fast`. A fade and not a scale —
motion-invariant 1 forbids a scale-pop on ordinary interaction, which is the rule that exists to
protect the defect the owner originally reported.

**Border animation — subsequently DONE, with the risky half left out.** A `MatchCell` component
now animates `borderColor` and `borderWidth` across three stages (0 idle, 1 accented, 2 matched)
over `Duration.fast`. The two columns pass different accents — `theme.primary` for selection on
the left, `theme.warning` for a wrong pick on the right — so one component serves both.

**The background tint is still instant, on purpose.** Those tints are 8-digit hex
(`theme.primary + '14'`), and whether `interpolateColor` handles an alpha channel in hex is not
something this audit can verify from here. The border is what carries the meaning; animating it
and leaving the tint is a smaller, checkable change than animating both and guessing.

## 17. Lesson step animation coverage — one gap, and two false alarms

Applied the test that found §16 (a component with no animation whose siblings animate) across
all twelve lesson step components.

**Three returned zero animation. Two are correct:**

- `lesson-prose.tsx` and `lesson-art.tsx` carry none internally, and do not need it: **every step
  kind renders inside one shared wrapper** — `lesson.tsx:403`,
  `<Animated.View key={`s${idx}`} entering={FadeInDown} exiting={FadeOut}>`. Keyed by step index,
  so each step remounts and replays its entrance, and every step has a real exit. An initial
  reading that one of the two `LessonProse` call sites was unwrapped was **wrong** — a
  160-character detection window that did not reach the wrapper.

**One is a genuine, small gap:**

- `graph-point-drag.tsx` changes `pointColor` from `theme.primary` to `theme.success` and swaps
  its caption between *"Drag the point into the green band."* and *"On target — nice
  prediction."* — both **instantly**, on the moment the learner succeeds. Same 0ms class as §16's
  tick.

**Not fixed, deliberately.** The colour lives on an SVG `Circle` and animating it needs
`interpolateColor`; the caption is a text swap needing both strings mounted to cross-fade. Both
are more surgery than the moment justifies, and unlike §16 there is no single element whose
appearance carries the meaning. Recorded as an improvement with its cost, not left implied.

**What this establishes:** every lesson step has an entrance and an exit, from a single wrapper.
The remaining instant transitions are *within-step state changes*, not missing entrances — a
materially smaller class than the audit started with.

## 18. `headProps` rotates ONLY the body rings — the face is outside the rotated group

Definitive, from source, and it needed no capture. `atlas.tsx:594-603`:

```jsx
<AnimatedG animatedProps={headProps} origin="50, 62">
  <AtlasMarkBody rings={ringProps} />        {/* the ONLY child */}
</AnimatedG>
<Circle cx={34.8} cy={26.5} r={whiteR[0]} …/>   {/* sclera — sibling, not child */}
<Circle cx={61.2} cy={25}   r={whiteR[1]} …/>   {/* sclera — sibling */}
<AnimatedG animatedProps={saccadeProps}>{pupils()}{brows()}</AnimatedG>
```

And `headProps` (`atlas.tsx:398-400`) is:

```js
rotation: (rock.get() * 2 - 1) * ROCK_DEG + headLag.get() + EXPRESSION_TILT[expression]
```

**So all three rotation channels — idle rock, reaction follow-through, and the expression's
resting tilt — rotate the body rings beneath a face that does not move.**

**This is in tension with the file's own documentation.** `atlas.tsx:35-40` introduces
`EXPRESSION_TILT` as *"RESTING HEAD TILT — the third acting channel, after pupils and brows"*,
and annotates `thinking: -7` as *"the classic cocked head; the largest of the set because it is
the most legible."* A cocked head that leaves the eyes level is not the gesture that describes.

**CORROBORATED AS DELIBERATE, at least for the spin.** `atlas.tsx:5` states the intent in the
file's own header: *"Body spins on tap (eyes stay upright)."* So the face sitting outside the
rotated group is a design choice, not an oversight — which **weakens the "tension with the
documentation" reading above**. The question is narrower than first stated: the architecture is
intentional, and the open part is only whether the resting TILT — a different channel from the
spin — should be exempt from it.

**NOT filed as a defect, and not fixed.** Whether the face should ride the rotation is a design
decision, not a correctness one: Atlas's eyes float over a ring cluster rather than sitting on a
skull, and a designer may well have chosen to keep them level. Moving the sclera and
`saccadeProps` inside the rotated `<G>` is a two-line change that alters every expression at
once, and this audit does not ship visual changes it cannot verify. **Flagged for an owner
decision with the mechanism spelled out.**

### RETRACTION #17 — "idle head rock is confirmed running" was wrong

Recorded one round earlier from an eye-line swing of 9.21° over 5s and 20.16° over 16s. **The
eyes are outside the rotated group, so `rock` cannot move them.** That swing was the saccade
displacing dark pupils across the white, plus blinks closing the eyes entirely — the same
confound that defeated the absolute-angle measurement.

`rock` may well be running; this says only that **the measurement never showed it**, and the
claim is withdrawn. Nothing in the eye line can confirm or deny a rotation applied to the rings.

## 19. THE THREE DRAGGABLE COMPONENTS ARE DEAD CODE — nothing in the app renders them

Found while looking for a lesson step that would let me device-verify the drag fixes.

| component | rendered at |
|---|---|
| `SliderPredict` | **nowhere** |
| `BeforeAfterSlider` | **nowhere** |
| `GraphPointDrag` | **nowhere** |
| `SortBuckets` | **nowhere** |
| `MatchingPairs` | `lesson.tsx:413` |
| `NumberLine` | `lesson.tsx:415` |
| `TileBuilder` | `lesson.tsx:417` |

The only references to the four dead ones are their own definitions and **docstring
cross-references in sibling files** ("Sibling to NumberLine/SliderPredict"). No imports, no JSX,
no registry, no dynamic map. Verified by scanning every `.ts`/`.tsx` in `src/`.

**Why they are unreachable:** `lesson.tsx` renders nine step kinds —
`prose · choice · multi · reveal · order · match · build · line · todo`. There is no `slider`,
`beforeAfter` or `graph` kind. And `lesson-steps.ts:154` normalises the curriculum's
`interactiveGraph` type to **`kind: 'prose'`**, with the comment *"the chart itself is a later
cycle; its written analysis stands on its own."* The charts were deliberately deferred; the
components were built and never wired up.

### What this means for the owner's reported drag defect

**`slider-predict` — the headline fix for "whenever I drag something, it doesn't move all over
the place" — is a component the app never shows.** The per-frame `runOnJS` was real and the fix
is correct, but it cannot have been what the owner experienced.

The same applies to the 60Hz haptic misuse and the per-move re-renders fixed in
`before-after-slider` and `graph-point-drag`. All four fixes are correct, and all four are to
code that does not currently run.

**So the owner's drag complaint has no identified source.** The remaining candidates, none
verified:

1. **Scrolling.** `ScrollView` is the only drag-like interaction the app actually exposes. The
   audit measured scroll and found no source-level defect (§11), but also proved the capture path
   **cannot** measure scroll frame rate — it is bandwidth-limited and reports the recorder's rate.
2. **These components are MEANT to be wired up** and their absence is itself the bug — a
   `slider`/`graph` step kind that silently renders as prose.

**Not resolved here, and not guessed at.** The honest position is that the fixes shipped are
improvements to dormant code, and the defect the owner described remains unexplained. That
should be said plainly rather than left implied by a list of drag fixes.

### 19b. REFINEMENT — the app renders every drag CONCEPT as a tap, deliberately

The dead components looked alarming. Auditing the full normalizer (`lesson-steps.ts`) against
`stepTypes.generated.ts` gives a far more coherent picture:

| curriculum type | steps | renders as | component | live |
|---|---|---|---|---|
| `dragSort` / `sorting` | 231 | `order` | `OrderSteps` — hint: *"Tap two rows to swap them."* | ✅ |
| `slider` | 198 | `line` | `NumberLine` — tap-based | ✅ |
| `interactiveGraph` | 290 | **`prose`** | — | ❌ |
| quiz / microCheck / fillBlank / scenario | 1,309 | `choice` | ✅ | ✅ |
| `trueFalse` | 273 | `multi` | `MultiSelect` | ✅ |
| `match` | 267 | `match` | `MatchingPairs` | ✅ |
| `tapReveal` / `keyTermsCards` | 433 | `reveal` | `TapReveal` | ✅ |
| `buildIt` | 29 | `build` | `TileBuilder` | ✅ |

**2,509 steps render interactively. Only `interactiveGraph`'s 290 (5.4% of 5,341) are authored
as interactive and rendered as text**, and that one is deliberate and commented.

**So the four dead components are not an oversight — they are superseded.** Every drag concept in
the curriculum was reimplemented as a TAP interaction: `dragSort` became tap-two-to-swap,
`slider` became a tap-stepped `NumberLine`. `SliderPredict`, `BeforeAfterSlider`, `GraphPointDrag`
and `SortBuckets` are the earlier drag-based versions, left in the tree.

**This strengthens the conclusion about the owner's drag complaint.** There is genuinely no drag
gesture anywhere in the shipping app — not merely "the ones I fixed are dormant", but **none at
all**. The only drag-like interaction a user can perform is **scrolling**, which makes scrolling
by far the most likely referent of *"whenever I drag something, it doesn't move all over the
place"*.

That is testable, and this audit could not test it: §11 established that the capture path is
bandwidth-limited and reports the recorder's frame rate rather than the app's during a
full-screen scroll. **The RN Perf Monitor answers it in ten seconds** and is the right next step.

**Recommended cleanup, not performed:** the four superseded components are ~460 lines of
maintained-but-unreachable code that this audit spent real effort improving. Deleting them is
safe — nothing imports them — but it is a product decision about whether the drag variants are
meant to return.

## 20. Scroll performance: every source-side cause checked, none found

Since scrolling is the most likely referent of the owner's drag complaint (§19b) and the capture
path cannot measure it (§11), the remaining option was to eliminate the known source-level causes
of RN scroll jank. All are clean.

| cause | finding |
|---|---|
| `onScroll` handler calling `setState` per event | **one** `onScroll` in the whole app (`options.tsx:456`), no `setState`, `scrollEventThrottle={32}` |
| long unvirtualised lists | longest is 35 text-only digest cards (§11); `STOCKS` is 7, `COURSES` 12 |
| images decoding in list rows | **zero** `<Image>` on `digest`, `courses`, `home`, `league` |
| shadows/elevation per row | zero on digest/courses/league; 4 shadow refs on `home` |
| ambient animation load | **5 shared values total for 70 stars** — one `translateY` for drift, three shared twinkle phases, one glow opacity. The naive per-star implementation was deliberately avoided |
| per-frame JS during gesture | fixed in all four draggables — and all four are dormant anyway (§19) |

**So the source contains no scroll-performance defect**, and this audit cannot produce one by
measurement either, having proved the capture path reports the recorder's frame rate rather than
the app's during full-screen motion.

**The honest end state for the owner's drag report:** it is **unexplained**. Not dismissed — the
audit simply could not reproduce or locate it, and says so rather than pointing at the five
dormant-code fixes as though they answered it.

**One instrument settles it and this audit does not have it:** the React Native Perf Monitor
(dev menu → Show Perf Monitor) reports UI and JS thread FPS live on device. Ten seconds of
scrolling with it open distinguishes "the app is fine and the complaint is about something else"
from "there is real jank with a cause still to find." Everything above narrows where to look in
the second case.

## 21. The click-pop question, closed completely

The owner's other reported defect — *"whenever I click on something, it doesn't become huge and
become small"* — was traced to `onboarding-parts`' option row and fixed (measured on device:
355.7pt peak against 354pt resting, where the old pop reached ~381pt). This closes out every
remaining candidate.

| candidate | verdict |
|---|---|
| **`SpringPressable`** — the universal tappable wrapper, on every button and card | **not a cause.** Uses `Spring.snappy` (ζ=0.84) for press-in AND release. Its 0.8% overshoot applies to a 0.03 delta, so the release peaks at scale **1.0002** — invisible |
| **`Spring.bouncy`**, the spring that caused the original defect | **one live use left** (`onboarding-parts:242`), and the other two mentions are comments documenting the removal |
| that one use | drives `r: 5.5 * fill` — the selection dot's radius. ζ=0.72 overshoots 4%, so the dot reaches **5.72pt** before settling at 5.5pt: an overshoot of **0.22pt** |

**The 0.22pt overshoot is not the reported defect and needs no change.** This audit's own
headline established that amplitudes of 1–3% are below the visibility floor; 0.22pt on a 5.5pt
radius is 4% of a dot that is 11pt across. Removing it would flatten character for no perceptual
gain — and this audit has already retracted one attempt to "fix" an amplitude that turned out to
be fine.

**So the click-pop had exactly one visible source, and it is fixed and measured.** Unlike the
drag report (§19b), this one is fully resolved.

### Minor: `Spring.press` is a dead token

Used **0 times**. `SpringPressable` — the component it is named for — uses `Spring.snappy`
instead. Harmless, but it is a token whose name implies a contract nothing honours. Left in
place: removing it is a rename-adjacent change with no behavioural benefit.
