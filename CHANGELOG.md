# Changelog

Every commit in `euphoria-native`, newest first — **375 commits** across **16 active days**, 2026-07-20 → 2026-08-13.

This file is generated from `git log`. It is the *record*; the *reasoning* lives in `refs/MASTER_PLAN.md` §22, the corrections log, where entries are numbered `C1`…`C115` and commit messages reference them by number. When a subject here mentions a `C` number, that is where to read why.

## Commits by type

| type | count | what it means here |
|---|---:|---|
| `change` | 182 | pre-convention commits, from before the repo standardised on Conventional Commits |
| `docs` | 73 | the plan, the corrections log, or a handoff |
| `feat` | 52 | a user-visible capability |
| `fix` | 29 | a defect corrected |
| `chore` | 8 | housekeeping |
| `audit` | 7 | a screen or system reviewed against evidence |
| `copy` | 4 | user-facing wording, approved per §0.7 |
| `content` | 4 |  |
| `test` | 3 | a regression or pin added |
| `refactor` | 2 | structure changed, behaviour held |
| `revert` | 2 | a change backed out |
| `refs` | 2 |  |
| `style` | 1 | formatting only |
| `polish` | 1 |  |
| `redesign` | 1 | a screen reworked |
| `a11y` | 1 | an accessibility defect closed |
| `merge` | 1 |  |
| `deps` | 1 |  |
| `dev` | 1 |  |

## Most-touched scopes

| scope | commits |
|---|---:|
| `plan` | 25 |
| `Digest` | 18 |
| `trade` | 11 |
| `learn` | 9 |
| `Onboarding` | 9 |
| `you` | 7 |
| `digest` | 7 |
| `Home` | 6 |
| `Atlas` | 6 |
| `carryover` | 5 |
| `revamp` | 5 |
| `17d` | 4 |
| `league` | 4 |
| `auth` | 4 |
| `ios` | 4 |

---

## 2026-08-13 · 14 commits

- `4f2601a` **refactor(store)** — 780 lines, and regressions that stopped grading their own work
- `4c8d053` **fix(17d)** — the wall now asks before it lets go
- `079eb5f` **copy** — approve the refusal and the system prompt, and correct a stale marker
- `5b1e153` **docs** — bring the README back in line with what the gate actually runs
- `b872a0f` **test(17c)** — verified on device, and three ways the tree lied about it
- `f4d21a1` **audit(security)** — entitlement stops at the client, and a landmine for later
- `8667943` **feat(api)** — make signing in mean something to the server
- `d067def` **feat(chat)** — check that the model obeyed the rule, instead of trusting it
- `148feab` **fix(api)** — uppercasing a ticker was standing in for validating it
- `9f03939` **docs** — a real README, and every commit written down
- `2abfda1` **feat(17c)** — the trial reward offer, anchored to a win rather than to a day
- `e5985d6` **docs(17d)** — verified on device, and the offer is unreachable from Home
- `c064c8f` **docs(17g)** — closed, and the reason 17c kept surviving handoffs
- `74da440` **test(17h)** — the privacy copy was true by omission, which is not the same as true

## 2026-08-11 · 26 commits

- `d434c2a` **docs(carryover)** — a verified handoff, replacing a file wrong on its first line
- `433a850` **feat(you)** — a best streak beside the current one, when it means something
- `1fbe16c` **fix(you)** — the trial metering row stopped short of the card edge
- `206457d` **audit(you)** — every tile counts backwards, and nothing in them is a goal
- `ce0538f` **fix(trade)** — one price source for execution and valuation, disarming C113
- `1d4385b` **refactor(cost-basis)** — one copy of the rule, imported by the app and the test
- `70c8bd3` **docs(plan)** — C113 -- four green gate runs sat over a fabricated +300%
- `c8e4160` **fix(review)** — eight findings from the deep code review, and one recorded not fixed
- `55aeebd` **fix(review)** — a partial cost basis invented a +300% gain, and three smaller things
- `79d369d` **fix(league)** — show which rows the promotion zone means, not just where it is
- `c210372` **audit(league)** — Duolingo solves the cold-start problem by not populating it
- `e3de83d` **feat(onboarding)** — Atlas asks the questions instead of standing over them
- `baaf66e` **feat(auth)** — one ProviderButton for both providers, with both vendors' real marks
- `2f81a49` **style(auth)** — make the two provider buttons read as a pair
- `3ddd9c9` **copy(auth)** — stop promising persistence the app does not have
- `66371d3` **audit(activation)** — the sign-up screen promises persistence the app does not have
- `622ac45` **revert(trade)** — put the old look back, keep every correctness fix
- `d1b99f6` **feat(trade)** — open contracts, because the headline already counted them
- `684b200` **fix(trade)** — "Suggested" implied a recommendation the app does not make
- `283f9bf` **polish(trade)** — a baseline to read the line against, and rows that say something
- `8ba89cc` **redesign(trade)** — strip the chrome, lead with the number, kill the false ranges
- `4728494` **fix(trade)** — the percentage beside every position was the STOCK's, not the user's
- `e85e69d` **audit(trade)** — the Finance peer group does not exist, and the chart is a 1/4 choice
- `bbe1d9a` **feat(learn)** — group each course into five named units, the second 4/4 finding
- `a3cb727` **docs(draft)** — 60 unit names for the LEARN grouping finding -- UNAPPROVED
- `49bb98d` **feat(learn)** — the streak follows you onto the learning surface, and gets a name

