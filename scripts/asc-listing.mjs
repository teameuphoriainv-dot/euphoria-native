#!/usr/bin/env node
/**
 * Read what the App Store listing ACTUALLY says, rather than what a draft file proposes.
 *
 * `aso-count.mjs` measures refs/ASO_LISTING_DRAFT.md, and that file states plainly that nothing in
 * it has been applied. So a green ASO check says the DRAFT is well-sized -- it says nothing about
 * the live listing a user sees. This reads the live values so the two can be compared.
 *
 *   node scripts/asc-listing.mjs
 */
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const cfg = JSON.parse(readFileSync(path.join(ROOT, 'eas.json'), 'utf8'))?.submit?.production?.ios;
const keyPath = path.resolve(ROOT, cfg.ascApiKeyPath);
const keyId = cfg.ascApiKeyId ?? path.basename(keyPath).replace(/^AuthKey_|\.p8$/g, '');
const privateKey = readFileSync(keyPath, 'utf8');

const b64 = (v) => Buffer.from(JSON.stringify(v)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const header = b64({ alg: 'ES256', kid: keyId, typ: 'JWT' });
const payload = b64({ iss: cfg.ascApiKeyIssuerId, iat: now, exp: now + 900, aud: 'appstoreconnect-v1' });
const signer = createSign('SHA256'); signer.update(`${header}.${payload}`);
const jwt = `${header}.${payload}.${signer.sign({ key: privateKey, dsaEncoding: 'ieee-p1363' }).toString('base64url')}`;

const get = async (p) => {
  const r = await fetch(`https://api.appstoreconnect.apple.com${p}`, { headers: { Authorization: `Bearer ${jwt}` } });
  if (!r.ok) return { error: `${r.status} ${p}` };
  return r.json();
};
const len = (s) => (s ? String(s).length : 0);
const show = (label, value, limit) => {
  const n = len(value);
  console.log(`\n  ${label}  (${n}${limit ? '/' + limit : ''})`);
  console.log('    ' + (value ? String(value).replace(/\n/g, '\n    ').slice(0, 700) : '(empty)'));
};

const appId = cfg.ascAppId;
console.log(`\nLIVE App Store listing — app ${appId}`);

const infos = await get(`/v1/apps/${appId}/appInfos`);
for (const info of infos.data ?? []) {
  const loc = await get(`/v1/appInfos/${info.id}/appInfoLocalizations`);
  for (const l of loc.data ?? []) {
    const a = l.attributes ?? {};
    if (a.locale !== 'en-US') continue;
    console.log(`\n=== App Info (${info.attributes?.appStoreState ?? '?'}) — ${a.locale}`);
    show('Name', a.name, 30);
    show('Subtitle', a.subtitle, 30);
    show('Privacy policy URL', a.privacyPolicyUrl);
  }
}

const versions = await get(`/v1/apps/${appId}/appStoreVersions?limit=3`);
for (const v of versions.data ?? []) {
  const va = v.attributes ?? {};
  console.log(`\n=== Version ${va.versionString} — ${va.appStoreState}`);
  const loc = await get(`/v1/appStoreVersions/${v.id}/appStoreVersionLocalizations`);
  for (const l of loc.data ?? []) {
    const a = l.attributes ?? {};
    if (a.locale !== 'en-US') continue;
    show('Promotional text', a.promotionalText, 170);
    show('Keywords', a.keywords, 100);
    show('Description', a.description, 4000);
    show("What's New", a.whatsNew);
    // screenshots
    const sets = await get(`/v1/appStoreVersionLocalizations/${l.id}/appScreenshotSets`);
    console.log(`\n  Screenshot sets: ${(sets.data ?? []).length}`);
    for (const s of sets.data ?? []) {
      const shots = await get(`/v1/appScreenshotSets/${s.id}/appScreenshots`);
      console.log(`    ${s.attributes?.screenshotDisplayType}: ${(shots.data ?? []).length} images`);
    }
  }
}
console.log('');
