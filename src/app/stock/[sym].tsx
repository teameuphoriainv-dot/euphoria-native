/**
 * Stock detail — opened from a Trade holdings/watchlist row. Ticker + price + day change,
 * a mini chart, position info (if held), a plain-English blurb, and a paper-trade CTA.
 * Mock data from lib/stocks.ts until Phase 16 wires live quotes.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { AnimatedLineChart } from '@/components/animated-chart';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { GradientButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { STOCKS } from '@/lib/stocks';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

export default function StockDetail() {
  const theme = useTheme();
  const { sym } = useLocalSearchParams<{ sym: string }>();
  const stock = sym ? STOCKS[sym] : undefined;

  if (!stock) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ThemedText type="heading">Stock not found</ThemedText>
        <SpringPressable onPress={() => router.back()} style={{ marginTop: Spacing.three }}>
          <ThemedText type="bodyMedium" style={{ color: theme.iconLilac }}>Back</ThemedText>
        </SpringPressable>
      </SafeAreaView>
    );
  }

  const up = stock.chg >= 0;
  const line = up ? theme.success : theme.destructive;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={28} glow={false} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SpringPressable haptic={false} onPress={() => router.back()} style={styles.back}>
          <UIcon name="chevronLeft" size={22} color={theme.mutedForeground} />
          <ThemedText type="small" themeColor="mutedForeground">Trade</ThemedText>
        </SpringPressable>

        <RiseIn>
          <View style={[styles.ticker, { backgroundColor: theme.primary + '1F' }]}>
            <ThemedText type="smallBold" style={{ color: theme.iconLilac, fontSize: 13 }}>{stock.sym}</ThemedText>
          </View>
          <ThemedText type="title" style={{ fontSize: 26, marginTop: Spacing.two }}>{stock.name}</ThemedText>
          <View style={styles.priceRow}>
            <ThemedText type="display" style={{ fontSize: 30 }}>{stock.price}</ThemedText>
            <ThemedText type="heading" style={{ color: line, fontSize: 16 }}>{up ? '+' : ''}{stock.chg.toFixed(1)}% today</ThemedText>
          </View>
        </RiseIn>

        <RiseIn delay={80}>
          <View style={{ marginTop: Spacing.three }}>
            <AnimatedLineChart
              line="M0 70 C40 64 70 58 110 60 C150 62 175 40 210 36 C250 31 280 20 320 14"
              area="M0 70 C40 64 70 58 110 60 C150 62 175 40 210 36 C250 31 280 20 320 14 L320 90 L0 90 Z"
              color={line}
              gradientId="sarea"
              height={90}
              viewBox="0 0 320 90"
            />
          </View>
        </RiseIn>

        {stock.qty && (
          <RiseIn delay={140}>
            <Card style={styles.posCard}>
              <View>
                <ThemedText type="label" themeColor="mutedForeground">Your position</ThemedText>
                <ThemedText type="heading" style={{ fontSize: 18, marginTop: 2 }}>{stock.qty}</ThemedText>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <ThemedText type="label" themeColor="mutedForeground">Value</ThemedText>
                <ThemedText type="heading" style={{ fontSize: 18, marginTop: 2 }}>{stock.value}</ThemedText>
              </View>
            </Card>
          </RiseIn>
        )}

        <RiseIn delay={200}>
          <ThemedText type="label" themeColor="mutedForeground" style={{ marginTop: Spacing.four, marginBottom: Spacing.two }}>About</ThemedText>
          <ThemedText type="body" themeColor="mutedForeground" style={{ lineHeight: 23 }}>{stock.blurb}</ThemedText>
        </RiseIn>

        <RiseIn delay={260}>
          <GradientButton label="Practice a trade" onPress={() => router.push('/trade')} style={{ marginTop: Spacing.four }} />
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
});
