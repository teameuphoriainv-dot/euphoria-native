import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  ScrollView,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Line, Path, Polygon, Polyline, Rect, Text as SvgText } from 'react-native-svg';

import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ExplorableCheck, ExplorableStepData } from '@/lib/curriculum';
import {
  buildInteractiveGraphModel,
  defaultGraphValues,
  effectiveGraphSliders,
  type GraphSlider,
  type InteractiveGraphInput,
  type InteractiveGraphModel,
} from '@/lib/interactive-graph-model';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { Duration, Ease } from '@/shared/motion/tokens';

const CTA_CLEARANCE = 104;
const CHART_WIDTH = 320;
const CHART_HEIGHT = 220;
const GRAPH_GEOMETRY_MS = 300;
const GRAPH_FAST_MS = 150;
const WATERFALL_STAGGER_MS = 50;
const COMPOUND_CURVE_MS = 250;
/**
 * SIX SECONDS, NOT FIFTEEN.
 *
 * The gate exists so a learner cannot skim past a diagram without looking at it, and that is worth
 * keeping. Fifteen was the web number, on a screen where the whole comparison is visible at once
 * and the reader has a mouse hovering over Continue. On a phone the same wait reads as the app
 * being broken: Sriyan sent a screenshot of a greyed-out "Continue in 5s" asking for it to be
 * shorter, and at that point the button had already been counting for ten seconds.
 *
 * Six is long enough that the eye has to land on the content and short enough that nobody wonders
 * whether the app has frozen.
 */
const GRAPH_DWELL_SECONDS = 6;
// Measured canonical web graph-prompt spring: playful overshoot is intentional for Atlas.
const WEB_GRAPH_BOUNCY = { stiffness: 500, damping: 18, mass: 0.8 } as const;

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Wall-time diagram gate used by production interactiveGraph scenes. Explorables have interaction
 * gates instead and ignore this value. */
function useGraphDwell() {
  const [remaining, setRemaining] = useState(GRAPH_DWELL_SECONDS);
  useEffect(() => {
    const startedAt = Date.now();
    const timer = setInterval(() => {
      const next = Math.max(0, GRAPH_DWELL_SECONDS - Math.floor((Date.now() - startedAt) / 1000));
      setRemaining(next);
      if (next === 0) clearInterval(timer);
    }, 250);
    return () => clearInterval(timer);
  }, []);
  return remaining;
}

/**
 * SVG geometry does not interpolate merely because React supplies a new prop. The web renderer's
 * bars grow from their baseline and then tween to every slider-driven value, so keep the geometry
 * itself on shared values rather than fading a finished chart in as one bitmap-like block.
 */
function TweenRect({
  x,
  y,
  width,
  height,
  baseline,
  duration = GRAPH_GEOMETRY_MS,
  delay = 0,
  rx,
  fill,
  stroke,
  strokeWidth,
  opacity,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  baseline: number;
  duration?: number;
  delay?: number;
  rx?: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}) {
  const reduced = useReducedMotion();
  const animatedY = useSharedValue(reduced ? y : baseline);
  const animatedHeight = useSharedValue(reduced ? height : 0);

  useEffect(() => {
    if (reduced) {
      animatedY.set(y);
      animatedHeight.set(height);
      return;
    }
    animatedY.set(withDelay(delay, withTiming(y, { duration, easing: Ease.out })));
    animatedHeight.set(withDelay(delay, withTiming(height, { duration, easing: Ease.out })));
  }, [animatedHeight, animatedY, delay, duration, height, reduced, y]);

  const animatedProps = useAnimatedProps(() => ({
    y: animatedY.get(),
    height: animatedHeight.get(),
  }));

  return <AnimatedRect animatedProps={animatedProps} x={x} width={width} rx={rx} fill={fill} stroke={stroke} strokeWidth={strokeWidth} opacity={opacity} />;
}

/** Animate a line's endpoints between slider values; mount geometry is already valid and stable. */
function TweenLine({
  x1,
  y1,
  x2,
  y2,
  duration,
  stroke,
  strokeWidth,
  strokeDasharray,
  strokeLinecap,
  opacity,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  duration: number;
  stroke: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  strokeLinecap?: 'butt' | 'round' | 'square';
  opacity?: number;
}) {
  const reduced = useReducedMotion();
  const ax1 = useSharedValue(x1);
  const ay1 = useSharedValue(y1);
  const ax2 = useSharedValue(x2);
  const ay2 = useSharedValue(y2);

  useEffect(() => {
    const animate = (target: number) => reduced ? target : withTiming(target, { duration, easing: Ease.out });
    ax1.set(animate(x1));
    ay1.set(animate(y1));
    ax2.set(animate(x2));
    ay2.set(animate(y2));
  }, [ax1, ax2, ay1, ay2, duration, reduced, x1, x2, y1, y2]);

  const animatedProps = useAnimatedProps(() => ({ x1: ax1.get(), y1: ay1.get(), x2: ax2.get(), y2: ay2.get() }));
  return <AnimatedLine animatedProps={animatedProps} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} strokeLinecap={strokeLinecap} opacity={opacity} />;
}

function TweenCircle({ cx, cy, r, fill, stroke, strokeWidth, duration }: {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  duration: number;
}) {
  const reduced = useReducedMotion();
  const animatedX = useSharedValue(cx);
  const animatedY = useSharedValue(cy);

  useEffect(() => {
    animatedX.set(reduced ? cx : withTiming(cx, { duration, easing: Ease.out }));
    animatedY.set(reduced ? cy : withTiming(cy, { duration, easing: Ease.out }));
  }, [animatedX, animatedY, cx, cy, duration, reduced]);

  const animatedProps = useAnimatedProps(() => ({ cx: animatedX.get(), cy: animatedY.get() }));
  return <AnimatedCircle animatedProps={animatedProps} r={r} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
}

function TweenMeterFill({ fraction, backgroundColor, borderColor }: { fraction: number; backgroundColor: string; borderColor: string }) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(reduced ? fraction : 0);

  useEffect(() => {
    progress.set(reduced ? fraction : withTiming(fraction, { duration: GRAPH_GEOMETRY_MS, easing: Ease.out }));
  }, [fraction, progress, reduced]);

  const animatedStyle = useAnimatedStyle(() => ({ width: `${progress.get() * 100}%` as `${number}%` }));
  return <Animated.View style={[styles.meterFill, { backgroundColor, borderColor }, animatedStyle]} />;
}

function graphColors(theme: ReturnType<typeof useTheme>) {
  return [theme.success, theme.accent, theme.warning, theme.destructive, theme.iconGold, theme.primary];
}

function compact(value: number) {
  const absolute = Math.abs(value);
  if (absolute >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (absolute >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (absolute >= 10_000) return `${Math.round(value / 1_000)}K`;
  return Number(value.toFixed(absolute < 10 ? 1 : 0)).toLocaleString('en-US');
}

const PORTFOLIO_COLORS = {
  primary: '#A451E6',
  accent: '#2DD4BF',
  positive: '#10B981',
  negative: '#EF4444',
  muted: '#64748B',
} as const;
const portfolioAxisLabel = 0.8;

function portfolioDollar(value: number) {
  const absolute = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (absolute >= 1_000_000) return `${sign}$${(absolute / 1_000_000).toFixed(absolute >= 10_000_000 ? 0 : 1)}M`;
  if (absolute >= 1_000) return `${sign}$${(absolute / 1_000).toFixed(absolute >= 100_000 ? 0 : 1)}K`;
  return `${sign}$${Math.round(absolute).toLocaleString('en-US')}`;
}

function exactDollar(value: number) {
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

function display(value: number, unit = '') {
  return unit === '$' ? `$${compact(value)}` : `${compact(value)}${unit}`;
}

function formatValue(value: number, slider: GraphSlider) {
  if (slider.unit === '$/mo') return `$${compact(value)}/mo`;
  return display(value, slider.unit);
}

function controlStep(slider: GraphSlider) {
  return slider.max > 1000 ? 100 : 1;
}

function GraphControl({ slider, value, onChange, stepOverride }: { slider: GraphSlider; value: number; onChange: (value: number) => void; stepOverride?: number }) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const span = Math.max(1, slider.max - slider.min);
  const percent = Math.max(0, Math.min(1, (value - slider.min) / span));
  const percentStyle = `${percent * 100}%` as `${number}%`;
  const step = stepOverride ?? controlStep(slider);
  const showEndpoints = slider.label.trim().toLowerCase() === 'years';
  const set = (next: number) => onChange(Math.max(slider.min, Math.min(slider.max, next)));
  const placeAt = useCallback((x: number) => {
    if (!width) return;
    const clamped = Math.max(0, Math.min(width, x));
    const raw = slider.min + clamped / width * span;
    const snapped = slider.min + Math.round((raw - slider.min) / step) * step;
    onChange(Math.max(slider.min, Math.min(slider.max, snapped)));
  }, [onChange, slider.max, slider.min, span, step, width]);
  // A plain View, NOT a Pressable, and the track below is pointerEvents="none" so locationX is always
  // measured against this hit area rather than whichever child is under the finger. Pressable spreads its own responder handlers AFTER any passed in,
  // so `{...panHandlers}` on a Pressable is silently discarded: only taps ever reached the slider and
  // the drag fell through to the navigator's swipe-back, which closed the lesson.
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_event, gesture) => Math.abs(gesture.dx) >= 6 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderGrant: (event) => {
      placeAt(event.nativeEvent.locationX);
    },
    onPanResponderMove: (event) => placeAt(event.nativeEvent.locationX),
    onPanResponderRelease: (event) => placeAt(event.nativeEvent.locationX),
    onPanResponderTerminationRequest: () => false,
  }), [placeAt]);
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  return (
    <View style={styles.controlCard}>
      <View style={styles.between}>
        <ThemedText type="small" themeColor="mutedForeground" style={{ flex: 1 }}>{slider.label}</ThemedText>
        <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>{formatValue(value, slider)}</ThemedText>
      </View>
      <View
        style={styles.trackHit}
        onLayout={onLayout}
        {...panResponder.panHandlers}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={slider.label}
        accessibilityValue={{ min: slider.min, max: slider.max, now: value, text: formatValue(value, slider) }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(event) => set(value + (event.nativeEvent.actionName === 'decrement' ? -step : step))}>
        <View style={[styles.track, { backgroundColor: theme.muted }]} pointerEvents="none">
          <View style={[styles.trackFill, { width: percentStyle, backgroundColor: theme.primary }]} />
          <View style={[styles.thumb, { left: percentStyle, backgroundColor: theme.primary, borderColor: theme.primaryForeground }]} />
        </View>
      </View>
      {showEndpoints ? (
        <View style={styles.between}>
          <ThemedText type="small" themeColor="mutedForeground">today</ThemedText>
          <ThemedText type="small" themeColor="mutedForeground">{formatValue(slider.max, slider)}</ThemedText>
        </View>
      ) : null}
    </View>
  );
}

