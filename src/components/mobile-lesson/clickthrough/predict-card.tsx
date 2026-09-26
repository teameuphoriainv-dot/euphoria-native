/**
 * Predict card (M2): guess the bottom bar, tap Check, and watch the lesson's own bar grow over
 * your guess while Atlas tells you, in words, how you did. A two-beat Atlas clip on the shared kit.
 *
 * The spec and every rule about what may be printed live in lib/mobile-lesson/clickthrough/
 * predict.ts, which the pin loads under plain node. This file only draws it.
 *
 *   beat 0  the anchor bar draws in at its authored length; the learner sets a guess.
 *   beat 1  (after Check) the authored bar grows over the guess, which stays as ghost cells; the
 *           target's authored value and `explain` appear, and Atlas says the verdict.
 *
 * THE GUESS IS NEVER DRAWN AS A SOLID BAR. It is GhostCells, dashed, before and after Check. A
 * solid learner-set bar beside an authored one would look like data for a figure nobody wrote
 * (CONSTITUTION 3.1); the dashes say "your guess" without a word.
 *
 * NOTHING IS GRADED. No XP, no mastery, no red. The verdict is one of three digit-free lines.
 *
 * ACCESSIBILITY (CONSTITUTION 5.10). The bottom bar is ONE adjustable element (swipe up / down),
 * the visible minus / plus buttons are the sighted route to the same nudge and are hidden from
 * VoiceOver (the dial-card.tsx pattern), dragging is only a shortcut for those buttons, and Check
 * is a 48pt button that stays disabled until the learner has set a guess.
 *
 * MOTION. Bars grow with CellRect (withTiming + Ease.out, never past their authored length).
 * Under Reduce Motion the anchor and the true bar appear at full length, the reveal text appears
 * without fading, and the ghost stays. Atlas's celebrate hop is skipped by <Atlas> itself.
 */
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { PanResponder, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';

import { SlabButton } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { LessonColors, LessonTypography } from '@/constants/lesson-design';
import { Radius } from '@/constants/theme';
import {
  guessAt,
  nudgeGuess,
  PREDICT_PROMPT,
  predictBeats,
  VERDICT_LINE,
  verdictOf,
  type Verdict,
} from '@/lib/mobile-lesson/clickthrough/predict';
import { CELL_PT, cellsFor, PREDICT_DELAY_MS, PREDICT_GROW_MS } from '@/lib/mobile-lesson/clickthrough/timing';
import type { PredictSpec } from '@/lib/mobile-lesson/clickthrough/types';
import { Duration } from '@/shared/motion/tokens';
import { SpringPressable } from '@/shared/motion/spring-pressable';

import {
  AtlasCue,
  CellRect,
  CLIP_MUTED,
  ClipCaption,
  ClipControls,
  GhostCells,
  StageFrame,
  useCellSpan,
  useClipTimeline,
} from './pixel-stage';

/** Bar thickness in cells: 24pt, a thumb-sized drag target inside the 48pt row. */
const BAR_CELLS = 6;
/** One row: its label line(s), a 4pt gap, the bar. */
const LABEL_LINE = LessonTypography.smallBold.lineHeight;
const ROW_GAP = 4;
const ROWS_GAP = 16;
/*
 * Labels are capped at 1.6x (ClipControls' cap). StageFrame has a FIXED height with overflow
 * hidden, so an uncapped label at the largest Dynamic Type would be clipped mid-word; the height is
 * computed below from the same cap and two reserved lines once text is scaled.
 */
const LABEL_SCALE_MAX = 1.6;

/*
 * Pixel minus and plus, not font glyphs: ClipControls draws its arrows in cells (PixelArrow), and
 * a smooth anti-aliased "+" from the text font beside them read as a different family of button.
 */
const MINUS = ['.....', '.....', 'XXXXX', '.....', '.....'];
const PLUS = ['..X..', '..X..', 'XXXXX', '..X..', '..X..'];
const GLYPH_CELL = 3;

function PixelGlyph({ rows }: { rows: string[] }) {
  return (
    <Svg width={rows[0].length * GLYPH_CELL} height={rows.length * GLYPH_CELL}>
      {rows.flatMap((row, j) =>
        [...row].map((ch, i) =>
          ch === 'X' ? (
            <Rect key={`${i}:${j}`} x={i * GLYPH_CELL} y={j * GLYPH_CELL} width={GLYPH_CELL} height={GLYPH_CELL} fill={LessonColors.text} />
          ) : null,
        ),
      )}
    </Svg>
  );
}

const spokenGuess = (g: number) => (g === 0 ? 'not set' : `${g} percent of the full width`);

function BarRow({
  label,
  display,
  span,
  children,
  labelLines,
}: {
  label: string;
  display: string | null;
  span: number;
  children: ReactNode;
  labelLines: number;
}) {
  return (
    <View style={{ gap: ROW_GAP }}>
      <View style={[styles.labelRow, { minHeight: LABEL_LINE * labelLines }]}>
        <ThemedText style={styles.label} numberOfLines={labelLines} maxFontSizeMultiplier={LABEL_SCALE_MAX}>
          {label}
        </ThemedText>
        {display ? (
          <ThemedText style={styles.value} maxFontSizeMultiplier={LABEL_SCALE_MAX}>
            {display}
          </ThemedText>
        ) : null}
      </View>
      {/* Hidden from VoiceOver: the label line above and the adjustable row carry the values. */}
      <Svg
        width={span * CELL_PT}
        height={BAR_CELLS * CELL_PT}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Rect x={0} y={0} width={span * CELL_PT} height={BAR_CELLS * CELL_PT} fill={LessonColors.backgroundSelected} />
        {children}
      </Svg>
    </View>
  );
}

export function PredictCard({ spec, onWorked }: { spec: PredictSpec; onWorked: () => void }) {
  const reduced = !!useReducedMotion();
  const { fontScale } = useWindowDimensions();
  const [span, onLayout] = useCellSpan();

  const [guess, setGuess] = useState(0);
  /*
   * Check stays disabled until the learner has moved the guess. Checking an untouched empty bar
   * would reveal the answer with nothing committed, which is the chart card this replaces.
   */
  const [touched, setTouched] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const checked = verdict !== null;

  /*
   * The LIVE verdict before Check, the locked one after. useClipTimeline announces the new beat's
   * caption from a ref updated after commit, so the beats it holds when Check is tapped must
   * already carry this guess's verdict, or VoiceOver hears the reveal without being told how the
   * guess went. Memoised on the verdict string: a fresh array per render would re-time the hold.
   */
  const shownVerdict = verdict ?? verdictOf(guess, spec.target.percent);
  const beats = useMemo(() => predictBeats(spec, shownVerdict, checked), [spec, shownVerdict, checked]);
  // No autoplay: beat 1 is the answer, and it must wait for Check, never a timer.
  const timeline = useClipTimeline(beats, { autoplay: false, onWorked });
  const revealed = checked && timeline.beat === 1;

  const set = useCallback(
    (g: number) => {
      if (checked) return;
      setGuess(g);
      setTouched(true);
    },
    [checked],
  );
  const nudge = useCallback((dir: 1 | -1) => set(nudgeGuess(guess, dir)), [guess, set]);

  const check = useCallback(() => {
    if (!touched || checked) return;
    setVerdict(verdictOf(guess, spec.target.percent));
    timeline.next();
  }, [touched, checked, guess, spec.target.percent, timeline]);

  /*
   * DRAG IS A SHORTCUT, NOT THE MECHANIC (the minus / plus buttons and the adjustable action are).
   * The row is `pointerEvents="box-only"`, so locationX is always measured against the row itself;
   * without it the finger lands on the label Text or the Svg and locationX is relative to THAT
   * child, which makes the guess jump when a drag crosses from the label onto the bar. It reads
   * locationX on every event, as number-line.tsx does, so re-creating the responder when `set`
   * changes cannot lose a running dx. Claims only horizontal moves, so the deck still scrolls.
   */
  // Against the DRAWN bar's width (whole cells), not the row's, so the ghost ends under the finger.
  const barPt = span * CELL_PT;
  const pan = useMemo(() => {
    const place = (x: number) => {
      if (barPt > 0) set(guessAt(x / barPt));
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !checked,
      onMoveShouldSetPanResponder: (_e, g) => !checked && Math.abs(g.dx) >= 6 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderGrant: (e) => place(e.nativeEvent.locationX),
      onPanResponderMove: (e) => place(e.nativeEvent.locationX),
      onPanResponderTerminationRequest: () => false,
    });
  }, [set, checked, barPt]);

  const labelLines = fontScale > 1.2 ? 2 : 1;
  const labelH = Math.ceil(LABEL_LINE * Math.min(fontScale, LABEL_SCALE_MAX)) * labelLines;
  const rowH = labelH + ROW_GAP + BAR_CELLS * CELL_PT;
  const frameH = rowH * 2 + ROWS_GAP + CELL_PT;

  const anchorCells = cellsFor(spec.anchor.percent, 100, span);
  const targetCells = cellsFor(spec.target.percent, 100, span);
  const guessCells = cellsFor(guess, 100, span);
  // Ghost in the accent while it is still the learner's to move; in text white once locked, so it
  // stays visible on top of the accent bar that grows over it.
  const ghostColor = checked ? LessonColors.text : LessonColors.accent;

  const guessControls = (
    <View style={styles.controls}>
      <SpringPressable
        onPress={() => nudge(-1)}
        disabled={guess === 0}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View style={[styles.button, guess === 0 && styles.buttonOff]}>
          <PixelGlyph rows={MINUS} />
        </View>
      </SpringPressable>
      <SpringPressable
        onPress={() => nudge(1)}
        disabled={guess >= 100}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View style={[styles.button, guess >= 100 && styles.buttonOff]}>
          <PixelGlyph rows={PLUS} />
        </View>
      </SpringPressable>
      <SlabButton label="Check" onPress={check} disabled={!touched} accessibilityLabel="Check your guess" style={styles.check} />
    </View>
  );

  return (
    <View style={styles.wrap}>
      <ThemedText style={styles.title}>{spec.title}</ThemedText>

      <View style={styles.atlasRow}>
        <AtlasCue reaction={timeline.reaction} cueKey={timeline.seq} />
        {/* Atlas's line reacts to the guess once it is in; keyed so it re-enters per verdict. */}
        <Animated.View
          key={verdict ?? 'ask'}
          entering={reduced ? undefined : FadeIn.duration(Duration.base)}
          style={styles.bubble}
          accessibilityLiveRegion="polite"
        >
          <ThemedText style={styles.bubbleText}>{verdict ? VERDICT_LINE[verdict] : PREDICT_PROMPT}</ThemedText>
        </Animated.View>
      </View>

      <StageFrame height={frameH} onLayout={onLayout} footer={checked ? <ClipControls timeline={timeline} /> : guessControls}>
        {span > 0 ? (
          <View style={{ gap: ROWS_GAP }}>
            <BarRow label={spec.anchor.label} display={spec.anchor.display} span={span} labelLines={labelLines}>
              <CellRect
                key={timeline.beat === 0 ? `a${timeline.seq}` : 'a-held'}
                grow="right"
                atCell={0}
                baseCell={0}
                thickness={BAR_CELLS}
                cells={anchorCells}
                fill={CLIP_MUTED}
                animate={timeline.animate && timeline.beat === 0}
              />
            </BarRow>

            <View
              pointerEvents="box-only"
              {...pan.panHandlers}
              accessible
              // Adjustable only while it adjusts: after Check VoiceOver would otherwise still say
              // "swipe up or down to adjust" on a bar that no longer moves.
              accessibilityRole={checked ? 'text' : 'adjustable'}
              accessibilityLabel={`Your guess for ${spec.target.label}`}
              accessibilityValue={{
                text: revealed ? `${spokenGuess(guess)}. Real value ${spec.target.display}. ${VERDICT_LINE[shownVerdict]}` : spokenGuess(guess),
              }}
              accessibilityActions={checked ? [] : [{ name: 'increment' }, { name: 'decrement' }]}
              onAccessibilityAction={(e) => nudge(e.nativeEvent.actionName === 'decrement' ? -1 : 1)}
            >
              <BarRow
                label={spec.target.label}
                display={revealed ? spec.target.display : '?'}
                span={span}
                labelLines={labelLines}
              >
                {revealed ? (
                  // The REVEALED length is the authored percent, never the guess (the pin's break test).
                  <CellRect
                    key={`t${timeline.seq}`}
                    grow="right"
                    atCell={0}
                    baseCell={0}
                    thickness={BAR_CELLS}
                    cells={targetCells}
                    fill={LessonColors.accent}
                    animate={timeline.animate}
                    delayMs={PREDICT_DELAY_MS}
                    durationMs={PREDICT_GROW_MS}
                  />
                ) : null}
                {guessCells > 0 ? <GhostCells x={0} y={0} w={guessCells} h={BAR_CELLS} color={ghostColor} /> : null}
              </BarRow>
            </View>
          </View>
        ) : null}
      </StageFrame>

      <ClipCaption text={timeline.beat === 1 ? spec.target.caption : beats[0].caption} beatKey={timeline.seq} />

      {revealed && spec.footer ? (
        <Animated.View entering={reduced ? undefined : FadeIn.duration(Duration.base)}>
          <ThemedText style={styles.footer}>{spec.footer}</ThemedText>
        </Animated.View>
      ) : null}
    </View>
  );
}

