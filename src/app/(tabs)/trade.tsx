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
import { TickerLogo } from '@/components/ticker-logo';
import { UIcon } from '@/components/ui-icon';
import { Card } from '@/components/ui/card';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ALL_SYMS, money, priceOf, shares, STOCKS } from '@/lib/stocks';
import { useApp } from '@/lib/store';
import { NumberRollup } from '@/shared/motion/number-rollup';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

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

function Row({ sym, right, sub, last }: { sym: string; right: string; sub: string; last: boolean }) {
  const theme = useTheme();
  const stock = STOCKS[sym];
  return (
    <SpringPressable
      onPress={() => router.push(`/stock/${sym}`)}
      accessibilityRole="button"
      accessibilityLabel={`${stock.name}, ${right}`}
    >
      <View style={[styles.row, !last && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
        <Ticker sym={sym} />
        <View style={{ flex: 1 }}>
          <ThemedText type="bodyMedium">{stock.name}</ThemedText>
          <ThemedText type="small" themeColor="mutedForeground">{sub}</ThemedText>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <ThemedText type="bodyMedium">{right}</ThemedText>
          <Change v={stock.chg} />
        </View>
      </View>
    </SpringPressable>
  );
}

export default function Trade() {
  const theme = useTheme();
  const cash = useApp((s) => s.cash);
  const positions = useApp((s) => s.positions);
  const total = useApp((s) => s.portfolioValue());
  const watchlist = useApp((s) => s.watchlist);

  const held = Object.keys(positions).filter((s) => (positions[s] ?? 0) > 0);
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
              <ThemedText type="title" style={{ fontSize: 22 }}>Trade</ThemedText>
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
              <NumberRollup value={Math.floor(total)} prefix="$" type="display" style={{ fontSize: 34 }} />
              <ThemedText type="heading" themeColor="mutedForeground" style={{ fontSize: 18, marginBottom: 3 }}>
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
            header from the watchlist. */}
        <RiseIn delay={110}>
          <View style={styles.actions}>
            {(
              [
                { icon: 'feed', label: 'News', to: '/news' },
                { icon: 'bolt', label: 'Options', to: '/options' },
                { icon: 'search', label: 'Search', to: '/search' },
              ] as const
            ).map((a) => (
              <SpringPressable
                key={a.label}
                haptic={false}
                scaleTo={0.95}
                onPress={() => router.push(a.to)}
                accessibilityRole="button"
                accessibilityLabel={a.label === 'Search' ? 'Search every listed stock' : a.label}
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

        {held.length > 0 && (
          <RiseIn delay={150}>
            <ThemedText type="label" themeColor="mutedForeground" style={styles.sectionLabel}>Your positions</ThemedText>
            <Card padded={false}>
              {held.map((sym, i) => (
                <Row
                  key={sym}
                  sym={sym}
                  sub={`${shares(positions[sym])} ${positions[sym] === 1 ? 'share' : 'shares'}`}
                  right={money(positions[sym] * priceOf(sym))}
                  last={i === held.length - 1}
                />
              ))}
            </Card>
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
          <Card padded={false}>
            {(watch.length > 0 ? watch : suggestions).map((sym, i, arr) => (
              <Row key={sym} sym={sym} sub={sym} right={STOCKS[sym].price} last={i === arr.length - 1} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.three,
    paddingTop: Spacing.two + 2,
  },
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
