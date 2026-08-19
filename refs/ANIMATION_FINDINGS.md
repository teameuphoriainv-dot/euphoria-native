# How Euphoria's animation actually looks — measured

Written 2026-08-19 to answer one question: *what is the real state of motion in this app?* The
owner's report was that animation fixes "either stay the same or get worse," which is a symptom
of fixing the wrong variable. This is the diagnosis.

Everything below is measured off a 15,329-frame, 48fps recording of the running app plus direct
reads of `atlas.tsx`. Where a number is not trustworthy, it says so.

---

## The finding, in one line

**The app's sense of life comes from a background layer, not from its content. The content
animations are real, well-built, correctly guarded — and 1–3% in amplitude, which is at or below
what a person can see.**

That is why tuning easing curves changed nothing. The curve was never the problem.

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

1. **Raise amplitude before touching easing.** A spring's damping is invisible when the travel is
   1pt. This is the change the owner's previous prompts were reaching for.
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
