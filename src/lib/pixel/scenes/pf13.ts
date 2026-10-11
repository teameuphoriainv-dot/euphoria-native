/**
 * Personal Finance lesson 13, Student Loans & Education Financing: borrow no more than the job pays.
 *
 * A new set, a dorm room at dusk: a bookcase with the cat sitting up on top, fairy lights strung along
 * the wall, a pennant, and through the window the campus clock tower. The figure, in cap and tassel,
 * holds its diploma up. On the desk a balance weighs the degree (a stack of books) against a first
 * year's pay (a wad of bills) and hangs level, the lesson's rule that the loans should not outweigh the
 * first salary. Moving: the tassel, the lights in turn, a glint by the diploma, the cat's tail.
 */
import type { PixelSprite } from '../types';
import { pfCompose, pfKitchen, pfSparkle, pfTable } from './pf-kit';
import { pfCatSit } from './pf-kit-a';
import { pfSaverRaise } from './pf-kit-b';
import { pfKeepsake } from './pf1-finish';
import { pfBackdrop } from './pf-backdrop';
import type { LessonArtSet, SceneArt } from './types';

/** The window onto campus at dusk: college roofs with lit windows and the clock tower, its face at columns 13 to 15, rows 6 to 8. */
const campusWindow: PixelSprite = {
  id: 'pf13-campus-window',
  name: 'campus window',
  tags: ['scene', 'pf'],
  rows: [
    '.DDDDDDDDDDDDDDDDDDDDDD.',
    '.DXXXXXXXXXXXXXXXXXXXXD.',
    '.DXEEEEEEEEEEEKEEEEEEXD.',
    '.DXEEEEEEEEEEKKKEEEEEXD.',
    '.DXEEEEEEEEEEKKKEEEEEXD.',
    '.DXpppppppppkKKKKppppXD.',
    '.DXpppppppppkxwxKppppXD.',
    '.DXpppppppppkwKwKppppXD.',
    '.DXfffffffffkxwKKffffXD.',
    '.DXfffffffffkKKKKffffXD.',
    '.DXfffffffffkKKKKffffXD.',
    '.DX333333333kKyKK3333XD.',
    '.DXDDDDDDDDDkKKKKDDDDXD.',
    '.DXKKKKKKKKKkKKKKKKKKXD.',
    '.DXKyKKyKKyKkyKyKKyGKXD.',
    '.DXKKKKKKKKKkKKKKKKKKXD.',
    '.DXKyKKyKKyKkKKKKKyKKXD.',
    '.DXKKKKKKKKKkKKKKKKKKXD.',
    '.DXXXXXXXXXXXXXXXXXXXXD.',
    'DxxxxxxxxxxxxxxxxxxxxxxD',
    'DDDDDDDDDDDDDDDDDDDDDDDD',
  ],
};

/** A bookcase 18 wide: a wood frame and four shelves of spines, two pixels each, at uneven heights. */
const SPINES = ['R', 'B', 'N', 'P', 'G', 'T', 'F', 'q', 'b', 'r'];
function bookcase(): PixelSprite {
  const W = 18;
  const rows = ['O'.repeat(W), `O${'g'.repeat(W - 2)}O`];
  for (let shelf = 0; shelf < 4; shelf++) {
    for (let r = 0; r < 7; r++) {
      rows.push(
        Array.from({ length: W }, (_, x) => {
          if (x === 0 || x === W - 1) return 'O';
          if (x === 1) return 'g';
          const book = Math.floor((x - 2) / 2);
          const tall = 4 + ((book * 7 + shelf * 3) % 3);
          if (r < 7 - tall) return 'K';
          return SPINES[(book * 3 + shelf * 5) % SPINES.length];
        }).join(''),
      );
    }
    rows.push('O'.repeat(W));
  }
  return { id: 'pf13-bookcase', name: 'bookcase', tags: ['scene', 'pf'], rows };
}

