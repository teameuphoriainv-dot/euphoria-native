/**
 * Corporate Finance lesson 18, Treasury Management & Cash Flow: keeping the company's cash safe and
 * on hand.
 *
 * Opener: the treasury. A riveted steel vault front stands in the hall with its round door swung
 * right open, and the conveyor brings cash in from the works off the left edge, over the sill and
 * into the vault, where the cash pile is kept in reserve under a shelf of gold bars. The CFO, as
 * treasurer, stands guard by the open door. The gold and the cash inside the dark vault are the
 * brightest surfaces; the steel ring frames them. Only small layers move: bundles riding the belt,
 * the door's wheel turning, a coin turning up off the pile, the green light over the door, a glint
 * on the gold.
 *
 * Keepsake: a round vault door with its spoked wheel.
 */
import type { PixelSprite } from '../types';
import { cfBackdrop } from './cf-backdrop';
import { cfKeepsake } from './cf1-finish';
import { CF_PALETTE, cfCashPile, cfCfo, cfCoinSpin, cfCompose, cfHall, cfSconce, cfShadowShort } from './cf-kit';
import type { LessonArtSet, SceneArt } from './types';

/** The vault's round opening, in scene pixels: its centre, its radius, the sill row that cuts it. */
const VAULT = { cx: 31, cy: 35, r: 12, sill: 46 } as const;
/** The steel front the opening is cut through. */
const FRONT = { x: 12, y: 6, w: 39, h: 45 } as const;
/** The open door, swung right round against the front. */
const DOOR = { cx: 59, cy: 33, r: 12 } as const;
/** The belt, running in from off the left edge to the sill. */
const BELT = { y: 46, w: 27 } as const;

/**
 * The vault's steel front, riveted, with the round opening cut through it: a dark lip, a bright
 * ring, a dark edge, and under the opening the sill the cash rolls in over. Computed, not drawn: a
 * ring typed by hand is where one row comes out a pixel wider than the next.
 */
const front: PixelSprite = {
  id: 'cf18-vault-front',
  name: 'cf18-vault-front',
  tags: ['scene', 'cf18'],
  blurb: 'A riveted steel vault front with a round opening.',
  rows: Array.from({ length: FRONT.h }, (_, j) =>
    Array.from({ length: FRONT.w }, (_, i) => {
      const x = FRONT.x + i;
      const y = FRONT.y + j;
      if (i === 0 || j === 0 || i === FRONT.w - 1 || j === FRONT.h - 1) return 'D';
      const d = Math.hypot(x - VAULT.cx, y - VAULT.cy);
      if (d < VAULT.r) return y < VAULT.sill ? '.' : y === VAULT.sill ? 'x' : 'X';
      if (d < VAULT.r + 1) return 'D';
      if (d < VAULT.r + 3) return 'x';
      if (d < VAULT.r + 4) return 'D';
      if (i === 1 || j === 1) return 'x';
      const rivet = (i % 6 === 3 && (j === 3 || j === FRONT.h - 4)) || (j % 6 === 3 && (i === 3 || i === FRONT.w - 4));
      return rivet ? 'x' : 'X';
    }).join(''),
  ),
};

/** The dark inside of the vault, its floor a step lighter so the pile stands on something. */
const inside: PixelSprite = {
  id: 'cf18-vault-inside',
  name: 'cf18-vault-inside',
  tags: ['scene', 'cf18'],
  blurb: 'The dark inside of the vault.',
  rows: Array.from({ length: 25 }, (_, j) => (22 + j >= 42 ? 'D' : 'k').repeat(27)),
};

/** Two tiers of gold bars on a walnut shelf at the back of the vault. */
const BAR: readonly string[] = ['yyG.', 'GGg.'];
const shelf: PixelSprite = {
  id: 'cf18-shelf',
  name: 'cf18-shelf',
  tags: ['scene', 'cf18'],
  blurb: 'Gold bars stacked two deep on a walnut shelf.',
  palette: CF_PALETTE,
  rows: [
    ...BAR.map((row) => `..${row.repeat(7)}`.slice(0, 27)),
    ...BAR.map((row) => row.repeat(7).slice(0, 27)),
    'A'.repeat(27),
    'a'.repeat(27),
  ],
};

/**
 * The door, swung open flat against the front: a dark outline, a bright rim set with eight dark
 * bolt heads, a groove, and the steel face. Its wheel is a layer.
 */
