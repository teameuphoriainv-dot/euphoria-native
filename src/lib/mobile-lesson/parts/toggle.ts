/**
 * Toggle: one pixel picture with two or three states the learner switches between with big chips.
 * Labels are pinned on the art, and each state's caption says what the change means. This is the
 * "tap and watch it change" explanation (Brilliant's guided interaction, research.json): one small
 * thing to do, then see the consequence, never a puzzle to solve before it has been shown.
 * The renderer is components/mobile-lesson/parts/toggle-scene-card.tsx.
 *
 * SAY IT ONCE (CONSTITUTION 5.1). Labels on the picture carry the figures; the caption carries the
 * meaning. A state's title, caption, labels and footer never repeat a money figure (the native lesson
 * pin checks it per state).
 *
 * THE STRIP is the one piece of data geometry: equal tiles standing on the ground, one of them the
 * learner's. A state sets their height and they tween from wherever they are, monotonically, never
 * redrawn from zero. A tile's height is its value: checkToggle holds every labelled figure in
 * proportion to its tile (12 / 10 = 120 / 100), so the picture never disagrees with the words.
 * Dashed outlines (`ghostUp`, `ghostDown`) show what a tile COULD become; nothing moves like a price
 * that does not exist (AGENTS.md).
 *
 * Pure: no React Native imports, so a pin can load it under plain node.
 */
import type { StoryArt } from '../../pixel/stories/types';
import { BEAT_MOTION_MAX_MS } from './scene';
import {
  artIdsOf,
  castMotionMs,
  castRestAt,
  checkCast,
  checkLabel,
  cueEndMs,
  cueStartMs,
  FRAME_FADE_MS,
  LABEL_IN_MS,
  STORY_A11Y_MAX,
  STORY_TITLE_MAX,
  type ActorRest,
  type ScenePoint,
  type StoryCue,
  type StoryLabel,
} from './story';

export interface ToggleStrip {
  /** Bottom-left of tile 0, in scene pixels: tiles stand on this line. */
  at: ScenePoint;
  /** Tiles (10 for "10 equal pieces"). */
  count: number;
  /** The learner's tile, drawn in LessonColors.accent; the rest in CLIP_MUTED. */
  mine: number;
  tileW: number;
  gap: number;
  /** The height that stands for the starting value (10 = $100). */
  restH: number;
}

export type ToggleStripState = { h: number; ghostUp?: number; ghostDown?: number };

export interface ToggleState {
  /** At most 16. */
  chip: string;
  /** StoryArt frame id; a frame different from the last state's crossfades. */
  frame: string;
  /** At most 110; the box reserves 4 lines so nothing jumps between states. */
  caption: string;
  /** At most 160: the stage's VoiceOver label in this state. */
  a11y: string;
  /** At most 4. */
  labels?: StoryLabel[];
  /** Played on entering this state; actors that stay are listed with `instant: true`. */
  cast?: StoryCue[];
  /** null hides the strip; undefined keeps it at restH. Heights tween monotonically. */
  strip?: ToggleStripState | null;
}

export interface ToggleSpec {
  kind: 'toggle';
  /** At most 42. */
  title: string;
  artKey: string;
  /** At most 90, always visible: the source line or the "Example ..." line. */
  footer: string;
  strip?: ToggleStrip;
  /** 2 or 3. states[0] shows on arrival and counts as seen. */
  states: ToggleState[];
}

/** The toggle card draws no Atlas; the lesson hides its floating one so it never covers a chip. */
export const TOGGLE_HIDES_FLOAT = true;

export const TOGGLE_MIN_STATES = 2;
export const TOGGLE_MAX_STATES = 3;
export const TOGGLE_CHIP_MAX = 16;
export const TOGGLE_CAPTION_MAX = 110;
export const TOGGLE_FOOTER_MAX = 90;
export const TOGGLE_LABELS_MAX = 4;
/** Tiles tween to a new height over this long, on a monotonic curve. */
export const STRIP_MS = 400;

