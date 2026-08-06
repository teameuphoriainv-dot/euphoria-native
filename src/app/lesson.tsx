/**
 * Lesson viewer — intro → the lesson's REAL steps → celebration → streak.
 *
 * This screen used to render one hardcoded demo lesson ("Foundations · Lesson 9 · What is a
 * stock?") no matter which node you tapped, while 5,341 authored steps sat unused in
 * src/lib/curriculum. It now loads the lesson named by the `course`/`num` params that learn.tsx
 * has always passed, and renders each step through normalizeStep() (see lib/lesson-steps.ts),
 * which maps the 24 authored step types onto the interactive components we already ship.
 *
 * XP comes from the data (`lesson.xp`), not a hardcoded 50.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

import { AmbientBackground } from '@/components/ambient-background';
import { Atlas } from '@/components/atlas';
import { AtlasSpeech } from '@/components/atlas-speech';
import { CelebrationRays, CelebrationWipe } from '@/components/celebration-burst';
import { Confetti } from '@/components/confetti';
import { FeedbackBanner, SparkBurst } from '@/components/lesson-feedback';
import { LessonProse } from '@/components/lesson-prose';
import { MatchingPairs } from '@/components/matching-pairs';
import { MultiSelect } from '@/components/multi-select';
import { NumberLine } from '@/components/number-line';
import { OrderSteps } from '@/components/order-steps';
import { StreakIgnite } from '@/components/streak-ignite';
import { TapReveal } from '@/components/tap-reveal';
import { ThemedText } from '@/components/themed-text';
import { TileBuilder } from '@/components/tile-builder';
import { UIcon } from '@/components/ui-icon';
import { GradientButton } from '@/components/ui/button';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCourseById, loadCourseLessons, type PathwayLesson } from '@/lib/curriculum';
import { gates, normalizeStep } from '@/lib/lesson-steps';
import { lessonKey, useApp } from '@/lib/store';
import { NumberRollup } from '@/shared/motion/number-rollup';
import { RewardPop } from '@/shared/motion/reward-pop';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { Duration } from '@/shared/motion/tokens';

export default function Lesson() {
  const theme = useTheme();
  const streakAfter = useApp((s) => s.streakIfCompletedToday());
  const params = useLocalSearchParams<{ course?: string; num?: string }>();
  const courseId = params.course ?? '';
  const lessonNum = Number(params.num);

  const [lesson, setLesson] = useState<PathwayLesson | null>(null);
  const [notFound, setNotFound] = useState(false);
  // bad params are knowable at render — deriving this keeps setState out of the effect body
  const badParams = !courseId || !Number.isFinite(lessonNum);
  const missing = badParams || notFound;

  useEffect(() => {
    if (badParams) return;
    let cancelled = false;
    loadCourseLessons(courseId)
      .then((ls) => {
        if (cancelled) return;
        const found = ls.find((l) => l.num === lessonNum) ?? null;
        setLesson(found);
        setNotFound(!found);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId, lessonNum, badParams]);

  const steps = useMemo(() => lesson?.steps ?? [], [lesson]);
  const total = steps.length;
  // 0 = intro, 1..total = content, total+1 = done, total+2 = streak
  const DONE = total + 1;
  const STREAK = total + 2;

  const [idx, setIdx] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState(false);

  const norm = useMemo(() => (idx >= 1 && idx <= total ? normalizeStep(steps[idx - 1]) : null), [idx, total, steps]);
  const isChoice = norm?.kind === 'choice';
  const xp = lesson?.xp ?? 30;

  const advance = () => {
    if (isChoice && !checked) {
      if (pick !== null) setChecked(true);
      return;
    }
    if (idx < STREAK) {
      setIdx(idx + 1);
      setPick(null);
      setChecked(false);
      setSolved(false);
    } else {
      useApp.getState().completeLesson(lessonKey(courseId, lessonNum), xp);
      router.back();
    }
  };

  if (missing) {
    return (
      <SafeAreaView style={styles.safe}>
        <AmbientBackground starCount={30} />
        <View style={styles.centered}>
          <Atlas size={110} expression="oops" />
          <ThemedText type="title" style={styles.title}>That lesson isn&apos;t available.</ThemedText>
          <ThemedText type="body" themeColor="mutedForeground" style={styles.center}>Pick another from the pathway.</ThemedText>
        </View>
        <View style={styles.footer}>
          <GradientButton label="Back" full onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={styles.safe}>
        <AmbientBackground starCount={30} />
        <View style={styles.centered}><ActivityIndicator color={theme.primary} /></View>
      </SafeAreaView>
    );
  }

  const gated = norm ? gates(norm) && !solved : false;
  const ctaLabel = isChoice && !checked ? 'Check' : idx === STREAK ? `Collect +${xp} XP` : 'Continue';
  const ctaDisabled = (isChoice && !checked && pick === null) || gated;

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientBackground starCount={40} />

      <View style={styles.header}>
        <SpringPressable haptic={false} scaleTo={0.85} onPress={() => router.back()} style={styles.close} hitSlop={10}>
          <UIcon name="close" size={22} color={theme.mutedForeground} />
        </SpringPressable>
        <View style={[styles.track, { backgroundColor: theme.muted }]}>
          <View style={[styles.fill, { backgroundColor: theme.primary, width: `${((idx + 1) / (STREAK + 1)) * 100}%` }]} />
        </View>
      </View>

      <View style={styles.body}>
        {idx === 0 && (
          <Animated.View key="intro" entering={FadeIn} exiting={FadeOut.duration(Duration.exit)} style={styles.centered}>
            <Atlas size={132} expression="happy" entrance="bounce" idle />
            <View style={{ alignSelf: 'stretch', alignItems: 'center', marginTop: Spacing.four }}>
              <AtlasSpeech text="Ready? Let's get into it." delay={420} tail="top" maxWidth={272} />
            </View>
            <ThemedText type="label" style={{ color: theme.iconLilac, marginTop: Spacing.four }}>
              {(getCourseById(courseId)?.title ?? 'Course').toUpperCase()} · LESSON {lesson.num}
            </ThemedText>
            <ThemedText type="display" style={styles.title}>{lesson.title}</ThemedText>
            <ThemedText type="body" themeColor="mutedForeground" style={styles.center}>
              {total} steps · {xp} XP
            </ThemedText>
          </Animated.View>
        )}

        {norm && (
          <Animated.View key={`s${idx}`} entering={FadeInDown} exiting={FadeOut} style={styles.stepBody}>
            {norm.kind === 'prose' && <LessonProse label={norm.label} title={norm.title} blocks={norm.blocks} />}

            {norm.kind === 'todo' && (
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <LessonProse label="Walkthrough" title={norm.title} blocks={norm.blocks} />
              </View>
            )}

            {norm.kind === 'reveal' && <ScrollView style={styles.midScroll} contentContainerStyle={styles.midContent} showsVerticalScrollIndicator={false}><TapReveal spec={norm.spec} onSolvedChange={setSolved} /></ScrollView>}
            {norm.kind === 'match' && <ScrollView style={styles.midScroll} contentContainerStyle={styles.midContent} showsVerticalScrollIndicator={false}><MatchingPairs spec={norm.spec} onSolvedChange={setSolved} /></ScrollView>}
            {norm.kind === 'order' && <ScrollView style={styles.midScroll} contentContainerStyle={styles.midContent} showsVerticalScrollIndicator={false}><OrderSteps spec={norm.spec} onSolvedChange={setSolved} /></ScrollView>}
            {norm.kind === 'line' && <ScrollView style={styles.midScroll} contentContainerStyle={styles.midContent} showsVerticalScrollIndicator={false}><NumberLine spec={norm.spec} onSolvedChange={setSolved} /></ScrollView>}
            {norm.kind === 'multi' && <ScrollView style={styles.midScroll} contentContainerStyle={styles.midContent} showsVerticalScrollIndicator={false}><MultiSelect spec={norm.spec} onSolvedChange={setSolved} /></ScrollView>}
            {norm.kind === 'build' && <ScrollView style={styles.midScroll} contentContainerStyle={styles.midContent} showsVerticalScrollIndicator={false}><TileBuilder spec={norm.spec} onSolvedChange={setSolved} /></ScrollView>}

            {norm.kind === 'choice' && (
              /* SCROLLS. An authored question can run 380pt on its own and each option another
                 ~190pt, so a four-option step is roughly twice the viewport. As a plain View
                 the overflow fell under the pinned footer and the LAST OPTIONS COULD NOT BE
                 TAPPED AT ALL — a question you cannot answer. */
              <ScrollView
                style={styles.midScroll}
                contentContainerStyle={styles.choiceContent}
                showsVerticalScrollIndicator={false}>
                <View style={styles.quizHead}>
                  <Atlas
                    size={56}
                    expression={checked ? (pick === norm.correct ? 'happy' : 'oops') : 'default'}
                    shake={checked && pick !== norm.correct}
                    celebrate={checked && pick === norm.correct}
                    celebrateKey={checked && pick === norm.correct ? 1 : 0}
                    interactive={false}
                  />
                  <ThemedText type="title" style={{ flex: 1, fontSize: 21 }}>{norm.prompt}</ThemedText>
                </View>
                <View style={{ gap: Spacing.two + 4, marginTop: Spacing.four }}>
                  {norm.options.map((o, i) => {
                    const isPick = pick === i;
                    const showRight = checked && i === norm.correct;
                    const showWrong = checked && isPick && i !== norm.correct;
                    const border = showRight ? theme.success : showWrong ? theme.warning : isPick ? theme.primary : theme.border;
                    return (
                      <SpringPressable key={`${i}-${o}`} disabled={checked} haptic={!checked} onPress={() => setPick(i)}>
                        <View style={[styles.option, { borderColor: border, borderWidth: isPick || showRight ? 2 : StyleSheet.hairlineWidth, backgroundColor: isPick && !checked ? theme.primary + '14' : theme.card }]}>
                          <ThemedText type="bodyMedium" style={{ flex: 1 }}>{o}</ThemedText>
                          {showRight && <UIcon name="check" size={20} color={theme.success} strokeWidth={3} />}
                        </View>
                      </SpringPressable>
                    );
                  })}
                </View>
              </ScrollView>
            )}
          </Animated.View>
        )}

        {idx === DONE && (
          <Animated.View key="done" entering={FadeIn} exiting={FadeOut.duration(Duration.exit)} style={styles.centered}>
            <CelebrationWipe />
            <Confetti />
            <CelebrationRays size={330} delay={120} />
            <Atlas size={120} expression="proud" celebrate celebrateGain={1} entrance="arrive" idle />
            <RewardPop delay={900}>
              <ThemedText type="display" style={styles.title}>Lesson complete!</ThemedText>
            </RewardPop>
            <View style={styles.rewardRow}>
              <RewardPop delay={1180}>
                <View style={[styles.xpChip, { backgroundColor: theme.primary + '1F', borderColor: theme.primary + '4D' }]}>
                  <UIcon name="sparkle" size={18} color={theme.iconLilac} />
                  <NumberRollup value={xp} prefix="+" suffix=" XP" duration={700} type="heading" style={{ color: theme.iconLilac, fontSize: 18 }} />
                </View>
              </RewardPop>
              <RewardPop delay={1340}>
                <View style={[styles.xpChip, { backgroundColor: '#F9731618', borderColor: '#F9731640' }]}>
                  <UIcon name="flame" size={18} color="#F97316" />
                  <NumberRollup value={streakAfter} suffix=" day streak" duration={700} type="heading" style={{ color: '#F97316', fontSize: 18 }} />
                </View>
              </RewardPop>
            </View>
            <RewardPop delay={1620}>
              <ThemedText type="body" themeColor="mutedForeground" style={[styles.center, { marginTop: Spacing.three }]}>Atlas is proud of you.</ThemedText>
            </RewardPop>
          </Animated.View>
        )}

        {idx === STREAK && (
          <Animated.View key="streak" entering={FadeIn} exiting={FadeOut.duration(Duration.exit)} style={styles.centered}>
            <StreakIgnite days={streakAfter} />
          </Animated.View>
        )}
      </View>

      {isChoice && checked ? (
        <View style={styles.verdictWrap}>
          {pick === norm.correct ? <SparkBurst size={190} /> : null}
          <FeedbackBanner
            correct={pick === norm.correct}
            title={pick === norm.correct ? 'Exactly right.' : 'Not quite.'}
            detail={pick === norm.correct ? norm.right : norm.wrong}
          >
            <GradientButton label={ctaLabel} full onPress={advance} />
          </FeedbackBanner>
        </View>
      ) : (
        <View style={styles.footer}>
          <GradientButton label={ctaLabel} full disabled={ctaDisabled} onPress={advance} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingTop: Spacing.one },
  close: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  track: { flex: 1, height: 8, borderRadius: 8, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 8 },
  body: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.three },
  stepBody: { flex: 1 },
  /** Interactive steps SCROLL. As a plain centred View, any step taller than the space
   *  available overflowed symmetrically — so its bottom slid underneath the pinned footer.
   *  MultiSelect's own Check button ended up 70% covered by the footer's Continue, and since
   *  the footer renders after this, it swallowed the taps: the button looked dead. flexGrow
   *  keeps short steps centred; tall ones scroll instead of hiding under the CTA. */
  midScroll: { flex: 1 },
  midContent: { flexGrow: 1, justifyContent: 'center', paddingBottom: Spacing.two },
  /** Questions start at the TOP rather than centred — a long prompt centred vertically pushes
   *  its own options off both ends. */
  choiceContent: { flexGrow: 1, paddingBottom: Spacing.four },
  rewardRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.two, marginTop: Spacing.one },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { textAlign: 'center', marginTop: Spacing.three },
  center: { textAlign: 'center', marginTop: Spacing.two, paddingHorizontal: Spacing.two },
  // flex-start, not center: authored questions run to 7+ lines and a vertically-centred mascot
  // ends up floating in the middle of the paragraph
  quizHead: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two + 4 },
  option: { flexDirection: 'row', alignItems: 'center', padding: Spacing.three, borderRadius: Radius.lg },
  xpChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.pill, borderWidth: 1, marginTop: Spacing.three },
  verdictWrap: { paddingBottom: Spacing.three },
  footer: { padding: Spacing.four, paddingTop: Spacing.two },
});
