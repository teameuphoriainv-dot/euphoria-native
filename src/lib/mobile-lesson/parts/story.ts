/**
 * Story: a short pixel story inside a deck card. Three to six beats in the lesson's own world, with
 * characters that walk and props that move, one caption per beat, paced by the learner's taps. The
 * renderer is components/mobile-lesson/parts/story-card.tsx; the art lives in src/lib/pixel/stories.
 *
 * WHY THIS EXISTS (owner brief 2026-10-12): "pixel art stories with animations that are cool, high
 * quality and work really well on the phone, placed AS A CARD IN THE LESSON". The scene part
 * (parts/scene.ts) acts an idea out with catalogue props floating on a coloured floor; a story is set
 * somewhere, in the opener's art, so the learner meets a person with a problem before meeting a word
 * (concreteness fading, Fyfe et al. 2014, research.json).
 *
 * THE CUE VOCABULARY is shared with the toggle part (parts/toggle.ts), so one renderer, StoryStage,
 * draws both. Every coordinate is in SCENE PIXELS on the 80 x 60 canvas, top-left anchored.
 *
 * EVERY BEAT IS SELF-CONTAINED. An actor already on stage is listed with `instant: true`, so the still
 * for a beat (Back, Reduce Motion) is the end state of that beat's own cues: storyRestAt. There is no
 * folding across beats, so a Back can never leave a ghost of the beat it left.
 *
 * DATA GEOMETRY NEVER OVERSHOOTS (AGENTS.md). Objects move on monotonic curves; the one overshoot is a
 * walking character's 1px arrival bob. A count is stamped copy by copy and its number must be in the
 * caption (`derivedFrom`), so the picture never shows a quantity the words do not say (CONSTITUTION
 * 3.1). Labels are crisp theme text, never pixel digits.
 *
 * Pure: no React Native imports, so a pin can load it under plain node (scripts/ts-resolve-hooks.mjs).
 */
import type { PixelSprite } from '../../pixel/types';
import type { StoryArt } from '../../pixel/stories/types';
import { STAMP_STAGGER_MS } from '../clickthrough/timing';
import {
  ACCENT_MS,
  ACTOR_ENTER_MS,
  ACTOR_EXIT_MS,
  ACTOR_SLIDE_MS,
  BEAT_MOTION_MAX_MS,
  CAPTION_MAX_CHARS,
  MAX_BEATS,
  MIN_BEATS,
} from './scene';

/* ── the vocabulary ────────────────────────────────────────────────────────────────────────────── */

/** Scene pixels, top-left anchor. */
export type ScenePoint = { x: number; y: number };
export type StoryVerb = 'enter' | 'exit' | 'slide' | 'play' | 'count' | 'ghost' | 'stamp';

export interface StoryCue {
  /** Id in StoryArt.actors. One instance per id on stage; a second coin is its own id ('coin-5b'). */
  actor: string;
  do: StoryVerb;
  /** Where the actor rests when the cue ends. Required except for 'ghost' and 'exit'. */
  at?: ScenePoint;
  /** Where an enter or slide starts. Default: where the actor rests now. */
  from?: ScenePoint;
  /** Already there: placed at its end state with no motion. */
  instant?: boolean;
  /** Characters: shows `${actor}-walk` frames while moving, and a 1px arrival bob. */
  walk?: boolean;
  /** count: copies, laid out from `at` in rows of `perRow`. */
  n?: number;
  /** count: copies per row (default 5). */
  perRow?: number;
  /** count: scene pixels between copies (default 1). */
  gap?: number;
  /** ghost: which counted copy turns into its ghost. Omit to ghost a single actor. */
  index?: number;
  /** ghost: actor id of the outline sprite. */
  ghostSprite?: string;
  /** play: how many times the frames run (default 1). */
  times?: number;
  /** count / ghost: the exact caption words the number comes from ('10 tickets', 'only 9'). */
  derivedFrom?: string;
  /** Start offset inside the beat, ms. */
  atMs?: number;
  /** Duration override, ms. */
  ms?: number;
}

