/**
 * Growth ledger card: a worked compound-growth example that builds one year per tap. The card solves
 * the first years, the learner picks the next year's gain from three chips, then the card jumps to a
 * far year beside the total a flat amount a year would reach. Every figure comes from ledger.ts
 * (ledgerRows, simpleTotal, money); none is typed here.
 *
 * WORKED EXAMPLE, THEN FADE IT (research.json: CESE 2017, IES rec. 2). Years 1 to `workedYears` are
 * solved with each gain said in the caption; the next year asks for only its last step; nothing for
 * that year is mounted before the pick (its row shows "?"), so the answer cannot be read off the
 * screen. A wrong pick turns amber, says which year's gain it was and costs nothing: it is teaching,
 * not grading.
 *
 * SAY IT ONCE (CONSTITUTION 5.1): rows show totals only; the caption says the gain.
 *
 * THE BARS, honestly. In the worked years the gains differ by about half a point on screen, too small
 * to see; the captions carry that. What the bars show is that each year's gain (full accent) sits on
 * top of every gain before it (accent, lighter) and the $100 base (muted). The jump carries the size:
 * every bar is redrawn at the new scale, then the far year's bar runs well past the dashed tick where
 * a gain that never grew would stop, which is the "growth is a straight line" misconception, drawn.
 *
 * THE RESCALE IS A CUT, LABELLED. It used to tween, and a beginner watched the worked years' bars
 * shrink, which reads as Maya losing money (AGENTS.md: motion must not imply causes that do not
 * exist). Now the bars are redrawn at the new scale in one frame, as the gap row arrives saying the
 * bars were resized, and only then does the far year's row rise and grow.
 *
 * DATA GEOMETRY NEVER OVERSHOOTS (AGENTS.md). Bars grow on Ease.enter from where they are, the
 * rescale is a cut, and no total counts up: each fades in once its bar has landed.
 * REDUCE MOTION: rows and bars appear at full length and the rescale is a cut.
 * VOICEOVER: each row is one text element ("Year 2: total 110 dollars 25 cents"); the caption is
 * announced; the chips are buttons labelled in words.
 * ONE MASCOT PER SCREEN: no Atlas; LEDGER_HIDES_FLOAT hides the lesson's floating one.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming, type SharedValue } from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';

import { useLessonStepState } from '@/components/lesson-step-session';
import { CLIP_MUTED, StageFrame } from '@/components/mobile-lesson/clickthrough/pixel-stage';
import { SceneCaption } from '@/components/mobile-lesson/parts/scene-card';
import { ThemedText } from '@/components/themed-text';
import { LessonColors, LessonTypography } from '@/constants/lesson-design';
import { Radius } from '@/constants/theme';
import { DRAW_MS } from '@/lib/mobile-lesson/clickthrough/timing';
import { askYear, cents, ledgerRows, money, moneyIn, moneyWords, scaleCeil, simpleTotal, type LedgerSpec } from '@/lib/mobile-lesson/parts/ledger';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { Ease } from '@/shared/motion/tokens';

/*
 * MOTION, in ms. A row arrives (ROW_IN, an 8pt rise), its bar grows (DRAW_MS, the clip kit's draw),
 * then its total fades in (TOTAL_IN). The jump redraws every bar at the new scale at once (a cut),
 * then the far year's row rises and its bar grows over JUMP_GROW: twice DRAW_MS, because it travels
 * about three times as far as any worked bar and at DRAW_MS it read as a flash rather than a climb.
 */
const ROW_IN_MS = 200;
const ROW_RISE = 8;
const TOTAL_IN_MS = 200;
const JUMP_GROW_MS = DRAW_MS * 2;
/** Older rows step back so the newest is the one thing at full strength (Mayer, signaling). */
const OLDER_OPACITY = 0.6;
const ROW_H = 36;
/** The far year's row: 60, so the tick's label clears the gap row's words above it (was 52, touching). */
const TALL_ROW_H = 60;
const GAP_ROW_H = 24;
const BAR_H = 14;
/** Fits "Year 30" in smallBold at the 1.3x Dynamic Type cap; 56 cut it to "Year..." at extra-large. */
const NAME_W = 66;
const TOTAL_W = 80;
const TICK_BOX_W = 44;
/** The tick runs from under its label down through the far year's bar. */
const TICK_LINE_H = TALL_ROW_H - 16;

