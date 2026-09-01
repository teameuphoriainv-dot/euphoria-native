export type DragSortSide = 'left' | 'right';

export type DragSortSpec = {
  prompt: string;
  /** Authored in the correct final order. */
  items: string[];
};

export type DragSortRound = {
  left: string;
  right: string;
  correct: DragSortSide;
};

export type DragSortState = {
  index: number;
  picked: DragSortSide | null;
  score: number;
  done: boolean;
};

/**
 * Exact production-web round construction.
 *
 * Ordering is taught through the genuinely close calls: every adjacent pair in the authored
 * correct order becomes one round. The deterministic prompt-seeded shuffle keeps reopening a
 * screen from moving the question under the learner, while flipping pairs stops the correct
 * answer from always appearing on the same side.
 */
export function dragSortRounds(spec: DragSortSpec): DragSortRound[] {
  const seedBase = spec.prompt.length + spec.items.length;
  let seed = seedBase * 9301 + 49297;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const pairs = spec.items.slice(0, -1).map((first, index) => ({
    first,
    second: spec.items[index + 1],
  }));

  for (let index = pairs.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [pairs[index], pairs[target]] = [pairs[target], pairs[index]];
  }

  return pairs.map((pair) => random() < 0.5
    ? { left: pair.first, right: pair.second, correct: 'left' as const }
    : { left: pair.second, right: pair.first, correct: 'right' as const });
}

export const createDragSortState = (): DragSortState => ({
  index: 0,
  picked: null,
  score: 0,
  done: false,
});

export function answerDragSort(
  state: DragSortState,
  rounds: DragSortRound[],
  side: DragSortSide,
): DragSortState {
  const round = rounds[state.index];
  if (state.done || state.picked !== null || !round) return state;
  return {
    ...state,
    picked: side,
    score: state.score + (side === round.correct ? 1 : 0),
  };
}

export function advanceDragSort(state: DragSortState, roundCount: number): DragSortState {
  if (state.done || state.picked === null) return state;
  if (state.index + 1 < roundCount) return { ...state, index: state.index + 1, picked: null };
  return { ...state, done: true };
}

export const passedDragSort = (score: number, roundCount: number) =>
  roundCount > 0 && score >= Math.ceil(roundCount / 2);
