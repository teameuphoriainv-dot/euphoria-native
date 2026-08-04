# Digest hero illustrations — ChatGPT Images prompts

Five new guides currently BORROW an existing post's illustration. These prompts generate
replacements.

## Read this first

**Output format mismatch.** `digest-heroes.ts` stores SVG XML rendered through `SvgXml`, authored
on a **320x200 viewBox**. ChatGPT Images returns raster PNG. So these are CONCEPT ART, not drop-in
assets. Two ways forward:

1. Generate here, then vectorise (trace in Figma/Illustrator, or hand-rebuild as SVG). Keeps the
   existing pipeline and the crisp scaling.
2. Change the pipeline to accept raster covers. Viable for a static article cover — it is not a
   mascot and is never transformed — but it bloats the bundle and breaks `heroSvg()`.

Option 1 is the transcript's hybrid workflow: generate/commission a base style, derive the rest.

**One or two prompts is not enough.** If a result arrives in two prompts, everyone else's will too.
Expect 30+. Mix and remix. The bar: someone should not be able to tell how it was prompted.

---

## THE STYLE BLOCK

Paste this above EVERY subject prompt. It is the whole reason the output will look like Euphoria
rather than like every other app shipped this year.

```
Semi-3D vector illustration in a single-hue violet palette, on a near-black background (#0B0910).

Palette, use exactly these: lit faces #DEA5F5, body #A855EB, deep shadow #5B2E85, rim highlight
#F0EEF4. No other hues anywhere. No orange, no green, no blue.

Form language: simple geometric solids — cylinders, rounded slabs, soft-cornered boxes. Chunky and
friendly, not technical. Gentle perspective, roughly 3/4 view, NOT flat and NOT full isometric.
Rounded edges throughout, no sharp corners, no bevels, no chrome.

Lighting: single soft key light from the upper left. A thin bright rim on upper edges. Soft ambient
occlusion where forms meet. A subtle violet glow behind the subject.

Composition: ONE central subject, floating, casting a soft elliptical shadow beneath it on the
background. Generous empty space around it. Landscape 16:10.

Absolutely no text, no numbers, no letters, no logos, no watermarks. No people, no faces, no hands.
No photorealism, no gradients that read as glass or metal.
```

---

## THE FIVE SUBJECTS

### 1. how-credit-cards-work · Credit
Currently borrows `cover-debt-balance` (a balance scale — belongs to good-debt-vs-bad-debt).

```
SUBJECT: A single credit card floating at a three-quarter angle, slightly tilted, with a small
rounded chip on its face and softly rounded corners. Behind it and slightly smaller, a second card
ghosted back in deep shadow violet, suggesting a second one you did not mean to open. Nothing
written on either card.
```

### 2. what-moves-a-stock-price · Markets
Currently borrows `cover-quote-card` (belongs to how-to-read-a-stock-quote).

```
SUBJECT: One tall candlestick chart candle, standing upright and solid in bright violet. Directly
behind it, offset upward, a translucent GHOST of the same candle in dim violet outline, so there is
a visible GAP between the solid candle and the ghost. The gap is the subject — it should read as
the difference between what happened and what was expected. No axis, no grid, no labels.
```

### 3. investment-fees-explained · Strategy
Currently borrows `cover-compound` (belongs to what-is-compound-interest).

```
SUBJECT: A tall stack of rounded coin cylinders. A thin wedge slice has been cleanly cut from the
stack and floats slightly away to one side, in dimmer violet, as though it is being quietly removed.
The stack stays whole and appealing; the removed sliver is small enough to look insignificant, which
is the point. No coin faces, no markings.
```

### 4. target-date-funds-explained · Investing
Currently borrows `cover-portfolio` (belongs to build-your-first-investment-portfolio).

```
SUBJECT: A smooth curved track, like a gentle ski slope, arcing from upper left down to lower right.
A single rounded sphere sits on the track partway along. The upper part of the track is bright
violet and slightly thicker; the lower part is calmer, deeper violet and thinner — a glide from
energetic to steady. No arrows, no markers, no scale.
```

### 5. how-tax-brackets-work · Money basics
Currently borrows `cover-tax-slice` (belongs to capital-gains-tax-basics).

```
SUBJECT: Three rounded open-topped buckets of increasing height, arranged left to right like a
staircase. The shortest bucket on the left is completely full of a soft violet liquid, and that
liquid is spilling over its rim in a smooth rounded stream into the middle bucket, which is only
partly full. The tallest bucket on the right is empty. Buckets are chunky and friendly. No taps, no
pipes, no labels.
```

---

## How to run it

1. Paste **style block + one subject** as a single message. Ask for 4 variants.
2. Reject anything with text, a second hue, a human, or a flat vector look.
3. Iterate on the parts that miss. Useful follow-ups:
   - "rounder and chunkier, less technical"
   - "stronger rim light on the top edges only"
   - "more empty space, the subject is too large in frame"
   - "the shadow should be a soft ellipse on the background, not a hard drop shadow"
   - "reduce to a single violet hue, you have introduced a second colour"
4. Once ONE subject looks right, lock that image as a style reference and generate the other four
   AGAINST it, so all five are siblings. This matters more than any individual image — the library
   is seen as a set, in a vertical list, all at once.
5. Compare against the existing 20 heroes side by side before accepting. New ones must sit in the
   same family, not merely be good on their own.
