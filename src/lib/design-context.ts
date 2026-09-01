import { createContext } from 'react';
import type { TextStyle } from 'react-native';

import { Colors } from '@/constants/theme';
import type { ThemedTextProps } from '@/components/themed-text';

/**
 * A palette has the same keys as the application theme, but providers may supply canonical
 * lesson-specific colour values. Using the literal type of `Colors.dark` here would incorrectly
 * require every override to keep the dark theme's exact string literals.
 */
export type ThemePalette = { readonly [Key in keyof typeof Colors.dark]: string };
export type TypographyOverride = Partial<Record<NonNullable<ThemedTextProps['type']>, TextStyle>>;

export const ThemeOverrideContext = createContext<ThemePalette | null>(null);
export const TypographyOverrideContext = createContext<TypographyOverride | null>(null);
