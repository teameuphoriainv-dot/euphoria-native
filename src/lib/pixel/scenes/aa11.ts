/**
 * Applied Accounting lesson 11, Revenue Recognition & Accrual Accounting: revenue counts when it is
 * earned, not when the cash comes in.
 *
 * A slate board in a gilt frame carries the recognition timeline: the contract signed under a red
 * seal, the work delivered as a tied parcel, the revenue recognised (a gold REV stamp) and, last, the
 * cash received in a coin bag. The bookkeeper stands at the right with a raised pointer on the REV
 * stamp, under a plate reading ACCRUAL, and below the board the open ledger lies on a sideboard,
 * the entry going in now. Moving: a gold marker walks the timeline from contract to cash, the REV
 * stamp glows, a coin drops into the bag at the end, the quill writes, the pointer's tip catches the
 * light, the clock's minute hand goes round, the bookkeeper blinks.
 */
import type { PixelSprite } from '../types';
import { AA_AT, AA_PALETTE, aaBlink, aaCompose, aaGlint, aaInkwell, aaLedgerOpen, aaMote, aaPlaque, aaQuillWriting, aaText } from './aa-kit';
import { aaFloor, aaFrame } from './aa-kit-a';
import { aaBookkeeperStanding, aaCoinBag } from './aa-kit-b';
import { aaKeepsake } from './aa1-finish';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa11'], rows, ...(palette ? { palette } : {}) });

/** Kraft paper for the parcel. */
const KRAFT = { u: '#C49A6C', v: '#8E6A44' };

/** Station 1: the contract, a sheet of terms under a red wax seal. */
const contract = sprite('aa11-contract', [
  'aaaaaaac..',
  'aXXXXXac..',
  'aaaaaaac..',
  'aXXXXaac..',
  'aaaaaaac..',
  'aXXXXXac..',
  'aaaaa22...',
  'aaaa2R22..',
  'cccc2222..',
  '.....22...',
], AA_PALETTE);

/** Station 2: the work delivered, a kraft parcel tied with string. */
const parcel = sprite('aa11-parcel', [
  '....a.a...',
  '.....a....',
  'uuuuuauuuv',
  'uuuuuauuuv',
  'aaaaaaaaaa',
  'uuuuuauuuv',
  'uuuuuauuuv',
  'vvvvvavvvv',
], { ...AA_PALETTE, ...KRAFT });

/** Station 3: the revenue recognised, REV struck in a gilt box. */
const STAMP_W = 15;
const stamp = aaCompose('aa11-stamp', STAMP_W, 9, '.', [
  { sprite: sprite('aa11-stamp-box', [
    'G'.repeat(STAMP_W),
    `G${'.'.repeat(STAMP_W - 2)}g`,
    ...Array.from({ length: 5 }, () => `G${'.'.repeat(STAMP_W - 2)}g`),
    `G${'.'.repeat(STAMP_W - 2)}g`,
    'g'.repeat(STAMP_W),
  ]), x: 0, y: 0 },
  { sprite: aaText('aa11-stamp-text', 'REV', 'y'), x: 2, y: 2 },
]);
/** The stamp struck bright: gilt to pale gold, the letters to white. */
const STRUCK: Record<string, string> = { G: 'y', g: 'y', y: 'a' };
const stampLit = sprite('aa11-stamp-lit', stamp.rows.map((r) => [...r].map((ch) => STRUCK[ch] ?? ch).join('')), AA_PALETTE);

/** The timeline board, 60 x 23: the four stations over an arrow, a tick under each. */
const BOARD = { x: 1, y: 10, w: 60, h: 23 };
const STATION_X = [10, 24, 38, 52];
const ARROW_Y = 27;
const arrow = sprite('aa11-arrow', Array.from({ length: 5 }, (_, dy) => Array.from({ length: 54 }, (_, dx) => {
  const x = dx + 4;
  const y = ARROW_Y - 2 + dy;
  if (y === ARROW_Y && x <= 56) return 'c';
  if (STATION_X.includes(x) && Math.abs(y - ARROW_Y) <= 1) return 'c';
  if (x >= 54 && x - 54 === 2 - Math.abs(y - ARROW_Y)) return 'c';
  return '.';
}).join('')), AA_PALETTE);

