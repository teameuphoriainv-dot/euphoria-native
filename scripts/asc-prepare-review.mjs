#!/usr/bin/env node
/**
 * Add the app version, subscription group version, and subscription versions to one App Review
 * submission. This script deliberately cannot submit the draft or mark rejected items resolved.
 *
 * Usage:
 *   node scripts/asc-prepare-review.mjs          # read-only plan
 *   node scripts/asc-prepare-review.mjs --resolve-rejected-app-item
 *   node scripts/asc-prepare-review.mjs --apply  # add only missing items
 */
import { Buffer } from 'node:buffer';
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const cfg = JSON.parse(readFileSync(path.join(ROOT, 'eas.json'), 'utf8'))?.submit?.production?.ios;
if (!cfg?.ascApiKeyPath || !cfg.ascApiKeyIssuerId || !cfg.ascAppId) {
  throw new Error('eas.json submit.production.ios is missing App Store Connect configuration');
}

const keyPath = path.resolve(ROOT, cfg.ascApiKeyPath);
const keyId = cfg.ascApiKeyId ?? path.basename(keyPath).replace(/^AuthKey_|\.p8$/g, '');
const privateKey = readFileSync(keyPath, 'utf8');
const base64url = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const header = base64url({ alg: 'ES256', kid: keyId, typ: 'JWT' });
const payload = base64url({ iss: cfg.ascApiKeyIssuerId, iat: now, exp: now + 15 * 60, aud: 'appstoreconnect-v1' });
const signer = createSign('SHA256');
signer.update(`${header}.${payload}`);
const jwt = `${header}.${payload}.${signer.sign({ key: privateKey, dsaEncoding: 'ieee-p1363' }).toString('base64url')}`;

