/**
 * AmbientBackground — the celestial signature from euphoriainv.com: a faint drifting
 * starfield + a soft violet top-glow, behind hero/onboarding/home. This is what makes
 * flat-black screens feel alive. Reduced-motion → static. Absolute-fill; render first.
 */
import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

type Star = { x: number; y: number; r: number; o: number };

export function AmbientBackground({ glow = true, starCount = 70 }: { glow?: boolean; starCount?: number }) {
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const drift = useSharedValue(0);

  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: starCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height * 1.15,
        r: Math.random() * 1.1 + 0.3,
        o: Math.random() * 0.45 + 0.1,
      })),
    [starCount, width, height],
  );

  useMemo(() => {
    if (reduced) return;
    drift.set(withRepeat(withTiming(-18, { duration: 22000, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, [reduced, drift]);

  const driftStyle = useAnimatedStyle(() => ({ transform: [{ translateY: drift.get() }] }));

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, driftStyle]}>
      <Svg width={width} height={height * 1.15}>
        {glow && (
          <Defs>
            <RadialGradient id="glow" cx="50%" cy="8%" r="60%">
              <Stop offset="0" stopColor="#A451E6" stopOpacity={0.16} />
              <Stop offset="1" stopColor="#A451E6" stopOpacity={0} />
            </RadialGradient>
          </Defs>
        )}
        {glow && <Rect x={0} y={0} width={width} height={height * 0.7} fill="url(#glow)" />}
        {stars.map((s, i) => (
          <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#EDE6FA" opacity={s.o} />
        ))}
      </Svg>
    </Animated.View>
  );
}