const door: PixelSprite = {
  id: 'cf18-vault-door',
  name: 'cf18-vault-door',
  tags: ['scene', 'cf18'],
  blurb: 'A round steel vault door with a bolted rim.',
  rows: Array.from({ length: 2 * DOOR.r + 1 }, (_, j) =>
    Array.from({ length: 2 * DOOR.r + 1 }, (_, i) => {
      const d = Math.hypot(i - DOOR.r, j - DOOR.r);
      if (d > DOOR.r + 0.5) return '.';
      if (d > DOOR.r - 0.5) return 'D';
      if (d > DOOR.r - 2.5) {
        const bolt = Array.from({ length: 8 }, (_, k) => (k * Math.PI) / 4).some(
          (a) => Math.hypot(i - DOOR.r - Math.cos(a) * (DOOR.r - 1.5), j - DOOR.r - Math.sin(a) * (DOOR.r - 1.5)) < 0.75,
        );
        return bolt ? 'D' : 'x';
      }
      if (d > DOOR.r - 3.5) return 'D';
      return 'X';
    }).join(''),
  ),
};

/** The two hinges that hold the door to the front. */
const hinge: PixelSprite = { id: 'cf18-hinge', name: 'cf18-hinge', tags: ['scene', 'cf18'], rows: ['xxxD', 'XXXD', 'DDDD'] };

/** The belt, the kit conveyor drawn long enough to reach the sill, on three pairs of legs. */
const LEGS = [2, 12, 22] as const;
const belt: PixelSprite = {
  id: 'cf18-belt',
  name: 'cf18-belt',
  tags: ['scene', 'cf18'],
  blurb: 'A long belt conveyor on three legs.',
  rows: [
    `${'X'.repeat(BELT.w - 1)}.`,
    `${'DK'.repeat(BELT.w).slice(0, BELT.w - 1)}X`,
    `${'X'.repeat(BELT.w - 1)}.`,
    ...Array.from({ length: 3 }, () => Array.from({ length: BELT.w }, (_, x) => (LEGS.some((l) => l === x) ? 'D' : '.')).join('')),
    Array.from({ length: BELT.w }, (_, x) => (LEGS.some((l) => Math.abs(l - x) <= 1) ? 'D' : '.')).join(''),
  ],
};

/** The status lamp over the door, its lens dark green in the base; the lit lens is a layer. */
const lamp: PixelSprite = { id: 'cf18-lamp', name: 'cf18-lamp', tags: ['scene', 'cf18'], rows: ['.xxx.', 'xnnnx', '.DDD.'] };

/** The vault's floor shadow, cast to the right. */
const vaultShadow: PixelSprite = { id: 'cf18-vault-shadow', name: 'cf18-vault-shadow', tags: ['scene', 'cf18'], palette: CF_PALETTE, rows: ['Z'.repeat(42)] };

const base = cfCompose('cf18-opener-base', cfHall, [
  [inside, 18, 22],
  [cfCashPile, 15, 30],
  [shelf, 18, 24],
  [vaultShadow, 15, 51],
  [front, FRONT.x, FRONT.y],
  [lamp, 29, 8],
  [door, DOOR.cx - DOOR.r, DOOR.cy - DOOR.r],
  [hinge, 45, 26],
  [hinge, 45, 38],
  [belt, 0, BELT.y],
  [cfSconce, 4, 17],
  [cfShadowShort, 70, 57],
  [cfCfo, 67, 31],
], 'The still treasury: the steel vault front, its open door, gold bars and the cash pile inside, the belt, a lamp, the CFO.');

/** One banded bundle riding the belt, five wide; bundles come every eight pixels. */
const BUNDLE: readonly string[] = ['mNwNm', 'NNwNN', 'nnxnn'];

/**
 * Bundles riding the belt two pixels a frame, the belt's top running with them: the kit's load,
 * computed at the belt's length. Its last row lies on the belt's top row.
 */
function loadAt(f: number): string[] {
  const w = BELT.w - 1;
  const bundle = (r: number) =>
    Array.from({ length: w }, (_, x) => {
      const p = (((x - 5 - 2 * f) % 8) + 8) % 8;
      return p < 5 ? (BUNDLE[r]?.[p] ?? '.') : '.';
    }).join('');
  return [bundle(0), bundle(1), bundle(2), Array.from({ length: w }, (_, x) => ((((x - 2 * f) % 4) + 4) % 4 === 0 ? 'x' : 'X')).join('')];
}

