/**
 * <PixelBurst>: a one-shot ring of pixel squares flying out from a point, driven by a clock.
 *
 * The EARNED tick that says "this just happened here": the node you built lit, Atlas landed. It is
 * the sparkle ring lesson-complete draws around Atlas, made reusable and put on a shared clock so a
 * screen can choreograph it against everything else without a second timer.
 *
 * Squares only, never round dots: a round dot beside pixel sprites reads as a different product
 * (CONSTITUTION 5.5). Every square drifts OUT along its own spoke on a monotonic curve and fades;
 * nothing springs, because a sparkle is light, not a character. At the end of its window it is
 * gone, so under Reduce Motion (clock parked at 1) it never shows, which is right for a transient.
 *
 * `clock` runs 0 to 1 over the owning screen's whole timeline; `from` and `to` are this burst's
 * window on that clock, in the same units.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, interpolate, type SharedValue, useAnimatedStyle, useReducedMotion } from 'react-native-reanimated';

/** Squares on the ring, offset half a step so none sits dead on the vertical axis. */
const COUNT = 8;
/** The spoke positions, unit radius. */
const SPOKES = Array.from({ length: COUNT }, (_, i) => {
  const a = ((i + 0.5) / COUNT) * Math.PI * 2;
  return { ux: Math.cos(a), uy: Math.sin(a) };
});

function Square({ clock, from, to, ux, uy, r0, r1, px, color, large }: {
  clock: SharedValue<number>;
  from: number; to: number; ux: number; uy: number; r0: number; r1: number; px: number; color: string; large: boolean;
}) {
  const style = useAnimatedStyle(() => {
    const p = interpolate(clock.get(), [from, to], [0, 1], 'clamp');
    const out = Easing.out(Easing.cubic)(p);
    const r = r0 + (r1 - r0) * out;
    // On fast, off slow: visible almost at once, then fading over the drift.
    const opacity = p <= 0 || p >= 1 ? 0 : p < 0.15 ? p / 0.15 : 1 - (p - 0.15) / 0.85;
    return { opacity, transform: [{ translateX: Math.round(ux * r) }, { translateY: Math.round(uy * r) }] };
  });
  const s = large ? px * 2 : px;
  return <Animated.View style={[styles.square, { width: s, height: s, marginLeft: -s / 2, marginTop: -s / 2, backgroundColor: color }, style]} />;
}

function PixelBurstInner({ clock, from, to, color, radius, spread = 22, px = 3, size }: {
  clock: SharedValue<number>;
  from: number;
  to: number;
  color: string;
  /** Where the squares start, in points from the centre. */
  radius: number;
  /** How far they travel outward. */
  spread?: number;
  /** One art pixel, in points. */
  px?: number;
  /** The box the burst is centred in. Give it the size of what it surrounds. */
  size: number;
}) {
  /* A burst is a transient: its end state is nothing. Under Reduce Motion it is nothing from the
     start, whatever the owning clock does, so the guard lives here and not only in the caller. */
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <View pointerEvents="none" style={[styles.box, { width: size, height: size }]}>
      {SPOKES.map((s, i) => (
        <Square
          key={i}
          clock={clock}
          from={from}
          to={to}
          ux={s.ux}
          uy={s.uy}
          r0={radius}
          r1={radius + spread}
          px={px}
          color={color}
          large={i % 2 === 0}
        />
      ))}
    </View>
  );
}

export const PixelBurst = memo(PixelBurstInner);

const styles = StyleSheet.create({
  box: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  square: { position: 'absolute', left: '50%', top: '50%' },
});
