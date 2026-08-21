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

## CORRECTION 2026-08-21: the babel fix above CANNOT WORK. Wrong mechanism.

Metro WAS restarted with `--clear` (full rebuild, iOS bundled 11586ms) and the app re-profiled.
`CssInterop.View` per commit was **unchanged**: 5,382 / 39 commits = **138**, against the 136 and
137 measured before. Three independent measurements, one real cache clear, no movement.

**Why.** `CssInterop.View` does NOT come from `jsxImportSource`. It comes from
`react-native-css-interop/dist/runtime/components.js`, which patches React Native's own
components as TOP-LEVEL IMPORT SIDE EFFECTS:

```js
cssInterop(View,      { className: "style" });
cssInterop(Text,      { className: "style" });
cssInterop(Pressable, { className: "style" });
```

That module is pulled in by `import '../../global.css'` at `src/app/_layout.tsx:12`. Every `View`
in the app is the patched one from the moment that import runs, whatever babel does with JSX.

**The babel change is also actively unsafe.** `nativewind/dist/doctor.js:10` THROWS when
jsxImportSource is not 'nativewind'. Metro exited with code 7 during static web rendering
(`react-dom-server-legacy`, `environment=node`, in `ContextNavigator -> useStore -> getRoutes`)
while the change was applied. Reverted.

**The real lever is the `global.css` import**, and it is an owner decision, not a one-liner:
dropping it removes the runtime patching AND disables NativeWind everywhere. tailwind.config.js
decision 6 says "NEW SURFACES ONLY" and those surfaces still do not exist, so the cost is
currently paid for nothing — but the moment one is built, the import has to come back.

**Not attempted.** Measuring the win would mean removing the import, which turns off a
framework the project has decided to keep.

---

## Analysed and deliberately NOT changed: the 8 `set-state-in-effect` errors

ESLint reports `react-hooks/set-state-in-effect` in eight places, warning that setState inside an
effect "can trigger cascading renders". Given the night was spent on render cost, each was read
rather than pattern-matched. **None is a cascading render.**

| site | what it is | why it is fine |
|---|---|---|
| `learn.tsx:87`, `news.tsx:63`, `options.tsx:232`, `stock/[sym].tsx:143` | `setErr(null)` before an async fetch | React 18 bails out via `Object.is` when the value is unchanged, so setting `null` on already-`null` renders nothing |
| `atlas-speech.tsx:34`, `number-rollup.tsx:51` | reduced-motion instant path | one extra render on mount, not a loop |
| `term-match.tsx:71` | three setStates in one match handler | React 18 batches them into a single render |
| `price-chart.tsx:77` | the empty-range fallback | guarded by `autoStepped`, fires at most once |

**So they are not fixed.** Rewriting eight correct call sites to satisfy a conservative rule is
churn, and churn in effects is how subtle bugs arrive. The genuine per-frame offender the rule
exists to catch was NumberRollup, and that one was found by profiling and fixed on its merits.

**What this leaves:** `npm run lint` exits non-zero on 8 known-benign errors, and a permanently
red gate is one nobody reads. Resolving that is a project decision — either downgrade this rule to
`warn` with the reasoning above, or add targeted disables naming it. Not taken unilaterally.

The 4 `no-undef` errors in the same report WERE genuine (Buffer used without importing it) and are
fixed: 12 errors down to 8.

---

## Confirmed: ~85MB retained across 50 navigations — profiler ruled out (2026-08-21, 03:40)

Nothing tonight had looked at memory. It is a signal worth someone's daylight, and it is NOT yet
a defect.

| point | used heap | total heap | % |
|---|---|---|---|
| baseline | 72.74 MB | 100 MB | 72.7% |
| after 25 tab navigations | 129.53 MB | 168 MB | 77.1% |
| after 50 | **177.91 MB** | 188 MB | **94.6%** |
| after 45s idle (GC ran) | 142.74 MB | 204 MB | 70.0% |

**GC works** — it reclaimed ~35MB on idle, so this is not a runaway. But the floor moved:
**72.74MB → 142.74MB, about 70MB retained after 50 navigations**, roughly 1.4MB per navigation
that survives collection. Total heap also grew 100MB → 204MB.

