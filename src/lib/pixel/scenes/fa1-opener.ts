/**
 * Financial Analytics lesson 1 opener: the data works at night, where raw numbers become decisions.
 *
 * Lesson 1's own diagram, built as a machine: data pours down a chute into the COLLECT hopper,
 * bubbles through the CLEAN tank (outliers drip out into a bin), lights up the ANALYZE screen,
 * swings the MODEL gauge, and leaves the DECIDE slot as a card with a green arrow. A glass conduit
 * along the floor carries it between stations, changing colour on the way (blue raw, teal clean,
 * green insight, gold decision). The pipeline map above lights each stage in turn; the analyst
 * watches from the right, under a sign that rules out the gut-feeling die.
 *
 * The room is drawn here; every station and prop is stamped from fa-kit, so later lessons can
 * rearrange the same parts. The screen is the brightest broad surface; the stations are one value
 * step behind it. Only small layers move.
 */
import {
  faAnalyst,
  faAnalyzer,
  faBubble,
  faCompose,
  faConduit,
  faDecisionCard,
  faEmblemAnalytics,
  faFilterTank,
  faGaugeNeedle,
  faHopper,
  faLamp,
  faLedChase,
  faMapChase,
  faMeter,
  faNoDiceSign,
  faOutlierDrip,
  faOutputSlot,
  faPacketRun,
  faPipelineMap,
  faRawBits,
  faTabletLine,
  FA_ANALYST_TABLET,
  FA_ANALYZER_GLASS,
  FA_ANALYZER_LEDS,
  FA_ANALYZER_NEEDLE,
  FA_FILTER_DRIP,
  FA_HOPPER_COUNTER,
  FA_MAP_LIGHTS,
  FA_OUTPUT_LAMP,
  FA_STEEL,
} from './fa-kit';
import type { PixelSprite } from '../types';
import type { SceneArt } from './types';

const room: PixelSprite = {
  id: 'fa1-opener-room',
  name: 'fa1-opener-room',
  tags: ['scene', 'fa1'],
  blurb: 'The still room: navy wall, the data chute, chair rail, floor and cast shadows.',
  // a/c/e are the data works' steel; Z is the cast-shadow step between the floor and the page.
  palette: FA_STEEL,
  rows: [
    'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'xxxxxxXXDaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'XXXXXxXXDaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'DDDDDxXXDaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaxXXDaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaxXXDaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaxXXDaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaDxXXDDaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaxXXDaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaxXXDaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaxXXDaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaxXXDaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaDxXXXDaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaDKKKKDaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    'ccccccZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZcccccccccccccc',
    'ccccccZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZcccccccccccccccc',
    'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccZZZZZZZZZZZZ',
    'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccZZZZZZZZZZZZ',
    'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
  ],
};

/* Where each station stands. Everything below is placed from these, so a station can move as one. */
const HOPPER = { x: 1, y: 22 } as const;
const FILTER = { x: 14, y: 21 } as const;
const ANALYZER = { x: 25, y: 11 } as const;
const OUTPUT = { x: 50, y: 30 } as const;
const ANALYST = { x: 64, y: 33 } as const;
const MAP = { x: 21, y: 2 } as const;
const CONDUIT = { x: 3, y: 45, length: 58 } as const;

const base = faCompose('fa1-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  [faNoDiceSign, 62, 13],
  [faHopper, HOPPER.x, HOPPER.y],
  [faFilterTank, FILTER.x, FILTER.y],
  [faAnalyzer, ANALYZER.x, ANALYZER.y],
  [faOutputSlot, OUTPUT.x, OUTPUT.y],
  [faConduit('fa1-opener-conduit', CONDUIT.length), CONDUIT.x, CONDUIT.y],
  [faAnalyst, ANALYST.x, ANALYST.y],
]);

/** Packets in the conduit, coloured by the station they are passing: run pixels, not scene pixels. */
const packets = faPacketRun('fa1-opener-packets', CONDUIT.length - 2, [
  [HOPPER.x + 12 - CONDUIT.x - 1, 'B'],
  [FILTER.x + 10 - CONDUIT.x - 1, 'T'],
  [ANALYZER.x + 24 - CONDUIT.x - 1, 'N'],
  [Infinity, 'y'],
], 6, 200);

export const fa1Opener: SceneArt = {
  id: 'fa1-opener',
  label: 'A data plant at night: numbers pour into a hopper, bubble through a cleaning tank, chart on a screen and come out as a card with a green arrow, while an analyst with a tablet watches.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: faRawBits, x: 5, y: 16 },
    { sprite: faMeter, x: HOPPER.x + FA_HOPPER_COUNTER.x, y: HOPPER.y + FA_HOPPER_COUNTER.y },
    { sprite: faBubble, x: FILTER.x + 3, y: FILTER.y + 14, motion: { kind: 'rise', amp: 6, periodMs: 1800 } },
    { sprite: faBubble, x: FILTER.x + 6, y: FILTER.y + 15, motion: { kind: 'rise', amp: 6, periodMs: 2300, phase: 0.5 } },
    { sprite: faBubble, x: FILTER.x + 5, y: FILTER.y + 13, motion: { kind: 'rise', amp: 4, periodMs: 2000, phase: 0.25 } },
    { sprite: faOutlierDrip, x: FILTER.x + FA_FILTER_DRIP.x, y: FILTER.y + FA_FILTER_DRIP.y },
    { sprite: faEmblemAnalytics, x: ANALYZER.x + FA_ANALYZER_GLASS.x + 1, y: ANALYZER.y + FA_ANALYZER_GLASS.y + 1 },
    { sprite: faLedChase, x: ANALYZER.x + FA_ANALYZER_LEDS.x, y: ANALYZER.y + FA_ANALYZER_LEDS.y },
    { sprite: faGaugeNeedle, x: ANALYZER.x + FA_ANALYZER_NEEDLE.x, y: ANALYZER.y + FA_ANALYZER_NEEDLE.y },
    { sprite: faDecisionCard, x: OUTPUT.x + 1, y: OUTPUT.y - 9, motion: { kind: 'rise', amp: 5, periodMs: 2880 } },
    { sprite: faLamp, x: OUTPUT.x + FA_OUTPUT_LAMP.x, y: OUTPUT.y + FA_OUTPUT_LAMP.y, motion: { kind: 'twinkle', periodMs: 1440, min: 0.3 } },
    { sprite: faMapChase, x: MAP.x + FA_MAP_LIGHTS.x, y: MAP.y + FA_MAP_LIGHTS.y },
    { sprite: packets, x: CONDUIT.x + 1, y: CONDUIT.y + 2 },
    { sprite: faTabletLine, x: ANALYST.x + FA_ANALYST_TABLET.x, y: ANALYST.y + FA_ANALYST_TABLET.y },
  ],
};
