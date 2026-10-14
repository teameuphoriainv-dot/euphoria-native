/**
 * /dev-lesson-art — every lesson's scene art, course by course: the course backdrop, then each
 * lesson's opener and finish keepsake, drawn by the real PixelSceneView so they move exactly as they
 * do inside a lesson. Tap a lesson's title to open that lesson on its first screen.
 *
 * Art modules load one at a time, never in parallel: loadLessonArt swaps the global ErrorUtils
 * handler for the length of each import, and overlapping loads would restore the wrong handler.
 *
 * __DEV__ only, unreachable from any nav. Open with:
 *   xcrun simctl openurl booted "euphorianative://dev-lesson-art?course=quantitative-analysis"
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LessonDesignProvider } from '@/components/lesson-design-provider';
import { PixelSceneView } from '@/components/pixel-scene-view';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { COURSES, loadCourseLessons } from '@/lib/curriculum';
import { loadLessonArt, type LessonArtSet, type SceneArt } from '@/lib/pixel/scenes';

type Row = { num: number; title: string; art: LessonArtSet | null };

/** The largest whole scale (so pixels stay sharp) that fits `maxWidth`, capped at the lesson's own scale. */
function fit(art: SceneArt, maxWidth: number, cap: number): number {
  return Math.max(1, Math.min(cap, Math.floor(maxWidth / art.width)));
}

function Gallery() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ course?: string }>();
  const [courseId, setCourseId] = useState(
    COURSES.some((c) => c.id === params.course) ? (params.course as string) : COURSES[0].id,
  );
  const [rows, setRows] = useState<Row[]>([]);
  const inner = width - Spacing.four * 2;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const lessons = await loadCourseLessons(courseId);
      for (const lesson of lessons) {
        const art = await loadLessonArt(courseId, lesson.num);
        if (cancelled) return;
        setRows((prev) => [...prev, { num: lesson.num, title: lesson.title, art }]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const course = COURSES.find((c) => c.id === courseId) ?? COURSES[0];
  const backdrops = rows.flatMap((r) => (r.art?.backdrop ? [r.art.backdrop] : []));
  const courseBackdrop = backdrops[0];
  const withArt = rows.filter((r) => r.art).length;

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.chipRow}>
        {COURSES.map((c) => {
          const on = c.id === courseId;
          return (
            <Pressable
              key={c.id}
              onPress={() => {
                setRows([]);
                setCourseId(c.id);
              }}
              style={[styles.chip, { backgroundColor: on ? theme.primary : theme.backgroundElement }]}>
              <ThemedText type="small" style={{ color: on ? theme.primaryForeground : theme.text }}>
                {c.title}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={rows}
        keyExtractor={(r) => String(r.num)}
        initialNumToRender={3}
        windowSize={5}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={{ marginBottom: Spacing.four }}>
            <ThemedText type="title" style={{ fontSize: 26 }}>
              {course.title}
            </ThemedText>
            <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 2 }}>
              {rows.length < course.totalLessons
                ? `Loading ${String(rows.length + 1)} of ${String(course.totalLessons)}…`
                : `${String(withArt)} of ${String(course.totalLessons)} lessons have art`}
            </ThemedText>
            {courseBackdrop ? (
              <View style={styles.block}>
                <ThemedText type="small" themeColor="mutedForeground" style={styles.caption}>
                  Course backdrop (bottom of every lesson screen)
                </ThemedText>
                <PixelSceneView art={courseBackdrop} scale={fit(courseBackdrop, inner, 4)} />
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => {
          const { opener, finish, backdrop } = item.art ?? {};
          const ownBackdrop = backdrop && courseBackdrop && backdrop.id !== courseBackdrop.id ? backdrop : null;
          return (
            <View style={[styles.row, { borderTopColor: theme.backgroundSelected }]}>
              <Pressable
                onPress={() =>
                  router.push({ pathname: '/lesson', params: { course: courseId, num: String(item.num), qa: 'step-0' } })
                }>
                <ThemedText type="bodyMedium">
                  {`${String(item.num)}. ${item.title}`}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.primary, marginTop: 2 }}>
                  Open lesson ›
                </ThemedText>
              </Pressable>
              {item.art === null ? (
                <ThemedText type="small" themeColor="mutedForeground" style={styles.caption}>
                  No art for this lesson
                </ThemedText>
              ) : null}
              {opener ? (
                <View style={styles.block}>
                  <ThemedText type="small" themeColor="mutedForeground" style={styles.caption}>
                    Opener
                  </ThemedText>
                  <PixelSceneView art={opener} scale={fit(opener, inner, 4)} />
                </View>
              ) : null}
              {finish ? (
                <View style={styles.block}>
                  <ThemedText type="small" themeColor="mutedForeground" style={styles.caption}>
                    Finish keepsake
                  </ThemedText>
                  <PixelSceneView art={finish} scale={fit(finish, inner, 3)} />
                </View>
              ) : null}
              {ownBackdrop ? (
                <View style={styles.block}>
                  <ThemedText type="small" themeColor="mutedForeground" style={styles.caption}>
                    Lesson backdrop
                  </ThemedText>
                  <PixelSceneView art={ownBackdrop} scale={fit(ownBackdrop, inner, 4)} />
                </View>
              ) : null}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

export default function DevLessonArt() {
  if (!__DEV__) return null;
  return (
    <LessonDesignProvider>
      <Gallery />
    </LessonDesignProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  chipRow: { flexGrow: 0 },
  chips: { gap: Spacing.two, paddingHorizontal: Spacing.four, paddingVertical: Spacing.two },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  list: { paddingHorizontal: Spacing.four, paddingBottom: 80 },
  row: { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: Spacing.four },
  block: { marginTop: Spacing.three, alignItems: 'center' },
  caption: { alignSelf: 'flex-start', marginBottom: 6 },
});
