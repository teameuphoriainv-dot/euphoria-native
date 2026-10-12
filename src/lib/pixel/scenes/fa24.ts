/**
 * Financial Analytics lesson 24, big data and the cloud: more data than any one machine can hold.
 *
 * OPENER. The server hall, at the COLLECT end. Four tall racks stand along the wall, every unit's
 * lights blinking to its own rhythm; the feeds from outside (market prices, satellite images,
 * social posts, sensors) run in along a cable tray from the right, and data rises off the tops of
 * the racks into a glowing cloud sign with an upload arrow, the cloud being where it all goes. On
 * a wall screen ones and zeros scroll past without end, and the analyst, seen from behind and half
 * the height of a rack, watches it. The map lights COLLECT.
 *
 * KEEPSAKE. The trophy with a cloud: three streams rise, then a blue cloud gathers over them and
 * flashes white as the upload lands.
 */
import { faBackdrop } from './fa-backdrop';
import { faCompose, faConduit, faPipelineMap } from './fa-kit';
import { faDrawnBy, faKeepsake, faMonitor, faRoom, faStageLight, FA_MONITOR_GLASS } from './fa-kit-a';
import { faAnalystBack, faBlank, faPacketsLeft, faRowsOf } from './fa-kit-b';
import type { FaPatch } from './fa-kit-a';
import type { PixelSprite } from '../types';
import type { LessonArtSet, SceneArt } from './types';

/* ── the racks ─────────────────────────────────────────────────────────────────────────────── */

/**
 * A server rack, 10 x 28: a lit cap, eight units (a lit lip, a face of drive bays with two light
 * sockets at LEDS, a rule), feet on the bottom row.
 */
const UNIT = ['DxXXXXXXkD', 'DxXkXkKKkD', 'DDDDDDDDDD'] as const;
const rack: PixelSprite = {
  id: 'fa24-rack',
  name: 'rack',
  tags: ['scene', 'fa24', 'station'],
  rows: ['DDDDDDDDDD', 'DxwxxxxXkD', 'DDDDDDDDDD', ...Array.from({ length: 8 }, () => UNIT).flat(), '.DkD..DkD.'],
};
const LEDS = { x: 6, y: 4 } as const;
const RACKS = [4, 15, 26, 37] as const;
const RACK_Y = 21;

/** One rack's lights, two per unit, each on its own rhythm (seeded so no two racks blink alike). */
function rackLights(id: string, seed: number): PixelSprite {
  const inks = ['N', 'N', 'B', 'y'];
  const frames = Array.from({ length: 6 }, (_, f) => Array.from({ length: 22 }, (_, r) => {
    if (r % 3) return '..';
    const unit = r / 3;
    return [0, 1].map((c) => ((unit * 7 + c * 13 + f * 5 + seed * 11) % 9 < 5 ? inks[(unit + c + seed) % inks.length] : '.')).join('');
  }));
  return { id, name: 'rack lights', tags: ['scene', 'fa24'], rows: frames[0], frames, frameMs: 300 };
}

/* ── the cloud ─────────────────────────────────────────────────────────────────────────────── */

/**
 * The cloud sign, 40 x 15: the outline of a cloud (four round bumps on a flat base) with an upload
 * arrow inside, as neon tube. The base keeps it in dim blue; the same outline lit bright glows
 * over it.
 */
const cloudSign = (ink: string, id: string): PixelSprite => {
  const bumps = [[9, 9.5, 4.5], [17, 6.5, 6.5], [26, 7, 5.5], [33, 9.5, 4.5]] as const;
  const inside = (x: number, y: number) =>
    x >= 0 && x < 40 && y >= 0 && y <= 13 && ((y >= 10 && x >= 6 && x <= 36) || bumps.some(([cx, cy, r]) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r));
  const g = faBlank(40, 15);
  for (let y = 0; y < 15; y++) {
    for (let x = 0; x < 40; x++) {
      if (inside(x, y) && (!inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1))) g[y][x] = ink;
    }
  }
  ['..#..', '.###.', '#####', '..#..', '..#..', '..#..'].forEach((row, j) => [...row].forEach((ch, i) => { if (ch === '#') g[4 + j][19 + i] = ink; }));
  return { id, name: id, tags: ['scene', 'fa24'], rows: faRowsOf(g) };
};

/** A mote of data rising off a rack into the cloud. Give it a `rise`. */
const mote = (ink: string): PixelSprite => ({ id: `fa24-mote-${ink}`, name: 'mote', tags: ['scene', 'fa24'], rows: [ink] });

/* ── the ticker ────────────────────────────────────────────────────────────────────────────── */

/**
 * Ones and zeros scrolling left across the wall screen's glass (22 x 5, from its second row): a
 * strip of eight digits, four pixels each, so 32 frames loop with no seam.
 */
const DIGITS: Readonly<Record<string, readonly string[]>> = {
  '1': ['.B.', 'BB.', '.B.', '.B.', 'BBB'],
  '0': ['BBB', 'B.B', 'B.B', 'B.B', 'BBB'],
};
const BITS = '10110100';
const ticker: PixelSprite = (() => {
  const span = BITS.length * 4;
  const frames = Array.from({ length: span }, (_, f) => Array.from({ length: 5 }, (_, y) => {
    let row = '';
    for (let c = 0; c < 22; c++) {
      const s = (c + f) % span;
      row += s % 4 === 3 ? '.' : DIGITS[BITS[Math.floor(s / 4)]][y][s % 4];
    }
    return row;
  }));
  return { id: 'fa24-ticker', name: 'binary ticker', tags: ['scene', 'fa24'], rows: frames[0], frames, frameMs: 150 };
})();

