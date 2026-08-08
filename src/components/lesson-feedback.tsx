/**
 * Per-question feedback, built from the Duolingo reference in refs/videos (video 3, sampled at
 * 6fps around t=124s).
 *
 * What they do the instant you tap Check:
 *   1. a spark bursts AT the button                      ~350ms
 *   2. a verdict bar slides up from the bottom edge      ~260ms, spring
 *   3. the bar carries the verdict AND the next action, so the CTA is inside the reaction
 *
 * The bar is the important part. Ours judged the answer by recolouring an icon and swapping a
 * face, which is a state change, not a reaction. A bar arriving from off-screen is a physical
 * event, and it lands under your thumb where you are already looking.
 *
 * Euphoria palette: success green stays (it is the app's semantic correct colour), wrong uses
 * the violet ramp's deep end rather than Duolingo's red, so a mistake reads as "not yet"
 * rather than as an alarm.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

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
 * The verdict bar. Springs up from the bottom edge and stays until the learner moves on.
 *
 * `children` is the CTA, so the button lives INSIDE the reaction rather than beside it — which
 * is what makes the whole bottom of the screen respond to the answer.
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
    // slightly underdamped so the bar overshoots a few pixels and settles: it should feel
    // thrown into place, not slid
    t.set(withSpring(1, { stiffness: 220, damping: 18 }));
  }, [reduced, t]);

  const style = useAnimatedStyle(() => ({
    opacity: t.get(),
    transform: [{ translateY: (1 - t.get()) * 190 }],
  }));

  const tint = correct ? theme.success : theme.primary;

  return (
    // The tint is only 10% alpha. It needs an OPAQUE base under it or the bar shows whatever it
    // covers — with real authored questions the option list has four long rows and reads straight
    // through the verdict. Opaque background + tint as an overlay keeps the colour, kills the
    // see-through.
    <Animated.View style={[styles.banner, { backgroundColor: theme.background, borderTopColor: tint + '59' }, style]}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: tint + '1A' }]} />
      <View style={styles.verdictRow}>
        <View style={[styles.verdictIcon, { backgroundColor: tint }]}>
          <UIcon name={correct ? 'check' : 'close'} size={17} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText type="heading" style={{ fontSize: FontSize.subhead, lineHeight: 23, color: tint }}>{title}</ThemedText>
          {detail ? (
            <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 2, lineHeight: 18 }}>{detail}</ThemedText>
          ) : null}
        </View>
      </View>
      {children ? <View style={{ marginTop: Spacing.two + 2 }}>{children}</View> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  spark: { position: 'absolute', left: '50%', top: '50%', zIndex: 20 },
  banner: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    overflow: 'hidden', // clip the tint overlay to the rounded top corners
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  verdictRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4 },
  verdictIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});
