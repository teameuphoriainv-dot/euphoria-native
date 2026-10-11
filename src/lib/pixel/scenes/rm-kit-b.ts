/**
 * The Risk Management kit, batch B: the pieces lessons 10 to 17 share, built on rm-kit.ts and rm-kit-a.ts.
 *
 * THE LIGHTHOUSE, LIT. Lessons 1 to 9 happen inside; the capstones step out onto the gallery, so here
 * is the light itself: the lantern room with its red dome and the lens burning behind the glass
 * (rmLanternRoom), a bright beam at any length and angle (rmBeam) and a glow that pulses on the lens
 * (rmLensGlow). rmGalleryRail is the railed deck round the lantern at any width; rmTower paints the
 * banded tower at any size, under the gallery or down at its foot where the sea comes in.
 *
 * THE CAPSTONE DRESS. rmKeepsakeGold is rmKeepsake with the ring in gold and white; rmBackdropStorm
 * is the harbour backdrop with a storm coming on, lightning stepped down to the backdrop's quiet
 * tones. Lessons 10 and 25 wear both.
 *
 * THE MATE. A second party for a scene that needs one (a deal, a swap, the other side of a trade):
 * the keeper's body in an orchid oilskin with a grey beard, so the two never read as one person.
 *
 * NATIVE-OWNED, like everything in src/lib/pixel/scenes (CONSTITUTION 5.5).
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import { RM_PALETTE, rmKeepsake, rmLater, rmLifeRing, rmLightning, rmRetint } from './rm-kit';
import { rmKeeperLift, rmKeeperReach, rmMark } from './rm-kit-a';
import type { RmPoint } from './rm-kit-a';
import type { SceneArt } from './types';

/* ── helpers ─────────────────────────────────────────────────────────────────────────────────── */

/** A run of one letter: from x0 to x1 inclusive, on row y. */
export type RmSpan = readonly [number, number, number, string];

/** `rows` with horizontal runs overwritten: skies, cloud banks, a sea's streaks, a flood line. */
export function rmFill(rows: readonly string[], spans: readonly RmSpan[]): string[] {
  const points: RmPoint[] = [];
  for (const [x0, x1, y, ch] of spans) for (let x = x0; x <= x1; x++) points.push([x, y, ch]);
  return rmMark(rows, points);
}

/* ── the lighthouse, lit ─────────────────────────────────────────────────────────────────────── */

/** The Fresnel lens: prism bands above and below a white-hot bullseye. 11x20. */
const LENS = [
  '...OOOOO...',
  '..OGyyyGO..',
  '.OGyGGGyGO.',
  '.OyyyyyyyO.',
  'OGGGGGGGGGO',
  'OyyyyyyyyyO',
  'OGGGGGGGGGO',
  'OyywwwwwyyO',
  'OywwWWWwwyO',
  'OywWWWWWwyO',
  'OywWWWWWwyO',
  'OywwWWWwwyO',
  'OyywwwwwyyO',
  'OGGGGGGGGGO',
  'OyyyyyyyyyO',
  'OGGGGGGGGGO',
  '.OyyyyyyyO.',
  '.OGyGGGyGO.',
  '..OGyyyGO..',
  '...OOOOO...',
];

/** One row of the glazing: a narrow side pane, the wide front pane round the lens, the other side. */
function glazingRow(r: number): string {
  const lens = r >= 2 && r < 22 ? LENS[r - 2].replace(/\./g, 'g') : 'g'.repeat(11);
  const bar = r === 8 || r === 16;
  const left = bar ? 'DDD' : r < 4 ? 'ygg' : 'ggg';
  const right = bar ? 'DDD' : 'ggO';
  return `.D${left}Dgg${lens}ggD${right}D.`;
}

/** The lantern parapet's body: white-painted iron, lit left, a door in the middle. */
function parapetRow(r: number): string {
  const door = r === 0 ? 'DDDDDDD' : r === 5 ? 'DkkkkGD' : 'DkkkkkD';
  return `.Dw${'x'.repeat(7)}${door}${'x'.repeat(4)}XXXXD.`;
}

/**
 * The lantern room, lit: lightning rod and vent ball, the red dome, the glazing with the lens
 * burning gold behind it, and the white parapet with its door, standing on the gallery deck.
 * 27x51; the bullseye's centre is at (13, 25.5), where a beam or rmLensGlow starts.
 */
