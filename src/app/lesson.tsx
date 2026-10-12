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
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, InteractionManager, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { CardDeck } from '@/components/mobile-lesson/card-deck';
import { AmbientBackground } from '@/components/ambient-background';
import { LessonAtlasButton, buildAtlasLessonContext } from '@/components/ask-atlas';
import { Atlas } from '@/components/atlas';
import { LessonExplanation, hasExplanationScreen } from '@/components/lesson-explanation';
import { VocabConversation } from '@/components/atlas-conversation';
import { AtlasIntro, hasSeenAtlasIntro, resetAtlasIntroForDev } from '@/components/atlas-intro';
import { AtlasSpeech } from '@/components/atlas-speech';
import { LessonCheckBar } from '@/components/lesson-check-bar';
import { LessonComplete } from '@/components/lesson-complete';
import { LessonSegmentBar } from '@/components/lesson-segment-bar';
import { SegmentFinishCard, type SegmentNext } from '@/components/segment-finish-card';
import { InteractiveGraph, type InteractiveGraphControlValue } from '@/components/interactive-graph';
import { HookOpener } from '@/components/hook-opener';
import { LessonProse } from '@/components/lesson-prose';
import { LessonDesignProvider } from '@/components/lesson-design-provider';
import { LessonWarmup } from '@/components/lesson-warmup';
import { CorrectConfettiHost } from '@/components/correct-confetti';
import { LessonAtlasPresenceProvider } from '@/components/lesson-atlas-presence';
import { LessonBackdrop } from '@/components/lesson-backdrop';
import { LessonKeepsake } from '@/components/lesson-keepsake';
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
import { TapReveal } from '@/components/tap-reveal';
import { Skeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { TileBuilder } from '@/components/tile-builder';
import { TrueFalseSequence } from '@/components/true-false-sequence';
import { TeachingSlide } from '@/components/teaching-slide';
import { DismissalOfferSheet } from '@/components/dismissal-offer-sheet';
import { LeaveLessonSheet } from '@/components/leave-lesson-sheet';
import { DecisionTree } from '@/components/decision-tree';
import { DragSort } from '@/components/drag-sort';
import { TrialRewardSheet } from '@/components/trial-reward-sheet';
import { UIcon } from '@/components/ui-icon';
import { PixelSpriteView, heart as heartSprite, lightbulb as lightbulbSprite } from '@/lib/pixel';
import { Button, SlabButton } from '@/components/ui/button';
import { LessonColors } from '@/constants/lesson-design';
import { Radius, Spacing, FontSize } from '@/constants/theme';
import { Ev, track } from '@/lib/analytics';
import { useTheme } from '@/hooks/use-theme';
import { AVAILABLE_COURSES, isCourseAvailable, loadCourseLessons, type PathwayLesson } from '@/lib/curriculum';
import { choiceResponse, expandSteps, expandedStepIdentities, gates, isChoiceCorrect, normalizeStep } from '@/lib/lesson-steps';
import {
  clampLessonScreen,
  createLessonStepSession,
  isLessonStepComplete,
  isResumableScreen,
  lessonShapeSignature,
  markLessonStepCompletion,
  resumeScreenFor,
} from '@/lib/lesson-step-session';
import { lessonXpRemainder } from '@/lib/lesson-segment-credit';
import {
  isSegmentBoundary,
  legacyDoneKinds,
  readSegmentRecord,
  segmentEndingAt,
  segmentEntry,
  segmentIndexAt,
  segmentXpShares,
  segmentedProgress,
  segmentsOf,
  type SegmentKind,
  type SegmentRecord,
} from '@/lib/lesson-segments';
import { hasMasteryChallenge, lessonProgressPercent } from '@/lib/mastery-challenge-model';
import { shouldAnnouncePractice } from '@/lib/step-mode-transition';
import { applyDailyNudge, notificationsNeverAsked } from '@/lib/notifications';
import { loadLessonArt, type LessonArtSet } from '@/lib/pixel/scenes';
import { lessonKey, useApp, type AppState } from '@/lib/store';
import { accuracy, bestCombo, comboAt, comboRate, COMBO_MIN, isPerfect, type FirstTryLog } from '@/lib/combo';
import { feedback, warmLesson } from '@/lib/feedback';
import { queueLessonTrailCelebration } from '@/lib/lesson-trail-celebration';
import { TRIAL_DAYS, useTier } from '@/lib/entitlement';
import { EARN } from '@/lib/shop-items';
import { IAP_ENABLED } from '@/lib/purchases';
import { dismissalOfferAvailable } from '@/lib/dismissal-offer';
import { trialRewardAvailable } from '@/lib/trial-reward';
import { semanticMotionForLessonStep } from '@/lib/semantic-motion';
import { MAX_TRIES, firstTryCounts, pickAnswerLayout, type Verdict } from '@/lib/answer-layout';
import { SemanticMotion } from '@/shared/motion/semantic-motion';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { Duration } from '@/shared/motion/tokens';
import { RiseIn } from '@/shared/motion/rise-in';

/** Module scope, so an impure Date.now() is never in render scope. Same reason start.tsx has one. */
const nowMs = () => Date.now();

/**
 * The two facts the resume pointer is keyed to, computed from a lesson the loader just handed us.
 *
 * Read off the RUNTIME steps (post `expandSteps`), because that is the numbering `idx` walks and
 * therefore the numbering that gets persisted. The distinction is currently free, since every
 * authored type expandSteps lifts is in RETIRED_STEP_TYPES and the expansion is the identity across
 * all 300 lessons, but it stops being free the moment one of them comes back, and a pointer that
 * silently means a different numbering than it did last week is the failure this hash exists for.
 */
function lessonResumeShape(steps: PathwayLesson['steps']): { screens: number; shape: string } {
  const runtime = expandSteps(steps ?? []);
  return {
    screens: runtime.length,
    shape: lessonShapeSignature(runtime.map((s) => (s as { type?: string }).type ?? '')),
  };
}

/**
 * The part card that is currently up, or null.
 *
 * `k` is the index of the segment that just FINISHED, not the one coming next, because that is
 * what the store was paid for and what the card reports. `xp` is what `completeLessonSegment`
 * paid for THIS PART (the share times Double XP), never the share that was requested
 * (CONSTITUTION 6.5) — a part credited twice returns 0 and the card then draws no chip rather
 * than promising XP the ledger did not pay. It deliberately leaves out the daily-goal bonus that
 * the same credit can trigger: with it folded in, finishing Learn one minute short of the goal
 * drew "+60 XP" on a lesson worth 30 (measured 22 Sep 2026), and the part read as the payout.
 */
type SegmentBreak = { k: number; xp: number; streakAdvanced: boolean; streak: number };

/** On-screen names for the three parts. The store and the pins speak `SegmentKind`; the header
 *  eyebrow speaks the learner's language, and this is the only place the two are joined. */
const PART_NAME: Record<SegmentKind, string> = { learn: 'Learn', vocab: 'Vocab', practice: 'Practice' };

/** A segment with no screens of its own: a Practice that is the mastery challenge alone (16
 *  lessons). `first = total + 1` and `last = total`, so the range is empty by construction. */
const segmentHasScreens = (s: { first: number; last: number }) => s.first <= s.last;

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

/** "92% accuracy · Best combo 7" for the finish screen; null when nothing was graded. */
function lessonStats(log: FirstTryLog): string | null {
  const acc = accuracy(log);
  if (acc === null) return null;
  const best = bestCombo(log);
  return [`${String(Math.round(acc * 100))}% accuracy`, best >= COMBO_MIN ? `Best combo ${String(best)}` : null]
    .filter(Boolean)
    .join(' · ');
}

/** The celebration's number and its one-line note (streak safety net). */
function streakSnapshot(p: ReturnType<AppState['streakPreview']>): { days: number; note: string | null } {
  const note = p.restored
    ? `Streak earned back: ${String(p.streak)} days`
    : p.repair
      ? `${String(p.repair.done)} of ${String(p.repair.need)} lessons to earn back your ${String(p.repair.lost)}-day streak`
      : p.freezeEarned
        ? `${String(p.streak)} days. Atlas packed you a Streak Freeze.`
        : p.freezeUsed
          ? 'A Streak Freeze saved your streak.'
          : null;
  return { days: p.streak, note };
}

export default function Lesson() {
  /** When this lesson was opened. Set in an effect to keep render pure. */
  const openedAt = useRef(0);
  const theme = useTheme();
  // Freeze-, repair- and milestone-aware (streakPreview), so a saved or earned-back day shows its
  // real number rather than nextStreak's plain +1.
  const streakAfter = useApp((s) => s.streakPreview().streak);
  // Captured just before completeLesson commits: afterwards the preview no longer knows the day
  // was restored or paid a freeze, and the celebration needs to say so.
  const [streakSnap, setStreakSnap] = useState<{ days: number; note: string | null } | null>(null);
  const completedLessonIds = useApp((s) => s.completedLessons);
  /*
   * The resume pointer is PERSISTED state, so reading it before rehydration settles reads the
   * initial null and silently starts every deep-linked lesson over. Same race app/index.tsx guards
   * its routing with. The load effect below waits on this rather than restoring optimistically,
   * because "restored to the wrong place" cannot be undone once the learner starts tapping.
   */
  const hasHydrated = useApp((s) => s.hasHydrated);
  const params = useLocalSearchParams<{ course?: string; num?: string; fresh?: string; qa?: string; part?: string }>();
  const courseId = params.course ?? '';
  const lessonNum = Number(params.num);
  /* The loaded lesson's art, set beside the lesson it belongs to (see the load effect), never read
     from the route params: a link that swaps the params on a mounted screen would otherwise show the
     next lesson's art over this lesson until it loads. */
  const [lessonArt, setLessonArt] = useState<LessonArtSet | null>(null);
  const qa = __DEV__ ? params.qa : undefined;
  /**
   * `?part=learn|vocab|practice`. Read as a primitive so the load effect can depend on it without
   * depending on the params OBJECT, which `useLocalSearchParams` hands back new on every render.
   *
   * No caller passes it today (home, learn, start, home-variants, digest and trade-ideas all rely
   * on auto-resume); it exists so a part can be linked to, and it is clamped rather than obeyed —
   * see the load effect. Garbage is ignored the way `badParams` ignores a bad course.
   */
  const partParam = params.part;
  /**
   * This lesson's persisted part record, SUBSCRIBED rather than read from `getState()`.
   *
   * It is what the last screen's "Collect +N XP" is computed from, and it changes under this
   * screen every time a part is credited. A `getState()` read inside render would be a snapshot
   * that React has no reason to refresh, so the figure could disagree with the ledger that is
   * about to pay it. Undefined until the first part lands, which `readSegmentRecord` handles.
   */
  const liveSegmentRecord = useApp((s) => s.lessonSegments[lessonKey(courseId, lessonNum)]);
  /**
   * THE LAST RECORD THIS RUN SAW, held past the payout.
   *
   * `completeLesson` deletes the record in the SAME write that marks the lesson complete
   * (store.ts, `lessonSegments: withoutSegmentRecord(...)`), so the live subscription drops to
   * undefined the instant Collect is pressed and `lessonXpRemainder` answers the lesson's FULL
   * XP again. Measured on a 50 XP three part lesson: the footer reads "Collect +25 XP", the tap
   * pays 25, and the same button then relabels itself "Collect +50 XP" for XP nothing will pay
   * (CONSTITUTION 3.1). It is not a single frame either: on the first lesson ever finished the
   * 17c sheet opens over this screen instead of leaving, so the wrong figure sits under it until
   * the learner dismisses it.
   *
   * Captured in the Collect HANDLER, one line before `completeLesson`, and not in an effect
   * watching the subscription: `react-hooks/set-state-in-effect` is an eslint ERROR here, and a
   * ref read back during render would be the same stale-snapshot shape the note above rejects.
   * The load effect clears it, so a second lesson reached without a remount cannot inherit the
   * first one's paid parts.
   */
  const [paidOutRecord, setPaidOutRecord] = useState<SegmentRecord | undefined>(undefined);
  const segmentRecord = liveSegmentRecord ?? paidOutRecord;
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


  /** Fingerprint of the runtime step shape now on screen. Written into every saved pointer. */
  const resumeShape = useMemo(
    () => lessonShapeSignature(steps.map((s) => (s as { type?: string }).type ?? '')),
    [steps],
  );

  /*
   * THE PARTS OF THIS LESSON (owner decision, 2026-09-22): Learn, then Vocab, then Practice, and
   * two parts instead of three when the lesson has no keyTermsCards screen.
   *
   * Derived from the RUNTIME step types, the same list `idx`, the resume pointer and
   * `lessonShapeSignature` walk, so the boundaries change exactly when the shape hash changes. A
   * pointer that passes the shape check therefore always means the same boundaries; splitting on
   * the authored steps instead would let a pointer survive a sync that moved a part edge under it.
   */
  const segments = useMemo(
    () => segmentsOf(steps.map((s) => (s as { type?: string }).type ?? ''), hasChallenge),
    [steps, hasChallenge],
  );
  /**
   * Is this a REPLAY of a lesson that is already finished? Read once, when the lesson loads.
   *
   * The whole part layer is off on a replay (owner decision): no part cards, no segmented bar, and
   * nothing is paid, because `completedLessons` already holds this lesson and both store writers
   * refuse it. Read once rather than subscribed on purpose: `completeLesson` runs from the STREAK
   * screen of THIS run, so a live subscription would flip the flag mid-run and change the header
   * out from under a learner who is still looking at it.
   */
  const [replay, setReplay] = useState(false);
  /** The part card that is up, or null. Overlay state only: never persisted, and the part it
   *  reports was already credited when the card was raised, so losing it costs nothing. */
  const [segmentBreak, setSegmentBreak] = useState<SegmentBreak | null>(null);
  /** True when this run draws one track per part. A one-part lesson keeps the single bar. */
  const segmented = !replay && segments.length > 1;
  /*
   * WHAT THE LEAVE SHEET IS ALLOWED TO SAY IS BEHIND THEM.
   *
   * Filtered through THIS run's segments instead of read straight off the record. The record is
   * keyed by kind rather than by position so it survives a curriculum sync, and the cost of that
   * is that a sync which removes a lesson's keyTermsCards leaves a 'vocab' in `done` for a lesson
   * that no longer has one. Naming it would have the sheet promise a part the next open cannot
   * keep. Ordered by the segments, not by `done`, so it always reads "Learn and Vocab".
   *
   * Empty on a replay and on a one-part run, where `segmented` is false and nothing is credited.
   *
   * DERIVED HERE, above the `missing` / `locked` / `!lesson` early returns, and not next to
   * `xpRemaining` where it is read: a hook below an early return is called on some renders and
   * not others, which is the rules-of-hooks crash rather than a style point.
   */
  const donePartNames = useMemo(() => {
    if (!segmented) return [];
    const { done } = readSegmentRecord(segmentRecord);
    return segments.filter((s) => done.includes(s.kind)).map((s) => PART_NAME[s.kind]);
  }, [segmented, segmentRecord, segments]);

  const [idx, setIdx] = useState(0);

  // The lesson-complete screen already celebrates visually (wipe, confetti, rays, rolling XP); it
  // was silent. One chime as it lands. Keyed on reaching DONE so it plays once per completion.
  useEffect(() => {
    if (idx === DONE && total > 0) feedback('lessonComplete');
  }, [idx, DONE, total]);
  const [pick, setPick] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  /**
   * Was the answer on THIS visit to THIS screen the one that spent the heart?
   *
   * The out-of-hearts wall used to fire on `checked`, which is restored by `openLessonScreen` when
   * you walk back into a question you already answered. Consequence, reachable with three wrong
   * answers and one tap of Previous: get walled at screen 9, tap Previous to reread screen 5, and
   * Continue on screen 5 raises the wall again for a heart that was spent minutes ago. Every
   * question you ever got wrong becomes its own wall, and the lesson can no longer be finished
   * from any of them. The heart was charged once, so the gate belongs to the grading, not to the
   * graded state that outlives it.
   */
  const [justGraded, setJustGraded] = useState(false);
  /*
   * THE CHECK BAR (owner decision 4, 2026-09-22). One entry per Check on this question, true when
   * that attempt was right. A first miss gets an amber bar and ONE Try again; only attempts[0]
   * counts toward mastery (firstTryCounts), so a retry is for learning and never a free pass.
   * `retryOut` holds the options a Try again ruled out; `revealed` is See answer.
   */
  const [attempts, setAttempts] = useState<boolean[]>([]);
  const [retryOut, setRetryOut] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);
  /** Why? on the bar opens the authored explanation page; it is no longer forced on every miss. */
  const [showWhy, setShowWhy] = useState(false);
  /** The active deck card draws its own Atlas (card-deck.tsx cardDrawsAtlas), so the float hides. */
  const [deckAtlas, setDeckAtlas] = useState(false);
  /** A mascot is drawn inside the step (lesson-atlas-presence), so the float must not draw one. */
  const [contentAtlas, setContentAtlas] = useState(false);
  /** Bumped by a tap on that in-content Atlas: it opens the float's tutor sheet. */
  const [askAtlasKey, setAskAtlasKey] = useState(0);
  /*
   * THE BOTTOM LANE, MEASURED (S2 review, 2026-09-22). Two absolute overlays used to be positioned
   * against guesses instead of against what is on the screen:
   *   - the floating Ask-Atlas button sat at bottom:20, straight over the right end of whatever CTA
   *     was in the footer. Measured on iPhone 17 Pro, personal-finance lesson 15 step 3: the deck's
   *     Got it at y 784..828 under an Atlas at 766..820. On an unanswered question that CTA is
   *     Check, so the learner's one way to submit an answer was under the mascot (sim screenshot
   *     07-lesson-checkbar-miss-a). `footerH` is the lesson footer, `deckFooterH` the deck's own
   *     Back / Got it row; the float is lifted above whichever is on screen.
   *   - the check bar is absolute too, and the question below it reserved a FIXED 170pt. A taller
   *     bar (the 'answer' bar carries an extra line, and Dynamic Type grows all of it) then covered
   *     the last stacked option with no way to scroll it clear. `checkBarH` is the bar's own
   *     onLayout height and the question pads by that instead.
   * All three are heights, not positions, so nothing here depends on the screen's width.
   */
  const [footerH, setFooterH] = useState(0);
  const [deckFooterH, setDeckFooterH] = useState(0);
  const [checkBarH, setCheckBarH] = useState(0);
  const { fontScale } = useWindowDimensions();
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
    attempts: boolean[];
    retryOut: number[];
    revealed: boolean;
  }>());
  /** Child interaction snapshots and monotonic completion, scoped to this mounted lesson attempt. */
  const [lessonStepSession] = useState(() => createLessonStepSession());
  /** 17c. Holds the post-lesson navigation open so the reward offer can land on the win. */
  const [trialReward, setTrialReward] = useState(false);
  /** 17d. Raised when the hard wall is dismissed and a better ask is still unspent. */
  const [offer, setOffer] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  /** Tutor memory mirrors the web runner but stays session-local to this lesson attempt. */
  const [correctSoFar, setCorrectSoFar] = useState(0);
  // First-try results by screen, for the combo chip and the finish-screen stats (lib/combo.ts).
  const [firstTryLog, setFirstTryLog] = useState<FirstTryLog>({});
  // Create the lesson's sound players up front so the first Check is not the one that loads audio.
  useEffect(warmLesson, []);
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
  /*
   * What the bar says. Derived, not stored, so a restored screen (Back, then forward) can never hold
   * a verdict that disagrees with its attempts. Mirrors checkReducer in answer-layout.ts: right is
   * 'correct', a second miss or See answer is 'answer', a first miss is 'retry'.
   */
  const verdict: Verdict | null = !isChoice || !checked || attempts.length === 0
    ? null
    : attempts[attempts.length - 1] ? 'correct' : revealed || attempts.length >= MAX_TRIES ? 'answer' : 'retry';
  const whyOpen = isChoice && checked && showWhy && hasExplanationScreen(gradedChoice);
  /** Row, 2x2 grid or stack, from the options as shown (answer-layout.ts; fillBlank keeps its own). */
  const layout = isChoice ? pickAnswerLayout(norm.options, fontScale) : 'stack';
  const xp = lesson?.xp ?? 30;
  const atlasContext = useMemo(() => {
    if (!lesson || !norm || idx < 1 || idx > total || challengeStage !== 'none') return undefined;
    const attempted = isChoice ? checked || hinted : solved;
    /*
     * THE FIRST TRY, not the pick on screen (S2 review, 2026-09-22). Only attempts[0] scores
     * (firstTryCounts in answer-layout.ts, and the heart gate below reads attempts[0] for the same
     * reason), but this read `isChoiceCorrect(norm, pick)`, which after a Try again is the RETRY's
     * pick. On a question missed once and then answered right, the two disagreed.
     *
     * NOT A DEFECT ANY LEARNER HAS SEEN, and this comment says so rather than claiming a screen it
     * cannot produce (CONSTITUTION 1.1). The only thing that reads this context is the floating
     * Ask-Atlas button, and the button is drawn under `verdict === null` (see the float below),
     * which is the exact negation of the condition that gives this value anything but `undefined`
     * (`verdict` is non-null iff isChoice && checked && attempts.length > 0, line above). So today
     * the tutor is never on screen holding a verdict at all. It is written to match the score so
     * that the day Atlas is offered BESIDE the check bar, it cannot open by contradicting it.
     */
    const wasCorrect = isChoice && checked && attempts.length > 0 ? attempts[0] : undefined;
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
  }, [attempts, authoredIdentity?.authoredIndex, authoredTotal, challengeStage, checked, correctSoFar, courseId, graphControlState, hinted, idx, isChoice, lesson, norm, pick, recentMistakes, solved, steps, total]);

  const rememberCurrentScreen = () => {
    visitedScreenState.current.set(idx, { pick, checked, solved, hinted, showRecap, attempts, retryOut, revealed });
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
        setFirstTryLog({});
        setRecentMistakes([]);
      });
      return;
    }

    // Nothing is loaded until the persisted pointer is readable, or the restore below reads a null
    // that had not loaded yet and every resumable lesson silently starts over. The skeleton is
    // already on screen while this waits, so the user sees the normal load, not a stall.
    if (!hasHydrated) return;

    let cancelled = false;
    // The lesson's art loads beside it (lib/pixel/scenes is on demand) and is set with it, so the
    // first render of a lesson already has its art. Art is decoration: a failed load shows the lesson
    // without it.
    Promise.all([loadCourseLessons(courseId), loadLessonArt(courseId, lessonNum).catch(() => null)])
      .then(([ls, art]) => {
        if (cancelled) return;
        const found = ls.find((l) => l.num === lessonNum) ?? null;
        setChallengeStage('none');
        setLessonArt(art);
        setLesson(found);
        setNotFound(!found);
        /*
         * A NEW LESSON GETS A CLEAN RUNNER. `idx` and the two per-attempt maps used to be seeded
         * once per MOUNT while the lesson itself is loaded by an effect keyed on the params, so if
         * this effect ever ran twice for one mount the second lesson inherited the first one's
         * position and the first one's per-index answers. Resetting here makes the runner's state
         * a function of the lesson it is showing rather than of the mount, which is what it always
         * claimed to be.
         */
        visitedScreenState.current.clear();
        lessonStepSession.snapshots.clear();
        lessonStepSession.completed.clear();
        setPick(null);
        setChecked(false);
        setSolved(false);
        setHinted(false);
        setShowRecap(false);
        setOutOfHearts(false);
        setJustGraded(false);
        /*
         * WHERE THE LESSON OPENS. `resumeScreenFor` returns 0, the warmup, for every pointer it
         * declines to trust: a different lesson, a shape the curriculum has changed underneath, or
         * an index outside the steps that exist now. It never returns a terminal screen, so
         * reopening the app can never land on the completion celebration and pay out a lesson.
         */
        const resumeKey = lessonKey(courseId, lessonNum);
        const pointer = found ? resumeScreenFor(useApp.getState().lessonResume, {
          key: resumeKey,
          ...lessonResumeShape(found.steps),
        }) : 0;
        setIdx(pointer);
        setSegmentBreak(null);
        // Same rule as the two maps above: the runner's state is a function of the lesson it is
        // showing, not of the mount. A held payout record from a previous lesson would subtract
        // that lesson's part shares from this one's "Collect +N XP".
        setPaidOutRecord(undefined);
        const finished = found ? useApp.getState().completedLessons.includes(resumeKey) : false;
        setReplay(finished);
        if (found && !finished) {
          const segs = segmentsOf(
            expandSteps(found.steps).map((s) => (s as { type?: string }).type ?? ''),
            hasMasteryChallenge(found.challenge),
          );
          /*
           * BACKFILL, ONCE, LAZILY, AND IT PAYS NOTHING (design 2c).
           *
           * Someone who was mid-lesson when parts shipped has a resume pointer and no segment
           * record. This cannot be done in the store's `migrate`, which is synchronous, because
           * the boundaries need the runtime steps and those arrive from the async course loader —
           * a version-gated backfill would have had to GUESS them. `pointer > 0` because
           * `resumeScreenFor` has already refused a pointer for another lesson or another shape,
           * so a 0 means there is nothing to adopt. The record is written even when it lists no
           * finished parts: its existence is what stops this re-running on every open.
           *
           * It pays no XP, no minutes and no streak. The old build paid the whole lesson at the
           * end and still will: `xpPaid` stays 0, so the final part pays `lesson.xp - 0`.
           */
          if (!useApp.getState().lessonSegments[resumeKey] && pointer > 0) {
            useApp.getState().adoptLegacySegments(resumeKey, legacyDoneKinds(segs, pointer));
          }
          /*
           * WHERE A PART-SPLIT LESSON OPENS. The first part that is not done, keeping a pointer
           * that sits INSIDE that part so mid-part resume still works. A part after the first
           * never opens on the warmup or the AtlasIntro gate, both of which only fire at idx 0.
           */
          const entry = segmentEntry(segs, useApp.getState().segmentsDoneFor(resumeKey), pointer);
          setIdx(entry.screen);
          if (entry.challengeIntro) setChallengeStage('intro');
          /*
           * `?part=`, CLAMPED TO THE FIRST UNFINISHED PART, never obeyed past it. Skipping Vocab
           * would leave the lesson unfinishable from the quest's point of view and would scramble
           * the remainder the final part pays, because `completeLesson` pays `xp - xpPaid`. A part
           * at or before the first unfinished one is allowed and pays nothing on a second visit,
           * since the store dedupes on (lesson, kind).
           */
          const requested = partParam ? segs.findIndex((s) => s.kind === partParam) : -1;
          if (requested >= 0) {
            const target = segs[Math.min(requested, entry.segment)];
            /*
             * `setChallengeStage('none')` IS NOT REDUNDANT. `entry.challengeIntro` above has
             * already raised the mastery challenge whenever the first unfinished part is a
             * challenge-only Practice, and a `?part=` that clamps to an EARLIER part only moved
             * `idx`. Measured over the corpus on 22 Sep 2026: on all 16 challenge-only lessons
             * (financial-analytics:14-25, global-economics:25, behavioral-finance:25,
             * risk-management:25, corporate-finance:4) a link to `part=learn` opened content
             * screen 1 with the challenge intro on top of it, so the challenge started from the
             * Learn part and passing it paid the lesson out from there. `?part=` is not
             * __DEV__-gated, so a deep link reaches this in a release build.
             */
            if (segmentHasScreens(target)) { setIdx(target.first); setChallengeStage('none'); }
            else { setIdx(target.last); setChallengeStage('intro'); }
          }
          /*
           * DEV ONLY. `?qa=part-break&part=<kind>` lands on that part's last screen with the card
           * already up and CREDITS NOTHING, so a layout or Dynamic Type sweep can photograph the
           * card without solving a lesson first. The xp shown is the share for display only.
           */
          if (qa === 'part-break') {
            const k = Math.max(0, segs.findIndex((s) => s.kind === partParam));
            if (k < segs.length - 1 && segmentHasScreens(segs[k])) {
              setIdx(segs[k].last);
              setSegmentBreak({
                k,
                xp: segmentXpShares(found.xp ?? 30, segs.map((s) => s.kind))[k],
                streakAdvanced: false,
                streak: useApp.getState().streak,
              });
            }
          }
        }
        if (found && qa === 'complete') setIdx(expandSteps(found.steps).length + 1);
        // DEV only, like every `qa`: the streak screen, for checking it without finishing a lesson.
        if (found && qa === 'streak') setIdx(expandSteps(found.steps).length + 2);
        if (found && qa === 'heart-wall') setOutOfHearts(true);
        // Dev-only (`qa` is __DEV__-gated above): `qa=step-3` opens straight onto screen 3, so a
        // layout fix deep in a lesson can be checked on the simulator without tapping through it.
        const qaStep = found && qa?.startsWith('step-') ? Number(qa.slice(5)) : NaN;
        if (found && Number.isInteger(qaStep) && qaStep >= 0) setIdx(Math.min(qaStep, expandSteps(found.steps).length));
        openedAt.current = Date.now();
        setCorrectSoFar(0);
        setFirstTryLog({});
        setRecentMistakes([]);
      })
      .catch(() => {
        if (cancelled) return;
        setLessonArt(null);
        setNotFound(true);
        openedAt.current = Date.now();
        setCorrectSoFar(0);
        setFirstTryLog({});
        setRecentMistakes([]);
      });

    return () => {
      cancelled = true;
    };
  }, [badParams, courseId, lessonNum, hasHydrated, lessonStepSession, partParam, qa]);

  /**
   * Persist the position, or forget it.
   *
   * Written on EVERY screen change rather than on exit, because there is no exit event a force
   * quit or an OS eviction will run. AsyncStorage has no synchronous write, so the last screen
   * change before an instant kill can still be lost; one screen is the smallest window available
   * without an awaited flush, which zustand's persist middleware does not expose.
   *
   * Terminal screens forget instead of remembering: the lesson is not credited until Continue is
   * pressed from the streak screen, so a pointer aimed at the celebration would pay out a whole
   * lesson for reopening the app.
   */
  const recordResume = (screen: number) => {
    const key = lessonKey(courseId, lessonNum);
    const st = useApp.getState();
    if (!isResumableScreen(screen, total)) {
      // Only ours to clear. Another lesson's pointer is not this lesson's business.
      if (st.lessonResume?.key === key) st.setLessonResume(null);
      return;
    }
    st.setLessonResume({ key, screen, shape: resumeShape, savedAt: nowMs() });
  };

  const openLessonScreen = (nextIndex: number) => {
    /*
     * CLAMPED, and the clamp is not decorative. `steps[idx - 1]` is undefined for any index past
     * the end, and every render branch below then declines to draw, leaving a blank body under a
     * live Continue button. That is the state Apple rejected build 1.0.0(6) over under guideline
     * 2.1(a), described as "the app became unresponsive"; scripts/step-clamp-regression.mjs pins
     * the onboarding half of it and scripts/lesson-resume-regression.mjs pins this half.
     */
    const target = clampLessonScreen(nextIndex, total);
    const saved = visitedScreenState.current.get(target);
    setIdx(target);
    setPick(saved?.pick ?? null);
    setChecked(saved?.checked ?? false);
    setSolved(isLessonStepComplete(lessonStepSession, target) || (saved?.solved ?? false));
    setHinted(saved?.hinted ?? false);
    setShowRecap(saved?.showRecap ?? false);
    setAttempts(saved?.attempts ?? []);
    setRetryOut(saved?.retryOut ?? []);
    setRevealed(saved?.revealed ?? false);
    setShowWhy(false);
    setOutOfHearts(false);
    // A restored answer was graded on a previous visit, so it has already paid its heart.
    setJustGraded(false);
    recordResume(target);
  };

  const previousScreen = () => {
    if (idx <= 0) return;
    Keyboard.dismiss();
    rememberCurrentScreen();
    openLessonScreen(idx - 1);
  };

  const gradeChoice = (selectedIndex: number) => {
    if (norm?.kind !== 'choice' || checked) return;
    const correct = isChoiceCorrect(norm, selectedIndex);
    const next = [...attempts, correct];
    setAttempts(next);
    setPick(selectedIndex);
    setChecked(true);
    setJustGraded(true);
    // Every Check is felt and heard on the tap that caused it, the retry included -- answering was
    // the app's most frequent action and it had neither, a large part of why it felt static.
    // A first-try correct extends the run; from 3 in a row the chime climbs (feedback 'combo').
    const scored = next.length === 1 && !hinted;
    const run = scored && correct ? comboAt({ ...firstTryLog, [idx]: true }, idx) : 0;
    if (!correct) feedback('wrong');
    else if (run >= COMBO_MIN) feedback('combo', { rate: comboRate(run) });
    else feedback('correct');
    if (scored) setFirstTryLog((log) => ({ ...log, [idx]: correct }));
    /*
     * ONLY THE FIRST TRY SCORES (owner decision 4). A right answer after Try again adds nothing to
     * correctSoFar, the tutor's mastery memory, and a second miss costs no second heart: one
     * question, one charge, however the retry goes. Before the check bar there was no retry, so
     * this was every attempt; with one, counting the retry would make a four-option guess "right"
     * half the time on the second go.
     */
    if (next.length > 1) return;
    if (firstTryCounts(next)) {
      setCorrectSoFar((value) => value + 1);
    } else {
      setRecentMistakes((previous) => [...previous, norm.prompt].slice(-3));
    }
    if (heartLimited && !correct && !hinted) loseHeart();
  };

  /** Try again: the missed option is ruled out and the question re-opens for one more Check. */
  const tryAgain = () => {
    if (verdict !== 'retry' || pick === null) return;
    setRetryOut((out) => (out.includes(pick) ? out : [...out, pick]));
    setPick(null);
    setChecked(false);
  };

  const advance = () => {
    Keyboard.dismiss();

    /*
     * NOTHING ADVANCES WHILE A PART CARD IS UP. The card is an overlay: the step underneath is
     * still mounted, so anything that can still reach this function (a hardware keyboard, an
     * accessibility action, a CTA that has not unmounted yet) would walk past the part card and
     * straight into the next screen, skipping the choice the card exists to offer. The two ways
     * forward are the card's own buttons.
     */
    if (segmentBreak !== null) return;

    if (idx === 0 && atlasIntroNeeded !== false) {
      setShowAtlasIntro(true);
      return;
    }

    if (isChoice && !checked) {
      if (pick !== null) gradeChoice(pick);
      return;
    }
    // A first miss is settled by Try again or See answer, never by Continue.
    if (verdict === 'retry') return;
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
    /*
     * `justGraded`, NOT `checked`. See the note on the state itself: `checked` is restored when
     * you walk back into a question you already answered, so gating on it re-walled every past
     * mistake once the hearts were gone and made the lesson unfinishable from any of them. The
     * heart is spent exactly once, by the grading immediately above, so the gate belongs to that.
     */
    /*
     * attempts[0], not the pick on screen: the first try is the one that spent the heart. Reading
     * the current pick let a right answer after Try again walk past the wall at zero hearts.
     */
    if (heartLimited && isChoice && justGraded && checked && attempts[0] === false && hearts <= 0) {
      setOutOfHearts(true);
      return;
    }
    if (norm?.kind === 'prose' && norm.atlas?.recap && !showRecap) {
      setShowRecap(true);
      return;
    }
    /*
     * THE END OF A NON-FINAL PART (design section 4.3).
     *
     * MUST STAY ABOVE THE CHALLENGE INTERCEPT BELOW. 16 lessons in the corpus end their vocab on
     * the last screen and carry the mastery challenge as their whole Practice, so for those the
     * part boundary and `idx === total && hasChallenge` are the SAME screen. Below the intercept
     * this hook would never run for them and the last part card would silently disappear;
     * scripts/lesson-segment-runner-pin.mjs pins the textual order for that reason.
     *
     * CREDITED WHEN THE CARD APPEARS, not when a button is pressed. "Done for now", a force quit
     * and a backgrounded app all keep the part. Safe because the card is overlay state that is
     * never persisted and the store dedupes on (lesson, kind), so a remount, a Back, a `?part=`
     * link or a replay can never pay the same part twice.
     *
     * `segmentBreak === null` so a second advance under a card that is already up cannot re-enter
     * this branch; the guard at the top of `advance` makes that unreachable, and this keeps the
     * branch correct on its own terms rather than on that one's.
     */
    const endK = replay ? null : segmentEndingAt(segments, idx);
    if (endK !== null && segmentBreak === null) {
      rememberCurrentScreen();
      const seg = segments[endK];
      const share = segmentXpShares(xp, segments.map((s) => s.kind))[endK];
      // The store is the only authority on what a part pays; this reads back what it applied.
      const credit = useApp.getState().completeLessonSegment(lessonKey(courseId, lessonNum), seg.kind, share, (Date.now() - openedAt.current) / 60000);
      if (credit.credited) {
        track(Ev.lessonPartCompleted, {
          course: courseId,
          lesson: lessonNum,
          part: seg.kind,
          part_index: endK,
          parts: segments.length,
          streak_advanced: credit.streakAdvanced,
          xp: credit.xp,
          lesson_done: false,
        });
        /*
         * The trail fills one arc of this lesson's ring and nothing else moves. The node bounce
         * and the drawn connector both mean THE NEXT LESSON IS OPEN, which is false after a part:
         * `doneFlags` only flips on `completedLessons`, which a part credit never touches.
         */
        queueLessonTrailCelebration(lessonKey(courseId, lessonNum), { segment: seg.kind });
      }
      setSegmentBreak({ k: endK, xp: credit.xp, streakAdvanced: credit.streakAdvanced, streak: credit.streak });
      return;
    }
    if (idx === total && hasChallenge) {
      rememberCurrentScreen();
      setChallengeStage('intro');
      return;
    }
    if (idx < STREAK) {
      rememberCurrentScreen();
      /*
       * "Now quiz yourself" is suppressed at a part boundary. Measured over the corpus, the
       * reading-to-practice edge is also a part edge on 276 lessons, and there the part card is
       * the transition: two full-screen beats back to back would land the second one on a learner
       * who has just chosen "Keep going". The pinned `shouldAnnouncePractice(steps[idx - 1],
       * steps[idx])` call is WRAPPED rather than edited, so practice-transition-pin and
       * step-mode-transition-regression still find it.
       */
      if (idx >= 1 && idx < total && shouldAnnouncePractice(steps[idx - 1], steps[idx])
        && !(segmented && isSegmentBoundary(segments, idx))) {
        setAnnouncePractice(true);
      }
      openLessonScreen(idx + 1);
    } else {
      // 17b funnel: first_lesson_completed, the activation step. Sampled BEFORE the call, because
      // `completeLesson` is what makes the count non-zero — reading it afterwards can never see the
      // transition. Tracked here rather than in the store: `analytics` imports the store, so the
      // store importing analytics would close a cycle.
      const wasFirst = useApp.getState().completedLessons.length === 0;
      // Sampled BEFORE the credit, for the same reason `wasFirst` is: `completeLesson` is what
      // moves the streak, so reading it afterwards can never see whether it moved.
      const streakBefore = useApp.getState().streak;
      /*
       * REAL TIME, not the lesson's listed length. Reported 2026-08-22: "it looks like the app
       * measures time based on the lesson's listed duration, not actual time spent in-app. After
       * finishing a lesson it shows 5 minutes even if you were on the app much longer."
       *
       * Measured from mount, so the intro screen and any thinking time count — a learner who sat
       * with a question for four minutes did spend those four minutes here. The store clamps the
       * value; this side only reports it.
       */
      /*
       * goal-minutes-pin expects Date.now() - openedAt.current in lesson.tsx.
       *
       * The `eslint-disable-next-line react-hooks/purity` that used to sit here went DEAD when
       * the part layer landed: the compiler stops analysing `advance` once the part credit's
       * `useApp.getState()` call is in it, so the rule no longer reports this line and eslint
       * reported the directive itself as unused. Left in place it was one of the 45 warnings
       * `npm run check` allows, spent on nothing.
       */
      const minutesSpent = (Date.now() - openedAt.current) / 60000;
      const completedId = lessonKey(courseId, lessonNum);
      const alreadyCompleted = useApp.getState().completedLessons.includes(completedId);
      /*
       * THE FINAL PART IS STILL THIS CALL, unchanged in text and in arguments. The reducer
       * subtracts what the parts were already paid (`xp - xpPaid`) itself, so goal-minutes-pin's
       * `(id, xp, minutesSpent)` signature survives and the euphorium formula still sees the
       * lesson's full XP, which is what owner decision "coins stay whole-lesson" requires.
       */
      const finalPart = segments.length > 0 ? segments[segments.length - 1].kind : 'practice';
      const finalXp = useApp.getState().lessonXpRemaining(completedId, xp);
      // Snapshot BEFORE the write: afterwards the preview cannot tell a restored or freeze-paid day.
      setStreakSnap(streakSnapshot(useApp.getState().streakPreview()));
      /*
       * HELD BEFORE THE WRITE THAT DESTROYS IT. `completeLesson` drops this lesson's part record
       * in the same `set` that marks the lesson complete, so one line below this the subscribed
       * `liveSegmentRecord` is undefined and `lessonXpRemainder` answers the lesson's FULL XP.
       * The footer under this screen is still mounted, so the button the learner just pressed
       * would relabel itself from "Collect +25 XP" to "Collect +50 XP" for XP nothing pays
       * (CONSTITUTION 3.1). On the first lesson ever finished the 17c sheet opens over this
       * screen rather than leaving, so that figure sits there until the sheet is dismissed.
       */
      setPaidOutRecord(readSegmentRecord(useApp.getState().lessonSegments[completedId]));
      useApp.getState().completeLesson(completedId, xp, minutesSpent);
      if (!alreadyCompleted) queueLessonTrailCelebration(completedId);
      /*
       * The last part rides the SAME event as the others, with `lesson_done: true`, rather than a
       * second event name. Two names would put the final step in a different query and make the
       * part-to-part drop-off the one number nobody could read. Skipped on a replay, which pays
       * nothing: counting it would inflate the denominator (analytics.ts:81).
       */
      if (!alreadyCompleted) {
        track(Ev.lessonPartCompleted, {
          course: courseId,
          lesson: lessonNum,
          part: finalPart,
          part_index: Math.max(0, segments.length - 1),
          parts: segments.length,
          streak_advanced: useApp.getState().streak > streakBefore,
          xp: finalXp,
          lesson_done: true,
        });
      }
      // Guarded on the count actually moving, so re-finishing a completed lesson (which dedupes to
      // a no-op) cannot re-fire activation.
      /*
       * The ask (explained below) runs on ANY newly finished lesson, not only the first, but only
       * while iOS has never shown the prompt. Gating it on "completed count is exactly 1" left every
       * install that passed lesson one before this ask existed with no way to be asked at all.
       * `undetermined` cannot be a nag: once answered, or switched off in Settings, it never returns.
       * `!alreadyCompleted` (not `wasFirst`, which is "first lesson EVER") keeps it to real finishes.
       */
      if (!alreadyCompleted) {
        InteractionManager.runAfterInteractions(() => {
          void notificationsNeverAsked().then((never) => {
            if (!never) return;
            void applyDailyNudge(true).then((scheduled) => {
              useApp.getState().setProfile({ notifyOptIn: scheduled });
            });
          }).catch(() => undefined);
        });
      }
      if (wasFirst && useApp.getState().completedLessons.length === 1) {
        track(Ev.firstLesson, { course: courseId, lesson: lessonNum });
        /*
         * THE NOTIFICATION ASK LIVES HERE NOW, not in onboarding.
         *
         * It used to be step 11, "Want a daily nudge?" — a permission dialog dressed as a
         * question, asked of someone who had not yet seen a lesson. Removing that step left
         * notifyOptIn stuck at its EMPTY_PROFILE `false`, and notifications.ts gates BOTH the
         * streak nudge (:293) and market alerts (:389) on it, so the app sent nothing at all.
         *
         * Re-sited to the first lesson FINISHED, which is the first moment "keep your streak
         * alive" is a promise about something the user has actually done. No new one-shot flag:
         * this block is already guarded on the completed count moving to exactly 1, and iOS
         * itself never re-prompts once canAskAgain goes false, so a second call cannot nag.
         *
         * runAfterInteractions because the celebration and the trial sheet animate straight
         * after this line — a system permission alert thrown on top of a reward beat is how an
         * app turns its best moment into an interruption, and a denial here is permanent.
         *
         * Persists what iOS ACTUALLY scheduled, never what we intended — the same rule the
         * Settings toggle follows.
         */
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
   * "Keep going": straight into the next part.
   *
   * `openedAt.current` IS RESET HERE, and that is defect D1, not housekeeping. `openedAt` is set
   * once per load, so without this reset part 2 re-counts part 1's minutes and part 3 re-counts
   * both: a 9-minute lesson would credit 9 + 9 + 9, cross the daily goal early, pay the +50 bonus
   * on work that was already counted and inflate `minutesToday`. The store caps the LESSON at 30
   * through `minutesPaid`, which limits the damage and does not prevent it.
   *
   * NEVER `openLessonScreen(DONE)`: mastery-challenge-parity-regression pins the challenge's
   * `onPass` as the only route into the completion screen, and a challenge-only Practice opens the
   * challenge intro here instead, exactly as the last content screen does.
   */
  const keepGoing = () => {
    if (segmentBreak === null) return;
    const next = segments[segmentBreak.k + 1];
    setSegmentBreak(null);
    openedAt.current = Date.now();
    if (!next) return;
    if (segmentHasScreens(next)) openLessonScreen(next.first);
    else setChallengeStage('intro');
  };

  /**
   * "Done for now": `leave()`, never `exitLesson()`.
   *
   * `leave` routes to /reward when cards are waiting. A part credit queues none today, but the
   * streak coins it can pay run through the same store, and the one thing a shortcut here would
   * buy is the chance that a future reward earned by a part is dropped on the floor. The part is
   * already credited, so this costs the learner nothing.
   */
  const doneForNow = () => {
    setSegmentBreak(null);
    leave(false);
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
  function leave(finished = true) {
    const here = { course: courseId, num: String(lessonNum) };
    /*
     * UP NEXT (owner, 2026-09-30: "add a wanna-continue button like Netflix"). A FINISHED lesson
     * ends on /up-next, which names the next lesson on the path and counts down into it; the
     * reward screen, when cards are waiting, hands over to it from its last card (the params say
     * which lesson just finished). A part credit mid-lesson ("Done for now") passes finished=false
     * and leaves the way it always did: there is no "next" to queue from the middle of a lesson.
     */
    if (useApp.getState().pendingRewards.length > 0) {
      router.replace(finished ? ({ pathname: '/reward', params: here } as never) : '/reward');
    } else if (finished) {
      router.replace({ pathname: '/up-next', params: here } as never);
    } else {
      exitLesson();
    }
  }

  /**
   * THE HEADER X ASKS FIRST, and only the header X.
   *
   * Every other caller of `exitLesson` is already the answer to a question the learner was asked —
   * the heart wall, the paywall's "Maybe later", a failed challenge, the error screen's Back. A
   * confirmation there would be a second sheet on top of a decision they just made. This one guards
   * the single control that is destructive on the FIRST tap.
   *
   * Nothing to confirm on the terminal screens either: past `idx >= DONE` the lesson is finished
   * and paid out, so leaving costs nothing and the sheet would be theatre.
   */
  function requestExit() {
    // Nothing to confirm on a part card either: the part was credited when the card appeared, and
    // the card's own "Done for now" is the same exit. A sheet here would ask a learner to confirm
    // a choice the screen is already offering them.
    if (idx > 0 && idx < DONE && segmentBreak === null) {
      Keyboard.dismiss();
      setConfirmLeave(true);
      return;
    }
    exitLesson();
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
  const selfAdvancing = norm?.kind === 'deck' || norm?.kind === 'hook' || norm?.kind === 'dragSort' || norm?.kind === 'vocab' || norm?.kind === 'progressiveCalc' || norm?.kind === 'calc' || norm?.kind === 'reveal' || norm?.kind === 'line';
  const ownsItsCta = OWN_CTA_STEPS.has(norm?.kind ?? '') && (selfAdvancing || !solved);

  const gated = norm ? gates(norm) && !solved : false;
  /*
   * WHAT THE LAST SCREEN OFFERS TO PAY. `lesson.xp` would announce the Learn and Vocab XP a
   * SECOND time, on top of the chips the part cards already showed, while the ledger pays only
   * the remainder: a number on screen that nothing pays is CONSTITUTION 3.1. Computed with the
   * store's own `lessonXpRemainder` rather than a second copy of `xp - xpPaid` (6.3), from the
   * SUBSCRIBED record, so it cannot be a render snapshot that disagrees with what is about to
   * be paid. With no parts credited it is the full `xp`, so an ordinary run reads as it always did.
   */
  const xpRemaining = lessonXpRemainder(readSegmentRecord(segmentRecord), xp);
  // `xpRemaining`, not `xp`: the button must offer what the store is about to pay, which is the
  // lesson's XP less the parts already credited. See the note on `xpRemaining`.
  const ctaLabel = showRecap ? 'Got it' : isChoice && !checked ? 'Check' : idx === STREAK ? `Collect +${xpRemaining} XP` : 'Continue';
  const ctaDisabled = (isChoice && !checked && pick === null) || gated;
  /** The lesson's own pinned CTA. Extracted so the Atlas float can ask whether it is on screen. */
  const footerShown = !(challengeStage !== 'none' || idx === 0 || (isChoice && !(!checked && pick !== null)) || isFillBlank || ownsItsCta);
  /*
   * How far above the bottom the Ask-Atlas float sits. The lesson footer when it is up, the deck's
   * own footer while a deck is the step, and the last footer height for the other steps that draw
   * their own CTA in that same lane. FLOOR_LIFT is only the first frame, before anything has
   * reported a layout: a fallback of 20 would put the mascot back on the button for that frame.
   */
  const atlasLift = footerShown
    ? (footerH || FLOOR_LIFT) + ATLAS_GAP
    : norm?.kind === 'deck' || norm?.kind === 'hook'
      ? (deckFooterH || FLOOR_LIFT) + ATLAS_GAP
      : ownsItsCta
        ? (footerH || FLOOR_LIFT) + ATLAS_GAP
        : ATLAS_REST;
  const visibleStep = (authoredIdentity?.authoredIndex ?? 0) + 1;
  /** One phase, read by both bars. Two copies of this ternary is the drift 6.3 is written for. */
  const phase = challengeStage !== 'none' ? 'challenge' : idx > total ? 'complete' : 'steps';
  const progressPercent = lessonProgressPercent({
    authoredIndex: visibleStep - 1,
    authoredTotal,
    phase,
    hasChallenge,
  });
  /*
   * THE GLOBAL `N/M` LABEL DOES NOT BECOME PER-PART, and this is not a preference.
   * scripts/anim/drive.py:577-583 fails any run whose authored step number goes DOWN, which is
   * exactly what a per-part count does at every boundary, and the whole automated sweep would
   * then report every three-part lesson as a step regression.
   */
  const stepLabel = challengeStage !== 'none' ? 'Challenge' : idx > total ? 'Done' : `${String(visibleStep)}/${String(authoredTotal)}`;
  /*
   * Which part the header names. During the mastery challenge `idx` is still `total`, and for the
   * 16 lessons whose Practice is the challenge alone `segmentIndexAt` would answer the segment
   * BEFORE it (it is positional, by design), so the header would say "Vocab" over the challenge.
   */
  const currentSegment = challengeStage !== 'none' ? segments.length - 1 : segmentIndexAt(segments, idx);
  const eyebrowSegment = segments[currentSegment];
  /** Hidden on the warmup (nothing has started) and past the last screen (stepLabel says Done). */
  const eyebrow = segmented && eyebrowSegment && (challengeStage !== 'none' || (idx >= 1 && idx <= total))
    ? `${PART_NAME[eyebrowSegment.kind]} · Part ${String(currentSegment + 1)} of ${String(segments.length)}`
    : null;
  /** What "Keep going" leads to. A next part with no screens of its own is the challenge. */
  const nextSegment = segmentBreak ? segments[segmentBreak.k + 1] : undefined;
  const nextKind: SegmentNext = nextSegment
    ? (segmentHasScreens(nextSegment) ? nextSegment.kind : 'challenge')
    // Unreachable: `segmentEndingAt` answers null on the final segment, so a card always has a
    // part after it. Typed rather than asserted, because a non-null assertion here would crash
    // the runner on the day that stops being true instead of naming the next part wrong.
    : 'practice';
  /*
   * WHEN BACK IS OFFERED. One authority, read by the header chevron AND by the deck's own Back
   * (CardDeck draws it only when `index > 0 || onExit`), because the deck used to take a second
   * copy of this rule and the copy is what drifts.
   *
   * The first two clauses are the shipped rule, pinned by lesson-resume-regression: no Back on
   * the terminal screens, where it was a way to lose a lesson you had already won, and none
   * during the challenge. The last two are the part rule: no Back out of a part card, and none
   * off the first screen of a part after the first, which would step back into a part that has
   * already been paid for.
   */
  const backAllowed = idx > 0 && idx < DONE && challengeStage === 'none'
    && segmentBreak === null
    && !(segmented && currentSegment > 0 && idx === segments[currentSegment]?.first);

  return (
    <LessonDesignProvider>
    <SafeAreaView style={styles.safe}>
      <AmbientBackground starCount={40} />
      {/* The lesson's own backdrop, where it has one: behind every screen of the lesson, under the
          stars' layer order but over the canvas, and never in the way of a touch. */}
      {lessonArt?.backdrop ? <LessonBackdrop art={lessonArt.backdrop} hidden={checkBarH > 0} /> : null}

      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >

      {/*
        * ONE SURFACE FROM THE DYNAMIC ISLAND DOWN.
        *
        * This bar used to be its own box: a blur, a 70% tint and a 1pt border, starting 62pt below
        * the top of the screen. The status bar band above it is the bare starfield, so the phone
        * showed two stacked bands with a hard line under the second, and the island floated over
        * the wrong one. Nothing scrolls beneath this bar (the body is laid out BELOW it), so the
        * blur had nothing to blur and the box was pure decoration. Removed.
        *
        * THE BAR IS CENTRED UNDER THE ISLAND. The left slot (close + back) and the right slot (the
        * count) are the same fixed width, so the progress column is centred on the screen, which
        * is where the island is. The left slot keeps its width when Back is hidden, so the bar no
        * longer slides 52pt sideways on the first Continue of every lesson.
        */}
      <View style={styles.header}>
        <View style={styles.lessonNav}>
          <SpringPressable haptic={false} scaleTo={0.97} onPress={requestExit} style={styles.close} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close lesson">
            <UIcon name="close" size={22} color={theme.mutedForeground} />
          </SpringPressable>
          {/*
            * BACK STOPS AT THE LAST CONTENT SCREEN (`idx < DONE`).
            *
            * It used to be offered on the completion celebration and the streak screen too, and on
            * the 295 of 300 lessons that carry a mastery challenge that was a way to lose a lesson
            * you had already won: Back from the celebration lands on the last step, Continue from
            * the last step re-enters the challenge, and the challenge's onFail is exitLesson. So
            * pass the challenge, tap Back once, tap Continue, miss three questions, and you are
            * thrown out of a lesson that was finished, with no XP, no coins, no streak day and no
            * reward cards, because completeLesson only runs when Continue is pressed FROM the
            * streak screen.
            *
            * There is also nothing back there to reread. Both terminal screens are payout, not
            * teaching.
            */}
          {/*
            * AND BACK NEVER STEPS INTO A PART THAT HAS BEEN PAID FOR. Two additions to the pinned
            * condition above: no Back while a part card is up (the card is the decision, and the
            * screen behind it is already credited), and no Back on the FIRST screen of a part
            * after the first, which would walk into the previous part's last screen and offer a
            * Continue that raises its card again. The card itself is harmless, since the store
            * refuses a second credit for the same kind, but it would be a finished part asking to
            * be finished again.
            */}
          {backAllowed && (
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
        {/*
          * ONE TRACK PER PART on a split run, the single bar on a replay.
          *
          * <LessonSegmentBar> draws its OWN per-part track backgrounds, so it replaces the whole
          * `styles.track` wrapper and not just the fill: that View is `overflow: 'hidden'` with a
          * translucent background of its own, and the gaps between parts would be painted by it,
          * making an empty part indistinguishable from the gap beside it.
          *
          * The replay branch keeps `<LessonProgress percent={progressPercent} />` verbatim. That
          * is the bar 300 lessons shipped with, it is pinned by lesson-design-parity-regression,
          * and a segmented bar on a run with no part cards would promise breaks that never come.
          */}
        {segmented ? (
          <View style={styles.barColumn}>
            <View style={styles.barRow}>
              <LessonSegmentBar fills={segmentedProgress(segments, idx, phase)} />
            </View>
            {eyebrow ? (
              /* Names the part the learner is IN. The bar is decorative and hidden from VoiceOver,
                 and `N/M` counts screens, so without this nothing on the header says which part
                 this is. Sentence case, not shouted: the app retired 858 shouted strings.
                 UNDER the bar, centred, so the bar is the first thing below the island. */
              <ThemedText type="small" style={styles.eyebrow} numberOfLines={1}>{eyebrow}</ThemedText>
            ) : null}
          </View>
        ) : (
          <View style={styles.track}>
            <LessonProgress percent={progressPercent} />
          </View>
        )}
        <ThemedText type="smallBold" style={[styles.stepLabel, NUM_L]}>{stepLabel}</ThemedText>
      </View>

      <LessonAtlasPresenceProvider
        onPresentChange={setContentAtlas}
        onAsk={() => setAskAtlasKey((k) => k + 1)}>
      <View style={[styles.body, idx === 0 && styles.warmupBody]}>
        {idx === 0 && (
          <LessonWarmup
            courseId={courseId}
            lessonNumber={lesson.num}
            opener={lessonArt?.opener ?? null}
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
                  <Atlas size={92} expression="happy" interactive={false} idle />
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
            {norm.kind === 'hook' && <HookOpener spec={norm.spec} onComplete={advance} onFooterHeight={setDeckFooterH} />}
            {/*
              * The mobile deck. Replaces the authored teachingSlide or interactiveGraph on iOS and
              * ships its own Back and Continue, so it is in OWN_CTA_STEPS and the footer stays out
              * of its way. `onExit` is wired to the lesson's own back handler so that pressing Back
              * on the FIRST card leaves the step, while pressing it on any later card walks back
              * through the cards the learner has already read.
              */}
            {norm.kind === 'deck' && (
              <CardDeck
                deck={norm.spec}
                onComplete={() => {
                  captureSolved(true);
                  advance();
                }}
                /*
                 * The comment above has described this prop as wired since the deck shipped, and it
                 * was not being passed. CardDeck draws Back only when `index > 0 || onExit`
                 * (card-deck.tsx:118), so card ONE of every deck had no Back at all and the only way
                 * out of the first card was the header chevron. Same guard the header uses, so the
                 * deck cannot offer a Back on a screen the lesson itself refuses to leave.
                 */
                onExit={backAllowed ? previousScreen : undefined}
                onAtlasCard={setDeckAtlas}
                onFooterHeight={setDeckFooterH}
              />
            )}

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
            {/*
              THE EXPLANATION PAGE, opened by Why? on the check bar (owner decision 4, 2026-09-22).
              It used to replace the question automatically on every graded answer with words
              behind it; now the question stays on screen under the bar and this page is opt-in.
              Measured over the corpus: 7,553 authored explanation strings behind 1,307 questions,
              median 285 characters, longest 760, and 71% of them over about five lines on a 393pt
              iPhone. Rendered under the question and its four options, as they were, the Continue
              button was pushed off the bottom of the screen.
              This is a second PAGE inside the same step, not a new step, so lesson length, the
              progress bar and every saved resume position are untouched. See lesson-explanation.tsx.
            */}
            {norm.kind === 'choice' && whyOpen && (
              <LessonExplanation
                correct={!!gradedChoice?.correct}
                answer={gradedChoice?.correction?.answer}
                reason={gradedChoice?.correction?.reason}
                outcome={gradedChoice?.correctOutcome}
                shakeKey={idx}
              >
                <SlabButton label="Continue" full onPress={advance} />
              </LessonExplanation>
            )}

            {norm.kind === 'choice' && !whyOpen && (
              /* SCROLLS. An authored question can run 380pt on its own and each option another
                 ~190pt, so a four-option step is roughly twice the viewport. As a plain View
                 the overflow fell under the pinned footer and the LAST OPTIONS COULD NOT BE
                 TAPPED AT ALL — a question you cannot answer. */
              <ScrollView
                style={styles.midScroll}
                /*
                 * The bar's own height, not a constant. The check bar is absolute, so a stacked
                 * four-option question ends under it the moment the bar is taller than
                 * FOOTER_CLEARANCE, and the option cannot be scrolled clear because the scrollable
                 * area stops where the padding stops. Reserving the measured height keeps the last
                 * option reachable at every Dynamic Type size and on every verdict ('answer' is a
                 * line taller than 'retry'). Never smaller than FOOTER_CLEARANCE, which is what the
                 * unanswered question needs for the Check footer.
                 */
                contentContainerStyle={[styles.choiceContent, { paddingBottom: Math.max(FOOTER_CLEARANCE, checkBarH + CHECK_BAR_GAP) }]}
                showsVerticalScrollIndicator={false}>
                <View style={styles.quizMeta}>
                  {/* Only before the first Check: after Try again the hint's pick can be the option
                      already ruled out, spending a hint that removes nothing. */}
                  {isChoice && !checked && attempts.length === 0 && hintsLeft > 0 && !hinted ? (
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
                        // Amber, not red: a miss is a Try again now, not a verdict (check-bar-pin).
                        checked && pick !== norm.correct && { color: theme.warning, backgroundColor: theme.warning + '33' },
                      ]}>
                      {isFillBlank && pick !== null ? ` ${norm.options[pick]} ` : '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}
                    </ThemedText>
                    {norm.prompt.split('___').slice(1).join('')}
                  </ThemedText>
                ) : (
                  <ThemedText type="heading" style={styles.choicePrompt}>{norm.prompt}</ThemedText>
                )}
                <View style={[styles.options, isFillBlank ? styles.fillBlankOptions : layout !== 'stack' && styles.tileOptions]}>
                  {norm.options.map((o, i) => {
                    const isPick = pick === i;
                    const optionCorrect = isChoiceCorrect(norm, i);
                    const ruledOut = retryOut.includes(i) && !checked;
                    const eliminated = ruledOut || (hinted && !checked && i === norm.options.findIndex((_option, index) => index !== norm.correct));
                    // Nothing turns green while a Try again is still on offer, or the retry is a giveaway.
                    const settled = verdict === 'correct' || verdict === 'answer';
                    const showRight = settled && optionCorrect && (norm.sourceType !== 'scenario' || isPick || verdict === 'answer');
                    const showWrong = checked && isPick && !optionCorrect;
                    // A miss is AMBER (LessonColors.warning), never destructive: owner decision 4.
                    const border = showRight ? theme.success : showWrong ? theme.warning : isPick ? theme.primary : theme.border;
                    const background = showRight
                      ? theme.success + '1A'
                      : showWrong
                        ? theme.warning + '1A'
                        : isPick
                          ? theme.primary + '1A'
                          : theme.card;
                    return (
                      <SpringPressable
                        key={`${i}-${o}`}
                        scaleTo={0.97}
                        disabled={checked || eliminated}
                        haptic={!checked && !eliminated}
                        /* PICK, THEN CHECK, for every choice family (design M5). The 'immediate'
                           families used to grade on the tap itself; with only the first try
                           scoring, a mis-tap would have spent the learner's one scored attempt. */
                        onPress={() => setPick(i)}
                        accessibilityLabel={ruledOut ? `${o}. Ruled out.` : eliminated ? `${o}. Eliminated by hint.` : showRight ? `${o}. Correct answer.` : showWrong ? `${o}. Not this one.` : o}
                        /* BOTH keys, deliberately. SpringPressable sets accessibilityState={{disabled}}
                           at its line 46 and spreads {...rest} at 59, so a partial object here would
                           silently drop `disabled` and VoiceOver would offer a locked option as tappable. */
                        accessibilityState={{ selected: isPick, disabled: checked || eliminated }}
                        style={[isFillBlank ? styles.fillBlankOptionWrap : layout === 'grid' ? styles.gridOptionWrap : layout === 'row' && styles.rowOptionWrap, eliminated && styles.eliminated]}>
                        <View style={[styles.option, (isFillBlank || layout !== 'stack') && styles.fillBlankOption, { borderColor: border, backgroundColor: background }]}> 
                          <ThemedText type="bodyMedium" style={[styles.optionText, (isFillBlank || layout !== 'stack') && styles.fillBlankOptionText, eliminated && styles.eliminatedText]}>{o}</ThemedText>
                          {/* Every state carries an ICON, not just a border colour. Selection and
                              correctness were previously signalled by hue alone on two of the three
                              states, which is invisible to a colour-blind user and is the defect
                              3 of the 4 ScreensDesign quiz references avoid. */}
                          {showRight && <UIcon name="check" size={20} color={theme.success} strokeWidth={3} />}
                          {showWrong && <UIcon name="close" size={20} color={theme.warning} strokeWidth={3} />}
                          {isPick && !checked && !isFillBlank && <UIcon name="check" size={20} color={theme.primary} strokeWidth={3} />}
                        </View>
                      </SpringPressable>
                    );
                  })}
                </View>
                {isFillBlank && pick !== null && !checked ? (
                  <View style={styles.fillBlankSubmit}>
                    <Button label="Check" style={styles.fillBlankSubmitButton} onPress={advance} />
                  </View>
                ) : null}
                {/*
                  NO INLINE FEEDBACK HERE ANY MORE. The verdict, Why? and Continue all live on the
                  check bar that slides up over the footer (LessonCheckBar, mounted below), so the
                  question and its options stay exactly where the learner answered them. The old
                  fast path put a SparkBurst and a second Continue here, which would now be a
                  second next action on one screen.
                */}
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
            {/*
              * ONE MOMENT, not a stack (owner decision 5, 2026-09-22). This replaced
              * CelebrationWipe + Confetti + CelebrationRays + Atlas's arrive-and-hop + three
              * RewardPops + a speech bubble: Atlas now rises once out of the lesson's own path node
              * on a pixel beam, and the same XP, euphorium and streak chips land in one row.
              * The euphorium amount is completeLesson's arithmetic, min(lessonMax, lessonMin + xp),
              * passed in rather than restated. Still inside the ScrollView: at AX5 the unscrolled
              * version pushed content off both ends.
              */}
            <ScrollView contentContainerStyle={styles.introContent} showsVerticalScrollIndicator={false}>
              <LessonComplete
                courseId={courseId}
                lessonTitle={lesson.title}
                /* What THIS screen pays: the lesson's XP less what the part cards already paid.
                   `xp` here would announce the Learn and Vocab XP a second time. The euphorium
                   below still uses the full `xp`, because coins stay whole-lesson (owner). */
                xp={xpRemaining}
                coins={Math.min(EARN.lessonMax, EARN.lessonMin + xp)}
                streakDays={streakAfter}
                perfect={isPerfect(firstTryLog)}
                stats={lessonStats(firstTryLog)}
              />
              {/* The lesson's keepsake arrives after Atlas's line, the last beat of the finish. */}
              {lessonArt?.finish ? <LessonKeepsake art={lessonArt.finish} /> : null}
            </ScrollView>
          </SemanticMotion>
        )}

        {challengeStage === 'none' && idx === STREAK && (
          <Animated.View key="streak" entering={FadeIn} exiting={FadeOut.duration(Duration.exit)} style={styles.centered}>
            <StreakIgnite days={streakSnap?.days ?? streakAfter} />
            {/* One line, after the ignite resolves: never a second celebration on top of it. */}
            {streakSnap?.note ? (
              <RiseIn delay={Duration.earned}>
                <ThemedText type="bodyMedium" style={styles.streakNote}>{streakSnap.note}</ThemedText>
              </RiseIn>
            ) : null}
          </Animated.View>
        )}

      </View>
      </LessonAtlasPresenceProvider>

      {/*
        * HIDDEN in two cases, both one-mascot-per-screen (CONSTITUTION 5.6) and overlap:
        *   - the active deck card draws its own Atlas (a scene or an Atlas clip), and
        *   - the check bar is up: the float sits over the bar's Continue at bottom-right.
        *
        * AND OTHERWISE IT SITS ABOVE THE CTA LANE, never on it (see footerH above). `atlasLift` is
        * a measured height plus an 8pt gap, so the mascot clears the button at every Dynamic Type
        * size and every screen width rather than at the one the 20pt was eyeballed on. It is a cut,
        * not an animation: nothing moves under the learner's finger, so there is nothing for
        * Reduce Motion to turn off.
        */}
      {/* ...and a third: the part card draws its own Atlas, so the float would put two mascots on
          one screen (CONSTITUTION 5.6) and land one of them on "Keep going".
          ...and a fourth, the vocab conversation: AtlasConversation IS Atlas, talking, at 96pt.
          Photographed on the simulator 2026-09-22 (personal-finance:9 part 2): the chat Atlas and
          the float were on screen together, which is the same 5.6 break as the clip cards, on the
          186 lessons that have a vocab part. */}
      {/* ...and in general (owner, 2026-09-28): ANY step that draws Atlas in its content hides the
          float, and that Atlas opens this same tutor sheet. The button stays mounted while hidden
          so the sheet has somewhere to live. */}
      {atlasContext ? (
        <View
          pointerEvents="box-none"
          style={[styles.atlasFloat, { bottom: atlasLift }]}
        >
          <LessonAtlasButton
            topic={lesson.title}
            context={atlasContext}
            hidden={!(atlasContext && !deckAtlas && !contentAtlas && norm?.kind !== 'vocab' && verdict === null && segmentBreak === null)}
            openKey={askAtlasKey}
          />
        </View>
      ) : null}

      {/* Choice steps show Check once something is picked; once checked, the bar replaces it. */}
      {footerShown ? (
        <View style={styles.footer} onLayout={(e) => setFooterH(e.nativeEvent.layout.height)}>
          <SlabButton label={ctaLabel} full disabled={ctaDisabled} onPress={advance} />
        </View>
      ) : null}

      {/*
        * The bar comes DOWN when a part card goes up. A part boundary that lands on a question
        * leaves the bar mounted with a live Continue, and the card only covers it: two next
        * actions on one screen, and the hidden one walks past the part choice. `advance` refuses
        * while a card is up, so this is the visual half of the same rule.
        */}
      {challengeStage === 'none' && isChoice && !whyOpen && segmentBreak === null ? (
        <LessonCheckBar
          verdict={verdict}
          correctAnswer={norm.options.find((_o, i) => isChoiceCorrect(norm, i))}
          onContinue={advance}
          onTryAgain={tryAgain}
          onSeeAnswer={() => setRevealed(true)}
          onWhy={hasExplanationScreen(gradedChoice) ? () => setShowWhy(true) : undefined}
          onHeightChange={setCheckBarH}
          combo={verdict === 'correct' ? comboAt(firstTryLog, idx) : 0}
          /*
           * No `xp`: nothing in the ledger awards XP per question. completeLesson credits the
           * lesson's own xp once, at the end, so a "+N XP" chip here would be a number the store
           * never pays (CONSTITUTION 3.1). The first-try rule still scores what exists: mastery
           * memory and the heart, in gradeChoice.
           */
        />
      ) : null}

      <View pointerEvents={announcePractice ? 'auto' : 'none'} style={styles.practiceOverlay}>
        <StepModeTransition visible={announcePractice} onDone={() => setAnnouncePractice(false)} />
      </View>
      <MasteryChallengeIntro
        visible={challengeStage === 'intro'}
        onDone={() => setChallengeStage('round')}
      />
      {/*
        * THE PART CARD. A sibling of the practice transition and the challenge intro, never a
        * variant of the DONE screen: the lesson-complete moment has to stay the one payout beat,
        * and a part is not a finished lesson.
        *
        * It reports what the store ACTUALLY paid (`segmentBreak.xp` is the credit's result, not
        * the share that was asked for), so a part credited twice draws no XP chip instead of
        * promising XP nothing paid.
        */}
      <SegmentFinishCard
        visible={segmentBreak !== null}
        partIndex={segmentBreak?.k ?? 0}
        partCount={segments.length}
        kind={segments[segmentBreak?.k ?? 0]?.kind ?? 'learn'}
        nextKind={nextKind}
        xp={segmentBreak?.xp ?? 0}
        streakAdvanced={segmentBreak?.streakAdvanced ?? false}
        streak={segmentBreak?.streak ?? 0}
        onKeepGoing={keepGoing}
        onDoneForNow={doneForNow}
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

      <LeaveLessonSheet
        visible={confirmLeave}
        stepNumber={idx}
        stepCount={total}
        donePartNames={donePartNames}
        onStay={() => setConfirmLeave(false)}
        onLeave={() => {
          // Closed BEFORE navigating. A Modal left visible while its screen is popped keeps its own
          // native window on top of the destination, which is the "tapped leave and the app froze"
          // shape rather than a navigation bug.
          setConfirmLeave(false);
          exitLesson();
        }}
      />

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
      {/* Last child, so the right-answer confetti falls over the step and the check bar. */}
      <CorrectConfettiHost />
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

/** Gap between the bottom CTA lane and the floating Atlas above it, and the lane's height before
 *  anything has measured itself (a lesson footer is a ~50pt SlabButton inside 8/16 padding). */
const ATLAS_GAP = 8;
const FLOOR_LIFT = 74;
/** Where the float rests on a step with no CTA in that lane at all. */
const ATLAS_REST = 20;
/** Breathing room between the check bar's top edge and the last option scrolled clear of it. */
const CHECK_BAR_GAP = 16;

/** Step kinds that render their OWN validate control. The footer must not stack a second CTA on
 *  top of these — see `ownsItsCta`. */
const OWN_CTA_STEPS = new Set(['deck', 'hook', 'teaching', 'graph', 'dragSort', 'match', 'multi', 'trueFalse', 'line', 'tree', 'vocab', 'progressiveCalc', 'calc', 'reveal']);

/** Close (40) + gap (4) + back (40): the left slot, mirrored by the count on the right. */
const NAV_SLOT = 84;

/** Fixed-width digits, so a heart or hint count does not shift the header as it drops. */
const NUM_L = { fontVariant: ['tabular-nums' as const] };

const styles = StyleSheet.create({
  streakNote: { textAlign: 'center', marginTop: Spacing.three, paddingHorizontal: Spacing.four },
  atlasFloat: {
    position: 'absolute',
    right: 16,
    // `bottom` is set per render from the MEASURED CTA lane (atlasLift above). This is the resting
    // value for a step with no button in that lane; anything that does have one overrides it, which
    // is why the mascot no longer lands on the CTA.
    bottom: ATLAS_REST,
    zIndex: 30,
  },
  // Lessons are always dark (owner, 2026-10-12): the screen paints its own canvas instead of letting a
  // Light appearance's page show through the dark lesson design.
  safe: { flex: 1, backgroundColor: LessonColors.background },
  hintBtn: { minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  loadingShape: { paddingHorizontal: Spacing.three, paddingTop: Spacing.five, gap: Spacing.three },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, zIndex: 20 },
  practiceOverlay: { position: 'absolute', zIndex: 70, top: 56, left: 0, right: 0, bottom: 0 },
  /* NAV_SLOT wide on BOTH sides (see stepLabel), which is what centres the bar under the island. */
  lessonNav: { width: NAV_SLOT, flexDirection: 'row', alignItems: 'center', gap: 4 },
  close: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  track: { flex: 1, height: 8, borderRadius: 999, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.08)' },
  /* The segmented bar's slot. `flex: 1` takes the same width the single track had, so the header
     geometry pinned by lesson-design-parity-regression (56 / gap 12 / padding 16) is unchanged.
     Measured on iPhone 17 Pro: 12pt eyebrow line + 4pt gap + 8pt bar = 24pt inside the 56pt bar.

     `minHeight` + `justifyContent: 'flex-end'` KEEP THE BAR STILL. The eyebrow is hidden on the
     warmup (idx 0, nothing has started) and again past the last screen, so without a reserved
     height this column is 8pt tall there and 24pt with the eyebrow. The header centres its
     children, so the bar sat at y 24..32 on the warmup and y 32..40 one tap later: an 8pt hop of
     the progress bar on the first Continue of every split lesson, and again on the way into the
     completion screen. Computed from these style objects rather than photographed. minHeight and
     not height, so the eyebrow can still grow at large Dynamic Type instead of being clipped. */
  barColumn: { flex: 1, gap: 5, minHeight: 25, justifyContent: 'flex-start' },
  /* An explicit row of the track's own height. The bar's outer view is `flex: 1`, which in a
     content-sized column resolves against nothing; giving it a row to fill is what keeps the
     tracks 8pt rather than collapsing them to zero. */
  barRow: { flexDirection: 'row', alignSelf: 'stretch', height: 8 },
  /* COMPUTED, NOT EYEBALLED (CONSTITUTION 5.9), and composited: the header is
     rgba(7,3,15,0.7) over LessonColors.background #09090B, which resolves to rgb(7.6,4.8,13.8).
     White at 0.6 measures 7.32:1 there. `LessonColors.mutedForeground` (#6F6F7B), the grey the
     step label beside it uses, measures 4.09:1 on the same composite and is BELOW the 4.5 floor,
     so reusing it would have added a second sub-floor label rather than one. rgba and not a new
     hex, which is both the header's own idiom (track) and the design-rules ratchet. Since the
     header lost its tint (2026-09-24) it composites straight onto #09090B, where white at 0.6 is
     still well above the floor, so the step count now uses the same value instead of #6F6F7B. */
  eyebrow: { color: 'rgba(255,255,255,0.6)', fontSize: 11, lineHeight: 12, letterSpacing: 0.2, textAlign: 'center' },
  fill: { height: 8, borderRadius: 999, overflow: 'hidden' },
  stepLabel: { width: NAV_SLOT, flexShrink: 0, textAlign: 'right', color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 16 },
  /* No panel tint and no side rules: under a borderless header they drew a box whose top edge was
     the header's old bottom line, which is the seam this pass removes. */
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 32 },
  // The web mounts WarmupScreen directly in the post-header viewport. LessonWarmup already owns
  // the canonical 24px horizontal / 40px vertical insets, so the normal step surface must not add
  // another 16px gutter and 32px top inset around it.
  warmupBody: { paddingHorizontal: 0, paddingTop: 0 },
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
  /* Short answers as tiles (answer-layout.ts): four one-number options stacked as full-width bars
     spent a whole screen on four characters and pushed the question up out of view. */
  tileOptions: { flexDirection: 'row', flexWrap: 'wrap' },
  gridOptionWrap: { width: '48%', flexGrow: 0, flexShrink: 0 },
  rowOptionWrap: { flex: 1 },
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