/*
 * BAR COLOURS (CONSTITUTION 5.9, measured 2026-10-13 on LessonColors.card). The spec's 40% muted base
 * and 45% accent measured 2.64:1 and 2.05:1, under the 3:1 floor for graphics, so the base is
 * CLIP_MUTED at 60% (4.48:1) and earlier gains LessonColors.accent at 70% (3.29:1); the newest gain is
 * full accent (5.58:1). A 1pt gap of card colour separates the segments, because 70% and full accent
 * differ by only 1.69:1. The tick is CLIP_MUTED (10.65:1). Totals are LessonColors.text (17.27:1) and
 * stay over 7:1 when their row steps back to 60%. Alpha is appended to 6-digit hex tokens only.
 */
const BASE_FILL = CLIP_MUTED + '99';
const EARLIER_FILL = LessonColors.accent + 'B3';
const NEWEST_FILL = LessonColors.accent;

/** Stable identity for the snapshot initializer. */
const NO_PICKS: number[] = [];

type Row = {
  key: string;
  name: string;
  /** The row's total and the total of the row before (equal to start for the base row). */
  total: number;
  prev: number;
  /** Where the bar starts growing from, in dollars: the row before it, or 0 for a fresh bar. */
  from: number;
  tall?: boolean;
};

/**
 * One row's bar: the base, earlier gains and this year's gain, each as wide as its dollars at the
 * shared scale, with a 1pt card-coloured gap between segments. Three styles, one per segment, so a
 * rescale moves every edge on the UI thread together.
 */
function Bar({ row, start, amt, lane, scaleD }: { row: Row; start: number; amt: SharedValue<number>; lane: SharedValue<number>; scaleD: SharedValue<number> }) {
  const prev = Math.max(row.prev, start);
  const base = useAnimatedStyle(() => ({ left: 0, width: Math.min(amt.get(), start) * (lane.get() / scaleD.get()) }));
  const earlier = useAnimatedStyle(() => {
    const k = lane.get() / scaleD.get();
    const b = Math.min(amt.get(), start) * k;
    const e = Math.max(0, Math.min(amt.get(), row.prev) - start) * k;
    return { left: b + (e > 1 ? 1 : 0), width: Math.max(0, e - 1) };
  });
  const newest = useAnimatedStyle(() => {
    const k = lane.get() / scaleD.get();
    const b = Math.min(amt.get(), start) * k;
    const e = Math.max(0, Math.min(amt.get(), row.prev) - start) * k;
    const n = Math.max(0, amt.get() - prev) * k;
    return { left: b + e + (n > 1 ? 1 : 0), width: Math.max(0, n - 1) };
  });
  return (
    <View style={styles.barLane} pointerEvents="none">
      <Animated.View style={[styles.seg, { backgroundColor: BASE_FILL }, base]} />
      <Animated.View style={[styles.seg, { backgroundColor: EARLIER_FILL }, earlier]} />
      <Animated.View style={[styles.seg, { backgroundColor: NEWEST_FILL }, newest]} />
    </View>
  );
}

