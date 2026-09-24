/**
 * Production-parity slider lesson step.
 *
 * The learner can tap or drag continuously until Submit. Submission freezes the chosen value,
 * grades it against the authored tolerance, then reveals and snaps to the exact answer after the
 * same 300ms beat as web. The learner advances explicitly with Continue, even after a close guess.
 */
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  type LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { Atlas } from '@/components/atlas';
import { AtlasCorrection } from '@/components/atlas-correction';
import { SparkBurst } from '@/components/lesson-feedback';
import { useLessonStepState } from '@/components/lesson-step-session';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  changeNumberLineValue,
  initialNumberLineValue,
  NUMBER_LINE_REVEAL_MS,
  numberLineDisplayValue,
  numberLinePassed,
  numberLinePhase,
  numberLineValueAtX,
  shouldNumberLineClaimGesture,
  type NumberLineSpec,
} from '@/lib/number-line-model';

export type { NumberLineSpec } from '@/lib/number-line-model';

type NumberLineProps = {
  spec: NumberLineSpec;
  onSolvedChange: (solved: boolean) => void;
  onComplete: (passed: boolean) => void;
};

export function NumberLine({ spec, onSolvedChange, onComplete }: NumberLineProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const fmt = spec.format ?? ((current: number) => `${String(current)}${spec.unit ?? ''}`);
  const [width, setWidth] = useState(0);
  const [value, setValue] = useLessonStepState('line.value', () => initialNumberLineValue(spec));
  // Retain the historical snapshot key: Previous -> forward restores a frozen submission.
  const [submitted, setSubmitted] = useLessonStepState('line.checked', false);
  const [showReveal, setShowReveal] = useLessonStepState('line.reveal', false);
  const phase = numberLinePhase(submitted, showReveal);

  const isClose = numberLinePassed(value, spec);
  const shownValue = numberLineDisplayValue(value, showReveal, spec);
  const span = Math.max(spec.max - spec.min, Number.EPSILON);
  const percent = Math.max(0, Math.min(1, (shownValue - spec.min) / span));
  const percentStyle = `${percent * 100}%` as `${number}%`;

  useEffect(() => {
    onSolvedChange(phase === 'revealed');
  }, [onSolvedChange, phase]);

  useEffect(() => {
    if (phase !== 'waiting') return;
    const revealTimer = setTimeout(() => setShowReveal(true), NUMBER_LINE_REVEAL_MS);
    return () => clearTimeout(revealTimer);
  }, [phase, setShowReveal]);

  const change = useCallback((next: number) => {
    if (submitted) return;
    setValue((current) => changeNumberLineValue(current, next, submitted, spec));
  }, [setValue, spec, submitted]);

  const placeAt = useCallback((x: number) => {
    if (submitted || width <= 0) return;
    change(numberLineValueAtX(x, width, spec));
  }, [change, spec, submitted, width]);

  // Handlers live on a plain View whose track children are pointerEvents="none", so locationX is always
  // relative to this hit area. On a Pressable they were silently discarded (Pressable spreads its
  // own responder handlers after any passed in), so only taps worked and a drag reached the
  // navigator's swipe-back instead, closing the lesson.
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !submitted,
    onMoveShouldSetPanResponder: (_event, gesture) => shouldNumberLineClaimGesture(gesture.dx, gesture.dy, submitted),
    onPanResponderGrant: (event) => {
      placeAt(event.nativeEvent.locationX);
      void Haptics.selectionAsync();
    },
    onPanResponderMove: (event) => placeAt(event.nativeEvent.locationX),
    onPanResponderRelease: (event) => placeAt(event.nativeEvent.locationX),
    // Once a horizontal adjustment begins, the surrounding vertical ScrollView must not take it.
    onPanResponderTerminationRequest: () => false,
  }), [placeAt, submitted]);

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  const nudge = (direction: 1 | -1) => {
    if (submitted) return;
    change(value + direction * (spec.step ?? 1));
    void Haptics.selectionAsync();
  };

  const submit = () => {
    if (submitted) return;
    setSubmitted(true);
    void Haptics.notificationAsync(
      isClose
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error,
    );
  };

  const enter = reduced
    ? FadeIn.duration(1)
    : FadeInDown.duration(280).withInitialValues({ opacity: 0, transform: [{ translateY: 20 }] });
  const revealEnter = reduced
    ? FadeIn.duration(1)
    : FadeInDown.duration(200).withInitialValues({ opacity: 0, transform: [{ translateY: 10 }] });
  const promptEntry = reduced
    ? FadeIn.duration(1)
    : FadeInDown.duration(280).withInitialValues({ opacity: 0, transform: [{ translateY: 20 }] });

  return (
    <Animated.View entering={enter} style={styles.root}>
      <Animated.View
        entering={promptEntry}
        style={styles.atlasRow}>
        <Atlas expression={showReveal && isClose ? 'happy' : 'watching'} size={62} interactive={false} />
        <View style={styles.promptBubble}>
          <View style={styles.promptTail} accessible={false} />
          <ThemedText style={styles.prompt}>{spec.prompt}</ThemedText>
        </View>
      </Animated.View>

      <View style={styles.sliderWrap}>
        <View
          {...panResponder.panHandlers}
          onLayout={onLayout}
          style={styles.hit}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={spec.prompt}
          accessibilityHint={submitted ? 'Answer submitted.' : 'Swipe up or down, tap, or drag horizontally to change the value.'}
          accessibilityState={{ disabled: submitted }}
          accessibilityValue={{
            min: spec.min,
            max: spec.max,
            now: shownValue,
            text: fmt(shownValue),
          }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(event) => nudge(event.nativeEvent.actionName === 'decrement' ? -1 : 1)}>
          <View style={[styles.track, { backgroundColor: theme.muted }]} pointerEvents="none">
            <View style={[styles.trackFill, { width: percentStyle, backgroundColor: theme.primary }]} />
            <View style={[styles.marker, { left: percentStyle, backgroundColor: theme.primary }]} />
          </View>
        </View>

        {spec.ticks ? (
          <View style={styles.ticks}>
            {spec.ticks.map((tickValue) => {
              const tickPercent = ((tickValue - spec.min) / span) * 100;
              return (
                <ThemedText
                  key={tickValue}
                  type="small"
                  themeColor="mutedForeground"
                  style={[styles.tick, { left: `${tickPercent}%` }]}>
                  {fmt(tickValue)}
                </ThemedText>
              );
            })}
          </View>
        ) : null}
      </View>

      <ThemedText type="display" style={[styles.value, { color: theme.primary }]}> 
        {fmt(shownValue)}
      </ThemedText>

      {submitted && isClose ? <SparkBurst size={150} /> : null}

      {phase === 'revealed' ? (
        <>
          <Animated.View
            entering={revealEnter}
            style={[styles.reveal, { backgroundColor: theme.primary + '14', borderColor: theme.primary + '33' }]}
            accessibilityRole="summary">
            <ThemedText type="small" themeColor="mutedForeground">The actual answer is</ThemedText>
            <ThemedText type="title" style={{ color: theme.primary }}>~{fmt(spec.target)}</ThemedText>
          </Animated.View>
          <AtlasCorrection
            show={!isClose}
            answer={`It is about ${fmt(spec.target)}.`}
            reason={spec.explanation}
          />
          <Button label="Continue" full onPress={() => onComplete(isClose)} style={styles.continueButton} />
        </>
      ) : phase === 'waiting' ? null : (
        <Button label="Submit" onPress={submit} style={styles.submitButton} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { position: 'relative', width: '100%', alignItems: 'center', gap: 24, paddingHorizontal: 8 },
  atlasRow: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  promptBubble: { position: 'relative', flex: 1, minWidth: 0, borderRadius: 16, borderTopLeftRadius: 4, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: '#14121C', paddingHorizontal: 16, paddingVertical: 14 },
  promptTail: { position: 'absolute', left: -6, top: 16, width: 10, height: 10, transform: [{ rotate: '45deg' }], backgroundColor: '#14121C', borderLeftWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.12)' },
  prompt: { color: '#F1EFF5', fontSize: 15, lineHeight: 21, fontWeight: '600' },
  sliderWrap: { width: '100%', maxWidth: 680, paddingHorizontal: 16 },
  hit: { width: '100%', paddingVertical: 22 },
  track: { height: 8, borderRadius: Radius.sm, justifyContent: 'center' },
  trackFill: { position: 'absolute', left: 0, height: 8, borderRadius: Radius.sm },
  marker: { position: 'absolute', width: 22, height: 22, borderRadius: 11, top: -7, transform: [{ translateX: -11 }], borderWidth: 3, borderColor: '#fff' },
  ticks: { height: 18, position: 'relative', marginTop: 2 },
  tick: { position: 'absolute', transform: [{ translateX: -12 }] },
  value: { textAlign: 'center', fontSize: 30, lineHeight: 36 },
  reveal: { width: '100%', maxWidth: 680, alignItems: 'center', gap: 4, padding: 20, borderRadius: 16, borderWidth: 1 },
  submitButton: { minWidth: 112, paddingHorizontal: Spacing.four },
  continueButton: { width: '100%', maxWidth: 600 },
});
