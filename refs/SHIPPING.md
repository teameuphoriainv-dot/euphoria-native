# Shipping Euphoria to TestFlight

Written 2026-08-21 after five failed builds. Everything here was verified against Apple's
API or an actual build log, not inferred.

## One command

```bash
./scripts/ship-testflight.sh 86cf89c1-ed5f-441d-9ae4-575aa7433937
```

Builds and submits with no prompts. The issuer id is the only argument; the key id is read
from the filename in `.secrets/`.

## The credential chain

| thing | value | notes |
|---|---|---|
| ASC API key | `NJ4H5Q7248` | Team Key, **App Manager**. `.secrets/AuthKey_NJ4H5Q7248.p8`, gitignored |
| Issuer ID | `86cf89c1-ed5f-441d-9ae4-575aa7433937` | not secret on its own |
| Apple Team | `9SS423KXF5` | RAMYA SMITHA CHILAMANTULA (Individual) |
| ASC app id | `6761808087` | in `eas.json` submit profile |
| EAS account | `s-k-28` | `app.json` hard-codes `owner` |
| Bundle ids | `com.euphoriainv.euphoria`, `.widget` | two targets, two profiles, one shared cert |
| App group | `group.com.euphoriainv.euphoria` | the widget needs it to share data |

App Manager is enough to CREATE bundle ids, certificates and profiles through the API —
verified by doing it, not assumed.

## Root cause of the five failed builds

```
npm error code EUSAGE
npm ci can only install packages when package.json and package-lock.json are in sync.
Missing: typescript@5.9.3 from lock file
```

**The lockfile was never corrupt.** typescript is present at 6.0.3, matching
devDependencies `~6.0.3`. What differed was the RESOLVER: the lock is generated locally by
npm 11 (bundled with node 24), and EAS defaulted to node 22 / npm 10.9, which expects a
nested `typescript@5.9.3` entry npm 11 does not emit. In sync for one resolver, out of sync
for the other.

Fix: `eas.json` pins `"node": "24.14.1"` so EAS uses the resolver the lock was built with.
It also satisfies react-native@0.86.2's engine range (`^24.3.0`).

**If you ever regenerate the lockfile with a different npm, re-check this pin.**

## Reading an EAS build log (the thing that cost hours)

`eas build:view <id> --json` has a `logFiles[0]` pre-signed URL. It is served with
**`content-encoding: br`** (brotli) and it is SHORT-LIVED.

```js
const b = JSON.parse(execSync(`npx eas build:view ${id} --json`).toString());
const t = await (await fetch(b.logFiles[0])).text();   // node's fetch decodes br natively
const recs = t.split('\n').filter(l => l.startsWith('{')).map(JSON.parse);
recs.filter(r => r.phase === 'INSTALL_DEPENDENCIES').forEach(r => console.log(r.msg));
```

`curl` + `gunzip` yields binary garbage and sends you down a rabbit hole. **Check
`Content-Encoding` before guessing at magic bytes.** The log is JSON-lines with `phase` and
`msg` fields; a healthy build walks SPIN_UP_BUILDER -> ... -> INSTALL_DEPENDENCIES ->
PREBUILD -> INSTALL_PODS -> RUN_FASTLANE -> UPLOAD_APPLICATION_ARCHIVE.

## Things that were MISSING and are now created

Discovered by querying the API, not from any error message:

- `com.euphoriainv.euphoria.widget` bundle id did not exist. The widget target would have
  failed every build even with perfect certificates.
- The app group did not exist.
- There was **no DISTRIBUTION certificate at all** — only DEVELOPMENT. EAS's message,
  "Distribution Certificate is not validated for non-interactive builds", reads like a
  validation problem and is actually an absence.
- The App Store Connect API had never been enabled on the account. Requesting access was
  approved INSTANTLY despite the dialog warning that requests are reviewed.

Apple holds 7 builds from April 2026, all expired — so this project had shipped before and
lapsed. That is the likely reason the distribution certificate was gone.

## Ruled out while diagnosing (do not re-investigate)

lockfile sync via clean-clone `npm ci` (**this test is worthless** — it runs the same npm 11
that wrote the lock, so it cannot reproduce the failure), postinstall hooks (none), `.npmrc`
(none), non-registry dependencies (none, 61 all from registry), credentials, archive size,
and the EAS build cache.

## Still open

- The build archive is ~158MB and only ~15MB of that is tracked files. Unexplained.
  `.easignore` excluding `/ios` changed nothing, because `ios/` is gitignored and EAS
  archives via git — that exclusion fixed a non-problem.
- `[store] rehydrate failed ReferenceError: window is not defined` appears during
  EAGER_BUNDLE. Non-fatal, but it means a persisted store silently fails to rehydrate
  during bundling. Worth a look.
- The project lives under `s-k-28`; the owner wants it on `euphoria-team`, which is
  currently empty. Migration needs project re-init, credentials redone (another Apple 2FA)
  and all 7 env vars re-pushed.
