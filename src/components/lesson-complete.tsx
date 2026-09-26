/**
 * <LessonComplete>: the lesson-complete screen as ONE Atlas moment rising out of the lesson's own
 * path node (design M6, owner decision 5).
 *
 * WHY THIS REPLACES THE OLD STACK. The done block in lesson.tsx layered seven effects on each other:
 * CelebrationWipe, Confetti, CelebrationRays, an Atlas `arrive` entrance plus a celebrate hop, three
 * RewardPop springs and a speech bubble. AGENTS.md asks for "one action-driven, orchestrated moment
 * over scattered ambient effects", and the Brilliant reference (research2/frames/brilliant/hi/
 * complete_01.jpg) is exactly that: the node lights, a beam grows out of it, the mascot rises up the
 * beam, and the words land after. Everything happens in one place on the screen, so the eye never
 * has to hunt between a confetti field, a ray burst and three popping pills.
 *
 * NOTHING THE OLD SCREEN SAID IS LOST. Same title, the same three chips with the same values (XP,
 * the euphorium earned, the streak after today), the same count-up, the coin and flame playing
 * `once`, and Atlas's own line in his own bubble. Only the choreography changed.
 *
 * TIMELINE (COMPLETE_BEATS below, pinned by scripts/lesson-complete-pin.mjs):
 *     0ms  the node, still showing play (the node you tapped to start this lesson)
 *   400ms  the node turns done in its course accent, and the PixelBeam starts growing up out of it
 *   500ms  Atlas rises 32pt out of the node, landing by ~1000ms. The ONLY spring on the screen:
 *          it is a character move, and overshoot is reserved for Atlas and rewards (AGENTS.md).
 *  1100ms  the title
 *  1300ms  one ring of 8 pixel sparkles
 *  1700ms  the reward chips, in one row
 *  1900ms  Atlas's line
 *
 * REDUCED MOTION = THE END STATE. Every value is set to where it finishes, the node is already
 * done, and the chips mount live. Nothing is removed, nothing moves.
 *
 * INTEGRATION (lesson.tsx, done by the integrator): render this inside the existing ScrollView with
 * `styles.introContent` in place of the whole CelebrationWipe/Confetti/CelebrationRays/Atlas/
 * RewardPop/AtlasSpeech block, and drop those imports if nothing else uses them. The Continue
 * button stays in lesson.tsx's footer, so the screen is never blocked by its own animation.
 */
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Atlas } from '@/components/atlas';
import { AtlasSpeech } from '@/components/atlas-speech';
import { PathNode, type PathNodeState } from '@/components/path-node';
import { PixelBeam } from '@/components/pixel-beam';
import { ThemedText } from '@/components/themed-text';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { courseAccent } from '@/lib/course-accents';
import { PixelSpriteView, coin as coinSprite, flame as flameSprite } from '@/lib/pixel';
import { NumberRollup } from '@/shared/motion/number-rollup';
import { Duration, Ease, Spring } from '@/shared/motion/tokens';

// PURE:BEGIN (scripts/lesson-complete-pin.mjs strips the types from this region and runs it, so a
// timeline or ring edit is checked as numbers rather than as a regex over the source.)

/** The one timeline, in ms from mount. Values are design M6's; the pin holds them to it. */
export const COMPLETE_BEATS = {
  node: 0,
  beam: 400,
  atlasFrom: 500,
  atlasTo: 1000,
  title: 1100,
  sparkles: 1300,
  chips: 1700,
  line: 1900,
} as const;

/** How far Atlas rises out of the node, in points (design M6). */
export const ATLAS_RISE = 32;

/**
 * Ring positions for the sparkles, relative to Atlas's centre, rounded to whole points.
 *
 * Offset by half a step (22.5 degrees for 8) so no sparkle sits dead on the vertical axis: one there
 * lands on top of the beam and another on Atlas's crown, and both read as a stray pixel on the
 * character rather than as a ring around him. Rounded because a sparkle centred on a half point
 * blurs its 3pt art pixels into 4pt smears on a 2x or 3x screen.
 */
