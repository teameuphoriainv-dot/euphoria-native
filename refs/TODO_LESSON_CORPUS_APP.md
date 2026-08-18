# TODO — new mobile app consuming the web lesson corpus

Captured 2026-08-17 from the owner's brief. **Not started.** Recorded here so it survives the
session, with what I verified against the actual repos underneath each claim.

---

## The brief, as given

Build a new mobile app that renders the Euphoria lesson corpus living in the web repo
**without forking it**. The May 2026 app forked every course file, drifted until 0 of 12 matched,
and shipped a bug where every wrong answer carried boilerplate padding — making assessments
passable with no finance knowledge. The corpus gets exactly one home; the app is a consumer.

**Corpus:** 12 courses x 25 lessons = 300 lessons · 5,331 steps · 1,319 visuals · ~71,000 lines.
`src/features/pathway/courses/*.ts` (camelCase filenames, kebab-case course ids).

**A lesson** is `{ num, title, xp, steps: LessonStep[], challenge: ChallengeQuestion[] }`.
`LessonStep` is a discriminated union on `type`. **All 25 step types must be handled — a missing
case is a blank screen mid-lesson in a paid app.** By frequency:

```
quiz 441 · teachingSlide 432 · microCheck 312 · hookOpener 300 · summaryCards 300
stakesCard 299 · whatsNext 294 · interactiveGraph 289 · fillBlank 280 · scenario 272
trueFalse 272 · match 266 · tapReveal 247 · simulationFinale 241 · dragSort 230
slider 198 · caseStudy 195 · misconceptions 194 · keyTermsCards 185
progressiveCalc 44 · buildIt 29 · explorable 4 · calculator 4 · concept 2 · decisionTree 1
```

**The single biggest trap — `AnimatedVisual`.** Four step types carry a typed `AnimatedVisual`
(`visual`, `diagramVisual`, `withVisual`, `withoutVisual`) — 1,319 across 10 kinds: flow,
comparison, metric, grid, bars, line, stack, pie, pixel, pictograph. The web renderer drew
`diagramSvg` strings **only when `!isNative`**, so on device it fell through to a hardcoded
`switch (lessonNum)` and modern lesson visuals did not render. *If one thing survives from this
brief: implement `AnimatedVisual` and prove it renders on native.*

### Copy verbatim from the web repo (do not rewrite)

| File | Lines | Why |
|---|---|---|
| `features/pathway/types.ts` | — | The contract. Copy types; **add** app-specific ones, never overwrite |
| `features/pathway/helpers.ts` | — | Course files import these factories by name. Signatures must match exactly |
| `features/pathway/courseIndex.ts` | 62 | `COURSES` metadata + `loadCourseLessons(courseId)` |
| `components/AnimatedVisuals.tsx` | 493 | The 1,319 visuals. Non-negotiable |
| `components/StepRenderer.tsx` | 984 | The 25-type switch |
| `components/TemplateStepRenderers.tsx` | 1,898 | The heavier step types |
| `components/PathwayLessonViewer.tsx` | 433 | Step sequencing, progress, checkpointing |
| `components/interactives/` | 1,384 | dragSort, sorting, matching, calculator, decisionTree, scenarioSim |
| `lib/pixel/` | 1,532 | Needed by `pixel` and `pictograph` visuals |
| `components/explorables/` | 3,127 | Optional, needs `@visx` — see below |

**Deps the render layer needs:** `framer-motion`, `lucide-react`, `dompurify`. Plus
`@visx/curve|gradient|group|scale|shape` only if the explorables are taken.

### The explorables decision
`explorable` steps are live drag-to-learn widgets — the thing that makes us look like Brilliant
rather than a quiz app. Only 4 exist, **but one is `investing-fundamentals` L1, the first lesson
every new user opens.** Either port them and add `@visx`, or render a static fallback with the
insight and its own check MCQ (there is a working `ExplorableFallbackView` in the current mobile
repo to lift). Owner prefers the real thing.

### Integration contract
- **Loading:** `loadCourseLessons(courseId)` → dynamic `import('./courses/x')`. Each compiles to a
  local chunk bundled into the binary. **Keep it that way** — it is what makes lessons work
  offline and keeps App Store review happy about no downloaded executable code.
