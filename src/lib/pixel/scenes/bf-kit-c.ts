/**
 * Behavioral Finance art kit, batch C (lessons 18 to 25): what more than one of those lessons builds on.
 *
 * LETTERING. A few of these scenes carry a number or a word the picture needs to be read at all: the
 * odds on a card, two prices for one mug, a report's name, a menu's prices, podium places. bfText letters
 * them in a 3x5 hand (the dollar sign stands 7 tall, the way it does in print).
 *
 * THE HARE HOLDING SOMETHING UP. bfHareRaise is System 1 with a fist in the air, blinking: the pose
 * the slam starts from, with no sweat. A lesson stamps what it holds (a phone, a ticket, a prize) onto
 * the fist with bfStamp (bf-kit-b.ts); BF_HARE_FIST is where the paw's knuckles are.
 *
 * bfHeart is a like: hearts rise off whatever System 1 has fallen for.
 *
 * House rules as bf-kit.ts: deep-step outlines, framed sprites within the 32x32 area, nothing
 * web-synced.
 */
import type { PixelSprite } from '../types';
import { bfHareSlam } from './bf-kit';

/* ── lettering ────────────────────────────────────────────────────────────────────────────── */

const GLYPHS: Record<string, string[]> = {
  0: ['###', '#.#', '#.#', '#.#', '###'],
  1: ['.#.', '##.', '.#.', '.#.', '###'],
  2: ['##.', '..#', '.#.', '#..', '###'],
  3: ['###', '..#', '.##', '..#', '###'],
  4: ['#.#', '#.#', '###', '..#', '..#'],
  5: ['###', '#..', '###', '..#', '###'],
  6: ['###', '#..', '###', '#.#', '###'],
  7: ['###', '..#', '.#.', '.#.', '.#.'],
  8: ['###', '#.#', '###', '#.#', '###'],
  9: ['###', '#.#', '###', '..#', '###'],
  B: ['##.', '#.#', '##.', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'],
  H: ['#.#', '#.#', '###', '#.#', '#.#'],
  K: ['#.#', '#.#', '##.', '#.#', '#.#'],
  L: ['#..', '#..', '#..', '#..', '###'],
  S: ['###', '#..', '###', '..#', '###'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
  '-': ['...', '...', '###', '...', '...'],
  '%': ['#.#', '..#', '.#.', '#..', '#.#'],
  '?': ['##.', '..#', '.#.', '...', '.#.'],
  $: ['.#.', '###', '#..', '###', '..#', '###', '.#.'],
};

/**
 * `text` lettered in `ink`, one clear column between glyphs. A line with a dollar sign is 7 tall and its
 * other glyphs sit in the middle five rows. Throws on a glyph it lacks, so a typo fails the render.
 */
export function bfText(id: string, text: string, ink: string): PixelSprite {
  const glyphs = [...text].map((ch) => {
    const g = GLYPHS[ch];
    if (!g) throw new Error(`${id}: no glyph for "${ch}"`);
    return g;
  });
  const h = Math.max(...glyphs.map((g) => g.length));
  const rowOf = (g: string[], r: number) => g[r - Math.floor((h - g.length) / 2)] ?? '...';
  return {
    id,
    name: id,
    tags: ['bf', 'text'],
    rows: Array.from({ length: h }, (_, r) => glyphs.map((g) => rowOf(g, r).replace(/#/g, ink)).join('.')),
  };
}

/* ── the hare holding something up ────────────────────────────────────────────────────────── */

const raised = (bfHareSlam.frames ?? [bfHareSlam.rows])[0];

/** The raised pose with its eye shut: the open eye's white and pupil painted over in fur and lid. */
const raisedBlink = raised.map((row, y) => {
  if (y === 11) return row.slice(0, 11) + 'xxx' + row.slice(14);
  if (y === 12) return row.slice(0, 11) + 'DDDD' + row.slice(15);
  if (y === 13) return row.slice(0, 12) + 'xx' + row.slice(14);
  return row;
});

/** System 1 with a fist in the air, blinking now and then: stamp what it holds onto the fist. */
export const bfHareRaise: PixelSprite = {
  id: 'bf-hare-raise',
  name: 'bf-hare-raise',
  tags: ['character', 'bf', 'system-1'],
  blurb: "System 1 holding something up: fist in the air, blinking.",
  rows: raised,
  frames: [raised, raised, raisedBlink, raised],
  frameMs: 600,
};

/** The raised paw's knuckles, (19..21, 5) on bfHareRaise: a held prop's grip goes here. */
export const BF_HARE_FIST = { x: 19, y: 5 } as const;

/**
 * `sprite` with `n` clear rows on top, frames and all, so a prop held up can rise above the head
 * (bfStamp only grows a canvas right and down). Place the layer `n` rows higher to keep the feet put.
 */
export function bfHeadroom(sprite: PixelSprite, id: string, n: number): PixelSprite {
  const grow = (rows: string[]) => [...Array.from({ length: n }, () => '.'.repeat(rows[0].length)), ...rows];
  return { ...sprite, id, rows: grow(sprite.rows), ...(sprite.frames ? { frames: sprite.frames.map(grow) } : {}) };
}

/* ── likes ────────────────────────────────────────────────────────────────────────────────── */

/** A pink heart with a white shine, made to rise and fade off whatever System 1 has fallen for. */
export const bfHeart: PixelSprite = {
  id: 'bf-heart',
  name: 'bf-heart',
  tags: ['prop', 'bf'],
  rows: [
    '.ff.ff.',
    'fFWfFFf',
    'fFFFFFf',
    '.fFFFf.',
    '..fFf..',
    '...f...',
  ],
};