## 2026-08-10 · 15 commits

- `ea2daa5` **feat(lesson)** — say what the twenty steps are about, from content already authored
- `8295785` **audit(lesson)** — the lesson-start screen, and why this gap needs no new copy
- `0229856` **audit(learn)** — the core-loop screen, against four Education apps at $500k/mo+
- `1ac2bb5` **docs(plan)** — C112 -- a cited-but-unwritten correction is worse than a missing one
- `8fa8196` **copy(17d)** — trim the dismissal offer to three lines, the shape the evidence names
- `315ffa2` **docs(plan)** — restore C100-C105 and C107-C111, which were cited but never written
- `d3c69ee` **docs(carryover)** — verified handoff after Unit 17, the deploy, and the screen audit
- `517ba15` **feat(audit)** — capture harness for all 31 routes, plus the comparator set (C111)
- `ea76692` **test(17h)** — pin the billing-retry rule, and audit why-not-free line by line (C110)
- `51cc5d4` **feat(17f)** — the guided first action is a real lesson now, not a generic guide (C109)
- `757373a` **feat(deploy)** — the API routes are live -- C98's structural half is closed (C108)
- `5a157b0` **fix(eas)** — eas.json was invalid -- EAS rejects an empty env value (C107)
- `e41c7e4` **docs(plan)** — C106 -- real RevenueCat key in, IAP_ENABLED true, 17d verified on screen
- `8200526` **feat(17e)** — stop the hard wall from evicting members mid billing-retry (C105)
- `8367f79` **feat(17d)** — a better offer on dismissal, built from pixel-verified evidence (C104)

## 2026-08-09 · 13 commits

- `75d653f` **copy(privacy)** — the no-analytics claim was made false by 17b -- user-approved wording (C103)
- `dcfa316` **feat(analytics)** — the 17b funnel, so every other retention lever can be judged (C102)
- `f72f415` **a11y(unit13)** — name every unlabelled control -- 8 were silent to VoiceOver (C101)
- `0ea399f` **fix(portfolio)** — chart and headline now value the same portfolio (C100)
- `c01092a` **docs(plan)** — C95-C99 -- icon was Expo's, Google client created, vendor buttons, and the production API origin that does not exist
- `3120359` **feat(auth,icon)** — real Google sign-in, vendor buttons, and Euphoria's own app icon
- `0b31915` **feat(content)** — run §9c's gap audit -- 271 of 295 lessons have no guide
- `157ed49` **fix(ios)** — take com.euphoriainv.euphoria, the identifier of the real listing (C94)
- `2367318` **docs** — C93 -- euphoria-native is the product, and the 2.1(b) reply reverts to it
- `374d922` **docs(submission)** — rewrite the 2.1(b) reply against euphoriamobile, the reviewed app
- `e89e3da` **docs(plan)** — C92 -- there is no Paid Applications Agreement, so IAP has never been sellable
- `90c6057` **merge** — reunite the two rejection branches and close the C86-C90 hole
- `36d29d4` **docs(carryover)** — corrected handoff -- two repos, and C82/C83 were void

## 2026-08-08 · 64 commits

