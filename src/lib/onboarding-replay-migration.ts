/** Store version that intentionally replays first-run presentation for existing testers. */
export const ONBOARDING_REPLAY_STORE_VERSION = 5;

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
