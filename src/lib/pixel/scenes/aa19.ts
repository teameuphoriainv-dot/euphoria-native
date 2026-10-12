/**
 * Applied Accounting lesson 19, International Accounting Standards (IFRS vs GAAP): two rulebooks for
 * one world, one written in principles and one in rules.
 *
 * A library globe turns on its brass meridian in the middle of the hall, between the two books the
 * plate above names, IFRS/GAAP. On the left a single slim volume lies open on a lectern, a few broad
 * lines to the page and a blue ribbon: principles. On the right a tower of thick bound volumes stands
 * on a side table, the open one on top bristling with coloured tabs, every line of every page filled:
 * rules. Moving: the globe turns, a page of the slim book turns over, the brass catches the light,
 * dust rises.
 */
import type { PixelSprite } from '../types';
import { AA_PALETTE, aaCompose, aaGlint, aaMote, aaPlaque } from './aa-kit';
import { aaFloor } from './aa-kit-a';
import { aaPaint } from './aa-kit-c';
import { aaKeepsake } from './aa1-finish';
import { aaBackdrop } from './aa-backdrop';
import type { LessonArtSet, SceneArt } from './types';

const sprite = (id: string, rows: string[], palette?: Record<string, string>): PixelSprite =>
  ({ id, name: id, tags: ['aa', 'aa19'], rows, ...(palette ? { palette } : {}) });

/** The deep sea on the globe's shaded side, and the land there. */
const SEA = { V: '#1A3B78', Z: '#0A5040' };

/* ── the globe ──────────────────────────────────────────────────────────────────────────────── */

/** The world map wrapped round the globe, 36 columns of longitude by 19 rows: the land as ellipses. */
const LAND: [number, number, number, number][] = [
  [7, 5, 4.5, 3], [11, 12, 2.2, 3.5], [19, 4.5, 2.5, 1.8], [20.5, 10, 3, 3.5], [27, 5, 6, 3], [31, 13, 2.2, 1.4],
];
const isLand = (u: number, v: number) => LAND.some(([cx, cy, rx, ry]) => {
  const du = Math.min(Math.abs(u - cx), 36 - Math.abs(u - cx));
  return (du / rx) ** 2 + ((v - cy) / ry) ** 2 <= 1;
});

const GLOBE = { x: 31, y: 16, r: 9.4 };
/** The sphere turned `turn` columns of longitude: the map seen on a ball lit from the upper left. */
const sphere = (turn: number) => Array.from({ length: 19 }, (_, y) => Array.from({ length: 19 }, (_, x) => {
  const dx = x - 9;
  const dy = y - 9;
  if (Math.hypot(dx, dy) > GLOBE.r) return '.';
  const half = Math.sqrt(GLOBE.r ** 2 - dy ** 2);
  const lon = Math.asin(Math.max(-1, Math.min(1, dx / half)));
  const u = (((9 + (lon / Math.PI) * 18 - turn) % 36) + 36) % 36;
  const v = 9 + (Math.asin(dy / GLOBE.r) / (Math.PI / 2)) * 9;
  const nx = dx / GLOBE.r;
  const ny = dy / GLOBE.r;
  const lit = -0.5 * nx - 0.55 * ny + 0.67 * Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
  const step = lit > 0.85 ? 0 : lit > 0.3 ? 1 : 2;
  return (isLand(Math.floor(u), v) ? ['m', 'N', 'Z'] : ['B', 'b', 'V'])[step];
}).join(''));

const globe: PixelSprite = {
  ...sprite('aa19-globe', sphere(0), SEA),
  frames: Array.from({ length: 12 }, (_, i) => sphere(i * 3)),
  frameMs: 330,
};

/** The brass meridian round the globe, its pivot pins, and the wooden yoke it turns in. */
const mount = aaPaint('aa19-mount', 29, 27, (x, y) => {
  const dx = x - 14;
  const dy = y - 12;
  const d = Math.hypot(dx, dy);
  if (dx === 0 && (dy === -12 || dy === 12)) return 'O';
  if (d >= 10.5 && d < 11.5) return dx + dy < -7 ? 'y' : dx + dy > 7 ? 'g' : 'G';
  if (dy >= 0 && d >= 12.5 && d < 14.3) return d < 13.4 ? 'g' : 'O';
  return '.';
});

