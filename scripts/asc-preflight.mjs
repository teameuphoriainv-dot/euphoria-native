#!/usr/bin/env node
/**
 * Pre-submission gate for App Store Connect. Run this BEFORE every submission.
 *
 * WHY THIS EXISTS. On 2026-09-02 build 24 was rejected under Guideline 3.1.2 by an AUTOMATED
 * check, before any human review, because the App Description contained no Terms of Use link.
 * A manual audit had passed the same submission: it verified the paywall's Terms/Privacy links
 * and the App Store Connect privacy-policy field, both of which were correct, and never checked
 * the description TEXT, which is the field Apple's gate actually reads. A reviewer-by-hand who
 * knows what to look for still misses a field they did not think to open. A script does not.
 *
 * Every check here is either a live API read or a live HTTP fetch. Nothing is assumed from
 * config files, and no check passes on the absence of evidence.
 *
 * Usage: node scripts/asc-preflight.mjs [--build 24] [--agreement-verified]
 * Exit:  0 all checks pass · 1 one or more FAILED · 2 could not run
 */
import { Buffer } from 'node:buffer';
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const WANT_BUILD = process.argv.includes('--build') ? process.argv[process.argv.indexOf('--build') + 1] : null;

const cfg = JSON.parse(readFileSync(path.join(ROOT, 'eas.json'), 'utf8'))?.submit?.production?.ios;
if (!cfg?.ascApiKeyPath) { console.error('eas.json is missing submit.production.ios'); process.exit(2); }
const keyPath = path.resolve(ROOT, cfg.ascApiKeyPath);
const keyId = cfg.ascApiKeyId ?? path.basename(keyPath).replace(/^AuthKey_|\.p8$/g, '');
const b64 = (v) => Buffer.from(JSON.stringify(v)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const head = b64({ alg: 'ES256', kid: keyId, typ: 'JWT' });
const body = b64({ iss: cfg.ascApiKeyIssuerId, iat: now, exp: now + 20 * 60, aud: 'appstoreconnect-v1' });
const sg = createSign('SHA256'); sg.update(`${head}.${body}`);
const jwt = `${head}.${body}.${sg.sign({ key: readFileSync(keyPath, 'utf8'), dsaEncoding: 'ieee-p1363' }).toString('base64url')}`;

const api = async (resource) => {
  const r = await fetch(`https://api.appstoreconnect.apple.com${resource}`, { headers: { Authorization: `Bearer ${jwt}` } });
  const t = await r.text();
  if (!r.ok) throw new Error(`${resource} -> ${r.status}: ${t.slice(0, 200)}`);
  return t ? JSON.parse(t) : {};
};

/** A link Apple calls "functional" has to actually resolve. HEAD is not enough; some hosts 405 it. */
async function resolves(url) {
  try {
    const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
    return r.status;
  } catch { return 0; }
}

const results = [];
const check = (name, ok, detail) => { results.push({ name, ok, detail }); };

const version = (await api(`/v1/apps/${cfg.ascAppId}/appStoreVersions?filter[platform]=IOS&limit=1&include=build`)).data?.[0];
if (!version) { console.error('no iOS App Store version'); process.exit(2); }
const loc = (await api(`/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations?limit=20`))
  .data.find((l) => l.attributes.locale === 'en-US');
const L = loc.attributes;
const description = L.description ?? '';

// ── Guideline 3.1.2 / Schedule 2 — the automated gate that rejected build 24 ────────────────
const urlsInDescription = [...description.matchAll(/https?:\/\/[^\s)]+/g)].map((m) => m[0].replace(/[.,]$/, ''));
const termsUrl = urlsInDescription.find((u) => /eula|terms/i.test(u));
check('3.1.2  description contains a Terms of Use / EULA link', Boolean(termsUrl), termsUrl ?? 'NO terms link in the description');

// A custom EULA in App Store Connect is the alternative Apple accepts. If one exists the
// description link is optional -- but knowing WHICH applies decides which URL is correct.
const infos = await api(`/v1/apps/${cfg.ascAppId}/appInfos?limit=5`);
let customEula = false;
for (const info of infos.data ?? []) {
  try {
    const e = await api(`/v1/appInfos/${info.id}/endUserLicenseAgreement`);
    if (e.data) customEula = true;
  } catch { /* absent is the normal case */ }
}
check('3.1.2  EULA source is unambiguous', true,
  customEula ? 'custom EULA set in App Store Connect' : 'standard Apple EULA (so the description link must be the Apple stdeula URL or your own terms)');

check('3.1.2  description states both prices', /\$\d/.test(description) && (description.match(/\$\d[\d.]*/g) ?? []).length >= 2,
  (description.match(/\$\d[\d.]*/g) ?? []).join(' ') || 'no prices found');
check('3.1.2  description states renewal/cancellation terms', /renew/i.test(description) && /cancel/i.test(description),
  'looks for "renew" and "cancel"');

