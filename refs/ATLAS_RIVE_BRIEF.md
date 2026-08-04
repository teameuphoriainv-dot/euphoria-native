# Atlas — Rive animation brief

Everything an animator needs, in the order RiveAnimator asks for it. Paste the block at the
bottom into WhatsApp; attach `refs/atlas-mark-source.svg` and a screenshot of the app.

Rate reference (from riveanimator.com, Aug 2026): mascot/character **from $250**, animated icons
$50 each or $200 for 5, UI micro-interactions from $350. React Native handoff docs included.
**No revision policy is stated on the site — agree one before paying.**

---

## What we already have, and why the existing .riv is dead

`assets/atlas.riv` exists and must NOT be used as a starting point. It wraps
`atlas-logo.png` — the raster mark the app deliberately replaced with vector — with oversized eyes
bolted on top. It has flat fill instead of the measured gradient, a blurry drop shadow instead of
the crisp rim, and a muddy weave. Treat it as deleted.

What IS good and should be kept:

- `rive-react-native ^9.8.5` is installed.
- `src/components/atlas-rive.tsx` already loads a `.riv` via Expo Asset and fires state-machine
  inputs. **A correct `.riv` drops in with no integration work.**
- `src/app/atlas-test.tsx` is a smoke-test route that fires the `celebrate` trigger.

So the deliverable is an asset, not an integration.

## The character

Atlas is four interlocking violet rings — a pinwheel — with a pair of large expressive eyes above.

Vector source: **`refs/atlas-mark-source.svg`** (the mark). The face lives in
`src/components/atlas.tsx` and is drawn above the mark; screenshot the running app for reference,
or ask us to export it.

### Geometry (measured, not eyeballed)

Fitted by parameter sweep against the original artwork's own alpha mask to **IoU 0.951**.

| | |
|---|---|
| Design space | viewBox `100 x 104` |
| Ring centres | (53.86, 75.3) · (29.32, 56.47) · (48.15, 31.92) · (72.7, 50.76) |
| Orbit / spacing | 21.88 radius, 90° apart, 82.5° pinwheel tilt |
| Ring mid-radius | 15.53 |
| Band width | 14.72 (this is the artwork's FULL extent, rim included) |
| Rim width | 1.21 each side, so violet is inset to 12.3 |

### Colour

| | |
|---|---|
| Lit face | `#DEA5F5` |
| Shaded face | `#A855EB` (brand violet) |
| Rim | `#F0EEF4` |
| Measured median | `#C37DE7` — the lit/shaded pair must average to this or the mark reads pale |

### The two things that go wrong

1. **The mark is WOVEN, not stacked.** Each ring passes over one neighbour and under the other.
   Paint order 3,2,1,0 gets three crossings; the fourth is a cycle and needs ring 3 redrawn clipped
   to ring 0's outer disc (r 22.89). The SVG shows this exactly.
2. **The rim spans the full band, violet is inset inside it.** Drawing violet across the whole band
   and adding rim outside makes the mark 2×rim too large and shrinks every hole.

## What we need animated

A **guide-finished celebration** for the Digest reader — the payoff when someone finishes a
2-minute article. It must feel earned but stay QUIETER than our full lesson celebration, which has
a screen wipe, confetti and an oversized arrival. This one sits below that.

### Required state machine

Names must match `atlas-rive.tsx` as written:

- Artboard: `Atlas`
- State machine: `State Machine 1`
- States: `Idle` (looping, breathing/blink) and `Celebrate`
- Trigger input: `celebrate`

Nice to have if in budget: a `proud` state, and a `blink` that fires on a random interval.

### Hard requirements

- **VECTOR ONLY. No embedded raster of any kind.** This is what killed the current file.
- Must read at **38, 56, 72, 104 and 132 pt** — it is used at all of these.
- Dark UI only. Background is near-black `#0B0910`; nothing may rely on a light backdrop.
- Eyes proportionate and seated in the mark, not floating above it.
- Organised, named states and inputs, plus implementation notes.

## Platform

Expo SDK 57 / React Native, `rive-react-native`, iOS first.

---

## Message to send

> Hi — I need a mascot celebration animation in Rive for a finance-education app.
>
> **Product:** Euphoria, an iOS finance-learning app (Expo / React Native).
> **Character:** "Atlas" — four interlocking violet rings forming a pinwheel, with large expressive
> eyes. I'll attach the vector source as SVG plus screenshots.
> **What I need:** a guide-finished celebration. Should feel rewarding but restrained — it's the
> payoff for a 2-minute read, and it needs to sit below our full lesson celebration in intensity.
> **States:** artboard `Atlas`, state machine `State Machine 1`, states `Idle` (looping, with
> breathing + blink) and `Celebrate`, trigger input `celebrate`. A `proud` state too if it fits.
> **Hard requirement:** vector only, no embedded raster. It renders from 38pt to 132pt and must
> stay crisp at all of them. Dark UI, near-black background.
> **Platform:** React Native via rive-react-native, iOS first.
> **Budget:** your mascot tier. **Deadline:** [FILL IN]
>
> Two questions before I book: what's your revision policy, and can you work from the SVG source
> plus our colour/geometry spec? I have exact measured values for ring positions, band widths and
> the gradient stops.
