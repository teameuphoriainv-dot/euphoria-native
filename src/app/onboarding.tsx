import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Atlas } from '@/components/atlas';
import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

const ROLES = [
  { key: 'student', icon: 'grad-cap', title: "I'm a Student", blurb: 'Learn investing through play — lessons, paper trading, and XP.' },
  { key: 'educator', icon: 'mentor', title: "I'm an Educator", blurb: 'Run your classroom on Euphoria — classes, assignments, progress.' },
] as const;

export default function Onboarding() {
  const theme = useTheme();
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Atlas size={104} />
          <ThemedText type="display" style={styles.headline}>Master the markets.</ThemedText>
          <ThemedText type="body" themeColor="mutedForeground" style={styles.sub}>
            The calmest way to actually learn investing — one interactive lesson at a time.
          </ThemedText>
        </View>

        <ThemedText type="label" themeColor="mutedForeground" style={styles.prompt}>How will you use Euphoria?</ThemedText>

        {ROLES.map((r, i) => (
          <RiseIn key={r.key} delay={120 + i * 90}>
            <SpringPressable onPress={() => router.replace('/home')} style={{ marginBottom: Spacing.two + 4 }}>
              <Card style={styles.roleCard}>
                <View style={[styles.roleIcon, { backgroundColor: theme.primary + '1F' }]}>
                  <Icon name={r.icon} size={34} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText type="heading">{r.title}</ThemedText>
                  <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 3 }}>{r.blurb}</ThemedText>
                </View>
                <Icon name="ui-arrow" size={22} />
              </Card>
            </SpringPressable>
          </RiseIn>
        ))}

        <SpringPressable haptic={false} onPress={() => router.replace('/home')} style={styles.signin}>
          <ThemedText type="small" themeColor="mutedForeground">
            Already have an account? <ThemedText type="smallBold" style={{ color: theme.primary }}>Sign in</ThemedText>
          </ThemedText>
        </SpringPressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: Spacing.four, paddingTop: Spacing.six, flexGrow: 1 },
  hero: { alignItems: 'center', marginBottom: Spacing.five },
  headline: { textAlign: 'center', marginTop: Spacing.three },
  sub: { textAlign: 'center', marginTop: Spacing.two, paddingHorizontal: Spacing.two },
  prompt: { marginBottom: Spacing.three },
  roleCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4 },
  roleIcon: { width: 56, height: 56, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  signin: { alignItems: 'center', marginTop: Spacing.four },
});
