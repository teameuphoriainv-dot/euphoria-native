/**
 * Applied Accounting lesson 5, Cash Flow Statement Mastery: where does the cash go?
 *
 * No desk tonight: the hall's cash cistern, a brass-capped glass tank standing on the floorboards with
 * coins piled inside. Two brass pipes feed it from the walls, tagged CFO in green (operations) and CFF
 * in blue (financing), and a spout near its foot drains coins into a crate tagged CFI in red, where a
 * steel gear stands for the equipment cash buys. A charter on the wall reads FCF, a banker's lamp on a
 * side table lights the left, and a plate reads CASH FLOW. Moving: coins fall from both pipes into the
 * pile, the level rises and settles, coins drop from the spout into the crate, light runs down the
 * glass, the lamp breathes, dust rises.
 */
import type { PixelSprite } from '../types';
import { AA_AT, AA_PALETTE, aaBankersLamp, aaCharter, aaCompose, aaGlint, aaLampGlow, aaMote, aaOffsetFrames, aaPlaque, aaText } from './aa-kit';
import { aaFloor } from './aa-kit-a';
import { aaKeepsake } from './aa1-finish';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa5'], rows, ...(palette ? { palette } : {}) });

/** A coloured tag lettered in ink, hung by two strings unless it is painted on: [outline, field]. */
const tag = (id: string, text: string, outline: string, field: string, strung = true) => {
  const t = aaText(`${id}-text`, text, 'K').rows;
  const w = t[0].length + 4;
  return sprite(id, [
    ...(strung ? [`.x${'.'.repeat(w - 4)}x.`] : []),
    outline.repeat(w),
    ...t.map((r) => `${outline}${field}${r.replace(/\./g, field)}${field}${outline}`),
    outline.repeat(w),
  ]);
};

/** The cistern, 24 x 33: domed brass lid, glass body lit down its left side, brass foot, two legs. */
const tank = sprite('aa5-tank', [
  '.....OOOOOOOOOOOOOO.....',
  '...OOyyyyyyyyyyyyGGOO...',
  '.OOyGGGGGGGGGGGGGGGGgOO.',
  'OyGGGGGGGGGGGGGGGGGGGGgO',
  'OggggggggggggggggggggggO',
  ...Array.from({ length: 20 }, (_, i) => `Dx${i > 1 && i < 12 ? 'a' : '.'}${'.'.repeat(19)}XD`),
  'OyGGGGGGGGGGGGGGGGGGGGgO',
  'OggggggggggggggggggggggO',
  '.OOOOOOOOOOOOOOOOOOOOOO.',
  ...Array.from({ length: 5 }, () => '..OgO..............OgO..'),
  '.OOOOO............OOOOO.',
], AA_PALETTE);

/** Coins piled in the glass, 19 x 11, laid like bricks. */
const pile = sprite('aa5-pile', Array.from({ length: 11 }, (_, r) => {
  const shift = (Math.floor(r / 2) % 2) * 2;
  const pat = r % 2 ? 'gggO' : 'yGGg';
  return Array.from({ length: 19 }, (_, x) => pat[(x + shift) % 4]).join('');
}));

/** Brass pipe runs: `points` is the corner list of a 3-wide pipe, lit on top and left. */
const pipes = (() => {
  const cells = Array.from({ length: 16 }, () => Array.from({ length: 80 }, () => '.'));
  const put = (x: number, y: number, ch: string) => { if (y >= 0 && y < 16) cells[y][x] = ch; };
  for (let x = 0; x <= 33; x++) { put(x, 0, 'y'); put(x, 1, 'G'); put(x, 2, 'g'); }
  for (let x = 46; x < 80; x++) { put(x, 0, 'y'); put(x, 1, 'G'); put(x, 2, 'g'); }
  for (let y = 1; y < 16; y++) {
    put(31, y, 'y'); put(32, y, 'G'); put(33, y, 'g');
    put(46, y, 'y'); put(47, y, 'G'); put(48, y, 'g');
  }
  [10, 22, 58, 70].forEach((x) => { for (let y = 0; y < 3; y++) put(x, y, 'O'); });
  [30, 31, 32, 33, 34, 45, 46, 47, 48, 49].forEach((x) => put(x, 8, 'O'));
  return sprite('aa5-pipes', cells.map((r) => r.join('')));
})();

/** The spout from the tank's foot, a red valve wheel on it, its mouth turned down to the crate. */
const spout = sprite('aa5-spout', [
  '..RRR.',
  '...O..',
  'yyyyyO',
  'GGGGyO',
  'gggOGO',
  '...OOO',
]);

/** A red crate stencilled CFI on the floor, a steel cog half sunk in it: the equipment cash bought. */
const crate = aaCompose('aa5-crate', 15, 10, '.', [
  { sprite: sprite('aa5-cog', ['........DX.XD..', '.......DxXXXXD.', '......DxXXKXXXD']), x: 0, y: 0 },
  { sprite: tag('aa5-tag-cfi', 'CFI', '1', 'R', false), x: 0, y: 3 },
]);

