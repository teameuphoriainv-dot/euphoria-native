/**
 * MONEY 2048 — the arcade game, not another quiz.
 *
 * The owner rejected three sorting/swiping proposals in one word, and they were right to: a
 * "swipe left if it is a scam" card is a multiple-choice question wearing a game costume. Term
 * Match is already the quiz. This is the arcade slot, and it earns it by being a mechanic teens
 * already play, with finance as the ART rather than as the questions.
 *
 * 2048 on the real US denomination ladder: $1 $2 $5 $10 $20 $50 $100. All the merge rules live in
 * money-2048.ts and are proven by assertions there — including the one that steals runs, that a
 * FULL board with an adjacent pair is still playable.
 *
 * ADAPTIVE, like the other two. `phaseOf` sets the starting board: a new learner opens with two
 * bills and all the room in the world, a fluent one opens with four and has to be tidy from the
 * first swipe. It changes the pressure, never the rules — a harder start must not be a different
 * game.
 */
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut, runOnJS } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { SlabButton } from '@/components/ui/button';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { phaseIndex, phaseOf } from '@/lib/learner-phase';
import { PixelSpriteView, stackCash } from '@/lib/pixel';
import { useApp } from '@/lib/store';
import {
  GOAL, LADDER, SIZE, canMove, emptyGrid, move, rng, spawn, type Dir, type Grid,
} from '@/lib/money-2048';
import { NumberRollup } from '@/shared/motion/number-rollup';
import { SpringPressable } from '@/shared/motion/spring-pressable';

const GAME_ID = 'money-2048';

/**
 * Tile colour by ladder index, a deliberate progression rather than seven arbitrary swatches:
 * cool and quiet at the bottom, warm and loud at the top, so the board's temperature tells you how
 * well the run is going before you have read a single number. $100 is the only pure hot colour on
 * the screen and it is the prize.
 */
const TILE = ['#1A1822', '#2E3140', '#2F4A46', '#2C4E63', '#33407F', '#5B3D9E', '#8A6A1E', '#A32F5B'];
const INK = ['#1A1822', '#9AA0B5', '#8FD8CB', '#87C6EA', '#AEB8FF', '#D7B9FF', '#FFD97A', '#FFC2D6'];

/** How full the board starts. Pressure, not different rules — see the header. */
const START_TILES = [2, 2, 3, 4];

/** Below this a swipe is a tap that wandered, not a direction. */
const SWIPE_MIN = 24;