/** The turned pedestal under the yoke, standing on three splayed feet. */
const pedestal = sprite('aa19-pedestal', [
  '.....OgO.....',
  '.....OgO.....',
  '....OGggO....',
  '...OGGgggO...',
  '...OGggggO...',
  '....OGggO....',
  '.....OgO.....',
  '.....OgO.....',
  '.....OgO.....',
  '.....OgO.....',
  '....OGggO....',
  '...OgOgOgO...',
  '..Og..g..gO..',
  '..Og..g..gO..',
  '.Og...g...gO.',
  '.Og...g...gO.',
  'Og....g....gO',
  'OO...OgO...OO',
]);

/* ── IFRS: one slim book of principles ──────────────────────────────────────────────────────── */

const slimBook = sprite('aa19-slim-book', [
  '.aaaaaaaccaaaaaaa.',
  'aakkkkaaccaakkkkaa',
  'aaaaaaaaccaaaaaaaa',
  'aakkkaaaccaakkkaaa',
  'aaaaaaaaccaaaaaaaa',
  'bbbbbbbbbbbbbbbbbb',
  '.bbbbbbbbbbbbbbbb.',
], AA_PALETTE);
const ribbon = sprite('aa19-ribbon', ['B', 'B', 'B', 'B', 'b', 'b']);

/** A reading lectern, 20 x 23: the sloped top's front lip, a post, a footed base. */
const lectern = sprite('aa19-lectern', [
  'O'.repeat(20),
  `y${'G'.repeat(18)}g`,
  `O${'g'.repeat(18)}O`,
  'O'.repeat(20),
  ...Array.from({ length: 16 }, () => '........OGgO........'),
  '.....OOOOGgOOOO.....',
  '...OyGGGGGGGGGGgO...',
  '...OOOOOOOOOOOOOO...',
]);

/** A page of the slim book turning over: lifted, upright, laid down, then a long rest. */
const PAGE_UP = ['..................', '..................', '..................', '..................',
  '...............aa.', '.............aaac.', '...........aaacc..', '.........aaacc....', '.........acc......', '..................'];
const PAGE_STANDING = ['..................', '.........a........', ...Array.from({ length: 7 }, () => '........ca........'), '..................'];
const PAGE_DOWN = ['..................', '..................', '..................', '..................',
  '.aa...............', '.caaa.............', '..ccaaa...........', '....ccaaa.........', '......cca.........', '..................'];
const PAGE_REST = Array.from({ length: 10 }, () => '..................');
const pageTurn: PixelSprite = {
  ...sprite('aa19-page-turn', PAGE_REST, AA_PALETTE),
  frames: [PAGE_REST, PAGE_REST, PAGE_REST, PAGE_REST, PAGE_UP, PAGE_STANDING, PAGE_DOWN, PAGE_REST],
  frameMs: 360,
};

/* ── GAAP: a tower of rules ─────────────────────────────────────────────────────────────────── */

/** A thick volume lying flat, spine out, two gilt bands. */
const tome = (id: string, w: number, light: string, mid: string, dark: string) => sprite(id, [
  `${dark}${light.repeat(w - 2)}${dark}`,
  `${dark}${mid}y${mid.repeat(w - 6)}y${mid}${dark}`,
  `${dark}${mid}G${mid.repeat(w - 6)}G${mid}${dark}`,
  dark.repeat(w),
]);

