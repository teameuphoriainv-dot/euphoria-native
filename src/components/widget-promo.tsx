/**
 * UNIT 15d — the widget ask.
 *
 * Deliberately the SAME sheet language as `gate-sheet.tsx`: bottom dock, Atlas straddling the top
 * edge, blur over the live screen. A second sheet grammar for a second kind of interruption is how
 * an app starts to feel assembled rather than designed.
 *
 * The rule this component exists to enforce: **`Not now` is always present and always reachable**.
 * Duolingo `112661` and Elevate `111696` both ship an opt-out on every ask, and the plan's
 * verification asks for it at >= 44pt (§15.5).
 */
import { BlurView } from 'expo-blur';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { GradientButton } from '@/components/ui/button';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { AtlasExpression } from '@/components/atlas';
import { WIDGET_ASKS, type WidgetAskVariant } from '@/lib/widget-ask';
import { useSheetEntrance } from '@/shared/motion/sheet-entrance';

/** One expression per argument. The mascot's face is part of the pitch, not decoration. */
const FACE: Record<WidgetAskVariant, AtlasExpression> = {
  emotional: 'happy',
  statistical: 'watching',
  transactional: 'proud',
};

export function WidgetPromo({
  visible,
  variant,
  onDismiss,
  onAdd,
}: {
  visible: boolean;
  variant: WidgetAskVariant;
  onDismiss: () => void;
  onAdd: () => void;
}) {
  const theme = useTheme();
  const { backdrop, sheet } = useSheetEntrance(visible);
  const ask = WIDGET_ASKS[variant];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
      <Animated.View style={[StyleSheet.absoluteFill, backdrop]} pointerEvents="box-none">
        <BlurView intensity={38} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />
      <Pressable
        style={[styles.scrim, { backgroundColor: theme.background + '99' }]}
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
        onPress={onDismiss}
      />
      </Animated.View>
      <Animated.View style={[styles.dock, sheet]} pointerEvents="box-none">
        <View style={styles.markWrap} pointerEvents="none">
          <Atlas size={72} expression={FACE[variant]} interactive={false} />
        </View>

        <View style={[styles.sheet, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ThemedText type="title" style={styles.lead}>
            {ask.lead}
          </ThemedText>
          <ThemedText type="title" style={[styles.lead, { color: theme.iconLilac }]}>
            {ask.accentTail}
          </ThemedText>

          <ThemedText type="body" themeColor="textSecondary" style={styles.body}>
            {ask.body}
          </ThemedText>

          {/*
           * The attribution. §15.3b decision 2 forbids a bare number precisely because the reader
           * assumes an unattributed figure is ours, and this one is not — it is Duolingo's. Printed
           * ON SCREEN, under the claim, the way Headway `128565` prints "Based on internal research,
           * 2025". If this line is ever removed the claim must go with it.
           */}
          {ask.source !== undefined && (
            <View style={styles.sourceRow}>
              <ThemedText type="small" themeColor="mutedForeground" style={{ flex: 1 }}>
                Source: {ask.source}
              </ThemedText>
            </View>
          )}

          <GradientButton label={ask.cta} full onPress={onAdd} />

          {/* Always present, never conditional, >= 44pt. */}
          <Pressable
            style={styles.notNow}
            accessibilityRole="button"
            accessibilityLabel="Not now"
            onPress={onDismiss}>
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
  lead: { lineHeight: 32 },
  body: { marginTop: Spacing.one },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  // 44pt is the HIG minimum and the number §15.5 checks. Centred so the label sits in the middle of
  // the target rather than at its top edge.
  notNow: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: Spacing.four },
});
