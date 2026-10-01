/**
 * Tap-to-place (M4, research2/design.md): an authored diagram drawn WITHOUT its labels, the labels
 * waiting in a tray, and the learner putting each one back where it belongs. Tap a label, tap a
 * spot. Never a drag (CONSTITUTION 5.10: a one-finger swipe is VoiceOver's navigation gesture, and
 * Money 2048 shipped a swipe-only mechanic VoiceOver could not play).
 *
 * WHY THIS EXISTS. Measured 2026-09-22 on the raw loader: the chart card on personal-finance:2:2
 * ("The 50/30/20 Rule"), personal-finance:4:2 ("Emergency fund milestones, to scale"),
 * investing-fundamentals:8:2 ("Same $200 a month, four different prices") and corporate-finance:24:2
 * ("Tranching a $1B Mortgage Pool") hands the learner every label already sitting on its slice, so
 * the one judgement each diagram exists to train (which dollar goes in which slice, which price buys
 * the most shares, which tranche is biggest) is never asked. Here the SIZE of each spot is the clue
 * and the learner supplies the name.
 *
 * THE RULE (CONSTITUTION 3.1). Every string the card shows is authored: `title` is the visual's
 * title, a slot `label` is the authored label, a `caption` is the authored `explain`, `footer` is the
 * authored footer, and a pictograph's `unitLabel` is authored. `magnitude` only sizes geometry and is
 * never printed. `buildPlace` returns null unless all of it is there, so a re-sync that drops one
 * explain, merges two slices to the same size, or turns the pie into bars removes the card and the
 * derived chart ships instead. There is no fallback text and no default value anywhere in this file.
 *
 * Pure module: no React Native, so scripts/clickthrough-place-pin.mjs loads it under plain node.
 */
import type { AnimatedVisual, LessonStep } from '@/lib/curriculum';
// Relative, not '@/': the pin loads this under plain node, whose resolve hook only knows relative paths.
import { stableOptions } from '../../stable-options';
import type { PlaceSlot, PlaceSpec } from './types';

/** 3 to 4 slots (design M4): 2 is a coin flip, 5 labels do not fit one tray row pair at 375pt. */
export const PLACE_MIN_SLOTS = 3;
export const PLACE_MAX_SLOTS = 4;
/** A waffle is 10 x 10, one cell per percent, so it only draws a pie whose percents sum to 100. */
export const WAFFLE_SIDE = 10;
/**
 * The most marks a pictograph row may draw. 12 marks at the card's mark size fill the row beside the
 * label spot on a 375pt screen; more would wrap, and a wrapped row reads as two rows.
 */
export const PLACE_MAX_MARKS = 12;

/**
 * What a pictograph slot needs to draw its marks. Carried beside the K0 `PlaceSpec` (which has no
 * sprite field) rather than folded into `magnitude`, because marks = value / unitValue and a row of
 * 0.2 marks (personal-finance:4:2's $500 against a $2,500 month) must draw as a fifth of one coin,
 * not round to a whole one.
 */
export type PlaceMark = { sprite: string; unitValue: number; unitLabel: string };
export type PlaceBuilt = PlaceSpec & { mark?: PlaceMark };

type Visual = AnimatedVisual;
const isText = (s: unknown): s is string => typeof s === 'string' && s.trim().length > 0;
const isPos = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0;

/**
 * The diagram a step shows. A teaching slide authors it as `diagramVisual`; other step types use
 * `visual`. Only these two: `withVisual`/`withoutVisual` on a stakes card are a before/after pair,
 * and tearing the labels off one half of a pair would leave the other half labelled beside it.
 */
function diagramOf(step: LessonStep): Visual | undefined {
  const s = step as { diagramVisual?: Visual; visual?: Visual };
  return s.diagramVisual ?? s.visual;
}

