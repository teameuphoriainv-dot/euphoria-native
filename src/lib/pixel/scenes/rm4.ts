/**
 * Risk Management lesson 4 opener, Credit Risk & Default Probability: three loads hang from the
 * store-room beam, each tagged with its rating. AAA rides on a stout gold chain and BBB on a plain
 * rope; CCC's rusty chain has snapped, its stub swinging, and the crate lies burst on the floor
 * with its coins spilled, the loss given default. The keeper points at it. Moving: the broken stub,
 * coin glints, the dust of the fall, the lantern.
 */
import type { PixelSprite } from '../types';
import { rmBackdrop } from './rm-backdrop';
import { RM_PALETTE, rmCompose, rmKeepsake, rmLantern, rmRopeCoil, rmWatchRoom } from './rm-kit';
import { rmFlip, rmGlint, rmKeeperReach } from './rm-kit-a';
import type { LessonArtSet, SceneArt } from './types';

/** 3x5 capitals for the rating tags; `#` is ink. */
const LETTERS: Record<string, readonly string[]> = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'],
};

/** A rating tag: three letters in dark ink on a card of `card`. 13x7. */
function ratingTag(id: string, letter: string, card: string): PixelSprite {
  const ink = (row: string) => [...row].map((ch) => (ch === '#' ? 'K' : card)).join('');
  const glyph = LETTERS[letter];
  const rows = glyph.map((row) => `D${ink(row)}${card}${ink(row)}${card}${ink(row)}D`);
  return { id, name: id, tags: ['scene', 'rm4'], rows: ['.DDDDDDDDDDD.', ...rows, '.DDDDDDDDDDD.'] };
}

/** The store-room beam under the ceiling with three eye bolts and the lantern's hook. 80x5. */
const beam: PixelSprite = {
  id: 'rm4-opener-beam',
  name: 'beam',
  tags: ['scene', 'rm4'],
  rows: [
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'xXXXXXXXXXXXxXXXXXXXXXXXXXXXXXXXXXXXXXxXXXXXXXXXXXXXXXXXXXXXXXXXXXXxXXXXXXXXXXXX',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    '............................DxD...............DxD...............DxD........DxD..',
    '.............................x.................x.................x..........x...',
  ],
};

/** AAA's chain: stout gold links, front and edge-on in turn. 3x14. */
const goldChain: PixelSprite = {
  id: 'rm4-opener-gold-chain',
  name: 'gold chain',
  tags: ['scene', 'rm4'],
  rows: [
    'GyG', 'G.G', 'GgG', '.O.',
    'GyG', 'G.G', 'GgG', '.O.',
    'GyG', 'G.G', 'GgG', '.O.',
    'GyG', 'GgG',
  ],
};

/** BBB's rope, its twist alternating. 2x14. */
const rope: PixelSprite = {
  id: 'rm4-opener-rope',
  name: 'rope',
  tags: ['scene', 'rm4'],
  rows: ['xX', 'Xx', 'xX', 'Xx', 'xX', 'Xx', 'xX', 'Xx', 'xX', 'Xx', 'xX', 'Xx', 'xX', 'Xx'],
};

/** A crate on its lifting ring: grey boards, a lit top board, a seam. 15x9. */
const crate: PixelSprite = {
  id: 'rm4-opener-crate',
  name: 'crate',
  tags: ['scene', 'rm4'],
  rows: [
    '......DxD......',
    'DDDDDDDDDDDDDDD',
    'DxxxxxxxxxxxxxD',
    'DXXXXXXXXXXXXXD',
    'DXXXXXXXXXXXXXD',
    'DDDDDDDDDDDDDDD',
    'DXXXXXXXXXXXXXD',
    'DXXXXXXXXXXXXXD',
    'DDDDDDDDDDDDDDD',
  ],
};

/** CCC's crate where it fell: top boards split, a crack down the front, coins spilled both ways. 20x11. */
const burstCrate: PixelSprite = {
  id: 'rm4-opener-burst-crate',
  name: 'burst crate',
  tags: ['scene', 'rm4'],
  rows: [
    '......D.....D.......',
    '..DDDDxD...DxDDDD...',
    '..DyGyGyGyGyGyGyD...',
    '..DGGyGGGyGGGyGGD...',
    '..DxxxxxxKxxxxxxD...',
    '..DXXXXXXXKXXXXXD...',
    '..DDDDDDDKDDDDDDD...',
    '..DXXXXXXXXKXXXXD...',
    '..DXXXXXXXXKXXXXD...',
    'yGDDDDDDDDDDDDDDDGy.',
    'GyGy...........yGyG.',
  ],
};

