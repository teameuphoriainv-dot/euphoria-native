/**
 * The Euphoria league ladder.
 *
 * Named tiers are the retention loop Duolingo is built on, and they are what league.tsx was
 * missing: it ranked players against each other without ever saying which league they were in.
 * This module is the single source of truth so the You tab and the league screen can never
 * disagree about what tier someone holds.
 *
 * COLOUR NOTE — READ BEFORE "FIXING" THIS. The repo's standing rule is violet only, no new hues.
 * This ladder deliberately overrides it, with the user's explicit approval, because tiers have to
 * be separable at a glance and that is what both reference apps do. The ladder ENDS on the brand
 * violet, so the summit of the league is Euphoria's own colour. Two of the mid-tier values already
 * exist in theme.ts (#F5B33F warning, #22C55E success) and two more already appear in league.tsx's
 * player array, so this expands the palette far less than it looks. Do not revert it as a mistake.
 */
export type Tier = { name: string; color: string; minXp: number };

/** Career ladder rather than market jargon: a beginner should be offered a role to aspire to,
 *  not vocabulary ("small cap", "blue chip") they have not been taught yet. */
export const TIERS: Tier[] = [
  { name: 'Saver', color: '#CD7F32', minXp: 0 },
  { name: 'Investor', color: '#B8C4D0', minXp: 500 },
  { name: 'Analyst', color: '#F5B33F', minXp: 1500 },
  { name: 'Strategist', color: '#38BDF8', minXp: 3000 },
  { name: 'Portfolio Manager', color: '#22C55E', minXp: 5000 },
  { name: 'Partner', color: '#FB7185', minXp: 8000 },
  { name: 'Magnate', color: '#A855EB', minXp: 12000 },
];

/** Highest tier whose threshold the xp has reached. Never returns undefined: TIERS[0] starts at 0,
 *  so even a brand new account with no XP holds a real tier rather than an empty state. */
export function tierForXp(xp: number): Tier {
  let held = TIERS[0];
  for (const tier of TIERS) if (xp >= tier.minXp) held = tier;
  return held;
}

export type TierProgress = {
  tier: Tier;
  /** null at the summit. */
  next: Tier | null;
  /** 0..1, for a ProgressBar. */
  progress: number;
  xpToNext: number;
};

/**
 * Progress toward the next tier.
 *
 * At the summit `next` is null and `progress` pins to 1 rather than 0. Returning 0 there would
 * divide by an absent span and render a bar that reads as "no progress" to the highest-ranked
 * player in the app, which is exactly backwards.
 */
export function tierProgress(xp: number): TierProgress {
  const tier = tierForXp(xp);
  const i = TIERS.indexOf(tier);
  const next = i < TIERS.length - 1 ? TIERS[i + 1] : null;
  if (!next) return { tier, next: null, progress: 1, xpToNext: 0 };
  const span = next.minXp - tier.minXp;
  return {
    tier,
    next,
    progress: Math.min(1, Math.max(0, (xp - tier.minXp) / span)),
    xpToNext: next.minXp - xp,
  };
}

// Threshold logic is exactly where an off-by-one hides, and a wrong tier is the kind of bug nobody
// notices until a user is demoted for no reason. One runnable check, dev only.
if (__DEV__) {
  const eq = (got: unknown, want: unknown, what: string) => {
    if (got !== want) console.error(`[league] ${what}: got ${String(got)}, expected ${String(want)}`);
  };
  eq(tierForXp(0).name, 'Saver', 'a new account holds the first tier');
  eq(tierForXp(499).name, 'Saver', 'one XP below a threshold does not promote');
  eq(tierForXp(500).name, 'Investor', 'landing exactly on a threshold does promote');
  eq(tierForXp(999999).name, 'Magnate', 'above the last threshold holds the summit');
  eq(tierProgress(12000).next, null, 'the summit has no next tier');
  eq(tierProgress(12000).progress, 1, 'the summit reads as full, not empty');
  eq(tierProgress(1000).progress, 0.5, 'halfway between two thresholds reads as half');
  eq(tierProgress(0).xpToNext, 500, 'xpToNext counts down to the next threshold');
}
