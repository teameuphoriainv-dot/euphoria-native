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

### 7. Matching exercises scored correct answers as WRONG on iOS but not web — FIXED
**Severity: user-facing, three lessons, confirmed behavioural divergence.**

Three lessons author a many-to-one CLASSIFICATION exercise:

    The Language of Accounting    4 account types -> Debit / Credit
    Cash Flow Statement Mastery   4 items         -> Operating / Investing / Financing
    Systemic Risk & Contagion     6 statements    -> Systemic / Idiosyncratic

Native's `MatchingPairs` matched on INDEX (`j === selected`) and kept one index list shared by
both columns, so the second cell reading `Debit (left side)` was scored WRONG despite being the
same, correct category. The learner lost a heart on a coin flip with nothing on screen to tell the
two cells apart, and the step could never reach `solved` -- so Continue never appeared.

The web app has always been correct. `MatchView` in StepRenderer.tsx:579 compares TEXT
(`shuffledRight[ri] === step.pairs[selLeft][1]`) and tracks consumed right cells in a
`Map<left, right>`. Native now does the same, arrived at before that file was read.

**This is the defect class the curriculum proofs cannot catch, demonstrated concretely: the data
was byte-identical and `parity:web` was green the entire time the bug existed.** Content parity and
behavioural parity are different axes.

The duplicate React keys fixed alongside this were a SYMPTOM of the same authored duplication,
not the cause. No curriculum change was needed, so web parity is untouched.

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

### 6. MatchingPairs throws on every render — blocks the step (OPEN, highest severity)
**Observed:** Metro logged **30 identical error blocks**, every one framed at
`matching-pairs.tsx:171` (the `</View>` closing the left column's `.map()`), with the component
appearing twice in the stack:

    MatchingPairs (src/components/matching-pairs.tsx:171:16)
    MatchingPairs (src/components/matching-pairs.tsx:205:12)
    Lesson (src/app/lesson.tsx:708:14)

**User impact:** the parity driver matches every pair correctly and then cannot advance --
`solved:match(N pairs) moved=true` followed by `moved=false` three times. It stalled
`investing-fundamentals--08` and `applied-accounting--01`. `matching_pairs` is authored
**201 times**, so this is the single largest device-lane blocker found so far.

On the success path `MatchingPairs` renders only the text "All matched. Nicely done." and never
calls `onComplete` -- that prop is wired solely to the *escape* (give-up) affordance. The only exit
is the footer Continue, which `ownsItsCta` releases once `solved` is true.

**Ruled out:**
- *Duplicate/undefined React keys.* The authored pairs are tuples (`["Stocks", "Ownership..."]`),
  but `normalizeStep` converts them to `{left, right}` before render, so keys resolve to unique
  strings. (Checking the RAW lesson data instead of the normalized spec falsely reports all 201
  steps as broken -- the same read-the-wrong-source trap logged elsewhere in this repo.)
- *"Text strings must be rendered within a `<Text>`".* Both columns wrap their content in
  `<ThemedText>`.

**Blocked on:** the error message is EMPTY in the Metro log -- only the code frame survives. The
next step is reading LogBox on the device during a run, which the captured log cannot provide.

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
