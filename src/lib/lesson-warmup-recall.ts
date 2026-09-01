import { loadCourseLessons, type ChallengeQuestion } from './curriculum/index.ts';

export interface RecallQuestion {
  question: string;
  options: string[];
  correct: number;
  fromLesson: number;
  fromTitle: string;
}

const MAX_QUESTIONS = 2;

function pickIndices(count: number, take: number, seed: number): number[] {
  if (count <= take) return Array.from({ length: count }, (_, index) => index);
  const chosen: number[] = [];
  let state = seed * 9301 + 49297;
  while (chosen.length < take) {
    state = (state * 9301 + 49297) % 233280;
    const index = Math.floor((state / 233280) * count);
    if (!chosen.includes(index)) chosen.push(index);
  }
  return chosen;
}

export function completedLessonNumbers(courseId: string, completedLessonIds: string[]): number[] {
  const prefix = `${courseId}:`;
  return completedLessonIds
    .filter((id) => id.startsWith(prefix))
    .map((id) => Number(id.slice(prefix.length)))
    .filter((number) => Number.isInteger(number) && number > 0);
}

export async function buildRecallQuiz(
  courseId: string,
  currentLesson: number,
  completed: number[],
): Promise<RecallQuestion[]> {
  const earlier = completed.filter((number) => number < currentLesson).sort((a, b) => a - b);
  if (!earlier.length) return [];

  let lessons: { num: number; title: string; challenge?: ChallengeQuestion[] }[];
  try {
    lessons = await loadCourseLessons(courseId);
  } catch {
    return [];
  }

  const pool: RecallQuestion[] = [];
  for (const number of earlier.slice(-4).reverse()) {
    const lesson = lessons.find((candidate) => candidate.num === number);
    if (!lesson?.challenge?.length) continue;
    for (const question of lesson.challenge) {
      if (!question?.question || !question.options?.length) continue;
      if (!(question.correct >= 0 && question.correct < question.options.length)) continue;
      pool.push({
        question: question.question,
        options: question.options,
        correct: question.correct,
        fromLesson: lesson.num,
        fromTitle: lesson.title,
      });
    }
  }

  return pickIndices(pool.length, MAX_QUESTIONS, currentLesson).map((index) => pool[index]);
}
