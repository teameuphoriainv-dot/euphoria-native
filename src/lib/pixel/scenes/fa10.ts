/**
 * Financial Analytics lesson 10, the capstone: one analysis run end to end.
 *
 * OPENER. The whole line on its big night. Every station of lesson 1 runs in pipeline order, left
 * to right: data pours down the ceiling chute into the COLLECT hopper, bubbles through the CLEAN
 * tank, builds the lesson's picture on the ANALYZE screen while the MODEL gauge swings, and
 * leaves the DECIDE slot as a card. The map chases all five stages. The analyst stands at the
 * head of the line this time, lifting the pathway trophy, while confetti in the stage colours
 * falls at both ends of the room.
 *
 * BACKDROP. The capstone night (fa-kit-b faBackdropCapstone): every window lit, every packet gold.
 *
 * KEEPSAKE. The trophy with the capstone itself: a stepped pyramid built course by course in the
 * five stage colours, blue at the foundation up to a gold capstone that catches the light.
 */
import {
  faAnalyzer,
  faBubble,
  faCompose,
  faConduit,
  faDecisionCard,
  faFilterTank,
  faGaugeNeedle,
  faHopper,
  faLamp,
  faLedChase,
  faMapChase,
  faMeter,
  faOutlierDrip,
  faOutputSlot,
  faPacketRun,
  faPipelineMap,
  faRawBits,
  faTwinkle,
  faTwinkleSmall,
  FA_ANALYZER_GLASS,
  FA_ANALYZER_LEDS,
  FA_ANALYZER_NEEDLE,
  FA_FILTER_DRIP,
  FA_HOPPER_COUNTER,
  FA_MAP_LIGHTS,
  FA_OUTPUT_LAMP,
} from './fa-kit';
import { faDrawnBy, faKeepsake, faRoom } from './fa-kit-a';
import { faAnalystCheer, faBackdropCapstone, faChute, faConfetti, FA_CHEER_SCREEN } from './fa-kit-b';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── the keepsake's emblem (it also fills the analyzer screen) ─────────────────────────────── */

/**
 * LESSON 10: the capstone. A stepped pyramid, one course per stage in pipeline order: collect
 * (blue) at the foundation, then clean (teal), analyze (green), model (orchid), and the decision
 * as the gold capstone. It builds from the bottom, the capstone catches the light, it holds, the
 * screen clears.
 */
export const faEmblemCapstone: PixelSprite = (() => {
  const full = [
    '................',
    '.......yy.......',
    '.......GG.......',
    '......qqqp......',
    '......pppp......',
    '....NNNNNNNn....',
    '....nnnnnnnn....',
    '..TTTTTTTTTTTt..',
    '..tttttttttttt..',
    'BBBBBBBBBBBBBBBb',
    'bbbbbbbbbbbbbbbb',
  ];
  const drawn = faDrawnBy('fa-emblem-capstone', full, (_x, y) => Math.floor((10 - y) / 2), 360, 4);
  const frames = drawn.frames ?? [drawn.rows];
  // The capstone catches the light on the beat after it lands.
  frames[5] = frames[5].map((row, y) => (y === 1 ? row.replace('yy', 'ww') : row));
  return { ...drawn, name: 'emblem capstone', blurb: 'A stepped pyramid in the five stage colours, a gold capstone on top.', frames };
})();

/* ── the line ──────────────────────────────────────────────────────────────────────────────── */

/* Where each station stands, in pipeline order. Everything below is placed from these. */
const ANALYST = { x: 1, y: 26 } as const;
const CHUTE = { x: 19, y: 0 } as const;
const HOPPER = { x: 16, y: 22 } as const;
const FILTER = { x: 29, y: 21 } as const;
const ANALYZER = { x: 40, y: 11 } as const;
const OUTPUT = { x: 65, y: 30 } as const;
const MAP = { x: 30, y: 2 } as const;
const CONDUIT = { x: 17, y: 45, length: 57 } as const;

const room = faRoom('fa10-opener-room', [
  [CONDUIT.x + 2, 50, CONDUIT.length - 2, 1, 'Z'],
  [CONDUIT.x + 2, 51, CONDUIT.length - 4, 1, 'Z'],
  [ANALYST.x + 4, 57, 12, 2, 'Z'],
]);

const base = faCompose('fa10-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  [faChute('fa10-chute', 16), CHUTE.x, CHUTE.y],
  [faHopper, HOPPER.x, HOPPER.y],
  [faFilterTank, FILTER.x, FILTER.y],
  [faAnalyzer, ANALYZER.x, ANALYZER.y],
  [faOutputSlot, OUTPUT.x, OUTPUT.y],
  [faConduit('fa10-opener-conduit', CONDUIT.length), CONDUIT.x, CONDUIT.y],
  [faAnalystCheer, ANALYST.x, ANALYST.y],
]);

