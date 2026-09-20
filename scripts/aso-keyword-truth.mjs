#!/usr/bin/env node
/**
 * NEVER RANK FOR A WORD THE APP DOES NOT TEACH.
 *
 * THE RULE, and why it needs a machine rather than a reviewer. Twice now a planning document has
 * proposed keywords the product does not contain. refs/ASO_MAX_PLAN.md proposed `isa` for en-GB,
 * `tfsa` for en-CA and `super` plus `asx` for en-AU, on the reasoning that those are the terms
 * people search in those storefronts. They are. The app has never said any of them: across the
 * twelve files in src/lib/curriculum/courses/ they measure 0, 0, 0 and 0 in the sense intended,
 * against 708 for Roth and 582 for 401, both measured by countTerm() below. Both times the words
 * were caught by a person reading carefully, which is not a control, it is luck.
 *
 * Ranking for a word the app never says draws a user who bounces on the first screen. On an app
 * with zero ratings, those are the one-star reviews that decide whether anything else works. It is
 * also a Guideline 2.3.7 problem: metadata has to describe the app.
 *
 * WHY A NAIVE SUBSTRING COUNT WOULD HAVE PASSED ALL FOUR. The obvious implementation is
 * `corpus.includes(term)`, or a word-start match. Measured:
 *
 *     term     prefix match   WHOLE word    what the prefix was catching
 *     isa                 3            0    Isaac
 *     super             217           28    superior, supervised, superhuman, superposition
 *     ai               1076          326    aim, aid, air, airbnb, airlines, AIG
 *
 * A prefix match would have waved `isa` and `super` straight through. This file matches whole
 * words only, allowing a plural or a possessive and nothing else.
 *
 * WHY A COUNT ALONE IS ALSO NOT ENOUGH. `super` still scores 28 as a whole word, because English
 * prose contains the word "super" and the corpus has a Super Bowl advertising lesson. So a term
 * has to clear a threshold that separates "the app teaches this" from "the word occurs". The
 * observed gap in real data is wide: the lowest genuine curriculum term is `etf` at 349, and the
 * highest rejected one is `super` at 28. CURRICULUM_MIN sits inside that gap.
 *
 * AND WHY THERE ARE TWO KINDS OF TERM. `simulator` measures 18 and `teen` measures 11, and both
 * are honest: one is a feature and one is the audience, neither is a subject the lessons teach.
 * Failing them would make this pin fire on correct input, and a pin that fires on correct input
 * gets disabled within a week and then protects nothing. So those are declared `product` and are
 * proved against a phrase in a named file instead. The cost of a declaration is one line; the
 * point is that a keyword cannot enter the store without someone stating which claim it is making.
 *
 *   node scripts/aso-keyword-truth.mjs              check the committed manifest, offline
 *   node scripts/aso-keyword-truth.mjs --live       also assert App Store Connect matches it
 *   node scripts/aso-keyword-truth.mjs --counts     print the measured count for every term
 *   node scripts/aso-keyword-truth.mjs --selftest   prove every lane can go red
 */
import { Buffer } from 'node:buffer';
import { createSign } from 'node:crypto';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const MANIFEST = path.join(ROOT, 'refs/ASO_KEYWORDS.json');
const COURSE_DIR = path.join(ROOT, 'src/lib/curriculum/courses');

/**
 * The line between "taught" and "mentioned".
 *
 * Not a round number picked for looking tidy: it sits in the measured gap between the weakest term
 * the app genuinely teaches (`etf`, 349) and the strongest term that was refused (`super`, 28).
 * Anything landing between 28 and 349 deserves a human look, which is what failing gets you.
 */
const CURRICULUM_MIN = 50;

const LIMITS = { name: 30, subtitle: 30, keywords: 100 };

/** Whole word, case-insensitive, allowing a plural or a possessive and nothing else. */
export function countTerm(text, term) {
  const re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:s|es|'s)?\\b`, 'gi');
  return (text.match(re) ?? []).length;
}

/** The twelve authored course files, concatenated. This is "what the app teaches". */
function readCorpus(dir = COURSE_DIR) {
  const files = readdirSync(dir).filter((f) => f.endsWith('.ts'));
  return { text: files.map((f) => readFileSync(path.join(dir, f), 'utf8')).join('\n'), files };
}

/**
 * Every reason a set of listing fields must not ship, as a list of strings.
 *
 * Pure in its inputs so the selftest can hand it a deliberately broken manifest and watch it
 * complain, rather than asserting against the real one and proving nothing.
 */
