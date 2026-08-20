/**
 * Trade — paper trading, backed by real state.
 *
 * WHAT THIS SCREEN USED TO BE: a $104,237.55 portfolio card, a "+$1,284 (1.24%) today" delta, and
 * a hand-drawn bezier posing as a chart — none of it connected to anything. Home's own docblock
 * records that the very same $104,237.55 card was deleted from Home for being "entirely invented";
 * it simply survived here. Two of the three segments were "coming soon".
 *
 * Every number below now derives from `cash` + `positions` in the store, which only `buy()` and
 * `sell()` can change. If the user has done nothing, it says so instead of inventing a balance.
 *
 * Structure from Investing.com (app 1171, $450k/mo), the one Finance app in the $250–750k cohort:
 *   - a value summary card above everything else
 *   - holdings and watchlist as separate labelled lists
 *   - each row: name + ticker on the left, price + change on the right
 *
 * NOT copied: "Daily P/L". Investing.com can show it because it has price history; we have static
 * quotes, so a daily number would be fabricated. "Return" against the starting balance is the
 * honest equivalent and is exactly as useful for teaching.
 *
 * The chart is gone for the same reason — a line needs a series, and there isn't one.
 */
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { AskAtlasButton } from '@/components/ask-atlas';
import { Movers } from '@/components/movers';
import { PortfolioChart } from '@/components/portfolio-chart';
import { ThemedText } from '@/components/themed-text';
import { TickerLogo } from '@/components/ticker-logo';
import { NewsGallery } from '@/components/news-gallery';
import { UIcon } from '@/components/ui-icon';
import { Card } from '@/components/ui/card';
import { BottomTabInset, Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ALL_SYMS, money, priceOf, shares, STOCKS } from '@/lib/stocks';
import { useApp } from '@/lib/store';
import { IDEAS_DISCLAIMER, ideaCourseTitle, tradeIdeas } from '@/lib/trade-ideas';
import { NumberRollup } from '@/shared/motion/number-rollup';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { getMarks } from '@/lib/market';

/** Kept as a name so the row markup reads the same; the mark itself is now a real logo with the
 *  lettered tile as its floor. */
const Ticker = ({ sym }: { sym: string }) => <TickerLogo sym={sym} size={44} />;

function Change({ v }: { v: number }) {
  const theme = useTheme();
  const up = v >= 0;
  return (
    <ThemedText type="smallBold" style={{ color: up ? theme.success : theme.destructive }}>
      {up ? '+' : ''}{v.toFixed(1)}%
    </ThemedText>
  );
}

/*
 * `change` IS PASSED IN, never derived from STOCKS here. This row serves two lists that mean
 * different things by a percentage, and it used to render `STOCKS[sym].chg` for both:
 *
 *   watchlist  -> the STOCK moved 3.1%          correct
 *   positions  -> "you are up 3.1%"             FALSE, and identical for every user
 *
 * NVDA showed +3.1% to somebody who had just bought it at the price it still trades at, whose real
 * return was 0.0%. Same class as §22 C100 — a number the user reads as theirs, computed from
 * something else. `null` renders no percentage at all, which is what a position with no recorded
 * cost basis honestly has.
 */
