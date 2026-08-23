/**
 * Every metaphor artKeyFor can return must have a sprite, and no two may share one.
 *
 * artKeyFor matches lesson TITLES against a regex table and falls back to a hash over NEUTRAL, so
 * the set of keys it can emit is decided by data, not by a type. A key with no entry in ART
 * renders the fallback coin — meaning a whole class of lessons silently wears the wrong mark, and
 * it looks deliberate. Nothing throws and nothing logs.
 *
 * The distinctness check is the point of the rewrite, not a nicety. The system this replaced drew
 * three courses' "What is a stock?" with the SAME scene in three tints, because keys are matched
 * on title and titles repeat across courses. Forty metaphors sharing thirty sprites would quietly
 * recreate exactly that.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync('src/components/lesson-art.tsx', 'utf8');

const artBlock = /const ART: Record<string, PixelSprite> = \{([\s\S]*?)\n\};/.exec(src);
assert.ok(artBlock, 'could not find the ART map — the pin cannot see what it guards');
const entries = [...artBlock[1].matchAll(/^\s{2}(\w+)(?::\s*(\w+))?,/gm)]
  .map((m) => ({ key: m[1], sprite: m[2] ?? m[1] }));
assert.ok(entries.length >= 30, `parsed only ${entries.length} ART entries — the regex has drifted`);

/*
 * Keys the matcher can actually emit: every entry in the METAPHORS table plus the NEUTRAL
 * fallback. Entries are `[/regex/i, 'key'],`, so the key is the quoted string before the closing
 * bracket — the first draft of this pin matched the wrong shape and found TWO keys instead of
 * forty, which made the coverage assertion below pass vacuously. A pin that cannot see what it
 * guards is worse than no pin, because it reports OK.
 */
const metaBlock = /const METAPHORS[\s\S]*?\n\];/.exec(src);
assert.ok(metaBlock, 'could not find the METAPHORS table');
const emitted = new Set([
  ...[...metaBlock[0].matchAll(/,\s*'(\w+)'\s*\]/g)].map((m) => m[1]),
  ...[...(/const NEUTRAL = \[([^\]]*)\]/.exec(src)?.[1] ?? '').matchAll(/'(\w+)'/g)].map((m) => m[1]),
]);
assert.ok(emitted.size >= 30, `parsed only ${emitted.size} emittable keys — the METAPHORS regex has drifted`);

const have = new Set(entries.map((e) => e.key));
const missing = [...emitted].filter((k) => !have.has(k));
assert.deepEqual(
  missing, [],
  'artKeyFor can return these, but ART has no sprite for them — those lessons silently render the ' +
  'fallback coin, which looks deliberate',
);

const sprites = entries.map((e) => e.sprite);
const dupes = [...new Set(sprites.filter((v, i) => sprites.indexOf(v) !== i))];
assert.deepEqual(
  dupes, [],
  'two metaphors share a sprite — that is exactly the defect this rewrite removed, where three ' +
  'courses drew the same scene in three tints',
);

/*
 * HEADROOM FOR UNIQUENESS. assignLessonArt gives every lesson in a course a DIFFERENT mark, and it
 * can only do that while ART holds at least as many sprites as the longest course holds lessons.
 * Without this the failure is silent and gradual: add a 41st lesson to a course and exactly one
 * row somewhere in the middle of that path starts sharing a picture with another.
 */
import { readdirSync } from 'node:fs';
const COURSES = 'src/lib/curriculum/courses';
let longest = 0;
let longestFile = '';
for (const f of readdirSync(COURSES).filter((x) => x.endsWith('.ts'))) {
  const n = [...readFileSync(`${COURSES}/${f}`, 'utf8').matchAll(/\bL\(\s*\d+\s*,\s*'/g)].length;
  if (n > longest) { longest = n; longestFile = f; }
}
assert.ok(longest > 0, 'parsed no lessons — the L( count regex has drifted');
assert.ok(
  entries.length >= longest,
  `ART has ${entries.length} sprites but ${longestFile} has ${longest} lessons — assignLessonArt ` +
  'cannot give every lesson a distinct mark, so one row will silently share a picture',
);

console.log(
  `lesson-art-pin: OK — ${entries.length} metaphors, all distinct, covering ${emitted.size} ` +
  `emittable keys, with headroom for the longest course (${longest} lessons).`,
);
