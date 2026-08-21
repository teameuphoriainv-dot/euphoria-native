/**
 * BeforeAfterSlider — drag the track to morph a headline value from a "before" state to an
 * "after" state, revealing a comparison (e.g. inflation eroding cash over time). The number
 * interpolates live; a caption lands once revealed. onSolvedChange(true) when dragged near the
 * after end. Uses the RN responder API for drag. Sibling to NumberLine/SliderPredict.
 */
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Duration } from '@/shared/motion/tokens';

export type BeforeAfterSpec = {
  prompt: string;
  beforeLabel: string;
  afterLabel: string;
  beforeValue: number;
  afterValue: number;
  caption?: string;
  format?: (n: number) => string;
};

/** Haptic steps across the track. A picker ticks per detent, not per frame. */
const DETENTS = 24;

export function BeforeAfterSlider({ spec, onSolvedChange }: { spec: BeforeAfterSpec; onSolvedChange: (solved: boolean) => void }) {
  const theme = useTheme();
  const fmt = spec.format ?? ((n: number) => String(Math.round(n)));
  const [width, setWidth] = useState(0);
  const [pos, setPos] = useState(0);
  const solvedRef = useRef(false);

  /*
   * THE THUMB MOVES ON THE UI THREAD; REACT ONLY HEARS ABOUT IT IN STEPS.
   *
   * `pos` drove three different things: the fill/thumb geometry, the headline number, and
   * `revealed`. Only the first needs to change every frame — and because it lived in React
   * state, every `onResponderMove` (display rate) re-rendered the whole component to move a
   * thumb. Same shape as the per-frame `runOnJS` removed from `slider-predict`, which the owner
   * reported as a drag that "moves all over the place".
   *
   * The gesture system is deliberately UNCHANGED. Converting to `Gesture.Pan` is the textbook
   * fix, but a Pan inside a scrolling container can steal the scroll, and that cannot be
   * verified from here — a shared value written from the JS thread gets the same result with
   * none of that risk.
   *
   * React still receives the value, throttled to 1% of the track: ~100 updates across a full
   * drag, far more than a formatted number can show, and `onResponderRelease` commits the exact
   * final position so the committed value is never a rounded intermediate.
   */
  const posSV = useSharedValue(0);
  const widthSV = useSharedValue(0);
  const lastEmit = useRef(-1);
  const fillStyle = useAnimatedStyle(() => ({
    width: `${widthSV.get() === 0 ? 0 : (posSV.get() / widthSV.get()) * 100}%`,
  }));
  const thumbStyle = useAnimatedStyle(() => ({
    left: `${widthSV.get() === 0 ? 0 : (posSV.get() / widthSV.get()) * 100}%`,
  }));

  const t = width === 0 ? 0 : pos / width;
  const value = spec.beforeValue + t * (spec.afterValue - spec.beforeValue);
  const revealed = t >= 0.9;
  const trend = spec.afterValue < spec.beforeValue ? theme.warning : theme.success;

  useEffect(() => {
    onSolvedChange(revealed);
    if (revealed && !solvedRef.current) {
      solvedRef.current = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [revealed, onSolvedChange]);

  /**
   * HAPTICS TICK PER DETENT, NOT PER EVENT.
   *
   * This fired `Haptics.selectionAsync()` on every `onResponderMove`, which arrives at display
   * rate — roughly 60 native haptic calls per SECOND while a finger is down. `selectionAsync` is
   * Apple's selection-CHANGED feedback, built to tick once per discrete step the way a picker
   * wheel clicks; driving it continuously saturates the engine and is felt as a buzz rather than
   * as feedback. It is the same class of defect as the per-frame `runOnJS` removed from
   * `slider-predict`, which the owner reported as a drag that "moves all over the place".
   *
   * DETENTS is 24 across the track, so the tick rate matches a real picker instead of the
   * refresh rate.
   */
  const lastDetent = useRef(-1);
  const setFromX = (x: number, commit = false) => {
    if (width === 0) return;
    const next = Math.max(0, Math.min(width, x));
    posSV.set(next);                                   // UI thread — no React re-render
    if (commit || Math.abs(next - lastEmit.current) >= width * 0.01) {
      lastEmit.current = next;
      setPos(next);                                    // readout + `revealed` only
    }
    const detent = Math.round((next / width) * DETENTS);
    if (detent !== lastDetent.current) {
      lastDetent.current = detent;
      Haptics.selectionAsync();
    }
  };

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
    widthSV.set(e.nativeEvent.layout.width);
  };

  return (
    <View>
      <ThemedText type="title" style={{ marginBottom: Spacing.four }}>{spec.prompt}</ThemedText>

      <ThemedText type="display" style={{ fontSize: FontSize.hero, lineHeight: 46, color: revealed ? trend : theme.iconLilac, textAlign: 'center', marginBottom: Spacing.two }}>
        {fmt(value)}
      </ThemedText>
      <ThemedText type="small" themeColor="mutedForeground" style={{ textAlign: 'center', marginBottom: Spacing.four }}>
        {t < 0.5 ? spec.beforeLabel : spec.afterLabel}
      </ThemedText>

      <View
        onLayout={onLayout}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(e: GestureResponderEvent) => setFromX(e.nativeEvent.locationX)}
        onResponderMove={(e: GestureResponderEvent) => setFromX(e.nativeEvent.locationX)}
        onResponderRelease={(e: GestureResponderEvent) => setFromX(e.nativeEvent.locationX, true)}
        style={styles.hit}
      >
        <View style={[styles.track, { backgroundColor: theme.muted }]}>
          <Animated.View style={[styles.fill, { backgroundColor: theme.primary }, fillStyle]} />
          <Animated.View style={[styles.thumb, { backgroundColor: theme.primary }, thumbStyle]} />
        </View>
      </View>

      <View style={styles.ends}>
        <ThemedText type="smallBold" themeColor="mutedForeground">{spec.beforeLabel}</ThemedText>
        <ThemedText type="smallBold" themeColor="mutedForeground">{spec.afterLabel}</ThemedText>
      </View>

      {revealed && spec.caption && (
        <Animated.View entering={FadeIn} exiting={FadeOut.duration(Duration.exit)} style={{ marginTop: Spacing.four }}>
          <ThemedText type="smallBold" style={{ color: trend, textAlign: 'center' }}>{spec.caption}</ThemedText>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hit: { paddingVertical: 18 },
  track: { height: 10, borderRadius: Radius.thumb, justifyContent: 'center' },
  fill: { position: 'absolute', left: 0, height: 10, borderRadius: Radius.thumb },
  thumb: { position: 'absolute', width: 26, height: 26, borderRadius: 13, top: -8, transform: [{ translateX: -13 }], borderWidth: 3, borderColor: '#fff' },
  ends: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.two },
});
