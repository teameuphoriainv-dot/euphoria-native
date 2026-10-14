/**
 * The places of IF1's story, drawn as shapes: Maya's bedroom wall and desk, the ticket booth, the
 * Sunny Juice stall's pieces and the stone bank. if1-story.ts composes them over the kit's stage into
 * frames and stills; they live here so that file stays a readable list of pictures.
 *
 * Same rules as the kit: light from the left, outlines in the deep steps, keys from STORY_PALETTE.
 */
import type { PixelSprite } from '../types';
import { ifRecolour } from '../scenes/if-kit-a';
import { box, grid, put, rowsOf, spr } from './if1-props';

const W = 80;
const H = 60;

/** The window's glass, in scene pixels: the stage's moon shows through it. */
export const WINDOW = { x: 4, y: 4, w: 24, h: 20 } as const;
export const DESK = { x: 46, y: 33, w: 28 } as const;
/** The drawer's dark inside, exactly where the drawer front sits when it is shut. */
export const DRAWER_SHUT = { x: 52, y: 38 } as const;

export const wall: PixelSprite = (() => {
  const g = grid(W, H);
  for (let y = 0; y < 45; y++) for (let x = 0; x < W; x++) put(g, x, y, x % 8 === 3 ? 'j' : 'i');
  box(g, 0, 0, W, 2, 'l');
  // The window: a wooden frame, lit on its top and left edges, a cross of glazing bars set right of
  // the moon so the bar never cuts through it, and a sill.
  box(g, WINDOW.x - 2, WINDOW.y - 2, WINDOW.w + 4, WINDOW.h + 4, 'A');
  for (let x = WINDOW.x - 2; x < WINDOW.x + WINDOW.w + 2; x++) { put(g, x, WINDOW.y - 2, 'h'); put(g, x, WINDOW.y + WINDOW.h + 1, 'a'); }
  for (let y = WINDOW.y - 2; y < WINDOW.y + WINDOW.h + 2; y++) { put(g, WINDOW.x - 2, y, 'h'); put(g, WINDOW.x + WINDOW.w + 1, y, 'a'); }
  box(g, WINDOW.x, WINDOW.y, WINDOW.w, WINDOW.h, '.');
  box(g, 20, WINDOW.y, 2, WINDOW.h, 'A');
  box(g, WINDOW.x, 17, WINDOW.w, 2, 'A');
  for (let y = WINDOW.y; y < WINDOW.y + WINDOW.h; y++) put(g, 20, y, 'h');
  for (let x = WINDOW.x; x < WINDOW.x + WINDOW.w; x++) put(g, x, 17, 'h');
  box(g, 1, 26, 30, 1, 'h');
  box(g, 1, 27, 30, 1, 'a');
  // Skirting board and a plank floor, seams staggered row by row.
  box(g, 0, 45, W, 1, 'A');
  box(g, 0, 46, W, 1, 'a');
  for (let y = 47; y < H; y++) {
    const band = Math.floor((y - 47) / 4);
    const k = (y - 47) % 4;
    for (let x = 0; x < W; x++) {
      const seam = (x + band * 7) % 18 === 0;
      put(g, x, y, k === 0 ? 'c' : k === 3 || seam ? 'd' : 'e');
    }
  }
  // The desk: an overhanging top, a front panel lit on the left, the drawer's dark inside, two legs.
  box(g, DESK.x - 1, DESK.y, DESK.w + 2, 1, 'h');
  box(g, DESK.x - 1, DESK.y + 1, DESK.w + 2, 1, 'A');
  put(g, DESK.x + DESK.w, DESK.y + 1, 'a');
  box(g, DESK.x, DESK.y + 2, DESK.w, 7, 'A');
  box(g, DESK.x, DESK.y + 2, 1, 7, 'h');
  box(g, DESK.x + DESK.w - 1, DESK.y + 2, 1, 7, 'a');
  box(g, DESK.x, DESK.y + 8, DESK.w, 1, 'a');
  box(g, DRAWER_SHUT.x, DRAWER_SHUT.y, 14, 4, 'd');
  box(g, DRAWER_SHUT.x, DRAWER_SHUT.y, 14, 1, 'K');
  box(g, DESK.x, DESK.y + 9, 2, 5, 'A');
  box(g, DESK.x + 1, DESK.y + 9, 1, 5, 'a');
  box(g, DESK.x + DESK.w - 2, DESK.y + 9, 2, 5, 'A');
  box(g, DESK.x + DESK.w - 1, DESK.y + 9, 1, 5, 'a');
  return spr('if1s-room-wall', rowsOf(g));
})();

export const BOOTH = { x: 34, y: 16, w: 44 } as const;
export const boothFront: PixelSprite = (() => {
  const g = grid(W, H);
  // Siding, lit on the left, with a seam every six pixels.
  box(g, BOOTH.x, BOOTH.y, BOOTH.w, 31, 'D');
  for (let y = BOOTH.y; y < 47; y++) for (let x = BOOTH.x; x < BOOTH.x + BOOTH.w; x += 6) put(g, x, y, 'X');
  // The marquee: orchid, outlined in the deep step, its bulbs are layers.
  box(g, 32, 9, 48, 1, 'E');
  box(g, 32, 10, 48, 4, 'P');
  box(g, 32, 10, 48, 1, 'q');
  box(g, 32, 14, 48, 1, 'p');
  box(g, 32, 15, 48, 1, 'E');
  // The price board: a pale frame round a dark face. Prices are crisp labels laid on top, never pixels.
  box(g, 44, 17, 23, 8, 'x');
  box(g, 45, 18, 21, 6, 'K');
  // The display window: two shelves, five tickets to a shelf.
  box(g, 36, 26, 41, 21, 'X');
  box(g, 37, 27, 39, 19, 'K');
  for (let k = 0; k < 6; k++) put(g, 39 + k * 6, 28 + (k % 3), 'k');
  box(g, 37, 41, 39, 1, 'A');
  box(g, 35, 46, 43, 1, 'h');
  return spr('if1s-booth', rowsOf(g));
})();

