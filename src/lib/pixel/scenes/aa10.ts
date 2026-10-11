/**
 * Applied Accounting lesson 10, the Foundations Checkpoint: every framework so far, joined up.
 *
 * The whole hall, and the bookkeeper on their feet in the middle of it holding the gold-bound tenth
 * volume. Five gilt frames hang in a row under a plate reading MASTERY, one for each layer of the
 * integrated analysis: the T-account, the ratio bars, the break-even cross, the auditor's tick and the
 * forensic glass. Banker's lamps stand on piles of the volumes already earned, between cases of
 * ledgers. Moving: the five frames light up one after another, gilt glints on the gold volume, both
 * lamps breathe, dust rises in their light, the bookkeeper blinks.
 *
 * The checkpoint keeps the pathway backdrop but lights it for the occasion (aa10Backdrop): both lamps
 * burn steady, and gilt runs along the cornices and the clock's crest, glinting in turn.
 */
import type { PixelSprite } from '../types';
import { AA_AT, AA_PALETTE, aaBankersLamp, aaBlink, aaBookcase, aaCompose, aaGlint, aaLampGlow, aaMote, aaPlaque } from './aa-kit';
import { aaFloor, aaFrame } from './aa-kit-a';
import { AA_AT_B, aaBookkeeperStanding, aaKeepsakeGold } from './aa-kit-b';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa10'], rows, ...(palette ? { palette } : {}) });

/** A case of ledgers cut to three shelves, 16 x 30: the cornice, the shelves named, the plinth. */
const shortCase = (id: string, shelves: number[]) => sprite(id, [
  ...aaBookcase.rows.slice(0, 4),
  ...shelves.flatMap((top) => aaBookcase.rows.slice(top, top + 8)),
  ...aaBookcase.rows.slice(44, 46),
]);

/** The volumes already earned, lying flat with their spines out, each a pixel off the last. */
const pile = (id: string, n: number) => sprite(id, Array.from({ length: n }, (_, i) => {
  const pad = i % 2 ? ['.', ''] : ['', '.'];
  return ['EqqyqqqqqqyqE', 'EPPGPPPPPPGPE', 'EppgppppppgpE'].map((r) => `${pad[0]}${r}${pad[1]}`);
}).flat());

/** The five layers of the integrated analysis, 8 x 8 each, `#` for the gilt. */
const LAYERS = [
  ['########', '...##...', '##.##.##', '...##...', '##.##.##', '...##...', '##.##...', '...##...'],
  ['......#.', '..#...#.', '..#...#.', '..#.#.#.', '#.#.#.#.', '#.#.#.#.', '#.#.#.#.', '########'],
  ['#......#', '#.....#.', '#....#..', '#..##...', '####....', '#.#.....', '##......', '########'],
  ['........', '.......#', '......##', '#....##.', '##..##..', '.####...', '..##....', '........'],
  ['.###....', '#...#...', '#...#...', '#...#...', '.###....', '....##..', '.....##.', '......##'],
];
const layer = (id: string, i: number, ink: string) => sprite(id, LAYERS[i].map((r) => r.replace(/#/g, ink)));

/**
 * The bookkeeper's hands round the gold volume, over rows 18 to 25 of aaBookkeeperStanding: the
 * sleeves come down past the elbows, the hands grip the boards, a dark plate on the cover.
 */
const heldVolume = sprite('aa10-held-volume', [
  '....OOOOOOOOOO....',
  '....OyyyyyyyGO....',
  '....OyGGGGGGgO....',
  '...SOyGOOOOGgOM...',
  '...SOyGOKKOGgOM...',
  '.PPpOyGOOOOGgOEpp.',
  '.PppOGgggggggOppp.',
  '....OOOOOOOOOO....',
]);

const FRAME_X = [1, 17, 33, 49, 65];
const FRAME_Y = 10;
const KEEPER = { x: 31, y: 25 };
const LAMPS = [{ x: 17, y: 34 }, { x: 50, y: 34 }];

const base = aaCompose('aa10-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa10-floor', 80, [[0, 30], [33, 79]]), x: 0, y: 49 },
  { sprite: aaPlaque('aa10-opener-plate', 'MASTERY'), x: 24, y: 0 },
  ...FRAME_X.flatMap((x, i) => [
    { sprite: aaFrame(`aa10-frame-${String(i + 1)}`, 14, 14, 'K'), x, y: FRAME_Y },
    { sprite: layer(`aa10-layer-${String(i + 1)}`, i, 'g'), x: x + 3, y: FRAME_Y + 3 },
  ]),
  { sprite: shortCase('aa10-case-left', [12, 28, 36]), x: 0, y: 27 },
  { sprite: shortCase('aa10-case-right', [4, 20, 36]), x: 64, y: 27 },
  { sprite: pile('aa10-pile-left', 3), x: 17, y: 48 },
  { sprite: pile('aa10-pile-right', 3), x: 49, y: 48 },
  ...LAMPS.map((at) => ({ sprite: aaBankersLamp, ...at })),
  { sprite: aaBookkeeperStanding, ...KEEPER },
  { sprite: heldVolume, x: KEEPER.x, y: KEEPER.y + AA_AT_B.propInHands.y },
]);

