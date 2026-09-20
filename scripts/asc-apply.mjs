#!/usr/bin/env node
/**
 * The ONLY script in this repo that writes to App Store Connect, deliberately narrow.
 *
 * WHY IT IS SHAPED LIKE THIS. This is a live product with paying users, and a listing edit is
 * outward-facing and hard to take back. The previous ASO rounds were run with a general purpose
 * writer that could PATCH anything, which is one typo away from editing the wrong version. So this
 * file cannot express most mistakes:
 *
 *   1. It refuses to touch a version that is not PREPARE_FOR_SUBMISSION. The live listing is
 *      unreachable from here, by construction rather than by care.
 *   2. It only writes the fields named in ALLOWED_VERSION_FIELDS. Keywords, description, subtitle
 *      and name are not in that set and cannot be reached.
 *   3. There is no submission path at all. No reviewSubmissions, no appStoreVersionSubmissions, no
 *      build attach. Submitting is the owner's decision and is not automatable from here.
 *   4. It is a DRY RUN unless `--apply` is passed, and it prints the exact before and after first.
 *   5. Everything it writes, it reads back and diffs.
 *
 *   node scripts/asc-apply.mjs             show what would change, write nothing
 *   node scripts/asc-apply.mjs --apply     do it, then read back and verify
 */
import { Buffer } from 'node:buffer';
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const cfg = JSON.parse(readFileSync(path.join(ROOT, 'eas.json'), 'utf8'))?.submit?.production?.ios;
const privateKey = readFileSync(path.resolve(ROOT, cfg.ascApiKeyPath), 'utf8');
const APP_ID = cfg.ascAppId;
const APPLY = process.argv.includes('--apply');

/** Fields this script may ever write on a staged version localization. Nothing else is reachable. */
const ALLOWED_VERSION_FIELDS = new Set(['promotionalText', 'whatsNew']);

