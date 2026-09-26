/**
 * <SegmentFinishCard> — the small win between two parts of a lesson.
 *
 * Owner decision: a lesson splits into Learn / Vocab / Practice, and "after a non-final part a
 * small Atlas win with that part's XP and a choice of Keep going or Done for now". The full Atlas
 * lesson-complete moment stays for the final part only.
 *
 * WHY THIS IS ITS OWN OVERLAY AND NOT A VARIANT OF THE DONE SCREEN. Two reasons, and both are
 * defects rather than taste:
 *   1. <LessonComplete> is the finished-lesson moment: a beam out of the path node, a rising
 *      Atlas, a sparkle ring and the euphorium and reward chips. Reusing it three times per lesson
 *      would spend the lesson's one payout moment on a part, and by the real ending there would be
 *      nothing left that the learner had not already seen twice.
 *   2. scripts/anim/drive.py:590 decides a lesson is OVER when the visible labels contain any of
 *      'lesson complete', 'xp earned', 'you earned', 'well done' or '+30 xp'. A part card carrying
 *      any of those would make every automated sweep stop at part 1 and report the lesson passed.
 *      scripts/segment-card-copy-pin.mjs holds that line by RUNNING the copy below, and the 2/1/3
 *      XP weights keep every non-final share under 30 so '+30 XP' can never be rendered.
 *
 * DELIBERATELY SMALLER THAN DONE. No CelebrationWipe, no Confetti, no rays, no springs. One
 * `SemanticMotion event="mastery-increase"`, which is the app's "you moved up a notch" beat. It is
 * NOT 'lesson-complete': the motion audits count that event as a finished lesson, and a part is
 * not one.
 *
 * REDUCED MOTION. SemanticMotion resolves every event immediately under the setting, so the card
 * is simply there. Nothing is removed and no information lives in the movement.
 *
 * WHERE IT SITS. Below the header (`top: LessonDesign.headerHeight`), so the close X and the
 * progress bar stay visible and tappable: leaving from a part card costs nothing, because the part
 * was credited when the card appeared. Above the step body and above the floating Ask Atlas
 * (zIndex 30), so this file's Atlas is the only mascot on screen (CONSTITUTION 5.6).
 *
 * WHO MOUNTS IT. W3/the integrator, as a sibling of <StepModeTransition> and
 * <MasteryChallengeIntro>, and never inside the DONE or STREAK JSX.
 */
import * as Haptics from '@/lib/haptics';
import { useEffect } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';

import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { Button, SlabButton } from '@/components/ui/button';
import { LessonDesign } from '@/constants/lesson-design';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { SegmentKind } from '@/lib/lesson-segments';
import { PixelSpriteView, flame as flameSprite } from '@/lib/pixel';
import { SemanticMotion } from '@/shared/motion/semantic-motion';

// PURE:BEGIN (scripts/segment-card-copy-pin.mjs strips the types from this region and RUNS it, so
// every string the card can render is checked as a VALUE. A regex over the JSX would pass a
// template like `${verb} done` that only assembles a banned phrase at runtime, which is exactly
// the shape drive.py's five done-strings would be smuggled in as.)

/** What comes after this part. `challenge` is a Practice that is the mastery challenge alone. */
export type SegmentNext = SegmentKind | 'challenge';

/** The primary CTA. Straight back into the lesson, no praise, no exclamation mark. */
export const KEEP_GOING = 'Keep going';
/** The quiet way out. The part is already paid, so this is a real choice and not a penalty. */
export const DONE_FOR_NOW = 'Done for now';

/**
 * The heading. "finished", never "complete" or "done": drive.py stops a sweep on 'lesson complete'
 * and on 'well done', and a part is not the lesson.
 */
export function partHeading(partIndex: number, partCount: number): string {
  return `Part ${String(partIndex + 1)} of ${String(partCount)} finished`;
}

/**
 * The subline. It names what is next rather than praising what is past, because the one thing this
 * card has to do is make the next tap obvious.
 *
 * `learn` is in the table for totality. The split rule puts Learn first, so it is never the thing
 * that comes next; a partial table would render `undefined` the day that rule changes.
 */
export const NEXT_LINE: Record<SegmentNext, string> = {
  learn: 'Next: the learn part',
  vocab: 'Next: the vocab',
  practice: 'Next: practice',
  challenge: 'Next: the mastery challenge',
};

export function nextLine(next: SegmentNext): string {
  return NEXT_LINE[next];
}

/** The XP chip. Never reads '+30 XP' because no non-final share reaches 30 (design section 3a). */
export function xpChipLabel(xp: number): string {
  return `+${String(xp)} XP`;
}

/**
 * Whether this card has an XP chip at all.
 *
 * Prevents: rendering "+0 XP". A part pays exactly once, and the store's `(id, kind)` dedupe is
 * what stops a replayed part from farming XP, so it returns `xp: 0` for a part that was already
 * credited. Two shipped routes reach the card in that state: the `?part=` deep link opening a part
 * that is already done (design 4.11), and a card raised again after a remount. "+0 XP" on a screen
 * whose whole job is to report a payout reads as a broken chip, and it invites the learner to
 * think the part they just redid was worth nothing rather than already banked.
 */
export function showsXp(xp: number): boolean {
  return xp > 0;
}

/** The streak chip, in the house wording used by home.tsx, digest.tsx and read-reward.tsx. */
export function streakChipLabel(streak: number): string {
  return `${String(streak)} day streak`;
}

