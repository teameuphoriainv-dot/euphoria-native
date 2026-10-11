/**
 * Applied Accounting lesson 8, Auditing & Internal Controls: someone independent checks the books.
 *
 * The audit room, the hall turned round: a steel filing cabinet at the left with its top drawer
 * pulled, a stack of client files on the desk, and at the far end the auditor over the open ledger
 * with a reading glass laid on the page, under a plate reading AUDIT. Pinned to the wall between them
 * is the audit programme, headed SOX, three controls to test and a box for each. Moving: the boxes
 * are ticked one after another, the glass slides along the entries, light catches the plate, the
 * auditor blinks, dust rises.
 */
import type { PixelSprite } from '../types';
import { AA_AT, AA_PALETTE, aaBlink, aaBookkeeper, aaCompose, aaDesk, aaGlint, aaHandRest, aaLedgerOpen, aaMote, aaPlaque, aaText } from './aa-kit';
import { aaFilingCabinet, aaFloor, aaMagnifier } from './aa-kit-a';
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

/** Client files on the desk, pale manila with gilt edges. */
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

const PROGRAMME = { x: 23, y: 4 };
const LEDGER = { x: 43, y: 31 };
const KEEPER = { x: LEDGER.x + AA_AT.bookkeeperOverLedger.x, y: LEDGER.y + AA_AT.bookkeeperOverLedger.y };
const PLATE = { x: 53, y: 1 };

const base = aaCompose('aa8-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa8-floor', 80, [[1, 16], [18, 79]]), x: 0, y: 49 },
  { sprite: aaFilingCabinet, x: 1, y: 24 },
  { sprite: programme, ...PROGRAMME },
  { sprite: pin, x: PROGRAMME.x + 9, y: PROGRAMME.y - 1 },
  { sprite: aaPlaque('aa8-opener-plate', 'AUDIT'), ...PLATE },
  { sprite: aaBookkeeper, ...KEEPER },
  { sprite: aaDesk, x: 17, y: 36 },
  { sprite: files, x: 20, y: 31 },
  { sprite: aaLedgerOpen, ...LEDGER },
  { sprite: aaHandRest, x: LEDGER.x + 21, y: LEDGER.y },
]);

/** The programme's boxes ticked in turn, then held, then a fresh sheet. */
const TICK = ['....n', '...n.', 'n.n..', '.n...'];
const ticks: PixelSprite = (() => {
  const frame = (n: number) => Array.from({ length: 14 }, (_, y) => Array.from({ length: 5 }, (_, x) => {
    const k = Math.floor(y / 5);
    return k < n && y % 5 < 4 ? TICK[y % 5][x] : '.';
  }).join(''));
  return { ...sprite('aa8-ticks', frame(3)), frames: [frame(0), frame(1), frame(1), frame(2), frame(2), frame(3), frame(3), frame(3)], frameMs: 650 };
})();

export const aa8Opener: SceneArt = {
  id: 'aa8-opener',
  label: 'An auditor slides a reading glass over an open ledger at a desk stacked with files, beside a filing cabinet and a pinned SOX checklist whose boxes get ticked, under a brass plate reading AUDIT.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: ticks, x: PROGRAMME.x + 2, y: PROGRAMME.y + BOX_ROWS[0] - 1 },
    { sprite: aaMagnifier, x: LEDGER.x + 2, y: LEDGER.y - 1, motion: { kind: 'drift', amp: 2, periodMs: 3600 } },
    { sprite: aaGlint, x: PLATE.x - 2, y: PLATE.y + 5, motion: { kind: 'twinkle', periodMs: 2800, min: 0.4 } },
    { sprite: aaBlink, x: KEEPER.x + AA_AT.blinkOnBookkeeper.x, y: KEEPER.y + AA_AT.blinkOnBookkeeper.y },
    { sprite: aaMote, x: 40, y: 30, motion: { kind: 'rise', amp: 5, periodMs: 3000 } },
    { sprite: aaMote, x: 18, y: 28, motion: { kind: 'rise', amp: 4, periodMs: 3600, phase: 0.5 } },
  ],
};

/** Lesson 8 emblem: a gilt seal with a tick, the clean opinion. */
const emblemSeal = (() => {
  const cells: string[][] = Array.from({ length: 16 }, (_, y) => Array.from({ length: 16 }, (_, x) => {
    const d = Math.hypot(x - 7.5, y - 7.5);
    if (d > 7.6) return '.';
    if (d > 6.6) return 'O';
    if (d > 5.4) return x + y < 14 ? 'y' : x + y > 16 ? 'g' : 'G';
    return d > 4.6 ? 'O' : '.';
  }));
  [[4, 7], [5, 8], [6, 9], [7, 8], [8, 7], [9, 6], [10, 5], [11, 4]].forEach(([x, y]) => {
    cells[y][x] = 'y';
    cells[y + 1][x] = 'G';
  });
  return sprite('aa-emblem-seal', cells.map((r) => r.join('')));
})();

export const aa8Finish = aaKeepsake(
  'aa8-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped in gold with a round seal holding a tick, with small glints and check marks around it.',
  emblemSeal,
);

export const art: LessonArtSet = { opener: aa8Opener, backdrop: aaBackdrop, finish: aa8Finish };
