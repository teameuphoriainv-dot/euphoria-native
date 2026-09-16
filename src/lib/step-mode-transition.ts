type StepLike = { type: string } | undefined;

/*
 * `mobileDeck` IS A READING STEP, and leaving it out switched this feature off for most of the app.
 *
 * withMobileDecks (curriculum/index.ts) replaces every teachingSlide and interactiveGraph with a
 * step of type 'mobileDeck' before a lesson is ever rendered. Those two were the most common
 * reading halves in the corpus, so once the conversion shipped, `shouldAnnouncePractice` returned
 * false for the majority of reading -> practice edges and the "Now quiz yourself" transition simply
 * stopped appearing. Measured: 191 of 597 eligible edges still fired; 406 did not.
 *
 * Nothing failed. A transition that does not play looks exactly like a transition that was not
 * meant to play, which is why a conversion three files away could turn a feature off in silence.
 */
const READING_STEPS = new Set([
  'hookOpener', 'stakesCard', 'teachingSlide', 'interactiveGraph', 'mobileDeck',
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
