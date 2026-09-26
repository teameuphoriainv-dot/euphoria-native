/**
 * <SpringPressable> — tap feedback (scale down on press) + haptic. The universal tappable
 * wrapper; use instead of bare Pressable for buttons/cards.
 *
 * MEASURED 2026-08-21, after the owner reported "whenever I click on something, it doesn't
 * become huge and become small". They were right, and the arithmetic says why.
 *
 * This used `Spring.snappy` (k=158, c=21 -> zeta 0.835, response 0.50s) while `Spring.press`
 * (k=632, c=50 -> zeta 0.994, response 0.25s) sat in tokens.ts UNUSED, documented for exactly
 * this job. A spring does not jump to its target: on a typical 80ms tap it only travels part
 * of the way before the finger lifts and it reverses.
 *
 *   at scaleTo 0.97, 80ms tap:  snappy reaches 0.9914 — a 0.86% squish. Invisible.
 *                               press  reaches 0.9820 — 1.80%. 2.08x better, still slight.
 *
 * So both halves were wrong: the wrong spring AND a target too shallow to survive the
 * truncation. `press` covers 59.9% of its travel in 80ms, so landing a real 3% squish needs
 * scaleTo 0.95, which is what it now is.
 *
 * Damping stays critical. tokens.ts is explicit that this is on purpose — "wobble on a ~100ms
 * beat reads as lag rather than life" — so the fix is a faster, deeper press, NOT a bouncier
 * one. scripts/press-feedback-pin.mjs holds the perceptual floor.
 */
import { useContext, type ReactNode } from 'react';
import * as Haptics from 'expo-haptics';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';

import { LessonColors } from '@/constants/lesson-design';
import { ThemeOverrideContext } from '@/lib/design-context';
import { Spring } from './tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SpringPressable({
  children,
  onPress,
  style,
  haptic = true,
  disabled,
  scaleTo = 0.95,
  sink = 0,
  ...rest
}: PressableProps & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  haptic?: boolean;
  scaleTo?: number;
  /** Opt-in press-sink in pt: the child drops onto its bottom edge while held (Duolingo's card
   *  and button press). Pair with a Card, whose 4pt bottom edge it sinks into. */
  sink?: number;
  /** Layout/entrance/exit animations. The underlying element IS an Animated component, so these
   *  already worked at runtime — but the prop type was plain `PressableProps`, so TypeScript
   *  rejected them and every caller silently went without. Declaring them here is what lets any
   *  tappable opt into a reflow animation. */
  layout?: React.ComponentProps<typeof Animated.View>['layout'];
  entering?: React.ComponentProps<typeof Animated.View>['entering'];
  exiting?: React.ComponentProps<typeof Animated.View>['exiting'];
}) {
  const reduced = useReducedMotion();
  const themeOverride = useContext(ThemeOverrideContext);
  // Canonical web lesson press spring; lesson options use its deliberate 0.97 touch response.
  const pressSpring = themeOverride === LessonColors
    ? { stiffness: 420, damping: 32, mass: 1 }
    : Spring.press;
  const scale = useSharedValue(1);
  const drop = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: drop.get() }, { scale: scale.get() }] }));

  return (
    <AnimatedPressable
      // Every tappable in the app routes through this wrapper, so the role belongs HERE rather
      // than at 54 call sites — an audit found all 54 of them unlabelled. `rest` is spread
      // after, so any caller needing a different role (checkbox, adjustable) still wins.
      accessibilityRole="button"
      // Disabled is visual-only otherwise: the opacity change never reaches a screen reader,
      // which then offers a control that silently does nothing.
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPressIn={() => {
        scale.set(reduced ? 1 : withSpring(scaleTo, pressSpring));
        if (sink) drop.set(reduced ? 0 : withSpring(sink, pressSpring));
      }}
      onPressOut={() => {
        scale.set(reduced ? 1 : withSpring(1, pressSpring));
        if (sink) drop.set(reduced ? 0 : withSpring(0, pressSpring));
      }}
      onPress={(e) => {
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
      }}
      style={[animatedStyle, style]}
      {...rest}>
      {children}
    </AnimatedPressable>
  );
}
