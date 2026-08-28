#!/usr/bin/env node

import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync('app.json', 'utf8'));
const manifest = config.expo?.ios?.privacyManifests;
const failures = [];

const requiredReasons = new Map([
  ['NSPrivacyAccessedAPICategoryFileTimestamp', ['C617.1', '0A2A.1', '3B52.1']],
  ['NSPrivacyAccessedAPICategoryUserDefaults', ['CA92.1', 'C56D.1']],
  ['NSPrivacyAccessedAPICategorySystemBootTime', ['35F9.1']],
  ['NSPrivacyAccessedAPICategoryDiskSpace', ['E174.1', '85F4.1']],
]);

const requiredData = new Set([
  'NSPrivacyCollectedDataTypeEmailAddress',
  'NSPrivacyCollectedDataTypeUserID',
  'NSPrivacyCollectedDataTypeDeviceID',
  'NSPrivacyCollectedDataTypePurchaseHistory',
  'NSPrivacyCollectedDataTypeProductInteraction',
  'NSPrivacyCollectedDataTypeOtherUserContent',
]);

if (!manifest) failures.push('expo.ios.privacyManifests is missing');
if (manifest?.NSPrivacyTracking !== false) failures.push('NSPrivacyTracking must be false');

const access = new Map(
  (manifest?.NSPrivacyAccessedAPITypes ?? []).map((entry) => [
    entry.NSPrivacyAccessedAPIType,
    new Set(entry.NSPrivacyAccessedAPITypeReasons ?? []),
  ]),
);

for (const [category, reasons] of requiredReasons) {
  for (const reason of reasons) {
    if (!access.get(category)?.has(reason)) failures.push(`${category} is missing reason ${reason}`);
  }
}

const collected = new Map(
  (manifest?.NSPrivacyCollectedDataTypes ?? []).map((entry) => [entry.NSPrivacyCollectedDataType, entry]),
);

for (const type of requiredData) {
  const entry = collected.get(type);
  if (!entry) failures.push(`${type} is missing`);
  else if (entry.NSPrivacyCollectedDataTypeTracking !== false) failures.push(`${type} must not be marked for tracking`);
}

if (failures.length) {
  console.error(`Privacy manifest pin failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log('Privacy manifest pin passed.');
