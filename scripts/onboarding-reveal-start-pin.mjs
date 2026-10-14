/**
 * ONBOARDING REVEAL + /START PIN (O3, promoted from the builder's scratch check on 2026-09-22).
 *
 *   node scripts/onboarding-reveal-start-pin.mjs [onboarding-parts.tsx] [start.tsx]
 *
 * Holds: the paywall's benefits quote no numbers at all (owner, 2026-10-14: general phrases, so
 * no count on the screen where money is taken can go stale; until then the count was derived); the reveal opens on the lead course's node with a pixel beam growing UP to Atlas
 * and no spring on that geometry; reduced-motion stats render the final number, not a frame of 0;
 * /start shows the same node and course art, drops the repeated "your plan is ready", and does not
 * treat "still loading" as "no lesson" (which flashed the Digest fallback and let a fast tap send a
 * new learner to a guide). Watched failing against the HEAD versions of both files (6 failures) and
 * against sed-broken copies (3 failures) before it was promoted.
 */
import { readFileSync } from 'node:fs';
const args = process.argv.slice(2);
const [parts, start] = [
  args[0] ?? new URL('../src/components/onboarding-parts.tsx', import.meta.url),
  args[1] ?? new URL('../src/app/start.tsx', import.meta.url),
].map((p) => readFileSync(p, 'utf8'));
const fail = [];
const label = parts.match(/PREMIUM_BENEFITS[\s\S]*?\];/)[0];
const rows = [...label.matchAll(/label: (['`])(.*?)\1/g)].map((m) => m[2]);
if (rows.length !== 5) fail.push(`paywall benefits list has ${String(rows.length)} rows, expected 5`);
if (rows.some((row) => /\d|\$\{/.test(row))) fail.push('a paywall benefit quotes a number (owner, 2026-10-14: general phrases only)');
const reveal = parts.slice(parts.indexOf('export function PlanRevealStep'));
if (!/<RevealPedestal/.test(reveal)) fail.push('reveal has no node pedestal');
if (!/<PixelBeam[\s\S]*?order="up"/.test(parts)) fail.push('reveal beam does not grow up');
if (/withSpring/.test(parts.slice(parts.indexOf('function RevealPedestal'), parts.indexOf('export function PlanRevealStep')))) fail.push('spring on reveal geometry');
if (!/<PathNode[^>]*doneColor=\{accent\}/.test(start) || !/<LessonArt/.test(start)) fail.push('/start does not show node + course art');
if (/text=\{?[^}]*Your plan is ready/.test(start)) fail.push('/start repeats "your plan is ready"');
if (!/!completedLessons\.includes\(lessonKey\(/.test(start) || !/firstRunDoneAt: nowMs\(\)/.test(start)) fail.push('/start lost its resolution or stamping');
if (!/useState<PathwayLesson \| null \| undefined>\(undefined\)/.test(start) || !/loading=\{lesson === undefined\}/.test(start)) fail.push('/start treats "still loading" as "no lesson"');
const stat = parts.slice(parts.indexOf('function RevealStat'), parts.indexOf('export function PlanRevealStep'));
if (!/if \(reduced\) return <ThemedText[^>]*>\{String\(value\)\}/.test(stat)) fail.push('reduced motion reveal stats mount NumberRollup (one frame of 0)');
const base = Number((parts.match(/const REVEAL_BEAM_BASE = (\d+);/) || [])[1]);
const node = Number((parts.match(/const REVEAL_NODE = (\d+);/) || [])[1]);
if (!(base > 0 && base <= node * 0.6)) fail.push('beam base too wide for the round node (corners float)');
if (fail.length) { console.error('onboarding-reveal-start-pin FAIL\n  ' + fail.join('\n  ')); process.exit(1); }
console.log('onboarding-reveal-start-pin OK');
