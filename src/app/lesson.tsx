/**
 * Lesson viewer — intro → the lesson's REAL steps → celebration → streak.
 *
 * This screen used to render one hardcoded demo lesson ("Foundations · Lesson 9 · What is a
 * stock?") no matter which node you tapped, while the authored website curriculum sat unused in
 * src/lib/curriculum. It now loads the lesson named by the `course`/`num` params that learn.tsx
 * has always passed, and renders each step through normalizeStep() (see lib/lesson-steps.ts),
 * which maps the 24 authored step types onto the interactive components we already ship.
 *
 * XP comes from the data (`lesson.xp`), not a hardcoded 50.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AmbientBackground } from '@/components/ambient-background';
import { LessonAtlasButton, buildAtlasLessonContext } from '@/components/ask-atlas';
import { Atlas } from '@/components/atlas';
import { AtlasCorrection } from '@/components/atlas-correction';
import { VocabConversation } from '@/components/atlas-conversation';
import { AtlasIntro, hasSeenAtlasIntro, resetAtlasIntroForDev } from '@/components/atlas-intro';
import { AtlasSpeech } from '@/components/atlas-speech';
import { CelebrationRays, CelebrationWipe } from '@/components/celebration-burst';
import { Confetti } from '@/components/confetti';
import { FeedbackBanner, SparkBurst } from '@/components/lesson-feedback';
import { InteractiveGraph, type InteractiveGraphControlValue } from '@/components/interactive-graph';
import { HookOpener } from '@/components/hook-opener';
import { LessonProse } from '@/components/lesson-prose';
import { LessonDesignProvider } from '@/components/lesson-design-provider';
import { LessonWarmup } from '@/components/lesson-warmup';
import { LessonStepSessionProvider } from '@/components/lesson-step-session';
import { MatchingPairs } from '@/components/matching-pairs';
import { CalcBlanks } from '@/components/calc-blanks';
import { MasteryChallengeIntro } from '@/components/mastery-challenge-intro';
import { MasteryChallengeRound } from '@/components/mastery-challenge-round';
import { MultiSelect } from '@/components/multi-select';
import { NumberLine } from '@/components/number-line';
import { OrderSteps } from '@/components/order-steps';
import { ProgressiveCalc } from '@/components/progressive-calc';
import { StreakIgnite } from '@/components/streak-ignite';
import { StepModeTransition } from '@/components/step-mode-transition';
import { StakesCard } from '@/components/stakes-card';
import { TapReveal } from '@/components/tap-reveal';
import { Skeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { TileBuilder } from '@/components/tile-builder';
import { TrueFalseSequence } from '@/components/true-false-sequence';
import { TeachingSlide } from '@/components/teaching-slide';
import { DismissalOfferSheet } from '@/components/dismissal-offer-sheet';
import { DecisionTree } from '@/components/decision-tree';
import { DragSort } from '@/components/drag-sort';
import { TrialRewardSheet } from '@/components/trial-reward-sheet';
import { UIcon } from '@/components/ui-icon';
import { PixelSpriteView, coin as coinSprite, flame as flameSprite, heart as heartSprite, lightbulb as lightbulbSprite } from '@/lib/pixel';
import { Button, SlabButton } from '@/components/ui/button';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { Ev, track } from '@/lib/analytics';
import { useTheme } from '@/hooks/use-theme';
import { AVAILABLE_COURSES, isCourseAvailable, loadCourseLessons, type PathwayLesson } from '@/lib/curriculum';
import { choiceResponse, expandSteps, expandedStepIdentities, gates, isChoiceCorrect, normalizeStep } from '@/lib/lesson-steps';
import { createLessonStepSession, isLessonStepComplete, markLessonStepCompletion } from '@/lib/lesson-step-session';
import { hasMasteryChallenge, lessonProgressPercent } from '@/lib/mastery-challenge-model';
import { shouldAnnouncePractice } from '@/lib/step-mode-transition';
import { lessonKey, useApp } from '@/lib/store';
import { queueLessonTrailCelebration } from '@/lib/lesson-trail-celebration';
import { TRIAL_DAYS, useTier } from '@/lib/entitlement';
import { EARN } from '@/lib/shop-items';
import { IAP_ENABLED } from '@/lib/purchases';
import { dismissalOfferAvailable } from '@/lib/dismissal-offer';
import { trialRewardAvailable } from '@/lib/trial-reward';
import { semanticMotionForLessonStep } from '@/lib/semantic-motion';
import { NumberRollup } from '@/shared/motion/number-rollup';
import { RewardPop } from '@/shared/motion/reward-pop';
import { SemanticMotion } from '@/shared/motion/semantic-motion';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { Duration } from '@/shared/motion/tokens';

function LessonProgress({ percent }: { percent: number }) {
  const reduced = useReducedMotion();
  const width = useSharedValue(percent);

  useEffect(() => {
    width.set(reduced ? percent : withTiming(percent, { duration: 400 }));
  }, [percent, reduced, width]);

  const progressStyle = useAnimatedStyle(() => ({ width: `${width.get()}%` }));

  return (
    <Animated.View style={[styles.fill, progressStyle]}>
      <LinearGradient
        colors={['#A650E7', '#BA66EA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

export default function Lesson() {
  /** When this lesson was opened. Set in an effect to keep render pure. */
  const openedAt = useRef(0);
  const theme = useTheme();
  const streakAfter = useApp((s) => s.streakIfCompletedToday());
  const completedLessonIds = useApp((s) => s.completedLessons);
  const params = useLocalSearchParams<{ course?: string; num?: string; fresh?: string; qa?: string }>();
  const courseId = params.course ?? '';
  const lessonNum = Number(params.num);
  const qa = __DEV__ ? params.qa : undefined;
  const forceFreshAtlasIntro = __DEV__ && params.fresh === '1';

  const [lesson, setLesson] = useState<PathwayLesson | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [atlasIntroNeeded, setAtlasIntroNeeded] = useState<boolean | null>(null);
  const [showAtlasIntro, setShowAtlasIntro] = useState(false);
  const [challengeStage, setChallengeStage] = useState<'none' | 'intro' | 'round'>('none');
  // bad params are knowable at render — deriving this keeps setState out of the effect body
  const badParams = !courseId || !Number.isFinite(lessonNum) || !isCourseAvailable(courseId);
  const missing = qa === 'not-found' || badParams || notFound;
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
  const tier = useTier();
  const expired = tier === 'expired';
  // Pro includes unlimited lesson attempts. A subscriber can still have zero persisted hearts
  // from before upgrading, so checking the raw count alone would strand a paying user forever.
  const heartLimited = tier !== 'pro';
  const locked = !badParams && expired;

  useEffect(() => {
    let live = true;
    void (async () => {
      if (forceFreshAtlasIntro) await resetAtlasIntroForDev();
      const seen = forceFreshAtlasIntro ? false : await hasSeenAtlasIntro();
      if (live) setAtlasIntroNeeded(!seen);
    })();
    return () => { live = false; };
  }, [courseId, forceFreshAtlasIntro, lessonNum]);

  // expandSteps only lifts authored compound scenes whose native runtime still needs outer screens.
  // Progressive calculations deliberately remain one scene and advance internally, as on web.
  const steps = useMemo(() => expandSteps(lesson?.steps ?? []), [lesson]);
  const stepIdentities = useMemo(() => expandedStepIdentities(lesson?.steps ?? []), [lesson]);
  const total = steps.length;
  const authoredTotal = lesson?.steps.length ?? 0;
  const hasChallenge = hasMasteryChallenge(lesson?.challenge);
  // 0 = intro, 1..total = content, total+1 = done, total+2 = streak
  const DONE = total + 1;
  const STREAK = total + 2;

  const [idx, setIdx] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  /* Hearts and hints (N21). Both are shop mechanics the web has and iOS did not, so buying a
   * Heart Refill or a Hint Pack now buys something that exists. Kept ADDITIVE and contained: the
   * curriculum re-sync is about to change this runner, and a restructure would collide with it. */
  const hearts = useApp((st) => st.heartsNow());
  const hintsLeft = useApp((st) => st.hints);
  const loseHeart = useApp((st) => st.loseHeart);
  const spendHint = useApp((st) => st.spendHint);
  /** Revealed by a spent hint, so the reveal survives re-renders and cannot be re-bought per render. */
  const [hinted, setHinted] = useState(false);
  const [outOfHearts, setOutOfHearts] = useState(false);
  // Keep the wall through a failed Shop detour. A successful purchase changes the persisted balance,
  // which reveals the paused lesson immediately; the next normal advancement clears the wall state.
  const heartWallVisible = outOfHearts && hearts <= 0;
  const [solved, setSolved] = useState(false);
  /** Rewritten teaching slides with authored recaps hand Continue to Atlas first. */
  const [showRecap, setShowRecap] = useState(false);
  const [announcePractice, setAnnouncePractice] = useState(false);
  /**
   * Per-screen view state for the in-lesson Back control.
   *
   * The old header only exposed X, so the only way to reread the previous screen was to abandon
   * the lesson and start over. Keep the small amount of runner-owned state here so Back can revisit
   * a question without erasing its submitted answer or charging a second heart when the learner
   * moves forward again. Child-owned widgets may remount visually, but `solved` keeps an already
   * completed gate open.
   */
  const visitedScreenState = useRef(new Map<number, {
    pick: number | null;
    checked: boolean;
    solved: boolean;
    hinted: boolean;
    showRecap: boolean;
  }>());
  /** Child interaction snapshots and monotonic completion, scoped to this mounted lesson attempt. */
  const [lessonStepSession] = useState(() => createLessonStepSession());
  /** 17c. Holds the post-lesson navigation open so the reward offer can land on the win. */
  const [trialReward, setTrialReward] = useState(false);
  /** 17d. Raised when the hard wall is dismissed and a better ask is still unspent. */
  const [offer, setOffer] = useState(false);
  /** Tutor memory mirrors the web runner but stays session-local to this lesson attempt. */
  const [correctSoFar, setCorrectSoFar] = useState(0);
  const [recentMistakes, setRecentMistakes] = useState<string[]>([]);
  const [graphControlState, setGraphControlState] = useState<{
    stepIndex: number;
    values: InteractiveGraphControlValue[];
  } | null>(null);
  const captureGraphValues = useCallback((values: InteractiveGraphControlValue[]) => {
    setGraphControlState({ stepIndex: idx, values });
  }, [idx]);

  const norm = useMemo(() => (idx >= 1 && idx <= total ? normalizeStep(steps[idx - 1]) : null), [idx, total, steps]);
  const authoredIdentity = idx > 0 && idx <= total ? stepIdentities[idx - 1] : undefined;
  const isChoice = norm?.kind === 'choice';
  const isFillBlank = isChoice && norm.sourceType === 'fillBlank';
  const gradedChoice = isChoice && checked && pick !== null ? choiceResponse(norm, pick) : undefined;
  const xp = lesson?.xp ?? 30;
  const atlasContext = useMemo(() => {
    if (!lesson || !norm || idx < 1 || idx > total || challengeStage !== 'none') return undefined;
    const attempted = isChoice ? checked || hinted : solved;
    const wasCorrect = isChoice && checked && pick !== null ? isChoiceCorrect(norm, pick) : undefined;
    return buildAtlasLessonContext({
      courseId,
      lessonTitle: lesson.title,
      lessonNumber: lesson.num,
      step: steps[idx - 1],
      normalized: norm,
      stepIndex: authoredIdentity?.authoredIndex ?? idx - 1,
      total: authoredTotal,
      attempted,
      wasCorrect,
    chosen: isChoice && checked && pick !== null ? norm.options[pick] : undefined,
    chosenIndex: isChoice && checked && pick !== null ? pick : undefined,
      correctSoFar,
      recentMistakes,
      graphControls: graphControlState?.stepIndex === idx ? graphControlState.values : undefined,
    });
  }, [authoredIdentity?.authoredIndex, authoredTotal, challengeStage, checked, correctSoFar, courseId, graphControlState, hinted, idx, isChoice, lesson, norm, pick, recentMistakes, solved, steps, total]);

  const rememberCurrentScreen = () => {
    visitedScreenState.current.set(idx, { pick, checked, solved, hinted, showRecap });
  };

  const captureSolved = useCallback((nextSolved: boolean) => {
    setSolved(markLessonStepCompletion(lessonStepSession, idx, nextSolved));
  }, [idx, lessonStepSession]);

  useEffect(() => {
    if (qa === 'loading') return;
    if (badParams) {
      Promise.resolve().then(() => {
        setNotFound(true);
        openedAt.current = Date.now();
        setCorrectSoFar(0);
        setRecentMistakes([]);
      });
      return;
    }

    let cancelled = false;
    loadCourseLessons(courseId)
      .then((ls) => {
        if (cancelled) return;
        const found = ls.find((l) => l.num === lessonNum) ?? null;
        setChallengeStage('none');
        setLesson(found);
        setNotFound(!found);
        if (found && qa === 'complete') setIdx(expandSteps(found.steps).length + 1);
        if (found && qa === 'heart-wall') setOutOfHearts(true);
        openedAt.current = Date.now();
        setCorrectSoFar(0);
        setRecentMistakes([]);
      })
      .catch(() => {
        if (cancelled) return;
        setNotFound(true);
        openedAt.current = Date.now();
        setCorrectSoFar(0);
        setRecentMistakes([]);
      });

    return () => {
      cancelled = true;
    };
  }, [badParams, courseId, lessonNum, qa]);

  const openLessonScreen = (nextIndex: number) => {
    const saved = visitedScreenState.current.get(nextIndex);
    setIdx(nextIndex);
    setPick(saved?.pick ?? null);
    setChecked(saved?.checked ?? false);
    setSolved(isLessonStepComplete(lessonStepSession, nextIndex) || (saved?.solved ?? false));
    setHinted(saved?.hinted ?? false);
    setShowRecap(saved?.showRecap ?? false);
    setOutOfHearts(false);
  };

  const previousScreen = () => {
    if (idx <= 0) return;
    Keyboard.dismiss();
    rememberCurrentScreen();
    openLessonScreen(idx - 1);
  };

  const gradeChoice = (selectedIndex: number) => {
    if (norm?.kind !== 'choice' || checked) return;
    setPick(selectedIndex);
    setChecked(true);
    if (isChoiceCorrect(norm, selectedIndex)) {
      setCorrectSoFar((value) => value + 1);
    } else {
      setRecentMistakes((previous) => [...previous, norm.prompt].slice(-3));
    }
    if (heartLimited && !isChoiceCorrect(norm, selectedIndex) && !hinted) loseHeart();
  };

  const advance = () => {
    Keyboard.dismiss();

    if (idx === 0 && atlasIntroNeeded !== false) {
      setShowAtlasIntro(true);
      return;
    }

    if (isChoice && !checked) {
      if (pick !== null) gradeChoice(pick);
      return;
    }
    /*
     * OUT OF HEARTS. Checked AFTER the answer is graded, so the last wrong answer still shows its
     * feedback rather than being swallowed by a gate — being told "you're out" without being told
     * "and that one was wrong" is two pieces of bad news delivered as one confusing one.
     *
     * This does NOT strand anyone, and that is not optional: the same file already carries the
     * §22 C13 note that "a non-dismissible gate would strand the user completely". The sheet below
     * always offers a way out of the lesson, and hearts refill on their own tomorrow, so the shop
     * is an accelerator and never the only exit.
     */
    if (heartLimited && isChoice && checked && norm && pick !== null && !isChoiceCorrect(norm, pick) && hearts <= 0) {
      setOutOfHearts(true);
      return;
    }
    if (norm?.kind === 'prose' && norm.atlas?.recap && !showRecap) {
      setShowRecap(true);
      return;
    }
    if (idx === total && hasChallenge) {
      rememberCurrentScreen();
      setChallengeStage('intro');
      return;
    }
    if (idx < STREAK) {
      rememberCurrentScreen();
      if (idx >= 1 && idx < total && shouldAnnouncePractice(steps[idx - 1], steps[idx])) {
        setAnnouncePractice(true);
      }
      openLessonScreen(idx + 1);
    } else {
      // 17b funnel: first_lesson_completed, the activation step. Sampled BEFORE the call, because
      // `completeLesson` is what makes the count non-zero — reading it afterwards can never see the
      // transition. Tracked here rather than in the store: `analytics` imports the store, so the
      // store importing analytics would close a cycle.
      const wasFirst = useApp.getState().completedLessons.length === 0;
      /*
       * REAL TIME, not the lesson's listed length. Reported 2026-08-22: "it looks like the app
       * measures time based on the lesson's listed duration, not actual time spent in-app. After
       * finishing a lesson it shows 5 minutes even if you were on the app much longer."
       *
       * Measured from mount, so the intro screen and any thinking time count — a learner who sat
       * with a question for four minutes did spend those four minutes here. The store clamps the
       * value; this side only reports it.
       */
      // goal-minutes-pin expects Date.now() - openedAt.current in lesson.tsx
      // eslint-disable-next-line react-hooks/purity
      const minutesSpent = (Date.now() - openedAt.current) / 60000;
      const completedId = lessonKey(courseId, lessonNum);
      const alreadyCompleted = useApp.getState().completedLessons.includes(completedId);
      useApp.getState().completeLesson(completedId, xp, minutesSpent);
      if (!alreadyCompleted) queueLessonTrailCelebration(completedId);
      // Guarded on the count actually moving, so re-finishing a completed lesson (which dedupes to
      // a no-op) cannot re-fire activation.
      if (wasFirst && useApp.getState().completedLessons.length === 1) {
        track(Ev.firstLesson, { course: courseId, lesson: lessonNum });
        /*
         * 17c fires HERE, on the first lesson finished inside the trial — the win Headway's chest
         * is anchored to, and the only moment at which the approved copy ("That's your first lesson
         * done") is true. Navigation is DEFERRED rather than raced: `leave()` runs from the sheet's
         * own exit handlers, so the free-stock cards and the offer can never both animate in.
         *
         * IAP_ENABLED is in the condition for the §0.5 reason the gate sheet uses it: with no
         * configured store there is no better price we could actually honour, and an "Open it" that
         * opens onto nothing is a promise the build cannot keep.
         */
        const s = useApp.getState();
        if (
          trialRewardAvailable({
            iapEnabled: IAP_ENABLED,
            isPro: s.isPro,
            trialRewardSeenAt: s.trialRewardSeenAt,
            activeDays: s.activeDays.length,
            trialDays: TRIAL_DAYS,
          })
        ) {
          setTrialReward(true);
          return;
        }
      }
      leave();
    }
  };

  /**
   * Where a finished lesson goes. Bloom pays out free stock the moment a quiz is passed;
   * `completeLesson` queues the cards, so route to them if any landed. A REPEAT of a finished lesson
   * queues nothing (same dedupe), so this correctly falls through to `back()` and never shows an
   * empty reward screen.
   *
   * Extracted so 17c can run BEFORE it without duplicating the rule — a second copy of this branch
   * is exactly the drift the regression scripts exist to catch.
   */
  function leave() {
    if (useApp.getState().pendingRewards.length > 0) router.replace('/reward');
    else exitLesson();
  }

  /** One safe exit for header, terminal, error, and heart-wall states. */
  function exitLesson() {
    Keyboard.dismiss();
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/learn');
  }

  /**
   * Where the hard wall goes when the user declines.
   *
   * `canGoBack` guarded because the stranding case IS the cold deep link, where there is nothing to
   * go back TO — the one path a bare `router.back()` cannot serve (§22 C13).
   */
  function outOfWall() {
    exitLesson();
  }

  /**
   * 17d on the wall. Makes the second ask ONCE, then gets out of the way — and stamps on the way
   * in rather than on the way out, because unlike 17c this sheet is raised by an explicit dismissal
   * the user already chose, so there is no navigation race that could tear it down unseen.
   */
  function leaveWall() {
    const s = useApp.getState();
    if (dismissalOfferAvailable({ iapEnabled: IAP_ENABLED, isPro: s.isPro, specialOfferSeenAt: s.specialOfferSeenAt, lessonsDone: s.completedLessons.length })) {
      s.markSpecialOfferSeen();
      track(Ev.specialOfferSeen, { feature: 'lesson' });
      setOffer(true);
      return;
    }
    outOfWall();
  }

  if (missing) {
    return (
      <LessonDesignProvider>
      <SafeAreaView style={styles.safe}>
        <AmbientBackground starCount={30} />
        <View style={styles.centered}>
          <Atlas size={110} expression="oops" idle />
          <ThemedText type="title" style={styles.title}>That lesson isn&apos;t available.</ThemedText>
          <AtlasSpeech text="Pick another from the pathway." tail="top" tailAlign="center" maxWidth={300} />
        </View>
        <View style={styles.footer}>
          <SlabButton label="Back" full onPress={exitLesson} />
        </View>
      </SafeAreaView>
      </LessonDesignProvider>
    );
  }

  if (locked) {
    return (
      <LessonDesignProvider>
      <SafeAreaView style={styles.safe}>
        <AmbientBackground starCount={30} />
        <View style={styles.centered}>
          <Atlas size={110} expression="watching" idle />
          {/* C27: the refusal is now always expiry, never a spent lesson count — so the copy says
              what actually happened. §20.1's headline, matched to the gate sheet's so a user who
              arrives by deep link reads the same sentence as one who tapped a node. */}
          <ThemedText type="title" style={styles.title}>Your free {TRIAL_DAYS} days are up.</ThemedText>
          <ThemedText type="body" themeColor="mutedForeground" style={styles.center}>
            Euphoria Pro reopens every available lesson across {AVAILABLE_COURSES.length} courses.
          </ThemedText>
        </View>
        <View style={styles.footer}>
          <SlabButton label="See Euphoria Pro" full onPress={() => router.push('/onboarding?step=paywall')} />
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
            onPress={leaveWall}>
            <ThemedText type="small" themeColor="mutedForeground">Back to the pathway</ThemedText>
          </SpringPressable>
        </View>

        {/*
         * 17d, per §22 C115. This wall used to let go without ever making the second ask, because
         * the offer lived inside GateSheet and this route does not mount it. Verified on device:
         * tapping Start on Home with an expired trial landed here, and dismissing left
         * `specialOfferSeenAt` null — the same lesson tapped from the Learn tab fired the offer
         * immediately. Same user, same refusal, different door.
         */}
        <DismissalOfferSheet
          visible={offer}
          feature="lesson"
          onAccept={() => {
            setOffer(false);
            router.push('/onboarding?step=paywall');
          }}
          onDismiss={() => {
            setOffer(false);
            outOfWall();
          }}
        />
      </SafeAreaView>
      </LessonDesignProvider>
    );
  }

  if (!lesson) {
    return (
      <LessonDesignProvider>
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
      </LessonDesignProvider>
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
   * render it as a SpringPressable rather than a SlabButton, which is why grepping for the
   * button component found nothing and the bug stayed invisible. Any future step that validates
   * itself belongs in this set; steps that only need "keep going" (reveal, order, match) leave the
   * footer alone.
   */
  const selfAdvancing = norm?.kind === 'hook' || norm?.kind === 'stakes' || norm?.kind === 'dragSort' || norm?.kind === 'vocab' || norm?.kind === 'progressiveCalc' || norm?.kind === 'calc' || norm?.kind === 'reveal' || norm?.kind === 'line';
  const ownsItsCta = OWN_CTA_STEPS.has(norm?.kind ?? '') && (selfAdvancing || !solved);

  const gated = norm ? gates(norm) && !solved : false;
  const ctaLabel = showRecap ? 'Got it' : isChoice && !checked ? 'Submit' : idx === STREAK ? `Collect +${xp} XP` : 'Continue';
  const ctaDisabled = (isChoice && !checked && pick === null) || gated;
  const visibleStep = (authoredIdentity?.authoredIndex ?? 0) + 1;
  const progressPercent = lessonProgressPercent({
    authoredIndex: visibleStep - 1,
    authoredTotal,
    phase: challengeStage !== 'none' ? 'challenge' : idx > total ? 'complete' : 'steps',
    hasChallenge,
  });
  const stepLabel = challengeStage !== 'none' ? 'Challenge' : idx > total ? 'Done' : `${String(visibleStep)}/${String(authoredTotal)}`;

  return (
    <LessonDesignProvider>
    <SafeAreaView style={styles.safe}>
      <AmbientBackground starCount={40} />

      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >

      <View style={[styles.header, { borderBottomColor: 'rgba(139,92,246,0.1)' }]}>
        <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.headerTint]} />
        <View style={styles.lessonNav}>
          <SpringPressable haptic={false} scaleTo={0.97} onPress={exitLesson} style={styles.close} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close lesson">
            <UIcon name="close" size={22} color={theme.mutedForeground} />
          </SpringPressable>
          {idx > 0 && challengeStage === 'none' && (
            <SpringPressable
              haptic={false}
              scaleTo={0.97}
              onPress={previousScreen}
              style={styles.close}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Previous lesson step">
              <UIcon name="chevronLeft" size={22} color={theme.mutedForeground} />
            </SpringPressable>
          )}
        </View>
        <View style={styles.track}>
          <LessonProgress percent={progressPercent} />
        </View>
        <ThemedText type="smallBold" style={[styles.stepLabel, NUM_L]}>{stepLabel}</ThemedText>
      </View>

      <View style={[styles.body, idx === 0 && styles.warmupBody]}>
        {idx === 0 && (
          <LessonWarmup
            courseId={courseId}
            lessonNumber={lesson.num}
            title={lesson.title}
            completedLessonIds={completedLessonIds}
            onDone={advance}
          />
        )}

        {challengeStage === 'none' && norm && (
          <SemanticMotion key={`s${idx}`} event={semanticMotionForLessonStep(norm.kind)} exit style={styles.stepBody}>
            <LessonStepSessionProvider session={lessonStepSession} stepIndex={idx}>
            {norm.kind === 'prose' && (
              showRecap && norm.atlas?.recap ? (
                <ScrollView
                  style={styles.midScroll}
                  contentContainerStyle={styles.recapContent}
                  showsVerticalScrollIndicator={false}>
                  <Atlas size={92} expression="happy" interactive={false} />
                  <AtlasSpeech
                    text={norm.atlas.recap}
                    tail="top"
                    tailAlign="center"
                    maxWidth={320}
                  />
                </ScrollView>
              ) : <>
                <LessonProse
                  label={norm.label}
                  title={norm.title}
                  blocks={norm.blocks}
                  atlasHint={norm.atlas?.hint}
                />
                {/*
                  * THE INTERACTIVE LAB, offered beside the prose rather than instead of it.
                  *
                  * Only `explorable` steps carry `lab`, and only when a screen for that widget
                  * actually exists (see EXPLORABLE_LABS in lesson-steps.ts). The lab uses
                  * router.back(), so this opens it and returns the learner to this exact step —
                  * no progress lost, no special-casing needed here.
                  *
                  * `outline`, not the primary CTA: Continue is what moves the lesson forward and
                  * must stay the loudest thing on the screen. This is an invitation, not the path.
                  */}
                {norm.lab ? (
                  <View style={{ paddingHorizontal: Spacing.four, paddingTop: Spacing.three }}>
                    <Button
                      variant="outline"
                      label={norm.lab.label}
                      // Read into a const first: `norm.lab` inside a closure is not narrowed by the
                      // guard above, and TS is right to say so.
                      onPress={((lab) => () => { router.push(lab.route as never); })(norm.lab)}
                    />
                  </View>
                ) : null}
              </>
            )}
            {norm.kind === 'hook' && <HookOpener spec={norm.spec} onComplete={advance} />}
            {norm.kind === 'teaching' && (
              <TeachingSlide
                spec={norm.spec}
                onComplete={() => {
                  captureSolved(true);
                  advance();
                }}
              />
            )}

            {norm.kind === 'todo' && (
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <LessonProse label="Walkthrough" title={norm.title} blocks={norm.blocks} />
              </View>
            )}

            {norm.kind === 'reveal' && <ScrollView style={styles.midScroll} contentContainerStyle={styles.midContent} showsVerticalScrollIndicator={false}><TapReveal spec={norm.spec} onComplete={(passed) => { captureSolved(passed); advance(); }} /></ScrollView>}
            {norm.kind === 'match' && (
              <ScrollView style={styles.midScroll} contentContainerStyle={styles.midContent} showsVerticalScrollIndicator={false}>
                <MatchingPairs
                  spec={norm.spec}
                  onSolvedChange={captureSolved}
                  onComplete={(passed) => {
                    captureSolved(passed);
                    advance();
                  }}
                />
              </ScrollView>
            )}
            {norm.kind === 'dragSort' && (
              <ScrollView style={styles.midScroll} contentContainerStyle={styles.midContent} showsVerticalScrollIndicator={false}>
                <DragSort
                  spec={norm.spec}
                  onComplete={(passed) => {
                    captureSolved(passed);
                    advance();
                  }}
                />
              </ScrollView>
            )}
            {norm.kind === 'order' && <ScrollView style={styles.midScroll} contentContainerStyle={styles.midContent} showsVerticalScrollIndicator={false}><OrderSteps spec={norm.spec} onSolvedChange={captureSolved} /></ScrollView>}
            {norm.kind === 'line' && (
              <ScrollView style={styles.midScroll} contentContainerStyle={styles.midContent} showsVerticalScrollIndicator={false}>
                <NumberLine
                  spec={norm.spec}
                  onSolvedChange={captureSolved}
                  onComplete={(passed) => {
                    captureSolved(true);
                    if (passed) {
                      setCorrectSoFar((value) => value + 1);
                    } else {
                      setRecentMistakes((previous) => [...previous, norm.spec.prompt].slice(-3));
                    }
                    advance();
                  }}
                />
              </ScrollView>
            )}
            {norm.kind === 'multi' && <ScrollView style={styles.midScroll} contentContainerStyle={styles.midContent} showsVerticalScrollIndicator={false}><MultiSelect spec={norm.spec} onSolvedChange={captureSolved} /></ScrollView>}
            {norm.kind === 'trueFalse' && (
              <ScrollView style={styles.midScroll} contentContainerStyle={styles.midContent} showsVerticalScrollIndicator={false}>
                <TrueFalseSequence
                  spec={norm.spec}
                  onSolvedChange={captureSolved}
                  onComplete={() => {
                    captureSolved(true);
                    advance();
                  }}
                />
              </ScrollView>
            )}
            {norm.kind === 'build' && <ScrollView style={styles.midScroll} contentContainerStyle={styles.midContent} showsVerticalScrollIndicator={false}><TileBuilder spec={norm.spec} onSolvedChange={captureSolved} /></ScrollView>}
            {norm.kind === 'calc' && <ScrollView style={styles.midScroll} contentContainerStyle={styles.midContent} showsVerticalScrollIndicator={false} keyboardDismissMode="interactive" keyboardShouldPersistTaps="handled"><CalcBlanks spec={norm.spec} onComplete={(passed) => { captureSolved(passed); advance(); }} /></ScrollView>}
            {norm.kind === 'progressiveCalc' && (
              <ScrollView style={styles.midScroll} contentContainerStyle={styles.midContent} showsVerticalScrollIndicator={false}>
                <ProgressiveCalc
                  spec={norm.spec}
                  onComplete={(passed) => {
                    captureSolved(passed);
                    advance();
                  }}
                />
              </ScrollView>
            )}
            {norm.kind === 'tree' && (
              <ScrollView style={styles.midScroll} contentContainerStyle={styles.midContent} showsVerticalScrollIndicator={false}>
                <DecisionTree
                  spec={norm.spec}
                  onComplete={(passed) => {
                    if (passed) {
                      setCorrectSoFar((value) => value + 1);
                    } else {
                      setRecentMistakes((previous) => [...previous, norm.spec.decisions[0]?.prompt ?? lesson.title].slice(-3));
                    }
                    // Correctness feeds Atlas/lesson scoring; reaching the result completes the scene.
                    captureSolved(true);
                    advance();
                  }}
                />
              </ScrollView>
            )}
            {norm.kind === 'graph' && (
              <InteractiveGraph
                key={`${courseId}-${String(lesson.num)}-${String(idx)}`}
                step={norm.spec}
                onValuesChange={captureGraphValues}
                onComplete={(passed) => {
                  captureSolved(passed);
                  advance();
                }}
              />
            )}
            {norm.kind === 'vocab' && (
              <VocabConversation
                terms={norm.terms}
                onComplete={(passed) => {
                  captureSolved(passed);
                  advance();
                }}
              />
            )}
            {norm.kind === 'stakes' && (
              <StakesCard spec={norm.spec} onComplete={advance} />
            )}

            {norm.kind === 'choice' && (
              /* SCROLLS. An authored question can run 380pt on its own and each option another
                 ~190pt, so a four-option step is roughly twice the viewport. As a plain View
                 the overflow fell under the pinned footer and the LAST OPTIONS COULD NOT BE
                 TAPPED AT ALL — a question you cannot answer. */
              <ScrollView
                style={styles.midScroll}
                contentContainerStyle={styles.choiceContent}
                showsVerticalScrollIndicator={false}>
                <View style={styles.quizMeta}>
                  {isChoice && !checked && hintsLeft > 0 && !hinted ? (
                    <SpringPressable
                      haptic={false}
                      scaleTo={0.97}
                      onPress={() => { if (spendHint()) setHinted(true); }}
                      accessibilityRole="button"
                      accessibilityLabel={`Use a hint. ${String(hintsLeft)} left.`}
                      style={[styles.hintBtn, { backgroundColor: theme.warning + '33' }]}>
                      <PixelSpriteView sprite={lightbulbSprite} size={16} />
                      <ThemedText type="smallBold" style={[NUM_L, { color: theme.warning }]}>{hintsLeft}</ThemedText>
                    </SpringPressable>
                  ) : null}
                </View>
                {isFillBlank ? (
                  <ThemedText type="body" style={styles.fillBlankPrompt}>
                    {norm.prompt.split('___')[0]}
                    <ThemedText
                      style={[
                        styles.fillBlankSlot,
                        pick !== null && !checked && { color: theme.primary, backgroundColor: theme.primary + '33' },
                        checked && pick === norm.correct && { color: theme.success, backgroundColor: theme.success + '33' },
                        checked && pick !== norm.correct && { color: theme.destructive, backgroundColor: theme.destructive + '33' },
                      ]}>
                      {isFillBlank && pick !== null ? ` ${norm.options[pick]} ` : '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}
                    </ThemedText>
                    {norm.prompt.split('___').slice(1).join('')}
                  </ThemedText>
                ) : (
                  <ThemedText type="heading" style={styles.choicePrompt}>{norm.prompt}</ThemedText>
                )}
                <View style={[styles.options, isFillBlank && styles.fillBlankOptions]}>
                  {norm.options.map((o, i) => {
                    const isPick = pick === i;
                    const optionCorrect = isChoiceCorrect(norm, i);
                    const eliminated = hinted && !checked && i === norm.options.findIndex((_option, index) => index !== norm.correct);
                    const showRight = checked && optionCorrect && (norm.sourceType !== 'scenario' || isPick);
                    const showWrong = checked && isPick && !optionCorrect;
                    const border = showRight ? theme.success : showWrong ? theme.destructive : isPick ? theme.primary : theme.border;
                    const background = showRight
                      ? theme.success + '1A'
                      : showWrong
                        ? theme.destructive + '1A'
                        : isPick
                          ? theme.primary + '1A'
                          : theme.card;
                    return (
                      <SpringPressable
                        key={`${i}-${o}`}
                        scaleTo={0.97}
                        disabled={checked || eliminated}
                        haptic={!checked && !eliminated}
                        onPress={() => norm.submitMode === 'immediate' ? gradeChoice(i) : setPick(i)}
                        accessibilityLabel={eliminated ? `${o}. Eliminated by hint.` : showRight ? `${o}. Correct answer.` : showWrong ? `${o}. Incorrect.` : o}
                        /* BOTH keys, deliberately. SpringPressable sets accessibilityState={{disabled}}
                           at its line 46 and spreads {...rest} at 59, so a partial object here would
                           silently drop `disabled` and VoiceOver would offer a locked option as tappable. */
                        accessibilityState={{ selected: isPick, disabled: checked || eliminated }}
                        style={[isFillBlank && styles.fillBlankOptionWrap, eliminated && styles.eliminated]}>
                        <View style={[styles.option, isFillBlank && styles.fillBlankOption, { borderColor: border, backgroundColor: background }]}> 
                          <ThemedText type="bodyMedium" style={[styles.optionText, isFillBlank && styles.fillBlankOptionText, eliminated && styles.eliminatedText]}>{o}</ThemedText>
                          {/* Every state carries an ICON, not just a border colour. Selection and
                              correctness were previously signalled by hue alone on two of the three
                              states, which is invisible to a colour-blind user and is the defect
                              3 of the 4 ScreensDesign quiz references avoid. */}
                          {showRight && <UIcon name="check" size={20} color={theme.success} strokeWidth={3} />}
                          {showWrong && <UIcon name="close" size={20} color={theme.destructive} strokeWidth={3} />}
                          {isPick && !checked && !isFillBlank && <UIcon name="check" size={20} color={theme.primary} strokeWidth={3} />}
                        </View>
                      </SpringPressable>
                    );
                  })}
                </View>
                {isFillBlank && pick !== null && !checked ? (
                  <View style={styles.fillBlankSubmit}>
                    <Button label="Submit" style={styles.fillBlankSubmitButton} onPress={advance} />
                  </View>
                ) : null}
                {checked ? (
                  <View style={styles.inlineFeedback}>
                    <FeedbackBanner
                      correct={!!gradedChoice?.correct}
                      title={gradedChoice?.correctOutcome ?? 'Ready for the next step.'}
                      detail={gradedChoice?.correct ? 'Correct.' : undefined}
                    >
                      <AtlasCorrection
                        show={gradedChoice?.correction !== undefined}
                        answer={gradedChoice?.correction?.answer}
                        reason={gradedChoice?.correction?.reason}
                      />
                      {gradedChoice?.correct ? <SparkBurst size={150} /> : null}
                      <SlabButton label="Continue" full onPress={advance} />
                    </FeedbackBanner>
                  </View>
                ) : null}
              </ScrollView>
            )}
            </LessonStepSessionProvider>
          </SemanticMotion>
        )}

        {challengeStage !== 'none' && lesson.challenge ? (
          <MasteryChallengeRound
            questions={lesson.challenge}
            lessonTitle={lesson.title}
            onPass={() => {
              setChallengeStage('none');
              openLessonScreen(DONE);
            }}
            onFail={exitLesson}
          />
        ) : null}

        {challengeStage === 'none' && idx === DONE && (
          <SemanticMotion key="done" event="lesson-complete" exit style={styles.midScroll}>
            <CelebrationWipe />
            <Confetti />
            <CelebrationRays size={330} delay={120} />
            {/*
              * Same overflow the intro had: an unscrolled centred container pushes content off
              * BOTH ends once Dynamic Type makes it taller than the screen. The three
              * celebration layers above stay OUTSIDE this ScrollView because they are
              * StyleSheet.absoluteFill — scrolling them would drag the confetti away with the
              * content. `rewardRow` needed nothing; it already carries flexWrap.
              */}
            <ScrollView contentContainerStyle={styles.introContent} showsVerticalScrollIndicator={false}>
            <Atlas size={120} expression="proud" celebrate celebrateGain={1} entrance="arrive" idle />
            <RewardPop delay={900}>
              <ThemedText type="display" maxFontSizeMultiplier={1.6} style={styles.title}>Lesson complete!</ThemedText>
            </RewardPop>
            <View style={styles.rewardRow}>
              <RewardPop delay={1180}>
                <View style={[styles.xpChip, { backgroundColor: theme.primary + '1F', borderColor: theme.primary + '4D' }]}>
                  <NumberRollup value={xp} prefix="+" suffix=" XP" duration={700} type="heading" style={{ color: theme.iconLilac, fontSize: FontSize.subhead }} />
                </View>
              </RewardPop>
              {/*
                * THE EUPHORIUM EARNED, and the one place a sprite is allowed to move.
                *
                * The web plays `coin` with play="once" on exactly this screen, and its house rule
                * is "no idle loops... 'once' for a reaction (a coin awarded, a streak extended)".
                * A lesson completing is that reaction. It plays through and parks on its still.
                *
                * The amount matches completeLesson's arithmetic rather than restating a number:
                * min(lessonMax, lessonMin + xp).
                */}
              <RewardPop delay={1340}>
                <View style={[styles.xpChip, { backgroundColor: theme.iconGold + '18', borderColor: theme.iconGold + '40' }]}>
                  <PixelSpriteView sprite={coinSprite} size={18} play="once" playKey={idx} />
                  <NumberRollup value={Math.min(EARN.lessonMax, EARN.lessonMin + xp)} prefix="+" duration={700} type="heading" style={{ color: theme.iconGold, fontSize: FontSize.body }} />
                </View>
              </RewardPop>
              <RewardPop delay={1500}>
                <View style={[styles.xpChip, { backgroundColor: theme.streak + '18', borderColor: theme.streak + '40' }]}>
                  {/* Same flame, same 'once' reaction as Home — a streak extending is the event. */}
                  <PixelSpriteView sprite={flameSprite} size={18} play="once" playKey={streakAfter} />
                  <NumberRollup value={streakAfter} suffix=" day streak" duration={700} type="heading" style={{ color: theme.streak, fontSize: FontSize.subhead }} />
                </View>
              </RewardPop>
            </View>
            {/* Atlas is ON this screen, expression="proud", mid-celebrate. So this line is HIS,
                and he says it in his own bubble rather than it being printed as a grey caption
                floating under the reward pills. delay matches the RewardPop it replaces, so it
                still lands as the closing beat after XP, coins and streak have all settled. */}
            <View style={{ marginTop: Spacing.three, alignItems: 'center' }}>
              <AtlasSpeech text="Atlas is proud of you." delay={1620} tail="top" tailAlign="center" maxWidth={300} />
            </View>
            </ScrollView>
          </SemanticMotion>
        )}

        {challengeStage === 'none' && idx === STREAK && (
          <Animated.View key="streak" entering={FadeIn} exiting={FadeOut.duration(Duration.exit)} style={styles.centered}>
            <StreakIgnite days={streakAfter} />
          </Animated.View>
        )}

      </View>

      {atlasContext ? (
        <View
          pointerEvents="box-none"
          style={styles.atlasFloat}
        >
          <LessonAtlasButton topic={lesson.title} context={atlasContext} />
        </View>
      ) : null}

      {challengeStage !== 'none' || idx === 0 || (isChoice && !(norm.submitMode === 'confirm' && !checked && pick !== null)) || isFillBlank || ownsItsCta ? null : (
        <View style={styles.footer}>
          <SlabButton label={ctaLabel} full disabled={ctaDisabled} onPress={advance} />
        </View>
      )}

      <View pointerEvents={announcePractice ? 'auto' : 'none'} style={styles.practiceOverlay}>
        <StepModeTransition visible={announcePractice} onDone={() => setAnnouncePractice(false)} />
      </View>
      <MasteryChallengeIntro
        visible={challengeStage === 'intro'}
        onDone={() => setChallengeStage('round')}
      />
      </KeyboardAvoidingView>

      <AtlasIntro
        visible={showAtlasIntro}
        onDone={() => {
          setShowAtlasIntro(false);
          setAtlasIntroNeeded(false);
          advance();
        }}
      />

      {/* 17c. Mounted here rather than on Home so it lands on the completion screen the user is
          already looking at — the win it is anchored to. `leave()` on both exits, so the offer
          always hands back to the normal post-lesson routing. */}
      {/*
        * The out-of-hearts wall. Two ways forward and ONE of them costs nothing: hearts refill on
        * their own on a new day, which is stated rather than left implicit so the shop reads as an
        * accelerator rather than a toll gate.
        */}
      {heartWallVisible && (
        <View style={styles.heartWall}>
          <View style={[styles.heartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <PixelSpriteView sprite={heartSprite} size={44} />
            <ThemedText type="title" style={{ fontSize: FontSize.titleSm, textAlign: 'center' }}>Out of hearts</ThemedText>
            <ThemedText type="small" themeColor="mutedForeground" style={{ textAlign: 'center' }}>
              They come back tomorrow. A refill puts you straight back in.
            </ThemedText>
            <SlabButton
              label="Get a refill"
              full
              onPress={() => {
                router.push({ pathname: '/shop', params: { returnTo: 'lesson', item: 'heart_refill' } });
              }}
            />
            <SpringPressable
              haptic={false}
              style={styles.lockedOut}
              accessibilityRole="button"
              accessibilityLabel="Leave the lesson"
              onPress={() => { setOutOfHearts(false); exitLesson(); }}>
              <ThemedText type="small" themeColor="mutedForeground">Come back tomorrow</ThemedText>
            </SpringPressable>
          </View>
        </View>
      )}

      <TrialRewardSheet
        visible={trialReward}
        onAccept={() => {
          setTrialReward(false);
          router.push('/onboarding?step=paywall');
        }}
        onDismiss={() => {
          setTrialReward(false);
          leave();
        }}
      />
    </SafeAreaView>
    </LessonDesignProvider>
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
const OWN_CTA_STEPS = new Set(['hook', 'stakes', 'teaching', 'graph', 'dragSort', 'match', 'multi', 'trueFalse', 'line', 'tree', 'vocab', 'progressiveCalc', 'calc', 'reveal']);

/** Fixed-width digits, so a heart or hint count does not shift the header as it drops. */
const NUM_L = { fontVariant: ['tabular-nums' as const] };

const styles = StyleSheet.create({
  atlasFloat: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    zIndex: 30,
  },
  safe: { flex: 1 },
  hintBtn: { minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  loadingShape: { paddingHorizontal: Spacing.three, paddingTop: Spacing.five, gap: Spacing.three },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, zIndex: 20, borderBottomWidth: 1, overflow: 'hidden' },
  headerTint: { backgroundColor: 'rgba(7,3,15,0.7)' },
  practiceOverlay: { position: 'absolute', zIndex: 70, top: 56, left: 0, right: 0, bottom: 0 },
  lessonNav: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  close: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  track: { flex: 1, height: 8, borderRadius: 999, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.08)' },
  fill: { height: 8, borderRadius: 999, overflow: 'hidden' },
  stepLabel: { width: 60, flexShrink: 0, textAlign: 'right', color: '#6F6F7B', fontSize: 12, lineHeight: 16 },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 32, backgroundColor: 'rgba(255,255,255,0.02)', borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(139,92,246,0.08)' },
  // The web mounts WarmupScreen directly in the post-header viewport. LessonWarmup already owns
  // the canonical 24px horizontal / 40px vertical insets, so the normal step surface must not add
  // another 16px gutter and 32px top inset around it.
  warmupBody: { paddingHorizontal: 0, paddingTop: 0, backgroundColor: 'transparent', borderLeftWidth: 0, borderRightWidth: 0 },
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
  // Intro card. flexGrow keeps it vertically centred while the content is short, and lets it
  // scroll once Dynamic Type makes it taller than the screen — at AX5 it was overflowing off
  // BOTH ends, putting the course label above the status bar. FOOTER_CLEARANCE is the same
  // reservation midContent makes, so Continue cannot paint over the step preview.
  introContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: FOOTER_CLEARANCE },
  /** Questions start at the TOP rather than centred — a long prompt centred vertically pushes
   *  its own options off both ends. */
  choiceContent: { flexGrow: 1, width: '100%', maxWidth: 680, alignSelf: 'center', paddingHorizontal: 24, paddingBottom: FOOTER_CLEARANCE },
  recapContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three, paddingBottom: FOOTER_CLEARANCE },
  rewardRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.two, marginTop: Spacing.one },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // paddingHorizontal matches `center` below. Without it the title ran into the screen edge
  // at AX5 and clipped mid-word — "Your Brain vs. Your M".
  title: { textAlign: 'center', marginTop: Spacing.three, paddingHorizontal: Spacing.two },
  center: { textAlign: 'center', marginTop: Spacing.two, paddingHorizontal: Spacing.two },
  preview: { alignItems: 'center', alignSelf: 'stretch', marginTop: Spacing.four, paddingHorizontal: Spacing.four },
  previewTopics: { alignSelf: 'stretch', gap: Spacing.two, marginTop: Spacing.two },
  previewTopic: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  previewTopicDot: { width: 6, height: 6, borderRadius: 3, marginTop: 9, flexShrink: 0 },
  previewTopicText: { flex: 1, textAlign: 'left' },
  quizMeta: { minHeight: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  choicePrompt: { marginTop: 20, textAlign: 'center', fontSize: 18, lineHeight: 26 },
  fillBlankPrompt: { marginTop: 20, textAlign: 'center', fontSize: 18, lineHeight: 32 },
  fillBlankSlot: { minWidth: 80, marginHorizontal: 4, paddingHorizontal: 12, paddingVertical: 4, overflow: 'hidden', borderRadius: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(166,80,231,0.30)', backgroundColor: 'rgba(166,80,231,0.08)', fontWeight: '700', textAlign: 'center' },
  options: { gap: 12, marginTop: 20 },
  fillBlankOptions: { flexDirection: 'row', flexWrap: 'wrap' },
  fillBlankOptionWrap: { width: '48%', flexGrow: 0, flexShrink: 0 },
  option: { minHeight: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 20, borderRadius: 12, borderWidth: 1 },
  fillBlankOption: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  optionText: { flex: 1, fontSize: 17, lineHeight: 24 },
  fillBlankOptionText: { textAlign: 'center' },
  fillBlankSubmit: { alignItems: 'center', marginTop: 24 },
  fillBlankSubmitButton: { width: 134, minHeight: 48 },
  eliminated: { opacity: 0.3, transform: [{ scale: 0.95 }] },
  eliminatedText: { textDecorationLine: 'line-through' },
  xpChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.pill, borderWidth: 1, marginTop: Spacing.three },
  // The Atlas FAB floats at bottom:20 with zIndex 30, so it DRAWS OVER whatever lands there.
  // Measured on device: Continue at 746..794 against the FAB at 766..820 -- 28pt of the
  // primary CTA sat underneath the mascot, and a wrong answer's explanation makes the panel
  // taller still. Reserve the FAB's lane below the block so its CTA can never land under it.
  // Padding, not hiding: the moment right after a wrong answer is the worst time to remove
  // the ask-for-help affordance.
  inlineFeedback: { marginTop: Spacing.four, gap: Spacing.three, paddingBottom: 72 },
  scenarioOutcome: { padding: Spacing.four, borderRadius: Radius.md, lineHeight: 21 },
  footer: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  // 44pt tall so the escape from a wall clears the HIG touch minimum on its own, without relying on
  // hitSlop — this is the only way off the screen.
  heartWall: { position: 'absolute', left: 0, right: 0, top: 56, bottom: 0, zIndex: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#09090DE6', padding: Spacing.four },
  heartCard: { alignItems: 'center', gap: Spacing.two, padding: Spacing.four, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, alignSelf: 'stretch' },
  lockedOut: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: Spacing.four, marginTop: Spacing.two },
});
