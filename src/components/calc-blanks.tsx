/**
 * Type-the-number exercise. This intentionally follows the canonical web calculator: Check locks
 * every field, reveals per-row results and a summary, then completes after the same 1.4 second beat.
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
import { useMemo } from 'react';
import { InputAccessoryView, Keyboard, Platform, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { useLessonStepState } from '@/components/lesson-step-session';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { Fonts, FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type CalcSpec = {
  title: string;
  formula: string;
  blanks: { label: string; answer: number; tolerance: number }[];
};

const CALC_KEYBOARD_ACCESSORY_ID = 'lesson-calc-keyboard-actions';

/** `$1,331.50` and `10%` are the same number as `1331.5` and `10` for our purposes. */
function parseEntry(raw: string): number | null {
  const cleaned = raw.replace(/[$,%\s]/g, '');
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function CalcBlanks({ spec, onComplete }: { spec: CalcSpec; onComplete: (correct: boolean) => void }) {
  const theme = useTheme();
  const [entries, setEntries] = useLessonStepState<string[]>('calc.entries', () => spec.blanks.map(() => ''));
  const [checked, setChecked] = useLessonStepState('calc.checked', false);

  const results = useMemo(
    () => spec.blanks.map((b, i) => {
      const v = parseEntry(entries[i] ?? '');
      return { value: v, ok: v != null && Math.abs(v - b.answer) <= b.tolerance };
    }),
    [entries, spec.blanks],
  );
  const setAt = (i: number, text: string) => {
    if (checked) return;
    setEntries((prev) => prev.map((v, n) => (n === i ? text : v)));
  };

  const canCheck = results.every((r) => r.value != null);

  return (
    <View style={styles.root}>
      <ThemedText type="heading" style={styles.title}>{spec.title}</ThemedText>
      <Card style={styles.formulaCard}>
        <ThemedText type="code" style={styles.formula}>{spec.formula}</ThemedText>
      </Card>

      <View style={styles.rows}>
        {spec.blanks.map((b, i) => {
          const r = results[i];
          const state = !checked ? 'idle' : r.ok ? 'ok' : 'miss';
          const border = state === 'ok' ? theme.success : state === 'miss' ? theme.destructive : theme.border + '4D';
          const background = state === 'ok' ? theme.success + '1A' : state === 'miss' ? theme.destructive + '1A' : theme.card;
          return (
          <View key={i} style={[styles.row, { borderColor: border, backgroundColor: background }]}>
            <ThemedText type="smallBold" style={styles.rowLabel}>{b.label}</ThemedText>
            <TextInput
              value={entries[i]}
              onChangeText={(t) => setAt(i, t)}
              editable={!checked}
              keyboardType="decimal-pad"
              // Decimal-pad has no Return key on iOS, so the shared InputAccessoryView below is
              // the only explicit way to dismiss it without hunting for empty space.
              inputAccessoryViewID={Platform.OS === 'ios' ? CALC_KEYBOARD_ACCESSORY_ID : undefined}
              placeholder="0"
              placeholderTextColor={theme.mutedForeground}
              accessibilityLabel={b.label}
              style={[styles.input, { borderColor: theme.border + '66', color: theme.text, backgroundColor: theme.background }]}
            />
            {checked ? (
              <ThemedText type="smallBold" style={[styles.result, { color: r.ok ? theme.success : theme.destructive }]}>
                {r.ok ? '✓' : `→ ${String(b.answer)}`}
              </ThemedText>
            ) : null}
          </View>
          );
        })}
      </View>

      {!checked ? (
        <SpringPressable
          disabled={!canCheck}
          onPress={() => {
            if (!canCheck || checked) return;
            Keyboard.dismiss();
            setChecked(true);
            const allCorrect = results.every((r) => r.ok);
            void Haptics.notificationAsync(
              allCorrect ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
            );
            setTimeout(() => onComplete(allCorrect), 1400);
          }}
          style={[styles.check, { backgroundColor: canCheck ? theme.primary : theme.primary + '3D' }]}
        >
          <ThemedText type="smallBold" style={{ color: '#fff' }}>Check Answers</ThemedText>
        </SpringPressable>
      ) : (
        <ThemedText
          type="smallBold"
          style={[styles.summary, { color: results.every((r) => r.ok) ? theme.success : theme.destructive }]}
        >
          {results.every((r) => r.ok)
            ? 'All values correct!'
            : `${String(results.filter((r) => r.ok).length)} of ${spec.blanks.length} correct`}
        </ThemedText>
      )}

      {Platform.OS === 'ios' ? (
        <InputAccessoryView nativeID={CALC_KEYBOARD_ACCESSORY_ID}>
          <View style={[styles.accessory, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
            <SpringPressable
              haptic={false}
              accessibilityLabel="Done typing"
              onPress={() => Keyboard.dismiss()}
              style={styles.doneAction}
            >
              <ThemedText type="bodyMedium" style={{ color: theme.iconLilac }}>Done</ThemedText>
            </SpringPressable>
          </View>
        </InputAccessoryView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.three, width: '100%' },
  title: { textAlign: 'center' },
  formulaCard: { padding: 20 },
  formula: { textAlign: 'center', lineHeight: 20 },
  rows: { gap: 12, width: '100%' },
  row: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: 2,
    borderRadius: Radius.lg,
  },
  rowLabel: { flex: 1 },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    width: 116,
    minHeight: 42,
    paddingHorizontal: 12,
    fontFamily: Fonts.mono,
    fontSize: FontSize.small,
    textAlign: 'right',
  },
  result: { minWidth: 30, textAlign: 'right' },
  check: { alignSelf: 'center', alignItems: 'center', justifyContent: 'center', minWidth: 160, minHeight: 48, borderRadius: Radius.md, paddingHorizontal: 24 },
  summary: { textAlign: 'center' },
  accessory: { minHeight: 46, borderTopWidth: StyleSheet.hairlineWidth, alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: Spacing.three },
  doneAction: { minWidth: 64, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
