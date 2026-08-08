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
import { GradientButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { CourseRailCard } from '@/components/course-rail-card';
import { LessonArt } from '@/components/lesson-art';
import { hoursUntilReset, questsComplete, questsForToday } from '@/lib/quests';
import { TRIAL_DAYS, trialDayNumber, useTier } from '@/lib/entitlement';
import { courseAccent } from '@/lib/course-accents';
import { COURSES, loadCourseLessons, type PathwayLesson } from '@/lib/curriculum';
import { getCourseById } from '@/lib/curriculum/courseIndex';
import { lessonKey, STREAK_TIERS, useApp } from '@/lib/store';
import { RiseIn } from '@/shared/motion/rise-in';
import { openAtlasChat } from '@/components/ask-atlas';
import { SpringPressable } from '@/shared/motion/spring-pressable';

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
    <View style={styles.day}>
      {/* never spread `color: undefined` into the style — it overrides themeColor and the label
          falls back to the default dark text, i.e. invisible on this background */}
      <ThemedText
        type={today ? 'smallBold' : 'small'}
        themeColor={today ? undefined : 'mutedForeground'}
        style={[{ fontSize: 11, lineHeight: 15 }, today ? { color: theme.iconLilac } : null]}>
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
  const theme = useTheme();
  const streak = useApp((s) => s.streak);
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
  const questState = useApp((st) => st);
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
                <Atlas size={46} expression="happy" interactive={false} />
              </SpringPressable>
              <View style={{ flex: 1 }}>
                <ThemedText type="title" style={{ fontSize: 22 }} numberOfLines={1}>{name ? `Hey, ${name}` : 'Hey there'}</ThemedText>
                <ThemedText type="small" themeColor="mutedForeground" numberOfLines={1}>
                  {remaining === 0 ? 'Done for today — streak safe.' : `${remaining} min to keep your streak`}
                </ThemedText>
              </View>
            </View>
            <View style={styles.pillStack}>
              <View style={[styles.pill, { backgroundColor: '#F9731618', borderColor: '#F9731640' }]}>
                <UIcon name="flame" size={14} color="#F97316" />
                <ThemedText type="smallBold" style={{ color: '#F97316', fontSize: 12 }}>{streak}</ThemedText>
              </View>
              <View style={[styles.pill, { backgroundColor: theme.primary + '1F', borderColor: theme.primary + '3A' }]}>
                <UIcon name="target" size={14} color={theme.iconLilac} />
                <ThemedText type="smallBold" style={{ color: theme.iconLilac, fontSize: 12 }}>{minutesDone}/{goalMinutes}</ThemedText>
              </View>
            </View>
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
              <UIcon name="sparkle" size={13} color={theme.iconGold} />
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
                      <ThemedText type="small" themeColor="mutedForeground" style={{ fontSize: 11 }}>{t.name}</ThemedText>
                    </View>
                  </SpringPressable>
                ))}
              </View>
            </Card>
          </RiseIn>
        )}

        {/* The hero — the next real lesson */}
        <RiseIn delay={120}>
          <Card elevated style={[styles.hero, { shadowColor: accent, borderColor: accent + '30' }]} tint={accent}>
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
                    <ThemedText type="label" style={{ color: accent }} numberOfLines={1}>
                      {(course?.title ?? 'Course').toUpperCase()}
                    </ThemedText>
                    <ThemedText type="heading" style={{ marginTop: 2 }} numberOfLines={2}>{next.title}</ThemedText>
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
                  <GradientButton
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
                    <GradientButton label="Pick a new course" full onPress={() => router.push('/courses')} />
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
                  {q.done && <UIcon name="check" size={13} color={theme.primaryForeground} />}
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
          <SpringPressable haptic={false} onPress={() => router.push('/courses')} hitSlop={8}>
            <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>See all</ThemedText>
          </SpringPressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
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

        {/* Secondary surfaces */}
        <View style={styles.duoRow}>
          <RiseIn delay={180} style={styles.duoHalf}>
            <SpringPressable onPress={() => router.push('/trade')}>
              <Card style={styles.duoCard} tint={theme.success}>
                <UIcon name="trade" size={20} color={theme.success} />
                <ThemedText type="heading" style={{ fontSize: 16, marginTop: Spacing.two }}>Trade</ThemedText>
                <ThemedText type="small" themeColor="mutedForeground">Paper trading</ThemedText>
              </Card>
            </SpringPressable>
          </RiseIn>
          <RiseIn delay={230} style={styles.duoHalf}>
            <SpringPressable onPress={() => router.push('/digest')}>
              <Card style={styles.duoCard} tint={theme.primary}>
                <UIcon name="bookOpen" size={20} color={theme.iconLilac} />
                <ThemedText type="heading" style={{ fontSize: 16, marginTop: Spacing.two }}>Digest</ThemedText>
                <ThemedText type="small" themeColor="mutedForeground">Today&apos;s read</ThemedText>
              </Card>
            </SpringPressable>
          </RiseIn>
        </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  trialStrip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.three },
  trialDots: { flexDirection: 'row', gap: 6, marginTop: 6 },
  trialDot: { width: 26, height: 5, borderRadius: 3, borderWidth: 1 },
  goalBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.two, paddingVertical: Spacing.two, paddingHorizontal: Spacing.three, borderRadius: Radius.md, borderWidth: StyleSheet.hairlineWidth },
  commit: { gap: Spacing.two },
  commitRow: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  commitChip: { alignItems: 'center', paddingVertical: Spacing.two, borderRadius: Radius.md, borderWidth: 1, gap: 1 },
  quests: { paddingVertical: 0, paddingHorizontal: Spacing.three },
  quest: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.three },
  questTick: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  questTrack: { height: 5, borderRadius: 3, overflow: 'hidden', marginTop: 6 },
  questFill: { height: 5, borderRadius: 3 },
  content: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four, gap: Spacing.three },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  greetLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4, flex: 1 },
  /* A ROW, not a stack. Two pills stacked with a 5pt gap collided against the 46pt Atlas and
     read as one smeared blob. Every reference header lays its stats out horizontally —
     Elevate puts the streak counter in the top nav row, EWA puts level + streak + coins in a
     row. None of the six stacks them. */
  pillStack: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill, borderWidth: 1 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.one },
  day: { alignItems: 'center', gap: 6 },
  dayMark: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  hero: { paddingVertical: Spacing.three, borderWidth: 1, shadowOpacity: 0.3, shadowRadius: 30, shadowOffset: { width: 0, height: 12 } },
  /* 22/28, lineHeight pinned to the override. Was 26 on `display` (lineHeight 40): the hero
     card ate 55% of the viewport and pushed the new YOUR PATH rail under the tab bar. None of
     the six reference home screens uses a hero this large. */
  heroTitle: { textAlign: 'center', fontSize: 22, lineHeight: 28, marginTop: Spacing.one, paddingHorizontal: Spacing.two },
  heroCta: { alignSelf: 'stretch', marginTop: Spacing.three },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.four, marginBottom: Spacing.two },
  railScroll: { marginHorizontal: -Spacing.three },
  rail: { paddingHorizontal: Spacing.three, gap: Spacing.two + 4 },
  duoRow: { flexDirection: 'row', gap: Spacing.three },
  duoHalf: { flex: 1 },
  duoCard: { minHeight: 104 },
});