/** The strip as state `i` shows it, or null when it is hidden. */
export function stripOf(spec: ToggleSpec, i: number): ToggleStripState | null {
  if (!spec.strip) return null;
  const s = spec.states[i]?.strip;
  if (s === null) return null;
  return s ?? { h: spec.strip.restH };
}

/** What state `i` looks like once its motion has landed: the picture Reduce Motion and Back cut to. */
export function toggleRestAt(
  spec: ToggleSpec,
  i: number,
): { frame: string; actors: Record<string, ActorRest>; strip: ToggleStripState | null; labels: StoryLabel[] } {
  const state = spec.states[i];
  return {
    frame: state?.frame ?? '',
    actors: castRestAt(state?.cast),
    strip: stripOf(spec, i),
    labels: state?.labels ?? [],
  };
}

/** The lower dashed outline arrives this long after the upper one, with its own arrow. */
export const GHOST_STAGGER_MS = 500;
/** A dashed outline fades in over this long. */
export const OUTLINE_IN_MS = 200;

export type ToggleTimes = {
  /** Every cue has landed. */
  castEnd: number;
  /** The tiles start to tween, and stop (equal when their height does not change). */
  stripAt: number;
  stripEnd: number;
  /** The dashed outlines fade in (-1: this state has none). */
  ghostUpAt: number;
  ghostDownAt: number;
  /** Labels start to fade in. */
  labelsAt: number;
  /** Everything, labels included, has landed: the state counts as seen. */
  total: number;
};

export type ToggleTimingOpts = {
  /** The previous state drew a different frame, so the picture crossfades first. */
  frameChanged?: boolean;
  /** The tiles change height on entering this state. */
  stripMoves?: boolean;
  /**
   * The state is arriving with its card (not chosen by a chip), so its cast was pushed back by
   * ARRIVAL_DELAY_MS. That pause is the card fading in, not an authored lead-in, so the labels still
   * wait for the motion.
   */
  arrival?: boolean;
  art?: StoryArt | null;
};

/**
 * A state that arrives with its card waits this long before it moves. The deck fades a card in after
 * the last one leaves (100 + 100 + 200ms in card-deck.tsx) and a new step fades in as well, so a coin
 * authored to move at 0ms finished while the card was still invisible: on the simulator the first
 * frame already had the coin at the counter and the learner never saw Maya hand it over (2026-10-13).
 */
export const ARRIVAL_DELAY_MS = 500;

/** The state with every moving cue pushed `ms` later; instant cues (actors already there) stay put. */
export function delayedState(state: ToggleState, ms: number): ToggleState {
  if (ms <= 0 || !state.cast) return state;
  return { ...state, cast: state.cast.map((c) => (c.instant ? c : { ...c, atMs: (c.atMs ?? 0) + ms })) };
}

/**
 * When each part of a state change happens.
 *
 * ORDER IS CAUSE, THEN EFFECT. A new frame crossfades first (the rain arrives), the cast acts (the
 * customers walk in), then the tiles tween, then the labels name the result. A label that changed
 * before the picture would state a figure for a picture not yet showing it.
 *
 * Tiles that keep their height do not wait for the cast: there is no effect to hold back. Their
 * dashed outlines (what a tile could become) arrive once the picture has, the lower one
 * GHOST_STAGGER_MS after the upper, the same half-second the cast's two arrows are authored apart.
 *
 * ONE EXCEPTION, THE LEAD-IN. When the frame stays and nothing moves for the first 400ms (the cast
 * authored a pause with `atMs`), the labels change in that pause. That is the tickets toggle: the
 * price on the board goes up, and then a ticket goes grey because of it. Waiting until after the
 * ghost would show the effect before its cause.
 */
