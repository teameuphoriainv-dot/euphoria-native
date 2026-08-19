# AX5 Dynamic Type audit — closing summary

Iterations 41–63. Every screen in the app was opened at
`accessibility-extra-extra-extra-large` (3.12x, iOS body 17pt -> 53pt) and photographed.

## The four defect shapes, and the fix each takes

| shape | what it looks like | fix |
|---|---|---|
| **TRUNCATION** | an uncapped font loses its own words, or pushes out of its card | `maxFontSizeMultiplier` — 1.4 compact chrome, 1.6 competing with a fixed sibling or in a button, 2 with room |
| **OVERFLOW** | content taller than a container that cannot grow | `ScrollView` (`flexGrow:1` + `justifyContent:'center'`, absoluteFill overlays OUTSIDE) or `minHeight` instead of `height`. **A font cap does NOT fix this** — it only postpones the overflow |
| **COLLISION** | two elements grow into each other; `space-between` cannot separate children once they fill the row | `gap` + `flexWrap` |
| **SPLIT NUMBER** | a figure wraps mid-number and reads as a DIFFERENT NUMBER | cap **plus** `numberOfLines={1}` — the OPPOSITE of the prose treatment |

The last one is the important one. Every other shape is visibly broken, so a user knows not to
trust it. `"$228.5" / "0"` is quietly wrong: it reads as $228.5. On a finance screen that is a
correctness problem, not a cosmetic one. For prose, wrapping beats truncating; for a price the
order reverses, because an ellipsis reads as incomplete while a split reads as a wrong figure.

## Confirmed on device (17)

tab bar · home header · featured lesson card · learn header · lesson intro (4 defects) ·
GradientButton (fixes every primary CTA app-wide) · reward titles · you identity card ·
digest TODAY card · digest article (2) · trade portfolio value · stock price ·
compound header · compound projection · price-chart empty note · news.tsx (clean) ·
search field

## Applied but UNVERIFIED — resolved down to 2, and those settled from the code

Four of the original five were cleared by SEEDING the state that exposes them, which turned
out to be the answer to a "false pass" rather than an excuse for one:

- **options chain** — was called unreachable; it is reachable by deep link, and checking it
  found a REAL defect the audit's own sweep had missed (prices splitting as "$57." / "00").
- **league tier** — this account holds "Saver", 5 characters, which fits and passes for the
  wrong reason. Seeding `xp` to 5200 forces "Portfolio Manager", 17 characters, the longest
  name in the app. CONFIRMED wrapping to two complete lines.
- **reward revealed value** — seeding `pendingRewards` reached the branch and found the TICKER
  splitting as "AA" / "PL". Fixed and confirmed. The value's ellipsis turned out to be an
  artifact of my own extreme seed: rewards can only ever be $0.25–$2.00, so the cap was
  deliberately left alone rather than tightened for a value that cannot occur.

**The remaining 2 are settled from the code, NOT device-confirmed, and are labelled as such:**

| state | why the device could not reach it | why the code settles it |
|---|---|---|
| lesson DONE | `idx` is LOCAL component state, so seeding cannot set it, and two drive attempts (34 tap-cycles at default size, and an earlier pass at AX5) failed to advance past the intro | it uses `styles.introContent`, the SAME idiom as the lesson intro, which is confirmed at AX5 and at default size in the same file |
| StreakIgnite | sits one step beyond DONE, behind the same barrier | its `wrap` sets no fixed width or height, and `count` has no `lineHeight` since the frozen one was removed, capped at 1.6 → max 64pt. A streak is 1–3 digits; "365" at 64pt is ~115pt in an unconstrained box |

### The original list, for the record

| fix | why it could not be verified |
|---|---|
| lesson DONE state | sits after 20 interactive steps; blind driving stalls at the first choice step by design |
| StreakIgnite | sits after the DONE state, same barrier |
| options chain cells | screen unreachable in 2 navigation attempts; settled from the code instead |
| league tier name | this account is tier "Saver", which FITS — device testing returns a false pass. The defect lives in data the account has not reached |
| reward revealed value | needs a pending reward this account does not have |

## Seven false reports avoided by asking why before filing

1. 3 contrast "AA failures" — palette pairs that never render; `Colors.dark.primary` is used as a background nowhere
2. touch target "See all" at 18pt — the lane cannot see `hitSlop`; it is exactly 44.0pt
3. `reset()` sparing 18 fields — "fixing" it would have opened a reward-farming exploit
4. safe-area: 3 findings that dissolved (the provider comes from expo-router's `SafeAreaProviderCompat`)
5. "the lesson cannot be completed at AX5" — choice steps already scroll; the taps never scrolled
6. a 30-file lineHeight sweep — disproved by the device
7. "the app renders blank at AX5" — reproduced at default size too; it was cold-launch latency

## Four times a lane, or one of my own patches, was wrong

- `dynamic_type_audit` was **counting its own comments** as defects — the count rose after a fix, which is the only reason it surfaced
- `leading_audit`'s headroom ranking **does not predict** the two real defects; it is published as an inventory, not a verdict
- `locale_audit` had a **false negative**, reporting zero currency defects while two existed, because it knew only the template-literal shape and not the JSX one
- my own patch contained a **tautological assertion** (`assert X or True`) that could never fail, papering over a real flaw in the same regex

A lane that under-reports is worse than one that over-reports: it certifies a broken screen as
clean. That is why every matcher change now asserts BOTH directions.

## Default-size regression pass (added after the audit shipped a regression)

The AX5 program swept every screen at 3.12x and **never once swept at default size**. That is
how a regression from its own iteration-55 collision sweep reached the owner, who reported it
before the audit noticed: `flexWrap: 'wrap'` on `course-rail-card`'s `card` style, a COLUMN
with a fixed `height: 150`, which makes flexbox start a second column to the right and pushed
"Alternative Investments" out past the card border.

The error was SCOPE, not premise. Collision is a ROW phenomenon — two elements growing toward
each other horizontally. On a column, `space-between` distributes vertically and nothing can
collide that way, so the sweep should never have matched columns. `gap` on a row is confirmed
inert; `flexWrap` on a fixed-height column is not, and I justified the sweep on the former
without testing the latter.

**14 screens re-verified clean at default size:** reward, home, stock, lesson intro, course
rail, compound, search, news, learn, trade, you, digest, digest article, options.

**One defect the audit itself introduced:** the flexWrap regression, fixed and confirmed.

**One defect the audit's own sweep MISSED**, found only because options turned out to be
reachable after being marked otherwise: the chain's prices split as "$57." / "00" and the
strike $222.50 as "$22" / "2.5" / "0". The earlier pass had capped that screen's IV and greek
sub-lines and never its prices, and the split-number sweep matched only display/title/hero
tokens while these were bodyMedium and smallBold.

**A 12-site `money()` worklist resolved to ZERO fixes.** Every one sits in a flexible or
wrapping container, unlike the options cells in their fixed 88pt column, and two were verified
on device at AX5 rather than merely reasoned about. Blanket-capping all twelve would have
repeated the flexWrap mistake exactly.
