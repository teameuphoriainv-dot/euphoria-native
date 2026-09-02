import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const configDir = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(configDir, '..');


/**
 * A subtle Atlas cameo. Decorations draw OVER the background and UNDER the device, so a sprite
 * parked in the margin peeks out beside the phone and can never cover app UI. Kept at ~0.11 of
 * the tile width -- about 145px on a 1320px tile -- so it reads as a wink, not a second subject.
 */
const cameo = (expression: string, x: number, y: number, width = 0.20, rotate = 0) => ({
  kind: 'image' as const,
  src: `decor/atlas-${expression}.png`,
  x,
  y,
  width,
  rotate,
});

const config = {
  appRoot,
  appPath:
    process.env.GOLDIE_APP_PATH
    ?? '/tmp/euphoria-goldie-derived/Build/Products/Release-iphonesimulator/euphorianative.app',
  bundleId: 'com.euphoriainv.euphoria',
  devices: ['iphone-6.9'],
  locales: ['en-US'],
  appearance: 'dark',
  frame: { variant: '17-pro-silver' },
  theme: {
    background: '#3B2160',
    headlineColor: '#FFFFFF',
    subheadColor: '#D2C6DB',
    fontFamily: '"DM Sans", -apple-system, system-ui, sans-serif',
    copyHeightRatio: 0.23,
    deviceWidthRatio: 0.84,
    layout: 'classic',
  },
  store: {
    // Matches the live listing; this previously read "Learn Investing".
    name: 'Euphoria: Learn to Invest',
    subtitle: { 'en-US': 'Learn money. Practice safely.' },
    developer: 'Euphoria',
    category: 'Education',
    rating: 5,
    ratingCount: 'New',
    ageRating: '4+',
    price: 'Free',
    description: {
      'en-US':
        'Build financial confidence through short, interactive lessons. Practice investing with a simulated wallet, learn from Atlas, and turn steady progress into a daily habit. Euphoria is educational only and does not provide personalized financial advice.',
    },
  },
  // Owner-requested store order. Each scene keeps the per-scene layout and background it had in
  // the approved strip -- the variety across hero/offset/classic/tilt-right/copy-below IS the
  // format, and collapsing it to one layout is what made the previous pass look flat.
  scenes: [
    {
      kind: 'screenshot',
      id: 'intro',
      flow: 'store-06-intro',
      headline: { 'en-US': 'Money, finally explained' },
      subhead: { 'en-US': 'Twelve pathways and 300 lessons, from first principles to wealth management.' },
      background: '#3B2160',
      layout: 'classic',
      decorations: [cameo('proud', 0.775, 0.205, 0.20, 11)],
    },
    {
      kind: 'screenshot',
      id: 'explain',
      flow: 'store-01-explain',
      headline: { 'en-US': 'See the why' },
      subhead: { 'en-US': 'Tap any figure and Atlas explains what the number actually means.' },
      background: '#42285F',
      layout: 'hero',
      decorations: [cameo('thinking', 0.735, 0.175, 0.20, 12)],
    },
    {
      kind: 'screenshot',
      id: 'path',
      flow: 'store-03-path',
      headline: { 'en-US': '300 lessons. One path.' },
      subhead: { 'en-US': 'Go from first principles to wealth management at your pace.' },
      background: '#2A3A63',
      layout: 'classic',
      decorations: [cameo('watching', 0.015, 0.235, 0.20, -13)],
    },
    {
      kind: 'screenshot',
      id: 'home',
      flow: 'store-02-home',
      headline: { 'en-US': 'Build a money habit' },
      subhead: { 'en-US': 'Daily goals, streaks, and quests turn progress into a routine.' },
      background: '#1D4739',
      layout: 'offset',
      decorations: [cameo('silly', 0.775, 0.205, 0.20, 10)],
    },
    {
      kind: 'screenshot',
      id: 'paper-trade',
      flow: 'store-04-paper-trade',
      headline: { 'en-US': 'Practice without risk' },
      subhead: {
        'en-US': 'A simulated wallet. No deposits, withdrawals, or real-money trades.',
      },
      background: '#1B4C3E',
      layout: 'tilt-right',
      // Larger and lower than the other cameos: Atlas reads as watching the chart beside him,
      // which is the point of the tile, rather than hovering unrelated in a corner.
      decorations: [cameo('watching', 0.025, 0.545, 0.26, -9)],
    },
    {
      kind: 'screenshot',
      id: 'atlas',
      flow: 'store-05-atlas',
      headline: { 'en-US': 'Meet your money coach' },
      subhead: { 'en-US': 'Atlas makes intimidating ideas feel learnable, one calm step at a time.' },
      background: '#4A2A52',
      layout: 'copy-below',
      decorations: [cameo('proud', 0.845, 0.80, 0.18, -11)],
    },
  ],
};

export default config;
