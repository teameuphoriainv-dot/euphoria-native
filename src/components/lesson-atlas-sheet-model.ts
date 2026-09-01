import type { AtlasLessonContext } from '@/lib/atlas-lesson-context';

export function lessonAtlasContextKey(context: AtlasLessonContext): string {
  return `${context.courseId}:${String(context.lessonNumber)}:${String(context.step.index)}`;
}

export function lessonAtlasModes(context: AtlasLessonContext): string[] {
  return [
    'Give me a hint',
    'Explain differently',
    ...(context.attempt.attempted && context.attempt.wasCorrect === false ? ['Why was I wrong?'] : []),
    'Go deeper',
  ];
}

export function lessonAtlasProactivePrompt(context: AtlasLessonContext): string | null {
  if (context.attempt.attempted && context.attempt.wasCorrect === false) {
    return 'Want to know why that one was tricky?';
  }
  if (context.step.index === 0) return 'Stuck on anything? Tap me.';
  if (context.recentMistakes.length >= 2) return 'That was a tough run. Want a hint on this one?';
  return null;
}
