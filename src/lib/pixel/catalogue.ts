import { PIXEL_SPRITES } from "./sprites";

/**
 * What every sprite MEANS, and where it is allowed to appear.
 *
 * sprites.ts says how each sprite is drawn. This says when to reach for it.
 * They are separate files because the drawing rules (outline with the deep
 * steps, never K on dark) and the usage rules (a coin is money, never a streak)
 * change for different reasons and are read at different times.
 *
 * Two levels of strictness, and the difference matters:
 *
 *   `slots` is ENFORCED. validateLesson checks every sprite id referenced from
 *   lesson content and fails the build if that sprite is not approved for
 *   lessons. This is what stops a crown or a whale badge turning up inside a
 *   teaching diagram.
 *
 *   `means` / `use` / `avoid` are DOCUMENTATION. Whether a coin is the right
 *   mark for a given statistic is a judgement no validator can make, because
 *   nothing in the content declares what a slot is supposed to signify. So
 *   `avoid` records the specific mistakes that have actually been made, in the
 *   sprite's own entry, where the next person picking one will read it.
 */

/** The semantic family a sprite belongs to. */
export type SpriteCategory =
  | "money" | "saving" | "growth" | "risk" | "balance"
  | "time" | "learning" | "progress" | "social" | "value" | "cosmetic";

/**
 * Where a sprite may be used.
 *  - `lesson`   inside lesson content (grid, bars, metric, tapReveal, pictograph, pixel)
 *  - `ui`       app chrome (hint button, shop, badges, nav)
 *  - `cosmetic` shop avatar items and profile decoration only
 */
export type SpriteSlot = "lesson" | "ui" | "cosmetic";

export interface SpriteUsage {
  category: SpriteCategory;
  slots: SpriteSlot[];
  /** One line: what this sprite signifies. */
  means: string;
  /** Concrete situations it is the right choice for. */
  use: string[];
  /** A trap worth spelling out, usually one somebody already fell into. */
  avoid?: string;
}