- `7018400` **docs(plan)** — C91 -- both rejection bugs verified already fixed in euphoriamobile
- `ec29aaf` **fix(ios)** — stop claiming com.euphoriainv.euphoria -- it belongs to another repo (C90)
- `805b7d5` **fix(auth)** — implement Sign in with Apple and Google for real (C85)
- `7791551` **docs(carryover)** — a verified handoff after the ASC findings
- `c5fa701` **docs(plan)** — C85 -- implement Apple and Google sign-in properly, with the full plan
- `c98a90a` **docs(plan)** — C84 -- rejection bug 2 is a dead control (§0.5)
- `c6a096d` **chore(ios)** — verify the bundle ID correction end to end (C83)
- `aed3658` **fix(ios)** — correct the bundle ID to match the App Store listing (C82)
- `80bb461` **docs(plan)** — C82 -- app.json's bundle ID does not match the App Store listing
- `23f343b` **docs(plan)** — C81 -- bundle ID mismatch between RevenueCat and this repo
- `3128475` **chore(iap)** — new in-app-purchase key generated and secured (C80)
- `86efef1` **docs(plan)** — C79 -- IDs captured, .p8 lost, and four rival RevenueCat projects
- `0097351` **docs(plan)** — C78 -- agreed sequence after the rejection
- `c04bbb9` **docs(plan)** — C77 -- the app is REJECTED and has been since April
- `35d3ec1` **fix(iap)** — IAP_ENABLED was true for a placeholder key (C76)
- `9a5d6e4` **feat(league)** — redesign the league screen (C75)
- `60dc554` **feat(store)** — seven screenshots, reproducible, in the brand font (C74)
- `bc3b66a` **feat(store)** — first three App Store screenshots (C73)
- `3d5a3b2` **docs(plan)** — C72 -- Unit 16b store-creative research, 24 shots across 15 apps
- `18599ee` **chore(revamp)** — skeletons and humane purchase errors — Unit 13 closed (C71)
- `15c2ddd` **chore(revamp)** — empty-state audit on a real empty store (C69, C70)
- `eb6be8c` **chore(revamp)** — tokenise the type scale (C68)
- `82cc174` **chore(revamp)** — tokenise design radii, leave geometry raw (C66, C67)
- `bfd64a3` **chore(revamp)** — Unit 13 audits, and the streak colour tokenised (C65)
- `e1e76ff` **feat(art)** — quest marks, and Unit 12 closed (C64)
- `1f64a33` **feat(trade)** — news gallery (Unit 10)
- `f1c7afa` **docs(plan)** — Unit 15 marked done, with the one unverified claim named
- `339c2a8` **feat(notifications)** — let the user choose the nudge hour (Unit 15a)
- `820431c` **feat(widget)** — the three-ask promo flow and the add-widget tutorial (15d, 15e)
- `d9ed728` **docs(plan)** — C63 -- the widget render is blocked by the simulator, not our code
- `cbecb36` **feat(widget)** — mirror streak/xp/dayKey across the App Group (Unit 15c)
- `9e1ca68` **docs(plan)** — units 16 and 17 -- the store listing, then churn and monetization
- `032d21d` **feat(widget)** — WidgetKit target that survives prebuild --clean (Unit 15b)
- `4972ff0` **docs(carryover)** — make "ask many detailed questions" a standing rule, not a footnote
- `72ccaaf` **docs** — restore the filename my heredoc's backticks ate
- `3138df3` **docs** — refs/CARRYOVER_PROMPT.md — a verified handoff for a cold session
- `bc64132` **docs(plan)** — Unit 15 decisions 5 and 6 — the prebuild fallback and one cycling widget
- `1e76905` **docs(plan)** — Unit 15 decisions, including a correction I was wrong about
- `5042f93` **docs(plan)** — UNIT 15 — widgets and notifications, researched in pixels
- `1a305cc` **content(digest)** — sync — 35 of 35 guides ship clean
- `729565f` **content(digest)** — sync the 20 ending rewrites; DIGEST_REVIEW is 0 REWRITE
- `2964f5a` **docs(plan)** — C57 — Unit 9's content phase closes at 10 app-only guides, not 35
- `d5a074a` **content(digest)** — 35 guides, 10 of them app-only
- `71d7040` **content(digest)** — sync the seven bespoke covers
- `1188fee` **fix(sim)** — refuse to tap a coordinate that is off the screen
- `2362759` **feat(digest)** — the Today card was spending 40% of the screen on one guide
- `5d3e535` **feat(digest)** — the app now carries more Digest than the web, 25 -> 29 guides
- `dbb6bf3` **docs(digest)** — §9b review of all 25 guides — generated, and the library is two cohorts
- `1f3cd39` **docs(plan)** — C54 — close Unit 4's two loose ends as "leave it", with the reasons
- `e56deda` **docs(plan)** — C53 — restate §4b, because "zero direct pushes" breaks working design
- `e253473` **fix(gate)** — Atlas's refusal said it would not throw you out, then threw you out
- `b1c79a5` **docs(plan)** — C51 the stale sim that cost two sessions, C52 the inverted lock convergence
- `540b65e` **fix(gate)** — a locked Buy that looks broken is not the same as one that costs money
- `3d62b8b` **fix(you)** — one glyph was doing twelve jobs — that is why the screen read as templated
- `e3b4194` **fix(you)** — the screen introduced an offer before it introduced a user
- `db8ba63` **feat(trade)** — the learning surface the tab promised — observations about your own portfolio
- `abc4245` **feat(league)** — the crests were a palette swap; now the badge gains hardware as you climb
- `e33227c` **fix(you)** — the plan card stated three different kinds of fact as one middot sentence
- `a83ea9a` **fix(market)** — news was unreachable on an Alpha Vantage key, and the badge was about to be copied
- `85c9f78` **docs** — C49-C50 — Apple blocks the store config again, and the tab count closes at 8/8
- `d597469` **docs** — persist tomorrow's launch prompt beside the carryover
- `786c44b` **docs** — carryover for tomorrow — the one blocking item, and everything still owed
- `354c26f` **fix(iap)** — match packages store-independently — Unit 5 is now VERIFIED END TO END
- `b3e642f` **feat(home)** — finishing your daily quests now pays — and the rail was never clipped

## 2026-08-07 · 39 commits