export function toggleTimes(state: ToggleState, opts: ToggleTimingOpts = {}): ToggleTimes {
  const cast = state.cast ?? [];
  const art = opts.art ?? null;
  const castEnd = castMotionMs(cast, art);
  const moving = cast.filter((c) => !c.instant);
  const arrivals = moving.filter((c) => c.do !== 'exit').reduce((m, c) => Math.max(m, cueEndMs(c, art)), 0);
  const firstMove = moving.reduce((m, c) => Math.min(m, cueStartMs(c)), Number.POSITIVE_INFINITY);
  const floor = opts.frameChanged ? FRAME_FADE_MS : 0;
  const strip = state.strip ?? null;
  const moves = !!strip && !!opts.stripMoves;
  const stripAt = !strip ? 0 : moves ? Math.max(arrivals, floor) : floor;
  const ghostUpAt = strip?.ghostUp !== undefined ? stripAt : -1;
  const ghostDownAt = strip?.ghostDown !== undefined ? stripAt + (ghostUpAt >= 0 ? GHOST_STAGGER_MS : 0) : -1;
  const outlinesEnd = Math.max(ghostUpAt, ghostDownAt) >= 0 ? Math.max(ghostUpAt, ghostDownAt) + OUTLINE_IN_MS : 0;
  const stripEnd = Math.max(moves ? stripAt + STRIP_MS : stripAt, outlinesEnd);
  const lead = !opts.arrival && !opts.frameChanged && !moves && firstMove >= LABEL_IN_MS * 2;
  const labelsAt = lead ? 0 : Math.max(castEnd, stripEnd, floor);
  const labelsEnd = (state.labels?.length ?? 0) > 0 ? labelsAt + LABEL_IN_MS : labelsAt;
  return { castEnd, stripAt, stripEnd, ghostUpAt, ghostDownAt, labelsAt, total: Math.max(castEnd, stripEnd, floor, labelsEnd) };
}

/** How long entering a state moves for. With one argument: same frame, tiles holding still. */
export function toggleMotionMs(state: ToggleState, opts: ToggleTimingOpts = {}): number {
  return toggleTimes(state, opts).total;
}

/**
 * When the learner's tile lights up in state `i`, or -1 for "lit from the start".
 *
 * "Maya buys 1 piece" is the moment her coin lands in her tile, so a state whose cast drops
 * something into the learner's tile lights it then, crossfading from the others' colour. Lit from
 * the start, the tile would already be hers before she paid, which says the opposite.
 */
export function mineLightMs(spec: ToggleSpec, i: number, art?: StoryArt | null): number {
  const strip = spec.strip;
  const shown = stripOf(spec, i);
  if (!strip || !shown) return -1;
  const x0 = strip.at.x + strip.mine * (strip.tileW + strip.gap);
  const top = strip.at.y - shown.h;
  let at = -1;
  for (const c of spec.states[i]?.cast ?? []) {
    if (c.instant || c.do === 'exit' || !c.at) continue;
    const inside = c.at.x >= x0 && c.at.x < x0 + strip.tileW && c.at.y >= top && c.at.y < strip.at.y;
    if (inside && (at < 0 || cueEndMs(c, art) < at)) at = cueEndMs(c, art);
  }
  return at;
}

/** Every sentence this card puts on screen, for a deck's say-it-once check. */
export function textOf(spec: ToggleSpec): string[] {
  return [
    spec.title,
    spec.footer,
    ...spec.states.map((s) => s.chip),
    ...spec.states.map((s) => s.caption),
    ...spec.states.flatMap((s) => (s.labels ?? []).map((l) => l.text)),
  ];
}

const DASH = /[\u2013\u2014]/;
const DOLLARS = /\$(\d[\d,]*(?:\.\d+)?)/;

