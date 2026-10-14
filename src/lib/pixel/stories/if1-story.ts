/**
 * IF1's story art ("Maya's $100"): every picture the native lesson's story, toggle and term cards
 * draw, all in the night orchard of the IF1 opener so the lesson reads as one place.
 *
 *   room          Maya's bedroom at night: a window onto the opener's moon, a desk with one drawer,
 *                 a lamp, a wall calendar. The drawer and the calendar's flip are actors.
 *   booth         a movie ticket window under marquee bulbs, a blank price board, two ticket shelves.
 *   orchard       the opener's row, without the investor and the can, for Maya to walk into.
 *   stand         Sunny Juice, a juice stall at the orchard's edge, its keeper behind the counter.
 *   stand-rain    the same stall in the rain, lamp burning low, no customers.
 *   stand-closed  the stall boarded up, keeper gone, lamp out.
 *   bank          a small stone bank with a vault door, under the moon.
 *
 * Stills are the same places with their actors stamped in, for the Idea, Term and Takeaway cards.
 *
 * COMPOSED FROM THE KIT (if-kit*.ts, imported read-only) and if1-props.ts. Nothing in scenes/**
 * changes. Every frame keeps at least one moving layer, framed layers stay inside 32x32 and the rest
 * cost stays under 900 rects: lesson-scenes-pin's contract, which native-lesson-pin applies here.
 */
import type { PixelSprite } from '../types';
import type { SceneArt, SceneLayer } from '../scenes/types';
import {
  ifBed,
  ifCompose,
  ifFirefly,
  ifFlame,
  ifFlip,
  ifGlint,
  ifLanternPost,
  ifLater,
  ifMoneyTree,
  ifSapling,
  ifSparkle,
  ifSprout,
  ifStage,
  ifStar,
  ifStarBig,
  ifYoungTree,
  type IfStamp,
} from '../scenes/if-kit';
import { ifGardener } from '../scenes/if-kit-a';
import {
  arrowDown,
  arrowUp,
  bill,
  billWalk,
  blender,
  bulbs,
  calendar,
  coin100,
  coin100Ghost,
  coin5,
  coin5b,
  coinTiny,
  customerA,
  customerAWalk,
  customerB,
  customerBWalk,
  drawer,
  emberFlame,
  glint,
  lanternDark,
  lanternDim,
  lanternHead,
  maya,
  mayaWalk,
  pottedSprout,
  rain,
  shelf,
  shield,
  spr,
  sticker,
  ticket,
  ticketGhost,
} from './if1-props';
import {
  awning,
  boards,
  bankFront,
  boothFront,
  COUNTER_Y,
  counter,
  crate,
  HANG_LAMP,
  KEEPER,
  post,
  sign,
  STAND,
  wall,
} from './if1-places';
import type { StoryArt } from './types';

const W = 80;
const H = 60;

const scene = (id: string, label: string, stamps: readonly IfStamp[], layers: SceneLayer[]): SceneArt => ({
  id,
  label,
  width: W,
  height: H,
  base: ifCompose(`${id}-base`, W, H, stamps),
  layers,
});

/** A still: a frame with actors stamped into its base, keeping the frame's moving layers. */
const still = (id: string, label: string, frame: SceneArt, stamps: readonly IfStamp[], extra: SceneLayer[] = []): SceneArt =>
  scene(id, label, [{ sprite: frame.base, x: 0, y: 0 }, ...stamps], [...frame.layers, ...extra]);

const twinkle = (periodMs: number, phase: number, min = 0.2) => ({ kind: 'twinkle' as const, periodMs, phase, min });
const drift = (amp: number, periodMs: number, phase: number) => ({ kind: 'rise' as const, amp, periodMs, phase });

/* ── room ──────────────────────────────────────────────────────────────────────────────────────── */

const LAMP = { x: 66, y: 26 } as const;
export const CALENDAR_AT = { x: 36, y: 12 } as const;

const room = scene(
  'if1s-room',
  "Maya's bedroom at night: a window onto the moon, a wooden desk with one drawer, a lamp and a wall calendar.",
  [
    { sprite: ifStage, x: 0, y: 0 },
    { sprite: wall, x: 0, y: 0 },
    { sprite: shelf, x: 48, y: 20 },
    { sprite: pottedSprout, x: 53, y: 13 },
    // The calendar is on the wall in every room beat; the actor flips its page over this still.
    { sprite: calendar, x: CALENDAR_AT.x, y: CALENDAR_AT.y },
    // No drawer front here: the drawer is an actor in every room beat, and a front stamped into the
    // base would stay behind when the actor slides open, showing two drawers instead of a dark inside.
    { sprite: lanternHead, x: LAMP.x, y: LAMP.y },
  ],
  [
    { sprite: ifFlame, x: LAMP.x + 1, y: LAMP.y + 3 },
    { sprite: ifStar, x: 24, y: 7, motion: twinkle(2300, 0.1) },
    { sprite: ifStar, x: 26, y: 12, motion: twinkle(1900, 0.5) },
    { sprite: ifStar, x: 23, y: 15, motion: twinkle(2700, 0.8, 0.25) },
    { sprite: ifStar, x: 7, y: 21, motion: twinkle(2100, 0.3, 0.3) },
  ],
);