/** Null unless every slot is authored, 3-4 of them, with distinct positive sizes and labels. */
function slotsOk(slots: PlaceSlot[]): boolean {
  if (slots.length < PLACE_MIN_SLOTS || slots.length > PLACE_MAX_SLOTS) return false;
  if (!slots.every((s) => isPos(s.magnitude) && isText(s.label) && isText(s.caption))) return false;
  // Equal sizes make the size clue ambiguous: two spots the same size have two right answers, and
  // the grader (label index === slot index) would mark a correct swap wrong.
  if (new Set(slots.map((s) => s.magnitude)).size !== slots.length) return false;
  // Two tokens with the same text are indistinguishable in the tray, so one of them is always wrong.
  if (new Set(slots.map((s) => s.label.trim())).size !== slots.length) return false;
  return true;
}

const withFooter = (spec: PlaceBuilt, footer: unknown): PlaceBuilt => (isText(footer) ? { ...spec, footer } : spec);

/**
 * Build the tap-to-place card for this step's authored diagram, or null.
 *
 *   pie        -> 'waffle'      10 x 10 cells, cells = authored percent; percents must be whole and
 *                               sum to 100 (a pie drawn round beside pixel art reads as a different
 *                               product, CONSTITUTION 5.5, so it is drawn as cells).
 *   pictograph -> 'pictograph'  one row of the authored sprite per row, marks = value / unitValue.
 *   stack      -> 'stack'       tiers sized by authored percent, in authored order (a capital stack's
 *                               order IS its meaning, so it is never shuffled). Authored segment
 *                               colours are dropped (CONSTITUTION 5.8); tiers use theme steps.
 */
export function buildPlace(step: LessonStep): PlaceBuilt | null {
  const v = diagramOf(step);
  if (!v || !isText(v.title)) return null;

  if (v.type === 'pie') {
    const slots = v.segments.map((s) => ({ magnitude: s.percent, label: s.label, caption: s.explain ?? '' }));
    if (!slotsOk(slots)) return null;
    // One cell per percent: a 33.3 or a total of 99 has no honest 10 x 10 drawing.
    if (!slots.every((s) => Number.isInteger(s.magnitude))) return null;
    if (slots.reduce((a, s) => a + s.magnitude, 0) !== WAFFLE_SIDE * WAFFLE_SIDE) return null;
    return withFooter({ kind: 'place', title: v.title, mode: 'waffle', slots }, v.footer);
  }

  if (v.type === 'pictograph') {
    if (!isText(v.sprite) || !isPos(v.unitValue) || !isText(v.unitLabel)) return null;
    const slots = v.rows.map((r) => ({ magnitude: r.value, label: r.label, caption: r.explain ?? '' }));
    if (!slotsOk(slots)) return null;
    if (slots.some((s) => Math.ceil(s.magnitude / v.unitValue) > PLACE_MAX_MARKS)) return null;
    const mark: PlaceMark = { sprite: v.sprite, unitValue: v.unitValue, unitLabel: v.unitLabel };
    return withFooter({ kind: 'place', title: v.title, mode: 'pictograph', slots, mark }, v.footer);
  }

  if (v.type === 'stack') {
    const slots = v.segments.map((s) => ({ magnitude: s.percent, label: s.label, caption: s.explain ?? '' }));
    if (!slotsOk(slots)) return null;
    return withFooter({ kind: 'place', title: v.title, mode: 'stack', slots }, v.footer);
  }

  return null;
}

/** How many marks a pictograph slot draws: plain division of two authored figures, never rounded. */
export function marksFor(spec: PlaceBuilt, slot: PlaceSlot): number {
  return spec.mark ? slot.magnitude / spec.mark.unitValue : 0;
}

/**
 * A waffle's cells, row-major from the top left, each naming its slot. Slot k's run is exactly its
 * authored percent long, so the pin can count cells per slot against the authored figures.
 */
export function waffleCells(spec: PlaceSpec): number[] {
  if (spec.mode !== 'waffle') return [];
  return spec.slots.flatMap((s, k) => Array.from({ length: s.magnitude }, () => k));
}

/**
 * Size words for VoiceOver, one per slot: what a sighted learner reads off the drawing, said without
 * printing the magnitude (a number here would be a figure the diagram never labels). Ranked by
 * magnitude, which slotsOk has made distinct.
 */
