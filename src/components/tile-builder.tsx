/**
 * TileBuilder — direct-manipulation lesson step (Brilliant's drag-tile mechanic, tap-to-place
 * version). Fill labeled slots from a tray of tiles; auto-checks when full. Correct slots turn
 * green + lock; wrong turn amber (tap to clear + retry). onSolvedChange(true) when all correct.
 * // ponytail: tap-to-place now; upgrade to gesture-handler drag when a lesson needs it.
 */
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { Duration } from '@/shared/motion/tokens';

export type TileSpec = { title: string; slots: { label: string; correct: string }[]; tray: string[] };

export function TileBuilder({ spec, onSolvedChange }: { spec: TileSpec; onSolvedChange: (solved: boolean) => void }) {
  const theme = useTheme();
  const [placed, setPlaced] = useState<(string | null)[]>(() => spec.slots.map(() => null));

  const full = placed.every((p) => p !== null);
  const correctness = placed.map((v, i) => (v == null ? null : v === spec.slots[i].correct));
  const allCorrect = full && correctness.every(Boolean);

  useEffect(() => {
    onSolvedChange(allCorrect);
    if (allCorrect) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [allCorrect, onSolvedChange]);

  const place = (tile: string) => {
    if (allCorrect) return;
    const idx = placed.findIndex((p) => p === null);
    if (idx < 0) return;
    Haptics.selectionAsync();
    setPlaced((prev) => prev.map((p, i) => (i === idx ? tile : p)));
  };
  const clear = (i: number) => {
    if (correctness[i] === true) return; // locked once right
    setPlaced((prev) => prev.map((p, idx) => (idx === i ? null : p)));
  };

  return (
    <View style={{ flex: 1 }}>
      <ThemedText type="title" style={{ marginBottom: Spacing.four }}>{spec.title}</ThemedText>

      {/* Slots */}
      <View style={{ gap: Spacing.two + 4 }}>
        {spec.slots.map((s, i) => {
          const v = placed[i];
          const ok = correctness[i];
          const border = ok === true ? theme.success : ok === false ? theme.warning : v ? theme.primary : theme.border;
          return (
            <View key={s.label} style={styles.slotRow}>
              <ThemedText type="bodyMedium" style={{ flex: 1 }}>{s.label}</ThemedText>
              <SpringPressable
                haptic={false}
                disabled={!v}
                onPress={() => clear(i)}
                // The slot's filled/empty state and its correctness were conveyed only by
                // border colour and a dashed-vs-solid edge. Both are invisible to a screen
                // reader, which leaves the whole exercise unreadable.
                accessibilityRole="button"
                accessibilityLabel={v ? `${s.label}: ${v}` : `${s.label}: empty`}
                accessibilityState={{ disabled: !v }}
                accessibilityHint={v ? 'Activate to clear this slot.' : undefined}>
                <View
                  style={[
                    styles.slot,
                    { borderColor: border, borderStyle: v ? 'solid' : 'dashed', backgroundColor: v ? theme.primary + '1A' : 'transparent' },
                  ]}>
                  <ThemedText type="heading" style={{ fontSize: 16, color: v ? theme.text : theme.mutedForeground }}>{v ?? '—'}</ThemedText>
                </View>
              </SpringPressable>
            </View>
          );
        })}
      </View>

      {/* Tray */}
      <View style={styles.tray}>
        {spec.tray.map((tile) => {
          const used = placed.includes(tile);
          return (
            <SpringPressable
              key={tile}
              disabled={used || allCorrect}
              onPress={() => place(tile)}
              accessibilityRole="button"
              accessibilityLabel={tile}
              accessibilityState={{ disabled: used || allCorrect, selected: used }}
              accessibilityHint={used ? undefined : 'Activate to place this in the next empty slot.'}>
              <View style={[styles.tile, { borderColor: theme.border, backgroundColor: theme.card, opacity: used ? 0.35 : 1 }]}>
                <ThemedText type="heading" style={{ fontSize: 16 }}>{tile}</ThemedText>
              </View>
            </SpringPressable>
          );
        })}
      </View>

      {/* Feedback */}
      {full && (
        <Animated.View entering={FadeIn} exiting={FadeOut.duration(Duration.exit)} style={{ marginTop: Spacing.three }}>
          <ThemedText type="smallBold" style={{ color: allCorrect ? theme.success : theme.warning }}>
            {allCorrect ? 'Nailed it — that’s the 50/30/20 split.' : 'Close. Tap an amber slot to fix it.'}
          </ThemedText>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  slotRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  slot: { minWidth: 96, height: 48, borderRadius: Radius.md, borderWidth: 2, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.three },
  tray: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two + 2, marginTop: Spacing.five },
  tile: { minWidth: 76, height: 48, borderRadius: Radius.md, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.three },
});
