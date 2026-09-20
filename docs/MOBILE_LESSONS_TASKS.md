# Mobile lesson rebuild — task list

Started 2026-09-14. Goal: the iOS app teaches a **simpler, shorter, more visual** version of every
lesson than the web app does. Web is untouched.

## Decisions locked with Sriyan
1. **Word count cut ~92%.** Each heavy step becomes 3-4 cards, roughly one short sentence each
   (~55 chars of body per card, ~220 chars per step, down from a 2,557-char median).
2. **The interactive graphs are removed on mobile.** They are replaced by new interactive pieces
   authored for a phone. Simple, thumb-first, nice to look at, not ports of desktop charts.
3. **New pixel art kit.** Higher quality than the existing sprites, animated, Euphoria/Atlas style,
   built as reusable archetypes that re-skin per lesson. The art itself is interactive and is sized
   to fit the screen.
4. **Derive + author overrides.** A deterministic engine covers all 300 lessons immediately; an
   override table lets any individual card be hand-written later.

## Measured baseline (real corpus, not estimates)
- 12 courses, 300 lessons, 4,050 steps, 20 step types.
- `interactiveGraph` 289 steps, median 2,557 chars, **0 have chartData**, 282 have sliders.
  graphType: comparison 199, timeline 38, exponential 20, pie 10, bar 7, other 15.
- `teachingSlide` 432 steps, median 1,636 chars, 427 carry a diagram.
  diagram type: flow 143, comparison 112, grid 109, bars 26, stack 15, line 10, metric 8, other 4.
- The other 18 step types carry ~0 prose and are already fine on a phone.
- **721 of 4,050 steps (17.8%) hold essentially all the desktop text.**
- Existing pixel library: 84 core sprites + 7 lesson sprites, only 7 animated.

## Hard constraints
- `src/lib/curriculum/**` is stamped AUTO-SYNCED FROM THE WEB REPO. `scripts/sync-curriculum.sh`
  overwrites it. **The mobile layer must live outside those files** or the next sync deletes it.
- `scripts/web-native-structure-parity.mjs` currently asserts native shows the same screens in the
  same order as web. That is now false on purpose and the guard must be rewritten, not deleted.
- `expandSteps()` in `src/lib/lesson-steps.ts:685` is the existing seam. It already emits synthetic
  step types for native. The mobile expansion belongs there.

---

## Phase A — Foundation: the mobile/web separation system
- [x] A1. `stepId.ts` — stable step identity that survives a corpus re-sync (course + lesson num +
      step index + content hash). Everything else keys off this.
- [x] A2. `types.ts` — the `MobileCard` union and card kinds.
- [x] A3. `policy.ts` — which step types mobile overrides, which pass through untouched, and the
      ordering rules. This is the structuring system.
- [x] A4. `compress.ts` — the ~92% text reduction. Deterministic rules, no invented claims.
- [x] A5. `overrides.ts` — `MOBILE_COPY` keyed by stepId, beats the derived output.
- [x] A6. `vocab.ts` — shorten `highlightedTerms` to one plain line each.

## Phase B — New pixel art kit
- [x] B1. 24 new sprites, ALL animated, 103 frames total, all 16x16, all resolving. Verified by
      importing the kit and calling composeScene on every archetype. `rulebook` got its own art
      rather than staying aliased to threshold, which matters because it is 89 scenes.
- [x] B2. 2,304 accent/overlay variants compile from 24 sprites.
      ORIGINAL: B2. Accent-swap + overlay variant system so one archetype serves many lessons.
- [x] B3. `PixelScene` component: interactive (responds to touch), fits the screen, animated.
- [x] B4. Atlas reaction poses. FOLDED INTO PHASE J below, which is the bigger Atlas pass.
- [x] B5. Sprite regression: every sprite compiles, is 16x16, is centred, never outlined with K.

## Phase C — New mobile interactives, replacing the 289 graphs
- [x] C1. `comparison` replacement (199 steps).
- [x] C2. `timeline` replacement (38 steps).
- [x] C3. `exponential` / compounding replacement (20 steps).
- [x] C4. `pie` (10 steps): NOT built, and deliberately. `chartData` is empty on all 289 graph
      steps, so there are no slice magnitudes anywhere in the data. These get the insight stepper.
- [x] C5. `bar` (7 steps): same, for the same reason. The `weigh`/`split`/`rank` types were removed
      from the union rather than left declared and unreachable.
- [x] C6. Fallback for the remaining 15 (distribution, line, multiline, heatmap, financialChart, funnel).
- [x] C7. Registry mapping `graphType` to the interactive that replaces it.

## Phase D — The clickthrough renderer
- [x] D1. `CardDeck` component: progress dots, advance, back, completion.
- [x] D2. One component per card kind.
- [x] D3. Motion, and honour reduced-motion (existing motion pins must stay green).
- [x] D4. Wire into `expandSteps()` and `lesson.tsx`.

## Phase E — Apply to all 300 lessons
- [x] E1. Derive cards for all 432 `teachingSlide` steps.
- [x] E2. Derive cards for all 289 `interactiveGraph` steps.
- [x] E3. Coverage audit: all 721 steps produce valid non-empty cards. No blank screens.
- [x] E4. Word-count pin: assert the ~92% cut actually holds corpus-wide.

