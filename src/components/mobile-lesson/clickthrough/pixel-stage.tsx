/**
 * Pixel stage: the shared kit every Atlas clip card is built from (stage, predict, build-up, place).
 * research2/design.md section 2.0. One kit so the four cards read as one family of short clips:
 * the same dark frame, the same whole-cell geometry, the same controls and the same small Atlas.
 *
 *   StageFrame        the dark LessonColors.card panel the diagram sits in (not Brilliant's light
 *                     grey, brilliant-lessons.md section 5: a light panel on the lesson's near-black
 *                     background is the brightest thing on screen and outshouts the CTA, CONSTITUTION 5.4).
 *   CellRect          an SVG rect snapped to CELL_PT, growing in WHOLE cells, never overshooting.
 *   GhostCells        a dashed outline made of alternating cells (predict's guess, a place slot).
 *   StepperDots       the beat pager.
 *   ClipControls      Back, Play / Pause / Replay, Next, and the dots.
 *   ClipCaption       the authored sentence under the frame, faded per beat.
 *   AtlasCue          the small Atlas that reacts per beat.
 *   useBeat           reports `playing` while one beat's motion runs.
 *   useClipTimeline   beat state, autoplay, worked, announcements. Every clip card drives this.
 *
 * DATA GEOMETRY NEVER OVERSHOOTS (AGENTS.md). CellRect uses withTiming + Ease.out, whose bezier
 * y-controls are both 1, so the curve never passes its end: a bar growing past its authored value
 * and settling back would show, for a frame, a number the lesson never wrote. Springs with
 * overshoot appear only inside AtlasCue, via <Atlas>'s own celebrate move.
 *
 * REDUCED MOTION IS STATIC. No autoplay, no Play button, every beat is a cut to its end state, and
 * <Atlas> already skips its nod and celebrate under Reduce Motion (atlas.tsx), so only his
 * expression changes.
 *
 * ONE MASCOT PER SCREEN (CONSTITUTION 5.6, PINNED). lesson.tsx draws the Ask-Atlas button
 * (LessonAtlasButton, an <Atlas>) on every step. A clip card that mounts AtlasCue is a second Atlas
 * on that screen, so the integrator must hide the floating button while a clip kind is the active
 * card. `CLIP_DRAWS_ATLAS` exists so that condition names this file instead of a bare boolean.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, AppState, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';
import { useIsFocused } from 'expo-router';

import { Atlas, type AtlasExpression } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { LessonColors, LessonTypography } from '@/constants/lesson-design';
import { Colors, Radius } from '@/constants/theme';
import { beatHoldMs, beatMotionMs, CELL_PT, CLIP_TEMPO, DRAW_MS, reactionFor } from '@/lib/mobile-lesson/clickthrough/timing';
import type { AtlasReaction, ClipBeat } from '@/lib/mobile-lesson/clickthrough/types';
import { Duration, Ease } from '@/shared/motion/tokens';
import { SpringPressable } from '@/shared/motion/spring-pressable';

/** A clip card mounting AtlasCue is the screen's Atlas; the lesson's floating one must hide. */
export const CLIP_DRAWS_ATLAS = true;

// timing.ts mirrors Duration.base x CLIP_TEMPO as a literal (it loads under plain node); without
// this, retuning Duration.base would silently leave clip beats on the old tempo.
if (__DEV__ && DRAW_MS !== Duration.base * CLIP_TEMPO) {
  throw new Error(`clickthrough DRAW_MS ${DRAW_MS} drifted from Duration.base ${Duration.base} x ${CLIP_TEMPO}`);
}

const AnimatedRect = Animated.createAnimatedComponent(Rect);

export function StageFrame({
  children,
  height,
  onLayout,
  footer,
}: {
  children: ReactNode;
  /** Diagram height in points; rounded down to whole cells so the baseline lands on a cell edge. */
  height: number;
  onLayout?: (e: LayoutChangeEvent) => void;
  /** Usually <ClipControls>, on the frame's bottom edge. */
  footer?: ReactNode;
}) {
  return (
    <View style={styles.frame}>
      <View onLayout={onLayout} style={{ height: Math.floor(height / CELL_PT) * CELL_PT, width: '100%' }}>
        {children}
      </View>
      {footer}
    </View>
  );
}

