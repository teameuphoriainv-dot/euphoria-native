/**
 * THE CONSTITUTION MUST EXIST, AND IT MUST NOT LIE ABOUT THE CODE.
 *
 * A governing document that states a rule the code no longer honours is worse than no document:
 * it is read, believed, and acted on. That is the same failure class as a stale DEFAULT_API_ORIGIN
 * and it gets the same treatment — pin the agreement, not just the existence.
 *
 * Enforced here:
 *   1. The file exists at the project root, where the harness looks for it.
 *   2. The four hard product lines are still in it. These outrank feature requests and must not be
 *      quietly deleted by anyone, human or agent.
 *   3. The notification caps it states MATCH src/lib/notif-budget.ts. Doc and code, one number.
 */
import { readFileSync } from 'node:fs';
import { MAX_OTHER_PER_WEEK, MAX_PER_DAY, WINDOW_END_HOUR, WINDOW_START_HOUR } from '../src/lib/notif-budget.ts';

const fail = (msg) => {
  console.error(`[constitution-pin] ${msg}`);
  process.exit(1);
};

let doc;
try {
  doc = readFileSync('CONSTITUTION.md', 'utf8');
} catch {
  fail('CONSTITUTION.md is missing from the project root. It governs all work in this repo.');
}

// 2. The hard lines. Worded as headings so a rewrite that keeps the spirit still passes.
const HARD_LINES = [
  ['Never show a fabricated number', 'a wrong number on screen is the worst failure this app has'],
  ['Never handle real money or securities', 'simulated portfolios only'],
  ['Never give personalised financial advice', 'teach the mechanism, never "you should buy this"'],
  ['Never sell or share user data', 'no PII to analytics, no data brokers'],
];
for (const [line, why] of HARD_LINES) {
  if (!doc.includes(line)) fail(`CONSTITUTION.md no longer contains the hard line "${line}" (${why}).`);
}

// 2b. The verification rule the owner asked for in harsh wording.
if (!/Never report a defect you have not reproduced/.test(doc)) {
  fail('CONSTITUTION.md no longer contains the "never report an unreproduced defect" rule.');
}

// 3. Doc/code agreement on the researched notification caps.
const claims = [
  [new RegExp(`\\*\\*${MAX_PER_DAY} per day, maximum`), `${MAX_PER_DAY} per day`, 'MAX_PER_DAY'],
  [new RegExp(`share ${MAX_OTHER_PER_WEEK} per rolling week`), `${MAX_OTHER_PER_WEEK} per week`, 'MAX_OTHER_PER_WEEK'],
];
for (const [re, human, constant] of claims) {
  if (!re.test(doc)) {
    fail(`CONSTITUTION.md does not state the ${human} cap that ${constant} actually enforces. Doc and code have drifted; fix whichever one is wrong.`);
  }
}
const win = `${String(WINDOW_START_HOUR).padStart(2, '0')}:00-${WINDOW_END_HOUR}:00`;
if (!doc.includes(win)) {
  fail(`CONSTITUTION.md does not state the ${win} delivery window that notif-budget.ts enforces.`);
}

console.log('[constitution-pin] ok');
