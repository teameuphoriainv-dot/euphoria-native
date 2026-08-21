/**
 * GraphPointDrag — drag the final point of a mini price chart into the target band to make a
 * prediction. History points are fixed; the last point tracks your vertical drag and the line
 * redraws live. The point turns green inside the target zone; onSolvedChange(true) when it
 * lands there. Uses the RN responder API for drag. Sibling to BeforeAfterSlider/NumberLine.
 */
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Line, Polyline, Rect } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Duration } from '@/shared/motion/tokens';

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

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

export function GraphPointDrag({ spec, onSolvedChange }: { spec: GraphSpec; onSolvedChange: (solved: boolean) => void }) {
  const theme = useTheme();
  const fmt = spec.format ?? ((n: number) => String(Math.round(n)));
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [value, setValue] = useState((spec.min + spec.max) / 2);
  const solvedRef = useRef(false);
  const lastDetent = useRef(-1);

  /*
   * THE POINT MOVES ON THE UI THREAD; REACT ONLY HEARS IT IN STEPS. Same split as
   * `before-after-slider`: `value` drove the dragged circle's cy, the readout, the polyline's
   * last vertex AND `solved`, but only the circle needs to change every frame — and because it
   * lived in React state, every `onResponderMove` re-rendered the component to move one point.
   * The gesture system is unchanged on purpose; a Pan inside a scrolling container can steal the
   * scroll, and a shared value written from JS gets the same result without that risk.
   */
  const valueSV = useSharedValue((spec.min + spec.max) / 2);
  const lastEmit = useRef(-1);

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
  const setFromY = (yPx: number, commit = false) => {
    if (h === 0) return;
    const clampedY = Math.max(pad, Math.min(h - pad, yPx));
    const next = spec.min + (1 - (clampedY - pad) / (h - 2 * pad)) * (spec.max - spec.min);
    valueSV.set(next);                                   // UI thread — no React re-render
    const span = spec.max - spec.min;
    if (commit || Math.abs(next - lastEmit.current) >= span * 0.01) {
      lastEmit.current = next;
      setValue(next);                                    // readout, polyline and `solved` only
    }
    const detent = Math.round(((next - spec.min) / (spec.max - spec.min)) * DETENTS);
    if (detent !== lastDetent.current) {
      lastDetent.current = detent;
      Haptics.selectionAsync();
    }
  };

  const onLayout = (e: LayoutChangeEvent) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });

  const pointColor = solved ? theme.success : theme.primary;
  /*
   * THE HISTORY IS STATIC; ONLY THE DRAGGED POINT MOVES. Both the polyline string and the
   * history dots were rebuilt on every `onResponderMove`, which arrives at display rate — so a
   * finger on this chart re-mapped the whole history array and recreated N <Circle> elements
   * ~60 times a second, for output that never changes. Memoised on the data and the measured
   * box, which is everything they actually depend on.
   */
  const xEnd = xFor(n);
  const historyPts = useMemo(
    () => spec.history.map((v, i) => `${xFor(i)},${yFor(v)}`).join(' '),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- xFor/yFor are pure functions of these
    [spec.history, w, h, spec.min, spec.max],
  );
  const historyDots = useMemo(
    () => spec.history.map((v, i) => (
      <Circle key={i} cx={xFor(i)} cy={yFor(v)} r={4} fill={theme.mutedForeground} />
    )),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- same
    [spec.history, w, h, spec.min, spec.max, theme.mutedForeground],
  );
  /*
   * THE LINE MUST TRACK THE POINT. Moving the circle to the UI thread while the polyline's last
   * vertex still came from throttled React state made them diverge by up to 1% of the range
   * mid-drag -- about 2.4pt on this chart, seen as the line detaching from the point it is
   * supposed to end at. Both now read the same shared value, so they cannot drift apart.
   */
  const lineProps = useAnimatedProps(() => ({
    points: `${historyPts} ${xEnd},${
      h === 0 ? 0 : pad + (h - 2 * pad) * (1 - (valueSV.get() - spec.min) / (spec.max - spec.min))
    }`,
  }));

  /*
   * THE SOLVE WAS A CUT. `fill={solved ? theme.success : theme.primary}` flipped on one frame at
   * the moment the learner succeeds — 0ms, far below R1's p10 of 130ms. Animated with
   * `useAnimatedProps`, the pattern `atlas.tsx` already uses six times for SVG. A colour fade
   * carries no vestibular motion, so no reduced-motion guard is required.
   */
  const solveT = useSharedValue(0);
  useEffect(() => {
    solveT.set(withTiming(solved ? 1 : 0, { duration: Duration.base }));
  }, [solved, solveT]);
  const pointProps = useAnimatedProps(() => ({
    fill: interpolateColor(solveT.get(), [0, 1], [theme.primary, theme.success]),
    // cy on the UI thread too, so the dragged point tracks the finger without a re-render
    cy: h === 0 ? 0 : pad + (h - 2 * pad) * (1 - (valueSV.get() - spec.min) / (spec.max - spec.min)),
  }));

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
        onResponderRelease={(e: GestureResponderEvent) => setFromY(e.nativeEvent.locationY, true)}
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
            <AnimatedPolyline animatedProps={lineProps} fill="none" stroke={theme.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            {historyDots}
            <AnimatedCircle cx={xFor(n)} r={11} animatedProps={pointProps} stroke="#fff" strokeWidth={3} />
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
