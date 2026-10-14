/**
 * A content hash of one RAW synced lesson, the staleness key for a native lesson.
 *
 * WHAT IT COVERS AND WHY. Everything a learner would see from the synced lesson: num, title, xp, the
 * steps and the mastery challenge. Measured on 2026-10-13 over investing-fundamentals:1 from
 * courseIndex.ts (the raw loader): 16,994 characters, about 0.1ms, value 56c725c5.
 *
 * IT MUST BE FED THE RAW LESSON (courseIndex.ts), never the wrapped one from curriculum/index.ts.
 * The wrapped lesson's `steps` is a lazy getter that derives decks, so hashing it would both run the
 * derivation this layer exists to skip and change value whenever the deriver changes, which would
 * make every deriver edit look like a web edit.
 */
import type { PathwayLesson } from '../curriculum/types';
import { fnv1a } from '../mobile-lesson/stepId';

export function lessonFingerprint(raw: PathwayLesson): string {
  return fnv1a(
    JSON.stringify({ num: raw.num, title: raw.title, xp: raw.xp, steps: raw.steps, challenge: raw.challenge ?? null }),
  );
}
