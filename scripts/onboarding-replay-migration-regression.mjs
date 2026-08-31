import assert from 'node:assert/strict';

const { ONBOARDING_REPLAY_STORE_VERSION, replayOnboardingOnUpgrade } =
  await import('../src/lib/onboarding-replay-migration.ts');

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

console.log('onboarding replay migration: one replay, progress/entitlement preserved, v5 idempotent');
