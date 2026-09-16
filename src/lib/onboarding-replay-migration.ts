/** Store version that intentionally replays first-run presentation for existing testers. */
export const ONBOARDING_REPLAY_STORE_VERSION = 5;

/**
 * Store version that backfills `profile.onboardingPaywallSeenAt`.
 *
 * The field is new, so every existing install has it missing. The entry redirect now sends anyone
 * without it to the paywall, which is right for someone who genuinely never reached it and WRONG
 * for the installs that finished the flow before the field existed — they would be handed a
 * purchase screen on next launch out of nowhere.
 */
export const PAYWALL_SEEN_BACKFILL_STORE_VERSION = 6;

type ReplayableState = {
  signedIn?: boolean;
  profile?: Record<string, unknown> | null;
  [key: string]: unknown;
};

/**
 * Make one updated install traverse Welcome -> onboarding -> paywall -> sign-up again.
 *
 * Only routing state is reset. Learning progress, XP, portfolio state, entitlement, trial/offer
 * history, identity fields, and onboarding answers remain untouched. New installs already begin in
 * this state, and stores already migrated to v5 must never be reset again.
 */
export function replayOnboardingOnUpgrade<T extends ReplayableState>(state: T, from: number): T {
  if (from >= ONBOARDING_REPLAY_STORE_VERSION) return state;
  const profile = state.profile && typeof state.profile === 'object' ? state.profile : {};
  return {
    ...state,
    signedIn: false,
    profile: { ...profile, completedAt: null },
  };
}

/**
 * Treat an install that already finished onboarding as having been shown the paywall.
 *
 * ORDER MATTERS, and it is why this reads `completedAt` rather than taking a flag. It must run
 * AFTER `replayOnboardingOnUpgrade`, which nulls `completedAt` for anything below v5: those installs
 * are being sent back through the whole flow and will meet the paywall honestly, so they must NOT
 * be backfilled. Only a store already at v5 — finished, and past the point the old code stopped
 * asking — gets the stamp.
 *
 * `completedAt` is used as the timestamp rather than `Date.now()` so the value stays truthful about
 * when that user actually reached the end of onboarding.
 */
export function backfillPaywallSeen<T extends ReplayableState>(state: T, from: number): T {
  if (from >= PAYWALL_SEEN_BACKFILL_STORE_VERSION) return state;
  const profile = state.profile && typeof state.profile === 'object' ? state.profile : {};
  const completedAt = profile.completedAt;
  if (!completedAt || profile.onboardingPaywallSeenAt) return state;
  return { ...state, profile: { ...profile, onboardingPaywallSeenAt: completedAt } };
}
