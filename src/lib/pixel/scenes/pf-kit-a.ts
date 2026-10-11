/**
 * Personal Finance art kit, batch A (lessons 2 to 9): the pieces more than one of these lessons
 * shares, drawn once beside the pathway kit (pf-kit.ts) and in its manner, lit from the upper left.
 *
 * Two new poses for the pathway's figure (holding something up at the chest, and the reach turned to
 * the viewer's left), the window after dark, the credit card, a mug and its steam, the cat sitting
 * up, and a block for building sets the kitchen does not have (a hall, a desk, a bank counter).
 */
import type { PixelSprite } from '../types';

/** The cast's skin and hair, the same five colours pf-kit.ts gives pfSaver. */
const SKIN: Record<string, string> = {
  M: '#D6A87C',
  C: '#C08552',
  U: '#9A6638',
  j: '#6B3A1F',
  H: '#43291A',
};

/** A solid block of one palette character, for set pieces (a door panel, a counter top, a mat). */
export function pfBlock(id: string, width: number, height: number, ch: string): PixelSprite {
  return {
    id,
    name: id,
    tags: ['scene', 'pf'],
    rows: Array.from({ length: height }, () => ch.repeat(width)),
  };
}

/* ── the figure ───────────────────────────────────────────────────────────────────────────────── */

/**
 * The figure with both forearms raised, hands at the chest: columns 4 and 11, rows 14 and 15. Stamp
 * what it holds after it; a wide thing (a shield, a piggy bank) simply covers the hands.
 */
export const pfSaverHold: PixelSprite = {
  id: 'pf-saver-hold',
  name: 'pf-saver-hold',
  tags: ['scene', 'pf'],
  blurb: 'The figure holding something up in front of its chest with both hands.',
  palette: SKIN,
  rows: [
    '.....HHHHHH.....',
    '....HjjjjjjH....',
    '...HjjjjjjjjH...',
    '..HjjjjjjjjjjH..',
    '..HjjMCCjjjjjH..',
    '..HjCCCCCCCCjH..',
    '..HCCKCCCCKCCH..',
    '..HMCCCCCCCCUH..',
    '...MCCCUUCCCU...',
    '....UCCCCCCU....',
    '......UUUU......',
    '...bBBBBBBBBb...',
    '..bBBBwBBwBBBb..',
    '.bBBBBwBBwBBBBb.',
    '.bBBMCBBBBMCBBb.',
    '.bBbUCbBBbCUbBb.',
    '.bBBbBBBBBBbBBb.',
    '.bBBbbBBBBbbBBb.',
    '..bBBBBBBBBBBb..',
    '...bBBBBBBBBb...',
    '...bBBBBBBBBb...',
    '...bBBBBBBBBb...',
    '...bBBBBBBBBb...',
    '...bBBBBBBBBb...',
    '...bBBBBBBBBb...',
    '...bBBBBBBBBb...',
  ],
};

/**
 * pfSaverReach turned to reach toward the viewer's left, the head still lit from the upper left:
 * the hand's middle is column 1, its foot row 10, so a pfCoinDrop sits at (x, y + 10) under it.
 */
export const pfSaverReachLeft: PixelSprite = {
  id: 'pf-saver-reach-left',
  name: 'pf-saver-reach-left',
  tags: ['scene', 'pf'],
  blurb: 'The figure holding something out to its right, over a jar or a slot on the left.',
  palette: SKIN,
  rows: [
    '.............HHHHHH.....',
    '............HjjjjjjH....',
    '...........HjjjjjjjjH...',
    '..........HjjjjjjjjjjH..',
    '..........HjjMCCjjjjjH..',
    '..........HjCCCCCCCCjH..',
    '..........HCCKCCCCKCCH..',
    '..........HMCCCCCCCCUH..',
    '...........MCCCUUCCCU...',
    'MCM.........UCCCCCCU....',
    'UCUBb.........UUUU......',
    '..bBBBB....bBBBBBBBBb...',
    '....bbBBBBBBBBwBBwBBBb..',
    '......bbbbBBBBwBBwBBBBb.',
    '.........bBBBBBBBBBBBBb.',
    '.........bBBbBBBBBBbBBb.',
    '.........bBBbBBBBBBbBBb.',
    '.........bBBbBBBBBBbBBb.',
    '.........bBBbBBBBBBbBBb.',
    '.........bBBbBBBBBBbBBb.',
    '.........bBBbBBBBBBbBBb.',
    '.........bBBbBBBBBBbBBb.',
    '.........bBBbBBBBBBbBBb.',
    '.........bBBbBBBBBBbBBb.',
    '.........bBBbBBBBBBbBBb.',
    '.........bBBbBBBBBBbBBb.',
  ],
};

/* ── the room after dark ──────────────────────────────────────────────────────────────────────── */

