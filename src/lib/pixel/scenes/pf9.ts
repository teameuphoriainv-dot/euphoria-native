/**
 * Personal Finance lesson 9, Smart Saving & Banking: put the savings where they are safe and earn.
 *
 * A new set, inside the little bank from the backdrop's street: dressed stone, a marble counter with
 * a brass deposit tray, a round vault door behind (where the lesson's insured deposits sit), and a
 * board showing the rate as a percent sign over three bars that grow from year 1 to year 10. The
 * figure brings the piggy bank in and tips its coins into the tray. Moving: the vault's wheel, the
 * coin, the lamp, a glint on the vault, the arrow over the bars.
 */
import type { PixelSprite } from '../types';
import { pfCoinDrop, pfCompose, pfLampGlow, pfPiggyBank, pfSparkle } from './pf-kit';
import { pfSaverHold } from './pf-kit-a';
import { pfKeepsake } from './pf1-finish';
import { pfBackdrop } from './pf-backdrop';
import type { LessonArtSet, SceneArt } from './types';

/** The bank's hall: dressed stone in staggered courses above the counter, a checked floor below. */
function bankHall(): string[] {
  return Array.from({ length: 60 }, (_, y) =>
    Array.from({ length: 80 }, (_, x) => {
      if (y >= 50) return (Math.floor(x / 8) + Math.floor((y - 50) / 5)) % 2 ? 'D' : 'k';
      if (y % 6 === 5) return 'K';
      return (x + (Math.floor(y / 6) % 2 ? 8 : 0)) % 16 === 15 ? 'K' : 'k';
    }).join(''),
  );
}

/** The counter across the hall: a marble top, a brass rail, raised panels, a kick plate. */
const COUNTER_PANEL = ['XDDDDDDDDDDDDDDX', 'XDXXXXXXXXXXXXDX', 'XDDDDDDDDDDDDDDX'];
const counter: PixelSprite = {
  id: 'pf9-counter',
  name: 'counter',
  tags: ['scene', 'pf'],
  rows: [
    'w'.repeat(80),
    'x'.repeat(80),
    'G'.repeat(80),
    'g'.repeat(80),
    COUNTER_PANEL[0].repeat(5),
    ...Array.from({ length: 5 }, () => COUNTER_PANEL[1].repeat(5)),
    COUNTER_PANEL[2].repeat(5),
    'X'.repeat(80),
    'D'.repeat(80),
    'K'.repeat(80),
  ],
};

/** The brass deposit tray set in the counter top, its slot on the second row. */
const tray: PixelSprite = {
  id: 'pf9-tray',
  name: 'tray',
  tags: ['scene', 'pf'],
  rows: [
    'OGGGGGGO',
    'OgKKKKgO',
  ],
};

/** The vault door in its steel frame, bolts on the rim, hinges on the left; its wheel is a layer. */
const vault: PixelSprite = {
  id: 'pf9-vault',
  name: 'vault',
  tags: ['scene', 'pf'],
  rows: [
    'DDDDDDDDDDDDDDDDDDDDDDDDD',
    'DXXXXXXXXXXXXXXXXXXXXXXXD',
    'DXKKKKKKKKDDDDDKKKKKKKKKD',
    'DXKKKKKDDDxxxxxDDDKKKKKKD',
    'DXKKKKDDxxxxyxxxXDDKKKKKD',
    'DXKKKDxxxxDDDDDXXXXDKKKKD',
    'DOGODxyxDDDwxxDDDXyXDKKKD',
    'DOGODxxDDwwxxxxxDDXXDDKKD',
    'DXKDxxDDwwxxxxxxxDDXXDKKD',
    'DXKDxxDwwxxxxxxxxxDXXDKKD',
    'DXDxxDDwxxxxxxxxxxDDXXDKD',
    'DXDxxDwxxxxxxxxxxxxDXXDKD',
    'DXDxyDxxxxxxxxxxxxxDyXDKD',
    'DXDxxDxxxxxxxxxxxxxDXXDKD',
    'DXDxxDDxxxxxxxxxxxDDXXDKD',
    'DXKDxXDxxxxxxxxxxxDXXDKKD',
    'DXKDXXDDxxxxxxxxxDDXXDKKD',
    'DOGODXXDDxxxxxxxDDXXDDKKD',
    'DOGODXyXDDDxxxDDDXyXDKKKD',
    'DXKKKDXXXXDDDDDXXXXDKKKKD',
    'DXKKKKDDXXXXyXXXXDDKKKKKD',
    'DXKKKKKDDDXXXXXDDDKKKKKKD',
    'DXKKKKKKKKDDDDDKKKKKKKKKD',
    'DXKKKKKKKKKKKKKKKKKKKKKKD',
    'DDDDDDDDDDDDDDDDDDDDDDDDD',
  ],
};

