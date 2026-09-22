/**
 * Stage card (M1): an authored bars, line or pictograph diagram played as a short Atlas clip.
 * Spec and every rule about its text: lib/mobile-lesson/clickthrough/stage.ts.
 *
 * WHAT THE LEARNER SEES. The frame stays put. Each beat draws ONE new item in the accent while the
 * items already drawn drop to muted ink (Brilliant's Koch stepper, research2/frames/timing/koch.jpg:
 * new segments red, old ones black), the item's authored sentence replaces the caption, and Atlas
 * reacts beside the title. Autoplay walks the beats; Back, Play/Pause/Replay and Next are buttons,
 * and the deck's Continue unlocks on the last beat through `onWorked`.
 *
 * DATA GEOMETRY IS MONOTONIC (AGENTS.md). Bars and line steps grow in whole cells with withTiming +
 * Ease.out (CellRect, and DropRect below with the same curve), never a spring: a bar that overshot
 * its authored height would show, for a frame, a figure the lesson never wrote. The value label
 * appears only when the geometry has finished, and it never counts up through numbers that were
 * not authored. The one overshoot on this card is Atlas's own celebrate on the last beat.
 *
 * REDUCED MOTION. Every beat is a cut to its end state: CellRect and DropRect jump, marks and labels
 * skip their fades, sprites do not play, and useClipTimeline neither autoplays nor offers Play.
 */
import { useEffect, useMemo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, useAnimatedProps, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { LessonColors, LessonTypography } from '@/constants/lesson-design';
import { Duration, Ease } from '@/shared/motion/tokens';
import { getSprite } from '@/lib/pixel/sprites';
import { PixelSpriteView } from '@/lib/pixel/PixelSprite';
import { CELL_PT, DRAW_MS, STAMP_STAGGER_MS, cellsFor, stampMotionMs } from '@/lib/mobile-lesson/clickthrough/timing';
import type { ClipBeat } from '@/lib/mobile-lesson/clickthrough/types';
import type { StageClipSpec } from '@/lib/mobile-lesson/clickthrough/stage';
import {
  AtlasCue,
  CellRect,
  CLIP_MUTED,
  ClipCaption,
  ClipControls,
  StageFrame,
  useCellSpan,
  useClipTimeline,
  type ClipTimeline,
} from './pixel-stage';

/** Plot height for bars and line. 36 cells: tall enough that a 1-cell first bar still reads as small, not absent. */
const PLOT_PT = 144;
/** One pictograph row: a label line plus an 18pt mark strip. */
const MARK_PT = 18;
const PICTO_ROW_PT = 52;
/** Muted ink for items already drawn. 3.7:1 on LessonColors.card, over the 3:1 floor for graphics. */
const DONE_INK = LessonColors.mutedForeground;
/**
 * Label text caps. The label row sits inside a fixed frame beside neighbours; at the largest
 * Dynamic Type an uncapped label would push the value line out of its column.
 */
const LABEL_SCALE_MAX = 1.4;

const AnimatedRect = Animated.createAnimatedComponent(Rect);

/** Motion of beat `k`: one draw for a bar, run then rise for a line step, the stamps for a row. */
function motionFor(spec: StageClipSpec, k: number): number {
  if (spec.mode === 'pictograph') return stampMotionMs(spec.items[k].magnitude);
  if (spec.mode === 'line' && k > 0) return DRAW_MS * 2;
  return DRAW_MS;
}

export function StageCard({ spec, onWorked }: { spec: StageClipSpec; onWorked: () => void }) {
  const beats = useMemo<ClipBeat[]>(
    () => spec.items.map((it, k) => ({ caption: it.caption, motionMs: motionFor(spec, k) })),
    [spec],
  );
  const timeline = useClipTimeline(beats, { onWorked });
  const [span, onLayout] = useCellSpan();
  const { beat, busy } = timeline;

  // An item's value is on screen once its geometry has landed: never mid-draw.
  const shown = (k: number) => k < beat || (k === beat && !busy);
  const longest = spec.items.reduce((a, it) => (it.caption.length > a.length ? it.caption : a), '');
  const drawnSummary = spec.items
    .filter((_, k) => shown(k))
    .map((it) => `${it.label}, ${it.display}`)
    .join('. ');

  const height = spec.mode === 'pictograph' ? spec.items.length * PICTO_ROW_PT : PLOT_PT;

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <AtlasCue reaction={timeline.reaction} cueKey={timeline.seq} />
        <ThemedText style={styles.title}>{spec.title}</ThemedText>
      </View>

      <StageFrame
        height={height}
        onLayout={onLayout}
        footer={
          <>
            {spec.mode === 'pictograph' ? null : <LabelRow spec={spec} shown={shown} beat={beat} span={span} />}
            <ClipControls timeline={timeline} />
          </>
        }
      >
        {/* One VoiceOver stop for the picture, naming only what is drawn so far; the caption and the
            controls carry the beat itself. */}
        <View style={StyleSheet.absoluteFill} accessible accessibilityRole="image" accessibilityLabel={drawnSummary || spec.title}>
          {span > 0 && spec.mode === 'bars' ? <Bars spec={spec} span={span} timeline={timeline} /> : null}
          {span > 0 && spec.mode === 'line' ? <Line spec={spec} span={span} timeline={timeline} /> : null}
          {spec.mode === 'pictograph' ? <Pictograph spec={spec} timeline={timeline} shown={shown} /> : null}
        </View>
      </StageFrame>

      <CaptionSlot longest={longest} text={spec.items[beat].caption} beatKey={timeline.seq} />
      {spec.mark ? <ThemedText style={styles.footer}>{`Each mark = ${spec.mark.unitLabel}`}</ThemedText> : null}
      {spec.footer ? <ThemedText style={styles.footer}>{spec.footer}</ThemedText> : null}
    </View>
  );
}

