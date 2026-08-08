# CARRYOVER — resume here (written 2026-08-08, end of session)

**Read `refs/MASTER_PLAN.md` §22 CORRECTIONS LOG first and in full.** It now runs **C1–C48**. §22 wins
over everything earlier in the plan. C37–C48 were written this session and several of them correct
things a previous session stated confidently.

Everything below is committed and pushed. `354c26f` is `origin/main`. Working tree clean.
**Gate at baseline: `tsc` clean · `50 problems (3 errors, 47 warnings)` · `ALL ROUTES PASS 3a`.**

---

## 1. START HERE TOMORROW — the one blocking item

**Finish RevenueCat with a REAL App Store configuration.** Everything else in Unit 5 is verified; this
is the only gap, and it was blocked yesterday by Apple.

```
Project:     "Euphoria App"   id 875fc097     https://app.revenuecat.com/projects/875fc097/overview
Entitlement: `pro`            (identifier is exactly this — the code depends on it)
Current app: TEST STORE only  key `test_...` already in .env.local (gitignored, .gitignore:34)
Bundle id:   com.euphoria.native
```

**What to do, in order:**
1. RevenueCat → project `875fc097` → **Add configuration** → Apple App Store, bundle id
   `com.euphoria.native`. This needs App Store Connect, which showed
   *"Planned maintenance: App Store Connect undergoing maintenance by Apple"* on 2026-08-08 — check
   that banner is gone first.
2. Create the ASC products **`euphoria_pro_monthly` ($9.99)** and **`euphoria_pro_yearly` ($79.99)**,
   attach both to the **current offering**, and attach the `pro` entitlement to each.
3. Replace `EXPO_PUBLIC_REVENUECAT_IOS_KEY` in `.env.local` with the **`appl_`** key.
   **No Metro restart needed** — terminate + reattach the app is enough. This was tested, and the
   opposite claim in an earlier session was wrong.
4. Re-run the money path exactly as it was run yesterday (§3 below has the commands).

**Also owed on RevenueCat, small:** the offering still carries an unused **`lifetime`** package the
wizard created. Euphoria has no lifetime purchase anywhere in its UI. It is harmless — `findPackage`
never selects it — but delete it. I declined to click an unlabelled delete icon while screenshots
were timing out, which is the right call and the reason it is still there.

> **Chrome note:** `computer:screenshot` timed out repeatedly against `app.revenuecat.com` while
> `get_page_text`, `read_page` and `find` all worked. Drive that dashboard by **element ref**, not by
> coordinate.

---

## 2. WHAT IS DONE AND VERIFIED (do not redo any of this)

| unit | state |
|---|---|
| 1, 2, 3, 6 | DONE before this session |
| **4 — gate sheet + wall** | **DONE.** Sheet fires; hard wall closed on Atlas, guide bodies and trade. |
| **5 — IAP** | **DONE against the Test Store.** Needs the `appl_` key for real billing. |
| **7 — Learn density** | **DONE. 10 rows measured** (target was ≥10). Promova list model. |
| **8 — Home** | **DONE.** Quests, hero density, streak commitment, trial strip, quest payout. |
| 12 | part done as before — 12 course marks, 5 stat marks, 300 lesson marks |

**The three headline findings, so nobody re-chases them:**

- **C36 WAS WRONG — the gate sheet always worked.** The handler ran, `entitled()` refused correctly,
  and Learn's own `useState` survived the open/close cycle. The original failure was C32's own note:
  the pre-rebuild dev client had no `expo-blur`, so `<BlurView>` was an unresolved native component
  and the sheet rendered *nothing*. Two sessions were spent on a touch path that was never broken.
  **Do not investigate the node touch path.**
- **The paywall contradicted itself four times about the trial length** — heading, both timeline
  beats and the CTA said 7 days while the badge and renewal terms said 3. C31 fixed two of six.
  All six now interpolate `TRIAL_DAYS`. (C43)
- **≥10 Learn nodes is impossible in a serpentine** — three attempts prove it, the third made *with*
  the header already fixed. The fix was the layout MODEL. **The row is the tap target, not the
  circle** — that is what dissolved the 44pt-HIG-vs-36pt-title conflict. (C47)

---

## 3. VERIFICATION COMMANDS THAT WORK (use these, they are all proven)