async function request(method, resourcePath, body) {
  const response = await fetch(`https://api.appstoreconnect.apple.com${resourcePath}`, {
    method,
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  if (!response.ok) {
    let detail = text.slice(0, 500);
    try {
      detail = (JSON.parse(text).errors ?? [])
        .map((error) => `${error.status ?? response.status} ${error.code ?? ''} ${error.detail ?? ''}`.trim())
        .join('; ');
    } catch {
      // Keep the bounded response excerpt.
    }
    throw new Error(`${resourcePath} -> ${response.status}: ${detail}`);
  }
  return text ? JSON.parse(text) : {};
}

const get = (resourcePath) => request('GET', resourcePath);
const encode = (params) => new URLSearchParams(params).toString();

if (process.argv.includes('--create-draft')) {
  const created = await request('POST', '/v1/reviewSubmissions', {
    data: {
      type: 'reviewSubmissions',
      relationships: { app: { data: { type: 'apps', id: cfg.ascAppId } } },
    },
  });
  console.log(JSON.stringify({
    created: true,
    submission: { id: created.data?.id ?? null, state: created.data?.attributes?.state ?? null },
  }, null, 2));
  process.exit(0);
}

const submissions = await get(`/v1/apps/${cfg.ascAppId}/reviewSubmissions?${encode({ limit: '50' })}`);

if (process.argv.includes('--cancel-unresolved')) {
  const unresolved = (submissions.data ?? []).find((item) => item.attributes?.state === 'UNRESOLVED_ISSUES');
  if (!unresolved) throw new Error('No unresolved App Review submission was found');
  const canceled = await request('PATCH', `/v1/reviewSubmissions/${unresolved.id}`, {
    data: {
      type: 'reviewSubmissions',
      id: unresolved.id,
      attributes: { canceled: true },
    },
  });
  console.log(JSON.stringify({
    canceled: true,
    submission: { id: canceled.data?.id ?? unresolved.id, state: canceled.data?.attributes?.state ?? null },
  }, null, 2));
  process.exit(0);
}

const wantsRejectedItem = process.argv.includes('--resolve-rejected-app-item');
const submission = wantsRejectedItem
  ? (submissions.data ?? []).find((item) => item.attributes?.state === 'UNRESOLVED_ISSUES')
  : (submissions.data ?? []).find((item) => ['PREPARE_FOR_SUBMISSION', 'READY_FOR_REVIEW'].includes(item.attributes?.state))
    ?? (submissions.data ?? []).find((item) => item.attributes?.state === 'UNRESOLVED_ISSUES');
if (!submission) throw new Error('No editable App Review submission exists for this app');

const appVersions = await get(`/v1/apps/${cfg.ascAppId}/appStoreVersions?${encode({
  'filter[platform]': 'IOS',
  include: 'build',
  limit: '10',
})}`);
const appVersion = (appVersions.data ?? []).find((item) => item.relationships?.build?.data?.id);
if (!appVersion) throw new Error('No iOS App Store version with an attached build was found');

const groups = await get(`/v1/apps/${cfg.ascAppId}/subscriptionGroups?${encode({
  include: 'subscriptions',
  limit: '50',
  'limit[subscriptions]': '50',
})}`);
const subscriptions = (groups.included ?? []).filter((item) => item.type === 'subscriptions');
if (!subscriptions.length) throw new Error('No subscriptions were found');

const groupIds = new Set(subscriptions.map((subscription) => {
  const group = (groups.data ?? []).find((candidate) =>
    candidate.relationships?.subscriptions?.data?.some((item) => item.id === subscription.id));
  return group?.id;
}).filter(Boolean));
if (groupIds.size !== 1) throw new Error(`Expected one populated subscription group, found ${groupIds.size}`);

const groupId = [...groupIds][0];
const groupVersions = await get(`/v1/subscriptionGroups/${groupId}/versions?limit=50`);
const groupVersion = (groupVersions.data ?? []).find((item) => item.attributes?.state === 'PREPARE_FOR_SUBMISSION')
  ?? (groupVersions.data ?? [])[0];
if (!groupVersion) throw new Error('The populated subscription group has no draft version');

const desired = [{ relationship: 'appStoreVersion', type: 'appStoreVersions', id: appVersion.id }];
desired.push({ relationship: 'subscriptionGroupVersion', type: 'subscriptionGroupVersions', id: groupVersion.id });
for (const subscription of subscriptions) {
  const versions = await get(`/v1/subscriptions/${subscription.id}/versions?limit=50`);
  const version = (versions.data ?? []).find((item) => item.attributes?.state === 'PREPARE_FOR_SUBMISSION')
    ?? (versions.data ?? [])[0];
  if (!version) throw new Error(`Subscription ${subscription.id} has no draft version`);
  desired.push({ relationship: 'subscriptionVersion', type: 'subscriptionVersions', id: version.id });
}

async function listItems() {
  const result = await get(`/v1/reviewSubmissions/${submission.id}/items?${encode({
    include: 'appStoreVersion,subscriptionVersion,subscriptionGroupVersion',
    limit: '200',
  })}`);
  return (result.data ?? []).map((item) => ({
    itemId: item.id,
    state: item.attributes?.state ?? null,
    targets: Object.fromEntries(Object.entries(item.relationships ?? {})
      .map(([name, relationship]) => [name, relationship?.data?.id ?? null])
      .filter(([, id]) => id)),
  }));
}

let items = await listItems();

if (process.argv.includes('--resolve-rejected-app-item')) {
  const rejectedAppItem = items.find((item) => item.state === 'REJECTED' && item.targets.appStoreVersion === appVersion.id);
  if (!rejectedAppItem) throw new Error('No rejected item for the selected App Store version was found');
  await request('PATCH', `/v1/reviewSubmissionItems/${encodeURIComponent(rejectedAppItem.itemId)}`, {
    data: {
      type: 'reviewSubmissionItems',
      id: rejectedAppItem.itemId,
      attributes: { resolved: true },
    },
  });
  console.log(`marked rejected app-version item ${rejectedAppItem.itemId} resolved`);
  items = await listItems();
}

const existingTargetIds = new Set(items.flatMap((item) => Object.values(item.targets)));
const missing = desired.filter((target) => !existingTargetIds.has(target.id));

console.log(JSON.stringify({
  mode: process.argv.includes('--apply') ? 'apply' : 'dry-run',
  submission: { id: submission.id, state: submission.attributes?.state },
  appVersion: { id: appVersion.id, buildId: appVersion.relationships?.build?.data?.id ?? null },
  desired,
  existingItems: items,
  missing,
}, null, 2));

if (!process.argv.includes('--apply')) process.exit(0);

for (const target of missing) {
  await request('POST', '/v1/reviewSubmissionItems', {
    data: {
      type: 'reviewSubmissionItems',
      relationships: {
        reviewSubmission: { data: { type: 'reviewSubmissions', id: submission.id } },
        [target.relationship]: { data: { type: target.type, id: target.id } },
      },
    },
  });
  console.log(`added ${target.relationship} ${target.id}`);
}

items = await listItems();
const finalTargetIds = new Set(items.flatMap((item) => Object.values(item.targets)));
const stillMissing = desired.filter((target) => !finalTargetIds.has(target.id));
if (stillMissing.length) throw new Error(`Review submission is still missing ${JSON.stringify(stillMissing)}`);
console.log(JSON.stringify({ prepared: true, submissionId: submission.id, items }, null, 2));
