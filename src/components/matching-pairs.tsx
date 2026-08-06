/**
 * MatchingPairs — connect left terms to right definitions. Tap a term, then tap its match;
 * a correct pair locks green, a wrong tap flashes amber and clears. The right column is
 * shuffled once on mount. onSolvedChange(true) when every pair is matched. Sibling to
 * SortBuckets/MultiSelect.
 */
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SpringPressable } from '@/shared/motion/spring-pressable';

export type MatchSpec = { title: string; pairs: { left: string; right: string }[] };

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export function MatchingPairs({ spec, onSolvedChange }: { spec: MatchSpec; onSolvedChange: (solved: boolean) => void }) {
  const theme = useTheme();
  const [rightOrder] = useState(() => shuffle(spec.pairs.map((_, i) => i)));
  const [selected, setSelected] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);

  const solved = matched.length === spec.pairs.length;

  useEffect(() => {
    onSolvedChange(solved);
    if (solved) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [solved, onSolvedChange]);

  const tapLeft = (i: number) => {
    if (matched.includes(i)) return;
    Haptics.selectionAsync();
    setWrong(null);
    setSelected(i);
  };

  const tapRight = (j: number) => {
    if (matched.includes(j) || selected == null) return;
    if (j === selected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setMatched((m) => [...m, selected]);
      setSelected(null);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setWrong(j);
      setSelected(null);
      setTimeout(() => setWrong(null), 500);
    }
  };

  return (
    <View>
      <ThemedText type="title" style={{ marginBottom: Spacing.two }}>{spec.title}</ThemedText>
      <ThemedText type="small" themeColor="mutedForeground" style={{ marginBottom: Spacing.four }}>
        Tap a term, then tap its match.
      </ThemedText>

      <View style={styles.cols}>
        <View style={styles.col}>
          {spec.pairs.map((p, i) => {
            const isMatched = matched.includes(i);
            const isSel = selected === i;
            const border = isMatched ? theme.success : isSel ? theme.primary : theme.border;
            return (
              <SpringPressable
                key={p.left}
                disabled={isMatched}
                onPress={() => tapLeft(i)}
                // Selection and matched-ness were carried only by border colour and a tick
                // glyph. Without them announced, a screen-reader user cannot tell which term
                // is currently picked up or which pairs are already done.
                accessibilityRole="button"
                accessibilityLabel={p.left}
                accessibilityState={{ selected: isSel, disabled: isMatched }}
                accessibilityHint={isMatched ? undefined : 'Activate, then choose its definition.'}>
                <View style={[styles.cell, { borderColor: border, borderWidth: isSel || isMatched ? 2 : StyleSheet.hairlineWidth, backgroundColor: isSel ? theme.primary + '14' : theme.card }]}>
                  <ThemedText type="bodyMedium" style={{ flex: 1 }}>{p.left}</ThemedText>
                  {isMatched && <UIcon name="check" size={16} color={theme.success} strokeWidth={3} />}
                </View>
              </SpringPressable>
            );
          })}
        </View>

        <View style={styles.col}>
          {rightOrder.map((j) => {
            const isMatched = matched.includes(j);
            const isWrong = wrong === j;
            const border = isMatched ? theme.success : isWrong ? theme.warning : theme.border;
            return (
              <SpringPressable
                key={spec.pairs[j].right}
                disabled={isMatched}
                onPress={() => tapRight(j)}
                accessibilityRole="button"
                accessibilityLabel={spec.pairs[j].right}
                accessibilityState={{ disabled: isMatched }}
                accessibilityHint={isMatched ? undefined : 'Activate to match this with the selected term.'}>
                <View style={[styles.cell, { borderColor: border, borderWidth: isMatched || isWrong ? 2 : StyleSheet.hairlineWidth, backgroundColor: isMatched ? theme.success + '14' : theme.card }]}>
                  <ThemedText type="small" style={{ flex: 1 }}>{spec.pairs[j].right}</ThemedText>
                  {isMatched && <UIcon name="check" size={16} color={theme.success} strokeWidth={3} />}
                </View>
              </SpringPressable>
            );
          })}
        </View>
      </View>

      {solved && (
        <ThemedText type="smallBold" style={{ color: theme.success, marginTop: Spacing.three }}>All matched — nicely done.</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cols: { flexDirection: 'row', gap: Spacing.two + 4 },
  col: { flex: 1, gap: Spacing.two + 4 },
  cell: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, padding: Spacing.three, borderRadius: Radius.lg, minHeight: 64 },
});
