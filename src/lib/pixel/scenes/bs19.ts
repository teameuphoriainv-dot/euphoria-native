/**
 * Business Strategy lesson 19 opener: the house looks past its own borders.
 *
 * Built on bsStudy, using the bare wall on the right. A great globe in a gold ring stands on its tripod,
 * turning slowly, and three small orchid flags ride round on it: the house's own land and the two
 * markets it has reached since, each a different distance away. The strategist stands at the moonlit
 * window and points across at it, choosing where to go next; a sea chest with a candle on it waits by
 * the bookcase. The globe's blue and green are the brightest surfaces. Moving: the globe turns and the
 * flags travel with their lands, the strategist points and blinks, the candle burns and stars twinkle
 * in the window.
 */
import type { PixelSprite } from '../types';
import { bsBackdrop } from './bs-backdrop';
import { bsCandle, bsStar } from './bs-kit';
import { bsMirrored, bsStrategistStand } from './bs-kit-a';
import { bsStudy } from './bs-kit-b';
import { bsKeepsake } from './bs1-finish';
import type { LessonArtSet, SceneArt } from './types';

/**
 * The world wrapped flat: 36 columns of longitude, 19 rows from pole to pole. The sphere shows 19
 * columns at a time. L is land, F a flag's cloth and | its pin, so a flag rides round with its land.
 */
const LAND = [
  '....................................',
  '.....LLL............LL......LLLL....',
  '....LLLLL..........LLLL...LLLLLLL...',
  '...LLLFFLL.........LLLL..LLLLFFLLL..',
  '...LLL|LL.........LLLLLL.LLLL|LLLL..',
  '....LLLLL.........LLLFFL..LLLLLLL...',
  '.....LLLL.........LLL|L....LLLLL....',
  '......LLL..........LLLLL....LLL.....',
  '......LLLL.........LLLLL.....L......',
  '.......LLLL.........LLLL............',
  '.......LLL..........LLL.......LL....',
  '........LL..........LLL......LLLL...',
  '........LL...........L.......LLLL...',
  '.........L.................LLLLL....',
  '...........................LLL......',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
];

const GLOBE = 23;
const TURN_STEP = 3;
const TURNS = 12;

/**
 * The globe turned `turn` columns: the sphere (lit from the left, ice at the poles, a fixed shine)
 * inside its gold ring, with the axis caps above and below. Computed, because twelve 23x23 frames that
 * differ only by a sliding map are exactly where a hand-typed row would slip.
 */
function globeFrame(turn: number): string[] {
  const rows: string[] = [];
  for (let y = 0; y < GLOBE; y++) {
    let row = '';
    for (let x = 0; x < GLOBE; x++) {
      const d = Math.hypot(x - 11, y - 11);
      const sx = x - 2;
      const sy = y - 2;
      const lit = sx <= 8;
      if (d <= 9.5) {
        const ch = LAND[sy][(sx + turn) % LAND[0].length];
        if ((sx === 5 && sy === 4) || (sx === 4 && sy === 5)) row += 'w';
        else if (ch === 'F') row += 'P';
        else if (ch === '|') row += 'w';
        else if (sy <= 1 || sy >= 17) row += lit ? 'w' : 'x';
        else if (ch === 'L') row += lit ? 'N' : 'n';
        else row += lit ? 'B' : 'b';
      } else if (d <= 10.9) {
        row += x + y <= 21 ? 'G' : 'O';
      } else if (x === 11 && (y === 0 || y === GLOBE - 1)) {
        row += 'O';
      } else {
        row += '.';
      }
    }
    rows.push(row);
  }
  return rows;
}

const globeFrames = Array.from({ length: TURNS }, (_, i) => globeFrame(i * TURN_STEP));

const globe: PixelSprite = {
  id: 'bs19-globe',
  name: 'globe',
  tags: [],
  blurb: 'A great globe in its gold ring, turning, three orchid flags riding round on their lands. The bottom axis cap is at (x + 11, y + 22); bs19 stand goes under it.',
  rows: globeFrames[0],
  frames: globeFrames,
  frameMs: 300,
};

const stand: PixelSprite = {
  id: 'bs19-stand',
  name: 'stand',
  tags: [],
  blurb: "The globe's brass tripod: its post meets the axis cap at (x + 5, y - 1) and its feet are the bottom row.",
  rows: [
    '....GO.....',
    '....GO.....',
    '...OGOO....',
    '....GO.....',
    '....GO.....',
    '....GO.....',
    '....GO.....',
    '...OGOO....',
    '..OO.O.OO..',
    '.OO..O..OO.',
    'OO...O...OO',
  ],
};

const chest: PixelSprite = {
  id: 'bs19-sea-chest',
  name: 'sea-chest',
  tags: [],
  blurb: 'A sea chest bound in iron, ready for the road, standing on its bottom row.',
  rows: [
    '.OOOOOOOOOOOOO.',
    'OgGGGDGGGDGGGgO',
    'OgGGGDGGGDGGGgO',
    'OOOOODOOODOOOOO',
    'OgggGDGyGDGgggO',
    'OgggGDGGGDGgggO',
    'OgggGDGGGDGgggO',
    'OOOOOOOOOOOOOOO',
  ],
};

const strategistRight = bsMirrored(bsStrategistStand, 'bs19-strategist-right');

export const bs19Opener: SceneArt = {
  id: 'bs19-opener',
  label: 'In a tower study a strategist points across at a great turning globe, where small purple flags mark the lands the house has reached.',
  width: 80,
  height: 60,
  base: bsStudy,
  layers: [
    { sprite: bsStar, x: 35, y: 9, motion: { kind: 'twinkle', periodMs: 2200, min: 0.2 } },
    { sprite: bsStar, x: 38, y: 13, motion: { kind: 'twinkle', periodMs: 2800, phase: 0.4, min: 0.2 } },
    { sprite: bsStar, x: 46, y: 19, motion: { kind: 'twinkle', periodMs: 2500, phase: 0.75, min: 0.2 } },
    { sprite: globe, x: 55, y: 13 },
    { sprite: stand, x: 61, y: 36 },
    { sprite: chest, x: 3, y: 47 },
    { sprite: bsCandle, x: 12, y: 39 },
    { sprite: strategistRight, x: 33, y: 20 },
  ],
};

const emblem: PixelSprite = {
  id: 'bs19-emblem-globe',
  name: 'emblem-globe',
  tags: [],
  blurb: 'Lesson 19 emblem, 16x16: a globe on a stand, land and sea, an orchid flag planted at its pole.',
  rows: [
    '.......wPPq.....',
    '.....OOwOOO.....',
    '...OOBNNBbbOO...',
    '..OBBNNNNbbbbO..',
    '..OBNNNNbbbnbO..',
    '.OBBBNNBbbbnnbO.',
    '.OBBBBNbbbbnnbO.',
    '.OBNNBBbbbbbnbO.',
    '.OBNNNBbbnnbbbO.',
    '.OBBNNBbbnnnbbO.',
    '..OBBBbbbbnbbO..',
    '..OBBBbbbbbbbO..',
    '...OObbbbbbOO...',
    '.....OOOOOO.....',
    '......OGGO......',
    '....OOOOOOOO....',
  ],
};

export const bs19Finish: SceneArt = bsKeepsake(
  'bs19-finish',
  'A purple house banner on a gold rod, its roundel showing a globe on a stand with a purple flag planted at its pole.',
  emblem,
);

export const art: LessonArtSet = { opener: bs19Opener, backdrop: bsBackdrop, finish: bs19Finish };
