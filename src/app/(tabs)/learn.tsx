/**
 * Learn — the Duolingo-style pathway trail. A horizontal course rail picks one of the 12
 * real curriculum courses; below it the serpentine lesson nodes (done / current / locked)
 * render that course's REAL lessons, tinted with the course accent. Progress comes from
 * `completedLessons` in the store; node art comes from <LessonArt>, which derives its own
 * metaphor from the course + lesson title.
 */
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { AskAtlasButton } from '@/components/ask-atlas';
import { LessonNodeMark, lessonMarkColor } from '@/components/art/lesson-marks';
import { CourseMark } from '@/components/art/course-mark';
import { artKeyFor } from '@/components/lesson-art';
import { GateSheet } from '@/components/gate-sheet';
import { entitled, type Refusal } from '@/lib/entitlement';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { courseAccent } from '@/lib/course-accents';
import { COURSES, getCourseById, loadCourseLessons, type PathwayLesson } from '@/lib/curriculum';
import { lessonKey, useApp } from '@/lib/store';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

/* ── UNIT 7: THE LIST MODEL, from Promova 138799 in pixels ───────────────────────────────
   The serpentine could not reach 10 nodes and two attempts proved it (§22 C33, and again this
   session with the header already fixed). The reason is structural: a serpentine spends horizontal
   space on the curve and squeezes titles into a 130pt side gutter, so the pitch must clear a 36pt
   two-line title AND a >=44pt tap target at once. Those two fight, and the loser is the artifact —
   at GAP 58 the count hit 10 while "Complete" vanished under the active node's halo.

   PROMOVA DID NOT ABANDON THE PATH. IT STRAIGHTENED IT. Measured off screen 138799:

     connector      one thin vertical line, left edge, through every node centre
     status circle  ~24pt ON the line — done = fill + check, active = dark + bolt, locked = flat grey
     title          ONE line, left-aligned right of the line, ~15pt
     trailing glyph a small lesson-type icon at the far right
     row pitch      ~43pt
     rows visible   FOURTEEN

   THE INSIGHT THAT DISSOLVES THE PROBLEM: the circle is not the tap target — THE ROW IS. A 24pt
   circle costs nothing in reachability when the pressable is 370x56. C33's bind was that the node
   had to be both the visual mark and the 44pt target. A row has to be neither small nor cramped.

   EUPHORIA'S NUMBERS, adapted rather than copied:
     ROW 56      12pt above the HIG minimum, and 587 / 56 = 10.5 — to be MEASURED, not assumed
     DOT 28      bigger than Promova's 24 because ours carries a course accent worth seeing
     title 15pt  up to two lines, with ~274pt of width instead of 130 — the old gutter is the only
                 reason "Building a Rational Investment Frame…" ever had to truncate
     mark 24pt   the AUTHORED per-lesson mark (§22 C16's 300 of them) moves to the right edge, where
                 Promova puts its type glyph. This is the first layout that gives them room.

   Locked rows keep their titles (4/4, §6.6.3) and tapping one opens the gate sheet. */
const ROW = 56;
const DOT = 28;


