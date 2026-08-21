/**
 * Sheet entrance — a backdrop that FADES and a sheet that SLIDES, on separate curves.
 *
 * WHY THIS EXISTS. All four Modals in the app used `<Modal transparent animationType="slide">`
 * with a full-screen BlurView and a full-screen scrim as `absoluteFill` CHILDREN. React Native
 * applies `animationType` to the native host: `Modal.js` line 333 passes it to
 * `<RCTModalHostView>` and renders `this.props.children` inside, and that host animates as ONE
 * UNIT. Every child therefore travels with the sheet — so the dimming and the blur swept upward
 * like a curtain instead of settling in place, leaving the top of the screen undimmed until the
 * sweep arrived.
 *
 * Every iOS sheet does the opposite: the sheet slides, the backdrop fades. Two layers, two
 * animations. `gate-sheet`'s own comment depends on it — "the point of this sheet is that the
 * user can still SEE what they were reaching for" only reads correctly if the blur settles over
 * the whole screen at once.
 *
 * Plain shared values rather than `entering={}` layout animations, deliberately: Reanimated's
 * layout animations are unreliable inside a native Modal host, and a fix that silently produces
 * NO animation would be worse than the wrong one it replaces.
 *
 * Usage — set `animationType="none"` on the Modal, then:
 *
 *   const { backdrop, sheet } = useSheetEntrance();
 *   <Animated.View style={[StyleSheet.absoluteFill, backdrop]} pointerEvents="box-none">
 *     <BlurView … /><Pressable style={styles.scrim} … />
 *   </Animated.View>
 *   <Animated.View style={[styles.dock, sheet]} pointerEvents="box-none">…</Animated.View>
 */
import { useEffect } from 'react';
import {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Duration, Ease, Spring } from './tokens';

/** Far enough that no sheet starts on screen; it is clipped by the screen edge either way. */
const TRAVEL = 460;

export function useSheetEntrance() {
  const reduced = useReducedMotion();
  // Two clocks on purpose. The backdrop is a plain fade — a scrim that springs would wobble the
  // whole screen's brightness — while the sheet gets the spring that makes it feel physical.
  const dim = useSharedValue(reduced ? 1 : 0);
  const rise = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      dim.set(1);
      rise.set(1);
      return;
    }
    dim.set(withTiming(1, { duration: Duration.base, easing: Ease.out }));
    rise.set(withSpring(1, Spring.smooth));
  }, [reduced, dim, rise]);

  const backdrop = useAnimatedStyle(() => ({ opacity: dim.get() }));
  const sheet = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - rise.get()) * TRAVEL }],
  }));

  return { backdrop, sheet };
}
