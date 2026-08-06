# The goal this work runs against

Written with `ecc:loop-design-check`. Replaces "make every screen beautiful", which is a correct
platitude (failure mode #1) and is fully satisfiable by writing spec files (failure mode #3).

## The honest problem this fixes

At the time of writing: **4 spec documents, 2 code changes.** Spec files feel like progress,
cost little, and require no device. A goal denominated in "screens covered" rewards exactly that
drift. This goal is denominated in **shipped, measured change**.

## Red line — what is NOT mine to decide

**Beauty is not machine-decidable and is not claimed here.** This goal delivers *measured
defect-freedom plus evidenced design change*. Whether the result is beautiful is the user's call,
and the "done" cell is flipped by the user, never by me. Same for copy, pricing, naming, offer
content and visual direction — those are taste; on hitting one, **stop and ask**.

## DONE-CRITERION — per screen, all five, machine-verifiable

A screen counts as done only when every one of these holds:

1. `npx tsc --noEmit` exits 0.
2. `npx expo lint` reports **zero errors and zero warnings in the touched files** (repo-wide
   pre-existing issues are out of scope and must be named, not absorbed).
3a. **(every screen)** The screen is measured against all five external anchors below, and every
   defect found is fixed. A screen with no defect passes 3a with the measurement showing zero.
3b. **(every fix)** A **device measurement** exists, produced by a named script, recorded as
   before → after numbers, moving in the direction predicted *before* the change.

   Split approved by the user. 3 previously gated *fixes* but was applied to *screens*, making it
   unsatisfiable for any clean screen. No threshold changed and nothing was weakened — only the
   scope was corrected to what it always meant.
4. `./scripts/sim.sh screen` for that route shows **zero unlabelled interactive elements**.
5. A commit exists whose diff touches `src/`.

Criterion 5 is the anti-Goodhart clause. **A commit touching only `refs/**` scores zero.**

## BOUNDARY — what it must NOT do

1. **Never weaken the verifier.** No widening a hue band, lowering a contrast threshold, relaxing
   a measurement window, or deleting an a11y label to make a check pass. If the number does not
   move, revert the change — do not tune the measurement.
2. **Never invent a hex.** Every colour must already exist in `theme.ts`, `COURSE_ACCENTS`, or be
   a documented hue-rotation of one (see `hero-tint.ts`).
3. **Never promote UNVERIFIED to VERIFIED** without showing the command output that did it.
4. **Never count a spec as a fix.** Specs are inputs to work, not the work.
5. **Never touch copy, pricing, naming or offer content.** Escalate.
6. **Never claim a screen is done on a still.** Motion needs `motion_energy.py`; colour needs a
   measured band; layout needs the a11y tree with coordinates.

## RECONCILIATION, not self-assertion

Anchor every done-check to a fact outside my own judgement:

| check | external anchor |
|---|---|
| content brand hue | ≤35%, ≥8 hue buckets — the Brilliant segmentation, `MOTION_RESEARCH_V3.md` §D2 |
| touch target | 44pt, Apple HIG |
| text contrast | 4.5:1, WCAG AA |
| lineHeight : fontSize | ≥1.2, and never 1.0 (the `before-after-slider.tsx` clipping defect) |
| frames animating | Brilliant 34.7–39.3%, Duolingo 31.8%, CFR 30fps only |

"tsc passes" is gameable. "Markets content band violet went 37.4% → 5.1% against a ≤35% target"
is not.

## FAILURE FALLBACK

- **2 failed device verifications on the same screen → stop, report, ask.** No third guess.
- Any measurement moving the wrong way → **revert**, report the number, do not re-tune.
- Any taste call → stop, ask.
- Deep link or tooling failing twice → report the tooling defect as a finding; do not work around
  it silently. (`sim.sh open "onboarding?step=11"` already failed this way and is logged.)

## LAYERED

- **L1, per screen** — the five done-criteria above.
- **L2, per batch** — `src/` commits must be **≥** `refs/`-only commits. If specs outpace ships,
  stop speccing and ship.
- **L3, overall** — the ranked route list is exhausted, highest-traffic first: home · learn ·
  lesson · digest · you · trade · courses · settings · league · friends · games · stock ·
  explore/compound · welcome · auth · start · index. Dev routes (art-test, atlas-test, dev-beat,
  dev-gallery) are last and explicitly lower value.

## JUDGE INDEPENDENCE — the known weakness

I am both builder and judge here, which the skill correctly says always inflates. The mitigation
is that **the judge is the command output, not my reading of it**: an exit code, a lint count, a
measured percentage, a contrast ratio. Where no deterministic check exists, the honest move is to
mark it UNVERIFIED and say so — as was done for the `notifyOptIn` carve-out, which is verified in
source and explicitly *not* verified on device.

## STOP CONDITIONS

Stop and hand back when any of: L3 exhausted · two failures on one screen · a taste call · a
tooling defect that blocks verification · the L2 ratio inverts.