/** Fairy lights strung across the wall: the wire sags between its ends, a bulb hangs every five pixels. */
const LIGHTS_W = 38;
const sag = (x: number) => Math.round(1 + 3 * Math.sin((Math.PI * x) / (LIGHTS_W - 1)));
function lightsRows(pick: (bulb: number) => string | null): string[] {
  const rows = Array.from({ length: 6 }, () => Array.from({ length: LIGHTS_W }, () => '.'));
  for (let x = 0; x < LIGHTS_W; x++) {
    if (x % 5 === 2) {
      const ch = pick(Math.floor(x / 5));
      if (ch) rows[sag(x) + 1][x] = ch;
    }
  }
  return rows.map((row) => row.join(''));
}
const DIM = ['r', 'g', 'b', 'n', 'f'];
const BRIGHT = ['R', 'y', 'B', 'm', 'F'];
const lightString: PixelSprite = {
  id: 'pf13-light-string',
  name: 'light string',
  tags: ['scene', 'pf'],
  rows: lightsRows((i) => DIM[i % DIM.length]).map((row, y) =>
    [...row].map((ch, x) => (ch === '.' && sag(x) === y ? 'X' : ch)).join(''),
  ),
};
const lightsEven: PixelSprite = {
  id: 'pf13-lights-even',
  name: 'lights, even bulbs',
  tags: ['scene', 'pf'],
  rows: lightsRows((i) => (i % 2 === 0 ? BRIGHT[i % BRIGHT.length] : null)),
};
const lightsOdd: PixelSprite = {
  id: 'pf13-lights-odd',
  name: 'lights, odd bulbs',
  tags: ['scene', 'pf'],
  rows: lightsRows((i) => (i % 2 === 1 ? BRIGHT[i % BRIGHT.length] : null)),
};

/** A felt pennant on a stick, pointing right. */
const pennant: PixelSprite = {
  id: 'pf13-pennant',
  name: 'pennant',
  tags: ['scene', 'pf'],
  rows: [
    'gEEEEE......',
    'gEqPPPPEE...',
    'gEPwwPPPPPEE',
    'gEPPPPPPEE..',
    'gEEEEEE.....',
  ],
};

/** The cap: the board a flat diamond with a gold cord from its button to the left corner, the crown on the hair. */
const mortarboard: PixelSprite = {
  id: 'pf13-mortarboard',
  name: 'mortarboard',
  tags: ['scene', 'pf'],
  rows: [
    '.....EEEE.....',
    '..EEEqPPPEEE..',
    'EGGGGGGyPPPPEE',
    '..EEPPPPPPEE..',
    '...EEEEEEEE...',
    '...EppppppE...',
  ],
};

/** The tassel hanging from the board's left corner, swaying. */
const TASSEL_REST = ['G..', 'G..', 'G..', 'y..', 'yG.', 'GGg', '.g.'];
const TASSEL_SWAY = ['G..', 'G..', '.G.', '.y.', '.yG', '.GG', '..g'];
const tassel: PixelSprite = {
  id: 'pf13-tassel',
  name: 'tassel',
  tags: ['scene', 'pf'],
  rows: TASSEL_REST,
  frames: [TASSEL_REST, TASSEL_SWAY, TASSEL_REST, TASSEL_REST],
  frameMs: 550,
};

/** The diploma, rolled and tied with a red ribbon; the raised hand holds it at the ribbon. */
const scroll: PixelSprite = {
  id: 'pf13-scroll',
  name: 'scroll',
  tags: ['scene', 'pf'],
  rows: [
    'XwwwRwwwX',
    'xwwwRwwwx',
    'XxxxrxxxX',
  ],
};

/**
 * The balance, level: a beam on a post, chains to two pans. In the left pan the degree, a stack of
 * books; in the right a first year's pay, a wad of bills.
 */
