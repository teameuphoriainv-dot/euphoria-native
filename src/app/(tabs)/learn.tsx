/**
 * Learn — the Duolingo-style pathway trail. A horizontal course rail picks one of the 12
 * real curriculum courses; below it the serpentine lesson nodes (done / current / locked)
 * render that course's REAL lessons, tinted with the course accent. Progress comes from
 * `completedLessons` in the store; node art comes from <LessonArt>, which derives its own
 * metaphor from the course + lesson title.
 */
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { AmbientBackground } from '@/components/ambient-background';
import { AskAtlasButton } from '@/components/ask-atlas';
import { Atlas } from '@/components/atlas';
import { CourseRailCard, RAIL_CARD_GAP, RAIL_CARD_HEIGHT, RAIL_CARD_WIDTH } from '@/components/course-rail-card';
import { LessonNodeMark, lessonMarkColor } from '@/components/art/lesson-marks';
import { artKeyFor } from '@/components/lesson-art';
import { GateSheet } from '@/components/gate-sheet';
import { useEntitlement, type Refusal } from '@/lib/entitlement';
import { PulseHalo } from '@/components/pulse-halo';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { courseAccent } from '@/lib/course-accents';
import { COURSES, getCourseById, loadCourseLessons, type PathwayLesson } from '@/lib/curriculum';
import { lessonKey, useApp } from '@/lib/store';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

/* 100, was 128. Nodes are 66pt (84 for the current one), so a 128 pitch left 62pt of dead
   space between every node edge and only FOUR lessons fitted a viewport. Six learning-path
   screens across four apps show far more at once — Promova ~14, Duolingo ~6, Lingvano lists
   chapter cards. 100 brings the gap between node edges to 34pt and the count to ~6, matching
   the Duolingo trail this screen is modelled on. */
const GAP = 100;
const AMP = 66;
const NODE = 66;
const START = 84;
const LIP = 6; // 3D bottom-edge depth (Duolingo button look)

