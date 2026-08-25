import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { UIcon, type UIconName } from '@/components/ui-icon';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { Spring } from '@/shared/motion/tokens';

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

/**
 * Depth of the hard-cut slab, in px. 6 is the smallest offset that still reads as a solid
 * object rather than a misaligned border at @3x, and it matches the proportion in the web
 * reference (a ~56px-tall pill with a ~7px lip).
 */
const SLAB = 6;

/**
 * <SlabButton> — the primary CTA. Solid face over a hard-cut slab, zero blur.
 *
 * REPLACED GradientButton on 2026-08-22, from the cofounder design doc:
 *
 *   "The biggest thing that we have to fix throughout the entire application is our buttons...
 *    I don't like the gradient look that we've put across the entire app. I like a deep purple,
 *    brilliant, styled button that's super defined and hard cut."
 *   "we can't have the same type of gradient behind it because it looks extremely vibe-coded...
 *    they can't have the vibe-coded glow behind them."
 *
 * What was here: a violet->orchid `LinearGradient` on a 16px-radius box, wrapped in a view with
 * `shadowRadius: 16, shadowOpacity: 0.5` in the gradient's own end colour. That soft coloured
 * halo is precisely the "glow" being rejected — and because it was on the shared CTA, it was on
 * all 19 call sites at once.
 *
 * What replaces it, read off the reference screenshots rather than a description of them:
 *   - ONE flat fill. No gradient, so there is no light source to disagree with.
 *   - A slab of the SAME pill shape sitting `SLAB` px lower, in a much darker tone of the same
 *     hue. Only its bottom lip is visible. Zero blur radius — the edge is the whole point.
 *   - Full pill radius (was Radius.lg / 16px), matching all four button references.
 *
 * PRESS. The face travels down by exactly `SLAB` and lands flush on the slab, so the button
 * looks physically pushed in. Total height never changes — `paddingBottom` reserves the travel,
 * so nothing below the button reflows. `scaleTo={1}` opts out of SpringPressable's scale: the
 * travel IS the feedback here, and doing both reads as two competing animations. Haptics and the
 * accessibility role still come from SpringPressable, whose `{...rest}` spread lands after its
 * own handlers, so the ones passed here win without disturbing the rest of it.
 *
 * REDUCED MOTION. A 6px finger-bound travel is the same class as the 3% press scale that
 * `reduced_motion_audit.py` documents as a deliberate non-defect. But that lane's whitelist is
 * "DOCUMENTATION ONLY and deliberately does NOT suppress this check", so the guard has to be
 * real: under the setting the face stays put and dips in opacity instead — which is the exact
 * substitution the audit names ("a cross-fade is what Reduced Motion substitutes FOR motion").
 */
export function SlabButton({
  label,
  onPress,
  loading,
  disabled,
  full,
  style,
  icon,
  tone = 'primary',
  accessibilityLabel,
}: {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
  style?: ViewStyle;
  /**
   * Optional leading glyph. Exists for ONE reason: a gated primary CTA must stay at full
   * visual weight and still say it is gated.
   *
   * Counted in pixels across four finance apps >=$250k/mo — Bloom `156236` (`Invest`),
   * Investing.com `211206` (`Upgrade to Pro`) and `211090` (`Unlock`), Seeking Alpha `285915`
   * (`Subscribe`): **4/4 render the locked control at FULL fill, and 0/4 demote it to an
   * outline or a grey.** A greyed control reads "broken"; a full-weight control with a lock
   * reads "available, costs money", which is the true statement and the one that converts.
   */
  icon?: UIconName;
  /**
   * `neutral` is the white variant from the reference ("similar buttons that are white, pushed
   * up"). Same slab construction, light face, dark ink — used where a second CTA sits beside
   * the purple one and must not compete with it.
   */
  /**
   * `premium` paints the web app's own purple-to-pink-to-orange ramp across the face, using the
   * theme's existing gradientFrom / premiumFrom / premiumTo. It exists so the paywall CTA reads
   * as the same product as euphoriainv.com, where the upgrade path is that ramp everywhere. No
   * new colour is introduced: all three stops are already in the palette.
   */
  tone?: 'primary' | 'neutral' | 'premium';
  /** Override the label-derived a11y label when the button's purpose differs from its word. */
  accessibilityLabel?: string;
}) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const press = useSharedValue(0);

  const neutral = tone === 'neutral';
  const premium = tone === 'premium';
  const face = neutral ? theme.ctaNeutral : theme.primary;
  /*
   * NO DEPTH SLAB UNDER THE PREMIUM FACE. The slab is a solid block sitting SLAB points below the
   * face, so the button reads as a physical key you press down onto it. Under the gradient it
   * showed as a flat purple strip beneath a purple-to-orange ramp, which read as a stray border
   * rather than depth. Transparent keeps the press travel exactly as it was and removes the strip.
   */
  const slab = neutral ? theme.ctaNeutralDepth : premium ? 'transparent' : theme.ctaDepth;
  const ink = neutral ? theme.ctaNeutralInk : '#fff';

  const faceStyle = useAnimatedStyle(() =>
    reduced
      ? { opacity: 1 - press.get() * 0.18 }
      : { transform: [{ translateY: press.get() * SLAB }] },
  );

  return (
    <SpringPressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled || loading}
      scaleTo={1}
      onPressIn={() => press.set(withSpring(1, Spring.press))}
      onPressOut={() => press.set(withSpring(0, Spring.press))}
      style={[styles.slabWrap, { opacity: disabled ? 0.5 : 1 }, full && styles.full, style]}>
      <View style={[styles.slab, { backgroundColor: slab }]} />
      <Animated.View style={[styles.face, { backgroundColor: face }, faceStyle]}>
        {/* Absolutely positioned and FIRST, so the label and any icon paint on top of it. The
            radius is repeated here rather than inherited: an absolute child does not clip to its
            parent's corners on iOS, and without it the ramp squares off the pill. */}
        {premium ? (
          <LinearGradient
            colors={[theme.gradientFrom, theme.premiumFrom, theme.premiumTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[StyleSheet.absoluteFill, { borderRadius: Radius.pill }]}
          />
        ) : null}
        {loading ? (
          <ActivityIndicator color={ink} />
        ) : (
          <>
            {icon ? <UIcon name={icon} size={17} color={ink} /> : null}
            {/*
              * AX5 pushed "Continue" straight out of its own button: bodyLg is 17pt, which
              * scales to ~53pt against a 56pt box. Capped rather than opted out of scaling —
              * `allowFontScaling={false}` would freeze the label for users who need it large.
              * The face uses minHeight, not height, so a scaled label grows the button and the
              * slab grows with it.
              */}
            <ThemedText type="heading" maxFontSizeMultiplier={1.6} numberOfLines={1} style={{ color: ink, fontSize: FontSize.bodyLg }}>{label}</ThemedText>
          </>
        )}
      </Animated.View>
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
  /** Reserves the travel so a pressed button never reflows what sits under it. */
  slabWrap: { paddingBottom: SLAB },
  /**
   * Same pill as the face, offset down by SLAB, so only its bottom lip shows at rest and it is
   * covered exactly when the face travels. `top: SLAB` rather than a height, so it tracks a
   * label that has grown under Dynamic Type.
   */
  slab: { position: 'absolute', left: 0, right: 0, top: SLAB, bottom: 0, borderRadius: Radius.pill },
  face: {
    minHeight: 56,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    flexDirection: 'row',
    gap: Spacing.two,
  },
  full: { alignSelf: 'stretch' },
});
