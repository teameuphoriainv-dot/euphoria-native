/**
 * Build-up (design M3): an authored flow or stack diagram that assembles itself in authored order,
 * then lets Atlas explain each piece. Brilliant's self-assembling diagram (timing/hilbert.jpg).
 *
 * WHY THIS EXISTS. A teaching slide's flow or stack today sits on a `chart` card and LessonVisual
 * animates it once on mount (lesson-visual.tsx), so "first this, then this, then this" arrives as
 * one finished picture and the order, which IS the lesson on a flow, is never shown happening.
 * Here piece k draws only after piece k-1, and each authored `explain` gets its own beat.
 *
 * NOTHING IS WRITTEN HERE (CONSTITUTION 3.1). Every string the card shows is copied from the
 * AnimatedVisual: `label` from the node/segment label, `tag` from its authored `value`, `caption`
 * from its authored `explain`, `footer` from the visual's footer, `title` from the visual's title
 * through the same compressTitle the chart card it replaces uses (so the heading does not change
 * when the card does). `weight` is the stack's authored `percent` and only sizes a tier; it is
 * never printed. `buildBuildup` returns null unless EVERY piece has a label and an explain: a card
 * that captioned three pieces and went silent on the fourth would be a diagram with a hole in it.
 *
 * AUTHORED HEX IS DROPPED (CONSTITUTION 5.8). Stack segments and some flow nodes carry `color`
 * ('#10B981', '#EF4444'...). The spec has no colour field at all, so no authored hex can reach
 * the renderer; tiers use the theme ramp in buildup-card.tsx. The pin checks the built JSON.
 *
 * THE CAP IS THE TIME BUDGET. At most BUILDUP_MAX_PIECES pieces, because the whole build must
 * finish inside BUILD_MAX_MS (Hilbert's 2.5s budget at CLIP_TEMPO, 5s). personal-finance:10:2's 7-node "Wealth-Building
 * Order of Operations" would take 3,180ms, so it returns null and stays on LessonVisual.
 *
 * Pure: the pin imports this under plain node (scripts/ts-resolve-hooks.mjs).
 */
import type { AnimatedVisual, LessonStep } from '@/lib/curriculum';
import { CARD_BUDGET } from '../types';
import { compressTitle } from '../compress';
import {
  BUILD_CONNECTOR_MS,
  BUILD_FILL_MS,
  BUILD_MAX_PIECES,
  buildStartMs,
  buildTotalMs,
} from './timing';
import type { BuildPiece, BuildSpec, ClipBeat } from './types';

/**
 * Re-exported rather than written as 5, so the cap and the time budget are one number in
 * timing.ts. The pin's break test raises THIS to 7 and must watch the duration assertion fail.
 */
export const BUILDUP_MAX_PIECES: number = BUILD_MAX_PIECES;
/** A flow of two nodes is an arrow, not a sequence; a stack of two tiers is still an order. */
export const BUILDUP_MIN_FLOW = 3;
export const BUILDUP_MIN_STACK = 2;

/** The label fades in over this once its fill has landed. Opacity only, no geometry. */
export const LABEL_FADE_MS = 300;

type FlowVisual = Extract<AnimatedVisual, { type: 'flow' }>;
type StackVisual = Extract<AnimatedVisual, { type: 'stack' }>;

const text = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
/** An em or en dash in prose (CONSTITUTION 4). U+2212 minus is not one and stays allowed. */
const DASH = /[\u2013\u2014]/;

/**
 * Build a spec from an authored flow or stack visual, or return null.
 *
 * Null unless: the visual has a title; it is a flow of 3-5 nodes or a stack of 2-5 segments;
 * every piece has a non-empty label and explain; every label and tag fits CARD_BUDGET.detail (a
 * piece is a row on a phone, and a longer one would wrap past the row the build draws for it);
 * on a stack, every percent is a positive number (it sizes the tier); and no shown string carries
 * an em or en dash.
 */
