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
import { LessonArt } from '@/components/lesson-art';
import { PathNode } from '@/components/path-node';
import { PixelBeam } from '@/components/pixel-beam';
import { ThemedText } from '@/components/themed-text';
import { SlabButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { Ev, track } from '@/lib/analytics';
import { courseAccent } from '@/lib/course-accents';
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
  //
  // undefined = still loading, null = nothing to start (fallback guide). They were one value, so
  // for the length of the load the screen said the FALLBACK: Atlas began typing the guide line and
  // then restarted on the path line when the lesson arrived, the Digest card flashed before the
  // node, and a fast tap on the button in that window routed a new learner to the guide.
  const [lesson, setLesson] = useState<PathwayLesson | null | undefined>(undefined);
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
  const accent = courseAccent(activeCourseId);

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

  const guide = lesson === null;

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientBackground starCount={40} />
      <View style={styles.content}>
        {/*
         * REBUILT 2026-09-30 (owner: "this page needs UI work"). It was Atlas, a bubble, a card and
         * a button, four things in a column with nothing joining them. Now it is the path itself:
         * the same node-beam-Atlas composition the reveal and lesson-complete use, node 1 lit in
         * the course accent with the beam rising out of it into Atlas, so "this is where your
         * path starts" is DRAWN rather than typed in a bubble. The bubble is gone (one text block,
         * not two, per the owner on the onboarding screens); the title says it.
         */}
        <RiseIn>
          <View style={styles.stage} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {lesson ? (
              <View style={styles.beam}>
                <PixelBeam bands={5} baseWidth={28} step={8} height={BEAM_H} order="up" delay={150} stagger={50} />
              </View>
            ) : null}
            {lesson ? (
              <View style={styles.node}>
                <PathNode state="done" size={NODE} label={String(lesson.num)} doneColor={accent} accessibilityLabel={`Lesson ${String(lesson.num)}`} />
              </View>
            ) : null}
            <View style={styles.atlas}>
              <Atlas size={ATLAS} expression="happy" interactive={false} entrance="bounce" idle />
            </View>
          </View>
        </RiseIn>

        <RiseIn delay={120}>
          <ThemedText type="display" style={styles.headline}>
            {guide ? "Start with today's guide" : 'Your path starts here'}
          </ThemedText>
          <ThemedText type="body" themeColor="mutedForeground" style={styles.sub}>
            {guide
              ? 'Atlas will show you what to practice after.'
              : 'Atlas walks you through it, one idea at a time.'}
          </ThemedText>
        </RiseIn>

        <RiseIn delay={320}>
          {lesson ? (
            /*
             * THE SAME OBJECTS AS THE REVEAL, not a plain Card: the course accent tint and border
             * (planRowLead), the LessonArt mark keyed by COURSE title exactly as the reveal keys
             * it, so the row the learner was just shown is visibly the row they are starting.
             */
            <View style={[styles.lead, { backgroundColor: `${accent}14`, borderColor: `${accent}59` }]}>
              <LessonArt courseId={activeCourseId} title={course?.title ?? lesson.title} index={0} size={56} />
              <View style={styles.leadText}>
                <ThemedText type="label" style={{ color: accent }}>
                  {`LESSON ${String(lesson.num)} · ${(course?.title ?? '').toUpperCase()}`}
                </ThemedText>
                <ThemedText type="title" style={styles.title}>{lesson.title}</ThemedText>
                <ThemedText type="small" themeColor="mutedForeground" style={styles.mins}>
                  {`${String(lesson.xp)} XP`}
                </ThemedText>
              </View>
            </View>
          ) : lesson === undefined ? null : (
            // Fallback only (course failed to load or every lesson is done): a guide is not a
            // node on the path, so it keeps the plain card rather than borrowing the path's shape.
            <Card style={styles.card} elevated>
              <ThemedText type="label" themeColor="mutedForeground">
                {`TODAY · ${post.category.toUpperCase()}`}
              </ThemedText>
              <ThemedText type="title" style={styles.title}>{post.title}</ThemedText>
              <ThemedText type="body" themeColor="mutedForeground" style={styles.excerpt}>
                {post.excerpt}
              </ThemedText>
              <ThemedText type="small" themeColor="mutedForeground" style={styles.mins}>
                {`${String(post.readMinutes)} min read`}
              </ThemedText>
            </Card>
          )}
        </RiseIn>
      </View>

      <View style={styles.footer}>
        <RiseIn delay={420}>
          <SlabButton label={guide ? "Read today's guide" : 'Start your first lesson'} loading={lesson === undefined} full onPress={begin} />
          <SpringPressable haptic={false} onPress={later} style={styles.later} accessibilityRole="button" accessibilityLabel="Maybe later">
            <ThemedText type="bodyMedium" themeColor="mutedForeground">Maybe later</ThemedText>
          </SpringPressable>
        </RiseIn>
      </View>
    </SafeAreaView>
  );
}

/* ── stage geometry: Atlas, the beam whose top tucks behind his base, the node its bottom tucks
 * behind. Fixed numbers, as on lesson-complete, so the beam always touches both ends. ── */
const ATLAS = 96;
const ATLAS_H = Math.round(ATLAS * 1.04);
const BEAM_H = 64;
const NODE = 52;
const BEAM_TOP = ATLAS_H - 22;
const NODE_TOP = BEAM_TOP + BEAM_H - 26;
const STAGE_H = NODE_TOP + NODE + 6;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.four, gap: Spacing.three },
  stage: { height: STAGE_H, width: '100%', alignItems: 'center' },
  beam: { position: 'absolute', top: BEAM_TOP, alignItems: 'center' },
  node: { position: 'absolute', top: NODE_TOP },
  atlas: { position: 'absolute', top: 0 },
  headline: { textAlign: 'center' },
  sub: { textAlign: 'center', marginTop: Spacing.two, paddingHorizontal: Spacing.four, lineHeight: 22 },
  card: { gap: 6 },
  // Same tint and border alphas as the reveal's lead row (planRowLead), so it reads as that row.
  lead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three, borderRadius: Radius.lg, borderWidth: 1 },
  leadText: { flex: 1 },
  title: { fontSize: FontSize.titleSm, marginTop: 2 },
  excerpt: { lineHeight: 22 },
  mins: { marginTop: Spacing.one },
  footer: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.four },
  // 44pt target: 22 of line plus 11 each side.
  later: { alignItems: 'center', paddingVertical: 11, marginTop: Spacing.one },
});
