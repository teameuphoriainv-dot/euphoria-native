/**
 * Home — one job: get you into the next lesson.
 *
 * This screen used to lead with a $104,237.55 portfolio card that was entirely invented (no
 * portfolio state exists anywhere in the app). Removing it left the screen without an anchor, so
 * Home is now built around a single hero for the next real lesson — course art in the course
 * accent, the real title, real position in the course, real XP — with the habit signals (streak,
 * today's minutes, the week strip) compressed into a strip above it.
 *
 * Every number on this screen comes from the store or the curriculum. Nothing here is mock.
 */
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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
import Svg, { Circle, Path } from 'react-native-svg';

import { AmbientBackground } from '@/components/ambient-background';
import { Atlas } from '@/components/atlas';

import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { GradientButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { CourseRailCard } from '@/components/course-rail-card';
import { LessonArt } from '@/components/lesson-art';
import { courseAccent } from '@/lib/course-accents';
import { COURSES, loadCourseLessons, type PathwayLesson } from '@/lib/curriculum';
import { getCourseById } from '@/lib/curriculum/courseIndex';
import { lessonKey, useApp } from '@/lib/store';
import { RiseIn } from '@/shared/motion/rise-in';
import { openAtlasChat } from '@/components/ask-atlas';
import { SpringPressable } from '@/shared/motion/spring-pressable';

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
        style={[{ fontSize: 11, lineHeight: 15 }, today ? { color: theme.iconLilac } : null]}>
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

export default function Home() {
  const name = useApp((s) => s.profile.name);
  const theme = useTheme();
  const streak = useApp((s) => s.streak);
  const completedLessons = useApp((s) => s.completedLessons);
  const activeCourseId = useApp((s) => s.activeCourseId);
  const setActiveCourse = useApp((s) => s.setActiveCourse);
  const minutesDone = useApp((s) => s.minutesDoneToday());
  const goalMinutes = useApp((s) => s.dailyGoalMinutes());

  const course = getCourseById(activeCourseId);
  const accent = courseAccent(activeCourseId);

  // The next lesson's title/xp only live inside the course module — a ~1 MB lazy import. Learn
  // loads the same module and dynamic imports are cached, so this is paid once per course per
  // session, not once per screen.
  const [next, setNext] = useState<PathwayLesson | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadCourseLessons(activeCourseId)
      .then((ls) => {
        if (cancelled) return;
        setNext(ls.find((l) => !completedLessons.includes(lessonKey(activeCourseId, l.num))) ?? null);
      })
      .catch(() => {
        if (!cancelled) setNext(null);
      });
    return () => {
      cancelled = true;
    };
  }, [activeCourseId, completedLessons]);

  const doneInCourse = useMemo(
    () => completedLessons.filter((k) => k.startsWith(`${activeCourseId}:`)).length,
    [completedLessons, activeCourseId],
  );
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
        {/* Greeting + habit pills */}
        <RiseIn>
          <View style={styles.headerRow}>
            <View style={styles.greetLeft}>
              {/* The mascot IS the entry to chat. It was already sitting here inert, and a mascot
                  is the first thing anyone taps — see ask-atlas.tsx for why there is no FAB. */}
              <SpringPressable
                haptic={false}
                onPress={() => openAtlasChat()}
                accessibilityRole="button"
                accessibilityLabel="Ask Atlas"
              >
                <Atlas size={46} expression="happy" interactive={false} />
              </SpringPressable>
              <View style={{ flex: 1 }}>
                <ThemedText type="title" style={{ fontSize: 22 }} numberOfLines={1}>{name ? `Hey, ${name}` : 'Hey there'}</ThemedText>
                <ThemedText type="small" themeColor="mutedForeground" numberOfLines={1}>
                  {remaining === 0 ? 'Done for today — streak safe.' : `${remaining} min to keep your streak`}
                </ThemedText>
              </View>
            </View>
            <View style={styles.pillStack}>
              <View style={[styles.pill, { backgroundColor: '#F9731618', borderColor: '#F9731640' }]}>
                <UIcon name="flame" size={14} color="#F97316" />
                <ThemedText type="smallBold" style={{ color: '#F97316', fontSize: 12 }}>{streak}</ThemedText>
              </View>
              <View style={[styles.pill, { backgroundColor: theme.primary + '1F', borderColor: theme.primary + '3A' }]}>
                <UIcon name="target" size={14} color={theme.iconLilac} />
                <ThemedText type="smallBold" style={{ color: theme.iconLilac, fontSize: 12 }}>{minutesDone}/{goalMinutes}</ThemedText>
              </View>
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

        {/* The hero — the next real lesson */}
        <RiseIn delay={120}>
          <Card elevated style={[styles.hero, { shadowColor: accent, borderColor: accent + '30' }]} tint={accent}>
            {next ? (
              <>
                <LessonArt courseId={activeCourseId} title={next.title} index={next.num - 1} size={96} />
                <ThemedText type="label" style={{ color: accent, marginTop: Spacing.three }} numberOfLines={1}>
                  {(course?.title ?? 'Course').toUpperCase()}
                </ThemedText>
                <ThemedText type="display" style={styles.heroTitle}>{next.title}</ThemedText>
                <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: Spacing.two }}>
                  Lesson {next.num} of {course?.totalLessons ?? '—'} · {next.xp} XP
                </ThemedText>
                <View style={styles.heroCta}>
                  {/* No `colors` override — the brand gradient, like every other CTA in the app.
                      Across ten pulled references (Elevate blue, Nibble purple, RiseGuide black,
                      EWA purple, Promova black, Deepstash dark, Facetune cyan, Praktika blue,
                      BetterMe red, BitePal black) NOT ONE derives its primary button colour from
                      the content it sits on. The course accent still carries identity here — the
                      eyebrow, the card tint and its border — but the control is chrome. */}
                  <GradientButton
                    label={doneInCourse === 0 ? 'Start' : 'Continue'}
                    full
                    onPress={() => router.push({ pathname: '/lesson', params: { course: activeCourseId, num: String(next.num) } })}
                  />
                </View>
              </>
            ) : (
              <>
                <ThemedText type="title" style={{ textAlign: 'center' }}>
                  {doneInCourse > 0 ? 'Course complete.' : 'Loading your next lesson…'}
                </ThemedText>
                {doneInCourse > 0 && (
                  <View style={styles.heroCta}>
                    <GradientButton label="Pick a new course" full onPress={() => router.push('/courses')} />
                  </View>
                )}
              </>
            )}
          </Card>
        </RiseIn>

        {/*
          * A labelled section plus a horizontal rail, because Home had neither.
          *
          * ScreensDesign, six home/dashboard screens across six apps at $250k-$750k/mo
          * (Elevate 111712, Nibble 132959, Deepstash 247089, Promova 138796,
          * RiseGuide 270262, EWA 283665):
          *   6/6  two or more LABELLED content sections
          *   6/6  a horizontal multi-item row
          *   0/6  a single hero card dominating the screen
          *
          * Onboarding promises a 75-lesson path across three courses and then Home showed
          * exactly one lesson with no way to see the rest without leaving the tab. That is
          * the blandness: nothing to browse. CourseRailCard already ships in learn.tsx, so
          * this is the existing component in a second place, not a new one.
          */}
        <View style={styles.sectionHead}>
          <ThemedText type="label" themeColor="mutedForeground">YOUR PATH</ThemedText>
          <SpringPressable haptic={false} onPress={() => router.push('/courses')} hitSlop={8}>
            <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>See all</ThemedText>
          </SpringPressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
          style={styles.railScroll}>
          {COURSES.map((c) => (
            <CourseRailCard
              key={c.id}
              course={c}
              selected={c.id === activeCourseId}
              done={completedLessons.filter((id) => id.startsWith(`${c.id}:`)).length}
              onPress={() => setActiveCourse(c.id)}
            />
          ))}
        </ScrollView>

        {/* Secondary surfaces */}
        <View style={styles.duoRow}>
          <RiseIn delay={180} style={styles.duoHalf}>
            <SpringPressable onPress={() => router.push('/trade')}>
              <Card style={styles.duoCard} tint={theme.success}>
                <UIcon name="trade" size={20} color={theme.success} />
                <ThemedText type="heading" style={{ fontSize: 16, marginTop: Spacing.two }}>Trade</ThemedText>
                <ThemedText type="small" themeColor="mutedForeground">Paper trading</ThemedText>
              </Card>
            </SpringPressable>
          </RiseIn>
          <RiseIn delay={230} style={styles.duoHalf}>
            <SpringPressable onPress={() => router.push('/digest')}>
              <Card style={styles.duoCard} tint={theme.primary}>
                <UIcon name="bookOpen" size={20} color={theme.iconLilac} />
                <ThemedText type="heading" style={{ fontSize: 16, marginTop: Spacing.two }}>Digest</ThemedText>
                <ThemedText type="small" themeColor="mutedForeground">Today&apos;s read</ThemedText>
              </Card>
            </SpringPressable>
          </RiseIn>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four, gap: Spacing.three },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  greetLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4, flex: 1 },
  /* A ROW, not a stack. Two pills stacked with a 5pt gap collided against the 46pt Atlas and
     read as one smeared blob. Every reference header lays its stats out horizontally —
     Elevate puts the streak counter in the top nav row, EWA puts level + streak + coins in a
     row. None of the six stacks them. */
  pillStack: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill, borderWidth: 1 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.one },
  day: { alignItems: 'center', gap: 6 },
  dayMark: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', paddingVertical: Spacing.three, borderWidth: 1, shadowOpacity: 0.3, shadowRadius: 30, shadowOffset: { width: 0, height: 12 } },
  /* 22/28, lineHeight pinned to the override. Was 26 on `display` (lineHeight 40): the hero
     card ate 55% of the viewport and pushed the new YOUR PATH rail under the tab bar. None of
     the six reference home screens uses a hero this large. */
  heroTitle: { textAlign: 'center', fontSize: 22, lineHeight: 28, marginTop: Spacing.one, paddingHorizontal: Spacing.two },
  heroCta: { alignSelf: 'stretch', marginTop: Spacing.three },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.four, marginBottom: Spacing.two },
  railScroll: { marginHorizontal: -Spacing.three },
  rail: { paddingHorizontal: Spacing.three, gap: Spacing.two + 4 },
  duoRow: { flexDirection: 'row', gap: Spacing.three },
  duoHalf: { flex: 1 },
  duoCard: { minHeight: 104 },
});
