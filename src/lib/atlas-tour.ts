/**
 * The Atlas app tour: the model.
 *
 * WHAT IT IS. Five short beats, read once, immediately after onboarding. Onboarding asks fifteen
 * questions and then hands the user five tabs they have never seen, and `/start` only ever pointed
 * at one of them. This walks the other four, in Atlas's voice, and ends back on the lesson card.
 *
 * PURE ON PURPOSE. No React, no store, no navigation: the beats, their order and the "should this
 * run" decision are data and plain functions, so scripts/atlas-tour-regression.mjs can import this
 * file under bare node and check every claim in it. src/components/atlas-tour.tsx owns nothing but
 * presentation.
 *
 * ── EVERY LINE IS A CLAIM, AND THE APP IS LIVE ───────────────────────────────────────────────
 * Atlas is the app's voice, so a tour line describing a feature this build does not have is a
 * falsehood told to every new user in their first minute. Three rules, and the regression enforces
 * the first two mechanically:
 *
 *   1. Every beat names a route that really exists under src/app/.
 *   2. Every line stays inside ATLAS_TOUR_LINE_MIN..MAX. A beat nobody reads teaches nothing, and
 *      a paragraph is not a coach mark.
 *   3. NOTHING HERE DESCRIBES OTHER PEOPLE. src/lib/people.ts says in its own header that every
 *      person in the app is fabricated, and the league screen says so out loud to the user. So the
 *      tour never mentions rivals, friends, a leaderboard or anyone to beat. The league is not a
 *      beat at all, and that is deliberate rather than an omission.
 *
 * Checked against the screens on 2026-09-14 before the copy was written:
 *   home   greeting, streak card with the week strip, the next-lesson hero, today's quests
 *   learn  a course rail over the pathway trail, drawn from the real curriculum
 *   trade  paper trading off `cash` + `positions`; simulated money, never the user's own
 *   games  a grid of mini-games, some playable, some Pro, some marked coming soon
 *
 * Digest is the one tab the tour skips. Quick is the whole point, and a daily read explains itself
 * the moment you open it; the other four each carry a rule you cannot guess from the tab label.
 */

/**
 * The tour's lifecycle, persisted as `atlasTour` on the store.
 *
 * THREE STATES, NOT A BOOLEAN, and the middle one is the load-bearing part. `unseen` is where
 * every install starts, including the ones already on the App Store: a boolean "hasSeenTour"
 * defaulting to false would have replayed this to every existing user on the next OTA, which is
 * the one group the tour is definitely not for. Only finishing onboarding arms it, so an install
 * that never runs onboarding again can never show it.
 */
export type AtlasTourState = 'unseen' | 'armed' | 'seen';

/** The store field these values live on. Named here so the regression and the store agree. */
export const ATLAS_TOUR_FIELD = 'atlasTour';
export const ATLAS_TOUR_DEFAULT: AtlasTourState = 'unseen';

/** The five tab routes, in the order src/app/(tabs)/_layout.tsx declares them. The overlay derives
 *  the tab-bar highlight from an index into this list, so a tab added there without being added
 *  here would spotlight the wrong slot. The regression compares the two. */
export const ATLAS_TOUR_TABS = ['home', 'learn', 'trade', 'digest', 'games'] as const;
export type AtlasTourTab = (typeof ATLAS_TOUR_TABS)[number];

/** The one measured anchor. Home registers its next-lesson card under this id; see TourAnchor. */
export const ATLAS_TOUR_ANCHOR_NEXT_LESSON = 'next-lesson';

/**
 * What the beat points at.
 *
 *   'tab'    the tab-bar slot for `tab`, whose rectangle is pure geometry (five equal flex
 *            children in a row) and needs no measurement
 *   'anchor' a real element that registered itself, measured in window coordinates
 */
export type AtlasTourHighlight =
  | { kind: 'tab' }
  | { kind: 'anchor'; anchor: string };

/** Deliberately a narrow subset of AtlasExpression rather than an import. This module stays free of
 *  React so plain node can load it; tsc still checks the assignment at the one call site. */
export type AtlasTourFace = 'default' | 'happy' | 'watching' | 'proud' | 'silly';

export type AtlasTourBeat = {
  id: string;
  /** Where the app must actually BE while this beat is read. Checked to exist under src/app/. */
  route: string;
  tab: AtlasTourTab;
  /** One plain sentence. Atlas speaks it; nothing else on the overlay carries copy. */
  line: string;
  face: AtlasTourFace;
  highlight: AtlasTourHighlight;
};

/** Copy bounds, enforced by the regression. The upper bound is roughly four lines in the speech
 *  bubble at the default text size, which is as much as a coach mark can hold before it stops
 *  being one. */
export const ATLAS_TOUR_LINE_MIN = 40;
export const ATLAS_TOUR_LINE_MAX = 110;

