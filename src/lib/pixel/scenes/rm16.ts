/**
 * Risk Management lesson 16 opener, Cyber Risk & Technology Threats: the strongroom on a still,
 * moonlit night, which is how this kind of attack comes. Past the moon, through the barred window,
 * slides a ship under a skull flag; on the radio set the screen already shows the skull, the ransom
 * note of the harbour. The keeper holds his lantern up to the window, and behind him the strongroom
 * door is chained across and shut with a great padlock: the defence is done before the raid. Moving:
 * the skull flag, the flickering screen, the lantern, the swell, the stars, a glint on the padlock.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import { RM_PALETTE, rmCompose, rmKeepsake, rmLantern, rmWatchRoom } from './rm-kit';
import { rmGlint, rmKeeperLift, rmMark, rmPlot, rmPortSwell, rmStar } from './rm-kit-a';
import type { RmPoint } from './rm-kit-a';
import { rmFill } from './rm-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/** The full moon. 9x9. */
const MOON = ['..yyyyy..', '.yyywwyy.', 'yyywwwyyy', 'yyyywyyyy', 'yyyyyyyyy', 'yyyyyyygy', 'yygyyyyyy', '.yyyyyyy.', '..yyyyy..'];

/** The pirate ship in silhouette, masts and sails black against the moon. 13x9. */
const SHIP = [
  '....K....K...',
  '...KKK...K...',
  '..KKKKK.KKK..',
  '..KKKKK.KKK..',
  '.KKKKKKKKKKK.',
  '....K....K...',
  'KKKKKKKKKKKKK',
  '.KKKKKKKKKKK.',
  '..KKKKKKKKK..',
];

/** `art` written into `points` with its top-left at (x, y); dots stay out. */
function paint(art: readonly string[], x: number, y: number): RmPoint[] {
  return art.flatMap((row, dy) => [...row].flatMap((ch, dx) => (ch === '.' ? [] : [[x + dx, y + dy, ch] as const])));
}

/**
 * The window: a calm night sky with the moon low over it, the pirate ship crossing in front of the
 * moon, the moon's road on the water, a sill below. The bars are their own layer, over everything
 * that moves in here. 24x27.
 */
const nightWindow: PixelSprite = {
  id: 'rm16-opener-window',
  name: 'moonlit window',
  tags: ['scene', 'rm16'],
  palette: RM_PALETTE,
  rows: rmMark(
    rmFill(
      Array.from({ length: 27 }, (_, y) => {
        if (y === 0 || y === 24) return 'D'.repeat(24);
        if (y === 25) return 'x'.repeat(24);
        if (y === 26) return 'D'.repeat(24);
        const fill = y < 15 ? 'v' : y === 15 ? 'u' : y < 19 ? 'V' : 'v';
        return `D${fill.repeat(22)}D`;
      }),
      [[1, 4, 14, 'k'], [1, 2, 13, 'k'], [17, 22, 14, 'k'], [12, 16, 17, 'y'], [11, 17, 19, 'G'], [13, 15, 21, 'y'], [12, 16, 23, 'G'], [3, 7, 20, 'u'], [18, 21, 22, 'u']],
    ),
    [...paint(MOON, 10, 3), ...paint(SHIP, 5, 8), [9, 3, 'K'], [9, 4, 'K'], [9, 5, 'K'], [9, 6, 'K'], [9, 7, 'K'], [3, 3, 'w'], [19, 2, 'w'], [2, 9, 'w']],
  ),
};

/** The window's iron bars, either side of the flag and across the water, over everything moving in here. 22x23. */
const bars: PixelSprite = {
  id: 'rm16-opener-bars',
  name: 'bars',
  tags: ['scene', 'rm16'],
  rows: Array.from({ length: 23 }, (_, y) =>
    Array.from({ length: 22 }, (_, x) => (x === 6 || x === 16 ? 'X' : x === 7 || x === 17 ? 'D' : y === 17 ? 'D' : '.')).join(''),
  ),
};