/** The open volume on top, 22 x 10: every line filled, tabs out of the top and the fore-edge. */
const TOP_TABS: Record<number, string> = { 3: 'R', 7: 'N', 12: 'B', 16: 'F' };
const SIDE_TABS: Record<number, string> = { 3: 'R', 5: 'G', 7: 'T' };
const tabbedBook = aaPaint('aa19-tabbed-book', 22, 10, (x, y) => {
  if (y < 2) return TOP_TABS[x] ?? '.';
  if (x >= 20) return SIDE_TABS[y] ?? '.';
  if (y === 9 || x === 0 || x === 19) return 'D';
  if (y === 8 || x === 9 || x === 10) return 'c';
  if (y >= 3 && x !== 1 && x !== 8 && x !== 11 && x !== 18) return y % 2 ? 'k' : 'X';
  return 'a';
});

const sideTable = sprite('aa19-side-table', [
  'O'.repeat(24),
  `y${'G'.repeat(22)}g`,
  'O'.repeat(24),
  ...Array.from({ length: 13 }, () => `.OgO${'.'.repeat(16)}OgO.`),
]);

const base = aaCompose('aa19-opener-base', 80, 60, 'k', [
  { sprite: aaFloor('aa19-floor', 80, [[3, 22], [34, 46], [55, 78]]), x: 0, y: 49 },
  { sprite: aaPlaque('aa19-opener-plate', 'IFRS/GAAP'), x: 21, y: 1 },
  { sprite: mount, x: 26, y: 13 },
  { sprite: pedestal, x: 34, y: 39 },
  { sprite: lectern, x: 3, y: 34 },
  { sprite: slimBook, x: 4, y: 27 },
  { sprite: ribbon, x: 16, y: 33 },
  { sprite: sideTable, x: 55, y: 41 },
  { sprite: tome('aa19-tome-red', 20, 'R', 'r', '1'), x: 57, y: 37 },
  { sprite: tome('aa19-tome-green', 20, 'N', 'n', 'D'), x: 58, y: 33 },
  { sprite: tome('aa19-tome-blue', 20, 'B', 'b', 'D'), x: 57, y: 29 },
  { sprite: tabbedBook, x: 56, y: 19 },
]);

export const aa19Opener: SceneArt = {
  id: 'aa19-opener',
  label: 'A library globe turns on its brass stand between one slim open rulebook on a lectern and a tall stack of thick, tabbed rulebooks on a table, under a brass plate reading IFRS/GAAP.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: globe, x: GLOBE.x, y: GLOBE.y },
    { sprite: pageTurn, x: 4, y: 22 },
    { sprite: aaGlint, x: 30, y: 15, motion: { kind: 'twinkle', periodMs: 2800, min: 0.4 } },
    { sprite: aaMote, x: 25, y: 44, motion: { kind: 'rise', amp: 5, periodMs: 3200 } },
    { sprite: aaMote, x: 52, y: 40, motion: { kind: 'rise', amp: 4, periodMs: 3700, phase: 0.5 } },
  ],
};

/** Lesson 19 emblem: a gilt globe ruled with its equator and meridians, on a stand. */
const STAND = ['......OyGO......', '....OyGGGGgO....', '...OOOOOOOOOO...'];
const emblemGlobe = aaPaint('aa-emblem-globe', 16, 16, (x, y) => {
  if (y >= 13) return STAND[y - 13][x];
  const dx = x - 7.5;
  const dy = y - 6.5;
  const d = Math.hypot(dx, dy);
  if (d > 6.6) return '.';
  if (d > 5.6 || Math.abs(dy) < 0.6) return 'O';
  if (Math.abs(Math.abs(dx) - 2.8 * Math.sqrt(Math.max(0, 1 - (dy / 5.6) ** 2))) < 0.5) return 'O';
  if (dx + dy < -4) return x === 4 && y === 3 ? 'a' : 'y';
  return dx + dy > 3 ? 'g' : 'G';
});

export const aa19Finish = aaKeepsake(
  'aa19-finish',
  'A purple leather ledger with gold corners and a red ribbon bookmark, its cover stamped in gold with a globe on its stand, with small glints and check marks around it.',
  emblemGlobe,
);

export const art: LessonArtSet = { opener: aa19Opener, backdrop: aaBackdrop, finish: aa19Finish };
