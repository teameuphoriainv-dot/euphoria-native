/**
 * <Nudge trigger={n}> — the "not yet" answer for a tap on something locked (Duolingo's refused-tap
 * shake). Each time `trigger` changes (and is > 0) the child shakes sideways with timing legs, NOT
 * a spring, so a refusal never overshoots, and a Warning haptic fires. Reduced Motion: no shake;
 * the haptic and any hint text still carry the answer.
 */
import * as Haptics from 'expo-haptics';
import { type ReactNode, useEffect } from 'react';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { Duration, Ease } from './tokens';

const LEGS = [-6, 6, -4, 4, 0];

export function Nudge({ trigger, children }: { trigger: number; children: ReactNode }) {
  const x = useSharedValue(0);
  const reduced = useReducedMotion();
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));
  useEffect(() => {
    if (trigger <= 0) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    if (reduced) return;
    const leg = Duration.base / LEGS.length;
    x.set(withSequence(...LEGS.map((v) => withTiming(v, { duration: leg, easing: Ease.inOut }))));
  }, [trigger, reduced, x]);
  return <Animated.View style={style}>{children}</Animated.View>;
}
