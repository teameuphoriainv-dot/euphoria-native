/**
 * Native renderer for the website curriculum's decisionTree step.
 *
 * The authored `next` index determines the branch. Feedback is shown before the learner moves,
 * and Continue stays gated until a branch reaches the end of the tree.
 */
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SpringPressable } from '@/shared/motion/spring-pressable';

export type DecisionTreeSpec = {
  scenario: string;
  decisions: {
    prompt: string;
    options: { label: string; next: number; feedback: string; correct: boolean }[];
  }[];
};

export function DecisionTree({ spec, onSolvedChange }: { spec: DecisionTreeSpec; onSolvedChange: (solved: boolean) => void }) {
  const theme = useTheme();
  const [current, setCurrent] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [allCorrect, setAllCorrect] = useState(true);
  const [done, setDone] = useState(false);
  const decision = spec.decisions[current];
  const selected = chosen === null ? undefined : decision?.options[chosen];

  useEffect(() => {
    onSolvedChange(done);
  }, [done, onSolvedChange]);

  if (!decision && !done) return null;

  const choose = (index: number) => {
    if (chosen !== null || !decision) return;
    const option = decision.options[index];
    setChosen(index);
    if (!option.correct) setAllCorrect(false);
    Haptics.notificationAsync(
      option.correct
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning,
    );
  };

  const move = () => {
    if (!selected) return;
    if (selected.next < 0 || selected.next >= spec.decisions.length) {
      setDone(true);
      return;
    }
    setCurrent(selected.next);
    setChosen(null);
  };

  return (
    <View style={{ gap: Spacing.three }}>
      <View style={[styles.scenario, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <ThemedText type="label" style={{ color: theme.iconLilac }}>SCENARIO</ThemedText>
        <ThemedText type="body" themeColor="textSecondary">{spec.scenario}</ThemedText>
      </View>

      {done ? (
        <View style={[styles.result, { backgroundColor: theme.primary + '14', borderColor: theme.primary + '3D' }]} accessible accessibilityRole="text">
          <UIcon name="check" size={24} color={allCorrect ? theme.success : theme.iconGold} strokeWidth={3} />
          <ThemedText type="title" style={{ color: allCorrect ? theme.success : theme.iconGold }}>
            {allCorrect ? 'Perfect decisions.' : 'Decision path complete.'}
          </ThemedText>
          {!allCorrect ? (
            <ThemedText type="small" themeColor="mutedForeground" style={{ textAlign: 'center' }}>
              Review the feedback from each choice, then continue.
            </ThemedText>
          ) : null}
        </View>
      ) : (
        <>
          <View style={styles.progress} accessible accessibilityRole="text" accessibilityLabel={`Decision ${String(current + 1)} of ${String(spec.decisions.length)}`}>
            <ThemedText type="label" themeColor="mutedForeground">DECISION {current + 1} OF {spec.decisions.length}</ThemedText>
            <View style={styles.dots} accessible={false}>
              {spec.decisions.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    { backgroundColor: index <= current ? theme.primary : theme.border },
                  ]}
                />
              ))}
            </View>
          </View>

          <ThemedText type="title">{decision.prompt}</ThemedText>

          <View style={{ gap: Spacing.two + 4 }}>
            {decision.options.map((option, index) => {
              const isChosen = chosen === index;
              const border = isChosen
                ? option.correct ? theme.success : theme.warning
                : theme.border;
              return (
                <SpringPressable
                  key={`${String(index)}-${option.label}`}
                  disabled={chosen !== null}
                  onPress={() => choose(index)}
                  accessibilityRole="button"
                  accessibilityLabel={isChosen ? `${option.label}. ${option.correct ? 'Correct.' : 'Incorrect.'}` : option.label}
                  accessibilityState={{ selected: isChosen, disabled: chosen !== null }}>
                  <View style={[styles.option, { backgroundColor: isChosen ? border + '14' : theme.card, borderColor: border, borderWidth: isChosen ? 2 : StyleSheet.hairlineWidth }]}>
                    <ThemedText type="bodyMedium" style={{ flex: 1 }}>{option.label}</ThemedText>
                    {isChosen ? <UIcon name={option.correct ? 'check' : 'close'} size={20} color={border} strokeWidth={3} /> : null}
                  </View>
                </SpringPressable>
              );
            })}
          </View>

          {selected ? (
            <View style={[styles.feedback, { backgroundColor: (selected.correct ? theme.success : theme.warning) + '14', borderColor: (selected.correct ? theme.success : theme.warning) + '3D' }]}>
              <ThemedText type="small" themeColor="textSecondary">{selected.feedback}</ThemedText>
              <SpringPressable
                onPress={move}
                accessibilityRole="button"
                accessibilityLabel={selected.next < 0 || selected.next >= spec.decisions.length ? 'Finish decision path' : 'Next decision'}>
                <View style={[styles.next, { backgroundColor: theme.primary + '1F', borderColor: theme.primary + '4D' }]}>
                  <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>
                    {selected.next < 0 || selected.next >= spec.decisions.length ? 'Finish' : 'Next decision'}
                  </ThemedText>
                  <UIcon name="arrowRight" size={16} color={theme.iconLilac} />
                </View>
              </SpringPressable>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scenario: { gap: Spacing.two, padding: Spacing.three, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth },
  progress: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  option: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: Spacing.two, padding: Spacing.three, borderRadius: Radius.lg },
  feedback: { gap: Spacing.three, padding: Spacing.three, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth },
  next: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, borderRadius: Radius.lg, borderWidth: 1 },
  result: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: Spacing.two, padding: Spacing.four, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth },
});
