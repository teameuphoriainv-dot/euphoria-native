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
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { AskAtlasRow } from '@/components/ask-atlas';
import { KeyStats } from '@/components/key-stats';
import { PriceChart } from '@/components/price-chart';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { SlabButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BottomTabInset, Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getMarks } from '@/lib/market';
import { markDateOf } from '@/lib/marks';
import { money, priceOf, shares, STOCKS } from '@/lib/stocks';
import { RetryNotice } from '@/components/retry-notice';
import { Ev, track } from '@/lib/analytics';
import { useApp } from '@/lib/store';
import { entitled, useTier, type Refusal } from '@/lib/entitlement';
import { GateSheet } from '@/components/gate-sheet';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Label a previous-session close by date, and by age once it is genuinely stale.
 *
 * Two days is the threshold because a Monday morning legitimately shows Friday's close, so
 * "1 day ago" would cry wolf every week. Formatted from a fixed month list rather than
 * toLocaleDateString: unpinned locale formatting is already a tracked concern in this repo.
 *
 * Lives at module scope, and is called from the effect rather than during render, because
 * Date.now() in a render body is an impure read -- react-hooks/purity flags it, and rightly:
 * a component that reads the clock while rendering produces a different tree on every pass.
 */
function closeLabel(asOf: number | null | undefined): string | null {
  if (!asOf) return null;
  const d = new Date(asOf);
  const stamp = `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  const days = Math.floor((Date.now() - asOf) / 86_400_000);
  return days >= 2 ? `Previous close · ${stamp} · ${days} days ago` : `Previous close · ${stamp}`;
}

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
  /*
   * The setter is the re-render trigger. `getQuote` records the live mark (Phase 16) and
   * `priceOf` reads that mark during render, so without a state write here the screen would keep
   * rendering the static fallback until something unrelated re-rendered it. Removing this
   * silently reverts the screen to static prices.
   *
   * The VALUE used to be discarded — this read `const [, setLive]` — because nothing needed it.
   * It does now: `asOf` is the only thing that can say WHEN this price is from, and the quote
   * endpoint discarded that field entirely until it was added.
   */
  /*
   * QUOTE FAILURE WAS SILENT, AND SILENT IS THE WRONG FAILURE HERE.
   *
   * getQuote().then() had no .catch(), so a rejected request was an unhandled promise and the
   * screen simply kept rendering `priceOf(sym)` — which, per the comment above, is the STATIC
   * fallback table. The user saw a number that looked live and was not, with nothing to say so.
   *
   * On a trading screen that is a correctness problem rather than a polish one, and it is the
   * same class CARRYOVER already flags about lib/stocks.ts: a stale price makes every position
   * percentage derived from it fiction. Polygon's free tier is 5 requests/minute, so this is a
   * routine path, not a rare one.
   */
  const [quoteErr, setQuoteErr] = useState<string | null>(null);
  /*
   * "PREVIOUS CLOSE", BECAUSE THAT IS WHAT THIS NUMBER ACTUALLY IS.
   *
   * The quote endpoint reads /v2/aggs/ticker/{sym}/prev -- the previous session's aggregate --
   * and until `asOf` was added it returned no timestamp at all, so a price from this morning and
   * one three weeks old rendered identically.
   *
   * COMPUTED IN THE EFFECT, NOT IN RENDER. The first version built this label inline next to
   * `price`, which called Date.now() during render -- an impure read that react-hooks/purity
   * flags, and rightly: a component that reads the clock while rendering produces a different
   * tree on every pass. The clock is read once, when the quote actually lands.
   */
  /*
   * COMPUTED IN THE EFFECT, NOT IN RENDER, for two separate reasons.
   *
   * closeLabel reads Date.now(), and a component that reads the clock while rendering produces a
   * different tree on every pass -- react-hooks/purity flagged exactly that in an earlier version
   * of this line. And markDateOf() is a MODULE read: nothing about it re-renders this screen, so
   * a caption derived from it during render would show whatever the value was on first paint.
   * Both problems disappear once the label is set when the fetch actually lands.
   */
  const [asOfLabel, setAsOfLabel] = useState<string | null>(null);
  /**
   * Set on the first scroll. Gates the requests that first paint does not need.
   *
   * MEASURED 2026-08-20, counting upstream calls per action in market+api.ts: this screen costs
   * marks(1) + chart(1 + 1 page) + stats(2) = FIVE requests against a free tier allowing five per
   * minute. They land together, so the last ones lose -- `stats` returned 429 and the chart
   * rendered "No data for this range" on device.
   *
   * Deferring in TIME would not help: a rolling sixty-second window still sees all five.
   * Deferring until VISIBLE does, because a reader who never scrolls never spends those two
   * requests, and one who does spends them a beat later when the window has room.
   */
  const [belowFold, setBelowFold] = useState(false);
  const [nonce, setNonce] = useState(0);
  const retryQuote = useCallback(() => {
    setQuoteErr(null);
    setNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!sym) return;
    let cancelled = false;
    // Clears a stale error when the dependency changes, before the fetch that may set a new one.
    // React bails out via Object.is when the value is already null, so on the common path this
    // renders nothing -- it is not the cascading render the rule exists to catch. refs/TASK_QUEUE.md
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuoteErr(null);
    /*
     * ONE SHARED CALL, NOT A PER-SYMBOL QUOTE.
     *
     * This used to call getQuote(sym), which spent a request to fetch a price the app very likely
     * already had: getMarks() prices the ENTIRE market in a single grouped request, and `priceOf`
     * reads that same map. So the quote bought nothing but a timestamp.
     *
     * It also cost correctness. /prev and grouped are different endpoints and can sit a session
     * apart -- measured 2026-08-20, NVDA read $216.85 from /prev and $217.56 from grouped -- and
     * because getQuote wrote its result through setMark, the price on the TRADE tab changed
     * depending on whether you had opened this screen. The same ticker showed two numbers.
     *
     * And it cost reliability. MEASURED: a stock screen fires quote + chart + stats + news, and
     * the chart may paginate, so 4-6 requests land at once against a five-per-minute ceiling.
     * The third call back returned 429 and the chart rendered "No data for this range". Dropping
     * the quote returns a request to that budget, and the one it is replaced by is shared with
     * every other screen rather than being spent on this symbol alone.
     */
    getMarks()
      .then((r) => {
        if (cancelled) return;
        /*
         * A NULL RESULT IS NOT A FAILURE HERE. getMarks() resolves null when the marks it already
         * holds are still inside their fifteen-minute window -- it skips a 300KB refetch that
         * would return identical numbers. Treating that as an error would show a retry notice on
         * a screen whose price is perfectly good, which is worse than the request it saved.
         *
         * The real failure signal is having no session date at all: nothing has ever landed.
         */
        const stamped = markDateOf();
        if (!r?.count && !stamped) {
          setQuoteErr('upstream');
          return;
        }
        setAsOfLabel(closeLabel(stamped));
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setQuoteErr(e instanceof Error ? e.message : 'upstream');
      });
    return () => {
      cancelled = true;
    };
  }, [sym, nonce]);

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
   * THERE IS NO "% today" BADGE HERE ANY MORE, and its removal is a correctness fix rather than a
   * layout preference.
   *
   * It rendered `live.changePct`, which `api/market+api.ts` computes from
   * `/v2/aggs/ticker/{sym}/prev` — the PREVIOUS trading day's bar, `(bar.c - bar.o) / bar.o`. So a
   * figure labelled "today" described YESTERDAY's session. Measured on device: `+0.1% today` sitting
   * beside the chart's `+$1.23 (0.55%) today`, a 5x disagreement that read as a rounding problem and
   * was actually two different days.
   *
   * `PriceChart` already renders the change for the SELECTED range with the range named, computed
   * from the very points it draws — so it cannot disagree with the line the user is looking at, and
   * at 1D it says "today" truthfully. One change figure, anchored to visible evidence. §0.4: an
   * absent number is honest, a mislabelled one is not.
   *
   * NOTE for whoever wires a real-time feed: `price` from that same endpoint is `bar.c`, the
   * PREVIOUS CLOSE. The Phase 16 mark is therefore end-of-day on Polygon's free tier — a real market
   * price, but not an intraday one. "Live" in these comments means "from the market", not "to the
   * second".
   */
  const cost = qty * price;
  // `price > 0` is the guard the old comment CLAIMED priceOf's zero already provided. It did not:
  // cost is then 0, `0 <= cash` passes, and an unpriced ticker could be bought for nothing —
  // recording a basis of exactly 0, which is the second door into the partial-basis bug (C113).
  const canBuy = price > 0 && cost <= cash && qty > 0;
  const canSell = price > 0 && held >= qty && qty > 0;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={28} glow={false} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        /* 40pt is deliberately small: it fires on the first real gesture, long before KeyStats
           reaches the viewport, so its data has landed by the time anyone looks at it. */
        onScroll={(e) => {
          if (!belowFold && e.nativeEvent.contentOffset.y > 40) setBelowFold(true);
        }}>
        <SpringPressable haptic={false} onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Back to Trade">
          <UIcon name="chevronLeft" size={22} color={theme.mutedForeground} />
          <ThemedText type="small" themeColor="mutedForeground">Trade</ThemedText>
        </SpringPressable>

        {/* Non-blocking on purpose: the screen still has a chart, a description and a trade
            gate worth reading, so a failed QUOTE must not replace all of it. It only has to
            stop the static fallback price passing itself off as live. */}
        {quoteErr ? <RetryNotice code={quoteErr} onRetry={retryQuote} /> : null}

        <RiseIn>
          <View style={[styles.ticker, { backgroundColor: theme.primary + '1F' }]}>
            <ThemedText type="smallBold" style={{ color: theme.iconLilac, fontSize: FontSize.small }}>{sym}</ThemedText>
          </View>
          <ThemedText type="title" style={{ fontSize: FontSize.titleLg, marginTop: Spacing.two }}>{name}</ThemedText>
          <View style={styles.priceRow}>
            {/*
              * A PRICE MUST NEVER BREAK. At AX5 this 30pt display reached ~94pt against a
              * ~360pt row and wrapped as "$228.5" / "0" — which does not merely look wrong, it
              * reads as a DIFFERENT NUMBER. Someone glancing at it sees $228.5.
              *
              * `numberOfLines={1}` is deliberate here even though this audit has spent most of
              * its time REMOVING such clamps. Everywhere else, wrapping beats truncating. For a
              * price the order reverses: an ellipsis reads as incomplete, a split reads as a
              * wrong figure, and being obviously cut off is safer than being quietly wrong.
              * The 1.6 cap keeps it from reaching the ellipsis in the first place.
              */}
            <ThemedText type="display" maxFontSizeMultiplier={1.6} numberOfLines={1} style={{ fontSize: FontSize.display }}>{price > 0 ? money(price) : '—'}</ThemedText>
          </View>
          {asOfLabel && !quoteErr ? (
            <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 2 }}>{asOfLabel}</ThemedText>
          ) : null}
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
          {/* Gated: KeyStats costs TWO upstream requests and sits below the fold. See onScroll. */}
          {belowFold ? <KeyStats sym={sym} /> : null}
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
                    <SlabButton
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
                    <SlabButton
                      label="Buy"
                      full
                      disabled={!canBuy}
                      onPress={() => {
                        /* buy() is a NO-OP when the order is unaffordable, so the cash delta — not
                           the tap — is what says a trade happened. Guarding on the tap would file a
                           rejected order as engagement. Same shape as lesson.tsx guarding
                           Ev.firstLesson on the completed count actually moving. */
                        const before = useApp.getState().cash;
                        buy(sym, qty, price);
                        if (useApp.getState().cash !== before) track(Ev.tradePlaced, { side: 'buy', symbol: sym, shares: qty });
                      }}
                    />
                  </View>
                  <SpringPressable
                    haptic={false}
                    onPress={() => {
                      if (!canSell) return;
                      // applySell clamps to what is actually held, so a sell can also be a no-op.
                      const before = useApp.getState().cash;
                      sell(sym, qty, price);
                      if (useApp.getState().cash !== before) track(Ev.tradePlaced, { side: 'sell', symbol: sym, shares: qty });
                    }}
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
                  ? `Not enough cash. You have ${money(cash)}.`
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
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.one },
  posCard: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.three },
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
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.two },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  step: { width: 38, height: 38, borderRadius: 19, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  qtyNum: { fontSize: FontSize.headingLg, minWidth: 34, textAlign: 'center', fontVariant: ['tabular-nums'] },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.two,
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
