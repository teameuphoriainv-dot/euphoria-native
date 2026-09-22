/**
 * LeaveLessonSheet — the second ask before a lesson is abandoned.
 *
 * The X in the lesson header used to exit on the first tap, which made the most destructive control
 * on the screen the cheapest one to hit: it sits 44pt from the progress bar, it is the first thing
 * a thumb reaches, and a lesson left at step 4 of 9 is one the learner has to restart the reading
 * for. This sheet costs one tap to get past and turns an accident into a decision.
 *
 * It is NOT a retention wall, and the distinction is the whole design:
 *   - leaving is ONE tap and the leave control is plainly labelled
 *   - no offer, no price, no streak threat, nothing that makes staying feel coerced
 *   - the sub-line states the fact that actually settles the question: the place is saved
 * A confirmation that argues is a trap, and a trap on the exit of a teaching screen is what the
 * one-star reviews in this category are about.
 *
 * Sad Atlas rather than the neutral mark, because the mascot is the one element in the app that can
 * carry "this is a shame" without the copy having to say it. Structure and motion follow
 * gate-sheet.tsx (bottom dock, mark straddling the top edge, useSheetEntrance), so this reads as the
 * same object as every other sheet rather than a new kind of alert.
 */
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { SlabButton } from '@/components/ui/button';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSheetEntrance } from '@/shared/motion/sheet-entrance';

export function LeaveLessonSheet({
  visible,
  stepNumber,
  stepCount,
  onStay,
  onLeave,
}: {
  visible: boolean;
  /** One-based position of the step the learner is on, used only to say where they will return to. */
  stepNumber: number;
  stepCount: number;
  onStay: () => void;
  onLeave: () => void;
}) {
  const theme = useTheme();
  const { backdrop, sheet } = useSheetEntrance(visible);

  if (!visible) return null;

  /*
   * A COUNT, NOT A PERCENTAGE, and only when both numbers are real. "Step 4 of 9" is the same
   * promise the progress bar above is already making; a percentage invites the learner to do
   * arithmetic about how much they are throwing away, which is the coercion this sheet avoids.
   */
  const place = stepNumber > 0 && stepCount > 0
    ? `We'll bring you back to step ${String(stepNumber)} of ${String(stepCount)}.`
    : "We'll bring you back to where you left off.";

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onStay}>
      <Animated.View style={[StyleSheet.absoluteFill, backdrop]} pointerEvents="box-none">
        {/* Tapping the scrim STAYS. The destructive branch is never the accidental one, which is
            the same reason the sheet exists at all. */}
        <Pressable
          style={[styles.scrim, { backgroundColor: theme.background + 'B3' }]}
          accessibilityRole="button"
          accessibilityLabel="Keep going"
          onPress={onStay}
        />
      </Animated.View>

      <Animated.View style={[styles.dock, sheet]} pointerEvents="box-none">
        <View style={styles.markWrap} pointerEvents="none">
          <Atlas size={72} expression="sad" interactive={false} />
        </View>

        <View style={[styles.sheet, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ThemedText type="title" style={styles.lead}>Leaving already?</ThemedText>
          <ThemedText type="body" themeColor="textSecondary" style={styles.body}>
            Your progress on this lesson is saved. {place}
          </ThemedText>

          <SlabButton label="Keep going" full onPress={onStay} />

          {/* Plain text, not a second slab. Two equal buttons make a destructive choice look like a
              coin flip; this reads as the quieter option while staying a full-width tap target. */}
          <Pressable
            style={styles.leave}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Leave the lesson"
            onPress={onLeave}>
            <ThemedText type="smallBold" themeColor="mutedForeground">Leave the lesson</ThemedText>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { ...StyleSheet.absoluteFill },
  dock: { flex: 1, justifyContent: 'flex-end' },
  markWrap: { alignItems: 'center', marginBottom: -30, zIndex: 2 },
  sheet: {
    borderTopLeftRadius: Radius.lg + 8,
    borderTopRightRadius: Radius.lg + 8,
    borderWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.two,
  },
  lead: { lineHeight: 32 },
  body: { marginBottom: Spacing.two },
  leave: { alignSelf: 'center', paddingVertical: Spacing.three, paddingHorizontal: Spacing.four },
});
