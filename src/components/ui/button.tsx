import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { UIcon, type UIconName } from '@/components/ui-icon';
import { BrandGradient, Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SpringPressable } from '@/shared/motion/spring-pressable';

type Variant = 'primary' | 'outline' | 'ghost';

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  full,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const bg = variant === 'primary' ? theme.primary : 'transparent';
  const fg = variant === 'primary' ? '#fff' : theme.text;
  const border = variant === 'outline' ? theme.border : 'transparent';

  return (
    <SpringPressable
      onPress={onPress}
      accessibilityLabel={label}
      disabled={disabled || loading}
      style={[
        styles.base,
        { backgroundColor: bg, borderColor: border, borderWidth: variant === 'outline' ? StyleSheet.hairlineWidth : 0, opacity: disabled ? 0.5 : 1 },
        full && styles.full,
        style,
      ]}>
      {loading ? <ActivityIndicator color={fg} /> : <ThemedText type="bodyMedium" maxFontSizeMultiplier={1.6} numberOfLines={1} style={{ color: fg }}>{label}</ThemedText>}
    </SpringPressable>
  );
}

/** Primary CTA with the violet→orchid brand gradient + glow (guardrail G4). */
export function GradientButton({
  label,
  onPress,
  loading,
  disabled,
  full,
  style,
  colors,
  icon,
  accessibilityLabel,
}: {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
  style?: ViewStyle;
  /** override the brand gradient — used by surfaces that carry a course accent */
  colors?: readonly [string, string, ...string[]];
  /**
   * Optional leading glyph. Exists for ONE reason: a gated primary CTA must stay at full
   * visual weight and still say it is gated.
   *
   * Counted in pixels across four finance apps ≥$250k/mo — Bloom `156236` (`Invest`),
   * Investing.com `211206` (`Upgrade to Pro`) and `211090` (`Unlock`), Seeking Alpha `285915`
   * (`Subscribe`): **4/4 render the locked control at FULL fill, and 0/4 demote it to an
   * outline or a grey.** A greyed control reads "broken"; a full-weight control with a lock
   * reads "available, costs money", which is the true statement and the one that converts.
   *
   * `styles.base` was already `flexDirection: 'row'` with a gap, so this needed no new style.
   * Optional, so all 15 existing callers are untouched.
   */
  icon?: UIconName;
  /** Override the label-derived a11y label when the button's purpose differs from its word. */
  accessibilityLabel?: string;
}) {
  const ramp = colors ?? BrandGradient;
  return (
    <SpringPressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled || loading}
      style={[
        styles.gradientWrap,
        {
          opacity: disabled ? 0.5 : 1,
          shadowColor: ramp[ramp.length - 1],
          shadowOpacity: 0.5,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
        },
        full && styles.full,
        style,
      ]}>
      <LinearGradient colors={ramp} start={{ x: 0, y: 0 }} end={{ x: 0.9, y: 1 }} style={[styles.base, styles.cta]}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            {icon ? <UIcon name={icon} size={17} color="#fff" /> : null}
            {/*
              * AX5 pushed "Continue" straight out of its own button: bodyLg is 17pt, which
              * scales to ~53pt against a 56pt box. Capped rather than opted out of scaling —
              * `allowFontScaling={false}` would freeze the label for users who need it large.
              * The styles below also swap height for minHeight so the button can grow.
              */}
            <ThemedText type="heading" maxFontSizeMultiplier={1.6} numberOfLines={1} style={{ color: '#fff', fontSize: FontSize.bodyLg }}>{label}</ThemedText>
          </>
        )}
      </LinearGradient>
    </SpringPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,   // was `height` — a fixed box clipped its own label at AX5
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    flexDirection: 'row',
    gap: Spacing.two,
  },
  gradientWrap: { borderRadius: Radius.lg, overflow: 'hidden' },
  cta: { minHeight: 56, borderRadius: Radius.lg },   // minHeight, so a scaled label grows the button
  full: { alignSelf: 'stretch' },
});
