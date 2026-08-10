/**
 * The guided first action.
 *
 * Onboarding used to end with `router.replace('/(tabs)/home')`, which dropped someone who had just
 * answered fourteen questions onto a screen showing a zero streak, zero XP, an empty week strip
 * and a portfolio that is not theirs. Nothing told them what to do next.
 *
 * Neither reference ends that way. Duolingo ends onboarding INSIDE your first lesson with Duo
 * coaching you through it; Brilliant ends in a real interactive problem. Neither ships a passive
 * feature carousel, because people swipe past those without reading them.
 *
 * WHY A GUIDE AND NOT A LESSON. lesson.tsx renders hardcoded STEPS demo content: every lesson in
 * every course opens "FOUNDATIONS - LESSON 9 - What is a stock?", verified on device. Handing a new
 * user that, seconds after promising a personalised path, would be the worst possible first
 * impression. Digest guides are real authored content, the reader works, and reaching the last
 * card awards XP which lights up the tier bar and puts them on the league board. It is currently
 * the only surface where a first action pays off correctly.
 *
 * ── UNIT 17f: THE WORKAROUND IS GONE (C109) ──────────────────────────────────────────────────
 * The instruction above has been carried out. `lesson.tsx` no longer contains the hardcoded STEPS
 * demo — verified, zero matches for `const STEPS` or `FOUNDATIONS` — and loads real curriculum by
 * `course`/`num`. So the first action is now the first LESSON of the path onboarding just built,
 * which is what Duolingo does and what this comment asked for.
 *
 * WHY IT MATTERS MORE THAN IT LOOKS: onboarding's whole promise is a personalised plan. Ending it
 * on a generic daily guide — the same guide every user gets — quietly contradicts that promise at
 * the exact moment it should be proved. Activation is decided here; a day-3 paywall is a formality
 * if the app has not visibly worked on day 1.
 *
 * The digest guide REMAINS as the fallback. If the course module fails to load or every lesson is
 * already complete, a working guide beats a dead screen — the same reason `later()` exists.
 */
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { Atlas } from '@/components/atlas';
import { AtlasSpeech } from '@/components/atlas-speech';
import { ThemedText } from '@/components/themed-text';
import { GradientButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spacing, FontSize } from '@/constants/theme';
import { Ev, track } from '@/lib/analytics';
import { getCourseById, loadCourseLessons, type PathwayLesson } from '@/lib/curriculum';
import { pickToday } from '@/lib/digest-pick';
import { lessonKey, useApp } from '@/lib/store';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

/** Module scope, so the impure Date.now() is not in render scope. The compiler lint cannot
 *  prove an arrow defined in a component body is only ever called from an event handler, so
 *  it flags the call site rather than the caller. Behaviour is identical. */
const nowMs = () => Date.now();

export default function Start() {
  const readPosts = useApp((s) => s.readPosts);
  const dailyPick = useApp((s) => s.dailyPick);
  const setProfile = useApp((s) => s.setProfile);
  const setDailyPick = useApp((s) => s.setDailyPick);
  const activeCourseId = useApp((s) => s.activeCourseId);
  const completedLessons = useApp((s) => s.completedLessons);

  const { day, post } = pickToday(readPosts, dailyPick);

  // Same resolution home.tsx uses for its hero, deliberately: two different answers to "what is
  // your next lesson" on two screens a tap apart is how a personalised path stops feeling like one.
  const [lesson, setLesson] = useState<PathwayLesson | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadCourseLessons(activeCourseId)
      .then((ls) => {
        if (cancelled) return;
        setLesson(ls.find((l) => !completedLessons.includes(lessonKey(activeCourseId, l.num))) ?? null);
      })
      .catch(() => {
        if (!cancelled) setLesson(null);
      });
    return () => {
      cancelled = true;
    };
  }, [activeCourseId, completedLessons]);

  const course = getCourseById(activeCourseId);

  /** Both paths stamp. Skipping is a decision, not a deferral: without stamping here the screen
   *  would greet the user again on every single sign-in. */
  const done = () => setProfile({ firstRunDoneAt: nowMs() });

  const begin = () => {
    done();
    if (lesson) {
      track(Ev.firstActionStarted, { kind: 'lesson', course: activeCourseId, lesson: lesson.num });
      router.replace({ pathname: '/lesson', params: { course: activeCourseId, num: String(lesson.num) } } as never);
      return;
    }
    // Fallback only. Pin the pick so the Digest tab shows the same guide they were just handed.
    track(Ev.firstActionStarted, { kind: 'guide' });
    setDailyPick(day, post.slug);
    router.replace(`/digest/${post.slug}` as never);
  };

  const later = () => {
    done();
    // Tracked as its own outcome, not as an absence. "How many people skip the first action" is a
    // number the funnel needs; inferring it from a missing event cannot distinguish a skip from an
    // app that crashed on this screen.
    track(Ev.firstActionSkipped);
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientBackground starCount={40} />
      <View style={styles.content}>
        <RiseIn>
          <View style={styles.head}>
            <Atlas size={92} expression="happy" interactive={false} entrance="bounce" />
          </View>
        </RiseIn>

        <RiseIn delay={120}>
          <View style={styles.bubble}>
            <AtlasSpeech
              text="Your plan is ready. Let's start with one idea, then I'll show you around."
              delay={260}
              tail="top"
            />
          </View>
        </RiseIn>

        <RiseIn delay={320}>
          <Card style={styles.card} elevated>
            <ThemedText type="label" themeColor="mutedForeground">
              {lesson ? `LESSON ${String(lesson.num)} · ${(course?.title ?? '').toUpperCase()}` : `TODAY · ${post.category.toUpperCase()}`}
            </ThemedText>
            <ThemedText type="title" style={styles.title}>{lesson ? lesson.title : post.title}</ThemedText>
            <ThemedText type="body" themeColor="mutedForeground" style={styles.excerpt}>
              {lesson ? `First lesson of the path we just built for you.` : post.excerpt}
            </ThemedText>
            <ThemedText type="small" themeColor="mutedForeground" style={styles.mins}>
              {lesson ? `${String(lesson.xp)} XP` : `${String(post.readMinutes)} min read`}
            </ThemedText>
          </Card>
        </RiseIn>
      </View>

      <View style={styles.footer}>
        <RiseIn delay={420}>
          <GradientButton label={lesson ? 'Start your first lesson' : "Read today's guide"} full onPress={begin} />
          <SpringPressable haptic={false} onPress={later} style={styles.later}>
            <ThemedText type="bodyMedium" themeColor="mutedForeground">Maybe later</ThemedText>
          </SpringPressable>
        </RiseIn>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.four, gap: Spacing.two },
  head: { alignItems: 'center' },
  bubble: { alignItems: 'center', marginTop: Spacing.three, marginBottom: Spacing.three },
  card: { gap: 6 },
  title: { fontSize: FontSize.titleSm, marginTop: 2 },
  excerpt: { lineHeight: 22 },
  mins: { marginTop: Spacing.two },
  footer: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.four },
  later: { alignItems: 'center', paddingVertical: Spacing.three },
});