/**
 * What VoiceOver hears when the card appears.
 *
 * Prevents: a VoiceOver user finishing a part and hearing nothing at all. The card takes no focus
 * of its own, exactly like the verdict bar, so the arrival has to be announced.
 */
export function cardAnnouncement(
  partIndex: number,
  partCount: number,
  next: SegmentNext,
  xp: number,
  streakAdvanced: boolean,
  streak: number,
): string {
  const bits = [partHeading(partIndex, partCount)];
  if (showsXp(xp)) bits.push(xpChipLabel(xp));
  if (streakAdvanced) bits.push(streakChipLabel(streak));
  bits.push(nextLine(next));
  return bits.join('. ');
}
// PURE:END

/** CONSTITUTION 5.10 floor. */
const TARGET = 44;

export type SegmentFinishCardProps = {
  /** False renders nothing at all, so the lesson below keeps its own focus order. */
  visible: boolean;
  /** 0-based index of the part that just finished. */
  partIndex: number;
  /** 2 or 3 in the shipped corpus. */
  partCount: number;
  /** The part that just finished. Drives nothing on screen today, and is here so the card can be
   *  read in a screenshot without the caller's state. */
  kind: SegmentKind;
  /** What the Keep going button leads to. */
  nextKind: SegmentNext;
  /** This part's XP share, already paid by the store when the card was raised. */
  xp: number;
  /** True only when THIS credit moved the streak. A second part on the same day does not. */
  streakAdvanced: boolean;
  /** The streak after this credit. Only shown when `streakAdvanced`. */
  streak: number;
  onKeepGoing: () => void;
  onDoneForNow: () => void;
};

export function SegmentFinishCard({
  visible,
  partIndex,
  partCount,
  kind,
  nextKind,
  xp,
  streakAdvanced,
  streak,
  onKeepGoing,
  onDoneForNow,
}: SegmentFinishCardProps) {
  const theme = useTheme();

  useEffect(() => {
    if (!visible) return;
    /*
     * Light, and deliberately lighter than the mastery intro's Medium and than the lesson-complete
     * moment. The hand should be able to tell a part from the end of a lesson without looking,
     * and there are up to two of these per lesson against one ending.
     */
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    AccessibilityInfo.announceForAccessibility(
      cardAnnouncement(partIndex, partCount, nextKind, xp, streakAdvanced, streak),
    );
  }, [visible, partIndex, partCount, nextKind, xp, streakAdvanced, streak]);

  if (!visible) return null;

  return (
    /*
     * accessibilityViewIsModal: without it VoiceOver keeps swiping into the lesson step underneath,
     * which is still mounted, and the learner can answer a question on a screen they cannot see.
     */
    <View
      style={[styles.overlay, { backgroundColor: theme.background }]}
      accessibilityViewIsModal
      testID={`segment-finish-${kind}`}>
      {/* playKey so part 2's card replays the beat rather than inheriting part 1's finished one. */}
      <SemanticMotion event="mastery-increase" playKey={partIndex} style={styles.stage}>
        {/* The only mascot on screen. `interactive={false}`: a tap here must reach a decision, and
            a mascot that spins on tap invites taps that do nothing. */}
        <Atlas size={96} expression="proud" interactive={false} />

        <View style={styles.copy}>
          <ThemedText type="title" style={styles.heading} accessibilityRole="header">
            {partHeading(partIndex, partCount)}
          </ThemedText>
          <ThemedText type="body" themeColor="mutedForeground" style={styles.next}>
            {nextLine(nextKind)}
          </ThemedText>
        </View>

        {/* The chips repeat what the announcement already said, so they are hidden from VoiceOver
            rather than read a second time (CONSTITUTION 5.1). The whole row goes when there is
            nothing to report, so the stage does not keep a gap for an empty strip. */}
        {showsXp(xp) || streakAdvanced ? (
          <View
            style={styles.chips}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants">
            {showsXp(xp) ? (
              <View style={[styles.chip, { backgroundColor: theme.success + '33' }]}>
                <ThemedText type="smallBold" style={{ color: theme.success }}>{xpChipLabel(xp)}</ThemedText>
              </View>
            ) : null}
            {streakAdvanced ? (
              <View style={[styles.chip, styles.streakChip, { backgroundColor: theme.streak + '2E' }]}>
                <PixelSpriteView sprite={flameSprite} size={16} />
                <ThemedText type="smallBold" style={{ color: theme.streak }}>{streakChipLabel(streak)}</ThemedText>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.actions}>
          <SlabButton label={KEEP_GOING} full onPress={onKeepGoing} />
          <Button label={DONE_FOR_NOW} variant="ghost" onPress={onDoneForNow} style={styles.quiet} />
        </View>
      </SemanticMotion>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    /* Clears the header so the close X and the progress bar stay reachable while the card is up. */
    top: LessonDesign.headerHeight,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: LessonDesign.outerGutter,
  },
  stage: { width: '100%', maxWidth: LessonDesign.cta.maxWidth, alignItems: 'center', gap: Spacing.four },
  copy: { alignItems: 'center', gap: Spacing.two },
  heading: { textAlign: 'center' },
  next: { textAlign: 'center' },
  chips: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: Spacing.two },
  chip: { minHeight: 32, paddingHorizontal: Spacing.three, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  streakChip: { flexDirection: 'row', gap: Spacing.two },
  actions: { width: '100%', gap: Spacing.two },
  /* 44pt even though the label is one short line: this is the "leave" half of the only choice on
     the screen, and an easy-to-miss exit is how someone ends up tapping Keep going by accident. */
  quiet: { minHeight: TARGET, alignSelf: 'stretch' },
});
