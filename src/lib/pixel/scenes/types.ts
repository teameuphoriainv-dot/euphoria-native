/**
 * Scene art: a big pixel picture built from a still base and small moving layers.
 *
 * WHY LAYERS AND NOT ONE BIG ANIMATED SPRITE. A sprite's frames swap on the JS thread, and every
 * swap re-renders every rect of that sprite. An 80x60 scene is several hundred rects, so animating
 * the whole picture would re-render all of them eight times a second to move a cursor. Here the
 * base is drawn once, only SMALL sprites carry frames, and everything else that moves (a bob, a
 * drift, a twinkle, steam rising) is a transform or an opacity on the UI thread.
 *
 * NATIVE-OWNED. Nothing in src/lib/pixel/scenes is synced from the web repo (CONSTITUTION 5.5: new
 * art never goes in the web-synced sprite files).
 *
 * Owner decision 2026-09-29: lesson art is ALWAYS MOVING. Every motion here still rests under
 * Reduce Motion: frames stop on the sprite's still and the transforms are not started.
 */
import type { PixelSprite } from '../types';

/**
 * Motion applied to a whole layer, in SCENE PIXELS (the renderer multiplies by its scale).
 *   bob      up and down by `amp`, easing in and out
 *   drift    side to side by `amp`
 *   twinkle  opacity between 1 and `min` (default 0.25); `amp` is ignored
 *   rise     travels up by `amp` while fading out, then starts again (steam, sparks, floating signs)
 */
export type SceneMotion = {
  kind: 'bob' | 'drift' | 'twinkle' | 'rise';
  amp?: number;
  /** One full cycle, in ms. */
  periodMs: number;
  /** 0 to 1: where in its cycle the layer starts, so neighbours do not move in step. */
  phase?: number;
  /** Lowest opacity for `twinkle`. */
  min?: number;
};

export interface SceneLayer {
  /** A sprite with `frames` loops them. Keep framed sprites small (about 24x24 or less). */
  sprite: PixelSprite;
  /** Top-left corner, in scene pixels. */
  x: number;
  y: number;
  motion?: SceneMotion;
}

export interface SceneArt {
  id: string;
  /** What the picture shows, for VoiceOver. One plain sentence. */
  label: string;
  /** Scene size in pixels. The base must be exactly this size. */
  width: number;
  height: number;
  base: PixelSprite;
  /** Drawn over the base, in order. */
  layers: SceneLayer[];
}

/** The art one lesson carries. Every field is optional: a lesson without one keeps the default. */
export interface LessonArtSet {
  /** Replaces the shared flame on the lesson's opening screen. */
  opener?: SceneArt;
  /** Sits along the bottom of every screen of the lesson, behind the content. */
  backdrop?: SceneArt;
  /** The keepsake on the lesson-complete screen. */
  finish?: SceneArt;
}
