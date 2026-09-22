/**
 * Scene card: a lesson's idea acted out by pixel sprites, one beat at a time, with the lesson's own
 * sentence under the picture. The data and every rule it obeys are in lib/mobile-lesson/parts/scene.ts.
 *
 * WHAT CARRIED OVER FROM BRILLIANT (research 2026-09-22, frame-differenced from their recording):
 *   - It plays once on arrival and then stops. Their Hilbert curve draws for about 1.9s and never
 *     loops, and PixelSprite.tsx records idle loops as a known defect class in this app (the open
 *     4-5 commits/second idle-render investigation), so there is no withRepeat anywhere here.
 *   - Back is a cut, not a tween. Every change in their Koch stepper lands inside one 100ms sample.
 *     Going forward animates only what that beat changes; going back snaps to `stageAt(k)`.
 *   - Back / Play / Next buttons beside a dot pager, and the words sit outside the picture.
 *
 * WORKED. `onWorked` fires once, the first time the last beat is reached, by autoplay or by hand.
 * CardDeck's needsWork() holds Continue until then, which is the only lock this card needs.
 *
 * TIMING. One JS setTimeout per beat, holding `dwellMs(beat)` (motion or reading time, whichever
 * is longer). It is cleared on pause, on unmount, when the screen loses focus and when the app goes
 * to the background, so a scene never advances where nobody can see it.
 *
 * ACCESSIBILITY (CONSTITUTION 5.10).
 *   - Tapping the stage advances a beat; the Next button is the same action for anyone who cannot
 *     or does not tap the picture, and every control is 44pt or larger with its own label.
 *   - With VoiceOver on the scene starts paused, because autoplay would change the caption under
 *     the reader's focus. Each beat change announces its caption.
 *   - Reduce Motion: no autoplay and no Play button. Each beat is the still `stageAt(k)` picture,
 *     sprites show their authored stills, and nothing moves or fades.
 *
 * NO ATLAS INSIDE THE SCENE: lesson.tsx already draws the floating Atlas on every step, and two on
 * one screen breaks CONSTITUTION 5.6 (PINNED). See parts/scene.ts.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, AppState, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useIsFocused } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { LessonColors, LessonTypography } from '@/constants/lesson-design';
import { Colors, Radius } from '@/constants/theme';
import { PixelSpriteView } from '@/lib/pixel/PixelSprite';
import {
  castOf,
  COPY_STAGGER_MS,
  dwellMs,
  markPoint,
  resolveActorSprite,
  stageAt,
  type ActorState,
  type SceneCue,
  type ScenePartSpec,
} from '@/lib/mobile-lesson/parts/scene';
import { Duration, Ease } from '@/shared/motion/tokens';
import { SpringPressable } from '@/shared/motion/spring-pressable';

/** 4pt per art pixel on a 16px sprite. A multiple of 16, so every art edge lands on a whole point. */
const SPRITE_PT = 64;
/** A `count` shows up to ten copies; at 64pt ten would not fit a 361pt stage, at 32pt five per row do. */
const COUNT_PT = 32;
const COUNT_PER_ROW = 5;
const COUNT_GAP = 6;
/** How far each copy in a `stack` sits from the one below, so a pile reads as more than one thing. */
const STACK_STEP = { x: 18, y: -14 };
/** An entrance rises this far. Small on purpose: the motion says "arrived", not "flew in". */
const ENTER_RISE = 12;

/** How the stage should change on this render: animate the beat's cues, or cut straight to it. */
type Change = { beat: number; animate: boolean };

