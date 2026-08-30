import fs from 'node:fs';

const layout = fs.readFileSync(new URL('../src/app/_layout.tsx', import.meta.url), 'utf8');
const eas = JSON.parse(fs.readFileSync(new URL('../eas.json', import.meta.url), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

const fail = (message) => {
  console.error(`[observe-pin] ${message}`);
  process.exitCode = 1;
};

if (!pkg.dependencies?.['expo-observe']?.startsWith('~57.'))
  fail('expo-observe must stay on the Expo SDK 57 line');
if (!layout.includes('ObserveRoot.wrap(RootLayout)')) fail('the root layout is not measured');
if (!layout.includes("'expo-router':")) fail('Expo Router navigation metrics are not enabled');
if (!layout.includes('dispatchInDebug: false')) fail('debug builds must not pollute production metrics');
for (const field of ['access_token', 'refresh_token', 'token', 'code', 'email']) {
  if (!layout.includes(`'${field}'`)) fail(`sensitive router parameter is not filtered: ${field}`);
}
for (const profile of ['preview', 'production']) {
  if (eas.build?.[profile]?.uploadSourceMaps !== true)
    fail(`${profile} EAS builds must upload source maps`);
}

if (!process.exitCode) console.log('[observe-pin] startup, navigation, privacy filters and source maps are pinned');
