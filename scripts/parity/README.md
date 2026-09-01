# 300-lesson web/native parity evidence run

This harness coordinates the long parity run without converting missing evidence into a pass. It
uses the app's real curriculum loader and screen expansion path, and refuses to initialize unless
the corpus is exactly 12 courses, 300 lessons, 4,050 authored steps and 4,050 rendered screens
(plus 1,770 mastery-challenge screens, for 5,820 total happy-path screens).

## Four-step loop

1. Build the immutable plan and 300 resumable checkpoints:

   ```sh
   python3 scripts/parity/run.py init
   ```

2. Record complete native lessons. Every route and title is checked before the recorder is
   accepted; the existing answer solver drives the lesson, repeated no-op actions become a stall,
   and every lesson writes its checkpoint immediately:

   ```sh
   python3 scripts/parity/run.py native --limit 1
   python3 scripts/parity/run.py native                 # resumes accepted lessons
   ```

3. Record the same lesson in the signed-in **live Chrome session**, then ingest the video and its
   sidecar. Chrome automation is intentionally outside this process because direct production
   `/dev/lesson` routes return 404 and extension control can disconnect. The boundary keeps that
   tooling failure visible instead of substituting a local render.

   ```sh
   python3 scripts/parity/run.py next --lane web-live
   python3 scripts/parity/run.py ingest-web \
     --lesson investing-fundamentals--01 \
     --video /path/from/chrome/investing-fundamentals--01.mp4 \
     --metadata /path/from/chrome/investing-fundamentals--01.json
   ```

   A live sidecar must contain:

   ```json
   {
     "source": "live-chrome",
     "captureMethod": "chrome-live-session",
     "lessonId": "investing-fundamentals--01",
     "courseId": "investing-fundamentals",
     "lessonNumber": 1,
     "title": "THE EXACT PLANNED TITLE",
     "route": "https://euphoriainv.com/THE/REAL/ROUTE",
     "routeVerified": true,
     "titleVerified": true,
     "completionVerified": true,
     "screensObserved": 20,
     "interactionCoverage": {
       "grade": "operator-observed",
       "observedKinds": ["single_choice", "tap_reveal"]
     },
     "motionCoverage": {
       "adjudication": "operator-observed",
       "notes": "Atlas tap response and chart entrance observed"
     }
   }
   ```

   A local checkout of the canonical web commit may also be recorded, but it must use
   `source: "local-canonical-web"` and provide `canonicalCommit`. That lane is reported separately
   and never satisfies live-web coverage.

4. Compare the two accepted recordings component by component and ingest the adjudication. A
   `match` verdict is rejected unless every numbered rendered screen is covered with matching
   step/renderer identity and timestamps from both recordings, and every expected motion plus
   authored interaction family is checked. A missing animation or control should be recorded
   as `native_missing` or `behavior_diff`, fixed in app code, and both recordings repeated.

   ```json
   {
     "lessonId": "investing-fundamentals--01",
     "verdict": "behavior_diff",
     "screenChecks": [
       {"screenIndex": 1, "stepType": "hookOpener", "renderedKind": "prose", "verdict": "match", "webTime": 0.8, "nativeTime": 0.7},
       {"screenIndex": 2, "stepType": "microCheck", "renderedKind": "choice", "verdict": "behavior_diff", "webTime": 18.1, "nativeTime": 17.5}
     ],
     "componentChecks": [
       {"component": "prose", "verdict": "match", "webTime": 3.2, "nativeTime": 2.8},
       {"component": "choice", "verdict": "behavior_diff", "webTime": 18.1, "nativeTime": 17.5}
     ],
     "motionChecks": [{"type": "atlas_tap", "verdict": "native_missing"}],
     "interactionChecks": [{"type": "single_choice", "verdict": "match"}],
     "notes": "Native Atlas did not react to tap."
   }
   ```

   ```sh
   python3 scripts/parity/run.py ingest-audit \
     --lesson investing-fundamentals--01 --audit /path/to/adjudication.json
   ```

`artifacts/lesson-parity/manifest.json` is the machine-readable result. `REPORT.md` is the short
coverage summary. Per-lesson truth lives in `checkpoints/`; accepted work is skipped on resume.
Each checkpoint is tied to a lesson-content digest, so a changed lesson invalidates its old
recordings/audit instead of resuming stale evidence. Recordings are local artifacts and are
intentionally not committed.

## Self-tests

```sh
node --import ./scripts/ts-resolve-hooks.mjs scripts/parity/build-plan.mjs --selftest
python3 scripts/parity/run.py selftest
```

The tests prove a 4,178-screen plan goes red, live/local web evidence cannot be conflated, and an
atomic per-lesson checkpoint can be resumed.
