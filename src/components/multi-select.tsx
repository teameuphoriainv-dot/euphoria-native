/**
 * MultiSelect — choose-all-that-apply lesson step. Tap options to toggle, press Check to
 * validate the whole set. Correct picks lock green, wrong picks turn amber; on a miss the
 * correct answers are marked so the learner can fix and re-check. onSolvedChange(true) only
 * when the selected set exactly matches the correct set. Sibling to SortBuckets/TileBuilder.
 */
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SpringPressable } from '@/shared/motion/spring-pressable';

export type MultiSpec = {
  title: string;
  hint?: string;
  options: { label: string; correct: boolean }[];
};

export function MultiSelect({ spec, onSolvedChange }: { spec: MultiSpec; onSolvedChange: (solved: boolean) => void }) {
  const theme = useTheme();
  const [picked, setPicked] = useState<boolean[]>(() => spec.options.map(() => false));
  const [checked, setChecked] = useState(false);

  const solved = checked && spec.options.every((o, i) => o.correct === picked[i]);
  const anyPicked = picked.some(Boolean);

  useEffect(() => {
    onSolvedChange(solved);
    if (solved) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [solved, onSolvedChange]);

  const toggle = (i: number) => {
    if (solved) return;
    Haptics.selectionAsync();
    setChecked(false);
    setPicked((prev) => prev.map((p, idx) => (idx === i ? !p : p)));
  };

  return (
    <View>
      <ThemedText type="title" style={{ marginBottom: Spacing.two }}>{spec.title}</ThemedText>
      <ThemedText type="small" themeColor="mutedForeground" style={{ marginBottom: Spacing.four }}>
        {spec.hint ?? 'Select all that apply, then check.'}
      </ThemedText>

      <View style={{ gap: Spacing.two + 4 }}>
        {spec.options.map((o, i) => {
          const on = picked[i];
          const revealRight = checked && o.correct;
          const revealWrong = checked && on && !o.correct;
          const border = revealWrong ? theme.warning : revealRight ? theme.success : on ? theme.primary : theme.border;
          const fill = on ? border : 'transparent';
          return (
            <SpringPressable
              key={o.label}
              disabled={solved}
              onPress={() => toggle(i)}
              // Selection is the ENTIRE point of a multi-select, and it was conveyed only by a
              // tick glyph and a border colour — neither of which reaches a screen reader. With
              // no checked state a VoiceOver user cannot tell what they have picked, and
              // gates() blocks Continue on this step type, so the lesson becomes uncompletable.
              accessibilityRole="checkbox"
              accessibilityLabel={o.label}
              accessibilityState={{ checked: on, disabled: solved }}>
              <View style={[styles.row, { borderColor: border, borderWidth: on || revealRight ? 2 : StyleSheet.hairlineWidth, backgroundColor: on && !checked ? theme.primary + '14' : theme.card }]}>
                <View style={[styles.box, { borderColor: border, backgroundColor: fill }]}>
                  {on && <UIcon name="check" size={14} color="#fff" strokeWidth={3} />}
                </View>
                <ThemedText type="bodyMedium" style={{ flex: 1 }}>{o.label}</ThemedText>
                {revealRight && !on && <ThemedText type="smallBold" style={{ color: theme.success }}>answer</ThemedText>}
              </View>
            </SpringPressable>
          );
        })}
      </View>

      {solved ? (
        <Animated.View entering={FadeIn} style={{ marginTop: Spacing.three }}>
          <ThemedText type="smallBold" style={{ color: theme.success }}>Exactly — that&apos;s the full set.</ThemedText>
        </Animated.View>
      ) : (
        <SpringPressable
          disabled={!anyPicked}
          onPress={() => { setChecked(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          style={{ marginTop: Spacing.three }}
        >
          <View style={[styles.check, { backgroundColor: anyPicked ? theme.primary + '1F' : theme.muted, borderColor: anyPicked ? theme.primary + '4D' : theme.border }]}>
            <ThemedText type="smallBold" style={{ color: anyPicked ? theme.iconLilac : theme.mutedForeground }}>
              {checked ? 'Not quite — answers are marked. Fix and check again.' : 'Check answer'}
            </ThemedText>
          </View>
        </SpringPressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4, padding: Spacing.three, borderRadius: Radius.lg },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  check: { alignItems: 'center', paddingVertical: Spacing.two + 4, borderRadius: Radius.lg, borderWidth: 1 },
});