export interface StoryLabel {
  /** The same id across states or beats crossfades its text in place. */
  id: string;
  /** At most 16 characters. Crisp theme text, never pixel digits. */
  text: string;
  /** The pill's top-left corner, in scene pixels. */
  at: ScenePoint;
  /** text / accent / CLIP_MUTED / warning (amber, never red). */
  tone: 'ink' | 'accent' | 'muted' | 'warn';
}

export interface StoryBeat {
  /** At most CAPTION_MAX_CHARS (125). */
  caption: string;
  /** Id in StoryArt.frames. */
  frame: string;
  /** At most 160: the finished picture in words, the stage's VoiceOver label. */
  a11y: string;
  cast?: StoryCue[];
  labels?: StoryLabel[];
}

export interface StorySpec {
  kind: 'story';
  /** At most 42, shown above the stage. */
  title: string;
  /** Key in STORY_ART_LOADERS ('if1'). */
  artKey: string;
  /** At most 16: a pill in the caption bar on every beat ('Example story', CONSTITUTION 3.1). */
  tag?: string;
  /** Default false: a beat's motion plays on arrival and the next beat waits for a tap. */
  autoplay?: boolean;
  /** 3 to 6 beats. */
  beats: StoryBeat[];
}

/** None of the story, toggle or ledger cards draws Atlas; the lesson hides its floating one on them. */
export const STORY_HIDES_FLOAT = true;

/* ── budgets and timing ────────────────────────────────────────────────────────────────────────── */

export const STORY_W = 80;
export const STORY_H = 60;
export const STORY_TITLE_MAX = 42;
export const STORY_TAG_MAX = 16;
export const STORY_A11Y_MAX = 160;
export const STORY_LABEL_MAX = 16;
export { CAPTION_MAX_CHARS, MIN_BEATS, MAX_BEATS };

/*
 * MOTION. Literals, not imports from shared/motion/tokens.ts, for the reason timing.ts gives: pins
 * load this file under plain node, where Reanimated cannot.
 *   COUNT_IN_MS 200     one counted copy arriving: opacity plus a one-pixel rise, no scale.
 *   GHOST_MS 400        a copy crossfading into its outline: slow enough to see which one changed.
 *   LABEL_IN_MS 200     labels fade in once the motion has landed, so a figure never names a picture
 *                       that has not finished changing (Mayer, temporal contiguity).
 *   FRAME_FADE_MS 450   one picture crossfading into the next, opacity only.
 *   WALK_FRAME_MS 150   a walk cycle's frame, the spec's tempo for a stroll.
 *   BOB_MS 120          each half of a character's 1px arrival bob, the only overshoot here.
 *   PLAY_FALLBACK_MS    a `play` cue's length when the art is not loaded yet (the story glint's).
 */
export const COUNT_IN_MS = 200;
export const COUNT_RISE_PX = 1;
export const GHOST_MS = 400;
export const LABEL_IN_MS = 200;
export const FRAME_FADE_MS = 450;
export const WALK_FRAME_MS = 150;
export const BOB_MS = 120;
export const BOB_PX = 1;
export const PLAY_FALLBACK_MS = 650;
const DEFAULT_FRAME_MS = 120;
/** A count lays out 5 copies to a row, 1 pixel apart, unless the cue says otherwise. */
export const DEFAULT_PER_ROW = 5;
export const DEFAULT_GAP = 1;

/** How long one `play` of `sprite` runs: every frame, `times` times. */
export function playMs(sprite: PixelSprite | undefined | null, times = 1): number {
  const frames = sprite?.frames?.length ?? 0;
  if (frames < 2) return PLAY_FALLBACK_MS * Math.max(1, times);
  return frames * (sprite?.frameMs ?? DEFAULT_FRAME_MS) * Math.max(1, times);
}

/** A count of `n` copies: the stagger, then the last copy's own arrival. */
export function countMs(n: number): number {
  return Math.max(0, Math.max(1, n) - 1) * STAMP_STAGGER_MS + COUNT_IN_MS;
}

