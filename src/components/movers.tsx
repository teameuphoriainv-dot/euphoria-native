/**
 * Daily winners and losers.
 *
 * Investing.com (app 1171, $450k/mo) runs "Most Active" and "Daily Winners & Losers" with a
 * Winners/Losers toggle on its markets surface; Bloom shows "Trending stocks" with momentum flags.
 * 2/4 of the reference set carry movers, and it is the one thing on a trading screen that changes
 * when nothing else has — the reason to open the tab on a day you are not trading.
 *
 * Hides entirely when there is no key. An empty movers table would imply a market where nothing
 * moved, which is never true and is a worse lie than saying nothing.
 */
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { TickerLogo } from '@/components/ticker-logo';
import { Card } from '@/components/ui/card';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getMovers, type Mover } from '@/lib/market';
import { money } from '@/lib/stocks';
import { SpringPressable } from '@/shared/motion/spring-pressable';

export function Movers() {
  const theme = useTheme();
  const [dir, setDir] = useState<'gainers' | 'losers'>('gainers');
  const [data, setData] = useState<Mover[] | null>(null);
  // Which direction the rows in `data` belong to — derives loading without setState in the effect
  // body, the rule this codebase follows everywhere.
  const [loadedFor, setLoadedFor] = useState('');
  const loading = loadedFor !== dir;

  useEffect(() => {
    let cancelled = false;
    getMovers(dir).then((m) => {
      if (cancelled) return;
      setData(m);
      setLoadedFor(dir);
    });
    return () => {
      cancelled = true;
    };
  }, [dir]);

  // Nothing to show and nothing loading means no key. Say nothing rather than show an empty market.
  if (!loading && (data?.length ?? 0) === 0) return null;


  return (
    <View>
      <View style={styles.head}>
        <ThemedText type="label" themeColor="mutedForeground">Today&apos;s movers</ThemedText>
        <View style={styles.toggle}>
          {(['gainers', 'losers'] as const).map((d) => (
            <SpringPressable
              key={d}
              haptic={false}
              scaleTo={0.94}
              onPress={() => setDir(d)}
              accessibilityRole="button"
              accessibilityLabel={d === 'gainers' ? 'Show winners' : 'Show losers'}
              accessibilityState={{ selected: d === dir }}
            >
              <View
                style={[
                  styles.tab,
                  d === dir && { backgroundColor: (d === 'gainers' ? theme.success : theme.destructive) + '22' },
                ]}
              >
                <ThemedText
                  type="smallBold"
                  style={{
                    fontSize: FontSize.caption,
                    color: d === dir ? (d === 'gainers' ? theme.success : theme.destructive) : theme.mutedForeground,
                  }}
                >
                  {d === 'gainers' ? 'Winners' : 'Losers'}
                </ThemedText>
              </View>
            </SpringPressable>
          ))}
        </View>
      </View>

      <Card padded={false}>
        {loading ? (
          <View style={styles.loading}><ActivityIndicator color={theme.primary} /></View>
        ) : (
          data?.map((m, i) => (
            <SpringPressable
              key={m.sym}
              onPress={() => router.push(`/stock/${m.sym}`)}
              accessibilityRole="button"
              accessibilityLabel={`${m.sym}, ${money(m.price)}, ${m.changePct >= 0 ? 'up' : 'down'} ${Math.abs(m.changePct).toFixed(1)} percent`}
            >
              <View
                style={[
                  styles.row,
                  i < (data.length - 1) && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
                ]}
              >
                <TickerLogo sym={m.sym} size={42} />
                <ThemedText type="bodyMedium" style={{ flex: 1 }}>{m.sym}</ThemedText>
                <View style={{ alignItems: 'flex-end' }}>
                  <ThemedText type="bodyMedium" style={styles.num}>{money(m.price)}</ThemedText>
                  <ThemedText type="smallBold" style={{ color: m.changePct >= 0 ? theme.success : theme.destructive }}>
                    {m.changePct >= 0 ? '+' : ''}{m.changePct.toFixed(1)}%
                  </ThemedText>
                </View>
              </View>
            </SpringPressable>
          ))
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.two, marginBottom: Spacing.two },
  toggle: { flexDirection: 'row', gap: 4 },
  tab: { paddingVertical: 4, paddingHorizontal: Spacing.two + 2, borderRadius: Radius.pill },
  loading: { padding: Spacing.four, alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three },
  num: { fontVariant: ['tabular-nums'] },
});
