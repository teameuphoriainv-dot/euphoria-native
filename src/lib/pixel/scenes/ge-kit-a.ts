/**
 * The Global Economics kit, batch A (lessons 2 to 9): the grounds the pathway's openers rotate
 * through, and the people, props and moving bits more than one lesson shares. Everything here is
 * built from ge-kit.ts's palette and helpers; it adds to that kit and changes nothing in it.
 *
 * FIVE GROUNDS, ONE HARBOR. Lesson 1's road at dusk is where the pathway starts; these are the rest
 * of the port's world, each 80x60 and empty of story, so a lesson stamps its own props on one with
 * geCompose: the quay by day (cargo, ships, cranes), the city plaza at dusk (steps for a grand bank
 * or capitol), the study (a window on the harbor, a desk for a globe or a chart), the pier at night
 * (lamps, a market) and terraces at dawn (four steps climbing out of the sea). Each ground's comment
 * says where things stand on it. A lesson that wants another hour tints a ground with geTint rather
 * than redrawing it.
 *
 * NATIVE-OWNED, like everything in src/lib/pixel/scenes (CONSTITUTION 5.5: new art never goes in the
 * web-synced sprite files).
 */
import type { PixelSprite } from '../types';
import { GE_PALETTE, geFlag, geShimmer, geTint } from './ge-kit';

/* ── grounds: 80x60, empty of story, for a lesson to stamp its props on ─────────────────────── */

/**
 * The quay by day. Sky to row 28 (clouds drift in its upper half), a far coast with a white town on
 * its ridge, harbor water from row 29, the quay's coping on row 43 and its concrete below: a
 * ship's waterline sits on row 42, and feet stand anywhere from row 45 down. Three bollards stand
 * on the coping at x 10, 44 and 75.
 */
export const geGroundQuay: PixelSprite = {
  id: 'ge-ground-quay',
  name: 'quay by day',
  tags: ['ge', 'ground'],
  blurb: 'A blue sky over green hills and a white town, the harbor water, and the concrete quay with its painted line and crane rails.',
  palette: GE_PALETTE,
  rows: [
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'bbbbbbbbbbbbBBBBBBBBbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbBBBBBBBBBbbbbbbbbbbbbbbbbbbb',
    'bbbbbbBBBBBBBBBBBBBBBBBBBBBbbbbbbbbbbbbbbbbbbbBBBBBBBBBBBBBBBBBBBBBBBbbbbbbbbbbb',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBbbbbbBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBBBBBBtttttBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    'BBBBBBtttttttttttttttBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBrrrBrrrBBrrrBrrrBBBBBBBB',
    'BBtttttttttttttttttttttttBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBzzztzzzttzzzBzzzBBBBBBBB',
    'ttttttttttttttttttttttttttttBBBBBBBBBBBBBBBBBBBBBBBBBBttzKztzKzttzKztzKztttBBBBB',
    'ttttttttttttttttttttttttttttttttBBBBBBBBBBBBBBBBBttttttttttttttttttttttttttttttt',
    'tttttnnnnnnnnttttttttttttttttttttttttttttttttttttttttttttnnnnnnnnnnnnnnnnnnttttt',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnntttttttttttttnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
    'bbbbbbBBBBBbbbbbbbbbbbbbbbbbbbBBBBBBBBBbbbbbbbbbbbbbbbbbbbbbbBBBBBBbbbbbbbbbbbbb',
    'bbbbbbbbbbbbbbbbbbBBBBbbbbbbbbbbbbbbbbbbbbbbbbbBBBBBBBbbbbbbbbbbbbbbbbbbBBBBbbbb',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'dddbbbbbbdddddddddddddddddddddddddddddddbbbbbbbbddddddddddddddddddbbbbbddddddddd',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'ddddddddddddddbbbbbbbbbdddddddddddddddddddddddddddddbbbbbbdddddddddddddddddddddd',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'dbbbbbddddddddddddddddddddddddbbbbbbbdddddddddddddddddddddddddddddddbbbbbbbbdddd',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'ddddddddddddddddddddbbbbbbdddddddddddddddddddddbbbbbbbbbdddddddddddddddddddddddd',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'ddddddbbbbbbbbddddddddddddddddddddddddddddddddddddddddddddbbbbbbbddddddddddddddd',
    'ddddddddddkKkdddddddddddddccccccccccddddddddkKkddddddddddddddddddddddddddddkKkdd',
    'cccccccccddkddddddddddddddddddddddddddccccccckccccddddddddddddddddcccccccccdkddd',
    'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'GGGGGGXXXGGGGGGXXXGGGGGGXXXGGGGGGXXXGGGGGGXXXGGGGGGXXXGGGGGGXXXGGGGGGXXXGGGGGGXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
  ],
};