export function findings(manifest, corpusText, fileExists, readFile) {
  const out = [];
  const declared = manifest.terms ?? {};
  const rejected = manifest.rejected ?? {};

  for (const [locale, fields] of Object.entries(manifest.locales ?? {})) {
    const where = `${locale}`;

    for (const [field, limit] of Object.entries(LIMITS)) {
      const value = fields[field] ?? '';
      const n = [...value].length;
      if (n === 0) out.push(`${where}: ${field} is empty`);
      // Apple TRUNCATES silently rather than rejecting, so an over-length field ships cut and
      // nobody finds out until a screenshot.
      if (n > limit) out.push(`${where}: ${field} is ${String(n)}/${String(limit)}, and Apple truncates silently`);
    }

    const raw = fields.keywords ?? '';
    if (/,\s/.test(raw)) out.push(`${where}: keywords contain a space after a comma, which costs a character of 100 and buys nothing`);

    const terms = raw.split(',').map((t) => t.trim()).filter(Boolean);
    const seen = new Set();
    const nameAndSubtitle = `${fields.name ?? ''} ${fields.subtitle ?? ''}`;

    for (const term of terms) {
      if (seen.has(term)) out.push(`${where}: keyword "${term}" is listed twice`);
      seen.add(term);

      // Apple indexes the name and subtitle already, so repeating a word there wastes the field.
      if (countTerm(nameAndSubtitle, term) > 0) {
        out.push(`${where}: keyword "${term}" already appears in the name or subtitle, which Apple indexes anyway`);
      }

      if (rejected[term]) {
        out.push(`${where}: keyword "${term}" is on the rejected list. ${rejected[term]}`);
        continue;
      }

      const decl = declared[term];
      if (!decl) {
        // THE CORE RULE. An undeclared keyword cannot ship, whatever it measures, because nobody
        // has stated what claim it makes.
        out.push(`${where}: keyword "${term}" is not declared in refs/ASO_KEYWORDS.json, so nothing says the app contains it`);
        continue;
      }

      if (decl.kind === 'curriculum') {
        const n = countTerm(corpusText, term);
        if (n < CURRICULUM_MIN) {
          out.push(`${where}: keyword "${term}" is declared as taught but measures ${String(n)} whole-word occurrences in the curriculum, under the ${String(CURRICULUM_MIN)} minimum`);
        }
      } else if (decl.kind === 'product') {
        const evidence = decl.evidence ?? [];
        if (!evidence.length) {
          out.push(`${where}: keyword "${term}" is declared as a product term with no evidence at all`);
        }
        for (const e of evidence) {
          if (!fileExists(e.path)) {
            out.push(`${where}: keyword "${term}" cites ${e.path}, which does not exist`);
            continue;
          }
          if (!readFile(e.path).includes(e.phrase)) {
            out.push(`${where}: keyword "${term}" cites "${e.phrase}" in ${e.path}, which no longer contains it`);
          }
        }
      } else {
        out.push(`${where}: keyword "${term}" has unknown kind "${String(decl.kind)}"`);
      }
    }
  }

  // A declaration nobody uses is dead weight that makes the next reader think a word is live.
  const used = new Set(Object.values(manifest.locales ?? {}).flatMap((f) => (f.keywords ?? '').split(',').map((t) => t.trim())));
  for (const term of Object.keys(declared)) {
    if (!used.has(term)) out.push(`term "${term}" is declared but used by no locale; remove it or use it`);
  }
  return out;
}

// ── live comparison, READ ONLY ──────────────────────────────────────────────────────────────
/*
 * GET only, and it can only ever be GET: there is no branch here that takes a method. Submission
 * and listing edits are the product owner's call. A guard script that could also write would be
 * one typo away from being the thing that shipped something unreviewed.
 */
