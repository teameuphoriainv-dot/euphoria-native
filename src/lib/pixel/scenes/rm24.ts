/**
 * Risk Management lesson 24 opener, Risk Governance & Board Oversight: a calm night, and the board is
 * sitting. Behind the high bench the mate, in the chair, raises the gavel; before it the keeper, the
 * CRO, holds up the report with a red line across it, a limit breached and taken straight to the top.
 * On the wall, the chart of who answers to whom: the board above, the three lines of defence below it,
 * and the ship's clock. The board sets how much risk the firm will carry; the keeper turns that into
 * limits and brings the breach back up. Moving: the gavel, the candles, the porthole's stars and swell,
 * a glint on the clock.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import { RM_PALETTE, rmCompose, rmKeepsake, rmLater, rmRetint, rmShipClock, rmWatchRoom } from './rm-kit';
import { rmFlip, rmGlint, rmKeeperLift, rmMark, rmPortSwell, rmPorthole, rmStar } from './rm-kit-a';
import { rmFill, rmMateLift } from './rm-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/** One row of the bench's front: three recessed panels across it. */
const panelRow = (panel: string) => `Og${panel}ggg${panel}ggg${panel}gO`;

/** The high bench the board sits behind: a lit top rail, three panels, a dark plinth. 34x19. */
const bench: PixelSprite = {
  id: 'rm24-opener-bench',
  name: 'bench',
  tags: ['scene', 'rm24'],
  rows: [
    `y${'G'.repeat(33)}`,
    'O'.repeat(34),
    `O${'g'.repeat(32)}O`,
    panelRow('OOOOOOOO'),
    ...Array.from({ length: 10 }, () => panelRow('OggggggO')),
    panelRow('OOOOOOOO'),
    `O${'g'.repeat(32)}O`,
    'O'.repeat(34),
    'D'.repeat(34),
    'D'.repeat(34),
  ],
};

/** The gavel, held up by its handle; give it a `bob` and it raps. 7x8. */
const gavel: PixelSprite = {
  id: 'rm24-opener-gavel',
  name: 'gavel',
  tags: ['scene', 'rm24'],
  rows: [
    '.OOOOO.',
    'OyGGGgO',
    'OgggggO',
    '.OOgOO.',
    '...g...',
    '...g...',
    '...O...',
    '...O...',
  ],
};

/** The sound block the gavel comes down on. 4x2. */
const block: PixelSprite = { id: 'rm24-opener-block', name: 'sound block', tags: ['scene', 'rm24'], rows: ['OGGO', 'OggO'] };

/** A candle on the bench, its flame leaning and flickering. Framed, 3x8. */
const BODY = ['wwx', 'wwx', 'wwx', 'wwx', 'OGO'];
const candle: PixelSprite = {
  id: 'rm24-opener-candle',
  name: 'candle',
  tags: ['scene', 'rm24'],
  rows: ['.4.', '454', '.3.', ...BODY],
  frames: [
    ['.4.', '454', '.3.', ...BODY],
    ['4..', '.54', '.3.', ...BODY],
    ['.4.', '.45', '.3.', ...BODY],
    ['..4', '45.', '.3.', ...BODY],
  ],
  frameMs: 210,
};

/** The report the keeper holds up: lines of figures and one red line, the breach. 5x10. */
const report: PixelSprite = {
  id: 'rm24-opener-report',
  name: 'report',
  tags: ['scene', 'rm24'],
  rows: ['xwwwx', 'wXXXw', 'wwwww', 'wXXww', 'wwwww', 'wRRRw', 'wwwww', 'wXXXw', 'wwwww', 'xxxxx'],
};

/** Who answers to whom, chalked on a board: the board in gold, the three lines of defence under it. 15x10. */
const chart: PixelSprite = {
  id: 'rm24-opener-chart',
  name: 'lines of defence',
  tags: ['scene', 'rm24'],
  rows: [
    'DDDDDDDDDDDDDDD',
    'DKKKKKyyyKKKKKD',
    'DKKKKKyyyKKKKKD',
    'DKKKKKKxKKKKKKD',
    'DKKxxxxxxxxxKKD',
    'DKKxKKKxKKKxKKD',
    'DKNNNKBBBKPPPKD',
    'DKNNNKBBBKPPPKD',
    'DKKKKKKKKKKKKKD',
    'DDDDDDDDDDDDDDD',
  ],
};