/* ── booth ─────────────────────────────────────────────────────────────────────────────────────── */

const booth = scene(
  'if1s-booth',
  'A movie ticket window at night under a row of marquee bulbs, with a blank price board and two empty ticket shelves.',
  [{ sprite: ifStage, x: 0, y: 0 }, { sprite: boothFront, x: 0, y: 0 }],
  [
    { sprite: bulbs('if1s-bulbs-a', 47, 0), x: 33, y: 11, motion: twinkle(900, 0, 0.35) },
    { sprite: bulbs('if1s-bulbs-b', 47, 1), x: 33, y: 11, motion: twinkle(900, 0.5, 0.35) },
    { sprite: bulbs('if1s-bulbs-c', 47, 2), x: 33, y: 13, motion: twinkle(900, 0.25, 0.35) },
    { sprite: ifStar, x: 12, y: 6, motion: twinkle(2300, 0.2) },
    { sprite: ifStarBig, x: 24, y: 3, motion: twinkle(2700, 0.6, 0.3) },
    { sprite: ifFirefly, x: 6, y: 50, motion: drift(5, 3400, 0.1) },
    { sprite: ifFirefly, x: 28, y: 53, motion: drift(5, 3900, 0.6) },
  ],
);

/* ── orchard ───────────────────────────────────────────────────────────────────────────────────── */

const glintLater = ifLater(ifGlint, 'if1s-glint-later', 2, 290);
const glintLatest = ifLater(ifGlint, 'if1s-glint-latest', 4, 330);
const orchardLayers: SceneLayer[] = [
  { sprite: ifFlame, x: 3, y: 27 },
  { sprite: ifGlint, x: 70, y: 17 },
  { sprite: glintLater, x: 65, y: 27 },
  { sprite: glintLatest, x: 59, y: 30 },
  { sprite: ifStarBig, x: 30, y: 5, motion: twinkle(2300, 0, 0.3) },
  { sprite: ifStar, x: 41, y: 2, motion: twinkle(1800, 0.4) },
  { sprite: ifStar, x: 47, y: 12, motion: twinkle(2600, 0.7) },
  { sprite: ifStar, x: 66, y: 5, motion: twinkle(2900, 0.55) },
  { sprite: ifFirefly, x: 7, y: 44, motion: drift(5, 3400, 0.1) },
  { sprite: ifFirefly, x: 42, y: 31, motion: drift(6, 4100, 0.5) },
  { sprite: ifFirefly, x: 54, y: 42, motion: drift(4, 3000, 0.3) },
];
const orchardStamps: IfStamp[] = [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: ifBed, x: 24, y: 47 },
  { sprite: ifLanternPost, x: 2, y: 24 },
  { sprite: ifMoneyTree, x: 56, y: 14 },
  { sprite: ifYoungTree, x: 45, y: 27 },
  { sprite: ifSapling, x: 37, y: 35 },
  { sprite: ifSprout, x: 30, y: 43 },
];
const orchard = scene(
  'if1s-orchard',
  'The orchard at night: a row of trees that grow taller from a small sprout to a big tree hung with gold coins, under a full moon.',
  orchardStamps,
  orchardLayers,
);

/* ── the stand ─────────────────────────────────────────────────────────────────────────────────── */

const standStamps = (lamp: PixelSprite, open: boolean): IfStamp[] => [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: sign, x: 43, y: 4 },
  ...(open ? [{ sprite: ifGardener, x: KEEPER.x, y: KEEPER.y }] : []),
  { sprite: post, x: STAND.x + 1, y: 18 },
  { sprite: post, x: STAND.x + STAND.w - 3, y: 18 },
  { sprite: awning, x: STAND.x, y: 12 },
  { sprite: counter, x: STAND.x, y: COUNTER_Y },
  ...(open ? [{ sprite: crate, x: 37, y: COUNTER_Y - 6 }] : [{ sprite: boards, x: STAND.x + 2, y: 21 }]),
  { sprite: spr('if1s-hook', ['..D..']), x: HANG_LAMP.x, y: HANG_LAMP.y - 1 },
  { sprite: lamp, x: HANG_LAMP.x, y: HANG_LAMP.y },
];
const nightSky: SceneLayer[] = [
  { sprite: ifStarBig, x: 14, y: 4, motion: twinkle(2300, 0.1, 0.3) },
  { sprite: ifStar, x: 26, y: 9, motion: twinkle(1800, 0.4) },
  { sprite: ifStar, x: 68, y: 6, motion: twinkle(2600, 0.7) },
  { sprite: ifStar, x: 75, y: 15, motion: twinkle(2000, 0.2, 0.25) },
];

