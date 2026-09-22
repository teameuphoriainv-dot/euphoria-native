/**
 * StreakIgnite: the streak moment at the end of a lesson.
 *
 * WHY IT WAS REBUILT (owner, 2026-09-22, with a screenshot: "the current streak animation is
 * really bad"). The previous version was a 3200ms Duolingo-modelled sequence built around three
 * things that did not survive contact with this app:
 *   - the mark was UIcon's thin vector OUTLINE flame at 104pt. Every other flame in the app is the
 *     pixel `flame` sprite, so the one earned moment read as a different product (CONSTITUTION 5.5);
 *   - the number did not appear until 2560ms in, so for most of the beat the screen showed a lone
 *     outline and a sliver of a digit (the owner's screenshot caught exactly that frame);
 *   - a round 160pt orange disc and a full-bleed white flash. A round glow beside pixel art is the
 *     mismatch 5.5 names, and a white frame on the dark canvas is a luma spike, not a reward.
 *
 * NOW: the animated pixel flame (its own frames lick and shed an ember) lands with one earned
 * overshoot, square pixel embers rise off it, and the count rolls up with its label at once. The
 * whole beat is ~1.4s, so the reward is fully on screen before the thumb reaches the CTA.
 *
 * The overshoot is allowed here, and only here among the end screens: scripts/motion-invariants.mjs
 * lists streak-ignite.tsx in POP_ALLOWED because an earned reward is the case AGENTS.md reserves
 * overshoot for. Reduced motion shows the resolved state with no movement and no embers.
 */
import { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Colors, FontSize, Fonts, Spacing } from '@/constants/theme';
import { PixelSpriteView, flame as flameSprite } from '@/lib/pixel';
import { NumberRollup } from '@/shared/motion/number-rollup';

/** The whole beat. Long enough to register, short enough to be over before the CTA is reached. */
const BEAT_MS = 1400;
/** Flame size: a multiple of the 16-cell sprite so every pixel lands on a whole point (16 x 8.5). */
const FLAME_PT = 136;
/** One ember cell, the same 8.5pt as one sprite pixel so the embers read as the flame's own pixels. */
const CELL = FLAME_PT / 16;

/*
 * Embers: fixed positions, not random. A random layout would differ on every render (and between
 * the two visual checks CONSTITUTION 1.2 asks for), so a bad frame could not be reproduced.
 * x is an offset from the flame's centre in cells, rise is how far it travels in cells, at is its
 * start as a fraction of the beat.
 */
const EMBERS: { x: number; rise: number; at: number; dim: boolean }[] = [
  { x: -5, rise: 9, at: 0.3, dim: false },
  { x: 4, rise: 11, at: 0.34, dim: true },
  { x: -2, rise: 13, at: 0.4, dim: false },
  { x: 6, rise: 8, at: 0.46, dim: false },
  { x: -7, rise: 10, at: 0.52, dim: true },
  { x: 1, rise: 12, at: 0.58, dim: true },
  { x: 3, rise: 9, at: 0.64, dim: false },
  { x: -4, rise: 11, at: 0.7, dim: true },
];

function Ember({ t, x, rise, at, dim }: { t: SharedValue<number>; x: number; rise: number; at: number; dim: boolean }) {
  const end = Math.min(1, at + 0.3);
  const style = useAnimatedStyle(() => {
    const v = t.get();
    // Rises in WHOLE cells, so an ember steps up the pixel grid instead of gliding off it.
    const cells = Math.floor(interpolate(v, [at, end], [0, rise], 'clamp'));
    return {
      opacity: interpolate(v, [at, at + 0.04, end - 0.08, end], [0, 1, 1, 0], 'clamp'),
      transform: [{ translateX: x * CELL }, { translateY: -cells * CELL }],
    };
  });
  return <Animated.View pointerEvents="none" style={[styles.ember, dim && styles.emberDim, style]} />;
}

