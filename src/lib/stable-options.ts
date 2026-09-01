/** A deterministic Fisher-Yates shuffle shared verbatim with the canonical web app. */
export function stableOptions(options: string[], correctIndex: number) {
  const indices = options.map((_, index) => index);
  let state = 2166136261;
  const seed = `${options.join('\u241f')}#${String(correctIndex)}`;
  for (let index = 0; index < seed.length; index += 1) {
    state ^= seed.charCodeAt(index);
    state = Math.imul(state, 16777619) >>> 0;
  }
  const random = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
  for (let index = indices.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [indices[index], indices[swap]] = [indices[swap], indices[index]];
  }
  return {
    options: indices.map((index) => options[index]),
    correct: indices.indexOf(correctIndex),
    // Consumers with option-specific authored metadata need the same permutation. Returning the
    // source positions avoids trying to recover identity from labels, which need not be unique.
    sourceIndices: indices,
  };
}
