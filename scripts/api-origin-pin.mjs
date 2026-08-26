/**
 * THE API ORIGIN IS DECLARED IN THREE PLACES AND THEY MUST AGREE.
 *
 * `src/lib/api.ts` compiles one in as DEFAULT_API_ORIGIN, and `eas.json` sets EXPO_PUBLIC_API_URL
 * under both the `preview` and `production` build profiles. The constant exists precisely because
 * the environment cannot be relied on for OTA bundles, so a constant that has silently drifted from
 * the deployment is worse than no constant at all: every native build would confidently send its
 * market, chat and options traffic to an origin nobody deploys to, and `safe()` would turn all of
 * it into the static price table again without a word.
 *
 * COMMENTS ARE STRIPPED BEFORE MATCHING. The doc block above DEFAULT_API_ORIGIN names the origin
 * in prose, and DEPLOY.md quotes it too. An audit that matched its own documentation is not a
 * hypothetical here: `reduced_motion_audit.py` shipped flagging a `ZoomIn` that lived inside a
 * comment, which is why every text pin in this repo strips first and matches second.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** Remove line and block comments so a pin never matches its own prose. */
export const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const fail = (msg) => {
  console.error(`[api-origin-pin] ${msg}`);
  process.exit(1);
};

function check() {
  const code = stripComments(readFileSync('src/lib/api.ts', 'utf8'));
  const m = code.match(/const DEFAULT_API_ORIGIN\s*=\s*'([^']+)'/);
  if (!m) fail('src/lib/api.ts no longer declares DEFAULT_API_ORIGIN. apiBase() must never be able to return "" on native.');
  const constant = m[1];

  if (constant.endsWith('/')) fail(`DEFAULT_API_ORIGIN has a trailing slash (${constant}). Paths are concatenated raw, so this produces //api/market.`);
  if (!constant.startsWith('https://')) fail(`DEFAULT_API_ORIGIN is not https (${constant}). App Transport Security blocks cleartext on device.`);

  const eas = JSON.parse(readFileSync('eas.json', 'utf8'));
  for (const profile of ['preview', 'production']) {
    const url = eas.build?.[profile]?.env?.EXPO_PUBLIC_API_URL;
    if (!url) fail(`eas.json build.${profile}.env.EXPO_PUBLIC_API_URL is missing. A build with no origin is the C98 failure.`);
    if (url.replace(/\/$/, '') !== constant) fail(`origin drift: eas.json build.${profile} says ${url}, src/lib/api.ts says ${constant}.`);
  }

  // apiBase must not still fall through to the empty string on native.
  if (/hostUri[\s\S]{0,120}:\s*''/.test(code)) fail("apiBase() still returns '' when hostUri is absent. That is the case DEFAULT_API_ORIGIN exists to remove.");

  /*
   * ONE RESOLVER, AND ONLY ONE. This is the half the pin was missing.
   *
   * `src/lib/atlas-chat.ts` carried its OWN copy of the resolution order, written before this
   * constant existed and never updated with it. So the C98 fix protected market data and options
   * and left Atlas resolving to '' — a partial outage on a misconfigured OTA, where the half that
   * still works argues the configuration is fine and sends you looking at the wrong thing.
   *
   * Pinning the CONSTANT was never going to catch that: the second resolver did not mention it.
   * What catches it is pinning the READ. `process.env.EXPO_PUBLIC_API_URL` may appear in exactly
   * one file, and that file is the one this pin already checks.
   */
  const readers = originReaders(walk('src'), (f) => stripComments(readFileSync(f, 'utf8')));
  if (readers.length !== 1 || readers[0] !== 'src/lib/api.ts') {
    fail(
      `EXPO_PUBLIC_API_URL must be read in src/lib/api.ts and nowhere else, so DEFAULT_API_ORIGIN ` +
        `covers every caller. Found ${readers.length} reader(s): ${readers.join(', ') || 'none'}. ` +
        `Call apiBase() instead of resolving the origin a second time.`,
    );
  }
}

/** Every .ts/.tsx file under a directory, as forward-slash paths. */
function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(f));
    else if (/\.tsx?$/.test(e.name)) out.push(f.split('\\').join('/'));
  }
  return out;
}

/**
 * Pure so the selftest can prove it fires without touching the filesystem.
 * `read` returns COMMENT-STRIPPED source, because this file's own prose names the variable.
 */
export function originReaders(files, read) {
  return files.filter((f) => read(f).includes('process.env.EXPO_PUBLIC_API_URL'));
}

/** The pin has to be able to FAIL. Three shapes that must each be caught. */
function selftest() {
  const cases = [
    ["const DEFAULT_API_ORIGIN = 'https://a.example';", "const DEFAULT_API_ORIGIN = 'https://b.example';", 'drift'],
    ["const DEFAULT_API_ORIGIN = 'https://a.example';", "const DEFAULT_API_ORIGIN = 'https://a.example/';", 'trailing slash'],
    ["const DEFAULT_API_ORIGIN = 'https://a.example';", "const DEFAULT_API_ORIGIN = 'http://a.example';", 'cleartext'],
  ];
  for (const [good, bad, label] of cases) {
    if (!/const DEFAULT_API_ORIGIN\s*=\s*'([^']+)'/.test(good)) throw new Error(`selftest: good ${label} did not parse`);
    const v = bad.match(/const DEFAULT_API_ORIGIN\s*=\s*'([^']+)'/)[1];
    const caught = v !== 'https://a.example' || v.endsWith('/') || !v.startsWith('https://');
    if (!caught) throw new Error(`selftest: ${label} would slip through`);
  }
  /*
   * The one-resolver rule must be able to fail, in both directions. A second reader is the
   * atlas-chat regression; zero readers means apiBase() stopped consulting the environment at all,
   * which would silently ignore a preview override.
   */
  const src = {
    'src/lib/api.ts': 'const explicit = process.env.EXPO_PUBLIC_API_URL;',
    'src/lib/atlas-chat.ts': 'const explicit = process.env.EXPO_PUBLIC_API_URL;',
    'src/lib/other.ts': 'nothing to see here',
  };
  const read = (f) => src[f];
  const two = originReaders(Object.keys(src), read);
  if (two.length !== 2) throw new Error('selftest: a duplicate resolver would slip through');
  const one = originReaders(['src/lib/api.ts', 'src/lib/other.ts'], read);
  if (one.length !== 1 || one[0] !== 'src/lib/api.ts') throw new Error('selftest: single-reader case misread');
  const none = originReaders(['src/lib/other.ts'], read);
  if (none.length !== 0) throw new Error('selftest: zero-reader case misread');
  // A read that appears only in a COMMENT must not count, or this file's own prose would fail it.
  if (originReaders(['x'], () => stripComments('// process.env.EXPO_PUBLIC_API_URL\nconst a = 1;')).length !== 0)
    throw new Error('selftest: pin counted a reader inside a comment');

  // A commented-out declaration must NOT be read as the real one.
  const commented = stripComments("/* const DEFAULT_API_ORIGIN = 'https://wrong.example'; */\nconst DEFAULT_API_ORIGIN = 'https://right.example';");
  if (commented.match(/const DEFAULT_API_ORIGIN\s*=\s*'([^']+)'/)[1] !== 'https://right.example')
    throw new Error('selftest: pin read an origin out of a comment');
}

selftest();
check();
console.log('[api-origin-pin] ok');