```bash
cd ~/euphoria-native
export EUPHORIA_UDID=61F7E882-C226-4E97-9918-9BFF536B9A90

# METRO IS ON 8081, not the 8082 §1.2 documents.
lsof -ti:8081

# Reattach after any terminate. Needed constantly.
xcrun simctl terminate "$EUPHORIA_UDID" com.euphoria.native; sleep 2
xcrun simctl openurl "$EUPHORIA_UDID" \
  "exp+euphoria-native://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8081"; sleep 12

# NEW THIS SESSION — drive any trial state. Replaces the devtrial route C15 had to delete.
./scripts/seed-trial.sh <activeDays> <true|false isPro>
./scripts/seed-trial.sh 4 false      # expired
./scripts/seed-trial.sh 2 false      # trial, day 2 of 3
./scripts/seed-trial.sh 1 true       # pro

# Restore the device to the captured baseline when finished.
# refs/BASELINE_STORE_20260807_pre_unit4.json  <- restore isPro/activeDays/cash/positions/etc from this

# THE GATE
npx tsc --noEmit                      # "TypeScript: No errors found"
npx expo lint 2>&1 | grep problems    # MUST be 50 problems (3 errors, 47 warnings)
python3 scripts/certify.py | tail -2  # "ALL ROUTES PASS 3a"
./scripts/sim.sh screen               # then LOOK at a screenshot, always
```

**Reading images:** `sips --cropOffset` did not work. Use PIL, which is installed:
```bash
python3 -c "from PIL import Image; im=Image.open('/tmp/x.png'); im.crop((0,300,im.width,1500)).save('/tmp/c.png')"
```

