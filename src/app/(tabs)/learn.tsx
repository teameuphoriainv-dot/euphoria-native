/**
 * Learn — the Duolingo-style pathway trail. A horizontal course rail picks one of the 12
 * real curriculum courses; below it the circular saga nodes (done / current / locked) render
 * that course's real lessons in the production web pathway language. Progress comes from
 * `completedLessons` in the store.
 */
import { router, useFocusEffect, useLocalSearchParams, useTheme as useNavigationTheme } from 'expo-router';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, useWindowDimensions, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  FadeIn,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { AmbientBackground } from '@/components/ambient-background';
import { AskAtlasButton } from '@/components/ask-atlas';
import { Atlas } from '@/components/atlas';
import { CourseMark } from '@/components/art/course-mark';
import { GateSheet } from '@/components/gate-sheet';
import { RetryNotice } from '@/components/retry-notice';
import { entitled, TRIAL_DAYS, trialDayNumber, useTier, type Refusal } from '@/lib/entitlement';
import { ThemedText } from '@/components/themed-text';
import { NODE_CHALLENGE_COLOR, NODE_CURRENT_COLOR, NODE_LOCKED_COLOR, NODE_UPCOMING_COLOR } from '@/components/path-node';
import { UIcon } from '@/components/ui-icon';
import { BottomTabInset, Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { courseAccent } from '@/lib/course-accents';
import { COURSES, getCourseById, isCourseAvailable, loadCourseLessons, type PathwayLesson } from '@/lib/curriculum';
import { LESSONS_PER_UNIT, unitNameFor } from '@/lib/course-units';
import { expandSteps } from '@/lib/lesson-steps';
import { hasMasteryChallenge } from '@/lib/mastery-challenge-model';
import { readSegmentRecord, segmentsOf, type SegmentKind } from '@/lib/lesson-segments';
import { SegmentRing } from '@/components/segment-ring';
import { lessonKey, useApp } from '@/lib/store';
import { takeLessonTrailCelebration, type LessonTrailCelebration } from '@/lib/lesson-trail-celebration';
import { ProgressFill } from '@/shared/motion/progress-fill';
import { RiseIn } from '@/shared/motion/rise-in';
import { SemanticMotion } from '@/shared/motion/semantic-motion';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { Duration, Ease } from '@/shared/motion/tokens';
import { PremiumBorder, PremiumText } from '@/components/ui/premium';
import { ProfileButton } from '@/components/profile-button';
import { PixelSpriteView, flame as flameSprite } from '@/lib/pixel';

/* Production web 49e saga geometry. The lesson state belongs to the pod itself: one solid dome,
   one darker front lip, and one glyph. Rings and lesson art made the three states look like three
   different components, while the compact list erased the sense of a journey altogether. */
const SAGA_NODE = 56;
const SAGA_CURRENT = 64;
const SAGA_LIP = 4;
const SAGA_PITCH = 124;
const SAGA_LABEL_WIDTH = 136;
const SAGA_LABEL_HEIGHT = 46;
const SAGA_AMPLITUDE = 48;
/* Sourced from <PathNode>, not redeclared. Home renders the same node shape from that component;
 * keeping a second copy of these four hex values here is how the two screens would drift apart. */
const SAGA_CURRENT_COLOR = NODE_CURRENT_COLOR;
const SAGA_LOCKED_COLOR = NODE_LOCKED_COLOR;
const SAGA_UPCOMING_COLOR = NODE_UPCOMING_COLOR;
const SAGA_CHALLENGE_COLOR = NODE_CHALLENGE_COLOR;
const SAGA_CONNECTOR_DRAW = 180;
const AnimatedPath = Animated.createAnimatedComponent(Path);

/*
 * THE PART RING SITS OUTSIDE THE POD FACE, AND OUTSIDE ITS LIP.
 *
 * 8pt, and the second number is why it is not smaller. The first cut used 5 and the bottom of the
 * ring came out of the simulator half eaten: `nodeLip` is a full-size pill offset SAGA_LIP (4)
 * BELOW the face, so the pod's real silhouette reaches nodeSize/2 + 4 from the centre, not
 * nodeSize/2. SegmentRing measures its radius to the CENTRE of a 4pt stroke, so at 5 the stroke
 * ran from nodeSize/2 + 3 to nodeSize/2 + 7 and the lip covered its inner pixels along the whole
 * bottom arc. At 8 the stroke runs from nodeSize/2 + 6 outward and is tangent to the lip at worst.
 *
 * A ring drawn ON the face would also collide with the 15%-white specular strip and read as a
 * second border on a pod that already has one.
 *
 * Challenge and capstone pods are the same square rotated 45 degrees (styles.specialNode), so
 * their silhouette is the face's DIAGONAL, not its side. A circle sized for the side would be cut
 * by all four corners. Math.SQRT2 is that diagonal, and it is why this is a function of `special`
 * rather than one constant.
 */
const SAGA_RING_CLEARANCE = 8;
const sagaRingSize = (nodeSize: number, special: boolean) =>
  (special ? nodeSize * Math.SQRT2 : nodeSize) + SAGA_RING_CLEARANCE * 2;

/**
 * A stable empty shape for every node that is not the current one.
 *
 * A fresh `[]` per node per render would be a new identity in a list of 25, which is how a
 * `useMemo` or a memoised child downstream quietly stops memoising.
 */
const NO_KINDS: SegmentKind[] = [];

/**
 * The premium ramp, spent across the trial's three days.
 *
 * The exact three stops SlabButton's `premium` tone paints, in the same order, so the trial card
 * and the paywall CTA it opens are visibly one product. Read from the theme rather than written
 * out: theme.ts owns these values and a second copy would drift.
 */
const TRIAL_RAMP = (t: { gradientFrom: string; premiumFrom: string; premiumTo: string }) =>
  [t.gradientFrom, t.premiumFrom, t.premiumTo];

function sagaSegment(from: { x: number; y: number }, to: { x: number; y: number }) {
  const bend = (to.y - from.y) / 2;
  return `M ${String(from.x)} ${String(from.y)} C ${String(from.x)} ${String(from.y + bend)}, ${String(to.x)} ${String(to.y - bend)}, ${String(to.x)} ${String(to.y)}`;
}

function shade(hex: string, amount: number) {
  const value = hex.replace('#', '');
  if (!/^[0-9A-Fa-f]{6}$/.test(value)) return hex;

  const factor = 1 - amount;
  const channel = (offset: number) => Math.round(Number.parseInt(value.slice(offset, offset + 2), 16) * factor)
    .toString(16)
    .padStart(2, '0');
  return `#${channel(0)}${channel(2)}${channel(4)}`;
}

function SagaCrown() {
  return (
    <Svg width={25} height={25} viewBox="0 0 32 32" aria-hidden>
      <Path d="M4 9.5 10.5 15 16 6l5.5 9L28 9.5l-2.2 14H6.2L4 9.5Z" fill="#FFFFFF" />
      <Path d="M7 26h18" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

function SagaBolt() {
  return (
    <Svg width={24} height={24} viewBox="0 0 30 30" aria-hidden>
      <Path d="M17.2 2.8 6.8 17h7l-1 10.2L23.2 13h-7l1-10.2Z" fill="#FFFFFF" />
    </Svg>
  );
}

function EarnedConnector({ d, color }: { d: string; color: string }) {
  const reduced = useReducedMotion();
  const offset = useSharedValue(reduced ? 0 : SAGA_CONNECTOR_DRAW);

  useEffect(() => {
    offset.set(
      reduced
        ? 0
        : withTiming(0, {
            duration: Duration.screen,
            easing: Ease.enter,
          }),
    );
  }, [offset, reduced]);

  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: offset.get() }));
  return (
    <AnimatedPath
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeDasharray={SAGA_CONNECTOR_DRAW}
      animatedProps={animatedProps}
    />
  );
}

