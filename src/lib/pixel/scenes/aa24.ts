/**
 * Applied Accounting lesson 24, Ethics & Professional Standards in Accounting: duty to the public
 * over pressure from the client.
 *
 * The bookkeeper at the desk under a plate reading ETHICS, the framed CODE on the wall behind the
 * green lamp and a level brass balance on a shelf. A hand in a dark sleeve pushes a fat envelope of
 * cash across the desk; the bookkeeper holds up an open palm against it and, with the other hand,
 * brings the rubber stamp down on the honest report, which takes a red seal. Moving: the stamp comes
 * down and lifts away from its mark, the envelope is pushed in and drawn back, the lamp breathes,
 * dust rises in its light, the bookkeeper blinks.
 */
import type { PixelSprite } from '../types';
import {
  AA_AT,
  AA_PALETTE,
  aaBankersLamp,
  aaBlink,
  aaBookkeeper,
  aaCharter,
  aaCompose,
  aaDesk,
  aaLampGlow,
  aaMote,
  aaPlaque,
  aaScale,
  aaText,
} from './aa-kit';
import { aaFloor } from './aa-kit-a';
import { aaPaint } from './aa-kit-c';
import { aaKeepsake } from './aa1-finish';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa24'], rows, ...(palette ? { palette } : {}) });

/** Manila for the envelope of cash. */
const KRAFT = { u: '#C49A6C', v: '#8E6A44' };

/** The honest report on the desk, 17 x 8: lines down the right, the left kept clear for the seal. */
const report = sprite('aa24-report', [
  'aaaaaaaaaaaaaaaac',
  'aaaaaaakkkkkkkaac',
  'aaaaaaaaaaaaaaaac',
  'aaaaaaakkkkkkaaac',
  'aaaaaaaaaaaaaaaac',
  'aaaaaaakkkkkkkaac',
  'aaaaaaaaaaaaaaaac',
  'ccccccccccccccccc',
], AA_PALETTE);

const inkPad = sprite('aa24-ink-pad', ['DDDDDDD', 'DrRRRrD', 'DDDDDDD']);

/** A shelf on two brackets for the balance. */
const shelf = sprite('aa24-shelf', ['O'.repeat(18), `y${'G'.repeat(16)}g`, '.OO............OO.', '..O............O..']);

/**
 * The bookkeeper's left arm raised, palm out against the bribe, and the jumper painted over where
 * that arm hung, so the figure does not read as three-armed.
 */
const palm = sprite('aa24-palm', [
  '.......S.S..',
  '......SSSSS.',
  '.....SSSSSM.',
  '......SSSSM.',
  '......SSSMM.',
  '......PPPp..',
  '.....PPPp...',
  '....PPPp....',
  '...PPPp.....',
  '..PPPp......',
  '.PPPp.......',
  '.pppp.......',
  'pppp........',
  'pppp........',
], AA_PALETTE);

const KEEPER = { x: 31, y: 17 };
const LAMP = { x: 7, y: 23 };
const REPORT = { x: 30, y: 37 };

const base = aaCompose('aa24-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa24-floor', 80, [[4, 75]]), x: 0, y: 49 },
  { sprite: aaPlaque('aa24-opener-plate', 'ETHICS'), x: 27, y: 1 },
  { sprite: aaCharter('aa24-charter', 'CODE'), x: 4, y: 7 },
  { sprite: aaScale, x: 60, y: 4 },
  { sprite: shelf, x: 60, y: 20 },
  { sprite: aaBookkeeper, ...KEEPER },
  { sprite: palm, x: KEEPER.x + 13, y: KEEPER.y + 5 },
  { sprite: aaDesk, x: 4, y: 36 },
  { sprite: aaBankersLamp, ...LAMP },
  { sprite: inkPad, x: 21, y: 41 },
  { sprite: report, ...REPORT },
]);

/**
 * The stamp in the bookkeeper's right hand, its top `t` rows down the layer: the forearm, the fist on
 * the knob, the neck, the wooden body and the rubber. `mark` leaves the red seal it struck.
 */
