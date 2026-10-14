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
  /**
   * Optional (native lessons only): the question asked for this term, a short situation such as
   * "Which word fits? The same snack costs more this year than last year." Without it the question
   * is "Which term means: <definition>", word for word what was taught seconds earlier, which tests
   * matching a phrase rather than the idea. Synced web lessons never set it, so web parity holds.
   */
  ask?: string;
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

  const askOrder = seededOrder(terms.length, 7).slice(0, Math.min(MAX_QUESTIONS, terms.length));
  // A native lesson (every asked term carries `ask`) also gets plain lines in place of the web's idioms
  // ("get the vocabulary down", "the vocabulary handled"); synced lessons keep the web's words exactly.
  const situations = terms.length >= 3 && askOrder.every((termIndex) => !!terms[termIndex].ask);
  const beats: AtlasConversationBeat[] = [
    {
      kind: 'say',
      expression: 'happy',
      text: situations
        ? `Let's learn the new words. There are ${terms.length} in this lesson. I'll teach each one, then quiz you.`
        : `Right, let's get the vocabulary down. There are ${terms.length} terms in this lesson. I'll teach you each one first, then I'll test you on them.`,
      cta: 'Teach me',
    },
  ];

  for (const term of terms) {
    beats.push({ kind: 'teach', term: term.term, text: term.definition, aside: term.example });
  }

  if (terms.length >= 3) {
    // Only when every question is a situation does the lead-in say so; otherwise it is the web's line.
    beats.push({
      kind: 'say',
      expression: 'whoa',
      text: situations
        ? "Your turn. I'll describe something, you tell me which word fits."
        : "Your turn. I'll give you the meaning, you tell me which term it is.",
      cta: "Let's go",
    });

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
        text: answer.ask ?? `Which term means: ${answer.definition}`,
        options: shuffled,
        correct: shuffled.indexOf(answer.term),
        onWrong: `It's ${answer.term}. ${answer.sentence}`,
      });
    });
  }

  beats.push({
    kind: 'say',
    expression: 'happy',
    text: situations
      ? "That's all the new words. You'll see them again in later lessons."
      : "That's the vocabulary handled. You'll see these terms again for the rest of the course.",
    cta: 'Done',
  });

  return beats;
}
