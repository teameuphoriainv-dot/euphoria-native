/**
 * Home — one job: get you into the next lesson.
 *
 * This screen used to lead with a $104,237.55 portfolio card that was entirely invented (no
 * portfolio state exists anywhere in the app). Removing it left the screen without an anchor, so
 * Home is now built around a single hero for the next real lesson — course art in the course
 * accent, the real title, real position in the course, real XP — with the habit signals (streak,
 * today's minutes, the week strip) compressed into a strip above it.
 *
 * Every number on this screen comes from the store or the curriculum. Nothing here is mock.
 */
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { AmbientBackground } from '@/components/ambient-background';
import { TourAnchor } from '@/components/atlas-tour';
import { ATLAS_TOUR_ANCHOR_NEXT_LESSON } from '@/lib/atlas-tour';

import { Atlas } from '@/components/atlas';
import { PlayGlyph } from '@/components/path-node';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { SlabButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { STREAK_DOT, WeekStreak } from '@/components/week-streak';
import { PIConfetti, type PIConfettiMethods } from 'react-native-fast-confetti';
import * as Haptics from 'expo-haptics';
import { BottomTabInset, Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { LessonArt } from '@/components/lesson-art';
import { hoursUntilReset, questsComplete, questsForToday } from '@/lib/quests';
import { courseAccent, courseHeroFill } from '@/lib/course-accents';
import { loadCourseLessons, type PathwayLesson } from '@/lib/curriculum';
import { getCourseById } from '@/lib/curriculum/courseIndex';
import { expandSteps } from '@/lib/lesson-steps';
import { hasMasteryChallenge } from '@/lib/mastery-challenge-model';
import { readSegmentRecord, segmentsOf, type SegmentKind } from '@/lib/lesson-segments';
import { SegmentRing } from '@/components/segment-ring';
import { TierUpSheet } from '@/components/tier-up-sheet';
import {
  PixelSpriteView, bolt, book, chartUp, controller,
  flame as flameSprite, newspaper, target, targetGoal, type PixelSprite,
} from '@/lib/pixel';

import { useShallow } from 'zustand/react/shallow';

import { recommendPathDetailed } from '@/lib/onboarding-path';
import { lessonKey, useApp } from '@/lib/store';
import { RiseIn } from '@/shared/motion/rise-in';
import { Reveal, RevealScrollView } from '@/shared/motion/scroll-reveal';
import { LeagueCard } from '@/components/league-card';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { ProfileButton } from '@/components/profile-button';

/**
 * Quest art, one sprite per QuestKind.
 *
 * Was <QuestMark>, a hand-drawn SVG set written before the pixel system was ported. Same reasoning
 * as shop-art.tsx's own header records: iOS-only art the shared catalogue does not have is a second
 * library by another name. Every one of these already existed in sprites.ts.
 *
 * `targetGoal` rather than the raw bullseye, because the daily goal is the one quest that also has
 * a pill in the header — the two should not be different pictures of the same thing.
 */
/**
 * On-screen names for the three lesson parts.
 *
 * `SegmentKind` values are lowercase identifiers the store persists, never copy. Printing a kind
 * straight into the card would put "vocab" on screen, and a later rename of the persisted key
 * would silently reword the hero.
 */
const PART_LABEL: Record<SegmentKind, string> = { learn: 'Learn', vocab: 'Vocab', practice: 'Practice' };

/**
 * The unfinished arcs of the hero's part ring.
 *
 * Brighter than `heroPill`'s 0.18 glass, because the pill is a filled shape and this is a 3pt
 * stroke: the same alpha on a hairline disappears against a saturated course block. Both arcs are
 * white over the same block, so the difference cannot invert on a dark course colour the way a
 * fixed grey token does.
 *
 * 0.25 is measured, not picked. Composited over both gradient stops of all 12 course heroes it
 * leaves a finished arc 3.14:1 against an unfinished one at worst, clearing the 3:1 that WCAG
 * 1.4.11 asks of a graphic that carries meaning, while the track itself still stands off the
 * block at 1.63:1 so the unfinished arcs do not simply vanish. The alphas either side lose one
 * of those two: 0.20 reads 3.46:1 against the filled arc but only 1.47:1 against the block, and
 * 0.35 reads 1.95:1 against the block but drops to 2.63:1 against the filled arc.
 */
const HERO_RING_TRACK = 'rgba(255,255,255,0.25)';

const QUEST_SPRITE: Record<string, PixelSprite> = {
  lesson: book,
  goal: targetGoal,
  trade: chartUp,
  guide: newspaper,
  game: controller,
};


const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/**
 * TEMPORARY — the dashboard-band bake-off. Remove once a variant is chosen.
 *
 * The band between the hero card and the pathway rail is the part in dispute: what shape should
 * the four numbers take, and should the streak card and quests header fold into it. (The rail's
 * own section label is deliberately NOT written out here: home-profile-presentation-regression
 * pins the SOURCE ORDER of Home's sections by indexOf on their labels, so naming one in a
 * comment above them all puts it first and fails the lane. Same trap as writing a hex literal
 * in a comment under design-rules-pin.) Every variant
 * below renders against the REAL hero, the REAL data and the REAL path, so the comparison is
 * of the one thing that differs rather than of five different mockups.
 *
 *   'grid'   2x2 of bordered tiles                  -- Step
 *   'strip'  one inline 4-column row, no chrome     -- Greenlight
 *   'chips'  a horizontal row of pills              -- Robinhood's movers
 *   'card'   one card, four stats inside it         -- Acorns' header block
 *   'none'   no dashboard at all; today's screen    -- Bloom / Duolingo ship no Home tab
 *
 * Every variant except 'none' also FOLDS IN the streak card and the quests header, because all
 * three currently state the same two facts. 'none' is today's screen untouched, as the control.
 */
type Band = 'grid' | 'strip' | 'chips' | 'card' | 'none' | 'today';
/*
 * 'today' -- the chosen band (owner, 2026-09-23). One quiet card: streak line, the week, the daily
 * goal as a bar, and the quests as a checklist. No sprites, one accent (primary); success green only
 * on a finished quest. Every number is live store state. 'card' (one card, four stats) is the
 * previous pick and stays available, spacing fix included.
 */
const BAND: Band = 'today';

/**
 * <StatTile> — one cell of the Home grid.
 *
 * MEASURED off Step's home screen (teen banking, 7M users -- the closest analogue to this app's
 * audience and to its problem of having several unrelated numbers to surface at once). Their
 * answer is two strict tiers and nothing between them: one primary card carrying the hero number
 * with its CTA inside it, then four equal small cards in a 2x2 grid.
 *
 * Home stacked four or five FULL-WIDTH cards of equal weight instead. Across six shipped apps
 * captured from their App Store listings -- Step, Greenlight, Robinhood, Acorns, Bloom, Duolingo
 * -- not one does that. They rank by size (Step's grid, Robinhood's three tiers), drop to an
 * inline strip (Greenlight), or have no dashboard at all (Bloom and Duolingo have no Home tab).
 * Equal weight everywhere is why nothing on this screen reads as primary.
 *
 * Tile anatomy is Step's, unchanged: icon and label on one line, the number large beneath it,
 * a caption that says what the number MEANS. The caption is not decoration -- "1,234" alone is
 * unreadable, "1,234 / balance" is a fact.
 */
type Stat = { sprite: PixelSprite; label: string; value: string; caption: string; tint: string };

/** One inline column. Greenlight shows Spending / Saving / Investing exactly like this: no card,
 *  no border, just label over number. Four of these cost about a fifth of the grid's height. */
function StatColumn({ stat }: { stat: Stat }) {
  return (
    <View style={styles.statCol}>
      <ThemedText type="small" themeColor="mutedForeground" numberOfLines={1}>{stat.label}</ThemedText>
      <ThemedText type="title" maxFontSizeMultiplier={1.6} style={[styles.tileValue, { color: stat.tint }]} numberOfLines={1}>{stat.value}</ThemedText>
    </View>
  );
}

/** One pill. Robinhood's movers grid is built from these -- icon, label, value, all on one line. */
function StatChip({ stat }: { stat: Stat }) {
  const theme = useTheme();
  return (
    <View style={[styles.chip, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}>
      <PixelSpriteView sprite={stat.sprite} size={12} />
      <ThemedText type="small" themeColor="mutedForeground">{stat.label}</ThemedText>
      <ThemedText type="smallBold" style={{ color: stat.tint }}>{stat.value}</ThemedText>
    </View>
  );
}

function StatTile({ sprite, label, value, caption, tint }: {
  sprite: PixelSprite;
  label: string;
  value: string;
  caption: string;
  tint: string;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.tile, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}>
      <View style={styles.tileHead}>
        <PixelSpriteView sprite={sprite} size={14} />
        <ThemedText type="small" themeColor="mutedForeground" numberOfLines={1}>{label}</ThemedText>
      </View>
      <ThemedText type="title" maxFontSizeMultiplier={1.6} style={[styles.tileValue, { color: tint }]} numberOfLines={1}>
        {value}
      </ThemedText>
      <ThemedText type="small" themeColor="mutedForeground" numberOfLines={1}>{caption}</ThemedText>
    </View>
  );
}

function DayCheck({ label, done, today }: { label: string; done: boolean; today: boolean }) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const pulse = useSharedValue(0.9);

  // only today-and-not-yet-done breathes: it's the one cell that wants a tap
  useEffect(() => {
    if (reduced || !today || done) {
      pulse.set(0.9);
      return;
    }
    pulse.set(withRepeat(withTiming(0.25, { duration: 1500, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, [reduced, today, done, pulse]);

  const ringStyle = useAnimatedStyle(() => ({ opacity: pulse.get() }));

  return (
    /*
     * GROUPED AND LABELLED. Done / today / upcoming was conveyed ENTIRELY by a filled circle and a
     * checkmark, so VoiceOver read seven cells as "M", "T", "W" — the week strip's whole meaning is
     * whether you kept the streak, and that was the one thing it never said. This file already gets
     * it right for the streak pill a couple of hundred lines down; DayCheck was simply missed.
     */
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${label}, ${done ? 'completed' : today ? 'today, not done yet' : 'not done'}`}
      style={styles.day}>
      {/* never spread `color: undefined` into the style — it overrides themeColor and the label
          falls back to the default dark text, i.e. invisible on this background */}
      <ThemedText
        type={today ? 'smallBold' : 'small'}
        themeColor={today ? undefined : 'mutedForeground'}
        style={[{ fontSize: FontSize.label, lineHeight: 15 }, today ? { color: theme.iconLilac } : null]}>
        {label}
      </ThemedText>
      <View style={styles.dayMark}>
        {today && !done && (
          <Animated.View
            style={[
              { position: 'absolute', width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: theme.primary },
              ringStyle,
            ]}
          />
        )}
        <Svg width={30} height={30} viewBox="0 0 30 30">
          <Circle cx={15} cy={15} r={13.5} fill={done ? theme.primary : 'none'} stroke={done ? theme.primary : theme.border} strokeWidth={2} />
          {done && <Path d="M9.5 15.5l3.5 3.5 7-7.5" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />}
        </Svg>
      </View>
    </View>
  );
}

export default function Home() {
  const name = useApp((s) => s.profile.name);
  /*
   * CLOSE OUT A FINISHED LEAGUE WEEK. Home is the right place: it is the screen every session
   * lands on, so the result is banked before the user can reach the league board and see a stale
   * one. The action is a no-op mid-week and after a week is already paid — it returns the same
   * state object, so zustand skips the notify and this costs nothing to call every mount.
   *
   * Not in league.tsx, where it would look more at home: someone who never opens that screen would
   * never be paid, and the whole point is that the ladder resolves whether or not you watch it.
   */
  const resolveLeagueWeek = useApp((s) => s.resolveLeagueWeek);
  // Raised by applyXp wherever the crossing happened — a lesson, a game, a guide — and shown here
  // rather than at the award site, so no single screen has to remember to celebrate.
  const pendingTierUp = useApp((s) => s.pendingTierUp);
  const claimTierUp = useApp((s) => s.claimTierUp);
  useEffect(() => {
    resolveLeagueWeek();
  }, [resolveLeagueWeek]);
  const theme = useTheme();
  const streak = useApp((s) => s.streak);
  const xp = useApp((s) => s.xp);
  const minutesDone = useApp((s) => s.minutesDoneToday());
  const goalMinutes = useApp((s) => s.dailyGoalMinutes());
  const completedLessons = useApp((s) => s.completedLessons);
  const activeCourseId = useApp((s) => s.activeCourseId);

  /*
   * WHY THIS COURSE IS THE ONE.
   *
   * `recommendPathDetailed` already returns the reason that earned each slot — "You said the
   * jargon is overwhelming" — and the reveal screen prints it once. Every screen after that
   * dropped it, so an app that calls itself personalised proved it had listened exactly one
   * time, on one screen, and then never referred to the answers again.
   *
   * Read here rather than stored: the function is PURE and `profile` is already persisted, so
   * this costs one memo and needs no new state, no store field and no migration. Null when the
   * active course was chosen by hand from /courses rather than recommended — in that case there
   * is no honest reason to show, and inventing one is the failure this is fixing.
   */
  const profile = useApp((s) => s.profile);
  const whyThisCourse = useMemo(
    () => recommendPathDetailed(profile).find((x) => x.course.id === activeCourseId)?.reason ?? null,
    [profile, activeCourseId],
  );

  const course = getCourseById(activeCourseId);
  const accent = courseAccent(activeCourseId);

  // The next lesson's title/xp only live inside the course module — a ~1 MB lazy import. Learn
  // loads the same module and dynamic imports are cached, so this is paid once per course per
  // session, not once per screen.
  const [next, setNext] = useState<PathwayLesson | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadCourseLessons(activeCourseId)
      .then((ls) => {
        if (cancelled) return;
        setNext(ls.find((l) => !completedLessons.includes(lessonKey(activeCourseId, l.num))) ?? null);
      })
      .catch(() => {
        if (!cancelled) setNext(null);
      });
    return () => {
      cancelled = true;
    };
  }, [activeCourseId, completedLessons]);

  const doneInCourse = useMemo(
    () => completedLessons.filter((k) => k.startsWith(`${activeCourseId}:`)).length,
    [completedLessons, activeCourseId],
  );

  /*
   * "Continue" has to be TRUE, not just encouraging.
   *
   * The hero already resolves to the first lesson in the course that is not finished, which is the
   * same rule learn.tsx's current node and start.tsx's first action use, so all three agree on
   * WHICH lesson. What the label got wrong was the verb: it said Start whenever no lesson in the
   * course was complete, including for someone who had quit lesson 1 nine screens in and whose
   * position the runner will now restore. Subscribing to the key alone, not the pointer object,
   * because the pointer is rewritten on every screen change inside a lesson and Home does not need
   * to re-render for that.
   */
  const resumeKey = useApp((s) => s.lessonResume?.key ?? null);
  /*
   * PARTS ARE THE SECOND WAY A LESSON CAN BE HALF DONE, and the pointer does not know about them.
   *
   * `lessonResume` holds ONE pointer for the whole app, so opening any other lesson overwrites it.
   * Before parts that was a cosmetic bug: the hero fell back to "Start" for someone who was nine
   * screens into lesson 1, and the runner restored them anyway. With parts it becomes a lie about
   * banked reward. Someone who finished Learn, took the XP and tapped "Done for now" has a credit
   * the store will not pay twice, and telling them to Start says that credit is not there.
   *
   * `readSegmentRecord` rather than the raw record: a persisted entry can carry an unknown kind or
   * a duplicate after a downgrade, and the validator is the single place that decides what a
   * malformed record means. The store's `segmentsDoneFor` has one extra branch, for a lesson in
   * `completedLessons`, which cannot apply here: `next` is by construction the first lesson NOT in
   * that list.
   */
  const lessonSegmentRecords = useApp((s) => s.lessonSegments);
  const segmentsDone = useMemo(
    () => (next === null ? [] : readSegmentRecord(lessonSegmentRecords[lessonKey(activeCourseId, next.num)]).done),
    [next, lessonSegmentRecords, activeCourseId],
  );
  /*
   * The part shape comes from the steps, not the store. The store records finished parts by KIND
   * and never the count (design 2b), because a curriculum sync can add or remove a lesson's
   * keyTermsCards screen and a persisted count would then describe a shape that no longer exists.
   * Same pure function, same deck-wrapped `expandSteps` list, as the runner and the Learn trail.
   */
  const segmentKinds = useMemo<SegmentKind[]>(
    () => (next === null
      ? []
      : segmentsOf(
          expandSteps(next.steps).map((step) => step.type),
          hasMasteryChallenge(next.challenge),
        ).map((segment) => segment.kind)),
    [next],
  );
  const resuming = next !== null && (resumeKey === lessonKey(activeCourseId, next.num) || segmentsDone.length > 0);
  const heroVerb = doneInCourse === 0 && !resuming ? 'Start' : 'Continue';
  /*
   * WHICH PART IS NEXT. Null until at least one is banked, so an untouched lesson keeps the plain
   * card: "Part 1 of 3" on a lesson nobody has opened is a count, not progress, and the ring beside
   * the pill already says how many parts there are.
   *
   * MATCHED BY KIND, NEVER COUNTED, because that is how `segmentEntry` (lesson-segments.ts) picks
   * the screen this card's tap actually opens: the first kind not in `done`. Counting agrees with
   * it only while the shape is stable, and the shape is the one thing the kind-keyed record was
   * chosen to survive (design 2b). A sync that drops a lesson's keyTermsCards while `done` holds
   * ['learn','vocab'] leaves a two-part lesson reading 2 of 2: a full ring and no part line on a
   * lesson the runner is about to open at practice. Intersecting with the live shape cannot exceed
   * it, which is also why no clamp is needed here any more.
   */
  const partsFilled = segmentKinds.filter((kind) => segmentsDone.includes(kind)).length;
  const nextPartIndex = segmentKinds.findIndex((kind) => !segmentsDone.includes(kind));
  const nextPart = partsFilled > 0 && nextPartIndex >= 0
    ? { index: nextPartIndex, count: segmentKinds.length, kind: segmentKinds[nextPartIndex] }
    : null;

  // The week strip needs per-day history that nothing records yet; `streak` is the only real
  // signal, so fill backwards from today and stop. Exact when streak <= 7, which is the only
  // range the strip can show anyway.
  const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0

  /*
   * Quests, derived. `now` is captured ONCE into state rather than read during render — `new Date()`
   * in a render body is impure and `react-hooks/purity` is an ERROR in this config (trap #11). The
   * whole store is passed because questsForToday reads four day-scoped fields; it is a pure function
   * of that snapshot, so a selector per field would be four subscriptions for one answer.
   */
  const [now] = useState(() => new Date());
  /*
   * THE EIGHT FIELDS questsForToday READS, NOT THE WHOLE STORE.
   *
   * This was `useApp((st) => st)`. Zustand compares the selector's RESULT with Object.is, and
   * every set() produces a new state object, so selecting the store itself meant EVERY write
   * anywhere in the app re-rendered the whole of Home — its twenty-odd pixel sprites, seventeen
   * entering animations and the course rail included. The comment defending it argued a selector
   * per field would be "four subscriptions for one answer"; that was the wrong trade, and useShallow
   * gets the one answer with none of the churn.
   */
  const questState = useApp(
    useShallow((st) => ({
      lastActiveDay: st.lastActiveDay,
      minutesToday: st.minutesToday,
      lessonsToday: st.lessonsToday,
      valueHistory: st.valueHistory,
      guidesDay: st.guidesDay,
      guidesToday: st.guidesToday,
      lastGameDay: st.lastGameDay,
      profile: st.profile,
      streak: st.streak,
      completedLessons: st.completedLessons,
    })),
  );
  const quests = useMemo(() => questsForToday(questState, now), [questState, now]);
  const hoursLeft = useMemo(() => hoursUntilReset(now), [now]);

  /*
   * PAY FOR A FINISHED DAY. §8b asks for a reward card when all of today's quests are done, and
   * `questsComplete` existed with no caller until now — a mechanic named and never wired.
   *
   * In an EFFECT, not during render: `claimQuestReward` writes to the store, and a write during
   * render is the cascading-render lint ERROR this config enforces. Keyed on the boolean so it fires
   * on the transition rather than on every render.
   *
   * The store guards the payout by day key, exactly as `awardGameXp` does, so this effect firing
   * twice — a remount, a tab switch back — cannot pay twice. The idempotence lives with the state,
   * not with the caller, which is the only place it is safe to live.
   */
  const allQuestsDone = questsComplete(quests);
  /*
   * COLLAPSED BY DEFAULT. The section exists so the streak has something to feed, not so it can
   * occupy a fifth of the first screen — the header still carries the score, so nothing you need
   * at a glance is behind the toggle.
   *
   * Deliberately NOT persisted. It resets to collapsed every launch, which is the state that
   * serves the screen's job; remembering "expanded" would quietly undo the decluttering for the
   * one user who opened it once. If that turns out to be wrong it is a store field away.
   */
  const [questsOpen, setQuestsOpen] = useState(false);
  const questsDone = quests.filter((q) => q.done).length;

  /* One model, five renderings. Each variant differs only in SHAPE, never in content, so the
     bake-off compares layouts rather than five different sets of numbers. */
  const stats: Stat[] = [
    { sprite: flameSprite, label: 'Streak', value: String(streak), caption: streak === 1 ? 'day' : 'days', tint: theme.streak },
    { sprite: bolt, label: 'XP', value: String(xp), caption: 'earned', tint: theme.iconLilac },
    { sprite: target, label: 'Quests', value: `${String(questsDone)}/${String(quests.length)}`, caption: `${String(hoursLeft)}h left`, tint: questsDone === quests.length ? theme.success : theme.text },
    { sprite: targetGoal, label: 'Today', value: `${String(minutesDone)}m`, caption: `of ${String(goalMinutes)}m goal`, tint: minutesDone >= goalMinutes ? theme.success : theme.text },
  ];
  const claimQuestReward = useApp((st) => st.claimQuestReward);
  useEffect(() => {
    if (allQuestsDone) claimQuestReward();
  }, [allQuestsDone, claimQuestReward]);


  const isDone = (i: number) => i <= todayIdx && todayIdx - i < streak;

  /*
   * STREAK CELEBRATION -- the one place confetti is used on Home. Fires when the streak goes UP
   * while Home is mounted (tabs stay mounted, so returning from a lesson counts), never on first
   * mount: a burst for a number you already had is noise. Reduced Motion gets the haptic only.
   */
  const reducedMotion = useReducedMotion();
  const confettiRef = useRef<PIConfettiMethods>(null);
  const [blastAt, setBlastAt] = useState({ x: 0, y: 0 });
  const prevStreak = useRef(streak);
  useEffect(() => {
    if (streak > prevStreak.current) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      confettiRef.current?.restart();
    }
    prevStreak.current = streak;
  }, [streak]);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground glow={false} starCount={45} />
      <RevealScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Greeting + profile. The pills that used to live here are gone — see below. */}
        <RiseIn>
          <View style={styles.headerRow}>
              {/*
                * THE GREETING IS THE WAY INTO YOUR PROFILE, now that You is not a tab.
                *
                * Tapping your own name to reach your own profile is the affordance most apps
                * already teach, and it needs no new chrome in a header that AX5 has already
                * broken once. (It used to say "the mascot beside it is the entry to chat" —
                * that mascot is gone from this screen, so the greeting is now the only way in
                * besides the avatar.)
                *
                * CEILING, stated: this puts profile on HOME only. The web app keeps it reachable
                * from every screen via the hamburger. A persistent header entry on all five tabs
                * is the fuller version and is not done here.
                */}
              <SpringPressable
                haptic={false}
                scaleTo={0.98}
                onPress={() => router.push('/you')}
                accessibilityRole="button"
                accessibilityLabel="Your profile"
                style={{ flex: 1 }}>
                {/*
                  * AX5 CLIPPED THIS HEADER TO "H..." AND "5 m...". Captured on device, not
                  * inferred. This column is flex:1 beside a 46pt Atlas and the streak pills,
                  * so at 3.12x a 22pt greeting wants ~340pt of width in a ~150pt slot and
                  * `numberOfLines={1}` resolved that by throwing away the sentence.
                  *
                  * A header should get TALLER, not shorter — that is what iOS itself does.
                  * The clamps are gone so both lines wrap, and `maxFontSizeMultiplier` bounds
                  * the growth so the greeting cannot push the whole page below the fold.
                  * These are CONTENT, so the cap is deliberately looser than the tab bar's
                  * 1.6: chrome may cap hard, content should scale as far as it can.
                  */}
                <ThemedText
                  type="title"
                  maxFontSizeMultiplier={2}
                  /*
                   * ONE LINE, AND STILL NOT THE AX5 BUG.
                   *
                   * The greeting must not stack onto two lines. The obvious fix, a bare
                   * `numberOfLines={1}`, is exactly what caused AX5: on device it clipped this
                   * header to "H..." because a 22pt greeting wanted ~340pt of width in a ~150pt
                   * slot beside the pills, and truncation threw the sentence away.
                   *
                   * `adjustsFontSizeToFit` resolves the same constraint by SHRINKING instead of
                   * truncating, and `minimumFontScale` floors that shrink so it can never become
                   * unreadable. A long name gets smaller; it never becomes an ellipsis, and the
                   * user never loses their own name. Dynamic Type still grows the text up to the
                   * multiplier, it simply cannot force a wrap any more.
                   */
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.6}
                  /*
                   * BIGGER — titleSm (22) → titleLg (26). Asked for directly, and the room for it
                   * came from this same edit: the coin pill, the streak pill and the Atlas circle
                   * all left this row, so the greeting no longer competes for width with three
                   * other things. headerRow's long-standing "three items fit; four did not" note
                   * is now moot at two.
                   *
                   * adjustsFontSizeToFit stays. It is what stopped AX5 from clipping the greeting
                   * to "H...", and a bigger base size makes that shrink-instead-of-truncate floor
                   * MORE load-bearing, not less.
                   */
                  style={{ fontSize: FontSize.titleLg }}>{name ? `Hey there, ${name}` : 'Hey there'}</ThemedText>
              </SpringPressable>
            {/*
              * THE COIN PILL, THE STREAK PILL AND THE ATLAS CIRCLE ALL LEFT THIS ROW.
              *
              *  - COINS: asked to be removed from Home outright. It is not deleted from the app —
              *    the balance belongs with the things it buys, so it goes to the Shop when that
              *    section is built. `/shop` is still routed and still reachable; only this
              *    entry point is gone.
              *  - STREAK: not removed, MOVED. It is now the card immediately below, where the
              *    number can be read at a glance instead of squeezed into a 12pt pill.
              *  - ATLAS: asked to be removed from the main page. Nobody opens a home screen to
              *    ask a question; they ask while a lesson has them stuck. Ask Atlas now lives on
              *    the lesson screen and the Learn tab only.
              *
              * What is left is the greeting and the avatar — two items in a row with a documented
              * history of breaking at four.
              */}
            <ProfileButton />
          </View>
        </RiseIn>

        {/*
          * THE STREAK CARD — the week strip, the goal bar and the header streak pill, folded into
          * one rectangle.
          *
          * Modelled on the reference screenshot supplied 2026-09-01 (Brilliant's home): a bordered
          * card whose top-left is the streak NUMBER at display size beside its flame, a single
          * plain-English line under it, and the day marks along the bottom INSIDE the same card.
          *
          * Three separate elements said one thing before this. The header pill carried the number
          * in 12pt, the week strip carried the days, and a third bar underneath carried the goal —
          * "keep the streak date consolidated with the streak bar" is exactly that redundancy.
          *
          * The number is the hero here rather than a pill's afterthought, which is the whole point
          * of the reference: a streak you can read from across the room is a streak you protect.
          */}
        {/* Folded into the band in every variant but the control. */}
        {BAND === 'none' && (<RiseIn delay={60}>
          <Card style={styles.streakCard}>
            <View style={styles.streakTop}>
              {/*
                * DAY ONE IS NOT A SCORE OF ZERO. The largest element on Home was a display-size
                * "0" beside a lit flame, over seven empty rings -- the first thing a new user
                * ever sees, and it reads as a scoreboard they are already losing. The flame made
                * it worse by burning next to it, which says the streak is alive when it has not
                * started.
                *
                * A zero streak is not a bad streak, it is an absent one, so it gets a sentence
                * instead of a numeral and the flame goes unlit. The seven rings below stay:
                * framed by this line they read as the week ahead rather than seven misses.
                */}
              {streak === 0 ? (
                <ThemedText type="title" maxFontSizeMultiplier={1.6}>Start your streak</ThemedText>
              ) : (
                <ThemedText type="display" maxFontSizeMultiplier={1.6} style={styles.streakNum}>{streak}</ThemedText>
              )}
              {/* play="once" on CHANGE, never looping — a streak advancing is a reaction, a streak
                  sitting still is not. Same rule the header pill followed before it was folded in. */}
              {/*
                * THE FLAME IS THE NUMERAL'S UNIT, so it goes when there is no numeral. At a live
                * streak "7" and a lit flame are one statement. At zero the card was saying the
                * same thing three times over -- "Start your streak", an unlit flame, and a sad
                * Atlas -- and the flame was the weakest of the three: it cannot carry emotion
                * the way the mascot does, and it cannot carry the instruction the way the
                * sentence does. Fewest shapes possible; every shape earns its place.
                */}
              {streak > 0 && (
                <PixelSpriteView sprite={flameSprite} size={26} play="once" playKey={streak} />
              )}
              {/*
                * ATLAS WEARS THE STREAK. He is the app's character and he did not appear on its
                * main screen at all -- twelve measured springs of squash-and-stretch, and the
                * screen every session opens on had no face on it.
                *
                * The streak is the right state for him to carry because it is the only number on
                * Home that is about the person rather than the content. Sad at zero, happy once
                * it is alive, proud past the 30-day tier from STREAK_TIERS.
                *
                * SIZE 72 IS NOT COSMETIC. atlas.tsx sets IDLE_MOTION_MIN_SIZE = 72 and holds
                * completely still below it, because under that size every idle movement he has
                * is sub-pixel and was costing React commits to render nothing. At 64 he would be
                * a frozen sticker, which is worse than no mascot on a screen we are trying to
                * stop feeling static. 72 is the smallest size at which he is actually alive.
                */}
              <View style={styles.streakAtlas}>
                <Atlas
                  size={72}
                  expression={streak === 0 ? 'sad' : streak >= 30 ? 'proud' : 'happy'}
                  accessibilityLabel={
                    streak === 0
                      ? 'Atlas is waiting for you to start your streak'
                      : `Atlas is pleased with your ${String(streak)} day streak`
                  }
                />
              </View>
            </View>
            {/*
              * NO SENTENCE UNDER THE NUMBER. There was one -- "Determined · 1 of 14 days" -- and
              * it was the streak explaining itself: the number, the flame and the seven day marks
              * already say everything it said. "We can't have superfluous text anywhere." The
              * committed tier still exists in state and still drives the goal logic; it just no
              * longer narrates on the home screen.
              */}
            <View style={styles.weekRow}>
              {WEEK.map((d, i) => (
                <DayCheck key={`${d}${i}`} label={d} done={isDone(i)} today={i === todayIdx} />
              ))}
            </View>
          </Card>
        </RiseIn>)}

        {/*
         * THREE BLOCKS WERE REMOVED FROM HERE, all on 2026-09-01. None is deleted from the app.
         *
         *  1. THE LEAGUE CARD. "Completely remove the leagues for now… at least don't remove the
         *     links from the code." So the card is gone from Home and nothing else is: `/league`
         *     is still a route, `lib/league.ts` and `tierProgress` are untouched, `resolveLeagueWeek`
         *     still runs on mount above (a league week must still bank whether or not it is shown,
         *     or a user returns to a stale ladder), and <TierUpSheet> still fires on a crossing.
         *     Putting the card back is re-adding this JSX, not rebuilding a feature.
         *
         *  2. THE TRIAL STRIP. Moved to the Learn tab, not deleted — "make sure that the free trial
         *     thing is on the lessons part of the app, not on the main page". It is a fact about
         *     what you can STUDY, so it belongs where the studying is.
         *
         *  3. THE STREAK-COMMITMENT ASK ("How far do you want to take this?"). Cut as clutter. The
         *     streak card above now shows the committed tier and progress toward it, so the ask was
         *     the only thing on this screen still competing with the lessons for attention. The
         *     STREAK_TIERS data and the store's `streakGoal` are untouched.
         *
         * The screen's job, restated because everything above was in the way of it: get you into
         * the next lesson.
         */}
        {/*
          * THE NEXT LESSON — now the biggest thing on the screen, and the CARD is the control.
          *
          * The Start/Continue button is gone: "The lesson cards are going to be big, with no start
          * button. You just click on them to start." A card that is entirely tappable does not need
          * a button repeating the offer, and the button was costing the card its size — the art was
          * shrunk to 56pt and moved beside the text specifically to buy back the vertical space the
          * CTA row occupied.
          *
          * With the CTA gone that space returns to the content, so the art goes back up to 72pt and
          * the title to `title` size. The whole card is one SpringPressable, so the tap target is
          * the full ~150pt rectangle rather than a 52pt button inside it.
          *
          * accessibilityRole="button" on the pressable is what keeps this reachable: without the
          * SlabButton there is no other announced control, and a tappable Card that VoiceOver reads
          * as static text would be a regression, not a simplification. The label states the action
          * out loud because the screen no longer has the word "Start" anywhere on it.
          */}
        <RiseIn delay={120}>
          {/*
            * ANCHORED FOR THE ATLAS TOUR. The tour's last beat spotlights this exact rectangle and
            * says "tap it", so the ring has to sit on the real card wherever it lands rather than
            * on a hardcoded guess. <TourAnchor> is one unstyled View that reports its own window
            * rect; it draws nothing and changes no layout. Everything inside is untouched.
            */}
          <TourAnchor id={ATLAS_TOUR_ANCHOR_NEXT_LESSON}>
          {next ? (
            <SpringPressable
              scaleTo={0.985}
              onPress={() => router.push({ pathname: '/lesson', params: { course: activeCourseId, num: String(next.num) } })}
              accessibilityRole="button"
              /* The ring and the part line are the only things on this card a screen reader
                 cannot otherwise reach, and they are the difference between opening at the
                 warmup and opening at the vocab. Announced right after the lesson number, in
                 the same order they are read on screen. */
              accessibilityLabel={`${heroVerb} ${next.title}. Lesson ${String(next.num)} of ${String(course?.totalLessons ?? 0)}.${nextPart ? ` Part ${String(nextPart.index + 1)} of ${String(nextPart.count)}, ${PART_LABEL[nextPart.kind]}.` : ''}${whyThisCourse ? ` ${whyThisCourse}.` : ''}`}>
              {/*
                * GLASS, with the course colour as the light behind it.
                *
                * Asked for directly after the solid block landed: "make it glassmorphic, for the
                * risk thing." Three layers, in order, inside one clipped rounded container:
                *
                *   1. THE LIGHT. A large circle of the course accent, offset to the top-right and
                *      bleeding off the edge. Not a full fill -- blurring a flat gradient changes
                *      nothing, and glass only reads as glass when there is a SHAPE behind it to
                *      soften. This is the "glow in the background" that was already coded, moved
                *      inside the card so it is material rather than a halo.
                *   2. THE GLASS. expo-blur's BlurView over the whole card. It is a real
                *      UIVisualEffectView, so it frosts the light blob AND the ambient stars behind
                *      the card, which is what makes the surface feel translucent.
                *   3. THE FROST AND THE EDGE. A 6% white wash so the glass has a body, and a 14%
                *      white hairline border, which is the light catching the glass rim.
                *
                * NO shadowRadius anywhere. no-glow-pin.mjs forbids the coloured halo the design
                * record rejected, and this respects it in spirit as well as letter: the colour
                * never leaves the card's bounds, so it is a surface, not a glow around one.
                *
                * The blob still uses courseHeroFill's deepened stops rather than the raw pastel,
                * and course-hero-contrast-pin.mjs still measures white against them. With the
                * blur and frost over the top the real contrast is higher than that measurement,
                * so the pin remains a valid worst-case floor for all twelve courses.
                *
                * TWO LINES OF TEXT ARE GONE. The "RISK MANAGEMENT" eyebrow said what the art and
                * the colour already say. "Lesson 1 of 25 · 30 XP" collapses to a "1 / 25" pill --
                * XP is a reward, not a reason to tap, and the lesson screen shows it anyway.
                */}
              <View style={styles.glassHero}>
                {/*
                  * A RADIAL LIGHT, not a circle. The first cut was a 340pt View circle at 85%
                  * opacity, on the theory that the BlurView would diffuse it. On device it did
                  * not: iOS's material blur softens an edge by twenty-odd points and leaves the
                  * interior flat, so the card rendered as a hard red half with one soft diagonal.
                  * A radial gradient has no edge to soften -- the falloff IS the glow -- and the
                  * blur on top only has to frost it.
                  */}
                <Svg pointerEvents="none" style={StyleSheet.absoluteFill}>
                  <Defs>
                    <RadialGradient id="heroLight" cx="88%" cy="10%" r="75%">
                      <Stop offset="0" stopColor={courseHeroFill(activeCourseId)[1]} stopOpacity="0.95" />
                      <Stop offset="0.55" stopColor={courseHeroFill(activeCourseId)[0]} stopOpacity="0.45" />
                      <Stop offset="1" stopColor={courseHeroFill(activeCourseId)[0]} stopOpacity="0" />
                    </RadialGradient>
                  </Defs>
                  <Rect width="100%" height="100%" fill="url(#heroLight)" />
                </Svg>
                <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />
                <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.glassFrost]} />
                <View style={styles.heroRow}>
                  {/* 84. At 80 the art sat marooned in a column that had grown an action row; at 96 it took
                      enough width back that the why-line wrapped to two. 84 clears the first without
                      causing the second. */}
                  <LessonArt courseId={activeCourseId} title={next.title} index={next.num - 1} size={84} />
                  <View style={{ flex: 1 }}>
                    {/*
                      * AX5 REDUCED THIS TITLE TO "Your" / "Brain", losing "vs. Your Money". The
                      * caps below are why it does not any more, and they matter MORE now: the
                      * card is the button, so an unreadable title means the user cannot tell what
                      * they are about to open.
                      */}
                    <ThemedText type="title" maxFontSizeMultiplier={2} style={styles.heroTitleOnBlock} numberOfLines={3}>{next.title}</ThemedText>
                    {/*
                      * THE PILL KEEPS ITS OWN SIZE; THE ROW AROUND IT WRAPS.
                      *
                      * The AX5 note above is about this exact strip. `heroPill` is
                      * alignSelf:'flex-start', so it has never stretched, and the ring beside it
                      * is a fixed 22pt that does not scale with Dynamic Type either. What CAN
                      * grow is "Part 2 of 3 · Vocab", so the row is flexWrap:'wrap' and the text
                      * is flexShrink:1: at 3.12x the part line drops under the pill instead of
                      * squeezing the count to "1 /" the way the title lost "vs. Your Money".
                      */}
                    <View style={styles.heroPillRow}>
                      <View style={styles.heroPill}>
                        <ThemedText type="smallBold" maxFontSizeMultiplier={1.6} style={styles.heroPillText}>
                          {next.num} / {course?.totalLessons ?? '—'}
                        </ThemedText>
                      </View>
                      {/*
                        * THE SAME RING THE TRAIL DRAWS, at pill scale. It is the one place Home
                        * says a lesson comes in parts, and it says it next to the count it
                        * qualifies rather than as a second progress bar somewhere else.
                        *
                        * Filled arcs use `primaryForeground`, the same white as the pill text.
                        * Not appended with an alpha suffix, because primaryForeground is an
                        * hsl() string in one theme and appending to hsl() renders at full
                        * opacity, silently (design rule 8).
                        *
                        * THE TRACK IS GLASS, NOT `theme.border`. The hero block is the course
                        * colour in BOTH themes, but `border` flips with the app theme, and its
                        * light value is a near-white grey: measured against the white filled
                        * arcs it is 1.27:1, which is nothing. A one-of-three ring was therefore
                        * a solid white ring for every light theme learner, saying the lesson was
                        * finished. Same white as the filled arcs at low alpha instead, so the
                        * two always differ by opacity whatever the theme and whatever course
                        * colour is behind them. rgba and not a hex literal, matching `heroPill`
                        * and `glassFrost` below, so this adds nothing to design-rules-pin's hex
                        * ratchet.
                        */}
                      {segmentKinds.length > 1 && (
                        <SegmentRing
                          size={22}
                          /* 3, not the component's 4pt default. The trail draws this ring at
                             74pt, where 4 is a confident band; at 22pt beside a pill the same
                             stroke leaves a 9pt radius and the arcs close into a disc. */
                          stroke={3}
                          segments={segmentKinds.length}
                          filled={partsFilled}
                          accent={theme.primaryForeground}
                          track={HERO_RING_TRACK}
                        />
                      )}
                      {nextPart && (
                        <ThemedText
                          type="small"
                          maxFontSizeMultiplier={1.6}
                          numberOfLines={2}
                          style={[styles.heroPartLine, { color: theme.primaryForeground }]}>
                          Part {nextPart.index + 1} of {nextPart.count} · {PART_LABEL[nextPart.kind]}
                        </ThemedText>
                      )}
                    </View>
                  </View>
                </View>
                {/*
                  * THE ACTION IS THE CARD'S BOTTOM EDGE.
                  *
                  * Three earlier attempts failed in three different ways. Beside the title it
                  * stole width and pushed a two-line heading to three. In a full-width row under
                  * the row it split the pair -- CONTINUE bottom-left, its own node bottom-right,
                  * a wide black gap between a label and its button. Paired at the foot of the
                  * text column it finally read as one thing, but it was a 52pt circle in the
                  * corner of a card the user is meant to press, and it was GREEN: Duolingo's
                  * colour borrowed wholesale into an app whose primary is purple. No hex in this
                  * sentence on purpose: design-rules-pin counts hex literals anywhere in the file,
                  * comments included, and it is right to -- a colour written in prose is a colour
                  * that can silently disagree with the token it describes.
                  *
                  * A bar spanning the full width is the largest target the card can offer and
                  * removes the question entirely. It bleeds past the card's own padding with
                  * negative margins -- glassHero sets overflow:'hidden', so it clips to the
                  * bottom corner radius and reads as the card's edge rather than a chip inside
                  * it. Brand purple, not green: the one element telling you what to press should
                  * be the app's own colour.
                  *
                  * Not pressable: the card already is.
                  */}
                <View style={[styles.heroBar, { backgroundColor: theme.primary, borderBottomColor: theme.ctaDepth }]}>
                  <ThemedText type="label" style={[styles.heroBarLabel, { color: theme.primaryForeground }]}>CONTINUE</ThemedText>
                  <PlayGlyph scale={0.62} color={theme.primaryForeground} />
                </View>
              </View>
            </SpringPressable>
          ) : (
            <Card elevated style={[styles.hero, { borderColor: accent + '30' }]} tint={accent}>
              <ThemedText type="title" style={{ textAlign: 'center' }}>
                {doneInCourse > 0 ? 'Course complete.' : 'Loading your next lesson…'}
              </ThemedText>
              {doneInCourse > 0 && (
                <View style={styles.heroCta}>
                  <SlabButton label="Pick a new course" full onPress={() => router.push('/courses')} />
                </View>
              )}
            </Card>
          )}
          </TourAnchor>
        </RiseIn>

        {/*
          * DAILY QUESTS — the 3/3 mechanic Home did not have.
          *
          * ScreensDesign, Duolingo 862 + Bloom 2004 + banked Promova 138812:
          *   3/3  a daily quest set where EVERY quest shows x/y progress
          *        Duolingo 112764 "Complete your next 2 lessons  2/2"
          *        Bloom 156310   "Complete 5 lessons ... 2/5 completed"
          *   2/2  a refresh countdown — Duolingo "12 HOURS", Bloom "17h 56m 16s"
          *   1/3  an escalating per-day reward — NOT convergent, and there is no soft currency to
          *        escalate, so it is not copied (§0.5).
          *
          * Placed BELOW the continue hero because that is where both references put the daily
          * mechanic: the primary action stays first. Derived entirely from state the store already
          * day-scopes — see lib/quests.ts for why there is no "read a guide" quest.
          */}
        <RiseIn delay={160}>
          {/*
            * COLLAPSIBLE, and COLLAPSED BY DEFAULT — "the quests are going to be collapsible so
            * they're not taking so much space up".
            *
            * Three quest rows with progress tracks ran about 200pt, which on an 874pt screen was
            * a fifth of the viewport spent on something you glance at once a day. Collapsed, the
            * section is one 44pt header that still carries the score, so nothing is hidden that
            * you needed at a glance: `2/3` and the reset countdown are the summary, and the rows
            * are the detail behind it.
            *
            * The whole header is the toggle rather than a chevron-sized target, and it announces
            * as a button with its expanded state so VoiceOver users get the same affordance.
            */}
          {BAND === 'grid' && (
            <View style={styles.statGrid}>
              <View style={styles.tileRow}>{stats.slice(0, 2).map((st) => <StatTile key={st.label} {...st} />)}</View>
              <View style={styles.tileRow}>{stats.slice(2).map((st) => <StatTile key={st.label} {...st} />)}</View>
            </View>
          )}
          {BAND === 'strip' && (
            <View style={[styles.statStrip, { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: theme.border }]}>
              {stats.map((st) => <StatColumn key={st.label} stat={st} />)}
            </View>
          )}
          {BAND === 'chips' && (
            <View style={styles.chipRow}>{stats.map((st) => <StatChip key={st.label} stat={st} />)}</View>
          )}
          {BAND === 'card' && (
            <View style={[styles.statCard, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}>
              {stats.map((st) => <StatColumn key={st.label} stat={st} />)}
            </View>
          )}

          {BAND === 'today' && (
            <Card depthColor={theme.primary + '8C'} style={[styles.todayCard, { borderColor: theme.primary + '40' }]}>
              <View style={styles.todayBody}>
              <View style={styles.todayHead}>
                <ThemedText type="title" maxFontSizeMultiplier={1.6}>
                  {streak === 0 ? 'Start your streak' : `${String(streak)} day streak`}
                </ThemedText>
              </View>
              <WeekStreak
                isDone={isDone}
                todayIdx={todayIdx}
                onRowLayout={(x, y, w) => setBlastAt({ x: x + ((todayIdx + 0.5) * w) / 7, y: y + 23 + (STREAK_DOT + 6) / 2 })}
              />
              <View
                accessible
                accessibilityRole="progressbar"
                accessibilityLabel={`${String(minutesDone)} of ${String(goalMinutes)} minutes today`}
                accessibilityValue={{ min: 0, max: goalMinutes, now: Math.min(minutesDone, goalMinutes) }}
                style={styles.todayGoal}>
                <View style={[styles.todayTrack, { backgroundColor: theme.muted }]}>
                  <View style={[styles.todayFill, { backgroundColor: theme.primary, width: `${Math.min(100, Math.round((minutesDone / Math.max(1, goalMinutes)) * 100))}%` }]} />
                </View>
              </View>
              <View style={[styles.todayQuests, { borderTopColor: theme.border }]}>
                {quests.map((q) => (
                  <View
                    key={`${q.kind}:${String(q.of)}`}
                    accessible
                    accessibilityLabel={`${q.title}, ${q.done ? 'done' : `${String(q.at)} of ${String(q.of)}`}`}
                    style={styles.todayQuest}>
                    <View style={[styles.todayTick, { backgroundColor: q.done ? theme.success : 'transparent', borderColor: q.done ? theme.success : theme.border }]}>
                      {q.done ? <UIcon name="check" size={11} color={theme.primaryForeground} /> : null}
                    </View>
                    <ThemedText type="bodyMedium" style={{ flex: 1, color: q.done ? theme.mutedForeground : theme.text }}>
                      {q.title}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: q.done ? theme.success : theme.mutedForeground }}>
                      {q.at}/{q.of}
                    </ThemedText>
                  </View>
                ))}
              </View>
              {!reducedMotion && (
                <PIConfetti ref={confettiRef} autoplay={false} fadeOutOnEnd containerStyle={StyleSheet.absoluteFill}>
                  <PIConfetti.Origin blastPosition={blastAt} count={70} colors={[theme.primary, theme.iconLilac, theme.streak, theme.success]}>
                    <PIConfetti.Flake size={7} />
                  </PIConfetti.Origin>
                </PIConfetti>
              )}
              </View>
            </Card>
          )}
          {/* Folded into the band in every variant but the control. */}
          {BAND === 'none' && (<>
          <SpringPressable
            haptic={false}
            scaleTo={0.995}
            onPress={() => setQuestsOpen((v) => !v)}
            accessibilityRole="button"
            accessibilityState={{ expanded: questsOpen }}
            accessibilityLabel={`Today's quests, ${String(questsDone)} of ${String(quests.length)} done. Resets in ${String(hoursLeft)} hours.`}>
            <View style={styles.sectionHead}>
              <ThemedText type="label" themeColor="mutedForeground">TODAY&apos;S QUESTS</ThemedText>
              <View style={styles.questSummary}>
                <ThemedText type="smallBold" style={{ color: questsDone === quests.length ? theme.success : theme.mutedForeground }}>
                  {questsDone}/{quests.length}
                </ThemedText>
                <ThemedText type="small" themeColor="mutedForeground">{hoursLeft}h</ThemedText>
                <UIcon name={questsOpen ? 'chevronUp' : 'chevronDown'} size={16} color={theme.mutedForeground} />
              </View>
            </View>
          </SpringPressable>
          {questsOpen && (
          <Card style={styles.quests}>
            {quests.map((q, i) => (
              <View key={`${q.kind}:${String(q.of)}`} style={[styles.quest, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border }]}>
                <View style={[
                  styles.questTick,
                  q.done
                    ? { backgroundColor: theme.success, borderColor: theme.success }
                    // NO RING around an undone quest. The circle was there when the mark was an
                    // empty ring and the ring WAS the affordance; once each row carried its own
                    // pixel sprite the border became a second outline around a drawing that already
                    // has one, and five of them stacked read as chrome. Done keeps the filled ring,
                    // because there the circle is the completion state rather than a frame.
                    : styles.questTickOpen,
                ]}>
                  {/* UNIT 12 deliverable 4. Undone quests carry their authored mark rather than an
                      empty ring — the row now says WHAT is being asked before you read the title.
                      Done still flips to the check on a filled ring, so the completion affordance
                      that already worked is untouched. */}
                  {q.done ? (
                    <UIcon name="check" size={13} color={theme.primaryForeground} />
                  ) : (
                    <PixelSpriteView sprite={QUEST_SPRITE[q.kind] ?? book} size={20} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText type="bodyMedium" style={{ color: q.done ? theme.mutedForeground : theme.text }}>
                    {q.title}
                  </ThemedText>
                  {/* The x/y IS the mechanism at 3/3 — a quest without a number is encouragement. */}
                  <View style={[styles.questTrack, { backgroundColor: theme.muted }]}>
                    <View style={[styles.questFill, { backgroundColor: q.done ? theme.success : accent, width: `${Math.round((q.at / q.of) * 100)}%` }]} />
                  </View>
                </View>
                <ThemedText type="smallBold" style={{ color: q.done ? theme.success : theme.mutedForeground }}>
                  {q.at}/{q.of}
                </ThemedText>
              </View>
            ))}
          </Card>
          )}
          </>)}
        </RiseIn>

        {/*
          * YOUR PATH — a STACK of full-width cards, not a horizontal rail.
          *
          * The rail was chosen for a reason that has since been overruled: six reference home
          * screens each ran a horizontal multi-item row, and Home had nothing to browse. What it
          * cost is exactly what this restructure is about. A 132pt card in a side-scroller shows
          * a course as a thumbnail, and a thumbnail is not an invitation to study — you have to
          * discover the scroll, then aim at a small target. "The lesson cards are going to be big,
          * with no start button. You just click on them to start."
          *
          * So the same courses render as full-width rows: art, name, and real progress out of the
          * course's real lesson count. Tapping one sets it active, which re-points the big card at
          * the top of this screen at that course's next lesson — the card above IS the confirmation,
          * so no navigation is needed and none happens.
          *
          * `See all` still goes to /courses, which is where the locked and coming-soon ones live.
          */}
        {/*
          * WHERE YOU STAND THIS WEEK. This slot held the course list: first every available course,
          * then a trimmed one; the owner rejected both as repeating the hero and the Learn tab. The
          * league card says something nothing else on Home does. It rises in the first time it
          * scrolls into view (owner: selective reveals).
          */}
        <Reveal style={styles.leagueSlot}>
          <LeagueCard />
        </Reveal>

        {/*
         * THE GAMES CARD WAS REMOVED — "remove the games button and CTA completely from the main
         * page". Games keeps its own bottom tab, so unlike the 2026-08-22 note this replaces, it
         * is NOT losing its only route in: `/games` is a permanent tab, one tap away, at all times.
         * That note argued the card was the only discoverable entry point; that stopped being true
         * when Games became a tab, so the card was duplicating a permanently visible destination —
         * which is the same clutter the Trade/Digest cards were deleted for.
         *
         * THE WIDGET PROMO WAS REMOVED for the same decluttering pass. `nextWidgetAsk`,
         * `/widget-tutorial` and the WIDGET_ASK_XP award are all untouched; only the automatic
         * modal on Home is gone.
         */}

      </RevealScrollView>

      {/* Crossing a tier is the rarest thing a user does — six times in a lifetime — and until now
          it happened in total silence. Mounted last so it sits above everything on Home. */}
      <TierUpSheet tier={pendingTierUp} onClaim={claimTierUp} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  leagueSlot: { marginTop: Spacing.two },
  safe: { flex: 1 },
  /* Negative margins cancel glassHero's own padding so the bar meets all three card edges.
     overflow:'hidden' on glassHero clips it to the bottom corner radius. */
  /* FACE OVER A SLAB, because that is what a CTA looks like in this app. SlabButton -- the
     primary CTA in 28 files -- is theme.primary over a darker theme.ctaDepth base, and this
     bar was a flat fill of the same hue with no base at all. Same purple, different anatomy,
     which is why it read as the wrong purple. The card clips at its bottom edge so the slab
     cannot sit BELOW the face the way SlabButton's does; a bottom border is that base, and it
     follows the corner radius. */
  /* Two per row at flex:1 rather than a wrapped percentage: a 48% basis plus a gap overflows on
     the narrowest supported width, and wrap then silently drops a tile onto its own line. */
  tileRow: { flexDirection: 'row', gap: Spacing.three },
  statCol: { flex: 1, gap: 2 },
  statStrip: { flexDirection: 'row', marginTop: Spacing.four, paddingVertical: Spacing.three },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.four },
  chip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: Radius.pill, borderWidth: 1 },
  // No marginTop: content already spaces its children by Spacing.three, and adding four on top left a
  // 40pt hole under the hero where every other section sits 16pt apart (owner: "looks a bit odd").
  statCard: { flexDirection: 'row', padding: Spacing.four, borderRadius: Radius.lg, borderWidth: 1 },
  tile: { flex: 1, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.three, gap: Spacing.one },
  tileHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  tileValue: { fontSize: FontSize.titleSm, lineHeight: 30 },
  statGrid: { gap: Spacing.three, marginTop: Spacing.four },
  heroBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, marginTop: Spacing.four, marginHorizontal: -Spacing.three, marginBottom: -Spacing.four, paddingVertical: Spacing.three, borderBottomWidth: 5 },
  heroBarLabel: { letterSpacing: 1.4 },
  /* rgba, matching heroWhy above: this sits on the course block, and the block's own colour
     should show through the label the way it does through the pill. */
  heroActionLabel: { color: 'rgba(255,255,255,0.72)', letterSpacing: 1.4 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  trialStrip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.three },
  trialDots: { flexDirection: 'row', gap: 6, marginTop: 6 },
  trialDot: { width: 26, height: 5, borderRadius: Radius.track, borderWidth: 1 },
  goalBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.two, paddingVertical: Spacing.two, paddingHorizontal: Spacing.three, borderRadius: Radius.md, borderWidth: StyleSheet.hairlineWidth },
  commit: { gap: Spacing.two },
  commitRow: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  commitChip: { alignItems: 'center', paddingVertical: Spacing.two, borderRadius: Radius.md, borderWidth: 1, gap: 1 },
  quests: { paddingVertical: 0, paddingHorizontal: Spacing.three },
  quest: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.three },
  questTick: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  /* Same 22pt footprint, so removing the ring does not shift the titles out of alignment. */
  questTickOpen: { backgroundColor: 'transparent', borderWidth: 0 },
  questTrack: { height: 5, borderRadius: Radius.track, overflow: 'hidden', marginTop: 6 },
  questFill: { height: 5, borderRadius: Radius.track },
  content: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four, gap: Spacing.three },
  /* League standing strip. Row, not a stack: the crest is the anchor and the text column has to
     take the remaining width, or a long tier name wraps under the badge. */
  leagueCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  leagueText: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  greetLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4, flex: 1 },
  /* A ROW, not a stack. Two pills stacked with a 5pt gap collided against the 46pt Atlas and
     read as one smeared blob. Every reference header lays its stats out horizontally —
     Elevate puts the streak counter in the top nav row, EWA puts level + streak + coins in a
     row. None of the six stacks them. */
  pillStack: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  rightCluster: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill, borderWidth: 1 },
  /*
   * THE STREAK CARD. `gap` is deliberately absent: the three rows inside want DIFFERENT spacing
   * (number → line is tight, line → day marks is not), so each sets its own margin. A single gap
   * here would flatten that into one rhythm and the number would stop reading as the headline.
   */
  /* marginLeft auto pins him to the right edge without making the row space-between, which
     would also push the flame away from the words it belongs to. */
  streakAtlas: { marginLeft: 'auto' },
  streakCard: { paddingVertical: Spacing.three },
  // No marginTop, same reason as statCard: content already spaces sections by Spacing.three, and
  // four on top left a 40pt hole under the hero.
  todayCard: { paddingVertical: Spacing.four },
  todayBody: { gap: Spacing.three },
  todayHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.two },
  todayGoal: { gap: 6 },
  todayTrack: { height: 6, borderRadius: Radius.track, overflow: 'hidden' },
  todayFill: { height: 6, borderRadius: Radius.track },
  todayQuests: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.two },
  todayQuest: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: 6 },
  todayTick: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  streakTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  /* lineHeight pinned to the size: `display` ships a 40pt line box, which left a visible dead
     band under the number inside a card built to be compact. */
  streakNum: { fontSize: FontSize.display, lineHeight: 32 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.three },
  questSummary: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  /* The stacked path list. A plain gap column — each row is its own Card, so the stack needs no
     dividers and no border of its own. */
  pathStack: { gap: Spacing.two },
  pathCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.three },
  day: { alignItems: 'center', gap: 6 },
  dayMark: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  /*
   * HARD-CUT depth, zero blur. This was `shadowColor: accent` with `shadowRadius: 30,
   * shadowOpacity: 0.3` — a 30px halo in the course's own hue behind the biggest card on Home.
   * That is the exact thing the design doc rejects ("they can't have the vibe-coded glow behind
   * them"), and it is the same defect that was removed from the CTA, just on a card instead.
   *
   * The card still has depth: a solid near-black shadow at radius 0 reads as an object sitting
   * above the surface, which is the SlabButton language. The accent keeps carrying identity
   * through the tint and the border, where it belongs.
   */
  hero: { paddingVertical: Spacing.three, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.55, shadowRadius: 0, shadowOffset: { width: 0, height: 5 } },
  /* 22/28, lineHeight pinned to the override. Was 26 on `display` (lineHeight 40): the hero
     card ate 55% of the viewport and pushed the new YOUR PATH rail under the tab bar. None of
     the six reference home screens uses a hero this large. */
  heroTitle: { textAlign: 'center', fontSize: FontSize.titleSm, lineHeight: 28, marginTop: Spacing.one, paddingHorizontal: Spacing.two },
  heroCta: { alignSelf: 'stretch', marginTop: Spacing.three },
  /*
   * THE SOLID BLOCK. Radius.lg to match every other card's corner. No shadow: the colour IS the
   * separation now, and the design record rejects a coloured halo behind a card of the card's own
   * hue ("the vibe-coded glow"). Generous vertical padding because a block earns its weight by
   * being a block -- a thin strip of colour reads as a banner, not a section.
   */
  /*
   * THE GLASS. overflow:hidden is load-bearing twice over: it clips the light blob to the card so
   * the colour can never become a halo outside it, and it clips the BlurView to the rounded
   * corners, which UIVisualEffectView does not do on its own. No shadow -- the rim highlight is
   * the depth cue, the way a glass edge catches light.
   */
  glassHero: { borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', paddingVertical: Spacing.four, paddingHorizontal: Spacing.three },
  glassFrost: { backgroundColor: 'rgba(255,255,255,0.06)' },
  heroTitleOnBlock: { color: '#FFFFFF', fontSize: FontSize.titleSm, lineHeight: 28 },
  /* A pill, not a sentence. Translucent white on the block so it inherits the course colour. */
  /* marginTop moved to heroPillRow when the part ring joined the pill: left here it would push
     the pill down relative to the ring beside it and the strip would read as two rows. */
  heroPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill, backgroundColor: 'rgba(255,255,255,0.18)' },
  heroPillRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.two },
  /* flexShrink so the part line gives way before the fixed pill and ring do. Same white as the
     pill text and the title, over the same glass, so course-hero-contrast-pin's worst-case
     measurement of white against courseHeroFill still covers it. */
  heroPartLine: { flexShrink: 1, fontSize: FontSize.caption },
  heroPillText: { color: '#FFFFFF', fontSize: FontSize.caption },
  /* 82% white, not grey: this sits on the course block and has to read as a sentence the app is
     saying back to you, not as disabled metadata. */
  heroWhy: { color: 'rgba(255,255,255,0.82)', fontSize: FontSize.caption, lineHeight: 17, marginTop: Spacing.two },
  /*
   * marginTop was Spacing.four (24). That was correct while every section head was followed
   * immediately by a Card — the 24 separated a heading from the block ABOVE it, and the block's
   * own height did the rest.
   *
   * Collapsing the quests broke that assumption: a collapsed section IS its head, so two heads
   * could end up adjacent and the spacing stacked into a dead band — 8 (marginBottom) + 16
   * (the ScrollView's content gap) + 24 = 48pt of empty screen between two single lines. Measured
   * on device at 11:36; it read as the page having lost its middle.
   *
   * Spacing.two (8) + the container's own 16 gives 24 above a head, which is the same visual
   * separation the 24 was providing before the container gap was counted twice.
   */
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.two, marginBottom: Spacing.two },
  railScroll: { marginHorizontal: -Spacing.three },
  rail: { paddingHorizontal: Spacing.three, gap: Spacing.two + 4 },
  duoRow: { flexDirection: 'row', gap: Spacing.three },
  duoHalf: { flex: 1 },
  duoCard: { minHeight: 104 },
});
