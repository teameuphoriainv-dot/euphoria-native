/**
 * Investing Fundamentals lesson 12, Understanding Market Orders: a trade is a buyer's price meeting a
 * seller's.
 *
 * A new set for the pathway: a stream winding out of the hills with an arched footbridge over it. On
 * the near bank the investor, a crate of coins behind them, holds up a green sign, a bid of 19; on the
 * far bank the orchard's gardener, a crate of apples behind them, holds up a red sign asking 20. Money
 * on one bank and goods on the other, so it reads as a trade. The stream between them is the spread,
 * and the bridge is where the order fills if one of them crosses. The water ripples, stars twinkle in
 * it and over it, the coins glint and fireflies drift.
 *
 * The keepsake's emblem is the two price boards facing each other across a strip of water: the bid,
 * the ask and the spread between them.
 */
import type { PixelSprite } from '../types';
import {
  IF_INVESTOR_HAND,
  IF_PALETTE,
  ifCompose,
  ifFirefly,
  ifGlint,
  ifInvestor,
  ifKeepsake,
  ifStage,
  ifStar,
  ifStarBig,
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import { IF_APPLE, IF_A_PALETTE, IF_GARDENER_HAND, ifGardener, ifRecolour } from './if-kit-a';
import { ifDigits } from './if-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/* ── the stream and the bridge ─────────────────────────────────────────────────────────────────── */

const STREAM_TOP = 36;

/** The stream's centre and half width on a scene row: a thread at the hills, wide at the bottom, bending. */
const streamAt = (y: number) => ({
  cx: 40 + 3 * Math.sin((y - STREAM_TOP) / 6),
  hw: 1 + (y - STREAM_TOP) * 0.5,
});

/** The stream, 80x24 from the field's top edge down: deep water, ripple lines, a lit near bank and a shaded far one. */
const stream: PixelSprite = {
  id: 'if12-stream',
  name: 'if12-stream',
  tags: ['scene', 'if'],
  palette: IF_A_PALETTE,
  rows: Array.from({ length: 60 - STREAM_TOP }, (_, j) => {
    const y = STREAM_TOP + j;
    const { cx, hw } = streamAt(y);
    return Array.from({ length: 80 }, (__, x) => {
      const d = x - cx;
      if (Math.abs(d) <= hw) {
        const ripple = j % 3 === 1 && Math.abs(d) < hw - 1 && (x + (j % 2) * 3) % 6 < 2;
        return ripple ? 'b' : 'u';
      }
      if (Math.abs(d) <= hw + 1) return d < 0 ? 'c' : 'e';
      return '.';
    }).join('');
  }),
};

const BRIDGE = { from: 23, to: 56, foot: 46, rise: 4 } as const;
const deckY = (x: number) => BRIDGE.foot - Math.round(BRIDGE.rise * Math.sin((Math.PI * (x - BRIDGE.from)) / (BRIDGE.to - BRIDGE.from)));
const POSTS = [23, 31, 40, 48, 56] as const;

/** The footbridge on a transparent 80x60 sheet: an arched deck three planks deep, a rail and five posts. */
const bridge: PixelSprite = {
  id: 'if12-bridge',
  name: 'if12-bridge',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: Array.from({ length: 60 }, (_, y) =>
    Array.from({ length: 80 }, (__, x) => {
      if (x < BRIDGE.from || x > BRIDGE.to) return '.';
      const deck = deckY(x);
      if (y === deck) return 'h';
      if (y === deck + 1) return 'A';
      if (y === deck + 2) return 'a';
      if (y === deck - 4) return 'h';
      if ((POSTS as readonly number[]).includes(x) && y > deck - 4 && y < deck) return 'A';
      return '.';
    }).join(''),
  ),
};

/* ── the two prices ────────────────────────────────────────────────────────────────────────────── */

/** A price on a board, 9x13: the board's rim and face, the number in ink, a stick below at `stickAt`. */
function priceSign(id: string, price: string, face: string, rim: string, stickAt: number): PixelSprite {
  const board: PixelSprite = {
    id: `${id}-board`,
    name: `${id}-board`,
    tags: ['scene', 'if'],
    palette: IF_PALETTE,
    rows: Array.from({ length: 13 }, (_, y) => {
      if (y === 0 || y === 6) return rim.repeat(9);
      if (y < 6) return `${rim}${face.repeat(7)}${rim}`;
      return Array.from({ length: 9 }, (__, x) => (x === stickAt ? 'h' : x === stickAt + 1 ? 'A' : '.')).join('');
    }),
  };
  return ifCompose(id, 9, 13, [
    { sprite: board, x: 0, y: 0 },
    { sprite: ifDigits(`${id}-price`, price, 'K'), x: 1, y: 1 },
  ]);
}

/** The bid's stick is near its left edge and the ask's near its right, so both boards clear the hats. */
const BID_STICK = 1;
const ASK_STICK = 7;
const bidSign = priceSign('if12-bid', '19', 'N', 'n', BID_STICK);
const askSign = priceSign('if12-ask', '20', 'R', 'r', ASK_STICK);

/** A crate heaped with coins, 7x6: the buyer's money. Recoloured with apples, it is the seller's goods. */
const crate: PixelSprite = {
  id: 'if12-crate',
  name: 'if12-crate',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    '..yGyG.',
    'yGgGgGg',
    'hhhhhhh',
    'hAAAAAa',
    'haaaaaa',
    'hAAAAAa',
  ],
};

