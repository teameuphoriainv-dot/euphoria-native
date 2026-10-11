/**
 * Risk Management lesson 1 opener: the keeper's watch room as a storm comes in, What Is Risk?
 *
 * Composed from the kit (rm-kit.ts) over the watch room: the storm window, the chart table with the
 * logbook and lantern, the ship's clock at 4:15 (the hour JPMorgan's one-page risk report landed)
 * and the barometer standing in for VaR, the one number. Strung across the room are the lesson's
 * four risks as signal flags. Only small layers move: lightning, the ship riding the swell, rain on
 * the glass, the flags, the trembling needle and the lantern flame.
 */
import type { PixelSprite } from '../types';
import {
  RM_PALETTE,
  rmBarometer,
  rmChartTable,
  rmCompose,
  rmKeeper,
  rmLantern,
  rmLater,
  rmLightning,
  rmLogbook,
  rmRain,
  rmRiskFlags,
  rmRopeCoil,
  rmShip,
  rmShipClock,
  rmStormWindow,
  rmSwell,
  rmWatchRoom,
} from './rm-kit';
import type { SceneArt } from './types';

/** Floor shadows under the table and the keeper, so neither floats. */
const floorShadow: PixelSprite = {
  id: 'rm1-opener-floor-shadow',
  name: 'rm1-opener-floor-shadow',
  tags: ['scene', 'rm1'],
  palette: RM_PALETTE,
  rows: [
    '...ZZZZZZZZZZZZZZZZZZ.......ZZZZZZZZZZZZZZZZZZZZZZZZZ.',
    '.....ZZZZZZZZZZZZZZ..........ZZZZZZZZZZZZZZZZZZZZZZZ..',
  ],
};

const base = rmCompose('rm1-opener-base', rmWatchRoom(80, 60, 50), [
  [rmStormWindow, 2, 8],
  [floorShadow, 26, 52],
  [rmChartTable, 53, 38],
  [rmShipClock, 52, 12],
  [rmLogbook, 65, 36],
  [rmRopeCoil, 7, 51],
]);

export const rm1Opener: SceneArt = {
  id: 'rm1-opener',
  label: 'A lighthouse keeper in a yellow raincoat watches a storm at sea through a tall window with a spyglass, under four colored signal flags, beside a barometer and a clock at a quarter past four.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rmLightning, x: 10, y: 15 },
    { sprite: rmShip, x: 20, y: 14, motion: { kind: 'bob', amp: 1, periodMs: 2200 } },
    { sprite: rmSwell, x: 6, y: 28, motion: { kind: 'drift', amp: 2, periodMs: 3400 } },
    { sprite: rmSwell, x: 8, y: 31, motion: { kind: 'drift', amp: 2, periodMs: 3400, phase: 0.5 } },
    { sprite: rmRain, x: 4, y: 10 },
    { sprite: rmKeeper, x: 30, y: 24 },
    { sprite: rmRiskFlags, x: 1, y: 2 },
    { sprite: rmBarometer, x: 65, y: 11 },
    { sprite: rmLater(rmLantern, 'rm1-opener-lantern', 1, 190), x: 55, y: 30 },
  ],
};
