/**
 * qa-kit-b: what lessons 10 to 17 add to the Quantitative Analysis kit. qa-kit.ts stays the source of
 * the room, the props, the font and the keepsake builder; this file only adds pieces more than one
 * lesson uses, so later batches import both.
 *
 * THE HONOURS. The checkpoint (lesson 10) and the capstone (lesson 25) earn a special keepsake:
 * qaKeepsake with qaRibbonHonour as its base (each orchid strap doubled by a gold stripe) and
 * qaLaurel as an extra layer, a green laurel round the medal that sways with it. The capstone builds
 * the same way with its own emblem, and adds whatever crowns the whole pathway.
 *
 * RANDOM PATHS. qaRandom (seeded) and qaBridge (a random walk pinned at both ends), for the
 * Brownian paths, returns and rates the later lessons draw: the same picture on every build.
 *
 * TWO POSES. qaQuantCheer, both arms up (the checkpoint's "everything comes together", there for
 * the capstone too), and qaQuantHandsOnHips, for watching something go wrong.
 *
 * NATIVE-OWNED (CONSTITUTION 5.5): nothing here is synced from the web repo.
 */
import type { PixelSprite } from '../types';
import { QA_MEDAL_SWAY, QA_PALETTE, qaRibbon } from './qa-kit';
import type { SceneLayer } from './types';

/* ── the honours keepsake ──────────────────────────────────────────────────────────────────────── */

const STRAP = 'EqPPPPpE';
const STRAP_HONOUR = 'EqPyGPpE';

/**
 * The pilot's V ribbon with a gold stripe down the middle of each strap. The neck under the medal's
 * ring stays orchid, so the ring's hole still shows the ribbon threaded through it at every bob.
 */
export const qaRibbonHonour: PixelSprite = {
  ...qaRibbon,
  id: 'qa-ribbon-honour',
  name: 'qa-ribbon-honour',
  blurb: "The honours ribbon, 48x40: the pilot's V ribbon with each strap split by a gold stripe.",
  rows: qaRibbon.rows.map((row, y) => {
    if (y <= 6) return row.split(STRAP).join(STRAP_HONOUR);
    if (y === 7) return '.................EqPyGPEqPyGPpE.................';
    if (y === 8) return '...................EqyEppyGpE...................';
    return row;
  }),
};

/** The medal's disc in the keepsake: its centre and the radius the laurel's stem runs at. */
const DISC = { x: 23.5, y: 22.5 } as const;
const STEM_RADIUS = 12.5;
/** The laurel sprite's corner in the keepsake; it is symmetric about the medal's centre line. */
export const QA_LAUREL_AT = { x: 8, y: 14 } as const;
const LAUREL = { width: 32, height: 24 } as const;

/** Where the leaves grow, in degrees round the disc from straight down: out over the rim's edge, or in. */
const LEAVES: readonly (readonly [number, 'out' | 'in'])[] = [
  [8, 'out'], [28, 'out'], [48, 'out'], [68, 'out'], [88, 'out'], [108, 'out'], [128, 'out'], [40, 'in'], [96, 'in'],
];

/**
 * The laurel: two branches that rise from under the medal and hug its rim, a dark stem with plump
 * leaves alternating out and in along it, each pointing toward the branch's tip, lit at the tip and
 * dark at the stem. Drawn for the left branch and mirrored, so the wreath is heraldically symmetric.
 * Few, fat leaves on purpose: a diagonal costs a rect a pixel, and the keepsake's budget is 400.
 */
function laurelRows(): string[] {
  const cells = Array.from({ length: LAUREL.height }, () => new Array<string>(LAUREL.width).fill('.'));
  const cx = DISC.x - QA_LAUREL_AT.x;
  const cy = DISC.y - QA_LAUREL_AT.y;
  const half = LAUREL.width / 2;
  const set = (x: number, y: number, ch: string) => {
    if (x < 0 || x >= half || y < 0 || y >= LAUREL.height) return;
    cells[y][x] = ch;
  };
  // Angles run from straight down (0) round the left side and up.
  const at = (deg: number) => {
    const t = (deg * Math.PI) / 180;
    return { x: cx - STEM_RADIUS * Math.sin(t), y: cy + STEM_RADIUS * Math.cos(t), t };
  };
  for (let deg = 0; deg <= 136; deg += 2) {
    const p = at(deg);
    set(Math.round(p.x), Math.round(p.y), 'n');
  }
  for (const [deg, side] of LEAVES) {
    const p = at(deg);
    const grow = { x: -Math.cos(p.t), y: -Math.sin(p.t) };
    const out = { x: -Math.sin(p.t), y: Math.cos(p.t) };
    const s = side === 'out' ? 1 : -1;
    // The leaf's axis: mostly out from the stem, leaning toward the branch's tip.
    const ax = (grow.x * 0.6 + s * out.x * 0.8);
    const ay = (grow.y * 0.6 + s * out.y * 0.8);
    const length = side === 'out' ? 4.6 : 3.2;
    for (let y = Math.floor(p.y - 6); y <= p.y + 6; y += 1) {
      for (let x = Math.floor(p.x - 6); x <= p.x + 6; x += 1) {
        const dx = x - p.x;
        const dy = y - p.y;
        const along = dx * ax + dy * ay;
        const across = -dx * ay + dy * ax;
        if (((along - length / 2) / (length / 2)) ** 2 + (across / 1.25) ** 2 > 1) continue;
        set(x, y, along > length * 0.72 ? 'm' : along < length * 0.3 ? 'n' : 'N');
      }
    }
  }
  return cells.map((line) => {
    const left = line.slice(0, half).join('');
    return left + [...left].reverse().join('');
  });
}

