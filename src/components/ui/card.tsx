import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
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
  return (
    <View
      style={[
        {
          backgroundColor: elevated ? theme.cardElevated : theme.card,
          borderColor: tint ? tint + '2E' : theme.border,
          borderWidth: StyleSheet.hairlineWidth,
          borderRadius: Radius.lg,
          // only when tinted — clipping every card in the app would silently crop anything a
          // caller deliberately overflows
          ...(tint ? ({ overflow: 'hidden' } as const) : null),
        },
        padded && { padding: Spacing.three },
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