function Summary({ model }: { model: InteractiveGraphModel }) {
  const theme = useTheme();
  if (!model.summary) return null;
  return (
    <View style={styles.summary}>
      <ThemedText type="small" themeColor="mutedForeground">{model.summary.label}</ThemedText>
      <ThemedText type="heading" style={{ color: theme.iconLilac }}>{display(model.summary.value, model.summary.unit)}</ThemedText>
      {model.summary.detail ? <ThemedText type="smallBold" themeColor="mutedForeground">{model.summary.detail}</ThemedText> : null}
    </View>
  );
}

function LineGraph({ model }: { model: InteractiveGraphModel }) {
  const theme = useTheme();
  const colors = graphColors(theme);
  const pad = { left: 18, right: 12, top: 24, bottom: 26 };
  const allPoints = model.series.flatMap((series) => series.points);
  const candleValues = model.candles.flatMap((candle) => [candle.high, candle.low]);
  const xMin = model.range?.xMin ?? Math.min(...allPoints.map((point) => point.x), 0);
  const xMax = model.range?.xMax ?? Math.max(...allPoints.map((point) => point.x), 1);
  const yMin = model.range?.yMin ?? Math.min(...allPoints.map((point) => point.y), ...candleValues, 0);
  const yMax = model.range?.yMax ?? Math.max(...allPoints.map((point) => point.y), ...candleValues, 1);
  const xRange = Math.max(1e-6, xMax - xMin);
  const yRange = Math.max(1e-6, yMax - yMin);
  const x = (value: number) => pad.left + (value - xMin) / xRange * (CHART_WIDTH - pad.left - pad.right);
  const y = (value: number) => pad.top + (1 - (value - yMin) / yRange) * (CHART_HEIGHT - pad.top - pad.bottom);
  const main = model.series[0];
  const mainCoordinates = main?.points.map((point) => `${x(point.x)},${y(point.y)}`).join(' ') ?? '';
  const showArea = ['exponential', 'timeline', 'distribution', 'line'].includes(model.presentation);
  const varMarker = model.presentation === 'distribution' ? model.markers.find((marker) => marker.label === 'VaR 95%') : undefined;
  const tailCoordinates = varMarker && main
    ? main.points.filter((point) => point.x <= varMarker.x).map((point) => `${x(point.x)},${y(point.y)}`).join(' ')
    : '';
  const showCandles = model.presentation === 'financialChart' && model.summary?.detail !== 'sma-vs-ema';

  return (
    <View style={styles.graphStack}>
      <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} accessible={false}>
        {[0.25, 0.5, 0.75].map((fraction) => (
          <Line key={fraction} x1={pad.left} x2={CHART_WIDTH - pad.right} y1={pad.top + fraction * (CHART_HEIGHT - pad.top - pad.bottom)} y2={pad.top + fraction * (CHART_HEIGHT - pad.top - pad.bottom)} stroke={theme.border} strokeWidth={0.7} strokeDasharray="4 4" />
        ))}
        {showArea && mainCoordinates ? <Polygon points={`${mainCoordinates} ${x(xMax)},${y(yMin)} ${x(xMin)},${y(yMin)}`} fill={theme.primary + '1F'} /> : null}
        {tailCoordinates && varMarker ? <Polygon points={`${tailCoordinates} ${x(varMarker.x)},${y(yMin)} ${x(xMin)},${y(yMin)}`} fill={theme.destructive + '42'} /> : null}
        {showCandles ? model.candles.map((candle) => {
          const color = candle.close >= candle.open ? theme.success : theme.destructive;
          const width = Math.max(1, (CHART_WIDTH - pad.left - pad.right) / model.candles.length * 0.65);
          return (
            <G key={candle.x}>
              <Line x1={x(candle.x)} x2={x(candle.x)} y1={y(candle.high)} y2={y(candle.low)} stroke={color} strokeWidth={0.8} />
              <Rect x={x(candle.x) - width / 2} y={Math.min(y(candle.open), y(candle.close))} width={width} height={Math.max(1, Math.abs(y(candle.open) - y(candle.close)))} fill={color} />
            </G>
          );
        }) : null}
        {model.series.map((series, seriesIndex) => {
          if (showCandles && seriesIndex === 0) return null;
          const coordinates = series.points.map((point) => `${x(point.x)},${y(point.y)}`).join(' ');
          const isExpected = series.label === 'Expected path';
          const isSimulation = model.presentation === 'multiline' && !isExpected;
          return <Polyline key={series.label} points={coordinates} fill="none" stroke={isExpected ? theme.primary : colors[seriesIndex % colors.length]} strokeWidth={isSimulation ? 1.1 : seriesIndex === 0 ? 3 : 2.2} opacity={isSimulation ? 0.42 : 1} strokeDasharray={isExpected || (model.presentation === 'comparison' && seriesIndex === 1) ? '7 4' : undefined} strokeLinecap="round" strokeLinejoin="round" />;
        })}
        {model.markers.map((marker) => (
          <G key={marker.label}>
            <Line x1={x(marker.x)} x2={x(marker.x)} y1={pad.top} y2={CHART_HEIGHT - pad.bottom} stroke={marker.label.includes('VaR') ? theme.destructive : theme.primary} strokeWidth={1.4} strokeDasharray="5 3" />
            {marker.value !== undefined && model.presentation === 'timeline' ? <Circle cx={x(marker.x)} cy={y(marker.value)} r={6} fill={theme.primary} stroke={theme.primaryForeground} strokeWidth={2} /> : null}
            <SvgText x={Math.max(28, Math.min(CHART_WIDTH - 28, x(marker.x)))} y={15} fill={marker.label.includes('VaR') ? theme.destructive : theme.iconLilac} fontSize={10} fontWeight="700" textAnchor="middle">{marker.label}</SvgText>
          </G>
        ))}
        <SvgText x={pad.left} y={CHART_HEIGHT - 5} fill={theme.mutedForeground} fontSize={10}>{model.axisStart ?? 'Start'}</SvgText>
        <SvgText x={CHART_WIDTH - pad.right} y={CHART_HEIGHT - 5} fill={theme.mutedForeground} fontSize={10} textAnchor="end">{model.axisEnd ?? 'End'}</SvgText>
      </Svg>
      {model.presentation !== 'multiline' ? (
        <View style={styles.legend}>
          {model.series.slice(0, 4).map((series, index) => (
            <View key={series.label} style={styles.legendItem}>
              <View style={[styles.swatch, { backgroundColor: colors[index % colors.length] }]} />
              <ThemedText type="small" themeColor="mutedForeground" style={{ flex: 1 }}>{series.label}</ThemedText>
              <ThemedText type="smallBold">{compact(series.points.at(-1)?.y ?? 0)}</ThemedText>
            </View>
          ))}
        </View>
      ) : null}
      <Summary model={model} />
    </View>
  );
}

function BarGraph({ model }: { model: InteractiveGraphModel }) {
  const theme = useTheme();
  const colors = graphColors(theme);
  const max = Math.max(1, ...model.bars.map((bar) => Math.abs(bar.value)));
  const gap = 9;
  const barWidth = Math.min(48, (CHART_WIDTH - 36 - gap * Math.max(0, model.bars.length - 1)) / Math.max(1, model.bars.length));
  const totalWidth = model.bars.length * barWidth + Math.max(0, model.bars.length - 1) * gap;
  const startX = (CHART_WIDTH - totalWidth) / 2;
  return (
    <View style={styles.graphStack}>
      <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} accessible={false}>
        {[0.25, 0.5, 0.75, 1].map((fraction) => <Line key={fraction} x1={18} x2={CHART_WIDTH - 10} y1={185 - fraction * 150} y2={185 - fraction * 150} stroke={theme.border} strokeWidth={0.6} strokeDasharray="4 4" />)}
        {model.bars.map((bar, index) => {
          const height = Math.max(2, Math.abs(bar.value) / max * 150);
          const x = startX + index * (barWidth + gap);
          return (
            <G key={`${bar.label}-${String(index)}`}>
              <TweenRect x={x} y={185 - height} width={barWidth} height={height} baseline={185} rx={6} fill={colors[index % colors.length]} opacity={0.72} />
              <SvgText x={x + barWidth / 2} y={178 - height} fill={colors[index % colors.length]} fontSize={10} fontWeight="700" textAnchor="middle">{compact(bar.value)}</SvgText>
              <SvgText x={x + barWidth / 2} y={202} fill={theme.mutedForeground} fontSize={8} textAnchor="middle">{bar.label.length > 9 ? `${bar.label.slice(0, 8)}…` : bar.label}</SvgText>
            </G>
          );
        })}
      </Svg>
      <Summary model={model} />
    </View>
  );
}

function PieGraph({ model }: { model: InteractiveGraphModel }) {
  const theme = useTheme();
  const colors = graphColors(theme);
  const radius = 44;
  const stroke = 22;
  const size = 128;
  const circumference = 2 * Math.PI * radius;
  const total = Math.max(1, model.slices.reduce((sum, slice) => sum + Math.max(0, slice.value), 0));
  const lengths = model.slices.map((slice) => Math.max(0, slice.value) / total * circumference);
  const offsets = lengths.map((_, index) => lengths.slice(0, index).reduce((sum, length) => sum + length, 0));
  return (
    <View style={styles.graphStack}>
      <View style={styles.pieRow}>
        <Svg width={size} height={size} accessible={false}>
          <Circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={theme.muted} strokeWidth={stroke} />
          {model.slices.map((slice, index) => <Circle key={`${slice.label}-${String(index)}`} cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={colors[index % colors.length]} strokeWidth={stroke} strokeDasharray={`${lengths[index]} ${circumference - lengths[index]}`} strokeDashoffset={-offsets[index]} transform={`rotate(-90 ${size / 2} ${size / 2})`} />)}
          <SvgText x={size / 2} y={size / 2 - 3} fill={theme.mutedForeground} fontSize={9} textAnchor="middle">RISK</SvgText>
          <SvgText x={size / 2} y={size / 2 + 14} fill={theme.iconLilac} fontSize={15} fontWeight="700" textAnchor="middle">{model.summary?.detail?.replace('Risk ', '') ?? '—'}</SvgText>
        </Svg>
        <View style={styles.pieLegend}>
          {model.slices.map((slice, index) => (
            <View key={`${slice.label}-legend`} style={styles.legendItem}>
              <View style={[styles.swatch, { backgroundColor: colors[index % colors.length] }]} />
              <ThemedText type="small" themeColor="mutedForeground" style={{ flex: 1 }}>{slice.label}</ThemedText>
              <ThemedText type="smallBold">{Math.round(Math.max(0, slice.value) / total * 100)}%</ThemedText>
            </View>
          ))}
        </View>
      </View>
      <Summary model={model} />
    </View>
  );
}

