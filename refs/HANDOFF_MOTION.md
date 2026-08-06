# Finish the Euphoria motion research

You are a principal-level motion designer and design engineer. Continue an in-progress
engagement on Euphoria, a dark-theme finance-education iOS app (Expo SDK 57, RN 0.86,
Reanimated 4.5.0, react-native-svg, expo-router). Mascot is "Atlas" — four violet rings, large eyes.

## READ FIRST — this is the ground truth
`refs/MOTION_RESEARCH_V2.md`. It has the measured Tier-2 findings, the codebase audit,
a paste-ready tokens.ts, and five corrections to older docs. Do not re-derive any of it.
Then skim `refs/MOTION_RESEARCH.md` for the Apple spring table and Material 3 timings.

## DO NOT REDO — already settled
- Motion density measured: Brilliant 34.7%/39.3%, Duolingo 31.8%, Euphoria 2% (scroll-inflated, directional).
- Brilliant step transition = 467ms, flash peaks 67ms in, overshoot spring.
- Duolingo streak ignite = 3200ms, two-stage, white flash at ~1.9s.
- theme.ts surface ramp is ALREADY FIXED (4 tiers, 5 L-points apart). Brief's "problem 3" is stale.
- Haptics ARE wired app-wide. The old "no haptics" claim is false. Open question is apex-vs-start timing only.
- STAGGER_GAP is already 60, correctly in range. The "30ms" claim is stale.
- refs/README.md mislabels video 3 — it is DUOLINGO, not Brilliant.

## OPEN WORK, in priority order
1. Read `src/components/atlas.tsx` (500 ln) and `src/components/onboarding-parts.tsx` (637 ln).
   Deliver the **Atlas reaction map**: trigger -> beat -> ms, displacement, spring, deform-or-translate.
   Cover: idle, press, acknowledge, correct, incorrect, lesson complete, streak extended, level up, streak lost.
   No empty cells.
2. Deliver the **ranked implementation backlog** — effort S/M/L, files touched, acceptance test.
   Start from the three structural gaps already located:
   - LinearTransition = 0 uses anywhere -> `order-steps.tsx`, `sort-buckets.tsx` (the measured 2% cut)
   - withTiming 62 vs withSpring 39; 14 withSequence retarget-snap sites
   - FadeIn 22 vs FadeOut 4 — exits are missing app-wide
3. Answer remaining agenda: A2-A5, B1, B2, B4, B5, C3, C4, D2, D3, D4, E2, E3.

## MEASUREMENT — reuse, do not rebuild
Scripts exist. Copy them from the scratchpad into `scripts/` if not already there:
`motion_energy.py` (whole-clip burst finder), `measure.py` (per-window energy/luma/centroid +
automatic overshoot-vs-tween classification).
HARD LIMIT: `refs/videos/*.mov` are 30fps, downscaled. Every duration is +/-33ms. Do NOT claim
press timings (~100ms = 3 frames) from these clips. Pixels are authoritative; points are derived
from an unverified 390pt assumption.
Unmeasured and worth doing: Brilliant Streak Charge at ~41-50s in `13-12-29` (a prior window at
51.6-54.2s was mis-targeted and returned nothing).

## CONSTRAINTS
- Reanimated **v4** API names only. A v3 answer will not compile — that is a defect.
- **Zero budget.** Rive/Polymation/EAS/the $250 animator are all paid and OUT. The answer to
  "Rive vs Lottie vs hand-coded" is hand-coded: extend the existing `atlas.tsx`.
- `ecc:motion-*` skills are Framer Motion (web) and DO NOT APPLY. Use the Software Mansion
  Reanimated skills instead.
- Never fabricate a measurement. A labelled guess is fine; a fake observation is a defect.
- Every finding needs: a number, a source + tier, a confidence label, a falsification condition.

## COST DISCIPLINE
The prior session cost ~$22 and ran out of context. Budget hard: batch tool calls, prefer local
ffmpeg/grep measurement over web research (web search burned far more than the measurements did),
and write findings to disk as you go so nothing is lost to compaction.
