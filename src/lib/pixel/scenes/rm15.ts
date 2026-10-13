/**
 * Risk Management lesson 15 opener, Insurance & Risk Transfer: marine insurance, which began in
 * harbours like this one. Out on the quay stands the harbourmaster's iron strongbox, the insurer's
 * pool, and the keeper keeps it, lantern up. Each fishing boat in the row moored off the quay drops
 * one small coin into it, its premium. Out by the end of the quay, in the storm, one boat has gone
 * over with the mate clinging to it, and the box pays out one coin to him: many small premiums
 * carry the one loss that falls, the law of large numbers. On the horizon a bigger ship carries a
 * bigger chest, the reinsurer, and the box sends a coin up to it too: a share of the premium for a
 * share of the peak risk. Moving: the coins, the lantern, the boats and the wreck on the swell,
 * lightning and rain in the storm.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import { RM_PALETTE, rmCompose, rmKeepsake, rmLantern, rmLater, rmLightning, rmRain } from './rm-kit';
import { rmFlip, rmKeeperLift, rmMark, rmPlot, rmPortSwell, rmStar } from './rm-kit-a';
import type { RmPoint } from './rm-kit-a';
import { rmFill } from './rm-kit-b';
import type { RmSpan } from './rm-kit-b';
import type { LessonArtSet, SceneArt, SceneLayer } from './types';

/* ── the harbour ─────────────────────────────────────────────────────────────────────────────── */

/** The quay's top and its right-hand end. */
const QUAY = { top: 44, end: 49 };

/** The night sky, calm on the left and a storm coming over on the right, the sea and the stone quay. */
const ground = rmFill(
  Array.from({ length: 60 }, (_, y) => (y < 18 ? 'v' : y === 18 ? 'u' : y < 24 ? 'V' : 'v').repeat(80)),
  [
    [46, 79, 0, 'K'], [50, 79, 1, 'K'], [54, 79, 2, 'K'], [48, 53, 2, 'k'], [58, 79, 3, 'K'], [52, 57, 3, 'k'],
    [62, 79, 4, 'K'], [56, 61, 4, 'k'], [66, 79, 5, 'k'], [70, 79, 6, 'k'],
    [0, 6, 16, 'k'], [0, 11, 17, 'k'],
    [24, 30, 20, 'u'], [58, 66, 21, 'u'], [8, 13, 22, 'u'], [40, 46, 23, 'u'],
    [52, 58, 27, 'u'], [66, 74, 31, 'u'], [54, 60, 35, 'u'], [70, 78, 39, 'u'], [60, 66, 44, 'u'],
    [56, 62, 50, 'u'], [70, 77, 54, 'u'], [58, 63, 58, 'u'],
    [0, QUAY.end, QUAY.top, 'x'],
    [0, QUAY.end, QUAY.top + 1, 'X'],
    ...Array.from({ length: 14 }, (_, i): RmSpan => [0, QUAY.end, QUAY.top + 2 + i, (i + 1) % 4 === 0 ? 'K' : 'D']),
    ...Array.from({ length: 16 }, (_, i): RmSpan => [QUAY.end + 1, QUAY.end + 1, QUAY.top + i, 'K']),
  ],
);

/** The quay face's vertical joints, offset course by course. */
const JOINTS: RmPoint[] = Array.from({ length: 14 }, (_, i) => i)
  .filter((i) => (i + 1) % 4 !== 0)
  .flatMap((i) => [0, 1, 2, 3, 4, 5].map((k): RmPoint => [(Math.floor(i / 4) % 2 === 0 ? 4 : 0) + k * 8, QUAY.top + 2 + i, 'K']))
  .filter(([x]) => x <= QUAY.end);

/* ── the pool and the policyholders ──────────────────────────────────────────────────────────── */

/**
 * The harbourmaster's strongbox, the insurer's pool: iron, bound in brass, shut, a coin slot in its
 * lid and a hasp on its front. Shut and slotted, so it reads as a box coins go into. 14x10.
 */
const strongbox: PixelSprite = {
  id: 'rm15-opener-strongbox',
  name: 'strongbox',
  tags: ['scene', 'rm15'],
  rows: [
    'OGGGGGKKGGGGgO',
    'OxxxxxxxxxxxXO',
    'OXXXXXXXXXXXDO',
    'OOOOOOOOOOOOOO',
    'OXXXXXGGXXXXDO',
    'OXXXXXGKXXXXDO',
    'GXXXXXXXXXXXDG',
    'OXXXXXXXXXXXDO',
    'OXXXXXXXXXXXDO',
    'OOOOOOOOOOOOOO',
  ],
};

/**
 * A fishing boat moored off the quay: a mast, a small white sail, a white rail over a red hull, the
 * same red as the boat that has gone over, so the wreck reads as one of the fleet. 9x8.
 */
