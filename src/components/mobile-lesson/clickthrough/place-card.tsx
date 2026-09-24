/**
 * Tap-to-place card (M4): the lesson's diagram drawn without its labels, the labels in a tray, and
 * Atlas beside it reacting as the learner puts them back. Data and rules: lib/mobile-lesson/
 * clickthrough/place.ts (the builder, the seeded order and the reducer the pin plays).
 *
 * HOW IT PLAYS AS A CLIP.
 *   1. The diagram draws itself in: waffle runs fade in slot by slot, stack tiers grow up in whole
 *      cells, pictograph marks stamp in left to right. Atlas looks at it.
 *   2. The learner taps a label (it lifts TOKEN_LIFT_PT over TOKEN_LIFT_MS, a colour change and a
 *      translate, no scale), then taps a spot (the label arrives over TOKEN_MOVE_MS).
 *   3. Check grades every spot at once, verdicts landing VERDICT_STAGGER_MS apart top to bottom.
 *      Right ones lock green. Wrong ones go AMBER, never red (owner decision 4: the first miss is
 *      amber with Try again), and Try again sends only those back to the tray.
 *   4. Solved: Atlas celebrates once, Continue unlocks, and the card becomes a stepper through each
 *      spot's authored explain on the shared ClipControls, so the payoff is the lesson's own words.
 *
 * TAP ONLY, NEVER DRAG (CONSTITUTION 5.10). Every label and every spot is a button with a 44pt
 * minimum, and the pin fails if a PanResponder or gesture handler appears in this file.
 *
 * DATA GEOMETRY NEVER OVERSHOOTS (AGENTS.md). Cells, tiers and marks use timing with Ease.out or
 * plain fades; the only overshoot on the card is Atlas's own celebrate inside AtlasCue.
 *
 * REDUCED MOTION. The diagram is drawn on arrival, a picked label changes colour without moving,
 * placement and verdicts are instant, and the solved stepper does not autoplay.
 */
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { G, Rect } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { LessonColors, LessonTypography } from '@/constants/lesson-design';
import { Colors, Radius } from '@/constants/theme';
import { getSprite, PixelSpriteView } from '@/lib/pixel';
import {
  allFilled,
  awaitingRetry,
  initialPlace,
  marksFor,
  placeLayout,
  placeReducer,
  sizeWords,
  trayTokens,
  waffleCells,
  WAFFLE_SIDE,
  type PlaceBuilt,
} from '@/lib/mobile-lesson/clickthrough/place';
import {
  BAR_IN_MS,
  CELL_PT,
  DRAW_MS,
  STAMP_STAGGER_MS,
  TOKEN_LIFT_MS,
  TOKEN_LIFT_PT,
  TOKEN_MOVE_MS,
  VERDICT_STAGGER_MS,
} from '@/lib/mobile-lesson/clickthrough/timing';
import type { ClipBeat, PlaceSpec } from '@/lib/mobile-lesson/clickthrough/types';
import { Ease } from '@/shared/motion/tokens';
import { SpringPressable } from '@/shared/motion/spring-pressable';
import { AtlasCue, CellRect, ClipCaption, CLIP_MUTED, ClipControls, useClipTimeline } from './pixel-stage';

/*
 * SLOT FILLS, theme tokens only (CONSTITUTION 5.8; the pie's authored segment hex is
 * dropped). Chosen to differ in LIGHTNESS, not just hue, so the swatch-to-run link survives colour
 * blindness: iconPurple (mid), iconGold (bright), textSecondary (pale), streak (mid-warm). None is
 * success green or warning amber, which on this card mean right and wrong.
 */
const FILLS = [Colors.dark.iconPurple, Colors.dark.iconGold, Colors.dark.textSecondary, Colors.dark.streak];
const fillOf = (slot: number) => FILLS[slot % FILLS.length];

