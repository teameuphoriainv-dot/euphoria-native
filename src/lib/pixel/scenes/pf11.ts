/**
 * Personal Finance lesson 11, Negotiating Your Salary & Income: ask, and shake on more.
 *
 * A new set, an office high over the city at sunset: a window wall of towers, the desk across the
 * front. The figure and the hiring manager (grey hair, teal suit) shake on the offer over the desk,
 * and a speech bubble says what the asking won: +5K, the raise the lesson follows across a career.
 * The pay envelope it buys sits on the desk by a mug. Moving: the handshake, lights in the towers, a
 * glint by the bubble, the coffee's steam, a far plane's light.
 */
import type { PixelSprite } from '../types';
import { pfCompose, pfPayEnvelope, pfSparkle, pfTable } from './pf-kit';
import { pfBlock, pfMug, pfSteam } from './pf-kit-a';
import { pfText } from './pf-kit-b';
import { pfKeepsake } from './pf1-finish';
import { pfBackdrop } from './pf-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const SKIN: Record<string, string> = {
  M: '#D6A87C',
  C: '#C08552',
  U: '#9A6638',
  j: '#6B3A1F',
  H: '#43291A',
};

/** The window wall: a sunset behind far towers (grey) and near ones (dark, lit windows), two mullions, a sill. */
const FAR_TOWERS = [[2, 9, 12], [13, 7, 8], [24, 10, 13], [37, 6, 6], [45, 9, 11], [55, 7, 9]] as const;
const NEAR_TOWERS = [[0, 8, 19], [10, 6, 15], [19, 9, 21], [31, 7, 17], [42, 10, 20], [54, 8, 16]] as const;
const SKY = ['E', 'E', 'E', 'E', 'E', 'p', 'p', 'p', 'p', 'p', 'f', 'f', 'f', 'f', '3', '3', '3', '3', '4'];
function officeWindow(): PixelSprite {
  const W = 64;
  const H = 32;
  const inside = (list: readonly (readonly [number, number, number])[], x: number, y: number) =>
    list.find(([tx, tw, top]) => x >= tx + 2 && x < tx + 2 + tw && y >= top);
  const rows = Array.from({ length: H }, (_, y) =>
    Array.from({ length: W }, (_, x) => {
      if (y === 0 || y === H - 1 || x === 0 || x === W - 1) return 'D';
      if (y === 1 || x === 1 || x === W - 2) return 'X';
      if (y === H - 2) return 'x';
      if (x === 21 || x === 42) return 'D';
      const near = inside(NEAR_TOWERS, x, y);
      if (near) {
        if (x === near[0] + 2) return 'k';
        return (x - near[0]) % 2 === 1 && y % 3 === 0 && (x + y) % 4 !== 0 ? 'G' : 'K';
      }
      const far = inside(FAR_TOWERS, x, y);
      if (far) {
        if (x === far[0] + 2) return 'X';
        return (x - far[0]) % 3 === 1 && y % 4 === 1 ? 'g' : 'D';
      }
      return SKY[Math.min(y - 2, SKY.length - 1)];
    }).join(''),
  );
  return { id: 'pf11-office-window', name: 'office window', tags: ['scene', 'pf'], rows };
}

/** The figure reaching its hand out to the right at chest height; the hand itself is the clasp layer. */
const saverShake: PixelSprite = {
  id: 'pf11-saver-shake',
  name: 'saver shaking hands',
  tags: ['scene', 'pf'],
  palette: SKIN,
  rows: [
    '.....HHHHHH.............',
    '....HjjjjjjH............',
    '...HjjjjjjjjH...........',
    '..HjjjjjjjjjjH..........',
    '..HjjMCCjjjjjH..........',
    '..HjCCCCCCCCjH..........',
    '..HCCKCCCCKCCH..........',
    '..HMCCCCCCCCUH..........',
    '...MCCCUUCCCU...........',
    '....UCCCCCCU............',
    '......UUUU..............',
    '...bBBBBBBBBb...........',
    '..bBBBwBBwBBBb..........',
    '.bBBBBwBBwBBBBb.........',
    '.bBBBBBBBBBBBBBb........',
    '.bBBbBBBBBBbBBBBb.......',
    '.bBBbBBBBBBbBBbBBBBBBb..',
    '.bBBbBBBBBBbBBbbbbbbbb..',
    '.bBBbBBBBBBbBBb.........',
    '.bBBbBBBBBBbBBb.........',
    '.bBBbBBBBBBbBBb.........',
    '.bBBbBBBBBBbBBb.........',
    '.bBBbBBBBBBbBBb.........',
    '.bBBbBBBBBBbBBb.........',
    '.bBBbBBBBBBbBBb.........',
    '.bBBbBBBBBBbBBb.........',
  ],
};

/** The hiring manager: short grey hair, a teal suit and a red tie, reaching out to the left. */
const managerShake: PixelSprite = {
  id: 'pf11-manager-shake',
  name: 'manager shaking hands',
  tags: ['scene', 'pf'],
  palette: SKIN,
  rows: [
    '.............XXXXXX.....',
    '............XxxxxxxX....',
    '...........XxxwwxxxxX...',
    '..........XxxxxxxxxxxX..',
    '..........XxMCCCCCCxxX..',
    '..........XMCCCCCCCCxX..',
    '..........MCCKCCCCKCCU..',
    '..........MCCCCCCCCCCU..',
    '...........MCCCUUCCCU...',
    '............UCCCCCCU....',
    '..............UUUU......',
    '...........tTTwwwwTTt...',
    '..........tTTTTwRwTTTt..',
    '.........tTTTTTTRTTTTTt.',
    '........tTTTTTTTrTTTTTt.',
    '.......tTTTTtTTTTTTtTTt.',
    '..tTTTTTTtTTtTTTTTTtTTt.',
    '..ttttttttTTtTTTTTTtTTt.',
    '.........tTTtTTTTTTtTTt.',
    '.........tTTtTTTTTTtTTt.',
    '.........tTTtTTTTTTtTTt.',
    '.........tTTtTTTTTTtTTt.',
    '.........tTTtTTTTTTtTTt.',
    '.........tTTtTTTTTTtTTt.',
    '.........tTTtTTTTTTtTTt.',
    '.........tTTtTTTTTTtTTt.',
  ],
};

