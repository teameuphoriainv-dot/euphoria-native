/**
 * HOME V2 — the Brilliant-structure experiment, built ALONGSIDE the shipping Home.
 *
 * Nothing is deleted to make this exist. /(tabs)/home still renders exactly as it does today;
 * this is a second route so the two can be flipped between on device and compared, because the
 * change being tested is subtraction and subtraction is the kind of thing you have to see before
 * you agree to it.
 *
 * MEASURED off the owner's own screenshot of Brilliant's home (Solving Equations, Level 1),
 * per AGENTS.md's requirement to inspect the primary reference and name the mechanism before
 * changing code. Six things do the work there, and only one of them is styling:
 *
 *   1. ONE SUBJECT. The entire screen is "this course, this level". No streak card, no course
 *      rail, no quest list. Those exist in their app -- on other tabs. The minimalism is that
 *      four things we show are somewhere else, not that they are styled quieter.
 *   2. ONE ACCENT. Their blue appears exactly twice: the LEVEL label and the Start button.
 *      Home currently shows five course colours at once, which is why none of them reads as
 *      primary.
 *   3. THE ART IS THE SCREEN. Centred, large, floating in space rather than tucked in a card
 *      corner at 84pt. This is where Atlas goes, tinted to the course accent -- the reason the
 *      tint prop was built first.
 *   4. OUTLINED CONTAINERS. Their lesson card is a hairline border over nothing. Ours are
 *      filled and tinted, which is why five stacked cards read as noise.
 *   5. THE STREAK IS A CORNER CHIP. A small outlined pill, not the largest element on screen.
 *   6. THE CTA IS A SLAB. Face over a darker base -- which SlabButton already is, so it is used
 *      directly rather than reproduced.
 *
 * NOT COPIED: their five page dots are a level CAROUSEL. Static dots with no swipe behind them
 * would be decoration pretending to be navigation, so they are left out until the carousel
 * actually exists.
 */
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { SlabButton } from '@/components/ui/button';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { courseAccent } from '@/lib/course-accents';
import { loadCourseLessons, type PathwayLesson } from '@/lib/curriculum';
import { getCourseById } from '@/lib/curriculum/courseIndex';
import { lessonKey, useApp } from '@/lib/store';

/** A small outlined pill. Brilliant's two top chips carry a number and a glyph and nothing else. */
function Chip({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return <View style={[styles.chip, { borderColor: theme.border }]}>{children}</View>;
}

export default function HomeV2() {
  const theme = useTheme();
  const streak = useApp((s) => s.streak);
  const xp = useApp((s) => s.xp);
  const completedLessons = useApp((s) => s.completedLessons);
  const activeCourseId = useApp((s) => s.activeCourseId);

  const course = getCourseById(activeCourseId);
  const accent = courseAccent(activeCourseId);

  /* Same source of truth as Home and Learn: the first lessons in the course not yet finished.
     Two of them, because the reference card lists the current lesson and the one after it. */
  const [upcoming, setUpcoming] = useState<PathwayLesson[]>([]);
  useEffect(() => {
    let cancelled = false;
    loadCourseLessons(activeCourseId)
      .then((ls) => {
        if (cancelled) return;
        setUpcoming(ls.filter((l) => !completedLessons.includes(lessonKey(activeCourseId, l.num))).slice(0, 2));
      })
      .catch(() => {
        if (!cancelled) setUpcoming([]);
      });
    return () => {
      cancelled = true;
    };
  }, [activeCourseId, completedLessons]);

  const doneInCourse = useMemo(
    () => completedLessons.filter((k) => k.startsWith(`${activeCourseId}:`)).length,
    [completedLessons, activeCourseId],
  );
  const next = upcoming[0] ?? null;
  /* "Level" is the reference's unit of place. Ours is the lesson number, so it is derived rather
     than invented: no new field, no migration, and it cannot disagree with the lesson list. */
  const level = next?.num ?? doneInCourse;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 5. THE STREAK IS A CORNER CHIP, not a card. Same number, one twentieth of the area. */}
        <View style={styles.chips}>
          <Chip>
            <ThemedText type="smallBold">{streak}</ThemedText>
            <ThemedText type="small" themeColor="mutedForeground">day</ThemedText>
          </Chip>
          <Chip>
            <ThemedText type="smallBold">{xp}</ThemedText>
            <ThemedText type="small" themeColor="mutedForeground">XP</ThemedText>
          </Chip>
        </View>

        {/* 1. ONE SUBJECT, centred. Everything on this axis, nothing beside it. */}
        <View style={styles.hero}>
          <ThemedText type="title" style={styles.courseTitle} numberOfLines={2}>
            {course?.title ?? 'Your course'}
          </ThemedText>
          {/* 2. ONE ACCENT, first of its two appearances. */}
          <ThemedText type="label" style={[styles.level, { color: accent }]}>
            LESSON {level}
          </ThemedText>

          {/*
            * 3. THE ART IS THE SCREEN. 180 rather than the 84 Home uses in a card corner, and
            * well past IDLE_MOTION_MIN_SIZE (72), so he is alive rather than a frozen sticker.
            * Tinted to the course accent -- the whole reason the tint prop was built.
            */}
          <View style={styles.art}>
            <Atlas
              size={180}
              tint={accent}
              expression={doneInCourse > 0 ? 'happy' : 'watching'}
              accessibilityLabel={`Atlas, in the colours of ${course?.title ?? 'your course'}`}
            />
          </View>
        </View>

        {/* 4. AN OUTLINED CONTAINER, not a filled tinted card. */}
        <View style={[styles.card, { borderColor: theme.border }]}>
          {upcoming.map((l, i) => (
            <View key={l.num} style={styles.row}>
              <ThemedText
                type={i === 0 ? 'bodyMedium' : 'body'}
                themeColor={i === 0 ? undefined : 'mutedForeground'}
                style={styles.rowTitle}
                numberOfLines={2}>
                {l.title}
              </ThemedText>
              {/* The reference's completion dot: small, hollow, on the right, and quiet. */}
              <View style={[styles.dot, { borderColor: theme.border }]} />
            </View>
          ))}
          {upcoming.length === 0 && (
            <ThemedText type="body" themeColor="mutedForeground" style={styles.rowTitle}>
              Course complete.
            </ThemedText>
          )}
          {/* 2. ONE ACCENT, second appearance. 6. The CTA is already a slab, so use it. */}
          {next && (
            <SlabButton
              label={doneInCourse > 0 ? 'Continue' : 'Start'}
              full
              onPress={() => {
                router.push({ pathname: '/lesson', params: { course: activeCourseId, num: String(next.num) } });
              }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  /* The reference gives roughly a third of the screen to empty space. `gap` between three
     blocks plus a tall top inset is how that is spent here. */
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.four, paddingBottom: Spacing.five, gap: Spacing.six },
  chips: { flexDirection: 'row', justifyContent: 'space-between' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  hero: { alignItems: 'center', gap: Spacing.two },
  courseTitle: { textAlign: 'center' },
  level: { letterSpacing: 1.6 },
  art: { marginTop: Spacing.four },
  card: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.four, gap: Spacing.four },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  rowTitle: { flex: 1 },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1 },
});
