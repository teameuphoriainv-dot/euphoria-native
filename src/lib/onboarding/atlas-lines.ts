/**
 * Atlas's guide line for every onboarding screen.
 *
 * Owner decision 2 (2026-09-22): Atlas talks on EVERY onboarding screen, one short line that
 * reacts to what the user just answered. Before this, eleven of fourteen screens had Atlas
 * standing above a question with nothing to say about the answer the user gave one tap ago, so
 * the questions read as a form rather than as someone listening.
 *
 * Pure: no React, no store, and only a TYPE import from onboarding-path, so
 * scripts/onboarding-atlas-guide-pin.mjs can call it in plain node over every answer.
 *
 * THE RULES THIS FILE HOLDS (each one is asserted by the pin):
 *   - every step key has a line, and the line is at most ATLAS_LINE_MAX characters. A longer
 *     line wraps to three rows in the compact paywall variant and pushes the purchase screen into
 *     a scroll, which CONSTITUTION 5.3 forbids;
 *   - no digits. Nothing here may state a return, a count of lessons or a price: those are derived
 *     elsewhere from the corpus and the store, and a number typed into a mascot's mouth is how a
 *     fabricated figure (CONSTITUTION 3.1) gets past review. The one count that reacts to the user
 *     (how many topics they picked) is said in words;
 *   - no advice and no "buy" (CONSTITUTION 3.3). Atlas reacts to a panic-sell or a buy-the-dip
 *     answer without endorsing either one;
 *   - no em or en dashes (CONSTITUTION 4);
 *   - a reactive line is DIFFERENT for each answer it reacts to. A "reaction" that says the same
 *     thing whatever you picked is decoration pretending to listen.
 */
import type { Profile } from '@/lib/onboarding-path';

/** Hard ceiling, in characters, for any line this file can produce, name included. */
export const ATLAS_LINE_MAX = 70;

/**
 * Tighter ceiling for the paywall line, which renders in the compact guide at a fixed height,
 * capped at two lines and a 1.3 font multiplier. The bubble there is about 270pt wide on a 375pt
 * phone; at 12pt x 1.3 that holds roughly 36 characters a line, so 44 fits in two lines with
 * room to spare and the cap never has to cut the sentence off.
 */
export const COMPACT_LINE_MAX = 44;

/**
 * Every screen Atlas guides, by key. A question step's key is its Profile field, a statement's is
 * its `body`, and every other step's is its `kind`: see `stepKeyOf`. `try` is the hands-on
 * "Double it" screen added before the account wall.
 */
export const ATLAS_STEP_KEYS = [
  'name',
  'experience',
  'goal',
  'topics',
  'chart',
  'try',
  'horizon',
  'riskComfort',
  'proof',
  'blockers',
  'ageBand',
  'avatar',
  'loader',
  'reveal',
  'paywall',
] as const;
export type AtlasStepKey = (typeof ATLAS_STEP_KEYS)[number];

/**
 * The step's key, derived the same way the pin derives it from the STEPS source.
 *
 * Derived rather than added as a `key:` on each StepDef so that inserting or reordering a step
 * cannot leave a line pointing at the wrong screen: the key comes from what the step asks, not
 * from where it sits.
 */
export function stepKeyOf(def: { kind: string; field?: unknown; body?: unknown }): string {
  if ((def.kind === 'single' || def.kind === 'multi') && typeof def.field === 'string') return def.field;
  if (def.kind === 'statement' && typeof def.body === 'string') return def.body;
  return def.kind;
}

/** The answers a line can react to. Everything is optional: a line is asked for BEFORE later
 *  questions are answered, and a replaying user may have skipped nothing or everything. */
export type ProfileSoFar = Partial<Pick<Profile, 'name' | 'experience' | 'goal' | 'topics' | 'horizon' | 'riskComfort' | 'blockers'>> & {
  /** How "Double it" went. Not a Profile field (that screen persists nothing); onboarding.tsx
   *  passes it in from the screen's own state. See TRY_RESULTS. */
  tryResult?: TryResult;
};

