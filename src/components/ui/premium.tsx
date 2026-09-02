/**
 * THE PREMIUM COLOURWAY, as the web app actually paints it.
 *
 * Reference supplied 2026-09-02: three screenshots of euphoriainv.com's Premium surfaces. What
 * they show is not a colour, it is a RAMP used three ways:
 *
 *   1. the "Premium" wordmark, filled left to right violet -> magenta -> orange
 *   2. a gradient BORDER around the Premium column and the Premium price card, violet at the
 *      top-left corner running to orange at the bottom-right
 *   3. a gradient FILL on the "Go Premium" button and the check circles
 *
 * The stops were already in theme.ts (`gradientFrom`, `premiumFrom`, `premiumTo`) and are exactly
 * these three. What was missing on native was the ramp itself: the trial card painted a flat pink
 * and a tint, which is the right hue and the wrong idea. A flat stop reads as "a pink thing"; the
 * ramp is what the web has trained the user to recognise as Premium.
 *
 * WHY THESE LIVE IN ONE FILE. They are used on the trial card and on the paywall, and those two
 * surfaces have already drifted apart once. theme.ts says the ramp is the one colour that MEANS
 * Premium and that spending it elsewhere wastes it, so there should be exactly one implementation
 * to point at when deciding whether a new surface has earned it.
 */
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** The three stops, in order, from the theme. Never write these values out by hand. */
export function usePremiumRamp(): [string, string, string] {
  const theme = useTheme();
  return [theme.gradientFrom, theme.premiumFrom, theme.premiumTo];
}

/**
 * Text filled with the ramp, the way the web sets the "Premium" wordmark.
 *
 * MaskedView rather than an SVG <Text>: SVG text takes a fixed font size and would opt this string
 * out of Dynamic Type, and this codebase has an AX5 history of exactly that kind of freeze. The
 * mask is a real <ThemedText>, so it scales, wraps and reads to VoiceOver like any other label,
 * and the gradient simply paints through it.
 *
 * The mask child is rendered a second time underneath at `opacity: 0`. That is not a mistake and
 * not decoration: MaskedView does not contribute its mask to layout, so without a real copy in the
 * tree the row would collapse to zero width.
 */
export function PremiumText({
  children,
  type = 'smallBold',
  maxFontSizeMultiplier = 2,
  style,
}: {
  children: string;
  type?: React.ComponentProps<typeof ThemedText>['type'];
  maxFontSizeMultiplier?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const ramp = usePremiumRamp();
  const label = (
    <ThemedText type={type} maxFontSizeMultiplier={maxFontSizeMultiplier}>
      {children}
    </ThemedText>
  );

  return (
    <View style={style}>
      {/* Sizes the row. Hidden from VoiceOver so the string is not announced twice. */}
      <View style={{ opacity: 0 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {label}
      </View>
      <MaskedView style={StyleSheet.absoluteFill} maskElement={<View>{label}</View>}>
        <LinearGradient colors={ramp} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      </MaskedView>
    </View>
  );
}

/**
 * A container with a gradient BORDER, matching the Premium column and price card on the web.
 *
 * Implemented as a gradient rectangle with the content laid on top inset by `width`, because React
 * Native has no gradient border. The inner fill is opaque `background`, so what shows through at
 * the edges is exactly a `width`-thick ramp.
 *
 * DIAGONAL, not horizontal: the reference runs violet from the top-left corner to orange at the
 * bottom-right, so a tall card shows all three stops down its side. A horizontal ramp on a tall
 * card would put violet and orange on the same two vertical edges and lose the middle entirely.
 *
 * No shadow anywhere here. The design record rejects a soft coloured halo behind these surfaces
 * ("they can't have the vibe-coded glow behind them"), and `no-glow-pin.mjs` enforces it.
 */
export function PremiumBorder({
  children,
  radius = Radius.lg,
  width = 1.5,
  style,
  fill,
}: {
  children: React.ReactNode;
  radius?: number;
  width?: number;
  style?: StyleProp<ViewStyle>;
  /** Inner fill. Defaults to the card colour; pass `background` for a flush-to-page look. */
  fill?: string;
}) {
  const theme = useTheme();
  const ramp = usePremiumRamp();

  return (
    <LinearGradient
      colors={ramp}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ borderRadius: radius, padding: width }, style]}>
      <View style={{ borderRadius: radius - width, backgroundColor: fill ?? theme.card, overflow: 'hidden' }}>
        {children}
      </View>
    </LinearGradient>
  );
}

/**
 * A solid pill filled with the ramp, matching "Free for students through schools" on the web.
 * Used where the ramp is the whole object rather than its edge.
 */
export function PremiumPill({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const ramp = usePremiumRamp();
  return (
    <LinearGradient
      colors={ramp}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[{ borderRadius: Radius.pill }, style]}>
      {children}
    </LinearGradient>
  );
}
