# Active task queue

Ordered by owner instruction 2026-08-20. Worked top-down, not in parallel.

| # | task | status |
|---|---|---|
| 1 | **Sweep remaining surfaces** — search, options, games, settings, reward. | ✅ done — all real surfaces render; both apparent failures were bad probes of mine (a non-route, and deep-linking from a pushed screen) |
| 2 | **Shrink the 300KB marks payload** | ✅ done — measured and DECIDED AGAINST restructuring: merge 241KB (20%), parallel arrays 216KB (28%), gzip 131KB (56%). Compression wins and costs no schema change; production is Cloudflare-fronted so the 300KB is a dev artifact. Rationale recorded in market+api.ts |
| 3 | **Profile render performance** — `get_react_renders` / `start_profiling`. The class of problem behind the reported drag stutter. | ⏳ in progress |

**Not doing:** consolidate-and-stop (owner: "never do #1").

---

## Overnight queue (self-paced loop, 2026-08-20 → morning)

| # | task | status |
|---|---|---|
| 4 | **Make the nav check unskippable** — `record_transition()` refuses to film unless the trigger provably navigated. | ✅ done |
| 5 | **Memoisation sweep** | ✅ done — only 2 clean candidates remain (`AtlasMarkBody`, `CelebrationRays`, both small). The rest take arrays/objects where shallow compare cannot help. |
| 6 | **Measure the memo wins** | ✅ done — A/B on the Learn screen (profiler works there; only lessons break it). Pre-memo 256 commits / 1029ms → memoised 114 / 732ms. **−55% commits, −29% duration**, and −55 to −61% on every SVG component. |
| 7 | **Profile home and digest** | ✅ done — identical 6-scroll interaction: **Trade 0 commits, Home 43 / 100ms, Digest 97 / 296ms**. Two leads below. |
| 8 | ✅ DONE — **NumberRollup setState-per-frame** — `setN()` inside a requestAnimationFrame loop, ~54 re-renders of its subtree per mount over Duration.count (900ms). Now stores the STRING and caps at 24fps: ~70% fewer renders (54 -> 13 for XP, 54 -> 17 for money). The complete fix (shared value + TextInput animatedProps) is deliberately NOT done — it swaps the element away from ThemedText on a money display. | ✅ |
| 9 | ✅ INVESTIGATED — **the app re-renders ~8x/second while IDLE, on every screen.** Not a scroll problem at all: Home 66 commits and Trade 61 commits in 8 seconds with ZERO touches. Cause NOT found; see below. | ⚠️ open |
| 10 | ✅ INVESTIGATED — **CssInterop.View wraps every View for a feature with ZERO usage.** Proposed fix costed and written up below; NOT applied, because verifying it needs a Metro restart on the owner's machine. | ⚠️ ready to apply |

## Method in force
1. Runtime first — network log and console before reading source.
2. Navigation verified by label diff before trusting any capture — now enforced by `record_transition`.
3. Confounds tested before anything is called a defect.
4. Device work batched into single launches.
5. Ship on verified-safe; never claim verified-faster without the measurement.

---

## Open finding: idle re-renders (item 9)

**Established by measurement.** Profiled with no interaction whatsoever, after a 6s settle so mount
animations had finished:

| screen | commits in 8s idle |
|---|---|
| Home | 66 |
| Trade | 61 |

About **7.6 commits per second, on both screens, untouched**. This reframes the earlier reading
entirely — the numbers I attributed to *scrolling* (Home 43, Digest 97) are largely this baseline,
not the scroll.

**Ruled out, each checked rather than assumed:**
- The quests countdown. `home.tsx:150` captures `now` ONCE via `useState(() => new Date())` and
  memoises `hoursUntilReset` off it. Correctly done.
- Scroll handlers. Only two exist in the codebase and both are guarded.
- `setInterval`. Three exist (`term-match`, `atlas-speech`, `onboarding-parts`) and none is on
  Home or Trade.
- `useAnimatedReaction`, `runOnJS(set…)`, event listeners driving state: none present.
- Screen content. Home and Trade differ substantially yet produce nearly the same count, which
  points at a fixed-rate driver rather than anything either screen renders.

**NOT established: the cause.** And one confound must be settled before this is called an app
defect at all — **this is a DEV build**, with React Compiler and Fast Refresh active
(`transform.reactCompiler=true` in the bundle URL). Some or all of this may be development
machinery that a production build never runs.

**Next diagnostic, cheapest first:** profile a release build. If idle commits drop to zero, this is
dev-only and costs users nothing. If they persist, bisect the root providers in `_layout.tsx`,
which has four `useEffect`s and a `ThemeProvider` above every screen.

Recorded as unknown on purpose. Three false findings earlier in this session came from filling a
gap exactly like this one with a plausible story.

---

## Ready to apply: drop the global NativeWind JSX wrapper (item 10)

**The cost, measured.** `CssInterop.View` is the second-largest render cost in the app:

| context | commits | self time |
|---|---|---|
| 8 lesson steps | 27,956 | ~5,871ms |
| Learn, pre-memo | 35,454 | ~6,736ms |
| Home, 8s IDLE | 8,976 | ~1,616ms |

**The usage, swept.** `src/` contains **zero** `className`, zero `styled()`, zero `cssInterop()`,
zero `remapProps()`, and no imports from `nativewind` at all. `tailwind.config.js` says why:

> "NEW SURFACES ONLY (decision 6) — the ~50 existing StyleSheet files are NOT migrating."

Those new surfaces do not exist yet, so ~50 screens pay for a feature with no users.

**The cause.** `babel.config.js` sets `jsxImportSource: 'nativewind'` on `babel-preset-expo`, which
routes EVERY JSX element in the app through the interop wrapper — not only files that want it.

**The change.** One line, and it does not reverse decision 6:

```js
// before
presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
// after
presets: ['babel-preset-expo', 'nativewind/babel'],
```

NativeWind stays installed, `nativewind/babel` stays, `global.css` stays imported,
`tailwind.config.js` is untouched. A new surface that wants Tailwind adds one line at the top of
its own file — `/** @jsxImportSource nativewind */` — and `className` works there exactly as
before.

**Why it is NOT applied.** It was applied, and it did nothing, because Metro caches transforms
keyed by the babel config. The tell was the RATIO, not the count: 8,976/66 = 136 wrapped views per
commit before, 6,987/51 = 137 after. Unchanged, so the old bundle was still being served.

Verifying it needs `npx expo start --clear`, i.e. restarting the owner's running dev server, which
is not something to do unattended at 01:45. **Reverted and left clean.**

**To finish this:** restart Metro with `--clear`, relaunch, profile 8s idle on Home, and compare
`CssInterop.View` per commit against the 136 baseline. If it goes to zero, this is the single
largest render win available in the app.