export const aa10Opener: SceneArt = {
  id: 'aa10-opener',
  label: 'The bookkeeper stands in the middle of the ledger hall holding a gold-bound ledger, under five gilt frames of the lessons so far and a brass plate reading MASTERY, between green lamps on piles of ledgers.',
  width: 80,
  height: 60,
  base,
  layers: [
    ...FRAME_X.map((x, i) => ({
      sprite: layer(`aa10-layer-lit-${String(i + 1)}`, i, 'y'),
      x: x + 3,
      y: FRAME_Y + 3,
      motion: { kind: 'twinkle' as const, periodMs: 4000, phase: i * 0.2, min: 0.1 },
    })),
    { sprite: aaGlint, x: KEEPER.x + 11, y: KEEPER.y + 16 },
    { sprite: aaBlink, x: KEEPER.x + AA_AT.blinkOnBookkeeper.x, y: KEEPER.y + AA_AT.blinkOnBookkeeper.y },
    ...LAMPS.map((at, i) => ({
      sprite: aaLampGlow,
      x: at.x + AA_AT.glowInLamp.x,
      y: at.y + AA_AT.glowInLamp.y,
      motion: { kind: 'twinkle' as const, periodMs: 3400 + i * 700, phase: i * 0.5, min: 0.35 },
    })),
    { sprite: aaMote, x: 21, y: 44, motion: { kind: 'rise', amp: 5, periodMs: 2900 } },
    { sprite: aaMote, x: 57, y: 43, motion: { kind: 'rise', amp: 4, periodMs: 3500, phase: 0.5 } },
  ],
};

/* ── the backdrop, lit for the checkpoint ───────────────────────────────────────────────────── */

/** Gilt that stays under the backdrop's luminance ceiling: a darker gold than any on the shelves. */
const GILT = { j: '#8F6218' };

/** A bulb burning under each hall lamp's shade, steady: the lamps are fully lit tonight. */
const hallBulb = sprite('aa10-hall-bulb', ['.jjjjjjj.', 'j.......j'], GILT);
const cornice = (id: string, w: number) => sprite(id, ['j'.repeat(w)], GILT);
const crest = sprite('aa10-hall-crest', ['..j..', '.j.j.', 'j.j.j'], GILT);

export const aa10Backdrop: SceneArt = {
  ...aaBackdrop,
  id: 'aa10-backdrop',
  label: 'A dark hall of tall bookcases full of ledgers at night, trimmed in gold, with both green lamps burning, a ticking clock and tally marks counting along the floor.',
  layers: [
    ...aaBackdrop.layers,
    { sprite: hallBulb, x: 0, y: 25, motion: { kind: 'twinkle', periodMs: 5200, min: 0.8 } },
    { sprite: hallBulb, x: 97, y: 25, motion: { kind: 'twinkle', periodMs: 5800, min: 0.8, phase: 0.5 } },
    { sprite: cornice('aa10-hall-cornice-a', 16), x: 11, y: 7, motion: { kind: 'twinkle', periodMs: 4600, min: 0.4 } },
    { sprite: cornice('aa10-hall-cornice-b', 16), x: 50, y: 16, motion: { kind: 'twinkle', periodMs: 4600, min: 0.4, phase: 0.33 } },
    { sprite: cornice('aa10-hall-cornice-c', 14), x: 81, y: 6, motion: { kind: 'twinkle', periodMs: 4600, min: 0.4, phase: 0.66 } },
    { sprite: crest, x: 40, y: 4, motion: { kind: 'twinkle', periodMs: 3800, min: 0.5, phase: 0.2 } },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** Lesson 10 emblem: a gilt laurel wreath tied with a red ribbon round a white star, the checkpoint passed. */
const emblemLaurel = (() => {
  const cells: string[][] = Array.from({ length: 16 }, () => Array.from({ length: 16 }, () => '.'));
  const put = (x: number, y: number, ch: string) => {
    cells[y][x] = ch;
  };
  // The left branch: a stem round the left of a circle, a 2 x 2 leaf outside it at each joint.
  const STEM = [[5, 2], [4, 3], [3, 4], [3, 5], [2, 6], [2, 7], [2, 8], [2, 9], [3, 10], [3, 11], [4, 12], [5, 13], [6, 13]];
  const LEAVES = [[4, 0], [2, 2], [0, 5], [0, 8], [1, 11]];
  for (const [x, y] of STEM) {
    put(x, y, 'g');
    put(15 - x, y, 'g');
  }
  for (const [x, y] of LEAVES) {
    [['y', 'G'], ['G', 'g']].forEach((r, dy) => r.forEach((ch, dx) => {
      put(x + dx, y + dy, ch);
      put(15 - x - dx, y + dy, dx ? 'G' : 'g');
    }));
  }
  ['......R..R......', '.....RR..RR.....'].forEach((r, i) => [...r].forEach((ch, x) => { if (ch !== '.') put(x, 14 + i, ch); }));
  ['...y...', '..yay..', 'yyaaayy', '.yaaay.', '.yy.yy.'].forEach((r, i) => [...r].forEach((ch, x) => { if (ch !== '.') put(x + 4, 5 + i, ch); }));
  return sprite('aa-emblem-laurel', cells.map((r) => r.join('')), AA_PALETTE);
})();

export const aa10Finish = aaKeepsakeGold(
  'aa10-finish',
  'A gold leather ledger with purple corners and a red ribbon bookmark, its cover stamped with a gilt laurel wreath round a white star, with small glints and check marks around it.',
  emblemLaurel,
);

export const art: LessonArtSet = { opener: aa10Opener, backdrop: aa10Backdrop, finish: aa10Finish };
