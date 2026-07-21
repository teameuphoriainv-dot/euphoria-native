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
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type SliderSpec = { prompt: string; max: number; answer: number; format: (n: number) => string; tolerance?: number };

const THUMB = 30;

export function SliderPredict({ spec, revealed, onTouched }: { spec: SliderSpec; revealed: boolean; onTouched: () => void }) {
  const theme = useTheme();
  const trackW = useSharedValue(0);
  const frac = useSharedValue(0.4);
  const startFrac = useSharedValue(0.4);
  const [guess, setGuess] = useState(spec.max * 0.4);

  const pan = Gesture.Pan()
    .onBegin(() => {
      startFrac.value = frac.value;
    })
    .onUpdate((e) => {
      if (revealed || trackW.value === 0) return;
      const f = Math.max(0, Math.min(1, startFrac.value + e.translationX / trackW.value));
      frac.value = f;
      runOnJS(setGuess)(spec.max * f);
      runOnJS(onTouched)();
    });

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
          <ThemedText type="display" style={{ fontSize: 30 }}>{spec.format(guess)}</ThemedText>
        </View>
        {revealed && (
          <View style={{ alignItems: 'flex-end' }}>
            <ThemedText type="label" themeColor="mutedForeground">Actual</ThemedText>
            <ThemedText type="display" style={{ fontSize: 30, color: theme.success }}>{spec.format(spec.answer)}</ThemedText>
          </View>
        )}
      </View>

      <GestureDetector gesture={pan}>
        <View style={styles.trackArea} onLayout={(e) => { trackW.value = e.nativeEvent.layout.width; }}>
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
  readout: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: Spacing.five },
  trackArea: { height: 44, justifyContent: 'center' },
  track: { height: 8, borderRadius: 8, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 8 },
  thumb: { position: 'absolute', width: THUMB, height: THUMB, borderRadius: THUMB / 2, borderWidth: 3, top: (44 - THUMB) / 2 },
  marker: { position: 'absolute', width: 3, height: 26, borderRadius: 2, top: 9 },
});
