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
  completedAt: null,
  name: null,
  handle: null,
  email: null,
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

/**
 * Build the recommended path. ALWAYS returns exactly PATH_LENGTH real courses, even for a
 * completely empty profile — the reveal screen must never render an empty state.
 */
export function recommendPath(p: Profile): CourseMeta[] {
  const tier = p.experience ? TIER_BY_EXPERIENCE[p.experience] : 'easy';
  const ids: string[] = [];

  // 1. A panic-seller gets the behavioural material first regardless of goal — the single
  //    most useful thing for someone who sells into a drawdown.
  if (p.riskComfort === 'sell') ids.push('behavioral-finance');

  // 2. Goal seeds the spine of the path.
  ids.push(...SEED_BY_GOAL[p.goal ?? 'learn']);

  // 3. Explicit topic picks come next, so stated interest beats inferred interest.
  for (const t of p.topics) {
    const id = COURSE_BY_TOPIC[t];
    if (id) ids.push(id);
  }

  // 4. Pad from the experience-matched tier, then anything, so we always reach PATH_LENGTH.
  ids.push(...getCoursesByTier(tier).map((c) => c.id));
  ids.push(...COURSES.map((c) => c.id));

  return resolve(ids);
}

/** Dedupe, drop ids that aren't real courses, and take the first PATH_LENGTH. */
function resolve(ids: string[]): CourseMeta[] {
  const seen = new Set<string>();
  const out: CourseMeta[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    const course = getCourseById(id);
    if (course) out.push(course);
    if (out.length === PATH_LENGTH) break;
  }
  return out;
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
