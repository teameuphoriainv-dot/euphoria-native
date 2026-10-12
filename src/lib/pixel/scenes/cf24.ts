/**
 * Corporate Finance lesson 24, Financial Engineering & Structured Products: a pool of loans sliced
 * into tranches.
 *
 * Opener: the securitisation machine. A heap of little houses (the pool of mortgages) sits on the
 * floor at the left, and an inclined belt carries them up one by one into the side of a big steel
 * machine, its gears turning behind a window and its stack letting off steam. Out of the other
 * side comes a slab in three layers on a walnut stand: blue senior on top, teal mezzanine, red
 * equity at the bottom to take the first loss. The CFO stands by it. The three tranche colours are
 * the brightest things in the picture, repeated as three lamps on the machine. Only small layers
 * move: houses riding the belt, two gears, steam, the three lamps in turn.
 *
 * Keepsake: a house whose walls are three tranches.
 */
import type { PixelSprite } from '../types';
import { cfBackdrop } from './cf-backdrop';
import { cfKeepsake } from './cf1-finish';
import { CF_PALETTE, cfCfo, cfCompose, cfHall, cfShadowShort } from './cf-kit';
import { cfRecolor } from './cf-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/** A little house: a red roof lit on its left slope, white walls, a dark door, a blue window. */
const HOUSE: readonly string[] = ['...R...', '..RRr..', '.RRRrr.', 'RRRRrrr', '.wwwwx.', '.wDwBx.', '.wDwwx.'];
const house: PixelSprite = { id: 'cf24-house', name: 'cf24-house', tags: ['scene', 'cf24'], blurb: 'A little house with a red roof.', rows: [...HOUSE] };
const houseBlue = cfRecolor(house, 'cf24-house-blue', { R: 'B', r: 'b' }, 'A little house with a blue roof.');
const houseGold = cfRecolor(house, 'cf24-house-gold', { R: 'G', r: 'g' }, 'A little house with a gold roof.');
const houseTeal = cfRecolor(house, 'cf24-house-teal', { R: 'T', r: 't' }, 'A little house with a teal roof.');

/** The machine, in scene pixels: its body, the intake on its left side, the outlet on its right. */
const MACHINE = { x: 28, y: 16, w: 25, h: 35 } as const;
const INTAKE = { y: 37, h: 8 } as const;
/** The belt's top surface: up from the heap to the intake, two rows for every five across. */
const BELT = { from: 10, to: MACHINE.x, base: 52 } as const;
const beltTop = (x: number) => Math.round(BELT.base - ((x - BELT.from) * 2) / 5);

/**
 * The machine: a steel cabinet lit top and left, a brass band, a dark window for the gears, the
 * intake's dark mouth on the left and the outlet's on the right, rivets in the corners.
 */
const machine: PixelSprite = {
  id: 'cf24-machine',
  name: 'cf24-machine',
  tags: ['scene', 'cf24'],
  blurb: 'A big steel machine with a gear window.',
  rows: Array.from({ length: MACHINE.h }, (_, j) =>
    Array.from({ length: MACHINE.w }, (_, i) => {
      const y = MACHINE.y + j;
      if (i === 0 || j === 0 || i === MACHINE.w - 1 || j === MACHINE.h - 1) return 'D';
      if (i <= 2 && y >= INTAKE.y && y < INTAKE.y + INTAKE.h) return i === 2 ? 'O' : 'K';
      if (i >= MACHINE.w - 3 && y >= 36 && y < 41) return i === MACHINE.w - 3 ? 'O' : 'K';
      if (j === 4) return 'G';
      if (j === 5) return 'g';
      if (i >= 4 && i <= MACHINE.w - 5 && j >= 7 && j <= 17) return i === 4 || j === 7 ? 'D' : i === MACHINE.w - 5 || j === 17 ? 'x' : 'K';
      if ((i === 2 || i === MACHINE.w - 3) && (j === 2 || j === MACHINE.h - 3)) return 'x';
      if (j === 1 || i === 1) return 'x';
      return i >= MACHINE.w - 3 ? 'D' : 'X';
    }).join(''),
  ),
};

/** The stack on the machine's roof. */
const stack: PixelSprite = { id: 'cf24-stack', name: 'cf24-stack', tags: ['scene', 'cf24'], rows: ['DDDDDD', '.xXXD.', '.xXXD.', '.xXXD.', '.xXXD.', '.xXXD.', '.xXXD.', '.xXXD.'] };

/** The housings of the three tranche lamps; the lit lenses are layers. */
const lampRow: PixelSprite = { id: 'cf24-lamp-row', name: 'cf24-lamp-row', tags: ['scene', 'cf24'], rows: ['DDDD.DDDD.DDDD', 'DbbD.DttD.DrrD', 'DDDD.DDDD.DDDD'] };

/**
 * The belt: a steel band climbing from the heap to the intake, a dark underside, and two legs down
 * to the floor. Computed from the slope so the houses' frames and the belt agree on every column.
 */
