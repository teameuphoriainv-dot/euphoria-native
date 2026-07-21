/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';

// Euphoria is a dark-first celestial brand — the app ships dark-only.
// ponytail: dark-locked; wire useColorScheme back in if light mode ever becomes a product requirement.
export function useTheme() {
  return Colors.dark;
}
