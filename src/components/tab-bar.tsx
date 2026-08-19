import { FontSize } from '@/constants/theme';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { UIcon, type UIconName } from '@/components/ui-icon';
import { useTheme } from '@/hooks/use-theme';
import { SpringPressable } from '@/shared/motion/spring-pressable';

/** Route → UIcon line icon (consistent stroke, per design mockups). */
const TAB_ICONS: Record<string, UIconName> = {
  home: 'home',
  learn: 'learn',
  trade: 'trade',
  digest: 'feed',
  you: 'you',
};

type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (event: { type: 'tabPress'; target: string; canPreventDefault: true }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
};

export function TabBar({ state, navigation }: TabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}>
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const color = focused ? theme.primary : theme.mutedForeground;
        return (
          <SpringPressable
            key={route.key}
            haptic={false}
            scaleTo={0.9}
            style={styles.tab}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            }}>
            {/*
              * 28, not 24. Measured on device 2026-08-19: the tab icons rendered at 24pt while the
              * Trade/Digest quick-cards render theirs at 20pt — the tab icons were already the
              * larger glyph and still read as the smaller one, because a card gives its icon 104pt
              * of surrounding surface and a tab gives it none. Presence is the icon relative to its
              * container, not its raw pt. 28 is Apple's own tab-bar glyph size for a compact bar.
              */}
            <UIcon name={TAB_ICONS[route.name] ?? 'sparkle'} size={28} color={color} strokeWidth={focused ? 2.4 : 2} />
            {/*
              * AX5 CLIPPED EVERY TAB LABEL MID-WORD — "Hom Lear Trad Dige You". Captured on
              * device at accessibility-extra-extra-extra-large, not inferred from a grep.
              *
              * Two causes, and the second is the one that actually did the damage:
              *   1. Five tabs share the screen width, so a 3.12x label cannot fit.
              *   2. `lineHeight: 13` was HARDCODED. React Native scales fontSize with the
              *      OS text setting but NEVER scales lineHeight, so a 10pt font growing to
              *      31pt was being drawn into a 13pt line box. Removed, so RN computes it
              *      from whatever the scaled size turns out to be.
              *
              * The cap is what Apple's own tab bars do — system tab bars stop scaling and
              * show a long-press HUD instead, because unreadable navigation is worse than
              * small navigation. 1.6 keeps "Digest", the longest label, on one line.
              * allowFontScaling stays ON: capping is accessible, opting out is not.
              */}
            <ThemedText
              type="small"
              maxFontSizeMultiplier={1.6}
              numberOfLines={1}
              style={{ fontSize: FontSize.tiny, color, fontFamily: focused ? 'Nunito_700Bold' : 'DMSans_500Medium' }}>
              {route.name === 'you' ? 'You' : route.name.charAt(0).toUpperCase() + route.name.slice(1)}
            </ThemedText>
          </SpringPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10 },
  // 44pt is Apple HIG's minimum tappable size. Measured 2026-08-18 the rendered tab was
  // 80.3 x 41.0 — 3pt short on the app's PRIMARY navigation, on every screen.
  tab: { flex: 1, alignItems: 'center', gap: 4, minHeight: 44 },
});
