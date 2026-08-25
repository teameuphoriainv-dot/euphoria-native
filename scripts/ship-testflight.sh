#!/usr/bin/env bash
# Wire an App Store Connect API key into EAS and ship to TestFlight, non-interactively.
#
# WHY THIS EXISTS: `eas build --platform ios` cannot create a distribution certificate or
# provisioning profiles without Apple auth, which means an interactive login and 2FA. An App Store
# Connect API key is Apple's supported way to do that from CI. With one registered, every future
# build and submit runs with no login at all.
#
# The key ID is read from the FILENAME (Apple names them AuthKey_<KEYID>.p8), so the only thing
# that has to be supplied by hand is the issuer id.
#
# Usage:  scripts/ship-testflight.sh <ISSUER_ID> [--build-only]
set -euo pipefail
cd "$(dirname "$0")/.."

ISSUER="${1:-}"
if [ -z "$ISSUER" ]; then
  echo "usage: scripts/ship-testflight.sh <ISSUER_ID> [--build-only]"
  echo "  issuer id is the UUID at the top of ASC > Users and Access > Integrations"
  exit 1
fi

KEY=$(ls .secrets/AuthKey_*.p8 2>/dev/null | head -1 || true)
if [ -z "$KEY" ]; then
  echo "no .secrets/AuthKey_*.p8 found."
  echo "  ASC > Users and Access > Integrations > App Store Connect API > Team Keys > +"
  echo "  role must be App Manager or Admin, then move the download into .secrets/"
  exit 1
fi

KEY_ID=$(basename "$KEY" .p8 | sed 's/^AuthKey_//')
echo "  key file : $KEY"
echo "  key id   : $KEY_ID   (read from the filename)"
echo "  issuer   : $ISSUER"

# EAS reads these for credential creation during the build.
export EXPO_ASC_API_KEY_PATH="$PWD/$KEY"
export EXPO_ASC_KEY_ID="$KEY_ID"
export EXPO_ASC_ISSUER_ID="$ISSUER"
# Some eas-cli paths look for the App Store Connect variants; set both spellings.
export EXPO_APP_STORE_CONNECT_API_KEY_PATH="$PWD/$KEY"
export EXPO_APP_STORE_CONNECT_KEY_ID="$KEY_ID"
export EXPO_APP_STORE_CONNECT_ISSUER_ID="$ISSUER"

echo
echo "=== BUILD ==="
npx eas build --platform ios --profile production --non-interactive --wait

if [ "${2:-}" = "--build-only" ]; then
  echo "build-only requested; stopping before submit."
  exit 0
fi

echo
echo "=== SUBMIT ==="
npx eas submit --platform ios --profile production --latest --non-interactive

echo
echo "=== DISTRIBUTE ==="
# THE STEP THIS SCRIPT USED TO BE MISSING. `eas submit` stops at "uploaded". Apple then parks the
# build at READY_FOR_BETA_TESTING, which is uploaded-but-INVISIBLE: no tester sees it until it is
# attached to a beta group. Somebody had been doing that by hand in the ASC web UI and stopped.
#
# MEASURED 2026-08-25: builds 17 and 18 were never uploaded at all, and build 16 was uploaded and
# attached to nothing. The owner reported "the latest one I can see is only build 15" -- build 15
# was simply the last one anyone remembered to attach.
#
# Apple needs a few minutes of processing before a build can be attached, so this retries rather
# than failing on the first miss.
for attempt in $(seq 1 10); do
  if node scripts/testflight-distribute.mjs; then
    echo
    echo "Shipped and distributed to the internal group."
    echo "For the external Cofounders group: node scripts/testflight-distribute.mjs --external"
    exit 0
  fi
  echo "  not processed by Apple yet; retrying in 60s (attempt $attempt/10)"
  sleep 60
done

echo
echo "UPLOADED BUT NOT DISTRIBUTED. Apple has the build; no tester can see it."
echo "Run this once processing finishes:  node scripts/testflight-distribute.mjs"
exit 1
