/**
 * Portfolio value chart.
 *
 * Robinhood's portfolio view is deliberately ONE LINE of total account value — "simplicity over
 * detail" — rather than the multi-series, indicator-laden thing a stock chart can become. Its
 * ranges are 1D 1W 1M 3M 1Y ALL (no 1H, no YTD; those two are ours).
 *
 * WHAT IT PLOTS, AND WHY THAT MATTERS: `valueHistory` in the store, written on every trade. It is
 * NOT a back-test. Polygon could give per-ticker history and it would be easy to project today's
 * holdings backwards into a rich five-year curve — but that curve is what this basket WOULD have
 * done, not what this account was worth, and showing one as the other is the same lie as the
 * $104,237.55 card that used to sit on this tab. So the chart starts empty and fills as you trade,
 * and says so.
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { toPath } from '@/lib/market';
import { money } from '@/lib/stocks';
import { useApp } from '@/lib/store';
import { SpringPressable } from '@/shared/motion/spring-pressable';

const W = 320;
const H = 96;
/** Height when there is nothing to plot — a flat series or no history. A flat line centred in a
 *  96pt box leaves ~45pt of dead space above and below it, which is most of what made this card
 *  read as filler. A curve earns the full height; a straight line does not. */
const H_FLAT = 34;

/** Robinhood's portfolio ranges. ALL rather than 5Y: a paper account is days old, not years. */
const RANGES = [
  { key: '1D', days: 1, label: 'today' },
  { key: '1W', days: 7, label: 'past week' },
  { key: '1M', days: 30, label: 'past month' },
  { key: '3M', days: 90, label: 'past 3 months' },
  { key: '1Y', days: 365, label: 'past year' },
  { key: 'ALL', days: Infinity, label: 'all time' },
] as const;

export function PortfolioChart() {
  const theme = useTheme();
  const history = useApp((s) => s.valueHistory);
  const [i, setI] = useState(RANGES.length - 1); // default ALL — a new account has the least history

  // Anchored to the MOST RECENT snapshot, not to wall-clock now. Two reasons: `Date.now()` during
  // render is impure (react-hooks/purity, and it would make the chart differ between two renders
  // of the same state), and on a paper account "the week up to your last trade" is the reading
  // that actually has data in it.
  const newest = history.length ? history[history.length - 1].t : 0;
  const oldest = history.length ? history[0].t : 0;

  /*
   * ONLY THE RANGES THE DATA CAN FILL. Measured on device 2026-08-11, before this existed:
   *
   *   1D -> +$3.28 (0.03%) today          1M -> +$3.28 (0.03%) past month
   *   1W -> +$3.28 (0.03%) past week      1Y -> +$3.28 (0.03%) past year
   *
   * Six buttons, ONE chart, six labels — five of them false statements about the user's money.
   * That account's whole history spanned 0.9754 days, so every cutoff swept in every point. The
   * filter was never wrong; the SELECTOR was, for offering windows a paper account cannot fill and
   * then naming the same number five different ways. §0.4 forbids a figure we cannot back, and
   * "+$3.28 today" for a gain that accrued across two days is exactly that.
   *
   * A range earns its button only if its cutoff actually falls AFTER the oldest point, i.e. only if
   * it excludes something ALL would include. Apple's Stocks does the same thing from the other end
   * (screen 100195): a 40-year listing offers 6M through ALL, and never a window it has no data for.
   * ALL is always offered. The row hides itself entirely when ALL is the only truthful option.
   */
  const usable = RANGES.filter(
    (r) => r.days === Infinity || (history.length > 1 && newest - r.days * 86_400_000 > oldest),
  );
  const i2 = Math.min(i, usable.length - 1);
  const range = usable[i2] ?? RANGES[RANGES.length - 1];
  const cutoff = range.days === Infinity ? 0 : newest - range.days * 86_400_000;
  const points = history.filter((p) => p.t >= cutoff).map((p) => ({ t: p.t, c: p.v }));

  const first = points[0]?.c;
  const last = points[points.length - 1]?.c;
  const delta = points.length >= 2 && first !== undefined && last !== undefined
    ? { abs: last - first, pct: first ? ((last - first) / first) * 100 : 0 }
    : null;
  const up = (delta?.abs ?? 0) >= 0;
  const color = up ? theme.success : theme.destructive;
  const d = toPath(points, W, H);
  // A dead-flat series (every trade at market price leaves total value unchanged) draws a line
  // pinned to the vertical centre with a full-width block of fill under it — which reads as a
  // broken graphic, not "flat". Flat gets the line alone.
  const flat = delta === null || delta.abs === 0;
  const h = flat ? H_FLAT : H;
  const area = d && !flat ? `${d} L${W} ${H} L0 ${H} Z` : '';

  return (
    <View style={styles.wrap}>
      <View style={styles.headRow}>
        {delta ? (
          <ThemedText type="smallBold" style={{ color }}>
            {up ? '+' : '−'}{money(Math.abs(delta.abs))} ({Math.abs(delta.pct).toFixed(2)}%) {range.label}
          </ThemedText>
        ) : (
          <ThemedText type="small" themeColor="mutedForeground">
            {history.length === 0 ? 'Your chart builds as you trade' : `Nothing ${range.label}`}
          </ThemedText>
        )}
      </View>

      <View style={[styles.plot, { height: h }]}>
        {d ? (
          <Svg width="100%" height={h} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="pf" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={color} stopOpacity={0.3} />
                <Stop offset="1" stopColor={color} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            {!!area && <Path d={area} fill="url(#pf)" />}
            <Path d={d} stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          </Svg>
        ) : (
          <View style={[styles.flat, { backgroundColor: theme.border }]} />
        )}
      </View>

      {usable.length > 1 && (
      <View style={styles.ranges}>
        {usable.map((r, n) => {
          const on = n === i2;
          return (
            <SpringPressable
              key={r.key}
              haptic={false}
              scaleTo={0.92}
              onPress={() => setI(n)}
              accessibilityRole="button"
              accessibilityLabel={`Show ${r.key} range`}
              accessibilityState={{ selected: on }}
              style={{ flex: 1 }}
            >
              {/* Apple Stocks 100195: the active range is a SUBTLE FILLED RECT and the rest are
                  plain text. A coloured pill per range competes with the line itself for the one
                  accent the screen is allowed. */}
              <View style={[styles.range, on && { backgroundColor: theme.cardElevated }]}>
                <ThemedText type="smallBold" style={{ fontSize: FontSize.caption, color: on ? theme.text : theme.mutedForeground }}>
                  {r.key}
                </ThemedText>
              </View>
            </SpringPressable>
          );
        })}
      </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.two, marginTop: Spacing.three, paddingHorizontal: Spacing.one },
  headRow: { minHeight: 18 },
  plot: { justifyContent: 'center' },
  // A single hairline rather than an empty box: it reads as "flat so far", which is true.
  flat: { height: StyleSheet.hairlineWidth, width: '100%' },
  ranges: { flexDirection: 'row', gap: 2 },
  range: { paddingVertical: 6, borderRadius: Radius.md, alignItems: 'center' },
});