const fishingBoat: PixelSprite = {
  id: 'rm15-opener-fishing-boat',
  name: 'fishing boat',
  tags: ['scene', 'rm15'],
  rows: [
    '....D....',
    '...wD....',
    '..wwDx...',
    '.wwwDxx..',
    '....D....',
    'wwwwwwwwx',
    '.sRRRRRr.',
    '..rrrrr..',
  ],
};

/** The upturned boat with the mate clinging to it, orchid hat and all; give it a `bob`. 14x7. */
const capsized: PixelSprite = {
  id: 'rm15-opener-capsized',
  name: 'capsized boat',
  tags: ['scene', 'rm15'],
  palette: RM_PALETTE,
  rows: [
    '.EEE..........',
    'EPqPE..DDDDDD.',
    '.SKSS.DrRsRRrD',
    'SSSSSDRRRRRRrD',
    '.SSDDRRRRRRrrD',
    'UwUURRRRRrrrrU',
    'UUUUUUwUUUUwUU',
  ],
};

/**
 * The reinsurer: a big three-masted merchantman on the horizon, a chest of gold lashed on its deck
 * bigger than the harbourmaster's box. 26x14.
 */
const bigShip: PixelSprite = {
  id: 'rm15-opener-big-ship',
  name: 'reinsurer ship',
  tags: ['scene', 'rm15'],
  rows: [
    '......D......D......D.....',
    '.....wD.....wD.....wD.....',
    '....wwDx...wwDx...wwDx....',
    '...wwwDxx.wwwDxx.wwwDxx...',
    '..wwwwDxxwwwwDxxwwwwDxxx..',
    '......D......D......D.....',
    '......D..OOOOOOOOO..D.....',
    '......D..OyyyyyyGO..D.....',
    '......D..OGGGKGGgO..D.....',
    'yDDDDDDDDDDDDDDDDDDDDDDDDy',
    '.DxxxxxxxxxxxxxxxxxxxxxxD.',
    '..DXXyXXXXyXXXXyXXXXyXXD..',
    '...DXXXXXXXXXXXXXXXXXXD...',
    '....DDDDDDDDDDDDDDDDDD....',
  ],
};

/* ── the coins ───────────────────────────────────────────────────────────────────────────────── */

/** One gold coin, three pixels by two, lit on top, its top left at (x, y). */
const coin = (x: number, y: number): RmPoint[] => [[x, y, 'y'], [x + 1, y, 'y'], [x + 2, y, 'G'], [x, y + 1, 'G'], [x + 1, y + 1, 'g'], [x + 2, y + 1, 'g']];

/** `n` points from `from` to `to` in scene pixels, bowed upward by `lift` at the middle: a coin tossed. */
const arc = (from: readonly [number, number], to: readonly [number, number], lift: number, n: number): [number, number][] =>
  Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    return [Math.round(from[0] + (to[0] - from[0]) * t), Math.round(from[1] + (to[1] - from[1]) * t - 4 * lift * t * (1 - t))];
  });

/**
 * A coin's flight along `path` (scene pixels) as a layer: a framed sprite just big enough to hold the
 * path, one frame per point, then `rest` empty frames before it goes again, started `later` frames
 * in so flights sharing a rhythm stay out of step. The still is the coin halfway along, so the
 * picture at rest still shows the money on its way.
 */
function flight(id: string, path: readonly (readonly [number, number])[], rest: number, frameMs: number, later = 0): SceneLayer {
  const x0 = Math.min(...path.map(([x]) => x));
  const y0 = Math.min(...path.map(([, y]) => y));
  const w = Math.max(...path.map(([x]) => x)) - x0 + 3;
  const h = Math.max(...path.map(([, y]) => y)) - y0 + 2;
  const frames = [...path.map(([x, y]) => rmPlot(w, h, coin(x - x0, y - y0))), ...Array.from({ length: rest }, () => rmPlot(w, h, []))];
  const [mx, my] = path[Math.floor(path.length / 2)];
  const sprite: PixelSprite = { id, name: id, tags: ['scene', 'rm15'], rows: rmPlot(w, h, coin(mx - x0, my - y0)), frames, frameMs };
  return { sprite: later ? rmLater(sprite, `${id}-later`, later, frameMs) : sprite, x: x0, y: y0 };
}

/* ── the keeper ──────────────────────────────────────────────────────────────────────────────── */

/** The lantern's own short chain from the keeper's fist. 1x2. */
const lanternChain: PixelSprite = { id: 'rm15-opener-lantern-chain', name: 'lantern chain', tags: ['scene', 'rm15'], rows: ['X', 'x'] };

/** Floor shadow under the keeper and the box. */
const quayShadow: PixelSprite = {
  id: 'rm15-opener-quay-shadow',
  name: 'rm15-opener-quay-shadow',
  tags: ['scene', 'rm15'],
  palette: RM_PALETTE,
  rows: rmFill(['.'.repeat(36)], [[1, 34, 0, 'Z']]),
};

