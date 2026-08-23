/**
 * MatchingPairs — connect left terms to right definitions. Tap a term, then tap its match;
 * a correct pair locks green, a wrong tap flashes amber and clears. The right column is
 * shuffled once on mount. onSolvedChange(true) when every pair is matched. Sibling to
 * OrderSteps/MultiSelect.
 */
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { UIcon } from '@/components/ui-icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Duration } from '@/shared/motion/tokens';
import { SpringPressable } from '@/shared/motion/spring-pressable';

export type MatchSpec = { title: string; pairs: { left: string; right: string }[] };

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};


/**
 * One term/definition cell, whose border animates between three states instead of cutting.
 *
 * The border colour and width carried ALL the matched/selected signal and changed on a single
 * frame — 0ms, far below R1's p10 of 130ms, on the moment the learner succeeds. `stage` is
 * 0 idle, 1 accented (selected on the left, wrong on the right), 2 matched.
 *
 * BACKGROUND TINT IS LEFT INSTANT, deliberately. The tints are 8-digit hex (`theme.primary +
 * '14'`) and `interpolateColor`'s handling of an alpha channel in hex is not something this
 * audit can verify from here. The border is what carries the meaning; animating it and leaving
 * the tint is a smaller, checkable change than animating both and guessing.
 */
function MatchCell({
  stage,
  accent,
  tint,
  children,
}: {
  stage: 0 | 1 | 2;
  accent: string;
  tint: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const t = useSharedValue(stage);
  useEffect(() => {
    t.set(withTiming(stage, { duration: Duration.fast }));
  }, [stage, t]);
  const style = useAnimatedStyle(() => ({
    borderColor: interpolateColor(t.get(), [0, 1, 2], [theme.border, accent, theme.success]),
    borderWidth: interpolate(t.get(), [0, 1, 2], [StyleSheet.hairlineWidth, 2, 2]),
  }));
  return <Animated.View style={[styles.cell, { backgroundColor: tint }, style]}>{children}</Animated.View>;
}

export function MatchingPairs({ spec, onSolvedChange }: { spec: MatchSpec; onSolvedChange: (solved: boolean) => void }) {
  const theme = useTheme();
  const [rightOrder] = useState(() => shuffle(spec.pairs.map((_, i) => i)));
  const [selected, setSelected] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);

  const solved = matched.length === spec.pairs.length;

  useEffect(() => {
    onSolvedChange(solved);
    if (solved) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [solved, onSolvedChange]);

  const tapLeft = (i: number) => {
    if (matched.includes(i)) return;
    Haptics.selectionAsync();
    setWrong(null);
    setSelected(i);
  };

  const tapRight = (j: number) => {
    if (matched.includes(j) || selected == null) return;
    if (j === selected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setMatched((m) => [...m, selected]);
      setSelected(null);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setWrong(j);
      setSelected(null);
      setTimeout(() => setWrong(null), 500);
    }
  };

  return (
    <View>
      <ThemedText type="title" style={{ marginBottom: Spacing.two }}>{spec.title}</ThemedText>
      <ThemedText type="small" themeColor="mutedForeground" style={{ marginBottom: Spacing.four }}>
        Tap a term, then tap its match.
      </ThemedText>

      <View style={styles.cols}>
        <View style={styles.col}>
          {spec.pairs.map((p, i) => {
            const isMatched = matched.includes(i);
            const isSel = selected === i;
            return (
              <SpringPressable
                key={p.left}
                disabled={isMatched}
                onPress={() => tapLeft(i)}
                // Selection and matched-ness were carried only by border colour and a tick
                // glyph. Without them announced, a screen-reader user cannot tell which term
                // is currently picked up or which pairs are already done.
                accessibilityRole="button"
                accessibilityLabel={p.left}
                accessibilityState={{ selected: isSel, disabled: isMatched }}
                accessibilityHint={isMatched ? undefined : 'Activate, then choose its definition.'}>
                <MatchCell
                  stage={isMatched ? 2 : isSel ? 1 : 0}
                  accent={theme.primary}
                  tint={isSel ? theme.primary + '14' : theme.card}>
                  <ThemedText type="bodyMedium" style={{ flex: 1 }}>{p.left}</ThemedText>
                  {/* FADES IN. This was `{isMatched && <UIcon …/>}` — a 0ms appearance on the
                      most satisfying moment in the step, well below R1's p10 of 130ms, while
                      sibling step kinds (`order-steps`, `multi-select`) animate their state
                      change. A fade and not a scale: motion-invariant 1 forbids a scale-pop on
                      ordinary interaction, which is the rule protecting the defect the owner
                      originally reported. */}
                  {isMatched && (
                    <Animated.View entering={FadeIn.duration(Duration.fast)}>
                      <UIcon name="check" size={16} color={theme.success} strokeWidth={3} />
                    </Animated.View>
                  )}
                </MatchCell>
              </SpringPressable>
            );
          })}
        </View>

        <View style={styles.col}>
          {rightOrder.map((j) => {
            const isMatched = matched.includes(j);
            const isWrong = wrong === j;
            return (
              <SpringPressable
                key={spec.pairs[j].right}
                disabled={isMatched}
                onPress={() => tapRight(j)}
                accessibilityRole="button"
                accessibilityLabel={spec.pairs[j].right}
                accessibilityState={{ disabled: isMatched }}
                accessibilityHint={isMatched ? undefined : 'Activate to match this with the selected term.'}>
                <MatchCell
                  stage={isMatched ? 2 : isWrong ? 1 : 0}
                  accent={theme.warning}
                  tint={isMatched ? theme.success + '14' : theme.card}>
                  <ThemedText type="small" style={{ flex: 1 }}>{spec.pairs[j].right}</ThemedText>
                  {/* FADES IN. This was `{isMatched && <UIcon …/>}` — a 0ms appearance on the
                      most satisfying moment in the step, well below R1's p10 of 130ms, while
                      sibling step kinds (`order-steps`, `multi-select`) animate their state
                      change. A fade and not a scale: motion-invariant 1 forbids a scale-pop on
                      ordinary interaction, which is the rule protecting the defect the owner
                      originally reported. */}
                  {isMatched && (
                    <Animated.View entering={FadeIn.duration(Duration.fast)}>
                      <UIcon name="check" size={16} color={theme.success} strokeWidth={3} />
                    </Animated.View>
                  )}
                </MatchCell>
              </SpringPressable>
            );
          })}
        </View>
      </View>

      {solved && (
        <ThemedText type="smallBold" style={{ color: theme.success, marginTop: Spacing.three }}>All matched. Nicely done.</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cols: { flexDirection: 'row', gap: Spacing.two + 4 },
  col: { flex: 1, gap: Spacing.two + 4 },
  cell: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, padding: Spacing.three, borderRadius: Radius.lg, minHeight: 64 },
});