export const STAND = { x: 34, w: 30 } as const;
export const COUNTER_Y = 36;
/** The keeper stands behind the counter; his hand, at IF_GARDENER_HAND, is at (46, 33). */
export const KEEPER = { x: 46, y: 22 } as const;
export const HANG_LAMP = { x: 39, y: 18 } as const;

/** Orange and cream stripes, four pixels each: Sunny Juice. */
const stripe = (x: number) => (Math.floor(x / 4) % 2 === 0 ? '3' : '5');
export const awning = spr('if1s-awning', [
  '1'.repeat(STAND.w),
  ...Array.from({ length: 4 }, () => Array.from({ length: STAND.w }, (_, x) => stripe(x)).join('')),
  Array.from({ length: STAND.w }, (_, x) => (x % 4 === 1 || x % 4 === 2 ? stripe(x) : '.')).join(''),
]);
export const post = spr('if1s-post', Array.from({ length: 18 }, () => 'hA'));
export const counter = spr('if1s-counter', [
  'h'.repeat(STAND.w),
  'A'.repeat(STAND.w),
  ...Array.from({ length: 8 }, () => Array.from({ length: STAND.w }, (_, x) => (x % 6 === 5 ? 'a' : 'A')).join('')),
]);
/** The stall's sign: a round orange with a leaf on a little board. */
export const sign = spr('if1s-sign', ['.aaaaaaaaaa.', 'ahhhhhhhhhha', 'ahhh1331hhha', 'ahh134431Nha', 'ahh134431hha', 'ahhh1331hhha', '.aaaaaaaaaa.', '.....aa.....']);
/** A crate of oranges: the kit's coin crate with its coins recoloured. */
export const crate = ifRecolour(
  spr('if1s-crate-coins', ['.yGyG.', 'yGgGgg', 'hhhhhh', 'hAAAAa', 'haaaaa', 'hAAAAa']),
  'if1s-crate',
  { y: '5', G: '4', g: '3' },
);
export const boards = spr('if1s-boards', [
  'hhhhhhhhhhhhhhhhhhhhhhhhhh',
  'AXAAAAAAAAAAAAAAAAAAAAAXAa',
  '..........................',
  '..........................',
  '..........................',
  'hhhhhhhhhhhhhhhhhhhhhhhhhh',
  'AXAAAAAAAAAAAAAAAAAAAAAXAa',
  '..........................',
  '..........................',
  '..........................',
  'hhhhhhhhhhhhhhhhhhhhhhhhhh',
  'AXAAAAAAAAAAAAAAAAAAAAAXAa',
]);

export const bankFront: PixelSprite = (() => {
  const g = grid(W, H);
  const apex = 51;
  // The pediment, lit on its left slope.
  for (let y = 5; y <= 12; y++) {
    const hw = (y - 5) * 3;
    for (let x = apex - hw; x <= apex + hw; x++) put(g, x, y, x < apex - hw + 2 ? 'w' : x > apex + hw - 2 ? 'X' : 'x');
  }
  for (let y = 8; y <= 11; y++) {
    const hw = (y - 8) * 3;
    for (let x = apex - hw; x <= apex + hw; x++) put(g, x, y + 1, 'X');
  }
  box(g, 29, 13, 46, 1, 'w');
  box(g, 29, 14, 46, 1, 'x');
  box(g, 29, 15, 46, 1, 'X');
  // The wall behind the columns, in shadow, and four columns lit from the left.
  box(g, 30, 16, 44, 25, 'D');
  for (const cx of [31, 37, 62, 68]) {
    box(g, cx - 1, 16, 6, 1, 'x');
    box(g, cx, 17, 4, 23, 'x');
    box(g, cx, 17, 1, 23, 'w');
    box(g, cx + 3, 17, 1, 23, 'X');
    box(g, cx - 1, 40, 6, 1, 'X');
  }
  // The vault door: a round steel door with a gold wheel.
  box(g, 43, 25, 17, 16, 'X');
  box(g, 44, 26, 15, 15, 'x');
  for (let y = 27; y <= 39; y++) for (let x = 45; x <= 57; x++) {
    const d = Math.hypot(x - 51, y - 33);
    if (d <= 6.4) put(g, x, y, d >= 5.5 ? 'D' : 'X');
  }
  for (const [dx, dy] of [[0, -3], [0, 3], [-3, 0], [3, 0], [-2, -2], [2, 2], [-2, 2], [2, -2]] as const) put(g, 51 + dx, 33 + dy, 'G');
  put(g, 51, 33, 'y');
  // Three steps, the top edge of each catching the moonlight.
  for (const [y, x0, x1] of [[41, 30, 73], [43, 28, 75], [45, 26, 77]] as const) {
    box(g, x0, y, x1 - x0 + 1, 2, 'X');
    box(g, x0, y, x1 - x0 + 1, 1, 'x');
  }
  return spr('if1s-bank', rowsOf(g));
})();
