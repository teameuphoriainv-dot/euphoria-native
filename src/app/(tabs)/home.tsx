/**
 * Home — matches design mockup: greeting + Atlas + streak pill, weekly check row,
 * portfolio card with violet area chart, Continue/Trade duo, Daily Challenge.
 */
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';

import { AmbientBackground } from '@/components/ambient-background';
import { Atlas } from '@/components/atlas';
import { DailyGoalRing } from '@/components/daily-goal-ring';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { NumberRollup } from '@/shared/motion/number-rollup';
import { Card } from '@/components/ui/card';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { useApp } from '@/lib/store';

const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DONE_DAYS = 5; // ponytail: mock data until Phase 2 wires Supabase

function DayCheck({ label, done }: { label: string; done: boolean }) {
  const theme = useTheme();
  return (
    <View style={styles.day}>
      <ThemedText type="small" themeColor="mutedForeground" style={{ fontSize: 11 }}>{label}</ThemedText>
      <Svg width={30} height={30} viewBox="0 0 30 30">
        <Circle cx={15} cy={15} r={13.5} fill={done ? theme.primary : 'none'} stroke={done ? theme.primary : theme.border} strokeWidth={2} />
        {done && <Path d="M9.5 15.5l3.5 3.5 7-7.5" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />}
      </Svg>
    </View>
  );
}

function PortfolioChart() {
  const theme = useTheme();
  return (
    <Svg width="100%" height={90} viewBox="0 0 320 90" preserveAspectRatio="none">
      <Defs>
        <SvgGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={theme.primary} stopOpacity={0.35} />
          <Stop offset="1" stopColor={theme.primary} stopOpacity={0.02} />
        </SvgGradient>
      </Defs>
      <Path
        d="M0 70 C30 62 55 66 85 58 C120 48 150 56 185 44 C220 32 250 38 285 24 C300 18 312 16 320 14 L320 90 L0 90 Z"
        fill="url(#area)"
      />
      <Path
        d="M0 70 C30 62 55 66 85 58 C120 48 150 56 185 44 C220 32 250 38 285 24 C300 18 312 16 320 14"
        stroke={theme.primary}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function Home() {
  const theme = useTheme();
  const streak = useApp((s) => s.streak);
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground glow={false} starCount={45} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <RiseIn>
          <View style={styles.headerRow}>
            <View style={styles.greetLeft}>
              <Atlas size={46} expression="happy" interactive={false} />
              <View>
                <ThemedText type="title" style={{ fontSize: 22 }}>Hey, Siddartha</ThemedText>
                <ThemedText type="small" themeColor="mutedForeground">Ready to learn?</ThemedText>
              </View>
            </View>
            <View style={[styles.streakPill, { backgroundColor: theme.primary + '1F', borderColor: theme.primary + '3A' }]}>
              <UIcon name="flame" size={15} color={theme.iconLilac} />
              <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>{streak}</ThemedText>
            </View>
          </View>
        </RiseIn>

        {/* Week row */}
        <RiseIn delay={60}>
          <View style={styles.weekRow}>
            {WEEK.map((d, i) => (
              <DayCheck key={`${d}${i}`} label={d} done={i < DONE_DAYS} />
            ))}
          </View>
        </RiseIn>

        {/* Portfolio */}
        <RiseIn delay={120}>
          <Card style={styles.portfolio}>
            <View style={styles.rowBetween}>
              <ThemedText type="label" themeColor="mutedForeground">Portfolio</ThemedText>
              <View style={styles.deltaRow}>
                <Svg width={12} height={12} viewBox="0 0 12 12"><Path d="M6 2l4 6H2z" fill={theme.success} /></Svg>
                <ThemedText type="smallBold" style={{ color: theme.success }}>+$1,284 today</ThemedText>
              </View>
            </View>
            <View style={styles.amountRow}>
              <NumberRollup value={104237} prefix="$" type="display" style={{ fontSize: 34 }} />
              <ThemedText type="heading" themeColor="mutedForeground" style={{ fontSize: 18, marginBottom: 3 }}>.55</ThemedText>
            </View>
            <View style={{ marginTop: Spacing.two }}>
              <PortfolioChart />
            </View>
          </Card>
        </RiseIn>

        {/* Daily goal ring */}
        <RiseIn delay={160}>
          <SpringPressable onPress={() => router.push('/learn')}>
            <Card style={styles.goalRow}>
              <DailyGoalRing value={14} goal={20} />
              <View style={{ flex: 1 }}>
                <ThemedText type="label" themeColor="mutedForeground">Today&apos;s goal</ThemedText>
                <ThemedText type="heading" style={{ fontSize: 17, marginTop: 2 }}>14 of 20 minutes</ThemedText>
                <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 2 }}>6 min to keep your streak alive</ThemedText>
              </View>
            </Card>
          </SpringPressable>
        </RiseIn>

        {/* Continue / Trade duo */}
        <View style={styles.duoRow}>
          <RiseIn delay={180} style={styles.duoHalf}>
            <SpringPressable onPress={() => router.push('/learn')}>
              <Card style={[styles.duoCard, { backgroundColor: theme.primary, borderColor: theme.primary }]}>
                <UIcon name="arrowRight" size={20} color="#fff" />
                <ThemedText type="heading" style={{ fontSize: 16, marginTop: Spacing.two, color: '#fff' }}>Continue</ThemedText>
                <ThemedText type="small" style={{ color: 'rgba(255,255,255,0.85)' }}>Foundations · 80%</ThemedText>
              </Card>
            </SpringPressable>
          </RiseIn>
          <RiseIn delay={230} style={styles.duoHalf}>
            <SpringPressable onPress={() => router.push('/trade')}>
              <Card style={styles.duoCard}>
                <UIcon name="trade" size={20} color={theme.success} />
                <ThemedText type="heading" style={{ fontSize: 16, marginTop: Spacing.two }}>Trade</ThemedText>
                <ThemedText type="small" themeColor="mutedForeground">Paper trading</ThemedText>
              </Card>
            </SpringPressable>
          </RiseIn>
        </View>

        {/* Daily challenge */}
        <RiseIn delay={290}>
          <SpringPressable onPress={() => router.push('/lesson')}>
            <Card style={[styles.challenge, { backgroundColor: theme.primary + '14', borderColor: theme.primary + '38' }]}>
              <View style={styles.challengeHead}>
                <UIcon name="sparkle" size={15} color={theme.iconLilac} />
                <ThemedText type="label" style={{ color: theme.iconLilac }}>Daily Challenge</ThemedText>
              </View>
              <ThemedText type="bodyMedium" style={{ marginTop: Spacing.one, lineHeight: 22 }}>
                If a stock drops 20% then rises 20%, are you back to even?
              </ThemedText>
            </Card>
          </SpringPressable>
        </RiseIn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four, gap: Spacing.three },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greetLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4 },
  streakPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.pill, borderWidth: 1 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.one },
  day: { alignItems: 'center', gap: 6 },
  portfolio: { paddingBottom: Spacing.two },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  deltaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  amountRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, marginTop: Spacing.one },
  duoRow: { flexDirection: 'row', gap: Spacing.three },
  duoHalf: { flex: 1 },
  duoCard: { minHeight: 104 },
  challenge: {},
  challengeHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
});
