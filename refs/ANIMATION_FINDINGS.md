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
