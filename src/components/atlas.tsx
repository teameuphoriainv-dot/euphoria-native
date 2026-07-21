/**
 * Atlas — Euphoria's mascot. Phase-1 minimal: the glowing brand mark with a gentle idle
 * bob (motion anchor, guardrail G4). Full 6-expression googly-eye SVG state machine lands
 * in Phase 6.
 * // ponytail: static body + bob now; port reactive expressions when a screen needs them.
 */
import { Image } from 'expo-image';
import { useEffect } from 'react';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function Atlas({ size = 96 }: { size?: number }) {
  const y = useSharedValue(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    y.set(withRepeat(withTiming(-6, { duration: 1600 }), -1, true));
  }, [reduced, y]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));

  return (
    <Animated.View style={style}>
      <Image
        source={require('@/assets/images/logo-glow.png')}
        style={{ width: size, height: size }}
        contentFit="contain"
      />
    </Animated.View>
  );
}
