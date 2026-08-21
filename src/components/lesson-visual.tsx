/**
 * Renders an `AnimatedVisual` — the charts the curriculum authors alongside its prose.
 *
 * WHY THIS EXISTS. There are 1,309 AnimatedVisual objects in the corpus and, until this file, the
 * app read NONE of them: `AnimatedVisual` appeared only in the data layer, in zero components and
 * zero screens. Every one of them rendered as nothing on device, while the same lesson on the web
 * showed the chart. Measured by loading all 12 courses and walking every step:
 *
 *   teachingSlide.diagramVisual  415     flow        395     line    84
 *   hookOpener.visual            298     metric      273     stack   25
 *   stakesCard.withVisual        298     comparison  268     pie     10
 *   stakesCard.withoutVisual     298     grid        144     bars   110
 *
 * EIGHT kinds, not the ten the type allows: `pixel` and `pictograph` are declared but occur zero
 * times, so they are not implemented and are not stubbed either — an empty case that renders
 * nothing is exactly the defect this file exists to remove.
 *
 * Every kind is plain data — labels, numbers, percents and authored hex colours — so seven of the
 * eight are laid out with ordinary views. Only `pie` needs SVG, and it uses stroke-dash arithmetic
 * on a circle rather than arc paths, because dash offsets cannot produce a malformed wedge.
 *
 * AUTHORED COLOURS WIN. Where a segment carries its own `color` it is used; where it does not, the
 * theme supplies one. `sentiment` tints the accent, so a chart about a loss does not read green.
 *
 * `line` IS DELIBERATELY NOT PLOTTED. Its points carry `value` as a STRING -- "$0.08" through
 * "$73,000" in the Bitcoin example -- so drawing a curve would mean parsing those into numbers and
 * then choosing a scale. Linear renders fourteen years as a flat line and one spike; log renders a
 * steady climb. Both are editorial claims the author did not make. The points are shown in order
 * with the trend the author DID state, and nothing is invented. Plotting it properly needs a
 * numeric field in the data, which is a web-repo change.
 */
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { AnimatedVisual } from '@/lib/curriculum';
import { chartLabel } from '@/lib/lesson-steps';

type Sentiment = 'positive' | 'negative' | undefined;

