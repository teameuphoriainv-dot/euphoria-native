/**
 * "Double it": the hands-on onboarding screen (design.md 1.2, owner decision 1: an ADDED screen,
 * placed before the reveal and the account wall; nothing else in the flow is removed).
 *
 * Math, copy and grading live in src/lib/onboarding/double-it.ts, which is pure so
 * scripts/onboarding-try-it-pin.mjs can hold them. This file only draws them.
 *
 * THREE EXPORTS, BECAUSE ONBOARDING HAS TWO REGIONS. The step body scrolls inside onboarding.tsx's
 * ScrollView, and the button sits in the pinned footer outside it. A single component rendering its
 * own button would put Check inside the scroll, where on a 667pt SE it can sit under the fold. So:
 *
 *   const ctl = useDoubleIt({ onEvent, onResolved });   // one owner of the state
 *   <DoubleItStep ctl={ctl} atlas={<AtlasSpeech ... />} />   // in the scroll body
 *   <DoubleItCheckBar ctl={ctl} onContinue={advance} />      // in place of the footer CTA
 *
 * ATLAS (owner decision 2). `atlas` is a slot rendered above the heading so the integrator can show
 * Atlas's line reacting to the previous answer. `onEvent` reports 'scrub' / 'miss' / 'correct' /
 * 'revealed' so the persistent AtlasStage can change face or nod; ATLAS_BEATS in the lib holds
 * default faces and lines. This screen never draws Atlas itself: one mascot per screen
 * (CONSTITUTION 5.6), and the stage already is him.
 *
 * NOTHING IS PERSISTED. No Profile field, no XP, no store write. `onResolved` hands back whether
 * the FIRST Check was right (owner decision 4) for the integrator's analytics only.
 *
 * MOTION (AGENTS.md: monotonic easing for data geometry). The coins are data: they fade in with
 * withTiming, never a spring, and the pin fails on any withSpring in this file. Under Reduce Motion
 * every animation below has a stated end state.
 */
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  PanResponder,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { StepHeading } from '@/components/onboarding-parts';
import { ThemedText } from '@/components/themed-text';
import { SlabButton } from '@/components/ui/button';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  ANOTHER_RATE_LABEL,
  CHECK_LABEL,
  CHIPS,
  CONTINUE_LABEL,
  GHOST_CELLS,
  GRID_COLUMNS,
  TITLE,
  TRY_AGAIN_LABEL,
  WHY_LABEL,
  WHY_LINE,
  barLine,
  barTitle,
  coinsAt,
  initialState,
  isResolved,
  maxCoins,
  maxYears,
  readout,
  reduce,
  stepperValueText,
  subLine,
  type DoubleItAction,
  type DoubleItState,
  type Phase,
} from '@/lib/onboarding/double-it';
import { PixelSpriteView, coin } from '@/lib/pixel';
import { SpringPressable } from '@/shared/motion/spring-pressable';

/** 44pt is the floor (CONSTITUTION 5.10); the -/+ buttons are 48 like parts/dial-card.tsx. */
const STEP_TARGET = 48;
/** Rate chips and the Why? pill. */
const PILL_TARGET = 44;
/** One coin cell and the gap. 10 x 20 + 9 x 4 = 236pt wide, 5 rows = 116pt (design.md 1.2). */
const CELL = 20;
const GAP = 4;
const GRID_W = GRID_COLUMNS * CELL + (GRID_COLUMNS - 1) * GAP;
const GHOST_ROWS = Math.ceil(GHOST_CELLS / GRID_COLUMNS);

/** Timings measured from brilliant/hi/correct_01.jpg (design.md 1.2): border on the tap frame, bar after. */
const BORDER_MS = 70;
const BAR_DELAY_MS = 150;
const BAR_MS = 180;
const COIN_FADE_MS = 120;
const GHOST_MS = 200;
const EASE_OUT = Easing.out(Easing.cubic);

/**
 * Alpha-append only onto a 6-digit hex. CONSTITUTION 5.8: `theme.x + '26'` on an hsl() token renders
 * at FULL opacity with no error, which here would paint the whole bar solid green behind white text.
 * success and warning are hex in both palettes today; this refuses quietly rather than trusting it.
 */
function tint(color: string, alpha: string, fallback: string): string {
  return /^#[0-9a-f]{6}$/i.test(color) ? color + alpha : fallback;
}

export type DoubleItEvent = Phase | 'scrub';

/** One frozen start state, so `reset` can tell "already fresh" by identity and skip the render. */
const INITIAL = initialState();

