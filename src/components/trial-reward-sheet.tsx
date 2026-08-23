/**
 * 17c — THE TRIAL REWARD OFFER. Converts a trial to annual before the user reaches a churn decision.
 *
 * THE EVIDENCE, AND THE DELIBERATE DEVIATION FROM IT.
 *
 * §17a banked Headway's flow `54941` "Unlock Post-Subscription Offer", read in pixels:
 * `128596` fires **on day 1 of the trial, on the home feed**, as a gamified treasure-chest modal —
 * *"First reward earned! This chest honors your commitment to grow."* — and `128597` reveals the
 * "reward" to be an upsell that turns the trial into a discount that recurs.
 *
 * **That is 1/5 in the banked set. NOT convergence. It ships as a bet, not as evidence**, and §17a
 * says so in those words. Do not let a later summary promote it.
 *
 * We deviate on the TRIGGER and the deviation is the point. Headway anchors the reward to
 * *commitment* — you started a trial, here is a chest — and fires it on an empty home feed. Our
 * approved copy is anchored to an *achievement*: "That's your first lesson done." Under §0.4 that
 * sentence must be TRUE at the moment it renders, so it cannot fire on a day-1 home feed before any
 * lesson exists. Anchoring to the first completed lesson keeps the copy honest by construction and
 * still lands on day 1 for the activation path, because onboarding routes straight into a lesson and
 * Home's "Start" sits above the fold. Same timing, true sentence.
 *
 * NO PRICE AND NO PERCENTAGE HERE. Same rule as the dismissal offer (C24) and for the same reason:
 * §0.4 forbids a number we cannot back, C31 locks annual at $79.99, and the discounted product does
 * not exist in App Store Connect. Inventing "-38%" would put a figure on screen that no store can
 * charge. The real number belongs on the plan screen, sourced from the RevenueCat package, the
 * moment that package exists.
 *
 * NO FAKE URGENCY. No countdown, no "ends soon". There is no timer behind such a claim and §0.4 is
 * exactly the rule that prevents shipping one.
 *
 * COPY APPROVED 2026-08-13 by the user, chosen from three drafts (§0.7 — copy is never invented).
 *
 * SCREEN DESIGN IS NOT SCREENSDESIGN-BACKED. `search_apps` returns "An active Pro subscription is
 * required" as of 2026-08-13, so the layout is NOT validated against real screens. It deliberately
 * reuses `gate-sheet.tsx`'s shell — same dock, same straddling Atlas mark, same sheet radius and
 * padding, same close affordance — rather than inventing a second sheet language. Per AGENTS.md
 * rule 7 this is HIG-plus-token-system work and is labelled as such. Re-validate when the
 * subscription is restored.
 */
import { BlurView } from 'expo-blur';
import { useCallback } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { SlabButton } from '@/components/ui/button';
import { UIcon } from '@/components/ui-icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ev, track } from '@/lib/analytics';
import { useApp } from '@/lib/store';
import { useSheetEntrance } from '@/shared/motion/sheet-entrance';

export function TrialRewardSheet({
  visible,
  onAccept,
  onDismiss,
}: {
  visible: boolean;
  /** Route to the plan screen. The REAL price lives there, from the RevenueCat package. */
  onAccept: () => void;
  onDismiss: () => void;
}) {
  const theme = useTheme();
  const { backdrop, sheet } = useSheetEntrance(visible);
  const markSeen = useApp((s) => s.markTrialRewardSeen);

  /*
   * Stamped on the way OUT, not on mount. Mounting is not seeing — a sheet that renders and is torn
   * down by a navigation race would burn the once-per-install allowance on a user who saw nothing.
   * Both exits stamp, so the offer is spent exactly once either way.
   */
  const accept = useCallback(() => {
    markSeen();
    track(Ev.trialRewardAccepted);
    onAccept();
  }, [markSeen, onAccept]);

  const dismiss = useCallback(() => {
    markSeen();
    track(Ev.trialRewardDismissed);
    onDismiss();
  }, [markSeen, onDismiss]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={dismiss}>
      {/* Native module: renders nothing until a dev client containing expo-blur is built. The scrim
          below is what keeps the sheet legible in the meantime. */}
      <Animated.View style={[StyleSheet.absoluteFill, backdrop]} pointerEvents="box-none">
        <BlurView intensity={38} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />
      <Pressable
        style={[styles.scrim, { backgroundColor: theme.background + '99' }]}
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
        onPress={dismiss}
      />
      </Animated.View>
      <Animated.View style={[styles.dock, sheet]} pointerEvents="box-none">
        {/* `proud`, not the gate sheet's `whoa`. That sheet catches someone at a wall; this one
            catches them straight off a win, and the mascot has to agree with the sentence
            underneath it. */}
        <View style={styles.markWrap} pointerEvents="none">
          <Atlas size={72} expression="proud" interactive={false} />
        </View>

        <View style={[styles.sheet, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Pressable
            style={[styles.close, { backgroundColor: theme.cardElevated }]}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={dismiss}>
            <UIcon name="close" size={18} color={theme.textSecondary} />
          </Pressable>

          <ThemedText type="title" style={styles.lead}>
            You&apos;ve earned
          </ThemedText>
          <ThemedText type="title" style={[styles.lead, { color: theme.iconLilac }]}>
            something
          </ThemedText>
          <ThemedText type="body" themeColor="textSecondary" style={styles.body}>
            That&apos;s your first lesson done. Atlas kept something back for you.
          </ThemedText>

          <SlabButton label="Open it" full onPress={accept} />

          <Pressable
            style={styles.why}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Not now"
            onPress={dismiss}>
            <ThemedText type="small" themeColor="mutedForeground">
              Not now
            </ThemedText>
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
  close: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  lead: { lineHeight: 32 },
  body: { marginTop: Spacing.one },
  why: { alignSelf: 'center', paddingVertical: Spacing.two },
});
