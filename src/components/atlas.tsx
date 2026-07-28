/**
 * Atlas — Euphoria's mascot. Near-verbatim RN port of euphoriaweb Atlas.tsx: the pinwheel
 * logo mark with googly eyes at the crown; all acting happens in the pupils. One <Svg> with
 * the logo as an inner <Image>, whites + expression pupils drawn on top at the EXACT web
 * coords. Body spins on tap (eyes stay upright); idle blink; 6 expressions.
 */
import { useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';

import { Duration, Spring } from '@/shared/motion/tokens';

export type AtlasExpression = 'default' | 'watching' | 'happy' | 'whoa' | 'silly' | 'sad' | 'thinking' | 'proud' | 'oops';

const INK = '#1A1523';
/** Head scale inside the 100x104 box. Shrinking the pinwheel makes room for a body without
 *  touching any expression coordinate — see the <G> transform in the render. */
const HEAD_S = 0.68;
/** Body silhouette: a soft pear the head sits ON, overlapping by a few units so the two read as
 *  one creature rather than a stack. Deliberately WIDER than the head — equal widths read as a
 *  snowman, and a head wider than its body reads as a balloon on a stick. */
const BODY_D = 'M50 44 C68 44, 78 60, 78 78 C78 92, 66 101, 50 101 C34 101, 22 92, 22 78 C22 60, 32 44, 50 44 Z';

/** The head, in the head group's own 100x104 space (so every expression coord below is
 *  untouched). HEAD_DY drops it onto the body: without it the head floats with a visible gap. */
const HEAD_CX = 48;
const HEAD_CY = 27;
const HEAD_RX = 30;
const HEAD_RY = 29;
const HEAD_DY = 10;
const AnimatedG = Animated.createAnimatedComponent(G);

/**
 * The pinwheel, as geometry rather than a PNG, worn as a CHEST EMBLEM.
 *
 * The head used to be <SvgImage href={atlas-logo.png}>. A bitmap head is why Atlas never felt
 * animated: nothing inside it can move, so every "animation" had to be one rigid transform of
 * the whole mascot.
 *
 * The mark is no longer the head either. Four ring holes plus two eyes read as six competing
 * circles, so the face never won and the whole thing looked like a pile. As a small emblem on
 * the body it stays present, stays on-brand, and turns slowly under its own power.
 *
 * Four rings, 90 degrees apart, tilted so the top one sits just right of centre like the logo.
 * Ring outer radius is ~0.79 of the orbit, which is what makes them interlock as a pinwheel.
 */
const RING_CX = 50;
const RING_CY = 76;
const ORBIT = 7.4;
const RING_R = 4.2; // stroke centreline: outer 5.8, hole 2.6
const RING_W = 3.2;
const RING_ANGLES = [-80, 10, 100, 190];
const RINGS = RING_ANGLES.map((deg) => {
  const r = (deg * Math.PI) / 180;
  return { cx: +(RING_CX + ORBIT * Math.cos(r)).toFixed(2), cy: +(RING_CY + ORBIT * Math.sin(r)).toFixed(2) };
});

/** Idle breath depth, as a fraction of height. The Brilliant reference measures ~0.044
 *  (6px of bottom travel on a 136px mascot). The old 0.022 was half that and read as dead
 *  on device, so it is now at the measured value. */
const IDLE_SQUASH = 0.045;
/** Seconds for one lazy revolution of the pinwheel. Slow enough to be ambient, not a fidget. */
const SPIN_PERIOD = 14000;

export function Atlas({
  size = 120,
  expression = 'default',
  interactive = true,
  glasses = false,
  celebrate = false,
  celebrateKey = 0,
  shake = false,
  entrance,
  idle = false,
}: {
  size?: number;
  expression?: AtlasExpression;
  interactive?: boolean;
  glasses?: boolean;
  celebrate?: boolean;
  /** Bump to re-fire the hop. A boolean `celebrate` latches once and never fires again —
   *  which is why re-selecting an onboarding option used to produce no reaction. */
  celebrateKey?: number;
  shake?: boolean;
  entrance?: 'bounce';
  /** Opt-in idle breath (anchored squash-stretch, top edge pinned). Default OFF: a mascot
   *  should be still until something happens. Reads correctly from ~96px up; below that
   *  it's sub-pixel and just costs a frame callback. */
  idle?: boolean;
}) {
  const reduced = useReducedMotion();
  const rotation = useSharedValue(0);
  /** Continuous idle rotation of the ring cluster, independent of the tap spin. */
  const drift = useSharedValue(0);
  const scale = useSharedValue(1);
  const jumpY = useSharedValue(0);
  /** Breath PHASE (0..1), not a pixel offset — mapped to scale in `breathStyle` below. */
  const breath = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const entranceScale = useSharedValue(entrance === 'bounce' ? 0 : 1);
  const entranceOpacity = useSharedValue(entrance === 'bounce' ? 0 : 1);
  const spins = useRef(0);
  const [blink, setBlink] = useState(false);
  const [spinning, setSpinning] = useState(false);

  // idle blink every 2.8–6.2s (130ms)
  useEffect(() => {
    if (reduced) return;
    let alive = true;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        if (!alive) return;
        setBlink(true);
        setTimeout(() => alive && setBlink(false), 130);
        loop();
      }, 2800 + Math.random() * 3400);
    };
    loop();
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [reduced]);

  // celebratory hop — a reaction to a user action, not a launch. Kept small (size * 0.10)
  // and softly damped so it reads as an acknowledging nod; the `expression` flip to 'happy'
  // carries most of the reaction. Anything larger turns every win into a jump-scare.
  useEffect(() => {
    if (!celebrate || reduced) return;
    jumpY.set(withDelay(Duration.fast, withSequence(withSpring(-size * 0.1, Spring.bouncy), withSpring(0, Spring.smooth))));
  }, [celebrate, celebrateKey, reduced, jumpY, size]);

  // Idle breath — an ANCHORED SQUASH-STRETCH, not a bob. Measured off the Brilliant
  // recordings (refs/videos): the mascot's top edge never moves across 90 frames; only its
  // body volume changes. This used to translate the whole mascot, which is why onboarding
  // read as bouncing. Opt-in via `idle`; note `size` is deliberately NOT a dependency, so
  // a resize can never re-fire the loop.
  useEffect(() => {
    if (!idle || reduced) {
      breath.set(withTiming(0, { duration: Duration.base }));
      return;
    }
    // withRepeat(..., -1, true) reverses, so the full period is 2x duration -> 1600ms.
    breath.set(withRepeat(
      withTiming(1, { duration: Duration.slow * 2, easing: Easing.inOut(Easing.sin) }),
      -1, true,
    ));
  }, [idle, reduced, breath]);

  // shake on wrong answer (V1 balance-scale reference)
  useEffect(() => {
    if (!shake || reduced) return;
    shakeX.set(withSequence(
      withTiming(-size * 0.06, { duration: 60 }),
      withTiming(size * 0.06, { duration: 60 }),
      withTiming(-size * 0.05, { duration: 55 }),
      withTiming(size * 0.05, { duration: 55 }),
      withTiming(-size * 0.025, { duration: 50 }),
      withSpring(0, { stiffness: 300, damping: 20 }),
    ));
  }, [shake, reduced, shakeX, size]);

  // entrance: a calm settle, not an overshoot. One soft spring from a near-final scale plus
  // the fade — Atlas arrives and comes to rest. The old 1.12 -> 0.96 -> 1.0 sequence stacked
  // on top of the idle bob and the celebrate jump, which is what made onboarding feel jumpy.
  useEffect(() => {
    if (entrance !== 'bounce') return;
    if (reduced) { entranceScale.set(1); entranceOpacity.set(1); return; }
    entranceOpacity.set(withTiming(1, { duration: Duration.fast }));
    entranceScale.set(withSpring(1, { ...Spring.smooth, damping: 24 }));
  }, [entrance, reduced, entranceScale, entranceOpacity]);

  const spin = () => {
    if (!interactive || reduced) return;
    spins.current += 1;
    setSpinning(true);
    rotation.set(withSpring(spins.current * 360, { stiffness: 60, damping: 14 }));
    setTimeout(() => setSpinning(false), 900);
  };

  // Lazy continuous drift of the ring cluster. This is the motion the mark was always asking
  // for and the PNG head could never do: the pinwheel turns while the face stays put, so Atlas
  // is alive on every screen without anything bouncing.
  useEffect(() => {
    if (reduced) { drift.set(0); return; }
    drift.set(withRepeat(withTiming(360, { duration: SPIN_PERIOD, easing: Easing.linear }), -1, false));
  }, [reduced, drift]);

  const bodyProps = useAnimatedProps(() => ({ rotation: rotation.get() }));
  const driftProps = useAnimatedProps(() => ({ rotation: drift.get() }));
  const wrapStyle = useAnimatedStyle(() => ({
    opacity: entranceOpacity.get(),
    transform: [{ translateY: jumpY.get() }, { translateX: shakeX.get() }, { scale: scale.get() * entranceScale.get() }],
  }));

  // Breath lives on its OWN inner view. wrapStyle's translateY applies in unscaled parent
  // space (M = T·S), so folding the top-pin compensation into it would be wrong by a factor
  // of scale x entranceScale during press, entrance and celebrate. Nested, it is correct by
  // construction — and breath can no longer stack with jumpY, which was the original bug.
  const breathStyle = useAnimatedStyle(() => {
    const b = breath.get();
    const sy = 1 + IDLE_SQUASH * b;
    const sx = 1 - IDLE_SQUASH * 0.5 * b; // partial volume preservation; full 1/sy reads rubbery
    // scaleY about the centre lifts the top edge by H*(sy-1)/2 — translate down by exactly that.
    return { transform: [{ translateY: (size * 1.04 * (sy - 1)) / 2 }, { scaleY: sy }, { scaleX: sx }] };
  });

  const active: AtlasExpression = spinning ? 'whoa' : expression;
  const showBlink = blink && !spinning && (expression === 'default' || expression === 'watching');
  const whiteR = active === 'whoa' ? [14, 12.8] : [13, 11.8];

  const pupils = () => {
    if (showBlink) {
      return (
        <>
          <Path d="M26 27.5 Q34.8 31.5 43.6 27.5" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
          <Path d="M53.2 26 Q61.2 29.6 69.2 26" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
        </>
      );
    }
    switch (active) {
      case 'happy':
        return (
          <>
            <Path d="M27.3 27.8 Q34.8 20.8 42.3 27.8" stroke={INK} strokeWidth={3.2} strokeLinecap="round" fill="none" />
            <Path d="M54.4 26.2 Q61.2 19.8 68 26.2" stroke={INK} strokeWidth={3.2} strokeLinecap="round" fill="none" />
          </>
        );
      case 'whoa':
        return (
          <>
            <Circle cx={34.8} cy={26.5} r={4.4} fill={INK} />
            <Circle cx={61.2} cy={25} r={4} fill={INK} />
          </>
        );
      case 'watching':
        return (
          <>
            <Circle cx={31.8} cy={29.5} r={6.6} fill={INK} />
            <Circle cx={29.4} cy={27} r={2} fill="#fff" />
            <Circle cx={58.3} cy={28} r={6} fill={INK} />
            <Circle cx={56} cy={25.8} r={1.8} fill="#fff" />
          </>
        );
      case 'silly':
        return (
          <>
            <Circle cx={39.5} cy={27} r={6.2} fill={INK} />
            <Circle cx={37.2} cy={24.7} r={2} fill="#fff" />
            <Circle cx={57} cy={26.2} r={5.7} fill={INK} />
            <Circle cx={54.9} cy={24.1} r={1.8} fill="#fff" />
          </>
        );
      case 'sad':
        return (
          <>
            <Circle cx={35} cy={31} r={6} fill={INK} />
            <Circle cx={32.8} cy={29.4} r={1.8} fill="#fff" />
            <Circle cx={60} cy={30.5} r={5.6} fill={INK} />
            <Circle cx={57.9} cy={29} r={1.6} fill="#fff" />
            <Path d="M27 24 Q35 22 43 25" stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none" />
            <Path d="M54 24 Q61 22 68 25" stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none" />
          </>
        );
      case 'thinking':
        return (
          <>
            <Circle cx={32} cy={22} r={6.6} fill={INK} />
            <Circle cx={29.8} cy={20} r={2.2} fill="#fff" />
            <Circle cx={59} cy={23.5} r={5.8} fill={INK} />
            <Circle cx={57} cy={21.5} r={1.8} fill="#fff" />
            <Path d="M26 20 Q34.8 16.5 42 19.5" stroke={INK} strokeWidth={2.4} strokeLinecap="round" fill="none" />
          </>
        );
      case 'proud':
        return (
          <>
            <Circle cx={34.8} cy={22.5} r={6.6} fill={INK} />
            <Circle cx={32.6} cy={20.5} r={2.2} fill="#fff" />
            <Circle cx={61.2} cy={21.2} r={6} fill={INK} />
            <Circle cx={59} cy={19.2} r={2} fill="#fff" />
            <Path d="M24 28.5 Q34.8 33 45.6 28.5" stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none" />
            <Path d="M51.4 27 Q61.2 31.2 71 27" stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none" />
          </>
        );
      case 'oops':
        return (
          <>
            <Circle cx={34.8} cy={32} r={6} fill={INK} />
            <Circle cx={32.8} cy={30.2} r={1.8} fill="#fff" />
            <Circle cx={61.2} cy={30.5} r={5.4} fill={INK} />
            <Circle cx={59.3} cy={28.8} r={1.6} fill="#fff" />
            <Path d="M25 19 Q34.8 23 43.5 20" stroke={INK} strokeWidth={2.8} strokeLinecap="round" fill="none" />
            <Path d="M52 19 Q61.2 23 70.5 20" stroke={INK} strokeWidth={2.8} strokeLinecap="round" fill="none" />
          </>
        );
      default:
        return (
          <>
            <Circle cx={36.5} cy={24.8} r={6.6} fill={INK} />
            <Circle cx={34} cy={22.2} r={2.2} fill="#fff" />
            <Circle cx={59.5} cy={23.6} r={6} fill={INK} />
            <Circle cx={57.2} cy={21.4} r={2} fill="#fff" />
          </>
        );
    }
  };

  // The head keeps its ORIGINAL 100x104 coordinate space, scaled down as one unit so every
  // absolute pupil/glasses coord below stays byte-identical to the web original. Body is
  // authored in the outer space beneath it.
  // ponytail: one <G> transform instead of rewriting 9 expressions' coords. Never inline new
  // eye coords here — rescale HEAD_S and the whole face follows.
  const head = (
    <G transform={`translate(${(100 - 100 * HEAD_S) / 2}, ${HEAD_DY}) scale(${HEAD_S})`}>
      <Ellipse cx={HEAD_CX} cy={HEAD_CY} rx={HEAD_RX} ry={HEAD_RY} fill="url(#atlasHead)" />
      {/* single top-left light source, matching the body highlight and the contact shadow */}
      <Ellipse cx={HEAD_CX - 11} cy={HEAD_CY - 15} rx={11} ry={7} fill="#F3E7FF" opacity={0.26} />
      <Circle cx={34.8} cy={26.5} r={whiteR[0]} fill="#fff" stroke={INK} strokeWidth={2.2} />
      <Circle cx={61.2} cy={25} r={whiteR[1]} fill="#fff" stroke={INK} strokeWidth={2.2} />
      {pupils()}
      {glasses && (
        <>
          <G stroke="#141019" strokeWidth={4.4} opacity={0.9} fill="none">
            <Circle cx={34.8} cy={26.5} r={15.5} />
            <Circle cx={61.2} cy={25} r={14.3} />
            <Path d="M50.2 25.9 Q48 24.2 46.2 25.6" />
          </G>
          <G stroke="#EDEAF5" strokeWidth={2} fill="none">
            <Circle cx={34.8} cy={26.5} r={15.5} />
            <Circle cx={61.2} cy={25} r={14.3} />
            <Path d="M50.2 25.9 Q48 24.2 46.2 25.6" />
          </G>
        </>
      )}
    </G>
  );

  const svg = (
    <Svg width={size} height={size * 1.04} viewBox="0 0 100 104">
      <Defs>
        <LinearGradient id="atlasBody" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#C89CF5" />
          <Stop offset="0.55" stopColor="#9B6BEF" />
          <Stop offset="1" stopColor="#6D34D6" />
        </LinearGradient>
        <RadialGradient id="atlasShadow" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#7C3AED" stopOpacity={0.55} />
          <Stop offset="1" stopColor="#7C3AED" stopOpacity={0} />
        </RadialGradient>
        {/* the rings get their own lit-from-above ramp so the cluster has form rather than
            reading as flat lavender the way the PNG did */}
        <LinearGradient id="atlasRing" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#D9B4F5" />
          <Stop offset="1" stopColor="#9B5DE8" />
        </LinearGradient>
        {/* head sits a shade lighter than the body so the two forms separate without an outline */}
        <LinearGradient id="atlasHead" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#D2A9F8" />
          <Stop offset="1" stopColor="#8B4FE0" />
        </LinearGradient>
      </Defs>

      {/* contact shadow — the cue that gives a mascot physical weight (MASTER_PLAN B6) */}
      <Ellipse cx={50} cy={102} rx={25} ry={4.5} fill="url(#atlasShadow)" />

      {/* body: soft rounded form the head sits on. Drawn before the head so it reads as behind. */}
      <Path d={BODY_D} fill="url(#atlasBody)" />
      {/* specular highlight, upper-left — a soft blob, NOT a stroke along the edge (that read
          as a seam). Single top-left light source, consistent with the contact shadow. */}
      <Ellipse cx={38} cy={62} rx={8.5} ry={5.5} fill="#EBDCFF" opacity={0.28} />

      {/* Chest emblem. Two nested rotations so the lazy idle drift and the tap spin never fight
          over one shared value; the head above is outside both, so the face never rotates. */}
      <AnimatedG animatedProps={driftProps} origin={`${RING_CX}, ${RING_CY}`}>
        <AnimatedG animatedProps={bodyProps} origin={`${RING_CX}, ${RING_CY}`}>
          {RINGS.map((p, i) => (
            <G key={i}>
              {/* thin keyline, drawn wider behind so it reads on both edges of the ring */}
              <Circle cx={p.cx} cy={p.cy} r={RING_R} stroke="#EEE2FB" strokeWidth={RING_W + 1.4} fill="none" opacity={0.5} />
              <Circle cx={p.cx} cy={p.cy} r={RING_R} stroke="url(#atlasRing)" strokeWidth={RING_W} fill="none" />
            </G>
          ))}
        </AnimatedG>
      </AnimatedG>

      {head}
    </Svg>
  );

  if (!interactive) {
    return (
      <Animated.View style={wrapStyle}>
        <Animated.View style={breathStyle}>{svg}</Animated.View>
      </Animated.View>
    );
  }

  return (
    <Pressable
      onPressIn={() => scale.set(withSpring(0.92, { stiffness: 420, damping: 32 }))}
      onPressOut={() => scale.set(withSpring(1, { stiffness: 420, damping: 32 }))}
      onPress={spin}>
      <Animated.View style={wrapStyle}>
        <Animated.View style={breathStyle}>{svg}</Animated.View>
      </Animated.View>
    </Pressable>
  );
}

/** Atlas arriving on a violet comet trail — celebratory entrances. */
export function AtlasComet({ size = 96 }: { size?: number }) {
  return (
    <Animated.View style={{ width: size * 1.55, height: size * 1.35 }}>
      <Svg viewBox="0 0 150 130" width={size * 1.55} height={size * 1.35} style={{ position: 'absolute' }}>
        <Path d="M6 126 L86 34 L124 68 Z" fill="#B862ED" opacity={0.3} />
        <Circle cx={34} cy={104} r={2.5} fill="#C89CF5" opacity={0.7} />
        <Circle cx={52} cy={88} r={1.8} fill="#B862ED" opacity={0.6} />
      </Svg>
      <Animated.View style={{ position: 'absolute', right: 0, top: 0, transform: [{ rotate: '-14deg' }] }}>
        <Atlas size={size} expression="happy" interactive={false} />
      </Animated.View>
    </Animated.View>
  );
}