const BELT_LEGS = [16, 24] as const;
const belt: PixelSprite = {
  id: 'cf24-belt',
  name: 'cf24-belt',
  tags: ['scene', 'cf24'],
  blurb: 'An inclined belt conveyor.',
  rows: Array.from({ length: BELT.base - beltTop(BELT.to) + 6 }, (_, j) =>
    Array.from({ length: BELT.to - BELT.from + 1 }, (_, i) => {
      const x = BELT.from + i;
      const y = beltTop(BELT.to) + j;
      const top = beltTop(x);
      if (y === top) return 'x';
      if (y === top + 1) return x % 2 === 0 ? 'D' : 'K';
      if (y === top + 2) return 'D';
      if (BELT_LEGS.some((l) => l === x) && y > top + 2 && y < BELT.base + 4) return 'D';
      if (BELT_LEGS.some((l) => Math.abs(l - x) <= 1) && y === BELT.base + 4) return 'D';
      return '.';
    }).join(''),
  ),
};

/** The heap of houses at the belt's foot: the pool of mortgages, roofs of every colour. */
const HEAP: readonly (readonly [PixelSprite, number, number])[] = [
  [houseTeal, 0, 50],
  [houseGold, 7, 50],
  [houseBlue, 3, 44],
];

/** The slab the machine turns out: blue senior, teal mezzanine, red equity, outlined and lit. */
const slab: PixelSprite = {
  id: 'cf24-slab',
  name: 'cf24-slab',
  tags: ['scene', 'cf24'],
  blurb: 'A slab in three tranches: blue, teal and red.',
  rows: [
    'DDDDDDDDDDDD',
    'DBBBBBBBBBbD',
    'DBbbbbbbbbbD',
    'DDDDDDDDDDDD',
    'DTTTTTTTTTtD',
    'DTtttttttttD',
    'DDDDDDDDDDDD',
    'DRRRRRRRRRrD',
    'DRrrrrrrrrrD',
    'DDDDDDDDDDDD',
  ],
};

/** The walnut stand under the slab, and the outlet's brass lip that feeds it. */
const stand: PixelSprite = {
  id: 'cf24-stand',
  name: 'cf24-stand',
  tags: ['scene', 'cf24'],
  blurb: 'A small walnut stand.',
  palette: CF_PALETTE,
  rows: ['OyyyyyyyyyyyGO', 'OOOOOOOOOOOOOO', '.AAAAAAAAAAAa.', '.Aa.......Aa..', '.Aa.......Aa..', '.Aa.......Aa..', '.Aa.......Aa..', '.Aa.......Aa..', 'OOO.......OOO.'],
};
const lip: PixelSprite = { id: 'cf24-lip', name: 'cf24-lip', tags: ['scene', 'cf24'], rows: ['Gg', 'OO'] };

const machineShadow: PixelSprite = { id: 'cf24-machine-shadow', name: 'cf24-machine-shadow', tags: ['scene', 'cf24'], palette: CF_PALETTE, rows: ['Z'.repeat(27)] };

const base = cfCompose('cf24-opener-base', cfHall, [
  [stack, 44, MACHINE.y - 8],
  [machineShadow, MACHINE.x + 2, MACHINE.y + MACHINE.h],
  [machine, MACHINE.x, MACHINE.y],
  [lampRow, MACHINE.x + 6, MACHINE.y + 21],
  [belt, BELT.from, beltTop(BELT.to)],
  ...HEAP,
  [lip, MACHINE.x + MACHINE.w, 40],
  [stand, 54, 43],
  [slab, 55, 33],
  [cfShadowShort, 70, 57],
  [cfCfo, 67, 31],
], 'The still works floor: the machine with its stack and gear window, the belt, the heap of houses, the slab of tranches on its stand, the CFO.');

/**
 * Houses riding the belt up into the intake, two pixels across a frame, ten pixels apart. Each
 * house sits on the belt at its own middle column, so it climbs the slope rather than sliding
 * through it. A house steps onto the belt whole beside the heap (a sliver sliding out from under
 * the heap would paint over it, since layers lie on top) and goes into the intake a column at a
 * time.
 */
const RIDE = { x: BELT.from + 4, w: BELT.to - BELT.from - 4, top: beltTop(BELT.to) - HOUSE.length, h: BELT.base - beltTop(BELT.to) + HOUSE.length } as const;
function rideAt(f: number): string[] {
  const grid = Array.from({ length: RIDE.h }, () => Array.from({ length: RIDE.w }, () => '.'));
  for (let start = 2 * f; start < RIDE.w; start += 10) {
    const bottom = beltTop(RIDE.x + start + 3) - 1 - RIDE.top;
    HOUSE.forEach((row, j) => {
      [...row].forEach((ch, i) => {
        const line = grid[bottom - HOUSE.length + 1 + j];
        if (line && ch !== '.' && start + i < RIDE.w) line[start + i] = ch;
      });
    });
  }
  return grid.map((row) => row.join(''));
}