function BalanceSheet({ model }: { model: InteractiveGraphModel }) {
  const theme = useTheme();
  const assets = model.bars[0]?.value ?? 0;
  const liabilities = model.bars[1]?.value ?? 0;
  const equity = model.bars[2]?.value ?? 0;
  const max = Math.max(assets, liabilities + equity, 1);
  const assetHeight = assets / max * 130;
  const liabilityHeight = liabilities / max * 130;
  const equityHeight = equity / max * 130;
  return (
    <View style={styles.graphStack}>
      <ThemedText type="smallBold" themeColor="mutedForeground" style={styles.center}>Assets = Liabilities + Equity</ThemedText>
      <Svg width="100%" height={190} viewBox="0 0 320 190" accessible={false}>
        <SvgText x={80} y={18} fill={theme.success} fontSize={11} fontWeight="700" textAnchor="middle">ASSETS</SvgText>
        <TweenRect x={30} y={165 - assetHeight} width={100} height={assetHeight} baseline={165} rx={8} fill={theme.success + '2E'} stroke={theme.success} strokeWidth={1.5} />
        <SvgText x={80} y={157 - assetHeight} fill={theme.success} fontSize={11} fontWeight="700" textAnchor="middle">{`$${compact(assets)}`}</SvgText>
        <SvgText x={160} y={98} fill={theme.success} fontSize={24} fontWeight="700" textAnchor="middle">=</SvgText>
        <SvgText x={240} y={18} fill={theme.mutedForeground} fontSize={10} fontWeight="700" textAnchor="middle">LIABILITIES + EQUITY</SvgText>
        <TweenRect x={190} y={165 - liabilityHeight - equityHeight} width={100} height={equityHeight} baseline={165 - liabilityHeight} rx={8} fill={theme.primary + '2E'} stroke={theme.primary} strokeWidth={1.5} />
        <TweenRect x={190} y={165 - liabilityHeight} width={100} height={liabilityHeight} baseline={165} rx={8} fill={theme.destructive + '2E'} stroke={theme.destructive} strokeWidth={1.5} />
        <SvgText x={240} y={178 - liabilityHeight - equityHeight} fill={theme.iconLilac} fontSize={9} textAnchor="middle">{`Equity $${compact(equity)}`}</SvgText>
        <SvgText x={240} y={178 - liabilityHeight} fill={theme.destructive} fontSize={9} textAnchor="middle">{`Debt $${compact(liabilities)}`}</SvgText>
      </Svg>
      <View style={[styles.status, { backgroundColor: theme.success + '18', borderColor: theme.success + '4D' }]}><ThemedText type="smallBold" style={{ color: theme.success }}>✓ Books Balanced</ThemedText></View>
    </View>
  );
}

function Gauge({ model }: { model: InteractiveGraphModel }) {
  const theme = useTheme();
  const bar = model.bars[0];
  const min = model.range?.xMin ?? 0;
  const max = model.range?.xMax ?? 100;
  const fraction = Math.max(0, Math.min(1, (bar.value - min) / Math.max(max - min, 1)));
  const angle = Math.PI + fraction * Math.PI;
  const cx = 160;
  const cy = 145;
  const radius = 90;
  const needleX = cx + Math.cos(angle) * radius * 0.82;
  const needleY = cy + Math.sin(angle) * radius * 0.82;
  const color = fraction < 0.33 ? theme.destructive : fraction < 0.66 ? theme.warning : theme.success;
  return (
    <View style={styles.graphStack}>
      <Svg width="100%" height={190} viewBox="0 0 320 190" accessible={false}>
        <Path d="M 70 145 A 90 90 0 0 1 250 145" fill="none" stroke={theme.muted} strokeWidth={20} strokeLinecap="round" />
        <Path d="M 70 145 A 90 90 0 0 1 115 67" fill="none" stroke={theme.destructive + '70'} strokeWidth={18} strokeLinecap="round" />
        <Path d="M 115 67 A 90 90 0 0 1 205 67" fill="none" stroke={theme.warning + '70'} strokeWidth={18} strokeLinecap="round" />
        <Path d="M 205 67 A 90 90 0 0 1 250 145" fill="none" stroke={theme.success + '70'} strokeWidth={18} strokeLinecap="round" />
        <TweenLine x1={cx} y1={cy} x2={needleX} y2={needleY} duration={GRAPH_GEOMETRY_MS} stroke={color} strokeWidth={4} strokeLinecap="round" />
        <Circle cx={cx} cy={cy} r={8} fill={color} />
        <Circle cx={cx} cy={cy} r={3} fill={theme.background} />
        <SvgText x={cx} y={176} fill={theme.text} fontSize={20} fontWeight="700" textAnchor="middle">{compact(bar.value)}</SvgText>
        <SvgText x={60} y={165} fill={theme.mutedForeground} fontSize={9}>{compact(min)}</SvgText>
        <SvgText x={260} y={165} fill={theme.mutedForeground} fontSize={9} textAnchor="end">{compact(max)}</SvgText>
      </Svg>
      <ThemedText type="small" themeColor="mutedForeground" style={styles.center}>{bar.label}</ThemedText>
    </View>
  );
}

function Waterfall({ model }: { model: InteractiveGraphModel }) {
  const theme = useTheme();
  const max = Math.max(1, ...model.bars.flatMap((bar) => [Math.abs(bar.start ?? 0), Math.abs(bar.end ?? bar.value)]));
  const width = 42;
  const gap = 10;
  const total = model.bars.length * width + (model.bars.length - 1) * gap;
  const startX = (CHART_WIDTH - total) / 2;
  const y = (value: number) => 185 - value / max * 145;
  return (
    <View style={styles.graphStack}>
      <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} accessible={false}>
        {model.bars.map((bar, index) => {
          const start = bar.start ?? 0;
          const end = bar.end ?? bar.value;
          const top = Math.min(y(start), y(end));
          const height = Math.max(2, Math.abs(y(start) - y(end)));
          const color = bar.label === 'Net' ? theme.accent : bar.value >= 0 ? theme.success : theme.destructive;
          const x = startX + index * (width + gap);
          return (
            <G key={bar.label}>
              <TweenRect x={x} y={top} width={width} height={height} baseline={185} duration={GRAPH_GEOMETRY_MS} delay={index * WATERFALL_STAGGER_MS} rx={5} fill={color + 'A8'} stroke={color} strokeWidth={1} />
              <SvgText x={x + width / 2} y={Math.max(10, top - 6)} fill={color} fontSize={9} fontWeight="700" textAnchor="middle">{compact(bar.value)}</SvgText>
              <SvgText x={x + width / 2} y={204} fill={theme.mutedForeground} fontSize={8} textAnchor="middle">{bar.label.length > 7 ? `${bar.label.slice(0, 6)}…` : bar.label}</SvgText>
              {index < model.bars.length - 1 ? <Line x1={x + width} x2={x + width + gap} y1={y(end)} y2={y(end)} stroke={theme.border} strokeDasharray="3 2" /> : null}
            </G>
          );
        })}
      </Svg>
      <Summary model={model} />
    </View>
  );
}

function Meter({ model }: { model: InteractiveGraphModel }) {
  const theme = useTheme();
  const colors = graphColors(theme);
  return (
    <View style={styles.graphStack}>
      {model.bars.map((bar, index) => {
        const fraction = Math.max(0, Math.min(1, bar.value / Math.max(bar.max ?? 100, 1)));
        return (
          <View key={bar.label} style={styles.meterRow}>
            <ThemedText type="small" themeColor="mutedForeground" style={styles.meterLabel} numberOfLines={1}>{bar.label}</ThemedText>
            <View style={[styles.meterTrack, { backgroundColor: theme.muted }]}>
              <TweenMeterFill fraction={fraction} backgroundColor={colors[index % colors.length] + '55'} borderColor={colors[index % colors.length]} />
            </View>
            <ThemedText type="smallBold">{compact(bar.value)}</ThemedText>
          </View>
        );
      })}
      <Summary model={model} />
    </View>
  );
}

function Scatter({ model }: { model: InteractiveGraphModel }) {
  const theme = useTheme();
  const range = model.range ?? { xMin: 0, xMax: 100, yMin: 0, yMax: 100 };
  const point = model.series[0]?.points[0] ?? { x: 0, y: 0 };
  const x = 48 + (point.x - range.xMin) / Math.max(range.xMax - range.xMin, 1) * 248;
  const y = 178 - (point.y - range.yMin) / Math.max(range.yMax - range.yMin, 1) * 145;
  return (
    <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} accessible={false}>
      {[0.25, 0.5, 0.75, 1].map((fraction) => <G key={fraction}><Line x1={48} x2={296} y1={178 - fraction * 145} y2={178 - fraction * 145} stroke={theme.border} strokeDasharray="4 4" /><Line x1={48 + fraction * 248} x2={48 + fraction * 248} y1={33} y2={178} stroke={theme.border} strokeDasharray="4 4" /></G>)}
      <Line x1={48} x2={296} y1={178} y2={178} stroke={theme.mutedForeground} opacity={0.5} />
      <Line x1={48} x2={48} y1={33} y2={178} stroke={theme.mutedForeground} opacity={0.5} />
      <TweenLine x1={x} x2={x} y1={33} y2={178} duration={GRAPH_FAST_MS} stroke={theme.primary} strokeDasharray="4 3" opacity={0.45} />
      <TweenLine x1={48} x2={296} y1={y} y2={y} duration={GRAPH_FAST_MS} stroke={theme.primary} strokeDasharray="4 3" opacity={0.45} />
      <TweenCircle cx={x} cy={y} r={10} fill={theme.primary + '35'} stroke={theme.primary} strokeWidth={2} duration={GRAPH_FAST_MS} />
      <TweenCircle cx={x} cy={y} r={4} fill={theme.primary} duration={GRAPH_FAST_MS} />
      <SvgText x={172} y={207} fill={theme.mutedForeground} fontSize={10} textAnchor="middle">{model.labels[0]}</SvgText>
      <SvgText x={13} y={108} fill={theme.mutedForeground} fontSize={10} textAnchor="middle" transform="rotate(-90 13 108)">{model.labels[1]}</SvgText>
      <SvgText x={Math.max(45, Math.min(275, x))} y={Math.max(15, y - 16)} fill={theme.iconLilac} fontSize={10} fontWeight="700" textAnchor="middle">{`${compact(point.x)}, ${compact(point.y)}`}</SvgText>
    </Svg>
  );
}

