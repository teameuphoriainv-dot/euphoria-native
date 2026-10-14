/**
 * StoryStage: the 80 x 60 pixel stage the story and toggle cards draw. A building block, not a card
 * (story-card.tsx re-exports it with useStoryArt, as lesson-spec.md 5.0 names them).
 *
 * WHAT IT DRAWS, back to front:
 *   the picture   a frame from the story art (PixelSceneView: its ambient layers keep moving and
 *                 rest under Reduce Motion) with the beat's actors over it. When the frame changes,
 *                 the new picture fades in (opacity only, FRAME_FADE_MS) while the old one, held still
 *                 and hidden from VoiceOver, fades out in a third of that and is dropped: a dip through
 *                 the card colour, never two Mayas overlaid (simulator review, 2026-10-13).
 *   the strip     the toggle's equal tiles, theme-coloured, standing on the ground.
 *   the labels    crisp theme text on card-coloured pills, pinned on the art. Never pixel digits.
 *
 * ACTORS MOVE ON THE UI THREAD. Each actor's cues become one plain-data track (actorTrack in
 * parts/story.ts) and each property one Reanimated sequence; frames switch by a clock, the way
 * PixelSceneView switches them, so no React render runs per frame. Nothing loops: a beat plays once
 * and stops (no withRepeat; the only loops are the frame's own ambient layers).
 *
 * DATA GEOMETRY NEVER OVERSHOOTS (AGENTS.md). Props travel on Ease.enter, characters on Ease.inOut,
 * tiles tween on Ease.enter from wherever they are; the one overshoot is a walker's 1px arrival bob.
 *
 * REDUCE MOTION, BACK AND A FIRST LOOK AT A SAVED STATE are cuts: every actor, tile and label goes
 * straight to the beat's finished picture (storyRestAt / toggleRestAt), with no crossfade.
 */