/**
 * The city plaza at dusk. A skyline at both sides leaves the middle open for one grand building,
 * which stands on the broad steps with its bottom row on row 33 (GE_PLAZA_STAGE). Paving from row
 * 40; lamps at x 6 and 73, their glass where geLampGlow goes (GE_PLAZA_LAMPS).
 */
export const geGroundPlaza: PixelSprite = {
  id: 'ge-ground-plaza',
  name: 'city plaza at dusk',
  tags: ['ge', 'ground'],
  blurb: 'A dusk sky over a dark skyline, broad stone steps in the middle and a paved plaza lit by two lamps.',
  palette: GE_PALETTE,
  rows: [
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk0000000000000000000kkkkkkkkkkkkkkkkk',
    '00000000000000000000000000000000000000000000000000000000000000000000000000000000',
    '00000000000000000000000000000000000000000000000000000000000000000000000000000000',
    '00000000000000000000000000000000000000000000000000000000000000000k00000000000000',
    '00000OOO000000k00000000000000000000000000000000000000000000000000k000000OOO00000',
    'KKK6OyyyO66666k66666666KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK6666666k66666OyyyOKKKK',
    '66666OgO666666k666666666666666666666666666666666666666666666666Dkkkkk666OgO66666',
    '666666D66666Dkkkkk666666666666666666666666666666666666666666666Dkkkkk6666D666666',
    '666666D66666Dkkkkk666666666666666666666666666666666666666666666Dkkkkk6666D666666',
    'DkkkkkD66666Dkkkkk666666666666666666666666666666666666666666666DkOkkk6666Dkkkkkk',
    'DkkkkkDKKKKKDkOkkkKKKKKKEEEEEEEEEEEEEEEEEEEEEEEKKKKKKKKKKKKKKEEDkOkkkEEEEDkkkkkk',
    'DkkkkkDEEEEEDkOkkkEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEDkkkkkEEEEDkkkkkk',
    'DkOkkkDEEEEEDkkkkkEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEDkkkkDkkkkkEEEEDkOkkkk',
    'DkOkkkDDkkkkDkkkkkEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEDkkkkDkkkOkEEEEDkOkkkk',
    'DkkkkkDDkkkkDkkkOkKKKKKKKKKKKKKKKKKKKKIIIIIIIIIIIIIIIIIIIIDkkkkDkkkOkDkkkDkkkkkk',
    'DkkkkkDDkOkkDkkkOkDkkkIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIDkOkkDkkkkkDkkkDkkkkkk',
    'DkkkOkDDkOkkDkkkkkDkkkIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIDkOkkDkkkkkDkkkDkkkOkk',
    'DkkkOkDDkkkkDkkkkkDkkk222222222KKKKKKKKKKKKKKKKKKK22222222DkkkkDkkkkkDOkkDkkkOkk',
    'DkkkkkDDkkkkDkOkkkDkOk222222222222222222222222222222222222DkkkkDkkkkkDOkkDkkkkkk',
    'DkkkkkDDkkkkDkOkkkDkOk222222222222222222222222222222222222DkkkkDkOkkkDkkkDkkkkkk',
    'DkkkkkDDkkkkDkkkkkDkkk222222222222222222222222222222222222DkkkkDkOkkkDkkkDkkkkkk',
    'DkkkkkDDkkkkDkkkkkDkkk333333333333333333333333333333333333DkkkkDkkkkkDkkkDkkkkkk',
    'DkkkkkDDkkkkDkkkkkDkkk333333333333333333333333333333333333DkkkkDkkkkkDkkkDkkkkkk',
    'DkkkkkDDkkkkDkkkkkDkkk333333333333333333333333333333333333DkkkkDkkkkkDkkkDkkkkkk',
    'DDDDDDDDDDDDDDDDDDDDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxDDDDDDDDDDDDDDDDDDDD',
    'uuuuuuDuuuuuuuKKKKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKKKKuuuuuuuDuuuuuu',
    'uuuuuuDuuuuuuuKKKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxKKKuuuuuuuDuuuuuu',
    'uuuuuuDuuuuuuuKKKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXKKKuuuuuuuDuuuuuu',
    'uuuuuuDuuuuuuuxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxuuuuuuuDuuuuuu',
    'uuuuuuDuuuuuuuXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXuuuuuuuDuuuuuu',
    'ulllllDullllllullllllullllllullllllullllllullllllullllllullllllullllllullDlllull',
    'ulllllDullllllullllllullllllullllllullllllullllllullllllullllllullllllullDlllull',
    'uuuuuuDuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuDuuuuuu',
    'llllulDlllllllulllllllllulllllllllulllllllllulllllllllulllllllllullllllllDulllll',
    'llllulDlllllllulllllllllulllllllllulllllllllulllllllllulllllllllullllllllDulllll',
    'llllulDlllllllulllllllllulllllllllulllllllllulllllllllulllllllllullllllllDulllll',
    'uuuuuuDuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuDuuuuuu',
    'lluoooDooolllllullllllllllllullllllllllllullllllllllllullllllllllllulloooDooolll',
    'looooDDDoooolllullllllllllllullllllllllllullllllllllllulllllllllllluooooDDDooool',
    'oooookkkooooollullllllllllllullllllllllllullllllllllllulllllllllllloooookkkooooo',
    'looooooooooolllullllllllllllullllllllllllullllllllllllulllllllllllluoooooooooool',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'lllllllllullllllllllllllllullllllllllllllllullllllllllllllllullllllllllllllllull',
    'lllllllllullllllllllllllllullllllllllllllllullllllllllllllllullllllllllllllllull',
    'lllllllllullllllllllllllllullllllllllllllllullllllllllllllllullllllllllllllllull',
    'lllllllllullllllllllllllllullllllllllllllllullllllllllllllllullllllllllllllllull',
    'lllllllllullllllllllllllllullllllllllllllllullllllllllllllllullllllllllllllllull',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'llllulllllllllllllllllllllulllllllllllllllllllllulllllllllllllllllllllulllllllll',
    'llllulllllllllllllllllllllulllllllllllllllllllllulllllllllllllllllllllulllllllll',
  ],
};

