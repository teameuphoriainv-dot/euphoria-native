/**
 * ACHIEVEMENTS — the things you EARN, as opposed to everything else in this app, which you buy.
 *
 * Before this, every cosmetic Euphoria had was purchased: hats, frames, themes, badges. Nothing in
 * the app was given for DOING something, so a 30-day streak, a finished course and a first trade
 * all ended the same way they started, with a number changing somewhere. That is the layer that
 * makes the rest of it pay off.
 *
 * PURELY DERIVED. Not one byte of new persisted state, for the same reason quests.ts is derived:
 * an achievements table in storage would need a migration, would drift from the actions that
 * actually satisfy it, and would become a second source of truth about what you have done. Every
 * predicate below reads fields the store already writes.
 *
 * A CONSEQUENCE WORTH KNOWING: because they are derived, achievements are retroactive. Someone who
 * has already read 12 guides has "Ten Guides" the moment this ships, rather than starting from
 * zero on a counter that only began today. That is the right behaviour and it is free.
 *
 * EVERY ONE CARRIES A TITLE. The badge is the picture, the title is the word, and both are earned
 * by the same act. Titles are the cheap half of identity — no art, no storage, and they say
 * something the avatar cannot.
 */
import type { PixelSprite } from './pixel';
import {
  barChart, book, bull, calculator, chartUp, checkBadge, coin, crown, diamondRing, flame,
  gem, globe, graduationCap, handshake, heart, ladder, magnifier, newspaper, rocket, seedling,
  shield, stackCash, star, stockTicker, trophy, whale,
} from './pixel';

/** The slice an achievement may read. Narrow on purpose: it is also what makes them testable. */
export type AchievementState = {
  xp: number;
  bestStreak: number;
  completedLessons: string[];
  readPosts: string[];
  inventory: string[];
  positions: Record<string, number>;
  derivativeTrades: number;
  coins: number;
  following: string[];
  followers: string[];
  watchlist: string[];
};

export type Achievement = {
  id: string;
  /** The badge's own name. */
  label: string;
  /** The word you may wear under your name once it is earned. */
  title: string;
  /** What to do, shown while it is locked. Never a riddle. */
  hint: string;
  sprite: PixelSprite;
  /** Progress toward it. `of` is the threshold, so a locked badge still shows how close you are. */
  progress: (s: AchievementState) => { at: number; of: number };
};

const count = (n: number, of: number) => ({ at: Math.min(n, of), of });
const friends = (s: AchievementState) => s.following.filter((id) => s.followers.includes(id)).length;

