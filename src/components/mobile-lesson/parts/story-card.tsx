/**
 * Story card: a short pixel story inside a deck, paced by the learner. Three to six beats in the
 * lesson's own world (the opener's night orchard), characters that walk in and props that move, one
 * caption per beat. The data and every rule it obeys are in lib/mobile-lesson/parts/story.ts; the
 * pictures in lib/pixel/stories.
 *
 * WHY IT EXISTS (owner brief 2026-10-12): "pixel art stories with animations that are cool, high
 * quality and work really well on the phone, placed AS A CARD IN THE LESSON", and "right now you
 * assume they already know so much". A story starts with a person and a thing a teenager already
 * knows (birthday money, movie tickets) before any word is named (research.json: concreteness
 * fading, design for zero prior knowledge).
 *
 * LEARNER-PACED BY DEFAULT (Mayer, segmenting). A beat's motion plays once on arrival and the next
 * beat waits for Next or a tap on the picture. Play stays available for a learner who wants it to run;
 * the clock is the clip kit's useClipTimeline, so autoplay, VoiceOver, focus and background rules are
 * the ones every clip card already has. Got it unlocks once the last beat's motion has LANDED
 * (`onWorked`, once), not the moment it is tapped: on the simulator Continue lit while the previous
 * beat's caption was still fading out (2026-10-13). Under Reduce Motion a beat has no motion, so it
 * unlocks on arrival.
 *
 * WORDS AT THE SAME MOMENT AS THE MOTION (Mayer, temporal contiguity): each caption swaps in as its
 * beat's motion starts (SceneCaption's out / gap / in), never before the picture changes.
 *
 * REDUCE MOTION: no autoplay and no Play button (the kit), and every beat is a cut to its finished
 * picture (storyRestAt); the frame's ambient layers rest (PixelSceneView).
 *
 * VOICEOVER: the stage is one image whose label is the beat's `a11y` line, with an activate action
 * that means Next; the caption is announced on every beat (the kit); the controls are labelled.
 *
 * ONE MASCOT PER SCREEN (CONSTITUTION 5.6): this card draws no Atlas, and STORY_HIDES_FLOAT tells
 * the lesson to hide its floating one, so it never covers the stage or the controls.
 *
 * IF THE ART FAILS the card shows the captions and the same controls on a plain surface, so the last
 * beat, and with it Got it, can always be reached.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type AccessibilityActionEvent, type LayoutChangeEvent } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { ClipControls, CLIP_MUTED, useClipTimeline } from '@/components/mobile-lesson/clickthrough/pixel-stage';
import { ProgressLine, SceneCaption } from '@/components/mobile-lesson/parts/scene-card';
import { StoryPlayer, StoryStage, useStoryArt, type StageChange, type StoryShot } from '@/components/mobile-lesson/parts/story-stage';
import { ThemedText } from '@/components/themed-text';
import { LessonColors, LessonTypography } from '@/constants/lesson-design';
import { Radius } from '@/constants/theme';
import { beatHoldMs } from '@/lib/mobile-lesson/clickthrough/timing';
import { STORY_H, STORY_W, storyMotionMs, type StorySpec } from '@/lib/mobile-lesson/parts/story';

export { StoryPlayer, StoryStage, useStoryArt } from '@/components/mobile-lesson/parts/story-stage';
export type { StageChange, StageStrip, StoryArtState, StoryShot } from '@/components/mobile-lesson/parts/story-stage';

/**
 * Points per scene pixel for a stage `width` points wide: whole numbers only, so every art pixel lands
 * on whole points and stays sharp. 4 on any phone 375pt or wider (a 320 x 240 stage), 3 on an SE.
 * The spec's floor is 3; 2 exists only so a narrower container shrinks the art instead of clipping it.
 */
export function storyScale(width: number): number {
  return Math.max(2, Math.min(4, Math.floor(width / STORY_W)));
}