function Heatmap({ model }: { model: InteractiveGraphModel }) {
  const theme = useTheme();
  const n = Math.max(1, model.labels.length);
  const cell = Math.min(47, 220 / n);
  const grid = cell * n;
  const left = (CHART_WIDTH - grid) / 2 + 14;
  const top = 36;
  const color = (value: number) => value >= 0.8 ? theme.success : value >= 0.1 ? theme.success + '9A' : value >= -0.1 ? theme.muted : value >= -0.4 ? theme.destructive + '9A' : theme.destructive;
  return (
    <Svg width="100%" height={Math.max(CHART_HEIGHT, top + grid + 38)} viewBox={`0 0 ${CHART_WIDTH} ${Math.max(CHART_HEIGHT, top + grid + 38)}`} accessible={false}>
      <SvgText x={CHART_WIDTH / 2} y={15} fill={theme.mutedForeground} fontSize={11} fontWeight="700" textAnchor="middle">Correlation Matrix</SvgText>
      {model.labels.map((label, index) => <SvgText key={`column-${label}`} x={left + index * cell + cell / 2} y={top - 7} fill={theme.mutedForeground} fontSize={8} textAnchor="middle">{label.length > 7 ? `${label.slice(0, 6)}…` : label}</SvgText>)}
      {model.cells.map((item) => (
        <G key={`${item.row}-${item.column}`}>
          {item.column === 0 ? <SvgText x={left - 6} y={top + item.row * cell + cell / 2 + 3} fill={theme.mutedForeground} fontSize={8} textAnchor="end">{model.labels[item.row].length > 7 ? `${model.labels[item.row].slice(0, 6)}…` : model.labels[item.row]}</SvgText> : null}
          <Rect x={left + item.column * cell} y={top + item.row * cell} width={cell - 2} height={cell - 2} rx={4} fill={color(item.value)} opacity={0.45 + Math.abs(item.value) * 0.55} />
          <SvgText x={left + item.column * cell + cell / 2 - 1} y={top + item.row * cell + cell / 2 + 3} fill={theme.primaryForeground} fontSize={Math.min(9, cell / 4)} fontWeight="700" textAnchor="middle">{item.value.toFixed(2)}</SvgText>
        </G>
      ))}
    </Svg>
  );
}

function Funnel({ model }: { model: InteractiveGraphModel }) {
  const theme = useTheme();
  const colors = graphColors(theme);
  const max = Math.max(1, ...model.bars.map((bar) => bar.value));
  return (
    <View style={styles.graphStack}>
      {model.bars.map((bar, index) => {
        const width = Math.max(28, bar.value / max * 100);
        return (
          <View key={bar.label} style={styles.funnelRow}>
            <View style={[styles.funnelStage, { width: `${width}%` as `${number}%`, backgroundColor: colors[index % colors.length] + '45', borderColor: colors[index % colors.length] }]}>
              <ThemedText type="smallBold" numberOfLines={1}>{bar.label}</ThemedText>
              <ThemedText type="smallBold" style={{ color: colors[index % colors.length] }}>{compact(bar.value)}</ThemedText>
            </View>
          </View>
        );
      })}
      <Summary model={model} />
    </View>
  );
}

type CompoundLever = 'return' | 'years' | 'monthly';

function CompoundGrowthGraph({
  model,
  controlsLive,
  revealed,
  insightLead,
  insight,
  onCurveChange,
  onMonthlyChange,
  onExplore,
}: {
  model: InteractiveGraphModel;
  controlsLive: boolean;
  revealed: boolean;
  insightLead?: string;
  insight?: string;
  onCurveChange: (annualReturn: number, years: number) => void;
  onMonthlyChange: (monthly: number) => void;
  onExplore: (lever: CompoundLever, value: number) => void;
}) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const data = model.explorable?.kind === 'compoundGrowthLab' ? model.explorable : undefined;
  const [width, setWidth] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [grabbedOnce, setGrabbedOnce] = useState(false);
  const [lastCrossover, setLastCrossover] = useState<number | null>(null);
  const dragStart = useRef<{ pageX: number; pageY: number; years: number; annualReturn: number } | null>(null);
  if (!data) return null;

  const pad = { left: 42, right: 12, top: 18, bottom: 30 };
  const height = 260;
  const x = (year: number) => pad.left + year / Math.max(data.years, 1) * (CHART_WIDTH - pad.left - pad.right);
  const y = (value: number) => height - pad.bottom - value / Math.max(data.domainMax, 1) * (height - pad.top - pad.bottom);
  const total = model.series[0]?.points ?? [];
  const contributed = model.series[1]?.points ?? [];
  const ghost = model.series[2]?.points ?? [];
  const baselineY = y(0);
  const totalArea = total.length ? [`${x(0)},${baselineY}`, ...total.map((point) => `${x(point.x)},${y(point.y)}`), `${x(data.years)},${baselineY}`].join(' ') : '';
  const contributionArea = contributed.length ? [`${x(0)},${baselineY}`, ...contributed.map((point) => `${x(point.x)},${y(point.y)}`), `${x(data.years)},${baselineY}`].join(' ') : '';
  const ghostLine = ghost.map((point) => `${x(point.x)},${y(point.y)}`).join(' ');
  const curveDuration = reduced || dragging ? 0 : COMPOUND_CURVE_MS;
  const shownCrossover = data.crossoverYear ?? (lastCrossover === null ? undefined : Math.min(lastCrossover, data.years));
  const handleX = x(data.years);
  const handleY = y(data.endValue);
  const chipAbove = handleY > 54;
  /*
   * THE LABELS KEEP CLEAR OF THE LINES AND OF EACH OTHER (owner, 2026-10-14: "can you format this
   * well"). The year axis always ends at the chosen year, so the handle always sits on the plot's
   * right edge: a "drag me" centred on it lost its right half off the chart and landed on the chip,
   * which is clamped in just above. "where you started", centred over its dashed line, sat on the
   * solid line beside it. Now "drag me" sits just left of the handle, a few points above its centre
   * so a flat curve (the Manhattan trade's $24 on a $2.5M axis lies along the baseline) never runs
   * through it, with the chip lifted clear above; and "where you started" takes the first spot by
   * its dashed line that clears every other line and label. When the curves crowd the line (a
   * steep curve over a low dashed one), it becomes a legend instead, a dashed swatch and the words
   * in the plot's empty upper area, and it stays off only if even that would overlap something.
   */
  const chipX = Math.min(Math.max(handleX - 52, 2), CHART_WIDTH - 106);
  const chipY = handleY + (chipAbove ? -40 : 18);
  const showDragHint = !grabbedOnce && controlsLive;
  const crossoverX = shownCrossover === undefined ? undefined : x(shownCrossover);
  const crossoverLabelX = crossoverX === undefined ? undefined : Math.min(Math.max(crossoverX, pad.left + 40), CHART_WIDTH - pad.right - 40);
  const startedLabel = (() => {
    if (!ghost.length) return undefined;
    const labelW = 76; // "where you started" at 9pt
    const plotW = CHART_WIDTH - pad.left - pad.right;
    const valueAt = (points: readonly { x: number; y: number }[], year: number): number => {
      const j = points.findIndex((p) => p.x >= year);
      const after = points[j === -1 ? points.length - 1 : j];
      const before = j > 0 ? points[j - 1] : undefined;
      if (!after) return 0;
      if (!before || j === -1) return after.y;
      return before.y + (after.y - before.y) * ((year - before.x) / (after.x - before.x || 1));
    };
    const ysOver = (points: readonly { x: number; y: number }[], x1: number, x2: number) =>
      [0, 0.25, 0.5, 0.75, 1].map((f) => y(valueAt(points, (x1 + (x2 - x1) * f - pad.left) / plotW * data.years)));
    const boxes: (readonly [number, number, number, number])[] = [
      [handleX - 13, handleY - 13, handleX + 13, handleY + 13],
      [chipX, chipY, chipX + 104, chipY + 22],
      ...(showDragHint ? [[handleX - 62, handleY - 15, handleX - 14, handleY - 3] as const] : []),
      ...(crossoverX === undefined || crossoverLabelX === undefined
        ? []
        : [[crossoverLabelX - 40, pad.top, crossoverLabelX + 40, pad.top + 12] as const, [crossoverX - 2, pad.top + 14, crossoverX + 2, baselineY] as const]),
    ];
    const fits = (x1: number, baseline: number, w = labelW) => {
      const top = baseline - 8;
      const bottom = baseline + 2;
      const x2 = x1 + w;
      if (x1 < pad.left || x2 > CHART_WIDTH - pad.right || top < pad.top || bottom > baselineY - 2) return false;
      if ([total, contributed].some((line) => ysOver(line, x1, x2).some((ly) => ly > top - 2 && ly < bottom + 2))) return false;
      return boxes.every(([bx1, by1, bx2, by2]) => x2 < bx1 || x1 > bx2 || bottom < by1 || top > by2);
    };
    // The right end first, where the dashed line is highest, then its middle; under it, then over it.
    for (const x1 of [handleX - 16 - labelW, pad.left + plotW * 0.55 - labelW / 2]) {
      const ghostYs = ysOver(ghost, x1, x1 + labelW);
      for (const baseline of [Math.max(...ghostYs) + 11, Math.min(...ghostYs) - 4]) {
        if (fits(x1, baseline)) return { x: x1, y: baseline, legend: false };
      }
    }
    // The legend: a 14pt dashed swatch, 4pt of air, then the words, high in the plot.
    const legendW = 18 + labelW;
    for (const x1 of [pad.left + 6, ...(crossoverX === undefined ? [] : [crossoverX + 8])]) {
      for (const baseline of [pad.top + 26, pad.top + 40]) {
        if (fits(x1, baseline, legendW)) return { x: x1, y: baseline, legend: true };
      }
    }
    return undefined;
  })();
  const yearTickStep = data.years > 30 ? 10 : data.years > 12 ? 5 : data.years > 5 ? 2 : 1;
  const yearTicks: number[] = [];
  for (let year = 0; year <= data.years; year += yearTickStep) yearTicks.push(year);
  const monthlySlider: GraphSlider = { label: 'Monthly contribution', min: 0, max: 1000, default: data.mountMonthly, unit: '$/mo' };

  const beginDrag = (event: GestureResponderEvent) => {
    if (!controlsLive) return;
    dragStart.current = {
      pageX: event.nativeEvent.pageX,
      pageY: event.nativeEvent.pageY,
      years: data.years,
      annualReturn: data.annualReturn,
    };
    setDragging(true);
    setGrabbedOnce(true);
  };
  const rememberCrossover = () => {
    if (data.crossoverYear !== undefined) setLastCrossover(data.crossoverYear);
  };
  const moveDrag = (event: GestureResponderEvent) => {
    const start = dragStart.current;
    if (!start) return;
    const plotWidth = Math.max(1, width * (CHART_WIDTH - pad.left - pad.right) / CHART_WIDTH);
    const plotHeight = height - pad.top - pad.bottom;
    const pixelsPerYear = plotWidth / 50;
    const pixelsPerReturn = plotHeight / 12;
    const nextYears = Math.round(Math.max(1, Math.min(50, start.years + (event.nativeEvent.pageX - start.pageX) / pixelsPerYear)));
    const nextReturn = Math.round(Math.max(0, Math.min(12, start.annualReturn - (event.nativeEvent.pageY - start.pageY) / (pixelsPerReturn * 2.5))) * 2) / 2;
    rememberCrossover();
    onCurveChange(nextReturn, nextYears);
    onExplore('years', nextYears);
    onExplore('return', nextReturn);
  };
  const endDrag = () => {
    dragStart.current = null;
    setDragging(false);
  };
  const accessibilityAdjust = (action: string) => {
    if (action === 'longer' || action === 'increment') {
      const next = Math.min(50, data.years + 5);
      rememberCrossover();
      onCurveChange(data.annualReturn, next);
      onExplore('years', next);
    } else if (action === 'shorter' || action === 'decrement') {
      const next = Math.max(1, data.years - 5);
      rememberCrossover();
      onCurveChange(data.annualReturn, next);
      onExplore('years', next);
    } else {
      const next = Math.max(0, Math.min(12, data.annualReturn + (action === 'hotter' ? 0.5 : -0.5)));
      rememberCrossover();
      onCurveChange(next, data.years);
      onExplore('return', next);
    }
  };

  return (
    <View style={styles.graphStack}>
      <View>
        <ThemedText type="display">{exactDollar(data.endValue)}</ThemedText>
        <ThemedText type="small" themeColor="mutedForeground">
          you put in {exactDollar(data.contributed)} · growth made the other <ThemedText type="smallBold" style={{ color: theme.primary }}>{exactDollar(data.growthPortion)}</ThemedText>
        </ThemedText>
      </View>
      <View style={styles.compoundChart} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        <Svg width="100%" height={height} viewBox={`0 0 ${CHART_WIDTH} ${String(height)}`} accessible={false}>
          {[0.25, 0.5, 0.75, 1].map((fraction) => {
            const value = data.domainMax * fraction;
            return (
              <G key={fraction}>
                <Line x1={pad.left} x2={CHART_WIDTH - pad.right} y1={y(value)} y2={y(value)} stroke={theme.border} strokeWidth={0.8} />
                <SvgText x={pad.left - 6} y={y(value) + 3} fill={theme.mutedForeground} fontSize={9} textAnchor="end">{`$${compact(value)}`}</SvgText>
              </G>
            );
          })}
          {yearTicks.map((year) => <SvgText key={year} x={x(year)} y={height - 9} fill={theme.mutedForeground} fontSize={9} textAnchor="middle">{`${String(year)}y`}</SvgText>)}
          {totalArea ? <Polygon points={totalArea} fill={theme.primary + '25'} /> : null}
          {contributionArea ? <Polygon points={contributionArea} fill={theme.mutedForeground + '2E'} /> : null}
          {contributed.slice(1).map((point, index) => {
            const previous = contributed[index];
            return <TweenLine key={`contributed-${String(index)}`} x1={x(previous.x)} y1={y(previous.y)} x2={x(point.x)} y2={y(point.y)} duration={curveDuration} stroke={theme.mutedForeground} strokeWidth={1.6} />;
          })}
          {total.slice(1).map((point, index) => {
            const previous = total[index];
            return <TweenLine key={`total-${String(index)}`} x1={x(previous.x)} y1={y(previous.y)} x2={x(point.x)} y2={y(point.y)} duration={curveDuration} stroke={theme.primary} strokeWidth={2.8} strokeLinecap="round" />;
          })}
          {ghostLine ? <Polyline points={ghostLine} fill="none" stroke="#F4F4F547" strokeWidth={1.4} strokeDasharray="5 4" /> : null}
          {startedLabel?.legend ? (
            <G>
              <Line x1={startedLabel.x} y1={startedLabel.y - 3} x2={startedLabel.x + 14} y2={startedLabel.y - 3} stroke="#F4F4F547" strokeWidth={1.4} strokeDasharray="5 4" />
              <SvgText x={startedLabel.x + 18} y={startedLabel.y} fill={theme.mutedForeground} fontSize={9} textAnchor="start">where you started</SvgText>
            </G>
          ) : startedLabel ? <SvgText x={startedLabel.x} y={startedLabel.y} fill={theme.mutedForeground} fontSize={9} textAnchor="start">where you started</SvgText> : null}
          {shownCrossover !== undefined ? (
            <G>
              <TweenLine x1={x(shownCrossover)} y1={pad.top + 14} x2={x(shownCrossover)} y2={baselineY} duration={curveDuration} stroke={theme.primary} strokeWidth={1.6} strokeDasharray="2 3" opacity={0.55} />
              <SvgText x={crossoverLabelX} y={pad.top + 9} fill={theme.mutedForeground} fontSize={9} textAnchor="middle">growth takes over</SvgText>
            </G>
          ) : null}
          <TweenCircle cx={handleX} cy={handleY} r={dragging ? 11 : 9} fill={theme.primary} stroke={theme.primaryForeground} strokeWidth={2.5} duration={curveDuration} />
          {showDragHint ? <SvgText x={handleX - 16} y={handleY - 6} fill={theme.text} fontSize={10} fontWeight="700" textAnchor="end">drag me</SvgText> : null}
          {/* Multi-child SvgText anchors each child separately and overlaps them; keep labels one string. Chip clamped inside the plot. */}
          <G transform={`translate(${String(chipX)} ${String(chipY)})`}>
            <Rect width={104} height={22} rx={11} fill={theme.card} stroke={theme.primary} strokeOpacity={0.5} />
            <SvgText x={52} y={15} fill={theme.text} fontSize={10.5} fontWeight="700" textAnchor="middle">{`${String(data.annualReturn)}% · ${String(data.years)} yrs`}</SvgText>
          </G>
        </Svg>
        {controlsLive && width > 0 ? (
          <View
            style={[styles.compoundHandleTarget, { left: width * handleX / CHART_WIDTH - 26, top: handleY - 26 }]}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            // The graph lives inside a vertical ScrollView. Once this 2D handle owns the touch,
            // allowing responder termination makes an upward/downward move become page scroll and
            // silently drops the return-rate axis while horizontal years still work.
            onResponderTerminationRequest={() => false}
            onResponderGrant={beginDrag}
            onResponderMove={moveDrag}
            onResponderRelease={endDrag}
            onResponderTerminate={endDrag}
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel="Compound growth handle. Drag right for more years and up for a higher return."
            accessibilityValue={{ text: `${String(data.annualReturn)}%, ${String(data.years)} years` }}
            accessibilityActions={[
              { name: 'increment', label: 'Add five years' }, { name: 'decrement', label: 'Remove five years' },
              { name: 'hotter', label: 'Raise return' }, { name: 'cooler', label: 'Lower return' },
            ]}
            onAccessibilityAction={(event) => accessibilityAdjust(event.nativeEvent.actionName)}
          />
        ) : null}
      </View>
      <ThemedText type="small" themeColor="mutedForeground">Drag the dot: right for more years, up for a higher return.</ThemedText>
      {revealed ? (
        <View style={[styles.compoundInsight, { borderTopColor: theme.primary + '4D' }]}>
          {insightLead ? <ThemedText type="smallBold">{insightLead}</ThemedText> : null}
          {insight ? <ThemedText type="small" style={styles.compoundInsightBody}>{insight}</ThemedText> : null}
        </View>
      ) : null}
      {controlsLive ? (
        <GraphControl
          slider={monthlySlider}
          value={data.monthly}
          stepOverride={25}
          onChange={(value) => {
            rememberCrossover();
            onMonthlyChange(value);
            onExplore('monthly', value);
          }}
        />
      ) : <ThemedText type="small" themeColor="mutedForeground">Choose your prediction to unlock the controls.</ThemedText>}
      <ThemedText type="small" themeColor="mutedForeground">Starting with {exactDollar(data.startingAmount)} · return and years live on the chart.</ThemedText>
    </View>
  );
}