/**
 * The study at dusk. The left wall (x 2 to 37, rows 2 to 29) is bare for a chart or a board; the
 * window (x 41 to 74, rows 3 to 29) looks onto the harbor at dusk, its dark upper panes room for a
 * star. The desk runs from x 34 to the right edge, its top on rows 41 to 45: a thing standing on
 * it has its bottom row on row 44. The floor in front of the desk is free for a figure.
 */
export const geGroundStudy: PixelSprite = {
  id: 'ge-ground-study',
  name: 'study',
  tags: ['ge', 'ground'],
  blurb: 'A study: striped wall, a tall window onto the harbor at dusk, wood panelling, floorboards and a desk on the right.',
  palette: GE_PALETTE,
  rows: [
    '00060000060000060000060000060000060000060000060000060000060000060000060000060000',
    '00060000060000060000060000060000060000060000060000060000060000060000060000060000',
    '00060000060000060000060000060000060000060000060000060000060000060000060000060000',
    '00060000060000060000060000060000060000060uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu60000',
    '00060000060000060000060000060000060000060ullllllllllllllllllllllllllllllllu60000',
    '00060000060000060000060000060000060000060ullllllllllllllllllllllllllllllllu60000',
    '00060000060000060000060000060000060000060ullKKKKKKKKKKKKKluKKKKKKKKKKKKKllu60000',
    '00060000060000060000060000060000060000060ullKKKKKKKKKKKKKluKKKKKKKKKKKKKllu60000',
    '00060000060000060000060000060000060000060ullkkkkkkkkkkkkklukkkkkkkkkkkkkllu60000',
    '00060000060000060000060000060000060000060ullkkkkkkkkkkkkklukkkkkkkkkkkkkllu60000',
    '00060000060000060000060000060000060000060ull0000000000000lu0000000000000llu60000',
    '00060000060000060000060000060000060000060ull0000000000000lu0000000000000llu60000',
    '00060000060000060000060000060000060000060ull0000000000000lu0000000000000llu60000',
    '00060000060000060000060000060000060000060ull6666666666666lu6666666666666llu60000',
    '00060000060000060000060000060000060000060ull6666666666666lu6666666666666llu60000',
    '00060000060000060000060000060000060000060ullllllllllllllllllllllllllllllllu60000',
    '00060000060000060000060000060000060000060ulluuuuuuuuuuuuuuuuuuuuuuuuuuuullu60000',
    '00060000060000060000060000060000060000060ullEEEEEEEEEEEEEluEEEEEEEEEEEEEllu60000',
    '00060000060000060000060000060000060000060ullEEEEEEEEEEEEEluEEEEEEEEEEEEEllu60000',
    '00060000060000060000060000060000060000060ullIIIIIIIIIIIIIluIIIIIIIIIIIIIllu60000',
    '00060000060000060000060000060000060000060ullIIIIIIIIIIIIIluIIIIIIIIIIIIIllu60000',
    '00060000060000060000060000060000060000060ull2222222222222lu222kkkkkkkkkkllu60000',
    '00060000060000060000060000060000060000060ull3333333333333lukkkkkkkkkkkkkllu60000',
    '00060000060000060000060000060000060000060ull3333333333333lukkkkkkkkkkkkkllu60000',
    '00060000060000060000060000060000060000060ullcccddddc222cclucccccccdddcccllu60000',
    '00060000060000060000060000060000060000060ullcccccccccc22clucdddddcccccccllu60000',
    '00060000060000060000060000060000060000060ullllllllllllllllllllllllllllllllu60000',
    '00060000060000060000060000060000060000060ullllllllllllllllllllllllllllllllu60000',
    '0006000006000006000006000006000006000006oooooooooooooooooooooooooooooooooooo0000',
    '0006000006000006000006000006000006000006llllllllllllllllllllllllllllllllllll0000',
    'oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo',
    'llllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'uullllllllllkuullllllllllkuullllllllllkuullllllllllkuullllllllllkuullllllllllkuu',
    'uuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuu',
    'uuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuu',
    'uuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuu',
    'uuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuu',
    'uuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuu',
    'uuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuu',
    'uuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuuluuuuuuuuukuu',
    'uuluuuuuuuuukuuluuuuuuuuukuuluuuuukooooooooooooooooooooooooooooooooooooooooooooo',
    'uulkkkkkkkkkkuulkkkkkkkkkkuulkkkkkklllllllllllllllllllllllllllllllllllllllllllll',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuklllllllllllllllllllllllllllllllllllllllllllll',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkklllllllllllllllllllllllllllllllllllllllllllll',
    'lllulllllllllllllulllllllllllllullklllllllllllllllllllllllllllllllllllllllllllll',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuukuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'lllllllllullllllllllllllllulllllllkuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'lllllllllullllllllllllllllulllllllkukkkkkkkkkkkkkkkkkkkkuukkkkkkkkkkkkkkkkkkkkuu',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuukukuuuuuuuuuuuuuuuuuukuukuuuuuuuuuuuuuuuuuukuu',
    'lullllllllllllllllllllulllllllllllkukuuuuuuuuOOOuuuuuuukuukuuuuuuuuOOOuuuuuuukuu',
    'lullllllllllllllllllllulllllllllllkukuuuuuuuuuuuuuuuuuukuukuuuuuuuuuuuuuuuuuukuu',
    'lullllllllllllllllllllulllllllllllkukuuuuuuuuuuuuuuuuuukuukuuuuuuuuuuuuuuuuuukuu',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuukukkkkkkkkkkkkkkkkkkkkuukkkkkkkkkkkkkkkkkkkkuu',
    'llllllllllllulllllllllllllllllllllkuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'llllllllllllulllllllllllllllllllllkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'llllllllllllulllllllllllllllllllllkuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'llllllllllllulllllllllllllllllllllkuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuukuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'llllllllllllllllllllllllllllllllllkuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
  ],
};

