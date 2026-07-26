/**
 * CourseRailCard — one tile in Learn's horizontal course rail (Brilliant's course strip).
 * Accent-tinted illustration bubble + title + lesson progress; the selected card gets an
 * accent ring and a lifted surface so the rail reads as a picker, not a list.
 */
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { CourseMeta } from '@/lib/curriculum';
import { courseAccent } from '@/lib/course-accents';
import { SpringPressable } from '@/shared/motion/spring-pressable';

export const RAIL_CARD_WIDTH = 132;
export const RAIL_CARD_HEIGHT = 150;
export const RAIL_CARD_GAP = Spacing.two;

export function CourseRailCard({
  course,
  selected,
  done,
  onPress,
}: {
  course: CourseMeta;
  selected: boolean;
  /** Lessons finished in this course. */
  done: number;
  onPress: () => void;
}) {
  const theme = useTheme();
  const accent = courseAccent(course.id);
  const total = course.totalLessons;

  return (
    <SpringPressable scaleTo={0.94} onPress={onPress}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: selected ? accent + '1A' : theme.card,
            borderColor: selected ? accent : theme.border,
            borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
          },
        ]}>
        <View style={[styles.bubble, { backgroundColor: accent + '24' }]}>
          <Icon name={course.icon} size={30} opacity={selected ? 1 : 0.85} />
        </View>
        <ThemedText
          type="smallBold"
          numberOfLines={2}
          style={{ color: selected ? theme.text : theme.textSecondary }}>
          {course.title}
        </ThemedText>
        <View style={styles.progress}>
          <ThemedText type="label" style={{ color: selected ? accent : theme.mutedForeground }}>
            {done}/{total}
          </ThemedText>
          <View style={styles.track}>
            <ProgressBar value={total ? done / total : 0} height={4} tone={accent} />
          </View>
        </View>
      </View>
    </SpringPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: RAIL_CARD_WIDTH,
    height: RAIL_CARD_HEIGHT,
    borderRadius: Radius.lg,
    padding: Spacing.two + Spacing.half,
    justifyContent: 'space-between',
  },
  bubble: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  progress: { gap: Spacing.one },
  track: { flexDirection: 'row' },
});
