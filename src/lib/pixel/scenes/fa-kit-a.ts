/**
 * fa-kit-a: the Financial Analytics parts lessons 2 to 9 share, on top of fa-kit.
 *
 * fa-kit draws the plant and its five stations; this adds what a lesson needs to frame a new
 * picture with them: the machine room at any horizon (faRoom), a wall monitor of any size
 * (faMonitor), a console desk (faDesk), a wall dial (faDial), the lesson's lit stage on the
 * pipeline map (faStageLight), an emblem that draws itself in an order of the lesson's choosing
 * (faDrawnBy, for pictures that are not bars), and the keepsake every lesson's finish is
 * (faKeepsake: fa1-finish with the emblem swapped).
 *
 * Same rules as fa-kit: light from the left, outlines in the deep steps, kit tones only from
 * FA_STEEL, so anything here stamps cleanly next to anything there.
 */
import { faKeepsakeDressing, faMapLight, faTrophy, FA_MAP_LIGHTS, FA_STEEL, FA_TROPHY } from './fa-kit';
import type { FaStage } from './fa-kit';
import type { PixelSprite } from '../types';
import type { SceneArt, SceneLayer } from './types';

/* ── rooms ─────────────────────────────────────────────────────────────────────────────────── */

/** A flat patch painted over a room, in scene pixels: a floor shadow (Z), a doorway, a window. */
export type FaPatch = readonly [x: number, y: number, w: number, h: number, ch: string];

/**
 * The machine room the way lesson 1 draws it, at any horizon: a ceiling band (c), the navy wall
 * (a), a chair rail (e) at `rail`, the wall's foot (c) at `floor` with the lit floor edge (e) under
 * it, the floor (c), then `patches` painted over in order. Lesson 1's room is this with rail 40,
 * floor 48 and its shadows, plus the chute it draws by hand.
 */
export function faRoom(id: string, patches: readonly FaPatch[] = [], rail = 40, floor = 48): PixelSprite {
  const tone = (y: number): string => (y < 2 || y === floor || y > floor + 1 ? 'c' : y === rail || y === floor + 1 ? 'e' : 'a');
  const rows = Array.from({ length: 60 }, (_, y) => Array.from({ length: 80 }, () => tone(y)));
  for (const [x, y, w, h, ch] of patches) {
    for (let j = y; j < y + h; j++) {
      for (let i = x; i < x + w; i++) {
        if (!rows[j] || i < 0 || i >= 80) throw new Error(`${id}: patch at ${String(x)},${String(y)} leaves the room`);
        rows[j][i] = ch;
      }
    }
  }
  return {
    id,
    name: id,
    tags: ['scene', 'fa'],
    blurb: 'The still room: navy wall, chair rail, floor and cast shadows.',
    palette: FA_STEEL,
    rows: rows.map((r) => r.join('')),
  };
}

/* ── wall monitors ─────────────────────────────────────────────────────────────────────────── */

/**
 * A wall monitor `w` x `h`: a deep outline with clipped corners, a bezel lit along the top and
 * left, and dark glass (K) at FA_MONITOR_GLASS, (w - 6) x (h - 6), left for a chart layer. `grid`
 * dots a faint rule every fourth glass row, the way the analyzer's screen is ruled.
 */
export function faMonitor(id: string, w: number, h: number, grid = false): PixelSprite {
  const glass = (y: number) =>
    grid && y % 4 === 3 ? Array.from({ length: w - 6 }, (_, x) => (x % 2 ? 'K' : 'k')).join('') : 'K'.repeat(w - 6);
  return {
    id,
    name: id,
    tags: ['scene', 'fa', 'prop'],
    blurb: 'A wall monitor with dark glass, left for a chart.',
    rows: [
      `.${'D'.repeat(w - 2)}.`,
      `Dxw${'x'.repeat(w - 6)}XkD`,
      `Dx${'D'.repeat(w - 4)}kD`,
      ...Array.from({ length: h - 6 }, (_, y) => `DxD${glass(y)}DkD`),
      `Dx${'D'.repeat(w - 4)}kD`,
      `Dx${'X'.repeat(w - 4)}kD`,
      `.${'D'.repeat(w - 2)}.`,
    ],
  };
}
export const FA_MONITOR_GLASS = { x: 3, y: 3 } as const;

