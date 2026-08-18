#!/usr/bin/env bash
# motion-audit.sh — the motion counterpart to capture-screens.sh.
#
# WHY THIS EXISTS: capture-screens.sh answers "what does each route LOOK like". Nothing in this
# repo answered "does each route MOVE". The only motion number we had was a single app-wide 2%
# frames-animating figure, which cannot tell you WHICH screens are dead, so it cannot be used to
# prioritise anything. This produces a per-route baseline and a ranked worklist.
#
# ONE RECORDING PER ROUTE, holding both halves of the question:
#
#   [0.0 .. 1.0]  recorder warm-up, discarded
#   [1.0 .. 3.5]  ENTRY  — the transition on arrival
#   [4.0 .. 9.0]  IDLE   — does anything move once it has settled
#
# A screen that animates on arrival then goes flat (STATIC) is a different defect from one that
# never moves (DEAD) and needs a different fix. Windowing is in scripts/motion_window.py.
#
# TRAPS THIS FILE HONOURS:
#   - recordVideo must be stopped with SIGINT, never SIGTERM. SIGTERM leaves a 0-byte file and
#     leaks the recording session (recover with: killall -9 com.apple.CoreSimulator.CoreSimulatorService).
#   - Every clip is re-encoded to CFR 30fps before measurement. simctl writes VFR, which
#     undercounts still frames and INFLATES the animating ratio (a real reading went 41.1% -> 39.5%).
#   - A route the harness cannot reach is recorded as a TOOLING DEFECT in the output, never
#     silently skipped. "No row" must not be readable as "no motion".
#
# Requires: a booted simulator with the app installed, and Metro running.
#   EUPHORIA_UDID=... ./scripts/motion-audit.sh [outdir]
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$HERE/routes.sh"

BUNDLE="com.euphoriainv.euphoria"
SCHEME="euphorianative"
OUT="${1:-refs/audit/$(date +%Y%m%d)/motion}"
DUR="${DUR:-9}"        # seconds recorded per route
WARM="${WARM:-1}"      # seconds before the deep link fires

udid() {
  if [[ -n "${EUPHORIA_UDID:-}" ]]; then echo "$EUPHORIA_UDID"; return; fi
  xcrun simctl list devices booted -j \
    | python3 -c 'import json,sys; d=json.load(sys.stdin)["devices"]; print(next(x["udid"] for v in d.values() for x in v))'
}

# --- pre-flight -------------------------------------------------------------
# The audit is worthless if it runs against nothing. Fail loudly here rather than
# emit 26 empty rows that look like findings.
UDID="$(udid 2>/dev/null || true)"
[[ -n "$UDID" ]] || { echo "FATAL: no booted simulator. Boot one first." >&2; exit 1; }
xcrun simctl get_app_container "$UDID" "$BUNDLE" >/dev/null 2>&1 \
  || { echo "FATAL: $BUNDLE not installed on $UDID." >&2; exit 1; }
command -v ffmpeg >/dev/null || { echo "FATAL: ffmpeg missing." >&2; exit 1; }
curl -sf -o /dev/null http://localhost:8081/status \
  || echo "WARN: Metro not answering on 8081 — routes may render an error screen." >&2

mkdir -p "$OUT/clips" "$OUT/sheets"
JSONL="$OUT/motion.jsonl"; : > "$JSONL"

echo "motion audit: ${#ROUTES[@]} routes x ${DUR}s -> $OUT"
echo "device: $UDID"

for entry in "${ROUTES[@]}"; do
  name="${entry%%:*}"
  path="${entry#*:}"
  raw="$OUT/clips/$name.raw.mp4"
  cfr="$OUT/clips/$name.mp4"

  xcrun simctl io "$UDID" recordVideo --codec h264 --force "$raw" >/dev/null 2>&1 &
  rec=$!
  sleep "$WARM"

  if ! xcrun simctl openurl "$UDID" "${SCHEME}://${path}" >/dev/null 2>&1; then
    kill -INT "$rec" 2>/dev/null || true; wait "$rec" 2>/dev/null || true
    rm -f "$raw"
    printf '{"clip":"%s","verdict":"UNREACHABLE","note":"openurl failed"}\n' "$name" >> "$JSONL"
    printf "  %-20s UNREACHABLE (openurl)\n" "$name"
    continue
  fi

  sleep "$(( DUR - WARM ))"
  kill -INT "$rec" 2>/dev/null || true
  wait "$rec" 2>/dev/null || true

  if [[ ! -s "$raw" ]]; then
    printf '{"clip":"%s","verdict":"UNREACHABLE","note":"empty recording"}\n' "$name" >> "$JSONL"
    printf "  %-20s UNREACHABLE (0-byte clip)\n" "$name"
    continue
  fi

  # CFR re-encode is mandatory — see header.
  ffmpeg -y -i "$raw" -vf fps=30 -an "$cfr" >/dev/null 2>&1 || {
    printf '{"clip":"%s","verdict":"UNREACHABLE","note":"ffmpeg failed"}\n' "$name" >> "$JSONL"
    printf "  %-20s UNREACHABLE (ffmpeg)\n" "$name"; continue; }
  rm -f "$raw"

  # Contact sheet: 6 frames across the clip, so pose and composition stay inspectable.
  ffmpeg -y -i "$cfr" -vf "fps=1,scale=180:-1,tile=6x1" -frames:v 1 \
    "$OUT/sheets/$name.png" >/dev/null 2>&1 || true

  row="$(python3 "$HERE/motion_window.py" "$cfr" | tail -1)"
  # Re-key the row from the clip filename to the route name they share.
  echo "$row" >> "$JSONL"
  printf "  %-20s %s\n" "$name" \
    "$(echo "$row" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(f"{d.get(\"verdict\",\"?\"):7} idle={d.get(\"idle_pct\",0)}% longest={d.get(\"longest_ms\",0)}ms bursts={d.get(\"bursts\",0)}")' 2>/dev/null || echo "?")"
done

python3 "$HERE/motion_report.py" "$JSONL" "$OUT"
echo "done -> $OUT/MOTION.md and $OUT/RANKED.md"
