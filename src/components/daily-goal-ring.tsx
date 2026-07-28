/**
 * DailyGoalRing — animated circular progress ring (Duolingo/Brilliant daily-goal). SVG arc
 * fills via strokeDashoffset on mount. Reduced-motion → static.
 */
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
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

  useEffect(() => {
    progress.set(reduced ? pct : withTiming(pct, { duration: 950, easing: Easing.out(Easing.cubic) }));
  }, [pct, reduced, progress]);

  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: circ * (1 - progress.get()) }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          {/* violet-tinted rather than flat grey: at 0 progress the track is the whole ring, and a
              neutral one leaves the largest round element on Home with no colour in it at all */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={theme.primary + '33'}
            strokeWidth={stroke}
            fill="none"
          />
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