/* Waffle: 10 x 10 cells of 3 CELL_PT with 1 CELL_PT gaps = 156pt square, whole cells throughout. */
const WAFFLE_CELL = CELL_PT * 3;
const WAFFLE_GAP = CELL_PT;
const WAFFLE_PT = WAFFLE_SIDE * WAFFLE_CELL + (WAFFLE_SIDE - 1) * WAFFLE_GAP;
/* Stack: a 12-cell-wide column, 40 cells (160pt) tall, to sit beside the spots like the waffle. */
const STACK_W = 12;
const STACK_H = 40;
/* Pictograph mark: 16pt, so PLACE_MAX_MARKS (12) plus gaps fits beside a label spot at 375pt. */
const MARK_PT = 16;

const AnimatedG = Animated.createAnimatedComponent(G);

type Tone = 'empty' | 'filled' | 'right' | 'wrong' | 'focus';
const TONE: Record<Tone, string> = {
  empty: LessonColors.border,
  filled: LessonColors.accent,
  right: LessonColors.success,
  wrong: LessonColors.warning,
  focus: LessonColors.text,
};

/** One waffle run (all of a slot's cells), fading in after the runs before it. */
function WaffleRun({ cells, fill, order, animate }: { cells: number[]; fill: string; order: number; animate: boolean }) {
  const o = useSharedValue(animate ? 0 : 1);
  useEffect(() => {
    o.set(animate ? withDelay(order * DRAW_MS, withTiming(1, { duration: DRAW_MS, easing: Ease.out })) : 1);
  }, [animate, order, o]);
  const props = useAnimatedProps(() => ({ opacity: o.get() }));
  return (
    <AnimatedG animatedProps={props}>
      {cells.map((i) => (
        <Rect
          key={i}
          x={(i % WAFFLE_SIDE) * (WAFFLE_CELL + WAFFLE_GAP)}
          y={Math.floor(i / WAFFLE_SIDE) * (WAFFLE_CELL + WAFFLE_GAP)}
          width={WAFFLE_CELL}
          height={WAFFLE_CELL}
          fill={fill}
        />
      ))}
    </AnimatedG>
  );
}

function Waffle({ spec, animate }: { spec: PlaceSpec; animate: boolean }) {
  const runs = useMemo(() => {
    const all = waffleCells(spec);
    return spec.slots.map((_, k) => all.flatMap((s, i) => (s === k ? [i] : [])));
  }, [spec]);
  return (
    <Svg width={WAFFLE_PT} height={WAFFLE_PT}>
      {runs.map((cells, k) => (
        <WaffleRun key={k} cells={cells} fill={fillOf(k)} order={k} animate={animate} />
      ))}
    </Svg>
  );
}

/** Tiers top to bottom in authored order, heights in whole cells, grown up from the bottom tier. */
function Stack({ spec, animate }: { spec: PlaceSpec; animate: boolean }) {
  const total = spec.slots.reduce((a, s) => a + s.magnitude, 0);
  // Largest-remainder rounding so the tiers fill exactly STACK_H cells; every tier keeps at least one
  // cell, because a positive authored share drawn as nothing is the same lie as drawing it wrong.
  const heights = useMemo(() => {
    const exact = spec.slots.map((s) => (s.magnitude / total) * STACK_H);
    const h = exact.map((e) => Math.max(1, Math.floor(e)));
    let left = STACK_H - h.reduce((a, b) => a + b, 0);
    const byRemainder = exact.map((e, i) => [e - Math.floor(e), i] as const).sort((a, b) => b[0] - a[0]);
    for (let j = 0; left > 0 && j < byRemainder.length; j += 1, left -= 1) h[byRemainder[j][1]] += 1;
    return h;
  }, [spec, total]);
  // Bottom tier first, each standing on the one below. Every tier draws its FULL height: a gap cell
  // taken out of a tier would draw 20% as 17.5%, and the distinct theme fills already separate them.
  const tiers: { k: number; h: number; base: number; fromBottom: number }[] = [];
  let base = STACK_H;
  for (let k = heights.length - 1; k >= 0; k -= 1) {
    tiers.push({ k, h: heights[k], base, fromBottom: tiers.length });
    base -= heights[k];
  }
  return (
    <Svg width={STACK_W * CELL_PT} height={STACK_H * CELL_PT}>
      {tiers.map((t) => (
        <CellRect
          key={t.k}
          grow="up"
          atCell={0}
          baseCell={t.base}
          thickness={STACK_W}
          cells={t.h}
          fill={fillOf(t.k)}
          animate={animate}
          delayMs={t.fromBottom * DRAW_MS}
        />
      ))}
    </Svg>
  );
}

