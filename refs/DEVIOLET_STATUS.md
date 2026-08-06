# De-violet the content layer — status (backlog #1)

All numbers MEASURED on device or on source. Method: `MOTION_RESEARCH_V3.md` §D2.

## DONE AND VERIFIED — digest surfaces

`hero-tint.ts` had **zero callers** when this session started: written, never wired. The
measured problem was still fully live. Now wired at all 5 render sites.

| Markets content band | before | after |
|---|---|---|
| violet (H250–280) | 37.4% | **5.1%** |
| cyan (H180–200) | 50.1% | **56.0%** |

Control: `what-is-compound-interest` (Money basics, deliberately untinted) measured
**100% violet / 0% cyan** before and after. The control is what proves the mechanism is
category-driven rather than a global filter — keep it in any re-run.

Also fixed: a **raw NUL byte** at `hero-tint.ts:46` (cache-key separator written as a literal
`\x00` instead of the `\0` escape) that made the file read as binary to `grep`, `file` and diff
tooling. Deleted `DigestBody` — 83 lines, zero callers, held a second untinted call site.

Added `heroTint(category)`: `theme.primary` is `#A855EB` = `VIOLET_RAMP[2]` exactly, so every
category ramp has a precise counterpart for panel washes. No invented hex. Without it the art
recoloured but its ground did not — cyan illustration on a violet wash.

Verified: `tsc --noEmit` clean · `expo lint` clean in all touched files · measured · seen.

## MEASUREMENT TRAP FOUND — adds to the list in the handoff

**Do not test the tint on the Credit category.** `#EC4899` (H330 pink) is *pre-existing art* in
`cover-credit-card`; a naive hue read credits the tint for colour that was already there.
`VIOLET_RAMP` covers only 29% of that hero's tokens. Test on **Markets → cyan (H188)**: no cyan
exists anywhere in violet art, so the test can actually fail.

## RESIDUAL — corpus-wide, measured on `digest-heroes.ts`

1088 colour tokens; `VIOLET_RAMP` covers 70.9%. Of the 934 violet-family tokens (H240–300,
S>0.12) the ramp catches **82.5%** and misses 17.5%:

- Deliberate: dark violet-greys `#332B4A` ×35, `#4E4370` ×34, `#221C36` ×32, `#241E36` ×23.
  These are shadow structure. `hero-tint.ts` preserves L and S on purpose — recolouring them
  breaks the illustrations' internal contrast, which is what makes them readable at 320×200.
- **Genuine gap:** `#B862ED` ×9 and `#D9B4F5` ×6 — bright brand violet the ramp does not catch.
  `#B862ED` is the `COURSE_ACCENTS` fallback. Worth adding as ramp stops.

## NOT A TARGET — corrected

`lesson-art.tsx` is named as a de-violet target in the prior handoff. **It is not.** 10 colour
tokens total, 1 violet-family (`#241C33`, H261 S0.45 **V0.20** — a dark ground). It draws from
theme/props, not hardcoded brand hexes. Nothing to do here.

## NEXT — `euphoria-icons.ts`, needs a design decision first

422 colour tokens, 77 violet-family (18%): `#BB83F1` ×36, `#A451E6` ×19, `#C89CF5` ×10,
`#C57FF3` ×7, `#B862ED` ×4.

Consumed by `src/components/icon.tsx` (shared) and `dev-gallery.tsx`. Because `Icon` renders in
**both chrome and content**, a blanket file recolour would de-violet the navigation, which the
settled rule forbids (violet stays for chrome/progress/selection).

Correct shape: same render-time tint as heroes — caller passes the accent, `Icon` stays violet by
default. Do NOT edit the hexes in place.

## QUEUE (user-confirmed order)

1. ~~de-violet digest~~ DONE · `euphoria-icons.ts` remains, per above
2. ScreensDesign redesign — `refs/PROMPT_SCREEN_REDESIGN_V2.md` (needs interactive OAuth)
3. Paywall dismissal offer — `SCREEN_REDESIGN.md` §1/§4 T1
4. 8 pre-existing lint errors: `number-rollup.tsx`, `ambient-background.tsx`, `trade.tsx`,
   `you.tsx`, `friends.tsx`, `start.tsx`, `stock/[sym].tsx`, `games/term-match.tsx`,
   `explore/compound.tsx`

Scope decision: audit all 25 routes for concrete defects first, rank by severity, then work all
25 including the dev routes.
