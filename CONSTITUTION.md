# CONSTITUTION — euphoria-native

**These are advisory.** Nothing here blocks a commit and nothing here overrides your judgement.
They are guidance, and the reason each one exists is stated so you can decide whether it applies.

Every rule below was bought with a real mistake in this repository. Where a rule cites a file and
line, that citation is the scar. If you are about to do the opposite of one of these, that is not
forbidden — but you should be able to say why this time is different.

**The dominant failure mode of this project is not crashing. It is looking fine while being wrong.**
Almost everything below follows from that one sentence.

---

## I. Evidence

### 1. Verify the route before trusting any capture — L2
Call `get_current_route` (or otherwise confirm what is on screen) before believing a screenshot or a
profile. Three separate findings in this project's history were fabrications produced by capturing a
screen the app was never on: 249 frames scored as the digest screen were the home screen.
*(`refs/NEXT_SESSION.md` §3.2)*

### 2. A still frame is not evidence of an animation — L2
If the change is motion, record it and sample frames. A screenshot taken after the animation settles
looks identical whether the animation ran or not. The lesson-intro stagger (P1) was only provable
from a 6-second simulator recording sampled at 14fps.

### 3. Read the screen, never only a description of it — L2
`AGENTS.md` opens with a paywall redesign that was built, shipped and reverted because a flow
*summary* was treated as evidence. The screen contradicted the summary and took one call to pull.
*(`AGENTS.md:24`)*

### 4. When a result looks clean, spend one more call trying to falsify it — L3
Nearly every serious error here came from accepting a plausible result. Nearly every real finding
came from a second look that contradicted the first.

### 5. Only the owner marks something verified, and only on a physical device — L2
A passing gate means *ready for verification*. It does not mean fixed. Write
`ready-for-verification` and let a human on a real phone move it. *(`refs/NEXT_SESSION.md` §1.3)*

---

## II. Tests and gates

### 6. `npx tsc --noEmit` and `npm run check` should both exit 0 before committing — L2
`npm run check` is currently 25 regression gates. Each exists because the thing it checks was
actually broken once.

### 7. A test that cannot fail proves nothing — L2
Before trusting a new check, ask what result would falsify the hypothesis. If nothing would, it is
theatre. A clean-clone `npm ci` test once "proved" the lockfile healthy while running the very npm
that wrote it — structurally incapable of reproducing the failure, and it misdirected four builds.

### 8. A new pin should be shown to FAIL against the pre-fix code — L2
`scripts/order-derangement-pin.mjs:58` asserts that the *previous* shuffle fails the same check.
Without that, a pin that passes tells you nothing about whether it can distinguish the bug from the
fix.

### 9. Prefer pinning the OUTCOME over the constants — L3
`press-feedback-pin.mjs` computes the shrink an 80ms tap actually produces, so swapping in a slower
spring fails even though nothing in the diff looks wrong.

### 10. An absence assertion should strip comments first — L2
An assertion that some old code is *gone* will match the comment explaining why it is gone.
`goal-minutes-pin.mjs` failed on exactly this on its first run; `pricing-pin.mjs` already stripped
for the same reason.

### 11. Do not judge a build by output piped through `tail` — L2
`npx eas build … | tail -30` reports exit 0 even when the build failed, because the shell sees
`tail`'s status. This masked two separate failures. Grep the log for the outcome instead.
*(`refs/NEXT_SESSION.md` §6.1d)*

---

## III. The purchase surface

This is the highest-consequence code in the app. It is the one place where being wrong costs money
and can hold up App Review, and it has already shipped the same class of bug twice.

### 12. No bare price literal outside `PRICING` in `onboarding.tsx` — L2
Change `annual` alone and the "SAVE 33%" badge and the "$6.67 a month" line silently become lies.
*(`scripts/pricing-pin.mjs:52`)*

