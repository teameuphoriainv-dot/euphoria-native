#!/usr/bin/env bash
# Seed the persisted trial clock, then relaunch so zustand re-hydrates from it.
#
# WHY A SCRIPT AND NOT AN IN-APP CONTROL: §9.7 needs all five trial states driven on device and
# their store JSON reported. A previous session added a `devtrial` route for this and had to delete
# it again — a debug screen a user could reach is a dead control (§0.5). This lives outside the
# bundle, so it cannot ship.
#
#   ./scripts/seed-trial.sh <activeDays-count> <true|false isPro>
#   ./scripts/seed-trial.sh 4 false     # expired
#   ./scripts/seed-trial.sh 0 true      # pro
#
# Writes seed-N day keys. `tier()` only reads activeDays.length, so synthetic keys are sufficient
# and that is exactly what the __DEV__ assertions in entitlement.ts already use.
set -euo pipefail

N="${1:?activeDays count required}"
PRO="${2:-false}"
UDID="${EUPHORIA_UDID:-$(xcrun simctl list devices | awk '/\(Booted\)/{gsub(/[()]/,"");print $(NF-1);exit}')}"
BUNDLE=com.euphoriainv.euphoria

C="$(xcrun simctl get_app_container "$UDID" "$BUNDLE" data)"
D="$C/Library/Application Support/$BUNDLE/RCTAsyncLocalStorage_V1"
F="$D/$(printf 'euphoria-app-state' | md5 -q)"
[[ -f "$F" ]] || { echo "no spilled store at $F — is the app installed and run once?" >&2; exit 1; }

python3 - "$F" "$N" "$PRO" <<'PY'
import json, sys
path, n, pro = sys.argv[1], int(sys.argv[2]), sys.argv[3] == 'true'
d = json.load(open(path))
d['state']['activeDays'] = [f'seed-{i}' for i in range(n)]
d['state']['isPro'] = pro
json.dump(d, open(path, 'w'), separators=(',', ':'))
print(f'seeded activeDays={n} isPro={pro}')
PY

xcrun simctl terminate "$UDID" "$BUNDLE" >/dev/null 2>&1 || true
sleep 1
xcrun simctl launch "$UDID" "$BUNDLE" >/dev/null
sleep 4
echo "relaunched — verifying what the app actually re-hydrated:"
"$(dirname "$0")/sim.sh" state '{isPro, activeDays}'