const KEEPER = { x: 0, y: 15 };
const BOX = { x: 27, y: 34 };
const SLOT: readonly [number, number] = [BOX.x + 5, BOX.y - 2];
const BOATS = [{ x: 20, y: 24 }, { x: 30, y: 24 }, { x: 40, y: 24 }];
const SHIP = { x: 53, y: 4 };
const WRECK = { x: 60, y: 40 };

const base = rmCompose('rm15-opener-base', rmMark(ground, JOINTS), [
  [bigShip, SHIP.x, SHIP.y],
  [quayShadow, 2, QUAY.top],
  [strongbox, BOX.x, BOX.y],
  [rmFlip(rmKeeperLift, 'rm15-opener-keeper'), KEEPER.x, KEEPER.y],
  [lanternChain, KEEPER.x + 16, KEEPER.y + 10],
]);

export const rm15Opener: SceneArt = {
  id: 'rm15-opener',
  label: 'On a harbor quay at night, three moored fishing boats each drop a gold coin into the harbormaster\'s iron strongbox beside the lantern-lit keeper, while the box pays a coin out to a sailor clinging to a capsized boat in a storm and sends another up to a big ship carrying a bigger chest of gold on the horizon.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rmStar, x: 6, y: 4, motion: { kind: 'twinkle', periodMs: 3600, min: 0.2 } },
    { sprite: rmStar, x: 24, y: 9, motion: { kind: 'twinkle', periodMs: 4300, min: 0.2, phase: 0.5 } },
    { sprite: rmLightning, x: 46, y: 2 },
    { sprite: rmLater(rmRain, 'rm15-opener-rain', 1, 160), x: 40, y: 18 },
    ...BOATS.map((b, i): SceneLayer => ({ sprite: fishingBoat, ...b, motion: { kind: 'bob', amp: 1, periodMs: 2600 + i * 300, phase: i / 3 } })),
    { sprite: rmPortSwell, x: 22, y: 33, motion: { kind: 'drift', amp: 1, periodMs: 3600 } },
    { sprite: capsized, ...WRECK, motion: { kind: 'bob', amp: 1, periodMs: 2200 } },
    { sprite: rmPortSwell, x: WRECK.x + 3, y: WRECK.y + 8, motion: { kind: 'drift', amp: 1, periodMs: 3000, phase: 0.5 } },
    ...BOATS.map((b, i) => flight(`rm15-opener-premium-${String(i)}`, arc([b.x + 4, b.y + 4], SLOT, 3, 5), 3, 260, i * 3)),
    flight('rm15-opener-claim', arc([BOX.x + 14, BOX.y + 3], [WRECK.x + 1, WRECK.y + 1], 4, 6), 4, 280),
    flight('rm15-opener-share', arc([BOX.x + 14, BOX.y - 1], [SHIP.x + 12, SHIP.y + 8], 3, 7), 5, 300, 6),
    { sprite: rmLantern, x: KEEPER.x + 13, y: KEEPER.y + 12 },
  ],
};

/* ── the keepsake ────────────────────────────────────────────────────────────────────────────── */

/**
 * Lesson 15's emblem: a marine policy, the paper insurance began with in harbours like the opener's.
 * A parchment scroll rolled at top and bottom, a ship drawn on it, and the red wax seal that binds it,
 * its ribbon hanging. Parchment and a seal, so it reads as a contract and not as one more chest of
 * gold (lesson 9 has that). 16x15.
 */
const emblemPolicy: PixelSprite = {
  id: 'rm15-emblem-policy',
  name: 'marine policy',
  tags: ['rm', 'emblem', 'lesson 15'],
  rows: [
    '.OGGGGGGGGGGGGO.',
    'OGyyyyyyyyyyyyGO',
    '.OGGGGGGGGGGGGO.',
    '..yyyyyyyyyyyy..',
    '..yyyyyDyyyyyy..',
    '..yyyyBDyyyyyy..',
    '..yyyBBDwyyyyy..',
    '..yyBBBDwwyyyy..',
    '..yyODDDDDDOyy..',
    '..yyyODDDDOyyy..',
    '..yyyyyyyyyRRy..',
    '.OGGGGGGGGRssRO.',
    'OGyyyyyyyyRRRRGO',
    '.OGGGGGGGGGrrO..',
    '..........r..r..',
  ],
};

export const rm15Finish: SceneArt = rmKeepsake(
  'rm15-finish',
  'A red and white life ring hanging from a rope, with a parchment marine insurance policy at its center, rolled at both ends, a ship drawn on it and a red wax seal with its ribbon.',
  emblemPolicy,
);

export const art: LessonArtSet = { opener: rm15Opener, backdrop: rmBackdrop, finish: rm15Finish };