/** A pictograph row: whole marks stamped left to right, then the authored fraction of one more. */
function Marks({ spec, slot, animate }: { spec: PlaceBuilt; slot: number; animate: boolean }) {
  const sprite = spec.mark ? getSprite(spec.mark.sprite) : undefined;
  if (!sprite) return null;
  const count = marksFor(spec, spec.slots[slot]);
  const full = Math.floor(count);
  const fraction = count - full;
  // The partial mark is cut on a whole sprite pixel (MARK_PT is the sprite's 16px width, so 1pt =
  // 1px): 0.2 of a coin at 3.2pt split a pixel column and drew a blurred half-pixel edge beside
  // crisp art. At least 1px, so a positive authored remainder is never drawn as nothing.
  const partialPt = fraction > 0 ? Math.max(1, Math.round(MARK_PT * fraction)) : 0;
  const n = full + (partialPt > 0 ? 1 : 0);
  return (
    <View style={styles.marks}>
      {Array.from({ length: n }, (_, i) => (
        <Animated.View
          key={i}
          entering={animate ? FadeIn.delay(i * STAMP_STAGGER_MS).duration(DRAW_MS) : undefined}
          // The partial mark is clipped, not scaled: 0.2 of a coin is a fifth of its width, and
          // scaling both axes would draw it at a twenty-fifth of the area.
          style={i === full ? { width: partialPt, height: MARK_PT, overflow: 'hidden' } : null}
        >
          <PixelSpriteView sprite={sprite} size={MARK_PT} />
        </Animated.View>
      ))}
    </View>
  );
}

/** A spot's label box. Its border carries the verdict, landing `delayMs` after Check. */
function SpotBox({ tone, delayMs, text, reduced }: { tone: Tone; delayMs: number; text: string | null; reduced: boolean }) {
  const [from, setFrom] = useState(tone);
  const p = useSharedValue(1);
  const prev = useRef(tone);
  useEffect(() => {
    if (prev.current === tone) return;
    setFrom(prev.current);
    prev.current = tone;
    const verdict = tone === 'right' || tone === 'wrong';
    if (reduced || !verdict) {
      p.set(1);
      return;
    }
    p.set(0);
    p.set(withDelay(delayMs, withTiming(1, { duration: TOKEN_LIFT_MS, easing: Ease.out })));
  }, [tone, delayMs, reduced, p]);
  const a = TONE[from];
  const b = TONE[tone];
  const border = useAnimatedStyle(() => ({ borderColor: interpolateColor(p.get(), [0, 1], [a, b]) }));
  return (
    <Animated.View style={[styles.spot, text === null && styles.spotEmpty, border]}>
      {text === null ? (
        <ThemedText style={styles.spotHint}>?</ThemedText>
      ) : (
        <Animated.View key={text} entering={reduced ? undefined : FadeIn.duration(TOKEN_MOVE_MS).easing(Ease.out)}>
          <ThemedText style={[styles.spotText, tone === 'wrong' && { color: LessonColors.warning }]}>{text}</ThemedText>
        </Animated.View>
      )}
    </Animated.View>
  );
}

/** A tray label. Lifted: raised TOKEN_LIFT_PT and outlined, a translate and a colour, never a scale. */
function Token({ label, picked, onPress, reduced }: { label: string; picked: boolean; onPress: () => void; reduced: boolean }) {
  const y = useSharedValue(0);
  useEffect(() => {
    const to = picked && !reduced ? -TOKEN_LIFT_PT : 0;
    y.set(reduced ? to : withTiming(to, { duration: TOKEN_LIFT_MS, easing: Ease.out }));
  }, [picked, reduced, y]);
  const lift = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));
  return (
    <SpringPressable
      onPress={onPress}
      scaleTo={1}
      entering={reduced ? undefined : FadeIn.duration(TOKEN_MOVE_MS)}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={picked ? 'Picked. Now tap the spot it belongs in.' : 'Picks this label.'}
      accessibilityState={{ selected: picked }}
    >
      <Animated.View style={[styles.token, picked && styles.tokenOn, lift]}>
        <ThemedText style={styles.tokenText}>{label}</ThemedText>
      </Animated.View>
    </SpringPressable>
  );
}

