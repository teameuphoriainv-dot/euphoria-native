/**
 * Toggle scene card: one pixel picture with two or three states, switched with big chips. The learner
 * taps, then watches the picture change; labels on the art carry the figures and one caption per state
 * says what the change means. The data and its rules are in lib/mobile-lesson/parts/toggle.ts.
 *
 * WHY IT EXISTS. It is Brilliant's "tap and watch it change" explanation (research.json: guided
 * interaction, labels on the picture, say it once): one small thing to do, then the consequence, on
 * the same picture every time, so the only thing that moves is the idea. It replaced explorables that
 * put two controls and a mascot on one screen and let the answer be read off before the guess.
 *
 * ORDER IS CAUSE, THEN EFFECT (toggleTimes): a new frame crossfades in, the cast acts, the tiles
 * tween, then the labels name the result. The one exception is a state that authored a pause: its
 * labels change in the pause, so a price goes up before a ticket goes grey because of it. The state
 * a card arrives on waits ARRIVAL_DELAY_MS before it moves, so its motion is not spent while the card
 * is still fading in.
 *
 * WORKED once every state has been seen and the last chosen one has landed. The seen set and the
 * chosen state live in useLessonStepState, so Back and forward through the deck keep them.
 *
 * CHIPS ARE BUTTONS (CONSTITUTION 5.10): 48pt, `selected` state, a hint that says what a tap does and
 * whether that state is still unseen. No swipe: one-finger swipes are VoiceOver's own navigation.
 * REDUCE MOTION: a chip cuts straight to its finished picture (toggleRestAt), labels and outlines at
 * once; the caption swaps in place.
 * ONE MASCOT PER SCREEN: no Atlas here, and TOGGLE_HIDES_FLOAT hides the lesson's floating one, which
 * would otherwise sit on the right-hand chip.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { useLessonStepState } from '@/components/lesson-step-session';
import { CLIP_MUTED, useBeat } from '@/components/mobile-lesson/clickthrough/pixel-stage';
import { SceneCaption } from '@/components/mobile-lesson/parts/scene-card';
import { storyScale } from '@/components/mobile-lesson/parts/story-card';
import { StoryPlayer, StoryStage, useStoryArt, type StageChange, type StoryShot } from '@/components/mobile-lesson/parts/story-stage';
import { ThemedText } from '@/components/themed-text';
import { LessonColors, LessonTypography } from '@/constants/lesson-design';
import { Radius } from '@/constants/theme';
import { STORY_H, STORY_W } from '@/lib/mobile-lesson/parts/story';
import { ARRIVAL_DELAY_MS, delayedState, mineLightMs, stripOf, toggleTimes, type ToggleSpec } from '@/lib/mobile-lesson/parts/toggle';
import { SpringPressable } from '@/shared/motion/spring-pressable';

/** Stable identity: the snapshot initializer must not be a new array on every render. */
const FIRST_SEEN: number[] = [0];

type ToggleChange = StageChange & { from: number | null };

