/**
 * Build-up card (design M3): an authored flow or stack assembles itself piece by piece, in authored
 * order, and then Atlas walks through what each piece means. Plays like a short Atlas clip.
 *
 * WHAT THE LEARNER SEES.
 *   1. On mount the diagram builds: piece k's connector grows down from piece k-1's edge, then its
 *      row fills left to right in whole cells, then its label fades in. The whole build lands
 *      inside BUILD_MAX_MS (5s, Hilbert's budget at CLIP_TEMPO); the timing is pieceTiming() in buildup.ts,
 *      which the pin checks, not numbers typed here.
 *   2. The clip then runs one beat per piece: that piece is outlined in accent and its authored
 *      `explain` is the caption beside Atlas. Back / Play / Next and the dots are the shared
 *      ClipControls; Replay re-runs the build from nothing.
 *   3. Every piece is a button. Tapping one pauses the clip and shows that piece's explain, with a
 *      nod from Atlas (the tap-to-explain contract grid cells already have, curriculum/types.ts).
 *   Worked (CardDeck's Continue gate) = the build has landed AND the learner either reached the
 *   last beat or tapped a piece.
 *
 * DATA GEOMETRY NEVER OVERSHOOTS (AGENTS.md). Fills are the kit's CellRect (withTiming + Ease.out,
 * whole cells); the connector below uses the same curve. The only overshoot on this card is
 * AtlasCue's celebrate on the last beat, which is Atlas, not data.
 *
 * NO AUTHORED HEX. BuildSpec has no colour field (buildup.ts drops the authored segment colours),
 * so tiers take their marker from TIER_RAMP, theme tokens only.
 *
 * REDUCED MOTION. The diagram is fully built on the first frame, no connector grows, no label
 * fades, and ClipControls hides Play/Replay (pixel-stage.tsx). Beats are cuts.
 *
 * ONE MASCOT PER SCREEN. This card mounts AtlasCue, so the lesson's floating Ask-Atlas button must
 * hide while it is the active card (CLIP_DRAWS_ATLAS in pixel-stage.tsx, the integrator's job).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg from 'react-native-svg';

import {
  AtlasCue,
  CellRect,
  CLIP_MUTED,
  ClipCaption,
  ClipControls,
  StageFrame,
  useClipTimeline,
} from '@/components/mobile-lesson/clickthrough/pixel-stage';
import { ThemedText } from '@/components/themed-text';
import { LessonColors, LessonTypography } from '@/constants/lesson-design';
import {
  beatsFor,
  buildDurationMs,
  LABEL_FADE_MS,
  pieceTiming,
  TIER_MIN_CELLS,
  tierCells,
} from '@/lib/mobile-lesson/clickthrough/buildup';
import { CELL_PT } from '@/lib/mobile-lesson/clickthrough/timing';
import type { BuildPiece, BuildSpec } from '@/lib/mobile-lesson/clickthrough/types';
import { Ease } from '@/shared/motion/tokens';
import { SpringPressable } from '@/shared/motion/spring-pressable';

/** Connector length between flow nodes, in cells (16pt). */
const CONNECTOR_CELLS = 4;
/** Connector and tier marker thickness, in cells. */
const MARK_CELLS = 2;
/** Gap between stack tiers, in cells: tiers touch in a waterfall, but a seam keeps them countable. */
const TIER_GAP_CELLS = 1;
/** Flow rows share the tier floor: 48pt, over the 44pt target (CONSTITUTION 5.10). */
const FLOW_ROW_CELLS = TIER_MIN_CELLS;

/*
 * The tier marker ramp, top tier lightest to bottom darkest, so a waterfall reads as draining.
 * Theme tokens only: the authored '#10B981'-style segment colours never get here (CONSTITUTION 5.8),
 * and a literal hex in this file would also trip design-rules-pin's ratchet.
 */
const TIER_RAMP = [
  LessonColors.iconLilac,
  LessonColors.iconViolet,
  LessonColors.accent,
  LessonColors.primary,
  LessonColors.ctaDepth,
] as const;

