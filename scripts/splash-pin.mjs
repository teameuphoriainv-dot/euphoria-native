/**
 * The launch screen must not advertise Expo.
 *
 * `assets/images/splash-icon.png` was the framework template's own chevron mark, white on
 * transparent. Nobody looked at it, because opened in any viewer with a white background it
 * renders as an empty square — it only becomes legible composited onto #09090D. So the file read
 * as "some asset we need" rather than "another company's logo", and shipped on every App Store
 * build from the April launch onward. Five months of cold starts opened on the Expo mark.
 *
 * docs/status/PROGRESS.md made it worse by listing the file under **KEEP** during an orphan-asset
 * sweep. The audit that should have caught it instead wrote down that it was load-bearing.
 *
 * The fix is subtractive: with no `image`, expo-splash-screen generates a storyboard that is the
 * background colour alone, and #09090D is exactly `theme.background`, so the launch screen and the
 * first frame of /welcome are the same colour and the handoff is invisible. That is the whole
 * feature — there is nothing on screen to get wrong.
 *
 * Which is precisely why it needs a pin. A subtractive fix leaves no artefact to notice. Any
 * `npx expo install expo-splash-screen`, any config codegen, any "the splash looks empty, let me
 * add the icon back" will restore the key, and the regression is invisible in review because the
 * diff adds a line that looks like it belongs. The background assertion is here for the same
 * reason: dropping it would fall back to white and flash on every launch of a dark app.
 */
import { readFileSync } from 'node:fs';

const app = JSON.parse(readFileSync('app.json', 'utf8'));
const fail = [];

const plugins = app?.expo?.plugins ?? [];
const entry = plugins.find((p) => Array.isArray(p) && p[0] === 'expo-splash-screen');

if (!entry) {
  fail.push('The expo-splash-screen plugin entry is gone — the launch screen is unconfigured.');
} else {
  const cfg = entry[1] ?? {};

  if ('image' in cfg)
    fail.push(
      `expo-splash-screen has an "image" again (${String(cfg.image)}). The launch screen is the ` +
        'background colour only. If this is a real Euphoria mark, delete this pin deliberately — ' +
        'do not let it back in as a template default.',
    );

  if ('imageWidth' in cfg)
    fail.push('expo-splash-screen has an "imageWidth" — it only has meaning alongside an image.');

  if (cfg.backgroundColor !== '#09090D')
    fail.push(
      `splash backgroundColor is ${String(cfg.backgroundColor)}, not #09090D. It must equal ` +
        'theme.background or the launch screen flashes a different colour into /welcome.',
    );
}

/*
 * The asset itself, not just the reference. Leaving the PNG on disk is how the reference comes
 * back: the next person to see an empty-looking splash finds a splash-icon.png sitting in assets
 * and reasonably concludes it was dropped by accident.
 */
let orphan = false;
try {
  readFileSync('assets/images/splash-icon.png');
  orphan = true;
} catch {
  /* absent is the expected state */
}
if (orphan)
  fail.push(
    'assets/images/splash-icon.png still exists. Nothing references it, and its presence invites ' +
      'someone to wire it back up.',
  );

if (fail.length) {
  console.error('splash-pin: the launch screen is not clean.');
  fail.forEach((f) => console.error('  ' + f));
  process.exit(1);
}
console.log('splash-pin: OK — launch screen is #09090D with no image.');