export function StreakIgnite({
  days,
  onDone,
}: {
  /** The streak the user just reached, the number the moment resolves to. */
  days: number;
  onDone?: () => void;
}) {
  const reduced = useReducedMotion();
  const t = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      t.set(1);
      onDone?.();
      return;
    }
    t.set(0);
    // Linear on purpose: the shape lives in the interpolations, so one clock drives every element
    // and the beats cannot drift apart.
    t.set(withDelay(80, withTiming(1, { duration: BEAT_MS, easing: Easing.linear })));
    const done = setTimeout(() => onDone?.(), BEAT_MS + 80);
    return () => clearTimeout(done);
  }, [reduced, t, days, onDone]);

  const flameStyle = useAnimatedStyle(() => {
    const v = t.get();
    return {
      opacity: interpolate(v, [0, 0.12], [0, 1], 'clamp'),
      transform: [
        { translateY: interpolate(v, [0, 0.3, 0.42, 0.55], [CELL * 4, -CELL, CELL * 0.25, 0], 'clamp') },
        { scale: interpolate(v, [0, 0.3, 0.42, 0.55], [0.4, 1.12, 0.97, 1], 'clamp') },
      ],
    };
  });

  const countStyle = useAnimatedStyle(() => {
    const v = t.get();
    return {
      opacity: interpolate(v, [0.32, 0.46], [0, 1], 'clamp'),
      transform: [{ translateY: interpolate(v, [0.32, 0.5], [CELL * 2, 0], 'clamp') }],
    };
  });

  const label = 'day streak';
  /*
   * THE COUNT RENDERED AS A SLIVER ("|"), reproduced on the simulator 2026-09-22 and visible in the
   * owner's screenshot of the old version too. ThemedText's default `body` type carries
   * lineHeight 23, and overriding only fontSize to 40 drew a 40pt digit into a 23pt line box, which
   * clipped it to its middle stroke. The line height is set here, scaled by the SAME Dynamic Type
   * factor the text gets (capped at the 1.6 maxFontSizeMultiplier), because RN scales fontSize with
   * the OS setting but never lineHeight: a fixed 50 would clip again at AX5 (see 1ddf437).
   */
  const { fontScale } = useWindowDimensions();
  const countLine = { lineHeight: Math.ceil(FontSize.hero * 1.25 * Math.min(fontScale, 1.6)) };

  return (
    <View style={styles.wrap} accessible accessibilityRole="text" accessibilityLabel={`${days} day streak`}>
      <View style={styles.stage}>
        {reduced ? null : EMBERS.map((e, i) => <Ember key={i} t={t} {...e} />)}
        <Animated.View style={flameStyle}>
          <PixelSpriteView sprite={flameSprite} size={FLAME_PT} play={reduced ? 'none' : 'loop'} />
        </Animated.View>
      </View>
      <Animated.View style={[styles.countRow, countStyle]}>
        {reduced ? (
          <ThemedText maxFontSizeMultiplier={1.6} style={[styles.count, countLine]}>{days}</ThemedText>
        ) : (
          <NumberRollup value={days} duration={600} maxFontSizeMultiplier={1.6} style={[styles.count, countLine]} />
        )}
        <ThemedText type="bodyMedium" themeColor="mutedForeground" maxFontSizeMultiplier={1.6}>{label}</ThemedText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.four },
  // Tall enough that the highest ember (13 cells above the flame's centre) stays inside the stage.
  stage: { width: FLAME_PT * 1.8, height: FLAME_PT * 1.7, alignItems: 'center', justifyContent: 'flex-end' },
  ember: {
    position: 'absolute',
    bottom: FLAME_PT * 0.55,
    width: CELL,
    height: CELL,
    backgroundColor: Colors.dark.streak,
  },
  emberDim: { width: CELL * 0.75, height: CELL * 0.75 },
  countRow: { alignItems: 'center', marginTop: Spacing.three },
  // lineHeight comes from `countLine` in the component, scaled with Dynamic Type.
  // The family carries the weight: DM Sans ships one file per weight, so fontWeight '800' on the
  // body family rendered the regular cut (thin "1", simulator 2026-09-22).
  count: { fontFamily: Fonts.display, fontSize: FontSize.hero, color: Colors.dark.streak },
});
