/**
 * Corporate Finance lesson 8, Dividend Policy & Share Buybacks: the cash goes back to the owners.
 *
 * Opener: the hall as the shareholders' meeting, seen from the back of the room. Red curtains and
 * a valance frame a stage; the CFO stands at a lectern carrying the return sign and tosses coins
 * out over the edge to the shareholders below, two of whom reach up to catch them (dividends).
 * Behind him a chart of the share count steps down year on year with a red arrow: the company
 * buying its own shares back. The audience's backs fill the bottom edge, a framing no other
 * opener uses. Only small layers move: the two coins in flight, the arrow, the stage lamps, the sign.
 *
 * Keepsake: a tap pouring coins onto a heap.
 */
import type { PixelSprite } from '../types';
import { cfBackdrop } from './cf-backdrop';
import { cfKeepsake } from './cf1-finish';
import { CF_PALETTE, cfCoin, cfCompose, cfHall, cfLater, cfSignReturn } from './cf-kit';
import { cfCfoReach, cfRecolor } from './cf-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/** One stage curtain, folds lit from the left, gold fringe at the hem. */
const curtain: PixelSprite = {
  id: 'cf8-curtain',
  name: 'cf8-curtain',
  tags: ['scene', 'cf8'],
  blurb: 'A red stage curtain.',
  palette: CF_PALETTE,
  rows: [
    ...Array.from({ length: 45 }, () => 'rIIrIIrIa'),
    'OyOyOyOyO',
    '.O.O.O.O.',
  ],
};

/** The valance across the top of the stage, scalloped, fringed in gold. */
const valance: PixelSprite = {
  id: 'cf8-valance',
  name: 'cf8-valance',
  tags: ['scene', 'cf8'],
  palette: CF_PALETTE,
  rows: [
    'I'.repeat(80),
    'rII'.repeat(27).slice(0, 80),
    'rII'.repeat(27).slice(0, 80),
    'IIIIIII.'.repeat(10),
    'OyOyOy..'.repeat(10),
  ],
};

/** The stage floor: planks, a gold edge, the dark front face. */
const stage: PixelSprite = {
  id: 'cf8-stage',
  name: 'cf8-stage',
  tags: ['scene', 'cf8'],
  palette: CF_PALETTE,
  rows: [
    'a'.repeat(80),
    'A'.repeat(80),
    'AAAAAAAAAaAAAAAAAAAAAAAAAaAAAAAAAAAAAAAAAAAaAAAAAAAAAAAAAAAAaAAAAAAAAAAAAAaAAAAA',
    'A'.repeat(80),
    'AAAAaAAAAAAAAAAAAAAaAAAAAAAAAAAAAAAAaAAAAAAAAAAAAAAAAAAAAaAAAAAAAAAAAAAAAAaAAAAA',
    'O'.repeat(80),
    'a'.repeat(80),
    'a'.repeat(80),
  ],
};

/** The lectern: a gold-edged reading slope over a walnut stand whose panel takes a 7x7 sign at (4, 5). */
const lectern: PixelSprite = {
  id: 'cf8-lectern',
  name: 'cf8-lectern',
  tags: ['scene', 'cf8'],
  blurb: 'A walnut lectern with a dark sign panel.',
  palette: CF_PALETTE,
  rows: [
    'OOOOOOOOOOOOOOO',
    'OgggggggggggggO',
    '.OaaaaaaaaaaaO.',
    '.OAAAAAAAAAAAO.',
    '.OAgggggggggAO.',
    ...Array.from({ length: 7 }, () => '.OAgKKKKKKKgAO.'),
    '.OAgggggggggAO.',
    '.OAAAAAAAAAAAO.',
    'OOOOOOOOOOOOOOO',
    'aaaaaaaaaaaaaaa',
  ],
};

