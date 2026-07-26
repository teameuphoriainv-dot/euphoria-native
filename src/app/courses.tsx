/**
 * Courses — the catalog (Brilliant's Courses grid): tier chips + an illustrated vertical
 * pathway of the 12 real curriculum courses connected by a spine line. Push route; opened
 * from Learn. Tapping a course makes it the active pathway and returns to Learn.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/ambient-background';
import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { courseAccent } from '@/lib/course-accents';
import { COURSES, type TierLevel } from '@/lib/curriculum';
import { useApp } from '@/lib/store';
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

/** Curriculum tiers, in order, with the label the catalog shows. */
const TIERS: { tier: TierLevel; label: string }[] = [
  { tier: 'easy', label: 'Foundations' },
  { tier: 'intermediate', label: 'Intermediate' },
  { tier: 'advanced', label: 'Advanced' },
];

export default function Courses() {
  const theme = useTheme();
  const [tier, setTier] = useState<TierLevel>('easy');
  const setActiveCourse = useApp((s) => s.setActiveCourse);
  const completedLessons = useApp((s) => s.completedLessons);
  const shown = COURSES.filter((c) => c.tier === tier);

  const open = (id: string) => {
    setActiveCourse(id);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientBackground starCount={45} />

      <View style={styles.header}>
        <SpringPressable haptic={false} scaleTo={0.85} onPress={() => router.back()} style={styles.back}>
          <UIcon name="chevronLeft" size={22} color={theme.mutedForeground} />
        </SpringPressable>
        <ThemedText type="title" style={{ fontSize: 22 }}>Courses</ThemedText>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chips}>
        {TIERS.map((t) => {
          const active = t.tier === tier;
          return (
            <SpringPressable key={t.tier} haptic={false} scaleTo={0.94} onPress={() => setTier(t.tier)}>
              <View style={[styles.chip, { borderColor: active ? theme.primary : theme.border, backgroundColor: active ? theme.primary + '24' : 'transparent' }]}>
                <ThemedText type="smallBold" style={{ color: active ? theme.text : theme.mutedForeground, fontSize: 13 }}>{t.label}</ThemedText>
              </View>
            </SpringPressable>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.list} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          {/* spine line behind the icon column */}
          <View style={[styles.spine, { backgroundColor: theme.border }]} />
          {shown.map((c, i) => {
            const accent = courseAccent(c.id);
            const done = completedLessons.filter((id) => id.startsWith(`${c.id}:`)).length;
            const progress = c.totalLessons ? done / c.totalLessons : 0;
            return (
              <RiseIn key={c.id} delay={i * 55}>
                <SpringPressable onPress={() => open(c.id)}>
                  <Card style={styles.courseCard}>
                    <View style={[styles.bubble, { backgroundColor: accent + '1F', borderColor: theme.background }]}>
                      <Icon name={c.icon} size={40} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText type="heading" style={{ fontSize: 17 }}>{c.title}</ThemedText>
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
  bubble: { width: 64, height: 64, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
});
