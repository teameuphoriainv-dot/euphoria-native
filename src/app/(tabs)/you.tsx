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
import { StatMark, type StatMarkName } from '@/components/art/stat-mark';
import { LeagueCrest } from '@/components/league-crest';
import { ThemedText } from '@/components/themed-text';
import { UIcon, type UIconName } from '@/components/ui-icon';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { TRIAL_DAYS, trialDayNumber, useTier } from '@/lib/entitlement';
import { TIERS, tierProgress } from '@/lib/league';
import { money } from '@/lib/stocks';
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
const ROWS: { icon: UIconName; label: string; accent?: boolean; route: string }[] = [
  { icon: 'you', label: 'Friends', route: '/friends' },
  { icon: 'sparkle', label: 'Games', route: '/games' },
  { icon: 'sparkle', label: 'Ask Atlas', route: '/chat' },
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
  // Was in the store and invisible on every screen until now.
  const rewardsEarned = useApp((s) => s.rewardsEarned);
  // Plan status. 5/5 of the reference set puts account state in this surface, so it leads the page.
  const planTier = useTier();
  const trialDay = useApp(trialDayNumber);
  const lessonsLeft = useApp((st) => st.freeLessonsLeft());
  const atlasLeft = useApp((st) => st.atlasLeft());
  /*
   * Safe to show again: §22 C26 resolved the split. store.derivativesLeft() and
   * entitled('options') now agree, because the three-contract cap was reframed as a DATA limit
   * that binds Pro equally rather than a trial restriction. options.tsx gates on access, so a
   * trial user genuinely has these.
   */
  const optionsLeft = useApp((st) => st.derivativesLeft());
  const name = useApp((s) => s.profile.name);
  const handle = useApp((s) => s.profile.handle);

  const { tier, next, progress, xpToNext } = tierProgress(xp);
  const fresh = xp === 0 && lessons === 0 && streak === 0;

  // Accent = that icon's own dominant fill from EUPHORIA_ICONS. Four different hues is what stops
  // the grid reading as one tile repeated, which is what the uniform violet chip used to do.
  /**
   * Five tiles, each with a DESTINATION. They were four INERT tiles — a stat you cannot act on is a
   * dead end, and `rewardsEarned` sat in the store invisible on every screen.
   *
   * Marks come from art/stat-mark.tsx, not EUPHORIA_ICONS, because that registry was doing double
   * duty here: `crown` is amber-and-gold multicolour drawn for a league moment and `post` is a
   * generic document, so the grid read as four unrelated illustrations instead of one set.
   */
  const STATS: { icon: StatMarkName; label: string; value: string; accent: string; route: string }[] = [
    { icon: 'streak', label: 'Day streak', value: String(streak), accent: '#F97316', route: '/(tabs)/learn' },
    { icon: 'lessons', label: 'Lessons', value: String(lessons), accent: '#BB83F1', route: '/(tabs)/learn' },
    { icon: 'xp', label: 'XP', value: xp.toLocaleString(), accent: '#FBBF24', route: '/league' },
    { icon: 'guides', label: 'Guides read', value: String(guides), accent: '#38BDF8', route: '/(tabs)/digest' },
    { icon: 'earned', label: 'Earned', value: money(rewardsEarned), accent: '#34D399', route: '/(tabs)/trade' },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={45} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/*
          * PLAN STATUS. Leads the page because account state is 5/5 convergence across
          * Elevate / Praktika / Meetup / Kling / Loora, and because nothing on this screen used
          * to say what the user had or what was left.
          *
          * `trialDayNumber` NOT `trialDaysLeft` — on the third active day daysLeft is 0 while the
          * trial is still live, and "0 days left" on a usable day reads as already expired.
          */}
        <RiseIn>
          <Card style={styles.plan} tint={planTier === 'pro' ? theme.iconGold : theme.primary}>
            <View style={styles.planTop}>
              <UIcon
                name={planTier === 'pro' ? 'trophy' : 'sparkle'}
                size={20}
                color={planTier === 'pro' ? theme.iconGold : theme.primary}
              />
              <ThemedText type="bodyMedium">
                {planTier === 'pro' ? 'Euphoria Pro' : planTier === 'expired' ? 'Free' : 'Free trial'}
              </ThemedText>
              <View style={{ flex: 1 }} />
              {planTier === 'trial' && (
                <ThemedText type="smallBold" style={[NUM, { color: theme.iconLilac }]}>
                  Day {trialDay} of {TRIAL_DAYS}
                </ThemedText>
              )}
            </View>
            <ThemedText type="small" themeColor="mutedForeground" style={NUM}>
              {planTier === 'pro'
                ? 'Every lesson, unlimited Atlas, the full options desk.'
                : planTier === 'expired'
                  ? 'Your free days are up. Pro reopens every lesson and Atlas.'
                  : `${lessonsLeft} lessons · ${atlasLeft} Atlas · ${optionsLeft} options contracts left`}
            </ThemedText>
            {planTier !== 'pro' && (
              <SpringPressable
                scaleTo={0.97}
                onPress={() => router.push('/onboarding?step=paywall')}
                accessibilityRole="button"
                accessibilityLabel="See Euphoria Pro">
                {/* Unit 4 replaces this route with the contextual gate sheet. Until then it goes
                    where every other upsell in the app already goes, rather than nowhere. */}
                <View style={[styles.planCta, { borderColor: theme.primary }]}>
                  <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>
                    See Euphoria Pro
                  </ThemedText>
                </View>
              </SpringPressable>
            )}
          </Card>
        </RiseIn>

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
              {/*
                * NO SECOND PROGRESS BAR HERE, and this is measured rather than aesthetic.
                * A level spans XP_PER_LEVEL = 500. The first league tier, Saver -> Investor,
                * spans minXp 0 -> 500. So for the whole of tier 1 the level bar and the league
                * bar in the hero above are the IDENTICAL measurement — both read "390 XP to …"
                * at xp 110 — stacked about 40pt apart with no visual distinction. They only
                * diverge at tier 3, whose span is 1000.
                *
                * The hero owns the bar because the page's headline is the tier. Level stays as a
                * number, which is the part the bar was not already saying.
                */}
              <ThemedText type="small" themeColor="mutedForeground" style={NUM}>
                {xp.toLocaleString()} XP total · {lp.toNext.toLocaleString()} to level {level + 1}
              </ThemedText>
            </View>
          </Card>
        </RiseIn>

        {/* Stats. Real values only. */}
        <View style={styles.grid}>
          {STATS.map((s, i) => (
            <RiseIn key={s.label} delay={100 + i * 40} style={styles.gridHalf}>
              <SpringPressable
                scaleTo={0.96}
                onPress={() => router.push(s.route as Parameters<typeof router.push>[0])}
                accessibilityRole="button"
                accessibilityLabel={`${s.label}, ${s.value}`}>
                <Card style={styles.statTile} tint={s.accent}>
                {/* No chip behind it: these glyphs are already multicolour, and a uniform tinted
                    square behind each one is what made a gold crown and an orange flame look the
                    same. Brilliant places icons directly on the card for this reason. */}
                  <StatMark name={s.icon} size={34} color={s.accent} />
                <View>
                  <ThemedText type="heading" style={[{ fontSize: 20 }, NUM]}>{s.value}</ThemedText>
                  <ThemedText type="small" themeColor="mutedForeground">{s.label}</ThemedText>
                  </View>
                </Card>
              </SpringPressable>
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
                  {/* Tappable, and each rung STATES ITS THRESHOLD. A locked crest that does not
                      say what unlocks it is decoration; Duolingo's leaderboard gate names its own
                      condition ("Finish 7 lessons to start competing"), which is the pattern. */}
                  <SpringPressable
                    scaleTo={0.92}
                    haptic={false}
                    onPress={() => router.push('/league')}
                    accessibilityRole="button"
                    accessibilityLabel={
                      xp >= t.minXp
                        ? `${t.name}, reached`
                        : `${t.name}, needs ${t.minXp.toLocaleString()} XP`
                    }>
                    <View style={styles.rung}>
                      <LeagueCrest tier={t} size={38} locked={xp < t.minXp} />
                      <ThemedText
                        type="small"
                        themeColor={xp >= t.minXp ? 'text' : 'mutedForeground'}
                        numberOfLines={1}
                        style={styles.rungLabel}>
                        {t.name.split(' ')[0]}
                      </ThemedText>
                      <ThemedText
                        type="label"
                        themeColor={xp >= t.minXp ? 'textSecondary' : 'mutedForeground'}
                        numberOfLines={1}
                        style={styles.rungXp}>
                        {t.minXp === 0 ? 'START' : `${t.minXp / 1000 >= 1 ? `${t.minXp / 1000}k` : t.minXp}`}
                      </ThemedText>
                    </View>
                  </SpringPressable>
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
  plan: { gap: Spacing.two },
  planTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one + 2 },
  planCta: { borderWidth: 1, borderRadius: Radius.pill, paddingVertical: Spacing.one + 2, alignItems: 'center' },
  rungXp: { marginTop: 2, textAlign: 'center' },
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
