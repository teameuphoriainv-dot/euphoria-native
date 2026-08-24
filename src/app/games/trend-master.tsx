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
 * The chart is drawn as solid rectangles rather than a smoothed line, which is both the app's
 * visual language and honest about what it is: a game about a shape.
 */
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';

import { AmbientBackground } from '@/components/ambient-background';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { SlabButton } from '@/components/ui/button';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { PixelSpriteView, heart } from '@/lib/pixel';
import { useApp } from '@/lib/store';
import {
  LIVES, REVEAL_MS, ROUND_SECONDS, TIME_BONUS, WINDOW, isCorrect, makeSeries, multiplierFor,
  nextValue, scoreFor, windowOf, type Round,
} from '@/lib/trend-game';
import { NumberRollup } from '@/shared/motion/number-rollup';
import { SpringPressable } from '@/shared/motion/spring-pressable';

const GAME_ID = 'trend-master';
const CHART_H = 190;

type Phase = 'intro' | 'play' | 'over';

export default function TrendMaster() {
  const theme = useTheme();
  const best = useApp((s) => s.gameBest[GAME_ID] ?? 0);
  const recordGameScore = useApp((s) => s.recordGameScore);

  const [phase, setPhase] = useState<Phase>('intro');
  const [round, setRound] = useState<Round>({ series: [], cursor: 0 });
  const [score, setScore] = useState(0);
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
    setRound({ series: makeSeries(seed.current, 0), cursor: 0 });
    setScore(0); setStreak(0); setLives(LIVES); setLeft(ROUND_SECONDS);
    leftRef.current = ROUND_SECONDS; scoreRef.current = 0;
    setReveal(null); setPop(null); setPhase('play');
  }, []);

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

    // The pause IS the game. Resolving instantly removes the only moment of tension it has.
    setTimeout(() => {
      setReveal(null);
      setPop(null);
      if (ok) {
        const gained = scoreFor(streak);
        scoreRef.current += gained;
        setScore((v) => v + gained);
        setStreak((v) => v + 1);
        // Buying time is the reward. Capped at the starting length so a long streak cannot make a
        // run effectively endless, which would flatten the score curve for everyone else.
        leftRef.current = Math.min(ROUND_SECONDS, leftRef.current + TIME_BONUS);
        setLeft(leftRef.current);
        setRound((r) => {
          const nextCursor = r.cursor + 1;
          // Re-seed with rising difficulty as the streak grows, rather than shortening the clock.
          if (nextCursor + WINDOW >= r.series.length) {
            seed.current = (seed.current * 1103515245 + 12345) >>> 0;
            return { series: makeSeries(seed.current, Math.floor((streak + 1) / 3)), cursor: 0 };
          }
          return { ...r, cursor: nextCursor };
        });
      } else {
        setStreak(0);
        setLives((l) => {
          const rest = l - 1;
          if (rest <= 0) finish(score);
          return rest;
        });
        setRound((r) => ({ ...r, cursor: r.cursor + 1 }));
      }
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
  const bars = useMemo(() => {
    if (!round.series.length) return [];
    const w = windowOf(round);
    const all = reveal ? [...w, reveal.value] : w;
    const lo = Math.min(...all);
    const hi = Math.max(...all);
    const span = hi - lo || 1;
    // 12..96 rather than 0..100, so the lowest bar is still a visible bar and not a sliver.
    return all.map((v) => 12 + ((v - lo) / span) * 84);
  }, [round, reveal]);

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
        <Animated.View entering={FadeIn} style={styles.centre}>
          <ThemedText type="display" style={{ fontSize: FontSize.titleSm, textAlign: 'center' }}>
            Trend Master
          </ThemedText>
          <ThemedText type="body" themeColor="mutedForeground" style={styles.blurb}>
            Read the chart. Call the next move. Three lives, sixty seconds, and every third correct
            call raises your multiplier.
          </ThemedText>
          {best > 0 && (
            <ThemedText type="bodyMedium" style={{ color: theme.iconGold, marginTop: Spacing.two }}>
              {`Best: ${String(best)}`}
            </ThemedText>
          )}
          <SlabButton label="Start" full onPress={start} style={{ marginTop: Spacing.five }} />
        </Animated.View>
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

          <View style={[styles.chart, { borderColor: theme.border, backgroundColor: theme.card }]}>
            <Svg width="100%" height={CHART_H} viewBox={`0 0 ${String(WINDOW + 1)} 100`} preserveAspectRatio="none">
              {bars.map((v, i) => {
                const isNew = reveal !== null && i === bars.length - 1;
                const fill = isNew
                  ? (reveal.ok ? theme.success : theme.destructive)
                  : i === bars.length - 1 ? theme.primary : theme.primary + '77';
                return <Rect key={i} x={i + 0.12} y={100 - v} width={0.76} height={v} fill={fill} />;
              })}
            </Svg>

          </View>

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
  blurb: { textAlign: 'center', marginTop: Spacing.two },
  play: { flex: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.two },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  track: { height: 6, borderRadius: 3, marginTop: Spacing.three, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  chart: {
    marginTop: Spacing.three, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden', height: CHART_H,
  },
  scoreLine: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two },
  prompt: { textAlign: 'center', marginTop: Spacing.three, marginBottom: Spacing.four },
  /* Not `marginTop: 'auto'`. That shoved the controls to the very bottom of a tall screen and
   * left a dead void under the chart; the buttons belong just under the question they answer. */
  calls: { flexDirection: 'row', gap: Spacing.two, marginBottom: Spacing.five },
});
