/**
 * DigestChart: the native twin of the web's src/features/digest/components/DigestChart.tsx.
 *
 * The numbers live in the post file (post.charts), so there is no image to hotlink and nothing
 * to go stale. What carries over from the web exactly: the four-colour palette in fixed order,
 * the number formatting, the tick rounding, bars anchored at zero, lines scaled to their own
 * data, the legend for multi-series charts, axis labels kept inside the frame, and the
 * "Show the numbers" table.
 *
 * WHAT IS DIFFERENT, AND WHY. The web draws a 720-unit viewBox and lets the browser scale it.
 * On a 390pt phone that shrinks 11px axis text to about 5pt, so here the frame is laid out in
 * real points against the measured width instead. And a phone column is roughly a quarter of a
 * desktop one: of the 59 bar charts synced on 2026-09-28, labels like "Found an error that might
 * affect a score" cannot fit under a 60pt column in any number of lines. When a bar chart's
 * labels do not fit in two lines, it lays out HORIZONTALLY (label above each bar, value at its
 * end), which is still a zero-anchored bar and keeps every category readable. Hover becomes tap.
 */
import { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, useWindowDimensions, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, G, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Fonts, FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { DigestChart as ChartSpec } from '@/lib/digest-content';

/*
 * The web's categorical series colours, assigned in this order and never cycled (the sync fails a
 * chart with a fifth series). Literal hex on purpose, not theme tokens: the web solved these four
 * AS A SET with its palette validator (lightness band, deuteranopia/tritanopia separation,
 * contrast on its dark card), so they are a parity contract with the web chart. Swapping any one
 * for a nearby app token would silently break the separation the set was solved for.
 */
const SERIES = ['#AE4EFE', '#0BA3B1', '#BE8802', '#4D7FFF'] as const;
const colorOf = (i: number) => SERIES[Math.min(i, SERIES.length - 1)];

/** Draw-on length. Monotonic ease-out: data geometry never overshoots (AGENTS.md). */
const DRAW_MS = 700;

type Unit = ChartSpec['unit'];

/** Thousands separators and fixed decimals, without Intl (Hermes' Intl is not guaranteed). */
function num(n: number, d: number): string {
  const s = Math.abs(n).toFixed(d);
  const [int, frac] = s.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${n < 0 ? '-' : ''}${grouped}${frac ? `.${frac}` : ''}`;
}

/** Mirror of the web fmt(): same units, same compact rules, same decimal logic. */
export function fmt(v: number, unit: Unit, compact = false, dp?: number): string {
  const abs = Math.abs(v);
  const n = (x: number, d = 0) => num(x, dp ?? d);
  switch (unit) {
    case 'pct':
      return `${n(v, abs < 10 && !Number.isInteger(v) ? 1 : 0)}%`;
    case 'usd':
      return compact && abs >= 1000 ? `$${n(v / 1000, abs < 10000 ? 1 : 0)}k` : `$${n(v)}`;
    case 'usdK':
      return `$${n(v, abs < 10 ? 1 : 0)}k`;
    case 'usdM':
      return `$${n(v, abs < 10 ? 1 : 0)}M`;
    case 'usdB':
      return `$${n(v, abs < 10 ? 1 : 0)}B`;
    default:
      return compact && abs >= 10000 && dp === undefined ? `${n(v / 1000, 0)}k` : n(v, Number.isInteger(v) ? 0 : 1);
  }
}

/** Mirror of the web ticks(): round a range out to friendly values. */
export function ticks(min: number, max: number, count = 4): number[] {
  if (max === min) {
    const room = Math.abs(max) || 1;
    min = Math.min(0, max - room / 2);
    max = max + room / 2;
  }
  const span = max - min || 1;
  const raw = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? mag * 10;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const out: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) out.push(Number(v.toFixed(10)));
  return out;
}

/** Estimated text width. Same deliberate estimate as the web: fine for reserving space only. */
const textW = (s: string, size: number) => s.length * size * 0.56;

/** Break a label onto at most `maxLines` lines of `maxW`, or null when it cannot be done. */
function wrapLabel(text: string, maxW: number, size: number, maxLines: number): string[] | null {
  if (textW(text, size) <= maxW) return [text];
  const lines: string[] = [];
  let cur = '';
  for (const w of text.split(' ')) {
    const next = cur ? `${cur} ${w}` : w;
    if (textW(next, size) <= maxW || !cur) cur = next;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) return null;
  return lines.every((l) => textW(l, size) <= maxW * 1.1) ? lines : null;
}

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

/** A column that grows up (or down) out of the zero line as `progress` runs 0 -> 1. */
function GrowRect({
  x, y, width, height, zero, fill, rx, progress,
}: {
  x: number; y: number; width: number; height: number; zero: number; fill: string; rx: number;
  progress: SharedValue<number>;
}) {
  const animatedProps = useAnimatedProps(() => {
    const p = progress.get();
    return { y: zero + (y - zero) * p, height: Math.max(0, height * p) };
  });
  return <AnimatedRect x={x} width={width} rx={rx} fill={fill} animatedProps={animatedProps} />;
}

/** A line drawn on left to right by its dash offset, the pattern lesson-visual.tsx uses. */
function DrawLine({ points, length, color, progress }: { points: string; length: number; color: string; progress: SharedValue<number> }) {
  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - progress.get()) }));
  return (
    <AnimatedPolyline
      points={points}
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={[length, length]}
      animatedProps={animatedProps}
    />
  );
}

/** One horizontal bar segment; its width grows with `progress`. */
function GrowBar({ left, width, color, progress, radius }: { left: number; width: number; color: string; progress: SharedValue<number>; radius: number }) {
  const style = useAnimatedStyle(() => ({ width: Math.max(0, width * progress.get()) }));
  return <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, left, borderRadius: radius, backgroundColor: color }, style]} />;
}

const openLink = (url: string) => void Linking.openURL(url).catch(() => undefined);

export function DigestChart({ spec }: { spec: ChartSpec }) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const { fontScale } = useWindowDimensions();
  const [W, setW] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const progress = useSharedValue(reduced ? 1 : 0);

  const { type, labels, series, unit, decimals: dp } = spec;
  const multi = series.length > 1;
  // SVG text does not follow Dynamic Type on its own. Scaled by the system setting, capped where
  // the plot would stop having room for data; past the cap a bar chart falls back to the
  // horizontal layout, whose labels are ordinary Text and scale without limit.
  const fs = Math.min(fontScale, 1.5);
  const AXIS = 11 * fs;

  const L = useMemo(() => {
    if (!W) return null;
    const stacked = type === 'stack';
    const totals = labels.map((_, i) => series.reduce((s, sr) => s + (sr.values[i] ?? 0), 0));
    const flat = series.flatMap((s) => s.values);
    const max = stacked ? Math.max(...totals) : Math.max(...flat);
    // Bars encode magnitude by length, so they are anchored at zero. A line encodes change, and
    // forcing it to zero flattens the thing the reader came for (web DigestChart, same reasoning).
    const min = type === 'line' ? Math.min(...flat) : Math.min(0, ...flat);
    const t = ticks(min, max);
    const lo = t[0];
    const hi = t[t.length - 1];

    const left = Math.max(28, Math.ceil(Math.max(...t.map((v) => textW(fmt(v, unit, true, dp), AXIS)))) + 8);
    const right = 6;
    const plotW = W - left - right;
    const band = plotW / labels.length;
    const plotH = Math.round(Math.min(240, Math.max(160, W * 0.52)));
    const padTop = Math.ceil(14 * fs);

    // Every bar label must be readable in at most two lines, or the chart turns sideways.
    let horizontal = false;
    let wrapped: (string[] | null)[] = [];
    if (type === 'line') {
      const slot = labels.length > 1 ? plotW / (labels.length - 1) : plotW;
      for (let stride = 1; stride <= labels.length; stride++) {
        const shown = labels.map((l, i) => (i % stride === 0 || i === labels.length - 1 ? String(l) : null));
        wrapped = shown.map((l) => (l === null ? null : wrapLabel(l, slot * stride - 8, AXIS, 2)));
        if (wrapped.every((w, i) => shown[i] === null || w !== null)) break;
      }
      // Nothing fit even at the widest stride: show just the ends rather than overprint.
      if (wrapped.some((w, i) => w === null && (i === 0 || i === labels.length - 1))) {
        wrapped = labels.map((l, i) => (i === 0 || i === labels.length - 1 ? [String(l)] : null));
      }
    } else {
      wrapped = labels.map((l) => wrapLabel(String(l), band - 4, AXIS, 2));
      horizontal = wrapped.some((w) => w === null);
    }
    const lineCount = Math.max(1, ...wrapped.map((w) => w?.length ?? 1));
    const bottom = Math.ceil(10 + lineCount * AXIS * 1.25);
    const H = padTop + plotH + bottom;

    const y = (v: number) => padTop + plotH - ((v - lo) / (hi - lo || 1)) * plotH;
    const x = (i: number) =>
      type === 'line'
        ? left + (labels.length === 1 ? plotW / 2 : (i / (labels.length - 1)) * plotW)
        : left + band * i + band / 2;
    return { t, lo, hi, y, x, band, totals, zero: y(Math.max(lo, 0)), left, right, plotW, plotH, padTop, H, wrapped, horizontal };
  }, [W, type, labels, series, unit, dp, AXIS, fs]);

  // Draw on once the frame exists. Reduced Motion gets the finished chart on the first frame.
  useEffect(() => {
    if (!L) return;
    progress.set(reduced ? 1 : withTiming(1, { duration: DRAW_MS, easing: Easing.out(Easing.cubic) }));
  }, [L, reduced, progress]);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (w && w !== W) setW(w);
  };

  const ink = theme.mutedForeground;

  const onTap = (px: number) => {
    if (!L) return;
    const i =
      type === 'line'
        ? Math.round((px - L.left) / (labels.length > 1 ? L.plotW / (labels.length - 1) : L.plotW))
        : Math.floor((px - L.left) / L.band);
    const next = i >= 0 && i < labels.length ? i : null;
    setHover(next === hover ? null : next);
  };

  return (
    <View style={styles.figure}>
      <View style={[styles.panel, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <ThemedText type="smallBold" style={styles.title}>{spec.title}</ThemedText>
        {spec.note ? (
          <ThemedText type="small" style={[styles.note, { color: ink }]}>{spec.note}</ThemedText>
        ) : null}

        {multi ? (
          <View style={styles.legend}>
            {series.map((s, si) => (
              <View key={s.name} style={styles.legendItem}>
                <View style={[styles.swatch, { backgroundColor: colorOf(si) }]} />
                <ThemedText type="small" style={{ color: ink }}>{s.name}</ThemedText>
              </View>
            ))}
          </View>
        ) : null}

        <View onLayout={onLayout}>
          {!L ? (
            <View style={{ height: 180 }} />
          ) : L.horizontal ? (
            <HorizontalBars spec={spec} progress={progress} ink={ink} track={theme.muted} />
          ) : (
            <Pressable
              onPress={(e) => onTap(e.nativeEvent.locationX)}
              accessible
              accessibilityRole="image"
              accessibilityLabel={`${spec.title}. The figures are listed under Show the numbers.`}>
              <Svg width={W} height={L.H}>
                {L.t.map((tv) => (
                  <G key={tv}>
                    <Line x1={L.left} x2={W - L.right} y1={L.y(tv)} y2={L.y(tv)} stroke={theme.border} strokeWidth={1} />
                    <SvgText x={L.left - 6} y={L.y(tv) + AXIS * 0.35} textAnchor="end" fontSize={AXIS} fontFamily={Fonts.body} fill={ink}>
                      {fmt(tv, unit, true, dp)}
                    </SvgText>
                  </G>
                ))}

                {L.wrapped.map((lines, i) => {
                  if (!lines) return null;
                  // A centred label on the first or last point hangs off the frame, so those two
                  // anchor inward instead (web: "Day 50, paid in full" ended 45px outside).
                  const w = Math.max(...lines.map((ln) => textW(ln, AXIS)));
                  const cx = L.x(i);
                  const anchor = cx - w / 2 < 1 ? 'start' : cx + w / 2 > W - 1 ? 'end' : 'middle';
                  const tx = anchor === 'start' ? 1 : anchor === 'end' ? W - 1 : cx;
                  return lines.map((ln, j) => (
                    <SvgText
                      key={`${String(i)}-${String(j)}`}
                      x={tx}
                      y={L.padTop + L.plotH + 6 + AXIS * (j + 1) * 1.2}
                      textAnchor={anchor}
                      fontSize={AXIS}
                      fontFamily={Fonts.body}
                      fill={ink}>
                      {ln}
                    </SvgText>
                  ));
                })}

                {hover !== null && type === 'line' ? (
                  <Line x1={L.x(hover)} x2={L.x(hover)} y1={L.padTop} y2={L.padTop + L.plotH} stroke={theme.textSecondary} strokeOpacity={0.4} strokeWidth={1} />
                ) : null}

                {type === 'line' &&
                  series.map((s, si) => {
                    const pts = s.values.map((v, i) => [L.x(i), L.y(v)] as const);
                    const length = pts.reduce((n, p, i) => (i ? n + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0) || 1;
                    return (
                      <G key={s.name}>
                        <DrawLine points={pts.map((p) => `${String(p[0])},${String(p[1])}`).join(' ')} length={length} color={colorOf(si)} progress={progress} />
                        {hover !== null && s.values[hover] !== undefined ? (
                          <Circle cx={L.x(hover)} cy={L.y(s.values[hover])} r={4.5} fill={colorOf(si)} stroke={theme.card} strokeWidth={2} />
                        ) : null}
                      </G>
                    );
                  })}

                {type !== 'line' &&
                  labels.map((_, i) => {
                    const gap = 2;
                    const inner = L.band * 0.66;
                    const bw = type === 'stack' ? inner : (inner - gap * (series.length - 1)) / series.length;
                    let acc = 0;
                    const value = type === 'stack' ? L.totals[i] : (series[0].values[i] ?? 0);
                    const valueText = fmt(value, unit, false, dp);
                    const showValue = labels.length <= 8 && (type === 'stack' || !multi) && textW(valueText, AXIS * 1.05) <= L.band - 2;
                    return (
                      <G key={i} opacity={hover === null || hover === i ? 1 : 0.55}>
                        {series.map((s, si) => {
                          const v = s.values[i] ?? 0;
                          if (type === 'stack') {
                            const yTop = L.y(acc + v);
                            const yBot = L.y(acc);
                            acc += v;
                            return (
                              <GrowRect key={s.name} x={L.x(i) - inner / 2} y={yTop} width={inner} height={Math.max(0, yBot - yTop - gap)} zero={L.zero} rx={3} fill={colorOf(si)} progress={progress} />
                            );
                          }
                          const yTop = Math.min(L.y(v), L.zero);
                          return (
                            <GrowRect
                              key={s.name}
                              x={L.x(i) - inner / 2 + si * (bw + gap)}
                              y={yTop}
                              width={bw}
                              height={Math.max(1, Math.abs(L.zero - L.y(v)))}
                              zero={L.zero}
                              rx={4}
                              fill={colorOf(si)}
                              progress={progress}
                            />
                          );
                        })}
                        {showValue ? (
                          <SvgText
                            x={L.x(i)}
                            y={(value >= 0 ? L.y(value) : L.zero) - 6}
                            textAnchor="middle"
                            fontSize={AXIS * 1.05}
                            fontFamily={Fonts.bold}
                            fill={theme.text}>
                            {valueText}
                          </SvgText>
                        ) : null}
                      </G>
                    );
                  })}
              </Svg>

              {hover !== null ? (
                <View
                  pointerEvents="none"
                  style={[
                    styles.tip,
                    { backgroundColor: theme.cardElevated, borderColor: theme.border },
                    L.x(hover) > W / 2 ? { right: W - L.x(hover) + 8 } : { left: L.x(hover) + 8 },
                  ]}>
                  <ThemedText type="smallBold">{labels[hover]}</ThemedText>
                  {series.map((s, si) => (
                    <View key={s.name} style={styles.tipRow}>
                      <View style={[styles.swatchSm, { backgroundColor: colorOf(si) }]} />
                      {multi ? <ThemedText type="small" style={{ color: ink }}>{s.name}</ThemedText> : null}
                      <ThemedText type="smallBold">{fmt(s.values[hover] ?? 0, unit, false, dp)}</ThemedText>
                    </View>
                  ))}
                </View>
              ) : null}
            </Pressable>
          )}
        </View>

        <Pressable
          onPress={() => setShowTable((v) => !v)}
          accessibilityRole="button"
          accessibilityState={{ expanded: showTable }}
          style={styles.toggle}>
          <ThemedText type="small" style={{ color: ink }}>{showTable ? 'Hide the numbers' : 'Show the numbers'}</ThemedText>
          <UIcon name={showTable ? 'chevronUp' : 'chevronDown'} size={14} color={ink} />
        </Pressable>

        {showTable ? (
          <View accessibilityLabel={`${spec.title}, table`}>
            <View style={[styles.tr, { borderColor: 'transparent' }]}>
              <ThemedText type="smallBold" style={[styles.th, { color: ink }]}>Period</ThemedText>
              {series.map((s) => (
                <ThemedText key={s.name} type="smallBold" style={[styles.td, { color: ink }]}>{s.name}</ThemedText>
              ))}
            </View>
            {labels.map((l, i) => (
              <View key={`${l}-${String(i)}`} style={[styles.tr, { borderColor: theme.border }]}>
                <ThemedText type="small" style={[styles.th, { color: ink }]}>{l}</ThemedText>
                {series.map((s) => (
                  <ThemedText key={s.name} type="small" style={[styles.td, { color: theme.textSecondary }]}>
                    {fmt(s.values[i] ?? 0, unit, false, dp)}
                  </ThemedText>
                ))}
              </View>
            ))}
          </View>
        ) : null}
      </View>

      {spec.source ? (
        <ThemedText type="small" style={[styles.source, { color: ink }]}>
          Source:{' '}
          {spec.sourceUrl ? (
            <ThemedText
              type="small"
              accessibilityRole="link"
              onPress={() => openLink(spec.sourceUrl ?? '')}
              style={{ color: ink, textDecorationLine: 'underline' }}>
              {spec.source}
            </ThemedText>
          ) : (
            spec.source
          )}
        </ThemedText>
      ) : null}
    </View>
  );
}

/**
 * The sideways layout for bar charts whose category names cannot fit under a phone-width column.
 * Every bar shares one track width and one zero point, so lengths stay comparable across rows;
 * values sit in a reserved column past the longest bar so no bar is shortened to make room.
 */
function HorizontalBars({ spec, progress, ink, track }: { spec: ChartSpec; progress: SharedValue<number>; ink: string; track: string }) {
  const [trackW, setTrackW] = useState(0);
  const { fontScale } = useWindowDimensions();
  const { type, labels, series, unit, decimals: dp } = spec;
  const stacked = type === 'stack';
  const multi = series.length > 1;

  const totals = labels.map((_, i) => series.reduce((s, sr) => s + (sr.values[i] ?? 0), 0));
  const flat = series.flatMap((s) => s.values);
  const hi = Math.max(0, ...(stacked ? totals : flat));
  const lo = Math.min(0, ...(stacked ? [0] : flat));
  // Values print for single-series and stacked charts, as on the web; grouped values are in the table.
  const valueOf = (i: number) => (stacked ? totals[i] : series[0].values[i] ?? 0);
  const printValues = stacked || !multi;
  const reserve = printValues
    ? Math.ceil(Math.max(...labels.map((_, i) => textW(fmt(valueOf(i), unit, false, dp), FontSize.small * fontScale)))) + Spacing.two
    : 0;
  const span = hi - lo || 1;
  const usable = Math.max(0, trackW - reserve);
  const px = (v: number) => (v / span) * usable;
  const zeroX = px(-lo);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${spec.title}. The figures are listed under Show the numbers.`}
      onLayout={(e) => setTrackW(Math.round(e.nativeEvent.layout.width))}
      style={styles.hList}>
      {trackW
        ? labels.map((l, i) => {
            let acc = 0;
            const barH = multi && !stacked ? 8 : 14;
            return (
              <View key={`${l}-${String(i)}`}>
                <ThemedText type="small" style={{ color: ink }}>{l}</ThemedText>
                {(stacked ? [series] : multi ? series.map((s) => [s]) : [series]).map((group, gi) => (
                  <View key={gi} style={[styles.hRow, { height: barH }]}>
                    <View style={[StyleSheet.absoluteFill, { right: reserve, borderRadius: Radius.hairline, backgroundColor: track }]} />
                    {group.map((s) => {
                      const si = series.indexOf(s);
                      const v = s.values[i] ?? 0;
                      if (stacked) {
                        const left = zeroX + px(acc);
                        acc += v;
                        return <GrowBar key={s.name} left={left} width={Math.max(0, px(v) - 2)} color={colorOf(si)} progress={progress} radius={Radius.hairline} />;
                      }
                      const left = v >= 0 ? zeroX : zeroX - px(-v);
                      return <GrowBar key={s.name} left={left} width={Math.max(1, px(Math.abs(v)))} color={colorOf(si)} progress={progress} radius={Radius.hairline} />;
                    })}
                    {printValues && gi === 0 ? (
                      // Centred on the bar by a band taller than any Dynamic Type line, so the
                      // text is never clipped to the bar's own 14pt height.
                      <View pointerEvents="none" style={[styles.hValue, { left: zeroX + px(Math.max(0, valueOf(i))) + Spacing.one }]}>
                        <ThemedText type="smallBold">{fmt(valueOf(i), unit, false, dp)}</ThemedText>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            );
          })
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  figure: { marginTop: Spacing.four },
  panel: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.lg, padding: Spacing.three },
  title: { fontSize: FontSize.smallPlus, lineHeight: 19 },
  note: { marginTop: 2 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: Spacing.three, rowGap: Spacing.one, marginTop: Spacing.two },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 10, height: 10, borderRadius: Radius.hairline },
  swatchSm: { width: 8, height: 8, borderRadius: Radius.hairline },
  tip: {
    position: 'absolute',
    top: 0,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.two,
    gap: 2,
  },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  // 44pt tall: the one control inside the figure is a real touch target (CONSTITUTION §5.10).
  toggle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, minHeight: 44, alignSelf: 'flex-start' },
  tr: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two, paddingVertical: 6, borderTopWidth: StyleSheet.hairlineWidth },
  th: { flex: 1.4 },
  td: { flex: 1, textAlign: 'right' },
  source: { marginTop: Spacing.two },
  hList: { marginTop: Spacing.three, gap: Spacing.two + 2 },
  hRow: { marginTop: 4, justifyContent: 'center' },
  hValue: { position: 'absolute', top: -30, bottom: -30, justifyContent: 'center' },
});
