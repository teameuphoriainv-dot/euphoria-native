# Euphoria — carryover

Expo SDK 57 · RN 0.86 · Reanimated 4.5.0 · expo-router · finance education · mascot "Atlas".

---

## READ THIS FIRST — how to judge your own work here

**Do not optimise for cost. Optimise for verified quality.**

The previous session cost a lot and the user said, repeatedly and explicitly, to ignore that and
prioritise quality. Do not raise cost, do not apologise for it, do not let a cost warning change
what you do. Cost warnings in this repo are informational noise; the user has said so more than
once. If you catch yourself trimming a verification step to save money, you have the wrong
objective — the expensive thing here is a wrong answer shipped confidently, not a tool call.

**What "quality" means concretely, in this repo:**

1. Every change carries a **measured before → after number** from a named script.
2. Every design decision cites **ScreensDesign evidence with a counted hit rate** (4/4, 3/6).
3. Anything you cannot verify gets marked **UNVERIFIED** and stays that way.
4. If a number does not move, you **revert** — you do not keep the change and rename the goal.
5. You never fix a thing by making a *different* thing worse and calling it done.

The single most valuable habit from the last session was **reaching for the real artifact instead
of a cheap proxy.** Every serious mistake came from a proxy:

| proxy used | what it cost |
|---|---|
| a flow *description* instead of the screen | built a paywall split, shipped it, reverted it |
| a gap in *pagination* read as absence | reverted that split again — it had been correct |
| an a11y *anchor* read as a bounding box | reported 35pt of clearance that did not exist; card was clipped |
| a colour *threshold* over a gradient | "starfield renders: 98.2%" — it measured the background |
| a raw *count* of fontSize overrides | 32 "defects"; the real number was 1 |

Read the screen. Pull the neighbours. Crop the band. Compute the ratio. Then speak.

---

## STANDING RULE — ScreensDesign MCP is mandatory

Already recorded in `AGENTS.md` (imported by `CLAUDE.md`, so it loads automatically). Summary:

Use it for **every** design audit, question and change. And use it *properly*:

1. **Read the SCREEN, never only the flow/app description.** `screen_detail` with
   `include_image: true`.
2. **Use `neighbor_count`.** The screen before or after usually carries the mechanism. Bend's
   dismissal offer is preceded by a gift-box modal that the offer screen alone never reveals.
3. **Never infer absence from a paginated pull.** An `app_screens` offset returned positions
   12, 14, 15, 18 — position 13 existed and was simply not on that page. That misreading caused
   a revert of correct work.
4. **Count convergence across ≥4 apps** and report the hit rate. A 1/4 pattern is not evidence;
   exclude it and say so.
5. **State transferability.** Most of the dataset is not finance education. Say which *mechanism*
   transfers and why.
6. **`search_screens` is BROKEN** — pydantic `extra_forbidden` on `app_id`. The error payload
   leaks the matched app ids; feed those to `app_screens`, or route via `search_apps` +
   `detected_patterns` (`HasTrialTimeline`, `SpecialOfferPaywall`, …).
7. **A pattern that cannot differentiate is decoration.** Node-type icons are 4/6 in the
   references and were still removed here, because every lesson in this curriculum is the same
   kind and the badge rendered an identical glyph on every node.

---

## STATE — all pushed to `main`

`git status` clean. Latest: `81cda65`.

⚠️ **`gh` reverts to `s-k-28`, which cannot see the private repo.** Before any push:
`gh auth switch --user teameuphoriainv-dot`. Shell needs `CLAUDE_CONFIG_DIR=~/.claude-account2`.

### Shipped and measured last session

| commit | change | measurement |
|---|---|---|
| `93875d0` | de-violet wired (was dead code, 0 callers) | content violet **37.4% → 5.1%** |
| `d53e271` | onboarding commit-on-tap | **7 taps removed** |
| `5302a36` | ref-during-render (self-inflicted) | lint 9 → 8 |
| `ac8608e` | lesson option icons + a11y | contrast 9.72 / 7.86 / 4.40 vs 3:1 |
| `400f32d` | number-line lineHeight | ratio **1.18 → 1.24** |
| `94d1664` | chart legend contrast | **4.48 → 8.26:1**, device-confirmed `#BE94E9` |
| `b7a239f` | ambient-background seeded PRNG | lint 8 → 4, starfield now stable across resizes |
| `deb3723` `6f1458b` | 16 lint issues across 6 routes | criterion 2 **16/18 → 18/18** |
| `86d38ff` | Home density | decorative art **36% → 29%** of viewport |
| `4d85b7e` | Home course rail + compact hero | rail y=801 → **701**, 118pt clear of tab bar |
| `bda99b8` | Home header row + brand CTA | chips y=92/127 stacked → both **y=102** |
| `5ef9b7a` | Learn pitch + informative header | node pitch **128 → 100**, lessons visible 4 → 5 |
| `81cda65` | Learn milestone markers | amber badge every 5th node, verified on device |
| `cf592c3` | `scripts/certify.py` | 18/18 routes pass, exits 1 on regression |