/**
 * The pier at night. Stars belong in the sky above row 20; a far shore with a few town lights sits
 * on the horizon (rows 21 to 26), water to row 37, the railing on rows 35 to 39 and the boardwalk
 * from row 40, where feet stand. Lamps at x 5 and 75, their glass where geLampGlow goes
 * (GE_PIER_LAMPS).
 */
export const geGroundPier: PixelSprite = {
  id: 'ge-ground-pier',
  name: 'pier at night',
  tags: ['ge', 'ground'],
  blurb: 'Night over a far shore with a few lights, dark water, the railing and the plank boardwalk of a pier lit by two lamps.',
  palette: GE_PALETTE,
  rows: [
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKkkkkkkkkkkkkkkkkkkkkkkKKKKKKKKKKKKKKKKKKkkkkkkkkkkkkkKKKKKKK',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kkkkOOOkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkOOOkkk',
    'kkkOyyyO00000000000000000000000kkkkkkkkkkkkkkkkkkk000000000000000000000kkOyyyOkk',
    '0000OgO0000000000000000000000000000000000000000000000000000000000000000000OgO000',
    '00000D000000000000000000000000000000000000000000000000000000999999000000000D0000',
    '00000D000000999999900000000000000000000000000000000000099999999O99999999999D0000',
    '00000D9999999O999999999900000066666666666666666666699999999O99999999999O999D9999',
    '99999D99999999999O9999999999666666666666666669999999999O9999999999O99999999D9999',
    '99999D999999999999999999999999999999999999999999999999999999999999999999999D9999',
    '99999D999999999999999999999999999999999999999999999999999999999999999999999D9999',
    'cccccDcccccccccccccccccccccccccccccccccccccccccccccccccccccOcccccccccccccccDcccc',
    'ccccdDddddcccOcccccccccccccccccccddddddddccccccccccccccccccccccOcccccccccccDcccc',
    'cccccDcccccccccccccccccccccccccccccccccccccccccccccccccccccOdddddddccccccccDcccc',
    'cccccDcccccccOcccccccccccccccccccccccccccccccccccccccccccccccccOcccccccccccDcccc',
    'cccccDccccccdddddddddcccccccccccccccccccccccddddddcccccccccOcccccccccccccccDcccc',
    'cccccDcccccccOcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccDcccc',
    'dddddDccccccccccccccccccccccdddddddcccccccccccccccccccccccccccccccdddddddddDcccc',
    'cccccDcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccDcccc',
    'oooooDoooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooDoooo',
    'lllllDlllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllDllll',
    'cclccDccccclcccccccclcccccccclcccccccclcccccccclcccccccclcccccccclcccccccclDcccc',
    'uuuuuDuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuDuuuu',
    'KKlKKDKKKKKlKKKKKKKKlKKKKKKKKlKKKKKKKKlKKKKKKKKlKKKKKKKKlKKKKKKKKlKKKKKKKKlDKKKK',
    'uuuuuDuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuDuuuu',
    'lllllDllllllllllullllllllllullllllllllullllllllllullllllllllullllllllllulllDllll',
    'uuuuuDuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuDuuuu',
    'llullDllllllllllulllllllllllllulllllllllllllulllllllllllllulllllllllllllullDllll',
    'llullDllllllllllulllllllllllllulllllllllllllulllllllllllllulllllllllllllullDllll',
    'uuuuuDuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuDuuuu',
    'lllllDlllllulllllllllllllllllulllllllllllllllllulllllllllllllllllulllllllllDllll',
    'lllllDlllllulllllllllllllllllulllllllllllllllllulllllllllllllllllulllllllllDllll',
    'lllllDlllllulllllllllllllllllulllllllllllllllllulllllllllllllllllulllllllllDllll',
    'uuuuuDuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuDuuuu',
    'looooDoooolllllllllllllllllllullllllllllllllllllllllullllllllllllllllllooooDoooo',
    'ooooDDDoooollllllllllllllllllullllllllllllllllllllllulllllllllllllllllooooDDDooo',
    'loookkkooolllllllllllllllllllullllllllllllllllllllllulllllllllllllllllloookkkooo',
    'llllllullllllllllllllllllllllullllllllllllllllllllllullllllllllllllllllllllullll',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
    'lllllllllllllllllullllllllllllllllllllllllllllullllllllllllllllllllllllllllullll',
    'lllllllllllllllllullllllllllllllllllllllllllllullllllllllllllllllllllllllllullll',
    'lllllllllllllllllullllllllllllllllllllllllllllullllllllllllllllllllllllllllullll',
    'lllllllllllllllllullllllllllllllllllllllllllllullllllllllllllllllllllllllllullll',
    'lllllllllllllllllullllllllllllllllllllllllllllullllllllllllllllllllllllllllullll',
  ],
};

