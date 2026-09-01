#!/usr/bin/env node
/** Providers do not expose language metadata; reject headlines that are definitively non-English. */
import assert from 'node:assert/strict';
import { filterEnglishNewsCandidates, isEnglishNewsCandidate } from '../src/lib/news-language.ts';

assert.equal(isEnglishNewsCandidate('Fed signals another rate cut as inflation cools'), true);
assert.equal(isEnglishNewsCandidate('市场上涨，科技股领涨'), false);
assert.equal(isEnglishNewsCandidate('Рынок акций вырос после решения банка'), false);
assert.equal(isEnglishNewsCandidate('الأسواق ترتفع بعد قرار البنك'), false);
assert.equal(isEnglishNewsCandidate(''), false);

const articles = filterEnglishNewsCandidates([
  { id: 'en', title: 'Stocks rally after earnings' },
  { id: 'zh', title: '美股今日上涨' },
  { id: 'blank', title: '   ' },
]);
assert.deepEqual(articles.map((article) => article.id), ['en']);

console.log('news language ok — non-Latin and empty headlines are removed provider-independently');