// Every link Apple can see must resolve, or it is not "functional".
for (const u of urlsInDescription) {
  const status = await resolves(u);
  check(`link resolves  ${u}`, status >= 200 && status < 400, `HTTP ${status}`);
}

// ── Privacy policy, support URL ─────────────────────────────────────────────────────────────
const infoLoc = [];
for (const info of infos.data ?? []) {
  const ls = await api(`/v1/appInfos/${info.id}/appInfoLocalizations?limit=20`);
  const en = (ls.data ?? []).find((l) => l.attributes.locale === 'en-US');
  if (en) infoLoc.push(en.attributes);
}
const privacyUrl = infoLoc.map((a) => a.privacyPolicyUrl).find(Boolean);
check('5.1.1  privacy policy URL set in App Store Connect', Boolean(privacyUrl), privacyUrl ?? 'MISSING');
if (privacyUrl) { const s = await resolves(privacyUrl); check('5.1.1  privacy policy URL resolves', s >= 200 && s < 400, `HTTP ${s}`); }
check('1.5    support URL set', Boolean(L.supportUrl), L.supportUrl ?? 'MISSING');
if (L.supportUrl) { const s = await resolves(L.supportUrl); check('1.5    support URL resolves', s >= 200 && s < 400, `HTTP ${s}`); }

