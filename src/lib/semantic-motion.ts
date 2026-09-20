import type { Normalized } from '@/lib/lesson-steps';

/**
 * Motion is named after what changed for the learner, not after an animation primitive.
 *
 * Keeping this model pure lets the exhaustive curriculum audit import it under Node. That is the
 * important scaling property: a new authored step cannot silently fall outside the motion system,
 * while the renderer remains free to change Reanimated details without touching curriculum data.
 */
export type SemanticMotionEvent =
  | 'concept-reveal'
  | 'cause-and-effect'
  | 'practice-prompt'
  | 'answer-correct'
  | 'answer-incorrect'
  | 'mastery-increase'
  | 'lesson-complete'
  | 'node-unlock'
  | 'league-promotion'
  | 'atlas-reaction';

export type SemanticMotionPlan = {
  initialOpacity: number;
  initialTranslateY: number;
  initialScale: number;
  settle: 'immediate' | 'timing' | 'smooth-spring' | 'reward-spring';
  duration: 'instant' | 'base' | 'screen';
};

/**
 * Verdicts deliberately have an immediate plan. The measured reference behavior is a verdict at
 * full presence followed by a still reading beat; animating the banner itself delays comprehension.
 * Reward energy belongs to the correct-answer spark, mastery result, and terminal celebration.
 */
export const SEMANTIC_MOTION_PLANS: Record<SemanticMotionEvent, SemanticMotionPlan> = {
  'concept-reveal': {
    initialOpacity: 0,
    initialTranslateY: 10,
    initialScale: 1,
    settle: 'timing',
    duration: 'base',
  },
  'cause-and-effect': {
    initialOpacity: 0,
    initialTranslateY: 0,
    initialScale: 1,
    settle: 'timing',
    duration: 'base',
  },
  'practice-prompt': {
    initialOpacity: 0,
    initialTranslateY: 0,
    initialScale: 0.985,
    settle: 'smooth-spring',
    duration: 'base',
  },
  'answer-correct': {
    initialOpacity: 1,
    initialTranslateY: 0,
    initialScale: 1,
    settle: 'immediate',
    duration: 'instant',
  },
  'answer-incorrect': {
    initialOpacity: 1,
    initialTranslateY: 0,
    initialScale: 1,
    settle: 'immediate',
    duration: 'instant',
  },
  'mastery-increase': {
    initialOpacity: 0,
    initialTranslateY: 6,
    initialScale: 1,
    settle: 'timing',
    duration: 'base',
  },
  'lesson-complete': {
    initialOpacity: 0,
    initialTranslateY: 0,
    initialScale: 1,
    settle: 'timing',
    duration: 'base',
  },
  'node-unlock': {
    initialOpacity: 1,
    initialTranslateY: 4,
    initialScale: 0.94,
    settle: 'timing',
    duration: 'base',
  },
  'league-promotion': {
    initialOpacity: 0,
    initialTranslateY: 0,
    initialScale: 0.6,
    settle: 'reward-spring',
    duration: 'base',
  },
  // Atlas owns its acting channels (eyes, head, squash, hop). A wrapper transform would make the
  // character react twice and destroy the meaning of those authored poses.
  'atlas-reaction': {
    initialOpacity: 1,
    initialTranslateY: 0,
    initialScale: 1,
    settle: 'immediate',
    duration: 'instant',
  },
};

export type LessonStepMotionEvent = 'concept-reveal' | 'cause-and-effect' | 'practice-prompt';

/** Exhaustive over Normalized['kind']; TypeScript fails if a new render kind is not classified. */
export const LESSON_STEP_MOTION: Record<Normalized['kind'], LessonStepMotionEvent> = {
  prose: 'concept-reveal',
  teaching: 'concept-reveal',
  todo: 'concept-reveal',
  /*
   * A deck is the mobile substitution for a teachingSlide or an interactiveGraph, so it is the one
   * kind here whose source is genuinely mixed: measured over the corpus it is 432 slides to 289
   * graphs across 721 heavy steps, which is not a majority worth classifying by.
   *
   * It is classified as a reveal because of what the deriver does to both, not because of which
   * one is more common. deckFromTeachingSlide and deckFromInteractiveGraph emit the SAME three
   * card kinds, `idea`, `term` and `interactive`, so by the time a deck reaches this map the
   * cause-and-effect reading a graph had on web is gone from the cards themselves. What enters the
   * screen is an idea presented in sequence, which is exactly `teaching`.
   *
   * The deck spec does keep `sourceType`, so per deck motion is still available later. It would
   * need semanticMotionForLessonStep to take the step rather than its kind, which is a change to
   * the shape of this module and not something a merge should decide.
   */
  deck: 'concept-reveal',
  hook: 'cause-and-effect',
  stakes: 'cause-and-effect',
  reveal: 'cause-and-effect',
  graph: 'cause-and-effect',
  choice: 'practice-prompt',
  match: 'practice-prompt',
  dragSort: 'practice-prompt',
  order: 'practice-prompt',
  line: 'practice-prompt',
  multi: 'practice-prompt',
  trueFalse: 'practice-prompt',
  build: 'practice-prompt',
  calc: 'practice-prompt',
  tree: 'practice-prompt',
  vocab: 'practice-prompt',
  progressiveCalc: 'practice-prompt',
};

export function semanticMotionForLessonStep(kind: Normalized['kind']): LessonStepMotionEvent {
  return LESSON_STEP_MOTION[kind];
}