/** Every rule the toggle card relies on. Returns the problems; an empty list is a pass. */
export function checkToggle(spec: ToggleSpec, art?: StoryArt | null): string[] {
  const bad: string[] = [];
  if (spec.kind !== 'toggle') bad.push('kind is not toggle');
  if (spec.title.length > STORY_TITLE_MAX) bad.push(`title over ${String(STORY_TITLE_MAX)}`);
  if (spec.footer.length > TOGGLE_FOOTER_MAX) bad.push(`footer over ${String(TOGGLE_FOOTER_MAX)}`);
  if (spec.states.length < TOGGLE_MIN_STATES || spec.states.length > TOGGLE_MAX_STATES) {
    bad.push(`${String(spec.states.length)} states; a toggle has ${String(TOGGLE_MIN_STATES)} or ${String(TOGGLE_MAX_STATES)}`);
  }
  const chips = spec.states.map((s) => s.chip);
  if (new Set(chips).size !== chips.length) bad.push('two chips share a label');
  for (const s of textOf(spec)) if (DASH.test(s)) bad.push(`"${s.slice(0, 40)}" has a dash`);
  if (spec.strip) {
    const { count, mine, tileW, restH, at } = spec.strip;
    if (!(count >= 1 && mine >= 0 && mine < count && tileW >= 1 && restH >= 1)) bad.push('strip: bad count, mine, tileW or restH');
    const right = at.x + count * tileW + (count - 1) * spec.strip.gap;
    if (at.x < 0 || right > 80 || at.y > 60) bad.push('strip: tiles leave the canvas');
  }

  // A tile's height is its value: every labelled figure stays in proportion to its tile.
  let perPixel: number | null = null;
  spec.states.forEach((s, i) => {
    const where = `state ${String(i + 1)} (${s.chip})`;
    if (s.chip.length > TOGGLE_CHIP_MAX) bad.push(`${where}: chip over ${String(TOGGLE_CHIP_MAX)}`);
    if (s.caption.length > TOGGLE_CAPTION_MAX) bad.push(`${where}: caption over ${String(TOGGLE_CAPTION_MAX)}`);
    if (s.a11y.length > STORY_A11Y_MAX) bad.push(`${where}: a11y over ${String(STORY_A11Y_MAX)}`);
    if (DASH.test(s.a11y)) bad.push(`${where}: a11y has a dash`);
    if ((s.labels?.length ?? 0) > TOGGLE_LABELS_MAX) bad.push(`${where}: more than ${String(TOGGLE_LABELS_MAX)} labels`);
    const ids = (s.labels ?? []).map((l) => l.id);
    if (new Set(ids).size !== ids.length) bad.push(`${where}: two labels share an id`);
    for (const l of s.labels ?? []) bad.push(...checkLabel(l, where));
    bad.push(...checkCast(s.cast, where, s.caption));
    const ms = Math.max(toggleMotionMs(s, { frameChanged: true, stripMoves: true, art }), toggleMotionMs(s, { frameChanged: true, art }));
    if (ms > BEAT_MOTION_MAX_MS) bad.push(`${where}: motion runs ${String(ms)}ms, over ${String(BEAT_MOTION_MAX_MS)}`);
    if (s.strip && !spec.strip) bad.push(`${where}: sets a strip the toggle does not have`);
    if (s.strip && spec.strip) {
      for (const h of [s.strip.h, s.strip.ghostUp, s.strip.ghostDown]) {
        if (h !== undefined && !(h >= 1 && h <= spec.strip.at.y)) bad.push(`${where}: strip height ${String(h)} does not fit`);
      }
      const fig = (s.labels ?? []).map((l) => DOLLARS.exec(l.text)).find(Boolean);
      if (fig) {
        const ratio = Number(fig[1].replace(/,/g, '')) / s.strip.h;
        if (perPixel === null) perPixel = ratio;
        else if (Math.abs(ratio - perPixel) > 1e-9) bad.push(`${where}: label ${fig[0]} is out of proportion with its ${String(s.strip.h)}px tile`);
      }
    }
    if (art) {
      if (!art.frames[s.frame]) bad.push(`${where}: no frame "${s.frame}" in ${art.id}`);
      for (const id of artIdsOf(s.cast)) if (!art.actors[id]) bad.push(`${where}: no actor "${id}" in ${art.id}`);
    }
  });
  return bad;
}
