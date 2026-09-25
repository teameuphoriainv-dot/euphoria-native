/**
 * A progress bar's fill that moves instead of snapping.
 *
 * The fill is drawn full width and scaled from its left edge -- transform only, so a change never
 * relays out the row it sits in. It eases to each new ratio (Duration.count, Ease.out). With
 * `fillOnMount` it starts empty and fills when it first appears, which is what makes a list of
 * progress bars (achievements) read as progress rather than as a static table.
 *
 * Reduced Motion: lands on the ratio immediately.
 */
import { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { Duration, Ease } from './tokens';

export function ProgressFill({
  ratio,
  color,
  style,
  fillOnMount = false,
  delay = 0,
}: {
  ratio: number;
  color: string;
  /** Height and radius of the fill; width is always the full track. */
  style?: StyleProp<ViewStyle>;
  fillOnMount?: boolean;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const clamped = Math.max(0, Math.min(1, ratio));
  const r = useSharedValue(fillOnMount && !reduced ? 0 : clamped);
  useEffect(() => {
    r.set(reduced ? clamped : withDelay(delay, withTiming(clamped, { duration: Duration.count, easing: Ease.out })));
  }, [clamped, reduced, delay, r]);
  const animated = useAnimatedStyle(() => ({ transform: [{ scaleX: r.get() }] }));
  return (
    <Animated.View
      style={[{ width: '100%', transformOrigin: 'left', backgroundColor: color }, style, animated]}
    />
  );
}
