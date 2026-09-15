/**
 * The four static card bodies: the claim, the word, the chart and the takeaway.
 *
 * Each one is a single idea on a single screen. There is no scroll view in here on purpose. If a
 * card needs to scroll, the compressor was too generous and the fix belongs in
 * `src/lib/mobile-lesson/overrides.ts`, not in a taller card. `scripts/mobile-deck-audit.mjs`
 * prints exactly which cards are over budget so that queue is visible rather than theoretical.
 */
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { AuthoredSvg } from '@/components/authored-svg';
import { LessonVisual } from '@/components/lesson-visual';
import { ThemedText } from '@/components/themed-text';
import { PixelScene } from '@/components/mobile-lesson/PixelScene';
import { LessonColors, LessonTypography } from '@/constants/lesson-design';
import type { MobileCard } from '@/lib/mobile-lesson/types';

/** Entering motion, or none at all when the learner has asked for none. */
function useEnter(reduced: boolean) {
  return {
    art: reduced ? undefined : FadeIn.duration(260),
    text: reduced ? undefined : FadeInDown.duration(300).delay(90),
  };
}

export function IdeaCard({ card }: { card: Extract<MobileCard, { kind: 'idea' }> }) {
  const reduced = useReducedMotion();
  const enter = useEnter(reduced);
  return (
    <View style={styles.centre}>
      <Animated.View entering={enter.art}>
        <PixelScene scene={card.scene} size={128} />
      </Animated.View>
      <Animated.View entering={enter.text} style={styles.block}>
        <ThemedText style={styles.title}>{card.title}</ThemedText>
        <ThemedText style={styles.body}>{card.body}</ThemedText>
      </Animated.View>
    </View>
  );
}

/**
 * One piece of vocabulary.
 *
 * The web slide highlights up to four terms inline and opens each in a popover. That is a good
 * desktop affordance and a bad phone one: it buries the definition behind a tap on a word the
 * learner has to notice first. Here the word IS the card, so the definition cannot be missed.
 */
export function TermCard({ card }: { card: Extract<MobileCard, { kind: 'term' }> }) {
  const reduced = useReducedMotion();
  const enter = useEnter(reduced);
  return (
    <View style={styles.centre}>
      <Animated.View entering={enter.art}>
        <PixelScene scene={card.scene} size={112} />
      </Animated.View>
      <Animated.View entering={enter.text} style={styles.block}>
        <ThemedText style={styles.kicker}>New word</ThemedText>
        <ThemedText style={styles.term}>{card.term}</ThemedText>
        <ThemedText style={styles.body}>{card.plain}</ThemedText>
      </Animated.View>
    </View>
  );
}

/**
 * An authored chart, kept.
 *
 * 427 of the 432 teaching slides carry a real `AnimatedVisual` with authored labels and authored
 * magnitudes, so unlike the graph steps there is something here worth keeping. `LessonVisual`
 * already draws these and already handles tap-to-explain on the rows, so this card is that
 * component given a screen of its own instead of a corner of one.
 */
export function ChartCard({ card }: { card: Extract<MobileCard, { kind: 'chart' }> }) {
  const reduced = useReducedMotion();
  return (
    <View style={styles.centre}>
      <ThemedText style={styles.kicker}>{card.title}</ThemedText>
      <Animated.View entering={reduced ? undefined : FadeIn.duration(280)} style={styles.chartWrap}>
        {card.visual ? <LessonVisual visual={card.visual} /> : null}
        {!card.visual && card.svg ? <AuthoredSvg xml={card.svg} label={card.title} /> : null}
      </Animated.View>
    </View>
  );
}

export function TakeawayCard({ card }: { card: Extract<MobileCard, { kind: 'takeaway' }> }) {
  const reduced = useReducedMotion();
  const enter = useEnter(reduced);
  return (
    <View style={styles.centre}>
      <Animated.View entering={enter.art}>
        <PixelScene scene={card.scene} size={120} />
      </Animated.View>
      <Animated.View entering={enter.text} style={styles.block}>
        <ThemedText style={styles.kicker}>Remember this</ThemedText>
        <ThemedText style={styles.takeaway}>{card.body}</ThemedText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  centre: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 24,
  },
  block: { alignItems: 'center', gap: 10 },
  chartWrap: { width: '100%' },
  title: {
    ...LessonTypography.title,
    color: LessonColors.text,
    textAlign: 'center',
  },
  term: {
    ...LessonTypography.title,
    color: LessonColors.accent,
    textAlign: 'center',
  },
  body: {
    ...LessonTypography.body,
    color: LessonColors.text,
    textAlign: 'center',
  },
  takeaway: {
    ...LessonTypography.heading,
    color: LessonColors.text,
    textAlign: 'center',
  },
  kicker: {
    ...LessonTypography.label,
    color: LessonColors.mutedForeground,
    textAlign: 'center',
  },
});
