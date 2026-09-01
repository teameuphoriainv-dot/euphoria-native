import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeOutLeft,
  Keyframe,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { SparkBurst } from '@/components/lesson-feedback';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Button, SlabButton } from '@/components/ui/button';
import { Radius, Spacing } from '@/constants/theme';
import { useMasteryHints } from '@/hooks/use-mastery-hints';
import { useTheme } from '@/hooks/use-theme';
import type { ChallengeQuestion } from '@/lib/curriculum';
import {
  CHALLENGE_FAILURE_HOLD_MS,
  CHALLENGE_HEARTS,
  gradeChallengeAnswer,
  nextChallengePhase,
  shuffleChallengeQuestions,
} from '@/lib/mastery-challenge-model';
import { PixelSpriteView, heart, lightbulb, trophy } from '@/lib/pixel';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { Duration } from '@/shared/motion/tokens';

type Phase = 'quiz' | 'passed' | 'failed';

export function MasteryChallengeRound({
  questions,
  lessonTitle,
  onPass,
  onFail,
}: {
  questions: ChallengeQuestion[];
  lessonTitle: string;
  onPass: () => void;
  onFail: () => void;
}) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hearts, setHearts] = useState(CHALLENGE_HEARTS);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [phase, setPhase] = useState<Phase>('quiz');
  const [eliminated, setEliminated] = useState<Set<number>>(() => new Set());
  const [shuffleKey, setShuffleKey] = useState(0);
  const failureTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trophyProgress = useSharedValue(reduced ? 1 : 0);
  const { hints, spendHint, remainingMs } = useMasteryHints();
  const activeQuestions = useMemo(
    () => shuffleChallengeQuestions(questions),
    // A retry intentionally reshuffles exactly once; normal re-renders preserve the choices.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questions, shuffleKey],
  );
  const current = activeQuestions[currentIdx];
  const answerCorrect = submitted && selected === current?.correct;

  useEffect(() => () => {
    if (failureTimer.current) clearTimeout(failureTimer.current);
  }, []);

  useEffect(() => {
    if (phase !== 'passed') return;
    trophyProgress.set(reduced ? 1 : withTiming(1, { duration: 260 }));
  }, [phase, reduced, trophyProgress]);

  const trophyStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${String(-20 * (1 - trophyProgress.get()))}deg` },
      { scale: trophyProgress.get() },
    ],
  }));

  const useHint = () => {
    if (submitted || !current || hints <= 0 || !spendHint()) return;
    const wrong = current.options
      .map((_, index) => index)
      .filter((index) => index !== current.correct && !eliminated.has(index));
    if (wrong.length === 0) return;
    const removed = wrong[Math.floor(Math.random() * wrong.length)];
    setEliminated((prior) => new Set([...prior, removed]));
    if (selected === removed) setSelected(null);
  };

  const submit = () => {
    if (selected === null || submitted || !current) return;
    const result = gradeChallengeAnswer(selected, current.correct, hearts);
    setSubmitted(true);
    setHearts(result.hearts);
    void Haptics.notificationAsync(result.correct
      ? Haptics.NotificationFeedbackType.Success
      : Haptics.NotificationFeedbackType.Error);
    if (result.failed) {
      failureTimer.current = setTimeout(() => {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setPhase('failed');
      }, CHALLENGE_FAILURE_HOLD_MS);
    }
  };

  const continueChallenge = () => {
    if (!current) return;
    if (nextChallengePhase(currentIdx, activeQuestions.length) === 'question') {
      setCurrentIdx((index) => index + 1);
      setSelected(null);
      setSubmitted(false);
      setEliminated(new Set());
      return;
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPhase('passed');
  };

  const retry = () => {
    if (failureTimer.current) clearTimeout(failureTimer.current);
    trophyProgress.set(reduced ? 1 : 0);
    setCurrentIdx(0);
    setHearts(CHALLENGE_HEARTS);
    setSelected(null);
    setSubmitted(false);
    setEliminated(new Set());
    setShuffleKey((key) => key + 1);
    setPhase('quiz');
  };

  const resultEntrance = reduced
    ? FadeIn.duration(Duration.fast)
    : new Keyframe({
        0: { opacity: 0, transform: [{ scale: 0.9 }] },
        100: { opacity: 1, transform: [{ scale: 1 }] },
      }).duration(Duration.base);

  if (phase === 'passed') {
    return (
      <Animated.View entering={resultEntrance} style={styles.result}>
        <Animated.View style={[styles.trophy, { backgroundColor: theme.success + '33' }, trophyStyle]}>
          <PixelSpriteView sprite={trophy} size={64} play="once" />
        </Animated.View>
        <ThemedText type="display" style={styles.center}>Mastery Achieved!</ThemedText>
        <ThemedText type="body" themeColor="mutedForeground" style={styles.center}>
          You passed the challenge with {hearts} heart{hearts === 1 ? '' : 's'} remaining.
        </ThemedText>
        <HeartRow hearts={hearts} />
        <Button label="Continue" onPress={onPass} style={styles.resultButton} />
      </Animated.View>
    );
  }

  if (phase === 'failed') {
    return (
      <Animated.View entering={resultEntrance} style={styles.result}>
        <View style={[styles.trophy, { backgroundColor: theme.destructive + '33' }]}>
          <PixelSpriteView sprite={heart} size={64} />
        </View>
        <ThemedText type="display" style={styles.center}>Out of Hearts</ThemedText>
        <ThemedText type="body" themeColor="mutedForeground" style={styles.center}>
          Don&apos;t worry: you only need to redo the challenge questions, not the whole lesson.
        </ThemedText>
        <View style={styles.resultActions}>
          <Button label="Try Again" onPress={retry} style={styles.resultButton} />
          <Button label="Exit" variant="ghost" onPress={onFail} style={styles.resultButton} />
        </View>
      </Animated.View>
    );
  }

  if (!current) return null;
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <Animated.View
        entering={reduced
          ? FadeIn.duration(Duration.fast)
          : FadeInDown.duration(Duration.base).withInitialValues({ opacity: 0, transform: [{ translateY: 20 }] })}
        style={styles.round}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <ThemedText type="smallBold" style={{ color: theme.primary }}>Mastery challenge</ThemedText>
            <ThemedText type="small" themeColor="mutedForeground">{lessonTitle}</ThemedText>
          </View>
          <View style={styles.resources}>
            <SpringPressable
              haptic={false}
              disabled={submitted || hints <= 0}
              onPress={useHint}
              accessibilityRole="button"
              accessibilityLabel={`Use a hint. ${String(hints)} left.`}
              accessibilityHint={remainingMs > 0 ? 'Free hints reset later.' : undefined}
              style={[styles.hint, { backgroundColor: theme.warning + (hints > 0 && !submitted ? '33' : '14') }]}>
              <PixelSpriteView sprite={lightbulb} size={16} />
              <ThemedText type="smallBold" style={{ color: hints > 0 && !submitted ? theme.warning : theme.mutedForeground }}>{hints}</ThemedText>
            </SpringPressable>
            <HeartRow hearts={hearts} compact />
          </View>
        </View>

        <View style={styles.dots} accessibilityRole="text" accessibilityLabel={`Question ${String(currentIdx + 1)} of ${String(activeQuestions.length)}`}>
          {activeQuestions.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index < currentIdx
                  ? { backgroundColor: theme.success }
                  : index === currentIdx
                    ? { backgroundColor: theme.primary, borderColor: theme.primary + '4D', borderWidth: 3 }
                    : { backgroundColor: theme.muted },
              ]}
            />
          ))}
        </View>

        <Animated.View
          key={currentIdx}
          entering={reduced
            ? FadeIn.duration(Duration.fast)
            : FadeInRight.duration(Duration.base).withInitialValues({ opacity: 0, transform: [{ translateX: 30 }] })}
          exiting={reduced
            ? undefined
            : FadeOutLeft.duration(Duration.exit).withTargetValues({ opacity: 0, transform: [{ translateX: -30 }] })}
          style={styles.question}>
          <ThemedText type="heading" style={styles.questionText}>{current.question}</ThemedText>
          <View style={styles.options}>
            {current.options.map((option, index) => {
              const isSelected = selected === index;
              const isEliminated = eliminated.has(index);
              const showCorrect = submitted && index === current.correct;
              const showWrong = submitted && isSelected && index !== current.correct;
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
                  ? theme.destructive
                  : isSelected
                    ? theme.primary
                    : theme.card;
              return (
                <ChallengeOption key={`${String(index)}-${option}`} eliminated={isEliminated}>
                  <SpringPressable
                    disabled={submitted || isEliminated}
                    scaleTo={0.97}
                    onPress={() => setSelected(index)}
                    accessibilityLabel={`${option}${isEliminated ? '. Eliminated by hint.' : showCorrect ? '. Correct answer.' : showWrong ? '. Incorrect.' : ''}`}
                    accessibilityState={{ selected: isSelected, disabled: submitted || isEliminated }}>
                    <View style={[styles.option, { borderColor, backgroundColor }]}>
                      <ThemedText
                        type="bodyMedium"
                        style={[
                          styles.optionText,
                          isEliminated && styles.eliminatedText,
                          showCorrect && { color: theme.success },
                          (showWrong || (isSelected && !submitted)) && { color: theme.primaryForeground },
                        ]}>
                        {option}
                      </ThemedText>
                      {showCorrect ? <UIcon name="check" size={20} color={theme.success} strokeWidth={3} /> : null}
                      {showWrong ? <UIcon name="close" size={20} color={theme.primaryForeground} strokeWidth={3} /> : null}
                    </View>
                  </SpringPressable>
                </ChallengeOption>
              );
            })}
          </View>

          {selected !== null && !submitted ? (
            <Animated.View entering={FadeIn.duration(Duration.base)} style={styles.action}>
              <Button label="Submit" onPress={submit} style={styles.submit} />
            </Animated.View>
          ) : null}

          {submitted ? (
            <Animated.View entering={FadeIn.duration(Duration.base)} style={styles.feedback}>
              {answerCorrect ? <SparkBurst size={150} color={theme.success} /> : null}
              <View style={[styles.feedbackCard, { backgroundColor: (answerCorrect ? theme.success : theme.destructive) + '1A' }]}>
                <ThemedText type="small" style={[styles.center, { color: answerCorrect ? theme.success : theme.destructive }]}>
                  {current.explanation}
                </ThemedText>
              </View>
              {hearts > 0 ? <SlabButton label="Continue" full onPress={continueChallenge} /> : null}
            </Animated.View>
          ) : null}
        </Animated.View>
      </Animated.View>
    </ScrollView>
  );
}

function HeartRow({ hearts, compact = false }: { hearts: number; compact?: boolean }) {
  return (
    <View style={styles.hearts} accessibilityRole="text" accessibilityLabel={`${String(hearts)} hearts remaining`}>
      {Array.from({ length: CHALLENGE_HEARTS }).map((_, index) => (
        <Animated.View
          key={index}
          style={{ opacity: index < hearts ? 1 : 0.25, transform: [{ scale: index < hearts ? 1 : 0.5 }] }}>
          <PixelSpriteView sprite={heart} size={compact ? 24 : 32} />
        </Animated.View>
      ))}
    </View>
  );
}

function ChallengeOption({ eliminated, children }: { eliminated: boolean; children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(eliminated ? 1 : 0);
  useEffect(() => {
    progress.set(reduced ? (eliminated ? 1 : 0) : withTiming(eliminated ? 1 : 0, { duration: 300 }));
  }, [eliminated, progress, reduced]);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.get() * 0.7,
    transform: [{ translateX: -8 * progress.get() }, { scale: 1 - 0.05 * progress.get() }],
  }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { flexGrow: 1, alignItems: 'center', paddingBottom: 40 },
  round: { width: '100%', maxWidth: 680, alignItems: 'center', gap: 20 },
  header: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  headerCopy: { flex: 1, gap: 2 },
  resources: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hint: { minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill },
  hearts: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  question: { width: '100%', alignItems: 'center', gap: 20 },
  questionText: { textAlign: 'center', fontSize: 19, lineHeight: 27 },
  options: { alignSelf: 'stretch', gap: 12 },
  option: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: 20, paddingVertical: 16, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth },
  optionText: { flex: 1, fontSize: 16, lineHeight: 23 },
  eliminatedText: { textDecorationLine: 'line-through' },
  action: { alignItems: 'center' },
  submit: { minWidth: 150 },
  feedback: { alignSelf: 'stretch', alignItems: 'center', gap: Spacing.three },
  feedbackCard: { alignSelf: 'stretch', padding: Spacing.three, borderRadius: Radius.lg },
  result: { flex: 1, width: '100%', maxWidth: 440, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', gap: 20, paddingHorizontal: 16, paddingVertical: 48 },
  trophy: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
  resultActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 12 },
  resultButton: { minWidth: 130 },
});
