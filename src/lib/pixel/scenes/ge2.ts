/**
 * Global Economics lesson 2: supply and demand, on the quay by day.
 *
 * A market balance stands on the quay with cargo in one pan and coins in the other, and the price
 * tag on its post says what the tilt means: when goods outweigh money the price falls, level is the
 * equilibrium, and when money outweighs goods the price rises. The student holds up a coin on the
 * demand side; stacked containers wait on the supply side. Only small layers move: the balance and
 * its tag, the coin's glint, a ship on the horizon, two clouds, two gulls and glints on the water.
 *
 * The keepsake's emblem is the market cross: supply rising, demand falling, a coin where they meet.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import {
  GE_PALETTE,
  GE_STUDENT_HOLD,
  geCoinSmall,
  geCompose,
  geContainer,
  geGull,
  geLater,
  geShipFar,
  geStamp,
  geStudent,
  geTint,
} from './ge-kit';
import { GE_TAG_MARK, geCloud, geCloudSmall, geGlintDay, geGroundQuay, geShadow, geTag } from './ge-kit-a';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── the market balance: built frame by frame from its parts, so the pans always hang true ───── */

/** What the tag says. Prices fall when cargo outweighs coins and rise when coins outweigh cargo. */
const markDown = ['..r..', '..r..', 'rrrrr', '.rrr.', '..r..'];
const markLevel = ['.....', 'KKKKK', '.....', 'KKKKK', '.....'];
const markUp = ['..n..', '.nnn.', 'nnnnn', '..n..', '..n..'];

/** Supply: two containers, 7 wide so the pan's strings show either side of them. */
const cargo = ['bbbbbbK', 'bKbKbKK', 'KKKKKKK', 'rrrrrrK', 'rKrKrKK', 'KKKKKKK'];
/** Demand: a stack of coins seen edge on. */
const money = ['.OOOOO.', 'OyyyyyO', 'OgGGGgO', 'OyyyyyO', 'OgGGGgO', '.OOOOO.'];

const BALANCE = { w: 33, h: 24, pivot: 16, beam: 9 } as const;

/** The balance with its beam tipped `tilt` rows at the right end (negative: the left end drops). */
function balanceFrame(tilt: number, mark: readonly string[]): string[] {
  const { w, h, pivot, beam } = BALANCE;
  const yAt = (x: number) => beam + Math.round((tilt * (x - pivot)) / 15);
  let rows: string[] = Array.from({ length: h }, () => '.'.repeat(w));
  for (let y = 7; y <= 21; y += 1) rows = geStamp(rows, ['OGO'], pivot - 1, y);
  rows = geStamp(rows, ['.OOgGGGgOO.', 'OOOOOOOOOOO'], pivot - 5, 22);
  rows = geStamp(rows, geStamp(geTag.rows, mark, GE_TAG_MARK.x, GE_TAG_MARK.y), pivot - 4, 0);
  for (let x = 1; x <= w - 2; x += 1) rows = geStamp(rows, ['O', x === pivot ? 'y' : 'G', 'O'], x, yAt(x) - 1);
  for (const [px, load] of [[0, cargo], [w - 11, money]] as const) {
    const rim = yAt(px + 5) + 10;
    for (const sx of [px + 1, px + 9]) for (let y = yAt(sx) + 2; y < rim; y += 1) rows = geStamp(rows, ['O'], sx, y);
    rows = geStamp(rows, ['OGGGGGGGGgO', '.OgggggggO.'], px, rim);
    rows = geStamp(rows, load, px + 2, rim - load.length);
  }
  return rows;
}

const balanceFrames = [balanceFrame(0, markLevel), balanceFrame(-3, markDown), balanceFrame(0, markLevel), balanceFrame(3, markUp)];

const balance: PixelSprite = {
  id: 'ge2-opener-balance',
  name: 'market balance',
  tags: ['ge2', 'animated'],
  blurb: 'A gold balance with containers in one pan and coins in the other, its price tag falling, level and rising as it tips.',
  palette: GE_PALETTE,
  rows: balanceFrames[0],
  frames: balanceFrames,
  frameMs: 1100,
};

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

/** Where the student stands. The coin and the shadow are placed from it. */
const STUDENT = { x: 56, y: 33 };

const box = (ch: string) => geTint(geContainer, `ge2-opener-box-${ch}`, { r: ch });

const base = geCompose('ge2-opener-base', geGroundQuay, [
  { sprite: geContainer, x: 0, y: 42 },
  { sprite: box('b'), x: 8, y: 42 },
  { sprite: box('t'), x: 0, y: 39 },
  { sprite: box('p'), x: 8, y: 39 },
  { sprite: geContainer, x: 4, y: 36 },
  { sprite: geTint(geShadow, 'ge2-opener-shadow', { Z: 'D' }), x: STUDENT.x + 7, y: STUDENT.y + 24 },
  { sprite: geStudent, x: STUDENT.x, y: STUDENT.y },
]);

