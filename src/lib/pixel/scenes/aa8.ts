/**
 * Applied Accounting lesson 8, Auditing & Internal Controls: someone independent checks the books.
 *
 * Two people, not one. The bookkeeper who kept the books stands back by his filing cabinet, the
 * client files stacked on top of it, hands off. At the desk sits the outside auditor, plainly someone
 * else: silver hair and no eyeshade, spectacles, a charcoal suit and a blue tie, his briefcase under
 * the desk. He has the ledger open in front of him, both pages ruled with entries, and he ticks the
 * figures one by one ("tick and tie", substantive testing). Pinned to the wall between them is the
 * audit programme, headed SOX, three controls to test and a box for each, under a plate reading
 * AUDIT. Moving: the programme's boxes are ticked one after another, the auditor's pen ticks down the
 * page, light catches the plate, the bookkeeper blinks, dust rises.
 */
import type { PixelSprite } from '../types';
import { AA_AT, AA_PALETTE, aaBlink, aaCompose, aaDesk, aaGlint, aaMote, aaPlaque, aaText } from './aa-kit';
import { aaFilingCabinet, aaFloor } from './aa-kit-a';
import { aaBookkeeperStanding } from './aa-kit-b';
import { aaKeepsake } from './aa1-finish';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa8'], rows, ...(palette ? { palette } : {}) });

/** The audit programme, 20 x 25: SOX at the head, three controls, an empty box beside each. */
const BOX_ROWS = [10, 15, 20];
const programme = aaCompose('aa8-programme', 20, 25, '.', [
  { sprite: sprite('aa8-programme-sheet', Array.from({ length: 25 }, (_, y) => {
    if (y === 24) return 'c'.repeat(20);
    if (y === 8) return `aa${'E'.repeat(16)}ac`;
    const box = BOX_ROWS.find((b) => y >= b && y < b + 4);
    if (box === undefined) return `${'a'.repeat(19)}c`;
    const edge = y === box || y === box + 3;
    return `aa${edge ? 'kkkk' : 'kaak'}aa${y === box + 2 ? 'XXXXXXXXX' : 'aaaaaaaaa'}aac`;
  }), AA_PALETTE), x: 0, y: 0 },
  { sprite: aaText('aa8-programme-head', 'SOX', 'E'), x: 4, y: 2 },
]);

/** Client files stacked on the cabinet, pale manila with gilt edges. */
const files = sprite('aa8-files', [
  '..yG.............',
  'OOOOOOOOOOOOOOOO.',
  'OyyyyyyyyyyyyyGO.',
  'OOOOOOOOOOOOOOOO.',
  '.OyyyyaaaayyyyyGO',
  '.OOOOOOOOOOOOOOOO',
  'OyyyyyyyyyyyyyGO.',
  'OOOOOOOOOOOOOOOO.',
  '.OyyyyyyyyaaayyGO',
  '.OOOOOOOOOOOOOOOO',
], AA_PALETTE);

const pin = sprite('aa8-pin', ['RR', 'rR']);

/**
 * The client's ledger open on the desk, 35 x 14, both pages ruled with entries and their figures:
 * the books under test, not lesson 1's T-account. Entry lines sit on rows 2, 4, 6 and 8, with a gap
 * between each entry and its figure where the auditor's tick goes.
 */
const LINES = [2, 4, 6, 8];
const ledger = sprite('aa8-ledger', [
  '.aaaaaaaaaaaaaaa...aaaaaaaaaaaaaaa.',
  ...Array.from({ length: 10 }, (_, y) => {
    const r = y + 1;
    const lined = LINES.includes(r);
    const left = lined ? `aara${r % 4 ? 'XXXX' : 'XXXa'}aaaXXXa` : 'aaraaaaaaaaaaaa';
    const right = lined ? `aaXXXXX${r % 4 ? 'XX' : 'aa'}aaaXXa` : 'a'.repeat(15);
    return `P${left}cXc${right}p`;
  }),
  'PccccccccccccccccXccccccccccccccccp',
  'EPPPPPPPPPPPPPPPPpppppppppppppppppE',
  '.EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE.',
], AA_PALETTE);

