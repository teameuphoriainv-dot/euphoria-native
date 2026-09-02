/**
 * Alpha Vantage NEWS_SENTIMENT and Polygon reference news expose no language field, so English
 * has to be established from what the article itself carries.
 *
 * MEASURED 2026-09-02 against the live feed: 8 of 12 articles were ONE GlobeNewswire press
 * release (Pacifica Hotels / Marriott) repeated in th, ms, ja, id, ko and two Chinese variants
 * alongside the English original. The Trade tab therefore showed a wall of the same story in
 * scripts the product cannot present. Two independent signals are needed, because neither
 * catches the whole set:
 *
 *   - The GlobeNewswire URL carries an explicit language segment:
 *       /news-release/2026/09/02/3354818/0/th/pacifica-hotels-...
 *     That rejects th, ms, ja, id and ko, INCLUDING the Latin-script Indonesian and Malay
 *     headlines a script test can never catch.
 *   - The script test still does the work for articles whose URL has no language segment; the
 *     two Chinese variants in that sample were exactly that case.
 *
 * Release id is deliberately NOT the dedupe key on its own: the English original was 3354817
 * while every translation was 3354818, so grouping by id would have kept a translation and
 * dropped the English article.
 */
const NON_ENGLISH_SCRIPT =
  /[Ͱ-ϿЀ-ԯ֐-ࣿऀ-࿿ᄀ-ᇿ぀-ヿ㐀-鿿가-힯]/u;

/** `/news-release/<yyyy>/<mm>/<dd>/<releaseId>/<seq>/<lang>/<slug>` */
const NEWSWIRE_LANG = /\/news-release\/\d{4}\/\d{2}\/\d{2}\/\d+\/\d+\/([a-z]{2})\//;

type NewsLike = { title?: unknown; url?: unknown };

/**
 * A URL that declares a language other than English. Absence of the segment proves nothing, so
 * an unmatched URL is never rejected here — the script test is what covers those.
 */
function declaresNonEnglish(url: unknown): boolean {
  const match = typeof url === 'string' ? NEWSWIRE_LANG.exec(url) : null;
  return match !== null && match[1] !== 'en';
}

export function isEnglishNewsCandidate(title: unknown, url?: unknown): boolean {
  const text = typeof title === 'string' ? title.trim() : '';
  if (!/[A-Za-z]/.test(text) || NON_ENGLISH_SCRIPT.test(text)) return false;
  return !declaresNonEnglish(url);
}

/**
 * Language filter plus a same-story collapse.
 *
 * The collapse is by SLUG, not by release id or title: every translation of the Pacifica release
 * shares the slug `pacifica-hotels-signs-franchise-agreement-...` while ids and titles differ.
 * Articles without a recognisable newswire slug are always kept — a feed that silently drops
 * ordinary reporting is a worse failure than one that shows a duplicate.
 */
export function filterEnglishNewsCandidates<T extends NewsLike>(articles: T[]): T[] {
  const seenSlugs = new Set<string>();
  const out: T[] = [];
  for (const article of articles) {
    if (!isEnglishNewsCandidate(article.title, article.url)) continue;
    const url = typeof article.url === 'string' ? article.url : '';
    const slug = /\/news-release\/[^?#]*?\/([a-z0-9-]{12,})\/?(?:[?#]|$)/.exec(url)?.[1] ?? '';
    if (slug) {
      if (seenSlugs.has(slug)) continue;
      seenSlugs.add(slug);
    }
    out.push(article);
  }
  return out;
}
