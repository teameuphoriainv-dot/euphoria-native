/**
 * You — the profile hub, built around the league tier you hold.
 *
 * Rewritten to lead with the league because a named tier you are climbing is the retention loop
 * both reference apps are built on, and because the previous version was a settings screen with
 * an avatar on top.
 *
 * IT ALSO USED TO LIE. `84 + lessons` inflated the lesson count by 84 lessons the user had never
 * done, `Rank: '#3'` was hardcoded, and so was the name. Every number on this page now traces to
 * real store state: xp, streak, completedLessons, level() and levelProgress(). If you add a stat
 * here and cannot point at the field behind it, it does not belong on the page.
 */
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '@/lib/store';

import { AmbientBackground } from '@/components/ambient-background';
import { Atlas } from '@/components/atlas';
import { Icon } from '@/components/icon';
import { LeagueCrest } from '@/components/league-crest';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { TIERS, tierProgress } from '@/lib/league';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

/**
 * Rows carry an EXPLICIT route. They used to derive one from the label via
 * `label.toLowerCase().split(' ')[0]`, which turned "Euphoria Pro" into `euphoria` - not a key in
 * settings/[section].tsx's TITLES - so the app's only upsell dead-ended on a screen reading
 * "Settings settings are coming soon". Deriving navigation from display copy means renaming a
 * label silently moves where it goes.
 *
 * `?step=paywall` is matched by NAME in onboarding.tsx, not by index, and is the one step param
 * that works outside dev.
 */
const ROWS = [
  { icon: 'you', label: 'Friends', route: '/friends' },
  { icon: 'sparkle', label: 'Games', route: '/games' },
  { icon: 'you', label: 'Account', route: '/settings/account' },
  { icon: 'bell', label: 'Notifications', route: '/settings/notifications' },
  { icon: 'sparkle', label: 'Euphoria Pro', accent: true, route: '/onboarding?step=paywall' },
  { icon: 'settings', label: 'Preferences', route: '/settings/preferences' },
];

/** Counters that change need fixed-width digits, or the number jitters sideways as it climbs. */
const NUM = { fontVariant: ['tabular-nums' as const] };

