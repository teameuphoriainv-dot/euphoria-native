/**
 * Onboarding profile → a recommended LEARNING PATH.
 *
 * Deliberately a pure function with no React and no store import, so the mapping can be
 * reasoned about and checked directly.
 *
 * REGULATORY NOTE — do not "improve" this into portfolio advice. The publisher's exclusion
 * to the Investment Advisers Act (§202(a)(11)(D); Lowe v. SEC, 472 U.S. 181) only covers
 * advice that is NOT personally tailored to an individual client. Sequencing educational
 * courses is fine. Recommending securities or an allocation based on a user's stated risk
 * tolerance is personalized investment advice and forfeits that exclusion.
 */
import { COURSES, getCourseById, getCoursesByTier } from './curriculum/courseIndex';
import type { CourseMeta, TierLevel } from './curriculum/types';

export type Experience = 'beginner' | 'basics' | 'experienced';
export type Goal = 'wealth' | 'learn' | 'trade' | 'economy';
/** Reaction to a hypothetical 20% drawdown — a behavioural signal, not a risk score. */
export type RiskComfort = 'sell' | 'wait' | 'buy';

export type Profile = {
  experience: Experience | null;
  goal: Goal | null;
  topics: string[];
  horizon: string | null;
  riskComfort: RiskComfort | null;
  dailyMinutes: number | null;
  blockers: string[];
  ageBand: string | null;
  source: string | null;
  notifyOptIn: boolean;
  /** Explicit, revocable consent for pseudonymous PostHog product analytics. Default off. */
  analyticsOptIn: boolean;
  /** Epoch ms. Non-null means the user reached the end of the flow. */
  completedAt: number | null;
  /** Identity, captured at sign-up. Null until then.
   *
   *  These exist because a follow graph needs someone to follow BACK: without a name and handle
   *  another learner would be following a nameless "Level 1". auth.tsx used to collect an email
   *  and discard it on the next line, so persisting these is as much a bug fix as a feature. */
  name: string | null;
  handle: string | null;
  email: string | null;
  /** Which provider proved this identity, and that provider's stable id for the user.
   *
   *  `authProvider: null` means the account was created with the email form, which proves nothing —
   *  it is a local profile, not a verified identity. Apple and Google DO prove it, and `authId` is
   *  the id to key that user on (Apple's `user`, Google's `user.id`). Never an email: Apple hands
   *  out per-app relay addresses that can be turned off, so an email is not a stable identity.
   *
   *  Persisted with the rest of the profile, so a verified sign-in survives a relaunch — which
   *  matters more than usual for Apple, whose name/email come back exactly once ever. */
  authProvider: 'apple' | 'google' | null;
  authId: string | null;
  /** Epoch ms the guided first action was taken OR skipped. A STAMP rather than inferring from
   *  readPosts, so skipping is permanent: inferring would hand the screen back on every sign-in,
   *  and would treat someone who reads their first guide months later as brand new. */
  firstRunDoneAt: number | null;
};

export const EMPTY_PROFILE: Profile = {
  experience: null,
  goal: null,
  topics: [],
  horizon: null,
  riskComfort: null,
  dailyMinutes: null,
  blockers: [],
  ageBand: null,
  source: null,
  notifyOptIn: false,
  analyticsOptIn: false,
  completedAt: null,
  name: null,
  handle: null,
  email: null,
  authProvider: null,
  authId: null,
  firstRunDoneAt: null,
};

const TIER_BY_EXPERIENCE: Record<Experience, TierLevel> = {
  beginner: 'easy',
  basics: 'intermediate',
  experienced: 'advanced',
};

/** Seed sequence per goal. Every id here must exist in COURSES — guarded by resolve() below. */
const SEED_BY_GOAL: Record<Goal, string[]> = {
  wealth: ['personal-finance', 'investing-fundamentals', 'wealth-management'],
  learn: ['investing-fundamentals', 'personal-finance', 'global-economics'],
  trade: ['investing-fundamentals', 'behavioral-finance', 'risk-management'],
  economy: ['global-economics', 'corporate-finance', 'financial-analytics'],
};

/** Topic chips (step 3) → the course that actually teaches them. */
export const COURSE_BY_TOPIC: Record<string, string> = {
  stocks: 'investing-fundamentals',
  budgeting: 'personal-finance',
  economy: 'global-economics',
  valuation: 'corporate-finance',
  psychology: 'behavioral-finance',
  risk: 'risk-management',
  crypto: 'alternative-investments',
  retirement: 'wealth-management',
  accounting: 'applied-accounting',
  quant: 'quantitative-analysis',
  business: 'business-strategy',
};

export const PATH_LENGTH = 3;

/** Average minutes per lesson. Drives reveal pacing copy AND the Home daily-goal ring, so the
 *  two screens can never disagree about what "2 lessons a day" means in minutes. */
export const MINUTES_PER_LESSON = 5;

/** A chosen course plus the ANSWER that earned it its slot. */
export type PathPick = { course: CourseMeta; reason: string };

/** Human-readable label for each topic chip, for reason copy. */
const TOPIC_LABEL: Record<string, string> = {
  stocks: 'stocks & ETFs',
  budgeting: 'budgeting & debt',
  economy: 'the economy',
  valuation: 'valuing companies',
  psychology: 'investing psychology',
  risk: 'risk & hedging',
  crypto: 'crypto & alternatives',
  retirement: 'retirement & taxes',
  business: 'startups & business',
};

const GOAL_REASON: Record<Goal, string> = {
  wealth: 'You want to grow long-term wealth',
  learn: 'You want to learn how investing works',
  trade: 'You want to trade with confidence',
  economy: 'You want to make sense of the economy',
};

