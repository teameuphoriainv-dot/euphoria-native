/**
 * Stock detail — and the only place a paper trade actually happens.
 *
 * WHAT THIS USED TO BE: a hand-drawn bezier posing as a price chart, a position card reading
 * `stock.qty` / `stock.value` straight out of the mock table (so it showed "12 sh" whether or not
 * you owned any), and a "Practice a trade" button whose handler was `router.push('/trade')` —
 * a button on the stock page that returned you to the tab you arrived from.
 *
 * Now: the position comes from `positions[sym]`, and Buy/Sell call the store. Investing.com
 * (app 1171, $450k/mo) puts Buy and Sell at the bottom of exactly this screen, which is the right
 * place — it is where the user has the price, the position and the reason all in view.
 *
 * The chart is gone. `lib/stocks.ts` holds one static price per ticker and no series, so any line
 * drawn here is decoration pretending to be data. It returns when quotes do.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { AskAtlasRow } from '@/components/ask-atlas';
import { KeyStats } from '@/components/key-stats';
import { PriceChart } from '@/components/price-chart';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { GradientButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getQuote, type Quote } from '@/lib/market';
import { money, priceOf, shares, STOCKS } from '@/lib/stocks';
import { useApp } from '@/lib/store';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

export default function StockDetail() {
  const theme = useTheme();
  const { sym } = useLocalSearchParams<{ sym: string }>();
  // The static table seeds seven tickers with a hand-written blurb. Search returns thousands, so
  // an unknown symbol is NORMAL here, not an error — resolve what we can live and show the rest.
  const stock = sym ? STOCKS[sym] : undefined;

  const cash = useApp((s) => s.cash);
  const held = useApp((s) => (sym ? (s.positions[sym] ?? 0) : 0));
  const buy = useApp((s) => s.buy);
  const sell = useApp((s) => s.sell);
  const toggleWatch = useApp((s) => s.toggleWatch);
  const watching = useApp((st) => (sym ? st.watchlist.includes(sym) : false));
  const [qty, setQty] = useState(1);
  const [live, setLive] = useState<Quote | null>(null);

  useEffect(() => {
    if (!sym) return;
    let cancelled = false;
    getQuote(sym).then((q) => !cancelled && setLive(q));
    return () => {
      cancelled = true;
    };
  }, [sym]);

  if (!sym) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ThemedText type="heading">Stock not found</ThemedText>
        <SpringPressable onPress={() => router.back()} style={{ marginTop: Spacing.three }} accessibilityRole="button" accessibilityLabel="Back">
          <ThemedText type="bodyMedium" style={{ color: theme.iconLilac }}>Back</ThemedText>
        </SpringPressable>
      </SafeAreaView>
    );
  }

  // Live first, static table second. `priceOf` returns 0 for an unknown ticker, which correctly
  // disables Buy rather than letting someone trade at a price we do not have.
  const price = live?.price ?? priceOf(sym);
  const name = stock?.name ?? sym;
  const chgPct = live?.changePct ?? stock?.chg ?? 0;
  const cost = qty * price;
  const up = chgPct >= 0;
  const canBuy = cost <= cash && qty > 0;
  const canSell = held >= qty && qty > 0;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={28} glow={false} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SpringPressable haptic={false} onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Back to Trade">
          <UIcon name="chevronLeft" size={22} color={theme.mutedForeground} />
          <ThemedText type="small" themeColor="mutedForeground">Trade</ThemedText>
        </SpringPressable>

        <RiseIn>
          <View style={[styles.ticker, { backgroundColor: theme.primary + '1F' }]}>
            <ThemedText type="smallBold" style={{ color: theme.iconLilac, fontSize: 13 }}>{sym}</ThemedText>
          </View>
          <ThemedText type="title" style={{ fontSize: 26, marginTop: Spacing.two }}>{name}</ThemedText>
          <View style={styles.priceRow}>
            <ThemedText type="display" style={{ fontSize: 30 }}>{price > 0 ? money(price) : '—'}</ThemedText>
            <ThemedText type="heading" style={{ color: up ? theme.success : theme.destructive, fontSize: 16 }}>
              {up ? '+' : ''}{chgPct.toFixed(1)}% today
            </ThemedText>
          </View>
        </RiseIn>

        <RiseIn delay={60}>
          <View style={{ marginTop: Spacing.three }}>
            <PriceChart sym={sym} />
          </View>
        </RiseIn>

        {held > 0 && (
          <RiseIn delay={80}>
            <Card style={styles.posCard}>
              <View>
                <ThemedText type="label" themeColor="mutedForeground">You own</ThemedText>
                <ThemedText type="heading" style={{ fontSize: 18, marginTop: 2 }}>
                  {shares(held)} {held === 1 ? 'share' : 'shares'}
                </ThemedText>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <ThemedText type="label" themeColor="mutedForeground">Value</ThemedText>
                <ThemedText type="heading" style={{ fontSize: 18, marginTop: 2 }}>{money(held * price)}</ThemedText>
              </View>
            </Card>
          </RiseIn>
        )}

        <RiseIn delay={110}>
          <SpringPressable
            haptic={false}
            onPress={() => toggleWatch(sym)}
            accessibilityRole="button"
            accessibilityLabel={watching ? `Unfollow ${name}` : `Follow ${name}`}
            accessibilityState={{ selected: watching }}
          >
            <View
              style={[
                styles.follow,
                { borderColor: watching ? theme.primary : theme.border, backgroundColor: watching ? theme.primary + '1A' : theme.card },
              ]}
            >
              <UIcon name={watching ? 'check' : 'sparkle'} size={17} color={watching ? theme.iconLilac : theme.mutedForeground} />
              <ThemedText type="bodyMedium" style={watching ? { color: theme.iconLilac } : undefined}>
                {watching ? 'Following' : 'Follow'}
              </ThemedText>
            </View>
          </SpringPressable>
        </RiseIn>

        <RiseIn delay={130}>
          <KeyStats sym={sym} />
        </RiseIn>

        <RiseIn delay={140}>
          <ThemedText type="label" themeColor="mutedForeground" style={styles.sectionLabel}>About</ThemedText>
          <ThemedText type="body" themeColor="mutedForeground" style={{ lineHeight: 23 }}>
            {stock?.blurb ?? `${name} trades as ${sym}. Ask Atlas below for a plain-English explainer.`}
          </ThemedText>
        </RiseIn>

        <RiseIn delay={180}>
          <SpringPressable
            haptic={false}
            onPress={() => router.push(`/news?sym=${sym}`)}
            accessibilityRole="button"
            accessibilityLabel={`News about ${name}`}
          >
            <View style={[styles.newsRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <UIcon name="feed" size={17} color={theme.mutedForeground} />
              <ThemedText type="body" style={{ flex: 1 }}>News about {name}</ThemedText>
              <UIcon name="arrowRight" size={16} color={theme.mutedForeground} />
            </View>
          </SpringPressable>
        </RiseIn>

        <RiseIn delay={200}>
          <AskAtlasRow topic={name} label="Not sure about this one?" />
        </RiseIn>

        <RiseIn delay={260}>
          <Card style={styles.trade}>
            <View style={styles.qtyRow}>
              <ThemedText type="bodyMedium">Shares</ThemedText>
              <View style={styles.stepper}>
                <SpringPressable
                  haptic={false}
                  onPress={() => setQty((n) => Math.max(1, n - 1))}
                  accessibilityRole="button"
                  accessibilityLabel="One share fewer"
                >
                  <View style={[styles.step, { borderColor: theme.border }]}>
                    <ThemedText type="heading" style={{ fontSize: 18 }}>−</ThemedText>
                  </View>
                </SpringPressable>
                <ThemedText type="heading" style={styles.qtyNum}>{qty}</ThemedText>
                <SpringPressable
                  haptic={false}
                  onPress={() => setQty((n) => n + 1)}
                  accessibilityRole="button"
                  accessibilityLabel="One share more"
                >
                  <View style={[styles.step, { borderColor: theme.border }]}>
                    <ThemedText type="heading" style={{ fontSize: 18 }}>+</ThemedText>
                  </View>
                </SpringPressable>
              </View>
            </View>

            <View style={[styles.costRow, { borderTopColor: theme.border }]}>
              <ThemedText type="small" themeColor="mutedForeground">
                {qty} × {price > 0 ? money(price) : '—'}
              </ThemedText>
              <ThemedText type="smallBold">{money(cost)}</ThemedText>
            </View>

            <View style={styles.actions}>
              <View style={{ flex: 1 }}>
                <GradientButton
                  label="Buy"
                  full
                  disabled={!canBuy}
                  onPress={() => buy(sym, qty, price)}
                />
              </View>
              <SpringPressable
                haptic={false}
                onPress={() => canSell && sell(sym, qty, price)}
                accessibilityRole="button"
                accessibilityLabel={canSell ? `Sell ${qty} shares` : 'Sell unavailable, you hold none'}
                accessibilityState={{ disabled: !canSell }}
                style={{ flex: 1 }}
              >
                <View style={[styles.sell, { borderColor: theme.border, opacity: canSell ? 1 : 0.4 }]}>
                  <ThemedText type="bodyMedium">Sell</ThemedText>
                </View>
              </SpringPressable>
            </View>

            {/* Says WHY the button is off. A disabled control with no reason is the same dead end
                as a button that does nothing. */}
            <ThemedText type="small" themeColor="mutedForeground" style={styles.hint}>
              {!canBuy ? `Not enough cash — you have ${money(cash)}.` : `Cash after this buy: ${money(cash - cost)}`}
            </ThemedText>
          </Card>
        </RiseIn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: Spacing.three },
  ticker: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.md },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: Spacing.one },
  posCard: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.three },
  sectionLabel: { marginTop: Spacing.four, marginBottom: Spacing.two },
  follow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    height: 48,
    marginTop: Spacing.three,
  },
  newsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    height: 48,
    marginTop: Spacing.three,
  },
  trade: { marginTop: Spacing.four, gap: Spacing.two },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  step: { width: 38, height: 38, borderRadius: 19, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  qtyNum: { fontSize: 20, minWidth: 34, textAlign: 'center', fontVariant: ['tabular-nums'] },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.two + 2,
    marginTop: Spacing.one,
  },
  actions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  sell: {
    height: 50,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { textAlign: 'center' },
});