/**
 * pfWindowDusk's frame after sunset: night sky, a deep orchid glow along the roofs, lit windows. No
 * moon or stars of its own, so a lesson adds them, or rain, as layers. Same size, so pfCurtain fits.
 */
export const pfWindowNight: PixelSprite = {
  id: 'pf-window-night',
  name: 'pf-window-night',
  tags: ['scene', 'pf'],
  blurb: 'The sash window at night onto rooftops; glass from column 3 to 22, rows 2 to 17.',
  rows: [
    '.DDDDDDDDDDDDDDDDDDDDDDDD.',
    '.DXXXXXXXXXXXXXXXXXXXXXXD.',
    '.DXKKKKKKKKKKKKKKKKKKKKXD.',
    '.DXKKKKKKKKKKKKKKKKKKKKXD.',
    '.DXKKKKKKKKKKKKKKKKKKKKXD.',
    '.DXKKKKKKKKKKKKKKKKKKKKXD.',
    '.DXXXXXXXXXXXXXXXXXXXXXXD.',
    '.DXKKKKKKKKKKKKKKKKKKKKXD.',
    '.DXKKKKKKKKKKKKKKKKKKKKXD.',
    '.DXkkkkkkkkkkkkkkkkkkkkXD.',
    '.DXkkkkkkkkkkkkkkkkkkkkXD.',
    '.DXEEEEEEEEEEEEEEEEEEEEXD.',
    '.DXEEKEEEEEEEEEEEEEEEEKXD.',
    '.DXEKKKEEEEEEEEEEEEEEEKXD.',
    '.DXKKKKKEKKKKKKKKKKEEKKXD.',
    '.DXKyKKKEKyKKKKyKKKEEKyXD.',
    '.DXKKKKKEKKKKKKKKKKEEKKXD.',
    '.DXKKKKKKKKKKKKKKKKKKKKXD.',
    '.DXXXXXXXXXXXXXXXXXXXXXXD.',
    'DxxxxxxxxxxxxxxxxxxxxxxxxD',
    'DDDDDDDDDDDDDDDDDDDDDDDDDD',
  ],
};

/* ── things on the table ──────────────────────────────────────────────────────────────────────── */

/** A teal credit card face on, gold chip at the upper left, its number along the bottom. */
export const pfCard: PixelSprite = {
  id: 'pf-card',
  name: 'pf-card',
  tags: ['scene', 'pf'],
  blurb: 'A credit card, teal so it never sinks into the blue sweater.',
  rows: [
    '.tttttttt.',
    'tTTTTTTTTt',
    'tTyGTTTTTt',
    'tTGgTTTTTt',
    'tTTTTTTTTt',
    'tTwwTwwTTt',
    '.tttttttt.',
  ],
};

/** An orchid mug, handle to the right. pfSteam rises from its rim (columns 1 to 3). */
export const pfMug: PixelSprite = {
  id: 'pf-mug',
  name: 'pf-mug',
  tags: ['scene', 'pf'],
  rows: [
    'EjjjE..',
    'EqPPEE.',
    'EqPPE.E',
    'EqPPE.E',
    'EqPPEE.',
    '.EEE...',
  ],
};

/** A thin curl of steam for a slow rise over pfMug. */
export const pfSteam: PixelSprite = {
  id: 'pf-steam',
  name: 'pf-steam',
  tags: ['scene', 'pf'],
  rows: [
    '.x.',
    'x..',
    '.x.',
    '..x',
    '.x.',
  ],
};

/* ── the cat, awake ───────────────────────────────────────────────────────────────────────────── */

/**
 * The household cat sitting up, facing left, its tail curling up behind it and flicking. Its paws
 * are the bottom row, so sit it on a floor, a desk or a cushion with that row on the surface.
 */
export const pfCatSit: PixelSprite = {
  id: 'pf-cat-sit',
  name: 'pf-cat-sit',
  tags: ['scene', 'pf'],
  blurb: 'The orange tabby awake and sitting, ears up, tail flicking.',
  rows: [
    '.1...1......',
    '131.131...1.',
    '1333331..131',
    '13N3N31..131',
    '1332331..131',
    '.13331111131',
    '.1334433331.',
    '.1334433331.',
    '.1334433331.',
    '.1441443331.',
    '.1111111111.',
  ],
  frames: [
    [
      '.1...1......',
      '131.131...1.',
      '1333331..131',
      '13N3N31..131',
      '1332331..131',
      '.13331111131',
      '.1334433331.',
      '.1334433331.',
      '.1334433331.',
      '.1441443331.',
      '.1111111111.',
    ],
    [
      '.1...1......',
      '131.131.....',
      '1333331...11',
      '13N3N31..131',
      '1332331..131',
      '.13331111131',
      '.1334433331.',
      '.1334433331.',
      '.1334433331.',
      '.1441443331.',
      '.1111111111.',
    ],
  ],
  frameMs: 900,
};