/** A low sideboard, 50 x 12, green leather on top, two drawers with brass pulls. */
const sideboard = sprite('aa11-sideboard', [
  'O'.repeat(50),
  `O${'n'.repeat(48)}O`,
  `O${'n'.repeat(48)}O`,
  `y${'G'.repeat(48)}g`,
  'O'.repeat(50),
  `O${'g'.repeat(23)}O${'g'.repeat(24)}O`,
  `Og${'O'.repeat(22)}Og${'O'.repeat(23)}O`,
  `Og${'O'.repeat(10)}yy${'O'.repeat(10)}Og${'O'.repeat(10)}yy${'O'.repeat(11)}O`,
  `Og${'O'.repeat(22)}Og${'O'.repeat(23)}O`,
  `Og${'O'.repeat(22)}Og${'O'.repeat(23)}O`,
  'O'.repeat(50),
  `.OO${'.'.repeat(44)}OO.`,
]);

/**
 * The bookkeeper's left arm raised toward the board, the hand round the pointer, and the wall and
 * skirting painted back where the arm hung (aaBookkeeperStanding's columns 1 and 2).
 */
const raisedArm = sprite('aa11-raised-arm', [
  '.SS......',
  'SSM......',
  '.PPP.....',
  '..PPP....',
  '...PPp...',
  '....PPp..',
  '.....PPp.',
  '......PPp',
  '.......kk',
  '.......kk',
  '.......kk',
  '.......kk',
  '.......kk',
  '.......kk',
  '.......kk',
  '.......gg',
]);

const KEEPER = { x: 62, y: 25 };
const ARM = { x: KEEPER.x - 6, y: KEEPER.y + 9 };
const POINTER_TIP = { x: 46, y: 24 };
const pointer = sprite('aa11-pointer', Array.from({ length: ARM.y - POINTER_TIP.y }, (_, dy) =>
  Array.from({ length: ARM.x - POINTER_TIP.x }, (_, dx) => (dx === dy ? (dx ? 'G' : 'y') : '.')).join('')));

const LEDGER = { x: 12, y: 34 };

/** A wall clock, 13 x 13: brass rim, white face, the hour hand at twelve; the minute hand rides as a layer. */
const CLOCK = { x: 65, y: 5 };
const clock = sprite('aa11-clock', Array.from({ length: 13 }, (_, y) => Array.from({ length: 13 }, (_, x) => {
  const d = Math.hypot(x - 6, y - 6);
  if (d > 6.5) return '.';
  if (d > 5.3) return x + y < 11 ? 'G' : 'O';
  if (x === 6 && y >= 3 && y <= 6) return 'K';
  if (d > 4.3 && (x === 6 || y === 6)) return 'X';
  return 'a';
}).join('')), AA_PALETTE);

/** The minute hand going round, eight steps to the hour. */
const HAND_STEPS = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
const minuteHand: PixelSprite = (() => {
  const frame = ([dx, dy]: number[]) => Array.from({ length: 13 }, (_, y) => Array.from({ length: 13 }, (_, x) =>
    [1, 2, 3, 4].some((k) => x === 6 + dx * k && y === 6 + dy * k) ? 'k' : '.').join(''));
  return { ...sprite('aa11-minute-hand', frame(HAND_STEPS[0])), frames: HAND_STEPS.map(frame), frameMs: 900 };
})();

const base = aaCompose('aa11-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa11-floor', 80, [[5, 53], [64, 77]]), x: 0, y: 49 },
  { sprite: aaPlaque('aa11-opener-plate', 'ACCRUAL'), x: 15, y: 0 },
  { sprite: aaFrame('aa11-board', BOARD.w, BOARD.h, 'K'), x: BOARD.x, y: BOARD.y },
  { sprite: clock, ...CLOCK },
  { sprite: contract, x: STATION_X[0] - 4, y: 15 },
  { sprite: parcel, x: STATION_X[1] - 5, y: 17 },
  { sprite: stamp, x: STATION_X[2] - 7, y: 16 },
  { sprite: aaCoinBag, x: STATION_X[3] - 5, y: 13 },
  { sprite: arrow, x: 4, y: ARROW_Y - 2 },
  { sprite: sideboard, x: 4, y: 45 },
  { sprite: aaLedgerOpen, ...LEDGER },
  { sprite: aaInkwell, x: 48, y: 42 },
  { sprite: aaBookkeeperStanding, ...KEEPER },
  { sprite: pointer, ...POINTER_TIP },
  { sprite: raisedArm, ...ARM },
]);

