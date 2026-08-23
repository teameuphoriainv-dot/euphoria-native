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
import { memo, useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Duration } from '@/shared/motion/tokens';

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

/** Orchid base and shadow, straight from the pixel palette (P and p), so the celebration is made
 *  of the same colours as the sprites it bursts behind. */
const RAY_LIT = '#A451E6';
const RAY_DEEP = '#8028C3';

/** Radial burst behind the mascot. Sits under it, so mount it before <Atlas>. */
function CelebrationRaysInner({ size = 300, delay = 0 }: { size?: number; delay?: number }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    t.set(withDelay(delay, withTiming(1, { duration: Duration.count, easing: Easing.out(Easing.cubic) })));
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
        {/*
          * SOLID, ALTERNATING — no gradient. This was a `rayGrad` fading #C89CF5 to #5B21B6 at 0.1
          * opacity, which is the soft coloured falloff the design doc rejects ("I don't like the
          * gradient look that we've put across the entire app"), sitting on the two biggest
          * celebration moments in the app.
          *
          * Alternating two flat tones from the pixel palette does the job the fade was doing —
          * separating neighbouring rays so the burst reads as spokes rather than a disc — without
          * any blur. Hard edges are also what makes it sit beside the pixel art and the slab
          * buttons instead of looking imported from a different product.
          */}
        {RAYS.map((d, i) => (
          <Path key={i} d={d} fill={i % 2 === 0 ? RAY_LIT : RAY_DEEP} />
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
        {/*
          * TWO SOLID SLABS with a hard cut between them, replacing a four-stop gradient that faded
          * in and out at both ends. The soft ends were doing the work of hiding the band's edges;
          * a slab does not need them hidden, because a hard edge sweeping past IS the effect —
          * the same reasoning as SlabButton, where the edge is the point.
          */}
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ flex: 1, backgroundColor: RAY_DEEP }} />
          <View style={{ flex: 1, backgroundColor: RAY_LIT }} />
        </View>
      </Animated.View>
    </View>
  );
}

/*
 * MEMOISED for the same reason the rest of the SVG set was: many child nodes, primitive props, and
 * previously no memo — the shape that cost AmbientBackground 14,629 Circle renders per scroll.
 * Smaller than the others, so the win is smaller; included because leaving one unmemoised member
 * of a set invites the next person to assume none of them need it.
 */
export const CelebrationRays = memo(CelebrationRaysInner);

const styles = StyleSheet.create({
  /** Centred on its parent by margin, so callers position the hub rather than the box. */
  rays: { position: 'absolute', left: '50%', top: '50%' },
});
