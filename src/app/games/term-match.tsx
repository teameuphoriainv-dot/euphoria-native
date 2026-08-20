/**
 * Term Match — tap-to-match mini-game. Match each term (left) to its definition (right):
 * correct pair locks green, wrong flashes amber. Score + timer; results card w/ celebration.
 */
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { AmbientBackground } from '@/components/ambient-background';
import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { GradientButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useApp } from '@/lib/store';
import { NumberRollup } from '@/shared/motion/number-rollup';
import { RewardPop } from '@/shared/motion/reward-pop';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { Duration } from '@/shared/motion/tokens';

const PAIRS = [
  { id: 'bull', term: 'Bull market', def: 'Rising prices' },
  { id: 'bear', term: 'Bear market', def: 'A 20%+ decline' },
  { id: 'div', term: 'Dividend', def: 'A profit payout' },
  { id: 'diver', term: 'Diversification', def: 'Spreading risk' },
  { id: 'comp', term: 'Compounding', def: 'Interest on interest' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function TermMatch() {
  const theme = useTheme();
  const defs = useMemo(() => shuffle(PAIRS), []);
  const [selTerm, setSelTerm] = useState<string | null>(null);
  const [selDef, setSelDef] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);

  const done = matched.length === PAIRS.length;

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [done]);

  // Finishing a round pays XP, so the league is climbable from more than one surface. The store
  // caps this to once per local day, because unlike a lesson a game has no permanent id to dedupe
  // against and paying every round would let anyone farm the weekly standings.
  useEffect(() => {
    if (done) useApp.getState().awardGameXp();
  }, [done]);

  useEffect(() => {
    if (selTerm && selDef) {
      if (selTerm === selDef) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setMatched((m) => [...m, selTerm]);
        setSelTerm(null);
        setSelDef(null);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setWrong([selTerm, selDef]);
        const t = setTimeout(() => {
          setWrong([]);
          setSelTerm(null);
          setSelDef(null);
        }, 500);
        return () => clearTimeout(t);
      }
    }
  }, [selTerm, selDef]);

  const cardStyle = (id: string, selected: boolean) => {
    const isMatched = matched.includes(id);
    const isWrong = wrong.includes(id);
    const border = isMatched ? theme.success : isWrong ? theme.warning : selected ? theme.primary : theme.border;
    return {
      borderColor: border,
      borderWidth: selected || isMatched || isWrong ? 2 : StyleSheet.hairlineWidth,
      backgroundColor: isMatched ? theme.success + '14' : selected ? theme.primary + '14' : theme.card,
      opacity: isMatched ? 0.55 : 1,
    };
  };

  const time = `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientBackground starCount={35} />
      <View style={styles.header}>
        <SpringPressable haptic={false} scaleTo={0.85} onPress={() => router.back()} style={styles.back} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back">
          <UIcon name="close" size={22} color={theme.mutedForeground} />
        </SpringPressable>
        <ThemedText type="title" style={{ flex: 1, fontSize: FontSize.headingLg }}>Term Match</ThemedText>
        <ThemedText type="heading" themeColor="mutedForeground" style={{ fontSize: FontSize.body, fontVariant: ['tabular-nums'] }}>{time}</ThemedText>
      </View>

      <View style={styles.board}>
        <View style={styles.col}>
          {PAIRS.map((p) => (
            <SpringPressable key={p.id} disabled={matched.includes(p.id)} onPress={() => setSelTerm(p.id)}>
              <View style={[styles.cell, cardStyle(p.id, selTerm === p.id)]}>
                <ThemedText type="bodyMedium" style={{ textAlign: 'center' }}>{p.term}</ThemedText>
              </View>
            </SpringPressable>
          ))}
        </View>
        <View style={styles.col}>
          {defs.map((p) => (
            <SpringPressable key={p.id} disabled={matched.includes(p.id)} onPress={() => setSelDef(p.id)}>
              <View style={[styles.cell, cardStyle(p.id, selDef === p.id)]}>
                <ThemedText type="small" style={{ textAlign: 'center' }}>{p.def}</ThemedText>
              </View>
            </SpringPressable>
          ))}
        </View>
      </View>

      {done && (
        <Animated.View entering={FadeIn} exiting={FadeOut.duration(Duration.exit)} style={styles.resultsWrap}>
          <Card elevated style={styles.results}>
            <Atlas size={96} expression="happy" celebrate idle />
            <ThemedText type="display" style={{ fontSize: FontSize.titleLg, marginTop: Spacing.two }}>Matched!</ThemedText>
            <ThemedText type="body" themeColor="mutedForeground" style={{ marginTop: 4 }}>All 5 pairs in {time}</ThemedText>
            <RewardPop delay={200} style={{ marginTop: Spacing.three }}>
              <View style={[styles.xpChip, { backgroundColor: theme.primary + '1F', borderColor: theme.primary + '4D' }]}>
                <UIcon name="sparkle" size={16} color={theme.iconLilac} />
                <NumberRollup value={40} prefix="+" suffix=" XP" type="heading" style={{ color: theme.iconLilac, fontSize: FontSize.bodyLg }} />
              </View>
            </RewardPop>
            <GradientButton label="Done" full style={{ marginTop: Spacing.four }} onPress={() => router.back()} />
          </Card>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.three, paddingTop: Spacing.one },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  board: { flexDirection: 'row', gap: Spacing.three, padding: Spacing.three, flex: 1, marginTop: Spacing.three },
  col: { flex: 1, gap: Spacing.two + 4 },
  cell: { minHeight: 68, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', padding: Spacing.two + 4 },
  resultsWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', padding: Spacing.four, backgroundColor: '#09090DDD' },
  results: { alignItems: 'center', alignSelf: 'stretch', paddingVertical: Spacing.five },
  xpChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 9, borderRadius: Radius.pill, borderWidth: 1 },
});
