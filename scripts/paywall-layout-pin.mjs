/**
 * THE PURCHASE SCREEN'S LAYOUT RULES, both of them.
 *
 * 1. NO DEAD BAND, ABOVE THE CTA OR UNDER IT. A flex-growing paywall body packed at the top left
 *    one large gap between Monthly and the CTA, so this rule first banned flex outright. That left
 *    the opposite band on a tall phone, empty screen under the legal links, and the owner asked for
 *    the components to be laid out through the screen (2026-10-14). So the body grows and shares
 *    the spare height EVENLY between its sections ('space-evenly'): no single gap anywhere. Any
 *    other distribution, or a flex spacer, parks the spare height in one band again.
 *
 * 2. DYNAMIC TYPE CANNOT PUSH IT INTO A SCROLL (CONSTITUTION 5.3: "Screens that ask for money do
 *    not scroll... Verify at the largest Dynamic Type size the screen supports"). Measured on the
 *    simulator 2026-09-22 (sim wave 2, 05-paywall-*): an iPhone 17 Pro fitted at the default size
 *    and scrolled from XXXL up, with the Restore link under the home indicator already at Extra
 *    Large, and a 375x667 SE scrolled at the DEFAULT size. Nothing capped the type: the heading
 *    "You're on day 1 of 3" was an uncapped 32pt `display` and owned the whole screen at AX5.
 *
 *    So the screen now states its ceiling once, as PAYWALL_MAX_FONT_SCALE in onboarding-parts.tsx,
 *    and every text on it is capped at that multiplier or lower. This pin holds that: a text added
 *    to the paywall body or its footer without a cap is exactly how the scroll comes back, and it
 *    is invisible at the default size, which is the size everyone develops at.
 *
 * Break-tested 2026-09-22: dropping the cap off the renewal-terms line, off a PlanCard price and
 * off the benefits label, deleting the constant, and flexing paywallBody each exit 1 below.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const onboarding = readFileSync(new URL('../src/app/onboarding.tsx', import.meta.url), 'utf8');
const parts = readFileSync(new URL('../src/components/onboarding-parts.tsx', import.meta.url), 'utf8');

// ── 1. the body stays content-sized and the CTA follows it ────────────────────────────────────
const styles = onboarding.match(/const styles = StyleSheet\.create\(\{([\s\S]*?)\n\}\);/);
assert.ok(styles, 'onboarding StyleSheet not found');

const paywallBody = styles[1].match(/paywallBody:\s*\{([^}]*)\}/);
assert.ok(paywallBody, 'paywallBody style not found');
assert.match(paywallBody[1], /\bflexGrow:\s*1\b/, 'paywallBody must grow into the spare height, or the screen leaves an empty band under the legal links');
assert.match(
  paywallBody[1],
  /\bjustifyContent:\s*'space-evenly'/,
  "paywallBody must share its spare height evenly ('space-evenly'); any other distribution parks it in one band, like the gap above the CTA this rule was written for",
);
assert.doesNotMatch(paywallBody[1], /\bflex:\s*\d/, 'paywallBody must grow with flexGrow, not flex (flex also shrinks it, which is how the screen scrolls)');

assert.match(
  onboarding,
  /<Animated\.View[\s\S]*?\{renderStep === PAYWALL_INDEX && !isLoader \? actionFooter : null\}[\s\S]*?<\/ScrollView>/,
  'the paywall action must directly follow the body inside the same ScrollView',
);

// ── 2. the stated Dynamic Type ceiling ────────────────────────────────────────────────────────
const declared = parts.match(/export const PAYWALL_MAX_FONT_SCALE = ([\d.]+);/);
assert.ok(declared, 'PAYWALL_MAX_FONT_SCALE is not declared in onboarding-parts.tsx');
const cap = Number(declared[1]);
assert.ok(cap > 1 && cap <= 1.3, `PAYWALL_MAX_FONT_SCALE is ${String(cap)}; the screen was measured to fit up to 1.3`);
assert.match(
  parts.slice(Math.max(0, parts.indexOf('export const PAYWALL_MAX_FONT_SCALE') - 3200), parts.indexOf('export const PAYWALL_MAX_FONT_SCALE')),
  /CONSTITUTION 5\.3/,
  'the ceiling is declared with no comment saying which rule it serves and what was measured',
);

/** Every <ThemedText> in a paywall region must carry a cap at or under the declared ceiling. */
const capped = (tag) => {
  const m = /maxFontSizeMultiplier=\{([^}]+)\}/.exec(tag);
  if (!m) return false;
  const v = m[1].trim();
  return v === 'PAYWALL_MAX_FONT_SCALE' || (Number(v) > 0 && Number(v) <= cap);
};

/** Every <ThemedText>/<PremiumText> tag in a region, checked for a cap. The `underAge` fine print
 *  is cut out first: it renders on the age step, not here (the under-13 gate sits well before the
 *  paywall), so it keeps full Dynamic Type. */
const uncappedTexts = (region, where) => {
  const scanned = region.replace(/\{underAge && \([\s\S]*?\n {6}\)\}/g, '');
  const bad = [];
  for (const m of scanned.matchAll(/<(?:ThemedText|PremiumText)\b[^>]*>/g)) {
    if (!capped(m[0])) bad.push(`${where}: ${m[0].replace(/\s+/g, ' ').slice(0, 100)}`);
  }
  return bad;
};

