import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { InteractiveGraphStep } from '@/lib/curriculum';
import {
  buildInteractiveGraphModel,
  defaultGraphValues,
  effectiveGraphSliders,
  type GraphSlider,
  type InteractiveGraphModel,
} from '@/lib/interactive-graph-model';
import { SpringPressable } from '@/shared/motion/spring-pressable';

const CTA_CLEARANCE = 104;

function graphColors(theme: ReturnType<typeof useTheme>) {
  return [theme.success, theme.accent, theme.warning, theme.destructive, theme.iconGold];
}

function formatValue(value: number, slider: GraphSlider) {
  const rounded = Math.abs(value) >= 100 ? Math.round(value).toLocaleString('en-US') : Number(value.toFixed(2)).toLocaleString('en-US');
  return slider.unit === '$' ? `$${rounded}` : `${rounded}${slider.unit}`;
}

function controlStep(slider: GraphSlider) {
  const span = Math.max(0, slider.max - slider.min);
  if (/year|period|horizon|age|score|count|number/i.test(slider.label)) return Math.max(1, Math.round(span / 30));
  if (span <= 10) return 0.25;
  if (span <= 100) return 1;
  return Math.max(1, Math.round(span / 25));
}

function GraphControl({ slider, value, onChange }: { slider: GraphSlider; value: number; onChange: (value: number) => void }) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const span = Math.max(1, slider.max - slider.min);
  const percent = Math.max(0, Math.min(1, (value - slider.min) / span));
  const percentStyle = `${percent * 100}%` as `${number}%`;
  const step = controlStep(slider);
  const set = (next: number) => onChange(Math.max(slider.min, Math.min(slider.max, next)));
  const place = (event: GestureResponderEvent) => {
    if (!width) return;
    const x = Math.max(0, Math.min(width, event.nativeEvent.locationX));
    const raw = slider.min + (x / width) * span;
    set(Math.round(raw / step) * step);
  };
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  return (
    <Card style={styles.controlCard}>
      <View style={styles.between}>
        <ThemedText type="small" themeColor="mutedForeground" style={{ flex: 1 }}>{slider.label}</ThemedText>
        <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>{formatValue(value, slider)}</ThemedText>
      </View>
      <View style={styles.controlRow}>
        <SpringPressable
          haptic={false}
          scaleTo={0.9}
          onPress={() => set(value - step)}
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${slider.label}`}>
          <View style={[styles.nudge, { borderColor: theme.border }]}><ThemedText type="heading">−</ThemedText></View>
        </SpringPressable>
        <Pressable
          style={styles.trackHit}
          onPress={place}
          onLayout={onLayout}
          accessibilityRole="adjustable"
          accessibilityLabel={slider.label}
          accessibilityValue={{ min: slider.min, max: slider.max, now: value, text: formatValue(value, slider) }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(event) => set(value + (event.nativeEvent.actionName === 'decrement' ? -step : step))}>
          <View style={[styles.track, { backgroundColor: theme.muted }]}> 
            <View style={[styles.trackFill, { width: percentStyle, backgroundColor: theme.primary }]} />
            <View style={[styles.thumb, { left: percentStyle, backgroundColor: theme.primary }]} />
          </View>
        </Pressable>
        <SpringPressable
          haptic={false}
          scaleTo={0.9}
          onPress={() => set(value + step)}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${slider.label}`}>
          <View style={[styles.nudge, { borderColor: theme.border, backgroundColor: theme.primary + '1F' }]}><ThemedText type="heading">+</ThemedText></View>
        </SpringPressable>
      </View>
      <View style={styles.between}>
        <ThemedText type="small" themeColor="mutedForeground">{formatValue(slider.min, slider)}</ThemedText>
        <ThemedText type="small" themeColor="mutedForeground">{formatValue(slider.max, slider)}</ThemedText>
      </View>
    </Card>
  );
}

