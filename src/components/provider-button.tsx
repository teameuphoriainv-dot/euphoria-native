/**
 * ONE button for both sign-in providers.
 *
 * WHY THIS EXISTS. Apple's and Google's shipped components cannot be made to match. Measured on
 * device: Apple's renders 312x48 with black bold CENTRED text and the mark inline; Google's renders
 * ~303x39 with grey text LEFT of centre and the mark in its own slot. `GoogleSigninButton` draws
 * itself natively and ignores width, height and radius — passing `style` changes nothing, which was
 * tested and reverted. §22 C97 said so and was right.
 *
 * So side by side they read as two controls borrowed from two different apps, which is what the
 * user saw. The only way to make them one component is to BE one component.
 *
 * THIS IS A DELIBERATE RETURN TO SOMETHING C97 UNDID, at the user's explicit direction, and the
 * difference matters. C97 removed hand-drawn buttons that used a GENERIC PERSON GLYPH AND A GLOBE —
 * no vendor marks at all, on the screen this app had just been rejected over. That is a guideline
 * violation. A button built to each vendor's published spec, using their OFFICIAL mark, is a
 * documented and permitted path for both companies.
 *
 *   Apple  SF Symbol `apple.logo`, the system-provided mark, with the required "Sign in with Apple"
 *   Google `assets/images/google-g.png`, fetched from Google's own branding URL
 *          (developers.google.com/identity/images/g-logo.png), with "Sign in with Google"
 *
 * KNOWN DEVIATION, stated rather than hidden: Google's branding guidelines specify Roboto Medium for
 * the label. This uses the app's own semibold face so the two buttons share one typography, which is
 * the entire point of the change. Everything else — the unmodified mark, the exact wording, the
 * white ground, the clear space — follows the guideline. If a reviewer ever objects, the fix is the
 * font on this one component, not a redesign.
 */
import { SymbolView } from 'expo-symbols';
import { Image, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { SpringPressable } from '@/shared/motion/spring-pressable';

/** Both buttons, always. A provider that renders at a different size is the bug this file fixes. */
export const PROVIDER_W = 312;
export const PROVIDER_H = 48;

const GOOGLE_G = require('../../assets/images/google-g.png');

export function ProviderButton({
  provider,
  onPress,
  disabled,
}: {
  provider: 'apple' | 'google';
  onPress: () => void;
  disabled?: boolean;
}) {
  const isApple = provider === 'apple';
  const label = isApple ? 'Sign in with Apple' : 'Sign in with Google';

  return (
    <SpringPressable
      haptic={false}
      scaleTo={0.98}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={{ alignSelf: 'center' }}
    >
      <View style={[styles.btn, disabled && { opacity: 0.5 }]}>
        {isApple ? (
          // The system mark. Not an approximation of it — SF Symbols IS Apple's own asset.
          <SymbolView name="apple.logo" size={19} tintColor="#000000" resizeMode="scaleAspectFit" style={styles.mark} />
        ) : (
          // resizeMode="contain" so the 200x204 source is never stretched. Google's guidelines
          // forbid altering the mark's proportions, and a squashed G is exactly that.
          <Image source={GOOGLE_G} style={styles.mark} resizeMode="contain" />
        )}
        <ThemedText type="smallBold" style={styles.label}>{label}</ThemedText>
      </View>
    </SpringPressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: PROVIDER_W,
    height: PROVIDER_H,
    borderRadius: Radius.sm,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  // Same box for both marks, so the two labels start at the same optical position.
  mark: { width: 19, height: 19 },
  // Black on white rather than the theme's foreground: this button is white in every theme, so a
  // themed colour would go invisible the moment a light theme exists.
  label: { color: '#000000', fontSize: FontSize.body },
});
