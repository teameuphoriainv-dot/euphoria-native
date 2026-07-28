/**
 * Streak ignition, rebuilt from the Duolingo reference (refs/videos video 3, t≈137-149s at 4fps).
 *
 * Their sequence, in order, with the measured beats:
 *
 *   dim ember, pulsing, on a near-black screen      ~1.8s   <- ANTICIPATION. The screen goes
 *                                                              quiet and dark before the payoff
 *   a vertical streak of light                      ~0.25s  <- the ignition itself
 *   radial explosion, sparks thrown outward         ~0.5s
 *   flame scales in, the number lands under it      ~0.7s
 *   weekday dots, then a tick drops onto today      ~0.6s
 *
 * The lesson is the first line. Nearly two seconds of near-nothing before the burst is what
 * makes the burst land — every version of this that skips straight to the payoff feels cheap.
 * You cannot buy impact without first buying quiet.
 *
 * Euphoria: the flame stays orange (#F97316 is already the app's streak colour, in lesson.tsx
 * and Home) and everything around it — burst, glow, rays — is the violet ramp.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg';

import { Atlas } from '@/components/atlas';
import { AtlasSpeech } from '@/components/atlas-speech';
import { CloudPuff } from '@/components/celebration-burst';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const FLAME = 'M50 6 C61 27, 80 39, 80 60 C80 79, 66 93, 50 93 C34 93, 20 79, 20 60 C20 39, 39 27, 50 6 Z';
const FLAME_INNER = 'M50 40 C56 52, 64 58, 64 68 C64 78, 58 86, 50 86 C42 86, 36 78, 36 68 C36 58, 44 52, 50 40 Z';

/** Beat map, ms. Named so the sequence reads as choreography rather than magic numbers. */
const T = { quiet: 1500, ignite: 1500, burst: 1750, flame: 1900, count: 2150, dots: 2600, tick: 2950, atlas: 3250 };

const SPARK_COUNT = 16;
const SPARKS = Array.from({ length: SPARK_COUNT }, (_, i) => {
  const a = (i / SPARK_COUNT) * Math.PI * 2 + (i % 2) * 0.2;
  return { a, dist: 120 + (i % 4) * 34, size: 5 + (i % 3) * 3 };
});

function Spark({ a, dist, size, delay }: { a: number; dist: number; size: number; delay: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withDelay(delay, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) })));
  }, [t, delay]);
  const style = useAnimatedStyle(() => {
    const v = t.get();
    return {
      opacity: Math.max(0, 1 - v * 1.15),
      transform: [
        { translateX: Math.cos(a) * dist * v },
        { translateY: Math.sin(a) * dist * v },
        { scale: 1 - v * 0.5 },
      ],
    };
  });
  return <Animated.View style={[styles.spark, { width: size, height: size, borderRadius: size / 2 }, style]} />;
}

