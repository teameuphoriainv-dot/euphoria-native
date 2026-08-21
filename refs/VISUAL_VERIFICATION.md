# Visual verification — what looking at the screen caught that nothing else did

2026-08-20. Every item here passed `npx tsc --noEmit`, `npm run check` (18 lanes) and read
correctly in the accessibility tree **while the screen was visibly wrong**. That is the finding.

---

## The binding lesson

> **Type checks, regression lanes and the accessibility tree all verify that the right VALUES
> exist. None of them verifies that the right PIXELS are drawn.** Two shipped bugs sat squarely in
> that gap, and both were found in the first ten minutes of actually looking.

Add to the audit's standing rules: a change that alters what is DRAWN — an image source, a layout
constraint, a stagger, a caption — is not verified until someone has looked at it rendering.

---

## Bug 1 — bundled logos rendered as solid colour blocks

**Symptom on device.** NVIDIA was a plain green square. Tesla plain red. Amazon plain orange.
Microsoft a white square with a single orange pixel in one corner.

**That last detail is what solved it.** One stray corner pixel is the signature of a centre crop
of a zoomed image, not of a missing asset.

**Cause.** A `{uri}` source has no intrinsic size, so `StyleSheet.absoluteFill` sized it and the
proxy path looked correct for years. A static `require()` DOES carry one — the bundled marks are
192×192 — so React Native laid the image out at intrinsic size and let the wrapper's
`overflow: hidden` clip it.

**Proof the assets were fine.** Compositing the PNGs to a contact strip showed perfect marks: the
NVIDIA eye and wordmark, the Apple logo, the Tesla T, the Microsoft squares, the Amazon smile.
Only the layout was wrong.

**Fix.** Explicit `width`/`height` alongside `absoluteFill`. Re-checked on device: marks now
render inside their tiles.

## Bug 2 — the watchlist was never live

**Symptom on device.** `"NVIDIA, NVDA, $1,184.00, up 3.1 percent"` against a real close of
**$217.56**.

**Cause.** `trade.tsx` rendered `STOCKS[sym].price` — the hardcoded string — and `STOCKS[sym].chg`
beside it. No amount of live pricing could ever reach those rows. The POSITIONS above them used
`priceOf()` and were correct, so half the screen was live and half was fiction, which is precisely
why it survived review: the half anyone checked was right.

**Verified after, all seven:**

| symbol | before | after |
|---|---|---|
| NVDA | $1,184.00 up 3.1% | **$217.56 down 1.9%** |
| GOOGL | $182.11 | **$344.72 up 0.7%** |
| AAPL | $228.50 | **$316.83 up 2.2%** |
| TSLA | $244.00 | **$351.12 up 3.6%** |
| AMZN | $201.44 | **$265.84** |
| META | $612.30 | **$546.03** |
| MSFT | $445.55 | **$484.31** |

## Bug 3 — the same ticker showed two different prices

`/prev` and the grouped endpoint sit a session apart: NVDA read **$216.85** from one and
**$217.56** from the other. Because `getQuote` wrote through `setMark`, the price on the TRADE tab
changed depending on whether you had opened the stock screen. Fixed by making the grouped marks
the single source; verified on device that both surfaces now read $217.56.

---

## A measurement of mine that was invalid, and how it was caught

The first digest verification recorded **249 frames at 49.8 fps**, measured ink in the lower half,
and concluded "cards render — no blank region."

**It was measuring the HOME screen.** `euphorianative://digest` silently no-opped and the capture
never left home. The ink numbers were real; the screen was wrong.

This is the audit's own binding lesson — *deep links silently no-op, so VERIFY navigation by
comparing labels before trusting any capture* — and it was violated anyway, in the middle of a
session about verification. The re-run compared label sets first (**85 labels changed**, digest
markers present) before recording anything.

**The tell was visual, not numerical.** The ink figures looked perfectly healthy. Rendering one
frame and looking at it took seconds and showed Home.

---

## Verified working

| change | how | result |
|---|---|---|
| bundled logos | screenshot, a11y box crop | marks render inside tiles |
| watchlist prices | a11y labels, 7 symbols | all live, matching the endpoint |
| `asOf` caption | screenshot of the price region | "Previous close · Aug 19", muted, correctly placed |
| digest stagger | 329 frames @ 54.8fps, navigation verified | ink 481–512, never drops; no blank cards |
| trade tab tile row | screenshot | News/Options as an even two-up after Search was removed |

## Still NOT verified visually

- The 203 bundled logos beyond the seven on the trade tab.
- The stock screen chart, which renders **"No data for this range"** on device because a stock
  screen needs 6–7 upstream calls against a five-per-minute ceiling. That is a plan limit, not a
  rendering fault, and the fix is to defer the below-the-fold sections.
