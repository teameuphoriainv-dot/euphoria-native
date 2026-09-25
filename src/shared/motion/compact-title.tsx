/**
 * The iOS collapsing title. A screen's large title scrolls away with its content; once it has gone,
 * this compact bar fades in over the top (with a hairline) so the screen still says where you are.
 * Driven by the scroll position shared from <RevealScrollView scrollY={...}>. Opacity only -- the
 * large title itself is never animated, it simply scrolls. Reduced Motion: the bar still appears
 * and disappears (it carries information), it just crossfades without the small slide.
 */
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Extrapolation, interpolate, type SharedValue, useAnimatedStyle, useReducedMotion } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Scroll offsets (pt) across which the bar fades in: after the large title has mostly scrolled off. */
const FROM = 36;
const TO = 64;
const BAR_H = 44;

export function CompactTitle({ title, scrollY }: { title: string; scrollY: SharedValue<number> }) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const insets = useSafeAreaInsets();
  const bar = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.get(), [FROM, TO], [0, 1], Extrapolation.CLAMP),
  }));
  const label = useAnimatedStyle(() => ({
    transform: [{ translateY: reduced ? 0 : interpolate(scrollY.get(), [FROM, TO], [6, 0], Extrapolation.CLAMP) }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.bar, { height: insets.top + BAR_H, backgroundColor: theme.background, borderBottomColor: theme.border }, bar]}>
      {/* The bar spans the status-bar zone (so content scrolled up is covered there too) and its
          title sits BELOW the inset. Absolute positioning ignores the SafeAreaView's padding: at
          top 0 with no inset the title was drawn behind the Dynamic Island. */}
      <View style={[styles.row, { marginTop: insets.top }]}>
        <Animated.View style={label}>
          <ThemedText type="heading" style={styles.text}>{title}</ThemedText>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', top: 0, left: 0, right: 0, borderBottomWidth: StyleSheet.hairlineWidth, zIndex: 10 },
  row: { height: BAR_H, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: FontSize.bodyLg },
});