function Row({ sym, right, sub, last, change }: { sym: string; right: string; sub: string; last: boolean; change: number | null }) {
  const theme = useTheme();
  const stock = STOCKS[sym];
  return (
    <SpringPressable
      onPress={() => router.push(`/stock/${sym}`)}
      accessibilityRole="button"
      /* The row collapses to ONE a11y element, so its label has to carry everything the row shows.
         It used to read "NVIDIA, $3,552.80" — no holding size, no cost basis, no performance, which
         is most of the row. Same class as the bare "3" the streak pills announced. */
      accessibilityLabel={`${stock.name}, ${sub}, ${right}${change === null ? '' : `, ${change >= 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(1)} percent`}`}
    >
      <View style={[styles.row, !last && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
        <Ticker sym={sym} />
        <View style={{ flex: 1 }}>
          <ThemedText type="bodyMedium">{stock.name}</ThemedText>
          <ThemedText type="small" themeColor="mutedForeground">{sub}</ThemedText>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <ThemedText type="bodyMedium">{right}</ThemedText>
          {change !== null && <Change v={change} />}
        </View>
      </View>
    </SpringPressable>
  );
}

export default function Trade() {
  const theme = useTheme();
  const cash = useApp((s) => s.cash);
  const positions = useApp((s) => s.positions);
  const costBasis = useApp((s) => s.costBasis);
  const derivatives = useApp((s) => s.derivatives);
  const total = useApp((s) => s.portfolioValue());
  const watchlist = useApp((s) => s.watchlist);

  const held = Object.keys(positions).filter((s) => (positions[s] ?? 0) > 0);
  // Derived, never stored — same contract as quests. Recomputes whenever cash, positions or the
  // watchlist move, which is exactly when an observation about them could stop being true.
  const ideas = tradeIdeas({ cash, positions, watchlist, total });
  // Followed tickers the user does not already hold. NOT "everything minus your positions" —
  // that was a list nobody chose, labelled as though they had.
  const watch = watchlist.filter((s) => !held.includes(s) && STOCKS[s]);

  /*
   * PRICE THE SCREEN. Without this the Trade tab fetched nothing at all, so `priceOf` fell
   * through markOr() to the hardcoded table in stocks.ts for every holding, watch row and the
   * portfolio total on top of them.
   *
   * MEASURED 2026-08-20 against the real previous close: NVDA listed at $1,184.00 against an
   * actual $217.56, GOOGL at $182.11 against $344.72, AAPL at $228.50 against $316.83. The
   * twelve-share NVDA position rendered $14,208 where the market said $2,611. That is not a
   * stale-looking number, it is a portfolio total nobody could act on.
   *
   * ONE call regardless of how many tickers are on screen -- grouped daily bars cover the whole
   * market, which is the only shape that fits a five-per-minute ceiling. Seven per-symbol quotes
   * would reproduce the burst that caused the logo 429s.
   *
   * `setLoaded` exists to re-render: getMarks writes into the module-level marks map, which
   * `priceOf` reads during render, so without a state write the screen keeps showing the
   * fallback until something unrelated re-renders it. Same mechanism stock/[sym].tsx documents.
   * A failure leaves the previous marks standing rather than clearing them -- safe() returns
   * null and the fallback is still better than blank.
   */
  const [, setPriced] = useState(0);
  useEffect(() => {
    const syms = [...new Set([...held, ...watch, ...Object.keys(STOCKS)])];
    if (!syms.length) return;
    let cancelled = false;
    getMarks(syms)
      .then((r) => {
        if (!cancelled && r?.count) setPriced((n) => n + 1);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // Deliberately mount-only: prices move slower than this screen re-renders, and refetching on
    // every holdings change would spend the rate limit on a number that did not move.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /*
   * EVERY STOCK YOU DO NOT ALREADY HAVE, in table order. No ranking, no scoring, no curation — which
   * is why the section is no longer headed "Suggested". A finance app aimed at 18-25s labelling an
   * unranked list "Suggested" implies a recommendation it is not making and cannot back (§0.4), and
   * is the kind of implied advice a reviewer is entitled to ask about. If real suggestion logic ever
   * ships, the label can earn its old name back — this is the line that would have to change first.
   */
  const suggestions = ALL_SYMS.filter((s) => !held.includes(s) && !watchlist.includes(s));
  // The change figure now lives ENTIRELY in PortfolioChart, where it is range-aware. The card used
  // to print its own static "since you started" line directly above the chart's range line — the
  // same fact stated twice, disagreeing about scope. One component owns it.

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground glow={false} starCount={35} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <RiseIn>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <ThemedText type="title" style={{ fontSize: FontSize.titleSm }}>Trade</ThemedText>
              {/* "Practice with $10,000. No real money." stated the rules and nothing else. This
                  says what the user GETS. */}
              <ThemedText type="small" themeColor="mutedForeground">
                Build a real portfolio. Risk nothing.
              </ThemedText>
            </View>
            <SpringPressable
              haptic={false}
              onPress={() => router.push('/search')}
              accessibilityRole="button"
              accessibilityLabel="Search stocks"
            >
              <View style={[styles.round, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <UIcon name="search" size={19} color={theme.mutedForeground} />
              </View>
            </SpringPressable>
            <AskAtlasButton topic="Trading" />
          </View>
        </RiseIn>

        <RiseIn delay={70}>
          <Card elevated>
            <ThemedText type="label" themeColor="mutedForeground">Portfolio value</ThemedText>
            <View style={styles.amountRow}>
              {/* Capped: displayLg is 34pt, which reaches ~106pt at AX5, and "$10,000" then needs
                  roughly 450pt inside a ~330pt card — the frame showed it cut to "$10,0" with the
                  rest pushed out of the card. NumberRollup spreads its props into ThemedText, so
                  the cap forwards. 1.6 keeps the hero number hero-sized and inside its box. */}
              <NumberRollup value={Math.floor(total)} prefix="$" type="display" maxFontSizeMultiplier={1.6} style={{ fontSize: FontSize.displayLg }} />
              <ThemedText type="heading" themeColor="mutedForeground" style={{ fontSize: FontSize.subhead, marginBottom: 3 }}>
                .{total.toFixed(2).split('.')[1]}
              </ThemedText>
            </View>
            <PortfolioChart />
            <View style={[styles.cashRow, { borderTopColor: theme.border }]}>
              <ThemedText type="small" themeColor="mutedForeground">Cash available</ThemedText>
              <ThemedText type="smallBold">{money(cash)}</ThemedText>
            </View>
          </Card>
        </RiseIn>

        {/* Navigation, grouped and horizontal. As three stacked full-width pills between a
            section label and its list, these read as list items and orphaned the WATCHLIST
            header from the watchlist.

            SEARCH WAS REMOVED FROM THIS ROW because it was a genuine duplicate: the round search
            button in the header above pushes '/search', and this tile pushed '/search' too --
            the same destination twice, about 90pt apart on the same screen.

            NEWS STAYS, and the reasoning is worth recording because the opposite was assumed.
            It looks redundant against the NewsGallery directly below it, but they are not the
            same content: news.tsx with no `sym` is MARKET-WIDE ("What moved, and why"), while
            NewsGallery reads `const scope = symbols[0]` and shows at most eight articles about
            your FIRST HOLDING. Removing the tile would delete the only route to market-wide news
            on this screen. Verified in source before touching it, not inferred from the layout. */}
        <RiseIn delay={110}>
          <View style={styles.actions}>
            {(
              [
                { icon: 'feed', label: 'News', to: '/news' },
                { icon: 'bolt', label: 'Options', to: '/options' },
              ] as const
            ).map((a) => (
              <SpringPressable
                key={a.label}
                haptic={false}
                scaleTo={0.95}
                onPress={() => router.push(a.to)}
                accessibilityRole="button"
                accessibilityLabel={a.label}
                style={{ flex: 1 }}
              >
                <View style={[styles.action, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <UIcon name={a.icon} size={19} color={theme.iconLilac} />
                  <ThemedText type="smallBold">{a.label}</ThemedText>
                </View>
              </SpringPressable>
            ))}
          </View>
        </RiseIn>

        {/* UNIT 10. Directly below the action row per §10b. Renders NOTHING when there are no
            articles — no skeleton, no placeholder headlines (§0.4). Scoped to the first holding
            when there is one, which is Investing.com's "Related News" variant. */}
        <NewsGallery symbols={held} delay={130} />

        {held.length > 0 && (
          <RiseIn delay={150}>
            <ThemedText type="label" themeColor="mutedForeground" style={styles.sectionLabel}>Your positions</ThemedText>
            <Card padded={false}>
              {held.map((sym, i) => {
                /*
                 * COST BASIS ON THE ROW. Audit finding (FINDINGS.md, TRADE, 3/4): a position shows
                 * what you PAID, not only what it is worth — Investing.com prints "BUY 100 @
                 * 3,980.51", Seeking Alpha a price column. For a product whose purpose is teaching,
                 * the entry price is the number that makes a percentage mean anything.
                 *
                 * Null for positions opened before costBasis existed. Those show shares only and no
                 * percentage, which is honest: nothing was recorded to compare against.
                 */
                /*
                 * THE BASIS AND THIS PERCENTAGE COME FROM ONE PRICE SOURCE, and that is load-bearing.
                 * `stock/[sym].tsx` used to execute at `live?.price ?? priceOf(sym)` while this row
                 * values the position with `priceOf()`, so a cost basis was booked in one currency
                 * and the gain computed against another — invisible only because /api/market 503s
                 * without the four API keys. Setting POLYGON_API_KEY would have armed it.
                 *
                 * That page now trades at `priceOf()` too, and PHASE 16 (2026-08-13) made `priceOf`
                 * itself live-backed — so valuation and execution went live in the SAME commit, which
                 * is the condition this comment set. Both still read one function.
                 *
                 * WHAT PHASE 16 DOES NOT FIX: a basis BOOKED BEFORE IT LANDED was paid in static
                 * dollars and is now valued in live ones. A seeded NVDA position shows a basis near
                 * $1,184/share against a live mark near $225 — an ~81% loss that never happened.
                 * That is this exact percentage becoming fiction, in the one direction the phase
                 * could not prevent. It is tolerable ONLY because no production or TestFlight build
                 * has ever shipped (§11), so no real user holds a static-price basis. Dev installs
                 * must reset the store rather than trust the number. If a build ever ships before a
                 * migration exists, this needs one.
                 */
                const paid = costBasis[sym];
                const avg = paid !== undefined && paid > 0 && positions[sym] > 0 ? paid / positions[sym] : null;
                const sub = `${shares(positions[sym])} ${positions[sym] === 1 ? 'share' : 'shares'}`;
                return (
                  <Row
                    key={sym}
                    sym={sym}
                    sub={avg === null ? sub : `${sub} · avg ${money(avg)}`}
                    right={money(positions[sym] * priceOf(sym))}
                    change={avg === null ? null : ((priceOf(sym) - avg) / avg) * 100}
                    last={i === held.length - 1}
                  />
                );
              })}
            </Card>
          </RiseIn>
        )}

        {/*
          * OPEN CONTRACTS. Not a layout question — an ARITHMETIC one. `portfolioValue()` counts open
          * option premium (§22 C100 fixed the chart to agree with it), so a contract is already
          * inside the headline. With one NVDA call open the screen read:
          *
          *     cash $5,666.94 + positions $3,555.28 = $9,222.22   displayed $10,003.28
          *
          * $781.06 — 7.8% of the portfolio — in the total and named nowhere on the screen. A headline
          * its own visible parts contradict is the C100 defect seen from the other side.
          *
          * DAYS IS THE TERM AT PURCHASE, NOT A COUNTDOWN. `openDerivative` records no timestamp, so
          * time remaining is not computable from anything persisted. "30-day" rather than "30 days
          * left", which would be the C109 mistake: true on the first day and wrong ever after. An
          * options desk that cannot say when a contract expires is worth Unit 16's attention.
          */}
        {derivatives.length > 0 && (
          <RiseIn delay={150}>
            <ThemedText type="label" themeColor="mutedForeground" style={styles.sectionLabel}>Open contracts</ThemedText>
            <Card padded={false}>
              {derivatives.map((d, i) => (
                <Row
                  key={d.id}
                  sym={d.sym}
                  /* The term is OMITTED at 0 rather than printed. options.tsx passes
                     `days: picked?.days ?? 0` when the chain has not resolved an expiry, and
                     "0-day" is not a term any contract has — a made-up number on the money screen
                     is the thing this whole section exists to stop. */
                  sub={[d.kind === 'call' ? 'Call' : 'Put', money(d.strike), d.days > 0 ? `${String(d.days)}-day` : '']
                    .filter(Boolean)
                    .join(' · ')}
                  right={money(d.premium)}
                  change={null}
                  last={i === derivatives.length - 1}
                />
              ))}
            </Card>
          </RiseIn>
        )}

        {/*
          * IDEAS TO PRACTISE — the learning surface the Trade tab was promised and did not have.
          *
          * Placed directly UNDER the positions on purpose: every idea quotes a number ("NVDA is
          * 71% of your portfolio") that the user can check against the list immediately above it.
          * An observation the reader cannot verify on the same screen is just an assertion.
          *
          * The disclaimer is part of the section, not a footnote elsewhere — Investing.com's
          * WarrenAI `211319` keeps "never financial advice" on the surface that makes the
          * suggestion, and that is the only place it does any work. See lib/trade-ideas.ts for why
          * there is deliberately no Long/Short stance chip.
          */}
        {ideas.length > 0 && (
          <RiseIn delay={185}>
            <ThemedText type="label" themeColor="mutedForeground" style={styles.sectionLabel}>
              Ideas to practise
            </ThemedText>
            <Card padded={false}>
              {ideas.map((idea, i) => (
                <SpringPressable
                  key={idea.id}
                  haptic={false}
                  scaleTo={0.98}
                  onPress={() => router.push('/courses')}
                  accessibilityRole="button"
                  accessibilityLabel={`${idea.concept}. ${idea.detail} Opens ${ideaCourseTitle(idea.courseId)}.`}
                >
                  <View
                    style={[
                      styles.idea,
                      i < ideas.length - 1 && {
                        borderBottomColor: theme.border,
                        borderBottomWidth: StyleSheet.hairlineWidth,
                      },
                    ]}
                  >
                    <ThemedText type="label" style={{ color: theme.iconLilac }}>
                      {idea.concept.toUpperCase()}
                    </ThemedText>
                    <ThemedText type="small" style={styles.ideaBody}>{idea.detail}</ThemedText>
                    <View style={styles.ideaLink}>
                      <ThemedText type="smallBold" themeColor="mutedForeground">
                        {ideaCourseTitle(idea.courseId)}
                      </ThemedText>
                      <UIcon name="arrowRight" size={13} color={theme.mutedForeground} />
                    </View>
                  </View>
                </SpringPressable>
              ))}
            </Card>
            <ThemedText type="small" themeColor="mutedForeground" style={styles.disclaimer}>
              {IDEAS_DISCLAIMER}
            </ThemedText>
          </RiseIn>
        )}

        {/* Movers sit BELOW your own holdings and watchlist: what you own is why you opened the
            tab; the market is context. Investing.com leads with movers because it is a market
            tracker — Euphoria is a portfolio you are learning to run. */}
        <RiseIn delay={200}>
          <Movers />
        </RiseIn>

        <RiseIn delay={held.length > 0 ? 170 : 120}>
          <ThemedText type="label" themeColor="mutedForeground" style={styles.sectionLabel}>
            {watch.length > 0 ? 'Watchlist' : held.length > 0 ? 'More stocks' : 'Pick your first stock'}
          </ThemedText>
          <Card padded={false}>
            {(watch.length > 0 ? watch : suggestions).map((sym, i, arr) => (
              <Row key={sym} sym={sym} sub={sym} right={STOCKS[sym].price} change={STOCKS[sym].chg} last={i === arr.length - 1} />
            ))}
          </Card>
        </RiseIn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four, gap: Spacing.three },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  amountRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, marginTop: Spacing.one },
  cashRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.two,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.three,
    paddingTop: Spacing.two + 2,
  },
  idea: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two + 2, gap: 3 },
  ideaBody: { lineHeight: 19 },
  ideaLink: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  disclaimer: { marginTop: Spacing.one + 2, paddingHorizontal: Spacing.one, fontSize: FontSize.label, lineHeight: 15 },
  sectionLabel: { marginBottom: Spacing.two },
  actions: { flexDirection: 'row', gap: Spacing.two },
  action: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4, padding: Spacing.three },
  round: { width: 40, height: 40, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    height: 46,
    marginBottom: Spacing.two,
  },
  ticker: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
});
