type StepLike = { type: string } | undefined;

const READING_STEPS = new Set([
  'hookOpener', 'stakesCard', 'teachingSlide', 'interactiveGraph',
  'keyTermsCards', 'concept', 'timeline', 'explorable', 'canvas',
]);

const PRACTICE_STEPS = new Set([
  'microCheck', 'fillBlank', 'quiz', 'dragSort', 'scenario', 'slider',
  'trueFalse', 'match', 'matchingPairs', 'buildIt', 'progressiveCalc',
  'calculator', 'sorting', 'budgetBuilder', 'decisionTree', 'scenarioSim',
  'visualInteractive', 'tapReveal',
]);

/** Production announces only the reading → practice edge. */
export function shouldAnnouncePractice(from: StepLike, to: StepLike): boolean {
  if (!from || !to) return false;
  return READING_STEPS.has(from.type) && PRACTICE_STEPS.has(to.type);
}
