/**
 * One-shot handoff from the lesson runner to the Learn trail.
 *
 * This is deliberately session-only: it describes an animation that is waiting to be seen, not
 * learner progress. Persisting it would replay an old celebration after a cold launch.
 */
import type { SegmentKind } from '@/lib/lesson-segments';

/**
 * `segment` names the PART that just finished. It is absent for a whole lesson.
 *
 * The distinction exists because the trail has two different reactions and they mean two
 * different things. The node "earned" bounce and the drawn connector to the next node both say
 * THIS LESSON IS DONE AND THE NEXT ONE IS OPEN. Firing them after Learn (one of three parts)
 * would announce an unlock that has not happened: the next node is still locked, because
 * `doneFlags` only flips on `completedLessons`, which the part credit deliberately never touches
 * (design section 3b). The trail would bounce a node and draw a line to a node the user cannot
 * press. A part fills one arc of the current node's ring instead, and nothing else moves.
 */
export type LessonTrailCelebration = { lessonId: string; segment?: SegmentKind };

let pending: LessonTrailCelebration | null = null;

export function queueLessonTrailCelebration(lessonId: string, opts?: { segment?: SegmentKind }) {
  pending = { lessonId, segment: opts?.segment };
}

export function takeLessonTrailCelebration(): LessonTrailCelebration | null {
  const celebration = pending;
  pending = null;
  return celebration;
}
