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
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { AskAtlasButton } from '@/components/ask-atlas';
import { Movers } from '@/components/movers';
import { PortfolioChart } from '@/components/portfolio-chart';
import { ThemedText } from '@/components/themed-text';
import { NewsGallery } from '@/components/news-gallery';
import { UIcon } from '@/components/ui-icon';
import { BottomTabInset, Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ALL_SYMS, money, priceOf, shares, STOCKS } from '@/lib/stocks';
import { useApp } from '@/lib/store';
import { IDEAS_DISCLAIMER, ideaCourseTitle, tradeIdeas } from '@/lib/trade-ideas';
import { NumberRollup } from '@/shared/motion/number-rollup';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

/** Apple Stocks 100193 puts the change in a FILLED pill, not coloured text: at row density a
 *  coloured number is easy to miss and the pill is the only saturated thing in the row. */
/** True when this position has no usable cost basis — a holding that predates the tracking. */
const avgNull = (paid: number | undefined, held: number) => paid === undefined || paid <= 0 || !(held > 0);

function Change({ v }: { v: number }) {
  const theme = useTheme();
  const up = v >= 0;
  return (
    <View style={[styles.chgPill, { backgroundColor: up ? theme.success : theme.destructive }]}>
      <ThemedText type="smallBold" style={{ color: '#FFFFFF', fontSize: FontSize.caption }}>
        {up ? '+' : ''}{v.toFixed(1)}%
      </ThemedText>
    </View>
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
      accessibilityLabel={[
        stock.name,
        sub,
        right,
        change === null ? '' : `${change >= 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(1)} percent`,
      ].filter(Boolean).join(', ')}
    >
      {/* TICKER AS IDENTITY, not a lettered tile. Apple Stocks 100193 leads every row with the
          symbol in bold and the company name beneath it in grey; the purple lettered squares here
          were TickerLogo's FALLBACK art standing in for logos that never load, so the strongest
          element in each row carried the least information. */}
      <View style={[styles.row, !last && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
        <View style={{ flex: 1 }}>
          <ThemedText type="bodyMedium">{sym}</ThemedText>
          {/* `sub` is empty for watchlist rows: the ticker is already the row's title, and
              "Apple · AAPL" said it twice. */}
          <ThemedText type="small" themeColor="mutedForeground" numberOfLines={1}>
            {sub ? `${stock.name} · ${sub}` : stock.name}
          </ThemedText>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 3 }}>
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
  const earned = useApp((s) => s.rewardsEarned);
  const total = useApp((s) => s.portfolioValue());
  const watchlist = useApp((s) => s.watchlist);

  const held = Object.keys(positions).filter((s) => (positions[s] ?? 0) > 0);
  // Derived, never stored — same contract as quests. Recomputes whenever cash, positions or the
  // watchlist move, which is exactly when an observation about them could stop being true.
  const ideas = tradeIdeas({ cash, positions, watchlist, total });
  // Followed tickers the user does not already hold. NOT "everything minus your positions" —
  // that was a list nobody chose, labelled as though they had.
  const watch = watchlist.filter((s) => !held.includes(s) && STOCKS[s]);
  // Nothing followed yet: offer the seeded set as SUGGESTIONS, named as suggestions.
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

        {/*
          * NO CARD. Apple Stocks (100193/100195) and the brokerage family it belongs to put the
          * number straight onto the background — a rounded elevated container around the one thing
          * the screen is about adds a border, a shadow and 32pt of padding to say "this is
          * important", which the 44pt number already says. The old hero stacked SEVEN elements
          * before any content: label, value, delta, chart, six range buttons, divider, cash.
          */}
        <RiseIn delay={70}>
          <View style={styles.hero}>
            <View style={styles.amountRow}>
              <NumberRollup value={Math.floor(total)} prefix="$" type="display" style={{ fontSize: FontSize.displayLg }} />
              <ThemedText type="heading" themeColor="mutedForeground" style={{ fontSize: FontSize.subhead, marginBottom: 3 }}>
                .{total.toFixed(2).split('.')[1]}
              </ThemedText>
            </View>
            <PortfolioChart />
            <View style={styles.cashRow}>
              <ThemedText type="small" themeColor="mutedForeground">
                Cash <ThemedText type="smallBold" style={{ color: theme.text }}>{money(cash)}</ThemedText>
              </ThemedText>
              {earned > 0 && (
                <ThemedText type="small" themeColor="mutedForeground">
                  Earned <ThemedText type="smallBold" style={{ color: theme.text }}>{money(earned)}</ThemedText>
                </ThemedText>
              )}
            </View>
          </View>
        </RiseIn>

        {/*
          * TWO TEXT LINKS, NOT THREE CHUNKY TILES. The old row was three equal-weight squares —
          * News, Options and Search — where Search DUPLICATED the search control already in the
          * header two inches above it. Same action, twice, one of them a 90pt box. Apple Stocks
          * carries no such grid at all; the brokerage family keeps navigation quiet so the numbers
          * are the only thing shouting.
          */}
        <RiseIn delay={110}>
          <View style={styles.actions}>
            {([{ label: 'News', to: '/news' }, { label: 'Options', to: '/options' }] as const).map((a) => (
              <SpringPressable
                key={a.label}
                haptic={false}
                scaleTo={0.96}
                onPress={() => router.push(a.to)}
                accessibilityRole="button"
                accessibilityLabel={a.label}
              >
                <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>{a.label}</ThemedText>
              </SpringPressable>
            ))}
          </View>
        </RiseIn>

        <NewsGallery symbols={held} delay={130} />

        {held.length > 0 && (
          <RiseIn delay={150}>
            <ThemedText type="label" themeColor="mutedForeground" style={styles.sectionLabel}>Your positions</ThemedText>
            <View style={styles.list}>
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
                const paid = costBasis[sym];
                const avg = paid !== undefined && paid > 0 && positions[sym] > 0 ? paid / positions[sym] : null;
                /* The PRICE PER SHARE goes on every row, basis or not. Seeking Alpha 285918 gives
                   it a whole column and Investing.com 211291 prints "BUY 100 @ 3,980.51"; it is the
                   number that makes a position's value explicable. It also means a row without a
                   recorded cost basis still says something, instead of reading half-empty next to
                   the SUGGESTED rows that do carry a pill. */
                const qty = `${shares(positions[sym])} ${positions[sym] === 1 ? 'share' : 'shares'}`;
                const sub = avgNull(costBasis[sym], positions[sym])
                  ? `${qty} · ${money(priceOf(sym))}`
                  : `${qty} · avg ${money((costBasis[sym] as number) / positions[sym])}`;
                return (
                  <Row
                    key={sym}
                    sym={sym}
                    sub={sub}
                    right={money(positions[sym] * priceOf(sym))}
                    change={avg === null ? null : ((priceOf(sym) - avg) / avg) * 100}
                    last={i === held.length - 1}
                  />
                );
              })}
            </View>
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
            <View style={styles.list}>
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
            </View>
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
            {watch.length > 0 ? 'Watchlist' : held.length > 0 ? 'Suggested' : 'Pick your first stock'}
          </ThemedText>
          <View style={styles.list}>
            {(watch.length > 0 ? watch : suggestions).map((sym, i, arr) => (
              <Row key={sym} sym={sym} sub="" right={STOCKS[sym].price} change={STOCKS[sym].chg} last={i === arr.length - 1} />
            ))}
          </View>
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
  // No card means no divider to sit under: the cash line reads as a caption on the hero, which is
  // what it is. Left-aligned with the number rather than pushed to the far edge.
  hero: { paddingHorizontal: Spacing.one },
  cashRow: { flexDirection: 'row', gap: Spacing.three, marginTop: Spacing.two + 2 },
  chgPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.chipSm },
  idea: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two + 2, gap: 3 },
  ideaBody: { lineHeight: 19 },
  ideaLink: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  disclaimer: { marginTop: Spacing.one + 2, paddingHorizontal: Spacing.one, fontSize: FontSize.label, lineHeight: 15 },
  sectionLabel: { marginBottom: Spacing.two, marginTop: Spacing.three },
  actions: { flexDirection: 'row', gap: Spacing.four, paddingHorizontal: Spacing.one },
  // Rows sit on the background with hairlines between them, the way Apple Stocks 100193 does.
  // A rounded card per list, now that the hero has none, read as two different screens stacked.
  list: { paddingHorizontal: Spacing.one },
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
