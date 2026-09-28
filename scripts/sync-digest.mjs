// =============================================================================
// sync-digest.mjs — LINKED Digest sync:  WEB  ==>  NATIVE
// =============================================================================
//
//   THE WEB REPO IS THE PERMANENT SOURCE OF TRUTH.
//
//   Everything this script writes is GENERATED. NEVER hand-edit a synced file. Any edit you make
//   there is destroyed the next time someone runs this script. To change Digest content, edit it
//   in the WEB repo (src/features/digest/content/**), then re-run ./scripts/sync-digest.sh here.
//
//   Usage (through the shell entry point, which registers the TS resolve hook):
//     ./scripts/sync-digest.sh                   # defaults to ../euphoriaweb-master
//     ./scripts/sync-digest.sh /path/to/web      # explicit web repo root
//     ./scripts/sync-digest.sh --dry-run [path]  # validate only, write nothing
//
//   The script is IDEMPOTENT: a file is only rewritten when its bytes would change.
//
//   Files this script OWNS (rewritten every run):
//     src/lib/digest-content.ts    post metadata + the content types
//     src/lib/digest-bodies.ts     body, key points, charts and sources (lazy, reader only)
//     src/lib/digest-photos.ts     require() map of the photo heroes + credit line + alt text
//     assets/digest/<slug>.jpg     photo heroes, downscaled for the app
//   and it DELETES src/lib/digest-heroes.ts, the SVG cover/figure registry the photos replaced.
//
//   Files this script does NOT touch (hand-written, safe to edit):
//     src/components/digest-body.tsx    the markdown renderer
//     src/components/digest-chart.tsx   the chart renderer
//     src/app/(tabs)/digest.tsx          the Digest tab
//     src/app/digest/[slug].tsx          the article reader
//     src/lib/digest-lessons.ts          slug -> lesson map (check-digest-lessons.mjs pins it)
//
// WHY NODE AND NOT REGEX. The first version of this sync pulled fields out of the post files with
// one regex per field. That stopped working the moment posts grew nested data (charts, sources,
// key points), and a regex that silently misses a field is exactly the "plausible output" failure
// CONSTITUTION §6.3 names. Node 25 strips TypeScript natively, so each post file is IMPORTED and
// the sync sees the same object the web bundle does.
// =============================================================================

