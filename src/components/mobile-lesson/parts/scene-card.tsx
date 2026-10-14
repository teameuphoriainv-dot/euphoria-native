/**
 * Scene card: a lesson's idea as a short Atlas clip. Pixel props act out one beat at a time on a
 * stage floored in the course's colour, Atlas stands on that floor reacting to each beat, and the
 * lesson's own sentence runs underneath like a subtitle. The data and every rule it obeys are in
 * lib/mobile-lesson/parts/scene.ts.
 *
 * WHY IT LOOKS LIKE A VIDEO PLAYER (owner ruling 2026-09-22: "clickthroughs should feel like short
 * animated clips with Atlas"). The first version was a grey box of sprites over a caption, and read
 * as a slideshow. What makes it read as a clip, each piece tied to a frame in research2/frames/:
 *   - One framed player: stage and caption bar share a border, like one screen (Brilliant's card
 *     frame, brilliant-lessons.md M8), not a picture floating above loose text.
 *   - A floor band in the course accent, so the stage is a place Atlas stands in, and Investing's
 *     green clip does not look like Personal Finance's orchid one.
 *   - A thin progress line in the caption bar that fills for exactly as long as autoplay holds the
 *     beat, so the learner can see a beat is timed and when it will move on.
 *   - Captions swap the way Brilliant's screens do: out with a small leftward drift, a beat of
 *     nothing, then in (M7, timing/next.jpg f4-f8; the durations are in parts/scene.ts). Crossfading the two sentences
 *     directly overlaps them for a frame and reads as one garbled line.
 *   - Props stack by dropping onto the pile and tallies stamp in one by one, so a count is watched
 *     happening rather than appearing finished.
 *   - Props rise and grow onto their mark, then give one small swell once they land (the accent),
 *     and Atlas leans toward them on every beat, so each beat has a visible action to follow
 *     (owner ruling 2026-09-24: longer, more animated learn visuals).
 *
 * WHAT CARRIED OVER FROM THE FIRST VERSION, and still holds:
 *   - It plays once on arrival and then stops: no withRepeat anywhere. PixelSprite.tsx records idle
 *     loops as a known defect class in this app (4-5 commits/second from an idle render).
 *   - Back is a cut, not a tween (every Koch stepper change lands inside one 100ms sample).
 *   - Next is disabled while a beat is still moving (Koch's grey ▶, timing/koch.jpg row 2), so a
 *     tap mid-slide cannot start the next caption over a half-finished picture.
 *
 * THE CLOCK is the clip kit's useClipTimeline (clickthrough/pixel-stage.tsx), shared with the
 * stage, predict, build-up and place cards, so every clip has the same autoplay, VoiceOver, focus,
 * background and worked rules and the same controls. `onWorked` fires once at the last beat.
 *
 * ACCESSIBILITY (CONSTITUTION 5.10). Tapping the stage advances; the Next button is the same action.
 * Every control is 48pt. With VoiceOver on the clip starts paused and each beat announces its
 * caption. The stage and Atlas are hidden from VoiceOver: they carry no words.
 * REDUCE MOTION: no autoplay and no Play button (the kit), every beat is the still `stageAt(k)`
 * picture, captions swap in place, the progress line sits full, Atlas makes no entrance, and
 * <Atlas> itself skips its nod and hop, so only his expression changes.
 *
 * ONE MASCOT PER SCREEN (CONSTITUTION 5.6, PINNED): this card draws Atlas, so lesson.tsx must hide
 * its floating Atlas while a scene is the active card. See SCENE_DRAWS_ATLAS in parts/scene.ts.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Atlas } from '@/components/atlas';
import { ClipControls, useClipTimeline } from '@/components/mobile-lesson/clickthrough/pixel-stage';
import { ThemedText } from '@/components/themed-text';
import { LessonColors, LessonTypography } from '@/constants/lesson-design';
import { Colors, Radius } from '@/constants/theme';
import { courseAccent } from '@/lib/course-accents';
import { beatHoldMs } from '@/lib/mobile-lesson/clickthrough/timing';
import { PixelSpriteView } from '@/lib/pixel/PixelSprite';
import {
  ACCENT_MS,
  ACCENT_SCALE,
  ACTOR_ENTER_MS,
  ACTOR_EXIT_MS,
  ACTOR_SLIDE_MS,
  CAPTION_GAP_MS,
  CAPTION_IN_MS,
  CAPTION_OUT_MS,
  castOf,
  COPY_STAGGER_MS,
  copyOffsets,
  COUNT_PT,
  cueDelayMs,
  cueMotionMs,
  markPoint,
  playFrameMs,
  resolveActorSprite,
  sceneMotionMs,
  sceneReaction,
  sceneStage,
  SCENE_ATLAS_INSET,
  SCENE_FLOOR_PT,
  SCENE_STAGE_ASPECT,
  SPRITE_PT,
  stageAt,
  type ActorState,
  type SceneAtlasMood,
  type SceneCue,
  type ScenePartSpec,
} from '@/lib/mobile-lesson/parts/scene';
import { Ease, Spring } from '@/shared/motion/tokens';

/** An entrance rises this far. Small on purpose: the motion says "arrived", not "flew in". */
const ENTER_RISE = 20;
/** An entrance also grows from this scale to full size, on the same monotonic curve as the rise. */
const ENTER_SCALE = 0.8;
/** Atlas leans this far toward the props on each beat, then eases back: he is watching them. */
const ATLAS_LEAN = 8;
const ATLAS_LEAN_IN_MS = 350;
const ATLAS_LEAN_OUT_MS = 650;
/** The caption drifts this far left on its way out, the "few percent" of Brilliant's exit (M7). */
const CAPTION_DRIFT = 8;
/** The floor's top edge, one pixel-art cell tall so the band reads as a step, not a gradient. */
const RIM_PT = 4;
/** A clip's last beat is not the lesson's payoff; lesson complete keeps the full hop. */
const ATLAS_HOP_GAIN = 0.5;
/*
 * Stage geometry (sprite sizes, floor, Atlas's size and inset, copy layout) lives in parts/scene.ts
 * as pure functions, so part-scene-pin can measure that Atlas never overlaps a prop at real phone
 * widths. It first lived here, where no pin could load it, and the "they meet, they do not
 * overlap" claim it carried was measured at a stage width no phone has.
 */