const load: PixelSprite = {
  id: 'cf18-opener-load',
  name: 'cf18-opener-load',
  tags: ['scene', 'cf18'],
  blurb: 'Cash bundles riding the belt into the vault.',
  rows: loadAt(0),
  frames: [0, 1, 2, 3].map(loadAt),
  frameMs: 300,
};

/** The door's wheel: four spokes ending in knobs round a white hub, a quarter turn in four steps. */
function wheelAt(turn: number): string[] {
  const c = 5;
  const arm = 4.4;
  const angles = [0, 1, 2, 3].map((k) => turn + (k * Math.PI) / 2);
  return Array.from({ length: 11 }, (_, j) =>
    Array.from({ length: 11 }, (_, i) => {
      const dx = i - c;
      const dy = j - c;
      if (Math.hypot(dx, dy) < 1) return 'w';
      if (angles.some((a) => Math.hypot(dx - Math.cos(a) * arm, dy - Math.sin(a) * arm) < 1.1)) return 'y';
      if (Math.hypot(dx, dy) < 1.6) return 'G';
      const spoke = angles.some((a) => {
        const along = dx * Math.cos(a) + dy * Math.sin(a);
        return along > 0 && along < arm && Math.abs(dy * Math.cos(a) - dx * Math.sin(a)) < 0.6;
      });
      return spoke ? 'G' : '.';
    }).join(''),
  );
}

const wheel: PixelSprite = {
  id: 'cf18-opener-wheel',
  name: 'cf18-opener-wheel',
  tags: ['scene', 'cf18'],
  blurb: 'The vault door wheel turning.',
  rows: wheelAt(0),
  frames: [0, 1, 2, 3].map((k) => wheelAt((k * Math.PI) / 8)),
  frameMs: 320,
};

const lens: PixelSprite = { id: 'cf18-opener-lens', name: 'cf18-opener-lens', tags: ['scene', 'cf18'], rows: ['NmN'] };
const glint: PixelSprite = { id: 'cf18-opener-glint', name: 'cf18-opener-glint', tags: ['scene', 'cf18'], rows: ['.w.', 'wWw', '.w.'] };

export const cf18Opener: SceneArt = {
  id: 'cf18-opener',
  label: 'Cash bundles ride a conveyor into the company vault through its open round door, where the cash pile sits in reserve under a shelf of gold bars, and the finance chief stands guard.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: load, x: 0, y: BELT.y - 3 },
    { sprite: wheel, x: DOOR.cx - 5, y: DOOR.cy - 5 },
    { sprite: cfCoinSpin, x: 37, y: 33, motion: { kind: 'rise', amp: 6, periodMs: 2900 } },
    { sprite: lens, x: 30, y: 9, motion: { kind: 'twinkle', periodMs: 2200, min: 0.3 } },
    { sprite: glint, x: 26, y: 23, motion: { kind: 'twinkle', periodMs: 2600, phase: 0.4, min: 0 } },
  ],
};

/** Lesson 18's emblem: a round vault door, its bright rim, its gold wheel and white hub. */
const emblemVault: PixelSprite = {
  id: 'cf18-emblem-vault',
  name: 'cf18-emblem-vault',
  tags: [],
  blurb: 'A round steel vault door with a gold spoked wheel.',
  rows: [
    '.....DDDDDD.....',
    '...DDxxxxxxDD...',
    '..DDxxxDDxxxDD..',
    '.DDxxDDyyDDxXDD.',
    '.DxxDXXGgXXDXXD.',
    'DxxDXXXGgXXXDXXD',
    'DxxDXXXGgXXXDXXD',
    'DxDyGGGwwGGGyDXD',
    'DxDygggwGgggyDXD',
    'DxxDXXXGgXXXDXXD',
    'DxxDXXXGgXXXDXXD',
    '.DxxDXXGgXXDXXD.',
    '.DDXXDDyyDDXXDD.',
    '..DDXXXDDXXXDD..',
    '...DDXXXXXXDD...',
    '.....DDDDDD.....',
  ],
};

export const cf18Finish = cfKeepsake(
  'cf18-finish',
  'A crystal award on a gold stand with a round vault door and its gold wheel inside, and small sparkles around it.',
  emblemVault,
);

export const art: LessonArtSet = { opener: cf18Opener, backdrop: cfBackdrop, finish: cf18Finish };
