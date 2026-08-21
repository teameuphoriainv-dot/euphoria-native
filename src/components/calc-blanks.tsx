/**
 * Type-the-number exercise. Check validates every blank against its own tolerance; on a miss the
 * true answer is revealed with the delta so the learner can correct it. onSolvedChange(true) only
 * when EVERY blank is inside its band. Sibling to NumberLine/TileBuilder.
 *
 * WHY A TEXT INPUT AND NOT A MULTIPLE CHOICE. The three `calculator` steps in the corpus rendered
 * as a title and their formula and nothing else — the blanks, which are the exercise, were dropped
 * by the `todo` default. The obvious cheap fix is to turn each blank into a choice, but that means
 * inventing distractors the author never wrote. THE DATA SAYS OTHERWISE: every blank carries a
 * `tolerance` — 0, 0.5, 0.01, 5, 2 across the three steps — and a tolerance is meaningless unless a
 * learner can type an arbitrary number. The author designed these for entry, so they get entry.
 *
 * INPUT IS NORMALISED, NOT INTERPRETED. `$`, `,`, `%` and whitespace are stripped before parsing,
 * because a learner answering "profit margin in percent" reasonably types "10%" and one answering
 * "in dollars" types "$751". Stripping punctuation the prompt itself invites is not the same as
 * guessing what a wrong answer meant — anything that does not parse to a finite number stays wrong.
 */
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type CalcSpec = {
  title: string;
  formula: string;
  blanks: { label: string; answer: number; tolerance: number }[];
};

/** `$1,331.50` and `10%` are the same number as `1331.5` and `10` for our purposes. */
function parseEntry(raw: string): number | null {
  const cleaned = raw.replace(/[$,%\s]/g, '');
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function CalcBlanks({ spec, onSolvedChange }: { spec: CalcSpec; onSolvedChange: (solved: boolean) => void }) {
  const theme = useTheme();
  const [entries, setEntries] = useState<string[]>(() => spec.blanks.map(() => ''));
  const [checked, setChecked] = useState(false);

  const results = useMemo(
    () => spec.blanks.map((b, i) => {
      const v = parseEntry(entries[i] ?? '');
      return { value: v, ok: v != null && Math.abs(v - b.answer) <= b.tolerance };
    }),
    [entries, spec.blanks],
  );
  const solved = checked && results.every((r) => r.ok);

  useEffect(() => {
    onSolvedChange(solved);
    if (solved) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [solved, onSolvedChange]);

  const setAt = (i: number, text: string) => {
    // Editing invalidates the previous verdict, exactly as NumberLine clears `checked` on a move —
    // otherwise a corrected answer keeps showing the old red until Check is pressed again.
    setChecked(false);
    setEntries((prev) => prev.map((v, n) => (n === i ? text : v)));
  };

  const canCheck = results.every((r) => r.value != null);

  return (
    <View style={{ gap: Spacing.three }}>
      <ThemedText type="title">{spec.title}</ThemedText>
      <Card style={{ gap: Spacing.two }}>
        <ThemedText type="body" themeColor="textSecondary">{spec.formula}</ThemedText>
      </Card>

      {spec.blanks.map((b, i) => {
        const r = results[i];
        const state = !checked ? 'idle' : r.ok ? 'ok' : 'miss';
        const border = state === 'ok' ? theme.success : state === 'miss' ? theme.destructive : theme.primary + '3D';
        return (
          <View key={i} style={{ gap: 6 }}>
            <ThemedText type="small" themeColor="mutedForeground">{b.label}</ThemedText>
            <TextInput
              value={entries[i]}
              onChangeText={(t) => setAt(i, t)}
              keyboardType="decimal-pad"
              // A learner typing a negative or decimal answer needs those keys; decimal-pad has
              // them on iOS and returnKeyType is irrelevant to a pad, so no submit handling here.
              placeholder="Your answer"
              placeholderTextColor={theme.mutedForeground}
              accessibilityLabel={b.label}
              style={[styles.input, { borderColor: border, color: theme.text, backgroundColor: theme.primary + '14' }]}
            />
            {state === 'miss' ? (
              // Reveal the true answer on a miss, as NumberLine does — a wrong number with no
              // target is a dead end, and these steps exist to teach the arithmetic.
              <ThemedText type="small" style={{ color: theme.destructive }}>
                {`Not quite — it is ${b.answer}${b.tolerance > 0 ? ` (within ${b.tolerance})` : ''}.`}
              </ThemedText>
            ) : null}
          </View>
        );
      })}

      <SpringPressable
        disabled={!canCheck}
        onPress={() => { setChecked(true); Haptics.selectionAsync(); }}
        style={[styles.check, { backgroundColor: canCheck ? theme.primary : theme.primary + '3D' }]}
      >
        <ThemedText type="smallBold" style={{ color: '#fff' }}>Check</ThemedText>
      </SpringPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    // 48 rather than 44: the input holds Dynamic Type text, and 44 clipped descenders at the
    // larger sizes this app is audited against.
    minHeight: 48,
    fontSize: FontSize.body,
  },
  check: { alignItems: 'center', justifyContent: 'center', minHeight: 48, borderRadius: Radius.md },
});