### 13. A free trial may be offered only to a non-Pro user whose clock has not started — L2
`tier()` answers `'trial'` from `activeDays.length` 0 through TRIAL_DAYS, so it cannot tell a fresh
install from someone on day 2 of 3. Asking `spent` alone offered a trial to people already on one,
and to paying subscribers. *(`src/lib/entitlement.ts:107`, and the warning at `:112` — "a paying
user must never see a trial countdown")*

### 14. Prices and renewal terms belong ON the purchase screen — L2
App Store Review 3.1.2. The footer sentence is what Review reads, not the timeline above it.

### 15. Never advertise something the store cannot deliver — L2
The paywall once promised a free trial that existed in no territory, and rendered healthy-looking
prices from hardcoded constants while the products behind them were unfetchable. A dead purchase
path looks exactly like a working one.

---

## IV. State

### 16. Anything added to the store must also be added to `partialize` — L2
Otherwise it silently does not survive a restart. The file says so at `src/lib/store.ts:10`; it is
repeated here because "silently" is the operative word.

### 17. Never derive one counter from another by dividing by a constant — L2
`quests.ts` recovered the lesson count as `minutes / MINUTES_PER_LESSON`. Two bugs cancelled out —
the goal over-counted minutes, quests under-counted lessons — so both looked right. Fixing either
alone corrupts the other, with no throw. *(`scripts/goal-minutes-pin.mjs`)*

### 18. Validate at the boundary — L2
Clamp values that come from outside the reducer. Elapsed wall-clock is not time spent; a lesson left
open in a pocket should not swallow a ten-minute goal.

---

## V. Motion and accessibility

### 19. Vestibular motion needs a real `useReducedMotion` guard — L2
Translation, rotation, infinite repeats and preset layout animations. The audit's exemption list is
documentation only and deliberately does **not** suppress the check — a whitelist that can hide a
real defect is a trapdoor. *(`scripts/reduced_motion_audit.py`)*

### 20. Reduced Motion does not mean no animation — L3
It means no vestibular triggers. An opacity cross-fade is what the setting substitutes *for* motion,
and finger-bound press feedback is kept. Removing all animation is its own defect.

### 21. No scale-pop on ordinary interaction — L2
Tab switching happens dozens of times a session; a glyph that punches in scale becomes noise by the
third tap. A 3pt lift reads once and then simply says "this one is selected".
*(`scripts/motion-invariants.mjs`)*

### 22. Never convey state by motion alone — L2
Colour and weight carry selection in both motion modes, or the state is invisible under the setting.

---

## VI. Making changes

### 23. Fix at the shared source, not per caller — L2
`GradientButton` → `SlabButton` was one component change that reached 19 call sites. A guard in the
shared function is a smaller diff than a guard in every caller, and patching only the path a ticket
names leaves every sibling still broken.

### 24. Grep every caller before and after — L2
A fix that repairs one screen and breaks its sibling is a net loss. This repo has produced exactly
that: a `STAGGER_CAP` import missed in three files, and a partial patch that left `belowFold`
undefined.

### 25. The comments here are load-bearing — L2
They record incidents, measurements and dates. Several exist specifically to stop you making a
change that was already tried and reverted. Read the comment before changing the code it sits on.

### 26. Ship on "verified safe"; never claim "faster" without the numbers — L2
A NativeWind babel change was committed as a performance win before being measured. It was worthless
*and* unsafe, and had to be reverted. Two Atlas fixes were real defects that changed the aggregate by
nothing — and their commit messages say so.

### 27. Correct the record in one sentence and move on — L3
Several claims here have been retracted: that TSLA was a coverage gap (a rate limit mislabelled as a
404), that ASC API access needed Apple review (instant). Say it plainly, do not write three
paragraphs about it.

---

## VII. The web app is the reference

### 28. `euphoriainv.com` is the design reference for iOS — L2
When someone says an iOS surface "feels off", they are usually comparing it against the web product
without realising it. Capture both before deciding what "correct" means.
*(`refs/webapp/WALKTHROUGH.md`)*

### 29. Where they disagree, the web app wins — unless there is a platform reason — L2
Touch targets, safe areas, native navigation idiom, iOS HIG. When you deviate, write the reason
down. An undocumented deviation is indistinguishable from an oversight to the next reader.

### 30. Do not summarise a screen you did not open — L2
This is rule 3 again, and it is here twice on purpose. It is the single most expensive mistake this
project has made.

---

## VIII. Reporting

### 31. Trust the tester — L2
If a human found something confusing, that is the bug, even when the code is technically correct. If
the logic is right but a person misread it, the defect is in the clarity.

### 32. Say what you did NOT do, in the same message — L2
Never let a gap be discovered later. "Low priority" is not a reason to drop something; "this needs a
design decision only you can make" is.

### 33. Do not add another carryover document — L3
There are already six files with CARRYOVER or HANDOFF in the name, and their existence is itself a
problem. Update `refs/NEXT_SESSION.md`.