- `aa91b42` **docs** — C47–C48 — Unit 7's model change and Unit 8, with the numbers that were wrong
- `c29cc39` **feat(home)** — streak commitment with NAMED tiers, and the trial strip — Unit 8 complete
- `f3995c4` **feat(home)** — daily quests, and the hero stops eating a third of the screen
- `685cfce` **feat(learn)** — list model on Promova's shape — 6 nodes -> 10 ROWS, target met
- `1a971e0` **feat(learn)** — 150pt course rail -> 44pt chips, and the REAL band arithmetic
- `d42943b` **docs** — C46 — Unit 5, and the dead-end paywall the completed wall exposed
- `0f16a4b` **feat(iap)** — RevenueCat wired, and the expired paywall now sells instead of dead-ending
- `91dd159` **docs** — C43–C45 — the 7-vs-3 contradiction, plan-card convergence, and the verified reminder
- `4fec4ad` **feat(notifications)** — the day-2 trial reminder actually fires — C13 decision 3's obligation
- `7710879` **fix(paywall)** — the trial length contradicted itself FOUR times on one screen
- `c530f66` **feat(trade)** — lock the transaction, keep the market readable — Bloom's mechanism
- `16cbea8` **docs** — C37–C42 — the gate sheet was never broken, and the hard wall had holes
- `364b4e3` **feat(paywall)** — close the hard wall on Atlas and guide bodies — two measured holes
- `bba311f` **feat(entitlement)** — content unmetered during the trial — C27's change to THE OFFER
- `48423fa` **docs** — carryover prompt for a fresh session, with the visual-verification mandate first
- `841e9c9` **docs** — C36 — PulseHalo ruled out as the gate-sheet bug; name the decisive test instead
- `818ff77` **docs** — CONFIRMED — the gate sheet never fires. Unit 4 does not work.
- `fac33cb` **docs** — the density bug is the HEADER (244pt band, 3 nodes) — and the gate sheet is unverified
- `8c3ae52` **revert(learn)** — density target is unachievable as a spacing change — geometry restored
- `b7d4b69` **fix(learn)** — 11 visible nodes measured (was ~5-6); and fix the render loop I shipped
- `0f6da22` **feat(learn)** — density pass — pitch 100->46, node 66->36, computed 10 nodes per viewport
- `a75c493` **feat(paywall)** — annual $59.99 -> $79.99, and fix a paywall that promised 7 free days for a 3-day trial
- `2a7a4bf` **docs** — decisions round 2 — trial model, wall, pricing, tab count
- `e43b7ea` **docs** — mark Units 2 and 6 DONE, 4 and 12 partial with what each still owes
- `651a262` **feat(paywall)** — gate sheet + standalone trial timeline; drop Tamagui, add blur/IAP/primitives
- `bfb8ab3` **fix(entitlement)** — resolve C19 — options open during the trial; the 3-cap is a data limit
- `901ed92` **docs** — Unit 4 research complete — convergence 4/4, and C9 was overstated
- `99ed8f3` **feat(you)** — plan status card, tappable league ladder, and one progress bar instead of two
- `eb376db` **feat(art)** — 300 authored lesson marks — a distinct icon for every lesson
- `3e65ab4` **feat(art)** — per-lesson mark map — 100/300 authored, uniqueness by construction
- `c6e3e7c` **fix(learn)** — lesson node art was accent-on-accent and dissolved — stroke marks instead
- `1c787d9` **feat(lesson-art)** — a distinct icon per lesson — 24-in-a-course down to 5, 16-in-a-row down to 2
- `09f680f` **feat(art)** — authored course + stat marks, and five tappable You tiles
- `5140ae9` **feat(entitlement)** — 3-day trial clock and a single entitlement authority
- `4f34132` **docs** — correct §6.6.2 — the reference apps do NOT embed the trial timeline
- `af86931` **fix(icons)** — narrow EUPHORIA_ICONS to a real union; correct the plan in place
- `29c114d` **feat(ui)** — NativeWind + Hugeicons foundation, and correct the plan's icon map
- `3ee5f07` **docs** — MASTER_PLAN v2 — complete cold-start brief with paywall + trial spec
- `61f61ba` **feat(api)** — device-scoped rate limiting + Supabase auth scaffolding

## 2026-08-06 · 50 commits

