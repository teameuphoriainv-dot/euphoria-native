/**
 * fa-kit-r: the Financial Analytics parts the second theme audit's redraws share, on top of fa-kit.
 *
 * THE DATABASE. faDbDrum is the stacked-disk database symbol everyone knows, drawn as a squat steel
 * drum: an oval lid lit from the left, then bands in the table's colour, each band's front edge
 * curving down towards us, an LED socket on each band for a blinking layer (faDbLeds). Lesson 16
 * keeps its trades and prices in two of them; lesson 18's dashboard is fed from one.
 *
 * VERTICAL PIPES. fa-kit's conduit and packet runs only go sideways. faRiser is the same glass
 * conduit standing up, and faPacketsUp runs packets up it, so data can climb out of a drum into a
 * screen above it.
 *
 * Same rules as fa-kit: light from the left, outlines in the deep steps, kit tones only, so anything
 * here stamps cleanly next to anything there.
 */
import type { PixelSprite } from '../types';

/* ── the database ──────────────────────────────────────────────────────────────────────────── */

/** faDbDrum's width; its height is 5 + bands x (bandRows + 1), 14 rows for the default three bands. */
export const FA_DB_W = 16;
/** The LED socket's column on every band, and its row within the band (the band's second row). */
export const FA_DB_LED_X = 11;

/**
 * A database drum, 16 wide: the lid (four rows), `bands` bands of `bandRows` rows in `lit` with a
 * `dark` shadow side, a curved seam between bands, and a curved foot. Each band's second row holds
 * an LED socket (K) at FA_DB_LED_X.
 */
export function faDbDrum(id: string, lit: string, dark: string, bands = 3, bandRows = 2): PixelSprite {
  const rows = ['...DDDDDDDDDD...', '.DDwwwwwxxxxxDD.', 'DwwxxxxxxxxxxxXD', 'DxXDDxxxxxxDDXkD'];
  for (let k = 0; k < bands; k++) {
    rows.push(k === 0 ? 'DX@@@DDDDDD@@&kD' : 'DX@@DDDDDDDD&&kD');
    for (let r = 1; r < bandRows; r++) rows.push(r === 1 ? 'DX@@@@@@@@@K@&kD' : 'DX@@@@@@@@@@@&kD');
    if (k < bands - 1) rows.push('DXDD@@@@@@@@DDkD');
  }
  rows.push('.DD@@@@@@@@@@DD.', '...DDDDDDDDDD...');
  return {
    id,
    name: id,
    tags: ['scene', 'fa', 'station'],
    blurb: 'A database: a squat drum of stacked disks with an LED on each.',
    rows: rows.map((row) => row.replace(/@/g, lit).replace(/&/g, dark)),
  };
}

/** The rows of a faDbDrum's LED sockets, from its top. */
export function faDbLedRows(bands = 3, bandRows = 2): number[] {
  return Array.from({ length: bands }, (_, k) => 5 + k * (bandRows + 1));
}

/**
 * A drum's LEDs blinking, one column over its sockets (stamp it at FA_DB_LED_X): each band's light
 * is off on a different beat, so the drum looks busy without the lights moving together.
 */
export function faDbLeds(id: string, ink: string, bands = 3, bandRows = 2, offset = 0, frameMs = 330): PixelSprite {
  const leds = faDbLedRows(bands, bandRows);
  const h = leds[leds.length - 1] + 1;
  const frames = Array.from({ length: 6 }, (_, f) =>
    Array.from({ length: h }, (_, y) => {
      const k = leds.indexOf(y);
      return k >= 0 && (k + f + offset) % 4 !== 0 ? ink : '.';
    }));
  return { id, name: id, tags: ['scene', 'fa'], rows: frames[0], frames, frameMs };
}

/* ── vertical pipes ────────────────────────────────────────────────────────────────────────── */

/**
 * fa-kit's glass conduit standing up, 5 x `h`: the glass channel is column 2 (for faPacketsUp),
 * lit on its left wall, with a flange every `flangeEvery` rows reaching one column past each side.
 */
export function faRiser(id: string, h: number, flangeEvery = 8): PixelSprite {
  const flange = (y: number) => y === 0 || y === h - 1 || y % flangeEvery === flangeEvery - 1;
  return {
    id,
    name: id,
    tags: ['scene', 'fa', 'prop'],
    blurb: 'A glass-channel conduit standing up, carrying data between floors.',
    rows: Array.from({ length: h }, (_, y) => (flange(y) ? 'DxXXD' : '.DKD.')),
  };
}

/**
 * Packets climbing a `h` high channel, one pixel a frame, two pixels long, one every `gap`: the
 * loop is `gap` frames, so it never seams.
 */
export function faPacketsUp(id: string, h: number, ink: string, gap = 6, frameMs = 170): PixelSprite {
  const frames = Array.from({ length: gap }, (_, f) =>
    Array.from({ length: h }, (_, y) => ((((y + f) % gap) + gap) % gap < 2 ? ink : '.')));
  return { id, name: id, tags: ['scene', 'fa'], rows: frames[0], frames, frameMs };
}