## Phase F — Find and fix every reference to the old system
- [x] F1. Retire the `InteractiveGraph` render path on mobile; find all its references.
- [x] F2. Rewrite `web-native-structure-parity.mjs` to pin the derivation instead of identity.
- [x] F3. All four still pass untouched, because they read the raw `courseIndex`. The two that now
      guard a path the app no longer takes carry a header saying so, rather than being deleted.
- [x] F4. `step-mode-transition`, `lesson-preview-coverage`, `atlas-lesson-parity` all pass. Only
      `raw-svg-parity` and `web-native-structure-parity` needed real changes.
- [x] F5. Make sure `sync-curriculum.sh` cannot clobber the mobile layer.

## Phase G — Lesson continuation (requested 2026-09-14)
- [x] G1. Six real bugs found. The worst: passing the mastery challenge then tapping Back could
      re-enter the challenge and eject you with no XP, no streak and no reward. Also: the
      out-of-hearts wall re-fired on every question ever answered wrong; there was NO persisted
      lesson position at all (a force quit sent you to step one while Home said "Continue");
      `openLessonScreen` took its index unclamped, which is the blank-screen shape Apple rejected
      build 1.0.0(6) over; runner state was keyed to the mount, not the lesson; a replayed lesson
      stranded its resume pointer.
- [x] G2. All six fixed, with two new regression scripts, both green with and without --selftest.

## Phase H — Atlas app tour (requested 2026-09-14)
- [x] H1. Five beats: home, learn, trade, games, then the next-lesson card. Every route verified to
      exist and every claim checked against the real screen. No league/friends/leaderboard claims,
      enforced by a grep in the regression, because every person in the app is fabricated.
- [x] H2. Persisted as `atlasTour: 'unseen' | 'armed' | 'seen'`, three states rather than a boolean
      so the live app's EXISTING users do not get shown a new-user tour on update. Skip == finish.

## Phase I — Verification, before anything is called done
- [x] I1. `npx tsc --noEmit` clean.
- [x] I2. `npm run check` clean (eslint budget is `--max-warnings 45`, currently 43 pre-existing).
- [x] I3. Every regression script green.
- [x] I4. PARTIAL and stated honestly. `npx expo export --platform ios` BUNDLES CLEAN, which proves
      Metro resolves and compiles every new module (tsc does not prove that). Deck content was read
      as text for real lessons, which found and fixed three defects. NOT done: the app is not
      installed on the booted simulator and `idb_companion` is missing, so no on-device screen read
      has happened. A human should open a lesson and look at it.

## Phase J — Atlas animation and UX pass (requested 2026-09-14)
- [x] J1. 44 render sites across 30 files. Atlas already had 9 expressions with brows, blink,
      saccades, breath/sway/head-rock on coprime periods, a four-beat celebrate with follow-through,
      nod, two entrances and a tap spin. This surface was in far better shape than "add animations"
      implied. THE FINDING: `shake`, the wrong-answer reaction, was fully built, measured against a
      reference, documented, and had ZERO call sites. Four wrong-answer surfaces met the learner
      with a motionless mascot.
- [x] J2. `shake` wired through `atlas-correction.tsx`, the one component all four wrong-answer
      surfaces already share, so no surface needed a new prop. `shakeKey` added for the same latch
      bug the file had already fixed twice for celebrate and nod. Expression changed `whoa` to
      `oops` so the app stops wearing two faces for one event (JUDGEMENT CALL, easy to revert).
- [x] J3. Motion quality using the existing spring tokens, not new ones.
- [x] J4. Reduced-motion path for every new animation; motion-invariants and reduced_motion_audit
      must stay green.
- [x] J5. Typewriter is now skippable in the shared AtlasSpeech (atlas-conversation had solved this
      privately; the shared one had not, so a 110-char line held a live control for 2.9s).
- [x] J6. Frozen full-size mascots, flagged by the agent as outside its boundary and fixed by me:
      `mastery-challenge-intro` at size 150 and the lesson completion Atlas at 92 now idle. The four
      72pt sheets were LEFT ALONE deliberately: atlas.tsx's own note says idle reads correctly from
      ~96px up and below that is sub-pixel, so adding it there burns a frame callback to draw
      nothing.
- [x] J7. New guard `scripts/atlas-reaction-wired-pin.mjs`: every reaction Atlas implements must
      have a caller outside atlas.tsx. Nothing in the toolchain could see the dead shake, because
      tsc is happy with an unused optional prop, eslint has no opinion, and a still mascot looks
      normal in a screenshot.

## Phase K — ASO (requested 2026-09-14)
- [ ] K1. Report the measured live state of 1.0 and staged 1.0.1 from the ASC API. Facts, not plans.
- [ ] K2. The false "weekly league against other learners" claim. Description is locked on a live
      version, so check promotional text too. Guideline 2.3.7 exposure.
- [ ] K3. A script that fails the build when a keyword names something the corpus does not teach.
      This is the rule that keeps biting (es-MX, isa/tfsa/super/asx all had to be killed).
- [ ] K4. Fix the fields, every one inside its character limit (Apple truncates silently).
- [ ] K5. NOTHING is submitted to Apple without Sriyan saying yes.