/** The porthole on a calm night: its storm cloud cleared to sky, a small moon. 20x20. */
const calmPorthole: PixelSprite = (() => {
  const clear = rmRetint(rmPorthole, 'rm24-opener-porthole', { k: 'v', K: 'v' });
  return { ...clear, rows: rmMark(clear.rows, [[12, 4, 'y'], [13, 4, 'y'], [12, 5, 'y'], [13, 5, 'w']]) };
})();

/** Floor shadow under the keeper. */
const floorShadow: PixelSprite = {
  id: 'rm24-opener-floor-shadow',
  name: 'rm24-opener-floor-shadow',
  tags: ['scene', 'rm24'],
  palette: RM_PALETTE,
  rows: rmFill(['.'.repeat(20), '.'.repeat(20)], [[1, 18, 0, 'Z'], [3, 16, 1, 'Z']]),
};

const base = rmCompose('rm24-opener-base', rmWatchRoom(80, 60, 50), [
  [calmPorthole, 2, 5],
  [chart, 24, 7],
  [rmShipClock, 41, 6],
  [floorShadow, 19, 52],
  [rmMateLift, 56, 13],
  [bench, 46, 33],
  [block, 51, 31],
  [rmFlip(rmKeeperLift, 'rm24-opener-keeper'), 20, 24],
  [report, 34, 33],
]);

export const rm24Opener: SceneArt = {
  id: 'rm24-opener',
  label: 'A bearded mate in an orchid oilskin raises a gavel behind a high wooden bench while the lighthouse keeper holds up a report with a red line across it, under the ship\'s clock and a chart of three lines of defense.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rmStar, x: 9, y: 10, motion: { kind: 'twinkle', periodMs: 3600, min: 0.2 } },
    { sprite: rmStar, x: 14, y: 12, motion: { kind: 'twinkle', periodMs: 4200, min: 0.2, phase: 0.5 } },
    { sprite: rmPortSwell, x: 7, y: 15, motion: { kind: 'drift', amp: 1, periodMs: 3400 } },
    { sprite: rmGlint, x: 42, y: 6, motion: { kind: 'twinkle', periodMs: 2800, min: 0.2 } },
    { sprite: candle, x: 47, y: 25 },
    { sprite: rmLater(candle, 'rm24-opener-candle-later', 2, 240), x: 76, y: 25 },
    { sprite: gavel, x: 54, y: 14, motion: { kind: 'bob', amp: 2, periodMs: 1400 } },
  ],
};

/** Distance from (px, py) to the segment from a to b, and how far along it the nearest point lies. */
function toSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): [number, number] {
  const vx = bx - ax;
  const vy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)));
  return [Math.hypot(px - ax - t * vx, py - ay - t * vy), t];
}

/**
 * Lesson 24's emblem: a gavel come down on its block, the head tilted, gold with dark bands and a lit
 * edge, the handle running off to the right, a white flash where it strikes. 15x14.
 */
const emblemGavel: PixelSprite = {
  id: 'rm24-emblem-gavel',
  name: 'gavel',
  tags: ['rm', 'emblem', 'lesson 24'],
  rows: rmMark(
    Array.from({ length: 14 }, (_, y) =>
      Array.from({ length: 15 }, (_, x) => {
        const [head, along] = toSegment(x + 0.5, y + 0.5, 2.5, 8.5, 9.5, 1.5);
        if (head <= 2.4) {
          if ((along > 0.17 && along < 0.27) || (along > 0.73 && along < 0.83)) return 'O';
          return x + y <= 8 ? 'y' : x + y >= 12 ? 'g' : 'G';
        }
        const [handle] = toSegment(x + 0.5, y + 0.5, 6, 5, 12, 11);
        if (handle <= 0.9) return 'g';
        return '.';
      }).join(''),
    ),
    [[2, 11, 'w'], [3, 11, 'w'], [4, 11, 'w'], [5, 11, 'w'], [6, 11, 'w'], [7, 11, 'w'], [2, 12, 'x'], [3, 12, 'x'], [4, 12, 'x'], [5, 12, 'x'], [6, 12, 'x'], [7, 12, 'x'], [3, 13, 'X'], [4, 13, 'X'], [5, 13, 'X'], [6, 13, 'X'], [0, 11, 'W'], [9, 10, 'W'], [9, 12, 'W']],
  ),
};

export const rm24Finish: SceneArt = rmKeepsake(
  'rm24-finish',
  'A red and white life ring hanging from a rope, with a gold gavel at its center, striking its block.',
  emblemGavel,
);

export const art: LessonArtSet = { opener: rm24Opener, backdrop: rmBackdrop, finish: rm24Finish };
