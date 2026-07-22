/**
 * Settings detail — opened from a You-screen settings row. Titled section with a designed
 * placeholder until each area is built (account, notifications, preferences). No dead ends.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

const TITLES: Record<string, string> = {
  account: 'Account',
  notifications: 'Notifications',
  preferences: 'Preferences',
};

export default function SettingsSection() {
  const theme = useTheme();
  const { section } = useLocalSearchParams<{ section: string }>();
  const title = TITLES[section ?? ''] ?? 'Settings';

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={25} glow={false} />
      <SpringPressable haptic={false} onPress={() => router.back()} style={styles.back}>
        <UIcon name="chevronLeft" size={22} color={theme.mutedForeground} />
        <ThemedText type="small" themeColor="mutedForeground">Profile</ThemedText>
      </SpringPressable>

      <View style={styles.center}>
        <RiseIn>
          <Atlas size={84} expression="thinking" interactive={false} />
        </RiseIn>
        <RiseIn delay={90}>
          <ThemedText type="title" style={{ fontSize: 24, textAlign: 'center', marginTop: Spacing.three }}>{title}</ThemedText>
          <ThemedText type="body" themeColor="mutedForeground" style={styles.sub}>
            {title} settings are coming soon — Atlas is still wiring this one up.
          </ThemedText>
        </RiseIn>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, padding: Spacing.three },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.four, marginTop: -Spacing.six },
  sub: { textAlign: 'center', marginTop: Spacing.two, lineHeight: 22, maxWidth: 300 },
});
