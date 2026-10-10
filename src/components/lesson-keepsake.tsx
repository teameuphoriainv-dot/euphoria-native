/**
 * <LessonKeepsake> is the lesson's own piece of art on the lesson-complete screen.
 *
 * IT ARRIVES LAST. lesson-complete.tsx runs one choreography (node, beam, Atlas, title, sparkles,
 * chips, line) and its last beat is Atlas's line at 1900ms. The keepsake rises in after that line
 * has started, so it is the final thing to appear and never competes with Atlas's rise.
 *
 * It lives beside LessonComplete, not inside it: that component is pinned to one spring and no
 * looping animation (scripts/lesson-complete-pin.mjs), and the keepsake keeps moving once it has
 * arrived (owner, 2026-09-29: lesson art is always moving).
 */
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { COMPLETE_BEATS } from '@/components/lesson-complete';
import { PixelSceneView } from '@/components/pixel-scene-view';
import { Spacing } from '@/constants/theme';
import type { SceneArt } from '@/lib/pixel/scenes';

/**
 * 3 points per art pixel, not the opener's 4. Measured on the 874pt iPhone 17 (2026-09-29): at 4
 * the 160pt keepsake ran 10pt under the Continue button; at 3 it is 120pt and clears it by 30pt.
 */
const KEEPSAKE_SCALE = 3;

/** After Atlas's line has begun to type. */
const KEEPSAKE_AT = COMPLETE_BEATS.line + 500;

export function LessonKeepsake({ art }: { art: SceneArt }) {
  const reduced = useReducedMotion();
  const arrive = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      arrive.set(1);
      return;
    }
    arrive.set(withDelay(KEEPSAKE_AT, withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) })));
  }, [reduced, arrive]);

  const style = useAnimatedStyle(() => ({
    opacity: arrive.get(),
    transform: [{ translateY: 12 * (1 - arrive.get()) }],
  }));

  return (
    <Animated.View style={[styles.root, style]}>
      <PixelSceneView art={art} scale={KEEPSAKE_SCALE} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', marginTop: Spacing.four },
});
