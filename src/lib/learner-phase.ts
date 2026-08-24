/**
 * WHERE THIS LEARNER ACTUALLY IS — the single answer, derived, never stored.
 *
 * The owner's ask: "make it so that it's going to be adaptive to the person's current state at
 * their learning phase."
 *
 * The problem it fixes is real and was measurable in the code. term-match.tsx opened with
 * `const defs = useMemo(() => shuffle(PAIRS), [])` over five hardcoded pairs — a brand-new user
 * and someone thirty lessons deep were handed byte-for-byte the same five terms. A review game
 * that cannot tell those two apart is not reviewing anything.
 *
 * DERIVED, NOT PERSISTED, for the same reason quests.ts is: a stored "level" would need a
 * migration and would drift from the lessons that actually earned it. `completedLessons` is
 * already the truth, already persisted, already the thing the learner sees.
 *
 * WHY NOT THE CURRICULUM'S OWN TERMS. `highlightedTerms` looked like the obvious source, and it
 * is not: exactly ONE of the twelve courses carries them (corporateFinance, 40 terms) and the
 * other eleven have none, so drawing from them would adapt only for a single course and silently
 * fall back to nothing everywhere else. The course files are also auto-synced from the web repo
 * and cannot be topped up from here. Hence the iOS-owned bank in term-bank.ts.
 */
import type { AppState } from './store';

/** Exactly what phase is derived from — so a widening here is a compile error, not a silent bug. */
export type PhaseState = Pick<AppState, 'completedLessons'>;

export type Phase = 'new' | 'learning' | 'practised' | 'fluent';

/**
 * Lessons completed at which each phase begins.
 *
 * Chosen against the shape of the curriculum rather than picked for roundness: a course is 25
 * lessons, so 3 is "past the intro of one course", 12 is "about half a course", 30 is "more than
 * a full course finished". A learner crosses into `learning` on their third lesson, which is
 * early on purpose — the game getting slightly harder is the reward for coming back.
 */
export const PHASE_FLOOR: Record<Phase, number> = { new: 0, learning: 3, practised: 12, fluent: 30 };

const ORDER: Phase[] = ['new', 'learning', 'practised', 'fluent'];

export function phaseOf(s: PhaseState): Phase {
  const n = s.completedLessons.length;
  // Walk down so the HIGHEST satisfied floor wins; walking up would stop at 'new' every time.
  for (let i = ORDER.length - 1; i >= 0; i--) {
    if (n >= PHASE_FLOOR[ORDER[i]]) return ORDER[i];
  }
  return 'new';
}

/** 0..3. Callers that scale something linearly want this rather than a switch over the union. */
export const phaseIndex = (p: Phase): number => ORDER.indexOf(p);

/**
 * Course ids the learner has finished at least one lesson in.
 *
 * `lessonKey` is `${courseId}:${num}`, so the id is everything before the LAST colon — sliced that
 * way rather than `split(':')[0]` so a course id containing a colon could never silently truncate.
 */
export function startedCourses(s: PhaseState): string[] {
  const out = new Set<string>();
  for (const k of s.completedLessons) {
    const i = k.lastIndexOf(':');
    if (i > 0) out.add(k.slice(0, i));
  }
  return [...out];
}

/**
 * Which course difficulty bands this learner should be quizzed from.
 *
 * A `new` learner is asked only easy-course terms — being shown "carried interest" before your
 * third lesson is not a challenge, it is a wall, and it teaches the player that the game is
 * unfair rather than that they have more to learn. `fluent` draws from everything.
 */
export function tiersFor(p: Phase): ('easy' | 'intermediate' | 'advanced')[] {
  if (p === 'new') return ['easy'];
  if (p === 'learning') return ['easy'];
  if (p === 'practised') return ['easy', 'intermediate'];
  return ['easy', 'intermediate', 'advanced'];
}

if (__DEV__) {
  const at = (n: number): PhaseState => ({ completedLessons: Array.from({ length: n }, (_, i) => `personal-finance:${String(i)}`) });
  if (phaseOf(at(0)) !== 'new') console.error('[phase] 0 lessons must be new');
  if (phaseOf(at(2)) !== 'new') console.error('[phase] 2 lessons must still be new');
  if (phaseOf(at(3)) !== 'learning') console.error('[phase] 3 lessons must be learning');
  if (phaseOf(at(29)) !== 'practised') console.error('[phase] 29 lessons must be practised');
  if (phaseOf(at(30)) !== 'fluent') console.error('[phase] 30 lessons must be fluent');
  // Monotonic: more work must never move you DOWN a phase.
  let prev = -1;
  for (let n = 0; n <= 60; n++) {
    const i = phaseIndex(phaseOf(at(n)));
    if (i < prev) { console.error(`[phase] went backwards at ${String(n)} lessons`); break; }
    prev = i;
  }
  const mixed = { completedLessons: ['personal-finance:1', 'personal-finance:2', 'global-economics:4'] };
  const cs = startedCourses(mixed).sort();
  if (cs.join() !== 'global-economics,personal-finance') console.error('[phase] startedCourses is wrong', cs);
}