/**
 * The outside auditor, 18 x 20, seated, front on, the same build as aaBookkeeper and nothing else
 * alike: silver hair with a side parting and no eyeshade, spectacles, eyes turned toward the
 * bookkeeper, a level mouth, a charcoal suit over a white shirt and blue tie, a white pocket square.
 */
const auditor = sprite('aa8-auditor', [
  '......XXXXXX......',
  '....XXxxxxxxXX....',
  '...XxxxxxxxxxxX...',
  '..XxxxxxxxxxxxxX..',
  '..XxxXXXXxxxxxxX..',
  '..XxXMMMMMMMMXxX..',
  '...XMSSSSSSSSSMX..',
  '...SXXXXSSXXXXMM..',
  '...SXKWXXXXKWXMM..',
  '..SSSSSSSSSSSMMM..',
  '...SSSSSSSSSSMM...',
  '....SSSSSSSSMM....',
  '.....SSkkkSMM.....',
  '......SSSSMM......',
  '.......SSMM.......',
  '....XXwwBbwwDD....',
  '.XXXXXxwBbwDDDDDD.',
  'XXXXXXXxBbDDDDaDD.',
  'XXXXXXXXBbDDDDDDD.',
  'XXXXXXXXBDDDDDDDD.',
], AA_PALETTE);

/** His other hand flat on the right-hand page, a charcoal cuff over it. */
const auditorHand = sprite('aa8-auditor-hand', [
  'XXD',
  'XXD',
  'SSM',
  'SMM',
], AA_PALETTE);

/** A black leather briefcase standing under the desk, brass clasp, the handle up. */
const briefcase = sprite('aa8-briefcase', [
  '....DDD....',
  '...D...D...',
  'DDDDDDDDDDD',
  'DXXXXXXXXXD',
  'DXXXXyXXXXD',
  'DDDDDGDDDDD',
  'DXXXXXXXXXD',
  'DDDDDDDDDDD',
], AA_PALETTE);

const PROGRAMME = { x: 34, y: 3 };
const LEDGER = { x: 44, y: 31 };
const AUDITOR = { x: LEDGER.x + AA_AT.bookkeeperOverLedger.x, y: LEDGER.y + AA_AT.bookkeeperOverLedger.y };
const KEEPER = { x: 17, y: 25 };
const PLATE = { x: 56, y: 1 };
const DESK = { x: 38, y: 36 };

const base = aaCompose('aa8-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa8-floor', 80, [[1, 16], [19, 32], [38, 79]]), x: 0, y: 49 },
  { sprite: aaFilingCabinet, x: 1, y: 24 },
  { sprite: files, x: 0, y: 14 },
  { sprite: programme, ...PROGRAMME },
  { sprite: pin, x: PROGRAMME.x + 9, y: PROGRAMME.y - 1 },
  { sprite: aaPlaque('aa8-opener-plate', 'AUDIT'), ...PLATE },
  { sprite: auditor, ...AUDITOR },
  { sprite: aaDesk, ...DESK },
  { sprite: briefcase, x: DESK.x + 22, y: DESK.y + 14 },
  { sprite: ledger, ...LEDGER },
  { sprite: auditorHand, x: LEDGER.x + 24, y: LEDGER.y + 1 },
  { sprite: aaBookkeeperStanding, ...KEEPER },
]);

/** The programme's boxes ticked in turn, bold green ticks that spill out of each box, then a fresh sheet. */
const TICK = ['.....n', '....nn', 'n..nn.', 'nnnn..', '.nn...'];
const ticks: PixelSprite = (() => {
  const frame = (n: number) => Array.from({ length: 15 }, (_, y) => Array.from({ length: 6 }, (_, x) => {
    const k = Math.floor(y / 5);
    return k < n ? TICK[y % 5][x] : '.';
  }).join(''));
  return { ...sprite('aa8-ticks', frame(3)), frames: [frame(0), frame(1), frame(1), frame(2), frame(2), frame(3), frame(3), frame(3)], frameMs: 650 };
})();

