/**
 * OrderSteps — arrange rows into the correct sequence by tapping two of them to swap. The
 * list starts DERANGED (no row is ever in its correct slot); each row shows its position number. A row sitting
 * in its correct slot gets a green accent + check; onSolvedChange(true) when the whole order
 * matches. Sibling to MatchingPairs/MultiSelect.
 */
import * as Haptics from '@/lib/haptics';
import { useEffect } from 'react';
import { LinearTransition } from 'react-native-reanimated';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useLessonStepState } from '@/components/lesson-step-session';
import { UIcon } from '@/components/ui-icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { Spring } from '@/shared/motion/tokens';

export type OrderSpec = { title: string; hint?: string; items: string[] };

/**
 * A DERANGEMENT — a permutation in which NOTHING sits in its own place.
 *
 * FIXED 2026-08-22. Reported: "the drag-to-order steps sometimes load with answers already in the
 * correct position (e.g., step 3 correct one time, steps 4 & 5 correct another time). None of them
 * should ever start in the correct spot. Confirmed happening across every lesson."
 *
 * The old guard was `while (a.every((v, i) => v === i))`, which only rejects the ONE arrangement
 * where the whole list is already solved. That is a much weaker condition than it looks. A uniform
 * random permutation has, by linearity of expectation, exactly ONE fixed point on average
 * regardless of n — each of the n positions is its own with probability 1/n. So the previous code
 * shipped, on average, one row already in place, and this component paints a row in its correct
 * slot with a green accent and a check. The lesson was marking a step correct before the learner
 * had touched it, on roughly every question. That is why it reproduced "across every lesson".
 *
 * Rejection-sampling for a full derangement is the right cost: derangements are D(n)/n! -> 1/e of
 * all permutations, so this loop runs ~e = 2.72 times on average and is O(n) per attempt, for
 * lists of 3-6 rows. No closed-form generator is worth the extra code at this size.
 *
 * n <= 1 still returns early. It is not a shortcut — D(1) = 0, there is NO derangement of one
 * element, so the loop below would never terminate.
 */
const shuffledOrder = (n: number): number[] => {
  const a = Array.from({ length: n }, (_, i) => i);
  if (n <= 1) return a;
  do {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  } while (a.some((v, i) => v === i));
  return a;
};

export function OrderSteps({ spec, onSolvedChange }: { spec: OrderSpec; onSolvedChange: (solved: boolean) => void }) {
  const theme = useTheme();
  const [order, setOrder] = useLessonStepState<number[]>('order.order', () => shuffledOrder(spec.items.length));
  const [selected, setSelected] = useLessonStepState<number | null>('order.selected', null);

  const solved = order.every((v, i) => v === i);

  useEffect(() => {
    onSolvedChange(solved);
    if (solved) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [solved, onSolvedChange]);

  const tap = (pos: number) => {
    if (solved) return;
    if (selected === null) {
      Haptics.selectionAsync();
      setSelected(pos);
      return;
    }
    if (selected === pos) {
      setSelected(null);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOrder((prev) => {
      const next = [...prev];
      [next[selected], next[pos]] = [next[pos], next[selected]];
      return next;
    });
    setSelected(null);
  };

  /**
   * DENSITY SCALES WITH ITEM COUNT.
   *
   * At the default 16pt row padding and 12pt gaps, six two-line rows plus the heading run ~620pt
   * — which is exactly the space between the lesson body's top and the pinned Continue button.
   * Measured on device, a 6-item step put its last row at top=717..bottom=796 against a footer at
   * top=760: 36pt of the row underneath the CTA, and because the footer paints last it swallowed
   * the taps. Since the last row is usually one you have to move, the step could not be finished
   * without a scroll the UI never asked for.
   *
   * Padding the scroll container only added room BELOW the content; it could not pull the rows up.
   * Tightening the rows themselves is what actually fits them. Short steps keep the roomy
   * treatment — only the ones that would overflow give anything up.
   */
  const dense = spec.items.length >= 5;
  const rowPad = dense ? Spacing.two + 2 : Spacing.three;
  const rowGap = dense ? Spacing.two : Spacing.two + 4;

  return (
    <View>
      <ThemedText type="title" style={{ marginBottom: Spacing.two }}>{spec.title}</ThemedText>
      <ThemedText type="small" themeColor="mutedForeground" style={{ marginBottom: dense ? Spacing.three : Spacing.four }}>
        {spec.hint ?? 'Tap two rows to swap them.'}
      </ThemedText>

      <View style={{ gap: rowGap }}>
        {order.map((itemIdx, pos) => {
          const inPlace = itemIdx === pos;
          const isSel = selected === pos;
          const border = isSel ? theme.primary : inPlace ? theme.success : theme.border;
          return (
            <SpringPressable
              key={spec.items[itemIdx]}
              // The reorder was an INSTANT CUT. `LinearTransition` had zero uses anywhere in
              // src/ — there was no reflow animation in the app at all, which is the mechanical
              // cause of the ~2%-of-frames measurement on this step. damping 18 sits inside
              // Brilliant's measured 12–18 overshoot band.
              // `.mass(1)` is not decoration. `.springify()` routes to withSpring, which in
              // Reanimated 4 DEFAULTS mass to 4 -- so damping 26 / stiffness 180, chosen for
              // Spring.gentle's zeta 0.969, was actually running at zeta 0.485 and overshooting
              // 19.4% on every row swap. Reflow that overshoots reads as the row bouncing past
              // its slot, which is the opposite of what a settled reorder should look like.
              layout={LinearTransition.springify().damping(Spring.gentle.damping).stiffness(Spring.gentle.stiffness).mass(1)}
              disabled={solved}
              onPress={() => tap(pos)}
              // Reordering is a two-tap swap, so "which row is currently picked up" is the
              // only state that makes the interaction followable. It was carried purely by a
              // border colour, which a screen reader cannot see. Position is announced too —
              // otherwise the user cannot tell what the swap achieved.
              accessibilityRole="button"
              accessibilityLabel={`Position ${pos + 1}. ${spec.items[itemIdx]}`}
              accessibilityState={{ selected: isSel, disabled: solved }}
              accessibilityHint={isSel ? 'Activate another row to swap with this one.' : 'Activate to pick up this row.'}>
              <View style={[styles.row,
                { padding: rowPad }, { borderColor: border, borderWidth: isSel || inPlace ? 2 : StyleSheet.hairlineWidth, backgroundColor: isSel ? theme.primary + '14' : theme.card }]}>
                <View style={[styles.num, { backgroundColor: (inPlace ? theme.success : theme.primary) + '22' }]}>
                  <ThemedText type="smallBold" style={{ color: inPlace ? theme.success : theme.iconLilac }}>{pos + 1}</ThemedText>
                </View>
                <ThemedText type="bodyMedium" style={{ flex: 1 }}>{spec.items[itemIdx]}</ThemedText>
                {inPlace && <UIcon name="check" size={16} color={theme.success} strokeWidth={3} />}
              </View>
            </SpringPressable>
          );
        })}
      </View>

      {solved && (
        <ThemedText type="smallBold" style={{ color: theme.success, marginTop: Spacing.three }}>In order. Well done.</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4, padding: Spacing.three, borderRadius: Radius.lg },
  num: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