export function BuildupCard({ spec, onWorked }: { spec: BuildSpec; onWorked: () => void }) {
  const reduced = !!useReducedMotion();
  const beats = useMemo(() => beatsFor(spec), [spec]);
  const total = useMemo(() => buildDurationMs(spec), [spec]);
  const maxWeight = useMemo(() => Math.max(0, ...spec.pieces.map((p) => p.weight ?? 0)), [spec]);

  // Once, from either path (last beat, or a tap after the build). A ref, so a parent re-rendering
  // with a new callback cannot fire Continue's gate twice.
  const workedRef = useRef(false);
  const onWorkedRef = useRef(onWorked);
  useEffect(() => {
    onWorkedRef.current = onWorked;
  }, [onWorked]);
  const fireWorked = useCallback(() => {
    if (workedRef.current) return;
    workedRef.current = true;
    onWorkedRef.current();
  }, []);

  const timeline = useClipTimeline(beats, { onWorked: fireWorked });

  /*
   * Which build is on screen. A change that lands on beat 0 WITH animation is only ever Replay
   * (Back is a cut, Next never lands on 0), and a replay must redraw from nothing, so the build is
   * keyed on that change's seq. Adjusted during render, React's documented pattern, so the rebuild
   * starts on the same frame as the replayed beat rather than one effect later.
   */
  const [buildSeq, setBuildSeq] = useState(timeline.seq);
  if (timeline.beat === 0 && timeline.animate && timeline.seq !== buildSeq) setBuildSeq(timeline.seq);

  // Pieces only take taps once the build has landed: a tap mid-build would caption a row that is
  // still half drawn and has no label on it yet.
  const [doneSeq, setDoneSeq] = useState<number | null>(null);
  useEffect(() => {
    if (reduced) return;
    const id = setTimeout(() => setDoneSeq(buildSeq), total);
    return () => clearTimeout(id);
  }, [buildSeq, total, reduced]);
  const built = reduced || doneSeq === buildSeq;

  // A tapped piece overrides the beat until the timeline next moves (its seq changes).
  const [focus, setFocus] = useState<{ k: number; seq: number; n: number } | null>(null);
  const focusOn = focus !== null && focus.seq === timeline.seq;
  const shown = focusOn ? focus.k : timeline.beat;

  const { playing, playPause, seq } = timeline;
  const onTap = useCallback(
    (k: number) => {
      if (!built) return;
      if (playing) playPause();
      setFocus((f) => ({ k, seq, n: (f?.n ?? 0) + 1 }));
      AccessibilityInfo.announceForAccessibility(spec.pieces[k]?.caption ?? '');
      fireWorked();
    },
    [built, playing, playPause, seq, spec.pieces, fireWorked],
  );

  // The diagram's natural height, measured, so the frame never clips a label at large Dynamic Type.
  const estimate = useMemo(() => estimateCells(spec, maxWeight) * CELL_PT, [spec, maxWeight]);
  const [measured, setMeasured] = useState(0);
  const onColumn = useCallback((e: LayoutChangeEvent) => {
    const h = Math.ceil(e.nativeEvent.layout.height / CELL_PT) * CELL_PT;
    setMeasured((m) => (m === h ? m : h));
  }, []);

  /*
   * The timeline clamps beat 0's motion to BEAT_MAX_MS (3500ms), but a 4-piece build runs 3660ms,
   * so its own `busy` let Next go live mid-build and caption a row that had no label on it yet.
   * The controls wait on the build as well.
   */
  const controls = useMemo(() => ({ ...timeline, busy: timeline.busy || !built }), [timeline, built]);

  const cueKey = focusOn ? -focus.n : timeline.seq;
  const caption = spec.pieces[shown]?.caption ?? '';

  return (
    <View style={styles.card}>
      <ThemedText style={styles.title} accessibilityRole="header">
        {spec.title}
      </ThemedText>
      <StageFrame height={measured || estimate} footer={<ClipControls timeline={controls} />}>
        <View style={styles.column} onLayout={onColumn}>
          {spec.pieces.map((piece, k) => (
            <View key={k}>
              {spec.mode === 'flow' && k > 0 ? (
                <Connector buildSeq={buildSeq} k={k} reduced={reduced} />
              ) : null}
              <PieceRow
                piece={piece}
                k={k}
                mode={spec.mode}
                rowCells={spec.mode === 'stack' ? tierCells(piece.weight, maxWeight) : FLOW_ROW_CELLS}
                marker={spec.mode === 'stack' ? TIER_RAMP[Math.min(k, TIER_RAMP.length - 1)] : LessonColors.accent}
                on={k === shown}
                built={built}
                buildSeq={buildSeq}
                reduced={reduced}
                onTap={onTap}
                total={spec.pieces.length}
              />
            </View>
          ))}
        </View>
      </StageFrame>
      <View style={styles.atlasRow}>
        <AtlasCue reaction={focusOn ? 'nod' : timeline.reaction} cueKey={cueKey} />
        <View style={styles.captionCol}>
          <ClipCaption text={caption} beatKey={cueKey} />
        </View>
      </View>
      {spec.footer ? <ThemedText style={styles.footer}>{spec.footer}</ThemedText> : null}
    </View>
  );
}

function estimateCells(spec: BuildSpec, maxWeight: number): number {
  const n = spec.pieces.length;
  if (spec.mode === 'flow') return n * FLOW_ROW_CELLS + (n - 1) * CONNECTOR_CELLS;
  return spec.pieces.reduce((s, p) => s + tierCells(p.weight, maxWeight), 0) + (n - 1) * TIER_GAP_CELLS;
}

/**
 * The line from piece k-1 down to piece k. Top-anchored, so it grows DOWN out of the node above,
 * in whole cells (floor, like CellRect: a half cell would draw an anti-aliased seam).
 */