export function sparkleRing(count: number, radius: number): { x: number; y: number }[] {
  const n = Math.max(1, Math.floor(count));
  return Array.from({ length: n }, (_, i) => {
    const a = ((i + 0.5) / n) * Math.PI * 2;
    return { x: Math.round(Math.cos(a) * radius), y: Math.round(Math.sin(a) * radius) };
  });
}
// PURE:END

/* ── stage geometry ─────────────────────────────────────────────────────────────────────────────
 * Laid out top to bottom: sparkle headroom, Atlas, the beam (whose top passes behind Atlas's base
 * and whose bottom tucks behind the node face), the node. Fixed numbers rather than flex, because
 * the beam has to START inside the node and END under Atlas; with flex the two ends drift apart as
 * soon as Dynamic Type grows anything around the stage. */
const ATLAS = 112;
const ATLAS_H = Math.round(ATLAS * 1.04); // Atlas draws in a 100x104 box (atlas.tsx)
const RING_R = 84;
const ATLAS_TOP = 36;
const ATLAS_CY = ATLAS_TOP + ATLAS_H / 2;
const BEAM_H = 88;
const BEAM_TOP = ATLAS_TOP + ATLAS_H - 24;
const NODE = 72;
const NODE_TOP = BEAM_TOP + BEAM_H - 30;
const STAGE_W = 2 * RING_R + 32;
const STAGE_H = NODE_TOP + NODE + 8;
/** Sparkle art pixel. 3pt keeps a 5x5 sparkle at 15pt, small beside a 112pt Atlas. */
const PX = 3;

/** The five pixels of a small sparkle and the nine of a large one, as [col, row] on a 5x5 grid.
 *  Squares only: a round dot beside pixel sprites reads as a different product (CONSTITUTION 5.5). */
const SMALL: [number, number][] = [[2, 1], [1, 2], [2, 2], [3, 2], [2, 3]];
const LARGE: [number, number][] = [[2, 0], [2, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [2, 3], [2, 4]];

function Sparkle({ x, y, large, color, progress }: {
  x: number; y: number; large: boolean; color: string; progress: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const p = progress.get();
    /* Drifts OUT along its own spoke, 10pt, on a monotonic curve. It never springs: a sparkle is
       light, not a character, and a sparkle overshooting its ring reads as the ring wobbling. */
    const k = (RING_R - 10 + 10 * p) / RING_R;
    return { opacity: p, transform: [{ translateX: x * k }, { translateY: y * k }] };
  });
  const cells = large ? LARGE : SMALL;
  return (
    <Animated.View
      style={[
        styles.sparkle,
        { left: Math.round(STAGE_W / 2 - (5 * PX) / 2), top: Math.round(ATLAS_CY - (5 * PX) / 2) },
        style,
      ]}>
      {cells.map(([c, r]) => (
        <View key={`${String(c)}-${String(r)}`} style={{ position: 'absolute', left: c * PX, top: r * PX, width: PX, height: PX, backgroundColor: color }} />
      ))}
    </Animated.View>
  );
}

export type LessonCompleteProps = {
  /** Picks the node's accent: the finished node wears its course, as it does on the Learn path. */
  courseId: string;
  /** Only for the stage's VoiceOver label. The title stays "Lesson complete!", as before. */
  lessonTitle: string;
  xp: number;
  /** Euphorium earned. lesson.tsx computes it with completeLesson's arithmetic
   *  (min(EARN.lessonMax, EARN.lessonMin + xp)) so the number is never restated here. */
  coins: number;
  /** The streak after today counts, from `streakIfCompletedToday()`. */
  streakDays: number;
  /** Atlas's closing line. */
  line?: string;
  /** Every graded question right first try (lib/combo.ts isPerfect): the title says so. */
  perfect?: boolean;
  /** One quiet line under the chips, e.g. "92% accuracy · Best combo 7". Null hides it. */
  stats?: string | null;
};

