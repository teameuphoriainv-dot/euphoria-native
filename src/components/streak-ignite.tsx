/**
 * StreakIgnite — the app's first EARNED moment.
 *
 * WHY THIS EXISTS. `Duration.earned = 3200` has sat in src/shared/motion/tokens.ts unused since
 * it was added, and that token's own comment names the gap it was meant to close:
 *
 *   "Duolingo's streak ignite runs 3200ms and is two-stage — build → burn → burst → white flash
 *    → resolve. Nothing in this app currently exceeds 400ms, and that structural gap, not spring
 *    tuning, is why payoffs do not land."
 *
 * Measured 2026-08-18 across all 26 routes: the longest payoff beat anywhere in the app was
 * 267ms. Every reward in Euphoria is over before the user has registered that it started. That
 * is not a tuning problem — a 267ms celebration cannot feel earned no matter how good its easing
 * is, because the user has no time to feel anything at all.
 *
 * STRUCTURE. One `t` running 0→1 over Duration.earned drives every stage, so the beats cannot
 * drift apart the way five independent springs would. Stage boundaries are fractions of t:
 *
 *   BUILD   0.00–0.28   anticipation. The flame shrinks and the count holds — pulling back
 *                       before a launch is what makes the launch read as a launch.
 *   BURN    0.28–0.59   it grows past its resting size and the glow builds underneath.
 *   BURST   0.59–0.72   overshoot, the peak of the beat.
 *   FLASH   0.72–0.80   the white frame. Duolingo's measured luma goes 25.9 → 207.5; this is
 *                       the single frame that makes the moment feel like a payoff rather than
 *                       a transition, and it is why the sequence needs the 3200ms to breathe.
 *   RESOLVE 0.80–1.00   settle to the new number.
 *
 * Reduced motion collapses the whole thing to the resolved state — an earned moment that a
 * user cannot safely watch is not earned, it is excluding them.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Colors, FontSize } from '@/constants/theme';
import { Duration } from '@/shared/motion/tokens';

// Stage boundaries as fractions of Duration.earned. Named so a change reads as a re-timing of a
// beat rather than as an unexplained constant.
const BUILD_END = 0.28;
const BURN_END = 0.59;
const BURST_END = 0.72;
const FLASH_END = 0.8;
/** Celebration flame size. Larger than any type step because it is a mark, not text. */
const FLAME_PT = 104;

export function StreakIgnite({
  days,
  onDone,
}: {
  /** The streak the user just reached — the number the moment resolves to. */
  days: number;
  onDone?: () => void;
}) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      t.set(1);
      onDone?.();
      return;
    }
    // Linear on purpose: the SHAPE lives in the interpolations below, so easing here would
    // compound with every stage curve and make the beats un-tunable independently.
    t.set(withTiming(1, { duration: Duration.earned, easing: Easing.linear }));
    const done = setTimeout(() => onDone?.(), Duration.earned);
    return () => clearTimeout(done);
  }, [reduced, t, days, onDone]);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          t.get(),
          [0, BUILD_END, BURN_END, BURST_END, FLASH_END, 1],
          [1, 0.82, 1.24, 1.55, 1.12, 1.02],
        ),
      },
    ],
    opacity: interpolate(t.get(), [0, BUILD_END, 1], [1, 0.85, 1]),
  }));

  // The flame keeps easing down through RESOLVE instead of holding a frozen pose.
  const flameSettle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(t.get(), [FLASH_END, 0.9, 1], [-6, 2, 0]) }],
  }));

  // The glow builds under the flame through BURN and dies with the flash, so the burst reads as
  // the glow releasing rather than as a separate element appearing.
  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(t.get(), [0, BUILD_END, BURN_END, BURST_END, FLASH_END], [0, 0.1, 0.55, 0.9, 0]),
    // 2.1 on a 160pt circle is a 336pt dome that exceeded the frame — a frame strip showed it
    // reading as an orange blob swallowing the screen rather than as light behind the flame.
    // 1.35 keeps it behind the mark.
    transform: [{ scale: interpolate(t.get(), [BUILD_END, BURST_END], [0.6, 1.35]) }],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: interpolate(t.get(), [BURST_END, 0.76, FLASH_END], [0, 0.92, 0]),
  }));

  // RESOLVE was dead air. The measurement said only 1033ms of the 3200ms carried perceptible
  // motion, and the frame strip showed why: past the flash, the flame and the count simply sat
  // there. A settle has to keep moving to read as a settle, so the count now overshoots, eases
  // back and drifts, and the flame breathes down rather than snapping to rest.
  const countStyle = useAnimatedStyle(() => ({
    opacity: interpolate(t.get(), [FLASH_END, 0.86], [0, 1]),
    transform: [
      { scale: interpolate(t.get(), [FLASH_END, 0.88, 0.94, 1], [1.5, 0.94, 1.04, 1]) },
      { translateY: interpolate(t.get(), [FLASH_END, 0.9, 1], [10, -3, 0]) },
    ],
  }));

  return (
    <View
      style={styles.wrap}
      accessibilityRole="text"
      accessibilityLabel={`${days} day streak reached`}
    >
      <Animated.View style={[styles.glow, glowStyle]} />
      <Animated.View style={flameSettle}>
        <Animated.View style={flameStyle}>
          {/* The app's own flame path, not an emoji. An emoji renders as a different glyph per
              OS version, ignores the colour tokens entirely, and cannot be animated per-path —
              three reasons it has no business in a celebration. UIcon.flame is the same mark the
              streak pill already uses, so the moment resolves into something the user recognises. */}
          <UIcon name="flame" size={FLAME_PT} color={Colors.dark.streak} strokeWidth={1.6} />
        </Animated.View>
      </Animated.View>
      <Animated.View style={countStyle}>
        <ThemedText style={styles.count}>{days}</ThemedText>
      </Animated.View>
      {/* Full-bleed white frame — the luma spike. Sits above everything and is never interactive. */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.flash, flashStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
  // FontSize.hero was a dead ramp step before this — a celebration is exactly the moment the
  // largest sizes exist for. Leading is 1.25x, above the 1.2 clipping floor; my first pass used
  // raw 52/60 (ratio 1.154) and type_audit caught it.
  count: { fontSize: FontSize.hero, lineHeight: FontSize.hero * 1.25, fontWeight: '800', color: Colors.dark.streak },
  glow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.dark.streak,
  },
  flash: { backgroundColor: '#FFFFFF' },
});