/*
 * CONTRAST (CONSTITUTION 5.9), on the same tokens scene-card.tsx measured, named rather than
 * written out because design-rules-pin counts every six-digit literal in a .tsx file:
 *   - labels and body in LessonColors.text on LessonColors.card: above 15:1;
 *   - footer in CLIP_MUTED (Colors.dark.mutedForeground) on the lesson background: 11.16:1;
 *   - Check's label in LessonColors.text on LessonColors.backgroundSelected with the accent border,
 *     the selected-chip treatment lever-card.tsx measured, because text on a primary fill is 3.88:1.
 */
const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 16, width: '100%' },
  title: { ...LessonTypography.heading, color: LessonColors.text, textAlign: 'center' },
  atlasRow: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%' },
  bubble: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: LessonColors.backgroundElement,
    borderWidth: 1,
    borderColor: LessonColors.border,
  },
  bubbleText: { ...LessonTypography.smallBold, color: LessonColors.text },
  labelRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 },
  label: { ...LessonTypography.smallBold, color: LessonColors.text, flexShrink: 1 },
  value: { ...LessonTypography.smallBold, color: LessonColors.accent },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  // 48pt, over the 44pt floor (CONSTITUTION 5.10), matching ClipControls.
  button: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    backgroundColor: LessonColors.backgroundElement,
    borderWidth: 1,
    borderColor: LessonColors.border,
  },
  buttonOff: { opacity: 0.4 },
  check: { minWidth: 96 },
  footer: { ...LessonTypography.small, color: CLIP_MUTED, textAlign: 'center' },
});