export function StoryCard({ spec, onWorked }: { spec: StorySpec; onWorked: () => void }) {
  const reduced = !!useReducedMotion();
  const { art, status } = useStoryArt(spec.artKey);
  const clipBeats = useMemo(
    () => spec.beats.map((b) => ({ caption: b.caption, motionMs: storyMotionMs(b, art) })),
    [spec.beats, art],
  );
  const timeline = useClipTimeline(clipBeats, { autoplay: spec.autoplay ?? false });
  const { beat, seq, animate, busy, playing, atEnd, next } = timeline;
  // Worked when the last beat has landed (busy is derived per beat, so it is true on arrival).
  const worked = useRef(false);
  useEffect(() => {
    if (atEnd && !busy && !worked.current) {
      worked.current = true;
      onWorked();
    }
  }, [atEnd, busy, onWorked]);
  const change = useMemo<StageChange>(() => ({ beat, seq, animate }), [beat, seq, animate]);
  const current = spec.beats[beat];

  const [width, setWidth] = useState(0);
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setWidth((v) => (v === w ? v : w));
  }, []);
  const scale = width ? storyScale(width) : 0;
  const drawable = status === 'ready' && !!art && !!current && !!art.frames[current.frame];
  // No art at all: the stage folds away and the captions carry the story (the fallback above).
  const stageH = status === 'missing' || (status === 'ready' && !drawable) ? 0 : STORY_H * (scale || 4);

  const shot = useMemo<StoryShot | null>(
    () => (current ? { frame: current.frame, cast: current.cast, labels: current.labels, labelsAt: storyMotionMs(current, art) } : null),
    [current, art],
  );

  // The picture is a second Next for touch users; like the button, it waits for the beat to land.
  const tapStage = useCallback(() => {
    if (!busy && !atEnd) next();
  }, [busy, atEnd, next]);
  const onAction = useCallback((e: AccessibilityActionEvent) => {
    if (e.nativeEvent.actionName === 'activate') tapStage();
  }, [tapStage]);

  if (!current) return null;
  return (
    /*
     * Scrolls when it must. The card is about 470pt tall at a 4x stage and default text; the deck
     * leaves an SE about 385pt and large Dynamic Type grows the caption, and Next is the only way to
     * the beat that unlocks Got it, so it must never sit under the deck's footer (scene-card.tsx
     * shipped that defect first).
     */
    <ScrollView style={styles.scroll} contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
      <ThemedText style={styles.title} accessibilityRole="header">{spec.title}</ThemedText>

      <StoryPlayer
        scale={scale}
        stageH={stageH}
        onLayout={onLayout}
        footer={
          <View style={styles.captionBar}>
            {spec.tag ? (
              <View style={styles.tag}>
                <ThemedText style={styles.tagText} maxFontSizeMultiplier={1.4}>{spec.tag}</ThemedText>
              </View>
            ) : null}
            <ProgressLine change={change} playing={playing} holdMs={beatHoldMs(clipBeats[beat])} reduced={reduced} color={LessonColors.accent} />
            <View style={styles.captionBox}>
              <SceneCaption text={current.caption} change={change} reduced={reduced} />
            </View>
          </View>
        }
      >
        {stageH > 0 ? (
          <Pressable
            onPress={tapStage}
            accessible
            accessibilityRole="image"
            accessibilityLabel={current.a11y}
            accessibilityHint={atEnd ? undefined : 'Double tap for the next part of the story'}
            accessibilityActions={[{ name: 'activate', label: 'Next' }]}
            onAccessibilityAction={onAction}
            style={[styles.stageBox, scale ? { width: STORY_W * scale, height: STORY_H * scale } : null]}
          >
            {drawable && art && scale && shot ? <StoryStage art={art} shot={shot} change={change} scale={scale} reduced={reduced} /> : null}
          </Pressable>
        ) : null}
      </StoryPlayer>

      <ClipControls timeline={timeline} />
    </ScrollView>
  );
}

/*
 * CONTRAST (CONSTITUTION 5.9, measured 2026-10-13 on these tokens). The caption is LessonColors.text
 * on LessonColors.card, 17.27:1. The tag is CLIP_MUTED on LessonColors.backgroundSelected, 8.86:1.
 * The title is LessonColors.text on the lesson background. Hex values are named by token only:
 * design-rules-pin counts literals, comments included.
 */
const styles = StyleSheet.create({
  scroll: { flex: 1, width: '100%' },
  wrap: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8 },
  title: { ...LessonTypography.heading, color: LessonColors.text, textAlign: 'center' },
  stageBox: { alignItems: 'center', justifyContent: 'center' },
  captionBar: { gap: 8 },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.hairline,
    backgroundColor: LessonColors.backgroundSelected,
  },
  tagText: { ...LessonTypography.label, color: CLIP_MUTED },
  // Reserves three lines (the 125-character ceiling) so the controls never jump between beats.
  captionBox: { minHeight: LessonTypography.bodyMedium.lineHeight * 3, justifyContent: 'center' },
});
