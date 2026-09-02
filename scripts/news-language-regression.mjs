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

// LATIN-SCRIPT TRANSLATIONS. Measured on the live feed 2026-09-02: one GlobeNewswire release
// filled 8 of 12 slots on the Trade tab, and the Indonesian and Malay variants are Latin script,
// so no script test can reject them. The URL's language segment is what makes them detectable.
const RELEASE = '/news-release/2026/09/02';
assert.equal(
  isEnglishNewsCandidate(
    'Pacifica Hotels Menandatangani Perjanjian Waralaba dengan Marriott',
    `https://www.globenewswire.com${RELEASE}/3354818/0/id/pacifica-hotels-signs-franchise-agreement.html`,
  ),
  false,
  'an id-language URL must be rejected even though the headline is Latin script',
);
assert.equal(
  isEnglishNewsCandidate(
    'Pacifica Hotels Signs Franchise Agreement with Marriott International',
    `https://www.globenewswire.com${RELEASE}/3354817/0/en/pacifica-hotels-signs-franchise-agreement.html`,
  ),
  true,
);
// A URL with no language segment proves nothing and must not be rejected on that basis.
assert.equal(
  isEnglishNewsCandidate('Why The Trade Desk Stock Lost 24% in August', 'https://www.fool.com/investing/2026/09/02/trade-desk/'),
  true,
);

// SAME-STORY COLLAPSE keyed on the slug. The English original carried release id 3354817 while
// every translation carried 3354818, so grouping by id would keep a translation and drop the
// English article — the exact inversion this ordering guards against.
const slugged = (id, lang, releaseId) => ({
  id,
  title: lang === 'en' ? 'Pacifica Hotels Signs Franchise Agreement' : 'Pacifica Hotels Menandatangani Perjanjian',
  url: `https://www.globenewswire.com${RELEASE}/${releaseId}/0/${lang}/pacifica-hotels-signs-franchise-agreement.html`,
});
const collapsed = filterEnglishNewsCandidates([
  slugged('th', 'th', '3354818'),
  slugged('id', 'id', '3354818'),
  slugged('en', 'en', '3354817'),
  { id: 'other', title: 'Broadcom profit grows', url: 'https://www.fool.com/investing/2026/09/02/broadcom/' },
]);
assert.deepEqual(
  collapsed.map((article) => article.id),
  ['en', 'other'],
  'only the English variant of a repeated release survives, and unrelated reporting is untouched',
);

// A feed that silently drops ordinary reporting is worse than one showing a duplicate, so
// articles with no recognisable newswire slug are never collapsed against each other.
const unslugged = filterEnglishNewsCandidates([
  { id: 'a', title: 'Markets close higher', url: 'https://www.fool.com/a/' },
  { id: 'b', title: 'Markets close higher', url: 'https://www.fool.com/b/' },
]);
assert.deepEqual(unslugged.map((article) => article.id), ['a', 'b']);

console.log('news language ok — non-Latin, declared-non-English, and repeated releases are removed');
