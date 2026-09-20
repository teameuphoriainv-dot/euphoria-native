/**
 * HOME VARIANTS — six whole-screen designs, one per app captured from its App Store listing.
 *
 * TEMPORARY. Delete once one is chosen. Flip `V` and Fast Refresh swaps the screen.
 *
 * These are NOT restyles of one layout. Each takes the actual structural mechanism that app
 * uses and applies it to Euphoria's real data, because the earlier bake-off proved the thing
 * that matters is SHAPE, not colour: five versions of the same stack read as the same screen.
 *
 *   1 STEP        primary card + 2x2 grid. Two strict tiers, nothing between.
 *   2 GREENLIGHT  a row of circular quick-actions + one inline stat strip.
 *   3 ROBINHOOD   segmented tabs, dense rows, everything small and ranked by size.
 *   4 ACORNS      a saturated header block owning the top third, then a plain list.
 *   5 BLOOM       full-bleed brand colour, the reward as hero, a sheet lifted over it.
 *   6 BRILLIANT   one centred subject, the art IS the screen, an outlined card, lots of air.
 *
 * Self-contained on purpose: each reads the store directly rather than taking props from
 * home.tsx, so nothing here can break the shipping screen and the whole file deletes cleanly.
 */
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Atlas } from '@/components/atlas';
import { CourseMark } from '@/components/art/course-mark';
import { LessonArt } from '@/components/lesson-art';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { SlabButton } from '@/components/ui/button';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { courseAccent } from '@/lib/course-accents';
import { COURSES, isCourseAvailable, loadCourseLessons, type PathwayLesson } from '@/lib/curriculum';
import { getCourseById } from '@/lib/curriculum/courseIndex';
import { PixelSpriteView, bolt, coin, controller, flame, target, chartUp } from '@/lib/pixel';
import { hoursUntilReset, questsForToday } from '@/lib/quests';
import { lessonKey, useApp } from '@/lib/store';
import { SpringPressable } from '@/shared/motion/spring-pressable';

/** 1 Step · 2 Greenlight · 3 Robinhood · 4 Acorns · 5 Bloom · 6 Brilliant */
const V: 1 | 2 | 3 | 4 | 5 | 6 = 6;

function useHome() {
  const streak = useApp((s) => s.streak);
  const xp = useApp((s) => s.xp);
  const completed = useApp((s) => s.completedLessons);
  const courseId = useApp((s) => s.activeCourseId);
  const minutes = useApp((s) => s.minutesDoneToday());
  const goal = useApp((s) => s.dailyGoalMinutes());
  const questState = useApp((s) => s);
  const quests = useMemo(() => questsForToday(questState, new Date()), [questState]);
  const questsDone = quests.filter((q) => q.done).length;

  const [upcoming, setUpcoming] = useState<PathwayLesson[]>([]);
  useEffect(() => {
    let dead = false;
    loadCourseLessons(courseId)
      .then((ls) => { if (!dead) setUpcoming(ls.filter((l) => !completed.includes(lessonKey(courseId, l.num))).slice(0, 3)); })
      .catch(() => { if (!dead) setUpcoming([]); });
    return () => { dead = true; };
  }, [courseId, completed]);

  const done = completed.filter((k) => k.startsWith(`${courseId}:`)).length;
  const courses = COURSES.filter((c) => isCourseAvailable(c.id));
  return {
    streak, xp, minutes, goal, quests, questsDone, upcoming, done, courses, courseId,
    next: upcoming[0] ?? null,
    course: getCourseById(courseId),
    accent: courseAccent(courseId),
    hoursLeft: hoursUntilReset(new Date()),
  };
}

type H = ReturnType<typeof useHome>;

const openLesson = (courseId: string, num: number) =>
  router.push({ pathname: '/lesson', params: { course: courseId, num: String(num) } });

