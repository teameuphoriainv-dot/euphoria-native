#!/usr/bin/env node
/**
 * Pins the Home sequence.
 *
 * HISTORY, because this file previously asserted the OPPOSITE and deleting that quietly would
 * lose the reason. It was written to hold a "restored" sequence — week strip, league, trial, hero,
 * quests, path, Games — after an earlier hero-first experiment was rejected by the owner.
 *
 * On 2026-09-01 the owner asked for the restructure directly and supplied a Brilliant home screen
 * as the reference: remove Atlas and Ask Atlas, remove the coin pill, remove the league card,
 * remove the Games card, fold the week strip and goal bar into one streak rectangle, make the
 * quests collapsible, make the lesson card big with no Start button, and move the trial strip to
 * the Learn tab. That supersedes the sequence this file used to defend.
 *
 * So the checkpoints are rewritten rather than removed: Home still deserves a pin, and a pin that
 * asserts a layout the app no longer has is worse than none — it fails for the right reason on the
 * wrong screen and teaches whoever reads it that the old order is still wanted.
 *
 * NOTE: this script is NOT registered in `npm run check` and was not before this edit either, so
 * it has never gated a commit. Left unregistered deliberately — that is the owner's call to make,
 * not one to slip in during a merge.
 */
import { readFileSync } from 'node:fs';

const home = readFileSync(new URL('../src/app/(tabs)/home.tsx', import.meta.url), 'utf8');

/* ORDER IS THE ASSERTION. The screen's job is to get you into the next lesson, so the lesson card
   must come before the things that are merely status. */
const checkpoints = [
  ['greeting', 'Hey there'],
  ['streak card', 'styles.streakCard'],
  ['next-lesson card', 'styles.hero'],
  ['daily quests', 'TODAY&apos;S QUESTS'],
  ['course pathway', 'YOUR PATH'],
];

let previous = -1;
for (const [label, token] of checkpoints) {
  const at = home.indexOf(token);
  if (at < 0) throw new Error(`Home layout is missing ${label}`);
  if (at <= previous) throw new Error(`Home layout moved ${label} out of the requested sequence`);
  previous = at;
}

for (const [label, pattern] of [
  ['week day cells inside the streak card', /<DayCheck\b/],
  ['lesson art', /<LessonArt\b/],
  ['quest rows', /quests\.map\(/],
  ['stacked course cards', /styles\.pathCard/],
  ['collapsible quests', /const showQuests = |questsOpen/],
]) {
  if (!pattern.test(home)) throw new Error(`Home layout lost ${label}`);
}

/* THE REMOVALS, asserted as absences. Without these the pin would pass again the moment any of
   them drifted back, which is exactly how the screen accumulated eleven blocks the first time. */
for (const [label, pattern] of [
  ['the Atlas mascot button', /<Atlas\b/],
  ['the Ask Atlas entry', /openAtlasChat/],
  ['the coin pill', /coin as coinSprite|styles\.pill\b/],
  ['the league card', /<LeagueCrest\b|router\.push\('\/league'\)/],
  ['the Games card', /router\.push\('\/games'\)/],
  ['the trial strip (it lives on Learn now)', /planTier === 'trial'/],
  ['the horizontal course rail', /<CourseRailCard\b/],
]) {
  if (pattern.test(home)) throw new Error(`Home has ${label} back — it was removed on 2026-09-01`);
}

/* The trial strip was MOVED, not deleted. If it is absent from both screens it has been lost. */
const learn = readFileSync(new URL('../src/app/(tabs)/learn.tsx', import.meta.url), 'utf8');
if (!/planTier === 'trial'/.test(learn)) {
  throw new Error('the trial strip is gone from Learn — it was moved there from Home, not deleted');
}

console.log('home layout ok — greeting → streak card → lesson → quests → path; '
  + 'Atlas, coins, league, Games and the rail stay off it, and the trial strip is on Learn');
