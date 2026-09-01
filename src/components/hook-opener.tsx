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

export function HookOpener({ spec, onComplete }: { spec: HookOpenerSpec; onComplete: () => void }) {
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
          <Button label="Begin" onPress={onComplete} style={styles.begin} />
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  begin: { minWidth: 160 },
});
