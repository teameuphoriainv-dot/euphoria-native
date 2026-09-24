/**
 * The Dial card: a formula the learner drives, from the lesson's own numbers.
 *
 * Spec and math live in src/lib/mobile-lesson/parts/dial.ts, which is pure so the pin can check it
 * against the corpus. This file only draws it. Every figure on screen is either an authored input
 * or `evaluate()` on inputs the learner chose, so nothing here can state a number the lesson did
 * not author (CONSTITUTION 3.1).
 *
 * ACCESSIBILITY, designed in the same pass (CONSTITUTION 5.10):
 *   - each stepper is ONE VoiceOver element with accessibilityRole 'adjustable', so a swipe up or
 *     down moves it; the visible +/- buttons are the sighted route to the same `nudge`;
 *   - price chips and the above/below answers are plain buttons;
 *   - every target is at least 44pt;
 *   - the cash-cycle bar glides with withTiming, and under Reduce Motion it snaps. The rent figure
 *     never tweens at all: a counting number is motion the learner has to wait out.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { LessonColors, LessonTypography } from '@/constants/lesson-design';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import {
  chipValues,
  dollars,
  dollarsShort,
  evaluate,
  type DialInput,
  type DialSpec,
} from '@/lib/mobile-lesson/parts/dial';

/** 44pt is the floor from CONSTITUTION 5.10; the steppers sit one thumb-width apart at 48. */
const TARGET = 48;

/**
 * One +/- stepper.
 *
 * The container is the accessible element and the two buttons inside are hidden from VoiceOver.
 * Exposing all three made VoiceOver read "minus, button, 45 days, plus, button" per row, nine stops
 * for three numbers, where one adjustable per row is three.
 */
function Stepper({ input, value, cycle, onChange }: {
  input: DialInput;
  value: number;
  /** The resulting cash cycle, read out with the value (see accessibilityValue below). */
  cycle: number;
  onChange: (v: number) => void;
}) {
  const nudge = useCallback((dir: 1 | -1) => {
    const next = Math.min(input.max, Math.max(input.min, value + dir * input.step));
    if (next !== value) onChange(next);
  }, [input, value, onChange]);

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={input.label}
      // The cycle rides along with the value. VoiceOver reads only the adjusted element's value on a
      // swipe, so "45 days" alone left a screen-reader learner nudging blind: the whole point of
      // the card, the cycle moving toward zero, was on screen only.
      accessibilityValue={{ text: `${value} days, cash cycle ${cycle} days` }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => nudge(e.nativeEvent.actionName === 'decrement' ? -1 : 1)}
      style={styles.stepperRow}
    >
      <ThemedText style={styles.stepperLabel} numberOfLines={2}>{input.label}</ThemedText>
      <SpringPressable
        onPress={() => nudge(-1)}
        disabled={value <= input.min}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View style={[styles.stepButton, value <= input.min && styles.stepButtonOff]}>
          <ThemedText style={styles.stepGlyph}>-</ThemedText>
        </View>
      </SpringPressable>
      <ThemedText style={styles.stepValue}>{value}</ThemedText>
      <SpringPressable
        onPress={() => nudge(1)}
        disabled={value >= input.max}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View style={[styles.stepButton, value >= input.max && styles.stepButtonOff]}>
          <ThemedText style={styles.stepGlyph}>+</ThemedText>
        </View>
      </SpringPressable>
    </View>
  );
}

/**
 * The cash cycle as a bar either side of zero.
 *
 * Right of centre is days you fund the wait yourself; left is days customers fund you. The scale is
 * fixed by the steppers' own bounds (the most positive and most negative cycle they can reach), so
 * the bar never rescales under the learner's thumb, which would make a bigger number look smaller.
 */
function CycleBar({ days, scale }: { days: number; scale: number }) {
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const frac = useSharedValue(0);

  useEffect(() => {
    const target = scale > 0 ? Math.max(-1, Math.min(1, days / scale)) : 0;
    // Reduce Motion: snap. The bar still moves to the right answer, it just does not travel.
    frac.set(reduced ? target : withTiming(target, { duration: 220 }));
  }, [days, scale, reduced, frac]);

  const fill = useAnimatedStyle(() => {
    const half = width / 2;
    const f = frac.get();
    const w = Math.abs(f) * half;
    return { width: w, left: f >= 0 ? half : half - w };
  });

  const negative = days < 0;
  return (
    <View style={styles.barBlock} accessible accessibilityLabel={`Cash cycle ${days} days`}>
      <View style={styles.barTrack} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
        <Animated.View
          style={[styles.barFill, { backgroundColor: negative ? LessonColors.success : LessonColors.warning }, fill]}
        />
        <View style={styles.barZero} />
      </View>
      <View style={styles.barLegend}>
        <ThemedText style={[styles.legend, negative && styles.legendOn]}>customers fund you</ThemedText>
        <ThemedText style={[styles.legend, !negative && days > 0 && styles.legendOn]}>you fund the wait</ThemedText>
      </View>
    </View>
  );
}

