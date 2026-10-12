/**
 * Corporate Finance lesson 8, Dividend Policy & Share Buybacks: the cash goes back to the owners.
 *
 * Opener: the hall as the shareholders' meeting, seen from the back of the room. Red curtains and
 * a valance frame a stage; the CFO stands at a lectern carrying the return sign and tosses coins
 * out over the edge to the shareholders below, two of whom reach up to catch them (dividends).
 * Behind him a board shows the buyback: the same orchid pie twice, cut into four slices and then,
 * past a gold arrow, into two. The company bought shares back, so fewer slices share the same pie
 * and each is a bigger piece; one slice in each pie is lit so the eye can see it grow. The
 * audience's backs fill the bottom edge, a framing no other opener uses. Only small layers move:
 * the two coins in flight, the arrow, a glint on the bigger slice, the stage lamps, the sign.
 *
 * Keepsake: an orchid pie with one wedge lifted out (the shares bought back) and a gold coin
 * dropping onto it (the dividend paid on each share left).
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

/** A 9-wide pie, centred on its middle pixel; 19 is the radius squared that rounds it 3-7-7-9-9-9-7-7-3. */
const PIE = { size: 9, radius2: 19 } as const;

/**
 * One pie for the board, cut apart along `cut` with dark gaps, the slice `lit` in the pale orchid.
 * Computed, not drawn: both pies must be the same pie, and two hand-typed circles drift apart.
 */
function pie(cut: (dx: number, dy: number) => boolean, lit: (dx: number, dy: number) => boolean): string[] {
  const c = (PIE.size - 1) / 2;
  return Array.from({ length: PIE.size }, (_, y) =>
    Array.from({ length: PIE.size }, (_, x) => {
      const dx = x - c;
      const dy = y - c;
      if (dx * dx + dy * dy > PIE.radius2 || cut(dx, dy)) return 'K';
      const shade = dx + dy > 1;
      if (lit(dx, dy)) return shade ? 'q' : 'Q';
      return shade ? 'p' : 'P';
    }).join(''),
  );
}

/** Before: four shares, cut on both axes; ours is the top right quarter. */
const pieBefore = pie((dx, dy) => dx === 0 || dy === 0, (dx, dy) => dx > 0 && dy < 0);
/** After the buyback: the same pie in two shares; ours is now the whole right half. */
const pieAfter = pie((dx) => dx === 0, (dx) => dx > 0);

/** Where things sit on the board, from its top-left corner. Its gold arrow is a layer. */
const BOARD = { w: 24, h: 22, before: [2, 3], after: [13, 3], arrow: [3, 13] } as const;

/**
 * The buyback board: a gold frame round a dark face with the pie before and the pie after side by
 * side, and room under them for the arrow from one to the other.
 */
