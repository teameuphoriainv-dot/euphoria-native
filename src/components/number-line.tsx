/**
 * NumberLine — place-a-value-on-a-line lesson step. Tap the track to drop a marker; press
 * Check to validate against a hidden target within a tolerance. On a miss the true target is
 * revealed (green) with the delta so the learner can re-place. onSolvedChange(true) when the
 * placed value is within tolerance. Sibling to SliderPredict/MultiSelect.
 */
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { Duration } from '@/shared/motion/tokens';

export type NumberLineSpec = {
  prompt: string;
  min: number;
  max: number;
  target: number;
  tolerance: number;
  ticks?: number[];
  format?: (n: number) => string;
};

export function NumberLine({ spec, onSolvedChange }: { spec: NumberLineSpec; onSolvedChange: (solved: boolean) => void }) {
  const theme = useTheme();
  const fmt = spec.format ?? ((n: number) => String(Math.round(n)));
  const [width, setWidth] = useState(0);
  const [value, setValue] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  const pct = (v: number) => (v - spec.min) / (spec.max - spec.min);
  const solved = checked && value != null && Math.abs(value - spec.target) <= spec.tolerance;

  useEffect(() => {
    onSolvedChange(solved);
    if (solved) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [solved, onSolvedChange]);

  const place = (e: GestureResponderEvent) => {
    if (solved || width === 0) return;
    const x = Math.max(0, Math.min(width, e.nativeEvent.locationX));
    setValue(spec.min + (x / width) * (spec.max - spec.min));
    setChecked(false);
    Haptics.selectionAsync();
  };

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const readColor = value == null ? theme.mutedForeground : solved ? theme.success : theme.iconLilac;

  /**
   * Keyboard/assistive stepping.
   *
   * Placing a value here means tapping an exact x-coordinate, which a VoiceOver user cannot
   * do — and `gates()` blocks Continue on this step type, so without an alternative input a
   * screen-reader user could not finish the lesson AT ALL. This is a hard blocker, not a
   * missing label.
   *
   * The step is the spec's own tolerance, so stepping can always land inside the accepted
   * band; it is floored at 1% of the range so a tiny tolerance cannot demand hundreds of
   * increments.
   */
  const step = Math.max(spec.tolerance, (spec.max - spec.min) / 100);
  const nudge = (dir: 1 | -1) => {
    if (solved) return;
    const from = value ?? (spec.min + spec.max) / 2; // first action lands mid-range, not at an edge
    setValue(Math.max(spec.min, Math.min(spec.max, from + dir * step)));
    setChecked(false);
    Haptics.selectionAsync();
  };

  return (
    <View>
      <ThemedText type="title" style={{ marginBottom: Spacing.four }}>{spec.prompt}</ThemedText>

      {/* lineHeight pinned to the override. `display` supplies 40, and 40/34 = 1.18 sits under
          the 1.2 readability floor — the same class of defect that clipped before-after-slider
          at ratio 1.0. 42 restores 1.24. */}
      <ThemedText type="display" style={{ fontSize: 34, lineHeight: 42, color: readColor, textAlign: 'center', marginBottom: Spacing.four }}>
        {value == null ? 'Tap the line' : fmt(value)}
      </ThemedText>

      <Pressable
        onPress={place}
        onLayout={onLayout}
        style={styles.hit}
        // 'adjustable' is what this control actually is — a slider — and it is what makes
        // VoiceOver offer swipe-up/down as increment/decrement.
        accessibilityRole="adjustable"
        accessibilityLabel={spec.prompt}
        accessibilityHint="Swipe up or down to change the value, then activate Check."
        accessibilityValue={{
          min: Math.round(spec.min),
          max: Math.round(spec.max),
          now: value == null ? Math.round(spec.min) : Math.round(value),
          text: value == null ? 'No value placed yet' : fmt(value),
        }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => nudge(e.nativeEvent.actionName === 'decrement' ? -1 : 1)}>
        <View style={[styles.track, { backgroundColor: theme.muted }]}>
          {checked && !solved && (
            <View style={[styles.target, { left: `${pct(spec.target) * 100}%`, backgroundColor: theme.success }]} />
          )}
          {value != null && (
            <View style={[styles.marker, { left: `${pct(value) * 100}%`, backgroundColor: solved ? theme.success : theme.primary }]} />
          )}
        </View>
      </Pressable>

      {spec.ticks && (
        <View style={styles.ticks}>
          {spec.ticks.map((t) => (
            <ThemedText key={t} type="small" themeColor="mutedForeground" style={{ position: 'absolute', left: `${pct(t) * 100}%`, transform: [{ translateX: -12 }] }}>
              {fmt(t)}
            </ThemedText>
          ))}
        </View>
      )}

      {solved ? (
        <Animated.View entering={FadeIn} exiting={FadeOut.duration(Duration.exit)} style={{ marginTop: Spacing.four }}>
          <ThemedText type="smallBold" style={{ color: theme.success }}>Nailed it — {fmt(spec.target)}.</ThemedText>
        </Animated.View>
      ) : (
        <SpringPressable
          disabled={value == null}
          onPress={() => { setChecked(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          style={{ marginTop: Spacing.four }}
          accessibilityRole="button"
          // The visible label becomes the miss-feedback sentence after a wrong check, so the
          // accessible name is stated separately and stays stable.
          accessibilityLabel="Check your answer"
          accessibilityState={{ disabled: value == null }}
        >
          <View style={[styles.check, { backgroundColor: value != null ? theme.primary + '1F' : theme.muted, borderColor: value != null ? theme.primary + '4D' : theme.border }]}>
            <ThemedText type="smallBold" style={{ color: value != null ? theme.iconLilac : theme.mutedForeground }}>
              {checked && !solved ? `Off by ${fmt(Math.abs((value ?? 0) - spec.target))} — green is the target. Try again.` : 'Check'}
            </ThemedText>
          </View>
        </SpringPressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hit: { paddingVertical: 22 },
  track: { height: 8, borderRadius: 8, justifyContent: 'center' },
  marker: { position: 'absolute', width: 22, height: 22, borderRadius: 11, top: -7, transform: [{ translateX: -11 }], borderWidth: 3, borderColor: '#fff' },
  target: { position: 'absolute', width: 4, height: 22, borderRadius: 2, top: -7, transform: [{ translateX: -2 }] },
  ticks: { height: 18, position: 'relative', marginTop: 2 },
  check: { alignItems: 'center', paddingVertical: Spacing.two + 4, borderRadius: Radius.lg, borderWidth: 1 },
});