/** The skull flag at the masthead, rippling. Framed, 6x5. */
const FLAG = ['KKKKKK', 'KKwwKK', 'KwKKwK', 'KKwwKK', 'KwKKwK'];
const skullFlag: PixelSprite = {
  id: 'rm16-opener-skull-flag',
  name: 'skull flag',
  tags: ['scene', 'rm16'],
  rows: FLAG,
  frames: [FLAG, ['KKKKK.', 'KKwwKK', 'KwKKwK', 'KKwwKK', 'KwKKwK'], FLAG, ['KKKKKK', 'KKwwKK', 'KwKKwK', 'KKwwK.', 'KwKKwK']],
  frameMs: 320,
};

/**
 * The strongroom door: riveted iron plates, three bands, hinges on the right, two chains crossed
 * corner to corner. The padlock that holds them is drawn on at the crossing. 26x43.
 */
function doorRows(): string[] {
  const plate = Array.from({ length: 43 }, (_, y) => {
    if (y === 0 || y === 42) return 'D'.repeat(26);
    if (y === 8 || y === 21 || y === 34) return `D${'K'.repeat(24)}D`;
    return `Dx${'X'.repeat(22)}DD`;
  });
  const rivets: RmPoint[] = [8, 21, 34].flatMap((y) => [3, 8, 13, 18, 22].map((x) => [x, y, 'x'] as const));
  const hinges: RmPoint[] = [4, 5, 6, 30, 31, 32].flatMap((y) => [[23, y, 'O'], [24, y, 'G'], [25, y, 'O']] as const);
  const chain: RmPoint[] = [];
  for (let i = 0; i <= 38; i++) {
    const t = i / 38;
    const ch = i % 2 === 0 ? 'x' : 'X';
    chain.push([Math.round(2 + t * 21), 2 + i, ch], [Math.round(23 - t * 21), 2 + i, ch]);
  }
  const lock = paint(
    [
      '...xxxxx...',
      '..xX...Xx..',
      '..X.....X..',
      '..X.....X..',
      'OOOOOOOOOOO',
      'OyyyyyyyyGO',
      'OyGGGKGGGgO',
      'OyGGKKKGGgO',
      'OyGGGKGGGgO',
      'OyGGGKGGGgO',
      'OyGGGGGGGgO',
      'OGggggggggO',
      '.OOOOOOOOO.',
    ],
    8,
    15,
  );
  return rmMark(plate, [...rivets, ...hinges, ...chain, ...lock]);
}

const vaultDoor: PixelSprite = {
  id: 'rm16-opener-door',
  name: 'strongroom door',
  tags: ['scene', 'rm16'],
  rows: doorRows(),
};

/** The radio set on its shelf: a round green screen, knobs, a grille. 15x11. */
const radio: PixelSprite = {
  id: 'rm16-opener-radio',
  name: 'radio set',
  tags: ['scene', 'rm16'],
  rows: [
    '.OOOOOOOOOOOOO.',
    'OGGGGGGGGGGGGgO',
    'OGg.......gGGgO',
    'OGg.......gxGgO',
    'OGg.......gGGgO',
    'OGg.......gDGgO',
    'OGg.......gGGgO',
    'OGg.......gxGgO',
    'OGGggggggggGGgO',
    'OgOgOgOgOgOgggO',
    '.OOOOOOOOOOOOO.',
  ],
};

/** One look at the screen: the skull, or the snow either side of it. */
const SKULL = ['..mmm..', '.mmmmm.', '.mKmKm.', '.mmmmm.', '..mKm..', '..m.m..'];
const screen: PixelSprite = {
  id: 'rm16-opener-screen',
  name: 'radio screen',
  tags: ['scene', 'rm16'],
  rows: SKULL.map((row) => row.replace(/\./g, 'n')),
  frames: [
    SKULL.map((row) => row.replace(/\./g, 'n')),
    SKULL.map((row) => row.replace(/\./g, 'n')),
    rmPlot(7, 6, [[1, 0, 'N'], [4, 1, 'm'], [2, 2, 'N'], [6, 3, 'N'], [0, 4, 'm'], [3, 5, 'N']]).map((row) => row.replace(/\./g, 'n')),
    SKULL.map((row) => row.replace(/\./g, 'n')),
    rmPlot(7, 6, [[5, 0, 'm'], [1, 2, 'N'], [3, 3, 'm'], [5, 4, 'N'], [2, 5, 'N']]).map((row) => row.replace(/\./g, 'n')),
  ],
  frameMs: 260,
};