export function buildFromVisual(visual: AnimatedVisual | undefined | null): BuildSpec | null {
  if (!visual || typeof visual !== 'object') return null;
  const title = text(visual.title);
  if (!title) return null;

  let mode: BuildSpec['mode'];
  let raw: { label?: unknown; value?: unknown; explain?: unknown; percent?: unknown }[];
  if (visual.type === 'flow') {
    mode = 'flow';
    raw = Array.isArray((visual as FlowVisual).nodes) ? (visual as FlowVisual).nodes : [];
    if (raw.length < BUILDUP_MIN_FLOW) return null;
  } else if (visual.type === 'stack') {
    mode = 'stack';
    raw = Array.isArray((visual as StackVisual).segments) ? (visual as StackVisual).segments : [];
    if (raw.length < BUILDUP_MIN_STACK) return null;
  } else {
    return null;
  }
  if (raw.length > BUILDUP_MAX_PIECES) return null;

  const pieces: BuildPiece[] = [];
  for (const item of raw) {
    const label = text(item.label);
    const caption = text(item.explain);
    const tag = text(item.value);
    if (!label || !caption) return null;
    // Authored text is shown verbatim, so a dash in it cannot be fixed here; the card is skipped.
    if (DASH.test(label) || DASH.test(caption) || DASH.test(tag)) return null;
    if (label.length > CARD_BUDGET.detail || tag.length > CARD_BUDGET.detail) return null;
    const piece: BuildPiece = { label, caption };
    if (tag) piece.tag = tag;
    if (mode === 'stack') {
      const w = item.percent;
      if (typeof w !== 'number' || !Number.isFinite(w) || !(w > 0)) return null;
      piece.weight = w;
    }
    pieces.push(piece);
  }

  const spec: BuildSpec = { kind: 'build', title: compressTitle(title, CARD_BUDGET.title), mode, pieces };
  const footer = text(visual.footer);
  if (DASH.test(spec.title) || DASH.test(footer)) return null;
  if (footer) spec.footer = footer;
  return spec;
}

/**
 * The placement entry point (parts/placements.ts contract): the RAW teaching slide at the placed
 * position. Only `diagramVisual` is read, because the only card this may replace is the `chart`
 * card derive.ts builds from exactly that field. `lessonSteps` is accepted for the contract and
 * unused: every figure this card shows sits on its own step.
 */
export function buildBuildup(step: LessonStep, _lessonSteps?: LessonStep[]): BuildSpec | null {
  const s = step as { type?: string; diagramVisual?: AnimatedVisual };
  if (s?.type !== 'teachingSlide') return null;
  return buildFromVisual(s.diagramVisual);
}

/** Every sentence this card puts on screen, for the deck's say-it-once check. */
export function textOf(spec: BuildSpec): string[] {
  const out = [spec.title];
  for (const p of spec.pieces) {
    out.push(p.label, p.caption);
    if (p.tag) out.push(p.tag);
  }
  if (spec.footer) out.push(spec.footer);
  return out;
}

/** When each part of piece k draws. All times in ms from the start of the build. */
export type PieceTiming = {
  /** Piece 0 has no connector (nothing above it to grow from): 0 and 0. */
  connectorAt: number;
  connectorMs: number;
  fillAt: number;
  fillMs: number;
  /** The label fades in when its fill has landed, so a word never sits on an empty row. */
  labelAt: number;
};

/**
 * Piece k starts at buildStartMs(k); its connector grows for BUILD_CONNECTOR_MS, then its fill
 * runs for BUILD_FILL_MS. A stack has no drawn connector but keeps the same slot as a pause, so
 * both modes run on one clock and buildTotalMs describes both.
 */
export function pieceTiming(k: number): PieceTiming {
  const start = buildStartMs(k);
  const connectorMs = k > 0 ? BUILD_CONNECTOR_MS : 0;
  const fillAt = start + connectorMs;
  return { connectorAt: start, connectorMs, fillAt, fillMs: BUILD_FILL_MS, labelAt: fillAt + BUILD_FILL_MS };
}

/** When the last piece of this spec lands. Equal to timing.ts buildTotalMs by construction. */
export function buildDurationMs(spec: Pick<BuildSpec, 'pieces'>): number {
  const n = spec.pieces.length;
  let end = 0;
  for (let k = 0; k < n; k++) end = Math.max(end, pieceTiming(k).labelAt);
  return n === 0 ? 0 : Math.max(end, buildTotalMs(n));
}

/**
 * The clip's beats: one per piece, captioned with that piece's authored explain, in authored order.
 * Beat 0 carries the whole build's motion (the timeline clamps it to BEAT_MAX_MS; the build itself
 * runs on its own clock in the card); every later beat only moves the highlight, so it has no motion
 * and its hold is the caption's reading time.
 */
export function beatsFor(spec: BuildSpec): ClipBeat[] {
  const total = buildDurationMs(spec);
  return spec.pieces.map((p, k) => ({ caption: p.caption, motionMs: k === 0 ? total : 0 }));
}

/** A tier's floor: 12 cells is 48pt, over the 44pt target floor (CONSTITUTION 5.10). */
export const TIER_MIN_CELLS = 12;
/** The most a heavier tier adds on top of the floor. */
export const TIER_EXTRA_CELLS = 8;

/**
 * A stack tier's height in cells. Monotonic in `weight`: a bigger authored percent is never drawn
 * as a shorter tier. Not proportional, on purpose: every tier is also a 44pt button with a label
 * in it, so the floor wins over the ratio, and the percent itself is never printed.
 */
export function tierCells(weight: number | undefined, maxWeight: number): number {
  if (!(typeof weight === 'number' && weight > 0) || !(maxWeight > 0)) return TIER_MIN_CELLS;
  return TIER_MIN_CELLS + Math.max(1, Math.round((Math.min(weight, maxWeight) / maxWeight) * TIER_EXTRA_CELLS));
}
