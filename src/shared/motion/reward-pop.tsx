/**
 * RewardPop — bouncy scale-in for reward moments (XP chips, badges, coins). The celebration
 * spring (Brilliant/Duolingo). Reduced-motion → instant.
 */
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';

import { Spring } from './tokens';

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
    /*
     * Spring.reward, not a magic pair. This was { stiffness: 500, damping: 18 }, which is
     * zeta = 18 / (2*sqrt(500)) = 0.40 -- overshooting roughly 25%, so a chip starting at 0.6
     * travelled to about 1.25 before settling at 1. That is a large, undocumented excursion, and
     * MOTION_RUBRIC R2 is explicit that an overshoot must be a per-element choice rather than an
     * inherited number: of 124 reference transitions under 0.35s, 73% settle in one pass.
     *
     * tokens.ts already defines `reward` for exactly this moment (Apple 0.35 / zeta 0.55), which
     * halves the overshoot to ~12%. A reward chip SHOULD pop -- it is a celebration -- so the
     * bounce is kept and made deliberate rather than removed.
     */
    scale.set(withDelay(delay, withSpring(1, Spring.reward)));
    opacity.set(withDelay(delay, withTiming(1, { duration: 200 })));
  }, [reduced, delay, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.get(), transform: [{ scale: scale.get() }] }));

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}
