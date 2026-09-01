#!/usr/bin/env node
/** Exact Trade-idea destinations must stay attached to lessons that teach the concept. */
import assert from 'node:assert/strict';

globalThis.__DEV__ = false;

const { tradeIdeaRoute, tradeIdeas } = await import('../src/lib/trade-ideas.ts');
const { loadCourseLessons } = await import('../src/lib/curriculum/courseIndex.ts');

const price = 1184;
const cases = [
  tradeIdeas({ cash: 10_000, positions: {}, watchlist: [], total: 10_000 }, 9),
  tradeIdeas({ cash: 0, positions: { NVDA: 1 }, watchlist: [], total: price }, 9),
  tradeIdeas({ cash: 10_000, positions: { NVDA: 1 }, watchlist: [], total: 10_000 + price }, 9),
  tradeIdeas({ cash: 0, positions: { NVDA: 1 }, watchlist: ['AAPL', 'MSFT'], total: price }, 9),
].flat();

const unique = [...new Map(cases.map((idea) => [idea.id, idea])).values()];
assert.deepEqual(
  unique.map(({ id, courseId, lessonNumber }) => ({ id, courseId, lessonNumber })),
  [
    { id: 'first-position', courseId: 'investing-fundamentals', lessonNumber: 1 },
    { id: 'concentration', courseId: 'investing-fundamentals', lessonNumber: 5 },
    { id: 'few-names', courseId: 'investing-fundamentals', lessonNumber: 5 },
    { id: 'no-buffer', courseId: 'personal-finance', lessonNumber: 4 },
    { id: 'cash-drag', courseId: 'behavioral-finance', lessonNumber: 13 },
    { id: 'watchlist-idle', courseId: 'behavioral-finance', lessonNumber: 13 },
  ],
);

const expectedTitles = new Map([
  ['investing-fundamentals:1', 'Introduction to Investing'],
  ['investing-fundamentals:5', 'Diversification'],
  ['personal-finance:4', 'Building an Emergency Fund'],
  ['behavioral-finance:13', 'Regret Aversion & Decision Paralysis'],
]);

for (const idea of unique) {
  assert.deepEqual(tradeIdeaRoute(idea), {
    pathname: '/lesson',
    params: { course: idea.courseId, num: String(idea.lessonNumber) },
  });
  const lessons = await loadCourseLessons(idea.courseId, 'adult');
  const lesson = lessons.find((candidate) => candidate.num === idea.lessonNumber);
  assert.equal(
    lesson?.title,
    expectedTitles.get(`${idea.courseId}:${idea.lessonNumber}`),
    `${idea.id} must point to the audited lesson, not merely an existing number`,
  );
}

console.log(`trade-idea routing ok — ${unique.length} rules resolve to 4 audited lessons`);