import { Buffer } from 'node:buffer';
import { execFileSync } from 'node:child_process';
import {
  existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const NATIVE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const WEB_ROOT = resolve(args.find((a) => !a.startsWith('--')) ?? join(NATIVE_ROOT, '../euphoriaweb-master'));

const SRC = join(WEB_ROOT, 'src/features/digest');
const LIB = join(NATIVE_ROOT, 'src/lib');
const PHOTO_OUT = join(NATIVE_ROOT, 'assets/digest');

/*
 * The photo budget. Every byte ships inside the App Store binary for every user, read or not, so
 * the sync refuses to grow past this rather than letting the bundle creep. Raising it is a
 * decision, not a default.
 *
 * QUALITY 60, NOT 72 (owner-approved 2026-09-28). At 900px/q72 the first 51 photos measured
 * 5.46MB, which projected to ~7.2MB once the library reached 67 posts. 900px is kept because the
 * article cover draws ~358pt wide (~1070 physical px at 3x); the saving comes from JPEG quality,
 * which at phone size is not visible on photographs.
 */
const PHOTO_BUDGET_BYTES = 6 * 1024 * 1024;
const PHOTO_WIDTH = 900;
const PHOTO_QUALITY = 60;

const die = (msg) => {
  console.error(`\n  SYNC FAILED\n  -----------\n  ${msg}\n`);
  process.exit(1);
};

// --- 1. validate the source of truth ----------------------------------------------------------

if (!existsSync(WEB_ROOT)) {
  die(`Web repo not found at: ${WEB_ROOT}\n  Pass its path explicitly:   ./scripts/sync-digest.sh /path/to/euphoriaweb-master`);
}
for (const need of ['content/posts', 'content/types.ts', 'content/index.ts', 'assets/photos/credits.json', 'content/photos.ts']) {
  if (!existsSync(join(SRC, need))) die(`Found the web repo at ${WEB_ROOT} but not ${join(SRC, need)}.\n  Has Digest moved in web? Update this script.`);
}

console.log('digest sync');
console.log(`  source of truth : ${join(SRC, 'content')}`);
console.log(`  destination     : ${LIB}${DRY ? '  (dry run, nothing written)' : ''}`);
console.log('');

// --- 2. categories: the web's FIXED display order ---------------------------------------------

/*
 * Read from content/index.ts rather than derived from the posts. Deriving it re-ordered the
 * filter every time a post was added (the web learned this first and says so beside the array).
 */
const indexSrc = readFileSync(join(SRC, 'content/index.ts'), 'utf8');
const orderBlock = indexSrc.match(/CATEGORY_ORDER[^=]*=\s*\[([\s\S]*?)\]/);
if (!orderBlock) die('content/index.ts: could not find CATEGORY_ORDER. Upstream shape changed.');
const CATEGORY_ORDER = [...orderBlock[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
const typesSrc = readFileSync(join(SRC, 'content/types.ts'), 'utf8');
const unionBlock = typesSrc.match(/type DigestCategory\s*=([\s\S]*?);/);
if (!unionBlock) die('content/types.ts: could not find the DigestCategory union.');
const UNION = [...unionBlock[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
const orderGap = UNION.filter((c) => !CATEGORY_ORDER.includes(c));
if (orderGap.length) die(`DigestCategory has ${orderGap.join(', ')} but CATEGORY_ORDER does not, so web never shows them in its filter.`);

// --- 3. photos: credits + alt text ------------------------------------------------------------

const credits = JSON.parse(readFileSync(join(SRC, 'assets/photos/credits.json'), 'utf8'));
// Alt text lives in photos.ts behind import.meta.glob, which Node cannot run, so it is parsed the
// same way the web's own prerender-digest.mjs parses it.
const photosTs = readFileSync(join(SRC, 'content/photos.ts'), 'utf8');
const altBlock = photosTs.match(/const PHOTO_ALTS[^{]*\{([\s\S]*?)\n\};/);
const photoAlts = Object.fromEntries(
  [...(altBlock?.[1] ?? '').matchAll(/"([^"]+)":\s*"((?:[^"\\]|\\.)*)"/g)].map((m) => [m[1], JSON.parse(`"${m[2]}"`)]),
);

/** Mirror of the web's photoCreditLine() in content/photos.ts, character for character. */
function creditLine(c) {
  if (c.license === 'Pexels License') return 'Photo: Pexels';
  // Our own composed image (app screenshots), not a photo anyone licensed to us.
  if (c.license === 'Owned') return 'Image: Euphoria';
  const creator = c.creator && c.creator !== 'Unknown' ? c.creator : 'Wikimedia Commons';
  return `Photo: ${creator} (${c.license})`;
}

// --- 4. import every post ----------------------------------------------------------------------

/*
 * content/posts is shared with the web site. content/posts-app is the older APP-ONLY directory;
 * it no longer exists on master (app-only posts now carry `appOnly: true` in content/posts), but a
 * file there is still honoured and treated as app-only, so reviving the directory cannot silently
 * drop posts.
 */
const POST_DIRS = ['content/posts', 'content/posts-app'];
const files = POST_DIRS.flatMap((d) => {
  const abs = join(SRC, d);
  if (!existsSync(abs)) return [];
  return readdirSync(abs).filter((f) => f.endsWith('.ts')).sort().map((f) => ({ dir: d, f, abs: join(abs, f) }));
});
if (!files.length) die(`No .ts post files found in ${join(SRC, 'content/posts')}`);

const problems = [];
const warnings = [];
const posts = [];
const drafts = [];
const seen = new Map();

for (const { dir, f, abs } of files) {
  let mod;
  try {
    mod = await import(pathToFileURL(abs).href);
  } catch (e) {
    die(`${dir}/${f}: could not be imported (${e.message}).`);
  }
  const p = mod.post;
  if (!p || typeof p !== 'object') {
    problems.push(`${dir}/${f}: exports no \`post\``);
    continue;
  }
  if (p.draft === true) {
    // Hidden everywhere, so it never reaches the app either. Named in the log so a post that
    // "vanished" from the app can be traced to its flag in one read.
    drafts.push(p.slug ?? f);
    continue;
  }
  const where = `${p.slug ?? f}`;
  const need = (k, ok) => { if (!ok) problems.push(`${where}: missing or invalid "${k}"`); };
  need('slug', typeof p.slug === 'string' && /^[a-z0-9-]+$/.test(p.slug));
  need('title', typeof p.title === 'string' && p.title.trim());
  need('excerpt', typeof p.excerpt === 'string' && p.excerpt.trim());
  need('date', typeof p.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p.date));
  need('readMinutes', Number.isInteger(p.readMinutes) && p.readMinutes > 0);
  need('body', typeof p.body === 'string' && p.body.trim());
  if (!CATEGORY_ORDER.includes(p.category)) problems.push(`${where}: category "${p.category}" is not in the web's CATEGORY_ORDER`);
  if (typeof p.slug !== 'string' || typeof p.body !== 'string') continue;

  if (seen.has(p.slug)) problems.push(`duplicate slug "${p.slug}" in ${seen.get(p.slug)} and ${dir}/${f}`);
  seen.set(p.slug, `${dir}/${f}`);

  posts.push({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    date: p.date,
    readMinutes: p.readMinutes,
    appOnly: p.appOnly === true || dir.endsWith('posts-app'),
    body: p.body,
    keyPoints: p.keyPoints,
    charts: p.charts,
    sources: p.sources,
  });
}
posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));

// --- 5. content verification ------------------------------------------------------------------

/*
 * The block grammar, identical to web DigestMarkdown and native digest-body.tsx: blocks are split
 * on blank lines, and a block's FIRST characters decide its kind. Anything the native renderer
 * cannot draw fails the sync here, because the renderer's fallback for an unknown block is a
 * paragraph, which would show raw markup to the reader rather than an error to us.
 */
const UNITS = new Set(['usd', 'usdK', 'usdM', 'usdB', 'pct', 'plain']);
const EM = /—/; // any em dash; the sync has rejected them since v1 (CONSTITUTION §4)
const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

function checkProse(where, text) {
  if (typeof text !== 'string') return;
  if (EM.test(text)) problems.push(`${where}: em dash, rewrite it in the web post`);
  for (const m of text.matchAll(LINK)) {
    if (!/^https?:\/\//.test(m[2])) problems.push(`${where}: link "${m[1]}" -> "${m[2]}" is not http(s); the renderer only opens web links`);
  }
}

function checkChart(where, c) {
  if (!c || typeof c !== 'object') return problems.push(`${where}: not an object`);
  if (!['line', 'bar', 'stack'].includes(c.type)) problems.push(`${where}: type "${c.type}" is not line | bar | stack`);
  if (typeof c.title !== 'string' || !c.title.trim()) problems.push(`${where}: missing title`);
  if (!Array.isArray(c.labels) || !c.labels.length) return problems.push(`${where}: no labels`);
  if (!Array.isArray(c.series) || !c.series.length) return problems.push(`${where}: no series`);
  // Four fixed colours and the web never cycles them, so a fifth series would repeat a colour and
  // two lines would read as one.
  if (c.series.length > 4) problems.push(`${where}: ${c.series.length} series, the palette has 4`);
  for (const s of c.series) {
    if (typeof s.name !== 'string' || !s.name) problems.push(`${where}: a series has no name`);
    if (!Array.isArray(s.values) || s.values.length !== c.labels.length) {
      problems.push(`${where}: series "${s.name}" has ${s.values?.length} values for ${c.labels.length} labels`);
    } else if (!s.values.every((v) => typeof v === 'number' && Number.isFinite(v))) {
      problems.push(`${where}: series "${s.name}" has a non-numeric value`);
    }
    checkProse(`${where} series name`, s.name);
  }
  if (c.unit !== undefined && !UNITS.has(c.unit)) problems.push(`${where}: unit "${c.unit}" is not one the chart formats`);
  if (c.decimals !== undefined && !(Number.isInteger(c.decimals) && c.decimals >= 0 && c.decimals <= 4)) {
    problems.push(`${where}: decimals must be an integer 0-4`);
  }
  if (c.sourceUrl !== undefined && !/^https?:\/\//.test(c.sourceUrl)) problems.push(`${where}: sourceUrl is not http(s)`);
  for (const k of ['title', 'note', 'source']) checkProse(`${where} ${k}`, c[k]);
  for (const l of c.labels) checkProse(`${where} label`, String(l));
}

for (const p of posts) {
  for (const k of ['title', 'excerpt']) checkProse(`${p.slug} ${k}`, p[k]);

  if (p.keyPoints !== undefined) {
    if (!Array.isArray(p.keyPoints) || !p.keyPoints.every((k) => typeof k === 'string' && k.trim())) {
      problems.push(`${p.slug}: keyPoints must be a list of non-empty strings`);
    } else p.keyPoints.forEach((k, i) => checkProse(`${p.slug} keyPoints[${i}]`, k));
  }
  if (p.sources !== undefined) {
    if (!Array.isArray(p.sources)) problems.push(`${p.slug}: sources must be a list`);
    else for (const s of p.sources) {
      if (!s || typeof s.label !== 'string' || !s.label.trim()) problems.push(`${p.slug}: a source has no label`);
      if (!s || !/^https?:\/\//.test(s.url ?? '')) problems.push(`${p.slug}: source "${s?.label}" has no http(s) url`);
      checkProse(`${p.slug} source`, s?.label);
    }
  }
  const charts = p.charts ?? {};
  for (const [key, c] of Object.entries(charts)) checkChart(`${p.slug} chart "${key}"`, c);

  const used = new Set();
  const blocks = p.body.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  for (const block of blocks) {
    const lines = block.split('\n');
    const head = lines[0];
    const at = `${p.slug} block "${head.slice(0, 48)}"`;
    const chart = block.match(/^\[\[chart:([a-z0-9-]+)\]\]$/);
    if (chart) {
      used.add(chart[1]);
      if (!charts[chart[1]]) problems.push(`${p.slug}: [[chart:${chart[1]}]] has no entry in post.charts`);
      continue;
    }
    if (/^\[\[/.test(block)) { problems.push(`${at}: malformed chart reference, expected [[chart:key]] alone in its block`); continue; }
    if (/^!\[/.test(block) || /!\[[^\]]*\]\([^)]+\)/.test(block)) {
      // The owner asked for the generated cover/figure art to go. Photos replaced heroes; there is
      // no inline figure registry on native any more, so an image reference would render nothing.
      problems.push(`${at}: inline image, the generated figures were removed; delete it or make it a [[chart:key]]`);
      continue;
    }
    if (/^#\s/.test(head) || /^#{4,}\s/.test(head)) { problems.push(`${at}: only ## and ### headings render`); continue; }
    if (/^#{2,3}\s/.test(head)) {
      if (lines.length > 1) problems.push(`${at}: a heading must be alone in its block (web renders the next line as part of the heading)`);
      checkProse(at, block);
      continue;
    }
    if (block.startsWith('::: ')) {
      for (const l of lines) {
        if (!l.startsWith('::: ') || !l.includes(' :: ')) problems.push(`${at}: every stat line must read "::: value :: label"`);
      }
      checkProse(at, block);
      continue;
    }
    if (block.startsWith('>>> ')) {
      if (!head.slice(4).trim()) problems.push(`${at}: a callout needs a title after ">>> "`);
      checkProse(at, block);
      continue;
    }
    if (block.startsWith('> ')) { checkProse(at, block); continue; }
    if (lines.some((l) => l.startsWith('- '))) {
      if (!lines.every((l) => l.startsWith('- '))) problems.push(`${at}: a list block must be only "- " lines (web would print the dashes inside a paragraph)`);
      checkProse(at, block);
      continue;
    }
    if (lines.some((l) => /^\s*\|.*\|\s*$/.test(l))) problems.push(`${at}: markdown tables do not render`);
    if (lines.some((l) => /^\d+[.)]\s/.test(l))) problems.push(`${at}: ordered lists do not render, use "- " lines`);
    if (lines.some((l) => /^(#{1,6}\s|>\s|>>>\s|:::\s)/.test(l))) problems.push(`${at}: a block marker in the middle of a paragraph, separate it with a blank line`);
    checkProse(at, block);
  }
  for (const key of Object.keys(charts)) {
    if (!used.has(key)) warnings.push(`${p.slug}: chart "${key}" is defined but never placed with [[chart:${key}]]`);
  }

  // Read time is carried from the web so both surfaces say the same number (CONSTITUTION §5.1).
  // The prose estimate is only a tripwire for a field nobody updated after a rewrite.
  const words = p.body.split(/\s+/).filter(Boolean).length;
  const estimate = Math.max(1, Math.round(words / 225 + Object.keys(charts).length * 0.25));
  if (Math.abs(estimate - p.readMinutes) >= 2) warnings.push(`${p.slug}: readMinutes ${p.readMinutes}, prose reads like ${estimate} (${words} words)`);
}

// photos exist and are credited
const photoSrcDir = join(SRC, 'assets/photos');
for (const p of posts) {
  if (!existsSync(join(photoSrcDir, `${p.slug}.jpg`))) problems.push(`${p.slug}: no photo at assets/photos/${p.slug}.jpg`);
  const c = credits[p.slug];
  if (!c || typeof c.license !== 'string' || !c.license) problems.push(`${p.slug}: no credits.json entry (the licence requires attribution)`);
  else checkProse(`${p.slug} photo credit`, creditLine(c));
}

if (problems.length) {
  console.error('\n  SYNC FAILED: content verification\n  ---------------------------------');
  for (const x of [...new Set(problems)]) console.error(`  * ${x}`);
  console.error(`\n  ${new Set(problems).size} problem(s). Nothing was written.\n`);
  process.exit(1);
}

// --- 6. photos: downscale into the native repo -------------------------------------------------

/*
 * sips is macOS-only, which is fine for a sync a developer runs by hand; it is what the owner
 * specified (resampleWidth 900, quality 72). Output goes to a scratch dir first, and only lands in
 * assets/digest when the budget check passes and the bytes differ, so a failed or repeated run
 * never churns the working tree.
 */
const tmp = join(NATIVE_ROOT, 'node_modules/.digest-photo-tmp');
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
const dims = {};
let photoBytes = 0;
for (const p of posts) {
  const src = join(photoSrcDir, `${p.slug}.jpg`);
  const out = join(tmp, `${p.slug}.jpg`);
  const w = Number(execFileSync('sips', ['-g', 'pixelWidth', src], { encoding: 'utf8' }).match(/pixelWidth:\s*(\d+)/)?.[1]);
  // Never upscale: resampling a 640px photo to 900 adds bytes and no detail.
  const resample = w > PHOTO_WIDTH ? ['--resampleWidth', String(PHOTO_WIDTH)] : [];
  execFileSync('sips', [...resample, '-s', 'format', 'jpeg', '-s', 'formatOptions', String(PHOTO_QUALITY), src, '--out', out], { stdio: 'ignore' });
  const info = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', out], { encoding: 'utf8' });
  dims[p.slug] = {
    width: Number(info.match(/pixelWidth:\s*(\d+)/)[1]),
    height: Number(info.match(/pixelHeight:\s*(\d+)/)[1]),
  };
  photoBytes += statSync(out).size;
}
const mb = (n) => `${(n / 1024 / 1024).toFixed(2)}MB`;
if (photoBytes > PHOTO_BUDGET_BYTES) {
  rmSync(tmp, { recursive: true, force: true });
  die(`photo heroes total ${mb(photoBytes)} for ${posts.length} posts, over the ${mb(PHOTO_BUDGET_BYTES)} budget.\n  Nothing was written. Lower PHOTO_WIDTH or PHOTO_QUALITY, or raise the budget deliberately.`);
}

// --- 7. generate -------------------------------------------------------------------------------

const BANNER = (what, extra = []) => [
  '// ============================================================================',
  '// AUTO-SYNCED FROM THE WEB REPO. DO NOT EDIT THIS FILE.',
  `// ${what}`,
  '// Source of truth: euphoriaweb-master/src/features/digest/',
  '// Re-sync with:    ./scripts/sync-digest.sh',
  ...extra.map((l) => (l ? `// ${l}` : '//')),
  '// ============================================================================',
  '',
].join('\n');
const J = (v) => JSON.stringify(v);
const usedCats = CATEGORY_ORDER.filter((c) => posts.some((p) => p.category === c));

const content = [
  BANNER('Digest post metadata and the content types. Bodies live in digest-bodies.ts.'),
  `export type DigestCategory = ${CATEGORY_ORDER.map(J).join(' | ')};`,
  '',
  '/** The web\'s fixed display order (content/index.ts CATEGORY_ORDER), including unused ones. */',
  `export const DIGEST_CATEGORY_ORDER: readonly DigestCategory[] = [${CATEGORY_ORDER.map(J).join(', ')}];`,
  '',
  '/** One plotted line or bar group. Values line up with DigestChart.labels. */',
  'export type DigestChartSeries = { name: string; values: number[] };',
  '',
  'export type DigestChart = {',
  '  /** "line" for change over time, "bar" for comparing categories, "stack" for parts of a whole. */',
  "  type: 'line' | 'bar' | 'stack';",
  '  title: string;',
  '  labels: string[];',
  '  series: DigestChartSeries[];',
  "  unit?: 'usd' | 'usdK' | 'usdM' | 'usdB' | 'pct' | 'plain';",
  '  decimals?: number;',
  '  source?: string;',
  '  sourceUrl?: string;',
  '  note?: string;',
  '};',
  '',
  'export type DigestSource = { label: string; url: string };',
  '',
  'export type DigestPost = {',
  '  slug: string;',
  '  title: string;',
  '  /** The app card line. App voice, authored in web beside the post. */',
  '  excerpt: string;',
  '  category: DigestCategory;',
  '  date: string;',
  '  readMinutes: number;',
  '  /** In the app and not on the web site. */',
  '  appOnly?: true;',
  '};',
  '',
  '/** Newest first. */',
  'export const DIGEST_POSTS: DigestPost[] = [',
  ...posts.map((p) =>
    `  { slug: ${J(p.slug)}, title: ${J(p.title)}, excerpt: ${J(p.excerpt)}, category: ${J(p.category)}, date: ${J(p.date)}, readMinutes: ${p.readMinutes}${p.appOnly ? ', appOnly: true' : ''} },`),
  '];',
  '',
  '/** Categories that have at least one post, in the fixed order. */',
  `export const DIGEST_CATEGORIES: DigestCategory[] = [${usedCats.map(J).join(', ')}];`,
  '',
].join('\n');

const bodies = [
  BANNER('Article content: body, key points, charts, sources. Verbatim from the web post files.', [
    '',
    'Body markup: ## and ### headings, paragraphs, "- " lists, "> " quotes, ">>> Title" callouts,',
    '"::: value :: label" stat tiles, [[chart:key]] charts, **bold** and [text](https://...) links.',
    'Rendered by src/components/digest-body.tsx and src/components/digest-chart.tsx.',
  ]),
  "import type { DigestChart, DigestSource } from './digest-content';",
  '',
  'export type DigestArticle = {',
  '  body: string;',
  '  keyPoints?: string[];',
  '  charts?: Record<string, DigestChart>;',
  '  sources?: DigestSource[];',
  '};',
  '',
  'export const DIGEST_ARTICLES: Record<string, DigestArticle> = {',
  ...posts.map((p) => {
    const a = { body: p.body };
    if (p.keyPoints?.length) a.keyPoints = p.keyPoints;
    if (p.charts && Object.keys(p.charts).length) a.charts = p.charts;
    if (p.sources?.length) a.sources = p.sources.map((s) => ({ label: s.label, url: s.url }));
    return `  ${J(p.slug)}: ${J(a)},`;
  }),
  '};',
  '',
  'export const articleFor = (slug: string): DigestArticle | undefined => DIGEST_ARTICLES[slug];',
  '',
].join('\n');

const photos = [
  BANNER('Photo heroes, one per post, downscaled from the web originals by the sync.', [
    '',
    `Files: assets/digest/<slug>.jpg (${PHOTO_WIDTH}px wide, JPEG q${PHOTO_QUALITY}). Credits from the web's`,
    "assets/photos/credits.json; the credit line mirrors the web's photoCreditLine().",
  ]),
  "import type { ImageSourcePropType } from 'react-native';",
  '',
  'export type DigestPhoto = {',
  '  source: ImageSourcePropType;',
  '  width: number;',
  '  height: number;',
  '  /** "Photo: <creator> (<licence>)", shown under the hero on the article page. */',
  '  credit: string;',
  '  /** What the photo actually shows, written by opening each file (web content/photos.ts). */',
  '  alt?: string;',
  '};',
  '',
  '// Metro bundles an image only through a static require() with a literal path.',
  'export const DIGEST_PHOTOS: Record<string, DigestPhoto> = {',
  ...posts.map((p) => {
    const d = dims[p.slug];
    const alt = photoAlts[p.slug];
    return `  ${J(p.slug)}: { source: require(${J(`../../assets/digest/${p.slug}.jpg`)}), width: ${d.width}, height: ${d.height}, credit: ${J(creditLine(credits[p.slug]))}${alt ? `, alt: ${J(alt)}` : ''} },`;
  }),
  '};',
  '',
  'export const photoFor = (slug: string): DigestPhoto | undefined => DIGEST_PHOTOS[slug];',
  '',
].join('\n');

const changed = [];
function put(path, data) {
  const old = existsSync(path) ? readFileSync(path) : null;
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
  if (old && old.equals(buf)) return;
  changed.push(path.replace(`${NATIVE_ROOT}/`, ''));
  if (!DRY) writeFileSync(path, buf);
}

if (!DRY) mkdirSync(PHOTO_OUT, { recursive: true });
put(join(LIB, 'digest-content.ts'), content);
put(join(LIB, 'digest-bodies.ts'), bodies);
put(join(LIB, 'digest-photos.ts'), photos);
for (const p of posts) put(join(PHOTO_OUT, `${p.slug}.jpg`), readFileSync(join(tmp, `${p.slug}.jpg`)));

// The sync owns assets/digest outright, so a photo whose post was removed or drafted goes too.
const keep = new Set(posts.map((p) => `${p.slug}.jpg`));
const stale = existsSync(PHOTO_OUT) ? readdirSync(PHOTO_OUT).filter((f) => !keep.has(f)) : [];
for (const f of stale) {
  changed.push(`assets/digest/${f} (deleted)`);
  if (!DRY) rmSync(join(PHOTO_OUT, f));
}
// The SVG cover/figure registry this sync used to own. Photos replaced it (owner, 2026-09-28).
const legacyHeroes = join(LIB, 'digest-heroes.ts');
if (existsSync(legacyHeroes)) {
  changed.push('src/lib/digest-heroes.ts (deleted)');
  if (!DRY) rmSync(legacyHeroes);
}
rmSync(tmp, { recursive: true, force: true });

// --- 8. report ---------------------------------------------------------------------------------

const appOnly = posts.filter((p) => p.appOnly);
const count = (re) => posts.reduce((n, p) => n + (p.body.match(re) ?? []).length, 0);
console.log(`  posts        : ${posts.length}  (${posts.length - appOnly.length} shared with web, ${appOnly.length} app-only)`);
// Named, not just counted: an app-only post is invisible on the web site and a draft is invisible
// everywhere, so the sync log is the only place either divergence is ever stated.
for (const p of appOnly) console.log(`                 + ${p.slug}  (app only)`);
if (drafts.length) console.log(`  drafts       : ${drafts.length} skipped (${drafts.join(', ')})`);
console.log(`  categories   : ${usedCats.join(', ')}`);
console.log(`  charts       : ${posts.reduce((n, p) => n + Object.keys(p.charts ?? {}).length, 0)}  | stat rows ${count(/^::: /gm)} | callouts ${count(/^>>> /gm)} | links ${count(/\]\(https?:/g)}`);
console.log(`  key points   : ${posts.filter((p) => p.keyPoints?.length).length} posts | sources: ${posts.filter((p) => p.sources?.length).length} posts`);
console.log(`  photos       : ${posts.length} heroes, ${mb(photoBytes)} of the ${mb(PHOTO_BUDGET_BYTES)} budget`);
if (warnings.length) {
  console.log(`\n  warnings (not failures):`);
  for (const w of warnings) console.log(`    - ${w}`);
}
console.log(`\n  ${DRY ? 'would change' : 'changed'}: ${changed.length ? '' : 'nothing, already in sync'}`);
for (const c of changed.slice(0, 12)) console.log(`    ${c}`);
if (changed.length > 12) console.log(`    ... and ${changed.length - 12} more`);
console.log('');
