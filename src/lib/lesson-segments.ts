// LESSON SEGMENTS: splitting one lesson into Learn / Vocab / Practice parts.
//
// The owner's rule, relayed verbatim: "First part is learn section, next is like the vocab and
// then the last part is the other stuff". This module is that rule and nothing else.
//
// NAMING. "part" is already taken in this repo: src/lib/mobile-lesson/parts/ holds the lesson card
// widgets and four `part-*` pins match on it. A second meaning for the same word in the same
// runner is how a grep stops being trustworthy, so the code says SEGMENT and only the on-screen
// copy says "Part 1 of 3".
//
// WHY THIS TAKES STEP TYPES AND NOT A LESSON. The boundaries are then a function of exactly the
// same input as `lessonShapeSignature` (lesson-step-session.ts), which is the runtime type
// sequence. A resume pointer that passes that shape check therefore always means the same
// segment boundaries. Hand this a lesson object instead and the two could drift: the pointer
// would be accepted while the segment it lands in had moved underneath it, and nobody would
// report it. It also keeps the module free of React, the store and the curriculum, so the pin can
// import it under `node --import ./scripts/ts-resolve-hooks.mjs`.
//
// NUMBERING. Everything here is in `lesson.tsx`'s runtime screen numbering: idx 0 is the warmup,
// screens 1..total are `expandSteps(lesson.steps)`, total+1 is DONE and total+2 is STREAK. So
// screen i corresponds to stepTypes[i - 1]. Nothing in here invents a new index.

export type SegmentKind = 'learn' | 'vocab' | 'practice';

/**
 * One part of a lesson. `first`..`last` are runtime screen idx, inclusive, 1-based.
 *
 * A challenge-only practice has `first = total + 1`, `last = total` (zero screens) and
 * `challenge = true`: 16 lessons in the corpus end on their vocab or their last reading screen and
 * carry the mastery challenge as their whole practice. Representing that as an empty range rather
 * than dropping it is what keeps "the challenge belongs to the last segment" true for every
 * lesson, so the XP share and the progress bar do not need a special case each.
 */
export type LessonSegment = { kind: SegmentKind; first: number; last: number; challenge: boolean };

export type SegmentEntry = { segment: number; screen: number; challengeIntro: boolean };

export type SegmentRecord = { done: SegmentKind[]; xpPaid: number; minutesPaid: number };

/**
 * Screens that are reading, used only when a lesson has no `keyTermsCards` to split on.
 *
 * Measured over the 300 lesson corpus on 22 Sep 2026: the first non-reading step is
 * `keyTermsCards` in 180 lessons, then fillBlank 82, trueFalse 9, quiz 6, calculator 3,
 * tapReveal 2, and scenario / dragSort / match once each. `calculator` is deliberately listed as
 * NOT reading, and it costs nothing either way: every lesson that contains a calculator step also
 * contains a keyTermsCards, so those three never reach this branch. `teachingSlide` and
 * `interactiveGraph` are in the set even though the native loader replaces both with `mobileDeck`,
 * because dropping them would make the split depend on `withMobileDecks` having run.
 */
const READING_STEP_TYPES: ReadonlySet<string> = new Set([
  'hookOpener',
  'stakesCard',
  'mobileDeck',
  'microCheck',
  'teachingSlide',
  'interactiveGraph',
  'concept',
  'explorable',
  'simProse',
]);

/** Learn 2 : Vocab 1 : Practice 3. Section 3a of the design; the owner approved the weights. */
const SEGMENT_WEIGHT: Record<SegmentKind, number> = { learn: 2, vocab: 1, practice: 3 };

function hasScreens(segment: LessonSegment): boolean {
  return segment.last >= segment.first;
}

/**
 * The split.
 *
 * ```
 * k = index of 'keyTermsCards' (no lesson has two)
 * k >= 0:  Learn = screens 1..k      Vocab = screen k+1     Practice = k+2..n
 * k <  0:  p = first non-reading step; Learn = 1..p         Practice = p+1..n
 * ```
 *
 * A practice with no screens survives only when the mastery challenge carries it. A practice with
 * no screens and no challenge is dropped, and so is a learn with no screens (a lesson that opened
 * on its vocab). Neither happens in the corpus and `lesson-segments-pin.mjs` asserts that, but
 * they are handled rather than thrown on, because the corpus is regenerated wholesale by
 * sync-curriculum.sh and a crash in the runner is a worse way to learn that than a short lesson.
 */
