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
 * The field comes from src/lib/people.ts, which is FABRICATED and shared with the friends
 * directory so the two features cannot invent contradictory populations. Nothing user-facing may
 * describe those people as real.
 */
import { useMemo, useState } from 'react';
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
import { PEOPLE } from '@/lib/people';
import { useApp, weekKey } from '@/lib/store';

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
  const [tab, setTab] = useState<'league' | 'friends'>('league');
  // NOT useApp((s) => s.friendIds()): that getter builds a fresh array per call, so zustand sees a
  // new snapshot every render and loops until "Maximum update depth exceeded". Select the stored
  // arrays, which are reference-stable, and derive. Same trap documented at you.tsx and store.ts.
  const following = useApp((s) => s.following);
  const followers = useApp((s) => s.followers);
  const friendIds = useMemo(() => following.filter((id) => followers.includes(id)), [following, followers]);
  // Duolingo splits the same board into Leagues and Friends. Friends ranks only mutual follows,
  // so promotion and demotion zones are hidden there: you cannot be relegated out of your own
  // friend group, and drawing the lines would imply otherwise.
  const field = tab === 'friends' ? PEOPLE.filter((p) => friendIds.includes(p.id)) : PEOPLE;
  const players = [
    ...field.map((p) => ({ name: p.name, xp: p.weeklyXp, color: p.color, me: false })),
    { name: 'You', xp: weekly, color: '#A855EB', me: true },
  ].sort((a, b) => b.xp - a.xp);
  const zoned = tab === 'league';

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientBackground starCount={40} />

      <View style={styles.header}>
        <SpringPressable haptic={false} scaleTo={0.85} onPress={() => router.back()} style={styles.back} hitSlop={10}>
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

      <View style={styles.tabs}>
        {(['league', 'friends'] as const).map((t) => (
          <SpringPressable key={t} haptic={false} onPress={() => setTab(t)} style={{ flex: 1 }}>
            <View style={[styles.tab, { borderBottomColor: tab === t ? theme.primary : 'transparent' }]}>
              <ThemedText type="smallBold" themeColor={tab === t ? 'text' : 'mutedForeground'}>
                {t === 'league' ? 'League' : 'Friends'}
              </ThemedText>
            </View>
          </SpringPressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'friends' && friendIds.length === 0 && (
          <ThemedText type="small" themeColor="mutedForeground" style={styles.friendsEmpty}>
            No friends yet. Follow someone and they become a friend once they follow you back.
          </ThemedText>
        )}
        {players.map((p, i) => (
          <View key={p.name}>
            {zoned && i === PROMOTE && <Zone label="Promotion zone" color={theme.success} />}
            {zoned && i === DEMOTE && <Zone label="Demotion zone" color={theme.destructive} />}
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
  tabs: { flexDirection: 'row', paddingHorizontal: Spacing.three, marginTop: Spacing.two },
  tab: { alignItems: 'center', paddingVertical: Spacing.two, borderBottomWidth: 2 },
  friendsEmpty: { textAlign: 'center', lineHeight: 20, paddingHorizontal: Spacing.three, paddingBottom: Spacing.two },
  zone: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.two },
  zoneLine: { flex: 1, height: 1 },
});
