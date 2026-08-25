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
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { AmbientBackground } from '@/components/ambient-background';
import { Atlas } from '@/components/atlas';

import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { WidgetPromo } from '@/components/widget-promo';
import { nextWidgetAsk, WIDGET_ASK_XP } from '@/lib/widget-ask';
import { SlabButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BottomTabInset, Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { CourseRailCard, RAIL_CARD_WIDTH } from '@/components/course-rail-card';
import { LessonArt } from '@/components/lesson-art';
import { hoursUntilReset, questsComplete, questsForToday } from '@/lib/quests';
import { TRIAL_DAYS, trialDayNumber, useTier } from '@/lib/entitlement';
import { courseAccent } from '@/lib/course-accents';
import { COURSES, loadCourseLessons, type PathwayLesson } from '@/lib/curriculum';
import { getCourseById } from '@/lib/curriculum/courseIndex';
import { LeagueCrest } from '@/components/league-crest';
import { TierUpSheet } from '@/components/tier-up-sheet';
import {
  PixelSpriteView, book, chartUp, coin as coinSprite, controller, star,
  flame as flameSprite, newspaper, targetGoal, type PixelSprite,
} from '@/lib/pixel';

import { tierProgress } from '@/lib/league';
import { useShallow } from 'zustand/react/shallow';

import { lessonKey, STREAK_TIERS, useApp } from '@/lib/store';
import { RiseIn } from '@/shared/motion/rise-in';
import { openAtlasChat } from '@/components/ask-atlas';
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
const QUEST_SPRITE: Record<string, PixelSprite> = {
  lesson: book,
  goal: targetGoal,
  trade: chartUp,
  guide: newspaper,
  game: controller,
};


const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

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
  const coins = useApp((st) => st.coins);
  // Lifetime xp, matching the League screen's header (weekly xp drives standings, not tier).
  const xp = useApp((s) => s.xp);
  const league = tierProgress(xp);
  const completedLessons = useApp((s) => s.completedLessons);
  const activeCourseId = useApp((s) => s.activeCourseId);
  const setActiveCourse = useApp((s) => s.setActiveCourse);
  const minutesDone = useApp((s) => s.minutesDoneToday());
  const goalMinutes = useApp((s) => s.dailyGoalMinutes());

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
  const remaining = Math.max(0, goalMinutes - minutesDone);

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
  const claimQuestReward = useApp((st) => st.claimQuestReward);
  useEffect(() => {
    if (allQuestsDone) claimQuestReward();
  }, [allQuestsDone, claimQuestReward]);

  const streakGoal = useApp((st) => st.streakGoal);
  const setStreakGoal = useApp((st) => st.setStreakGoal);
  const planTier = useTier();
  const trialDay = useApp(trialDayNumber);

  // UNIT 15d. Held back until one lesson is done — see the note beside <WidgetPromo> below.
  const widgetAsksSeen = useApp((st) => st.widgetAsksSeen);
  const widgetAskDay = useApp((st) => st.widgetAskDay);
  const widgetAdded = useApp((st) => st.widgetAdded);
  const recordWidgetAsk = useApp((st) => st.recordWidgetAsk);
  const widgetAsk =
    completedLessons.length > 0
      ? nextWidgetAsk({ widgetAsksSeen, widgetAskDay, widgetAdded })
      : null;
  /* The committed tier's NAME, which is the whole point of naming them (§22 C25). */
  const goalTier = STREAK_TIERS.find((t) => t.days === streakGoal);
  const isDone = (i: number) => i <= todayIdx && todayIdx - i < streak;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground glow={false} starCount={45} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Greeting + habit pills */}
        <RiseIn>
          <View style={styles.headerRow}>
            <View style={styles.greetLeft}>
              {/* The mascot IS the entry to chat. It was already sitting here inert, and a mascot
                  is the first thing anyone taps — see ask-atlas.tsx for why there is no FAB. */}
              <SpringPressable
                haptic={false}
                onPress={() => openAtlasChat()}
                accessibilityRole="button"
                accessibilityLabel="Ask Atlas"
              >
                <Atlas size={46} expression="happy" interactive={false} idle />
              </SpringPressable>
              {/*
                * THE GREETING IS THE WAY INTO YOUR PROFILE, now that You is not a tab.
                *
                * The mascot beside it is already the documented entry to chat and is not being
                * repurposed. Tapping your own name to reach your own profile is the affordance
                * most apps already teach, and it needs no new chrome in a header that AX5 has
                * already broken once.
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
                <ThemedText type="title" maxFontSizeMultiplier={2} style={{ fontSize: FontSize.titleSm }}>{name ? `Hey there, ${name}` : 'Hey there'}</ThemedText>
                {/*
                  * THE NUDGE IS NOT A CAPTION. This was `type="small"` in mutedForeground: 13px at
                  * the lowest contrast on the screen, sitting directly under a 22px title, so the
                  * one line asking you to do something read as the least important thing on Home.
                  * It now carries weight and the streak colour, the same colour the flame pill
                  * beside it already uses, so no new colour is introduced and the contrast is
                  * already proven on this background. Green when the day is done, because "Streak
                  * safe" is a success state and orange would keep asking for something.
                  */}
                <ThemedText
                  type="smallBold"
                  maxFontSizeMultiplier={2}
                  style={{ color: remaining === 0 ? theme.success : theme.streak }}>
                  {remaining === 0 ? 'Done for today. Streak safe.' : `${remaining} min to keep your streak`}
                </ThemedText>
              </SpringPressable>
            </View>
            {/*
              * `accessible` GROUPS each pill so VoiceOver reads one named thing. Without it these
              * announced as a bare "3" and "0/10" — text is present, so C101's audit correctly did
              * not flag them (it looks for elements with NO text at all), but a naked number carries
              * no meaning when you cannot see the flame or the target beside it.
              */}
            <View style={styles.pillStack}>
              {/*
                * THE WALLET, and the way into the Shop. The web puts the balance top-right of its
                * Shop tab; iOS has no spare tab slot (Games took the last one), so the balance
                * lives beside the streak and goal pills it belongs with and is the entry point.
                * Tappable, unlike its neighbours — hence SpringPressable rather than a bare View.
                */}
              <SpringPressable
                haptic={false}
                scaleTo={0.94}
                onPress={() => router.push('/shop')}
                accessibilityRole="button"
                accessibilityLabel={`${String(coins)} Euphorium. Open the shop.`}
                style={[styles.pill, { backgroundColor: theme.iconGold + '18', borderColor: theme.iconGold + '40' }]}>
                {/* The catalogue's coin, not a vector sparkle. The balance is currency, so it should
                    carry the same mark the Shop prices it in. Still, not animated: a balance sitting
                    there is not a reaction. */}
                <PixelSpriteView sprite={coinSprite} size={15} />
                <ThemedText type="smallBold" style={{ color: theme.iconGold, fontSize: FontSize.caption }}>{coins}</ThemedText>
              </SpringPressable>
              <View
                accessible
                accessibilityLabel={`${String(streak)} day streak`}
                accessibilityRole="text"
                style={[styles.pill, { backgroundColor: theme.streak + '18', borderColor: theme.streak + '40' }]}>
                {/*
                  * The catalogue's flame, playing ONCE when the streak CHANGES — which is exactly
                  * how the web's StreakDisplay does it (play="once", playKey={currentStreak}).
                  * A streak advancing is a reaction; a streak sitting still is not, so it does not
                  * loop. See PixelSprite.tsx on why idle loops are a defect class here.
                  */}
                <PixelSpriteView sprite={flameSprite} size={15} play="once" playKey={streak} />
                <ThemedText type="smallBold" style={{ color: theme.streak, fontSize: FontSize.caption }}>{streak}</ThemedText>
              </View>
              {/*
                * THE GOAL PILL WAS REMOVED HERE, and it is a deletion rather than a sacrifice.
                *
                * It was a plain non-tappable <View> reading "0/5", and TODAY'S QUESTS sits a few
                * hundred points below on the same screen showing "Reach your 5-minute goal … 0/5"
                * — the same two numbers, with a progress bar and a label explaining them. One
                * screen said the same thing twice and only one of the two was legible on its own.
                *
                * Removing it is what makes room for <ProfileButton>. Measured on device: with four
                * items in this row at DEFAULT text size the greeting collapsed to "Hey / there" over
                * two lines and "5 min to / keep your / streak" over three. That is the AX5 failure
                * this header already has a history of, arriving without needing accessibility sizes
                * at all. Three items fit; four did not.
                */}
            </View>
            {/* Third group in this row, and it is a tight row with an AX5 history — verified on
                device at the largest text size rather than assumed. See profile-button.tsx. */}
            <ProfileButton />
          </View>
        </RiseIn>

        {/* Week row */}
        <RiseIn delay={60}>
          <View style={styles.weekRow}>
            {WEEK.map((d, i) => (
              <DayCheck key={`${d}${i}`} label={d} done={isDone(i)} today={i === todayIdx} />
            ))}
          </View>
          {/*
            * PROGRESS TOWARD THE COMMITTED TARGET, not just the raw streak — §8b's actual ask. A
            * commitment you cannot see progress against is a question you answered once and never
            * heard about again, which is the opposite of why Duolingo and Headway ask it.
            *
            * The NAME leads and the number follows: "Determined · 3 of 14 days" reads as an identity
            * you are earning. "3/14" is a fraction.
            */}
          {goalTier && (
            <View style={[styles.goalBar, { borderColor: theme.border }]}>
              <PixelSpriteView sprite={star} size={14} />
              <ThemedText type="small" style={{ flex: 1, color: theme.textSecondary }}>
                <ThemedText type="smallBold">{goalTier.name}</ThemedText>
                {` · ${String(Math.min(streak, goalTier.days))} of ${String(goalTier.days)} days`}
              </ThemedText>
              {streak >= goalTier.days && (
                <ThemedText type="label" style={{ color: theme.success }}>DONE</ThemedText>
              )}
            </View>
          )}
        </RiseIn>

        {/*
         * LEAGUE MOVED UP, and the Trade/Digest quick cards deleted. Both from 2026-08-22:
         *
         *   N8 "'Saver League' (rank) is at the bottom of the page — should be moved up near the
         *      top; it's a key status indicator."
         *   N9 "'Your Path' section feels crowded/redundant — Lessons, Trade, and Digest already
         *      have their own full tabs, so duplicating them here feels cluttered."
         *
         * The league card was placed at the bottom on 2026-08-19 to give a measured 118pt dead
         * band a job. That reasoning was sound about the SPACE and wrong about the CARD: tier is
         * status, and status belongs beside the streak and the week strip, not below every piece
         * of content on the screen. Removing the Trade/Digest row takes ~120pt out of the bottom
         * half, which is roughly what the league card occupied there — so the band it was filling
         * largely goes away with it rather than reopening.
         *
         * The deleted row was two cards reading "Trade / Paper trading" and "Digest / Today's
         * read". Both are bottom tabs, permanently on screen, one tap away. A card whose only job
         * is to duplicate a tab is the clutter he is describing.
         */}
        {/*
         * LEAGUE STANDING — fills the dead band at the bottom of Home.
         *
         * Measured 2026-08-19 on device: the Trade/Digest row ended at y=676 and the tab bar
         * began at y=794, leaving 118pt — 13.5% of an 874pt viewport — empty at the scroll end.
         * That gap was NOT a layout bug: `styles.content` sets
         * `paddingBottom: BottomTabInset + Spacing.four` = 108, which is correct trailing padding
         * for a ScrollView. It only read as dead because the content happened to stop there. So
         * this is a product decision to give the space a job, not a fix.
         *
         * Tier and crest come from `lib/league.ts`, the same source the League screen reads, for
         * the reason stated at league.tsx:10 — two surfaces showing DIFFERENT tiers for the same
         * player is worse than one surface showing none.
         *
         * It deliberately does NOT show a rank. Rank is derived from weekly XP against the
         * standings field on the League screen; recomputing it here would be a second
         * implementation of the same rule, and those drift. Progress toward the next tier is
         * derived from `tierProgress` and cannot disagree with anything.
         */}
        <RiseIn delay={280}>
          <SpringPressable onPress={() => router.push('/league')} accessibilityRole="button"
            accessibilityLabel={`${league.tier.name} league. ${league.next ? `${league.xpToNext} XP to ${league.next.name}` : 'Top tier reached'}. Opens standings.`}>
            <Card style={styles.leagueCard} tint={league.tier.color}>
              <LeagueCrest tier={league.tier} size={44} />
              <View style={styles.leagueText}>
                <ThemedText type="label" themeColor="mutedForeground">{league.tier.name.toUpperCase()} LEAGUE</ThemedText>
                <View style={[styles.questTrack, { backgroundColor: theme.border, marginTop: Spacing.one + 2 }]}>
                  <View style={[styles.questFill, { width: `${Math.round(league.progress * 100)}%`, backgroundColor: league.tier.color }]} />
                </View>
                <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: Spacing.one }}>
                  {league.next ? `${league.xpToNext} XP to ${league.next.name}` : 'Top tier reached'}
                </ThemedText>
              </View>
              <UIcon name="arrowRight" size={16} color={theme.iconLilac} />
            </Card>
          </SpringPressable>
        </RiseIn>

        {/*
          * TRIAL STRIP — Bloom `156322`'s shape: a THREE-DAY tracker where the current day is
          * highlighted and the rest read as pending. Bloom's "Daily Trivia Streak" renders a
          * three-day arc as a progress OBJECT rather than a sentence, which is exactly what a
          * 3-day trial is.
          *
          * `trialDayNumber` not `trialDaysLeft`: on the third active day daysLeft is 0 while the
          * trial is still live, and "0 days left" on a fully usable day reads as already expired
          * (§22 C14). Shown only during the trial — a Pro member must never see a countdown, and an
          * expired one gets the paywall's own copy instead of a strip about days they no longer have.
          */}
        {planTier === 'trial' && (
          <RiseIn delay={90}>
            <SpringPressable haptic={false} scaleTo={0.99} onPress={() => router.push('/onboarding?step=paywall')}
              accessibilityRole="button" accessibilityLabel={`Free trial, day ${String(trialDay)} of ${String(TRIAL_DAYS)}. See Euphoria Pro.`}>
              <Card style={styles.trialStrip} tint={theme.primary}>
                <View style={{ flex: 1 }}>
                  <ThemedText type="smallBold">Free trial · day {trialDay} of {TRIAL_DAYS}</ThemedText>
                  <View style={styles.trialDots}>
                    {Array.from({ length: TRIAL_DAYS }, (_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.trialDot,
                          {
                            backgroundColor: i < trialDay ? theme.primary : 'transparent',
                            borderColor: i < trialDay ? theme.primary : theme.border,
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>
                <UIcon name="arrowRight" size={16} color={theme.iconLilac} />
              </Card>
            </SpringPressable>
          </RiseIn>
        )}

        {/*
          * THE STREAK COMMITMENT ASK — 2/2 convergence, and it appears exactly ONCE.
          *
          * Duolingo's streak-commitment step is flagged uniqueness 7 in the dataset: the app asks
          * you to PROACTIVELY commit to a multi-day goal rather than just counting upward. Headway
          * `128564` does the same with NAMED tiers — 7-day Promising, 14 Determined, 30 Impressive,
          * 50 Unstoppable — plus a mascot line. A number is a target; a name is an identity.
          *
          * Gated on `streak >= 1` so it never greets a user who has done nothing: asking someone to
          * commit to fourteen days before their first lesson is asking for a promise about a product
          * they have not used. `streakGoal === null` is what makes it one-time, which is why null and
          * 0 are meaningfully different in the store.
          */}
        {streakGoal === null && streak >= 1 && (
          <RiseIn delay={100}>
            <Card style={styles.commit}>
              <ThemedText type="bodyMedium">How far do you want to take this?</ThemedText>
              <ThemedText type="small" themeColor="mutedForeground">
                Pick a streak to aim for. We&apos;ll track it on this screen.
              </ThemedText>
              <View style={styles.commitRow}>
                {STREAK_TIERS.map((t) => (
                  <SpringPressable
                    key={t.days}
                    scaleTo={0.94}
                    onPress={() => setStreakGoal(t.days)}
                    accessibilityRole="button"
                    accessibilityLabel={`Commit to a ${String(t.days)} day streak, ${t.name}`}
                    style={{ flex: 1 }}>
                    <View style={[styles.commitChip, { borderColor: theme.border, backgroundColor: theme.cardElevated }]}>
                      <ThemedText type="smallBold">{t.days}</ThemedText>
                      <ThemedText type="small" themeColor="mutedForeground" style={{ fontSize: FontSize.label }}>{t.name}</ThemedText>
                    </View>
                  </SpringPressable>
                ))}
              </View>
            </Card>
          </RiseIn>
        )}

        {/* The hero — the next real lesson */}
        <RiseIn delay={120}>
          <Card elevated style={[styles.hero, { borderColor: accent + '30' }]} tint={accent}>
            {next ? (
              <>
                {/*
                  * DENSIFIED, and for the same reason Learn's rail was: measured, this card ran from
                  * y=480 to y=1200 of an 874pt screen — about 36% of the viewport for ONE lesson,
                  * with 96pt of it pure art. "YOUR PATH" was cut off and the Trade/Digest quick
                  * actions sat entirely below the fold, present in the a11y tree at y=828 and
                  * invisible to anyone who did not scroll.
                  *
                  * The art moves BESIDE the text instead of above it. Same information, and the
                  * course accent still carries identity through the eyebrow, tint and border.
                  * 6/6 of the reference home screens run two or more labelled sections and NONE
                  * lets a single hero dominate — that count was already in this file's own comment
                  * and the card had drifted back to dominating anyway.
                  */}
                <View style={styles.heroRow}>
                  <LessonArt courseId={activeCourseId} title={next.title} index={next.num - 1} size={56} />
                  <View style={{ flex: 1 }}>
                    {/*
                      * AX5 REDUCED THIS TITLE TO "Your" / "Brain", losing "vs. Your Money".
                      * Worse than the header greeting, because this card's button says Start:
                      * an unreadable title means the user cannot tell what they are starting.
                      *
                      * The art is a fixed 56pt beside a flex:1 column, so at 3.12x a 19pt
                      * heading becomes ~59pt in roughly 200pt of width and two lines buys two
                      * words. Capping at 2x and allowing a third line fits the whole title.
                      * The course label is capped for the same reason — it read "BEHAVIORA...".
                      */}
                    <ThemedText type="label" maxFontSizeMultiplier={2} style={{ color: accent }} numberOfLines={1}>
                      {(course?.title ?? 'Course').toUpperCase()}
                    </ThemedText>
                    <ThemedText type="heading" maxFontSizeMultiplier={2} style={{ marginTop: 2 }} numberOfLines={3}>{next.title}</ThemedText>
                    <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 2 }}>
                      Lesson {next.num} of {course?.totalLessons ?? '—'} · {next.xp} XP
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.heroCta}>
                  {/* No `colors` override — the brand gradient, like every other CTA in the app.
                      Across ten pulled references (Elevate blue, Nibble purple, RiseGuide black,
                      EWA purple, Promova black, Deepstash dark, Facetune cyan, Praktika blue,
                      BetterMe red, BitePal black) NOT ONE derives its primary button colour from
                      the content it sits on. The course accent still carries identity here — the
                      eyebrow, the card tint and its border — but the control is chrome. */}
                  <SlabButton
                    label={doneInCourse === 0 ? 'Start' : 'Continue'}
                    full
                    onPress={() => router.push({ pathname: '/lesson', params: { course: activeCourseId, num: String(next.num) } })}
                  />
                </View>
              </>
            ) : (
              <>
                <ThemedText type="title" style={{ textAlign: 'center' }}>
                  {doneInCourse > 0 ? 'Course complete.' : 'Loading your next lesson…'}
                </ThemedText>
                {doneInCourse > 0 && (
                  <View style={styles.heroCta}>
                    <SlabButton label="Pick a new course" full onPress={() => router.push('/courses')} />
                  </View>
                )}
              </>
            )}
          </Card>
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
          <View style={styles.sectionHead}>
            <ThemedText type="label" themeColor="mutedForeground">TODAY&apos;S QUESTS</ThemedText>
            <ThemedText type="small" themeColor="mutedForeground">Resets in {hoursLeft}h</ThemedText>
          </View>
          <Card style={styles.quests}>
            {quests.map((q, i) => (
              <View key={q.kind} style={[styles.quest, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border }]}>
                <View style={[styles.questTick, { backgroundColor: q.done ? theme.success : 'transparent', borderColor: q.done ? theme.success : theme.border }]}>
                  {/* UNIT 12 deliverable 4. Undone quests carry their authored mark rather than an
                      empty ring — the row now says WHAT is being asked before you read the title.
                      Done still flips to the check on a filled ring, so the completion affordance
                      that already worked is untouched. */}
                  {q.done ? (
                    <UIcon name="check" size={13} color={theme.primaryForeground} />
                  ) : (
                    <PixelSpriteView sprite={QUEST_SPRITE[q.kind] ?? book} size={16} />
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
        </RiseIn>

        {/*
          * A labelled section plus a horizontal rail, because Home had neither.
          *
          * ScreensDesign, six home/dashboard screens across six apps at $250k-$750k/mo
          * (Elevate 111712, Nibble 132959, Deepstash 247089, Promova 138796,
          * RiseGuide 270262, EWA 283665):
          *   6/6  two or more LABELLED content sections
          *   6/6  a horizontal multi-item row
          *   0/6  a single hero card dominating the screen
          *
          * Onboarding promises a 75-lesson path across three courses and then Home showed
          * exactly one lesson with no way to see the rest without leaving the tab. That is
          * the blandness: nothing to browse. CourseRailCard already ships in learn.tsx, so
          * this is the existing component in a second place, not a new one.
          */}
        <View style={styles.sectionHead}>
          <ThemedText type="label" themeColor="mutedForeground">YOUR PATH</ThemedText>
          {/* hitSlop 13 vertical, not 8: the label renders 18pt tall, so 8 gave a 34pt target —
              under both Apple's 44pt and WCAG 2.5.8's 24pt floor. 18 + 13*2 = 44. */}
          <SpringPressable haptic={false} onPress={() => router.push('/courses')} hitSlop={{ top: 13, bottom: 13, left: 8, right: 8 }}>
            <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>See all</ThemedText>
          </SpringPressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
          /*
           * SNAP TO THE CARD GRID. This rail free-scrolled, so a flick came to rest wherever
           * momentum died and left course cards halfway off the edge — the same defect fixed on
           * the market-news rail, and here it is on the screen the app opens to.
           *
           * The interval is IMPORTED rather than written out: RAIL_CARD_WIDTH is the card's own
           * width, so the snap cannot drift away from it if the card is ever resized. The gap
           * term matches `styles.rail` below.
           */
          snapToInterval={RAIL_CARD_WIDTH + Spacing.two + 4}
          snapToAlignment="start"
          decelerationRate="fast"
          style={styles.railScroll}>
          {COURSES.map((c) => (
            <CourseRailCard
              key={c.id}
              course={c}
              selected={c.id === activeCourseId}
              done={completedLessons.filter((id) => id.startsWith(`${c.id}:`)).length}
              onPress={() => setActiveCourse(c.id)}
            />
          ))}
        </ScrollView>

        {/*
         * GAMES, ON THE SCREEN THE APP OPENS TO.
         *
         * Reported 2026-08-22 (N12): "Games are buried — currently only discoverable by clicking
         * into Profile. Should be a bigger, more visible part of the app."
         *
         * True: the only route in was a single row inside the You tab, below Friends.
         *
         * This is NOT the clutter that N9 asked to remove. Those were two cards reading
         * "Trade / Paper trading" and "Digest / Today's read" — both permanent bottom tabs, so the
         * cards were a second way to reach a place already on screen. Games has NO tab. For it,
         * a card on Home is not a duplicate route, it is the only discoverable one. It also lands
         * in roughly the space the deleted row freed, so the bottom half is still lighter than it
         * was.
         *
         * The web app answers the same complaint by promoting Games to a top-level tab. The owner
         * chose to fix these individually rather than restructure navigation, so this is the
         * discoverability without the tab-bar surgery.
         */}
        <RiseIn delay={180}>
          <SpringPressable onPress={() => router.push('/games')} accessibilityRole="button" accessibilityLabel="Games">
            <Card style={styles.gamesCard} tint={theme.iconGold}>
              {/* Was a TARGET — the daily-goal mark — on the Games card, so two unrelated things wore the
                  same symbol. A controller says what this is without reading the label. */}
              <PixelSpriteView sprite={controller} size={22} />
              <View style={{ flex: 1 }}>
                <ThemedText type="heading" style={{ fontSize: FontSize.body }}>Games</ThemedText>
                <ThemedText type="small" themeColor="mutedForeground">Beat your best score</ThemedText>
              </View>
              <UIcon name="arrowRight" size={16} color={theme.iconGold} />
            </Card>
          </SpringPressable>
        </RiseIn>


      </ScrollView>

      {/*
       * UNIT 15d. Home rather than onboarding for the FIRST ask, deliberately: Duolingo pitches its
       * widget in onboarding (`112661`), but Duolingo's onboarding has already shown you a streak.
       * Ours has not, so an ask there would be selling a thing the user has no feeling about yet.
       * The gate below waits for one finished lesson, which is the first moment a streak is real.
       */}
      {widgetAsk !== null && (
        <WidgetPromo
          visible
          variant={widgetAsk}
          onDismiss={recordWidgetAsk}
          onAdd={() => {
            recordWidgetAsk();
            router.push(
              widgetAsk === 'transactional'
                ? `/widget-tutorial?xp=${String(WIDGET_ASK_XP)}`
                : '/widget-tutorial',
            );
          }}
        />
      )}

      {/* Crossing a tier is the rarest thing a user does — six times in a lifetime — and until now
          it happened in total silence. Mounted last so it sits above everything on Home. */}
      <TierUpSheet tier={pendingTierUp} onClaim={claimTierUp} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
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
  questTrack: { height: 5, borderRadius: Radius.track, overflow: 'hidden', marginTop: 6 },
  questFill: { height: 5, borderRadius: Radius.track },
  content: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four, gap: Spacing.three },
  /* League standing strip. Row, not a stack: the crest is the anchor and the text column has to
     take the remaining width, or a long tier name wraps under the badge. */
  gamesCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginTop: Spacing.three },
  leagueCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  leagueText: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  greetLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4, flex: 1 },
  /* A ROW, not a stack. Two pills stacked with a 5pt gap collided against the 46pt Atlas and
     read as one smeared blob. Every reference header lays its stats out horizontally —
     Elevate puts the streak counter in the top nav row, EWA puts level + streak + coins in a
     row. None of the six stacks them. */
  pillStack: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill, borderWidth: 1 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.two, paddingHorizontal: Spacing.one },
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
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.four, marginBottom: Spacing.two },
  railScroll: { marginHorizontal: -Spacing.three },
  rail: { paddingHorizontal: Spacing.three, gap: Spacing.two + 4 },
  duoRow: { flexDirection: 'row', gap: Spacing.three },
  duoHalf: { flex: 1 },
  duoCard: { minHeight: 104 },
});