### Certification status

| criterion | state |
|---|---|
| 1 — `tsc --noEmit` | PASS repo-wide |
| 2 — lint per route | **18/18** |
| 3a — anchors per screen | **18/18** (0 lineHeight, 0 contrast, 0 touch) |
| 4 — unlabelled interactive elements | **0 across 20 routes** |
| 5 — commit touches `src/` | all |

Re-run the static half any time: `python3 scripts/certify.py` (exits 1 on any defect).
It covers ONLY the static half and says so — criterion 4 still needs `sim.sh screen`,
3b still needs a device measurement per fix.

---

## THE NEXT TASK — Atlas as a working chatbot

Nothing exists. Verified, not assumed:

- `src/components/atlas-speech.tsx` types out **scripted strings** — a presentation component
- **zero `fetch(` calls anywhere in `src/lib`** — there is no network layer at all
- no `.env`, no provider SDK, no API key handling

### The decision that determines the whole build

**The API key must never be in the app bundle.** It is extractable from the IPA and anyone can
bill the account. So this needs a server proxy. On Expo SDK 57 the natural fit is an
**EAS Hosting API route** (`app/api/chat+api.ts`) with the key stored as an EAS secret; the
client calls your own endpoint, never the provider.

That one choice determines: the client shape, how streaming works, where rate limiting lives,
and where the cost ceiling is enforced. Settle it before writing anything.

Read `https://docs.expo.dev/versions/v57.0.0/` before writing code — `AGENTS.md` says so and
Expo has changed.

Build order that keeps every step verifiable:
1. API route that proxies one non-streaming completion. Verify with `curl`.
2. Add streaming. Verify tokens arrive incrementally, not in one blob.
3. Rate limit + per-session cap. Verify by exceeding it.
4. Chat UI. Verify on device with the a11y tree — every message and the input must be labelled.
5. Wire Atlas's expressions to chat state (`thinking` while streaming, `happy` on completion).

Use ScreensDesign for the chat UI. `search_apps` with `smart_search` for AI-tutor apps —
Praktika (1816), Astra AI (2190) and Promova (936) all ship AI conversation features.

---

## OTHER OPEN WORK, ranked

1. **The paywall gates nothing.** No `isPro`, `isSubscribed`, `isPremium` or entitlement check
   anywhere in the store or lesson flow. The subscription sells access to content that is already
   free. This sits underneath the entire monetisation workstream and is the most valuable
   unanswered question in the product. **Do not build a dismissal offer until it is answered** —
   a "free lesson" gift is meaningless when every lesson is free.
2. **`#F97316` is hardcoded in 22 files** with no token. It is the streak orange. Pure
   consolidation, zero visual change — deliberately skipped because no measurement moves.
3. **Learn density beyond 5 nodes** would need smaller nodes with inline titles (Promova shows
   ~14 that way). That is a different screen, not a spacing change.
4. **`SCREEN_REDESIGN.md` §3.5–3.8** — specs exist in `refs/SCREEN_SPEC_*.md` for streak, lesson
   intro, lesson step and profile. None are implemented.
5. **`COMPETITIVE_ANALYSIS.md` §6** revenue gaps still open. Zogo / Stash / Greenlight / NGPF are
   NOT in ScreensDesign — use `search_store_screens` for their App Store creative instead.

---

## HARD-WON TRAPS — each produced a false number or a wasted arc

1. **`simctl recordVideo` is variable frame rate.** Always `ffmpeg -vf fps=30` before measuring
   motion. Raw gave 41.1%; CFR truth was 39.5%.
2. **Never track an element across an opacity ramp.** A fixed colour threshold loses faint pixels
   and drags the detected edge. Gave 169px; truth was 6px.
