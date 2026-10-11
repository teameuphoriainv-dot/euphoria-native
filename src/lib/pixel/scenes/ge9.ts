/**
 * Global Economics lesson 9: emerging markets and economic development, on the terraces at dawn.
 *
 * The development ladder, one stage to a terrace as the land climbs out of the sea: a thatched hut,
 * a brick house, a factory with its chimney going, and a glass tower lit up at the top, climbing
 * away from the sun just risen over the sea. Poor to prosperous is a climb, taken a step at a time.
 * Only small layers move: the factory's smoke, the tower's light and windows, the sun's rays and
 * its glints on the water, and two gulls.
 *
 * The keepsake's emblem is the ladder in small: a hut, a house and a tower against the rising sun.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import { GE_PALETTE, geBeacon, geCompose, geGull, geLater, geShimmer, geSmoke, geStar, geTint } from './ge-kit';
import { GE_DAWN_STEPS, geGroundDawn } from './ge-kit-a';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── the four stages ────────────────────────────────────────────────────────────────────────── */

/** Stage 1, 12x10: a thatched hut with mud walls. */
const hut: PixelSprite = {
  id: 'ge9-opener-hut',
  name: 'hut',
  tags: ['ge9', 'prop'],
  blurb: 'A small hut with a thatched roof and mud walls.',
  palette: GE_PALETTE,
  rows: [
    '.....ol.....',
    '....ooll....',
    '...ooolll...',
    '..oooollll..',
    '.uuuuuuuuuu.',
    '..CCCCUUUU..',
    '..CkCCUUkU..',
    '..CCCKKUUU..',
    '..CCCKKUUU..',
    '..CCCKKUUU..',
  ],
};

/** Stage 2, 14x13: a brick house with a red roof and lit windows. */
const house: PixelSprite = {
  id: 'ge9-opener-house',
  name: 'house',
  tags: ['ge9', 'prop'],
  blurb: 'A cream house with a red roof, a chimney and lit windows.',
  palette: GE_PALETTE,
  rows: [
    '.....rr11.u...',
    '....rrr111u...',
    '...rrrr1111...',
    '..rrrrr11111..',
    '.rrrrrr111111.',
    'uuuuuuuuuuuuuu',
    '.AAAAAAASSSSS.',
    '.AyyAAAASSyyS.',
    '.AyyAAuuSSyyS.',
    '.AAAAAuuSSSSS.',
    '.AAAAAuuSSSSS.',
    '.AAAAAuuSSSSS.',
    '.uuuuuuuuuuuu.',
  ],
};

/** Stage 3, 18x16: a brick factory with north-light roofs and a chimney at (14, 0). */
const factory: PixelSprite = {
  id: 'ge9-opener-factory',
  name: 'factory',
  tags: ['ge9', 'prop'],
  blurb: 'A red brick factory with a saw-tooth roof, blue windows and a tall chimney.',
  palette: GE_PALETTE,
  rows: [
    '..............xxx.',
    '..............rr1.',
    '..............rr1.',
    '..............rr1.',
    'XX....XX......rr1.',
    'XBX...XBX.....rr1.',
    'XBBX..XBBX....rr1.',
    'XBBBX.XBBBX...rr1.',
    'XXXXXXXXXXXXXXXXXX',
    'rrrrrrrrrrrrrrrrr1',
    'rBBrBBrBBrBBrrrrr1',
    'rBBrBBrBBrBBrrrrr1',
    '111111111111111111',
    'rrrrrrrrrrrrruuur1',
    'rrrrrrrrrrrrruuur1',
    'rrrrrrrrrrrrruuur1',
  ],
};

/** Stage 4, 13x29: a glass tower with lit windows, its spire's light at (6, 0). */
const tower: PixelSprite = {
  id: 'ge9-opener-tower',
  name: 'tower',
  tags: ['ge9', 'prop'],
  blurb: 'A blue glass tower with lit windows and a spire.',
  palette: GE_PALETTE,
  rows: [
    '.............',
    '......D......',
    '......D......',
    '.....DDD.....',
    '..DDDDDDDDD..',
    '..zBbBbBbBh..',
    '..zBbBbBbBh..',
    '..zhhhhhhhh..',
    '..zBbBbBbBh..',
    '..zBbBbBbBh..',
    '..zhhhhhhhh..',
    '..zBbBbBbBh..',
    '..zBbBbBbBh..',
    '..zhhhhhhhh..',
    '..zBbBbBbBh..',
    '..zBbBbBbBh..',
    '..zhhhhhhhh..',
    '..zBbBbBbBh..',
    '..zBbBbBbBh..',
    '..zhhhhhhhh..',
    '..zBbBbBbBh..',
    '..zBbBbBbBh..',
    '..zhhhhhhhh..',
    '..zBbBbBbBh..',
    '..zBbBbBbBh..',
    '..zhhhhhhhh..',
    '..zBbBbBbBh..',
    '..zBbBbBbBh..',
    '.DDDDDDDDDDD.',
  ],
};

