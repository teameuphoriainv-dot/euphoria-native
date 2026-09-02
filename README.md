```
 ███████╗██╗   ██╗██████╗ ██╗  ██╗ ██████╗ ██████╗ ██╗ █████╗
 ██╔════╝██║   ██║██╔══██╗██║  ██║██╔═══██╗██╔══██╗██║██╔══██╗
 █████╗  ██║   ██║██████╔╝███████║██║   ██║██████╔╝██║███████║
 ██╔══╝  ██║   ██║██╔═══╝ ██╔══██║██║   ██║██╔══██╗██║██╔══██║
 ███████╗╚██████╔╝██║     ██║  ██║╚██████╔╝██║  ██║██║██║  ██║
 ╚══════╝ ╚═════╝ ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝
```

Euphoria is an iOS app that teaches personal finance and investing to people who have never
done either, built with Expo / React Native (`com.euphoriainv.euphoria`, App Store Connect app
`6761808087`). Instead of copying a brokerage's UI, it borrows the mechanics of a learning app —
a twelve-course, three-hundred-lesson curriculum, a streak and league system, quests, and a
$10,000 paper-trading desk — plus **Atlas**, an SVG mascot who runs onboarding and answers
questions through a server-side Gemini proxy so the API key never ships in the binary. A
companion web app at `euphoriainv.com` serves the identical curriculum, and the two are kept in
provable lockstep (see [Curriculum and parity](#curriculum-and-parity)).

---

## Contents

[Status](#status) · [Architecture](#architecture) · [Curriculum and parity](#curriculum-and-parity)
· [Getting started](#getting-started) · [Quality gates](#quality-gates) ·
[Known open items](#known-open-items)

---

## Status

Every row below was checked against this repository, not carried forward from an earlier draft.

| Claim | How to check | Result |
|---|---|---|
| Native's 300 lessons render the same screen sequence, in the same order, as the web player | `npm run parity:structure` | **PASS** — 300 lessons compared, 4,050 screens compared, 4,050/4,050 step-kind matches. Offline; wired into `npm run check`. |
| Native's curriculum source and the deployed web bundle are byte-identical, course by course | `npm run parity:web` | Documented **PASS** (12/12 courses SHA-256 identical, 5,336 raw authored steps match, 900/900 content probes) in `docs/status/WEB_NATIVE_PARITY_EVIDENCE.md`. Requires a network fetch of the live production bundle, not run as part of this pass. |
| The full regression suite is green | `npm run check` | Chains 57 script/lint invocations (see [Quality gates](#quality-gates)); not re-run for this document, taken as-is from `package.json`. |
| The rule modules described below exist and say what this document claims | direct file read | Verified — see [The rule modules](#the-rule-modules). |
| iOS renders that identical curriculum data correctly | manual simulator QA, logged in `docs/status/IOS_RENDERING_QA.md` | **Not fully clean.** 6 defects fixed, no open crash, 2 open items pending a design decision, several lower-severity gaps. See [Known open items](#known-open-items). |

`parity:structure` and `parity:web` prove the two apps teach the *same content*.
`IOS_RENDERING_QA.md` documents a distinct axis — whether iOS *draws* that content correctly —
and states plainly that both parity checks stayed green through every defect logged there. Content
parity is not rendering correctness; treat them as separate claims.

---

## Architecture

```
src/
  app/            42 files — expo-router file-based routing
    api/          chat+api.ts, market+api.ts, options+api.ts — the only server code in the app
    (tabs)/       home, learn, trade, digest, you — the signed-in shell
    digest/ stock/ settings/ explore/ games/
  components/     78 files (72 at the top level) — Atlas, lesson renderers, sheets, charts, UI
  lib/            113 files (73 at the top level) — store, entitlement, auth, curriculum, analytics
    server/       code that runs inside the API routes (rate limiting, provider calls)
  constants/      theme.ts, lesson-design.ts — spacing/radius/font tokens
  hooks/          use-theme.ts, use-mastery-hints.ts
  shared/motion/  spring-pressable, number-rollup, reward-pop, sheet-entrance, step-transition
scripts/          193 files (145 at the top level) — regressions, pins, parity checks, simulator
                  drivers, curriculum/digest sync, release tooling (anim/, parity/, rive/ subdirs)
targets/widget/   the iOS widget — Info.plist, expo-target.config.js, index.swift
docs/status/      the living status record this README's claims are drawn from
refs/             submission history, shipping notes, planning documents
goldie/           App Store screenshot capture configuration
```

Everything except the three `+api.ts` routes runs on-device: local curriculum data, Zustand state
persisted to `AsyncStorage`, and direct SDK calls to Supabase (auth), RevenueCat (billing), and
PostHog (analytics, funnel-only). The API routes exist for one reason — provider keys that would
otherwise ship inside the IPA and be extractable. They run as Expo Router API routes on **EAS
Hosting**, i.e. Cloudflare Workers; `web.output` must stay `"server"` in `app.json`, because
`"static"` drops the API routes entirely with no error.

**Identifiers.** Bundle id `com.euphoriainv.euphoria` on iOS; App Group
`group.com.euphoriainv.euphoria`, which must agree across `app.json`, `src/lib/widget.ts` and
`targets/widget/index.swift` or the widget silently reads nothing. `android.package` is the
distinct `com.euphoria.native` — a separate, unaudited Play listing. EAS project
`@s-k-28/euphoria-native`; Apple team `9SS423KXF5`; App Store Connect app `6761808087`.

**Stack**, read from `package.json` / `app.json`: Expo SDK `~57.0.18`, React Native `0.86.3`,
React `19.2.3`, TypeScript `~6.0.3` (strict), `expo-router` file-based routing, `zustand` for
state, `react-native-reanimated` for motion, `react-native-purchases` (RevenueCat) for billing,
`posthog-react-native` for analytics, `react-native-svg` for Atlas, and `gemini-3.5-flash` (pinned
in `src/app/api/chat+api.ts`, not the `-latest` alias) behind the chat API route.

### The rule modules

Six single-purpose files in `src/lib/`, each holding one rule that used to be duplicated:

| File | The rule |
|---|---|
| `lib/cost-basis.ts` | average cost through buys, sells and grants |
| `lib/portfolio-value.ts` | cash + shares at mark + contracts at cost |
| `lib/billing-retry.ts` | `ENTITLEMENT_ID = 'Euphoria Pro'` and a 16-day billing-retry grace window |
| `lib/day-keys.ts` | local day keys, Monday weeks, the streak rule |
| `lib/trial-reward.ts` | when a discounted-offer trial reward may fire |
| `lib/dismissal-offer.ts` | when a dismissal offer may fire |

Other modules worth knowing before editing: `lib/entitlement.ts` is the single authority on
trial/expired/pro state (`tier()` orders pro first, so a payer never sees a countdown);
`lib/store.ts` is 1,377 lines, and anything added to its state must also be added to `partialize`
or it will not survive a restart (the file says so in its own header comment); `lib/purchases.ts`
is the only writer of `isPro`, and only from a successful `customerInfo` read, so a network failure
can never revoke a paying member; `lib/people.ts` opens with an explicit comment that every person
in the file is fabricated; `lib/server/limit.ts` is an in-memory rate limiter that is per-isolate
on Cloudflare Workers, and its own comments say it is weak against a distributed client.

---

## Curriculum and parity

Twelve courses of twenty-five lessons each make up the curriculum: investing fundamentals,
personal finance, global economics, corporate finance, business strategy, financial analytics,
behavioural finance, applied accounting, quantitative analysis, risk management, alternative
investments, wealth management. That curriculum also ships on a separate web app at
`euphoriainv.com`, and the two must teach identical content.

| Quantity | Count | Source |
|---|---:|---|
| Courses × lessons | 12 × 25 = **300 lessons** | `docs/status/WEB_NATIVE_PARITY_EVIDENCE.md` |
| Authored steps (raw, before UI expansion) | **5,336** | same, section 2, matched native vs. web per course |
| Rendered lesson screens | **4,050** | `npm run parity:structure` output, this session |
| Mastery-challenge screens | **1,770** | `docs/status/LESSONS_PARITY_VISUAL_TASKLIST.md`; `scripts/mastery-challenge-parity-regression.mjs` |
| Total happy-path screens | **5,820** (4,050 + 1,770) | derived |

Parity between native and web is enforced two ways:

- **`npm run parity:structure`** — offline. Runs `expandSteps()` on native's curriculum, compares
  the result 1:1 against how the web `PathwayLessonViewer` renders `lesson.steps`, and checks
  every screen matches by index *and* step kind across all 300 lessons. This is part of
  `npm run check`, so a change to native's expansion logic fails the build.
- **`npm run parity:web`** — resolves the web app's actual deployed chunk graph, imports the
  course chunks in Node, canonically serialises each course (keys sorted, `undefined` dropped),
  SHA-256-hashes both sides, and compares. It checks the artifact production actually serves, not
  a git ref — the evidence doc notes that a stale pin, an unpushed branch, and a diverged branch
  each produced a false mismatch before this method was adopted.

Full detail, including a 14-lesson manual browser walk across 10 of the 12 pathways, is in
`docs/status/WEB_NATIVE_PARITY_EVIDENCE.md`.

**What this does not prove.** Both parity checks compare *data* — lesson content and screen
order — not *rendering*. `docs/status/IOS_RENDERING_QA.md` exists because both checks stayed green
through several rendering defects, including one that scored correct answers as wrong on iOS only.
See [Known open items](#known-open-items).

---

## Getting started

Commands below are copied from `package.json`.

```bash
npm install

npm start               # expo start
npm run ios             # expo run:ios
npm run android         # expo run:android
npm run web              # expo start --web

npm run lint             # expo lint
npm run check            # full regression + lint gate — see Quality gates
```

Curriculum sync (native pulls from a pinned web-repo ref):

```bash
npm run curriculum:sync    # ./scripts/sync-curriculum.sh --ref <pinned-sha>
npm run curriculum:check   # sync --check, then semantic parity, render audit, experience parity
```

Screenshots and release:

```bash
npm run screenshots:store   # goldie capture, frame, verify — App Store screenshot set
npm run screenshots:studio  # goldie studio
npm run ota                  # eas update --branch production --environment production
```

No environment-variable list is asserted here — read `.env.example` directly for the current set,
since restating it in prose is exactly the kind of claim that goes stale.

---

## Quality gates

`npm run check` is a single script that chains **57** node/npx/python3 invocations — regression
scripts, pinned-value checks, and `npx eslint src scripts --max-warnings 45` — read verbatim from
`package.json`. It includes, among others: `web-native-structure-parity.mjs` (curriculum
structure), `lesson-render-audit.mjs` and `lesson-experience-parity.mjs`, `cost-basis-regression.mjs`,
`portfolio-snapshot-regression.mjs`, `billing-retry-regression.mjs`, `entitlement-regression.mjs`,
`day-keys-regression.mjs`, `reduced_motion_audit.py`, `motion-invariants.mjs`,
`privacy-manifest-pin.mjs`, and `api-validation-regression.mjs`. A separate `npm run precheck`
chains **26** more scripts (password safety, course availability, onboarding-replay migration,
lesson interaction/design/warmup parity, drag-sort and decision-tree parity, and others) that are
not part of `check` itself.

What each named command proves:

| Command | Proves |
|---|---|
| `npm run check` | Every regression, pin and lint rule in the repo currently passes — the gate a change must clear before landing. |
| `npm run parity:structure` | Native's rendered lesson screens match the web player's, index-for-index and kind-for-kind, offline. |
| `npm run parity:web` | Native's curriculum source is byte-identical to what production actually serves, via SHA-256 over the deployed bundle. |
| `npm run test:mastery-challenge` | The 1,770 mastery-challenge screens match their web counterpart. |
| `npm run curriculum:check` | The curriculum sync from the web repo is current and semantically unchanged where it should be. |

Neither `npm run check` nor `npm run parity:web` was re-run to produce this document — `check`
because it is a 57-step suite and `parity:web` because it fetches the live production bundle over
the network; both are described from `package.json` and from `docs/status/WEB_NATIVE_PARITY_EVIDENCE.md`,
which documents them passing. `npm run parity:structure` **was** run directly for this document
and reproduced the PASS result in the table above.

---

## Known open items

Sourced from `docs/status/IOS_RENDERING_QA.md`, which is the log of defects the parity checks
above cannot catch, because parity compares data and these are rendering/behaviour defects. Six
prior defects are already fixed: a mislabelled stakes card, a contrast failure on the primary
button, a missing VoiceOver reveal-state label, a Digest exit that threw `GO_BACK was not
handled`, a crash that duplicate React keys caused on every `MatchingPairs` render, and a
behavioural divergence where matching exercises scored correct answers wrong on iOS only.
What remains open:

| Item | Severity | State |
|---|---|---|
| Vocabulary conversation leaves roughly 60% of the screen empty | Open — needs a decision, not a fix | Confirmed on `applied-accounting--01`, step 6/15, in a settled (non-animating) state. Not touched yet because the layout may be intentional parity with how the web app renders the same conversation; that comparison has not been done. |
| CTA placement is inconsistent between step types | Open — needs a decision | The conversation step's advance button sits at y≈321; other step types place it at y≈694–746, a ~370pt jump within one lesson. Same open question as above: fix iOS alone, or match web's actual behaviour first. |
| Type ramp has 20 steps against a 12-step healthy ceiling | Lower severity, unfixed | — |
| 6 number formats are not locale-pinned | Lower severity, unfixed | Same value can render differently per device. |
| 3 screens have no empty state; 1 has error handling but no retry | Lower severity, unfixed | — |
| Inline term-popover accessibility labels never reach VoiceOver | Lower severity, unfixed | `accessibilityLabel` is set on a nested `<Text>`; iOS surfaces a nested text link by its text content and discards the child's label. Authored 432 times. |

Reduced-motion is the one dimension logged as clean: 0 unguarded vestibular defects, 46 of 59
animated files explicitly guarded, and the remaining 13 correctly exempt (opacity cross-fades and
touch-bound press feedback).
