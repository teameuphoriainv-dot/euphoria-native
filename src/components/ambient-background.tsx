/**
 * AmbientBackground — the celestial signature from euphoriainv.com: a drifting starfield with a
 * slow twinkle + a soft violet top-glow that breathes, behind hero/onboarding/home. This is what
 * makes flat-black screens feel alive. Reduced-motion → fully static. Absolute-fill; render first.
 *
 * Twinkle is done with THREE animated <G> groups rather than per-star shared values: 45–70 stars
 * would mean 45–70 timers for an effect nobody can resolve individually. Three desynced groups
 * read as random shimmer and cost three.
 */
import { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, G, RadialGradient, Rect, Stop } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

type Star = { x: number; y: number; r: number; o: number; g: number };

/** Oscillate a value between 1 and `dim` forever. */
/** mulberry32 — a pure, deterministic PRNG. Same seed always yields the same value, which is
 *  what makes the starfield stable and keeps the generator out of the impure-during-render trap. */
const rand = (seed: number) => {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const twinkle = (sv: SharedValue<number>, duration: number, dim: number) =>
  sv.set(withRepeat(withTiming(dim, { duration, easing: Easing.inOut(Easing.ease) }), -1, true));

export function AmbientBackground({ glow = true, starCount = 70 }: { glow?: boolean; starCount?: number }) {
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const drift = useSharedValue(0);
  const t0 = useSharedValue(1);
  const t1 = useSharedValue(1);
  const t2 = useSharedValue(1);
  const glowPulse = useSharedValue(1);

  /**
   * Deterministic scatter, seeded by star index.
   *
   * Math.random() inside a useMemo is an impure call during render — 4 lint errors, and under a
   * double render the two passes disagree about where the sky is. It also meant every width or
   * height change RESHUFFLED THE ENTIRE STARFIELD: rotate the device, or open a sheet that
   * remeasures, and every star jumps to a new place.
   *
   * mulberry32 keyed on the star's own index gives the same scatter for the same index forever,
   * so the sky is stable across renders and resizes while still looking random. Positions scale
   * with the viewport rather than being regenerated for it.
   */
  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: starCount }, (_, i) => ({
        x: rand(i * 4 + 1) * width,
        y: rand(i * 4 + 2) * height * 1.15,
        r: rand(i * 4 + 3) * 1.1 + 0.3,
        o: rand(i * 4 + 4) * 0.45 + 0.1,
        g: i % 3,
      })),
    [starCount, width, height],
  );

  // starts the loops. was a useMemo, which fires during render — the wrong place for a side effect
  // and unreliable under a double render.
  useEffect(() => {
    if (reduced) return;
    drift.set(withRepeat(withTiming(-26, { duration: 19000, easing: Easing.inOut(Easing.ease) }), -1, true));
    // prime numbers-ish periods so the three groups never re-sync into a visible common pulse
    twinkle(t0, 2600, 0.35);
    twinkle(t1, 3700, 0.55);
    twinkle(t2, 4900, 0.25);
    twinkle(glowPulse, 6500, 0.62);
  }, [reduced, drift, t0, t1, t2, glowPulse]);

  const driftStyle = useAnimatedStyle(() => ({ transform: [{ translateY: drift.get() }] }));
  const g0 = useAnimatedProps(() => ({ opacity: t0.get() }));
  const g1 = useAnimatedProps(() => ({ opacity: t1.get() }));
  const g2 = useAnimatedProps(() => ({ opacity: t2.get() }));
  const glowProps = useAnimatedProps(() => ({ opacity: glowPulse.get() }));

  const groups = [g0, g1, g2];

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, driftStyle]}>
      <Svg width={width} height={height * 1.15}>
        {glow && (
          <Defs>
            <RadialGradient id="glow" cx="50%" cy="8%" r="60%">
              <Stop offset="0" stopColor="#A451E6" stopOpacity={0.16} />
              <Stop offset="1" stopColor="#A451E6" stopOpacity={0} />
            </RadialGradient>
          </Defs>
        )}
        {glow && <AnimatedRect x={0} y={0} width={width} height={height * 0.7} fill="url(#glow)" animatedProps={glowProps} />}
        {groups.map((props, gi) => (
          <AnimatedG key={gi} animatedProps={props}>
            {stars
              .filter((s) => s.g === gi)
              .map((s, i) => (
                <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#EDE6FA" opacity={s.o} />
              ))}
          </AnimatedG>
        ))}
      </Svg>
    </Animated.View>
  );
}
