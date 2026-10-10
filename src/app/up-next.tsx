/**
 * Up next: the beat after a finished lesson, the way a series player queues the next episode.
 *
 * Owner, 2026-09-30: "at the end of the lesson add a wanna-continue type of button, like Netflix
 * continuing shows". Before this a finished lesson (and its reward cards) dropped the learner back
 * on the tab they came from, with nothing pointing at the next thing. This screen names the next
 * lesson on the active path, counts down, and starts it unless the learner says not now.
 *
 * The countdown is the Netflix move and it is honest about itself: the button says what will
 * happen and in how many seconds, and "Not now" stops it. Reduce Motion never counts down; the
 * learner taps. No next lesson (course done, or it failed to load) sends them where the lesson
 * would have: the screen is never a dead end.
 *
 * Reached from lesson.tsx `leave()` directly, or from the reward screen's last card, with the
 * course and the lesson just finished as params.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReducedMotion } from 'react-native-reanimated';

import { AmbientBackground } from '@/components/ambient-background';
import { Atlas } from '@/components/atlas';
import { LessonArt } from '@/components/lesson-art';
import { PathNode } from '@/components/path-node';
import { ThemedText } from '@/components/themed-text';
import { SlabButton } from '@/components/ui/button';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { courseAccent } from '@/lib/course-accents';
import { getCourseById, loadCourseLessons, type PathwayLesson } from '@/lib/curriculum';
import { lessonKey, useApp } from '@/lib/store';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

/** Seconds before the next lesson starts on its own. Long enough to read the card and say no. */
const COUNTDOWN_S = 10;

/** Where a finished lesson used to go: back to whatever opened it, else the Learn tab. */
function leaveToPath() {
  if (router.canGoBack()) router.back();
  else router.replace('/(tabs)/learn');
}

export default function UpNext() {
  const params = useLocalSearchParams<{ course?: string; num?: string }>();
  const activeCourseId = useApp((s) => s.activeCourseId);
  const completedLessons = useApp((s) => s.completedLessons);
  const courseId = params.course ?? activeCourseId;
  const finishedNum = Number(params.num) || 0;
  const reduced = useReducedMotion();

  // undefined = loading, null = nothing next
  const [next, setNext] = useState<PathwayLesson | null | undefined>(undefined);
  const [left, setLeft] = useState(COUNTDOWN_S);
  const stopped = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadCourseLessons(courseId)
      .then((ls) => {
        if (cancelled) return;
        const after = ls.find((l) => l.num > finishedNum && !completedLessons.includes(lessonKey(courseId, l.num)));
        setNext(after ?? null);
      })
      .catch(() => {
        if (!cancelled) setNext(null);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId, finishedNum, completedLessons]);

  const start = () => {
    stopped.current = true;
    if (!next) return;
    router.replace({ pathname: '/lesson', params: { course: courseId, num: String(next.num) } } as never);
  };
  const notNow = () => {
    stopped.current = true;
    leaveToPath();
  };

  // Nothing next: this screen has no job, go where the lesson would have gone.
  useEffect(() => {
    if (next === null) leaveToPath();
  }, [next]);

  // The countdown. Timers, not an animation: this is a schedule the learner can read, not motion.
  useEffect(() => {
    if (!next || reduced) return;
    const t = setInterval(() => {
      if (stopped.current) return;
      setLeft((n) => {
        if (n <= 1) {
          clearInterval(t);
          start();
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // `start` closes over `next`, which is this effect's own dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [next, reduced]);

  if (!next) return <SafeAreaView style={styles.safe}><AmbientBackground starCount={30} /></SafeAreaView>;

  const course = getCourseById(courseId);
  const accent = courseAccent(courseId);
  const label = reduced ? `Start lesson ${String(next.num)}` : `Start lesson ${String(next.num)} in ${String(left)}`;

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientBackground starCount={30} />
      <View style={styles.content}>
        <RiseIn>
          <View style={styles.head}>
            <Atlas size={88} expression="happy" interactive={false} idle />
          </View>
        </RiseIn>
        <RiseIn delay={100}>
          <ThemedText type="label" themeColor="mutedForeground" style={styles.kicker}>UP NEXT</ThemedText>
          <ThemedText type="display" style={styles.title}>Keep going?</ThemedText>
        </RiseIn>
        <RiseIn delay={220}>
          <View style={[styles.card, { backgroundColor: `${accent}14`, borderColor: `${accent}59` }]}>
            <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <PathNode state="current" size={52} label={String(next.num)} doneColor={accent} accessibilityLabel={`Lesson ${String(next.num)}`} />
            </View>
            <View style={styles.cardText}>
              <ThemedText type="label" style={{ color: accent }}>
                {`LESSON ${String(next.num)} · ${(course?.title ?? '').toUpperCase()}`}
              </ThemedText>
              <ThemedText type="title" style={styles.lessonTitle}>{next.title}</ThemedText>
              <ThemedText type="small" themeColor="mutedForeground" style={styles.xp}>{`${String(next.xp)} XP`}</ThemedText>
            </View>
            <LessonArt courseId={courseId} title={course?.title ?? next.title} index={0} size={48} />
          </View>
        </RiseIn>
      </View>
      <View style={styles.footer}>
        <RiseIn delay={320}>
          <SlabButton label={label} full onPress={start} accessibilityLabel={`Start lesson ${String(next.num)}, ${next.title}`} />
          <SpringPressable haptic={false} onPress={notNow} style={styles.later} accessibilityRole="button" accessibilityLabel="Not now">
            <ThemedText type="bodyMedium" themeColor="mutedForeground">Not now</ThemedText>
          </SpringPressable>
        </RiseIn>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.four, gap: Spacing.three },
  head: { alignItems: 'center' },
  kicker: { textAlign: 'center' },
  title: { textAlign: 'center', marginTop: Spacing.one },
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three, borderRadius: Radius.lg, borderWidth: 1 },
  cardText: { flex: 1 },
  lessonTitle: { fontSize: FontSize.titleSm, marginTop: 2 },
  xp: { marginTop: Spacing.one },
  footer: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.four },
  later: { alignItems: 'center', paddingVertical: 11, marginTop: Spacing.one },
});
