/**
 * Key statistics.
 *
 * 3/4 of the reference set carry this block directly under the chart, and it is the densest
 * information-per-pixel thing on a stock page:
 *   Bloom          52 Week High / 52 Week Low / Dividend Yield / Today's Volume / Avg Daily Volume
 *   Investing.com  Previous Close / Open / Day's Range / 52wk Range / 1-Year Change
 *   Yahoo Finance  the same family
 *
 * Every value is a real Polygon aggregate. A row whose value is missing is DROPPED rather than
 * rendered as "—": a grid of dashes looks like the feature is broken, while a shorter grid just
 * looks like a shorter grid. And with no API key the whole block hides instead of showing an
 * empty shell.
 *
 * NOT included: dividend yield. Bloom shows it, but it needs a dividends endpoint we do not call,
 * and a yield of "0.00%" on a stock that pays one would be worse than not showing it at all.
 */
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { compact, getStats, type Stats } from '@/lib/market';
import { money } from '@/lib/stocks';

export function KeyStats({ sym }: { sym: string }) {
  const theme = useTheme();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    getStats(sym).then((s) => !cancelled && setStats(s));
    return () => {
      cancelled = true;
    };
  }, [sym]);

  if (!stats) return null;

  const rows: { label: string; value: string }[] = [];
  const push = (label: string, value: string | null) => value && rows.push({ label, value });

  push('Previous close', stats.previousClose != null ? money(stats.previousClose) : null);
  push('Open', stats.open != null ? money(stats.open) : null);
  push(
    "Day's range",
    stats.dayLow != null && stats.dayHigh != null ? `${money(stats.dayLow)} – ${money(stats.dayHigh)}` : null,
  );
  push(
    '52-week range',
    stats.weekLow52 != null && stats.weekHigh52 != null
      ? `${money(stats.weekLow52)} – ${money(stats.weekHigh52)}`
      : null,
  );
  push('Volume', stats.volume != null ? compact(stats.volume) : null);
  push('Avg volume', stats.avgVolume != null ? compact(stats.avgVolume) : null);
  push(
    '1-year change',
    stats.yearChangePct != null
      ? `${stats.yearChangePct >= 0 ? '+' : '−'}${Math.abs(stats.yearChangePct).toFixed(1)}%`
      : null,
  );

  if (rows.length === 0) return null;

  return (
    <View>
      <ThemedText type="label" themeColor="mutedForeground" style={styles.label}>Key statistics</ThemedText>
      <Card padded={false}>
        {rows.map((r, i) => (
          <View
            key={r.label}
            style={[
              styles.row,
              i < rows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
            ]}
          >
            <ThemedText type="small" themeColor="mutedForeground">{r.label}</ThemedText>
            <ThemedText type="smallBold" style={styles.value}>{r.value}</ThemedText>
          </View>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginTop: Spacing.four, marginBottom: Spacing.two },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two + 3,
    paddingHorizontal: Spacing.three,
  },
  // Ranges and volumes are compared down the column; proportional digits make that jitter.
  value: { fontVariant: ['tabular-nums'] },
});