/**
 * How the "Double it" screen resolved, for the line on the screen after it.
 *   first  - the first Check was right;
 *   retry  - missed once, then found it;
 *   shown  - missed twice, so the screen snapped to the answer.
 * Exported so the pin can walk every value and demand a distinct line for each.
 */
export const TRY_RESULTS = ['first', 'retry', 'shown'] as const;
export type TryResult = (typeof TRY_RESULTS)[number];

/** Structural, so this file keeps its no-React, type-only-import rule: double-it.ts's phase and
 *  firstTry map onto a result, or null while the screen is unresolved. */
export function tryResultOf(r: { phase: string; firstTry: boolean | null }): TryResult | null {
  if (r.phase === 'revealed') return 'shown';
  if (r.phase === 'correct') return r.firstTry ? 'first' : 'retry';
  return null;
}

/**
 * Which answer each reactive step listens to. Exported for the pin, which walks every value of
 * the field and demands a distinct line for each.
 *
 * Each points at the question the user answered on the screen JUST BEFORE, in the current STEPS
 * order. horizon follows "Double it" and reacts to how that went (owner decision 2026-09-22: it
 * said a fixed "Quick one about timing. Any answer works." straight after a learner either nailed
 * the rule of 72 or was shown it, as if Atlas had not been watching; sim wave 2, 03-guide-horizon).
 * The plain (non-reactive) lines are deliberate:
 *   - blockers follows the proof statement, and proof already reacted to riskComfort, so reacting
 *     again would say the same thing twice (CONSTITUTION 5.1);
 *   - avatar follows the age question, and a mascot remarking on someone's age is not a reaction
 *     anyone wants;
 *   - try, loader and paywall follow screens that record no answer.
 */
export const REACTS_TO: Partial<Record<AtlasStepKey, keyof ProfileSoFar>> = {
  experience: 'name',
  goal: 'experience',
  topics: 'goal',
  chart: 'topics',
  horizon: 'tryResult',
  riskComfort: 'horizon',
  proof: 'riskComfort',
  ageBand: 'blockers',
  reveal: 'goal',
};

/** The name, cut so the longest possible line still fits ATLAS_LINE_MAX. The store already caps
 *  names at NAME_MAX (18); this cuts to the first word and 12 characters as well, because the
 *  line is a greeting, not a label, and "Nice to meet you, Alexandria-Maria." wraps on an SE. */
function firstName(name: string | null | undefined): string | null {
  const first = (name ?? '').trim().split(/\s+/)[0] ?? '';
  if (!first) return null;
  return first.length > 12 ? first.slice(0, 12) : first;
}

const BY_EXPERIENCE: Record<NonNullable<Profile['experience']>, string> = {
  beginner: 'Starting from zero is fine. Everyone starts there.',
  basics: 'You know the basics. Nice, we can build on that.',
  experienced: 'Experienced? Nice. You will spot the tricky parts fast.',
};

const BY_GOAL: Record<NonNullable<Profile['goal']>, string> = {
  wealth: 'Thinking long term. I like it.',
  learn: 'Knowing how it works is my favorite part.',
  trade: 'We practice with pretend money, so mistakes are free.',
  economy: 'The economy explains half the headlines out there.',
};

/* Echoes the goal back and says NOTHING about what the path contains. recommendPathDetailed ranks
 * goal fifth, under riskComfort, topics, blockers and horizon, so a learn-goal user who said "sell"
 * gets a path that leads with behavioral finance. The first draft ("a path that starts with how it
 * all works") promised an order the ranking does not keep; the reveal's own cards show the real
 * reasons, so Atlas only has to hand them over. */
const REVEAL_BY_GOAL: Record<NonNullable<Profile['goal']>, string> = {
  wealth: "Here it is. You said long term, so let's get going.",
  learn: "Here it is. You wanted to know how it works. Let's dig in.",
  trade: 'Here it is. You wanted confidence. Practice is how you get it.',
  economy: "Here it is. You wanted the big picture. Let's zoom out.",
};

/* Reacts to the Double it result without restating it: the bar already said "You got it." or
 * "Here it is." (CONSTITUTION 5.1), and ATLAS_BEATS already said "Now you know the trick." So these
 * credit HOW it went, then hand over to the timing question the screen asks. */
