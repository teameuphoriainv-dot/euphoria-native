/**
 * The props and cast of IF1's story ("Maya's $100"), drawn in the IF kit's style: the same palette
 * keys, light from the left, outlines in the deep steps (never K on the dark canvas; K and k are
 * interior detail only, the window glass and a drawer's dark inside). if1-story.ts composes them into
 * the frames and stills the story, toggle and term cards draw.
 *
 * MAYA IS THE OPENER'S INVESTOR (ifInvestor), so the person on the first screen is the person in the
 * story. Her walk is two new leg poses on the same body. The two customers are the same figure
 * recoloured into the cast's other skin tones (IF_R_PALETTE) and flipped to walk in from the right.
 *
 * NUMBERS ON ART. The bill carries a pixel "100" because the story's captions say $100 on every beat
 * where it shows; it is the only figure drawn in pixels. Prices and values are crisp theme labels on
 * the cards, never pixel digits. ifDigits has no `$` glyph and throws while the module evaluates
 * (fatal on native), so nothing here passes it one.
 *
 * NATIVE-OWNED (CONSTITUTION 5.5): new art lives here, never in scenes/** or the web-synced files.
 */
import type { PixelSprite } from '../types';
import { ifCoin, ifFlip, ifGlint, ifInvestor, ifLanternPost } from '../scenes/if-kit';
import { IF_R_PALETTE } from '../scenes/if-kit-r';

/*
 * IF_R_PALETTE plus the bedroom's wallpaper, three keys no IF kit uses (ifCompose throws if a key
 * means two colours). All three sit under luminance 0.03: a wall at night, not a light source.
 */
export const STORY_PALETTE: Record<string, string> = {
  ...IF_R_PALETTE,
  i: '#2B2036',
  j: '#352943',
  l: '#1F1728',
};

export const spr = (id: string, rows: string[], extra: Partial<PixelSprite> = {}): PixelSprite => ({
  id,
  name: id,
  tags: ['scene', 'if', 'story'],
  palette: STORY_PALETTE,
  rows,
  ...extra,
});

/* ── a tiny grid, for the big pieces that are easier to draw as shapes than to type ───────────── */

export type Grid = string[][];
export const grid = (w: number, h: number, ch = '.'): Grid => Array.from({ length: h }, () => new Array<string>(w).fill(ch));
export function put(g: Grid, x: number, y: number, ch: string): void {
  const row = g[y];
  if (row && x >= 0 && x < row.length) row[x] = ch;
}
export function box(g: Grid, x: number, y: number, w: number, h: number, ch: string): void {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(g, x + i, y + j, ch);
}
export function stampRows(g: Grid, rows: readonly string[], x: number, y: number): void {
  rows.forEach((row, j) => [...row].forEach((ch, i) => {
    if (ch !== '.') put(g, x + i, y + j, ch);
  }));
}
export const rowsOf = (g: Grid): string[] => g.map((r) => r.join(''));

/** A sprite with some keys swapped for others, frames too, on the story palette. */
export function recolour(sprite: PixelSprite, id: string, swap: Readonly<Record<string, string>>): PixelSprite {
  const paint = (rows: string[]) => rows.map((row) => [...row].map((ch) => swap[ch] ?? ch).join(''));
  return { ...sprite, id, name: id, palette: STORY_PALETTE, rows: paint(sprite.rows), ...(sprite.frames ? { frames: sprite.frames.map(paint) } : {}) };
}

/* ── the cast ──────────────────────────────────────────────────────────────────────────────────── */

export const maya: PixelSprite = { ...ifInvestor, id: 'if1s-maya', name: 'if1s-maya', palette: STORY_PALETTE };

/** Her legs in two poses, the body unchanged: a stride and a passing step, 150ms each. */
const BODY = ifInvestor.rows.slice(0, 17);
const STRIDE = ['...bBbbbb.....', '..bBb..bbb....', '.bBb....bbb...', 'aAAA.....aAAA.'];
const PASSING = ['...bBbbbb.....', '....bBbbb.....', '....bBbb......', '...aAAAAa.....'];
export const mayaWalk: PixelSprite = spr('if1s-maya-walk', [...BODY, ...STRIDE], {
  frames: [[...BODY, ...STRIDE], [...BODY, ...PASSING]],
  frameMs: 150,
});