async function liveFields() {
  const cfg = JSON.parse(readFileSync(path.join(ROOT, 'eas.json'), 'utf8'))?.submit?.production?.ios;
  const privateKey = readFileSync(path.resolve(ROOT, cfg.ascApiKeyPath), 'utf8');
  const b64 = (v) => Buffer.from(JSON.stringify(v)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const h = b64({ alg: 'ES256', kid: cfg.ascApiKeyId, typ: 'JWT' });
  const p = b64({ iss: cfg.ascApiKeyIssuerId, iat: now, exp: now + 900, aud: 'appstoreconnect-v1' });
  const s = createSign('SHA256');
  s.update(`${h}.${p}`);
  const jwt = `${h}.${p}.${s.sign({ key: privateKey, dsaEncoding: 'ieee-p1363' }).toString('base64url')}`;
  const get = async (u) => {
    const r = await fetch(`https://api.appstoreconnect.apple.com${u}`, { headers: { Authorization: `Bearer ${jwt}` } });
    return r.ok ? r.json() : { data: null };
  };

  const out = {};
  const versions = await get(`/v1/apps/${cfg.ascAppId}/appStoreVersions?limit=10`);
  const staged = (versions.data ?? []).find((v) => v.attributes?.appStoreState === 'PREPARE_FOR_SUBMISSION');
  if (staged) {
    const locs = await get(`/v1/appStoreVersions/${staged.id}/appStoreVersionLocalizations`);
    for (const l of locs.data ?? []) {
      out[l.attributes.locale] = { keywords: l.attributes.keywords ?? '' };
    }
  }
  const infos = await get(`/v1/apps/${cfg.ascAppId}/appInfos`);
  const info = (infos.data ?? []).find((i) => i.attributes?.appStoreState === 'PREPARE_FOR_SUBMISSION');
  if (info) {
    const locs = await get(`/v1/appInfos/${info.id}/appInfoLocalizations`);
    for (const l of locs.data ?? []) {
      out[l.attributes.locale] = {
        ...(out[l.attributes.locale] ?? {}),
        name: l.attributes.name ?? '',
        subtitle: l.attributes.subtitle ?? '',
      };
    }
  }
  return { fields: out, versionString: staged?.attributes?.versionString };
}

// ── selftest ────────────────────────────────────────────────────────────────────────────────
function selftest() {
  const die = (m) => { throw new Error(`selftest: ${m}`); };
  const corpus = 'We teach stocks and ETFs. '.repeat(60) + 'A Super Bowl ad. Isaac bought shares. ';
  const exists = (p) => p === 'src/real.ts';
  const read = () => 'STARTING_CASH = 10_000';

  const base = {
    locales: { 'en-US': { name: 'Euphoria', subtitle: 'Sub', keywords: 'stock,etf' } },
    terms: { stock: { kind: 'curriculum' }, etf: { kind: 'curriculum' } },
    rejected: {},
  };
  if (findings(base, corpus, exists, read).length) die(`a sound manifest was flagged: ${findings(base, corpus, exists, read).join('; ')}`);

  const catches = (label, mutate) => {
    const m = JSON.parse(JSON.stringify(base));
    mutate(m);
    if (!findings(m, corpus, exists, read).length) die(`${label} would slip through`);
  };

  // The four words that nearly shipped. Each must fail for its own reason.
  catches('an untaught keyword (isa)', (m) => { m.locales['en-US'].keywords = 'stock,etf,isa'; m.terms.isa = { kind: 'curriculum' }; });
  catches('a keyword with no declaration at all', (m) => { m.locales['en-US'].keywords = 'stock,etf,tfsa'; });
  catches('a keyword on the rejected list', (m) => { m.locales['en-US'].keywords = 'stock,etf,super'; m.terms.super = { kind: 'curriculum' }; m.rejected.super = 'Super Bowl only'; });
  catches('a product term citing a file that does not exist', (m) => {
    m.locales['en-US'].keywords = 'stock,etf,simulator';
    m.terms.simulator = { kind: 'product', evidence: [{ path: 'src/gone.ts', phrase: 'x' }] };
  });
  catches('a product term whose evidence phrase is gone', (m) => {
    m.locales['en-US'].keywords = 'stock,etf,simulator';
    m.terms.simulator = { kind: 'product', evidence: [{ path: 'src/real.ts', phrase: 'NOT_PRESENT' }] };
  });
  catches('a product term with no evidence', (m) => {
    m.locales['en-US'].keywords = 'stock,etf,simulator';
    m.terms.simulator = { kind: 'product', evidence: [] };
  });
  catches('an over-length keyword field', (m) => { m.locales['en-US'].keywords = `stock,etf,${'x'.repeat(100)}`; m.terms.x = { kind: 'curriculum' }; });
  catches('an over-length subtitle', (m) => { m.locales['en-US'].subtitle = 'y'.repeat(31); });
  catches('a space after a comma', (m) => { m.locales['en-US'].keywords = 'stock, etf'; });
  catches('a duplicated keyword', (m) => { m.locales['en-US'].keywords = 'stock,etf,stock'; });
  catches('a keyword already in the subtitle', (m) => { m.locales['en-US'].subtitle = 'Stock Market'; });
  catches('an empty keyword field', (m) => { m.locales['en-US'].keywords = ''; });
  catches('a declaration no locale uses', (m) => { m.terms.orphan = { kind: 'curriculum' }; });

  // The matcher itself. This is the part that decides whether the whole file works.
  if (countTerm('Isaac bought it', 'isa') !== 0) die('a name beginning with the term was counted as the term');
  if (countTerm('superior supervised superhuman', 'super') !== 0) die('a word beginning with the term was counted as the term');
  if (countTerm('aim aid air airlines AIG', 'ai') !== 0) die('ai matched aim, aid and air');
  if (countTerm('AI explains it. The AI is Atlas.', 'ai') !== 2) die('ai did not match the standalone word');
  if (countTerm('one ETF, two ETFs', 'etf') !== 2) die('the plural was not counted');
  if (countTerm("the stock's price", 'stock') !== 1) die('the possessive was not counted');
  if (countTerm('tax taxes taxable', 'tax') !== 2) die('tax should count tax and taxes but not taxable');
  // A term that is a regex metacharacter must not blow up or match everything.
  if (countTerm('a b c', '.') !== 0) die('a regex metacharacter was not escaped');

  // And the threshold has to actually be the thing separating the two real cases.
  if (!(28 < CURRICULUM_MIN && CURRICULUM_MIN < 349)) {
    die(`CURRICULUM_MIN ${String(CURRICULUM_MIN)} no longer sits between the rejected super (28) and the weakest genuine term etf (349)`);
  }
  console.log('[aso-keyword-truth] selftest ok, every lane can go red');
}

// ── run ─────────────────────────────────────────────────────────────────────────────────────
/*
 * IMPORTING THIS FILE MUST NOT RUN IT. `countTerm` and `findings` are exported so other checks can
 * reuse them, and the run block below is top-level, so a bare import printed the whole report as a
 * side effect and would have exited the importing process on a failure.
 */
const RUN_AS_SCRIPT = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename);
if (!RUN_AS_SCRIPT) {
  // Imported for its helpers. Do nothing else.
} else if (process.argv.includes('--selftest')) {
  selftest();
  process.exit(0);
}

