import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { LessonColors } from '@/constants/lesson-design';
import { useTheme } from '@/hooks/use-theme';

/** Alpha suffixes for the tint wash. Kept low on purpose — this is depth, not decoration, and
 *  every card on a screen carrying a loud gradient reads as busy rather than rich. */
const TINT_STRONG = '24'; // ~14%
const TINT_FAINT = '05'; // ~2%
const DEPTH_BORDER = 2;
const DEPTH_BOTTOM = 5;

export function Card({
  style,
  padded = true,
  elevated = false,
  tint,
  depthColor,
  children,
  ...rest
}: ViewProps & {
  padded?: boolean;
  elevated?: boolean;
  /** Accent to wash diagonally across the card, e.g. theme.primary. Gives a flat card depth
   *  without changing its footprint. Static by design — an animated wash on a card showing
   *  numbers reads as live data. */
  tint?: string;
  /** Colour of the thick bottom edge. The card's OWN colour, stronger than its sides, is what makes
   *  it read as a block with thickness (Duolingo) rather than a grey outline. */
  depthColor?: string;
}) {
  const theme = useTheme();
  const lesson = theme === LessonColors;
  return (
    <View
      style={[
        {
          backgroundColor: elevated ? theme.cardElevated : theme.card,
          borderColor: tint ? tint + '2E' : lesson ? LessonColors.border + '80' : theme.border,
          borderWidth: lesson ? 1 : DEPTH_BORDER,
          // Duolingo's card anatomy: a 2px edge and a heavier 5px bottom, so a card reads as a solid
          // object resting on the page instead of a hairline outline. Lessons keep their own style.
          ...(lesson ? null : { borderBottomWidth: DEPTH_BOTTOM, borderBottomColor: depthColor ?? (tint ? tint + '80' : theme.border) }),
          borderRadius: Radius.lg,
          ...(lesson ? {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.5,
            shadowRadius: 4,
            elevation: 2,
          } : null),
          // only when tinted — clipping every card in the app would silently crop anything a
          // caller deliberately overflows
          ...(tint ? ({ overflow: 'hidden' } as const) : null),
        },
        padded && { padding: lesson ? Spacing.four : Spacing.three },
        style,
      ]}
      {...rest}>
      {tint && (
        <LinearGradient
          colors={[tint + TINT_STRONG, tint + TINT_FAINT, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      )}
      {children}
    </View>
  );
}
