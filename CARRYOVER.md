CORRECTED CARRYOVER — supersedes the previous file, which was WRONG about Atlas.

WHAT THE OLD CARRYOVER GOT WRONG. It claimed "It is vector now... a real head carrying the
face, with the pinwheel as a slowly-turning chest emblem." That redesign was reverted in
e2302ed ("restore the original character") and f69d0ed ("drop the pear body", co-founder's
call). It also listed landing squash/stretch and emblem follow-through as STILL OPEN; both
had already shipped. Read atlas.tsx before trusting any doc, including this one.

STATE. branch main, nothing pushed. Modified: src/components/atlas.tsx, src/app/lesson.tsx.
New untracked: src/components/atlas-mark.tsx. tsc clean.

THE MARK IS NOW VECTOR (this session, for real).
- src/components/atlas-mark.tsx draws the pinwheel as FOUR INDEPENDENT RINGS. atlas-logo.png
  is no longer rendered; the require is gone. Verified on device.
- Geometry was MEASURED off the PNG, not eyeballed: centre (126,125.5) in a 247x243 asset,
  orbit 54.25, annulus r 20.25..56.75, tilt 82.5 + k*90. Fitted by parameter sweep against the
  PNG's own alpha mask to IoU 0.951. Design-space constants (viewBox 100x104) are in the file.
- TWO THINGS THAT SURPRISED ME AND WILL SURPRISE YOU:
  (a) The fit was against a mask that INCLUDED the white rim, so r_in/r_out are the artwork's
      full extent. Draw the rim across the whole band and INSET the violet inside it. Drawing
      violet across the full band and adding rim outside made the mark 2*RIM too big and every
      hole 15% too small. That shipped once and had to be fixed on device.
  (b) The mark is WOVEN, not stacked. z-order 3,2,1,0 buys three of the four crossings free;
      the cycle means "ring3 over ring0" cannot be expressed by z-order and needs a ClipPath.
      Clip to ring0's OUTER DISC, not its annulus — where ring3 crosses ring0's hole it is
      already visible, so redrawing there is a no-op. A ring rotating about its own centre has
      an unchanged silhouette, so that clip survives any per-ring ROTATION. Translation or
      scale would break it.
- CONFIRMED WORKING in react-native-svg on device: LinearGradient in objectBoundingBox units
  applied to a STROKE, and ClipPath. Both were real risks; neither bit.
- Colours are the asset's own measured tones. Gradient LIT #DEA5F5 -> DARK #A855EB averages to
  #C37DE7, the PNG's measured median. An earlier pair averaged to #B78BD1 and read visibly pale.

CELEBRATE AMPLITUDE. The hop fired on EVERY onboarding option tap at 12%-of-size with a 13%
squash. User: "hardly noticeable" is what it should be. CELEBRATE_GAIN = 0.32 scales amplitude
only, timings untouched. It is also a PER-CALL PROP (celebrateGain) because a global constant
correctly quieted the per-tap reaction and wrongly flattened lesson.tsx's once-per-lesson
payoff, which now passes celebrateGain={1}. STILL NEVER WATCHED IN MOTION — verify it.

NEW CHARACTER — designed, not built. Concept art on the user's Desktop:
atlas-concepts.png (4 rejected directions) and atlas-v4-character.png (the real one).
Scripts: scratchpad atlas_v4.py. The four first directions all failed the same way — a rounded
body plus two eyes reads as generic. What carries the accepted design: BROWS (largest
expressiveness lever, and the thing the pinwheel could never have), a merged white EYE PATCH
Duo-style over a body that STAYS brand violet, ARMS WITH HANDS so it can point and cheer, a
tapered EGG body rather than a ball, and a tilted HALO RING lifted from the mark — which is
both the identity cue and a second actor that can lag, tilt and wobble against the body.
Legible at 24pt. NOT YET AN RN COMPONENT — that is the next build.

ENVIRONMENT. Dev-client build IS installed on sim F448825D-AF20-48D2-890A-516C12012CA7.
Metro :8082, but the app defaults to :8081 — redirect with
  xcrun simctl openurl $U "exp+euphoria-native://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8082"
idb at ~/.idb-venv/bin/idb. Coords are POINTS (screenshot px / 3).
RIVE MCP: Rive.app listens on 9791 but MCP binds at SESSION START — restart Claude Code or the
tools are unreachable. It has NO EXPORT TOOL regardless; .riv export is a manual click.

THE LESSON WORTH CARRYING. I spent this session perfecting a static mark to IoU 0.951 and never
once watched the app move. The user had to tell me the button animation felt wrong. Verify
MOTION, not just pixels.