export default function You() {
  const theme = useTheme();
  const router = useRouter();
  const xp = useApp((s) => s.xp);
  const streak = useApp((s) => s.streak);
  const level = useApp((s) => s.level());
  // ponytail: levelProgress() returns a fresh object → unstable zustand snapshot → infinite render
  // loop. Read it non-reactively; the selected `xp` above already re-renders on change.
  const lp = useApp.getState().levelProgress();
  const lessons = useApp((s) => s.completedLessons.length);
  const guides = useApp((s) => s.readPosts.length);
  const name = useApp((s) => s.profile.name);
  const handle = useApp((s) => s.profile.handle);

  const { tier, next, progress, xpToNext } = tierProgress(xp);
  const fresh = xp === 0 && lessons === 0 && streak === 0;

  // Accent = that icon's own dominant fill from EUPHORIA_ICONS. Four different hues is what stops
  // the grid reading as one tile repeated, which is what the uniform violet chip used to do.
  const STATS = [
    { icon: 'flame', label: 'Day streak', value: String(streak), accent: '#F97316' },
    { icon: 'open-book', label: 'Lessons', value: String(lessons), accent: '#BB83F1' },
    { icon: 'crown', label: 'XP', value: xp.toLocaleString(), accent: '#FBBF24' },
    { icon: 'post', label: 'Guides read', value: String(guides), accent: '#38BDF8' },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={45} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* League hero — the page's headline is the tier, not the person */}
        <RiseIn>
          {/* The crest is the tap target, so the Leaderboard row could go. */}
          <SpringPressable haptic={false} onPress={() => router.push('/league')}>
          <Card style={styles.hero} elevated tint={tier.color}>
            <LeagueCrest tier={tier} size={104} />
            <ThemedText type="label" themeColor="mutedForeground" style={styles.heroKicker}>
              YOUR LEAGUE
            </ThemedText>
            <ThemedText type="title" style={[styles.heroTitle, { color: tier.color }]}>{tier.name}</ThemedText>
            <View style={styles.heroBar}>
              <ProgressBar value={progress} height={9} />
            </View>
            <ThemedText type="small" themeColor="mutedForeground" style={NUM}>
              {next ? `${xpToNext.toLocaleString()} XP to ${next.name}` : 'Top tier reached'}
            </ThemedText>
          </Card>
          </SpringPressable>
        </RiseIn>

        {/* Identity. Name and handle come from sign-up; both fall back rather than inventing
            anything, which is what the old hardcoded name did. */}
        <RiseIn delay={60}>
          <Card style={styles.identity}>
            <Atlas size={62} expression="happy" interactive={false} />
            <View style={{ flex: 1 }}>
              <ThemedText type="bodyMedium">{name ?? 'Your profile'}</ThemedText>
              <ThemedText type="small" themeColor="mutedForeground" style={NUM}>
                {handle ? `@${handle} · ` : ''}Level {level}
              </ThemedText>
              <View style={styles.xpRow}>
                <ProgressBar value={lp.into / lp.size} height={7} />
              </View>
              <ThemedText type="small" themeColor="mutedForeground" style={NUM}>
                {lp.toNext.toLocaleString()} XP to level {level + 1}
              </ThemedText>
            </View>
          </Card>
        </RiseIn>

        {/* Stats. Real values only. */}
        <View style={styles.grid}>
          {STATS.map((s, i) => (
            <RiseIn key={s.label} delay={100 + i * 40} style={styles.gridHalf}>
              <Card style={styles.statTile} tint={s.accent}>
                {/* No chip behind it: these glyphs are already multicolour, and a uniform tinted
                    square behind each one is what made a gold crown and an orange flame look the
                    same. Brilliant places icons directly on the card for this reason. */}
                <Icon name={s.icon} size={34} />
                <View>
                  <ThemedText type="heading" style={[{ fontSize: 20 }, NUM]}>{s.value}</ThemedText>
                  <ThemedText type="small" themeColor="mutedForeground">{s.label}</ThemedText>
                </View>
              </Card>
            </RiseIn>
          ))}
        </View>

        {fresh && (
          <RiseIn delay={260}>
            <ThemedText type="small" themeColor="mutedForeground" style={styles.emptyNote}>
              Finish your first lesson to start climbing.
            </ThemedText>
          </RiseIn>
        )}

        {/* The ladder. Replaces the old certificate row, whose done/not-done was hardcoded and
            tied to no achievement. These are earned. */}
        <RiseIn delay={280}>
          <ThemedText type="label" themeColor="mutedForeground" style={styles.sectionLabel}>
            League ladder
          </ThemedText>
          <Card>
            <View style={styles.ladder}>
              {TIERS.map((t, i) => (
                <RiseIn key={t.name} delay={300 + i * 45}>
                  <View style={styles.rung}>
                    <LeagueCrest tier={t} size={38} locked={xp < t.minXp} />
                    <ThemedText
                      type="small"
                      themeColor={xp >= t.minXp ? 'text' : 'mutedForeground'}
                      numberOfLines={1}
                      style={styles.rungLabel}>
                      {t.name.split(' ')[0]}
                    </ThemedText>
                  </View>
                </RiseIn>
              ))}
            </View>
          </Card>
        </RiseIn>


        {/* Everything else this page links to */}
        <RiseIn delay={380}>
          <Card padded={false} style={{ marginTop: Spacing.three }}>
            {ROWS.map((s, i) => (
              <SpringPressable key={s.label} haptic={false} onPress={() => router.push(s.route as never)}>
                <View style={[styles.settingRow, i < ROWS.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                  <UIcon name={s.icon} size={20} color={s.accent ? theme.iconLilac : theme.mutedForeground} />
                  <ThemedText type="bodyMedium" style={{ flex: 1, color: s.accent ? theme.iconLilac : theme.text }}>{s.label}</ThemedText>
                  <UIcon name="arrowRight" size={16} color={theme.mutedForeground} />
                </View>
              </SpringPressable>
            ))}
          </Card>
        </RiseIn>

        <SpringPressable haptic={false} onPress={() => { useApp.getState().signOut(); router.replace('/auth' as never); }} style={styles.logout}>
          <ThemedText type="bodyMedium" style={{ color: theme.destructive }}>Log out</ThemedText>
        </SpringPressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four },
  hero: { alignItems: 'center', paddingVertical: Spacing.four },
  heroKicker: { marginTop: Spacing.two, letterSpacing: 1.2 },
  heroTitle: { fontSize: 26, marginTop: 2 },
  heroBar: { alignSelf: 'stretch', marginTop: Spacing.three, marginBottom: Spacing.two },
  identity: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginTop: Spacing.three },
  xpRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: 6, marginBottom: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three, marginTop: Spacing.three },
  gridHalf: { width: '47%', flexGrow: 1 },
  statTile: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 2 },
  emptyNote: { textAlign: 'center', marginTop: Spacing.three },
  sectionLabel: { marginTop: Spacing.four, marginBottom: Spacing.two },
  // seven rungs have to fit 402pt without horizontal scroll: space-between rather than a fixed gap
  ladder: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  rung: { alignItems: 'center', gap: 4, width: 47 },
  rungLabel: { fontSize: 10 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three },
  logout: { alignItems: 'center', paddingVertical: Spacing.four },
});
