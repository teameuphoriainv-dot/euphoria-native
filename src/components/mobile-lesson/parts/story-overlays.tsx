/**
 * The overlays StoryStage lays on its picture: the toggle's strip of tiles and the labels pinned on the
 * art. Split out of story-stage.tsx, which draws the picture and its actors; both read one StageChange
 * so a cut or a change reaches the overlays on the same render as the picture.
 *
 * Every timing comes from the card (toggleTimes in parts/toggle.ts), so the order the learner sees,
 * cause then effect, is decided in one pure, checkable place and only performed here.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming, type SharedValue } from 'react-native-reanimated';

import { CLIP_MUTED } from '@/components/mobile-lesson/clickthrough/pixel-stage';
import { ThemedText } from '@/components/themed-text';
import { LessonColors, LessonTypography } from '@/constants/lesson-design';
import { Radius } from '@/constants/theme';
import { ACTOR_EXIT_MS } from '@/lib/mobile-lesson/parts/scene';
import { LABEL_IN_MS, type StoryLabel } from '@/lib/mobile-lesson/parts/story';
import { OUTLINE_IN_MS, STRIP_MS, type ToggleStrip, type ToggleStripState } from '@/lib/mobile-lesson/parts/toggle';
import { Ease } from '@/shared/motion/tokens';

/** Which beat or state, which change of it, and whether to animate (forward) or cut (Back, Reduce Motion). */
export type StageChange = { beat: number; seq: number; animate: boolean };

export type StageStrip = {
  spec: ToggleStrip;
  state: ToggleStripState | null;
  /** ms after the change: the tiles start to tween (or appear). */
  at: number;
  /** ms after the change the dashed outlines fade in; -1 for none. */
  ghostUpAt: number;
  ghostDownAt: number;
  /** ms after the change the learner's tile lights up; -1 for lit from the start. */
  mineLightAt: number;
};


/* ── the strip ─────────────────────────────────────────────────────────────────────────────────── */

/** The tiles that are not the learner's step back (contrast measured below). */
const OTHER_TILE_OPACITY = 0.55;

/** A dashed outline as alternating pixels round a box, open at the bottom where it meets the ground. */
function outlineCells(x: number, top: number, w: number, h: number): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const edge = j === 0 || i === 0 || i === w - 1;
      if (edge && (i + j) % 2 === 0) out.push({ x: x + i, y: top + j });
    }
  }
  return out;
}

function Outline({ cells, color, shown, scale }: { cells: { x: number; y: number }[]; color: string; shown: SharedValue<number>; scale: number }) {
  const style = useAnimatedStyle(() => ({ opacity: shown.get() }));
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      {cells.map((c) => (
        <View key={`${String(c.x)}:${String(c.y)}`} style={[styles.abs, { left: c.x * scale, top: c.y * scale, width: scale, height: scale, backgroundColor: color }]} />
      ))}
    </Animated.View>
  );
}

/*
 * TILE COLOURS (CONSTITUTION 5.9, measured 2026-10-13 against the frame's darkest field, IF_PALETTE
 * v, and its mid field V). LessonColors.accent is 4.90:1 on v and 3.69:1 on V. The tiles that are not
 * the learner's are CLIP_MUTED at OTHER_TILE_OPACITY (0.55): 3.22:1 on V and 3.74:1 on v, so they
 * still clear the 3:1 floor for graphics but no longer outshine her accent tile. At full strength
 * (7.04:1 on V) they were the brightest thing in the night scene and pulled the eye off hers
 * (simulator review, 2026-10-13); 0.5 measured 2.93:1 on V, under the floor. The upper outline is LessonColors.text (11.41:1 on V);
 * the lower one, drawn over the accent tile, is LessonColors.warning, which is only 2.12:1 against
 * the accent it crosses, so it is a dashed line whose meaning the "Can lose" label carries.
 */