/** The sun's rays, 13x4, fanning up from the risen sun. */
const rays: PixelSprite = {
  id: 'ge9-opener-rays',
  name: 'sun rays',
  tags: ['ge9'],
  blurb: 'Faint rays of the morning sun.',
  palette: GE_PALETTE,
  rows: [
    '4.....4.....4',
    '.4....4....4.',
    '..4...4...4..',
    '.............',
  ],
};

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

const [s1, s2, s3, s4] = GE_DAWN_STEPS;
/** Each stage stands on its terrace, its bottom row on the terrace's grass. */
const onStep = (sprite: PixelSprite, x: number, step: { top: number }) => ({ sprite, x, y: step.top + 1 - sprite.rows.length });

const HUT = onStep(hut, 2, s1);
const HOUSE = onStep(house, 25, s2);
const FACTORY = onStep(factory, 43, s3);
const TOWER = onStep(tower, 65, s4);

const base = geCompose('ge9-opener-base', geGroundDawn, [HUT, HOUSE, FACTORY, TOWER]);

const gullLater = geLater(geGull, 'ge9-opener-gull-later', 1, 520);
/** A tower window catching the light. */
const windowLight = geTint(geStar, 'ge9-opener-window', { z: 'y' });

export const ge9Opener: SceneArt = {
  id: 'ge9-opener',
  label: 'At sunrise, four buildings stand on terraces climbing out of the sea, a hut, then a house, then a factory with a smoking chimney, then a lit glass tower, climbing away from the sun rising over the sea.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: geSmoke, x: FACTORY.x + 14, y: FACTORY.y - 4, motion: { kind: 'rise', amp: 7, periodMs: 3600 } },
    { sprite: geSmoke, x: FACTORY.x + 13, y: FACTORY.y - 6, motion: { kind: 'rise', amp: 7, periodMs: 3600, phase: 0.5 } },
    { sprite: geBeacon, x: TOWER.x + 6, y: TOWER.y },
    { sprite: windowLight, x: TOWER.x + 5, y: TOWER.y + 8, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: windowLight, x: TOWER.x + 7, y: TOWER.y + 17, motion: { kind: 'twinkle', periodMs: 2900, phase: 0.5, min: 0.3 } },
    { sprite: rays, x: 8, y: 20, motion: { kind: 'twinkle', periodMs: 3400, min: 0.25 } },
    { sprite: geShimmer, x: 9, y: 31 },
    { sprite: geGull, x: 6, y: 9, motion: { kind: 'drift', amp: 3, periodMs: 7000 } },
    { sprite: gullLater, x: 38, y: 6, motion: { kind: 'drift', amp: 2, periodMs: 8400, phase: 0.4 } },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** Development: a hut, a house and a lit tower climbing toward the rising sun, the tower's windows coming on. */
const emblemLadder: PixelSprite = {
  id: 'ge9-emblem-ladder',
  name: 'emblem development ladder',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'A small hut, a house and a tall glass tower in a rising row, the morning sun behind them.',
  palette: GE_PALETTE,
  rows: [
    '................',
    '.............D..',
    '..444........D..',
    '.45554.....DDDDD',
    '.45554.....zbybh',
    '..444......zBbBh',
    '...........zhhhh',
    '.......r...zybyh',
    '......rr1..zBbBh',
    '.....rrr11.zhhhh',
    '..o..AAASS.zbByh',
    '.ool.AyASS.zBbBh',
    'oooluAAAuS.zhhhh',
    '.CCU.AAAuS.zbybh',
    'nnnnnnnnnnnnnnnn',
    '8888888888888888',
  ],
  frames: [
    [
      '................',
      '.............D..',
      '..444........D..',
      '.45554.....DDDDD',
      '.45554.....zbybh',
      '..444......zBbBh',
      '...........zhhhh',
      '.......r...zybyh',
      '......rr1..zBbBh',
      '.....rrr11.zhhhh',
      '..o..AAASS.zbByh',
      '.ool.AyASS.zBbBh',
      'oooluAAAuS.zhhhh',
      '.CCU.AAAuS.zbybh',
      'nnnnnnnnnnnnnnnn',
      '8888888888888888',
    ],
    [
      '.4..4........r..',
      '.............D..',
      '4.444.4......D..',
      '.45554.....DDDDD',
      '.45554.....zbBbh',
      '..444......zyByh',
      '...........zhhhh',
      '.......r...zbBbh',
      '......rr1..zyByh',
      '.....rrr11.zhhhh',
      '..o..AAASS.zybBh',
      '.ool.AyASS.zBybh',
      'oooluAAAuS.zhhhh',
      '.CCU.AAAuS.zbBbh',
      'nnnnnnnnnnnnnnnn',
      '8888888888888888',
    ],
  ],
  frameMs: 1000,
};

export const ge9Finish: SceneArt = geKeepsake(
  'ge9-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a small hut, a house and a tall lit tower in a rising row with the morning sun behind them, with small sparkles around it.',
  emblemLadder,
);

export const art: LessonArtSet = { opener: ge9Opener, backdrop: geBackdrop, finish: ge9Finish };
