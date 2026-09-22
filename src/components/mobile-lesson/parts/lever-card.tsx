/**
 * Leverage Lens card: pick how much cash you put down and how far the price moves, and watch what
 * happens to the return on YOUR cash.
 *
 * Replaces the guess card on alternative-investments:2:4, which read "= 2 ? return on equity"
 * (see parts/lever.ts for the defect and the one formula). The card opens on the authored defaults,
 * 20% down and a 5% move, so the first number the learner sees is the lesson's own 25%.
 *
 * ACCESSIBILITY. Every control is a chip button (44pt minimum), never a drag, so VoiceOver users
 * get the whole card: CONSTITUTION 5.10, after Money 2048 shipped a swipe-only mechanic that
 * VoiceOver could not play. The big number announces its final value, not the count-up frames.
 *
 * MOTION. With Reduce Motion on, the number snaps to its value (no count-up) and the bar jumps to
 * its width. The bar changes width only; nothing translates or rotates.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { LessonColors, LessonTypography } from '@/constants/lesson-design';
import { Colors } from '@/constants/theme';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { multiplier, roe, roeRange, type LeverSpec } from '@/lib/mobile-lesson/parts/lever';

/** Count-up length. Long enough to read as the number travelling, short enough not to wait on. */
const COUNT_MS = 420;

const signed = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(Math.round(n))}%`;
const spoken = (n: number) => `${n < 0 ? 'minus ' : n > 0 ? 'plus ' : ''}${Math.abs(Math.round(n))} percent`;

/**
 * The number on screen, counting from the last value to the new one on the JS thread.
 * Reduced motion returns the target immediately: no intermediate frames at all.
 */
function useCountUp(target: number, reduced: boolean): number {
  const [shown, setShown] = useState(target);
  const from = useRef(target);

  useEffect(() => {
    // Reduced motion never animates: the hook returns `target` below, and the next count (if the
    // setting is switched off mid-card) starts from the value actually on screen.
    if (reduced) {
      from.current = target;
      return;
    }
    const start = from.current;
    const began = Date.now();
    let raf = 0;
    const tick = () => {
      const t = Math.min(1, (Date.now() - began) / COUNT_MS);
      const eased = 1 - (1 - t) ** 3;
      const v = start + (target - start) * eased;
      from.current = v;
      setShown(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced]);

  return reduced ? target : shown;
}

function ChipRow({
  label,
  values,
  selected,
  onPick,
  format,
  speak,
}: {
  label: string;
  values: number[];
  selected: number;
  onPick: (v: number) => void;
  format: (v: number) => string;
  speak: (v: number) => string;
}) {
  return (
    <View style={styles.block}>
      <ThemedText style={styles.rowLabel}>{label}</ThemedText>
      <View style={styles.chipRow}>
        {values.map((v) => {
          const on = v === selected;
          return (
            <SpringPressable
              key={v}
              onPress={() => onPick(v)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={speak(v)}
            >
              <View style={[styles.chip, on && styles.chipOn]}>
                <ThemedText style={[styles.chipText, on && styles.chipTextOn]}>{format(v)}</ThemedText>
              </View>
            </SpringPressable>
          );
        })}
      </View>
    </View>
  );
}

export function LeverCard({ spec, onWorked }: { spec: LeverSpec; onWorked: () => void }) {
  const reduced = useReducedMotion();
  const [down, setDown] = useState(spec.down);
  const [move, setMove] = useState(spec.move);
  /*
   * WORKED AFTER A SECOND COMBINATION THE LEARNER CHOSE. One tap only confirms that a chip does
   * something; the lesson lives in the contrast (the same move at a different down payment, or the
   * same down payment with the price falling), so Continue unlocks once two different learner
   * picks have been seen. The opening combination is the lesson's, so it does not count.
   */
  const [tried, setTried] = useState<string[]>([]);
  const worked = tried.length >= 2;

  const pick = useCallback(
    (d: number, m: number) => {
      setDown(d);
      setMove(m);
      /*
       * `accessibilityLiveRegion` on the figure is Android only, so on iOS a VoiceOver tap on a chip
       * said "selected" and never the new return: the one number the card exists to show.
       */
      AccessibilityInfo.announceForAccessibility(`${spoken(roe(d, m))} ${spec.note}`);
      const key = `${d}:${m}`;
      if (d === spec.down && m === spec.move) return;
      if (tried.includes(key)) return;
      const next = [...tried, key];
      setTried(next);
      if (next.length === 2) onWorked();
    },
    [tried, spec.down, spec.move, spec.note, onWorked],
  );

  const value = roe(down, move);
  const shown = useCountUp(value, !!reduced);
  const wiped = value <= -100;

  /*
   * THE BAR. Zero sits where the chips' own range puts it (for 10-50% down and -10 to 15% moves:
   * -100% to +150%), so a loss grows left of zero and a gain grows right of it, on one scale for
   * every combination. Scaling per combination would draw a 10% gain and a 150% gain the same
   * length, which is the one thing a leverage picture must not do.
   */
  const range = useMemo(() => roeRange(spec), [spec]);
  const span = range.max - range.min || 1;
  const zeroAt = (-range.min / span) * 100;
  const widthPct = (Math.abs(value) / span) * 100;

  const width = useSharedValue(widthPct);
  useEffect(() => {
    width.set(reduced ? widthPct : withTiming(widthPct, { duration: COUNT_MS }));
  }, [widthPct, reduced, width]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${width.get()}%` }));

  const tone = value < 0 ? LessonColors.destructive : LessonColors.success;

  return (
    <View style={styles.wrap}>
      <ThemedText style={styles.prompt}>{spec.prompt}</ThemedText>

      <View
        style={styles.figureBlock}
        accessible
        accessibilityLiveRegion="polite"
        accessibilityLabel={`${spoken(value)} ${spec.note}`}
      >
        <ThemedText style={[styles.figure, { color: tone }]}>{signed(shown)}</ThemedText>
        <ThemedText style={styles.note}>{spec.note}</ThemedText>
      </View>

      <View style={styles.track} accessible={false} importantForAccessibility="no-hide-descendants">
        <View style={[styles.zero, { left: `${zeroAt}%` }]} />
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: tone },
            value >= 0 ? { left: `${zeroAt}%` } : { right: `${100 - zeroAt}%` },
            fillStyle,
          ]}
        />
      </View>

      <ThemedText style={styles.multiple}>
        {wiped ? 'All your cash, gone.' : `Your cash moves ${multiplier(down)}x the price`}
      </ThemedText>

      <ChipRow
        label="Cash you put down"
        values={spec.downChips}
        selected={down}
        onPick={(d) => pick(d, move)}
        format={(v) => `${v}%`}
        speak={(v) => `${v} percent down`}
      />
      <ChipRow
        label="Price change in a year"
        values={spec.moveChips}
        selected={move}
        onPick={(m) => pick(down, m)}
        format={signed}
        speak={(v) => `Price ${v < 0 ? 'falls' : 'rises'} ${Math.abs(v)} percent`}
      />

      {worked ? (
        <Animated.View entering={reduced ? undefined : FadeInDown.duration(280)}>
          <ThemedText style={styles.verdict}>{spec.verdict}</ThemedText>
        </Animated.View>
      ) : (
        <ThemedText style={styles.hint}>
          {tried.length === 0 ? 'Change a number' : 'Try one more combo'}
        </ThemedText>
      )}
    </View>
  );
}