/**
 * Terraces at dawn. The sun is just up over the sea at x 10 to 19, its light laid on the water;
 * four terraces climb out of the sea to the right (GE_DAWN_STEPS), each with a lit stone wall facing
 * the sun. Something standing on a terrace has its bottom row on that terrace's top row.
 */
export const geGroundDawn: PixelSprite = {
  id: 'ge-ground-dawn',
  name: 'terraces at dawn',
  tags: ['ge', 'ground'],
  blurb: 'Sunrise over the sea, with green terraces climbing to the right in four steps behind lit stone walls.',
  palette: GE_PALETTE,
  rows: [
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhdddddddddddddddddddddddddhhhhhhhhhhhhhhhhhhhhddddddddddddddddhhhhhhhhh',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    '6666666666666666666hhhhhhhhhhhhhhhhhhhhh6666666666666666666666666hhhhhhhhhhhhhhh',
    '66666666666666666666666666666666666666666666666666666666666666666666666666666666',
    '66666666666666666666666666666666666666666666666666666666666666666666666666666666',
    '66666666666666666666666666666666666666666666666666666666666666666666666666666666',
    '66666666666666666666666666666666666666666666666666666666666666666666666666666666',
    'hhhhhhEEEEEEEEEEEEEEEEEEEEEEEEEhhhhhhhhhhhhhhhhhhhhhEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
    'IIIIIIIIIIIIIIIIIIIIIIIhhhhhhhhhhhhhIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIhhhhhhhhh',
    'IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII',
    'IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII',
    'IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII',
    'hhhhhhhhhh22222222222222222222222222222222222hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    '22222222222222222222222222222222222222222222222222222222222222222222222222222222',
    '22222222222224444222222222222222222222222222222222222222222222222222222222222222',
    'hhhhhhhhhhh445555433333333333333333333333hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    '33333333334455555443333333333333333333333333333333333333333333333333333333333333',
    '44444444444555555544444444444444444444444444444444444444444444nnnnnnnnnnnnnnnnnn',
    'dddddddddc444444444cccccccccccccccccddddddddddddccccccccccccccol8888888888888888',
    'cccccccccccc33333cccccccccccccccccccccccccccccccccccccccccccccol8888888888888888',
    'ccccccddddd4444444ccccccccccccccccccccccccccdddddddddcccccccccll7777777777777777',
    'ccccccccccccc333ccccccccccccccccccccccccccccccccccccccccccccccol8888888888888888',
    'ccdddddccccc44444cccccccccccccccccccccccccccccccccddddddddccccol8888888888888888',
    'ccccccccccccccccccccccccccccccccccccccccccnnnnnnnnnnnnnnnnnnnnol8888888888888888',
    'ccccccccccdd4444ccccccccccccccccccccccccccol888888888888888888888888888888888888',
    'ccccccccccccccccccccccccccccccccccccccccccol888888888888888888888888888888888888',
    'ddddccccccccc444ccccccccccccccccccccccccccll777777777777777777888888888888888888',
    'ccccccccccccccccccccccccccccccccccccccccccol888888888888888888888888888888888888',
    'ccccccccccccc44dddddccccccccccccccccccccccol888888888888888888888888888888888888',
    'ccccccccccccccccccccccnnnnnnnnnnnnnnnnnnnnol888888888888888888888888888888888888',
    'cccdddddddcccc4cccccccol88888888888888888888888888888888888888888888888888888888',
    'ccccccccccccccccccccccol88888888888888888888888888888888888888888888888888888888',
    'ccccccccccccdddddcccccll77777777777777777788888888888888888888888888888888888888',
    'ccccccccccccccccccccccol88888888888888888888888888888888888888888888888888888888',
    'ccccccccccccccccccccccol88888888888888888888888888888888888888888888888888888888',
    'nnnnnnnnnnnnnnnnnnnnnnol88888888888888888888888888888888888888888888888888888888',
    '88888888888888888888888888888888888888888888888888888888888888888888888888888888',
    '88888888888888888888888888888888888888888888888888888888888888888888888888888888',
    '77777777777777777777778888888888888888888888888888888888888888888888888888888888',
    '77777777777777777777777777777777777777777777777777777777777777777777777777777777',
    '88888888888888888888888888888888888888888888888888888888888888888888888888888888',
    '88888888888888888888888888888888888888888888888888888888888888888888888888888888',
    '77777777777777777777777777777777777777777777777777777777777777777777777777777777',
    '88888888888888888888888888888888888888888888888888888888888888888888888888888888',
    '88888888888888888888888888888888888888888888888888888888888888888888888888888888',
    '99999999999999999999999999999999999999999999999999999999999999999999999999999999',
    '99999999999999999999999999999999999999999999999999999999999999999999999999999999',
    '99999999999999999999999999999999999999999999999999999999999999999999999999999999',
    '99999999999999999999999999999999999999999999999999999999999999999999999999999999',
  ],
};

