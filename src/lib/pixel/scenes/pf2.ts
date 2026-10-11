/**
 * Personal Finance lesson 2, Budgeting Basics: payday split three ways.
 *
 * The kitchen table again, now set for the lesson's 50/30/20 rule: three pay envelopes whose bill
 * stacks stand 5 to 3 to 2 (needs, wants, savings), each with a label the colour of its slice in the
 * pie chart pinned above them. The figure pays itself first, slipping a bill into the savings
 * envelope. The window moves to the right of the wall and is cropped by the frame. Moving: the bill,
 * the lamp's glow, chimney smoke and a bird outside, the cat's z.
 */
import type { PixelSprite } from '../types';
import {
  pfBird,
  pfCat,
  pfCompose,
  pfCurtain,
  pfKitchen,
  pfLampGlow,
  pfLampPool,
  pfPendantLamp,
  pfSaverReach,
  pfSmoke,
  pfTable,
  pfWallet,
  pfWindowDusk,
  pfZzz,
} from './pf-kit';
import { pfKeepsake } from './pf1-finish';
import { pfBackdrop } from './pf-backdrop';
import type { LessonArtSet, SceneArt } from './types';

/** The pie chart on the wall: needs half (orchid), wants 30 (pink), savings 20 (gold). */
const piePoster: PixelSprite = {
  id: 'pf2-pie-poster',
  name: 'pie poster',
  tags: ['scene', 'pf'],
  rows: [
    '.......R.......',
    'xxxxxxxrxxxxxxx',
    'xwwwwwwwwwwwwwX',
    'xwwwwwpffwwwwwX',
    'xwwwppPFFffwwwX',
    'xwwpPPPFFFFfwwX',
    'xwwpPPPFFFFfwwX',
    'xwpPPPPFFFFFfwX',
    'xwpPPPPPFFFFfwX',
    'xwpPPPPPGGGFfwX',
    'xwwpPPPPGGGgwwX',
    'xwwpPPPPGGGgwwX',
    'xwwwppPPGggwwwX',
    'xwwwwwppgwwwwwX',
    'xwwwwwwwwwwwwwX',
    'xXXXXXXXXXXXXXX',
  ],
};

/** A pay envelope with `bills` rows of bills standing out of it and a label in its slice's colour. */
function envelope(id: string, bills: number, label: string): PixelSprite {
  const wad = ['nNmmNNNNn', 'nNNNNNNNn', 'nnnnnnnnn'];
  return {
    id,
    name: id,
    tags: ['scene', 'pf'],
    rows: [
      '..nnnnnnn..',
      ...Array.from({ length: bills - 1 }, (_, i) => `.${wad[i % 3]}.`),
      'DxwwwwwwwxD',
      'DwxwwwwwxwD',
      'DwwxwwwxwwD',
      'DwwwxwxwwwD',
      'DwwwwxwwwwD',
      `Dww${label.repeat(5)}wwD`,
      `Dww${label.repeat(5)}wwD`,
      'DDDDDDDDDDD',
    ],
  };
}

/** A bill let go into the envelope below: held, slipping in row by row, a glint, then a new bill. */
const billDrop: PixelSprite = {
  id: 'pf2-bill-drop',
  name: 'bill drop',
  tags: ['scene', 'pf'],
  rows: ['nnnnn', 'nNmNn', 'nnnnn', '.....'],
  frames: [
    ['nnnnn', 'nNmNn', 'nnnnn', '.....'],
    ['nnnnn', 'nNmNn', 'nnnnn', '.....'],
    ['nnnnn', 'nNmNn', 'nnnnn', '.....'],
    ['.....', 'nnnnn', 'nNmNn', 'nnnnn'],
    ['.....', '.....', 'nnnnn', 'nNmNn'],
    ['.....', '.....', '.....', 'nnnnn'],
    ['.....', '.....', '..y..', '.yWy.'],
    ['.....', '.....', '.....', '..w..'],
    ['.....', '.....', '.....', '.....'],
    ['.....', '.....', '.....', '.....'],
  ],
  frameMs: 170,
};

/** Lesson 2's emblem: the 50/30/20 pie, each slice edged in its own deep tone. */
const emblemBudget: PixelSprite = {
  id: 'pf2-emblem-budget',
  name: 'pf2-emblem-budget',
  tags: ['scene', 'pf', 'emblem'],
  rows: [
    '...Eff...',
    '.EEPFFff.',
    '.EPPFFFf.',
    'EPPPFFFFf',
    'EPPPPFFFf',
    'EPPPPGGGf',
    '.EPPPGGg.',
    '.EEPPGgg.',
    '...EEg...',
  ],
};

// Order is depth: the figure stands behind the table; the envelopes stand on its top (row 37).
const base = pfCompose('pf2-opener-base', 80, 60, pfKitchen.rows, [
  [pfWindowDusk, 58, 3],
  [pfCurtain, 57, 2],
  [piePoster, 39, 3],
  [pfPendantLamp, 26, 0],
  [pfSaverReach, 6, 12],
  [pfTable(72, 12), 4, 36],
  [pfLampPool, 20, 37],
  [envelope('pf2-envelope-savings', 4, 'G'), 23, 26],
  [envelope('pf2-envelope-needs', 10, 'P'), 37, 20],
  [envelope('pf2-envelope-wants', 6, 'F'), 51, 24],
  [pfWallet, 65, 30],
  [pfCat, 44, 50],
]);

export const pf2Opener: SceneArt = {
  id: 'pf2-opener',
  label: 'At a kitchen table at sunset, a person slips a bill into a savings envelope beside fuller envelopes for needs and wants, under a pie chart split fifty, thirty and twenty.',
  width: 80,
  height: 60,
  base,
  layers: [
    // The bill hangs from the reaching hand (figure at 6,12; hand at column 22, row 10) and its foot
    // meets the top of the savings stack (envelope at 23,26).
    { sprite: billDrop, x: 26, y: 22 },
    { sprite: pfLampGlow, x: 27, y: 9, motion: { kind: 'twinkle', periodMs: 3000, min: 0.55 } },
    { sprite: pfSmoke, x: 62, y: 9, motion: { kind: 'rise', amp: 2, periodMs: 2600 } },
    { sprite: pfBird, x: 67, y: 13, motion: { kind: 'drift', amp: 2, periodMs: 5200 } },
    { sprite: pfZzz, x: 43, y: 45, motion: { kind: 'rise', amp: 3, periodMs: 2800, phase: 0.3 } },
  ],
};

export const pf2Finish = pfKeepsake(
  'pf2-finish',
  'A gold house-shaped key fob with a teal roof on a key ring with a brass key, its window showing a pie chart split into needs, wants and savings, with small sparkles around it.',
  emblemBudget,
);

export const art: LessonArtSet = { opener: pf2Opener, backdrop: pfBackdrop, finish: pf2Finish };
