/**
 * Path assembly: the onboarding loader, where the learner watches their own answers build the path.
 *
 * WHY IT REPLACES LoaderStep. The old loader was a determinate ring with three generic status lines
 * ("Matching courses to your goal…"). It said work was being done without showing any of it, and
 * the very next screen then listed three courses as if they came from nowhere. Every pick already
 * knows which answer earned it (`source`/`answer` on PathPick), so the loader shows exactly that:
 * the sprite of the option you tapped rises into a course node and lights it in that course's
 * accent (design.md §1.2 step 10).
 *
 * REBUILT 2026-09-30 (owner: "path building animation needs work"). The first version faded three
 * sockets in at once and slid three sprites up; it read as a form loading. Now the path DRAWS
 * ITSELF, one node at a time, on one clock:
 *
 *   the dots step toward the next slot, the socket drops in, the answer sprite rises into it, the
 *   node lights in its course accent with a pixel burst, and the COURSE NAME lands under it.
 *
 * The name is the substance: before, the screen showed 1 2 3 and told you nothing; now each node
 * says what your answer built, so the reveal that follows is a confirmation, not a surprise.
 *
 * ONE CLOCK, NOT TWELVE TIMERS. `clock` runs 0 to 1 over TOTAL_MS on the UI thread and every
 * element reads its own window off it, so the beats cannot drift apart and Reduce Motion is a
 * clock parked at 1: the finished path, at once, and onDone straight away, as before.
 *
 * Only the status line and onDone use JS timers, because text is React state.
 *
 * ATLAS IS NOT DRAWN HERE. The onboarding AtlasStage above the step switch already shows him, and
 * the sprites below are the learner's answers, so this screen keeps one mascot.
 */
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { PathNode } from '@/components/path-node';
import { PixelBurst } from '@/components/pixel-burst';
import { ThemedText } from '@/components/themed-text';
import { FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { courseAccent } from '@/lib/course-accents';
import { pickOption, type PathPick, type PathSource } from '@/lib/onboarding-path';
import { PixelSpriteView, type PixelSprite } from '@/lib/pixel';
import { Duration } from '@/shared/motion/tokens';

/** The shape of one onboarding option. Choice from onboarding-parts satisfies it. */
export type AnswerOption = { key: string; icon?: PixelSprite };

/** The same length as the old Duration.count * 3, so the reveal lands when it did. */
const TOTAL_MS = Duration.count * 3; // 2700
/** When slot i starts building, measured from mount. */
const SLOT_MS = 160;
const SLOT_GAP_MS = 760;
/** Inside a slot: the dots ahead of it, the socket, the rise, the light, the burst, the name. */
const DOTS_LEAD_MS = 200;
const SOCKET_MS = 220;
const RISE_FROM_MS = 140;
const RISE_MS = 340;
const LIGHT_MS = 180;
const BURST_MS = 480;
const NAME_FROM_MS = 80;
const NAME_MS = 240;
const RISE_PT = 26;
const NODE = 56;
const SPRITE = 32;
const COLUMN = 94;
const DOT = 4;
const DOTS = 3;

const slotStart = (i: number) => SLOT_MS + i * SLOT_GAP_MS;
/** When pick i's node lights, measured from mount. */
const lightAt = (i: number) => slotStart(i) + RISE_FROM_MS + RISE_MS;
/** A moment in ms as a fraction of the clock. */
const at = (ms: number) => ms / TOTAL_MS;

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
  const clock = useSharedValue(reduced ? 1 : 0);
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
    clock.set(withTiming(1, { duration: TOTAL_MS, easing: Easing.linear }));
    const timers = picks.map((_, i) => setTimeout(() => setLit(i + 1), lightAt(i)));
    timers.push(setTimeout(() => done.current(), TOTAL_MS + Duration.base));
    return () => timers.forEach(clearTimeout);
    // mount-only: re-running would restart the path build mid-flight
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const line = lit > 0 ? lines[Math.min(lit, lines.length) - 1] : lines[0];

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {picks.map((pick, i) => (
          <View key={pick.course.id} style={styles.slot}>
            {i > 0 ? <PixelDots clock={clock} start={slotStart(i) - DOTS_LEAD_MS} /> : null}
            <PickColumn
              pick={pick}
              index={i}
              sprite={pickOption(pick, options)?.icon ?? null}
              clock={clock}
            />
          </View>
        ))}
      </View>
      <View style={styles.words}>
        <ThemedText type="display" style={styles.title}>Building your plan</ThemedText>
        <ThemedText type="body" themeColor="mutedForeground" style={styles.line}>{line}</ThemedText>
      </View>
    </View>
  );
}

/**
 * One course: the socket, the answer sprite rising into it, the lit node over the unlit one, the
 * burst, and the course name.
 *
 * The lit node is a SECOND PathNode faded in over the unlit one, rather than one node whose colour
 * animates, because PathNode takes plain colours: interpolating the face would need an animated
 * rewrite of a component Home and Learn share.
 */
