/**
 * Personal Finance lesson 17, Side Hustles & Multiple Income Streams: more than one way in.
 *
 * The spare room late at night, the moon in the window, the day job's pay envelope pinned on the wall.
 * The figure works at a laptop after hours; beside the desk a camera on a tripod is recording and a
 * stack of parcels waits to ship, so three hustles run at once, and a coin rises from each of them:
 * the lesson's several streams. The cat has taken the one open box. Moving: the three coins, the
 * laptop's logo, the camera's red light, the coffee's steam, the lamp, a star, the cat's z.
 */
import type { PixelSprite } from '../types';
import {
  pfCoin,
  pfCompose,
  pfCat,
  pfCurtain,
  pfKitchen,
  pfLampGlow,
  pfLampPool,
  pfPayEnvelope,
  pfPendantLamp,
  pfSaver,
  pfTable,
  pfZzz,
} from './pf-kit';
import { pfMug, pfSteam, pfWindowNight } from './pf-kit-a';
import { pfMoon, pfStar } from './pf-kit-b';
import { pfKeepsake } from './pf1-finish';
import { pfBackdrop } from './pf-backdrop';
import type { LessonArtSet, SceneArt } from './types';

/** The laptop seen from behind its lid, a teal logo glowing on it; its foot stands on the desk. */
const laptop: PixelSprite = {
  id: 'pf17-laptop',
  name: 'laptop',
  tags: ['scene', 'pf'],
  rows: [
    'XXXXXXXXXXXXXX',
    'XxxxxxxxxxxxxX',
    'XxxxxxxxxxxxxX',
    'XxxxxxttxxxxxX',
    'XxxxxtTTtxxxxX',
    'XxxxxxttxxxxxX',
    'XxxxxxxxxxxxxX',
    'XxxxxxxxxxxxxX',
    'XXXXXXXXXXXXXX',
    'DDDDDDDDDDDDDD',
  ],
};

/** The lid's logo lit, for a twinkle over its teal. */
const logoGlow: PixelSprite = {
  id: 'pf17-logo-glow',
  name: 'logo glow',
  tags: ['scene', 'pf'],
  rows: [
    '.mm.',
    'mWWm',
    '.mm.',
  ],
};

/** A camera facing the room, its lens blue and its record light dim red (column 8, row 3). */
const camera: PixelSprite = {
  id: 'pf17-camera',
  name: 'camera',
  tags: ['scene', 'pf'],
  rows: [
    '..DXXD....',
    'DDDDDDDDDD',
    'DxxxxxxxxD',
    'DxXKKKXxrD',
    'DxKbBbKxxD',
    'DxKBbbKxxD',
    'DxXKKKXxxD',
    'DDDDDDDDDD',
  ],
};

const recLight: PixelSprite = {
  id: 'pf17-rec-light',
  name: 'record light',
  tags: ['scene', 'pf'],
  rows: [
    'R',
  ],
};

/** The tripod under the camera: the head, then three legs splaying to the floor. */
const tripod: PixelSprite = {
  id: 'pf17-tripod',
  name: 'tripod',
  tags: ['scene', 'pf'],
  rows: [
    '.....DX.....',
    '.....DX.....',
    '.....XD.....',
    '.....XD.....',
    '.....XD.....',
    '....XX.X....',
    '....XX.X....',
    '....XX.X....',
    '....XX.X....',
    '....XX.X....',
    '....XX.X....',
    '...X.X..X...',
    '...X.X..X...',
    '...X.X..X...',
    '...X.X..X...',
    '...X.X..X...',
    '..X..X...X..',
    '..X..X...X..',
    '..X..X...X..',
    '..X..X...X..',
    '..X..X...X..',
    '.X...X....X.',
    '.X...X....X.',
    '.X...X....X.',
    '.X...X....X.',
    '.X...X....X.',
    '.X...X....X.',
    'X....X.....X',
    'X....X.....X',
    'X....X.....X',
  ],
};

/** A taped parcel with its shipping label, `w` wide and `h` tall. */
function parcel(id: string, w: number, h: number): PixelSprite {
  const tape = Math.floor(w / 2);
  return {
    id,
    name: id,
    tags: ['scene', 'pf'],
    rows: Array.from({ length: h }, (_, y) =>
      Array.from({ length: w }, (_, x) => {
        if (y === 0 || y === h - 1 || x === 0 || x === w - 1) return 'O';
        if (x === tape) return 'y';
        if (y === 1) return 'G';
        if (x >= 2 && x <= 4 && (y === 3 || y === 4)) return y === 3 ? 'w' : 'x';
        return 'g';
      }).join(''),
    ),
  };
}

