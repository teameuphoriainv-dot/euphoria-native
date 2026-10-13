/**
 * Wealth Management lesson 21 (wealth transfer techniques): its opener, the pathway backdrop and its
 * keepsake, as one set loaded on demand.
 *
 * The opener is the family's long hall at night: green walls pinstriped in gold over the kit's
 * panelling (wm-kit-a.ts), two candles in wall sconces, and three gilt-framed portraits of the
 * generations before: the bearded founder, a lady in pearls, a gentleman in a blue coat. Under them
 * stands the lesson's structure, a GRAT drawn as a trust chest: oak bound in gold, sealed with red
 * wax, a coin slot in its lid and a glass front showing the grandmother's coins inside, with a
 * bright gold line across the glass for the IRS hurdle rate. The grandmother, drawn large from
 * wm-kit-c.ts, stands at its left with her hand out; her grandchild waits at its right. What moves is
 * the trust at work: the coins grow, one coin and then a second stacking up to the line and past it;
 * the coin above the line hops out of the slot and arcs over to the grandchild, the growth above
 * the hurdle passing free of gift tax; then the coin at the line comes back to the grandmother, her
 * annuity; and the chest is back to her own coins. The candles flicker and the wax seal glints.
 * The keepsake is the chest's idea in small: a stack of coins under the gold hurdle line, one coin
 * leaping up past it.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import { wmBands, wmCompose, wmLater, WM_INKS } from './wm-kit';
import { wmCandle, wmCandleFlame, wmStripes, wmWainscot } from './wm-kit-a';
import { wmChildTall, wmCoinFlight, wmElderTall, wmRepose } from './wm-kit-c';
import { wmKeepsake } from './wm1-finish';

/** The portraits' left edges (12 wide with their frames), all hung from one rail. */
const PORTRAITS = [8, 34, 60] as const;
const PORTRAIT_Y = 7;

/** The sconces' candles, between the portraits. */
const CANDLES = [26, 52] as const;
const CANDLE_Y = 12;

/** The trust chest's top-left, on its stand between the grandmother and the grandchild. */
const CHEST_X = 27;
const CHEST_Y = 27;

/** The chest's glass, inside its gold frame: 8 wide, 11 tall, from here in the chest's pixels. */
const GLASS_X = 9;
const GLASS_Y = 7;

/** Where the grandmother and the grandchild stand; their open hands are where the coins land. */
const ELDER_X = 9;
const ELDER_Y = 34;
const CHILD_X = 56;
const CHILD_Y = 41;

/** A painting in a gilt frame: a two-pixel moulding lit on its top and left. Inner + 4 each way. */
function gilt(id: string, inner: readonly string[]): PixelSprite {
  const w = inner[0].length;
  return {
    id,
    name: id,
    tags: ['scene', 'wm21'],
    palette: WM_INKS,
    rows: [
      `y${'y'.repeat(w + 2)}g`,
      `yG${'G'.repeat(w)}gO`,
      ...inner.map((row) => `yG${row}gO`),
      `yg${'g'.repeat(w)}gO`,
      `g${'O'.repeat(w + 2)}O`,
    ],
  };
}

/** The founder: bald crown, white whiskers and beard, a grey coat. 8x11 inside the frame. */
const founder = gilt('wm21-opener-founder', [
  'kkkkkkkk',
  'kkkCCCkk',
  'kkCCCCUk',
  'kxCKCKUx',
  'kxCCCCUx',
  'kxwwwwwx',
  'kkwwwwwk',
  'kDXwwwXD',
  'DDXXwXXD',
  'DDDXXXDD',
  'DDDDDDDD',
]);

/** His daughter: dark hair up, an orchid gown, a string of pearls. 8x11 inside the frame. */
const lady = gilt('wm21-opener-lady', [
  'hhkkkkhh',
  'hkkkkkkh',
  'kkCCCCUk',
  'kkCKCKUk',
  'hkCCCCUh',
  'hhCCCUhh',
  'hhhCUhhh',
  'hEwEwEwh',
  'EPPPPPPE',
  'PPqPPPpp',
  'PPPPPppp',
]);

