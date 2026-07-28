/**
 * The arrival beat for a completed lesson.
 *
 * Choreography measured off refs/videos (Duolingo, sampled at 8fps — note those recordings are
 * Duolingo despite BRILLIANT_VISUAL_ANALYSIS.md labelling them Brilliant):
 *
 *   1. a branded diagonal wipe sweeps the outgoing screen away        ~1.4s
 *   2. the character arrives OVERSIZED and settles DOWN to rest       ~0.9s
 *   3. radial rays burst outward behind it during the settle
 *   4. the text lands only AFTER the character has stopped            ~2.5s in
 *   total beat ~5s
 *
 * The two findings worth keeping: the character scales DOWN from bigger-than-frame rather than
 * up from nothing (up-from-nothing reads as a UI element appearing, down-from-huge reads as
 * something rushing at you), and the reward beat is held far longer than feels natural while
 * building it. Ours ran under a second.
 *
 * Euphoria's palette, not Duolingo's: the violet ramp, never the green.
 */
import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const RAY_COUNT = 14;
const VB = 300;
const C = VB / 2;

/** One tapered spike: narrow at the hub, wider at the tip, so it reads as speed not a starburst. */
function ray(i: number) {
  const a = (i / RAY_COUNT) * Math.PI * 2;
  const inner = 30;
  const outer = 148;
  const w = 0.052;
  const pt = (r: number, t: number) => `${(C + r * Math.cos(t)).toFixed(1)} ${(C + r * Math.sin(t)).toFixed(1)}`;
  return `M${pt(inner, a - w * 0.4)} L${pt(outer, a - w)} L${pt(outer, a + w)} L${pt(inner, a + w * 0.4)} Z`;
}
const RAYS = Array.from({ length: RAY_COUNT }, (_, i) => ray(i));

/** Radial burst behind the mascot. Sits under it, so mount it before <Atlas>. */
export function CelebrationRays({ size = 300, delay = 0 }: { size?: number; delay?: number }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    t.set(withDelay(delay, withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) })));
  }, [reduced, t, delay]);

  const style = useAnimatedStyle(() => {
    const v = t.get();
    return {
      opacity: v < 0.12 ? v / 0.12 : Math.max(0, 1 - (v - 0.12) / 0.88),
      transform: [{ scale: 0.35 + v * 1.25 }, { rotate: `${v * 14}deg` }],
    };
  });

  if (reduced) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.rays, { width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }, style]}>
      <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`}>
        <Defs>
          <LinearGradient id="rayGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#C89CF5" stopOpacity={0.85} />
            <Stop offset="1" stopColor="#5B21B6" stopOpacity={0.1} />
          </LinearGradient>
        </Defs>
        {RAYS.map((d, i) => (
          <Path key={i} d={d} fill="url(#rayGrad)" />
        ))}
      </Svg>
    </Animated.View>
  );
}

/**
 * Branded diagonal wipe. Sweeps once across the screen and is gone — it covers the moment the
 * outgoing screen is replaced, so the change reads as authored rather than as a cut.
 */
export function CelebrationWipe({ duration = 750 }: { duration?: number }) {
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  // wide enough that the skewed edge never exposes a corner mid-sweep
  const band = width * 1.9;

  useEffect(() => {
    if (reduced) return;
    t.set(withTiming(1, { duration, easing: Easing.inOut(Easing.cubic) }));
  }, [reduced, t, duration]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: -band + t.get() * (band * 2 + width) }, { skewX: '-14deg' }],
  }));

  if (reduced) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[{ position: 'absolute', top: -height * 0.2, width: band, height: height * 1.4 }, style]}>
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="wipeGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#5B21B6" stopOpacity={0} />
              <Stop offset="0.28" stopColor="#5B21B6" stopOpacity={1} />
              <Stop offset="0.62" stopColor="#A855EB" stopOpacity={1} />
              <Stop offset="1" stopColor="#C89CF5" stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d="M0 0 H10000 V10000 H0 Z" fill="url(#wipeGrad)" />
        </Svg>
      </Animated.View>
    </View>
  );
}

/**
 * A ring of soft puffs that expands outward and fades, revealing whatever is underneath.
 *
 * The reference uses this to get the mascot onto a screen it was not on a frame earlier
 * (t≈148s): rather than fading Duo in, a cloud bursts and he is simply there when it clears.
 * A fade says "this element appeared". A puff says "something happened".
 */
export function CloudPuff({ size = 190, delay = 0, color = '#F6F0FE' }: { size?: number; delay?: number; color?: string }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    t.set(withDelay(delay, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) })));
  }, [reduced, t, delay]);

  const puffs = 7;
  const style = useAnimatedStyle(() => {
    const v = t.get();
    // snap to full, HOLD, then clear. A linear fade leaves it sitting as a grey smudge for
    // most of its life; the puff should read as a flash you barely catch.
    return { opacity: v < 0.1 ? v / 0.1 : v < 0.42 ? 1 : Math.max(0, 1 - (v - 0.42) / 0.58) };
  });
  const inner = useAnimatedStyle(() => ({ transform: [{ scale: 0.45 + t.get() * 0.95 }] }));

  if (reduced) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.rays, { width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }, style]}>
      <Animated.View style={[{ width: size, height: size }, inner]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {Array.from({ length: puffs }, (_, i) => {
            const a = (i / puffs) * Math.PI * 2;
            const r = 30;
            return (
              <Path
                key={i}
                d={`M${50 + r * Math.cos(a)} ${50 + r * Math.sin(a)} m-17 0 a17 17 0 1 0 34 0 a17 17 0 1 0 -34 0`}
                fill={color}
                opacity={1}
              />
            );
          })}
          <Path d="M50 50 m-22 0 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0" fill={color} />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  rays: { position: 'absolute', left: '50%', top: '50%' },
});