/**
 * A console desk seen from the front, `w` x 8: a lit top, a lip, a strip of keys, feet. Its feet
 * stand on the room's wall foot when its top-left is 7 rows above the floor line.
 */
export function faDesk(id: string, w: number): PixelSprite {
  const keys = Array.from({ length: w - 8 }, (_, i) => (i % 4 === 3 ? 'X' : 'K')).join('');
  return {
    id,
    name: id,
    tags: ['scene', 'fa', 'prop'],
    blurb: 'A console desk with a lit top and a strip of keys.',
    rows: [
      `.${'D'.repeat(w - 2)}.`,
      `Dw${'x'.repeat(w - 4)}XD`,
      'D'.repeat(w),
      `Dx${'X'.repeat(w - 4)}kD`,
      `DxXX${keys}XXkD`,
      `Dx${'X'.repeat(w - 4)}kD`,
      'D'.repeat(w),
      `.DkD${'.'.repeat(w - 8)}DkD.`,
    ],
  };
}

/**
 * A wall dial: the analyzer's gauge on a plate of its own, 12 x 12, for a model's output read off
 * a needle (a beta, a valuation). fa-kit's faGaugeNeedle goes at FA_DIAL_NEEDLE.
 */
export const faDial: PixelSprite = {
  id: 'fa-dial',
  name: 'dial',
  tags: ['scene', 'fa', 'prop'],
  rows: [
    '.DDDDDDDDDD.',
    'DxXXXXXXXXkD',
    'DxXXDDDDXXkD',
    'DxXDwwxxDXkD',
    'DxDwxxxxxDkD',
    'DxDxxxxxxDkD',
    'DxDxxxxxXDkD',
    'DxDxxxxXXDkD',
    'DxXDXXXXDXkD',
    'DxXXDDDDXXkD',
    'DxXXXXXXXXkD',
    '.DDDDDDDDDD.',
  ],
};
export const FA_DIAL_NEEDLE = { x: 3, y: 4 } as const;

/* ── the pipeline map ──────────────────────────────────────────────────────────────────────── */

/** The map box for `stage`, lit and breathing, on a faPipelineMap stamped at (x, y). */
export function faStageLight(stage: FaStage, x: number, y: number): SceneLayer {
  return { sprite: faMapLight(stage), x: x + FA_MAP_LIGHTS.x, y: y + FA_MAP_LIGHTS.y, motion: { kind: 'twinkle', periodMs: 1600, min: 0.3 } };
}

/* ── emblems ───────────────────────────────────────────────────────────────────────────────── */

/**
 * An emblem that draws itself in the order `step` gives each pixel (0 first), for pictures that
 * are not bars: dots and then a line through them, a fan of paths, a network lighting up. Pixels
 * only ever appear; the finished picture holds for `hold` frames, then the screen clears, the same
 * beat as fa-kit's faDrawnChart.
 */
export function faDrawnBy(
  id: string,
  full: readonly string[],
  step: (x: number, y: number, ch: string) => number,
  frameMs: number,
  hold = 3,
): PixelSprite {
  let last = 0;
  full.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') last = Math.max(last, step(x, y, ch)); }));
  const at = (t: number) => full.map((row, y) => [...row].map((ch, x) => (ch !== '.' && step(x, y, ch) <= t ? ch : '.')).join(''));
  const frames = Array.from({ length: last + 1 + hold }, (_, t) => at(Math.min(t, last)));
  frames.push(full.map((row) => '.'.repeat(row.length)));
  return { id, name: id, tags: ['scene', 'fa', 'emblem'], rows: [...full], frames, frameMs };
}

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/**
 * A lesson's keepsake: the pathway trophy with `emblem` (FA_EMBLEM size) in its screen and the
 * shared dressing around it. fa1-finish is exactly this with lesson 1's emblem, written by hand.
 */
export function faKeepsake(id: string, label: string, emblem: PixelSprite): SceneArt {
  return {
    id,
    label,
    width: FA_TROPHY.width,
    height: FA_TROPHY.height,
    base: faTrophy,
    layers: [{ sprite: emblem, x: FA_TROPHY.emblem.x, y: FA_TROPHY.emblem.y }, ...faKeepsakeDressing],
  };
}