/** Her son: dark hair, a moustache, a blue coat and a red cravat. 8x11 inside the frame. */
const gentleman = gilt('wm21-opener-gentleman', [
  '11kkkk11',
  '1kkkkkk1',
  '1kCCCCU1',
  '1kCKCKU1',
  '11CCCCU1',
  '11CkkU11',
  '111CU111',
  '1bbwwbb1',
  'BbbwRbbb',
  'Bbbbbbbb',
  'bbbbbbbb',
]);

/** A brass wall bracket under a candle. 4x3. */
const bracket: PixelSprite = {
  id: 'wm21-opener-bracket',
  name: 'wm21-opener-bracket',
  tags: ['scene', 'wm21'],
  rows: ['gOOg', '.Og.', '.OO.'],
};

/** The grandmother's left hand out, palm up, ready for her annuity coin. 15x22. */
const elderHandOut = wmRepose(wmElderTall, 'wm21-opener-elder-hand-out', {
  12: '.CPPpEEEpPpppCU',
  13: '.X.PpEEEpp.....',
}, 0, 3);

/** The grandchild's right hand up, waiting for the coin that comes over the hurdle. 12x15. */
const childWaiting = wmRepose(wmChildTall, 'wm21-opener-child-waiting', {
  5: 'CC..CCCCCCU.',
  6: '.TT..CCCCU..',
  7: '..TTtTTTTTt.',
  8: '.....tTTTttt',
  9: '.....tTTTttt',
  10: '.....tTTTtUU',
}, 3, 0);

/** A coin seen edge-on in a stack: its lit face, then its shadowed rim. 6x2. */
const STACK_COIN = ['yGGGGg', 'gggggO'];

/** The glass's rows, top down: the coin above the hurdle, the hurdle line, then four coins below it. */
const ABOVE = 0;
const HURDLE = 2;
const AT_LINE = 3;

/** The glass with the grandmother's own three coins on its floor; the hurdle row is drawn by the chest. */
const glassRows = Array.from({ length: 11 }, (_, j) => {
  const k = j - 5;
  if (k >= 0) return `K${STACK_COIN[k % 2]}K`;
  return 'KKKKKKKK';
});

/** A row of the chest's front: oak, the two gold straps, and `mid` (10 cells) between them. */
const front = (mid: string) => `CUUyUUUU${mid}UUUUgUUO`;

/**
 * The GRAT as a trust chest: a domed oak lid with a coin slot, a gold band, the trust's red wax
 * seal hanging at the front, two gold straps, a gold-framed glass front with her coins inside and a
 * bright gold line across it for the hurdle rate (it runs out through the frame, so it reads as a
 * mark, not a coin), a gold base band. 26x21.
 */
const chest: PixelSprite = {
  id: 'wm21-opener-chest',
  name: 'wm21-opener-chest',
  tags: ['scene', 'wm21'],
  palette: WM_INKS,
  rows: [
    '...CCCCCCCCKKKKCCCCCCCU...',
    '.CCCCCCCCCCCCCCCCCCCCCCCU.',
    'CCCCCCCCCCCCCCCCCCCCCCCUUU',
    'yGGGGGGGGGGGGGGGGGGGGGGGGg',
    front('UUUrRRrUUU'),
    front('UUUsWRRUUU'),
    front(`y${'G'.repeat(8)}g`),
    ...glassRows.map((glass, j) => (j === HURDLE ? `CUUyUUU${'y'.repeat(12)}UUUgUUO` : front(`G${glass}g`))),
    front(`g${'g'.repeat(8)}O`),
    'yGGGGGGGGGGGGGGGGGGGGGGGGg',
    'gOOOOOOOOOOOOOOOOOOOOOOOOO',
  ],
};

/** The oak stand the chest sits on. 24x7. */
const stand: PixelSprite = {
  id: 'wm21-opener-stand',
  name: 'wm21-opener-stand',
  tags: ['scene', 'wm21'],
  palette: WM_INKS,
  rows: [`${'C'.repeat(23)}U`, `${'U'.repeat(23)}O`, 'O'.repeat(24), ...Array.from({ length: 3 }, () => `.UO${'.'.repeat(18)}UO.`), `.KK${'.'.repeat(18)}KK.`],
};