- `6b090d3` **change** — refs/HANDOFF.md — carryover for the next session
- `81cda65` **change(Learn)** — milestone markers every 5th node; node-type icons tried and dropped
- `5ef9b7a` **change(Learn)** — tighten the trail pitch, and put data in the header
- `bda99b8` **change(Home)** — header stats in a row, and the CTA back on the brand gradient
- `4d85b7e` **change(Home)** — add a labelled course rail, compact the hero to make room
- `59c27da` **change** — Remove the standalone trial-timeline screen — user rejected it outright
- `c79d67b` **change** — Paywall hero rotates through the user's own recommended courses
- `f79c6d7` **change** — Re-apply the paywall split, and give the plans screen its hero
- `152a0fb` **change(AGENTS.md)** — never infer absence from a paginated pull
- `b5268d7` **change(AGENTS.md)** — ScreensDesign is mandatory for all design work
- `d98ce11` **change** — Revert the entire paywall arc — the split was wrong
- `cc5fa5f` **change** — Trial step: state the price on the screen that explains the price
- `6c7ef48` **change** — Repair the flex chain so the trial timeline distributes
- `771f20b` **change** — Trial step: give the timeline generous row spacing
- `71d1baa` **change** — Split the trial timeline onto its own step so nothing is clipped
- `936fef7` **change** — Revert paywall timeline spacing: it clipped the Monthly card
- `bd7b77d` **change(Paywall)** — give the trial timeline the screen's own spacing rhythm
- `8043121` **change** — Plan reveal: promote the commitment above the catalogue
- `a77358b` **change** — Plan reveal: stop the course cards popping in on a stagger
- `6f1458b` **change** — Close the last two lint warnings properly, not by suppressing them
- `deb3723` **change** — Remove 14 unused imports and variables across 6 ranked routes
- `86d38ff` **change(Home)** — shrink the hero illustration so the tiles clear the tab bar
- `cf592c3` **change(Certification)** — all 18 ranked routes pass criterion 3a, made re-runnable
- `b7a239f` **change** — ambient-background: deterministic star scatter, not Math.random in render
- `94d1664` **change** — Chart legend: iconLilac for 13px text, primary fails WCAG AA on card
- `5302a36` **change** — Fix the ref-during-render error I introduced in commit-on-tap
- `400f32d` **change** — number-line: pin lineHeight to the fontSize override
- `ac8608e` **change** — Lesson choice: every option state carries an icon, not just a colour
- `5538202` **change** — Replace the goal with a machine-decidable one
- `d53e271` **change(Onboarding)** — commit-on-tap for single-select steps
- `4ed41c2` **change** — Repair the mangled fourth finding line
- `c577f5b` **change** — Fix finding numbering in onboarding section
- `db804a0` **change** — Profile spec + onboarding findings, two verified in source
- `bf1c3e7` **change** — Lesson intro + lesson step specs from two ScreensDesign pulls
- `412cc8a` **change** — Streak screen spec, grounded in a 6-app ScreensDesign pull
- `93875d0` **change** — De-violet the digest content layer: wire the tint that was never called
- `892b00f` **change** — Screen redesign brief, grounded in ScreensDesign revenue evidence
- `37dee96` **change** — Phase 3: measured why the app reads bland, plus ranked backlog
- `0b24cc3` **change** — Phase 2: Atlas reaction map, vertical travel reserved for earned moments
- `f605c9b` **change** — Phase 1: reorder animates, tokens merged, exits added
- `3a917f3` **change** — Fix a marginal WCAG AA contrast failure on the Digest CTA
- `89ad677` **change** — Expand undersized navigation touch targets
- `d67e39a` **change** — App-wide button semantics from the shared wrapper
- `7cee1eb` **change** — Choice steps scroll; completion loop verified end to end
- `0431af0` **change** — Fix interactive lesson steps overflowing under the pinned footer
- `0338ec3` **change** — Accessibility for every interactive lesson component
- `68f3832` **change** — Fix NumberLine accessibility blocker and 11 line-height defects
- `c5ef3d2` **change** — Dark surface ramp: four tiers instead of seven crowded tokens
- `a4bc764` **change** — Motion research brief + sim.sh shows disabled state
- `366a380` **change** — Real onboarding: working nudge, personalised path, Atlas reactions

## 2026-08-04 · 9 commits

- `7be4e95` **docs** — rewrite carryover with the tooling and measurements from this session
- `6872de4` **deps** — sharp, svgo, style-dictionary, odiff-bin
- `c977179` **docs** — carryover for the next session
- `bf58e47` **refs** — why our motion does not match Brilliant/Duolingo, researched
- `25d9010` **change(Digest)** — adopt the recoloured figures; gallery caption follows
- `cc218d3` **dev** — one screen showing every art system at once
- `2aad2f4` **change(Digest)** — adopt the five original covers
- `65c5161` **change(Digest)** — the category filter had no feedback at all
- `ed52b89` **refs** — Rive animation brief + vector source for handoff

## 2026-08-03 · 29 commits

