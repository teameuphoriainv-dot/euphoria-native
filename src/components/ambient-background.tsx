/**
 * AmbientBackground — the celestial signature from euphoriainv.com: a drifting starfield with a
 * slow twinkle + a soft violet top-glow that breathes, behind hero/onboarding/home. This is what
 * makes flat-black screens feel alive. Reduced-motion → fully static. Simulators keep only the
 * UI-thread drift so visual verification cannot saturate the host Mac. Absolute-fill; render first.
 *
 * Twinkle is done with THREE animated <G> groups rather than per-star shared values: 45–70 stars
 * would mean 45–70 timers for an effect nobody can resolve individually. Three desynced groups
 * read as random shimmer and cost three.
 */
import { useIsFocused } from 'expo-router';
import { isDevice } from 'expo-device';
import { memo, useEffect, useMemo } from 'react';
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

function AmbientBackgroundInner({ glow = true, starCount = 70 }: { glow?: boolean; starCount?: number }) {
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const focused = useIsFocused();
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
  /*
   * §4.1: THE STARFIELD ONLY TWINKLES ON THE SCREEN YOU ARE LOOKING AT.
   *
   * `drift` is free — it is a plain useAnimatedStyle transform on an Animated.View, which the UI
   * thread owns end to end. The four TWINKLES are not: t0/t1/t2/glowPulse feed useAnimatedProps on
   * <G> and <Rect>, which are react-native-svg components, and RNSVG cannot natively animate most
   * SVG attributes — so every frame of those crosses into JS and costs a React commit. That is the
   * exact mechanism measured in atlas.tsx, which took Home's idle commits from 3.04/s to ~1.1/s.
   *
   * This component had NO focus gate at all and is mounted on 30+ screens, so on Home it was the
   * loudest loop still running once Atlas went quiet. React Navigation keeps unfocused tabs
   * MOUNTED, so every tab you have ever visited was twinkling behind the one you were reading.
   *
   * Settling to the resting value on blur rather than just returning: freezing mid-twinkle would
   * leave a screen's stars stuck at a random brightness, which reads as a rendering bug when you
   * come back to it. Same reasoning as Atlas's breath loop.
   */
  useEffect(() => {
    if (reduced || !focused) {
      drift.set(withTiming(0, { duration: 400 }));
      t0.set(withTiming(1, { duration: 400 }));
      t1.set(withTiming(1, { duration: 400 }));
      t2.set(withTiming(1, { duration: 400 }));
      glowPulse.set(withTiming(1, { duration: 400 }));
      return;
    }
    drift.set(withRepeat(withTiming(-26, { duration: 19000, easing: Easing.inOut(Easing.ease) }), -1, true));
    /*
     * MEASURED 2026-09-16 on one iPhone 17 simulator, same debug build and isolated route:
     *   AmbientBackground alone ........ 84.4% app CPU
     *   Atlas alone ..................... 17.9% app CPU
     *   neither (tier preview) ..........  4.7% app CPU
     *
     * The four SVG prop loops cross the RNSVG boundary every frame; the plain wrapper drift does
     * not. Keep that subtle movement for simulator screenshots, but reserve twinkle and glow pulse
     * for physical devices. This changes no App Store behavior and makes local visual QA safe.
     */
    if (!isDevice) {
      t0.set(1);
      t1.set(1);
      t2.set(1);
      glowPulse.set(1);
      return;
    }
    // prime numbers-ish periods so the three groups never re-sync into a visible common pulse
    twinkle(t0, 2600, 0.35);
    twinkle(t1, 3700, 0.55);
    twinkle(t2, 4900, 0.25);
    twinkle(glowPulse, 6500, 0.62);
  }, [reduced, focused, drift, t0, t1, t2, glowPulse]);

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

/*
 * MEMOISED, BECAUSE IT WAS RE-RENDERING ON EVERY SCROLL.
 *
 * MEASURED 2026-08-20 by profiling the running app through five vertical scrolls, four horizontal
 * rail drags and three scroll-backs: 131 commits, and `Circle` alone accounted for **14,629 of
 * them** -- roughly 1.75 seconds of self time drawing a background that never changes. `G`,
 * `Svg`, `RNSVGGroup` and `RNSVGSvgView` add several thousand more on top.
 *
 * The star POSITIONS were already useMemo'd, which hid the problem: the expensive part is not
 * computing them, it is re-creating seventy <Circle> elements and reconciling them every time a
 * parent re-renders. A scroll re-renders the screen; the screen renders this; this renders the
 * whole starfield again.
 *
 * Both props are primitives, so the default shallow comparison is exactly right and needs no
 * custom equality function. The animation is driven by shared values and withRepeat, which live
 * outside React's render cycle -- memoising the component does not pause the drift or the twinkle.
 */
export const AmbientBackground = memo(AmbientBackgroundInner);
