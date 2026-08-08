#!/usr/bin/env node
/**
 * UNIT 16c — build the App Store screenshots.
 *
 * Reproducible on purpose. The first three were rendered from a throwaway `node -e`, which is fine
 * once and useless the moment the copy changes or a screen is redesigned. This regenerates the whole
 * set from device captures in one command.
 *
 *   ./scripts/sim.sh shot refs/store/dev-<name>.png      # capture, once per screen
 *   node scripts/store-shots.mjs                          # render every shot + a contact sheet
 *
 * ── LAYOUT IS NOT A GUESS ──────────────────────────────────────────────────────────────────────
 * One phone, headline above, solid saturated brand background, no photography and no badges. That
 * is 13 of 15 across the store creative pulled in §22 C72. Size is 1290 × 2796, Apple's 6.9-inch
 * requirement.
 *
 * ── THE FONT, AND WHY THIS FILE CONFIGURES ONE ─────────────────────────────────────────────────
 * The first render fell back to a system sans because `fc-list` had no Nunito, and it looked close
 * enough to ship — which is exactly why it needed catching. librsvg resolves fonts through
 * fontconfig, so this writes a SCOPED fontconfig pointing at the Nunito the app already bundles in
 * node_modules. Nothing is installed into ~/Library/Fonts: a screenshot script has no business
 * changing the machine it runs on.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'refs/store');
const NUNITO_DIR = path.join(ROOT, 'node_modules/@expo-google-fonts/nunito');

// ── scoped fontconfig ─────────────────────────────────────────────────────────────────────────
const fcDir = fs.mkdtempSync(path.join(os.tmpdir(), 'euphoria-fc-'));
fs.writeFileSync(
  path.join(fcDir, 'fonts.conf'),
  `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig>
  <dir>${NUNITO_DIR}</dir>
  <dir>/System/Library/Fonts</dir>
  <cachedir>${fcDir}/cache</cachedir>
</fontconfig>`,
);
process.env.FONTCONFIG_FILE = path.join(fcDir, 'fonts.conf');
process.env.FONTCONFIG_PATH = fcDir;

const sharp = (await import('sharp')).default;

const W = 1290;
const H = 2796;
const PHONE_W = 980;
const PHONE_TOP = 560;
const FONT = 'Nunito';

/**
 * SEVEN shots, not ten. Apple permits up to ten; it does not reward padding. Shots 1–3 are the set
 * that has to survive the search-results crop on its own, per the sequencing decision taken with
 * the user, and 4–7 add depth for anyone who opens the product page.
 */
const SHOTS = [
  { src: 'dev-home.png', out: 'store-1.png', l1: 'Ten minutes a day.', l2: 'Real money sense.' },
  { src: 'dev-learn.png', out: 'store-2.png', l1: 'A lesson a day,', l2: 'and a streak to keep it.' },
  { src: 'dev-trade.png', out: 'store-3.png', l1: 'Practice investing.', l2: 'Risk nothing.' },
  { src: 'dev-lesson.png', out: 'store-4.png', l1: 'Short lessons that', l2: 'actually explain why.' },
  { src: 'dev-digest.png', out: 'store-5.png', l1: 'One idea a day.', l2: 'Read it in two minutes.' },
  { src: 'dev-you.png', out: 'store-6.png', l1: 'Watch it add up.', l2: 'XP, streaks, levels.' },
  { src: 'dev-league.png', out: 'store-7.png', l1: 'Climb the league.', l2: 'Nobody learns alone.' },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function render(shot) {
  const srcPath = path.join(OUT, shot.src);
  if (!fs.existsSync(srcPath)) return { skipped: shot.src };

  const meta = await sharp(srcPath).metadata();
  const ph = Math.round((PHONE_W * meta.height) / meta.width);
  const mask = Buffer.from(
    `<svg width="${PHONE_W}" height="${ph}"><rect width="${PHONE_W}" height="${ph}" rx="64" ry="64" fill="#fff"/></svg>`,
  );
  const phone = await sharp(srcPath)
    .resize(PHONE_W)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const bg = `<svg width="${W}" height="${H}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2E1B52"/><stop offset="100%" stop-color="#120A1F"/>
    </linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <text x="${W / 2}" y="300" text-anchor="middle" font-family="${FONT}" font-size="96" font-weight="800" fill="#FFFFFF">${esc(shot.l1)}</text>
    <text x="${W / 2}" y="420" text-anchor="middle" font-family="${FONT}" font-size="96" font-weight="800" fill="#C89CF5">${esc(shot.l2)}</text>
  </svg>`;

  await sharp(Buffer.from(bg))
    .composite([{ input: phone, top: PHONE_TOP, left: Math.round((W - PHONE_W) / 2) }])
    .png()
    .toFile(path.join(OUT, shot.out));
  return { out: shot.out, bottom: PHONE_TOP + ph };
}

const results = [];
for (const s of SHOTS) results.push(await render(s));

const made = results.filter((r) => r.out);
for (const r of made) {
  // The phone must not run off the canvas. A silent overflow is how a shot ships cropped.
  if (r.bottom > H) console.error(`[store-shots] ${r.out} overflows: phone ends at ${r.bottom} of ${H}`);
  console.log(`  ${r.out}  phone ends at ${r.bottom}/${H}`);
}
for (const r of results.filter((x) => x.skipped)) console.log(`  SKIPPED (no capture): ${r.skipped}`);

// Contact sheet — the only way to judge whether the set reads as one set.
if (made.length) {
  const thumbs = await Promise.all(made.map((r) => sharp(path.join(OUT, r.out)).resize(360).toBuffer()));
  const th = Math.round((360 * H) / W);
  await sharp({ create: { width: 380 * made.length, height: th, channels: 3, background: '#000' } })
    .composite(thumbs.map((b, i) => ({ input: b, top: 0, left: i * 380 })))
    .png()
    .toFile(path.join(OUT, 'store-sheet.png'));
  console.log(`  store-sheet.png (${made.length} shots)`);
}

try {
  const n = execFileSync('fc-list', [], { env: process.env }).toString().toLowerCase().split('\n').filter((l) => l.includes('nunito')).length;
  console.log(n > 0 ? `  font: Nunito visible to fontconfig (${n} faces)` : '  font: WARNING — Nunito NOT resolved, headlines fell back');
} catch {
  console.log('  font: fc-list unavailable; could not confirm Nunito resolved');
}
