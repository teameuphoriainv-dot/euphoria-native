/**
 * GateSheet — the contextual gate. Modelled on Astra AI screen 323575.
 *
 * ── THE MECHANISM, and why it is not a navigation ─────────────────────────────────────────────
 * The screen the user was already on stays MOUNTED behind this sheet. They keep their place, they
 * can see what they were reaching for, and dismissing returns them exactly where they were.
 * Euphoria's previous behaviour — pushing to /onboarding?step=paywall — threw that context away and
 * made the ask read as a punishment for tapping.
 *
 * VERIFY ON DEVICE: with the sheet open, `./scripts/sim.sh screen` must STILL list the underlying
 * screen's labels. If they are gone you have built a route, and it is wrong.
 *
 * ── WHAT THE PIXELS CORRECTED IN §9.5's SKETCH (§22 C10) ──────────────────────────────────────
 * §9.5 drew a centred card. Astra AI's is not one:
 *   1. It is a BOTTOM SHEET, anchored to the bottom edge, roughly the lower half of the screen.
 *   2. The mark STRADDLES the sheet's top edge, half above it, deliberately breaking the rectangle.
 *   3. The type ratio is about 3:1 — a large headline against a small grey sub-line.
 *   4. The CTA is short. Astra AI's is the single word "Buy".
 *
 * ── THE BLUR, AND WHY IT IS LOADED DEFENSIVELY ────────────────────────────────────────────────
 * Astra AI blurs the screen behind heavily, so `expo-blur` is installed (overriding §9.5's original
 * "do not add a native module" note, by explicit user decision).
 *
 * It is a NATIVE module, so it renders nothing until a dev client is built containing it. The scrim
 * underneath is therefore ALWAYS rendered — it is both the pre-rebuild fallback and the contrast
 * floor once the blur is live, with a lower alpha in that case since the blur does the separating.
 *
 * ── HARD RULES ────────────────────────────────────────────────────────────────────────────────
 * - NO PRICE. Pricing lives one tap deeper, exactly as Astra AI does it (323575 -> 323576). This
 *   keeps the interruption cheap and the decision small.
 * - ONE line on what unlocking buys. A benefits list belongs on the plan screen.
 * - ALWAYS DISMISSIBLE. A gate that cannot be closed is a trap and draws one-star reviews. This
 *   matters more here than in the reference apps: with everything gated on expiry, this sheet's
 *   dismiss path and the streak loop are the only ways back into the app.
 * - COPY IS UNAPPROVED. The structure is evidence-backed; the words are not signed off (§20).
 */
import { BlurView } from 'expo-blur';
import { useCallback, useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { GradientButton } from '@/components/ui/button';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Ev, track } from '@/lib/analytics';
import type { Feature, Refusal } from '@/lib/entitlement';
import { useApp } from '@/lib/store';

/** §20.1's copy deck. One reason at a time — that is the whole point of Refusal carrying one. */
function headlineFor(refusal: Refusal, feature: Feature): { lead: string; accentTail: string } {
  if (refusal.ok) return { lead: '', accentTail: '' };
  if (refusal.reason === 'trial-expired') return { lead: 'Your free 3 days', accentTail: 'are up' };
  switch (feature) {
    case 'lesson':
      return { lead: "That's", accentTail: '5 lessons' };
    case 'atlas':
      return { lead: 'Atlas needs', accentTail: 'a break' };
    case 'options':
      return { lead: "That's your", accentTail: 'third preview' };
    default:
      return { lead: 'Euphoria Pro', accentTail: 'opens this' };
  }
}

function bodyFor(refusal: Refusal, feature: Feature, guides: number, lessons: number): string {
  if (refusal.ok) return '';
  if (refusal.reason === 'trial-expired') {
    /*
     * Their OWN numbers, which is the one thing that makes the ask feel earned rather than abrupt.
     *
     * If both are zero the sentence is DROPPED rather than reading "You've read 0 guides" — a count
     * that can legitimately be zero must not drive a message that assumes it is not. That is
     * trap #24 exactly, in copy instead of in a condition.
     */
    if (guides === 0 && lessons === 0) return 'Euphoria Pro keeps every lesson and Atlas open.';
    const parts: string[] = [];
    if (guides > 0) parts.push(`read ${guides} guide${guides === 1 ? '' : 's'}`);
    if (lessons > 0) parts.push(`finished ${lessons} lesson${lessons === 1 ? '' : 's'}`);
    return `You've ${parts.join(' and ')}. Euphoria Pro keeps them coming.`;
  }
  switch (feature) {
    case 'lesson':
      return 'The free run is five. Pro opens all twelve courses.';
    case 'atlas':
      return "You've used your 10 free questions. Pro makes them unlimited.";
    case 'options':
      return 'Options previews are capped at three. Pro opens the desk.';
    default:
      return 'Pro opens every lesson, unlimited Atlas, and the full options desk.';
  }
}