import { memo, useEffect, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { G, Path } from 'react-native-svg';

import { LabelsLayer, StripLayer, type StageChange, type StageStrip } from '@/components/mobile-lesson/parts/story-overlays';
import { PixelSceneView } from '@/components/pixel-scene-view';
import { LessonColors } from '@/constants/lesson-design';
import { Radius } from '@/constants/theme';
import { STAMP_STAGGER_MS } from '@/lib/mobile-lesson/clickthrough/timing';
import { ACTOR_ENTER_MS, ACTOR_EXIT_MS, ACTOR_SLIDE_MS } from '@/lib/mobile-lesson/parts/scene';
import {
  actorsOf,
  castRestAt,
  copyAt,
  COUNT_IN_MS,
  COUNT_RISE_PX,
  FRAME_FADE_MS,
  GHOST_MS,
  STORY_H,
  STORY_W,
  type StoryCue,
  type StoryLabel,
} from '@/lib/mobile-lesson/parts/story';
import { actorTrack, type ActorTrack, type TrackEase, type TrackSeg } from '@/lib/mobile-lesson/parts/story-track';
import { compileSprite, PixelSpriteView, type PixelSprite } from '@/lib/pixel';
import { pathsFor } from '@/lib/pixel/PixelSprite';
import { loadStoryArt, STORY_ART_LOADERS, storyArtFor, type StoryArt } from '@/lib/pixel/stories';
import { Ease } from '@/shared/motion/tokens';

/* ── the art ───────────────────────────────────────────────────────────────────────────────────── */

export type StoryArtState = {
  art: StoryArt | null;
  /** loading: draw an empty box the art's size. ready: draw it. missing: no art (no key, unknown key or it failed): draw the fallback. */
  status: 'loading' | 'ready' | 'missing';
};

const resolveNow = (key: string | null | undefined): StoryArtState & { key: string | null | undefined } => {
  const art = key ? storyArtFor(key) : null;
  if (art) return { key, art, status: 'ready' };
  return { key, art: null, status: key && STORY_ART_LOADERS[key] ? 'loading' : 'missing' };
};

/**
 * The story art for `artKey`: read synchronously when it is already loaded (so a card that remounts
 * never flashes empty), otherwise loaded once. A failed load reports 'missing' and is not cached
 * (loadStoryArt), so every caller has a no-art path that still works.
 */
export function useStoryArt(artKey?: string | null): StoryArtState {
  const [state, setState] = useState(() => resolveNow(artKey));
  // A new key re-resolves during render, React's pattern for state that follows a prop.
  if (state.key !== artKey) setState(resolveNow(artKey));
  useEffect(() => {
    if (!artKey || storyArtFor(artKey) || !STORY_ART_LOADERS[artKey]) return;
    let alive = true;
    void loadStoryArt(artKey).then((art) => {
      if (alive) setState({ key: artKey, art, status: art ? 'ready' : 'missing' });
    });
    return () => {
      alive = false;
    };
  }, [artKey]);
  return state.key === artKey ? { art: state.art, status: state.status } : { art: null, status: 'loading' };
}

/* ── shapes the cards hand in ──────────────────────────────────────────────────────────────────── */

export type { StageChange, StageStrip } from '@/components/mobile-lesson/parts/story-overlays';

export type StoryShot = {
  frame: string;
  cast?: StoryCue[];
  labels?: StoryLabel[];
  /** ms after the change when new labels fade in. */
  labelsAt?: number;
  strip?: StageStrip | null;
};

const EASE: Record<TrackEase, (typeof Ease)[keyof typeof Ease] | typeof Easing.linear> = {
  enter: Ease.enter,
  inOut: Ease.inOut,
  exit: Ease.exitCurve,
  linear: Easing.linear,
};

/** One property's segments as one Reanimated sequence, gaps as delays. Starts from wherever it is. */
function run(sv: SharedValue<number>, segs: readonly TrackSeg[]): void {
  if (segs.length === 0) return;
  const sorted = [...segs].sort((a, b) => a.atMs - b.atMs);
  let cursor = 0;
  const steps = sorted.map((s) => {
    const gap = Math.max(0, s.atMs - cursor);
    cursor = Math.max(cursor, s.atMs) + s.ms;
    return withDelay(gap, withTiming(s.to, { duration: s.ms, easing: EASE[s.ease] }));
  });
  const [first, ...rest] = steps;
  if (first) sv.set(rest.length ? withSequence(first, ...rest) : first);
}

/* ── an actor ──────────────────────────────────────────────────────────────────────────────────── */

const AnimatedG = Animated.createAnimatedComponent(G);
/** Story art is drawn for the lesson's dark canvas in both appearances, like PixelSceneView. */
const CANVAS = 'dark' as const;

const frameCache = new WeakMap<PixelSprite, PixelSprite[]>();
/** Each frame of a framed sprite as its own still, cached per source so compileSprite's cache holds. */
function framesOf(sprite: PixelSprite | undefined): PixelSprite[] {
  if (!sprite?.frames || sprite.frames.length < 2) return [];
  let hit = frameCache.get(sprite);
  if (!hit) {
    hit = sprite.frames.map((rows, i) => ({ id: `${sprite.id}#${String(i)}`, name: sprite.name, tags: sprite.tags, rows, ...(sprite.palette ? { palette: sprite.palette } : {}) }));
    frameCache.set(sprite, hit);
  }
  return hit;
}

function Paths({ sprite }: { sprite: PixelSprite }) {
  return (
    <>
      {pathsFor(compileSprite(sprite, CANVAS)).map((p) => (
        <Path key={p.fill} d={p.d} fill={p.fill} />
      ))}
    </>
  );
}

/** The resting drawing: shown while neither the walk nor a play clock is running. */
function StillG({ sprite, walk, play, ghost }: { sprite: PixelSprite; walk: SharedValue<number>; play: SharedValue<number>; ghost: SharedValue<number> }) {
  const props = useAnimatedProps(() => ({ opacity: walk.get() < 0 && play.get() < 0 ? 1 - ghost.get() : 0 }));
  return <AnimatedG animatedProps={props}><Paths sprite={sprite} /></AnimatedG>;
}

/** Frame `index` of `count`, shown while `clock` sits on it. */
function ClockG({ sprite, clock, index, count, ghost }: { sprite: PixelSprite; clock: SharedValue<number>; index: number; count: number; ghost: SharedValue<number> }) {
  const props = useAnimatedProps(() => {
    const c = clock.get();
    return { opacity: c >= 0 && Math.floor(c) % count === index ? 1 - ghost.get() : 0 };
  });
  return <AnimatedG animatedProps={props}><Paths sprite={sprite} /></AnimatedG>;
}

function GhostG({ sprite, ghost }: { sprite: PixelSprite; ghost: SharedValue<number> }) {
  const props = useAnimatedProps(() => ({ opacity: ghost.get() }));
  return <AnimatedG animatedProps={props}><Paths sprite={sprite} /></AnimatedG>;
}

/** One counted copy: stamped in with a one-pixel rise, and crossfading into its ghost when told. */
function Copy({ k, sprite, ghostSprite, track, seq, animate, carry, scale }: {
  k: number;
  sprite: PixelSprite;
  ghostSprite: PixelSprite | undefined;
  track: ActorTrack;
  seq: number;
  animate: boolean;
  carry: boolean;
  scale: number;
}) {
  const opacity = useSharedValue(1);
  const rise = useSharedValue(0);
  const ghost = useSharedValue(track.rest.ghostCopies.includes(k) ? 1 : 0);
  useEffect(() => {
    const count = track.count;
    const turn = track.ghostCopies.find((g) => g.index === k);
    if (!animate) {
      opacity.set(1);
      rise.set(0);
      ghost.set(track.rest.ghostCopies.includes(k) ? 1 : 0);
      return;
    }
    if (count && !count.instant) {
      const at = count.atMs + k * STAMP_STAGGER_MS;
      opacity.set(0);
      rise.set(COUNT_RISE_PX);
      opacity.set(withDelay(at, withTiming(1, { duration: COUNT_IN_MS, easing: Ease.enter })));
      rise.set(withDelay(at, withTiming(0, { duration: COUNT_IN_MS, easing: Ease.enter })));
    } else {
      opacity.set(1);
      rise.set(0);
    }
    if (turn && turn.ms > 0) {
      ghost.set(0);
      ghost.set(withDelay(turn.atMs, withTiming(1, { duration: turn.ms, easing: Ease.enter })));
    } else if (carry) {
      // Picked back up from the last state of this picture: relight (or grey) in place, never a cut.
      ghost.set(withTiming(turn ? 1 : 0, { duration: GHOST_MS, easing: Ease.enter }));
    } else {
      ghost.set(turn ? 1 : 0);
    }
    // `seq` is the trigger; the rest are read fresh for that change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seq, animate]);
  const size = { w: sprite.rows[0]?.length ?? 0, h: sprite.rows.length };
  const at = copyAt({ x: 0, y: 0 }, k, track.count ?? { perRow: 1, gap: 0 }, size);
  const lit = useAnimatedStyle(() => ({ opacity: opacity.get() * (1 - ghost.get()), transform: [{ translateY: Math.round(rise.get() * scale) }] }));
  const out = useAnimatedStyle(() => ({ opacity: opacity.get() * ghost.get() }));
  return (
    <>
      <Animated.View style={[styles.abs, { left: at.x * scale, top: at.y * scale }, lit]}>
        <PixelSpriteView sprite={sprite} scale={scale} canvas={CANVAS} />
      </Animated.View>
      {ghostSprite ? (
        <Animated.View style={[styles.abs, { left: at.x * scale, top: at.y * scale }, out]}>
          <PixelSpriteView sprite={ghostSprite} scale={scale} canvas={CANVAS} />
        </Animated.View>
      ) : null}
    </>
  );
}

function ActorView({ id, art, cast, seq, animate, carry, scale }: {
  id: string;
  art: StoryArt;
  cast: readonly StoryCue[];
  seq: number;
  animate: boolean;
  carry: boolean;
  scale: number;
}) {
  const sprite = art.actors[id];
  const walkSprite = art.actors[`${id}-walk`];
  const cues = useMemo(() => cast.filter((c) => c.actor === id), [cast, id]);
  const gone = cues.length === 0;
  const track = useMemo(() => actorTrack(cues, art, { carry, sprite }), [cues, art, carry, sprite]);
  const ghostId = track.rest.ghostSprite ?? cues.find((c) => c.ghostSprite)?.ghostSprite;
  const ghostSprite = ghostId ? art.actors[ghostId] : undefined;

  const x = useSharedValue(track.rest.at.x);
  const y = useSharedValue(track.rest.at.y);
  const opacity = useSharedValue(gone ? 0 : track.rest.visible ? 1 : 0);
  const swell = useSharedValue(1);
  const ghost = useSharedValue(track.rest.ghosted ? 1 : 0);
  const walk = useSharedValue(-1);
  const play = useSharedValue(-1);

  useEffect(() => {
    if (gone) {
      // Not in this beat or state: it leaves (a fade on a change, gone at once on a cut).
      opacity.set(animate ? withTiming(0, { duration: ACTOR_EXIT_MS, easing: Ease.exitCurve }) : 0);
      return;
    }
    const r = track.rest;
    if (!animate) {
      x.set(r.at.x);
      y.set(r.at.y);
      opacity.set(r.visible ? 1 : 0);
      swell.set(1);
      ghost.set(r.ghosted ? 1 : 0);
      walk.set(-1);
      play.set(-1);
      return;
    }
    if (track.still && carry) {
      // Standing still in a picture that stays: drift to the new spot if it moved, otherwise nothing.
      x.set(withTiming(r.at.x, { duration: ACTOR_SLIDE_MS, easing: Ease.enter }));
      y.set(withTiming(r.at.y, { duration: ACTOR_SLIDE_MS, easing: Ease.enter }));
      opacity.set(withTiming(r.visible ? 1 : 0, { duration: ACTOR_ENTER_MS, easing: Ease.enter }));
      ghost.set(withTiming(r.ghosted ? 1 : 0, { duration: GHOST_MS, easing: Ease.enter }));
      return;
    }
    x.set(track.start.x);
    y.set(track.start.y);
    opacity.set(track.start.opacity);
    swell.set(1);
    ghost.set(track.start.ghost);
    walk.set(-1);
    play.set(-1);
    run(x, track.x);
    run(y, track.y);
    run(opacity, track.opacity);
    run(swell, track.swell);
    run(ghost, track.ghost);
    run(walk, track.walk);
    run(play, track.play);
    // `seq` is the trigger; the track and flags are read fresh for that change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seq, animate, gone]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateX: Math.round(x.get() * scale) }, { translateY: Math.round(y.get() * scale) }, { scale: swell.get() }],
  }));

  if (!sprite) return null;
  const w = sprite.rows[0]?.length ?? 0;
  const h = sprite.rows.length;
  if (track.count) {
    /*
     * SIZED TO THE GRID, never 0 x 0. A zero-size container drew its copies on the simulator only
     * some of the time (2026-10-13: every shared value read correctly in the log while the tickets
     * were missing, or drawn 16 pixels off), while every sized actor beside it drew right.
     */
    const cols = Math.min(track.count.n, track.count.perRow);
    const rows = Math.ceil(track.count.n / track.count.perRow);
    const gridW = cols * w + (cols - 1) * track.count.gap;
    const gridH = rows * h + (rows - 1) * track.count.gap;
    return (
      <Animated.View pointerEvents="none" style={[styles.abs, styles.origin, { width: gridW * scale, height: gridH * scale }, style]}>
        {Array.from({ length: track.count.n }, (_, k) => (
          <Copy key={k} k={k} sprite={sprite} ghostSprite={ghostSprite} track={track} seq={seq} animate={animate} carry={carry} scale={scale} />
        ))}
      </Animated.View>
    );
  }
  const plays = framesOf(sprite);
  const walks = framesOf(walkSprite);
  return (
    <Animated.View pointerEvents="none" style={[styles.abs, styles.origin, { width: w * scale, height: h * scale }, style]}>
      <Svg width={w * scale} height={h * scale} viewBox={`0 0 ${String(w)} ${String(h)}`}>
        <StillG sprite={sprite} walk={walk} play={play} ghost={ghost} />
        {plays.map((f, i) => <ClockG key={f.id} sprite={f} clock={play} index={i} count={plays.length} ghost={ghost} />)}
        {walks.map((f, i) => <ClockG key={f.id} sprite={f} clock={walk} index={i} count={walks.length} ghost={ghost} />)}
        {ghostSprite ? <GhostG sprite={ghostSprite} ghost={ghost} /> : null}
      </Svg>
    </Animated.View>
  );
}

/* ── a picture: a frame and its actors ─────────────────────────────────────────────────────────── */

type Picture = { key: number; frame: string; cast: StoryCue[]; seq: number; animate: boolean; carry: string[]; enter: boolean };

/** Actor ids in the art's drawing order; unlisted ones after, in the order they first appeared. */
function drawOrder(art: StoryArt, ids: readonly string[]): string[] {
  const rank = (id: string) => {
    const i = art.order?.indexOf(id) ?? -1;
    return i >= 0 ? i : Number.MAX_SAFE_INTEGER;
  };
  return ids.map((id, i) => ({ id, i })).sort((a, b) => rank(a.id) - rank(b.id) || a.i - b.i).map(({ id }) => id);
}

function StoryPicture({ art, pic, scale, outgoing }: { art: StoryArt; pic: Picture; scale: number; outgoing: boolean }) {
  const frame = art.frames[pic.frame];
  const fade = useSharedValue(pic.enter ? 0 : 1);
  useEffect(() => {
    if (pic.enter) fade.set(withTiming(1, { duration: FRAME_FADE_MS, easing: Ease.inOut }));
    // Mount only: a picture fades in once, when it replaces another.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (outgoing) fade.set(withTiming(0, { duration: Math.round(FRAME_FADE_MS / 3), easing: Ease.exitCurve }));
  }, [outgoing, fade]);
  // Every actor this picture has drawn stays mounted, so one that leaves a toggle state fades out.
  const [ids, setIds] = useState<string[]>(() => drawOrder(art, actorsOf(pic.cast)));
  const fresh = actorsOf(pic.cast).filter((id) => !ids.includes(id));
  if (fresh.length) setIds(drawOrder(art, [...ids, ...fresh]));
  const style = useAnimatedStyle(() => ({ opacity: fade.get() }));
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      {frame ? <PixelSceneView art={frame} scale={scale} decorative paused={outgoing} /> : null}
      {ids.map((id) => (
        <ActorView key={id} id={id} art={art} cast={pic.cast} seq={pic.seq} animate={pic.animate} carry={pic.carry.includes(id)} scale={scale} />
      ))}
    </Animated.View>
  );
}

/* ── the stage ─────────────────────────────────────────────────────────────────────────────────── */

function StoryStageInner({ art, shot, change, scale, reduced }: {
  art: StoryArt;
  shot: StoryShot;
  change: StageChange;
  /** Points per scene pixel. A whole number, so every pixel lands on whole points. */
  scale: number;
  reduced: boolean;
}) {
  // The stage guards itself as well as trusting its card: a future caller that forgets to pass
  // `reduced` must still get stills, never motion, under Reduce Motion (CONSTITUTION 5.10).
  const systemReduced = !!useReducedMotion();
  const animate = change.animate && !reduced && !systemReduced;
  const motion = useMemo<StageChange>(() => ({ beat: change.beat, seq: change.seq, animate }), [change.beat, change.seq, animate]);
  const [pics, setPics] = useState<Picture[]>(() => [
    { key: 0, frame: shot.frame, cast: shot.cast ?? [], seq: change.seq, animate, carry: [], enter: false },
  ]);
  const [seen, setSeen] = useState(change.seq);
  if (seen !== change.seq) {
    setSeen(change.seq);
    const top = pics[pics.length - 1];
    const cast = shot.cast ?? [];
    const next: Picture = { key: top.key + 1, frame: shot.frame, cast, seq: change.seq, animate, carry: [], enter: false };
    if (!animate) {
      // A cut keeps the picture when the frame is the same, so nothing remounts or flickers.
      setPics([{ ...next, key: top.frame === shot.frame ? top.key : next.key }]);
    } else if (top.frame !== shot.frame) {
      setPics([top, { ...next, enter: true }]);
    } else {
      const carry = Object.entries(castRestAt(top.cast)).filter(([, r]) => r.visible).map(([id]) => id);
      setPics([...pics.slice(0, -1), { ...next, key: top.key, carry }]);
    }
  }
  const outgoing = pics.length > 1 ? pics[0].key : null;
  useEffect(() => {
    if (outgoing === null) return;
    const id = setTimeout(() => setPics((ps) => ps.slice(-1)), FRAME_FADE_MS + 50);
    return () => clearTimeout(id);
  }, [outgoing]);

  return (
    <View style={[styles.stage, { width: STORY_W * scale, height: STORY_H * scale }]}>
      {pics.map((p, i) => (
        <StoryPicture key={p.key} art={art} pic={p} scale={scale} outgoing={i < pics.length - 1} />
      ))}
      {shot.strip ? <StripLayer strip={shot.strip} change={motion} scale={scale} /> : null}
      <LabelsLayer labels={shot.labels ?? []} change={motion} at={shot.labelsAt ?? 0} scale={scale} />
    </View>
  );
}

export const StoryStage = memo(StoryStageInner);

/**
 * The framed player the story and toggle cards share: the stage on top, the words under it, one border,
 * like one screen (Brilliant's card frame, scene-card.tsx's player).
 *
 * EDGE TO EDGE, NOT INSIDE StageFrame. The lesson pads the deck and the card pads itself, which leaves
 * a 402pt iPhone 17 a 334pt frame; StageFrame's own 12pt padding then left 310pt, so the stage drew at
 * 3x (240pt) on the phone the spec measured at 4x (seen on the simulator, 2026-10-13). Here the stage
 * takes the frame's full width and is centred, with the same margin above and below it as beside it.
 */
export function StoryPlayer({ scale, stageH, onLayout, children, footer }: {
  /** 0 until measured. */
  scale: number;
  /** The stage's height in points; 0 folds the stage away (no art: the words carry the card). */
  stageH: number;
  onLayout: (e: LayoutChangeEvent) => void;
  children: ReactNode;
  footer: ReactNode;
}) {
  const [width, setWidth] = useState(0);
  const margin = scale && width ? Math.max(0, Math.floor((width - STORY_W * scale) / 2)) : 0;
  return (
    <View style={styles.player}>
      <View
        onLayout={(e) => {
          setWidth(e.nativeEvent.layout.width);
          onLayout(e);
        }}
        style={[styles.playerStage, { height: stageH > 0 ? stageH + margin * 2 : 0 }]}
      >
        {children}
      </View>
      <View style={[styles.playerFooter, stageH > 0 && styles.playerFooterRule]}>{footer}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
  origin: { left: 0, top: 0 },
  // Opaque (spec rule 11): the lesson backdrop never paints through a picture that is still loading.
  stage: { overflow: 'hidden', backgroundColor: LessonColors.card },
  player: {
    width: '100%',
    backgroundColor: LessonColors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: LessonColors.border,
    overflow: 'hidden',
  },
  playerStage: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  playerFooter: { paddingHorizontal: 14, paddingVertical: 12, gap: 8 },
  playerFooterRule: { borderTopWidth: 1, borderTopColor: LessonColors.border },
});
