/**
 * One-shot handoff from the lesson runner to the Learn trail.
 *
 * This is deliberately session-only: it describes an animation that is waiting to be seen, not
 * learner progress. Persisting it would replay an old celebration after a cold launch.
 */
let pendingLessonId: string | null = null;

export function queueLessonTrailCelebration(lessonId: string) {
  pendingLessonId = lessonId;
}

export function takeLessonTrailCelebration() {
  const lessonId = pendingLessonId;
  pendingLessonId = null;
  return lessonId;
}