**Confounds NOT ruled out, and any one could explain most of it:**

1. **This is a dev build.** Source maps, the inspector and HMR all retain.
2. **My own profiler.** `start_profiling` was attached about eight times tonight and its fiber
   commit hook accumulates per-commit records. That is a plausible large contributor and it is
   *my* instrumentation, not the app.
3. **Legitimate caches.** `getMarks()` deliberately holds all 12,548 tickers in a JS Map, bundled
   logos decode into memory, and every Trade visit decodes news images.

**How to settle it, cheapest first:** relaunch the app, take a baseline, run 50 navigations with
the profiler NEVER attached, idle, and re-measure. If retention largely disappears, it was the
instrument. If ~70MB still sticks, bisect by disabling the marks fetch.

Recorded as a signal rather than a leak. Measuring something and naming what could explain it is
the whole method that kept tonight honest.

### Follow-up: the profiler was NOT the cause

The obvious suspect was my own instrumentation — `start_profiling` had been attached about eight
times and its fiber commit hook accumulates records. Re-ran the identical protocol on a FRESH
launch with the profiler never attached:

| | with profiler history | profiler never attached |
|---|---|---|
| baseline | 72.74 MB | **41.98 MB** (fresh launch) |
| after 25 navigations | 129.53 MB | 112.69 MB |
| after 50 + 45s idle GC | 142.74 MB | **126.92 MB** |
| **retained above baseline** | +70.0 MB | **+84.9 MB** |

**Retention is HIGHER without the profiler, not lower.** Confound eliminated: this is the app or
the dev build, not the instrument. About **1.7MB retained per tab navigation** after collection.

Worth noting separately: the earlier run's "baseline" of 72.74MB was itself inflated. A genuinely
fresh launch sits at **41.98MB**, so roughly 31MB had already accumulated before that measurement
began — which is why a fresh relaunch is now part of the protocol.

**Still not ruled out:** the dev build. Source maps, the inspector and HMR all retain, and none of
that ships. Settling it needs a release build, which cannot be profiled through metro-mcp because
that requires a Metro dev connection.

**Ruled out as explanations:** the marks map (fetched once per 15 minutes, so it cannot grow per
navigation) and news images (now lazy, ~10KB per Trade visit rather than 831KB).

**Next bisect, cheapest first:** repeat with only TWO screens in the cycle instead of five. If
retention per navigation holds, it is generic screen mount/unmount; if it concentrates on one
screen, that screen is the target.

### Bisect: it is NOT the data-heavy screen

Three fresh-launch runs, 50 navigations each, 45s idle for GC, profiler never attached:

| cycle | retained | per navigation |
|---|---|---|
| all five tabs | +84.9 MB | **1.70 MB** |
| Home ↔ You | +37.4 MB | 0.75 MB |
| **Home ↔ Trade** | **+13.3 MB** | **0.27 MB** |

**Trade is the cleanest, which is the opposite of the obvious guess.** It carries the news images,
the bundled logos and the 12,548-entry marks map, and it retains a third of what the You tab does.
That also independently supports ruling the marks map out: if a Map of 12,548 tickers were the
problem, the Trade cycle would be the worst, not the best.

So generic screen mount/unmount costs about **0.27MB** per navigation, and the excess sits in
**You**, and by elimination in **Learn and/or Digest** — the two screens the five-tab cycle adds.

**Caveat on precision.** These are single measurements, not averages, and GC timing is not under
my control — `totalHeap` differed between runs (44MB, 48MB, 80MB, 84MB), so the exact figures
carry noise. The ORDERING is a 6x spread and far exceeds that noise; the individual numbers should
be read as approximate.

**Next:** Home ↔ Learn and Home ↔ Digest, the two cycles not yet run, to finish attributing the
remaining ~1MB per navigation.

### Attribution complete: You and Digest, not Trade

Five fresh-launch runs, 50 navigations each, 45s idle for GC, profiler never attached:

| cycle | retained | per navigation |
|---|---|---|
| all five tabs | +84.9 MB | 1.70 MB |
| **Home ↔ You** | +37.4 MB | **0.75 MB** |
| **Home ↔ Digest** | +31.8 MB | **0.64 MB** |
| Home ↔ Learn | +18.0 MB | 0.36 MB |
| Home ↔ Trade | +13.3 MB | **0.27 MB** |