export default function Money2048() {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const best = useApp((s) => s.gameBest[GAME_ID] ?? 0);
  const recordGameScore = useApp((s) => s.recordGameScore);
  const completedLessons = useApp((s) => s.completedLessons);
  const startTiles = START_TILES[phaseIndex(phaseOf({ completedLessons }))];

  const [seed] = useState(() => Date.now() >>> 0);
  const rand = useMemo(() => rng(seed), [seed]);

  const build = useCallback(() => {
    let g = emptyGrid();
    for (let i = 0; i < startTiles; i++) g = spawn(g, rand);
    return g;
  }, [rand, startTiles]);

  const [grid, setGrid] = useState<Grid>(build);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);
  const [pop, setPop] = useState<{ id: number; text: string } | null>(null);
  const popTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (popTimer.current) clearTimeout(popTimer.current); }, []);

  const board = Math.min(width - Spacing.four * 2, 360);
  const gap = Spacing.two;
  const cell = (board - gap * (SIZE + 1)) / SIZE;

  const swipe = useCallback((dir: Dir) => {
    if (over) return;
    setGrid((g) => {
      const res = move(g, dir);
      // Rule 3: a move that changes nothing must not spawn. Swiping into a wall is free.
      if (!res.moved) return g;

      const next = spawn(res.grid, rand);
      if (res.gained > 0) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setScore((s) => {
          const total = s + res.gained;
          recordGameScore(GAME_ID, total);
          return total;
        });
        // CLEARED ON A TIMER. The first version only ever REPLACED the pop on the next merge, so
        // a "+2" sat beside the score indefinitely — through every non-scoring swipe after it —
        // and read as a stuck label rather than a reward. Caught on device: 24 swipes later it was
        // still there. The ref lets a later merge cancel an earlier fade instead of racing it.
        const id = Date.now();
        setPop({ id, text: `+${String(res.gained)}` });
        if (popTimer.current) clearTimeout(popTimer.current);
        popTimer.current = setTimeout(() => { setPop((p) => (p?.id === id ? null : p)); }, 900);
      }
      if (next.flat().includes(GOAL) && !won) {
        setWon(true);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        useApp.getState().awardGameXp();
      }
      // Checked on the board AFTER the spawn, which is the board the player will actually face.
      if (!canMove(next)) {
        setOver(true);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      return next;
    });
  }, [over, rand, recordGameScore, won]);

  /*
   * ONE pan gesture, resolved on END, rather than four fling gestures.
   *
   * A Fling per direction is four recognisers competing for the same finger, and diagonal-ish
   * swipes then land on whichever wins the race. Reading the total translation once, at the end,
   * makes the dominant axis the answer — which is what the player meant.
   *
   * runOnJS because the gesture callback runs on the UI thread and `swipe` sets React state.
   */
  const pan = useMemo(
    () =>
      Gesture.Pan().onEnd((e) => {
        'worklet';
        const { translationX: x, translationY: y } = e;
        if (Math.max(Math.abs(x), Math.abs(y)) < SWIPE_MIN) return;
        const dir: Dir = Math.abs(x) > Math.abs(y) ? (x > 0 ? 'right' : 'left') : y > 0 ? 'down' : 'up';
        runOnJS(swipe)(dir);
      }),
    [swipe],
  );

  const restart = () => {
    setGrid(build());
    setScore(0); setOver(false); setWon(false); setPop(null);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientBackground starCount={30} />

      <View style={styles.header}>
        <SpringPressable haptic={false} scaleTo={0.85} onPress={() => { router.back(); }} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back">
          <UIcon name="close" size={22} color={theme.mutedForeground} />
        </SpringPressable>
        <PixelSpriteView sprite={stackCash} size={26} />
        <ThemedText type="title" style={{ flex: 1, fontSize: FontSize.headingLg }}>Money 2048</ThemedText>
      </View>

      <View style={[styles.scoreRow, { width: board }]}>
        <View>
          <ThemedText type="label" themeColor="mutedForeground">SCORE</ThemedText>
          <View style={styles.scoreLine}>
            <NumberRollup value={score} type="display" style={{ fontSize: FontSize.titleSm }} />
            {pop && (
              <Animated.View key={pop.id} entering={FadeIn.duration(90)} exiting={FadeOut.duration(260)} pointerEvents="none">
                <ThemedText type="display" style={{ fontSize: FontSize.bodyLg, color: theme.success }}>{pop.text}</ThemedText>
              </Animated.View>
            )}
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <ThemedText type="label" themeColor="mutedForeground">BEST</ThemedText>
          <ThemedText type="display" style={{ fontSize: FontSize.titleSm }}>{String(Math.max(best, score))}</ThemedText>
        </View>
      </View>

      <GestureDetector gesture={pan}>
        <View style={[styles.board, { width: board, height: board, padding: gap, backgroundColor: theme.card }]}>
          {grid.map((row, r) =>
            row.map((v, c) => (
              <View
                key={`${String(r)}-${String(c)}`}
                style={[
                  styles.cell,
                  {
                    width: cell, height: cell,
                    left: gap + c * (cell + gap), top: gap + r * (cell + gap),
                    backgroundColor: TILE[v],
                  },
                ]}>
                {v > 0 && (
                  /*
                   * Keyed on the VALUE so a merged tile re-mounts and replays its entrance. Keyed
                   * on position alone it would update in place and the merge — the whole reward of
                   * the game — would have no moment at all.
                   *
                   * FADE, NOT ZOOM. This was ZoomIn and BOTH gates caught it: the reduced-motion
                   * audit flagged an unguarded layout preset, and motion-invariants R4 flagged that
                   * ZoomIn starts at scale 0, which rasterises the text near-zero and resamples it
                   * up — the "messes up the pixels" defect that rubric exists for, on a screen made
                   * of numbers. A fade is also what Reduced Motion substitutes FOR motion, so one
                   * change satisfies both. The merge still lands hard: the tile changes COLOUR up a
                   * deliberate temperature ramp, fires a haptic, and pops a green +N by the score.
                   */
                  <Animated.View key={v} entering={FadeIn.duration(160)}>
                    <ThemedText
                      type="display"
                      style={{ fontSize: v >= 7 ? FontSize.body : FontSize.titleSm, color: INK[v] }}>
                      {`$${String(LADDER[v])}`}
                    </ThemedText>
                  </Animated.View>
                )}
              </View>
            )),
          )}
        </View>
      </GestureDetector>

      <ThemedText type="small" themeColor="mutedForeground" style={styles.hint}>
        {over ? 'No moves left' : won ? 'You made a $100. Keep going.' : 'Swipe to merge bills'}
      </ThemedText>

      {over && (
        <Animated.View entering={FadeIn} style={[styles.end, { width: board }]}>
          <SlabButton label="Play again" full onPress={restart} />
          <SlabButton label="Back to games" tone="neutral" full onPress={() => { router.back(); }} />
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, alignSelf: 'stretch', paddingHorizontal: Spacing.four, paddingVertical: Spacing.three },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: Spacing.three },
  scoreLine: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two },
  board: { borderRadius: Radius.lg, position: 'relative' },
  cell: { position: 'absolute', borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  hint: { marginTop: Spacing.three },
  end: { marginTop: Spacing.four, gap: Spacing.three },
});
