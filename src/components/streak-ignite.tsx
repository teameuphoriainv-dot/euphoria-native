/**
 * StreakIgnite — the app's first EARNED moment.
 *
 * WHY THIS EXISTS. Duration.earned (3200ms) is Duolingo's measured streak-ignite length. Before it,
 * the longest payoff anywhere in the app was 267ms: over before the user registered it started.
 *
 * REBUILT 2026-09-23 after a motion audit (motion-audits/euphoria-native-2026-09-23.html). The first
 * version ran ONE linear clock through linear interpolate() keyframes, so every beat moved at
 * constant speed and changed speed abruptly at each stage boundary -- the single biggest
 * "generated" tell. It also flashed the whole screen white on a near-black app, drew the glow as a
 * flat disc, scaled an outline flame uniformly from its centre, and left Atlas out of the payoff.
 *
 * NOW every beat carries its own curve from src/shared/motion/tokens.ts, sequenced on one timeline
 * of named start times so the beats still cannot drift apart:
 *
 *   BUILD    0–560     anticipation. The unlit flame squashes down (Ease.exitCurve: it ACCELERATES
 *                      into the crouch, which is what a wind-up is).
 *   BURN     560–920   it stretches up and lifts (Ease.out) while its colour runs grey -> lit.
 *   BURST    920       the release: the flame springs home (Spring.reward, zeta 0.55), a radial
 *                      bloom opens behind it, confetti leaves from the flame.
 *   TWIRL    980       SECONDARY ACTION -- Atlas reacts to the burst: crouch, launch on an arc
 *                      while turning a full rotateY, land into a squash, settle proud.
 *   ROLL     1040      yesterday's count rolls to today's (NumberFlow, timed on this clock) and
 *                      the numeral pops on Spring.reward.
 *   RESOLVE  1900+     "day streak" and the week enter (Ease.enter), today's circle lights last so
 *                      Atlas pops into it as the closing beat.
 *
 * Overshoot lives ONLY on the flame's release, Atlas and the numeral -- the expressive character and
 * the earned reward, which is where AGENTS.md allows it. Reduced motion renders the resolved state:
 * lit flame, today's number, the week, no twirl, no bloom, no confetti.
 */
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NumberFlow } from 'number-flow-react-native';
import { PIConfetti, type PIConfettiMethods } from 'react-native-fast-confetti';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Canvas, Circle, RadialGradient, vec } from '@shopify/react-native-skia';
import Svg, { Path } from 'react-native-svg';

import { Atlas, type AtlasExpression } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { WeekStreak } from '@/components/week-streak';
import { Colors, FontSize } from '@/constants/theme';
import { Duration, Ease, Spring } from '@/shared/motion/tokens';

/** Beat start times (ms from mount). Named so a re-time reads as moving a beat, not a constant. */
const BEAT = { burn: 560, burst: 920, twirl: 980, roll: 1040, label: 1900, today: 2500 } as const;

/** Celebration flame size. Larger than any type step because it is a mark, not text. */
const FLAME_PT = 104;
const ATLAS_PT = 76;
const BLOOM_PT = 240;

/* The app's own two-tone flame (EUPHORIA_ICONS 'flame', 48 viewBox). Unlit and lit are two static
   drawings crossfaded by opacity: interpolating the fill inside a Skia canvas every frame made the
   flame drop out for whole frames during the burst (seen at 30fps on the simulator). */
const FLAME_BODY = 'M24 4c-4 10-12 14-12 24a12 12 0 0024 0c0-10-8-14-12-24z';
const FLAME_CORE = 'M24 20c-2 5-6 7-6 13a6 6 0 0012 0c0-6-4-8-6-13z';
const UNLIT = { body: Colors.dark.border, core: Colors.dark.backgroundSelected };
const LIT = { body: Colors.dark.streak, core: Colors.dark.warning };

function Flame({ colors }: { colors: { body: string; core: string } }) {
  return (
    <Svg width={FLAME_PT} height={FLAME_PT} viewBox="0 0 48 48">
      <Path d={FLAME_BODY} fill={colors.body} />
      <Path d={FLAME_CORE} fill={colors.core} />
    </Svg>
  );
}

