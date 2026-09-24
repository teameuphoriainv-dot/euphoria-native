/**
 * BUDGET BALANCER — the screen. All rules live in src/lib/budget-balancer.ts.
 *
 * WHY THE BEAM IS DRIVEN BY SHARED VALUES AND NOT REACT STATE. The beam moves every frame. Putting
 * that angle in useState would be 60 React commits a second on a device where idle commits were
 * already the headline performance problem (refs/NEXT_SESSION.md §4.1). So the engine state lives
 * in a ref, the angle and the income marker are Reanimated shared values, and React re-renders only
 * on the DISCRETE events: a cost spawning, a cost clearing, and the run ending. That is a handful of
 * commits per run instead of thousands.
 *
 * REDUCED MOTION IS NOT AN AFTERTHOUGHT HERE, because the vestibular motion IS the game. A tilting
 * beam is exactly what the setting exists to suppress, and "turn the animation off" would leave the
 * player with no way to read balance at all. So under Reduced Motion the beam holds level and the
 * balance meter — which is on screen for everyone — becomes the whole readout. Same information,
 * same difficulty, no rotation.
 *
 * ACCESSIBILITY WAS DESIGNED IN, NOT RETROFITTED. Money 2048 shipped unplayable for VoiceOver
 * because a one-finger swipe IS VoiceOver's navigation gesture, and needed a D-pad added afterwards.
 * The mechanic here is a drag, which has the same problem, so the play area is an `adjustable`
 * control (VoiceOver swipes up/down to move income) AND there are two always-visible buttons.
 */
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { SlabButton } from '@/components/ui/button';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { phaseIndex, phaseOf } from '@/lib/learner-phase';
import { PixelSpriteView, scales } from '@/lib/pixel';
import { useApp } from '@/lib/store';
import {
  HOLD_MS, LEVEL_TOL, MAX_ANGLE, type Cost, type State,
  balancePoint, createGame, step,
} from '@/lib/budget-balancer';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { playSfx } from '@/lib/sfx';

const GAME_ID = 'budget-balancer';
/** One nudge from the accessible buttons and from VoiceOver's adjustable actions. */
const NUDGE = 0.12;

