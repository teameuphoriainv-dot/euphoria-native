#!/usr/bin/env bash
# Run fetch-logos.mjs repeatedly until nothing is left deferred.
#
# Polygon's free tier is 5 requests/minute, so a tranche of any size WILL be interrupted. The
# fetcher is resumable by design -- it skips what is already on disk and never records a
# rate-limited symbol as art-less -- so the correct way to finish a long list is simply to keep
# calling it. This does that, with a cooldown between passes and a hard pass cap so a permanent
# upstream failure cannot loop forever.
#
# Usage: scripts/fetch-logos-all.sh SYM SYM SYM ...
set -uo pipefail
cd "$(dirname "$0")/.."
MAX_PASSES=${MAX_PASSES:-40}
COOLDOWN=${COOLDOWN:-45}
for pass in $(seq 1 "$MAX_PASSES"); do
  echo "=== pass $pass/$MAX_PASSES ==="
  out=$(node scripts/fetch-logos.mjs --via-proxy "$@" 2>&1)
  echo "$out" | tail -4
  if ! grep -q "re-run to continue" <<<"$out"; then
    echo "=== complete on pass $pass ==="
    exit 0
  fi
  sleep "$COOLDOWN"
done
echo "=== stopped after $MAX_PASSES passes; re-run to continue ==="