/* ── the room ──────────────────────────────────────────────────────────────────────────────── */

/* Where things stand. */
const MAP = { x: 46, y: 1 } as const;
const CLOUD = { x: 4, y: 1 } as const;
const SCREEN = { x: 50, y: 9, w: 28, h: 13 } as const;
const FEED = { x: 47, y: 24, length: 33 } as const;
const ANALYST = { x: 60, y: 33 } as const;

/** The hall's floor: tile seams every ten pixels, the racks' shadow, the analyst's. */
const floor: FaPatch[] = [
  [0, 54, 80, 1, 'Z'],
  ...Array.from({ length: 8 }, (_, k): FaPatch => [9 + k * 10, 50, 1, 10, 'Z']),
  [RACKS[0], 50, 43, 1, 'Z'],
  [RACKS[0] + 1, 51, 41, 1, 'Z'],
  [ANALYST.x + 1, 57, 10, 1, 'Z'],
];
const room = faRoom('fa24-opener-room', floor);

const base = faCompose('fa24-opener-base', room, [
  [faPipelineMap, MAP.x, MAP.y],
  [cloudSign('b', 'fa24-cloud'), CLOUD.x, CLOUD.y],
  [faMonitor('fa24-screen', SCREEN.w, SCREEN.h), SCREEN.x, SCREEN.y],
  [faConduit('fa24-feed', FEED.length, 8), FEED.x, FEED.y],
  ...RACKS.map((x) => [rack, x, RACK_Y] as const),
  [faAnalystBack, ANALYST.x, ANALYST.y],
]);

export const fa24Opener: SceneArt = {
  id: 'fa24-opener',
  label: 'A server hall in the data plant: four tall racks blink with lights, feeds from outside run in along a cable tray, data rises off the racks into a glowing cloud sign with an upload arrow, and the analyst, seen from behind, watches ones and zeros scroll past on a wall screen.',
  width: 80,
  height: 60,
  base,
  layers: [
    { sprite: cloudSign('B', 'fa24-cloud-glow'), x: CLOUD.x, y: CLOUD.y, motion: { kind: 'twinkle', periodMs: 2400, min: 0.35 } },
    ...RACKS.map((x, k) => ({ sprite: rackLights(`fa24-lights-${String(k)}`, k), x: x + LEDS.x, y: RACK_Y + LEDS.y })),
    ...RACKS.flatMap((x, k) => [
      { sprite: mote(['B', 'T', 'w', 'B'][k]), x: x + 3, y: RACK_Y - 2, motion: { kind: 'rise' as const, amp: 5, periodMs: 1700 + k * 190, phase: k * 0.23 } },
      { sprite: mote(['w', 'B', 'B', 'T'][k]), x: x + 6, y: RACK_Y - 3, motion: { kind: 'rise' as const, amp: 4, periodMs: 2100 + k * 170, phase: 0.5 + k * 0.17 } },
    ]),
    { sprite: faPacketsLeft('fa24-sources', FEED.length - 2, ['B', 'w', 'b'], 6, 150), x: FEED.x + 1, y: FEED.y + 2 },
    { sprite: ticker, x: SCREEN.x + FA_MONITOR_GLASS.x, y: SCREEN.y + FA_MONITOR_GLASS.y + 1 },
    faStageLight('collect', MAP.x, MAP.y),
  ],
};

/* ── the keepsake ──────────────────────────────────────────────────────────────────────────── */

/**
 * LESSON 24: big data and the cloud. Three teal streams rise from the bottom of the screen, a blue
 * cloud gathers over them from its base up, flashes white as the upload lands, holds, and the
 * screen clears.
 */
export const faEmblemCloud: PixelSprite = (() => {
  const full = [
    '.........www....',
    '...www..wBBBw...',
    '..wBBBwwBBBBBw..',
    '.wBBBBBBBBBBBBw.',
    'wBBBBBBBBBBBBBBx',
    'wBBBBBBBBBBBBBBx',
    '.xxxxxxxxxxxxxx.',
    '...TT...TT...TT.',
    '................',
    '...TT...TT...TT.',
    '...TT...TT...TT.',
  ];
  const step = (_x: number, y: number) => (y === 10 ? 0 : y === 9 ? 1 : y === 7 ? 2 : y === 6 ? 3 : y >= 4 ? 4 : y === 3 ? 5 : 6);
  const drawn = faDrawnBy('fa-emblem-cloud', full, step, 280, 5);
  const frames = drawn.frames ?? [drawn.rows];
  // The upload lands: the cloud flashes white for a beat.
  frames[8] = frames[8].map((row) => row.replace(/B/g, 'w'));
  return { ...drawn, name: 'emblem cloud', blurb: 'Three streams rising into a blue cloud.', frames };
})();

export const fa24Finish: SceneArt = faKeepsake(
  'fa24-finish',
  'A gold terminal trophy on a purple stand, its screen drawing three teal streams rising into a blue cloud that flashes white as they arrive, with small sparkles around it.',
  faEmblemCloud,
);

export const art: LessonArtSet = { opener: fa24Opener, backdrop: faBackdrop, finish: fa24Finish };
