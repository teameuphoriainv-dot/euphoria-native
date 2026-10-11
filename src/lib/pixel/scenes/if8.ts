/**
 * Investing Fundamentals lesson 8, Dollar Cost Averaging: the same amount, on the same day, every
 * month, whatever the price.
 *
 * The one full moon of the pathway's sky is replaced by four moons in a row, crescent to full, lit
 * from the left like everything else: four months going by. On the left a calendar is nailed to a
 * post, and each of those four months carries the same gold coin; the next square blinks, due. The
 * investor waters a coin sprout with the same can as always. Water falls (frames), the due square
 * blinks, the lantern flickers, coins glint, stars twinkle and fireflies drift.
 *
 * The keepsake's emblem is the calendar page: a coin in every month so far.
 */
import type { PixelSprite } from '../types';
import {
  IF_INVESTOR_HAND,
  IF_PALETTE,
  ifCompose,
  ifFirefly,
  ifFlame,
  ifGlint,
  ifInvestor,
  ifKeepsake,
  ifLanternPost,
  ifLater,
  ifStage,
  ifStar,
  ifStarBig,
  ifWater,
  ifWateringCan,
} from './if-kit';
import { ifBackdrop } from './if-backdrop';
import { ifBedOf, ifCoinSprout } from './if-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/* ── the sky: four months ──────────────────────────────────────────────────────────────────────── */

/** Night sky laid over the stage's full moon and its halo, so the four phases replace it. */
const moonPatch: PixelSprite = {
  id: 'if8-moon-patch',
  name: 'if8-moon-patch',
  tags: ['scene', 'if'],
  rows: Array.from({ length: 14 }, () => 'k'.repeat(14)),
};

/** Moons, 7x7, lit from the left: the unlit part a faint D so each still reads as a whole disc. */
const moon = (id: string, rows: string[]): PixelSprite => ({ id, name: id, tags: ['scene', 'if'], rows });
const PHASES = [
  moon('if8-moon-crescent', [
    '..wDD..',
    '.wDDDD.',
    'wwDDDDD',
    'wwDDDDD',
    'wwDDDDD',
    '.wDDDD.',
    '..xDD..',
  ]),
  moon('if8-moon-half', [
    '..wwD..',
    '.wwwDD.',
    'wwwwDDD',
    'wwwwDDD',
    'wwwxDDD',
    '.wwxDD.',
    '..xxD..',
  ]),
  moon('if8-moon-gibbous', [
    '..www..',
    '.wwwwD.',
    'wwwwwDD',
    'wwwwwDD',
    'wwwwxDD',
    '.wwxxD.',
    '..xxx..',
  ]),
  moon('if8-moon-full', [
    '..www..',
    '.wwwww.',
    'wwwwwwx',
    'wwwwwwx',
    'wwwwwxx',
    '.wwwxx.',
    '..xxx..',
  ]),
] as const;
const MOON_X = [8, 27, 46, 65] as const;
const MOON_Y = 5;

/* ── the calendar ──────────────────────────────────────────────────────────────────────────────── */

/** A calendar on a board, 15x14: red header with two rings, four months in the first row each marked with the same coin. */
const calendar: PixelSprite = {
  id: 'if8-calendar',
  name: 'if8-calendar',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [
    'hhhhhhhhhhhhhha',
    'hXrrXrrrrXrrXra',
    'hrrrrrrrrrrrrra',
    'hwwwwwwwwwwwwxa',
    'hwyGwyGwyGwyGxa',
    'hwGgwGgwGgwGgxa',
    'hwwwwwwwwwwwwxa',
    'hwxxwxxwxxwxxxa',
    'hwxxwxxwxxwxxxa',
    'hwwwwwwwwwwwwxa',
    'hwxxwxxwxxwxxxa',
    'hwxxwxxwxxwxxxa',
    'hwwwwwwwwwwwwxa',
    'aaaaaaaaaaaaaaa',
  ],
};

const calendarPost: PixelSprite = {
  id: 'if8-calendar-post',
  name: 'if8-calendar-post',
  tags: ['scene', 'if'],
  palette: IF_PALETTE,
  rows: [...Array.from({ length: 10 }, () => '.hA.'), 'ahAa'],
};

/** The next square, due: a gold blink over the first empty one. */
const dueSquare: PixelSprite = {
  id: 'if8-due-square',
  name: 'if8-due-square',
  tags: ['scene', 'if'],
  rows: ['yG', 'Gg'],
};