export function StreakIgnite({
  days,
  onDone,
}: {
  /** The streak the user just reached — the number the moment resolves to. */
  days: number;
  onDone?: () => void;
}) {
  const reduced = useReducedMotion();

  // Flame: squash/stretch about its base, lift, and a 0->1 "lit" progress for colour.
  const fsx = useSharedValue(1);
  const fsy = useSharedValue(1);
  const fty = useSharedValue(0);
  const lit = useSharedValue(reduced ? 1 : 0);
  // Bloom behind the flame.
  const bloomO = useSharedValue(0);
  const bloomS = useSharedValue(0.6);
  // Numeral pop.
  const countS = useSharedValue(1);
  const countO = useSharedValue(reduced ? 1 : 0);
  // Atlas twirl.
  const asx = useSharedValue(1);
  const asy = useSharedValue(1);
  const aty = useSharedValue(0);
  const arot = useSharedValue(0);

  const [shown, setShown] = useState(reduced ? days : Math.max(0, days - 1));
  const [resolved, setResolved] = useState(reduced);
  const [todayLit, setTodayLit] = useState(reduced);
  const [face, setFace] = useState<AtlasExpression>(reduced ? 'proud' : 'happy');
  const confetti = useRef<PIConfettiMethods>(null);
  const [wrapW, setWrapW] = useState(0);
  const [flameY, setFlameY] = useState(0);

  useEffect(() => {
    if (reduced) {
      onDone?.();
      return;
    }

    // BUILD -> BURN -> BURST: crouch, stretch up, spring home.
    fsx.set(withSequence(
      withTiming(1.14, { duration: BEAT.burn, easing: Ease.exitCurve }),
      withTiming(0.86, { duration: BEAT.burst - BEAT.burn, easing: Ease.out }),
      withSpring(1, Spring.reward),
    ));
    fsy.set(withSequence(
      withTiming(0.8, { duration: BEAT.burn, easing: Ease.exitCurve }),
      withTiming(1.22, { duration: BEAT.burst - BEAT.burn, easing: Ease.out }),
      withSpring(1, Spring.reward),
    ));
    fty.set(withDelay(BEAT.burn, withSequence(
      withTiming(-12, { duration: BEAT.burst - BEAT.burn, easing: Ease.out }),
      withSpring(0, Spring.reward),
    )));
    lit.set(withDelay(BEAT.burn, withTiming(1, { duration: Duration.count - Duration.slow, easing: Ease.inOut })));

    // BURST bloom: opens fast, falls off slowly while it keeps growing.
    bloomO.set(withDelay(BEAT.burst, withSequence(
      withTiming(1, { duration: Duration.instant, easing: Ease.out }),
      withTiming(0, { duration: Duration.count, easing: Ease.out }),
    )));
    bloomS.set(withDelay(BEAT.burst, withTiming(1.3, { duration: Duration.count + Duration.instant, easing: Ease.out })));

    // The numeral is present from the start at yesterday's value, dimmed; it lights on the roll.
    countO.set(withSequence(
      withTiming(0.5, { duration: Duration.base, easing: Ease.enter }),
      withDelay(BEAT.roll - Duration.base, withTiming(1, { duration: Duration.instant, easing: Ease.out })),
    ));
    countS.set(withDelay(BEAT.roll, withSequence(
      withTiming(1.22, { duration: Duration.instant, easing: Ease.out }),
      withSpring(1, Spring.reward),
    )));

    // TWIRL: crouch (160) -> launch on an arc while turning (560) -> land squash -> settle.
    const crouch = Duration.fast + 10;
    const flight = Duration.count - Duration.slow + 60;
    asx.set(withDelay(BEAT.twirl, withSequence(
      withTiming(1.12, { duration: crouch, easing: Ease.exitCurve }),
      withTiming(0.92, { duration: Duration.fast, easing: Ease.out }),
      withTiming(1, { duration: flight - Duration.fast, easing: Ease.inOut }),
      withTiming(1.1, { duration: Duration.instant - 10, easing: Ease.out }),
      withSpring(1, Spring.bouncy),
    )));
    asy.set(withDelay(BEAT.twirl, withSequence(
      withTiming(0.86, { duration: crouch, easing: Ease.exitCurve }),
      withTiming(1.1, { duration: Duration.fast, easing: Ease.out }),
      withTiming(1, { duration: flight - Duration.fast, easing: Ease.inOut }),
      withTiming(0.9, { duration: Duration.instant - 10, easing: Ease.out }),
      withSpring(1, Spring.bouncy),
    )));
    aty.set(withDelay(BEAT.twirl + crouch, withSequence(
      withTiming(-34, { duration: flight / 2 + 20, easing: Ease.out }),
      withTiming(0, { duration: flight / 2 - 20, easing: Ease.exitCurve }),
    )));
    arot.set(withDelay(BEAT.twirl + crouch, withTiming(360, { duration: flight, easing: Ease.inOut })));

    const landed = BEAT.twirl + crouch + flight;
    const timers = [
      setTimeout(() => {
        confetti.current?.restart();
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, BEAT.burst),
      setTimeout(() => setShown(days), BEAT.roll),
      setTimeout(() => setFace('proud'), landed),
      setTimeout(() => setResolved(true), BEAT.label),
      setTimeout(() => setTodayLit(true), BEAT.today),
      setTimeout(() => onDone?.(), Duration.earned),
    ];
    return () => timers.forEach(clearTimeout);
    // Shared values are stable refs; the timeline runs once per mount / per new streak value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, days]);

  const litStyle = useAnimatedStyle(() => ({ opacity: lit.get() }));

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: fty.get() }, { scaleX: fsx.get() }, { scaleY: fsy.get() }],
  }));
  const bloomStyle = useAnimatedStyle(() => ({
    opacity: bloomO.get(),
    transform: [{ scale: bloomS.get() }],
  }));
  const countStyle = useAnimatedStyle(() => ({
    opacity: countO.get(),
    transform: [{ scale: countS.get() }],
  }));
  const atlasStyle = useAnimatedStyle(() => ({
    // A flat turn: rotating about the vertical axis is, to the eye, horizontal scale following
    // cos(angle) -- narrow to a sliver, show the mirrored back, come round. A real rotateY with
    // perspective put Atlas in a 3D rendering context that blanked the flame and numeral beside it
    // for whole frames mid-turn (seen at 30fps), so the turn is drawn in 2D.
    transform: [
      { translateY: aty.get() },
      { scaleX: asx.get() * Math.cos((arot.get() * Math.PI) / 180) },
      { scaleY: asy.get() },
    ],
  }));

  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <View
      style={styles.wrap}
      onLayout={(e) => setWrapW(e.nativeEvent.layout.width)}
      accessibilityRole="text"
      accessibilityLabel={`${String(days)} day streak reached`}>
      <View
        style={styles.stage}
        onLayout={(e) => setFlameY(e.nativeEvent.layout.y + e.nativeEvent.layout.height / 2)}>
        {!reduced && (
          <Animated.View pointerEvents="none" style={[styles.bloom, bloomStyle]}>
            <Canvas style={styles.fill}>
              <Circle cx={BLOOM_PT / 2} cy={BLOOM_PT / 2} r={BLOOM_PT / 2}>
                <RadialGradient
                  c={vec(BLOOM_PT / 2, BLOOM_PT / 2)}
                  r={BLOOM_PT / 2}
                  colors={[`${LIT.body}A6`, `${LIT.body}33`, `${LIT.body}00`]}
                  positions={[0, 0.55, 1]}
                />
              </Circle>
            </Canvas>
          </Animated.View>
        )}
        <Animated.View style={[styles.flame, flameStyle]}>
          <Flame colors={UNLIT} />
          <Animated.View style={[StyleSheet.absoluteFill, litStyle]}>
            <Flame colors={LIT} />
          </Animated.View>
        </Animated.View>
        <Animated.View style={[styles.atlas, atlasStyle]}>
          <Atlas size={ATLAS_PT} expression={face} accessibilityLabel="" />
        </Animated.View>
      </View>

      <Animated.View style={countStyle}>
        {/* Capped so the numeral stays inside the bloom; uncapped it reaches ~125pt at AX5. */}
        <NumberFlow
          value={shown}
          animated={!reduced}
          spinTiming={{ duration: Duration.slow, easing: Ease.out.factory() }}
          style={styles.count}
        />
      </Animated.View>

      {resolved && (
        <>
          <Animated.View entering={reduced ? undefined : FadeInDown.duration(Duration.base).easing(Ease.enter)}>
            <ThemedText type="title" style={styles.label}>day streak</ThemedText>
          </Animated.View>
          <Animated.View
            entering={reduced ? undefined : FadeInDown.duration(Duration.base).delay(Duration.fast).easing(Ease.enter)}
            style={styles.week}>
            <WeekStreak
              todayIdx={todayIdx}
              isDone={(i) => i <= todayIdx && todayIdx - i < days && (i < todayIdx || todayLit)}
            />
          </Animated.View>
        </>
      )}

      {!reduced && (
        <PIConfetti ref={confetti} autoplay={false} fadeOutOnEnd containerStyle={StyleSheet.absoluteFill}>
          <PIConfetti.Origin
            blastPosition={{ x: wrapW / 2, y: flameY }}
            count={80}
            colors={[LIT.body, LIT.core, Colors.dark.primary, Colors.dark.iconLilac]}>
            <PIConfetti.Flake size={7} />
          </PIConfetti.Origin>
        </PIConfetti>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Fills its screen so the confetti has room to fall.
  wrap: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
  stage: { width: FLAME_PT, height: FLAME_PT, alignItems: 'center', justifyContent: 'center' },
  fill: { width: '100%', height: '100%' },
  flame: { width: FLAME_PT, height: FLAME_PT, transformOrigin: 'bottom' },
  bloom: { position: 'absolute', left: (FLAME_PT - BLOOM_PT) / 2, top: (FLAME_PT - BLOOM_PT) / 2, width: BLOOM_PT, height: BLOOM_PT },
  // Stands at the flame's left, feet on the flame's baseline, so it reads as reacting to it.
  atlas: { position: 'absolute', left: -ATLAS_PT - 6, bottom: -4, width: ATLAS_PT, height: ATLAS_PT, transformOrigin: 'bottom' },
  count: { fontSize: FontSize.hero, fontWeight: '800', color: Colors.dark.streak },
  label: { color: Colors.dark.streak, marginTop: 4 },
  week: { alignSelf: 'stretch', marginTop: 20, paddingHorizontal: 8 },
});