/* ─────────────────────────── 1 · STEP ─────────────────────────── */
/* One primary card carrying the hero and its CTA, then four equal tiles. Two tiers, no middle. */
function Step({ h }: { h: H }) {
  const t = useTheme();
  const tiles = [
    { s: flame, k: 'Streak', v: String(h.streak), c: h.streak === 1 ? 'day' : 'days', tint: t.streak },
    { s: bolt, k: 'XP', v: String(h.xp), c: 'earned', tint: t.iconLilac },
    { s: target, k: 'Quests', v: `${String(h.questsDone)}/${String(h.quests.length)}`, c: `${String(h.hoursLeft)}h left`, tint: t.text },
    { s: chartUp, k: 'Today', v: `${String(h.minutes)}m`, c: `of ${String(h.goal)}m`, tint: t.text },
  ];
  return (
    <>
      <SpringPressable onPress={() => h.next && openLesson(h.courseId, h.next.num)} accessibilityLabel={`Continue ${h.next?.title ?? ''}`}>
        <View style={[s.stepHero, { backgroundColor: t.cardElevated, borderColor: t.border }]}>
          <View style={s.row}>
            <LessonArt courseId={h.courseId} title={h.next?.title ?? ''} index={(h.next?.num ?? 1) - 1} size={56} />
            <View style={{ flex: 1 }}>
              <ThemedText type="small" themeColor="mutedForeground">{h.course?.title}</ThemedText>
              <ThemedText type="title" numberOfLines={2}>{h.next?.title ?? 'Course complete'}</ThemedText>
            </View>
          </View>
          <View style={[s.stepCta, { backgroundColor: t.primary, borderBottomColor: t.ctaDepth }]}>
            <ThemedText type="bodyMedium" style={{ color: t.primaryForeground }}>Continue</ThemedText>
          </View>
        </View>
      </SpringPressable>
      <View style={s.grid}>
        {tiles.map((x) => (
          <View key={x.k} style={[s.tile, { backgroundColor: t.cardElevated, borderColor: t.border }]}>
            <View style={s.tileHead}><PixelSpriteView sprite={x.s} size={13} /><ThemedText type="small" themeColor="mutedForeground">{x.k}</ThemedText></View>
            <ThemedText type="title" style={{ color: x.tint }}>{x.v}</ThemedText>
            <ThemedText type="small" themeColor="mutedForeground">{x.c}</ThemedText>
          </View>
        ))}
      </View>
    </>
  );
}

/* ─────────────────────── 2 · GREENLIGHT ─────────────────────── */
/* Four circular quick-actions, then one inline stat strip. No big card at all: the actions ARE
   the top of the screen, and status is a single line under them. */
