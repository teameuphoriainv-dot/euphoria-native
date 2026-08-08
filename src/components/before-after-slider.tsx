/**
 * BeforeAfterSlider — drag the track to morph a headline value from a "before" state to an
 * "after" state, revealing a comparison (e.g. inflation eroding cash over time). The number
 * interpolates live; a caption lands once revealed. onSolvedChange(true) when dragged near the
 * after end. Uses the RN responder API for drag. Sibling to NumberLine/SliderPredict.
 */
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

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

export function BeforeAfterSlider({ spec, onSolvedChange }: { spec: BeforeAfterSpec; onSolvedChange: (solved: boolean) => void }) {
  const theme = useTheme();
  const fmt = spec.format ?? ((n: number) => String(Math.round(n)));
  const [width, setWidth] = useState(0);
  const [pos, setPos] = useState(0);
  const solvedRef = useRef(false);

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

  const setFromX = (x: number) => {
    if (width === 0) return;
    setPos(Math.max(0, Math.min(width, x)));
    Haptics.selectionAsync();
  };

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

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
        style={styles.hit}
      >
        <View style={[styles.track, { backgroundColor: theme.muted }]}>
          <View style={[styles.fill, { width: `${t * 100}%`, backgroundColor: theme.primary }]} />
          <View style={[styles.thumb, { left: `${t * 100}%`, backgroundColor: theme.primary }]} />
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
  ends: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.two },
});
