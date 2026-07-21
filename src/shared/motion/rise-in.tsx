/**
 * <RiseIn> — the fadeUp/fadeIn/scaleIn entrance (motion vocab). Reanimated layout
 * animations auto-respect reduced motion, so this degrades to no-op / fade for free.
 */
import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Duration, Spring } from './tokens';

type Variant = 'fadeUp' | 'fadeIn';

export function RiseIn({
  children,
  delay = 0,
  variant = 'fadeUp',
  style,
}: {
  children: ReactNode;
  delay?: number;
  variant?: Variant;
  style?: ViewStyle | ViewStyle[];
}) {
  const entering =
    variant === 'fadeIn'
      ? FadeIn.delay(delay).duration(Duration.base)
      : FadeInDown.delay(delay).duration(Duration.slow).springify().damping(Spring.gentle.damping).stiffness(Spring.gentle.stiffness);

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