const base = wmCompose('wm21-opener-base', [
  ...wmBands(80, [['K', 2], ['D', 1], ['O', 1]]),
  ...wmStripes(80, 30, 'h', 'O', 7),
  ...wmWainscot(80),
  ...wmBands(80, [['K', 1], ['O', 2], ['U', 1], ['O', 3], ['U', 1], ['O', 4], ['U', 1], ['O', 2]]),
], [
  { sprite: founder, x: PORTRAITS[0], y: PORTRAIT_Y },
  { sprite: lady, x: PORTRAITS[1], y: PORTRAIT_Y },
  { sprite: gentleman, x: PORTRAITS[2], y: PORTRAIT_Y },
  ...CANDLES.map((x) => ({ sprite: wmCandle, x, y: CANDLE_Y })),
  ...CANDLES.map((x) => ({ sprite: bracket, x, y: CANDLE_Y + 6 })),
  { sprite: stand, x: CHEST_X + 1, y: CHEST_Y + 21 },
  { sprite: chest, x: CHEST_X, y: CHEST_Y },
  { sprite: elderHandOut, x: ELDER_X, y: ELDER_Y },
  { sprite: childWaiting, x: CHILD_X, y: CHILD_Y },
]);

/* ── the trust at work: growth stacks past the hurdle, the excess goes on, the annuity comes back ── */

/** The cycle in frames: rest, a coin grows to the line, a second past it, then the two flights. */
const FRAME_MS = 200;
const GROW_1 = 3;
const GROW_2 = 6;
const TO_CHILD = 9;
const TO_ELDER = 19;
const FRAMES = 30;

/**
 * A coin's nine stops in scene pixels from the slot to an open hand: out of the slot, up over the
 * lid by `peak` rows, and down, landing just above the palm.
 */
const SLOT: readonly [number, number] = [CHEST_X + 12, CHEST_Y - 2];
function arc(to: readonly [number, number], peak: number): (readonly [number, number])[] {
  const [sx, sy] = SLOT;
  const [hx, hy] = to;
  return Array.from({ length: 9 }, (_, i) => {
    const t = i / 8;
    return [Math.round(sx + (hx - sx) * t), Math.round(sy + (hy - sy) * t * t - peak * Math.sin(Math.PI * Math.min(1, t * 1.6)))] as const;
  });
}
const ARC_TO_CHILD = arc([CHILD_X, CHILD_Y + 3], 4);
const ARC_TO_ELDER = arc([ELDER_X + 13, ELDER_Y + 10], 4);

/**
 * A flight layer, `w` x `h` from (x0, y0): the coin at `arc[i]` from frame `from`, a sparkle where it
 * lands, empty otherwise. `still` is the frame shown at rest. Built on the kit's wmCoinFlight.
 */
function flight(id: string, x0: number, y0: number, w: number, h: number, arc: readonly (readonly [number, number])[], from: number, still: number): PixelSprite {
  const local = arc.map(([x, y]) => [x - x0, y - y0] as const);
  const coin = wmCoinFlight(id, w, h, local, 0, FRAME_MS);
  const empty = wmBands(w, [['.', h]]);
  const [lx, ly] = local[local.length - 1];
  const sparkle = empty.map((row, j) => [...row].map((ch, i) => {
    if (j === ly && (i === lx || i === lx + 2)) return 'y';
    if (j === ly - 1 && i === lx + 1) return 'W';
    return ch;
  }).join(''));
  const frames = Array.from({ length: FRAMES }, (_, f) => {
    const k = f - from;
    if (k >= 0 && k < local.length) return coin.frames?.[k] ?? empty;
    return k === local.length ? sparkle : empty;
  });
  return { id, name: id, tags: ['scene', 'wm21'], rows: frames[still], frames, frameMs: FRAME_MS };
}