const BY_TRY_RESULT: Record<TryResult, string> = {
  first: 'First try, nice. Now a quick one about timing.',
  retry: 'You stuck with it and got there. Now, timing.',
  shown: 'That one was tricky. Here is an easy one, about timing.',
};

const BY_HORIZON: Record<string, string> = {
  now: 'Already started? Then this next one is real for you.',
  soon: 'A few months out. Good time to get the basics down.',
  year: 'A year gives you room to learn first. Smart.',
  unsure: 'Not sure yet is an honest answer. We will figure it out.',
};

/* Reacts to how the user said they would handle a drop, WITHOUT grading it. riskComfort is a
 * behavioural signal and the regulatory note in onboarding-path.ts forbids turning it into
 * advice, so none of these says the answer was right or tells them what to do instead. */
const BY_RISK: Record<NonNullable<Profile['riskComfort']>, string> = {
  sell: 'Wanting out is a normal feeling. We will look at why drops happen.',
  wait: 'Holding steady. We will see what waiting looks like over time.',
  buy: 'Bargain hunter, huh. We will look at what a drop really is.',
};

const BY_BLOCKER: Record<string, string> = {
  jargon: 'Jargon is the worst. I will keep the words plain.',
  time: 'Short lessons. They fit in a bus ride.',
  fear: 'Scared of losing money? Here you practice with pretend money.',
  start: 'Not sure where to start? That part is my job.',
  trust: 'Fair. I show my work, so you can check me.',
};

/**
 * Atlas's line for a step, reacting to the answer before it where there is one.
 *
 * Unknown keys return null rather than a generic line: a step added without a line should be a
 * visible gap the pin catches, not a screen where Atlas says something vague that fits anywhere.
 */
export function atlasLineFor(stepKey: string, p: ProfileSoFar): string | null {
  switch (stepKey as AtlasStepKey) {
    case 'name':
      return "Hi, I'm Atlas. I'll walk you through this.";
    case 'experience': {
      const name = firstName(p.name);
      return name ? `Nice to meet you, ${name}. No wrong answers here.` : 'Nice to meet you. No wrong answers here.';
    }
    case 'goal':
      return p.experience ? BY_EXPERIENCE[p.experience] : 'Got it. Now the fun question.';
    case 'topics':
      return p.goal ? BY_GOAL[p.goal] : 'Pick as many as you like.';
    case 'chart': {
      const n = p.topics?.length ?? 0;
      if (n === 0) return 'A little each day beats a lot once.';
      if (n === 1) return 'One topic. Deep focus, I respect that.';
      if (n <= 3) return 'A few topics. Good mix to start with.';
      return 'That is a lot of topics. Love the curiosity.';
    }
    case 'try':
      // No "before we build your path": owner decision 1 only fixes `try` before the reveal, so a
      // line naming its neighbour would go false if the screen lands after the loader.
      return 'Your turn. Add some years and watch the coins stack.';
    case 'horizon':
      return (p.tryResult && BY_TRY_RESULT[p.tryResult]) || 'Quick one about timing. Any answer works.';
    case 'riskComfort':
      return (p.horizon && BY_HORIZON[p.horizon]) || 'Okay, a what-if. Go with your gut.';
    case 'proof':
      return p.riskComfort ? BY_RISK[p.riskComfort] : 'Here is what you get to work with.';
    case 'blockers':
      return 'Be honest. Your answer changes what I show you first.';
    case 'ageBand': {
      const b = p.blockers ?? [];
      // Several picks: reacting to only the first would ignore the rest, so say that we heard all.
      if (b.length > 1) return 'Noted, all of it. We will work on each one.';
      return (b[0] && BY_BLOCKER[b[0]]) || 'Almost there. Just a couple more.';
    }
    case 'avatar':
      return 'Pick someone to be you in here.';
    case 'loader':
      return 'Hang on. I am putting your answers together.';
    case 'reveal':
      return p.goal ? REVEAL_BY_GOAL[p.goal] : 'Here it is. Your path, from your answers.';
    case 'paywall':
      return 'Your path is ready. This is what Pro adds.';
    default:
      return null;
  }
}
