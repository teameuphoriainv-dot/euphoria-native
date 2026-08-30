import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const configDir = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(configDir, '..');

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
    background: '#241431',
    headlineColor: '#FFFFFF',
    subheadColor: '#D2C6DB',
    fontFamily: '"DM Sans", -apple-system, system-ui, sans-serif',
    copyHeightRatio: 0.23,
    deviceWidthRatio: 0.84,
    layout: 'classic',
  },
  store: {
    name: 'Euphoria: Learn Investing',
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
  scenes: [
    {
      kind: 'screenshot',
      id: 'explain',
      flow: 'store-01-explain',
      headline: { 'en-US': 'See the why' },
      subhead: { 'en-US': 'Tap a visual and Atlas explains what the numbers mean.' },
      background: '#241431',
      layout: 'hero',
    },
    {
      kind: 'screenshot',
      id: 'home',
      flow: 'store-02-home',
      headline: { 'en-US': 'Build a money habit' },
      subhead: { 'en-US': 'Daily goals, streaks, and quests turn progress into a routine.' },
      background: '#132720',
      layout: 'offset',
    },
    {
      kind: 'screenshot',
      id: 'path',
      flow: 'store-03-path',
      headline: { 'en-US': '300 lessons. One path.' },
      subhead: { 'en-US': 'Go from first principles to wealth management at your pace.' },
      background: '#19233A',
      layout: 'classic',
    },
    {
      kind: 'screenshot',
      id: 'paper-trade',
      flow: 'store-04-paper-trade',
      headline: { 'en-US': 'Practice without risk' },
      subhead: {
        'en-US': 'A simulated wallet. No deposits, withdrawals, or real-money trades.',
      },
      background: '#102722',
      layout: 'tilt-right',
    },
    {
      kind: 'screenshot',
      id: 'atlas',
      flow: 'store-05-atlas',
      headline: { 'en-US': 'Meet your money coach' },
      subhead: { 'en-US': 'Atlas makes intimidating ideas feel learnable, one calm step at a time.' },
      background: '#2B172F',
      layout: 'copy-below',
    },
  ],
};

export default config;