const b64 = (v) => Buffer.from(JSON.stringify(v)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const h = b64({ alg: 'ES256', kid: cfg.ascApiKeyId, typ: 'JWT' });
const p = b64({ iss: cfg.ascApiKeyIssuerId, iat: now, exp: now + 900, aud: 'appstoreconnect-v1' });
const signer = createSign('SHA256');
signer.update(`${h}.${p}`);
const jwt = `${h}.${p}.${signer.sign({ key: privateKey, dsaEncoding: 'ieee-p1363' }).toString('base64url')}`;

const BANNED = /reviewSubmission|appStoreVersionSubmission|\/build\b|relationships\/build/i;

async function call(method, url, body) {
  // A submission cannot be made by accident, because it cannot be expressed.
  if (BANNED.test(url)) throw new Error(`refused: ${url} is a submission or build path, which this script must never touch`);
  const r = await fetch(`https://api.appstoreconnect.apple.com${url}`, {
    method,
    headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  const json = text ? JSON.parse(text) : null;
  if (!r.ok) throw new Error(`${method} ${url} -> ${String(r.status)} ${text.slice(0, 400)}`);
  return json;
}
const get = (url) => call('GET', url);

const chars = (s) => (s ? [...String(s)].length : 0);

// ── locate the staged version, and refuse anything else ─────────────────────────────────────
const versions = await get(`/v1/apps/${APP_ID}/appStoreVersions?limit=10`);
const staged = (versions.data ?? []).find((v) => v.attributes?.appStoreState === 'PREPARE_FOR_SUBMISSION');
if (!staged) throw new Error('no PREPARE_FOR_SUBMISSION version; there is nothing this script is allowed to edit');
const live = (versions.data ?? []).find((v) => v.attributes?.appStoreState === 'READY_FOR_SALE');

console.log(`\nstaged version ${staged.attributes.versionString} (${staged.id}) state=${staged.attributes.appStoreState}`);
console.log(`live version   ${live?.attributes?.versionString ?? '(none)'} state=${live?.attributes?.appStoreState ?? '-'}  READ ONLY, never written by this script`);
console.log(APPLY ? '\nMODE: APPLY\n' : '\nMODE: DRY RUN, nothing will be written. Pass --apply to write.\n');

const stagedLocs = (await get(`/v1/appStoreVersions/${staged.id}/appStoreVersionLocalizations`)).data ?? [];
const liveLocs = live ? (await get(`/v1/appStoreVersions/${live.id}/appStoreVersionLocalizations`)).data ?? [] : [];
const byLocale = (list) => Object.fromEntries(list.map((l) => [l.attributes.locale, l]));
const stagedBy = byLocale(stagedLocs);
const liveBy = byLocale(liveLocs);

// ── the plan ────────────────────────────────────────────────────────────────────────────────
/*
 * PROMOTIONAL TEXT, en-US only.
 *
 * Copied byte for byte off the LIVE version rather than retyped, for the reason the description
 * sync used the same trick: a retyped string is a new string, and a one-character drift in a field
 * nobody diffs is exactly the class of error this round exists to remove.
 *
 * It is empty on the staged version and populated on the live one. A shipped version REPLACES the
 * listing rather than merging into it, so submitting 1.0.1 as staged would silently delete a field
 * that is currently doing work.
 */
const plan = [];
const livePromo = liveBy['en-US']?.attributes?.promotionalText ?? '';
const stagedPromo = stagedBy['en-US']?.attributes?.promotionalText ?? '';
if (!livePromo) {
  console.log('  skip: the live version has no promotional text to restore');
} else if (stagedPromo === livePromo) {
  console.log('  skip: staged promotional text already matches live');
} else {
  plan.push({
    kind: 'versionLocalization',
    id: stagedBy['en-US'].id,
    locale: 'en-US',
    field: 'promotionalText',
    before: stagedPromo,
    after: livePromo,
  });
}

/*
 * WHAT'S NEW, all four locales, read from refs/ASO_WHATS_NEW.json.
 *
 * KEYED BY VERSION STRING, and the key must match the staged version or nothing is written. Copy
 * describing one release landing on another is a silent, plausible-looking lie, and it is exactly
 * the kind of thing that survives review because it reads fine.
 *
 * The copy lives in a committed file rather than inline here so it can be diffed and argued with.
 * Its header records the measurement behind every claim in it.
 */
const whatsNewAll = JSON.parse(readFileSync(path.join(ROOT, 'refs/ASO_WHATS_NEW.json'), 'utf8'));
const whatsNew = whatsNewAll[staged.attributes.versionString];
if (!whatsNew) {
  console.log(`  skip: refs/ASO_WHATS_NEW.json has no copy for version ${staged.attributes.versionString}, so none is written`);
} else {
  for (const [locale, text] of Object.entries(whatsNew)) {
    if (locale.startsWith('_')) continue;
    const loc = stagedBy[locale];
    if (!loc) {
      console.log(`  skip: ${locale} has copy but no localization on the staged version`);
      continue;
    }
    const before = loc.attributes.whatsNew ?? '';
    if (before === text) {
      console.log(`  skip: ${locale} whatsNew already matches`);
      continue;
    }
    // Never silently overwrite copy someone else wrote. Filling an EMPTY field is the approved job.
    if (before) {
      console.log(`  skip: ${locale} whatsNew is already populated (${String(chars(before))} chars); not overwriting someone else's copy`);
      continue;
    }
    plan.push({ kind: 'versionLocalization', id: loc.id, locale, field: 'whatsNew', before, after: text });
  }
}

for (const step of plan) {
  if (!ALLOWED_VERSION_FIELDS.has(step.field)) throw new Error(`refused: ${step.field} is not an editable field for this script`);
  const limit = step.field === 'promotionalText' ? 170 : 4000;
  if (chars(step.after) > limit) throw new Error(`refused: ${step.locale} ${step.field} would be ${String(chars(step.after))}/${String(limit)} and Apple truncates silently`);
  // No em or en dash may reach a user-facing field. scripts/em-dash-prose-pin.mjs holds the same
  // line inside the app; a listing field is the same prose in a place the pin cannot see.
  const dash = [...step.after].find((c) => c === '\u2014' || c === '\u2013');
  if (dash) throw new Error(`refused: ${step.locale} ${step.field} contains an em or en dash`);
  console.log(`  ${step.locale} ${step.field}: ${String(chars(step.before))} -> ${String(chars(step.after))}/${String(limit)}`);
  console.log(`    before: ${step.before || '(empty)'}`);
  console.log(`    after:  ${step.after.replace(/\n/g, ' ').slice(0, 160)}${chars(step.after) > 160 ? ' ...' : ''}`);
}

// ── in-app event localizations for the three storefronts that have none ─────────────────────
/*
 * The event text is reused VERBATIM from en-US, which is correct rather than lazy: every number in
 * it is read from src/lib/league-week.ts and src/lib/day-keys.ts, and none of them is
 * territory-specific. There is no price, no currency and no spelling that differs between these
 * four English storefronts, so a "localized" rewrite would introduce difference for its own sake
 * and give four chances to drift from the source of truth instead of one.
 */
const event = (await get(`/v1/apps/${APP_ID}/appEvents`)).data?.[0];
const eventPlan = [];
if (event) {
  if (event.attributes.eventState !== 'DRAFT') {
    console.log(`\n  skip: event ${event.id} is ${event.attributes.eventState}, not DRAFT. This script only fills in a draft.`);
  } else {
    const evLocs = (await get(`/v1/appEvents/${event.id}/localizations`)).data ?? [];
    const primary = evLocs.find((l) => l.attributes.locale === 'en-US');
    const have = new Set(evLocs.map((l) => l.attributes.locale));
    if (!primary) {
      console.log('\n  skip: the event has no en-US localization to copy from');
    } else {
      for (const locale of ['en-GB', 'en-CA', 'en-AU']) {
        if (have.has(locale)) continue;
        eventPlan.push({
          locale,
          name: primary.attributes.name,
          shortDescription: primary.attributes.shortDescription,
          longDescription: primary.attributes.longDescription,
        });
      }
    }
  }
}
if (eventPlan.length) {
  console.log(`\n  event ${event.id} "${event.attributes.referenceName}" (${event.attributes.eventState}): add ${String(eventPlan.length)} localizations`);
  for (const e of eventPlan) {
    console.log(`    ${e.locale}  name ${String(chars(e.name))}/30  short ${String(chars(e.shortDescription))}/50  long ${String(chars(e.longDescription))}`);
  }
}

if (!plan.length && !eventPlan.length) {
  console.log('\nnothing to do.\n');
  process.exit(0);
}

if (!APPLY) {
  console.log('\nDRY RUN complete. Nothing was written. Re-run with --apply to write.\n');
  process.exit(0);
}

// ── write, then read back ───────────────────────────────────────────────────────────────────
for (const step of plan) {
  await call('PATCH', `/v1/appStoreVersionLocalizations/${step.id}`, {
    data: { type: 'appStoreVersionLocalizations', id: step.id, attributes: { [step.field]: step.after } },
  });
  console.log(`  wrote ${step.locale} ${step.field}`);
}
for (const e of eventPlan) {
  const created = await call('POST', '/v1/appEventLocalizations', {
    data: {
      type: 'appEventLocalizations',
      attributes: { locale: e.locale, name: e.name, shortDescription: e.shortDescription, longDescription: e.longDescription },
      relationships: { appEvent: { data: { type: 'appEvents', id: event.id } } },
    },
  });
  console.log(`  created event localization ${e.locale} -> ${created.data.id}`);
}

console.log('\nreading back:');
let bad = 0;
const after = (await get(`/v1/appStoreVersions/${staged.id}/appStoreVersionLocalizations`)).data ?? [];
const afterBy = byLocale(after);
for (const step of plan) {
  const got = afterBy[step.locale]?.attributes?.[step.field] ?? '';
  const ok = got === step.after;
  if (!ok) bad += 1;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${step.locale} ${step.field} (${String(chars(got))})`);
}
const evAfter = event ? (await get(`/v1/appEvents/${event.id}/localizations`)).data ?? [] : [];
for (const e of eventPlan) {
  const got = evAfter.find((l) => l.attributes.locale === e.locale);
  const ok = got && got.attributes.longDescription === e.longDescription;
  if (!ok) bad += 1;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} event ${e.locale}`);
}

// The live listing must be byte-identical to what it was before this ran. It is never written, but
// "never written" is a claim, and the point of this repo is that claims get checked.
if (live) {
  const liveAfter = byLocale((await get(`/v1/appStoreVersions/${live.id}/appStoreVersionLocalizations`)).data ?? []);
  for (const [locale, before] of Object.entries(liveBy)) {
    const now2 = liveAfter[locale]?.attributes ?? {};
    for (const f of ['promotionalText', 'keywords', 'description', 'whatsNew']) {
      if ((before.attributes[f] ?? '') !== (now2[f] ?? '')) {
        bad += 1;
        console.log(`  FAIL live ${locale} ${f} CHANGED, which must never happen`);
      }
    }
  }
  console.log(`  ok   live ${live.attributes.versionString} unchanged in every field`);
}

console.log(bad ? `\n${String(bad)} verification failures\n` : '\nall writes verified\n');
process.exit(bad ? 1 : 0);
