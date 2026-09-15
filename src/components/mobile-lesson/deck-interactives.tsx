/**
 * The interactive pieces that replaced the desktop graphs on iOS.
 *
 * Built for a thumb. Every control here is a single large target near the bottom of the card, which
 * is the only part of a phone screen a one-handed grip reaches comfortably. The web original was a
 * chart with two or three small sliders under it; 282 of the 289 graph steps had at least one, and
 * none of them were reachable without a second hand.
 *
 * NOTHING HERE INVENTS A NUMBER. `GrowLab` computes compound growth, which is arithmetic the
 * learner drives and can check. Everything else displays sentences the curriculum author wrote. The
 * one thing this file must never do is state a financial outcome that nobody authored and nobody
 * can verify.
 */
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { PixelScene } from '@/components/mobile-lesson/PixelScene';
import { LessonColors, LessonTypography } from '@/constants/lesson-design';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import type { MobileInteractive } from '@/lib/mobile-lesson/types';

/** US dollars, no cents. Cents on a forty year projection are noise pretending to be precision. */
const money = (n: number) =>
  `$${Math.round(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

/**
 * The year stops offered on the compound lab.
 *
 * Chips rather than a drag slider, for two reasons. `@react-native-community/slider` is NOT a
 * dependency of this app and adding one to ship a lesson card is not a trade worth making, and the
 * only other slider in the product (`number-line.tsx`) is a hand written gesture responder with its
 * own claim logic that exists to grade an answer, which is a different job. Five large tap targets
 * are also a better one-handed control than a 44pt drag track.
 */
const YEAR_STOPS = [1, 5, 10, 20, 30, 40, 50];

/**
 * Compound growth the learner steps through.
 *
 * `future = principal * (1 + rate) ** years`, which is the standard annual-compounding formula and
 * is exactly what the lesson's own numbers assume. The principal and the rate come from authored
 * sliders. The number of years is the learner's own input, so the figure on screen is arithmetic
 * about a scenario THEY chose rather than a claim the lesson is making, which is what makes showing
 * a large dollar amount here honest.
 */
function GrowLab({ spec, onWorked }: { spec: Extract<MobileInteractive, { kind: 'grow' }>; onWorked: () => void }) {
  const reduced = useReducedMotion();
  const [years, setYears] = useState(() => Math.min(10, spec.maxYears));
  const [touched, setTouched] = useState(false);

  const future = useMemo(
    () => spec.start * (1 + spec.ratePercent / 100) ** years,
    [spec.start, spec.ratePercent, years],
  );
  const multiple = spec.start > 0 ? future / spec.start : 1;

  const stops = useMemo(() => YEAR_STOPS.filter((y) => y <= spec.maxYears), [spec.maxYears]);

  const handle = useCallback((v: number) => {
    setYears(v);
    if (!touched) { setTouched(true); onWorked(); }
  }, [touched, onWorked]);

  return (
    <View style={styles.wrap}>
      <ThemedText style={styles.prompt}>{spec.prompt}</ThemedText>

      <Animated.View entering={reduced ? undefined : FadeIn.duration(240)} style={styles.figureRow}>
        <PixelScene scene={{ archetype: 'compound' }} size={72} />
        <View style={styles.figureText}>
          <ThemedText style={styles.figure}>{money(future)}</ThemedText>
          <ThemedText style={styles.figureNote}>
            {`${money(spec.start)} at ${spec.ratePercent}% for ${years} ${years === 1 ? 'year' : 'years'}`}
          </ThemedText>
        </View>
      </Animated.View>

      <ThemedText style={styles.multiple}>{`${multiple.toFixed(1)}x your starting amount`}</ThemedText>

      <View style={styles.sliderBlock}>
        <ThemedText style={styles.sliderLabel}>How long do you leave it?</ThemedText>
        <View style={styles.chipRow}>
          {stops.map((y) => (
            <SpringPressable
              key={y}
              onPress={() => handle(y)}
              accessibilityRole="button"
              accessibilityState={{ selected: y === years }}
              accessibilityLabel={`${y} ${y === 1 ? 'year' : 'years'}`}
            >
              <View style={[styles.chip, y === years && styles.chipOn]}>
                <ThemedText style={[styles.chipText, y === years && styles.chipTextOn]}>{`${y}y`}</ThemedText>
              </View>
            </SpringPressable>
          ))}
        </View>
      </View>

      {touched ? (
        <Animated.View entering={reduced ? undefined : FadeInDown.duration(280)}>
          <ThemedText style={styles.verdict}>{spec.verdict}</ThemedText>
        </Animated.View>
      ) : (
        <ThemedText style={styles.hint}>Pick a number of years</ThemedText>
      )}
    </View>
  );
}

/**
 * The authored insights, one tap at a time.
 *
 * On the web these sit in a bulleted list under a chart, which is where a reader's eye goes last.
 * Giving each one its own beat costs nothing and means the best sentence in the step is the thing
 * the learner is actually looking at.
 */
function MomentStepper({ spec, onWorked }: { spec: Extract<MobileInteractive, { kind: 'timeline' }>; onWorked: () => void }) {
  const reduced = useReducedMotion();
  const [at, setAt] = useState(0);
  const total = spec.moments.length;
  const done = at >= total - 1;
  const moment = spec.moments[at];

  const next = useCallback(() => {
    setAt((i) => {
      const v = Math.min(i + 1, total - 1);
      if (v >= total - 1) onWorked();
      return v;
    });
  }, [total, onWorked]);

  /*
   * ONE MOMENT ON SCREEN, REPLACED RATHER THAN STACKED.
   *
   * Stacking them meant the final beat carried every sentence at once, which put this card back
   * over the budget the layer exists to hold. Replacing keeps each beat to a single short fact,
   * which is also the only version that honestly counts as "one idea per screen".
   */
  return (
    <View style={styles.wrap}>
      <ThemedText style={styles.prompt}>{spec.prompt}</ThemedText>

      <Animated.View
        key={at}
        entering={reduced ? undefined : FadeInDown.duration(300)}
        style={styles.momentSolo}
      >
        <PixelScene scene={{ archetype: moment?.sprite ?? 'growth' }} size={84} />
        <ThemedText style={styles.momentText}>{moment?.label ?? ''}</ThemedText>
      </Animated.View>

      {!done ? (
        <SpringPressable onPress={next} accessibilityRole="button" accessibilityLabel="Show the next point">
          <View style={styles.tapTarget}>
            <ThemedText style={styles.tapLabel}>{`Next  (${at + 1}/${total})`}</ThemedText>
          </View>
        </SpringPressable>
      ) : null}
    </View>
  );
}

/** Press to uncover the point. The fallback when a step has no usable insight list. */
function RevealCard({ spec, onWorked }: { spec: Extract<MobileInteractive, { kind: 'reveal' }>; onWorked: () => void }) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const show = useCallback(() => { setOpen(true); onWorked(); }, [onWorked]);

  return (
    <View style={styles.wrap}>
      <ThemedText style={styles.prompt}>{spec.prompt}</ThemedText>
      <PixelScene scene={spec.scene} size={112} />
      {open ? (
        <Animated.View entering={reduced ? undefined : FadeInDown.duration(300)}>
          <ThemedText style={styles.momentText}>{spec.hidden}</ThemedText>
        </Animated.View>
      ) : (
        <SpringPressable onPress={show} accessibilityRole="button" accessibilityLabel="Reveal the answer">
          <View style={styles.tapTarget}>
            <ThemedText style={styles.tapLabel}>Tap to find out</ThemedText>
          </View>
        </SpringPressable>
      )}
    </View>
  );
}

/**
 * Guess the figure, then read the sentence it came from.
 *
 * The learner is asked for a number rather than told it, which is the difference between reading
 * that $10,000 becomes $174,494 and having to decide whether it does. 90% of the graph steps carry
 * an insight that leads with a figure, which is what makes this possible without inventing
 * anything: the sentence and the real figure are the author's, and the two wrong options are
 * arithmetic variants that are never shown as true.
 */
function GuessLab({ spec, onWorked }: { spec: Extract<MobileInteractive, { kind: 'guess' }>; onWorked: () => void }) {
  const reduced = useReducedMotion();
  const [picked, setPicked] = useState<string | null>(null);
  const answered = picked !== null;
  const right = picked === spec.answer;

  const choose = useCallback((value: string) => {
    if (picked !== null) return;
    setPicked(value);
    onWorked();
  }, [picked, onWorked]);

  return (
    <View style={styles.wrap}>
      <ThemedText style={styles.prompt}>{spec.prompt}</ThemedText>
      <PixelScene scene={spec.scene} size={72} />

      {/* Blanked until answered, then the author's sentence in full. */}
      <ThemedText style={styles.momentText}>{answered ? spec.full : spec.masked}</ThemedText>

      {!answered ? (
        <View style={styles.chipRow}>
          {spec.options.map((o) => (
            <SpringPressable key={o} onPress={() => choose(o)} accessibilityRole="button" accessibilityLabel={o}>
              <View style={styles.guessChip}>
                <ThemedText style={styles.guessChipText}>{o}</ThemedText>
              </View>
            </SpringPressable>
          ))}
        </View>
      ) : (
        <Animated.View entering={reduced ? undefined : FadeInDown.duration(280)}>
          <ThemedText style={[styles.verdict, { color: right ? LessonColors.success : LessonColors.warning }]}>
            {right ? 'That is the one.' : `It is ${spec.answer}.`}
          </ThemedText>
        </Animated.View>
      )}
    </View>
  );
}

/**
 * `onWorked` fires the first time the learner actually does the thing.
 *
 * The deck uses it to unlock Continue, so a card with an interaction on it cannot be skipped past
 * before the interaction has happened. That is the same contract the teaching slide already has
 * with its dwell timer, kept so the pacing of a lesson does not change between step types.
 */
export function DeckInteractive({ spec, onWorked }: { spec: MobileInteractive; onWorked: () => void }) {
  if (spec.kind === 'grow') return <GrowLab spec={spec} onWorked={onWorked} />;
  if (spec.kind === 'timeline') return <MomentStepper spec={spec} onWorked={onWorked} />;
  if (spec.kind === 'reveal') return <RevealCard spec={spec} onWorked={onWorked} />;
  if (spec.kind === 'guess') return <GuessLab spec={spec} onWorked={onWorked} />;
  /*
   * Unreachable while MobileInteractive has three members, and deliberately not a throw. If a
   * fourth kind is added and someone forgets this switch, a learner should get a card that is
   * merely bare rather than a crashed lesson, and scripts/mobile-deck-audit.mjs reports the
   * interactive kind counts so the omission is visible before it ships.
   */
  return null;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, paddingHorizontal: 24, width: '100%' },
  prompt: { ...LessonTypography.heading, color: LessonColors.text, textAlign: 'center' },
  figureRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  figureText: { alignItems: 'flex-start' },
  figure: { ...LessonTypography.display, color: LessonColors.success },
  figureNote: { ...LessonTypography.small, color: LessonColors.mutedForeground },
  multiple: { ...LessonTypography.smallBold, color: LessonColors.accent },
  sliderBlock: { width: '100%', gap: 6 },
  sliderLabel: { ...LessonTypography.label, color: LessonColors.mutedForeground, textAlign: 'center' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  chip: {
    minWidth: 52,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: LessonColors.backgroundElement,
    borderWidth: 1,
    borderColor: LessonColors.border,
  },
  chipOn: { backgroundColor: LessonColors.primary, borderColor: LessonColors.accent },
  guessChip: {
    minHeight: 52,
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: LessonColors.backgroundSelected,
    borderWidth: 1,
    borderColor: LessonColors.border,
  },
  guessChipText: { ...LessonTypography.heading, color: LessonColors.text },
  chipText: { ...LessonTypography.smallBold, color: LessonColors.mutedForeground },
  chipTextOn: { color: '#FFFFFF' },
  hint: { ...LessonTypography.small, color: LessonColors.mutedForeground, textAlign: 'center' },
  verdict: { ...LessonTypography.bodyMedium, color: LessonColors.text, textAlign: 'center' },
  momentSolo: { alignItems: 'center', gap: 16, width: '100%' },
  momentText: { ...LessonTypography.body, color: LessonColors.text, textAlign: 'center' },
  tapTarget: {
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: LessonColors.backgroundSelected,
    borderWidth: 1,
    borderColor: LessonColors.border,
  },
  tapLabel: { ...LessonTypography.smallBold, color: LessonColors.text, textAlign: 'center' },
});