export function sizeWords(spec: PlaceSpec): string[] {
  const n = spec.slots.length;
  const rank = spec.slots.map((s) => spec.slots.filter((o) => o.magnitude > s.magnitude).length);
  const names = n === 3 ? ['biggest', 'middle', 'smallest'] : ['biggest', 'second biggest', 'second smallest', 'smallest'];
  return rank.map((r) => names[r] ?? '');
}

/*
 * ---- order on screen ----
 *
 * WHY SLOTS AND TOKENS ARE BOTH DERANGED. investing-fundamentals:8:2's labels start "Month 1",
 * "Month 2" ..., and personal-finance:4:2's rise $500, $1,000, 3 months, 6 months. Drawn in authored
 * order, a pictograph answers itself: the first label goes on the first row. And a tray that lists
 * the labels in slot order puts each answer directly under its spot. So pictograph rows are shown
 * in an order with no row in its authored place, and the tray in an order with no label under its
 * own spot. Both are seeded from the authored text (stable-options.ts's hash), so the card looks the
 * same on every load and on every device, and a re-sync that changes the text reshuffles honestly.
 */

/** A deterministic permutation of 0..n-1 with no fixed point, seeded by `seed`. n < 2 is identity. */
export function derangement(n: number, seed: string): number[] {
  const ids = Array.from({ length: n }, (_, i) => i);
  if (n < 2) return ids;
  const labels = ids.map(String);
  // A random permutation is a derangement about 37% of the time, so a few salts always find one;
  // 64 tries failing is under 1e-12. The cyclic shift after it is still a derangement, never identity.
  for (let salt = 0; salt < 64; salt += 1) {
    const order = stableOptions(labels.map((l) => `${seed}␟${salt}␟${l}`), 0).sourceIndices;
    if (order.every((v, i) => v !== i)) return order;
  }
  return ids.map((i) => (i + 1) % n);
}

export type PlaceLayout = {
  /** Slot indices top to bottom as drawn. */
  slotOrder: number[];
  /** Token indices (a token's index is its correct slot) left to right in the tray. */
  tokenOrder: number[];
};

export function placeLayout(spec: PlaceSpec): PlaceLayout {
  const n = spec.slots.length;
  const seed = `${spec.title}#${spec.slots.map((s) => s.label).join('␟')}`;
  const ids = Array.from({ length: n }, (_, i) => i);
  // Only a pictograph is reordered: a waffle's runs and a stack's tiers are read in authored order
  // (the senior tranche sits on top because it is paid first), and their labels carry no ordinal.
  const slotOrder = spec.mode === 'pictograph' ? derangement(n, `${seed}#slots`) : ids;
  // Token j sits under drawn spot j; derange against THAT, so no label lands under its own spot.
  const perm = derangement(n, `${seed}#tokens`);
  const tokenOrder = perm.map((p) => slotOrder[p]);
  return { slotOrder, tokenOrder };
}

/*
 * ---- the game, as a pure reducer ----
 *
 * Pure so the pin can play it: the card holds no rules of its own, which is how "Try again keeps
 * the right ones placed" and "only the first try counts" are checked without rendering anything.
 */
export type PlaceState = {
  /** placed[slot] = the token sitting there, or null. A token's index is its correct slot. */
  placed: (number | null)[];
  /** The token lifted and waiting for a spot. */
  picked: number | null;
  /** Checked right: locked green, never moved again, its caption available on tap. */
  locked: boolean[];
  /** Checked wrong and shown amber until Try again sends the token home. */
  wrong: boolean[];
  /** How many times Check was pressed. */
  tries: number;
  solved: boolean;
  /**
   * Owner decision 4: only the first try counts toward XP and mastery. True only if the very first
   * Check placed everything right; a later solve leaves it false.
   */
  firstTry: boolean;
};

export type PlaceAction =
  | { type: 'pick'; token: number }
  | { type: 'slot'; slot: number }
  | { type: 'check' }
  | { type: 'retry' };

