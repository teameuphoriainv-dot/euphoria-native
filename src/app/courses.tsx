/**
 * Courses — the catalog (Brilliant's Courses grid): tier chips + an illustrated vertical
 * pathway of the 12 real curriculum courses connected by a spine line. Push route; opened
 * from Learn. Tapping a course makes it the active pathway and returns to Learn.
 */
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { CourseMark } from '@/components/art/course-mark';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { BottomTabInset, Radius, Spacing, FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { courseAccent } from '@/lib/course-accents';

import { COURSES, type TierLevel } from '@/lib/curriculum';
import { useApp } from '@/lib/store';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { STAGGER_CAP } from '@/shared/motion/tokens';

/** Curriculum tiers, in order, with the label the catalog shows. */
const TIERS: { tier: TierLevel; label: string }[] = [
  { tier: 'easy', label: 'Foundations' },
  { tier: 'intermediate', label: 'Intermediate' },
  { tier: 'advanced', label: 'Advanced' },
];

export default function Courses() {
  const theme = useTheme();
  /*
   * ALL TWELVE COURSES, GROUPED BY TIER — the chips jump, they no longer filter.
   *
   * This file's own docstring describes "a pathway of the 12 real curriculum courses connected
   * by a spine line", and the spine is drawn as one continuous rail. Filtering contradicted
   * both: 'easy' holds 3 of the 12, so the default view was three cards above roughly half a
   * screen of empty black — measured at literally 0% motion across the bottom four rows of an
   * 8x4 grid, because there was nothing there to move.
   *
   * `tier` now tracks which chip is highlighted and which section to scroll to, not what to
   * render. Nothing is hidden from a learner deciding what to study next.
   */
  const [tier, setTier] = useState<TierLevel>('easy');
  const scrollRef = useRef<ScrollView>(null);
  const innerRef = useRef<View>(null);
  const sectionRefs = useRef<Record<string, View | null>>({});
  /*
   * MEASURED AT TAP TIME, not cached from onLayout. Caching the layout y put the ADVANCED
   * header 227pt below the top of the viewport, so tapping "Advanced" left an INTERMEDIATE
   * course on screen: onLayout fires before RiseIn's entering animation settles, so the cached
   * value is a pre-animation position. measureLayout against the content view reads the real one.
   */
  const jump = (t: TierLevel) => {
    setTier(t);
    const node = sectionRefs.current[t];
    const inner = innerRef.current;
    if (!node || !inner) return;
    node.measureLayout(
      inner as never,
      (_x: number, y: number) => scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: true }),
      () => {},
    );
  };
  const setActiveCourse = useApp((s) => s.setActiveCourse);
  const completedLessons = useApp((s) => s.completedLessons);

  const open = (id: string) => {
    setActiveCourse(id);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientBackground starCount={45} />

      <View style={styles.header}>
        <SpringPressable haptic={false} scaleTo={0.85} onPress={() => router.back()} style={styles.back} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back">
          <UIcon name="chevronLeft" size={22} color={theme.mutedForeground} />
        </SpringPressable>
        <ThemedText type="title" style={{ fontSize: FontSize.titleSm }}>Courses</ThemedText>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chips}>
        {TIERS.map((t) => {
          const active = t.tier === tier;
          return (
            <SpringPressable key={t.tier} haptic={false} scaleTo={0.94} onPress={() => jump(t.tier)}>
              <View style={[styles.chip, { borderColor: active ? theme.primary : theme.border, backgroundColor: active ? theme.primary + '24' : 'transparent' }]}>
                <ThemedText type="smallBold" style={{ color: active ? theme.text : theme.mutedForeground, fontSize: FontSize.small }}>{t.label}</ThemedText>
              </View>
            </SpringPressable>
          );
        })}
      </ScrollView>

      <ScrollView ref={scrollRef} style={styles.list} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View ref={innerRef}>
          {/* spine line behind the icon column */}
          <View style={[styles.spine, { backgroundColor: theme.border }]} />
          {TIERS.map((t, ti) => {
            const group = COURSES.filter((c) => c.tier === t.tier);
            if (!group.length) return null;
            return (
              <View
                key={t.tier}
                ref={(r) => { sectionRefs.current[t.tier] = r; }}>
                <ThemedText
                  type="label"
                  themeColor="mutedForeground"
                  style={{ marginTop: ti === 0 ? 0 : Spacing.four, marginBottom: Spacing.two }}>
                  {t.label.toUpperCase()}
                </ThemedText>
                {group.map((c, i) => {
                  const accent = courseAccent(c.id);
                  const done = completedLessons.filter((id) => id.startsWith(`${c.id}:`)).length;
                  const progress = c.totalLessons ? done / c.totalLessons : 0;
                  return (
                    <RiseIn key={c.id} delay={Math.min((ti * 3 + i) * 55, STAGGER_CAP)}>
                      <SpringPressable onPress={() => open(c.id)}>
                        <Card style={styles.courseCard}>
                          <View style={styles.markSlot}>
                            <CourseMark id={c.id} size={52} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <ThemedText type="heading" style={{ fontSize: FontSize.bodyLg }}>{c.title}</ThemedText>
                            <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 2 }} numberOfLines={2}>
                              {done > 0 ? `${done}/${c.totalLessons} lessons` : `${c.totalLessons} lessons`}
                            </ThemedText>
                            {done > 0 && (
                              <View style={{ marginTop: Spacing.two }}>
                                <ProgressBar value={progress} height={5} tone={accent} />
                              </View>
                            )}
                          </View>
                          <UIcon name="chevronRight" size={16} color={theme.mutedForeground} strokeWidth={2.4} />
                        </Card>
                      </SpringPressable>
                    </RiseIn>
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.three, paddingTop: Spacing.one },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  // RN gives ScrollView flexGrow:1 — without this the chip row stretches and pushes the list down
  chipsScroll: { flexGrow: 0, flexShrink: 0 },
  chips: { gap: 8, paddingHorizontal: Spacing.three, paddingVertical: Spacing.three },
  list: { flex: 1 },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: Radius.pill, borderWidth: StyleSheet.hairlineWidth },
  content: { paddingHorizontal: Spacing.three, paddingBottom: BottomTabInset + Spacing.four, gap: Spacing.three },
  spine: { position: 'absolute', left: Spacing.three + 34, top: 40, bottom: 40, width: 2 },
  courseCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  // Fixed slot so titles stay aligned down the column even though marks differ in visual weight.
  markSlot: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
});
