/**
 * LeagueCrest — the tier badge.
 *
 * WAS a ~400-line semi-3D SVG: gradient body, gradient face, a RadialGradient glow behind the
 * whole crest, a specular sliver, and an animated white sheen sweeping across it on a timer.
 * Every one of those is named in the cofounder design doc as the thing to remove — "I don't like
 * the gradient look that we've put across the entire app", "they can't have the vibe-coded glow
 * behind them". The glow was, precisely, a radial gradient behind the badge.
 *
 * NOW a pixel sprite per tier (src/lib/pixel/sprites-crests.ts), which is the app's actual visual
 * identity. The art, the hardware ladder and the reason the web was not copied are documented
 * there; this file is now only mounting and motion.
 *
 * WHAT SURVIVED THE REWRITE, deliberately:
 *   - the public API (`tier`, `size`, `locked`), so no caller moved;
 *   - the fixed box, so the crest cannot resize a hero, a ladder row or a friends row;
 *   - the float, which is what stops the badge looking printed on the card. The design doc
 *     objects to gloss, not to motion;
 *   - `memo`, for the reason the old file gave: SVG is the dominant render cost in the lesson
 *     flow. A crest is still a few hundred rects.
 *
 * WHAT DID NOT: the glint. A white sheen sliding across a surface IS the vibe-coded gloss.
 */
import { memo, useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { CRESTS, CRESTS_LOCKED, PixelSpriteView } from '@/lib/pixel';
import type { Tier } from '@/lib/league';

/** Kept at the old value, not at the sprite's own 24/22, so every existing caller's layout is
 *  byte-identical to before. The sprite centres inside the box. */
const BOX_ASPECT = 1.12;

function LeagueCrestInner({
  tier,
  size = 96,
  locked = false,
}: {
  tier: Tier;
  size?: number;
  /** Tiers not yet reached: drained toward the card surface, but keeping their hue. */
  locked?: boolean;
}) {
  const bob = useSharedValue(0);
  const reduced = useReducedMotion();
  // An unearned tier must not look alive, and reduced motion is honoured the same way every other
  // figure in this app honours it.
  const still = reduced || locked;

  useEffect(() => {
    if (still) return;
    bob.set(
      withRepeat(withTiming(1, { duration: 1900, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
  }, [still, bob]);

  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -3 * bob.get() }] }));

  // Falls back rather than rendering nothing: a tier with no art must still occupy its slot, or
  // the ladder silently loses a rung.
  const sprite = (locked ? CRESTS_LOCKED : CRESTS)[tier.name] ?? CRESTS.Saver;

  return (
    <Animated.View
      style={[
        { width: size, height: size * BOX_ASPECT, alignItems: 'center', justifyContent: 'center' },
        floatStyle,
      ]}>
      <PixelSpriteView sprite={sprite} size={size} />
    </Animated.View>
  );
}

export const LeagueCrest = memo(LeagueCrestInner);