/** The lib's pure reducer plus `reset`, which belongs to the screen's lifecycle, not to grading. */
function reduceOrReset(state: DoubleItState, action: DoubleItAction | { type: 'reset' }): DoubleItState {
  return action.type === 'reset' ? INITIAL : reduce(state, action);
}

/** The one owner of the screen's state. See the file header for why it is a hook. */
export function useDoubleIt(opts: {
  /** For Atlas: 'scrub' while the years move, then the verdict. Faces are in ATLAS_BEATS. */
  onEvent?: (e: DoubleItEvent) => void;
  /** Once, when the graded rate is first resolved. firstTry is only the FIRST Check; `phase` says
   *  whether they found it ('correct') or were shown it ('revealed'), for Atlas's next line. */
  onResolved?: (r: { firstTry: boolean; phase: Phase }) => void;
} = {}) {
  const [state, dispatch] = useReducer(reduceOrReset, INITIAL);

  /*
   * STABLE HANDLERS. setYears feeds the grid's PanResponder, and a responder rebuilt on every state
   * change (every year of a scrub) can drop the gesture in flight. So the handlers never close over
   * `state` or the caller's callbacks: they read the latest of each through refs written in an
   * effect, at event time, which is also what react-hooks/refs allows.
   */
  const stateRef = useRef(state);
  const optsRef = useRef(opts);
  useEffect(() => {
    stateRef.current = state;
    optsRef.current = opts;
  });

  // Events are emitted from the handlers, computed with the same pure reducer, rather than from an
  // effect watching `state`: an effect would also fire on remount and re-nod Atlas for nothing.
  const setYears = useCallback((years: number) => {
    const now = stateRef.current;
    const next = reduce(now, { type: 'setYears', years });
    if (next === now) return;
    stateRef.current = next;
    dispatch({ type: 'setYears', years });
    optsRef.current.onEvent?.('scrub');
  }, []);

  const check = useCallback(() => {
    const now = stateRef.current;
    const next = reduce(now, { type: 'check' });
    if (next === now) return;
    stateRef.current = next;
    dispatch({ type: 'check' });
    optsRef.current.onEvent?.(next.phase);
    if (isResolved(next.phase) && next.firstTry !== null) {
      optsRef.current.onResolved?.({ firstTry: next.firstTry, phase: next.phase });
    }
  }, []);

  const tryAgain = useCallback(() => {
    const now = stateRef.current;
    const next = reduce(now, { type: 'tryAgain' });
    if (next === now) return;
    stateRef.current = next;
    dispatch({ type: 'tryAgain' });
    optsRef.current.onEvent?.('idle');
  }, []);

  const pickRate = useCallback((rate: number) => {
    const next = reduce(stateRef.current, { type: 'pickRate', rate });
    stateRef.current = next;
    dispatch({ type: 'pickRate', rate });
  }, []);

  /*
   * BACK THEN FORWARD SHOWED THE OLD MISS BAR (sim wave 2, 2026-09-22). The state lives in the
   * parent so the Check bar can sit outside the ScrollView, which also means it outlives the step:
   * leaving on Back and returning put the learner back in front of a locked stepper and an amber
   * "Not yet." for an answer they gave a screen ago. onboarding.tsx calls this whenever the step is
   * entered, so every visit starts clean. Emits 'idle' so the AtlasStage face resets with it.
   */
  const reset = useCallback(() => {
    if (stateRef.current === INITIAL) return;
    stateRef.current = INITIAL;
    dispatch({ type: 'reset' });
    optsRef.current.onEvent?.('idle');
  }, []);

  return { state, setYears, check, tryAgain, pickRate, reset };
}

export type DoubleItController = ReturnType<typeof useDoubleIt>;

/**
 * One coin. `fresh` is captured at mount, never re-read: flipping PixelSpriteView's `play` from
 * 'once' to 'none' on the next render restarts its run and cuts the spin off mid-frame.
 * After the spin the coin drops to `play="none"`, because 'once' parks on the LAST frame, which for
 * the coin is the foreshortened COIN_FACE_8, and a stack of new coins would look thinner than the old.
 */
function Coin({ fresh }: { fresh: boolean }) {
  const reduced = useReducedMotion();
  const [spinning, setSpinning] = useState(() => fresh && !reduced);
  return (
    <Animated.View
      style={styles.cell}
      // Reduce Motion: the coin is simply there. No spin, no fade.
      entering={fresh && !reduced ? FadeIn.duration(COIN_FADE_MS).easing(EASE_OUT) : undefined}
    >
      <PixelSpriteView
        sprite={coin}
        size={CELL}
        play={spinning ? 'once' : 'none'}
        /*
         * Deferred one frame. PixelSpriteView fires onAnimationEnd from INSIDE its setFrame updater,
         * which React runs while rendering PixelSpriteViewInner, so a synchronous setSpinning here
         * raised "Cannot update a component (`Coin`) while rendering a different component" on the
         * simulator (2026-09-22, six taps on +) and put a LogBox over the Check button.
         */
        onAnimationEnd={() => { requestAnimationFrame(() => setSpinning(false)); }}
      />
    </Animated.View>
  );
}

