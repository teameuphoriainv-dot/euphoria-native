/**
 * Trend Master. Call the next move, up or down, before the clock runs out.
 *
 * The rules and the reasoning live in lib/trend-game.ts, which is pure and tested. This file is
 * the screen: the chart, the clock, and the feedback that makes a correct call feel like something.
 *
 * WHAT MAKES IT FUN, deliberately and in order:
 *   - ONE VERB, pressed over and over. Two buttons, no menus, no reading between rounds.
 *   - A MULTIPLIER that compounds, shown large. It is the reason to press again after a run ends.
 *   - LIVES, so a run can be LOST. A game you cannot lose is a slideshow.
 *   - A REVEAL, not a verdict: the next bar animates in and you watch it land before the score
 *     moves. The half second between call and result is where the tension actually lives.
 *   - A BEST SCORE, so the run has an opponent.
 *
 * The chart uses real candle anatomy plus a moving-average line and a momentum readout. The first
 * version drew scalar bars with no indicator, which hid the useful signal and made the call feel
 * like guesswork even though the underlying series was deliberately trend-readable.
 */
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Svg, { Line, Polyline, Rect } from 'react-native-svg';

import { AmbientBackground } from '@/components/ambient-background';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { SlabButton } from '@/components/ui/button';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { PixelSpriteView, chartUp, heart } from '@/lib/pixel';
import { phaseIndex, phaseOf } from '@/lib/learner-phase';
import { useApp } from '@/lib/store';
import {
  LIVES, REVEAL_MS, ROUND_SECONDS, TIME_BONUS, WINDOW, candlesOf, isCorrect, makeSeries,
  multiplierFor, nextValue, scoreFor, trendIndicator, windowOf, type Round,
} from '@/lib/trend-game';
import { NumberRollup } from '@/shared/motion/number-rollup';
import { SpringPressable } from '@/shared/motion/spring-pressable';

const GAME_ID = 'trend-master';
const CHART_H = 190;

type Phase = 'intro' | 'play' | 'over';