/** The two hands clasped between the sleeves, for a pumping bob. */
const clasp: PixelSprite = {
  id: 'pf11-clasp',
  name: 'clasp',
  tags: ['scene', 'pf'],
  palette: SKIN,
  rows: [
    '.MM.',
    'MCCC',
    'UCCU',
  ],
};

/** The speech bubble, its tail toward the figure's mouth at the lower left; the raise is stamped in it. */
const bubble: PixelSprite = {
  id: 'pf11-bubble',
  name: 'bubble',
  tags: ['scene', 'pf'],
  rows: [
    '.XXXXXXXXXXXXXX.',
    'XwwwwwwwwwwwwwwX',
    'XwwwwwwwwwwwwwwX',
    'XwwwwwwwwwwwwwwX',
    'XwwwwwwwwwwwwwwX',
    'XwwwwwwwwwwwwwwX',
    'XwwwwwwwwwwwwwwX',
    'XwwwwwwwwwwwwwwX',
    '.XXwwXXXXXXXXXX.',
    '..XwX...........',
    '..XX............',
  ],
};

/** A far plane's light crossing the sunset. */
const planeLight: PixelSprite = {
  id: 'pf11-plane-light',
  name: 'plane light',
  tags: ['scene', 'pf'],
  rows: [
    'wXR',
  ],
};

/** One lit window in a tower, for a twinkle (the tower pixel under it is dark). */
const towerLight: PixelSprite = {
  id: 'pf11-tower-light',
  name: 'tower light',
  tags: ['scene', 'pf'],
  rows: [
    'y',
  ],
};

/** Lesson 11's emblem: a handshake, a blue sleeve and a teal one with white cuffs, the hands clasped between. */
const emblemHandshake: PixelSprite = {
  id: 'pf11-emblem-handshake',
  name: 'pf11-emblem-handshake',
  tags: ['scene', 'pf', 'emblem'],
  palette: SKIN,
  rows: [
    '......MM......',
    '....MMCCMM....',
    'BBwMCCMCCCMwTT',
    'BBwCUCCUCCCwTT',
    'BBwUCCUCCUUwTT',
    'bbw.UUUUU..wtt',
  ],
};

/** A leather briefcase set down on the floor by the desk. */
const briefcase: PixelSprite = {
  id: 'pf11-briefcase',
  name: 'briefcase',
  tags: ['scene', 'pf'],
  rows: [
    '....OOOO....',
    '....O..O....',
    '.OOOOOOOOOO.',
    'OGGGGGGGGGgO',
    'OGggggyygggO',
    'OGgggggggggO',
    'OGgggggggggO',
    '.OOOOOOOOOO.',
  ],
};

// Order is depth: the window wall, the two of them behind the desk, the things on the desk top.
const base = pfCompose('pf11-opener-base', 80, 60, 'k', [
  [pfBlock('pf11-baseboard', 80, 1, 'X'), 0, 45],
  [pfBlock('pf11-baseboard-shade', 80, 1, 'D'), 0, 46],
  [pfBlock('pf11-carpet', 80, 13, 'K'), 0, 47],
  [officeWindow(), 8, 3],
  [bubble, 26, 1],
  [pfText('pf11-raise', '+5K', 'n'), 29, 3],
  [saverShake, 16, 12],
  [managerShake, 40, 12],
  [pfTable(64, 12), 8, 36],
  [pfPayEnvelope, 20, 30],
  [pfMug, 62, 32],
  [briefcase, 54, 49],
]);

export const pf11Opener: SceneArt = {
  id: 'pf11-opener',
  label: 'In an office high over the city at sunset, a person shakes hands with a hiring manager across a desk, a speech bubble saying plus five K, with a pay envelope and a mug of coffee on the desk and a briefcase on the floor.',
  width: 80,
  height: 60,
  base,
  layers: [
    // The hands meet between the sleeves (the figure's ends at column 21, the manager's starts at 2).
    { sprite: clasp, x: 38, y: 27, motion: { kind: 'bob', amp: 1, periodMs: 900 } },
    { sprite: pfSparkle, x: 43, y: 0, motion: { kind: 'twinkle', periodMs: 1700, min: 0.35 } },
    { sprite: pfSteam, x: 63, y: 26, motion: { kind: 'rise', amp: 3, periodMs: 2400 } },
    { sprite: planeLight, x: 58, y: 7, motion: { kind: 'drift', amp: 3, periodMs: 6000 } },
    { sprite: towerLight, x: 13, y: 26, motion: { kind: 'twinkle', periodMs: 2300, min: 0.2 } },
    { sprite: towerLight, x: 69, y: 25, motion: { kind: 'twinkle', periodMs: 3100, min: 0.2, phase: 0.5 } },
  ],
};

export const pf11Finish = pfKeepsake(
  'pf11-finish',
  'A gold house-shaped key fob with a teal roof on a key ring with a brass key, its window showing a handshake between a blue sleeve and a teal one, with small sparkles around it.',
  emblemHandshake,
);

export const art: LessonArtSet = { opener: pf11Opener, backdrop: pfBackdrop, finish: pf11Finish };
