/**
 * Renders an `AnimatedVisual` — the charts the curriculum authors alongside its prose.
 *
 * WHY THIS EXISTS. The canonical curriculum carries AnimatedVisual objects throughout its hooks,
 * teaching slides and stakes cards. Until this component, the app read none of them:
 * `AnimatedVisual` appeared only in the data layer, in zero components and zero screens. Every one
 * rendered as nothing on device while the same lesson on the web showed the chart. The exhaustive
 * counts now live in `scripts/lesson-render-audit.mjs`, where they are checked against the exact
 * runtime course loaders instead of being copied into a comment that can drift.
 *
 * The canonical website corpus currently uses nine kinds. `pictograph` is an isotype chart whose
 * repeated pixel marks are the magnitude, so it must be rendered rather than flattened to prose.
 * `pixel` remains unused in the canonical lesson corpus.
 *
 * Every kind is plain data — labels, numbers, percents and authored hex colours — so most are
 * laid out with ordinary views. Pie and line use SVG: the pie uses stroke-dash arithmetic rather
 * than fragile arc paths, and the line plots the same parsed authored values as the website.
 *
 * AUTHORED COLOURS WIN. Where a segment carries its own `color` it is used; where it does not, the
 * theme supplies one. `sentiment` tints the accent, so a chart about a loss does not read green.
 *
 * Line values use the website's exact parsing contract (`$174K`, `-38.5%`, `$3 trillion`, etc.).
 * Parseable values drive a linear min/max scale; unparseable values use only the authored trend.
 * That keeps native and web honest in the same way and prevents a decorative curve from inventing
 * a relationship absent from the lesson data.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutDown,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Polygon, Polyline, Text as SvgText } from 'react-native-svg';

import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { AnimatedVisual } from '@/lib/curriculum';
import { buildFlowMotionPlan, buildMetricMotionPlan, type FlowNodeMotion } from '@/lib/lesson-visual-motion';
import { chartLabel, visualRows } from '@/lib/lesson-steps';
import { getSprite, PixelSpriteView } from '@/lib/pixel';
import { SpringPressable } from '@/shared/motion/spring-pressable';

type Sentiment = 'positive' | 'negative' | undefined;

const clampPercent = (n: unknown) => Math.max(0, Math.min(100, Number(n) || 0));
const LINE_DRAW_MS = 900;
const FLOW_ORCHID = '#B862ED';
const HEADER_SPRITE_TYPES = new Set(['bars', 'pie', 'flow', 'comparison', 'stack', 'grid', 'line']);
const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

/** Draw the authored line from start to finish, matching the canonical pathLength animation. */
function DrawnPolyline({ points, length, color }: { points: string; length: number; color: string }) {
  const reduced = useReducedMotion();
  const offset = useSharedValue(reduced ? 0 : length);

  useEffect(() => {
    offset.set(reduced ? 0 : withTiming(0, { duration: LINE_DRAW_MS }));
  }, [length, offset, reduced]);

  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: offset.get() }));
  return (
    <AnimatedPolyline
      animatedProps={animatedProps}
      points={points}
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={[length, length]}
    />
  );
}

/**
 * Web AnimatedVisuals grows authored bars from zero over 550ms and staggers siblings by 80ms.
 * Keeping that timing here prevents the same chart from feeling alive on web and static on iOS.
 * Width, rather than scale, is animated so the bar stays pinned to its leading edge.
 */
