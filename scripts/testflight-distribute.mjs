#!/usr/bin/env node
/**
 * Attach a processed build to its TestFlight groups. THE STEP THAT WAS MISSING.
 *
 * WHY THIS EXISTS. `eas submit` uploads an IPA to App Store Connect and stops there. Apple parks it
 * at READY_FOR_BETA_TESTING, which is uploaded-but-invisible: no tester can see it until the build
 * is attached to a beta group. Somebody had been doing that by hand in the ASC web UI and stopped.
 *
 * MEASURED 2026-08-25, which is what prompted this:
 *   builds 17 and 18  never uploaded to Apple at all
 *   build 16          uploaded, VALID, READY_FOR_BETA_TESTING, attached to NO group
 *   builds 11-15      attached to both groups, IN_BETA_TESTING
 * The owner reported "the latest one I can see is only build 15". Build 15 was simply the last one
 * anyone remembered to attach.
 *
 * INTERNAL BY DEFAULT, EXTERNAL ONLY ON REQUEST. Attaching to an external group submits the build
 * for Beta App Review and notifies real people. That is not something a build script should do
 * silently, so it needs --external.
 *
 * Usage:
 *   node scripts/testflight-distribute.mjs                # newest processed build -> internal
 *   node scripts/testflight-distribute.mjs --build 18     # a specific build number
 *   node scripts/testflight-distribute.mjs --external     # also the external groups
 *   node scripts/testflight-distribute.mjs --dry-run      # say what it would do, change nothing
 */
// Explicit import: Buffer is not a global in an ESM Node script, and eslint's no-undef catches
// it. The same four errors were fixed this way elsewhere in scripts/.
import { Buffer } from 'node:buffer';
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

/*
 * CONFIG COMES FROM eas.json, not from constants here. The issuer id and app id already live in
 * `submit.production.ios`; restating them would be a second copy of a value that has drifted in
 * this repo before (ENTITLEMENT_ID, the billing grace period). One rule, one place.
 */
const cfg = JSON.parse(readFileSync(path.join(ROOT, 'eas.json'), 'utf8'))?.submit?.production?.ios;
if (!cfg?.ascApiKeyPath || !cfg.ascApiKeyIssuerId || !cfg.ascAppId) {
  console.error('eas.json submit.production.ios is missing ascApiKeyPath / ascApiKeyIssuerId / ascAppId');
  process.exit(1);
}

const keyPath = path.resolve(ROOT, cfg.ascApiKeyPath);
const KID = cfg.ascApiKeyId ?? path.basename(keyPath).replace(/^AuthKey_|\.p8$/g, '');
let key;
try {
  key = readFileSync(keyPath, 'utf8');
} catch {
  console.error(`cannot read the ASC key at ${cfg.ascApiKeyPath} — it is gitignored, so a fresh clone will not have it`);
  process.exit(1);
}

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const head = b64({ alg: 'ES256', kid: KID, typ: 'JWT' });
const body = b64({ iss: cfg.ascApiKeyIssuerId, iat: now, exp: now + 900, aud: 'appstoreconnect-v1' });
const signer = createSign('SHA256');
signer.update(`${head}.${body}`);
const JWT = `${head}.${body}.${signer.sign({ key, dsaEncoding: 'ieee-p1363' }).toString('base64url')}`;

async function api(method, p, payload) {
  const r = await fetch(`https://api.appstoreconnect.apple.com${p}`, {
    method,
    headers: { Authorization: `Bearer ${JWT}`, ...(payload ? { 'Content-Type': 'application/json' } : {}) },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });
  const t = await r.text();
  if (!r.ok) return { __error: r.status, body: t.slice(0, 400) };
  return t ? JSON.parse(t) : {};
}

const args = process.argv.slice(2);
const wantExternal = args.includes('--external');
const dryRun = args.includes('--dry-run');
const wantBuild = args.includes('--build') ? args[args.indexOf('--build') + 1] : null;

const builds = await api('GET', `/v1/apps/${cfg.ascAppId}/builds?limit=25`);
if (builds.__error) { console.error('build list failed', builds.__error, builds.body); process.exit(1); }

const usable = builds.data
  .filter((b) => b.attributes.processingState === 'VALID' && !b.attributes.expired)
  .sort((a, b) => Number(b.attributes.version) - Number(a.attributes.version));

const target = wantBuild
  ? usable.find((b) => String(b.attributes.version) === String(wantBuild))
  : usable[0];

if (!target) {
  console.error(wantBuild
    ? `build ${wantBuild} is not present and VALID in App Store Connect. eas submit may not have run for it.`
    : 'no processed build found');
  process.exit(1);
}
console.log(`build ${target.attributes.version}  uploaded ${(target.attributes.uploadedDate || '').slice(0, 16)}`);

const groups = await api('GET', `/v1/apps/${cfg.ascAppId}/betaGroups?limit=20`);
if (groups.__error) { console.error('group list failed', groups.__error); process.exit(1); }

let attached = 0;
let failed = 0;
for (const g of groups.data) {
  const internal = g.attributes.isInternalGroup;
  if (!internal && !wantExternal) {
    console.log(`  skip "${g.attributes.name}" (external; pass --external to include it — it triggers Beta App Review)`);
    continue;
  }
  const have = await api('GET', `/v1/betaGroups/${g.id}/builds?limit=50`);
  if (!have.__error && have.data.some((b) => b.id === target.id)) {
    console.log(`  "${g.attributes.name}" already has it`);
    continue;
  }
  if (dryRun) { console.log(`  WOULD attach to "${g.attributes.name}"`); continue; }
  const res = await api('POST', `/v1/betaGroups/${g.id}/relationships/builds`, {
    data: [{ type: 'builds', id: target.id }],
  });
  if (res.__error) { failed += 1; console.error(`  FAILED "${g.attributes.name}": ${String(res.__error)} ${res.body}`); }
  else { attached += 1; console.log(`  attached to "${g.attributes.name}"`); }
}

const det = await api('GET', `/v1/builds/${target.id}/buildBetaDetail`);
if (!det.__error && det.data) {
  console.log(`  state now: internal=${det.data.attributes.internalBuildState} external=${det.data.attributes.externalBuildState}`);
}
console.log(dryRun ? 'dry run, nothing changed' : `${String(attached)} attached, ${String(failed)} failed`);
process.exit(failed > 0 ? 1 : 0);
