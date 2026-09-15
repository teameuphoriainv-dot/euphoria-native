/**
 * A stable name for one authored step, used to hang hand-written mobile copy off it.
 *
 * THE PROBLEM THIS SOLVES. `src/lib/curriculum/**` is regenerated wholesale by
 * `scripts/sync-curriculum.sh` every time the web repo changes. Any override table keyed only by
 * position -- "course 3, lesson 12, step 7" -- keeps matching after a re-sync even when the web
 * author has replaced that step with a different one. The hand-written mobile card would then sit
 * on top of content it no longer describes, and nothing would report it. That is the silent-wrong
 * failure this repo keeps designing against, so the id carries a content fingerprint as well as a
 * position.
 *
 * If the authored content changes, the id changes, the override stops matching, and the deck falls
 * back to the derived cards. Wrong-but-confident degrades to plain-but-correct, never the reverse.
 * `scripts/mobile-override-audit.mjs` reports overrides whose step has moved so they can be redone.
 */
import type { LessonStep } from '@/lib/curriculum';

/** Field separator inside a fingerprint. Any character no author would type would do. */
const UNIT = '';
/** Group separator, one level up from UNIT. */
const GROUP = '';

/**
 * FNV-1a, 32-bit, rendered as 8 hex characters.
 *
 * Not a cryptographic hash and does not need to be: the job is to notice that an author edited a
 * paragraph, not to resist an attacker. Written out rather than imported so this module stays pure
 * and `node --import ./scripts/ts-resolve-hooks.mjs` can load it with no dependencies, which is how
 * every audit script in this repo runs.
 */
function fnv1a(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    // The classic 16777619 multiply, decomposed into shifts so it stays exact in 32 bits.
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/**
 * The authored text that defines a step, in a fixed order.
 *
 * Only fields a human WROTE are included. Presentation fields are deliberately left out so that
 * restyling a diagram does not invalidate perfectly good hand-written copy about what the diagram
 * means.
 */
function fingerprintSource(step: LessonStep): string {
  const s = step as Record<string, any>;
  const parts: string[] = [String(s.type ?? '')];
  if (typeof s.title === 'string') parts.push(s.title);
  if (typeof s.sectionLabel === 'string') parts.push(s.sectionLabel);
  if (typeof s.description === 'string') parts.push(s.description);
  if (Array.isArray(s.paragraphs)) parts.push(s.paragraphs.join(UNIT));
  if (Array.isArray(s.insights)) parts.push(s.insights.join(UNIT));
  if (Array.isArray(s.highlightedTerms)) {
    parts.push(s.highlightedTerms.map((t: any) => `${t?.term ?? ''}=${t?.definition ?? ''}`).join(UNIT));
  }
  return parts.join(GROUP);
}

/** `courseId:lessonNum:stepIndex:fingerprint`, for example `personal-finance:3:7:1a2b3c4d`. */
export function stepId(courseId: string, lessonNum: number, stepIndex: number, step: LessonStep): string {
  return `${courseId}:${lessonNum}:${stepIndex}:${fnv1a(fingerprintSource(step))}`;
}

/** The position part, without the fingerprint. Used by the audit to say "this step moved". */
export function stepIdPosition(id: string): string {
  return id.split(':').slice(0, 3).join(':');
}
