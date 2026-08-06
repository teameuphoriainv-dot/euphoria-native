# Reward & verdict beats — measured

Session 2026-08-06. **Merge into `MOTION_RESEARCH_V2.md` §2 when session A is finished** — written
to a separate file deliberately to avoid a concurrent-write collision.

Method: `scripts/measure.py`. Source clips are **30fps** → every duration **±33ms**. Pixels
authoritative; point conversion assumes 390pt logical width and is **unverified**.

---

## 1. Brilliant — Streak Charge, `13-12-29` @ 41.0–44.5s

**There is no starburst flash.** Luma delta **4.9** — flat. What looked like a white starburst in a
contact sheet is a **static illustration**, not an animated flash. Correcting my own earlier
assumption.

| Frames | Behaviour |
|---|---|
| 2–9 | Entrance burst, **267ms**, monotonic decay after peak (20.6→19.7→18.4→14.0→10.6) → **ease-out, NOT spring** |
| 10–28 | **633ms dead-still** (`d_prev` 0.0) |
| 29, 38 | Two isolated single-frame changes |
| 39–74 | **1200ms dead-still** |
| 75–90 | ~500ms decay tail |

Of a 3433ms window, well under half contains any motion at all.

## 2. The cross-app finding — two valid reward strategies

| | Duolingo | Brilliant |
|---|---|---|
| Earned moment | **Animated**: 3200ms, two-stage | **Held still**: static art, long holds |
| Flash | Yes — luma **25.9 → 207.5** | **None** — luma delta 4.9 |
| Entrance curve | spring, overshoot | **ease-out, 267ms** |
| Longest dead hold | 967ms (verdict) | **1200ms** (reward screen) |

**Both ship at the craft level Euphoria is chasing.** So "add more motion" is **not** the universal
answer. Brilliant's reward screens are deliberately quiet, and its 34.7%/39.3% motion-density
figures are carried by **scrolling**, not by its reward beats. Do not read those percentages as a
target for reward screens.

## 3. What this corroborates

Both apps **buy legibility with stillness**:

- Duolingo holds a verdict **967ms** with literally zero pixel change
- Brilliant holds a reward screen **1200ms**

Combined with the B5 verdict finding (neither app slides its verdict in; both reach full presence
in ≤33ms), the rule is:

> **Motion announces the transition. Stillness delivers the content.**
> Springs are for transitions (467ms) and Duolingo-style rewards (3200ms). Verdicts and reward
> *screens* get ease-out entrances and then hold.

An instinct to animate everything would make both of these screens worse. This is the direct
counterweight to Euphoria's 2%-frames problem: the fix is **motion in the right places**, not
uniformly more.

## 4. Implications for Euphoria

- The correct/incorrect banner should **not** get a 300ms spring entrance. Ease-out ≤200ms, then
  **hold ~950ms** before Continue becomes live.
- Reward screens: pick a lane. Duolingo-style animated 3200ms two-stage, **or** Brilliant-style
  static art with a 267ms ease-out entrance and a long hold. Mixing both reads as indecision.
- `Duration.earned: 3200` is correct for the Duolingo lane. A Brilliant-lane token would be
  ~`{ enter: 267, hold: 1200 }`.

## 5. Brilliant Incorrect sheet — full timeline (tail now measured)

`10-50-24` @ 67.4–70.4s. This **corrects §3's implication that no spring is involved.**

| Frame | t | Event |
|---|---|---|
| 4 | 0ms | Sheet appears — **1 frame**, centroid → 882/960 (bottom 8%) |
| 5–11 | ~270ms | Near-static pause |
| 12–21 | **333ms** | **Damped oscillation 837 → 893 → 852**, overshoot ~41px past rest = **spring** |
| 22–40 | **633ms** | Dead-still hold |
| 41 | — | Screen change, centroid 847 → 452 |

**Total verdict lifetime: 1233ms.**

**The refinement:** the *entrance* is still ≤33ms with no spring — that holds. But a spring fires
**~270ms after the sheet lands**, on a secondary element. It is a **follow-through beat, not an
entrance beat.**

> This is also the best answer to **A3 (follow-through / overlapping action)** in the whole
> engagement: **~270ms measured lag** between primary arrival and secondary settle, in a shipped app.

## 6. The convergence — strongest result in the engagement

| App | Verdict type | Hold |
|---|---|---|
| Duolingo | correct | **967ms** |
| Brilliant | incorrect | **1233ms** |

Two independent apps, opposite verdict types, both at **roughly one second**. Treat
**~1000ms ± 150ms** as the design constant for Euphoria's verdict hold.

**Revised B5 spec:**
```
verdict entrance   <=33ms      no spring, no slide
secondary settle   +270ms lag, 333ms spring, small overshoot
hold               ~1000ms     dead still
exit               367ms       ease-out (Duolingo-measured)
```

## 7. Unverified / open

- Whether Brilliant's Streak Charge has an animated beat **outside** 41.0–44.5s. Highest-energy
  moment in that clip was 51.77–52.90s (peak 43.5) and remains unexplained.
- At 30fps a hard cut and a sub-33ms animation are **indistinguishable**. The falsifiable claim is
  only the negative: no 200–400ms spring entrance on verdict UI in either app.
- **The 21 stills in `refs/images/` have never been systematically read**, and only ~6 windows
  across the 3 clips have been frame-measured. See the sweep task in `HANDOFF_MOTION_V2.md`.
