/**
 * Path assembly: the onboarding loader, rebuilt so the learner watches their own answers build the
 * path instead of watching a ring fill.
 *
 * WHY IT REPLACES LoaderStep. The old loader was a determinate ring with three generic status lines
 * ("Matching courses to your goal…"). It said work was being done without showing any of it, and
 * the very next screen then listed three courses as if they came from nowhere. Every pick already
 * knows which answer earned it (`source`/`answer` on PathPick), so the loader shows exactly that:
 * the sprite of the option you tapped rises into a course node and lights it in that course's
 * accent (design.md §1.2 step 10).
 *
 * TIMELINE (2700ms, the same length as the old Duration.count * 3, so the reveal lands when it did):
 *   0-240      sockets fade in
 *   300 + 600i sprite i rises 24pt, 320ms, Ease.out (monotonic: this is a data beat, not a reward)
 *   +320       node i lights to courseAccent over 200ms, and the status line advances
 *   2700       hold, then onDone at 2700 + Duration.base, as before
 *
 * REDUCED MOTION renders the finished state and calls onDone straight away, which is the path the
 * old loader already took, so nobody who asked for less motion sits through a 3 second beat.
 *
 * ATLAS IS NOT DRAWN HERE. The onboarding AtlasStage above the step switch already shows him, and
 * the sprites below are the learner's answers, so this screen keeps one mascot.
 */
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { PathNode } from '@/components/path-node';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { courseAccent } from '@/lib/course-accents';
import { pickOption, type PathPick, type PathSource } from '@/lib/onboarding-path';
import { PixelSpriteView, type PixelSprite } from '@/lib/pixel';
import { Duration, Ease } from '@/shared/motion/tokens';

/** The shape of one onboarding option. Choice from onboarding-parts satisfies it. */
export type AnswerOption = { key: string; icon?: PixelSprite };

const TOTAL_MS = Duration.count * 3; // 2700
const SOCKETS_IN_MS = 240;
const FIRST_RISE_MS = 300;
const RISE_GAP_MS = 600;
const RISE_MS = 320;
const LIGHT_MS = 200;
const RISE_PT = 24;
const NODE = 56;
const SPRITE = 32;

/** When pick i's node lights, measured from mount. */
const lightAt = (i: number) => FIRST_RISE_MS + i * RISE_GAP_MS + RISE_MS;

export function PathAssemblyLoader({
  picks,
  options,
  lines,
  onDone,
}: {
  picks: PathPick[];
  /** The screen's own option lists, keyed by answer field, so each pick finds the sprite it cites. */
  options: Partial<Record<PathSource, readonly AnswerOption[]>>;
  /** One status line per pick, shown as that pick's node lights. */
  lines: string[];
  onDone: () => void;
}) {
  const reduced = useReducedMotion();
  const sockets = useSharedValue(reduced ? 1 : 0);
  const [lit, setLit] = useState(reduced ? picks.length : 0);
  /* A ref, not the prop: the timers are armed once on mount, and a parent re-render that hands in
   * a new onDone closure must not leave a stale one to fire at 2.98s. */
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  useEffect(() => {
    // One announcement for the whole beat. Announcing each node would stack three utterances on
    // top of the status line changes and VoiceOver would still be talking when the reveal opens.
    AccessibilityInfo.announceForAccessibility(`Your path: ${picks.map((p) => p.course.title).join(', ')}.`);
    if (reduced) {
      done.current();
      return;
    }
    sockets.set(withTiming(1, { duration: SOCKETS_IN_MS, easing: Ease.out }));
    const timers = picks.map((_, i) => setTimeout(() => setLit(i + 1), lightAt(i)));
    timers.push(setTimeout(() => done.current(), TOTAL_MS + Duration.base));
    return () => timers.forEach(clearTimeout);
    // mount-only: re-running would restart the path build mid-flight
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const socketsIn = useAnimatedStyle(() => ({ opacity: sockets.get() }));
  const line = lit > 0 ? lines[Math.min(lit, lines.length) - 1] : lines[0];

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.row, socketsIn]}>
        {picks.map((pick, i) => (
          <View key={pick.course.id} style={styles.slot}>
            {i > 0 ? <PixelDots /> : null}
            <PickColumn
              pick={pick}
              index={i}
              sprite={pickOption(pick, options)?.icon ?? null}
              reduced={reduced}
            />
          </View>
        ))}
      </Animated.View>
      <ThemedText type="display" style={styles.title}>Building your plan</ThemedText>
      <ThemedText type="body" themeColor="mutedForeground" style={styles.line}>{line}</ThemedText>
    </View>
  );
}