const stand = scene(
  'if1s-stand',
  'Sunny Juice, a small juice stand under a striped awning at night, its keeper behind the counter beside a crate of oranges.',
  standStamps(lanternHead, true),
  [{ sprite: ifFlame, x: HANG_LAMP.x + 1, y: HANG_LAMP.y + 3 }, ...nightSky, { sprite: ifFirefly, x: 8, y: 52, motion: drift(5, 3600, 0.3) }],
);
const standRain = scene(
  'if1s-stand-rain',
  'Sunny Juice in the rain, its lamp burning low and no customers in sight.',
  standStamps(lanternDim, true),
  [
    { sprite: emberFlame, x: HANG_LAMP.x + 1, y: HANG_LAMP.y + 3 },
    { sprite: rain, x: 0, y: 2 },
    { sprite: ifLater(rain, 'if1s-rain-later', 1, 170), x: 27, y: 4 },
    { sprite: rain, x: 54, y: 1 },
  ],
);
const standClosed = scene(
  'if1s-stand-closed',
  'Sunny Juice boarded up, the keeper gone and the lamp out.',
  standStamps(lanternDark, false),
  [...nightSky, { sprite: ifFirefly, x: 46, y: 40, motion: drift(6, 4200, 0.4) }],
);

/* ── the bank ──────────────────────────────────────────────────────────────────────────────────── */

const bank = scene(
  'if1s-bank',
  'A small stone bank with columns and a round vault door, under the moon.',
  [{ sprite: ifStage, x: 0, y: 0 }, { sprite: bankFront, x: 0, y: 0 }],
  [
    { sprite: ifStarBig, x: 22, y: 4, motion: twinkle(2500, 0.2, 0.3) },
    { sprite: ifStar, x: 70, y: 5, motion: twinkle(1900, 0.6) },
    { sprite: ifStar, x: 33, y: 9, motion: twinkle(2300, 0.9) },
    { sprite: ifFirefly, x: 10, y: 52, motion: drift(5, 3500, 0.2) },
    { sprite: ifFirefly, x: 76, y: 50, motion: drift(5, 4000, 0.7) },
  ],
);

/* ── stills ────────────────────────────────────────────────────────────────────────────────────── */

const TICKETS = { x: 38, y: 37 } as const;
const ticketRow = (k: number): IfStamp => ({
  sprite: k === 9 ? ticketGhost : ticket,
  x: TICKETS.x + (k % 5) * 8,
  y: TICKETS.y + Math.floor(k / 5) * 5,
});

/** Ten equal tiles standing on the ground, the first one hers: Sunny Juice in ten pieces. */
const pieces = spr('if1s-pieces', Array.from({ length: 10 }, (_, y) =>
  Array.from({ length: 59 }, (__, x) => {
    const k = Math.floor(x / 6);
    if (x % 6 === 5) return '.';
    if (k === 0) return y === 0 ? 'q' : 'P';
    return y === 0 ? 'w' : x % 6 === 4 ? 'X' : 'x';
  }).join('')));

/** A stack of `coins` coins, 6 wide, seen from the side, with a lit face on top. */
const coinStack = (id: string, coins: number) =>
  spr(id, ['.OOOO.', 'OyyGGO', ...Array.from({ length: coins }, (_, k) => (k % 2 === 0 ? 'OGGggO' : 'OOGgOO'))]);
const STACKS = [[34, 2], [44, 3], [54, 5], [64, 8]] as const;
const stackStamps: IfStamp[] = STACKS.map(([x, n], i) => ({ sprite: coinStack(`if1s-stack-${String(i)}`, n), x, y: 46 - (n + 2) + 1 }));

/** The orchard's ground with nothing planted: a quiet stage for a still about one small thing. */
const ground = scene('if1s-ground', 'The orchard ground at night, beside a lantern.', [{ sprite: ifStage, x: 0, y: 0 }, { sprite: ifBed, x: 24, y: 47 }, { sprite: ifLanternPost, x: 2, y: 24 }], [
  { sprite: ifFlame, x: 3, y: 27 },
  ...orchardLayers.slice(4, 8),
  { sprite: ifFirefly, x: 70, y: 44, motion: drift(5, 3600, 0.4) },
]);