export const SPRITE_CATALOGUE: Record<string, SpriteUsage> = {
  // ── Money ────────────────────────────────────────────────────────────────
  coin: {
    category: "money", slots: ["lesson", "ui"],
    means: "One unit of money.",
    use: ["earning and income", "a price or cost", "shop currency", "a pictograph unit where one mark is a fixed sum"],
  },
  wallet: {
    category: "money", slots: ["lesson", "ui"],
    means: "Everyday spending and money on hand.",
    use: ["the spending side of a budget", "cash on hand", "day-to-day money decisions"],
    avoid:
      "Do NOT use it for having no money. The sprite draws bills sticking out of the " +
      "billfold, so on a statistic like 'X% live paycheck to paycheck' the art says the " +
      "opposite of the number. Reach for a time sprite when the point is the pay cycle.",
  },
  bank: {
    category: "money", slots: ["lesson", "ui"],
    means: "An institution that holds or governs money.",
    use: ["banks and banking", "central banks and policy", "where deposits live"],
  },

  // ── Saving ───────────────────────────────────────────────────────────────
  "piggy-bank": {
    category: "saving", slots: ["lesson", "ui"],
    means: "Money deliberately set aside.",
    use: ["savings rate", "emergency fund", "paying yourself first", "retirement balances"],
  },
  vault: {
    category: "saving", slots: ["lesson", "ui"],
    means: "Money held securely for the long term.",
    use: ["custody and safekeeping", "long-term or locked assets", "security of holdings"],
    avoid: "Not a general savings mark. Use piggy-bank for ordinary saving; a vault implies locked away.",
  },

  // ── Growth ───────────────────────────────────────────────────────────────
  "chart-up": {
    category: "growth", slots: ["lesson", "ui"],
    means: "A quantity rising over time.",
    use: ["investment gains", "compounding", "returns", "any improving trend"],
  },
  rocket: {
    category: "growth", slots: ["lesson", "ui"],
    means: "Steep upside over a long horizon.",
    use: ["launch moments", "outsized long-run growth"],
    avoid: "Do not use for ordinary returns. It promises dramatic upside; chart-up is the neutral choice.",
  },

  // ── Risk ─────────────────────────────────────────────────────────────────
  "chart-down": {
    category: "risk", slots: ["lesson", "ui"],
    means: "A quantity falling over time.",
    use: ["losses and drawdowns", "rising debt shown as falling net worth", "any worsening trend"],
  },
  shield: {
    category: "risk", slots: ["lesson", "ui"],
    means: "Protection against a downside.",
    use: ["insurance", "hedging", "risk management", "being covered"],
    avoid: "It reads as PROTECTED. Do not use it on a statistic about people who are unprotected.",
  },

  // ── Balance ──────────────────────────────────────────────────────────────
  scales: {
    category: "balance", slots: ["lesson", "ui"],
    means: "A trade-off between two things.",
    use: ["risk against return", "allocation and diversification", "any explicit either/or"],
  },

  // ── Time ─────────────────────────────────────────────────────────────────
  clock: {
    category: "time", slots: ["lesson", "ui"],
    means: "Time passing, and time as the active ingredient.",
    use: ["time horizon", "the time value of money", "starting early vs late", "running out of time"],
  },
  calendar: {
    category: "time", slots: ["lesson", "ui"],
    means: "A recurring cycle or scheduled date.",
    use: ["pay cycles and monthly rhythm", "daily challenges", "habits and schedules"],
  },

  // ── Learning ─────────────────────────────────────────────────────────────
  book: {
    category: "learning", slots: ["lesson", "ui"],
    means: "Study and instruction.",
    use: ["lessons and courses", "education requirements", "reading and coursework"],
  },
  lightbulb: {
    category: "learning", slots: ["lesson", "ui"],
    means: "An insight or a hint.",
    use: ["hints", "the moment a concept clicks", "tips and takeaways"],
  },

  // ── Progress and rewards (mostly UI) ─────────────────────────────────────
  flame: {
    category: "progress", slots: ["lesson", "ui"],
    means: "A streak: consecutive days kept alive.",
    use: ["streak counters", "daily momentum"],
    avoid: "Not a generic 'hot' or 'urgent' mark, and never money burning. It means STREAK here.",
  },
  "flame-spin": {
    category: "progress", slots: ["ui"],
    means: "The streak flame mid-turn, for a full-screen beat.",
    use: ["the lesson warmup screen", "streak milestone moments"],
  },
  star: {
    category: "progress", slots: ["lesson", "ui"],
    means: "XP, level, or rating.",
    use: ["XP and levels", "mastery", "star ratings"],
  },
  trophy: {
    category: "progress", slots: ["lesson", "ui"],
    means: "An achievement already earned.",
    use: ["awards and badges", "completed milestones"],
    avoid: "It means ALREADY WON. Do not use it for a goal someone is still working toward.",
  },
  bolt: {
    category: "progress", slots: ["lesson", "ui"],
    means: "A sudden burst: a boost, or a shock.",
    use: ["XP boosts and power-ups", "an unexpected event or emergency expense"],
  },
  snowflake: {
    category: "progress", slots: ["ui"],
    means: "Pausing a clock.",
    use: ["streak freezes", "anything that holds progress in place"],
  },
  heart: {
    category: "progress", slots: ["ui"],
    means: "Lives remaining.",
    use: ["hearts and refills in games"],
    avoid: "Not a 'favourite' or 'like' mark. It is a life counter.",
  },
  certificate: {
    category: "progress", slots: ["lesson", "ui"],
    means: "Formal completion of something.",
    use: ["course certificates", "credentials and qualifications"],
  },

  // ── Social ───────────────────────────────────────────────────────────────
  chat: {
    category: "social", slots: ["lesson", "ui"],
    means: "People talking.",
    use: ["classes and messages", "discussion", "advice from another person"],
  },
  controller: {
    category: "social", slots: ["lesson", "ui"],
    means: "Play and practice.",
    use: ["the Games hub", "practice modes", "simulations framed as play"],
  },

  // ── Value ────────────────────────────────────────────────────────────────
  gem: {
    category: "value", slots: ["lesson", "ui"],
    means: "Concentrated or rare value.",
    use: ["rarity tiers", "premium items", "stored value assets"],
  },

  // ── Lesson library, batch 2 ──────────────────────────────────────────────
  "credit-card": {
    category: "money", slots: ["lesson", "ui"],
    means: "Borrowed money you spend now and repay later.",
    use: ["credit cards", "revolving debt", "paying with credit"],
    avoid: "Not a stand-in for money in general. It specifically means BORROWED money.",
  },
  bill: {
    category: "money", slots: ["lesson", "ui"],
    means: "Money you owe on a date.",
    use: ["bills and statements", "due dates", "fixed monthly costs"],
  },
  "chain-break": {
    category: "progress", slots: ["lesson", "ui"],
    means: "A debt finally cleared.",
    use: ["paying off a loan", "becoming debt free", "escaping a payment"],
    avoid: "It means the debt is GONE. Do not use it while a balance still stands.",
  },
  "tax-form": {
    category: "money", slots: ["lesson", "ui"],
    means: "Filing and what you owe the government.",
    use: ["tax filing", "deductions and credits", "refunds"],
  },
  receipt: {
    category: "money", slots: ["lesson", "ui"],
    means: "A record of what was spent.",
    use: ["tracking spending", "proof of purchase", "expense records"],
  },
  house: {
    category: "money", slots: ["lesson", "ui"],
    means: "Housing: the largest cost most people carry.",
    use: ["rent and mortgages", "buying a home", "housing costs"],
  },
  key: {
    category: "value", slots: ["lesson", "ui"],
    means: "Ownership, or getting access to something.",
    use: ["owning an asset", "unlocking access", "closing on a home"],
  },
  umbrella: {
    category: "risk", slots: ["lesson", "ui"],
    means: "Being covered when something goes wrong.",
    use: ["insurance", "coverage", "protection against a loss"],
    avoid: "It means COVERED. Do not put it on a statistic about people who are uninsured.",
  },
  "first-aid": {
    category: "risk", slots: ["lesson", "ui"],
    means: "Medical costs and health cover.",
    use: ["health insurance", "medical bills", "emergency care"],
  },
  bull: {
    category: "growth", slots: ["lesson", "ui"],
    means: "A rising market.",
    use: ["bull markets", "sustained gains", "optimism"],
  },
  bear: {
    category: "risk", slots: ["lesson", "ui"],
    means: "A falling market.",
    use: ["bear markets", "downturns", "crashes"],
  },
  "stock-ticker": {
    category: "growth", slots: ["lesson", "ui"],
    means: "Live prices and market data.",
    use: ["stock quotes", "market data", "following prices"],
  },
  dividend: {
    category: "money", slots: ["lesson", "ui"],
    means: "Cash paid out to owners.",
    use: ["dividends", "payouts", "income from holdings"],
  },
  briefcase: {
    category: "money", slots: ["lesson", "ui"],
    means: "Work and the income it produces.",
    use: ["jobs and careers", "salary negotiation", "professional work"],
  },
  factory: {
    category: "money", slots: ["lesson", "ui"],
    means: "A company that produces something.",
    use: ["businesses", "industry", "what a share actually owns"],
  },
  handshake: {
    category: "social", slots: ["lesson", "ui"],
    means: "An agreement between two parties.",
    use: ["deals", "contracts", "negotiation"],
  },
  hourglass: {
    category: "time", slots: ["lesson", "ui"],
    means: "Time running, and running out.",
    use: ["deadlines", "time horizons", "waiting periods"],
    avoid: "Prefer `clock` for time as a neutral quantity; the hourglass implies time is EXPIRING.",
  },
  target: {
    category: "learning", slots: ["lesson", "ui"],
    means: "A goal and what you are aiming at.",
    use: ["savings goals", "targets", "objectives"],
  },
  "graduation-cap": {
    category: "learning", slots: ["lesson", "ui"],
    means: "Education and what it costs.",
    use: ["college", "student loans", "degrees"],
  },
  paycheck: {
    category: "money", slots: ["lesson", "ui"],
    means: "Income arriving.",
    use: ["wages and salary", "payday", "take-home pay"],
  },
  "wage-gap": {
    category: "risk", slots: ["lesson", "ui"],
    means: "Two amounts that should match but do not.",
    use: ["pay gaps", "comparisons between two groups", "shortfalls"],
  },
  ladder: {
    category: "progress", slots: ["lesson", "ui"],
    means: "Climbing in steps.",
    use: ["career progression", "building up gradually", "levels"],
  },
  magnet: {
    category: "risk", slots: ["lesson", "ui"],
    means: "Something that pulls money toward or away from you.",
    use: ["fees that drain", "incentives", "what attracts spending"],
  },
  compass: {
    category: "learning", slots: ["lesson", "ui"],
    means: "Having a direction.",
    use: ["financial plans", "strategy", "deciding where to go"],
  },
  "scale-tip": {
    category: "balance", slots: ["lesson", "ui"],
    means: "A trade-off that has tipped one way.",
    use: ["imbalance", "one-sided risk", "an unfair deal"],
    avoid: "Use `scales` for a balanced or open trade-off; this one has already tipped.",
  },
  "piggy-crack": {
    category: "risk", slots: ["lesson", "ui"],
    means: "Savings emptied out.",
    use: ["draining an emergency fund", "spending savings", "a broken buffer"],
    avoid: "The opposite of `piggy-bank`. Do not use it for ordinary saving.",
  },
  cart: {
    category: "money", slots: ["lesson", "ui"],
    means: "Buying things.",
    use: ["shopping", "retail spending", "discretionary purchases"],
  },
  phone: {
    category: "social", slots: ["lesson", "ui"],
    means: "Money handled digitally.",
    use: ["banking apps", "digital payments", "managing money on a phone"],
  },
  lock: {
    category: "saving", slots: ["lesson", "ui"],
    means: "Money that cannot be touched.",
    use: ["locked accounts", "security", "funds you cannot withdraw"],
  },
  "safety-net": {
    category: "saving", slots: ["lesson", "ui"],
    means: "The buffer under you when something goes wrong.",
    use: ["emergency funds", "financial cushion", "a backup plan"],
  },
  parachute: {
    category: "risk", slots: ["lesson", "ui"],
    means: "A fallback for when things drop.",
    use: ["contingency plans", "hedges", "a way out"],
  },
  crack: {
    category: "risk", slots: ["lesson", "ui"],
    means: "Something breaking under pressure.",
    use: ["financial stress", "a plan failing", "the first sign of trouble"],
  },
  stopwatch: {
    category: "time", slots: ["lesson", "ui"],
    means: "Acting in time.",
    use: ["deadlines", "urgency", "limited windows"],
  },
  globe: {
    category: "social", slots: ["lesson", "ui"],
    means: "The world economy.",
    use: ["global markets", "international investing", "world trade"],
  },
  "bar-chart": {
    category: "growth", slots: ["lesson", "ui"],
    means: "Comparing quantities side by side.",
    use: ["comparisons", "statistics", "data"],
  },
  "pie-slice": {
    category: "balance", slots: ["lesson", "ui"],
    means: "A share of a whole.",
    use: ["allocation", "percentages", "a portion of a portfolio"],
  },
  "arrow-split": {
    category: "balance", slots: ["lesson", "ui"],
    means: "A decision between two paths.",
    use: ["choices", "forks in a plan", "either/or decisions"],
  },
  question: {
    category: "learning", slots: ["lesson", "ui"],
    means: "Something unknown, or being asked.",
    use: ["open questions", "uncertainty", "prompts"],
  },
  "check-badge": {
    category: "progress", slots: ["lesson", "ui"],
    means: "Something confirmed correct.",
    use: ["verified facts", "completed steps", "approval"],
  },
  car: {
    category: "money", slots: ["lesson", "ui"],
    means: "Cars and what they cost.",
    use: ["car loans", "transport costs", "depreciating purchases"],
  },
  plane: {
    category: "money", slots: ["lesson", "ui"],
    means: "Travel and big discretionary purchases.",
    use: ["vacations", "travel goals", "large one-off spending"],
  },
  food: {
    category: "money", slots: ["lesson", "ui"],
    means: "Everyday essential spending.",
    use: ["groceries", "needs vs wants", "essential costs"],
  },
  gift: {
    category: "social", slots: ["lesson", "ui"],
    means: "Giving money away.",
    use: ["charity", "donations", "generosity"],
  },
  calculator: {
    category: "learning", slots: ["lesson", "ui"],
    means: "Working out the numbers.",
    use: ["budgeting", "doing the math", "running figures"],
  },
  newspaper: {
    category: "learning", slots: ["lesson", "ui"],
    means: "News and information.",
    use: ["market news", "research", "staying informed"],
  },
  seedling: {
    category: "growth", slots: ["lesson", "ui"],
    means: "A small start that will grow.",
    use: ["starting early", "small contributions", "the beginning of compounding"],
  },
  tree: {
    category: "growth", slots: ["lesson", "ui"],
    means: "What a small start becomes over time.",
    use: ["long-term growth", "matured investments", "the payoff of starting early"],
    avoid: "Pair it with `seedling` when the point is the passage of time.",
  },
  "bank-run": {
    category: "risk", slots: ["lesson", "ui"],
    means: "A financial institution in crisis.",
    use: ["bank failures", "panics", "systemic risk"],
  },
  "stack-cash": {
    category: "saving", slots: ["lesson", "ui"],
    means: "An accumulated balance.",
    use: ["savings balances", "building up cash", "money set aside"],
  },
  inflation: {
    category: "risk", slots: ["lesson", "ui"],
    means: "Prices rising against what money buys.",
    use: ["inflation", "loss of purchasing power", "why cash shrinks"],
  },

  // ── Cosmetic: shop and profile ONLY, never lesson content ────────────────
  crown: { category: "cosmetic", slots: ["cosmetic"], means: "Avatar cosmetic, top tier.", use: ["shop avatar items", "rarity cues"] },
  sunglasses: { category: "cosmetic", slots: ["cosmetic"], means: "Avatar cosmetic.", use: ["shop avatar items"] },
  "top-hat": { category: "cosmetic", slots: ["cosmetic"], means: "Avatar cosmetic.", use: ["shop avatar items"] },
  "wizard-hat": { category: "cosmetic", slots: ["cosmetic"], means: "Avatar cosmetic.", use: ["shop avatar items"] },
  monocle: { category: "cosmetic", slots: ["cosmetic"], means: "Avatar cosmetic.", use: ["shop avatar items"] },
  "diamond-ring": { category: "cosmetic", slots: ["cosmetic"], means: "Avatar cosmetic, top rarity.", use: ["shop avatar items"] },
  theme: { category: "cosmetic", slots: ["cosmetic"], means: "Profile colour theme.", use: ["shop profile items"] },
  frame: { category: "cosmetic", slots: ["cosmetic"], means: "Profile avatar frame.", use: ["shop profile items"] },
  whale: { category: "cosmetic", slots: ["cosmetic"], means: "Big-spender badge.", use: ["shop and award badges"] },
};

