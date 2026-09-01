import assert from 'node:assert/strict';

import {
  lessonAtlasContextKey,
  lessonAtlasModes,
  lessonAtlasProactivePrompt,
} from '../src/components/lesson-atlas-sheet-model.ts';

const context = {
  courseId: 'investing-fundamentals',
  lessonTitle: 'Introduction to Investing',
  lessonNumber: 1,
  step: { index: 4, total: 17, type: 'microCheck', visible: { prompt: 'Question' } },
  attempt: { attempted: false },
  progress: { stepsDone: 4, correctSoFar: 2 },
  recentMistakes: [],
};

assert.equal(
  lessonAtlasContextKey(context),
  'investing-fundamentals:1:4',
  'the sheet conversation must be scoped to the exact runtime lesson step',
);
assert.deepEqual(
  lessonAtlasModes(context),
  ['Give me a hint', 'Explain differently', 'Go deeper'],
  'Socratic starters must remain available before an attempt',
);
assert.deepEqual(
  lessonAtlasModes({ ...context, attempt: { attempted: true, wasCorrect: false } }),
  ['Give me a hint', 'Explain differently', 'Why was I wrong?', 'Go deeper'],
  'a wrong attempt must add the grounded mistake starter without replacing the persistent modes',
);
assert.equal(
  lessonAtlasProactivePrompt({ ...context, step: { ...context.step, index: 0 } }),
  'Stuck on anything? Tap me.',
  'the first step must use the canonical proactive prompt',
);
assert.equal(
  lessonAtlasProactivePrompt({ ...context, attempt: { attempted: true, wasCorrect: false } }),
  'Want to know why that one was tricky?',
  'wrong-answer help must take priority over generic prompting',
);
assert.equal(
  lessonAtlasProactivePrompt({ ...context, recentMistakes: ['a', 'b'] }),
  'That was a tough run. Want a hint on this one?',
  'a repeated-mistake run must offer the canonical contextual hint',
);
assert.equal(
  lessonAtlasProactivePrompt({ ...context, step: { ...context.step, index: 7 } }),
  null,
  'Atlas must stay quiet when no proactive condition applies',
);

console.log('atlas lesson sheet regression: PASS');
