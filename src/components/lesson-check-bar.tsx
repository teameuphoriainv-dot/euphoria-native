/**
 * The verdict bar: grading that keeps the question on screen.
 *
 * Brilliant's graded frames (research2/frames/brilliant/hi/correct_01.jpg, incorrect_01.jpg): the
 * question and the options stay where they were, and a bar slides up over the footer with the
 * verdict. Today lesson.tsx swaps the whole question for an explanation page, so the learner loses
 * the thing they just answered at the moment they are thinking about it.
 *
 * This file only draws. The rules (which colour, when Try again is offered, whether XP counts) are
 * pure functions in src/lib/answer-layout.ts so scripts/check-bar-pin.mjs can check them.
 *
 * THE INTEGRATOR mounts this INSIDE the choice step, as an absolute overlay on the footer, and keeps
 * the question view mounted while a verdict is up. It passes:
 *   - `verdict` from checkReducer,
 *   - `xp` only when firstTryCounts(attempts) is true (null otherwise, and the chip never shows),
 *   - `onWhy` only when hasExplanationScreen(...) is true; it opens the existing LessonExplanation.
 *
 * MOTION. The bar slides in with withTiming + Ease.out over BAR_IN_MS: it is UI, not a character or
 * a reward, so it gets no spring and no overshoot (AGENTS.md). The XP chip fades in XP_AFTER_MS later
 * as its own beat. Under Reduce Motion the bar is simply there and the chip shows with no delay.
 *
 * ACCESSIBILITY (CONSTITUTION 5.10): every action is a button of at least 44pt, the verdict is
 * announced when it changes, and the verdict is said in words and an icon, never by hue alone.
 */
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Button, SlabButton } from '@/components/ui/button';
import { UIcon } from '@/components/ui-icon';
import { LessonColors, LessonDesign } from '@/constants/lesson-design';
import {
  BAR_IN_MS,
  VERDICT_TITLE,
  VERDICT_TONE,
  XP_AFTER_MS,
  type Verdict,
} from '@/lib/answer-layout';
import { Duration, Ease } from '@/shared/motion/tokens';

/** CONSTITUTION 5.10 floor. */
const TARGET = 44;
/**
 * Where the bar starts before it has measured itself. Far enough below any bar's real height that
 * the first frame is off screen.
 *
 * Prevents: a one-frame flash of the bar in its final spot before onLayout reports a height to
 * slide from.
 */
const UNMEASURED_OFFSET = 600;

export type LessonCheckBarProps = {
  /** Null hides the bar and the footer underneath shows as normal. */
  verdict: Verdict | null;
  /** XP earned by this question. Pass null unless firstTryCounts(attempts) is true. */
  xp?: number | null;
  /** The right option's text, shown once the answer is revealed. */
  correctAnswer?: string;
  onContinue: () => void;
  onTryAgain: () => void;
  onSeeAnswer: () => void;
  /** Omit when there is nothing authored to explain; the Why? button is then not drawn. */
  onWhy?: () => void;
  /** Home-indicator inset, so the buttons clear it. */
  bottomInset?: number;
  /**
   * The bar's measured height, reported every time it changes, and 0 once the bar is gone.
   *
   * Prevents: the bar hiding the last option of a stacked question. The bar is an absolute overlay,
   * so the question below it reserves room with a fixed padding (FOOTER_CLEARANCE, 170pt in
   * lesson.tsx). The 'answer' bar carries an extra line for the correct answer and grows past that
   * at large Dynamic Type, and the options then cannot be scrolled clear of it. The integrator
   * pads the question by THIS number instead of trusting the constant.
   */
  onHeightChange?: (height: number) => void;
};