/*
 * CONTRAST, computed 2026-09-22 (WCAG relative luminance, CONSTITUTION 5.9). Hex values are named
 * by token here, not written out, because design-rules-pin counts every six-digit literal in a .tsx
 * file, comments included.
 *   - LessonColors.mutedForeground on LessonColors.background is 4.01:1, under the 4.5 floor, and
 *     the caveat "before rent and costs" is the line that keeps this card honest, so the note, row
 *     labels and chip text use Colors.dark.mutedForeground from theme.ts: 11.16:1 on
 *     LessonColors.background and 10.65:1 on LessonColors.backgroundElement (the chip fill).
 *   - A selected chip filled with LessonColors.primary gives LessonColors.text 3.88:1 (pure white
 *     would be 4.27:1), both under 4.5. The selected state is LessonColors.backgroundSelected with a
 *     2pt accent border instead, where LessonColors.text clears 4.5 comfortably.
 *   - Gain (LessonColors.success) is 8.64:1 and loss (LessonColors.destructive) 5.26:1 on the
 *     lesson background.
 */
const MUTED = Colors.dark.mutedForeground;

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 24, width: '100%' },
  prompt: { ...LessonTypography.heading, color: LessonColors.text, textAlign: 'center' },
  figureBlock: { alignItems: 'center' },
  figure: { ...LessonTypography.display, fontSize: 44, lineHeight: 52 },
  note: { ...LessonTypography.small, color: MUTED, textAlign: 'center' },
  track: {
    width: '100%',
    height: 14,
    borderRadius: 7,
    backgroundColor: LessonColors.backgroundElement,
    borderWidth: 1,
    borderColor: LessonColors.border,
    overflow: 'hidden',
  },
  zero: { position: 'absolute', top: 0, bottom: 0, width: 2, marginLeft: -1, backgroundColor: LessonColors.mutedForeground },
  fill: { position: 'absolute', top: 0, bottom: 0, borderRadius: 7 },
  multiple: { ...LessonTypography.smallBold, color: LessonColors.accent, textAlign: 'center' },
  block: { width: '100%', gap: 6 },
  rowLabel: { ...LessonTypography.label, color: MUTED, textAlign: 'center' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  chip: {
    minWidth: 64,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: LessonColors.backgroundElement,
    borderWidth: 1,
    borderColor: LessonColors.border,
  },
  chipOn: { backgroundColor: LessonColors.backgroundSelected, borderColor: LessonColors.accent, borderWidth: 2 },
  chipText: { ...LessonTypography.smallBold, color: MUTED },
  chipTextOn: { color: LessonColors.text },
  hint: { ...LessonTypography.small, color: MUTED, textAlign: 'center' },
  verdict: { ...LessonTypography.bodyMedium, color: LessonColors.text, textAlign: 'center' },
});
