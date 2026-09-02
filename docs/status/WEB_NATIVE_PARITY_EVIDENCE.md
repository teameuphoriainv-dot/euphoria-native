# Web / iOS curriculum parity — evidence

**Verdict: the iOS app and euphoriainv.com serve identical curriculum content across all
12 pathways, all 300 lessons, all 5,336 authored steps.**

Verified against the JavaScript bundle production actually serves, not against a git commit
or a local branch — three separate times in this investigation a stale pin, an unpushed local
branch, and a diverged feature branch each produced a false mismatch, so the deployed artifact
is the only trustworthy source.

## 1. Cryptographic content equality — all 12 courses

Each course's full lesson array was canonically serialised (keys sorted recursively, undefined
dropped) and hashed with SHA-256, on both sides, and the digests compared.

| Course | Result |
|---|---|
| investingFundamentals | IDENTICAL |
| personalFinance | IDENTICAL |
| globalEconomics | IDENTICAL |
| corporateFinance | IDENTICAL |
| businessStrategy | IDENTICAL |
| financialAnalytics | IDENTICAL |
| behavioralFinance | IDENTICAL |
| appliedAccounting | IDENTICAL |
| quantitativeAnalysis | IDENTICAL |
| riskManagement | IDENTICAL |
| alternativeInvestments | IDENTICAL |
| wealthManagement | IDENTICAL |

**12/12.** A hash over the canonical form covers every lesson, every step, every field and
every string — this is not a sample.

Web side: the deployed course chunks imported directly in the page
(`import('/assets/<course>-<hash>.js')`) so the data hashed is the data shipped.
Native side: `src/lib/curriculum/courses/<course>.ts`.

## 2. Step counts — raw, per course

| Course | native | web |
|---|---:|---:|
| investingFundamentals | 494 | 494 |
| personalFinance | 492 | 492 |
| globalEconomics | 421 | 421 |
| corporateFinance | 317 | 317 |
| businessStrategy | 396 | 396 |
| financialAnalytics | 370 | 370 |
| behavioralFinance | 445 | 445 |
| appliedAccounting | 470 | 470 |
| quantitativeAnalysis | 500 | 500 |
| riskManagement | 464 | 464 |
| alternativeInvestments | 497 | 497 |
| wealthManagement | 470 | 470 |
| **total** | **5,336** | **5,336** |

Compare RAW to RAW. `loadCourseLessons()` filters 5,336 raw steps down to 4,050 rendered
screens; the web applies the same reduction (lesson 1: 19 raw steps, UI shows `4/17`).
Comparing native's filtered count against web's raw count produces a fake 1,286-step gap.

## 3. Rendered structure — `npm run parity:structure`

The web player does no expansion of its own: `PathwayLessonViewer` renders `lesson.steps`
1:1 and labels progress `${stepIdx + 1}/${lesson.steps.length}`. Native runs `expandSteps()`.
Comparing the two directly:

    lessons compared   300
    screens compared   4050
    step-kind matches  4050/4050

Every screen matches by index AND step kind. Wired into `npm run check`, so a change to
native's expansion fails the build.

## 4. Deployed-bundle content probes — `npm run parity:web`

    lessons checked   300
    titles present    300/300
    content probes    900/900

## 5. Live spot check

Production `euphoriainv.com/app` and the iOS simulator, same lesson, same moment:

    web : 4/17  "Investing is buying a claim on something that earns"
    iOS : 4/17  "Investing is buying a claim on something that earns"

## 6. Empirical browser walk — 14 lessons, 10 of 12 pathways

Beyond the offline proofs, lessons were opened in a real signed-in browser on
`euphoriainv.com` and their rendered step totals read off the UI counter, then compared to
native's expansion. Each open is identity-checked: the lesson actually on screen must be the one
requested, because an unverified walk once reported 17 for a lesson whose true value was 15.

| Lesson | web | native |
|---|---:|---:|
| Introduction to Investing | 17 | 17 |
| Risk vs. Reward | 14 | 14 |
| The Magic of Compound Interest | 14 | 14 |
| Stocks vs. Bonds | 15 | 15 |
| Diversification | 15 | 15 |
| Why Personal Finance Matters | 13 | 13 |
| What Is Corporate Finance? | 9 | 9 |
| What Is Economics? | 14 | 14 |
| What Is Business Strategy? | 15 | 15 |
| What Is Financial Analytics? | 15 | 15 |
| Your Brain vs. Your Money | 15 | 15 |
| The Language of Accounting | 15 | 15 |
| What Is Quantitative Finance? | 15 | 15 |
| What Is Risk? | 14 | 14 |

**14/14 match, across 10 of the 12 pathways.** The remaining two (Alternative Investments,
Wealth Management) are covered by the exhaustive offline proofs in sections 1-3.

Also observed and consistent across both apps: with an empty recall pool the warmup CTA reads
`Start lesson` rather than `Warm up` — the same behaviour that had to be taught to the native
parity driver.

## Reproducing

    npm run parity:structure   # offline, in the check gate
    npm run parity:web         # fetches the deployed bundle

The per-course hash comparison in section 1 is fully automated — `npm run parity:web` resolves
the deployed chunk graph (114 chunks), mirrors the course chunks and their single dependency-free
helpers chunk locally, imports them in Node, and compares canonical SHA-256 digests. No browser
required. It exits non-zero if any course differs, so it can be run in CI.