if (RUN_AS_SCRIPT) {
const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const { text: corpus, files } = readCorpus();
const exists = (p) => existsSync(path.join(ROOT, p));
const read = (p) => readFileSync(path.join(ROOT, p), 'utf8');

if (process.argv.includes('--counts')) {
  const all = new Set(Object.values(manifest.locales).flatMap((f) => f.keywords.split(',').map((t) => t.trim())));
  console.log(`\nwhole-word occurrences across ${String(files.length)} course files\n`);
  for (const t of [...all].sort()) {
    const n = countTerm(corpus, t);
    const kind = manifest.terms[t]?.kind ?? 'UNDECLARED';
    const mark = kind === 'curriculum' ? (n >= CURRICULUM_MIN ? 'ok' : 'UNDER') : kind === 'product' ? 'product' : 'UNDECLARED';
    console.log(`  ${t.padEnd(12)} ${String(n).padStart(6)}  ${mark}`);
  }
  console.log('\nrejected terms, measured now:\n');
  for (const t of Object.keys(manifest.rejected)) {
    console.log(`  ${t.padEnd(16)} ${String(countTerm(corpus, t)).padStart(6)}`);
  }
  console.log('');
}

const problems = findings(manifest, corpus, exists, read);

if (process.argv.includes('--live')) {
  const { fields, versionString } = await liveFields();
  console.log(`[aso-keyword-truth] comparing the manifest against staged version ${versionString ?? '(none)'}`);
  for (const [locale, want] of Object.entries(manifest.locales)) {
    const got = fields[locale];
    if (!got) {
      problems.push(`${locale}: in the manifest but not on the staged version in App Store Connect`);
      continue;
    }
    for (const field of ['name', 'subtitle', 'keywords']) {
      if (got[field] !== undefined && got[field] !== want[field]) {
        problems.push(`${locale}: ${field} has drifted. manifest "${want[field]}" but the store has "${got[field]}"`);
      }
    }
  }
  for (const locale of Object.keys(fields)) {
    if (!manifest.locales[locale]) problems.push(`${locale}: on the staged version but missing from the manifest`);
  }
}

if (problems.length) {
  for (const p of problems) console.error(`[aso-keyword-truth] ${p}`);
  process.exit(1);
}

const count = Object.values(manifest.locales).reduce((n, f) => n + f.keywords.split(',').length, 0);
console.log(`[aso-keyword-truth] ok, ${String(count)} keywords across ${String(Object.keys(manifest.locales).length)} locales, every one evidenced`);
}
