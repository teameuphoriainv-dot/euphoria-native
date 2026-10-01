/**
 * Which lesson carries which art.
 *
 * KEYED `course:lessonNumber`, the same position key parts/placements.ts uses, and for the same
 * reason: the curriculum files are synced from the web repo, so nothing about a lesson's art may
 * live inside them. A lesson with no entry keeps the shared defaults (the flame opener, the plain
 * starfield, the finish screen as it was), so adding art is always opt-in per lesson.
 *
 * PILOT (owner, 2026-09-29): one lesson, all out, before anything is rolled out further.
 * When this grows past a handful of lessons, load each course's art on demand, the way the lesson
 * decks already are (scripts/lazy-deck-pin.mjs), instead of importing every scene here.
 */
import { qaBackdrop } from './qa-backdrop';
import { qa1Finish } from './qa1-finish';
import { qa1Opener } from './qa1-opener';
import type { LessonArtSet } from './types';

export const LESSON_ART: Readonly<Record<string, LessonArtSet>> = {
  'quantitative-analysis:1': { opener: qa1Opener, backdrop: qaBackdrop, finish: qa1Finish },
};

export function lessonArtFor(courseId: string, lessonNumber: number): LessonArtSet | null {
  return LESSON_ART[`${courseId}:${String(lessonNumber)}`] ?? null;
}

export type { LessonArtSet, SceneArt, SceneLayer, SceneMotion } from './types';
