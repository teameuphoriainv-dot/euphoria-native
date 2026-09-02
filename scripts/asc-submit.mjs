#!/usr/bin/env node
/**
 * Attach the newest processed build and submit the version for App Review.
 *
 * Three steps, in this order, because each depends on the last:
 *   1. attach the build to the App Store version (a version with no build cannot be submitted);
 *   2. add an appStoreVersion item to the review submission — the item removed earlier to unlock
 *      screenshot replacement, since Apple returns 409 STATE_ERROR while a version is in review;
 *   3. flip the submission to submitted.
 *
 * Dry-runs by default. Every precondition is re-checked against the live API immediately before
 * the write, so a stale local assumption cannot cause a submission.
 *
 * Usage:
 *   node scripts/asc-submit.mjs --build 24              # report what it would do
 *   node scripts/asc-submit.mjs --build 24 --apply      # attach, re-add, and SUBMIT FOR REVIEW
 *   node scripts/asc-submit.mjs --build 24 --attach-only
 *
 * --build is REQUIRED and names the build number explicitly. Picking "the newest usable build"
 * is not safe: while a fresh upload is still processing, the newest VALID build is the PREVIOUS
 * one, and a paged /builds query is not guaranteed to contain the build you mean. A dry run on
 * 2026-09-02 resolved "newest" to build 22 -- a binary carrying a crash already fixed in source
 * -- while build 24 was still processing.
 */
import { Buffer } from 'node:buffer';
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const APPLY = process.argv.includes('--apply');
const ATTACH_ONLY = process.argv.includes('--attach-only');
const WANT = process.argv[process.argv.indexOf('--build') + 1];
if (!process.argv.includes('--build') || !/^\d+$/.test(WANT ?? '')) {
  console.error('--build <number> is required, e.g. --build 24');
  process.exit(1);
}

const cfg = JSON.parse(readFileSync(path.join(ROOT, 'eas.json'), 'utf8'))?.submit?.production?.ios;
const keyPath = path.resolve(ROOT, cfg.ascApiKeyPath);
const keyId = cfg.ascApiKeyId ?? path.basename(keyPath).replace(/^AuthKey_|\.p8$/g, '');
const b64 = (v) => Buffer.from(JSON.stringify(v)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const header = b64({ alg: 'ES256', kid: keyId, typ: 'JWT' });
const payload = b64({ iss: cfg.ascApiKeyIssuerId, iat: now, exp: now + 20 * 60, aud: 'appstoreconnect-v1' });
const signer = createSign('SHA256');
signer.update(`${header}.${payload}`);
const jwt = `${header}.${payload}.${signer.sign({ key: readFileSync(keyPath, 'utf8'), dsaEncoding: 'ieee-p1363' }).toString('base64url')}`;

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
    let detail = text.slice(0, 400);
    try {
      detail = (JSON.parse(text).errors ?? [])
        .map((e) => `${e.status ?? res.status} ${e.code ?? ''} ${e.detail ?? ''}`.trim())
        .join('; ');
    } catch { /* keep the excerpt */ }
    throw new Error(`${method} ${resource} -> ${res.status}: ${detail}`);
  }
  return text ? JSON.parse(text) : {};
}

const fail = (msg) => { console.error(`\nBLOCKED: ${msg}\nNothing was changed.`); process.exit(2); };

// ---- preconditions, all read from the live API ----
const versions = await api('GET', `/v1/apps/${cfg.ascAppId}/appStoreVersions?filter[platform]=IOS&limit=1&include=build`);
const version = versions.data?.[0];
if (!version) fail('no iOS App Store version');
const state = version.attributes.appVersionState;
console.log(`version ${version.attributes.versionString}  state ${state}`);

const builds = await api('GET', `/v1/apps/${cfg.ascAppId}/builds?limit=200&fields[builds]=version,processingState,uploadedDate,expired`);
const build = (builds.data ?? []).find((b) => b.attributes.version === WANT);
if (!build) fail(`build ${WANT} is not on App Store Connect yet (still processing, or never uploaded)`);
if (build.attributes.processingState !== 'VALID') fail(`build ${WANT} is ${build.attributes.processingState}, not VALID`);
if (build.attributes.expired) fail(`build ${WANT} has expired`);
console.log(`target build: ${build.attributes.version}  ${build.attributes.processingState}  (${build.id})`);