function copyOffsets(state: ActorState): { x: number; y: number }[] {
  if (state.layout === 'count') {
    const rows = Math.ceil(state.copies / COUNT_PER_ROW);
    const perRow = Math.min(state.copies, COUNT_PER_ROW);
    const w = perRow * COUNT_PT + (perRow - 1) * COUNT_GAP;
    const h = rows * COUNT_PT + (rows - 1) * COUNT_GAP;
    return Array.from({ length: state.copies }, (_, i) => ({
      x: -w / 2 + (i % COUNT_PER_ROW) * (COUNT_PT + COUNT_GAP),
      y: -h / 2 + Math.floor(i / COUNT_PER_ROW) * (COUNT_PT + COUNT_GAP),
    }));
  }
  const extra = state.layout === 'stack' ? state.copies - 1 : 0;
  // Centre the whole pile on the mark, not its first copy, so a stack of two stays inside its third.
  const cx = -(extra * STACK_STEP.x) / 2 - SPRITE_PT / 2;
  const cy = -(extra * STACK_STEP.y) / 2 - SPRITE_PT / 2;
  return Array.from({ length: state.layout === 'stack' ? state.copies : 1 }, (_, i) => ({
    x: cx + i * STACK_STEP.x,
    y: cy + i * STACK_STEP.y,
  }));
}

function Actor({
  actorKey,
  state,
  prev,
  cue,
  change,
  stage,
  reduced,
}: {
  actorKey: string;
  state: ActorState;
  prev: ActorState | undefined;
  cue: SceneCue | undefined;
  change: Change;
  stage: { w: number; h: number };
  reduced: boolean;
}) {
  const sprite = useMemo(() => resolveActorSprite(actorKey), [actorKey]);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!stage.w) return;
    const to = markPoint(state.mark);
    const tx = to.x * stage.w;
    const ty = to.y * stage.h;
    const animate = change.animate && !reduced && !!cue;
    if (!animate) {
      // A cut: Back, a jump, reduced motion, or an actor this beat does not touch.
      x.set(tx);
      y.set(ty);
      opacity.set(state.visible ? 1 : 0);
      return;
    }
    const delay = cue.atMs ?? 0;
    const enterTiming = { duration: Duration.screen, easing: Ease.enter };
    if (cue.do === 'exit') {
      opacity.set(withDelay(delay, withTiming(0, { duration: Duration.exit, easing: Ease.exitCurve })));
      return;
    }
    if (cue.do === 'slide') {
      const fromMark = cue.from ?? (prev?.visible ? prev.mark : state.mark);
      const from = markPoint(fromMark);
      x.set(from.x * stage.w);
      y.set(from.y * stage.h);
      if (!prev?.visible) opacity.set(1);
      x.set(withDelay(delay, withTiming(tx, enterTiming)));
      y.set(withDelay(delay, withTiming(ty, enterTiming)));
      // An actor sliding off stage leaves it; stageAt already counts it hidden.
      if (!state.visible) opacity.set(withDelay(delay + Duration.screen, withTiming(0, { duration: Duration.instant })));
      return;
    }
    // enter / play / stack / count
    if (prev?.visible && prev.mark === state.mark) {
      x.set(tx);
      y.set(ty);
      opacity.set(1);
      return;
    }
    if (prev?.visible) {
      // Already on stage somewhere else: move there rather than blink out and back. x must not be
      // set to the target first, or the move starts from where it ends and nothing travels.
      const at = markPoint(prev.mark);
      x.set(at.x * stage.w);
      y.set(at.y * stage.h);
      opacity.set(1);
      x.set(withDelay(delay, withTiming(tx, enterTiming)));
      y.set(withDelay(delay, withTiming(ty, enterTiming)));
      return;
    }
    x.set(tx);
    y.set(ty + ENTER_RISE);
    opacity.set(0);
    y.set(withDelay(delay, withTiming(ty, enterTiming)));
    opacity.set(withDelay(delay, withTiming(1, { duration: Duration.base, easing: Ease.enter })));
    // `change` is the trigger; the rest are read fresh for that change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [change, stage.w, stage.h, reduced]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateX: x.get() }, { translateY: y.get() }],
  }));

  if (!sprite) return null;
  const playing = change.animate && !reduced && cue?.do === 'play';
  const offsets = copyOffsets(state);
  const size = state.layout === 'count' ? COUNT_PT : SPRITE_PT;
  const stagger = change.animate && !reduced && (cue?.do === 'stack' || cue?.do === 'count');

  return (
    <Animated.View pointerEvents="none" style={[styles.actor, style]}>
      {offsets.map((o, i) => (
        <Animated.View
          // Keyed on the beat so a new tally re-runs its stagger instead of reusing mounted copies.
          key={`${change.beat}:${i}`}
          entering={stagger && i > 0 ? FadeIn.delay((cue?.atMs ?? 0) + i * COPY_STAGGER_MS).duration(Duration.fast) : undefined}
          style={[styles.copy, { left: o.x, top: o.y }]}
        >
          <PixelSpriteView
            sprite={sprite}
            size={size}
            canvas="dark"
            play={playing && i === 0 ? 'once' : 'none'}
            playKey={change.beat}
          />
        </Animated.View>
      ))}
    </Animated.View>
  );
}

