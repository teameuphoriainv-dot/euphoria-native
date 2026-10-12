import { type ReactNode, useEffect } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { SEMANTIC_MOTION_PLANS, type SemanticMotionEvent } from '@/lib/semantic-motion';
import { Duration, Ease, Spring } from '@/shared/motion/tokens';

const DURATION = {
  instant: Duration.instant,
  base: Duration.base,
  screen: Duration.screen,
} as const;

/**
 * One renderer for semantic UI transitions. Call sites say what happened; this component owns how
 * that event moves. Reduced Motion resolves every event immediately, while answer verdicts remain
 * immediate for everyone so the explanation never waits behind animation.
 */
export function SemanticMotion({
  event,
  children,
  style,
  enabled = true,
  playKey,
  exit = false,
}: {
  event: SemanticMotionEvent;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  enabled?: boolean;
  playKey?: string | number | null;
  exit?: boolean;
}) {
  const reduced = useReducedMotion();
  const plan = SEMANTIC_MOTION_PLANS[event];
  const shouldAnimate = enabled && !reduced && plan.settle !== 'immediate';
  const progress = useSharedValue(shouldAnimate ? 0 : 1);

  useEffect(() => {
    if (!shouldAnimate) {
      progress.set(1);
      return;
    }

    progress.set(0);
    if (plan.settle === 'reward-spring') {
      progress.set(withSpring(1, Spring.reward));
    } else if (plan.settle === 'smooth-spring') {
      progress.set(withSpring(1, Spring.smooth));
    } else {
      progress.set(withTiming(1, { duration: DURATION[plan.duration], easing: Ease.enter }));
    }
  }, [event, plan.duration, plan.settle, playKey, progress, shouldAnimate]);

  const animatedStyle = useAnimatedStyle(() => {
    const value = progress.get();
    return {
      opacity: plan.initialOpacity + (1 - plan.initialOpacity) * value,
      transform: [
        { translateY: plan.initialTranslateY * (1 - value) },
        { scale: plan.initialScale + (1 - plan.initialScale) * value },
      ],
    };
  });

  const body = <Animated.View style={[exit ? styles.fill : style, animatedStyle]}>{children}</Animated.View>;
  if (!exit) return body;
  // The exit fade lives on a wrapper: an animated opacity on the same view as a layout animation can be
  // overwritten by it (Reanimated warned on every step change), and the entrance above animates opacity.
  return (
    <Animated.View exiting={reduced ? undefined : FadeOut.duration(Duration.exit).easing(Ease.exitCurve)} style={style}>
      {body}
    </Animated.View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