/**
 * `onWorked` receives `{ firstTry }` (owner decision 4: only the first try counts toward XP and
 * mastery). A deck handler typed `() => void` still fits, so wiring it needs no change here; the
 * integrator reads `firstTry` when scoring.
 */
export function PlaceCard({ spec, onWorked }: { spec: PlaceSpec; onWorked: (result: { firstTry: boolean }) => void }) {
  const built = spec as PlaceBuilt;
  const reduced = !!useReducedMotion();
  const n = spec.slots.length;
  const { slotOrder, tokenOrder } = useMemo(() => placeLayout(spec), [spec]);
  const words = useMemo(() => sizeWords(spec), [spec]);
  const [state, dispatch] = useReducer(placeReducer, n, initialPlace);
  /** A locked spot the learner tapped before solving: its authored explain shows in the caption. */
  const [focus, setFocus] = useState<number | null>(null);

  // The solved stepper walks the spots top to bottom as drawn, one authored explain per beat.
  const beats = useMemo<ClipBeat[]>(
    () => slotOrder.map((s) => ({ caption: spec.slots[s].caption, motionMs: DRAW_MS, reaction: 'nod' })),
    [slotOrder, spec],
  );
  const timeline = useClipTimeline(beats, { autoplay: false });
  const { replay } = timeline;

  // onWorked fires once, on the solve, and is read through a ref so a parent re-rendering with a new
  // callback cannot fire it twice (the same guard useClipTimeline keeps).
  const workedRef = useRef(false);
  const onWorkedRef = useRef(onWorked);
  useEffect(() => {
    onWorkedRef.current = onWorked;
  }, [onWorked]);
  // The screen-reader query resolves after a frame; leaving the card first must not start a replay
  // (setState on an unmounted timeline) for a clip nobody can see.
  const aliveRef = useRef(true);
  useEffect(
    () => () => {
      aliveRef.current = false;
    },
    [],
  );
  useEffect(() => {
    if (!state.solved || workedRef.current) return;
    workedRef.current = true;
    onWorkedRef.current({ firstTry: state.firstTry });
    // No autoplay under VoiceOver: captions changing under a reader's focus lose their place. The
    // first explain is still spoken, and the controls step through the rest.
    AccessibilityInfo.isScreenReaderEnabled().then(
      (on) => {
        if (!aliveRef.current) return;
        if (on) AccessibilityInfo.announceForAccessibility(beats[0]?.caption ?? '');
        else replay();
      },
      () => {
        if (aliveRef.current) replay();
      },
    );
  }, [state.solved, state.firstTry, beats, replay]);

  const missed = awaitingRetry(state);
  const tray = trayTokens(state, tokenOrder);
  const litSlot = state.solved ? slotOrder[timeline.beat] : focus;

  const toneOf = (slot: number): Tone => {
    if (state.locked[slot]) return litSlot === slot ? 'focus' : 'right';
    if (state.wrong[slot]) return 'wrong';
    return state.placed[slot] === null ? 'empty' : 'filled';
  };

  const onSpot = useCallback(
    (slot: number) => {
      if (state.locked[slot]) {
        setFocus(slot);
        AccessibilityInfo.announceForAccessibility(spec.slots[slot].caption);
        return;
      }
      dispatch({ type: 'slot', slot });
    },
    [state.locked, spec],
  );

  const onCheck = useCallback(() => {
    const next = placeReducer(state, { type: 'check' });
    dispatch({ type: 'check' });
    const right = next.locked.filter(Boolean).length;
    AccessibilityInfo.announceForAccessibility(next.solved ? 'All right.' : `${right} of ${n} right. The amber ones go back.`);
  }, [state, n]);

  // Celebrate once, on the solve (the replay's first beat, or beat 0 under VoiceOver); every later
  // beat, including Back to the first, is a nod. A clip is not the lesson's payoff (pixel-stage CUE_GAIN).
  const cue = state.solved ? (timeline.beat === 0 && timeline.seq <= 1 ? 'celebrate' : 'nod') : missed ? 'nod' : 'point';
  // One key for the solve and the replay it starts (seq 0 -> 1 a frame later): keying on seq there
  // restarted the celebrate hop mid-air, which read as Atlas stuttering on the payoff.
  const cueKey = state.solved ? 1000 + Math.max(1, timeline.seq) : state.tries;

  const caption = state.solved
    ? beats[timeline.beat]?.caption ?? ''
    : focus !== null && state.locked[focus]
      ? spec.slots[focus].caption
      : 'Tap a label, then tap the spot it belongs in. Size is the clue.';

  const figure =
    spec.mode === 'waffle' ? <Waffle spec={spec} animate={!reduced} /> : spec.mode === 'stack' ? <Stack spec={spec} animate={!reduced} /> : null;

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <AtlasCue reaction={cue} cueKey={cueKey} />
        <ThemedText style={styles.title}>{spec.title}</ThemedText>
      </View>

      <View style={styles.frame}>
        {built.mark && getSprite(built.mark.sprite) ? (
          <View style={styles.unitKey} accessible accessibilityLabel={`Each mark is ${built.mark.unitLabel}`}>
            <PixelSpriteView sprite={getSprite(built.mark.sprite)!} size={MARK_PT} />
            <ThemedText style={styles.muted}>= {built.mark.unitLabel}</ThemedText>
          </View>
        ) : null}
        <View style={[styles.body, figure ? styles.bodyRow : null]}>
          {figure ? (
            <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none">
              {figure}
            </View>
          ) : null}
          <View style={styles.spots}>
            {slotOrder.map((slot, j) => {
              const token = state.placed[slot];
              const text = token === null ? null : spec.slots[token].label;
              return (
                <SpringPressable
                  key={slot}
                  onPress={() => onSpot(slot)}
                  scaleTo={1}
                  haptic={false}
                  disabled={state.solved || missed}
                  accessibilityRole="button"
                  accessibilityLabel={`Spot ${j + 1}, the ${words[slot]} one. ${text ? `Holds ${text}.` : 'Empty.'}${state.wrong[slot] ? ' Wrong.' : state.locked[slot] ? ' Right.' : ''}`}
                  accessibilityHint={state.locked[slot] ? 'Reads why.' : state.picked !== null ? 'Places the picked label here.' : text ? 'Sends the label back.' : undefined}
                  accessibilityState={{ disabled: state.solved || missed }}
                >
                  <View style={[styles.spotRow, spec.mode === 'pictograph' ? styles.spotRowWide : null]}>
                    {figure ? <View style={[styles.swatch, { backgroundColor: fillOf(slot) }]} /> : null}
                    {spec.mode === 'pictograph' ? <Marks spec={built} slot={slot} animate={!reduced} /> : null}
                    <SpotBox tone={toneOf(slot)} delayMs={j * VERDICT_STAGGER_MS} text={text} reduced={reduced} />
                  </View>
                </SpringPressable>
              );
            })}
          </View>
        </View>
        {state.solved ? <ClipControls timeline={timeline} /> : null}
      </View>

      <ClipCaption text={caption} beatKey={state.solved ? timeline.seq : -2 - (focus ?? -1)} />

      {state.solved ? (
        spec.footer ? <ThemedText style={styles.footer}>{spec.footer}</ThemedText> : null
      ) : missed ? (
        <Animated.View
          style={[styles.bar, styles.barMiss]}
          entering={reduced ? undefined : FadeInDown.duration(BAR_IN_MS).easing(Ease.out)}
          accessibilityLiveRegion="polite"
        >
          <ThemedText style={styles.barText}>Not quite. The green ones stay put.</ThemedText>
          <SpringPressable onPress={() => dispatch({ type: 'retry' })} accessibilityRole="button" accessibilityLabel="Try again">
            <View style={[styles.cta, styles.ctaMiss]}>
              <ThemedText style={styles.ctaMissText}>Try again</ThemedText>
            </View>
          </SpringPressable>
        </Animated.View>
      ) : (
        <>
          <View style={styles.tray}>
            {tray.map((t) => (
              <Token key={t} label={spec.slots[t].label} picked={state.picked === t} reduced={reduced} onPress={() => dispatch({ type: 'pick', token: t })} />
            ))}
          </View>
          <SpringPressable
            onPress={onCheck}
            disabled={!allFilled(state)}
            accessibilityRole="button"
            accessibilityLabel="Check"
            accessibilityState={{ disabled: !allFilled(state) }}
          >
            <View style={[styles.cta, !allFilled(state) && styles.ctaOff]}>
              <ThemedText style={styles.ctaText}>Check</ThemedText>
            </View>
          </SpringPressable>
        </>
      )}
    </View>
  );
}

