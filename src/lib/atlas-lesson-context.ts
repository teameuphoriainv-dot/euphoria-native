import { choiceFeedback, type Normalized } from './lesson-steps';

export type AtlasStepSnapshot = {
  index: number;
  total: number;
  type: string;
  visible: Record<string, unknown>;
  options?: string[];
  revealed?: { correctIndex?: number; correctText?: string; explanation?: string };
  controls?: { label: string; value: number; unit?: string }[];
};

export type AtlasLessonContext = {
  courseId: string;
  lessonTitle: string;
  lessonNumber: number;
  step: AtlasStepSnapshot;
  attempt: { attempted: boolean; wasCorrect?: boolean; chosen?: string };
  progress: { stepsDone: number; correctSoFar: number };
  recentMistakes: string[];
};

/** Fields whose presence before an attempt could reveal the authored answer. */
export const ANSWER_FIELDS = new Set([
  'a',
  'answer',
  'correct',
  'correctIndex',
  'correctText',
  'consequence',
  'explanation',
  'explanationCorrect',
  'explanationWrong',
  'feedbackByOption',
  'outcome',
  'right',
  'score',
  'target',
  'wrong',
]);

function safeVisible(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(safeVisible);
  if (value && typeof value === 'object') {
    const clean: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (ANSWER_FIELDS.has(key) || typeof child === 'function' || child === undefined) continue;
      clean[key] = safeVisible(child);
    }
    return clean;
  }
  return value;
}

/**
 * Project the screen the learner can currently see, not the wider authored step. In particular,
 * multiple-choice options come from the normalized runtime step because native deterministically
 * reorders them. Atlas therefore discusses the same option order as the learner.
 */
export function buildAtlasLessonContext(args: {
  courseId: string;
  lessonTitle: string;
  lessonNumber: number;
  step: unknown;
  normalized: unknown;
  stepIndex: number;
  total: number;
  attempted: boolean;
  wasCorrect?: boolean;
  chosen?: string;
  chosenIndex?: number;
  correctSoFar: number;
  recentMistakes: string[];
  graphControls?: { label: string; value: number; unit?: string }[];
}): AtlasLessonContext {
  const raw = (args.step ?? {}) as Record<string, unknown>;
  const normalized = (args.normalized ?? {}) as Record<string, unknown>;
  const kind = String(normalized.kind ?? raw.type ?? 'unknown');
  let visible: Record<string, unknown>;

  if (kind === 'choice') {
    visible = { prompt: normalized.prompt };
  } else if (kind === 'prose' || kind === 'todo') {
    visible = {
      label: normalized.label,
      title: normalized.title,
      blocks: normalized.blocks,
    };
  } else {
    visible = {
      title: normalized.title,
      spec: normalized.spec,
    };
  }

  const snapshot: AtlasStepSnapshot = {
    index: args.stepIndex,
    total: args.total,
    type: String(raw.type ?? kind),
    visible: safeVisible(visible) as Record<string, unknown>,
  };

  const options = Array.isArray(normalized.options) ? normalized.options.map(String) : undefined;
  if (options) snapshot.options = options;
  if (args.graphControls?.length) {
    snapshot.controls = args.graphControls.map((control) => ({
      label: control.label.slice(0, 120),
      value: control.value,
      ...(control.unit ? { unit: control.unit.slice(0, 20) } : {}),
    }));
  }

  if (args.attempted) {
    const revealed: NonNullable<AtlasStepSnapshot['revealed']> = {};
    if (kind === 'choice' && typeof normalized.correct === 'number') {
      revealed.correctIndex = normalized.correct;
      revealed.correctText = options?.[normalized.correct];
      const explanation = args.wasCorrect === undefined
        ? undefined
        : typeof args.chosenIndex === 'number'
          ? choiceFeedback(normalized as Extract<Normalized, { kind: 'choice' }>, args.chosenIndex)
          : args.wasCorrect ? normalized.right : normalized.wrong;
      if (typeof explanation === 'string' && explanation.trim()) revealed.explanation = explanation;
    }
    if (Object.keys(revealed).length) snapshot.revealed = revealed;
  }

  return {
    courseId: args.courseId,
    lessonTitle: args.lessonTitle,
    lessonNumber: args.lessonNumber,
    step: snapshot,
    attempt: {
      attempted: args.attempted,
      ...(args.wasCorrect === undefined ? {} : { wasCorrect: args.wasCorrect }),
      ...(args.chosen ? { chosen: args.chosen } : {}),
    },
    progress: { stepsDone: args.stepIndex, correctSoFar: args.correctSoFar },
    recentMistakes: args.recentMistakes.slice(-3),
  };
}