/**
 * The isotype: one coin per $100, floor, so a coin exists only once its money does.
 * The dashed cells are the "$2,000" target (Brilliant's ghost shape, brilliant/f_013.jpg); the
 * block outline around them turns success once, over 200ms, when the stack fills it.
 */
function CoinGrid({ state, onScrub }: { state: DoubleItState; onScrub: (years: number) => void }) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const coins = coinsAt(state.rate, state.years);
  const slots = Math.ceil(maxCoins(state.rate) / GRID_COLUMNS) * GRID_COLUMNS;
  const full = coins >= GHOST_CELLS;

  /*
   * "Colour only what is new" (timing/koch.jpg). The first START / COIN_VALUE coins exist at year 0
   * on every rate, so they are the old stack and never spin. Every coin past them mounts only when
   * the years reach it, and Coin captures `fresh` at mount, so a coin spins once when it arrives and
   * is static after. No render-time ref reads: a ref read in render can hand a stale count to the
   * coins React mounts on the second pass (react-hooks/refs).
   */
  const baseline = coinsAt(state.rate, 0);

  const filled = useSharedValue(full ? 1 : 0);
  useEffect(() => {
    filled.set(reduced ? (full ? 1 : 0) : withTiming(full ? 1 : 0, { duration: GHOST_MS, easing: EASE_OUT }));
  }, [full, reduced, filled]);
  const ghostStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(filled.get(), [0, 1], [theme.mutedForeground, theme.success]),
  }));

  /*
   * SCRUB, THE SECONDARY INPUT. The stepper is the primary one and the only one VoiceOver sees
   * (CONSTITUTION 5.10: a one-finger swipe is VoiceOver's navigation gesture). The responder claims
   * only a mostly-horizontal move, so a vertical drag still scrolls the onboarding ScrollView.
   *
   * Position = the grid-relative x where the responder was granted, plus the drag since then.
   * pointerEvents="box-only" makes the GRID the touch target, so locationX is relative to it and not
   * to whichever child coin is under the finger (that made the value jump a cell's width mid-drag).
   * It replaces a page x measured once in onLayout, which went stale whenever anything moved the
   * grid without re-laying it out (a step transition, a scroll-into-view, a rotation) and set state
   * from an async measure callback that could land after unmount.
   */
  const maxY = maxYears(state.rate);
  // Rebuilt only when the rate changes: onScrub is stable (see useDoubleIt), so a scrub in progress
  // keeps its responder while the years it sets re-render the grid.
  const pan = useMemo(() => {
    // Where this drag was granted. Closure state, not a ref: it lives exactly as long as the
    // responder, which is rebuilt only on a rate change, never mid-drag.
    const grant = { x: 0, dx: 0 };
    const scrubTo = (x: number) => {
      const frac = Math.max(0, Math.min(1, x / GRID_W));
      onScrub(Math.round(frac * maxY));
    };
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_e: GestureResponderEvent, g: PanResponderGestureState) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderGrant: (e: GestureResponderEvent, g: PanResponderGestureState) => {
        grant.x = e.nativeEvent.locationX;
        grant.dx = g.dx;
        scrubTo(e.nativeEvent.locationX);
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_e: GestureResponderEvent, g: PanResponderGestureState) =>
        scrubTo(grant.x + g.dx - grant.dx),
    });
  }, [maxY, onScrub]);

  return (
    <View
      pointerEvents="box-only"
      style={[styles.grid, { height: (slots / GRID_COLUMNS) * (CELL + GAP) - GAP }]}
      accessible
      accessibilityLabel={`${String(coins)} coins, one coin is 100 dollars. The dashed outline is 2,000 dollars${full ? ', and it is full' : ''}.`}
      {...pan.panHandlers}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.ghostBlock,
          { height: GHOST_ROWS * (CELL + GAP) - GAP + 8 },
          ghostStyle,
        ]}
      />
      {Array.from({ length: slots }, (_, i) => {
        if (i < coins) return <Coin key={`${String(state.rate)}-${String(i)}`} fresh={i >= baseline} />;
        if (i < GHOST_CELLS) {
          return <View key={`g${String(i)}`} style={[styles.cell, styles.ghostCell, { borderColor: theme.mutedForeground }]} />;
        }
        return <View key={`e${String(i)}`} style={styles.cell} />;
      })}
    </View>
  );
}

