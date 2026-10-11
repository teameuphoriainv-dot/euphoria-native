/**
 * Personal Finance art kit, batch B (lessons 10 to 17): the pieces more than one of these lessons
 * shares, or that a later lesson grows from, drawn in the manner of pf-kit.ts and lit from the upper left.
 *
 * The milestone keepsake (lessons 10 and 25 earn 50 XP, and their fob wears a gold roof), a small
 * capital font for the signs the sets hang up, the figure with one arm raised, the night sky, and the
 * tree the pathway's sprout becomes: a sapling in a big pot (lesson 15) and a young tree in the ground
 * (lesson 16), so lesson 23 can grow it on.
 */
import type { PixelSprite } from '../types';
import { pfLater, pfSparkle } from './pf-kit';
import { pfKeepsake } from './pf1-finish';
import type { SceneArt } from './types';

/** The cast's skin and hair, the same five colours pf-kit.ts gives pfSaver. */
const SKIN: Record<string, string> = {
  M: '#D6A87C',
  C: '#C08552',
  U: '#9A6638',
  j: '#6B3A1F',
  H: '#43291A',
};

/* ── the milestone keepsake ───────────────────────────────────────────────────────────────────── */

/** The fob's teal roof turned gold: a white glint down the lit slope, pale gold, a gold shade. */
const GOLD_ROOF: Record<string, string> = { m: 'W', T: 'y', t: 'G' };

const milestoneSparkle = pfLater(pfSparkle, 'pf-keepsake-sparkle-milestone', 1, 380);

/**
 * pfKeepsake for a 50 XP lesson: the same fob, ring and key, the roof recoloured gold, and one more
 * glint by the ring. Only the roof uses m, T and t, so recolouring those leaves the body as it is.
 */
export function pfKeepsakeGold(id: string, label: string, emblem: PixelSprite): SceneArt {
  const art = pfKeepsake(id, label, emblem);
  const [fob, ...rest] = art.layers;
  const goldFob: PixelSprite = {
    ...fob.sprite,
    id: 'pf-keepsake-fob-gold',
    name: 'fob, gold roof',
    rows: fob.sprite.rows.map((row) => row.replace(/[mTt]/g, (ch) => GOLD_ROOF[ch])),
  };
  return {
    ...art,
    layers: [
      { ...fob, sprite: goldFob },
      ...rest,
      { sprite: milestoneSparkle, x: 37, y: 2, motion: { kind: 'twinkle', periodMs: 2300, phase: 0.25, min: 0.4 } },
    ],
  };
}

/* ── lettering ────────────────────────────────────────────────────────────────────────────────── */

/** A 3x5 capital for each character a sign needs, read row by row, 1 for ink. */
const GLYPHS: Record<string, string> = {
  A: '010101111101101',
  B: '110101110101110',
  C: '011100100100011',
  D: '110101101101110',
  E: '111100110100111',
  F: '111100110100100',
  G: '011100101101011',
  H: '101101111101101',
  I: '111010010010111',
  J: '001001001101010',
  K: '101101110101101',
  L: '100100100100111',
  M: '101111111101101',
  N: '110101101101101',
  O: '010101101101010',
  P: '110101110100100',
  Q: '010101101111011',
  R: '110101110101101',
  S: '011100010001110',
  T: '111010010010010',
  U: '101101101101111',
  V: '101101101101010',
  W: '101101111111101',
  X: '101101010101101',
  Y: '101101010010010',
  Z: '111001010100111',
  0: '111101101101111',
  1: '010110010010111',
  2: '110001010100111',
  3: '110001010001110',
  4: '101101111001001',
  5: '111100110001110',
  6: '011100111101111',
  7: '111001010010010',
  8: '111101111101111',
  9: '111101111001110',
  '%': '101001010100101',
  '+': '000010111010000',
  '-': '000000111000000',
  '!': '010010010000010',
  '?': '110001010000010',
  ' ': '000000000000000',
};

