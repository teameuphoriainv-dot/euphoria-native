# Deploying — read before any production build

**DEPLOYED 2026-08-10.** Production origin is **`https://euphoria-native.expo.app`**, project
`@s-k-28/euphoria-native` (`8a6dba4a-e52a-4c04-b359-7244670431b1`), and `EXPO_PUBLIC_API_URL` is now
set in both the `preview` and `production` profiles. C98's structural half is closed.

**What remains: the four SERVER-SIDE keys are not set on the deployment**, so every route answers
honestly but uselessly. Verified live:

```
GET /api/market?syms=NVDA  ->  503  {"error":"not_configured"}
```

Set them with `eas env:create` (see step 2) and redeploy. Until then Atlas, market data and options
are reachable but non-functional — which is still strictly better than the pre-deploy state, where
they failed as an unexplained network error.

(It was briefly set to an empty string instead. EAS rejects that outright — *"env.EXPO_PUBLIC_API_URL
is not allowed to be empty"* — so the key is omitted. Unset trips the same guard, so the loud
failure survives and the file validates.)

## What C98 was

`apiBase()` (`src/lib/api.ts`) and `baseUrl()` (`src/lib/atlas-chat.ts`) resolve in this order:

1. `EXPO_PUBLIC_API_URL`
2. `Constants.expoConfig.hostUri` — the attached Metro dev server
3. `''`

In development step 2 always hits, so everything works and nothing looks wrong. In a production or
TestFlight build there is no Metro, `hostUri` is `undefined`, the base becomes `''`, and on native a
relative URL has nothing to resolve against.

**Atlas, market data and options all fail at once, and the failure cannot be reproduced in
development by construction.**

## Why the key is absent rather than a placeholder

A plausible-looking wrong URL fails as a network error, which sends you debugging connectivity. An
absent value trips `apiOriginMissing()` and every call throws `no_api_origin` before the fetch — a
code that names its own cause. Absent is louder than wrong.

## The sequence

0. **Link the project first.** `eas init` binds this app to whichever Expo account is logged in,
   PERMANENTLY and painfully to undo. `eas whoami` before you run it. As of C106 the CLI was
   authenticated as `s-k-28` while the GitHub repos live under `teameuphoriainv-dot` — confirm which
   account should own the production app before creating anything. This is the same class of
   wrong-identifier mistake as C82/C90/C93.

1. **Deploy the API routes.** `app.json` already sets `web.output: "server"`, and the routes exist
   at `src/app/api/{chat,market,options}+api.ts`.

   ```
   npx expo export --platform web
   npx eas deploy --prod
   ```

   That prints the EAS Hosting origin, e.g. `https://euphoria-native.expo.app`.

2. **Set the server-side secrets on the deployment** — these are NOT `EXPO_PUBLIC_` and must never
   be bundled into the client:

   ```
   npx eas env:create --environment production --name GEMINI_API_KEY       --value <...>
   npx eas env:create --environment production --name POLYGON_API_KEY      --value <...>
   npx eas env:create --environment production --name ALPHAVANTAGE_API_KEY --value <...>
   npx eas env:create --environment production --name TRADIER_TOKEN        --value <...>
   ```

3. **Put the origin from step 1 into `eas.json`** under both `preview.env` and `production.env`.

4. **Verify on a real build, never on the simulator.** Install the TestFlight build with no Metro
   running and open Atlas, the Trade tab and an options lesson. If any of them throws
   `no_api_origin`, step 3 did not take.

## Shipping an OTA, which is the step this document used to be missing

Everything above configures a BUILD. An over-the-air update is a second, completely separate way of
producing the bundle that actually runs, and it does **not** read the `env` block in `eas.json`.

```
npm run ota -- --message "what changed"
```

That wraps `eas update --branch production --environment production`. The
`--environment` flag is what loads `EXPO_PUBLIC_API_URL`, and on Expo SDK 55 and above the CLI
requires it. Publishing without it produces a bundle whose `apiBase()` has nothing in it.

**This is how a correctly configured build still lost its market data.** Build 18 carried the origin
in its binary and worked. An OTA published on top of it did not, and an OTA bundle wins over the one
inside the app. Atlas went quiet, the options chain emptied, and the Trade tab fell back to the
static table in `stocks.ts` and drew NVDA at $1,184.00 against a real $208.48, with no logos.
Nothing in the app said a word, because falling back to that table is the designed behaviour when a
price is unavailable.

`src/lib/api.ts` now compiles the origin in as `DEFAULT_API_ORIGIN` so this specific mistake can no
longer take the API offline, and `scripts/api-origin-pin.mjs` fails `npm run check` if that constant
and `eas.json` ever disagree. Use `npm run ota` anyway. The constant is a floor, not a licence to
publish without the environment, and every non-public variable still comes from `--environment`.

## Other build facts

- Bundle id `com.euphoriainv.euphoria` · team `9SS423KXF5` · ASC app `6761808087`
- `android.package` is still `com.euphoria.native` on purpose — Google Play is a separate listing
  and nobody has verified whether one exists
- A simulator build proves NOTHING about entitlements (C89): it is ad-hoc signed with an empty
  entitlements dict, so `applesignin` only becomes checkable on a device or archive build
