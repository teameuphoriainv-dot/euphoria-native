/**
 * Applied Accounting lesson 18, Consolidation & Group Accounting: a parent and the companies it
 * controls report as one.
 *
 * The hall's great window looks out on the group at night. In the middle stands the parent's tower,
 * gold-crowned and flying its flag, joined by lit skybridges to two subsidiaries under rooftop signs
 * of the share it owns, 100% and 80%; apart from them, joined to nothing, stands an affiliate it owns
 * 30% of. Control brings a whole company in: every window of both subsidiaries burns, but on the 80%
 * tower the last of its five columns burns blue instead of gold, the fifth that other owners hold
 * (the non-controlling interest), shown apart. The affiliate is only influenced, not controlled, so
 * only its owned share is lit, one column in three. On the desk below lie the subsidiaries' own books
 * and the one set the group reports, under a plate reading GROUP. Moving: stars and the signs' red
 * beacons twinkle, the parent's flag flies, two intercompany lines on the open ledger flash struck out
 * (eliminated on consolidation), gilt catches the light on the window frame.
 */
import type { PixelSprite } from '../types';
import { AA_PALETTE, aaCompose, aaDesk, aaGlint, aaInkwell, aaLedgerOpen, aaPlaque, aaText } from './aa-kit';
import { aaFloor, aaFrame } from './aa-kit-a';
import { aaKeepsake } from './aa1-finish';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa18'], rows, ...(palette ? { palette } : {}) });

/** The night outside: a navy sky, warmer along the horizon. */
const NIGHT = { L: '#1D2142', J: '#2B2550' };

/** The window's glass in scene pixels (aaFrame's field), the stars on it and the moon. */
const GLASS = { x: 5, y: 12, w: 70, h: 26 };
const STARS: [number, number, string][] = [[24, 13, 'a'], [59, 15, 'c'], [6, 23, 'c'], [73, 30, 'c'], [60, 27, 'a'], [48, 12, 'c']];
const MOON = { x: 68, y: 12, rows: ['.aaa.', 'aa...', 'a....', 'aa...', '.aaa.'] };
const sky = sprite('aa18-sky', Array.from({ length: GLASS.h }, (_, dy) => Array.from({ length: GLASS.w }, (_, dx) => {
  const x = GLASS.x + dx;
  const y = GLASS.y + dy;
  const star = STARS.find(([sx, sy]) => sx === x && sy === y);
  if (star) return star[2];
  const moon = MOON.rows[y - MOON.y]?.[x - MOON.x];
  if (moon && moon !== '.') return moon;
  return y >= 31 ? 'J' : 'L';
}).join('')), { ...AA_PALETTE, ...NIGHT });

/**
 * A tower of the group, front on and lit from the left: a window in each of `cols` columns on every
 * other floor, each column burning the colour `ink` gives it (gold, blue for other owners' share) or
 * dark.
 */
const tower = (id: string, cols: number, h: number, ink: (col: number) => string) => {
  const w = cols * 2 + 3;
  return sprite(id, Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => {
    if (y === 0 || x === 0) return 'X';
    if (x === w - 1) return 'k';
    if (y % 2 === 0 && x % 2 === 0 && x <= w - 3) return ink(x / 2 - 1);
    return 'D';
  }).join('')));
};

/** The parent's gold crown, stepped, on its roof; the flagpole rises from the top step. */
const crown = sprite('aa18-crown', [
  '......yGGGg......',
  '....yGGGGGGGg....',
  '..yGGGGGGGGGGGg..',
]);
const pole = sprite('aa18-pole', ['c', 'c', 'c'], AA_PALETTE);

/** A lit skybridge, 3 x 3: the companies joined into one group. */
const bridge = sprite('aa18-bridge', ['XXX', 'GGG', 'DDD']);

/** A rooftop sign on two posts: the share the parent owns, lit gold on a dark board. */
const roofSign = (id: string, text: string) => {
  const t = aaText(`${id}-text`, text, 'G').rows;
  const w = t[0].length + 2;
  const post = `..O${'.'.repeat(w - 6)}O..`;
  return sprite(id, ['O'.repeat(w), ...t.map((r) => `O${r.replace(/\./g, 'K')}O`), 'O'.repeat(w), post, post]);
};

/** The subsidiaries' own books lying on the desk to be combined: a blue volume on a teal one. */
const subBooks = sprite('aa18-sub-books', [
  '.DBByBBBBBByBD',
  '.DbbGbbbbbbGbD',
  '.DbbgbbbbbbgbD',
  'DTTyTTTTTTyTD.',
  'DttGttttttGtD.',
  'DttgttttttgtD.',
]);

const SUB_A = { x: 8, y: 21 };
const PARENT = { x: 24, y: 18 };
const SUB_B = { x: 44, y: 23 };
const AFFILIATE = { x: 63, y: 26 };
const LEDGER = { x: 23, y: 33 };

