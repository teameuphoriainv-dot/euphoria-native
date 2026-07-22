/**
 * Courses — the catalog (Brilliant's Courses grid): tier chips + an illustrated vertical
 * pathway of finance courses connected by a spine line. Push route; opened from Learn.
 * Mock progress until Phase 3 wires real pathway data.
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
import { RiseIn } from '@/shared/motion/rise-in';
import { SpringPressable } from '@/shared/motion/spring-pressable';

type Tier = 'Foundations' | 'Investing' | 'Advanced';

const COURSES: { tier: Tier; title: string; icon: string; lessons: number; progress: number }[] = [
  { tier: 'Foundations', title: 'Investing Fundamentals', icon: 'open-book', lessons: 25, progress: 0.32 },
  { tier: 'Foundations', title: 'Personal Finance', icon: 'money-bag', lessons: 25, progress: 0.6 },
  { tier: 'Foundations', title: 'Credit & Debt', icon: 'bank', lessons: 20, progress: 0.1 },
  { tier: 'Foundations', title: 'Budgeting Basics', icon: 'cash', lessons: 18, progress: 0 },
  { tier: 'Investing', title: 'How Markets Work', icon: 'trend-line', lessons: 25, progress: 0 },
  { tier: 'Investing', title: 'Diversification', icon: 'target', lessons: 22, progress: 0 },
  { tier: 'Investing', title: 'Behavioral Finance', icon: 'brain', lessons: 25, progress: 0 },
  { tier: 'Investing', title: 'Options & Derivatives', icon: 'diamond', lessons: 20, progress: 0 },
  { tier: 'Advanced', title: 'Corporate Finance', icon: 'building', lessons: 25, progress: 0 },
  { tier: 'Advanced', title: 'Quantitative Analysis', icon: 'analytics', lessons: 25, progress: 0 },
  { tier: 'Advanced', title: 'Risk Management', icon: 'lesson-shield', lessons: 22, progress: 0 },
  { tier: 'Advanced', title: 'Wealth Management', icon: 'crown', lessons: 25, progress: 0 },
];

const TIERS: Tier[] = ['Foundations', 'Investing', 'Advanced'];

export default function Courses() {
  const theme = useTheme();
  const [tier, setTier] = useState<Tier>('Foundations');
  const shown = COURSES.filter((c) => c.tier === tier);

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientBackground starCount={45} />

      <View style={styles.header}>
        <SpringPressable haptic={false} scaleTo={0.85} onPress={() => router.back()} style={styles.back}>
          <UIcon name="chevronLeft" size={22} color={theme.mutedForeground} />
        </SpringPressable>
        <ThemedText type="title" style={{ fontSize: 22 }}>Courses</ThemedText>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {TIERS.map((t) => {
          const active = t === tier;
          return (
            <SpringPressable key={t} haptic={false} scaleTo={0.94} onPress={() => setTier(t)}>
              <View style={[styles.chip, { borderColor: active ? theme.primary : theme.border, backgroundColor: active ? theme.primary + '24' : 'transparent' }]}>
                <ThemedText type="smallBold" style={{ color: active ? theme.text : theme.mutedForeground, fontSize: 13 }}>{t}</ThemedText>
              </View>
            </SpringPressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          {/* spine line behind the icon column */}
          <View style={[styles.spine, { backgroundColor: theme.border }]} />
          {shown.map((c, i) => (
            <RiseIn key={c.title} delay={i * 55}>
              <SpringPressable onPress={() => router.push('/lesson')}>
                <Card style={styles.courseCard}>
                  <View style={[styles.bubble, { backgroundColor: theme.primary + '18', borderColor: theme.background }]}>
                    <Icon name={c.icon} size={40} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="heading" style={{ fontSize: 17 }}>{c.title}</ThemedText>
                    <ThemedText type="small" themeColor="mutedForeground" style={{ marginTop: 2 }}>
                      {c.progress > 0 ? `${Math.round(c.progress * c.lessons)}/${c.lessons} lessons` : `${c.lessons} lessons`}
                    </ThemedText>
                    {c.progress > 0 && (
                      <View style={{ marginTop: Spacing.two }}>
                        <ProgressBar value={c.progress} height={5} />
                      </View>
                    )}
                  </View>
                  <UIcon name="chevronRight" size={16} color={theme.mutedForeground} strokeWidth={2.4} />
                </Card>
              </SpringPressable>
            </RiseIn>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.three, paddingTop: Spacing.one },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  chips: { gap: 8, paddingHorizontal: Spacing.three, paddingVertical: Spacing.three },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: Radius.pill, borderWidth: StyleSheet.hairlineWidth },
  content: { paddingHorizontal: Spacing.three, paddingBottom: BottomTabInset + Spacing.four, gap: Spacing.three },
  spine: { position: 'absolute', left: Spacing.three + 34, top: 40, bottom: 40, width: 2 },
  courseCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  bubble: { width: 64, height: 64, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
});