export const qaLaurel: PixelSprite = {
  id: 'qa-laurel',
  name: 'qa-laurel',
  tags: ['scene', 'qa', 'keepsake'],
  blurb: 'A green laurel round the medal, 32x24. Lay it at QA_LAUREL_AT with the medal\'s sway, so the two move as one.',
  rows: laurelRows(),
};

/** The laurel as qaKeepsake's extra layer: it sways with the medal, so the wreath stays on its rim. */
export const qaLaurelLayer: SceneLayer = { sprite: qaLaurel, x: QA_LAUREL_AT.x, y: QA_LAUREL_AT.y, motion: QA_MEDAL_SWAY };

/* ── random paths ──────────────────────────────────────────────────────────────────────────────── */

/** A small seeded generator (mulberry32), so a random path is the same picture on every build. */
export function qaRandom(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A random walk from `from` to `to`, a point every `step` pixels across, pinned at both ends (a
 * Brownian bridge): it wanders most in the middle and lands exactly where the lesson needs it.
 * `jitter` sizes the steps; the walk is clamped between rows `top` and `bottom`. Draw it with qaPath.
 */
export function qaBridge(
  seed: number,
  from: readonly [number, number],
  to: readonly [number, number],
  options: { step?: number; jitter?: number; top?: number; bottom?: number } = {},
): [number, number][] {
  const { step = 2, jitter = 1.6, top = -Infinity, bottom = Infinity } = options;
  const rand = qaRandom(seed);
  const steps = Math.max(1, Math.round((to[0] - from[0]) / step));
  const raw = [0];
  for (let i = 1; i <= steps; i += 1) raw.push(raw[i - 1] + (rand() - 0.5) * jitter * 2);
  return raw.map((w, i) => {
    const t = i / steps;
    const y = from[1] + (to[1] - from[1]) * t + (w - raw[steps] * t);
    return [Math.min(to[0], from[0] + i * step), Math.max(top, Math.min(bottom, Math.round(y)))];
  });
}

/* ── the quant, two more poses ─────────────────────────────────────────────────────────────────── */

/**
 * The quant from behind with both hands on the hips, elbows out, 18x30 (qaQuantStanding's body two
 * columns in from each side): the stance for watching something go wrong. Stand it like qaQuantStanding.
 */
export const qaQuantHandsOnHips: PixelSprite = {
  id: 'qa-quant-hands-on-hips',
  name: 'qa-quant-hands-on-hips',
  tags: ['scene', 'qa'],
  blurb: 'The quant from behind, hands on hips, 18x30. Stand it on the floor like qaQuantStanding.',
  palette: QA_PALETTE,
  rows: [
    '.......DDDD.......',
    '......DppEED......',
    '.....DEpEEEED.....',
    '.....DEEEEEED.....',
    '.....DEEEEEED.....',
    '......DEEEED......',
    '.......DssD.......',
    '.....EEDssDEE.....',
    '...EEPPPPPPPPEE...',
    '..EPqqPPPPPPPPpE..',
    '.EqPEPPPPPPPPEPpE.',
    'EqPE.EPPPPPPE.EPpE',
    'EqE..EPPPPPPE..EpE',
    '.EqE.EPPPPPPE.EpE.',
    '..EsEEPPPPPPEEsE..',
    '...EEEppppppEEE...',
    '......DXDDDD......',
    '.....DXDDDDDD.....',
    '.....DXDDKDDD.....',
    '.....DXDDKDDD.....',
    '.....DXDDKXDD.....',
    '.....DXDDKXDD.....',
    '.....DXDDKXDD.....',
    '.....DXDDKXDD.....',
    '.....DXDDKXDD.....',
    '.....DXDDKXDD.....',
    '.....DXDDKXDD.....',
    '....DxxDDKxxDD....',
    '....DDDDDDDDDD....',
    '....ZZZZZZZZZZZ...',
  ],
};

export const qaQuantCheer: PixelSprite = {
  id: 'qa-quant-cheer',
  name: 'qa-quant-cheer',
  tags: ['scene', 'qa'],
  blurb: 'The quant from behind with both arms raised, 22x30: the body as qaQuantReaching, its raised arm mirrored onto the left. Stand it on the floor like qaQuantStanding.',
  palette: QA_PALETTE,
  rows: [
    '.ss................ss.',
    'EssE.....DDDD.....EssE',
    'EPPE....DppEED....EPPE',
    'EqPPE..DEpEEEED..EPPpE',
    '.EPPE..DEEEEEED..EPPE.',
    '.EqPPE.DEEEEEED.EPPpE.',
    '..EPPE..DEEEED..EPPE..',
    '..EqPPE..DssD..EPPpE..',
    '...EqPPEEDssDEEPPPE...',
    '...EqPPPPPPPPPPPPpE...',
    '....EPqqPPPPPPPPpE....',
    '.....EqPPPPPPPPpE.....',
    '.....EqPPPPPPPPpE.....',
    '.....EqPPPPPPPPpE.....',
    '.....EqPPPPPPPPpE.....',
    '.....EqPPPPPPPPpE.....',
    '.....EEppppppppEE.....',
    '.......DXDDDDDD.......',
    '.......DXDDDDDD.......',
    '.......DXDDKDDD.......',
    '.......DXDDKXDD.......',
    '.......DXDDKXDD.......',
    '.......DXDDKXDD.......',
    '.......DXDDKXDD.......',
    '.......DXDDKXDD.......',
    '.......DXDDKXDD.......',
    '.......DXDDKXDD.......',
    '......DxxDDKxxDD......',
    '......DDDDDDDDDD......',
    '......ZZZZZZZZZZZ.....',
  ],
};