function LineGraph({ model }: { model: InteractiveGraphModel }) {
  const theme = useTheme();
  const colors = graphColors(theme);
  const width = 320;
  const height = 190;
  const pad = { left: 12, right: 12, top: 28, bottom: 28 };
  const points = model.series.flatMap((series) => series.points);
  const min = Math.min(...points.map((point) => point.y));
  const max = Math.max(...points.map((point) => point.y));
  const range = Math.max(1, max - min);
  const count = Math.max(2, ...model.series.map((series) => series.points.length));
  const x = (index: number) => pad.left + index / Math.max(1, count - 1) * (width - pad.left - pad.right);
  const y = (value: number) => pad.top + (1 - (value - min) / range) * (height - pad.top - pad.bottom);

  return (
    <View style={{ gap: Spacing.two }}>
      <Svg width="100%" height={height} viewBox={`0 0 ${String(width)} ${String(height)}`} accessible={false}>
        {[0.25, 0.5, 0.75].map((fraction) => (
          <Line key={fraction} x1={pad.left} x2={width - pad.right} y1={pad.top + fraction * (height - pad.top - pad.bottom)} y2={pad.top + fraction * (height - pad.top - pad.bottom)} stroke={theme.border} strokeWidth={0.7} strokeDasharray="4 4" />
        ))}
        {model.series.map((series, seriesIndex) => {
          const coordinates = series.points.map((point, index) => `${String(x(index))},${String(y(point.y))}`).join(' ');
          return <Polyline key={series.label} points={coordinates} fill="none" stroke={colors[seriesIndex % colors.length]} strokeWidth={seriesIndex === 0 ? 3 : 2.4} strokeDasharray={seriesIndex === 1 ? '7 4' : undefined} strokeLinecap="round" strokeLinejoin="round" />;
        })}
        <SvgText x={pad.left} y={height - 5} fill={theme.mutedForeground} fontSize={10}>{model.axisStart ?? 'Start'}</SvgText>
        <SvgText x={width - pad.right} y={height - 5} fill={theme.mutedForeground} fontSize={10} textAnchor="end">{model.axisEnd ?? 'End'}</SvgText>
      </Svg>
      <View style={styles.legend}>
        {model.series.map((series, index) => (
          <View key={series.label} style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: colors[index % colors.length] }]} />
            <ThemedText type="small" themeColor="mutedForeground" style={{ flex: 1 }}>{series.label}</ThemedText>
            <ThemedText type="smallBold">{Math.round(series.points.at(-1)?.y ?? 0).toLocaleString('en-US')}</ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

function BarGraph({ model }: { model: InteractiveGraphModel }) {
  const theme = useTheme();
  const colors = graphColors(theme);
  const max = Math.max(1, ...model.bars.map((bar) => Math.abs(bar.value)));
  return (
    <View style={{ gap: Spacing.two }}>
      {model.bars.map((bar, index) => (
        <View key={`${bar.label}-${String(index)}`} style={{ gap: 5 }}>
          <View style={styles.between}>
            <ThemedText type="small" themeColor="mutedForeground" style={{ flex: 1 }}>{bar.label}</ThemedText>
            <ThemedText type="smallBold">{Number(bar.value.toFixed(2)).toLocaleString('en-US')}</ThemedText>
          </View>
          <View style={[styles.barTrack, { backgroundColor: theme.muted }]}>
            <View style={[styles.barFill, { width: `${Math.abs(bar.value) / max * 100}%` as `${number}%`, backgroundColor: colors[index % colors.length] }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

function PieGraph({ model }: { model: InteractiveGraphModel }) {
  const theme = useTheme();
  const colors = graphColors(theme);
  const radius = 44;
  const stroke = 18;
  const size = 118;
  const circumference = 2 * Math.PI * radius;
  const total = Math.max(1, model.slices.reduce((sum, slice) => sum + Math.max(0, slice.value), 0));
  const lengths = model.slices.map((slice) => Math.max(0, slice.value) / total * circumference);
  const offsets = lengths.map((_, index) => lengths.slice(0, index).reduce((sum, length) => sum + length, 0));
  return (
    <View style={styles.pieRow}>
      <Svg width={size} height={size} accessible={false}>
        <Circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={theme.muted} strokeWidth={stroke} />
        {model.slices.map((slice, index) => (
          <Circle key={`${slice.label}-${String(index)}`} cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={colors[index % colors.length]} strokeWidth={stroke} strokeDasharray={`${String(lengths[index])} ${String(circumference - lengths[index])}`} strokeDashoffset={-offsets[index]} transform={`rotate(-90 ${String(size / 2)} ${String(size / 2)})`} />
        ))}
      </Svg>
      <View style={{ flex: 1, gap: Spacing.two }}>
        {model.slices.map((slice, index) => (
          <View key={`${slice.label}-legend`} style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: colors[index % colors.length] }]} />
            <ThemedText type="small" themeColor="mutedForeground" style={{ flex: 1 }}>{slice.label}</ThemedText>
            <ThemedText type="smallBold">{Math.round(Math.max(0, slice.value) / total * 100)}%</ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

function Heatmap({ model }: { model: InteractiveGraphModel }) {
  const theme = useTheme();
  return (
    <View style={styles.heatmap}>
      {model.cells.map((cell) => {
        const positive = cell.value >= 0;
        const strength = Math.round(28 + Math.abs(cell.value) * 190).toString(16).padStart(2, '0');
        return <View key={`${String(cell.row)}-${String(cell.column)}`} style={[styles.heatCell, { backgroundColor: `${positive ? theme.success : theme.destructive}${strength}` }]} />;
      })}
    </View>
  );
}

function GraphBody({ model }: { model: InteractiveGraphModel }) {
  if (model.presentation === 'line') return <LineGraph model={model} />;
  if (model.presentation === 'pie') return <PieGraph model={model} />;
  if (model.presentation === 'heatmap') return <Heatmap model={model} />;
  return <BarGraph model={model} />;
}

export function InteractiveGraph({ step }: { step: InteractiveGraphStep }) {
  const theme = useTheme();
  const sliders = useMemo(() => effectiveGraphSliders(step), [step]);
  const [values, setValues] = useState(() => defaultGraphValues(step));
  const model = useMemo(() => buildInteractiveGraphModel(step, values), [step, values]);
  const update = (index: number, value: number) => setValues((current) => current.map((item, itemIndex) => itemIndex === index ? value : item));

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <ThemedText type="label" style={{ color: theme.iconLilac }}>{step.sectionLabel.toUpperCase()}</ThemedText>
      <ThemedText type="title" style={{ marginTop: Spacing.one }}>{step.title}</ThemedText>
      <ThemedText type="body" themeColor="textSecondary" style={{ marginTop: Spacing.two }}>{step.description}</ThemedText>

      <Card elevated style={styles.graphCard} accessible accessibilityRole="image" accessibilityLabel={model.accessibilityLabel}>
        <GraphBody model={model} />
      </Card>

      <View style={{ gap: Spacing.two }}>
        {sliders.map((slider, index) => (
          <GraphControl key={`${slider.label}-${String(index)}`} slider={slider} value={values[index]} onChange={(value) => update(index, value)} />
        ))}
      </View>

      <View style={{ gap: Spacing.three }}>
        {step.paragraphs.filter(Boolean).map((paragraph, index) => <ThemedText key={`p-${String(index)}`} type="body" themeColor="textSecondary">{paragraph}</ThemedText>)}
        {step.highlightedTerms.map((term) => (
          <Card key={term.term} style={{ gap: 4 }}>
            <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>{term.term}</ThemedText>
            <ThemedText type="body">{term.definition}</ThemedText>
            {term.example ? <ThemedText type="small" themeColor="mutedForeground">{term.example}</ThemedText> : null}
          </Card>
        ))}
        {step.insights.length ? (
          <Card style={{ gap: Spacing.two, borderColor: theme.primary + '3D' }}>
            <ThemedText type="label" style={{ color: theme.iconLilac }}>WHAT THE GRAPH SHOWS</ThemedText>
            {step.insights.map((insight, index) => <ThemedText key={`insight-${String(index)}`} type="small" themeColor="textSecondary">• {insight}</ThemedText>)}
          </Card>
        ) : null}
        {step.realExample ? (
          <Card elevated style={{ gap: Spacing.one }}>
            <ThemedText type="label" style={{ color: theme.iconLilac }}>{step.realExample.company.toUpperCase()}</ThemedText>
            <ThemedText type="heading" style={{ fontSize: FontSize.subhead }}>{step.realExample.metric}</ThemedText>
            <ThemedText type="smallBold">{step.realExample.outcome}</ThemedText>
            <ThemedText type="small" themeColor="mutedForeground">{step.realExample.explanation}</ThemedText>
          </Card>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: CTA_CLEARANCE, gap: Spacing.three },
  graphCard: { marginTop: Spacing.one, minHeight: 220, justifyContent: 'center' },
  controlCard: { gap: Spacing.two, paddingVertical: Spacing.two + 2 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  controlRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  trackHit: { flex: 1, paddingVertical: 18 },
  track: { height: 8, borderRadius: Radius.pill, justifyContent: 'center' },
  trackFill: { position: 'absolute', height: 8, borderRadius: Radius.pill },
  thumb: { position: 'absolute', width: 20, height: 20, borderRadius: 10, top: -6, transform: [{ translateX: -10 }], borderWidth: 3, borderColor: '#fff' },
  nudge: { width: 44, height: 44, borderRadius: Radius.md, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  legend: { gap: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  swatch: { width: 9, height: 9, borderRadius: 3 },
  barTrack: { height: 13, borderRadius: Radius.pill, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: Radius.pill },
  pieRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  heatmap: { flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'center', width: 240, gap: 5 },
  heatCell: { width: 44, height: 44, borderRadius: Radius.sm },
});