const ripple: PixelSprite = {
  id: 'if12-ripple',
  name: 'if12-ripple',
  tags: ['scene', 'if'],
  rows: ['BB.b'],
};

/* ── the opener ────────────────────────────────────────────────────────────────────────────────── */

const INVESTOR = { x: 9, y: 26 } as const;
const SELLER = { x: 57, y: 26 } as const;
/** Each stick rises out of a hand; the boards ride above the figures' heads, clear of their hats. */
const BID = { x: INVESTOR.x + IF_INVESTOR_HAND.x - BID_STICK, y: INVESTOR.y + IF_INVESTOR_HAND.y - 12 } as const;
const ASK = { x: SELLER.x + IF_GARDENER_HAND.x - ASK_STICK, y: SELLER.y + IF_GARDENER_HAND.y - 12 } as const;
const COINS = { x: 0, y: 40 } as const;
const APPLES = { x: 72, y: 40 } as const;

const base = ifCompose('if12-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: stream, x: 0, y: STREAM_TOP },
  { sprite: bridge, x: 0, y: 0 },
  { sprite: crate, x: COINS.x, y: COINS.y },
  { sprite: ifRecolour(crate, 'if12-crate-apples', IF_APPLE), x: APPLES.x, y: APPLES.y },
  // Each sign before its holder, so the hand closes over the stick.
  { sprite: bidSign, x: BID.x, y: BID.y },
  { sprite: askSign, x: ASK.x, y: ASK.y },
  { sprite: ifInvestor, x: INVESTOR.x, y: INVESTOR.y },
  { sprite: ifGardener, x: SELLER.x, y: SELLER.y },
]);

export const if12Opener: SceneArt = {
  id: 'if12-opener',
  label: 'On one bank of a moonlit stream an investor with a crate of coins holds up a green sign bidding 19, and on the other bank a seller with a crate of apples holds up a red sign asking 20, a footbridge over the water between them.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: ripple, x: 38, y: 50, motion: { kind: 'drift', amp: 1, periodMs: 1800 } },
    { sprite: ripple, x: 33, y: 55, motion: { kind: 'drift', amp: 1, periodMs: 2200, phase: 0.4 } },
    { sprite: ripple, x: 44, y: 53, motion: { kind: 'drift', amp: 1, periodMs: 2000, phase: 0.7 } },
    { sprite: ifStar, x: 36, y: 57, motion: { kind: 'twinkle', periodMs: 1900, min: 0.15 } },
    { sprite: ifStar, x: 46, y: 51, motion: { kind: 'twinkle', periodMs: 2500, phase: 0.5, min: 0.15 } },
    { sprite: ifGlint, x: COINS.x + 1, y: COINS.y - 1 },
    { sprite: ifStarBig, x: 30, y: 5, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: ifStar, x: 47, y: 11, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.4, min: 0.2 } },
    { sprite: ifStar, x: 66, y: 4, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: ifFirefly, x: 5, y: 50, motion: { kind: 'rise', amp: 5, periodMs: 3500, phase: 0.2 } },
    { sprite: ifFirefly, x: 64, y: 52, motion: { kind: 'rise', amp: 6, periodMs: 4000, phase: 0.6 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemOrders: PixelSprite = {
  id: 'if-emblem-orders',
  name: 'if-emblem-orders',
  tags: ['scene', 'if'],
  blurb: "Lesson 12: a green bid board and a red ask board facing each other across the water. The spread between them.",
  palette: IF_PALETTE,
  rows: [
    'nnnn..rrrr',
    'nmNn..rsRr',
    'nNNn..rRRr',
    'nnnn..rrrr',
    '.hA....hA.',
    '.hA.bb.hA.',
    'LLLLbBLLLL',
    'LLLBwbBLLL',
  ],
};

export const if12Finish: SceneArt = ifKeepsake(
  'if12-finish',
  'A golden acorn hanging from an oak twig, with a green sign and a red sign on posts facing each other across a strip of blue water in its purple window and small sparkles around it.',
  emblemOrders,
);

export const art: LessonArtSet = { opener: if12Opener, backdrop: ifBackdrop, finish: if12Finish };