export function SceneCard({ spec, onWorked }: { spec: ScenePartSpec; onWorked: () => void }) {
  const reduced = !!useReducedMotion();
  const focused = useIsFocused();
  const total = spec.beats.length;
  const last = total - 1;

  const [change, setChange] = useState<Change>({ beat: 0, animate: true });
  const beat = change.beat;
  const [playing, setPlaying] = useState(false);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const workedRef = useRef(false);

  const cast = useMemo(() => castOf(spec.beats), [spec.beats]);
  const now = useMemo(() => stageAt(spec.beats, beat), [spec.beats, beat]);
  const before = useMemo(() => (beat > 0 ? stageAt(spec.beats, beat - 1) : undefined), [spec.beats, beat]);

  const goTo = useCallback(
    (k: number, animate: boolean) => {
      const next = Math.max(0, Math.min(last, k));
      setChange({ beat: next, animate });
      AccessibilityInfo.announceForAccessibility(spec.beats[next].caption);
      if (next === last) {
        setPlaying(false);
        if (!workedRef.current) {
          workedRef.current = true;
          onWorked();
        }
      }
    },
    [last, spec.beats, onWorked],
  );

  /*
   * AUTOPLAY ON ARRIVAL, UNLESS REDUCE MOTION OR VOICEOVER. The screen-reader check is async, so
   * the card mounts paused and starts only once it knows nobody is reading it with VoiceOver.
   */
  useEffect(() => {
    if (reduced) return;
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
  }, [reduced]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setAppActive(s === 'active'));
    return () => sub.remove();
  }, []);

  /*
   * VOICEOVER TURNED ON MID-SCENE. The check above runs once, so without this a learner who
   * starts VoiceOver while the scene autoplays would have captions changing under their focus,
   * the exact thing starting paused exists to prevent (review 2026-09-22).
   */
  useEffect(() => {
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', (on) => {
      if (on) setPlaying(false);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!playing || !focused || !appActive || reduced || beat >= last) return;
    const id = setTimeout(() => goTo(beat + 1, true), dwellMs(spec.beats[beat]));
    return () => clearTimeout(id);
  }, [playing, focused, appActive, reduced, beat, last, spec.beats, goTo]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setStage((s) => (s.w === w ? s : { w, h: (w * 10) / 16 }));
  }, []);

  const next = useCallback(() => {
    setPlaying(false);
    if (beat < last) goTo(beat + 1, true);
  }, [beat, last, goTo]);
  const back = useCallback(() => {
    setPlaying(false);
    if (beat > 0) goTo(beat - 1, false);
  }, [beat, goTo]);
  const playPause = useCallback(() => {
    if (beat >= last) {
      goTo(0, true);
      setPlaying(true);
      return;
    }
    setPlaying((p) => !p);
  }, [beat, last, goTo]);

  const caption = spec.beats[beat].caption;
  const atEnd = beat >= last;
  const playLabel = atEnd ? 'Replay' : playing ? 'Pause' : 'Play';

  return (
    <View style={styles.wrap}>
      <ThemedText style={styles.prompt}>{spec.prompt}</ThemedText>

      {/*
       * The stage is a tap target for sighted touch users only. It is hidden from VoiceOver because
       * the pictures carry no words; the caption and the Next button carry the beat.
       */}
      <Pressable
        onPress={next}
        onLayout={onLayout}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        style={[styles.stage, stage.h ? { height: stage.h } : null]}
      >
        {cast.map((key) => {
          const cue = spec.beats[beat].cast.find((c) => c.actor === key);
          return (
            <Actor
              key={key}
              actorKey={key}
              state={now[key]}
              prev={before?.[key]}
              cue={cue}
              change={change}
              stage={stage}
              reduced={reduced}
            />
          );
        })}
      </Pressable>

      <Animated.View key={beat} entering={reduced ? undefined : FadeIn.duration(Duration.base)} style={styles.captionBox}>
        <ThemedText style={styles.caption}>{caption}</ThemedText>
      </Animated.View>

      <View
        style={styles.pager}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`Beat ${beat + 1} of ${total}`}
        accessibilityValue={{ min: 1, max: total, now: beat + 1 }}
      >
        {spec.beats.map((_, i) => (
          <View key={i} style={[styles.dot, i === beat && styles.dotOn]} />
        ))}
      </View>

      <View style={styles.controls}>
        <SpringPressable
          onPress={back}
          disabled={beat === 0}
          accessibilityRole="button"
          accessibilityLabel="Previous beat"
          accessibilityState={{ disabled: beat === 0 }}
        >
          <View style={[styles.button, beat === 0 && styles.buttonOff]}>
            <ThemedText style={styles.buttonText}>Back</ThemedText>
          </View>
        </SpringPressable>
        {reduced ? null : (
          <SpringPressable
            onPress={playPause}
            accessibilityRole="button"
            accessibilityLabel={atEnd ? 'Replay the scene' : playing ? 'Pause the scene' : 'Play the scene'}
          >
            <View style={[styles.button, styles.buttonMain]}>
              <ThemedText style={styles.buttonText}>{playLabel}</ThemedText>
            </View>
          </SpringPressable>
        )}
        <SpringPressable
          onPress={next}
          disabled={atEnd}
          accessibilityRole="button"
          accessibilityLabel="Next beat"
          accessibilityState={{ disabled: atEnd }}
        >
          <View style={[styles.button, atEnd && styles.buttonOff]}>
            <ThemedText style={styles.buttonText}>Next</ThemedText>
          </View>
        </SpringPressable>
      </View>
    </View>
  );
}

