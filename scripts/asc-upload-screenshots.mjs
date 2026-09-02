#!/usr/bin/env node
/**
 * Upload the framed App Store screenshots to App Store Connect.
 *
 * Apple's asset flow is three-legged and every leg must succeed or the asset is left in a
 * half-created state that blocks the version: RESERVE (POST appScreenshots, which returns
 * uploadOperations), PUT the bytes at each operation's url with its own headers, then COMMIT
 * (PATCH uploaded=true with the MD5 of the file). Skipping the commit leaves a screenshot that
 * App Store Connect shows as broken and that submission will reject.
 *
 * Read-then-write, and it refuses to touch a version that is not editable.
 *
 * Usage:
 *   node scripts/asc-upload-screenshots.mjs            # dry run: report only
 *   node scripts/asc-upload-screenshots.mjs --apply    # actually replace the 6.9" set
 */
import { Buffer } from 'node:buffer';
import { createHash, createSign } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const APPLY = process.argv.includes('--apply');
const SHOTS = path.join(ROOT, 'goldie/out/screenshots/iphone-6.9/en-US');
/**
 * There is NO `APP_IPHONE_69` display type -- the API rejects it and lists the valid set.
 * Apple routes 6.9" iPhone screenshots through the 6.7" slot, which accepts both 1290x2796
 * and 1320x2868. This is the largest iPhone type App Store Connect exposes.
 */
const DISPLAY_TYPE = 'APP_IPHONE_67';
const LOCALE = 'en-US';

const cfg = JSON.parse(readFileSync(path.join(ROOT, 'eas.json'), 'utf8'))?.submit?.production?.ios;
if (!cfg?.ascApiKeyPath || !cfg.ascApiKeyIssuerId || !cfg.ascAppId) {
  console.error('eas.json submit.production.ios is missing App Store Connect configuration');
  process.exit(1);
}

const keyPath = path.resolve(ROOT, cfg.ascApiKeyPath);
const keyId = cfg.ascApiKeyId ?? path.basename(keyPath).replace(/^AuthKey_|\.p8$/g, '');
const privateKey = readFileSync(keyPath, 'utf8');

