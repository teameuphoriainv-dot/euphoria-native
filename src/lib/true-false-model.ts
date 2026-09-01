export type TrueFalseStatement = { s: string; a: boolean; explanation?: string };
export type TrueFalseSpec = { statements: TrueFalseStatement[] };
export type TrueFalsePhase = 'question' | 'explanation' | 'transition' | 'complete';
export type TrueFalseState = {
  index: number;
  score: number;
  phase: TrueFalsePhase;
  answeredIndex: number | null;
  lastCorrect: boolean | null;
};

export function createTrueFalseState(): TrueFalseState {
  return { index: 0, score: 0, phase: 'question', answeredIndex: null, lastCorrect: null };
}

/** Reject stale and duplicate taps by preserving object identity. */
export function answerTrueFalse(
  state: TrueFalseState,
  statements: TrueFalseStatement[],
  event: { visibleIndex: number; value: boolean },
): TrueFalseState {
  if (state.phase !== 'question' || event.visibleIndex !== state.index) return state;
  const statement = statements[state.index];
  if (!statement) return state;
  const correct = event.value === statement.a;
  return {
    ...state,
    score: state.score + (correct ? 1 : 0),
    phase: 'explanation',
    answeredIndex: state.index,
    lastCorrect: correct,
  };
}

export function advanceTrueFalse(state: TrueFalseState, statementCount: number): TrueFalseState {
  if (state.phase !== 'explanation') return state;
  if (state.index + 1 >= statementCount) return { ...state, phase: 'complete' };
  return {
    ...state,
    index: state.index + 1,
    phase: 'transition',
    answeredIndex: null,
    lastCorrect: null,
  };
}

export function finishTrueFalseTransition(state: TrueFalseState, visibleIndex: number): TrueFalseState {
  if (state.phase !== 'transition' || visibleIndex !== state.index) return state;
  return { ...state, phase: 'question' };
}

export function canAnswerTrueFalse(state: TrueFalseState): boolean {
  return state.phase === 'question';
}

export function didPassTrueFalse(state: TrueFalseState, statementCount: number): boolean {
  return state.score >= Math.ceil(statementCount / 2);
}

/** Web parity: correct answers need no second card; wrong answers get only authored reasoning. */
export function trueFalseFeedback(
  statement: TrueFalseStatement,
  wasCorrect: boolean,
): { showCorrection: boolean; answer?: string; reason?: string } {
  if (wasCorrect) return { showCorrection: false };
  const reason = statement.explanation?.trim();
  return {
    showCorrection: true,
    answer: `It's ${statement.a ? 'true' : 'false'}.`,
    ...(reason ? { reason } : {}),
  };
}