- `45f1b33` **change(Digest)** — rework the finish beat, and a harness to iterate on it
- `6c07770` **change(Digest)** — finishing a guide is now something you can feel
- `a05e7f6` **change(Digest)** — Smart Brevity rendering, and prose at a reading size
- `841cfa8` **change(Digest)** — a daily read that actually completes, and a library you can browse
- `75e9595` **change(Onboarding)** — drop the unsubstantiated "4x faster" claim
- `430b261` **docs** — record the crest rework and the both-sizes rule
- `038a2a1` **change(Crest)** — read as earned metal instead of brown blobs
- `3665bb0` **docs** — record the You colour pass and the unused-capability lesson
- `8f2f42d` **change(You)** — stop suppressing the colour the page already had
- `b1679fe` **docs** — record the guided first action and the auth clobber fix
- `1ce6448` **change(Start)** — end onboarding in a real first action, not on an empty Home
- `327321c` **docs** — record identity, the follow graph and the zustand snapshot trap
- `e47ac51` **change** — Friends screen and a Friends tab on the league
- `885e4e6` **change** — Identity and a follow graph
- `065a70d` **docs** — record the league adopting the shared tier model and weekly ranking
- `b666dd5` **change(League)** — adopt the shared tier model and rank on weekly XP
- `8bae87e` **docs** — record the menu trim, paywall route guards and the Diamond League contradiction
- `408f74c` **change(You)** — trim the menu and point the upsell at the real paywall
- `dec391a` **docs** — record You polish, the Icon fallback gotcha and what remains
- `d1d1a13` **change(You)** — polish pass on hierarchy, tint and the ladder
- `3313ff8` **docs** — record the XP sources, weekly layer and device verification
- `b927605` **change(XP)** — make the league climbable from more than one surface
- `703c882` **docs** — record the You rebuild, the single XP source, and the demo-lesson defect
- `49233d5` **change(You)** — rebuild the profile around a real league ladder
- `a1445cf` **docs** — record the legal URL fix and the SPA-fallback verification trap
- `b77a2b0` **change(Legal)** — point Terms and Privacy at the real live pages
- `8b5663f` **docs** — record the verified entry fix and the placeholder legal URLs
- `5b2b839` **change(Entry)** — send returning users to Home instead of re-running onboarding
- `20c849f` **change(Atlas)** — rebuild the mark as four independent vector rings

## 2026-07-28 · 21 commits

- `defd47f` **change(Atlas)** — typed speech bubbles and a cloud-puff reveal
- `6df165b` **change(Lesson)** — verdict bar, spark burst, and a streak ignition sequence
- `0cab4d9` **change** — Lesson complete: rebuild the beat against the measured Duolingo reference
- `f69d0ed` **change(Atlas)** — drop the pear body
- `e2302ed` **change(Atlas)** — restore the original character, and animate THAT
- `acc5126` **change(Paywall)** — make annual read as annual, and stop clipping the reassurance
- `85f24e0` **change(Atlas)** — give it a head, and a body that can actually animate
- `5e803e3` **change(Digest)** — send each guide to its own lesson, and record the completion properly
- `f704681` **change(Digest)** — pull the new covers through, and let the cover card fill the screen
- `87f5c17` **change(Digest)** — pull the rebuilt semi-3D figures through the sync
- `ed3d9ec` **change(Digest)** — let cards flow across headings instead of one card per section
- `58f1187` **change(Digest)** — balance cards so they stop leaving half a screen empty
- `60da78c` **change(Digest)** — back to the app's own type, pack cards, queue up the tab
- `4ed0388` **change(Digest)** — set the reader in a reading serif, and fix today's pick
- `f73bd16` **change(Digest)** — paginate the reader by section, and stop lying about read time
- `853b6b5` **change(Digest)** — add sync-digest.sh, and pull 5 new explainers from web
- `e42feb5` **change(Digest)** — port the real article bodies from web
- `f7f45c0` **change(Digest)** — make it the app's daily read instead of a port of the web page
- `eb592d3` **change(Home)** — tint the cards, and remove two animations that never actually ran
- `54b45cb` **change(Home)** — mark today, sweep the primary CTA, and give the hero card depth
- `b1428cb` **change(Motion)** — make the ambient layer actually move, and the goal ring breathe at zero

## 2026-07-27 · 6 commits

- `06518e6` **change(UIcon)** — add the missing close glyph, and stop accepting unknown names
- `1a840d7` **change(Home)** — wire hero to real state, and make the streak an actual streak
- `8134ddb` **change(Onboarding)** — real product proof + reachable paywall legal links
- `d121277` **change(Onboarding)** — real 15-step funnel, persisted answers, path reveal
- `0cc92d8` **docs** — move project docs out of the repo root into docs/
- `e3b3f29` **chore** — gitignore agent tooling state and stop tracking .claude-flow

## 2026-07-26 · 4 commits

- `e61eadb` **change** — Lesson art: expand to 26 illustrated metaphors
- `9f8b4e0` **change(Learn)** — course rail + real curriculum; illustrated lesson art
- `eb75e9e` **change(Atlas)** — give the mascot a body; calm the onboarding bounce
- `7fb86e1` **change** — Add linked web->native curriculum layer (300 lessons, 12 courses)

## 2026-07-24 · 1 commit

- `e3d31a7` **change** — Fix two onboarding/profile crashes blocking the app

## 2026-07-22 · 6 commits