/*
 * CONTRAST (CONSTITUTION 5.9), on the tokens as measured by the sibling cards (lever-card.tsx,
 * pixel-stage.tsx CLIP_MUTED): LessonColors.text on LessonColors.card and backgroundElement clears
 * 15:1; CLIP_MUTED (Colors.dark.mutedForeground) is 10.65:1 on backgroundElement; LessonColors.warning
 * on LessonColors.card is over 11:1 (a light amber on near-black); the Check label is
 * LessonColors.background on LessonColors.text, the same pair inverted. The Try again label is
 * LessonColors.background on LessonColors.warning, over 11:1 for the same reason.
 */
const styles = StyleSheet.create({
  wrap: { flex: 1, width: '100%', gap: 12, paddingHorizontal: 16, justifyContent: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { ...LessonTypography.heading, color: LessonColors.text, flex: 1 },
  frame: {
    width: '100%',
    backgroundColor: LessonColors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: LessonColors.border,
    padding: CELL_PT * 3,
    gap: CELL_PT * 3,
  },
  unitKey: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  muted: { ...LessonTypography.small, color: CLIP_MUTED, flexShrink: 1 },
  body: { gap: CELL_PT * 3 },
  bodyRow: { flexDirection: 'row', alignItems: 'center' },
  spots: { flex: 1, gap: 8 },
  spotRow: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 },
  spotRowWide: { justifyContent: 'space-between' },
  swatch: { width: CELL_PT * 4, height: CELL_PT * 4 },
  marks: { flexDirection: 'row', flexWrap: 'nowrap', gap: 2, flexShrink: 1 },
  spot: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 44,
    minWidth: 96,
    maxWidth: 200,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.md,
    borderWidth: 2,
    backgroundColor: LessonColors.backgroundElement,
  },
  spotEmpty: { borderStyle: 'dashed', alignItems: 'center' },
  spotHint: { ...LessonTypography.smallBold, color: CLIP_MUTED },
  spotText: { ...LessonTypography.smallBold, color: LessonColors.text },
  tray: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, minHeight: 44 },
  token: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderRadius: Radius.md, backgroundColor: LessonColors.backgroundElement, borderWidth: 1, borderColor: LessonColors.border },
  tokenOn: { backgroundColor: LessonColors.backgroundSelected, borderColor: LessonColors.accent, borderWidth: 2 },
  tokenText: { ...LessonTypography.smallBold, color: LessonColors.text },
  cta: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md, backgroundColor: LessonColors.text, paddingHorizontal: 20 },
  ctaOff: { opacity: 0.4 },
  ctaText: { ...LessonTypography.heading, color: LessonColors.background },
  bar: { gap: 10, padding: 12, borderRadius: Radius.md, borderWidth: 2 },
  barMiss: { borderColor: LessonColors.warning, backgroundColor: LessonColors.backgroundElement },
  barText: { ...LessonTypography.bodyMedium, color: LessonColors.warning },
  ctaMiss: { backgroundColor: LessonColors.warning },
  ctaMissText: { ...LessonTypography.heading, color: LessonColors.background },
  footer: { ...LessonTypography.small, color: CLIP_MUTED, textAlign: 'center' },
});
