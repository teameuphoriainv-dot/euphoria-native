/**
 * Euphoria design tokens — ported verbatim from euphoriaweb-current/src/index.css.
 * The app is dark-first (brand is celestial/observatory). `Colors.dark` is the primary
 * palette; `Colors.light` mirrors the web `:root` for completeness. Both share the same
 * keys so `ThemeColor` stays a valid `keyof`.
 */
import { Platform } from 'react-native';

export const Colors = {
  dark: {
    // surfaces
    text: 'hsl(240 5% 96%)',
    textSecondary: 'hsl(240 5% 60%)',
    mutedForeground: 'hsl(240 5% 46%)',
    background: '#09090D',
    backgroundElement: 'hsl(240 10% 9%)',
    backgroundSelected: 'hsl(240 10% 13%)',
    card: 'hsl(240 10% 7%)',
    cardElevated: 'hsl(240 10% 10%)',
    border: 'hsl(240 10% 13%)',
    input: 'hsl(240 10% 15%)',
    muted: 'hsl(240 10% 15%)',
    // brand
    primary: 'hsl(274 76% 61%)',
    primaryForeground: 'hsl(0 0% 100%)',
    accent: 'hsl(278 76% 66%)',
    success: 'hsl(142 71% 45%)',
    warning: 'hsl(45 93% 58%)',
    destructive: 'hsl(0 84% 60%)',
    // icon palette (matches EUPHORIA_ICONS fills)
    iconViolet: '#BB83F1',
    iconPurple: '#A451E6',
    iconLilac: '#C89CF5',
    iconGold: '#FBBF24',
    // gradient stops
    gradientFrom: 'hsl(274 76% 61%)',
    gradientTo: 'hsl(278 76% 66%)',
  },
  light: {
    text: 'hsl(240 10% 10%)',
    textSecondary: 'hsl(240 4% 40%)',
    mutedForeground: 'hsl(240 4% 46%)',
    background: 'hsl(0 0% 98%)',
    backgroundElement: 'hsl(240 5% 95%)',
    backgroundSelected: 'hsl(240 5% 90%)',
    card: 'hsl(0 0% 100%)',
    cardElevated: 'hsl(0 0% 100%)',
    border: 'hsl(240 6% 90%)',
    input: 'hsl(240 6% 90%)',
    muted: 'hsl(240 5% 95%)',
    primary: 'hsl(274 76% 61%)',
    primaryForeground: 'hsl(0 0% 100%)',
    accent: 'hsl(278 76% 66%)',
    success: 'hsl(142 71% 45%)',
    warning: 'hsl(45 93% 58%)',
    destructive: 'hsl(0 84% 60%)',
    iconViolet: '#BB83F1',
    iconPurple: '#A451E6',
    iconLilac: '#C89CF5',
    iconGold: '#FBBF24',
    gradientFrom: 'hsl(274 76% 61%)',
    gradientTo: 'hsl(278 76% 66%)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Font families — loaded via useFonts in the root layout (see _layout.tsx). */
export const Fonts = {
  /** EB Garamond — display serif for hero headlines */
  display: 'EBGaramond_600SemiBold',
  displayBold: 'EBGaramond_700Bold',
  /** DM Sans — UI + body */
  body: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
  mono: Platform.select({ ios: 'ui-monospace', default: 'monospace' }) as string,
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Primary brand gradient (violet → orchid), for GradientButton / hero glows. */
export const BrandGradient = ['hsl(274 76% 61%)', 'hsl(278 76% 66%)'] as const;

export const BottomTabInset = Platform.select({ ios: 84, android: 68 }) ?? 68;
export const MaxContentWidth = 640;