function Connector({ buildSeq, k, reduced }: { buildSeq: number; k: number; reduced: boolean }) {
  const t = pieceTiming(k);
  const n = useSharedValue(reduced ? CONNECTOR_CELLS : 0);
  useEffect(() => {
    if (reduced) {
      n.set(CONNECTOR_CELLS);
      return;
    }
    n.set(0);
    n.set(withDelay(t.connectorAt, withTiming(CONNECTOR_CELLS, { duration: t.connectorMs, easing: Ease.out })));
  }, [buildSeq, reduced, t.connectorAt, t.connectorMs, n]);
  const style = useAnimatedStyle(() => ({ height: Math.floor(n.get()) * CELL_PT }));
  return (
    <View style={styles.connectorSlot} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <Animated.View style={[styles.connector, style]} />
    </View>
  );
}

function PieceRow({
  piece,
  k,
  mode,
  rowCells,
  marker,
  on,
  built,
  buildSeq,
  reduced,
  onTap,
  total,
}: {
  piece: BuildPiece;
  k: number;
  mode: BuildSpec['mode'];
  rowCells: number;
  marker: string;
  on: boolean;
  built: boolean;
  buildSeq: number;
  reduced: boolean;
  onTap: (k: number) => void;
  total: number;
}) {
  const t = pieceTiming(k);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = Math.floor(e.nativeEvent.layout.width / CELL_PT);
    const h = Math.floor(e.nativeEvent.layout.height / CELL_PT);
    setBox((b) => (b.w === w && b.h === h ? b : { w, h }));
  }, []);

  const label = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) {
      label.set(1);
      return;
    }
    label.set(0);
    label.set(withDelay(t.labelAt, withTiming(1, { duration: LABEL_FADE_MS, easing: Ease.out })));
  }, [buildSeq, reduced, t.labelAt, label]);
  const labelStyle = useAnimatedStyle(() => ({ opacity: label.get() }));

  const position = mode === 'stack' ? `Tier ${k + 1} of ${total}` : `Step ${k + 1} of ${total}`;
  return (
    <SpringPressable
      onPress={() => onTap(k)}
      disabled={!built}
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={`${position}: ${piece.label}${piece.tag ? `, ${piece.tag}` : ''}`}
      accessibilityHint="Atlas explains this piece"
      accessibilityState={{ disabled: !built, selected: on }}
    >
      <View
        onLayout={onLayout}
        style={[styles.row, { minHeight: rowCells * CELL_PT }, on ? styles.rowOn : null, mode === 'stack' && k > 0 ? styles.tierGap : null]}
      >
        {/* Keyed on the build so Replay remounts every CellRect at zero and redraws it. */}
        <Svg key={buildSeq} width={box.w * CELL_PT} height={box.h * CELL_PT} style={StyleSheet.absoluteFill}>
          <CellRect
            grow="right"
            atCell={0}
            baseCell={0}
            thickness={box.h}
            cells={box.w}
            fill={LessonColors.backgroundSelected}
            animate={!reduced}
            delayMs={t.fillAt}
            durationMs={t.fillMs}
          />
          <CellRect
            grow="up"
            atCell={0}
            baseCell={box.h}
            thickness={MARK_CELLS}
            cells={box.h}
            fill={marker}
            animate={!reduced}
            delayMs={t.fillAt}
            durationMs={t.fillMs}
          />
        </Svg>
        <Animated.View style={[styles.rowText, labelStyle]}>
          {/* 1.6x cap: past it a five-tier stack no longer fits a 667pt screen with the controls. */}
          <ThemedText style={styles.label} maxFontSizeMultiplier={1.6}>
            {piece.label}
          </ThemedText>
          {piece.tag ? (
            <ThemedText style={styles.tag} maxFontSizeMultiplier={1.6}>
              {piece.tag}
            </ThemedText>
          ) : null}
        </Animated.View>
      </View>
    </SpringPressable>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', gap: CELL_PT * 3 },
  title: { ...LessonTypography.heading, color: LessonColors.text },
  column: { position: 'absolute', top: 0, left: 0, right: 0 },
  // Square on purpose: a rounded row clipped the 2-cell marker into a half-pill, a round shape in
  // a cell-grid diagram (CONSTITUTION 5.5). Only the kit's frame is rounded.
  row: {
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: LessonColors.border,
    overflow: 'hidden',
  },
  // Same border width on and off, so the highlight never shifts a row by a point.
  rowOn: { borderColor: LessonColors.accent },
  tierGap: { marginTop: TIER_GAP_CELLS * CELL_PT },
  rowText: {
    paddingLeft: (MARK_CELLS + 2) * CELL_PT,
    paddingRight: CELL_PT * 3,
    paddingVertical: CELL_PT * 2,
  },
  label: { ...LessonTypography.smallBold, color: LessonColors.text },
  tag: { ...LessonTypography.small, color: CLIP_MUTED },
  // paddingLeft = the row border width, so the connector sits exactly over the marker inside it.
  connectorSlot: { height: CONNECTOR_CELLS * CELL_PT, paddingLeft: 2 },
  connector: { width: MARK_CELLS * CELL_PT, backgroundColor: LessonColors.accent },
  atlasRow: { flexDirection: 'row', alignItems: 'center', gap: CELL_PT * 3 },
  captionCol: { flex: 1 },
  footer: { ...LessonTypography.small, color: CLIP_MUTED, textAlign: 'center' },
});
