/**
 * Learn — the Duolingo-style pathway trail. A horizontal course rail picks one of the 12
 * real curriculum courses; below it the circular saga nodes (done / current / locked) render
 * that course's real lessons in the production web pathway language. Progress comes from
 * `completedLessons` in the store.
 */
import { router, useFocusEffect } from 'expo-router';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
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
import { UIcon } from '@/components/ui-icon';
import { BottomTabInset, Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { courseAccent } from '@/lib/course-accents';
import { COURSES, getCourseById, isCourseAvailable, loadCourseLessons, type PathwayLesson } from '@/lib/curriculum';
import { LESSONS_PER_UNIT, unitNameFor } from '@/lib/course-units';
import { lessonKey, useApp } from '@/lib/store';
import { takeLessonTrailCelebration } from '@/lib/lesson-trail-celebration';
import { RiseIn } from '@/shared/motion/rise-in';
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
const SAGA_CURRENT_COLOR = '#22C55E';
const SAGA_LOCKED_COLOR = '#17151F';
const SAGA_UPCOMING_COLOR = '#1B1825';
const SAGA_CHALLENGE_COLOR = '#F59E0B';
const SAGA_CONNECTOR_DRAW = 180;
const AnimatedPath = Animated.createAnimatedComponent(Path);

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
  const reduced = useReducedMotion();
  const scale = useSharedValue(earned && !reduced ? 0.94 : 1);
  const lift = useSharedValue(earned && !reduced ? 4 : 0);

  useEffect(() => {
    if (!earned || reduced) {
      scale.set(1);
      lift.set(0);
      return;
    }
    scale.set(withTiming(1, { duration: Duration.base, easing: Ease.enter }));
    lift.set(withTiming(0, { duration: Duration.base, easing: Ease.enter }));
  }, [earned, lift, reduced, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: lift.get() }, { scale: scale.get() }],
  }));
  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
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
  const [celebratingLesson, setCelebratingLesson] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const lessonId = takeLessonTrailCelebration();
      if (!lessonId) return;
      setCelebratingLesson(lessonId);
      const settle = setTimeout(() => setCelebratingLesson(null), Duration.screen + 700);
      return () => clearTimeout(settle);
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

  const lessons = useMemo(() => loaded?.lessons ?? [], [loaded]);
  const trailCourseId = loaded?.id ?? activeCourseId;
  // Keyed to the course actually ON SCREEN, not the one being switched to. During the async
  // loadCourseLessons swap `loaded.id` is still the outgoing course, so accenting by
  // `activeCourseId` painted the OLD course's rows and unit names in the NEW course's colour.
  const accent = courseAccent(trailCourseId);
  const pending = loaded?.id !== activeCourseId;
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
            <View style={[styles.fill, { backgroundColor: accent, width: `${total ? (doneCount / total) * 100 : 0}%` }]} />
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
                <ThemedText type="small" themeColor="mutedForeground" maxFontSizeMultiplier={2} style={{ marginTop: 1 }}>
                  Day {trialDay} of {TRIAL_DAYS} on your free trial
                </ThemedText>
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
            {failed === activeCourseId && !pending ? (
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
          <View style={[styles.sagaCourse, { width: sagaWidth, opacity: stale ? 0.35 : 1 }]}>
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
                    <ThemedText type="label" style={[styles.levelEyebrow, { color: accent }]}>LEVEL {unit.index + 1}</ThemedText>
                    <ThemedText type="bodyMedium" numberOfLines={2} style={styles.levelTitle}>{unit.title}</ThemedText>
                  </View>

                  <View style={[styles.sagaTrail, { width: sagaWidth, height: sagaHeight }]}>
                    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width={sagaWidth} height={sagaHeight}>
                      {nodes.slice(0, -1).map((node, localIndex) => {
                        const next = nodes[localIndex + 1];
                        const nextDone = doneFlags[next.lessonIndex];
                        const nextActive = next.lessonIndex === current;
                        const segment = sagaSegment(node, next);
                        const earned = celebratingLesson === lessonKey(trailCourseId, node.lesson.num);
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
                      const earned = celebratingLesson === lessonKey(trailCourseId, lesson.num);
                      const face = locked
                        ? SAGA_LOCKED_COLOR
                        : active
                          ? SAGA_CURRENT_COLOR
                          : done
                            ? completedFace
                            : SAGA_UPCOMING_COLOR;
                      const lip = locked ? '#0C0B11' : shade(face, 0.45);

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
                            accessibilityLabel={
                              locked
                                ? `${lesson.title}. Finish the lesson before this one to unlock it.`
                                : `${lesson.title}${done ? '. Complete' : active ? '. Start here' : ''}`
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
                                <View pointerEvents="none" style={styles.nodeHighlight} />
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
                              style={{ color: active ? theme.text : theme.mutedForeground, textAlign: 'center' }}>
                              {lesson.title}
                            </ThemedText>
                            {active && <ThemedText type="smallBold" style={[styles.currentLabel, { color: accent }]}>Current</ThemedText>}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
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

const styles = StyleSheet.create({
  /* Carried over verbatim from home.tsx with the strip itself. */
  /* The border owns the outer margins; the row owns the padding inside it. */
  trialBorder: { marginHorizontal: Spacing.three, marginBottom: Spacing.two },
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
  currentLabel: { marginTop: 2, fontSize: 10, lineHeight: 13 },
});
