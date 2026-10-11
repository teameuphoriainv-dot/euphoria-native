/**
 * Global Economics lesson 7: fiscal policy and government spending, in the city plaza at dusk.
 *
 * The capitol stands on the plaza steps, its flag flying from the dome. The student holds up a coin
 * and coins float up toward the building: taxes are where the state's money comes from. Beside the
 * steps, a pile of paper bonds keeps growing taller: when the state spends more than it takes in,
 * it borrows the difference, and the debt piles up. Only small layers move: the flag, the coins,
 * the pile of bonds, the lamps and the first stars.
 *
 * The keepsake's emblem is the capitol's dome with its flag flying.
 */
import type { PixelSprite } from '../types';
import { geBackdrop } from './ge-backdrop';
import { GE_PALETTE, GE_STUDENT_HOLD, geCoinSmall, geCompose, geFlag, geLater, geStamp, geStar, geStarBig, geStudent } from './ge-kit';
import { GE_PLAZA_LAMPS, GE_PLAZA_STAGE, geCapitolGrand, geGroundPlaza, geLampGlow, geShadow } from './ge-kit-a';
import { geKeepsake } from './ge1-finish';
import type { LessonArtSet, SceneArt } from './types';

/* ── one-off props ──────────────────────────────────────────────────────────────────────────── */

/** One bundle of bonds, 12x2: white paper tied with a red band. */
const bundle = ['zzzzzrrzzzzx', 'xxxxx11xxxxX'];

const PILE = { w: 13, h: 18 } as const;

/** The pile with `n` bundles, each laid a pixel off the one under it, bottom row fixed. */
function pileFrame(n: number): string[] {
  let rows: string[] = Array.from({ length: PILE.h }, () => '.'.repeat(PILE.w));
  for (let i = 0; i < n; i += 1) rows = geStamp(rows, bundle, i % 2, PILE.h - 2 * (i + 1));
  return rows;
}

/** The national debt: a pile of bonds growing a bundle at a time, then holding before it starts again. */
const debtPile: PixelSprite = {
  id: 'ge7-opener-debt',
  name: 'pile of bonds',
  tags: ['ge7', 'animated'],
  blurb: 'A pile of white paper bonds tied with red bands, growing taller.',
  palette: GE_PALETTE,
  rows: pileFrame(9),
  frames: [5, 6, 7, 8, 9, 9].map(pileFrame),
  frameMs: 800,
};

/* ── the opener ─────────────────────────────────────────────────────────────────────────────── */

const CAPITOL = { x: GE_PLAZA_STAGE.x, y: GE_PLAZA_STAGE.bottom + 1 - geCapitolGrand.rows.length };
/** Where the student stands. The coin and the shadow are placed from it. */
const STUDENT = { x: 8, y: 34 };

const base = geCompose('ge7-opener-base', geGroundPlaza, [
  { sprite: geCapitolGrand, x: CAPITOL.x, y: CAPITOL.y },
  { sprite: geShadow, x: STUDENT.x + 7, y: STUDENT.y + 24 },
  { sprite: geStudent, x: STUDENT.x, y: STUDENT.y },
]);

const coinLater = geLater(geCoinSmall, 'ge7-opener-coin-later', 2, 300);

export const ge7Opener: SceneArt = {
  id: 'ge7-opener',
  label: 'At dusk a domed government building flies its flag while a student holds up a coin and coins float up toward it as taxes, and beside its steps a pile of paper bonds keeps growing taller.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: geFlag, x: CAPITOL.x + 17, y: CAPITOL.y - 8 },
    { sprite: geCoinSmall, x: STUDENT.x + GE_STUDENT_HOLD.x, y: STUDENT.y + GE_STUDENT_HOLD.y },
    { sprite: geCoinSmall, x: 18, y: 31, motion: { kind: 'rise', amp: 10, periodMs: 3000 } },
    { sprite: coinLater, x: 21, y: 34, motion: { kind: 'rise', amp: 10, periodMs: 3000, phase: 0.5 } },
    { sprite: debtPile, x: 62, y: 46 - PILE.h + 1 },
    { sprite: geLampGlow, x: GE_PLAZA_LAMPS[0].x, y: GE_PLAZA_LAMPS[0].y, motion: { kind: 'twinkle', periodMs: 2600, min: 0.45 } },
    { sprite: geLampGlow, x: GE_PLAZA_LAMPS[1].x, y: GE_PLAZA_LAMPS[1].y, motion: { kind: 'twinkle', periodMs: 3100, phase: 0.5, min: 0.45 } },
    { sprite: geStarBig, x: 58, y: 2, motion: { kind: 'twinkle', periodMs: 2400, min: 0.3 } },
    { sprite: geStar, x: 20, y: 4, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.4, min: 0.2 } },
    { sprite: geStar, x: 9, y: 9, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.7, min: 0.2 } },
    { sprite: geStar, x: 74, y: 9, motion: { kind: 'twinkle', periodMs: 2100, phase: 0.2, min: 0.25 } },
  ],
};

/* ── the keepsake ───────────────────────────────────────────────────────────────────────────── */

/** The state: a capitol's dome and portico, its flag flying from the lantern. */
const emblemDome: PixelSprite = {
  id: 'ge7-emblem-dome',
  name: 'emblem capitol dome',
  tags: ['ge', 'emblem', 'animated'],
  blurb: 'A small domed capitol with columns and lit windows, an emerald flag flying from its top.',
  palette: GE_PALETTE,
  rows: [
    '........G.......',
    '........XmmmN...',
    '........XNNNn...',
    '........XnnnJ...',
    '........X.......',
    '.......DxD......',
    '......DwxxD.....',
    '.....DwxxxXD....',
    '....DwxxxxxXD...',
    '....DDDDDDDDD...',
    '....DyDyDyDyD...',
    '.DDDDDDDDDDDDDDD',
    '.DwxDkDwxDkDwxD.',
    '.DwxDkDwxDkDwxD.',
    'DDDDDDDDDDDDDDDD',
    'xxxxxxxxxxxxxxxx',
  ],
  frames: [
    [
      '........G.......',
      '........XmmmN...',
      '........XNNNn...',
      '........XnnnJ...',
      '........X.......',
      '.......DxD......',
      '......DwxxD.....',
      '.....DwxxxXD....',
      '....DwxxxxxXD...',
      '....DDDDDDDDD...',
      '....DyDyDyDyD...',
      '.DDDDDDDDDDDDDDD',
      '.DwxDkDwxDkDwxD.',
      '.DwxDkDwxDkDwxD.',
      'DDDDDDDDDDDDDDDD',
      'xxxxxxxxxxxxxxxx',
    ],
    [
      '........G.......',
      '........XmmN....',
      '........XNNmN...',
      '........XnnNn...',
      '........X..nJ...',
      '.......DxD......',
      '......DwxxD.....',
      '.....DwxxxXD....',
      '....DwxxxxxXD...',
      '....DDDDDDDDD...',
      '....DyDyDyDyD...',
      '.DDDDDDDDDDDDDDD',
      '.DwxDkDwxDkDwxD.',
      '.DwxDkDwxDkDwxD.',
      'DDDDDDDDDDDDDDDD',
      'xxxxxxxxxxxxxxxx',
    ],
  ],
  frameMs: 500,
};

export const ge7Finish: SceneArt = geKeepsake(
  'ge7-finish',
  'A postage stamp with perforated edges and an emerald frame, showing a domed capitol with columns and an emerald flag flying from its top, with small sparkles around it.',
  emblemDome,
);

export const art: LessonArtSet = { opener: ge7Opener, backdrop: geBackdrop, finish: ge7Finish };