/* ── grand buildings: 36 wide, no steps of their own, for the plaza (GE_PLAZA_STAGE) ──────────── */

/** The central bank at plaza size, 36x27: geBank's pediment, coin and columns, big enough to be the picture. */
export const geBankGrand: PixelSprite = {
  id: 'ge-bank-grand',
  name: 'grand central bank',
  tags: ['ge', 'prop', 'institution'],
  blurb: 'A big columned central bank with a gold coin in its pediment, drawn to stand on the plaza steps.',
  palette: GE_PALETTE,
  rows: [
    '.................OO.................',
    '...............OOxxOO...............',
    '.............OOxxOOOxOO.............',
    '...........OOxxxOyyGOxxOO...........',
    '.........OOxxxxOyGGGgOxxxOO.........',
    '.......OOxxxxxxOyGOGgOxxxxxOO.......',
    '.....OOxxxxxxxxOGGGggOxxxxxxxOO.....',
    '...OOxxxxxxxxxxxOgggOxxxxxxxxxxOO...',
    '.OOxxxxxxxxxxxxxxOOOxxxxxxxxxxxxxOO.',
    'OXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXO',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    'OwwwwwwwwwwwwwwwwWWwwwwwwwwwwwwwwwwO',
    'OxxxxxxxxxxxxxxxxXXxxxxxxxxxxxxxxxxO',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    '.OwxXO.OwxXO.OwxXOOXxwO.OXxwO.OXxwO.',
    '.OwxXOkOwxXOkOwxXOOXxwOkOXxwOkOXxwO.',
    '.OwxXOkOwxXOkOwxXOOXxwOkOXxwOkOXxwO.',
    '.OwxXOkOwxXOkOwxXOOXxwOkOXxwOkOXxwO.',
    '.OwxXOkOwxXOkOwxXOOXxwOkOXxwOkOXxwO.',
    '.OwxXOkOwxXOkOwxXOOXxwOkOXxwOkOXxwO.',
    '.OwxXOkOwxXOkOwxXOOXxwOkOXxwOkOXxwO.',
    '.OwxXOkOwxXOkOwxXOOXxwOkOXxwOkOXxwO.',
    '.OwxXOkOwxXOkOwxXOOXxwOkOXxwOkOXxwO.',
    '.OwxXOkOwxXOkOwxXOOXxwOkOXxwOkOXxwO.',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    'OxxxxxxxxxxxxxxxxXXxxxxxxxxxxxxxxxxO',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
  ],
};

