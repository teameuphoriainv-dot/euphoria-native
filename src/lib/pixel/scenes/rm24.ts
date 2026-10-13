/**
 * Risk Management lesson 24 opener, Risk Governance & Board Oversight: the board risk committee in
 * session. Three directors sit along the boardroom table, the bearded chair in orchid between a
 * director in grey and one in green who has a hand up with a question, and the keeper, the CRO,
 * stands at its end laying down the report with a red line across it: a limit breached and brought
 * to the people who set it. On the wall above them hangs the chart of who answers to whom, large: the
 * board's gold box over the three lines of defence, and the breach drawn in red climbing it, up from
 * the first line's box, along the bar and into the board's. The board sets the ceiling, the CRO
 * turns it into limits, the business units take the risk, and a breach comes back up. A calm night
 * in the porthole, the ship's clock at a quarter past four. Moving: the red mark rising into the
 * board's box, the porthole's stars and swell, a glint on the clock.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import { RM_PALETTE, rmCompose, rmKeepsake, rmRetint, rmShipClock, rmWatchRoom } from './rm-kit';
import { rmFlip, rmGlint, rmKeeperRaise, rmKeeperReach, rmMark, rmPortSwell, rmPorthole, rmStar } from './rm-kit-a';
import type { RmPoint } from './rm-kit-a';
import { rmFill, rmMateReach } from './rm-kit-b';
import type { LessonArtSet, SceneArt } from './types';

/* ── the chart on the wall ───────────────────────────────────────────────────────────────────── */

/** Where the chart hangs, and where its centre line runs up into the board's box. */
const CHART = { x: 25, y: 3 };
const SPINE = 15;

/**
 * Who answers to whom, chalked on a slate, 31x19: the board's gold box at the top, a line down to a
 * bar, and from the bar three drops to the three lines of defence (the business in green, risk and
 * the CRO in blue, audit in orchid). The breach is drawn in red, climbing from the first line's box up
 * its drop, along the bar and up the centre line to the board.
 */
const chart: PixelSprite = {
  id: 'rm24-opener-chart',
  name: 'lines of defence',
  tags: ['scene', 'rm24'],
  rows: rmFill(
    Array.from({ length: 19 }, (_, y) => (y === 0 || y === 18 ? 'D'.repeat(31) : y === 1 ? `D${'X'.repeat(29)}D` : `DX${'K'.repeat(28)}D`)),
    [
      [10, 20, 3, 'O'], [10, 20, 4, 'y'], [10, 20, 5, 'G'], [10, 20, 6, 'G'], [10, 20, 7, 'g'], [10, 10, 4, 'O'], [20, 20, 4, 'O'],
      [10, 10, 5, 'O'], [20, 20, 5, 'O'], [10, 10, 6, 'O'], [20, 20, 6, 'O'], [10, 10, 7, 'O'], [20, 20, 7, 'O'], [10, 20, 8, 'O'],
      [SPINE, SPINE, 9, 'R'], [SPINE, SPINE, 10, 'R'], [SPINE, SPINE, 11, 'R'],
      [5, SPINE, 12, 'R'], [SPINE + 1, 25, 12, 'x'],
      [5, 5, 13, 'R'], [SPINE, SPINE, 13, 'x'], [25, 25, 13, 'x'],
      [2, 8, 14, 'm'], [12, 18, 14, 'B'], [22, 28, 14, 'q'],
      [2, 8, 15, 'N'], [12, 18, 15, 'b'], [22, 28, 15, 'P'],
      [2, 8, 16, 'n'], [12, 18, 16, 'b'], [22, 28, 16, 'p'],
    ],
  ),
};

/** The breach on its way up: a red mark that climbs the centre line into the board's box; give it a `rise`. 1x2. */
const breach: PixelSprite = { id: 'rm24-opener-breach', name: 'breach', tags: ['scene', 'rm24'], rows: ['s', 'R'] };

/* ── the committee ───────────────────────────────────────────────────────────────────────────── */

/** A director seen over the table: the cast's head, shoulders and arms, cut where the table top hides the rest. */
const bust = (sprite: PixelSprite, id: string, rows: number): PixelSprite => ({ ...sprite, id, name: id, rows: sprite.rows.slice(0, rows) });

/** The chair: the mate, bearded, in orchid, a hand on the table. */
const chair = bust(rmMateReach, 'rm24-opener-chair', 15);

/** A director in a grey oilskin, a hand on the table. */
const greyDirector = bust(rmRetint(rmKeeperReach, 'rm24-opener-grey-source', { y: 'w', G: 'x', g: 'X', O: 'D' }), 'rm24-opener-grey', 15);

/** A director in green with a hand up and a finger raised: a question for the CRO. */
const greenDirector = bust(rmRetint(rmKeeperRaise, 'rm24-opener-green-source', { y: 'm', G: 'N', g: 'n', O: 'n' }), 'rm24-opener-green', 15);