export function LessonVisual({ visual }: { visual: AnimatedVisual }) {
  const theme = useTheme();
  const v = visual as AnimatedVisual & Record<string, any>;
  const sentiment: Sentiment = v.sentiment;
  const accent = sentiment === 'negative' ? theme.destructive : sentiment === 'positive' ? theme.success : theme.iconLilac;

  const pct = (n: unknown) => Math.max(0, Math.min(100, Number(n) || 0));

  const Bar = ({ percent, color }: { percent: number; color: string }) => (
    <View style={[styles.track, { backgroundColor: theme.primary + '1F' }]}>
      <View style={{ width: `${pct(percent)}%`, height: '100%', borderRadius: Radius.sm, backgroundColor: color }} />
    </View>
  );

  const body = (() => {
    switch (v.type) {
      case 'metric':
        return (
          <View style={{ gap: 4 }}>
            <ThemedText type="display" style={{ fontSize: FontSize.displaySm, color: accent }}>{v.value}</ThemedText>
            {v.detail ? <ThemedText type="small" themeColor="mutedForeground">{v.detail}</ThemedText> : null}
          </View>
        );

      case 'bars': {
        // `value` is a relative number on the author's own scale; `displayValue` is the label they
        // wrote for it. Normalise against the largest so the longest bar fills the track.
        const items: any[] = v.items ?? [];
        const max = Math.max(1, ...items.map((i) => Number(i.value) || 0));
        return (
          <View style={{ gap: Spacing.two }}>
            {items.map((i, n) => (
              <View key={n} style={{ gap: 4 }}>
                <View style={styles.rowBetween}>
                  <ThemedText type="small" style={{ flex: 1 }}>{i.label}</ThemedText>
                  <ThemedText type="smallBold" style={{ color: accent }}>{i.displayValue ?? String(i.value)}</ThemedText>
                </View>
                <Bar percent={((Number(i.value) || 0) / max) * 100} color={accent} />
              </View>
            ))}
          </View>
        );
      }

      case 'comparison': {
        const rows: any[] = v.rows ?? [];
        return (
          <View style={{ gap: Spacing.two }}>
            {rows.map((r, n) => (
              <View key={n} style={{ gap: 4 }}>
                <View style={styles.rowBetween}>
                  <ThemedText type="small" style={{ flex: 1 }}>{r.label}</ThemedText>
                  <ThemedText type="smallBold" style={{ color: accent }}>{r.value}</ThemedText>
                </View>
                {typeof r.percent === 'number' ? <Bar percent={r.percent} color={accent} /> : null}
              </View>
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
                <View key={n} style={{ width: `${pct(s.percent)}%`, height: '100%', backgroundColor: s.color ?? accent }} />
              ))}
            </View>
            <View style={styles.legend}>
              {segs.map((s, n) => (
                <View key={n} style={styles.legendItem}>
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
        let acc = 0;
        return (
          <View style={styles.pieRow}>
            {/* Decorative: every number in it is already in the Card's own label. */}
            <Svg width={SIZE} height={SIZE} accessible={false}>
              {segs.map((s, n) => {
                const len = (pct(s.percent) / 100) * C;
                // stroke-dash arithmetic rather than arc paths: an offset cannot draw a bad wedge
                const el = (
                  <Circle
                    key={n}
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={R}
                    fill="none"
                    stroke={s.color ?? accent}
                    strokeWidth={SW}
                    strokeDasharray={`${len} ${C - len}`}
                    strokeDashoffset={-acc}
                    // start at twelve o'clock instead of three
                    transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                  />
                );
                acc += len;
                return el;
              })}
            </Svg>
            <View style={{ flex: 1, gap: 6 }}>
              {v.centerLabel ? <ThemedText type="smallBold" style={{ color: accent }}>{v.centerLabel}</ThemedText> : null}
              {segs.map((s, n) => (
                <View key={n} style={styles.legendItem}>
                  <View style={[styles.swatch, { backgroundColor: s.color ?? accent }]} />
                  <ThemedText type="small" themeColor="mutedForeground">{s.label} · {pct(s.percent)}%</ThemedText>
                </View>
              ))}
            </View>
          </View>
        );
      }

      case 'grid': {
        const items: any[] = v.items ?? [];
        return (
          <View style={styles.grid}>
            {items.map((i, n) => (
              <View key={n} style={[styles.gridCell, { backgroundColor: theme.primary + '14', borderColor: (i.color ?? accent) + '3D' }]}>
                {i.value ? <ThemedText type="smallBold" style={{ color: i.color ?? accent }}>{i.value}</ThemedText> : null}
                <ThemedText type="small" themeColor="mutedForeground">{i.label}</ThemedText>
              </View>
            ))}
          </View>
        );
      }

      case 'flow': {
        const nodes: any[] = v.nodes ?? [];
        return (
          <View style={{ gap: 6 }}>
            {nodes.map((nd, n) => (
              <View key={n} style={{ gap: 6 }}>
                <View style={[styles.flowNode, { backgroundColor: theme.primary + '14', borderColor: (nd.color ?? accent) + '3D' }]}>
                  <ThemedText type="small" style={{ flex: 1 }}>{nd.label}</ThemedText>
                  {nd.value ? <ThemedText type="smallBold" style={{ color: nd.color ?? accent }}>{nd.value}</ThemedText> : null}
                </View>
                {n < nodes.length - 1 ? <View style={[styles.connector, { backgroundColor: theme.primary + '3D' }]} /> : null}
              </View>
            ))}
          </View>
        );
      }

      case 'line': {
        const points: any[] = v.points ?? [];
        const arrow = v.trend === 'down' ? '↓' : '↑';
        return (
          <View style={{ gap: Spacing.two }}>
            <ThemedText type="smallBold" style={{ color: accent }}>{arrow} {v.trend === 'down' ? 'Downward' : 'Upward'} over the period</ThemedText>
            <View style={{ gap: 6 }}>
              {points.map((p, n) => (
                <View key={n} style={styles.rowBetween}>
                  <ThemedText type="small" themeColor="mutedForeground" style={{ flex: 1 }}>{p.label}</ThemedText>
                  <ThemedText type="smallBold">{p.value}</ThemedText>
                </View>
              ))}
            </View>
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
  return (
    <Card
      style={{ gap: Spacing.two }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={chartLabel(v)}
    >
      {v.title ? <ThemedText type="smallBold">{v.title}</ThemedText> : null}
      {body}
      {v.footer ? <ThemedText type="small" themeColor="mutedForeground">{v.footer}</ThemedText> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  track: { height: 10, borderRadius: Radius.sm, overflow: 'hidden' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  legend: { gap: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 10, height: 10, borderRadius: 3 },
  pieRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  gridCell: { flexGrow: 1, minWidth: '30%', gap: 2, padding: Spacing.two, borderRadius: Radius.md, borderWidth: StyleSheet.hairlineWidth },
  flowNode: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, padding: Spacing.two, borderRadius: Radius.md, borderWidth: StyleSheet.hairlineWidth },
  connector: { width: 2, height: 10, marginLeft: Spacing.three, borderRadius: 1 },
});