function AnimatedFill({ percent, color, delay = 0 }: { percent: number; color: string; delay?: number }) {
  const reduced = useReducedMotion();
  // Worklets run on the UI runtime and cannot call an ordinary module function. Resolve the
  // authored value on the JS thread once, then capture only the primitive number below.
  const target = clampPercent(percent);
  const progress = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    progress.set(reduced ? 1 : withDelay(delay, withTiming(1, { duration: 550 })));
  }, [delay, progress, reduced]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${target * progress.get()}%` as `${number}%`,
  }));

  return <Animated.View style={[styles.fill, { backgroundColor: color }, animatedStyle]} />;
}

function VisualSprite({ id, size = 24, scale }: { id?: string; size?: number; scale?: number }) {
  const sprite = id ? getSprite(id) : undefined;
  if (!sprite) return null;
  return (
    <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <PixelSpriteView sprite={sprite} {...(scale === undefined ? { size } : { scale })} />
    </View>
  );
}

function VisualFadeUp({
  delay,
  duration,
  translateY,
  children,
}: {
  delay: number;
  duration: number;
  translateY: number;
  children: ReactNode;
}) {
  return (
    <Animated.View
      entering={duration === 0
        ? FadeIn.duration(0)
        : FadeInDown.delay(delay).duration(duration).withInitialValues({ opacity: 0, transform: [{ translateY }] })}>
      {children}
    </Animated.View>
  );
}

/** Production 49e stages each decorative chart mark above its title with the shared fade-up. */
function VisualHeaderMark({ id, delay = 0, scale }: { id?: string; delay?: number; scale?: number }) {
  const reduced = useReducedMotion();
  const sprite = id ? getSprite(id) : undefined;
  if (!sprite) return null;
  return (
    <Animated.View
      entering={reduced
        ? FadeIn.duration(0)
        : FadeInDown.delay(delay).duration(350).withInitialValues({ opacity: 0, transform: [{ translateY: 10 }] })}
      style={styles.visualHeader}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <PixelSpriteView sprite={sprite} {...(scale === undefined ? { size: 38 } : { scale })} />
    </Animated.View>
  );
}

/** Keyed per selection so Atlas exits and re-enters instead of replacing prose in place. */
function VisualAtlasExplanation({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const entering = reduced ? FadeIn.duration(0) : FadeInDown
    .springify().stiffness(400).damping(28).mass(1)
    .withInitialValues({ opacity: 0, transform: [{ translateY: 8 }] });
  const exiting = reduced ? FadeOut.duration(0) : FadeOutDown
    .springify().stiffness(400).damping(28).mass(1)
    .withTargetValues({ opacity: 0, transform: [{ translateY: 4 }] });

  return (
    <Animated.View
      entering={entering}
      exiting={exiting}
      collapsable={false}
      style={styles.atlasExplanation}>
      <Atlas size={44} expression="happy" interactive={false} />
      <View style={styles.explain}>
        <View style={styles.explainTail} accessible={false} />
        <ThemedText type="small" themeColor="textSecondary">{text}</ThemedText>
      </View>
    </Animated.View>
  );
}

/** Production's flow rail carries one lit signal down the chain and rings at its destination. */
function AnimatedFlowRail({
  accent,
  last,
  motion,
}: {
  accent: string;
  last: boolean;
  motion: FlowNodeMotion;
}) {
  const dot = useSharedValue(motion.dotDuration === 0 ? 1 : 0.35);
  const connector = useSharedValue(motion.connectorDuration === 0 ? 1 : 0);
  const ring = useSharedValue(0);

  useEffect(() => {
    dot.set(motion.dotDuration === 0
      ? 1
      : withDelay(motion.signalDelay, withTiming(1, {
        duration: motion.dotDuration,
        easing: Easing.out(Easing.cubic),
      })));
    connector.set(motion.connectorDuration === 0
      ? 1
      : withDelay(motion.signalDelay, withTiming(1, {
        duration: motion.connectorDuration,
        easing: Easing.out(Easing.cubic),
      })));
    ring.set(motion.ringDuration === 0
      ? 0
      : withDelay(motion.signalDelay, withTiming(1, {
        duration: motion.ringDuration,
        easing: Easing.out(Easing.cubic),
      })));
  }, [connector, dot, motion.connectorDuration, motion.dotDuration, motion.ringDuration, motion.signalDelay, ring]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: dot.get() }));
  const connectorStyle = useAnimatedStyle(() => ({
    height: `${connector.get() * 100}%` as `${number}%`,
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ring.get(), [0, 0.001, 1], [0, 0.85, 0]),
    transform: [{ scale: interpolate(ring.get(), [0, 1], [1, 2.6]) }],
  }));

  return (
    <View style={styles.flowRail} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={[styles.flowDotWrap, last && styles.flowDotWrapLast]}>
        {last && motion.ringDuration > 0 ? (
          <Animated.View style={[styles.flowArrivalRing, { borderColor: accent }, ringStyle]} />
        ) : null}
        <Animated.View
          style={[
            styles.flowDot,
            last && styles.flowDotLast,
            { backgroundColor: last ? accent : 'rgba(255,255,255,0.28)' },
            dotStyle,
          ]}
        />
      </View>
      {!last ? (
        <View style={styles.flowConnector}>
          <Animated.View style={[styles.flowSignal, connectorStyle]}>
            <LinearGradient colors={[accent, accent + '44']} style={StyleSheet.absoluteFill} />
          </Animated.View>
        </View>
      ) : null}
    </View>
  );
}

/** Mirrors the canonical web chart parser in AnimatedVisuals.tsx. */
function parseVisualNumber(raw: string | number | undefined): number | null {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  if (!raw) return null;
  const match = String(raw).toLowerCase().replace(/−/g, '-').replace(/[,$\s+]/g, '').match(/^(-?\d+(?:\.\d+)?)(k|m|b|t|%)?/);
  if (!match) return null;
  let value = Number.parseFloat(match[1]);
  if (!Number.isFinite(value)) return null;
  if (match[2] === 'k') value *= 1e3;
  if (match[2] === 'm') value *= 1e6;
  if (match[2] === 'b') value *= 1e9;
  if (match[2] === 't') value *= 1e12;
  return value;
}

export function LessonVisual({ visual, bare = false, chartMaxHeight }: {
  visual: AnimatedVisual;
  bare?: boolean;
  /**
   * Ceiling for the CHART, not for the whole visual.
   *
   * A caller with two of these on one screen (stakes-card) has to cap them. Capping the container
   * that also holds Atlas's tapped explanation does not shorten that explanation, it just makes it
   * overflow: RN leaves overflow visible on iOS, so the bubble painted straight over the panel
   * label underneath it. The explanation is deliberately OUTSIDE this cap and reflows the panel.
   */
  chartMaxHeight?: number;
}) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const v = visual as AnimatedVisual & Record<string, any>;
  const [openRow, setOpenRow] = useState<number | null>(null);
  const sentiment: Sentiment = v.sentiment;
  const accent = sentiment === 'negative' ? theme.destructive : sentiment === 'positive' ? theme.success : theme.iconLilac;

  const rows = visualRows(visual);
  const interactive = rows.some((row) => typeof row?.explain === 'string' && row.explain.trim().length > 0);
  const selected = openRow === null ? null : rows[openRow] ?? null;
  const flowMotion = v.type === 'flow'
    ? buildFlowMotionPlan((v.nodes ?? []).length, Boolean(v.sprite), reduced)
    : null;

  const toggle = (index: number) => {
    const row = rows[index];
    if (!row?.explain) return;
    setOpenRow((current) => current === index ? null : index);
  };

  const pressable = (row: any, index: number, content: ReactNode) => {
    if (!row?.explain) return content;
    const value = row.displayValue ?? row.value ?? (typeof row.percent === 'number' ? `${String(row.percent)}%` : '');
    return (
      <SpringPressable
        key={index}
        haptic={false}
        hitSlop={v.type === 'comparison' ? 8 : undefined}
        style={v.type === 'grid'
          ? styles.gridPressable
          : v.type === 'bars'
            ? styles.barPressable
            : v.type === 'flow'
              ? styles.flowPressable
              : undefined}
        onPress={() => toggle(index)}
        accessibilityRole="button"
        accessibilityLabel={[row.label, value].filter(Boolean).join('. ')}
        accessibilityHint="Shows Atlas's explanation for this item."
        accessibilityState={{ expanded: openRow === index }}>
        {content}
      </SpringPressable>
    );
  };

  const Bar = ({ percent, color, delay = 0, horizontal = false }: { percent: number; color: string; delay?: number; horizontal?: boolean }) => (
    <View style={[styles.track, horizontal && styles.barTrack, { backgroundColor: theme.primary + '1F' }]}>
      <AnimatedFill percent={percent} color={color} delay={delay} />
    </View>
  );

  const body = (() => {
    switch (v.type) {
      case 'metric':
        {
          const motion = buildMetricMotionPlan(Boolean(v.sprite), reduced);
        return (
          <View style={styles.metric}>
            <VisualFadeUp delay={motion.titleDelay} duration={motion.duration} translateY={motion.translateY}>
              <ThemedText style={styles.metricTitle}>{v.title}</ThemedText>
            </VisualFadeUp>
            {v.sprite && motion.spriteDelay !== null ? (
              <VisualFadeUp delay={motion.spriteDelay} duration={motion.duration} translateY={motion.translateY}>
                <View style={styles.metricSprite}><VisualSprite id={v.sprite} scale={4} /></View>
              </VisualFadeUp>
            ) : null}
            <VisualFadeUp delay={motion.valueDelay} duration={motion.duration} translateY={motion.translateY}>
              <ThemedText type="display" style={[styles.metricValue, { color: accent }]}>{v.value}</ThemedText>
            </VisualFadeUp>
            {v.detail ? (
              <VisualFadeUp delay={motion.detailDelay} duration={motion.duration} translateY={motion.translateY}>
                <ThemedText style={styles.metricDetail}>{v.detail}</ThemedText>
              </VisualFadeUp>
            ) : null}
          </View>
        );
        }

      case 'bars': {
        // `value` is a relative number on the author's own scale; `displayValue` is the label they
        // wrote for it. Normalise against the largest so the longest bar fills the track.
        const items: any[] = v.items ?? [];
        const max = Math.max(1, ...items.map((i) => Number(i.value) || 0));
        const hasSprites = items.some((item) => Boolean(item.sprite));
        return (
          <View style={styles.barList}>
            {items.map((i, n) => pressable(i, n,
              <Animated.View entering={FadeInDown.delay(n * 70).duration(350)} key={n} style={[styles.barRow, i.explain && openRow === n ? { backgroundColor: theme.primary + '1F' } : null]}>
                {hasSprites ? <View style={styles.barSprite}><VisualSprite id={i.sprite} size={20} /></View> : null}
                <ThemedText type="small" numberOfLines={2} style={styles.barLabel}>{i.label}</ThemedText>
                <Bar percent={((Number(i.value) || 0) / max) * 100} color={accent} delay={n * 80} horizontal />
                <ThemedText type="smallBold" numberOfLines={1} style={[styles.barValue, { color: accent }]}>{i.displayValue ?? String(i.value)}</ThemedText>
              </Animated.View>
            ))}
          </View>
        );
      }

      case 'comparison': {
        const rows: any[] = v.rows ?? [];
        return (
          <View style={styles.comparisonRows}>
            {rows.map((r, n) => pressable(r, n,
              <Animated.View entering={FadeInDown.delay(n * 70).duration(350)} key={n} style={[styles.comparisonRow, r.explain && openRow === n ? { backgroundColor: theme.primary + '1F' } : null]}>
                <View style={styles.comparisonBetween}>
                  <ThemedText type="small" style={styles.comparisonLabel}>{r.label}</ThemedText>
                  <ThemedText type="smallBold" style={styles.comparisonValue}>{r.value}</ThemedText>
                </View>
                {typeof r.percent === 'number' ? <Bar percent={r.percent} color={accent} delay={n * 80} /> : null}
              </Animated.View>
            ))}
          </View>
        );
      }

      case 'stack': {
        const segs: any[] = v.segments ?? [];
        return (
          <View style={{ gap: Spacing.two }}>
            {v.total ? <ThemedText type="display" style={{ fontSize: FontSize.displaySm, color: accent }}>{v.total}</ThemedText> : null}
            <View style={[styles.track, { backgroundColor: theme.primary + '1F', flexDirection: 'row' }]}>
              {segs.map((s, n) => (
                <AnimatedFill key={n} percent={s.percent} color={s.color ?? accent} delay={n * 80} />
              ))}
            </View>
            <View style={styles.legend}>
              {segs.map((s, n) => pressable(s, n,
                <View key={n} style={[styles.legendItem, styles.chartRow, s.explain && openRow === n ? { backgroundColor: theme.primary + '1F' } : null]}>
                  <View style={[styles.swatch, { backgroundColor: s.color ?? accent }]} />
                  <ThemedText type="small" themeColor="mutedForeground">{s.label}{s.value ? ` · ${s.value}` : ''}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        );
      }

      case 'pie': {
        const segs: any[] = v.segments ?? [];
        const R = 34, SW = 14, C = 2 * Math.PI * R, SIZE = (R + SW) * 2;
        const lens = segs.map((s) => (clampPercent(s.percent) / 100) * C);
        /*
         * PREFIX SUMS, NOT A RUNNING ACCUMULATOR. This was `let acc = 0` mutated inside the map
         * body, which React Compiler flags as react-hooks/immutability: mutation during render is
         * precisely what defeats memoisation, and the compiler bails out of the WHOLE component
         * when it sees one -- so the cost is not the loop, it is every optimisation in this file.
         * Output is identical: offs[n] is the sum of every length before n, which is what the
         * accumulator held when segment n was drawn.
         * ponytail: O(n^2), and n is the number of pie segments -- 2 to 6 across this curriculum.
         */
        const offs = lens.map((_, i) => lens.slice(0, i).reduce((a, b) => a + b, 0));
        return (
          <Animated.View entering={FadeIn.duration(500)} style={styles.pieRow}>
            {/* Decorative: every number in it is already in the Card's own label. */}
            <Svg width={SIZE} height={SIZE} accessible={false}>
              {segs.map((s, n) => (
                // stroke-dash arithmetic rather than arc paths: an offset cannot draw a bad wedge
                <Circle
                  key={n}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={R}
                  fill="none"
                  stroke={s.color ?? accent}
                  strokeWidth={SW}
                  strokeDasharray={`${lens[n]} ${C - lens[n]}`}
                  strokeDashoffset={-offs[n]}
                  // start at twelve o'clock instead of three
                  transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                />
              ))}
            </Svg>
            <View style={{ flex: 1, gap: 6 }}>
              {v.centerLabel ? <ThemedText type="smallBold" style={{ color: accent }}>{v.centerLabel}</ThemedText> : null}
              {segs.map((s, n) => pressable(s, n,
                <View key={n} style={[styles.legendItem, styles.chartRow, s.explain && openRow === n ? { backgroundColor: theme.primary + '1F' } : null]}>
                  <View style={[styles.swatch, { backgroundColor: s.color ?? accent }]} />
                  <ThemedText type="small" themeColor="mutedForeground">{s.label} · {clampPercent(s.percent)}%</ThemedText>
                </View>
              ))}
            </View>
          </Animated.View>
        );
      }

      case 'grid': {
        const items: any[] = v.items ?? [];
        return (
          <View style={styles.grid}>
            {items.map((i, n) => pressable(i, n,
              <Animated.View entering={FadeInDown.delay(n * 70).duration(350)} key={n} style={[styles.gridCell, !i.explain && styles.gridPressable, {
                backgroundColor: i.explain && openRow === n ? theme.primary + '1F' : theme.primary + '14',
                borderColor: (i.color ?? accent) + '3D',
              }]}>
                <VisualSprite id={i.sprite} size={28} />
                {i.value ? <ThemedText type="smallBold" style={{ color: i.color ?? accent }}>{i.value}</ThemedText> : null}
                <ThemedText type="small" themeColor="mutedForeground">{i.label}</ThemedText>
              </Animated.View>
            ))}
          </View>
        );
      }

      case 'flow': {
        const nodes: any[] = v.nodes ?? [];
        if (!flowMotion) return null;
        return (
          <View>
            {nodes.map((nd, n) => {
              const last = n === nodes.length - 1;
              const nodeAccent = nd.color ?? FLOW_ORCHID;
              const nodeMotion = flowMotion.nodes[n];
              return (
                <Animated.View
                  entering={flowMotion.duration === 0
                    ? FadeIn.duration(0)
                    : FadeInDown
                      .delay(nodeMotion.entranceDelay)
                      .duration(flowMotion.duration)
                      .withInitialValues({ opacity: 0, transform: [{ translateY: flowMotion.translateY }] })}
                  key={n}
                  style={styles.flowRow}>
                  <AnimatedFlowRail accent={nodeAccent} last={last} motion={nodeMotion} />
                  {pressable(nd, n,
                    <View key={n} style={[styles.flowContent, last && styles.flowContentLast, nd.explain && openRow === n ? { backgroundColor: theme.primary + '1F' } : null]}>
                      <VisualSprite id={nd.sprite} scale={1.5} />
                      <ThemedText type="small" style={[styles.flowLabel, last && { color: nodeAccent }]}>{nd.label}</ThemedText>
                      {nd.value ? <ThemedText type="smallBold" style={[styles.flowValue, { color: last ? nodeAccent : theme.mutedForeground }]}>{nd.value}</ThemedText> : null}
                    </View>)}
                </Animated.View>
              );
            })}
          </View>
        );
      }

      case 'line': {
        const points: any[] = v.points ?? [];
        const width = 300;
        const height = 110;
        const pad = { left: 8, right: 8, top: 18, bottom: 6 };
        const numbers = points.map((point) => parseVisualNumber(point.value));
        const honest = numbers.every((number) => number !== null) && new Set(numbers).size > 1;
        const count = points.length;
        const x = (index: number) => pad.left + (index / Math.max(count - 1, 1)) * (width - pad.left - pad.right);
        let y: (index: number) => number;
        if (honest) {
          const values = numbers as number[];
          const low = Math.min(...values);
          const high = Math.max(...values);
          y = (index) => pad.top + (1 - (values[index] - low) / (high - low)) * (height - pad.top - pad.bottom);
        } else {
          y = (index) => v.trend === 'up'
            ? pad.top + (1 - index / Math.max(count - 1, 1)) * (height - pad.top - pad.bottom)
            : pad.top + (index / Math.max(count - 1, 1)) * (height - pad.top - pad.bottom);
        }
        const coordinates = points.map((_, index) => `${String(x(index))},${String(y(index))}`).join(' ');
        const lineLength = Math.max(1, points.slice(1).reduce((total, _, index) => {
          const dx = x(index + 1) - x(index);
          const dy = y(index + 1) - y(index);
          return total + Math.sqrt(dx * dx + dy * dy);
        }, 0));
        const area = `${String(pad.left)},${String(height)} ${coordinates} ${String(width - pad.right)},${String(height)}`;
        const spacing = (width - pad.left - pad.right) / Math.max(count - 1, 1);
        const longestValue = Math.max(1, ...points.map((point) => String(point.value).length));
        const valueFontSize = Math.max(7, Math.min(10, (spacing - 3) / (longestValue * 0.56)));
        const staggerLabels = spacing < longestValue * valueFontSize * 0.62;
        return (
          <View style={{ gap: Spacing.two }}>
            <View>
            <Svg width="100%" height={height} viewBox={`0 0 ${String(width)} ${String(height)}`} accessible={false}>
              <Polygon points={area} fill={accent + '24'} />
              <DrawnPolyline points={coordinates} length={lineLength} color={accent} />
              {points.map((point, index) => (
                <Circle
                  key={`point-${String(index)}`}
                  cx={x(index)}
                  cy={y(index)}
                  r={openRow === index ? 6 : index === count - 1 ? 4.2 : 3.2}
                  fill={openRow === index ? accent : theme.card}
                  stroke={accent}
                  strokeWidth={index === count - 1 ? 2.6 : 2}
                  opacity={openRow === null || openRow === index ? 1 : 0.4}
                />
              ))}
              {points.map((point, index) => (
                <SvgText
                  key={`value-${String(index)}`}
                  x={x(index)}
                  y={y(index) - 9 - (staggerLabels && index % 2 === 1 ? valueFontSize + 2 : 0)}
                  textAnchor={index === 0 ? 'start' : index === count - 1 ? 'end' : 'middle'}
                  fontSize={valueFontSize}
                  fontWeight="700"
                  fill={theme.text}>
                  {String(point.value)}
                </SvgText>
              ))}
            </Svg>
            </View>
            <View style={styles.lineLabels}>
              {points.map((point, index) => point.explain ? (
                <SpringPressable
                  key={index}
                  haptic={false}
                  style={styles.lineLabel}
                  onPress={() => toggle(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`${String(point.label)}. ${String(point.value)}`}
                  accessibilityHint="Shows Atlas's explanation for this point."
                  accessibilityState={{ expanded: openRow === index }}>
                  <ThemedText type="small" numberOfLines={2} style={{ fontSize: 10, lineHeight: 13, textAlign: 'center', color: openRow === index ? theme.text : theme.mutedForeground }}>
                    {point.label}
                  </ThemedText>
                </SpringPressable>
              ) : (
                <View key={index} style={styles.lineLabel}>
                  <ThemedText type="small" numberOfLines={2} themeColor="mutedForeground" style={{ fontSize: 10, lineHeight: 13, textAlign: 'center' }}>{point.label}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        );
      }

      case 'pictograph': {
        const sprite = getSprite(v.sprite);
        const rows: any[] = v.rows ?? [];
        if (!sprite || !(v.unitValue > 0)) return null;
        const markSize = 18;
        const maxMarks = 60;

        return (
          <View style={{ gap: Spacing.three }}>
            <View style={styles.unitKey} accessible accessibilityRole="text" accessibilityLabel={`Each mark represents ${String(v.unitLabel)}`}>
              <PixelSpriteView sprite={sprite} size={markSize} />
              <ThemedText type="small" themeColor="mutedForeground">= {v.unitLabel}</ThemedText>
            </View>
            {rows.map((row, index) => {
              const rawValue = Number.isFinite(row.value) ? Math.max(0, row.value) : 0;
              const count = rawValue / v.unitValue;
              const full = Math.floor(count);
              const fraction = count - full;
              const drawn = Math.min(full, maxMarks);
              const hidden = full - drawn;
              const opened = openRow === index;
              const header = (
                <View style={[styles.rowBetween, row.explain ? styles.pictographHeader : null]}>
                  <ThemedText type="small" themeColor="mutedForeground" style={{ flex: 1 }}>{row.label}</ThemedText>
                  <ThemedText type="smallBold">{row.displayValue ?? String(row.value)}</ThemedText>
                </View>
              );

              return (
                <View key={`${String(index)}-${String(row.label)}`} style={{ gap: 6 }}>
                  {row.explain ? (
                    <SpringPressable
                      haptic={false}
                      onPress={() => toggle(index)}
                      accessibilityRole="button"
                      accessibilityLabel={`${String(row.label)}. ${String(row.displayValue ?? row.value)}.`}
                      accessibilityHint="Shows the explanation for this row."
                      accessibilityState={{ expanded: opened }}>
                      {header}
                    </SpringPressable>
                  ) : header}
                  <View
                    style={styles.marks}
                    accessible={false}
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants">
                    {Array.from({ length: drawn }, (_, mark) => (
                      <PixelSpriteView key={mark} sprite={sprite} size={markSize} />
                    ))}
                    {hidden === 0 && fraction > 0.02 ? (
                      <View style={{ width: markSize * fraction, height: markSize, overflow: 'hidden' }}>
                        <PixelSpriteView sprite={sprite} size={markSize} />
                      </View>
                    ) : null}
                    {hidden > 0 ? (
                      <ThemedText type="small" themeColor="mutedForeground">+{hidden} more</ThemedText>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        );
      }

      default:
        // Defence in depth only. The REAL gate is upstream: `vis()` in lib/lesson-steps.ts asks
        // visualIsRenderable() before it ever emits a visual block, so an unrenderable kind or an
        // empty payload keeps the step's prose and is COUNTED by scripts/lesson-render-audit.mjs
        // rather than silently swallowing the card here. Reaching this line at all means the two
        // have drifted apart, and RENDERABLE_VISUAL_KINDS there is the list to reconcile against.
        return null;
    }
  })();

  if (!body) return null;

  /*
   * ONE STOP, ONE SENTENCE. `accessible` on the Card merges its descendants into a single VoiceOver
   * element, which is the fix rather than a nicety: a chart carries its meaning in bar LENGTH,
   * segment WIDTH, wedges and colour, so unmerged it reads as a scatter of fragments in layout
   * order — a title, a label, a number, another label — with nothing saying what is being compared.
   * `image` is the role because that is what this is: a graphic with a description.
   */
  const chart = (
    <>
      {HEADER_SPRITE_TYPES.has(v.type)
        ? v.type === 'flow'
          ? <VisualHeaderMark id={v.sprite} delay={flowMotion?.headerDelay} scale={2.4} />
          : <VisualHeaderMark id={v.sprite} />
        : null}
      {v.title && v.type === 'flow' && flowMotion ? (
        <VisualFadeUp delay={flowMotion.titleDelay} duration={flowMotion.duration} translateY={flowMotion.translateY}>
          <ThemedText type="smallBold" style={styles.flowHeader}>{v.title}</ThemedText>
        </VisualFadeUp>
      ) : v.title && v.type !== 'metric' ? (
        <ThemedText type="smallBold" style={v.type === 'comparison' ? styles.comparisonHeader : undefined}>{v.title}</ThemedText>
      ) : null}
      {body}
      {interactive && openRow === null ? (
        <ThemedText type="small" themeColor="mutedForeground" style={[styles.prompt, v.type === 'comparison' && styles.comparisonPrompt]}>
          Tap any of these and Atlas will explain it
        </ThemedText>
      ) : null}
    </>
  );

  const contents = (
    <>
      {chartMaxHeight ? <View style={[styles.cappedChart, { maxHeight: chartMaxHeight }]}>{chart}</View> : chart}
      {selected?.explain ? (
        <VisualAtlasExplanation key={`visual-atlas-${String(openRow)}`} text={selected.explain} />
      ) : null}
    </>
  );

  const accessibility = {
    accessible: !interactive,
    accessibilityRole: interactive ? undefined : ('image' as const),
    accessibilityLabel: interactive ? undefined : chartLabel(v),
  };

  if (bare) {
    return <View style={[styles.bare, v.type === 'comparison' && styles.comparisonBare]} {...accessibility}>{contents}</View>;
  }

  return (
    <Card style={{ gap: Spacing.two }} {...accessibility}>
      {contents}
    </Card>
  );
}

const styles = StyleSheet.create({
  bare: { width: '100%', gap: Spacing.two },
  cappedChart: { width: '100%', alignItems: 'center', justifyContent: 'center', gap: Spacing.two },
  metric: { width: '100%', alignItems: 'center', gap: 6, paddingVertical: 12 },
  metricTitle: { color: 'rgba(242,239,247,0.70)', textAlign: 'center', fontSize: 11, lineHeight: 15, fontWeight: '600', letterSpacing: 0.3 },
  metricSprite: { paddingVertical: 4 },
  metricValue: { fontSize: 36, lineHeight: 40, letterSpacing: -0.9, fontVariant: ['tabular-nums'] },
  metricDetail: { color: 'rgba(242,239,247,0.80)', textAlign: 'center', fontSize: 13, lineHeight: 18 },
  track: { height: 10, borderRadius: Radius.sm, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.sm },
  rowBetween: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  comparisonBare: { gap: 12 },
  comparisonHeader: { fontSize: 13, lineHeight: 18, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.07)', paddingBottom: 8 },
  comparisonRows: { gap: 10 },
  comparisonRow: { paddingHorizontal: 6, paddingVertical: 4, borderRadius: Radius.md },
  comparisonBetween: { flexDirection: 'row', alignItems: 'baseline', gap: 12 },
  comparisonLabel: { flex: 1, fontSize: 12, lineHeight: 15, opacity: 0.8 },
  comparisonValue: { flexShrink: 0, fontSize: 12.5, lineHeight: 16, fontVariant: ['tabular-nums'] },
  comparisonPrompt: { fontSize: 11, lineHeight: 15 },
  legend: { gap: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 10, height: 10, borderRadius: 3 },
  pieRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  gridPressable: { flexGrow: 1, minWidth: '46%' },
  gridCell: { flex: 1, gap: 2, padding: Spacing.two, borderRadius: Radius.md, borderWidth: StyleSheet.hairlineWidth },
  lineLabels: { flexDirection: 'row', alignItems: 'flex-start' },
  lineLabel: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: 2, paddingVertical: 4 },
  flowHeader: { width: '100%', fontSize: 13, lineHeight: 18, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.07)', paddingBottom: 8 },
  flowRow: { flexDirection: 'row', alignItems: 'stretch', gap: Spacing.two + 4, minHeight: 44 },
  flowRail: { width: 12, alignItems: 'center', alignSelf: 'stretch' },
  flowDotWrap: { position: 'relative', width: 11, height: 18, alignItems: 'center', justifyContent: 'center' },
  flowDotWrapLast: { height: 19 },
  flowArrivalRing: { position: 'absolute', width: 11, height: 11, borderRadius: Radius.pill, borderWidth: 2 },
  flowDot: { width: 7, height: 7, borderRadius: Radius.pill },
  flowDotLast: { width: 11, height: 11 },
  flowConnector: { position: 'relative', width: StyleSheet.hairlineWidth, flex: 1, minHeight: 14, marginBottom: 4, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.14)' },
  flowSignal: { position: 'absolute', left: 0, top: 0, right: 0 },
  flowPressable: { flex: 1, minWidth: 0 },
  flowContent: { flex: 1, minWidth: 0, minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.one, paddingBottom: 12, borderRadius: Radius.md },
  flowContentLast: { paddingBottom: 0 },
  flowLabel: { flex: 1, minWidth: 0, color: '#F1EFF5', fontSize: 13.5, lineHeight: 18, fontWeight: '600' },
  flowValue: { flexShrink: 1, maxWidth: '46%', textAlign: 'right', fontSize: 12, lineHeight: 16, fontVariant: ['tabular-nums'] },
  chartRow: { minHeight: 44, justifyContent: 'center', gap: 4, paddingHorizontal: Spacing.one, paddingVertical: Spacing.one, borderRadius: Radius.md },
  barPressable: { width: '100%' },
  barList: { gap: 5 },
  barRow: { minHeight: 30, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4, paddingVertical: 2, borderRadius: Radius.md },
  barTrack: { flex: 1 },
  barSprite: { width: 20, alignItems: 'center', justifyContent: 'center' },
  barLabel: { width: 110, flexShrink: 0, textAlign: 'right', fontSize: 11.5, lineHeight: 15 },
  barValue: { width: 54, flexShrink: 0, fontSize: 12, lineHeight: 15, fontVariant: ['tabular-nums'] },
  unitKey: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  pictographHeader: { minHeight: 44, paddingVertical: Spacing.one },
  marks: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 3 },
  prompt: { textAlign: 'center', paddingVertical: 2, fontSize: 12.5, lineHeight: 17 },
  visualHeader: { alignItems: 'center', paddingBottom: 2 },
  atlasExplanation: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  explain: { position: 'relative', flex: 1, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, borderTopLeftRadius: 4, borderWidth: StyleSheet.hairlineWidth, backgroundColor: '#14121C', borderColor: 'rgba(255,255,255,0.12)' },
  explainTail: { position: 'absolute', left: -6, top: 13, width: 10, height: 10, transform: [{ rotate: '45deg' }], backgroundColor: '#14121C', borderLeftWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.12)' },
});
