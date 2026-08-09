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
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

import { AmbientBackground } from '@/components/ambient-background';
import { AskAtlasRow } from '@/components/ask-atlas';
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
import { Skeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { TileBuilder } from '@/components/tile-builder';
import { UIcon } from '@/components/ui-icon';
import { GradientButton } from '@/components/ui/button';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { Ev, track } from '@/lib/analytics';
import { useTheme } from '@/hooks/use-theme';
import { COURSES, getCourseById, loadCourseLessons, type PathwayLesson } from '@/lib/curriculum';
import { gates, normalizeStep } from '@/lib/lesson-steps';
import { lessonKey, useApp } from '@/lib/store';
import { TRIAL_DAYS, useTier } from '@/lib/entitlement';
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
  /*
   * The gate lives HERE rather than at the three call sites (home.tsx, learn.tsx,
   * digest/[slug].tsx) because every one of them lands on this route. Guarding the list only would
   * leave a locked lesson reachable by deep link.
   *
   * Asks the entitlement module rather than the old `store.canAccessLesson`, which was deleted with
   * FREE_LESSON_LIMIT in C27. `useTier()` and not an inlined `!isPro && days > TRIAL_DAYS`: writing
   * the expiry rule out again here would put a second authority on the money path, which is the C19
   * defect Unit 3 existed to remove. `useTier` returns a STRING, so it is safe to subscribe to —
   * `entitled()` returns a fresh object and looping on that once took down the whole Learn tab.
   *
   * Lessons are unmetered during the trial now, so expiry is the ONLY thing that can lock this
   * route. That is why this reads a tier rather than a refusal.
   */
  const expired = useTier() === 'expired';
  const locked = !badParams && expired;

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
      // 17b funnel: first_lesson_completed, the activation step. Sampled BEFORE the call, because
      // `completeLesson` is what makes the count non-zero — reading it afterwards can never see the
      // transition. Tracked here rather than in the store: `analytics` imports the store, so the
      // store importing analytics would close a cycle.
      const wasFirst = useApp.getState().completedLessons.length === 0;
      useApp.getState().completeLesson(lessonKey(courseId, lessonNum), xp);
      // Guarded on the count actually moving, so re-finishing a completed lesson (which dedupes to
      // a no-op) cannot re-fire activation.
      if (wasFirst && useApp.getState().completedLessons.length === 1) {
        track(Ev.firstLesson, { course: courseId, lesson: lessonNum });
      }
      // Bloom pays out free stock the moment a quiz is passed. `completeLesson` queues the cards;
      // route to them if any landed. A REPEAT of a finished lesson queues nothing (same dedupe),
      // so this correctly falls through to `back()` and never shows an empty reward screen.
      if (useApp.getState().pendingRewards.length > 0) router.replace('/reward');
      else router.back();
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

  if (locked) {
    return (
      <SafeAreaView style={styles.safe}>
        <AmbientBackground starCount={30} />
        <View style={styles.centered}>
          <Atlas size={110} expression="watching" />
          {/* C27: the refusal is now always expiry, never a spent lesson count — so the copy says
              what actually happened. §20.1's headline, matched to the gate sheet's so a user who
              arrives by deep link reads the same sentence as one who tapped a node. */}
          <ThemedText type="title" style={styles.title}>Your free {TRIAL_DAYS} days are up.</ThemedText>
          <ThemedText type="body" themeColor="mutedForeground" style={styles.center}>
            Euphoria Pro reopens every lesson across all {COURSES.length} courses.
          </ThemedText>
        </View>
        <View style={styles.footer}>
          <GradientButton label="See Euphoria Pro" full onPress={() => router.push('/onboarding?step=paywall')} />
          {/*
           * A WAY OUT, and it is not optional. Found by looking at the screenshot: this state
           * shipped with only the upsell, so an expired user who arrived by cold deep link had no
           * back stack and no dismiss — stranded on a wall. §22 C13 names that consequence
           * explicitly ("a non-dismissible gate would strand the user completely") and the gate
           * sheet obeys it; this route did not.
           *
           * `canGoBack` guarded because the stranding case IS the cold link, where there is nothing
           * to go back TO — that is the one path a bare router.back() cannot serve.
           */}
          <SpringPressable
            haptic={false}
            style={styles.lockedOut}
            accessibilityRole="button"
            accessibilityLabel="Back to the pathway"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/learn'))}>
            <ThemedText type="small" themeColor="mutedForeground">Back to the pathway</ThemedText>
          </SpringPressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={styles.safe}>
        <AmbientBackground starCount={30} />
        {/* UNIT 13 item 3: reserve the lesson card's geometry so the screen does not jump when it lands. */}
        <View style={styles.loadingShape} accessibilityRole="progressbar" accessibilityLabel="Loading lesson">
          <Skeleton height={22} width="55%" radius={Radius.sm} />
          <Skeleton height={220} radius={Radius.lg} />
          <Skeleton height={16} width="80%" />
          <Skeleton height={16} width="65%" />
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Steps that ship their OWN action button must not get a second one from the footer.
   *
   * MultiSelect renders "Check answer"; the footer rendered "Continue" directly on top of it.
   * Measured on device: Check occupied top=738..bottom=782, Continue top=760..bottom=816 — 22pt,
   * exactly HALF the Check button, underneath a control that paints after it and therefore
   * swallows the taps. The step could not be submitted.
   *
   * `lesson.tsx` already carried a note describing this precise failure as fixed. It was not:
   * the earlier fix made the step SCROLL, which stopped it being clipped, but two CTAs stacked in
   * the same place is a z-order problem, not a scrolling one. Removing the duplicate is the fix.
   *
   * Once solved, `gates()` opens and the footer returns to carry the user forward.
   *
   * GENERALISED, because `multi` was not alone. `number-line` ships the same trailing control
   * ("Check your answer") and therefore the same collision — it was simply never exercised. Both
   * render it as a SpringPressable rather than a GradientButton, which is why grepping for the
   * button component found nothing and the bug stayed invisible. Any future step that validates
   * itself belongs in this set; steps that only need "keep going" (reveal, order, match) leave the
   * footer alone.
   */
  const ownsItsCta = OWN_CTA_STEPS.has(norm?.kind ?? '') && !solved;

  const gated = norm ? gates(norm) && !solved : false;
  const ctaLabel = isChoice && !checked ? 'Check' : idx === STREAK ? `Collect +${xp} XP` : 'Continue';
  const ctaDisabled = (isChoice && !checked && pick === null) || gated;

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientBackground starCount={40} />

      <View style={styles.header}>
        <SpringPressable haptic={false} scaleTo={0.85} onPress={() => router.back()} style={styles.close} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close">
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
                  <ThemedText type="title" style={{ flex: 1, fontSize: FontSize.headingXl }}>{norm.prompt}</ThemedText>
                </View>
                <View style={{ gap: Spacing.two + 4, marginTop: Spacing.four }}>
                  {norm.options.map((o, i) => {
                    const isPick = pick === i;
                    const showRight = checked && i === norm.correct;
                    const showWrong = checked && isPick && i !== norm.correct;
                    const border = showRight ? theme.success : showWrong ? theme.warning : isPick ? theme.primary : theme.border;
                    return (
                      <SpringPressable
                        key={`${i}-${o}`}
                        disabled={checked}
                        haptic={!checked}
                        onPress={() => setPick(i)}
                        accessibilityLabel={showRight ? `${o}. Correct answer.` : showWrong ? `${o}. Incorrect.` : o}
                        /* BOTH keys, deliberately. SpringPressable sets accessibilityState={{disabled}}
                           at its line 46 and spreads {...rest} at 59, so a partial object here would
                           silently drop `disabled` and VoiceOver would offer a locked option as tappable. */
                        accessibilityState={{ selected: isPick, disabled: checked }}>
                        <View style={[styles.option, { borderColor: border, borderWidth: isPick || showRight ? 2 : StyleSheet.hairlineWidth, backgroundColor: isPick && !checked ? theme.primary + '14' : theme.card }]}>
                          <ThemedText type="bodyMedium" style={{ flex: 1 }}>{o}</ThemedText>
                          {/* Every state carries an ICON, not just a border colour. Selection and
                              correctness were previously signalled by hue alone on two of the three
                              states, which is invisible to a colour-blind user and is the defect
                              3 of the 4 ScreensDesign quiz references avoid. */}
                          {showRight && <UIcon name="check" size={20} color={theme.success} strokeWidth={3} />}
                          {showWrong && <UIcon name="close" size={20} color={theme.warning} strokeWidth={3} />}
                          {isPick && !checked && <UIcon name="check" size={20} color={theme.primary} strokeWidth={3} />}
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
                  <NumberRollup value={xp} prefix="+" suffix=" XP" duration={700} type="heading" style={{ color: theme.iconLilac, fontSize: FontSize.subhead }} />
                </View>
              </RewardPop>
              <RewardPop delay={1340}>
                <View style={[styles.xpChip, { backgroundColor: theme.streak + '18', borderColor: theme.streak + '40' }]}>
                  <UIcon name="flame" size={18} color={theme.streak} />
                  <NumberRollup value={streakAfter} suffix=" day streak" duration={700} type="heading" style={{ color: theme.streak, fontSize: FontSize.subhead }} />
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
            {/* Offered ONLY on a wrong answer. Gauth ($600k/mo) fires its "Still feeling stuck?"
                escalation at the moment of failure, not on success and not on the celebration
                screen — reward beats are reserved here, and interrupting one to sell help would
                undo the reward. */}
            {pick !== norm.correct ? (
              <AskAtlasRow topic={lesson.title} label="Still not clear?" />
            ) : null}
            <GradientButton label={ctaLabel} full onPress={advance} />
          </FeedbackBanner>
        </View>
      ) : ownsItsCta ? null : (
        <View style={styles.footer}>
          <GradientButton label={ctaLabel} full disabled={ctaDisabled} onPress={advance} />
        </View>
      )}
    </SafeAreaView>
  );
}

/** Height the pinned footer occupies: a ~50pt CTA inside `footer`'s 24 bottom / 8 top padding.
 *  Any scrollable step must reserve this much or its last row renders under the button — and the
 *  footer paints after the body, so it swallows the taps too.
 *
 *  MEASURED, and the measurement corrected a wrong assumption. A 6-row OrderSteps put its last
 *  row at top=717..bottom=796 against a Continue at top=760..bottom=816 — 36pt, ~46% of the row,
 *  under the button, and the tap only landed because the row's CENTRE cleared the button's top by
 *  4pt. Luck, not clearance.
 *
 *  WHAT THIS CONSTANT DOES AND DOES NOT DO: the step already overflows its container, so
 *  `justifyContent: 'center'` on `midContent` is inert and paddingBottom does NOT lift content —
 *  it extends the scrollable area underneath it. Raising it therefore guarantees the last row can
 *  be scrolled fully clear of the footer; it does NOT change where that row sits at the default
 *  scroll offset. Fixing the default position means shortening the step's vertical rhythm, which
 *  is a design change to OrderSteps, not a padding value. LOGGED, NOT DONE.
 *
 *  Re-measure with `idb ui describe-all` and compare FRAMES, never anchors — an anchor is a
 *  point, not a box, and comparing anchors is what made 96 look sufficient. */
const FOOTER_CLEARANCE = 170;

/** Step kinds that render their OWN validate control. The footer must not stack a second CTA on
 *  top of these — see `ownsItsCta`. */
const OWN_CTA_STEPS = new Set(['multi', 'line']);

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loadingShape: { paddingHorizontal: Spacing.three, paddingTop: Spacing.five, gap: Spacing.three },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingTop: Spacing.one },
  close: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  track: { flex: 1, height: 8, borderRadius: Radius.sm, overflow: 'hidden' },
  fill: { height: 8, borderRadius: Radius.sm },
  body: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.three },
  stepBody: { flex: 1 },
  /** Interactive steps SCROLL. As a plain centred View, any step taller than the space
   *  available overflowed symmetrically — so its bottom slid underneath the pinned footer.
   *  MultiSelect's own Check button ended up 70% covered by the footer's Continue, and since
   *  the footer renders after this, it swallowed the taps: the button looked dead. flexGrow
   *  keeps short steps centred; tall ones scroll instead of hiding under the CTA. */
  midScroll: { flex: 1 },
  /**
   * `paddingBottom` must clear the FOOTER, not merely add breathing room.
   *
   * It was Spacing.two (8pt) while the footer is a ~50pt button inside 24/8 padding — roughly
   * 90pt tall. So a tall step still ended with its last rows under the CTA. Measured on device:
   * a 6-row OrderSteps put its sixth row at y=789 with Continue's centre at y=788, and taps on
   * that row were swallowed exactly as the note above describes. Because the last row of an
   * ordering puzzle is often the one you must move, the step could not be completed without a
   * scroll the UI never asked for.
   *
   * The scroll fixed the CLIPPING; this fixes the OCCLUSION.
   */
  midContent: { flexGrow: 1, justifyContent: 'center', paddingBottom: FOOTER_CLEARANCE },
  /** Questions start at the TOP rather than centred — a long prompt centred vertically pushes
   *  its own options off both ends. */
  choiceContent: { flexGrow: 1, paddingBottom: FOOTER_CLEARANCE },
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
  // 44pt tall so the escape from a wall clears the HIG touch minimum on its own, without relying on
  // hitSlop — this is the only way off the screen.
  lockedOut: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: Spacing.four, marginTop: Spacing.two },
});