function InflationTicketWall({ model, touched }: { model: InteractiveGraphModel; touched: boolean }) {
  const theme = useTheme();
  const data = model.explorable?.kind === 'inflationEroder' ? model.explorable : undefined;
  if (!data) return null;
  return (
    <View style={styles.graphStack}>
      <View style={styles.ticketHeadline}>
        <ThemedText type="display" style={{ color: theme.text }}>{data.survivors}</ThemedText>
        <ThemedText type="heading" themeColor="mutedForeground">of {data.totalTickets} tickets left</ThemedText>
      </View>
      <Svg width="100%" height={116} viewBox="0 0 320 116" accessible={false}>
        {model.bars.map((ticket, index) => {
          const column = index % 4;
          const row = Math.floor(index / 4);
          const x = 12 + column * 77;
          const y = 7 + row * 53;
          const alive = ticket.value > 0.02;
          const opacity = alive ? Math.max(ticket.value, 0.12) : 0.28;
          return (
            <G key={ticket.label} opacity={opacity}>
              <Rect x={x} y={y} width={65} height={38} rx={6} fill={alive ? theme.primary + '2E' : 'transparent'} stroke={alive ? theme.primary : theme.border} strokeWidth={2} strokeDasharray={alive ? undefined : '4 3'} />
              <Line x1={x + 46} x2={x + 46} y1={y + 4} y2={y + 34} stroke={alive ? theme.iconLilac : theme.border} strokeWidth={1.2} strokeDasharray="2 2" />
              <Circle cx={x + 55} cy={y + 19} r={2.5} fill="none" stroke={alive ? theme.iconLilac : theme.border} strokeWidth={1.2} />
            </G>
          );
        })}
      </Svg>
      <ThemedText type="small" themeColor="mutedForeground" style={styles.center}>
        ${compact(data.bill)} face value · buys ${data.purchasingPower.toFixed(2)} of today&apos;s stuff · <ThemedText type="smallBold" style={{ color: theme.destructive }}>−{data.lostPercent}%</ThemedText>
      </ThemedText>
      {data.halfLost && touched ? <ThemedText type="smallBold" style={[styles.center, { color: theme.destructive }]}>Half. Gone. The bill never left the drawer.</ThemedText> : null}
    </View>
  );
}

const PORTFOLIO_CRASH_LABELS = ['2008 crash', 'Dot-com bust', '2022 inflation shock'] as const;

function recoveryLabel(yearsToRecover: number) {
  if (yearsToRecover <= 0) return 'no drawdown, this mix gained';
  return `back to even in roughly ${yearsToRecover < 1 ? 'under a year' : `${yearsToRecover.toFixed(1)} years`}`;
}