/** Ordered by the journey rather than by category, so the list reads as a path. */
export const ACHIEVEMENTS: Achievement[] = [
  // ── learning
  { id: 'first-lesson', label: 'First Step', title: 'Beginner', hint: 'Finish one lesson', sprite: seedling,
    progress: (s) => count(s.completedLessons.length, 1) },
  { id: 'ten-lessons', label: 'Getting Going', title: 'Student', hint: 'Finish 10 lessons', sprite: book,
    progress: (s) => count(s.completedLessons.length, 10) },
  { id: 'course-done', label: 'Course Complete', title: 'Graduate', hint: 'Finish 25 lessons, a whole course', sprite: graduationCap,
    progress: (s) => count(s.completedLessons.length, 25) },
  { id: 'fifty-lessons', label: 'Committed', title: 'Scholar', hint: 'Finish 50 lessons', sprite: checkBadge,
    progress: (s) => count(s.completedLessons.length, 50) },
  { id: 'hundred-lessons', label: 'Centurion', title: 'Centurion', hint: 'Finish 100 lessons', sprite: shield,
    progress: (s) => count(s.completedLessons.length, 100) },

  // ── streak
  { id: 'streak-3', label: 'Three in a Row', title: 'Consistent', hint: 'Reach a 3 day streak', sprite: flame,
    progress: (s) => count(s.bestStreak, 3) },
  { id: 'streak-7', label: 'Full Week', title: 'Weeklong', hint: 'Reach a 7 day streak', sprite: star,
    progress: (s) => count(s.bestStreak, 7) },
  { id: 'streak-30', label: 'A Month Straight', title: 'Relentless', hint: 'Reach a 30 day streak', sprite: crown,
    progress: (s) => count(s.bestStreak, 30) },
  { id: 'streak-100', label: 'Hundred Days', title: 'Unbroken', hint: 'Reach a 100 day streak', sprite: diamondRing,
    progress: (s) => count(s.bestStreak, 100) },

  // ── the league ladder, mirrored as badges so the tiers live on your profile too
  { id: 'xp-500', label: 'Investor', title: 'Investor', hint: 'Earn 500 XP', sprite: chartUp,
    progress: (s) => count(s.xp, 500) },
  { id: 'xp-1500', label: 'Analyst', title: 'Analyst', hint: 'Earn 1,500 XP', sprite: barChart,
    progress: (s) => count(s.xp, 1500) },
  { id: 'xp-5000', label: 'Portfolio Manager', title: 'Portfolio Manager', hint: 'Earn 5,000 XP', sprite: ladder,
    progress: (s) => count(s.xp, 5000) },
  { id: 'xp-12000', label: 'Magnate', title: 'Magnate', hint: 'Earn 12,000 XP', sprite: trophy,
    progress: (s) => count(s.xp, 12000) },

  // ── trading
  { id: 'first-trade', label: 'Opening Position', title: 'Trader', hint: 'Place one paper trade', sprite: stockTicker,
    progress: (s) => count(Object.keys(s.positions).length, 1) },
  { id: 'five-positions', label: 'Diversified', title: 'Diversified', hint: 'Hold 5 positions at once', sprite: bull,
    progress: (s) => count(Object.keys(s.positions).length, 5) },
  { id: 'first-option', label: 'Contract Signed', title: 'Strategist', hint: 'Place one options trade', sprite: calculator,
    progress: (s) => count(s.derivativeTrades, 1) },
  { id: 'watchful', label: 'Watchful', title: 'Watchful', hint: 'Watch 3 tickers', sprite: magnifier,
    progress: (s) => count(s.watchlist.length, 3) },

  // ── reading
  { id: 'first-guide', label: 'Well Begun', title: 'Reader', hint: 'Read one Digest guide', sprite: newspaper,
    progress: (s) => count(s.readPosts.length, 1) },
  { id: 'ten-guides', label: 'Ten Guides', title: 'Well Read', hint: 'Read 10 Digest guides', sprite: globe,
    progress: (s) => count(s.readPosts.length, 10) },
  { id: 'twentyfive-guides', label: 'Library Card', title: 'Bookworm', hint: 'Read 25 Digest guides', sprite: heart,
    progress: (s) => count(s.readPosts.length, 25) },

  // ── the economy
  { id: 'first-buy', label: 'First Purchase', title: 'Shopper', hint: 'Buy anything from the Shop', sprite: coin,
    progress: (s) => count(s.inventory.length, 1) },
  { id: 'collector', label: 'Collector', title: 'Collector', hint: 'Own 5 Shop items', sprite: gem,
    progress: (s) => count(s.inventory.length, 5) },
  { id: 'stacked', label: 'Stacked', title: 'Stacked', hint: 'Hold 1,000 Euphorium at once', sprite: stackCash,
    progress: (s) => count(s.coins, 1000) },
  { id: 'whale', label: 'Whale', title: 'Whale', hint: 'Hold 5,000 Euphorium at once', sprite: whale,
    progress: (s) => count(s.coins, 5000) },

  // ── social
  { id: 'first-friend', label: 'Not Alone', title: 'Friend', hint: 'Become mutuals with someone', sprite: handshake,
    progress: (s) => count(friends(s), 1) },
  { id: 'crew', label: 'A Crew', title: 'Connected', hint: 'Become mutuals with 3 people', sprite: rocket,
    progress: (s) => count(friends(s), 3) },
];

export const isEarned = (a: Achievement, s: AchievementState): boolean => {
  const p = a.progress(s);
  return p.at >= p.of;
};

export const earnedAchievements = (s: AchievementState): Achievement[] =>
  ACHIEVEMENTS.filter((a) => isEarned(a, s));

export const achievementById = (id: string): Achievement | undefined =>
  ACHIEVEMENTS.find((a) => a.id === id);

if (typeof __DEV__ !== 'undefined' && __DEV__) {
  const empty: AchievementState = {
    xp: 0, bestStreak: 0, completedLessons: [], readPosts: [], inventory: [],
    positions: {}, derivativeTrades: 0, coins: 0, following: [], followers: [], watchlist: [],
  };
  // A brand new account must have earned NOTHING. A predicate that is true at zero would hand out
  // a badge for opening the app, which devalues every other badge on the screen.
  const wrong = earnedAchievements(empty);
  if (wrong.length) console.error(`[achievements] a fresh account earned: ${wrong.map((a) => a.id).join(', ')}`);
  // Progress must never exceed its own threshold, or a bar renders past full.
  const big: AchievementState = { ...empty, xp: 99_999, bestStreak: 999, coins: 99_999 };
  for (const a of ACHIEVEMENTS) {
    const p = a.progress(big);
    if (p.at > p.of) console.error(`[achievements] ${a.id} reports ${p.at}/${p.of}`);
  }
}
