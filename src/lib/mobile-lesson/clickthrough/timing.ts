/**
 * Clickthrough timing: the measured constants every Atlas clip card shares, and the pure math on
 * them. One file so the four cards (stage, predict, build-up, place) run at one tempo and read as
 * one family, instead of four hand-tuned clocks drifting apart.
 *
 * WHERE THE NUMBERS COME FROM (research2/design.md section 2.0, frames in research2/frames/). The
 * first tempo was measured off Brilliant: 280ms per element, 450ms gaps, 1.5s beats, 2.5s builds.
 * On device the diagrams were over in one to three seconds, before a teen had followed them, so
 * the owner ruled (2026-09-24) that the learn-part visuals run longer. Every diagram motion below
 * now runs at CLIP_TEMPO (2x) the measured value, keeping the measured ratios between them.
 * Responses to the learner's own taps (TOKEN_*) and the check bar (BAR_IN, XP_AFTER) keep the
 * measured speed: feedback on a tap must feel instant however slowly a diagram draws.
 *   DRAW 560: one element drawing in, `Duration.base` x CLIP_TEMPO.
 *   GAP 700: the pause after a beat's motion before autoplay moves on.
 *   BEAT_MAX 3500: the longest one beat's motion may run. Past that a stepper reads as a video
 *     the learner is waiting on rather than a picture they are driving.
 *   BAR_IN 180, XP_AFTER 450: the check bar slides up in 180ms and the XP chip lands 450ms later
 *     as its own beat (brilliant/hi/correct_01.jpg).
 *   BUILD_MAX 5000: the whole self-assembling diagram, Hilbert's budget at CLIP_TEMPO.
 *
 * WHY THE VALUES ARE LITERALS AND NOT IMPORTED FROM shared/motion/tokens.ts. That file imports
 * Reanimated's Easing, and the clip pins import this file under plain node
 * (scripts/ts-resolve-hooks.mjs), where Reanimated cannot load. pixel-stage.tsx, which can import
 * both, throws in development if DRAW_MS ever differs from Duration.base x CLIP_TEMPO.
 */
import { READ_MS_PER_CHAR } from '../parts/scene';
import type { AtlasReaction, ClipBeat } from './types';

/** One diagram cell. Every clip rect is a whole number of these, so pixel edges land on whole points. */
export const CELL_PT = 4;

/** How much slower than the measured Brilliant tempo a clip diagram draws. */
export const CLIP_TEMPO = 2;
export const DRAW_MS = 560;
export const GAP_MS = 700;
export const BEAT_MAX_MS = 3500;
export const BAR_IN_MS = 180;
export const XP_AFTER_MS = 450;

/** Pictograph marks stamp in left to right this far apart (M1). */
export const STAMP_STAGGER_MS = 90;

/** Predict (M2): the true bar starts this long after Check, then grows over DRAW x 2.5. */
export const PREDICT_DELAY_MS = 300;
export const PREDICT_GROW_MS = DRAW_MS * 2.5;

/** Build-up (M3): a connector grows, then the node fills; piece k starts at k x BUILD_STEP_MS. */
export const BUILD_CONNECTOR_MS = 400;
export const BUILD_FILL_MS = DRAW_MS;
export const BUILD_STEP_MS = DRAW_MS + 340;
export const BUILD_MAX_PIECES = 5;
export const BUILD_MAX_MS = 5000;

/** Place (M4): a picked token lifts, a placed one travels, and verdicts land left to right. */
export const TOKEN_LIFT_PT = 4;
export const TOKEN_LIFT_MS = 120;
export const TOKEN_MOVE_MS = 220;
export const VERDICT_STAGGER_MS = 120;

/** When piece k of a build starts. Piece 0 has no connector to grow. */
export function buildStartMs(k: number): number {
  return k * BUILD_STEP_MS;
}

/**
 * How long a build of `n` pieces runs, end to end. The build-up pin (L3,
 * scripts/clickthrough-buildup-pin.mjs) is to assert this is at most BUILD_MAX_MS for
 * BUILD_MAX_PIECES; raising the cap to 7 makes it 6,360ms and that assertion fails,
 * which is the point of computing it here rather than in the card.
 */
export function buildTotalMs(n: number): number {
  if (n <= 0) return 0;
  if (n === 1) return BUILD_FILL_MS;
  return buildStartMs(n - 1) + BUILD_CONNECTOR_MS + BUILD_FILL_MS;
}

/** A pictograph row of `marks` marks: the stagger, then the last mark's own draw. */
export function stampMotionMs(marks: number): number {
  return Math.max(0, marks - 1) * STAMP_STAGGER_MS + DRAW_MS;
}

/**
 * Cells for a magnitude on a span of `spanCells`, against the largest magnitude on the diagram.
 *
 * Monotonic in `value` (a bigger authored value is never drawn shorter), and any positive value
 * gets at least one cell: rounding a small bar to zero would draw an authored figure as absent,
 * the same lie as drawing it wrong (CONSTITUTION 3.1).
 */
export function cellsFor(value: number, max: number, spanCells: number): number {
  if (!(value > 0) || !(max > 0) || spanCells <= 0) return 0;
  const cells = Math.round((Math.min(value, max) / max) * spanCells);
  return Math.max(1, Math.min(spanCells, cells));
}

/** The largest whole-cell span that fits `pt` points. */
export function cellsIn(pt: number): number {
  return Math.max(0, Math.floor(pt / CELL_PT));
}

/** A beat's motion, clamped to BEAT_MAX_MS so one slow beat cannot turn a stepper into a video. */
export function beatMotionMs(beat: ClipBeat): number {
  return Math.max(0, Math.min(BEAT_MAX_MS, beat.motionMs));
}

/**
 * How long autoplay holds a beat: its motion plus the gap, or the reading time of its caption,
 * whichever is longer. Reading time uses scene.ts's rate so a scene and a clip never disagree about
 * how fast a teen reads; without it a 120-character caption would leave after under two seconds.
 */
export function beatHoldMs(beat: ClipBeat): number {
  return Math.max(beatMotionMs(beat) + GAP_MS, READ_MS_PER_CHAR * beat.caption.length);
}

/** The Atlas reaction for beat `k` of `total`: the author's, or point, and celebrate on the last. */
export function reactionFor(beat: ClipBeat, k: number, total: number): AtlasReaction {
  if (beat.reaction) return beat.reaction;
  return k >= total - 1 ? 'celebrate' : 'point';
}