export const rmLanternRoom: PixelSprite = {
  id: 'rm-lantern-room',
  name: 'lantern room',
  tags: ['rm', 'set', 'lighthouse'],
  blurb: 'The top of the lighthouse, lit: red dome, the Fresnel lens glowing gold behind the glass, a white parapet.',
  rows: [
    '.............x.............',
    '.............x.............',
    '............OOO............',
    '...........OyGgO...........',
    '...........OGGgO...........',
    '............OOO............',
    '...........DDDDD...........',
    '.........11sRRRr11.........',
    '......11sRRRRRRRRRr11......',
    '....11ssRRRRRRRRRRRrr11....',
    '..11sRRRRRRRRRRRRRRRrrr11..',
    '.1ssRRRRRRRRRRRRRRRRRRrrr1.',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDD',
    `.D${'X'.repeat(23)}D.`,
    ...Array.from({ length: 24 }, (_, r) => glazingRow(r)),
    'DDDDDDDDDDDDDDDDDDDDDDDDDDD',
    ...Array.from({ length: 12 }, (_, r) => parapetRow(r)),
  ],
};

/** A white bloom over the bullseye; give it a `twinkle` and the lens pulses. Lay at the lantern's (10, 24). 7x4. */
export const rmLensGlow: PixelSprite = {
  id: 'rm-lens-glow',
  name: 'lens glow',
  tags: ['rm', 'light'],
  rows: [
    '.wWWWw.',
    'wWWWWWw',
    'wWWWWWw',
    '.wWWWw.',
  ],
};

/**
 * The bright beam, `length` pixels out from its source and rising `slope` pixels for each pixel it
 * travels: a wedge white at the core and pale gold round it, breaking into streaks at the tip. The
 * source is the right edge, centred three rows above the bottom, so lay that point on the lantern;
 * rmFlip sends it the other way. A beam rises because the lens sits at head height: level, it would
 * run straight through a keeper on the gallery. Give it a `twinkle` and it swings toward you and away.
 */
export function rmBeam(id: string, length: number, slope: number): PixelSprite {
  const height = Math.ceil(4.2 + (length - 1) * (slope + 0.1));
  const rows = Array.from({ length: height }, (_, y) =>
    Array.from({ length }, (_, x) => {
      const d = length - 1 - x;
      const half = 1.2 + d * 0.1;
      const dy = Math.abs(y - (height - 3 - d * slope));
      if (dy > half) return '.';
      if (d > length - 10 && y % 2 === 1) return '.';
      return dy < half * 0.45 ? 'w' : 'y';
    }).join(''),
  );
  return { id, name: 'bright beam', tags: ['rm', 'light'], rows };
}

/**
 * The gallery round the lantern, `width` wide: a lit top rail, posts every six pixels, a mid rail,
 * the deck's lit edge and its brackets. 16 rows; a keeper behind it stands with boots on row 11, so
 * lay the rail at the keeper's y + 17 and draw it after the keeper.
 */
export function rmGalleryRail(width: number): PixelSprite {
  const posts = Array.from({ length: width }, (_, x) => (x % 6 === 0 ? 'D' : '.')).join('');
  return {
    id: `rm-gallery-rail-${String(width)}`,
    name: 'gallery rail',
    tags: ['rm', 'set', 'lighthouse'],
    rows: [
      'x'.repeat(width),
      'D'.repeat(width),
      posts,
      posts,
      posts,
      posts,
      'D'.repeat(width),
      posts,
      posts,
      posts,
      posts,
      posts,
      'X'.repeat(width),
      'D'.repeat(width),
      'K'.repeat(width),
      Array.from({ length: width }, (_, x) => (x % 6 < 2 ? 'D' : '.')).join(''),
    ],
  };
}

/**
 * A stretch of the banded tower, `width` x `height`: red and white bands `band` rows deep, lit from
 * the left and shaded right, dark-edged. `offset` shifts the bands, so a stretch can continue another.
 * `night` steps both bands down a tone, for tower that is in shadow under a lit lantern.
 */
export function rmTower(id: string, width: number, height: number, band: number, offset = 0, night = false): PixelSprite {
  const inner = width - 2;
  const lit = Math.max(1, Math.round(inner / 6));
  const shade = Math.max(1, Math.round(inner / 4));
  const tones = night ? { red: ['R', 'r', '1'], white: ['x', 'X', 'D'] } : { red: ['s', 'R', 'r'], white: ['W', 'w', 'x'] };
  const rows = Array.from({ length: height }, (_, y) => {
    const red = Math.floor((y + offset) / band) % 2 === 0;
    const [l, m, s] = red ? tones.red : tones.white;
    return `D${l.repeat(lit)}${m.repeat(inner - lit - shade)}${s.repeat(shade)}D`;
  });
  return { id, name: id, tags: ['rm', 'set', 'lighthouse'], rows };
}

/* ── the capstone dress ──────────────────────────────────────────────────────────────────────── */

