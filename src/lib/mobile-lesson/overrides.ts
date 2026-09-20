/**
 * Hand-written mobile decks, for steps where the derived one is not good enough.
 *
 * WHY THIS EXISTS. `derive.ts` covers all 721 heavy steps by picking and trimming sentences the
 * curriculum author wrote. That is honest and it never invents a claim, but it is bounded by the
 * source: when the shortest TRUE complete sentence an author wrote is 120 characters, the derived
 * card is 120 characters. Measured over the corpus, 185 of the 721 steps land over the card budget
 * for exactly that reason, and those 185 are the queue this table exists to work through.
 *
 * HOW TO ADD ONE. Run `node --import ./scripts/ts-resolve-hooks.mjs scripts/mobile-deck-audit.mjs
 * --over-budget` to print the worst offenders with their step ids and their current derived cards.
 * Write a better deck, key it by that id, done. An override replaces the WHOLE deck, not one card,
 * because a deck is a sequence and rewriting one beat of it in isolation is how a deck stops
 * reading as one thing.
 *
 * WHY THE KEY HAS A HASH IN IT. `sourceId` is `course:lesson:index:fingerprint` where the
 * fingerprint covers the authored text. `src/lib/curriculum/**` is regenerated wholesale from the
 * web repo by `scripts/sync-curriculum.sh`, so a key that was only positional would keep matching
 * after a re-sync replaced the step, and a hand-written card would end up describing content that
 * had changed underneath it. With the fingerprint in the key the override simply stops matching and
 * the deck reverts to derived. `scripts/mobile-deck-audit.mjs --stale` lists overrides whose step
 * has moved, so the work is recoverable rather than silently lost.
 *
 * THE RULE FOR WRITING ONE. Everything written here is a claim being made to a paying learner, so
 * it must be supported by the step it replaces. Shorten, simplify, re-order. Do not add a fact that
 * is not in the source, and do not round a number the author was precise about.
 */
import type { MobileDeck } from './types';

/** A deck with its `sourceId` filled in at lookup time, so the key is not repeated in the value. */
export type DeckOverride = Omit<MobileDeck, 'sourceId'>;

/**
 * Empty on purpose.
 *
 * The derived output ships first so all 300 lessons are covered on day one, and this table fills in
 * against real reading. Seeding it with speculative rewrites before anyone has read a derived deck
 * on a phone would be guessing at which cards are actually bad.
 */
export const MOBILE_COPY: Readonly<Record<string, DeckOverride>> = {};

export function overrideFor(sourceId: string): DeckOverride | undefined {
  return MOBILE_COPY[sourceId];
}

/** Every key in the table, for the audit to check against the live corpus. */
export function overrideKeys(): string[] {
  return Object.keys(MOBILE_COPY);
}