## VERIFIED 2026-08-03
- ENTRY FIXED. src/app/index.tsx now reads profile.completedAt and routes returning users to /(tabs)/home. Gated on a new `hasHydrated` flag in src/lib/store.ts because zustand persist rehydrates ASYNC - without the gate the first frame of a cold start reads completedAt null and redirects returning users to /welcome intermittently. `hasHydrated` is deliberately NOT in partialize. Verified on device: 5/5 cold starts land on Home; null completedAt still lands on /welcome.
- LEGAL URLS ARE PLACEHOLDERS. src/app/onboarding.tsx:171 references LEGAL_PLACEHOLDER_HOST. Hard App Store blocker, NOT yet fixed.
- Onboarding has a dev-only ?step=<n> param (src/app/onboarding.tsx:212) but the deep link euphorianative://onboarding?step=N DROPS the param and opens at step 0. Tapping through is currently the only way to reach a later step.
- LEGAL URLS FIXED. src/app/onboarding.tsx now points Terms/Privacy at https://euphoriainv.com/terms and /privacy - the live pages euphoriaweb serves (src/pages/Terms.tsx, Privacy.tsx, routed App.tsx:200-201). Both verified by LOADING them and reading rendered titles.
- DO NOT verify those URLs with curl. euphoriaweb vercel.json rewrites every non-asset path to index.html, so the host returns 200 for routes that do not exist; a deliberately bogus path also returned 200. Read the rendered text instead.
- Placeholder guard is now module-scope over LEGAL_PLACEHOLDER_HOSTS. The old one only fired inside openLegal on tap, ~15 taps into onboarding, which is how the placeholder survived.
- STILL OPEN: legal links are NOT reachable from Settings/You, only the paywall. 3.1.2 is satisfied but reviewers often want them in-app too. Also privacy@euphoria.edu is the contact on both live pages - a .edu domain, possibly wrong (web content, not native).
- YOU PAGE REBUILT around src/lib/league.ts (tier ladder, single source of truth) + src/components/league-crest.tsx (semi-3D, per refs/BRILLIANT_VISUAL_ANALYSIS.md:7-8). Removed three fabrications: the +84 lesson inflation, the hardcoded Rank #3, and the hardcoded name. Tier colours deliberately override the violet-only rule WITH USER APPROVAL and end on brand violet - do not revert as a palette mistake.
- XP IS THE BOTTLENECK. Exactly ONE call site awards XP in the whole app: src/app/lesson.tsx:175 completeLesson(id, 50). Games, Digest reads, daily goal and streaks award nothing. store.ts:153 addXp(n) exists and is never called. The league cannot be climbed until this is fixed.
- CONFIRMED FIRST-HAND: lesson.tsx renders hardcoded demo content. Tapping "Your Brain vs. Your Money" in Behavioral Finance opens "FOUNDATIONS - LESSON 9 - What is a stock?". Every lesson in every course opens the same demo.
- XP NOW HAS FOUR SOURCES (was one). Guide read 25 (markPostRead, idempotent), game round 20 (capped once/day via lastGameDay - games are replayable and farmable otherwise), daily goal crossing 50 (inside completeLesson, crosses once/day), lesson 50. All funnel through applyXp() in store.ts - never write `xp` directly or lifetime and weekly totals drift.
- WEEKLY XP LAYER ADDED. weeklyXp + weekStart, Monday-to-Sunday via weekKey(). Lifetime xp drives the permanent TIER; weeklyXp drives league STANDINGS. weeklyXpNow() zeroes on rollover at read time. league.tsx does NOT consume it yet - that is the next cycle.
- VERIFIED ON DEVICE: reading one Digest guide moved XP 0 to 25 and the You tier bar to "475 XP to Investor". Populated You state now confirmed.
- YOU POLISH: tier name tinted with tier.color; duplicate Level tile replaced with Guides read (readPosts.length); ladder rung 44->47pt because a 9->10pt label bump truncated "Strategist". 7x47=329 of 338 available after padding.
- GOTCHA: Icon (src/components/icon.tsx) takes an UNTYPED string and getIconSvg silently falls back to a generic glyph for unknown names (euphoria-icons.ts:138). A typo renders the wrong icon rather than failing the build. UIcon is typed; Icon is not.
- The floating gear at the top right of every screen is the EXPO DEV CLIENT dev-tools button, not app chrome. It does not ship. Do not try to fix it.
- STILL OPEN ON YOU: weeklyXpNow() is surfaced in zero screens, so the weekly counter is invisible. profile still has no name field. settings/[section].tsx may render the same stub for all four rows (unverified). No legal links in Settings.
- YOU MENU TRIMMED to 5 rows with EXPLICIT routes. Removed Leaderboard (crest is the tap target now) and Compound Growth Lab (route kept, entry point removed). Never derive a route from a display label again - that is what broke Euphoria Pro.
- PAYWALL IS REACHABLE IN PRODUCTION via /onboarding?step=paywall, matched by NAME in onboarding.tsx. Numeric ?step stays dev-only. next() returns back() instead of /auth when profile.completedAt is set.
- CONTRADICTION, NOT YET FIXED: You says "YOUR LEAGUE: Saver" but tapping the crest opens league.tsx which is hardcoded "Diamond League". league.tsx has not adopted src/lib/league.ts yet. This is now user-visible.
- "Maybe later" on the paywall lands on Home, not back on You. It has its own handler separate from next(). Minor.
- NOT LIKE DUOLINGO: Duo keeps Account/Notifications/Preferences behind a GEAR ICON and gives the profile body to identity, stats, achievements and FRIENDS. Ours still reads as a settings list.
- LEAGUE NOW AGREES WITH YOU. league.tsx takes name+crest from tierForXp() in src/lib/league.ts. The "Diamond League" contradiction is gone.
- TWO NUMBERS ON PURPOSE: league header tier = LIFETIME xp (earned and kept); standings rank = weeklyXpNow() (defended and reset). Do not make them agree.
- Mock opponents rescaled 1500-2840 -> 40-520 because they were lifetime-scale and made the weekly board unwinnable. They are FABRICATED placeholders; nothing user-facing may call them real people. Replaced when the backend lands.
- Countdown derived from weekKey() Monday boundary, was the literal "3 days left".
- VERIFIED ON DEVICE: header Saver + matching crest, "6 days left" on a Monday, You at rank 10 with 25 weekly XP.
- IDENTITY EXISTS. profile.name/handle/email captured in auth.tsx (it used to discard the email). Handle derives from name when blank. Home and You read it; no hardcoded name anywhere in src.
- FOLLOW GRAPH, Duolingo-style: following/followers arrays, follow/unfollow idempotent, FRIEND IS DERIVED via relationshipOf() = mutual follow. No request/accept flow exists by design.
- src/lib/people.ts is the ONE fabricated population, shared by league + friends. SEED_FOLLOWERS makes "follows you" reachable. following starts EMPTY on purpose.
- TRAP HIT AND FIXED: useApp((s) => s.friendIds()) returns a fresh array -> unstable zustand snapshot -> "Maximum update depth exceeded". Never select a getter that builds an object/array. A getter returning a NUMBER (friendIds().length in you.tsx) is safe.
- VERIFIED ON DEVICE: name+handle survive force-quit relaunch; Follow back turns Priya into a friend on both the Friends screen and the league Friends tab; league main tab unchanged.
- STILL FABRICATED: every person is invented, auth.tsx signIn() still only flips a boolean. Friend Streak deferred - it needs this graph first.
- ONBOARDING NOW ENDS IN A FIRST ACTION. auth.tsx routes to /start when profile.firstRunDoneAt is null, else Home. Both the CTA and "Maybe later" stamp it, so skipping is permanent.
- FIRST ACTION IS A DIGEST GUIDE, NOT A LESSON, because lesson.tsx renders hardcoded demo content for every lesson in every course. MOVE IT TO A LESSON once the player is real - that is what Duolingo does. Noted in start.tsx.
- pickToday extracted to src/lib/digest-pick.ts; digest.tsx imports it. One source for "which guide is today".
- BUG FOUND IN VERIFICATION AND FIXED: auth enter() wrote name/handle/email as `value || null` unconditionally, wiping a saved identity when an existing user signed back in with blank fields. It now patches only non-empty values.
- USER FEEDBACK OPEN: the You page reads DULL. refs/BRILLIANT_VISUAL_ANALYSIS.md:7 already names the cause - "Brilliant is COLORFUL + ILLUSTRATED, ours was flat/minimal". Every stat tile uses the same violet chip; the crest is the only colour on the page.
- YOU IS NO LONGER DULL, and the fix needed nothing new. EUPHORIA_ICONS were already multicolour and were being buried at 22px inside a uniform theme.primary+"1A" chip; Card already had a `tint` gradient-wash prop that this page never passed. Removed the chip, icons to 34px, per-stat accents from each icon dominant fill (flame #F97316, open-book #BB83F1, crown #FBBF24, post #38BDF8), hero tinted with tier.color.
- RULE KEPT FROM card.tsx: only the hero and stat tiles are tinted. Tinting every card reads as busy, not rich. The settings list stays flat so the hero can be loudest.
- GENERAL LESSON: before adding a library or component for a visual problem here, check what the app already owns. Three separate capabilities (multicolour icons, Card tint, expo-linear-gradient) were installed and unused.
- CREST REWORKED. Narrow tonal range (+0.30/-0.22, was +0.42/-0.40) because a wide value spread desaturates any hue into brown. Added a rim stroke - an unstroked shape has no edge against near-black. Pips now sit on a recessed band so a single pip is not a stray dot.
- LOCKED CRESTS KEEP THEIR HUE, muted toward #15121C rather than a flat #3A3546. The ladder now shows six colours you climb toward instead of one grey shape six times. Held tier must stay the brightest on that row - mute the locked ones further rather than brightening the held one.
- Verified at BOTH sizes (104 hero, 38 ladder). This component is used at very different scales and 104 can look right while 38 is mush.
