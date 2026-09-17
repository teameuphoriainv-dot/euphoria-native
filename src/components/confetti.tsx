/**
 * Confetti — a brief celebratory burst (Brilliant-style reward moment). ~18 dots fly out
 * from center and fade over ~1s. Reduced-motion → nothing. Render inside a celebration view.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { Radius } from '@/constants/theme';

const COLORS = ['#A451E6', '#22C55E', '#FBBF24', '#C89CF5', '#B57BEF'];
const N = 18;

function Dot({ i }: { i: number }) {
  const p = useSharedValue(0);
  const reduced = useReducedMotion();
  const angle = (i / N) * Math.PI * 2;
  const dist = 90 + (i % 5) * 26;

  useEffect(() => {
    if (reduced) return;
    p.set(withTiming(1, { duration: 850 + (i % 4) * 140, easing: Easing.out(Easing.cubic) }));
  }, [reduced, p, i]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - p.get(),
    transform: [
      { translateX: Math.cos(angle) * dist * p.get() },
      { translateY: Math.sin(angle) * dist * p.get() - 30 * p.get() },
      { scale: 1 - p.get() * 0.4 },
    ],
  }));

  return <Animated.View style={[styles.dot, { backgroundColor: COLORS[i % COLORS.length] }, style]} />;
}

export function Confetti() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.center}>
        {Array.from({ length: N }).map((_, i) => (
          <Dot key={i} i={i} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', width: 9, height: 9, borderRadius: Radius.track },
});
