import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Typography scale (guardrail G1/G3 — intentional hierarchy):
 * - display  → EB Garamond serif, hero headlines
 * - title/heading → DM Sans bold
 * - body/small → DM Sans
 */
export type ThemedTextProps = TextProps & {
  type?: 'display' | 'title' | 'heading' | 'body' | 'bodyMedium' | 'small' | 'smallBold' | 'label' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'body', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  return (
    <Text
      style={[{ color: theme[themeColor ?? 'text'] }, styles[type], style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  display: { fontFamily: Fonts.display, fontSize: 32, lineHeight: 40 },
  title: { fontFamily: Fonts.display, fontSize: 26, lineHeight: 32 },
  heading: { fontFamily: Fonts.heading, fontSize: 19, lineHeight: 25 },
  body: { fontFamily: Fonts.body, fontSize: 16, lineHeight: 23 },
  bodyMedium: { fontFamily: Fonts.medium, fontSize: 16, lineHeight: 23 },
  small: { fontFamily: Fonts.body, fontSize: 13, lineHeight: 18 },
  smallBold: { fontFamily: Fonts.semibold, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: Fonts.semibold, fontSize: 11, lineHeight: 14, letterSpacing: 0.6, textTransform: 'uppercase' },
  code: { fontFamily: Fonts.mono, fontSize: 13 },
});