function CccDial({ spec, onWorked }: { spec: DialSpec; onWorked: () => void }) {
  const [values, setValues] = useState(() => spec.inputs.map((i) => i.value));
  const [touched, setTouched] = useState(false);
  const days = evaluate(spec, values);
  const reached = days <= 0;

  // The furthest the steppers can push the cycle either way, for a bar that never rescales.
  const scale = useMemo(() => {
    const [a, b, c] = spec.inputs;
    if (!a || !b || !c) return 0;
    return Math.max(Math.abs(a.max + b.max - c.min), Math.abs(a.min + b.min - c.max));
  }, [spec.inputs]);

  const change = useCallback((index: number, v: number) => {
    setValues((prev) => prev.map((x, i) => (i === index ? v : x)));
    // onWorked is called here, outside the updater: see the MomentStepper note in
    // deck-interactives.tsx on why another component's setState must not run inside a reducer.
    if (!touched) { setTouched(true); onWorked(); }
  }, [touched, onWorked]);

  return (
    <View style={styles.wrap}>
      <ThemedText style={styles.prompt}>{spec.prompt}</ThemedText>
      <View style={styles.figureBlock}>
        <ThemedText style={[styles.figure, { color: reached ? LessonColors.success : LessonColors.text }]}>
          {`${days} days`}
        </ThemedText>
        <ThemedText style={styles.formula}>{`${values[0]} + ${values[1]} - ${values[2]}`}</ThemedText>
      </View>
      <CycleBar days={days} scale={scale} />
      <View style={styles.steppers}>
        {spec.inputs.map((input, i) => (
          <Stepper
            key={input.label}
            input={input}
            value={values[i] ?? input.value}
            cycle={days}
            onChange={(v) => change(i, v)}
          />
        ))}
      </View>
      <ThemedText style={[styles.hint, reached && styles.verdict]}>
        {reached ? spec.verdict : spec.goal ?? ''}
      </ThemedText>
    </View>
  );
}

function RentDial({ spec, onWorked }: { spec: DialSpec; onWorked: () => void }) {
  const input = spec.inputs[0];
  const [price, setPrice] = useState(() => input?.value ?? 0);
  const [touched, setTouched] = useState(false);
  const [answer, setAnswer] = useState<'above' | 'below' | null>(null);
  const breakEven = Math.round(evaluate(spec, [price]));
  const stops = useMemo(() => (input ? chipValues(input) : []), [input]);

  const pick = useCallback((v: number) => {
    setPrice(v);
    setAnswer(null);
    if (!touched) { setTouched(true); onWorked(); }
  }, [touched, onWorked]);

  if (!input) return null;
  const compare = spec.compare;
  // Equal counts as neither side; the rule then says the two cost the same, and the card says so.
  const truth = compare ? (compare.value > breakEven ? 'above' : compare.value < breakEven ? 'below' : null) : null;

  return (
    <View style={styles.wrap}>
      <ThemedText style={styles.prompt}>{spec.prompt}</ThemedText>
      <View style={styles.figureBlock}>
        <ThemedText style={styles.figure}>{`${dollars(breakEven)} a month`}</ThemedText>
        <ThemedText style={styles.formula}>{`${dollars(price)} x 5% / 12`}</ThemedText>
      </View>
      <View style={styles.chipRow}>
        {stops.map((v) => (
          <SpringPressable
            key={v}
            onPress={() => pick(v)}
            accessibilityState={{ selected: v === price }}
            accessibilityLabel={`${input.label} ${dollars(v)}`}
          >
            <View style={[styles.chip, v === price && styles.chipOn]}>
              <ThemedText style={[styles.chipText, v === price && styles.chipTextOn]}>{dollarsShort(v)}</ThemedText>
            </View>
          </SpringPressable>
        ))}
      </View>
      {touched ? <ThemedText style={styles.verdict}>{spec.verdict}</ThemedText> : (
        <ThemedText style={styles.hint}>Pick a home price</ThemedText>
      )}
      {touched && compare ? (
        answer === null ? (
          <View style={styles.compareBlock}>
            <ThemedText style={styles.hint}>
              {`${compare.label} is ${dollars(compare.value)}. Above or below the line?`}
            </ThemedText>
            <View style={styles.chipRow}>
              {(['above', 'below'] as const).map((side) => (
                <SpringPressable key={side} onPress={() => setAnswer(side)} accessibilityLabel={side}>
                  <View style={styles.answer}>
                    <ThemedText style={styles.answerText}>{side === 'above' ? 'Above' : 'Below'}</ThemedText>
                  </View>
                </SpringPressable>
              ))}
            </View>
          </View>
        ) : (
          <ThemedText
            style={[styles.hint, { color: answer === truth ? LessonColors.success : LessonColors.warning }]}
          >
            {/* Right or wrong is said in words, not only in the success/warning colour: colour alone
                never reaches VoiceOver or a colour-blind learner (CONSTITUTION 5.10). */}
            {truth === null
              ? `${dollars(compare.value)} is right on the line.`
              : `${answer === truth ? 'Yes.' : 'Not quite.'} ${dollars(compare.value)} is ${truth} ${dollars(breakEven)}.`}
          </ThemedText>
        )
      ) : null}
    </View>
  );
}