const balance: PixelSprite = {
  id: 'pf13-balance',
  name: 'balance',
  tags: ['scene', 'pf'],
  rows: [
    '..........y..........',
    '.........GyG.........',
    '.gGGGGGGGGGGGGGGGGGg.',
    '...X......GO.....X...',
    '..X.X.....GO....X.X..',
    '.PPPPP....GO...nNmNn.',
    '.BBBBB....GO...NNNNN.',
    '.RRRRR....GO...nNmNn.',
    'X.....X...GO..X.....X',
    'OGGGGGO...GO..OGGGGGO',
    '.OgggO....GO...OgggO.',
    '..........GO.........',
    '..........GO.........',
    '..........GO.........',
    '........OGGGO........',
    '......OGGGGGGgO......',
    '......OOOOOOOOO......',
  ],
};

/** Three textbooks lying on the desk, spines out. */
const textbooks: PixelSprite = {
  id: 'pf13-textbooks',
  name: 'textbooks',
  tags: ['scene', 'pf'],
  rows: [
    '.BBBBBBBB.',
    '.bwwwwwwb.',
    'NNNNNNNNNN',
    'nwwwwwwwwn',
    '.RRRRRRRR.',
    '.rwwwwwwr.',
  ],
};

/** A teal backpack set down on the rug, a gold zip pull on its pocket. */
const backpack: PixelSprite = {
  id: 'pf13-backpack',
  name: 'backpack',
  tags: ['scene', 'pf'],
  rows: [
    '...ttt...',
    '..t...t..',
    '.tTTTTTt.',
    'tTTTTTTTt',
    'tTtttttTt',
    'tTTTyTTTt',
    'tTTTTTTTt',
    'tTTTTTTTt',
    '.ttttttt.',
  ],
};

/** Lesson 13's emblem: the mortarboard, its gold tassel hanging at the left. */
const emblemCap: PixelSprite = {
  id: 'pf13-emblem-cap',
  name: 'pf13-emblem-cap',
  tags: ['scene', 'pf', 'emblem'],
  rows: [
    '.....qqqq.....',
    '..qqPPPPPPqq..',
    'GGGGGGGyPPPPqq',
    'G.EEPPPPPPEE..',
    'G...EEEEEE....',
    'G...EppppE....',
    'yG..EppppE....',
    'GGg..EEEE.....',
    '.g............',
  ],
};

// Order is depth: the scroll behind the raised hand, the figure behind the desk, the balance on the top.
const base = pfCompose('pf13-opener-base', 80, 60, pfKitchen.rows, [
  [campusWindow, 56, 1],
  [lightString, 17, 0],
  [pennant, 44, 6],
  [bookcase(), 0, 13],
  [scroll, 38, 13],
  [pfSaverRaise, 24, 12],
  [mortarboard, 25, 8],
  [pfTable(62, 12), 18, 36],
  [balance, 55, 21],
  [textbooks, 19, 32],
  [backpack, 27, 48],
]);

export const pf13Opener: SceneArt = {
  id: 'pf13-opener',
  label: 'In a dorm room at dusk, a new graduate in a cap holds up a diploma beside a balance that weighs a stack of books against a wad of pay and hangs level, with the campus clock tower in the window and the cat watching from the bookcase.',
  width: 80,
  height: 60,
  base,
  layers: [
    // The tassel hangs from the board's left corner (cap at 25,8; corner at column 0, row 2).
    { sprite: tassel, x: 25, y: 10 },
    { sprite: lightsEven, x: 17, y: 0, motion: { kind: 'twinkle', periodMs: 1600, min: 0.25 } },
    { sprite: lightsOdd, x: 17, y: 0, motion: { kind: 'twinkle', periodMs: 1600, min: 0.25, phase: 0.5 } },
    { sprite: pfSparkle, x: 47, y: 12, motion: { kind: 'twinkle', periodMs: 1800, min: 0.35 } },
    // The cat sits up on the bookcase top (row 13), watching.
    { sprite: pfCatSit, x: 3, y: 2 },
  ],
};

export const pf13Finish = pfKeepsake(
  'pf13-finish',
  'A gold house-shaped key fob with a teal roof on a key ring with a brass key, its window showing a graduation cap with a gold tassel, with small sparkles around it.',
  emblemCap,
);

export const art: LessonArtSet = { opener: pf13Opener, backdrop: pfBackdrop, finish: pf13Finish };