export function StripLayer({ strip, change, scale }: { strip: StageStrip; change: StageChange; scale: number }) {
  const { spec, state } = strip;
  const h = useSharedValue(state?.h ?? spec.restH);
  const shown = useSharedValue(state ? 1 : 0);
  const mine = useSharedValue(1);
  const up = useSharedValue(state?.ghostUp !== undefined ? 1 : 0);
  const down = useSharedValue(state?.ghostDown !== undefined ? 1 : 0);
  // The outlines keep their last shape while they fade, or they would vanish the moment a state
  // without them arrived. Followed during render, React's pattern for state that tracks a prop.
  const [lastUp, setLastUp] = useState(state?.ghostUp);
  const [lastDown, setLastDown] = useState(state?.ghostDown);
  if (state?.ghostUp !== undefined && state.ghostUp !== lastUp) setLastUp(state.ghostUp);
  if (state?.ghostDown !== undefined && state.ghostDown !== lastDown) setLastDown(state.ghostDown);

  useEffect(() => {
    if (!state) {
      shown.set(change.animate ? withTiming(0, { duration: ACTOR_EXIT_MS, easing: Ease.exitCurve }) : 0);
      up.set(0);
      down.set(0);
      return;
    }
    const wasHidden = shown.get() < 0.5;
    if (!change.animate) {
      h.set(state.h);
      shown.set(1);
      mine.set(1);
      up.set(state.ghostUp !== undefined ? 1 : 0);
      down.set(state.ghostDown !== undefined ? 1 : 0);
      return;
    }
    if (wasHidden) {
      h.set(state.h);
      shown.set(withDelay(strip.at, withTiming(1, { duration: LABEL_IN_MS, easing: Ease.enter })));
    } else {
      // From wherever the tiles are, never redrawn from zero; Ease.enter never passes its end.
      h.set(withDelay(strip.at, withTiming(state.h, { duration: STRIP_MS, easing: Ease.enter })));
    }
    if (strip.mineLightAt >= 0) {
      mine.set(0);
      mine.set(withDelay(strip.mineLightAt, withTiming(1, { duration: LABEL_IN_MS, easing: Ease.enter })));
    } else {
      mine.set(1);
    }
    up.set(0);
    down.set(0);
    if (strip.ghostUpAt >= 0) up.set(withDelay(strip.ghostUpAt, withTiming(1, { duration: OUTLINE_IN_MS, easing: Ease.enter })));
    if (strip.ghostDownAt >= 0) down.set(withDelay(strip.ghostDownAt, withTiming(1, { duration: OUTLINE_IN_MS, easing: Ease.enter })));
    // `change.seq` is the trigger; the state and times are read fresh for that change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [change.seq, change.animate]);

  const pitch = spec.tileW + spec.gap;
  const width = spec.count * spec.tileW + (spec.count - 1) * spec.gap;
  const mineX = spec.at.x + spec.mine * pitch;
  const tiles = useAnimatedStyle(() => {
    const px = Math.round(h.get() * scale);
    return { opacity: shown.get(), top: spec.at.y * scale - px, height: px };
  });
  const lit = useAnimatedStyle(() => ({ opacity: mine.get() }));
  const upCells = useMemo(() => (lastUp ? outlineCells(mineX, spec.at.y - lastUp, spec.tileW, lastUp) : []), [mineX, spec.at.y, spec.tileW, lastUp]);
  const downCells = useMemo(() => (lastDown ? outlineCells(mineX, spec.at.y - lastDown, spec.tileW, lastDown) : []), [mineX, spec.at.y, spec.tileW, lastDown]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Behind the tiles: only the part of "could grow to" above the tile shows. */}
      <Outline cells={upCells} color={LessonColors.text} shown={up} scale={scale} />
      <Animated.View style={[styles.abs, { left: spec.at.x * scale, width: width * scale }, tiles]}>
        {Array.from({ length: spec.count }, (_, i) => (
          <View key={i} style={[styles.tile, { left: i * pitch * scale, width: spec.tileW * scale }, i !== spec.mine && styles.otherTile]}>
            {i === spec.mine ? <Animated.View style={[StyleSheet.absoluteFill, styles.mine, lit]} /> : null}
          </View>
        ))}
      </Animated.View>
      <Outline cells={downCells} color={LessonColors.warning} shown={down} scale={scale} />
    </View>
  );
}

/* ── labels ────────────────────────────────────────────────────────────────────────────────────── */

const TONE: Record<StoryLabel['tone'], string> = {
  ink: LessonColors.text,
  accent: LessonColors.accent,
  muted: CLIP_MUTED,
  warn: LessonColors.warning,
};
/** A changing label leaves this fast before its new words arrive. */
const LABEL_OUT_MS = 100;

/**
 * One label, by id. New words for the same id crossfade in place once the picture has landed; a label
 * the new state does not have leaves at once, because it described the picture that is going.
 */
function LabelPill({ label, change, at, scale }: { label: StoryLabel | null; change: StageChange; at: number; scale: number }) {
  const [shown, setShown] = useState<StoryLabel | null>(label);
  const visible = useRef(!!label);
  const opacity = useSharedValue(label && !change.animate ? 1 : 0);
  const arrived = useRef(false);
  useEffect(() => {
    let swap: ReturnType<typeof setTimeout> | undefined;
    if (!arrived.current) {
      arrived.current = true;
      if (label && change.animate) opacity.set(withDelay(at, withTiming(1, { duration: LABEL_IN_MS, easing: Ease.enter })));
      visible.current = !!label;
      return;
    }
    if (!change.animate) {
      opacity.set(label ? 1 : 0);
      visible.current = !!label;
      swap = setTimeout(() => setShown(label), 0);
      return () => clearTimeout(swap);
    }
    if (!label) {
      opacity.set(withTiming(0, { duration: ACTOR_EXIT_MS, easing: Ease.exitCurve }));
      visible.current = false;
      return;
    }
    const same = visible.current && shown && shown.text === label.text && shown.tone === label.tone && shown.at.x === label.at.x && shown.at.y === label.at.y;
    if (same) return;
    const swapAt = visible.current ? Math.max(LABEL_OUT_MS, at) : at;
    if (visible.current) opacity.set(withDelay(swapAt - LABEL_OUT_MS, withTiming(0, { duration: LABEL_OUT_MS, easing: Ease.exitCurve })));
    else opacity.set(0);
    swap = setTimeout(() => {
      setShown(label);
      opacity.set(withTiming(1, { duration: LABEL_IN_MS, easing: Ease.enter }));
    }, swapAt);
    visible.current = true;
    return () => clearTimeout(swap);
    // `change.seq` is the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [change.seq, change.animate]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  const drawn = shown ?? label;
  if (!drawn) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.pill, { left: drawn.at.x * scale, top: drawn.at.y * scale }, style]}>
      {/*
        1.1x cap: a label is pinned to a spot on the art, so it cannot grow far. At 1.3x two pills side by
        side ran into each other at extra-large text (simulator, 2026-10-13). The same words are in the
        caption and the stage's VoiceOver line, which do grow.
      */}
      <ThemedText style={[styles.pillText, { color: TONE[drawn.tone] }]} numberOfLines={1} maxFontSizeMultiplier={1.1}>
        {drawn.text}
      </ThemedText>
    </Animated.View>
  );
}

export function LabelsLayer({ labels, change, at, scale }: { labels: StoryLabel[]; change: StageChange; at: number; scale: number }) {
  const [ids, setIds] = useState<string[]>(() => labels.map((l) => l.id));
  const fresh = labels.filter((l) => !ids.includes(l.id)).map((l) => l.id);
  if (fresh.length) setIds([...ids, ...fresh]);
  return (
    <>
      {ids.map((id) => (
        <LabelPill key={id} label={labels.find((l) => l.id === id) ?? null} change={change} at={at} scale={scale} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
  tile: { position: 'absolute', top: 0, bottom: 0, backgroundColor: CLIP_MUTED },
  otherTile: { opacity: OTHER_TILE_OPACITY },
  mine: { backgroundColor: LessonColors.accent },
  pill: {
    position: 'absolute',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.hairline,
    backgroundColor: LessonColors.card,
    borderWidth: 1,
    borderColor: LessonColors.border,
  },
  pillText: { ...LessonTypography.smallBold, fontVariant: ['tabular-nums'] },
});
