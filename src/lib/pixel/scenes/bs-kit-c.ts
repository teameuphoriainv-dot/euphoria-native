/**
 * Business Strategy art kit, batch C (lessons 18 to 25): the furniture two or more of the last openers
 * share. A plain table cut to any length, for a recruiting table in the tavern and a counting table in
 * the hall, and a hanging lantern for any beam. Same rules as bs-kit, bs-kit-a and bs-kit-b: light from
 * the left, edges in the deep steps, framed pieces small and looping, `rows` the still for Reduce
 * Motion, and each blurb says where its piece stands.
 *
 * NATIVE-OWNED, like everything in scenes/ (CONSTITUTION 5.5: new art never goes in the web-synced
 * sprite files).
 */
import type { PixelSprite } from '../types';
import { bsMoved } from './bs-kit';

/**
 * A plain wooden table `width` pixels long (at least 10): the top on rows 0..1, the lit front edge on
 * row 2, the apron on row 3, legs at either end on rows 4..7 and its floor shadow on row 8. Draw the
 * people behind it first; the top and apron cut them at the waist.
 */
export function bsTable(id: string, width: number): PixelSprite {
  const span = (edge: string, fill: string) => edge + fill.repeat(width - 2 * edge.length) + [...edge].reverse().join('');
  const leg = span('..OO', '.');
  return {
    id,
    name: 'table',
    tags: ['scene', 'bs'],
    blurb: 'A plain wooden table: top on rows 0..1, legs at the ends, its shadow on the bottom row. Draw people behind it first.',
    palette: { Z: '#110E17' },
    rows: [
      span('..', 'g'),
      span('.', 'g'),
      'G'.repeat(width),
      'O'.repeat(width),
      leg,
      leg,
      leg,
      leg,
      'Z'.repeat(width),
    ],
  };
}

const lanternRows = [
  '..D..',
  '..D..',
  '.OOO.',
  'O343O',
  'O454O',
  'O343O',
  '.OOO.',
  '..O..',
];

export const bsLantern: PixelSprite = {
  id: 'bs-lantern',
  name: 'lantern',
  tags: ['scene', 'bs'],
  blurb: 'A lantern on a short chain: hang it with its top row just under a beam. The flame flickers.',
  rows: lanternRows,
  frames: [
    lanternRows,
    bsMoved(lanternRows, {
      3: 'O434O',
      4: 'O545O',
    }),
    bsMoved(lanternRows, {
      3: 'O333O',
      5: 'O444O',
    }),
  ],
  frameMs: 470,
};
