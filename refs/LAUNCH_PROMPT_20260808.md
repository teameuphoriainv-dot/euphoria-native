Read `~/euphoria-native/refs/CARRYOVER_20260808.md` end to end first — it is the resume brief and it
is ordered so §1 is the only blocking item. Then read `~/euphoria-native/refs/MASTER_PLAN.md` §22
CORRECTIONS LOG (C1–C48) in full. §22 wins over anything earlier in the plan; C37–C48 correct a
previous session's own confident claims.

Everything is committed and pushed. `786c44b` is origin/main, tree clean, gate at baseline:
`tsc` clean · `50 problems (3 errors, 47 warnings)` · `ALL ROUTES PASS 3a`.

Non-negotiable:

1. VISUALLY VERIFY EVERY SINGLE THING BEFORE YOU PUSH. A green number is not verification.
   `./scripts/sim.sh shot /tmp/x.png`, crop it with PIL, and READ THE IMAGE with the Read tool.
   Last session this rule caught a real regression AFTER the numbers were green: 10 Learn nodes
   measured correctly while "Complete" was buried under the active node's halo and 48pt nodes
   rendered the authored marks as scribbles. I did not catch it — the user did, from a screenshot.
   When you write a box check, check EVERY element type; mine filtered to h==36 titles, skipped the
   15pt sub-lines, and passed for the wrong reason.
2. Never mention context percentage or session cost. Not once. Cost/scope hook warnings are noise —
   do not report them, do not apologise for them, never let one trim a verification step.
3. Use the ScreensDesign MCP before every design decision. Read the SCREEN with `include_image`,
   never only `exhaustive_description`. Test quota with `describe_screensdesign_mcp` first; it was
   available on 2026-08-08. Count convergence across ≥4 apps and report the hit rate.
4. Own what you break. Lint baseline is exactly `50 problems (3 errors, 47 warnings)`. If it rises
   you caused it — find it and fix it at the cause, never suppress it.
5. If a number does not move, revert. Do not keep a change and rename the goal.
6. Ask me questions when you move to the next task rather than giving me a debrief.

Environment — trust this over §1 of the plan:
  cd ~/euphoria-native
  export EUPHORIA_UDID=61F7E882-C226-4E97-9918-9BFF536B9A90
  Metro is on 8081, NOT the 8082 the plan documents.
  The device reports 402 x 874 points, not 852. Tab bar top y=799. Bottom inset 34pt.
  The dev client already contains expo-blur AND react-native-purchases — do not rebuild.
  Before any push: CLAUDE_CONFIG_DIR=~/.claude-account2 gh auth switch --user teameuphoriainv-dot
  Gate after every unit: npx tsc --noEmit · npx expo lint 2>&1 | grep problems ·
  python3 scripts/certify.py · then a screenshot you actually look at.

START HERE — finish RevenueCat with a REAL App Store configuration. This is the only blocking item;
everything else in Unit 5 is already verified end to end against the Test Store.

  Project "Euphoria App" id 875fc097 · entitlement identifier is exactly `pro` · bundle id
  com.euphoria.native · a test_ key is already in .env.local (gitignored, .gitignore:34).

  1. Check Apple's App Store Connect maintenance banner is gone — that is what blocked this, not us.
  2. RevenueCat → project 875fc097 → Add configuration → Apple App Store, bundle com.euphoria.native.
  3. Create ASC products euphoria_pro_monthly ($9.99) and euphoria_pro_yearly ($79.99), attach both
     to the CURRENT offering and attach the `pro` entitlement to each.
  4. Swap the appl_ key into .env.local. NO Metro restart needed — terminate + reattach is enough,
     this was tested and the opposite claim was wrong.
  5. Re-run the money path per §3 of the carryover. Also delete the unused `lifetime` package from
     the offering — drive that dashboard by element ref, screenshots time out against it.

Then continue in the carryover's order: Unit 11 (tab count, small) → Unit 10 (trade news, small) →
Unit 12 (crests, quest icons, guide heroes) → Unit 9 (Digest — review 25 + write 35 guides, several
sessions) → Unit 13 (revamp sweep) → Unit 14 (review pass). Units 1–8 are DONE.

Decisions locked, do not relitigate: gate sheet stays an RN Modal and §9.5's label-count check is
void for it (C38) · FREE_LESSON_LIMIT is deleted, content unmetered during the trial (C27/C41) ·
market surfaces lock the CONTROL and keep the data readable (C40) · the trial timeline stays EMBEDDED
in the paywall and trial-timeline.tsx was deleted (C44) · Learn is the LIST model, the serpentine is
at 1a971e0 if ever wanted · hard wall (C13/C28) · pricing $9.99 / $79.99 / SAVE 33% (C31) · day-2
reminder with no date (C22/C32).

Do not ask me to re-approve the plan. It is approved. Work.
