import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInUp, Keyframe, useReducedMotion } from 'react-native-reanimated';

import { AuthoredSvg } from '@/components/authored-svg';
import { LessonVisual } from '@/components/lesson-visual';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { LessonDesign } from '@/constants/lesson-design';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { HookOpenerSpec } from '@/lib/lesson-steps';

/**
 * BEGIN IS PINNED, like Continue and Got it on every other screen of the lesson.
 *
 * It used to be the last thing in the scroll, so it landed at a different height on every one of
 * the 300 hooks: mid-screen on a short one, half below the bottom edge on applied-accounting 5. The
 * floating Atlas rests at a fixed spot, so his "Stuck on anything? Tap me." bubble (which fires on
 * this exact screen, step index 0) covered Begin on some hooks whichever side of him it was drawn.
 * Both were reproduced on the iPhone 17 simulator. Pinned, Begin is always in the one lane the
 * learner's thumb already knows, and `onFooterHeight` lets the lesson lift Atlas above it the same
 * way it does for the deck.
 */
export function HookOpener({ spec, onComplete, onFooterHeight }: {
  spec: HookOpenerSpec;
  onComplete: () => void;
  /** The pinned footer's measured height, so the floating Atlas can sit above Begin. 0 on unmount. */
  onFooterHeight?: (height: number) => void;
}) {
  useEffect(() => () => onFooterHeight?.(0), [onFooterHeight]);
  const theme = useTheme();
  const reduced = useReducedMotion();
  const textEntrance = reduced ? FadeIn.duration(0) : FadeInUp.duration(500);
  const visualEntrance = reduced
    ? FadeIn.duration(0)
    : new Keyframe({
        0: { opacity: 0, transform: [{ scale: 0.94 }] },
        100: { opacity: 1, transform: [{ scale: 1 }] },
      }).delay(250).duration(600);
  const outcomeEntrance = reduced ? FadeIn.duration(0) : FadeInUp.delay(500).duration(500);

  return (
    <View style={styles.shell}>
    <ScrollView
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}>
      <View style={styles.inner}>
        <Animated.View entering={textEntrance} style={styles.copy}>
          <ThemedText type="display" style={styles.center}>{spec.title}</ThemedText>
          <ThemedText type="body" themeColor="mutedForeground" style={styles.center}>{spec.fact}</ThemedText>
        </Animated.View>

        <Animated.View
          entering={visualEntrance}
          style={[styles.visualStage, { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: theme.primary + '24' }]}>
          {spec.visual ? <LessonVisual visual={spec.visual} bare /> : null}
          {!spec.visual && spec.chartSvg ? (
            <AuthoredSvg xml={spec.chartSvg} label={spec.visualDescription || spec.title} />
          ) : null}
        </Animated.View>

        <Animated.View entering={outcomeEntrance} style={styles.outcome}>
          <ThemedText type="small" style={styles.center}>{spec.outcome}</ThemedText>
        </Animated.View>
      </View>
    </ScrollView>
    <Animated.View
      entering={outcomeEntrance}
      style={styles.footer}
      onLayout={(e) => onFooterHeight?.(e.nativeEvent.layout.height)}>
      <Button label="Begin" onPress={onComplete} />
    </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: LessonDesign.outerGutter,
    // iOS contributes a 62pt status/safe-area strip that the browser viewport does not. These
    // mobile-only gutters recover that space so the exact web composition, including Begin and
    // the floating Atlas lane, still fits without shrinking its type hierarchy.
    paddingTop: 8,
    paddingBottom: 24,
  },
  inner: { width: '100%', maxWidth: 720, alignItems: 'center', gap: 12 },
  copy: { width: '100%', alignItems: 'center', gap: Spacing.two },
  center: { textAlign: 'center' },
  visualStage: {
    width: '100%',
    justifyContent: 'center',
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
  },
  outcome: { width: '100%', alignItems: 'center', gap: Spacing.three },
  /* The deck footer's own geometry (card-deck.tsx), so Begin, Got it and Continue share one lane. */
  footer: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12 },
});