/**
 * A word in 3x5 capitals with a one-pixel gap, ink on transparent, for stamping on a sign, a label
 * or a banner. Each letter is 4 columns of the result (the last one 3), so "RENT" is 15 wide.
 */
export function pfText(id: string, text: string, ink: string): PixelSprite {
  const glyphs = [...text].map((ch) => {
    const glyph = GLYPHS[ch];
    if (!glyph) throw new Error(`${id}: no glyph for "${ch}"`);
    return glyph;
  });
  return {
    id,
    name: id,
    tags: ['scene', 'pf'],
    rows: Array.from({ length: 5 }, (_, r) =>
      glyphs.map((g) => [...g.slice(r * 3, r * 3 + 3)].map((bit) => (bit === '1' ? ink : '.')).join('')).join('.'),
    ),
  };
}

/* ── the figure ───────────────────────────────────────────────────────────────────────────────── */

/**
 * The figure with its left arm raised high, holding something up (pf5 drew it first): the hand is
 * columns 17 to 19, rows 2 and 3. Stamp what it holds over the hand, a key, a scroll, a card.
 */
export const pfSaverRaise: PixelSprite = {
  id: 'pf-saver-raise',
  name: 'pf-saver-raise',
  tags: ['scene', 'pf'],
  blurb: 'The figure holding something up high in one hand, a key or a diploma.',
  palette: SKIN,
  rows: [
    '.....HHHHHH.........',
    '....HjjjjjjH........',
    '...HjjjjjjjjH....MCM',
    '..HjjjjjjjjjjH...UCU',
    '..HjjMCCjjjjjH...bBb',
    '..HjCCCCCCCCjH..BBb.',
    '..HCCKCCCCKCCH..BBb.',
    '..HMCCCCCCCCUH.BBb..',
    '...MCCCUUCCCU..BBb..',
    '....UCCCCCCU..BBb...',
    '......UUUU....BBb...',
    '...bBBBBBBBBBBBb....',
    '..bBBBwBBwBBBBb.....',
    '.bBBBBwBBwBBBBb.....',
    '.bBBBBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
    '.bBBbBBBBBBBBBb.....',
  ],
};

/* ── outdoors ─────────────────────────────────────────────────────────────────────────────────── */

/** A new moon's crescent, lit on its left, for a night sky. */
export const pfMoon: PixelSprite = {
  id: 'pf-moon',
  name: 'pf-moon',
  tags: ['scene', 'pf'],
  rows: [
    '.www.',
    'wwx..',
    'ww...',
    'wwx..',
    '.www.',
  ],
};

/** One star, for a twinkle; set it on a dark sky pixel that is not `w`. */
export const pfStar: PixelSprite = {
  id: 'pf-star',
  name: 'pf-star',
  tags: ['scene', 'pf'],
  rows: [
    'w',
  ],
};

/* ── the sprout, grown ────────────────────────────────────────────────────────────────────────── */

/** A big terracotta pot, the sapling's: soil on row 0, the rim on rows 1 and 2. */
export const pfPotLarge: PixelSprite = {
  id: 'pf-pot-large',
  name: 'pf-pot-large',
  tags: ['scene', 'pf'],
  rows: [
    '.kkkkkkkkkk.',
    '144333333321',
    '122222222221',
    '.1443333321.',
    '.1433333321.',
    '.1433333221.',
    '..14333221..',
    '..13332221..',
    '...111111...',
  ],
};

/**
 * Lesson 15: the sprout a few years on, a sapling with a crown and two side shoots over a bare trunk,
 * swaying from its foot. The trunk's foot is columns 6 and 7 of the last row; stand it on pfPotLarge's
 * soil at (pot x - 1, pot y - 15). Below row 9 the soil's left half is clear, for pouring. A LAYER
 * only: its frames are its sway.
 */
