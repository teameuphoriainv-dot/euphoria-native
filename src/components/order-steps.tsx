/**
 * OrderSteps — arrange rows into the correct sequence by tapping two of them to swap. The
 * list starts shuffled (never pre-solved); each row shows its position number. A row sitting
 * in its correct slot gets a green accent + check; onSolvedChange(true) when the whole order
 * matches. Sibling to MatchingPairs/SortBuckets.
 */
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SpringPressable } from '@/shared/motion/spring-pressable';

export type OrderSpec = { title: string; hint?: string; items: string[] };

const shuffledOrder = (n: number): number[] => {
  const a = Array.from({ length: n }, (_, i) => i);
  if (n <= 1) return a; // 0/1-item list is always already-sorted — the reshuffle-until-different loop would hang
  do {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  } while (a.every((v, i) => v === i));
  return a;
};

export function OrderSteps({ spec, onSolvedChange }: { spec: OrderSpec; onSolvedChange: (solved: boolean) => void }) {
  const theme = useTheme();
  const [order, setOrder] = useState<number[]>(() => shuffledOrder(spec.items.length));
  const [selected, setSelected] = useState<number | null>(null);

  const solved = order.every((v, i) => v === i);

  useEffect(() => {
    onSolvedChange(solved);
    if (solved) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [solved, onSolvedChange]);

  const tap = (pos: number) => {
    if (solved) return;
    if (selected === null) {
      Haptics.selectionAsync();
      setSelected(pos);
      return;
    }
    if (selected === pos) {
      setSelected(null);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOrder((prev) => {
      const next = [...prev];
      [next[selected], next[pos]] = [next[pos], next[selected]];
      return next;
    });
    setSelected(null);
  };

  return (
    <View>
      <ThemedText type="title" style={{ marginBottom: Spacing.two }}>{spec.title}</ThemedText>
      <ThemedText type="small" themeColor="mutedForeground" style={{ marginBottom: Spacing.four }}>
        {spec.hint ?? 'Tap two rows to swap them.'}
      </ThemedText>

      <View style={{ gap: Spacing.two + 4 }}>
        {order.map((itemIdx, pos) => {
          const inPlace = itemIdx === pos;
          const isSel = selected === pos;
          const border = isSel ? theme.primary : inPlace ? theme.success : theme.border;
          return (
            <SpringPressable key={spec.items[itemIdx]} disabled={solved} onPress={() => tap(pos)}>
              <View style={[styles.row, { borderColor: border, borderWidth: isSel || inPlace ? 2 : StyleSheet.hairlineWidth, backgroundColor: isSel ? theme.primary + '14' : theme.card }]}>
                <View style={[styles.num, { backgroundColor: (inPlace ? theme.success : theme.primary) + '22' }]}>
                  <ThemedText type="smallBold" style={{ color: inPlace ? theme.success : theme.iconLilac }}>{pos + 1}</ThemedText>
                </View>
                <ThemedText type="bodyMedium" style={{ flex: 1 }}>{spec.items[itemIdx]}</ThemedText>
                {inPlace && <UIcon name="check" size={16} color={theme.success} strokeWidth={3} />}
              </View>
            </SpringPressable>
          );
        })}
      </View>

      {solved && (
        <ThemedText type="smallBold" style={{ color: theme.success, marginTop: Spacing.three }}>In order — well done.</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4, padding: Spacing.three, borderRadius: Radius.lg },
  num: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