/** Maya turned to the moon on her left, her eye a pixel higher: looking up. */
const mayaUp = (() => {
  const flipped = ifFlip(maya, 'if1s-maya-left');
  const rows = [...flipped.rows];
  rows[6] = rows[6].replace('K', 'C');
  const eye = flipped.rows[6].indexOf('K');
  rows[5] = rows[5].slice(0, eye) + 'K' + rows[5].slice(eye + 1);
  return { ...flipped, id: 'if1s-maya-up', name: 'if1s-maya-up', rows };
})();

const stills: Record<string, SceneArt> = {
  'booth-up': still(
    'if1s-booth-up',
    'At the ticket window, an amber up arrow is stuck on the price board, and one of the 10 tickets is now a grey outline.',
    booth,
    [{ sprite: maya, x: 10, y: 26 }, ...Array.from({ length: 10 }, (_, k) => ticketRow(k)), { sprite: sticker, x: 53, y: 18 }],
  ),
  'orchard-sprout': still(
    'if1s-orchard-sprout',
    'Maya stands beside a small sprout at the start of the orchard row, under the moon.',
    orchard,
    [{ sprite: maya, x: 15, y: 26 }],
  ),
  'stand-piece': still(
    'if1s-stand-piece',
    'Maya beside the Sunny Juice stand. Below it, the company drawn as 10 equal tiles, the first one lit in purple: hers.',
    stand,
    [{ sprite: maya, x: 2, y: 26 }, { sprite: pieces, x: 18, y: 48 }],
  ),
  'stand-lend': still(
    'if1s-stand-lend',
    'Maya hands a gold coin to the Sunny Juice keeper, and a new blender stands on the counter.',
    stand,
    [{ sprite: maya, x: 10, y: 26 }, { sprite: coin100, x: KEEPER.x - 2, y: 32 }, { sprite: blender, x: 56, y: 30 }],
  ),
  'coin-plus': still(
    'if1s-coin-plus',
    'Maya holds her bill, and beside it a small gold coin sparkles: a little extra on top.',
    ground,
    // The SMALL coin (coin-5, the bond's "+$5 a year" coin), bottoms level with the bill's (y 35 + 5 rows,
    // y 36 + 4 rows). The big coin-100 is Maya's $100 on screens 4, 5 and 8, so it read as $100 more.
    [{ sprite: maya, x: 15, y: 26 }, { sprite: bill, x: 26, y: 35 }, { sprite: coin5, x: 41, y: 36 }],
    [{ sprite: ifSparkle, x: 43, y: 31, motion: twinkle(1700, 0, 0.45) }],
  ),
  stacks: still(
    'if1s-stacks',
    'Four stacks of gold coins rising left to right, each taller than the last by more, and Maya pointing at the tallest.',
    ground,
    [{ sprite: maya, x: 14, y: 26 }, ...stackStamps],
    [{ sprite: ifGlint, x: 65, y: 46 - 10 }],
  ),
  'orchard-moon': still(
    'if1s-orchard-moon',
    'Maya stands in the orchard at night and looks up at the full moon.',
    orchard,
    [{ sprite: mayaUp, x: 14, y: 26 }],
  ),
};

/* ── the set ───────────────────────────────────────────────────────────────────────────────────── */

export const story: StoryArt = {
  id: 'if1',
  width: 80,
  height: 60,
  frames: { room, booth, orchard, stand, 'stand-rain': standRain, 'stand-closed': standClosed, bank },
  stills,
  actors: {
    maya,
    'maya-walk': mayaWalk,
    'customer-a': customerA,
    'customer-a-walk': customerAWalk,
    'customer-b': customerB,
    'customer-b-walk': customerBWalk,
    drawer,
    bill,
    'bill-walk': billWalk,
    calendar,
    ticket,
    'ticket-ghost': ticketGhost,
    sticker,
    'coin-100': coin100,
    'coin-100-ghost': coin100Ghost,
    'coin-5': coin5,
    'coin-5b': coin5b,
    'coin-tiny': coinTiny,
    blender,
    shield,
    'arrow-up': arrowUp,
    'arrow-down': arrowDown,
    glint,
  },
  // A dropped bill lies over the drawer it falls into, and over the hand that drops it; a glint
  // catches the light over everything.
  order: ['drawer', 'calendar', 'maya', 'customer-a', 'customer-b', 'ticket', 'blender', 'shield', 'bill', 'coin-5', 'coin-5b', 'coin-100', 'coin-tiny', 'sticker', 'arrow-up', 'arrow-down', 'glint'],
};
