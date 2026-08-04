/**
 * League — the weekly leaderboard.
 *
 * TWO DIFFERENT NUMBERS, ON PURPOSE. The header tier comes from LIFETIME xp, because a tier is
 * earned and kept. The standings rank on WEEKLY xp, because a rank is defended and reset. Do not
 * "fix" one to match the other: making standings lifetime-based means whoever studied hardest a
 * year ago outranks everyone permanently and nobody can ever catch up, which is the opposite of
 * what a weekly league is for.
 *
 * The tier name and crest come from src/lib/league.ts so this screen and the You tab can never
 * disagree. They previously did: You said "Saver" while this said "Diamond League".
 *
 * PLAYERS BELOW ARE FABRICATED. There is no backend, so these are nine invented names with
 * invented scores, scaled to what a real week of use produces so the board is climbable. Nothing
 * user-facing may describe them as real people. They get replaced when accounts exist.
 */
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { LeagueCrest } from '@/components/league-crest';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { tierForXp } from '@/lib/league';
import { useApp, weekKey } from '@/lib/store';

const PLAYERS = [
  { name: 'Maya R.', xp: 520, color: '#F59E0B' },
  { name: 'Devin K.', xp: 430, color: '#38BDF8' },
  { name: 'Priya S.', xp: 365, color: '#34D399' },
  { name: 'You', xp: 0, color: '#A855EB', me: true },
  { name: 'Jordan L.', xp: 300, color: '#F472B6' },
  { name: 'Sam T.', xp: 245, color: '#FBBF24' },
  { name: 'Alex P.', xp: 190, color: '#818CF8' },
  { name: 'Chris M.', xp: 145, color: '#2DD4BF' },
  { name: 'Robin H.', xp: 95, color: '#FB7185' },
  { name: 'Casey W.', xp: 40, color: '#A3E635' },
];

const PROMOTE = 3; // top 3 promote
const DEMOTE = 7; // rank 8+ (index >= 7) demote

function commas(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** Days left in the league week. weekKey() returns the Monday a week belongs to, so it closes at
 *  the end of the following Sunday. Derived rather than printed, because the previous copy read
 *  "3 days left" on every day of the week including Sunday. */
function daysLeft(): string {
  const monday = new Date(`${weekKey()}T00:00:00`);
  const endOfSunday = new Date(monday.getTime() + 7 * 86_400_000);
  const days = Math.ceil((endOfSunday.getTime() - Date.now()) / 86_400_000);
  if (days <= 1) return 'Ends today';
  if (days === 2) return '1 day left';
  return `${days - 1} days left`;
}

function Zone({ label, color }: { label: string; color: string }) {
  return (
    <View style={styles.zone}>
      <View style={[styles.zoneLine, { backgroundColor: color }]} />
      <ThemedText type="label" style={{ color }}>{label}</ThemedText>
      <View style={[styles.zoneLine, { backgroundColor: color }]} />
    </View>
  );
}

export default function League() {
  const theme = useTheme();
  const xp = useApp((s) => s.xp);
  const weekly = useApp((s) => s.weeklyXpNow());
  const tier = tierForXp(xp);
  // Standings use WEEKLY xp; the header tier above uses lifetime. See the note at the top.
  const players = [...PLAYERS.map((p) => (p.me ? { ...p, xp: weekly } : p))].sort((a, b) => b.xp - a.xp);

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientBackground starCount={40} />

      <View style={styles.header}>
        <SpringPressable haptic={false} scaleTo={0.85} onPress={() => router.back()} style={styles.back}>
          <UIcon name="chevronLeft" size={22} color={theme.mutedForeground} />
        </SpringPressable>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <LeagueCrest tier={tier} size={30} />
            <ThemedText type="title" style={{ fontSize: 22 }} numberOfLines={1}>{tier.name}</ThemedText>
          </View>
          <ThemedText type="small" themeColor="mutedForeground">Top 3 advance · {daysLeft()}</ThemedText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {players.map((p, i) => (
          <View key={p.name}>
            {i === PROMOTE && <Zone label="Promotion zone" color={theme.success} />}
            {i === DEMOTE && <Zone label="Demotion zone" color={theme.destructive} />}
            <RiseIn delay={i * 40}>
              <View
                style={[
                  styles.row,
                  {
                    backgroundColor: p.me ? theme.primary + '22' : theme.card,
                    borderColor: p.me ? theme.primary : theme.border,
                    borderWidth: p.me ? 1.5 : StyleSheet.hairlineWidth,
                  },
                ]}>
                <ThemedText type="heading" style={{ width: 26, fontSize: 16, color: i < 3 ? theme.warning : theme.mutedForeground }}>{i + 1}</ThemedText>
                <View style={[styles.avatar, { backgroundColor: p.color }]}>
                  <ThemedText type="smallBold" style={{ color: '#0A0A0F' }}>{p.name[0]}</ThemedText>
                </View>
                <ThemedText type="bodyMedium" style={{ flex: 1, color: p.me ? theme.text : theme.text }}>{p.me ? 'You' : p.name}</ThemedText>
                <ThemedText type="bodyMedium" style={{ fontVariant: ['tabular-nums'], color: theme.mutedForeground }}>{commas(p.xp)} XP</ThemedText>
              </View>
            </RiseIn>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.three, paddingTop: Spacing.one },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  content: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four, gap: Spacing.two + 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.two + 4, borderRadius: Radius.lg },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  zone: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.two },
  zoneLine: { flex: 1, height: 1 },
});
