/**
 * 17d — THE DISMISSAL OFFER, as a surface any wall can raise.
 *
 * WHY THIS IS ITS OWN FILE NOW. It used to live as `phase === 'offer'` inside `gate-sheet.tsx`,
 * which meant the only way to see it was to be refused by that sheet. §22 C115 found the
 * consequence: `lesson.tsx` and `chat.tsx` render their own full-screen hard walls, so a user whose
 * trial expired and who tapped Start on Home dismissed a wall that had never heard of the offer.
 * Verified on device — `specialOfferSeenAt` stayed null on that path while the same lesson tapped
 * from the Learn tab fired the offer immediately.
 *
 * The hard wall is NOT replaced. C28 keeps it, reaffirmed in Unit 17's own preamble, and swapping a
 * route-level wall for a sheet would be a product change nobody asked for. The wall keeps its
 * shape; it just makes the second ask before it lets go.
 *
 * COPY APPROVED 2026-08-10 (§20), unchanged in this move — three rendered lines, one button.
 * Mechanism 3 from the banked evidence: the second screen is drastically SIMPLER than the first,
 * where Translator GO drops from two plans plus four features plus fine print to one image, three
 * lines and a single button.
 *
 * NO PRICE, NO PERCENTAGE, NO FAKE URGENCY. §0.4: C31 locks annual at $79.99 and the discounted
 * product does not exist in App Store Connect, so a figure here would be one no store can charge.
 * StressWatch ships "For limited time only, offer ends soon" with no timer behind it; that is
 * exactly the claim §0.4 exists to prevent.
 */
import { BlurView } from 'expo-blur';
import { useCallback } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { GradientButton } from '@/components/ui/button';
import { UIcon } from '@/components/ui-icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ev, track } from '@/lib/analytics';
import { useSheetEntrance } from '@/shared/motion/sheet-entrance';

export function DismissalOfferSheet({
  visible,
  /** Where the offer was raised — `lesson`, `chat`, or the gate sheet's own feature. */
  feature,
  onAccept,
  onDismiss,
}: {
  visible: boolean;
  feature: string;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  const theme = useTheme();
  const { backdrop, sheet } = useSheetEntrance();

  const accept = useCallback(() => {
    track(Ev.specialOfferAccepted, { feature });
    onAccept();
  }, [feature, onAccept]);

  const dismiss = useCallback(() => {
    track(Ev.specialOfferDismissed, { feature });
    onDismiss();
  }, [feature, onDismiss]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={dismiss}>
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
        <View style={styles.markWrap} pointerEvents="none">
          <Atlas size={72} expression="whoa" interactive={false} />
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
            Before you go
          </ThemedText>
          <ThemedText type="title" style={[styles.lead, { color: theme.iconLilac }]}>
            one better offer
          </ThemedText>
          <ThemedText type="body" themeColor="textSecondary" style={styles.body}>
            We&apos;d rather you learned this than didn&apos;t.
          </ThemedText>

          <GradientButton label="Show me the offer" full onPress={accept} />

          <Pressable
            style={styles.why}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="No thanks"
            onPress={dismiss}>
            <ThemedText type="small" themeColor="mutedForeground">
              No thanks
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
