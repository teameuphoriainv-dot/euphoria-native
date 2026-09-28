/**
 * MatchingPairs — connect left terms to right definitions. Tap a term, then tap its match;
 * a correct pair locks green, a wrong tap flashes amber and clears. The right column is
 * shuffled once on mount. onSolvedChange(true) when every pair is matched. Sibling to
 * OrderSteps/MultiSelect.
 */
import { feedback } from '@/lib/feedback';
import * as Haptics from '@/lib/haptics';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { useLessonStepState } from '@/components/lesson-step-session';
import { Button } from '@/components/ui/button';
import { UIcon } from '@/components/ui-icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { matchingPairsEscape, nextMatchingWrongAttempts } from '@/lib/matching-pairs-model';
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
    opacity: interpolate(t.get(), [0, 1, 2], [1, 1, 0.6]),
  }));
  return <Animated.View style={[styles.cell, { backgroundColor: tint }, style]}>{children}</Animated.View>;
}

export function MatchingPairs({
  spec,
  onSolvedChange,
  onComplete,
}: {
  spec: MatchSpec;
  onSolvedChange: (solved: boolean) => void;
  onComplete: (passed: boolean) => void;
}) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const [rightOrder] = useLessonStepState<number[]>('match.rightOrder', () => shuffle(spec.pairs.map((_, i) => i)));
  const [selected, setSelected] = useLessonStepState<number | null>('match.selected', null);
  const [matched, setMatched] = useLessonStepState<number[]>('match.matched', []);
  // Right cells are tracked separately because these exercises are MANY-TO-ONE, not a
  // bijection: four account types sort into two categories, six statements into two.
  // A single index list cannot express "this left is done AND that right cell is used".
  const [matchedRight, setMatchedRight] = useLessonStepState<number[]>('match.matchedRight', []);
  const [wrong, setWrong] = useLessonStepState<number | null>('match.wrong', null);
  const [wrongAttempts, setWrongAttempts] = useLessonStepState('match.wrongAttempts', 0);

  const solved = matched.length === spec.pairs.length;
  const escape = matchingPairsEscape(wrongAttempts, matched.length, spec.pairs.length);

  const wasSolved = useRef(solved);
  useEffect(() => {
    onSolvedChange(solved);
    // The whole board done is the right answer: confetti, chime and buzz, once, not on a restore.
    if (solved && !wasSolved.current) feedback('correct');
    wasSolved.current = solved;
  }, [solved, onSolvedChange]);

  const tapLeft = (i: number) => {
    if (matched.includes(i)) return;
    Haptics.selectionAsync();
    setWrong(null);
    setSelected(i);
  };

  const tapRight = (j: number) => {
    if (matchedRight.includes(j) || selected == null) return;
    // MATCH ON TEXT, NOT INDEX. `Debit (left side)` legitimately appears twice, so index equality
    // marked a visually identical, semantically correct answer WRONG -- the learner lost a heart on
    // a coin flip with nothing on screen to tell the two cells apart, and the step could never be
    // completed. Any cell carrying the selected term's category is a correct answer.
    if (spec.pairs[j].right === spec.pairs[selected].right) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setMatched((m) => [...m, selected]);
      setMatchedRight((r) => [...r, j]);
      setSelected(null);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setWrongAttempts(nextMatchingWrongAttempts);
      setWrong(j);
      setSelected(null);
      setTimeout(() => setWrong(null), 500);
    }
  };

  return (
    <View>
      <ThemedText type="label" style={{ color: theme.primary, marginBottom: Spacing.two }}>✦ MATCH THE PAIRS</ThemedText>
      <ThemedText type="title" style={{ marginBottom: Spacing.two }}>{spec.title}</ThemedText>
      <ThemedText type="small" themeColor="mutedForeground" style={{ marginBottom: Spacing.three }}>
        {matched.length} of {spec.pairs.length} matched · Tap a term, then tap its match.
      </ThemedText>

      {/* ROWS, NOT COLUMNS. This rendered every term stacked in one column and every match
          stacked below it at a fixed 90pt: four pairs made eight tall cards, the matches sat
          below the fold, and the learner scrolled away from a term to find its match. The owner
          called it "really weird" (2026-09-28). Row i pairs left term i with shuffled right cell
          rightOrder[i]; the row stretches both cells to the taller one, so a long definition
          grows its row instead of clipping, and the whole board fits on one phone screen. */}
      <View style={styles.board}>
        {spec.pairs.map((p, i) => {
          const isLeftMatched = matched.includes(i);
          const isSel = selected === i;
          const j = rightOrder[i];
          const right = j == null ? undefined : spec.pairs[j];
          const isRightMatched = j != null && matchedRight.includes(j);
          const isWrong = j != null && wrong === j;
          return (
            <View key={`row-${String(i)}`} style={styles.row}>
              <SpringPressable
                // Index-qualified: three authored steps repeat an option's text (for example
                // `Credit (right side)` twice in The Language of Accounting), and a bare
                // content key made React reconcile them as one child -- a console error on
                // every render, and LogBox covering the whole step in dev.
                key={`${String(i)}-${p.left}`}
                style={styles.slot}
                disabled={isLeftMatched}
                onPress={() => tapLeft(i)}
                // Selection and matched-ness were carried only by border colour and a tick
                // glyph. Without them announced, a screen-reader user cannot tell which term
                // is currently picked up or which pairs are already done.
                accessibilityRole="button"
                accessibilityLabel={p.left}
                accessibilityState={{ selected: isSel, disabled: isLeftMatched }}
                accessibilityHint={isLeftMatched ? undefined : 'Activate, then choose its definition.'}>
                <MatchCell
                  stage={isLeftMatched ? 2 : isSel ? 1 : 0}
                  accent={theme.primary}
                  tint={isSel ? theme.primary + '14' : theme.card}>
                  <ThemedText type="bodyMedium" style={styles.text}>{p.left}</ThemedText>
                  {/* FADES IN. This was `{isMatched && <UIcon …/>}` — a 0ms appearance on the
                      most satisfying moment in the step, well below R1's p10 of 130ms, while
                      sibling step kinds (`order-steps`, `multi-select`) animate their state
                      change. A fade and not a scale: motion-invariant 1 forbids a scale-pop on
                      ordinary interaction, which is the rule protecting the defect the owner
                      originally reported. */}
                  {isLeftMatched && (
                    <Animated.View entering={reduced ? undefined : FadeIn.duration(Duration.fast)}>
                      <UIcon name="check" size={16} color={theme.success} strokeWidth={3} />
                    </Animated.View>
                  )}
                </MatchCell>
              </SpringPressable>

              {j == null || !right ? (
                <View style={styles.slot} />
              ) : (
                <SpringPressable
                  key={`${String(j)}-${right.right}`}
                  style={styles.slot}
                  disabled={isRightMatched}
                  onPress={() => tapRight(j)}
                  accessibilityRole="button"
                  accessibilityLabel={right.right}
                  accessibilityState={{ disabled: isRightMatched }}
                  accessibilityHint={isRightMatched ? undefined : 'Activate to match this with the selected term.'}>
                  <MatchCell
                    stage={isRightMatched ? 2 : isWrong ? 1 : 0}
                    accent={theme.destructive}
                    tint={isRightMatched ? theme.success + '14' : theme.card}>
                    <ThemedText type="small" style={styles.text}>{right.right}</ThemedText>
                    {/* Fades in for the same reason as the left tick above. */}
                    {isRightMatched && (
                      <Animated.View entering={reduced ? undefined : FadeIn.duration(Duration.fast)}>
                        <UIcon name="check" size={16} color={theme.success} strokeWidth={3} />
                      </Animated.View>
                    )}
                  </MatchCell>
                </SpringPressable>
              )}
            </View>
          );
        })}
      </View>

      {solved && (
        <ThemedText type="smallBold" style={{ color: theme.success, marginTop: Spacing.three }}>All matched. Nicely done.</ThemedText>
      )}

      {escape && (
        <Animated.View
          entering={reduced ? undefined : FadeIn.duration(Duration.fast)}
          style={styles.escape}>
          <ThemedText
            accessibilityLiveRegion="polite"
            type="small"
            themeColor="mutedForeground"
            style={styles.escapeMessage}>
            {escape.message}
          </ThemedText>
          <Button
            label={escape.cta}
            variant="ghost"
            onPress={() => onComplete(escape.passed)}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  board: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'stretch', gap: 10 },
  slot: { flex: 1 },
  cell: { flex: 1, minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, borderWidth: 2 },
  text: { flex: 1 },
  escape: { alignItems: 'center', gap: Spacing.one, marginTop: Spacing.four },
  escapeMessage: { textAlign: 'center' },
});