/**
 * The caption box is as tall as the LONGEST caption on this clip, measured by laying that sentence
 * out invisibly underneath. Without it a 2-line beat after a 4-line one shrank the box and the
 * controls and Continue jumped up under the learner's thumb mid-clip.
 */
function CaptionSlot({ longest, text, beatKey }: { longest: string; text: string; beatKey: number }) {
  return (
    <View style={styles.captionSlot}>
      <ThemedText style={[styles.caption, styles.sizer]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {longest}
      </ThemedText>
      <View style={StyleSheet.absoluteFill}>
        <ClipCaption text={text} beatKey={beatKey} />
      </View>
    </View>
  );
}

/** Columns: each item's slot is `col` cells wide; the mark sits centred in it. */
function columns(n: number, span: number) {
  const col = Math.max(1, Math.floor(span / n));
  return { col, center: (k: number) => k * col + Math.floor(col / 2) };
}

/** Bottom row of the plot (the baseline's cell) and the rows a bar or point may climb. */
const PLOT_CELLS = Math.floor(PLOT_PT / CELL_PT);
const BASE = PLOT_CELLS - 1;
const CLIMB = BASE - 2;

function Bars({ spec, span, timeline }: { spec: StageClipSpec; span: number; timeline: ClipTimeline }) {
  const { col } = columns(spec.items.length, span);
  const width = Math.max(2, Math.floor(col / 2));
  const max = Math.max(...spec.items.map((i) => i.magnitude));
  return (
    <Svg width={span * CELL_PT} height={PLOT_CELLS * CELL_PT}>
      <Rect x={0} y={BASE * CELL_PT} width={span * CELL_PT} height={CELL_PT} fill={LessonColors.backgroundSelected} />
      {spec.items.map((it, k) => {
        if (k > timeline.beat) return null;
        const current = k === timeline.beat;
        return (
          <CellRect
            // Remount per beat, so returning to this beat replays its draw from the baseline.
            key={current ? `${k}:${timeline.seq}` : `${k}:done`}
            grow="up"
            atCell={k * col + Math.floor((col - width) / 2)}
            baseCell={BASE}
            thickness={width}
            cells={cellsFor(it.magnitude, max, CLIMB)}
            fill={current ? LessonColors.accent : DONE_INK}
            animate={current && timeline.animate}
          />
        );
      })}
    </Svg>
  );
}

/**
 * The line extends as a STEPPED segment (design M1): a flat run at the previous value to the new
 * column, then a rise or drop to the new value. A diagonal would imply every value in between was
 * passed through on the way, a price path the lesson never authored; the step says only "was this,
 * then was that".
 */
function Line({ spec, span, timeline }: { spec: StageClipSpec; span: number; timeline: ClipTimeline }) {
  const { center } = columns(spec.items.length, span);
  const max = Math.max(...spec.items.map((i) => i.magnitude));
  const y = (k: number) => BASE - cellsFor(spec.items[k].magnitude, max, CLIMB);
  const parts: ReactNode[] = [
    <Rect key="base" x={0} y={BASE * CELL_PT} width={span * CELL_PT} height={CELL_PT} fill={LessonColors.backgroundSelected} />,
  ];
  for (let k = 0; k <= timeline.beat && k < spec.items.length; k++) {
    const current = k === timeline.beat;
    const anim = current && timeline.animate;
    const fill = current ? LessonColors.accent : DONE_INK;
    const key = current ? `${k}:${timeline.seq}` : `${k}:done`;
    const x = center(k);
    const yk = y(k);
    if (k === 0) {
      parts.push(<CellRect key={`m${key}`} grow="right" atCell={x - 1} baseCell={yk - 1} thickness={2} cells={2} fill={fill} animate={anim} />);
      continue;
    }
    const px = center(k - 1);
    const py = y(k - 1);
    // The run sits on the previous point's row; the rise or drop starts where the run ends.
    parts.push(<CellRect key={`r${key}`} grow="right" atCell={px} baseCell={py} thickness={1} cells={x - px + 1} fill={fill} animate={anim} />);
    if (yk < py) {
      parts.push(<CellRect key={`v${key}`} grow="up" atCell={x} baseCell={py + 1} thickness={1} cells={py + 1 - yk} fill={fill} animate={anim} delayMs={DRAW_MS} />);
    } else if (yk > py) {
      parts.push(<DropRect key={`v${key}`} atCell={x} topCell={py} cells={yk - py + 1} fill={fill} animate={anim} delayMs={DRAW_MS} />);
    }
  }
  return (
    <Svg width={span * CELL_PT} height={PLOT_CELLS * CELL_PT}>
      {parts}
    </Svg>
  );
}

/**
 * A one-cell-wide rect that grows DOWN from `topCell`. The kit's CellRect grows up or right only,
 * and a falling line step (Purchasing Power, a price drop) drawn as "grow up from the lower point"
 * would appear to rise from the bottom, the opposite of what the value did. Same curve and the
 * same whole-cell floor as CellRect, so it never overshoots or draws a sub-cell seam.
 */
function DropRect({ atCell, topCell, cells, fill, animate, delayMs }: { atCell: number; topCell: number; cells: number; fill: string; animate: boolean; delayMs: number }) {
  const reduced = !!useReducedMotion();
  const n = useSharedValue(animate && !reduced ? 0 : cells);
  useEffect(() => {
    if (!animate || reduced) {
      n.set(cells);
      return;
    }
    n.set(withDelay(delayMs, withTiming(cells, { duration: DRAW_MS, easing: Ease.out })));
  }, [cells, animate, reduced, delayMs, n]);
  const props = useAnimatedProps(() => ({
    x: atCell * CELL_PT,
    y: topCell * CELL_PT,
    width: CELL_PT,
    height: Math.floor(n.get()) * CELL_PT,
  }));
  return <AnimatedRect animatedProps={props} fill={fill} />;
}

/**
 * Label and value under each column. The value waits for its geometry (`shown`).
 * Each column is exactly the plot's `col` cells wide, not flex: 1. The plot's columns are whole
 * cells and the leftover cells sit at the right edge, so equal flex columns drifted up to half a
 * column off their bar or line point (about 8pt on the 4-point latte line at 375pt), and the value
 * read as belonging to the neighbouring point.
 */
function LabelRow({ spec, shown, beat, span }: { spec: StageClipSpec; shown: (k: number) => boolean; beat: number; span: number }) {
  const reduced = !!useReducedMotion();
  const colStyle = span > 0 ? { width: columns(spec.items.length, span).col * CELL_PT } : styles.labelFlex;
  return (
    <View style={styles.labels} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {spec.items.map((it, k) => (
        <View key={k} style={[styles.labelCol, colStyle]}>
          <ThemedText style={[styles.label, k === beat && styles.labelOn]} maxFontSizeMultiplier={LABEL_SCALE_MAX} numberOfLines={2}>
            {it.label}
          </ThemedText>
          {shown(k) ? (
            <Animated.View entering={reduced ? undefined : FadeIn.duration(Duration.fast)}>
              <ThemedText style={[styles.value, k === beat && styles.valueOn]} maxFontSizeMultiplier={LABEL_SCALE_MAX}>
                {it.display}
              </ThemedText>
            </Animated.View>
          ) : (
            // Holds the value line's height so the row does not grow when the first value lands.
            <ThemedText style={[styles.value, styles.hidden]} maxFontSizeMultiplier={LABEL_SCALE_MAX}> </ThemedText>
          )}
        </View>
      ))}
    </View>
  );
}

/** Rows appear one per beat; the new row's marks stamp in left to right, STAMP_STAGGER_MS apart. */
function Pictograph({ spec, timeline, shown }: { spec: StageClipSpec; timeline: ClipTimeline; shown: (k: number) => boolean }) {
  const reduced = !!useReducedMotion();
  const sprite = spec.mark ? getSprite(spec.mark.sprite) : undefined;
  // stage.ts refuses a pictograph whose sprite is missing, so this only guards a hand-built spec.
  if (!sprite) return null;
  return (
    <View style={styles.picto}>
      {spec.items.map((it, k) => {
        if (k > timeline.beat) return <View key={k} style={styles.pictoRow} />;
        const current = k === timeline.beat;
        const stamp = current && timeline.animate && !reduced;
        return (
          <View key={current ? `${k}:${timeline.seq}` : `${k}:done`} style={[styles.pictoRow, !current && styles.pictoDone]}>
            <View style={styles.pictoHead}>
              <ThemedText style={[styles.label, current && styles.labelOn, styles.pictoLabel]} maxFontSizeMultiplier={LABEL_SCALE_MAX} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                {it.label}
              </ThemedText>
              {shown(k) ? (
                <ThemedText style={[styles.value, current && styles.valueOn]} maxFontSizeMultiplier={LABEL_SCALE_MAX}>
                  {it.display}
                </ThemedText>
              ) : null}
            </View>
            <View style={styles.marks}>
              {Array.from({ length: it.magnitude }, (_, i) => (
                <Animated.View key={i} entering={stamp ? FadeIn.delay(i * STAMP_STAGGER_MS).duration(DRAW_MS).easing(Ease.out) : undefined}>
                  <PixelSpriteView sprite={sprite} size={MARK_PT} play={stamp ? 'once' : 'none'} canvas="dark" />
                </Animated.View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 16, width: '100%' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'stretch' },
  title: { ...LessonTypography.heading, color: LessonColors.text, flex: 1 },
  labels: { flexDirection: 'row' },
  labelCol: { alignItems: 'center', paddingHorizontal: 2 },
  labelFlex: { flex: 1 },
  label: { ...LessonTypography.small, color: CLIP_MUTED, textAlign: 'center' },
  labelOn: { color: LessonColors.text },
  value: { ...LessonTypography.smallBold, color: CLIP_MUTED, textAlign: 'center' },
  valueOn: { color: LessonColors.accent },
  hidden: { opacity: 0 },
  captionSlot: { width: '100%' },
  caption: { ...LessonTypography.bodyMedium, textAlign: 'center' },
  // Invisible, but laid out, so the slot takes the longest caption's height. At least three lines,
  // matching ClipCaption's own reserve so a short clip does not sit tighter than the kit.
  sizer: { opacity: 0, minHeight: LessonTypography.bodyMedium.lineHeight * 3 },
  footer: { ...LessonTypography.small, color: CLIP_MUTED, textAlign: 'center' },
  picto: { flex: 1 },
  pictoRow: { height: PICTO_ROW_PT, justifyContent: 'center', gap: 4 },
  pictoDone: { opacity: 0.55 },
  pictoHead: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  pictoLabel: { flex: 1, textAlign: 'left' },
  marks: { flexDirection: 'row', gap: 4, height: MARK_PT },
});
