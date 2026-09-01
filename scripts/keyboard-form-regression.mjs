#!/usr/bin/env node

import { readFileSync } from 'node:fs';

const onboarding = readFileSync('src/app/onboarding.tsx', 'utf8');
const auth = readFileSync('src/app/auth.tsx', 'utf8');
const failures = [];

function requires(source, pattern, message) {
  if (!pattern.test(source)) failures.push(message);
}

console.log('\nKeyboard-safe onboarding and auth forms\n');

requires(
  onboarding,
  /<KeyboardAvoidingView[\s\S]*?behavior=\{Platform\.OS === 'ios' \? 'padding' : undefined\}/,
  'onboarding must move its focused input and Continue action above the iOS keyboard',
);
requires(
  onboarding,
  /keyboardDismissMode="interactive"/,
  'onboarding must let an iOS drag dismiss the keyboard interactively',
);
requires(
  onboarding,
  /keyboardShouldPersistTaps="handled"/,
  'onboarding controls must receive the first tap while the keyboard is open',
);
requires(
  onboarding,
  /returnKeyType="done"[\s\S]*?onSubmitEditing=\{Keyboard\.dismiss\}/,
  'the name field Done key must dismiss the keyboard',
);
requires(
  onboarding,
  /const next = \(\) => \{\s*Keyboard\.dismiss\(\);/,
  'advancing onboarding must dismiss the keyboard before changing steps',
);

requires(
  auth,
  /<KeyboardAvoidingView[\s\S]*?behavior=\{Platform\.OS === 'ios' \? 'padding' : undefined\}/,
  'the profile form must move above the iOS keyboard',
);
requires(
  auth,
  /<ScrollView[\s\S]*?keyboardDismissMode="interactive"[\s\S]*?keyboardShouldPersistTaps="handled"/,
  'the profile form must stay scrollable and accept controls while the keyboard is open',
);
requires(
  auth,
  /accessibilityLabel="Your name"[\s\S]*?returnKeyType="next"[\s\S]*?onSubmitEditing=\{\(\) => emailRef\.current\?\.focus\(\)\}/,
  'the name return key must advance focus to email',
);
requires(
  auth,
  /accessibilityLabel="Email"[\s\S]*?returnKeyType=\{AUTH_ENABLED \? 'next' : 'done'\}/,
  'the email return key must advance to password when accounts are enabled',
);
requires(
  auth,
  /accessibilityLabel="Password"[\s\S]*?returnKeyType="done"[\s\S]*?onSubmitEditing=\{submitForm\}/,
  'the password Done key must dismiss and submit the form',
);
requires(
  auth,
  /<\/ScrollView>[\s\S]*?<View style=\{\[styles\.formFooter,[\s\S]*?<SlabButton[\s\S]*?onPress=\{submitForm\}/,
  'the profile CTA must remain outside the scrolling form and above the software keyboard',
);

if (failures.length) {
  console.error('FAILED\n');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log('PASS — both entry forms remain usable with the software keyboard open.\n');