export const ATLAS_TOUR_BEATS: readonly AtlasTourBeat[] = [
  {
    id: 'home',
    route: '/(tabs)/home',
    tab: 'home',
    line: 'This is home. Your streak, today’s quests and the lesson you are up to all live here.',
    face: 'happy',
    highlight: { kind: 'tab' },
  },
  {
    id: 'learn',
    route: '/(tabs)/learn',
    tab: 'learn',
    line: 'Learn holds your whole path, and you can switch course from the rail at the top.',
    face: 'watching',
    highlight: { kind: 'tab' },
  },
  {
    id: 'trade',
    route: '/(tabs)/trade',
    tab: 'trade',
    // "virtual money" is the honest word: trade.tsx spends `cash` from the store and never touches
    // a brokerage. Do not upgrade this to anything that sounds like a real account.
    line: 'Trade is practice with virtual money, so nothing you do here costs you anything.',
    face: 'proud',
    highlight: { kind: 'tab' },
  },
  {
    id: 'games',
    route: '/(tabs)/games',
    tab: 'games',
    // No count. Four games are playable today and the rest are marked Pro or coming soon on the
    // screen itself, so a number here would be a fact with a shelf life.
    line: 'Games are quick drills on what the lessons teach, for when you want a lighter round.',
    face: 'silly',
    highlight: { kind: 'tab' },
  },
  {
    /*
     * THE LANDING. The tour must not end on whichever tab it happened to reach last, so it comes
     * back to Home and spotlights the one control that matters on day one. The card is the button
     * (see home.tsx), so "tap it" is literally the next action and the user performs it, rather
     * than the tour performing it for them.
     */
    id: 'first-lesson',
    route: '/(tabs)/home',
    tab: 'home',
    line: 'Your next lesson is the big card at the top. Tap it and I will be right there with you.',
    face: 'proud',
    highlight: { kind: 'anchor', anchor: ATLAS_TOUR_ANCHOR_NEXT_LESSON },
  },
];

/** What the gate needs to know. A plain snapshot so the decision can be tested without a store. */
export type AtlasTourGate = {
  /** zustand's persist rehydration flag. Deciding before it lands reads `unseen` off the INITIAL
   *  state rather than off disk, which would flash the tour at a user who already finished it. */
  hasHydrated: boolean;
  atlasTour: AtlasTourState;
  /** profile.completedAt. Belt and braces: nothing may arm the tour except finishing onboarding,
   *  and finishing onboarding is exactly what stamps this. */
  onboardingCompletedAt: number | null;
};

export function shouldShowAtlasTour(gate: AtlasTourGate): boolean {
  if (!gate.hasHydrated) return false;
  if (gate.onboardingCompletedAt === null) return false;
  return gate.atlasTour === 'armed';
}

/**
 * The only transition table.
 *
 * 'arm'  fires when onboarding completes, and ONLY from `unseen`. Someone who has already been
 *        shown the tour and later replays onboarding does not get it a second time.
 * 'seen' fires when the tour finishes OR is skipped. Skipping is a decision, not a deferral, which
 *        is the same rule `/start` applies to the first action it offers.
 */
export function nextAtlasTourState(current: AtlasTourState, event: 'arm' | 'seen'): AtlasTourState {
  if (event === 'seen') return 'seen';
  return current === 'unseen' ? 'armed' : current;
}

export function atlasTourBeatAt(index: number): AtlasTourBeat | null {
  return ATLAS_TOUR_BEATS[index] ?? null;
}

export function isLastAtlasTourBeat(index: number): boolean {
  return index >= ATLAS_TOUR_BEATS.length - 1;
}

/** Index of the tab slot to spotlight, or -1 when the beat points at a measured anchor instead. */
export function atlasTourTabIndex(beat: AtlasTourBeat): number {
  return ATLAS_TOUR_TABS.indexOf(beat.tab);
}

/**
 * Is the app standing on one of the five tabs right now?
 *
 * THE TOUR MUST NEVER PULL SOMEONE OUT OF A SCREEN THEY OPENED. The tab layout stays mounted
 * underneath anything pushed on top of it, so the overlay is still alive while the user is inside
 * a lesson or a digest article. Without this test, the "navigate to the beat's route" effect would
 * fire from under a pushed screen and yank them back to a tab mid-sentence.
 *
 * Accepts both spellings because expo-router's usePathname strips the group: the navigator's own
 * route is '/(tabs)/learn' and the pathname it reports is '/learn'.
 */
export function isAtlasTourPathname(pathname: string): boolean {
  const withoutGroup = pathname.replace('/(tabs)', '');
  return (ATLAS_TOUR_TABS as readonly string[]).some((tab) => withoutGroup === `/${tab}`);
}
