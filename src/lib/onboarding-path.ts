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
import { isCourseAvailable } from './curriculum/availability';
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
  /**
   * Epoch ms the onboarding paywall was actually put in front of this user. Null until it is.
   *
   * WHY IT IS PERSISTED AND `completedAt` IS NOT ENOUGH. `completeOnboarding()` stamps
   * `completedAt` at the LOADER, two steps before the paywall, and the entry redirect tested only
   * `completedAt` and `hasAccount`. So someone who signed up at the account wall, reached the
   * paywall and killed the app relaunched straight into Home, never having seen the offer, with
   * nothing anywhere that would route them back to it. One force-quit was the whole bypass.
   *
   * The analytics latch for the same moment is a `useRef`, which is in-memory and dies with the
   * process, so it cannot answer this question on the next launch.
   */
  onboardingPaywallSeenAt: number | null;
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
  notifyOptIn: false,
  analyticsOptIn: false,
  completedAt: null,
  name: null,
  handle: null,
  email: null,
  authProvider: null,
  authId: null,
  onboardingPaywallSeenAt: null,
  firstRunDoneAt: null,
};

/**
 * Does this profile have an account behind it?
 *
 * THE ONE DEFINITION. The app gates on this in three places (the entry redirect, the tab layout,
 * and the end of onboarding), and three hand-rolled truth tests would drift apart the first time
 * one of them was edited.
 *
 * Two ways to be true, and they are not equally strong:
 *  - `authProvider` — Apple or Google proved the identity. Set even when AUTH_ENABLED is false,
 *    because the provider sheet still runs and still returns a stable id (auth.tsx enterWith).
 *  - `email` — the form path. Proves nothing on its own, but it IS the account when Supabase is
 *    not configured, which is every build shipped so far.
 *
 * `name` is deliberately NOT enough. It is collected in onboarding step 0 by NameStep, long before
 * anyone is asked to sign up, so treating it as an account would hand every user a free pass
 * through the very gate this function exists to close.
 */
export function hasAccount(p: Profile): boolean {
  return Boolean(p.authProvider ?? p.email?.trim());
}

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
 * The answer fields that can earn a course its slot. Every one is a Profile key, so a pick can
 * point at the exact field the learner filled in.
 */
export type PathSource = Extract<keyof Profile, 'riskComfort' | 'topics' | 'blockers' | 'horizon' | 'goal' | 'experience'>;

/**
 * A chosen course plus the ANSWER that earned it its slot.
 *
 * `source` and `answer` exist for the path-assembly loader, which lights each course node with the
 * sprite of the option the learner actually tapped. `reason` alone is prose, and a loader that had
 * to parse prose back into an option key would break the first time a reason was reworded.
 *
 * BOTH ARE NULL when no answer earned the slot: the goal seed for a learner who skipped the goal
 * (candidates() quietly assumes 'learn'), the tier pad with no experience, and the final
 * "rounds out" pad. Tagging those with a source would show a sprite for a choice nobody made.
 * Pinned by scripts/onboarding-loader-answers-pin.mjs, both ways.
 */
export type PathPick = { course: CourseMeta; reason: string; source: PathSource | null; answer: string | null };

/**
 * The option a pick cites, looked up in the screen's own option lists.
 *
 * Generic over the option shape so this file stays free of React and sprites: onboarding.tsx owns
 * the Choice arrays (and their icons), and hands them in. One lookup, shared by the loader and the
 * pin, so the two cannot disagree about which sprite belongs to which pick.
 */
export function pickOption<T extends { key: string }>(
  pick: Pick<PathPick, 'source' | 'answer'>,
  lists: Partial<Record<PathSource, readonly T[]>>,
): T | null {
  if (!pick.source || pick.answer === null) return null;
  return lists[pick.source]?.find((o) => o.key === pick.answer) ?? null;
}

