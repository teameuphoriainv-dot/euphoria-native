/**
 * Alpha Vantage NEWS_SENTIMENT and Polygon reference news expose no language field. This is not a
 * guessed language detector: it only rejects headlines that are definitively written in a script
 * the English-only product cannot present, plus empty/non-word titles. Latin-script languages
 * remain possible and are called out as a provider limitation in the audit.
 */
const NON_ENGLISH_SCRIPT =
  /[\u0370-\u03ff\u0400-\u052f\u0590-\u08ff\u0900-\u0fff\u1100-\u11ff\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/u;

export function isEnglishNewsCandidate(title: unknown): boolean {
  const text = typeof title === 'string' ? title.trim() : '';
  return /[A-Za-z]/.test(text) && !NON_ENGLISH_SCRIPT.test(text);
}

export function filterEnglishNewsCandidates<T extends { title: unknown }>(articles: T[]): T[] {
  return articles.filter((article) => isEnglishNewsCandidate(article.title));
}
