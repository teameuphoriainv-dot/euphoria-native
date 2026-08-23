/**
 * N5 — a lesson must never ask the same question twice.
 *
 * Reported as "the '$1,000 emergency expense' question shows up more than once in the first
 * personal finance lesson", then WIDENED by a later audit to "every lesson". Measuring it settled
 * that: across 299 lessons there were exactly TWO instances, both in Personal Finance. The audit's
 * widening was wrong, and treating it as a curriculum-wide re-sync would have been days of work
 * aimed at a two-line bug.
 *
 * THE MECHANISM, which is what makes this worth a gate. Neither was a copy-paste slip. A lesson is
 * `L(..., [body steps], [checkpoint questions])`, and in both cases a question asked as a practice
 * card in the BODY was asked again verbatim in the END-OF-LESSON CHECKPOINT. Those two arrays are
 * hundreds of lines apart and are written at different times, so nothing about the source makes
 * the collision visible — you only see it by taking the lesson, which is exactly how a cofounder
 * found it and how nobody else did.
 *
 * The checkpoint exists to test recall of the lesson, not to replay it. A verbatim repeat teaches
 * the reader that the checkpoint is padding.
 */
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'src/lib/curriculum/courses';
const norm = (s) => s.replace(/\\'/g, "'").replace(/\s+/g, ' ').trim().toLowerCase().replace(/\?+$/, '').trim();
const all = (re, text) => [...text.matchAll(re)].map((m) => norm(m[1]));

let lessons = 0;
const repeats = [];
const withinBody = [];

for (const file of readdirSync(DIR).filter((f) => f.endsWith('.ts'))) {
  const src = readFileSync(join(DIR, file), 'utf8');
  const starts = [...src.matchAll(/\bL\(/g)].map((m) => m.index);
  if (!starts.length) continue;
  starts.push(src.length);

  for (let i = 0; i < starts.length - 1; i++) {
    const block = src.slice(starts[i], starts[i + 1]);
    lessons++;

    const checkpoint = new Set(all(/\bcq\(\s*'((?:[^'\\]|\\.)+?)'/g, block));
    const bodyList = [
      ...all(/prompt:\s*'((?:[^'\\]|\\.)+?)'/g, block),
      ...all(/\bq\(\s*'((?:[^'\\]|\\.)+?)'/g, block),
    ];
    const body = new Set(bodyList);

    // Short strings are labels and option text, not questions — they collide by coincidence.
    for (const t of checkpoint) {
      if (t.length > 12 && body.has(t)) repeats.push(`${file} lesson#${i + 1}: "${t.slice(0, 70)}"`);
    }
    const seen = new Set();
    for (const t of bodyList) {
      if (t.length > 12 && seen.has(t)) withinBody.push(`${file} lesson#${i + 1}: "${t.slice(0, 70)}"`);
      seen.add(t);
    }
  }
}

assert.ok(lessons > 250, `parsed only ${lessons} lessons — the L( split has drifted`);
assert.deepEqual(
  repeats, [],
  'a checkpoint question repeats one already asked in the lesson body (N5). The checkpoint tests ' +
  'recall of the lesson, it does not replay it',
);
assert.deepEqual(withinBody, [], 'the same question is asked twice inside one lesson body (N5)');

console.log(`lesson-question-pin: OK — ${lessons} lessons, no question asked twice in the same lesson.`);