const attached = version.relationships?.build?.data?.id ?? null;
console.log(`currently attached: ${attached ?? 'none'}${attached === build.id ? '  <- already correct' : ''}`);

const localization = (await api('GET', `/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations?limit=10`))
  .data.find((l) => l.attributes.locale === 'en-US');
const sets = await api('GET', `/v1/appStoreVersionLocalizations/${localization.id}/appScreenshotSets?limit=10&include=appScreenshots`);
const shots = (sets.data ?? []).reduce((n, s) => n + (s.relationships?.appScreenshots?.data ?? []).length, 0);
console.log(`screenshots: ${shots} across ${sets.data.length} set(s)`);
if (shots === 0) fail('the version has no screenshots');

const detail = await api('GET', `/v1/appStoreVersions/${version.id}/appStoreReviewDetail`);
const d = detail.data.attributes;
const contactOk = Boolean(d.contactFirstName && d.contactLastName && d.contactPhone && d.contactEmail);
console.log(`review detail: contact=${contactOk} demo=${Boolean(d.demoAccountName && d.demoAccountPassword)} notes=${String(d.notes ?? '').length}`);
if (!contactOk) fail('App Review contact information is incomplete');

const submissions = await api('GET', `/v1/apps/${cfg.ascAppId}/reviewSubmissions?limit=10&include=items`);
const open = (submissions.data ?? []).find((s) => !s.attributes.submittedDate && s.attributes.state !== 'COMPLETE');
console.log(`open review submission: ${open ? `${open.id} (${open.attributes.state}, ${(open.relationships?.items?.data ?? []).length} items)` : 'none — one will be created'}`);

if (!APPLY && !ATTACH_ONLY) {
  console.log('\nDRY RUN — nothing changed. Re-run with --apply to attach and submit.');
  process.exit(0);
}

// ---- 1. attach the build ----
if (attached !== build.id) {
  await api('PATCH', `/v1/appStoreVersions/${version.id}/relationships/build`, {
    data: { type: 'builds', id: build.id },
  });
  console.log(`\nattached build ${build.attributes.version}`);
} else {
  console.log(`\nbuild ${build.attributes.version} already attached`);
}

// ---- 2. put the app version back into the review submission ----
let submission = open;
if (!submission) {
  submission = (await api('POST', '/v1/reviewSubmissions', {
    data: {
      type: 'reviewSubmissions',
      attributes: { platform: 'IOS' },
      relationships: { app: { data: { type: 'apps', id: cfg.ascAppId } } },
    },
  })).data;
  console.log(`created review submission ${submission.id}`);
}

const items = await api('GET', `/v1/reviewSubmissions/${submission.id}/items?limit=50&include=appStoreVersion`);
const hasVersion = (items.data ?? []).some((i) => i.relationships?.appStoreVersion?.data?.id === version.id);
if (hasVersion) {
  console.log('app version already an item on the submission');
} else {
  await api('POST', '/v1/reviewSubmissionItems', {
    data: {
      type: 'reviewSubmissionItems',
      relationships: {
        reviewSubmission: { data: { type: 'reviewSubmissions', id: submission.id } },
        appStoreVersion: { data: { type: 'appStoreVersions', id: version.id } },
      },
    },
  });
  console.log('added the app version back to the review submission');
}

if (ATTACH_ONLY) {
  console.log('\n--attach-only: stopping before submit. Nothing has been sent to Apple.');
  process.exit(0);
}

// ---- 3. submit ----
await api('PATCH', `/v1/reviewSubmissions/${submission.id}`, {
  data: { type: 'reviewSubmissions', id: submission.id, attributes: { submitted: true } },
});
const after = await api('GET', `/v1/reviewSubmissions/${submission.id}`);
console.log(`\nSUBMITTED -> state ${after.data.attributes.state}  submittedDate ${after.data.attributes.submittedDate}`);