export default function TrendMaster() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ qa?: string }>();
  const qa = __DEV__ ? params.qa : undefined;
  const best = useApp((s) => s.gameBest[GAME_ID] ?? 0);
  const recordGameScore = useApp((s) => s.recordGameScore);

  const [phase, setPhase] = useState<Phase>(qa === 'over' ? 'over' : 'intro');
  const [round, setRound] = useState<Round>({ series: [], cursor: 0 });

  /*
   * THE DIFFICULTY THIS PLAYER STARTS AT, from their learning phase.
   *
   * Every run used to open at difficulty 0 regardless of who was holding the phone. The streak
   * still raises it within a run — this only moves the FLOOR, so a new learner keeps the gentle
   * opening and a fluent one is not made to sit through it. Capped by phaseIndex's own 0..3 range,
   * which lands inside makeSeries's `min(difficulty, 6)` noise clamp with room to spare.
   */
  const completedLessons = useApp((st) => st.completedLessons);
  const floor = phaseIndex(phaseOf({ completedLessons }));
  const [score, setScore] = useState(qa === 'over' ? 120 : 0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [left, setLeft] = useState(ROUND_SECONDS);
  /** null while waiting for a call; then the outcome, while the next bar is revealed. */
  const [reveal, setReveal] = useState<null | { ok: boolean; value: number }>(null);
  /** The floating "+20". Keyed by timestamp so an identical score twice in a row still replays. */
  const [pop, setPop] = useState<{ id: number; text: string; combo: boolean } | null>(null);
  const seed = useRef(1);

  const start = useCallback(() => {
    seed.current = (seed.current * 1103515245 + 12345) >>> 0;
    // Starts where this learner IS, not at zero for everybody. A fluent player spending the first
    // fifteen seconds on charts that only slope one way is not being eased in, they are being made
    // to wait for the game to start.
    setRound({ series: makeSeries(seed.current, floor), cursor: 0 });
    setScore(0); setStreak(0); setLives(LIVES); setLeft(ROUND_SECONDS);
    leftRef.current = ROUND_SECONDS; scoreRef.current = 0;
    runId.current += 1;
    setReveal(null); setPop(null); setPhase('play');
    // `floor` is a real dependency: finishing a lesson elsewhere and coming back must start the
    // next run at the new difficulty, not the one captured when this screen first mounted.
  }, [floor]);

  const finish = useCallback((final: number) => {
    setPhase('over');
    recordGameScore(GAME_ID, final);
    // The daily game bonus is day-scoped in the store, so replaying cannot farm it.
    useApp.getState().awardGameXp();
  }, [recordGameScore]);

  /*
   * THE RUN ENDS INSIDE THE CLOCK, not in an effect watching the clock.
   *
   * The obvious shape is `useEffect(() => { if (left <= 0) finish(score) }, [left])`, and it is a
   * synchronous setState inside an effect: an extra render pass on the frame the game ends, and
   * exactly the pattern already removed from PixelSprite for the same reason. Ending it where the
   * timer actually stops needs no reactive round trip at all.
   *
   * `scoreRef` exists only because the interval closes over the score from the render that created
   * it. A dependency on `score` would tear down and rebuild the interval on every correct call,
   * which would quietly reset the clock every time you scored.
   */
  /*
   * THE REFS ARE THE SOURCE OF TRUTH FOR THE RUN; the state beside them exists to render.
   *
   * An earlier version mirrored state INTO these from an effect, which fought the interval's own
   * writes and tripped react-hooks/immutability. Writing them only where the value actually
   * changes — in start() and in the handlers — removes the second writer entirely, and each of
   * those is an event context where a ref write is exactly what a ref is for.
   */
  const scoreRef = useRef(0);
  const leftRef = useRef(ROUND_SECONDS);
  /** The pending reveal. Cleared on unmount; `call` is its only writer. */
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (revealTimer.current) clearTimeout(revealTimer.current); }, []);

  /*
   * WHICH RUN A PENDING REVEAL BELONGS TO.
   *
   * Clearing the timer in start() would have been the obvious fix and the compiler refuses it: a
   * ref written from two different functions is the same react-hooks/immutability error that bit
   * scoreRef in this file. So the timeout carries its run's number instead and retires itself if
   * the number has moved on — which is strictly more robust anyway, because it also covers a
   * timeout that fires between the clear and the reset rather than only before it.
   *
   * Without this: lose on the clock with 0.25s left, tap "Play again" inside 340ms, and the old
   * reveal banks its points into the fresh run — pre-scored, pre-streaked, one bar in.
   *
   * `start` is its only writer, so it stays within the one-writer rule too.
   */
  const runId = useRef(0);

  useEffect(() => {
    if (phase !== 'play') return;
    // 250ms, not 1000, so the bar drains visibly rather than stepping; not 16ms, because nothing
    // here is worth sixty re-renders a second.
    const id = setInterval(() => {
      /*
       * The tick is computed from a REF and the updater is left pure.
       *
       * The first version called finish() from inside the setLeft updater, and React said so out
       * loud: "Cannot update a component while rendering a different component". An updater runs
       * during React's render phase and must not set state — finish() sets three pieces of it.
       * Caught on device, from the console, on the very first played round.
       */
      const next = Math.max(0, leftRef.current - 0.25);
      leftRef.current = next;
      setLeft(next);
      if (next <= 0) {
        clearInterval(id);
        finish(scoreRef.current);
      }
    }, 250);
    return () => { clearInterval(id); };
  }, [phase, finish]);

  const call = (dir: 'up' | 'down') => {
    /*
     * `reveal` being set already blocks a second call mid-reveal, so this is belt-and-braces for
     * the one case it does not cover: a timeout left pending by a run that has already ended. It
     * also keeps `call` the SINGLE writer of revealTimer — the compiler rejects a ref written from
     * two different functions, which is the same rule that bit scoreRef earlier in this file.
     */
    if (revealTimer.current) { clearTimeout(revealTimer.current); revealTimer.current = null; }
    if (phase !== 'play' || reveal) return;
    const ok = isCorrect(round, dir);
    setReveal({ ok, value: nextValue(round) });
    if (ok) {
      /*
       * The pop is raised HERE, beside the reveal, and torn down with it — not in the timeout
       * that banks the score. Raised in the timeout it outlived its own reveal and sat over the
       * next question as a stale "+10", which reads as a bug rather than a reward.
       *
       * A crossed multiplier is the one moment worth shouting about: the run just got worth more
       * per call, and nothing else on screen says so.
       */
      const crossed = multiplierFor(streak + 1) > multiplierFor(streak);
      setPop({
        id: Date.now(),
        text: crossed ? `+${String(scoreFor(streak))}  ${String(multiplierFor(streak + 1))}x` : `+${String(scoreFor(streak))}`,
        combo: crossed,
      });
    }
    void Haptics.notificationAsync(
      ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
    );

    /*
     * The pause IS the game. Resolving instantly removes the only moment of tension it has.
     *
     * TRACKED IN A REF AND CLEARED, which it was not. Nothing cancelled this timeout — not the
     * phase change, not unmount — and every one of the three consequences is real:
     *
     *   - Lose on the clock with 0.25s left, tap "Play again" instantly, and the orphan fires into
     *     the NEW run: it banks the old call's points, bumps the streak, extends the clock and
     *     advances the cursor. The fresh run starts pre-scored and one bar in.
     *   - Leave the screen mid-reveal and it sets state on a dead tree, and on a third-life loss
     *     writes recordGameScore and awardGameXp from a screen that no longer exists.
     *   - Even without a replay, finish() banks scoreRef.current BEFORE this adds the last call's
     *     points, so the RUN OVER card can show a score higher than the one actually stored.
     *
     * term-match.tsx documents fixing exactly this and uses exactly this ref; this file never got
     * it. start() clears it too, so a replay cannot inherit a pending reveal.
     */
    const forRun = runId.current;
    revealTimer.current = setTimeout(() => {
      revealTimer.current = null;
      // The run this reveal belonged to is over. Resolving it now would score a different game.
      if (forRun !== runId.current) return;
      setReveal(null);
      setPop(null);

      /*
       * THE BOUNDS CHECK IS SHARED BY BOTH BRANCHES NOW.
       *
       * Only the correct branch re-seeded near the end of the series. A WRONG call at cursor 65 of
       * an 80-long series set the cursor to 66, so nextValue read series[80] — undefined. The chart
       * then did Math.min(...[...w, undefined]) = NaN, every bar height became NaN and the whole
       * chart rendered blank; worse, isCorrect compares `undefined >= last`, which is always false,
       * so "down" scored correct and "up" scored wrong until the run ended. The next call was
       * rigged. Hoisting the check makes the two paths structurally unable to disagree.
       *
       * The re-seed also mutated seed.current from INSIDE a setRound updater. Updaters must be
       * pure — they can run twice under the React Compiler — so the advance happens out here.
       */
      const nextStreak = ok ? streak + 1 : 0;
      const r = round;
      const nextCursor = r.cursor + 1;
      if (nextCursor + WINDOW >= r.series.length) {
        seed.current = (seed.current * 1103515245 + 12345) >>> 0;
        setRound({ series: makeSeries(seed.current, floor + Math.floor(nextStreak / 3)), cursor: 0 });
      } else {
        setRound({ ...r, cursor: nextCursor });
      }

      if (ok) {
        const gained = scoreFor(streak);
        scoreRef.current += gained;
        setScore((v) => v + gained);
        setStreak(nextStreak);
        // Buying time is the reward. Capped at the starting length so a long streak cannot make a
        // run effectively endless, which would flatten the score curve for everyone else.
        leftRef.current = Math.min(ROUND_SECONDS, leftRef.current + TIME_BONUS);
        setLeft(leftRef.current);
        return;
      }

      /*
       * finish() OUT OF THE UPDATER. This was `setLives((l) => { ... finish(score) ... })`, which
       * is the same defect this file documents fixing on the CLOCK path sixty lines up — an updater
       * runs during React's render phase and finish() sets state and writes to the store, notifying
       * every other subscriber mid-render. The fix landed on one path and not the other.
       *
       * `lives` is safe to read directly because this timeout is the only writer, and it banks
       * scoreRef.current rather than `score` so both loss paths agree on what the run was worth.
       */
      const rest = lives - 1;
      setStreak(0);
      setLives(rest);
      if (rest <= 0) finish(scoreRef.current);
    }, REVEAL_MS);
  };

  /*
   * AUTOSCALED TO THE WINDOW, which is the difference between a game and a wall.
   *
   * The series is clamped 6..94 and mostly wanders around the middle, so drawn against a fixed
   * 0..100 axis every bar is roughly the same height and the chart reads as a flat slab — verified
   * on device before this was added. Real charts autoscale for exactly this reason: the shape you
   * are being asked to read is the RELATIVE movement, and a fixed axis hides it.
   *
   * The reveal bar is included in the range, so the axis does not jump when it lands and make a
   * small move look enormous.
   *
   * The `|| 1` guards a dead-flat window, which would otherwise divide by zero and render nothing.
   */
  const chart = useMemo(() => {
    if (!round.series.length) return { candles: [], averagePoints: '' };
    const w = windowOf(round);
    const closes = reveal ? [...w, reveal.value] : w;
    const candles = candlesOf(closes);
    const lo = Math.min(...candles.map((c) => c.low));
    const hi = Math.max(...candles.map((c) => c.high));
    const span = hi - lo || 1;
    const y = (value: number) => 94 - ((value - lo) / span) * 88;
    const movingAverages = closes.map((_, i) => {
      const recent = closes.slice(Math.max(0, i - 4), i + 1);
      return recent.reduce((sum, value) => sum + value, 0) / recent.length;
    });
    return {
      candles: candles.map((c) => ({ ...c, openY: y(c.open), highY: y(c.high), lowY: y(c.low), closeY: y(c.close) })),
      averagePoints: movingAverages.map((value, i) => `${String(i + 0.5)},${String(y(value))}`).join(' '),
    };
  }, [round, reveal]);
  const indicator = round.series.length ? trendIndicator(windowOf(round)) : null;

  const mult = multiplierFor(streak);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={22} glow={false} />

      <View style={styles.header}>
        <SpringPressable
          haptic={false}
          scaleTo={0.85}
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Close">
          <UIcon name="close" size={22} color={theme.mutedForeground} />
        </SpringPressable>
        {phase === 'play' && (
          <View style={styles.lives}>
            {Array.from({ length: LIVES }).map((_, i) => (
              <View key={i} style={{ opacity: i < lives ? 1 : 0.22 }}>
                <PixelSpriteView sprite={heart} size={16} />
              </View>
            ))}
          </View>
        )}
      </View>

      {phase === 'intro' && (
        <ScrollView contentContainerStyle={styles.introScroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn} style={styles.introInner}>
            <PixelSpriteView sprite={chartUp} size={68} />
            <ThemedText type="display" maxFontSizeMultiplier={1.6} style={{ fontSize: FontSize.titleSm, textAlign: 'center', marginTop: Spacing.three }}>
              Trend Master
            </ThemedText>
            <ThemedText type="body" maxFontSizeMultiplier={1.6} themeColor="mutedForeground" style={styles.blurb}>
              Read the candlesticks and momentum indicator, then call the next move before time runs out.
            </ThemedText>
            {best > 0 && (
              <ThemedText type="bodyMedium" maxFontSizeMultiplier={1.6} style={{ color: theme.iconGold, marginTop: Spacing.two }}>
                {`Best: ${String(best)}`}
              </ThemedText>
            )}
            <SlabButton label="Start" accessibilityLabel="Start Trend Master" full onPress={start} style={{ marginTop: Spacing.five }} />
          </Animated.View>
        </ScrollView>
      )}

      {phase === 'play' && (
        <View style={styles.play}>
          <View style={styles.scoreRow}>
            <View>
              <ThemedText type="label" themeColor="mutedForeground">SCORE</ThemedText>
              {/*
                * The "+10" rises BESIDE the score, not over the chart.
                *
                * It lived in the chart first and the chart clipped it — the device showed "+1C"
                * with the tail cut off at the container edge — and it sat on top of the green
                * reveal bar, so the two rewards fought for the same pixels. Here it is adjacent
                * to the number it is adding to, which is also what it means.
                */}
              <View style={styles.scoreLine}>
                <NumberRollup value={score} type="display" style={{ fontSize: FontSize.titleSm }} />
                {pop && (
                  <Animated.View key={pop.id} entering={FadeIn.duration(90)} exiting={FadeOut.duration(200)} pointerEvents="none">
                    <ThemedText
                      type="display"
                      style={{
                        fontSize: pop.combo ? FontSize.title : FontSize.bodyLg,
                        color: pop.combo ? theme.primary : theme.success,
                      }}>
                      {pop.text}
                    </ThemedText>
                  </Animated.View>
                )}
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <ThemedText type="label" themeColor="mutedForeground">MULTIPLIER</ThemedText>
              <ThemedText
                type="display"
                style={{ fontSize: FontSize.titleSm, color: mult > 1 ? theme.iconGold : theme.text }}>
                {`${String(mult)}x`}
              </ThemedText>
            </View>
          </View>

          {/* The clock, as a bar. A number counting down is information; a bar draining is pressure. */}
          <View style={[styles.track, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.fill,
                {
                  width: (`${String(Math.max(0, (left / ROUND_SECONDS) * 100))}%`) as `${number}%`,
                  backgroundColor: left < 10 ? theme.destructive : theme.primary,
                },
              ]}
            />
          </View>

          <View
            accessible
            accessibilityRole="image"
            accessibilityLabel={indicator ? `Candlestick chart. Three bar momentum ${indicator.direction}, ${Math.abs(indicator.momentum).toFixed(1)} points. Five close average ${indicator.average.toFixed(1)}.` : 'Candlestick chart'}
            style={[styles.chart, { borderColor: theme.border, backgroundColor: theme.card }]}>
            <Svg width="100%" height={CHART_H} viewBox={`0 0 ${String(WINDOW + 1)} 100`} preserveAspectRatio="none">
              <Polyline points={chart.averagePoints} fill="none" stroke={theme.iconGold} strokeWidth={0.18} />
              {chart.candles.map((c, i) => {
                const isNew = reveal !== null && i === chart.candles.length - 1;
                const rising = c.close >= c.open;
                const fill = isNew ? (reveal.ok ? theme.success : theme.destructive) : rising ? theme.success : theme.destructive;
                const bodyY = Math.min(c.openY, c.closeY);
                const bodyH = Math.max(1.2, Math.abs(c.closeY - c.openY));
                return (
                  <Fragment key={i}>
                    <Line x1={i + 0.5} x2={i + 0.5} y1={c.highY} y2={c.lowY} stroke={fill} strokeWidth={0.16} />
                    <Rect x={i + 0.2} y={bodyY} width={0.6} height={bodyH} fill={fill} />
                  </Fragment>
                );
              })}
            </Svg>
          </View>

          {indicator ? (
            <View style={styles.indicatorRow}>
              <View>
                <ThemedText type="label" themeColor="mutedForeground">3-BAR MOMENTUM</ThemedText>
                <ThemedText type="bodyMedium" style={{ color: indicator.direction === 'up' ? theme.success : theme.destructive }}>
                  {`${indicator.direction === 'up' ? 'Rising' : 'Falling'} ${indicator.momentum >= 0 ? '+' : ''}${indicator.momentum.toFixed(1)}`}
                </ThemedText>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <ThemedText type="label" themeColor="mutedForeground">5-CLOSE AVG</ThemedText>
                <ThemedText type="bodyMedium" style={{ color: theme.iconGold }}>{indicator.average.toFixed(1)}</ThemedText>
              </View>
            </View>
          ) : null}

          <ThemedText type="small" themeColor="mutedForeground" style={styles.prompt}>
            {reveal ? (reveal.ok ? 'Correct' : 'Wrong') : 'Where does the next bar go?'}
          </ThemedText>

          <View style={styles.calls}>
            <View style={{ flex: 1 }}>
              <SlabButton label="Down" full icon="chevronLeft" onPress={() => { call('down'); }} />
            </View>
            <View style={{ flex: 1 }}>
              <SlabButton label="Up" full onPress={() => { call('up'); }} />
            </View>
          </View>
        </View>
      )}

      {phase === 'over' && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.centre}>
          <ThemedText type="label" themeColor="mutedForeground">RUN OVER</ThemedText>
          <NumberRollup value={score} type="display" style={{ fontSize: FontSize.hero }} />
          {score > 0 && score >= best ? (
            <ThemedText type="bodyMedium" style={{ color: theme.iconGold, marginTop: 4 }}>
              New best
            </ThemedText>
          ) : (
            <ThemedText type="body" themeColor="mutedForeground" style={{ marginTop: 4 }}>
              {`Best: ${String(best)}`}
            </ThemedText>
          )}
          <SlabButton label="Play again" full onPress={start} style={{ marginTop: Spacing.five }} />
          <SlabButton label="Back to games" full tone="neutral" onPress={() => router.back()} style={{ marginTop: Spacing.two }} />
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.three, paddingTop: Spacing.two, paddingBottom: Spacing.one,
  },
  lives: { flexDirection: 'row', gap: 6 },
  centre: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.four },
  introScroll: { flexGrow: 1, paddingHorizontal: Spacing.four, paddingVertical: Spacing.four },
  introInner: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
  blurb: { textAlign: 'center', marginTop: Spacing.two },
  play: { flex: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.two },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  track: { height: 6, borderRadius: 3, marginTop: Spacing.three, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  chart: {
    marginTop: Spacing.three, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden', height: CHART_H,
  },
  indicatorRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.two },
  scoreLine: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two },
  prompt: { textAlign: 'center', marginTop: Spacing.three, marginBottom: Spacing.four },
  /* Not `marginTop: 'auto'`. That shoved the controls to the very bottom of a tall screen and
   * left a dead void under the chart; the buttons belong just under the question they answer. */
  calls: { flexDirection: 'row', gap: Spacing.two, marginBottom: Spacing.five },
});