/** Gold cap, deep skin tone, green hoodie, grey trousers; flipped to face left. */
const CUSTOMER_A = { '4': 'y', '3': 'G', '2': 'g', C: 'J', U: 'z', q: 'm', P: 'N', p: 'n', E: 'n', b: 'D', B: 'X' } as const;
/** Blue cap, light skin tone, fair hair, pink hoodie. */
const CUSTOMER_B = { '4': 'B', '3': 'b', '2': 'u', C: 'S', U: 'M', H: 'o', q: 'F', P: 'F', p: 'f', E: 'I' } as const;
export const customerA = ifFlip(recolour(maya, 'if1s-customer-a-r', CUSTOMER_A), 'if1s-customer-a');
export const customerAWalk = ifFlip(recolour(mayaWalk, 'if1s-customer-a-walk-r', CUSTOMER_A), 'if1s-customer-a-walk');
export const customerB = ifFlip(recolour(maya, 'if1s-customer-b-r', CUSTOMER_B), 'if1s-customer-b');
export const customerBWalk = ifFlip(recolour(mayaWalk, 'if1s-customer-b-walk-r', CUSTOMER_B), 'if1s-customer-b-walk');

/* ── props that move ───────────────────────────────────────────────────────────────────────────── */

/** The desk drawer's front, 14x4, gold knob. Closed it covers the dark inside drawn on the desk. */
export const drawer = spr('if1s-drawer', [
  'hhhhhhhhhhhhhh',
  'hAAAAAyGAAAAAa',
  'hAAAAAgOAAAAAa',
  'aaaaaaaaaaaaaa',
]);

/*
 * Maya's birthday note, 13x5: a mint bill with "100" in dark green, the only digits on the art. A 1
 * and two closed 3x3 zeros with a 2px margin each side. The first draft drew the zeros with no top or
 * bottom row and read as "II.I.I" at 4x on the simulator (review 2026-10-13).
 */
const BILL_ROWS = [
  'nnnnnnnnnnnnn',
  'nnmnmmmnmmmnn',
  'nnmnmnmnmnmnn',
  'nnmnmmmnmmmnn',
  'nnnnnnnnnnnnn',
];
export const bill = spr('if1s-bill', BILL_ROWS);
/*
 * The bill carried in Maya's hand while she walks (beat 1). StoryStage shows `${actor}-walk` frames
 * while a walking cue runs, so the bill gets the same walk clock, easing and 1px arrival bob as the
 * hand holding it; its two frames are the bill itself.
 */
export const billWalk = spr('if1s-bill-walk', BILL_ROWS, { frames: [BILL_ROWS, BILL_ROWS], frameMs: 150 });

/** A wall calendar, 8x9, whose page lifts and flips over the top: a year going by. */
const CAL_TOP = ['.D....D.', 'rrrrrrrr', 'rRRRRRRr'];
const CAL_PAGE = ['wwwwwwwx', 'wXwXwXwx', 'wwwwwwwx', 'wXwXwXwx', 'wwwwwwwx', 'xxxxxxxx'];
export const calendar = spr('if1s-calendar', [...CAL_TOP, ...CAL_PAGE], {
  frames: [
    [...CAL_TOP, ...CAL_PAGE],
    [...CAL_TOP, 'wwwwwwwx', 'wXwXwXwx', 'wwwwwwxx', 'wXwXwxXw', 'wwwwxXww', 'xxxxXwww'],
    [...CAL_TOP, 'xxxxxxxx', 'XXXXXXXX', 'wwwwwwwx', 'wXwXwXwx', 'wwwwwwwx', 'xxxxxxxx'],
    ['xxxxxxxx', 'rrrrrrrr', 'rRRRRRRr', ...CAL_PAGE],
  ],
  frameMs: 150,
});

/** A movie ticket, 7x4, notched at the sides; and the same ticket as an empty grey outline. */
export const ticket = spr('if1s-ticket', ['FFFFFFf', '.FwwFf.', '.FFFFf.', 'fffffff']);
export const ticketGhost = spr('if1s-ticket-ghost', ['XXXXXXX', '.X...X.', '.X...X.', 'XXXXXXX']);

/**
 * The amber up arrow that sticks to the price board: prices went up. A 5x6 block arrow (a head on a
 * 3px-wide stem), so it reads as an arrow, not a gem, a plus or a dagger; it fills the board's 6-row
 * face exactly.
 */
export const sticker = spr('if1s-sticker', ['..G..', '.GGG.', 'GGGGG', '.GGG.', '.GGG.', '.GGG.']);