export default function BudgetBalancer() {
  const params = useLocalSearchParams<{ qa?: string }>();
  const qaOver = __DEV__ && params.qa === 'over';
  // RESTART IS A REMOUNT, not a reset written from an effect. Keying the run on `seed` lets the
  // whole thing initialise in a lazy useState instead of a setState inside useEffect, which is
  // what react-hooks/set-state-in-effect is actually asking for rather than a disable comment.
  const [seed, setSeed] = useState(1);
  const [started, setStarted] = useState(qaOver);
  const theme = useTheme();
  if (!started) {
    return (
      <SafeAreaView style={styles.safe}>
        <AmbientBackground />
        <View style={styles.header}>
          <SpringPressable haptic={false} scaleTo={0.85} onPress={() => { router.back(); }}
            accessibilityRole="button" accessibilityLabel="Back to games">
            <UIcon name="chevronLeft" size={26} color={theme.text} />
          </SpringPressable>
        </View>
        <ScrollView contentContainerStyle={styles.intro} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn} style={styles.introInner}>
            <PixelSpriteView sprite={scales} size={68} />
            <ThemedText type="display" maxFontSizeMultiplier={1.6} style={styles.introTitle}>Budget Balancer</ThemedText>
            <ThemedText type="body" maxFontSizeMultiplier={1.6} themeColor="mutedForeground" style={styles.introCopy}>
              Move income along the beam and hold it level long enough to clear variable costs.
            </ThemedText>
            <SlabButton
              label="Start"
              accessibilityLabel="Start Budget Balancer"
              full
              onPress={() => { setStarted(true); }}
              style={styles.introButton}
            />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  return <Run key={seed} qaOver={qaOver} onRestart={() => { setSeed((n) => n + 1); }} />;
}

function Run({ onRestart, qaOver }: { onRestart: () => void; qaOver: boolean }) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const reduced = useReducedMotion();
  const best = useApp((s) => s.gameBest[GAME_ID] ?? 0);
  const recordGameScore = useApp((s) => s.recordGameScore);
  const completedLessons = useApp((s) => s.completedLessons);

  const phase = phaseIndex(phaseOf({ completedLessons }));
  const armPx = Math.min(width - Spacing.four * 2, 340) / 2;

  // Created ONCE per mount, in a lazy initialiser rather than an effect. Every restart remounts.
  const [initial] = useState(() => {
    const game = createGame((Date.now() % 100000) + 1, phase);
    return qaOver ? { ...game, over: true, score: 120, cleared: 4 } : game;
  });
  const angleSV = useSharedValue(0);
  // Seeded from the engine, not from a hardcoded 0.5: createGame starts the beam level and the
  // marker has to agree with it or the first frame fights the player.
  const incomeSV = useSharedValue(initial.incomeDist);
  const holdSV = useSharedValue(0);
  /*
   * THE ENGINE READS A PLAIN REF, NOT THE SHARED VALUE. They hold the same number, and the
   * duplication is deliberate: React Compiler's react-hooks/immutability rule forbids mutating a
   * value the effect also touches, so a shared value that is both written by the controls and read
   * by the loop is an error by construction. Splitting them means the loop reads `inputRef` and the
   * shared value exists purely to drive the animated style, which is what it is actually for.
   */
  const inputRef = useRef(initial.incomeDist);
  // A shared value, not a ref: the Gesture builder chain runs during render, so a handler that
  // touches a ref is read as render-time ref access however it is wrapped.
  const dragStart = useSharedValue(initial.incomeDist);

  const gameRef = useRef<State>(initial);
  // Only the discrete facts live in React.
  const [view, setView] = useState<{ costs: Cost[]; score: number; over: boolean; cleared: number }>(
    () => ({ costs: initial.costs, score: initial.score, over: initial.over, cleared: initial.cleared }),
  );
  /*
   * THE REWARD NEEDS A VISIBLE MOMENT. Trend Master's third rule: a score ticking silently in a
   * corner is information, a +30 that flies off is a reward. The engine already sets `justCleared`
   * for exactly one frame; this holds it long enough to be read. A fade is non-vestibular, so it
   * survives Reduced Motion rather than being suppressed by it.
   */
  const [reward, setReward] = useState<{ label: string; points: number; n: number } | null>(null);

  useEffect(() => {
    const g = gameRef.current;

    let raf = 0;
    let last = 0;
    let lastCount = g.costs.length;
    const tick = (t: number) => {
      const cur = gameRef.current;
      if (!cur || cur.over) return;
      const dt = last ? t - last : 16;
      last = t;
      const next = step(cur, dt, inputRef.current);
      gameRef.current = next;
      angleSV.value = next.angle;
      holdSV.value = next.holdMs / HOLD_MS;
      // React only hears about spawns, clears and the end.
      if (next.over || next.costs.length !== lastCount) {
        lastCount = next.costs.length;
        setView({ costs: next.costs, score: next.score, over: next.over, cleared: next.cleared });
        if (next.justCleared) {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          const jc = next.justCleared;
          setReward((r) => ({ label: jc.label, points: jc.points, n: (r?.n ?? 0) + 1 }));
        }
        if (next.over) {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          playSfx('gameOver');
          recordGameScore(GAME_ID, next.score);
          useApp.getState().awardGameXp();
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); };
    /*
     * angleSV and holdSV are only WRITTEN here, never from a handler, so listing them is safe --
     * unlike incomeSV, which is written by the controls and would make every `sv` write read as
     * mutating a dependency (react-hooks/immutability). The run is keyed on `seed` by the parent,
     * so a restart remounts rather than re-running this effect.
     */
  }, [angleSV, holdSV, recordGameScore]);

  const setInput = useCallback((v: number) => {
    const c = Math.max(0, Math.min(1, v));
    inputRef.current = c;
    incomeSV.set(c);
  }, [incomeSV]);
  /*
   * The announced position is STATE, because accessibilityValue is read during render and a ref
   * cannot be. It is updated only by `nudge` — the button and VoiceOver path — and deliberately not
   * by the drag, which would cost a React render per frame for a label that a dragging sighted user
   * is not listening to.
   */
  const [announcedPct, setAnnouncedPct] = useState(50);
  const nudge = useCallback((d: number) => {
    const v = Math.max(0, Math.min(1, inputRef.current + d));
    setInput(v);
    setAnnouncedPct(Math.round(v * 100));
  }, [setInput]);

  /*
   * runOnJS so the handlers are ordinary code rather than worklets: they write `inputRef`, which a
   * worklet cannot touch. A pan update is a ref write and a shared-value write, never a React
   * render. The handlers are useCallback and the gesture is useMemo because the Gesture builder
   * chain runs DURING render, and React Compiler reads a bare arrow function there as render-time
   * ref access (react-hooks/refs).
   */
  const onDragBegin = useCallback(() => { dragStart.set(incomeSV.get()); }, [dragStart, incomeSV]);
  const onDragUpdate = useCallback(
    (e: { translationX: number }) => { setInput(dragStart.get() + e.translationX / 220); },
    [setInput, dragStart],
  );
  /*
   * DISABLED DELIBERATELY, after four structural attempts rather than as a first move.
   *
   * The Gesture builder chain executes during render, so React Compiler reads any handler reachable
   * from it as render-time ref access. `onDragUpdate` calls `setInput`, and `setInput` writes
   * `inputRef` — which the animation loop must read, because a shared value read inside the effect
   * brings back react-hooks/immutability instead. The constraint is circular.
   *
   * What was tried and did not clear it: useCallback handlers; useMemo around the builder; moving
   * the drag anchor from a ref to a shared value; and splitting the engine input away from the
   * shared value entirely. Each fixed a different error and this one survived all four.
   *
   * It is safe: nothing here runs during render. onBegin and onUpdate fire from the gesture system
   * after mount, and the ref they reach is written and read on the JS thread in the same frame.
   */
  const pan = useMemo(
    // eslint-disable-next-line react-hooks/refs
    () => Gesture.Pan().runOnJS(true).onBegin(onDragBegin).onUpdate(onDragUpdate),
    [onDragBegin, onDragUpdate],
  );

  const beamStyle = useAnimatedStyle(() => ({
    // Under Reduced Motion the beam holds level and the meter below carries the reading.
    transform: [{ rotate: `${reduced ? 0 : (angleSV.value * 180) / Math.PI}deg` }],
  }));
  const incomeStyle = useAnimatedStyle(() => ({ left: incomeSV.value * (armPx - 26) }));
  const meterStyle = useAnimatedStyle(() => ({
    left: `${Math.max(0, Math.min(100, 50 + (angleSV.value / MAX_ANGLE) * 50))}%`,
  }));
  const holdStyle = useAnimatedStyle(() => ({ width: `${Math.min(100, holdSV.value * 100)}%` }));

  const need = balancePoint(view.costs);

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientBackground />
      <View style={styles.header}>
        <SpringPressable haptic={false} scaleTo={0.85} onPress={() => { router.back(); }}
          accessibilityRole="button" accessibilityLabel="Back to games">
          <UIcon name="chevronLeft" size={26} color={theme.text} />
        </SpringPressable>
        <View style={styles.headRow}>
          <PixelSpriteView sprite={scales} size={26} />
          <ThemedText type="bodyMedium">Budget Balancer</ThemedText>
        </View>
        <ThemedText type="small" themeColor="mutedForeground">Best {best}</ThemedText>
      </View>

      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="The beam. Slide your income out for more leverage, in for less."
        accessibilityValue={{ text: `Income at ${announcedPct} percent. Balance point ${Math.round(need * 100)} percent. ${view.costs.length} costs.` }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => { nudge(e.nativeEvent.actionName === 'increment' ? NUDGE : -NUDGE); }}
        style={styles.stage}
      >
        <GestureDetector gesture={pan}>
          <View style={styles.stageInner}>
            <Animated.View style={[styles.beam, { backgroundColor: theme.border, width: armPx * 2 }, beamStyle]}>
              <View style={[styles.arm, styles.leftArm]}>
                <Animated.View style={[styles.income, { backgroundColor: theme.primary }, incomeStyle]}>
                  <ThemedText type="small" style={{ color: theme.background, fontSize: FontSize.tiny }}>IN</ThemedText>
                </Animated.View>
              </View>
              <View style={[styles.arm, styles.rightArm]}>
                {view.costs.map((c) => (
                  <View key={c.id}
                    style={[styles.cost, {
                      left: c.dist * (armPx - 30),
                      backgroundColor: c.kind === 'fixed' ? theme.destructive : theme.accent,
                      height: 18 + c.weight * 8,
                    }]} />
                ))}
              </View>
            </Animated.View>
            <View style={[styles.pivot, { borderBottomColor: theme.mutedForeground }]} />
          </View>
        </GestureDetector>
      </View>

      <View style={styles.readouts}>
        <ThemedText type="small" themeColor="mutedForeground">Balance</ThemedText>
        <View style={[styles.meter, { backgroundColor: theme.border }]}>
          <View style={[styles.meterZone, { backgroundColor: theme.success, left: `${50 - (LEVEL_TOL / MAX_ANGLE) * 50}%`, width: `${(LEVEL_TOL / MAX_ANGLE) * 100}%` }]} />
          <Animated.View style={[styles.meterMark, { backgroundColor: theme.text }, meterStyle]} />
        </View>
        <View style={[styles.hold, { backgroundColor: theme.border }]}>
          <Animated.View style={[styles.holdFill, { backgroundColor: theme.primary }, holdStyle]} />
        </View>
        <ThemedText type="small" themeColor="mutedForeground">
          {view.costs.filter((c) => c.kind === 'fixed').length} fixed · {view.costs.filter((c) => c.kind === 'variable').length} variable · cleared {view.cleared}
        </ThemedText>
      </View>

      <View style={styles.controls}>
        <SpringPressable onPress={() => { nudge(-NUDGE); }} accessibilityRole="button"
          accessibilityLabel="Move income in, toward the pivot">
          <View style={[styles.ctl, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <ThemedText type="bodyMedium">◀ In</ThemedText>
          </View>
        </SpringPressable>
        <ThemedText type="title">{view.score}</ThemedText>
        <SpringPressable onPress={() => { nudge(NUDGE); }} accessibilityRole="button"
          accessibilityLabel="Move income out, away from the pivot">
          <View style={[styles.ctl, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <ThemedText type="bodyMedium">Out ▶</ThemedText>
          </View>
        </SpringPressable>
      </View>

      {reward ? (
        <Animated.View
          key={reward.n}
          entering={FadeIn.duration(140)}
          exiting={FadeOut.duration(320)}
          pointerEvents="none"
          style={[styles.reward, { backgroundColor: theme.success }]}
        >
          <ThemedText type="smallBold" style={{ color: theme.background }}>
            {reward.label} cleared  +{reward.points}
          </ThemedText>
        </Animated.View>
      ) : null}

      {view.over ? (
        <View style={[styles.over, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ThemedText type="heading">The beam tipped</ThemedText>
          <ThemedText type="small" themeColor="mutedForeground" style={styles.overCopy}>
            You cleared {view.cleared} variable costs. The fixed ones never moved. That is the whole
            point of the game, and of a budget.
          </ThemedText>
          <SlabButton label="Play again" full onPress={onRestart} />
          <SlabButton label="Back to games" tone="neutral" full onPress={() => { router.back(); }} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  intro: { flexGrow: 1, paddingHorizontal: Spacing.four, paddingVertical: Spacing.four },
  introInner: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
  introTitle: { fontSize: FontSize.titleSm, textAlign: 'center', marginTop: Spacing.three },
  introCopy: { textAlign: 'center', marginTop: Spacing.two },
  introButton: { alignSelf: 'stretch', marginTop: Spacing.five },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.four, paddingVertical: Spacing.two },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  stage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  stageInner: { width: '100%', height: 220, justifyContent: 'center', alignItems: 'center' },
  beam: { height: 10, borderRadius: Radius.sm, flexDirection: 'row' },
  arm: { flex: 1, height: '100%' },
  leftArm: { alignItems: 'flex-end' },
  rightArm: {},
  income: { position: 'absolute', bottom: 12, width: 26, height: 26, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  cost: { position: 'absolute', bottom: 10, width: 22, borderRadius: Radius.sm },
  // top:50% puts the apex at the beam's own centre line. It was bottom:40, which floated the
  // triangle in space well below the beam and read as a rendering bug.
  pivot: { position: 'absolute', top: '50%', marginTop: 5, width: 0, height: 0, borderLeftWidth: 16, borderRightWidth: 16, borderBottomWidth: 26, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  readouts: { paddingHorizontal: Spacing.four, gap: Spacing.two },
  meter: { height: 10, borderRadius: Radius.sm, overflow: 'hidden' },
  meterZone: { position: 'absolute', top: 0, bottom: 0 },
  meterMark: { position: 'absolute', top: 0, bottom: 0, width: 3, marginLeft: -1 },
  hold: { height: 6, borderRadius: Radius.sm, overflow: 'hidden' },
  holdFill: { height: '100%' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.four },
  ctl: { paddingVertical: Spacing.three, paddingHorizontal: Spacing.four, borderRadius: Radius.md, borderWidth: 1, minWidth: 96, alignItems: 'center' },
  over: { position: 'absolute', left: Spacing.four, right: Spacing.four, bottom: Spacing.six, padding: Spacing.four, borderRadius: Radius.lg, borderWidth: 1, gap: Spacing.two },
  overCopy: { marginBottom: Spacing.two },
  reward: { position: 'absolute', alignSelf: 'center', top: '38%', paddingVertical: Spacing.two, paddingHorizontal: Spacing.four, borderRadius: Radius.md },
});