/** The open box on the rug: flaps up at the corners, its front face low enough for a cat to show over. */
const openBox: PixelSprite = {
  id: 'pf17-open-box',
  name: 'open box',
  tags: ['scene', 'pf'],
  rows: [
    'Og..............gO',
    'OGg............gGO',
    'OOOOOOOOOOOOOOOOOO',
    'OGGGGGGGGGGGGGGGGO',
    'OggggggggggggggggO',
    'OgggwwxgggggggggOO',
    'OgggggggggggggggOO',
    'OggggggggggggggggO',
    'OOOOOOOOOOOOOOOOOO',
  ],
};

/** A red pin holding the day job's pay envelope to the wall. */
const pin: PixelSprite = {
  id: 'pf17-pin',
  name: 'pin',
  tags: ['scene', 'pf'],
  rows: [
    'R',
    'r',
  ],
};

/**
 * Lesson 17's emblem: the opener's three hustles in little, a camera, a laptop and a parcel, with a
 * gold coin over each, one for every stream.
 */
const emblemSideHustle: PixelSprite = {
  id: 'pf17-emblem-side-hustle',
  name: 'pf17-emblem-side-hustle',
  tags: ['scene', 'pf', 'emblem'],
  rows: [
    '.OO...OO...OO.',
    'OyGO.OyGO.OyGO',
    'OGgO.OGgO.OGgO',
    '.OO...OO...OO.',
    '..............',
    '.XD..XXXX.OOOO',
    'XXXX.XTtX.OyyO',
    'XbBX.XXXX.OgyO',
    'XXXX.xxxx.OOOO',
  ],
};

// Order is depth: the figure behind the desk, the laptop and the mug on it, the parcels and the box on the floor.
const base = pfCompose('pf17-opener-base', 80, 60, pfKitchen.rows, [
  [pfWindowNight, 52, 3],
  [pfCurtain, 51, 2],
  [pfCurtain, 75, 2],
  [pfMoon, 66, 6],
  [pfPendantLamp, 33, 0],
  [pfPayEnvelope, 15, 5],
  [pin, 20, 4],
  [camera, 1, 18],
  [tripod, 0, 26],
  [pfSaver, 29, 12],
  [pfTable(56, 12), 12, 36],
  [pfLampPool, 27, 37],
  [laptop, 30, 28],
  [pfMug, 48, 32],
  [parcel('pf17-parcel-small', 8, 6), 57, 32],
  [parcel('pf17-parcel-top', 11, 8), 67, 39],
  [parcel('pf17-parcel-big', 13, 9), 66, 47],
  [pfCat, 47, 44],
  [openBox, 46, 49],
]);

export const pf17Opener: SceneArt = {
  id: 'pf17-opener',
  label: 'Late at night in a spare room, under a pay envelope pinned to the wall, a person works at a laptop beside a camera recording on a tripod and a stack of parcels ready to ship, a gold coin rising from each one, while the cat sleeps in an open box.',
  width: 80,
  height: 60,
  base,
  layers: [
    // A coin rises from each hustle: the laptop, the camera, the parcels.
    { sprite: pfCoin, x: 44, y: 24, motion: { kind: 'rise', amp: 5, periodMs: 2400 } },
    { sprite: pfCoin, x: 4, y: 13, motion: { kind: 'rise', amp: 5, periodMs: 2400, phase: 0.33 } },
    { sprite: pfCoin, x: 70, y: 33, motion: { kind: 'rise', amp: 5, periodMs: 2400, phase: 0.66 } },
    { sprite: logoGlow, x: 35, y: 31, motion: { kind: 'twinkle', periodMs: 2600, min: 0.3 } },
    { sprite: recLight, x: 9, y: 21, motion: { kind: 'twinkle', periodMs: 1000, min: 0.1 } },
    { sprite: pfSteam, x: 49, y: 26, motion: { kind: 'rise', amp: 3, periodMs: 2400 } },
    { sprite: pfLampGlow, x: 34, y: 9, motion: { kind: 'twinkle', periodMs: 3000, min: 0.55 } },
    { sprite: pfStar, x: 58, y: 7, motion: { kind: 'twinkle', periodMs: 2300, min: 0.2 } },
    { sprite: pfZzz, x: 43, y: 39, motion: { kind: 'rise', amp: 3, periodMs: 2800, phase: 0.3 } },
  ],
};

export const pf17Finish = pfKeepsake(
  'pf17-finish',
  'A gold house-shaped key fob with a teal roof on a key ring with a brass key, its window showing three gold coins over a camera, a laptop and a parcel, one coin for each income stream, with small sparkles around it.',
  emblemSideHustle,
);

export const art: LessonArtSet = { opener: pf17Opener, backdrop: pfBackdrop, finish: pf17Finish };