export function ToggleSceneCard({ spec, onWorked }: { spec: ToggleSpec; onWorked: () => void }) {
  const reduced = !!useReducedMotion();
  const { art, status } = useStoryArt(spec.artKey);
  const last = spec.states.length - 1;
  const [stored, setSel] = useLessonStepState<number>('toggle.sel', 0);
  const [seen, setSeen] = useLessonStepState<number[]>('toggle.seen', FIRST_SEEN);
  const sel = Math.max(0, Math.min(last, stored));
  // The state on arrival plays its cues once (a picture arriving, like every clip card); a return
  // through Back lands on the saved state and plays it the same way.
  const [change, setChange] = useState<ToggleChange>(() => ({ beat: sel, seq: 0, animate: !reduced, from: null }));
  const authored = spec.states[sel];
  const animate = change.animate && !reduced;
  // Arriving with the card (not a chip tap): the cast waits out the card's fade-in (ARRIVAL_DELAY_MS).
  const arriving = animate && change.from === null;
  const state = useMemo(() => (arriving ? delayedState(authored, ARRIVAL_DELAY_MS) : authored), [arriving, authored]);

  const times = useMemo(() => {
    const from = change.from;
    const before = from === null ? null : spec.states[from];
    const a = from === null ? null : stripOf(spec, from);
    const b = stripOf(spec, sel);
    return toggleTimes(state, {
      frameChanged: !!before && before.frame !== state.frame,
      stripMoves: !!a && !!b && a.h !== b.h,
      arrival: arriving,
      art,
    });
  }, [change.from, sel, spec, state, arriving, art]);

  const lightAt = mineLightMs(spec, sel, art);
  const shot = useMemo<StoryShot>(() => ({
    frame: state.frame,
    cast: state.cast,
    labels: state.labels,
    labelsAt: times.labelsAt,
    strip: spec.strip
      ? {
          spec: spec.strip,
          state: stripOf(spec, sel),
          at: times.stripAt,
          ghostUpAt: times.ghostUpAt,
          ghostDownAt: times.ghostDownAt,
          mineLightAt: !animate ? -1 : lightAt >= 0 && arriving ? lightAt + ARRIVAL_DELAY_MS : lightAt,
        }
      : null,
  }), [state, times, spec, sel, animate, arriving, lightAt]);

  // WORKED: every state seen, and the one on screen has finished changing.
  const busy = useBeat(animate ? times.total : 0, change.seq);
  const allSeen = spec.states.every((_, i) => seen.includes(i));
  const worked = useRef(false);
  useEffect(() => {
    if (allSeen && !busy && !worked.current) {
      worked.current = true;
      onWorked();
    }
  }, [allSeen, busy, onWorked]);

  const choose = useCallback((i: number) => {
    if (i === sel) return;
    setSel(i);
    setSeen((s) => (s.includes(i) ? s : [...s, i]));
    // A new tap during a change cuts to the new state's start: chips never wait on the picture.
    setChange((c) => ({ beat: i, seq: c.seq + 1, animate: true, from: sel }));
    const caption = spec.states[i]?.caption;
    if (caption) AccessibilityInfo.announceForAccessibility(caption);
  }, [sel, setSel, setSeen, spec.states]);

  const [width, setWidth] = useState(0);
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setWidth((v) => (v === w ? v : w));
  }, []);
  const scale = width ? storyScale(width) : 0;
  const drawable = status === 'ready' && !!art && !!art.frames[state.frame];
  const stageH = status === 'missing' || (status === 'ready' && !drawable) ? 0 : STORY_H * (scale || 4);

  return (
    // Scrolls when it must, so the chips never slide under the deck's Back / Got it footer on an SE.
    <ScrollView style={styles.scroll} contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
      <ThemedText style={styles.title} accessibilityRole="header">{spec.title}</ThemedText>

      <StoryPlayer
        scale={scale}
        stageH={stageH}
        onLayout={onLayout}
        footer={
          <View style={styles.captionBox} accessibilityLiveRegion="polite">
            <SceneCaption text={state.caption} change={change} reduced={reduced} />
          </View>
        }
      >
        {stageH > 0 ? (
          <View accessible accessibilityRole="image" accessibilityLabel={state.a11y} style={[styles.stageBox, scale ? { width: STORY_W * scale, height: STORY_H * scale } : null]}>
            {drawable && art && scale ? <StoryStage art={art} shot={shot} change={change} scale={scale} reduced={reduced} /> : null}
          </View>
        ) : null}
      </StoryPlayer>

      <View style={styles.chips}>
        {spec.states.map((s, i) => {
          const on = i === sel;
          const unseen = !seen.includes(i);
          return (
            <SpringPressable
              key={s.chip}
              onPress={() => choose(i)}
              accessibilityRole="button"
              accessibilityLabel={s.chip}
              accessibilityHint={unseen ? 'Shows this picture. Not seen yet.' : 'Shows this picture.'}
              accessibilityState={{ selected: on }}
              style={styles.chipSlot}
            >
              <View style={[styles.chip, on && styles.chipOn]}>
                {/* 1.4x cap: three chips share a 329pt row; past that the labels wrap out of the button. */}
                <ThemedText style={[styles.chipText, on && styles.chipTextOn]} numberOfLines={1} maxFontSizeMultiplier={1.4}>
                  {s.chip}
                </ThemedText>
                {unseen ? <View style={styles.dot} /> : null}
              </View>
            </SpringPressable>
          );
        })}
      </View>

      <ThemedText style={styles.footer}>{spec.footer}</ThemedText>
    </ScrollView>
  );
}

/*
 * CONTRAST (CONSTITUTION 5.9, measured 2026-10-13 on these tokens).
 *   The selected chip is LessonColors.backgroundSelected with a 2pt accent border and
 *   LessonColors.text, 14.36:1, the clip kit's main-button style. The spec asked for a
 *   LessonColors.primary fill, but text on primary measures 3.88:1 (4.27 in pure white), under the
 *   4.5 floor for 14pt text, so the fill moved to the border.
 *   An unselected chip is CLIP_MUTED on LessonColors.backgroundElement, 10.65:1.
 *   The footer is CLIP_MUTED on the lesson background, 11.16:1 (pixel-stage.tsx's measurement).
 *   The caption is LessonColors.text on LessonColors.card, 17.27:1.
 */
const styles = StyleSheet.create({
  scroll: { flex: 1, width: '100%' },
  wrap: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 6 },
  title: { ...LessonTypography.heading, color: LessonColors.text, textAlign: 'center' },
  stageBox: { alignItems: 'center', justifyContent: 'center' },
  /*
   * Reserves three lines, so the chips do not jump between states. The spec reserved four for the
   * 110-character ceiling, but the card then ran 25pt taller than an iPhone 17's deck and the footer's
   * second line sat under Back (simulator, 2026-10-13). IF1's longest caption (106 characters) sets in
   * three lines at default text size; a fourth line at large Dynamic Type grows the box, and the card
   * scrolls.
   */
  captionBox: { minHeight: LessonTypography.bodyMedium.lineHeight * 3, justifyContent: 'center' },
  chips: { flexDirection: 'row', gap: 8, width: '100%' },
  chipSlot: { flex: 1 },
  // 48pt, over the 44pt floor (CONSTITUTION 5.10), matching the clip controls.
  chip: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: Radius.md,
    backgroundColor: LessonColors.backgroundElement,
    borderWidth: 1,
    borderColor: LessonColors.border,
  },
  chipOn: { backgroundColor: LessonColors.backgroundSelected, borderColor: LessonColors.accent, borderWidth: 2 },
  chipText: { ...LessonTypography.smallBold, color: CLIP_MUTED },
  chipTextOn: { color: LessonColors.text },
  // Square, like a pixel: a round dot beside pixel art reads as another product (CONSTITUTION 5.5).
  dot: { position: 'absolute', top: 6, right: 6, width: 6, height: 6, backgroundColor: LessonColors.accent },
  footer: { ...LessonTypography.small, color: CLIP_MUTED, textAlign: 'center' },
});
