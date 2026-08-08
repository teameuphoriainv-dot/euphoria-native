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
import { LessonNodeMark, lessonMarkColor } from '@/components/art/lesson-marks';
import { CourseMark } from '@/components/art/course-mark';
import { artKeyFor } from '@/components/lesson-art';
import { GateSheet } from '@/components/gate-sheet';
import { entitled, type Refusal } from '@/lib/entitlement';
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

/* ── UNIT 7 GEOMETRY, DERIVED FROM MEASURED FRAMES ───────────────────────────────────────────────
   Measured on the QA device at TRUE SCROLL TOP (three swipes down first — C33's whole failure was a
   mid-scroll reading, and C34's correction was wrong too):

     screen                402 x 874          <- NOT 852; §22 C42
     course header         y  70 .. 122
     course RAIL           y 160 .. 310       <- 150pt, the actual problem
     first lesson node     y 342
     TAB BAR TOP           y 799
     usable band           799 - 342 = 457pt  -> 457/100 = 4.6 -> FIVE nodes visible

   C34 claimed first node y=575, tab bar y=819, a 244pt band and three nodes. All three are wrong.
   C33 claimed a 367pt band. Also wrong. The band is 457pt and five nodes fit.

   THE FIX IS THE HEADER, NOT THE PITCH — C34 got that part right. Removing the 150pt rail for a 44pt
   chip returns 106pt, and tightening the trail's top margin returns 16 more:

     first node   342 - 122 = 220
     band         799 - 220 = 579pt
     10 nodes     10 x 58   = 580   -> node 10 sits y=742..794, clear of the tab bar at 799

   THE BINDING CONSTRAINTS, every one measured rather than assumed:
     - a two-line 13pt title is h=36.0 (measured, consistently). Pitch must exceed it or titles
       collide with each other — C33 hit exactly this and never checked title BOXES against each
       other, which is trap #1 verbatim: an a11y anchor is a POINT, not a BOX.
     - a tap target must be >= 44pt (HIG). C33's 28pt node is why that attempt was reverted.
     - NODE + LIP <= GAP, or a node's raised lip overlaps the node below it. This is what makes the
       active node the real constraint: it is the largest.

   So: GAP 58 / NODE 48 / START 52 / LIP 4.
     node + lip   48 + 4 = 52 <= 58   (6pt clear)
     active + lip 52 + 4 = 56 <= 58   (2pt clear)
     title        14..50 inside a 58 pitch -> next title starts at 72, so 22pt between boxes
     tap target   48 >= 44
   AMP 58, down from 66, so the serpentine swings less far off centre and the narrowest title gutter
   widens. §0.6 applies: if the measured count is under 10, this reverts rather than being renamed. */
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
          const cAccent = courseAccent(c.id);
          const done = completedLessons.filter((id) => id.startsWith(`${c.id}:`)).length;
          return (
            <SpringPressable
              key={c.id}
              haptic={false}
              scaleTo={0.95}
              onPress={() => setActiveCourse(c.id)}
              accessibilityRole="button"
              accessibilityLabel={`${c.title}, ${String(done)} of ${String(c.totalLessons)} complete`}
              accessibilityState={{ selected: on }}
              onLayout={(e) => {
                chipX.current[c.id] = e.nativeEvent.layout.x;
              }}>
              <View
                style={[
                  styles.chip,
                  {
                    backgroundColor: on ? cAccent + '2E' : theme.card,
                    borderColor: on ? cAccent : theme.border,
                    borderWidth: on ? 1.5 : StyleSheet.hairlineWidth,
                  },
                ]}>
                <CourseMark id={c.id} size={20} color={on ? cAccent : theme.mutedForeground} />
                <ThemedText
                  type="smallBold"
                  numberOfLines={1}
                  style={{ color: on ? theme.text : theme.mutedForeground }}>
                  {c.title}
                </ThemedText>
              </View>
            </SpringPressable>
          );
        })}
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
          <View style={{ height: trailHeight, marginTop: Spacing.two, opacity: stale ? 0.35 : 1 }}>
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
                      /*
                       * Read NON-REACTIVELY at tap time. `entitled()` returns a fresh object, so
                       * subscribing to it through a zustand selector gave every render a new
                       * snapshot and looped until React threw "Maximum update depth exceeded" —
                       * the same trap you.tsx documents at `levelProgress()`. The refusal is only
                       * needed at the moment of the tap, so nothing has to subscribe at all.
                       */
                      const refusal = entitled(useApp.getState(), 'lesson');
                      if (!refusal.ok) {
                        setGate(refusal);
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
  // fixed, unshrinkable — RN gives ScrollView flexShrink:1, and the trail below is ~1500pt of
  // content, so without this the chip row gets squeezed and clips.
  chipScroll: { flexGrow: 0, flexShrink: 0, height: 44 + Spacing.two + Spacing.two },
  chipRow: { gap: Spacing.two, paddingHorizontal: Spacing.three, paddingTop: Spacing.two, paddingBottom: Spacing.two },
  // 44pt exactly: the HIG touch minimum, and the number the whole density fix is spending.
  chip: { height: 44, flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: 14, borderRadius: Radius.pill },
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