const gullLater = geLater(geGull, 'ge2-opener-gull-later', 1, 520);

export const ge2Opener: SceneArt = {
  id: 'ge2-opener',
  label: 'On a sunny quay, a balance holds shipping containers in one pan and coins in the other, its price tag tipping down, level and up, while a student holds up a coin beside it.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: balance, x: 18, y: 26 },
    { sprite: geCoinSmall, x: STUDENT.x + GE_STUDENT_HOLD.x, y: STUDENT.y + GE_STUDENT_HOLD.y },
    { sprite: geShipFar, x: 1, y: 23, motion: { kind: 'bob', amp: 1, periodMs: 3800 } },
    { sprite: geCloud, x: 8, y: 3, motion: { kind: 'drift', amp: 4, periodMs: 12000 } },
    { sprite: geCloudSmall, x: 50, y: 8, motion: { kind: 'drift', amp: 3, periodMs: 9500, phase: 0.5 } },
    { sprite: geGull, x: 34, y: 13, motion: { kind: 'drift', amp: 3, periodMs: 7000 } },
    { sprite: gullLater, x: 70, y: 17, motion: { kind: 'drift', amp: 2, periodMs: 8400, phase: 0.4 } },
    { sprite: geGlintDay, x: 64, y: 30 },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** The market cross: supply rising in emerald, demand falling in red, a coin glinting where they meet. */
const emblemCross: PixelSprite = {
  id: 'ge2-emblem-cross',
  name: 'emblem market cross',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'Two crossing lines on a chart, one rising and one falling, with a gold coin where they meet.',
  palette: GE_PALETTE,
  rows: [
    '................',
    '.A..............',
    '.A.RR........NN.',
    '.A..RR......NN..',
    '.A...RR....NN...',
    '.A....RROONN....',
    '.A.....OyGO.....',
    '.A.....OGgO.....',
    '.A.....NOOR.....',
    '.A....NN..RR....',
    '.A...NN....RR...',
    '.A..NN......RR..',
    '.A.NN........RR.',
    '.A..............',
    '.AAAAAAAAAAAAAA.',
    '................',
  ],
  frames: [
    [
      '................',
      '.A..............',
      '.A.RR........NN.',
      '.A..RR......NN..',
      '.A...RR....NN...',
      '.A....RROONN....',
      '.A.....OyGO.....',
      '.A.....OGgO.....',
      '.A.....NOOR.....',
      '.A....NN..RR....',
      '.A...NN....RR...',
      '.A..NN......RR..',
      '.A.NN........RR.',
      '.A..............',
      '.AAAAAAAAAAAAAA.',
      '................',
    ],
    [
      '................',
      '.A..............',
      '.A.RR........NN.',
      '.A..RR......NN..',
      '.A...RR....NN...',
      '.A....RROONN....',
      '.A.....OyGO.....',
      '.A.....OGgO.....',
      '.A.....NOOR.....',
      '.A....NN..RR....',
      '.A...NN....RR...',
      '.A..NN......RR..',
      '.A.NN........RR.',
      '.A..............',
      '.AAAAAAAAAAAAAA.',
      '................',
    ],
    [
      '................',
      '.A..............',
      '.A.RR........NN.',
      '.A..RR......NN..',
      '.A...RR....NN...',
      '.A....RROONN....',
      '.A.....OzGO.....',
      '.A.....OGgO.....',
      '.A.....NOOR.....',
      '.A....NN..RR....',
      '.A...NN....RR...',
      '.A..NN......RR..',
      '.A.NN........RR.',
      '.A..............',
      '.AAAAAAAAAAAAAA.',
      '................',
    ],
    [
      '................',
      '.A..............',
      '.A.RR........NN.',
      '.A..RR......NN..',
      '.A...RR....NN...',
      '.A....RROONN....',
      '.A.....OyzO.....',
      '.A.....OzgO.....',
      '.A.....NOOR.....',
      '.A....NN..RR....',
      '.A...NN....RR...',
      '.A..NN......RR..',
      '.A.NN........RR.',
      '.A..............',
      '.AAAAAAAAAAAAAA.',
      '................',
    ],
  ],
  frameMs: 600,
};

export const ge2Finish: SceneArt = geKeepsake(
  'ge2-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a chart where a rising line and a falling line cross at a gold coin, with small sparkles around it.',
  emblemCross,
);

export const art: LessonArtSet = { opener: ge2Opener, backdrop: geBackdrop, finish: ge2Finish };
