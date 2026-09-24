import { StyleSheet, View } from 'react-native';
import Animated, { useReducedMotion, withSpring, withTiming } from 'react-native-reanimated';

import { Atlas } from '@/components/atlas';
import { ThemedText } from '@/components/themed-text';
import { FontSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Duration, Spring } from '@/shared/motion/tokens';

/** Atlas ARRIVES into the circle from 0.6 rather than growing out of a point at 0 (audit finding):
 *  0 reads as appearing from nothing, 0.6 gives the overshoot something to land on. */
function atlasArrive() {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ scale: 0.6 }] },
    animations: {
      opacity: withTiming(1, { duration: Duration.instant }),
      transform: [{ scale: withSpring(1, Spring.reward) }],
    },
  };
}

const WEEK_2 = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
export const STREAK_DOT = 34;

/**
 * The Today card's week. A done day holds Atlas in its circle and joins a tinted band with its
 * neighbours, so a run reads as one unbroken streak; today is a bright ring, the rest are grey.
 * Atlas springs in once when a day is earned (not on every mount -- `entering` only fires when
 * the node first appears, which is exactly the moment the day flips to done).
 */
export function WeekStreak({ isDone, todayIdx, onRowLayout }: {
  isDone: (i: number) => boolean;
  todayIdx: number;
  onRowLayout?: (x: number, y: number, w: number) => void;
}) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  return (
    <View style={styles.wkRow} onLayout={(e) => onRowLayout?.(e.nativeEvent.layout.x, e.nativeEvent.layout.y, e.nativeEvent.layout.width)}>
      {WEEK_2.map((d, i) => {
        const done = isDone(i);
        const today = i === todayIdx;
        const joinL = done && i > 0 && isDone(i - 1);
        const joinR = done && i < 6 && isDone(i + 1);
        return (
          <View
            key={d}
            accessible
            accessibilityLabel={`${d}, ${done ? 'streak day' : today ? 'today, not done yet' : 'not done'}`}
            style={styles.wkCell}>
            <ThemedText
              type={today ? 'smallBold' : 'small'}
              themeColor={today ? undefined : 'mutedForeground'}
              style={styles.wkLabel}>
              {d}
            </ThemedText>
            <View style={styles.wkSlot}>
              {done && (
                <View
                  style={[
                    styles.wkBand,
                    { backgroundColor: theme.primary + '26' },
                    joinL ? { left: 0 } : { left: '50%', marginLeft: -(STREAK_DOT / 2 + 3), borderTopLeftRadius: 99, borderBottomLeftRadius: 99 },
                    joinR ? { right: 0 } : { right: '50%', marginRight: -(STREAK_DOT / 2 + 3), borderTopRightRadius: 99, borderBottomRightRadius: 99 },
                  ]}
                />
              )}
              <View
                style={[
                  styles.wkDot,
                  done
                    ? { borderColor: theme.primary, backgroundColor: theme.card }
                    : { borderColor: today ? theme.text : theme.border },
                ]}>
                {done && (
                  <Animated.View entering={reduced ? undefined : atlasArrive}>
                    <Atlas size={24} expression="happy" accessibilityLabel="" />
                  </Animated.View>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wkRow: { flexDirection: 'row' },
  wkCell: { flex: 1, alignItems: 'center', gap: 8 },
  wkLabel: { fontSize: FontSize.label, lineHeight: 15 },
  wkSlot: { alignSelf: 'stretch', height: STREAK_DOT + 6, alignItems: 'center', justifyContent: 'center' },
  wkBand: { position: 'absolute', top: 0, bottom: 0 },
  wkDot: { width: STREAK_DOT, height: STREAK_DOT, borderRadius: STREAK_DOT / 2, borderWidth: 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
