/**
 * Onboarding building blocks — matches the design mockups: progress header with back
 * chevron, option cards with icon bubble + radio, growth chart, star rating.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SpringPressable } from '@/shared/motion/spring-pressable';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function BackChevron({ onPress }: { onPress?: () => void }) {
  const theme = useTheme();
  return (
    <SpringPressable haptic={false} onPress={onPress} style={styles.chevron} scaleTo={0.85}>
      <Svg width={18} height={18} viewBox="0 0 24 24">
        <Path d="M14.5 5 8 12l6.5 7" stroke={theme.mutedForeground} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
    </SpringPressable>
  );
}

function Segment({ fill, color, track }: { fill: number; color: string; track: string }) {
  const reduced = useReducedMotion();
  const w = useSharedValue(reduced ? fill : 0);
  useEffect(() => {
    w.value = reduced ? fill : withSpring(fill, { stiffness: 140, damping: 20 });
  }, [fill, reduced, w]);
  const style = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={[styles.seg, { backgroundColor: track }]}>
      <Animated.View style={[styles.segFill, { backgroundColor: color }, style]} />
    </View>
  );
}

export function ProgressHeader({ step, total, onBack }: { step: number; total: number; onBack?: () => void }) {
  const theme = useTheme();
  return (
    <View style={styles.progressRow}>
      <BackChevron onPress={onBack} />
      <View style={styles.segRow}>
        {[0, 1, 2].map((i) => (
          <Segment key={i} fill={Math.max(0, Math.min(1, ((step + 1) / total) * 3 - i))} color={theme.primary} track={theme.muted} />
        ))}
      </View>
    </View>
  );
}

export function RadioDot({ selected }: { selected: boolean }) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const fill = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    fill.value = reduced ? (selected ? 1 : 0) : withSpring(selected ? 1 : 0, { stiffness: 500, damping: 16 });
  }, [selected, reduced, fill]);
  const inner = useAnimatedProps(() => ({ r: 5.5 * fill.value }));
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} stroke={selected ? theme.primary : theme.border} strokeWidth={2} fill="none" />
      <AnimatedCircle cx={12} cy={12} fill={theme.primary} animatedProps={inner} />
    </Svg>
  );
}

export function OptionCard({
  icon,
  title,
  sub,
  selected,
  onPress,
}: {
  icon: string;
  title: string;
  sub: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <SpringPressable onPress={onPress} style={{ marginBottom: Spacing.two + 4 }}>
      <View
        style={[
          styles.option,
          {
            backgroundColor: selected ? theme.primary + '14' : theme.card,
            borderColor: selected ? theme.primary : theme.border,
            borderWidth: selected ? 1.5 : StyleSheet.hairlineWidth,
          },
        ]}>
        <View style={[styles.bubble, { backgroundColor: theme.primary + '1F' }]}>
          <UIcon name={icon} size={24} color={theme.iconLilac} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText type="heading" style={{ fontSize: 16, lineHeight: 21 }}>{title}</ThemedText>
          <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 2 }}>{sub}</ThemedText>
        </View>
        <RadioDot selected={selected} />
      </View>
    </SpringPressable>
  );
}

/** "With Euphoria" vs "Without daily practice" growth curves — both DRAW ON left→right. */
export function GrowthChart() {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const LEN = 700;
  const withCurve = useSharedValue(reduced ? 0 : LEN);
  const withoutCurve = useSharedValue(reduced ? 0 : LEN);
  const dot = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;
    withoutCurve.value = withDelay(150, withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) }));
    withCurve.value = withDelay(350, withTiming(0, { duration: 1000, easing: Easing.out(Easing.cubic) }));
    dot.value = withDelay(1250, withTiming(1, { duration: 260 }));
  }, [reduced, withCurve, withoutCurve, dot]);

  const withProps = useAnimatedProps(() => ({ strokeDashoffset: withCurve.value }));
  const withoutProps = useAnimatedProps(() => ({ strokeDashoffset: withoutCurve.value }));
  const dotProps = useAnimatedProps(() => ({ opacity: dot.value, r: 5 * dot.value }));

  return (
    <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <ThemedText type="small" themeColor="mutedForeground" style={{ fontSize: 11 }}>Skill</ThemedText>
      <Svg width="100%" height={150} viewBox="0 0 300 150">
        <Line x1={0} y1={148} x2={300} y2={148} stroke={theme.border} strokeWidth={1} />
        <Line x1={0} y1={100} x2={300} y2={100} stroke={theme.border} strokeWidth={0.5} />
        <Line x1={0} y1={52} x2={300} y2={52} stroke={theme.border} strokeWidth={0.5} />
        {/* without practice — shallow dashed (note: dashArray is used for the draw sweep, not visual dashes) */}
        <AnimatedPath d="M8 140 C110 132 210 124 292 112" stroke={theme.mutedForeground} strokeWidth={2} fill="none" strokeLinecap="round" strokeDasharray={LEN} animatedProps={withoutProps} opacity={0.6} />
        {/* with Euphoria — S-curve draws on */}
        <AnimatedPath d="M8 142 C90 138 150 108 200 66 C232 40 262 22 288 14" stroke={theme.primary} strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray={LEN} animatedProps={withProps} />
        <AnimatedCircle cx={288} cy={14} fill={theme.primary} animatedProps={dotProps} />
      </Svg>
      <View style={styles.chartLabels}>
        <ThemedText type="smallBold" style={{ color: theme.primary }}>With Euphoria</ThemedText>
        <ThemedText type="small" themeColor="mutedForeground">Without daily practice</ThemedText>
      </View>
      <ThemedText type="small" themeColor="mutedForeground" style={{ fontSize: 11, alignSelf: 'flex-end' }}>Time</ThemedText>
    </View>
  );
}

export function Stars({ count = 5 }: { count?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Svg key={i} width={18} height={18} viewBox="0 0 24 24">
          <Path d="M12 2.5l2.9 6.2 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.3 1.3-6.6L2.5 9.5l6.6-.8z" fill="#FBBF24" />
        </Svg>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chevron: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  segRow: { flex: 1, flexDirection: 'row', gap: 6 },
  seg: { flex: 1, height: 7, borderRadius: 7, overflow: 'hidden' },
  segFill: { height: 7, borderRadius: 7 },
  track: { flex: 1, height: 6, borderRadius: 6, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 6 },
  option: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4, padding: Spacing.three, borderRadius: Radius.lg },
  bubble: { width: 46, height: 46, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  chartCard: { borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.three, gap: Spacing.one },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.one },
});