const STAMP = ['.SSSSM.', '.SSSMM.', '..OgO..', '.OyGgO.', '.OGggO.', '.rrrrr.'];
const SEAL = ['..RRR..', '.R...R.', '..RRR..'];
const stampAt = (t: number, mark: boolean) => Array.from({ length: 11 }, (_, y) => {
  if (y < t) return '.PPPp..';
  const part = STAMP[y - t];
  if (part) return part;
  return mark && y >= 7 && y <= 9 ? SEAL[y - 7] : '.......';
});
const stamp: PixelSprite = {
  ...sprite('aa24-stamp', stampAt(1, false), AA_PALETTE),
  frames: [stampAt(1, false), stampAt(1, false), stampAt(4, false), stampAt(1, true), stampAt(1, true), stampAt(1, true), stampAt(1, true), stampAt(1, false)],
  frameMs: 380,
};

/** The bribe, `ex` pixels in from its furthest push: a manila envelope of cash, the hand, a dark cuffed sleeve. */
const ENVELOPE = ['uuuuuuuuv', ...aaText('aa24-cash', '$', 'n').rows.map((r) => `uuu${r.replace(/\./g, 'u')}uuv`), 'vvvvvvvvv'];
const bribeAt = (ex: number) => Array.from({ length: 7 }, (_, y) => Array.from({ length: 20 }, (_, x) => {
  const e = x - ex;
  if (e < 0) return '.';
  if (e <= 8) return ENVELOPE[y][e];
  if (e <= 10) return y >= 2 && y <= 4 ? (e === 9 ? 'S' : 'M') : '.';
  if (e === 11) return y >= 1 && y <= 5 ? 'a' : '.';
  return y === 1 ? 'X' : y >= 2 && y <= 5 ? 'D' : '.';
}).join(''));
const bribe: PixelSprite = {
  ...sprite('aa24-bribe', bribeAt(2), { ...AA_PALETTE, ...KRAFT }),
  frames: [bribeAt(2), bribeAt(2), bribeAt(1), bribeAt(0), bribeAt(0), bribeAt(1)],
  frameMs: 420,
};

export const aa24Opener: SceneArt = {
  id: 'aa24-opener',
  label: 'The bookkeeper holds up an open palm against an envelope of cash pushed across the desk and stamps the honest report with a red seal, under a brass plate reading ETHICS, a framed code and a level brass balance.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: stamp, x: REPORT.x, y: 32 },
    { sprite: bribe, x: 60, y: 37 },
    { sprite: aaBlink, x: KEEPER.x + AA_AT.blinkOnBookkeeper.x, y: KEEPER.y + AA_AT.blinkOnBookkeeper.y },
    { sprite: aaLampGlow, x: LAMP.x + AA_AT.glowInLamp.x, y: LAMP.y + AA_AT.glowInLamp.y, motion: { kind: 'twinkle', periodMs: 3400, min: 0.35 } },
    { sprite: aaMote, x: 10, y: 35, motion: { kind: 'rise', amp: 5, periodMs: 2800 } },
    { sprite: aaMote, x: 17, y: 34, motion: { kind: 'rise', amp: 4, periodMs: 3300, phase: 0.5 } },
  ],
};

/** Lesson 24 emblem: a gilt compass, its needle red to the north and white to the south. */
const emblemCompass = aaPaint('aa-emblem-compass', 16, 16, (x, y) => {
  const dx = x - 7.5;
  const dy = y - 7.5;
  const d = Math.hypot(dx, dy);
  if (d > 7.6) return '.';
  if (d > 6.2) return dx + dy < -3 ? 'y' : dx + dy > 3 ? 'g' : 'G';
  if (Math.abs(dx) <= (6 - Math.abs(dy)) * 0.42 && Math.abs(dy) < 6) return dy < 0 ? (dx < 0 ? 'R' : 'r') : dx < 0 ? 'a' : 'c';
  if ((Math.abs(dx) < 0.6 || Math.abs(dy) < 0.6) && d > 4.4) return 'G';
  return '.';
});

export const aa24Finish = aaKeepsake(
  'aa24-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped with a gold compass whose needle points red to the north, with small glints and check marks around it.',
  emblemCompass,
);

export const art: LessonArtSet = { opener: aa24Opener, backdrop: aaBackdrop, finish: aa24Finish };
