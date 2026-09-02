# iOS rendering QA — findings log

Rendering defects are the class the curriculum parity proofs **cannot** catch. `parity:web` and
`parity:structure` compare *inputs* (lesson data, screen order); these findings are about how the
iOS app *draws* that identical data. Both were green while every defect below existed.

Method: the parity sweep drives lessons on the simulator; screenshots are read-only, so they can be
captured mid-sweep without interfering, and inspected against the accessibility tree.

---

## FIXED

### 1. Diversification stakes card headed "Starting Late / Starting Early" — `4dd28eb`
**Severity: content-visible.** A lesson about concentration vs diversification was labelled with
*timing* headings.

`stakesFallbackHeadings` tested `label.includes('22')`, intended for "starting at age 22". The bare
substring also matched the **year** in `100% in Meta (2022)`, so it took the timing branch and never
reached the `meta` branch that yields the correct pair. Now requires an actual age (`age 22`/`at 22`).

    before: "Starting Late"  / "Starting Early"
    after : "Single Stock"   / "Diversified Portfolio"   (matches the web renderer)

Audited across all 300 lessons: exactly one card affected.

### 2. WCAG AA contrast failure on the primary button — `b9f6eff`
White label on the primary fill measured **4.07:1** (dark) and **4.27:1** (light). The label is
`type="bodyMedium"` = 16pt medium — neither >=18pt nor >=14pt bold, so it is normal text needing
**4.5:1**, not the 3.0:1 large-text threshold. The most-pressed control in the app failed 1.4.3.
Primary darkened hue- and saturation-preserving to `#A148E9` / `#A349E6` (4.55 / 4.51). Lightness
moves 62.7% -> 59.9%, so the brand reads unchanged.

### 3. Tap-reveal cards lost their reveal-state label — `31ec49e`
A refactor dropped `accessibilityLabel={... : `${term}. Not revealed yet.`}`. VoiceOver could not
distinguish a flipped card from an unflipped one.

---

## OPEN — needs a decision, not a unilateral fix

### 4. Vocabulary conversation leaves ~60% of the screen empty
**Observed:** `applied-accounting--01`, step 6/15. Settled state, not mid-animation.

Content ends at the `Done` button ~32% down an 874pt screen; the remaining ~500pt is blank. The
conversation renders one bubble at a time with no accumulated history, so the lower two-thirds is
permanently empty for all 13 beats.

    content:  { flexGrow: 1, paddingBottom: 48 }   // top-anchored
    nextWrap: { alignSelf: 'flex-start', marginTop: 14 }

### 5. CTA placement is inconsistent between step types
The conversation's advance button sits at **y=321**; every other lesson step places its advance
control near the bottom at **y≈694–746**. Within one lesson the primary action jumps ~370pt.

**Why these are not yet fixed:** the goal is parity with the web app. If the web conversation renders
the same way, both are a deliberate chat-style layout and changing iOS alone would *create* a
divergence. The next step is to render the same vocabulary conversation on web and compare before
touching either.

---

## Checked and clean

- **Reduced motion** — 0 unguarded vestibular defects; 46 of 59 animated files guarded, the
  remainder correctly exempt (opacity cross-fades and touch-bound press feedback).

## Known, unfixed, lower severity

- Type ramp is **20 steps**, 8 over the 12-step healthy ceiling.
- 6 number formats unpinned to locale — the same value renders differently per device.
- 3 screens with no empty state; 1 with error handling but no retry.
- Inline term popovers set `accessibilityLabel={`${text}, tap for definition`}` on a nested `<Text>`.
  iOS surfaces nested text links by their text content and **discards the child's label**, so the
  hint never reaches VoiceOver — 432 authored instances.