export function StreakIgnite({ days, weekIndex = new Date().getDay() }: { days: number; weekIndex?: number }) {
  const theme = useTheme();
  const reduced = useReducedMotion();

  const ember = useSharedValue(0);      // the quiet pulse before anything happens
  const beam = useSharedValue(0);       // vertical ignition streak
  const burst = useSharedValue(0);      // radial flash
  const flame = useSharedValue(0);      // the flame arriving
  const count = useSharedValue(0);      // number + label
  const dots = useSharedValue(0);
  const tick = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      ember.set(1); flame.set(1); count.set(1); dots.set(1); tick.set(1);
      return;
    }
    // Anticipation: the ember breathes, dimly, while nothing else happens.
    ember.set(withRepeat(withTiming(1, { duration: 620, easing: Easing.inOut(Easing.sin) }), -1, true));
    beam.set(withDelay(T.ignite, withSequence(
      withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 180 }),
    )));
    burst.set(withDelay(T.burst, withTiming(1, { duration: 620, easing: Easing.out(Easing.cubic) })));
    // elastic so the flame overshoots and settles — it should feel thrown into existence
    flame.set(withDelay(T.flame, withSpring(1, { stiffness: 150, damping: 9 })));
    count.set(withDelay(T.count, withSpring(1, { stiffness: 190, damping: 13 })));
    dots.set(withDelay(T.dots, withTiming(1, { duration: 320 })));
    tick.set(withDelay(T.tick, withSpring(1, { stiffness: 260, damping: 11 })));
  }, [reduced, ember, beam, burst, flame, count, dots, tick]);

  const emberStyle = useAnimatedStyle(() => {
    // fades out the moment the real flame takes over
    const gone = flame.get();
    return { opacity: (0.35 + ember.get() * 0.4) * (1 - gone), transform: [{ scale: 0.9 + ember.get() * 0.12 }] };
  });
  const beamStyle = useAnimatedStyle(() => ({
    opacity: beam.get(),
    transform: [{ scaleY: 0.2 + beam.get() * 1.6 }, { scaleX: 1 - beam.get() * 0.45 }],
  }));
  const burstStyle = useAnimatedStyle(() => {
    const v = burst.get();
    return { opacity: Math.max(0, 1 - v), transform: [{ scale: 0.2 + v * 2.3 }] };
  });
  const flameStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, flame.get() * 2),
    transform: [{ scale: flame.get() }],
  }));
  const countStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, count.get() * 1.6),
    transform: [{ translateY: (1 - count.get()) * 18 }, { scale: 0.8 + count.get() * 0.2 }],
  }));
  const dotsStyle = useAnimatedStyle(() => ({ opacity: dots.get(), transform: [{ translateY: (1 - dots.get()) * 12 }] }));
  const tickStyle = useAnimatedStyle(() => ({ transform: [{ scale: tick.get() }] }));

  return (
    <View style={styles.wrap}>
      <View style={styles.stage}>
        {/* the quiet ember — all there is for the first beat and a half */}
        <Animated.View style={[styles.layer, emberStyle]}>
          <Svg width={110} height={110} viewBox="0 0 100 100">
            <Defs>
              <RadialGradient id="emberGlow" cx="50%" cy="66%" r="50%">
                <Stop offset="0" stopColor="#F97316" stopOpacity={0.9} />
                <Stop offset="1" stopColor="#F97316" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Path d={FLAME} fill="#2A1B45" />
            <Ellipse cx={50} cy={66} rx={26} ry={26} fill="url(#emberGlow)" />
          </Svg>
        </Animated.View>

        {/* ignition */}
        <Animated.View style={[styles.layer, beamStyle]} pointerEvents="none">
          <Svg width={70} height={260} viewBox="0 0 70 260">
            <Defs>
              <RadialGradient id="beamGrad" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#FFF7ED" stopOpacity={1} />
                <Stop offset="0.5" stopColor="#F9C516" stopOpacity={0.7} />
                <Stop offset="1" stopColor="#F97316" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Ellipse cx={35} cy={130} rx={16} ry={128} fill="url(#beamGrad)" />
          </Svg>
        </Animated.View>

        {/* radial flash + thrown sparks */}
        <Animated.View style={[styles.layer, burstStyle]} pointerEvents="none">
          <Svg width={220} height={220} viewBox="0 0 100 100">
            <Defs>
              <RadialGradient id="burstGrad" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#FFEDD5" stopOpacity={0.95} />
                <Stop offset="0.45" stopColor="#A855EB" stopOpacity={0.55} />
                <Stop offset="1" stopColor="#5B21B6" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Ellipse cx={50} cy={50} rx={50} ry={50} fill="url(#burstGrad)" />
          </Svg>
        </Animated.View>
        {!reduced && (
          <View style={styles.layer} pointerEvents="none">
            {SPARKS.map((s, i) => (
              <Spark key={i} {...s} delay={T.burst + (i % 3) * 40} />
            ))}
          </View>
        )}

        {/* the flame itself */}
        <Animated.View style={[styles.layer, flameStyle]}>
          <Svg width={128} height={128} viewBox="0 0 100 100">
            <Defs>
              <RadialGradient id="flameGrad" cx="50%" cy="72%" r="62%">
                <Stop offset="0" stopColor="#FDBA74" />
                <Stop offset="0.55" stopColor="#F97316" />
                <Stop offset="1" stopColor="#EA580C" />
              </RadialGradient>
            </Defs>
            <Path d={FLAME} fill="url(#flameGrad)" />
            <Path d={FLAME_INNER} fill="#FEF3C7" opacity={0.85} />
          </Svg>
        </Animated.View>
      </View>

      <Animated.View style={[styles.countWrap, countStyle]}>
        <ThemedText type="display" style={{ fontSize: 56, lineHeight: 62, color: '#F97316' }}>{days}</ThemedText>
        <ThemedText type="heading" style={{ fontSize: 17, color: '#F97316', opacity: 0.85 }}>
          day streak
        </ThemedText>
      </Animated.View>

      <Animated.View style={[styles.week, dotsStyle]}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
          const today = i === ((weekIndex + 6) % 7);
          return (
            <View key={i} style={styles.dayCol}>
              <ThemedText type="small" themeColor="mutedForeground" style={{ fontSize: 11 }}>{d}</ThemedText>
              <View style={[styles.dot, { borderColor: theme.border, backgroundColor: today ? '#F9731622' : 'transparent' }]}>
                {today ? (
                  <Animated.View style={tickStyle}>
                    <UIcon name="check" size={13} color="#F97316" />
                  </Animated.View>
                ) : null}
              </View>
            </View>
          );
        })}
      </Animated.View>

      {/* Atlas is not on this screen until the streak exists, then a puff bursts and he is
          simply there — the reference never fades the mascot in for a payoff. */}
      <View style={styles.atlasRow}>
        {/* the puff is absolutely positioned against its PARENT's centre, so it needs a parent
            the size of Atlas — dropped straight into the row it burst off to one side */}
        <View style={styles.atlasSlot}>
          <CloudPuff size={140} delay={T.atlas} />
          <Atlas size={72} expression="proud" entrance="arrive" idle interactive={false} />
        </View>
        <View style={{ flex: 1 }}>
          <AtlasSpeech text="A streak is born. Come back tomorrow and keep it alive." delay={T.atlas + 220} tail="bottom" maxWidth={210} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  stage: { width: 240, height: 240, alignItems: 'center', justifyContent: 'center' },
  layer: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  spark: { position: 'absolute', backgroundColor: '#FDBA74' },
  countWrap: { alignItems: 'center', marginTop: -Spacing.four },
  week: { flexDirection: 'row', gap: Spacing.two + 2, marginTop: Spacing.four },
  atlasRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 2, marginTop: Spacing.five, paddingHorizontal: Spacing.three },
  atlasSlot: { width: 72, height: 76, alignItems: 'center', justifyContent: 'center' },
  dayCol: { alignItems: 'center', gap: 5 },
  dot: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});