export default function Learn() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const cx = (width - Spacing.three * 2) / 2;

  const activeCourseId = useApp((s) => s.activeCourseId);
  const setActiveCourse = useApp((s) => s.setActiveCourse);
  const completedLessons = useApp((s) => s.completedLessons);

  const course = getCourseById(activeCourseId);
  const accent = courseAccent(activeCourseId);

  // loadCourseLessons is async (dynamic import). Keep the previous course's trail on screen
  // while the next one resolves so switching never flashes an empty path.
  // `loaded` holds whichever course is actually on screen, so "still loading" is derived rather
  // than a second state — no setState during the effect body.
  const [loaded, setLoaded] = useState<{ id: string; lessons: PathwayLesson[] } | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadCourseLessons(activeCourseId)
      .then((lessons) => {
        if (!cancelled) setLoaded({ id: activeCourseId, lessons });
      })
      .catch(() => {
        // a failed dynamic import shouldn't blank the tab — fall through to the empty state
        if (!cancelled) setLoaded({ id: activeCourseId, lessons: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [activeCourseId]);

  const lessons = useMemo(() => loaded?.lessons ?? [], [loaded]);
  const trailCourseId = loaded?.id ?? activeCourseId;
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

  /*
   * The entitlement gate for lessons. Distinct from `locked` below, which is a PROGRESSION lock
   * (n.i > current) — money cannot unlock lesson 5 for someone who has not finished lesson 4, and
   * §20.4 forbids showing a paywall for something money cannot buy. So a sequence-locked node
   * states its own condition (Duolingo's "Finish 7 lessons to start competing" move) while an
   * unentitled one opens the sheet.
   */
  const lessonRefusal = useEntitlement('lesson');
  const [gate, setGate] = useState<Refusal | null>(null);

  const nodes = useMemo(
    () =>
      Array.from({ length: total }, (_, i) => ({
        i,
        y: i * GAP,
        x: cx + Math.sin(i * 0.8) * AMP,
        size: i === current ? START : NODE,
      })),
    [cx, total, current],
  );

  const trailHeight = total > 0 ? (total - 1) * GAP + START : 0;
  const pathD = nodes.map((n, i) => `${i === 0 ? 'M' : 'L'} ${n.x} ${n.y + START / 2}`).join(' ');

  // keep the selected rail card in view when the course changes from elsewhere (e.g. /courses)
  const rail = useRef<ScrollView>(null);
  useEffect(() => {
    const idx = COURSES.findIndex((c) => c.id === activeCourseId);
    if (idx < 0) return;
    rail.current?.scrollTo({ x: Math.max(0, idx * (RAIL_CARD_WIDTH + RAIL_CARD_GAP) - RAIL_CARD_WIDTH), animated: true });
  }, [activeCourseId]);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AmbientBackground starCount={45} />

      {/* Sticky header */}
      <RiseIn>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <SpringPressable haptic={false} onPress={() => router.push('/courses')} style={{ flex: 1 }}>
              <ThemedText type="title" style={{ fontSize: 22 }} numberOfLines={1}>{course?.title ?? 'Courses'}</ThemedText>
              {/* Data, not an instruction. All six reference path screens put INFORMATION here —
                  "12 chapters", "Beginner: 2%", "0 of 7 lessons completed", "24 lessons" — none
                  spends the line telling you the header is tappable. */}
              <ThemedText type="small" style={{ marginTop: 2, color: theme.iconLilac }} numberOfLines={1}>
                {total ? `${Math.round((doneCount / total) * 100)}% complete · ${total} lessons` : 'Tap to browse all courses'}
              </ThemedText>
            </SpringPressable>
            <View style={[styles.countPill, { backgroundColor: accent + '24', borderColor: accent + '4D' }]}>
              <ThemedText type="smallBold" style={{ color: accent }}>{doneCount}/{total || course?.totalLessons || 0}</ThemedText>
            </View>
            <AskAtlasButton topic={course?.title} />
          </View>
          <View style={[styles.track, { backgroundColor: theme.muted }]}>
            <View style={[styles.fill, { backgroundColor: accent, width: `${total ? (doneCount / total) * 100 : 0}%` }]} />
          </View>
        </View>
      </RiseIn>

      {/* Course rail — horizontal, one card per real course */}
      <ScrollView
        ref={rail}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.railScroll}
        contentContainerStyle={styles.rail}>
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

      <ScrollView style={styles.trailScroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {total === 0 ? (
          <View style={styles.empty}>
            {pending ? <ActivityIndicator color={accent} /> : null}
            <ThemedText type="small" themeColor="mutedForeground">
              {pending ? 'Loading lessons…' : 'No lessons available for this course yet.'}
            </ThemedText>
          </View>
        ) : (
          <View style={{ height: trailHeight, marginTop: Spacing.four, opacity: stale ? 0.35 : 1 }}>
            {/* Dashed connector behind nodes */}
            <Svg style={StyleSheet.absoluteFill} width={width} height={trailHeight}>
              <Path d={pathD} stroke={theme.border} strokeWidth={3} strokeDasharray="1 12" strokeLinecap="round" fill="none" />
            </Svg>

            {nodes.map((n) => {
              const done = doneFlags[n.i];
              const active = n.i === current;
              const locked = current >= 0 && n.i > current;
              const lesson = lessons[n.i];
              // Brilliant-style: illustration on a surface tile with a colored ring + raised lip.
              const face = active ? accent + '2E' : theme.card;
              const lip = active ? accent + 'AA' : done ? accent + '55' : theme.border;
              const ring = active ? accent : done ? accent + '99' : theme.border;
              // put the label on the emptier side. Comparing node CENTRE (not its right edge) to
              // cx is what keeps a 130pt label inside the gutter — real lesson titles are long
              // enough that the old edge-based test pushed them off the left of the screen.
              const labelLeft = n.x > cx;
              // NODE-TYPE ICONS WERE TRIED AND DROPPED. 4 of 6 reference paths differentiate node
              // kinds by icon, but that pattern needs lessons OF DIFFERENT KINDS. Every lesson in
              // this curriculum ends in a challenge, so the badge rendered the identical icon on
              // every node — decoration wearing the costume of information. Verified on device:
              // every visible node showed the same target glyph.
              //
              // Milestone every 5th lesson. 3 of 6 references punctuate the path with a reward
              // marker — Duolingo's treasure chest and trophy, Lingvano's MILESTONE 3,
              // RiseGuide's certificate. A path of 25 identical circles has no landmarks, and
              // THIS one differentiates because only every fifth node carries it.
              const milestone = (n.i + 1) % 5 === 0;
              return (
                <View key={n.i} style={{ position: 'absolute', top: n.y, left: n.x - n.size / 2, width: n.size, height: n.size + LIP }}>
                  {active && <PulseHalo size={n.size} color={accent} />}
                  <SpringPressable
                    onPress={() => {
                      // Not entitled -> the sheet, over this screen, keeping the user's place.
                      // Navigating to a paywall here would throw away the context that makes the
                      // ask legible, which is the whole mechanism (Astra AI 323575).
                      if (!lessonRefusal.ok) {
                        setGate(lessonRefusal);
                        return;
                      }
                      router.push({ pathname: '/lesson', params: { course: trailCourseId, num: String(lesson.num) } });
                    }}
                    disabled={locked}
                    accessibilityRole="button"
                    accessibilityLabel={
                      locked
                        ? `${lesson.title}. Finish the lesson before this one to unlock it.`
                        : lesson.title
                    }
                    scaleTo={0.9}>
                    {/* bottom lip */}
                    <View style={{ position: 'absolute', top: LIP, width: n.size, height: n.size, borderRadius: n.size / 2, backgroundColor: lip }} />
                    {/* face */}
                    <View
                      style={[
                        styles.node,
                        {
                          width: n.size, height: n.size, borderRadius: n.size / 2,
                          backgroundColor: face,
                          borderColor: ring,
                          borderWidth: active ? 3 : 2,
                          opacity: locked ? 0.5 : 1,
                        },
                      ]}>
                      {locked ? (
                        <UIcon name="lock" size={22} color={theme.mutedForeground} />
                      ) : (
                        /*
                         * Stroke mark, NOT the filled LessonArt scene.
                         *
                         * LessonArt's palette is derived entirely from the course accent, and an
                         * active node's face is that same accent at 18% — so the art was
                         * accent-on-accent and dissolved at 38pt. Behavioral Finance drew pink art
                         * on a pink ground and its bucket read as an unidentifiable cup.
                         *
                         * `artKeyFor` still chooses WHICH mark, so the measured distribution is
                         * unchanged (worst repeat 5 in a course, worst run 2, across 295 lessons).
                         * Only the rendering changed. lessonMarkColor owns the contrast rule.
                         */
                        <LessonNodeMark
                          courseId={activeCourseId}
                          num={lesson.num}
                          fallbackKey={artKeyFor(lesson.title, n.i)}
                          size={active ? 40 : 36}
                          color={lessonMarkColor({ active, accent, text: theme.text })}
                        />
                      )}
                    </View>
                    {/* Shown on LOCKED nodes too, dimmed. Hiding it until unlocked defeats the
                        point of a milestone: Duolingo's treasure chest is visible before you reach
                        it, and that is what makes it a landmark rather than a reward notification.
                        A path you cannot read ahead has nothing to aim at. */}
                    {milestone && (
                      <View
                        style={[
                          styles.nodeBadge,
                          {
                            backgroundColor: theme.background,
                            borderColor: theme.warning,
                            left: n.size - 22,
                            top: n.size - 16,
                            opacity: locked ? 0.55 : 1,
                          },
                        ]}>
                        <UIcon name="sparkle" size={12} color={theme.warning} />
                      </View>
                    )}
                  </SpringPressable>
                  {/* lesson title label */}
                  <View style={[styles.label, labelLeft ? { right: n.size + 12, alignItems: 'flex-end' } : { left: n.size + 12 }]}>
                    <ThemedText type="smallBold" style={{ color: locked ? theme.mutedForeground : theme.text, fontSize: 13 }} numberOfLines={2}>{lesson.title}</ThemedText>
                    {active && <ThemedText type="label" style={{ color: accent, marginTop: 1 }}>START</ThemedText>}
                    {done && <ThemedText type="small" themeColor="mutedForeground" style={{ fontSize: 11, lineHeight: 15 }}>Complete</ThemedText>}
                  </View>
                  {active && (
                    <View style={{ position: 'absolute', left: labelLeft ? undefined : -70, right: labelLeft ? -70 : undefined, top: -4 }}>
                      <Atlas size={60} expression="watching" interactive={false} />
                    </View>
                  )}
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
  safe: { flex: 1 },
  header: { paddingHorizontal: Spacing.three, paddingTop: Spacing.two },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  countPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, borderWidth: 1 },
  track: { height: 6, borderRadius: 6, overflow: 'hidden', marginTop: Spacing.three },
  fill: { height: 6, borderRadius: 6 },
  // fixed, unshrinkable — RN gives ScrollView flexShrink:1, and the trail below is ~3000pt of
  // content, so without this the rail gets squeezed and clips its cards.
  railScroll: { flexGrow: 0, flexShrink: 0, height: RAIL_CARD_HEIGHT + Spacing.three + Spacing.two },
  rail: { gap: RAIL_CARD_GAP, paddingHorizontal: Spacing.three, paddingTop: Spacing.three, paddingBottom: Spacing.two },
  /* Type badge on the node's lower-right. Sits on the page background with a ring, so it reads
     as attached to the node rather than painted inside it, and stays legible against both the
     card face and the accent-tinted active face. */
  nodeBadge: { position: 'absolute', width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  trailScroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.three, paddingBottom: BottomTabInset + Spacing.five },
  empty: { paddingTop: Spacing.six, alignItems: 'center', gap: Spacing.two },
  node: { alignItems: 'center', justifyContent: 'center' },
  label: { position: 'absolute', top: 14, width: 130, justifyContent: 'center' },
});
