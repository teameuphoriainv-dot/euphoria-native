/**
 * DailyGoalRing — animated circular progress ring (Duolingo/Brilliant daily-goal). SVG arc
 * fills via strokeDashoffset on mount. Reduced-motion → static.
 */
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function DailyGoalRing({ value, goal, size = 88, stroke = 9 }: { value: number; goal: number; size?: number; stroke?: number }) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, value / goal);
  const progress = useSharedValue(0);
  /** Track breath, only while nothing has been done today — at pct 0 the arc animates from 0 to 0,
   *  so without this the ring is completely inert in the state most users open the app in. */
  const idle = useSharedValue(1);

  useEffect(() => {
    progress.set(reduced ? pct : withTiming(pct, { duration: 950, easing: Easing.out(Easing.cubic) }));
  }, [pct, reduced, progress]);

  useEffect(() => {
    if (reduced || pct > 0) {
      idle.set(1);
      return;
    }
    idle.set(withRepeat(withTiming(0.4, { duration: 1600, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, [reduced, pct, idle]);

  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: circ * (1 - progress.get()) }));
  const trackProps = useAnimatedProps(() => ({ opacity: idle.get() }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          <AnimatedCircle cx={size / 2} cy={size / 2} r={r} stroke={theme.muted} strokeWidth={stroke} fill="none" animatedProps={trackProps} />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={theme.primary}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circ}
            animatedProps={animatedProps}
          />
        </G>
      </Svg>
      <View style={{ alignItems: 'center' }}>
        <ThemedText type="heading" style={{ fontSize: 20 }}>{value}</ThemedText>
        <ThemedText type="label" themeColor="mutedForeground" style={{ fontSize: 9 }}>min</ThemedText>
      </View>
    </View>
  );
}
