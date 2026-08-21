/**
 * <RiseIn> — the fadeUp/fadeIn/scaleIn entrance (motion vocab). Reanimated layout
 * animations auto-respect reduced motion, so this degrades to no-op / fade for free.
 */
import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Duration } from './tokens';

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
      : // `.damping()` and `.stiffness()` USED TO BE HERE AND DID NOTHING. withSpring builds
        // `useDuration: !!(userConfig.duration || userConfig.dampingRatio)` (spring.ts:80), and
        // `.duration()` above sets exactly that -- so it took the duration path, recomputed
        // stiffness from duration + dampingRatio, and discarded the two values passed in. The
        // dampingRatio it used was the default 1, i.e. critically damped, which is what
        // Spring.gentle (zeta 0.969) was reaching for anyway. So the MOTION was already right and
        // this is not a behaviour change -- it states what is actually in force instead of two
        // numbers that read as deliberate and were inert.
        FadeInDown.delay(delay).duration(Duration.slow).springify().dampingRatio(1);

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
