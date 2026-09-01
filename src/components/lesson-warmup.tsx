import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { Atlas } from '@/components/atlas';
import { AtlasSpeech } from '@/components/atlas-speech';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { useTheme } from '@/hooks/use-theme';
import { PixelSpriteView, flame as flameSprite } from '@/lib/pixel';
import {
  buildRecallQuiz,
  completedLessonNumbers,
  type RecallQuestion,
} from '@/lib/lesson-warmup-recall';
import { SpringPressable } from '@/shared/motion/spring-pressable';

type LessonWarmupProps = {
  courseId: string;
  lessonNumber: number;
  title: string;
  completedLessonIds: string[];
  onDone: () => void;
};

export function LessonWarmup({
  courseId,
  lessonNumber,
  title,
  completedLessonIds,
  onDone,
}: LessonWarmupProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const [questions, setQuestions] = useState<RecallQuestion[] | null>(null);
  const [beat, setBeat] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    let live = true;
    const completed = completedLessonNumbers(courseId, completedLessonIds);
    buildRecallQuiz(courseId, lessonNumber, completed)
      .then((result) => { if (live) setQuestions(result); })
      .catch(() => { if (live) setQuestions([]); });
    return () => { live = false; };
  }, [completedLessonIds, courseId, lessonNumber]);

  const available = questions ?? [];
  const current = beat > 0 ? available[beat - 1] : undefined;
  const answered = picked !== null;
  const correct = answered && current ? picked === current.correct : false;
  const enter = reduced ? FadeInDown.duration(0) : FadeInDown.duration(beat === 0 ? 350 : 300);

  const start = () => {
    if (!available.length) onDone();
    else setBeat(1);
  };

  const next = () => {
    setPicked(null);
    if (beat < available.length) setBeat((currentBeat) => currentBeat + 1);
    else onDone();
  };

  return (
    <View style={styles.root}>
      {beat === 0 ? (
        <Animated.View key="warmup-intro" entering={enter} style={styles.intro}>
          <View style={styles.flameStage}>
            <PixelSpriteView sprite={flameSprite} scale={9} play="loop" />
          </View>
          <ThemedText type="title" style={styles.title}>{title}</ThemedText>
          {questions !== null && available.length > 0 ? (
            <ThemedText type="small" themeColor="mutedForeground" style={styles.subtitle}>
              First, a quick check on what you have already covered.
            </ThemedText>
          ) : null}
          <SpringPressable
            scaleTo={0.97}
            disabled={questions === null}
            onPress={start}
            style={[styles.primaryButton, { backgroundColor: theme.primary }, questions === null && styles.disabled]}
            accessibilityRole="button"
            accessibilityLabel={available.length ? 'Warm up' : 'Start lesson'}
            accessibilityState={{ disabled: questions === null }}>
            <ThemedText type="bodyMedium" style={styles.buttonText}>
              {available.length ? 'Warm up' : 'Start lesson'}
            </ThemedText>
            <UIcon name="arrowRight" size={16} color="#FFFFFF" />
          </SpringPressable>
        </Animated.View>
      ) : current ? (
        <Animated.View key={`recall-${String(beat)}`} entering={enter} style={styles.recall}>
          <View style={styles.beats}>
            {available.map((_question, index) => (
              <View
                key={index}
                style={[
                  styles.beat,
                  {
                    width: index === beat - 1 ? 22 : 8,
                    backgroundColor: index < beat ? '#F0A72B' : 'rgba(255,255,255,0.15)',
                  },
                ]}
              />
            ))}
          </View>

          <ThemedText type="label" themeColor="mutedForeground" style={styles.source}>
            FROM LESSON {current.fromLesson}: {current.fromTitle.toUpperCase()}
          </ThemedText>
          <ThemedText type="heading" style={styles.question}>{current.question}</ThemedText>

          <View style={styles.options}>
            {current.options.map((option, index) => {
              const isCorrect = index === current.correct;
              const chosen = picked === index;
              const borderColor = !answered
                ? 'rgba(255,255,255,0.10)'
                : isCorrect
                  ? theme.success
                  : chosen
                    ? theme.destructive
                    : 'rgba(255,255,255,0.06)';
              const backgroundColor = !answered
                ? 'rgba(255,255,255,0.04)'
                : isCorrect
                  ? `${theme.success}1A`
                  : chosen
                    ? `${theme.destructive}1A`
                    : 'transparent';
              return (
                <SpringPressable
                  key={option}
                  scaleTo={0.97}
                  disabled={answered}
                  onPress={() => setPicked(index)}
                  style={[styles.option, { borderColor, backgroundColor }, answered && !isCorrect && !chosen && styles.mutedOption]}
                  accessibilityRole="button"
                  accessibilityLabel={option}
                  accessibilityState={{ selected: chosen, disabled: answered }}>
                  <ThemedText type="bodyMedium" style={styles.optionText}>{option}</ThemedText>
                  {answered && isCorrect ? <UIcon name="check" size={18} color={theme.success} /> : null}
                  {answered && chosen && !isCorrect ? <UIcon name="close" size={18} color={theme.destructive} /> : null}
                </SpringPressable>
              );
            })}
          </View>

          {answered ? (
            <View style={styles.feedback}>
              {!correct ? (
                <View style={styles.correction}>
                  <Atlas size={52} expression="oops" interactive={false} />
                  <AtlasSpeech text={`It was “${current.options[current.correct]}”.`} maxWidth={300} />
                </View>
              ) : null}
              <SpringPressable
                scaleTo={0.97}
                onPress={next}
                style={[styles.primaryButton, { backgroundColor: theme.primary }]}
                accessibilityRole="button"
                accessibilityLabel={beat < available.length ? 'Next warmup question' : 'Start lesson'}>
                <ThemedText type="bodyMedium" style={styles.buttonText}>
                  {beat < available.length ? 'Next' : 'Start lesson'}
                </ThemedText>
                <UIcon name="arrowRight" size={16} color="#FFFFFF" />
              </SpringPressable>
            </View>
          ) : null}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  intro: { width: '100%', maxWidth: 448, alignItems: 'center' },
  flameStage: { alignItems: 'center', justifyContent: 'center', padding: 40, marginBottom: 16 },
  title: { textAlign: 'center', lineHeight: 32 },
  subtitle: { textAlign: 'center', lineHeight: 20, marginTop: 12 },
  primaryButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 32, paddingHorizontal: 32, borderRadius: 999 },
  disabled: { opacity: 0.45 },
  buttonText: { color: '#FFFFFF' },
  recall: { width: '100%', maxWidth: 576, alignItems: 'center' },
  beats: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  beat: { height: 6, borderRadius: 999 },
  source: { textAlign: 'center', fontSize: 11, lineHeight: 15, letterSpacing: 1.3, marginBottom: 8 },
  question: { textAlign: 'center', fontSize: 20, lineHeight: 28, marginBottom: 24 },
  options: { width: '100%', gap: 10 },
  option: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16, borderWidth: 1 },
  optionText: { flex: 1, color: '#F2EFF7', fontSize: 15, lineHeight: 21 },
  mutedOption: { opacity: 0.5 },
  feedback: { width: '100%', alignItems: 'center', marginTop: 20 },
  correction: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
});