/** The frame's inner width in whole cells, measured, so cards never size a diagram by guess. */
export function useCellSpan(): [number, (e: LayoutChangeEvent) => void] {
  const [cells, setCells] = useState(0);
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const next = Math.floor(e.nativeEvent.layout.width / CELL_PT);
    setCells((c) => (c === next ? c : next));
  }, []);
  return [cells, onLayout];
}

/**
 * A rect in whole cells whose growing side animates from where it is to `cells`.
 * `grow="up"` stands on `baseCell` (its bottom edge) and grows toward the top; `grow="right"` starts
 * at `atCell` and grows right. The fixed side is `thickness` cells.
 */
export function CellRect({
  grow,
  atCell,
  baseCell,
  thickness,
  cells,
  fill,
  animate,
  delayMs = 0,
  durationMs = DRAW_MS,
}: {
  grow: 'up' | 'right';
  /** Left edge (up) or left start (right), in cells. */
  atCell: number;
  /** Bottom edge (up) or top edge (right), in cells. */
  baseCell: number;
  thickness: number;
  cells: number;
  fill: string;
  animate: boolean;
  delayMs?: number;
  durationMs?: number;
}) {
  const reduced = !!useReducedMotion();
  const n = useSharedValue(animate && !reduced ? 0 : cells);
  useEffect(() => {
    if (!animate || reduced) {
      n.set(cells);
      return;
    }
    n.set(withDelay(delayMs, withTiming(cells, { duration: durationMs, easing: Ease.out })));
  }, [cells, animate, reduced, delayMs, durationMs, n]);

  const props = useAnimatedProps(() => {
    // Floor, not round: a half-grown cell shows as the cell below it, so the rect never draws a
    // sub-cell sliver, which on the pixel grid reads as an anti-aliased seam (CONSTITUTION 5.5).
    const len = Math.floor(n.get()) * CELL_PT;
    return grow === 'up'
      ? { x: atCell * CELL_PT, y: baseCell * CELL_PT - len, width: thickness * CELL_PT, height: len }
      : { x: atCell * CELL_PT, y: baseCell * CELL_PT, width: len, height: thickness * CELL_PT };
  });

  return <AnimatedRect animatedProps={props} fill={fill} />;
}

/**
 * A dashed outline of alternating cells around a `w` x `h` cell box. A pixel stand-in for a dashed
 * stroke: a real dash pattern has round-ish, sub-pixel ends that do not sit on the cell grid.
 */
export function GhostCells({ x, y, w, h, color }: { x: number; y: number; w: number; h: number; color: string }) {
  const cells = useMemo(() => {
    const out: { cx: number; cy: number }[] = [];
    for (let i = 0; i < w; i++) {
      for (let j = 0; j < h; j++) {
        const edge = i === 0 || j === 0 || i === w - 1 || j === h - 1;
        if (edge && (i + j) % 2 === 0) out.push({ cx: x + i, cy: y + j });
      }
    }
    return out;
  }, [x, y, w, h]);
  return (
    <>
      {cells.map((c) => (
        <Rect key={`${c.cx}:${c.cy}`} x={c.cx * CELL_PT} y={c.cy * CELL_PT} width={CELL_PT} height={CELL_PT} fill={color} />
      ))}
    </>
  );
}

/* Pixel arrows, not Unicode triangles: iOS can render those as colour emoji beside pixel art. */
const ARROW = ['X...', 'XX..', 'XXX.', 'XXXX', 'XXX.', 'XX..', 'X...'];
const GLYPH_CELL = 3;

function PixelArrow({ dir, color }: { dir: 'left' | 'right'; color: string }) {
  const w = ARROW[0].length;
  return (
    <Svg width={w * GLYPH_CELL} height={ARROW.length * GLYPH_CELL}>
      {ARROW.flatMap((row, j) =>
        [...row].map((ch, i) =>
          ch === 'X' ? (
            <Rect
              key={`${i}:${j}`}
              x={(dir === 'right' ? i : w - 1 - i) * GLYPH_CELL}
              y={j * GLYPH_CELL}
              width={GLYPH_CELL}
              height={GLYPH_CELL}
              fill={color}
            />
          ) : null,
        ),
      )}
    </Svg>
  );
}

