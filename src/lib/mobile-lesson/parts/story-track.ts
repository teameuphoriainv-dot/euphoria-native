/**
 * One story actor's motion as plain data: its cues, folded into timed segments per property, which
 * StoryStage turns into one Reanimated sequence each (components/mobile-lesson/parts/story-stage.tsx).
 * Split out of story.ts, which holds the vocabulary, the stills and the checks.
 *
 * Pure: no React Native imports, so the motion rules are checkable under plain node.
 */
import type { PixelSprite } from '../../pixel/types';
import type { StoryArt } from '../../pixel/stories/types';
import { ACCENT_SCALE } from './scene';
import {
  BOB_MS,
  BOB_PX,
  cueDurationMs,
  cuesByStart,
  cueStartMs,
  DEFAULT_GAP,
  DEFAULT_PER_ROW,
  restOf,
  WALK_FRAME_MS,
  type ActorRest,
  type ScenePoint,
  type StoryCue,
} from './story';

/* ── one actor's motion, as plain data ─────────────────────────────────────────────────────────── */

/** Monotonic curves only (AGENTS.md): Ease.enter, Ease.inOut, Ease.exitCurve, linear for clocks. */
export type TrackEase = 'enter' | 'inOut' | 'exit' | 'linear';
/** Move a property to `to` over `ms`, starting `atMs` into the beat. `ms: 0` is a jump. */
export type TrackSeg = { atMs: number; to: number; ms: number; ease: TrackEase };

export type ActorTrack = {
  /** Where the actor is the moment the beat starts. */
  start: { x: number; y: number; opacity: number; ghost: number };
  x: TrackSeg[];
  y: TrackSeg[];
  opacity: TrackSeg[];
  /** The stamp's swell, a scale; up to ACCENT_SCALE and back, never past it. */
  swell: TrackSeg[];
  /** The whole actor crossfading into its ghost sprite. */
  ghost: TrackSeg[];
  /** Frame clock for the walk cycle: -1 is standing, k is walk frame k (mod the frame count). */
  walk: TrackSeg[];
  /** Frame clock for a `play`: -1 shows the still, k shows frame k. */
  play: TrackSeg[];
  count: { n: number; perRow: number; gap: number; atMs: number; instant: boolean } | null;
  /** Counted copies turning into the ghost sprite; an instant one has ms 0. */
  ghostCopies: { index: number; atMs: number; ms: number }[];
  /** Only instant cues: nothing moves, the actor is simply there. */
  still: boolean;
  rest: ActorRest;
};

/** An actor not yet on stage fades in this fast as it sets off: it appears, it does not ghost in. */
export const APPEAR_MS = 150;

/**
 * One actor's cues as timed segments per property: the renderer turns each list into one Reanimated
 * sequence. Pure, so the motion rules are checkable without a device.
 *
 * WHERE AN ACTOR STARTS. Instant cues place it. Otherwise the first cue decides: a play, a ghost or an
 * exit means it was already there; an enter, slide or stamp means it arrives, unless `carry` says it
 * is already showing in this picture (a toggle state that picks up where the last one left off, so a
 * coin resting in the keeper's hand does not blink out before it slides back to Maya).
 */
