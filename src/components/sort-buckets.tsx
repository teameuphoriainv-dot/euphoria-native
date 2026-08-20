/**
 * SortBuckets — categorize items by tapping (Brilliant sort interaction). Tap an item to
 * cycle its category; auto-checks when all assigned; correct items lock green, wrong turn
 * amber (tap to re-sort). onSolvedChange(true) when all correct. Mirrors TileBuilder.
 */
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { Duration, Spring } from '@/shared/motion/tokens';

export type SortSpec = { title: string; categories: string[]; items: { label: string; correct: string }[] };

export function SortBuckets({ spec, onSolvedChange }: { spec: SortSpec; onSolvedChange: (solved: boolean) => void }) {
  const theme = useTheme();
  const [assign, setAssign] = useState<(number | null)[]>(() => spec.items.map(() => null));

  const full = assign.every((a) => a !== null);
  const correctness = assign.map((a, i) => (a == null ? null : spec.categories[a] === spec.items[i].correct));
  const allCorrect = full && correctness.every(Boolean);

  useEffect(() => {
    onSolvedChange(allCorrect);
    if (allCorrect) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [allCorrect, onSolvedChange]);

  const cycle = (i: number) => {
    if (correctness[i] === true) return;
    Haptics.selectionAsync();
    setAssign((prev) => prev.map((a, idx) => (idx === i ? (a == null ? 0 : (a + 1) % spec.categories.length) : a)));
  };

  return (
    <View>
      <ThemedText type="title" style={{ marginBottom: Spacing.two }}>{spec.title}</ThemedText>
      <ThemedText type="small" themeColor="mutedForeground" style={{ marginBottom: Spacing.four }}>
        Tap each item to sort it into {spec.categories.join(', ')}.
      </ThemedText>

      <View style={{ gap: Spacing.two + 4 }}>
        {spec.items.map((item, i) => {
          const a = assign[i];
          const ok = correctness[i];
          const border = ok === true ? theme.success : ok === false ? theme.warning : a != null ? theme.primary : theme.border;
          return (
            <SpringPressable
              key={item.label}
              onPress={() => cycle(i)}
              // Items move between buckets; without a layout animation they teleport.
              layout={LinearTransition.springify().damping(Spring.gentle.damping).stiffness(Spring.gentle.stiffness)}>
              <View style={[styles.row, { borderColor: border, borderWidth: a != null ? 2 : StyleSheet.hairlineWidth, backgroundColor: theme.card }]}>
                <ThemedText type="bodyMedium" style={{ flex: 1 }}>{item.label}</ThemedText>
                {a != null ? (
                  <View style={[styles.pill, { backgroundColor: (ok === false ? theme.warning : theme.primary) + '26' }]}>
                    <ThemedText type="smallBold" style={{ color: ok === false ? theme.warning : theme.iconLilac }}>{spec.categories[a]}</ThemedText>
                  </View>
                ) : (
                  <ThemedText type="small" themeColor="mutedForeground">Tap to sort</ThemedText>
                )}
                {ok === true && <UIcon name="check" size={18} color={theme.success} strokeWidth={3} />}
              </View>
            </SpringPressable>
          );
        })}
      </View>

      {full && (
        <Animated.View entering={FadeIn} exiting={FadeOut.duration(Duration.exit)} style={{ marginTop: Spacing.three }}>
          <ThemedText type="smallBold" style={{ color: allCorrect ? theme.success : theme.warning }}>
            {allCorrect ? 'Sorted — you know needs from wants.' : 'Some are off. Tap an amber item to re-sort.'}
          </ThemedText>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, padding: Spacing.three, borderRadius: Radius.lg },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill },
});
