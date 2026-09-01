import type { ChallengeQuestion } from '@/lib/curriculum';

export const ACTIVE_CHALLENGE_QUESTIONS = 4;
export const CHALLENGE_HEARTS = 3;
export const CHALLENGE_INTRO_MS = 2_600;
export const CHALLENGE_INTRO_EXIT_MS = 420;
export const CHALLENGE_FAILURE_HOLD_MS = 1_200;
export const FREE_CHALLENGE_HINTS = 2;
export const CHALLENGE_HINT_RESET_MS = 2 * 60 * 60 * 1_000;

export type ShuffledChallengeQuestion = Omit<ChallengeQuestion, 'options' | 'correct'> & {
  options: string[];
  correct: number;
};

export function hasMasteryChallenge(questions: ChallengeQuestion[] | undefined): boolean {
  return (questions?.length ?? 0) >= ACTIVE_CHALLENGE_QUESTIONS;
}

/** Production runs only the first four questions, even when a lesson authors five. */
export function shuffleChallengeQuestions(
  questions: ChallengeQuestion[],
  random: () => number = Math.random,
): ShuffledChallengeQuestion[] {
  return questions.slice(0, ACTIVE_CHALLENGE_QUESTIONS).map((question) => {
    const indices = question.options.map((_, index) => index);
    for (let index = indices.length - 1; index > 0; index -= 1) {
      const swapWith = Math.floor(random() * (index + 1));
      [indices[index], indices[swapWith]] = [indices[swapWith], indices[index]];
    }
    return {
      ...question,
      options: indices.map((index) => question.options[index]),
      correct: indices.indexOf(question.correct),
    };
  });
}

export function gradeChallengeAnswer(
  selected: number,
  correctIndex: number,
  hearts: number,
): { correct: boolean; hearts: number; failed: boolean } {
  const correct = selected === correctIndex;
  const nextHearts = correct ? hearts : Math.max(0, hearts - 1);
  return { correct, hearts: nextHearts, failed: !correct && nextHearts === 0 };
}

export function nextChallengePhase(
  currentIndex: number,
  questionCount: number,
): 'question' | 'passed' {
  return currentIndex + 1 < questionCount ? 'question' : 'passed';
}

/** Intro + four scored questions + the passing result. Failure is an alternate branch. */
export function challengeHappyPathScreens(questions: ChallengeQuestion[] | undefined): number {
  return hasMasteryChallenge(questions) ? 1 + ACTIVE_CHALLENGE_QUESTIONS + 1 : 0;
}

/** Every finite visual state: happy path plus the alternate out-of-hearts result. Retry reuses them. */
export function challengeRuntimeStates(questions: ChallengeQuestion[] | undefined): number {
  return hasMasteryChallenge(questions) ? challengeHappyPathScreens(questions) + 1 : 0;
}

export function lessonProgressPercent({
  authoredIndex,
  authoredTotal,
  phase,
  hasChallenge,
}: {
  authoredIndex: number;
  authoredTotal: number;
  phase: 'steps' | 'challenge' | 'complete';
  hasChallenge: boolean;
}): number {
  if (phase === 'complete') return 100;
  if (phase === 'challenge') return 90;
  return ((authoredIndex + 1) / Math.max(authoredTotal, 1)) * (hasChallenge ? 80 : 100);
}