/**
 * The capitol at plaza size, 36x26: dome, drum and portico, lit windows in the wings. A geFlag on
 * its finial goes at (x + 17, y - 8), its foot on the finial.
 */
export const geCapitolGrand: PixelSprite = {
  id: 'ge-capitol-grand',
  name: 'grand capitol',
  tags: ['ge', 'prop', 'institution'],
  blurb: 'A big domed government building with lit windows in its wings, drawn to stand on the plaza steps.',
  palette: GE_PALETTE,
  rows: [
    '.................OO.................',
    '.................DD.................',
    '................DDDD................',
    '...............DxXXxD...............',
    '.............DDxxxxxxDD.............',
    '............DxxxxXXxxxxD............',
    '...........DwxxxxXXxxxxwD...........',
    '...........DwxxxxXXxxxxwD...........',
    '..........DDDDDDDDDDDDDDDD..........',
    '..........DyDDyDDyyDDyDDyD..........',
    '..........DyDDyDDyyDDyDDyD..........',
    '.........DDDDDDDDDDDDDDDDDD.........',
    '..DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD..',
    '..DwwwwwwwwwwwwwwWWwwwwwwwwwwwwwwD..',
    '.DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD.',
    '..DyyD.DyyD..DxwXDDXwxD..DyyD.DyyD..',
    '..DyyD.DyyD..DwxXDDXxwD..DyyD.DyyD..',
    '..DGGD.DGGD..DwxXDDXxwD..DGGD.DGGD..',
    '..DDDD.DDDD..DwxXDDXxwD..DDDD.DDDD..',
    '..DyyD.DyyD..DwxXDDXxwD..DyyD.DyyD..',
    '..DyyD.DyyD..DwxXDDXxwD..DyyD.DyyD..',
    '..DGGD.DGGD..DwxXDDXxwD..DGGD.DGGD..',
    '..DDDD.DDDD..DwxXDDXxwD..DDDD.DDDD..',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    'DxxxxxxxxxxxxxxxxXXxxxxxxxxxxxxxxxxD',
    'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
  ],
};

/* ── where things stand on the grounds ──────────────────────────────────────────────────────── */

/** A 36-wide grand building at x 22 stands centred on geGroundPlaza's steps, its bottom row on row 33. */
export const GE_PLAZA_STAGE = { x: 22, bottom: 33 } as const;

/** Top-left of geLampGlow on each of geGroundPlaza's lamps. */
export const GE_PLAZA_LAMPS = [{ x: 5, y: 15 }, { x: 72, y: 15 }] as const;

/** Top-left of geLampGlow on each of geGroundPier's lamps. */
export const GE_PIER_LAMPS = [{ x: 4, y: 19 }, { x: 74, y: 19 }] as const;

/** geGroundDawn's four terraces, low to high: their x span and the row their grass is on. */
export const GE_DAWN_STEPS = [
  { x0: 0, x1: 21, top: 46 },
  { x0: 22, x1: 41, top: 40 },
  { x0: 42, x1: 61, top: 34 },
  { x0: 62, x1: 79, top: 28 },
] as const;

/* ── people ─────────────────────────────────────────────────────────────────────────────────── */

/**
 * The pathway's student seen from behind, 16x25, arms down: the same beanie, hair and emerald
 * hoodie as geStudent, for a scene the student is looking INTO (a bank, a road, a city). Stands
 * where geStudent would, so swapping one for the other keeps the feet in place.
 */
