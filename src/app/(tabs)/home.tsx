/**
 * Home — matches design mockup: greeting + Atlas + streak pill, weekly check row,
 * portfolio card with violet area chart, Continue/Trade duo, Daily Challenge.
 */
import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';

import { AmbientBackground } from '@/components/ambient-background';
import { Atlas } from '@/components/atlas';
import { AnimatedLineChart } from '@/components/animated-chart';
import { DailyGoalRing } from '@/components/daily-goal-ring';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { NumberRollup } from '@/shared/motion/number-rollup';
import { Card } from '@/components/ui/card';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { getCourseById } from '@/lib/curriculum/courseIndex';
import { useApp } from '@/lib/store';

const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function DayCheck({ label, done, today }: { label: string; done: boolean; today: boolean }) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const pulse = useSharedValue(0.9);

  // only today-and-not-yet-done breathes: it's the one cell that wants a tap
  useEffect(() => {
    if (reduced || !today || done) {
      pulse.set(0.9);
      return;
    }
    pulse.set(withRepeat(withTiming(0.25, { duration: 1500, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, [reduced, today, done, pulse]);

  const ringStyle = useAnimatedStyle(() => ({ opacity: pulse.get() }));

  return (
    <View style={styles.day}>
      {/* never spread `color: undefined` into the style — it overrides themeColor and the label
          falls back to the default dark text, i.e. invisible on this background */}
      <ThemedText
        type={today ? 'smallBold' : 'small'}
        themeColor={today ? undefined : 'mutedForeground'}
        style={[{ fontSize: 11 }, today ? { color: theme.iconLilac } : null]}>
        {label}
      </ThemedText>
      <View style={styles.dayMark}>
        {today && !done && (
          <Animated.View
            style={[
              { position: 'absolute', width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: theme.primary },
              ringStyle,
            ]}
          />
        )}
        <Svg width={30} height={30} viewBox="0 0 30 30">
          <Circle cx={15} cy={15} r={13.5} fill={done ? theme.primary : 'none'} stroke={done ? theme.primary : theme.border} strokeWidth={2} />
          {done && <Path d="M9.5 15.5l3.5 3.5 7-7.5" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />}
        </Svg>
      </View>
    </View>
  );
}

function PortfolioChart() {
  const theme = useTheme();
  return (
    <AnimatedLineChart
      line="M0 70 C30 62 55 66 85 58 C120 48 150 56 185 44 C220 32 250 38 285 24 C300 18 312 16 320 14"
      area="M0 70 C30 62 55 66 85 58 C120 48 150 56 185 44 C220 32 250 38 285 24 C300 18 312 16 320 14 L320 90 L0 90 Z"
      color={theme.primary}
      gradientId="area"
      height={90}
      viewBox="0 0 320 90"
    />
  );
}

export default function Home() {
  const name = useApp((s) => s.profile.name);
  const theme = useTheme();
  const streak = useApp((s) => s.streak);
  const completedLessons = useApp((s) => s.completedLessons);
  const activeCourseId = useApp((s) => s.activeCourseId);
  const minutesDone = useApp((s) => s.minutesDoneToday());
  const goalMinutes = useApp((s) => s.dailyGoalMinutes());

  // Real progress for the course Learn is currently on. `completedLessons` holds `courseId:num`
  // keys, so the prefix filter is the whole computation.
  const course = getCourseById(activeCourseId);
  const doneInCourse = useMemo(
    () => completedLessons.filter((k) => k.startsWith(`${activeCourseId}:`)).length,
    [completedLessons, activeCourseId],
  );
  const coursePct = course ? Math.round((doneInCourse / course.totalLessons) * 100) : 0;
  const remaining = Math.max(0, goalMinutes - minutesDone);

  // The week strip needs per-day history that nothing records yet; `streak` is the only real
  // signal, so fill backwards from today and stop. Exact when streak <= 7, which is the only
  // range the strip can show anyway.
  const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0
  const isDone = (i: number) => i <= todayIdx && todayIdx - i < streak;

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
                <ThemedText type="title" style={{ fontSize: 22 }}>{name ? `Hey, ${name}` : 'Hey there'}</ThemedText>
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
              <DayCheck key={`${d}${i}`} label={d} done={isDone(i)} today={i === todayIdx} />
            ))}
          </View>
        </RiseIn>

        {/* Portfolio */}
        <RiseIn delay={120}>
          {/* tint is a static wash — this card shows mock numbers, and motion here would read
              as live data */}
          <Card style={styles.portfolio} tint={theme.primary}>
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
            <Card style={styles.goalRow} tint={theme.primary}>
              <DailyGoalRing value={minutesDone} goal={goalMinutes} />
              <View style={{ flex: 1 }}>
                <ThemedText type="label" themeColor="mutedForeground">Today&apos;s goal</ThemedText>
                <ThemedText type="heading" style={{ fontSize: 17, marginTop: 2 }}>{minutesDone} of {goalMinutes} minutes</ThemedText>
                <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 2 }}>
                  {remaining === 0 ? 'Done for today — streak safe.' : `${remaining} min to keep your streak alive`}
                </ThemedText>
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
                <ThemedText type="small" numberOfLines={1} style={{ color: 'rgba(255,255,255,0.85)' }}>
                  {/* percent first: the card is half-width and one line, so a long course title
                      would otherwise truncate the progress number clean off the end */}
                  {course ? `${coursePct}% · ${course.title}` : 'Pick a course'}
                </ThemedText>
              </Card>
            </SpringPressable>
          </RiseIn>
          <RiseIn delay={230} style={styles.duoHalf}>
            <SpringPressable onPress={() => router.push('/trade')}>
              <Card style={styles.duoCard} tint={theme.success}>
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
  dayMark: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
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