/** How long one cue moves for. An instant cue moves for 0. */
export function cueDurationMs(cue: StoryCue, art?: StoryArt | null): number {
  if (cue.instant) return 0;
  if (cue.ms !== undefined) return Math.max(0, cue.ms);
  switch (cue.do) {
    case 'enter':
      return ACTOR_ENTER_MS;
    case 'slide':
      return ACTOR_SLIDE_MS;
    case 'exit':
      return ACTOR_EXIT_MS;
    case 'play':
      return playMs(art?.actors[cue.actor], cue.times ?? 1);
    case 'count':
      return countMs(cue.n ?? 1);
    case 'ghost':
      return GHOST_MS;
    case 'stamp':
      return ACCENT_MS;
  }
}

/** When a cue starts, ms into the beat. */
export function cueStartMs(cue: StoryCue): number {
  return cue.instant ? 0 : Math.max(0, cue.atMs ?? 0);
}

/** When a cue has landed, ms into the beat. A walking arrival includes its bob. */
export function cueEndMs(cue: StoryCue, art?: StoryArt | null): number {
  if (cue.instant) return 0;
  const bob = cue.walk && (cue.do === 'enter' || cue.do === 'slide') ? BOB_MS * 2 : 0;
  return cueStartMs(cue) + cueDurationMs(cue, art) + bob;
}

/** The last moment anything in `cast` is moving. */
export function castMotionMs(cast: readonly StoryCue[] | undefined, art?: StoryArt | null): number {
  return (cast ?? []).reduce((m, c) => Math.max(m, cueEndMs(c, art)), 0);
}

/**
 * motionMs(beat) = max(atMs + duration) over its cues. Pinned at BEAT_MOTION_MAX_MS: past that a beat
 * stops being a picture the learner drives and becomes a video they wait on.
 */
export function storyMotionMs(beat: StoryBeat, art?: StoryArt | null): number {
  return castMotionMs(beat.cast, art);
}

/* ── the still for any beat ────────────────────────────────────────────────────────────────────── */

/** Where one actor rests once its cues have run, and how it is drawn there. */
export type ActorRest = {
  visible: boolean;
  at: ScenePoint;
  /** A counted actor: `n` copies laid out from `at`. */
  copies?: { n: number; perRow: number; gap: number };
  /** Copies shown as their ghost outline. */
  ghostCopies: number[];
  /** The whole (single) actor shown as its ghost. */
  ghosted: boolean;
  ghostSprite?: string;
};

/** Cues in the order they start; equal starts keep their authored order. */
export function cuesByStart(cast: readonly StoryCue[]): StoryCue[] {
  return cast
    .map((c, i) => ({ c, i }))
    .sort((a, b) => cueStartMs(a.c) - cueStartMs(b.c) || a.i - b.i)
    .map(({ c }) => c);
}

/** Actor ids in the order they first appear in `cast`: the default drawing order, back to front. */
export function actorsOf(cast: readonly StoryCue[] | undefined): string[] {
  const out: string[] = [];
  for (const c of cast ?? []) if (!out.includes(c.actor)) out.push(c.actor);
  return out;
}

/** Folds one actor's cues into where it ends up. */
export function restOf(cues: readonly StoryCue[]): ActorRest {
  const rest: ActorRest = { visible: false, at: { x: 0, y: 0 }, ghostCopies: [], ghosted: false };
  for (const c of cuesByStart(cues)) {
    if (c.at) rest.at = { ...c.at };
    else if (c.from && !rest.visible) rest.at = { ...c.from };
    switch (c.do) {
      case 'exit':
        rest.visible = false;
        break;
      case 'count':
        rest.visible = true;
        rest.copies = { n: Math.max(1, c.n ?? 1), perRow: c.perRow ?? DEFAULT_PER_ROW, gap: c.gap ?? DEFAULT_GAP };
        break;
      case 'ghost':
        rest.visible = true;
        rest.ghostSprite = c.ghostSprite;
        if (c.index !== undefined) {
          if (!rest.ghostCopies.includes(c.index)) rest.ghostCopies.push(c.index);
        } else {
          rest.ghosted = true;
        }
        break;
      default:
        rest.visible = true;
    }
  }
  return rest;
}