export function segmentsOf(stepTypes: readonly string[], hasChallenge: boolean): LessonSegment[] {
  const types: readonly string[] = Array.isArray(stepTypes) ? stepTypes : [];
  const n = types.length;
  const k = types.indexOf('keyTermsCards');

  let out: LessonSegment[];
  if (k >= 0) {
    out = [
      { kind: 'learn', first: 1, last: k, challenge: false },
      { kind: 'vocab', first: k + 1, last: k + 1, challenge: false },
      { kind: 'practice', first: k + 2, last: n, challenge: false },
    ];
  } else {
    let p = types.findIndex((t) => !READING_STEP_TYPES.has(t));
    if (p < 0) p = n;
    out = [
      { kind: 'learn', first: 1, last: p, challenge: false },
      { kind: 'practice', first: p + 1, last: n, challenge: false },
    ];
  }

  out = out.filter((s) => hasScreens(s) || (s.kind === 'practice' && hasChallenge));
  // The challenge always belongs to the last segment. Marking it here rather than passing
  // hasChallenge around is what lets segmentedProgress reserve the tail of the final bar without
  // taking a second argument that a caller could forget.
  const lastSegment = out[out.length - 1];
  if (lastSegment && hasChallenge) lastSegment.challenge = true;
  return out;
}

function round5(n: number): number {
  return Math.round(n / 5) * 5;
}

/**
 * How a lesson's XP divides across its segments. **The result always sums to `xp` exactly.**
 *
 * That exactness is load bearing: the final part pays `xp - xpPaid`, so a split that summed to
 * less would quietly delete XP from every lesson and one that summed to more would pay it twice.
 * Only the non-final shares are rounded; the last one is the remainder.
 *
 * Every share has a floor of 5, because a one-screen vocab part rounding to 0 would show a
 * "+0 XP" chip. The floor is then clamped against what is left, so a lesson worth less than its
 * floors cannot drive the final share negative and make `Math.max(0, xp - xpPaid)` pay nothing.
 * Corpus XP runs 25 to 60 in steps of 5, so nothing clamps today and no share is below 5.
 */
export function segmentXpShares(xp: number, kinds: readonly SegmentKind[]): number[] {
  const list: readonly SegmentKind[] = Array.isArray(kinds) ? kinds : [];
  if (list.length === 0) return [];
  const total = Number.isFinite(xp) && xp > 0 ? Math.round(xp) : 0;
  const weightSum = list.reduce((sum, kind) => sum + (SEGMENT_WEIGHT[kind] ?? 1), 0);

  const shares: number[] = [];
  let used = 0;
  for (let i = 0; i < list.length - 1; i += 1) {
    const raw = weightSum > 0 ? (total * (SEGMENT_WEIGHT[list[i]] ?? 1)) / weightSum : 0;
    const share = Math.min(Math.max(5, round5(raw)), Math.max(0, total - used));
    shares.push(share);
    used += share;
  }
  shares.push(Math.max(0, total - used));
  return shares;
}

/**
 * Which segment a screen sits in. idx 0 (the warmup) answers 0, the first segment.
 *
 * Positional only, and that is a real limit: while the mastery challenge is running `idx` is still
 * `total`, so a lesson whose practice is challenge-only answers with the segment before it. Any
 * caller that draws state during the challenge must treat the final segment as current, which is
 * what `segmentedProgress` does with its `phase` argument.
 */
export function segmentIndexAt(segs: readonly LessonSegment[], idx: number): number {
  if (!Array.isArray(segs) || segs.length === 0) return 0;
  if (!Number.isFinite(idx) || idx <= 0) return 0;
  let found = 0;
  for (let i = 0; i < segs.length; i += 1) {
    if (segs[i].first <= idx) found = i;
  }
  return found;
}

/**
 * The segment `k` whose last screen is `idx`, when `k` is NOT the final segment. Otherwise null.
 *
 * This is the whole trigger for the part card. It deliberately answers null on the final segment:
 * that end falls through to the existing challenge, DONE and STREAK path in lesson.tsx, which pays
 * the lesson out and is pinned byte for byte by mastery-challenge-parity-regression.
 */
export function segmentEndingAt(segs: readonly LessonSegment[], idx: number): number | null {
  if (!Array.isArray(segs) || segs.length < 2) return null;
  if (!Number.isInteger(idx) || idx < 1) return null;
  for (let i = 0; i < segs.length - 1; i += 1) {
    if (hasScreens(segs[i]) && segs[i].last === idx) return i;
  }
  return null;
}

/** `idx` is the last screen of a non-final segment, so the part card is about to appear. */
export function isSegmentBoundary(segs: readonly LessonSegment[], idx: number): boolean {
  return segmentEndingAt(segs, idx) !== null;
}

/**
 * Where a not-yet-completed lesson opens.
 *
 * `done` is by KIND, never by position, because a curriculum sync can add or remove a lesson's
 * vocab and every position after it would then shift onto different content.
 *
 * In order:
 *   - `j` is the first segment whose kind is not done.
 *   - A pointer inside `j` wins, so mid-part resume keeps working exactly as it does today.
 *   - Otherwise `j` = 0 opens at screen 0, the warmup, which is what a fresh lesson does now.
 *   - Otherwise open at `segs[j].first`. Segments after the first never show the warmup or the
 *     AtlasIntro gate, both of which only fire at idx 0.
 *   - A challenge-only segment has no first screen to open, so it opens the challenge intro on
 *     screen `total`, which is `segs[j].last`.
 */