function SagaConnector({
  d,
  color,
  accent,
  earned,
}: {
  d: string;
  color: string;
  accent: string;
  earned: boolean;
}) {
  return (
    <>
      <Path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
      {earned && <EarnedConnector d={d} color={accent} />}
    </>
  );
}

function SagaNodeMotion({ earned, children }: { earned: boolean; children: ReactNode }) {
  return <SemanticMotion event="node-unlock" enabled={earned}>{children}</SemanticMotion>;
}

/**
 * The header flame uses the same authored pixel frames as the warmup, then adds one small physical
 * beat so that the motion survives at 16pt: the crest flickers while the mark lifts, leans, and
 * breathes by only two points. Keeping the wrapper here makes this a streak-specific motion cue,
 * rather than turning every flame in the app into an idle loop.
 */
function LivingStreakFlame() {
  const reduced = useReducedMotion();
  const phase = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      cancelAnimation(phase);
      phase.set(0);
      return;
    }

    phase.set(
      withRepeat(
        withTiming(1, { duration: 620, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );
    return () => cancelAnimation(phase);
  }, [phase, reduced]);

  const motionStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(phase.get(), [0, 1], [1, -2]) },
      { rotate: `${String(interpolate(phase.get(), [0, 1], [-3, 3]))}deg` },
      { scale: interpolate(phase.get(), [0, 1], [0.96, 1.06]) },
    ],
  }));

  return (
    <Animated.View style={[styles.streakFlame, motionStyle]} accessible={false}>
      <PixelSpriteView sprite={flameSprite} size={16} play="loop" />
    </Animated.View>
  );
}