/* ── the opener ────────────────────────────────────────────────────────────────────────────────── */

const CALENDAR = { x: 3, y: 21 } as const;
const INVESTOR = { x: 26, y: 25 } as const;
const CAN = { x: INVESTOR.x + IF_INVESTOR_HAND.x - 1, y: INVESTOR.y + IF_INVESTOR_HAND.y } as const;
/** The sprout stands under the can's rose, on its own short bed. */
const SPROUT = { x: CAN.x + 10, y: 41 } as const;
const LANTERN = { x: 72, y: 24 } as const;

const base = ifCompose('if8-opener-base', 80, 60, [
  { sprite: ifStage, x: 0, y: 0 },
  { sprite: moonPatch, x: 5, y: 3 },
  ...PHASES.map((sprite, i) => ({ sprite, x: MOON_X[i] ?? 0, y: MOON_Y })),
  { sprite: calendarPost, x: CALENDAR.x + 5, y: CALENDAR.y + 14 },
  { sprite: calendar, x: CALENDAR.x, y: CALENDAR.y },
  { sprite: ifLanternPost, x: LANTERN.x, y: LANTERN.y },
  { sprite: ifBedOf('if8-bed', 14), x: SPROUT.x - 4, y: SPROUT.y + 6 },
  { sprite: ifCoinSprout, x: SPROUT.x, y: SPROUT.y },
  // The can before the investor, so the hand closes over the handle.
  { sprite: ifWateringCan, x: CAN.x, y: CAN.y },
  { sprite: ifInvestor, x: INVESTOR.x, y: INVESTOR.y },
]);

export const if8Opener: SceneArt = {
  id: 'if8-opener',
  label: 'Under four moons from crescent to full, an investor waters a coin sprout beside a calendar on a post where each month so far is marked with the same gold coin.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: ifWater, x: CAN.x + 11, y: CAN.y + 3 },
    { sprite: dueSquare, x: CALENDAR.x + 2, y: CALENDAR.y + 7, motion: { kind: 'twinkle', periodMs: 1400, min: 0.1 } },
    { sprite: ifFlame, x: LANTERN.x + 1, y: LANTERN.y + 3 },
    { sprite: ifGlint, x: SPROUT.x + 1, y: SPROUT.y + 4 },
    { sprite: ifLater(ifGlint, 'if8-glint-calendar', 3, 310), x: CALENDAR.x + 7, y: CALENDAR.y + 3 },
    { sprite: ifStarBig, x: 37, y: 15, motion: { kind: 'twinkle', periodMs: 2300, min: 0.3 } },
    { sprite: ifStar, x: 19, y: 2, motion: { kind: 'twinkle', periodMs: 1800, phase: 0.4, min: 0.2 } },
    { sprite: ifStar, x: 58, y: 14, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: ifStar, x: 76, y: 2, motion: { kind: 'twinkle', periodMs: 2000, phase: 0.2, min: 0.25 } },
    { sprite: ifFirefly, x: 62, y: 44, motion: { kind: 'rise', amp: 5, periodMs: 3400, phase: 0.1 } },
    { sprite: ifFirefly, x: 20, y: 51, motion: { kind: 'rise', amp: 6, periodMs: 4100, phase: 0.5 } },
    { sprite: ifFirefly, x: 67, y: 53, motion: { kind: 'rise', amp: 5, periodMs: 3700, phase: 0.8 } },
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────────── */

const emblemCalendar: PixelSprite = {
  id: 'if-emblem-calendar',
  name: 'if-emblem-calendar',
  tags: ['scene', 'if'],
  blurb: "Lesson 8: a calendar page with the same coin in every month so far.",
  rows: [
    'rrXrrrrXrr',
    'rrrrrrrrrr',
    'wwwwwwwwww',
    'wyGwyGwyGw',
    'wGgwGgwGgw',
    'wwwwwwwwww',
    'wyGwxxwxxw',
    'wGgwxxwxxw',
  ],
};

export const if8Finish: SceneArt = ifKeepsake(
  'if8-finish',
  'A golden acorn hanging from an oak twig, with a calendar page holding the same coin in each month in its purple window and small sparkles around it.',
  emblemCalendar,
);

export const art: LessonArtSet = { opener: if8Opener, backdrop: ifBackdrop, finish: if8Finish };
