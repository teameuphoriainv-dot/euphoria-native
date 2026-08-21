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
echo "Submitted. Apple processing usually takes 5-15 minutes before it appears in TestFlight."
