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
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { CalcBlanks } from '@/components/calc-blanks';
import { MultiSelect } from '@/components/multi-select';
import { NumberLine } from '@/components/number-line';
import { OrderSteps } from '@/components/order-steps';
import { StreakIgnite } from '@/components/streak-ignite';
import { TapReveal } from '@/components/tap-reveal';
import { Skeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { TileBuilder } from '@/components/tile-builder';
import { DismissalOfferSheet } from '@/components/dismissal-offer-sheet';
import { TrialRewardSheet } from '@/components/trial-reward-sheet';
import { UIcon } from '@/components/ui-icon';
import { PixelSpriteView, coin as coinSprite, flame as flameSprite, heart as heartSprite, lightbulb as lightbulbSprite } from '@/lib/pixel';
import { SlabButton } from '@/components/ui/button';
import { RiseIn } from '@/shared/motion/rise-in';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { Ev, track } from '@/lib/analytics';
import { useTheme } from '@/hooks/use-theme';
import { COURSES, getCourseById, lessonKeyTerms, loadCourseLessons, type PathwayLesson } from '@/lib/curriculum';
import { expandSteps, gates, normalizeStep } from '@/lib/lesson-steps';
import { lessonKey, useApp } from '@/lib/store';
import { TRIAL_DAYS, useTier } from '@/lib/entitlement';
import { EARN } from '@/lib/shop-items';
import { IAP_ENABLED } from '@/lib/purchases';
import { dismissalOfferAvailable } from '@/lib/dismissal-offer';
import { trialRewardAvailable } from '@/lib/trial-reward';
import { NumberRollup } from '@/shared/motion/number-rollup';
import { RewardPop } from '@/shared/motion/reward-pop';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { Duration } from '@/shared/motion/tokens';

export default function Lesson() {
  /** When this lesson was opened. A ref, so re-renders never restart the clock. */
  const openedAt = useRef(Date.now());
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

  // expandSteps lifts each progressiveCalc into the questions it contains. Without it those 44
  // steps render a bare title over empty space, because the renderer shows one screen per step
  // and a progressiveCalc holds 3-8. It is a no-op for every other step type.
  const steps = useMemo(() => expandSteps(lesson?.steps ?? []), [lesson]);
  const keyTerms = useMemo(() => (lesson ? lessonKeyTerms(lesson) : []), [lesson]);
  const total = steps.length;
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
  const [solved, setSolved] = useState(false);
  /** 17c. Holds the post-lesson navigation open so the reward offer can land on the win. */
  const [trialReward, setTrialReward] = useState(false);
  /** 17d. Raised when the hard wall is dismissed and a better ask is still unspent. */
  const [offer, setOffer] = useState(false);

  const norm = useMemo(() => (idx >= 1 && idx <= total ? normalizeStep(steps[idx - 1]) : null), [idx, total, steps]);
  const isChoice = norm?.kind === 'choice';
  const xp = lesson?.xp ?? 30;

  const advance = () => {
    if (isChoice && !checked) {
      if (pick !== null) {
        setChecked(true);
        // ONE heart per WRONG step, charged here rather than in render: `checked` flips once and
        // this branch runs once, so a re-render cannot re-charge it. A hinted step is free — the
        // learner already paid for the answer.
        if (norm && pick !== norm.correct && !hinted) loseHeart();
      }
      return;
    }
    if (idx < STREAK) {
      setIdx(idx + 1);
      setPick(null);
      setChecked(false);
      setSolved(false);
      setHinted(false);
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
      const minutesSpent = (Date.now() - openedAt.current) / 60000;
      useApp.getState().completeLesson(lessonKey(courseId, lessonNum), xp, minutesSpent);
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
    else router.back();
  }

  /**
   * Where the hard wall goes when the user declines.
   *
   * `canGoBack` guarded because the stranding case IS the cold deep link, where there is nothing to
   * go back TO — the one path a bare `router.back()` cannot serve (§22 C13).
   */
  function outOfWall() {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/learn');
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
      <SafeAreaView style={styles.safe}>
        <AmbientBackground starCount={30} />
        <View style={styles.centered}>
          <Atlas size={110} expression="oops" idle />
          <ThemedText type="title" style={styles.title}>That lesson isn&apos;t available.</ThemedText>
          <ThemedText type="body" themeColor="mutedForeground" style={styles.center}>Pick another from the pathway.</ThemedText>
        </View>
        <View style={styles.footer}>
          <SlabButton label="Back" full onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  if (locked) {
    return (
      <SafeAreaView style={styles.safe}>
        <AmbientBackground starCount={30} />
        <View style={styles.centered}>
          <Atlas size={110} expression="watching" idle />
          {/* C27: the refusal is now always expiry, never a spent lesson count — so the copy says
              what actually happened. §20.1's headline, matched to the gate sheet's so a user who
              arrives by deep link reads the same sentence as one who tapped a node. */}
          <ThemedText type="title" style={styles.title}>Your free {TRIAL_DAYS} days are up.</ThemedText>
          <ThemedText type="body" themeColor="mutedForeground" style={styles.center}>
            Euphoria Pro reopens every lesson across all {COURSES.length} courses.
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
   * render it as a SpringPressable rather than a SlabButton, which is why grepping for the
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
        {/*
          * HEARTS, only inside the lesson. The web shows them where they are at stake and nowhere
          * else; a heart count on Home would be an anxiety meter for a state nothing is threatening.
          * Refills at read time on a new day key — no timer, same pattern as minutesDoneToday.
          */}
        <View style={styles.hearts} accessible accessibilityRole="text" accessibilityLabel={`${String(hearts)} hearts left`}>
          {/* The catalogue's own heart, not a red flame glyph. UIcon has no heart; the pixel system
              does, and using it is the whole point of porting the catalogue rather than redrawing. */}
          <PixelSpriteView sprite={heartSprite} size={16} />
          <ThemedText type="smallBold" style={[NUM_L, { color: hearts > 0 ? theme.destructive : theme.mutedForeground, fontSize: FontSize.caption }]}>{hearts}</ThemedText>
        </View>
        {/*
          * HINT. Shown only on an unanswered question, and only when one is owned — an always-visible
          * hint button on a screen with no hints is a dead control advertising a purchase.
          */}
        {isChoice && !checked && hintsLeft > 0 && !hinted && (
          <SpringPressable
            haptic={false}
            scaleTo={0.9}
            onPress={() => { if (spendHint()) setHinted(true); }}
            accessibilityRole="button"
            accessibilityLabel={`Use a hint. ${String(hintsLeft)} left.`}
            style={[styles.hintBtn, { borderColor: theme.iconGold + '55' }]}>
            {/* The web's HintButton uses this exact sprite. A lightbulb IS the hint. */}
            <PixelSpriteView sprite={lightbulbSprite} size={14} />
            <ThemedText type="smallBold" style={[NUM_L, { color: theme.iconGold, fontSize: FontSize.tiny }]}>{hintsLeft}</ThemedText>
          </SpringPressable>
        )}
      </View>

      <View style={styles.body}>
        {idx === 0 && (
          <Animated.View key="intro" entering={FadeIn} exiting={FadeOut.duration(Duration.exit)} style={styles.midScroll}>
            <ScrollView contentContainerStyle={styles.introContent} showsVerticalScrollIndicator={false}>
            <Atlas size={132} expression="happy" entrance="bounce" idle />
            <View style={{ alignSelf: 'stretch', alignItems: 'center', marginTop: Spacing.four }}>
              <AtlasSpeech text="Ready? Let's get into it." delay={420} tail="top" maxWidth={272} />
            </View>
            {/*
              * AX5 BROKE THIS CARD FOUR WAYS AT ONCE, captured on device: the LESSON label
              * rendered ABOVE the status bar, the title clipped horizontally to "Your M", it
              * overlapped the progress bar and close button, and nothing scrolled.
              *
              * The cause is `styles.centered` — flex:1 with justifyContent:'center' and no
              * scroll view. When content grows taller than the container, centering pushes it
              * off BOTH ends rather than overflowing downward, which is why the top label
              * escaped the safe area. `styles.title` also lacked the paddingHorizontal its
              * sibling `styles.center` has, so the text ran into the screen edge.
              *
              * CORRECTION. A previous pass claimed capping was "the smaller, safer change" than
              * a scroll view. The device frame disproved that: capping fixed the title and the
              * label, but the speech bubble still overflowed into the notch and Continue still
              * painted over the step preview. Content taller than its container is a SCROLLING
              * problem, and no font cap solves it — it only postpones the overflow.
              *
              * The fix reuses this file's own idiom. `midContent` already reserves
              * FOOTER_CLEARANCE so a step body cannot slide under the Continue button; the
              * intro simply never used it. `styles.centered` is left alone because four other
              * render states share it (loading, done, streak) and none of them needs changing.
              */}
            {/*
              * THE LESSON OPENS, it does not simply appear. Reported 2026-08-22: "When I click
              * into Investing Fundamentals, the first lesson, I see an initial screen with no
              * animation or lesson start animation."
              *
              * He was describing a real thing even though this view was never literally static:
              * the whole intro sat inside ONE `entering={FadeIn}` on the container, so Atlas, the
              * speech bubble, the title, the step count and the key terms all resolved on the same
              * frame at the same opacity. A single simultaneous fade of six elements reads as a
              * screen materialising, not as something starting.
              *
              * Staggering them gives the eye an order to follow — course, then title, then cost,
              * then what you'll learn — which is the order someone actually reads them in.
              *
              * Delays are LITERAL, not index-multiplied, and the largest is 230ms against a
              * STAGGER_CAP of 360: the last element has to land before the thumb reaches Continue.
              * `alignSelf: 'stretch'` keeps each wrapper full width so the centred text inside
              * stays centred rather than shrinking to its own content.
              */}
            <RiseIn delay={40} style={{ alignSelf: 'stretch', alignItems: 'center' }}>
              <ThemedText type="label" maxFontSizeMultiplier={1.6} style={{ color: theme.iconLilac, marginTop: Spacing.four }}>
                {(getCourseById(courseId)?.title ?? 'Course').toUpperCase()} · LESSON {lesson.num}
              </ThemedText>
            </RiseIn>
            <RiseIn delay={120} style={{ alignSelf: 'stretch', alignItems: 'center' }}>
              <ThemedText type="display" maxFontSizeMultiplier={1.6} style={styles.title}>{lesson.title}</ThemedText>
            </RiseIn>
            <RiseIn delay={190} style={{ alignSelf: 'stretch', alignItems: 'center' }}>
              <ThemedText type="body" themeColor="mutedForeground" style={styles.center}>
                {total} steps · {xp} XP
              </ThemedText>
            </RiseIn>
            {/*
              * WHAT THE 20 STEPS ARE ABOUT. Audit finding (FINDINGS.md, LESSON): 3/3 comparators
              * answer "what will I be able to do" with specifics and this screen answered it with a
              * cost and a reward only. Every term here is already authored inside the lesson's own
              * keyTermsCards step — lessonKeyTerms() invents nothing, so §0.7 does not gate it.
              *
              * Renders NOTHING for the 114 lessons with no keyTermsCards step. That is the
              * pre-audit screen, not a broken one — see lessonKeyTerms() for why the hookOpener
              * fallback was built, measured and then deleted.
              */}
            {keyTerms.length > 0 && (
              <RiseIn delay={260} style={{ alignSelf: 'stretch', alignItems: 'center' }}>
              <View style={styles.preview}>
                <ThemedText type="label" style={{ color: theme.iconLilac }}>
                  YOU&apos;LL LEARN
                </ThemedText>
                <ThemedText type="body" themeColor="textSecondary" style={[styles.center, { marginTop: Spacing.two }]}>
                  {keyTerms.join('  ·  ')}
                </ThemedText>
              </View>
              </RiseIn>
            )}
            </ScrollView>
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
            {norm.kind === 'calc' && <ScrollView style={styles.midScroll} contentContainerStyle={styles.midContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"><CalcBlanks spec={norm.spec} onSolvedChange={setSolved} /></ScrollView>}

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
                    /* MEASURED 2026-08-20: at the default gain of 0.32 this hop moved the
                       mascot 2.7-3.2pt, while the WRONG-answer shake moved it 3.33pt — so
                       getting a question right and getting it wrong looked the same, and the
                       error was marginally the louder of the two. 0.5 puts the hop at roughly
                       4.2-5.0pt, clearly above the shake, while leaving lesson-complete
                       (celebrateGain={1}, line 488) twice as loud again so the end-of-lesson
                       payoff still reads as the bigger moment. Set HERE rather than on the
                       default, because the 0.32 default is right for onboarding taps. */
                    celebrateGain={0.5}
                    interactive={false}
                  />
                  <ThemedText type="title" style={{ flex: 1, fontSize: FontSize.headingXl }}>{norm.prompt}</ThemedText>
                </View>
                <View style={{ gap: Spacing.two + 4, marginTop: Spacing.four }}>
                  {norm.options.map((o, i) => {
                    const isPick = pick === i;
                    // A spent hint reveals the correct option immediately, which is what the item
                    // says it does: "Reveals the correct answer on tough questions."
                    const showRight = (checked || hinted) && i === norm.correct;
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
          <Animated.View key="done" entering={FadeIn} exiting={FadeOut.duration(Duration.exit)} style={styles.midScroll}>
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
                  <UIcon name="sparkle" size={18} color={theme.iconLilac} />
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
            <RewardPop delay={1620}>
              <ThemedText type="body" themeColor="mutedForeground" style={[styles.center, { marginTop: Spacing.three }]}>Atlas is proud of you.</ThemedText>
            </RewardPop>
            </ScrollView>
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
            <SlabButton label={ctaLabel} full onPress={advance} />
          </FeedbackBanner>
        </View>
      ) : ownsItsCta ? null : (
        <View style={styles.footer}>
          <SlabButton label={ctaLabel} full disabled={ctaDisabled} onPress={advance} />
        </View>
      )}

      {/* 17c. Mounted here rather than on Home so it lands on the completion screen the user is
          already looking at — the win it is anchored to. `leave()` on both exits, so the offer
          always hands back to the normal post-lesson routing. */}
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

/** Fixed-width digits, so a heart or hint count does not shift the header as it drops. */
const NUM_L = { fontVariant: ['tabular-nums' as const] };

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hearts: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  hintBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth },
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
  // Intro card. flexGrow keeps it vertically centred while the content is short, and lets it
  // scroll once Dynamic Type makes it taller than the screen — at AX5 it was overflowing off
  // BOTH ends, putting the course label above the status bar. FOOTER_CLEARANCE is the same
  // reservation midContent makes, so Continue cannot paint over the step preview.
  introContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: FOOTER_CLEARANCE },
  /** Questions start at the TOP rather than centred — a long prompt centred vertically pushes
   *  its own options off both ends. */
  choiceContent: { flexGrow: 1, paddingBottom: FOOTER_CLEARANCE },
  rewardRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.two, marginTop: Spacing.one },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // paddingHorizontal matches `center` below. Without it the title ran into the screen edge
  // at AX5 and clipped mid-word — "Your Brain vs. Your M".
  title: { textAlign: 'center', marginTop: Spacing.three, paddingHorizontal: Spacing.two },
  center: { textAlign: 'center', marginTop: Spacing.two, paddingHorizontal: Spacing.two },
  preview: { alignItems: 'center', alignSelf: 'stretch', marginTop: Spacing.four, paddingHorizontal: Spacing.four },
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
