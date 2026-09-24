/**
 * The achievements screen.
 *
 * SHOWS LOCKED ONES TOO, with their real progress. That is the whole design: a wall of grey badges
 * with "8/10 lessons" under one of them is an invitation, where a list of only what you have is a
 * receipt. Duolingo and Bloom both do this and the reason is the same — the locked half is what
 * makes the earned half mean something.
 *
 * EARNED ONES ARE TAPPABLE, and tapping wears that achievement's TITLE under your name. Locked ones
 * are not, and say what to do instead of what they are.
 */
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { BottomTabInset, FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ACHIEVEMENTS, isEarned, type AchievementState } from '@/lib/achievements';
import { PixelSpriteView } from '@/lib/pixel';
import { useApp } from '@/lib/store';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { ProgressFill } from '@/shared/motion/progress-fill';
import { Duration, STAGGER_CAP } from '@/shared/motion/tokens';

export default function Achievements() {
  const theme = useTheme();
  const titleId = useApp((s) => s.titleId);
  const setTitleId = useApp((s) => s.setTitleId);

  /*
   * ONE selector returning a NARROW object, not eleven selectors and not `useApp(s => s)`. A
   * whole-store selector re-renders this screen on every unrelated write, and a fresh object from
   * a getter is the "Maximum update depth exceeded" trap documented at you.tsx and store.ts. These
   * are all reference-stable fields, so the shallow default comparison is correct.
   */
  const s: AchievementState = {
    xp: useApp((x) => x.xp),
    bestStreak: useApp((x) => x.bestStreak),
    completedLessons: useApp((x) => x.completedLessons),
    readPosts: useApp((x) => x.readPosts),
    inventory: useApp((x) => x.inventory),
    positions: useApp((x) => x.positions),
    derivativeTrades: useApp((x) => x.derivativeTrades),
    coins: useApp((x) => x.coins),
    following: useApp((x) => x.following),
    followers: useApp((x) => x.followers),
    watchlist: useApp((x) => x.watchlist),
  };

  const earnedCount = ACHIEVEMENTS.filter((a) => isEarned(a, s)).length;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={25} glow={false} />

      <View style={styles.header}>
        <SpringPressable
          haptic={false}
          scaleTo={0.85}
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Back">
          <UIcon name="chevronLeft" size={22} color={theme.mutedForeground} />
        </SpringPressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ThemedText type="display" style={{ fontSize: FontSize.titleSm }}>Achievements</ThemedText>
        <ThemedText type="body" themeColor="mutedForeground" style={{ marginTop: 4 }}>
          {`${String(earnedCount)} of ${String(ACHIEVEMENTS.length)} earned. Tap one you have to wear its title.`}
        </ThemedText>

        <View style={{ marginTop: Spacing.four, gap: Spacing.two }}>
          {ACHIEVEMENTS.map((a, i) => {
            const p = a.progress(s);
            const got = p.at >= p.of;
            const worn = titleId === a.id;
            const pct = Math.max(0, Math.min(1, p.of === 0 ? 1 : p.at / p.of));
            return (
              <RiseIn key={a.id} delay={Math.min(i * 16, STAGGER_CAP)}>
                <SpringPressable
                  disabled={!got}
                  scaleTo={got ? 0.985 : 1}
                  onPress={() => { setTitleId(worn ? '' : a.id); }}
                  accessibilityRole="button"
                  accessibilityLabel={
                    got ? `${a.label}, earned. ${worn ? 'Wearing the title' : 'Wear the title'} ${a.title}` : `${a.label}, locked. ${a.hint}`
                  }>
                  <View
                    style={[
                      styles.row,
                      {
                        backgroundColor: worn ? theme.primary + '1A' : theme.card,
                        borderColor: worn ? theme.primary : theme.border,
                        borderWidth: worn ? 1.5 : StyleSheet.hairlineWidth,
                      },
                    ]}>
                    {/* Locked badges keep their HUE and lose their light. A grey silhouette hides
                        what the badge is, which is the one thing that makes you want it. */}
                    <View style={{ opacity: got ? 1 : 0.32 }}>
                      <PixelSpriteView sprite={a.sprite} size={34} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <ThemedText type="bodyMedium" numberOfLines={1}>{a.label}</ThemedText>
                      <ThemedText type="small" themeColor="mutedForeground" numberOfLines={1}>
                        {got ? (worn ? `Wearing "${a.title}"` : `Title: ${a.title}`) : a.hint}
                      </ThemedText>

                      {!got && (
                        <View style={[styles.track, { backgroundColor: theme.border }]}>
                          <ProgressFill ratio={pct} color={theme.primary} style={styles.fill} fillOnMount delay={Math.min(i * 16, STAGGER_CAP) + Duration.base} />
                        </View>
                      )}
                    </View>

                    {got ? (
                      <UIcon name="check" size={18} color={worn ? theme.primary : theme.mutedForeground} strokeWidth={3} />
                    ) : (
                      <ThemedText type="small" themeColor="mutedForeground">
                        {`${String(p.at)}/${String(p.of)}`}
                      </ThemedText>
                    )}
                  </View>
                </SpringPressable>
              </RiseIn>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: Spacing.three, paddingTop: Spacing.two, paddingBottom: Spacing.one },
  scroll: { paddingHorizontal: Spacing.three, paddingBottom: BottomTabInset + Spacing.six },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.lg,
  },
  track: { height: 4, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
});
