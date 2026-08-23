/**
 * Every course must have a pixel mark.
 *
 * A course with no mark renders a blank box the size of its icon, which reads as a LAYOUT bug
 * rather than as missing art — you look for the broken flexbox, not the missing sprite. That is
 * precisely how four broken icons survived an entire session in ui-icon.tsx, and it is why that
 * file grew its own runtime check.
 *
 * The failure has a specific trigger: adding a course. courseIndex.ts is edited, the rail renders,
 * eleven marks appear and the twelfth is an empty gap that nobody attributes to this file.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const courses = [...readFileSync('src/lib/curriculum/courseIndex.ts', 'utf8')
  .matchAll(/id: '([a-z-]+)'/g)].map((m) => m[1]);
assert.ok(courses.length >= 12, `parsed only ${courses.length} courses — the id regex has drifted`);

const marks = new Set([...readFileSync('src/components/art/course-mark.tsx', 'utf8')
  .matchAll(/^\s{2}'([a-z-]+)':/gm)].map((m) => m[1]));
/* Floor of 1, NOT of 12. A floor equal to the course count masks the very failure this pin exists
 * for: delete a mark and the sanity guard trips first, reporting "regex has drifted" instead of
 * naming the course that lost its art. The floor's only job is proving the regex matched at all. */
assert.ok(marks.size >= 1, 'parsed no marks at all — the MARKS regex has drifted');

assert.deepEqual(
  courses.filter((id) => !marks.has(id)), [],
  'courses with no pixel mark — their rail slot renders as an empty box, which reads as a broken ' +
  'layout rather than as missing art',
);

// Two courses sharing a sprite is not an error the type system can catch, and it makes the rail
// ambiguous at exactly the size it is scanned at.
const sprites = [...readFileSync('src/components/art/course-mark.tsx', 'utf8')
  .matchAll(/^\s{2}'[a-z-]+':\s*(\w+),/gm)].map((m) => m[1]);
const dupes = sprites.filter((v, i) => sprites.indexOf(v) !== i);
assert.deepEqual([...new Set(dupes)], [], 'two courses share a sprite — the rail cannot be scanned');

console.log(`course-mark-pin: OK — ${courses.length} courses, ${marks.size} marks, all distinct.`);
