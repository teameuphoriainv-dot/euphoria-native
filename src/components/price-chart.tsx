/**
 * Price chart with a range selector.
 *
 * Shape from a 3/3 convergence across TradingView ($2.25M/mo), Bloom (learn-to-invest, the closest
 * positional competitor Euphoria has) and Yahoo Finance:
 *
 *   TradingView  1D 5D 1M 3M 6M 1Y 5Y All
 *   Bloom        1D 1W 1M 1Y 5Y
 *   Yahoo        1D 5D 1M 3M 6M YTD 1Y 5Y
 *
 * The mechanism worth stealing is not the row — it is that ALL THREE RECOMPUTE THE HEADLINE
 * CHANGE for the selected range. TradingView flips between "+0.27% at close" and "+1.04% past 5
 * days"; Bloom between "Today" and "Past 5 Years". A chart whose change figure never moves when
 * you change the range reads as decoration, which is exactly what the old hardcoded bezier was.
 *
 * When there is no API key this renders "Live prices aren't switched on" — never a fabricated
 * line. The whole point of replacing the bezier was to stop drawing data we do not have.
 */
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getChart, RANGES, seriesChange, toPath, type Chart, type RangeKey } from '@/lib/market';
import { money } from '@/lib/stocks';
import { SpringPressable } from '@/shared/motion/spring-pressable';

const W = 320;
const H = 120;

export function PriceChart({ sym, initialRange = '1D' }: { sym: string; initialRange?: RangeKey }) {
  const theme = useTheme();
  const [range, setRange] = useState<RangeKey>(initialRange);
  const [chart, setChart] = useState<Chart | null>(null);
  // Which (sym, range) the state in `chart` actually belongs to. Deriving `loading` from this
  // keeps setState out of the effect BODY — the same rule lesson.tsx follows for `badParams`.
  // Writing it inside the async callback is fine; writing it synchronously on every effect run is
  // what triggers the cascading re-render this rule guards.
  const [loadedKey, setLoadedKey] = useState('');
  const key = `${sym}:${range}`;
  const loading = loadedKey !== key;

  useEffect(() => {
    let cancelled = false;
    getChart(sym, range).then((c) => {
      if (cancelled) return;
      setChart(c);
      setLoadedKey(`${sym}:${range}`);
    });
    return () => {
      cancelled = true;
    };
  }, [sym, range]);

  const points = loading ? [] : (chart?.points ?? []);
  const delta = seriesChange(points);
  const up = (delta?.abs ?? 0) >= 0;
  const color = up ? theme.success : theme.destructive;
  const d = toPath(points, W, H);
  const area = d ? `${d} L${W} ${H} L0 ${H} Z` : '';

  return (
    <View style={styles.wrap}>
      {/* Change for the SELECTED range, with the range named. This line is the whole mechanism. */}
      <View style={styles.headRow}>
        {delta ? (
          <ThemedText type="smallBold" style={{ color }}>
            {up ? '+' : '−'}{money(Math.abs(delta.abs))} ({Math.abs(delta.pct).toFixed(2)}%) {chart?.label}
          </ThemedText>
        ) : (
          <ThemedText type="small" themeColor="mutedForeground">
            {loading ? ' ' : 'No data for this range'}
          </ThemedText>
        )}
      </View>

      <View style={[styles.plot, { height: H }]}>
        {loading ? (
          <ActivityIndicator color={theme.primary} />
        ) : d ? (
          <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
            <Defs>
              <LinearGradient id={`g-${sym}`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={color} stopOpacity={0.28} />
                <Stop offset="1" stopColor={color} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Path d={area} fill={`url(#g-${sym})`} />
            <Path d={d} stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          </Svg>
        ) : (
          // Says which of the two it is. "No chart" would hide a missing key behind a missing market.
          <ThemedText type="small" themeColor="mutedForeground" style={styles.center}>
            {range === '1H'
              ? 'Nothing traded in the last hour.'
              : 'Live prices aren’t switched on in this build.'}
          </ThemedText>
        )}
      </View>

      <View style={styles.ranges}>
        {RANGES.map((r) => {
          const on = r === range;
          return (
            <SpringPressable
              key={r}
              haptic={false}
              scaleTo={0.92}
              onPress={() => setRange(r)}
              accessibilityRole="button"
              accessibilityLabel={`Show ${r} range`}
              accessibilityState={{ selected: on }}
              style={{ flex: 1 }}
            >
              <View style={[styles.range, on && { backgroundColor: color + '22' }]}>
                <ThemedText type="smallBold" style={{ fontSize: 12, color: on ? color : theme.mutedForeground }}>
                  {r}
                </ThemedText>
              </View>
            </SpringPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.two },
  headRow: { minHeight: 18 },
  plot: { alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center', paddingHorizontal: Spacing.four },
  ranges: { flexDirection: 'row', gap: 2 },
  range: { paddingVertical: 6, borderRadius: Radius.md, alignItems: 'center' },
});
