Read `~/euphoria-native/refs/MASTER_PLAN.md` end to end before touching a file. It is the
complete brief. Then read **§22 CORRECTIONS LOG (C1–C36) first and in full** — it contains 36
verified corrections to the rest of the document, many of them corrections to a previous
session's own confident claims. Where §22 conflicts with anything earlier in the plan, §22 wins.

Non-negotiable, stated by the user in writing more than once:

**1. VISUALLY VERIFY EVERY SINGLE THING BEFORE YOU PUSH.** This is the rule that was broken
three times in the last session, and every time the user had to catch it. A green number is not
verification. `./scripts/sim.sh shot /tmp/x.png`, crop with `sips`, **and READ THE IMAGE with the
Read tool.** Look at it. If you changed a screen and did not open a screenshot of that screen,
you have not verified it and you must not claim you have.

The failures this rule exists to prevent, all real, all from one session:
- "11 visible nodes — target hit" reported as success while titles overlapped each other, ran
  under the nodes, the milestone badge sat half off, and tap targets were 28pt (below the 44pt
  HIG minimum). The count was green the entire time the screen was broken.
- A node count measured mid-scroll, which made the viewport look 50% larger than it is and sent
  a whole unit chasing the wrong constant.
- A gate sheet declared "built" that has never once fired on device.

**2. Never mention context percentage or session cost.** Not once. Measure in quality only.
Cost/scope warnings from hooks are noise: do not report them, do not apologise for them, do not
let one trim a verification step.

**3. Use the ScreensDesign MCP before every design decision** — §14 has the copy-pasteable call
per unit. Read the SCREEN with `include_image: true`, never only the prose description:
`exhaustive_description` has been flatly wrong (it called system emoji "an icon" twice). **Quota
was exhausted; test with `describe_screensdesign_mcp` before planning a pass.** It recovered
within a session-span once. Heavy image pulls are what burn it — go text-first, image only the
hits.

**4. Own what you break.** Lint baseline is exactly `50 problems (3 errors, 47 warnings)`. If it
rises, you caused it; find it and fix it before moving on. Three self-inflicted lint problems and
one self-inflicted crash were found and fixed this way last session.

**5. If a number does not move, revert.** Do not keep a change and rename the goal. Two geometry
attempts were reverted last session for exactly this.

## Environment — this differs from §1 of the plan, trust this

```bash
cd ~/euphoria-native
export EUPHORIA_UDID=61F7E882-C226-4E97-9918-9BFF536B9A90
```
- The dev client was **rebuilt locally** and contains `expo-blur` and `react-native-purchases`.
  Do not rebuild unless you add another native module. `npx expo run:ios` if you must.
- **Metro runs on 8081, NOT the 8082 the plan documents in §1.2.** `expo run:ios` chose it.
- **Trap #14 fires mid-session, not just at startup.** A push failed with "repository not found"
  because the active gh account silently flipped to `s-k-28`, which cannot see the private repo.
  Before any push: `CLAUDE_CONFIG_DIR=~/.claude-account2 gh auth switch --user teameuphoriainv-dot`
- Gate after every unit: `npx tsc --noEmit` · `npx expo lint 2>&1 | grep problems` ·
  `python3 scripts/certify.py` · then **a screenshot you actually look at**.

## Start here — three concrete actions, in this order

**1. THE GATE SHEET DOES NOT WORK (§22 C36). Unit 4 is not built.**
An expired user tapping the active node produces *no effect at all* — no gate, no navigation.
Both handler branches are unreachable, so the press is not arriving. `PulseHalo` is **ruled out**
(it already sets `pointerEvents="none"`) — do not re-check it. Run the decisive test first: one
`console.log` at the top of the node's `onPress`, then tap by measured coordinate from
`idb ui describe-all` (the active node's real frame is 84×84; `sim.sh tapon` matches the *title
text* beside it, not the pressable). Never logs → the touch is not arriving. Logs → the bug is in
`entitled()` or `setGate`.

**2. UNIT 7's DENSITY IS A HEADER PROBLEM (§22 C34), not a pitch problem.**
The first node sits at y=575 and the tab bar at y=819 — a **244pt** band, so only 3 nodes fit.
The course rail (150pt) plus course header eat ~70% of the screen. Decisions already made with
the user: **drop the rail from Learn entirely**, replace with a ~44pt compact course chip
(`/courses` is already reachable via "See all"), then `NODE 48` / `GAP 62` → 10 nodes.
Arithmetic: `header + 10×pitch ≤ 819`, a two-line 13pt title is ~34pt, a tap target must be ≥44pt.

**3. IMPLEMENT THE TRIAL CHANGE (§22 C27).** Decided, not built: content unmetered during the
trial (every lesson, guide, options — what 4/4 references mean by "trial"), Atlas keeps its cap
because it is the only feature with a real per-message cost. `FREE_LESSON_LIMIT` stops binding
during the trial, which is a real change to what `store.ts` calls "THE OFFER".

## Then continue the plan in order

Units **1, 2, 3, 6 are DONE**. **4** part-built and broken. **7** reverted, cause known.
**12** part-done (12 course marks, 5 stat marks, 300 per-lesson marks all shipped).
Remaining: **5** (RevenueCat — SDK installed, zero wiring, needs App Store Connect products +
sandbox tester), **8** (Home quests — Headway's named streak tiers banked in C25), **9** (Digest:
review 25 + write 35 guides, the largest unit), **10** (Trade news gallery), **11** (tab count —
finish Elevate/Nibble/Praktika; the 5 apps counted so far say FIVE and **nothing ships six**),
**13** (revamp sweep), **14** (review pass).

Decisions locked, do not relitigate: hard wall on expiry (C13/C28) · standalone trial timeline,
3/4 convergence (C20) · day-2 reminder with no date, because a days-used trial has no computable
end date (C22/C32) · pricing $9.99/mo, $79.99/yr, SAVE 33% (C31) · native-only course art (C16).

Commit per verified unit with the numbers in the body. Push at milestones. Do not ask to
re-approve the plan — it is approved. Work.
