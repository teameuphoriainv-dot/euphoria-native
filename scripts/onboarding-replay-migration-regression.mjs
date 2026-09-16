import assert from 'node:assert/strict';

const {
  ONBOARDING_REPLAY_STORE_VERSION,
  PAYWALL_SEEN_BACKFILL_STORE_VERSION,
  replayOnboardingOnUpgrade,
  backfillPaywallSeen,
} = await import('../src/lib/onboarding-replay-migration.ts');

const existing = {
  signedIn: true,
  profile: {
    completedAt: 1_777_777_777_777,
    name: 'Test Learner',
    email: 'tester@example.com',
    firstRunDoneAt: 1_777_777_777_778,
    goal: 'wealth',
  },
  completedLessons: ['investing-fundamentals:1'],
  xp: 420,
  cash: 9_500,
  positions: { AAPL: 2 },
  isPro: true,
  trialStartedAt: 1_700_000_000_000,
  specialOfferSeenAt: 1_700_000_000_001,
};

const migrated = replayOnboardingOnUpgrade(existing, 4);
assert.notEqual(migrated, existing, 'a pre-v5 install needs one migration write');
assert.equal(migrated.signedIn, false, 'the local sign-up screen must be reachable');
assert.equal(migrated.profile.completedAt, null, 'the next cold launch must start at Welcome');
assert.equal(migrated.profile.name, existing.profile.name, 'identity fields must be preserved');
assert.equal(migrated.profile.email, existing.profile.email, 'email must be preserved');
assert.equal(migrated.profile.firstRunDoneAt, existing.profile.firstRunDoneAt, 'guided-action history must be preserved');
for (const key of ['completedLessons', 'xp', 'cash', 'positions', 'isPro', 'trialStartedAt', 'specialOfferSeenAt']) {
  assert.deepEqual(migrated[key], existing[key], `${key} must survive onboarding replay`);
}

const alreadyMigrated = replayOnboardingOnUpgrade(migrated, ONBOARDING_REPLAY_STORE_VERSION);
assert.equal(alreadyMigrated, migrated, 'v5 must be idempotent and never replay twice');

const partial = replayOnboardingOnUpgrade({ xp: 10, profile: null }, 0);
assert.deepEqual(partial, { xp: 10, signedIn: false, profile: { completedAt: null } }, 'partial legacy state must migrate safely');

/*
 * ── v6, THE PAYWALL-SEEN BACKFILL ────────────────────────────────────────────────────────────
 *
 * The entry redirect now sends anyone without profile.onboardingPaywallSeenAt to the paywall,
 * which closes a force-quit bypass. The field is new, so the backfill is what stops that rule from
 * firing at installs which finished the flow before the field existed.
 *
 * ORDERING IS THE PROPERTY UNDER TEST. v5 nulls completedAt for anything below it, and v6 keys off
 * completedAt — so run in the wrong order, or given the wrong `from`, the backfill would stamp an
 * install that is about to replay the whole flow and it would skip the paywall it is being sent
 * back to see.
 */
const v5Finished = { profile: { completedAt: 1_777_777_777_777, name: 'Test Learner' } };
const backfilled = backfillPaywallSeen(v5Finished, ONBOARDING_REPLAY_STORE_VERSION);
assert.equal(backfilled.profile.onboardingPaywallSeenAt, 1_777_777_777_777,
  'an install that already finished onboarding must not be sent back to the paywall');
assert.equal(backfilled.profile.name, 'Test Learner', 'the backfill must not disturb other fields');

// Run the real chain in the real order on a pre-v5 install: it replays, so it must NOT be stamped.
const chained = backfillPaywallSeen(replayOnboardingOnUpgrade(existing, 4), 4);
assert.equal(chained.profile.completedAt, null, 'the v5 replay must still null completedAt');
assert.equal(chained.profile.onboardingPaywallSeenAt, undefined,
  'an install being sent through the whole flow must NOT be pre-stamped as having seen the paywall');

// Someone who genuinely force-quit on the paywall: finished questions, no stamp, and nothing to
// backfill from once they are already at v6.
const atV6 = backfillPaywallSeen(v5Finished, PAYWALL_SEEN_BACKFILL_STORE_VERSION);
assert.equal(atV6, v5Finished, 'v6 must be idempotent and never re-stamp');

const noCompletion = backfillPaywallSeen({ profile: { completedAt: null } }, 0);
assert.equal(noCompletion.profile.onboardingPaywallSeenAt, undefined,
  'an install that never finished onboarding has no paywall visit to record');

assert.ok(PAYWALL_SEEN_BACKFILL_STORE_VERSION > ONBOARDING_REPLAY_STORE_VERSION,
  'the backfill version must be above the replay version or the chain cannot order itself');

console.log('onboarding replay migration: one replay, progress/entitlement preserved, v5 idempotent, '
  + 'v6 backfills a finished install and never pre-stamps one that is replaying');
