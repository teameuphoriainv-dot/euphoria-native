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
 * Who already follows you on a fresh install.
 *
 * Seeded so the "follows you" and "follow back into friends" states are reachable at all without
 * a backend. Kept short on purpose: a long list of admirers for a brand new account with no XP
 * would read as obviously fake.
 */
export const SEED_FOLLOWERS = ['priya', 'chris'];
