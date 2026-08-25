# Stock prices on the Trade tab — what was wrong and how it was proved

Reported: the Trade tab showed fabricated prices and no logos, having previously
shown real delayed data.

## The finding

Nothing was wrong with the price code. `getMarks()` is the single entry point,
`/api/market?action=marks` is healthy, and the numbers on screen now match it to
the cent. The failure was in how the bundle reaches the device.

`EXPO_PUBLIC_API_URL` is inlined at bundle time, and this app has two ways of
producing a bundle. `eas build` reads the `env` block in `eas.json` and always
had it. `eas update` does not read that block at all, and on Expo SDK 55 and
above it requires `--environment` to load anything. An OTA published without
that flag has no origin, `apiBase()` returns the empty string, every market call
throws `no_api_origin` before its fetch, and `priceOf` falls back to the static
table in `stocks.ts`. That table is where $1,184.00 NVDA comes from.

An OTA bundle overrides the one inside the app, so a correctly configured build
still lost its market data. Atlas and the options chain died at the same instant
for the same reason.

| # | Task | State |
|---|------|-------|
| 1 | Read the price path end to end | 🟢 one entry point, `getMarks()` |
| 2 | Find why the quote never reached the screen | 🟢 `apiBase()` was `''`, so every call threw before fetching |
| 3 | Fix the root cause, not the seeded number | 🟢 `DEFAULT_API_ORIGIN` compiled into `api.ts` |
| 4 | Verify in the simulator | 🟢 NVDA $208.48 matches the API exactly, all logos render |
| 5 | Prove it in a production bundle, not just Metro | 🟢 exported with the env var absent, origin still in the `.hbc` |
| 6 | check / tsc / eslint clean, then commit | 🟢 42 steps green |
| 7 | Re-ship the OTA with `npm run ota` | ⚪ awaiting go-ahead |

⚪ todo · 🟡 in progress · 🟢 done · 🔴 blocked

## What stops it recurring

- `src/lib/api.ts` compiles the origin in, so the env var going missing can no
  longer take the API offline.
- `scripts/api-origin-pin.mjs` fails `npm run check` if that constant and
  `eas.json` disagree. Break-tested against drift, a trailing slash, cleartext
  http, and a reverted `apiBase()`.
- `npm run ota` always passes `--environment production`.
- `refs/DEPLOY.md` documents the OTA path, which it previously did not mention.

## Checked and NOT a defect

`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are referenced in
`src/lib/auth.ts` but set in no environment. That is deliberate: `AUTH_ENABLED`
is false without them and sign-in stays switched off.