function Greenlight({ h }: { h: H }) {
  const t = useTheme();
  const actions = [
    { s: flame, k: 'Continue', go: () => h.next && openLesson(h.courseId, h.next.num), fill: true },
    { s: target, k: 'Quests', go: () => router.push('/(tabs)/home') },
    { s: chartUp, k: 'Trade', go: () => router.push('/(tabs)/trade') },
    { s: controller, k: 'Games', go: () => router.push('/(tabs)/games') },
  ];
  const stats = [
    { k: 'Streak', v: String(h.streak), tint: t.streak },
    { k: 'XP', v: String(h.xp), tint: t.iconLilac },
    { k: 'Quests', v: `${String(h.questsDone)}/${String(h.quests.length)}`, tint: t.text },
  ];
  return (
    <>
      <View style={s.actionRow}>
        {actions.map((a) => (
          <SpringPressable key={a.k} onPress={a.go} accessibilityLabel={a.k} style={s.action}>
            <View style={[s.actionDisc, { backgroundColor: a.fill ? t.primary : 'transparent', borderColor: a.fill ? t.primary : t.border }]}>
              <PixelSpriteView sprite={a.s} size={22} />
            </View>
            <ThemedText type="small" themeColor="mutedForeground" style={s.center} numberOfLines={2}>{a.k}</ThemedText>
          </SpringPressable>
        ))}
      </View>
      <View style={[s.glStrip, { backgroundColor: t.cardElevated, borderColor: t.border }]}>
        <ThemedText type="bodyMedium" numberOfLines={1}>{h.next?.title ?? 'Course complete'}</ThemedText>
        <View style={s.row}>
          {stats.map((x) => (
            <View key={x.k} style={{ flex: 1 }}>
              <ThemedText type="title" style={{ color: x.tint }}>{x.v}</ThemedText>
              <ThemedText type="small" themeColor="mutedForeground">{x.k}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </>
  );
}

/* ──────────────────────── 3 · ROBINHOOD ──────────────────────── */
/* Segmented tabs, then everything small and ranked purely by size. No hero, no illustration:
   a data surface you scan rather than a screen you are led through. */
function Robinhood({ h }: { h: H }) {
  const t = useTheme();
  const pills = [
    { k: 'Streak', v: String(h.streak), tint: t.streak },
    { k: 'XP', v: String(h.xp), tint: t.iconLilac },
    { k: 'Quests', v: `${String(h.questsDone)}/${String(h.quests.length)}`, tint: t.text },
    { k: 'Today', v: `${String(h.minutes)}m`, tint: t.text },
  ];
  return (
    <>
      <View style={s.segs}>
        {['Now', 'Learn', 'Trade', 'Games'].map((k, i) => (
          <View key={k} style={[s.seg, i === 0 && { backgroundColor: t.cardElevated }]}>
            <ThemedText type="smallBold" themeColor={i === 0 ? undefined : 'mutedForeground'}>{k}</ThemedText>
          </View>
        ))}
      </View>
      <ThemedText type="label" themeColor="mutedForeground" style={s.secLabel}>UP NEXT</ThemedText>
      {h.upcoming.map((l, i) => (
        <SpringPressable key={l.num} onPress={() => openLesson(h.courseId, l.num)} accessibilityLabel={l.title}>
          <View style={[s.rhRow, { borderBottomColor: t.border }]}>
            <ThemedText type="small" themeColor="mutedForeground" style={{ width: 28 }}>{l.num}</ThemedText>
            <ThemedText type="body" style={{ flex: 1 }} numberOfLines={1}>{l.title}</ThemedText>
            {i === 0 && <ThemedText type="smallBold" style={{ color: t.primary }}>RESUME</ThemedText>}
          </View>
        </SpringPressable>
      ))}
      <ThemedText type="label" themeColor="mutedForeground" style={s.secLabel}>TODAY</ThemedText>
      <View style={s.pillGrid}>
        {pills.map((p) => (
          <View key={p.k} style={[s.rhPill, { backgroundColor: t.cardElevated }]}>
            <ThemedText type="small" themeColor="mutedForeground">{p.k}</ThemedText>
            <ThemedText type="smallBold" style={{ color: p.tint }}>{p.v}</ThemedText>
          </View>
        ))}
      </View>
    </>
  );
}

/* ───────────────────────── 4 · ACORNS ───────────────────────── */
/* A saturated block owns the top third, carrying one number and its chart, with the actions on
   its edge. Everything below is a plain list with no card chrome competing. */
function Acorns({ h }: { h: H }) {
  const t = useTheme();
  const pct = h.goal > 0 ? Math.min(1, h.minutes / h.goal) : 0;
  return (
    <>
      <View style={[s.acBlock, { backgroundColor: t.primary }]}>
        <ThemedText type="small" style={{ color: t.primaryForeground, opacity: 0.85 }}>Today</ThemedText>
        <ThemedText type="display" style={{ color: t.primaryForeground, fontSize: 44, lineHeight: 50 }}>{h.minutes}m</ThemedText>
        <ThemedText type="small" style={{ color: t.primaryForeground, opacity: 0.85 }}>of a {h.goal} minute goal</ThemedText>
        <View style={s.acTrack}><View style={[s.acFill, { width: `${Math.round(pct * 100)}%`, backgroundColor: t.primaryForeground }]} /></View>
        <View style={s.acActions}>
          {[{ s: flame, k: 'Streak', v: String(h.streak) }, { s: bolt, k: 'XP', v: String(h.xp) }, { s: target, k: 'Quests', v: `${String(h.questsDone)}/${String(h.quests.length)}` }].map((a) => (
            <View key={a.k} style={s.acAction}>
              <View style={s.acDisc}><PixelSpriteView sprite={a.s} size={18} /></View>
              <ThemedText type="smallBold" style={{ color: t.primaryForeground }}>{a.v}</ThemedText>
              <ThemedText type="small" style={{ color: t.primaryForeground, opacity: 0.8 }}>{a.k}</ThemedText>
            </View>
          ))}
        </View>
      </View>
      {h.upcoming.map((l) => (
        <SpringPressable key={l.num} onPress={() => openLesson(h.courseId, l.num)} accessibilityLabel={l.title}>
          <View style={[s.acRow, { borderBottomColor: t.border }]}>
            <ThemedText type="body" style={{ flex: 1 }} numberOfLines={1}>{l.title}</ThemedText>
            <UIcon name="chevronRight" size={16} color={t.mutedForeground} />
          </View>
        </SpringPressable>
      ))}
    </>
  );
}

/* ────────────────────────── 5 · BLOOM ────────────────────────── */
/* Full-bleed brand colour, the REWARD as the hero rather than the content, and a sheet lifted
   over the colour holding the actual work. Commits to purple instead of hiding in near-black. */
function Bloom({ h }: { h: H }) {
  const t = useTheme();
  return (
    <View style={[s.bloomWrap, { backgroundColor: t.primary }]}>
      <View style={s.bloomTop}>
        <Atlas size={76} expression={h.done > 0 ? 'happy' : 'watching'} accessibilityLabel="Atlas" />
        <ThemedText type="display" style={{ color: t.primaryForeground, fontSize: 52, lineHeight: 58 }}>+{h.goal * 10}</ThemedText>
        <ThemedText type="body" style={{ color: t.primaryForeground, textAlign: 'center' }}>
          XP waiting in today&apos;s lesson
        </ThemedText>
      </View>
      <View style={[s.bloomSheet, { backgroundColor: t.background }]}>
        <ThemedText type="label" themeColor="mutedForeground">{h.course?.title}</ThemedText>
        {h.upcoming.slice(0, 2).map((l, i) => (
          <View key={l.num} style={s.bloomRow}>
            <ThemedText type={i === 0 ? 'bodyMedium' : 'body'} themeColor={i === 0 ? undefined : 'mutedForeground'} style={{ flex: 1 }} numberOfLines={1}>{l.title}</ThemedText>
            <View style={[s.dot, { borderColor: t.border }]} />
          </View>
        ))}
        {h.next && <SlabButton label={h.done > 0 ? 'Continue' : 'Start'} full onPress={() => openLesson(h.courseId, h.next.num)} />}
      </View>
    </View>
  );
}

/* ──────────────────────── 6 · BRILLIANT ──────────────────────── */
/* One subject, centred, with the art large and floating in air. The streak drops to a corner
   chip, the course rail is not on this screen at all, and the container is an outline. */
function Brilliant({ h }: { h: H }) {
  const t = useTheme();
  return (
    <>
      <View style={s.brChips}>
        <View style={[s.brChip, { borderColor: t.border }]}>
          <PixelSpriteView sprite={flame} size={13} />
          <ThemedText type="smallBold">{h.streak}</ThemedText>
        </View>
        <View style={[s.brChip, { borderColor: t.border }]}>
          <PixelSpriteView sprite={coin} size={13} />
          <ThemedText type="smallBold">{h.xp}</ThemedText>
        </View>
      </View>
      <View style={s.brHero}>
        <ThemedText type="title" style={s.center} numberOfLines={2}>{h.course?.title}</ThemedText>
        <ThemedText type="label" style={[s.center, { color: h.accent, letterSpacing: 1.6 }]}>LESSON {h.next?.num ?? h.done}</ThemedText>
        <View style={s.brArt}>
          <LessonArt courseId={h.courseId} title={h.next?.title ?? ''} index={(h.next?.num ?? 1) - 1} size={172} />
        </View>
      </View>
      <View style={[s.brCard, { borderColor: t.border }]}>
        {h.upcoming.slice(0, 2).map((l, i) => (
          <View key={l.num} style={s.brRow}>
            <ThemedText type={i === 0 ? 'bodyMedium' : 'body'} themeColor={i === 0 ? undefined : 'mutedForeground'} style={{ flex: 1 }} numberOfLines={2}>{l.title}</ThemedText>
            <View style={[s.dot, { borderColor: t.border }]} />
          </View>
        ))}
        {h.next && <SlabButton label={h.done > 0 ? 'Continue' : 'Start'} full onPress={() => openLesson(h.courseId, h.next.num)} />}
      </View>
    </>
  );
}

export default function HomeVariants() {
  const t = useTheme();
  const h = useHome();
  const Body = { 1: Step, 2: Greenlight, 3: Robinhood, 4: Acorns, 5: Bloom, 6: Brilliant }[V];
  const label = { 1: 'STEP', 2: 'GREENLIGHT', 3: 'ROBINHOOD', 4: 'ACORNS', 5: 'BLOOM', 6: 'BRILLIANT' }[V];
  const bleed = V === 5; /* Bloom owns the whole surface; the others sit on the app background. */

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: bleed ? t.primary : t.background }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={bleed ? undefined : s.scroll} showsVerticalScrollIndicator={false}>
        {!bleed && (
          <View style={s.tag}>
            <ThemedText type="label" style={{ color: t.mutedForeground, letterSpacing: 2 }}>{V} · {label}</ThemedText>
          </View>
        )}
        <Body h={h} />
        {/* The pathway rail is shown on the variants whose reference keeps a course list. */}
        {(V === 1 || V === 2) && (
          <View style={s.path}>
            {h.courses.slice(0, 3).map((c) => (
              <View key={c.id} style={[s.pathRow, { borderColor: t.border }]}>
                <CourseMark id={c.id} size={26} />
                <ThemedText type="body" style={{ flex: 1 }} numberOfLines={1}>{c.title}</ThemedText>
                <ThemedText type="smallBold" style={{ color: courseAccent(c.id) }}>0/{c.totalLessons}</ThemedText>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.five, gap: Spacing.four },
  tag: { paddingTop: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  center: { textAlign: 'center' },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 1 },

  stepHero: { borderWidth: 1, borderRadius: Radius.lg, overflow: 'hidden', padding: Spacing.three, gap: Spacing.three },
  stepCta: { alignItems: 'center', paddingVertical: Spacing.three, borderRadius: Radius.md, borderBottomWidth: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  tile: { width: '47.5%', flexGrow: 1, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.three, gap: 2 },
  tileHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },

  actionRow: { flexDirection: 'row', gap: Spacing.three, paddingTop: Spacing.two },
  action: { flex: 1, alignItems: 'center', gap: Spacing.two },
  actionDisc: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  glStrip: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.four, gap: Spacing.three },

  segs: { flexDirection: 'row', gap: Spacing.two, paddingTop: Spacing.two },
  seg: { paddingHorizontal: Spacing.three, paddingVertical: 6, borderRadius: Radius.pill },
  secLabel: { letterSpacing: 1.4, marginTop: Spacing.two },
  rhRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.three, borderBottomWidth: StyleSheet.hairlineWidth },
  pillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  rhPill: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: Radius.md },

  acBlock: { marginHorizontal: -Spacing.three, marginTop: -Spacing.three, padding: Spacing.four, paddingTop: Spacing.five, gap: 2 },
  acTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.28)', marginTop: Spacing.three, overflow: 'hidden' },
  acFill: { height: 6, borderRadius: 3 },
  acActions: { flexDirection: 'row', marginTop: Spacing.four },
  acAction: { flex: 1, alignItems: 'center', gap: 2 },
  acDisc: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.22)' },
  acRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.four, borderBottomWidth: StyleSheet.hairlineWidth },

  bloomWrap: { flex: 1 },
  bloomTop: { alignItems: 'center', gap: Spacing.two, paddingTop: Spacing.five, paddingBottom: Spacing.six, paddingHorizontal: Spacing.four },
  bloomSheet: { flex: 1, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.four, gap: Spacing.four },
  bloomRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },

  brChips: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: Spacing.two },
  brChip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: Radius.pill, borderWidth: 1 },
  brHero: { alignItems: 'center', gap: Spacing.two, paddingTop: Spacing.five },
  brArt: { marginTop: Spacing.five, marginBottom: Spacing.five },
  brCard: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.four, gap: Spacing.four },
  brRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },

  path: { gap: Spacing.two },
  pathRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.three },
});
