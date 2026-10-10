/**
 * <CorrectConfettiHost> — the web app's right-answer confetti, on the phone.
 *
 * The web fires `fireSmallConfetti()` (euphoriaweb-master/src/lib/confetti.ts) on a correct
 * answer: canvas-confetti with 40 particles, a 70 degree spread straight up, origin 60% down the
 * screen, scalar 0.8, in green / blue / purple. This is a port of canvas-confetti's own per-tick
 * physics rather than a lookalike, so the burst has the same launch, the same fall and the same
 * flutter:
 *
 *   x += cos(angle) * v          v *= decay (0.9)          wobble += wobbleSpeed
 *   y += sin(angle) * v + 3      opacity = 1 - tick / 200  tilt   += 0.1
 *
 * Velocity decays geometrically, so a particle's travel after n ticks has a closed form,
 * v0 * (1 - decay^n) / (1 - decay), and each piece is one worklet over a single shared clock
 * instead of a JS loop per frame.
 *
 * Mounted once over the lesson; `feedback('correct')` fires it through lib/celebrate. A new right
 * answer replaces a burst still in flight. Reduced Motion: no confetti at all. The chime and the
 * haptic still land, so the answer is still celebrated, just without anything moving.
 */
import { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { onCorrectBurst } from '@/lib/celebrate';

/* canvas-confetti defaults, plus the fireSmallConfetti overrides. */
const COUNT = 40;
const SPREAD = (70 * Math.PI) / 180;
const ANGLE = Math.PI / 2;
const START_VELOCITY = 45;
const DECAY = 0.9;
const GRAVITY = 3;
const TICKS = 200;
const TICK_MS = 1000 / 60;
const SCALAR = 0.8;
const SIZE = 10 * SCALAR;
const ORIGIN_Y = 0.6;
/* The web burst's own colours (fireSmallConfetti), not the theme: this is the same confetti. */
const COLORS = ['#22c55e', '#3b82f6', '#b862ed'] as const;

type Piece = {
  angle: number;
  velocity: number;
  wobble: number;
  wobbleSpeed: number;
  tilt: number;
  color: string;
  round: boolean;
};

function makePieces(): Piece[] {
  return Array.from({ length: COUNT }, (_, i) => ({
    angle: -ANGLE + (SPREAD / 2 - Math.random() * SPREAD),
    velocity: START_VELOCITY * 0.5 + Math.random() * START_VELOCITY,
    wobble: Math.random() * 10,
    wobbleSpeed: Math.min(0.11, Math.random() * 0.1 + 0.05),
    tilt: (Math.random() * 0.5 + 0.25) * Math.PI,
    color: COLORS[i % COLORS.length],
    round: Math.random() < 0.5,
  }));
}

function ConfettiPiece({ piece, tick, originX, originY }: {
  piece: Piece;
  tick: SharedValue<number>;
  originX: number;
  originY: number;
}) {
  const style = useAnimatedStyle(() => {
    const n = tick.get();
    const travel = (piece.velocity * (1 - Math.pow(DECAY, n))) / (1 - DECAY);
    const wobble = piece.wobble + piece.wobbleSpeed * n;
    return {
      opacity: Math.max(0, 1 - n / TICKS),
      transform: [
        { translateX: originX + Math.cos(piece.angle) * travel },
        { translateY: originY + Math.sin(piece.angle) * travel + GRAVITY * n },
        { rotate: `${String(piece.tilt + 0.1 * n)}rad` },
        // The flutter: canvas-confetti skews each piece by its wobble, so it flips edge-on.
        { scaleY: Math.cos(wobble) },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        styles.piece,
        { backgroundColor: piece.color, borderRadius: piece.round ? SIZE / 2 : 1 },
        style,
      ]}
    />
  );
}


function Burst({ pieces }: { pieces: Piece[] }) {
  const { width, height } = useWindowDimensions();
  const tick = useSharedValue(0);
  useEffect(() => {
    tick.set(withTiming(TICKS, { duration: TICKS * TICK_MS, easing: Easing.linear }));
  }, [tick]);
  return (
    <>
      {pieces.map((piece, i) => (
        <ConfettiPiece key={i} piece={piece} tick={tick} originX={width / 2 - SIZE / 2} originY={height * ORIGIN_Y} />
      ))}
    </>
  );
}

export function CorrectConfettiHost() {
  const reduced = useReducedMotion();
  const [burst, setBurst] = useState<{ id: number; pieces: Piece[] } | null>(null);

  useEffect(() => onCorrectBurst(() => {
    if (reduced) return;
    setBurst((current) => ({ id: (current?.id ?? 0) + 1, pieces: makePieces() }));
  }), [reduced]);

  // Unmount the finished burst so 40 idle views are not left in the tree between answers.
  useEffect(() => {
    if (!burst) return;
    const done = setTimeout(() => setBurst(null), TICKS * TICK_MS + 100);
    return () => clearTimeout(done);
  }, [burst]);

  if (!burst) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Burst key={burst.id} pieces={burst.pieces} />
    </View>
  );
}

const styles = StyleSheet.create({
  piece: { position: 'absolute', left: 0, top: 0, width: SIZE, height: SIZE },
});