function PortfolioMixerGraph({
  model,
  revealed,
  insightLead,
  insight,
  onBoundaryChange,
  onBoundaryCommit,
  onCrash,
}: {
  model: InteractiveGraphModel;
  revealed: boolean;
  insightLead?: string;
  insight?: string;
  onBoundaryChange: (stocks: number, secondBoundary: number) => void;
  onBoundaryCommit: () => void;
  onCrash: (index: number) => void;
}) {
  const theme = useTheme();
  const data = model.explorable?.kind === 'portfolioMixer' ? model.explorable : undefined;
  const [width, setWidth] = useState(0);
  const [grabbedOnce, setGrabbedOnce] = useState(false);
  const activeBoundary = useRef<0 | 1 | null>(null);
  if (!data) return null;
  const secondBoundary = data.stocks + data.bonds;
  const positionFromEvent = (event: GestureResponderEvent) => Math.max(0, Math.min(100, event.nativeEvent.locationX / Math.max(width, 1) * 100));
  const moveBoundary = (event: GestureResponderEvent) => {
    const position = positionFromEvent(event);
    const boundary = activeBoundary.current ?? (Math.abs(position - data.stocks) <= Math.abs(position - secondBoundary) ? 0 : 1);
    activeBoundary.current = boundary;
    if (boundary === 0) onBoundaryChange(Math.min(position, secondBoundary), secondBoundary);
    else onBoundaryChange(data.stocks, Math.max(position, data.stocks));
  };
  const allPoints = model.series.flatMap((series) => series.points);
  const range = model.range ?? { xMin: 0, xMax: data.years, yMin: 0, yMax: Math.max(...allPoints.map((point) => point.y), 1) };
  const x = (value: number) => 35 + (value - range.xMin) / Math.max(range.xMax - range.xMin, 1) * 273;
  const y = (value: number) => 174 - (value - range.yMin) / Math.max(range.yMax - range.yMin, 1) * 148;
  const median = model.series[0]?.points ?? [];
  const best = model.series[1]?.points ?? [];
  const worst = model.series[2]?.points ?? [];
  const band = [...best, ...[...worst].reverse()].map((point) => `${x(point.x)},${y(point.y)}`).join(' ');
  const medianLine = median.map((point) => `${x(point.x)},${y(point.y)}`).join(' ');
  const selectedCrash = data.crash?.label;
  const riskColor = data.riskPercent < 25 ? PORTFOLIO_COLORS.positive : data.riskPercent < 55 ? '#F59E0B' : PORTFOLIO_COLORS.negative;
  const commitBoundary = () => {
    activeBoundary.current = null;
    setGrabbedOnce(true);
    onBoundaryCommit();
  };
  const segments = [
    { key: 'stocks', percent: data.stocks, label: `Stocks ${String(data.stocks)}%`, color: PORTFOLIO_COLORS.primary },
    { key: 'bonds', percent: data.bonds, label: `Bonds ${String(data.bonds)}%`, color: PORTFOLIO_COLORS.accent },
    { key: 'cash', percent: data.cash, label: `Cash ${String(data.cash)}%`, color: PORTFOLIO_COLORS.muted },
  ];
  return (
    <View style={styles.graphStack}>
      <View style={styles.portfolioHeadline}>
        <View style={{ flex: 1 }}>
          <ThemedText type="small" themeColor="mutedForeground">Likely value in {data.years} years</ThemedText>
          <ThemedText type="display">{portfolioDollar(data.medianEnd)}</ThemedText>
          <ThemedText type="small" themeColor="mutedForeground">10th to 90th percentile: <ThemedText type="smallBold" style={{ color: PORTFOLIO_COLORS.negative }}>{portfolioDollar(data.worstEnd)}</ThemedText> to <ThemedText type="smallBold" style={{ color: PORTFOLIO_COLORS.positive }}>{portfolioDollar(data.bestEnd)}</ThemedText></ThemedText>
        </View>
        <ThemedText type="smallBold" style={{ color: riskColor }}>{data.riskLabel} risk</ThemedText>
      </View>

      <View
        style={styles.allocationTouch}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={moveBoundary}
        onResponderMove={moveBoundary}
        onResponderRelease={commitBoundary}
        onResponderTerminate={commitBoundary}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Portfolio allocation bar. Drag the two dividers to rebalance stocks, bonds, and cash."
        accessibilityValue={{ text: `Stocks ${data.stocks}%, bonds ${data.bonds}%, cash ${data.cash}%` }}>
        <View style={styles.allocationBar}>
          {segments.map((segment) => <View key={segment.key} style={{ width: `${segment.percent}%`, backgroundColor: segment.color }} />)}
        </View>
        <View pointerEvents="none" style={[styles.allocationHandle, { left: `${data.stocks}%` }]} />
        <View pointerEvents="none" style={[styles.allocationHandle, { left: `${secondBoundary}%` }]} />
        <View pointerEvents="none" style={styles.allocationLabels}>
          {segments.map((segment) => {
            const segmentWidth = width * segment.percent / 100;
            return (
              <View key={segment.key} style={[styles.allocationLabelSegment, { width: `${segment.percent}%` }]}>
                {segmentWidth > 62 ? <ThemedText type="smallBold" numberOfLines={1}>{segment.label}</ThemedText> : null}
              </View>
            );
          })}
        </View>
        {!grabbedOnce ? <ThemedText type="smallBold" style={styles.allocationHint}>← drag the dividers →</ThemedText> : null}
      </View>

      <Svg width="100%" height={196} viewBox="0 0 320 196" accessible={false}>
        {[0.25, 0.5, 0.75, 1].map((fraction) => <G key={fraction}><Line x1={35} x2={308} y1={y(range.yMax * fraction)} y2={y(range.yMax * fraction)} stroke={theme.border} strokeWidth={0.8} /><SvgText x={29} y={y(range.yMax * fraction) + 3.5} fill={theme.mutedForeground} fontSize={9.5} textAnchor="end" opacity={portfolioAxisLabel}>{portfolioDollar(range.yMax * fraction)}</SvgText></G>)}
        {band ? <Polygon points={band} fill={PORTFOLIO_COLORS.primary + '24'} /> : null}
        {medianLine ? <Polyline points={medianLine} fill="none" stroke={PORTFOLIO_COLORS.primary} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" /> : null}
        {worst.length ? <Polyline points={worst.map((point) => `${x(point.x)},${y(point.y)}`).join(' ')} fill="none" stroke={PORTFOLIO_COLORS.negative} strokeWidth={1.2} strokeDasharray="3 3" opacity={0.65} /> : null}
        <SvgText x={35} y={190} fill={theme.mutedForeground} fontSize={10}>0y</SvgText>
        <SvgText x={x(Math.round(data.years / 2))} y={190} fill={theme.mutedForeground} fontSize={10} textAnchor="middle">{`${String(Math.round(data.years / 2))}y`}</SvgText>
        <SvgText x={308} y={190} fill={theme.mutedForeground} fontSize={10} textAnchor="end">{`${String(data.years)}y`}</SvgText>
      </Svg>

      <View style={styles.crashChips}>
        {PORTFOLIO_CRASH_LABELS.map((label, index) => {
          const selected = selectedCrash === label;
          return (
            <SpringPressable key={label} haptic scaleTo={0.96} onPress={() => onCrash(index)} accessibilityRole="button" accessibilityLabel={`Run ${label} stress test`}>
              <View style={[styles.crashChip, { borderColor: selected ? theme.destructive : theme.border, backgroundColor: selected ? theme.destructive + '1F' : theme.card }]}>
                <ThemedText type="smallBold" style={{ color: selected ? theme.destructive : theme.text }}>{label}</ThemedText>
              </View>
            </SpringPressable>
          );
        })}
        {selectedCrash ? (
          <SpringPressable haptic scaleTo={0.96} onPress={() => onCrash(-1)} accessibilityRole="button" accessibilityLabel="Clear">
            <View style={[styles.crashChip, { borderColor: theme.border }]}><ThemedText type="smallBold" themeColor="mutedForeground">Clear</ThemedText></View>
          </SpringPressable>
        ) : null}
      </View>

      {data.crash ? (
        <Card style={[styles.crashResult, { borderColor: theme.destructive + '4D' }]}>
          <ThemedText type="smallBold" themeColor="mutedForeground">{data.crash.label}: your mix vs all-in on stocks</ThemedText>
          {[
            { label: 'Your mix', value: data.crash.yours, recovery: data.crash.yoursRecoveryYears, color: PORTFOLIO_COLORS.primary },
            { label: '100% stocks', value: data.crash.allStock, recovery: data.crash.allStockRecoveryYears, color: PORTFOLIO_COLORS.negative },
          ].map((row) => (
            <View key={row.label} style={styles.crashRow}>
              <View style={styles.between}><ThemedText type="smallBold">{row.label}</ThemedText><ThemedText type="smallBold" style={{ color: row.value < 0 ? theme.destructive : theme.success }}>{row.value >= 0 ? '+' : ''}{(row.value * 100).toFixed(1)}%</ThemedText></View>
              <View style={[styles.crashTrack, { backgroundColor: theme.muted }]}><View style={[styles.crashFill, { width: `${Math.min(100, Math.abs(row.value) * 200)}%`, backgroundColor: row.color }]} /></View>
              <ThemedText type="small" themeColor="mutedForeground">{recoveryLabel(row.recovery)}</ThemedText>
            </View>
          ))}
        </Card>
      ) : null}
      {revealed && insight ? (
        <View style={styles.portfolioInsight}>
          {insightLead ? <ThemedText type="smallBold">{insightLead}</ThemedText> : null}
          <ThemedText type="small" style={styles.compoundInsightBody}>{insight}</ThemedText>
        </View>
      ) : null}
    </View>
  );
}

type GraphBodyProps = {
  model: InteractiveGraphModel;
  explorableTouched?: boolean;
  controlsLive?: boolean;
  revealed?: boolean;
  insightLead?: string;
  insight?: string;
  onCompoundCurveChange?: (annualReturn: number, years: number) => void;
  onCompoundMonthlyChange?: (monthly: number) => void;
  onCompoundExplore?: (lever: CompoundLever, value: number) => void;
  onPortfolioBoundaryChange?: (stocks: number, secondBoundary: number) => void;
  onPortfolioBoundaryCommit?: () => void;
  onPortfolioCrash?: (index: number) => void;
};

function GraphBody({ model, explorableTouched, controlsLive, revealed, insightLead, insight, onCompoundCurveChange, onCompoundMonthlyChange, onCompoundExplore, onPortfolioBoundaryChange, onPortfolioBoundaryCommit, onPortfolioCrash }: GraphBodyProps) {
  if (model.presentation === 'compoundGrowthLab') return (
    <CompoundGrowthGraph
      model={model}
      controlsLive={Boolean(controlsLive)}
      revealed={Boolean(revealed)}
      insightLead={insightLead}
      insight={insight}
      onCurveChange={onCompoundCurveChange ?? (() => {})}
      onMonthlyChange={onCompoundMonthlyChange ?? (() => {})}
      onExplore={onCompoundExplore ?? (() => {})}
    />
  );
  if (model.presentation === 'inflationEroder') return <InflationTicketWall model={model} touched={Boolean(explorableTouched)} />;
  if (model.presentation === 'portfolioMixer') return (
    <PortfolioMixerGraph
      model={model}
      revealed={Boolean(revealed)}
      insightLead={insightLead}
      insight={insight}
      onBoundaryChange={onPortfolioBoundaryChange ?? (() => {})}
      onBoundaryCommit={onPortfolioBoundaryCommit ?? (() => {})}
      onCrash={onPortfolioCrash ?? (() => {})}
    />
  );
  if (['comparison', 'exponential', 'timeline', 'distribution', 'multiline', 'financialChart', 'line'].includes(model.presentation)) return <LineGraph model={model} />;
  if (model.presentation === 'pie') return <PieGraph model={model} />;
  if (model.presentation === 'balanceSheet') return <BalanceSheet model={model} />;
  if (model.presentation === 'gauge') return <Gauge model={model} />;
  if (model.presentation === 'waterfall') return <Waterfall model={model} />;
  if (model.presentation === 'meter') return <Meter model={model} />;
  if (model.presentation === 'scatter') return <Scatter model={model} />;
  if (model.presentation === 'heatmap') return <Heatmap model={model} />;
  if (model.presentation === 'funnel') return <Funnel model={model} />;
  return <BarGraph model={model} />;
}

function MotionGraph(props: GraphBodyProps) {
  const reduced = useReducedMotion();
  const isExplorableModel = Boolean(props.model.explorable);
  const progress = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced || isExplorableModel) {
      progress.set(1);
      return;
    }
    progress.set(0);
    progress.set(withTiming(1, { duration: Duration.base, easing: Ease.out }));
  }, [isExplorableModel, progress, reduced]);

  const style = useAnimatedStyle(() => {
    const value = progress.get();
    return { opacity: value, transform: [{ translateY: (1 - value) * 8 }, { scale: 0.985 + value * 0.015 }] };
  });
  return <Animated.View style={style}><GraphBody {...props} /></Animated.View>;
}