export function StepperDots({ beat, total }: { beat: number; total: number }) {
  return (
    <View
      style={styles.dots}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${beat + 1} of ${total}`}
      accessibilityValue={{ min: 1, max: total, now: beat + 1 }}
    >
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.dot, i === beat && styles.dotOn]} />
      ))}
    </View>
  );
}

export function ClipControls({ timeline, showPlay = true }: { timeline: ClipTimeline; showPlay?: boolean }) {
  const { beat, total, atEnd, playing, busy, reduced, prev, next, playPause } = timeline;
  const backOff = beat === 0;
  // Next waits for the beat to finish drawing (Brilliant's grey arrow, timing/koch.jpg row 2): a
  // tap mid-draw would cut a bar short of its authored length and start the next caption early.
  const nextOff = atEnd || busy;
  return (
    <View style={styles.controls}>
      <SpringPressable
        onPress={prev}
        disabled={backOff}
        accessibilityRole="button"
        accessibilityLabel="Previous step"
        accessibilityState={{ disabled: backOff }}
      >
        <View style={[styles.button, backOff && styles.buttonOff]}>
          <PixelArrow dir="left" color={LessonColors.text} />
        </View>
      </SpringPressable>
      <StepperDots beat={beat} total={total} />
      {showPlay && !reduced ? (
        <SpringPressable
          onPress={playPause}
          accessibilityRole="button"
          accessibilityLabel={atEnd ? 'Replay the clip' : playing ? 'Pause the clip' : 'Play the clip'}
        >
          <View style={[styles.button, styles.buttonMain]}>
            {/* 1.6x cap: at max Dynamic Type, Next would otherwise be pushed off a 375pt frame. */}
            <ThemedText style={styles.buttonText} maxFontSizeMultiplier={1.6}>{atEnd ? 'Replay' : playing ? 'Pause' : 'Play'}</ThemedText>
          </View>
        </SpringPressable>
      ) : null}
      <SpringPressable
        onPress={next}
        disabled={nextOff}
        accessibilityRole="button"
        accessibilityLabel={`Next step, ${Math.min(beat + 2, total)} of ${total}`}
        accessibilityState={{ disabled: nextOff }}
      >
        <View style={[styles.button, nextOff && styles.buttonOff]}>
          <PixelArrow dir="right" color={LessonColors.text} />
        </View>
      </SpringPressable>
    </View>
  );
}

/** The authored sentence for this beat. Three lines reserved so the controls never jump. */
export function ClipCaption({ text, beatKey }: { text: string; beatKey: number }) {
  const reduced = !!useReducedMotion();
  return (
    <Animated.View key={beatKey} entering={reduced ? undefined : FadeIn.duration(DRAW_MS)} style={styles.captionBox}>
      <ThemedText style={styles.caption}>{text}</ThemedText>
    </Animated.View>
  );
}

/**
 * Reaction to <Atlas>'s existing acting channels. There is no pixel Atlas sprite in src/lib/pixel
 * (searched 2026-09-22), so this reuses his authored expressions and one-shot moves rather than
 * drawing new art: `watching` pupils look aside toward the diagram, `happy` + nod acknowledges,
 * `proud` + celebrate is the one overshoot a clip is allowed.
 */
const CUE: Record<AtlasReaction, AtlasExpression> = { point: 'watching', nod: 'happy', celebrate: 'proud' };
/** Under IDLE_MOTION_MIN_SIZE (72, atlas.tsx), so Atlas holds still between beats: no idle loop. */
const CUE_SIZE = 56;
/** A clip's last beat is not the lesson's payoff; lesson complete keeps the full hop. */
const CUE_GAIN = 0.5;

export function AtlasCue({ reaction, cueKey }: { reaction: AtlasReaction; cueKey: number }) {
  return (
    // Hidden from VoiceOver: the caption and the controls carry every beat, and a focusable mascot
    // between them would be a stop that says nothing new.
    <View style={styles.cue} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none">
      <Atlas
        size={CUE_SIZE}
        expression={CUE[reaction]}
        interactive={false}
        nod={reaction === 'nod'}
        nodKey={cueKey}
        celebrate={reaction === 'celebrate'}
        celebrateKey={cueKey}
        celebrateGain={CUE_GAIN}
      />
    </View>
  );
}

/** True for `motionMs` after `key` changes, false under Reduce Motion or for a zero-length beat. */
export function useBeat(motionMs: number, key: number): boolean {
  const reduced = !!useReducedMotion();
  // Derived, not toggled in the effect body: the timer only records which key has finished, so a
  // new key reads as playing on the very render it arrives (no one-frame window where Next is live
  // before the beat has started, and no cascading setState the lint rule forbids).
  const [doneKey, setDoneKey] = useState<number | null>(null);
  const runs = !reduced && motionMs > 0;
  useEffect(() => {
    if (!runs) return;
    const id = setTimeout(() => setDoneKey(key), motionMs);
    return () => clearTimeout(id);
  }, [motionMs, key, runs]);
  return runs && doneKey !== key;
}

export type ClipTimeline = {
  beat: number;
  total: number;
  /** Bumps on every beat change, including a replay of beat 0. Key animations and AtlasCue on it. */
  seq: number;
  /** Whether this beat change should animate (forward) or cut (Back, jump, Reduce Motion). */
  animate: boolean;
  /** A beat's motion is still running. */
  busy: boolean;
  playing: boolean;
  atEnd: boolean;
  reduced: boolean;
  reaction: AtlasReaction;
  next: () => void; prev: () => void; playPause: () => void; replay: () => void;
};

/**
 * The one clock every clip card runs on.
 *
 * AUTOPLAY holds each beat for `beatHoldMs` and stops on the last. It never starts under Reduce
 * Motion or VoiceOver (captions changing under a reader's focus), pauses if VoiceOver turns on
 * mid-clip, and the timer is cleared when the screen loses focus or the app backgrounds, so a clip
 * never advances where nobody can see it (the same rules scene-card.tsx shipped with).
 *
 * WORKED. `onWorked` fires once, the first time the last beat is reached; CardDeck holds Continue
 * until then. It is read through a ref so a parent re-rendering with a new callback cannot re-fire it.
 */
export function useClipTimeline(
  beats: ClipBeat[],
  { autoplay = true, onWorked }: { autoplay?: boolean; onWorked?: () => void } = {},
): ClipTimeline {
  const reduced = !!useReducedMotion();
  const focused = useIsFocused();
  const total = beats.length;
  const last = Math.max(0, total - 1);

  const [change, setChange] = useState({ beat: 0, animate: !reduced, seq: 0 });
  const [playing, setPlaying] = useState(false);
  // 'unknown' counts as visible, or autoplay would stall until the app next changed state.
  const [appActive, setAppActive] = useState(AppState.currentState !== 'background' && AppState.currentState !== 'inactive');
  const workedRef = useRef(false);
  const onWorkedRef = useRef(onWorked);
  useEffect(() => {
    onWorkedRef.current = onWorked;
  }, [onWorked]);

  // Via a ref: an inline `beats` array is new every render, which restarted the autoplay hold on
  // each re-render (the busy flip is one), so a beat sat for its motion plus a whole second hold.
  const beatsRef = useRef(beats);
  useEffect(() => {
    beatsRef.current = beats;
  }, [beats]);

  const beat = Math.min(change.beat, last);
  const current = beats[beat];
  const holdMs = current ? beatHoldMs(current) : 0;
  const animate = change.animate && !reduced;
  const busy = useBeat(animate && current ? beatMotionMs(current) : 0, change.seq);

  const goTo = useCallback(
    (k: number, anim: boolean) => {
      const to = Math.max(0, Math.min(last, k));
      setChange((c) => ({ beat: to, animate: anim, seq: c.seq + 1 }));
      const caption = beatsRef.current[to]?.caption;
      if (caption) AccessibilityInfo.announceForAccessibility(caption);
      if (to === last) {
        setPlaying(false);
        if (!workedRef.current) {
          workedRef.current = true;
          onWorkedRef.current?.();
        }
      }
    },
    [last],
  );

  // A one-beat clip is worked on arrival: there is nothing further to reach.
  useEffect(() => {
    if (total === 1 && !workedRef.current) {
      workedRef.current = true;
      onWorkedRef.current?.();
    }
  }, [total]);

  useEffect(() => {
    if (reduced || !autoplay) return;
    let alive = true;
    AccessibilityInfo.isScreenReaderEnabled().then(
      (on) => {
        if (alive && !on) setPlaying(true);
      },
      () => {},
    );
    return () => {
      alive = false;
    };
  }, [reduced, autoplay]);

  useEffect(() => {
    const app = AppState.addEventListener('change', (s) => setAppActive(s === 'active'));
    const sr = AccessibilityInfo.addEventListener('screenReaderChanged', (on) => {
      if (on) setPlaying(false);
    });
    return () => {
      app.remove();
      sr.remove();
    };
  }, []);

  useEffect(() => {
    if (!playing || !focused || !appActive || reduced || beat >= last || holdMs <= 0) return;
    const id = setTimeout(() => goTo(beat + 1, true), holdMs);
    return () => clearTimeout(id);
  }, [playing, focused, appActive, reduced, beat, last, holdMs, goTo]);

  const next = useCallback(() => {
    setPlaying(false);
    if (beat < last) goTo(beat + 1, true);
  }, [beat, last, goTo]);
  // Back is a cut: every change in Brilliant's Koch stepper lands inside one 100ms sample.
  const prev = useCallback(() => {
    setPlaying(false);
    if (beat > 0) goTo(beat - 1, false);
  }, [beat, goTo]);
  const replay = useCallback(() => {
    goTo(0, true);
    if (!reduced) setPlaying(true);
  }, [goTo, reduced]);
  const playPause = useCallback(() => {
    if (beat >= last) {
      replay();
      return;
    }
    setPlaying((p) => !p);
  }, [beat, last, replay]);

  const reaction = current ? reactionFor(current, beat, total) : 'point';
  // prettier-ignore
  return { beat, total, seq: change.seq, animate, busy, playing, atEnd: beat >= last, reduced, reaction, next, prev, playPause, replay };
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    backgroundColor: LessonColors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: LessonColors.border,
    overflow: 'hidden',
    padding: CELL_PT * 3,
    gap: CELL_PT * 3,
  },
  dots: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 1, flexWrap: 'wrap' },
  dot: { width: 8, height: 8, backgroundColor: LessonColors.backgroundSelected },
  dotOn: { backgroundColor: LessonColors.accent },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  // 48pt, over the 44pt floor (CONSTITUTION 5.10), matching the design's stepper buttons.
  button: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    backgroundColor: LessonColors.backgroundElement,
    borderWidth: 1,
    borderColor: LessonColors.border,
  },
  buttonMain: { backgroundColor: LessonColors.backgroundSelected, borderColor: LessonColors.accent, borderWidth: 2 },
  buttonOff: { opacity: 0.4 },
  buttonText: { ...LessonTypography.smallBold, color: LessonColors.text },
  captionBox: { minHeight: LessonTypography.bodyMedium.lineHeight * 3, justifyContent: 'center', width: '100%' },
  caption: { ...LessonTypography.bodyMedium, color: LessonColors.text, textAlign: 'center' },
  cue: { width: CUE_SIZE, height: CUE_SIZE, alignItems: 'center', justifyContent: 'center' },
});

/*
 * Secondary text for cards (footer, tags). CONTRAST (CONSTITUTION 5.9), scene-card.tsx's measurement
 * on the same tokens: LessonColors.mutedForeground on the lesson background is 4.01:1, under the 4.5
 * floor; Colors.dark.mutedForeground is 11.16:1 there and 10.65:1 on backgroundElement.
 */
export const CLIP_MUTED = Colors.dark.mutedForeground;
