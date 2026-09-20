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
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { AmbientBackground } from '@/components/ambient-background';
import { TourAnchor } from '@/components/atlas-tour';
import { ATLAS_TOUR_ANCHOR_NEXT_LESSON } from '@/lib/atlas-tour';

import { PathNode } from '@/components/path-node';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { SlabButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BottomTabInset, Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { LessonArt } from '@/components/lesson-art';
import { CourseMark } from '@/components/art/course-mark';
import { hoursUntilReset, questsComplete, questsForToday } from '@/lib/quests';
import { courseAccent, courseHeroFill } from '@/lib/course-accents';
import { COURSES, isCourseAvailable, loadCourseLessons, type PathwayLesson } from '@/lib/curriculum';
import { getCourseById } from '@/lib/curriculum/courseIndex';
import { TierUpSheet } from '@/components/tier-up-sheet';
import {
  PixelSpriteView, book, chartUp, controller,
  flame as flameSprite, newspaper, targetGoal, type PixelSprite,
} from '@/lib/pixel';

import { useShallow } from 'zustand/react/shallow';

import { recommendPathDetailed } from '@/lib/onboarding-path';
import { lessonKey, useApp } from '@/lib/store';
import { RiseIn } from '@/shared/motion/rise-in';
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
  const completedLessons = useApp((s) => s.completedLessons);
  const activeCourseId = useApp((s) => s.activeCourseId);
  const setActiveCourse = useApp((s) => s.setActiveCourse);

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
  const resuming = next !== null && resumeKey === lessonKey(activeCourseId, next.num);
  const heroVerb = doneInCourse === 0 && !resuming ? 'Start' : 'Continue';

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
  const claimQuestReward = useApp((st) => st.claimQuestReward);
  useEffect(() => {
    if (allQuestsDone) claimQuestReward();
  }, [allQuestsDone, claimQuestReward]);


  const isDone = (i: number) => i <= todayIdx && todayIdx - i < streak;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground glow={false} starCount={45} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
        <RiseIn delay={60}>
          <Card style={styles.streakCard}>
            <View style={styles.streakTop}>
              <ThemedText type="display" maxFontSizeMultiplier={1.6} style={styles.streakNum}>{streak}</ThemedText>
              {/* play="once" on CHANGE, never looping — a streak advancing is a reaction, a streak
                  sitting still is not. Same rule the header pill followed before it was folded in. */}
              <PixelSpriteView sprite={flameSprite} size={26} play="once" playKey={streak} />
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
        </RiseIn>

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
              accessibilityLabel={`${heroVerb} ${next.title}. Lesson ${String(next.num)} of ${String(course?.totalLessons ?? 0)}.${whyThisCourse ? ` ${whyThisCourse}.` : ''}`}>
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
                  <LessonArt courseId={activeCourseId} title={next.title} index={next.num - 1} size={80} />
                  <View style={{ flex: 1 }}>
                    {/*
                      * AX5 REDUCED THIS TITLE TO "Your" / "Brain", losing "vs. Your Money". The
                      * caps below are why it does not any more, and they matter MORE now: the
                      * card is the button, so an unreadable title means the user cannot tell what
                      * they are about to open.
                      */}
                    <ThemedText type="title" maxFontSizeMultiplier={2} style={styles.heroTitleOnBlock} numberOfLines={3}>{next.title}</ThemedText>
                    <View style={styles.heroPill}>
                      <ThemedText type="smallBold" maxFontSizeMultiplier={1.6} style={styles.heroPillText}>
                        {next.num} / {course?.totalLessons ?? '—'}
                      </ThemedText>
                    </View>
                    {whyThisCourse ? (
                      <ThemedText type="small" maxFontSizeMultiplier={1.8} style={styles.heroWhy} numberOfLines={2}>
                        {whyThisCourse}
                      </ThemedText>
                    ) : null}
                  </View>
                </View>
                {/*
                  * THE FOCAL POINT, AND WHY IT SITS HERE. Audited against Learn, this card was
                  * the one thing on Home you were meant to tap and gave no sign of it -- a dark
                  * rectangle among dark rectangles, while Learn hands you a lit green node that
                  * plainly means "start here".
                  *
                  * The first attempt put the node INSIDE the row beside the title, and the owner
                  * was right that it did not flow. Two failures: it took width from the title,
                  * which pushed a two-line heading to three, and it put the action at the
                  * title's eye level, so the "why this course" line was stranded AFTER the thing
                  * you were meant to press. A row cannot carry art, a heading and an action at
                  * once -- they compete instead of ranking.
                  *
                  * Bottom-right instead: art and title read across, the pill and the why-line
                  * read down, and the node is the last thing the eye reaches. Reading order now
                  * ends on the action, which is what "flow" means here.
                  *
                  * Not pressable: the card already is. PathNode without onPress renders the
                  * shape only, so there is no nested touchable to double-scale the press.
                  */}
                <View style={styles.heroAction}>
                  {/*
                    * The node carries a label for the same reason every node on Learn does: a
                    * bare green circle is an affordance without a promise. It also fills the
                    * bottom-left of the card -- with art top-left, heading top-right and the
                    * node bottom-right, that corner was the only empty quadrant, and an L-shaped
                    * composition with a hole in it is the other half of what did not flow.
                    */}
                  <ThemedText type="label" style={styles.heroActionLabel}>CONTINUE</ThemedText>
                  <PathNode
                    state="current"
                    size={60}
                    accessibilityLabel={`Start ${next.title}`}
                  />
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
          )}
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
        <View style={styles.sectionHead}>
          <ThemedText type="label" themeColor="mutedForeground">YOUR PATH</ThemedText>
          {/* hitSlop 13 vertical, not 8: the label renders 18pt tall, so 8 gave a 34pt target —
              under both Apple's 44pt and WCAG 2.5.8's 24pt floor. 18 + 13*2 = 44. */}
          <SpringPressable haptic={false} onPress={() => router.push('/courses')} hitSlop={{ top: 13, bottom: 13, left: 8, right: 8 }}>
            <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>See all</ThemedText>
          </SpringPressable>
        </View>
        <View style={styles.pathStack}>
          {COURSES.filter((c) => isCourseAvailable(c.id)).map((c) => {
            const done = completedLessons.filter((id) => id.startsWith(`${c.id}:`)).length;
            const on = c.id === activeCourseId;
            const tint = courseAccent(c.id);
            return (
              <SpringPressable
                key={c.id}
                scaleTo={0.985}
                onPress={() => setActiveCourse(c.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`${c.title}. ${String(done)} of ${String(c.totalLessons)} lessons done.${on ? ' Currently selected.' : ''}`}>
                {/*
                  * EACH ROW WEARS ITS OWN COURSE COLOUR. Three identical near-black cards read as
                  * one repeated thing; a translucent wash of each course's accent, like the quiz
                  * app's lavender / blue / peach rows, makes them three separate blocks. 1F is 12%
                  * alpha -- enough to tell them apart, dark enough that white text stays legible.
                  *
                  * "0 of 25 lessons" is gone. The track underneath already draws that fraction, so
                  * the sentence was the bar reading itself out loud. A compact 0/25 at the right
                  * edge keeps the number without the words, the way the quiz app's rows do.
                  */}
                <Card style={[styles.pathCard, { backgroundColor: tint + '1F', borderColor: tint + (on ? '80' : '33'), borderWidth: 1 }]}>
                  <CourseMark id={c.id} size={34} />
                  <View style={{ flex: 1 }}>
                    <ThemedText type="bodyMedium" maxFontSizeMultiplier={2} numberOfLines={2}>{c.title}</ThemedText>
                    <View style={[styles.questTrack, { backgroundColor: tint + '33' }]}>
                      <View style={[styles.questFill, { backgroundColor: tint, width: `${Math.round((done / c.totalLessons) * 100)}%` }]} />
                    </View>
                  </View>
                  <ThemedText type="smallBold" maxFontSizeMultiplier={1.6} style={{ color: tint }}>
                    {done}/{c.totalLessons}
                  </ThemedText>
                </Card>
              </SpringPressable>
            );
          })}
        </View>

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

      </ScrollView>

      {/* Crossing a tier is the rarest thing a user does — six times in a lifetime — and until now
          it happened in total silence. Mounted last so it sits above everything on Home. */}
      <TierUpSheet tier={pendingTierUp} onClaim={claimTierUp} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  heroAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.two },
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
  streakCard: { paddingVertical: Spacing.three },
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
  heroPill: { alignSelf: 'flex-start', marginTop: Spacing.two, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill, backgroundColor: 'rgba(255,255,255,0.18)' },
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
