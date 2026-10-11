/**
 * Applied Accounting lesson 14, Accounts Receivable & Payable Management: who owes the business, whom
 * it owes, and how long each has been waiting.
 *
 * The post room. Across the wall runs a rack of pigeonholes that is the aging schedule, brass tags
 * reading 0, 30, 60 and 90 days: fresh white invoices in the first, fewer and yellower ones along
 * the row, and in the last a single old invoice flagged red. The filing cabinet stands at the left
 * with its top drawer pulled; on the counter are trays for IN and OUT, the post that brings cash in
 * and the bills that send it out, under a plate reading AR/AP. Behind the counter the bookkeeper holds
 * up the overdue invoice. Moving: a new invoice drops into the IN tray, the red flags pulse, the lamp
 * breathes, dust rises, the bookkeeper blinks.
 */
import type { PixelSprite } from '../types';
import { AA_AT, AA_PALETTE, aaBankersLamp, aaBlink, aaBookkeeper, aaCompose, aaLampGlow, aaMote, aaPlaque, aaText } from './aa-kit';
import { aaFilingCabinet, aaFloor } from './aa-kit-a';
import { aaEnvelope } from './aa-kit-b';
import { aaKeepsake } from './aa1-finish';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa14'], rows, ...(palette ? { palette } : {}) });

/** Paper going yellow with age: 60 days, then 90. */
const AGED = { ...AA_PALETTE, u: '#D8C690', v: '#A89560', U: '#C2A464', V: '#86703F' };
const fresh = (id: string) => aaEnvelope(id, 'a', 'c', 'c', AGED);

/** The aging rack, 53 x 19: a brass tag over each of four pigeonholes, a lit shelf edge under them. */
const DAYS = ['0', '30', '60', '90'];
const RACK = { x: 25, y: 1 };
const HOLE_W = 12;
const holeX = (i: number) => 1 + i * (HOLE_W + 1);
const HOLE_Y = 8;
const rack = aaCompose('aa14-rack', 53, 19, '.', [
  { sprite: sprite('aa14-rack-body', [
    'O'.repeat(53),
    ...Array.from({ length: 6 }, () => 'O'.repeat(53)),
    'O'.repeat(53),
    ...Array.from({ length: 9 }, () => `O${`${'K'.repeat(HOLE_W)}O`.repeat(4)}`),
    'O'.repeat(53),
    `y${'G'.repeat(51)}g`,
  ]), x: 0, y: 0 },
  ...DAYS.flatMap((d, i) => {
    const text = aaText(`aa14-tag-${d}`, d, 'K').rows;
    const w = text[0].length + 2;
    return [{
      sprite: sprite(`aa14-tag-${d}-plate`, [`y${'y'.repeat(w - 2)}G`, ...text.map((r) => `G${r.replace(/\./g, 'G')}g`)]),
      x: holeX(i) + Math.floor((HOLE_W - w) / 2),
      y: 1,
    }];
  }),
  { sprite: fresh('aa14-env-0-back'), x: holeX(0), y: HOLE_Y },
  { sprite: fresh('aa14-env-0-front'), x: holeX(0) + 1, y: HOLE_Y + 2 },
  { sprite: fresh('aa14-env-30'), x: holeX(1) + 1, y: HOLE_Y + 2 },
  { sprite: aaEnvelope('aa14-env-60', 'u', 'v', 'v', AGED), x: holeX(2) + 1, y: HOLE_Y + 2 },
  { sprite: aaEnvelope('aa14-env-90', 'U', 'V', 'r', AGED), x: holeX(3) + 1, y: HOLE_Y + 2 },
  { sprite: sprite('aa14-flag', ['rr', 'rr', 'r.']), x: holeX(3) + 9, y: HOLE_Y },
]);

/** A wire tray, 11 or 15 wide by 8: the papers in it peek over a steel rim lettered IN or OUT. */
const tray = (id: string, word: string, papers: string) => {
  const text = aaText(`${id}-word`, word, 'c').rows;
  const w = text[0].length + 4;
  return sprite(id, [
    `..${papers.repeat(w - 5)}c..`,
    'D'.repeat(w),
    ...text.map((r) => `Dx${r.replace(/\./g, 'K')}KD`),
    'D'.repeat(w),
  ], AGED);
};

/** The counter, 62 x 17: green leather top, a lit edge, four panelled drawers. */
const COUNTER = { x: 18, y: 40, w: 62 };
const panel = (kind: 'top' | 'mid' | 'pull') =>
  kind === 'top' ? `${'g'.repeat(14)}O` : kind === 'pull' ? `g${'O'.repeat(5)}yy${'O'.repeat(6)}O` : `g${'O'.repeat(14)}`;
const counter = sprite('aa14-counter', [
  'O'.repeat(COUNTER.w),
  ...Array.from({ length: 3 }, () => `O${'n'.repeat(COUNTER.w - 2)}O`),
  `y${'G'.repeat(COUNTER.w - 2)}g`,
  'O'.repeat(COUNTER.w),
  `O${panel('top').repeat(4)}O`,
  `O${panel('mid').repeat(4)}O`,
  `O${panel('pull').repeat(4)}O`,
  ...Array.from({ length: 5 }, () => `O${panel('mid').repeat(4)}O`),
  'O'.repeat(COUNTER.w),
  'O'.repeat(COUNTER.w),
  'O'.repeat(COUNTER.w),
]);