function AtlasPrompt({ visible }: { visible: boolean }) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const progress = useSharedValue(visible ? 1 : 0);
  useEffect(() => {
    progress.set(reduced ? (visible ? 1 : 0) : withSpring(visible ? 1 : 0, WEB_GRAPH_BOUNCY));
  }, [progress, reduced, visible]);
  const style = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ translateX: (1 - progress.get()) * -20 }, { scale: 0.82 + progress.get() * 0.18 }],
    height: progress.get() * 56,
  }));
  return (
    <Animated.View pointerEvents={visible ? 'auto' : 'none'} style={[styles.prompt, style]}>
      <Atlas size={40} expression="happy" />
      <View style={[styles.promptBubble, { backgroundColor: theme.card, borderColor: theme.border }]}><ThemedText type="smallBold">Here, try this one yourself</ThemedText></View>
    </Animated.View>
  );
}

export type InteractiveGraphControlValue = { label: string; value: number; unit?: string };

function explorablePredict(step?: ExplorableStepData) {
  const value = step?.params?.predict;
  if (!value || typeof value !== 'object') return undefined;
  const candidate = value as { question?: unknown; options?: unknown };
  if (typeof candidate.question !== 'string' || !Array.isArray(candidate.options) || !candidate.options.every((option) => typeof option === 'string')) return undefined;
  return { question: candidate.question, options: candidate.options as string[] };
}

function ExplorableCheckCard({
  check,
  firstWrong,
  finalPick,
  onPick,
  onComplete,
}: {
  check: ExplorableCheck;
  firstWrong: number | null;
  finalPick: number | null;
  onPick: (index: number) => void;
  onComplete: (correct: boolean) => void;
}) {
  const theme = useTheme();
  const locked = finalPick !== null;
  const correct = finalPick === check.correct;
  return (
    <View style={styles.checkCard}>
      <ThemedText type="heading">{check.question}</ThemedText>
      <View style={styles.checkOptions}>
        {check.options.map((option, index) => {
          const wrong = firstWrong === index || (finalPick === index && index !== check.correct);
          const right = finalPick === index && index === check.correct;
          return (
            <SpringPressable key={option} haptic scaleTo={0.98} disabled={locked || firstWrong === index} onPress={() => onPick(index)} accessibilityRole="button" accessibilityState={{ disabled: locked || firstWrong === index, selected: finalPick === index }}>
              <View style={[styles.checkOption, { borderColor: wrong ? theme.destructive : right ? theme.success : theme.border, opacity: locked && finalPick !== index ? 0.55 : 1 }]}> 
                <ThemedText type="body" style={styles.checkOptionText}>{option}</ThemedText>
                {right ? <UIcon name="check" size={20} color={theme.success} strokeWidth={3} /> : null}
              </View>
            </SpringPressable>
          );
        })}
      </View>
      {firstWrong !== null && finalPick === null ? <ThemedText type="small" themeColor="textSecondary">Not that one. The chart you just dragged has the answer.</ThemedText> : null}
      {finalPick !== null ? <ThemedText type="small" themeColor="textSecondary">{correct ? check.explanationCorrect : check.explanationWrong}</ThemedText> : null}
      {finalPick !== null ? <Button label="Continue" full onPress={() => onComplete(correct)} /> : null}
    </View>
  );
}

