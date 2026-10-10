/** Production 49e dragSort: adjacent head-to-head calls, then the authored full order. */
import { feedback } from '@/lib/feedback';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight, useReducedMotion } from 'react-native-reanimated';

import { AtlasCorrection } from '@/components/atlas-correction';
import { SparkBurst } from '@/components/lesson-feedback';
import { useLessonStepState } from '@/components/lesson-step-session';
import { ThemedText } from '@/components/themed-text';
import { SlabButton } from '@/components/ui/button';
import { UIcon } from '@/components/ui-icon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  advanceDragSort,
  answerDragSort,
  createDragSortState,
  dragSortRounds,
  passedDragSort,
  type DragSortSide,
  type DragSortSpec,
  type DragSortState,
} from '@/lib/drag-sort-model';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { Duration } from '@/shared/motion/tokens';

export function DragSort({ spec, onComplete }: { spec: DragSortSpec; onComplete: (passed: boolean) => void }) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const rounds = dragSortRounds(spec);
  const [flow, setFlow] = useLessonStepState<DragSortState>('dragSort.flow', createDragSortState);
  const round = rounds[flow.index];
  const answered = flow.picked !== null;
  const right = answered && round ? flow.picked === round.correct : false;

  const choose = (side: DragSortSide) => {
    const next = answerDragSort(flow, rounds, side);
    if (next === flow) return;
    setFlow(next);
    feedback(side === round?.correct ? 'correct' : 'wrong');
  };

  const nextRound = () => setFlow((current) => advanceDragSort(current, rounds.length));

  if (rounds.length === 0) {
    return (
      <View style={styles.empty}>
        <ThemedText type="title">The order that matters</ThemedText>
        <ThemedText type="small" themeColor="mutedForeground">This ordering has no comparisons available.</ThemedText>
        <SlabButton label="Continue" full onPress={() => onComplete(false)} />
      </View>
    );
  }

  if (flow.done) {
    return (
      <Animated.View
        entering={reduced ? FadeIn.duration(Duration.fast) : FadeInDown.duration(Duration.base)}
        style={styles.shell}>
        <ThemedText type="title" style={styles.center}>The order that matters</ThemedText>
        <ThemedText
          type="small"
          themeColor="mutedForeground"
          accessibilityLabel={`You called ${String(flow.score)} of ${String(rounds.length)} right.`}>
          You called {flow.score} of {rounds.length} right.
        </ThemedText>

        <View style={styles.fullOrder} accessibilityRole="list">
          {spec.items.map((item, index) => (
            <Animated.View
              key={`${String(index)}-${item}`}
              entering={reduced
                ? FadeIn.duration(Duration.fast)
                : FadeInRight.delay(index * 80).duration(Duration.base)}
              style={[styles.orderRow, { borderColor: theme.border, backgroundColor: theme.card }]}
              accessible
              accessibilityRole="text"
              accessibilityLabel={`Position ${String(index + 1)}. ${item}`}>
              <View style={[styles.position, { backgroundColor: theme.primary + '26' }]}>
                <ThemedText type="smallBold" style={{ color: theme.iconLilac }}>{index + 1}</ThemedText>
              </View>
              <ThemedText type="body" style={styles.itemText}>{item}</ThemedText>
            </Animated.View>
          ))}
        </View>

        <SlabButton
          label="Continue"
          full
          onPress={() => onComplete(passedDragSort(flow.score, rounds.length))}
        />
      </Animated.View>
    );
  }

  if (!round) return null;

  const card = (side: DragSortSide, label: string) => {
    const correct = round.correct === side;
    const chosen = flow.picked === side;
    const border = answered && correct
      ? theme.success + '99'
      : answered && chosen
        ? theme.destructive + '99'
        : theme.border;
    const background = answered && correct
      ? theme.success + '1A'
      : answered && chosen
        ? theme.destructive + '1A'
        : theme.card;
    const labelColor = answered && correct
      ? theme.success
      : answered && chosen
        ? theme.destructive
        : theme.text;
    const verdict = answered
      ? correct
        ? ' Correct answer.'
        : chosen
          ? ' Incorrect choice.'
          : ' Not selected.'
      : '';

    return (
      <SpringPressable
        key={side}
        haptic={false}
        disabled={answered}
        scaleTo={0.97}
        onPress={() => choose(side)}
        accessibilityLabel={`${label}.${verdict}`}
        accessibilityHint={answered ? undefined : 'Choose this if it comes first.'}
        accessibilityState={{ selected: chosen, disabled: answered }}
        style={styles.cardPressable}>
        <View
          style={[
            styles.card,
            { borderColor: border, backgroundColor: background, opacity: answered && !correct && !chosen ? 0.5 : 1 },
          ]}>
          <ThemedText type="bodyMedium" style={[styles.itemText, { color: labelColor }]}>{label}</ThemedText>
          {answered && correct ? <UIcon name="check" size={20} color={theme.success} strokeWidth={3} /> : null}
          {answered && chosen && !correct ? <UIcon name="close" size={20} color={theme.destructive} strokeWidth={3} /> : null}
        </View>
      </SpringPressable>
    );
  };

  return (
    <Animated.View
      entering={reduced ? FadeIn.duration(Duration.fast) : FadeInDown.duration(Duration.base)}
      style={styles.shell}>
      <View
        style={styles.progress}
        accessible
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: rounds.length, now: flow.index + (answered ? 1 : 0) }}
        accessibilityLabel={`Round ${String(flow.index + 1)} of ${String(rounds.length)}`}>
        {rounds.map((_candidate, index) => (
          <View
            key={index}
            accessible={false}
            style={[
              styles.progressSegment,
              { backgroundColor: index < flow.index || (index === flow.index && answered) ? theme.primary : theme.border },
            ]}
          />
        ))}
      </View>

      <ThemedText type="label" themeColor="mutedForeground">
        ROUND {flow.index + 1} OF {rounds.length}
      </ThemedText>
      <ThemedText type="title" style={[styles.center, styles.question]}>Which one comes first?</ThemedText>

      <Animated.View
        key={`round-${String(flow.index)}`}
        entering={reduced ? FadeIn.duration(Duration.fast) : FadeInRight.duration(Duration.base)}
        style={styles.cards}>
        {card('left', round.left)}
        <ThemedText type="label" themeColor="mutedForeground" style={styles.vs}>vs</ThemedText>
        {card('right', round.right)}
      </Animated.View>

      {answered ? (
        <Animated.View
          entering={reduced ? FadeIn.duration(Duration.fast) : FadeInDown.duration(Duration.base)}
          style={styles.feedback}
          accessibilityLiveRegion="polite">
          {right ? <View style={styles.sparkAnchor}><SparkBurst size={120} /></View> : null}
          <AtlasCorrection
            show={!right}
            answer={`"${round.correct === 'left' ? round.left : round.right}" comes first.`}
          />
          <SlabButton
            label={flow.index + 1 < rounds.length ? 'Next round' : 'See the full order'}
            full
            onPress={nextRound}
          />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shell: { width: '100%', maxWidth: 680, alignSelf: 'center', alignItems: 'center', gap: Spacing.three, paddingBottom: Spacing.four },
  center: { textAlign: 'center' },
  question: { fontSize: 20, lineHeight: 28 },
  progress: { width: '100%', flexDirection: 'row', gap: Spacing.two },
  progressSegment: { flex: 1, height: 6, borderRadius: Radius.pill },
  cards: { width: '100%', gap: Spacing.two },
  cardPressable: { width: '100%' },
  card: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: Spacing.two, padding: 20, borderRadius: Radius.lg, borderWidth: 1 },
  itemText: { flex: 1, lineHeight: 22 },
  vs: { textAlign: 'center', textTransform: 'none' },
  feedback: { width: '100%', gap: Spacing.three },
  sparkAnchor: { position: 'relative', alignSelf: 'center', width: 1, height: 1 },
  fullOrder: { width: '100%', gap: Spacing.two },
  orderRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two + 2, borderRadius: Radius.md, borderWidth: StyleSheet.hairlineWidth },
  position: { width: 28, height: 28, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  empty: { minHeight: 220, alignItems: 'center', justifyContent: 'center', gap: Spacing.three },
});
