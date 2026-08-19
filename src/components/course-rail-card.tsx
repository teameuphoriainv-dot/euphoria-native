/**
 * CourseRailCard — one tile in Learn's horizontal course rail (Brilliant's course strip).
 * An authored, accent-tinted CourseMark sitting directly on the card + title + lesson progress;
 * the selected card gets an accent ring and a lifted surface so the rail reads as a picker, not a
 * list. There is deliberately no tinted chip behind the mark — see the note at the call site.
 */
import { StyleSheet, View } from 'react-native';

import { CourseMark } from '@/components/art/course-mark';
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
        {/*
          * NO tinted square behind the mark, and no opacity dimming. The chip was
          * `accent + '24'` — 14% alpha over a 9%-lightness card — which composited a vivid
          * #34D399 down to rgb(25,48,43): ~17 per channel from the card behind it. Muddy.
          * you.tsx already reached this conclusion for the stat tiles and says so at its call
          * site; the rail simply never got the change.
          *
          * The accent is not lost by removing the wash — it moved INTO the mark, which is
          * stroke-only and tinted by courseAccent. Shape and colour now both differentiate,
          * which the old EUPHORIA_ICONS could not do (four course icons shared one indigo).
          */}
        <CourseMark id={course.id} size={40} />
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
    justifyContent: 'space-between', gap: Spacing.two,
  },
  progress: { gap: Spacing.one },
  track: { flexDirection: 'row' },
});