/** Maya's money as one coin, 6x6, and that coin as an outline when it may not come back. */
export const coin100 = spr('if1s-coin-100', ['.OOOO.', 'OyyGGO', 'OyGGgO', 'OGGggO', 'OGgggO', '.OOOO.']);
export const coin100Ghost = spr('if1s-coin-100-ghost', ['.XXXX.', 'X....X', 'X....X', 'X....X', 'X....X', '.XXXX.']);
export const coin5 = { ...ifCoin, id: 'if1s-coin-5', name: 'if1s-coin-5' };
export const coin5b = { ...ifCoin, id: 'if1s-coin-5b', name: 'if1s-coin-5b' };
/** Savings growing slowly: the smallest coin there is. */
export const coinTiny = spr('if1s-coin-tiny', ['.O.', 'OyO', '.O.']);

/** The blender Sunny Juice borrows for, 5x6: a glass jug of orange juice on a teal base. */
export const blender = spr('if1s-blender', ['.DDD.', '.xwx.', '.x4x.', '.x3x.', '.tTt.', 'tTTTt']);

/** The deposit shield over the bank door, 7x8. */
export const shield = spr('if1s-shield', ['ttttttt', 'tTTTTTt', 'tTwTTTt', 'tTwTTTt', 'tTTTTTt', '.tTTTt.', '..tTt..', '...t...']);

/**
 * What an investment could do: up in green, down in amber (never red, CONSTITUTION 5 colours). Each
 * is a 5x6 block arrow, a head at one end of a 3px-wide stem: the first draft's stemless diamonds read
 * as gems or coins, and a 1px stem read as a plus or a dagger on the simulator (review 2026-10-13).
 */
export const arrowUp = spr('if1s-arrow-up', ['..N..', '.NNN.', 'NNNNN', '.NNN.', '.NNN.', '.NNN.']);
export const arrowDown = spr('if1s-arrow-down', ['.444.', '.444.', '.444.', '44444', '.444.', '..4..']);

/**
 * A one-shot glint. Its still is EMPTY: a glint is a moment, so at rest (and under Reduce Motion) it
 * leaves nothing behind. The kit's glint rests on a white dot, which on a bill reads as a stain.
 * 5 frames at 130ms is the 650ms the story's beats are timed with (PLAY_FALLBACK_MS in story.ts).
 */
export const glint = spr('if1s-glint', ['...', '...', '...'], { frames: ifGlint.frames, frameMs: 130 });

/* ── props that stay put (stamped into bases) ──────────────────────────────────────────────────── */

/** The kit's lantern head without its post: a desk lamp in the room, a hanging lamp at the stand. */
export const lanternHead = spr('if1s-lantern-head', ifLanternPost.rows.slice(0, 7));
/** The same lamp with the light out: glass gone dark. */
export const lanternDark = recolour(lanternHead, 'if1s-lantern-dark', { '4': 'D', '5': 'k', y: 'k' });
/** The lamp burning low in the rain. */
export const lanternDim = recolour(lanternHead, 'if1s-lantern-dim', { '5': '4', y: '3' });
/** A small ember for the dimmed lamp: it still flickers, barely. */
export const emberFlame = spr('if1s-ember', ['.3.', '343', '.3.'], { frames: [['.3.', '343', '.3.'], ['...', '434', '.3.'], ['.4.', '333', '...']], frameMs: 300 });

/** A potted sprout on the bedroom shelf, 6x7: the orchard's plant, indoors. */
export const pottedSprout = spr('if1s-potted-sprout', ['.mN.Nn', 'mNNnNN', '.mNnN.', '...n..', '.hhhh.', '.hAAa.', '..Aa..']);

/** The bedroom shelf it stands on, 16x2. */
export const shelf = spr('if1s-shelf', ['hhhhhhhhhhhhhhhh', '.a............a.']);

/**
 * Rain: two frames of falling streaks, 26x28, laid three across the sky (framed layers stay under
 * 32x32). A streak is a bright head with a grey tail above it, about one every 37 pixels: the first
 * draft lit one pixel in 11 and read as static on a television, not as rain.
 */
const dropAt = (x: number, y: number) => (x * 11 + (((y % 28) + 28) % 28) * 5) % 37 === 0;
const rainFrame = (shift: number): string[] =>
  Array.from({ length: 28 }, (_, y) =>
    Array.from({ length: 26 }, (__, x) => (dropAt(x, y - shift) ? 'B' : dropAt(x, y + 1 - shift) ? 'x' : '.')).join(''));
export const rain = spr('if1s-rain', rainFrame(0), { frames: [rainFrame(0), rainFrame(4)], frameMs: 160 });

/** One string of marquee bulbs, every third pixel lit: two strings out of step read as chasing lights. */
export const bulbs = (id: string, width: number, offset: number): PixelSprite =>
  spr(id, [Array.from({ length: width }, (_, x) => ((x + offset) % 3 === 0 ? 'y' : '.')).join('')]);
