/**
 * You — profile hub (euphoriaweb Profile.tsx). Atlas avatar + level/XP, stat grid,
 * certificate preview, settings rows. Mock data until Phase 2/5 wire real profile + auth.
 */
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '@/lib/store';

import { AmbientBackground } from '@/components/ambient-background';
import { Atlas } from '@/components/atlas';
import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';


const CERTS = [
  { icon: 'medal', label: 'Beginner', done: true },
  { icon: 'trophy', label: 'Advanced', done: true },
  { icon: 'crown', label: 'Elite', done: false },
  { icon: 'diamond', label: 'Fellow', done: false },
];

const SETTINGS = [
  { icon: 'you', label: 'Account' },
  { icon: 'bell', label: 'Notifications' },
  { icon: 'sparkle', label: 'Euphoria Pro', accent: true },
  { icon: 'settings', label: 'Preferences' },
];

export default function You() {
  const theme = useTheme();
  const router = useRouter();
  const xp = useApp((s) => s.xp);
  const streak = useApp((s) => s.streak);
  const level = useApp((s) => s.level());
  const lp = useApp((s) => s.levelProgress());
  const lessons = useApp((s) => s.completedLessons.length);
  const STATS = [
    { icon: 'flame', label: 'Day streak', value: String(streak) },
    { icon: 'open-book', label: 'Lessons', value: String(84 + lessons) },
    { icon: 'crown', label: 'XP', value: xp.toLocaleString() },
    { icon: 'trophy', label: 'Rank', value: '#3' },
  ];
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={45} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <RiseIn>
          <Card style={styles.profile} elevated>
            <Atlas size={72} expression="happy" />
            <View style={{ flex: 1 }}>
              <ThemedText type="title" style={{ fontSize: 22 }}>Siddartha</ThemedText>
              <ThemedText type="small" themeColor="mutedForeground">@siddartha · Level {level}</ThemedText>
              <View style={styles.xpRow}>
                <ProgressBar value={lp.into / lp.size} height={7} />
                <ThemedText type="small" themeColor="mutedForeground">{lp.toNext} XP to {level + 1}</ThemedText>
              </View>
            </View>
          </Card>
        </RiseIn>

        {/* Stat grid */}
        <View style={styles.grid}>
          {STATS.map((s, i) => (
            <RiseIn key={s.label} delay={80 + i * 40} style={styles.gridHalf}>
              <Card style={styles.statTile}>
                <View style={[styles.statIcon, { backgroundColor: theme.primary + '1A' }]}>
                  <Icon name={s.icon} size={22} />
                </View>
                <View>
                  <ThemedText type="heading" style={{ fontSize: 20 }}>{s.value}</ThemedText>
                  <ThemedText type="small" themeColor="mutedForeground">{s.label}</ThemedText>
                </View>
              </Card>
            </RiseIn>
          ))}
        </View>

        {/* Certificates */}
        <RiseIn delay={260}>
          <ThemedText type="label" themeColor="mutedForeground" style={styles.sectionLabel}>Certificates</ThemedText>
          <Card>
            <View style={styles.certRow}>
              {CERTS.map((c) => (
                <View key={c.label} style={styles.cert}>
                  <View style={[styles.certBubble, { backgroundColor: c.done ? theme.primary + '22' : theme.muted, opacity: c.done ? 1 : 0.5 }]}>
                    <Icon name={c.icon} size={30} />
                  </View>
                  <ThemedText type="small" themeColor={c.done ? 'text' : 'mutedForeground'} style={{ fontSize: 11 }}>{c.label}</ThemedText>
                </View>
              ))}
            </View>
          </Card>
        </RiseIn>

        {/* Play & Compete — makes /games + /league reachable */}
        <RiseIn delay={290}>
          <Card padded={false} style={{ marginTop: Spacing.three }}>
            <SpringPressable haptic={false} onPress={() => router.push('/games')}>
              <View style={[styles.settingRow, { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                <UIcon name="sparkle" size={20} color={theme.mutedForeground} />
                <ThemedText type="bodyMedium" style={{ flex: 1 }}>Games</ThemedText>
                <UIcon name="arrowRight" size={16} color={theme.mutedForeground} />
              </View>
            </SpringPressable>
            <SpringPressable haptic={false} onPress={() => router.push('/league')}>
              <View style={styles.settingRow}>
                <UIcon name="trophy" size={20} color={theme.mutedForeground} />
                <ThemedText type="bodyMedium" style={{ flex: 1 }}>Leaderboard</ThemedText>
                <UIcon name="arrowRight" size={16} color={theme.mutedForeground} />
              </View>
            </SpringPressable>
          </Card>
        </RiseIn>

        {/* Settings */}
        <RiseIn delay={320}>
          <Card padded={false} style={{ marginTop: Spacing.three }}>
            {SETTINGS.map((s, i) => (
              <SpringPressable key={s.label} haptic={false} onPress={() => router.push(`/settings/${s.label.toLowerCase().split(' ')[0]}`)}>
                <View style={[styles.settingRow, i < SETTINGS.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                  <UIcon name={s.icon} size={20} color={s.accent ? theme.iconLilac : theme.mutedForeground} />
                  <ThemedText type="bodyMedium" style={{ flex: 1, color: s.accent ? theme.iconLilac : theme.text }}>{s.label}</ThemedText>
                  <UIcon name="arrowRight" size={16} color={theme.mutedForeground} />
                </View>
              </SpringPressable>
            ))}
          </Card>
        </RiseIn>

        <SpringPressable haptic={false} onPress={() => router.replace('/welcome')} style={styles.logout}>
          <ThemedText type="bodyMedium" style={{ color: theme.destructive }}>Log out</ThemedText>
        </SpringPressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four },
  profile: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  xpRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.two },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three, marginTop: Spacing.three },
  gridHalf: { width: '47%', flexGrow: 1 },
  statTile: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 2 },
  statIcon: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { marginTop: Spacing.four, marginBottom: Spacing.two },
  certRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cert: { alignItems: 'center', gap: 6 },
  certBubble: { width: 60, height: 60, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three },
  logout: { alignItems: 'center', paddingVertical: Spacing.four },
});
