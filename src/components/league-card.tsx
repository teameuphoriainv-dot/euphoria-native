/**
 * Home's league card: where you stand THIS WEEK, which nothing else on Home says (owner decision,
 * replacing the course list that repeated the hero and the Learn tab). Rank, the gap to the
 * promotion zone as a filling bar, and days left; tapping opens the full board. Numbers come from
 * lib/league-standings, the same source the League screen ranks with, so the two always agree.
 */
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { LeagueCrest } from '@/components/league-crest';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Fonts, FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { tierForXp } from '@/lib/league';
import { daysLeft, standingFor } from '@/lib/league-standings';
import { targetFor, WEEK_TARGETS } from '@/lib/league-week';
import { useApp } from '@/lib/store';
import { AppNumberFlow } from '@/shared/motion/app-number-flow';
import { ProgressFill } from '@/shared/motion/progress-fill';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { Duration, Ease } from '@/shared/motion/tokens';

export function LeagueCard() {
  const theme = useTheme();
  const xp = useApp((s) => s.xp);
  const weekly = useApp((s) => s.weeklyXpNow());
  const tier = tierForXp(xp);
  const { rank, total } = standingFor(weekly);
  /*
   * THE GOAL THAT PAYS. Finishing top 3 earns nothing: the rivals are practice profiles, and
   * league-week.ts pays for fixed weekly XP targets instead. So the card leads with the next
   * target and its reward; the practice rank stays as a small secondary line.
   */
  const next = [...WEEK_TARGETS].reverse().find((t) => t.xp > weekly && t.coins > 0);
  const cleared = targetFor(weekly);
  const goal = next ?? cleared;
  const ratio = goal.xp > 0 ? Math.min(1, weekly / goal.xp) : 1;
  const done = !next;

  return (
    <SpringPressable
      scaleTo={1}
      sink={3}
      onPress={() => router.push('/league')}
      accessibilityRole="button"
      accessibilityLabel={`${tier.name} League. ${String(weekly)} of ${String(goal.xp)} XP this week. ${
        done ? `${cleared.label}, plus ${String(cleared.coins)} coins.` : `Reach ${String(goal.xp)} XP for plus ${String(goal.coins)} coins.`
      } ${daysLeft()}. Practice rank ${String(rank)} of ${String(total)}.`}>
      <Card depthColor={tier.color + 'B3'} style={[styles.card, { borderColor: tier.color + '59' }]}>
        <View style={styles.head}>
          <LeagueCrest tier={tier} size={36} />
          <ThemedText type="title" style={styles.title}>{`${tier.name} League`}</ThemedText>
          <ThemedText type="small" themeColor="mutedForeground">{daysLeft()}</ThemedText>
        </View>
        <View style={styles.xpLine}>
          <AppNumberFlow
            value={weekly}
            spinTiming={{ duration: Duration.slow, easing: Ease.out.factory() }}
            style={{ fontFamily: Fonts.black, fontSize: FontSize.title, color: tier.color }}
          />
          <ThemedText type="bodyMedium" themeColor="mutedForeground">
            {done ? ` XP · ${cleared.label}` : ` / ${goal.xp.toLocaleString('en-US')} XP · +${String(goal.coins)} coins`}
          </ThemedText>
        </View>
        <View style={[styles.track, { backgroundColor: theme.muted }]}>
          <ProgressFill ratio={ratio} color={done ? theme.success : tier.color} style={styles.fill} fillOnMount />
        </View>
      </Card>
    </SpringPressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.three },
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  title: { flex: 1, fontSize: FontSize.titleSm },
  xpLine: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  track: { height: 8, borderRadius: Radius.chip, overflow: 'hidden' },
  fill: { height: 8, borderRadius: Radius.chip },
});
