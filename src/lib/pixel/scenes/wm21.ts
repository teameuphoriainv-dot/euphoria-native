/**
 * Wealth Management lesson 21 (wealth transfer techniques): its opener, the pathway backdrop and its
 * keepsake, as one set loaded on demand.
 *
 * The opener is the family's long hall at night: green walls pinstriped in gold over the kit's
 * panelling (wm-kit-a.ts), two candles in wall sconces, and three gilt-framed portraits of the
 * generations before: the bearded founder, a lady in pearls, a gentleman in a blue coat. Under
 * them the grandmother, drawn large from wm-kit-c.ts, hands a sealed scroll straight to her
 * grandchild while the father looks on. The lesson's point is the structures (a GRAT, a dynasty
 * trust, a generation-skipping gift) that carry wealth down the line with as little as possible lost
 * to tax on the way, so the deed passes over a generation, hand to hand. What moves: the candles
 * flicker, the scroll's wax seal glints, gold motes lift off it. The keepsake carries the kit's key,
 * which the plan gives this lesson and lesson 4.
 */
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';
import { wmBackdrop } from './wm-backdrop';
import { wmBands, wmCoinMote, wmCompose, wmEmblemKey, wmLater, WM_INKS } from './wm-kit';
import { wmCandle, wmCandleFlame, wmStripes, wmWainscot } from './wm-kit-a';
import { wmChildTall, wmElderTall, wmParentTall, wmRepose } from './wm-kit-c';
import { wmKeepsake } from './wm1-finish';

/** The portraits' left edges (12 wide with their frames), all hung from one rail. */
const PORTRAITS = [8, 34, 60] as const;
const PORTRAIT_Y = 7;

/** The sconces' candles, between the portraits. */
const CANDLES = [26, 52] as const;
const CANDLE_Y = 12;

/** The scroll's top-left, held between the grandmother's hand and the child's. */
const SCROLL_X = 25;
const SCROLL_Y = 47;

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

/** The grandmother's left hand out, holding one end of the scroll. 15x22. */
const elderHanding = wmRepose(wmElderTall, 'wm21-opener-elder-handing', {
  12: '.CPPpEEEpPpppCU',
  13: '.X.PpEEEpp.....',
}, 0, 3);

/** The grandchild's right hand up, taking the other end. 12x15. */
const childReceiving = wmRepose(wmChildTall, 'wm21-opener-child-receiving', {
  5: 'CC..CCCCCCU.',
  6: '.TT..CCCCU..',
  7: '..TTtTTTTTt.',
  8: '.....tTTTttt',
  9: '.....tTTTttt',
  10: '.....tTTTtUU',
}, 3, 0);

/** A rolled deed, a red ribbon round its middle and the wax seal hanging under it. 9x5. */
const scroll: PixelSprite = {
  id: 'wm21-opener-scroll',
  name: 'wm21-opener-scroll',
  tags: ['scene', 'wm21'],
  rows: ['OyyyRyyyO', 'gyyyRyyyg', 'gGGGrGGGg', '.ggOrOgg.', '...rRr...'],
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
  { sprite: elderHanding, x: 10, y: 36 },
  { sprite: scroll, x: SCROLL_X, y: SCROLL_Y },
  { sprite: childReceiving, x: 34, y: 43 },
  { sprite: wmParentTall, x: 50, y: 35 },
]);

const glint: PixelSprite = {
  id: 'wm21-opener-glint',
  name: 'wm21-opener-glint',
  tags: ['scene', 'wm21'],
  rows: ['W'],
};

export const wm21Opener: SceneArt = {
  id: 'wm21-opener',
  label: 'In a candlelit hall hung with portraits of the generations before, a grandmother hands a sealed scroll straight to her grandchild while the father looks on.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: wmCandleFlame, x: CANDLES[0] + 1, y: CANDLE_Y - 3 },
    { sprite: wmLater(wmCandleFlame, 'wm21-opener-flame-later', 2, 320), x: CANDLES[1] + 1, y: CANDLE_Y - 3 },
    { sprite: glint, x: SCROLL_X + 4, y: SCROLL_Y + 4, motion: { kind: 'twinkle', periodMs: 1900, min: 0 } },
    { sprite: wmCoinMote, x: SCROLL_X + 2, y: SCROLL_Y - 3, motion: { kind: 'rise', amp: 6, periodMs: 2600, phase: 0.1 } },
    { sprite: wmCoinMote, x: SCROLL_X + 6, y: SCROLL_Y - 2, motion: { kind: 'rise', amp: 7, periodMs: 3000, phase: 0.6 } },
  ],
};

export const wm21Finish: SceneArt = wmKeepsake(
  'wm21-finish',
  wmEmblemKey,
  'A green crest with a gold rim bearing a key, framed by laurel over a purple banner, with sparkles around it.',
);

export const art: LessonArtSet = { opener: wm21Opener, backdrop: wmBackdrop, finish: wm21Finish };
