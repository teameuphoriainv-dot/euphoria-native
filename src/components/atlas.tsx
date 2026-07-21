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
import Svg, { Circle, G, Image as SvgImage, Path } from 'react-native-svg';

export type AtlasExpression = 'default' | 'watching' | 'happy' | 'whoa' | 'silly' | 'sad' | 'thinking' | 'proud' | 'oops';

const INK = '#1A1523';
const AnimatedG = Animated.createAnimatedComponent(G);
const logo = require('@/assets/images/atlas-logo.png');

export function Atlas({
  size = 120,
  expression = 'default',
  interactive = true,
  glasses = false,
  celebrate = false,
  shake = false,
  entrance,
}: {
  size?: number;
  expression?: AtlasExpression;
  interactive?: boolean;
  glasses?: boolean;
  celebrate?: boolean;
  shake?: boolean;
  entrance?: 'bounce';
}) {
  const reduced = useReducedMotion();
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const jumpY = useSharedValue(0);
  const breathY = useSharedValue(0);
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

  // celebratory jump (fired on wins)
  useEffect(() => {
    if (!celebrate || reduced) return;
    jumpY.set(withDelay(180, withSequence(withSpring(-size * 0.28, { stiffness: 320, damping: 9 }), withSpring(0, { stiffness: 220, damping: 12 }))));
  }, [celebrate, reduced, jumpY, size]);

  // idle breathing bob — the "alive" signal (V2 bot reference)
  useEffect(() => {
    if (reduced) return;
    breathY.set(withRepeat(withSequence(
      withTiming(-size * 0.025, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
      withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));
  }, [reduced, breathY, size]);

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

  // bounce-in entrance (V2 greeting reference)
  useEffect(() => {
    if (entrance !== 'bounce') return;
    if (reduced) { entranceScale.set(1); entranceOpacity.set(1); return; }
    entranceOpacity.set(withTiming(1, { duration: 80 }));
    entranceScale.set(withSequence(
      withSpring(1.12, { stiffness: 320, damping: 8 }),
      withSpring(0.96, { stiffness: 280, damping: 14 }),
      withSpring(1.0, { stiffness: 240, damping: 18 }),
    ));
  }, [entrance, reduced, entranceScale, entranceOpacity]);

  const spin = () => {
    if (!interactive || reduced) return;
    spins.current += 1;
    setSpinning(true);
    rotation.set(withSpring(spins.current * 360, { stiffness: 60, damping: 14 }));
    setTimeout(() => setSpinning(false), 900);
  };

  const bodyProps = useAnimatedProps(() => ({ rotation: rotation.get() }));
  const wrapStyle = useAnimatedStyle(() => ({
    opacity: entranceOpacity.get(),
    transform: [{ translateY: jumpY.get() + breathY.get() }, { translateX: shakeX.get() }, { scale: scale.get() * entranceScale.get() }],
  }));

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

  const svg = (
    <Svg width={size} height={size * 1.04} viewBox="0 0 100 104">
      <AnimatedG animatedProps={bodyProps} origin="50, 52">
        <SvgImage href={logo} x={0} y={3} width={100} height={98} preserveAspectRatio="xMidYMid meet" />
      </AnimatedG>
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
    </Svg>
  );

  if (!interactive) return <Animated.View style={wrapStyle}>{svg}</Animated.View>;

  return (
    <Pressable
      onPressIn={() => scale.set(withSpring(0.92, { stiffness: 420, damping: 32 }))}
      onPressOut={() => scale.set(withSpring(1, { stiffness: 420, damping: 32 }))}
      onPress={spin}>
      <Animated.View style={wrapStyle}>{svg}</Animated.View>
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
