# App Store submission runbook

State as of 2026-09-02. Everything below was verified against the LIVE App Store Connect and
Supabase APIs, not inferred from config files.

## Blocked on exactly one thing

**The binary.** Build 23 (uploaded 30 Aug, app version 1.0.0) is attached to App Store version
1.0. It predates six fixes that are already on `main`, including the `MatchingPairs` render crash
— duplicate React keys throwing on every render, blocking a step kind authored **201 times**.
A reviewer following the review notes ("The first lesson is on Home") can reach it. Shipping
build 23 is a Guideline 2.1 rejection for a defect that is already fixed in source.

Holding the build until the home-screen redesign lands, so one build carries everything.

## When the redesign is pushed

```bash
git fetch origin && git rebase origin/main     # pick up the redesign
npm run check                                  # must exit 0

# 1. Re-shoot the home tile, which is the only screenshot the redesign invalidates.
xcodebuild -workspace ios/euphorianative.xcworkspace -scheme euphorianative \
  -configuration Release -sdk iphonesimulator \
  -derivedDataPath /tmp/euphoria-goldie-derived \
  -destination 'generic/platform=iOS Simulator' build
GOLDIE_CONFIG=goldie/goldie.config.ts npx -y goldie@0 capture
GOLDIE_CONFIG=goldie/goldie.config.ts npx -y goldie@0 frame
GOLDIE_CONFIG=goldie/goldie.config.ts npx -y goldie@0 verify

# 2. Re-upload the strip (replaces the set; dry-runs without --apply).
node scripts/asc-upload-screenshots.mjs --apply

# 3. Build the submittable binary.
eas build --platform ios --profile production
```

Then in App Store Connect: attach the new build, **re-add the app version to the review
submission** (see below), and submit.

### The explain tile does not re-capture cleanly

`goldie capture` reinstalls the app on every invocation (the data container UUID changes), which
wipes AsyncStorage. Two first-run gates then stand between the flow and the lesson content:

- `euphoria_atlas_intro_seen` is a STANDALONE AsyncStorage key, not part of the zustand store, so
  seeding the store does not suppress the Atlas coach-mark that scrims the screen;
- a 13.4s Atlas origin cinematic (`ORIGIN_MS` in `atlas-intro.tsx`) runs ahead of the lesson.

`goldie/manual-raw/explain.png` is a real capture of this build taken by hand with the status bar
pinned to 9:41. Copy it over `goldie/out/raw/iphone-6.9/explain.png` after any `capture` run and
before `frame`. The measured Skip (0.852, 0.957) and "Got it" (0.825, 0.779) coordinates are
recorded in `.argent/flows/store-01-explain.yaml` if someone wants to make it deterministic.

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
| Review details | contact complete, demo credentials set, 1782-char notes |
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

Enable leaked-password protection: Supabase dashboard → Authentication → Sign In/Providers →
Email. This is the only one of the 11 Supabase advisor warnings that can be cleared; the other 10
are `search_path` warnings on functions that 11 RLS policies depend on, and changing them breaks
access control.