/** The share count, year on year: each bar shorter than the last. Its arrow is a layer. */
const chart: PixelSprite = {
  id: 'cf8-chart',
  name: 'cf8-chart',
  tags: ['scene', 'cf8'],
  blurb: 'A board of orchid bars getting shorter.',
  palette: CF_PALETTE,
  rows: [
    '.OOOOOOOOOOOOOOOOOOO.',
    'OgggggggggggggggggggO',
    'OgKKKKKKKKKKKKKKKKKaO',
    'OgKPPKKKKKKKKKKKKKKaO',
    'OgKPPKPPKKKKKKKKKKKaO',
    'OgKPPKPPKKKKKKKKKKKaO',
    'OgKPPKPPKPPKKKKKKKKaO',
    'OgKPPKPPKPPKKKKKKKKaO',
    'OgKPPKPPKPPKPPKKKKKaO',
    'OgKPPKPPKPPKPPKKKKKaO',
    'OgKPPKPPKPPKPPKKKKKaO',
    'OgKXXXXXXXXXXXXXXXKaO',
    'OaaaaaaaaaaaaaaaaaaaO',
    '.OOOOOOOOOOOOOOOOOOO.',
  ],
};

/**
 * A shareholder seen from behind: hair with a sheen (k), ears, a suit (X, outlined D). The
 * audience is this one sprite recoloured, so five people cost one drawing.
 */
const shareholder: PixelSprite = {
  id: 'cf8-shareholder',
  name: 'cf8-shareholder',
  tags: ['scene', 'cf8', 'character'],
  blurb: 'A shareholder seen from behind.',
  palette: CF_PALETTE,
  rows: [
    '...hhhhhh...',
    '..hkkhhhhh..',
    '..hhhhhhhh..',
    '.ShhhhhhhhS.',
    '..hhhhhhhh..',
    '...hhhhhh...',
    '....MMMM....',
    '.DXXXXXXXXD.',
    'DXXXXXXXXXXD',
  ],
};

/** A shareholder's arm stretched up to catch, in the same suit key. */
const reachUp: PixelSprite = {
  id: 'cf8-reach-up',
  name: 'cf8-reach-up',
  tags: ['scene', 'cf8'],
  palette: CF_PALETTE,
  rows: [
    'S.S',
    'SSS',
    '.M.',
    'DXD',
    'DXD',
    'DXD',
    'DXD',
    'DXD',
    'DXD',
    '.D.',
  ],
};

const silver = cfRecolor(shareholder, 'cf8-shareholder-silver', { h: 'x', k: 'w', X: 'b' });
const blonde = cfRecolor(shareholder, 'cf8-shareholder-blonde', { h: 'g', k: 'G', X: 't' });
const brown = cfRecolor(shareholder, 'cf8-shareholder-brown', { h: 'A', k: 'O', X: 'n' });
const auburn = cfRecolor(shareholder, 'cf8-shareholder-auburn', { h: '1', k: '2', X: 'C' });
const reachGreen = cfRecolor(reachUp, 'cf8-reach-up-green', { X: 'n' });
const reachNavy = cfRecolor(reachUp, 'cf8-reach-up-navy', { X: 'C' });

/** The return sign dimmed, for the lectern; the lit sign is a layer over it. */
const signReturnDim = cfRecolor(cfSignReturn, 'cf8-sign-return-dim', { G: 'g', y: 'g' });

const LECTERN = { x: 30, y: 30 } as const;

const base = cfCompose('cf8-opener-base', cfHall, [
  [chart, 11, 8],
  [curtain, 0, 0],
  [curtain, 71, 0],
  [valance, 0, 0],
  [stage, 0, 42],
  [cfCfoReach, 31, 15],
  [lectern, LECTERN.x, LECTERN.y],
  [signReturnDim, LECTERN.x + 4, LECTERN.y + 5],
  [reachGreen, 60, 49],
  [reachNavy, 76, 49],
  [shareholder, 1, 51],
  [silver, 16, 51],
  [blonde, 31, 51],
  [brown, 50, 51],
  [auburn, 66, 51],
], 'The still meeting: curtains and valance, the share count chart, the stage, the CFO at the lectern, five shareholders.');

/** Where a tossed coin flies from the CFO's hand. */
const TOSS = { x: 46, y: 24, lift: 10 } as const;

/**
 * A coin tossed `dx` across and `dy` down from the hand, rising a little before it falls, then a
 * beat empty while the next is thrown. Computed: a throw is a parabola, and ten hand-placed coins
 * along one is how a coin ends up jumping backwards.
 */