/** The life ring in gold and white: red steps to gold steps, the ember outline to deep gold. 32x32. */
export const rmLifeRingGold = rmRetint(rmLifeRing, 'rm-life-ring-gold', { R: 'G', r: 'g', s: 'y', '1': 'O' });

/** A gold glint for the capstone keepsake; give it a `twinkle`. 3x3. */
const goldGlint: PixelSprite = {
  id: 'rm-gold-glint',
  name: 'gold glint',
  tags: ['rm', 'keepsake'],
  rows: [
    '.y.',
    'yWy',
    '.y.',
  ],
};

/**
 * A capstone keepsake: rmKeepsake with the ring in gold and white and two gold glints more, so
 * the lessons that close a run of the course hang a different ring from the same rope.
 */
export function rmKeepsakeGold(id: string, label: string, emblem: PixelSprite): SceneArt {
  const plain = rmKeepsake(id, label, emblem);
  return {
    ...plain,
    layers: [
      ...plain.layers.map((layer) => (layer.sprite === rmLifeRing ? { ...layer, sprite: rmLifeRingGold } : layer)),
      { sprite: goldGlint, x: 3, y: 24, motion: { kind: 'twinkle', periodMs: 1900, phase: 0.3, min: 0.2 } },
      { sprite: goldGlint, x: 42, y: 4, motion: { kind: 'twinkle', periodMs: 2300, phase: 0.7, min: 0.2 } },
    ],
  };
}

/** A low bank of storm cloud for the backdrop's sky, in its darkest steps; give it a slow `drift`. 46x4. */
const stormBank: PixelSprite = {
  id: 'rm-backdrop-storm-bank',
  name: 'storm bank',
  tags: ['rm', 'weather'],
  rows: [
    '.........kkkkkkkk..............kkkkkkk........',
    '....kkkkkkkkkkkkkkkkkk.....kkkkkkkkkkkkkkkk...',
    '..kkkkkkkDDDkkkkkkkkkkkkkkkkkkkkDDDkkkkkkkkkk.',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  ],
};

/** The kit's lightning stepped down to the backdrop's quiet: white to the lit crest, pale orchid to slate. */
const quietBolt: PixelSprite = { ...rmRetint(rmLightning, 'rm-backdrop-storm-bolt', { W: 'U', Q: 'X' }), palette: RM_PALETTE };

/**
 * The harbour backdrop with a storm coming on, for the capstones: the same harbour, a cloud bank
 * drifting over the open sea and two quiet bolts firing out of step. Every added tone stays under
 * the backdrop's luminance ceiling (U 0.125, X 0.140).
 */
export const rmBackdropStorm: SceneArt = {
  ...rmBackdrop,
  id: 'rm-backdrop-storm',
  label: 'A dark harbor at night as a storm comes in, with lightning over the open sea beyond a striped lighthouse on a headland and moored boats by a pier.',
  layers: [
    ...rmBackdrop.layers,
    { sprite: stormBank, x: 40, y: 0, motion: { kind: 'drift', amp: 3, periodMs: 11000 } },
    { sprite: quietBolt, x: 52, y: 5 },
    { sprite: rmLater(quietBolt, 'rm-backdrop-storm-bolt-later', 6, 190), x: 79, y: 4 },
  ],
};

/* ── the mate ────────────────────────────────────────────────────────────────────────────────── */

/** The mate's oilskin: the keeper's gold steps swapped for orchid, outline to deep orchid. */
export const RM_MATE_TINT: Record<string, string> = { y: 'q', G: 'P', g: 'p', O: 'E' };

/** A grey beard along the jaw and down the neck (the keeper's face rows 9 to 11). */
const BEARD: readonly RmPoint[] = [
  [9, 9, 'x'], [10, 9, 'x'], [11, 9, 'x'], [12, 9, 'X'],
  [9, 10, 'x'], [10, 10, 'x'], [11, 10, 'X'], [12, 10, 'X'],
  [11, 11, 'x'], [12, 11, 'X'],
];

/** The mate reaching forward at chest height, facing left: the keeper's reach in orchid, bearded. 18x29. */
export const rmMateReach: PixelSprite = rmRetint({ ...rmKeeperReach, rows: rmMark(rmKeeperReach.rows, BEARD) }, 'rm-mate-reach', RM_MATE_TINT);

/** The mate with a fist lifted, holding something up (hang it at x - 2, y + 9), facing left. 18x29. */
export const rmMateLift: PixelSprite = rmRetint({ ...rmKeeperLift, rows: rmMark(rmKeeperLift.rows, BEARD) }, 'rm-mate-lift', RM_MATE_TINT);
