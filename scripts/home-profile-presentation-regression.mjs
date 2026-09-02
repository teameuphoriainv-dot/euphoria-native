import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const fail = (message) => {
  console.error(`home/profile presentation regression: FAIL — ${message}`);
  process.exitCode = 1;
};
const requireMatch = (source, pattern, message) => {
  if (!pattern.test(source)) fail(message);
};
const forbidMatch = (source, pattern, message) => {
  if (pattern.test(source)) fail(message);
};

const home = read('src/app/(tabs)/home.tsx');
const tabs = read('src/app/(tabs)/_layout.tsx');
const profile = read('src/app/you.tsx');
const banner = read('src/components/profile-banner.tsx');
const settings = read('src/app/settings/[section].tsx');
const lesson = read('src/app/lesson.tsx');
const warmup = read('src/components/lesson-warmup.tsx');

requireMatch(tabs, /Tabs\.Screen name="games"/, 'Games must remain a first-class tab');
requireMatch(home, /import \{[\s\S]*?\bcontroller\b[\s\S]*?\} from '@\/lib\/pixel';/, 'Home game quest art must import the controller binding');
requireMatch(home, /game: controller/, 'Home game quest art must use the imported controller binding');
/*
 * THE GAMES CARD ASSERTION WAS REMOVED ON 2026-09-01, at the owner's direct instruction:
 * "remove the games button and CTA completely from the main page".
 *
 * The two checks above it stay and are the ones that still matter. Games remains a FIRST-CLASS
 * TAB, so unlike the note this replaces it is not losing its only route in — it is permanently on
 * screen, one tap away, which is precisely why a card duplicating it was the clutter being cut.
 * `game: controller` also stays: the quest art still uses that binding.
 */
forbidMatch(profile, /label: 'Games'/, 'Profile must not duplicate the Games tab');
forbidMatch(profile, /label: 'Ask Atlas'/, 'Profile must not duplicate the persistent Atlas entry');

/*
 * THE HOME SEQUENCE, rewritten 2026-09-01. The previous list — week / league / trial / hero /
 * quests / path / Games — was the layout the owner asked to be restructured away from, with a
 * Brilliant home screen supplied as the reference. Asserting it here would have made this pin
 * fail for the right reason on the wrong screen.
 *
 * What replaces it is the same KIND of assertion: the lesson must come before the things that are
 * only status, because getting you into the next lesson is the screen's whole job. See
 * scripts/home-layout-revert-regression.mjs, which pins the removals as absences.
 */
const homeOrder = [
  ['greeting', 'Hey there'],
  ['streak card', 'styles.streakCard'],
  ['lesson card', 'styles.hero'],
  ['daily quests', 'TODAY&apos;S QUESTS'],
  ['learning pathway', 'YOUR PATH'],
];
let previousHomeIndex = -1;
for (const [label, token] of homeOrder) {
  const index = home.indexOf(token);
  if (index < 0) fail(`Home must retain ${label}`);
  else if (index <= previousHomeIndex) fail(`Home must keep ${label} in the owner-approved ordering`);
  previousHomeIndex = index;
}

requireMatch(profile, /const bannerId = useApp\(\(s\) => s\.bannerId\)/, 'Profile must subscribe to the selected banner');
requireMatch(profile, /<ProfileBanner\b[\s\S]*?bannerId=\{bannerId\}/, 'Profile must render the selected ProfileBanner');
requireMatch(banner, /customContent\?: boolean/, 'ProfileBanner must accept the richer profile identity content');
requireMatch(banner, /minHeight: height/, 'ProfileBanner must grow instead of clipping Dynamic Type');

forbidMatch(profile, /planTier === 'expired' \? 'FREE'/, 'Expired status chip must not call a locked plan Free');
forbidMatch(profile, /planTier === 'expired' \? 'Free'/, 'Expired plan heading must state that the trial ended');
requireMatch(profile, /Your trial has ended\./, 'Expired plan copy must clearly name the state');
requireMatch(profile, /label: 'Paper trading', value: 'Included'/, 'Trial grants must describe an allowance that is actually available');
requireMatch(profile, /fontScale >= 1\.8/, 'Profile grants must switch layout at accessibility text sizes');
requireMatch(profile, /styles\.grantsLargeText/, 'Profile grants need a vertical accessibility layout');

requireMatch(settings, /https:\/\/euphoriainv\.com\/privacy/, 'Settings must retain the live privacy route');
requireMatch(settings, /https:\/\/euphoriainv\.com\/terms/, 'Settings must retain the live terms route');

requireMatch(lesson, /<LessonWarmup[\s\S]*?courseId=\{courseId\}[\s\S]*?title=\{lesson\.title\}[\s\S]*?onDone=\{advance\}/, 'Lesson start must render the canonical web Warmup');
forbidMatch(warmup, /PRIMERS|how are you feeling|focus check/i, 'Retired mood primers must not return');
requireMatch(warmup, /buildRecallQuiz/, 'Warmup must use completed-lesson recall');
requireMatch(warmup, /PixelSpriteView sprite=\{flameSprite\} scale=\{9\} play="loop"/, 'Warmup must retain the canonical 144px pixel flame');
forbidMatch(warmup, /RadialGradient|warmup-flame/, 'Warmup flame must not regain the retired halo');

if (!process.exitCode) console.log('home/profile presentation regression: PASS');
