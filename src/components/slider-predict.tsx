/**
 * SliderPredict — Brilliant "commit a guess, then reveal" interactive. Drag the slider to
 * estimate a value; on reveal, the true answer marker + delta appear. Direct manipulation
 * via react-native-gesture-handler.
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type SliderSpec = { prompt: string; max: number; answer: number; format: (n: number) => string; tolerance?: number };

const THUMB = 30;

export function SliderPredict({ spec, revealed, onTouched }: { spec: SliderSpec; revealed: boolean; onTouched: () => void }) {
  const theme = useTheme();
  const trackW = useSharedValue(0);
  const frac = useSharedValue(0.4);
  const startFrac = useSharedValue(0.4);
  const [guess, setGuess] = useState(spec.max * 0.4);

  /**
   * The thumb itself is driven entirely on the UI thread (`frac` is a shared value), so the drag
   * tracks the finger regardless of what JS is doing. What crosses to JS is throttled.
   *
   * BEFORE: every `onUpdate` frame called runOnJS TWICE -- once for setGuess and once for
   * onTouched. At 60fps that is ~120 JS round-trips per second during a drag, each setGuess
   * triggering a React re-render of this component. The gesture stayed geometrically correct and
   * felt unsteady, because the JS thread was saturated by the readout while the finger moved.
   *
   * NOW: `onTouched` fires ONCE per gesture, in onBegin -- it is a "the learner has engaged with
   * this step" signal and never needed to be per-frame. `setGuess` only crosses when the value
   * has moved by at least half a percent of the range, which is ~200 updates across a full-width
   * drag: far more than the formatted readout can distinguish, and a fraction of the traffic.
   * onEnd emits the exact final value so the committed guess is never a rounded intermediate.
   */
  const lastEmit = useSharedValue(-1);
  const EMIT_STEP = 0.005;

  const pan = Gesture.Pan()
    .onBegin(() => {
      startFrac.value = frac.value;
      lastEmit.value = frac.value;
      if (!revealed) runOnJS(onTouched)();
    })
    .onUpdate((e) => {
      if (revealed || trackW.value === 0) return;
      const f = Math.max(0, Math.min(1, startFrac.value + e.translationX / trackW.value));
      frac.value = f;
      if (Math.abs(f - lastEmit.value) >= EMIT_STEP) {
        lastEmit.value = f;
        runOnJS(setGuess)(spec.max * f);
      }
    })
    .onEnd(() => {
      if (revealed) return;
      runOnJS(setGuess)(spec.max * frac.value);
    });

  /**
   * Assistive stepping. The only way to set a value here is a PAN gesture, which a VoiceOver
   * user cannot perform — same class of blocker as NumberLine. 5% per action gives twenty
   * steps end to end, which is enough resolution to land inside the default 15% tolerance.
   */
  const nudge = (dir: 1 | -1) => {
    if (revealed) return;
    const f = Math.max(0, Math.min(1, frac.value + dir * 0.05));
    frac.value = f;
    setGuess(spec.max * f);
    onTouched();
  };

  const thumbStyle = useAnimatedStyle(() => ({ left: frac.value * trackW.value - THUMB / 2 }));
  const fillStyle = useAnimatedStyle(() => ({ width: frac.value * trackW.value }));
  const answerPct = Math.min(1, spec.answer / spec.max) * 100;
  const close = Math.abs(guess - spec.answer) <= (spec.tolerance ?? spec.answer * 0.15);

  return (
    <View>
      <ThemedText type="title" style={{ marginBottom: Spacing.five }}>{spec.prompt}</ThemedText>

      <View style={styles.readout}>
        <View>
          <ThemedText type="label" themeColor="mutedForeground">Your guess</ThemedText>
          <ThemedText type="display" style={{ fontSize: FontSize.display }}>{spec.format(guess)}</ThemedText>
        </View>
        {revealed && (
          <View style={{ alignItems: 'flex-end' }}>
            <ThemedText type="label" themeColor="mutedForeground">Actual</ThemedText>
            <ThemedText type="display" style={{ fontSize: FontSize.display, color: theme.success }}>{spec.format(spec.answer)}</ThemedText>
          </View>
        )}
      </View>

      <GestureDetector gesture={pan}>
        <View
          style={styles.trackArea}
          onLayout={(e) => { trackW.value = e.nativeEvent.layout.width; }}
          accessibilityRole="adjustable"
          accessibilityLabel={spec.prompt}
          accessibilityHint="Swipe up or down to change your guess."
          accessibilityValue={{ min: 0, max: Math.round(spec.max), now: Math.round(guess), text: spec.format(guess) }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(e) => nudge(e.nativeEvent.actionName === 'decrement' ? -1 : 1)}>
          <View style={[styles.track, { backgroundColor: theme.muted }]}>
            <Animated.View style={[styles.fill, { backgroundColor: theme.primary }, fillStyle]} />
          </View>
          {revealed && <View style={[styles.marker, { backgroundColor: theme.success, left: `${answerPct}%` }]} />}
          <Animated.View style={[styles.thumb, { backgroundColor: theme.primary, borderColor: theme.background }, thumbStyle]} />
        </View>
      </GestureDetector>

      {revealed && (
        <ThemedText type="smallBold" style={{ marginTop: Spacing.four, color: close ? theme.success : theme.warning }}>
          {close ? 'Great intuition — compounding is sneaky-powerful.' : `Off by ${spec.format(Math.abs(guess - spec.answer))}. Compounding grows faster than most expect.`}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  readout: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.two, alignItems: 'flex-end', marginBottom: Spacing.five },
  trackArea: { height: 44, justifyContent: 'center' },
  track: { height: 8, borderRadius: Radius.sm, overflow: 'hidden' },
  fill: { height: 8, borderRadius: Radius.sm },
  thumb: { position: 'absolute', width: THUMB, height: THUMB, borderRadius: THUMB / 2, borderWidth: 3, top: (44 - THUMB) / 2 },
  marker: { position: 'absolute', width: 3, height: 26, borderRadius: Radius.hairline, top: 9 },
});