/**
 * `onWorked` fires once: the first stepper change (cash cycle) or the first price tap (rent). Same
 * contract as every card in deck-interactives.tsx: it unlocks the deck's Continue.
 */
export function DialCard({ spec, onWorked }: { spec: DialSpec; onWorked: () => void }) {
  if (spec.formula === 'ccc') return <CccDial spec={spec} onWorked={onWorked} />;
  return <RentDial spec={spec} onWorked={onWorked} />;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 24, width: '100%' },
  prompt: { ...LessonTypography.heading, color: LessonColors.text, textAlign: 'center' },
  figureBlock: { alignItems: 'center', gap: 2 },
  figure: { ...LessonTypography.display, color: LessonColors.success },
  formula: { ...LessonTypography.small, color: LessonColors.mutedForeground },
  barBlock: { width: '100%', gap: 6 },
  barTrack: {
    height: 14,
    width: '100%',
    borderRadius: 7,
    backgroundColor: LessonColors.backgroundElement,
    borderWidth: 1,
    borderColor: LessonColors.border,
    overflow: 'hidden',
  },
  barFill: { position: 'absolute', top: 0, bottom: 0 },
  barZero: { position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, backgroundColor: LessonColors.text },
  barLegend: { flexDirection: 'row', justifyContent: 'space-between' },
  legend: { ...LessonTypography.small, color: LessonColors.mutedForeground },
  legendOn: { color: LessonColors.text },
  steppers: { width: '100%', gap: 8 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: TARGET },
  stepperLabel: { ...LessonTypography.small, color: LessonColors.text, flex: 1 },
  stepButton: {
    width: TARGET,
    height: TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: LessonColors.backgroundSelected,
    borderWidth: 1,
    borderColor: LessonColors.border,
  },
  stepButtonOff: { opacity: 0.4 },
  stepGlyph: { ...LessonTypography.heading, color: LessonColors.text },
  stepValue: { ...LessonTypography.heading, color: LessonColors.text, minWidth: 40, textAlign: 'center' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  chip: {
    minWidth: 64,
    minHeight: TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: LessonColors.backgroundElement,
    borderWidth: 1,
    borderColor: LessonColors.border,
  },
  chipOn: { backgroundColor: LessonColors.primary, borderColor: LessonColors.accent },
  chipText: { ...LessonTypography.smallBold, color: LessonColors.mutedForeground },
  chipTextOn: { color: LessonColors.text },
  compareBlock: { alignItems: 'center', gap: 8, width: '100%' },
  answer: {
    minWidth: 96,
    minHeight: TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: LessonColors.backgroundSelected,
    borderWidth: 1,
    borderColor: LessonColors.border,
  },
  answerText: { ...LessonTypography.heading, color: LessonColors.text },
  hint: { ...LessonTypography.small, color: LessonColors.mutedForeground, textAlign: 'center' },
  verdict: { ...LessonTypography.bodyMedium, color: LessonColors.text, textAlign: 'center' },
});
