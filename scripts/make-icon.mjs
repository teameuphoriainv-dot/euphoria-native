/**
 * Build the Euphoria app icon.
 *
 * WHY THIS EXISTS: `assets/expo.icon` shipped the EXPO STARTER TEMPLATE — `expo-symbol 2.svg` over
 * a grid, on Expo blue (`extended-srgb:0.0,0.478,1.0`). The built app's Info.plist named its icon
 * `expo` / `expo60x60`. The app would have gone to the App Store wearing Expo's logo.
 *
 * THE SOURCE ART is the 1024 icon already on App Store listing 6761808087, taken from the retired
 * Capacitor build so the store page and the home screen agree. It is a light-violet four-ring mark
 * on SOLID BLACK — which is exactly wrong for a layered icon, where the system draws the background
 * and the layer must be transparent around the mark. So the black has to become alpha.
 *
 * HOW THE ALPHA IS DERIVED: per-pixel `alpha = max(r,g,b)`, RGB left untouched. The mark is light
 * (violet fill, white outline) on near-black, so the channel maximum already separates figure from
 * ground, and it does it CONTINUOUSLY — the soft halo in the source art fades out instead of
 * leaving a hard matte line. A binary threshold would have cut a jagged edge through that halo.
 *
 * Run: node scripts/make-icon.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const sharp = (await import('sharp')).default;

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'refs/brand/euphoria-mark-1024.png');
const ICON_DIR = path.join(ROOT, 'assets/euphoria.icon');
const ASSETS = path.join(ICON_DIR, 'Assets');

/** Deep violet. Same value as the store-screenshot gradient's top stop (#2E1B52), so the icon and
 *  the App Store creative are lit the same way. The mark is light, so a DARK ground is what makes
 *  it read at 60pt — a violet-on-violet icon would turn to mush at springboard size. */
const BG = { r: 0x2e, g: 0x1b, b: 0x52 };
const srgb = (c) => (c / 255).toFixed(5);

fs.mkdirSync(ASSETS, { recursive: true });

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const px = info.width * info.height;
const out = Buffer.alloc(px * 4);
for (let i = 0; i < px; i++) {
  const r = data[i * info.channels];
  const g = data[i * info.channels + 1];
  const b = data[i * info.channels + 2];
  out[i * 4] = r;
  out[i * 4 + 1] = g;
  out[i * 4 + 2] = b;
  out[i * 4 + 3] = Math.max(r, g, b);
}

/**
 * The inset is baked into the PNG rather than expressed as a layer `position`.
 *
 * `position: { scale }` WITHOUT `translation-in-points` crashes actool outright — not a validation
 * error, an uncaught nil: `-[__NSPlaceholderArray initWithObjects:count:]: attempt to insert nil
 * object` inside `selectCatalogIconComposerItemsFromCollection`. The template's own second layer
 * carries no `position` key at all, so an absent position is the shape known to compile. Padding
 * transparent margin into the image gets the same look without depending on an undocumented schema.
 */
const INSET = 0.82;
const markSize = Math.round(info.width * INSET);
const pad = Math.round((info.width - markSize) / 2);
const marked = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png()
  .toBuffer();

await sharp({
  create: { width: info.width, height: info.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([{ input: await sharp(marked).resize(markSize, markSize).toBuffer(), top: pad, left: pad }])
  .png()
  .toFile(path.join(ASSETS, 'euphoria-mark.png'));

const iconJson = {
  fill: {
    'automatic-gradient': `extended-srgb:${srgb(BG.r)},${srgb(BG.g)},${srgb(BG.b)},1.00000`,
  },
  groups: [
    {
      layers: [{ 'image-name': 'euphoria-mark.png', name: 'euphoria-mark' }],
      shadow: { kind: 'neutral', opacity: 0.5 },
      translucency: { enabled: true, value: 0.5 },
    },
  ],
  'supported-platforms': { circles: ['watchOS'], squares: 'shared' },
};
fs.writeFileSync(path.join(ICON_DIR, 'icon.json'), `${JSON.stringify(iconJson, null, 2)}\n`);

// The flat square for Android and web, which have no layered-icon concept. Same mark, same ground,
// so all three platforms show one icon.
const bg = await sharp({
  create: { width: 1024, height: 1024, channels: 4, background: { ...BG, alpha: 1 } },
}).png().toBuffer();
const mark = await sharp(path.join(ASSETS, 'euphoria-mark.png')).resize(840, 840, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
await sharp(bg).composite([{ input: mark, top: 92, left: 92 }]).png().toFile(path.join(ROOT, 'assets/images/icon.png'));

// Android adaptive foreground is drawn over its own background layer, so it stays transparent.
await sharp(path.join(ASSETS, 'euphoria-mark.png'))
  .resize(432, 432, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .extend({ top: 40, bottom: 40, left: 40, right: 40, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .resize(432, 432)
  .png()
  .toFile(path.join(ROOT, 'assets/images/android-icon-foreground.png'));
await sharp({ create: { width: 432, height: 432, channels: 4, background: { ...BG, alpha: 1 } } })
  .png()
  .toFile(path.join(ROOT, 'assets/images/android-icon-background.png'));

console.log('wrote assets/euphoria.icon/{icon.json,Assets/euphoria-mark.png}');
console.log('wrote assets/images/icon.png, android-icon-foreground.png, android-icon-background.png');
console.log(`gradient = #${[BG.r, BG.g, BG.b].map((c) => c.toString(16).padStart(2, '0')).join('')}`);
