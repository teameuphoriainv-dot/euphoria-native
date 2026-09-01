/**
 * Pure, deterministic vocabulary-conversation model shared by the lesson renderer and its
 * regression check. This is the native translation of production web commit 49e9149's
 * `vocabConversation.ts`: every sentence comes from the authored key-term step, and a lesson
 * always produces the same questions and option order.
 */

export type AtlasConversationExpression = 'default' | 'watching' | 'happy' | 'whoa' | 'silly';

export type AtlasConversationBeat =
  | { kind: 'say'; text: string; expression?: AtlasConversationExpression; cta?: string }
  | { kind: 'teach'; term: string; text: string; aside?: string }
  | { kind: 'ask'; text: string; options: string[]; correct: number; onWrong?: string };

export type VocabTerm = {
  term: string;
  definition: string;
  example: string;
  sentence: string;
};

function seededOrder(n: number, seed: number): number[] {
  const indices = Array.from({ length: n }, (_, index) => index);
  let state = seed * 9301 + 49297;
  for (let index = n - 1; index > 0; index -= 1) {
    state = (state * 9301 + 49297) % 233280;
    const swapIndex = Math.floor((state / 233280) * (index + 1));
    [indices[index], indices[swapIndex]] = [indices[swapIndex], indices[index]];
  }
  return indices;
}

const MAX_QUESTIONS = 4;
const CHOICES = 4;

export function buildVocabConversation(terms: VocabTerm[]): AtlasConversationBeat[] {
  if (!terms.length) return [];

  const beats: AtlasConversationBeat[] = [
    {
      kind: 'say',
      expression: 'happy',
      text: `Right, let's get the vocabulary down. There are ${terms.length} terms in this lesson. I'll teach you each one first, then I'll test you on them.`,
      cta: 'Teach me',
    },
  ];

  for (const term of terms) {
    beats.push({ kind: 'teach', term: term.term, text: term.definition, aside: term.example });
  }

  if (terms.length >= 3) {
    beats.push({
      kind: 'say',
      expression: 'whoa',
      text: "Your turn. I'll give you the meaning, you tell me which term it is.",
      cta: "Let's go",
    });

    const askOrder = seededOrder(terms.length, 7).slice(0, Math.min(MAX_QUESTIONS, terms.length));
    askOrder.forEach((termIndex, questionIndex) => {
      const answer = terms[termIndex];
      const distractors = seededOrder(terms.length, termIndex + 13)
        .filter((index) => index !== termIndex)
        .slice(0, CHOICES - 1)
        .map((index) => terms[index].term);

      const options = [answer.term, ...distractors];
      const shuffled = seededOrder(options.length, questionIndex + 31).map((index) => options[index]);
      beats.push({
        kind: 'ask',
        text: `Which term means: ${answer.definition}`,
        options: shuffled,
        correct: shuffled.indexOf(answer.term),
        onWrong: `It's ${answer.term}. ${answer.sentence}`,
      });
    });
  }

  beats.push({
    kind: 'say',
    expression: 'happy',
    text: "That's the vocabulary handled. You'll see these terms again for the rest of the course.",
    cta: 'Done',
  });

  return beats;
}