const b64 = (v) => Buffer.from(JSON.stringify(v)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const header = b64({ alg: 'ES256', kid: keyId, typ: 'JWT' });
const payload = b64({ iss: cfg.ascApiKeyIssuerId, iat: now, exp: now + 20 * 60, aud: 'appstoreconnect-v1' });
const signer = createSign('SHA256');
signer.update(`${header}.${payload}`);
const jwt = `${header}.${payload}.${signer.sign({ key: privateKey, dsaEncoding: 'ieee-p1363' }).toString('base64url')}`;

async function api(method, resource, body) {
  const res = await fetch(`https://api.appstoreconnect.apple.com${resource}`, {
    method,
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  if (!res.ok) {
    let detail = text.slice(0, 500);
    try {
      detail = (JSON.parse(text).errors ?? [])
        .map((e) => `${e.status ?? res.status} ${e.code ?? ''} ${e.detail ?? ''}`.trim())
        .join('; ');
    } catch { /* non-JSON error body; the excerpt above is enough */ }
    throw new Error(`${method} ${resource} -> ${res.status}: ${detail}`);
  }
  return text ? JSON.parse(text) : {};
}

// An App Store version only accepts asset changes in an editable state. Uploading into a live
// version silently does nothing useful, so this is checked before anything is deleted.
const EDITABLE = new Set([
  'PREPARE_FOR_SUBMISSION', 'DEVELOPER_REJECTED', 'REJECTED', 'METADATA_REJECTED',
  'INVALID_BINARY', 'WAITING_FOR_REVIEW', 'READY_FOR_REVIEW',
]);

const files = readdirSync(SHOTS).filter((f) => f.endsWith('.png')).sort();
if (!files.length) {
  console.error(`no screenshots in ${path.relative(ROOT, SHOTS)}`);
  process.exit(1);
}

const versions = await api('GET', `/v1/apps/${cfg.ascAppId}/appStoreVersions?filter[platform]=IOS&limit=5&fields[appStoreVersions]=versionString,appStoreState,appVersionState`);
const version = (versions.data ?? [])[0];
const state = version?.attributes?.appVersionState ?? version?.attributes?.appStoreState;
console.log(`app ${cfg.ascAppId}  version ${version?.attributes?.versionString}  state ${state}`);

if (!version) { console.error('no iOS app store version found'); process.exit(1); }
if (!EDITABLE.has(state)) {
  console.error(`\nversion state ${state} is not editable -- create a new version in App Store Connect first.`);
  console.error('Nothing was changed.');
  process.exit(2);
}

const locs = await api('GET', `/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations?limit=50&fields[appStoreVersionLocalizations]=locale`);
const loc = (locs.data ?? []).find((l) => l.attributes?.locale === LOCALE);
if (!loc) { console.error(`no ${LOCALE} localization on this version`); process.exit(1); }

const sets = await api('GET', `/v1/appStoreVersionLocalizations/${loc.id}/appScreenshotSets?limit=50&include=appScreenshots`);
let set = (sets.data ?? []).find((s) => s.attributes?.screenshotDisplayType === DISPLAY_TYPE);

console.log('\nexisting sets:');
for (const s of sets.data ?? []) {
  const n = (s.relationships?.appScreenshots?.data ?? []).length;
  console.log(`  ${s.attributes?.screenshotDisplayType}  ${n} image(s)`);
}
console.log(`\nlocal ${DISPLAY_TYPE} images to upload: ${files.length}`);
files.forEach((f) => console.log(`  ${f}`));

if (!APPLY) {
  console.log('\nDRY RUN -- nothing uploaded. Re-run with --apply to replace the set.');
  process.exit(0);
}

if (set) {
  const existing = (set.relationships?.appScreenshots?.data ?? []);
  for (const shot of existing) {
    await api('DELETE', `/v1/appScreenshots/${shot.id}`);
  }
  console.log(`\ncleared ${existing.length} existing ${DISPLAY_TYPE} image(s)`);
} else {
  const created = await api('POST', '/v1/appScreenshotSets', {
    data: {
      type: 'appScreenshotSets',
      attributes: { screenshotDisplayType: DISPLAY_TYPE },
      relationships: { appStoreVersionLocalization: { data: { type: 'appStoreVersionLocalizations', id: loc.id } } },
    },
  });
  set = created.data;
  console.log(`\ncreated ${DISPLAY_TYPE} set`);
}

for (const [i, name] of files.entries()) {
  const bytes = readFileSync(path.join(SHOTS, name));

  const reserved = await api('POST', '/v1/appScreenshots', {
    data: {
      type: 'appScreenshots',
      attributes: { fileName: name, fileSize: bytes.length },
      relationships: { appScreenshotSet: { data: { type: 'appScreenshotSets', id: set.id } } },
    },
  });

  // Apple hands back one or more byte ranges, each with its own url, method and headers.
  for (const op of reserved.data.attributes.uploadOperations ?? []) {
    const chunk = bytes.subarray(op.offset, op.offset + op.length);
    const headers = Object.fromEntries((op.requestHeaders ?? []).map((h) => [h.name, h.value]));
    const put = await fetch(op.url, { method: op.method, headers, body: chunk });
    if (!put.ok) throw new Error(`upload ${name} chunk@${op.offset} -> ${put.status}`);
  }

  await api('PATCH', `/v1/appScreenshots/${reserved.data.id}`, {
    data: {
      type: 'appScreenshots',
      id: reserved.data.id,
      attributes: { uploaded: true, sourceFileChecksum: createHash('md5').update(bytes).digest('hex') },
    },
  });

  console.log(`  uploaded ${String(i + 1).padStart(2, '0')} ${name}`);
}

console.log(`\ndone -- ${files.length} screenshots in the ${DISPLAY_TYPE} set for ${LOCALE}`);
