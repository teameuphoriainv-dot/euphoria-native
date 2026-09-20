#!/usr/bin/env node
/**
 * READ-ONLY audit of the whole App Store listing, every version and every locale.
 *
 * WHY THIS EXISTS ALONGSIDE asc-listing.mjs. That script answers "what does en-US say", which was
 * the right question when en-US was the only localization. There are four now, and the things that
 * actually block a submission (a missing What's New, a locale with no screenshots, a promotional
 * text that did not carry forward) are per locale and invisible in an en-US-only read.
 *
 * IT CANNOT WRITE. `api()` hard-fails on any method other than GET, so this file cannot be turned
 * into a writer by editing a string. Submission is the product owner's call, not a script's, and
 * the safest way to hold that line is to make the read tool incapable of crossing it.
 *
 *   node scripts/asc-audit.mjs              summary table plus the submission blockers
 *   node scripts/asc-audit.mjs --full       every field in full, not truncated
 *   node scripts/asc-audit.mjs --json       machine-readable dump, for diffing between runs
 */
import { Buffer } from 'node:buffer';
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const cfg = JSON.parse(readFileSync(path.join(ROOT, 'eas.json'), 'utf8'))?.submit?.production?.ios;
const keyPath = path.resolve(ROOT, cfg.ascApiKeyPath);
const keyId = cfg.ascApiKeyId ?? path.basename(keyPath).replace(/^AuthKey_|\.p8$/g, '');
const privateKey = readFileSync(keyPath, 'utf8');
const APP_ID = cfg.ascAppId;

const FULL = process.argv.includes('--full');
const JSON_OUT = process.argv.includes('--json');

