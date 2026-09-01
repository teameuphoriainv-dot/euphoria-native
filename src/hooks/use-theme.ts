/**
 * The active theme.
 *
 * WAS HARD-LOCKED to `Colors.dark` with the note "Euphoria is a dark-first celestial brand — the
 * app ships dark-only", and a ponytail marker saying to wire useColorScheme back in if light mode
 * ever became a product requirement. N22 made it one: "Add Light Mode / Dark Mode + other color
 * preferences, housed under the Preferences section."
 *
 * Both palettes in theme.ts already carry all 30 keys, so nothing had to be invented here — the
 * token layer was ready and only the switch was missing.
 *
 * `system` is the default: it respects a setting the user configured once, at the OS level, and
 * never has to think about again. A bare light/dark toggle would force a choice from everyone.
 */
import { useContext } from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { ThemeOverrideContext } from '@/lib/design-context';
import { useApp } from '@/lib/store';

/** 'light' or 'dark' — the resolved mode, after the preference and the OS are both consulted. */
export function useThemeMode(): 'light' | 'dark' {
  const pref = useApp((s) => s.themePref);
  const system = useColorScheme();
  // Anything that is not explicitly 'light' resolves to dark: useColorScheme returns null before
  // the OS answers and 'unspecified' on some devices, and the brand is dark-first — so an
  // indeterminate answer should land on the theme most users end up on, not flash the other one.
  if (pref === 'system') return system === 'light' ? 'light' : 'dark';
  return pref;
}

export function useTheme() {
  const override = useContext(ThemeOverrideContext);
  const mode = useThemeMode();
  return override ?? Colors[mode];
}
