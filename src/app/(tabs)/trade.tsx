/**
 * Trade — paper-trading dashboard (euphoriaweb Trade.tsx). Portfolio value + day change,
 * Trade/Research/Compete segments, holdings + watchlist. Mock market data until Phase 4
 * wires live quotes + a native chart.
 */
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';

import { AmbientBackground } from '@/components/ambient-background';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { NumberRollup } from '@/shared/motion/number-rollup';
import { Card } from '@/components/ui/card';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

const SEGMENTS = ['Trade', 'Research', 'Compete'] as const;

const HOLDINGS = [
  { sym: 'NVDA', name: 'NVIDIA', qty: '12 sh', value: '$14,208', chg: 3.1 },
  { sym: 'AAPL', name: 'Apple', qty: '40 sh', value: '$9,140', chg: 0.8 },
  { sym: 'TSLA', name: 'Tesla', qty: '18 sh', value: '$4,392', chg: -1.7 },
  { sym: 'MSFT', name: 'Microsoft', qty: '9 sh', value: '$4,010', chg: 0.4 },
];
const WATCH = [
  { sym: 'AMZN', name: 'Amazon', price: '$201.44', chg: 1.9 },
  { sym: 'META', name: 'Meta', price: '$612.30', chg: -0.6 },
  { sym: 'GOOGL', name: 'Alphabet', price: '$182.11', chg: 2.4 },
];

function Ticker({ sym }: { sym: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.ticker, { backgroundColor: theme.primary + '1F' }]}>
      <ThemedText type="smallBold" style={{ color: theme.iconLilac, fontSize: 11 }}>{sym.slice(0, 4)}</ThemedText>
    </View>
  );
}

function Change({ v }: { v: number }) {
  const theme = useTheme();
  const up = v >= 0;
  return (
    <ThemedText type="smallBold" style={{ color: up ? theme.success : theme.destructive }}>
      {up ? '+' : ''}{v.toFixed(1)}%
    </ThemedText>
  );
}

export default function Trade() {
  const theme = useTheme();
  const [seg, setSeg] = useState(0);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground glow={false} starCount={35} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <RiseIn>
          <ThemedText type="title" style={{ fontSize: 22 }}>Trade</ThemedText>
          <ThemedText type="small" themeColor="mutedForeground">Risk-free paper trading</ThemedText>
        </RiseIn>

        {/* Portfolio value */}
        <RiseIn delay={70}>
          <Card style={styles.portfolio} elevated>
            <ThemedText type="label" themeColor="mutedForeground">Portfolio value</ThemedText>
            <View style={styles.amountRow}>
              <NumberRollup value={104237} prefix="$" type="display" style={{ fontSize: 34 }} />
              <ThemedText type="heading" themeColor="mutedForeground" style={{ fontSize: 18, marginBottom: 3 }}>.55</ThemedText>
            </View>
            <View style={styles.deltaRow}>
              <Svg width={12} height={12} viewBox="0 0 12 12"><Path d="M6 2l4 6H2z" fill={theme.success} /></Svg>
              <ThemedText type="smallBold" style={{ color: theme.success }}>+$1,284 (1.24%) today</ThemedText>
            </View>
            <Svg width="100%" height={64} viewBox="0 0 320 64" preserveAspectRatio="none" style={{ marginTop: Spacing.two }}>
              <Defs>
                <SvgGradient id="tarea" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={theme.success} stopOpacity={0.3} />
                  <Stop offset="1" stopColor={theme.success} stopOpacity={0.02} />
                </SvgGradient>
              </Defs>
              <Path d="M0 50 C40 46 70 40 110 42 C150 44 175 30 210 26 C250 21 280 14 320 10 L320 64 L0 64 Z" fill="url(#tarea)" />
              <Path d="M0 50 C40 46 70 40 110 42 C150 44 175 30 210 26 C250 21 280 14 320 10" stroke={theme.success} strokeWidth={2.5} fill="none" strokeLinecap="round" />
            </Svg>
          </Card>
        </RiseIn>

        {/* Segments */}
        <RiseIn delay={120}>
          <View style={[styles.segments, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {SEGMENTS.map((s, i) => (
              <SpringPressable key={s} haptic={false} scaleTo={0.96} style={{ flex: 1 }} onPress={() => setSeg(i)}>
                <View style={[styles.segment, seg === i && { backgroundColor: theme.primary }]}>
                  <ThemedText type="smallBold" style={{ color: seg === i ? '#fff' : theme.mutedForeground }}>{s}</ThemedText>
                </View>
              </SpringPressable>
            ))}
          </View>
        </RiseIn>

        {/* Holdings */}
        <RiseIn delay={170}>
          <ThemedText type="label" themeColor="mutedForeground" style={styles.sectionLabel}>Your positions</ThemedText>
          <Card padded={false}>
            {HOLDINGS.map((h, i) => (
              <SpringPressable key={h.sym} onPress={() => {}}>
                <View style={[styles.row, i < HOLDINGS.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                  <Ticker sym={h.sym} />
                  <View style={{ flex: 1 }}>
                    <ThemedText type="bodyMedium">{h.name}</ThemedText>
                    <ThemedText type="small" themeColor="mutedForeground">{h.qty}</ThemedText>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <ThemedText type="bodyMedium">{h.value}</ThemedText>
                    <Change v={h.chg} />
                  </View>
                </View>
              </SpringPressable>
            ))}
          </Card>
        </RiseIn>

        {/* Watchlist */}
        <RiseIn delay={220}>
          <ThemedText type="label" themeColor="mutedForeground" style={styles.sectionLabel}>Watchlist</ThemedText>
          <Card padded={false}>
            {WATCH.map((w, i) => (
              <SpringPressable key={w.sym} onPress={() => {}}>
                <View style={[styles.row, i < WATCH.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                  <Ticker sym={w.sym} />
                  <View style={{ flex: 1 }}>
                    <ThemedText type="bodyMedium">{w.name}</ThemedText>
                    <ThemedText type="small" themeColor="mutedForeground">{w.sym}</ThemedText>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <ThemedText type="bodyMedium">{w.price}</ThemedText>
                    <Change v={w.chg} />
                  </View>
                </View>
              </SpringPressable>
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
  portfolio: {},
  amountRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, marginTop: Spacing.one },
  deltaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  segments: { flexDirection: 'row', borderRadius: Radius.pill, borderWidth: StyleSheet.hairlineWidth, padding: 4, gap: 4 },
  segment: { paddingVertical: 9, borderRadius: Radius.pill, alignItems: 'center' },
  sectionLabel: { marginBottom: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4, padding: Spacing.three },
  ticker: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
});