/** The end state of a cast, actor by actor: the picture Back and Reduce Motion cut to. */
export function castRestAt(cast: readonly StoryCue[] | undefined): Record<string, ActorRest> {
  const out: Record<string, ActorRest> = {};
  for (const id of actorsOf(cast)) out[id] = restOf((cast ?? []).filter((c) => c.actor === id));
  return out;
}

/** The still for a beat: the end state of its own cues (every beat is self-contained). */
export function storyRestAt(beat: StoryBeat): Record<string, ActorRest> {
  return castRestAt(beat.cast);
}

/** Copy k of a count: its top-left, in scene pixels. */
export function copyAt(at: ScenePoint, k: number, copies: { perRow: number; gap: number }, size: { w: number; h: number }): ScenePoint {
  const col = k % copies.perRow;
  const row = Math.floor(k / copies.perRow);
  return { x: at.x + col * (size.w + copies.gap), y: at.y + row * (size.h + copies.gap) };
}

/* ── text and checks ───────────────────────────────────────────────────────────────────────────── */

/** Every sentence this card puts on screen, for a deck's say-it-once check. */
export function textOf(spec: StorySpec): string[] {
  return [spec.title, ...(spec.tag ? [spec.tag] : []), ...spec.beats.map((b) => b.caption)];
}

const DASH = /[\u2013\u2014]/;

/** A cue's own problems: the vocabulary's rules that hold whatever the art. */
export function checkCue(cue: StoryCue, where: string, caption?: string): string[] {
  const bad: string[] = [];
  if (!cue.at && cue.do !== 'ghost' && cue.do !== 'exit') bad.push(`${where}: ${cue.do} ${cue.actor} has no 'at'`);
  for (const p of [cue.at, cue.from]) {
    if (p && (p.x < -24 || p.x > STORY_W + 24 || p.y < -24 || p.y > STORY_H + 24)) {
      bad.push(`${where}: ${cue.actor} at (${String(p.x)}, ${String(p.y)}) is far off the 80x60 canvas`);
    }
  }
  if (cue.at && cue.do !== 'enter' && cue.do !== 'slide' && (cue.at.x < 0 || cue.at.y < 0 || cue.at.x >= STORY_W || cue.at.y >= STORY_H)) {
    bad.push(`${where}: ${cue.actor} rests outside the canvas`);
  }
  if (cue.do === 'count' && !(Number.isInteger(cue.n) && (cue.n ?? 0) >= 1)) bad.push(`${where}: count ${cue.actor} needs a whole n`);
  if (cue.do === 'ghost' && !cue.ghostSprite) bad.push(`${where}: ghost ${cue.actor} names no ghostSprite`);
  // A drawn quantity must be in the words beside it (CONSTITUTION 3.1).
  if (caption !== undefined && cue.derivedFrom !== undefined && !caption.includes(cue.derivedFrom)) {
    bad.push(`${where}: derivedFrom "${cue.derivedFrom}" is not in the caption`);
  }
  if (cue.do === 'count' && cue.derivedFrom !== undefined && !saysNumber(cue.derivedFrom, cue.n ?? 1)) {
    bad.push(`${where}: count ${cue.actor} draws ${String(cue.n)} but derivedFrom "${cue.derivedFrom}" does not say it`);
  }
  return bad;
}

const saysNumber = (words: string, n: number) => new RegExp(`(^|[^\\d.$])${String(n)}(?![\\d.])`).test(words);

/**
 * A cast's own problems. Besides each cue, a ghost that leaves copies lit must say how many are left:
 * 10 counted with one ghosted draws 9 lit tickets, so its derivedFrom has to contain 9.
 */
