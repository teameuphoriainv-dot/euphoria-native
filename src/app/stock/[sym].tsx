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
import { BottomTabInset, Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getQuote, type Quote } from '@/lib/market';
import { money, priceOf, shares, STOCKS } from '@/lib/stocks';
import { useApp } from '@/lib/store';
import { entitled, useTier, type Refusal } from '@/lib/entitlement';
import { GateSheet } from '@/components/gate-sheet';
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

  /*
   * THE TRADE GATE, done the way Bloom does it (156247, verified in pixels).
   *
   * Bloom's locked control is an OUTLINE PILL WITH THE LOCK INSIDE IT, at full contrast and still
   * tappable — not greyed out, not hidden. Everything around it stays at full contrast too: its
   * "1/253 unlocked" counter and its unlocked STOCK PRICE card are not dimmed. So here the chart,
   * key stats, quote, news, follow, quantity stepper and cost row are ALL untouched. Only the
   * transaction is locked, and tapping it opens the sheet rather than doing nothing.
   *
   * WHY NOT `disabled`: a greyed button that cannot say why is the dead end §0.5 forbids, and it is
   * also not what Bloom ships. A live control that explains itself is the "lock is a promise"
   * mechanism at 5/5 convergence.
   *
   * This REFINES C13 decision 1, which as written closed quotes and news as well — see §22 C40.
   * Reading the market is what gives a lapsed user a reason to reopen the app at all.
   *
   * DECLARED ABOVE the `if (!sym)` early return. Placing these below it made `useTier` and
   * `useState` conditional and cost two react-hooks/rules-of-hooks ERRORS — lint went 50 -> 52 and
   * this is the fix, not a suppression.
   */
  const expired = useTier() === 'expired';
  const [gate, setGate] = useState<Refusal | null>(null);
  const openGate = () => setGate(entitled(useApp.getState(), 'trade'));

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

  /*
   * ONE MARK FOR TRADING AND VALUING. This used to be `live?.price ?? priceOf(sym)`, which meant a
   * trade EXECUTED at the live quote while `portfolioValue()`, `snapshot()` and the Trade row all
   * valued the resulting position with `priceOf()` — the static table. Cost basis in one currency,
   * the gain computed against another.
   *
   * It was invisible only because `/api/market` 503s without the four API keys, so `live` is always
   * null and the two agree. Setting POLYGON_API_KEY would have armed it: buy NVDA at a live $1,150,
   * see "+2.96%" on a position that had not moved. §22 C100 and C113 are both this shape — two
   * sources for one number — and this is the one that was waiting on a config change to fire.
   *
   * `priceOf` is the app's canonical mark because the whole valuation model is the static table
   * (`stocks.ts`). Transacting live against a static book is a half-migration, not a feature.
   *
   * PHASE 16 LANDED 2026-08-13 and this line did not change, exactly as predicted. `priceOf` now
   * prefers a live mark from `lib/marks.ts`, so execution and valuation moved together — every
   * caller, `valueOf()` and `snapshot()` and the Trade rows and the options spot, followed for free.
   */
  const price = priceOf(sym);
  const name = stock?.name ?? sym;
  /*
   * NULL, not `?? stock?.chg ?? 0`. The static table's percent describes a stock whose price is now
   * live, so pairing them renders two different days on one line. Measured on device before this
   * change: a `+0.1% today` badge sitting beside a `+$1.62 (0.72%) today` figure for NVDA, because
   * the badge had fallen back to the table while its neighbour had a live quote. §0.4 — no live
   * quote, no percent. An absent number is honest; a stale one is not.
   */
  const chgPct = live?.changePct ?? null;
  const cost = qty * price;
  const up = (chgPct ?? 0) >= 0;
  // `price > 0` is the guard the old comment CLAIMED priceOf's zero already provided. It did not:
  // cost is then 0, `0 <= cash` passes, and an unpriced ticker could be bought for nothing —
  // recording a basis of exactly 0, which is the second door into the partial-basis bug (C113).
  const canBuy = price > 0 && cost <= cash && qty > 0;
  const canSell = price > 0 && held >= qty && qty > 0;

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
            <ThemedText type="smallBold" style={{ color: theme.iconLilac, fontSize: FontSize.small }}>{sym}</ThemedText>
          </View>
          <ThemedText type="title" style={{ fontSize: FontSize.titleLg, marginTop: Spacing.two }}>{name}</ThemedText>
          <View style={styles.priceRow}>
            <ThemedText type="display" style={{ fontSize: FontSize.display }}>{price > 0 ? money(price) : '—'}</ThemedText>
            {chgPct !== null && (
              <ThemedText type="heading" style={{ color: up ? theme.success : theme.destructive, fontSize: FontSize.body }}>
                {up ? '+' : ''}{chgPct.toFixed(1)}% today
              </ThemedText>
            )}
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
                <ThemedText type="heading" style={{ fontSize: FontSize.subhead, marginTop: 2 }}>
                  {shares(held)} {held === 1 ? 'share' : 'shares'}
                </ThemedText>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <ThemedText type="label" themeColor="mutedForeground">Value</ThemedText>
                <ThemedText type="heading" style={{ fontSize: FontSize.subhead, marginTop: 2 }}>{money(held * price)}</ThemedText>
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
                    <ThemedText type="heading" style={{ fontSize: FontSize.subhead }}>−</ThemedText>
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
                    <ThemedText type="heading" style={{ fontSize: FontSize.subhead }}>+</ThemedText>
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
              {expired ? (
                /* CORRECTED. This used to render BOTH actions as the same outline-pill-with-lock,
                   on the stated grounds that `styles.sell` "is already exactly Bloom's shape".
                   Pulled in pixels, Bloom `156236` is the opposite: its locked `Invest` is a
                   SOLID BLUE FULL-WIDTH pill with a white padlock — visually identical to a live
                   CTA. Counted across four finance apps ≥$250k/mo (Bloom `156236`,
                   Investing.com `211206` + `211090`, Seeking Alpha `285915`): **4/4 keep the
                   locked control at full fill, 0/4 demote it.**

                   Demoting Buy to a hairline outline said "broken". Full fill + a lock says
                   "available, costs money" — the true statement, and the only one that converts.
                   Sell stays the outline pill because it is the SECONDARY action; every app in
                   the set elevates exactly one. */
                <>
                  <View style={{ flex: 1 }}>
                    <GradientButton
                      label="Buy"
                      full
                      icon="lock"
                      onPress={openGate}
                      accessibilityLabel="Buy. Paper trading is part of Euphoria Pro."
                    />
                  </View>
                  <SpringPressable
                    haptic={false}
                    onPress={openGate}
                    accessibilityRole="button"
                    accessibilityLabel="Sell. Paper trading is part of Euphoria Pro."
                    style={{ flex: 1 }}>
                    <View style={[styles.sell, styles.locked, { borderColor: theme.border }]}>
                      <ThemedText type="bodyMedium">Sell</ThemedText>
                      <UIcon name="lock" size={16} color={theme.mutedForeground} />
                    </View>
                  </SpringPressable>
                </>
              ) : (
                <>
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
                </>
              )}
            </View>

            {/* Says WHY the button is off. A disabled control with no reason is the same dead end
                as a button that does nothing. */}
            <ThemedText type="small" themeColor="mutedForeground" style={styles.hint}>
              {expired
                ? 'Paper trading is part of Euphoria Pro. Prices and stats stay open.'
                : !canBuy
                  ? `Not enough cash — you have ${money(cash)}.`
                  : `Cash after this buy: ${money(cash - cost)}`}
            </ThemedText>
          </Card>
        </RiseIn>
      </ScrollView>

      {/* Inside the screen, so the quote and chart stay mounted and readable behind it. */}
      {gate && (
        <GateSheet
          feature="trade"
          refusal={gate}
          visible
          onDismiss={() => setGate(null)}
          onSeePro={() => {
            setGate(null);
            router.push('/onboarding?step=paywall');
          }}
          onWhyNotFree={() => {
            setGate(null);
            router.push('/why-not-free');
          }}
        />
      )}
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
  qtyNum: { fontSize: FontSize.headingLg, minWidth: 34, textAlign: 'center', fontVariant: ['tabular-nums'] },
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
  // Bloom puts the lock INSIDE the control, to the right of its label. Row layout, full contrast —
  // deliberately no opacity change: this control works, it just answers differently.
  locked: { flexDirection: 'row', gap: Spacing.two },
});