/** The marker walking the timeline: a gold bead stops at each station's tick, then starts again. */
const MARK = ['.y.', 'yGg', '.g.'];
const marker: PixelSprite = (() => {
  const w = STATION_X[3] - STATION_X[0] + 3;
  const at = (x: number) => MARK.map((r) => `${'.'.repeat(x)}${r}${'.'.repeat(w - x - 3)}`);
  const stops = STATION_X.map((x) => x - STATION_X[0]);
  const frames = stops.flatMap((s, i) => (i < 3 ? [at(s), at(s), at(s + 5), at(s + 9)] : [at(s), at(s), at(s)]));
  return { ...sprite('aa11-marker', at(0)), frames, frameMs: 420 };
})();

/** A coin dropping into the bag's mouth once the marker reaches the cash. */
const coin: PixelSprite = {
  ...sprite('aa11-coin', ['...', '...', '...', '...']),
  frames: [
    ...Array.from({ length: 11 }, () => ['...', '...', '...', '...']),
    ['yGg', '...', '...', '...'],
    ['...', 'yGg', '...', '...'],
    ['...', '...', '.G.', '...'],
    ['...', '...', '...', '.g.'],
  ],
  frameMs: 420,
};

export const aa11Opener: SceneArt = {
  id: 'aa11-opener',
  label: 'The bookkeeper points at a gold REV stamp on a timeline board that runs from a sealed contract and a delivered parcel to a bag of cash, under a brass plate reading ACCRUAL, while a quill writes the entry in a ledger below.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: marker, x: STATION_X[0] - 1, y: ARROW_Y - 1 },
    { sprite: stampLit, x: STATION_X[2] - 7, y: 16, motion: { kind: 'twinkle', periodMs: 2600, min: 0.15 } },
    { sprite: coin, x: STATION_X[3] - 1, y: 12 },
    { sprite: minuteHand, ...CLOCK },
    { sprite: aaQuillWriting, x: LEDGER.x + AA_AT.quillOnLedger.x, y: LEDGER.y + AA_AT.quillOnLedger.y },
    { sprite: aaGlint, x: POINTER_TIP.x - 2, y: POINTER_TIP.y - 2, motion: { kind: 'twinkle', periodMs: 2200, min: 0.5 } },
    { sprite: aaBlink, x: KEEPER.x + AA_AT.blinkOnBookkeeper.x, y: KEEPER.y + AA_AT.blinkOnBookkeeper.y },
    { sprite: aaMote, x: 58, y: 44, motion: { kind: 'rise', amp: 5, periodMs: 3100 } },
  ],
};

/** Lesson 11 emblem: a gilt hourglass, most of its sand run through, because timing is the whole lesson. */
const emblemHourglass = sprite('aa-emblem-hourglass', [
  'gGGGGGGGGGGGGGGg',
  'OOOOOOOOOOOOOOOO',
  '.yy..........gg.',
  '.yya.........gg.',
  '..yy........gg..',
  '...yy.GGGG.gg...',
  '....yy.GG.gg....',
  '.....yyGggg.....',
  '.....yyG.gg.....',
  '....yy.G..gg....',
  '...yy..G...gg...',
  '..yy..GGGG..gg..',
  '.yy.GGGGGGGG.gg.',
  '.yyGGGGGGGGGGgg.',
  'gGGGGGGGGGGGGGGg',
  'OOOOOOOOOOOOOOOO',
], AA_PALETTE);

export const aa11Finish = aaKeepsake(
  'aa11-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped in gold with an hourglass whose sand has nearly run through, with small glints and check marks around it.',
  emblemHourglass,
);

export const art: LessonArtSet = { opener: aa11Opener, backdrop: aaBackdrop, finish: aa11Finish };