const base = aaCompose('aa18-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa18-floor', 80, [[3, 76]]), x: 0, y: 49 },
  { sprite: aaPlaque('aa18-opener-plate', 'GROUP'), x: 29, y: 1 },
  { sprite: aaFrame('aa18-window', 74, 30, 'L'), x: 3, y: 10 },
  { sprite: sky, x: GLASS.x, y: GLASS.y },
  { sprite: tower('aa18-sub-a', 5, 17, () => 'G'), ...SUB_A },
  { sprite: tower('aa18-parent', 7, 20, () => 'G'), ...PARENT },
  { sprite: crown, x: PARENT.x, y: PARENT.y - 3 },
  { sprite: pole, x: PARENT.x + 8, y: PARENT.y - 6 },
  { sprite: tower('aa18-sub-b', 5, 15, (c) => (c < 4 ? 'G' : 'B')), ...SUB_B },
  { sprite: tower('aa18-affiliate', 3, 12, (c) => (c === 0 ? 'G' : 'K')), ...AFFILIATE },
  { sprite: bridge, x: 21, y: 27 },
  { sprite: bridge, x: 41, y: 29 },
  { sprite: roofSign('aa18-sign-a', '100%'), x: SUB_A.x - 2, y: SUB_A.y - 9 },
  { sprite: roofSign('aa18-sign-b', '80%'), x: SUB_B.x, y: SUB_B.y - 9 },
  { sprite: roofSign('aa18-sign-affiliate', '30%'), x: AFFILIATE.x - 2, y: AFFILIATE.y - 9 },
  { sprite: aaDesk, x: 4, y: 38 },
  { sprite: subBooks, x: 7, y: 40 },
  { sprite: aaLedgerOpen, ...LEDGER },
  { sprite: aaInkwell, x: 62, y: 41 },
]);

/** The parent's flag flying from the pole top. */
const flag: PixelSprite = {
  ...sprite('aa18-flag', ['PPPq', 'PPPP', 'pp..']),
  frames: [['PPPq', 'PPPP', 'pp..'], ['PPP.', 'PPPq', 'pPPP']],
  frameMs: 520,
};
const beacon = sprite('aa18-beacon', ['R']);
const star = sprite('aa18-star', ['a'], AA_PALETTE);
/** Two intercompany lines on the journal page, struck through in red: eliminated on consolidation. */
const strike = sprite('aa18-strike', ['RRRRRRRRRRRR', '............', 'RRRRRRRRRRRR']);

export const aa18Opener: SceneArt = {
  id: 'aa18-opener',
  label: "Through a great window, a night city: the parent's gold-crowned tower joined by lit bridges to two fully lit subsidiaries signed 100% and 80%, the 80% tower's last column of windows lit blue for its other owners, an affiliate signed 30% standing apart with one column lit, and on the desk below one open ledger under a brass plate reading GROUP.",
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: flag, x: PARENT.x + 9, y: PARENT.y - 6 },
    { sprite: beacon, x: SUB_A.x - 2, y: SUB_A.y - 9, motion: { kind: 'twinkle', periodMs: 1600, min: 0 } },
    { sprite: beacon, x: SUB_B.x + 12, y: SUB_B.y - 9, motion: { kind: 'twinkle', periodMs: 1600, phase: 0.5, min: 0 } },
    { sprite: star, x: 41, y: 13, motion: { kind: 'twinkle', periodMs: 2600, min: 0.1 } },
    { sprite: star, x: 63, y: 13, motion: { kind: 'twinkle', periodMs: 3300, phase: 0.4, min: 0.1 } },
    { sprite: star, x: 58, y: 21, motion: { kind: 'twinkle', periodMs: 2900, phase: 0.7, min: 0.1 } },
    { sprite: strike, x: LEDGER.x + 4, y: LEDGER.y + 4, motion: { kind: 'twinkle', periodMs: 2400, min: 0 } },
    { sprite: aaGlint, x: 1, y: 8, motion: { kind: 'twinkle', periodMs: 3000, min: 0.4 } },
  ],
};

/** Lesson 18 emblem: a gilt family tree, the parent's white box over its three companies. */
const emblemGroup = sprite('aa-emblem-group', [
  '....OOOOOOOO....',
  '....OyyyyyyO....',
  '....OGaaaagO....',
  '....OGaaaagO....',
  '....OOOOOOOO....',
  '.......yG.......',
  '.......yG.......',
  '..yGGGGGGGGGGg..',
  '..gggggggggggg..',
  '..yG...yG...yG..',
  '..yG...yG...yG..',
  '.OOOO.OOOO.OOOO.',
  '.OyGO.OyGO.OyGO.',
  '.OGgO.OGgO.OGgO.',
  '.OGgO.OGgO.OGgO.',
  '.OOOO.OOOO.OOOO.',
], AA_PALETTE);

export const aa18Finish = aaKeepsake(
  'aa18-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped in gold with a family tree of one box above three, with small glints and check marks around it.',
  emblemGroup,
);

export const art: LessonArtSet = { opener: aa18Opener, backdrop: aaBackdrop, finish: aa18Finish };
