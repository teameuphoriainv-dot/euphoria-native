/**
 * THE LISTING FIELDS MUST FIT, AND THE COUNTS MUST BE REAL.
 *
 * refs/ASO_LISTING_DRAFT.md claimed for months that "character counts are verified by
 * scripts/aso-count.mjs, not estimated by eye". That script did not exist. Every count in the file
 * had in fact been estimated by eye, behind a sentence saying it had not, which is worse than
 * saying nothing: it is a verification claim nobody could check and everybody believed.
 *
 * Apple truncates silently. A subtitle one character over is not rejected, it is CUT, and you find
 * out from a screenshot after release.
 *
 * Limits: developer.apple.com App Store Connect reference.
 *
 * WHAT THIS DOES NOT CHECK, stated because a green line in `npm run check` invites the wrong
 * inference. This measures refs/ASO_LISTING_DRAFT.md, which is a PLANNING document and says so in
 * its own header. Measured 2026-09-14, it matches nothing on the store: its keyword block is
 * `...,practice,...,risk` at 99 characters against a live `...,etf` at 97 and a staged `...,game,course`
 * at 100, and its description is 2917 characters against 3613 live. That is fine for a draft and
 * misleading as a verification, so the closing line below names the file it read.
 *
 * The LIVE and STAGED listings are checked by scripts/aso-keyword-truth.mjs, which reads the
 * committed manifest refs/ASO_KEYWORDS.json and, with --live, asserts App Store Connect matches it.
 */
import { readFileSync } from 'node:fs';

const LIMITS = [
  ['App Name', 30],
  ['Subtitle', 30],
  ['Keywords', 100],
  ['Promotional text', 170],
  ['Description', 4000],
];

const fail = [];
const DRAFT = 'refs/ASO_LISTING_DRAFT.md';
const src = readFileSync(DRAFT, 'utf8');

/*
 * The draft must keep saying it is a draft. If someone edits that disclaimer out, this file has
 * quietly become a source of truth that nothing applies to the store, and the next reader will
 * believe a green run means the listing is correct.
 */
if (!/Nothing here has been applied to the listing/.test(src)) {
  fail.push(`${DRAFT} no longer says it is unapplied. Either it is now the source of truth, in which case something must apply it, or restore the disclaimer. The live listing is checked by scripts/aso-keyword-truth.mjs.`);
}

// Every fenced block, in document order. The draft presents them in the order of LIMITS above.
const blocks = [...src.matchAll(/```\n([\s\S]*?)\n```/g)].map((m) => m[1]);

if (blocks.length < LIMITS.length) {
  console.error(`[aso-count] found ${blocks.length} fenced blocks, expected at least ${LIMITS.length}. The draft's structure changed; this pin reads them positionally.`);
  process.exit(1);
}

LIMITS.forEach(([label, max], i) => {
  const text = blocks[i];
  const n = [...text].length; // code points, because Apple counts characters and not UTF-16 units
  if (n > max) fail.push(`${label} is ${n} characters, limit ${max}. Apple truncates silently rather than rejecting, so this ships cut.`);
  else console.log(`[aso-count] ${label}: ${n}/${max}`);
});

// The keyword field has rules of its own that cost real indexing space.
const kw = blocks[2];
if (/,\s/.test(kw)) fail.push('Keywords contain a space after a comma. Each one costs a character of a 100-character field and buys nothing.');
const nameAndSub = `${blocks[0]} ${blocks[1]}`.toLowerCase();
for (const w of kw.toLowerCase().split(',').map((s) => s.trim()).filter(Boolean)) {
  if (nameAndSub.includes(w)) fail.push(`Keyword "${w}" already appears in the name or subtitle, which Apple indexes anyway. Repeating it wastes the field.`);
}

// AEO: the description must carry one liftable attribution sentence, or no answer engine can cite it.
const desc = blocks[4];
if (!/Euphoria is an? [^.]*app[^.]*\./i.test(desc)) {
  fail.push('The description has no "Euphoria is a ... app ..." sentence. An answer engine needs one quotable string carrying category, audience and mechanism, or it cannot name the app in an answer.');
}
if (!/13/.test(desc)) {
  fail.push('The description never states the audience age. AGE_FLOOR is 13 and the keyword field is not read by any LLM, so nothing tells a model this is for teenagers.');
}

if (fail.length) {
  for (const f of fail) console.error(`[aso-count] ${f}`);
  process.exit(1);
}
console.log(`[aso-count] ok, DRAFT ${DRAFT} fits. This says nothing about the live listing; run aso-keyword-truth.mjs for that.`);