const KEEPER = { x: 60, y: 21 };
const HELD = { x: 44, y: 26 };
const LAMP = { x: 19, y: 28 };
const IN_TRAY = { x: 32, y: 34 };

/** The bookkeeper's left arm raised, the hand round the corner of the overdue invoice. */
const raisedArm = sprite('aa14-raised-arm', [
  '.SS....',
  'SSM....',
  '.PPP...',
  '..PPp..',
  '...PPp.',
  '....PPp',
  '.....PP',
]);

const base = aaCompose('aa14-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa14-floor', 80, [[1, 79]]), x: 0, y: 49 },
  { sprite: aaPlaque('aa14-opener-plate', 'AR/AP'), x: 1, y: 2 },
  { sprite: rack, ...RACK },
  { sprite: aaFilingCabinet, x: 1, y: 23 },
  { sprite: aaBookkeeper, ...KEEPER },
  { sprite: aaEnvelope('aa14-held', 'U', 'V', 'r', AGED), ...HELD },
  { sprite: raisedArm, x: KEEPER.x - 6, y: KEEPER.y + 10 },
  { sprite: counter, x: COUNTER.x, y: COUNTER.y },
  { sprite: aaBankersLamp, ...LAMP },
  { sprite: tray('aa14-tray-in', 'IN', 'a'), ...IN_TRAY },
  { sprite: tray('aa14-tray-out', 'OUT', 'u'), x: IN_TRAY.x + 12, y: IN_TRAY.y },
]);

/** A new invoice dropping into the IN tray, then resting a while. */
const arriving: PixelSprite = (() => {
  const env = fresh('aa14-arriving-env').rows;
  const at = (dy: number) => Array.from({ length: 12 }, (_, y) => env[y - dy] ?? '.'.repeat(11));
  const gone = at(20);
  return { ...sprite('aa14-arriving', at(5), AGED), frames: [gone, gone, at(0), at(2), at(4), at(5), at(5), at(5), gone], frameMs: 360 };
})();

/** The red of the overdue flag and seals, pulsing. */
const flagLit = sprite('aa14-flag-lit', ['RR', 'RR', 'R.']);
const sealLit = sprite('aa14-seal-lit', ['RRR']);

export const aa14Opener: SceneArt = {
  id: 'aa14-opener',
  label: 'A rack of pigeonholes tagged 0, 30, 60 and 90 days holds invoices that yellow with age, the last flagged red; the bookkeeper holds up that overdue invoice behind a counter with IN and OUT trays, beside a filing cabinet and a brass plate reading AR/AP.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: arriving, x: IN_TRAY.x, y: IN_TRAY.y - 11 },
    { sprite: flagLit, x: RACK.x + holeX(3) + 9, y: RACK.y + HOLE_Y, motion: { kind: 'twinkle', periodMs: 1800, min: 0.2 } },
    { sprite: sealLit, x: RACK.x + holeX(3) + 5, y: RACK.y + HOLE_Y + 6, motion: { kind: 'twinkle', periodMs: 1800, min: 0.2 } },
    { sprite: sealLit, x: HELD.x + 4, y: HELD.y + 4, motion: { kind: 'twinkle', periodMs: 1800, min: 0.2, phase: 0.5 } },
    { sprite: aaBlink, x: KEEPER.x + AA_AT.blinkOnBookkeeper.x, y: KEEPER.y + AA_AT.blinkOnBookkeeper.y },
    { sprite: aaLampGlow, x: LAMP.x + AA_AT.glowInLamp.x, y: LAMP.y + AA_AT.glowInLamp.y, motion: { kind: 'twinkle', periodMs: 3400, min: 0.35 } },
    { sprite: aaMote, x: 24, y: 36, motion: { kind: 'rise', amp: 5, periodMs: 3000 } },
  ],
};

/** Lesson 14 emblem: a gilt envelope closed with a red wax seal, the invoice still to be paid. */
const emblemEnvelope = sprite('aa-emblem-envelope', [
  '................',
  '................',
  'yyyyyyyyyyyyyyyy',
  'yOGGGGGGGGGGGGOg',
  'yGOGGGGGGGGGGOGg',
  'yGGOGGGGGGGGOGGg',
  'yGGGOGGGGGGOGGGg',
  'yGGGGOGGGGOGGGGg',
  'yGGGGGrRRrGGGGGg',
  'yGGGGGRaRRGGGGGg',
  'yGGGGGrRRrGGGGGg',
  'yGGGGGGGGGGGGGGg',
  'yGGGGGGGGGGGGGGg',
  'gggggggggggggggg',
  '................',
  '................',
], AA_PALETTE);

export const aa14Finish = aaKeepsake(
  'aa14-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped in gold with an envelope closed by a red wax seal, with small glints and check marks around it.',
  emblemEnvelope,
);

export const art: LessonArtSet = { opener: aa14Opener, backdrop: aaBackdrop, finish: aa14Finish };
