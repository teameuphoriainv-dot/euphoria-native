/**
 * The other learners.
 *
 * ⚠️ EVERY PERSON IN THIS FILE IS FABRICATED. There is no backend, no accounts, and no real
 * users: these are invented names with invented scores. Nothing user-facing may present them as
 * real people. They exist so the league has a field and the friends directory has someone to
 * follow, and they get deleted the day accounts are real.
 *
 * ONE population, deliberately. The league and the friends directory both read this list, so
 * adding Maya as a friend and then racing Maya in your league is coherent. Two separate invented
 * populations would eventually contradict each other in front of a user.
 *
 * `weeklyXp` values are tuned to what a real week produces at the current award rates (lesson 50,
 * guide 25, game 20, daily goal 50), so the promotion zone is reachable. They were previously
 * lifetime-scale, which made the weekly board unwinnable: a new user sat below every rival
 * forever. Do not raise them back without re-checking that a real week can still place.
 */
export type Person = {
  id: string;
  name: string;
  handle: string;
  /** Avatar tint. Each is visually distinct so rows are scannable without reading names. */
  color: string;
  /** XP earned this league week. Drives standings. */
  weeklyXp: number;
  /** Lifetime XP. Drives which tier crest shows next to them. */
  xp: number;
  streak: number;
};

export const PEOPLE: Person[] = [
  { id: 'maya', name: 'Maya R.', handle: 'mayar', color: '#F59E0B', weeklyXp: 520, xp: 9400, streak: 64 },
  { id: 'devin', name: 'Devin K.', handle: 'devink', color: '#38BDF8', weeklyXp: 430, xp: 6100, streak: 31 },
  { id: 'priya', name: 'Priya S.', handle: 'priyas', color: '#34D399', weeklyXp: 365, xp: 5200, streak: 22 },
  { id: 'jordan', name: 'Jordan L.', handle: 'jordanl', color: '#F472B6', weeklyXp: 300, xp: 3400, streak: 18 },
  { id: 'sam', name: 'Sam T.', handle: 'samt', color: '#FBBF24', weeklyXp: 245, xp: 2800, streak: 12 },
  { id: 'alex', name: 'Alex P.', handle: 'alexp', color: '#818CF8', weeklyXp: 190, xp: 1900, streak: 9 },
  { id: 'chris', name: 'Chris M.', handle: 'chrism', color: '#2DD4BF', weeklyXp: 145, xp: 1550, streak: 6 },
  { id: 'robin', name: 'Robin H.', handle: 'robinh', color: '#FB7185', weeklyXp: 95, xp: 800, streak: 4 },
  { id: 'casey', name: 'Casey W.', handle: 'caseyw', color: '#A3E635', weeklyXp: 40, xp: 260, streak: 2 },
];

export const personById = (id: string): Person | undefined => PEOPLE.find((p) => p.id === id);

/**
 * Who already follows you on a fresh install. NOBODY.
 *
 * EMPTIED 2026-08-22, owner's decision — "change the fake friends to only having real friends".
 * Reported: "suggested friends (e.g., 'Priya S,' 'Chris M') appear to be bots, not real users."
 *
 * This used to seed `['priya', 'chris']`, and that was the one genuine falsehood on the screen.
 * A tinted row in DISCOVER is an unlabelled placeholder; "Priya S. follows you" is a claim about a
 * relationship, made to a user on their first launch, about a person who does not exist. This
 * file's own header already forbade it — "nothing user-facing may present them as real people".
 *
 * WHAT THIS COSTS, stated rather than discovered later: `followers` is the only input to the
 * 'follows-you' and 'friends' relationships, and `follow()` in store.ts appends only to
 * `following` — nothing ever writes `followers`. So both states are now unreachable until accounts
 * are real, YOUR FRIENDS is permanently empty, and FOLLOWS YOU never renders. That is the correct
 * behaviour for an app with no accounts: the friends list can now only ever contain real mutuals.
 */
export const SEED_FOLLOWERS: string[] = [];