/** A side table for the lamp. */
const sideTable = sprite('aa5-side-table', [
  'OOOOOOOOOOOOOOOOOOOO',
  'yGGGGGGGGGGGGGGGGGGg',
  'OOOOOOOOOOOOOOOOOOOO',
  ...Array.from({ length: 15 }, () => '.OgO............OgO.'),
  '.OOO............OOO.',
]);

const TANK = { x: 28, y: 23 };
const GLASS = { x: TANK.x + 3, y: TANK.y + 5 };
const LAMP = { x: 7, y: 25 };
const CRATE = { x: 52, y: 48 };

const base = aaCompose('aa5-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa5-floor', 80, [[4, 23], [28, 51], [52, 66]]), x: 0, y: 49 },
  { sprite: aaPlaque('aa5-opener-plate', 'CASH FLOW'), x: 20, y: 1 },
  { sprite: pipes, x: 0, y: 12 },
  { sprite: tag('aa5-tag-cfo', 'CFO', 'n', 'N'), x: 4, y: 15 },
  { sprite: tag('aa5-tag-cff', 'CFF', 'b', 'B'), x: 61, y: 15 },
  { sprite: aaCharter('aa5-charter', 'FCF'), x: 58, y: 27 },
  { sprite: sideTable, x: 4, y: 38 },
  { sprite: aaBankersLamp, ...LAMP },
  { sprite: tank, ...TANK },
  { sprite: pile, x: GLASS.x, y: GLASS.y + 9 },
  { sprite: spout, x: TANK.x + 23, y: TANK.y + 19 },
  { sprite: crate, ...CRATE },
]);

/** A coin falling from a pipe's mouth under the lid down to the pile. */
const coinFall: PixelSprite = {
  ...sprite('aa5-coin-fall', ['..', '..', '..', '..', '..', '..', '..', '..']),
  frames: [0, 2, 4, 6, null, null].map((at) => Array.from({ length: 8 }, (_, y) => (y === at ? 'yG' : at !== null && y === at + 1 ? 'gO' : '..'))),
  frameMs: 260,
};
const coinFallLater = aaOffsetFrames(coinFall, 'aa5-coin-fall-later', 3, 300);

/** A coin leaving by the spout and dropping into the crate. */
const spoutDrip: PixelSprite = {
  ...sprite('aa5-spout-drip', ['..', '..', '..', '..']),
  frames: [null, 0, 2, null, null].map((at) => Array.from({ length: 4 }, (_, y) => (y === at ? 'yG' : at !== null && y === at + 1 ? 'gO' : '..'))),
  frameMs: 340,
};

/** The top of the pile, which rises a coin and settles. */
const level = sprite('aa5-level', [Array.from({ length: 19 }, (_, x) => (x % 4 === 3 ? 'G' : 'y')).join('')]);

export const aa5Opener: SceneArt = {
  id: 'aa5-opener',
  label: 'Coins pour from two brass pipes tagged CFO and CFF into a glass cash tank, and drain from a spout into a crate tagged CFI, under a brass plate reading CASH FLOW.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: coinFall, x: GLASS.x + 1, y: GLASS.y },
    { sprite: coinFallLater, x: GLASS.x + 15, y: GLASS.y },
    { sprite: level, x: GLASS.x, y: GLASS.y + 8, motion: { kind: 'bob', amp: 1, periodMs: 2600 } },
    { sprite: spoutDrip, x: TANK.x + 27, y: TANK.y + 25 },
    { sprite: aaGlint, x: TANK.x, y: TANK.y + 5 },
    { sprite: aaLampGlow, x: LAMP.x + AA_AT.glowInLamp.x, y: LAMP.y + AA_AT.glowInLamp.y, motion: { kind: 'twinkle', periodMs: 3400, min: 0.35 } },
    { sprite: aaMote, x: 12, y: 34, motion: { kind: 'rise', amp: 5, periodMs: 2900 } },
    { sprite: aaMote, x: 20, y: 33, motion: { kind: 'rise', amp: 4, periodMs: 3400, phase: 0.5 } },
  ],
};

/** Lesson 5 emblem: a gilt tap pouring a coin. */
const emblemTap = sprite('aa-emblem-tap', [
  '................',
  '........OyyO....',
  '.........OO.....',
  'OOOOOOOOOOOOO...',
  'yyyyyyyyyyyyGO..',
  'GGGGGGGGGGGGGgO.',
  'ggggggggggOyGgO.',
  'OOOOOOOOOOOyGgO.',
  '..........OyGgO.',
  '..........OOOOO.',
  '................',
  '...........yG...',
  '................',
  '..........OyGO..',
  '..........OGgO..',
  '...........OO...',
]);

export const aa5Finish = aaKeepsake(
  'aa5-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped in gold with a tap pouring a coin, with small glints and check marks around it.',
  emblemTap,
);

export const art: LessonArtSet = { opener: aa5Opener, backdrop: aaBackdrop, finish: aa5Finish };