/*
 * FLOOR COLOUR. Alpha is appended to courseAccent(), which is always a 6-digit hex, so the append is
 * real (CONSTITUTION 5.8: appending to hsl renders at full opacity with no error). 1F is 12% and 59
 * is 35%: decoration under the props, well below any text, so no contrast floor applies to it.
 */
const FLOOR_ALPHA = '1F';
const RIM_ALPHA = '59';

/** What the stage is doing on this render: which beat, which change of it, and whether to animate. */
export type Change = { beat: number; seq: number; animate: boolean };

function Actor({
  actorKey,
  state,
  prev,
  cue,
  change,
  area,
  reduced,
}: {
  actorKey: string;
  state: ActorState;
  prev: ActorState | undefined;
  cue: SceneCue | undefined;
  change: Change;
  /** The acting area: the stage above Atlas's floor. */
  area: { w: number; h: number };
  reduced: boolean;
}) {
  const sprite = useMemo(() => resolveActorSprite(actorKey), [actorKey]);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!area.w) return;
    const to = markPoint(state.mark);
    const tx = to.x * area.w;
    const ty = to.y * area.h;
    const animate = change.animate && !reduced && !!cue;
    if (!animate) {
      // A cut: Back, a jump, reduced motion, or an actor this beat does not touch.
      x.set(tx);
      y.set(ty);
      scale.set(1);
      opacity.set(state.visible ? 1 : 0);
      return;
    }
    const delay = cueDelayMs(cue);
    /*
     * The accent: once this cue has landed, a prop still on stage swells to ACCENT_SCALE and back,
     * so the eye lands on what this beat changed. Two monotonic halves, no spring (a prop never
     * overshoots), and it runs once per beat: nothing loops.
     */
    const accentAt = delay + cueMotionMs(cue);
    const accent = () => {
      if (!state.visible) return;
      scale.set(
        withDelay(
          accentAt,
          withSequence(
            withTiming(ACCENT_SCALE, { duration: ACCENT_MS / 2, easing: Ease.enter }),
            withTiming(1, { duration: ACCENT_MS / 2, easing: Ease.enter }),
          ),
        ),
      );
    };
    // Ease.enter is a bezier whose y-controls stay inside 0..1: props never overshoot their mark.
    const move = { duration: ACTOR_SLIDE_MS, easing: Ease.enter };
    if (cue.do === 'exit') {
      scale.set(1);
      opacity.set(withDelay(delay, withTiming(0, { duration: ACTOR_EXIT_MS, easing: Ease.exitCurve })));
      return;
    }
    if (cue.do === 'slide') {
      const fromMark = cue.from ?? (prev?.visible ? prev.mark : state.mark);
      const from = markPoint(fromMark);
      x.set(from.x * area.w);
      y.set(from.y * area.h);
      // An actor not yet on stage fades in as it sets off. Set straight to 1 it popped in at its
      // start mark `atMs` before moving (chart-up in the diversification scene, beat 2).
      if (!prev?.visible) {
        opacity.set(0);
        opacity.set(withDelay(delay, withTiming(1, { duration: ACTOR_ENTER_MS, easing: Ease.enter })));
      }
      x.set(withDelay(delay, withTiming(tx, move)));
      y.set(withDelay(delay, withTiming(ty, move)));
      // An actor sliding off stage leaves it; stageAt already counts it hidden.
      if (!state.visible) opacity.set(withDelay(delay + ACTOR_SLIDE_MS, withTiming(0, { duration: ACTOR_EXIT_MS })));
      scale.set(1);
      accent();
      return;
    }
    // enter / play / stack / count
    if (prev?.visible && prev.mark === state.mark) {
      x.set(tx);
      y.set(ty);
      opacity.set(1);
      scale.set(1);
      accent();
      return;
    }
    if (prev?.visible) {
      // Already on stage somewhere else: move there rather than blink out and back. x must not be
      // set to the target first, or the move starts from where it ends and nothing travels.
      const at = markPoint(prev.mark);
      x.set(at.x * area.w);
      y.set(at.y * area.h);
      opacity.set(1);
      x.set(withDelay(delay, withTiming(tx, move)));
      y.set(withDelay(delay, withTiming(ty, move)));
      scale.set(1);
      accent();
      return;
    }
    x.set(tx);
    y.set(ty + ENTER_RISE);
    opacity.set(0);
    y.set(withDelay(delay, withTiming(ty, { duration: ACTOR_ENTER_MS, easing: Ease.enter })));
    opacity.set(withDelay(delay, withTiming(1, { duration: ACTOR_ENTER_MS, easing: Ease.enter })));
    // Grows in on the same curve as the rise, then gives the beat's accent from full size.
    scale.set(ENTER_SCALE);
    scale.set(
      withDelay(
        delay,
        withSequence(
          withTiming(1, { duration: ACTOR_ENTER_MS, easing: Ease.enter }),
          withTiming(ACCENT_SCALE, { duration: ACCENT_MS / 2, easing: Ease.enter }),
          withTiming(1, { duration: ACCENT_MS / 2, easing: Ease.enter }),
        ),
      ),
    );
    // `change` is the trigger; the rest are read fresh for that change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [change, area.w, area.h, reduced]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateX: x.get() }, { translateY: y.get() }, { scale: scale.get() }],
  }));

  if (!sprite) return null;
  const live = change.animate && !reduced;
  const playing = live && cue?.do === 'play';
  const offsets = copyOffsets(state);
  const size = state.layout === 'count' ? COUNT_PT : SPRITE_PT;
  const tally = live && (cue?.do === 'stack' || cue?.do === 'count');
  // A pile is built by dropping each copy onto it; a tally is stamped. Both one copy at a time.
  const copyIn = cue?.do === 'stack' ? FadeInDown : FadeIn;

  return (
    <Animated.View pointerEvents="none" style={[styles.actor, style]}>
      {offsets.map((o, i) => (
        <Animated.View
          // Keyed on the change so a new tally re-runs its stagger instead of reusing mounted copies.
          key={`${change.seq}:${i}`}
          entering={tally && i > 0 ? copyIn.delay((cue ? cueDelayMs(cue) : 0) + i * COPY_STAGGER_MS).duration(ACTOR_ENTER_MS) : undefined}
          style={[styles.copy, { left: o.x, top: o.y }]}
        >
          <PixelSpriteView
            sprite={sprite}
            size={size}
            canvas="dark"
            play={playing && i === 0 ? 'once' : 'none'}
            playKey={change.seq}
            frameMs={playFrameMs(sprite)}
          />
        </Animated.View>
      ))}
    </Animated.View>
  );
}