const b64 = (v) => Buffer.from(JSON.stringify(v)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const header = b64({ alg: 'ES256', kid: keyId, typ: 'JWT' });
const payload = b64({ iss: cfg.ascApiKeyIssuerId, iat: now, exp: now + 900, aud: 'appstoreconnect-v1' });
const signer = createSign('SHA256');
signer.update(`${header}.${payload}`);
const jwt = `${header}.${payload}.${signer.sign({ key: privateKey, dsaEncoding: 'ieee-p1363' }).toString('base64url')}`;

/** GET only. Anything else throws before a request is made. */
async function api(p, method = 'GET') {
  if (method !== 'GET') throw new Error(`asc-audit is read-only; refused ${method} ${p}`);
  const r = await fetch(`https://api.appstoreconnect.apple.com${p}`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  /*
   * `data: null`, NOT `data: []`. An empty array is TRUTHY, so the first version of this returned
   * it on a 404 and every `x.data ? ... : ...` downstream took the present branch. That made
   * `submitted` read true for a version whose submission endpoint 404s, which is the single worst
   * thing this file could get wrong: it would have reported a live product as already submitted.
   */
  if (!r.ok) return { error: `${String(r.status)} ${p}`, status: r.status, data: null };
  return r.json();
}

const chars = (s) => (s ? [...String(s)].length : 0);
const LIMITS = { name: 30, subtitle: 30, keywords: 100, promotionalText: 170, description: 4000, whatsNew: 4000 };

const report = { appId: APP_ID, appInfos: [], versions: [], events: [], blockers: [], warnings: [] };

// ── app-level ───────────────────────────────────────────────────────────────────────────────
const app = await api(`/v1/apps/${APP_ID}`);
report.bundleId = app.data?.attributes?.bundleId;
report.appName = app.data?.attributes?.name;
report.sku = app.data?.attributes?.sku;

// `?include=` is required for the category relationships; without it they come back undefined and
// this file would print "undefined / none" for an app that has both set.
const infos = await api(`/v1/apps/${APP_ID}/appInfos?include=primaryCategory,secondaryCategory`);
for (const info of infos.data ?? []) {
  const entry = {
    id: info.id,
    state: info.attributes?.appStoreState,
    ageRating: info.attributes?.appStoreAgeRating,
    primaryCategory: info.relationships?.primaryCategory?.data?.id,
    secondaryCategory: info.relationships?.secondaryCategory?.data?.id,
    locales: [],
  };
  const locs = await api(`/v1/appInfos/${info.id}/appInfoLocalizations`);
  for (const l of locs.data ?? []) {
    const a = l.attributes ?? {};
    entry.locales.push({
      id: l.id,
      locale: a.locale,
      name: a.name,
      subtitle: a.subtitle,
      privacyPolicyUrl: a.privacyPolicyUrl,
    });
  }
  entry.locales.sort((x, y) => String(x.locale).localeCompare(String(y.locale)));
  report.appInfos.push(entry);
}

// ── versions ────────────────────────────────────────────────────────────────────────────────
const versions = await api(`/v1/apps/${APP_ID}/appStoreVersions?limit=10`);
for (const v of versions.data ?? []) {
  const va = v.attributes ?? {};
  const entry = {
    id: v.id,
    versionString: va.versionString,
    state: va.appStoreState ?? va.appVersionState,
    releaseType: va.releaseType,
    createdDate: va.createdDate,
    build: null,
    locales: [],
  };

  const build = await api(`/v1/appStoreVersions/${v.id}/build`);
  entry.build = build.data ? { id: build.data.id, version: build.data.attributes?.version } : null;


  const locs = await api(`/v1/appStoreVersions/${v.id}/appStoreVersionLocalizations`);
  for (const l of locs.data ?? []) {
    const a = l.attributes ?? {};
    const loc = {
      id: l.id,
      locale: a.locale,
      keywords: a.keywords ?? '',
      promotionalText: a.promotionalText ?? '',
      description: a.description ?? '',
      whatsNew: a.whatsNew ?? '',
      marketingUrl: a.marketingUrl ?? '',
      supportUrl: a.supportUrl ?? '',
      screenshotSets: [],
    };
    const sets = await api(`/v1/appStoreVersionLocalizations/${l.id}/appScreenshotSets`);
    for (const s of sets.data ?? []) {
      const shots = await api(`/v1/appScreenshotSets/${s.id}/appScreenshots`);
      loc.screenshotSets.push({
        id: s.id,
        displayType: s.attributes?.screenshotDisplayType,
        count: (shots.data ?? []).length,
        states: [...new Set((shots.data ?? []).map((x) => x.attributes?.assetDeliveryState?.state))],
      });
    }
    entry.locales.push(loc);
  }
  entry.locales.sort((x, y) => String(x.locale).localeCompare(String(y.locale)));
  report.versions.push(entry);
}

/*
 * SUBMISSION STATE, read from the modern endpoint.
 *
 * `/appStoreVersionSubmission` is the legacy per-version relationship and 404s on this app for both
 * versions, including the one that is READY_FOR_SALE, so it cannot distinguish submitted from not.
 * `reviewSubmissions` is the authority: a submission carries items, and an item names the version
 * it covers. An open container with zero items and a null submittedDate is App Store Connect's
 * staging area, not a submission.
 */
const reviews = await api(`/v1/apps/${APP_ID}/reviewSubmissions?limit=10`);
report.reviewSubmissions = [];
for (const s of reviews.data ?? []) {
  const items = await api(`/v1/reviewSubmissions/${s.id}/items`);
  report.reviewSubmissions.push({
    id: s.id,
    state: s.attributes?.state,
    submittedDate: s.attributes?.submittedDate,
    itemCount: (items.data ?? []).length,
    itemStates: [...new Set((items.data ?? []).map((i) => i.attributes?.state))],
  });
}
const inFlight = report.reviewSubmissions.filter((s) => s.submittedDate && s.state !== 'COMPLETE');
report.anythingInFlight = inFlight.length > 0;

// ── in-app events ───────────────────────────────────────────────────────────────────────────
const events = await api(`/v1/apps/${APP_ID}/appEvents`);
for (const e of events.data ?? []) {
  report.events.push({
    id: e.id,
    referenceName: e.attributes?.referenceName,
    state: e.attributes?.eventState,
    badge: e.attributes?.badge,
  });
}

// ── what blocks a submission ────────────────────────────────────────────────────────────────
/*
 * These are the rules App Store Connect enforces at submission time, checked here so they surface
 * before someone clicks the button rather than after. Apple's own error messages for these arrive
 * one at a time, which turns a five-minute fix into five round trips.
 */
const staged = report.versions.find((v) => v.state === 'PREPARE_FOR_SUBMISSION');
if (!staged) {
  report.warnings.push('no version is in PREPARE_FOR_SUBMISSION, so there is nothing staged to submit');
} else {
  const primary = staged.locales.find((l) => l.locale === 'en-US') ?? staged.locales[0];
  if (!staged.build) report.blockers.push(`${staged.versionString}: no build attached`);
  const isFirstVersion = report.versions.length === 1;
  for (const l of staged.locales) {
    if (!l.description) report.blockers.push(`${staged.versionString} ${l.locale}: description is empty`);
    if (!l.keywords) report.blockers.push(`${staged.versionString} ${l.locale}: keywords are empty`);
    // What's New is required on every version after the first, in every locale.
    if (!isFirstVersion && !l.whatsNew) {
      report.blockers.push(`${staged.versionString} ${l.locale}: What's New is empty, and Apple requires it on an update`);
    }
    const shots = l.screenshotSets.reduce((n, s) => n + s.count, 0);
    if (shots === 0) report.blockers.push(`${staged.versionString} ${l.locale}: no screenshots`);
    for (const s of l.screenshotSets) {
      const bad = s.states.filter((st) => st && st !== 'COMPLETE');
      if (bad.length) report.blockers.push(`${staged.versionString} ${l.locale}: ${s.displayType} has assets in state ${bad.join(', ')}`);
    }
    for (const [field, limit] of Object.entries(LIMITS)) {
      if (l[field] === undefined) continue;
      const n = chars(l[field]);
      if (n > limit) report.blockers.push(`${staged.versionString} ${l.locale}: ${field} is ${String(n)}/${String(limit)}, Apple truncates silently`);
    }
    // A field that is populated live but empty on the staged version is a SILENT LOSS: shipping
    // the version replaces the live listing wholesale, it does not merge.
    const live = report.versions.find((v) => v.state === 'READY_FOR_SALE');
    const liveLoc = live?.locales.find((x) => x.locale === l.locale);
    if (liveLoc) {
      for (const field of ['promotionalText', 'marketingUrl', 'supportUrl']) {
        if (liveLoc[field] && !l[field]) {
          report.warnings.push(`${staged.versionString} ${l.locale}: ${field} is populated on the live version but EMPTY here, so shipping drops it`);
        }
      }
    }
    if (primary && l !== primary && l.screenshotSets.length !== primary.screenshotSets.length) {
      report.warnings.push(`${staged.versionString} ${l.locale}: ${String(l.screenshotSets.length)} screenshot sets against ${String(primary.screenshotSets.length)} on ${primary.locale}`);
    }
  }
  const infoStaged = report.appInfos.find((i) => i.state === 'PREPARE_FOR_SUBMISSION');
  if (infoStaged) {
    for (const l of infoStaged.locales) {
      for (const field of ['name', 'subtitle']) {
        const n = chars(l[field]);
        if (n > LIMITS[field]) report.blockers.push(`appInfo ${l.locale}: ${field} is ${String(n)}/${String(LIMITS[field])}`);
        if (n === 0) report.blockers.push(`appInfo ${l.locale}: ${field} is empty`);
      }
    }
    const stagedLocales = new Set(staged.locales.map((l) => l.locale));
    const infoLocales = new Set(infoStaged.locales.map((l) => l.locale));
    for (const loc of stagedLocales) {
      if (!infoLocales.has(loc)) report.blockers.push(`${loc} has version metadata but no name/subtitle localization`);
    }
  }
}

if (JSON_OUT) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

// ── human output ────────────────────────────────────────────────────────────────────────────
const cut = (s, n) => (FULL ? s : String(s).replace(/\n/g, ' ').slice(0, n));
console.log(`\nApp ${report.appId}  ${report.appName}  (${report.bundleId})`);

for (const info of report.appInfos) {
  console.log(`\n=== appInfo ${info.id}  ${info.state}  rating=${info.ageRating}  ${info.primaryCategory} / ${info.secondaryCategory ?? 'none'}`);
  for (const l of info.locales) {
    console.log(`  ${l.locale.padEnd(6)} name ${String(chars(l.name)).padStart(2)}/30  subtitle ${String(chars(l.subtitle)).padStart(2)}/30  "${l.subtitle}"`);
  }
}

for (const v of report.versions) {
  console.log(`\n=== version ${v.versionString}  ${v.state}  build=${v.build ? v.build.version : 'NONE'}  id=${v.id}`);
  for (const l of v.locales) {
    const shots = l.screenshotSets.reduce((n, s) => n + s.count, 0);
    const states = [...new Set(l.screenshotSets.flatMap((s) => s.states))].filter(Boolean).join(',') || 'none';
    console.log(`  ${l.locale.padEnd(6)} kw ${String(chars(l.keywords)).padStart(3)}/100  promo ${String(chars(l.promotionalText)).padStart(3)}/170  desc ${String(chars(l.description)).padStart(4)}/4000  whatsNew ${String(chars(l.whatsNew)).padStart(4)}  shots ${String(shots)} [${states}]`);
    if (FULL) {
      console.log(`         keywords: ${l.keywords}`);
      console.log(`         promo:    ${l.promotionalText || '(empty)'}`);
      console.log(`         whatsNew: ${l.whatsNew || '(empty)'}`);
      console.log(`         marketing:${l.marketingUrl || '(empty)'}  support:${l.supportUrl || '(empty)'}`);
    } else {
      console.log(`         kw: ${cut(l.keywords, 110)}`);
    }
  }
}

console.log(`\n=== review submissions (${String(report.reviewSubmissions.length)})`);
for (const s of report.reviewSubmissions) {
  console.log(`  ${s.id}  ${s.state}  submittedDate=${s.submittedDate ?? 'null'}  items=${String(s.itemCount)} [${s.itemStates.join(',') || 'none'}]`);
}
console.log(`  anything in flight with Apple right now: ${report.anythingInFlight ? 'YES' : 'no'}`);

console.log(`\n=== in-app events (${String(report.events.length)})`);
for (const e of report.events) console.log(`  ${e.id}  ${e.referenceName}  ${e.state}  badge=${e.badge}`);

console.log(`\n=== BLOCKERS (${String(report.blockers.length)})`);
for (const b of report.blockers) console.log(`  BLOCK  ${b}`);
console.log(`\n=== WARNINGS (${String(report.warnings.length)})`);
for (const w of report.warnings) console.log(`  WARN   ${w}`);
console.log('');
