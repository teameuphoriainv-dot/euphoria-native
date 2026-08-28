#!/usr/bin/env node
/**
 * Legal links must point to the live Euphoria site before App Store submission.
 *
 * Apple review needs reachable Privacy Policy and Terms links, and onboarding already records
 * euphoria.app as a placeholder host this app does not own. The bug this catches is a second
 * legal row quietly keeping the placeholder URL after the paywall links were fixed.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const fail = (msg) => {
  console.error(`[legal-links-pin] ${msg}`);
  process.exit(1);
};

const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

function tsFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? tsFiles(path) : /\.tsx?$/.test(path) ? [path] : [];
  });
}

function findings(files) {
  const placeholderUrls = [];
  const legalTargets = {
    privacy: false,
    terms: false,
  };

  for (const path of files) {
    const code = stripComments(readFileSync(path, 'utf8'));
    const bad = code.match(/https?:\/\/(?:www\.)?(?:euphoria\.app|example\.com|localhost)(?:[/'"`)\s]|$)[^'"`\s)]*/g) ?? [];
    for (const url of bad) placeholderUrls.push(`${path}: ${url}`);
    if (code.includes('https://euphoriainv.com/privacy')) legalTargets.privacy = true;
    if (code.includes('https://euphoriainv.com/terms')) legalTargets.terms = true;
  }

  return { placeholderUrls, legalTargets };
}

function selftest() {
  const temp = (src) => stripComments(src);
  if (/https?:\/\/(?:www\.)?euphoria\.app/.test(temp("Linking.openURL('https://euphoria.app/privacy')")) === false) {
    throw new Error('selftest: bad placeholder URL did not match');
  }
  if (/https?:\/\/(?:www\.)?euphoria\.app/.test(temp('// https://euphoria.app/privacy')) === true) {
    throw new Error('selftest: comment was not stripped');
  }
  if (/https?:\/\/(?:www\.)?euphoria\.app/.test(temp("Linking.openURL('https://euphoriainv.com/privacy')")) === true) {
    throw new Error('selftest: live Euphoria URL matched placeholder pattern');
  }
}

selftest();

const result = findings(tsFiles('src'));
if (result.placeholderUrls.length > 0) {
  fail(`placeholder legal URLs remain:\n  ${result.placeholderUrls.join('\n  ')}`);
}
if (!result.legalTargets.privacy) fail('no code path links to https://euphoriainv.com/privacy');
if (!result.legalTargets.terms) fail('no code path links to https://euphoriainv.com/terms');

console.log('[legal-links-pin] ok');