/** A flight layer's box: from the leftmost and highest stop to past the farthest, with sparkle room. */
function box(stops: readonly (readonly [number, number])[]): { x: number; y: number; w: number; h: number } {
  const xs = stops.map(([x]) => x);
  const ys = stops.map(([, y]) => y);
  const x = Math.min(...xs);
  const y = Math.min(...ys) - 1;
  return { x, y, w: Math.max(...xs) - x + 3, h: Math.max(...ys) - y + 2 };
}
const RIGHT = box(ARC_TO_CHILD);
const LEFT = box(ARC_TO_ELDER);
const toChild = flight('wm21-opener-to-child', RIGHT.x, RIGHT.y, RIGHT.w, RIGHT.h, ARC_TO_CHILD, TO_CHILD, TO_CHILD + 3);
const toElder = flight('wm21-opener-to-elder', LEFT.x, LEFT.y, LEFT.w, LEFT.h, ARC_TO_ELDER, TO_ELDER, 0);

/** The growth in the glass, 8x5 from its top: nothing, a coin at the line, or one past it too. */
function growth(count: 0 | 1 | 2, glint = false): string[] {
  const rows = wmBands(8, [['.', 5]]).map((row) => [...row]);
  const put = (top: number) => STACK_COIN.forEach((row, j) => [...row].forEach((ch, i) => { rows[top + j][1 + i] = ch; }));
  if (count >= 1) put(AT_LINE);
  if (count >= 2) put(ABOVE);
  if (glint) rows[ABOVE][1] = 'W';
  return rows.map((row) => row.join(''));
}

const growthFrames = Array.from({ length: FRAMES }, (_, f) => {
  if (f < GROW_1) return growth(0);
  if (f < GROW_2) return growth(1);
  if (f < TO_CHILD) return growth(2, f === GROW_2);
  if (f < TO_ELDER) return growth(1);
  return growth(0);
});

const grow: PixelSprite = {
  id: 'wm21-opener-growth',
  name: 'wm21-opener-growth',
  tags: ['scene', 'wm21'],
  blurb: 'The trust\'s growth: a coin up to the hurdle line, a second past it.',
  rows: growth(1),
  frames: growthFrames,
  frameMs: FRAME_MS,
};

const glint: PixelSprite = {
  id: 'wm21-opener-glint',
  name: 'wm21-opener-glint',
  tags: ['scene', 'wm21'],
  rows: ['W'],
};

export const wm21Opener: SceneArt = {
  id: 'wm21-opener',
  label: 'In a candlelit hall hung with family portraits, a grandmother\'s coins grow inside a sealed trust chest past a gold line on its glass, the coin above the line arcing over to her grandchild while the coin at the line comes back to her own open hand.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: grow, x: CHEST_X + GLASS_X, y: CHEST_Y + GLASS_Y },
    { sprite: toChild, x: RIGHT.x, y: RIGHT.y },
    { sprite: toElder, x: LEFT.x, y: LEFT.y },
    { sprite: wmCandleFlame, x: CANDLES[0] + 1, y: CANDLE_Y - 3 },
    { sprite: wmLater(wmCandleFlame, 'wm21-opener-flame-later', 2, 320), x: CANDLES[1] + 1, y: CANDLE_Y - 3 },
    { sprite: glint, x: CHEST_X + 12, y: CHEST_Y + 5, motion: { kind: 'twinkle', periodMs: 1900, min: 0 } },
  ],
};

/**
 * The chest's idea in small: a stack of gold coins under a bright gold line, the hurdle rate, and
 * one coin leaping up past the line along a dotted white arc: the growth that clears the hurdle.
 */
const emblemHurdle: PixelSprite = {
  id: 'wm21-emblem-hurdle',
  name: 'wm21-emblem-hurdle',
  tags: ['scene', 'wm21'],
  rows: [
    '..........yGg.',
    '.......w.yGGGg',
    '.....w...GGGgg',
    '....w.....ggO.',
    '...w..........',
    'yyyyyyyyyyyyyy',
    'gggggggggggggO',
    '..yGGGGGg.....',
    '..gggggggO....',
    '..yGGGGGg.....',
    '..gggggggO....',
    '..yGGGGGg.....',
    '..gggggggO....',
  ],
};

export const wm21Finish: SceneArt = wmKeepsake(
  'wm21-finish',
  emblemHurdle,
  'A green crest with a gold rim bearing a stack of gold coins under a bright gold line, one coin leaping up past the line along a dotted arc, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm21Opener, backdrop: wmBackdrop, finish: wm21Finish };
