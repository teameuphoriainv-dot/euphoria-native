import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useReducedMotion } from 'react-native-reanimated';

import { useLessonStepState } from '@/components/lesson-step-session';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { FontSize, Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { Duration } from '@/shared/motion/tokens';

export type ProgressiveCalcQuiz = {
  prompt: string;
  options: string[];
  correct: number;
  explanation?: string;
};

export type ProgressiveCalcWalkthrough = {
  label: string;
  formula: string;
  result: string;
};

export type ProgressiveCalcSpec = {
  title: string;
  calcSteps: (ProgressiveCalcQuiz | ProgressiveCalcWalkthrough)[];
};

const isWalkthrough = (
  step: ProgressiveCalcQuiz | ProgressiveCalcWalkthrough | undefined,
): step is ProgressiveCalcWalkthrough => Boolean(step && 'label' in step);

/**
 * The production web progressive-calculation scene, kept as one authored lesson step.
 *
 * Quiz calculations advance internally after 800ms unless the author supplied working-out, in
 * which case the learner explicitly continues after reading it. Walkthrough calculations reveal
 * one authored line at a time. The outer lesson progress advances only after the whole calculation
 * finishes, matching the website rather than turning one authored scene into 3–8 native screens.
 */
export function ProgressiveCalc({
  spec,
  onComplete,
}: {
  spec: ProgressiveCalcSpec;
  onComplete: (passed: boolean) => void;
}) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const [index, setIndex] = useLessonStepState('progressive.index', 0);
  const [score, setScore] = useLessonStepState('progressive.score', 0);
  const [selected, setSelected] = useLessonStepState<number | null>('progressive.selected', null);
  const [revealed, setRevealed] = useLessonStepState('progressive.revealed', 1);
  const [finished, setFinished] = useLessonStepState('progressive.finished', false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const steps = spec.calcSteps;
  const current = steps[Math.min(index, Math.max(steps.length - 1, 0))];
  const walkthrough = isWalkthrough(steps[0]);

  const finish = (passed: boolean) => {
    if (finished) return;
    setFinished(true);
    onComplete(passed);
  };

  const advanceQuiz = (nextScore: number) => {
    if (index + 1 < steps.length) {
      setIndex(index + 1);
      setSelected(null);
      return;
    }
    finish(nextScore >= Math.ceil(steps.length / 2));
  };

  const pick = (optionIndex: number) => {
    if (selected !== null || !current || isWalkthrough(current)) return;
    const correct = optionIndex === current.correct;
    const nextScore = score + (correct ? 1 : 0);
    setSelected(optionIndex);
    if (correct) setScore(nextScore);
    if (current.explanation) return;
    timer.current = setTimeout(() => advanceQuiz(nextScore), reduced ? 0 : 800);
  };

  if (!current || steps.length === 0) return null;

  if (walkthrough) {
    const walkthroughSteps = steps.filter(isWalkthrough);
    const allRevealed = revealed >= walkthroughSteps.length;
    return (
      <View style={styles.root}>
        <ThemedText type="heading" style={styles.center}>{spec.title}</ThemedText>
        <ThemedText type="small" themeColor="mutedForeground" style={styles.center}>
          Follow the calculation, step by step
        </ThemedText>

        <View style={styles.stack}>
          {walkthroughSteps.slice(0, revealed).map((step, stepIndex) => (
            <Animated.View
              key={`${stepIndex}-${step.label}`}
              entering={reduced ? undefined : FadeIn.duration(350)}
              style={[
                styles.walkthroughCard,
                {
                  borderColor: theme.border,
                  backgroundColor: stepIndex === walkthroughSteps.length - 1
                    ? theme.success + '1A'
                    : theme.card,
                },
              ]}>
              <View style={styles.walkthroughCopy}>
                <ThemedText type="smallBold">{step.label}</ThemedText>
                <ThemedText type="small" themeColor="mutedForeground">{step.formula}</ThemedText>
              </View>
              <ThemedText type="heading" style={{ color: theme.success }}>{step.result}</ThemedText>
            </Animated.View>
          ))}
        </View>

        <Button
          label={allRevealed ? 'Continue' : 'Reveal next step'}
          onPress={() => {
            if (allRevealed) finish(true);
            else setRevealed(Math.min(revealed + 1, walkthroughSteps.length));
          }}
          style={styles.action}
        />
      </View>
    );
  }

  const quiz = current as ProgressiveCalcQuiz;
  const selectedCorrect = selected === quiz.correct;
  return (
    <View style={styles.root}>
      <ThemedText type="heading" style={styles.center}>{spec.title}</ThemedText>
      <ThemedText type="small" themeColor="mutedForeground" style={styles.center}>
        {`Step ${index + 1} of ${steps.length}`}
      </ThemedText>

      <Animated.View
        key={index}
        entering={reduced ? undefined : FadeIn.duration(Duration.base)}
        exiting={reduced ? undefined : FadeOut.duration(Duration.exit)}
        style={[styles.promptCard, { borderColor: theme.border, backgroundColor: theme.card }]}>
        <ThemedText type="body" style={styles.center}>{quiz.prompt}</ThemedText>
      </Animated.View>

      <View style={styles.options}>
        {quiz.options.map((option, optionIndex) => {
          const isSelected = selected === optionIndex;
          const showCorrect = selected !== null && optionIndex === quiz.correct;
          const showWrong = isSelected && !showCorrect;
          const borderColor = showCorrect
            ? theme.success
            : showWrong
              ? theme.destructive
              : isSelected
                ? theme.primary
                : theme.border;
          const backgroundColor = showCorrect
            ? theme.success + '1A'
            : showWrong
              ? theme.destructive + '1A'
              : isSelected
                ? theme.primary + '1A'
                : theme.card;
          return (
            <SpringPressable
              key={`${optionIndex}-${option}`}
              disabled={selected !== null}
              onPress={() => pick(optionIndex)}
              accessibilityRole="button"
              accessibilityLabel={showCorrect ? `${option}. Correct answer.` : showWrong ? `${option}. Incorrect.` : option}
              accessibilityState={{ disabled: selected !== null, selected: isSelected }}
              style={[styles.option, { borderColor, backgroundColor }]}>
              <ThemedText type="smallBold" style={styles.optionText}>{option}</ThemedText>
            </SpringPressable>
          );
        })}
      </View>

      {quiz.explanation && selected !== null ? (
        <Animated.View
          entering={reduced ? undefined : FadeIn.duration(Duration.base)}
          style={[styles.explanation, { borderColor: theme.border, backgroundColor: theme.card }]}>
          <ThemedText type="small" themeColor="mutedForeground">{quiz.explanation}</ThemedText>
          <Button
            label="Continue"
            onPress={() => advanceQuiz(score)}
            style={styles.explanationAction}
          />
        </Animated.View>
      ) : null}

      {selected !== null && !quiz.explanation ? (
        <ThemedText
          accessibilityLiveRegion="polite"
          type="smallBold"
          style={[styles.center, { color: selectedCorrect ? theme.success : theme.destructive }]}>
          {selectedCorrect ? 'Correct' : 'Not quite'}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
  },
  center: { textAlign: 'center' },
  stack: { gap: 10 },
  walkthroughCard: {
    minHeight: 68,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  walkthroughCopy: { flex: 1, gap: 2 },
  action: { alignSelf: 'center', minWidth: 180 },
  promptCard: {
    width: '100%',
    minHeight: 92,
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: 20,
  },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  option: {
    minHeight: 48,
    minWidth: '47%',
    flexGrow: 1,
    flexBasis: 150,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.small,
    textAlign: 'center',
  },
  explanation: {
    width: '100%',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  explanationAction: { alignSelf: 'flex-start', minWidth: 140 },
});