/** The years stepper: ONE adjustable VoiceOver element, the pattern from parts/dial-card.tsx. */
function YearsStepper({ state, onChange }: { state: DoubleItState; onChange: (y: number) => void }) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const max = maxYears(state.rate);
  const locked = state.phase === 'miss';
  const nudge = (dir: 1 | -1) => onChange(state.years + dir);

  // The verdict colours the stepper on the tap frame, before the bar arrives (correct_01.jpg).
  const tone = state.phase === 'miss' ? 2 : isResolved(state.phase) ? 1 : 0;
  const t = useSharedValue(tone);
  useEffect(() => {
    t.set(reduced ? tone : withTiming(tone, { duration: BORDER_MS }));
  }, [tone, reduced, t]);
  const border = useAnimatedStyle(() => ({
    borderColor: interpolateColor(t.get(), [0, 1, 2], [theme.border, theme.success, theme.warning]),
  }));

  return (
    <Animated.View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="Years"
      accessibilityState={{ disabled: locked }}
      accessibilityValue={{ text: stepperValueText(state.rate, state.years) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => nudge(e.nativeEvent.actionName === 'decrement' ? -1 : 1)}
      style={[styles.stepper, { backgroundColor: theme.backgroundElement }, border]}
    >
      <SpringPressable
        onPress={() => nudge(-1)}
        disabled={locked || state.years <= 0}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View style={[styles.stepButton, { backgroundColor: theme.backgroundSelected }, (locked || state.years <= 0) && styles.off]}>
          <ThemedText type="heading">−</ThemedText>
        </View>
      </SpringPressable>
      <View style={styles.stepValue}>
        <ThemedText type="heading">{state.years === 1 ? '1 year' : `${String(state.years)} years`}</ThemedText>
      </View>
      <SpringPressable
        onPress={() => nudge(1)}
        disabled={locked || state.years >= max}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View style={[styles.stepButton, { backgroundColor: theme.backgroundSelected }, (locked || state.years >= max) && styles.off]}>
          <ThemedText type="heading">+</ThemedText>
        </View>
      </SpringPressable>
    </Animated.View>
  );
}

