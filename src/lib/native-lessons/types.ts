/**
 * A hand-written, phone-first lesson that replaces one synced lesson IN THE APP ONLY.
 *
 * WHY THIS EXISTS. The wrapped loader (src/lib/curriculum/index.ts) turns every synced lesson into a
 * phone lesson by trimming and re-ordering what the web author wrote. That never invents a claim,
 * but it is bounded by the source: when the source assumes knowledge a beginner does not have, the
 * phone lesson does too. The owner's verdict on Investing Fundamentals lesson 1 (2026-10-12) was
 * that "even a plain clickthrough is more effective than what we have". A native lesson is the whole
 * lesson rewritten for the phone, and it is swapped in at the same choke point as the decks, so
 * every screen, the dev preview and saved progress agree on what the lesson is.
 *
 * Relative imports (not '@/...') so scripts/native-lesson-pin.mjs loads this under plain node.
 */
import type { ChallengeQuestion, LessonStep } from '../curriculum/types';
import type { MobileDeck } from '../mobile-lesson/types';

type QuizStep = Extract<LessonStep, { type: 'quiz' }>;
type MicroCheckStep = Extract<LessonStep, { type: 'microCheck' }>;
type KeyTermsStep = Extract<LessonStep, { type: 'keyTermsCards' }>;

/**
 * A quiz or micro check that also shows its explanation after a RIGHT answer (Why? on the check bar).
 * Synced lessons keep the web flow, where a correct quiz shows only its celebration; a native lesson
 * opts in per step, because "instant feedback that explains" means every answer gets its one-sentence
 * reason (research.json, Brilliant). Read by normalizeStep and choiceResponse in lesson-steps.ts.
 */
export type NativeChoiceStep = (QuizStep | MicroCheckStep) & { explainWhenRight?: boolean };

/**
 * A vocab step whose terms may carry `ask`: the question the vocab quiz asks for that term, a short
 * situation, instead of "Which term means: <the definition shown seconds earlier>" (VocabTerm.ask in
 * vocab-conversation.ts). The synced type is generated, so the field lives here.
 */
export type NativeVocabStep = Omit<KeyTermsStep, 'terms'> & { terms: (KeyTermsStep['terms'][number] & { ask?: string })[] };

/** A native step is an ordinary lesson step or a phone deck, the same two shapes the runner walks. */
export type NativeStep = LessonStep | NativeChoiceStep | NativeVocabStep | MobileDeck;

export interface NativeLesson {
  /** `course:num`, the same key the lesson art and the loaders use ('investing-fundamentals:1'). */
  key: `${string}:${number}`;
  /**
   * The synced lesson this one was written against.
   *
   * `fingerprint` is lessonFingerprint() of the RAW courseIndex lesson at review time. If the web
   * lesson is edited and re-synced, the fingerprint stops matching, the app falls back to the synced
   * lesson (resolveNativeLessons) and scripts/native-lesson-pin.mjs fails printing the new value.
   * A rewrite that silently kept running over a source that had moved on is the failure this
   * prevents: the same reason overrides.ts keys every deck override by a content hash.
   */
  source: { fingerprint: string; title: string; reviewedAt: string };
  num: number;
  title: string;
  /** Must equal the source lesson's xp, or the part shares and "Collect +N XP" would move. */
  xp: number;
  steps: NativeStep[];
  /** At least 4 (hasMasteryChallenge); the first 4 are asked, all feed later warmup recall. */
  challenge: ChallengeQuestion[];
}