export default function Learn() {
  const theme = useTheme();
  const sceneBg = useNavigationTheme().colors.background;
  const params = useLocalSearchParams<{ qa?: string }>();
  const qa = __DEV__ ? params.qa : undefined;
  const { width } = useWindowDimensions();
  const sagaWidth = Math.min(width - Spacing.four * 2, 460);

  const activeCourseId = useApp((s) => s.activeCourseId);
  const setActiveCourse = useApp((s) => s.setActiveCourse);
  const completedLessons = useApp((s) => s.completedLessons);
  const streak = useApp((s) => s.streak);
  // Trial strip, moved here from Home — see the note beside it in the tree below.
  const planTier = useTier();
  const trialDay = useApp(trialDayNumber);

  const course = getCourseById(activeCourseId);

  // loadCourseLessons is async (dynamic import). Keep the previous course's trail on screen
  // while the next one resolves so switching never flashes an empty path.
  // `loaded` holds whichever course is actually on screen, so "still loading" is derived rather
  // than a second state — no setState during the effect body.
  const [loaded, setLoaded] = useState<{ id: string; lessons: PathwayLesson[] } | null>(null);
  /** Course id whose chunk failed to load. Distinguishes a dropped import from an empty course. */
  const [failed, setFailed] = useState<string | null>(null);
  /** Bumped by the retry so the effect re-runs for the same course id. */
  const [attempt, setAttempt] = useState(0);
  const [celebrating, setCelebrating] = useState<LessonTrailCelebration | null>(null);

  useFocusEffect(
    useCallback(() => {
      const celebration = takeLessonTrailCelebration();
      if (!celebration) return;
      setCelebrating(celebration);
      const settle = setTimeout(() => setCelebrating(null), Duration.screen + 700);
      /*
       * CLEARED ON BLUR, NOT ONLY ON THE TIMER. Leaving the tab inside the settle window used to
       * clear the timeout and leave `celebrating` set, and the next focus takes a null handoff and
       * returns early, so the stale value survived: the node re-fired its "earned" bounce for a
       * lesson finished minutes ago. The part ring makes that worse, because its SemanticMotion
       * reads the same value and would replay an arc that was already filled when the tab opened.
       * A celebration is one animation for one visit; it does not outlive the visit.
       */
      return () => {
        clearTimeout(settle);
        setCelebrating(null);
      };
    }, []),
  );

  useEffect(() => {
    let cancelled = false;
    // Clears a stale error when the dependency changes, before the fetch that may set a new one.
    // React bails out via Object.is when the value is already null, so on the common path this
    // renders nothing -- it is not the cascading render the rule exists to catch. refs/TASK_QUEUE.md
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFailed(null);
    loadCourseLessons(activeCourseId)
      .then((lessons) => {
        if (!cancelled) setLoaded({ id: activeCourseId, lessons });
      })
      .catch(() => {
        /*
         * A FAILED LOAD IS NOT AN EMPTY COURSE. The previous version fell through to the empty
         * state so the tab would not blank, which is right about the tab and wrong about the
         * message: every course in the corpus has 25 lessons, so "No lessons available for this
         * course yet" is never true, and a user who hits a dropped chunk is told a course they
         * paid for has no content. Caught in the visual sweep, on personalFinance, which has 25.
         */
        if (!cancelled) {
          setFailed(activeCourseId);
          setLoaded({ id: activeCourseId, lessons: [] });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activeCourseId, attempt]);

  const lessons = useMemo(() => (qa ? [] : loaded?.lessons ?? []), [loaded, qa]);
  const trailCourseId = loaded?.id ?? activeCourseId;
  // Keyed to the course actually ON SCREEN, not the one being switched to. During the async
  // loadCourseLessons swap `loaded.id` is still the outgoing course, so accenting by
  // `activeCourseId` painted the OLD course's rows and unit names in the NEW course's colour.
  const accent = courseAccent(trailCourseId);

  /*
   * WHY THIS COURSE IS IN YOUR PATH.
   *
   * Same source as Home's hero: `recommendPathDetailed` already carries the answer that earned
   * each slot. Keyed to `trailCourseId` and NOT `activeCourseId` on purpose — the trail below
   * lags the rail by one transition, and a reason that describes a different course than the
   * lessons under it is worse than no reason at all.
   *
   * Null for a hand-picked course, and null for the courses the recommendation never reached.
   * Both cases stay silent rather than inventing a justification.
   */
  const pending = qa === 'loading' || (!qa && loaded?.id !== activeCourseId);
  const shownFailed = qa === 'error' ? activeCourseId : failed;
  /** switching between two courses — dim the outgoing trail instead of flashing an empty path */
  const stale = pending && loaded !== null;

  const doneFlags = useMemo(
    () => lessons.map((l) => completedLessons.includes(lessonKey(trailCourseId, l.num))),
    [lessons, completedLessons, trailCourseId],
  );
  const doneCount = doneFlags.filter(Boolean).length;
  // the active node is the first unfinished lesson; -1 once the course is complete
  const current = doneFlags.indexOf(false);
  const total = lessons.length;

  /*
   * HOW MANY PARTS THE CURRENT LESSON HAS — AND ONLY THE CURRENT ONE.
   *
   * ONE LESSON, NOT TWENTY-FIVE. Reading `lesson.steps` is not a field read: `withMobileDecks`
   * (curriculum/index.ts) hides a getter behind it that runs `mobileSteps` on first touch, which
   * is the whole reason `scripts/lazy-deck-pin.mjs` exists ("loading a course must not derive the
   * decks of lessons nobody opened", 721 derivations and about 65ms of them corpus-wide). Looping
   * every lesson here put that cost straight back, on the render thread rather than the loader, so
   * lazy-deck-pin could not see it: MEASURED at 88.8 / 60.4 / 75.4ms for investing-fundamentals,
   * personal-finance and financial-analytics under `--no-opt --no-sparkplug --no-maglev`, the same
   * interpreter-only stand-in for Hermes that pin used, and paid again on every course switch.
   * Exactly one node ever draws a ring, so exactly one lesson's shape is derived. Re-measured the
   * same way for one lesson: 6.4 / 16.0 / 5.7ms.
   *
   * Derived from the steps rather than stored, because the store records finished parts by KIND
   * ('learn' | 'vocab' | 'practice') and deliberately never the count (design 2b): a curriculum
   * sync can add or remove a lesson's keyTermsCards screen, and a persisted count would then
   * describe a shape that no longer exists. `segmentsOf` is the same pure function the runner
   * splits the lesson with, fed the same deck-wrapped `expandSteps` list, so the ring cannot
   * disagree with the part card the learner just closed.
   */
  const currentLesson = current >= 0 ? lessons[current] ?? null : null;
  const currentKinds = useMemo<SegmentKind[]>(
    () => (currentLesson === null
      ? []
      : segmentsOf(
          expandSteps(currentLesson.steps).map((step) => step.type),
          hasMasteryChallenge(currentLesson.challenge),
        ).map((segment) => segment.kind)),
    [currentLesson],
  );

  /*
   * HOW MANY OF THEM ARE DONE.
   *
   * Subscribed to the `lessonSegments` record itself, not to the store's `segmentsDoneFor`
   * getter. Zustand compares a selector's RESULT with Object.is and the getter's identity never
   * changes, so selecting the getter alone would freeze this ring at whatever it showed on mount
   * and a part finished mid-session would never appear.
   *
   * `readSegmentRecord` and not a raw `.done`: a persisted record can carry an unknown kind or a
   * duplicate after a downgrade, and the validator is the one place that decides what a malformed
   * record means. The getter's extra branch (a completed lesson counts every kind) is not needed
   * here, because the only node that draws a ring is `current`, and `current` is by definition the
   * first lesson NOT in `completedLessons`.
   */
  const lessonSegmentRecords = useApp((s) => s.lessonSegments);
  const currentDone = useMemo(
    () => (currentLesson === null
      ? []
      : readSegmentRecord(lessonSegmentRecords[lessonKey(trailCourseId, currentLesson.num)]).done),
    [currentLesson, lessonSegmentRecords, trailCourseId],
  );
  /*
   * MATCHED BY KIND, NEVER COUNTED. `segmentEntry` (lesson-segments.ts) opens the lesson at the
   * first kind NOT in `done`, and this trail has to name the same part or the ring and the runner
   * disagree about the same tap. Counting instead is wrong in exactly the case the kind-keyed
   * record was chosen for (design 2b): a sync drops a lesson's keyTermsCards while `done` holds
   * ['learn','vocab'], and `done.length` then indexes a two-part shape as 2 of 2 — a FULL ring on
   * a lesson nobody finished, and an unclamped label reading "Part 3 of 2 next". Intersecting with
   * the live shape cannot exceed it, so the clamp is not needed either.
   */
  const currentFilled = useMemo(
    () => currentKinds.filter((kind) => currentDone.includes(kind)).length,
    [currentKinds, currentDone],
  );
  const currentNextPart = useMemo(() => {
    const j = currentKinds.findIndex((kind) => !currentDone.includes(kind));
    // Every kind done on an unfinished lesson is the malformed case `segmentEntry` also meets; it
    // answers the last segment, so this names the last part rather than inventing a fourth.
    return j < 0 ? currentKinds.length - 1 : j;
  }, [currentKinds, currentDone]);
  const units = useMemo(
    () => Array.from({ length: Math.ceil(total / LESSONS_PER_UNIT) }, (_, unitIndex) => ({
      index: unitIndex,
      start: unitIndex * LESSONS_PER_UNIT,
      lessons: lessons.slice(unitIndex * LESSONS_PER_UNIT, (unitIndex + 1) * LESSONS_PER_UNIT),
      title: unitNameFor(trailCourseId, unitIndex * LESSONS_PER_UNIT) ?? `Level ${String(unitIndex + 1)}`,
    })),
    [lessons, total, trailCourseId],
  );

  /*
   * The entitlement gate for lessons. Distinct from `locked` below, which is a PROGRESSION lock
   * (n.i > current) — money cannot unlock lesson 5 for someone who has not finished lesson 4, and
   * §20.4 forbids showing a paywall for something money cannot buy. So a sequence-locked node
   * states its own condition (Duolingo's "Finish 7 lessons to start competing" move) while an
   * unentitled one opens the sheet.
   */
  const [gate, setGate] = useState<Refusal | null>(null);

  /*
   * Keep the selected chip in view when the course changes from elsewhere (e.g. /courses).
   *
   * The old card rail could compute this from RAIL_CARD_WIDTH because every card was 132pt. Chips
   * are as wide as their course title, so a computed offset would be a magic number that is wrong
   * for eleven of the twelve. Each chip reports its real x on layout instead, and the scroll uses
   * the measured value — the same reason §0.3 exists, applied to a layout constant.
   */
  const rail = useRef<ScrollView>(null);
  const chipX = useRef<Record<string, number>>({});
  useEffect(() => {
    const x = chipX.current[activeCourseId];
    if (x === undefined) return;
    // Leave a chip's width of context to the left so the selected one does not sit flush against
    // the edge looking like the first item.
    rail.current?.scrollTo({ x: Math.max(0, x - Spacing.four), animated: true });
  }, [activeCourseId]);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={45} />

      {/* Sticky header */}
      <RiseIn>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <SpringPressable haptic={false} onPress={() => router.push('/courses')} style={{ flex: 1 }}>
              {/*
                * AX5 REDUCED THIS HEADER TO "Be..." AND "0% co...". Captured on device before
                * changing anything. Two characters is not a graceful truncation — the learning
                * surface stopped saying which course you are in.
                *
                * Same shape as the home header and lesson card: a flex:1 column beside a fixed
                * progress pill, so a 22pt title at 3.12x wants far more width than the slot has
                * and `numberOfLines={1}` resolved it by discarding the word. Caps bound the
                * growth, and dropping the clamps lets both lines wrap instead of vanish.
                *
                * The cap is 1.6, not the 2 used on home. A first attempt at 2 still ellipsised
                * to "Behavio / ral Fin..." and broke mid-word, because at 44pt only ~7
                * characters fit a line here. 1.6 gives ~35pt, which puts "Behavioral" on one
                * line and "Finance" on the next: complete AND cleanly broken. Verified on
                * device both times rather than assumed.
                */}
              <ThemedText type="title" maxFontSizeMultiplier={1.6} style={{ fontSize: FontSize.titleSm }} numberOfLines={2}>{course?.title ?? 'Courses'}</ThemedText>
            </SpringPressable>
            {/*
              * THE STREAK FOLLOWS YOU ONTO THE LEARNING SURFACE. Audit finding (FINDINGS.md, LEARN):
              * 4/4 comparators show a streak counter here — Duolingo, Speak, Babbel and Learna all
              * put one in the top strip. This screen showed only `doneCount/total`, which is course
              * PROGRESS, not session commitment, and the streak lived on Home alone. A streak you
              * cannot see while doing the thing that extends it is a weaker commitment device.
              *
              * Hidden at 0 rather than rendered as "0": a zero streak is the one state where showing
              * the number argues against the behaviour it exists to encourage. Home has room for the
              * "X min to keep your streak" line that gives a 0 context; this header does not.
              *
              * Same flame + theme.streak treatment as home.tsx, deliberately — the point of the
              * finding is that persistent status looks the SAME everywhere it appears.
              */}
            {streak > 0 && (
              <View
                accessible
                accessibilityLabel={`${String(streak)} day streak`}
                style={[styles.countPill, styles.streakPill, { backgroundColor: theme.streak + '18', borderColor: theme.streak + '40' }]}>
                <LivingStreakFlame />
                <ThemedText type="smallBold" style={{ color: theme.streak }}>{streak}</ThemedText>
              </View>
            )}
            <AskAtlasButton topic={course?.title} />
            <ProfileButton />
          </View>
          <View style={[styles.track, { backgroundColor: theme.muted }]}>
            <ProgressFill ratio={total ? doneCount / total : 0} color={accent} style={styles.fill} />
          </View>
        </View>
      </RiseIn>

      {/*
        * TRIAL STRIP — MOVED HERE FROM HOME on 2026-09-01: "make sure that the free trial thing is
        * on the lessons part of the app, not on the main page".
        *
        * It belongs here on its own merits. What the trial gates is CONTENT — `entitled()` a few
        * lines up is what refuses a locked lesson on this very screen — so the countdown now sits
        * on the surface where running out actually stops you, instead of on a screen where it was
        * one more status bar competing with the thing you came to do.
        *
        * Shape and reasoning carried over unchanged from home.tsx: a THREE-DAY tracker with the
        * current day filled, from Bloom `156322`. `trialDayNumber` not `trialDaysLeft`, because on
        * the third active day daysLeft is 0 while the trial is still live and "0 days left" on a
        * fully usable day reads as already expired (§22 C14). Shown only during the trial — a Pro
        * member must never see a countdown, and an expired one gets the paywall's own copy.
        */}
      {planTier === 'trial' && (
        <RiseIn delay={60}>
          <SpringPressable
            haptic={false}
            scaleTo={0.99}
            onPress={() => router.push('/onboarding?step=paywall')}
            accessibilityRole="button"
            accessibilityLabel={`Free trial, day ${String(trialDay)} of ${String(TRIAL_DAYS)}. See Euphoria Pro.`}>
            {/*
              * A GRADIENT BORDER, matching the web's Premium column and price card exactly. The
              * reference runs violet from the top-left corner to orange at the bottom-right, so
              * the card is edged in the ramp rather than tinted with one stop of it. A tint said
              * "pinkish"; the ramp is the thing the web has taught the user to read as Premium.
              */}
            <PremiumBorder radius={Radius.lg} style={styles.trialBorder}>
            <View style={styles.trialStrip}>
              {/*
                * ATLAS, SAD, WHERE THE ARROW WAS.
                *
                * The arrow said "there is another screen" and nothing else, and it sat hard against
                * the right edge with the whole middle of the card empty, so the strip read as a
                * status bar rather than an offer. Atlas is the app's one character; him being sad
                * that your trial is running out says the same thing the arrow was trying to and
                * says it in the app's own voice.
                *
                * `interactive={false}` and no `idle`: the whole card is already the control, and a
                * mascot that animates on its own here would compete with the lesson trail below.
                */}
              <Atlas size={44} expression="sad" interactive={false} />
              <View style={{ flex: 1 }}>
                {/*
                  * THE PREMIUM COLOURWAY, and this is the surface it is reserved for.
                  *
                  * theme.ts warns that the pink-to-orange ramp is the one colour that MEANS
                  * Premium and that spending it on an ordinary CTA wastes it. This card's only
                  * job is to sell Premium, so it is the correct place for it, and it now matches
                  * the paywall it opens instead of arriving as a violet surprise.
                  */}
                <PremiumText type="heading">Unlock Premium</PremiumText>
                <View style={styles.trialDots}>
                  {/*
                    * THE RAMP, SPENT ACROSS THE THREE DAYS. Filled days walk
                    * gradientFrom -> premiumFrom -> premiumTo, the exact stops SlabButton's
                    * premium tone paints, so the strip WARMS toward the offer as the trial runs
                    * down. The colour is doing the same work as the copy rather than decorating it.
                    */}
                  {Array.from({ length: TRIAL_DAYS }, (_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.trialDot,
                        {
                          backgroundColor: i < trialDay ? TRIAL_RAMP(theme)[i] : 'transparent',
                          borderColor: i < trialDay ? TRIAL_RAMP(theme)[i] : theme.border,
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>
            </PremiumBorder>
          </SpringPressable>
        </RiseIn>
      )}

      {/*
        * COMPACT COURSE CHIPS — 44pt, replacing a 150pt card rail.
        *
        * The rail was 150pt of the 874pt screen and it is why only five lesson nodes fitted. It kept
        * ONE function worth keeping — switching course without leaving the screen — and spent 150pt
        * on art, a progress ring and a count to do it. These chips keep the function at 44pt, which
        * is also the HIG touch minimum, so nothing was traded for the space.
        *
        * The richer presentation still exists: the header taps through to /courses, which is the
        * surface that can afford course art.
        */}
      <ScrollView
        ref={rail}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipRow}>
        {COURSES.map((c) => {
          const on = c.id === activeCourseId;
          const available = isCourseAvailable(c.id);
          const cAccent = courseAccent(c.id);
          const done = completedLessons.filter((id) => id.startsWith(`${c.id}:`)).length;
          return (
            <SpringPressable
              key={c.id}
              haptic={false}
              scaleTo={0.95}
              onPress={() => setActiveCourse(c.id)}
              disabled={!available}
              accessibilityRole="button"
              accessibilityLabel={available
                ? `${c.title}, ${String(done)} of ${String(c.totalLessons)} complete`
                : `${c.title}, coming soon`}
              accessibilityState={{ selected: on, disabled: !available }}
              onLayout={(e) => {
                chipX.current[c.id] = e.nativeEvent.layout.x;
              }}>
              <View
                style={[
                  styles.chip,
                  !available && styles.comingSoonChip,
                  {
                    backgroundColor: on ? cAccent + '2E' : theme.card,
                    borderColor: on ? cAccent : theme.border,
                    borderWidth: on ? 1.5 : StyleSheet.hairlineWidth,
                  },
                ]}>
                <CourseMark id={c.id} size={20} muted={!on} />
                <ThemedText
                  type="smallBold"
                  numberOfLines={1}
                  style={{ color: on ? theme.text : theme.mutedForeground }}>
                  {c.title}
                </ThemedText>
                {!available && (
                  <ThemedText type="label" style={{ color: theme.mutedForeground }}>SOON</ThemedText>
                )}
              </View>
            </SpringPressable>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.trailScroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {total === 0 ? (
          <View style={styles.empty}>
            {pending ? <ActivityIndicator color={accent} /> : null}
            {shownFailed === activeCourseId && !pending ? (
              /* RetryNotice already exists for exactly this: a true sentence plus a way out. */
              <RetryNotice
                message="This course did not finish loading."
                onRetry={() => setAttempt((n) => n + 1)}
              />
            ) : (
              <ThemedText type="small" themeColor="mutedForeground">
                {pending ? 'Loading lessons…' : 'No lessons available for this course yet.'}
              </ThemedText>
            )}
          </View>
        ) : (
          <TrailFade key={trailCourseId} stale={stale} style={[styles.sagaCourse, { width: sagaWidth }]}>
            {units.map((unit) => {
              const centerX = sagaWidth / 2;
              const nodes = unit.lessons.map((lesson, localIndex) => {
                const lessonIndex = unit.start + localIndex;
                return {
                  lesson,
                  lessonIndex,
                  x: centerX + Math.sin((lessonIndex / 2.5) * Math.PI) * SAGA_AMPLITUDE,
                  y: SAGA_CURRENT / 2 + localIndex * SAGA_PITCH,
                };
              });
              const sagaHeight = nodes.length
                ? nodes[nodes.length - 1].y + SAGA_NODE / 2 + SAGA_LABEL_HEIGHT
                : 0;

              return (
                <View key={unit.index} style={styles.sagaUnit}>
                  <View
                    style={[
                      styles.levelHeader,
                      { backgroundColor: accent + '0D', borderColor: accent + '4D' },
                    ]}>
                    <ThemedText type="bodyMedium" numberOfLines={2} style={styles.levelTitle}>{unit.title}</ThemedText>
                  </View>

                  <View style={[styles.sagaTrail, { width: sagaWidth, height: sagaHeight }]}>
                    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width={sagaWidth} height={sagaHeight}>
                      {nodes.slice(0, -1).map((node, localIndex) => {
                        const next = nodes[localIndex + 1];
                        const nextDone = doneFlags[next.lessonIndex];
                        const nextActive = next.lessonIndex === current;
                        const segment = sagaSegment(node, next);
                        /*
                         * A PART NEVER DRAWS THE CONNECTOR. `celebrating.segment` is set only by a
                         * non-final part credit, and the connector means "the next node is open".
                         * The next node is still locked after Learn, because `doneFlags` reads
                         * `completedLessons` and the part credit never writes it (design 3b). A
                         * line drawn to a pod the learner cannot press is a promise the trail
                         * cannot keep.
                         */
                        const earned = celebrating?.segment === undefined
                          && celebrating?.lessonId === lessonKey(trailCourseId, node.lesson.num);
                        return (
                          <SagaConnector
                            key={node.lessonIndex}
                            d={segment}
                            color={nextDone ? accent + '66' : nextActive ? SAGA_CURRENT_COLOR + '55' : theme.border}
                            accent={SAGA_CURRENT_COLOR}
                            earned={earned}
                          />
                        );
                      })}
                    </Svg>

                    {nodes.map((node) => {
                      const { lesson, lessonIndex } = node;
                      const done = doneFlags[lessonIndex];
                      const active = lessonIndex === current;
                      const locked = current >= 0 && lessonIndex > current;
                      const challenge = (lessonIndex + 1) % 10 === 0;
                      const capstone = lessonIndex === lessons.length - 1;
                      const special = challenge || capstone;
                      const nodeSize = active ? SAGA_CURRENT : SAGA_NODE;
                      const completedFace = challenge ? SAGA_CHALLENGE_COLOR : accent;
                      const nodeId = lessonKey(trailCourseId, lesson.num);
                      /* Same rule as the connector above: the node's "earned" bounce means the
                       * whole lesson is finished, so a part must not fire it. */
                      const earned = celebrating?.segment === undefined && celebrating?.lessonId === nodeId;
                      /*
                       * THE RING BELONGS TO THE POD YOU ARE ON, AND ONLY TO IT.
                       *
                       * A done pod already carries a check, and a ring reading 3 of 3 beside it
                       * would state the same fact twice (design rule 1). A locked pod has nothing
                       * to report. Every other pod is either before `current` (done) or after it
                       * (locked), so `active` is the only node that can ever be part way through:
                       * `current` is the first lesson not in `completedLessons`, which is exactly
                       * the lesson a part credit can belong to.
                       *
                       * Two-part and three-part lessons both get one; a single-segment lesson
                       * cannot occur under the split rule, and the guard keeps a future corpus
                       * from drawing a one-arc circle that says nothing.
                       */
                      const kinds = active ? currentKinds : NO_KINDS;
                      const ringFilled = active ? currentFilled : 0;
                      const showRing = active && kinds.length > 1;
                      const ringSize = sagaRingSize(nodeSize, special);
                      const face = locked
                        ? SAGA_LOCKED_COLOR
                        : active
                          ? SAGA_CURRENT_COLOR
                          : done
                            ? completedFace
                            : SAGA_UPCOMING_COLOR;
                      const lip = locked ? '#09090D' : shade(face, 0.45);

                      return (
                        <View
                          key={lessonIndex}
                          style={[
                            styles.sagaStop,
                            {
                              left: node.x - nodeSize / 2,
                              top: node.y - nodeSize / 2,
                              width: nodeSize,
                              height: nodeSize + SAGA_LIP + SAGA_LABEL_HEIGHT,
                            },
                          ]}>
                          <SagaNodeMotion key={earned ? 'earned' : 'still'} earned={earned}>
                            <SpringPressable
                            haptic={!locked}
                            scaleTo={0.91}
                            onPress={() => {
                              const refusal = entitled(useApp.getState(), 'lesson');
                              if (!refusal.ok) {
                                setGate(refusal);
                                return;
                              }
                              router.push({ pathname: '/lesson', params: { course: trailCourseId, num: String(lesson.num) } });
                            }}
                            disabled={locked}
                            accessibilityRole="button"
                            accessibilityState={{ disabled: locked }}
                            /*
                             * THE RING IS THE ONLY THING SOME LEARNERS CANNOT SEE.
                             *
                             * "Start here" is still right for an untouched lesson, and it is the
                             * whole truth there: the arcs say how many parts are coming and the
                             * count is in the lesson itself. Once a part is banked, "Start here"
                             * is actively wrong, because the runner resumes at the next part. The
                             * label states which one, so VoiceOver gets what the filled arcs say.
                             */
                            accessibilityLabel={
                              locked
                                ? `${lesson.title}. Finish the lesson before this one to unlock it.`
                                : `${lesson.title}${
                                    done
                                      ? '. Complete'
                                      : active && showRing && ringFilled > 0
                                        ? `. Part ${String(currentNextPart + 1)} of ${String(kinds.length)} next`
                                        : active
                                          ? '. Start here'
                                          : ''
                                  }`
                            }>
                            <View style={[styles.nodeShell, special && styles.specialNode]}>
                              <View
                                style={[
                                  styles.nodeLip,
                                  special && styles.specialFace,
                                  { width: nodeSize, height: nodeSize, top: locked ? 3 : SAGA_LIP, backgroundColor: lip },
                                ]}
                              />
                              <View
                                style={[
                                  styles.sagaNode,
                                  special && styles.specialFace,
                                  {
                                    width: nodeSize,
                                    height: nodeSize,
                                    backgroundColor: face,
                                    shadowColor: '#000000',
                                  },
                                ]}>
                                {/*
                                  * NOT ON A LOCKED NODE.
                                  *
                                  * This is a 15%-white specular strip. On a saturated face it blends
                                  * into a lighter shade of that colour and reads as gloss on a raised
                                  * button. The locked face is near-black, so there is no colour to blend
                                  * with, so the same strip renders as a separate grey pill floating
                                  * inside the circle — reported as "why is there a curved rectangle on
                                  * the top of the circle".
                                  *
                                  * The locked node also loses its lip to the background (black wall on
                                  * a black page), so the strip is the only thing left on it and reads
                                  * as an artifact rather than as lighting. Suppressing it is also the
                                  * honest state: gloss says "raised, press me", and a locked node is
                                  * inert.
                                  */}
                                {locked ? null : <View pointerEvents="none" style={styles.nodeHighlight} />}
                                <View style={special ? styles.specialGlyph : undefined}>
                                  {capstone && !locked ? (
                                    <SagaCrown />
                                  ) : challenge && !locked ? (
                                    <SagaBolt />
                                  ) : done ? (
                                    <UIcon name="check" size={24} color="#FFFFFF" strokeWidth={3.25} />
                                  ) : active ? (
                                    <View style={styles.playIcon} />
                                  ) : locked ? (
                                    <UIcon name="lock" size={19} color="#777381" />
                                  ) : (
                                    <ThemedText type="bodyMedium" style={styles.lessonNumber}>{lesson.num}</ThemedText>
                                  )}
                                </View>
                              </View>
                            </View>
                            </SpringPressable>
                          </SagaNodeMotion>

                          {/*
                            * CENTRED ON THE FACE, NOT ON THE SHELL, AND PAINTED AFTER IT.
                            *
                            * The pod's stack is the face at the top of this box plus a 4pt lip
                            * BELOW it plus a label, so the shell's own centre sits well under the
                            * circle a learner sees. Ringing the shell would hang the arc low and
                            * off-axis. The face occupies (0,0)..(nodeSize,nodeSize) of this box,
                            * so its centre is nodeSize / 2 on both axes and the ring is inset by
                            * half the difference.
                            *
                            * AFTER the pressable, not before. Drawn first, the lip and the pod's
                            * own shadow ate the bottom arc: caught on the simulator, where a 1 of
                            * 3 ring looked like an arc with a bite out of it. React Native paints
                            * siblings in order with no z-index here, so "after" is the whole fix.
                            *
                            * pointerEvents="none" so it can never eat a tap. The pod is a 44pt-plus
                            * target and this box now sits ON TOP of it, so without that every press
                            * near the pod's edge would land on nothing.
                            */}
                          {showRing && (
                            <View
                              pointerEvents="none"
                              style={[
                                styles.nodeRing,
                                { left: (nodeSize - ringSize) / 2, top: (nodeSize - ringSize) / 2 },
                              ]}>
                              {/*
                                * ONE BEAT WHEN A PART LANDS, keyed so it replays per part rather
                                * than once per mount. 'mastery-increase' and not 'lesson-complete':
                                * the motion audits read 'lesson-complete' as a finished lesson, and
                                * a part is not one. SemanticMotion resolves every event immediately
                                * under Reduced Motion, so the filled arc still arrives.
                                */}
                              <SemanticMotion
                                key={String(ringFilled)}
                                event="mastery-increase"
                                enabled={celebrating?.segment !== undefined && celebrating.lessonId === nodeId}>
                                <SegmentRing
                                  size={ringSize}
                                  segments={kinds.length}
                                  filled={ringFilled}
                                  accent={accent}
                                  track={theme.border}
                                />
                              </SemanticMotion>
                            </View>
                          )}

                          <View
                            pointerEvents="none"
                            style={[
                              styles.nodeLabel,
                              {
                                left: (nodeSize - SAGA_LABEL_WIDTH) / 2,
                                top: nodeSize + SAGA_LIP + Spacing.two + (special ? 12 : 0),
                              },
                            ]}>
                            <ThemedText
                              type={active ? 'smallBold' : 'small'}
                              numberOfLines={2}
                              // Backed in the SCENE colour (the navigation theme's background, which is what
                              // actually shows behind the trail -- theme.background is lighter and read as a
                              // grey box) so the connector passes behind the title instead of through it.
                              style={[styles.nodeTitle, { color: active ? theme.text : theme.mutedForeground, backgroundColor: sceneBg }]}>
                              {lesson.title}
                            </ThemedText>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </TrailFade>
        )}
      </ScrollView>

      {/*
        * Rendered INSIDE the screen, so the path stays mounted behind it. Verify on device: with the
        * sheet open, `sim.sh screen` must still list this screen's labels — if they vanish, someone
        * turned it back into a route.
        */}
      {gate && (
        <GateSheet
          feature="lesson"
          refusal={gate}
          visible
          onDismiss={() => setGate(null)}
          onSeePro={() => {
            setGate(null);
            router.push('/onboarding?step=paywall');
          }}
          onWhyNotFree={() => {
            setGate(null);
            router.push('/why-not-free');
          }}
        />
      )}
    </SafeAreaView>
  );
}


/**
 * The trail for one course. Keyed by course, so a switch mounts a fresh trail that settles in
 * (Duration.base, Ease.enter) instead of snapping; while the next course loads, the old trail dims
 * over Duration.fast rather than cutting to 35%.
 */
function TrailFade({ stale, style, children }: { stale: boolean; style: StyleProp<ViewStyle>; children: ReactNode }) {
  const reduced = useReducedMotion();
  const o = useSharedValue(stale ? 0.35 : 1);
  useEffect(() => {
    const to = stale ? 0.35 : 1;
    o.set(reduced ? to : withTiming(to, { duration: Duration.fast, easing: Ease.inOut }));
  }, [stale, reduced, o]);
  const dim = useAnimatedStyle(() => ({ opacity: o.get() }));
  return (
    <Animated.View entering={reduced ? undefined : FadeIn.duration(Duration.base).easing(Ease.enter)} style={[style, dim]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  /* Carried over verbatim from home.tsx with the strip itself. */
  /* The border owns the outer margins; the row owns the padding inside it. */
  trialBorder: { marginHorizontal: Spacing.three, marginTop: Spacing.three, marginBottom: Spacing.two },
  trialStrip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.three, paddingHorizontal: Spacing.three },
  /*
   * THE TRACK SPANS THE COLUMN. The three days were a fixed 26pt each, so they filled about a
   * fifth of the row and left the middle of the card visibly empty next to Atlas -- the card read
   * as unfinished rather than compact. `flex: 1` per day makes the three segments a progress track
   * the width of the text above them, which is also what makes the ramp legible: three stops
   * spread across 26pt are three dots, spread across the column they are a gradient you can read.
   */
  trialDots: { flexDirection: 'row', gap: 5, marginTop: 8, alignSelf: 'stretch' },
  trialDot: { flex: 1, height: 6, borderRadius: Radius.track, borderWidth: 1 },
  safe: { flex: 1 },
  header: { paddingHorizontal: Spacing.three, paddingTop: Spacing.two },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  countPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, borderWidth: 1 },
  streakPill: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  streakFlame: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  track: { height: 6, borderRadius: Radius.chip, overflow: 'hidden', marginTop: Spacing.three },
  fill: { height: 6, borderRadius: Radius.chip },
  // fixed, unshrinkable — RN gives ScrollView flexShrink:1, and the trail below is ~1500pt of
  // content, so without this the chip row gets squeezed and clips.
  chipScroll: { flexGrow: 0, flexShrink: 0, height: 44 + Spacing.two + Spacing.two },
  chipRow: { gap: Spacing.two, paddingHorizontal: Spacing.three, paddingTop: Spacing.two, paddingBottom: Spacing.two },
  // 44pt exactly: the HIG touch minimum, and the number the whole density fix is spending.
  chip: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: 14, borderRadius: Radius.pill },
  comingSoonChip: { opacity: 0.62 },
  /* Between the rail and the trail, so it describes the course whose lessons are on screen.
     Course accent rather than mutedForeground: grey subtext is the app-wide quality complaint
     this is meant to answer, not repeat. */
  whyRow: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.two },
  whyText: { fontSize: FontSize.caption, lineHeight: 17 },
  trailScroll: { flex: 1 },
  content: { alignItems: 'center', paddingHorizontal: Spacing.three, paddingBottom: BottomTabInset + Spacing.five },
  empty: { paddingTop: Spacing.six, alignItems: 'center', gap: Spacing.two },

  sagaCourse: { marginTop: Spacing.two },
  sagaUnit: { width: '100%', marginBottom: Spacing.five },
  levelHeader: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: Radius.lg,
  },
  levelEyebrow: { letterSpacing: 1.4 },
  levelTitle: { textAlign: 'center' },
  sagaTrail: { position: 'relative', marginTop: 12 },
  sagaStop: { position: 'absolute' },
  /* Left and top are computed per node from the face size, so only the positioning mode lives
     here. Width and height come from the ring itself. */
  nodeRing: { position: 'absolute' },
  nodeShell: {
    position: 'relative',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.36,
    shadowRadius: 0,
    elevation: 4,
  },
  specialNode: { transform: [{ rotate: '45deg' }] },
  nodeLip: { position: 'absolute', left: 0, borderRadius: Radius.pill },
  sagaNode: { alignItems: 'center', justifyContent: 'center', borderRadius: Radius.pill },
  specialFace: { borderRadius: 17 },
  nodeHighlight: {
    position: 'absolute',
    top: 4,
    left: 9,
    right: 9,
    height: 7,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.pill,
  },
  specialGlyph: { transform: [{ rotate: '-45deg' }] },
  playIcon: {
    width: 0,
    height: 0,
    marginLeft: 4,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderLeftWidth: 17,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#FFFFFF',
  },
  lessonNumber: { color: '#F4F4F5' },
  nodeLabel: { position: 'absolute', width: SAGA_LABEL_WIDTH, alignItems: 'center' },
  nodeTitle: { textAlign: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm, overflow: 'hidden' },
  currentLabel: { marginTop: 2, fontSize: 10, lineHeight: 13 },
});
