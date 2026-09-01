import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { LessonColors } from '@/constants/lesson-design';
import { useTheme } from '@/hooks/use-theme';

/** Alpha suffixes for the tint wash. Kept low on purpose — this is depth, not decoration, and
 *  every card on a screen carrying a loud gradient reads as busy rather than rich. */
const TINT_STRONG = '24'; // ~14%
const TINT_FAINT = '05'; // ~2%

export function Card({
  style,
  padded = true,
  elevated = false,
  tint,
  children,
  ...rest
}: ViewProps & {
  padded?: boolean;
  elevated?: boolean;
  /** Accent to wash diagonally across the card, e.g. theme.primary. Gives a flat card depth
   *  without changing its footprint. Static by design — an animated wash on a card showing
   *  numbers reads as live data. */
  tint?: string;
}) {
  const theme = useTheme();
  const lesson = theme === LessonColors;
  return (
    <View
      style={[
        {
          backgroundColor: elevated ? theme.cardElevated : theme.card,
          borderColor: tint ? tint + '2E' : lesson ? LessonColors.border + '80' : theme.border,
          borderWidth: lesson ? 1 : StyleSheet.hairlineWidth,
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
