/**
 * fa-kit-c: the Financial Analytics parts lessons 18 to 25 share, on top of fa-kit, fa-kit-a and
 * fa-kit-b.
 *
 * ANY CAST, ANY POSE. Batch B drew the analyst's poses one at a time; from here a pose is a body
 * that any cast can wear. faHead is the cast's head (the analyst's, the client's grey one, the
 * colleague's with her bun) and faWorn puts a body drawn in the analyst's letters into the cast's,
 * so a lesson stacks the two (or draws a prop beside them) and has a new figure: the analyst with a
 * coffee or a magnifying glass, the colleague timing a stream, the client from behind, the team
 * applauding.
 *
 * THE SHARED PROPS. faPacketsRight runs packets of several inks along a pipe (one fraud among the
 * transactions, three feeds through one broker); faBeacon is a warning light that turns (a fraud
 * alarm, a stress test); faPage is a printed page (a report that issues itself, a filing being
 * read); faTicks ticks the colleague's clipboard (the checks a model has to pass).
 *
 * Same rules as fa-kit: light from the left, outlines in the deep steps, kit tones only from
 * FA_STEEL and the cast palettes, so anything here stamps cleanly next to anything there.
 */
import { faAnalyst } from './fa-kit';
import { faColleague, FA_CAST_COLLEAGUE } from './fa-kit-b';
import type { FaCast } from './fa-kit-b';
import type { PixelSprite } from '../types';
import type { SceneLayer } from './types';

/* ── casts ─────────────────────────────────────────────────────────────────────────────────── */

/** Rows drawn in the analyst's letters, worn by `cast`: its hair, suit and accent swapped in. */
export function faWorn(rows: readonly string[], cast: FaCast): string[] {
  return rows.map((row) => [...row].map((ch) => cast.swap[ch] ?? ch).join(''));
}

/**
 * The cast's head, neck included, 12 wide and in its own letters: ten rows for the analyst and
 * the client, twelve for the colleague (her bun sits on top). A body goes straight under it.
 */
export function faHead(cast: FaCast): string[] {
  return cast === FA_CAST_COLLEAGUE ? faColleague.rows.slice(0, 12) : faWorn(faAnalyst.rows.slice(0, 10), cast);
}

/** A figure from its finished rows (already in the cast's letters), with the palette they need. */
export function faFigure(id: string, cast: FaCast, rows: readonly string[], blurb: string): PixelSprite {
  return { id, name: id, tags: ['scene', 'fa', 'character'], blurb, palette: { ...cast.palette }, rows: [...rows] };
}

/* ── streams ───────────────────────────────────────────────────────────────────────────────── */

/**
 * Packets running RIGHT along a `length` pipe, two pixels long, one every `gap`: fa-kit-b's
 * faPacketsLeft the other way. `inks` colours each packet by its count, so a stream can carry
 * something different every few packets; the loop is `gap` x `inks` frames, so it never seams.
 */
export function faPacketsRight(id: string, length: number, inks: readonly string[], gap = 6, frameMs = 170): PixelSprite {
  const span = gap * inks.length;
  const frames = Array.from({ length: span }, (_, f) => {
    let row = '';
    for (let x = 0; x < length; x++) {
      const p = (((x - f) % span) + span) % span;
      row += p % gap < 2 ? inks[Math.floor(p / gap)] : '.';
    }
    return [row];
  });
  return { id, name: id, tags: ['scene', 'fa'], rows: frames[0], frames, frameMs };
}

/* ── props ─────────────────────────────────────────────────────────────────────────────────── */

/**
 * A warning beacon, 5 x 4: a red dome, dim at rest, on a steel collar. faBeaconLayers lights it:
 * the bright dome over the dim one and four rays around it, twinkling out of step, so the light
 * reads as turning.
 */
export const faBeacon: PixelSprite = {
  id: 'fa-beacon',
  name: 'beacon',
  tags: ['scene', 'fa', 'prop'],
  blurb: 'A red warning beacon on a steel collar.',
  rows: ['.rrr.', 'rrrrr', 'rrrrr', 'DxXkD'],
};

const beaconLit: PixelSprite = { id: 'fa-beacon-lit', name: 'beacon lit', tags: ['scene', 'fa'], rows: ['.sRR.', 'sRRRR', 'RRRRR'] };
const beaconRays: PixelSprite = { id: 'fa-beacon-rays', name: 'beacon rays', tags: ['scene', 'fa'], rows: ['.R.....R.', '.........', 'RR.....RR'] };

/** The beacon's light, for a faBeacon stamped at (x, y). */
export function faBeaconLayers(x: number, y: number, periodMs = 1100): SceneLayer[] {
  return [
    { sprite: beaconLit, x, y, motion: { kind: 'twinkle', periodMs, min: 0.15 } },
    { sprite: beaconRays, x: x - 2, y: y - 1, motion: { kind: 'twinkle', periodMs, phase: 0.5, min: 0 } },
  ];
}

/** A printed page, 7 x 9, its corner turned: a report, a filing. Give it a `rise` out of a slot. */
export const faPage: PixelSprite = {
  id: 'fa-page',
  name: 'page',
  tags: ['scene', 'fa', 'prop'],
  blurb: 'A printed page of text with a turned corner.',
  rows: [
    'DDDDDD.',
    'DwwwwDD',
    'DwXXwxD',
    'DwwwwxD',
    'DwXXXxD',
    'DwwwwxD',
    'DwXXwxD',
    'DwwwwxD',
    'DDDDDDD',
  ],
};

/**
 * Ticks landing one by one on the colleague's clipboard (fa-kit-b FA_CLIPBOARD, 6 x 2), then a
 * fresh sheet: the checks a model has to pass before anyone trusts it.
 */
export const faTicks: PixelSprite = {
  id: 'fa-ticks',
  name: 'ticks',
  tags: ['scene', 'fa'],
  rows: ['.N.N.N', 'N.N.N.'],
  frames: [
    ['......', '......'],
    ['.N....', 'N.....'],
    ['.N.N..', 'N.N...'],
    ['.N.N.N', 'N.N.N.'],
    ['.N.N.N', 'N.N.N.'],
    ['.N.N.N', 'N.N.N.'],
  ],
  frameMs: 520,
};