/** May this sprite be used inside lesson content? */
export const isLessonSprite = (id: string): boolean =>
  SPRITE_CATALOGUE[id]?.slots.includes("lesson") ?? false;

export const spriteUsage = (id: string): SpriteUsage | undefined => SPRITE_CATALOGUE[id];

/** Every sprite approved for lessons, grouped by category, for authoring. */
export const lessonSpritesByCategory = (): Record<string, string[]> => {
  const out: Record<string, string[]> = {};
  for (const [id, u] of Object.entries(SPRITE_CATALOGUE)) {
    if (!u.slots.includes("lesson")) continue;
    (out[u.category] ||= []).push(id);
  }
  return out;
};

/**
 * Every sprite in sprites.ts must have an entry here, and vice versa. Drift
 * between the two is how a new sprite ends up with no usage rule at all, so it
 * is a hard failure rather than a warning.
 */
export function auditCatalogue(): string[] {
  const drawn = new Set(PIXEL_SPRITES.map((s) => s.id));
  const catalogued = new Set(Object.keys(SPRITE_CATALOGUE));
  const problems: string[] = [];
  for (const id of drawn) if (!catalogued.has(id)) problems.push(`sprite "${id}" is drawn but has no catalogue entry`);
  for (const id of catalogued) if (!drawn.has(id)) problems.push(`catalogue lists "${id}" but no such sprite is drawn`);
  return problems;
}