const bodyStart = onboarding.indexOf('<View style={styles.paywallBody}>');
assert.ok(bodyStart > 0, 'the paywall body was not found in onboarding.tsx');
const body = onboarding.slice(bodyStart, onboarding.indexOf('const isLoader', bodyStart));
const footerStart = onboarding.indexOf('const actionFooter = (');
const footer = onboarding.slice(footerStart, onboarding.indexOf('\n  return (', footerStart));

const benefits = parts.slice(parts.indexOf('export function PremiumBenefits'), parts.indexOf('const pb = StyleSheet.create'));
const planCard = parts.slice(parts.indexOf('export function PlanCard'), parts.indexOf('export function BackChevron'));
const trialStep = parts.slice(parts.indexOf('export function TrialStep'), parts.indexOf('/**\n * THE LARGEST DYNAMIC TYPE'));

const uncapped = [
  ...uncappedTexts(body, 'paywall body'),
  ...uncappedTexts(footer, 'paywall footer'),
  ...uncappedTexts(benefits, 'PremiumBenefits'),
  ...uncappedTexts(planCard, 'PlanCard'),
  ...uncappedTexts(trialStep, 'TrialStep'),
];
assert.equal(
  uncapped.length,
  0,
  `text on the purchase screen with no Dynamic Type cap, which is how the scroll comes back:\n  ${uncapped.join('\n  ')}`,
);

// No flex spacer element inside the body: it would take the spare height that space-evenly shares.
assert.doesNotMatch(body, /<View style=\{\{\s*flex(?:Grow)?:\s*1\s*\}\}\s*\/>/, 'a flex spacer in the paywall body parks the spare height in one band');

// The headline was the worst of them: `display` at 32pt with no ceiling.
assert.doesNotMatch(body, /<StepHeading/, 'the paywall headline is back on the uncapped StepHeading');

// The compaction that buys the fit on a short screen or at large type.
assert.match(onboarding, /const paywallTight = windowH < \d+ \|\| fontScale > [\d.]+;/, 'paywallTight is gone, so nothing compacts the screen when the room is not there');
for (const consumer of ['<PremiumBenefits tight={paywallTight} />', 'tight={paywallTight}']) {
  assert.ok(onboarding.includes(consumer), `paywallTight is computed but not passed: ${consumer}`);
}

// ── 3. the dismiss is a 44pt target, and it buys the points upwards ───────────────────────────
//
// CONSTITUTION 5.10 is 44pt. Measured 2026-09-22 on a booted iPhone 17 Pro through the
// accessibility frames: "Maybe later" was 766..792, a 26pt target, and 27.7pt at AX5. The row
// cannot grow, because the lowest required element is already at 857 of 874 at AX5 and 18pt more
// would push the legal links off a screen that is not allowed to scroll (5.3). So the target is
// bought with `hitSlop`, upwards, into the renewal-terms line, which takes no taps.
//
// UPWARDS IS THE WHOLE POINT and this pin holds that too: the legal row renders after the dismiss,
// so a downward slop here would hand taps in the shared band to the links. A `bottom` here is
// therefore a defect, not a bonus.
//
// AND THE LINKS MAY NOT REACH UP. Each legal link used to carry hitSlop top 13, which put the lower
// half of "Maybe later" inside Privacy's hit box (the centre link, directly under the centred
// dismiss). The owner reported taps on Maybe later opening the privacy policy (2026-09-30). The
// links buy their 44pt below the row instead; a `top` over 4 here is the same defect from the
// other side.
const dismiss = /<SpringPressable\b[^>]*accessibilityLabel="Maybe later">/s.exec(
  onboarding.slice(onboarding.indexOf('onPress={dismissPaywall}') - 400, onboarding.indexOf('styles.legalRow')),
);
assert.ok(dismiss, 'the Maybe later dismiss was not found on the paywall');
const slop = /hitSlop=\{\{([^}]*)\}\}/.exec(dismiss[0]);
assert.ok(slop, 'Maybe later carries no hitSlop; measured, the row itself is 26pt against a 44pt floor (5.10)');
const slopTop = /(?:^|[,{\s])top:\s*(\d+)/.exec(slop[1]);
assert.ok(slopTop, 'Maybe later\'s hitSlop has no `top`, which is the only direction with room');
assert.ok(
  Number(slopTop[1]) >= 18,
  `Maybe later's hitSlop top is ${slopTop[1]}pt; 26 + 18 = 44 is the floor (5.10), measured on the device`,
);
assert.doesNotMatch(
  slop[1],
  /\bbottom\b/,
  'Maybe later\'s hitSlop reaches DOWN into the legal row, whose links render later and carry hitSlop top 13; taps in that band would open Terms instead of dismissing',
);

const legalRow = onboarding.slice(onboarding.indexOf('styles.legalRow'), onboarding.indexOf('styles.legalRow') + 2400);
const linkSlops = [...legalRow.matchAll(/hitSlop=\{\{([^}]*)\}\}/g)].map((m) => m[1]);
assert.equal(linkSlops.length, 3, `expected the three legal links (Terms, Privacy, Restore) to carry a hitSlop, found ${String(linkSlops.length)}`);
for (const l of linkSlops) {
  const top = /(?:^|[,{\s])top:\s*(\d+)/.exec(l);
  assert.ok(!top || Number(top[1]) <= 4, `a legal link's hitSlop top is ${top?.[1] ?? '?'}pt; over 4 it reaches into "Maybe later" and a dismiss tap opens a legal page`);
}

console.log(`PASS - paywall body shares its spare height evenly, the CTA follows it, every text is capped at ${String(cap)}x, and the dismiss is a 44pt target.`);