**Notification / OS-level verification (C45's reusable trick):** RN `console.log` under Hermes goes
to Metro's socket and **never reaches the iOS syslog**, so `log show | grep '[notif]'` finds nothing.
But iOS logs the notification REQUEST itself:
```bash
xcrun simctl spawn "$EUPHORIA_UDID" log show --last 3m | grep "identifier: euphoria-"
# returns the OS's own record incl. trigger type, repeats, timeInterval
```

**Measuring a screen properly:** scroll to TRUE top first (three swipes down) — C33's whole failure
was a mid-scroll reading. Compare `y..y+height` BOXES, never centres (trap #1). And when you write a
box check, **check every element type**, not a subset: mine filtered to `h==36` titles, skipped the
15pt sub-lines, reported zero collisions and passed for the wrong reason. The user caught it from a
screenshot. That is trap #33 living in the verification instead of the code.

---

## 4. REMAINING WORK, in order

### 4.1 Finish Unit 5 — the App Store configuration
§1 above. This is the only blocking item.

### 4.2 UNIT 11 — tab count (small, closes an open question)
C30 counted **5 of 8** named apps. Five is modal at 3/5 and **nothing sampled ships six**. Finish the
count with **Elevate `1395`, Nibble `918`, Praktika `1816`** and report the real hit rate. Quota was
available on 2026-08-08 — test with `describe_screensdesign_mcp` first.

### 4.3 UNIT 10 — trade news gallery (small, self-contained)
Horizontal image cards below the News/Options/Search row in `(tabs)/trade.tsx`, fed by `getNews()`.
**Falls back to text rows with no key — never placeholder headlines** (§0.4). Reuse the Alpha Vantage
sentiment badge already in `news.tsx`. References banked: Bloomberg `1580` leads with a hero image;
Investing.com `1171` scopes "Related News" to holdings, which is the more useful variant.

### 4.4 UNIT 12 — finish the art system
Done: 12 course marks, 5 stat marks, 300 per-lesson marks, 40 stroke marks.
**Still owed:** the 7 league crests refined, quest icons for the new Home quests card, and ~35 guide
hero covers for Unit 9 (authored in `~/euphoriaweb-current` then synced — decision 4).
Run every SVG through `npx svgo`; `digest-heroes.ts` is already 113KB.

### 4.5 UNIT 9 — Digest (THE LARGEST UNIT, budget several sessions)
- **9b** Manually review all 25 existing guides against the six criteria in §9b, write
  `refs/DIGEST_REVIEW.md` (one row per guide), then apply fixes. `lessonForGuide` has **31 entries
  for 25 guides** — find the orphans.
- **9c** Gap audit against the 12 courses. Credit (3) and Strategy (4) are thin.
- **9d** Write the **35 new guides** — full manifest already in §11.1–11.3 with slugs, categories,
  heroes and the required surprise per excerpt. Rules in §11.4.
- **9e** `./scripts/sync-digest.sh`. **Never hand-edit the native copies.**
- **9f** Gating already works — the digest body gate shipped this session (cover + first card free).

### 4.6 UNIT 13 — revamp sweep
Walk all 18 `certify.py` routes for token/type/radius consistency; audit every empty, loading and
error state; dead-control audit over every `onPress` (**inspect every hit — trap #5**); bundle delta.

### 4.7 UNIT 14 — consolidated review pass
`ecc:security-review` weighted on `_limit.ts`, `auth.ts`, `entitlement.ts`, **`purchases.ts`** and the
API routes · `ecc:code-review` · `coderabbit:code-review` · `ecc:silent-failure-hunter` ·
`ecc:council` on the three §14 questions. Fix every CRITICAL and HIGH.

---

## 5. LOOSE ENDS I CREATED — mine to close

1. **`lifetime` package** still in the RevenueCat offering. Delete it (§1).
2. **No "read a guide" quest.** `lib/quests.ts` explains why: `markPostRead` has no day-scoped
   counter, so there is no honest way to ask "did you read one TODAY". Add a day-keyed guide counter
   to the store and it becomes a fourth quest in ~6 lines.
3. **`renewalDate()` in `purchases.ts` has no caller.** 2/5 convergence states the renewal date
   (Quizlet `147614`: *"Your trial renews automatically starting June 3, 2025"*). Real data is
   available from `customerInfo` — surface it on the Settings PLAN section once a real subscription
   exists to read.
4. **`lesson.tsx`'s `router.replace` fallback is unverified.** The `canGoBack()` branch works; the
   fallback only fires on a true no-back-stack cold link, which a dev client cannot construct because
   it always occupies the stack root. Verify on a production build, or accept it as defensive.

---

## 6. DECISIONS MADE THIS SESSION — do not relitigate

| decision | detail |
|---|---|
| **Gate sheet stays an RN `Modal`** | Correct dialog focus-trapping, escapes the tab bar. §9.5's "underlying labels must remain" check is **VOID** for it — verify by screenshot + underlying-screen state surviving open→dismiss instead (C38). |
| **`FREE_LESSON_LIMIT` deleted** | Content unmetered during the trial. Atlas and options keep caps; neither is a trial restriction (C27/C41). |
| **Market surfaces lock the CONTROL, not the data** | Buy/Sell carry a lock at full contrast, Bloom `156247`'s mechanism. Refines C13's literal "quotes and news close" (C40). |
| **Trial timeline stays EMBEDDED in the paywall** | Follows Quizlet, the highest earner sampled. `src/app/trial-timeline.tsx` was **deleted** — 166 orphaned lines (C44). |
| **Learn is the LIST model** | Kept after seeing it rendered. The serpentine is intact at `1a971e0`; `git revert 685cfce` restores it if ever wanted. |
| **Atlas closes entirely on expiry** | No composer, no starter prompts — a composer you cannot send from is a dead control. |
| Unchanged | hard wall (C13/C28) · pricing $9.99 / $79.99 / SAVE 33% (C31) · day-2 reminder with no date (C22/C32) · native-only course art (C16). |

---

## 7. ENVIRONMENT — trust this over §1 of the plan

- `cd ~/euphoria-native` · `export EUPHORIA_UDID=61F7E882-C226-4E97-9918-9BFF536B9A90`
- **Metro is on 8081, NOT 8082.**
- **The device reports 402 × 874 points, not 852.** Bottom safe-area inset 34pt. Tab bar top y=799.
  All band arithmetic must use these.
- The dev client contains `expo-blur` AND `react-native-purchases` — confirmed by
  `strings <app>/euphorianative.debug.dylib | grep -c RevenueCat` → **1,119**. Do not rebuild unless
  you add another native module.
- **Before any push:** `CLAUDE_CONFIG_DIR=~/.claude-account2 gh auth switch --user teameuphoriainv-dot`
  (trap #14 — the active account silently flips to `s-k-28`, which cannot see the private repo).
- `zsh` does not word-split unquoted variables. `for x in "0 false"; do set -- $x` silently passes
  nothing. Use `printf '%s\n' ... | while read -r A B`. **Trap #7, hit again this session.**

---

## 8. THE RULE THAT MATTERS MOST

**Visually verify every single thing before pushing.** A green number is not verification.
`./scripts/sim.sh shot /tmp/x.png`, crop it, and **READ THE IMAGE with the Read tool.**

This session that rule caught a real regression *after* my numbers were green: 10 Learn nodes measured
correctly while "Complete" was buried under the active node's halo, Atlas overlapped the ring, and
48pt nodes rendered the authored marks as scribbles. **The user caught it from a screenshot, not me.**
The count was green the whole time the screen was broken — which is §0.1's failure verbatim, and the
third time this project has paid for it.