/**
 * The boardroom table, long and low: a lit far edge, the polished top, a dark apron, and legs at both
 * ends and between the places. 60x12.
 */
const table: PixelSprite = {
  id: 'rm24-opener-table',
  name: 'boardroom table',
  tags: ['scene', 'rm24'],
  rows: rmMark(
    [
      'y'.repeat(60),
      'G'.repeat(60),
      'g'.repeat(60),
      'O'.repeat(60),
      'O'.repeat(60),
      ...Array.from({ length: 7 }, () => '.'.repeat(60)),
    ],
    [2, 3, 29, 30, 56, 57].flatMap((x) => Array.from({ length: 7 }, (_, i): RmPoint => [x, 5 + i, x % 2 === 0 ? 'O' : 'g'])),
  ),
};

/** The report on the table under the keeper's hand: lines of figures and one red line, the breach. 8x3. */
const report: PixelSprite = {
  id: 'rm24-opener-report',
  name: 'report',
  tags: ['scene', 'rm24'],
  rows: ['wwwwwwwx', 'wRRRRRwx', 'xXXXXxxx'],
};

/** The porthole on a calm night: its storm cloud cleared to sky, a small moon. 20x20. */
const calmPorthole: PixelSprite = (() => {
  const clear = rmRetint(rmPorthole, 'rm24-opener-porthole', { k: 'v', K: 'v' });
  return { ...clear, rows: rmMark(clear.rows, [[12, 4, 'y'], [13, 4, 'y'], [12, 5, 'y'], [13, 5, 'w']]) };
})();

/** Floor shadows under the keeper and along the table. */
const floorShadow: PixelSprite = {
  id: 'rm24-opener-floor-shadow',
  name: 'rm24-opener-floor-shadow',
  tags: ['scene', 'rm24'],
  palette: RM_PALETTE,
  rows: rmFill(['.'.repeat(78), '.'.repeat(78)], [[1, 18, 0, 'Z'], [3, 16, 1, 'Z'], [20, 77, 0, 'Z'], [22, 75, 1, 'Z']]),
};

const TABLE = { x: 20, y: 40 };

const base = rmCompose('rm24-opener-base', rmWatchRoom(80, 60, 50), [
  [calmPorthole, 2, 3],
  [chart, CHART.x, CHART.y],
  [rmShipClock, 64, 6],
  [floorShadow, 1, 52],
  [greyDirector, 29, 26],
  [chair, 45, 26],
  [greenDirector, 61, 26],
  [table, TABLE.x, TABLE.y],
  [report, TABLE.x, TABLE.y - 1],
  [rmFlip(rmKeeperReach, 'rm24-opener-keeper'), 2, 24],
]);

export const rm24Opener: SceneArt = {
  id: 'rm24-opener',
  label: 'Three directors sit along a boardroom table as the lighthouse keeper lays down a report with a red line across it, under a chart of the board above three lines of defense where a red line climbs from the first line up to the board.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: rmStar, x: 9, y: 8, motion: { kind: 'twinkle', periodMs: 3600, min: 0.2 } },
    { sprite: rmStar, x: 14, y: 10, motion: { kind: 'twinkle', periodMs: 4200, min: 0.2, phase: 0.5 } },
    { sprite: rmPortSwell, x: 7, y: 13, motion: { kind: 'drift', amp: 1, periodMs: 3400 } },
    { sprite: breach, x: CHART.x + SPINE, y: CHART.y + 10, motion: { kind: 'rise', amp: 3, periodMs: 1600 } },
    { sprite: rmGlint, x: 65, y: 6, motion: { kind: 'twinkle', periodMs: 2800, min: 0.2 } },
  ],
};

/**
 * Lesson 24's emblem: the chart itself, in bold strokes. The board's gold box at the top, three boxes
 * for the lines of defence under it (green, blue, orchid), and the breach in red climbing from the
 * first line's box, along the bar and up into the board's. 16x13.
 */
const emblemChart: PixelSprite = {
  id: 'rm24-emblem-chart',
  name: 'board over three lines',
  tags: ['rm', 'emblem', 'lesson 24'],
  rows: [
    '...OOOOOOOOOO...',
    '...OyyyyyyyyO...',
    '...OyGGGGGGgO...',
    '...OOOOOOOOOO...',
    '.......RR.......',
    '.......RR.......',
    '.RRRRRRRRxxxxxx.',
    '.RRRRRRRRxxxxxx.',
    '.RR....xx....xx.',
    'mmmm..BBBB..qqqq',
    'NNNN..BBBB..PPPP',
    'NNNN..bbbb..PPPP',
    'nnnn..bbbb..pppp',
  ],
};

export const rm24Finish: SceneArt = rmKeepsake(
  'rm24-finish',
  'A red and white life ring hanging from a rope, with a chart at its center of a gold board box above three colored boxes for the lines of defense, a red line climbing from the first box up into the board.',
  emblemChart,
);

export const art: LessonArtSet = { opener: rm24Opener, backdrop: rmBackdrop, finish: rm24Finish };
