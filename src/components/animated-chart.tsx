/**
 * AnimatedLineChart — draws the line stroke on from LEFT → RIGHT (strokeDashoffset sweep) and
 * fades the gradient area up underneath it. The Duolingo/Brilliant "chart grows in" beat.
 * Reuse everywhere a static <Path> chart lived (Home portfolio, Trade, Stock detail, Compound Lab).
 */
import { useEffect } from 'react';
import { Ease } from '@/shared/motion/tokens';
import Animated, { Easing, useAnimatedProps, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export function AnimatedLineChart({
  line,
  area,
  color,
  width = '100%',
  height = 64,
  viewBox = '0 0 320 64',
  strokeWidth = 2.5,
  gradientId,
  delay = 120,
  duration = 900,
}: {
  line: string;
  area?: string;
  color: string;
  width?: number | string;
  height?: number;
  viewBox?: string;
  strokeWidth?: number;
  gradientId: string;
  delay?: number;
  duration?: number;
}) {
  const reduced = useReducedMotion();
  // Big dash length so any realistic chart path fits; offset animates L -> 0 to reveal L->R.
  const LEN = 1400;
  const progress = useSharedValue(reduced ? 0 : LEN);
  const areaOpacity = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;
    progress.value = withDelay(delay, withTiming(0, { duration, easing: Easing.out(Easing.cubic) }));
    areaOpacity.value = withDelay(delay + duration * 0.45, withTiming(1, { duration: duration * 0.5, easing: Ease.enter }));
  }, [reduced, delay, duration, progress, areaOpacity]);

  const strokeProps = useAnimatedProps(() => ({ strokeDashoffset: progress.value }));
  const areaProps = useAnimatedProps(() => ({ opacity: areaOpacity.value }));

  return (
    <Svg width={width} height={height} viewBox={viewBox} preserveAspectRatio="none">
      <Defs>
        <SvgGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.32} />
          <Stop offset="1" stopColor={color} stopOpacity={0.02} />
        </SvgGradient>
      </Defs>
      {area && <AnimatedPath d={area} fill={`url(#${gradientId})`} animatedProps={areaProps} />}
      <AnimatedPath
        d={line}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={LEN}
        animatedProps={strokeProps}
      />
    </Svg>
  );
}