- **Progress:** `localStorage` key `euphoria_lesson_progress_${courseId}_${lessonNumber}`,
  value `{ stepIdx, correctSteps }`. Seedable to jump to any step for testing.
- **Completion:** every step view calls its completion callback exactly once.

### Verification (do not skip)
Two scripts exist in the current mobile repo:
```
scripts/check-visual-render.tsx   — every visual type, asserts real markup
scripts/check-corpus-loads.tsx    — loads all 12 courses, renders every visual, fails on any blank
```
Passing looks like:
```
courses 12   lessons 300   steps 5331
visuals 1319: 1319 drew markup, 0 blank
```
Then open lessons on a **real iPhone**. The scripts prove data flows; they do not prove
Capacitor's WebView behaves.

### Gotchas that cost real time
1. **Widen the helper signatures, not just the interfaces.** Fixing types alone still left 820
   errors: `hookOpener`/`teachingSlide` took a string, `stakesCard`'s opts lacked typed visuals,
   `pc` only accepted quiz-shaped calc steps, `interactiveGraph` had a narrow `graphType` union
   with no chart preset.
2. **Never copy `types.ts` wholesale** into an app that has its own step types — doing so wiped
   seven of them. Additive by hand, always.
3. **A clean exit code is not evidence.** A job exited 0 having done nothing — once a swallowed
   error, once a usage error. Read the output, not the status.
4. **`graphType` is deliberately open.** Resolve unknown values with fallbacks.

### Syncing later
From the web repo: `npx tsx scripts/<sync>` preflight (refuses to copy if any step type lacks an
interface or renderer case), then `--write`. Point its IOS constant at the new repo.
**Re-run it rather than editing course files in the app — edits get overwritten.**

---

## What I verified against the actual repos — three things change the premise

**1. `euphoria-native` IS the fork described, and it already has the sync mechanism.**
12 course files, **71,393 lines** — matching the brief's ~71,000. Every file carries:
```
// AUTO-SYNCED FROM THE WEB REPO — DO NOT EDIT THIS FILE.
// Source of truth: euphoriaweb-current/src/features/pathway/
// Re-sync with:    ./scripts/sync-curriculum.sh
```
`scripts/sync-curriculum.sh` exists (15.1K). So "don't fork it" is already partly solved here —
the question for a NEW app is whether to reuse this pipeline or rebuild it.

**2. 0 of 12 files are byte-identical to the web repo — the brief is right — but the cause is
mostly the injected sync header,** not silent content drift. Worth confirming per-file before
treating divergence as the reason to start over.

**3. THE EXAM-INTEGRITY BUG IS STILL LIVE IN THE SOURCE OF TRUTH.** ⚠️
The brief cites boilerplate-padded wrong answers as the reason not to fork. Counting eight
distinct padding phrases across both repos:

```
WEB  (source of truth) : 287 padded distractors across 12 files
NATIVE (fixed Aug 14)  : 287 padded distractors across 12 files
worst: alternativeInvestments 45 · appliedAccounting 37 · wealthManagement 31 · financialAnalytics 30
```

Commit `506e02f` (Aug 14) stripped 2,322 clauses, but **287 of this shape remain, and web and
native carry the identical count.** The shape is:

> `['1-2x salary', '5x salary, as documented in several well-known investment research papers and
> widely discussed among certified financial planning professionals', '10-12x salary', ...]`

The correct answer is short and clean; distractors carry waffle. **A user can pass by picking the
option that is not padded, with zero finance knowledge.**

**Consequence: a new app built on the current web corpus inherits this bug.** It has to be fixed
in `euphoriaweb-current` first, or the rebuild ships the exact defect it was meant to escape.
Fixing it in the app copy again would just be re-forking.

---

## Suggested order

1. **Fix the 287 padded distractors in the web repo** (source of truth) — otherwise everything
   downstream inherits them. Not a rebuild; a content fix.
2. Decide: extend `scripts/sync-curriculum.sh` for the new app, or rebuild the pipeline.
3. Port `AnimatedVisual` **first** and prove it renders on native — it is the stated biggest trap
   and gates 1,319 visuals.
4. Then the 25-type `StepRenderer` switch, with a test that fails on any unhandled type.
5. Explorables last: 4 steps, but one is the first lesson every user opens.

**Not started. No files written for this beyond this document.**