/*
 * CONTRAST follows lever-card.tsx's measurements (2026-09-22, CONSTITUTION 5.9), which use the same
 * tokens: LessonColors.mutedForeground on the lesson background is 4.01:1, under the 4.5 floor, so
 * the prompt uses Colors.dark.mutedForeground (11.16:1 there, 10.65:1 on backgroundElement). The
 * caption and button labels are LessonColors.text on backgroundElement / backgroundSelected, which
 * clears 4.5 comfortably. Hex values are named by token only: design-rules-pin counts literals.
 */
const MUTED = Colors.dark.mutedForeground;

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 16, width: '100%' },
  prompt: { ...LessonTypography.label, color: MUTED, textAlign: 'center' },
  stage: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: LessonColors.backgroundElement,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: LessonColors.border,
    overflow: 'hidden',
  },
  actor: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  copy: { position: 'absolute' },
  // Reserves three lines (the 125-character ceiling) so the controls do not jump between beats.
  captionBox: { minHeight: LessonTypography.bodyMedium.lineHeight * 3, justifyContent: 'center', width: '100%' },
  caption: { ...LessonTypography.bodyMedium, color: LessonColors.text, textAlign: 'center' },
  pager: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', minHeight: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: LessonColors.backgroundSelected },
  dotOn: { backgroundColor: LessonColors.accent },
  controls: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  button: {
    minWidth: 76,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    backgroundColor: LessonColors.backgroundElement,
    borderWidth: 1,
    borderColor: LessonColors.border,
  },
  buttonMain: { backgroundColor: LessonColors.backgroundSelected, borderColor: LessonColors.accent, borderWidth: 2 },
  buttonOff: { opacity: 0.4 },
  buttonText: { ...LessonTypography.smallBold, color: LessonColors.text },
});
