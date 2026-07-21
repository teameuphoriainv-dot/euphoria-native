/**
 * RewardPop — bouncy scale-in for reward moments (XP chips, badges, coins). The celebration
 * spring (Brilliant/Duolingo). Reduced-motion → instant.
 */
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';

export function RewardPop({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: ViewStyle }) {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      scale.set(1);
      opacity.set(1);
      return;
    }
    scale.set(withDelay(delay, withSpring(1, { stiffness: 500, damping: 18 })));
    opacity.set(withDelay(delay, withTiming(1, { duration: 200 })));
  }, [reduced, delay, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.get(), transform: [{ scale: scale.get() }] }));

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}
