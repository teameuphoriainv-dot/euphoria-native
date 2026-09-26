/**
 * The four static card bodies: the claim, the word, the chart and the takeaway.
 *
 * Each one is a single idea on a single screen. If a card's TEXT runs long, the compressor was too
 * generous and the fix belongs in `src/lib/mobile-lesson/overrides.ts`, not in a taller card.
 * `scripts/mobile-deck-audit.mjs` prints exactly which cards are over budget.
 *
 * THE FRAME SCROLLS ANYWAY, AS A FLOOR, NOT AS THE DESIGN. Authored charts are not compressible:
 * a flow of eleven steps is eleven rows. Before <CardFrame>, `centre` was a flex:1 column with
 * justifyContent centre and nothing else, so a chart taller than the stage centred on it and spilled
 * out of BOTH ends. Reproduced on the iPhone 17 simulator, applied-accounting lesson 5, "From Net
 * Income to Free Cash Flow": the card label went under the lesson header and the chart's last rows
 * and its "Tap any of these" line painted over the deck's Back button. A card that fits is laid out
 * exactly as before (flexGrow + centre); only a card that cannot fit scrolls, inside its own stage.
 */
import { useState, type ReactNode } from 'react';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, View } from 'react-native';
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

/**
 * Centres a card that fits and scrolls one that does not, never painting past its stage.
 *
 * The indicator only shows when there is somewhere to scroll to, so a card that fits looks exactly
 * like the old static column.
 */
function CardFrame({ children }: { children: ReactNode }) {
  const [frame, setFrame] = useState(0);
  const [content, setContent] = useState(0);
  const overflows = frame > 0 && content > frame + 1;
  /*
   * Rows that scroll under the deck's dots or down into Back fade out rather than being sliced by
   * the frame edge. A MASK, not a painted gradient: the lesson sits on the starfield, so any solid
   * colour laid over the edge would show as a band. The mask is fully opaque when the card fits,
   * so a fitting card renders exactly as it did before; it stays mounted either way so the scroll
   * view is never remounted (and never re-measured) when `overflows` flips.
   */
  const fade = overflows && frame > 0 ? Math.min(0.12, CARD_EDGE_FADE / frame) : 0;
  return (
    <MaskedView
      style={styles.frame}
      maskElement={
        <LinearGradient
          style={StyleSheet.absoluteFill}
          colors={['transparent', '#000', '#000', 'transparent']}
          locations={fade > 0 ? [0, fade, 1 - fade, 1] : [0, 0.0001, 0.9999, 1]}
        />
      }>
      <ScrollView
        style={styles.frame}
        contentContainerStyle={[styles.centre, overflows && styles.centreScrolling]}
        showsVerticalScrollIndicator={overflows}
        scrollEnabled={overflows}
        bounces={overflows}
        onLayout={(e) => setFrame(e.nativeEvent.layout.height)}
        onContentSizeChange={(_w, h) => setContent(h)}>
        {children}
      </ScrollView>
    </MaskedView>
  );
}

/** How far the fade reaches at each edge of a scrolling card, in points. */
const CARD_EDGE_FADE = 28;

/** Case- and punctuation-blind, because the deck label and the chart title are authored apart. */
const sameWords = (a?: string, b?: string) =>
  !!a && !!b && a.toLowerCase().replace(/[^a-z0-9]/g, '') === b.toLowerCase().replace(/[^a-z0-9]/g, '');

export function IdeaCard({ card }: { card: Extract<MobileCard, { kind: 'idea' }> }) {
  const reduced = useReducedMotion();
  const enter = useEnter(reduced);
  return (
    <CardFrame>
      <Animated.View entering={enter.art}>
        <PixelScene scene={card.scene} size={128} />
      </Animated.View>
      <Animated.View entering={enter.text} style={styles.block}>
        <ThemedText style={styles.title}>{card.title}</ThemedText>
        <ThemedText style={styles.body}>{card.body}</ThemedText>
      </Animated.View>
    </CardFrame>
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
    <CardFrame>
      <Animated.View entering={enter.art}>
        <PixelScene scene={card.scene} size={112} />
      </Animated.View>
      <Animated.View entering={enter.text} style={styles.block}>
        <ThemedText style={styles.kicker}>New word</ThemedText>
        <ThemedText style={styles.term}>{card.term}</ThemedText>
        <ThemedText style={styles.body}>{card.plain}</ThemedText>
      </Animated.View>
    </CardFrame>
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
    <CardFrame>
      {/* The kicker repeats the chart's own title on most chart cards ("COMPOUNDING $10,000 AT
          10%" over "Compounding $10,000 at 10%"). Said once, by the chart. */}
      {sameWords(card.title, card.visual?.title) ? null : <ThemedText style={styles.kicker}>{card.title}</ThemedText>}
      <Animated.View entering={reduced ? undefined : FadeIn.duration(280)} style={styles.chartWrap}>
        {card.visual ? <LessonVisual visual={card.visual} /> : null}
        {!card.visual && card.svg ? <AuthoredSvg xml={card.svg} label={card.title} /> : null}
      </Animated.View>
    </CardFrame>
  );
}

export function TakeawayCard({ card }: { card: Extract<MobileCard, { kind: 'takeaway' }> }) {
  const reduced = useReducedMotion();
  const enter = useEnter(reduced);
  return (
    <CardFrame>
      <Animated.View entering={enter.art}>
        <PixelScene scene={card.scene} size={120} />
      </Animated.View>
      <Animated.View entering={enter.text} style={styles.block}>
        <ThemedText style={styles.kicker}>Remember this</ThemedText>
        <ThemedText style={styles.takeaway}>{card.body}</ThemedText>
      </Animated.View>
    </CardFrame>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1 },
  centre: {
    flexGrow: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 24,
  },
  /* Room for the edge fades, so the first and last rows can scroll fully clear of them. */
  centreScrolling: { paddingVertical: CARD_EDGE_FADE },
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