const chart: PixelSprite = {
  id: 'cf8-chart',
  name: 'cf8-chart',
  tags: ['scene', 'cf8'],
  blurb: 'A board with the same orchid pie cut into four slices and into two.',
  palette: CF_PALETTE,
  rows: (() => {
    const grid = Array.from({ length: BOARD.h }, (_, y) => {
      if (y === 0 || y === BOARD.h - 1) return [...`.${'O'.repeat(BOARD.w - 2)}.`];
      if (y === 1) return [...`O${'g'.repeat(BOARD.w - 2)}O`];
      if (y === BOARD.h - 2) return [...`O${'a'.repeat(BOARD.w - 2)}O`];
      return [...`O${'K'.repeat(BOARD.w - 2)}O`];
    });
    const stamp = (rows: readonly string[], [x, y]: readonly [number, number]) => {
      rows.forEach((row, j) => {
        [...row].forEach((ch, i) => {
          const line = grid[y + j];
          if (line) line[x + i] = ch;
        });
      });
    };
    stamp(pieBefore, BOARD.before);
    stamp(pieAfter, BOARD.after);
    return grid.map((row) => row.join(''));
  })(),
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

const CHART = { x: 9, y: 7 } as const;

const base = cfCompose('cf8-opener-base', cfHall, [
  [chart, CHART.x, CHART.y],
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
], 'The still meeting: curtains and valance, the buyback board, the stage, the CFO at the lectern, five shareholders.');

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

/** From the pie before to the pie after: a gold arrow pointing right, under the two pies. */
const arrowOn: PixelSprite = {
  id: 'cf8-opener-arrow',
  name: 'cf8-opener-arrow',
  tags: ['scene', 'cf8'],
  blurb: 'A gold arrow pointing right.',
  rows: [
    '............y....',
    '............yyy..',
    'yyyyyyyyyyyyyyyyy',
    'GGGGGGGGGGGGGGGGG',
    '............GGG..',
    '............G....',
  ],
};

/** A glint on our slice after the buyback: the same company, a bigger piece of it. */
const glint: PixelSprite = { id: 'cf8-opener-glint', name: 'cf8-opener-glint', tags: ['scene', 'cf8'], rows: ['.w.', 'wWw', '.w.'] };

const lamp: PixelSprite = { id: 'cf8-opener-lamp', name: 'cf8-opener-lamp', tags: ['scene', 'cf8'], rows: ['GyG', '.y.'] };

export const cf8Opener: SceneArt = {
  id: 'cf8-opener',
  label: 'On a stage the finance chief tosses gold coins from a lectern to shareholders reaching up to catch them, while a board behind him shows the same orchid pie cut into four slices and then into two bigger ones.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: lamp, x: 22, y: 5, motion: { kind: 'twinkle', periodMs: 2600, min: 0.4 } },
    { sprite: lamp, x: 55, y: 5, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.5, min: 0.4 } },
    { sprite: arrowOn, x: CHART.x + BOARD.arrow[0], y: CHART.y + BOARD.arrow[1], motion: { kind: 'twinkle', periodMs: 2000, min: 0.45 } },
    { sprite: glint, x: CHART.x + BOARD.after[0] + 5, y: CHART.y + BOARD.after[1] + 1, motion: { kind: 'twinkle', periodMs: 1700, phase: 0.3, min: 0 } },
    { sprite: cfSignReturn, x: LECTERN.x + 4, y: LECTERN.y + 5, motion: { kind: 'twinkle', periodMs: 3000, min: 0.3 } },
    { sprite: tossNear, x: TOSS.x, y: TOSS.y },
    { sprite: tossFar, x: TOSS.x, y: TOSS.y },
  ],
};

/**
 * Lesson 8's emblem, both ways the cash goes back: an orchid pie with one wedge lifted out (the
 * shares the company bought back) and a gold coin dropping onto what is left (the dividend paid on
 * every share still out there).
 */
const emblemPie: PixelSprite = {
  id: 'cf8-emblem-pie',
  name: 'cf8-emblem-pie',
  tags: [],
  blurb: 'An orchid pie with one wedge lifted out and a gold coin dropping onto it.',
  rows: [
    '.OOO............',
    'OwyGO.....qw....',
    'OyGgO.....qqw...',
    'OGggOqqE..qqqw..',
    '.OOOqqqE..qqqPP.',
    '...qqqqE..qqPPPP',
    '..qqqqPE..qPPPPP',
    '.qqqqPPE........',
    '.qqqPPPE........',
    '.EEEEEEEEEEEEE..',
    '.qPPPPPEPPpppp..',
    '.PPPPPPEPppppp..',
    '..PPPPPEppppp...',
    '...PPPPEpppp....',
    '....PPpEppp.....',
    '.....ppEpp......',
  ],
};

export const cf8Finish = cfKeepsake(
  'cf8-finish',
  'A crystal award on a gold stand with an orchid pie inside, one wedge lifted out and a gold coin dropping onto the rest, and small sparkles around it.',
  emblemPie,
);

export const art: LessonArtSet = { opener: cf8Opener, backdrop: cfBackdrop, finish: cf8Finish };