export function checkCast(cast: readonly StoryCue[] | undefined, where: string, caption?: string): string[] {
  const bad: string[] = [];
  for (const c of cast ?? []) bad.push(...checkCue(c, where, caption));
  for (const c of cast ?? []) {
    if (c.do !== 'ghost' || c.index === undefined || c.derivedFrom === undefined) continue;
    const rest = restOf((cast ?? []).filter((d) => d.actor === c.actor));
    if (!rest.copies) {
      bad.push(`${where}: ghost ${c.actor} copy ${String(c.index)} but nothing counted it`);
      continue;
    }
    if (c.index < 0 || c.index >= rest.copies.n) bad.push(`${where}: ghost ${c.actor} copy ${String(c.index)} is not one of ${String(rest.copies.n)}`);
    const lit = rest.copies.n - rest.ghostCopies.length;
    if (!saysNumber(c.derivedFrom, lit)) bad.push(`${where}: ${String(lit)} ${c.actor} stay lit but derivedFrom "${c.derivedFrom}" does not say ${String(lit)}`);
  }
  return bad;
}

export function checkLabel(label: StoryLabel, where: string): string[] {
  const bad: string[] = [];
  if (label.text.length > STORY_LABEL_MAX) bad.push(`${where}: label "${label.text}" over ${String(STORY_LABEL_MAX)}`);
  if (DASH.test(label.text)) bad.push(`${where}: label "${label.text}" has a dash`);
  if (label.at.x < 0 || label.at.y < 0 || label.at.x >= STORY_W || label.at.y >= STORY_H) {
    bad.push(`${where}: label "${label.text}" sits outside the canvas`);
  }
  return bad;
}

/** Ids a cast needs from the art: each actor, each ghost sprite, and a walker's walk frames. */
export function artIdsOf(cast: readonly StoryCue[] | undefined): string[] {
  const ids = new Set<string>();
  for (const c of cast ?? []) {
    ids.add(c.actor);
    if (c.ghostSprite) ids.add(c.ghostSprite);
  }
  return [...ids];
}

/** Every rule the story card relies on. Returns the problems; an empty list is a pass. */
export function checkStory(spec: StorySpec, art?: StoryArt | null): string[] {
  const bad: string[] = [];
  if (spec.kind !== 'story') bad.push('kind is not story');
  if (spec.title.length > STORY_TITLE_MAX) bad.push(`title over ${String(STORY_TITLE_MAX)}`);
  if (spec.tag !== undefined && spec.tag.length > STORY_TAG_MAX) bad.push(`tag over ${String(STORY_TAG_MAX)}`);
  if (spec.beats.length < MIN_BEATS || spec.beats.length > MAX_BEATS) {
    bad.push(`${String(spec.beats.length)} beats; a story has ${String(MIN_BEATS)} to ${String(MAX_BEATS)}`);
  }
  for (const s of textOf(spec)) if (DASH.test(s)) bad.push(`"${s.slice(0, 40)}" has a dash`);
  spec.beats.forEach((b, i) => {
    const where = `beat ${String(i + 1)}`;
    if (b.caption.length > CAPTION_MAX_CHARS) bad.push(`${where}: caption over ${String(CAPTION_MAX_CHARS)}`);
    if (b.a11y.length > STORY_A11Y_MAX) bad.push(`${where}: a11y over ${String(STORY_A11Y_MAX)}`);
    if (DASH.test(b.a11y)) bad.push(`${where}: a11y has a dash`);
    bad.push(...checkCast(b.cast, where, b.caption));
    for (const l of b.labels ?? []) bad.push(...checkLabel(l, where));
    const ms = storyMotionMs(b, art);
    if (ms > BEAT_MOTION_MAX_MS) bad.push(`${where}: motion runs ${String(ms)}ms, over ${String(BEAT_MOTION_MAX_MS)}`);
    if (art) {
      if (!art.frames[b.frame]) bad.push(`${where}: no frame "${b.frame}" in ${art.id}`);
      for (const id of artIdsOf(b.cast)) if (!art.actors[id]) bad.push(`${where}: no actor "${id}" in ${art.id}`);
    }
  });
  return bad;
}