/** Packets in the conduit, coloured by the station they are passing: run pixels, not scene pixels. */
const packets = faPacketRun('fa10-opener-packets', CONDUIT.length - 2, [
  [HOPPER.x + 12 - CONDUIT.x - 1, 'B'],
  [FILTER.x + 10 - CONDUIT.x - 1, 'T'],
  [ANALYZER.x + 24 - CONDUIT.x - 1, 'N'],
  [Infinity, 'y'],
], 6, 200);

/**
 * The held trophy's little screen building its own pyramid: the stages light in turn, then the
 * cap. Every frame paints the whole 4x2 glass, so the sprite's own screen never shows through.
 */
const trophyScreen: PixelSprite = {
  id: 'fa10-trophy-screen',
  name: 'trophy screen',
  tags: ['scene', 'fa10'],
  rows: ['KyyK', 'BTNq'],
  frames: [['KKKK', 'BKKK'], ['KKKK', 'BTKK'], ['KKKK', 'BTNK'], ['KKKK', 'BTNq'], ['KyyK', 'BTNq'], ['KwwK', 'BTNq'], ['KyyK', 'BTNq'], ['KKKK', 'KKKK']],
  frameMs: 320,
};

export const fa10Opener: SceneArt = {
  id: 'fa10-opener',
  label: 'The data plant at night with every station running: data pours into a hopper, bubbles through a cleaning tank, builds a stepped pyramid on the analyzer screen and leaves as a decision card, while the analyst lifts a gold trophy and confetti falls.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: faConfetti('fa10-confetti-left', 12, 24, 1), x: 2, y: 0 },
    { sprite: faConfetti('fa10-confetti-right', 14, 26, 2, 170), x: 65, y: 0 },
    { sprite: faRawBits, x: CHUTE.x + 1, y: 16 },
    { sprite: faMeter, x: HOPPER.x + FA_HOPPER_COUNTER.x, y: HOPPER.y + FA_HOPPER_COUNTER.y },
    { sprite: faBubble, x: FILTER.x + 3, y: FILTER.y + 14, motion: { kind: 'rise', amp: 6, periodMs: 1800 } },
    { sprite: faBubble, x: FILTER.x + 6, y: FILTER.y + 15, motion: { kind: 'rise', amp: 6, periodMs: 2300, phase: 0.5 } },
    { sprite: faBubble, x: FILTER.x + 5, y: FILTER.y + 13, motion: { kind: 'rise', amp: 4, periodMs: 2000, phase: 0.25 } },
    { sprite: faOutlierDrip, x: FILTER.x + FA_FILTER_DRIP.x, y: FILTER.y + FA_FILTER_DRIP.y },
    { sprite: faEmblemCapstone, x: ANALYZER.x + FA_ANALYZER_GLASS.x + 1, y: ANALYZER.y + FA_ANALYZER_GLASS.y + 1 },
    { sprite: faLedChase, x: ANALYZER.x + FA_ANALYZER_LEDS.x, y: ANALYZER.y + FA_ANALYZER_LEDS.y },
    { sprite: faGaugeNeedle, x: ANALYZER.x + FA_ANALYZER_NEEDLE.x, y: ANALYZER.y + FA_ANALYZER_NEEDLE.y },
    { sprite: faDecisionCard, x: OUTPUT.x + 1, y: OUTPUT.y - 9, motion: { kind: 'rise', amp: 5, periodMs: 2880 } },
    { sprite: faLamp, x: OUTPUT.x + FA_OUTPUT_LAMP.x, y: OUTPUT.y + FA_OUTPUT_LAMP.y, motion: { kind: 'twinkle', periodMs: 1440, min: 0.3 } },
    { sprite: faMapChase, x: MAP.x + FA_MAP_LIGHTS.x, y: MAP.y + FA_MAP_LIGHTS.y },
    { sprite: packets, x: CONDUIT.x + 1, y: CONDUIT.y + 2 },
    { sprite: trophyScreen, x: ANALYST.x + FA_CHEER_SCREEN.x, y: ANALYST.y + FA_CHEER_SCREEN.y },
    { sprite: faTwinkle, x: 0, y: 19, motion: { kind: 'twinkle', periodMs: 1700, min: 0.5 } },
    { sprite: faTwinkleSmall, x: 13, y: 21, motion: { kind: 'twinkle', periodMs: 1300, phase: 0.4, min: 0.4 } },
  ],
};

export const fa10Finish: SceneArt = faKeepsake(
  'fa10-finish',
  'A gold terminal trophy on a purple stand, its screen building a stepped pyramid of blue, teal, green and purple courses topped with a gold capstone, with small sparkles around it.',
  faEmblemCapstone,
);

export const art: LessonArtSet = { opener: fa10Opener, backdrop: faBackdropCapstone, finish: fa10Finish };