export function actorTrack(cues: readonly StoryCue[], art?: StoryArt | null, opts: { carry?: boolean; sprite?: PixelSprite | null } = {}): ActorTrack {
  const sorted = cuesByStart(cues);
  const moving = sorted.filter((c) => !c.instant);
  const track: ActorTrack = {
    start: { x: 0, y: 0, opacity: 0, ghost: 0 },
    x: [], y: [], opacity: [], swell: [], ghost: [], walk: [], play: [],
    count: null,
    ghostCopies: [],
    still: moving.length === 0,
    rest: restOf(cues),
  };
  let pos: ScenePoint = { x: 0, y: 0 };
  let shown = false;
  for (const c of sorted.filter((d) => d.instant)) {
    if (c.at) pos = { ...c.at };
    if (c.do === 'exit') shown = false;
    else shown = true;
    if (c.do === 'count') track.count = { n: Math.max(1, c.n ?? 1), perRow: c.perRow ?? DEFAULT_PER_ROW, gap: c.gap ?? DEFAULT_GAP, atMs: 0, instant: true };
    if (c.do === 'ghost') {
      if (c.index !== undefined) track.ghostCopies.push({ index: c.index, atMs: 0, ms: 0 });
      else track.start.ghost = 1;
    }
  }
  const first = moving[0];
  if (sorted.every((c) => !c.instant) && first) {
    pos = { ...(first.from ?? first.at ?? pos) };
    shown = first.do === 'play' || first.do === 'ghost' || first.do === 'exit' || first.do === 'count' || (!!opts.carry && first.do !== 'enter');
  }
  track.start.x = pos.x;
  track.start.y = pos.y;
  track.start.opacity = shown ? 1 : 0;

  const jump = (t: number, p: ScenePoint) => {
    track.x.push({ atMs: t, to: p.x, ms: 0, ease: 'linear' });
    track.y.push({ atMs: t, to: p.y, ms: 0, ease: 'linear' });
  };
  const travel = (c: StoryCue, t: number, d: number, to: ScenePoint) => {
    const ease: TrackEase = c.walk ? 'inOut' : 'enter';
    track.x.push({ atMs: t, to: to.x, ms: d, ease });
    track.y.push({ atMs: t, to: to.y, ms: d, ease });
    if (c.walk) {
      track.walk.push({ atMs: t, to: 0, ms: 0, ease: 'linear' }, { atMs: t, to: d / WALK_FRAME_MS, ms: d, ease: 'linear' }, { atMs: t + d, to: -1, ms: 0, ease: 'linear' });
      // The one overshoot in a story: a walker settles onto the spot with a 1px bob (AGENTS.md).
      track.y.push({ atMs: t + d, to: to.y - BOB_PX, ms: BOB_MS, ease: 'inOut' }, { atMs: t + d + BOB_MS, to: to.y, ms: BOB_MS, ease: 'inOut' });
    }
  };
  let cur = { ...pos };
  for (const c of moving) {
    const t = cueStartMs(c);
    const d = cueDurationMs(c, art);
    const to = c.at ?? cur;
    switch (c.do) {
      case 'enter': {
        jump(t, c.from ?? cur);
        // A walker comes in from off the stage, so it is solid as soon as it sets off; anything
        // else fades in over the whole entrance (savings growing slowly).
        if (!shown) track.opacity.push({ atMs: t, to: 1, ms: c.walk ? APPEAR_MS : d, ease: 'enter' });
        travel(c, t, d, to);
        break;
      }
      case 'slide': {
        if (!shown || c.from) jump(t, c.from ?? cur);
        if (!shown) track.opacity.push({ atMs: t, to: 1, ms: Math.min(APPEAR_MS, d), ease: 'enter' });
        travel(c, t, d, to);
        break;
      }
      case 'exit':
        track.opacity.push({ atMs: t, to: 0, ms: d, ease: 'exit' });
        shown = false;
        cur = to;
        continue;
      case 'stamp': {
        if (!shown) {
          jump(t, to);
          track.opacity.push({ atMs: t, to: 1, ms: Math.min(APPEAR_MS, d), ease: 'enter' });
        }
        track.swell.push({ atMs: t, to: ACCENT_SCALE, ms: d / 2, ease: 'enter' }, { atMs: t + d / 2, to: 1, ms: d / 2, ease: 'enter' });
        break;
      }
      case 'play': {
        if (c.at) jump(t, c.at);
        if (!shown) track.opacity.push({ atMs: t, to: 1, ms: 0, ease: 'linear' });
        const frames = Math.max(1, opts.sprite?.frames?.length ?? 1) * Math.max(1, c.times ?? 1);
        track.play.push({ atMs: t, to: 0, ms: 0, ease: 'linear' }, { atMs: t, to: frames, ms: d, ease: 'linear' }, { atMs: t + d, to: -1, ms: 0, ease: 'linear' });
        break;
      }
      case 'count': {
        if (c.at) jump(t, c.at);
        if (!shown) track.opacity.push({ atMs: t, to: 1, ms: 0, ease: 'linear' });
        track.count = { n: Math.max(1, c.n ?? 1), perRow: c.perRow ?? DEFAULT_PER_ROW, gap: c.gap ?? DEFAULT_GAP, atMs: t, instant: false };
        break;
      }
      case 'ghost': {
        if (!shown) track.opacity.push({ atMs: t, to: 1, ms: 0, ease: 'linear' });
        if (c.index !== undefined) track.ghostCopies.push({ index: c.index, atMs: t, ms: d });
        else track.ghost.push({ atMs: t, to: 1, ms: d, ease: 'enter' });
        break;
      }
    }
    shown = true;
    cur = { ...to };
  }
  return track;
}