/** The rusty stub left on CCC's hook, its last link sprung open, swinging. Framed, 5x10. */
const STUB_TOP = ['.r1r.', '.r.r.', '.1r1.', '..1..'];
const brokenStub: PixelSprite = {
  id: 'rm4-opener-broken-stub',
  name: 'broken stub',
  tags: ['scene', 'rm4'],
  rows: [...STUB_TOP, '.r1r.', '.r.r.', '.1r1.', '..1..', '.rr..', '.r...'],
  frames: [
    [...STUB_TOP, '.r1r.', '.r.r.', '.1r1.', '..1..', '.rr..', '.r...'],
    [...STUB_TOP, '..r1r', '..r.r', '..1r1', '...1.', '..rr.', '..r..'],
    [...STUB_TOP, '.r1r.', '.r.r.', '.1r1.', '..1..', '.rr..', '.r...'],
    [...STUB_TOP, 'r1r..', 'r.r..', '1r1..', '.1...', 'rr...', 'r....'],
  ],
  frameMs: 420,
};

/** Dust thrown up where the crate landed; give it a `rise`. 5x2. */
const dust: PixelSprite = {
  id: 'rm4-opener-dust',
  name: 'dust',
  tags: ['scene', 'rm4'],
  rows: [
    '.x.x.',
    'x.X.x',
  ],
};

/** The lantern's own short chain from its hook. 1x2. */
const lanternChain: PixelSprite = {
  id: 'rm4-opener-lantern-chain',
  name: 'lantern chain',
  tags: ['scene', 'rm4'],
  rows: ['X', 'x'],
};

/** Floor shadows under the keeper and the burst crate. */
const floorShadow: PixelSprite = {
  id: 'rm4-opener-floor-shadow',
  name: 'rm4-opener-floor-shadow',
  tags: ['scene', 'rm4'],
  palette: RM_PALETTE,
  rows: [
    '..ZZZZZZZZZZZZZZZZ..ZZZZZZZZZZZZZZZZZZZ',
    '....ZZZZZZZZZZZZ......ZZZZZZZZZZZZZZZ..',
  ],
};

const base = rmCompose('rm4-opener-base', rmWatchRoom(80, 60, 50), [
  [beam, 0, 3],
  [ratingTag('rm4-opener-tag-ccc', 'C', 'R'), 23, 8],
  [ratingTag('rm4-opener-tag-bbb', 'B', 'G'), 41, 8],
  [ratingTag('rm4-opener-tag-aaa', 'A', 'N'), 59, 8],
  [rope, 46, 15],
  [crate, 40, 29],
  [goldChain, 64, 15],
  [crate, 58, 29],
  [floorShadow, 1, 52],
  [burstCrate, 20, 42],
  [lanternChain, 76, 8],
  [rmRopeCoil, 58, 51],
]);

export const rm4Opener: SceneArt = {
  id: 'rm4-opener',
  label: 'Three crates hang from a beam under rating tags, AAA on a gold chain and BBB on a rope, while the rusty CCC chain has snapped and its crate lies burst on the floor spilling coins, as the keeper points at it.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: brokenStub, x: 27, y: 15 },
    { sprite: dust, x: 24, y: 38, motion: { kind: 'rise', amp: 4, periodMs: 2600 } },
    { sprite: dust, x: 33, y: 39, motion: { kind: 'rise', amp: 3, periodMs: 3100, phase: 0.5 } },
    { sprite: rmGlint, x: 25, y: 43, motion: { kind: 'twinkle', periodMs: 1900, min: 0.2 } },
    { sprite: rmGlint, x: 37, y: 50, motion: { kind: 'twinkle', periodMs: 2300, min: 0.2, phase: 0.6 } },
    { sprite: rmFlip(rmKeeperReach, 'rm4-opener-keeper'), x: 2, y: 24 },
    { sprite: rmLantern, x: 73, y: 10 },
  ],
};

/** Lesson 4's emblem: a gold link snapped in two, one half dropping away, sparks in the gap. 16x8. */
const emblemBrokenLink: PixelSprite = {
  id: 'rm4-emblem-broken-link',
  name: 'broken link',
  tags: ['rm', 'emblem', 'lesson 4'],
  rows: [
    '.OOOOO..........',
    'OyyGGG.w........',
    'Oy......w.......',
    'OGgggg.w..OOOOO.',
    '.OOOOO....GGGgyO',
    '..............yO',
    '..........ggggGO',
    '..........OOOOO.',
  ],
};

export const rm4Finish: SceneArt = rmKeepsake(
  'rm4-finish',
  'A red and white life ring hanging from a rope, with a gold chain link at its center snapped in two halves.',
  emblemBrokenLink,
);

export const art: LessonArtSet = { opener: rm4Opener, backdrop: rmBackdrop, finish: rm4Finish };