export function InteractiveGraph({
  step,
  onValuesChange,
  onComplete,
}: {
  step: InteractiveGraphInput;
  onValuesChange?: (values: InteractiveGraphControlValue[]) => void;
  onComplete: (correct: boolean) => void;
}) {
  const theme = useTheme();
  const explorable = step.type === 'explorable' ? step : undefined;
  const graphStep = step.type === 'interactiveGraph' ? step : undefined;
  const predict = explorable?.widget === 'inflationEroder' || explorable?.widget === 'compoundGrowthLab' ? explorablePredict(explorable) : undefined;
  const sliders = useMemo(() => effectiveGraphSliders(step), [step]);
  const [values, setValues] = useState(() => defaultGraphValues(step));
  const [revealedInsights, setRevealedInsights] = useState(0);
  const [touched, setTouched] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [betIndex, setBetIndex] = useState<number | null>(null);
  const [crashIndex, setCrashIndex] = useState(-1);
  const triedAllocations = useRef(new Set<string>());
  const [triedCount, setTriedCount] = useState(0);
  const compoundExplored = useRef(new Set<CompoundLever>());
  const [compoundExploredCount, setCompoundExploredCount] = useState(0);
  const [firstWrong, setFirstWrong] = useState<number | null>(null);
  const [finalPick, setFinalPick] = useState<number | null>(null);
  const graphDwellRemaining = useGraphDwell();
  const model = useMemo(() => buildInteractiveGraphModel(step, [...values, crashIndex]), [crashIndex, step, values]);
  const special = model.explorable;
  const revealed = special?.kind === 'inflationEroder'
    ? touched && special.revealReady
    : special?.kind === 'portfolioMixer' ? triedCount >= 3 && crashIndex >= 0
    : special?.kind === 'compoundGrowthLab' ? compoundExploredCount >= 3 : false;
  const controlsLive = !predict || betIndex !== null;
  const title = step.title;
  const description = explorable?.prompt ?? graphStep?.description ?? '';
  const sectionLabel = graphStep?.sectionLabel ?? 'Graph';

  useEffect(() => {
    const controls = special?.kind === 'portfolioMixer' ? [
      { label: 'Stocks', value: special.stocks, unit: '%' },
      { label: 'Bonds', value: special.bonds, unit: '%' },
      { label: 'Cash', value: special.cash, unit: '%' },
    ] : sliders.map((slider, index) => ({
      label: slider.label,
      value: values[index],
      ...(slider.unit ? { unit: slider.unit } : {}),
    }));
    onValuesChange?.(controls);
  }, [onValuesChange, sliders, special, values]);

  useEffect(() => {
    const timer = setTimeout(() => setShowPrompt(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const update = (index: number, value: number) => {
    setTouched(true);
    if (graphStep) setRevealedInsights((current) => Math.min(current + 1, graphStep.insights.length));
    setValues((current) => current.map((item, itemIndex) => itemIndex === index ? value : item));
  };

  const updatePortfolio = (stocks: number, secondBoundary: number) => {
    setTouched(true);
    setValues([stocks, secondBoundary]);
  };
  const updateCompoundCurve = (annualReturn: number, years: number) => {
    setTouched(true);
    setValues((current) => [annualReturn, years, current[2] ?? 0]);
  };
  const updateCompoundMonthly = (monthly: number) => {
    setTouched(true);
    setValues((current) => [current[0] ?? 0, current[1] ?? 1, monthly]);
  };
  const trackCompoundExplore = (lever: CompoundLever, value: number) => {
    if (special?.kind !== 'compoundGrowthLab' || compoundExplored.current.has(lever)) return;
    const mount = lever === 'return' ? special.mountAnnualReturn : lever === 'years' ? special.mountYears : special.mountMonthly;
    const threshold = lever === 'return' ? 2 : lever === 'years' ? 5 : 50;
    if (Math.abs(value - mount) < threshold) return;
    compoundExplored.current.add(lever);
    setCompoundExploredCount(compoundExplored.current.size);
  };
  const recordPortfolioTry = () => {
    if (special?.kind !== 'portfolioMixer') return;
    const signature = `${String(special.stocks)}-${String(special.bonds)}`;
    if (triedAllocations.current.has(signature)) return;
    triedAllocations.current.add(signature);
    setTriedCount(triedAllocations.current.size);
  };
  const runCrash = (index: number) => {
    if (index < 0) {
      setCrashIndex(-1);
      return;
    }
    setTouched(true);
    recordPortfolioTry();
    setCrashIndex(index);
  };
  const answerCheck = (index: number) => {
    const check = explorable?.check;
    if (!check || finalPick !== null || firstWrong === index) return;
    if (index === check.correct) setFinalPick(index);
    else if (firstWrong === null) setFirstWrong(index);
    else setFinalPick(index);
  };
  const insightLead = special?.kind === 'inflationEroder' && betIndex !== null && predict
    ? (() => {
        // Score the bet against the question's own years/rate (step params), not the live sliders:
        // the reveal needs 28+ years, so the sliders rarely sit where the question was asked.
        const asked = buildInteractiveGraphModel(step, []).explorable;
        const answer = asked?.kind === 'inflationEroder' ? asked.survivors : special.survivors;
        const called = predict.options[betIndex]?.match(/\d+/)?.[0];
        return called && Number(called) !== answer ? `You called ${called} tickets. Inflation left ${String(answer)}.` : undefined;
      })()
    : special?.kind === 'compoundGrowthLab' && revealed
      ? (() => {
          const entries = [
            { key: 'years' as const, name: 'Ten extra years', short: 'the extra years', delta: special.tenYearDelta },
            { key: 'monthly' as const, name: 'The doubled deposit', short: 'the bigger deposit', delta: special.doubleMonthlyDelta },
            { key: 'return' as const, name: 'The hotter return', short: 'the hotter return', delta: special.hotterReturnDelta },
          ].sort((left, right) => right.delta - left.delta);
          const option = betIndex === null ? '' : predict?.options[betIndex] ?? '';
          const bet = /year/i.test(option) ? 'years' : /deposit|month|\/mo/i.test(option) ? 'monthly' : /return|%/.test(option) ? 'return' : undefined;
          if (bet && bet !== entries[0].key) {
            const chosen = entries.find((entry) => entry.key === bet);
            return chosen ? `You bet on ${chosen.short}. ${entries[0].name} beat it by ${exactDollar(Math.round((entries[0].delta - chosen.delta) / 100) * 100)}.` : undefined;
          }
          return `You tried all three: ${entries.map((entry) => `${entry.name.toLowerCase()} +${exactDollar(Math.round(entry.delta / 100) * 100)}`).join(' · ')}.`;
        })()
      : undefined;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, explorable && styles.explorableContent]}>
      {explorable ? (
        <View style={styles.explorableHeader}>
          <ThemedText type="title" style={styles.explorableTitle}>{title}</ThemedText>
          <ThemedText type="body" themeColor="textSecondary" style={styles.explorableDescription}>{description}</ThemedText>
        </View>
      ) : graphStep ? (
        <>
          <ThemedText type="label" style={{ color: theme.iconLilac }}>{sectionLabel.toUpperCase()}</ThemedText>
          <ThemedText type="title" style={{ marginTop: Spacing.one }}>{title}</ThemedText>
          <ThemedText type="body" themeColor="textSecondary" style={{ marginTop: Spacing.two }}>{description}</ThemedText>
        </>
      ) : null}

      {predict && betIndex === null ? (
        <View style={styles.predictBlock}>
          <ThemedText type="heading">{predict.question}</ThemedText>
          <View style={styles.predictOptions}>
            {predict.options.map((option, index) => (
              <SpringPressable key={option} haptic scaleTo={0.97} onPress={() => setBetIndex(index)} accessibilityRole="button">
                <View style={[styles.predictOption, { borderColor: theme.border }]}><ThemedText type="smallBold">{option}</ThemedText></View>
              </SpringPressable>
            ))}
          </View>
        </View>
      ) : null}
      {predict && betIndex !== null && !revealed ? <ThemedText type="small" themeColor="mutedForeground">Your call: <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>{predict.options[betIndex]}</ThemedText></ThemedText> : null}

      {explorable ? (
        <View style={[styles.explorableStage, !controlsLive && styles.explorableLocked]}>
          <MotionGraph
            model={model}
            explorableTouched={touched}
            controlsLive={controlsLive}
            revealed={revealed}
            insightLead={insightLead}
            insight={explorable.insight}
            onCompoundCurveChange={updateCompoundCurve}
            onCompoundMonthlyChange={updateCompoundMonthly}
            onCompoundExplore={trackCompoundExplore}
            onPortfolioBoundaryChange={updatePortfolio}
            onPortfolioBoundaryCommit={recordPortfolioTry}
            onPortfolioCrash={runCrash}
          />
        </View>
      ) : (
        <Card elevated style={styles.graphCard} accessible accessibilityRole="image" accessibilityLabel={model.accessibilityLabel}>
          <MotionGraph
            model={model}
            explorableTouched={touched}
            controlsLive={controlsLive}
            revealed={revealed}
            insightLead={insightLead}
            onCompoundCurveChange={updateCompoundCurve}
            onCompoundMonthlyChange={updateCompoundMonthly}
            onCompoundExplore={trackCompoundExplore}
            onPortfolioBoundaryChange={updatePortfolio}
            onPortfolioBoundaryCommit={recordPortfolioTry}
            onPortfolioCrash={runCrash}
          />
          <AtlasPrompt visible={showPrompt && !touched} />
        </Card>
      )}

      {special?.kind !== 'portfolioMixer' && special?.kind !== 'compoundGrowthLab' && controlsLive ? (
        <View style={styles.controls}>
          {sliders.map((slider, index) => <GraphControl key={`${slider.label}-${String(index)}`} slider={slider} value={values[index]} onChange={(value) => update(index, value)} />)}
        </View>
      ) : null}

      <View style={styles.prose}>
        {explorable ? (
          special?.kind === 'portfolioMixer'
            ? revealed
              ? null
              : <ThemedText type="small" themeColor="mutedForeground">Try {Math.max(0, 3 - triedCount)} more allocation{3 - triedCount === 1 ? '' : 's'}{crashIndex >= 0 ? '' : ' and run a crash test'} to unlock the insight.</ThemedText>
            : revealed ? special?.kind === 'compoundGrowthLab' ? null : <Card style={[styles.insight, { borderColor: theme.primary + '3D' }]}><View style={{ flex: 1, gap: 4 }}>{insightLead ? <ThemedText type="smallBold">{insightLead}</ThemedText> : null}<ThemedText type="body" themeColor="textSecondary">{explorable.insight}</ThemedText></View></Card> : null
        ) : graphStep ? (
          <>
            {graphStep.paragraphs.filter(Boolean).map((paragraph, index) => <ThemedText key={`p-${String(index)}`} type="body" themeColor="textSecondary">{paragraph}</ThemedText>)}
            {graphStep.insights.slice(0, revealedInsights).map((insight, index) => (
              <Card key={`insight-${String(index)}`} style={[styles.insight, { borderColor: theme.primary + '3D' }]}>
                <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>{index + 1}.</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={{ flex: 1 }}>{insight}</ThemedText>
              </Card>
            ))}
            {graphStep.highlightedTerms.map((term) => (
              <Card key={term.term} style={styles.term}>
                <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>{term.term}</ThemedText>
                <ThemedText type="body">{term.definition}</ThemedText>
                {term.example ? <ThemedText type="small" themeColor="mutedForeground">{term.example}</ThemedText> : null}
              </Card>
            ))}
            {graphStep.realExample ? (
              <Card elevated style={styles.term}>
                <ThemedText type="label" style={{ color: theme.iconLilac }}>{graphStep.realExample.company.toUpperCase()}</ThemedText>
                <ThemedText type="heading" style={{ fontSize: FontSize.subhead }}>{graphStep.realExample.metric}</ThemedText>
                <ThemedText type="smallBold">{graphStep.realExample.outcome}</ThemedText>
                <ThemedText type="small" themeColor="mutedForeground">{graphStep.realExample.explanation}</ThemedText>
              </Card>
            ) : null}
          </>
        ) : null}
      </View>
      {revealed && explorable?.check ? (
        <ExplorableCheckCard
          check={explorable.check}
          firstWrong={firstWrong}
          finalPick={finalPick}
          onPick={answerCheck}
          onComplete={onComplete}
        />
      ) : null}
      {revealed && !explorable?.check ? <Button label="Continue" full onPress={() => onComplete(true)} /> : null}
      {graphStep ? (
        <Button
          label={graphDwellRemaining > 0 ? `Continue in ${String(graphDwellRemaining)}s` : 'Continue'}
          disabled={graphDwellRemaining > 0}
          onPress={() => onComplete(true)}
          style={styles.continueButton}
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: CTA_CLEARANCE, gap: Spacing.three },
  explorableContent: { paddingHorizontal: 16, paddingTop: 16, gap: 24 },
  explorableHeader: { gap: 8 },
  explorableTitle: { fontSize: 30, lineHeight: 36, fontWeight: '700', letterSpacing: -0.4 },
  explorableDescription: { fontSize: 16, lineHeight: 26 },
  explorableStage: { width: '100%' },
  explorableLocked: { opacity: 0.4 },
  graphCard: { marginTop: Spacing.one, minHeight: 260, justifyContent: 'center', overflow: 'hidden' },
  graphStack: { gap: Spacing.two },
  compoundChart: { position: 'relative' },
  compoundHandleTarget: { position: 'absolute', width: 52, height: 52, borderRadius: 26 },
  compoundInsight: { backgroundColor: 'rgba(0,0,0,0.7)', borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingVertical: 12, gap: 4 },
  compoundInsightBody: { opacity: 0.8 },
  ticketHeadline: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two, paddingBottom: Spacing.one },
  portfolioHeadline: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  allocationTouch: { minHeight: 88, justifyContent: 'center', paddingVertical: Spacing.three },
  allocationBar: { height: 44, borderRadius: Radius.md, overflow: 'hidden', flexDirection: 'row' },
  allocationHandle: { position: 'absolute', width: 7, height: 52, marginLeft: -3.5, top: 18, borderRadius: 4, backgroundColor: '#FFFFFF' },
  allocationLabels: { position: 'absolute', left: 0, right: 0, top: 34, flexDirection: 'row' },
  allocationLabelSegment: { alignItems: 'center' },
  allocationHint: { position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center', fontSize: 10 },
  portfolioInsight: { position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 4, backgroundColor: 'rgba(0,0,0,0.70)', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(164,81,230,0.30)', paddingHorizontal: 16, paddingVertical: 12, gap: 4 },
  crashChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  crashChip: { minHeight: 44, justifyContent: 'center', borderRadius: Radius.pill, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: Spacing.three },
  crashResult: { gap: Spacing.three },
  crashRow: { gap: 5 },
  crashTrack: { height: 10, borderRadius: Radius.pill, overflow: 'hidden' },
  crashFill: { height: '100%', borderRadius: Radius.pill },
  predictBlock: { gap: Spacing.two },
  predictOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  predictOption: { minHeight: 44, justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.pill, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  checkCard: { gap: Spacing.three },
  checkOptions: { gap: Spacing.one },
  checkOption: { minHeight: 44, flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two, borderLeftWidth: 2, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  checkOptionText: { flex: 1 },
  controls: { gap: Spacing.two },
  controlCard: { gap: 2 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  trackHit: { width: '100%', paddingVertical: 18 },
  track: { height: 8, borderRadius: Radius.pill, justifyContent: 'center' },
  trackFill: { position: 'absolute', height: 8, borderRadius: Radius.pill },
  thumb: { position: 'absolute', width: 20, height: 20, borderRadius: 10, top: -6, transform: [{ translateX: -10 }], borderWidth: 3 },
  legend: { gap: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  swatch: { width: 9, height: 9, borderRadius: 3 },
  summary: { alignItems: 'center', gap: 1 },
  center: { textAlign: 'center' },
  pieRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  pieLegend: { flex: 1, gap: Spacing.two },
  status: { alignSelf: 'center', borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: Spacing.three, paddingVertical: Spacing.one, borderRadius: Radius.md },
  meterRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  meterLabel: { width: 72, textAlign: 'right' },
  meterTrack: { flex: 1, height: 23, borderRadius: Radius.pill, overflow: 'hidden' },
  meterFill: { height: '100%', borderRightWidth: 3, borderRadius: Radius.pill },
  funnelRow: { alignItems: 'center' },
  funnelStage: { minHeight: 36, borderWidth: 1, borderRadius: Radius.sm, paddingHorizontal: Spacing.two, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.one },
  prompt: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: Spacing.two, overflow: 'hidden' },
  promptBubble: { borderRadius: Radius.lg, borderBottomLeftRadius: Radius.sm, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  prose: { gap: Spacing.three },
  insight: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  term: { gap: 4 },
  continueButton: { minWidth: 180, alignSelf: 'center' },
});