/**
 * The auditor's pen ticking down the left-hand page: the hand (charcoal cuff, pen held low) stops at
 * each entry, a green tick appears in the gap before its figure, and on to the next. 5 x 12, over
 * ledger columns 9 to 13 from two rows above the page.
 */
const PEN = { col: 9, row: -2, w: 5, h: 12 };
const penTicks: PixelSprite = (() => {
  const frame = (at: number, done: number) => {
    const cells = Array.from({ length: PEN.h }, () => Array.from({ length: PEN.w }, () => '.'));
    const put = (col: number, row: number, ch: string) => { cells[row - PEN.row][col - PEN.col] = ch; };
    LINES.slice(0, done).forEach((r) => { put(11, r - 1, 'n'); put(9, r, 'n'); put(10, r, 'n'); });
    if (at < LINES.length) {
      const r = LINES[at];
      put(10, r, 'K');
      put(11, r - 1, 'k');
      ['SSM', 'SMM'].forEach((row, dy) => [...row].forEach((ch, dx) => put(11 + dx, r - 3 + dy, ch)));
      ['XXD'].forEach((row) => [...row].forEach((ch, dx) => put(11 + dx, r - 4, ch)));
    }
    return cells.map((r) => r.join(''));
  };
  const frames = [frame(0, 0), frame(0, 1), frame(1, 1), frame(1, 2), frame(2, 2), frame(2, 3), frame(3, 3), frame(3, 4), frame(3, 4), frame(3, 4)];
  return { ...sprite('aa8-pen-ticks', frames[7], AA_PALETTE), frames, frameMs: 480 };
})();

export const aa8Opener: SceneArt = {
  id: 'aa8-opener',
  label: "An outside auditor in a grey suit and spectacles ticks off the figures in the bookkeeper's ledger while the bookkeeper stands back by the filing cabinet, between them a pinned SOX programme whose boxes get ticked, under a brass plate reading AUDIT.",
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: ticks, x: PROGRAMME.x + 2, y: PROGRAMME.y + BOX_ROWS[0] - 1 },
    { sprite: penTicks, x: LEDGER.x + PEN.col, y: LEDGER.y + PEN.row },
    { sprite: aaGlint, x: PLATE.x - 2, y: PLATE.y + 5, motion: { kind: 'twinkle', periodMs: 2800, min: 0.4 } },
    { sprite: aaBlink, x: KEEPER.x + AA_AT.blinkOnBookkeeper.x, y: KEEPER.y + AA_AT.blinkOnBookkeeper.y },
    { sprite: aaMote, x: 37, y: 31, motion: { kind: 'rise', amp: 5, periodMs: 3000 } },
    { sprite: aaMote, x: 15, y: 40, motion: { kind: 'rise', amp: 4, periodMs: 3600, phase: 0.5 } },
  ],
};

/**
 * Lesson 8 emblem: the pinned programme in miniature. A gilt sheet headed SOX, its letters cut in
 * like the hall's brass plates, and three ruled lines, each with its control's box filled in green.
 */
const emblemProgramme = (() => {
  const head = aaText('aa-emblem-programme-head', 'SOX', 'K').rows.map((r) => `Oy${r.replace(/\./g, 'G')}gO`);
  const gap = `Oy${'G'.repeat(11)}gO`;
  const item = [`OyNNG${'K'.repeat(8)}gO`, `Oynn${'G'.repeat(9)}gO`];
  return sprite('aa-emblem-programme', ['O'.repeat(15), ...head, gap, ...item, gap, ...item, gap, ...item, 'O'.repeat(15)]);
})();

export const aa8Finish = aaKeepsake(
  'aa8-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped with a gold checklist headed SOX, three ruled lines each beside a box filled in green, with small glints and check marks around it.',
  emblemProgramme,
);

export const art: LessonArtSet = { opener: aa8Opener, backdrop: aaBackdrop, finish: aa8Finish };
