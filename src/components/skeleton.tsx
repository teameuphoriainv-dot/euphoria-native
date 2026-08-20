/**
 * Loading skeletons. UNIT 13 item 3: "no spinner without a shape behind it".
 *
 * A bare `ActivityIndicator` on an empty screen tells the user something is happening but not what
 * is coming, and the screen then jumps as content lands. A skeleton reserves the real geometry, so
 * the layout does not move when the data arrives.
 *
 * ── THE §0.4 LINE, because a skeleton and a fake-content placeholder look identical ────────────
 * A skeleton is only legitimate while a fetch is GENUINELY IN FLIGHT. It must never be shown as a
 * stand-in for data that is absent, failed, or not configured — that is the invented-content defect
 * §0.4 forbids, and `news-gallery.tsx` renders NOTHING in exactly that case for exactly that reason.
 * If you are tempted to leave a skeleton up when there is nothing to load, the answer is an empty
 * state with words in it (see `friends`, C69), not a shimmering rectangle.
 */
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Duration } from '@/shared/motion/tokens';

export function Skeleton({
  height,
  width,
  radius = Radius.sm,
}: {
  height: number;
  width?: number | `${number}%`;
  radius?: number;
}) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const pulse = useSharedValue(reduced ? 0.6 : 0.35);

  useEffect(() => {
    if (reduced) {
      // Still visible, just still. A skeleton that does not move is a shape; one that is invisible
      // is a blank screen, which is the defect this component exists to remove.
      pulse.set(0.6);
      return;
    }
    pulse.set(withRepeat(withTiming(0.75, { duration: Duration.count, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, [reduced, pulse]);

  const style = useAnimatedStyle(() => ({ opacity: pulse.get() }));

  return (
    <Animated.View
      style={[{ height, width: width ?? '100%', borderRadius: radius, backgroundColor: theme.cardElevated }, style]}
      accessible={false}
      // The screen reader is told ONCE by the caller that content is loading; N shimmering blocks
      // announcing themselves would be worse than the spinner this replaces.
      importantForAccessibility="no-hide-descendants"
    />
  );
}

/** N stacked rows at a card's height — the shape a list is about to take. */
export function SkeletonRows({ count = 3, height = 72 }: { count?: number; height?: number }) {
  return (
    <View style={styles.rows} accessibilityRole="progressbar" accessibilityLabel="Loading">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} height={height} radius={Radius.md} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rows: { gap: Spacing.two },
});
