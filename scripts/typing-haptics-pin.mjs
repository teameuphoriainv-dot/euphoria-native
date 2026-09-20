/**
 * TYPING HAPTICS PIN.
 *
 * Atlas types his lines, and a tick rides the typing. It is the only feedback in the app that
 * CANNOT be seen — the simulator has no Taptic Engine, so a regression here is invisible in every
 * screenshot, every manual pass and every review. The ticks could stop tomorrow and the app would
 * look identical. That is precisely the class of defect a pin exists for.
 *
 * TWO MODES.
 *
 *   default   Static. Reads the source and asserts the tick is wired the way it has to be. Runs
 *             anywhere, needs no device, belongs in `check`.
 *
 *   --live    Runtime. Boots nothing, but if a simulator is ALREADY booted with the app installed,
 *             it opens one onboarding step and counts the haptic calls iOS actually received.
 *
 * HOW --live CAN SEE A HAPTIC ON A DEVICE THAT HAS NO HAPTICS:
 *
 *   UIKit logs every request whether or not there is hardware to serve it —
 *     [com.apple.UIKit:Feedback] generator <UISelectionFeedbackGenerator: 0x…>
 *     cannot play feedback <nil: 0x0> (enabled=0)
 *   `enabled=0` is the missing engine. The line itself is proof the app asked. So the CALL is
 *   verifiable on a simulator even though the SENSATION is not — count the lines, check the
 *   generator class, time the gaps. Only "does it feel right" needs a real phone.
 *
 * Measured 2026-09-19 on iPhone 17 Pro / iOS 26.5, step 5 ("When do you want to start investing
 * for real?", 45 chars): 9 ticks for an expected floor(45/5)=9, gaps 166-168ms.
 */
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const FILE = 'src/components/atlas-speech.tsx';
const src = readFileSync(FILE, 'utf8');

// ── 1. The tick exists and is the right KIND ────────────────────────────────────────────────
assert.match(src, /import \* as Haptics from 'expo-haptics';/,
  `${FILE} no longer imports expo-haptics — the typing tick cannot fire`);

assert.match(src, /void Haptics\.selectionAsync\(\);/,
  'the typing tick must use selectionAsync');

// impactAsync is a tap you notice; selectionAsync is texture under a voice. Under a typewriter
// the heavier generator reads as a series of events happening TO you rather than as speech.
assert.doesNotMatch(src, /Haptics\.(impactAsync|notificationAsync)/,
  'the typewriter must not use impact/notification feedback — too heavy to ride a voice');

// ── 2. It is throttled, and the throttle is a named, sane number ────────────────────────────
const nMatch = src.match(/const HAPTIC_EVERY_N_CHARS = (\d+);/);
assert(nMatch, 'HAPTIC_EVERY_N_CHARS is gone — the throttle must stay a named constant, not a literal');
const N = Number(nMatch[1]);
const charMatch = src.match(/const CHAR_MS = (\d+);/);
assert(charMatch, 'CHAR_MS is gone');
const CHAR_MS = Number(charMatch[1]);

// The hardware ceiling, not a taste call: iOS coalesces requests that arrive faster than roughly
// one per 100ms into an undifferentiated buzz, so a tick per character at CHAR_MS would ask for
// ~38/second and deliver mush. N must keep the REQUEST rate under that.
const requestedGapMs = N * CHAR_MS;
assert(requestedGapMs >= 100,
  `HAPTIC_EVERY_N_CHARS=${N} at CHAR_MS=${CHAR_MS} requests a tick every ${requestedGapMs}ms — `
  + 'under ~100ms iOS coalesces them into a buzz. Raise N or CHAR_MS.');
assert(requestedGapMs <= 400,
  `a tick every ${requestedGapMs}ms is too sparse to read as typing — lower N.`);