function LedgerRow({ row, start, shown, unknown, older, play, arrive, growAt, growMs, lane, scaleD, tick, reduced }: {
  row: Row;
  start: number;
  /** Revealed: the bar and total are mounted. */
  shown: boolean;
  /** The asked year before the pick: "?" and nothing else. */
  unknown: boolean;
  older: boolean;
  /** Revealed during this visit, so it animates in; otherwise it is simply there. */
  play: boolean;
  /** Its bar arrives with an 8pt rise; false for the asked row, which was already showing "?". */
  arrive: boolean;
  growAt: number;
  growMs: number;
  lane: SharedValue<number>;
  scaleD: SharedValue<number>;
  /** The flat-growth tick, at `at` points into the lane. */
  tick?: { text: string; at: number } | null;
  reduced: boolean;
}) {
  const live = play && !reduced;
  const amt = useSharedValue(shown && !live ? row.total : row.from);
  const rise = useSharedValue(0);
  const fade = useSharedValue(1);
  const totalIn = useSharedValue(shown && !live ? 1 : 0);
  const dim = useSharedValue(older ? OLDER_OPACITY : 1);
  useEffect(() => {
    if (!shown) return;
    if (!live) {
      amt.set(row.total);
      totalIn.set(1);
      rise.set(0);
      fade.set(1);
      return;
    }
    if (arrive) {
      rise.set(ROW_RISE);
      fade.set(0);
      rise.set(withTiming(0, { duration: ROW_IN_MS, easing: Ease.enter }));
      fade.set(withTiming(1, { duration: ROW_IN_MS, easing: Ease.enter }));
    }
    amt.set(row.from);
    amt.set(withDelay(growAt, withTiming(row.total, { duration: growMs, easing: Ease.enter })));
    totalIn.set(0);
    totalIn.set(withDelay(growAt + growMs, withTiming(1, { duration: TOTAL_IN_MS, easing: Ease.enter })));
    // Revealing is the trigger; the timing is read fresh for it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, live]);
  useEffect(() => {
    const to = older ? OLDER_OPACITY : 1;
    dim.set(reduced ? to : withTiming(to, { duration: ROW_IN_MS, easing: Ease.inOut }));
  }, [older, reduced, dim]);

  const rowStyle = useAnimatedStyle(() => ({ opacity: dim.get() }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: fade.get(), transform: [{ translateY: rise.get() }] }));
  const totalStyle = useAnimatedStyle(() => ({ opacity: totalIn.get() }));
  const label = shown ? `${row.name}: total ${moneyWords(row.total)}` : unknown ? `${row.name}: total not shown yet, your turn` : '';
  const placeholder = !shown && !unknown;

  return (
    <Animated.View
      style={[styles.row, { height: row.tall ? TALL_ROW_H : ROW_H }, rowStyle]}
      accessible={!placeholder}
      accessibilityLabel={label}
      accessibilityElementsHidden={placeholder}
      importantForAccessibility={placeholder ? 'no-hide-descendants' : 'yes'}
    >
      <ThemedText style={[styles.name, placeholder && styles.namePending]} numberOfLines={1} maxFontSizeMultiplier={1.3}>{row.name}</ThemedText>
      <Animated.View style={[styles.lane, contentStyle]}>
        {shown ? <Bar row={row} start={start} amt={amt} lane={lane} scaleD={scaleD} /> : null}
        {shown && tick ? (
          <Animated.View pointerEvents="none" style={[styles.tickBox, { left: tick.at - TICK_BOX_W / 2 }, totalStyle]}>
            <ThemedText style={styles.tickText} maxFontSizeMultiplier={1.2}>{tick.text}</ThemedText>
            <Svg width={2} height={TICK_LINE_H}>
              <Line x1={1} y1={0} x2={1} y2={TICK_LINE_H} stroke={CLIP_MUTED} strokeWidth={2} strokeDasharray="3 3" />
            </Svg>
          </Animated.View>
        ) : null}
      </Animated.View>
      <View style={styles.totalCol}>
        {unknown ? <ThemedText style={styles.unknown}>?</ThemedText> : null}
        {shown ? (
          <Animated.View style={totalStyle}>
            <ThemedText style={styles.total} numberOfLines={1} maxFontSizeMultiplier={1.3}>{money(row.total)}</ThemedText>
          </Animated.View>
        ) : null}
      </View>
    </Animated.View>
  );
}

export function GrowthLedgerCard({ spec, onWorked }: { spec: LedgerSpec; onWorked: () => void }) {
  const reduced = !!useReducedMotion();
  const W = spec.workedYears;
  const ASK = W + 1;
  const RIGHT = W + 2;
  const DONE = W + 3;
  const [step, setStep] = useLessonStepState<number>('ledger.step', 0);
  const [wrong, setWrong] = useLessonStepState<number[]>('ledger.wrong', NO_PICKS);
  const [lastWrong, setLastWrong] = useLessonStepState<number | null>('ledger.lastWrong', null);
  // What was already on screen when the card mounted is simply there; only what is revealed now moves.
  const [mountedAt] = useState(step);
  const [seq, setSeq] = useState(0);

  const ask = askYear(spec);
  const all = useMemo(() => ledgerRows(spec.start, spec.ratePercent, Math.max(spec.jump.year, ask)), [spec.start, spec.ratePercent, spec.jump.year, ask]);
  const far = all[spec.jump.year - 1];
  const flat = simpleTotal(spec.start, spec.ratePercent, spec.jump.year);
  const rightIndex = spec.ask.options.findIndex((o) => {
    const v = moneyIn(o)[0];
    return v !== undefined && cents(v) === cents(all[ask - 1]?.gain ?? Number.NaN);
  });
  const wrongLine = (i: number) => spec.ask.wrong[spec.ask.options.slice(0, i).filter((_, j) => j !== rightIndex).length] ?? '';

  const rows = useMemo<Row[]>(() => [
    { key: 'start', name: 'Start', total: spec.start, prev: spec.start, from: 0 },
    ...all.slice(0, ask).map((r, i) => ({ key: `y${String(r.year)}`, name: `Year ${String(r.year)}`, total: r.total, prev: i === 0 ? spec.start : all[i - 1].total, from: i === 0 ? spec.start : all[i - 1].total })),
  ], [all, ask, spec.start]);
  const farRow: Row = { key: 'far', name: `Year ${String(spec.jump.year)}`, total: far?.total ?? 0, prev: all[spec.jump.year - 2]?.total ?? spec.start, from: 0, tall: true };

  const [laneW, setLaneW] = useState(0);
  const lane = useSharedValue(0);
  const scaleD = useSharedValue(scaleCeil(step >= DONE ? farRow.total : rows[rows.length - 1].total));
  const onLane = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    lane.set(w);
    setLaneW(w);
  }, [lane]);

  const jumped = step >= DONE;
  const jumpLive = jumped && mountedAt < DONE && !reduced;
  useEffect(() => {
    if (!jumped) return;
    // A cut, never a tween: shrinking bars would read as money lost (see THE RESCALE IS A CUT above).
    scaleD.set(scaleCeil(farRow.total));
    // Worked once the far year has landed: its row, its bar, its total and the tick.
    const landed = jumpLive ? ROW_IN_MS + JUMP_GROW_MS + TOTAL_IN_MS : 0;
    const id = setTimeout(onWorked, landed);
    return () => clearTimeout(id);
    // Fires on the jump (or on arriving after it); farRow is derived from the spec.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumped]);

  const caption =
    step === 0 ? spec.captions.start
      : step <= W ? spec.captions.years[step - 1] ?? ''
        : step === ASK ? (lastWrong === null ? spec.ask.prompt : wrongLine(lastWrong))
          : step === RIGHT ? spec.ask.right
            : spec.jump.caption;
  const change = useMemo(() => ({ beat: step, seq, animate: !reduced }), [step, seq, reduced]);
  const say = useCallback((text: string) => {
    setSeq((s) => s + 1);
    AccessibilityInfo.announceForAccessibility(text);
  }, []);

  const nextYear = useCallback(() => {
    const to = Math.min(step + 1, ASK);
    setStep(to);
    say(to === ASK ? spec.ask.prompt : spec.captions.years[to - 1] ?? '');
  }, [step, ASK, setStep, say, spec.ask.prompt, spec.captions.years]);
  const pick = useCallback((i: number) => {
    if (i === rightIndex) {
      setStep(RIGHT);
      setLastWrong(null);
      say(spec.ask.right);
      return;
    }
    setWrong((w) => (w.includes(i) ? w : [...w, i]));
    setLastWrong(i);
    say(wrongLine(i));
    // wrongLine reads the spec, which does not change under a mounted card.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rightIndex, RIGHT, setStep, setLastWrong, setWrong, say, spec.ask.right]);
  const jump = useCallback(() => {
    setStep(DONE);
    say(spec.jump.caption);
  }, [DONE, setStep, say, spec.jump.caption]);

  // The far year's dashed tick sits where the flat total falls on the final scale.
  const tickAt = laneW > 0 ? (flat / scaleCeil(farRow.total)) * laneW : 0;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
      <ThemedText style={styles.title} accessibilityRole="header" accessibilityLabel={`${spec.title}. ${spec.tag}.`}>{spec.title}</ThemedText>

      <StageFrame
        height={(rows.length) * ROW_H + GAP_ROW_H + TALL_ROW_H}
        footer={
          <View style={styles.captionBar}>
            {/*
             * The tag sits where the story card's does, at the head of the words. Beside the title it
             * pushed "Watch Maya's money grow" onto two lines at 336pt (simulator, 2026-10-13).
             */}
            <View style={styles.tag} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <ThemedText style={styles.tagText} maxFontSizeMultiplier={1.4}>{spec.tag}</ThemedText>
            </View>
            <View style={styles.captionBox} accessibilityLiveRegion="polite">
              <SceneCaption text={caption} change={change} reduced={reduced} />
            </View>
          </View>
        }
      >
        {/* Measures the bar lane once: the name and total columns are fixed, the lane takes the rest. */}
        <View style={styles.measure} pointerEvents="none">
          <View style={{ width: NAME_W }} />
          <View style={styles.lane} onLayout={onLane} />
          <View style={{ width: TOTAL_W }} />
        </View>
        {rows.map((r, i) => {
          const isAsk = i === ask;
          const shown = isAsk ? step >= RIGHT : step >= i;
          // The row at full strength is the newest one, except while asking: then the learner needs
          // the last worked total to work from, so that row stays bright beside the "?".
          const newestRow = step <= W ? step : step === ASK ? W : step === RIGHT ? ask : -1;
          return (
            <LedgerRow
              key={r.key}
              row={r}
              start={spec.start}
              shown={shown}
              unknown={isAsk && step === ASK}
              older={shown && i !== newestRow}
              play={isAsk ? mountedAt < RIGHT : mountedAt < i}
              arrive={!isAsk}
              growAt={isAsk ? 0 : ROW_IN_MS}
              growMs={DRAW_MS}
              lane={lane}
              scaleD={scaleD}
              reduced={reduced}
            />
          );
        })}
        <View
          style={styles.gapRow}
          accessible={jumped}
          accessibilityLabel={`Years ${String(ask + 1)} to ${String(spec.jump.year - 1)} skipped. The bars were resized to fit.`}
          accessibilityElementsHidden={!jumped}
          importantForAccessibility={jumped ? 'yes' : 'no-hide-descendants'}
        >
          {jumped ? (
            <ThemedText style={styles.gapText} numberOfLines={1} maxFontSizeMultiplier={1.2}>
              {`Years ${String(ask + 1)} to ${String(spec.jump.year - 1)} (bars resized to fit)`}
            </ThemedText>
          ) : null}
        </View>
        <LedgerRow
          row={farRow}
          start={spec.start}
          shown={jumped}
          unknown={false}
          older={false}
          play={mountedAt < DONE}
          arrive
          growAt={ROW_IN_MS}
          growMs={JUMP_GROW_MS}
          lane={lane}
          scaleD={scaleD}
          tick={{ text: spec.jump.tick, at: tickAt }}
          reduced={reduced}
        />
      </StageFrame>

      <View style={styles.controls}>
        {step < ASK ? (
          <Action label={spec.buttons.next} onPress={nextYear} />
        ) : step === ASK ? (
          spec.ask.options.map((o, i) => {
            const off = wrong.includes(i);
            const v = moneyIn(o)[0];
            return (
              <SpringPressable
                key={o}
                onPress={() => pick(i)}
                disabled={off}
                accessibilityRole="button"
                accessibilityLabel={v === undefined ? o : moneyWords(v)}
                accessibilityHint={off ? 'Already tried' : undefined}
                accessibilityState={{ disabled: off }}
                style={styles.chipSlot}
              >
                <View style={[styles.button, off && styles.buttonWrong]}>
                  <ThemedText style={[styles.buttonText, off && styles.buttonTextWrong]} maxFontSizeMultiplier={1.4}>{o}</ThemedText>
                </View>
              </SpringPressable>
            );
          })
        ) : step === RIGHT ? (
          <Action label={spec.buttons.jump} onPress={jump} />
        ) : (
          // Done: the row keeps its height so the frame above never shifts at the end.
          <View style={styles.spacer} />
        )}
      </View>
    </ScrollView>
  );
}

function Action({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <SpringPressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.chipSlot}>
      <View style={[styles.button, styles.buttonMain]}>
        <ThemedText style={styles.buttonTextMain} maxFontSizeMultiplier={1.4}>{label}</ThemedText>
      </View>
    </SpringPressable>
  );
}

/*
 * CONTRAST (CONSTITUTION 5.9, measured 2026-10-13). Row names are CLIP_MUTED on LessonColors.card,
 * 10.65:1; a pending name is shown at 40%, decoration until its row arrives, hidden from VoiceOver.
 * The tag is CLIP_MUTED on LessonColors.backgroundSelected, 8.86:1. A wrong chip's text is
 * LessonColors.warning on LessonColors.backgroundElement, 11.85:1. The main button is
 * LessonColors.text on LessonColors.backgroundSelected, 14.36:1.
 */
const styles = StyleSheet.create({
  scroll: { flex: 1, width: '100%' },
  wrap: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8 },
  title: { ...LessonTypography.heading, color: LessonColors.text, textAlign: 'center' },
  captionBar: { gap: 8 },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.hairline, backgroundColor: LessonColors.backgroundSelected },
  tagText: { ...LessonTypography.label, color: CLIP_MUTED },
  measure: { position: 'absolute', left: 0, right: 0, top: 0, height: 0, flexDirection: 'row', gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { ...LessonTypography.smallBold, color: CLIP_MUTED, width: NAME_W },
  namePending: { opacity: 0.4 },
  lane: { flex: 1, alignSelf: 'stretch', justifyContent: 'flex-end' },
  barLane: { position: 'absolute', left: 0, right: 0, bottom: (ROW_H - BAR_H) / 2, height: BAR_H },
  seg: { position: 'absolute', top: 0, bottom: 0 },
  totalCol: { width: TOTAL_W, alignItems: 'flex-end', justifyContent: 'center' },
  total: { ...LessonTypography.smallBold, color: LessonColors.text, fontVariant: ['tabular-nums'] },
  unknown: { ...LessonTypography.heading, color: LessonColors.accent },
  tickBox: { position: 'absolute', top: 0, width: TICK_BOX_W, alignItems: 'center' },
  tickText: { ...LessonTypography.label, color: CLIP_MUTED, lineHeight: 14 },
  // Starts under the row names: with the resize note it needs the row's full width.
  gapRow: { height: GAP_ROW_H, justifyContent: 'center' },
  gapText: { ...LessonTypography.small, color: CLIP_MUTED },
  // Reserves three lines (the 90-character ceiling) so the controls never jump between steps.
  captionBox: { minHeight: LessonTypography.bodyMedium.lineHeight * 3, justifyContent: 'center' },
  controls: { flexDirection: 'row', gap: 8, width: '100%', minHeight: 48 },
  chipSlot: { flex: 1 },
  spacer: { height: 48 },
  // 48pt, over the 44pt floor (CONSTITUTION 5.10).
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: Radius.md,
    backgroundColor: LessonColors.backgroundElement,
    borderWidth: 1,
    borderColor: LessonColors.border,
  },
  buttonMain: { backgroundColor: LessonColors.backgroundSelected, borderColor: LessonColors.accent, borderWidth: 2 },
  buttonWrong: { borderColor: LessonColors.warning, borderWidth: 2 },
  buttonText: { ...LessonTypography.smallBold, color: LessonColors.text, fontVariant: ['tabular-nums'] },
  buttonTextMain: { ...LessonTypography.smallBold, color: LessonColors.text },
  buttonTextWrong: { color: LessonColors.warning },
});