type Candidate = { id: string; reason: string; source: PathSource | null; answer: string | null };

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
function candidates(p: Profile): Candidate[] {
  const out: Candidate[] = [];
  // `source` is required, not optional: a new rule added without saying which answer it reads
  // would otherwise compile, and the loader would draw an empty socket for it.
  const add = (id: string, reason: string, source: PathSource | null, answer: string | null) =>
    out.push({ id, reason, source, answer });

  /*
   * EVERY OFFERED ANSWER HAS TO BE ABLE TO MOVE THE RESULT.
   *
   * Five of them could not. riskComfort 'wait' and 'buy', horizon 'soon' and 'year', and the
   * blocker 'time' were all offered, tapped, written to the profile and then matched by nothing
   * here — so a learner could answer three questions differently and get a byte-identical path.
   * That is worse than not asking: it is a question that pretends to listen.
   *
   * The fix is a mapping for each, not a shorter questionnaire. Each one below is an EDUCATIONAL
   * sequencing decision and stays inside the regulatory note at the top of this file: none of them
   * recommends a security, an allocation or an action with money.
   */

  // 1. Behaviour beats content. How someone reacts to a drawdown is the single most useful thing
  //    to know about them, so all three answers lead, not just the alarming one.
  if (p.riskComfort === 'sell') add('behavioral-finance', 'You said a 20% drop would make you sell', 'riskComfort', 'sell');
  // Sitting through a 20% drawdown is a plan, and risk material is what turns it into one.
  if (p.riskComfort === 'wait') add('risk-management', 'You said you would sit a 20% drop out', 'riskComfort', 'wait');
  // Buying a drawdown is a valuation question before it is a nerve question.
  if (p.riskComfort === 'buy') add('corporate-finance', 'You said a 20% drop is a buying opportunity', 'riskComfort', 'buy');

  /*
   * 2. WHAT THEY ACTUALLY ASKED FOR.
   *
   * This was rule 5, below goal, and that made it unreachable rather than merely low-priority.
   * PATH_LENGTH is 3; `p.goal ?? 'learn'` always resolves, and every SEED_BY_GOAL entry is THREE
   * distinct available courses — so by the end of the old rule 4 the list always held at least
   * three, and recommendPathDetailed broke before it ever read a topic. Nine chips, every one
   * mapped to a real available course, and not one of them could move the result.
   *
   * The same defect this function was rewritten to remove, hiding one rule further down: an
   * answer that is collected, persisted, correctly mapped, and never consulted.
   *
   * Placed BELOW riskComfort and above everything else. Drawdown behaviour stays first — it is
   * the one thing that predicts how somebody needs to be taught rather than what about. But a
   * tapped chip is the only answer in this flow where the learner NAMES the subject; blockers,
   * horizon and goal are all inferences from it. An explicit request outranks an inference.
   */
  for (const t of p.topics) {
    const id = COURSE_BY_TOPIC[t];
    if (id) add(id, `You picked ${TOPIC_LABEL[t] ?? t}`, 'topics', t);
  }

  // 3. Stated obstacles. A blocker is the thing the user believes is stopping them, so it
  //    outranks a general goal: clearing it is what makes the rest reachable.
  if (p.blockers.includes('fear')) add('risk-management', 'You said losing money holds you back', 'blockers', 'fear');
  if (p.blockers.includes('trust')) add('behavioral-finance', 'You said you do not know who to trust', 'blockers', 'trust');
  if (p.blockers.includes('jargon')) add('investing-fundamentals', 'You said the jargon is overwhelming', 'blockers', 'jargon');
  if (p.blockers.includes('start')) add('investing-fundamentals', 'You said you do not know where to start', 'blockers', 'start');
  // "I never find the time" is a budgeting and automation problem before it is an investing one.
  if (p.blockers.includes('time')) add('personal-finance', 'You said you never find the time', 'blockers', 'time');

  // 4. Timing. The nearer the start date, the sooner the material that matters on day one.
  if (p.horizon === 'now') add('risk-management', 'You have already started investing', 'horizon', 'now');
  if (p.horizon === 'unsure') add('personal-finance', 'You are not sure when you will start', 'horizon', 'unsure');
  // Months away: the mechanics of actually buying something come first.
  if (p.horizon === 'soon') add('investing-fundamentals', 'You want to start within a few months', 'horizon', 'soon');
  // A year out is the one horizon with room to get the money side in order first.
  if (p.horizon === 'year') add('personal-finance', 'You want to start within a year', 'horizon', 'year');

  // 5. Goal seeds the spine of the path.
  const goal = p.goal ?? 'learn';
  // Null source when the goal was skipped: 'learn' is this function's assumption, not an answer.
  for (const id of SEED_BY_GOAL[goal]) add(id, GOAL_REASON[goal], p.goal ? 'goal' : null, p.goal);

  // 6. Pad from the experience-matched tier, then anything, so PATH_LENGTH is always reached.
  const tier = p.experience ? TIER_BY_EXPERIENCE[p.experience] : 'easy';
  const tierWord = tier === 'easy' ? 'beginner' : tier === 'intermediate' ? 'intermediate' : 'advanced';
  for (const c of getCoursesByTier(tier)) add(c.id, `Matched to your ${tierWord} level`, p.experience ? 'experience' : null, p.experience);
  for (const c of COURSES) add(c.id, 'Rounds out your path', null, null);

  return out;
}

/**
 * Build the recommended path WITH the reason for each pick. ALWAYS returns exactly PATH_LENGTH
 * real courses, even for a completely empty profile — the reveal screen must never be empty.
 */
export function recommendPathDetailed(p: Profile): PathPick[] {
  const seen = new Set<string>();
  const out: PathPick[] = [];
  for (const { id, reason, source, answer } of candidates(p)) {
    if (seen.has(id)) continue; // first mention wins, so the highest-priority reason is kept
    seen.add(id);
    if (!isCourseAvailable(id)) continue;
    const course = getCourseById(id);
    if (course) out.push({ course, reason, source, answer });
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
  // The loader draws the cited answer's sprite, so a claimed answer nobody gave would be a lie.
  if (recommendPathDetailed(EMPTY_PROFILE).some((x) => x.source !== null)) bad('an empty profile must not cite any answer');
  if (recommendPathDetailed(P({ goal: 'trade', experience: 'basics' })).some((x) => !x.source)) bad('an answered profile needs a source on every pick');

  // hasAccount gates entry to the whole app. A false positive here does not render wrong, it
  // silently reopens the hole it was written to close — so the name case is asserted explicitly.
  if (hasAccount(EMPTY_PROFILE)) bad('an empty profile must not count as an account');
  if (hasAccount(P({ name: 'Sriyan' }))) bad('a name from onboarding step 0 must NOT count as an account');
  if (hasAccount(P({ email: '   ' }))) bad('whitespace is not an email');
  if (!hasAccount(P({ email: 'a@b.com' }))) bad('an email is an account when Supabase is off');
  if (!hasAccount(P({ authProvider: 'apple', authId: 'x' }))) bad('a verified provider is an account');
}