// ── 3. It rides the TYPING, not the mount ───────────────────────────────────────────────────
// Inside setInterval, the tick tracks characters. Moved out, it fires once per line and the
// feedback silently stops meaning "Atlas is speaking" while still looking correct in a diff.
const interval = src.match(/iv = setInterval\(\(\) => \{([\s\S]*?)\}, CHAR_MS\);/);
assert(interval, 'the typewriter interval changed shape — cannot verify the tick rides the typing');
assert.match(interval[1], /HAPTIC_EVERY_N_CHARS === 0\) void Haptics\.selectionAsync\(\);/,
  'the tick must fire INSIDE the typing interval, or it stops tracking characters');

// ── 4. Reduced Motion and the skip must be silent ───────────────────────────────────────────
// Both return before the interval is created. Someone who opted out of animation must not be
// the one person who still gets buzzed.
assert.match(src, /if \(reduced\) \{[\s\S]*?return;/,
  'the Reduced Motion early return is gone — opting out of motion must also opt out of the tick');
assert.match(src, /if \(skipKey > 0\) \{ setN\(text\.length\); return; \}/,
  'the skip early return is gone — skipping to the end must not fire a burst of ticks');

if (!process.argv.includes('--live')) {
  console.log(`PASS — Atlas's typing tick is wired: selectionAsync, throttled 1-per-${N} chars `
    + `(~${requestedGapMs}ms requested), inside the typing interval, silent under Reduced Motion `
    + 'and on skip. Re-run with --live against a booted simulator to count the calls iOS receives.');
  process.exit(0);
}

// ── 5. LIVE: count what iOS actually received ───────────────────────────────────────────────
const sh = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8' });
const booted = sh('xcrun', ['simctl', 'list', 'devices', 'booted']);
const udid = booted.match(/\(([0-9A-F-]{36})\) \(Booted\)/)?.[1];
if (!udid) {
  console.log('SKIP — no booted simulator; static assertions passed.');
  process.exit(0);
}

const STEP = 5;
const QUESTION = 'When do you want to start investing for real?';
const expected = Math.floor(QUESTION.length / N);

sh('xcrun', ['simctl', 'openurl', udid, 'euphorianative://home']);
await new Promise((r) => setTimeout(r, 4000));

const cmd = `timeout 13 xcrun simctl spawn ${udid} log stream --style compact `
  + `--predicate 'processImagePath CONTAINS "euphorianative" AND eventMessage CONTAINS "FeedbackGenerator"' & `
  + `LP=$!; sleep 2; xcrun simctl openurl ${udid} "euphorianative://onboarding?step=${STEP}" >/dev/null 2>&1; `
  + `sleep 10; wait $LP 2>/dev/null`;

/*
 * `log stream` never exits on its own, so `timeout` kills it and the pipeline reports 124. That
 * is the SUCCESS path here — the stream ran for its full window and everything it printed is in
 * stdout. Throwing on it would fail the pin on the one outcome it is designed to produce.
 */
let log = '';
try {
  log = execFileSync('bash', ['-c', cmd], { encoding: 'utf8' });
} catch (e) {
  if (e.status !== 124) throw e;
  log = e.stdout ?? '';
}

const ticks = [...log.matchAll(/<(UI\w*FeedbackGenerator)/g)].map((m) => m[1]);
const selection = ticks.filter((t) => t === 'UISelectionFeedbackGenerator');

assert(selection.length > 0,
  'LIVE: iOS received ZERO haptic requests while Atlas typed — the tick is not firing on device');
assert.strictEqual(selection.length, ticks.length,
  `LIVE: a non-selection generator fired during typing: ${[...new Set(ticks)].join(', ')}`);
assert.strictEqual(selection.length, expected,
  `LIVE: expected floor(${QUESTION.length}/${N})=${expected} ticks for the step-${STEP} question, `
  + `iOS received ${selection.length}`);

console.log(`PASS (live) — iOS received exactly ${selection.length} UISelectionFeedbackGenerator `
  + `requests for a ${QUESTION.length}-character line at 1-per-${N}, on a device with no engine to `
  + 'play them. The call is proven; only the feel needs a phone.');