3. **`idb ui swipe` without `--duration` is a tap, not a scroll.**
4. **zsh does not word-split unquoted variables.** Use `read -r A X Y <<< "$R"`. Also quote
   `--include="*.tsx"` or ugrep/zsh will mangle it.
5. **`git commit -m` with multi-line quoted text breaks.** Use `-F -` with a heredoc.
6. **A JSX comment inside a ternary creates a second child and breaks the build.** Made this
   mistake twice. Put rationale in a `//` comment above the `return`, never inside `{cond ? ( … )}`.
7. **`sim.sh open "onboarding?step=N"` only works from a COLD route.** `startStep` feeds
   `useStepTransition` as an initial value; deep-linking to a route you are already on does not
   remount it. Navigate by tapping instead.
8. **Persisted store state blocks first-run verification.** `completedLessons` already contains
   `behavioral-finance:1`. A baseline is preserved at `refs/BASELINE_STORE.json`
   (xp 30 · streak 1 · minutesToday 5) — capture again before any wipe.
9. **Do not test the digest tint on the Credit category.** `#EC4899` pink is *pre-existing art*
   there, so the test passes for the wrong reason. Use **Markets → cyan (H188)**; no cyan exists
   in violet art, so that test can actually fail.
10. **Indices by kind, not offset.** `PAYWALL_INDEX`/`REVEAL_INDEX` were `TOTAL-1`/`TOTAL-2`;
    inserting a step silently pointed the reveal celebration at the wrong screen. Now `findIndex`.

---

## SETTLED — do not relitigate

- **Chrome stays brand violet; content de-brands.** Progress, selection and CTAs are violet.
  Course accents live in content. Ten pulled references confirm: **not one** derives its primary
  button colour from the content it sits on.
- **Dark surface ramp is four tiers** — 4 / 9 / 14 / 19% lightness, border 22. Never invent a hex;
  everything exists in `theme.ts`, `COURSE_ACCENTS`, or is a documented hue-rotation
  (`hero-tint.ts`).
- **Reward motion is reserved for earned moments.** `RewardPop` and Atlas vertical travel are for
  rewards only — that is why Atlas travel went 28pt → 2.0pt and why the plan-reveal stagger was
  removed. Spend it on rewards or it stops meaning anything.
- **`fontSize` always ships with `lineHeight`.** Ratio ≥ 1.2, never 1.0.
- **The user REJECTED a standalone "How your free trial works" step.** Do not rebuild it, however
  good the Facetune evidence looks. It was built, shipped and removed on their explicit
  instruction.
- **The floating blue gear is the Expo dev-client button.** It does not ship. Do not fix it.

---

## TOOLING

- **`scripts/sim.sh`** — `doctor` · `screen` (a11y tree as text, with `[DISABLED]` flags) ·
  `tapon "<label>"` · `state '<jq>'` · `motion` · `open` · `shot`.
  **Pin the device:** `EUPHORIA_UDID=61F7E882-C226-4E97-9918-9BFF536B9A90`.
- **`scripts/certify.py`** — static half of criterion 3a across all 18 ranked routes.
- **`scripts/solve-lesson.py <UDID>`** — drives a whole lesson through every gate type.
- **`scripts/motion_energy.py`, `scripts/measure.py`** — competitor frame analysis.
- Metro on **:8082**:
  `xcrun simctl openurl <UDID> "exp+euphoria-native://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8082"`
- **Text a11y tree + AsyncStorage JSON cost nothing; screenshots cost ~$0.25.** Prefer the former —
  not to save money, but because it produces numbers instead of impressions. Reach for pixels when
  the question is genuinely visual (colour, clipping, composition), and then crop to the band.

---

## HOW THE USER WORKS

- **ONE thing per cycle, done properly.** They will say "keep going" — take it literally.
- **"You tell me what to do"** → give a decision with reasons, not a survey.
- **STOP AND ASK on taste**: copy, pricing, naming, offer content, visual direction.
- **VERIFY ON DEVICE.** Never infer a screen from an exit code, never infer motion from a still,
  never infer clipping from an a11y anchor.
- They will push back hard and bluntly when something looks wrong, and **they have been right
  every time**. When they say a screen is bad, it is bad — go look at it with a screenshot before
  defending anything.
- **Search the repo and `refs/` before reaching outward.** This was right every single time.