function PickColumn({
  pick,
  index,
  sprite,
  clock,
}: {
  pick: PathPick;
  index: number;
  sprite: PixelSprite | null;
  clock: SharedValue<number>;
}) {
  const start = slotStart(index);
  const socketFrom = at(start);
  const socketTo = at(start + SOCKET_MS);
  const riseFrom = at(start + RISE_FROM_MS);
  const riseTo = at(start + RISE_FROM_MS + RISE_MS);
  const lightFrom = riseTo;
  const lightTo = at(start + RISE_FROM_MS + RISE_MS + LIGHT_MS);
  const burstTo = at(start + RISE_FROM_MS + RISE_MS + BURST_MS);
  const nameFrom = at(start + RISE_FROM_MS + RISE_MS + NAME_FROM_MS);
  const nameTo = at(start + RISE_FROM_MS + RISE_MS + NAME_FROM_MS + NAME_MS);
  const accent = courseAccent(pick.course.id);

  // Every curve here is monotonic (Easing.out stays at or below 1): a socket that overshoots or a
  // sprite that bounces past the node reads as a reward, and the reward is the reveal's.
  const socketStyle = useAnimatedStyle(() => {
    const p = Easing.out(Easing.cubic)(interpolate(clock.get(), [socketFrom, socketTo], [0, 1], 'clamp'));
    return { opacity: p, transform: [{ scale: 0.7 + 0.3 * p }] };
  });
  const riseStyle = useAnimatedStyle(() => {
    const p = Easing.out(Easing.cubic)(interpolate(clock.get(), [riseFrom, riseTo], [0, 1], 'clamp'));
    return { opacity: p, transform: [{ translateY: RISE_PT * (1 - p) }] };
  });
  const lightStyle = useAnimatedStyle(() => ({
    opacity: interpolate(clock.get(), [lightFrom, lightTo], [0, 1], 'clamp'),
  }));
  const nameStyle = useAnimatedStyle(() => {
    const p = Easing.out(Easing.cubic)(interpolate(clock.get(), [nameFrom, nameTo], [0, 1], 'clamp'));
    return { opacity: p, transform: [{ translateY: 6 * (1 - p) }] };
  });
  const n = String(index + 1);

  return (
    <View style={styles.column} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={[styles.nodeBox, socketStyle]}>
        <PathNode state="upcoming" size={NODE} label={n} accessibilityLabel={pick.course.title} />
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, lightStyle]}>
          <PathNode state="done" size={NODE} label={n} doneColor={accent} accessibilityLabel={pick.course.title} />
        </Animated.View>
        <PixelBurst clock={clock} from={lightFrom} to={burstTo} color={accent} radius={NODE / 2 + 4} spread={20} size={NODE} />
      </Animated.View>
      <Animated.View style={[styles.spriteBox, riseStyle]}>
        {/* An empty socket, not a stand-in icon, when the pick cites no answer: a generic sprite
            here would claim the learner chose something they did not (see PathPick). */}
        {sprite ? <PixelSpriteView sprite={sprite} size={SPRITE} /> : null}
      </Animated.View>
      <Animated.View style={nameStyle}>
        <ThemedText type="small" numberOfLines={2} style={[styles.name, { color: accent }]}>{pick.course.title}</ThemedText>
      </Animated.View>
    </View>
  );
}

/** The dotted pixel path between nodes, lighting one cell at a time toward the next slot. Square
 *  cells on the grid, no round caps (§5.5). */
function PixelDots({ clock, start }: { clock: SharedValue<number>; start: number }) {
  const theme = useTheme();
  const step = (DOTS_LEAD_MS - 20) / DOTS;
  return (
    <View style={styles.dots}>
      {Array.from({ length: DOTS }, (_, d) => (
        <Dot key={d} clock={clock} from={at(start + d * step)} to={at(start + (d + 1) * step)} color={theme.border} />
      ))}
    </View>
  );
}

function Dot({ clock, from, to, color }: { clock: SharedValue<number>; from: number; to: number; color: string }) {
  const style = useAnimatedStyle(() => ({ opacity: interpolate(clock.get(), [from, to], [0.18, 1], 'clamp') }));
  return <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.four },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  slot: { flexDirection: 'row', alignItems: 'flex-start' },
  column: { width: COLUMN, alignItems: 'center' },
  // Room under the node for the lip, which PathNode draws below its face.
  nodeBox: { width: NODE, height: NODE + 6 },
  // Starts RISE_PT + 8 below the node so the risen sprite stops 8pt short of the lip, not on it.
  spriteBox: { width: SPRITE, height: SPRITE, marginTop: RISE_PT + 8 },
  name: { textAlign: 'center', marginTop: Spacing.two, fontSize: FontSize.label, lineHeight: 16 },
  dots: { flexDirection: 'row', gap: DOT + 2, marginTop: NODE / 2 - DOT / 2, marginHorizontal: 2 },
  dot: { width: DOT, height: DOT },
  words: { alignItems: 'center' },
  title: { textAlign: 'center' },
  line: { textAlign: 'center', minHeight: 24, marginTop: Spacing.two },
});
