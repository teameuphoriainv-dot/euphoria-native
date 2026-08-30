#!/usr/bin/env node
/**
 * Read-only App Store Connect launch audit.
 *
 * Uses the same gitignored API key and public identifiers as EAS submission, but performs GET
 * requests only. The private key and JWT are never printed. This is intentionally separate from
 * testflight-distribute.mjs: a readiness check must never attach a build or change account state.
 *
 * Usage:
 *   node scripts/asc-readiness.mjs
 *   node scripts/asc-readiness.mjs --enable-sandbox-grace
 */
import { Buffer } from 'node:buffer';
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const cfg = JSON.parse(readFileSync(path.join(ROOT, 'eas.json'), 'utf8'))?.submit?.production?.ios;

if (!cfg?.ascApiKeyPath || !cfg.ascApiKeyIssuerId || !cfg.ascAppId) {
  console.error('eas.json submit.production.ios is missing App Store Connect configuration');
  process.exit(1);
}

const keyPath = path.resolve(ROOT, cfg.ascApiKeyPath);
const keyId = cfg.ascApiKeyId ?? path.basename(keyPath).replace(/^AuthKey_|\.p8$/g, '');
let privateKey;
try {
  privateKey = readFileSync(keyPath, 'utf8');
} catch {
  console.error(`cannot read the gitignored App Store Connect key at ${cfg.ascApiKeyPath}`);
  process.exit(1);
}

const base64url = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const header = base64url({ alg: 'ES256', kid: keyId, typ: 'JWT' });
const payload = base64url({
  iss: cfg.ascApiKeyIssuerId,
  iat: now,
  exp: now + 15 * 60,
  aud: 'appstoreconnect-v1',
});
const signer = createSign('SHA256');
signer.update(`${header}.${payload}`);
const jwt = `${header}.${payload}.${signer
  .sign({ key: privateKey, dsaEncoding: 'ieee-p1363' })
  .toString('base64url')}`;

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
    let detail = text.slice(0, 400);
    try {
      const body = JSON.parse(text);
      detail = (body.errors ?? [])
        .map((error) => `${error.status ?? response.status} ${error.code ?? ''} ${error.detail ?? ''}`.trim())
        .join('; ');
    } catch {
      // The bounded response excerpt above is enough when Apple does not return JSON.
    }
    throw new Error(`${resourcePath} -> ${response.status}: ${detail}`);
  }
  return text ? JSON.parse(text) : {};
}

const get = (resourcePath) => request('GET', resourcePath);

const encode = (params) => new URLSearchParams(params).toString();

try {
  const groupQuery = encode({
    include: 'subscriptions',
    limit: '50',
    'limit[subscriptions]': '50',
    'fields[subscriptionGroups]': 'referenceName',
    'fields[subscriptions]': 'name,productId,state,subscriptionPeriod,familySharable,groupLevel',
  });
  const groups = await get(`/v1/apps/${cfg.ascAppId}/subscriptionGroups?${groupQuery}`);
  const subscriptionGroups = [];
  const subscriptions = [];
  for (const group of groups.data ?? []) {
    const detail = await get(
      `/v1/subscriptionGroups/${group.id}?${encode({
        include: 'subscriptions',
        'limit[subscriptions]': '50',
        'fields[subscriptionGroups]': 'referenceName',
        'fields[subscriptions]': 'name,productId,state,subscriptionPeriod,familySharable,groupLevel',
      })}`,
    );
    const groupSubscriptions = (detail.included ?? [])
      .filter((item) => item.type === 'subscriptions')
      .map((item) => ({ id: item.id, ...item.attributes }))
      .sort((a, b) => String(a.productId).localeCompare(String(b.productId)));
    subscriptionGroups.push({ id: group.id, ...group.attributes, subscriptions: groupSubscriptions });
    subscriptions.push(...groupSubscriptions);
  }

  const versionQuery = encode({
    'filter[platform]': 'IOS',
    limit: '10',
    'fields[appStoreVersions]': 'versionString,appStoreState,appVersionState,createdDate',
  });
  const versions = await get(`/v1/apps/${cfg.ascAppId}/appStoreVersions?${versionQuery}`);

  const builds = await get(
    `/v1/apps/${cfg.ascAppId}/builds?${encode({ limit: '10', 'fields[builds]': 'version,uploadedDate,expirationDate,expired,processingState,minOsVersion' })}`,
  );

  let gracePeriod = null;
  try {
    let grace = await get(`/v1/apps/${cfg.ascAppId}/subscriptionGracePeriod`);
    if (process.argv.includes('--enable-sandbox-grace') && !grace.data?.attributes?.sandboxOptIn) {
      grace = await request('PATCH', `/v1/subscriptionGracePeriods/${cfg.ascAppId}`, {
        data: {
          type: 'subscriptionGracePeriods',
          id: cfg.ascAppId,
          attributes: {
            optIn: false,
            sandboxOptIn: true,
            duration: 'SIXTEEN_DAYS',
            renewalType: 'ALL_RENEWALS',
          },
        },
      });
    }
    gracePeriod = grace.data?.attributes ?? null;
  } catch (error) {
    gracePeriod = { unavailable: error instanceof Error ? error.message : String(error) };
  }

  const expected = new Set(['euphoria_pro_monthly', 'euphoria_pro_yearly']);
  const found = new Set(subscriptions.map((subscription) => subscription.productId));
  const missing = [...expected].filter((productId) => !found.has(productId));

  console.log(JSON.stringify({
    observedAt: new Date().toISOString(),
    appId: cfg.ascAppId,
    subscriptionGroups,
    subscriptions,
    missingExpectedProducts: missing,
    gracePeriod,
    appStoreVersions: (versions.data ?? []).map((version) => ({ id: version.id, ...version.attributes })),
    builds: (builds.data ?? []).map((build) => ({ id: build.id, ...build.attributes })),
  }, null, 2));

  process.exitCode = missing.length === 0 ? 0 : 2;
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