export default function Learn() {
  const theme = useTheme();

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
          <View style={{ marginTop: Spacing.two, opacity: stale ? 0.35 : 1 }}>
            {lessons.map((lesson, i) => {
              const done = doneFlags[i];
              const active = i === current;
              const locked = current >= 0 && i > current;
              /* Milestone every 5th. 3 of 6 reference paths punctuate the path with a reward marker,
                 and this differentiates because only every fifth row carries it. */
              const milestone = (i + 1) % 5 === 0;
              const dotFill = done ? accent : active ? accent + '2E' : theme.card;
              const dotRing = done ? accent : active ? accent : theme.border;
              const first = i === 0;
              const last = i === lessons.length - 1;
              return (
                <SpringPressable
                  key={i}
                  haptic={!locked}
                  scaleTo={0.98}
                  onPress={() => {
                    /*
                     * Read NON-REACTIVELY at tap time. `entitled()` returns a fresh object, so
                     * subscribing to it through a zustand selector gave every render a new snapshot
                     * and looped until React threw "Maximum update depth exceeded" — the same trap
                     * you.tsx documents at `levelProgress()`. The refusal is only needed at the
                     * moment of the tap, so nothing has to subscribe at all.
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
                      : `${lesson.title}${done ? '. Complete' : active ? '. Start here' : ''}`
                  }>
                  <View style={styles.row}>
                    {/* The connector, as two half-segments rather than one Svg path: the first row
                        must have nothing above it and the last nothing below, which a single path
                        through all the centres cannot express — it overshot both ends. */}
                    <View style={styles.railCol}>
                      {!first && (
                        <View style={[styles.wire, { top: 0, height: (ROW - DOT) / 2, backgroundColor: done || active ? accent + '66' : theme.border }]} />
                      )}
                      {!last && (
                        <View style={[styles.wire, { bottom: 0, height: (ROW - DOT) / 2, backgroundColor: done ? accent + '66' : theme.border }]} />
                      )}
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: dotFill, borderColor: dotRing, borderWidth: active ? 2.5 : 1.5, opacity: locked ? 0.55 : 1 },
                        ]}>
                        {done ? (
                          <UIcon name="check" size={15} color={theme.primaryForeground} />
                        ) : locked ? (
                          <UIcon name="lock" size={13} color={theme.mutedForeground} />
                        ) : (
                          <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: accent }} />
                        )}
                      </View>
                    </View>

                    <View style={styles.rowText}>
                      <ThemedText
                        type={active ? 'bodyMedium' : 'body'}
                        numberOfLines={2}
                        style={{ fontSize: 15, lineHeight: 20, color: locked ? theme.mutedForeground : theme.text }}>
                        {lesson.title}
                      </ThemedText>
                      {active && <ThemedText type="label" style={{ color: accent, marginTop: 1 }}>START HERE</ThemedText>}
                    </View>

                    {/* Promova puts a lesson-type glyph here. Ours puts the AUTHORED per-lesson mark,
                        which until now was squeezed inside a 66pt circle competing with an accent
                        ring at 18% of the same hue. At 24pt on a neutral ground it finally has both
                        contrast and room. */}
                    <View style={styles.rowMark}>
                      {milestone && <UIcon name="sparkle" size={13} color={theme.warning} />}
                      <LessonNodeMark
                        courseId={activeCourseId}
                        num={lesson.num}
                        fallbackKey={artKeyFor(lesson.title, i)}
                        size={24}
                        color={lessonMarkColor({ active, accent, text: theme.text })}
                      />
                    </View>
                  </View>
                </SpringPressable>
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
  trailScroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.three, paddingBottom: BottomTabInset + Spacing.five },
  empty: { paddingTop: Spacing.six, alignItems: 'center', gap: Spacing.two },

  /* ── THE ROW ────────────────────────────────────────────────────────────────────────────────
     minHeight, not height: a two-line title has to be allowed to make its own row taller rather
     than being clipped. Most titles fit one line in ~274pt, so the common row is exactly ROW and
     the count holds; the long ones grow and the measured count reflects that honestly. */
  row: { minHeight: ROW, flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  /* Fixed width so every dot lands on the same vertical axis regardless of title length — that
     shared axis IS the path, and one row indenting differently would break the line. */
  railCol: { width: DOT, alignItems: 'center', alignSelf: 'stretch', justifyContent: 'center' },
  wire: { position: 'absolute', width: 2, borderRadius: 1 },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, paddingVertical: Spacing.one },
  /* Fixed width so titles all wrap at the same point — a mark column that shrinks with its content
     would give every row a different text width and the left edge of nothing would line up. */
  rowMark: { width: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 3 },
});