const ride: PixelSprite = {
  id: 'cf24-opener-ride',
  name: 'cf24-opener-ride',
  tags: ['scene', 'cf24'],
  blurb: 'Little houses riding the belt into the machine.',
  rows: rideAt(0),
  frames: [0, 1, 2, 3, 4].map(rideAt),
  frameMs: 320,
};

/** A brass gear of `teeth` teeth round a dark hub, turned a quarter tooth each frame. */
function gear(id: string, radius: number, teeth: number, spin: 1 | -1, frameMs: number): PixelSprite {
  const size = 2 * radius + 1;
  const at = (turn: number) =>
    Array.from({ length: size }, (_, j) =>
      Array.from({ length: size }, (_, i) => {
        const dx = i - radius;
        const dy = j - radius;
        const d = Math.hypot(dx, dy);
        if (d < 1.2) return 'O';
        if (d <= radius - 1.2) return dx + dy > 1 ? 'g' : 'G';
        const tooth = Math.cos(teeth * (Math.atan2(dy, dx) - turn)) > 0.2;
        if (d <= radius + 0.4 && tooth) return dx + dy > 1 ? 'g' : 'y';
        return '.';
      }).join(''),
    );
  const step = (2 * Math.PI) / teeth / 4;
  return { id, name: id, tags: ['scene', 'cf24'], blurb: 'A brass gear turning.', rows: at(0), frames: [0, 1, 2, 3].map((k) => at(spin * k * step)), frameMs };
}

const gearBig = gear('cf24-opener-gear-big', 4, 8, 1, 200);
const gearSmall = gear('cf24-opener-gear-small', 3, 6, -1, 150);

const steam: PixelSprite = { id: 'cf24-opener-steam', name: 'cf24-opener-steam', tags: ['scene', 'cf24'], rows: ['.xx.', 'xwwx', '.xx.'] };
const lensSenior: PixelSprite = { id: 'cf24-opener-lens-senior', name: 'cf24-opener-lens-senior', tags: ['scene', 'cf24'], rows: ['BB'] };
const lensMezzanine: PixelSprite = { id: 'cf24-opener-lens-mezzanine', name: 'cf24-opener-lens-mezzanine', tags: ['scene', 'cf24'], rows: ['TT'] };
const lensEquity: PixelSprite = { id: 'cf24-opener-lens-equity', name: 'cf24-opener-lens-equity', tags: ['scene', 'cf24'], rows: ['RR'] };

const LAMPS_AT = { x: MACHINE.x + 7, y: MACHINE.y + 22 } as const;

export const cf24Opener: SceneArt = {
  id: 'cf24-opener',
  label: 'Little houses ride a belt up into a big steel machine with turning gears, and out of its other side comes a slab in three layers, blue, teal and red, while the finance chief stands by.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: ride, x: RIDE.x, y: RIDE.top },
    { sprite: gearBig, x: MACHINE.x + 5, y: MACHINE.y + 8 },
    { sprite: gearSmall, x: MACHINE.x + 13, y: MACHINE.y + 9 },
    { sprite: steam, x: 45, y: MACHINE.y - 11, motion: { kind: 'rise', amp: 6, periodMs: 3200 } },
    { sprite: lensSenior, x: LAMPS_AT.x, y: LAMPS_AT.y, motion: { kind: 'twinkle', periodMs: 2400, min: 0.3 } },
    { sprite: lensMezzanine, x: LAMPS_AT.x + 5, y: LAMPS_AT.y, motion: { kind: 'twinkle', periodMs: 2400, phase: 0.33, min: 0.3 } },
    { sprite: lensEquity, x: LAMPS_AT.x + 10, y: LAMPS_AT.y, motion: { kind: 'twinkle', periodMs: 2400, phase: 0.66, min: 0.3 } },
  ],
};

/** Lesson 24's emblem: a house with a white roof whose walls are three tranches, blue, teal and red. */
const emblemTranches: PixelSprite = {
  id: 'cf24-emblem-tranches',
  name: 'cf24-emblem-tranches',
  tags: [],
  blurb: 'A house whose walls are three bands: blue, teal and red.',
  rows: [
    '.......OO.......',
    '......OwwO......',
    '.....OwwwxO.....',
    '....OwwwwxxO....',
    '...OwwwwwxxxO...',
    '..OwwwwwwxxxxO..',
    '.OOOOOOOOOOOOOO.',
    '.DBBBBBBBBBBBbD.',
    '.DBBBBBBBBBBBbD.',
    '.DbbbbbbbbbbbbD.',
    '.DTTTTTTTTTTTtD.',
    '.DTTTTTTTTTTTtD.',
    '.DttttttttttttD.',
    '.DRRRRRRRRRRRrD.',
    '.DRRRRRRRRRRRrD.',
    '.DDDDDDDDDDDDDD.',
  ],
};

export const cf24Finish = cfKeepsake(
  'cf24-finish',
  'A crystal award on a gold stand with a house inside whose walls are three bands of blue, teal and red, and small sparkles around it.',
  emblemTranches,
);

export const art: LessonArtSet = { opener: cf24Opener, backdrop: cfBackdrop, finish: cf24Finish };
