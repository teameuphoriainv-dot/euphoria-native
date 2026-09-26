/**
 * Term Match — tap-to-match mini-game. Match each term (left) to its definition (right):
 * correct pair locks green, wrong flashes amber. Score + timer; results card w/ celebration.
 */
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from '@/lib/haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { AmbientBackground } from '@/components/ambient-background';
import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { SlabButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { phaseOf, startedCourses } from '@/lib/learner-phase';
import { PixelSpriteView, lightbulb } from '@/lib/pixel';
import { roundFor, shuffleSeeded } from '@/lib/term-bank';
import { useApp } from '@/lib/store';
import { NumberRollup } from '@/shared/motion/number-rollup';
import { RewardPop } from '@/shared/motion/reward-pop';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { Duration } from '@/shared/motion/tokens';
import { playSfx } from '@/lib/sfx';

export default function TermMatch() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ qa?: string }>();
  const qa = __DEV__ ? params.qa : undefined;

  /*
   * THE BOARD IS BUILT FOR THIS LEARNER, not for everybody.
   *
   * This file used to open with five hardcoded pairs and `useMemo(() => shuffle(PAIRS), [])`, so
   * a first-day user and someone thirty lessons deep were handed the identical five terms — and
   * `shuffle` used Math.random, meaning the "memo" was only stable by accident of the empty
   * dependency array. Both are gone: roundFor picks from the 60-term bank by phase and by which
   * courses you have actually started, and the shuffle inside it is seeded.
   *
   * TWO SEPARATE useState INITIALISERS, deliberately. `seed` is captured ONCE at mount — a fresh
   * seed per render would reshuffle the board while the player is looking at it, which is the
   * purity trap quests.ts documents. `pairs` derives from it and is likewise frozen for the round.
   */
  const [seed] = useState(() => Date.now());
  const completedLessons = useApp((st) => st.completedLessons);
  const [pairs] = useState(() => {
    const st = { completedLessons };
    return roundFor({ phase: phaseOf(st), started: startedCourses(st), seed });
  });
  /*
   * The definition column is shuffled INDEPENDENTLY of the term column, on its own seed.
   *
   * A plain reverse() would have done it in one character and would have been a real gameplay bug:
   * on a four-tile board the answer is then always the mirror of the prompt, and a player works
   * that out in about two rounds. Different seed, so the two columns share no ordering.
   */
  const defs = useMemo(() => shuffleSeeded(pairs, seed + 7), [pairs, seed]);
  const [selTerm, setSelTerm] = useState<string | null>(null);
  const [selDef, setSelDef] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>(() => (qa === 'over' ? pairs.map((pair) => pair.id) : []));
  const [wrong, setWrong] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(qa === 'over');

  const done = matched.length === pairs.length;

  useEffect(() => {
    if (!started || done) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [done, started]);

  // Finishing a round pays XP, so the league is climbable from more than one surface. The store
  // caps this to once per local day, because unlike a lesson a game has no permanent id to dedupe
  // against and paying every round would let anyone farm the weekly standings.
  useEffect(() => {
    if (done) useApp.getState().awardGameXp();
  }, [done]);

  /*
   * RESOLVING A PAIR IS AN EVENT, NOT A DERIVED STATE.
   *
   * This was a useEffect watching [selTerm, selDef] and calling setState when both were filled,
   * which react-hooks/set-state-in-effect flags as an ERROR — and it was failing at HEAD, unseen,
   * because `npm run check` runs the 37 pins and never runs eslint. It is not a style nit either:
   * every tap rendered once to store the selection, then the effect fired and rendered AGAIN to
   * resolve it. Two commits per tap, in a game, on a codebase with an open render-cost complaint.
   *
   * A tap is the event that decides a match, so the decision belongs in the handler. `pick` takes
   * the id the player just chose plus the OTHER column's current selection, resolves immediately,
   * and the timeout that clears a wrong pair is the one genuinely deferred piece.
   *
   * The timer is tracked in a ref and cleared on unmount: leaving the screen mid-mistake used to
   * leave a 500ms setTimeout holding setState on an unmounted tree.
   */
  const wrongTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (wrongTimer.current) clearTimeout(wrongTimer.current); }, []);

  const pick = (side: 'term' | 'def', id: string) => {
    // A pending mistake is still on screen; ignore taps until it clears, or the board can be
    // advanced past its own feedback.
    if (wrongTimer.current) return;
    const other = side === 'term' ? selDef : selTerm;
    if (side === 'term') setSelTerm(id); else setSelDef(id);
    if (other === null) return;

    if (other === id) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playSfx('correct');
      setMatched((m) => [...m, id]);
      setSelTerm(null);
      setSelDef(null);
      return;
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    playSfx('wrong');
    setWrong([id, other]);
    wrongTimer.current = setTimeout(() => {
      wrongTimer.current = null;
      setWrong([]);
      setSelTerm(null);
      setSelDef(null);
    }, 500);
  };

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
        <PixelSpriteView sprite={lightbulb} size={26} />
        <ThemedText type="title" maxFontSizeMultiplier={1.6} numberOfLines={1} style={{ flex: 1, fontSize: FontSize.headingLg }}>Term Match</ThemedText>
        {started ? <ThemedText type="heading" themeColor="mutedForeground" style={{ fontSize: FontSize.body, fontVariant: ['tabular-nums'] }}>{time}</ThemedText> : null}
      </View>

      {!started ? (
        <ScrollView contentContainerStyle={styles.intro} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn} style={styles.introInner}>
            <PixelSpriteView sprite={lightbulb} size={68} />
            <ThemedText type="display" maxFontSizeMultiplier={1.6} style={styles.introTitle}>Term Match</ThemedText>
            <ThemedText type="body" maxFontSizeMultiplier={1.6} themeColor="mutedForeground" style={styles.introCopy}>
              Tap one finance term and its literal definition to lock every pair.
            </ThemedText>
            <SlabButton
              label="Start"
              accessibilityLabel="Start Term Match"
              full
              onPress={() => { setStarted(true); }}
              style={styles.introButton}
            />
          </Animated.View>
        </ScrollView>
      ) : <View style={styles.board}>
        <View style={styles.col}>
          {pairs.map((p) => (
            <SpringPressable key={p.id} disabled={matched.includes(p.id)} onPress={() => { pick('term', p.id); }}>
              <View style={[styles.cell, cardStyle(p.id, selTerm === p.id)]}>
                <ThemedText type="bodyMedium" style={{ textAlign: 'center' }}>{p.term}</ThemedText>
              </View>
            </SpringPressable>
          ))}
        </View>
        <View style={styles.col}>
          {defs.map((p) => (
            <SpringPressable key={p.id} disabled={matched.includes(p.id)} onPress={() => { pick('def', p.id); }}>
              <View style={[styles.cell, cardStyle(p.id, selDef === p.id)]}>
                <ThemedText type="small" style={{ textAlign: 'center' }}>{p.def}</ThemedText>
              </View>
            </SpringPressable>
          ))}
        </View>
      </View>}

      {done && (
        <Animated.View entering={FadeIn} exiting={FadeOut.duration(Duration.exit)} style={styles.resultsWrap}>
          <Card elevated style={styles.results}>
            <Atlas size={96} expression="happy" celebrate idle />
            <ThemedText type="display" style={{ fontSize: FontSize.titleLg, marginTop: Spacing.two }}>Matched!</ThemedText>
            <ThemedText type="body" themeColor="mutedForeground" style={{ marginTop: 4 }}>
              {/* Was a hardcoded "All 5 pairs", which the adaptive board made wrong for three of
                  the four phases: a new learner matches 4 and was told 5, a fluent one matches 7
                  and was told 5. A count that contradicts what the player just did reads as the
                  game not having noticed. */}
              {`All ${String(pairs.length)} pairs in ${time}`}
            </ThemedText>
            <RewardPop delay={200} style={{ marginTop: Spacing.three }}>
              <View style={[styles.xpChip, { backgroundColor: theme.primary + '1F', borderColor: theme.primary + '4D' }]}>
                <NumberRollup value={40} prefix="+" suffix=" XP" type="heading" style={{ color: theme.iconLilac, fontSize: FontSize.bodyLg }} />
              </View>
            </RewardPop>
            <SlabButton label="Done" full style={{ marginTop: Spacing.four }} onPress={() => router.back()} />
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
  intro: { flexGrow: 1, paddingHorizontal: Spacing.four, paddingVertical: Spacing.four },
  introInner: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
  introTitle: { fontSize: FontSize.titleSm, textAlign: 'center', marginTop: Spacing.three },
  introCopy: { textAlign: 'center', marginTop: Spacing.two },
  introButton: { alignSelf: 'stretch', marginTop: Spacing.five },
  board: { flexDirection: 'row', gap: Spacing.three, padding: Spacing.three, flex: 1, marginTop: Spacing.three },
  col: { flex: 1, gap: Spacing.two + 4 },
  cell: { minHeight: 68, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', padding: Spacing.two + 4 },
  resultsWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', padding: Spacing.four, backgroundColor: '#09090DDD' },
  results: { alignItems: 'center', alignSelf: 'stretch', paddingVertical: Spacing.five },
  xpChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 9, borderRadius: Radius.pill, borderWidth: 1 },
});