- `38a8ad0` **change(Welcome)** — Atlas bounces in as it lands on the light beam (stronger first impression)
- `a3db157` **change(Onboarding)** — option card scale-pops on selection (Brilliant micro-interaction)
- `fd0b742` **change** — Lesson intro: bigger hero Atlas that bounces in (Brilliant LEVEL-intro feel)
- `afb1d1d` **change** — Record verified visual progress: charts draw-on, learn illustrated nodes, full onboarding motion
- `64d562f` **change(Onboarding)** — radio dot springs-pops in on selection (satisfying micro-interaction)
- `5d4f98e` **change(Onboarding)** — stagger path-ready steps + paywall perks (cascade in)

## 2026-07-21 · 77 commits

- `71ee140` **change(Onboarding)** — option cards stagger-cascade in (Brilliant-style) on goal + level steps
- `44c7689` **change(Onboarding)** — Atlas bounces in per step + reacts (hop + happy expression) on selection
- `502c497` **change** — Onboarding motion: growth chart draws on left->right + segmented progress spring-fills
- `bb5c45b` **change** — Add precise Brilliant visual analysis (ref folder) + revert index hack
- `4488935` **change** — Learn pathway: colorful EUPHORIA_ICONS illustrations in nodes (Brilliant-style unit art)
- `2658050` **change(Doc)** — stale-bundle root cause + full-reload verification recipe
- `2cbaa90` **change** — Revert index verification hack -> /welcome (learn redesign 44b16fe verified live on sim)
- `44b16fe` **change** — Redesign learn pathway toward Duolingo/Brilliant: 3D raised nodes + lesson icons + title labels
- `6057b51` **change** — Honest reset: charts draw-on DONE+verified; real visual redesign (learn pathway, onboarding motion, digest) is the remaining priority
- `7fac0b6` **change** — Charts now DRAW ON left->right (strokeDashoffset sweep) + area fades up
- `f92302e` **change** — Phase 20 explorable verified; ~19/24 phases done. Remaining: 21 mini-games, 23 perf, 24 QA
- `3f33273` **change** — Phase 20: Compound Growth Lab explorable (interactive steppers + live FV + growth curve), linked from You
- `0cc6b07` **change** — Mark Phase 19 paywall + 22 empty states at-bar; note remaining 20/21/23/24
- `7ba887f` **change** — Durable snapshot: phases 1,5-18 done; 19-24 remaining; persistence live, native rebuild done
- `b95f0b3` **change** — Phase 15 complete: enable disk persistence (AsyncStorage now linked after native rebuild)
- `45d9e08` **change** — Phase 18: fix splash background #208AEF(blue)->#09090D(app dark) — kills the blue launch flash
- `620315b` **change** — Update durable memory: phases 1,5-17 done; 18-24 remaining; native rebuild in progress
- `551a3af` **change** — Phase 17: auth screen (Apple/Google/email, Brilliant style) + store signedIn/signIn/signOut; Log out -> /auth
- `fbd3440` **change** — Phase 14/16: League 'You' row reads live store XP + dynamic re-ranking
- `dc265d7` **change** — Phase 16: Home streak reads live store value (was hardcoded 12)
- `fe85666` **change** — Log Rive-via-pipeline directive + Phase 15 status (native rebuild needed for persistence + .riv)
- `318aaa0` **change** — Fix red-box: remove AsyncStorage import (native module not in dev-client binary)
- `d25cf06` **change** — Phase 15/16: persisted app store (zustand + AsyncStorage)
- `2a3034c` **change** — Track Phases 5/10/11 done + session progress log
- `19eea28` **change** — Phase 11: Trade rows -> real stock detail screen
- `34e05ac` **change** — Phase 10: lesson reward moment -> staggered cascade (XP chip + streak-bump chip, RewardPop delays 280/460/640). Verified on sim.
- `e20a767` **change** — Track Phase 12/13 progress: Digest reader + You settings wired & verified
- `79f1397` **change** — Phase 12/13: wire Digest + You dead buttons
- `a340de9` **change** — Phase 5/7: wire Home dead buttons — goal ring -> /learn, daily challenge -> /lesson
- `011998e` **change(Pivot)** — park Rive, loop does visible product polish (Phase 5+) via code+execbro
- `7a3fdad` **change** — Phase 2: Rive stateMachineName fix committed (75360bb); verify blocked by dev-client/execbro this tick — resume plan recorded
- `75360bb` **change** — Phase 2 fix: always drive the Rive state machine (stateMachineName default)
- `c156973` **change** — Phase 1 closed, Phase 2 Rive debug plan recorded
- `3fb6b5b` **change** — Phase 2: instrument Rive view (onPlay/onStateChanged/onError logging) to diagnose why animations don't play
- `fd505a5` **change** — Phase 1: add chevronRight + trophy icons; fix courses forward-chevron
- `62a39f8` **change** — Loop mode: continuous + Maestro nav; Phase 1 walk done, games/league linked
- `85f46d5` **change** — Phase 1: link /games + /league into You nav (were unreachable in prod)
- `f0613b3` **change** — Phase 1 walk: lesson viewer verified (intro+teach render)
- `8178115` **change** — Phase 1 walk: digest + you verified — all 5 tabs clean, 0 bugs
- `afd862a` **change** — Phase 1 walk: learn + trade verified on sim (Trade segment fix confirmed live)
- `596ba95` **change** — Configure origin remote (private) + document push flow
- `4aff288` **change** — Phase 1 walk: onboarding (6 steps) + home verified clean on sim
- `3acd2c4` **change** — Restructure into one 24-phase build loop; retire duplicate task tracker
- `e138e15` **change** — Phase 1 cleanup: remove dead code, orphan assets, unused deps
- `f32aaff` **change** — Phase 1 stability: fix OrderSteps hang, Trade dead segments, guard dev route
- `3a527ce` **change** — Add headless Rive pipeline + production-build scaffolding
- `5f4dca8` **docs** — session log + Rive pivot plan + journey roadmap (restart handoff)
- `49fbf47` **docs** — loop working-style → bigger batches, not one-tiny-item-per-cycle (user directive)
- `b89e7f4` **change** — #A GraphPointDrag lesson widget: drag chart point into target band (SVG + responder)
- `bf5cb31` **change** — #A BeforeAfterSlider lesson widget: drag-to-reveal value morph (inflation erosion demo)
- `3dd4f4d` **change** — #A OrderSteps lesson widget: tap-two-to-swap sequencing, per-row in-place check
- `6d25022` **change** — #A dev: ?step= deep-link jump for per-widget visual QA + mandatory visual-verify recipe
- `3928463` **change** — #A MatchingPairs lesson widget: tap-term-then-match, shuffled column, lock-green/flash-amber
- `d3d2cab` **change** — #E Atlas anim expansion: +3 expressions (thinking/proud/oops) +3 behaviors (breathing bob, shake-on-wrong, bounce-in); wired into lesson quiz + done
- `bc4a1ca` **change** — #A NumberLine lesson widget: tap-to-place value on a labeled line w/ tolerance check
- `a7c83a0` **change** — #A MultiSelect lesson widget: choose-all-that-apply w/ set validation + reveal
- `829d505` **docs** — durable autonomous build roadmap (remaining queue)
- `41dc6c7` **change** — #17 Term Match game: tap-to-match pairs, timer, score, results w/ celebration
- `f203ba5` **change** — #17 Games hub: real 2-col grid of finance mini-games with free/pro locks (Term Match playable)
- `d83d3bf` **change** — #15 gamification: Diamond League leaderboard (ranked rows, promotion/demotion zones, you highlighted)
- `b0bdc5b` **change** — #15 gamification: animated daily-goal ring (SVG arc fill) on Home
- `6574d90` **change** — #12 Atlas reactivity: celebratory jump (spring translateY squash) on lesson completion
- `2e457ca` **change** — #9 widget: TapReveal flip-cards (tap to reveal definitions, gate on all-flipped) as lesson 'cards' step
- `240db57` **change** — #9 widget: SortBuckets (tap-to-categorize, auto-check green-lock) as lesson 'sort' step
- `be0c790` **change** — #9 widget: SliderPredict (drag-to-guess → reveal answer + delta) registered as lesson 'slider' step
- `5da24f6` **change** — Motion juice (#11): RewardPop bouncy scale-in + XP roll-up on lesson completion
- `d676c0f` **change** — Motion juice (#11): NumberRollup count-up component wired to Home + Trade portfolio values
- `da1956d` **change(Welcome)** — Atlas light-beam spotlight intro (mascot descends on a violet beam, greeting fades up) as first screen
- `be6f306` **change** — Segmented 3-chunk onboarding progress bar (Brilliant-style)
- `e08f6b6` **change** — Courses catalog: tier chips + illustrated finance-course pathway (12 courses, progress), opened from Learn header
- `eeb78bd` **change(TileBuilder)** — direct-manipulation lesson step (tap-to-place tiles into slots, auto-check, green-lock, haptics) + BRILLIANT_REFERENCE.md build spec + pulse halo
- `21e9cd9` **change** — Add pulsing halo on active Learn START node (Duolingo-style animation juice)
- `5d97d87` **change** — Lesson viewer: intro → teach → predict-reveal quiz → interactive reveal → celebration (confetti, +XP); wired from Learn START node
- `169dff9` **change** — Trade + You tabs: paper-trading dashboard (portfolio/positions/watchlist) and profile (stats grid, certificates, settings) + bell/settings/search icons
- `deee7bf` **change** — Learn tab: Duolingo-style serpentine pathway trail (done/current/locked nodes, dashed connector, START + Atlas)
- `3cd1883` **change** — Redesign to Brilliant bar: real Atlas (exact SVG geometry), ambient starfield, contrast fix, Digest tab
- `c36c6f5` **change** — Foundation + first slice: Euphoria tokens, fonts, EUPHORIA_ICONS system, motion kit, UI kit, 6-tab shell, onboarding + home

## 2026-07-20 · 1 commit

- `479d39d` **change** — Initial commit