/**
 * Atlas standing on the floor. He rises onto it once when the clip mounts (a character move, so the
 * one spring in this card, Spring.bouncy, is allowed its overshoot), then only his face and his
 * built-in nod and hop act. Hidden from VoiceOver: the caption carries every beat.
 */
function AtlasOnFloor({
  mood,
  reaction,
  change,
  reduced,
  size,
}: {
  mood: SceneAtlasMood;
  reaction: 'nod' | 'celebrate';
  change: Change;
  reduced: boolean;
  size: number;
}) {
  const rise = useSharedValue(reduced ? 0 : size / 2);
  const shown = useSharedValue(reduced ? 1 : 0);
  const lean = useSharedValue(0);
  useEffect(() => {
    if (reduced) {
      rise.set(0);
      shown.set(1);
      return;
    }
    rise.set(withSpring(0, Spring.bouncy));
    shown.set(withTiming(1, { duration: ACTOR_ENTER_MS, easing: Ease.enter }));
  }, [reduced, rise, shown]);
  const acts = change.animate && !reduced;
  // Each forward beat he leans toward the props and back, as if watching them act. A character
  // move, played once per beat; under Reduce Motion or on a cut he stays put.
  useEffect(() => {
    if (!acts) {
      lean.set(0);
      return;
    }
    lean.set(
      withSequence(
        withTiming(-ATLAS_LEAN, { duration: ATLAS_LEAN_IN_MS, easing: Ease.enter }),
        withTiming(0, { duration: ATLAS_LEAN_OUT_MS, easing: Ease.enter }),
      ),
    );
    // `change` is the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [change.seq, acts]);
  const style = useAnimatedStyle(() => ({
    opacity: shown.get(),
    transform: [{ translateX: lean.get() }, { translateY: rise.get() }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.atlas, { width: size, height: size }, style]}
    >
      <Atlas
        size={size}
        expression={mood}
        interactive={false}
        nod={acts && reaction === 'nod'}
        nodKey={change.seq}
        celebrate={acts && reaction === 'celebrate'}
        celebrateKey={change.seq}
        celebrateGain={ATLAS_HOP_GAIN}
      />
    </Animated.View>
  );
}

/**
 * The caption, swapped out / gap / in (CAPTION_OUT_MS, CAPTION_GAP_MS, CAPTION_IN_MS). A cut (Back,
 * Reduce Motion) swaps in place. `shown` only changes inside timers, so the text on screen during
 * the fade-out is still the old sentence and the new one never flashes in before its fade.
 */
export function SceneCaption({ text, change, reduced }: { text: string; change: Change; reduced: boolean }) {
  const [shown, setShown] = useState(text);
  const animated = change.animate && !reduced;
  // The clip clock mounts on beat 0 with animate true, so the first run is an arrival, not a swap.
  // Treated as a swap it showed the first caption, faded it out, and faded the same words back in.
  const arrived = useRef(false);
  const opacity = useSharedValue(animated ? 0 : 1);
  const drift = useSharedValue(0);

  useEffect(() => {
    if (!arrived.current) {
      arrived.current = true;
      if (animated) opacity.set(withTiming(1, { duration: CAPTION_IN_MS, easing: Ease.enter }));
      return;
    }
    if (!animated) {
      opacity.set(1);
      drift.set(0);
      // Keep `shown` in step for the next animated change; the render below already shows `text`.
      const sync = setTimeout(() => setShown(text), 0);
      return () => clearTimeout(sync);
    }
    opacity.set(withTiming(0, { duration: CAPTION_OUT_MS, easing: Ease.exitCurve }));
    drift.set(withTiming(-CAPTION_DRIFT, { duration: CAPTION_OUT_MS, easing: Ease.exitCurve }));
    const swap = setTimeout(() => {
      setShown(text);
      drift.set(0);
      opacity.set(withTiming(1, { duration: CAPTION_IN_MS, easing: Ease.enter }));
    }, CAPTION_OUT_MS + CAPTION_GAP_MS);
    return () => clearTimeout(swap);
    // Keyed on the change, not the text: a replay of beat 0 is a new change with the same words.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [change.seq]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.get(), transform: [{ translateX: drift.get() }] }));
  return (
    <Animated.View style={[styles.captionText, style]}>
      <ThemedText style={styles.caption}>{animated ? shown : text}</ThemedText>
    </Animated.View>
  );
}

/**
 * The per-beat progress line. While autoplay runs it fills over exactly the hold the clip clock
 * uses (beatHoldMs), linearly, because it is a timer and not data. Paused, it freezes where it is;
 * a beat reached by hand shows full; under Reduce Motion it is always full and never moves.
 */
export function ProgressLine({
  change,
  playing,
  holdMs,
  reduced,
  color,
}: {
  change: Change;
  playing: boolean;
  holdMs: number;
  reduced: boolean;
  color: string;
}) {
  const p = useSharedValue(1);
  const lastSeq = useRef(change.seq);
  useEffect(() => {
    const newBeat = lastSeq.current !== change.seq;
    lastSeq.current = change.seq;
    if (reduced) {
      p.set(1);
      return;
    }
    if (playing) {
      p.set(0);
      p.set(withTiming(1, { duration: holdMs, easing: Easing.linear }));
      return;
    }
    if (newBeat) p.set(1);
    else cancelAnimation(p);
  }, [change.seq, playing, holdMs, reduced, p]);
  const style = useAnimatedStyle(() => ({ width: `${p.get() * 100}%` }));
  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, { backgroundColor: color }, style]} />
    </View>
  );
}

export function SceneCard({ spec, onWorked }: { spec: ScenePartSpec; onWorked: () => void }) {
  const reduced = !!useReducedMotion();
  const clipBeats = useMemo(
    () => spec.beats.map((b) => ({ caption: b.caption, motionMs: sceneMotionMs(b) })),
    [spec.beats],
  );
  const timeline = useClipTimeline(clipBeats, { onWorked });
  const { beat, seq, animate, busy, playing, atEnd, next } = timeline;
  const change = useMemo<Change>(() => ({ beat, seq, animate }), [beat, seq, animate]);

  const [stage, setStage] = useState(() => sceneStage(0));
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    // Whole 4pt cells, so the floor's rim lands on a pixel edge.
    setStage((s) => (s.w === w ? s : sceneStage(w)));
  }, []);
  const area = stage.area;

  const accent = spec.course ? courseAccent(spec.course) : LessonColors.accent;
  const cast = useMemo(() => castOf(spec.beats), [spec.beats]);
  const now = useMemo(() => stageAt(spec.beats, beat), [spec.beats, beat]);
  const before = useMemo(() => (beat > 0 ? stageAt(spec.beats, beat - 1) : undefined), [spec.beats, beat]);
  const current = spec.beats[beat];

  // The stage is a second Next for touch users; it waits for the beat to finish, like the button.
  const tapStage = useCallback(() => {
    if (!busy && !atEnd) next();
  }, [busy, atEnd, next]);

  return (
    /*
     * Scrolls when it must. The card is about 400pt tall at default text and the deck leaves an SE
     * roughly 385pt, more with Back hidden; at large Dynamic Type the caption alone can pass 200pt.
     * As a plain centred View it overflowed into the deck's footer, covering these controls, and
     * Next is the only way to reach the last beat that unlocks Continue.
     */
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.wrap}
      showsVerticalScrollIndicator={false}
    >
      <ThemedText style={styles.prompt}>{spec.prompt}</ThemedText>

      <View style={styles.player}>
        {/*
         * A tap target for sighted touch users only, hidden from VoiceOver because the pictures
         * carry no words; the caption and the Next button carry the beat.
         */}
        <Pressable
          onPress={tapStage}
          onLayout={onLayout}
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
          style={[styles.stage, stage.h ? { height: stage.h } : null]}
        >
          <View style={[styles.floor, { backgroundColor: accent + FLOOR_ALPHA }]} />
          <View style={[styles.rim, { backgroundColor: accent + RIM_ALPHA }]} />
          {cast.map((key) => (
            <Actor
              key={key}
              actorKey={key}
              state={now[key]}
              prev={before?.[key]}
              cue={current.cast.find((c) => c.actor === key)}
              change={change}
              area={area}
              reduced={reduced}
            />
          ))}
          {/* Mounted once the stage is measured, so his size is final before he rises in. */}
          {area.h ? (
            <AtlasOnFloor
              mood={current.atlas}
              reaction={sceneReaction(current, beat, spec.beats.length)}
              change={change}
              reduced={reduced}
              size={stage.atlasPt}
            />
          ) : null}
        </Pressable>

        <View style={styles.captionBar}>
          <ProgressLine
            change={change}
            playing={playing}
            holdMs={beatHoldMs(clipBeats[beat])}
            reduced={reduced}
            color={accent}
          />
          <View style={styles.captionBox}>
            <SceneCaption text={current.caption} change={change} reduced={reduced} />
          </View>
        </View>
      </View>

      <ClipControls timeline={timeline} />
    </ScrollView>
  );
}

