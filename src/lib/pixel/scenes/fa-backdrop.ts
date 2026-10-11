/**
 * fa-backdrop: the data works at night. The Financial Analytics pathway's skyline, drawn to sit
 * along the bottom of every lesson screen behind the content, and the outside of the plant whose
 * machine room the openers show. Left to right, the pipeline at the scale of a city block: a dish
 * that collects, grain silos that store, a hopper tower filling a rail car, a sawtooth-roofed hall
 * where the processing happens, a round tank, and a billboard where a chart draws itself.
 *
 * Navy steel (fa-kit FA_STEEL) instead of the quant skyline's purple ink, lit from the left like
 * the kit: e lit edges, a bodies, c shadow sides. Round silhouettes against the quant's boxes, so
 * the two pathways never read as the same city. The bottom third carries the most (it is what
 * shows under a footer button): the floor pipe with data pulsing through it, the silo doors, the
 * hall's lit windows and door. Everything stays under luminance 0.15.
 */
import { faDrawnChart, faFalling, faPacketRun, FA_STEEL } from './fa-kit';
import type { PixelSprite } from '../types';
import type { SceneArt } from './types';

const base: PixelSprite = {
  id: 'fa-backdrop-base',
  name: 'data works at night',
  tags: [],
  palette: FA_STEEL,
  rows: [
    '................................................................................................................',
    '................................................................................................................',
    '................................................................................................................',
    '................................................................................................................',
    '................................................................................................................',
    '......................................................................eeeee.....................................',
    '...........................eeeee.......................................eac......................................',
    '.......e....ec............eaaaaac......................................eac......................................',
    '........e..eaa...........eaaaaaacc.....................................eac......................................',
    '..........eaaac..........eaaaaaacc..........eeeee......................eac......................................',
    '.........eaaaac..........eaaaaaacc........eaaaaaaac....................eec......................................',
    '........eaaaac...........eaacaaacceeeeeeeeaaaaaaaccc...................eac......................................',
    '.......eaaaacc...........eaaccaaccccccccceaaaaaaaccc...................eac......................................',
    '.......caaacc.......eee..eaacaaacc.......eaaaaaaaccc...................eac......................................',
    '.........ccec.....eeaaacceeecceecc.......eaaaaaaaccc...................eac......................................',
    '...........ec.....eaaaacceaacaaacc.......eaaaaaaaccc...................eac......................................',
    '...........ec.....eaaaacceaaccaacc........eaaaaaacc....................eec..........eee.............eee.........',
    '...........ec.....eaaaacceaacaaacc.eeec...eeaaaaccc.......E.....E.....Eeac..E.......eee.......eeeeeeeeeeeeeee...',
    '...........ec.....eaaaacceaaccaacceaaacc..e.eaacc.c......eE....eE....eEeac.eE.....eeaaaee.....eKKKKKKKKKKKKKc...',
    '...........ec.....eaaaacceeeceeecceaaacc..e..ecc..c.....eaE...eaE...eaEeaceaE....eaaaaaaae....eKKKKKKKKKKKKKc...',
    '..........eeee....eeeeecceaaccaacceaaacc..e...c...c....eaaE..eaaE..eaaEeacaaE...eaaaaaaaacc...eKKKKKKKKKKKKKc...',
    '...........ec.....eaaaacceaacaaacceaaacc..e...e...c...eaaaE.eaaaE.eaaaEeacaaE..eaaaaaaaaaccc..eKKKKKKKKKKKKKc...',
    '...........ec.....eaaaacceaaccaacceaaacc..e...e...c..eaaaaEeaaaaEeaaaaEeacaaE..eaaaaaaaaaccc..eKKKKKKKKKKKKKc...',
    '...........ec.....eaaaacceaacaaacceeeecc..ecccccccc..eaaaaaaaaaaaaaaaaaaaaacc..eeeeeeeeeaccc..eKKKKKKKKKKKKKc...',
    '...........ec.....eaaaacceeecceecceaaacc..e.......c..eaaaaaaaaaaaaaaaaaaaaacc..eaaaaaaaaaccc..eKKKKKKKKKKKKKc...',
    '..........eeee....eeeeecceaacaaacceaaacc..e.......c..eaaaaaaaaaaaaaaaaaaaaacc..eaaaaaaaaaccc..eKKKKKKKKKKKKKceee',
    '...........ec.....eaaaacceaaccaacceaaacc..e.......c..eaKKaaKKaaaaaaaKKaaKKacc..eaaaaaaaaaccc..eKKKKKKKKKKKKKcaac',
    '...........ec.....eaaaacceaacaaacceaaacc..ecccccccc..eaKKaaKKaaaaaaaKKaaKKacc...eaaaaaaaacc...eKKKKKKKKKKKKKcaac',
    '...........ec.....eaaaacceaaccaacceeeecc..e.......c..eaKKaaKKaaaaaaaKKaaKKacc...eaaaaaaaacc...cccccccccccccccaac',
    'eeeeeeeeeeeeeeee..eaaaacceeeceeecceaaacc..e.......c..eaKKaaKKeeeeeeaKKaaKKacc...e.aaaaacc.c.......e.....c...eaac',
    'eaaaaaceaaaaaaac..eeeeecceaaccaacceaaacc..eeeeeeeec..eaaaaaaaeKKKKcaaaaaaaacc...e..eaacc..c.......e.....c...eaac',
    'eaaaaaceaKKaaaac..eaaaacceaaKKKacceaaacc..eeaaaaacc..eaaaaaaaeKKKKcaaaaaaaacc...e..e...c..c.......e.....c...eaac',
    'eaaaaaceaKKaaaac..eaKKacceaaKKKacceaaacc..eeaaaaacc..eaaaaaaaeKKKKcaaaaaaaacc...e..e...c..c.......e.....c...eaac',
    'eaaaaaceaaaaaaac..eaKKacceaaKKKacceeeecc..eeaaaaacc..eaaaaaaaeKKKKcaaaaaaaacc...ecccccccccc.......e.....c...eaac',
    'eaaaaaceaaaaaaac..eaKKacceeeKKKecceaaacc..eeaaaaacc..eaaaaaaaeKKKKcaaaaaaaacc...e..e...c..c.......e.....c...eaac',
    'eaaecaceaaaaaaac..eecaacceaaaaaacceecacc..e.......ceceaaaaaaaeKKKKcecaaaaaacc...e..ec..c..c.......eec...c...eaac',
    'eeeeceeeeeeeeeeeeeeeceeeeeeeeeeeeeeeceeeeeeeeeeeeeeeceeeeeeeeeeeeeeeceeeeeeeeeeeeeeeceeeeeeeeeeeeeeeceeeeeeeeeee',
    'KKKecKKKKKKKKKKKKKKecKKKKKKKKKKKKKKecKKKKKKKKKKKKKKecKKKKKKKKKKKKKKecKKKKKKKKKKKKKKecKKKKKKKKKKKKKKecKKKKKKKKKKK',
    'cccecccccccccccccccecccccccccccccccecccccccccccccccecccccccccccccccecccccccccccccccecccccccccccccccecccccccccccc',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKccKKKKKccKKKKKccKKKKKccKKKKKccKKKKKccKKKKKccKKKKKccKKKKKccKKKKKccKKKKKccKKKKKccKKKKKccKKKKKccKKKKKccKKKKKccKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
  ],
};
const Lwin_hall_a: PixelSprite = {
  id: 'fa-win-hall-a',
  name: 'fa-win-hall-a',
  tags: [],
  rows: [
    'OO',
    'OO',
    'OO',
    'OO',
  ],
};
const Lwin_hall_b: PixelSprite = {
  id: 'fa-win-hall-b',
  name: 'fa-win-hall-b',
  tags: [],
  rows: [
    'tt',
    'tt',
    'tt',
    'tt',
  ],
};
const Lwin_slit_o: PixelSprite = {
  id: 'fa-win-slit-o',
  name: 'fa-win-slit-o',
  tags: [],
  rows: [
    'O',
    'O',
  ],
};
const Lwin_slit_t: PixelSprite = {
  id: 'fa-win-slit-t',
  name: 'fa-win-slit-t',
  tags: [],
  rows: [
    't',
    't',
  ],
};
const Lwin_hut: PixelSprite = {
  id: 'fa-win-hut',
  name: 'fa-win-hut',
  tags: [],
  rows: [
    'bb',
    'bb',
  ],
};
const Lbeacon_silo: PixelSprite = {
  id: 'fa-beacon-silo',
  name: 'fa-beacon-silo',
  tags: [],
  rows: [
    'n',
  ],
  frameMs: 1600,
  frames: [
    [
      'n',
    ],
    [
      'K',
    ],
  ],
};
const Lbeacon_stack: PixelSprite = {
  id: 'fa-beacon-stack',
  name: 'fa-beacon-stack',
  tags: [],
  rows: [
    'r',
  ],
  frameMs: 1600,
  frames: [
    [
      'K',
    ],
    [
      'r',
    ],
  ],
};
const Lfeed: PixelSprite = {
  id: 'fa-dish-feed',
  name: 'fa-dish-feed',
  tags: [],
  rows: [
    't',
  ],
};
const Lstar: PixelSprite = {
  id: 'fa-star',
  name: 'fa-star',
  tags: [],
  palette: FA_STEEL,
  rows: [
    'e',
  ],
};
const Lpuff: PixelSprite = {
  id: 'fa-puff',
  name: 'fa-puff',
  tags: [],
  palette: FA_STEEL,
  rows: [
    '.e.',
    'ece',
  ],
};
/** Data pulsing along the floor pipe, the backdrop's long beat: two runs blue, two teal. */
const Lpackets_a = faPacketRun('fa-pipe-a', 24, [[Infinity, 'b']], 8, 260);
const Lpackets_b = faPacketRun('fa-pipe-b', 24, [[Infinity, 't']], 8, 260);
/** Grains of data dropping from the hopper's spout into the rail car. */
const Lgrains = faFalling('fa-grains', 1, 7, [[0, 0, 'b'], [0, 3, 'b'], [0, 5, 't']], 240);
/** The billboard's chart drawing itself, then clearing: bars only ever rise. */
const Lchart = faDrawnChart('fa-billboard-chart', [
  '.........nn',
  '.........nn',
  '...tt....nn',
  '...tt.bb.nn',
  'bb.tt.bb.nn',
  'bb.tt.bb.nn',
  'bb.tt.bb.nn',
  'bb.tt.bb.nn',
], [[0, 1], [3, 4], [6, 7], [9, 10]], [
  [1, 1, 1, 1],
  [2, 2, 1, 1],
  [4, 3, 2, 1],
  [4, 6, 3, 2],
  [4, 6, 5, 4],
  [4, 6, 5, 8],
  [4, 6, 5, 8],
  [4, 6, 5, 8],
  [4, 6, 5, 8],
  [0, 0, 0, 0],
], 520);
export const faBackdrop: SceneArt = {
  id: 'fa-backdrop',
  label: 'A dark data plant at night with grain silos, a satellite dish, a sawtooth roofed hall and a round tank, and data pulsing along a pipe on the ground.',
  width: 112,
  height: 44,
  base,
  layers: [
    { sprite: Lwin_hall_a, x: 55, y: 26, motion: { kind: 'twinkle', periodMs: 6200, min: 0.35, phase: 0.1 } },
    { sprite: Lwin_hall_b, x: 68, y: 26, motion: { kind: 'twinkle', periodMs: 7000, min: 0.35, phase: 0.6 } },
    { sprite: Lwin_hall_a, x: 72, y: 26, motion: { kind: 'twinkle', periodMs: 7600, min: 0.3, phase: 0.35 } },
    { sprite: Lwin_slit_o, x: 21, y: 22, motion: { kind: 'twinkle', periodMs: 6600, min: 0.35, phase: 0.8 } },
    { sprite: Lwin_slit_o, x: 30, y: 21, motion: { kind: 'twinkle', periodMs: 5800, min: 0.35, phase: 0.45 } },
    { sprite: Lwin_slit_t, x: 36, y: 25, motion: { kind: 'twinkle', periodMs: 7200, min: 0.35, phase: 0.2 } },
    { sprite: Lwin_hut, x: 9, y: 31, motion: { kind: 'twinkle', periodMs: 6900, min: 0.4, phase: 0.65 } },
    { sprite: Lbeacon_silo, x: 29, y: 5 },
    { sprite: Lbeacon_stack, x: 72, y: 4 },
    { sprite: Lfeed, x: 6, y: 6, motion: { kind: 'twinkle', periodMs: 2400, min: 0.2 } },
    { sprite: Lstar, x: 17, y: 3, motion: { kind: 'twinkle', periodMs: 5200, min: 0.3, phase: 0.2 } },
    { sprite: Lstar, x: 61, y: 6, motion: { kind: 'twinkle', periodMs: 6100, min: 0.3, phase: 0.7 } },
    { sprite: Lstar, x: 99, y: 4, motion: { kind: 'twinkle', periodMs: 4700, min: 0.3, phase: 0.4 } },
    { sprite: Lpuff, x: 71, y: 2, motion: { kind: 'rise', amp: 3, periodMs: 5200, phase: 0.0 } },
    { sprite: Lpuff, x: 72, y: 1, motion: { kind: 'rise', amp: 2, periodMs: 6400, phase: 0.5 } },
    { sprite: Lgrains, x: 46, y: 23 },
    { sprite: Lchart, x: 96, y: 19 },
    { sprite: Lpackets_a, x: 5, y: 37 },
    { sprite: Lpackets_b, x: 33, y: 37 },
    { sprite: Lpackets_a, x: 61, y: 37 },
    { sprite: Lpackets_b, x: 87, y: 37 },
  ],
};