export function initialPlace(n: number): PlaceState {
  return {
    placed: Array.from({ length: n }, () => null),
    picked: null,
    locked: Array.from({ length: n }, () => false),
    wrong: Array.from({ length: n }, () => false),
    tries: 0,
    solved: false,
    firstTry: false,
  };
}

/** Waiting on Try again: the amber verdicts are on screen and nothing may move until it is pressed. */
export const awaitingRetry = (s: PlaceState) => s.wrong.some(Boolean);
/** Every spot holds a label, so Check can be pressed. */
export const allFilled = (s: PlaceState) => s.placed.every((t) => t !== null);
/** Tokens still in the tray. */
export const trayTokens = (s: PlaceState, order: number[]) => order.filter((t) => !s.placed.includes(t));

export function placeReducer(s: PlaceState, a: PlaceAction): PlaceState {
  if (s.solved) return s;
  switch (a.type) {
    case 'pick': {
      if (awaitingRetry(s) || s.placed.includes(a.token)) return s;
      return { ...s, picked: s.picked === a.token ? null : a.token };
    }
    case 'slot': {
      if (awaitingRetry(s) || s.locked[a.slot] || a.slot < 0 || a.slot >= s.placed.length) return s;
      const placed = s.placed.slice();
      if (s.picked === null) {
        // Tapping a filled, unlocked spot with nothing lifted sends its label back to the tray,
        // the button path for "undo" that a drag would otherwise give for free.
        if (placed[a.slot] === null) return s;
        placed[a.slot] = null;
        return { ...s, placed };
      }
      // The lifted label replaces whatever sat there; the displaced one returns to the tray.
      placed[a.slot] = s.picked;
      return { ...s, placed, picked: null };
    }
    case 'check': {
      if (awaitingRetry(s) || !allFilled(s)) return s;
      const right = s.placed.map((t, slot) => t === slot);
      const solved = right.every(Boolean);
      const tries = s.tries + 1;
      return {
        ...s,
        picked: null,
        locked: right,
        wrong: right.map((r) => !r),
        tries,
        solved,
        firstTry: solved && tries === 1,
      };
    }
    case 'retry': {
      if (!awaitingRetry(s)) return s;
      // Right ones stay placed and locked (design M4); only the amber ones go home.
      const placed = s.placed.map((t, slot) => (s.wrong[slot] ? null : t));
      return { ...s, placed, wrong: s.wrong.map(() => false) };
    }
  }
}

/** Every sentence the card can put on screen, for the deck's repeat check and the budget pin. */
export function textOf(spec: PlaceBuilt): string[] {
  return [
    spec.title,
    ...spec.slots.flatMap((s) => [s.label, s.caption]),
    ...(spec.footer ? [spec.footer] : []),
    ...(spec.mark ? [spec.mark.unitLabel] : []),
  ];
}

/** The placement adapter, the same shape parts/placements.ts's `dial` and `lever` wrappers return. */
export function placeBuilder(step: LessonStep): { spec: PlaceBuilt; text: string[] } | null {
  const spec = buildPlace(step);
  return spec ? { spec, text: textOf(spec) } : null;
}

/*
 * HAND-PICKED PLACEMENTS (owner decision 3: hand-picked, not auto-rollout). For the integrator to add
 * to parts/placements.ts as { kind: 'place', slot: 'chart', build: (step) => placeBuilder(step) }.
 * Every one replaces the derived CHART card that draws the same diagram with its labels on, so the
 * deck never shows the diagram twice (CONSTITUTION 5.1). Keys are course:lessonNum:stepIndex as
 * stepIdPosition() prints them; the pin builds each one from the raw loader.
 */
export const PLACE_PLACEMENTS: readonly { key: string; slot: 'chart' }[] = [
  { key: 'personal-finance:2:1', slot: 'chart' },
  { key: 'investing-fundamentals:8:1', slot: 'chart' },
  { key: 'personal-finance:4:1', slot: 'chart' },
  { key: 'corporate-finance:24:1', slot: 'chart' },
];