/**
 * The ranked candidate list — the actual reasoning, in priority order.
 *
 * Every push records WHICH answer earned the slot, so the reveal screen can show its working
 * instead of presenting three courses as if they fell out of the sky. Order IS the ranking:
 * the first unique, real course ids win.
 *
 * `blockers` and `horizon` were collected by onboarding and then ignored entirely by this
 * function — two questions asked for nothing. They are read here.
 *
 * Kept to EDUCATIONAL sequencing only, per the regulatory note at the top of this file: these
 * reasons explain why a COURSE is next, never what to do with money.
 */
function candidates(p: Profile): { id: string; reason: string }[] {
  const out: { id: string; reason: string }[] = [];
  const add = (id: string, reason: string) => out.push({ id, reason });

  // 1. Behaviour beats content. Someone who sells into a drawdown gets that material first
  //    regardless of goal — it is the single most useful thing for them.
  if (p.riskComfort === 'sell') add('behavioral-finance', 'You said a 20% drop would make you sell');

  // 2. Stated obstacles. A blocker is the thing the user believes is stopping them, so it
  //    outranks a general goal: clearing it is what makes the rest reachable.
  if (p.blockers.includes('fear')) add('risk-management', 'You said losing money holds you back');
  if (p.blockers.includes('trust')) add('behavioral-finance', 'You said you do not know who to trust');
  if (p.blockers.includes('jargon')) add('investing-fundamentals', 'You said the jargon is overwhelming');
  if (p.blockers.includes('start')) add('investing-fundamentals', 'You said you do not know where to start');

  // 3. Timing. Someone already invested needs risk material sooner than someone still deciding;
  //    someone unsure benefits from money basics before market mechanics.
  if (p.horizon === 'now') add('risk-management', 'You have already started investing');
  if (p.horizon === 'unsure') add('personal-finance', 'You are not sure when you will start');

  // 4. Goal seeds the spine of the path.
  const goal = p.goal ?? 'learn';
  for (const id of SEED_BY_GOAL[goal]) add(id, GOAL_REASON[goal]);

  // 5. Explicit topic picks.
  for (const t of p.topics) {
    const id = COURSE_BY_TOPIC[t];
    if (id) add(id, `You picked ${TOPIC_LABEL[t] ?? t}`);
  }

  // 6. Pad from the experience-matched tier, then anything, so PATH_LENGTH is always reached.
  const tier = p.experience ? TIER_BY_EXPERIENCE[p.experience] : 'easy';
  const tierWord = tier === 'easy' ? 'beginner' : tier === 'intermediate' ? 'intermediate' : 'advanced';
  for (const c of getCoursesByTier(tier)) add(c.id, `Matched to your ${tierWord} level`);
  for (const c of COURSES) add(c.id, 'Rounds out your path');

  return out;
}

/**
 * Build the recommended path WITH the reason for each pick. ALWAYS returns exactly PATH_LENGTH
 * real courses, even for a completely empty profile — the reveal screen must never be empty.
 */
export function recommendPathDetailed(p: Profile): PathPick[] {
  const seen = new Set<string>();
  const out: PathPick[] = [];
  for (const { id, reason } of candidates(p)) {
    if (seen.has(id)) continue; // first mention wins, so the highest-priority reason is kept
    seen.add(id);
    const course = getCourseById(id);
    if (course) out.push({ course, reason });
    if (out.length === PATH_LENGTH) break;
  }
  return out;
}

/** Courses only. Kept so existing callers (the store's active course) are unaffected. */
export function recommendPath(p: Profile): CourseMeta[] {
  return recommendPathDetailed(p).map((x) => x.course);
}

/** Lessons per day implied by the chosen daily commitment. At least 1. */
export function lessonsPerDay(dailyMinutes: number | null): number {
  return Math.max(1, Math.round((dailyMinutes ?? 10) / MINUTES_PER_LESSON));
}

/** Rough weeks to finish the recommended path, for the reveal screen's pacing line. */
export function estimateWeeks(p: Profile, path: CourseMeta[]): number {
  const lessons = path.reduce((n, c) => n + c.totalLessons, 0);
  return Math.max(1, Math.ceil(lessons / lessonsPerDay(p.dailyMinutes) / 7));
}

// The failure mode here is SILENT and total: a recommender that quietly returns the same three
// courses for everybody still renders a perfectly nice screen. These assert that answers
// actually move the result, and that the padding never leaves the reveal screen short.
if (__DEV__) {
  const P = (over: Partial<Profile>): Profile => ({ ...EMPTY_PROFILE, ...over });
  const ids = (p: Profile) => recommendPath(p).map((c) => c.id);
  const bad = (what: string) => console.error(`[path] ${what}`);

  if (recommendPath(EMPTY_PROFILE).length !== PATH_LENGTH) bad('an empty profile must still fill the path');
  if (ids(P({ riskComfort: 'sell' }))[0] !== 'behavioral-finance') bad('a panic-seller should lead with behavioural finance');
  if (!ids(P({ blockers: ['fear'] })).includes('risk-management')) bad('the fear blocker should pull in risk management');
  if (!ids(P({ horizon: 'now' })).includes('risk-management')) bad('an already-investing user should get risk management');

  // The whole point: different people get different paths.
  if (String(ids(P({ goal: 'economy' }))) === String(ids(P({ goal: 'wealth' })))) bad('goals must produce different paths');

  // Every pick must be able to explain itself, or the reveal screen renders a blank reason.
  if (recommendPathDetailed(P({ goal: 'trade' })).some((x) => !x.reason)) bad('every pick needs a reason');
}