function tossed(id: string, dx: number, dy: number, frameMs: number): PixelSprite {
  const steps = 10;
  const path = Array.from({ length: steps }, (_, k) => {
    const u = k / (steps - 1);
    return [Math.round(dx * u), Math.round(-4 * TOSS.lift * u * (1 - u) + dy * u)] as const;
  });
  const top = -Math.min(0, ...path.map(([, y]) => y));
  const w = dx + 4;
  const h = dy + top + 4;
  const draw = (x: number, y: number) => {
    const grid = Array.from({ length: h }, () => Array.from({ length: w }, () => '.'));
    cfCoin.rows.forEach((row, j) => {
      [...row].forEach((ch, i) => {
        const line = grid[y + top + j];
        if (line && ch !== '.' && x + i < w) line[x + i] = ch;
      });
    });
    return grid.map((row) => row.join(''));
  };
  const empty = Array.from({ length: h }, () => '.'.repeat(w));
  const frames = [...path.map(([x, y]) => draw(x, y)), empty, empty];
  const [restX, restY] = path[3] ?? [0, 0];
  return { id, name: id, tags: ['scene', 'cf8'], blurb: 'A gold coin flying in an arc.', rows: draw(restX, restY), frames, frameMs };
}

const tossNear = tossed('cf8-opener-toss-near', 15, 21, 130);
const tossFar = cfLater(tossed('cf8-opener-toss-far', 30, 21, 150), 'cf8-opener-toss-far-later', 6, 150);

/** The share count falling: an arrow heading down and to the right across the chart. */
const arrowDown: PixelSprite = {
  id: 'cf8-opener-arrow',
  name: 'cf8-opener-arrow',
  tags: ['scene', 'cf8'],
  rows: [
    'rr.....',
    '.rr....',
    '..rr...',
    '...rr.r',
    '....rrr',
    '...rrrr',
  ],
};

const lamp: PixelSprite = { id: 'cf8-opener-lamp', name: 'cf8-opener-lamp', tags: ['scene', 'cf8'], rows: ['GyG', '.y.'] };

export const cf8Opener: SceneArt = {
  id: 'cf8-opener',
  label: 'On a stage the finance chief tosses gold coins from a lectern to shareholders reaching up to catch them, while a chart behind him shows the share count falling.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: lamp, x: 22, y: 5, motion: { kind: 'twinkle', periodMs: 2600, min: 0.4 } },
    { sprite: lamp, x: 55, y: 5, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.5, min: 0.4 } },
    { sprite: arrowDown, x: 23, y: 10, motion: { kind: 'twinkle', periodMs: 2000, min: 0.2 } },
    { sprite: cfSignReturn, x: LECTERN.x + 4, y: LECTERN.y + 5, motion: { kind: 'twinkle', periodMs: 3000, min: 0.3 } },
    { sprite: tossNear, x: TOSS.x, y: TOSS.y },
    { sprite: tossFar, x: TOSS.x, y: TOSS.y },
  ],
};

/** Lesson 8's emblem: a silver tap pouring gold coins onto a heap. */
const emblemTap: PixelSprite = {
  id: 'cf8-emblem-tap',
  name: 'cf8-emblem-tap',
  tags: [],
  blurb: 'A silver tap pouring gold coins onto a heap.',
  rows: [
    '..DXXXD.........',
    '..XwxxX.........',
    '....X...........',
    'DXXXXXXXXXD.....',
    'XwwwwwwwwxXD....',
    'DXXXXXXXXXxX....',
    '.........XxX....',
    '.........DXD....',
    '.........OyO....',
    '..........O.....',
    '.........OyO....',
    '.........OGO....',
    '.....OOOOOOOOO..',
    '....OyyGOOyyGgO.',
    '...OyyGGgOyGGggO',
    '...OOOOOOOOOOOOO',
  ],
};

export const cf8Finish = cfKeepsake(
  'cf8-finish',
  'A crystal award on a gold stand with a tap pouring gold coins onto a heap inside, and small sparkles around it.',
  emblemTap,
);

export const art: LessonArtSet = { opener: cf8Opener, backdrop: cfBackdrop, finish: cf8Finish };