// ── The binary must carry the same links (3.1.2 applies to the app, not only the listing) ───
const sources = ['src/app/onboarding.tsx', 'src/app/settings/[section].tsx'];
const sourceText = sources.map((f) => { try { return readFileSync(path.join(ROOT, f), 'utf8'); } catch { return ''; } }).join('\n');
check('3.1.2  binary links to Terms', /https?:\/\/[^\s'"]*terms/i.test(sourceText), 'searched paywall + settings');
check('3.1.2  binary links to Privacy', /https?:\/\/[^\s'"]*privacy/i.test(sourceText), 'searched paywall + settings');
check('3.1.1  binary offers Restore', /[Rr]estore purchases/.test(sourceText), 'searched paywall + settings');

// ── Review access — a reviewer who cannot sign in rejects under 2.1 ─────────────────────────
const detail = (await api(`/v1/appStoreVersions/${version.id}/appStoreReviewDetail`)).data?.attributes ?? {};
check('2.1    App Review contact complete', Boolean(detail.contactFirstName && detail.contactLastName && detail.contactPhone && detail.contactEmail), '');
check('2.1    demo account supplied', Boolean(detail.demoAccountName && detail.demoAccountPassword), detail.demoAccountName ?? 'MISSING');
check('2.3.1  review notes present', String(detail.notes ?? '').length > 200, `${String(detail.notes ?? '').length} chars`);

// ── Assets and build ────────────────────────────────────────────────────────────────────────
const sets = await api(`/v1/appStoreVersionLocalizations/${loc.id}/appScreenshotSets?limit=20&include=appScreenshots`);
const shots = (sets.data ?? []).reduce((n, s) => n + (s.relationships?.appScreenshots?.data ?? []).length, 0);
check('2.3.3  screenshots present', shots > 0, `${shots} across ${(sets.data ?? []).length} set(s)`);

const builds = await api(`/v1/apps/${cfg.ascAppId}/builds?limit=200&fields[builds]=version,processingState,expired`);
const attachedId = version.relationships?.build?.data?.id ?? null;
const attached = (builds.data ?? []).find((b) => b.id === attachedId);
check('2.1    a build is attached', Boolean(attached), attached ? `build ${attached.attributes.version}` : 'NONE');
if (attached) {
  check('2.1    attached build is VALID and unexpired', attached.attributes.processingState === 'VALID' && !attached.attributes.expired,
    `${attached.attributes.processingState}, expired=${attached.attributes.expired}`);
  if (WANT_BUILD) check('       attached build is the one intended', attached.attributes.version === WANT_BUILD, `attached ${attached.attributes.version}, wanted ${WANT_BUILD}`);
}

// ── Subscriptions ───────────────────────────────────────────────────────────────────────────
const groups = await api(`/v1/apps/${cfg.ascAppId}/subscriptionGroups?include=subscriptions&limit=10&limit[subscriptions]=20`);
const subs = (groups.included ?? []).filter((x) => x.type === 'subscriptions');
check('3.1.2  subscriptions exist', subs.length > 0, `${subs.length} product(s)`);
for (const sub of subs) {
  const st = sub.attributes.state;
  check(`3.1.2  ${sub.attributes.productId} submittable`, ['READY_TO_SUBMIT', 'APPROVED', 'WAITING_FOR_REVIEW', 'IN_REVIEW', 'DEVELOPER_ACTION_NEEDED'].includes(st) && st !== 'DEVELOPER_ACTION_NEEDED', st);
  const ls = await api(`/v1/subscriptions/${sub.id}/subscriptionLocalizations?limit=10`);
  const en = (ls.data ?? []).find((l) => l.attributes.locale === 'en-US');
  check(`3.1.2  ${sub.attributes.productId} has name + description`, Boolean(en?.attributes?.name && en?.attributes?.description), en?.attributes?.name ?? 'MISSING');
}

// ── 2.1(b) Purchasability ─────────────────────────────────────────────────────────────
/*
 * WHY THIS SECTION EXISTS. On 2026-09-04 build 24 was rejected under Guideline 2.1(b) -- "we are
 * unable to purchase item" -- reviewed on an iPad Air 11-inch. Every check above this line passed
 * on that same submission, 28/28. They read metadata; none of them could see whether a product
 * could actually be BOUGHT.
 *
 * The root cause was account-level, not code: the Paid Apps Agreement sat at "Pending User Info"
 * because no bank account and no tax forms had been filed. With that agreement inactive, StoreKit
 * returns zero products, RevenueCat drops every package whose product it cannot resolve, and the
 * paywall renders with fallback prices while being impossible to purchase from. The app logs
 * "[iap] configured but the current offering has NO packages" and looks otherwise healthy.
 */

/* THIS CHECK ALONE WOULD NOT HAVE CAUGHT THE 2026-09-04 REJECTION, AND MUST NOT BE TRUSTED AS IF
 * IT WOULD. RevenueCat's server returned current_offering_id "default" with both packages attached
 * the entire time the app was unpurchasable -- the dashboard was correct; the device-side StoreKit
 * fetch was not. What this DOES catch is a product being detached from the current offering in the
 * RevenueCat dashboard, which is a real and separate way to ship a dead paywall. */
const rcKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
  ?? (readFileSync(path.join(ROOT, '.env.local'), 'utf8').match(/^EXPO_PUBLIC_REVENUECAT_IOS_KEY=(.+)$/m)?.[1] ?? '').trim();
if (!rcKey) {
  check('3.1.2  RevenueCat offering reachable', false, 'EXPO_PUBLIC_REVENUECAT_IOS_KEY not set');
} else {
  try {
    const r = await fetch('https://api.revenuecat.com/v1/subscribers/asc-preflight/offerings', {
      headers: { Authorization: `Bearer ${rcKey}`, 'X-Platform': 'ios' },
      signal: AbortSignal.timeout(20000),
    });
    const rc = await r.json();
    const current = (rc.offerings ?? []).find((o) => o.identifier === rc.current_offering_id);
    const shipped = (current?.packages ?? []).map((k) => k.platform_product_identifier);
    check('3.1.2  RevenueCat current offering has packages', shipped.length > 0, `${rc.current_offering_id ?? 'no current offering'} -> ${shipped.join(', ') || 'EMPTY'}`);
    for (const sub of subs) {
      const id = sub.attributes.productId;
      check(`3.1.2  ${id} attached to the current offering`, shipped.includes(id), shipped.includes(id) ? 'attached' : `MISSING from ${rc.current_offering_id}`);
    }
  } catch (e) {
    check('3.1.2  RevenueCat offering reachable', false, String(e).slice(0, 120));
  }
}

/* THE PAID APPS AGREEMENT HAS NO APP STORE CONNECT API. /v1/agreements, /v1/contracts and
 * /v1/paidApplicationsAgreements all 404 as of 2026-09-04, so this file cannot read the one piece
 * of state that actually caused the rejection. Rather than pass silently on a fact it cannot
 * check -- the failure mode this whole script exists to prevent -- it fails until a human has
 * looked and says so with --agreement-verified. Look at the STATUS column, not the dates: an
 * agreement can show a live date range while sitting at "Pending User Info". */
check(
  '2.1(b)  Paid Apps Agreement confirmed Active (manual)',
  process.argv.includes('--agreement-verified'),
  process.argv.includes('--agreement-verified')
    ? 'operator confirmed'
    : 'UNVERIFIED -- open https://appstoreconnect.apple.com/business, confirm Paid Apps Agreement STATUS is Active (not "Pending User Info"), then rerun with --agreement-verified',
);

// ── Legal / rating ──────────────────────────────────────────────────────────────────────────
check('2.3.6  age rating set', Boolean(infos.data?.[0]?.attributes?.appStoreAgeRating), infos.data?.[0]?.attributes?.appStoreAgeRating ?? 'MISSING');
check('       copyright set', Boolean(version.attributes.copyright), version.attributes.copyright ?? 'MISSING');
check('2.3.7  app name within 30 chars', (infoLoc[0]?.name ?? '').length <= 30 && (infoLoc[0]?.name ?? '').length > 0, `${(infoLoc[0]?.name ?? '').length} chars`);

// ── Report ──────────────────────────────────────────────────────────────────────────────────
const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  — ${r.detail}` : ''}`);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length) {
  console.log('\nDO NOT SUBMIT. Failing checks:');
  for (const r of failed) console.log(`  - ${r.name} — ${r.detail}`);
  process.exit(1);
}
console.log('All pre-submission checks passed.');
