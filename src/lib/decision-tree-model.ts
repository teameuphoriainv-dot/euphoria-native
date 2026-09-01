export type DecisionTreeOption = {
  label: string;
  next: number;
  feedback: string;
  correct: boolean;
};

export type DecisionTreeSpec = {
  scenario: string;
  decisions: {
    prompt: string;
    options: DecisionTreeOption[];
  }[];
};

/** Production 49e keeps the result on screen briefly before handing completion to the runner. */
export const DECISION_TREE_RESULT_HOLD_MS = 800;

export function isDecisionTreeTerminal(option: DecisionTreeOption, decisionCount: number): boolean {
  return option.next < 0 || option.next >= decisionCount;
}

export function decisionTreeNextLabel(option: DecisionTreeOption, decisionCount: number): string {
  return isDecisionTreeTerminal(option, decisionCount) ? 'See Results' : 'Next Decision';
}

/** A decision-tree step is correct only when every choice on the completed path was correct. */
export function decisionTreeCompletion(allCorrect: boolean, finalOption: DecisionTreeOption): boolean {
  return allCorrect && finalOption.correct;
}