export function LessonCheckBar({
  verdict,
  xp = null,
  correctAnswer,
  onContinue,
  onTryAgain,
  onSeeAnswer,
  onWhy,
  bottomInset = 0,
  onHeightChange,
}: LessonCheckBarProps) {
  const reduced = useReducedMotion();
  const shown = useSharedValue(0);
  const xpIn = useSharedValue(0);
  /** The bar's own height, measured on the UI thread's layout pass for THIS showing. */
  const measured = useSharedValue(UNMEASURED_OFFSET);
  /** Whether this showing's slide has started. Reset each time the bar goes away. */
  const started = useRef(false);
  const up = verdict !== null;

  // Hide resets everything, so the next showing measures itself again.
  useEffect(() => {
    if (up) return;
    shown.set(0);
    measured.set(UNMEASURED_OFFSET);
    started.current = false;
    // The question keeps its padding from this number, so a hidden bar must report nothing at all
    // or every later step would keep reserving room for a bar that is not on screen.
    onHeightChange?.(0);
  }, [up, shown, measured, onHeightChange]);

  // The slide starts from onLayout, not from an effect.
  //
  // Prevents: two different defects of starting in an effect with a remembered height.
  //   - First showing: the slide ran from UNMEASURED_OFFSET, then onLayout swapped in the real height
  //     mid-flight, so the bar could jump. Ease.out is steep, so a jump would land while it is on screen.
  //   - retry, Try again, then a second miss: the 'answer' bar is a line taller than the 'retry' bar,
  //     and sliding it from the retry bar's height would let the answer line peek in on the first frame.
  // retry -> answer does NOT re-slide: `started` is still true, the bar changes colour in place.
  // Sliding it out and back would read as a second, different question being graded.
  const onLayout = (e: LayoutChangeEvent) => {
    measured.set(e.nativeEvent.layout.height);
    // retry -> answer grows the bar by a line; this fires again, so the question's reserved room
    // follows the bar rather than the height it first had.
    onHeightChange?.(e.nativeEvent.layout.height);
    if (started.current) return;
    started.current = true;
    shown.set(reduced ? 1 : withTiming(1, { duration: BAR_IN_MS, easing: Ease.out }));
  };

  const showXp = verdict === 'correct' && typeof xp === 'number' && xp > 0;
  useEffect(() => {
    if (!showXp) {
      xpIn.set(0);
      return;
    }
    xpIn.set(reduced ? 1 : withDelay(XP_AFTER_MS, withTiming(1, { duration: Duration.fast, easing: Ease.out })));
  }, [showXp, reduced, xpIn]);

  // Prevents: a VoiceOver user checking an answer and hearing nothing, because the verdict appears
  // in a bar that never takes focus.
  useEffect(() => {
    if (!verdict) return;
    const said = verdict === 'answer' && correctAnswer
      ? `${VERDICT_TITLE.answer}: ${correctAnswer}`
      : VERDICT_TITLE[verdict];
    AccessibilityInfo.announceForAccessibility(said);
  }, [verdict, correctAnswer]);

  const slide = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - shown.get()) * measured.get() }],
  }));
  const chip = useAnimatedStyle(() => ({ opacity: xpIn.get() }));

  if (!verdict) return null;

  const tone = LessonColors[VERDICT_TONE[verdict]];

  return (
    <Animated.View
      onLayout={onLayout}
      // No accessibilityLiveRegion: the effect above already announces the verdict, and a live
      // region on top of it would make TalkBack read every verdict twice.
      style={[styles.bar, { borderTopColor: tone, paddingBottom: 16 + bottomInset }, slide]}
    >
      {/* Tint on its own layer so the bar stays opaque over the footer it covers. */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: tone + '1A' }]} />

      <View style={styles.head}>
        <View style={styles.titleRow} accessible accessibilityRole="header">
          <UIcon name={verdict === 'correct' ? 'check' : 'target'} size={22} color={tone} strokeWidth={3} />
          <ThemedText type="heading" style={[styles.title, { color: tone }]}>{VERDICT_TITLE[verdict]}</ThemedText>
        </View>
        {showXp ? (
          <Animated.View style={[styles.xpChip, chip]} accessible accessibilityLabel={`Plus ${String(xp)} XP`}>
            <ThemedText type="smallBold" style={styles.xpText}>{`+${String(xp)} XP`}</ThemedText>
          </Animated.View>
        ) : null}
      </View>

      {verdict === 'answer' && correctAnswer ? (
        <ThemedText type="bodyMedium" style={styles.answer}>{correctAnswer}</ThemedText>
      ) : null}

      {verdict === 'retry' ? (
        <View style={styles.actions}>
          <Button label="See answer" variant="outline" onPress={onSeeAnswer} style={styles.secondary} />
          <View style={styles.primary}>
            <SlabButton label="Try again" full onPress={onTryAgain} />
          </View>
        </View>
      ) : (
        <View style={styles.actions}>
          {onWhy ? <Button label="Why?" variant="outline" onPress={onWhy} style={styles.secondary} /> : null}
          <View style={styles.primary}>
            <SlabButton label="Continue" full onPress={onContinue} />
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: LessonColors.cardElevated,
    borderTopWidth: 2,
    paddingTop: 16,
    paddingHorizontal: LessonDesign.outerGutter,
    gap: 12,
    overflow: 'hidden',
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1, minHeight: TARGET },
  title: { flexShrink: 1 },
  xpChip: {
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: LessonDesign.radius.sm,
    backgroundColor: LessonColors.success + '33',
    justifyContent: 'center',
  },
  xpText: { color: LessonColors.success },
  answer: { color: LessonColors.text },
  actions: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  secondary: { minHeight: TARGET, minWidth: 104 },
  primary: { flex: 1 },
});