/**
 * One course: an unlit numbered node, the answer sprite under it, and the lit node on top.
 *
 * The lit node is a SECOND PathNode faded in over the unlit one, rather than one node whose colour
 * animates, because PathNode takes plain colours: interpolating the face would need an animated
 * rewrite of a component Home and Learn share.
 */
function PickColumn({
  pick,
  index,
  sprite,
  reduced,
}: {
  pick: PathPick;
  index: number;
  sprite: PixelSprite | null;
  reduced: boolean;
}) {
  const rise = useSharedValue(reduced ? 1 : 0);
  const light = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;
    const start = FIRST_RISE_MS + index * RISE_GAP_MS;
    // withTiming + Ease.out, never a spring: Ease.out's control points stay at or below 1, so the
    // sprite lands and stops rather than bouncing past the node it is meant to meet.
    rise.set(withDelay(start, withTiming(1, { duration: RISE_MS, easing: Ease.out })));
    light.set(withDelay(start + RISE_MS, withTiming(1, { duration: LIGHT_MS, easing: Ease.out })));
    // mount-only, same reason as the parent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const riseStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -RISE_PT * rise.get() }] }));
  const lightStyle = useAnimatedStyle(() => ({ opacity: light.get() }));
  const n = String(index + 1);

  return (
    <View style={styles.column} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.nodeBox}>
        <PathNode state="upcoming" size={NODE} label={n} accessibilityLabel={pick.course.title} />
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, lightStyle]}>
          <PathNode state="done" size={NODE} label={n} doneColor={courseAccent(pick.course.id)} accessibilityLabel={pick.course.title} />
        </Animated.View>
      </View>
      <Animated.View style={[styles.spriteBox, riseStyle]}>
        {/* An empty socket, not a stand-in icon, when the pick cites no answer: a generic sprite
            here would claim the learner chose something they did not (see PathPick). */}
        {sprite ? <PixelSpriteView sprite={sprite} size={SPRITE} /> : null}
      </Animated.View>
    </View>
  );
}

/** The dotted pixel path between nodes: square cells on the grid, no round caps (§5.5). */
function PixelDots() {
  const theme = useTheme();
  return (
    <View style={styles.dots}>
      {[0, 1, 2].map((d) => (
        <View key={d} style={[styles.dot, { backgroundColor: theme.border }]} />
      ))}
    </View>
  );
}

const DOT = 4;
const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  slot: { flexDirection: 'row', alignItems: 'flex-start' },
  column: { width: NODE + 8, alignItems: 'center' },
  // Room under the node for the lip, which PathNode draws below its face.
  nodeBox: { width: NODE, height: NODE + 6 },
  // Starts RISE_PT + 8 below the node so the risen sprite stops 8pt short of the lip, not on it.
  spriteBox: { width: SPRITE, height: SPRITE, marginTop: RISE_PT + 8 },
  dots: { flexDirection: 'row', gap: DOT + 2, marginTop: NODE / 2 - DOT / 2, marginHorizontal: 2 },
  dot: { width: DOT, height: DOT },
  title: { textAlign: 'center' },
  line: { textAlign: 'center', minHeight: 24 },
});