/** The vault's wheel turning an eighth at a time: spokes square, then diagonal. */
const vaultWheel: PixelSprite = {
  id: 'pf9-vault-wheel',
  name: 'vault wheel',
  tags: ['scene', 'pf'],
  rows: [
    '....y....',
    '....G....',
    '....G....',
    '...OOO...',
    'yGGOyOGGy',
    '...OOO...',
    '....G....',
    '....G....',
    '....y....',
  ],
  frames: [
    [
      '....y....',
      '....G....',
      '....G....',
      '...OOO...',
      'yGGOyOGGy',
      '...OOO...',
      '....G....',
      '....G....',
      '....y....',
    ],
    [
      'y.......y',
      '.G.....G.',
      '..G...G..',
      '...OOO...',
      '...OyO...',
      '...OOO...',
      '..G...G..',
      '.G.....G.',
      'y.......y',
    ],
  ],
  frameMs: 700,
};

/** The rate board: a percent sign over three bars, year 1, 5 and 10, the last under a rising arrow. */
const rateBoard: PixelSprite = {
  id: 'pf9-rate-board',
  name: 'rate board',
  tags: ['scene', 'pf'],
  rows: [
    'OOOOOOOOOOOOOOOOOOOOO',
    'OgggggggggggggggggggO',
    'OgKKKKKKKKKKKKKKKKKgO',
    'OgKyyKKKyKKKKKKKmmKgO',
    'OgKyyKKyKKKKKKKmmmmgO',
    'OgKKKKyKKKKKKKKKKKKgO',
    'OgKKKyKKKKKKKKKKNnKgO',
    'OgKKyKKyyKKKKKKKNnKgO',
    'OgKyKKKyyKKKKKKKNnKgO',
    'OgKKKKKKKKKKKNnKNnKgO',
    'OgKKKKKKKKKKKNnKNnKgO',
    'OgKKKKKKKKNnKNnKNnKgO',
    'OgKKKKKKKKNnKNnKNnKgO',
    'OgKKKKKKKKNnKNnKNnKgO',
    'OgKKKKKKKKNnKNnKNnKgO',
    'OgKKKKKKKxxxxxxxxxxgO',
    'OgggggggggggggggggggO',
    'OOOOOOOOOOOOOOOOOOOOO',
  ],
};

/** The arrow over the tallest bar, brightening, for a twinkle. */
const arrowGlow: PixelSprite = {
  id: 'pf9-arrow-glow',
  name: 'arrow glow',
  tags: ['scene', 'pf'],
  rows: [
    '.WW.',
    'WWWW',
  ],
};

/** A milk-glass globe on a chain, the bank's lamp. */
const globeLamp: PixelSprite = {
  id: 'pf9-globe-lamp',
  name: 'globe lamp',
  tags: ['scene', 'pf'],
  rows: [
    '...X...',
    '...X...',
    '...X...',
    '..DOD..',
    '.wwwww.',
    'wWwwwwx',
    'wwwwwwx',
    '.xxxxx.',
  ],
};

/** Lesson 9's emblem: the vault door, its gold wheel square in the middle. */
const emblemBanking: PixelSprite = {
  id: 'pf9-emblem-banking',
  name: 'pf9-emblem-banking',
  tags: ['scene', 'pf', 'emblem'],
  rows: [
    '....XXXXX....',
    '..XXwxxxxXX..',
    '.XwxxxGxxxxX.',
    'OXxxxxGxxxxXO',
    'OXxGGGyGGGxXO',
    'OXxxxxGxxxxXO',
    '.XxxxxGxxxxX.',
    '..XXxxxxxXX..',
    '....XXXXX....',
  ],
};

// Order is depth: vault and board on the wall, the figure behind the counter holding the piggy up.
const base = pfCompose('pf9-opener-base', 80, 60, bankHall(), [
  [vault, 3, 4],
  [rateBoard, 56, 5],
  [globeLamp, 35, 0],
  [pfSaverHold, 31, 12],
  [pfPiggyBank, 32, 24],
  [counter, 0, 36],
  [tray, 34, 36],
]);

export const pf9Opener: SceneArt = {
  id: 'pf9-opener',
  label: 'Inside the bank, a person holds a piggy bank over the counter and a coin drops into the deposit tray, in front of a round vault door and a board showing a percent sign over bars that grow.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: vaultWheel, x: 11, y: 12 },
    // The coin leaves the piggy's belly (piggy at 32,24) and its foot meets the tray's slot (row 37).
    { sprite: pfCoinDrop, x: 37, y: 30 },
    { sprite: pfLampGlow, x: 35, y: 8, motion: { kind: 'twinkle', periodMs: 3000, min: 0.55 } },
    { sprite: pfSparkle, x: 7, y: 6, motion: { kind: 'twinkle', periodMs: 2100, min: 0.4 } },
    { sprite: arrowGlow, x: 71, y: 8, motion: { kind: 'twinkle', periodMs: 1800, min: 0.2 } },
  ],
};

export const pf9Finish = pfKeepsake(
  'pf9-finish',
  'A gold house-shaped key fob with a teal roof on a key ring with a brass key, its window showing a round vault door with a gold wheel, with small sparkles around it.',
  emblemBanking,
);

export const art: LessonArtSet = { opener: pf9Opener, backdrop: pfBackdrop, finish: pf9Finish };
