/**
 * PulseHalo — a slow expanding+fading ring behind an active element (Duolingo's "start"
 * node signature). Loops forever; reduced-motion → hidden. Position behind the target.
 */
import { useEffect } from 'react';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function PulseHalo({ size, color }: { size: number; color: string }) {
  const p = useSharedValue(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    p.set(withRepeat(withTiming(1, { duration: 1700, easing: Easing.out(Easing.ease) }), -1, false));
  }, [reduced, p]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - p.get()),
    transform: [{ scale: 1 + p.get() * 0.7 }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', top: 0, left: 0, width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]}
    />
  );
}
