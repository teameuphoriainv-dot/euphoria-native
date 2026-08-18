/**
 * Preston Blair viseme mapping — the groundwork for Atlas's mouth.
 *
 * WHY THIS IS EASIER FOR US THAN IT WAS FOR DUOLINGO. They designed 20+ mouth shapes per
 * character and drove them from phoneme timings extracted by in-house speech-recognition and
 * pronunciation models, because hand-animating 40 languages of audio was unfeasible.
 *
 * Atlas does not speak — it TYPES. `atlas-speech.tsx` emits one character every CHAR_MS = 26ms.
 * The timing that Duolingo needed a speech pipeline to recover is, for us, already the render
 * loop. We need only the shape half: grapheme → viseme.
 *
 * Preston Blair's classic set collapses every English phoneme onto ten mouth shapes, which is
 * why cartoon lip sync has used it since the 1940s. Ten is enough to read as speech; more shapes
 * buy accuracy no viewer perceives at 26ms per character.
 *
 * This module is deliberately pure and rendering-free: it maps text to a viseme timeline and
 * nothing else, so it can be unit-checked without a simulator, a canvas, or a device.
 */

/** The ten Preston Blair shapes, plus REST for silence between words. */
export type Viseme =
  | 'AI' // open — "father", "ice"
  | 'E' // wide, slightly open — "bet"
  | 'O' // rounded — "go"
  | 'U' // small round — "you"
  | 'CDGKNRSTHYZ' // teeth nearly together — the big consonant bucket
  | 'FV' // lower lip to upper teeth
  | 'L' // tongue visible, mouth open
  | 'MBP' // lips fully closed — the only shape that must not be skipped
  | 'WQ' // tight pucker
  | 'REST'; // neutral

/**
 * Grapheme → viseme. Single letters only; digraphs are handled in `visemesFor` because they
 * must beat the single-letter rule (the "th" in "this" is one shape, not t-then-h).
 */
const LETTER: Record<string, Viseme> = {
  a: 'AI', i: 'AI',
  e: 'E',
  o: 'O',
  u: 'U', y: 'U',
  f: 'FV', v: 'FV',
  l: 'L',
  m: 'MBP', b: 'MBP', p: 'MBP',
  w: 'WQ', q: 'WQ',
  c: 'CDGKNRSTHYZ', d: 'CDGKNRSTHYZ', g: 'CDGKNRSTHYZ', h: 'CDGKNRSTHYZ',
  j: 'CDGKNRSTHYZ', k: 'CDGKNRSTHYZ', n: 'CDGKNRSTHYZ', r: 'CDGKNRSTHYZ',
  s: 'CDGKNRSTHYZ', t: 'CDGKNRSTHYZ', x: 'CDGKNRSTHYZ', z: 'CDGKNRSTHYZ',
};

/** Digraphs that are ONE mouth shape, not two. Checked before single letters. */
const DIGRAPH: Record<string, Viseme> = {
  th: 'CDGKNRSTHYZ',
  ch: 'CDGKNRSTHYZ',
  sh: 'CDGKNRSTHYZ',
  ph: 'FV', // "phone" is an F shape, not a P shape — the classic lip-sync giveaway
  wh: 'WQ',
  qu: 'WQ',
  oo: 'U',
  ou: 'O',
  ee: 'E',
};

/**
 * Map a string to one viseme per character position, so the result indexes directly by the
 * typewriter's character count with no second timeline to keep in step.
 *
 * The second character of a digraph repeats the pair's viseme rather than emitting its own. A
 * mouth that snaps to a new shape mid-digraph reads as a stutter, which is the artefact naive
 * per-letter lip sync is recognisable by.
 */
export function visemesFor(text: string): Viseme[] {
  const out: Viseme[] = [];
  const lower = text.toLowerCase();
  for (let i = 0; i < lower.length; i++) {
    const pair = lower.slice(i, i + 2);
    if (DIGRAPH[pair]) {
      out.push(DIGRAPH[pair], DIGRAPH[pair]);
      i++;
      continue;
    }
    const ch = lower[i];
    // Whitespace and punctuation close the mouth. Speech has gaps; a mouth that never rests
    // reads as chewing rather than talking.
    out.push(LETTER[ch] ?? 'REST');
  }
  return out;
}

/**
 * The viseme showing after `n` characters have been typed — the exact call `atlas-speech.tsx`
 * needs, given it already tracks that count.
 */
export function visemeAt(text: string, n: number): Viseme {
  if (n <= 0) return 'REST';
  const v = visemesFor(text);
  return v[Math.min(n, v.length) - 1] ?? 'REST';
}

/** Assert-based self-check. No simulator, no canvas — `npx tsx src/lib/atlas/visemes.ts`. */
export function demo(): void {
  const eq = (a: unknown, b: unknown, msg: string) => {
    if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${msg}: ${JSON.stringify(a)}`);
  };
  eq(visemesFor('ma'), ['MBP', 'AI'], 'simple letters');
  // A digraph is one shape held across both characters, never two shapes.
  eq(visemesFor('th'), ['CDGKNRSTHYZ', 'CDGKNRSTHYZ'], 'digraph held');
  // "phone" must open on an F, not a P — the classic giveaway.
  eq(visemesFor('ph')[0], 'FV', 'ph is an F shape');
  // Length must equal the character count, or the mouth desynchronises from the typewriter.
  eq(visemesFor('hello there').length, 'hello there'.length, 'one viseme per character');
  // Gaps close the mouth.
  eq(visemesFor('a b')[1], 'REST', 'space rests');
  eq(visemesFor('hi!')[2], 'REST', 'punctuation rests');
  // Index alignment with the typewriter's count.
  eq(visemeAt('mo', 1), 'MBP', 'first character');
  eq(visemeAt('mo', 2), 'O', 'second character');
  eq(visemeAt('mo', 0), 'REST', 'nothing typed yet');
  eq(visemeAt('mo', 99), 'O', 'past the end holds the last shape');
  // Case must not matter — copy is sentence-cased.
  eq(visemesFor('MA'), visemesFor('ma'), 'case-insensitive');

  console.log('visemes self-check OK');
}
