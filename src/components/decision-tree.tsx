/**
 * Native renderer for the website curriculum's decisionTree step.
 *
 * The authored `next` index determines the branch. Feedback is shown before the learner moves,
 * then the finished result holds for production's 800ms before reporting path correctness.
 */
import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeOutLeft,
  Keyframe,
  ZoomIn,
  useReducedMotion,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { useLessonStepState } from '@/components/lesson-step-session';
import { UIcon } from '@/components/ui-icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  DECISION_TREE_RESULT_HOLD_MS,
  decisionTreeCompletion,
  decisionTreeNextLabel,
  isDecisionTreeTerminal,
  type DecisionTreeSpec,
} from '@/lib/decision-tree-model';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { Duration } from '@/shared/motion/tokens';
import { playSfx } from '@/lib/sfx';

export type { DecisionTreeSpec } from '@/lib/decision-tree-model';

export function DecisionTree({ spec, onComplete }: { spec: DecisionTreeSpec; onComplete: (correct: boolean) => void }) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [current, setCurrent] = useLessonStepState('tree.current', 0);
  const [chosen, setChosen] = useLessonStepState<number | null>('tree.chosen', null);
  const [allCorrect, setAllCorrect] = useLessonStepState('tree.allCorrect', true);
  const [done, setDone] = useLessonStepState('tree.done', false);
  const decision = spec.decisions[current];
  const selected = chosen === null ? undefined : decision?.options[chosen];

  useEffect(() => () => {
    if (completionTimer.current) clearTimeout(completionTimer.current);
  }, []);

  if (!decision && !done) return null;

  const choose = (index: number) => {
    if (chosen !== null || !decision) return;
    const option = decision.options[index];
    setChosen(index);
    if (!option.correct) setAllCorrect(false);
    Haptics.notificationAsync(
      option.correct
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error,
    );
    playSfx(option.correct ? 'correct' : 'wrong');
  };

  const move = () => {
    if (!selected) return;
    if (isDecisionTreeTerminal(selected, spec.decisions.length)) {
      const correct = decisionTreeCompletion(allCorrect, selected);
      setDone(true);
      completionTimer.current = setTimeout(
        () => onComplete(correct),
        DECISION_TREE_RESULT_HOLD_MS,
      );
      return;
    }
    setCurrent(selected.next);
    setChosen(null);
  };

  return (
    <Animated.View
      entering={reduced
        ? FadeIn.duration(Duration.fast)
        : FadeInDown.duration(Duration.base).withInitialValues({ opacity: 0, transform: [{ translateY: 20 }] })}
      style={styles.root}>
      <View style={[styles.scenario, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <ThemedText type="body" themeColor="textSecondary">{spec.scenario}</ThemedText>
      </View>

      {done ? (
        <Animated.View
          entering={reduced
            ? FadeIn.duration(Duration.fast)
            : new Keyframe({
                0: { opacity: 0, transform: [{ scale: 0.9 }] },
                100: { opacity: 1, transform: [{ scale: 1 }] },
              }).duration(Duration.base)}
          style={styles.result}
          accessible
          accessibilityRole="text">
          <Animated.View
            entering={reduced
              ? FadeIn.duration(Duration.fast)
              : ZoomIn.springify().stiffness(400).damping(18).mass(1)
                  .withInitialValues({ transform: [{ scale: 0.6 }] })}
            style={[styles.resultIcon, { backgroundColor: (allCorrect ? theme.success : theme.warning) + '26' }]}>
            <UIcon name="check" size={28} color={allCorrect ? theme.success : theme.warning} strokeWidth={3} />
          </Animated.View>
          <ThemedText type="title" style={{ color: allCorrect ? theme.success : theme.warning, textAlign: 'center' }}>
            {allCorrect ? 'Perfect decisions.' : 'Good effort. Review the feedback you saw along the way.'}
          </ThemedText>
        </Animated.View>
      ) : (
        <Animated.View
          key={current}
          entering={reduced
            ? FadeIn.duration(Duration.fast)
            : FadeInRight.duration(Duration.base).withInitialValues({ opacity: 0, transform: [{ translateX: 30 }] })}
          exiting={reduced
            ? undefined
            : FadeOutLeft.duration(Duration.exit).withTargetValues({ opacity: 0, transform: [{ translateX: -30 }] })}
          style={styles.decision}>
          <View style={styles.progress} accessible accessibilityRole="text" accessibilityLabel={`Decision ${String(current + 1)} of ${String(spec.decisions.length)}`}>
            <ThemedText type="small" themeColor="mutedForeground">Decision {current + 1} of {spec.decisions.length}</ThemedText>
            <View style={styles.dots} accessible={false}>
              {spec.decisions.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    { backgroundColor: index < current ? theme.primary : index === current ? theme.primary + 'B3' : theme.border + '66' },
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={[styles.prompt, { backgroundColor: theme.primary + '0D', borderColor: theme.primary + '33' }]}>
            <ThemedText type="bodyMedium">{decision.prompt}</ThemedText>
          </View>

          <View style={{ gap: Spacing.two + 4 }}>
            {decision.options.map((option, index) => {
              const isChosen = chosen === index;
              const selectedColor = option.correct ? theme.primary : theme.destructive;
              const border = isChosen ? selectedColor : theme.border;
              return (
                <Animated.View key={`${String(index)}-${option.label}`} style={{ opacity: chosen !== null && !isChosen ? 0.5 : 1 }}>
                  <SpringPressable
                    disabled={chosen !== null}
                    onPress={() => choose(index)}
                    accessibilityRole="button"
                    accessibilityLabel={isChosen ? `${option.label}. ${option.correct ? 'Correct.' : 'Incorrect.'}` : option.label}
                    accessibilityState={{ selected: isChosen, disabled: chosen !== null }}>
                    <View style={[styles.option, { backgroundColor: isChosen ? selectedColor : theme.card, borderColor: border, borderWidth: isChosen ? 2 : StyleSheet.hairlineWidth }]}>
                      <ThemedText type="bodyMedium" style={{ flex: 1, color: isChosen ? theme.primaryForeground : theme.text }}>{option.label}</ThemedText>
                    </View>
                  </SpringPressable>
                </Animated.View>
              );
            })}
          </View>

          {selected ? (
            <Animated.View
              entering={FadeIn.duration(reduced ? Duration.fast : Duration.base)}
              style={[styles.feedback, { backgroundColor: (selected.correct ? theme.success : theme.destructive) + '1A', borderColor: (selected.correct ? theme.success : theme.destructive) + '33' }]}>
              <ThemedText type="small" style={{ color: selected.correct ? theme.success : theme.destructive }}>{selected.feedback}</ThemedText>
            </Animated.View>
          ) : null}

          {selected ? (
            <Animated.View entering={reduced ? FadeIn.duration(Duration.fast) : FadeIn.duration(Duration.base)} style={styles.nextWrap}>
              <SpringPressable
                onPress={move}
                accessibilityRole="button"
                accessibilityLabel={decisionTreeNextLabel(selected, spec.decisions.length)}>
                <View style={[styles.next, { backgroundColor: theme.primary + '1F', borderColor: theme.primary + '4D' }]}>
                  <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>
                    {decisionTreeNextLabel(selected, spec.decisions.length)}
                  </ThemedText>
                </View>
              </SpringPressable>
            </Animated.View>
          ) : null}
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { width: '100%', maxWidth: 700, alignSelf: 'center', gap: Spacing.three, paddingHorizontal: Spacing.four, paddingBottom: Spacing.four },
  scenario: { padding: Spacing.four, borderRadius: Radius.xl, borderWidth: StyleSheet.hairlineWidth },
  decision: { width: '100%', gap: Spacing.three },
  progress: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  prompt: { width: '100%', padding: Spacing.three, borderRadius: Radius.xl, borderWidth: StyleSheet.hairlineWidth },
  option: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: Spacing.two, padding: Spacing.three, borderRadius: Radius.lg },
  feedback: { gap: Spacing.three, padding: Spacing.three, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth },
  nextWrap: { alignSelf: 'center', minWidth: 180 },
  next: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, borderRadius: Radius.lg, borderWidth: 1 },
  result: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: Spacing.three, paddingVertical: Spacing.five },
  resultIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