export const geStudentBack: PixelSprite = {
  id: 'ge-student-back',
  name: 'student from behind',
  tags: ['ge', 'character'],
  blurb: 'The student from behind in an emerald hoodie and orchid beanie, arms at their sides.',
  palette: GE_PALETTE,
  rows: [
    '........EEEEE...',
    '.......EqPPPpE..',
    '.......EQqqqqE..',
    '.......HHHHHHH..',
    '.......HHHHHHH..',
    '.......HHHHHHH..',
    '........HHHHH...',
    '.........UCU....',
    '......JJJnnnJJJ.',
    '.....JNJNJnJNnJJ',
    '.....JNJNNJnNJnJ',
    '.....JNJNNNNnJnJ',
    '.....JNJNNNNnJnJ',
    '.....JNJNNNNnJnJ',
    '.....JNJNNNNnJnJ',
    '.....JNJNNNNnJnJ',
    '.....JMJJJJJJJUJ',
    '......M.LLVLV.C.',
    '........LLVLV...',
    '........LV.LV...',
    '........LV.LV...',
    '........LV.LV...',
    '........LV.LV...',
    '.......DDDDDDD..',
    '.......DzzDzzD..',
  ],
};

/** A figure's cast shadow, 10x1, falling right of the feet: place it at (student x + 7, student y + 24). */
export const geShadow: PixelSprite = {
  id: 'ge-shadow',
  name: 'cast shadow',
  tags: ['ge'],
  blurb: 'A short dark cast shadow.',
  palette: GE_PALETTE,
  rows: [
    'ZZZZZZZZZZ',
  ],
};

/* ── props ──────────────────────────────────────────────────────────────────────────────────── */

/** A price tag, 9x7: a cream card with a punched hole on the left for its string. A 5x5 mark goes at GE_TAG_MARK. */
export const geTag: PixelSprite = {
  id: 'ge-tag',
  name: 'price tag',
  tags: ['ge', 'prop', 'money'],
  blurb: 'A blank cream price tag with a hole for its string.',
  palette: GE_PALETTE,
  rows: [
    '...OOOOOO',
    '..OAAAAAO',
    '.OAAAAAAO',
    'OKAAAAAAO',
    '.OAAAAAAO',
    '..OAAAAAO',
    '...OOOOOO',
  ],
};

/** Where a 5x5 mark sits on geTag, and where its hole is (for a string). */
export const GE_TAG_MARK = { x: 3, y: 1 } as const;
export const GE_TAG_HOLE = { x: 1, y: 3 } as const;

/* ── moving bits: placed as layers, never stamped ───────────────────────────────────────────── */

/** A fair-weather cloud, 15x5, for a `drift` across geGroundQuay's sky. */
export const geCloud: PixelSprite = {
  id: 'ge-cloud',
  name: 'cloud',
  tags: ['ge'],
  blurb: 'A white cloud with a lavender underside.',
  palette: GE_PALETTE,
  rows: [
    '.....zzzz......',
    '..zzzzzzzzz.zz.',
    '.zzzzzzzzzzzzzz',
    'zzzzzzzzzzzzzzz',
    '.xxxxxxxxxxxxx.',
  ],
};

/** A small far cloud, 9x3. */
export const geCloudSmall: PixelSprite = {
  id: 'ge-cloud-small',
  name: 'small cloud',
  tags: ['ge'],
  blurb: 'A small white cloud.',
  palette: GE_PALETTE,
  rows: [
    '...zzz...',
    '.zzzzzzz.',
    'xxxxxxxxx',
  ],
};

/** geFlag for a second country, in red. Pair it with the emerald one, a beat later (geLater), so they wave apart. */
export const geFlagRed: PixelSprite = geTint(geFlag, 'ge-flag-red', { m: 's', N: 'R', n: 'r', J: '1' });

/** geFlag for a third country, in blue. */
export const geFlagBlue: PixelSprite = geTint(geFlag, 'ge-flag-blue', { m: 'B', N: 'b', n: 'd', J: 'h' });

/** geShimmer for daylight: white and pale-blue glints instead of a low sun's gold. */
export const geGlintDay: PixelSprite = geTint(geShimmer, 'ge-glint-day', { y: 'z', '4': 'B', '3': 'B' });

/** A lamp's glass flaring, 3x1, for a slow `twinkle` on the plaza and pier lamps (GE_PLAZA_LAMPS, GE_PIER_LAMPS). */
export const geLampGlow: PixelSprite = {
  id: 'ge-lamp-glow',
  name: 'lamp glow',
  tags: ['ge'],
  blurb: 'The pale core of a lamp, flaring.',
  palette: GE_PALETTE,
  rows: [
    '555',
  ],
};
