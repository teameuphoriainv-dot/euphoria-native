# App Store submission runbook

State as of 2026-09-02. Everything below was verified against the LIVE App Store Connect and
Supabase APIs, not inferred from config files.

## Blocked on exactly one thing

**The binary.** The version still has build 23 (uploaded 30 Aug, app version 1.0.0) attached. It
predates every fix on `main`, including the `MatchingPairs` render crash — duplicate React keys
throwing on every render, blocking a step kind authored **201 times**. A reviewer following the
review notes ("The first lesson is on Home") can reach it. Shipping build 23 is a Guideline 2.1
rejection for a defect already fixed in source.

The Home redesign (dc95c18) and the account gate (dba0874) have both landed and are captured in
the current screenshots. What remains:

```bash
npm run check                                   # must exit 0
eas build --platform ios --profile production   # produces the submittable binary
```

Then in App Store Connect: attach the new build, **re-add the app version to the review
submission** (see below), and submit.

### The deployed API is a separate blocker

`scripts/../src/app/api/market+api.ts` filters non-English and duplicate newswire articles, but
the DEPLOYED api at `euphoria-native.expo.app` still serves them: measured 2026-09-02, 8 of 12
articles on the Trade tab were one GlobeNewswire release in th/ms/ja/id/ko and two Chinese
variants. The app calls the deployed endpoint, so **this reaches users regardless of which binary
ships** and is only fixed by redeploying the api.

### Tiles are captured by hand, not by `goldie capture`

`goldie capture` reinstalls the app on every invocation (the data container UUID changes), which
wipes AsyncStorage. Since dba0874 that is fatal to the whole strip, not just one tile:

- `(tabs)/_layout.tsx` redirects to `/auth` unless `hasAccount(profile)` is true, and that is
  `authProvider ?? email` -- a name does NOT satisfy it. A reinstalled app therefore lands on
  onboarding, so //home, //learn, //courses and //stock all capture the wrong screen.
- `euphoria_atlas_intro_seen` is a STANDALONE AsyncStorage key, not part of the zustand store, so
  seeding the store never suppresses the Atlas coach-mark.
- A 13.4s Atlas origin cinematic (`ORIGIN_MS` in `atlas-intro.tsx`) runs ahead of the first lesson.

`goldie/manual-raw/` holds a real capture of each tile from the shipped build, taken with the
status bar pinned to 9:41. To refresh after a build:

```bash
xcrun simctl uninstall <dev> com.euphoriainv.euphoria
xcrun simctl install   <dev> /tmp/euphoria-goldie-derived/.../euphorianative.app
xcrun simctl launch    <dev> com.euphoriainv.euphoria     # once, to create the store file
# then in the container's RCTAsyncLocalStorage_V1:
#   manifest.json           euphoria_atlas_intro_seen = "1"
#   <state file> profile    completedAt, email, authProvider   <- the account gate
xcrun simctl status_bar <dev> override --time "9:41" --batteryState charged --batteryLevel 100 \
  --cellularBars 4 --wifiBars 3
# deep-link each route, screenshot, copy into goldie/out/raw/iphone-6.9/ AND goldie/manual-raw/
GOLDIE_CONFIG=goldie/goldie.config.ts npx -y goldie@0 frame
GOLDIE_CONFIG=goldie/goldie.config.ts npx -y goldie@0 verify
node scripts/asc-upload-screenshots.mjs --apply
```

Routes: `//courses` intro, `//lesson?course=investing-fundamentals&num=1` + tap the CTA at
y=0.702 for explain, `//learn` path, `//home` home, `//stock/AAPL` paper-trade, `//chat` atlas.

## Review submission needs the app version re-added

Screenshots cannot be replaced while the version sits in a review submission — Apple returns
`409 STATE_ERROR Can't Delete Screenshot while Ready For Review`. To upload the new strip, the
appStoreVersion item was removed from review submission `316422e8`:

    DELETE /v1/reviewSubmissionItems/{appStoreVersion item}   -> 204

The submission still exists and still holds its subscription items; only the app version came
out, which moved the version to `DEVELOPER_REJECTED` (editable). **Re-add it when submitting.**
Nothing had been delivered to Apple — the submission's `submittedDate` was null.

## Verified against the live APIs

| Item | Evidence |
|---|---|
| Demo account | `applereview@gmail.com` signs in **HTTP 200**, token issued, email confirmed |
| Account deletion (5.1.1v) | `delete_own_account` returns **401 permission denied** to anon (exists, correctly revoked); a control name returns 404 PGRST202 |
| Restore purchases (3.1.1) | paywall (`onboarding.tsx`) and Profile > Account (`settings/[section].tsx:202`) |
| Subscription disclosure (3.1.2) | title, duration, $79.99/yr + $9.99/mo, trial terms, Terms + Privacy + Restore all on the paywall |
| Paywall dismissible | "Maybe later" |
| Sign in with Apple (4.8) | enabled alongside Google and email |
| Screenshots | 6 images in `APP_IPHONE_67`; the stale 5-image 6.5" set was deleted |
| Subscriptions | both `READY_TO_SUBMIT`, review notes and review screenshots COMPLETE |
| Review details | contact complete, demo credentials set, 2439-char notes rewritten 2026-09-02 to match the account-before-paywall flow |
| Metadata | Name 25/30, Subtitle 30/30, Keywords 97/100, Promo 164/170, Description 2917/4000 |
| Age / legal | 12+, privacy policy URL, copyright INFISTACK TECHNOLOGY LLC |
| Apple credentials | `.p8` valid PKCS#8 and gitignored, key `NJ4H5Q7248`, team `9SS423KXF5` |
| Bundle id | `com.euphoriainv.euphoria`, matches ASC |
| EAS production env | all five `EXPO_PUBLIC_*` registered server-side, so nothing depends on the gitignored `.env.local` |

Version strings: builds carry `1.0.0` while the App Store version reads `1.0`. Not a problem —
build 23 (1.0.0) is already attached to version 1.0, so Apple normalizes the trailing zero.

## There is no `APP_IPHONE_69`

The API rejects it and lists the valid types. Apple routes 6.9" screenshots (1320x2868) through
`APP_IPHONE_67`, the largest iPhone slot exposed. `scripts/asc-upload-screenshots.mjs` uses it.

## Owner action, not a code change

Leaked-password protection CANNOT currently be enabled: the project is on the Supabase Free plan
and the API refuses the write — "Configuring leaked password protection via HaveIBeenPwned.org is
available on Pro Plans and up." It is a Supabase advisor warning, not an App Store requirement,
appears nowhere in the review guidelines, and cannot cause a rejection. The other 10 advisor
warnings are `search_path` warnings on functions that 11 RLS policies depend on; changing those
breaks access control.
