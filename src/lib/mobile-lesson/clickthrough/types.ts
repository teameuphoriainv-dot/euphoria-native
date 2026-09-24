/**
 * Clickthrough specs: the data each Atlas clip card (stage, predict, build-up, place) renders.
 *
 * WHY THESE ARE NEW NAMES. `types.ts` already has a `SceneSpec` (pixel art on a card, no `kind`)
 * and parts/scene.ts has `ScenePartSpec`. Reusing either name here would put two unrelated shapes
 * behind one identifier, and the kind-less one would break the `MobileInteractive` discriminated
 * union the moment the integrator adds these to it (the note beside `ScenePartSpec` in types.ts).
 *
 * THE RULE EVERY FIELD OBEYS (CONSTITUTION 3.1). Each string a learner reads is authored text, copied
 * by a builder that returns null when it cannot find it: `display` is an authored `displayValue` or
 * `value`, `caption` is an authored `explain`, `label` is an authored label. `magnitude`, `percent`
 * and `weight` only size geometry and are never printed, so a builder may not turn one of them into
 * a label. Nothing here is interpolated between authored points.
 *
 * Type-only on purpose: pins import builders under plain node (scripts/ts-resolve-hooks.mjs), so
 * nothing in this file may pull in React Native.
 */

/** M1. One diagram, several beats. Each beat draws one item and captions it. */
export type StageItem = {
  label: string;
  /** Authored `displayValue` or `value`, shown when the geometry finishes. Never counted up. */
  display: string;
  /** Sizes the bar / line point / mark count. Never printed. */
  magnitude: number;
  /** Authored `explain` for this item, word for word. */
  caption: string;
};
export type StageSpec = {
  kind: 'stage';
  title: string;
  mode: 'bars' | 'line' | 'pictograph';
  /** 2 to 5 items, in authored order (the stage pin's break test sorts them and must fail). */
  items: StageItem[];
  footer?: string;
};

/** M2. Commit to a guess, then see the authored bar grow over it. Never graded or scored. */
export type PredictRow = { label: string; display: string; /** 0-100, authored. Never printed. */ percent: number };
export type PredictSpec = {
  kind: 'predict';
  title: string;
  anchor: PredictRow;
  target: PredictRow & { caption: string };
  footer?: string;
};

/** M3. The diagram assembles itself in authored order, then each piece explains itself on tap. */
export type BuildPiece = {
  label: string;
  tag?: string;
  caption: string;
  /** Stack tier height from the authored `percent`. Authored segment colours are dropped (CONSTITUTION 5.8). */
  weight?: number;
};
export type BuildSpec = {
  kind: 'build';
  title: string;
  mode: 'flow' | 'stack';
  /** 2 to 5 pieces; a longer visual returns null so the build stays inside BUILD_MAX_MS. */
  pieces: BuildPiece[];
  footer?: string;
};

/** M4. An unlabelled diagram; tap a token, then tap the slot it names. Tap only, never drag. */
export type PlaceSlot = {
  /** Distinct per slot, so a slot's size is the clue. Never printed. */
  magnitude: number;
  /** The token that belongs here. */
  label: string;
  caption: string;
};
export type PlaceSpec = {
  kind: 'place';
  title: string;
  mode: 'waffle' | 'pictograph' | 'stack';
  slots: PlaceSlot[];
  footer?: string;
};

/** Every clip kind, for the integrator's `MobileInteractive` union and the deck audits. */
export type ClipSpec = StageSpec | PredictSpec | BuildSpec | PlaceSpec;
export type ClipKind = ClipSpec['kind'];

/**
 * How the small Atlas beside a clip reacts on a beat. Mapped onto expressions and one-shot moves
 * the existing <Atlas> already has (pixel-stage.tsx AtlasCue); no new art.
 *   point: looks at the diagram while something new is drawn.
 *   nod: acknowledges a beat the learner moved on by hand, or a correct placement.
 *   celebrate: the last beat, once.
 */
export type AtlasReaction = 'point' | 'nod' | 'celebrate';

/** One beat as the shared timeline sees it. Cards map their own items onto this. */
export type ClipBeat = {
  /** Read by VoiceOver on arrival and used for the autoplay reading hold. */
  caption: string;
  /** How long this beat's motion runs. Clamped to BEAT_MAX_MS by the timeline. */
  motionMs: number;
  /** Omitted: the timeline picks point for inner beats and celebrate for the last. */
  reaction?: AtlasReaction;
};
