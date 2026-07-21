/**
 * <SpringPressable> — snappy tap feedback (scale down on press) + haptic. The universal
 * tappable wrapper; use instead of bare Pressable for buttons/cards.
 */
import type { ReactNode } from 'react';
import * as Haptics from 'expo-haptics';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Spring } from './tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SpringPressable({
  children,
  onPress,
  style,
  haptic = true,
  disabled,
  scaleTo = 0.97,
  ...rest
}: PressableProps & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  haptic?: boolean;
  scaleTo?: number;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={() => {
        scale.set(withSpring(scaleTo, Spring.snappy));
      }}
      onPressOut={() => {
        scale.set(withSpring(1, Spring.snappy));
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