/** The scrolling body. `atlas` is the integrator's slot for Atlas's line (owner decision 2). */
export function DoubleItStep({ ctl, atlas }: { ctl: DoubleItController; atlas?: React.ReactNode }) {
  const theme = useTheme();
  const { state, setYears, pickRate } = ctl;
  const resolved = isResolved(state.phase);

  return (
    <View style={styles.body}>
      {atlas ? <View style={styles.atlasSlot}>{atlas}</View> : null}
      <StepHeading title={TITLE} sub={subLine(state.rate)} />
      <View style={styles.stage}>
        {/* Snaps, never counts up: a counting number is motion the learner has to wait out. */}
        <ThemedText type="bodyMedium" style={styles.readout} accessibilityLiveRegion="polite">
          {readout(state.rate, state.years)}
        </ThemedText>
        <CoinGrid state={state} onScrub={setYears} />
        <YearsStepper state={state} onChange={setYears} />
      </View>
      {resolved ? (
        <View style={styles.rates}>
          <ThemedText type="small" themeColor="mutedForeground">{ANOTHER_RATE_LABEL}</ThemedText>
          <View style={styles.chipRow}>
            {CHIPS.map((r) => {
              const on = r === state.rate;
              return (
                <SpringPressable
                  key={r}
                  onPress={() => pickRate(r)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`${String(r)} percent a year`}
                >
                  <View
                    style={[
                      styles.chip,
                      { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                      on && { backgroundColor: theme.primary, borderColor: theme.accent },
                    ]}
                  >
                    <ThemedText type="smallBold" style={on ? { color: theme.primaryForeground } : undefined}>
                      {`${String(r)}%`}
                    </ThemedText>
                  </View>
                </SpringPressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

/**
 * The footer: a Check button while answering, then the Brilliant check bar (owner decision 4).
 * Amber with Try again on the first miss, green with Why? and Continue once resolved. The bar slides
 * up 180ms at +150ms with monotonic ease-out, no spring; under Reduce Motion it is simply there.
 */
export function DoubleItCheckBar({ ctl, onContinue }: { ctl: DoubleItController; onContinue: () => void }) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const { state, check, tryAgain } = ctl;
  const [whyOpen, setWhyOpen] = useState(false);
  const title = barTitle(state);
  const line = barLine(state);
  const miss = state.phase === 'miss';

  const shown = useSharedValue(0);
  useEffect(() => {
    if (state.phase === 'idle') { shown.set(0); return; }
    shown.set(reduced ? 1 : 0);
    if (!reduced) shown.set(withDelay(BAR_DELAY_MS, withTiming(1, { duration: BAR_MS, easing: EASE_OUT })));
    // Colour is not the only signal: VoiceOver hears the verdict in words (CONSTITUTION 5.10).
    if (title && line) AccessibilityInfo.announceForAccessibility(`${title} ${line}`);
    // Keyed on the phase only: switching rates after solving updates the words in place, it does
    // not slide the bar in again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, reduced, shown]);
  /*
   * Reduce Motion reads `reduced` here too, not only in the effect: the effect runs AFTER the bar's
   * first paint, so with only the effect the bar painted one frame at opacity 0, 24pt low.
   */
  const slide = useAnimatedStyle(() => ({
    opacity: reduced ? 1 : shown.get(),
    transform: [{ translateY: reduced ? 0 : (1 - shown.get()) * 24 }],
  }));

  /*
   * Picking another rate after solving swaps the bar's line in place with no slide (above), so
   * VoiceOver would never hear the new math; only the readout's live region spoke. Announce it.
   * Skips the first run so mounting does not repeat what the phase effect already announced.
   */
  const lastRate = useRef(state.rate);
  useEffect(() => {
    if (lastRate.current === state.rate) return;
    lastRate.current = state.rate;
    if (title && line) AccessibilityInfo.announceForAccessibility(`${title} ${line}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.rate]);

  if (state.phase === 'idle' || !title || !line) {
    return (
      <View style={styles.footer}>
        <SlabButton label={CHECK_LABEL} onPress={check} disabled={!state.touched} full />
      </View>
    );
  }

  const tone = miss ? theme.warning : theme.success;
  return (
    <Animated.View
      style={[
        styles.bar,
        { backgroundColor: tint(tone, '26', theme.backgroundElement), borderColor: tone },
        slide,
      ]}
    >
      <View style={styles.barHead}>
        <ThemedText type="heading" style={styles.barTitle}>{title}</ThemedText>
        {!miss ? (
          <SpringPressable
            onPress={() => setWhyOpen((o) => !o)}
            accessibilityRole="button"
            accessibilityState={{ expanded: whyOpen }}
            accessibilityLabel={WHY_LABEL}
          >
            <View style={[styles.why, { borderColor: tone }]}>
              <ThemedText type="smallBold">{WHY_LABEL}</ThemedText>
            </View>
          </SpringPressable>
        ) : null}
      </View>
      {/*
        Body text is theme.text, not mutedForeground. Measured 2026-09-22, tint composited over the
        page background: dark text 14.76:1 on the green bar and 14.15:1 on amber; light text 15.1 and
        16.0. mutedForeground on the light bars measured 4.09 and 4.33, under the 4.5 floor (5.9).
      */}
      <ThemedText type="body">{line}</ThemedText>
      {whyOpen && !miss ? <ThemedText type="body">{WHY_LINE}</ThemedText> : null}
      <SlabButton
        label={miss ? TRY_AGAIN_LABEL : CONTINUE_LABEL}
        onPress={miss ? tryAgain : onContinue}
        tone={miss ? 'neutral' : 'primary'}
        full
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  body: { width: '100%', gap: Spacing.three },
  atlasSlot: { alignItems: 'center' },
  stage: { alignItems: 'center', gap: Spacing.three },
  readout: { fontSize: FontSize.subhead, textAlign: 'center' },
  grid: { width: GRID_W, flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  cell: { width: CELL, height: CELL, alignItems: 'center', justifyContent: 'center' },
  // Square corners and a dashed 1pt line: a pixel outline, not a rounded one (CONSTITUTION 5.5).
  ghostCell: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 0 },
  ghostBlock: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: GRID_W + 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 0,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.one,
    borderWidth: 2,
    borderRadius: Radius.md,
  },
  stepButton: {
    width: STEP_TARGET,
    height: STEP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
  },
  stepValue: { minWidth: 104, alignItems: 'center' },
  off: { opacity: 0.4 },
  rates: { alignItems: 'center', gap: Spacing.two },
  chipRow: { flexDirection: 'row', gap: Spacing.two },
  chip: {
    minWidth: 64,
    minHeight: PILL_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  footer: { width: '100%' },
  bar: {
    width: '100%',
    gap: Spacing.two,
    padding: Spacing.three,
    borderWidth: 2,
    borderRadius: Radius.lg,
  },
  barHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  barTitle: { flexShrink: 1 },
  why: {
    minHeight: PILL_TARGET,
    minWidth: PILL_TARGET,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
});
