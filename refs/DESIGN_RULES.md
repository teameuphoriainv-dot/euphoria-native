# Euphoria design rules

Written 2026-08-25. **Every rule here is either something the owner corrected on a real device, or
something already true in the code that nobody had written down.** Nothing in this file is invented
taste. Where a rule exists because a specific defect shipped, the defect is named, because a rule
whose reason is missing gets deleted by the next person who finds it inconvenient.

Rules marked **PINNED** fail `npm run check`. The rest need judgement, and the judgement is yours.

---

## 1. Say a thing once

**Never state the same number, or the same sentence, twice on one screen.**

The Learn header carried `0/25`, and under the title `0% complete · 25 lessons`, and a progress bar,
all saying one thing. The paywall said "Cancel anytime in the App Store" as its own row and again,
verbatim, in the renewal terms 30pt below. Both were removed and nothing was lost, because the
duplicate was never the thing carrying the information.

Before adding a label, find what already says it. Usually something does.

## 2. No dead space, and no half-finished rows

**If a screen already fits, grow the components rather than leave slack between them.**

The paywall uses `justifyContent: 'space-between'`, so slack does not collect at the bottom, it
spreads evenly between blocks and reads as gaps someone forgot to close. Compressing the screen made
it fit and made the gaps worse. Growing the dots, the type and the card padding fixed it, because
there was less left to distribute.

**And if sibling rows have a subtitle, all of them do.** The third Pro benefit had a title and no
sub while the two above it had both. It read as unfinished rather than as a deliberately shorter
point.

## 3. Screens that ask for money do not scroll

The paywall must fit at once: headline, benefits, both plans, CTA, renewal terms and the legal row.
App Store Review 3.1.2 wants price and renewal terms ON the purchase screen, and a screen that has
to be scrolled to reach them is one where they can be missed.

Verify at the largest Dynamic Type size the screen supports, not just the default.

## 4. The call to action is never the quietest thing on the screen

"5 min to keep your streak" was `type="small"` in `mutedForeground`: 13px at the lowest contrast on
Home, directly under a 22px title. The one line asking the user to do something was styled as the
least important thing on it.

Weight and colour go to what you want tapped. Reuse a colour already on the screen so the palette
does not grow: that line now uses the streak colour the flame pill beside it already carries.

## 5. Pixel art is the system, not a decoration

**Round shapes sitting beside pixel sprites read as a different product.** The Learn trail node was a
true circle holding a pixel checkBadge and a pixel lock. Squaring it off cost nothing and made the
row one thing.

Two constraints when reaching for a sprite:

- `PixelSpriteView` takes `sprite / size / scale / play / playKey / frameMs / canvas` and has **no
  colour prop**. A sprite bakes its palette in. Anything that must carry the course accent or a
  state cannot be a sprite.
- Reuse the catalogue first. It has 84 sprites and the right one usually exists. New art goes in
  `sprites-additions.ts`, **never** in the web-synced files (`types / palette / compile / sprites /
  catalogue`), which are byte-for-byte copies and get re-copied.

## 6. One mascot per screen — **PINNED**

**Atlas is Atlas. The avatar is the user. They are never the same glyph on the same screen.**

`ProfileAvatar` rendered the Atlas mascot whenever no avatar was chosen, and `avatarFor()` returns
null for the atlas id by design, so that was every user who had never opened Profile to Avatar and
banner. Home already draws Atlas beside the greeting, so the header showed the same mascot twice and
the user had no picture of their own. Reported from a real device.

On Home the right cluster reads, left to right: coins, streak, **Atlas, avatar** — avatar furthest
right.

## 7. Paid surfaces carry the web's ramp

euphoriainv.com runs purple to pink to orange across every upgrade surface. The iOS paywall now
matches: `SlabButton tone="premium"`, the SAVE badge, and the three benefit dots walking the ramp
top to bottom.

The stops are already in the palette: `gradientFrom` (purple), `premiumFrom` `#E0409B`,
`premiumTo` `#F5842B`. **No new colour was introduced and none should be.**

Do not paint the ramp on anything that is not selling something.

## 8. Colour comes from the theme — **PINNED (ratchet)**

Hardcoded hex outside the art files is capped at its current count, so no new one can land without
a deliberate change to the pin.

Deliberate exceptions, which is why this is a ratchet and not a ban:
- **Chosen decoration that must look identical in both themes** — banner bands, the Money 2048 tile
  ramp, Atlas's own palette. Comment why, at the site.
- **Diagnostic overlays** the user never sees.

**Alpha-append (`theme.x + '30'`) works only on HEX.** Appending to an `hsl()` string produces an
unparseable colour that React Native renders at **full opacity, silently, with no error**. Already
guarded by `theme-alpha-pin`.

## 9. Contrast is computed, never eyeballed

4.5:1 minimum for body text. Compositing counts: `primary + '18'` is ~9% alpha over the card token
and must be resolved to a solid colour before measuring.

Put the measured ratio in the comment. `you.tsx` shipped a title chip at 4.08:1 while `digest.tsx`
had already fixed the identical defect and recorded `primary 4.49 vs iconLilac 8.29` — the fix
simply never crossed the file boundary.

## 10. Touch targets and motion

- **44pt minimum**, the HIG floor. `chip` in learn.tsx is `minHeight: 44` on purpose.
- **A one-finger swipe IS VoiceOver's navigation gesture.** Any gesture mechanic needs a button
  alternative designed in the same pass, not retrofitted. Money 2048 shipped unplayable for
  VoiceOver and needed a D-pad added afterwards.
- **Vestibular motion must be guarded by `useReducedMotion`** — already enforced by
  `reduced_motion_audit.py`, which also catches `useAnimatedStyle` rotations with no `with*` helper.

## 11. Structure

- **Five tabs maximum.** A sixth makes iOS show a More overflow and truncates labels at
  accessibility sizes. Profile lives behind a header button. Settled; do not re-litigate.
- **No em dashes in user-facing prose** — `em-dash-prose-pin`.
- **A screen that exists but nothing links to is not shipped.** `/avatar` was built and reachable
  from two links, both on Profile, so effectively nobody found it. Re-run the orphan sweep after any
  navigation change.

---

## What the pin actually checks

`scripts/design-rules-pin.mjs` guards only what a script can verify, and each check exists because
that exact defect reached a device:

| Check | The defect it prevents |
|---|---|
| `profile-avatar.tsx` never renders `<Atlas` | Two Atlas mascots in the Home header |
| every `PRO_STEPS` entry has a `sub` | The third Pro benefit rendering as an unfinished row |
| hardcoded hex count does not grow | Colour drifting out of the theme one literal at a time |

Everything else in this file is judgement. If you find a rule here being cited to justify something
obviously worse, the rule is wrong and should be changed, not worked around.
