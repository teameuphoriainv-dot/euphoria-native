/**
 * Learn — the Duolingo-style pathway trail. A horizontal course rail picks one of the 12
 * real curriculum courses; below it the serpentine lesson nodes (done / current / locked)
 * render that course's REAL lessons, tinted with the course accent. Progress comes from
 * `completedLessons` in the store; node art comes from <LessonArt>, which derives its own
 * metaphor from the course + lesson title.
 */
import { router } from 'expo-router';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { AskAtlasButton } from '@/components/ask-atlas';
import { CourseMark } from '@/components/art/course-mark';
import { assignLessonArt } from '@/components/lesson-art';
import { GateSheet } from '@/components/gate-sheet';
import { RetryNotice } from '@/components/retry-notice';
import { entitled, type Refusal } from '@/lib/entitlement';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { BottomTabInset, Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { courseAccent } from '@/lib/course-accents';
import { COURSES, getCourseById, loadCourseLessons, type PathwayLesson } from '@/lib/curriculum';
import { LESSONS_PER_UNIT, unitNameFor } from '@/lib/course-units';
import { lessonKey, useApp } from '@/lib/store';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { PixelSpriteView, checkBadge, coin, lock } from '@/lib/pixel';
import { ProfileButton } from '@/components/profile-button';

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
  const streak = useApp((s) => s.streak);

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
  /* One distinct mark per lesson, assigned across the WHOLE course rather than per row — a row
   * cannot know what the row above already took. See assignLessonArt. */
  const lessonArt = useMemo(() => assignLessonArt(lessons.map((l) => l.title)), [lessons]);
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
                <UIcon name="flame" size={14} color={theme.streak} />
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
                <CourseMark id={c.id} size={20} muted={!on} />
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
              /*
                * UNIT HEADER every fifth lesson. Audit finding (FINDINGS.md, LEARN, 4/4): every
                * comparator scopes the list to a NAMED unit and none shows more than about six
                * items before a divider. This screen showed 25 in one scroll with nine consecutive
                * padlocks.
                *
                * A Fragment, not a wrapping View: the rows draw a connecting rail from sibling
                * layout, and boxing them changes it.
                *
                * The "UNIT n · m LESSONS" line above the name was REMOVED 2026-08-25: the unit's own
                * name says what the section is, and the count restated a number the progress bar
                * already carries. Only the name remains.
                */
              const unitName = i % LESSONS_PER_UNIT === 0 ? unitNameFor(trailCourseId, i) : null;
              return (
                <Fragment key={i}>
                {unitName && (
                  <View
                    style={[
                      styles.unitHead,
                      /*
                       * THE FIRST UNIT GETS NO TOP SPACE. unitHead carries marginTop AND paddingTop
                       * so that one unit is clearly separated from the one above it, which is right
                       * for every header except the first: there is nothing above it to separate
                       * from, so that space landed as a blank band directly under the course chips
                       * and pushed the whole pathway down the screen for no reason.
                       */
                      i === 0 && { marginTop: 0, paddingTop: 0 },
                      i > 0 && { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth },
                    ]}>
                    <ThemedText type="bodyMedium" numberOfLines={2}>
                      {unitName}
                    </ThemedText>
                  </View>
                )}
                <SpringPressable
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
                        {/* The glyphs inside the node are sprites; the RING is not. The ring carries
                            the course accent and the done/active/locked state, and it is the rail's
                            own structure — the wires above and below attach to it. Replacing it with
                            a sprite would throw away the only thing on this row that shows state. */}
                        {done ? (
                          <PixelSpriteView sprite={checkBadge} size={15} />
                        ) : locked ? (
                          <PixelSpriteView sprite={lock} size={13} />
                        ) : (
                          <View style={{ width: 9, height: 9, borderRadius: 1, backgroundColor: accent }} />
                        )}
                      </View>
                    </View>

                    <View style={styles.rowText}>
                      <ThemedText
                        type={active ? 'bodyMedium' : 'body'}
                        numberOfLines={2}
                        style={{ fontSize: FontSize.bodySm, lineHeight: 20, color: locked ? theme.mutedForeground : theme.text }}>
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
                      {/*
                        * The SAME metaphor art the Home hero uses. This node used to be one of
                        * ~300 hand-authored per-lesson SVGs with a 40-mark SVG fallback behind it —
                        * two more art systems, in an app whose identity is pixel art, for a mark
                        * rendered at 24pt.
                        *
                        * `artKeyFor(title)` was ALREADY being computed here to pick that fallback,
                        * so the path and the hero were always agreeing on the metaphor and then
                        * drawing it two different ways. Now they draw the same sprite.
                        *
                        * State is opacity, as on the course rail: a sprite carries its own palette,
                        * and muting it to one tone would throw away the thing that makes a lesson
                        * recognisable when you scroll back to find it.
                        */}
                      <View style={{ opacity: active ? 1 : 0.45 }}>
                        <PixelSpriteView sprite={lessonArt[i] ?? coin} size={24} />
                      </View>
                    </View>
                  </View>
                </SpringPressable>
                </Fragment>
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
  streakPill: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  unitHead: { marginTop: Spacing.four, marginBottom: Spacing.two, paddingTop: Spacing.four, paddingHorizontal: Spacing.one },
  track: { height: 6, borderRadius: Radius.chip, overflow: 'hidden', marginTop: Spacing.three },
  fill: { height: 6, borderRadius: Radius.chip },
  // fixed, unshrinkable — RN gives ScrollView flexShrink:1, and the trail below is ~1500pt of
  // content, so without this the chip row gets squeezed and clips.
  chipScroll: { flexGrow: 0, flexShrink: 0, height: 44 + Spacing.two + Spacing.two },
  chipRow: { gap: Spacing.two, paddingHorizontal: Spacing.three, paddingTop: Spacing.two, paddingBottom: Spacing.two },
  // 44pt exactly: the HIG touch minimum, and the number the whole density fix is spending.
  chip: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: 14, borderRadius: Radius.pill },
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
  wire: { position: 'absolute', width: 2, borderRadius: 0 },
  /*
   * PIXELATED NODE. This was a true circle (borderRadius: DOT / 2) and it was the last round
   * thing on a screen whose glyphs are all pixel sprites, so the ring read as a different visual
   * system to everything inside it.
   *
   * SQUARED OFF RATHER THAN REPLACED WITH A SPRITE, deliberately. PixelSpriteView takes
   * sprite/size/scale/play/playKey/frameMs/canvas and has NO colour prop, so a sprite bakes its
   * palette in. This ring carries the COURSE ACCENT and three states (done, active, locked), and
   * the wires above and below attach to it. A sprite ring would need one variant per state per
   * course accent and would still lose the accent, which is exactly what the note beside the node
   * warns about. A small radius keeps every one of those properties and costs no extra views, on
   * a screen that renders 25 of these.
   */
  dot: { width: DOT, height: DOT, borderRadius: 3, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, paddingVertical: Spacing.one },
  /* Fixed width so titles all wrap at the same point — a mark column that shrinks with its content
     would give every row a different text width and the left edge of nothing would line up. */
  rowMark: { width: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 3 },
});
