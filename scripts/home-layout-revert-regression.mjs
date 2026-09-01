#!/usr/bin/env node
/** Pins the owner-requested Home sequence restored after the hero-first experiment was rejected. */
import { readFileSync } from 'node:fs';

const home = readFileSync(new URL('../src/app/(tabs)/home.tsx', import.meta.url), 'utf8');
const checkpoints = [
  ['week/status row', 'Week row'],
  ['league status', "router.push('/league')"],
  ['trial status', "planTier === 'trial'"],
  ['next-lesson hero', 'Card elevated style={[styles.hero'],
  ['daily quests', 'TODAY&apos;S QUESTS'],
  ['course pathway', 'YOUR PATH'],
  ['Games card', "router.push('/games')"],
];

let previous = -1;
for (const [label, token] of checkpoints) {
  const at = home.indexOf(token);
  if (at < 0) throw new Error(`Home layout is missing ${label}`);
  if (at <= previous) throw new Error(`Home layout moved ${label} out of the restored sequence`);
  previous = at;
}

for (const [label, pattern] of [
  ['week day cells', /<DayCheck\b/],
  ['league crest', /<LeagueCrest\b/],
  ['lesson art', /<LessonArt\b/],
  ['quest rows', /quests\.map\(/],
  ['course cards', /<CourseRailCard\b/],
  ['Games card style', /style=\{styles\.gamesCard\}/],
]) {
  if (!pattern.test(home)) throw new Error(`Home layout lost ${label}`);
}

console.log('home layout revert ok — week/league/trial → hero → quests → path → Games');
