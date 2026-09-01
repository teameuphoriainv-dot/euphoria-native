/**
 * Per-question feedback matching the canonical web lesson's inline response card.
 *
 * What they do the instant you tap Check:
 *   1. a spark bursts AT the button                      ~350ms
 *   2. an inline semantic response fades in               280ms
 *   3. the response carries the verdict and next action
 *
 * Correct and wrong use the same emerald/red treatment as the website. Reduced Motion resolves
 * the response immediately.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Duration, Ease } from '@/shared/motion/tokens';

/** Eight-point star, drawn once. Sharp points read as an impact; round ones read as a glow. */
const SPARK = (() => {
  const pts: string[] = [];
  const n = 8;
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? 50 : 15;
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join(' L')} Z`;
})();

/**
 * A single flash at the point of interaction. Deliberately FAST — 350ms. Anything slower stops
 * reading as an impact and starts reading as a decoration that needs dismissing.
 */
export function SparkBurst({ size = 150, color = '#C89CF5', delay = 0 }: { size?: number; color?: string; delay?: number }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    t.set(withDelay(delay, withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) })));
  }, [reduced, t, delay]);

  const style = useAnimatedStyle(() => {
    const v = t.get();
    return {
      opacity: v < 0.15 ? v / 0.15 : Math.max(0, 1 - (v - 0.15) / 0.85),
      transform: [{ scale: 0.2 + v * 1.25 }, { rotate: `${v * 45}deg` }],
    };
  });

  if (reduced) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.spark, { width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Path d={SPARK} fill={color} />
      </Svg>
    </Animated.View>
  );
}

/**
 * The inline verdict remains in reading order until the learner moves on. `children` keeps the
 * next action directly attached to the explanation, as it is on web.
 */
export function FeedbackBanner({
  correct,
  title,
  detail,
  children,
}: {
  correct: boolean;
  title: string;
  detail?: string;
  children?: React.ReactNode;
}) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const t = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) { t.set(1); return; }
    t.set(withTiming(1, { duration: Duration.base, easing: Ease.out }));
  }, [reduced, t]);

  const style = useAnimatedStyle(() => ({
    opacity: t.get(),
  }));

  const tint = correct ? theme.success : theme.destructive;

  return (
    <Animated.View style={[styles.banner, { backgroundColor: tint + '1A' }, style]}>
      <ThemedText type="small" style={{ color: tint, textAlign: 'center' }}>{detail || title}</ThemedText>
      {children ? <View style={{ marginTop: Spacing.three, gap: Spacing.three }}>{children}</View> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  spark: { position: 'absolute', left: '50%', top: '50%', zIndex: 20 },
  banner: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
  },
});
