/**
 * <LessonSegmentBar> — the lesson header progress bar, cut into one track per part.
 *
 * WHAT IT REPLACES AND HOW. lesson.tsx draws `<View style={styles.track}><LessonProgress …/></View>`:
 * one 8pt pill with a violet fill. This component draws the WHOLE row, its own tracks included, so
 * W3 replaces that wrapper View as well as the fill.
 *
 *   before   <View style={styles.track}><LessonProgress percent={progressPercent} /></View>
 *   after    <LessonSegmentBar fills={segmentedProgress(segments, idx, phase)} />
 *
 * Prevents: leaving it INSIDE `styles.track`. That View is `overflow: 'hidden'` with its own
 * translucent-white background, so the gaps between the part tracks would show that background and
 * an empty part would be indistinguishable from the gap beside it. The cut has to be drawn by
 * whatever owns the background.
 *
 * THE GLOBAL `N/M` LABEL BESIDE IT DOES NOT CHANGE. It still counts the whole lesson (design
 * section 4.7). A per-part count would go backwards at every part boundary, and
 * `scripts/anim/drive.py:577-583` fails any run whose authored step number goes down.
 *
 * REPLAY runs keep the single `LessonProgress` bar: the segment layer is off there (owner
 * decision), and a segmented bar on a run with no part cards would promise breaks that never come.
 *
 * MOTION. Width only, `withTiming`, no spring: this is UI reporting a number, not a character or a
 * reward (AGENTS.md). Under Reduce Motion each track is simply set to its value with no tween,
 * which is the end state and loses nothing.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Duration } from '@/shared/motion/tokens';

/** Matches `styles.track` in lesson.tsx, so swapping the bar in does not move the header. */
const TRACK_H = 8;
/**
 * Gap between part tracks, in points.
 *
 * MEASURED against lesson.tsx's header on an iPhone 17 Pro (402pt wide): 32 of `paddingHorizontal`,
 * 24 of row `gap`, the 92pt close-plus-back cluster (two 40pt buttons and their 12pt gap) and the
 * 60pt `stepLabel` leave the bar 194pt. Two 6pt gaps then put each of three tracks at 60.7pt,
 * which is still long enough that a part one screen in reads as started rather than empty.
 *
 * 6 and not 2: at 2 the gap is a quarter of the 8pt track height and reads as a rendering seam
 * rather than as a deliberate cut, which is the whole point of splitting the bar.
 */
const GAP = 6;

/**
 * The unfilled part track.
 *
 * A LITERAL, NOT `theme.border`, AND THAT IS THE POINT. This bar lives in lesson.tsx's header,
 * which is dark chrome in BOTH palettes by construction and not a themed surface: the header
 * stacks a `<BlurView tint="dark">`, a `rgba(7,3,15,0.7)` tint, a `rgba(139,92,246,0.1)` bottom
 * border and its own grey step-label literal, none of which consult the theme.
 *
 * Prevents: painting the empty tracks with `theme.border`. That token is a dark grey in the dark
 * palette but a NEAR-WHITE in the light one, and over this composited dark header the light value
 * carries roughly four times the relative luminance of the `theme.primary` fill beside it (0.78
 * against 0.18). With Light Mode on (Preferences, N22) an EMPTY part would then read brighter than
 * a finished one and the bar would announce the opposite of the truth. `theme.border` stays
 * correct in <SegmentRing>, whose two call sites are themed surfaces.
 *
 * 0.14 rather than the 0.08 of the single `styles.track` this replaces: 0.14 is the value the
 * lesson's own dark chrome already uses for a line that has to read on this exact header
 * (mastery-challenge-intro.tsx's bubble and tail borders), and a track cut into three no longer
 * has the full header width to register across.
 */
const TRACK_EMPTY = 'rgba(255,255,255,0.14)';

/**
 * One part's track. Its own component, and therefore its own hooks, because `fills.length` changes
 * between a 2-part and a 3-part lesson.
 *
 * Prevents: calling useSharedValue inside a .map() in the parent. React counts hooks per render,
 * so going from a 3-part lesson to a 2-part one without an unmount in between throws "rendered
 * fewer hooks than expected" and takes the whole lesson screen down. As its own component each
 * track has a constant hook count, and a lesson with one part fewer simply unmounts the last one.
 */
function SegmentFill({ fill, from, to, track }: { fill: number; from: string; to: string; track: string }) {
  const reduced = useReducedMotion();
  const pct = Math.max(0, Math.min(1, fill)) * 100;
  const width = useSharedValue(pct);

  useEffect(() => {
    /* Duration.slow is 400, which is the literal LessonProgress has used since the header shipped,
       and no easing is passed for the same reason: this bar must feel like the one it replaces,
       not like a new element that happens to sit in the same slot. */
    width.set(reduced ? pct : withTiming(pct, { duration: Duration.slow }));
  }, [pct, reduced, width]);

  /* `${n}%` and NOT `${String(n)}%`: React Native types width as DimensionValue, which accepts the
     template literal type `${number}%` but not a plain `${string}%`. Wrapping the number in
     String() is what makes tsc reject the style, and it took the whole animated style down with
     it. LessonProgress in lesson.tsx interpolates the number the same way. */
  const style = useAnimatedStyle(() => ({ width: `${width.get()}%` }));

  return (
    <View style={[styles.track, { backgroundColor: track }]}>
      <Animated.View style={[styles.fill, style]}>
        <LinearGradient colors={[from, to]} start={START} end={END} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}

const START = { x: 0, y: 0 };
const END = { x: 1, y: 0 };

export function LessonSegmentBar({ fills }: { fills: readonly number[] }) {
  const theme = useTheme();

  return (
    /* Decorative. The eyebrow ("LEARN . PART 1 OF 3", W3) and the `N/M` label already say both
       facts in words, and CONSTITUTION 5.1 is "say a thing once". */
    <View
      style={styles.row}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      {fills.map((f, i) => (
        <SegmentFill
          key={i}
          fill={f}
          from={theme.primary}
          to={theme.accent}
          track={TRACK_EMPTY}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: GAP },
  /* Each part gets the SAME width, not a share weighted by its screen count. A Practice with 11
     screens beside a Vocab with 1 would otherwise render as a hairline next to a slab, and the
     bar's job here is "three parts, this one is second", not "how long each part is". */
  track: { flex: 1, height: TRACK_H, borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { height: TRACK_H, borderRadius: Radius.pill, overflow: 'hidden' },
});
