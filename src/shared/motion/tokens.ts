/**
 * Euphoria motion tokens.
 *
 * Spring values are Apple's response / damping-ratio pairs converted to Reanimated's
 * stiffness+damping form (conversion table in refs/MOTION_RESEARCH.md). Durations marked
 * MEASURED come from frame-differencing the competitor captures in refs/videos/ — see
 * refs/MOTION_RESEARCH_V2.md §2 for the method and its ±33ms limit (the clips are 30fps, so
 * nothing shorter than ~100ms can be claimed from them).
 *
 * ON MERGING: research v2 proposed replacing this file wholesale. That block dropped
 * `Duration.fast` (8 call sites), `Duration.slow` (2), `Ease.out` (2) and `Ease.outCubic` (2) —
 * pasting it would have broken 14 references. The measured additions are merged in; every
 * in-use member is kept.
 */
import { Easing } from 'react-native-reanimated';

export const Spring = {
  /** Press. Apple response 0.25 / ζ 1.0 — critically damped on purpose: wobble on a ~100ms
   *  beat reads as lag rather than life. */
  press: { stiffness: 632, damping: 50, mass: 1 },
  /** Default UI settle. Apple response 0.50 / ζ 0.85. */
  snappy: { stiffness: 158, damping: 21, mass: 1 },
  /** No overshoot — sheets and nav, where an overshoot reads as a bug. Apple 0.50 / ζ 1.0. */
  smooth: { stiffness: 158, damping: 25, mass: 1 },
  /** Playful overshoot: mascot, selection. Apple 0.50 / ζ 0.70. damping 18 sits inside
   *  Brilliant's MEASURED 12–18 overshoot band. */
  bouncy: { stiffness: 158, damping: 18, mass: 1 },
  /** Reward pop. Apple 0.35 / ζ 0.55. */
  reward: { stiffness: 322, damping: 20, mass: 1 },
  /** Large mass arriving, e.g. the AtlasStage descend. */
  gentle: { stiffness: 180, damping: 26, mass: 1 },
} as const;

export const Duration = {
  /** On-screen state change (colour/opacity). Below ~100ms reads as a cut, not a transition. */
  instant: 100,
  /** Retained: 8 call sites. Sits between `instant` and `base`. */
  fast: 150,
  /** Exit. M3 emphasized-accelerate is 150–200ms; an exit runs ≈0.6–0.7× its enter. */
  exit: 180,
  /** Default enter. */
  base: 280,
  /** Retained: 2 call sites. */
  slow: 400,
  /** Screen / step transition. MEASURED: Brilliant's light-tunnel transition = 467ms. */
  screen: 460,
  /**
   * HALF of a looping pulse, so the full cycle is one second.
   *
   * Not a transition, which is why it does not sit on the enter/exit scale: the typing dots in
   * chat.tsx run withRepeat(withSequence(up, down)) and the WEB tutor's dots breathe once a
   * second. 500 is that parity value, and it is the one duration in the app that is answerable
   * to another platform rather than to this one's motion language.
   *
   * It exists as a token because the alternative is what happened on 2026-09-20: a sweep putting
   * every literal on the scale found no exact match, rounded to Duration.screen (460), and
   * quietly turned a one-second pulse into a 920ms one. A value with nowhere to live gets
   * rounded; a named value does not.
   */
  pulse: 500,
  /** Number roll-up. */
  count: 900,
  /** An EARNED moment. MEASURED: Duolingo's streak ignite runs 3200ms and is two-stage —
   *  build → burn → burst → white flash → resolve. Nothing in this app currently exceeds
   *  400ms, and that structural gap, not spring tuning, is why payoffs do not land. */
  earned: 3200,
} as const;

export const Ease = {
  /** M3 emphasized-decelerate — entrances. */
  enter: Easing.bezier(0.05, 0.7, 0.1, 1),
  /** M3 emphasized-accelerate — exits. Named `exitCurve` because `Duration.exit` already
   *  exists and a bare `Ease.exit` next to it reads as the same thing. */
  exitCurve: Easing.bezier(0.3, 0, 0.8, 0.15),
  /** Standard — on-screen state changes. */
  inOut: Easing.bezier(0.4, 0, 0.2, 1),
  /** Retained: 2 call sites. */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** Retained: 2 call sites. */
  outCubic: Easing.out(Easing.cubic),
} as const;

/** Sibling stagger. 50–80ms is the shipped range across the reference apps. */
export const STAGGER_GAP = 60;
/** Cap the cascade so a long list's tail never drags behind the user. */
export const STAGGER_CAP = 360;