export function GateSheet({
  feature,
  refusal,
  visible,
  onDismiss,
  onSeePro,
  onWhyNotFree,
}: {
  feature: Feature;
  refusal: Refusal;
  visible: boolean;
  onDismiss: () => void;
  /** Opens the plan picker. NOT a purchase — this sheet asks for intent, not money. */
  onSeePro: () => void;
  onWhyNotFree: () => void;
}) {
  const theme = useTheme();
  const guides = useApp((s) => s.readPosts.length);
  const lessons = useApp((s) => s.completedLessons.length);

  // 17b funnel: paywall_seen. Fires on the transition into visible, not on every render, and
  // carries WHY the user hit the wall — a trial that expired and a per-feature count limit are
  // different products failing, and a single "saw the paywall" number cannot tell them apart.
  //
  // Declared before the early return below: hooks cannot sit after a conditional return.
  useEffect(() => {
    if (!visible || refusal.ok) return;
    track(Ev.paywallSeen, {
      feature,
      reason: refusal.reason,
      lessons_done: lessons,
      guides_read: guides,
    });
  }, [visible, refusal, feature, lessons, guides]);

  const dismiss = useCallback(() => {
    if (!refusal.ok) track(Ev.paywallDismissed, { feature, reason: refusal.reason });
    onDismiss();
  }, [refusal, feature, onDismiss]);

  if (refusal.ok) return null;
  const { lead, accentTail } = headlineFor(refusal, feature);
  const body = bodyFor(refusal, feature, guides, lessons);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={dismiss}>
      {/* Real blur over the live screen — Astra AI 323575 blurs heavily, and the point of this sheet
          is that the user can still SEE what they were reaching for. pointerEvents none so the scrim
          below still receives the dismiss tap.

          expo-blur is a NATIVE module: this renders nothing until a dev client has been built that
          contains it. The scrim below is what keeps the sheet legible in the meantime. */}
      <BlurView intensity={38} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />
      {/* Scrim. ALWAYS rendered — it is the fallback when there is no blur AND the contrast floor
          when there is. Tapping it dismisses, the expected gesture for a sheet and one more way out
          per the always-dismissible rule above. Alpha is lower when blurring, since the blur is
          already doing the separating. */}
      <Pressable
        style={[styles.scrim, { backgroundColor: theme.background + '99' }]}
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
        onPress={dismiss}
      />
      <View style={styles.dock} pointerEvents="box-none">
        {/* The mark straddles the sheet's top edge rather than sitting above it (C10). Atlas rather
            than Astra AI's generic star: the mascot in-thread is 5/5 convergence in this dataset. */}
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

          {/* ~3:1 type ratio. `title` is the largest token that fits two lines here without
              wrapping a long word; `display` overflows at these headline lengths. */}
          <ThemedText type="title" style={styles.lead}>
            {lead}
          </ThemedText>
          <ThemedText type="title" style={[styles.lead, { color: theme.iconLilac }]}>
            {accentTail}
          </ThemedText>

          {body.length > 0 && (
            <ThemedText type="body" themeColor="textSecondary" style={styles.body}>
              {body}
            </ThemedText>
          )}

          {/* ONE line on what unlocking buys. Astra AI uses exactly one. */}
          <View style={styles.unlockRow}>
            <UIcon name="lock" size={17} color={theme.iconLilac} />
            <ThemedText type="small" themeColor="textSecondary" style={{ flex: 1 }}>
              Every lesson, unlimited Atlas, the full options desk
            </ThemedText>
          </View>

          <GradientButton label="See Euphoria Pro" full onPress={onSeePro} />

          {/* The Astra AI move — it answers the resentment instead of ignoring it. For a finance app
              aimed at 18-25s that honesty is a differentiator, not a weakness. */}
          <Pressable
            style={styles.why}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Why isn't Euphoria free?"
            onPress={onWhyNotFree}>
            <ThemedText type="small" themeColor="mutedForeground">
              Why isn&apos;t Euphoria free?
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { ...StyleSheet.absoluteFill },
  // Bottom-anchored, not centred (C10). The top of the screen stays visible so the user can see
  // what they were reaching for.
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
  unlockRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.one },
  why: { alignSelf: 'center', paddingVertical: Spacing.two },
});
