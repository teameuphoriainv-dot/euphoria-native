/**
 * GraphPointDrag — drag the final point of a mini price chart into the target band to make a
 * prediction. History points are fixed; the last point tracks your vertical drag and the line
 * redraws live. The point turns green inside the target zone; onSolvedChange(true) when it
 * lands there. Uses the RN responder API for drag. Sibling to BeforeAfterSlider/NumberLine.
 */
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Rect } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type GraphSpec = {
  prompt: string;
  history: number[];
  min: number;
  max: number;
  target: number;
  tolerance: number;
  format?: (n: number) => string;
};

/** Haptic steps across the axis. A picker ticks per detent, not per frame. */
const DETENTS = 24;

export function GraphPointDrag({ spec, onSolvedChange }: { spec: GraphSpec; onSolvedChange: (solved: boolean) => void }) {
  const theme = useTheme();
  const fmt = spec.format ?? ((n: number) => String(Math.round(n)));
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [value, setValue] = useState((spec.min + spec.max) / 2);
  const solvedRef = useRef(false);
  const lastDetent = useRef(-1);

  const solved = Math.abs(value - spec.target) <= spec.tolerance;

  useEffect(() => {
    onSolvedChange(solved);
    if (solved && !solvedRef.current) {
      solvedRef.current = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (!solved) solvedRef.current = false;
  }, [solved, onSolvedChange]);

  const { w, h } = size;
  const pad = 16;
  const yFor = (v: number) => pad + (h - 2 * pad) * (1 - (v - spec.min) / (spec.max - spec.min));
  const n = spec.history.length;
  const xFor = (i: number) => pad + (w - 2 * pad) * (i / n);

  /**
   * HAPTICS TICK PER DETENT, NOT PER EVENT. See the same note in `before-after-slider`: this
   * fired `Haptics.selectionAsync()` on every `onResponderMove`, i.e. ~60 native haptic calls a
   * second with a finger down. `selectionAsync` is selection-CHANGED feedback and is meant to
   * tick once per discrete step, like a picker wheel.
   */
  const setFromY = (yPx: number) => {
    if (h === 0) return;
    const clampedY = Math.max(pad, Math.min(h - pad, yPx));
    const next = spec.min + (1 - (clampedY - pad) / (h - 2 * pad)) * (spec.max - spec.min);
    setValue(next);
    const detent = Math.round(((next - spec.min) / (spec.max - spec.min)) * DETENTS);
    if (detent !== lastDetent.current) {
      lastDetent.current = detent;
      Haptics.selectionAsync();
    }
  };

  const onLayout = (e: LayoutChangeEvent) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });

  const pointColor = solved ? theme.success : theme.primary;
  const linePts = [...spec.history.map((v, i) => `${xFor(i)},${yFor(v)}`), `${xFor(n)},${yFor(value)}`].join(' ');

  return (
    <View>
      <ThemedText type="title" style={{ marginBottom: Spacing.two }}>{spec.prompt}</ThemedText>
      <ThemedText type="display" style={{ fontSize: FontSize.display, color: pointColor, textAlign: 'center', marginBottom: Spacing.three }}>{fmt(value)}</ThemedText>

      <View
        onLayout={onLayout}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(e: GestureResponderEvent) => setFromY(e.nativeEvent.locationY)}
        onResponderMove={(e: GestureResponderEvent) => setFromY(e.nativeEvent.locationY)}
        style={[styles.chart, { backgroundColor: theme.card }]}
      >
        {w > 0 && (
          <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            <Rect
              x={0}
              y={yFor(spec.target + spec.tolerance)}
              width={w}
              height={Math.max(2, yFor(spec.target - spec.tolerance) - yFor(spec.target + spec.tolerance))}
              fill={theme.success + '22'}
            />
            <Line x1={0} y1={yFor(spec.target)} x2={w} y2={yFor(spec.target)} stroke={theme.success} strokeWidth={1} strokeDasharray="4 4" opacity={0.5} />
            <Polyline points={linePts} fill="none" stroke={theme.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            {spec.history.map((v, i) => (
              <Circle key={i} cx={xFor(i)} cy={yFor(v)} r={4} fill={theme.mutedForeground} />
            ))}
            <Circle cx={xFor(n)} cy={yFor(value)} r={11} fill={pointColor} stroke="#fff" strokeWidth={3} />
          </Svg>
        )}
      </View>

      <ThemedText type="small" themeColor="mutedForeground" style={{ textAlign: 'center', marginTop: Spacing.three }}>
        {solved ? 'On target — nice prediction.' : 'Drag the point into the green band.'}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { height: 240, borderRadius: Radius.lg, overflow: 'hidden' },
});