/** The shelf the radio stands on. 19x3. */
const shelf: PixelSprite = {
  id: 'rm16-opener-shelf',
  name: 'shelf',
  tags: ['scene', 'rm16'],
  rows: [
    'xxxxxxxxxxxxxxxxxxx',
    'DDDDDDDDDDDDDDDDDDD',
    '..D............D...',
  ],
};

/** Floor shadows under the keeper and the door. */
const floorShadow: PixelSprite = {
  id: 'rm16-opener-floor-shadow',
  name: 'rm16-opener-floor-shadow',
  tags: ['scene', 'rm16'],
  palette: RM_PALETTE,
  rows: [
    '..ZZZZZZZZZZZZZZZZ.....ZZZZZZZZZZZZZZZZZZZZZZZZZZ',
    '....ZZZZZZZZZZZZ.......ZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  ],
};

const base = rmCompose('rm16-opener-base', rmWatchRoom(80, 60, 50), [
  [nightWindow, 3, 4],
  [shelf, 2, 45],
  [radio, 4, 34],
  [vaultDoor, 52, 7],
  [floorShadow, 29, 52],
]);

export const rm16Opener: SceneArt = {
  id: 'rm16-opener',
  label: 'A lighthouse keeper holds up a lantern at a barred window as a pirate ship flying a skull flag slides past the moon, while behind him the strongroom door is chained shut with a big padlock and a radio screen flickers with a skull.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rmStar, x: 9, y: 8, motion: { kind: 'twinkle', periodMs: 3400, min: 0.2 } },
    { sprite: rmStar, x: 24, y: 10, motion: { kind: 'twinkle', periodMs: 4100, min: 0.2, phase: 0.5 } },
    { sprite: rmPortSwell, x: 6, y: 22, motion: { kind: 'drift', amp: 1, periodMs: 3800 } },
    { sprite: skullFlag, x: 13, y: 7 },
    { sprite: bars, x: 4, y: 5 },
    { sprite: screen, x: 7, y: 36 },
    { sprite: rmGlint, x: 66, y: 27, motion: { kind: 'twinkle', periodMs: 2300, min: 0.15 } },
    { sprite: rmKeeperLift, x: 30, y: 24 },
    { sprite: rmLantern, x: 28, y: 33 },
  ],
};

/** Lesson 16's emblem: a padlock, steel shackle over a gold body with its keyhole. 12x15. */
const emblemPadlock: PixelSprite = {
  id: 'rm16-emblem-padlock',
  name: 'padlock',
  tags: ['rm', 'emblem', 'lesson 16'],
  rows: [
    '...xxxxxx...',
    '..xXXXXXXx..',
    '.xX......Xx.',
    '.xX......Xx.',
    '.xX......Xx.',
    'OOOOOOOOOOOO',
    'OyyyyyyyyyGO',
    'OyGGGKKGGGgO',
    'OyGGKKKKGGgO',
    'OyGGGKKGGGgO',
    'OyGGGKKGGGgO',
    'OyGGGGGGGGgO',
    'OGgggggggggO',
    '.OOOOOOOOOO.',
  ],
};

export const rm16Finish: SceneArt = rmKeepsake(
  'rm16-finish',
  'A red and white life ring hanging from a rope, with a gold padlock at its center, its steel shackle shut.',
  emblemPadlock,
);

export const art: LessonArtSet = { opener: rm16Opener, backdrop: rmBackdrop, finish: rm16Finish };
