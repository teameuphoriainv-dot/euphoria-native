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
import { readFileSync } from 'node:fs';

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
  // A commented-out declaration must NOT be read as the real one.
  const commented = stripComments("/* const DEFAULT_API_ORIGIN = 'https://wrong.example'; */\nconst DEFAULT_API_ORIGIN = 'https://right.example';");
  if (commented.match(/const DEFAULT_API_ORIGIN\s*=\s*'([^']+)'/)[1] !== 'https://right.example')
    throw new Error('selftest: pin read an origin out of a comment');
}

selftest();
check();
console.log('[api-origin-pin] ok');
