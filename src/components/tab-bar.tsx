import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { SpringPressable } from '@/shared/motion/spring-pressable';

/** Route → EUPHORIA_ICONS name (guardrail G5 — no emoji/defaults). */
const TAB_ICONS: Record<string, string> = {
  home: 'radiate',
  learn: 'open-book',
  trade: 'trend-line',
  games: 'controller',
  community: 'forum',
  profile: 'badge',
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
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}>
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const iconName = TAB_ICONS[route.name] ?? 'orb';
        return (
          <SpringPressable
            key={route.key}
            scaleTo={0.88}
            style={styles.tab}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            }}>
            <View
              style={
                focused
                  ? { shadowColor: theme.primary, shadowOpacity: 0.7, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } }
                  : undefined
              }>
              <Icon name={iconName} size={26} opacity={focused ? 1 : 0.4} />
            </View>
            <ThemedText type="label" style={{ fontSize: 9, letterSpacing: 0.3, color: focused ? theme.primary : theme.mutedForeground }}>
              {route.name}
            </ThemedText>
          </SpringPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10 },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
});