export function LessonComplete({
  courseId,
  lessonTitle,
  xp,
  coins,
  streakDays,
  line,
  perfect = false,
  stats = null,
}: LessonCompleteProps) {
  const atlasLine = line ?? (perfect ? 'Not a single miss.' : 'Atlas is proud of you.');
  const theme = useTheme();
  const reduced = useReducedMotion();
  const accent = courseAccent(courseId);

  const rise = useSharedValue(reduced ? 0 : ATLAS_RISE);
  const atlasIn = useSharedValue(reduced ? 1 : 0);
  const titleIn = useSharedValue(reduced ? 1 : 0);
  const ring = useSharedValue(reduced ? 1 : 0);
  const chipsIn = useSharedValue(reduced ? 1 : 0);
  const [nodeLit, setNodeLit] = useState(false);
  /*
   * THE CHIPS MOUNT LIVE AT THEIR BEAT, not at screen mount. NumberRollup counts from 0 on MOUNT,
   * and the coin/flame sprites play `once` on mount. In the old block all three were mounted at
   * t=0 inside RewardPops that only became visible at 1180-1500ms, so the 700ms count had already
   * finished and the coin had already spun while nobody could see them. Re-keying the row when it
   * appears starts both at the moment the eye arrives.
   */
  const [chipsTimer, setChipsTimer] = useState(false);
  // Derived, not set in the effect: Reduce Motion is the end state from the first frame, with no
  // second render in which the node still shows play and the chips are still blank.
  const nodeState: PathNodeState = reduced || nodeLit ? 'done' : 'current';
  const chipsLive = reduced || chipsTimer;

  useEffect(() => {
    if (reduced) {
      // End state, every value. Cancels anything in flight if the setting flips mid-sequence.
      rise.set(0);
      atlasIn.set(1);
      titleIn.set(1);
      ring.set(1);
      chipsIn.set(1);
      return;
    }
    const enter = { duration: Duration.base, easing: Ease.enter };
    atlasIn.set(withDelay(COMPLETE_BEATS.atlasFrom, withTiming(1, { duration: Duration.fast, easing: Ease.enter })));
    // The one overshoot on the screen, and it belongs to Atlas (AGENTS.md). Spring.bouncy carries
    // its own mass, so this does not fall to Reanimated 4's mass-4 default (motion-invariants).
    rise.set(withDelay(COMPLETE_BEATS.atlasFrom, withSpring(0, Spring.bouncy)));
    titleIn.set(withDelay(COMPLETE_BEATS.title, withTiming(1, enter)));
    ring.set(withDelay(COMPLETE_BEATS.sparkles, withTiming(1, { duration: Duration.slow, easing: Ease.out })));
    chipsIn.set(withDelay(COMPLETE_BEATS.chips, withTiming(1, enter)));
    const tNode = setTimeout(() => setNodeLit(true), COMPLETE_BEATS.beam);
    const tChips = setTimeout(() => setChipsTimer(true), COMPLETE_BEATS.chips);
    return () => {
      clearTimeout(tNode);
      clearTimeout(tChips);
    };
  }, [reduced, rise, atlasIn, titleIn, ring, chipsIn]);

  const atlasStyle = useAnimatedStyle(() => ({ opacity: atlasIn.get(), transform: [{ translateY: rise.get() }] }));
  // Text and chips lift 8pt on a monotonic ease. No spring: these are words and numbers, and a
  // number that overshoots its own resting place implies a value it never had.
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleIn.get(), transform: [{ translateY: 8 * (1 - titleIn.get()) }] }));
  const chipsStyle = useAnimatedStyle(() => ({ opacity: chipsIn.get(), transform: [{ translateY: 8 * (1 - chipsIn.get()) }] }));

  const points = sparkleRing(8, RING_R);

  return (
    <View style={styles.root}>
      {/* The stage is ONE VoiceOver stop. PathNode only applies its label when it is pressable, and
          this node is decoration, so without this the lesson's name was announced nowhere and the
          stage read as an unlabelled Atlas button (his tap-to-spin) plus eight hidden sparkles. */}
      <View style={styles.stage} accessible accessibilityRole="image" accessibilityLabel={`${lessonTitle}, complete`}>
        <View style={[styles.abs, { top: BEAM_TOP, left: 0, right: 0, alignItems: 'center' }]} pointerEvents="none">
          {/* PixelBeam reads Reduce Motion itself and renders its bands static, so no branch here. */}
          <PixelBeam bands={5} baseWidth={44} height={BEAM_H} order="up" delay={COMPLETE_BEATS.beam} stagger={50} />
        </View>
        <View style={[styles.abs, { top: NODE_TOP, left: (STAGE_W - NODE) / 2 }]}>
          <PathNode
            state={nodeState}
            size={NODE}
            doneColor={accent}
            accessibilityLabel={`${lessonTitle}, complete`}
          />
        </View>
        <Animated.View style={[styles.abs, { top: ATLAS_TOP, left: (STAGE_W - ATLAS) / 2, width: ATLAS, height: ATLAS_H }, atlasStyle]}>
          <Atlas size={ATLAS} expression="proud" idle />
        </Animated.View>
        <View style={StyleSheet.absoluteFill} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {points.map((p, i) => (
            <Sparkle key={i} x={p.x} y={p.y} large={i % 2 === 0} color={i % 2 === 0 ? theme.iconGold : accent} progress={ring} />
          ))}
        </View>
      </View>

      <Animated.View style={titleStyle}>
        <ThemedText type="display" accessibilityRole="header" maxFontSizeMultiplier={1.6} style={styles.title}>
          {perfect ? 'Perfect lesson!' : 'Lesson complete!'}
        </ThemedText>
      </Animated.View>

      {/* One row. flexWrap stays so the largest Dynamic Type sizes break it onto two lines rather
          than pushing the streak chip off the right edge. */}
      <Animated.View key={chipsLive ? 'live' : 'wait'} style={[styles.rewardRow, chipsStyle]}>
        <View style={[styles.chip, { backgroundColor: theme.primary + '1F', borderColor: theme.primary + '4D' }]}>
          <NumberRollup value={xp} prefix="+" suffix=" XP" duration={700} type="heading" style={{ color: theme.iconLilac, fontSize: FontSize.subhead }} />
        </View>
        <View style={[styles.chip, { backgroundColor: theme.iconGold + '18', borderColor: theme.iconGold + '40' }]}>
          <PixelSpriteView sprite={coinSprite} size={18} play={chipsLive ? 'once' : 'none'} />
          <NumberRollup value={coins} prefix="+" duration={700} type="heading" style={{ color: theme.iconGold, fontSize: FontSize.body }} />
        </View>
        <View style={[styles.chip, { backgroundColor: theme.streak + '18', borderColor: theme.streak + '40' }]}>
          <PixelSpriteView sprite={flameSprite} size={18} play={chipsLive ? 'once' : 'none'} />
          <NumberRollup value={streakDays} suffix=" day streak" duration={700} type="heading" style={{ color: theme.streak, fontSize: FontSize.subhead }} />
        </View>
        {/* Rides the chips beat: one row of numbers, not a second entrance. */}
        {stats ? (
          <ThemedText type="smallBold" themeColor="mutedForeground" style={styles.stats}>{stats}</ThemedText>
        ) : null}
      </Animated.View>

      <View style={styles.line}>
        <AtlasSpeech text={atlasLine} delay={reduced ? 0 : COMPLETE_BEATS.line} tail="top" tailAlign="center" maxWidth={300} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', width: '100%' },
  stage: { width: STAGE_W, height: STAGE_H },
  abs: { position: 'absolute' },
  sparkle: { position: 'absolute', width: 5 * PX, height: 5 * PX },
  title: { textAlign: 'center', marginTop: Spacing.two, paddingHorizontal: Spacing.two },
  rewardRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.two, marginTop: Spacing.three },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.pill, borderWidth: 1 },
  line: { marginTop: Spacing.three, alignItems: 'center' },
  stats: { width: '100%', textAlign: 'center' },
});