**Trade is the floor at 0.27MB, and You and Digest retain roughly 2.5x that.** Every pair includes
Home, so each figure is Home-plus-one-screen; the ordering is what matters.

**The pattern the numbers suggest** — offered as a hypothesis, not a conclusion, because nothing
here proves causation: the two worst screens are the two that render MANY SVG-HEAVY LIST ITEMS.
`You` draws the tier ladder, seven `LeagueCrest` instances at 74 SVG nodes each. `Digest` draws 35
guide cards with cover art. `Trade`, the cleanest, has seven rows and a chart — far fewer SVG
nodes per screen despite carrying the images, the bundled logos and the 12,548-entry marks map.

**What this does NOT establish.** That SVG retention is the mechanism. React Native holds decoded
SVG and image data outside the JS heap in places `performance.memory` does not see, and the dev
build retains source maps and inspector state on top. The correlation is suggestive and the
ordering is robust across a 6x spread; the cause is not proven.

**Cheapest next test:** navigate Home ↔ You 50 times with the tier ladder temporarily not
rendered. If retention drops toward the 0.27MB floor, the SVG list is the mechanism. That is a
source edit plus one run, and it is the first thing that would actually prove it.

### Ablation: SVG list items account for about half the retention

The hypothesis was that SVG-heavy list items drive the per-navigation retention. Tested by
removing them and re-running the identical cycle — both `LeagueCrest` instances on the You screen
(the 104pt profile crest and the 7-item tier ladder at 38pt) replaced with plain Views of the same
size. Ablation verified ON SCREEN before measuring, because Metro caching had already invalidated
one experiment tonight.

| Home ↔ You, 50 navigations | baseline | after + GC | retained | per nav |
|---|---|---|---|---|
| crests present (control) | 41.08 MB | 78.48 MB | **+37.4 MB** | 0.75 MB |
| **crests ablated** | 40.45 MB | 60.60 MB | **+20.2 MB** | **0.40 MB** |

**Removing eight SVG crests cut retention by 46%**, and moved the screen from 0.75MB per
navigation to 0.40 — close to the 0.27MB floor Trade sets. The hypothesis is supported.

**What it does not say.** Removing the crests also removes their layout and children, so this
measures "that subtree" rather than "SVG" specifically. And 0.40MB still sits above the floor, so
SVG is a large contributor, not the only one. Single measurements with GC noise, as before.

**This is a diagnosis, not a fix, and no fix is proposed.** The crests are the tier ladder — real
UI that earns its place, and `LeagueCrest` was already memoised earlier tonight. The finding worth
carrying forward is the general one: **in this app, react-native-svg subtrees retain across
mount/unmount, so a screen rendering many of them costs memory that does not come back.** That is
worth knowing before adding the next SVG-heavy list, and it is the kind of thing no static review
would surface.

**File restored:** 2 LeagueCrest instances present, zero ablation markers, byte-identical to HEAD,
tsc 0, npm run check 0.

### Shipped: the course loader had no cache

Found in the network log, not in source. `personalFinance.bundle` had been fetched **twenty
times**, 664.7 KB each — about 13MB of the same module. Four screens call `loadCourseLessons` on
mount with no cache and no dedupe between them: `home.tsx:120`, `learn.tsx:88`, `lesson.tsx:86`,
`start.tsx:72`.

Now caches the PROMISE, which makes it a dedupe as well as a cache — two screens mounting in the
same tick share one in-flight load instead of racing two. A rejection is evicted, so the retry
button in `learn.tsx` can genuinely retry rather than being handed a permanently-failed promise.

**Measured after: 20 Home↔Learn navigations produced 2 fetches**, both within 71ms at the start
(the initial concurrent mount), then none.

**Honest scope:** in production `import()` already caches the module, so the shipped win is the
duplicate in-flight loads and the repeated promise setup. The 664KB refetch it removes is a
development cost. Worth having for both, but not sold as a user-facing win.

**A note for the memory thread:** this adds no new retention. Dynamic `import()` keeps its module
in the registry permanently, so the lesson data was already held — the cache just stops re-deriving
a reference to it.