export function segmentEntry(
  segs: readonly LessonSegment[],
  done: readonly SegmentKind[],
  pointerScreen: number,
): SegmentEntry {
  if (!Array.isArray(segs) || segs.length === 0) {
    return { segment: 0, screen: 0, challengeIntro: false };
  }
  const finished = new Set(Array.isArray(done) ? done : []);
  let j = segs.findIndex((s) => !finished.has(s.kind));
  // Every kind done but the lesson not complete cannot happen: the final part IS completion. If a
  // record is ever that malformed, the last segment is the safe answer, because replaying it pays
  // nothing (the store dedupes on kind) while resetting to 0 would lose the learner's place.
  if (j < 0) j = segs.length - 1;

  const pointer = Number.isInteger(pointerScreen) && pointerScreen > 0 ? pointerScreen : 0;
  const target = segs[j];
  if (pointer >= target.first && pointer <= target.last) {
    return { segment: j, screen: pointer, challengeIntro: false };
  }
  if (!hasScreens(target)) return { segment: j, screen: target.last, challengeIntro: true };
  if (j === 0) return { segment: 0, screen: 0, challengeIntro: false };
  return { segment: j, screen: target.first, challengeIntro: false };
}

/**
 * Segments that finished entirely before a legacy (pre-segments) resume pointer.
 *
 * Used once per lesson, at open, to backfill someone who was mid-lesson when this shipped. The
 * learner is ON screen `pointerScreen`, so only screens below it were seen and a segment counts
 * as done when its last screen is strictly below the pointer. It can never return the final
 * segment's kind, because that segment ends at `total` and a pointer is never above `total`, so
 * the backfill cannot make a lesson look finished and skip its payout.
 *
 * It pays nothing. The final part then pays `lesson.xp - 0`, the whole lesson, so nothing is lost.
 */
export function legacyDoneKinds(segs: readonly LessonSegment[], pointerScreen: number): SegmentKind[] {
  if (!Array.isArray(segs)) return [];
  if (!Number.isInteger(pointerScreen) || pointerScreen < 1) return [];
  return segs.filter((s) => hasScreens(s) && s.last < pointerScreen).map((s) => s.kind);
}

/**
 * Fill of each bar segment, 0..1.
 *
 * Mirrors `lessonProgressPercent` (mastery-challenge-model.ts) one segment at a time: a lesson
 * with a challenge stops its final bar at 0.8 while the screens run and shows 0.9 during the
 * challenge, so the bar still has somewhere to go when the questions start. Filling to 1 and then
 * sitting there through four questions is the version this avoids.
 */
export function segmentedProgress(
  segs: readonly LessonSegment[],
  idx: number,
  phase: string,
): number[] {
  if (!Array.isArray(segs) || segs.length === 0) return [];
  if (phase === 'complete') return segs.map(() => 1);

  const current = phase === 'challenge' ? segs.length - 1 : segmentIndexAt(segs, idx);
  return segs.map((s, i) => {
    if (i < current) return 1;
    if (i > current) return 0;
    if (phase === 'challenge') return 0.9;
    const size = s.last - s.first + 1;
    if (size <= 0) return 0;
    const seen = Number.isFinite(idx) ? idx - s.first + 1 : 0;
    const ratio = Math.min(1, Math.max(0, seen / size));
    return ratio * (s.challenge ? 0.8 : 1);
  });
}

const SEGMENT_KINDS: readonly SegmentKind[] = ['learn', 'vocab', 'practice'];

function isSegmentKind(value: unknown): value is SegmentKind {
  return typeof value === 'string' && (SEGMENT_KINDS as readonly string[]).includes(value);
}

function safeNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
}

/**
 * Read a persisted per-lesson segment record into a shape nothing downstream has to check again.
 *
 * Persisted state is untrusted input at a system boundary: zustand persist shallow merges an old
 * install's missing field, a half-written record survives a force quit, and a future sync can
 * retire a kind this build has never heard of. Every one of those degrades to "nothing done",
 * which costs at most one replayed part, instead of throwing inside the render that reads it.
 */
export function readSegmentRecord(raw: unknown): SegmentRecord {
  const record = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  const rawDone = Array.isArray(record.done) ? record.done : [];
  const done: SegmentKind[] = [];
  for (const kind of rawDone) {
    if (isSegmentKind(kind) && !done.includes(kind)) done.push(kind);
  }
  return { done, xpPaid: safeNumber(record.xpPaid), minutesPaid: safeNumber(record.minutesPaid) };
}