const SAPLING_REST = [
  '.....mNNm....',
  '....mNNNNn...',
  '...mNNNNNNn..',
  '...NNNNNNNn..',
  '....nNNnNn...',
  '.mNn..gO.....',
  'mNNNn.gO.mNn.',
  'NNNNnngO.NNNn',
  '.nNNn.gOnNNNn',
  '......gO.nnn.',
  '......gO.....',
  '......gONm...',
  '......gOn....',
  '......gO.....',
  '......gO.....',
  '......gO.....',
];
const SAPLING_RIGHT = [
  '......mNNm...',
  '.....mNNNNn..',
  '....mNNNNNNn.',
  '....NNNNNNNn.',
  '.....nNNnNn..',
  '..mNn..gO....',
  '.mNNNn.gO.mNn',
  '.NNNNnngO.NNN',
  '..nNNn.gOnNNN',
  '.......gO.nnn',
  '.......gO....',
  '......gONm...',
  '......gOn....',
  '......gO.....',
  '......gO.....',
  '......gO.....',
];
const SAPLING_LEFT = [
  '....mNNm.....',
  '...mNNNNn....',
  '..mNNNNNNn...',
  '..NNNNNNNn...',
  '...nNNnNn....',
  'mNn..gO......',
  'NNNn.gO.mNn..',
  'NNNnngO.NNNn.',
  'nNNn.gOnNNNn.',
  '.....gO.nnn..',
  '.....gO......',
  '......gONm...',
  '......gOn....',
  '......gO.....',
  '......gO.....',
  '......gO.....',
];
export const pfSapling: PixelSprite = {
  id: 'pf-sapling',
  name: 'pf-sapling',
  tags: ['scene', 'pf'],
  blurb: 'INVEST, a few years on. The sprout grown into a sapling, swaying.',
  rows: SAPLING_REST,
  frames: [SAPLING_REST, SAPLING_RIGHT, SAPLING_REST, SAPLING_LEFT],
  frameMs: 650,
};

/**
 * Lesson 16: the sapling planted out and grown into a young tree, a lumpy crown lit from the upper
 * left on a straight trunk. Where the trunk meets the crown's underside (columns 10 to 15, rows 14 to
 * 17) a nest can sit. The trunk's foot is the last three rows, flared; stand it on the ground. Still,
 * so stamp it in a base.
 */
export const pfYoungTree: PixelSprite = {
  id: 'pf-young-tree',
  name: 'pf-young-tree',
  tags: ['scene', 'pf'],
  blurb: 'INVEST, grown. The sapling planted out as a young tree.',
  rows: [
    '..........nNNNNn..........',
    '........nNNmmNNNNn........',
    '.......nNmmNNNNNNNn.nnnn..',
    '.......NmmNNNNNNNNNnNNNNn.',
    '...nnnnNmNNNNNNNNNnNmmNNnn',
    '..nNNNNnNNNNNNNNNnNmNNNNNn',
    '.nNmmNNNnNNNNNNnnNNNNNNNnn',
    '.nNmNNNNNnnnnnnNNNNNNNNNnn',
    'nNNNNNNNNNnnnnnNNNNNNNNnnn',
    'nNNNNNNNNNNnnnnnNNNNNNnnnn',
    'nnNNNNNNNNnnNNNnnNNNNnnnn.',
    '.nnNNNNNNnnNmmNNnnnnnnnnn.',
    '.nnnnnnnnnNmNNNNNnnnnnnnn.',
    '..nnnnnnnnNNNNNNNnnnnnnn..',
    '...nnnnnnnnNNNNnnnnnnnn...',
    '.....nnnnnnnnnnnnnnnnn....',
    '.......nnnnnngOnnnnnn.....',
    '..........nnngOnnn........',
    '............gO............',
    '............gO............',
    '............gO............',
    '............gO............',
    '............gO............',
    '............gO............',
    '............gO............',
    '............gO............',
    '............gO............',
    '............gO............',
    '............gO............',
    '............gO............',
    '............gOO...........',
    '...........ggOOO..........',
    '..........OOOOOOO.........',
  ],
};
