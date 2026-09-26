import * as Haptics from '@/lib/haptics';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeOut,
  FadeOutDown,
  FadeOutLeft,
  useReducedMotion,
} from 'react-native-reanimated';

import { AtlasCorrection } from '@/components/atlas-correction';
import { useLessonStepState } from '@/components/lesson-step-session';
import { ThemedText } from '@/components/themed-text';
import { SlabButton } from '@/components/ui/button';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  advanceTrueFalse,
  answerTrueFalse,
  canAnswerTrueFalse,
  createTrueFalseState,
  didPassTrueFalse,
  finishTrueFalseTransition,
  trueFalseFeedback,
  type TrueFalseSpec,
  type TrueFalseState,
} from '@/lib/true-false-model';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { Duration } from '@/shared/motion/tokens';

export function TrueFalseSequence({
  spec,
  onSolvedChange,
  onComplete,
}: {
  spec: TrueFalseSpec;
  onSolvedChange: (solved: boolean) => void;
  onComplete: (passed: boolean) => void;
}) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const [flow, setFlow] = useLessonStepState<TrueFalseState>('trueFalse.flow', createTrueFalseState);
  const current = spec.statements[flow.index];
  const answered = spec.statements[flow.answeredIndex ?? flow.index];

  useEffect(() => {
    if (flow.phase !== 'transition') return;
    const visibleIndex = flow.index;
    const timer = setTimeout(
      () => setFlow((latest) => finishTrueFalseTransition(latest, visibleIndex)),
      reduced ? 0 : Duration.exit,
    );
    return () => clearTimeout(timer);
  }, [flow.index, flow.phase, reduced, setFlow]);

  if (!current || !answered) {
    return (
      <View style={styles.empty}>
        <ThemedText type="body" themeColor="mutedForeground">No statements are available.</ThemedText>
      </View>
    );
  }

  const choose = (value: boolean) => {
    const next = answerTrueFalse(flow, spec.statements, { visibleIndex: flow.index, value });
    if (next === flow) return;
    setFlow(next);
    Haptics.notificationAsync(
      next.lastCorrect
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error,
    );
  };

  const nextStatement = () => {
    const next = advanceTrueFalse(flow, spec.statements.length);
    if (next === flow) return;
    setFlow(next);
    if (next.phase === 'complete') {
      const passed = didPassTrueFalse(next, spec.statements.length);
      onSolvedChange(passed);
      onComplete(passed);
    }
  };

  if (flow.phase === 'complete') {
    return (
      <View style={styles.empty}>
        <ThemedText type="title">Statement set complete</ThemedText>
        <ThemedText type="small" themeColor="mutedForeground">
          {flow.score} of {spec.statements.length} correct
        </ThemedText>
      </View>
    );
  }

  const correct = flow.lastCorrect === true;
  const feedback = trueFalseFeedback(answered, correct);
  const cardBorder = flow.lastCorrect === null
    ? theme.border
    : correct
      ? theme.success + '80'
      : theme.destructive + '80';
  const cardBackground = flow.lastCorrect === null
    ? theme.card
    : correct
      ? theme.success + '1A'
      : theme.destructive + '1A';

  return (
    <Animated.View
      entering={reduced ? FadeIn.duration(Duration.fast) : FadeInDown.duration(Duration.base)}
      style={styles.shell}>
      <ThemedText type="small" themeColor="mutedForeground">
        {flow.index + 1} of {spec.statements.length}
      </ThemedText>

      <Animated.View
        key={`statement-${String(flow.index)}`}
        entering={reduced ? FadeIn.duration(Duration.fast) : FadeInRight.duration(Duration.exit)}
        exiting={reduced ? FadeOut.duration(Duration.exit) : FadeOutLeft.duration(Duration.exit)}
        style={[styles.statement, { borderColor: cardBorder, backgroundColor: cardBackground }]}
        accessibilityRole="text"
        accessibilityLabel={`Statement ${String(flow.index + 1)} of ${String(spec.statements.length)}. ${current.s}${flow.lastCorrect === null ? '' : correct ? ' Correct.' : ' Incorrect.'}`}>
        <ThemedText type="heading" style={styles.statementText}>{current.s}</ThemedText>
      </Animated.View>

      {canAnswerTrueFalse(flow) ? (
        <View style={styles.answers}>
          <AnswerButton label="True" color={theme.success} onPress={() => choose(true)} />
          <AnswerButton label="False" color={theme.destructive} onPress={() => choose(false)} />
        </View>
      ) : null}

      {flow.phase === 'explanation' ? (
        <Animated.View
          entering={reduced ? FadeIn.duration(Duration.fast) : FadeInDown.duration(Duration.exit)}
          exiting={reduced ? FadeOut.duration(Duration.exit) : FadeOutDown.duration(Duration.exit)}
          style={styles.feedback}
          accessibilityLiveRegion="polite">
          <AtlasCorrection
            show={feedback.showCorrection}
            answer={feedback.answer}
            reason={feedback.reason}
          />
          <SlabButton
            label={flow.index + 1 < spec.statements.length ? 'Next Statement' : 'Finish'}
            full
            onPress={nextStatement}
          />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

function AnswerButton({ label, color, onPress }: { label: string; color: string; onPress: () => void }) {
  return (
    <SpringPressable
      onPress={onPress}
      scaleTo={0.97}
      accessibilityRole="button"
      accessibilityLabel={`${label}. Choose ${label.toLowerCase()}.`}
      style={[styles.answer, { borderColor: color + '66', backgroundColor: color + '0D' }]}>
      <ThemedText type="heading" style={{ color }}>{label}</ThemedText>
    </SpringPressable>
  );
}

const styles = StyleSheet.create({
  shell: { alignItems: 'center', gap: Spacing.three, paddingBottom: Spacing.four },
  statement: { width: '100%', padding: Spacing.four, borderRadius: Radius.xl, borderWidth: 1 },
  statementText: { textAlign: 'center', lineHeight: 28 },
  answers: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.three, width: '100%' },
  answer: { minWidth: 124, alignItems: 'center', paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, borderRadius: Radius.lg, borderWidth: 1 },
  feedback: { width: '100%', gap: Spacing.three },
  empty: { minHeight: 220, alignItems: 'center', justifyContent: 'center', gap: Spacing.two },
});