/*
 * CONTRAST (CONSTITUTION 5.9, measured 2026-09-22 on these tokens): LessonColors.mutedForeground on
 * the lesson background is 4.01:1, under the 4.5 floor, so the prompt uses Colors.dark.mutedForeground
 * (11.16:1 there). The caption is LessonColors.text on LessonColors.card, which clears 4.5
 * comfortably, and nothing is ever drawn behind it: the floor band stays inside the stage.
 * Hex values are named by token only: design-rules-pin counts literals.
 */
const MUTED = Colors.dark.mutedForeground;

const styles = StyleSheet.create({
  scroll: { flex: 1, width: '100%' },
  wrap: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8 },
  prompt: { ...LessonTypography.label, color: MUTED, textAlign: 'center' },
  player: {
    width: '100%',
    backgroundColor: LessonColors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: LessonColors.border,
    overflow: 'hidden',
  },
  stage: {
    width: '100%',
    aspectRatio: 1 / SCENE_STAGE_ASPECT,
    backgroundColor: LessonColors.backgroundElement,
    overflow: 'hidden',
  },
  floor: { position: 'absolute', left: 0, right: 0, bottom: 0, height: SCENE_FLOOR_PT },
  rim: { position: 'absolute', left: 0, right: 0, bottom: SCENE_FLOOR_PT - RIM_PT, height: RIM_PT },
  actor: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  copy: { position: 'absolute' },
  atlas: { position: 'absolute', right: SCENE_ATLAS_INSET.right, bottom: SCENE_ATLAS_INSET.bottom },
  captionBar: { borderTopWidth: 1, borderTopColor: LessonColors.border },
  track: { height: 2, backgroundColor: LessonColors.backgroundSelected },
  fill: { height: 2 },
  // Reserves three lines (the 125-character ceiling) so the controls do not jump between beats.
  captionBox: {
    minHeight: LessonTypography.bodyMedium.lineHeight * 3 + 24,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  captionText: { width: '100%' },
  caption: { ...LessonTypography.bodyMedium, color: LessonColors.text, textAlign: 'center' },
});
